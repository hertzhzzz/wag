import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { clusterRegistry as defaultClusterRegistry } from "../../../content/seo/clusters";
import {
  ARTICLE_GOVERNED_FIELDS,
  ArticleValidationError,
  articleCanonicalUrl,
  articleRoutePath,
  deriveContentId,
  parseArticleFrontmatter,
  type ArticleCompatibilityWarning,
  type NormalizedArticleFrontmatter,
} from "../articleSchema";
import { parseClusterRegistry, type ClusterRegistry } from "../clusterSchema";
import { runEvidenceGate } from "../evidenceGate";
import {
  evaluateEvidenceStatus,
  parseEvidenceClaimManifestYaml,
  parseEvidenceRegistryYaml,
  parseEvidenceReviewDecisionYaml,
  type EvidenceRecord,
  type EvidenceRegistry,
} from "../evidenceSchema";
import { SEO_BASELINE_COHORT } from "./baseline";
import {
  SEO_ARTIFACT_NAMES,
  SEO_GENERATED_RELATIVE_DIR,
  SEO_GOVERNANCE_PROTOCOL_VERSION,
  type SeoAdvisoryCategory,
  type SeoArtifactCheck,
  type SeoArtifactName,
  type SeoBaselineDuplicate,
  type SeoBaselineIdentity,
  type SeoBaselineReport,
  type SeoCompatibilityArticleReport,
  type SeoCompatibilityReport,
  type SeoGovernanceBuildOptions,
  type SeoGovernanceBuildResult,
  type SeoGovernanceIssue,
  type SeoGovernanceRunOptions,
  type SeoGovernanceRunResult,
  type SeoHardFailureCategory,
  type SeoStrictScope,
  type SeoWriteFailpoint,
} from "./types";

export {
  SEO_ARTIFACT_NAMES,
  SEO_GENERATED_RELATIVE_DIR,
  SEO_GOVERNANCE_PROTOCOL_VERSION,
} from "./types";
export type * from "./types";

/** Canonical contract exported for validators and tests without a second list. */
export const GOVERNED_FIELDS = ARTICLE_GOVERNED_FIELDS;

const DEFAULT_BLOG_RELATIVE_DIR = "content/blog";
const DEFAULT_EVIDENCE_REGISTRY_RELATIVE_PATH =
  "content/seo/evidence/registry.yaml";
const DEFAULT_EVIDENCE_CLAIMS_RELATIVE_DIR = "content/seo/evidence/claims";
const DEFAULT_EVIDENCE_REVIEWS_RELATIVE_DIR = "content/seo/evidence/reviews";
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

interface InternalArticle {
  absolutePath: string;
  sourcePath: string;
  source: string;
  body: string;
  raw: Record<string, unknown>;
  slug: string;
  route: string;
  declaredRoute: string;
  contentId: string;
  migrated: boolean;
  parsed: NormalizedArticleFrontmatter | null;
  warnings: ArticleCompatibilityWarning[];
  missingGovernedFields: string[];
  links: string[];
}

interface UnsafeRule {
  kind: string;
  pattern: RegExp;
}

const UNSAFE_RULES: readonly UnsafeRule[] = Object.freeze([
  {
    kind: "secret",
    pattern:
      /(?:password|passcode|api[ _-]?key|access[ _-]?token|secret(?:[ _-]?key)?)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{8,}/giu,
  },
  {
    kind: "secret",
    pattern: /\b(?:sk|ghp|github_pat|xox[baprs])[-_][A-Za-z0-9_-]{8,}\b/gu,
  },
  {
    kind: "pii",
    pattern:
      /(?:passport(?: number)?|date of birth|\bdob\b|home address|personal email|personal phone|tax file number|\btfn\b)\s*[:=]\s*[^\r\n]{4,}/giu,
  },
  {
    kind: "payment",
    pattern:
      /(?:bank account|account number|\bbsb\b|\biban\b|\bswift\b|credit card|card number|payment instructions)\s*[:=]\s*[^\r\n]{4,}/giu,
  },
  {
    kind: "credential",
    pattern:
      /(?:driver'?s? licen[cs]e|licen[cs]e number|credential|login|private key|certificate password)\s*[:=]\s*[^\r\n]{4,}/giu,
  },
  {
    kind: "credential",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gu,
  },
  {
    kind: "restricted-source",
    pattern:
      /(?:restricted supplier|supplier identity|confidential interview|confidential source|interviewee)\s*[:=]\s*[^\r\n]{4,}/giu,
  },
]);

export function compareCodePoints(left: string, right: string): number {
  const leftPoints = Array.from(
    left,
    (character) => character.codePointAt(0) ?? 0,
  );
  const rightPoints = Array.from(
    right,
    (character) => character.codePointAt(0) ?? 0,
  );
  const length = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < length; index += 1) {
    const difference = leftPoints[index] - rightPoints[index];
    if (difference !== 0) return difference;
  }

  return leftPoints.length - rightPoints.length;
}

function compareNumbers(left: number, right: number): number {
  return left - right;
}

function compareIdentities(
  left: SeoBaselineIdentity,
  right: SeoBaselineIdentity,
): number {
  return (
    compareCodePoints(left.contentId, right.contentId) ||
    compareCodePoints(left.slug, right.slug) ||
    compareCodePoints(left.route, right.route)
  );
}

function compareIssues<Category extends string>(
  left: SeoGovernanceIssue<Category>,
  right: SeoGovernanceIssue<Category>,
): number {
  return (
    compareCodePoints(left.category, right.category) ||
    compareCodePoints(left.code, right.code) ||
    compareCodePoints(left.subject, right.subject) ||
    compareCodePoints(left.message, right.message)
  );
}

function sortUniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareCodePoints);
}

function sortAndDedupeIssues<Category extends string>(
  issues: readonly SeoGovernanceIssue<Category>[],
): SeoGovernanceIssue<Category>[] {
  const unique = new Map<string, SeoGovernanceIssue<Category>>();

  for (const issue of issues) {
    const key = [issue.category, issue.code, issue.subject, issue.message].join(
      "\u0000",
    );
    unique.set(key, issue);
  }

  return [...unique.values()].sort(compareIssues);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function detectUnsafeKinds(value: string): string[] {
  const kinds: string[] = [];

  for (const rule of UNSAFE_RULES) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(value)) kinds.push(rule.kind);
  }

  return sortUniqueStrings(kinds);
}

function redactUnsafeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return detectUnsafeKinds(value).length > 0 ? "[REDACTED]" : value;
  }
  if (Array.isArray(value)) return value.map(redactUnsafeValue);
  if (!isPlainObject(value)) return value;

  const redacted: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    redacted[key] = redactUnsafeValue(value[key]);
  }
  return redacted;
}

function canonicalizeJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalizeJson);
  if (!isPlainObject(value)) return value;

  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort(compareCodePoints)) {
    sorted[key] = canonicalizeJson(value[key]);
  }
  return sorted;
}

const JSON_PRINT_WIDTH = 80;

function isJsonPrimitiveLiteral(value: string): boolean {
  try {
    const parsed: unknown = JSON.parse(value);
    return (
      parsed === null ||
      typeof parsed === "string" ||
      typeof parsed === "number" ||
      typeof parsed === "boolean"
    );
  } catch {
    return false;
  }
}

/**
 * JSON.stringify expands every non-empty array. Prettier's JSON formatter
 * keeps short primitive arrays on one line, so collapse exactly those groups
 * when the complete line fits its default print width. The transformation is
 * byte-stable and does not depend on a locale or installed formatter version.
 */
function collapseShortPrimitiveArrays(value: string): string {
  const lines = value.split("\n");
  const formatted: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const opening = /^(\s*)(.*)\[$/u.exec(line);
    if (!opening) {
      formatted.push(line);
      continue;
    }

    const indent = opening[1];
    const itemIndent = `${indent}  `;
    const items: string[] = [];
    let closingIndex: number | undefined;
    let closingSuffix = "";

    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const candidate = lines[cursor];
      if (candidate === `${indent}]` || candidate === `${indent}],`) {
        closingIndex = cursor;
        closingSuffix = candidate.endsWith(",") ? "," : "";
        break;
      }
      if (!candidate.startsWith(itemIndent)) break;

      const itemWithSeparator = candidate.slice(itemIndent.length);
      const item = itemWithSeparator.endsWith(",")
        ? itemWithSeparator.slice(0, -1)
        : itemWithSeparator;
      if (!isJsonPrimitiveLiteral(item)) break;
      items.push(item);
    }

    if (closingIndex !== undefined && items.length > 0) {
      const collapsed = `${indent}${opening[2]}[${items.join(", ")}]${closingSuffix}`;
      if (Array.from(collapsed).length <= JSON_PRINT_WIDTH) {
        formatted.push(collapsed);
        index = closingIndex;
        continue;
      }
    }

    formatted.push(line);
  }

  return formatted.join("\n");
}

export function stableJson(value: unknown): string {
  const canonical = canonicalizeJson(redactUnsafeValue(value));
  return `${collapseShortPrimitiveArrays(JSON.stringify(canonical, null, 2))}\n`;
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

function relativePath(rootDir: string, absolutePath: string): string {
  return toPosixPath(path.relative(rootDir, absolutePath));
}

function resolveInsideRoot(
  rootDir: string,
  configuredPath: string | undefined,
  fallbackRelativePath: string,
): string {
  const absolutePath = path.resolve(
    rootDir,
    configuredPath ?? fallbackRelativePath,
  );
  const relative = path.relative(rootDir, absolutePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new TypeError(
      "SEO governance input paths must remain inside rootDir.",
    );
  }

  return absolutePath;
}

function isValidCalendarDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const monthLengths = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
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
  return day <= monthLengths[month - 1];
}

function hasField(data: Record<string, unknown>, field: string): boolean {
  return (
    Object.prototype.hasOwnProperty.call(data, field) &&
    data[field] !== undefined
  );
}

function normalizeDeclaredRoute(value: unknown, fileRoute: string): string {
  if (typeof value !== "string" || value.trim().length === 0) return fileRoute;
  const trimmed = value.trim();
  if (trimmed.startsWith("/article/")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/article/${trimmed}`;
}

function extractInternalLinks(body: string): string[] {
  const links: string[] = [];
  const markdownLink = /\]\((\/[A-Za-z0-9][^\s)#?]*)(?:[?#][^\s)]*)?\)/gu;
  let match: RegExpExecArray | null;

  while ((match = markdownLink.exec(body)) !== null) {
    links.push(match[1]);
  }

  return sortUniqueStrings(links);
}

function makeIssue<Category extends string>(
  category: Category,
  code: string,
  subject: string,
  message: string,
): SeoGovernanceIssue<Category> {
  return { category, code, subject, message };
}

function collectUnsafeIssues(
  source: string,
  subject: string,
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[],
): void {
  for (const kind of detectUnsafeKinds(source)) {
    hardFailures.push(
      makeIssue(
        "unsafe-disclosure",
        "UNSAFE_DISCLOSURE_DETECTED",
        `${subject}#${kind}`,
        "Potential non-public information was detected and redacted.",
      ),
    );
  }
}

function readArticles(
  rootDir: string,
  blogDir: string,
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[],
): InternalArticle[] {
  if (!fs.existsSync(blogDir) || !fs.statSync(blogDir).isDirectory()) {
    hardFailures.push(
      makeIssue(
        "schema",
        "ARTICLE_DIRECTORY_MISSING",
        relativePath(rootDir, blogDir),
        "The governed article directory is missing.",
      ),
    );
    return [];
  }

  const filenames = fs
    .readdirSync(blogDir)
    .filter((filename) => filename.endsWith(".mdx"))
    .sort(compareCodePoints);
  const articles: InternalArticle[] = [];

  for (const filename of filenames) {
    const absolutePath = path.join(blogDir, filename);
    const sourcePath = relativePath(rootDir, absolutePath);
    const slug = filename.slice(0, -4);
    const route = articleRoutePath(slug);
    const source = fs.readFileSync(absolutePath, "utf8");
    collectUnsafeIssues(source, sourcePath, hardFailures);

    let raw: Record<string, unknown> = {};
    let body = source;
    let parsed: NormalizedArticleFrontmatter | null = null;
    let warnings: ArticleCompatibilityWarning[] = [];

    try {
      const document = matter(source);
      raw = document.data as Record<string, unknown>;
      body = document.content;
      const validation = parseArticleFrontmatter(raw, slug, "compatibility");
      parsed = validation.frontmatter;
      warnings = validation.warnings;
    } catch (error) {
      hardFailures.push(
        makeIssue(
          "schema",
          "ARTICLE_SCHEMA_INVALID",
          sourcePath,
          error instanceof ArticleValidationError
            ? "Article frontmatter does not satisfy the governed schema."
            : "Article source could not be parsed safely.",
        ),
      );
    }

    const missingGovernedFields = ARTICLE_GOVERNED_FIELDS.filter(
      (field) => !hasField(raw, field),
    );
    const contentId =
      typeof raw.contentId === "string" && raw.contentId.trim().length > 0
        ? raw.contentId.trim()
        : (parsed?.contentId ?? deriveContentId(slug));

    articles.push({
      absolutePath,
      sourcePath,
      source,
      body,
      raw,
      slug,
      route,
      declaredRoute: normalizeDeclaredRoute(raw.slug, route),
      contentId,
      migrated: hasField(raw, "migrationAction"),
      parsed,
      warnings,
      missingGovernedFields: [...missingGovernedFields].sort(compareCodePoints),
      links: extractInternalLinks(body),
    });
  }

  return articles.sort((left, right) =>
    compareCodePoints(left.slug, right.slug),
  );
}

function countValues(values: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function identityKey(identity: SeoBaselineIdentity): string {
  return [identity.contentId, identity.slug, identity.route].join("\u0000");
}

function identityDisplayValue(identity: SeoBaselineIdentity): string {
  return `${identity.contentId}|${identity.slug}|${identity.route}`;
}

function duplicateIdentityValues(
  identities: readonly SeoBaselineIdentity[],
): SeoBaselineDuplicate[] {
  const identityByKey = new Map<string, SeoBaselineIdentity>();
  for (const identity of identities) {
    identityByKey.set(identityKey(identity), identity);
  }
  return [...countValues(identities.map(identityKey)).entries()]
    .filter(([, occurrences]) => occurrences > 1)
    .map(([key, occurrences]) => ({
      field: "identity" as const,
      value: identityDisplayValue(
        identityByKey.get(key) as SeoBaselineIdentity,
      ),
      occurrences,
    }))
    .sort(
      (left, right) =>
        compareCodePoints(left.field, right.field) ||
        compareCodePoints(left.value, right.value) ||
        compareNumbers(left.occurrences, right.occurrences),
    );
}

function duplicateValues(
  field: SeoBaselineDuplicate["field"],
  values: readonly string[],
): SeoBaselineDuplicate[] {
  return [...countValues(values).entries()]
    .filter(([, occurrences]) => occurrences > 1)
    .map(([value, occurrences]) => ({ field, value, occurrences }))
    .sort(
      (left, right) =>
        compareCodePoints(left.field, right.field) ||
        compareCodePoints(left.value, right.value) ||
        compareNumbers(left.occurrences, right.occurrences),
    );
}

function buildBaselineReport(
  expectedInput: readonly SeoBaselineIdentity[],
  articles: readonly InternalArticle[],
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[],
): SeoBaselineReport {
  const expected = expectedInput
    .map((identity) => ({ ...identity }))
    .sort(compareIdentities);
  const actual = articles
    .map((article) => ({
      contentId: article.contentId,
      slug: article.slug,
      route: article.route,
    }))
    .sort(compareIdentities);
  const expectedCounts = countValues(expected.map(identityKey));
  const actualCounts = countValues(actual.map(identityKey));

  const missing: SeoBaselineIdentity[] = [];
  for (const identity of expected) {
    const key = identityKey(identity);
    const available = actualCounts.get(key) ?? 0;
    const required = expectedCounts.get(key) ?? 0;
    if (
      available < required &&
      !missing.some((entry) => identityKey(entry) === key)
    ) {
      missing.push({ ...identity });
    }
  }

  const expectedKeys = new Set(expected.map(identityKey));
  const unexpected: SeoBaselineIdentity[] = [];
  for (const identity of actual) {
    const key = identityKey(identity);
    if (
      !expectedKeys.has(key) ||
      (actualCounts.get(key) ?? 0) > (expectedCounts.get(key) ?? 0)
    ) {
      unexpected.push({ ...identity });
    }
  }

  const expectedIdentityDuplicates = duplicateIdentityValues(expected);
  const actualDuplicates = [
    ...duplicateIdentityValues(actual),
    ...duplicateValues(
      "contentId",
      articles.map((article) => article.contentId),
    ),
    ...duplicateValues(
      "slug",
      articles.map((article) =>
        article.declaredRoute.replace(/^\/article\//, ""),
      ),
    ),
    ...duplicateValues(
      "route",
      articles.map((article) => article.declaredRoute),
    ),
  ].sort(
    (left, right) =>
      compareCodePoints(left.field, right.field) ||
      compareCodePoints(left.value, right.value),
  );

  for (const duplicate of expectedIdentityDuplicates) {
    hardFailures.push(
      makeIssue(
        "duplicate-identity",
        "BASELINE_IDENTITY_DUPLICATE",
        `${duplicate.field}:${duplicate.value}`,
        "The frozen baseline manifest contains a duplicate identity.",
      ),
    );
  }
  for (const identity of missing) {
    hardFailures.push(
      makeIssue(
        "duplicate-identity",
        "BASELINE_IDENTITY_MISSING",
        `${identity.contentId}|${identity.slug}|${identity.route}`,
        "An expected frozen article identity is missing.",
      ),
    );
  }
  for (const identity of unexpected) {
    hardFailures.push(
      makeIssue(
        "duplicate-identity",
        "BASELINE_IDENTITY_UNEXPECTED",
        `${identity.contentId}|${identity.slug}|${identity.route}`,
        "An unexpected article identity is present in the governed cohort.",
      ),
    );
  }
  for (const duplicate of actualDuplicates) {
    const code =
      duplicate.field === "contentId"
        ? "CONTENT_ID_DUPLICATE"
        : duplicate.field === "slug"
          ? "SLUG_DUPLICATE"
          : duplicate.field === "route"
            ? "ROUTE_DUPLICATE"
            : "ARTICLE_IDENTITY_DUPLICATE";
    hardFailures.push(
      makeIssue(
        "duplicate-identity",
        code,
        `${duplicate.field}:${duplicate.value}`,
        "An article identity value occurs more than once.",
      ),
    );
  }

  const duplicates = [...expectedIdentityDuplicates, ...actualDuplicates].sort(
    (left, right) =>
      compareCodePoints(left.field, right.field) ||
      compareCodePoints(left.value, right.value),
  );
  const exact =
    expected.length === actual.length &&
    missing.length === 0 &&
    unexpected.length === 0 &&
    duplicates.length === 0;

  return {
    status: exact ? "exact" : "mismatch",
    expectedCount: expected.length,
    actualCount: actual.length,
    identities: expected,
    expected,
    actual,
    missing: missing.sort(compareIdentities),
    unexpected: unexpected.sort(compareIdentities),
    duplicates,
  };
}

function parseRegistry(
  input: unknown,
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[],
): ClusterRegistry {
  if (input === undefined) return defaultClusterRegistry;

  try {
    return parseClusterRegistry(input);
  } catch {
    hardFailures.push(
      makeIssue(
        "schema",
        "CLUSTER_SCHEMA_INVALID",
        "content/seo/clusters.ts",
        "The cluster registry does not satisfy the canonical schema.",
      ),
    );
    return defaultClusterRegistry;
  }
}

function emptyEvidenceRegistry(): EvidenceRegistry {
  return Object.freeze({
    version: 1,
    evidence: Object.freeze([]),
  }) as EvidenceRegistry;
}

function readEvidenceRegistry(
  rootDir: string,
  sourceOverride: string | undefined,
  registryPath: string,
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[],
): { registry: EvidenceRegistry; source: string } {
  let source = sourceOverride;

  if (source === undefined) {
    if (!fs.existsSync(registryPath)) {
      hardFailures.push(
        makeIssue(
          "schema",
          "EVIDENCE_REGISTRY_MISSING",
          relativePath(rootDir, registryPath),
          "The evidence registry is missing.",
        ),
      );
      return { registry: emptyEvidenceRegistry(), source: "" };
    }
    source = fs.readFileSync(registryPath, "utf8");
  }

  collectUnsafeIssues(
    source,
    relativePath(rootDir, registryPath),
    hardFailures,
  );

  try {
    return {
      registry: parseEvidenceRegistryYaml(
        source,
        relativePath(rootDir, registryPath),
      ),
      source,
    };
  } catch {
    hardFailures.push(
      makeIssue(
        "schema",
        "EVIDENCE_SCHEMA_INVALID",
        relativePath(rootDir, registryPath),
        "The evidence registry does not satisfy the governed schema.",
      ),
    );
    return { registry: emptyEvidenceRegistry(), source };
  }
}

function validateGovernedFields(
  articles: readonly InternalArticle[],
  mode: SeoGovernanceBuildOptions["mode"],
  strictScope: SeoStrictScope,
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[],
  advisoryWarnings: SeoGovernanceIssue<SeoAdvisoryCategory>[],
): void {
  for (const article of articles) {
    const strictArticle = strictScope === "all" || article.migrated;

    for (const field of article.missingGovernedFields) {
      const subject = `${article.contentId}.${field}`;
      if (mode === "strict" && strictArticle) {
        hardFailures.push(
          makeIssue(
            "schema",
            "GOVERNED_FIELD_REQUIRED",
            subject,
            "A canonical governed field is required for this strict cohort article.",
          ),
        );
      } else {
        advisoryWarnings.push(
          makeIssue(
            "compatibility",
            "GOVERNED_FIELD_MISSING",
            subject,
            "A canonical governed field remains pending migration.",
          ),
        );
      }
    }
  }
}

function evidenceIssueCode(status: string): string | null {
  if (status === "expired") return "EVIDENCE_EXPIRED";
  if (status === "unsupported") return "EVIDENCE_UNSUPPORTED";
  if (status === "restricted") return "EVIDENCE_RESTRICTED";
  return null;
}

function validateArticleEvidence(
  articles: readonly InternalArticle[],
  registry: EvidenceRegistry,
  asOfDate: string,
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[],
): void {
  const evidenceById = new Map<string, EvidenceRecord>(
    registry.evidence.map((record) => [record.id, record]),
  );

  for (const article of articles) {
    const evidenceIds = Array.isArray(article.raw.evidenceIds)
      ? article.raw.evidenceIds.filter(
          (value): value is string => typeof value === "string",
        )
      : (article.parsed?.evidenceIds ?? []);

    for (const evidenceId of sortUniqueStrings(evidenceIds)) {
      const record = evidenceById.get(evidenceId);
      if (!record) {
        hardFailures.push(
          makeIssue(
            "evidence",
            "EVIDENCE_REFERENCE_MISSING",
            `${article.contentId}.${evidenceId}`,
            "An article references evidence that is not present in the registry.",
          ),
        );
        continue;
      }

      const code = evidenceIssueCode(evaluateEvidenceStatus(record, asOfDate));
      if (code) {
        hardFailures.push(
          makeIssue(
            "evidence",
            code,
            `${article.contentId}.${evidenceId}`,
            "Referenced evidence is not publishable for the explicit as-of date.",
          ),
        );
      }
    }

    const reviewDueDate =
      typeof article.raw.reviewDueDate === "string"
        ? article.raw.reviewDueDate
        : article.parsed?.reviewDueDate;
    if (typeof reviewDueDate === "string" && asOfDate > reviewDueDate) {
      hardFailures.push(
        makeIssue(
          "evidence",
          "ARTICLE_REVIEW_EXPIRED",
          article.contentId,
          "The article review window has expired for the explicit as-of date.",
        ),
      );
    }
  }
}

function listYamlFiles(directory: string): string[] {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory())
    return [];
  return fs
    .readdirSync(directory)
    .filter((filename) => /\.ya?ml$/u.test(filename))
    .sort(compareCodePoints);
}

function validateClaimEvidence(
  rootDir: string,
  articles: readonly InternalArticle[],
  claimsDir: string,
  reviewsDir: string,
  registry: EvidenceRegistry,
  asOfDate: string,
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[],
): void {
  const articlesByPath = new Map(
    articles.map((article) => [article.sourcePath, article]),
  );

  for (const filename of listYamlFiles(claimsDir)) {
    const claimPath = path.join(claimsDir, filename);
    const reviewPath = path.join(reviewsDir, filename);
    const claimSubject = relativePath(rootDir, claimPath);
    const claimSource = fs.readFileSync(claimPath, "utf8");
    collectUnsafeIssues(claimSource, claimSubject, hardFailures);

    if (!fs.existsSync(reviewPath)) {
      hardFailures.push(
        makeIssue(
          "evidence",
          "EVIDENCE_REVIEW_MISSING",
          claimSubject,
          "A claim manifest is missing its review decision.",
        ),
      );
      continue;
    }

    const reviewSubject = relativePath(rootDir, reviewPath);
    const reviewSource = fs.readFileSync(reviewPath, "utf8");
    collectUnsafeIssues(reviewSource, reviewSubject, hardFailures);

    try {
      const claimManifest = parseEvidenceClaimManifestYaml(
        claimSource,
        claimSubject,
      );
      const reviewDecision = parseEvidenceReviewDecisionYaml(
        reviewSource,
        reviewSubject,
      );
      const article = articlesByPath.get(claimManifest.articlePath);

      if (!article) {
        hardFailures.push(
          makeIssue(
            "evidence",
            "EVIDENCE_ARTICLE_MISSING",
            claimManifest.articleId,
            "The reviewed claim manifest does not resolve to a governed article.",
          ),
        );
        continue;
      }

      const report = runEvidenceGate({
        articleSource: article.source,
        claimManifestSource: claimSource,
        registry,
        claimManifest,
        reviewDecision,
        asOfDate,
      });

      for (const issue of report.issues) {
        hardFailures.push(
          makeIssue(
            "evidence",
            issue.code,
            [issue.articleId, issue.claimId, issue.evidenceId, issue.field]
              .filter((value): value is string => Boolean(value))
              .join("."),
            issue.reason,
          ),
        );
      }
    } catch {
      hardFailures.push(
        makeIssue(
          "evidence",
          "EVIDENCE_GATE_INVALID",
          claimSubject,
          "Claim-level evidence governance could not be evaluated.",
        ),
      );
    }
  }
}

function validateGraph(
  articles: readonly InternalArticle[],
  registry: ClusterRegistry,
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[],
  advisoryWarnings: SeoGovernanceIssue<SeoAdvisoryCategory>[],
): void {
  const governed = articles.filter(
    (article) => article.migrated && article.parsed,
  );
  const allByRoute = new Map(
    articles.map((article) => [article.route, article]),
  );
  const commercialRoots = new Set(
    registry.clusters.map((cluster) => cluster.commercialRoot),
  );
  const clustersById = new Map(
    registry.clusters.map((cluster) => [cluster.id, cluster]),
  );

  for (const article of governed) {
    const frontmatter = article.parsed as NormalizedArticleFrontmatter;
    const cluster = frontmatter.cluster
      ? clustersById.get(frontmatter.cluster)
      : undefined;
    const commercialRoot = frontmatter.commercialRoot;
    const editorialPillar = frontmatter.editorialPillar;
    const requiredLinks = sortUniqueStrings(frontmatter.requiredLinks ?? []);

    if (!commercialRoot) {
      hardFailures.push(
        makeIssue(
          "graph",
          "COMMERCIAL_ROOT_MISSING",
          article.contentId,
          "A migrated article is missing its commercial root.",
        ),
      );
    } else if (cluster && commercialRoot !== cluster.commercialRoot) {
      hardFailures.push(
        makeIssue(
          "graph",
          "COMMERCIAL_ROOT_MISMATCH",
          article.contentId,
          "The article commercial root does not match its cluster.",
        ),
      );
    }

    if (frontmatter.contentRole !== "pillar") {
      if (!editorialPillar) {
        hardFailures.push(
          makeIssue(
            "graph",
            "EDITORIAL_PILLAR_MISSING",
            article.contentId,
            "A migrated supporting article is missing its editorial pillar.",
          ),
        );
      } else if (!allByRoute.has(editorialPillar)) {
        hardFailures.push(
          makeIssue(
            "graph",
            "EDITORIAL_PILLAR_BROKEN",
            article.contentId,
            "The declared editorial pillar route does not resolve.",
          ),
        );
      }
    }

    const expectedRequiredLinks = [
      ...(commercialRoot ? [commercialRoot] : []),
      ...(frontmatter.contentRole !== "pillar" && editorialPillar
        ? [editorialPillar]
        : []),
    ];
    for (const expectedLink of sortUniqueStrings(expectedRequiredLinks)) {
      if (!requiredLinks.includes(expectedLink)) {
        hardFailures.push(
          makeIssue(
            "graph",
            "REQUIRED_LINK_MISSING",
            `${article.contentId}.${expectedLink}`,
            "The required link declaration is incomplete.",
          ),
        );
      }
    }

    for (const requiredLink of requiredLinks) {
      if (!article.links.includes(requiredLink)) {
        advisoryWarnings.push(
          makeIssue(
            "migration",
            "REQUIRED_LINK_NOT_OBSERVED",
            `${article.contentId}.${requiredLink}`,
            "A declared required link is not present in the article body.",
          ),
        );
      }
    }

    for (const link of article.links.filter((value) =>
      value.startsWith("/article/"),
    )) {
      const target = allByRoute.get(link);
      if (!target) {
        hardFailures.push(
          makeIssue(
            "graph",
            "BROKEN_INTERNAL_LINK",
            `${article.contentId}.${link}`,
            "An internal article link does not resolve.",
          ),
        );
      } else if (
        target.parsed?.cluster &&
        frontmatter.cluster &&
        target.parsed.cluster !== frontmatter.cluster
      ) {
        hardFailures.push(
          makeIssue(
            "graph",
            "UNSUPPORTED_CROSS_CLUSTER_LINK",
            `${article.contentId}.${link}`,
            "A migrated article links to an unsupported editorial cluster.",
          ),
        );
      }
    }

    const connected = article.links.some(
      (link) => commercialRoots.has(link) || allByRoute.has(link),
    );
    if (!connected) {
      hardFailures.push(
        makeIssue(
          "graph",
          "ARTICLE_ORPHANED",
          article.contentId,
          "A migrated article has no governed internal connection.",
        ),
      );
    }
  }

  const clusterIds = sortUniqueStrings(
    governed.flatMap((article) =>
      article.parsed?.cluster ? [article.parsed.cluster] : [],
    ),
  );
  for (const clusterId of clusterIds) {
    const clusterArticles = governed.filter(
      (article) => article.parsed?.cluster === clusterId,
    );
    const pillars = clusterArticles.filter(
      (article) => article.parsed?.contentRole === "pillar",
    );
    if (pillars.length > 1) {
      hardFailures.push(
        makeIssue(
          "graph",
          "EDITORIAL_PILLAR_DUPLICATE",
          clusterId,
          "A cluster has more than one migrated pillar article.",
        ),
      );
    }

    const declaredPillars = sortUniqueStrings(
      clusterArticles.flatMap((article) =>
        article.parsed?.editorialPillar ? [article.parsed.editorialPillar] : [],
      ),
    );
    if (declaredPillars.length > 1) {
      hardFailures.push(
        makeIssue(
          "graph",
          "EDITORIAL_PILLAR_CONFLICT",
          clusterId,
          "Articles in one cluster declare conflicting editorial pillars.",
        ),
      );
    }

    const keywordOwners = new Map<string, string[]>();
    for (const article of clusterArticles) {
      const keyword = article.parsed?.primaryKeyword?.trim().toLowerCase();
      if (!keyword) continue;
      const owners = keywordOwners.get(keyword) ?? [];
      owners.push(article.contentId);
      keywordOwners.set(keyword, owners);
    }
    for (const [keyword, owners] of keywordOwners) {
      if (owners.length > 1) {
        hardFailures.push(
          makeIssue(
            "graph",
            "KEYWORD_CANNIBALISATION",
            `${clusterId}.${keyword}`,
            "Multiple migrated articles target the same primary keyword.",
          ),
        );
      }
    }
  }
}

function compatibilityReport(
  articles: readonly InternalArticle[],
  baseline: SeoBaselineReport,
  strictScope: SeoStrictScope,
): SeoCompatibilityReport {
  const reports: SeoCompatibilityArticleReport[] = articles
    .map((article) => {
      const warningCodes = sortUniqueStrings([
        ...article.warnings.map((warning) => warning.code),
        ...(article.missingGovernedFields.length > 0
          ? ["missing_governed_field"]
          : []),
      ]);
      return {
        contentId: article.contentId,
        slug: article.slug,
        route: article.route,
        migrated: article.migrated,
        mode:
          article.missingGovernedFields.length === 0
            ? ("governed" as const)
            : ("compatibility" as const),
        missingGovernedFields: article.missingGovernedFields,
        warningCodes,
      };
    })
    .sort(compareIdentities);

  return {
    articleCount: reports.length,
    governedArticleCount: reports.filter(
      (article) => article.mode === "governed",
    ).length,
    compatibilityArticleCount: reports.filter(
      (article) => article.mode === "compatibility",
    ).length,
    strictArticleCount:
      strictScope === "all"
        ? reports.length
        : reports.filter((article) => article.migrated).length,
    baseline,
    articles: reports,
  };
}

function nullable<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

function articleArtifact(articles: readonly InternalArticle[]): unknown {
  return {
    version: 1,
    articles: articles.map((article) => {
      const frontmatter = article.parsed;
      return {
        contentId: article.contentId,
        slug: article.slug,
        route: article.route,
        canonical: articleCanonicalUrl(article.slug),
        sourcePath: article.sourcePath,
        title: frontmatter?.title ?? null,
        description: frontmatter?.description ?? null,
        category: frontmatter?.category ?? null,
        author: frontmatter?.author ?? null,
        date: frontmatter?.date ?? null,
        updatedDate: nullable(frontmatter?.updatedDate),
        coverImage: nullable(frontmatter?.coverImage),
        coverImageAlt: nullable(frontmatter?.coverImageAlt),
        cluster: nullable(frontmatter?.cluster),
        contentRole: nullable(frontmatter?.contentRole),
        searchIntent: nullable(frontmatter?.searchIntent),
        funnelStage: nullable(frontmatter?.funnelStage),
        primaryKeyword: nullable(frontmatter?.primaryKeyword),
        secondaryKeywords: sortUniqueStrings(
          frontmatter?.secondaryKeywords ?? [],
        ),
        targetMarket: nullable(frontmatter?.targetMarket),
        editorialStatus: nullable(frontmatter?.editorialStatus),
        evidenceIds: sortUniqueStrings(frontmatter?.evidenceIds ?? []),
        firstPartyContributionId: nullable(
          frontmatter?.firstPartyContributionId,
        ),
        commercialRoot: nullable(frontmatter?.commercialRoot),
        editorialPillar: nullable(frontmatter?.editorialPillar),
        requiredLinks: sortUniqueStrings(frontmatter?.requiredLinks ?? []),
        reviewedBy: nullable(frontmatter?.reviewedBy),
        reviewedDate: nullable(frontmatter?.reviewedDate),
        reviewDueDate: nullable(frontmatter?.reviewDueDate),
        migrationAction: nullable(frontmatter?.migrationAction),
        migrated: article.migrated,
      };
    }),
  };
}

function clusterArtifact(
  registry: ClusterRegistry,
  articles: readonly InternalArticle[],
): unknown {
  return {
    version: 1,
    clusters: registry.clusters.map((cluster) => ({
      id: cluster.id,
      label: cluster.label,
      priority: cluster.priority,
      commercialRoot: cluster.commercialRoot,
      commercialService: cluster.commercialService,
      editorialPillar: cluster.editorialPillar,
      targetMarkets: [...cluster.targetMarkets].sort(compareCodePoints),
      funnelStages: [...cluster.funnelStages].sort(compareCodePoints),
      allowedRoles: [...cluster.allowedRoles].sort(compareCodePoints),
      intentFamilies: [...cluster.intentFamilies].sort(compareCodePoints),
      reviewOwner: cluster.reviewOwner,
      navigation: cluster.navigation,
      articleIds: articles
        .filter((article) => article.parsed?.cluster === cluster.id)
        .map((article) => article.contentId)
        .sort(compareCodePoints),
    })),
  };
}

function linkGraphArtifact(
  registry: ClusterRegistry,
  articles: readonly InternalArticle[],
): unknown {
  const knownRoutes = new Set([
    ...articles.map((article) => article.route),
    ...registry.clusters.map((cluster) => cluster.commercialRoot),
  ]);
  const nodes = [
    ...registry.clusters.map((cluster) => ({
      id: `commercial.${cluster.id}`,
      kind: "commercial",
      route: cluster.commercialRoot,
      cluster: cluster.id,
    })),
    ...articles.map((article) => ({
      id: article.contentId,
      kind: "article",
      route: article.route,
      cluster: nullable(article.parsed?.cluster),
    })),
  ].sort(
    (left, right) =>
      compareCodePoints(left.route, right.route) ||
      compareCodePoints(left.id, right.id),
  );
  const edges = articles
    .flatMap((article) =>
      article.links
        .filter((route) => knownRoutes.has(route))
        .map((route) => ({ from: article.route, to: route })),
    )
    .sort(
      (left, right) =>
        compareCodePoints(left.from, right.from) ||
        compareCodePoints(left.to, right.to),
    );

  return { version: 1, nodes, edges };
}

function freshnessArtifact(
  articles: readonly InternalArticle[],
  registry: EvidenceRegistry,
  asOfDate: string,
): unknown {
  return {
    version: 1,
    asOfDate,
    articles: articles
      .filter(
        (article) =>
          article.parsed?.reviewedDate !== undefined ||
          article.parsed?.reviewDueDate !== undefined,
      )
      .map((article) => ({
        contentId: article.contentId,
        reviewedDate: nullable(article.parsed?.reviewedDate),
        reviewDueDate: nullable(article.parsed?.reviewDueDate),
        status:
          article.parsed?.reviewDueDate &&
          asOfDate > article.parsed.reviewDueDate
            ? "expired"
            : "current",
      }))
      .sort((left, right) =>
        compareCodePoints(left.contentId, right.contentId),
      ),
    evidence: registry.evidence
      .map((record) => ({
        evidenceId: record.id,
        capturedDate: record.capturedDate,
        reviewDueDate: record.reviewDueDate,
        status: evaluateEvidenceStatus(record, asOfDate),
      }))
      .sort((left, right) =>
        compareCodePoints(left.evidenceId, right.evidenceId),
      ),
  };
}

function createArtifacts(
  articles: readonly InternalArticle[],
  registry: ClusterRegistry,
  evidenceRegistry: EvidenceRegistry,
  asOfDate: string,
): Readonly<Record<SeoArtifactName, string>> {
  return Object.freeze({
    "articles.json": stableJson(articleArtifact(articles)),
    "clusters.json": stableJson(clusterArtifact(registry, articles)),
    "link-graph.json": stableJson(linkGraphArtifact(registry, articles)),
    "freshness.json": stableJson(
      freshnessArtifact(articles, evidenceRegistry, asOfDate),
    ),
  });
}

function validateBuildOptions(options: SeoGovernanceBuildOptions): void {
  if (!options.rootDir || typeof options.rootDir !== "string") {
    throw new TypeError("rootDir is required for the SEO governance core API.");
  }
  if (!isValidCalendarDate(options.asOfDate)) {
    throw new TypeError("asOfDate must be a valid YYYY-MM-DD calendar date.");
  }
  if (options.mode !== "compatibility" && options.mode !== "strict") {
    throw new TypeError("mode must be compatibility or strict.");
  }
  if (
    options.strictScope !== undefined &&
    options.strictScope !== "migrated" &&
    options.strictScope !== "all"
  ) {
    throw new TypeError("strictScope must be migrated or all.");
  }
}

export function buildSeoGovernanceArtifacts(
  options: SeoGovernanceBuildOptions,
): SeoGovernanceBuildResult {
  validateBuildOptions(options);
  const rootDir = path.resolve(options.rootDir);
  const strictScope = options.strictScope ?? "migrated";
  const hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[] = [];
  const advisoryWarnings: SeoGovernanceIssue<SeoAdvisoryCategory>[] = [];
  const blogDir = resolveInsideRoot(
    rootDir,
    options.blogDir,
    DEFAULT_BLOG_RELATIVE_DIR,
  );
  const registryPath = resolveInsideRoot(
    rootDir,
    options.evidenceRegistryPath,
    DEFAULT_EVIDENCE_REGISTRY_RELATIVE_PATH,
  );
  const claimsDir = resolveInsideRoot(
    rootDir,
    options.evidenceClaimsDir,
    DEFAULT_EVIDENCE_CLAIMS_RELATIVE_DIR,
  );
  const reviewsDir = resolveInsideRoot(
    rootDir,
    options.evidenceReviewsDir,
    DEFAULT_EVIDENCE_REVIEWS_RELATIVE_DIR,
  );
  const registry = parseRegistry(options.clusterRegistryInput, hardFailures);
  const articles = readArticles(rootDir, blogDir, hardFailures);
  const evidence = readEvidenceRegistry(
    rootDir,
    options.evidenceRegistrySource,
    registryPath,
    hardFailures,
  );
  const baseline = buildBaselineReport(
    options.baselineCohort ?? SEO_BASELINE_COHORT,
    articles,
    hardFailures,
  );

  validateGovernedFields(
    articles,
    options.mode,
    strictScope,
    hardFailures,
    advisoryWarnings,
  );
  validateArticleEvidence(
    articles,
    evidence.registry,
    options.asOfDate,
    hardFailures,
  );
  validateClaimEvidence(
    rootDir,
    articles,
    claimsDir,
    reviewsDir,
    evidence.registry,
    options.asOfDate,
    hardFailures,
  );
  validateGraph(articles, registry, hardFailures, advisoryWarnings);

  const sortedHardFailures = sortAndDedupeIssues(hardFailures);
  const sortedAdvisoryWarnings = sortAndDedupeIssues(advisoryWarnings);
  const result: SeoGovernanceBuildResult = {
    protocolVersion: SEO_GOVERNANCE_PROTOCOL_VERSION,
    mode: options.mode,
    strictScope,
    asOfDate: options.asOfDate,
    artifacts: createArtifacts(
      articles,
      registry,
      evidence.registry,
      options.asOfDate,
    ),
    compatibilityReport: compatibilityReport(articles, baseline, strictScope),
    validation: {
      status: sortedHardFailures.length === 0 ? "passed" : "failed",
      hardFailures: sortedHardFailures,
      advisoryWarnings: sortedAdvisoryWarnings,
    },
  };

  return redactUnsafeValue(result) as SeoGovernanceBuildResult;
}

function artifactDirectory(rootDir: string): string {
  return path.join(rootDir, ...SEO_GENERATED_RELATIVE_DIR.split("/"));
}

function inspectArtifacts(
  rootDir: string,
  artifacts: Readonly<Record<SeoArtifactName, string>>,
): SeoArtifactCheck[] {
  const directory = artifactDirectory(rootDir);
  const checks: SeoArtifactCheck[] = [];
  const existingNames =
    fs.existsSync(directory) && fs.statSync(directory).isDirectory()
      ? fs.readdirSync(directory).sort(compareCodePoints)
      : [];
  const existingSet = new Set(existingNames);

  for (const name of SEO_ARTIFACT_NAMES) {
    const filePath = path.join(directory, name);
    if (!existingSet.has(name) || !fs.existsSync(filePath)) {
      checks.push({ name, status: "missing" });
      continue;
    }
    if (!fs.statSync(filePath).isFile()) {
      checks.push({ name, status: "modified" });
      continue;
    }
    const actual = fs.readFileSync(filePath, "utf8");
    checks.push({
      name,
      status: actual === artifacts[name] ? "current" : "modified",
    });
  }

  for (const name of existingNames) {
    if (!(SEO_ARTIFACT_NAMES as readonly string[]).includes(name)) {
      checks.push({ name, status: "unexpected" });
    }
  }

  return checks;
}

function artifactIssues(
  checks: readonly SeoArtifactCheck[],
  operation: "check" | "write",
): SeoGovernanceIssue<SeoHardFailureCategory>[] {
  const issues: SeoGovernanceIssue<SeoHardFailureCategory>[] = [];
  for (const check of checks) {
    if (operation === "write" && check.status !== "unexpected") continue;
    if (check.status === "current" || check.status === "written") continue;

    const code =
      check.status === "missing"
        ? "ARTIFACT_MISSING"
        : check.status === "modified"
          ? "ARTIFACT_MODIFIED"
          : "ARTIFACT_UNEXPECTED";
    issues.push(
      makeIssue(
        "artifact",
        code,
        `${SEO_GENERATED_RELATIVE_DIR}/${check.name}`,
        check.status === "unexpected"
          ? "An unexpected file prevents governed artifact replacement."
          : "The committed artifact set is not current.",
      ),
    );
  }
  return issues;
}

function injectWriteFailpoint(
  active: SeoWriteFailpoint | undefined,
  point: SeoWriteFailpoint,
): void {
  if (active === point)
    throw new Error("Injected SEO governance write failure.");
}

function writeArtifactsTransaction(
  rootDir: string,
  artifacts: Readonly<Record<SeoArtifactName, string>>,
  failpoint: SeoWriteFailpoint | undefined,
): void {
  const target = artifactDirectory(rootDir);
  const parent = path.dirname(target);
  const parentExisted = fs.existsSync(parent);
  fs.mkdirSync(parent, { recursive: true });
  const transactionDir = fs.mkdtempSync(
    path.join(parent, ".seo-governance-transaction-"),
  );
  const stage = path.join(transactionDir, "stage");
  const backup = path.join(transactionDir, "backup");
  const hadTarget = fs.existsSync(target);
  let backedUp = false;
  let promoted = false;

  try {
    fs.mkdirSync(stage);
    for (const name of SEO_ARTIFACT_NAMES) {
      fs.writeFileSync(path.join(stage, name), artifacts[name], "utf8");
    }
    injectWriteFailpoint(failpoint, "after-stage");

    if (hadTarget) {
      fs.renameSync(target, backup);
      backedUp = true;
    }
    injectWriteFailpoint(failpoint, "after-backup");

    fs.renameSync(stage, target);
    promoted = true;
    injectWriteFailpoint(failpoint, "after-promote");

    if (backedUp && fs.existsSync(backup)) {
      fs.rmSync(backup, { recursive: true, force: true });
    }
    fs.rmSync(transactionDir, { recursive: true, force: true });
  } catch (error) {
    if (promoted && fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
    }
    if (backedUp && fs.existsSync(backup)) {
      fs.renameSync(backup, target);
    }
    fs.rmSync(transactionDir, { recursive: true, force: true });
    if (
      !parentExisted &&
      fs.existsSync(parent) &&
      fs.readdirSync(parent).length === 0
    ) {
      fs.rmdirSync(parent);
    }
    throw error;
  }
}

function mergeRunValidation(
  build: SeoGovernanceBuildResult,
  extraIssues: readonly SeoGovernanceIssue<SeoHardFailureCategory>[],
): SeoGovernanceBuildResult["validation"] {
  const hardFailures = sortAndDedupeIssues([
    ...build.validation.hardFailures,
    ...extraIssues,
  ]);
  return {
    status: hardFailures.length === 0 ? "passed" : "failed",
    hardFailures,
    advisoryWarnings: build.validation.advisoryWarnings,
  };
}

export function runSeoGovernance(
  options: SeoGovernanceRunOptions,
): SeoGovernanceRunResult {
  const build = buildSeoGovernanceArtifacts(options);
  const rootDir = path.resolve(options.rootDir);
  const operation = options.write ? "write" : "check";
  const inspected = inspectArtifacts(rootDir, build.artifacts);
  let artifactChecks = inspected;
  const extraIssues = artifactIssues(inspected, operation);
  let validation = mergeRunValidation(build, extraIssues);

  if (operation === "write" && validation.status === "passed") {
    try {
      writeArtifactsTransaction(
        rootDir,
        build.artifacts,
        options.writeFailpoint,
      );
      artifactChecks = SEO_ARTIFACT_NAMES.map((name) => ({
        name,
        status: "written" as const,
      }));
    } catch {
      extraIssues.push(
        makeIssue(
          "artifact",
          "ARTIFACT_WRITE_FAILED",
          SEO_GENERATED_RELATIVE_DIR,
          "The four-artifact transaction failed and was rolled back.",
        ),
      );
      validation = mergeRunValidation(build, extraIssues);
      artifactChecks = inspectArtifacts(rootDir, build.artifacts);
    }
  }

  const result: SeoGovernanceRunResult = {
    ...build,
    operation,
    artifactDirectory: SEO_GENERATED_RELATIVE_DIR,
    artifactChecks,
    validation,
  };
  return redactUnsafeValue(result) as SeoGovernanceRunResult;
}

export function locateSeoProjectRoot(
  startDir = path.resolve(__dirname, "../../.."),
): string {
  let current = path.resolve(startDir);

  while (true) {
    if (
      fs.existsSync(path.join(current, "package.json")) &&
      fs.existsSync(path.join(current, "content", "blog"))
    ) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(
        "Unable to locate the SEO project root from the module seam.",
      );
    }
    current = parent;
  }
}
