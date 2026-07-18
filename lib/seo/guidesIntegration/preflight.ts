import { z } from "zod";

import {
  CANONICAL_CLUSTER_DEFINITIONS,
  CANONICAL_CLUSTER_IDS,
  type ClusterId,
} from "../clusterSchema";
import { parseStrictGovernanceGraphCutoverDependency } from "../cutover";
import {
  diagnoseGraph,
  digestGraphInput,
  parseGraphInput,
  type GraphInput,
  type GraphNode,
} from "../graph";
import {
  validateGuidesIntegrationDescriptors,
  type GuidesIntegrationDescriptors,
} from "../guides";
import {
  buildUrlDispositionPreflight,
  computeUrlDispositionReportDigest,
  type UrlDispositionPreflightReport,
} from "../urlDispositions";
import {
  SOURCE_RETIREMENT_ARTIFACT_VERSION,
  SOURCE_RETIREMENT_SCHEMA_VERSION,
  computeSourceRetirementReportDigest,
} from "../sourceRetirement";
import {
  canonicalizeGuidesIntegrationValue,
  compareCodePoints,
  computeGuidesIntegrationArtifactDigest,
  computeGuidesIntegrationArtifactSubjectDigest,
  computeGuidesIntegrationTicket27BReportDigest,
  deepFreezeGuidesIntegration,
} from "./canonical";
import {
  GUIDES_INTEGRATION_REVIEW_MODALITIES,
  GUIDES_INTEGRATION_SCHEMA_VERSION,
  GUIDES_INTEGRATION_SURFACES,
  guidesIntegrationPreflightInputSchema,
  type GraphDigest,
  type GuidesIntegrationDestination,
  type GuidesIntegrationEvidence,
  type GuidesIntegrationHumanApproval,
  type GuidesIntegrationIdentity,
  type GuidesIntegrationIssue,
  type GuidesIntegrationPreflightInput,
  type GuidesIntegrationPreflightReport,
  type GuidesIntegrationReasonCode,
  type GuidesIntegrationSurfaceIdentity,
  type GuidesIntegrationSurfaceProjection,
  type Sha256Digest,
} from "./types";

const EXPECTED_MODEL_KEYS = [
  "status",
  "contractVersion",
  "source",
  "guides",
] as const;
const EXPECTED_BLOCKED_MODEL_KEYS = [
  "status",
  "contractVersion",
  "reasons",
] as const;
const EXPECTED_GUIDES_KEYS = [
  "kind",
  "elementId",
  "heading",
  "description",
  "pillars",
  "filters",
  "articles",
  "recent",
  "integration",
  "accessibility",
] as const;
const EXPECTED_PILLARS_KEYS = [
  "elementId",
  "headingElementId",
  "label",
  "items",
] as const;
const EXPECTED_LIST_KEYS = [
  "elementId",
  "headingElementId",
  "heading",
  "label",
  "items",
] as const;
const EXPECTED_FILTER_KEYS = [
  "label",
  "stateKey",
  "defaultValue",
  "stateTransport",
  "navigationEffect",
  "crawlPolicy",
  "statusElementId",
  "options",
] as const;
const EXPECTED_ACCESSIBILITY_KEYS = [
  "sectionLabel",
  "headingElementId",
  "relationships",
  "focusOrder",
  "reviewChecklist",
] as const;
const EXPECTED_RELATIONSHIP_KEYS = [
  "sectionLabelledBy",
  "pillarsLabelledBy",
  "recentLabelledBy",
  "filterControls",
  "filterStatus",
] as const;
const EXPECTED_PILLAR_CARD_KEYS = [
  "clusterId",
  "label",
  "order",
  "href",
  "contentId",
  "title",
  "description",
  "elementId",
  "linkLabel",
  "describedBy",
] as const;
const EXPECTED_ARTICLE_CARD_KEYS = [
  "contentId",
  "href",
  "title",
  "description",
  "clusterId",
  "clusterLabel",
  "contentRole",
  "publishedDate",
  "updatedDate",
  "governedDate",
  "governedVersion",
  "elementId",
  "linkLabel",
] as const;
const EXPECTED_FILTER_OPTION_KEYS = [
  "key",
  "value",
  "label",
  "position",
  "controlId",
  "ariaControls",
] as const;
const EXPECTED_REVIEW_ITEM_KEYS = ["modality", "label", "checks"] as const;
const EXPECTED_GUIDES_MODEL_REVIEW_MODALITIES = [
  "mobile",
  "desktop",
  "keyboard",
  "screen-reader",
] as const;
const EXPECTED_GUIDES_ROOT = {
  clusterId: null,
  contentId: "guides.discovery",
  route: "/article",
  canonicalRoute: "/article",
} as const;
const EXPECTED_PRODUCTION_EXECUTION_REASON =
  "This contract only builds a descriptive preflight report; it exposes no production mutation API.";

const PROVENANCE_CODES = new Set<GuidesIntegrationReasonCode>([
  "artifact-provenance-unapproved",
  "future-dated-evidence",
  "render-evidence-unapproved",
]);

interface MutableIssue {
  code: GuidesIntegrationReasonCode;
  path: string;
  message: string;
}

interface PillarIdentity extends GuidesIntegrationSurfaceIdentity {
  clusterId: ClusterId;
}

interface GuidesValidation {
  pillarIdentities: readonly Omit<PillarIdentity, "graphNodeId">[];
  modelReady: boolean;
  descriptors: GuidesIntegrationDescriptors | null;
}

interface GraphValidation {
  input: GraphInput | null;
  digest: GraphDigest | null;
  rootNodeId: string | null;
  pillarNodeIds: ReadonlyMap<ClusterId, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatPath(path: readonly PropertyKey[]): string {
  return path.length === 0 ? "input" : path.map(String).join(".");
}

function addIssue(
  issues: MutableIssue[],
  code: GuidesIntegrationReasonCode,
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}

function addUniqueIssue(
  issues: MutableIssue[],
  code: GuidesIntegrationReasonCode,
  path: string,
  message: string,
): void {
  if (
    issues.some(
      (issue) =>
        issue.code === code && issue.path === path && issue.message === message,
    )
  ) {
    return;
  }
  addIssue(issues, code, path, message);
}

function sortIssues(
  issues: readonly MutableIssue[],
): readonly GuidesIntegrationIssue[] {
  const unique = new Map<string, MutableIssue>();
  issues.forEach((issue) => {
    unique.set(`${issue.code}\u0000${issue.path}\u0000${issue.message}`, issue);
  });
  return [...unique.values()]
    .sort(
      (left, right) =>
        compareCodePoints(left.code, right.code) ||
        compareCodePoints(left.path, right.path) ||
        compareCodePoints(left.message, right.message),
    )
    .map((issue) => ({ ...issue }));
}

function exactKeys(
  value: unknown,
  expected: readonly string[],
  path: string,
  issues: MutableIssue[],
  code: GuidesIntegrationReasonCode = "guides-model-invalid",
): value is Record<string, unknown> {
  if (!isRecord(value)) {
    addUniqueIssue(issues, code, path, "Expected a plain object.");
    return false;
  }

  const expectedSet = new Set(expected);
  const actual = Object.keys(value);
  const missing = expected.filter(
    (key) => !Object.prototype.hasOwnProperty.call(value, key),
  );
  const unexpected = actual.filter((key) => !expectedSet.has(key));
  if (missing.length > 0 || unexpected.length > 0) {
    const details = [
      ...(missing.length > 0 ? [`missing: ${missing.join(", ")}`] : []),
      ...(unexpected.length > 0
        ? [`unexpected: ${unexpected.sort(compareCodePoints).join(", ")}`]
        : []),
    ].join("; ");
    addUniqueIssue(issues, code, path, `Exact-key check failed (${details}).`);
    return false;
  }
  return true;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asArray(value: unknown): readonly unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function tryCanonicalize(value: unknown): string | null {
  try {
    return canonicalizeGuidesIntegrationValue(value);
  } catch {
    return null;
  }
}

function tryDigest(value: unknown): Sha256Digest | null {
  try {
    return computeGuidesIntegrationArtifactDigest(value);
  } catch {
    return null;
  }
}

function isFutureEvidence(
  evidence: GuidesIntegrationEvidence,
  asOf: string,
): boolean {
  return evidence.capturedAt.slice(0, 10) > asOf;
}

function checkEvidence(
  evidence: GuidesIntegrationEvidence | null,
  path: string,
  asOf: string,
  issues: MutableIssue[],
  requireProduction: boolean,
): void {
  if (!evidence) {
    addUniqueIssue(
      issues,
      requireProduction ? "artifact-provenance-unapproved" : "input-invalid",
      path,
      "Evidence is required before production readiness can be claimed.",
    );
    return;
  }

  if (isFutureEvidence(evidence, asOf)) {
    addUniqueIssue(
      issues,
      "future-dated-evidence",
      path,
      `Evidence captured at ${evidence.capturedAt} is later than asOf ${asOf}.`,
    );
  }

  if (
    requireProduction &&
    (evidence.origin !== "production" || !evidence.public)
  ) {
    addUniqueIssue(
      issues,
      "artifact-provenance-unapproved",
      path,
      "Fixture or non-public evidence cannot satisfy a production integration preflight.",
    );
  }
}

function checkArtifactProvenance(
  artifact: GuidesIntegrationPreflightInput["artifact"],
  asOf: string,
  issues: MutableIssue[],
): void {
  if (!artifact) {
    addUniqueIssue(
      issues,
      "artifact-missing",
      "artifact",
      "A versioned artifact with digest and report digest is required.",
    );
    return;
  }

  if (artifact.origin !== "production" || !artifact.public) {
    addUniqueIssue(
      issues,
      "artifact-provenance-unapproved",
      "artifact",
      "Fixture or non-public artifacts are test-only and cannot become production artifacts.",
    );
  }
  if (
    artifact.evidence.origin !== artifact.origin ||
    artifact.evidence.public !== artifact.public
  ) {
    addUniqueIssue(
      issues,
      "artifact-provenance-unapproved",
      "artifact.evidence",
      "Artifact and evidence provenance must match exactly.",
    );
  }
  checkEvidence(artifact.evidence, "artifact.evidence", asOf, issues, true);
}

function validateTicket13(
  raw: GuidesIntegrationPreflightInput["ticket13Cutover"],
  graphDigest: GraphDigest | null,
  asOf: string,
  issues: MutableIssue[],
): void {
  if (!raw) {
    addUniqueIssue(
      issues,
      "ticket13-missing",
      "ticket13Cutover",
      "The strict Ticket 13 scaffold dependency is required.",
    );
    return;
  }

  let dependency;
  try {
    dependency = parseStrictGovernanceGraphCutoverDependency(raw);
  } catch (error) {
    addUniqueIssue(
      issues,
      "ticket13-invalid",
      "ticket13Cutover",
      error instanceof Error
        ? error.message
        : "Ticket 13 dependency is invalid.",
    );
    return;
  }

  if (dependency.asOf !== asOf) {
    addUniqueIssue(
      issues,
      "ticket13-as-of-mismatch",
      "ticket13Cutover.asOf",
      "Ticket 13 and GuidesIntegration must share one explicit asOf date.",
    );
  }
  if (!graphDigest || dependency.graphDigest !== graphDigest) {
    addUniqueIssue(
      issues,
      "ticket13-digest-drift",
      "ticket13Cutover.graphDigest",
      "Ticket 13 graph digest does not match the current governed graph.",
    );
  }
}

function validateTicket27B(
  report: GuidesIntegrationPreflightInput["ticket27BReport"],
  ticket25: GuidesIntegrationPreflightInput["ticket25"],
  graphDigest: GraphDigest | null,
  artifactDigest: Sha256Digest | null,
  asOf: string,
  issues: MutableIssue[],
): void {
  if (!report) {
    addUniqueIssue(
      issues,
      "ticket27b-missing",
      "ticket27BReport",
      "A deterministic Ticket 27B recommendations/diagnostics report is required.",
    );
    return;
  }
  if (report.status !== "ready") {
    addUniqueIssue(
      issues,
      "ticket27b-blocked",
      "ticket27BReport.status",
      "Ticket 27B recommendations/diagnostics are blocked.",
    );
  }
  checkNoExecution(
    report.productionExecution,
    "ticket27BReport.productionExecution",
    issues,
  );
  if (report.asOf.slice(0, 10) > asOf) {
    addUniqueIssue(
      issues,
      "future-dated-evidence",
      "ticket27BReport.asOf",
      `Ticket 27B asOf ${report.asOf} is later than GuidesIntegration asOf ${asOf}.`,
    );
  }
  if (
    report.asOf.slice(0, 10) !== asOf ||
    report.lineage.asOf !== report.asOf
  ) {
    addUniqueIssue(
      issues,
      "ticket27b-lineage-drift",
      "ticket27BReport.lineage.asOf",
      "Ticket 27B must share the explicit asOf and preserve it in lineage.",
    );
  }
  const ticket25ReportDigest = ticket25?.sourceRetirementReport.reportDigest;
  if (
    !graphDigest ||
    report.graphDigest !== graphDigest ||
    report.lineage.graphDigest !== graphDigest ||
    !ticket25ReportDigest ||
    report.lineage.ticket25ReportDigest !== ticket25ReportDigest ||
    !artifactDigest ||
    report.artifactDigest !== artifactDigest ||
    report.lineage.artifactDigest !== artifactDigest
  ) {
    addUniqueIssue(
      issues,
      "ticket27b-lineage-drift",
      "ticket27BReport.lineage",
      "Ticket 27B lineage does not bind Ticket 25, the governed graph, and the integration artifact.",
    );
  }
  if (
    computeGuidesIntegrationTicket27BReportDigest(report) !==
    report.reportDigest
  ) {
    addUniqueIssue(
      issues,
      "ticket27b-digest-drift",
      "ticket27BReport.reportDigest",
      "Ticket 27B report digest does not match its canonical non-self-referential subject.",
    );
  }
}

function validateUrlDispositionPreflight(
  dependency: GuidesIntegrationPreflightInput["urlDispositionPreflight"],
  disposition: GuidesIntegrationPreflightInput["urlDisposition"],
  asOf: string,
  issues: MutableIssue[],
): void {
  if (!dependency) {
    addUniqueIssue(
      issues,
      "url-disposition-report-missing",
      "urlDispositionPreflight",
      "A strict Ticket 24 input/report dependency is required.",
    );
    return;
  }

  const { input, report } = dependency;
  const rebuilt = buildUrlDispositionPreflight(input);
  const { reportDigest: _reportDigest, ...reportSubject } = report;
  void _reportDigest;
  const canonicalReportDigest = computeUrlDispositionReportDigest(
    reportSubject as unknown as Omit<
      UrlDispositionPreflightReport,
      "reportDigest"
    >,
  );
  if (
    input.asOf.slice(0, 10) !== asOf ||
    report.asOf?.slice(0, 10) !== asOf ||
    canonicalReportDigest !== report.reportDigest ||
    canonicalizeGuidesIntegrationValue(rebuilt) !==
      canonicalizeGuidesIntegrationValue(report)
  ) {
    addUniqueIssue(
      issues,
      "url-disposition-report-invalid",
      "urlDispositionPreflight",
      "Ticket 24 input/report identity, asOf, or canonical digest has drifted.",
    );
  }
  if (
    report.status !== "approved_for_preflight" ||
    report.blockers.length !== 0 ||
    report.releaseGate.status !== "satisfied" ||
    report.releaseGate.verifiedReportDigest !== report.reportDigest ||
    !report.artifactDigest ||
    report.releaseGate.artifactDigest !== report.artifactDigest ||
    report.unaffectedUrls.status !== "satisfied" ||
    report.dispositions.some((item) => item.status !== "validated") ||
    report.productionExecution.supported !== false ||
    report.productionExecution.allowed !== false
  ) {
    addUniqueIssue(
      issues,
      "url-disposition-report-invalid",
      "urlDispositionPreflight.report",
      "Ticket 24 governance, release gate, dispositions, rollback-bound input, unaffected report, and execution lock must all pass.",
    );
  }
  if (
    input.plan.version !== 1 ||
    report.version !== 1 ||
    !input.releaseContract ||
    input.releaseContract.state !== "production_approved" ||
    input.releaseContract.artifactDigest !== report.artifactDigest ||
    input.releaseContract.reportDigest !== report.reportDigest ||
    input.releaseContract.contentApproval.reportDigest !==
      report.reportDigest ||
    input.releaseContract.productionApproval.reportDigest !==
      report.reportDigest ||
    input.releaseContract.contentApproval.actor.id !==
      report.releaseGate.contentApprover ||
    input.releaseContract.productionApproval.actor.id !==
      report.releaseGate.productionApprover ||
    input.releaseContract.contentApproval.actor.id ===
      input.releaseContract.productionApproval.actor.id ||
    input.approvals.some(
      (approval) => approval.artifactDigest !== report.artifactDigest,
    ) ||
    input.plan.records.some(
      (record) =>
        record.rollback.note.length === 0 ||
        record.rollback.conditions.length === 0,
    )
  ) {
    addUniqueIssue(
      issues,
      "url-disposition-report-invalid",
      "urlDispositionPreflight.input",
      "Ticket 24 schema versions, human approvals, canonical artifact/report digests, rollback, and release lineage must remain bound.",
    );
  }
  if (
    disposition &&
    (disposition.artifactDigest !== report.artifactDigest ||
      disposition.reportDigest !== report.reportDigest)
  ) {
    addUniqueIssue(
      issues,
      "url-disposition-digest-drift",
      "urlDisposition",
      "Guides destinations must reference the canonical Ticket 24 artifact and report digests.",
    );
  }
}

function validateTicket25(
  ticket25: GuidesIntegrationPreflightInput["ticket25"],
  asOf: string,
  issues: MutableIssue[],
): void {
  if (!ticket25) {
    addUniqueIssue(
      issues,
      "ticket25-missing",
      "ticket25",
      "A strict Ticket 25 source-retirement preflight report reference is required.",
    );
    return;
  }

  const report = ticket25.sourceRetirementReport;
  if (report.asOf !== asOf) {
    addUniqueIssue(
      issues,
      "ticket25-as-of-mismatch",
      "ticket25.sourceRetirementReport.asOf",
      "Ticket 25 and GuidesIntegration must share one explicit asOf date.",
    );
  }
  if (report.version !== SOURCE_RETIREMENT_SCHEMA_VERSION) {
    addUniqueIssue(
      issues,
      "ticket25-schema-version-mismatch",
      "ticket25.sourceRetirementReport.version",
      "Ticket 25 report schema version is unsupported.",
    );
  }
  if (report.artifact.version !== SOURCE_RETIREMENT_ARTIFACT_VERSION) {
    addUniqueIssue(
      issues,
      "ticket25-artifact-version-mismatch",
      "ticket25.sourceRetirementReport.artifact.version",
      "Ticket 25 report artifact version is unsupported.",
    );
  }
  if (report.status !== "preview_ready") {
    addUniqueIssue(
      issues,
      "ticket25-blocked",
      "ticket25.sourceRetirementReport.status",
      "Ticket 25 source-retirement preflight is not preview_ready.",
    );
  }
  if (report.blockers.length > 0) {
    addUniqueIssue(
      issues,
      "ticket25-blockers-present",
      "ticket25.sourceRetirementReport.blockers",
      "Ticket 25 report contains blockers and cannot satisfy integration.",
    );
  }
  if (!report.artifact.digest) {
    addUniqueIssue(
      issues,
      "ticket25-digest-drift",
      "ticket25.sourceRetirementReport.artifact.digest",
      "Ticket 25 report must expose its own canonical artifact digest.",
    );
  }
  const { reportDigest, ...subject } = report;
  if (computeSourceRetirementReportDigest(subject) !== reportDigest) {
    addUniqueIssue(
      issues,
      "ticket25-report-digest-drift",
      "ticket25.sourceRetirementReport.reportDigest",
      "Ticket 25 report digest is missing or does not match its canonical report subject.",
    );
  }
  if (
    report.productionExecution.supported !== false ||
    report.productionExecution.allowed !== false ||
    report.retirementExecution.supported !== false ||
    report.retirementExecution.allowed !== false
  ) {
    addUniqueIssue(
      issues,
      "ticket25-execution-unsafe",
      "ticket25.sourceRetirementReport",
      "Ticket 25 dependency must remain fail-closed with no execution capability.",
    );
  }
}

function checkArrayShape(
  value: unknown,
  path: string,
  issues: MutableIssue[],
): readonly unknown[] | null {
  const array = asArray(value);
  if (!array) {
    addUniqueIssue(issues, "guides-model-invalid", path, "Expected an array.");
    return null;
  }
  return array;
}

function validateGuidesModelShape(
  model: unknown,
  issues: MutableIssue[],
): { ready: boolean; section: Record<string, unknown> | null } {
  if (!isRecord(model)) {
    addUniqueIssue(
      issues,
      "guides-model-invalid",
      "guides.model",
      "Expected a Guides model object.",
    );
    return { ready: false, section: null };
  }

  if (model.status === "blocked") {
    if (
      !exactKeys(model, EXPECTED_BLOCKED_MODEL_KEYS, "guides.model", issues)
    ) {
      return { ready: false, section: null };
    }
    addUniqueIssue(
      issues,
      "guides-blocked",
      "guides.model.status",
      "Ticket 26 Guides discovery model is blocked.",
    );
    return { ready: false, section: null };
  }

  if (
    model.status !== "ready" ||
    !exactKeys(model, EXPECTED_MODEL_KEYS, "guides.model", issues)
  ) {
    addUniqueIssue(
      issues,
      "guides-model-invalid",
      "guides.model",
      "Ticket 26 Guides discovery model must be the exact ready result shape.",
    );
    return { ready: false, section: null };
  }

  if (model.contractVersion !== 1 || !isRecord(model.guides)) {
    addUniqueIssue(
      issues,
      "guides-model-invalid",
      "guides.model",
      "Guides model contractVersion and ready section are invalid.",
    );
    return { ready: false, section: null };
  }

  const section = model.guides;
  exactKeys(section, EXPECTED_GUIDES_KEYS, "guides.model.guides", issues);
  return { ready: true, section };
}

function validateGuidesCards(
  section: Record<string, unknown>,
  issues: MutableIssue[],
): readonly Omit<PillarIdentity, "graphNodeId">[] {
  const pillars = isRecord(section.pillars) ? section.pillars : null;
  if (
    !pillars ||
    !exactKeys(
      pillars,
      EXPECTED_PILLARS_KEYS,
      "guides.model.guides.pillars",
      issues,
    )
  ) {
    return [];
  }

  const pillarItems = checkArrayShape(
    pillars.items,
    "guides.model.guides.pillars.items",
    issues,
  );
  if (!pillarItems || pillarItems.length !== CANONICAL_CLUSTER_IDS.length) {
    addUniqueIssue(
      issues,
      "guides-pillars-incomplete",
      "guides.model.guides.pillars.items",
      `Exactly ${CANONICAL_CLUSTER_IDS.length} canonical Guides pillars are required.`,
    );
  }

  const identities: Array<Omit<PillarIdentity, "graphNodeId">> = [];
  const seenClusters = new Set<string>();
  (pillarItems ?? []).forEach((item, index) => {
    const path = `guides.model.guides.pillars.items.${index}`;
    if (!exactKeys(item, EXPECTED_PILLAR_CARD_KEYS, path, issues)) return;
    const record = item as Record<string, unknown>;
    const clusterId = record.clusterId;
    const canonical = CANONICAL_CLUSTER_DEFINITIONS[index];
    if (clusterId !== canonical?.id) {
      addUniqueIssue(
        issues,
        "guides-pillars-incomplete",
        `${path}.clusterId`,
        `Pillar ${index} must be canonical cluster ${canonical?.id ?? "(missing)"}.`,
      );
    }
    if (typeof clusterId === "string") {
      if (seenClusters.has(clusterId)) {
        addUniqueIssue(
          issues,
          "guides-pillars-incomplete",
          `${path}.clusterId`,
          "Canonical pillar cluster IDs must be unique.",
        );
      }
      seenClusters.add(clusterId);
    }
    const route = asString(record.href);
    const contentId = asString(record.contentId);
    if (!route || !contentId) {
      addUniqueIssue(
        issues,
        "guides-pillars-incomplete",
        path,
        "Every canonical pillar must expose a content identity and route.",
      );
    }
    if (typeof clusterId === "string" && route && contentId) {
      const elementId = asString(record.elementId);
      const describedBy = asString(record.describedBy);
      if (elementId !== `guides-pillar-${clusterId}`) {
        addUniqueIssue(
          issues,
          "accessibility-id-collision",
          `${path}.elementId`,
          "Canonical pillar DOM IDs must be derived from the canonical cluster ID.",
        );
      }
      if (describedBy !== `guides-pillar-description-${clusterId}`) {
        addUniqueIssue(
          issues,
          "accessibility-id-collision",
          `${path}.describedBy`,
          "Canonical pillar accessibility description IDs must be deterministic.",
        );
      }
      identities.push({
        clusterId: clusterId as ClusterId,
        contentId,
        route,
        canonicalRoute: route,
      });
    }
  });

  return identities;
}

function validateList(
  section: Record<string, unknown>,
  key: "articles" | "recent",
  issues: MutableIssue[],
): void {
  const list = section[key];
  const path = `guides.model.guides.${key}`;
  if (!exactKeys(list, EXPECTED_LIST_KEYS, path, issues)) return;
  const record = list as Record<string, unknown>;
  const items = checkArrayShape(record.items, `${path}.items`, issues);
  const context = key === "articles" ? "browse" : "recent";
  (items ?? []).forEach((item, index) => {
    const itemPath = `${path}.items.${index}`;
    if (!exactKeys(item, EXPECTED_ARTICLE_CARD_KEYS, itemPath, issues)) return;
    const article = item as Record<string, unknown>;
    const contentId = asString(article.contentId);
    const elementId = asString(article.elementId);
    if (contentId && elementId && contentId.startsWith("article.")) {
      const expectedElementId = `guides-${context}-article-${contentId.slice("article.".length)}`;
      if (elementId !== expectedElementId) {
        addUniqueIssue(
          issues,
          "accessibility-id-collision",
          `${itemPath}.elementId`,
          "Browse and recent article DOM IDs must be derived deterministically from content identity.",
        );
      }
    }
  });
}

function validateFilters(
  section: Record<string, unknown>,
  issues: MutableIssue[],
): void {
  const filter = section.filters;
  if (
    !exactKeys(
      filter,
      EXPECTED_FILTER_KEYS,
      "guides.model.guides.filters",
      issues,
    )
  )
    return;
  const record = filter as Record<string, unknown>;
  if (
    record.stateKey !== "cluster" ||
    record.defaultValue !== "all" ||
    record.stateTransport !== "component-memory" ||
    record.navigationEffect !== "none" ||
    record.crawlPolicy !== "single-document"
  ) {
    addUniqueIssue(
      issues,
      "guides-filter-crawlable",
      "guides.model.guides.filters",
      "Guides filters must remain component-memory, non-navigational, and single-document.",
    );
  }
  const options = checkArrayShape(
    record.options,
    "guides.model.guides.filters.options",
    issues,
  );
  if (!options || options.length !== CANONICAL_CLUSTER_IDS.length + 1) {
    addUniqueIssue(
      issues,
      "guides-filter-crawlable",
      "guides.model.guides.filters.options",
      "Guides filters must expose one all option and five canonical cluster options.",
    );
  }
  const ids = new Set<string>();
  (options ?? []).forEach((option, index) => {
    const path = `guides.model.guides.filters.options.${index}`;
    if (!exactKeys(option, EXPECTED_FILTER_OPTION_KEYS, path, issues)) return;
    const recordOption = option as Record<string, unknown>;
    const controlId = asString(recordOption.controlId);
    const ariaControls = asString(recordOption.ariaControls);
    if (controlId) {
      if (ids.has(controlId)) {
        addUniqueIssue(
          issues,
          "accessibility-id-collision",
          `${path}.controlId`,
          "Filter control IDs must be unique.",
        );
      }
      ids.add(controlId);
    }
    const expectedControlId =
      index === 0
        ? "guides-filter-all"
        : `guides-filter-${CANONICAL_CLUSTER_IDS[index - 1]}`;
    if (controlId !== expectedControlId) {
      addUniqueIssue(
        issues,
        "accessibility-id-collision",
        `${path}.controlId`,
        "Filter control IDs must preserve the canonical deterministic sequence.",
      );
    }
    const articlesElementId =
      section.articles && isRecord(section.articles)
        ? section.articles.elementId
        : null;
    if (ariaControls !== articlesElementId) {
      addUniqueIssue(
        issues,
        "accessibility-id-collision",
        `${path}.ariaControls`,
        "Filter controls must reference the stable browse article list ID.",
      );
    }
    if (ariaControls && /[?#]/u.test(ariaControls)) {
      addUniqueIssue(
        issues,
        "guides-filter-crawlable",
        `${path}.ariaControls`,
        "Filter accessibility references must not be URLs.",
      );
    }
    [
      "href",
      "url",
      "route",
      "path",
      "query",
      "resultUrl",
      "resultPage",
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(recordOption, key)) {
        addUniqueIssue(
          issues,
          "guides-filter-crawlable",
          `${path}.${key}`,
          "Filter state must not expose crawlable result URLs.",
        );
      }
    });
  });
}

function validateAccessibility(
  section: Record<string, unknown>,
  issues: MutableIssue[],
): void {
  const accessibility = section.accessibility;
  if (
    !exactKeys(
      accessibility,
      EXPECTED_ACCESSIBILITY_KEYS,
      "guides.model.guides.accessibility",
      issues,
    )
  )
    return;
  const record = accessibility as Record<string, unknown>;
  if (
    !exactKeys(
      record.relationships,
      EXPECTED_RELATIONSHIP_KEYS,
      "guides.model.guides.accessibility.relationships",
      issues,
    )
  )
    return;

  const review = checkArrayShape(
    record.reviewChecklist,
    "guides.model.guides.accessibility.reviewChecklist",
    issues,
  );
  const modalities = (review ?? []).map((item) =>
    isRecord(item) ? item.modality : null,
  );
  if (
    review === null ||
    review.length !== EXPECTED_GUIDES_MODEL_REVIEW_MODALITIES.length ||
    EXPECTED_GUIDES_MODEL_REVIEW_MODALITIES.some(
      (modality) => !modalities.includes(modality),
    )
  ) {
    addUniqueIssue(
      issues,
      "accessibility-review-incomplete",
      "guides.model.guides.accessibility.reviewChecklist",
      "Mobile, desktop, keyboard, and screen-reader review descriptors are all required.",
    );
  }
  (review ?? []).forEach((item, index) => {
    const path = `guides.model.guides.accessibility.reviewChecklist.${index}`;
    if (!exactKeys(item, EXPECTED_REVIEW_ITEM_KEYS, path, issues)) return;
    const checks = checkArrayShape(
      (item as Record<string, unknown>).checks,
      `${path}.checks`,
      issues,
    );
    if (!checks || checks.length === 0) {
      addUniqueIssue(
        issues,
        "accessibility-review-incomplete",
        `${path}.checks`,
        "Each accessibility modality needs explicit checks.",
      );
    }
  });

  const declarationIds: string[] = [];
  const referenceIds: string[] = [];
  const addDeclaration = (value: unknown, path: string) => {
    if (typeof value !== "string" || value.length === 0) {
      addUniqueIssue(
        issues,
        "accessibility-id-collision",
        path,
        "Accessibility IDs must be stable non-empty strings.",
      );
      return;
    }
    declarationIds.push(value);
  };
  const addReference = (value: unknown, path: string) => {
    if (typeof value === "string" && value.length > 0) referenceIds.push(value);
    else
      addUniqueIssue(
        issues,
        "accessibility-id-collision",
        path,
        "Accessibility references must resolve to stable IDs.",
      );
  };

  addDeclaration(section.elementId, "guides.model.guides.elementId");
  const integration = section.integration;
  addDeclaration(
    integration && isRecord(integration) && isRecord(integration.navigation)
      ? integration.navigation.elementId
      : null,
    "guides.model.guides.integration.navigation.elementId",
  );
  addDeclaration(
    section.pillars && isRecord(section.pillars)
      ? section.pillars.elementId
      : null,
    "guides.model.guides.pillars.elementId",
  );
  addDeclaration(
    section.pillars && isRecord(section.pillars)
      ? section.pillars.headingElementId
      : null,
    "guides.model.guides.pillars.headingElementId",
  );
  addDeclaration(
    section.articles && isRecord(section.articles)
      ? section.articles.elementId
      : null,
    "guides.model.guides.articles.elementId",
  );
  addDeclaration(
    section.articles && isRecord(section.articles)
      ? section.articles.headingElementId
      : null,
    "guides.model.guides.articles.headingElementId",
  );
  addDeclaration(
    section.recent && isRecord(section.recent)
      ? section.recent.elementId
      : null,
    "guides.model.guides.recent.elementId",
  );
  addDeclaration(
    section.recent && isRecord(section.recent)
      ? section.recent.headingElementId
      : null,
    "guides.model.guides.recent.headingElementId",
  );
  addDeclaration(
    record.headingElementId,
    "guides.model.guides.accessibility.headingElementId",
  );
  addDeclaration(
    section.filters && isRecord(section.filters)
      ? section.filters.statusElementId
      : null,
    "guides.model.guides.filters.statusElementId",
  );

  const pillars =
    section.pillars && isRecord(section.pillars) ? section.pillars.items : null;
  (Array.isArray(pillars) ? pillars : []).forEach((item) => {
    if (!isRecord(item)) return;
    addDeclaration(
      item.elementId,
      "guides.model.guides.pillars.items.elementId",
    );
    addReference(
      item.describedBy,
      "guides.model.guides.pillars.items.describedBy",
    );
  });
  ["articles", "recent"].forEach((key) => {
    const list = section[key];
    if (!isRecord(list) || !Array.isArray(list.items)) return;
    list.items.forEach((item) => {
      if (isRecord(item))
        addDeclaration(
          item.elementId,
          `guides.model.guides.${key}.items.elementId`,
        );
    });
  });
  const filters = section.filters;
  if (isRecord(filters) && Array.isArray(filters.options)) {
    filters.options.forEach((option) => {
      if (isRecord(option)) {
        addDeclaration(
          option.controlId,
          "guides.model.guides.filters.options.controlId",
        );
        addReference(
          option.ariaControls,
          "guides.model.guides.filters.options.ariaControls",
        );
      }
    });
  }

  const duplicate = declarationIds.find(
    (id, index) => declarationIds.indexOf(id) !== index,
  );
  if (duplicate) {
    addUniqueIssue(
      issues,
      "accessibility-id-collision",
      "guides.model.guides",
      `DOM ID ${duplicate} is declared more than once.`,
    );
  }
  const declared = new Set(declarationIds);
  referenceIds.forEach((id) => {
    if (!declared.has(id)) {
      // describedBy may point to a renderer-owned description node; it is still
      // required to be stable and distinct from every declared interactive ID.
      if (!id.startsWith("guides-pillar-description-")) {
        addUniqueIssue(
          issues,
          "accessibility-id-collision",
          "guides.model.guides.accessibility",
          `Accessibility reference ${id} does not resolve to a declared ID.`,
        );
      }
    }
  });

  const focusOrder = record.focusOrder;
  if (
    !Array.isArray(focusOrder) ||
    focusOrder.some((item) => typeof item !== "string")
  ) {
    addUniqueIssue(
      issues,
      "accessibility-review-incomplete",
      "guides.model.guides.accessibility.focusOrder",
      "Focus order must be a stable string reference list.",
    );
  } else {
    const seen = new Set<string>();
    focusOrder.forEach((id) => {
      if (seen.has(id))
        addUniqueIssue(
          issues,
          "accessibility-id-collision",
          "guides.model.guides.accessibility.focusOrder",
          `Focus order repeats ${id}.`,
        );
      seen.add(id);
      if (!declared.has(id))
        addUniqueIssue(
          issues,
          "accessibility-id-collision",
          "guides.model.guides.accessibility.focusOrder",
          `Focus order references undeclared ID ${id}.`,
        );
    });
  }
}

function validateGuides(
  guides: GuidesIntegrationPreflightInput["guides"],
  artifactDigest: Sha256Digest | null,
  asOf: string,
  issues: MutableIssue[],
): GuidesValidation {
  if (guides.origin !== "production" || !guides.public) {
    addUniqueIssue(
      issues,
      "artifact-provenance-unapproved",
      "guides",
      "Fixture or non-public Guides model material is test-only.",
    );
  }
  checkEvidence(guides.evidence, "guides.evidence", asOf, issues, true);

  const modelShape = validateGuidesModelShape(guides.model, issues);
  if (!modelShape.ready || !modelShape.section) {
    return { pillarIdentities: [], modelReady: false, descriptors: null };
  }
  const section = modelShape.section;
  const pillarIdentities = validateGuidesCards(section, issues);
  validateList(section, "articles", issues);
  validateList(section, "recent", issues);
  validateFilters(section, issues);
  validateAccessibility(section, issues);

  const descriptorValidation = validateGuidesIntegrationDescriptors(
    guides.descriptors,
  );
  if (descriptorValidation.status !== "valid") {
    addUniqueIssue(
      issues,
      "guides-descriptors-invalid",
      "guides.descriptors",
      descriptorValidation.reasons.join(" | "),
    );
  }
  const descriptors =
    descriptorValidation.status === "valid"
      ? descriptorValidation.descriptors
      : null;
  if (
    descriptors &&
    (tryCanonicalize(section.integration) === null ||
      tryCanonicalize(descriptors) === null ||
      tryCanonicalize(section.integration) !== tryCanonicalize(descriptors))
  ) {
    addUniqueIssue(
      issues,
      "guides-descriptors-invalid",
      "guides.model.guides.integration",
      "Ticket 26 model descriptors drift from the supplied descriptor artifact.",
    );
  }

  if (!guides.modelDigest || tryDigest(guides.model) !== guides.modelDigest) {
    addUniqueIssue(
      issues,
      "guides-digest-drift",
      "guides.modelDigest",
      "Guides model digest does not match the canonical model.",
    );
  }
  if (
    !guides.descriptorsDigest ||
    tryDigest(guides.descriptors) !== guides.descriptorsDigest
  ) {
    addUniqueIssue(
      issues,
      "guides-digest-drift",
      "guides.descriptorsDigest",
      "Guides descriptor digest does not match the canonical descriptor artifact.",
    );
  }
  if (artifactDigest && guides.modelDigest && guides.descriptorsDigest) {
    // The artifact digest is the release-level binding; model and descriptor
    // digests remain separate identities and must be referenced by projections.
    void artifactDigest;
  }
  return { pillarIdentities, modelReady: true, descriptors };
}

function findGraphRootNode(nodes: readonly GraphNode[]): GraphNode | null {
  const roots = nodes.filter(
    (node) =>
      node.nodeType === "root" &&
      node.destination === "/article" &&
      node.status === "published",
  );
  return roots.length === 1 ? roots[0] : null;
}

function validateGraph(
  graph: GuidesIntegrationPreflightInput["graph"],
  artifactDigest: Sha256Digest | null,
  guides: GuidesValidation,
  asOf: string,
  issues: MutableIssue[],
): GraphValidation {
  if (graph.origin !== "production" || !graph.public) {
    addUniqueIssue(
      issues,
      "artifact-provenance-unapproved",
      "graph",
      "Fixture or non-public graph material is test-only.",
    );
  }
  checkEvidence(graph.evidence, "graph.evidence", asOf, issues, true);

  if (!graph.input || graph.digest === null || graph.artifactDigest === null) {
    addUniqueIssue(
      issues,
      "graph-blocked",
      "graph",
      "A ready graph input, graph digest, and artifact binding are required.",
    );
    return {
      input: null,
      digest: null,
      rootNodeId: null,
      pillarNodeIds: new Map(),
    };
  }
  if (graph.artifactDigest !== artifactDigest || !artifactDigest) {
    addUniqueIssue(
      issues,
      "graph-artifact-drift",
      "graph.artifactDigest",
      "Graph artifact binding does not match the integration artifact.",
    );
  }

  let parsed: GraphInput;
  try {
    parsed = parseGraphInput(graph.input);
  } catch (error) {
    addUniqueIssue(
      issues,
      "graph-invalid",
      "graph.input",
      error instanceof Error ? error.message : "Graph input is invalid.",
    );
    return {
      input: null,
      digest: null,
      rootNodeId: null,
      pillarNodeIds: new Map(),
    };
  }
  if (parsed.status !== "ready") {
    addUniqueIssue(
      issues,
      "graph-blocked",
      "graph.input.status",
      "Ticket 27A graph is blocked because no live graph is available.",
    );
  }
  const actualDigest = digestGraphInput(parsed);
  if (actualDigest !== graph.digest) {
    addUniqueIssue(
      issues,
      "graph-digest-drift",
      "graph.digest",
      "Supplied graph digest does not match the canonical graph input.",
    );
  }

  const clusterIds = parsed.clusters.map((cluster) => cluster.id);
  if (
    clusterIds.length !== CANONICAL_CLUSTER_IDS.length ||
    clusterIds.some(
      (clusterId, index) => clusterId !== CANONICAL_CLUSTER_IDS[index],
    ) ||
    new Set(clusterIds).size !== clusterIds.length
  ) {
    addUniqueIssue(
      issues,
      "graph-cluster-set-mismatch",
      "graph.input.clusters",
      "Graph must contain the five canonical clusters exactly once and in canonical order.",
    );
  }

  const nodeById = new Map(parsed.nodes.map((node) => [node.id, node]));
  const root = findGraphRootNode(parsed.nodes);
  if (!root) {
    addUniqueIssue(
      issues,
      "graph-invalid",
      "graph.input.nodes",
      "Graph must contain exactly one published /article root node.",
    );
  }
  const pillarNodeIds = new Map<ClusterId, string>();
  guides.pillarIdentities.forEach((pillar) => {
    const cluster = parsed.clusters.find(
      (candidate) => candidate.id === pillar.clusterId,
    );
    const node = cluster?.pillarId ? nodeById.get(cluster.pillarId) : undefined;
    if (!cluster || !cluster.pillarId || !node) {
      addUniqueIssue(
        issues,
        "graph-route-mismatch",
        `graph.input.clusters.${pillar.clusterId}`,
        "Every Guides pillar must bind to a graph pillar node.",
      );
      return;
    }
    if (
      node.nodeType !== "article" ||
      node.status !== "published" ||
      node.cluster !== pillar.clusterId ||
      node.contentRole !== "pillar"
    ) {
      addUniqueIssue(
        issues,
        "graph-node-status-invalid",
        `graph.input.nodes.${node.id}`,
        "Guides pillar graph nodes must be live article pillar nodes in the same cluster.",
      );
    }
    if (node.destination !== pillar.route) {
      addUniqueIssue(
        issues,
        "graph-route-mismatch",
        `graph.input.nodes.${node.id}.destination`,
        "Graph pillar destination must equal the Ticket 26 canonical route.",
      );
    }
    pillarNodeIds.set(pillar.clusterId, node.id);
  });

  try {
    diagnoseGraph(parsed).forEach((diagnostic) => {
      if (diagnostic.severity === "hard") {
        addUniqueIssue(
          issues,
          "graph-invalid",
          `graph.diagnostics.${diagnostic.code}`,
          diagnostic.message,
        );
      }
    });
  } catch (error) {
    addUniqueIssue(
      issues,
      "graph-invalid",
      "graph.diagnostics",
      error instanceof Error ? error.message : "Graph diagnostics failed.",
    );
  }

  return {
    input: parsed,
    digest: graph.digest,
    rootNodeId: root?.id ?? null,
    pillarNodeIds,
  };
}

function expectedIdentities(
  guides: GuidesValidation,
  graph: GraphValidation,
): {
  root: GuidesIntegrationSurfaceIdentity;
  pillars: readonly PillarIdentity[];
} {
  const root: GuidesIntegrationSurfaceIdentity = {
    ...EXPECTED_GUIDES_ROOT,
    graphNodeId: graph.rootNodeId ?? "guides-root-missing",
  };
  const pillars = guides.pillarIdentities.map((pillar) => ({
    ...pillar,
    graphNodeId:
      graph.pillarNodeIds.get(pillar.clusterId) ?? "guides-pillar-missing",
  }));
  return { root, pillars };
}

function sameIdentity(
  left: GuidesIntegrationSurfaceIdentity,
  right: GuidesIntegrationSurfaceIdentity,
): boolean {
  return (
    left.clusterId === right.clusterId &&
    left.contentId === right.contentId &&
    left.route === right.route &&
    left.canonicalRoute === right.canonicalRoute &&
    left.graphNodeId === right.graphNodeId
  );
}

function validateDestination(
  destination: GuidesIntegrationDestination,
  expected: Omit<PillarIdentity, "graphNodeId">,
  index: number,
  issues: MutableIssue[],
): void {
  if (
    destination.clusterId !== expected.clusterId ||
    destination.contentId !== expected.contentId ||
    destination.route !== expected.route ||
    destination.canonicalRoute !== expected.canonicalRoute
  ) {
    addUniqueIssue(
      issues,
      "url-destination-mismatch",
      `urlDisposition.destinations.${index}`,
      "Approved destination does not match the canonical Guides identity.",
    );
  }
  if (destination.action === "retire") {
    addUniqueIssue(
      issues,
      "url-destination-mismatch",
      `urlDisposition.destinations.${index}.action`,
      "A Guides canonical pillar cannot be retired by this integration preflight.",
    );
  }
}

function validateUrlDisposition(
  disposition: GuidesIntegrationPreflightInput["urlDisposition"],
  artifact: GuidesIntegrationPreflightInput["artifact"],
  guides: GuidesValidation,
  asOf: string,
  issues: MutableIssue[],
): void {
  if (!disposition) {
    addUniqueIssue(
      issues,
      "url-disposition-missing",
      "urlDisposition",
      "Ticket 24 URL destinations and approvals are required.",
    );
    return;
  }
  if (disposition.status !== "approved") {
    addUniqueIssue(
      issues,
      "url-disposition-blocked",
      "urlDisposition.status",
      "URL disposition is not approved for integration.",
    );
  }
  checkNoExecution(
    disposition.productionExecution,
    "urlDisposition.productionExecution",
    issues,
  );
  const artifactDigest = artifact?.digest ?? null;
  if (!artifactDigest) {
    addUniqueIssue(
      issues,
      "url-disposition-digest-drift",
      "urlDisposition",
      "The integration artifact required for URL destination validation is missing.",
    );
  }
  if (disposition.destinations.length !== CANONICAL_CLUSTER_IDS.length) {
    addUniqueIssue(
      issues,
      "url-destination-mismatch",
      "urlDisposition.destinations",
      "Exactly five approved Guides destinations are required.",
    );
  }
  const seen = new Set<string>();
  disposition.destinations.forEach((destination, index) => {
    if (seen.has(destination.clusterId))
      addUniqueIssue(
        issues,
        "url-destination-mismatch",
        `urlDisposition.destinations.${index}.clusterId`,
        "Approved destinations must contain one record per canonical cluster.",
      );
    seen.add(destination.clusterId);
    const expected = guides.pillarIdentities[index];
    if (expected) validateDestination(destination, expected, index, issues);
  });
  if (disposition.destinations.length === 0) {
    addUniqueIssue(
      issues,
      "url-disposition-blocked",
      "urlDisposition.destinations",
      "No approved destination records can be treated as a passing integration plan.",
    );
  }
  if (disposition.productionExecution.allowed || asOf.length === 0) {
    addUniqueIssue(
      issues,
      "production-execution-unsupported",
      "urlDisposition.productionExecution",
      "Ticket 24 URL disposition execution remains permanently disabled.",
    );
  }
}

function validateSurfaceReferences(
  projection: GuidesIntegrationSurfaceProjection,
  expectedRoot: GuidesIntegrationSurfaceIdentity,
  expectedPillars: readonly PillarIdentity[],
  path: string,
  issues: MutableIssue[],
): void {
  if (!sameIdentity(projection.root, expectedRoot)) {
    addUniqueIssue(
      issues,
      "projection-identity-drift",
      `${path}.root`,
      "Surface root identity differs from the shared Guides identity.",
    );
  }
  if (
    projection.pillars.length !== expectedPillars.length ||
    projection.pillars.some(
      (pillar, index) =>
        !expectedPillars[index] ||
        !sameIdentity(pillar, expectedPillars[index]),
    )
  ) {
    addUniqueIssue(
      issues,
      "projection-identity-drift",
      `${path}.pillars`,
      "Surface pillars do not preserve the exact shared identity order.",
    );
  }
  const known = new Map<string, GuidesIntegrationSurfaceIdentity>([
    [expectedRoot.contentId, expectedRoot],
    ...expectedPillars.map((pillar) => [pillar.contentId, pillar] as const),
  ]);
  const referenceKeys = projection.references.map((reference) =>
    canonicalizeGuidesIntegrationValue(reference),
  );
  if (new Set(referenceKeys).size !== referenceKeys.length) {
    addUniqueIssue(
      issues,
      "projection-identity-drift",
      `${path}.references`,
      "Projection references must be unique.",
    );
  }
  if (
    tryCanonicalize(referenceKeys) !==
    tryCanonicalize([...referenceKeys].sort(compareCodePoints))
  ) {
    addUniqueIssue(
      issues,
      "projection-identity-drift",
      `${path}.references`,
      "Projection references must use deterministic canonical ordering.",
    );
  }
  projection.references.forEach((reference, index) => {
    const target = known.get(reference.targetContentId);
    const source = reference.sourceContentId
      ? known.get(reference.sourceContentId)
      : null;
    if (
      !target ||
      reference.targetRoute !== target.route ||
      reference.targetCanonicalRoute !== target.canonicalRoute ||
      reference.targetGraphNodeId !== target.graphNodeId
    ) {
      addUniqueIssue(
        issues,
        "projection-non-guides-leak",
        `${path}.references.${index}`,
        "Every projection reference must target a known Guides root or pillar identity.",
      );
    }
    if (reference.sourceContentId !== null && !source) {
      addUniqueIssue(
        issues,
        "projection-non-guides-leak",
        `${path}.references.${index}.sourceContentId`,
        "Projection reference sources must be known Guides identities.",
      );
    }
    const validKindBinding =
      (reference.kind === "root" &&
        reference.sourceContentId === null &&
        reference.targetContentId === expectedRoot.contentId) ||
      (reference.kind === "pillar" &&
        reference.sourceContentId === expectedRoot.contentId &&
        reference.targetContentId !== expectedRoot.contentId &&
        Boolean(target)) ||
      (reference.kind === "link" &&
        Boolean(source) &&
        Boolean(target) &&
        reference.sourceContentId !== reference.targetContentId);
    if (!validKindBinding) {
      addUniqueIssue(
        issues,
        "projection-identity-drift",
        `${path}.references.${index}.kind`,
        "Reference kind, source identity, and target identity are inconsistent.",
      );
    }
    if (
      reference.targetRoute.includes("?") ||
      reference.targetRoute.includes("#") ||
      reference.targetCanonicalRoute.includes("?") ||
      reference.targetCanonicalRoute.includes("#")
    ) {
      addUniqueIssue(
        issues,
        "projection-filter-crawlable",
        `${path}.references.${index}`,
        "Projection references must not contain query or fragment URLs.",
      );
    }
  });
  if (projection.filter) {
    if (
      projection.filter.queryResultUrls.length > 0 ||
      projection.filter.queryResultUrls.some((url) => /[?#]/u.test(url))
    ) {
      addUniqueIssue(
        issues,
        "projection-filter-crawlable",
        `${path}.filter.queryResultUrls`,
        "Filter projections must not create crawlable query-result URLs.",
      );
    }
  }
}

function validateProjections(
  projections: GuidesIntegrationPreflightInput["projections"],
  artifact: GuidesIntegrationPreflightInput["artifact"],
  graph: GraphValidation,
  guides: GuidesValidation,
  issues: MutableIssue[],
): void {
  if (!projections) {
    addUniqueIssue(
      issues,
      "projection-missing",
      "projections",
      "Route, canonical, sitemap, navigation, footer, breadcrumbs, and internal-link projections are required.",
    );
    return;
  }
  if (
    projections.artifactDigest !== artifact?.digest ||
    projections.graphDigest !== graph.digest
  ) {
    addUniqueIssue(
      issues,
      "projection-digest-drift",
      "projections",
      "Projection artifact and graph digests are not bound to the shared identities.",
    );
  }
  const { root: expectedRoot, pillars: expectedPillars } = expectedIdentities(
    guides,
    graph,
  );

  GUIDES_INTEGRATION_SURFACES.forEach((surface) => {
    const projection = projections.surfaces[surface];
    const path = `projections.surfaces.${surface}`;
    if (projection.surface !== surface) {
      addUniqueIssue(
        issues,
        "projection-surface-set-mismatch",
        `${path}.surface`,
        "Projection key and declared surface must match exactly.",
      );
    }
    if (
      projection.artifactDigest !== artifact?.digest ||
      projection.graphDigest !== graph.digest
    ) {
      addUniqueIssue(
        issues,
        "projection-digest-drift",
        path,
        "Surface projection digest binding drifted.",
      );
    }
    validateSurfaceReferences(
      projection,
      expectedRoot,
      expectedPillars,
      path,
      issues,
    );
  });

  const expectedSurfaces = [...GUIDES_INTEGRATION_SURFACES];
  if (
    projections.rollout.mode !== "all-or-nothing" ||
    projections.rollout.status !== "complete" ||
    tryCanonicalize(projections.rollout.expectedSurfaces) !==
      tryCanonicalize(expectedSurfaces) ||
    tryCanonicalize(projections.rollout.readySurfaces) !==
      tryCanonicalize(expectedSurfaces)
  ) {
    addUniqueIssue(
      issues,
      "rollout-partial",
      "projections.rollout",
      "Guides integration must be an all-or-nothing complete rollout across every surface.",
    );
  }
}

function checkNoExecution(
  value: { supported: false; allowed: false },
  path: string,
  issues: MutableIssue[],
): void {
  if (value.supported !== false || value.allowed !== false) {
    addUniqueIssue(
      issues,
      "production-execution-unsupported",
      path,
      "Production execution is intentionally unsupported by this pure contract layer.",
    );
  }
}

function checkHumanApproval(
  approval: GuidesIntegrationHumanApproval | null,
  expectedKind: GuidesIntegrationHumanApproval["kind"],
  path: string,
  artifact: GuidesIntegrationPreflightInput["artifact"],
  releaseId: string | null,
  asOf: string,
  issues: MutableIssue[],
): void {
  if (
    !approval ||
    approval.kind !== expectedKind ||
    approval.actor.type !== "human"
  ) {
    addUniqueIssue(
      issues,
      "approval-missing",
      path,
      `A human ${expectedKind} approval bound to the same release is required.`,
    );
    return;
  }
  if (
    approval.releaseId !== releaseId ||
    approval.artifactDigest !== artifact?.digest ||
    approval.reportDigest !== artifact?.reportDigest
  ) {
    addUniqueIssue(
      issues,
      "approval-digest-drift",
      path,
      "Human approval is not bound to the same release, artifact, and report digests.",
    );
  }
  if (approval.approvedAt.slice(0, 10) > asOf) {
    addUniqueIssue(
      issues,
      "future-dated-evidence",
      `${path}.approvedAt`,
      `Approval timestamp ${approval.approvedAt} is later than asOf ${asOf}.`,
    );
  }
  checkEvidence(approval.evidence, `${path}.evidence`, asOf, issues, true);
  if (approval.evidence.digest !== approval.artifactDigest) {
    addUniqueIssue(
      issues,
      "approval-digest-drift",
      `${path}.evidence.digest`,
      "Approval evidence digest must match its approved artifact digest.",
    );
  }
}

function validateReleaseAndApprovals(
  release: GuidesIntegrationPreflightInput["releaseBinding"],
  approvals: GuidesIntegrationPreflightInput["humanApprovals"],
  artifact: GuidesIntegrationPreflightInput["artifact"],
  asOf: string,
  issues: MutableIssue[],
): void {
  if (!release) {
    addUniqueIssue(
      issues,
      "release-unbound",
      "releaseBinding",
      "Release binding is required and must be production-approved for the same artifact digest.",
    );
  } else {
    if (
      !["production_approved", "deployed", "live_verified"].includes(
        release.state,
      )
    ) {
      addUniqueIssue(
        issues,
        "release-unbound",
        "releaseBinding.state",
        "Release must be production_approved or a later verified state.",
      );
    }
    if (
      release.artifactDigest !== artifact?.digest ||
      release.reportDigest !== artifact?.reportDigest
    ) {
      addUniqueIssue(
        issues,
        "release-digest-drift",
        "releaseBinding",
        "Release binding does not reference the same artifact and report digests.",
      );
    }
    checkHumanApproval(
      release.contentApproval,
      "content",
      "releaseBinding.contentApproval",
      artifact,
      release.releaseId,
      asOf,
      issues,
    );
    checkHumanApproval(
      release.productionApproval,
      "production",
      "releaseBinding.productionApproval",
      artifact,
      release.releaseId,
      asOf,
      issues,
    );
    if (
      release.contentApproval &&
      release.productionApproval &&
      release.contentApproval.actor.id === release.productionApproval.actor.id
    ) {
      addUniqueIssue(
        issues,
        "approval-not-independent",
        "releaseBinding",
        "Content and production approvals must be performed by different human actors.",
      );
    }
  }

  if (!approvals) {
    addUniqueIssue(
      issues,
      "approval-missing",
      "humanApprovals",
      "Integration and Guides human approvals are required.",
    );
    return;
  }
  checkHumanApproval(
    approvals.integration,
    "integration",
    "humanApprovals.integration",
    artifact,
    release?.releaseId ?? null,
    asOf,
    issues,
  );
  checkHumanApproval(
    approvals.guides,
    "guides",
    "humanApprovals.guides",
    artifact,
    release?.releaseId ?? null,
    asOf,
    issues,
  );
}

function validateRenderAcceptance(
  render: GuidesIntegrationPreflightInput["renderAcceptance"],
  artifact: GuidesIntegrationPreflightInput["artifact"],
  asOf: string,
  issues: MutableIssue[],
): void {
  if (!render) {
    addUniqueIssue(
      issues,
      "render-acceptance-missing",
      "renderAcceptance",
      "Real mobile, desktop, keyboard, and screen-reader acceptance is required.",
    );
    return;
  }
  if (render.status !== "passed") {
    addUniqueIssue(
      issues,
      "render-review-incomplete",
      "renderAcceptance.status",
      "Render acceptance must pass before integration readiness can be claimed.",
    );
  }
  if (render.artifactDigest !== artifact?.digest) {
    addUniqueIssue(
      issues,
      "render-artifact-digest-drift",
      "renderAcceptance.artifactDigest",
      "Render acceptance must bind to the current integration artifact digest.",
    );
  }
  if (!render.renderArtifactDigest) {
    addUniqueIssue(
      issues,
      "render-artifact-digest-drift",
      "renderAcceptance.renderArtifactDigest",
      "Render acceptance must identify the immutable rendered artifact digest.",
    );
  }
  GUIDES_INTEGRATION_REVIEW_MODALITIES.forEach((modality) => {
    const check = render.checks[modality];
    const path = `renderAcceptance.checks.${modality}`;
    if (check.status !== "passed")
      addUniqueIssue(
        issues,
        "render-review-incomplete",
        path,
        "Every required rendering/accessibility modality must pass.",
      );
    if (
      !check.evidence ||
      check.evidence.origin !== "production" ||
      !check.evidence.public
    ) {
      addUniqueIssue(
        issues,
        "render-evidence-unapproved",
        path,
        "Synthetic or non-public rendering evidence cannot satisfy production acceptance.",
      );
    }
    checkEvidence(check.evidence, `${path}.evidence`, asOf, issues, true);
    if (
      check.evidence &&
      check.evidence.digest !== render.renderArtifactDigest
    ) {
      addUniqueIssue(
        issues,
        "render-artifact-digest-drift",
        `${path}.evidence.digest`,
        "Render evidence must bind to the declared rendered artifact digest.",
      );
    }
  });
}

function readSafeAsOf(raw: unknown): string | null {
  return isRecord(raw) && typeof raw.asOf === "string" ? raw.asOf : null;
}

function buildReport(
  raw: unknown,
  parsed: GuidesIntegrationPreflightInput | null,
  blockers: readonly MutableIssue[],
  advisories: readonly MutableIssue[],
): GuidesIntegrationPreflightReport {
  const sortedBlockers = sortIssues(blockers);
  const sortedAdvisories = sortIssues(advisories);
  const artifact = parsed?.artifact ?? null;
  const graph = parsed?.graph ?? null;
  const identity: GuidesIntegrationIdentity = {
    artifactDigest: artifact?.digest ?? null,
    graphDigest: graph?.digest ?? null,
    modelDigest: parsed?.guides.modelDigest ?? null,
    descriptorsDigest: parsed?.guides.descriptorsDigest ?? null,
  };
  const observedPillars =
    parsed &&
    isRecord(parsed.guides.model) &&
    parsed.guides.model.status === "ready" &&
    isRecord(parsed.guides.model.guides) &&
    isRecord(parsed.guides.model.guides.pillars) &&
    Array.isArray(parsed.guides.model.guides.pillars.items)
      ? parsed.guides.model.guides.pillars.items.length
      : null;
  const observedSurfaces = parsed?.projections
    ? Object.keys(parsed.projections.surfaces).length
    : null;
  const contractStatus: GuidesIntegrationPreflightReport["contractStatus"] =
    sortedBlockers.every((issue) => PROVENANCE_CODES.has(issue.code))
      ? "pass"
      : sortedBlockers.length === 0
        ? "pass"
        : "blocked";
  const status: GuidesIntegrationPreflightReport["status"] =
    sortedBlockers.length === 0 &&
    artifact?.origin === "production" &&
    artifact.public
      ? "ready"
      : "blocked";
  const base = {
    schemaVersion: GUIDES_INTEGRATION_SCHEMA_VERSION,
    contractVersion: 1 as const,
    asOf: parsed?.asOf ?? readSafeAsOf(raw),
    status,
    contractStatus,
    artifactExportable: false as const,
    artifactOrigin: artifact?.origin ?? null,
    productionExecution: {
      supported: false as const,
      allowed: false as const,
      reason: EXPECTED_PRODUCTION_EXECUTION_REASON,
    },
    identity,
    counts: {
      expectedPillars: 5 as const,
      observedPillars,
      expectedSurfaces: 7 as const,
      observedSurfaces,
      blockerCount: sortedBlockers.length,
      advisoryCount: sortedAdvisories.length,
    },
    blockers: sortedBlockers,
    advisories: sortedAdvisories,
  };
  const reportDigest = computeGuidesIntegrationArtifactDigest(base);
  return deepFreezeGuidesIntegration({
    ...base,
    reportDigest,
  });
}

function schemaIssues(error: z.ZodError): readonly MutableIssue[] {
  return error.issues.map((issue) => {
    const path = formatPath(issue.path);
    const first = String(issue.path[0] ?? "");
    const code: GuidesIntegrationReasonCode =
      first === "asOf"
        ? "as-of-invalid"
        : first === "artifact" && path.includes("digest")
          ? "artifact-digest-invalid"
          : "input-invalid";
    return { code, path, message: issue.message };
  });
}

export function buildGuidesIntegrationPreflight(
  raw: unknown,
): GuidesIntegrationPreflightReport {
  const parsedResult = guidesIntegrationPreflightInputSchema.safeParse(raw);
  if (!parsedResult.success) {
    return buildReport(raw, null, schemaIssues(parsedResult.error), []);
  }

  const parsed = parsedResult.data;
  const blockers: MutableIssue[] = [];
  const advisories: MutableIssue[] = [];
  const artifactDigest = parsed.artifact?.digest ?? null;

  checkArtifactProvenance(parsed.artifact, parsed.asOf, blockers);
  if (
    parsed.artifact &&
    computeGuidesIntegrationArtifactSubjectDigest(parsed) !==
      parsed.artifact.digest
  ) {
    addUniqueIssue(
      blockers,
      "artifact-digest-drift",
      "artifact.digest",
      "Integration artifact digest does not match the complete canonical integration subject.",
    );
  }
  validateTicket25(parsed.ticket25, parsed.asOf, blockers);
  const guides = validateGuides(
    parsed.guides,
    artifactDigest,
    parsed.asOf,
    blockers,
  );
  const graph = validateGraph(
    parsed.graph,
    artifactDigest,
    guides,
    parsed.asOf,
    blockers,
  );
  validateTicket13(parsed.ticket13Cutover, graph.digest, parsed.asOf, blockers);
  validateTicket27B(
    parsed.ticket27BReport,
    parsed.ticket25,
    graph.digest,
    artifactDigest,
    parsed.asOf,
    blockers,
  );
  validateUrlDispositionPreflight(
    parsed.urlDispositionPreflight,
    parsed.urlDisposition,
    parsed.asOf,
    blockers,
  );
  validateUrlDisposition(
    parsed.urlDisposition,
    parsed.artifact,
    guides,
    parsed.asOf,
    blockers,
  );
  validateProjections(
    parsed.projections,
    parsed.artifact,
    graph,
    guides,
    blockers,
  );
  validateReleaseAndApprovals(
    parsed.releaseBinding,
    parsed.humanApprovals,
    parsed.artifact,
    parsed.asOf,
    blockers,
  );
  validateRenderAcceptance(
    parsed.renderAcceptance,
    parsed.artifact,
    parsed.asOf,
    blockers,
  );

  // This is intentionally an advisory invariant, not an execution capability.
  // The report always carries supported=false/allowed=false and never mutates a
  // route, content record, sitemap, navigation, release, or URL disposition.
  void advisories;
  return buildReport(raw, parsed, blockers, advisories);
}

export const buildGuidesIntegrationPreflightReport =
  buildGuidesIntegrationPreflight;
export const createGuidesIntegrationPreflight = buildGuidesIntegrationPreflight;
