import { createHash } from "node:crypto";

export const PUBLICATION_GATE_NAMES = Object.freeze([
  "schema",
  "evidence",
  "graph",
  "metadata",
  "privacy",
  "review",
  "release_preflight",
] as const);

export const PUBLICATION_LIVE_CHECK_NAMES = Object.freeze([
  "target_url",
  "canonical",
  "expected_content",
  "structured_data",
  "internal_links",
  "enquiry_path",
] as const);

export type PublicationGateName = (typeof PUBLICATION_GATE_NAMES)[number];
export type PublicationLiveCheckName =
  (typeof PUBLICATION_LIVE_CHECK_NAMES)[number];
export type Sha256Digest = `sha256:${string}`;

export type PublicationGateStatus =
  | "verified"
  | "blocked"
  | "missing"
  | "not_run";

export interface PublicationGateResult {
  status: PublicationGateStatus;
  detail: string;
  artifactDigest: Sha256Digest | null;
}

export type PublicationGateResults = Record<
  PublicationGateName,
  PublicationGateResult
>;

export type LiveCheckStatus = "verified" | "failed" | "not_run";

export interface LiveCheckResult {
  status: LiveCheckStatus;
  detail: string;
}

export type LiveCheckResults = Record<
  PublicationLiveCheckName,
  LiveCheckResult
>;

export interface HumanIdentity {
  id: string;
  type: "human";
}

export interface PublicationApproval {
  actor: HumanIdentity;
  recordedAt: string;
  artifactDigest: Sha256Digest;
  reviewDigest: Sha256Digest;
}

export interface PublicationApprovals {
  content: PublicationApproval | null;
  production: PublicationApproval | null;
}

export type SourceLineageKind =
  | "brief"
  | "evidence"
  | "artifact"
  | "review"
  | "release"
  | "other";

export interface SourceLineageEntry {
  id: string;
  kind: SourceLineageKind;
  reference: string;
  digest: Sha256Digest | null;
}

export interface PublicationAudit {
  artifactDigest: Sha256Digest;
  reviewDigest: Sha256Digest;
  sourceLineage: SourceLineageEntry[];
}

export interface DeploymentRecord {
  id: string;
  targetUrl: string;
  artifactDigest: Sha256Digest;
  recordedAt: string;
}

export interface LiveVerificationRecord {
  targetUrl: string;
  canonicalUrl: string;
  artifactDigest: Sha256Digest;
  recordedAt: string;
  checks: LiveCheckResults;
}

export type SearchNotificationStatus = "not_attempted" | "submitted" | "failed";

export interface SearchNotificationRecord {
  status: SearchNotificationStatus;
  target: string | null;
  recordedAt: string | null;
  detail: string;
}

export type IndexationStatus =
  | "unknown"
  | "pending"
  | "indexed"
  | "not_indexed";

export interface IndexationRecord {
  status: IndexationStatus;
  observedAt: string | null;
  evidence: string | null;
}

export interface PublicationSearchRecord {
  notification: SearchNotificationRecord;
  indexation: IndexationRecord;
}

export type PublicationMetricStatus =
  | "available"
  | "unavailable"
  | "pending"
  | "blocked";

export interface PublicationMetric {
  id: string;
  status: PublicationMetricStatus;
  value: number | null;
  unit: string;
  sourceLineage: string[];
  reason: string | null;
}

export interface RollbackPlan {
  owner: HumanIdentity;
  artifactDigest: Sha256Digest;
  triggers: string[];
  steps: string[];
}

export interface ReviewPlan {
  owner: HumanIdentity;
  dueAt: string | null;
  reasons: string[];
}

const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/;
const MACHINE_ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function compareCodePoints(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function assertRecord(
  value: unknown,
  label: string,
): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

export function assertExactKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
  label: string,
): void {
  const allowed = new Set(allowedKeys);
  const unknownKeys = Object.keys(value)
    .filter((key) => !allowed.has(key))
    .sort(compareCodePoints);

  if (unknownKeys.length > 0) {
    throw new Error(`${label} has unknown field ${unknownKeys[0]}.`);
  }
}

export function normalizeNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function normalizeMachineId(value: unknown, label: string): string {
  const normalized = normalizeNonEmptyString(value, label);
  if (!MACHINE_ID_PATTERN.test(normalized)) {
    throw new Error(`${label} must be a lowercase machine-readable ID.`);
  }
  return normalized;
}

export function normalizeDigest(value: unknown, label: string): Sha256Digest {
  if (typeof value !== "string" || !DIGEST_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase sha256 digest.`);
  }
  return value as Sha256Digest;
}

export function normalizeNullableDigest(
  value: unknown,
  label: string,
): Sha256Digest | null {
  return value === null ? null : normalizeDigest(value, label);
}

export function normalizeTimestamp(value: unknown, label: string): string {
  const normalized = normalizeNonEmptyString(value, label);
  if (!ISO_TIMESTAMP_PATTERN.test(normalized)) {
    throw new Error(`${label} must be an absolute UTC ISO-8601 timestamp.`);
  }
  return normalized;
}

export function normalizeNullableTimestamp(
  value: unknown,
  label: string,
): string | null {
  return value === null ? null : normalizeTimestamp(value, label);
}

export function normalizeHttpsUrl(value: unknown, label: string): string {
  const normalized = normalizeNonEmptyString(value, label);
  try {
    const parsed = new URL(normalized);
    if (
      parsed.protocol !== "https:" ||
      parsed.username.length > 0 ||
      parsed.password.length > 0
    ) {
      throw new Error("invalid HTTPS URL");
    }
  } catch {
    throw new Error(`${label} must be an HTTPS URL without credentials.`);
  }
  return normalized;
}

export function normalizeStringList(
  value: unknown,
  label: string,
  options: { allowEmpty?: boolean } = {},
): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }

  const normalized = value.map((entry, index) =>
    normalizeNonEmptyString(entry, `${label}[${index}]`),
  );
  const unique = [...new Set(normalized)].sort(compareCodePoints);

  if (!options.allowEmpty && unique.length === 0) {
    throw new Error(`${label} must contain at least one entry.`);
  }
  return unique;
}

export function normalizeHumanIdentity(
  value: unknown,
  label: string,
): HumanIdentity {
  assertRecord(value, label);
  assertExactKeys(value, ["id", "type"], label);
  if (value.type !== "human") {
    throw new Error(`${label}.type must be human.`);
  }
  return {
    id: normalizeMachineId(value.id, `${label}.id`),
    type: "human",
  };
}

export function normalizeAudit(
  value: unknown,
  label = "audit",
): PublicationAudit {
  assertRecord(value, label);
  assertExactKeys(
    value,
    ["artifactDigest", "reviewDigest", "sourceLineage"],
    label,
  );
  if (!Array.isArray(value.sourceLineage)) {
    throw new Error(`${label}.sourceLineage must be an array.`);
  }

  const sourceLineage = value.sourceLineage.map((entry, index) => {
    const entryLabel = `${label}.sourceLineage[${index}]`;
    assertRecord(entry, entryLabel);
    assertExactKeys(entry, ["id", "kind", "reference", "digest"], entryLabel);
    const kind = normalizeEnum(
      entry.kind,
      ["brief", "evidence", "artifact", "review", "release", "other"],
      `${entryLabel}.kind`,
    ) as SourceLineageKind;
    return {
      id: normalizeMachineId(entry.id, `${entryLabel}.id`),
      kind,
      reference: normalizeNonEmptyString(
        entry.reference,
        `${entryLabel}.reference`,
      ),
      digest: normalizeNullableDigest(entry.digest, `${entryLabel}.digest`),
    };
  });

  if (sourceLineage.length === 0) {
    throw new Error(`${label}.sourceLineage must contain at least one entry.`);
  }
  const ids = sourceLineage.map((entry) => entry.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label}.sourceLineage IDs must be unique.`);
  }
  sourceLineage.sort((left, right) =>
    compareCodePoints(
      `${left.id}\u0000${left.kind}\u0000${left.reference}`,
      `${right.id}\u0000${right.kind}\u0000${right.reference}`,
    ),
  );

  return {
    artifactDigest: normalizeDigest(
      value.artifactDigest,
      `${label}.artifactDigest`,
    ),
    reviewDigest: normalizeDigest(value.reviewDigest, `${label}.reviewDigest`),
    sourceLineage,
  };
}

export function normalizeGateResults(
  value: unknown,
  label = "gates",
): PublicationGateResults {
  assertRecord(value, label);
  assertExactKeys(value, PUBLICATION_GATE_NAMES, label);

  return Object.fromEntries(
    PUBLICATION_GATE_NAMES.map((name) => {
      const gateValue = value[name];
      if (gateValue === undefined) {
        return [
          name,
          {
            status: "missing",
            detail: "No gate result was supplied",
            artifactDigest: null,
          },
        ];
      }

      const gateLabel = `${label}.${name}`;
      assertRecord(gateValue, gateLabel);
      assertExactKeys(
        gateValue,
        ["status", "detail", "artifactDigest"],
        gateLabel,
      );
      const status = normalizeEnum(
        gateValue.status,
        ["verified", "blocked", "missing", "not_run"],
        `${gateLabel}.status`,
      ) as PublicationGateStatus;
      const artifactDigest = normalizeNullableDigest(
        gateValue.artifactDigest,
        `${gateLabel}.artifactDigest`,
      );
      if (status === "verified" && artifactDigest === null) {
        throw new Error(`${gateLabel} verified status requires a digest.`);
      }
      if (status !== "verified" && artifactDigest !== null) {
        throw new Error(
          `${gateLabel} ${status} status must use a null digest.`,
        );
      }

      return [
        name,
        {
          status,
          detail: normalizeNonEmptyString(
            gateValue.detail,
            `${gateLabel}.detail`,
          ),
          artifactDigest,
        },
      ];
    }),
  ) as PublicationGateResults;
}

export function gateIssues(
  gates: PublicationGateResults,
  artifactDigest: Sha256Digest,
  options: { notRunIsIssue: boolean },
): string[] {
  const issues: string[] = [];
  for (const name of PUBLICATION_GATE_NAMES) {
    const gate = gates[name];
    if (gate.status === "blocked") issues.push(`gate_blocked:${name}`);
    if (gate.status === "missing") issues.push(`gate_missing:${name}`);
    if (gate.status === "not_run" && options.notRunIsIssue) {
      issues.push(`gate_not_verified:${name}`);
    }
    if (gate.status === "verified" && gate.artifactDigest !== artifactDigest) {
      issues.push(`gate_artifact_digest_mismatch:${name}`);
    }
  }
  return issues.sort(compareCodePoints);
}

export function hasPendingGate(gates: PublicationGateResults): boolean {
  return PUBLICATION_GATE_NAMES.some(
    (name) => gates[name].status === "not_run",
  );
}

function normalizeEnum(
  value: unknown,
  allowedValues: readonly string[],
  label: string,
): string {
  if (typeof value !== "string" || !allowedValues.includes(value)) {
    throw new Error(`${label} must be one of ${allowedValues.join(", ")}.`);
  }
  return value;
}

function normalizeApproval(
  value: unknown,
  label: string,
): PublicationApproval | null {
  if (value === null) return null;
  assertRecord(value, label);
  assertExactKeys(
    value,
    ["actor", "recordedAt", "artifactDigest", "reviewDigest"],
    label,
  );
  return {
    actor: normalizeHumanIdentity(value.actor, `${label}.actor`),
    recordedAt: normalizeTimestamp(value.recordedAt, `${label}.recordedAt`),
    artifactDigest: normalizeDigest(
      value.artifactDigest,
      `${label}.artifactDigest`,
    ),
    reviewDigest: normalizeDigest(value.reviewDigest, `${label}.reviewDigest`),
  };
}

export function normalizeApprovals(
  value: unknown,
  label = "approvals",
): PublicationApprovals {
  assertRecord(value, label);
  assertExactKeys(value, ["content", "production"], label);
  return {
    content: normalizeApproval(value.content, `${label}.content`),
    production: normalizeApproval(value.production, `${label}.production`),
  };
}

export function approvalIssues(
  approvals: PublicationApprovals,
  artifactDigest: Sha256Digest,
  reviewDigest: Sha256Digest,
): string[] {
  const issues: string[] = [];
  const pairs = [
    ["content", approvals.content],
    ["production", approvals.production],
  ] as const;

  for (const [kind, approval] of pairs) {
    if (!approval) {
      issues.push(`${kind}_approval_missing`);
      continue;
    }
    if (approval.artifactDigest !== artifactDigest) {
      issues.push(`${kind}_approval_artifact_digest_mismatch`);
    }
    if (approval.reviewDigest !== reviewDigest) {
      issues.push(`${kind}_approval_review_digest_mismatch`);
    }
  }

  if (
    approvals.content &&
    approvals.production &&
    approvals.content.actor.id === approvals.production.actor.id
  ) {
    issues.push("approval_actors_must_be_independent");
  }
  if (
    approvals.content &&
    approvals.production &&
    approvals.production.recordedAt <= approvals.content.recordedAt
  ) {
    issues.push("production_approval_must_follow_content_approval");
  }

  return issues.sort(compareCodePoints);
}

export function normalizeDeployment(
  value: unknown,
  label = "deployment",
): DeploymentRecord | null {
  if (value === null) return null;
  assertRecord(value, label);
  assertExactKeys(
    value,
    ["id", "targetUrl", "artifactDigest", "recordedAt"],
    label,
  );
  return {
    id: normalizeMachineId(value.id, `${label}.id`),
    targetUrl: normalizeHttpsUrl(value.targetUrl, `${label}.targetUrl`),
    artifactDigest: normalizeDigest(
      value.artifactDigest,
      `${label}.artifactDigest`,
    ),
    recordedAt: normalizeTimestamp(value.recordedAt, `${label}.recordedAt`),
  };
}

export function deploymentIssues(
  deployment: DeploymentRecord | null,
  targetUrl: string,
  artifactDigest: Sha256Digest,
): string[] {
  if (!deployment) return ["deployment_missing"];
  const issues: string[] = [];
  if (deployment.targetUrl !== targetUrl) {
    issues.push("deployment_target_url_mismatch");
  }
  if (deployment.artifactDigest !== artifactDigest) {
    issues.push("deployment_artifact_digest_mismatch");
  }
  return issues.sort(compareCodePoints);
}

function normalizeLiveChecks(value: unknown, label: string): LiveCheckResults {
  assertRecord(value, label);
  assertExactKeys(value, PUBLICATION_LIVE_CHECK_NAMES, label);

  return Object.fromEntries(
    PUBLICATION_LIVE_CHECK_NAMES.map((name) => {
      const checkValue = value[name];
      if (checkValue === undefined) {
        return [
          name,
          { status: "not_run", detail: "No live check result was supplied" },
        ];
      }
      const checkLabel = `${label}.${name}`;
      assertRecord(checkValue, checkLabel);
      assertExactKeys(checkValue, ["status", "detail"], checkLabel);
      return [
        name,
        {
          status: normalizeEnum(
            checkValue.status,
            ["verified", "failed", "not_run"],
            `${checkLabel}.status`,
          ) as LiveCheckStatus,
          detail: normalizeNonEmptyString(
            checkValue.detail,
            `${checkLabel}.detail`,
          ),
        },
      ];
    }),
  ) as LiveCheckResults;
}

export function normalizeLiveVerification(
  value: unknown,
  label = "liveVerification",
): LiveVerificationRecord | null {
  if (value === null) return null;
  assertRecord(value, label);
  assertExactKeys(
    value,
    ["targetUrl", "canonicalUrl", "artifactDigest", "recordedAt", "checks"],
    label,
  );
  return {
    targetUrl: normalizeHttpsUrl(value.targetUrl, `${label}.targetUrl`),
    canonicalUrl: normalizeHttpsUrl(
      value.canonicalUrl,
      `${label}.canonicalUrl`,
    ),
    artifactDigest: normalizeDigest(
      value.artifactDigest,
      `${label}.artifactDigest`,
    ),
    recordedAt: normalizeTimestamp(value.recordedAt, `${label}.recordedAt`),
    checks: normalizeLiveChecks(value.checks, `${label}.checks`),
  };
}

export function liveVerificationIssues(
  verification: LiveVerificationRecord | null,
  targetUrl: string,
  artifactDigest: Sha256Digest,
): string[] {
  if (!verification) return ["live_verification_missing"];
  const issues: string[] = [];
  if (verification.targetUrl !== targetUrl) {
    issues.push("live_target_url_mismatch");
  }
  if (verification.canonicalUrl !== targetUrl) {
    issues.push("live_canonical_url_mismatch");
  }
  if (verification.artifactDigest !== artifactDigest) {
    issues.push("live_artifact_digest_mismatch");
  }
  for (const name of PUBLICATION_LIVE_CHECK_NAMES) {
    if (verification.checks[name].status !== "verified") {
      issues.push(`live_check_not_verified:${name}`);
    }
  }
  return issues.sort(compareCodePoints);
}

export function normalizeSearch(
  value: unknown,
  label = "search",
): PublicationSearchRecord {
  assertRecord(value, label);
  assertExactKeys(value, ["notification", "indexation"], label);

  const notificationLabel = `${label}.notification`;
  assertRecord(value.notification, notificationLabel);
  assertExactKeys(
    value.notification,
    ["status", "target", "recordedAt", "detail"],
    notificationLabel,
  );
  const notificationStatus = normalizeEnum(
    value.notification.status,
    ["not_attempted", "submitted", "failed"],
    `${notificationLabel}.status`,
  ) as SearchNotificationStatus;
  const notificationTarget =
    value.notification.target === null
      ? null
      : normalizeHttpsUrl(
          value.notification.target,
          `${notificationLabel}.target`,
        );
  const notificationRecordedAt = normalizeNullableTimestamp(
    value.notification.recordedAt,
    `${notificationLabel}.recordedAt`,
  );
  if (
    notificationStatus === "not_attempted" &&
    (notificationTarget !== null || notificationRecordedAt !== null)
  ) {
    throw new Error(
      `${notificationLabel} not_attempted status requires null target and timestamp.`,
    );
  }
  if (
    notificationStatus !== "not_attempted" &&
    (notificationTarget === null || notificationRecordedAt === null)
  ) {
    throw new Error(
      `${notificationLabel} ${notificationStatus} status requires target and timestamp.`,
    );
  }

  const indexationLabel = `${label}.indexation`;
  assertRecord(value.indexation, indexationLabel);
  assertExactKeys(
    value.indexation,
    ["status", "observedAt", "evidence"],
    indexationLabel,
  );
  const indexationStatus = normalizeEnum(
    value.indexation.status,
    ["unknown", "pending", "indexed", "not_indexed"],
    `${indexationLabel}.status`,
  ) as IndexationStatus;
  const observedAt = normalizeNullableTimestamp(
    value.indexation.observedAt,
    `${indexationLabel}.observedAt`,
  );
  const evidence =
    value.indexation.evidence === null
      ? null
      : normalizeNonEmptyString(
          value.indexation.evidence,
          `${indexationLabel}.evidence`,
        );
  if (
    (indexationStatus === "unknown" || indexationStatus === "pending") &&
    (observedAt !== null || evidence !== null)
  ) {
    throw new Error(
      `${indexationLabel} ${indexationStatus} status requires null observation fields.`,
    );
  }
  if (
    (indexationStatus === "indexed" || indexationStatus === "not_indexed") &&
    (observedAt === null || evidence === null)
  ) {
    throw new Error(
      `${indexationLabel} ${indexationStatus} status requires observation evidence.`,
    );
  }

  return {
    notification: {
      status: notificationStatus,
      target: notificationTarget,
      recordedAt: notificationRecordedAt,
      detail: normalizeNonEmptyString(
        value.notification.detail,
        `${notificationLabel}.detail`,
      ),
    },
    indexation: {
      status: indexationStatus,
      observedAt,
      evidence,
    },
  };
}

export function normalizeMetrics(
  value: unknown,
  label = "metrics",
): PublicationMetric[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }

  const metrics = value.map((entry, index) => {
    const entryLabel = `${label}[${index}]`;
    assertRecord(entry, entryLabel);
    assertExactKeys(
      entry,
      ["id", "status", "value", "unit", "sourceLineage", "reason"],
      entryLabel,
    );
    const status = normalizeEnum(
      entry.status,
      ["available", "unavailable", "pending", "blocked"],
      `${entryLabel}.status`,
    ) as PublicationMetricStatus;
    let metricValue: number | null = null;
    if (status === "available") {
      if (typeof entry.value !== "number" || !Number.isFinite(entry.value)) {
        throw new Error(`${entryLabel} available status requires a number.`);
      }
      metricValue = entry.value;
    } else if (entry.value !== null) {
      throw new Error(`${entryLabel} ${status} status must use null value.`);
    }
    const reason =
      entry.reason === null
        ? null
        : normalizeNonEmptyString(entry.reason, `${entryLabel}.reason`);
    if (status !== "available" && reason === null) {
      throw new Error(`${entryLabel} ${status} status requires a reason.`);
    }

    return {
      id: normalizeMachineId(entry.id, `${entryLabel}.id`),
      status,
      value: metricValue,
      unit: normalizeNonEmptyString(entry.unit, `${entryLabel}.unit`),
      sourceLineage: normalizeStringList(
        entry.sourceLineage,
        `${entryLabel}.sourceLineage`,
      ),
      reason,
    };
  });

  const ids = metrics.map((metric) => metric.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label} IDs must be unique.`);
  }
  return metrics.sort((left, right) => compareCodePoints(left.id, right.id));
}

export function normalizeRollback(
  value: unknown,
  label = "rollback",
): RollbackPlan {
  assertRecord(value, label);
  assertExactKeys(
    value,
    ["owner", "artifactDigest", "triggers", "steps"],
    label,
  );
  return {
    owner: normalizeHumanIdentity(value.owner, `${label}.owner`),
    artifactDigest: normalizeDigest(
      value.artifactDigest,
      `${label}.artifactDigest`,
    ),
    triggers: normalizeStringList(value.triggers, `${label}.triggers`),
    steps: normalizeStringList(value.steps, `${label}.steps`),
  };
}

export function normalizeReviewPlan(
  value: unknown,
  label = "reviewPlan",
): ReviewPlan {
  assertRecord(value, label);
  assertExactKeys(value, ["owner", "dueAt", "reasons"], label);
  return {
    owner: normalizeHumanIdentity(value.owner, `${label}.owner`),
    dueAt: normalizeNullableTimestamp(value.dueAt, `${label}.dueAt`),
    reasons: normalizeStringList(value.reasons, `${label}.reasons`),
  };
}

export function normalizeFailureReasons(
  value: unknown,
  label = "failureReasons",
): string[] {
  return normalizeStringList(value, label, { allowEmpty: true });
}

function canonicalize(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Canonical publication data requires finite numbers.");
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort(compareCodePoints)
        .map((key) => {
          if (record[key] === undefined) {
            throw new Error(
              "Canonical publication data cannot contain undefined values.",
            );
          }
          return [key, canonicalize(record[key])];
        }),
    );
  }
  throw new Error(
    `Canonical publication data cannot contain ${typeof value} values.`,
  );
}

export function digestCanonical(value: unknown): Sha256Digest {
  const serialized = JSON.stringify(canonicalize(value));
  return `sha256:${createHash("sha256").update(serialized).digest("hex")}`;
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }
  return value;
}

export function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareCodePoints);
}
