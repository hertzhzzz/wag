import { computeUrlDispositionReportDigest } from "../urlDispositions";

import {
  canonicalizeSourceRetirementArtifact,
  compareCodePoints,
  computeSourceRetirementArtifactDigest,
  computeSourceRetirementInventoryDigest,
  computeSourceRetirementReportDigest,
  deepFreeze,
  isSourceRetirementArtifactVersion,
  isSourceRetirementDigest,
  sortCodePoints,
} from "./canonical";
import {
  SOURCE_RETIREMENT_ARTIFACT_VERSION,
  SOURCE_RETIREMENT_SCHEMA_VERSION,
  type SourceRetirementApproval,
  type SourceRetirementApprovalKind,
  type SourceRetirementApprovedDecision,
  type SourceRetirementArticleIdentity,
  type SourceRetirementArticleParity,
  type SourceRetirementDigest,
  type SourceRetirementEvidence,
  type SourceRetirementGraphArticleParity,
  type SourceRetirementGraphParity,
  type SourceRetirementInput,
  type SourceRetirementParity,
  type SourceRetirementParityStatus,
  type SourceRetirementPreflightIssue,
  type SourceRetirementPreflightIssueCode,
  type SourceRetirementPreflightReport,
  type SourceRetirementSourceInventory,
  sourceRetirementInputContractSchema,
} from "./types";

const PRODUCTION_EXECUTION = {
  supported: false,
  allowed: false,
  reason:
    "Source retirement is a pure contract preflight; production deletion, rename, redirect, and deployment execution are unsupported.",
} as const;

const RETIREMENT_EXECUTION = {
  supported: false,
  allowed: false,
  reason:
    "Ticket 25 only builds an auditable preview; legacy source retirement must be performed by a separately approved release process.",
} as const;

type AnyRecord = Record<string, unknown>;
type MutableIssue = SourceRetirementPreflightIssue;
type Path = readonly (string | number)[];

interface ValidationContext {
  readonly raw: unknown;
  readonly input: AnyRecord | null;
  readonly asOf: string | null;
  readonly artifactDigest: SourceRetirementDigest | null;
  readonly computedArtifactDigest: SourceRetirementDigest | null;
  readonly issues: MutableIssue[];
  readonly issueKeys: Set<string>;
  readonly intentionalDifferences: { count: number };
  readonly unknownSlots: { count: number };
  readonly duplicateIdentities: { count: number };
}

const PARITY_FIELDS = [
  "identity",
  "contentDigest",
  "route",
  "canonical",
  "sitemap",
  "index",
  "navigation",
  "recommendations",
  "diagnostics",
] as const;

type ArticleParityField = (typeof PARITY_FIELDS)[number];

function isRecord(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function pathString(path: Path): string {
  return path.length === 0 ? "(root)" : path.map(String).join(".");
}

function issueKey(
  code: string,
  path: string,
  articleId: string | null,
): string {
  return `${code}\u0000${path}\u0000${articleId ?? ""}`;
}

function addIssue(
  context: ValidationContext,
  code: SourceRetirementPreflightIssueCode,
  path: Path | string,
  message: string,
  articleId: string | null = null,
): void {
  const normalizedPath = typeof path === "string" ? path : pathString(path);
  const key = issueKey(code, normalizedPath, articleId);
  if (context.issueKeys.has(key)) return;
  context.issueKeys.add(key);
  context.issues.push({ code, path: normalizedPath, message, articleId });
}

function sortIssues(issues: readonly MutableIssue[]): MutableIssue[] {
  return [...issues].sort(
    (left, right) =>
      compareCodePoints(left.path, right.path) ||
      compareCodePoints(left.code, right.code) ||
      compareCodePoints(left.articleId ?? "", right.articleId ?? "") ||
      compareCodePoints(left.message, right.message),
  );
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  const days = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return days[month - 1] ?? 0;
}

function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

function isValidUtcTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.test(value)
  ) {
    return false;
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const hour = Number(value.slice(11, 13));
  const minute = Number(value.slice(14, 16));
  const second = Number(value.slice(17, 19));
  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59 &&
    second >= 0 &&
    second <= 59
  );
}

function timestampDate(value: string): string {
  return value.slice(0, 10);
}

function validMachineId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(value)
  );
}

function validRoute(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value === "/") return true;
  return (
    value.startsWith("/") &&
    !value.endsWith("/") &&
    !value.includes("//") &&
    !value.includes("?") &&
    !value.includes("#") &&
    value === value.toLowerCase() &&
    !/\s/.test(value)
  );
}

function validStringArray(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.length > 0)
  );
}

function addSchemaIssue(
  context: ValidationContext,
  path: Path | string,
  message: string,
  articleId: string | null = null,
): void {
  addIssue(context, "input_schema_invalid", path, message, articleId);
}

function validateEvidence(
  context: ValidationContext,
  value: unknown,
  path: Path,
  required = true,
  articleId: string | null = null,
): value is SourceRetirementEvidence {
  if (value === null || value === undefined) {
    if (required) {
      addIssue(
        context,
        "invalid_evidence",
        path,
        "Evidence is required.",
        articleId,
      );
    }
    return false;
  }
  if (!isRecord(value)) {
    addIssue(
      context,
      "invalid_evidence",
      path,
      "Evidence must be an object.",
      articleId,
    );
    return false;
  }

  const id = stringValue(value.id);
  const origin = value.origin;
  const isPublic = value.public;
  const source = stringValue(value.source);
  const capturedAt = value.capturedAt;
  const digest = value.digest;
  let valid = true;

  if (!id || !validMachineId(id)) {
    addIssue(
      context,
      "invalid_evidence",
      [...path, "id"],
      "Evidence id is invalid.",
      articleId,
    );
    valid = false;
  }
  if (origin !== "production" && origin !== "fixture") {
    addIssue(
      context,
      "invalid_evidence",
      [...path, "origin"],
      "Evidence origin is invalid.",
      articleId,
    );
    valid = false;
  }
  if (typeof isPublic !== "boolean") {
    addIssue(
      context,
      "invalid_evidence",
      [...path, "public"],
      "Evidence public flag is required.",
      articleId,
    );
    valid = false;
  }
  if (!source) {
    addIssue(
      context,
      "invalid_evidence",
      [...path, "source"],
      "Evidence source is required.",
      articleId,
    );
    valid = false;
  }
  if (!isValidUtcTimestamp(capturedAt)) {
    addIssue(
      context,
      "invalid_evidence",
      [...path, "capturedAt"],
      "Evidence timestamp must be absolute UTC with milliseconds.",
      articleId,
    );
    valid = false;
  }
  if (!isSourceRetirementDigest(digest)) {
    addIssue(
      context,
      "invalid_evidence",
      [...path, "digest"],
      "Evidence digest must be a lowercase sha256 digest.",
      articleId,
    );
    valid = false;
  }

  if (origin === "fixture" && isPublic === true) {
    addIssue(
      context,
      "fixture_evidence_forbidden",
      [...path, "public"],
      "Fixture evidence must be explicitly non-public.",
      articleId,
    );
  }
  if (origin === "production" && isPublic !== true) {
    addIssue(
      context,
      "invalid_evidence",
      [...path, "public"],
      "Production evidence must be public evidence.",
      articleId,
    );
  }
  if (
    origin === "production" &&
    isValidUtcTimestamp(capturedAt) &&
    context.asOf !== null &&
    timestampDate(capturedAt) > context.asOf
  ) {
    addIssue(
      context,
      "production_evidence_future_dated",
      [...path, "capturedAt"],
      "Production evidence is dated after the explicit asOf date.",
      articleId,
    );
  }

  return valid;
}

function validateRequiredEvidence(
  context: ValidationContext,
  value: AnyRecord,
  path: Path,
  articleId: string | null = null,
): void {
  validateEvidence(
    context,
    value.evidence,
    [...path, "evidence"],
    true,
    articleId,
  );
}

function uniqueIds(values: readonly unknown[]): string[] {
  return sortCodePoints([
    ...new Set(
      values.filter((value): value is string => typeof value === "string"),
    ),
  ]);
}

function indexById<T>(
  values: readonly T[],
  getId: (value: T) => string | null,
): { map: Map<string, T[]>; duplicateIds: string[] } {
  const map = new Map<string, T[]>();
  for (const value of values) {
    const id = getId(value);
    if (!id) continue;
    const existing = map.get(id) ?? [];
    existing.push(value);
    map.set(id, existing);
  }
  const duplicateIds = sortCodePoints(
    [...map.entries()]
      .filter(([, items]) => items.length > 1)
      .map(([id]) => id),
  );
  return { map, duplicateIds };
}

function equivalentValues(left: unknown, right: unknown): boolean {
  try {
    return (
      canonicalizeSourceRetirementArtifact({ value: left }) ===
      canonicalizeSourceRetirementArtifact({ value: right })
    );
  } catch {
    return false;
  }
}

function decisionFor(
  context: ValidationContext,
  decisionId: string | null,
  path: Path,
  artifactDigest: SourceRetirementDigest | null,
  articleId: string | null,
): boolean {
  if (!decisionId) {
    addIssue(
      context,
      "intentional_difference_unapproved",
      path,
      "An intentional parity difference requires an approved decision bound to this artifact.",
      articleId,
    );
    return false;
  }
  const decisions = getArray(context.input?.approvedDecisions);
  const matches = decisions.filter(
    (decision): decision is AnyRecord =>
      isRecord(decision) && decision.id === decisionId,
  );
  if (matches.length === 0) {
    addIssue(
      context,
      "decision_missing",
      [...path, "decisionId"],
      `Approved decision ${decisionId} is missing.`,
      articleId,
    );
    return false;
  }
  let approved = false;
  for (const decision of matches) {
    if (!isSourceRetirementDigest(decision.artifactDigest)) {
      addIssue(
        context,
        "decision_artifact_mismatch",
        [...path, "decisionId"],
        `Approved decision ${decisionId} has no valid artifact digest.`,
        articleId,
      );
      continue;
    }
    if (artifactDigest === null || decision.artifactDigest !== artifactDigest) {
      addIssue(
        context,
        "decision_artifact_mismatch",
        [...path, "decisionId"],
        `Approved decision ${decisionId} is bound to a different artifact.`,
        articleId,
      );
      continue;
    }
    validateEvidence(
      context,
      decision.evidence,
      [...path, "decisionEvidence"],
      true,
      articleId,
    );
    approved = true;
  }
  return approved;
}

function parityMismatchCode(field: string): SourceRetirementPreflightIssueCode {
  return `${field}_parity_mismatch` as SourceRetirementPreflightIssueCode;
}

function parityUnknownCode(field: string): SourceRetirementPreflightIssueCode {
  return `${field}_parity_unknown` as SourceRetirementPreflightIssueCode;
}

function validateParity<T>(
  context: ValidationContext,
  value: unknown,
  field: ArticleParityField | string,
  path: Path,
  articleId: string | null,
  options: { route?: boolean; canonical?: boolean } = {},
): value is SourceRetirementParity<T> {
  if (!isRecord(value)) {
    addIssue(
      context,
      "input_schema_invalid",
      path,
      "Parity slot must be an object.",
      articleId,
    );
    context.unknownSlots.count += 1;
    return false;
  }

  const status = value.status;
  const legacy = value.legacy;
  const governed = value.governed;
  const decisionId =
    typeof value.decisionId === "string" ? value.decisionId : null;
  const evidence = value.evidence;

  if (
    status !== "equal" &&
    status !== "intentional_difference" &&
    status !== "different" &&
    status !== "unknown"
  ) {
    addIssue(
      context,
      "input_schema_invalid",
      [...path, "status"],
      "Parity status is invalid.",
      articleId,
    );
    context.unknownSlots.count += 1;
    return false;
  }

  if (status === "unknown" || legacy === null || governed === null) {
    context.unknownSlots.count += 1;
    addIssue(
      context,
      parityUnknownCode(field),
      path,
      `${field} parity is unknown or has a null side.`,
      articleId,
    );
    if (status !== "unknown" && legacy !== null && governed !== null) {
      addIssue(
        context,
        "input_schema_invalid",
        path,
        "Unknown parity must use null-not-zero values.",
        articleId,
      );
    }
    validateEvidence(
      context,
      evidence,
      [...path, "evidence"],
      false,
      articleId,
    );
    return false;
  }

  validateEvidence(context, evidence, [...path, "evidence"], true, articleId);

  if (status === "equal") {
    if (!equivalentValues(legacy, governed)) {
      addIssue(
        context,
        parityMismatchCode(field),
        path,
        `${field} is marked equal but legacy and governed values differ.`,
        articleId,
      );
      return false;
    }
    if (options.route && (!validRoute(legacy) || !validRoute(governed))) {
      addIssue(
        context,
        "route_parity_mismatch",
        path,
        "Route parity contains a non-canonical route.",
        articleId,
      );
    }
    if (options.canonical && (!validRoute(legacy) || !validRoute(governed))) {
      addIssue(
        context,
        "canonical_parity_mismatch",
        path,
        "Canonical parity contains a non-canonical route.",
        articleId,
      );
    }
    return true;
  }

  if (status === "different") {
    addIssue(
      context,
      parityMismatchCode(field),
      path,
      `${field} has an unapproved difference between legacy and governed values.`,
      articleId,
    );
    return false;
  }

  context.intentionalDifferences.count += 1;
  decisionFor(context, decisionId, path, context.artifactDigest, articleId);
  if (options.route && (!validRoute(legacy) || !validRoute(governed))) {
    addIssue(
      context,
      parityMismatchCode(field),
      path,
      "Intentional route difference contains a non-canonical route.",
      articleId,
    );
  }
  if (options.canonical && (!validRoute(legacy) || !validRoute(governed))) {
    addIssue(
      context,
      parityMismatchCode(field),
      path,
      "Intentional canonical difference contains a non-canonical route.",
      articleId,
    );
  }
  return true;
}

function getArray(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function validateArtifactAndScope(context: ValidationContext): void {
  const input = context.input;
  if (!input) {
    addSchemaIssue(
      context,
      "(root)",
      "Source retirement input must be an object.",
    );
    return;
  }

  if (input.version !== SOURCE_RETIREMENT_SCHEMA_VERSION) {
    addSchemaIssue(
      context,
      "version",
      "Unsupported source retirement schema version.",
    );
  }
  if (!isValidDateOnly(input.asOf)) {
    addIssue(
      context,
      "invalid_as_of",
      "asOf",
      "asOf must be a valid explicit calendar date.",
    );
  }

  const artifact = isRecord(input.artifact) ? input.artifact : null;
  if (!artifact) {
    addIssue(
      context,
      "dependency_missing",
      "artifact",
      "Artifact identity and digest are required.",
    );
  } else {
    if (!stringValue(artifact.id))
      addSchemaIssue(context, "artifact.id", "Artifact id is required.");
    if (!isSourceRetirementArtifactVersion(artifact.version)) {
      addIssue(
        context,
        "artifact_version_mismatch",
        "artifact.version",
        `Artifact version must be ${SOURCE_RETIREMENT_ARTIFACT_VERSION}.`,
      );
    }
    if (!isSourceRetirementDigest(artifact.digest)) {
      addIssue(
        context,
        "artifact_digest_mismatch",
        "artifact.digest",
        "Artifact digest is invalid.",
      );
    }
  }

  const scope = isRecord(input.scope) ? input.scope : null;
  if (!scope) {
    addIssue(
      context,
      "dependency_missing",
      "scope",
      "Retirement scope is required.",
    );
  } else {
    for (const key of ["sourceFamilies", "bundleIds", "articleIds"] as const) {
      if (!validStringArray(scope[key])) {
        addSchemaIssue(
          context,
          `scope.${key}`,
          `${key} must be a non-empty string array or an explicitly empty array.`,
        );
      }
    }
    const families = getArray(scope.sourceFamilies).filter(
      (item): item is string => typeof item === "string",
    );
    const bundles = getArray(scope.bundleIds).filter(
      (item): item is string => typeof item === "string",
    );
    if (new Set(families).size > 1 || new Set(bundles).size > 1) {
      addIssue(
        context,
        "scope_split_required",
        "scope",
        "A retirement preflight may cover only one source family and one bundle.",
      );
    }
  }

  const recomputed = context.computedArtifactDigest;
  const supplied = context.artifactDigest;
  if (recomputed && supplied && recomputed !== supplied) {
    addIssue(
      context,
      "artifact_digest_mismatch",
      "artifact.digest",
      "Artifact digest does not match the canonical input projection.",
    );
  }
}

function validateInventory(
  context: ValidationContext,
  value: unknown,
  expectedKind: "legacy" | "governed",
  path: Path,
): SourceRetirementInventoryShape | null {
  if (!isRecord(value)) {
    addIssue(
      context,
      "dependency_missing",
      path,
      `${expectedKind} source inventory is required.`,
    );
    return null;
  }
  const sourceKind = value.sourceKind;
  if (sourceKind !== expectedKind) {
    addSchemaIssue(
      context,
      [...path, "sourceKind"],
      `Inventory sourceKind must be ${expectedKind}.`,
    );
  }
  for (const key of [
    "sourceFamily",
    "bundleId",
    "parserVersion",
    "readerVersion",
  ] as const) {
    if (!stringValue(value[key]))
      addSchemaIssue(context, [...path, key], `${key} is required.`);
  }
  if (!isSourceRetirementDigest(value.inventoryDigest)) {
    addIssue(
      context,
      "source_inventory_digest_mismatch",
      [...path, "inventoryDigest"],
      "Inventory digest is invalid.",
    );
  }
  validateRequiredEvidence(context, value, path);
  if (!Array.isArray(value.articles)) {
    addIssue(
      context,
      "dependency_missing",
      [...path, "articles"],
      "Inventory article list is required.",
    );
  }
  const articles = getArray(value.articles);
  const articleIds: string[] = [];
  for (const [index, article] of articles.entries()) {
    if (!isRecord(article)) {
      addSchemaIssue(
        context,
        [...path, "articles", index],
        "Inventory article must be an object.",
      );
      continue;
    }
    const contentId = stringValue(article.contentId);
    if (!contentId) {
      addSchemaIssue(
        context,
        [...path, "articles", index, "contentId"],
        "Inventory article contentId is required.",
      );
    } else {
      articleIds.push(contentId);
    }
    for (const key of [
      "slug",
      "route",
      "clusterId",
      "bundleId",
      "sourceFamily",
    ] as const) {
      if (!stringValue(article[key]))
        addSchemaIssue(
          context,
          [...path, "articles", index, key],
          `${key} is required.`,
        );
    }
    if (!validRoute(article.route)) {
      addIssue(
        context,
        "route_parity_mismatch",
        [...path, "articles", index, "route"],
        "Inventory article route is not canonical.",
        contentId,
      );
    }
    if (!isSourceRetirementDigest(article.contentDigest)) {
      addIssue(
        context,
        "content_digest_parity_mismatch",
        [...path, "articles", index, "contentDigest"],
        "Inventory content digest is invalid.",
        contentId,
      );
    }
    if (!isSourceRetirementDigest(article.identityDigest)) {
      addIssue(
        context,
        "article_identity_parity_mismatch",
        [...path, "articles", index, "identityDigest"],
        "Inventory identity digest is invalid.",
        contentId,
      );
    }
    if (
      article.sourceKind !== expectedKind ||
      article.sourceFamily !== value.sourceFamily ||
      article.bundleId !== value.bundleId
    ) {
      addIssue(
        context,
        "scope_inventory_mismatch",
        [...path, "articles", index],
        "Inventory article does not belong to its declared source inventory.",
        contentId,
      );
    }
    if (
      article.status !== "published" &&
      article.status !== "draft" &&
      article.status !== "blocked" &&
      article.status !== "redirected"
    ) {
      addSchemaIssue(
        context,
        [...path, "articles", index, "status"],
        "Inventory article status is invalid.",
        contentId,
      );
    }
  }

  const duplicates = uniqueIds(articleIds).filter(
    (id) => articleIds.filter((candidate) => candidate === id).length > 1,
  );
  for (const id of duplicates) {
    context.duplicateIdentities.count += 1;
    addIssue(
      context,
      "duplicate_article_identity",
      [...path, "articles"],
      `Duplicate article identity ${id}.`,
      id,
    );
  }

  return {
    sourceKind: expectedKind,
    sourceFamily: stringValue(value.sourceFamily),
    bundleId: stringValue(value.bundleId),
    parserVersion: stringValue(value.parserVersion),
    readerVersion: stringValue(value.readerVersion),
    inventoryDigest: isSourceRetirementDigest(value.inventoryDigest)
      ? value.inventoryDigest
      : null,
    articles,
  };
}

interface SourceRetirementInventoryShape {
  readonly sourceKind: "legacy" | "governed";
  readonly sourceFamily: string | null;
  readonly bundleId: string | null;
  readonly parserVersion: string | null;
  readonly readerVersion: string | null;
  readonly inventoryDigest: SourceRetirementDigest | null;
  readonly articles: readonly unknown[];
}

function validateInventoryParity(
  context: ValidationContext,
  legacy: SourceRetirementInventoryShape | null,
  governed: SourceRetirementInventoryShape | null,
): void {
  if (!legacy || !governed) return;
  const legacyArticles = legacy.articles.filter(isRecord);
  const governedArticles = governed.articles.filter(isRecord);
  const legacyIndex = indexById(legacyArticles, (article) =>
    stringValue(article.contentId),
  );
  const governedIndex = indexById(governedArticles, (article) =>
    stringValue(article.contentId),
  );

  for (const id of legacyIndex.duplicateIds) {
    context.duplicateIdentities.count += 1;
    addIssue(
      context,
      "duplicate_article_identity",
      "legacy.articles",
      `Duplicate legacy article identity ${id}.`,
      id,
    );
  }
  for (const id of governedIndex.duplicateIds) {
    context.duplicateIdentities.count += 1;
    addIssue(
      context,
      "duplicate_article_identity",
      "governed.articles",
      `Duplicate governed article identity ${id}.`,
      id,
    );
  }

  const legacyIds = new Set(legacyIndex.map.keys());
  const governedIds = new Set(governedIndex.map.keys());
  for (const id of sortCodePoints([...legacyIds])) {
    if (!governedIds.has(id)) {
      addIssue(
        context,
        "legacy_only_article",
        "governed.articles",
        `Article ${id} exists only in legacy inventory.`,
        id,
      );
    }
  }
  for (const id of sortCodePoints([...governedIds])) {
    if (!legacyIds.has(id)) {
      addIssue(
        context,
        "governed_only_article",
        "legacy.articles",
        `Article ${id} exists only in governed inventory.`,
        id,
      );
    }
  }

  for (const id of sortCodePoints(
    [...legacyIds].filter((candidate) => governedIds.has(candidate)),
  )) {
    const left = legacyIndex.map.get(id)?.[0];
    const right = governedIndex.map.get(id)?.[0];
    if (!left || !right) continue;
    for (const key of [
      "slug",
      "route",
      "clusterId",
      "bundleId",
      "contentDigest",
      "identityDigest",
      "status",
    ] as const) {
      if (!equivalentValues(left[key], right[key])) {
        const code =
          key === "route"
            ? "route_parity_mismatch"
            : key === "contentDigest"
              ? "content_digest_parity_mismatch"
              : "article_identity_parity_mismatch";
        addIssue(
          context,
          code,
          `inventory.${id}.${key}`,
          `Legacy and governed inventory values differ for ${key}.`,
          id,
        );
      }
    }
  }

  const scopeArticleIds = getArray(
    context.input?.scope && isRecord(context.input.scope)
      ? context.input.scope.articleIds
      : null,
  ).filter((item): item is string => typeof item === "string");
  const inventoryIds = new Set([...legacyIds, ...governedIds]);
  for (const id of sortCodePoints(scopeArticleIds)) {
    if (!inventoryIds.has(id)) {
      addIssue(
        context,
        "missing_article_parity",
        "scope.articleIds",
        `Scoped article ${id} is absent from both inventories.`,
        id,
      );
    }
  }

  const parityValues = getArray(context.input?.articles);
  const parityIndex = indexById(parityValues, (article) =>
    isRecord(article) ? stringValue(article.articleId) : null,
  );
  for (const id of parityIndex.duplicateIds) {
    context.duplicateIdentities.count += 1;
    addIssue(
      context,
      "duplicate_article_parity",
      "articles",
      `Duplicate article parity record ${id}.`,
      id,
    );
  }
  for (const id of sortCodePoints([...inventoryIds])) {
    if (!parityIndex.map.has(id)) {
      addIssue(
        context,
        "missing_article_parity",
        "articles",
        `Article ${id} has no complete parity record.`,
        id,
      );
    }
  }
  for (const id of sortCodePoints([...parityIndex.map.keys()])) {
    if (!inventoryIds.has(id)) {
      addIssue(
        context,
        "missing_article_parity",
        "articles",
        `Parity record ${id} has no matching inventory identity.`,
        id,
      );
    }
  }
}

function validateParserParity(context: ValidationContext): void {
  const value = context.input?.parserParity;
  if (!isRecord(value)) {
    addIssue(
      context,
      "dependency_missing",
      "parserParity",
      "Parser/read parity is required.",
    );
    return;
  }
  const status = value.status;
  if (status === "unknown") {
    context.unknownSlots.count += 1;
    addIssue(
      context,
      "parser_parity_unknown",
      "parserParity",
      "Parser/read parity is unknown.",
    );
  } else if (
    status !== "equal" &&
    status !== "intentional_difference" &&
    status !== "different"
  ) {
    addSchemaIssue(
      context,
      "parserParity.status",
      "Parser parity status is invalid.",
    );
  }
  validateEvidence(context, value.evidence, ["parserParity", "evidence"], true);
  for (const side of ["legacy", "governed"] as const) {
    const snapshot = value[side];
    if (!isRecord(snapshot)) {
      addIssue(
        context,
        "parser_parity_unknown",
        ["parserParity", side],
        "Parser/read snapshot is missing.",
      );
      continue;
    }
    if (
      !stringValue(snapshot.parserVersion) ||
      !stringValue(snapshot.readerVersion)
    ) {
      addSchemaIssue(
        context,
        ["parserParity", side],
        "Parser and reader versions are required.",
      );
    }
    if (!isSourceRetirementDigest(snapshot.readDigest)) {
      addIssue(
        context,
        "parser_parity_mismatch",
        ["parserParity", side, "readDigest"],
        "Read digest is invalid.",
      );
    }
    if (
      snapshot.articleCount !== null &&
      (typeof snapshot.articleCount !== "number" ||
        !Number.isInteger(snapshot.articleCount) ||
        snapshot.articleCount < 0)
    ) {
      addSchemaIssue(
        context,
        ["parserParity", side, "articleCount"],
        "Article count must be a non-negative integer or null.",
      );
    }
    validateEvidence(
      context,
      snapshot.evidence,
      ["parserParity", side, "evidence"],
      true,
    );
    const inventory = context.input?.[side];
    if (
      isRecord(inventory) &&
      (snapshot.parserVersion !== inventory.parserVersion ||
        snapshot.readerVersion !== inventory.readerVersion)
    ) {
      addIssue(
        context,
        "parser_parity_mismatch",
        ["parserParity", side],
        "Parser/read snapshot versions do not match the declared source inventory.",
      );
    }
  }
  const legacy = isRecord(value.legacy) ? value.legacy : null;
  const governed = isRecord(value.governed) ? value.governed : null;
  if (status === "equal" && legacy && governed) {
    if (
      !equivalentValues(legacy.readDigest, governed.readDigest) ||
      !equivalentValues(legacy.articleCount, governed.articleCount) ||
      !equivalentValues(legacy.readerVersion, governed.readerVersion)
    ) {
      addIssue(
        context,
        "parser_parity_mismatch",
        "parserParity",
        "Parser/read parity is marked equal but read outputs differ.",
      );
    }
  } else if (status === "different") {
    addIssue(
      context,
      "parser_parity_mismatch",
      "parserParity",
      "Parser/read parity contains an unapproved difference.",
    );
  } else if (status === "intentional_difference") {
    context.intentionalDifferences.count += 1;
    decisionFor(
      context,
      typeof value.decisionId === "string" ? value.decisionId : null,
      ["parserParity"],
      context.artifactDigest,
      null,
    );
  }
}

function validateArticleParities(context: ValidationContext): void {
  if (!Array.isArray(context.input?.articles)) {
    addIssue(
      context,
      "dependency_missing",
      "articles",
      "Article parity records are required.",
    );
    return;
  }
  const articles = context.input.articles;
  for (const [index, rawArticle] of articles.entries()) {
    if (!isRecord(rawArticle)) {
      addSchemaIssue(
        context,
        ["articles", index],
        "Article parity record must be an object.",
      );
      continue;
    }
    const articleId = stringValue(rawArticle.articleId);
    if (!articleId) {
      addSchemaIssue(
        context,
        ["articles", index, "articleId"],
        "Article parity articleId is required.",
      );
      continue;
    }
    for (const field of PARITY_FIELDS) {
      const options = {
        route: field === "route",
        canonical: field === "canonical",
      };
      validateParity<unknown>(
        context,
        rawArticle[field],
        field,
        ["articles", index, field],
        articleId,
        options,
      );
    }
  }
}

function validateGraphParity(
  context: ValidationContext,
): "equal" | "different" | "unknown" | "missing" {
  const value = context.input?.graphParity;
  if (!isRecord(value)) {
    addIssue(
      context,
      "graph_parity_missing",
      "graphParity",
      "Graph parity is required.",
    );
    return "missing";
  }
  if (value.version !== 1)
    addSchemaIssue(
      context,
      "graphParity.version",
      "Graph parity version must be 1.",
    );
  const status = value.status;
  if (status === "unknown") {
    context.unknownSlots.count += 1;
    addIssue(
      context,
      "graph_parity_unknown",
      "graphParity.status",
      "Graph parity is unknown.",
    );
  } else if (status === "different") {
    addIssue(
      context,
      "graph_drift",
      "graphParity.status",
      "Legacy and governed graph outputs differ.",
    );
  } else if (status === "intentional_difference") {
    context.intentionalDifferences.count += 1;
    decisionFor(
      context,
      typeof value.decisionId === "string" ? value.decisionId : null,
      ["graphParity"],
      context.artifactDigest,
      null,
    );
  } else if (status !== "equal") {
    addSchemaIssue(
      context,
      "graphParity.status",
      "Graph parity status is invalid.",
    );
  }
  validateEvidence(context, value.evidence, ["graphParity", "evidence"], true);

  if (
    !isSourceRetirementDigest(value.legacyDigest) ||
    !isSourceRetirementDigest(value.governedDigest)
  ) {
    context.unknownSlots.count += 1;
    addIssue(
      context,
      "graph_drift",
      "graphParity.digest",
      "Graph artifact digests are missing or invalid.",
    );
  } else if (
    status === "equal" &&
    value.legacyDigest !== value.governedDigest
  ) {
    addIssue(
      context,
      "graph_drift",
      "graphParity.digest",
      "Graph parity is equal but graph digests differ.",
    );
  }

  if (!Array.isArray(value.articles)) {
    addSchemaIssue(
      context,
      "graphParity.articles",
      "Graph article parity records are required.",
    );
  }
  const graphArticles = getArray(value.articles);
  const graphIndex = indexById(graphArticles, (article) =>
    isRecord(article) ? stringValue(article.articleId) : null,
  );
  for (const id of graphIndex.duplicateIds) {
    addIssue(
      context,
      "duplicate_article_parity",
      "graphParity.articles",
      `Duplicate graph parity record ${id}.`,
      id,
    );
  }
  const articleIds = new Set(
    getArray(context.input?.articles).flatMap((article) =>
      isRecord(article) && typeof article.articleId === "string"
        ? [article.articleId]
        : [],
    ),
  );
  for (const id of sortCodePoints([...articleIds])) {
    if (!graphIndex.map.has(id))
      addIssue(
        context,
        "graph_parity_missing",
        "graphParity.articles",
        `Graph parity is missing article ${id}.`,
        id,
      );
  }
  for (const [index, rawArticle] of graphArticles.entries()) {
    if (!isRecord(rawArticle)) {
      addSchemaIssue(
        context,
        ["graphParity", "articles", index],
        "Graph article parity must be an object.",
      );
      continue;
    }
    const articleId = stringValue(rawArticle.articleId);
    if (!articleId) {
      addSchemaIssue(
        context,
        ["graphParity", "articles", index, "articleId"],
        "Graph articleId is required.",
      );
      continue;
    }
    validateParity<string>(
      context,
      rawArticle.node,
      "graph_node",
      ["graphParity", "articles", index, "node"],
      articleId,
    );
    validateParity<readonly string[]>(
      context,
      rawArticle.recommendations,
      "graph_recommendation",
      ["graphParity", "articles", index, "recommendations"],
      articleId,
    );
    validateParity<readonly string[]>(
      context,
      rawArticle.diagnostics,
      "graph_diagnostics",
      ["graphParity", "articles", index, "diagnostics"],
      articleId,
    );
  }
  return status === "equal"
    ? "equal"
    : status === "different" || status === "intentional_difference"
      ? "different"
      : "unknown";
}

function validateUrlDisposition(
  context: ValidationContext,
): "ready" | "blocked" | "missing" | "mismatched" {
  const value = context.input?.urlDisposition;
  if (!isRecord(value)) {
    addIssue(
      context,
      "url_disposition_missing",
      "urlDisposition",
      "Ticket 24 URL disposition preflight report is required.",
    );
    return "missing";
  }
  if (value.version !== 1) {
    addSchemaIssue(
      context,
      "urlDisposition.version",
      "Ticket 24 URL disposition report version must be 1.",
    );
  }
  const status = value.status;
  if (status !== "approved_for_preflight") {
    addIssue(
      context,
      "url_disposition_not_ready",
      "urlDisposition.status",
      "Ticket 24 URL disposition preflight is not approved_for_preflight.",
    );
  }
  const reportDigest = value.reportDigest;
  const { reportDigest: _reportedDigest, ...reportSubject } =
    value as AnyRecord & {
      reportDigest?: unknown;
    };
  void _reportedDigest;
  let reportDigestMatches = false;
  try {
    reportDigestMatches =
      isSourceRetirementDigest(reportDigest) &&
      computeUrlDispositionReportDigest(reportSubject as never) ===
        reportDigest;
  } catch {
    reportDigestMatches = false;
  }
  if (!reportDigestMatches) {
    addIssue(
      context,
      "url_disposition_artifact_mismatch",
      "urlDisposition.reportDigest",
      "Ticket 24 URL disposition report digest is missing or tampered.",
    );
  }
  const digest = value.artifactDigest;
  if (!isSourceRetirementDigest(digest)) {
    addIssue(
      context,
      "url_disposition_artifact_mismatch",
      "urlDisposition.artifactDigest",
      "Ticket 24 URL disposition report must expose its bound artifact digest.",
    );
  }
  if (!Array.isArray(value.blockers) || value.blockers.length > 0) {
    addIssue(
      context,
      "url_disposition_not_ready",
      "urlDisposition.blockers",
      "Ticket 24 URL disposition report contains blockers.",
    );
  }
  const releaseGate = isRecord(value.releaseGate) ? value.releaseGate : null;
  if (!releaseGate || releaseGate.status !== "satisfied") {
    addIssue(
      context,
      "url_disposition_not_ready",
      "urlDisposition.releaseGate",
      "Ticket 24 release gate is not satisfied.",
    );
  } else {
    if (
      !isSourceRetirementDigest(releaseGate.artifactDigest) ||
      !isSourceRetirementDigest(digest) ||
      releaseGate.artifactDigest !== digest
    ) {
      addIssue(
        context,
        "url_disposition_artifact_mismatch",
        "urlDisposition.releaseGate.artifactDigest",
        "Ticket 24 release gate is not bound to its URL disposition artifact.",
      );
    }
    const contentApprover = stringValue(releaseGate.contentApprover);
    const productionApprover = stringValue(releaseGate.productionApprover);
    if (
      !stringValue(releaseGate.releaseId) ||
      !contentApprover ||
      !productionApprover
    ) {
      addIssue(
        context,
        "url_disposition_not_ready",
        "urlDisposition.releaseGate",
        "Ticket 24 release gate must identify both human approvers.",
      );
    } else if (contentApprover === productionApprover) {
      addIssue(
        context,
        "url_disposition_not_ready",
        "urlDisposition.releaseGate",
        "Ticket 24 content and production approvals must be independent.",
      );
    }
  }
  const productionExecution = isRecord(value.productionExecution)
    ? value.productionExecution
    : null;
  if (
    !productionExecution ||
    productionExecution.supported !== false ||
    productionExecution.allowed !== false ||
    !stringValue(productionExecution.reason)
  ) {
    addIssue(
      context,
      "url_disposition_execution_unsafe",
      "urlDisposition.productionExecution",
      "Ticket 24 must explicitly disable production execution capability.",
    );
  }
  const hasBlocker = context.issues.some(
    (issue) => issue.code === "url_disposition_not_ready",
  );
  const hasMismatch = context.issues.some(
    (issue) => issue.code === "url_disposition_artifact_mismatch",
  );
  return hasMismatch ? "mismatched" : hasBlocker ? "blocked" : "ready";
}

function validateLedger(
  context: ValidationContext,
): "valid_locked" | "invalid" | "unlocked" | "missing" | "mismatched" {
  const value = context.input?.migrationLedger;
  if (!isRecord(value)) {
    addIssue(
      context,
      "ledger_missing",
      "migrationLedger",
      "Migration ledger evidence is required.",
    );
    return "missing";
  }
  if (value.version !== 1)
    addSchemaIssue(
      context,
      "migrationLedger.version",
      "Migration ledger version must be 1.",
    );
  validateEvidence(
    context,
    value.evidence,
    ["migrationLedger", "evidence"],
    true,
  );
  if (value.status !== "valid")
    addIssue(
      context,
      "ledger_not_valid",
      "migrationLedger.status",
      "Migration ledger must be valid.",
    );
  if (value.locked !== true)
    addIssue(
      context,
      "ledger_not_locked",
      "migrationLedger.locked",
      "Migration ledger must be locked.",
    );
  if (
    !isSourceRetirementDigest(value.artifactDigest) ||
    context.artifactDigest === null ||
    value.artifactDigest !== context.artifactDigest
  ) {
    addIssue(
      context,
      "ledger_artifact_mismatch",
      "migrationLedger.artifactDigest",
      "Migration ledger is bound to a different artifact.",
    );
  }
  if (value.status !== "valid") return "invalid";
  if (value.locked !== true) return "unlocked";
  if (
    !isSourceRetirementDigest(value.artifactDigest) ||
    value.artifactDigest !== context.artifactDigest
  )
    return "mismatched";
  return "valid_locked";
}

function validateRollback(
  context: ValidationContext,
): "ready" | "blocked" | "missing" {
  const value = context.input?.rollback;
  if (!isRecord(value)) {
    addIssue(
      context,
      "rollback_missing",
      "rollback",
      "Rollback/restore plan is required.",
    );
    return "missing";
  }
  if (value.status !== "ready")
    addIssue(
      context,
      "rollback_not_ready",
      "rollback.status",
      "Rollback plan must be ready.",
    );
  if (!stringValue(value.id) || !stringValue(value.restoreTarget))
    addIssue(
      context,
      "rollback_not_ready",
      "rollback.restoreTarget",
      "Rollback restore target is required.",
    );
  if (
    !Array.isArray(value.steps) ||
    value.steps.length === 0 ||
    value.steps.some(
      (step) => typeof step !== "string" || step.trim().length === 0,
    )
  ) {
    addIssue(
      context,
      "rollback_not_ready",
      "rollback.steps",
      "Rollback plan must contain explicit restore steps.",
    );
  }
  validateEvidence(context, value.evidence, ["rollback", "evidence"], true);
  if (
    !isSourceRetirementDigest(value.artifactDigest) ||
    value.artifactDigest !== context.artifactDigest
  ) {
    addIssue(
      context,
      "rollback_artifact_mismatch",
      "rollback.artifactDigest",
      "Rollback plan is bound to a different artifact.",
    );
  }
  let expectedLegacyInventoryDigest: SourceRetirementDigest | null = null;
  try {
    if (context.input?.legacy) {
      expectedLegacyInventoryDigest = computeSourceRetirementInventoryDigest(
        context.input.legacy,
      );
    }
  } catch {
    expectedLegacyInventoryDigest = null;
  }
  if (
    !isSourceRetirementDigest(value.sourceInventoryDigest) ||
    value.sourceInventoryDigest !== expectedLegacyInventoryDigest
  ) {
    addIssue(
      context,
      "rollback_inventory_digest_mismatch",
      "rollback.sourceInventoryDigest",
      "Rollback plan is not bound to the source inventory digest.",
    );
  }
  return value.status === "ready" &&
    context.issues.every((issue) => !issue.path.startsWith("rollback."))
    ? "ready"
    : "blocked";
}

function validateApprovals(context: ValidationContext): void {
  const values = context.input?.approvals;
  if (!Array.isArray(values)) {
    addIssue(
      context,
      "approval_missing",
      "approvals",
      "Parity, content, and production approvals are required.",
    );
    return;
  }
  const byKind = new Map<string, AnyRecord[]>();
  for (const [index, rawApproval] of values.entries()) {
    if (!isRecord(rawApproval)) {
      addIssue(
        context,
        "approval_invalid",
        ["approvals", index],
        "Approval must be an object.",
      );
      continue;
    }
    const kind = rawApproval.kind;
    const actor = isRecord(rawApproval.actor) ? rawApproval.actor : null;
    if (kind !== "parity" && kind !== "content" && kind !== "production") {
      addIssue(
        context,
        "approval_invalid",
        ["approvals", index, "kind"],
        "Approval kind is invalid.",
      );
    } else {
      const existing = byKind.get(kind) ?? [];
      existing.push(rawApproval);
      byKind.set(kind, existing);
    }
    if (!actor || actor.type !== "human" || !validMachineId(actor.id))
      addIssue(
        context,
        "approval_invalid",
        ["approvals", index, "actor"],
        "Approval actor must be a named human reviewer.",
      );
    if (!isValidUtcTimestamp(rawApproval.approvedAt))
      addIssue(
        context,
        "approval_time_invalid",
        ["approvals", index, "approvedAt"],
        "Approval time must be an absolute UTC timestamp.",
      );
    if (
      isValidUtcTimestamp(rawApproval.approvedAt) &&
      context.asOf !== null &&
      timestampDate(rawApproval.approvedAt) > context.asOf
    )
      addIssue(
        context,
        "approval_time_invalid",
        ["approvals", index, "approvedAt"],
        "Approval cannot be dated after asOf.",
      );
    if (
      !isSourceRetirementDigest(rawApproval.artifactDigest) ||
      rawApproval.artifactDigest !== context.artifactDigest
    )
      addIssue(
        context,
        "approval_artifact_mismatch",
        ["approvals", index, "artifactDigest"],
        "Approval is not bound to this artifact.",
      );
    validateEvidence(
      context,
      rawApproval.evidence,
      ["approvals", index, "evidence"],
      true,
    );
  }
  for (const kind of ["parity", "content", "production"] as const) {
    const matches = byKind.get(kind) ?? [];
    if (matches.length === 0)
      addIssue(
        context,
        "approval_missing",
        "approvals",
        `Required ${kind} approval is missing.`,
      );
    if (matches.length > 1)
      addIssue(
        context,
        "approval_duplicate",
        "approvals",
        `Approval kind ${kind} is duplicated.`,
      );
  }

  const contentApproval = byKind.get("content")?.[0];
  const productionApproval = byKind.get("production")?.[0];
  const contentActor =
    contentApproval && isRecord(contentApproval.actor)
      ? stringValue(contentApproval.actor.id)
      : null;
  const productionActor =
    productionApproval && isRecord(productionApproval.actor)
      ? stringValue(productionApproval.actor.id)
      : null;
  if (contentActor && productionActor && contentActor === productionActor) {
    addIssue(
      context,
      "approval_not_independent",
      "approvals",
      "Content and production approvals must be granted by independent human reviewers.",
    );
  }
}

function validateApprovedDecisionShape(context: ValidationContext): void {
  const values = context.input?.approvedDecisions;
  if (!Array.isArray(values)) {
    addIssue(
      context,
      "dependency_missing",
      "approvedDecisions",
      "Approved migration decisions must be explicit, even when empty.",
    );
    return;
  }
  const seen = new Set<string>();
  for (const [index, rawDecision] of values.entries()) {
    if (!isRecord(rawDecision)) {
      addIssue(
        context,
        "decision_missing",
        ["approvedDecisions", index],
        "Approved decision must be an object.",
      );
      continue;
    }
    const id = stringValue(rawDecision.id);
    if (!id || seen.has(id))
      addIssue(
        context,
        "decision_missing",
        ["approvedDecisions", index, "id"],
        "Approved decision id must be unique.",
      );
    if (id) seen.add(id);
    if (
      !isSourceRetirementDigest(rawDecision.artifactDigest) ||
      rawDecision.artifactDigest !== context.artifactDigest
    )
      addIssue(
        context,
        "decision_artifact_mismatch",
        ["approvedDecisions", index, "artifactDigest"],
        "Approved decision is not bound to this artifact.",
      );
    validateEvidence(
      context,
      rawDecision.evidence,
      ["approvedDecisions", index, "evidence"],
      true,
    );
  }
}

function validateSourceInventoryDigests(
  context: ValidationContext,
  legacy: SourceRetirementInventoryShape | null,
  governed: SourceRetirementInventoryShape | null,
): void {
  const validateDigest = (
    inventory: SourceRetirementInventoryShape | null,
    path: "legacy" | "governed",
  ): void => {
    if (!inventory) return;
    const canonicalSubject = context.input?.[path];
    let expected: SourceRetirementDigest | null = null;
    try {
      expected = computeSourceRetirementInventoryDigest(canonicalSubject);
    } catch {
      expected = null;
    }
    if (inventory.inventoryDigest !== expected) {
      addIssue(
        context,
        "source_inventory_digest_mismatch",
        `${path}.inventoryDigest`,
        `${path === "legacy" ? "Legacy" : "Governed"} inventory digest does not match its canonical inventory subject.`,
      );
    }
  };

  validateDigest(legacy, "legacy");
  validateDigest(governed, "governed");
}

function collectEvidenceChecks(context: ValidationContext): void {
  const root = context.raw;
  const seen = new WeakSet<object>();
  function walk(value: unknown, path: Path): void {
    if (!value || typeof value !== "object") return;
    const object = value as object;
    if (seen.has(object)) return;
    seen.add(object);
    if (Array.isArray(value)) {
      value.forEach((nested, index) => walk(nested, [...path, index]));
      return;
    }
    for (const [key, nested] of Object.entries(value as AnyRecord)) {
      if (key === "evidence" && nested !== null && nested !== undefined) {
        validateEvidence(context, nested, [...path, key], false);
      }
      walk(nested, [...path, key]);
    }
  }
  walk(root, []);
}

function buildContext(raw: unknown): ValidationContext {
  const parsed = sourceRetirementInputContractSchema.safeParse(raw);
  const input = parsed.success ? (parsed.data as AnyRecord) : null;
  const rawRecord = isRecord(raw) ? raw : null;
  const artifact =
    rawRecord && isRecord(rawRecord.artifact) ? rawRecord.artifact : null;
  const artifactDigest =
    artifact && isSourceRetirementDigest(artifact.digest)
      ? artifact.digest
      : null;
  let computedArtifactDigest: SourceRetirementDigest | null = null;
  try {
    computedArtifactDigest = computeSourceRetirementArtifactDigest(raw);
  } catch {
    computedArtifactDigest = null;
  }
  const context: ValidationContext = {
    raw,
    input,
    asOf: rawRecord && isValidDateOnly(rawRecord.asOf) ? rawRecord.asOf : null,
    artifactDigest,
    computedArtifactDigest,
    issues: [],
    issueKeys: new Set<string>(),
    intentionalDifferences: { count: 0 },
    unknownSlots: { count: 0 },
    duplicateIdentities: { count: 0 },
  };
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      addSchemaIssue(
        context,
        issue.path.length === 0 ? "(root)" : issue.path.map(String).join("."),
        issue.message,
      );
    }
  }
  return context;
}

function reportBase(
  context: ValidationContext,
  graph: "equal" | "different" | "unknown" | "missing",
  url: "ready" | "blocked" | "missing" | "mismatched",
  ledger: "valid_locked" | "invalid" | "unlocked" | "missing" | "mismatched",
  rollback: "ready" | "blocked" | "missing",
): Omit<SourceRetirementPreflightReport, "status" | "reportDigest"> {
  const input = context.input;
  const artifact = input && isRecord(input.artifact) ? input.artifact : null;
  const scope = input && isRecord(input.scope) ? input.scope : null;
  const sourceFamilies = sortCodePoints(
    getArray(scope?.sourceFamilies).filter(
      (item): item is string => typeof item === "string",
    ),
  );
  const bundleIds = sortCodePoints(
    getArray(scope?.bundleIds).filter(
      (item): item is string => typeof item === "string",
    ),
  );
  const articleIds = sortCodePoints(
    getArray(scope?.articleIds).filter(
      (item): item is string => typeof item === "string",
    ),
  );
  const legacyArticles =
    input && isRecord(input.legacy) ? getArray(input.legacy.articles) : [];
  const governedArticles =
    input && isRecord(input.governed) ? getArray(input.governed.articles) : [];
  const inventoryCount = legacyArticles.length + governedArticles.length;
  const articleIdsFromParity = input
    ? getArray(input.articles)
        .map((article) => (isRecord(article) ? article.articleId : null))
        .filter((id): id is string => typeof id === "string")
    : [];
  const hasData = inventoryCount > 0 || articleIdsFromParity.length > 0;
  const expectedIds = hasData
    ? uniqueIds([
        ...articleIds,
        ...legacyArticles.map((article) =>
          isRecord(article) ? article.contentId : null,
        ),
        ...governedArticles.map((article) =>
          isRecord(article) ? article.contentId : null,
        ),
        ...articleIdsFromParity,
      ])
    : [];
  const articlesCompared = hasData ? new Set(articleIdsFromParity).size : null;
  const splitRequired = sourceFamilies.length > 1 || bundleIds.length > 1;
  const blockers = sortIssues(context.issues);
  const reportWithoutDigest: Omit<
    SourceRetirementPreflightReport,
    "status" | "reportDigest"
  > = {
    version: 1,
    asOf: context.asOf,
    artifact: {
      id: stringValue(artifact?.id),
      version: stringValue(artifact?.version),
      digest: context.artifactDigest,
    },
    scope: { sourceFamilies, bundleIds, articleIds, splitRequired },
    blockers,
    parity: {
      articlesExpected: hasData ? expectedIds.length : null,
      articlesCompared,
      legacyOnly: hasData
        ? blockers.filter((issue) => issue.code === "legacy_only_article")
            .length
        : null,
      governedOnly: hasData
        ? blockers.filter((issue) => issue.code === "governed_only_article")
            .length
        : null,
      duplicateIdentities: hasData ? context.duplicateIdentities.count : null,
      unknownSlots: hasData ? context.unknownSlots.count || 0 : null,
      intentionalDifferences: hasData
        ? context.intentionalDifferences.count || 0
        : null,
    },
    dependencies: {
      urlDisposition: url,
      migrationLedger: ledger,
      graph,
      rollback,
    },
    productionExecution: PRODUCTION_EXECUTION,
    retirementExecution: RETIREMENT_EXECUTION,
  };
  return reportWithoutDigest;
}

export function buildSourceRetirementPreflight(
  raw: SourceRetirementInput | unknown,
): SourceRetirementPreflightReport {
  const context = buildContext(raw);
  validateArtifactAndScope(context);
  const legacy = validateInventory(context, context.input?.legacy, "legacy", [
    "legacy",
  ]);
  const governed = validateInventory(
    context,
    context.input?.governed,
    "governed",
    ["governed"],
  );
  validateSourceInventoryDigests(context, legacy, governed);
  validateInventoryParity(context, legacy, governed);
  validateParserParity(context);
  validateArticleParities(context);
  const graph = validateGraphParity(context);
  const url = validateUrlDisposition(context);
  const ledger = validateLedger(context);
  const rollback = validateRollback(context);
  validateApprovals(context);
  validateApprovedDecisionShape(context);
  collectEvidenceChecks(context);

  const scopeSplit = context.issues.some(
    (issue) => issue.code === "scope_split_required",
  );
  const status: SourceRetirementPreflightReport["status"] = scopeSplit
    ? "split_required"
    : context.issues.length > 0
      ? "blocked"
      : "preview_ready";
  const base = reportBase(context, graph, url, ledger, rollback);
  const reportDigest = computeSourceRetirementReportDigest({
    ...base,
    status,
  });
  return deepFreeze({ ...base, status, reportDigest });
}

export const createSourceRetirementPreflightReport =
  buildSourceRetirementPreflight;
export const validateSourceRetirementPreflight = buildSourceRetirementPreflight;

export type {
  SourceRetirementApproval,
  SourceRetirementApprovalKind,
  SourceRetirementApprovedDecision,
  SourceRetirementArticleIdentity,
  SourceRetirementArticleParity,
  SourceRetirementDigest,
  SourceRetirementEvidence,
  SourceRetirementGraphArticleParity,
  SourceRetirementGraphParity,
  SourceRetirementInput,
  SourceRetirementParity,
  SourceRetirementParityStatus,
  SourceRetirementPreflightIssue,
  SourceRetirementPreflightIssueCode,
  SourceRetirementPreflightReport,
  SourceRetirementSourceInventory,
};
