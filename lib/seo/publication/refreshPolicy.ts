import {
  approvalIssues,
  assertExactKeys,
  assertRecord,
  compareCodePoints,
  deepFreeze,
  deploymentIssues,
  digestCanonical,
  gateIssues,
  hasPendingGate,
  liveVerificationIssues,
  normalizeApprovals,
  normalizeAudit,
  normalizeDeployment,
  normalizeDigest,
  normalizeFailureReasons,
  normalizeGateResults,
  normalizeHttpsUrl,
  normalizeHumanIdentity,
  normalizeLiveVerification,
  normalizeMachineId,
  normalizeMetrics,
  normalizeNonEmptyString,
  normalizeReviewPlan,
  normalizeRollback,
  normalizeSearch,
  normalizeStringList,
  normalizeTimestamp,
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

export type RefreshPublicationState =
  | "no-op"
  | "blocked"
  | "ready"
  | "validated"
  | "approved"
  | "deployed"
  | "live_verified";

export type RefreshUrlDispositionKind = "preserve" | "change";
export type RefreshChangeAction =
  | "add"
  | "remove"
  | "replace"
  | "update"
  | "generalize"
  | "unchanged";
export type RefreshVerification = "verified" | "unverified";
export type RefreshGovernedContentKind =
  | "fact"
  | "case_study"
  | "statistic"
  | "publication_date";

export interface RefreshUrlApproval {
  actor: HumanIdentity;
  recordedAt: string;
  fromUrl: string;
  toUrl: string;
  beforeArtifactDigest: Sha256Digest;
  afterArtifactDigest: Sha256Digest;
  reviewDigest: Sha256Digest;
}

export interface RefreshUrlDisposition {
  kind: RefreshUrlDispositionKind;
  reason: string;
  approval: RefreshUrlApproval | null;
  redirectPlan: string[];
}

export interface RefreshCandidate {
  slug: string;
  existingUrl: string;
  targetUrl: string;
  urlDisposition: RefreshUrlDisposition;
}

export interface RefreshEvidenceChange {
  id: string;
  action: RefreshChangeAction;
  detail: string;
  sourceDigest: Sha256Digest;
}

export interface RefreshInternalLinkChange {
  fromUrl: string;
  toUrl: string;
  action: RefreshChangeAction;
  detail: string;
}

export interface RefreshMetadataChange {
  field: string;
  action: RefreshChangeAction;
  detail: string;
}

export interface RefreshGovernedContentChange {
  kind: RefreshGovernedContentKind;
  action: RefreshChangeAction;
  verification: RefreshVerification;
  actor: HumanIdentity | null;
  reason: string;
}

export interface RefreshChanges {
  evidence: RefreshEvidenceChange[];
  internalLinks: RefreshInternalLinkChange[];
  metadata: RefreshMetadataChange[];
  governedContent: RefreshGovernedContentChange[];
}

export interface RefreshPublicationInput {
  version: 1;
  eventId: string;
  claimedState: RefreshPublicationState;
  candidate: RefreshCandidate;
  beforeArtifactDigest: Sha256Digest;
  afterArtifactDigest: Sha256Digest;
  changeReasons: string[];
  changes: RefreshChanges;
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

export type RefreshPublicationRecord = RefreshPublicationInput;

export interface RefreshPublicationDecision {
  policy: "refresh_publication";
  state: RefreshPublicationState;
  eligible: boolean;
  published: boolean;
  completed: boolean;
  blockers: string[];
  failureReasons: string[];
  record: RefreshPublicationRecord;
  summary: string;
  summaryDigest: Sha256Digest;
}

const INPUT_KEYS = [
  "version",
  "eventId",
  "claimedState",
  "candidate",
  "beforeArtifactDigest",
  "afterArtifactDigest",
  "changeReasons",
  "changes",
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
  "slug",
  "existingUrl",
  "targetUrl",
  "urlDisposition",
] as const;
const DISPOSITION_KEYS = [
  "kind",
  "reason",
  "approval",
  "redirectPlan",
] as const;
const URL_APPROVAL_KEYS = [
  "actor",
  "recordedAt",
  "fromUrl",
  "toUrl",
  "beforeArtifactDigest",
  "afterArtifactDigest",
  "reviewDigest",
] as const;
const CHANGES_KEYS = [
  "evidence",
  "internalLinks",
  "metadata",
  "governedContent",
] as const;
const EVIDENCE_KEYS = ["id", "action", "detail", "sourceDigest"] as const;
const LINK_KEYS = ["fromUrl", "toUrl", "action", "detail"] as const;
const METADATA_KEYS = ["field", "action", "detail"] as const;
const GOVERNED_CONTENT_KEYS = [
  "kind",
  "action",
  "verification",
  "actor",
  "reason",
] as const;
const STATES: readonly RefreshPublicationState[] = [
  "no-op",
  "blocked",
  "ready",
  "validated",
  "approved",
  "deployed",
  "live_verified",
];
const ACTIONS: readonly RefreshChangeAction[] = [
  "add",
  "remove",
  "replace",
  "update",
  "generalize",
  "unchanged",
];
const CONTENT_KINDS: readonly RefreshGovernedContentKind[] = [
  "fact",
  "case_study",
  "statistic",
  "publication_date",
];

function normalizeState(value: unknown): RefreshPublicationState {
  if (
    typeof value !== "string" ||
    !STATES.includes(value as RefreshPublicationState)
  ) {
    throw new Error(`claimedState must be one of ${STATES.join(", ")}.`);
  }
  return value as RefreshPublicationState;
}

function normalizeAction(value: unknown, label: string): RefreshChangeAction {
  if (
    typeof value !== "string" ||
    !ACTIONS.includes(value as RefreshChangeAction)
  ) {
    throw new Error(`${label} must be one of ${ACTIONS.join(", ")}.`);
  }
  return value as RefreshChangeAction;
}

function normalizeCandidate(value: unknown): RefreshCandidate {
  assertRecord(value, "candidate");
  assertExactKeys(value, CANDIDATE_KEYS, "candidate");
  const slug = normalizeMachineId(value.slug, "candidate.slug");
  const existingUrl = normalizeHttpsUrl(
    value.existingUrl,
    "candidate.existingUrl",
  );
  const targetUrl = normalizeHttpsUrl(value.targetUrl, "candidate.targetUrl");

  assertRecord(value.urlDisposition, "candidate.urlDisposition");
  assertExactKeys(
    value.urlDisposition,
    DISPOSITION_KEYS,
    "candidate.urlDisposition",
  );
  const kind = value.urlDisposition.kind;
  if (kind !== "preserve" && kind !== "change") {
    throw new Error(
      "candidate.urlDisposition.kind must be preserve or change.",
    );
  }
  const approval = normalizeUrlApproval(
    value.urlDisposition.approval,
    "candidate.urlDisposition.approval",
  );
  const redirectPlan = normalizeStringArray(
    value.urlDisposition.redirectPlan,
    "candidate.urlDisposition.redirectPlan",
    true,
  );

  return {
    slug,
    existingUrl,
    targetUrl,
    urlDisposition: {
      kind,
      reason: normalizeNonEmptyString(
        value.urlDisposition.reason,
        "candidate.urlDisposition.reason",
      ),
      approval,
      redirectPlan,
    },
  };
}

function normalizeStringArray(
  value: unknown,
  label: string,
  allowEmpty: boolean,
): string[] {
  return normalizeStringList(value, label, { allowEmpty });
}

function normalizeUrlApproval(
  value: unknown,
  label: string,
): RefreshUrlApproval | null {
  if (value === null) return null;
  assertRecord(value, label);
  assertExactKeys(value, URL_APPROVAL_KEYS, label);
  return {
    actor: normalizeHumanIdentity(value.actor, `${label}.actor`),
    recordedAt: normalizeTimestamp(value.recordedAt, `${label}.recordedAt`),
    fromUrl: normalizeHttpsUrl(value.fromUrl, `${label}.fromUrl`),
    toUrl: normalizeHttpsUrl(value.toUrl, `${label}.toUrl`),
    beforeArtifactDigest: normalizeDigest(
      value.beforeArtifactDigest,
      `${label}.beforeArtifactDigest`,
    ),
    afterArtifactDigest: normalizeDigest(
      value.afterArtifactDigest,
      `${label}.afterArtifactDigest`,
    ),
    reviewDigest: normalizeDigest(value.reviewDigest, `${label}.reviewDigest`),
  };
}

function normalizeEvidenceChanges(value: unknown): RefreshEvidenceChange[] {
  if (!Array.isArray(value))
    throw new Error("changes.evidence must be an array.");
  const entries = value.map((entry, index) => {
    const label = `changes.evidence[${index}]`;
    assertRecord(entry, label);
    assertExactKeys(entry, EVIDENCE_KEYS, label);
    return {
      id: normalizeMachineId(entry.id, `${label}.id`),
      action: normalizeAction(entry.action, `${label}.action`),
      detail: normalizeNonEmptyString(entry.detail, `${label}.detail`),
      sourceDigest: normalizeDigest(
        entry.sourceDigest,
        `${label}.sourceDigest`,
      ),
    };
  });
  assertUnique(
    entries.map((entry) => entry.id),
    "changes.evidence IDs",
  );
  return entries.sort((left, right) => compareCodePoints(left.id, right.id));
}

function normalizeInternalLinkChanges(
  value: unknown,
): RefreshInternalLinkChange[] {
  if (!Array.isArray(value)) {
    throw new Error("changes.internalLinks must be an array.");
  }
  const entries = value.map((entry, index) => {
    const label = `changes.internalLinks[${index}]`;
    assertRecord(entry, label);
    assertExactKeys(entry, LINK_KEYS, label);
    return {
      fromUrl: normalizeHttpsUrl(entry.fromUrl, `${label}.fromUrl`),
      toUrl: normalizeHttpsUrl(entry.toUrl, `${label}.toUrl`),
      action: normalizeAction(entry.action, `${label}.action`),
      detail: normalizeNonEmptyString(entry.detail, `${label}.detail`),
    };
  });
  return entries.sort((left, right) =>
    compareCodePoints(
      `${left.fromUrl}\u0000${left.toUrl}\u0000${left.action}\u0000${left.detail}`,
      `${right.fromUrl}\u0000${right.toUrl}\u0000${right.action}\u0000${right.detail}`,
    ),
  );
}

function normalizeMetadataChanges(value: unknown): RefreshMetadataChange[] {
  if (!Array.isArray(value))
    throw new Error("changes.metadata must be an array.");
  const entries = value.map((entry, index) => {
    const label = `changes.metadata[${index}]`;
    assertRecord(entry, label);
    assertExactKeys(entry, METADATA_KEYS, label);
    return {
      field: normalizeMachineId(entry.field, `${label}.field`),
      action: normalizeAction(entry.action, `${label}.action`),
      detail: normalizeNonEmptyString(entry.detail, `${label}.detail`),
    };
  });
  return entries.sort((left, right) =>
    compareCodePoints(
      `${left.field}\u0000${left.action}\u0000${left.detail}`,
      `${right.field}\u0000${right.action}\u0000${right.detail}`,
    ),
  );
}

function normalizeGovernedContentChanges(
  value: unknown,
): RefreshGovernedContentChange[] {
  if (!Array.isArray(value)) {
    throw new Error("changes.governedContent must be an array.");
  }
  const entries = value.map((entry, index) => {
    const label = `changes.governedContent[${index}]`;
    assertRecord(entry, label);
    assertExactKeys(entry, GOVERNED_CONTENT_KEYS, label);
    if (
      typeof entry.kind !== "string" ||
      !CONTENT_KINDS.includes(entry.kind as RefreshGovernedContentKind)
    ) {
      throw new Error(`${label}.kind must be a governed content kind.`);
    }
    const action = normalizeAction(entry.action, `${label}.action`);
    const verification = entry.verification as RefreshVerification;
    if (verification !== "verified" && verification !== "unverified") {
      throw new Error(`${label}.verification must be verified or unverified.`);
    }
    const actor =
      entry.actor === null
        ? null
        : normalizeHumanIdentity(entry.actor, `${label}.actor`);
    if (action === "unchanged" && actor !== null) {
      throw new Error(`${label}. unchanged content must not have an actor.`);
    }
    if (action !== "unchanged" && actor === null) {
      throw new Error(`${label}. changed content requires a human actor.`);
    }
    return {
      kind: entry.kind as RefreshGovernedContentKind,
      action,
      verification,
      actor,
      reason: normalizeNonEmptyString(entry.reason, `${label}.reason`),
    };
  });
  return entries.sort((left, right) =>
    compareCodePoints(
      `${left.kind}\u0000${left.action}\u0000${left.verification}\u0000${left.reason}`,
      `${right.kind}\u0000${right.action}\u0000${right.verification}\u0000${right.reason}`,
    ),
  );
}

function normalizeChanges(value: unknown): RefreshChanges {
  assertRecord(value, "changes");
  assertExactKeys(value, CHANGES_KEYS, "changes");
  return {
    evidence: normalizeEvidenceChanges(value.evidence),
    internalLinks: normalizeInternalLinkChanges(value.internalLinks),
    metadata: normalizeMetadataChanges(value.metadata),
    governedContent: normalizeGovernedContentChanges(value.governedContent),
  };
}

function normalizeInput(value: unknown): RefreshPublicationRecord {
  assertRecord(value, "refresh event");
  assertExactKeys(value, INPUT_KEYS, "refresh event");
  if (value.version !== 1) throw new Error("refresh event.version must be 1.");

  const beforeArtifactDigest = normalizeDigest(
    value.beforeArtifactDigest,
    "beforeArtifactDigest",
  );
  const afterArtifactDigest = normalizeDigest(
    value.afterArtifactDigest,
    "afterArtifactDigest",
  );
  return {
    version: 1,
    eventId: normalizeMachineId(value.eventId, "eventId"),
    claimedState: normalizeState(value.claimedState),
    candidate: normalizeCandidate(value.candidate),
    beforeArtifactDigest,
    afterArtifactDigest,
    changeReasons: normalizeStringArray(
      value.changeReasons,
      "changeReasons",
      true,
    ),
    changes: normalizeChanges(value.changes),
    gates: normalizeGateResults(value.gates),
    audit: normalizeAudit(value.audit),
    approvals: normalizeApprovals(value.approvals),
    deployment: normalizeDeployment(value.deployment),
    liveVerification: normalizeLiveVerification(value.liveVerification),
    search: normalizeSearch(value.search),
    metrics: normalizeMetrics(value.metrics),
    rollback: normalizeRollback(value.rollback),
    reviewPlan: normalizeReviewPlan(value.reviewPlan),
    failureReasons: normalizeFailureReasons(value.failureReasons),
  };
}

function assertUnique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} must be unique.`);
  }
}

function hasRecordedChanges(record: RefreshPublicationRecord): boolean {
  const { changes } = record;
  return (
    record.candidate.existingUrl !== record.candidate.targetUrl ||
    changes.evidence.some((entry) => entry.action !== "unchanged") ||
    changes.internalLinks.some((entry) => entry.action !== "unchanged") ||
    changes.metadata.some((entry) => entry.action !== "unchanged") ||
    changes.governedContent.some((entry) => entry.action !== "unchanged")
  );
}

function candidateIdentityIssues(candidate: RefreshCandidate): string[] {
  const pathSegments = new URL(candidate.existingUrl).pathname
    .split("/")
    .filter((segment) => segment.length > 0);
  const existingSlug = pathSegments[pathSegments.length - 1] ?? "";
  return existingSlug === candidate.slug ? [] : ["existing_url_slug_mismatch"];
}

function contentIssues(changes: RefreshChanges): string[] {
  return changes.governedContent
    .filter(
      (entry) =>
        entry.verification === "unverified" &&
        entry.action !== "remove" &&
        entry.action !== "generalize",
    )
    .map((entry) => `unverified_content_not_safely_disposed:${entry.kind}`);
}

function urlDispositionIssues(
  candidate: RefreshCandidate,
  beforeArtifactDigest: Sha256Digest,
  afterArtifactDigest: Sha256Digest,
  reviewDigest: Sha256Digest,
): string[] {
  const issues: string[] = [];
  const changed = candidate.existingUrl !== candidate.targetUrl;
  const disposition = candidate.urlDisposition;

  if (changed && disposition.kind !== "change") {
    issues.push("url_change_requires_approval");
  }
  if (!changed && disposition.kind !== "preserve") {
    issues.push("url_disposition_must_preserve_existing_url");
  }
  if (disposition.kind === "preserve") {
    if (disposition.approval !== null) {
      issues.push("url_preserve_disposition_cannot_have_approval");
    }
    if (disposition.redirectPlan.length > 0) {
      issues.push("url_preserve_disposition_cannot_have_redirect_plan");
    }
  }
  if (disposition.kind === "change") {
    const approval = disposition.approval;
    if (approval === null) {
      issues.push("url_change_requires_approval");
    } else {
      if (approval.fromUrl !== candidate.existingUrl) {
        issues.push("url_approval_from_url_mismatch");
      }
      if (approval.toUrl !== candidate.targetUrl) {
        issues.push("url_approval_to_url_mismatch");
      }
      if (approval.beforeArtifactDigest !== beforeArtifactDigest) {
        issues.push("url_approval_before_artifact_digest_mismatch");
      }
      if (approval.afterArtifactDigest !== afterArtifactDigest) {
        issues.push("url_approval_after_artifact_digest_mismatch");
      }
      if (approval.reviewDigest !== reviewDigest) {
        issues.push("url_approval_review_digest_mismatch");
      }
    }
    if (disposition.redirectPlan.length === 0) {
      issues.push("url_change_requires_redirect_plan");
    }
  }
  return issues.sort(compareCodePoints);
}

function declarationIssues(record: RefreshPublicationRecord): string[] {
  const issues: string[] = [];
  const hasChanges = hasRecordedChanges(record);
  const sameArtifact =
    record.beforeArtifactDigest === record.afterArtifactDigest;

  if (hasChanges && sameArtifact) {
    issues.push("artifact_digest_unchanged_after_declared_changes");
  }
  if (!hasChanges && !sameArtifact) {
    issues.push("artifact_changed_without_declared_changes");
  }
  if (hasChanges && record.changeReasons.length === 0) {
    issues.push("change_reasons_required");
  }
  if (!hasChanges && record.changeReasons.length > 0) {
    issues.push("change_reasons_without_declared_changes");
  }
  if (record.audit.artifactDigest !== record.afterArtifactDigest) {
    issues.push("audit_artifact_digest_mismatch");
  }
  if (record.rollback.artifactDigest !== record.beforeArtifactDigest) {
    issues.push("rollback_artifact_digest_mismatch");
  }
  return issues;
}

function lifecycleState(
  record: RefreshPublicationRecord,
  blockers: readonly string[],
  pendingGate: boolean,
): RefreshPublicationState {
  if (blockers.length > 0) return "blocked";
  if (!hasRecordedChanges(record)) return "no-op";
  if (pendingGate) return "ready";

  const claimed = record.claimedState;
  if (claimed === "no-op") return "ready";
  if (claimed === "blocked") return "blocked";
  if (claimed === "ready") return "ready";
  if (claimed === "validated") return "validated";
  if (claimed === "approved") return "approved";
  if (claimed === "deployed") return "deployed";
  return "live_verified";
}

function buildSummary(
  record: RefreshPublicationRecord,
  state: RefreshPublicationState,
  blockers: readonly string[],
): string {
  return [
    "policy=refresh_publication",
    `event=${record.eventId}`,
    `state=${state}`,
    `eligible=${blockers.length === 0}`,
    `published=${state === "live_verified"}`,
    `completed=${state === "live_verified"}`,
    `existing=${record.candidate.existingUrl}`,
    `target=${record.candidate.targetUrl}`,
    `url_disposition=${record.candidate.urlDisposition.kind}`,
    `notification=${record.search.notification.status}`,
    `indexation=${record.search.indexation.status}`,
    `blockers=${blockers.length === 0 ? "none" : blockers.join(",")}`,
  ].join(";");
}

export function evaluateRefreshPublication(
  value: RefreshPublicationInput,
): RefreshPublicationDecision {
  const record = normalizeInput(value);
  const blockers = [
    ...candidateIdentityIssues(record.candidate),
    ...urlDispositionIssues(
      record.candidate,
      record.beforeArtifactDigest,
      record.afterArtifactDigest,
      record.audit.reviewDigest,
    ),
    ...declarationIssues(record),
    ...contentIssues(record.changes),
  ];
  const hasChanges = hasRecordedChanges(record);
  const noOp = !hasChanges && blockers.length === 0;

  if (!noOp) {
    blockers.push(
      ...gateIssues(record.gates, record.afterArtifactDigest, {
        notRunIsIssue: false,
      }),
    );
  }

  const needsApproval =
    record.claimedState === "approved" ||
    record.claimedState === "deployed" ||
    record.claimedState === "live_verified";
  const needsDeployment =
    record.claimedState === "deployed" ||
    record.claimedState === "live_verified";
  const needsLive = record.claimedState === "live_verified";

  if (!noOp && needsApproval) {
    blockers.push(
      ...approvalIssues(
        record.approvals,
        record.afterArtifactDigest,
        record.audit.reviewDigest,
      ),
    );
  }
  if (!noOp && needsDeployment) {
    blockers.push(
      ...deploymentIssues(
        record.deployment,
        record.candidate.targetUrl,
        record.afterArtifactDigest,
      ),
    );
  }
  if (!noOp && needsLive) {
    blockers.push(
      ...liveVerificationIssues(
        record.liveVerification,
        record.candidate.targetUrl,
        record.afterArtifactDigest,
      ),
    );
  }

  const normalizedBlockers = uniqueSorted(blockers);
  const pendingGate = !noOp && hasPendingGate(record.gates);
  const state = lifecycleState(record, normalizedBlockers, pendingGate);
  const summary = buildSummary(record, state, normalizedBlockers);
  const decision: RefreshPublicationDecision = {
    policy: "refresh_publication",
    state,
    eligible: normalizedBlockers.length === 0 && state !== "blocked",
    published: state === "live_verified",
    completed: state === "live_verified",
    blockers: normalizedBlockers,
    failureReasons: record.failureReasons,
    record,
    summary,
    summaryDigest: digestCanonical({
      policy: "refresh_publication",
      eventId: record.eventId,
      state,
      eligible: normalizedBlockers.length === 0 && state !== "blocked",
      published: state === "live_verified",
      completed: state === "live_verified",
      blockers: normalizedBlockers,
      failureReasons: record.failureReasons,
      candidate: record.candidate,
      beforeArtifactDigest: record.beforeArtifactDigest,
      afterArtifactDigest: record.afterArtifactDigest,
      reviewDigest: record.audit.reviewDigest,
      notification: record.search.notification.status,
      indexation: record.search.indexation.status,
    }),
  };

  return deepFreeze(decision);
}
