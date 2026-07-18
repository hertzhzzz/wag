import type { ClusterId } from "../clusterSchema";
import type { GeoObservation, GeoPlatform, GeoRunRecord } from "../geo";

export const GEO_BENCHMARK_SCHEMA_VERSION =
  "geo-benchmark-contract-v1" as const;
export const GEO_BENCHMARK_CATALOG_ROOT = "content/seo/geo/questions" as const;
export const GEO_BENCHMARK_INPUT_MANIFEST_VERSION =
  "geo-benchmark-input-v1" as const;

export const GEO_BENCHMARK_METRIC_NAMES = [
  "brandMention",
  "ownedCitation",
  "accuracy",
  "completeness",
  "competitorVisibility",
] as const;

export type GeoBenchmarkMetricName =
  (typeof GEO_BENCHMARK_METRIC_NAMES)[number];

export type GeoBenchmarkErrorCode =
  | "GEO_BENCHMARK_CONTRACT"
  | "GEO_BENCHMARK_VERSION_DRIFT"
  | "GEO_BENCHMARK_FIXTURE_ISOLATION"
  | "GEO_BENCHMARK_COMPATIBILITY"
  | "GEO_BENCHMARK_JSON"
  | "GEO_BENCHMARK_MANIFEST"
  | "GEO_BENCHMARK_NEUTRALITY";

export type GeoBenchmarkErrorReason =
  | "contract_violation"
  | "invalid_version"
  | "version_identity_mismatch"
  | "version_drift"
  | "invalid_question_set"
  | "catalog_cardinality_mismatch"
  | "missing_cluster"
  | "duplicate_cluster"
  | "duplicate_question_id"
  | "duplicate_question_prompt"
  | "question_namespace_collision"
  | "neutrality_policy_violation"
  | "cyclic_value"
  | "unsupported_value"
  | "definition_integrity_mismatch"
  | "fixture_isolation"
  | "incompatible_methodology"
  | "invalid_json"
  | "bom_not_allowed"
  | "duplicate_json_key"
  | "invalid_json_value"
  | "manifest_shape_invalid"
  | "manifest_root_mismatch"
  | "manifest_path_mismatch"
  | "manifest_path_collision"
  | "manifest_digest_mismatch"
  | "manifest_version_mismatch"
  | "partial_coverage"
  | "approval_required"
  | "rollback_lineage"
  | "invalid_period_order";

export interface GeoBenchmarkErrorOptions {
  code?: GeoBenchmarkErrorCode;
  reason?: GeoBenchmarkErrorReason;
}

export interface GeoBenchmarkVersionIdentity {
  schemaVersion: typeof GEO_BENCHMARK_SCHEMA_VERSION;
  benchmarkVersion: string;
  methodologyVersion: string;
  questionSetVersion: string;
  observationSchemaVersion: string;
  scoringVersion: string;
  redactionPolicyVersion: string;
}

export interface GeoBenchmarkTiming {
  asOf: string;
  cadence: "monthly";
  timezone: string;
}

export interface GeoBenchmarkCitationCapture {
  mode: "manual-snapshot-review";
  captureOwnedUrls: boolean;
  captureCompetitorUrls: boolean;
  requireSnapshotEvidence: boolean;
  redactionPolicyVersion: string;
}

/**
 * The flat fields are retained as a compatibility input shape. When
 * versionIdentity is present, every flat field must match it exactly; output
 * contracts only use the normalized identity as their source of truth.
 */
export interface GeoBenchmarkMethodologyInput {
  benchmarkVersion: string;
  methodologyVersion: string;
  questionSetVersion: string;
  observationSchemaVersion: string;
  platforms: readonly GeoPlatform[];
  locale: string;
  timing: GeoBenchmarkTiming;
  repetitions: number;
  scoringVersion: string;
  citationCapture: GeoBenchmarkCitationCapture;
  knownVariability: readonly string[];
  versionIdentity?: GeoBenchmarkVersionIdentity;
}

export interface GeoBenchmarkQuestion {
  questionId: string;
  cluster: ClusterId;
  prompt: string;
  normalizedPrompt: string;
  promptHash: string;
  sourceSetVersion: number;
  sourceSetAsOfDate: string;
  sourceSetStatus: "draft";
}

export type GeoBenchmarkClusterCounts = Readonly<Record<ClusterId, number>>;

export interface GeoBenchmarkQuestionSetContract {
  version: string;
  digest: string;
  sourceDigest: string;
  promptVersion: string;
  questionCount: 50;
  clusterCounts: GeoBenchmarkClusterCounts;
  questions: readonly GeoBenchmarkQuestion[];
}

export interface GeoBenchmarkMethodology extends Omit<
  GeoBenchmarkMethodologyInput,
  "versionIdentity"
> {
  versionIdentity: GeoBenchmarkVersionIdentity;
  platforms: readonly GeoPlatform[];
  knownVariability: readonly string[];
  questionSetDigest: string;
  methodologyContentDigest: string;
  methodologyDigest: string;
}

export interface GeoBenchmarkIdentity {
  schemaVersion: typeof GEO_BENCHMARK_SCHEMA_VERSION;
  versionIdentity: GeoBenchmarkVersionIdentity;
  benchmarkVersion: string;
  benchmarkContentDigest: string;
  benchmarkDigest: string;
  benchmarkId: string;
}

export interface GeoBenchmarkDefinition {
  identity: GeoBenchmarkIdentity;
  questionSet: GeoBenchmarkQuestionSetContract;
  methodology: GeoBenchmarkMethodology;
}

export interface GeoBenchmarkCatalogSnapshot {
  path: string;
  digest: string;
  content: string;
}

export interface GeoBenchmarkInputManifest {
  manifestVersion: typeof GEO_BENCHMARK_INPUT_MANIFEST_VERSION;
  catalogRoot: typeof GEO_BENCHMARK_CATALOG_ROOT;
  versionIdentity: GeoBenchmarkVersionIdentity;
  methodology: GeoBenchmarkMethodologyInput;
  questionSets: readonly GeoBenchmarkCatalogSnapshot[];
}

export interface GeoBenchmarkPeriod {
  periodId: string;
  observedFrom: string;
  observedThrough: string;
}

export type GeoBenchmarkApprovalReviewerRole =
  | "seo-reviewer"
  | "subject-matter-reviewer"
  | "quality-reviewer"
  | "privacy-reviewer"
  | "publication-reviewer";

export type GeoBenchmarkHumanApproval =
  | {
      status: "pending";
      approvedAt: null;
      reviewerRole: null;
      evidencePath: null;
    }
  | {
      status: "approved";
      approvedAt: string;
      reviewerRole: GeoBenchmarkApprovalReviewerRole;
      evidencePath: string;
    };

export interface GeoBenchmarkPublicationApprovals {
  questionSet: GeoBenchmarkHumanApproval;
  quality: GeoBenchmarkHumanApproval;
  retention: GeoBenchmarkHumanApproval;
  privacy: GeoBenchmarkHumanApproval;
  publication: GeoBenchmarkHumanApproval;
}

export interface GeoBenchmarkProductionRunEnvelope {
  dataClass: "production" | "fixture";
  visibility: "internal" | "non_public";
  /** Binds run evidence to scoring, redaction, and all other contract versions. */
  versionIdentity: GeoBenchmarkVersionIdentity;
  record: GeoRunRecord;
}

export interface GeoBenchmarkFixtureRunEnvelope {
  dataClass: "fixture";
  visibility: "non_public";
  versionIdentity?: GeoBenchmarkVersionIdentity;
  record: GeoRunRecord;
}

export type GeoBenchmarkRunEnvelope =
  | GeoBenchmarkProductionRunEnvelope
  | GeoBenchmarkFixtureRunEnvelope;

export type GeoBenchmarkMetricValues = Readonly<
  Record<GeoBenchmarkMetricName, boolean | null>
>;

export interface GeoBenchmarkObservationLineage {
  dataClass: "production" | "fixture";
  visibility: "internal" | "non_public";
  publishable: boolean;
  runId: string;
  manifestEvidencePath: string;
  rawObservation: GeoObservation;
  metricValues: GeoBenchmarkMetricValues;
}

export interface GeoBenchmarkMetricSummary {
  numerator: number;
  denominator: number;
  rate: number | null;
}

export type GeoBenchmarkMetricSummaries = Readonly<
  Record<GeoBenchmarkMetricName, GeoBenchmarkMetricSummary>
>;

export type GeoBenchmarkPeriodStatus =
  | "ready"
  | "partial_live_observations"
  | "blocked_no_live_observations";

export interface GeoBenchmarkPeriodResult {
  dataClass: "production" | "fixture";
  visibility: "internal" | "non_public";
  publishable: boolean;
  status: GeoBenchmarkPeriodStatus;
  baselineReady: boolean;
  definition: GeoBenchmarkDefinition;
  period: GeoBenchmarkPeriod;
  metrics: GeoBenchmarkMetricSummaries | null;
  lineage: readonly GeoBenchmarkObservationLineage[];
  expectedSlotCount: number;
  recordedSlotCount: number;
  recordedUnresolvedSlotCount: number;
  missingSlotCount: number;
  pendingSlotCount: number;
  approvals: GeoBenchmarkPublicationApprovals;
  blockers: readonly string[];
}

export type GeoBenchmarkCompatibilityMismatch =
  | "versionIdentity"
  | "benchmarkVersion"
  | "benchmarkDigest"
  | "questionSetVersion"
  | "questionSetDigest"
  | "methodologyVersion"
  | "methodologyDigest"
  | "observationSchemaVersion"
  | "platforms"
  | "locale"
  | "timing"
  | "repetitions"
  | "scoringVersion"
  | "citationCapture"
  | "knownVariability";

export type GeoBenchmarkMetricDelta = Readonly<
  Record<GeoBenchmarkMetricName, number | null>
>;

export type GeoBenchmarkTemporalStatus =
  | "ordered"
  | "same_period"
  | "overlap"
  | "reverse_order"
  | "invalid_period"
  | "not_evaluated";

export interface GeoBenchmarkPeriodComparison {
  status: "comparable" | "incompatible_methodology" | "not_comparable";
  temporalStatus: GeoBenchmarkTemporalStatus;
  baselinePeriodId: string;
  rerunPeriodId: string;
  delta: GeoBenchmarkMetricDelta | null;
  mismatches: readonly GeoBenchmarkCompatibilityMismatch[];
  requiresNewVersion: boolean;
}

class GeoBenchmarkError extends Error {
  readonly code: GeoBenchmarkErrorCode;
  readonly reason: GeoBenchmarkErrorReason;

  constructor(
    message: string,
    defaultCode: GeoBenchmarkErrorCode,
    defaultReason: GeoBenchmarkErrorReason,
    options: GeoBenchmarkErrorOptions = {},
  ) {
    super(message);
    this.name = new.target.name;
    this.code = options.code ?? defaultCode;
    this.reason = options.reason ?? defaultReason;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GeoBenchmarkContractError extends GeoBenchmarkError {
  constructor(
    message = "GEO benchmark contract validation failed.",
    options: GeoBenchmarkErrorOptions = {},
  ) {
    super(message, "GEO_BENCHMARK_CONTRACT", "contract_violation", options);
  }
}

export class GeoBenchmarkVersionDriftError extends GeoBenchmarkError {
  constructor(
    message = "GEO benchmark version drift was rejected.",
    options: GeoBenchmarkErrorOptions = {},
  ) {
    super(message, "GEO_BENCHMARK_VERSION_DRIFT", "version_drift", options);
  }
}

export class GeoBenchmarkFixtureIsolationError extends GeoBenchmarkError {
  constructor(
    message = "Fixture/non_public runs cannot enter production aggregation.",
    options: GeoBenchmarkErrorOptions = {},
  ) {
    super(
      message,
      "GEO_BENCHMARK_FIXTURE_ISOLATION",
      "fixture_isolation",
      options,
    );
  }
}

export class GeoBenchmarkCompatibilityError extends GeoBenchmarkError {
  constructor(
    message = "GEO benchmark methodologies are incompatible.",
    options: GeoBenchmarkErrorOptions = {},
  ) {
    super(
      message,
      "GEO_BENCHMARK_COMPATIBILITY",
      "incompatible_methodology",
      options,
    );
  }
}

export class GeoBenchmarkJsonError extends GeoBenchmarkError {
  constructor(
    message = "GEO benchmark JSON input is invalid.",
    reason: Extract<
      GeoBenchmarkErrorReason,
      | "invalid_json"
      | "bom_not_allowed"
      | "duplicate_json_key"
      | "invalid_json_value"
    > = "invalid_json",
  ) {
    super(message, "GEO_BENCHMARK_JSON", reason);
  }
}

export class GeoBenchmarkManifestError extends GeoBenchmarkError {
  constructor(
    message = "GEO benchmark input manifest validation failed.",
    reason: Extract<
      GeoBenchmarkErrorReason,
      | "manifest_shape_invalid"
      | "manifest_root_mismatch"
      | "manifest_path_mismatch"
      | "manifest_path_collision"
      | "manifest_digest_mismatch"
      | "manifest_version_mismatch"
    > = "manifest_shape_invalid",
  ) {
    super(message, "GEO_BENCHMARK_MANIFEST", reason);
  }
}

export class GeoBenchmarkNeutralityError extends GeoBenchmarkError {
  constructor(
    message = "GEO benchmark neutral-claim policy rejected the input.",
  ) {
    super(message, "GEO_BENCHMARK_NEUTRALITY", "neutrality_policy_violation");
  }
}
