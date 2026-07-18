import { CANONICAL_CLUSTER_IDS } from "../clusterSchema";
import { diagnoseGraph } from "../graph/engine";
import type { GraphInput } from "../graph/types";
import {
  digestGraphInput,
  parseGraphInput as parseCanonicalGraphInput,
} from "../graph/canonical";
import { computeMigrationLedgerDigest } from "../migrationLedger";

import {
  GOVERNED_MIGRATION_CLUSTER_IDS,
  type ArticleMigrationPlan,
  MIGRATION_PREVIEW_CONTRACT_ID,
  type ClusterMigrationPreview,
  type GovernedMigrationTicket,
  type MigrationPreviewDiagnostic,
  type PlannedGovernedFrontmatter,
} from "../migrations/clusterMigrationPreview";
import {
  CHINA_SOURCING_OVERLAYS_CLUSTER_ID,
  CHINA_SOURCING_OVERLAYS_MIGRATION_TICKET,
  type ChinaSourcingOverlaysMigrationPreview,
} from "../migrations/overlaysMigrationPreview";
import { SEO_ARTIFACT_NAMES, type SeoArtifactName } from "../generation/types";
import {
  computeStrictCutoverSourceDigest as computeSourceDigest,
  digestStrictCutoverContent,
  digestStrictCutoverValue,
} from "./canonical";
import {
  STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE,
  STRICT_GOVERNANCE_CUTOVER_TICKET,
  STRICT_GOVERNANCE_CUTOVER_VERSION,
  type StrictCutoverDiagnostic,
  type StrictCutoverMode,
  type StrictCutoverOrigin,
  type StrictCutoverLineage,
  type StrictCutoverSourceDigestInput,
  type StrictGovernanceGeneratedArtifact,
  type StrictGovernanceGraphCutoverInput,
  type StrictGovernanceGraphCutoverResult,
} from "./types";

const CUTOVER_INPUT_KEYS = [
  "asOf",
  "mode",
  "origin",
  "public",
  "ledger",
  "ledgerReport",
  "clusterPreviews",
  "overlaysPreview",
  "graph",
  "generatedArtifacts",
  "releaseWorkflow",
] as const;
const GRAPH_ENVELOPE_KEYS = [
  "origin",
  "public",
  "deterministic",
  "generatedAt",
  "inputDigest",
  "input",
] as const;
const ARTIFACT_KEYS = [
  "name",
  "content",
  "digest",
  "sourceDigest",
  "generatedAt",
  "deterministic",
] as const;
const CLUSTER_PREVIEW_KEYS = [
  "contractId",
  "version",
  "asOf",
  "dataMode",
  "clusterId",
  "ticket",
  "ledgerDigest",
  "previewReady",
  "executionAuthorization",
  "executable",
  "diagnostics",
  "articlePlans",
  "mutationCommands",
  "governanceBinding",
] as const;
const OVERLAY_PREVIEW_KEYS = [
  "version",
  "ticket",
  "clusterId",
  "mode",
  "ledgerDigest",
  "status",
  "contractReady",
  "executable",
  "diagnostics",
  "parentJourney",
  "scopeSplit",
  "entries",
  "industryOverlays",
  "articlePlans",
  "mutationCommands",
  "governanceBinding",
] as const;
const PLAN_KEYS = [
  "contentId",
  "slug",
  "route",
  "canonicalRoute",
  "contentRole",
  "preservedAuthor",
  "expectedLinks",
  "linksToAdd",
  "expectedFrontmatter",
  "evidenceReadiness",
] as const;
const FRONTMATTER_KEYS = [
  "contentId",
  "cluster",
  "contentRole",
  "searchIntent",
  "funnelStage",
  "primaryKeyword",
  "secondaryKeywords",
  "targetMarket",
  "editorialStatus",
  "evidenceIds",
  "firstPartyContributionId",
  "commercialRoot",
  "editorialPillar",
  "requiredLinks",
  "reviewedBy",
  "reviewedDate",
  "reviewDueDate",
  "migrationAction",
] as const;
const EVIDENCE_KEYS = ["status", "methodologyRef", "claimBoundary"] as const;
const LEDGER_REPORT_KEYS = ["status", "locked", "digest", "issues"] as const;
const LEDGER_ISSUE_KEYS = ["severity", "code", "path", "message"] as const;
const LEDGER_KEYS = [
  "ledgerVersion",
  "baseline",
  "opportunityModel",
  "riskModel",
  "approval",
  "protection",
  "clusterPlans",
  "entries",
  "cannibalisationReviews",
  "integrationBlockers",
] as const;
const LEDGER_BASELINE_KEYS = ["id", "asOf", "expectedCount"] as const;
const LEDGER_APPROVAL_KEYS = [
  "approvalStatus",
  "reviewer",
  "approvalDate",
] as const;
const LEDGER_PROTECTION_KEYS = ["algorithm", "expectedDigest"] as const;
const GOVERNANCE_BINDING_KEYS = [
  "origin",
  "public",
  "releaseId",
  "artifactDigest",
  "rollbackArtifactDigest",
  "rollbackOwner",
  "rollbackTriggers",
  "rollbackSteps",
] as const;
const RELEASE_WORKFLOW_KEYS = [
  "releaseId",
  "artifactDigest",
  "reportDigest",
  "workflowInstanceId",
  "preparedAt",
  "approvalNonce",
  "rollbackPlanDigest",
  "version",
  "state",
  "dataMode",
  "provenance",
  "report",
  "rollbackPlan",
  "rollbackGeneration",
  "contentApproval",
  "productionApproval",
  "deployment",
  "liveVerification",
  "rollback",
  "searchReports",
] as const;
const TICKET_BY_CLUSTER: Readonly<
  Record<
    (typeof GOVERNED_MIGRATION_CLUSTER_IDS)[number],
    GovernedMigrationTicket
  >
> = {
  "supplier-verification": "07",
  "factory-audit": "08",
  "quality-inspection": "09",
  "factory-visits": "10",
  "china-sourcing": "11",
};
const TRUSTED_RESULTS = new WeakSet<object>();
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const UTC_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const SHA256_DIGEST = /^sha256:[0-9a-f]{64}$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const key of Reflect.ownKeys(value)) {
      deepFreeze((value as Record<PropertyKey, unknown>)[key]);
    }
    Object.freeze(value);
  }
  return value;
}

function addDiagnostic(
  diagnostics: StrictCutoverDiagnostic[],
  code: string,
  path: string,
  message: string,
  severity: StrictCutoverDiagnostic["severity"] = "error",
): void {
  diagnostics.push({ severity, code, path, message });
}

function checkKeys(
  value: unknown,
  expected: readonly string[],
  path: string,
  diagnostics: StrictCutoverDiagnostic[],
): value is Record<string, unknown> {
  if (!isRecord(value)) {
    addDiagnostic(
      diagnostics,
      "invalid-object",
      path,
      "Expected an object at this contract boundary.",
    );
    return false;
  }
  const allowed = new Set(expected);
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string" || !allowed.has(key)) {
      addDiagnostic(
        diagnostics,
        "unknown-input-key",
        `${path}.${String(key)}`,
        "Unknown input key is rejected.",
      );
    }
  }
  return true;
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function datePart(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (ISO_DATE.test(value) || UTC_TIMESTAMP.test(value))
    return value.slice(0, 10);
  return null;
}

function isValidCalendarDate(value: string): boolean {
  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  )
    return false;
  if (month < 1 || month > 12 || day < 1) return false;
  const monthLength = [
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
  ][month - 1];
  return day <= monthLength;
}

function assertDate(
  value: unknown,
  path: string,
  origin: StrictGovernanceGraphCutoverInput["origin"],
  diagnostics: StrictCutoverDiagnostic[],
): void {
  const date = datePart(value);
  if (!date || !isValidCalendarDate(date)) {
    addDiagnostic(
      diagnostics,
      "invalid-date",
      path,
      "Expected an ISO calendar date or UTC timestamp.",
    );
    return;
  }
  if (origin === "production" && date > STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE) {
    addDiagnostic(
      diagnostics,
      "future-production-date",
      path,
      "Production input cannot use a future date.",
    );
  }
}

function assertLedgerGovernanceDates(
  ledger: Record<string, unknown>,
  origin: StrictGovernanceGraphCutoverInput["origin"],
  diagnostics: StrictCutoverDiagnostic[],
): void {
  const approval = isRecord(ledger.approval) ? ledger.approval : null;
  assertDate(
    approval?.approvalDate,
    "ledger.approval.approvalDate",
    origin,
    diagnostics,
  );
  const entries = Array.isArray(ledger.entries) ? ledger.entries : [];
  entries.forEach((entry, index) => {
    if (!isRecord(entry)) return;
    const decision = isRecord(entry.decision) ? entry.decision : null;
    if (decision?.reviewedOn !== null && decision?.reviewedOn !== undefined)
      assertDate(
        decision.reviewedOn,
        `ledger.entries[${index}].decision.reviewedOn`,
        origin,
        diagnostics,
      );
  });
  const reviews = Array.isArray(ledger.cannibalisationReviews)
    ? ledger.cannibalisationReviews
    : [];
  reviews.forEach((review, index) => {
    if (!isRecord(review)) return;
    if (review.reviewedOn !== null && review.reviewedOn !== undefined)
      assertDate(
        review.reviewedOn,
        `ledger.cannibalisationReviews[${index}].reviewedOn`,
        origin,
        diagnostics,
      );
  });
}

function isSha256Digest(value: unknown): value is `sha256:${string}` {
  return typeof value === "string" && SHA256_DIGEST.test(value);
}

function isCanonicalDigest(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (SHA256_DIGEST.test(value) || SHA256_HEX.test(value))
  );
}

function hasErrors(diagnostics: readonly StrictCutoverDiagnostic[]): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

function addPreviewDiagnostics(
  diagnostics: StrictCutoverDiagnostic[],
  previewDiagnostics: readonly MigrationPreviewDiagnostic[],
  path: string,
): void {
  for (const diagnostic of previewDiagnostics) {
    if (diagnostic.severity === "error") {
      addDiagnostic(
        diagnostics,
        diagnostic.code,
        `${path}.${diagnostic.path}`,
        diagnostic.message,
      );
    }
  }
}

function validateFrontmatter(
  raw: unknown,
  path: string,
  origin: StrictGovernanceGraphCutoverInput["origin"],
  diagnostics: StrictCutoverDiagnostic[],
): raw is PlannedGovernedFrontmatter {
  if (!checkKeys(raw, FRONTMATTER_KEYS, path, diagnostics)) return false;
  const frontmatter = raw as unknown as PlannedGovernedFrontmatter;
  for (const [key, value] of [
    ["contentId", frontmatter.contentId],
    ["searchIntent", frontmatter.searchIntent],
    ["funnelStage", frontmatter.funnelStage],
    ["primaryKeyword", frontmatter.primaryKeyword],
    ["commercialRoot", frontmatter.commercialRoot],
    ["editorialPillar", frontmatter.editorialPillar],
    ["reviewedBy", frontmatter.reviewedBy],
  ] as const) {
    if (!nonEmptyString(value))
      addDiagnostic(
        diagnostics,
        "missing-governed-field",
        `${path}.${key}`,
        "Required governed field is missing.",
      );
  }
  if (frontmatter.editorialStatus !== "approved") {
    addDiagnostic(
      diagnostics,
      "article-not-approved",
      `${path}.editorialStatus`,
      "Strict cutover accepts only approved articles.",
    );
  }
  if (
    !Array.isArray(frontmatter.evidenceIds) ||
    frontmatter.evidenceIds.length === 0
  ) {
    addDiagnostic(
      diagnostics,
      "missing-evidence",
      `${path}.evidenceIds`,
      "Strict cutover requires at least one evidence ID.",
    );
  }
  if (
    !Array.isArray(frontmatter.requiredLinks) ||
    frontmatter.requiredLinks.length === 0
  ) {
    addDiagnostic(
      diagnostics,
      "missing-required-links",
      `${path}.requiredLinks`,
      "Strict cutover requires governed links.",
    );
  }
  assertDate(
    frontmatter.reviewedDate,
    `${path}.reviewedDate`,
    origin,
    diagnostics,
  );
  assertDate(
    frontmatter.reviewDueDate,
    `${path}.reviewDueDate`,
    origin,
    diagnostics,
  );
  return true;
}

function validatePlan(
  raw: unknown,
  path: string,
  clusterId: (typeof GOVERNED_MIGRATION_CLUSTER_IDS)[number],
  origin: StrictGovernanceGraphCutoverInput["origin"],
  diagnostics: StrictCutoverDiagnostic[],
): raw is ArticleMigrationPlan {
  if (!checkKeys(raw, PLAN_KEYS, path, diagnostics)) return false;
  const plan = raw as unknown as ArticleMigrationPlan;
  for (const [key, value] of [
    ["contentId", plan.contentId],
    ["slug", plan.slug],
    ["route", plan.route],
    ["canonicalRoute", plan.canonicalRoute],
    ["preservedAuthor", plan.preservedAuthor],
  ] as const) {
    if (!nonEmptyString(value))
      addDiagnostic(
        diagnostics,
        "invalid-article-identity",
        `${path}.${key}`,
        "Article identity must be a non-empty string.",
      );
  }
  if (plan.route !== plan.canonicalRoute)
    addDiagnostic(
      diagnostics,
      "route-canonical-drift",
      path,
      "Cutover cannot change route or canonical identity.",
    );
  if (plan.expectedFrontmatter?.cluster !== clusterId) {
    addDiagnostic(
      diagnostics,
      "cluster-plan-mismatch",
      `${path}.expectedFrontmatter.cluster`,
      "Article plan cluster does not match its governed preview.",
    );
  }
  validateFrontmatter(
    plan.expectedFrontmatter,
    `${path}.expectedFrontmatter`,
    origin,
    diagnostics,
  );
  if (
    !checkKeys(
      plan.evidenceReadiness,
      EVIDENCE_KEYS,
      `${path}.evidenceReadiness`,
      diagnostics,
    )
  )
    return true;
  if (plan.evidenceReadiness.status !== "reviewed")
    addDiagnostic(
      diagnostics,
      "evidence-not-reviewed",
      `${path}.evidenceReadiness.status`,
      "Strict cutover requires reviewed evidence.",
    );
  if (
    !nonEmptyString(plan.evidenceReadiness.methodologyRef) ||
    !nonEmptyString(plan.evidenceReadiness.claimBoundary)
  ) {
    addDiagnostic(
      diagnostics,
      "incomplete-evidence-readiness",
      `${path}.evidenceReadiness`,
      "Methodology and claim boundary are required.",
    );
  }
  return true;
}

function validatePreview(
  raw: unknown,
  index: number,
  ledgerDigest: string,
  origin: StrictGovernanceGraphCutoverInput["origin"],
  diagnostics: StrictCutoverDiagnostic[],
): raw is ClusterMigrationPreview {
  const path = `clusterPreviews[${index}]`;
  if (!checkKeys(raw, CLUSTER_PREVIEW_KEYS, path, diagnostics)) return false;
  const preview = raw as unknown as ClusterMigrationPreview;
  const expectedTicket = preview.clusterId
    ? TICKET_BY_CLUSTER[preview.clusterId as keyof typeof TICKET_BY_CLUSTER]
    : undefined;
  if (!expectedTicket || preview.ticket !== expectedTicket)
    addDiagnostic(
      diagnostics,
      "cluster-ticket-mismatch",
      path,
      "Cluster preview ticket binding is invalid.",
    );
  if (preview.contractId !== MIGRATION_PREVIEW_CONTRACT_ID)
    addDiagnostic(
      diagnostics,
      "preview-contract-mismatch",
      `${path}.contractId`,
      "Cluster preview contract ID is not supported.",
    );
  if (preview.version !== 1)
    addDiagnostic(
      diagnostics,
      "unsupported-preview-version",
      `${path}.version`,
      "Only version 1 previews are accepted.",
    );
  assertDate(preview.asOf, `${path}.asOf`, origin, diagnostics);
  if (preview.asOf !== STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE)
    addDiagnostic(
      diagnostics,
      "preview-as-of-mismatch",
      `${path}.asOf`,
      "Cluster preview must share the Ticket 13 asOf boundary.",
    );
  const expectedDataMode =
    origin === "production" ? "actual" : "synthetic_fixture";
  if (preview.dataMode !== expectedDataMode)
    addDiagnostic(
      diagnostics,
      "preview-data-mode-mismatch",
      `${path}.dataMode`,
      "Cluster preview data mode must match cutover provenance.",
    );
  if (preview.previewReady !== true)
    addDiagnostic(
      diagnostics,
      "preview-not-ready",
      `${path}.previewReady`,
      "Only ready cluster previews are accepted.",
    );
  if (
    preview.executionAuthorization !== "not-authorized" ||
    preview.executable !== false ||
    !Array.isArray(preview.mutationCommands) ||
    preview.mutationCommands.length !== 0
  )
    addDiagnostic(
      diagnostics,
      "preview-execution-not-isolated",
      path,
      "Cluster previews must remain non-executable with no commands.",
    );
  if (preview.ledgerDigest !== ledgerDigest)
    addDiagnostic(
      diagnostics,
      "preview-ledger-digest-mismatch",
      `${path}.ledgerDigest`,
      "Preview is not bound to the current ledger digest.",
    );
  if (preview.governanceBinding !== null)
    checkKeys(
      preview.governanceBinding,
      GOVERNANCE_BINDING_KEYS,
      `${path}.governanceBinding`,
      diagnostics,
    );
  if (!Array.isArray(preview.articlePlans)) {
    addDiagnostic(
      diagnostics,
      "invalid-article-plans",
      `${path}.articlePlans`,
      "Article plans must be an array.",
    );
  } else {
    preview.articlePlans.forEach((plan, planIndex) =>
      validatePlan(
        plan,
        `${path}.articlePlans[${planIndex}]`,
        preview.clusterId as (typeof GOVERNED_MIGRATION_CLUSTER_IDS)[number],
        origin,
        diagnostics,
      ),
    );
  }
  if (!Array.isArray(preview.diagnostics))
    addDiagnostic(
      diagnostics,
      "invalid-preview-diagnostics",
      `${path}.diagnostics`,
      "Preview diagnostics must be an array.",
    );
  else addPreviewDiagnostics(diagnostics, preview.diagnostics, path);
  return true;
}

function validateOverlayPreview(
  raw: unknown,
  ledgerDigest: string,
  diagnostics: StrictCutoverDiagnostic[],
): raw is ChinaSourcingOverlaysMigrationPreview {
  const path = "overlaysPreview";
  if (!checkKeys(raw, OVERLAY_PREVIEW_KEYS, path, diagnostics)) return false;
  const preview = raw as unknown as ChinaSourcingOverlaysMigrationPreview;
  if (
    preview.ticket !== CHINA_SOURCING_OVERLAYS_MIGRATION_TICKET ||
    preview.clusterId !== CHINA_SOURCING_OVERLAYS_CLUSTER_ID
  )
    addDiagnostic(
      diagnostics,
      "overlay-ticket-mismatch",
      path,
      "Ticket 12 overlay binding is invalid.",
    );
  if (preview.ledgerDigest !== ledgerDigest)
    addDiagnostic(
      diagnostics,
      "overlay-ledger-digest-mismatch",
      `${path}.ledgerDigest`,
      "Overlay preview is not bound to the current ledger digest.",
    );
  if (preview.governanceBinding !== null)
    checkKeys(
      preview.governanceBinding,
      GOVERNANCE_BINDING_KEYS,
      `${path}.governanceBinding`,
      diagnostics,
    );
  if (preview.status !== "ready" || preview.contractReady !== true)
    addDiagnostic(
      diagnostics,
      "overlay-contract-not-ready",
      path,
      "Ticket 12 must provide a ready contract before cutover.",
    );
  if (
    preview.executable !== false ||
    !Array.isArray(preview.mutationCommands) ||
    preview.mutationCommands.length !== 0
  )
    addDiagnostic(
      diagnostics,
      "overlay-execution-not-isolated",
      path,
      "Ticket 12 overlay preview must remain non-executable.",
    );
  if (Array.isArray(preview.diagnostics))
    addPreviewDiagnostics(diagnostics, preview.diagnostics, path);
  else
    addDiagnostic(
      diagnostics,
      "invalid-preview-diagnostics",
      `${path}.diagnostics`,
      "Overlay diagnostics must be an array.",
    );
  return true;
}

function validateGraphEnvelope(
  raw: unknown,
  origin: StrictGovernanceGraphCutoverInput["origin"],
  publicInput: boolean,
  diagnostics: StrictCutoverDiagnostic[],
): {
  envelope: StrictGovernanceGraphCutoverInput["graph"] | null;
  input: GraphInput | null;
  digest: string | null;
} {
  if (!checkKeys(raw, GRAPH_ENVELOPE_KEYS, "graph", diagnostics))
    return { envelope: null, input: null, digest: null };
  const envelope = raw as unknown as StrictGovernanceGraphCutoverInput["graph"];
  if (envelope.origin !== origin || envelope.public !== publicInput)
    addDiagnostic(
      diagnostics,
      "graph-origin-mismatch",
      "graph",
      "Graph provenance must match the cutover envelope.",
    );
  if (envelope.deterministic !== true)
    addDiagnostic(
      diagnostics,
      "non-deterministic-input",
      "graph.deterministic",
      "Only deterministic graph inputs are accepted.",
    );
  assertDate(envelope.generatedAt, "graph.generatedAt", origin, diagnostics);
  let input: GraphInput | null = null;
  try {
    input = parseCanonicalGraphInput(envelope.input);
    // Run the diagnostic engine only after the strict schema parser succeeds.
    const graphReport = diagnoseGraph(input);
    for (const diagnostic of graphReport) {
      if (diagnostic.severity === "hard")
        addDiagnostic(
          diagnostics,
          `graph-${diagnostic.code}`,
          "graph.input",
          diagnostic.message,
        );
    }
  } catch (error) {
    addDiagnostic(
      diagnostics,
      "invalid-graph-input",
      "graph.input",
      error instanceof Error ? error.message : "Graph input is invalid.",
    );
  }
  if (input) {
    const digest = digestGraphInput(input);
    if (envelope.inputDigest !== digest)
      addDiagnostic(
        diagnostics,
        "graph-digest-mismatch",
        "graph.inputDigest",
        "Graph digest does not match canonical graph input.",
      );
    return { envelope, input, digest };
  }
  return { envelope, input: null, digest: null };
}

function validateArtifacts(
  raw: unknown,
  origin: StrictGovernanceGraphCutoverInput["origin"],
  expectedSourceDigest: string,
  expectedGeneratedAt: string,
  diagnostics: StrictCutoverDiagnostic[],
): readonly StrictGovernanceGeneratedArtifact[] {
  if (!Array.isArray(raw)) {
    addDiagnostic(
      diagnostics,
      "invalid-generated-artifacts",
      "generatedArtifacts",
      "Generated artifacts must be an array.",
    );
    return [];
  }
  const artifacts: StrictGovernanceGeneratedArtifact[] = [];
  const names = new Set<string>();
  raw.forEach((value, index) => {
    const path = `generatedArtifacts[${index}]`;
    if (!checkKeys(value, ARTIFACT_KEYS, path, diagnostics)) return;
    const artifact = value as unknown as StrictGovernanceGeneratedArtifact;
    if (!SEO_ARTIFACT_NAMES.includes(artifact.name as SeoArtifactName))
      addDiagnostic(
        diagnostics,
        "unexpected-artifact",
        `${path}.name`,
        "Only the four governed SEO artifacts are accepted.",
      );
    if (names.has(artifact.name))
      addDiagnostic(
        diagnostics,
        "duplicate-artifact",
        `${path}.name`,
        "Each governed artifact must appear exactly once.",
      );
    names.add(artifact.name);
    if (artifact.deterministic !== true)
      addDiagnostic(
        diagnostics,
        "non-deterministic-artifact",
        `${path}.deterministic`,
        "Generated artifacts must be deterministic.",
      );
    if (!nonEmptyString(artifact.content))
      addDiagnostic(
        diagnostics,
        "empty-artifact",
        `${path}.content`,
        "Generated artifact content must be non-empty.",
      );
    if (artifact.sourceDigest !== expectedSourceDigest)
      addDiagnostic(
        diagnostics,
        "artifact-lineage-mismatch",
        `${path}.sourceDigest`,
        "Artifact lineage does not match the approved graph source digest.",
      );
    if (
      !isSha256Digest(artifact.digest) ||
      typeof artifact.content !== "string" ||
      digestStrictCutoverContent(artifact.content) !== artifact.digest
    )
      addDiagnostic(
        diagnostics,
        "artifact-digest-mismatch",
        `${path}.digest`,
        "Artifact digest does not match its content.",
      );
    assertDate(
      artifact.generatedAt,
      `${path}.generatedAt`,
      origin,
      diagnostics,
    );
    if (artifact.generatedAt !== expectedGeneratedAt)
      addDiagnostic(
        diagnostics,
        "artifact-generation-time-mismatch",
        `${path}.generatedAt`,
        "All artifacts must share the graph generation timestamp.",
      );
    try {
      JSON.parse(artifact.content);
    } catch {
      addDiagnostic(
        diagnostics,
        "invalid-artifact-json",
        `${path}.content`,
        "Generated artifact content must be valid JSON.",
      );
    }
    artifacts.push(artifact);
  });
  for (const name of SEO_ARTIFACT_NAMES)
    if (!names.has(name))
      addDiagnostic(
        diagnostics,
        "missing-artifact",
        "generatedArtifacts",
        `Missing governed artifact ${name}.`,
      );
  if (raw.length !== SEO_ARTIFACT_NAMES.length)
    addDiagnostic(
      diagnostics,
      "artifact-set-count-mismatch",
      "generatedArtifacts",
      "Exactly four governed artifacts are required.",
    );
  return artifacts;
}

function validateReciprocalGraph(
  graph: GraphInput | null,
  plans: readonly ArticleMigrationPlan[],
  diagnostics: StrictCutoverDiagnostic[],
): { orphanCount: number; brokenCount: number; pillarCount: number } {
  if (!graph) return { orphanCount: 0, brokenCount: 0, pillarCount: 0 };
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  let brokenCount = 0;
  for (const relationship of graph.relationships) {
    if (
      !nodeMap.has(relationship.sourceId) ||
      !nodeMap.has(relationship.targetId)
    ) {
      brokenCount += 1;
      addDiagnostic(
        diagnostics,
        "broken-relationship",
        `graph.input.relationships.${relationship.id}`,
        "Graph relationship references a missing node.",
      );
      continue;
    }
    outgoing.set(relationship.sourceId, [
      ...(outgoing.get(relationship.sourceId) ?? []),
      relationship.targetId,
    ]);
    incoming.set(relationship.targetId, [
      ...(incoming.get(relationship.targetId) ?? []),
      relationship.sourceId,
    ]);
  }
  const reachable = (
    edges: Map<string, string[]>,
    start: string,
    target: string,
  ): boolean => {
    const queue = [start];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const current = queue.shift() as string;
      if (current === target) return true;
      if (seen.has(current)) continue;
      seen.add(current);
      queue.push(...(edges.get(current) ?? []));
    }
    return false;
  };
  const graphClusters = new Map(
    graph.clusters.map((cluster) => [cluster.id, cluster]),
  );
  const articleNodes = graph.nodes.filter(
    (node) => node.nodeType === "article",
  );
  const planByRoute = new Map(plans.map((plan) => [plan.route, plan]));
  for (const node of articleNodes) {
    const plan = planByRoute.get(node.destination);
    const cluster = node.cluster ? graphClusters.get(node.cluster) : undefined;
    const connected = Boolean(
      cluster &&
      reachable(outgoing, node.id, cluster.rootId ?? "") &&
      reachable(incoming, node.id, cluster.rootId ?? ""),
    );
    if (!connected) {
      addDiagnostic(
        diagnostics,
        "root-not-reciprocal",
        `graph.input.nodes.${node.id}`,
        "Every article must have reciprocal reachability to its cluster root.",
      );
      addDiagnostic(
        diagnostics,
        "orphan-article",
        `graph.input.nodes.${node.id}`,
        "Article is orphaned from the governed graph.",
      );
    }
    if (!plan)
      addDiagnostic(
        diagnostics,
        "graph-article-not-planned",
        `graph.input.nodes.${node.id}`,
        "Graph article is absent from the governed article plans.",
      );
  }
  for (const plan of plans) {
    if (!articleNodes.some((node) => node.destination === plan.route))
      addDiagnostic(
        diagnostics,
        "planned-article-not-in-graph",
        `graph.input.nodes`,
        `Planned article ${plan.contentId} is absent from the graph.`,
      );
  }
  let orphanCount = diagnostics.filter(
    (diagnostic) => diagnostic.code === "orphan-article",
  ).length;
  const pillarCount = graph.nodes.filter(
    (node) => node.nodeType === "article" && node.contentRole === "pillar",
  ).length;
  for (const clusterId of GOVERNED_MIGRATION_CLUSTER_IDS) {
    const cluster = graphClusters.get(clusterId);
    if (!cluster || !cluster.rootId || !cluster.pillarId) {
      addDiagnostic(
        diagnostics,
        "missing-graph-cluster-binding",
        `graph.input.clusters.${clusterId}`,
        "Each governed cluster must bind a root and pillar.",
      );
      continue;
    }
    const root = nodeMap.get(cluster.rootId);
    const pillar = nodeMap.get(cluster.pillarId);
    if (!root || root.status !== "published")
      addDiagnostic(
        diagnostics,
        "root-not-live",
        `graph.input.clusters.${clusterId}.rootId`,
        "Cluster root must be a published live node.",
      );
    if (
      !pillar ||
      pillar.nodeType !== "article" ||
      pillar.status !== "published" ||
      pillar.contentRole !== "pillar"
    )
      addDiagnostic(
        diagnostics,
        "pillar-not-live",
        `graph.input.clusters.${clusterId}.pillarId`,
        "Cluster pillar must be one published article pillar.",
      );
    const clusterPillars = plans.filter(
      (plan) =>
        plan.expectedFrontmatter.cluster === clusterId &&
        plan.contentRole === "pillar",
    );
    if (clusterPillars.length !== 1)
      addDiagnostic(
        diagnostics,
        "pillar-cardinality",
        `clusterPreviews.${clusterId}`,
        "Each cluster must have exactly one governed pillar.",
      );
  }
  orphanCount = Math.max(
    orphanCount,
    diagnostics.filter((diagnostic) => diagnostic.code === "orphan-article")
      .length,
  );
  return { orphanCount, brokenCount, pillarCount };
}

export function computeStrictCutoverSourceDigest(
  input: StrictCutoverSourceDigestInput,
) {
  return computeSourceDigest(input);
}

const DEPENDENCY_KEYS = [
  "ticket",
  "status",
  "asOf",
  "mode",
  "executable",
  "commands",
  "migrationLedgerDigest",
  "ticket07To11PreviewDigests",
  "ticket12OverlayDigest",
  "graphDigest",
  "artifactSetDigest",
  "cutoverDigest",
  "dependencyDigest",
] as const;
const DEPENDENCY_TICKET_KEYS = ["07", "08", "09", "10", "11"] as const;

function strictDependencyPayload(
  value: Omit<
    import("./types").StrictGovernanceGraphCutoverDependency,
    "dependencyDigest"
  >,
) {
  return value;
}

export function exportStrictGovernanceGraphCutoverDependency(
  result: StrictGovernanceGraphCutoverResult,
): import("./types").StrictGovernanceGraphCutoverDependency {
  if (
    !TRUSTED_RESULTS.has(result) ||
    result.status !== "scaffold-ready" ||
    result.executable !== false ||
    !["preview", "dry-run"].includes(result.mode) ||
    result.commands.length !== 0 ||
    !result.lineage
  ) {
    throw new Error(
      "Only a trusted scaffold result can export this dependency.",
    );
  }
  const mode = result.mode === "preview" ? "preview" : "dry-run";
  const payload = strictDependencyPayload({
    ticket: result.ticket,
    status: "scaffold-ready" as const,
    asOf: result.asOfDate,
    mode,
    executable: false as const,
    commands: [] as const,
    migrationLedgerDigest: result.lineage.ledgerDigest,
    ticket07To11PreviewDigests: result.lineage.ticket07To11PreviewDigests,
    ticket12OverlayDigest: result.lineage.overlaysPreviewDigest,
    graphDigest: result.lineage.graphDigest,
    artifactSetDigest: result.lineage.artifactSetDigest,
    cutoverDigest: result.lineage.cutoverDigest,
  });
  return deepFreeze({
    ...payload,
    dependencyDigest: digestStrictCutoverValue(payload),
  });
}

export function parseStrictGovernanceGraphCutoverDependency(
  raw: unknown,
): import("./types").StrictGovernanceGraphCutoverDependency {
  const diagnostics: StrictCutoverDiagnostic[] = [];
  if (!checkKeys(raw, DEPENDENCY_KEYS, "dependency", diagnostics))
    throw new TypeError("Invalid Ticket 13 dependency object.");
  const value = raw as Record<string, unknown>;
  const previews = value.ticket07To11PreviewDigests;
  if (!isRecord(previews))
    throw new TypeError("Invalid Ticket 07-11 preview digest map.");
  const previewKeys = Object.keys(previews).sort();
  if (previewKeys.join(",") !== DEPENDENCY_TICKET_KEYS.join(","))
    throw new TypeError("Ticket 07-11 preview digest keys must be exact.");
  const commands = value.commands;
  if (
    diagnostics.length > 0 ||
    value.ticket !== STRICT_GOVERNANCE_CUTOVER_TICKET ||
    value.status !== "scaffold-ready" ||
    value.asOf !== STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE ||
    (value.mode !== "preview" && value.mode !== "dry-run") ||
    value.executable !== false ||
    !Array.isArray(commands) ||
    commands.length !== 0 ||
    !isCanonicalDigest(value.migrationLedgerDigest) ||
    !Object.values(previews).every(isSha256Digest) ||
    !isSha256Digest(value.ticket12OverlayDigest) ||
    !isCanonicalDigest(value.graphDigest) ||
    !isSha256Digest(value.artifactSetDigest) ||
    !isSha256Digest(value.cutoverDigest) ||
    !isSha256Digest(value.dependencyDigest)
  )
    throw new TypeError("Ticket 13 dependency contract is invalid.");
  const { dependencyDigest, ...payload } = value;
  if (digestStrictCutoverValue(payload) !== dependencyDigest)
    throw new TypeError("Ticket 13 dependency lineage drift detected.");
  return deepFreeze(
    structuredClone(raw),
  ) as unknown as import("./types").StrictGovernanceGraphCutoverDependency;
}

export function buildStrictGovernanceGraphCutover(
  raw: unknown,
): StrictGovernanceGraphCutoverResult {
  const diagnostics: StrictCutoverDiagnostic[] = [];
  if (!checkKeys(raw, CUTOVER_INPUT_KEYS, "input", diagnostics)) {
    return makeBlockedResult(raw, diagnostics);
  }
  const input = raw as unknown as StrictGovernanceGraphCutoverInput;
  if (input.asOf !== STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE)
    addDiagnostic(
      diagnostics,
      "invalid-as-of",
      "input.asOf",
      "Ticket 13 requires the explicit asOf boundary 2026-07-18.",
    );
  if (input.mode === "actual") {
    addDiagnostic(
      diagnostics,
      "actual-mode-not-supported",
      "input.mode",
      "Ticket 13 is preview/dry-run only; actual execution belongs to a separately approved production ticket.",
    );
    return makeBlockedResult(input, diagnostics);
  }
  if (
    !(["preview", "dry-run", "actual"] as readonly string[]).includes(
      input.mode,
    )
  )
    addDiagnostic(
      diagnostics,
      "invalid-mode",
      "input.mode",
      "Unknown cutover mode is rejected.",
    );
  if (
    !(["production", "synthetic_fixture"] as readonly string[]).includes(
      input.origin,
    )
  )
    addDiagnostic(
      diagnostics,
      "invalid-origin",
      "input.origin",
      "Unknown cutover origin is rejected.",
    );
  if (input.origin === "production" && input.public !== true)
    addDiagnostic(
      diagnostics,
      "production-must-be-public",
      "input.public",
      "Production cutover input must be public.",
    );
  if (input.origin === "synthetic_fixture" && input.public !== false)
    addDiagnostic(
      diagnostics,
      "fixture-must-be-private",
      "input.public",
      "Synthetic fixtures must be non-public.",
    );
  const ledgerRecord = isRecord(input.ledger) ? input.ledger : null;
  if (!ledgerRecord)
    addDiagnostic(
      diagnostics,
      "invalid-ledger",
      "ledger",
      "Migration ledger is required as an object.",
    );
  const ledgerReportRecord = isRecord(input.ledgerReport)
    ? input.ledgerReport
    : null;
  if (ledgerReportRecord)
    checkKeys(
      ledgerReportRecord,
      LEDGER_REPORT_KEYS,
      "ledgerReport",
      diagnostics,
    );
  else
    addDiagnostic(
      diagnostics,
      "invalid-ledger-report",
      "ledgerReport",
      "Ledger report is required.",
    );
  if (ledgerRecord) {
    checkKeys(ledgerRecord, LEDGER_KEYS, "ledger", diagnostics);
    if (isRecord(ledgerRecord.baseline))
      checkKeys(
        ledgerRecord.baseline,
        LEDGER_BASELINE_KEYS,
        "ledger.baseline",
        diagnostics,
      );
    if (isRecord(ledgerRecord.approval))
      checkKeys(
        ledgerRecord.approval,
        LEDGER_APPROVAL_KEYS,
        "ledger.approval",
        diagnostics,
      );
    if (isRecord(ledgerRecord.protection))
      checkKeys(
        ledgerRecord.protection,
        LEDGER_PROTECTION_KEYS,
        "ledger.protection",
        diagnostics,
      );
  }
  if (Array.isArray(ledgerReportRecord?.issues))
    ledgerReportRecord.issues.forEach((issue, index) =>
      checkKeys(
        issue,
        LEDGER_ISSUE_KEYS,
        `ledgerReport.issues[${index}]`,
        diagnostics,
      ),
    );
  if (input.releaseWorkflow !== null && input.releaseWorkflow !== undefined) {
    if (isRecord(input.releaseWorkflow))
      checkKeys(
        input.releaseWorkflow,
        RELEASE_WORKFLOW_KEYS,
        "releaseWorkflow",
        diagnostics,
      );
    else
      addDiagnostic(
        diagnostics,
        "invalid-approval-binding",
        "releaseWorkflow",
        "Release workflow input must be a plain object when supplied.",
      );
    addDiagnostic(
      diagnostics,
      "approval-binding-not-accepted",
      "releaseWorkflow",
      "Ticket 13 cannot accept or confer production execution approval.",
    );
  }
  let ledgerDigest = "";
  if (ledgerRecord) {
    try {
      ledgerDigest = computeMigrationLedgerDigest(
        ledgerRecord as unknown as Parameters<
          typeof computeMigrationLedgerDigest
        >[0],
      );
    } catch (error) {
      addDiagnostic(
        diagnostics,
        "invalid-ledger",
        "ledger",
        error instanceof Error ? error.message : "Migration ledger is invalid.",
      );
    }
  }
  if (ledgerReportRecord?.digest !== ledgerDigest)
    addDiagnostic(
      diagnostics,
      "ledger-digest-mismatch",
      "ledgerReport.digest",
      "Ledger report is not bound to the current ledger.",
    );
  const protection = isRecord(ledgerRecord?.protection)
    ? ledgerRecord.protection
    : null;
  if (!protection)
    addDiagnostic(
      diagnostics,
      "invalid-ledger-protection",
      "ledger.protection",
      "Ledger protection binding is required.",
    );
  else if (protection.expectedDigest !== ledgerDigest)
    addDiagnostic(
      diagnostics,
      "ledger-protection-mismatch",
      "ledger.protection.expectedDigest",
      "Ledger protection digest is not current.",
    );
  const reportIssues = ledgerReportRecord?.issues;
  if (
    ledgerReportRecord?.status !== "valid" ||
    ledgerReportRecord?.locked !== true ||
    !Array.isArray(reportIssues) ||
    reportIssues.length !== 0
  )
    addDiagnostic(
      diagnostics,
      "ledger-not-approved",
      "ledgerReport",
      "Strict cutover requires a locked, issue-free approved ledger.",
    );
  const approval = isRecord(ledgerRecord?.approval)
    ? ledgerRecord.approval
    : null;
  if (approval?.approvalStatus !== "approved")
    addDiagnostic(
      diagnostics,
      "ledger-not-approved",
      "ledger.approval.approvalStatus",
      "Strict cutover requires approved ledger governance.",
    );
  const baseline = isRecord(ledgerRecord?.baseline)
    ? ledgerRecord.baseline
    : null;
  assertDate(baseline?.asOf, "ledger.baseline.asOf", input.origin, diagnostics);
  if (ledgerRecord)
    assertLedgerGovernanceDates(ledgerRecord, input.origin, diagnostics);

  const previews = Array.isArray(input.clusterPreviews)
    ? input.clusterPreviews
    : [];
  if (previews.length !== GOVERNED_MIGRATION_CLUSTER_IDS.length)
    addDiagnostic(
      diagnostics,
      "cluster-preview-count-mismatch",
      "clusterPreviews",
      "Exactly five governed cluster previews are required.",
    );
  const seenClusters = new Set<string>();
  const plans: ArticleMigrationPlan[] = [];
  previews.forEach((preview, index) => {
    if (
      validatePreview(preview, index, ledgerDigest, input.origin, diagnostics)
    ) {
      const clusterId = preview.clusterId;
      if (clusterId === null) {
        addDiagnostic(
          diagnostics,
          "invalid-cluster-preview",
          `clusterPreviews[${index}].clusterId`,
          "A governed cluster ID is required.",
        );
        return;
      }
      if (seenClusters.has(clusterId))
        addDiagnostic(
          diagnostics,
          "duplicate-cluster-preview",
          `clusterPreviews[${index}].clusterId`,
          "Each governed cluster must appear exactly once.",
        );
      seenClusters.add(clusterId);
      plans.push(...preview.articlePlans);
    }
  });
  for (const clusterId of GOVERNED_MIGRATION_CLUSTER_IDS)
    if (!seenClusters.has(clusterId))
      addDiagnostic(
        diagnostics,
        "missing-cluster-preview",
        "clusterPreviews",
        `Missing governed cluster preview ${clusterId}.`,
      );
  const overlayValid = validateOverlayPreview(
    input.overlaysPreview,
    ledgerDigest,
    diagnostics,
  );

  const identityKeys = new Set<string>();
  for (const plan of plans) {
    const key = `${plan.contentId}\u0000${plan.slug}\u0000${plan.route}`;
    if (identityKeys.has(key))
      addDiagnostic(
        diagnostics,
        "duplicate-article-identity",
        `clusterPreviews.${plan.contentId}`,
        "Article identity must be unique corpus-wide.",
      );
    identityKeys.add(key);
    if (
      Array.isArray(plan.expectedFrontmatter?.requiredLinks) &&
      plan.expectedFrontmatter.requiredLinks.some(
        (link) => link === plan.route || link === plan.canonicalRoute,
      )
    )
      addDiagnostic(
        diagnostics,
        "self-link",
        `clusterPreviews.${plan.contentId}.expectedFrontmatter.requiredLinks`,
        "Governed article links cannot self-link.",
      );
  }
  if (plans.length !== 23)
    addDiagnostic(
      diagnostics,
      "article-count-mismatch",
      "clusterPreviews",
      "Strict cutover requires exactly 23 governed baseline articles.",
    );

  const graphResult = validateGraphEnvelope(
    input.graph,
    input.origin,
    input.public,
    diagnostics,
  );
  const graphChecks = validateReciprocalGraph(
    graphResult.input,
    plans,
    diagnostics,
  );
  if (
    graphResult.input &&
    graphResult.input.clusters.length !== CANONICAL_CLUSTER_IDS.length
  )
    addDiagnostic(
      diagnostics,
      "graph-cluster-count-mismatch",
      "graph.input.clusters",
      "Graph must contain all five canonical clusters.",
    );
  if (
    graphResult.input &&
    graphResult.input.nodes.filter((node) => node.nodeType === "article")
      .length !== plans.length
  )
    addDiagnostic(
      diagnostics,
      "graph-article-count-mismatch",
      "graph.input.nodes",
      "Graph article count must equal governed plan count.",
    );

  let sourceDigest: ReturnType<typeof computeStrictCutoverSourceDigest> | null =
    null;
  if (graphResult.digest && overlayValid) {
    try {
      sourceDigest = computeStrictCutoverSourceDigest({
        ledgerDigest,
        clusterPreviews: previews,
        overlaysPreview: input.overlaysPreview,
        graphDigest: graphResult.digest,
      });
    } catch (error) {
      addDiagnostic(
        diagnostics,
        "lineage-digest-failed",
        "lineage.sourceDigest",
        error instanceof Error
          ? error.message
          : "Cutover source digest could not be computed.",
      );
    }
  }
  const artifacts = sourceDigest
    ? validateArtifacts(
        input.generatedArtifacts,
        input.origin,
        sourceDigest,
        typeof graphResult.envelope?.generatedAt === "string"
          ? graphResult.envelope.generatedAt
          : "",
        diagnostics,
      )
    : [];
  let artifactSetDigest: ReturnType<typeof digestStrictCutoverValue> | null =
    null;
  if (sourceDigest && artifacts.length > 0) {
    try {
      artifactSetDigest = digestStrictCutoverValue(
        artifacts
          .map((artifact) => ({
            name: artifact.name,
            digest: artifact.digest,
            sourceDigest: artifact.sourceDigest,
            generatedAt: artifact.generatedAt,
          }))
          .sort((left, right) => left.name.localeCompare(right.name)),
      );
    } catch (error) {
      addDiagnostic(
        diagnostics,
        "lineage-digest-failed",
        "lineage.artifactSetDigest",
        error instanceof Error
          ? error.message
          : "Artifact set digest could not be computed.",
      );
    }
  }
  let cutoverDigest: ReturnType<typeof digestStrictCutoverValue> | null = null;
  if (artifactSetDigest) {
    try {
      cutoverDigest = digestStrictCutoverValue({
        ticket: STRICT_GOVERNANCE_CUTOVER_TICKET,
        asOf: input.asOf,
        sourceDigest,
        artifactSetDigest,
        identities: plans
          .map((plan) => ({
            contentId: plan.contentId,
            slug: plan.slug,
            route: plan.route,
          }))
          .sort((left, right) => left.contentId.localeCompare(right.contentId)),
      });
    } catch (error) {
      addDiagnostic(
        diagnostics,
        "lineage-digest-failed",
        "lineage.cutoverDigest",
        error instanceof Error
          ? error.message
          : "Cutover digest could not be computed.",
      );
    }
  }
  let lineage: StrictCutoverLineage | null = null;
  if (
    sourceDigest &&
    artifactSetDigest &&
    cutoverDigest &&
    graphResult.digest
  ) {
    try {
      lineage = {
        ticket: STRICT_GOVERNANCE_CUTOVER_TICKET,
        asOf: input.asOf,
        ledgerDigest,
        ticket07To11PreviewDigests: Object.fromEntries(
          previews.map((preview) => [
            preview.ticket,
            digestStrictCutoverValue(preview),
          ]),
        ) as StrictCutoverLineage["ticket07To11PreviewDigests"],
        overlaysPreviewDigest: digestStrictCutoverValue(input.overlaysPreview),
        graphDigest: graphResult.digest,
        sourceDigest,
        artifactSetDigest,
        cutoverDigest,
      };
    } catch (error) {
      addDiagnostic(
        diagnostics,
        "lineage-digest-failed",
        "lineage",
        error instanceof Error
          ? error.message
          : "Cutover lineage could not be computed.",
      );
    }
  }
  const rollback = null;
  const blocked = hasErrors(diagnostics);
  const commands = [] as const;
  const result = deepFreeze({
    version: STRICT_GOVERNANCE_CUTOVER_VERSION,
    ticket: STRICT_GOVERNANCE_CUTOVER_TICKET,
    mode: input.mode,
    origin: input.origin,
    public: input.public,
    asOfDate: STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE,
    status: blocked ? ("blocked" as const) : ("scaffold-ready" as const),
    strict: true as const,
    executable: false as const,
    diagnostics: [...diagnostics].sort(
      (left, right) =>
        left.path.localeCompare(right.path) ||
        left.code.localeCompare(right.code),
    ),
    commands,
    articleCount: plans.length,
    orphanArticleCount: graphChecks.orphanCount,
    brokenRelationshipCount: graphChecks.brokenCount,
    pillarCount: graphChecks.pillarCount,
    lineage: blocked ? null : lineage,
    rollback,
    compatibilityFallback: false as const,
  });
  TRUSTED_RESULTS.add(result);
  return result;
}

function makeBlockedResult(
  raw: unknown,
  diagnostics: readonly StrictCutoverDiagnostic[],
): StrictGovernanceGraphCutoverResult {
  const input = isRecord(raw) ? raw : {};
  const result = deepFreeze({
    version: STRICT_GOVERNANCE_CUTOVER_VERSION,
    ticket: STRICT_GOVERNANCE_CUTOVER_TICKET,
    mode: (input.mode === "preview" ||
    input.mode === "dry-run" ||
    input.mode === "actual"
      ? input.mode
      : "preview") as StrictCutoverMode,
    origin: (input.origin === "production" ||
    input.origin === "synthetic_fixture"
      ? input.origin
      : "synthetic_fixture") as StrictCutoverOrigin,
    public: input.public === true,
    asOfDate: STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE,
    status: "blocked" as const,
    strict: true as const,
    executable: false as const,
    diagnostics: [...diagnostics],
    commands: [] as const,
    articleCount: 0,
    orphanArticleCount: 0,
    brokenRelationshipCount: 0,
    pillarCount: 0,
    lineage: null,
    rollback: null,
    compatibilityFallback: false as const,
  });
  TRUSTED_RESULTS.add(result);
  return result;
}
