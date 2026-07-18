import { createHash } from "node:crypto";

import {
  assessRelease,
  isTrustedReleaseWorkflow,
  type CurrentReleaseIdentity,
  type ReleaseWorkflow,
  type Sha256Digest,
} from "../release/releaseContract";

export const PUBLICATION_EVENT_DATA_MODES = Object.freeze([
  "actual",
  "synthetic_fixture",
  "dry_run",
] as const);

export type PublicationEventDataMode =
  (typeof PUBLICATION_EVENT_DATA_MODES)[number];

export interface PublicationApprovalEvidence {
  principal: string;
  approvedAt: string;
  bindingDigest: Sha256Digest;
}

export interface PublicationApprovalEvidencePair {
  content: PublicationApprovalEvidence;
  production: PublicationApprovalEvidence;
}

export interface PublicationDeploymentEvidence {
  deploymentId: string;
  deployedAt: string;
  destination: string;
}

export interface PublicationLiveEvidence {
  verifiedAt: string;
  checksDigest: Sha256Digest;
}

export type PublicationRollbackEvidence =
  | {
      state: "ready";
      planDigest: Sha256Digest;
      postRollbackVerificationRequired: true;
    }
  | {
      state: "completed";
      planDigest: Sha256Digest;
      postRollbackVerificationRequired: true;
      completedAt: string;
      evidenceDigest: Sha256Digest;
      targetArtifactDigest: Sha256Digest;
    };

export interface PublicationEventProvenance {
  issuer: "trusted-release-control";
  contractVersion: "release-event-v1";
  recordedAt: string;
}

export interface PublicationReleaseEventEnvelope {
  version: 1;
  eventId: string;
  dataMode: PublicationEventDataMode;
  workflowInstanceId: string;
  releaseId: string;
  artifactDigest: Sha256Digest;
  reportDigest: Sha256Digest;
  rollbackPlanDigest: Sha256Digest;
  approvalEvidence: PublicationApprovalEvidencePair;
  deploymentEvidence: PublicationDeploymentEvidence;
  liveEvidence: PublicationLiveEvidence;
  rollbackEvidence: PublicationRollbackEvidence;
  gateEvidenceDigest: Sha256Digest;
  eventDigest: Sha256Digest;
  provenance: PublicationEventProvenance;
}

export interface AdaptReleaseWorkflowInput {
  eventId: string;
  recordedAt: string;
}

const MACHINE_ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const UTC_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const LATEST_ACTUAL_OBSERVATION_TIMESTAMP = Date.parse(
  "2026-07-18T23:59:59.999Z",
);
const TRUSTED_PUBLICATION_EVENT = Symbol("trusted-publication-release-event");
const TRUSTED_PUBLICATION_EVENTS = new WeakSet<object>();

type TrustedPublicationReleaseEventEnvelope =
  PublicationReleaseEventEnvelope & {
    readonly [TRUSTED_PUBLICATION_EVENT]: true;
  };

function compareCodePoints(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => compareCodePoints(left, right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  return value;
}

function digestCanonical(value: unknown): Sha256Digest {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(canonicalize(value)), "utf8")
    .digest("hex")}`;
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

function assertMachineId(
  value: unknown,
  label: string,
): asserts value is string {
  if (typeof value !== "string" || !MACHINE_ID_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase machine-readable ID.`);
  }
}

function assertExactKeys(
  value: unknown,
  keys: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  const actual = Object.keys(value).sort(compareCodePoints);
  const expected = [...keys].sort(compareCodePoints);
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new Error(`${label} must contain exactly: ${expected.join(", ")}.`);
  }
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

function currentIdentity(workflow: ReleaseWorkflow): CurrentReleaseIdentity {
  return {
    releaseId: workflow.releaseId,
    artifactDigest: workflow.artifactDigest,
    reportDigest: workflow.reportDigest,
    workflowInstanceId: workflow.workflowInstanceId,
    preparedAt: workflow.preparedAt,
    approvalNonce: workflow.approvalNonce,
    rollbackPlanDigest: workflow.rollbackPlanDigest,
  };
}

function withTrustedBrand(
  envelope: PublicationReleaseEventEnvelope,
): TrustedPublicationReleaseEventEnvelope {
  Object.defineProperty(envelope, TRUSTED_PUBLICATION_EVENT, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  });
  TRUSTED_PUBLICATION_EVENTS.add(envelope);
  return envelope as TrustedPublicationReleaseEventEnvelope;
}

export function isTrustedPublicationReleaseEvent(
  value: unknown,
): value is PublicationReleaseEventEnvelope {
  return Boolean(
    value &&
    typeof value === "object" &&
    TRUSTED_PUBLICATION_EVENTS.has(value) &&
    Object.prototype.hasOwnProperty.call(value, TRUSTED_PUBLICATION_EVENT) &&
    (value as TrustedPublicationReleaseEventEnvelope)[
      TRUSTED_PUBLICATION_EVENT
    ] === true,
  );
}

export function adaptReleaseWorkflowToPublicationEvent(
  workflow: ReleaseWorkflow,
  input: AdaptReleaseWorkflowInput,
): PublicationReleaseEventEnvelope {
  assertExactKeys(input, ["eventId", "recordedAt"], "release event adapter");
  assertMachineId(input.eventId, "release event adapter eventId");
  const recordedAt = parseUtcTimestamp(
    input.recordedAt,
    "release event recordedAt",
  );

  if (!isTrustedReleaseWorkflow(workflow)) {
    throw new Error(
      "Release event adapter requires a trusted release workflow.",
    );
  }
  if (workflow.dataMode !== "actual") {
    throw new Error(
      "Actual release adapter rejects fixture and dry-run workflows.",
    );
  }
  if (recordedAt > LATEST_ACTUAL_OBSERVATION_TIMESTAMP) {
    throw new Error(
      "Actual release event cannot use a future observation timestamp.",
    );
  }

  const assessment = assessRelease(workflow, currentIdentity(workflow));
  if (
    workflow.state !== "live_verified" ||
    !assessment.approvalsValid ||
    !assessment.liveVerified ||
    !workflow.contentApproval ||
    !workflow.productionApproval ||
    !workflow.deployment ||
    !workflow.liveVerification
  ) {
    throw new Error(
      "Release event adapter requires dual approvals, deployment, and current live verification evidence.",
    );
  }
  if (
    recordedAt <=
    parseUtcTimestamp(workflow.liveVerification.verifiedAt, "verifiedAt")
  ) {
    throw new Error(
      "Release event recordedAt must be later than live verification.",
    );
  }

  const artifactDigest = workflow.liveVerification.artifactDigest;
  const approvalEvidence: PublicationApprovalEvidencePair = {
    content: {
      principal: workflow.contentApproval.attestation.principal,
      approvedAt: workflow.contentApproval.approvedAt,
      bindingDigest: workflow.contentApproval.attestation.bindingDigest,
    },
    production: {
      principal: workflow.productionApproval.attestation.principal,
      approvedAt: workflow.productionApproval.approvedAt,
      bindingDigest: workflow.productionApproval.attestation.bindingDigest,
    },
  };
  const deploymentEvidence: PublicationDeploymentEvidence = {
    deploymentId: workflow.deployment.deploymentId,
    deployedAt: workflow.deployment.deployedAt,
    destination: workflow.deployment.destination,
  };
  const liveEvidence: PublicationLiveEvidence = {
    verifiedAt: workflow.liveVerification.verifiedAt,
    checksDigest: digestCanonical(workflow.liveVerification.checks),
  };
  const rollbackEvidence: PublicationRollbackEvidence = workflow.rollback
    ? {
        state: "completed",
        planDigest: workflow.rollback.planDigest,
        postRollbackVerificationRequired: true,
        completedAt: workflow.rollback.completedAt,
        evidenceDigest: workflow.rollback.evidenceDigest,
        targetArtifactDigest: workflow.rollback.targetArtifactDigest,
      }
    : {
        state: "ready",
        planDigest: workflow.rollbackPlan.planDigest,
        postRollbackVerificationRequired: true,
      };
  const gateEvidenceDigest = digestCanonical({
    assessment,
    preflightChecks: workflow.report.preflightChecks,
    liveChecks: workflow.liveVerification.checks,
    rollbackGeneration: workflow.rollbackGeneration,
  });
  const provenance: PublicationEventProvenance = {
    issuer: "trusted-release-control",
    contractVersion: "release-event-v1",
    recordedAt: input.recordedAt,
  };
  const eventWithoutDigest = {
    version: 1 as const,
    eventId: input.eventId,
    dataMode: "actual" as const,
    workflowInstanceId: workflow.workflowInstanceId,
    releaseId: workflow.releaseId,
    artifactDigest,
    reportDigest: workflow.reportDigest,
    rollbackPlanDigest: workflow.rollbackPlanDigest,
    approvalEvidence,
    deploymentEvidence,
    liveEvidence,
    rollbackEvidence,
    gateEvidenceDigest,
    provenance,
  };
  const envelope: PublicationReleaseEventEnvelope = {
    ...eventWithoutDigest,
    eventDigest: digestCanonical(eventWithoutDigest),
  };

  return deepFreeze(withTrustedBrand(envelope));
}
