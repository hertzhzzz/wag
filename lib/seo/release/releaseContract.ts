import { createHash } from "node:crypto";

export const RELEASE_PREFLIGHT_CHECKS = Object.freeze([
  "schema",
  "evidence",
  "graph",
  "generated_artifacts",
  "metadata",
  "sitemap",
  "lint",
  "tests",
  "build",
  "privacy",
  "regression",
] as const);

export const LIVE_VERIFICATION_CHECKS = Object.freeze([
  "http_status",
  "canonical",
  "robots",
  "structured_data",
  "key_links",
  "expected_content",
] as const);

export const RELEASE_WORKFLOW_STATES = Object.freeze([
  "draft",
  "validated",
  "preview_ready",
  "content_approved",
  "production_approved",
  "deployed",
  "live_verified",
] as const);

export const RELEASE_DATA_MODES = Object.freeze([
  "actual",
  "synthetic_fixture",
  "dry_run",
] as const);

export type ReleasePreflightCheck = (typeof RELEASE_PREFLIGHT_CHECKS)[number];
export type LiveVerificationCheck = (typeof LIVE_VERIFICATION_CHECKS)[number];
export type ReleaseWorkflowState = (typeof RELEASE_WORKFLOW_STATES)[number];
export type ReleaseDataMode = (typeof RELEASE_DATA_MODES)[number];
export type Sha256Digest = `sha256:${string}`;

export type ReleaseCheckStatus = "passed" | "failed" | "blocked" | "not_run";
export type LiveCheckStatus = "passed" | "failed" | "not_run";

export interface ReleaseCheckResult {
  status: ReleaseCheckStatus;
  detail: string;
}

export interface LiveCheckResult {
  status: LiveCheckStatus;
  detail: string;
}

export type ReleasePreflightResults = Record<
  ReleasePreflightCheck,
  ReleaseCheckResult
>;

export type LiveVerificationResults = Record<
  LiveVerificationCheck,
  LiveCheckResult
>;

export interface ReleaseReviewInput {
  affectedUrls: string[];
  contentChanges: string[];
  graphChanges: string[];
  attributionChanges: string[];
  risks: string[];
  previewDestination: string;
  preflightChecks: ReleasePreflightResults;
}

export type ReleaseReviewReport = ReleaseReviewInput;

export interface ReleaseProvenance {
  issuer: "trusted-release-control";
  contractVersion: "release-provenance-v1";
  source: string;
  recordedAt: string;
}

export interface CurrentReleaseIdentity {
  releaseId: string;
  artifactDigest: Sha256Digest;
  reportDigest: Sha256Digest;
  workflowInstanceId: string;
  preparedAt: string;
  approvalNonce: string;
  rollbackPlanDigest: Sha256Digest;
}

export type ApprovalActorType =
  | "human"
  | "automation"
  | "service"
  | "scheduled_task";

export interface ApprovalActor {
  id: string;
  type: ApprovalActorType;
}

export interface ApprovalAttestation {
  issuer: "trusted-release-control";
  contractVersion: "release-attestation-v1";
  principal: string;
  bindingDigest: Sha256Digest;
}

export interface ReleaseApprovalInput extends CurrentReleaseIdentity {
  actor: ApprovalActor;
  approvedAt: string;
  attestation: ApprovalAttestation;
  kind: "content" | "production";
}

export type ReleaseApproval = ReleaseApprovalInput;

export interface RollbackPlan {
  planId: string;
  state: "ready";
  readiness: "ready";
  targetArtifactDigest: Sha256Digest;
  targetDestination: string;
  planDigest: Sha256Digest;
  verificationRequired: true;
}

export interface RollbackInput {
  planId: string;
  targetArtifactDigest: Sha256Digest;
  completedAt: string;
  evidenceDigest: Sha256Digest;
}

export interface RollbackRecord extends RollbackInput {
  state: "completed";
  planDigest: Sha256Digest;
  verificationRequired: true;
}

export interface DeploymentRecord {
  deploymentId: string;
  destination: string;
  deployedAt: string;
  releaseId: string;
  artifactDigest: Sha256Digest;
  workflowInstanceId: string;
  rollbackPlanDigest: Sha256Digest;
  evidenceDigest: Sha256Digest;
}

export type DeploymentInput = Pick<
  DeploymentRecord,
  "deploymentId" | "destination" | "deployedAt"
>;

export interface LiveVerificationRecord {
  verifiedAt: string;
  checks: LiveVerificationResults;
  releaseId: string;
  artifactDigest: Sha256Digest;
  workflowInstanceId: string;
  deploymentId: string;
  verificationGeneration: number;
  evidenceDigest: Sha256Digest;
}

export type LiveVerificationInput = Pick<
  LiveVerificationRecord,
  "verifiedAt" | "checks"
> & {
  targetArtifactDigest?: Sha256Digest;
};

export type SearchNotificationStatus = "submitted" | "failed" | "not_attempted";

export interface SearchNotificationInput {
  engine: string;
  kind: "sitemap" | "url";
  target: string;
  status: SearchNotificationStatus;
  recordedAt: string;
  detail: string;
}

export type SearchNotificationRecord = SearchNotificationInput;

export type IndexationStatus =
  | "unknown"
  | "observed_indexed"
  | "observed_not_indexed";

export type IndexationRecord =
  | { status: "unknown" }
  | {
      status: Exclude<IndexationStatus, "unknown">;
      observedAt: string;
      evidence: string;
    };

export interface SearchReport {
  id: string;
  notification: SearchNotificationRecord;
  indexation: IndexationRecord;
}

export interface IndexationObservationInput {
  reportId: string;
  status: Exclude<IndexationStatus, "unknown">;
  observedAt: string;
  evidence: string;
}

export interface ReleaseWorkflow extends CurrentReleaseIdentity {
  version: 1;
  state: ReleaseWorkflowState;
  dataMode: ReleaseDataMode;
  provenance: ReleaseProvenance;
  report: ReleaseReviewReport;
  rollbackPlan: RollbackPlan;
  rollbackGeneration: number;
  contentApproval?: ReleaseApproval;
  productionApproval?: ReleaseApproval;
  deployment?: DeploymentRecord;
  liveVerification?: LiveVerificationRecord;
  rollback?: RollbackRecord;
  searchReports: SearchReport[];
}

export interface PrepareReleaseInput {
  releaseId: string;
  artifactDigest: Sha256Digest;
  workflowInstanceId: string;
  preparedAt: string;
  approvalNonce: string;
  dataMode: ReleaseDataMode;
  provenance: ReleaseProvenance;
  rollbackPlan: RollbackPlan;
  review: ReleaseReviewInput;
}

export interface ReleaseAssessment {
  blockers: string[];
  approvalsValid: boolean;
  canApproveContent: boolean;
  canApproveProduction: boolean;
  canDeploy: boolean;
  liveVerified: boolean;
}

const DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/;
const MACHINE_ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const NONCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{7,127}$/;
const UTC_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const LATEST_ACTUAL_OBSERVATION_TIMESTAMP = Date.parse(
  "2026-07-18T23:59:59.999Z",
);

const TRUSTED_ATTESTATION = Symbol("trusted-release-approval-attestation");
const TRUSTED_WORKFLOW = Symbol("trusted-release-workflow");

type BrandedApprovalAttestation = ApprovalAttestation & {
  readonly [TRUSTED_ATTESTATION]: true;
};
type BrandedWorkflow = ReleaseWorkflow & { readonly [TRUSTED_WORKFLOW]: true };

// A private WeakSet is the trust root. The non-enumerable symbol is only a
// diagnostic brand; inherited/copied properties must never establish trust.
const TRUSTED_ATTESTATIONS = new WeakSet<object>();
const TRUSTED_WORKFLOWS = new WeakSet<object>();

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

function assertMachineId(
  value: unknown,
  label: string,
): asserts value is string {
  assertNonEmptyString(value, label);
  if (!MACHINE_ID_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase machine-readable ID.`);
  }
}

function assertNonce(value: unknown, label: string): asserts value is string {
  assertNonEmptyString(value, label);
  if (!NONCE_PATTERN.test(value)) {
    throw new Error(`${label} must be an opaque release nonce.`);
  }
}

function assertDigest(
  value: unknown,
  label: string,
): asserts value is Sha256Digest {
  if (typeof value !== "string" || !DIGEST_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase sha256: digest.`);
  }
}

function parseTimestamp(value: unknown, label: string): number {
  assertNonEmptyString(value, label);
  if (!UTC_TIMESTAMP_PATTERN.test(value)) {
    throw new Error(`${label} must be an RFC3339 UTC timestamp ending in Z.`);
  }
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) {
    throw new Error(`${label} must be a valid RFC3339 UTC timestamp.`);
  }
  const canonical = new Date(milliseconds).toISOString();
  const expected = value.includes(".") ? value : `${value.slice(0, -1)}.000Z`;
  if (canonical !== expected) {
    throw new Error(`${label} must be a valid calendar timestamp.`);
  }
  return milliseconds;
}

function assertUtcTimestamp(
  value: unknown,
  label: string,
): asserts value is string {
  parseTimestamp(value, label);
}

function assertActualObservationNotFuture(
  dataMode: ReleaseDataMode,
  timestamp: number,
  label: string,
): void {
  if (
    dataMode === "actual" &&
    timestamp > LATEST_ACTUAL_OBSERVATION_TIMESTAMP
  ) {
    throw new Error(`${label} cannot use a future observation timestamp.`);
  }
}

function assertHttpsUrl(
  value: unknown,
  label: string,
): asserts value is string {
  assertNonEmptyString(value, label);
  try {
    const parsed = new URL(value);
    if (
      parsed.protocol !== "https:" ||
      parsed.username !== "" ||
      parsed.password !== "" ||
      parsed.search !== "" ||
      parsed.hash !== "" ||
      parsed.hostname === ""
    ) {
      throw new Error("unsafe URL");
    }
  } catch {
    throw new Error(
      `${label} must be an HTTPS URL without credentials, query, or fragment.`,
    );
  }
}

function assertStringList(
  value: unknown,
  label: string,
  options: { allowEmpty?: boolean; urls?: boolean } = {},
): string[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  if (!options.allowEmpty && value.length === 0) {
    throw new Error(`${label} must contain at least one entry.`);
  }
  const normalized = value.map((entry, index) => {
    assertNonEmptyString(entry, `${label}[${index}]`);
    const trimmed = entry.trim();
    if (options.urls) assertHttpsUrl(trimmed, `${label}[${index}]`);
    return trimmed;
  });
  return [...new Set(normalized)].sort(compareCodePoints);
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
      throw new Error(
        "Canonical release JSON cannot contain non-finite numbers.",
      );
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort(compareCodePoints)
        .map((key) => {
          if (value[key] === undefined) {
            throw new Error(
              "Canonical release JSON cannot contain undefined values.",
            );
          }
          return [key, canonicalize(value[key])];
        }),
    );
  }
  throw new Error(
    `Canonical release JSON cannot contain ${typeof value} values.`,
  );
}

export function canonicalReleaseJson(value: unknown): string {
  const serialized = JSON.stringify(canonicalize(value));
  if (serialized === undefined) {
    throw new Error("Canonical release JSON could not be serialized.");
  }
  return serialized;
}

function digestCanonical(value: unknown): Sha256Digest {
  return `sha256:${createHash("sha256")
    .update(canonicalReleaseJson(value), "utf8")
    .digest("hex")}`;
}

export function digestRollbackPlan(
  plan: Omit<RollbackPlan, "planDigest">,
): Sha256Digest {
  return digestCanonical({
    planId: plan.planId,
    state: plan.state,
    readiness: plan.readiness,
    targetArtifactDigest: plan.targetArtifactDigest,
    targetDestination: plan.targetDestination,
    verificationRequired: plan.verificationRequired,
  });
}

export function digestRollbackEvidence(
  evidence: Omit<RollbackInput, "evidenceDigest">,
): Sha256Digest {
  return digestCanonical({
    planId: evidence.planId,
    targetArtifactDigest: evidence.targetArtifactDigest,
    completedAt: evidence.completedAt,
  });
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }
  return value;
}

function withBrand<T extends object, K extends symbol>(
  value: T,
  symbol: K,
): T & { readonly [P in K]: true } {
  Object.defineProperty(value, symbol, {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  if (symbol === TRUSTED_ATTESTATION) TRUSTED_ATTESTATIONS.add(value);
  if (symbol === TRUSTED_WORKFLOW) TRUSTED_WORKFLOWS.add(value);
  return value as T & { readonly [P in K]: true };
}

function normalizeCheckResult(
  input: unknown,
  check: ReleasePreflightCheck,
): ReleaseCheckResult {
  if (input === undefined) {
    return { status: "not_run", detail: `${check} result was not provided` };
  }
  assertExactKeys(input, ["status", "detail"], `${check} result`);
  const statuses: ReleaseCheckStatus[] = [
    "passed",
    "failed",
    "blocked",
    "not_run",
  ];
  if (!statuses.includes(input.status as ReleaseCheckStatus)) {
    throw new Error(`${check} has an invalid preflight status.`);
  }
  assertNonEmptyString(input.detail, `${check}.detail`);
  return {
    status: input.status as ReleaseCheckStatus,
    detail: input.detail.trim(),
  };
}

function normalizePreflightResults(input: unknown): ReleasePreflightResults {
  assertRecord(input, "preflightChecks");
  assertExactKeys(input, RELEASE_PREFLIGHT_CHECKS, "preflightChecks");
  return Object.fromEntries(
    RELEASE_PREFLIGHT_CHECKS.map((check) => [
      check,
      normalizeCheckResult(input[check], check),
    ]),
  ) as ReleasePreflightResults;
}

function normalizeReview(input: unknown): ReleaseReviewReport {
  assertExactKeys(
    input,
    [
      "affectedUrls",
      "contentChanges",
      "graphChanges",
      "attributionChanges",
      "risks",
      "previewDestination",
      "preflightChecks",
    ],
    "review",
  );
  assertHttpsUrl(input.previewDestination, "previewDestination");
  return {
    affectedUrls: assertStringList(input.affectedUrls, "affectedUrls", {
      urls: true,
    }),
    contentChanges: assertStringList(input.contentChanges, "contentChanges"),
    graphChanges: assertStringList(input.graphChanges, "graphChanges"),
    attributionChanges: assertStringList(
      input.attributionChanges,
      "attributionChanges",
    ),
    risks: assertStringList(input.risks, "risks", { allowEmpty: true }),
    previewDestination: input.previewDestination.trim(),
    preflightChecks: normalizePreflightResults(input.preflightChecks),
  };
}

export function digestReleaseReview(review: ReleaseReviewInput): Sha256Digest {
  return digestCanonical(normalizeReview(review));
}

function normalizeProvenance(
  input: unknown,
  dataMode: ReleaseDataMode,
): ReleaseProvenance {
  assertExactKeys(
    input,
    ["issuer", "contractVersion", "source", "recordedAt"],
    "provenance",
  );
  if (input.issuer !== "trusted-release-control") {
    throw new Error("provenance issuer is not trusted.");
  }
  if (input.contractVersion !== "release-provenance-v1") {
    throw new Error("provenance contractVersion is unsupported.");
  }
  assertMachineId(input.source, "provenance.source");
  assertUtcTimestamp(input.recordedAt, "provenance.recordedAt");
  const recordedAt = parseTimestamp(input.recordedAt, "provenance.recordedAt");
  assertActualObservationNotFuture(dataMode, recordedAt, "actual provenance");
  return {
    issuer: "trusted-release-control",
    contractVersion: "release-provenance-v1",
    source: input.source,
    recordedAt: input.recordedAt,
  };
}

function normalizeRollbackPlan(input: unknown): RollbackPlan {
  assertExactKeys(
    input,
    [
      "planId",
      "state",
      "readiness",
      "targetArtifactDigest",
      "targetDestination",
      "planDigest",
      "verificationRequired",
    ],
    "rollbackPlan",
  );
  assertMachineId(input.planId, "rollbackPlan.planId");
  if (input.state !== "ready" || input.readiness !== "ready") {
    throw new Error("rollbackPlan must be ready before production approval.");
  }
  assertDigest(input.targetArtifactDigest, "rollbackPlan.targetArtifactDigest");
  assertHttpsUrl(input.targetDestination, "rollbackPlan.targetDestination");
  assertDigest(input.planDigest, "rollbackPlan.planDigest");
  if (input.verificationRequired !== true) {
    throw new Error("rollbackPlan.verificationRequired must be true.");
  }
  const expectedDigest = digestRollbackPlan({
    planId: input.planId,
    state: input.state,
    readiness: input.readiness,
    targetArtifactDigest: input.targetArtifactDigest,
    targetDestination: input.targetDestination,
    verificationRequired: input.verificationRequired,
  });
  if (expectedDigest !== input.planDigest) {
    throw new Error(
      "rollbackPlan.planDigest does not match its canonical plan.",
    );
  }
  return {
    planId: input.planId,
    state: "ready",
    readiness: "ready",
    targetArtifactDigest: input.targetArtifactDigest,
    targetDestination: input.targetDestination,
    planDigest: input.planDigest,
    verificationRequired: true,
  };
}

function assertActor(
  value: unknown,
  label: string,
): asserts value is ApprovalActor {
  assertExactKeys(value, ["id", "type"], label);
  assertMachineId(value.id, `${label}.id`);
  if (
    value.type !== "human" &&
    value.type !== "automation" &&
    value.type !== "service" &&
    value.type !== "scheduled_task"
  ) {
    throw new Error(`${label}.type is invalid.`);
  }
}

function identityBlockers(
  workflow: ReleaseWorkflow,
  current: CurrentReleaseIdentity,
): string[] {
  const blockers: string[] = [];
  const fields: (keyof CurrentReleaseIdentity)[] = [
    "releaseId",
    "artifactDigest",
    "reportDigest",
    "workflowInstanceId",
    "preparedAt",
    "approvalNonce",
    "rollbackPlanDigest",
  ];
  for (const field of fields) {
    if (current[field] !== workflow[field]) {
      blockers.push(`identity_mismatch:${field}`);
    }
  }
  return blockers;
}

function assertCurrentIdentity(
  workflow: ReleaseWorkflow,
  current: CurrentReleaseIdentity,
): void {
  assertExactKeys(
    current,
    [
      "releaseId",
      "artifactDigest",
      "reportDigest",
      "workflowInstanceId",
      "preparedAt",
      "approvalNonce",
      "rollbackPlanDigest",
    ],
    "currentReleaseIdentity",
  );
  assertMachineId(current.releaseId, "currentReleaseIdentity.releaseId");
  assertDigest(current.artifactDigest, "currentReleaseIdentity.artifactDigest");
  assertDigest(current.reportDigest, "currentReleaseIdentity.reportDigest");
  assertMachineId(
    current.workflowInstanceId,
    "currentReleaseIdentity.workflowInstanceId",
  );
  parseTimestamp(current.preparedAt, "currentReleaseIdentity.preparedAt");
  assertNonce(current.approvalNonce, "currentReleaseIdentity.approvalNonce");
  assertDigest(
    current.rollbackPlanDigest,
    "currentReleaseIdentity.rollbackPlanDigest",
  );
  const blockers = identityBlockers(workflow, current);
  if (blockers.length > 0) throw new Error(blockers.join(", "));
}

function preflightBlockers(report: ReleaseReviewReport): string[] {
  return RELEASE_PREFLIGHT_CHECKS.flatMap((check) => {
    const status = report.preflightChecks[check].status;
    return status === "passed" ? [] : [`preflight_${status}:${check}`];
  });
}

function approvalBinding(
  workflow: ReleaseWorkflow,
  kind: ReleaseApproval["kind"],
  actor: ApprovalActor,
  approvedAt: string,
): unknown {
  return {
    contractVersion: "release-approval-binding-v1",
    kind,
    actor: { id: actor.id, type: actor.type },
    approvedAt,
    releaseId: workflow.releaseId,
    artifactDigest: workflow.artifactDigest,
    reportDigest: workflow.reportDigest,
    workflowInstanceId: workflow.workflowInstanceId,
    preparedAt: workflow.preparedAt,
    approvalNonce: workflow.approvalNonce,
    rollbackPlanDigest: workflow.rollbackPlanDigest,
  };
}

export function createApprovalAttestation(
  workflow: ReleaseWorkflow,
  kind: ReleaseApproval["kind"],
  actor: ApprovalActor,
  approvedAt: string,
): ApprovalAttestation {
  if (!isTrustedReleaseWorkflow(workflow)) {
    throw new Error(
      "approval attestation requires a trusted prepared workflow.",
    );
  }
  assertActor(actor, "approval actor");
  if (actor.type !== "human")
    throw new Error("approval requires a human actor.");
  const approvedAtTimestamp = parseTimestamp(approvedAt, "approvedAt");
  assertActualObservationNotFuture(
    workflow.dataMode,
    approvedAtTimestamp,
    "actual approval",
  );
  if (kind !== "content" && kind !== "production") {
    throw new Error("approval kind is invalid.");
  }
  const attestation = {
    issuer: "trusted-release-control" as const,
    contractVersion: "release-attestation-v1" as const,
    principal: actor.id,
    bindingDigest: digestCanonical(
      approvalBinding(workflow, kind, actor, approvedAt),
    ),
  };
  return deepFreeze(withBrand(attestation, TRUSTED_ATTESTATION));
}

function assertTrustedAttestation(
  input: unknown,
  workflow: ReleaseWorkflow,
  kind: ReleaseApproval["kind"],
  actor: ApprovalActor,
  approvedAt: string,
): asserts input is BrandedApprovalAttestation {
  assertExactKeys(
    input,
    ["issuer", "contractVersion", "principal", "bindingDigest"],
    "approval.attestation",
  );
  if (
    !TRUSTED_ATTESTATIONS.has(input) ||
    !Object.prototype.hasOwnProperty.call(input, TRUSTED_ATTESTATION) ||
    (input as unknown as BrandedApprovalAttestation)[TRUSTED_ATTESTATION] !==
      true
  ) {
    throw new Error(
      "approval attestation must come from trusted release control.",
    );
  }
  if (
    input.issuer !== "trusted-release-control" ||
    input.contractVersion !== "release-attestation-v1" ||
    input.principal !== actor.id
  ) {
    throw new Error("approval attestation provenance does not match actor.");
  }
  assertDigest(input.bindingDigest, "approval.attestation.bindingDigest");
  const expected = digestCanonical(
    approvalBinding(workflow, kind, actor, approvedAt),
  );
  if (input.bindingDigest !== expected) {
    throw new Error("approval attestation is not bound to this preparation.");
  }
}

function approvalMatchesWorkflow(
  approval: ReleaseApproval | undefined,
  workflow: ReleaseWorkflow,
  kind: ReleaseApproval["kind"],
): boolean {
  if (!approval || approval.kind !== kind || approval.actor.type !== "human") {
    return false;
  }
  if (identityBlockers(workflow, approval).length > 0) return false;
  try {
    assertTrustedAttestation(
      approval.attestation,
      workflow,
      kind,
      approval.actor,
      approval.approvedAt,
    );
    return true;
  } catch {
    return false;
  }
}

function liveVerificationBlockers(workflow: ReleaseWorkflow): string[] {
  if (!workflow.liveVerification) return [];
  return LIVE_VERIFICATION_CHECKS.flatMap((check) => {
    const status = workflow.liveVerification?.checks[check].status;
    return status === "passed" ? [] : [`live_check_${status}:${check}`];
  });
}

export function assessRelease(
  workflow: ReleaseWorkflow,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseAssessment {
  const blockers = [
    ...identityBlockers(workflow, currentIdentity),
    ...preflightBlockers(workflow.report),
    ...liveVerificationBlockers(workflow),
  ];
  const contentApprovalValid = approvalMatchesWorkflow(
    workflow.contentApproval,
    workflow,
    "content",
  );
  const productionApprovalValid = approvalMatchesWorkflow(
    workflow.productionApproval,
    workflow,
    "production",
  );
  const independentApprovers = Boolean(
    workflow.contentApproval &&
    workflow.productionApproval &&
    workflow.contentApproval.actor.id !== workflow.productionApproval.actor.id,
  );
  if (workflow.contentApproval && !contentApprovalValid) {
    blockers.push("content_approval_invalid");
  }
  if (workflow.productionApproval && !productionApprovalValid) {
    blockers.push("production_approval_invalid");
  }
  if (
    workflow.contentApproval &&
    workflow.productionApproval &&
    !independentApprovers
  ) {
    blockers.push("approvals_not_independent");
  }
  if (!workflow.rollbackPlan || workflow.rollbackPlan.readiness !== "ready") {
    blockers.push("rollback_plan_not_ready");
  }
  if (workflow.dataMode !== "actual")
    blockers.push(`data_mode:${workflow.dataMode}`);
  const canApproveContent =
    blockers.length === 0 &&
    (workflow.state === "preview_ready" || workflow.state === "validated");
  const canApproveProduction =
    canApproveContent ||
    (workflow.state === "content_approved" &&
      contentApprovalValid &&
      preflightBlockers(workflow.report).length === 0 &&
      workflow.rollbackPlan.readiness === "ready" &&
      workflow.dataMode === "actual");
  const canDeploy =
    workflow.state === "production_approved" &&
    contentApprovalValid &&
    productionApprovalValid &&
    independentApprovers &&
    workflow.dataMode === "actual" &&
    workflow.rollbackPlan.readiness === "ready" &&
    identityBlockers(workflow, currentIdentity).length === 0;
  const expectedLiveArtifactDigest = workflow.rollback
    ? workflow.rollback.targetArtifactDigest
    : workflow.artifactDigest;
  const liveVerified =
    workflow.state === "live_verified" &&
    Boolean(workflow.liveVerification) &&
    workflow.liveVerification?.verificationGeneration ===
      workflow.rollbackGeneration &&
    workflow.liveVerification?.artifactDigest === expectedLiveArtifactDigest &&
    LIVE_VERIFICATION_CHECKS.every(
      (check) => workflow.liveVerification?.checks[check].status === "passed",
    );
  return {
    blockers: [...new Set(blockers)].sort(compareCodePoints),
    approvalsValid:
      contentApprovalValid && productionApprovalValid && independentApprovers,
    canApproveContent,
    canApproveProduction,
    canDeploy,
    liveVerified,
  };
}

function normalizeApproval(
  workflow: ReleaseWorkflow,
  input: unknown,
  expectedKind: ReleaseApproval["kind"],
): ReleaseApproval {
  assertExactKeys(
    input,
    [
      "releaseId",
      "artifactDigest",
      "reportDigest",
      "workflowInstanceId",
      "preparedAt",
      "approvalNonce",
      "rollbackPlanDigest",
      "actor",
      "approvedAt",
      "attestation",
      "kind",
    ],
    `${expectedKind}Approval`,
  );
  const identity = {
    releaseId: input.releaseId,
    artifactDigest: input.artifactDigest,
    reportDigest: input.reportDigest,
    workflowInstanceId: input.workflowInstanceId,
    preparedAt: input.preparedAt,
    approvalNonce: input.approvalNonce,
    rollbackPlanDigest: input.rollbackPlanDigest,
  } as CurrentReleaseIdentity;
  assertCurrentIdentity(workflow, identity);
  assertActor(input.actor, `${expectedKind}Approval.actor`);
  if (input.actor.type !== "human") {
    throw new Error(`${expectedKind} approval requires a human actor.`);
  }
  if (input.kind !== expectedKind) {
    throw new Error(`${expectedKind} approval kind does not match operation.`);
  }
  const approvedAt = input.approvedAt;
  assertUtcTimestamp(approvedAt, `${expectedKind}Approval.approvedAt`);
  parseTimestamp(approvedAt, `${expectedKind}Approval.approvedAt`);
  if (
    parseTimestamp(approvedAt, "approvedAt") <=
    parseTimestamp(workflow.preparedAt, "preparedAt")
  ) {
    throw new Error(`${expectedKind} approval must be later than preparation.`);
  }
  assertTrustedAttestation(
    input.attestation,
    workflow,
    expectedKind,
    input.actor,
    approvedAt,
  );
  return deepFreeze({
    ...identity,
    actor: { id: input.actor.id, type: input.actor.type },
    approvedAt,
    attestation: input.attestation,
    kind: expectedKind,
  });
}

export function prepareRelease(input: PrepareReleaseInput): ReleaseWorkflow {
  assertExactKeys(
    input,
    [
      "releaseId",
      "artifactDigest",
      "workflowInstanceId",
      "preparedAt",
      "approvalNonce",
      "dataMode",
      "provenance",
      "rollbackPlan",
      "review",
    ],
    "prepareRelease input",
  );
  assertMachineId(input.releaseId, "releaseId");
  assertDigest(input.artifactDigest, "artifactDigest");
  assertMachineId(input.workflowInstanceId, "workflowInstanceId");
  const preparedAt = parseTimestamp(input.preparedAt, "preparedAt");
  assertNonce(input.approvalNonce, "approvalNonce");
  if (!RELEASE_DATA_MODES.includes(input.dataMode)) {
    throw new Error("dataMode must be actual, synthetic_fixture, or dry_run.");
  }
  assertActualObservationNotFuture(
    input.dataMode,
    preparedAt,
    "actual preparation",
  );
  const provenance = normalizeProvenance(input.provenance, input.dataMode);
  const rollbackPlan = normalizeRollbackPlan(input.rollbackPlan);
  const report = normalizeReview(input.review);
  const reportDigest = digestCanonical(report);
  const state =
    preflightBlockers(report).length === 0 ? "preview_ready" : "validated";
  const workflow = {
    version: 1 as const,
    state,
    dataMode: input.dataMode,
    provenance,
    releaseId: input.releaseId,
    artifactDigest: input.artifactDigest,
    reportDigest,
    workflowInstanceId: input.workflowInstanceId,
    preparedAt: input.preparedAt,
    approvalNonce: input.approvalNonce,
    rollbackPlanDigest: rollbackPlan.planDigest,
    report,
    rollbackPlan,
    rollbackGeneration: 0,
    searchReports: [],
  } satisfies ReleaseWorkflow;
  return deepFreeze(withBrand(workflow, TRUSTED_WORKFLOW));
}

export function isTrustedReleaseWorkflow(
  value: unknown,
): value is ReleaseWorkflow {
  return (
    isRecord(value) &&
    TRUSTED_WORKFLOWS.has(value) &&
    Object.prototype.hasOwnProperty.call(value, TRUSTED_WORKFLOW) &&
    (value as unknown as BrandedWorkflow)[TRUSTED_WORKFLOW] === true
  );
}

export function approveContentRelease(
  workflow: ReleaseWorkflow,
  input: ReleaseApprovalInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  if (!isTrustedReleaseWorkflow(workflow)) {
    throw new Error("content approval requires a trusted prepared workflow.");
  }
  assertCurrentIdentity(workflow, currentIdentity);
  const blockers = preflightBlockers(workflow.report);
  if (blockers.length > 0) throw new Error(blockers.join(", "));
  if (workflow.state !== "preview_ready" && workflow.state !== "validated") {
    throw new Error(
      "Content approval is only available before production approval.",
    );
  }
  const approval = normalizeApproval(workflow, input, "content");
  return deepFreeze(
    withBrand(
      {
        ...workflow,
        state: "content_approved" as const,
        contentApproval: approval,
      },
      TRUSTED_WORKFLOW,
    ),
  );
}

export function approveProductionRelease(
  workflow: ReleaseWorkflow,
  input: ReleaseApprovalInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  if (!isTrustedReleaseWorkflow(workflow)) {
    throw new Error(
      "production approval requires a trusted prepared workflow.",
    );
  }
  assertCurrentIdentity(workflow, currentIdentity);
  if (workflow.dataMode !== "actual") {
    throw new Error("production approval requires actual provenance.");
  }
  if (workflow.state !== "content_approved" || !workflow.contentApproval) {
    throw new Error("Production approval requires prior content approval.");
  }
  if (!approvalMatchesWorkflow(workflow.contentApproval, workflow, "content")) {
    throw new Error("content approval is invalid for this preparation.");
  }
  const approval = normalizeApproval(workflow, input, "production");
  if (approval.actor.id === workflow.contentApproval.actor.id) {
    throw new Error(
      "Production approval requires an independent human approver.",
    );
  }
  if (
    parseTimestamp(approval.approvedAt, "production approvedAt") <=
    parseTimestamp(workflow.contentApproval.approvedAt, "content approvedAt")
  ) {
    throw new Error("Production approval must be later than content approval.");
  }
  if (workflow.rollbackPlan.readiness !== "ready") {
    throw new Error("Production approval requires a ready rollback plan.");
  }
  return deepFreeze(
    withBrand(
      {
        ...workflow,
        state: "production_approved" as const,
        productionApproval: approval,
      },
      TRUSTED_WORKFLOW,
    ),
  );
}

export function recordDeployment(
  workflow: ReleaseWorkflow,
  input: DeploymentInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  if (!isTrustedReleaseWorkflow(workflow)) {
    throw new Error("deployment requires a trusted release workflow.");
  }
  assertCurrentIdentity(workflow, currentIdentity);
  if (workflow.dataMode !== "actual") {
    throw new Error("deployment requires actual provenance.");
  }
  if (workflow.state !== "production_approved") {
    throw new Error("Deployment requires production approval.");
  }
  if (!approvalMatchesWorkflow(workflow.contentApproval, workflow, "content")) {
    throw new Error("content approval is invalid.");
  }
  if (
    !approvalMatchesWorkflow(
      workflow.productionApproval,
      workflow,
      "production",
    )
  ) {
    throw new Error("production approval is invalid.");
  }
  if (
    workflow.contentApproval?.actor.id === workflow.productionApproval?.actor.id
  ) {
    throw new Error("Deployment requires independent human approvals.");
  }
  assertExactKeys(
    input,
    ["deploymentId", "destination", "deployedAt"],
    "deployment",
  );
  assertMachineId(input.deploymentId, "deploymentId");
  assertHttpsUrl(input.destination, "deployment.destination");
  const deployedAt = parseTimestamp(input.deployedAt, "deployedAt");
  assertActualObservationNotFuture(
    workflow.dataMode,
    deployedAt,
    "actual deployment",
  );
  if (
    deployedAt <=
    parseTimestamp(
      workflow.productionApproval!.approvedAt,
      "production approvedAt",
    )
  ) {
    throw new Error("Deployment must be later than production approval.");
  }
  const record = {
    deploymentId: input.deploymentId,
    destination: input.destination.trim(),
    deployedAt: input.deployedAt,
    releaseId: workflow.releaseId,
    artifactDigest: workflow.artifactDigest,
    workflowInstanceId: workflow.workflowInstanceId,
    rollbackPlanDigest: workflow.rollbackPlanDigest,
    evidenceDigest: digestCanonical({
      deploymentId: input.deploymentId,
      destination: input.destination.trim(),
      deployedAt: input.deployedAt,
      releaseId: workflow.releaseId,
      artifactDigest: workflow.artifactDigest,
      workflowInstanceId: workflow.workflowInstanceId,
      rollbackPlanDigest: workflow.rollbackPlanDigest,
    }),
  } satisfies DeploymentRecord;
  return deepFreeze(
    withBrand(
      {
        ...workflow,
        state: "deployed" as const,
        deployment: record,
        liveVerification: undefined,
        rollback: undefined,
        searchReports: [],
      },
      TRUSTED_WORKFLOW,
    ),
  );
}

function normalizeLiveChecks(input: unknown): LiveVerificationResults {
  assertExactKeys(input, LIVE_VERIFICATION_CHECKS, "liveVerification.checks");
  const statuses: LiveCheckStatus[] = ["passed", "failed", "not_run"];
  return Object.fromEntries(
    LIVE_VERIFICATION_CHECKS.map((check) => {
      const record = input[check];
      assertExactKeys(
        record,
        ["status", "detail"],
        `liveVerification.${check}`,
      );
      if (!statuses.includes(record.status as LiveCheckStatus)) {
        throw new Error(`${check} has an invalid live verification status.`);
      }
      assertNonEmptyString(record.detail, `${check}.detail`);
      return [
        check,
        {
          status: record.status as LiveCheckStatus,
          detail: record.detail.trim(),
        },
      ];
    }),
  ) as LiveVerificationResults;
}

export function recordLiveVerification(
  workflow: ReleaseWorkflow,
  input: LiveVerificationInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  if (!isTrustedReleaseWorkflow(workflow)) {
    throw new Error("live verification requires a trusted release workflow.");
  }
  assertCurrentIdentity(workflow, currentIdentity);
  if (workflow.state !== "deployed" || !workflow.deployment) {
    throw new Error("Live verification requires a recorded deployment.");
  }
  assertExactKeys(
    input,
    [
      "verifiedAt",
      "checks",
      ...(input.targetArtifactDigest ? ["targetArtifactDigest"] : []),
    ],
    "liveVerification",
  );
  const verifiedAt = parseTimestamp(input.verifiedAt, "verifiedAt");
  assertActualObservationNotFuture(
    workflow.dataMode,
    verifiedAt,
    "actual live verification",
  );
  if (
    verifiedAt <= parseTimestamp(workflow.deployment.deployedAt, "deployedAt")
  ) {
    throw new Error("Live verification must be later than deployment.");
  }
  if (
    workflow.rollback &&
    verifiedAt <=
      parseTimestamp(workflow.rollback.completedAt, "rollback.completedAt")
  ) {
    throw new Error(
      "Live verification after rollback must be later than rollback.",
    );
  }
  if (
    workflow.liveVerification &&
    verifiedAt <=
      parseTimestamp(
        workflow.liveVerification.verifiedAt,
        "previous verifiedAt",
      )
  ) {
    throw new Error(
      "A live verification retry must be later than the prior attempt.",
    );
  }
  const targetArtifactDigest =
    input.targetArtifactDigest ?? workflow.artifactDigest;
  assertDigest(targetArtifactDigest, "liveVerification.targetArtifactDigest");
  if (workflow.rollback) {
    if (targetArtifactDigest !== workflow.rollback.targetArtifactDigest) {
      throw new Error(
        "Rollback requires live verification of the rollback target.",
      );
    }
  } else if (targetArtifactDigest !== workflow.artifactDigest) {
    throw new Error("Live verification target is not bound to this release.");
  }
  const checks = normalizeLiveChecks(input.checks);
  const passed = LIVE_VERIFICATION_CHECKS.every(
    (check) => checks[check].status === "passed",
  );
  const record = {
    verifiedAt: input.verifiedAt,
    checks,
    releaseId: workflow.releaseId,
    artifactDigest: targetArtifactDigest,
    workflowInstanceId: workflow.workflowInstanceId,
    deploymentId: workflow.deployment.deploymentId,
    verificationGeneration: workflow.rollbackGeneration,
    evidenceDigest: digestCanonical({
      verifiedAt: input.verifiedAt,
      checks,
      releaseId: workflow.releaseId,
      artifactDigest: targetArtifactDigest,
      workflowInstanceId: workflow.workflowInstanceId,
      deploymentId: workflow.deployment.deploymentId,
      verificationGeneration: workflow.rollbackGeneration,
    }),
  } satisfies LiveVerificationRecord;
  return deepFreeze(
    withBrand(
      {
        ...workflow,
        state: passed ? ("live_verified" as const) : ("deployed" as const),
        liveVerification: record,
      },
      TRUSTED_WORKFLOW,
    ),
  );
}

export function recordRollback(
  workflow: ReleaseWorkflow,
  input: RollbackInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  if (!isTrustedReleaseWorkflow(workflow)) {
    throw new Error("rollback requires a trusted release workflow.");
  }
  assertCurrentIdentity(workflow, currentIdentity);
  if (
    !workflow.deployment ||
    (workflow.state !== "deployed" && workflow.state !== "live_verified")
  ) {
    throw new Error("Rollback requires a deployed release.");
  }
  assertExactKeys(
    input,
    ["planId", "targetArtifactDigest", "completedAt", "evidenceDigest"],
    "rollback",
  );
  assertMachineId(input.planId, "rollback.planId");
  assertDigest(input.targetArtifactDigest, "rollback.targetArtifactDigest");
  const completedAt = parseTimestamp(input.completedAt, "rollback.completedAt");
  assertActualObservationNotFuture(
    workflow.dataMode,
    completedAt,
    "actual rollback",
  );
  assertDigest(input.evidenceDigest, "rollback.evidenceDigest");
  if (
    input.evidenceDigest !==
    digestRollbackEvidence({
      planId: input.planId,
      targetArtifactDigest: input.targetArtifactDigest,
      completedAt: input.completedAt,
    })
  ) {
    throw new Error(
      "rollback.evidenceDigest does not match rollback evidence.",
    );
  }
  if (
    input.planId !== workflow.rollbackPlan.planId ||
    input.targetArtifactDigest !== workflow.rollbackPlan.targetArtifactDigest
  ) {
    throw new Error(
      "rollback input is not bound to the prepared rollback plan.",
    );
  }
  if (
    parseTimestamp(input.completedAt, "rollback.completedAt") <=
    parseTimestamp(workflow.deployment.deployedAt, "deployedAt")
  ) {
    throw new Error("Rollback must be recorded after deployment.");
  }
  const rollback = {
    ...input,
    state: "completed" as const,
    planDigest: workflow.rollbackPlan.planDigest,
    verificationRequired: true as const,
  } satisfies RollbackRecord;
  return deepFreeze(
    withBrand(
      {
        ...workflow,
        state: "deployed" as const,
        rollbackGeneration: workflow.rollbackGeneration + 1,
        rollback,
        liveVerification: undefined,
        searchReports: [],
      },
      TRUSTED_WORKFLOW,
    ),
  );
}

function assertSearchNotification(
  input: unknown,
): asserts input is SearchNotificationInput {
  assertExactKeys(
    input,
    ["engine", "kind", "target", "status", "recordedAt", "detail"],
    "searchNotification",
  );
  assertMachineId(input.engine, "search notification engine");
  if (input.kind !== "sitemap" && input.kind !== "url") {
    throw new Error("Search notification kind must be sitemap or url.");
  }
  assertHttpsUrl(input.target, "search notification target");
  if (
    !(["submitted", "failed", "not_attempted"] as const).includes(
      input.status as SearchNotificationStatus,
    )
  ) {
    throw new Error("Search notification status is invalid.");
  }
  parseTimestamp(input.recordedAt, "search notification recordedAt");
  assertNonEmptyString(input.detail, "search notification detail");
}

export function recordSearchNotification(
  workflow: ReleaseWorkflow,
  input: SearchNotificationInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  if (!isTrustedReleaseWorkflow(workflow)) {
    throw new Error("search notification requires a trusted release workflow.");
  }
  assertCurrentIdentity(workflow, currentIdentity);
  if (
    workflow.state !== "live_verified" ||
    !workflow.deployment ||
    !workflow.liveVerification
  ) {
    throw new Error("Search notification requires live_verified evidence.");
  }
  assertSearchNotification(input);
  const recordedAt = parseTimestamp(
    input.recordedAt,
    "search notification recordedAt",
  );
  assertActualObservationNotFuture(
    workflow.dataMode,
    recordedAt,
    "actual search notification",
  );
  const verifiedAt = parseTimestamp(
    workflow.liveVerification.verifiedAt,
    "verifiedAt",
  );
  if (recordedAt <= verifiedAt) {
    throw new Error(
      "Search notification must be recorded after live verification.",
    );
  }
  const notification: SearchNotificationRecord = {
    engine: input.engine,
    kind: input.kind,
    target: input.target.trim(),
    status: input.status,
    recordedAt: input.recordedAt,
    detail: input.detail.trim(),
  };
  const id = `search.${input.engine}.${input.kind}.${digestCanonical(notification).slice(7, 19)}`;
  if (workflow.searchReports.some((report) => report.id === id)) {
    throw new Error(`Search report ${id} already exists.`);
  }
  return deepFreeze(
    withBrand(
      {
        ...workflow,
        searchReports: [
          ...workflow.searchReports,
          { id, notification, indexation: { status: "unknown" } as const },
        ],
      },
      TRUSTED_WORKFLOW,
    ),
  );
}

export function observeIndexation(
  workflow: ReleaseWorkflow,
  input: IndexationObservationInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  if (!isTrustedReleaseWorkflow(workflow)) {
    throw new Error(
      "indexation observation requires a trusted release workflow.",
    );
  }
  assertCurrentIdentity(workflow, currentIdentity);
  assertExactKeys(
    input,
    ["reportId", "status", "observedAt", "evidence"],
    "indexationObservation",
  );
  assertMachineId(input.reportId, "indexation reportId");
  if (
    input.status !== "observed_indexed" &&
    input.status !== "observed_not_indexed"
  ) {
    throw new Error(
      "Indexation observation status must be explicitly observed.",
    );
  }
  const observedAt = parseTimestamp(input.observedAt, "observedAt");
  assertActualObservationNotFuture(
    workflow.dataMode,
    observedAt,
    "actual indexation observation",
  );
  assertNonEmptyString(input.evidence, "indexation evidence");
  const index = workflow.searchReports.findIndex(
    (report) => report.id === input.reportId,
  );
  if (index < 0) throw new Error("Search report was not found.");
  const report = workflow.searchReports[index];
  if (
    observedAt <=
    parseTimestamp(report.notification.recordedAt, "notification recordedAt")
  ) {
    throw new Error(
      "Indexation observation must be later than notification reporting.",
    );
  }
  const searchReports = workflow.searchReports.map((entry, entryIndex) =>
    entryIndex === index
      ? {
          ...entry,
          indexation: {
            status: input.status,
            observedAt: input.observedAt,
            evidence: input.evidence.trim(),
          },
        }
      : entry,
  );
  return deepFreeze(
    withBrand({ ...workflow, searchReports }, TRUSTED_WORKFLOW),
  );
}
