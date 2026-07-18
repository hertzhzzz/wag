import { createHash } from "node:crypto";

import {
  isTrustedPublicationReleaseEvent,
  type PublicationEventDataMode,
  type PublicationReleaseEventEnvelope,
} from "./releaseEventAdapter";
import type { Sha256Digest } from "../release/releaseContract";

export {
  PUBLICATION_EVENT_DATA_MODES,
  adaptReleaseWorkflowToPublicationEvent,
  isTrustedPublicationReleaseEvent,
  type AdaptReleaseWorkflowInput,
  type PublicationEventDataMode,
  type PublicationReleaseEventEnvelope,
} from "./releaseEventAdapter";

export const CADENCE_DATA_MODES = Object.freeze([
  "actual",
  "synthetic_fixture",
  "dry_run",
] as const);

export const CADENCE_GATE_IDS = Object.freeze([
  "schema",
  "evidence",
  "geo",
  "graph",
  "metadata",
  "build",
  "content_approval",
  "release_approval",
  "live_verification",
] as const);

export const WEEKLY_MEASURE_CATEGORIES = Object.freeze([
  "content",
  "search",
  "geo",
  "graph",
  "evidence",
  "review",
  "enquiry",
] as const);

export const HOLD_SELECTED_CAPACITY = 2;

export type CadenceDataMode = (typeof CADENCE_DATA_MODES)[number];
export type CadenceGateId = (typeof CADENCE_GATE_IDS)[number];
export type WeeklyMeasureCategory = (typeof WEEKLY_MEASURE_CATEGORIES)[number];
export type CadenceGateStatus = "passed" | "pending" | "blocked" | "failed";

export interface CadenceProvenance {
  source: string;
  capturedAt: string;
  fixtureId?: string;
}

export interface CadenceGateInput {
  status: CadenceGateStatus;
  evidence: string;
}

export type PublicationEventKind =
  | "high_intent"
  | "refresh"
  | "evidence_upgrade"
  | "internal_link_upgrade"
  | "pillar_improvement";

export type PublicationEventStatus =
  | "draft"
  | "validated"
  | "approved"
  | "deployed"
  | "live_verified"
  | "failed"
  | "blocked"
  | "deferred"
  | "rescheduled";

export type SearchNotificationStatus = "submitted" | "failed" | "not_attempted";
export type IndexationStatus =
  | "unknown"
  | "observed_indexed"
  | "observed_not_indexed";

export interface SearchNotificationObservationInput {
  status: SearchNotificationStatus;
  recordedAt: string;
  detail: string;
}

export type IndexationObservationInput =
  | { status: "unknown" }
  | {
      status: Exclude<IndexationStatus, "unknown">;
      observedAt: string;
      evidence: string;
    };

export interface PublicationEventInput {
  eventId: string;
  kind: PublicationEventKind;
  status: PublicationEventStatus;
  targetUrl: string;
  owner: string;
  nextAction: string | null;
  artifactDigest: string;
  reviewDigest: string;
  gates: Record<CadenceGateId, CadenceGateInput>;
  failureReasons: string[];
  releaseEvent: PublicationReleaseEventEnvelope | null;
  searchNotification: SearchNotificationObservationInput;
  indexationObservation: IndexationObservationInput;
}

export type CompletionSource =
  | "actual"
  | "synthetic_fixture"
  | "dry_run"
  | "none";

export interface PublicationEventRecord extends PublicationEventInput {
  completed: boolean;
  completionSource: CompletionSource;
  trustedReleaseEvidence: boolean;
}

export type WeeklyMeasureStatus =
  | "available"
  | "partial"
  | "missing"
  | "delayed"
  | "blocked_privacy_approval"
  | "unavailable";

export type WeeklyMeasureKind =
  | "count"
  | "rate"
  | "ratio"
  | "duration"
  | "score";
export type WeeklyMeasureSignalType = "early_operational" | "lagging_outcome";

export interface WeeklyDateRangeInput {
  start: string;
  end: string;
}

export interface WeeklyMeasureSourceInput {
  system: string;
  dataset: string;
  version: string;
  asOfDate: string;
}

export interface WeeklyMeasureInput {
  id: string;
  category: WeeklyMeasureCategory;
  label: string;
  definition: string;
  signalType: WeeklyMeasureSignalType;
  status: WeeklyMeasureStatus;
  kind: WeeklyMeasureKind;
  rawCount: number | null;
  numerator: number | null;
  denominator: number | null;
  dateRange: WeeklyDateRangeInput;
  sourceLineage: WeeklyMeasureSourceInput[];
}

export interface WeeklyMeasureRecord extends WeeklyMeasureInput {
  value: number | null;
}

export interface CadenceCapacityInput {
  approvedSlots: number;
  approvedBy: string | null;
  approvedOn: string | null;
}

export interface CapacityApprovalRecord extends CadenceCapacityInput {
  approvalDigest: string;
}

export interface QueueCandidateInput {
  candidateId: string;
  kind: PublicationEventKind;
  opportunityScore: number | null;
  scoreStatus: "available" | "partial" | "missing" | "unavailable";
  evidenceReady: boolean;
  destinationApproved: boolean;
  requiredLinksReady: boolean;
  owner: string | null;
  nextAction: string | null;
  blockers: string[];
}

export interface QueueCandidateRecord extends QueueCandidateInput {
  ready: boolean;
  deferReasons: readonly string[];
}

export interface ScaleEvidenceInput {
  consecutiveCompliantWeeks: number;
  qualityGatesDemonstrated: boolean;
  safetyGatesDemonstrated: boolean;
  reviewThroughputSustainable: boolean;
}

export interface WeeklyCadenceInput {
  version: 1;
  reportId: string;
  dataMode: CadenceDataMode;
  provenance: CadenceProvenance;
  generatedAt: string;
  week: WeeklyDateRangeInput;
  targetEvents: number;
  events: PublicationEventInput[];
  measures: WeeklyMeasureInput[];
  capacity: CadenceCapacityInput;
  queueCandidates: QueueCandidateInput[];
  scaleEvidence: ScaleEvidenceInput;
}

export interface WeeklyEventBuckets {
  completed: readonly PublicationEventRecord[];
  failed: readonly PublicationEventRecord[];
  blocked: readonly PublicationEventRecord[];
  deferred: readonly PublicationEventRecord[];
  rescheduled: readonly PublicationEventRecord[];
  pending: readonly PublicationEventRecord[];
}

export type CompletedCountSource =
  | "actual"
  | "synthetic_fixture"
  | "dry_run"
  | "mixed"
  | "none";

export interface WeeklyCadenceSummary {
  targetEvents: number;
  completedCount: number;
  actualCompletedCount: number;
  syntheticFixtureCompletedCount: number;
  dryRunCompletedCount: number;
  completedCountSource: CompletedCountSource;
  targetMet: boolean;
}

export interface WeeklySignalGroups {
  earlyOperational: readonly WeeklyMeasureRecord[];
  laggingOutcomes: readonly WeeklyMeasureRecord[];
}

export interface NextWeekQueue {
  approvedCapacity: number;
  recommendedCapacity: number;
  selectedCapacity: number;
  capacityApproval: CapacityApprovalRecord;
  selected: readonly QueueCandidateRecord[];
  deferred: readonly QueueCandidateRecord[];
  audit: {
    holdCap: number;
    appliedDecision: ScaleDecision;
    selectedCandidateIds: readonly string[];
    deferredCandidateIds: readonly string[];
  };
}

export type ScaleDecision = "hold" | "eligible_for_human_review";

export interface ScaleAssessment {
  decision: ScaleDecision;
  automaticIncrease: false;
  recommendedCapacity: number;
  selectedCapacity: number;
  holdCap: number;
  reasons: readonly string[];
}

export interface CadenceAuditRecord {
  asOf: string;
  inputDigest: string;
  eventDigests: readonly string[];
  gateEvidenceDigests: readonly string[];
  capacityApprovalDigest: string;
  dataMode: CadenceDataMode;
  provenanceSource: string;
  provenanceCapturedAt: string;
  fixtureId: string | null;
}

export interface WeeklyCadenceReport {
  version: 1;
  reportId: string;
  dataMode: CadenceDataMode;
  provenance: CadenceProvenance;
  generatedAt: string;
  week: WeeklyDateRangeInput;
  summary: WeeklyCadenceSummary;
  events: WeeklyEventBuckets;
  measures: readonly WeeklyMeasureRecord[];
  signals: WeeklySignalGroups;
  nextWeekQueue: NextWeekQueue;
  scaleEvidence: ScaleEvidenceInput;
  scaleAssessment: ScaleAssessment;
  audit: CadenceAuditRecord;
  reportDigest: string;
}

export interface BuildWeeklyCadenceOptions {
  asOf?: string;
}

const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/;
const MACHINE_ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const UTC_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const LATEST_ACTUAL_AS_OF_TIMESTAMP = Date.parse("2026-07-18T23:59:59.999Z");
const EVENT_KINDS = new Set<PublicationEventKind>([
  "high_intent",
  "refresh",
  "evidence_upgrade",
  "internal_link_upgrade",
  "pillar_improvement",
]);
const EVENT_STATUSES = new Set<PublicationEventStatus>([
  "draft",
  "validated",
  "approved",
  "deployed",
  "live_verified",
  "failed",
  "blocked",
  "deferred",
  "rescheduled",
]);
const FAILURE_STATUSES = new Set<PublicationEventStatus>([
  "failed",
  "blocked",
  "deferred",
  "rescheduled",
]);
const UNAVAILABLE_MEASURE_STATUSES = new Set<WeeklyMeasureStatus>([
  "missing",
  "delayed",
  "blocked_privacy_approval",
  "unavailable",
]);

function compareCodePoints(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertRecord(
  value: unknown,
  label: string,
): asserts value is Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${label} must be an object.`);
}

function assertExactKeys(
  value: unknown,
  expected: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  assertRecord(value, label);
  const actual = Object.keys(value).sort(compareCodePoints);
  const wanted = [...expected].sort(compareCodePoints);
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    throw new Error(`${label} must contain exactly: ${wanted.join(", ")}.`);
  }
}

function assertNonEmptyString(
  value: unknown,
  label: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function assertNullableString(
  value: unknown,
  label: string,
): asserts value is string | null {
  if (value !== null) assertNonEmptyString(value, label);
}

function assertMachineId(
  value: unknown,
  label: string,
): asserts value is string {
  assertNonEmptyString(value, label);
  if (!MACHINE_ID_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase machine-readable ID.`);
  }
}

function assertDigest(
  value: unknown,
  label: string,
): asserts value is Sha256Digest {
  if (typeof value !== "string" || !DIGEST_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase sha256 digest.`);
  }
}

function assertBoolean(
  value: unknown,
  label: string,
): asserts value is boolean {
  if (typeof value !== "boolean") throw new Error(`${label} must be boolean.`);
}

function assertFiniteNonNegativeNumber(
  value: unknown,
  label: string,
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number.`);
  }
}

function assertNullableNonNegativeNumber(
  value: unknown,
  label: string,
): asserts value is number | null {
  if (value !== null) assertFiniteNonNegativeNumber(value, label);
}

function assertInteger(value: unknown, label: string): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${label} must be an integer.`);
  }
}

function assertStringArray(
  value: unknown,
  label: string,
): asserts value is string[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  value.forEach((item, index) =>
    assertNonEmptyString(item, `${label}[${index}]`),
  );
}

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

function assertIsoDate(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must be YYYY-MM-DD.`);
  }
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new Error(`${label} must be a valid calendar date.`);
  }
}

function parseUtcTimestamp(value: unknown, label: string): number {
  if (typeof value !== "string" || !UTC_TIMESTAMP_PATTERN.test(value)) {
    throw new Error(`${label} must be an RFC3339 UTC timestamp ending in Z.`);
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a valid RFC3339 UTC timestamp.`);
  }
  const canonical = new Date(parsed).toISOString();
  const expected = value.includes(".") ? value : `${value.slice(0, -1)}.000Z`;
  if (canonical !== expected) {
    throw new Error(`${label} must be a valid calendar timestamp.`);
  }
  return parsed;
}

function assertUtcTimestamp(
  value: unknown,
  label: string,
): asserts value is string {
  parseUtcTimestamp(value, label);
}

function normalizeDateRange(
  value: unknown,
  label: string,
): WeeklyDateRangeInput {
  assertExactKeys(value, ["start", "end"], label);
  assertIsoDate(value.start, `${label}.start`);
  assertIsoDate(value.end, `${label}.end`);
  if (value.start > value.end)
    throw new Error(`${label}.start must not exceed end.`);
  return { start: value.start, end: value.end };
}

function assertSafeTargetUrl(
  value: unknown,
  label: string,
): asserts value is string {
  assertNonEmptyString(value, label);
  if (value.startsWith("/")) {
    if (value.startsWith("//") || /[?#\\]/.test(value)) {
      throw new Error(`${label} must be a safe root-relative URL.`);
    }
    return;
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a safe HTTPS or root-relative URL.`);
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== ""
  ) {
    throw new Error(
      `${label} must use HTTPS without credentials, query, or fragment.`,
    );
  }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => compareCodePoints(left, right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  return value;
}

function digestCanonical(value: unknown): string {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(canonicalize(value)), "utf8")
    .digest("hex")}`;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

function normalizeProvenance(
  value: unknown,
  dataMode: CadenceDataMode,
): CadenceProvenance {
  const expected =
    dataMode === "synthetic_fixture"
      ? ["source", "capturedAt", "fixtureId"]
      : ["source", "capturedAt"];
  assertExactKeys(value, expected, "provenance");
  assertNonEmptyString(value.source, "provenance.source");
  assertUtcTimestamp(value.capturedAt, "provenance.capturedAt");
  if (dataMode === "synthetic_fixture") {
    assertMachineId(value.fixtureId, "provenance.fixtureId");
    return {
      source: value.source.trim(),
      capturedAt: value.capturedAt,
      fixtureId: value.fixtureId,
    };
  }
  return { source: value.source.trim(), capturedAt: value.capturedAt };
}

function normalizeGate(value: unknown, label: string): CadenceGateInput {
  assertExactKeys(value, ["status", "evidence"], label);
  if (
    !(["passed", "pending", "blocked", "failed"] as const).includes(
      value.status as CadenceGateStatus,
    )
  ) {
    throw new Error(`${label}.status is invalid.`);
  }
  assertNonEmptyString(value.evidence, `${label}.evidence`);
  return {
    status: value.status as CadenceGateStatus,
    evidence: value.evidence.trim(),
  };
}

function normalizeGates(
  value: unknown,
  label: string,
): Record<CadenceGateId, CadenceGateInput> {
  assertExactKeys(value, CADENCE_GATE_IDS, label);
  return Object.fromEntries(
    CADENCE_GATE_IDS.map((id) => [
      id,
      normalizeGate(value[id], `${label}.${id}`),
    ]),
  ) as Record<CadenceGateId, CadenceGateInput>;
}

function normalizeApprovalEvidence(
  value: unknown,
  label: string,
): { principal: string; approvedAt: string; bindingDigest: Sha256Digest } {
  assertExactKeys(value, ["principal", "approvedAt", "bindingDigest"], label);
  assertMachineId(value.principal, `${label}.principal`);
  assertUtcTimestamp(value.approvedAt, `${label}.approvedAt`);
  assertDigest(value.bindingDigest, `${label}.bindingDigest`);
  return {
    principal: value.principal,
    approvedAt: value.approvedAt,
    bindingDigest: value.bindingDigest,
  };
}

function normalizeReleaseEnvelope(
  value: unknown,
  expectedMode: CadenceDataMode,
  label: string,
): { envelope: PublicationReleaseEventEnvelope; trustedActual: boolean } {
  assertExactKeys(
    value,
    [
      "version",
      "eventId",
      "dataMode",
      "workflowInstanceId",
      "releaseId",
      "artifactDigest",
      "reportDigest",
      "rollbackPlanDigest",
      "approvalEvidence",
      "deploymentEvidence",
      "liveEvidence",
      "rollbackEvidence",
      "gateEvidenceDigest",
      "eventDigest",
      "provenance",
    ],
    label,
  );
  if (value.version !== 1) throw new Error(`${label}.version must equal 1.`);
  if (!CADENCE_DATA_MODES.includes(value.dataMode as CadenceDataMode)) {
    throw new Error(`${label}.dataMode is invalid.`);
  }
  const dataMode = value.dataMode as PublicationEventDataMode;
  if (dataMode !== expectedMode) {
    throw new Error(
      `${label}.dataMode must match the cadence report dataMode.`,
    );
  }

  const eventId = value.eventId;
  const workflowInstanceId = value.workflowInstanceId;
  const releaseId = value.releaseId;
  const artifactDigest = value.artifactDigest;
  const reportDigest = value.reportDigest;
  const rollbackPlanDigest = value.rollbackPlanDigest;
  assertMachineId(eventId, `${label}.eventId`);
  assertMachineId(workflowInstanceId, `${label}.workflowInstanceId`);
  assertMachineId(releaseId, `${label}.releaseId`);
  assertDigest(artifactDigest, `${label}.artifactDigest`);
  assertDigest(reportDigest, `${label}.reportDigest`);
  assertDigest(rollbackPlanDigest, `${label}.rollbackPlanDigest`);

  const approvalEvidence = value.approvalEvidence;
  assertExactKeys(
    approvalEvidence,
    ["content", "production"],
    `${label}.approvalEvidence`,
  );
  const content = normalizeApprovalEvidence(
    approvalEvidence.content,
    `${label}.approvalEvidence.content`,
  );
  const production = normalizeApprovalEvidence(
    approvalEvidence.production,
    `${label}.approvalEvidence.production`,
  );
  if (content.principal === production.principal) {
    throw new Error(`${label} requires independent approval principals.`);
  }
  if (
    parseUtcTimestamp(
      production.approvedAt,
      `${label}.production.approvedAt`,
    ) <= parseUtcTimestamp(content.approvedAt, `${label}.content.approvedAt`)
  ) {
    throw new Error(
      `${label} production approval must follow content approval.`,
    );
  }

  const deploymentInput = value.deploymentEvidence;
  assertExactKeys(
    deploymentInput,
    ["deploymentId", "deployedAt", "destination"],
    `${label}.deploymentEvidence`,
  );
  const deploymentId = deploymentInput.deploymentId;
  const deployedAtValue = deploymentInput.deployedAt;
  const destination = deploymentInput.destination;
  assertMachineId(deploymentId, `${label}.deploymentEvidence.deploymentId`);
  assertUtcTimestamp(deployedAtValue, `${label}.deploymentEvidence.deployedAt`);
  const deployedAt = parseUtcTimestamp(
    deployedAtValue,
    `${label}.deploymentEvidence.deployedAt`,
  );
  assertSafeTargetUrl(destination, `${label}.deploymentEvidence.destination`);
  if (
    deployedAt <=
    parseUtcTimestamp(production.approvedAt, `${label}.production.approvedAt`)
  ) {
    throw new Error(`${label} deployment must follow production approval.`);
  }

  const liveInput = value.liveEvidence;
  assertExactKeys(
    liveInput,
    ["verifiedAt", "checksDigest"],
    `${label}.liveEvidence`,
  );
  const verifiedAtValue = liveInput.verifiedAt;
  const checksDigest = liveInput.checksDigest;
  assertUtcTimestamp(verifiedAtValue, `${label}.liveEvidence.verifiedAt`);
  const verifiedAt = parseUtcTimestamp(
    verifiedAtValue,
    `${label}.liveEvidence.verifiedAt`,
  );
  assertDigest(checksDigest, `${label}.liveEvidence.checksDigest`);
  if (verifiedAt <= deployedAt) {
    throw new Error(`${label} live verification must follow deployment.`);
  }

  const rollbackInput = value.rollbackEvidence;
  assertRecord(rollbackInput, `${label}.rollbackEvidence`);
  let rollbackEvidence: PublicationReleaseEventEnvelope["rollbackEvidence"];
  let rollbackEvidencePlanDigest: Sha256Digest;
  if (rollbackInput.state === "ready") {
    assertExactKeys(
      rollbackInput,
      ["state", "planDigest", "postRollbackVerificationRequired"],
      `${label}.rollbackEvidence`,
    );
    const planDigest = rollbackInput.planDigest;
    assertDigest(planDigest, `${label}.rollbackEvidence.planDigest`);
    if (rollbackInput.postRollbackVerificationRequired !== true) {
      throw new Error(
        `${label} rollback evidence must require post-rollback verification.`,
      );
    }
    rollbackEvidencePlanDigest = planDigest;
    rollbackEvidence = {
      state: "ready",
      planDigest,
      postRollbackVerificationRequired: true,
    };
  } else if (rollbackInput.state === "completed") {
    assertExactKeys(
      rollbackInput,
      [
        "state",
        "planDigest",
        "postRollbackVerificationRequired",
        "completedAt",
        "evidenceDigest",
        "targetArtifactDigest",
      ],
      `${label}.rollbackEvidence`,
    );
    const planDigest = rollbackInput.planDigest;
    const completedAtValue = rollbackInput.completedAt;
    const evidenceDigest = rollbackInput.evidenceDigest;
    const targetArtifactDigest = rollbackInput.targetArtifactDigest;
    assertDigest(planDigest, `${label}.rollbackEvidence.planDigest`);
    assertUtcTimestamp(
      completedAtValue,
      `${label}.rollbackEvidence.completedAt`,
    );
    const completedAt = parseUtcTimestamp(
      completedAtValue,
      `${label}.rollbackEvidence.completedAt`,
    );
    if (completedAt <= deployedAt || completedAt >= verifiedAt) {
      throw new Error(
        `${label} completed rollback requires later independent live verification.`,
      );
    }
    assertDigest(evidenceDigest, `${label}.rollbackEvidence.evidenceDigest`);
    assertDigest(
      targetArtifactDigest,
      `${label}.rollbackEvidence.targetArtifactDigest`,
    );
    if (rollbackInput.postRollbackVerificationRequired !== true) {
      throw new Error(
        `${label} rollback evidence must require post-rollback verification.`,
      );
    }
    rollbackEvidencePlanDigest = planDigest;
    rollbackEvidence = {
      state: "completed",
      planDigest,
      postRollbackVerificationRequired: true,
      completedAt: completedAtValue,
      evidenceDigest,
      targetArtifactDigest,
    };
  } else {
    throw new Error(`${label}.rollbackEvidence.state is invalid.`);
  }
  if (rollbackEvidencePlanDigest !== rollbackPlanDigest) {
    throw new Error(
      `${label} rollback evidence must bind the prepared plan digest.`,
    );
  }

  const gateEvidenceDigest = value.gateEvidenceDigest;
  const eventDigest = value.eventDigest;
  assertDigest(gateEvidenceDigest, `${label}.gateEvidenceDigest`);
  assertDigest(eventDigest, `${label}.eventDigest`);

  const provenanceInput = value.provenance;
  assertExactKeys(
    provenanceInput,
    ["issuer", "contractVersion", "recordedAt"],
    `${label}.provenance`,
  );
  if (
    provenanceInput.issuer !== "trusted-release-control" ||
    provenanceInput.contractVersion !== "release-event-v1"
  ) {
    throw new Error(`${label} provenance is not a release-event attestation.`);
  }
  const recordedAtValue = provenanceInput.recordedAt;
  assertUtcTimestamp(recordedAtValue, `${label}.provenance.recordedAt`);
  const recordedAt = parseUtcTimestamp(
    recordedAtValue,
    `${label}.provenance.recordedAt`,
  );
  if (recordedAt <= verifiedAt) {
    throw new Error(
      `${label} provenance must be recorded after live verification.`,
    );
  }

  const envelope: PublicationReleaseEventEnvelope = {
    version: 1,
    eventId,
    dataMode,
    workflowInstanceId,
    releaseId,
    artifactDigest,
    reportDigest,
    rollbackPlanDigest,
    approvalEvidence: { content, production },
    deploymentEvidence: {
      deploymentId,
      deployedAt: deployedAtValue,
      destination,
    },
    liveEvidence: {
      verifiedAt: verifiedAtValue,
      checksDigest,
    },
    rollbackEvidence,
    gateEvidenceDigest,
    eventDigest,
    provenance: {
      issuer: "trusted-release-control",
      contractVersion: "release-event-v1",
      recordedAt: recordedAtValue,
    },
  };

  const trustedActual =
    expectedMode === "actual" && isTrustedPublicationReleaseEvent(value);
  if (expectedMode === "actual") {
    if (!trustedActual) {
      throw new Error(
        `${label} actual completion requires the trusted release workflow adapter attestation.`,
      );
    }
    const { eventDigest: ignoredDigest, ...eventWithoutDigest } = envelope;
    if (digestCanonical(eventWithoutDigest) !== ignoredDigest) {
      throw new Error(
        `${label}.eventDigest does not match trusted release evidence.`,
      );
    }
  }
  return { envelope, trustedActual };
}

function normalizeSearchNotification(
  value: unknown,
  label: string,
): SearchNotificationObservationInput {
  assertExactKeys(value, ["status", "recordedAt", "detail"], label);
  if (
    !(["submitted", "failed", "not_attempted"] as const).includes(
      value.status as SearchNotificationStatus,
    )
  ) {
    throw new Error(`${label}.status is invalid.`);
  }
  assertUtcTimestamp(value.recordedAt, `${label}.recordedAt`);
  assertNonEmptyString(value.detail, `${label}.detail`);
  return {
    status: value.status as SearchNotificationStatus,
    recordedAt: value.recordedAt,
    detail: value.detail.trim(),
  };
}

function normalizeIndexationObservation(
  value: unknown,
  label: string,
): IndexationObservationInput {
  assertRecord(value, label);
  if (value.status === "unknown") {
    assertExactKeys(value, ["status"], label);
    return { status: "unknown" };
  }
  assertExactKeys(value, ["status", "observedAt", "evidence"], label);
  if (
    value.status !== "observed_indexed" &&
    value.status !== "observed_not_indexed"
  ) {
    throw new Error(`${label}.status is invalid.`);
  }
  assertUtcTimestamp(value.observedAt, `${label}.observedAt`);
  assertNonEmptyString(value.evidence, `${label}.evidence`);
  return {
    status: value.status,
    observedAt: value.observedAt,
    evidence: value.evidence.trim(),
  };
}

function normalizeEvent(
  value: unknown,
  index: number,
  dataMode: CadenceDataMode,
  observationCutoff: number,
): PublicationEventRecord {
  const label = `events[${index}]`;
  assertExactKeys(
    value,
    [
      "eventId",
      "kind",
      "status",
      "targetUrl",
      "owner",
      "nextAction",
      "artifactDigest",
      "reviewDigest",
      "gates",
      "failureReasons",
      "releaseEvent",
      "searchNotification",
      "indexationObservation",
    ],
    label,
  );
  assertMachineId(value.eventId, `${label}.eventId`);
  if (!EVENT_KINDS.has(value.kind as PublicationEventKind)) {
    throw new Error(`${label}.kind is invalid.`);
  }
  if (!EVENT_STATUSES.has(value.status as PublicationEventStatus)) {
    throw new Error(`${label}.status is invalid.`);
  }
  assertSafeTargetUrl(value.targetUrl, `${label}.targetUrl`);
  assertNonEmptyString(value.owner, `${label}.owner`);
  assertNullableString(value.nextAction, `${label}.nextAction`);
  assertDigest(value.artifactDigest, `${label}.artifactDigest`);
  assertDigest(value.reviewDigest, `${label}.reviewDigest`);
  const gates = normalizeGates(value.gates, `${label}.gates`);
  assertStringArray(value.failureReasons, `${label}.failureReasons`);
  const status = value.status as PublicationEventStatus;
  const allGatesPassed = CADENCE_GATE_IDS.every(
    (id) => gates[id].status === "passed",
  );
  if (status === "live_verified" && !allGatesPassed) {
    throw new Error(
      `${label} live_verified requires all required gates to pass.`,
    );
  }
  if (status === "live_verified" && value.nextAction !== null) {
    throw new Error(
      `${label} completed live_verified events require nextAction null.`,
    );
  }
  if (status !== "live_verified" && value.nextAction === null) {
    throw new Error(`${label} non-completed events require a nextAction.`);
  }
  if (FAILURE_STATUSES.has(status) && value.failureReasons.length === 0) {
    throw new Error(`${label} ${status} events require failureReasons.`);
  }

  let releaseEvent: PublicationReleaseEventEnvelope | null = null;
  let trustedActual = false;
  if (value.releaseEvent !== null) {
    const normalized = normalizeReleaseEnvelope(
      value.releaseEvent,
      dataMode,
      `${label}.releaseEvent`,
    );
    releaseEvent = normalized.envelope;
    trustedActual = normalized.trustedActual;
    if (releaseEvent.artifactDigest !== value.artifactDigest) {
      throw new Error(`${label} artifactDigest must match release evidence.`);
    }
    if (releaseEvent.reportDigest !== value.reviewDigest) {
      throw new Error(
        `${label} reviewDigest must match release report evidence.`,
      );
    }
    if (releaseEvent.deploymentEvidence.destination !== value.targetUrl) {
      throw new Error(
        `${label} targetUrl must match release deployment evidence.`,
      );
    }
  }
  if (status === "live_verified" && releaseEvent === null) {
    throw new Error(
      `${label} live_verified requires a release event envelope.`,
    );
  }

  const searchNotification = normalizeSearchNotification(
    value.searchNotification,
    `${label}.searchNotification`,
  );
  const indexationObservation = normalizeIndexationObservation(
    value.indexationObservation,
    `${label}.indexationObservation`,
  );
  if (releaseEvent) {
    const verifiedAt = parseUtcTimestamp(
      releaseEvent.liveEvidence.verifiedAt,
      `${label}.releaseEvent.liveEvidence.verifiedAt`,
    );
    const notificationAt = parseUtcTimestamp(
      searchNotification.recordedAt,
      `${label}.searchNotification.recordedAt`,
    );
    if (notificationAt <= verifiedAt) {
      throw new Error(
        `${label} search notification record must follow live verification.`,
      );
    }
    if (
      indexationObservation.status !== "unknown" &&
      parseUtcTimestamp(
        indexationObservation.observedAt,
        `${label}.indexationObservation.observedAt`,
      ) <= verifiedAt
    ) {
      throw new Error(
        `${label} indexation observation must follow live verification.`,
      );
    }
  }

  if (dataMode === "actual") {
    const observedInstants = [
      searchNotification.recordedAt,
      releaseEvent?.provenance.recordedAt,
      indexationObservation.status === "unknown"
        ? undefined
        : indexationObservation.observedAt,
    ].filter((instant): instant is string => Boolean(instant));
    for (const instant of observedInstants) {
      if (
        parseUtcTimestamp(instant, `${label} observation`) > observationCutoff
      ) {
        throw new Error(`${label} actual observations cannot be future-dated.`);
      }
    }
  }

  const completed =
    status === "live_verified" && allGatesPassed && Boolean(releaseEvent);
  const completionSource: CompletionSource = completed ? dataMode : "none";
  if (completed && dataMode === "actual" && !trustedActual) {
    throw new Error(
      `${label} actual completion requires trusted adapter evidence.`,
    );
  }

  return {
    eventId: value.eventId,
    kind: value.kind as PublicationEventKind,
    status,
    targetUrl: value.targetUrl,
    owner: value.owner.trim(),
    nextAction: value.nextAction === null ? null : value.nextAction.trim(),
    artifactDigest: value.artifactDigest,
    reviewDigest: value.reviewDigest,
    gates,
    failureReasons: [
      ...new Set(value.failureReasons.map((item) => item.trim())),
    ].sort(compareCodePoints),
    releaseEvent,
    searchNotification,
    indexationObservation,
    completed,
    completionSource,
    trustedReleaseEvidence: trustedActual,
  };
}

function normalizeMeasure(value: unknown, index: number): WeeklyMeasureRecord {
  const label = `measures[${index}]`;
  assertExactKeys(
    value,
    [
      "id",
      "category",
      "label",
      "definition",
      "signalType",
      "status",
      "kind",
      "rawCount",
      "numerator",
      "denominator",
      "dateRange",
      "sourceLineage",
    ],
    label,
  );
  assertMachineId(value.id, `${label}.id`);
  if (
    !WEEKLY_MEASURE_CATEGORIES.includes(value.category as WeeklyMeasureCategory)
  ) {
    throw new Error(`${label}.category is invalid.`);
  }
  assertNonEmptyString(value.label, `${label}.label`);
  assertNonEmptyString(value.definition, `${label}.definition`);
  if (
    value.signalType !== "early_operational" &&
    value.signalType !== "lagging_outcome"
  ) {
    throw new Error(`${label}.signalType is invalid.`);
  }
  const expectedSignal =
    value.category === "search" || value.category === "enquiry"
      ? "lagging_outcome"
      : "early_operational";
  if (value.signalType !== expectedSignal) {
    throw new Error(
      `${label}.signalType conflicts with canonical category semantics.`,
    );
  }
  const statuses: readonly WeeklyMeasureStatus[] = [
    "available",
    "partial",
    "missing",
    "delayed",
    "blocked_privacy_approval",
    "unavailable",
  ];
  if (!statuses.includes(value.status as WeeklyMeasureStatus)) {
    throw new Error(`${label}.status is invalid.`);
  }
  const kinds: readonly WeeklyMeasureKind[] = [
    "count",
    "rate",
    "ratio",
    "duration",
    "score",
  ];
  if (!kinds.includes(value.kind as WeeklyMeasureKind)) {
    throw new Error(`${label}.kind is invalid.`);
  }
  assertNullableNonNegativeNumber(value.rawCount, `${label}.rawCount`);
  assertNullableNonNegativeNumber(value.numerator, `${label}.numerator`);
  assertNullableNonNegativeNumber(value.denominator, `${label}.denominator`);
  const status = value.status as WeeklyMeasureStatus;
  const kind = value.kind as WeeklyMeasureKind;
  if (UNAVAILABLE_MEASURE_STATUSES.has(status)) {
    if (
      value.rawCount !== null ||
      value.numerator !== null ||
      value.denominator !== null
    ) {
      throw new Error(
        `${label} unavailable values must be null rather than fabricated zero.`,
      );
    }
  }
  if (
    status === "available" &&
    !["rate", "ratio"].includes(kind) &&
    value.rawCount === null
  ) {
    throw new Error(`${label} available measures require rawCount.`);
  }
  if (["rate", "ratio"].includes(kind) && status === "available") {
    if (
      value.numerator === null ||
      value.denominator === null ||
      value.denominator === 0
    ) {
      throw new Error(
        `${label} available ${kind} requires numerator and non-zero denominator.`,
      );
    }
  }
  const dateRange = normalizeDateRange(value.dateRange, `${label}.dateRange`);
  if (!Array.isArray(value.sourceLineage) || value.sourceLineage.length === 0) {
    throw new Error(`${label}.sourceLineage requires at least one source.`);
  }
  const sourceLineage = value.sourceLineage.map((source, sourceIndex) => {
    const sourceLabel = `${label}.sourceLineage[${sourceIndex}]`;
    assertExactKeys(
      source,
      ["system", "dataset", "version", "asOfDate"],
      sourceLabel,
    );
    assertNonEmptyString(source.system, `${sourceLabel}.system`);
    assertNonEmptyString(source.dataset, `${sourceLabel}.dataset`);
    assertNonEmptyString(source.version, `${sourceLabel}.version`);
    assertIsoDate(source.asOfDate, `${sourceLabel}.asOfDate`);
    if (source.asOfDate > dateRange.end) {
      throw new Error(
        `${sourceLabel}.asOfDate cannot exceed measure dateRange.end.`,
      );
    }
    return {
      system: source.system.trim(),
      dataset: source.dataset.trim(),
      version: source.version.trim(),
      asOfDate: source.asOfDate,
    };
  });
  let derivedValue: number | null = value.rawCount;
  if (
    (kind === "rate" || kind === "ratio") &&
    value.numerator !== null &&
    value.denominator
  ) {
    derivedValue = value.numerator / value.denominator;
  }
  if (UNAVAILABLE_MEASURE_STATUSES.has(status)) derivedValue = null;
  return {
    id: value.id,
    category: value.category as WeeklyMeasureCategory,
    label: value.label.trim(),
    definition: value.definition.trim(),
    signalType: value.signalType as WeeklyMeasureSignalType,
    status,
    kind,
    rawCount: value.rawCount,
    numerator: value.numerator,
    denominator: value.denominator,
    dateRange,
    sourceLineage,
    value: derivedValue,
  };
}

function normalizeCapacity(value: unknown): CadenceCapacityInput {
  assertExactKeys(
    value,
    ["approvedSlots", "approvedBy", "approvedOn"],
    "capacity",
  );
  assertInteger(value.approvedSlots, "capacity.approvedSlots");
  if (value.approvedSlots < 0 || value.approvedSlots > 100) {
    throw new Error("capacity.approvedSlots must be between 0 and 100.");
  }
  assertNullableString(value.approvedBy, "capacity.approvedBy");
  assertNullableString(value.approvedOn, "capacity.approvedOn");
  if (value.approvedSlots > 0) {
    if (value.approvedBy === null)
      throw new Error("capacity.approvedBy is required for approved capacity.");
    if (value.approvedOn === null)
      throw new Error("capacity.approvedOn is required for approved capacity.");
    assertIsoDate(value.approvedOn, "capacity.approvedOn");
  }
  return {
    approvedSlots: value.approvedSlots,
    approvedBy: value.approvedBy === null ? null : value.approvedBy.trim(),
    approvedOn: value.approvedOn,
  };
}

function normalizeCandidate(
  value: unknown,
  index: number,
): QueueCandidateRecord {
  const label = `queueCandidates[${index}]`;
  assertExactKeys(
    value,
    [
      "candidateId",
      "kind",
      "opportunityScore",
      "scoreStatus",
      "evidenceReady",
      "destinationApproved",
      "requiredLinksReady",
      "owner",
      "nextAction",
      "blockers",
    ],
    label,
  );
  assertMachineId(value.candidateId, `${label}.candidateId`);
  if (!EVENT_KINDS.has(value.kind as PublicationEventKind))
    throw new Error(`${label}.kind is invalid.`);
  if (
    !(["available", "partial", "missing", "unavailable"] as const).includes(
      value.scoreStatus as QueueCandidateRecord["scoreStatus"],
    )
  ) {
    throw new Error(`${label}.scoreStatus is invalid.`);
  }
  assertNullableNonNegativeNumber(
    value.opportunityScore,
    `${label}.opportunityScore`,
  );
  assertBoolean(value.evidenceReady, `${label}.evidenceReady`);
  assertBoolean(value.destinationApproved, `${label}.destinationApproved`);
  assertBoolean(value.requiredLinksReady, `${label}.requiredLinksReady`);
  assertNullableString(value.owner, `${label}.owner`);
  assertNullableString(value.nextAction, `${label}.nextAction`);
  assertStringArray(value.blockers, `${label}.blockers`);
  const deferReasons = [...value.blockers.map((item) => item.trim())];
  if (value.scoreStatus !== "available" || value.opportunityScore === null)
    deferReasons.push("opportunity score unavailable");
  if (!value.evidenceReady) deferReasons.push("evidence not ready");
  if (!value.destinationApproved) deferReasons.push("destination not approved");
  if (!value.requiredLinksReady) deferReasons.push("required links not ready");
  const uniqueReasons = [...new Set(deferReasons)].sort(compareCodePoints);
  const ready = uniqueReasons.length === 0;
  if (!ready && (value.owner === null || value.nextAction === null)) {
    throw new Error(
      `${label} deferred candidates require owner and nextAction.`,
    );
  }
  return {
    candidateId: value.candidateId,
    kind: value.kind as PublicationEventKind,
    opportunityScore: value.opportunityScore,
    scoreStatus: value.scoreStatus as QueueCandidateRecord["scoreStatus"],
    evidenceReady: value.evidenceReady,
    destinationApproved: value.destinationApproved,
    requiredLinksReady: value.requiredLinksReady,
    owner: value.owner === null ? null : value.owner.trim(),
    nextAction: value.nextAction === null ? null : value.nextAction.trim(),
    blockers: [...new Set(value.blockers.map((item) => item.trim()))].sort(
      compareCodePoints,
    ),
    ready,
    deferReasons: uniqueReasons,
  };
}

function normalizeScaleEvidence(value: unknown): ScaleEvidenceInput {
  assertExactKeys(
    value,
    [
      "consecutiveCompliantWeeks",
      "qualityGatesDemonstrated",
      "safetyGatesDemonstrated",
      "reviewThroughputSustainable",
    ],
    "scaleEvidence",
  );
  assertInteger(
    value.consecutiveCompliantWeeks,
    "scaleEvidence.consecutiveCompliantWeeks",
  );
  if (value.consecutiveCompliantWeeks < 0) {
    throw new Error(
      "scaleEvidence.consecutiveCompliantWeeks must be non-negative.",
    );
  }
  assertBoolean(
    value.qualityGatesDemonstrated,
    "scaleEvidence.qualityGatesDemonstrated",
  );
  assertBoolean(
    value.safetyGatesDemonstrated,
    "scaleEvidence.safetyGatesDemonstrated",
  );
  assertBoolean(
    value.reviewThroughputSustainable,
    "scaleEvidence.reviewThroughputSustainable",
  );
  return {
    consecutiveCompliantWeeks: value.consecutiveCompliantWeeks,
    qualityGatesDemonstrated: value.qualityGatesDemonstrated,
    safetyGatesDemonstrated: value.safetyGatesDemonstrated,
    reviewThroughputSustainable: value.reviewThroughputSustainable,
  };
}

function ensureUniqueIds<T>(
  items: readonly T[],
  select: (item: T) => string,
  label: string,
): void {
  const seen = new Set<string>();
  for (const item of items) {
    const id = select(item);
    if (seen.has(id)) throw new Error(`${label} contains duplicate ID ${id}.`);
    seen.add(id);
  }
}

function partitionEvents(
  events: readonly PublicationEventRecord[],
): WeeklyEventBuckets {
  return {
    completed: events.filter((event) => event.completed),
    failed: events.filter((event) => event.status === "failed"),
    blocked: events.filter((event) => event.status === "blocked"),
    deferred: events.filter((event) => event.status === "deferred"),
    rescheduled: events.filter((event) => event.status === "rescheduled"),
    pending: events.filter(
      (event) =>
        !event.completed &&
        !["failed", "blocked", "deferred", "rescheduled"].includes(
          event.status,
        ),
    ),
  };
}

function buildScaleAssessment(
  capacity: CadenceCapacityInput,
  evidence: ScaleEvidenceInput,
): ScaleAssessment {
  const eligible =
    evidence.consecutiveCompliantWeeks >= 8 &&
    evidence.qualityGatesDemonstrated &&
    evidence.safetyGatesDemonstrated &&
    evidence.reviewThroughputSustainable;
  const decision: ScaleDecision = eligible
    ? "eligible_for_human_review"
    : "hold";
  const reasons: string[] = [];
  if (evidence.consecutiveCompliantWeeks < 8)
    reasons.push("fewer than eight consecutive compliant weeks");
  if (!evidence.qualityGatesDemonstrated)
    reasons.push("quality gates not demonstrated");
  if (!evidence.safetyGatesDemonstrated)
    reasons.push("safety gates not demonstrated");
  if (!evidence.reviewThroughputSustainable)
    reasons.push("review throughput not demonstrated as sustainable");
  if (eligible)
    reasons.push(
      "evidence threshold met; any increase still requires human approval",
    );
  const recommendedCapacity = capacity.approvedSlots;
  const selectedCapacity =
    decision === "hold"
      ? Math.min(recommendedCapacity, HOLD_SELECTED_CAPACITY)
      : recommendedCapacity;
  return {
    decision,
    automaticIncrease: false,
    recommendedCapacity,
    selectedCapacity,
    holdCap: HOLD_SELECTED_CAPACITY,
    reasons,
  };
}

function candidateComparator(
  left: QueueCandidateRecord,
  right: QueueCandidateRecord,
): number {
  if (left.ready !== right.ready) return left.ready ? -1 : 1;
  const scoreDifference =
    (right.opportunityScore ?? -1) - (left.opportunityScore ?? -1);
  return (
    scoreDifference || compareCodePoints(left.candidateId, right.candidateId)
  );
}

function completedCountSource(actual: number): CompletedCountSource {
  return actual > 0 ? "actual" : "none";
}

export function buildWeeklyCadenceReport(
  input: WeeklyCadenceInput,
  options: BuildWeeklyCadenceOptions = {},
): WeeklyCadenceReport {
  const explicitAsOf = options.asOf;
  assertExactKeys(
    input,
    [
      "version",
      "reportId",
      "dataMode",
      "provenance",
      "generatedAt",
      "week",
      "targetEvents",
      "events",
      "measures",
      "capacity",
      "queueCandidates",
      "scaleEvidence",
    ],
    "weekly cadence input",
  );
  assertExactKeys(
    options,
    options.asOf === undefined ? [] : ["asOf"],
    "weekly cadence options",
  );
  if (input.version !== 1)
    throw new Error("weekly cadence input.version must equal 1.");
  assertMachineId(input.reportId, "reportId");
  if (!CADENCE_DATA_MODES.includes(input.dataMode as CadenceDataMode)) {
    throw new Error("dataMode must be actual, synthetic_fixture, or dry_run.");
  }
  const dataMode = input.dataMode as CadenceDataMode;
  const provenance = normalizeProvenance(input.provenance, dataMode);
  const generatedAt = parseUtcTimestamp(input.generatedAt, "generatedAt");
  const capturedAt = parseUtcTimestamp(
    provenance.capturedAt,
    "provenance.capturedAt",
  );
  const asOf = explicitAsOf ?? provenance.capturedAt;
  const asOfTimestamp = parseUtcTimestamp(asOf, "options.asOf");
  if (generatedAt > capturedAt) {
    throw new Error(
      "generatedAt must not be later than provenance.capturedAt.",
    );
  }
  if (dataMode === "actual" && asOfTimestamp > LATEST_ACTUAL_AS_OF_TIMESTAMP) {
    throw new Error("actual cadence asOf cannot be future-dated.");
  }
  const week = normalizeDateRange(input.week, "week");
  assertInteger(input.targetEvents, "targetEvents");
  if (input.targetEvents < 0)
    throw new Error("targetEvents must be non-negative.");
  if (!Array.isArray(input.events)) throw new Error("events must be an array.");
  if (!Array.isArray(input.measures))
    throw new Error("measures must be an array.");
  if (!Array.isArray(input.queueCandidates))
    throw new Error("queueCandidates must be an array.");

  const events = input.events.map((event, index) =>
    normalizeEvent(event, index, dataMode, asOfTimestamp),
  );
  const measures = input.measures.map(normalizeMeasure);
  const capacity = normalizeCapacity(input.capacity);
  const candidates = input.queueCandidates.map(normalizeCandidate);
  const scaleEvidence = normalizeScaleEvidence(input.scaleEvidence);
  ensureUniqueIds(events, (event) => event.eventId, "events");
  ensureUniqueIds(measures, (measure) => measure.id, "measures");
  ensureUniqueIds(
    candidates,
    (candidate) => candidate.candidateId,
    "queueCandidates",
  );
  const categories = measures
    .map((measure) => measure.category)
    .sort(compareCodePoints);
  const expectedCategories = [...WEEKLY_MEASURE_CATEGORIES].sort(
    compareCodePoints,
  );
  if (
    categories.length !== expectedCategories.length ||
    categories.some((category, index) => category !== expectedCategories[index])
  ) {
    throw new Error(
      "measures must contain exactly one canonical metric for each of the seven categories.",
    );
  }
  for (const measure of measures) {
    if (
      measure.dateRange.start !== week.start ||
      measure.dateRange.end !== week.end
    ) {
      throw new Error(
        `measure ${measure.id} dateRange must match the cadence week.`,
      );
    }
  }
  if (capacity.approvedOn && capacity.approvedOn > week.end) {
    throw new Error(
      "capacity.approvedOn cannot be later than the cadence week end.",
    );
  }

  if (dataMode === "actual") {
    if (
      generatedAt > asOfTimestamp ||
      capturedAt > asOfTimestamp ||
      week.end > new Date(asOfTimestamp).toISOString().slice(0, 10)
    ) {
      throw new Error("actual cadence observations cannot be future-dated.");
    }
  }

  const scaleAssessment = buildScaleAssessment(capacity, scaleEvidence);
  const sortedCandidates = [...candidates].sort(candidateComparator);
  const ready = sortedCandidates.filter((candidate) => candidate.ready);
  const selected = ready.slice(0, scaleAssessment.selectedCapacity);
  const selectedIds = new Set(
    selected.map((candidate) => candidate.candidateId),
  );
  const deferred = sortedCandidates.filter(
    (candidate) => !selectedIds.has(candidate.candidateId),
  );
  const capacityApproval: CapacityApprovalRecord = {
    ...capacity,
    approvalDigest: digestCanonical(capacity),
  };
  const eventBuckets = partitionEvents(events);
  const actualCompletedCount = eventBuckets.completed.filter(
    (event) =>
      event.completionSource === "actual" && event.trustedReleaseEvidence,
  ).length;
  const syntheticFixtureCompletedCount = eventBuckets.completed.filter(
    (event) => event.completionSource === "synthetic_fixture",
  ).length;
  const dryRunCompletedCount = eventBuckets.completed.filter(
    (event) => event.completionSource === "dry_run",
  ).length;
  // Only opaque release-adapter evidence may satisfy the production completion
  // target. Fixture and dry-run completions remain visible but never contribute
  // to completedCount or targetMet.
  const completedCount = actualCompletedCount;
  const summary: WeeklyCadenceSummary = {
    targetEvents: input.targetEvents,
    completedCount,
    actualCompletedCount,
    syntheticFixtureCompletedCount,
    dryRunCompletedCount,
    completedCountSource: completedCountSource(actualCompletedCount),
    targetMet: actualCompletedCount >= input.targetEvents,
  };
  const signals: WeeklySignalGroups = {
    earlyOperational: measures.filter(
      (measure) => measure.signalType === "early_operational",
    ),
    laggingOutcomes: measures.filter(
      (measure) => measure.signalType === "lagging_outcome",
    ),
  };
  const nextWeekQueue: NextWeekQueue = {
    approvedCapacity: capacity.approvedSlots,
    recommendedCapacity: scaleAssessment.recommendedCapacity,
    selectedCapacity: selected.length,
    capacityApproval,
    selected,
    deferred,
    audit: {
      holdCap: HOLD_SELECTED_CAPACITY,
      appliedDecision: scaleAssessment.decision,
      selectedCandidateIds: selected.map((candidate) => candidate.candidateId),
      deferredCandidateIds: deferred.map((candidate) => candidate.candidateId),
    },
  };
  const audit: CadenceAuditRecord = {
    asOf,
    inputDigest: digestCanonical(input),
    eventDigests: events.map(
      (event) => event.releaseEvent?.eventDigest ?? digestCanonical(event),
    ),
    gateEvidenceDigests: events.map(
      (event) =>
        event.releaseEvent?.gateEvidenceDigest ?? digestCanonical(event.gates),
    ),
    capacityApprovalDigest: capacityApproval.approvalDigest,
    dataMode,
    provenanceSource: provenance.source,
    provenanceCapturedAt: provenance.capturedAt,
    fixtureId: provenance.fixtureId ?? null,
  };
  const reportWithoutDigest = {
    version: 1 as const,
    reportId: input.reportId,
    dataMode,
    provenance,
    generatedAt: input.generatedAt,
    week,
    summary,
    events: eventBuckets,
    measures,
    signals,
    nextWeekQueue,
    scaleEvidence,
    scaleAssessment,
    audit,
  };
  return deepFreeze({
    ...reportWithoutDigest,
    reportDigest: digestCanonical(reportWithoutDigest),
  });
}

function escapeMarkdownHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("|", "\\|")
    .replace(/\r?\n/g, "<br>");
}

function markdownCell(value: string | number | boolean | null): string {
  if (value === null) return "—";
  return escapeMarkdownHtml(String(value));
}

function gateStatusSummary(event: PublicationEventRecord): string {
  return CADENCE_GATE_IDS.map((id) => `${id}=${event.gates[id].status}`).join(
    ", ",
  );
}

function sourceLineageSummary(measure: WeeklyMeasureRecord): string {
  return measure.sourceLineage
    .map(
      (source) =>
        `${source.system}/${source.dataset}@${source.version} (${source.asOfDate})`,
    )
    .join("; ");
}

function measureValueSummary(measure: WeeklyMeasureRecord): string {
  return measure.value === null ? "null" : String(measure.value);
}

function modeTitle(mode: CadenceDataMode): string {
  if (mode === "actual") return "Actual observation operating report";
  if (mode === "synthetic_fixture") return "Synthetic-fixture operating report";
  return "Dry-run operating report";
}

export function renderWeeklyCadenceMarkdown(
  report: WeeklyCadenceReport,
): string {
  const lines: string[] = [
    "# Weekly SEO cadence report",
    "",
    `> ${modeTitle(report.dataMode)}. Observation-only; this renderer performs no publication, notification, or production writes.`,
    "",
    "## Summary and audit",
    "",
    `- Week: ${markdownCell(report.week.start)} to ${markdownCell(report.week.end)}`,
    `- Verified actual completed: ${report.summary.completedCount}/${report.summary.targetEvents}`,
    `- Completion source: ${markdownCell(report.summary.completedCountSource)}`,
    `- Actual completed: ${report.summary.actualCompletedCount}`,
    `- Synthetic fixture completed: ${report.summary.syntheticFixtureCompletedCount}`,
    `- Dry-run completed: ${report.summary.dryRunCompletedCount}`,
    `- Report digest: ${markdownCell(report.reportDigest)}`,
    `- Input audit digest: ${markdownCell(report.audit.inputDigest)}`,
    `- Provenance: ${markdownCell(report.audit.provenanceSource)} at ${markdownCell(report.audit.provenanceCapturedAt)}`,
    `- Fixture ID: ${markdownCell(report.audit.fixtureId)}`,
    "",
    "## Publication event gate checklist",
    "",
    "| Event | Status | Owner | Next action | Gates | Search notification | Indexation observation |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];
  const allEvents = [
    ...report.events.completed,
    ...report.events.failed,
    ...report.events.blocked,
    ...report.events.deferred,
    ...report.events.rescheduled,
    ...report.events.pending,
  ];
  for (const event of allEvents) {
    lines.push(
      `| ${markdownCell(event.eventId)} | ${markdownCell(event.status)} | ${markdownCell(event.owner)} | ${markdownCell(event.nextAction)} | ${markdownCell(gateStatusSummary(event))} | ${markdownCell(`${event.searchNotification.status} @ ${event.searchNotification.recordedAt}`)} | ${markdownCell(event.indexationObservation.status)} |`,
    );
  }
  lines.push(
    "",
    "Submitted search notifications are not indexation proof; notification and indexation are recorded independently.",
    "",
    "## Release approval, digest, and gate evidence",
    "",
    "| Event | Workflow | Release | Content approval | Production approval | Artifact digest | Report digest | Gate evidence digest | Event audit digest | Rollback evidence |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  );
  for (const event of allEvents) {
    const evidence = event.releaseEvent;
    lines.push(
      `| ${markdownCell(event.eventId)} | ${markdownCell(evidence?.workflowInstanceId ?? null)} | ${markdownCell(evidence?.releaseId ?? null)} | ${markdownCell(evidence ? `${evidence.approvalEvidence.content.principal} @ ${evidence.approvalEvidence.content.approvedAt}` : null)} | ${markdownCell(evidence ? `${evidence.approvalEvidence.production.principal} @ ${evidence.approvalEvidence.production.approvedAt}` : null)} | ${markdownCell(evidence?.artifactDigest ?? event.artifactDigest)} | ${markdownCell(evidence?.reportDigest ?? event.reviewDigest)} | ${markdownCell(evidence?.gateEvidenceDigest ?? null)} | ${markdownCell(evidence?.eventDigest ?? null)} | ${markdownCell(evidence ? `${evidence.rollbackEvidence.state}:${evidence.rollbackEvidence.planDigest}` : null)} |`,
    );
  }
  lines.push(
    "",
    "## Seven measurement categories",
    "",
    "| Category | Label | Signal | Status | Value | Date range | Source lineage |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  );
  for (const measure of report.measures) {
    lines.push(
      `| ${markdownCell(measure.category)} | ${markdownCell(measure.label)} | ${markdownCell(measure.signalType)} | ${markdownCell(measure.status)} | ${markdownCell(measureValueSummary(measure))} | ${markdownCell(`${measure.dateRange.start} to ${measure.dateRange.end}`)} | ${markdownCell(sourceLineageSummary(measure))} |`,
    );
  }
  lines.push(
    "",
    "## Next-week queue and capacity approval",
    "",
    `- Approved capacity: ${report.nextWeekQueue.approvedCapacity}`,
    `- Recommended capacity: ${report.nextWeekQueue.recommendedCapacity}`,
    `- Selected capacity: ${report.nextWeekQueue.selectedCapacity}`,
    `- Capacity approval: ${markdownCell(report.nextWeekQueue.capacityApproval.approvedBy)} on ${markdownCell(report.nextWeekQueue.capacityApproval.approvedOn)}`,
    `- Capacity approval digest: ${markdownCell(report.nextWeekQueue.capacityApproval.approvalDigest)}`,
    `- Capacity audit decision: ${markdownCell(report.nextWeekQueue.audit.appliedDecision)}; hold cap=${report.nextWeekQueue.audit.holdCap}`,
    "",
    "| Candidate | Kind | Score | Owner | Next action | Queue state | Audit reasons |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  );
  for (const candidate of report.nextWeekQueue.selected) {
    lines.push(
      `| ${markdownCell(candidate.candidateId)} | ${markdownCell(candidate.kind)} | ${markdownCell(candidate.opportunityScore)} | ${markdownCell(candidate.owner)} | ${markdownCell(candidate.nextAction)} | selected | ready |`,
    );
  }
  for (const candidate of report.nextWeekQueue.deferred) {
    lines.push(
      `| ${markdownCell(candidate.candidateId)} | ${markdownCell(candidate.kind)} | ${markdownCell(candidate.opportunityScore)} | ${markdownCell(candidate.owner)} | ${markdownCell(candidate.nextAction)} | deferred | ${markdownCell(candidate.deferReasons.join("; "))} |`,
    );
  }
  lines.push(
    "",
    "## Scale assessment",
    "",
    `- Decision: ${markdownCell(report.scaleAssessment.decision)}`,
    `- Recommended capacity: ${report.scaleAssessment.recommendedCapacity}`,
    `- Selected capacity: ${report.scaleAssessment.selectedCapacity}`,
    `- Reasons: ${markdownCell(report.scaleAssessment.reasons.join("; "))}`,
    "- No automatic publishing-volume increase is authorised by this report.",
    "",
  );
  return lines.join("\n");
}
