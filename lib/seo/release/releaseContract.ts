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

export type ReleasePreflightCheck = (typeof RELEASE_PREFLIGHT_CHECKS)[number];
export type LiveVerificationCheck = (typeof LIVE_VERIFICATION_CHECKS)[number];
export type ReleaseWorkflowState = (typeof RELEASE_WORKFLOW_STATES)[number];
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

export interface CurrentReleaseIdentity {
  releaseId: string;
  artifactDigest: Sha256Digest;
  reportDigest: Sha256Digest;
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

export interface ReleaseApprovalInput extends CurrentReleaseIdentity {
  actor: ApprovalActor;
  approvedAt: string;
}

export interface ReleaseApproval extends ReleaseApprovalInput {
  kind: "content" | "production";
}

export interface DeploymentRecord {
  deploymentId: string;
  destination: string;
  deployedAt: string;
}

export type DeploymentInput = DeploymentRecord;

export interface LiveVerificationRecord {
  verifiedAt: string;
  checks: LiveVerificationResults;
}

export type LiveVerificationInput = LiveVerificationRecord;

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
  preparedAt: string;
  report: ReleaseReviewReport;
  contentApproval?: ReleaseApproval;
  productionApproval?: ReleaseApproval;
  deployment?: DeploymentRecord;
  liveVerification?: LiveVerificationRecord;
  searchReports: SearchReport[];
}

export interface PrepareReleaseInput {
  releaseId: string;
  artifactDigest: Sha256Digest;
  preparedAt: string;
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

function compareCodePoints(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
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
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds) || !/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    throw new Error(`${label} must be an absolute ISO-8601 timestamp.`);
  }
  return milliseconds;
}

function assertHttpsUrl(
  value: unknown,
  label: string,
): asserts value is string {
  assertNonEmptyString(value, label);
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") {
      throw new Error("not https");
    }
  } catch {
    throw new Error(`${label} must be an HTTPS URL.`);
  }
}

function normalizeStringList(
  value: unknown,
  label: string,
  options: { allowEmpty?: boolean; urls?: boolean } = {},
): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
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
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort(compareCodePoints)
        .map((key) => {
          if (record[key] === undefined) {
            throw new Error(
              "Canonical release JSON cannot contain undefined values.",
            );
          }
          return [key, canonicalize(record[key])];
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

function normalizeCheckResult(
  input: unknown,
  check: ReleasePreflightCheck,
): ReleaseCheckResult {
  if (!input || typeof input !== "object") {
    return {
      status: "not_run",
      detail: `${check} result was not provided`,
    };
  }

  const record = input as Partial<ReleaseCheckResult>;
  const statuses: ReleaseCheckStatus[] = [
    "passed",
    "failed",
    "blocked",
    "not_run",
  ];
  if (!statuses.includes(record.status as ReleaseCheckStatus)) {
    throw new Error(`${check} has an invalid preflight status.`);
  }
  assertNonEmptyString(record.detail, `${check}.detail`);
  return {
    status: record.status as ReleaseCheckStatus,
    detail: record.detail.trim(),
  };
}

function normalizePreflightResults(input: unknown): ReleasePreflightResults {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("preflightChecks must be an object.");
  }

  const source = input as Record<string, unknown>;
  const known = new Set<string>(RELEASE_PREFLIGHT_CHECKS);
  const unexpected = Object.keys(source).filter((key) => !known.has(key));
  if (unexpected.length > 0) {
    throw new Error(
      `Unexpected preflight checks: ${unexpected.sort(compareCodePoints).join(", ")}.`,
    );
  }

  return Object.fromEntries(
    RELEASE_PREFLIGHT_CHECKS.map((check) => [
      check,
      normalizeCheckResult(source[check], check),
    ]),
  ) as ReleasePreflightResults;
}

function normalizeReview(input: ReleaseReviewInput): ReleaseReviewReport {
  if (!input || typeof input !== "object") {
    throw new Error("review must be an object.");
  }
  assertHttpsUrl(input.previewDestination, "previewDestination");

  return {
    affectedUrls: normalizeStringList(input.affectedUrls, "affectedUrls", {
      urls: true,
    }),
    contentChanges: normalizeStringList(input.contentChanges, "contentChanges"),
    graphChanges: normalizeStringList(input.graphChanges, "graphChanges"),
    attributionChanges: normalizeStringList(
      input.attributionChanges,
      "attributionChanges",
    ),
    risks: normalizeStringList(input.risks, "risks", { allowEmpty: true }),
    previewDestination: input.previewDestination.trim(),
    preflightChecks: normalizePreflightResults(input.preflightChecks),
  };
}

export function digestReleaseReview(review: ReleaseReviewInput): Sha256Digest {
  return digestCanonical(normalizeReview(review));
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

function preflightBlockers(report: ReleaseReviewReport): string[] {
  return RELEASE_PREFLIGHT_CHECKS.flatMap((check) => {
    const status = report.preflightChecks[check].status;
    return status === "passed" ? [] : [`preflight_${status}:${check}`];
  });
}

function identityBlockers(
  workflow: ReleaseWorkflow,
  current: CurrentReleaseIdentity,
): string[] {
  const blockers: string[] = [];
  if (current.releaseId !== workflow.releaseId) {
    blockers.push("identity_mismatch:releaseId");
  }
  if (current.artifactDigest !== workflow.artifactDigest) {
    blockers.push("identity_mismatch:artifactDigest");
  }
  if (current.reportDigest !== workflow.reportDigest) {
    blockers.push("identity_mismatch:reportDigest");
  }
  return blockers;
}

function approvalMatchesWorkflow(
  approval: ReleaseApproval | undefined,
  workflow: ReleaseWorkflow,
  kind: ReleaseApproval["kind"],
): boolean {
  return Boolean(
    approval &&
    approval.kind === kind &&
    approval.actor.type === "human" &&
    approval.releaseId === workflow.releaseId &&
    approval.artifactDigest === workflow.artifactDigest &&
    approval.reportDigest === workflow.reportDigest,
  );
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
  const approvalsValid =
    blockers.filter((blocker) => blocker.startsWith("identity_mismatch:"))
      .length === 0 &&
    contentApprovalValid &&
    (!workflow.productionApproval ||
      (productionApprovalValid && independentApprovers));

  return deepFreeze({
    blockers: [...new Set(blockers)],
    approvalsValid,
    canApproveContent:
      workflow.state === "preview_ready" && blockers.length === 0,
    canApproveProduction:
      workflow.state === "content_approved" &&
      blockers.length === 0 &&
      contentApprovalValid,
    canDeploy:
      workflow.state === "production_approved" &&
      blockers.length === 0 &&
      contentApprovalValid &&
      productionApprovalValid &&
      independentApprovers,
    liveVerified:
      workflow.state === "live_verified" &&
      LIVE_VERIFICATION_CHECKS.every(
        (check) => workflow.liveVerification?.checks[check].status === "passed",
      ),
  });
}

function assertCurrentIdentity(
  workflow: ReleaseWorkflow,
  currentIdentity: CurrentReleaseIdentity,
): void {
  assertMachineId(currentIdentity.releaseId, "currentIdentity.releaseId");
  assertDigest(
    currentIdentity.artifactDigest,
    "currentIdentity.artifactDigest",
  );
  assertDigest(currentIdentity.reportDigest, "currentIdentity.reportDigest");
  const blockers = identityBlockers(workflow, currentIdentity);
  if (blockers.length > 0) {
    throw new Error(blockers.join(", "));
  }
}

function assertApprovalInput(
  input: ReleaseApprovalInput,
  workflow: ReleaseWorkflow,
  kind: ReleaseApproval["kind"],
): ReleaseApproval {
  if (input.actor.type !== "human") {
    throw new Error(`${kind} approval requires a human actor.`);
  }
  assertMachineId(input.actor.id, `${kind} approval actor.id`);
  parseTimestamp(input.approvedAt, `${kind} approval approvedAt`);
  assertMachineId(input.releaseId, `${kind} approval releaseId`);
  assertDigest(input.artifactDigest, `${kind} approval artifactDigest`);
  assertDigest(input.reportDigest, `${kind} approval reportDigest`);

  const blockers = identityBlockers(workflow, input);
  if (blockers.length > 0) {
    throw new Error(blockers.join(", "));
  }

  return {
    kind,
    actor: { id: input.actor.id, type: input.actor.type },
    approvedAt: input.approvedAt,
    releaseId: input.releaseId,
    artifactDigest: input.artifactDigest,
    reportDigest: input.reportDigest,
  };
}

export function prepareRelease(input: PrepareReleaseInput): ReleaseWorkflow {
  assertMachineId(input.releaseId, "releaseId");
  assertDigest(input.artifactDigest, "artifactDigest");
  parseTimestamp(input.preparedAt, "preparedAt");
  const report = normalizeReview(input.review);
  const reportDigest = digestCanonical(report);
  const ready = preflightBlockers(report).length === 0;

  return deepFreeze({
    version: 1,
    state: ready ? "preview_ready" : "validated",
    releaseId: input.releaseId,
    artifactDigest: input.artifactDigest,
    reportDigest,
    preparedAt: input.preparedAt,
    report,
    searchReports: [],
  });
}

export function approveContentRelease(
  workflow: ReleaseWorkflow,
  input: ReleaseApprovalInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  assertCurrentIdentity(workflow, currentIdentity);
  if (workflow.state !== "preview_ready") {
    const blockers = assessRelease(workflow, currentIdentity).blockers;
    throw new Error(
      blockers.length > 0
        ? blockers.join(", ")
        : `Content approval requires preview_ready state, received ${workflow.state}.`,
    );
  }
  const assessment = assessRelease(workflow, currentIdentity);
  if (!assessment.canApproveContent) {
    throw new Error(assessment.blockers.join(", "));
  }

  const approval = assertApprovalInput(input, workflow, "content");
  if (
    parseTimestamp(approval.approvedAt, "content approval approvedAt") <=
    parseTimestamp(workflow.preparedAt, "preparedAt")
  ) {
    throw new Error("Content approval must be later than release preparation.");
  }

  return deepFreeze({
    ...workflow,
    state: "content_approved",
    contentApproval: approval,
  });
}

export function approveProductionRelease(
  workflow: ReleaseWorkflow,
  input: ReleaseApprovalInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  assertCurrentIdentity(workflow, currentIdentity);
  if (workflow.state !== "content_approved" || !workflow.contentApproval) {
    throw new Error(
      "Production approval requires a valid content approval first.",
    );
  }
  const assessment = assessRelease(workflow, currentIdentity);
  if (!assessment.canApproveProduction) {
    throw new Error(assessment.blockers.join(", "));
  }

  const approval = assertApprovalInput(input, workflow, "production");
  if (approval.actor.id === workflow.contentApproval.actor.id) {
    throw new Error(
      "Production approval requires an independent human approver.",
    );
  }
  if (
    parseTimestamp(approval.approvedAt, "production approval approvedAt") <=
    parseTimestamp(
      workflow.contentApproval.approvedAt,
      "content approval approvedAt",
    )
  ) {
    throw new Error("Production approval must be later than content approval.");
  }

  return deepFreeze({
    ...workflow,
    state: "production_approved",
    productionApproval: approval,
  });
}

export function recordDeployment(
  workflow: ReleaseWorkflow,
  input: DeploymentInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  assertCurrentIdentity(workflow, currentIdentity);
  if (
    workflow.state !== "production_approved" ||
    !workflow.productionApproval
  ) {
    throw new Error(
      "Deployment requires a separate valid production approval after content approval.",
    );
  }
  const assessment = assessRelease(workflow, currentIdentity);
  if (!assessment.canDeploy) {
    throw new Error(
      assessment.blockers.length > 0
        ? assessment.blockers.join(", ")
        : "Deployment requires both valid human approvals.",
    );
  }

  assertMachineId(input.deploymentId, "deploymentId");
  assertHttpsUrl(input.destination, "deployment destination");
  const deployedAt = parseTimestamp(input.deployedAt, "deployedAt");
  if (
    deployedAt <=
    parseTimestamp(
      workflow.productionApproval.approvedAt,
      "production approval approvedAt",
    )
  ) {
    throw new Error("Deployment must be later than production approval.");
  }

  return deepFreeze({
    ...workflow,
    state: "deployed",
    deployment: {
      deploymentId: input.deploymentId,
      destination: input.destination,
      deployedAt: input.deployedAt,
    },
  });
}

function normalizeLiveChecks(input: unknown): LiveVerificationResults {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Live verification checks must be an object.");
  }
  const source = input as Record<string, unknown>;
  const known = new Set<string>(LIVE_VERIFICATION_CHECKS);
  const unexpected = Object.keys(source).filter((key) => !known.has(key));
  if (unexpected.length > 0) {
    throw new Error(
      `Unexpected live checks: ${unexpected.sort(compareCodePoints).join(", ")}.`,
    );
  }

  return Object.fromEntries(
    LIVE_VERIFICATION_CHECKS.map((check) => {
      const value = source[check];
      if (!value || typeof value !== "object") {
        return [
          check,
          { status: "not_run", detail: `${check} result was not provided` },
        ];
      }
      const record = value as Partial<LiveCheckResult>;
      const statuses: LiveCheckStatus[] = ["passed", "failed", "not_run"];
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
  assertCurrentIdentity(workflow, currentIdentity);
  if (workflow.state !== "deployed" || !workflow.deployment) {
    throw new Error("Live verification requires a recorded deployment.");
  }
  const verifiedAt = parseTimestamp(input.verifiedAt, "verifiedAt");
  if (
    verifiedAt <= parseTimestamp(workflow.deployment.deployedAt, "deployedAt")
  ) {
    throw new Error("Live verification must be later than deployment.");
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

  const checks = normalizeLiveChecks(input.checks);
  const passed = LIVE_VERIFICATION_CHECKS.every(
    (check) => checks[check].status === "passed",
  );

  return deepFreeze({
    ...workflow,
    state: passed ? "live_verified" : "deployed",
    liveVerification: { verifiedAt: input.verifiedAt, checks },
  });
}

function assertSearchNotification(input: SearchNotificationInput): void {
  assertMachineId(input.engine, "search notification engine");
  if (input.kind !== "sitemap" && input.kind !== "url") {
    throw new Error("Search notification kind must be sitemap or url.");
  }
  assertHttpsUrl(input.target, "search notification target");
  const statuses: SearchNotificationStatus[] = [
    "submitted",
    "failed",
    "not_attempted",
  ];
  if (!statuses.includes(input.status)) {
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
  assertCurrentIdentity(workflow, currentIdentity);
  if (
    (workflow.state !== "deployed" && workflow.state !== "live_verified") ||
    !workflow.deployment
  ) {
    throw new Error("Search notification reporting requires a deployment.");
  }
  assertSearchNotification(input);
  if (
    parseTimestamp(input.recordedAt, "search notification recordedAt") <=
    parseTimestamp(workflow.deployment.deployedAt, "deployedAt")
  ) {
    throw new Error("Search notification must be recorded after deployment.");
  }

  const notification: SearchNotificationRecord = {
    engine: input.engine,
    kind: input.kind,
    target: input.target,
    status: input.status,
    recordedAt: input.recordedAt,
    detail: input.detail.trim(),
  };
  const id = `search.${input.engine}.${input.kind}.${digestCanonical(
    notification,
  ).slice("sha256:".length, "sha256:".length + 12)}`;
  if (workflow.searchReports.some((report) => report.id === id)) {
    throw new Error(`Search report ${id} already exists.`);
  }

  return deepFreeze({
    ...workflow,
    searchReports: [
      ...workflow.searchReports,
      { id, notification, indexation: { status: "unknown" } as const },
    ],
  });
}

export function observeIndexation(
  workflow: ReleaseWorkflow,
  input: IndexationObservationInput,
  currentIdentity: CurrentReleaseIdentity,
): ReleaseWorkflow {
  assertCurrentIdentity(workflow, currentIdentity);
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
  assertNonEmptyString(input.evidence, "indexation evidence");

  const index = workflow.searchReports.findIndex(
    (report) => report.id === input.reportId,
  );
  if (index < 0) {
    throw new Error(`Search report ${input.reportId} was not found.`);
  }
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

  return deepFreeze({ ...workflow, searchReports });
}
