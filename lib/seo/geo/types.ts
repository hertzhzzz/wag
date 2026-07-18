export const GEO_PLATFORMS = [
  "chatgpt",
  "perplexity",
  "google-ai-overviews",
  "bing-copilot",
] as const;

export const GEO_OBSERVATION_STATUSES = [
  "observed-answer",
  "observed-surface-absent",
  "unavailable",
  "blocked",
  "invalid",
] as const;

export const GEO_CLUSTERS = [
  "supplier-verification",
  "factory-audit",
  "quality-inspection",
  "factory-visits",
  "china-sourcing",
] as const;

export const GEO_METRIC_NAMES = [
  "mention",
  "citation",
  "accuracy",
  "completeness",
  "citationIntegrity",
  "competitorPreference",
] as const;

export type GeoPlatform = (typeof GEO_PLATFORMS)[number];
export type GeoObservationStatus = (typeof GEO_OBSERVATION_STATUSES)[number];
export type GeoCluster = (typeof GEO_CLUSTERS)[number];
export type GeoMetricName = (typeof GEO_METRIC_NAMES)[number];

export type GeoAuthContext =
  | "signed-out"
  | "signed-in-test-account"
  | "not-applicable";
export type GeoDevice = "desktop" | "mobile" | "tablet" | "unknown";
export type GeoAccountTier =
  | "free"
  | "paid"
  | "enterprise"
  | "unknown"
  | "not-applicable";
export type GeoReviewerRole =
  | "seo-reviewer"
  | "subject-matter-reviewer"
  | "quality-reviewer";

export interface GeoVersionSet {
  schemaVersion: string;
  methodologyVersion: string;
  benchmarkVersion: string;
  questionSetVersion: string;
}

export interface GeoPrompt {
  version: string;
  text: string;
  hash: string;
}

export interface GeoQuestionApproval {
  status: "approved";
  approvedAt: string;
  reviewerRole: GeoReviewerRole;
  evidencePath: string;
}

export interface GeoQuestionDefinition {
  questionId: string;
  cluster: GeoCluster;
  prompt: GeoPrompt;
  approval: GeoQuestionApproval;
}

export interface GeoRunManifest extends GeoVersionSet {
  runId: string;
  fixtureOnly: boolean;
  provenance: "external-platform-observation" | "synthetic-fixture";
  platform: GeoPlatform;
  locale: string;
  device: GeoDevice;
  auth: GeoAuthContext;
  accountTier: GeoAccountTier;
  expectedRepetitions: number;
  questions: GeoQuestionDefinition[];
  evidencePath: string;
}

export interface GeoSurfaceModel {
  name: string | null;
  visibility: "visible" | "not-visible" | "not-applicable";
}

export interface GeoSurface {
  name: string | null;
  visibility: "visible" | "not-visible";
  ordered: boolean;
  model: GeoSurfaceModel;
}

export interface GeoSnapshot {
  path: string;
  hash: string;
  mimeType:
    | "text/plain"
    | "text/html"
    | "image/png"
    | "image/jpeg"
    | "application/pdf"
    | "application/json";
  capture: "text" | "html" | "image" | "pdf" | "json";
  redaction: {
    status: "not-required" | "applied";
    policyVersion: string;
  };
}

export interface GeoCitation {
  citationId: string;
  url: string;
  kind: "owned" | "competitor" | "third-party";
  integrity: "supports" | "partial" | "misleading" | "unverified";
  rank?: number;
  evidencePath: string;
}

export interface GeoCompetitor {
  competitorId: string;
  label: string;
  mentioned: boolean;
  cited: boolean;
  preferred: boolean;
  rank?: number;
  evidencePath: string;
}

export interface GeoManualReview {
  rubricVersion: string;
  reviewedAt: string;
  reviewerRole: GeoReviewerRole;
  accuracy: "pass" | "fail" | "not-assessable";
  completeness: "pass" | "fail" | "not-assessable";
  citationIntegrity: "pass" | "fail" | "misleading" | "not-assessable";
  competitorPreference:
    | "brand-preferred"
    | "competitor-preferred"
    | "no-preference"
    | "not-assessable";
  evidencePath: string;
}

export type GeoStatusReason =
  | "surface-unavailable"
  | "unsupported-locale"
  | "unsupported-device"
  | "authentication-required"
  | "access-blocked"
  | "rate-limited"
  | "robots-policy"
  | "validation-failure"
  | "snapshot-integrity-failure"
  | "contract-mismatch";

export interface GeoObservation extends GeoVersionSet {
  runId: string;
  observationId: string;
  questionId: string;
  repetition: number;
  cluster: GeoCluster;
  platform: GeoPlatform;
  prompt: GeoPrompt;
  observedAt: string;
  locale: string;
  device: GeoDevice;
  auth: GeoAuthContext;
  accountTier: GeoAccountTier;
  status: GeoObservationStatus;
  statusReason: GeoStatusReason | null;
  surface: GeoSurface;
  snapshot: GeoSnapshot | null;
  brandMention: boolean | null;
  citations: GeoCitation[];
  competitors: GeoCompetitor[];
  review: GeoManualReview | null;
  evidencePath: string;
}

export interface GeoRunRecord {
  manifest: GeoRunManifest;
  observations: GeoObservation[];
}

export interface GeoTally {
  numerator: number;
  denominator: number;
}

export type GeoPlatformCounts = Record<GeoPlatform, GeoTally>;
export type GeoStatusCounts = Record<GeoObservationStatus, number>;

export interface GeoVersionCounts {
  schema: Record<string, GeoTally>;
  methodology: Record<string, GeoTally>;
  benchmark: Record<string, GeoTally>;
  questionSet: Record<string, GeoTally>;
  prompt: Record<string, GeoTally>;
}

export interface GeoMetricTrace {
  denominatorObservationIds: string[];
  numeratorObservationIds: string[];
  excludedObservationIds: string[];
  runIds: string[];
  evidencePaths: string[];
}

export interface GeoMetricResult extends GeoTally {
  rate: number | null;
  dateRange: { from: string; to: string } | null;
  platformCounts: GeoPlatformCounts;
  versionCounts: GeoVersionCounts;
  statusCounts: GeoStatusCounts;
  trace: GeoMetricTrace;
}

export interface GeoScorecard {
  mention: GeoMetricResult;
  citation: GeoMetricResult;
  accuracy: GeoMetricResult;
  completeness: GeoMetricResult;
  citationIntegrity: GeoMetricResult;
  competitorPreference: GeoMetricResult;
  composite: number | null;
  missingCompositeMetrics: GeoMetricName[];
}

export type GeoAggregateStatus =
  | "ready"
  | "partial_live_observations"
  | "blocked_no_live_observations"
  | "blocked_version_mismatch";

export interface GeoAggregateResult {
  status: GeoAggregateStatus;
  baselineReady: boolean;
  metrics: GeoScorecard | null;
  versions: GeoVersionSet | null;
  liveRunCount: number;
  fixtureRunCount: number;
  liveObservationCount: number;
  expectedObservationCount: number;
}

export interface GeoBenchmarkDelta {
  mention: number | null;
  citation: number | null;
  accuracy: number | null;
  completeness: number | null;
  citationIntegrity: number | null;
  competitorPreference: number | null;
  composite: number | null;
}

export interface GeoBenchmarkComparison {
  status: "comparable" | "version_mismatch" | "not_comparable";
  delta: GeoBenchmarkDelta | null;
  mismatchedVersions: (keyof GeoVersionSet)[];
}

export class GeoContractError extends Error {
  constructor(message = "GEO contract validation failed.") {
    super(message);
    this.name = "GeoContractError";
  }
}

export class GeoCanonicalError extends Error {
  constructor(message = "GEO canonicalization failed.") {
    super(message);
    this.name = "GeoCanonicalError";
  }
}

export class GeoIntegrityError extends Error {
  constructor(message = "GEO snapshot integrity verification failed.") {
    super(message);
    this.name = "GeoIntegrityError";
  }
}

export class GeoConflictError extends Error {
  constructor(message = "GEO runId conflict; append refused.") {
    super(message);
    this.name = "GeoConflictError";
  }
}
