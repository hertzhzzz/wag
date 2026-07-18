import {
  PUBLICATION_GATE_NAMES,
  approvalIssues,
  assertExactKeys,
  assertRecord,
  deepFreeze,
  deploymentIssues,
  digestCanonical,
  gateIssues,
  liveVerificationIssues,
  normalizeApprovals,
  normalizeAudit,
  normalizeDeployment,
  normalizeFailureReasons,
  normalizeGateResults,
  normalizeHttpsUrl,
  normalizeLiveVerification,
  normalizeMachineId,
  normalizeMetrics,
  normalizeNonEmptyString,
  normalizeReviewPlan,
  normalizeRollback,
  normalizeSearch,
  uniqueSorted,
  type DeploymentRecord,
  type HumanIdentity,
  type LiveVerificationRecord,
  type PublicationApprovals,
  type PublicationAudit,
  type PublicationGateResults,
  type PublicationMetric,
  type PublicationSearchRecord,
  type ReviewPlan,
  type RollbackPlan,
  type Sha256Digest,
} from "./contracts";

export type HighIntentPublicationState =
  | "draft"
  | "validated"
  | "approved"
  | "deployed"
  | "live_verified";

export type HighIntentPageType =
  | "commercial_root"
  | "editorial_pillar"
  | "high_intent_article"
  | "industry_intent_page"
  | "supporting_article"
  | (string & {});

export interface HighIntentCandidate {
  query: string;
  intent: string;
  cluster: string;
  targetUrl: string;
  pageType: HighIntentPageType;
}

export interface HighIntentPublicationInput {
  version: 1;
  eventId: string;
  claimedState: HighIntentPublicationState;
  candidate: HighIntentCandidate;
  gates: PublicationGateResults;
  audit: PublicationAudit;
  approvals: PublicationApprovals;
  deployment: DeploymentRecord | null;
  liveVerification: LiveVerificationRecord | null;
  search: PublicationSearchRecord;
  metrics: PublicationMetric[];
  rollback: RollbackPlan;
  reviewPlan: ReviewPlan;
  failureReasons: string[];
}

export interface HighIntentPublicationRecord {
  version: 1;
  eventId: string;
  claimedState: HighIntentPublicationState;
  candidate: HighIntentCandidate;
  gates: PublicationGateResults;
  audit: PublicationAudit;
  approvals: PublicationApprovals;
  deployment: DeploymentRecord | null;
  liveVerification: LiveVerificationRecord | null;
  search: PublicationSearchRecord;
  metrics: PublicationMetric[];
  rollback: RollbackPlan;
  reviewPlan: ReviewPlan;
  failureReasons: string[];
}

export interface HighIntentPublicationDecision {
  policy: "high_intent_publication";
  state: HighIntentPublicationState;
  eligible: boolean;
  published: boolean;
  completed: boolean;
  blockers: string[];
  failureReasons: string[];
  record: HighIntentPublicationRecord;
  summary: string;
  summaryDigest: Sha256Digest;
}

const INPUT_KEYS = [
  "version",
  "eventId",
  "claimedState",
  "candidate",
  "gates",
  "audit",
  "approvals",
  "deployment",
  "liveVerification",
  "search",
  "metrics",
  "rollback",
  "reviewPlan",
  "failureReasons",
] as const;

const CANDIDATE_KEYS = [
  "query",
  "intent",
  "cluster",
  "targetUrl",
  "pageType",
] as const;

const STATES: readonly HighIntentPublicationState[] = [
  "draft",
  "validated",
  "approved",
  "deployed",
  "live_verified",
];

function normalizeState(value: unknown): HighIntentPublicationState {
  if (
    typeof value !== "string" ||
    !STATES.includes(value as HighIntentPublicationState)
  ) {
    throw new Error(`claimedState must be one of ${STATES.join(", ")}.`);
  }
  return value as HighIntentPublicationState;
}

function normalizeCandidate(value: unknown): HighIntentCandidate {
  assertRecord(value, "candidate");
  assertExactKeys(value, CANDIDATE_KEYS, "candidate");

  return {
    query: normalizeNonEmptyString(value.query, "candidate.query"),
    intent: normalizeNonEmptyString(value.intent, "candidate.intent"),
    cluster: normalizeMachineId(value.cluster, "candidate.cluster"),
    targetUrl: normalizeHttpsUrl(value.targetUrl, "candidate.targetUrl"),
    pageType: normalizeNonEmptyString(
      value.pageType,
      "candidate.pageType",
    ) as HighIntentPageType,
  };
}

function normalizeInput(value: unknown): HighIntentPublicationRecord {
  assertRecord(value, "publication event");
  assertExactKeys(value, INPUT_KEYS, "publication event");

  if (value.version !== 1) {
    throw new Error("publication event.version must be 1.");
  }

  const eventId = normalizeMachineId(value.eventId, "eventId");
  const claimedState = normalizeState(value.claimedState);
  const candidate = normalizeCandidate(value.candidate);
  const audit = normalizeAudit(value.audit);
  const gates = normalizeGateResults(value.gates);
  const approvals = normalizeApprovals(value.approvals);
  const deployment = normalizeDeployment(value.deployment);
  const liveVerification = normalizeLiveVerification(value.liveVerification);
  const search = normalizeSearch(value.search);
  const metrics = normalizeMetrics(value.metrics);
  const rollback = normalizeRollback(value.rollback);
  const reviewPlan = normalizeReviewPlan(value.reviewPlan);
  const failureReasons = normalizeFailureReasons(value.failureReasons);

  return {
    version: 1,
    eventId,
    claimedState,
    candidate,
    gates,
    audit,
    approvals,
    deployment,
    liveVerification,
    search,
    metrics,
    rollback,
    reviewPlan,
    failureReasons,
  };
}

function stateRank(state: HighIntentPublicationState): number {
  return STATES.indexOf(state);
}

function stateAtOrBefore(
  claimedState: HighIntentPublicationState,
  maximum: HighIntentPublicationState,
): HighIntentPublicationState {
  return stateRank(claimedState) <= stateRank(maximum) ? claimedState : maximum;
}

function buildSummary(
  record: HighIntentPublicationRecord,
  state: HighIntentPublicationState,
  blockers: readonly string[],
): string {
  const indexation = record.search.indexation.status;
  const notification = record.search.notification.status;
  const blockerSummary = blockers.length === 0 ? "none" : blockers.join(",");
  return [
    "policy=high_intent_publication",
    `event=${record.eventId}`,
    `state=${state}`,
    `eligible=${blockers.length === 0}`,
    `published=${state === "live_verified"}`,
    `completed=${state === "live_verified"}`,
    `target=${record.candidate.targetUrl}`,
    `notification=${notification}`,
    `indexation=${indexation}`,
    `blockers=${blockerSummary}`,
  ].join(";");
}

function currentArtifactIssues(record: HighIntentPublicationRecord): string[] {
  const issues: string[] = [];
  if (record.audit.artifactDigest !== record.rollback.artifactDigest) {
    issues.push("rollback_artifact_digest_mismatch");
  }
  return issues;
}

function lifecycleDecision(
  record: HighIntentPublicationRecord,
  blockers: readonly string[],
): HighIntentPublicationState {
  const claimed = record.claimedState;
  if (blockers.length > 0) {
    const gateBlocker = blockers.some(
      (blocker) =>
        blocker.startsWith("gate_") ||
        blocker === "rollback_artifact_digest_mismatch",
    );
    if (gateBlocker) return "draft";

    const approvalBlocker = blockers.some((blocker) =>
      blocker.includes("approval"),
    );
    if (approvalBlocker) return stateAtOrBefore(claimed, "validated");

    const deploymentBlocker = blockers.some((blocker) =>
      blocker.startsWith("deployment_"),
    );
    if (deploymentBlocker) return stateAtOrBefore(claimed, "approved");

    const liveBlocker = blockers.some((blocker) => blocker.startsWith("live_"));
    if (liveBlocker) return stateAtOrBefore(claimed, "deployed");

    return stateAtOrBefore(claimed, "validated");
  }

  return claimed;
}

export function evaluateHighIntentPublication(
  value: HighIntentPublicationInput,
): HighIntentPublicationDecision {
  const record = normalizeInput(value);
  const currentArtifact = record.audit.artifactDigest;
  const blockers = uniqueSorted([
    ...currentArtifactIssues(record),
    ...gateIssues(record.gates, currentArtifact, { notRunIsIssue: true }),
  ]);

  const approvalBlockers = approvalIssues(
    record.approvals,
    currentArtifact,
    record.audit.reviewDigest,
  );
  const deploymentBlockers =
    record.claimedState === "deployed" ||
    record.claimedState === "live_verified"
      ? deploymentIssues(
          record.deployment,
          record.candidate.targetUrl,
          currentArtifact,
        )
      : [];
  const liveBlockers =
    record.claimedState === "live_verified"
      ? liveVerificationIssues(
          record.liveVerification,
          record.candidate.targetUrl,
          currentArtifact,
        )
      : [];

  const claimedRequiresApproval =
    stateRank(record.claimedState) >= stateRank("approved");
  const claimedRequiresDeployment =
    stateRank(record.claimedState) >= stateRank("deployed");
  const claimedRequiresLiveVerification =
    record.claimedState === "live_verified";

  const allBlockers = uniqueSorted([
    ...blockers,
    ...(claimedRequiresApproval ? approvalBlockers : []),
    ...(claimedRequiresDeployment ? deploymentBlockers : []),
    ...(claimedRequiresLiveVerification ? liveBlockers : []),
  ]);
  const state = lifecycleDecision(record, allBlockers);
  const summary = buildSummary(record, state, allBlockers);
  const decision: HighIntentPublicationDecision = {
    policy: "high_intent_publication",
    state,
    eligible: allBlockers.length === 0,
    published: state === "live_verified",
    completed: state === "live_verified",
    blockers: allBlockers,
    failureReasons: record.failureReasons,
    record,
    summary,
    summaryDigest: digestCanonical({
      policy: "high_intent_publication",
      eventId: record.eventId,
      state,
      eligible: allBlockers.length === 0,
      published: state === "live_verified",
      completed: state === "live_verified",
      blockers: allBlockers,
      failureReasons: record.failureReasons,
      candidate: record.candidate,
      artifactDigest: currentArtifact,
      reviewDigest: record.audit.reviewDigest,
      notification: record.search.notification.status,
      indexation: record.search.indexation.status,
    }),
  };

  return deepFreeze(decision);
}

export { PUBLICATION_GATE_NAMES };
export type {
  DeploymentRecord,
  HumanIdentity,
  LiveVerificationRecord,
  PublicationApprovals,
  PublicationAudit,
  PublicationGateResults,
  PublicationMetric,
  PublicationSearchRecord,
  ReviewPlan,
  RollbackPlan,
};
