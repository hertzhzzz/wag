import {
  LIVE_VERIFICATION_CHECKS,
  isTrustedReleaseWorkflow,
  type ReleaseWorkflow,
} from "../release/releaseContract";
import { digestPublicationEvent } from "./canonical";
import {
  assertExactKeys,
  assertRecord,
  normalizeDigest,
  normalizeMachineId,
  normalizeNonEmptyString,
  normalizeTimestamp,
} from "./contracts";
import type {
  SyntheticReleaseBindingInput,
  TrustedReleaseBinding,
} from "./types";

const TRUSTED_BINDING = Symbol("trusted-publication-release-binding");
type BrandedTrustedReleaseBinding<T extends object = TrustedReleaseBinding> =
  T & {
    readonly [TRUSTED_BINDING]: true;
  };

// The private WeakSet is the trust root. The non-enumerable symbol is only a
// diagnostic brand and must never be sufficient on its own: callers can copy
// symbols from objects they receive, while WeakSet membership cannot be
// forged or inherited.
const TRUSTED_BINDINGS = new WeakSet<object>();

const NONCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{7,127}$/;

function assertNonce(value: unknown, label: string): string {
  const nonce = normalizeNonEmptyString(value, label);
  if (!NONCE_PATTERN.test(nonce))
    throw new Error(`${label} must be an opaque nonce.`);
  return nonce;
}

function brand<T extends object>(value: T): BrandedTrustedReleaseBinding<T> {
  Object.defineProperty(value, TRUSTED_BINDING, {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  TRUSTED_BINDINGS.add(value);
  return value as BrandedTrustedReleaseBinding<T>;
}

export function isTrustedPublicationReleaseBinding(
  value: unknown,
): value is TrustedReleaseBinding {
  return (
    value !== null && typeof value === "object" && TRUSTED_BINDINGS.has(value)
  );
}

function assertLiveWorkflow(workflow: ReleaseWorkflow): void {
  if (workflow.dataMode !== "actual" || workflow.state !== "live_verified") {
    throw new Error("Ticket 38 workflow must be actual and live_verified.");
  }
  if (!workflow.contentApproval || !workflow.productionApproval) {
    throw new Error("Ticket 38 workflow requires independent approvals.");
  }
  if (!workflow.deployment || !workflow.liveVerification) {
    throw new Error(
      "Ticket 38 workflow requires deployment and live verification.",
    );
  }
  if (
    workflow.contentApproval.actor.type !== "human" ||
    workflow.productionApproval.actor.type !== "human" ||
    workflow.contentApproval.actor.id === workflow.productionApproval.actor.id
  ) {
    throw new Error(
      "Ticket 38 workflow approvals are not independently human.",
    );
  }
  if (
    workflow.rollbackPlan.readiness !== "ready" ||
    workflow.rollbackPlan.verificationRequired !== true
  ) {
    throw new Error(
      "Ticket 38 workflow rollback plan is not ready for verification.",
    );
  }
  if (
    !LIVE_VERIFICATION_CHECKS.every(
      (check) => workflow.liveVerification?.checks[check].status === "passed",
    )
  ) {
    throw new Error("Ticket 38 workflow is not fully live_verified.");
  }
}

export function bindTrustedReleaseWorkflow(
  workflow: unknown,
): TrustedReleaseBinding {
  if (!isTrustedReleaseWorkflow(workflow)) {
    throw new Error("publication requires a trusted Ticket 38 workflow.");
  }
  assertLiveWorkflow(workflow);
  const release = workflow as ReleaseWorkflow;
  const contentApproval = release.contentApproval;
  const productionApproval = release.productionApproval;
  const deployment = release.deployment;
  const liveVerification = release.liveVerification;
  if (
    !contentApproval ||
    !productionApproval ||
    !deployment ||
    !liveVerification
  ) {
    throw new Error("Ticket 38 workflow lost required live release fields.");
  }
  const binding = {
    dataMode: "actual" as const,
    workflowInstanceId: release.workflowInstanceId,
    releaseId: release.releaseId,
    artifactDigest: release.artifactDigest,
    reportDigest: release.reportDigest,
    nonce: release.approvalNonce,
    state: "live_verified" as const,
    liveVerified: true as const,
    contentApproval: {
      principal: contentApproval.actor.id,
      approvedAt: contentApproval.approvedAt,
      attestationDigest: contentApproval.attestation.bindingDigest,
    },
    productionApproval: {
      principal: productionApproval.actor.id,
      approvedAt: productionApproval.approvedAt,
      attestationDigest: productionApproval.attestation.bindingDigest,
    },
    deployment: {
      deploymentId: deployment.deploymentId,
      destination: deployment.destination,
      deployedAt: deployment.deployedAt,
      evidenceDigest: deployment.evidenceDigest,
    },
    liveVerification: {
      verifiedAt: liveVerification.verifiedAt,
      evidenceDigest: liveVerification.evidenceDigest,
      checksPassed: true as const,
    },
    rollback: {
      readiness: "ready" as const,
      verificationRequired: true as const,
      planDigest: release.rollbackPlan.planDigest,
    },
    attestationDigest: digestPublicationEvent({
      workflowInstanceId: release.workflowInstanceId,
      releaseId: release.releaseId,
      artifactDigest: release.artifactDigest,
      reportDigest: release.reportDigest,
      nonce: release.approvalNonce,
      contentApproval: contentApproval.attestation.bindingDigest,
      productionApproval: productionApproval.attestation.bindingDigest,
      deployment: deployment.evidenceDigest,
      liveVerification: liveVerification.evidenceDigest,
      rollback: release.rollbackPlan.planDigest,
    }),
  } satisfies TrustedReleaseBinding;
  return Object.freeze(brand(binding));
}

export function createSyntheticReleaseBinding(
  input: SyntheticReleaseBindingInput,
): TrustedReleaseBinding {
  assertRecord(input, "synthetic release binding");
  assertExactKeys(
    input,
    [
      "dataMode",
      "workflowInstanceId",
      "releaseId",
      "artifactDigest",
      "reportDigest",
      "nonce",
      "liveVerified",
      "rollback",
    ],
    "synthetic release binding",
  );
  if (input.liveVerified !== false)
    throw new Error("synthetic binding cannot be live_verified");
  assertRecord(input.rollback, "synthetic release binding.rollback");
  assertExactKeys(
    input.rollback,
    ["readiness", "verificationRequired"],
    "synthetic rollback",
  );
  if (
    input.rollback.readiness !== "ready" ||
    input.rollback.verificationRequired !== true
  ) {
    throw new Error("synthetic rollback must declare ready verification.");
  }
  const workflowInstanceId = normalizeMachineId(
    input.workflowInstanceId,
    "workflowInstanceId",
  );
  const releaseId = normalizeMachineId(input.releaseId, "releaseId");
  const artifactDigest = normalizeDigest(
    input.artifactDigest,
    "artifactDigest",
  );
  const reportDigest = normalizeDigest(input.reportDigest, "reportDigest");
  const nonce = assertNonce(input.nonce, "nonce");
  const binding = {
    dataMode: input.dataMode,
    workflowInstanceId,
    releaseId,
    artifactDigest,
    reportDigest,
    nonce,
    state: input.dataMode,
    liveVerified: false,
    contentApproval: null,
    productionApproval: null,
    deployment: null,
    liveVerification: null,
    rollback: {
      readiness: "ready" as const,
      verificationRequired: true as const,
      planDigest: digestPublicationEvent({
        workflowInstanceId,
        releaseId,
        artifactDigest,
        reportDigest,
        nonce,
      }),
    },
    attestationDigest: digestPublicationEvent({
      kind: "synthetic_fixture",
      workflowInstanceId,
      releaseId,
      artifactDigest,
      reportDigest,
      nonce,
    }),
  } satisfies TrustedReleaseBinding;
  return Object.freeze(brand(binding));
}

export function assertTrustedBindingShape(
  binding: TrustedReleaseBinding,
): void {
  if (!isTrustedPublicationReleaseBinding(binding)) {
    throw new Error("trusted release binding attestation is missing.");
  }
  normalizeMachineId(
    binding.workflowInstanceId,
    "releaseBinding.workflowInstanceId",
  );
  normalizeMachineId(binding.releaseId, "releaseBinding.releaseId");
  normalizeDigest(binding.artifactDigest, "releaseBinding.artifactDigest");
  normalizeDigest(binding.reportDigest, "releaseBinding.reportDigest");
  assertNonce(binding.nonce, "releaseBinding.nonce");
  normalizeDigest(
    binding.attestationDigest,
    "releaseBinding.attestationDigest",
  );
  if (binding.dataMode === "actual") {
    normalizeTimestamp(
      binding.liveVerification?.verifiedAt,
      "releaseBinding.liveVerification.verifiedAt",
    );
  }
}
