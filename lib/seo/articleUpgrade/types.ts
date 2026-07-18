import type { ClusterId } from "../clusterSchema";

export const ARTICLE_UPGRADE_SCHEMA_VERSION = 1 as const;

export type ArticleUpgradeTicketId =
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23";

export type ArticleUpgradeRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type ArticleUpgradeProvenance = "live" | "synthetic-fixture";
export type ArticleUpgradeEnvironment = "test" | "production";
export type ArticleUpgradeDataMode = "actual" | "synthetic_fixture" | "dry_run";
export type ArticleUpgradeDisposition =
  | "upgrade"
  | "hold"
  | "no-op"
  | "rollback";
export type Sha256Digest = `sha256:${string}`;
export type GateStatus = "pending" | "passed" | "failed";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type VerificationStatus = "pending" | "passed" | "failed";

export interface ArticleUpgradeEvaluationContext {
  today: string;
  environment: ArticleUpgradeEnvironment;
  dataMode?: ArticleUpgradeDataMode;
}

export interface ArticleUpgradeTicketSlot {
  ticketId: ArticleUpgradeTicketId;
  rank: ArticleUpgradeRank;
}

export interface ArticleUpgradeOwner {
  id: string;
  kind: "human" | "test-fixture";
}

export interface ArticleUpgradeTarget {
  articleId: string;
  url: string;
}

export interface ArticleUpgradeSourceSnapshot {
  digest: Sha256Digest;
  capturedAt: string;
  provenance: ArticleUpgradeProvenance;
}

export interface ArticleUpgradeGateAttestation {
  status: GateStatus;
  evidenceDigest: Sha256Digest | null;
  checkedAt: string | null;
  provenance: ArticleUpgradeProvenance;
}

export interface ArticleUpgradeLedgerGate {
  status: GateStatus;
  currentDigest: Sha256Digest | null;
  approvedDigest: Sha256Digest | null;
  checkedAt: string | null;
  provenance: ArticleUpgradeProvenance;
}

export interface ArticleUpgradeEvidenceGate {
  status: GateStatus;
  packageDigest: Sha256Digest | null;
  reportDigest: Sha256Digest | null;
  checkedAt: string | null;
  provenance: ArticleUpgradeProvenance;
}

export interface ArticleUpgradeDependencies {
  strictCutover: ArticleUpgradeGateAttestation;
  migrationLedger: ArticleUpgradeLedgerGate;
  evidenceGate: ArticleUpgradeEvidenceGate;
}

export interface RankedOpportunityLock {
  status: "unlocked" | "locked";
  opportunityId: string | null;
  rank: ArticleUpgradeRank | null;
  cluster: ClusterId | null;
  targetUrl: string | null;
  opportunityDigest: Sha256Digest | null;
  briefDigest: Sha256Digest | null;
  rankingEvidenceDigest: Sha256Digest | null;
  lockedAt: string | null;
  provenance: ArticleUpgradeProvenance;
}

export interface ArticleRequirementVerification {
  status: VerificationStatus;
  evidenceDigest: Sha256Digest | null;
  verifiedAt: string | null;
  explanation: string | null;
  provenance: ArticleUpgradeProvenance;
}

export interface AnswerPassageRequirement extends ArticleRequirementVerification {
  passageRef: string | null;
}

export interface FaqRequirement extends ArticleRequirementVerification {
  visibleStatus: "unreviewed" | "visible" | "not-applicable";
  eligibility: "unreviewed" | "eligible" | "ineligible";
  schemaPlanned: boolean;
}

export interface InternalLinkTargets {
  pillar: string | null;
  sibling: string | null;
  service: string | null;
  nextStep: string | null;
}

export interface InternalLinksRequirement extends ArticleRequirementVerification {
  graphDigest: Sha256Digest | null;
  targets: InternalLinkTargets;
}

export interface ExpertEvidenceRequirement extends ArticleRequirementVerification {
  contributionId: string | null;
  contributionDigest: Sha256Digest | null;
  sourceKind: "expert" | "first-party" | "both" | null;
}

export interface MobileReviewRequirement extends ArticleRequirementVerification {
  desktopPassed: boolean | null;
  mobilePassed: boolean | null;
}

export interface MetadataSchemaRequirement extends ArticleRequirementVerification {
  metadataEligible: boolean | null;
  articleSchemaEligible: boolean | null;
  faqSchemaEligible: boolean | null;
}

export interface ArticleUpgradeRequirements {
  answerPassage: AnswerPassageRequirement;
  faq: FaqRequirement;
  internalLinks: InternalLinksRequirement;
  expertEvidence: ExpertEvidenceRequirement;
  mobileReview: MobileReviewRequirement;
  metadataSchema: MetadataSchemaRequirement;
}

export interface ArticleUpgradeApproval {
  status: ApprovalStatus;
  approvalId: string | null;
  actorId: string | null;
  approvedAt: string | null;
  subjectDigest: Sha256Digest | null;
  provenance: ArticleUpgradeProvenance;
}

export interface ArticleUpgradeAttribution {
  mode: "declarative-metadata-only";
  contractRef: string | null;
  allowlistRef: string | null;
  campaign: string | null;
  cluster: ClusterId | null;
  contentId: string | null;
  trackingParameters: null;
  approval: ArticleUpgradeApproval;
}

export interface ArticleUpgradeClaim {
  id: string;
  kind: "ranking" | "causal";
  statement: string;
  evidenceDigest: Sha256Digest | null;
  asOf: string;
  provenance: ArticleUpgradeProvenance;
}

export type ArticleUpgradeObservationKey =
  | "search-position"
  | "search-clicks"
  | "search-impressions"
  | "conversions";

export interface ArticleUpgradeObservation {
  key: ArticleUpgradeObservationKey;
  status: "unavailable" | "observed" | "synthetic-fixture";
  value: number | null;
  sourceDigest: Sha256Digest | null;
  observedAt: string | null;
}

export interface ArticleUpgradeTicketInput {
  ticketId: ArticleUpgradeTicketId;
  rank: ArticleUpgradeRank;
  cluster: ClusterId | null;
  target: ArticleUpgradeTarget | null;
  owner: ArticleUpgradeOwner | null;
  asOf: string;
  provenance: ArticleUpgradeProvenance;
  source: {
    baseline: ArticleUpgradeSourceSnapshot | null;
    current: ArticleUpgradeSourceSnapshot | null;
  };
  opportunityLock: RankedOpportunityLock;
  dependencies: ArticleUpgradeDependencies;
  requirements: ArticleUpgradeRequirements;
  attribution: ArticleUpgradeAttribution;
  approvals: {
    content: ArticleUpgradeApproval;
    release: ArticleUpgradeApproval;
  };
  claims: ArticleUpgradeClaim[];
  observations: ArticleUpgradeObservation[];
}

export interface ArticleUpgradeManifestInput {
  version: typeof ARTICLE_UPGRADE_SCHEMA_VERSION;
  asOf: string;
  provenance: ArticleUpgradeProvenance;
  tickets: ArticleUpgradeTicketInput[];
}

export const ARTICLE_UPGRADE_ISSUE_CODES = [
  "input_schema_invalid",
  "data_mode_mismatch",
  "dry_run_preview_only",
  "trusted_execution_attestation_missing",
  "fixture_requires_test_environment",
  "future_date_forbidden",
  "provenance_mismatch",
  "ticket_missing",
  "ticket_duplicate",
  "rank_mismatch",
  "target_duplicate",
  "cluster_unassigned",
  "target_unassigned",
  "owner_unassigned",
  "cluster_drift",
  "target_drift",
  "ticket_13_strict_cutover_blocked",
  "migration_ledger_not_approved",
  "migration_ledger_digest_missing",
  "migration_ledger_digest_drift",
  "ranked_opportunity_not_locked",
  "ranked_opportunity_digest_missing",
  "ranked_brief_digest_missing",
  "ranking_evidence_missing",
  "ranked_opportunity_rank_drift",
  "evidence_gate_not_passed",
  "evidence_package_digest_missing",
  "baseline_source_digest_missing",
  "current_source_digest_missing",
  "source_digest_unchanged",
  "answer_passage_not_verified",
  "faq_not_reviewed",
  "faq_schema_ineligible",
  "internal_link_graph_not_verified",
  "internal_link_target_missing",
  "internal_link_target_duplicate",
  "internal_link_self_link",
  "expert_first_party_evidence_not_verified",
  "mobile_review_not_passed",
  "metadata_schema_not_eligible",
  "attribution_not_approved",
  "attribution_contract_missing",
  "attribution_allowlist_missing",
  "tracking_parameters_forbidden",
  "content_approval_missing",
  "content_approval_digest_drift",
  "release_approval_missing",
  "release_approval_digest_drift",
  "approval_separation_invalid",
  "claim_duplicate",
  "unsupported_ranking_claim",
  "unsupported_causal_claim",
  "observation_duplicate",
  "observation_null_semantics_invalid",
  "synthetic_provenance_not_executable",
] as const;

export type ArticleUpgradeIssueCode =
  (typeof ARTICLE_UPGRADE_ISSUE_CODES)[number];
export type ArticleUpgradeIssueSeverity = "contract" | "blocker" | "guard";

export interface ArticleUpgradeIssue {
  code: ArticleUpgradeIssueCode;
  severity: ArticleUpgradeIssueSeverity;
  ticketId: ArticleUpgradeTicketId | null;
  path: string;
  message: string;
}

export type ArticleUpgradeEvaluationStatus =
  | "blocked"
  | "fixture-ready"
  | "ready-for-execution";

export interface ArticleUpgradeTicketReport {
  ticketId: ArticleUpgradeTicketId;
  rank: ArticleUpgradeRank;
  cluster: ClusterId | null;
  target: ArticleUpgradeTarget | null;
  candidateDigest: Sha256Digest;
  rollbackBaselineDigest: Sha256Digest | null;
  status: ArticleUpgradeEvaluationStatus;
  schemaValid: boolean;
  evidenceVerified: boolean;
  authorizedForExecution: boolean;
  productionExecution: boolean;
  disposition: ArticleUpgradeDisposition;
  previewable: boolean;
  simulationReady: boolean;
  executable: boolean;
  complete: false;
  reasonCodes: readonly ArticleUpgradeIssueCode[];
  issues: readonly ArticleUpgradeIssue[];
}

export interface ArticleUpgradeManifestReport {
  version: typeof ARTICLE_UPGRADE_SCHEMA_VERSION;
  asOf: string | null;
  provenance: ArticleUpgradeProvenance | null;
  dataMode: ArticleUpgradeDataMode | null;
  manifestDigest: Sha256Digest | null;
  status: ArticleUpgradeEvaluationStatus;
  schemaValid: boolean;
  evidenceVerified: boolean;
  authorizedForExecution: boolean;
  productionExecution: boolean;
  disposition: ArticleUpgradeDisposition;
  previewable: boolean;
  simulationReady: boolean;
  executable: boolean;
  complete: false;
  reasonCodes: readonly ArticleUpgradeIssueCode[];
  issues: readonly ArticleUpgradeIssue[];
  tickets: readonly ArticleUpgradeTicketReport[];
}
