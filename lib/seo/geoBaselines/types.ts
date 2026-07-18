import type { ClusterId } from "../clusterSchema";
import type { GeoPlatform, GeoRunRecord, GeoScorecard } from "../geo";
import type { QuestionSet } from "../questionSets";

export const GEO_CLUSTER_BASELINE_SCHEMA_VERSION =
  "geo-cluster-baseline-v1" as const;

export const GEO_BASELINE_GATE_REASONS = [
  "fixture-run-present",
  "future-approval",
  "future-observation",
  "incomplete-observation-slots",
  "no-approved-platforms",
  "no-live-observations",
  "question-set-cluster-mismatch",
  "question-set-digest-mismatch",
  "question-set-drift",
  "question-set-unapproved",
  "strict-cutover-unapproved",
  "unapproved-platform-observation",
  "version-mismatch",
] as const;

export type GeoBaselineGateReason = (typeof GEO_BASELINE_GATE_REASONS)[number];

export type GeoApprovalReviewerRole =
  | "seo-reviewer"
  | "subject-matter-reviewer"
  | "quality-reviewer";

export type GeoDigestApproval =
  | {
      status: "pending";
      digest: string;
      approvedAt: null;
      reviewerRole: null;
      evidencePath: null;
    }
  | {
      status: "approved";
      digest: string;
      approvedAt: string;
      reviewerRole: GeoApprovalReviewerRole;
      evidencePath: string;
    };

export type GeoStrictCutoverApproval =
  | {
      ticket: "13";
      status: "pending";
      digest: null;
      approvedAt: null;
      reviewerRole: null;
      evidencePath: null;
    }
  | {
      ticket: "13";
      status: "approved";
      digest: string;
      approvedAt: string;
      reviewerRole: GeoApprovalReviewerRole;
      evidencePath: string;
    };

export type GeoPlatformApproval =
  | {
      platform: GeoPlatform;
      status: "pending";
      approvedAt: null;
      reviewerRole: null;
      evidencePath: null;
    }
  | {
      platform: GeoPlatform;
      status: "approved";
      approvedAt: string;
      reviewerRole: GeoApprovalReviewerRole;
      evidencePath: string;
    };

export interface GeoClusterBaselineInput {
  schemaVersion: typeof GEO_CLUSTER_BASELINE_SCHEMA_VERSION;
  asOf: string;
  claimMode: "observation-only";
  cluster: ClusterId;
  questionSet: QuestionSet;
  questionSetApproval: GeoDigestApproval;
  strictCutoverApproval: GeoStrictCutoverApproval;
  platformApprovals: GeoPlatformApproval[];
  runs: GeoRunRecord[];
  snapshotContents: Record<string, string | Uint8Array>;
}

export interface GeoBaselinePlatformReport {
  platform: GeoPlatform;
  approved: boolean;
  liveRunCount: number;
  completeRunCount: number;
  observationCount: number;
  expectedObservationCount: number;
}

export interface GeoBaselineQualityRisks {
  unsupportedAnswerObservationIds: string[];
  misleadingCitationObservationIds: string[];
  unverifiedCitationObservationIds: string[];
}

export interface GeoClusterBaselineReport {
  schemaVersion: typeof GEO_CLUSTER_BASELINE_SCHEMA_VERSION;
  asOf: string;
  claimMode: "observation-only";
  cluster: ClusterId;
  executable: boolean;
  complete: boolean;
  reasons: GeoBaselineGateReason[];
  questionSet: {
    version: string;
    digest: string;
    approved: boolean;
  };
  platforms: GeoBaselinePlatformReport[];
  runIds: string[];
  observationCount: number;
  expectedObservationCount: number;
  metrics: GeoScorecard | null;
  qualityRisks: GeoBaselineQualityRisks;
  rawEvidencePaths: string[];
  methodologyStatement: string;
  reportDigest: string;
}

export class GeoBaselineContractError extends Error {
  constructor(message = "GEO cluster baseline contract validation failed.") {
    super(message);
    this.name = "GeoBaselineContractError";
  }
}
