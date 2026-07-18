import { deepFreeze, uniqueSorted } from "./contracts";
import { isTrustedPublicationReleaseBinding } from "./releaseBinding";
import { createPublicationEventReport } from "./report";
import { parsePublicationEvent } from "./schema";
import type {
  HighIntentPublicationEventInput,
  PublicationEventDecision,
  PublicationEventInput,
  PublicationEventState,
  RefreshPublicationEventInput,
  TrustedReleaseBinding,
} from "./types";

function releaseIssues(
  record: PublicationEventInput,
  binding: TrustedReleaseBinding,
): string[] {
  const issues: string[] = [];
  if (!isTrustedPublicationReleaseBinding(binding)) {
    return ["trusted_release_binding_required"];
  }
  if (binding.dataMode !== record.dataMode)
    issues.push("release_data_mode_mismatch");
  if (
    binding.workflowInstanceId !== record.releaseIdentity.workflowInstanceId
  ) {
    issues.push("release_workflow_instance_mismatch");
  }
  if (binding.releaseId !== record.releaseIdentity.releaseId) {
    issues.push("release_id_mismatch");
  }
  if (binding.nonce !== record.releaseIdentity.nonce) {
    issues.push("release_nonce_mismatch");
  }
  if (binding.artifactDigest !== record.releaseIdentity.artifactDigest) {
    issues.push("release_identity_artifact_digest_mismatch");
  }
  if (binding.reportDigest !== record.releaseIdentity.reportDigest) {
    issues.push("release_identity_report_digest_mismatch");
  }
  if (
    record.releaseIdentity.artifactDigest !== record.artifact.artifactDigest
  ) {
    issues.push("artifact_release_identity_mismatch");
  }
  if (record.releaseIdentity.reportDigest !== record.artifact.reportDigest) {
    issues.push("report_release_identity_mismatch");
  }
  if (binding.artifactDigest !== record.artifact.artifactDigest) {
    issues.push("release_artifact_digest_mismatch");
  }
  if (binding.reportDigest !== record.artifact.reportDigest) {
    issues.push("release_report_digest_mismatch");
  }
  if (
    binding.rollback.readiness !== "ready" ||
    binding.rollback.verificationRequired !== true
  ) {
    issues.push("rollback_readiness_or_verification_missing");
  }

  if (record.dataMode === "actual") {
    if (binding.state !== "live_verified" || binding.liveVerified !== true) {
      issues.push("trusted_live_verified_release_required");
    }
    if (!binding.contentApproval) issues.push("content_approval_missing");
    if (!binding.productionApproval) issues.push("release_approval_missing");
    if (
      binding.contentApproval &&
      binding.productionApproval &&
      binding.contentApproval.principal === binding.productionApproval.principal
    ) {
      issues.push("approval_separation_invalid");
    }
    if (
      binding.contentApproval &&
      binding.productionApproval &&
      Date.parse(binding.productionApproval.approvedAt) <=
        Date.parse(binding.contentApproval.approvedAt)
    ) {
      issues.push("release_approval_order_invalid");
    }
    if (!binding.deployment) issues.push("deployment_missing");
    if (!binding.liveVerification) issues.push("live_verification_missing");
    const targetUrl =
      record.eventType === "first_high_intent_publication"
        ? record.candidate.targetUrl
        : record.candidate.targetUrl;
    if (binding.deployment && binding.deployment.destination !== targetUrl) {
      issues.push("release_destination_mismatch");
    }
    if (
      binding.liveVerification &&
      Date.parse(record.occurredAt) <
        Date.parse(binding.liveVerification.verifiedAt)
    ) {
      issues.push("event_precedes_live_verification");
    }
  } else if (binding.liveVerified || binding.state === "live_verified") {
    issues.push("non_actual_mode_cannot_claim_live_verified");
  }

  return issues;
}

function commonIssues(record: PublicationEventInput): string[] {
  const issues: string[] = [];
  if (!isTrustedPublicationReleaseBinding(record.releaseBinding)) {
    return ["trusted_release_binding_required"];
  }
  issues.push(...releaseIssues(record, record.releaseBinding));
  const target = record.candidate.targetUrl;
  if (record.candidate.canonicalUrl !== target) {
    issues.push("canonical_target_mismatch");
  }
  return issues;
}

function refreshIssues(record: RefreshPublicationEventInput): string[] {
  const issues: string[] = [];
  const urlChanged =
    record.candidate.existingUrl !== record.candidate.targetUrl;
  if (urlChanged && record.changes.urlDisposition.kind !== "change") {
    issues.push("url_change_requires_approved_disposition");
  }
  if (!urlChanged && record.changes.urlDisposition.kind !== "preserve") {
    issues.push("url_preservation_requires_preserve_disposition");
  }
  if (record.changes.afterArtifactDigest !== record.artifact.artifactDigest) {
    issues.push("refresh_after_artifact_digest_mismatch");
  }
  if (
    record.changes.beforeArtifactDigest === record.changes.afterArtifactDigest
  ) {
    issues.push("refresh_artifact_digest_unchanged");
  }
  return issues;
}

function stateFor(
  record: PublicationEventInput,
  blockers: readonly string[],
): PublicationEventState {
  if (blockers.length > 0) return "blocked";
  if (record.dataMode !== "actual") return "fixture_ready";
  return "live_verified";
}

function evaluate<T extends PublicationEventInput>(
  value: unknown,
): PublicationEventDecision<T> {
  const record = parsePublicationEvent(value) as T;
  const blockers = uniqueSorted([
    ...commonIssues(record),
    ...(record.eventType === "first_refresh_publication"
      ? refreshIssues(record as RefreshPublicationEventInput)
      : []),
  ]);
  const state = stateFor(record, blockers);
  const report = createPublicationEventReport(record, state, blockers);
  return deepFreeze({
    eventType: record.eventType,
    state,
    eligible: blockers.length === 0,
    completed: report.completed,
    blockers,
    record,
    report,
  });
}

export function evaluateHighIntentPublicationEvent(
  value: unknown,
): PublicationEventDecision<HighIntentPublicationEventInput> {
  const decision = evaluate<HighIntentPublicationEventInput>(value);
  if (decision.record.eventType !== "first_high_intent_publication") {
    throw new Error(
      "high-intent evaluator requires first_high_intent_publication.",
    );
  }
  return decision;
}

export function evaluateRefreshPublicationEvent(
  value: unknown,
): PublicationEventDecision<RefreshPublicationEventInput> {
  const decision = evaluate<RefreshPublicationEventInput>(value);
  if (decision.record.eventType !== "first_refresh_publication") {
    throw new Error("refresh evaluator requires first_refresh_publication.");
  }
  return decision;
}
