import { z } from "zod";

import {
  urlDispositionPreflightInputSchema,
  urlDispositionPreflightReportSchema,
  type UrlDispositionPreflightReport,
} from "../urlDispositions";

import {
  CANONICAL_CLUSTER_IDS,
  clusterIdSchema,
  type ClusterId,
} from "../clusterSchema";
import {
  sourceRetirementPreflightReportSchema,
  type SourceRetirementPreflightReport,
} from "../sourceRetirement";
import type { StrictGovernanceGraphCutoverDependency } from "../cutover";

export const GUIDES_INTEGRATION_SCHEMA_VERSION =
  "guides-integration-preflight-v1" as const;
export const GUIDES_INTEGRATION_CONTRACT_VERSION = 1 as const;

export const GUIDES_INTEGRATION_SURFACES = [
  "route",
  "canonical",
  "sitemap",
  "navigation",
  "footer",
  "breadcrumbs",
  "internalLinks",
] as const;

export type GuidesIntegrationSurface =
  (typeof GUIDES_INTEGRATION_SURFACES)[number];

export const GUIDES_INTEGRATION_REVIEW_MODALITIES = [
  "mobile",
  "desktop",
  "keyboard",
  "screenReader",
] as const;

export type GuidesIntegrationReviewModality =
  (typeof GUIDES_INTEGRATION_REVIEW_MODALITIES)[number];

export type Sha256Digest = `sha256:${string}`;
export type GraphDigest = string;

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const GRAPH_DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const MACHINE_ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const ROUTE_PATTERN =
  /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
const UTC_TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

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

export function isGuidesIntegrationCalendarDate(value: string): boolean {
  const match = CALENDAR_DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

export function isGuidesIntegrationUtcTimestamp(value: string): boolean {
  const match = UTC_TIMESTAMP_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
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

const nonEmptyTextSchema = z.string().trim().min(1);
const machineIdSchema = nonEmptyTextSchema.regex(
  MACHINE_ID_PATTERN,
  "Expected a lowercase machine-readable ID.",
);
const routeSchema = nonEmptyTextSchema.regex(
  ROUTE_PATTERN,
  "Expected an internal route without query or fragment.",
);
const dateSchema = nonEmptyTextSchema.refine(isGuidesIntegrationCalendarDate, {
  message: "Expected a valid calendar date (YYYY-MM-DD).",
});
const timestampSchema = nonEmptyTextSchema.refine(
  isGuidesIntegrationUtcTimestamp,
  {
    message: "Expected an absolute UTC timestamp with milliseconds.",
  },
);
const sha256DigestSchema = nonEmptyTextSchema.regex(
  SHA256_PATTERN,
  "Expected a lowercase sha256: digest.",
) as z.ZodType<Sha256Digest>;
const graphDigestSchema = nonEmptyTextSchema.regex(
  GRAPH_DIGEST_PATTERN,
  "Expected a lowercase graph digest.",
) as z.ZodType<GraphDigest>;

export const guidesIntegrationEvidenceSchema = z
  .object({
    id: machineIdSchema,
    origin: z.enum(["production", "fixture"]),
    public: z.boolean(),
    source: nonEmptyTextSchema,
    capturedAt: timestampSchema,
    digest: sha256DigestSchema,
  })
  .strict();

export type GuidesIntegrationEvidence = z.infer<
  typeof guidesIntegrationEvidenceSchema
>;

const nullableEvidenceSchema = guidesIntegrationEvidenceSchema.nullable();
const nullableDigestSchema = sha256DigestSchema.nullable();
const nullableGraphDigestSchema = graphDigestSchema.nullable();

const artifactSchema = z
  .object({
    version: z.literal(1),
    id: machineIdSchema,
    digest: sha256DigestSchema,
    reportDigest: sha256DigestSchema,
    origin: z.enum(["production", "fixture"]),
    public: z.boolean(),
    evidence: guidesIntegrationEvidenceSchema,
  })
  .strict();

export type GuidesIntegrationArtifact = z.infer<typeof artifactSchema>;

const ticket25Schema = z
  .object({
    sourceRetirementReport: sourceRetirementPreflightReportSchema,
  })
  .strict();

export type GuidesIntegrationTicket25 = z.infer<typeof ticket25Schema>;
export type GuidesIntegrationSourceRetirementReport =
  SourceRetirementPreflightReport;
export type GuidesIntegrationTicket13Cutover =
  StrictGovernanceGraphCutoverDependency;

const guidesArtifactSchema = z
  .object({
    version: z.literal(1),
    origin: z.enum(["production", "fixture"]),
    public: z.boolean(),
    model: z.unknown(),
    modelDigest: nullableDigestSchema,
    descriptors: z.unknown(),
    descriptorsDigest: nullableDigestSchema,
    evidence: nullableEvidenceSchema,
  })
  .strict();

export type GuidesIntegrationGuidesArtifact = z.infer<
  typeof guidesArtifactSchema
>;

const graphArtifactSchema = z
  .object({
    version: z.literal(1),
    origin: z.enum(["production", "fixture"]),
    public: z.boolean(),
    input: z.unknown(),
    digest: nullableGraphDigestSchema,
    artifactDigest: nullableDigestSchema,
    evidence: nullableEvidenceSchema,
  })
  .strict();

export type GuidesIntegrationGraphArtifact = z.infer<
  typeof graphArtifactSchema
>;

const destinationSchema = z
  .object({
    clusterId: clusterIdSchema,
    contentId: nonEmptyTextSchema,
    route: routeSchema,
    canonicalRoute: routeSchema,
    action: z.enum([
      "keep",
      "refresh",
      "merge",
      "redirect",
      "retire",
      "canonical",
    ]),
  })
  .strict();

export type GuidesIntegrationDestination = z.infer<typeof destinationSchema>;

const urlDispositionSchema = z
  .object({
    version: z.literal(1),
    status: z.enum(["approved", "pending", "blocked", "split_required"]),
    artifactDigest: sha256DigestSchema,
    reportDigest: sha256DigestSchema,
    destinations: z.array(destinationSchema),
    productionExecution: z
      .object({
        supported: z.literal(false),
        allowed: z.literal(false),
      })
      .strict(),
  })
  .strict();

export type GuidesIntegrationUrlDisposition = z.infer<
  typeof urlDispositionSchema
>;
export type GuidesIntegrationUrlDispositionReport =
  UrlDispositionPreflightReport;

const urlDispositionPreflightDependencySchema = z
  .object({
    input: urlDispositionPreflightInputSchema,
    report: urlDispositionPreflightReportSchema,
  })
  .strict();

export type GuidesIntegrationUrlDispositionPreflight = z.infer<
  typeof urlDispositionPreflightDependencySchema
>;

const ticket27BReportSchema = z
  .object({
    schemaVersion: z.literal("ticket27b-recommendations-diagnostics-v1"),
    status: z.enum(["ready", "blocked"]),
    deterministic: z.literal(true),
    asOf: timestampSchema,
    graphDigest: graphDigestSchema,
    recommendationDigest: sha256DigestSchema,
    diagnosticDigest: sha256DigestSchema,
    artifactDigest: sha256DigestSchema,
    reportDigest: sha256DigestSchema,
    productionExecution: z
      .object({
        supported: z.literal(false),
        allowed: z.literal(false),
      })
      .strict(),
    lineage: z
      .object({
        ticket25ReportDigest: sha256DigestSchema,
        graphDigest: graphDigestSchema,
        artifactDigest: sha256DigestSchema,
        asOf: timestampSchema,
      })
      .strict(),
  })
  .strict();

export type GuidesIntegrationTicket27BReport = z.infer<
  typeof ticket27BReportSchema
>;

const surfaceIdentitySchema = z
  .object({
    clusterId: clusterIdSchema.nullable(),
    contentId: nonEmptyTextSchema,
    route: routeSchema,
    canonicalRoute: routeSchema,
    graphNodeId: machineIdSchema,
  })
  .strict();

export type GuidesIntegrationSurfaceIdentity = z.infer<
  typeof surfaceIdentitySchema
>;

const surfaceReferenceSchema = z
  .object({
    kind: z.enum(["root", "pillar", "link"]),
    sourceContentId: nonEmptyTextSchema.nullable(),
    targetContentId: nonEmptyTextSchema,
    targetRoute: routeSchema,
    targetCanonicalRoute: routeSchema,
    targetGraphNodeId: machineIdSchema,
  })
  .strict();

export type GuidesIntegrationSurfaceReference = z.infer<
  typeof surfaceReferenceSchema
>;

const surfaceFilterSchema = z
  .object({
    crawlPolicy: z.literal("single-document"),
    navigationEffect: z.literal("none"),
    queryResultUrls: z.array(nonEmptyTextSchema),
  })
  .strict();

const surfaceProjectionSchema = z
  .object({
    surface: z.enum(GUIDES_INTEGRATION_SURFACES),
    scope: z.literal("guides-only"),
    artifactDigest: nullableDigestSchema,
    graphDigest: nullableGraphDigestSchema,
    root: surfaceIdentitySchema,
    pillars: z.array(surfaceIdentitySchema),
    references: z.array(surfaceReferenceSchema),
    filter: surfaceFilterSchema.nullable(),
  })
  .strict();

export type GuidesIntegrationSurfaceProjection = z.infer<
  typeof surfaceProjectionSchema
>;

const projectionsSchema = z
  .object({
    version: z.literal(1),
    artifactDigest: nullableDigestSchema,
    graphDigest: nullableGraphDigestSchema,
    surfaces: z
      .object({
        route: surfaceProjectionSchema,
        canonical: surfaceProjectionSchema,
        sitemap: surfaceProjectionSchema,
        navigation: surfaceProjectionSchema,
        footer: surfaceProjectionSchema,
        breadcrumbs: surfaceProjectionSchema,
        internalLinks: surfaceProjectionSchema,
      })
      .strict(),
    rollout: z
      .object({
        mode: z.enum(["all-or-nothing", "partial", "unknown"]),
        status: z.enum(["complete", "partial", "unknown"]),
        expectedSurfaces: z.array(z.enum(GUIDES_INTEGRATION_SURFACES)),
        readySurfaces: z.array(z.enum(GUIDES_INTEGRATION_SURFACES)),
      })
      .strict(),
  })
  .strict();

export type GuidesIntegrationProjections = z.infer<typeof projectionsSchema>;

const approvalActorSchema = z
  .object({
    id: machineIdSchema,
    type: z.literal("human"),
  })
  .strict();

const humanApprovalSchema = z
  .object({
    kind: z.enum(["integration", "guides", "content", "production"]),
    actor: approvalActorSchema,
    approvedAt: timestampSchema,
    releaseId: machineIdSchema.nullable(),
    artifactDigest: sha256DigestSchema,
    reportDigest: sha256DigestSchema,
    evidence: guidesIntegrationEvidenceSchema,
  })
  .strict();

export type GuidesIntegrationHumanApproval = z.infer<
  typeof humanApprovalSchema
>;

const releaseBindingSchema = z
  .object({
    version: z.literal(1),
    state: z.enum([
      "draft",
      "validated",
      "preview_ready",
      "content_approved",
      "production_approved",
      "deployed",
      "live_verified",
    ]),
    releaseId: machineIdSchema,
    artifactDigest: sha256DigestSchema,
    reportDigest: sha256DigestSchema,
    contentApproval: humanApprovalSchema.nullable(),
    productionApproval: humanApprovalSchema.nullable(),
  })
  .strict();

export type GuidesIntegrationReleaseBinding = z.infer<
  typeof releaseBindingSchema
>;

const renderCheckSchema = z
  .object({
    status: z.enum(["passed", "failed", "blocked", "unknown"]),
    evidence: nullableEvidenceSchema,
  })
  .strict();

const renderAcceptanceSchema = z
  .object({
    version: z.literal(1),
    status: z.enum(["passed", "blocked", "unknown"]),
    artifactDigest: nullableDigestSchema,
    renderArtifactDigest: nullableDigestSchema,
    checks: z
      .object({
        mobile: renderCheckSchema,
        desktop: renderCheckSchema,
        keyboard: renderCheckSchema,
        screenReader: renderCheckSchema,
      })
      .strict(),
  })
  .strict();

export type GuidesIntegrationRenderAcceptance = z.infer<
  typeof renderAcceptanceSchema
>;

const humanApprovalsSchema = z
  .object({
    integration: humanApprovalSchema.nullable(),
    guides: humanApprovalSchema.nullable(),
  })
  .strict();

export type GuidesIntegrationHumanApprovals = z.infer<
  typeof humanApprovalsSchema
>;

export const guidesIntegrationPreflightInputSchema = z
  .object({
    schemaVersion: z.literal(GUIDES_INTEGRATION_SCHEMA_VERSION),
    asOf: dateSchema,
    ticket13Cutover: z.unknown().nullable().optional(),
    ticket27BReport: ticket27BReportSchema.nullable().optional(),
    urlDispositionPreflight: urlDispositionPreflightDependencySchema
      .nullable()
      .optional(),
    artifact: artifactSchema.nullable(),
    ticket25: ticket25Schema.nullable(),
    guides: guidesArtifactSchema,
    graph: graphArtifactSchema,
    urlDisposition: urlDispositionSchema.nullable(),
    projections: projectionsSchema.nullable(),
    releaseBinding: releaseBindingSchema.nullable(),
    renderAcceptance: renderAcceptanceSchema.nullable(),
    humanApprovals: humanApprovalsSchema.nullable(),
  })
  .strict();

export type GuidesIntegrationPreflightInput = z.infer<
  typeof guidesIntegrationPreflightInputSchema
>;

export type GuidesIntegrationReasonCode =
  | "input-invalid"
  | "as-of-invalid"
  | "artifact-missing"
  | "artifact-provenance-unapproved"
  | "artifact-digest-invalid"
  | "artifact-digest-drift"
  | "ticket13-missing"
  | "ticket13-invalid"
  | "ticket13-as-of-mismatch"
  | "ticket13-digest-drift"
  | "ticket27b-missing"
  | "ticket27b-blocked"
  | "ticket27b-schema-invalid"
  | "ticket27b-lineage-drift"
  | "ticket27b-digest-drift"
  | "url-disposition-report-missing"
  | "url-disposition-report-invalid"
  | "future-dated-evidence"
  | "ticket25-missing"
  | "ticket25-blocked"
  | "ticket25-as-of-mismatch"
  | "ticket25-schema-version-mismatch"
  | "ticket25-artifact-version-mismatch"
  | "ticket25-report-digest-drift"
  | "ticket25-digest-drift"
  | "ticket25-blockers-present"
  | "ticket25-execution-unsafe"
  | "guides-blocked"
  | "guides-model-invalid"
  | "guides-pillars-incomplete"
  | "guides-descriptors-invalid"
  | "guides-digest-drift"
  | "guides-filter-crawlable"
  | "accessibility-review-incomplete"
  | "accessibility-id-collision"
  | "graph-blocked"
  | "graph-invalid"
  | "graph-digest-drift"
  | "graph-artifact-drift"
  | "graph-cluster-set-mismatch"
  | "graph-route-mismatch"
  | "graph-node-status-invalid"
  | "url-disposition-missing"
  | "url-disposition-blocked"
  | "url-disposition-digest-drift"
  | "url-destination-mismatch"
  | "projection-missing"
  | "projection-surface-set-mismatch"
  | "projection-digest-drift"
  | "projection-identity-drift"
  | "projection-non-guides-leak"
  | "projection-filter-crawlable"
  | "rollout-partial"
  | "release-unbound"
  | "release-digest-drift"
  | "approval-missing"
  | "approval-digest-drift"
  | "approval-not-independent"
  | "render-acceptance-missing"
  | "render-review-incomplete"
  | "render-artifact-digest-drift"
  | "render-evidence-unapproved"
  | "production-execution-unsupported";

export interface GuidesIntegrationIssue {
  readonly code: GuidesIntegrationReasonCode;
  readonly path: string;
  readonly message: string;
}

export interface GuidesIntegrationCounts {
  readonly expectedPillars: 5;
  readonly observedPillars: number | null;
  readonly expectedSurfaces: 7;
  readonly observedSurfaces: number | null;
  readonly blockerCount: number;
  readonly advisoryCount: number;
}

export interface GuidesIntegrationIdentity {
  readonly artifactDigest: Sha256Digest | null;
  readonly graphDigest: GraphDigest | null;
  readonly modelDigest: Sha256Digest | null;
  readonly descriptorsDigest: Sha256Digest | null;
}

export interface GuidesIntegrationProductionExecution {
  readonly supported: false;
  readonly allowed: false;
  readonly reason: string;
}

export interface GuidesIntegrationPreflightReport {
  readonly schemaVersion: typeof GUIDES_INTEGRATION_SCHEMA_VERSION;
  readonly contractVersion: 1;
  readonly asOf: string | null;
  readonly status: "blocked" | "ready";
  readonly contractStatus: "blocked" | "pass";
  readonly artifactExportable: false;
  readonly artifactOrigin: "production" | "fixture" | null;
  readonly productionExecution: GuidesIntegrationProductionExecution;
  readonly identity: GuidesIntegrationIdentity;
  readonly counts: GuidesIntegrationCounts;
  readonly blockers: readonly GuidesIntegrationIssue[];
  readonly advisories: readonly GuidesIntegrationIssue[];
  readonly reportDigest: Sha256Digest;
}

export const GUIDES_INTEGRATION_CANONICAL_CLUSTER_IDS = Object.freeze([
  ...CANONICAL_CLUSTER_IDS,
]) as readonly ClusterId[];

export type GuidesIntegrationParsedInput = GuidesIntegrationPreflightInput;
