import {
  LIVE_VERIFICATION_CHECKS,
  RELEASE_PREFLIGHT_CHECKS,
  approveContentRelease,
  approveProductionRelease,
  createApprovalAttestation,
  digestReleaseReview,
  digestRollbackEvidence,
  digestRollbackPlan,
  isTrustedReleaseWorkflow,
  prepareRelease,
  recordDeployment,
  recordLiveVerification,
  recordRollback,
  recordSearchNotification,
  type ApprovalActor,
  type CurrentReleaseIdentity,
  type ReleaseReviewInput,
  type ReleaseWorkflow,
  type RollbackPlan,
} from "./releaseContract";

const ARTIFACT_DIGEST =
  "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
const ROLLBACK_ARTIFACT_DIGEST =
  "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as const;

function passingPreflight(): ReleaseReviewInput["preflightChecks"] {
  return Object.fromEntries(
    RELEASE_PREFLIGHT_CHECKS.map((check) => [
      check,
      { status: "passed", detail: `${check} passed` },
    ]),
  ) as ReleaseReviewInput["preflightChecks"];
}

function passingLiveChecks() {
  return Object.fromEntries(
    LIVE_VERIFICATION_CHECKS.map((check) => [
      check,
      { status: "passed", detail: `${check} passed` },
    ]),
  ) as Parameters<typeof recordLiveVerification>[1]["checks"];
}

function reviewInput(
  overrides: Partial<ReleaseReviewInput> = {},
): ReleaseReviewInput {
  return {
    affectedUrls: ["https://www.winningadventure.com.au/article/example"],
    contentChanges: ["Refresh governed copy"],
    graphChanges: ["Preserve graph relationship"],
    attributionChanges: ["No attribution changes"],
    risks: ["Search snippets may change"],
    previewDestination:
      "https://preview.winningadventure.com.au/releases/example",
    preflightChecks: passingPreflight(),
    ...overrides,
  };
}

function rollbackPlan(): RollbackPlan {
  const plan = {
    planId: "rollback.seo-hardening",
    state: "ready" as const,
    readiness: "ready" as const,
    targetArtifactDigest: ROLLBACK_ARTIFACT_DIGEST,
    targetDestination: "https://www.winningadventure.com.au",
    verificationRequired: true as const,
  };
  return { ...plan, planDigest: digestRollbackPlan(plan) };
}

function prepareAt(
  preparedAt = "2026-07-18T04:00:00.000Z",
  workflowInstanceId = "workflow.seo-hardening-a",
  approvalNonce = "nonce.seo-hardening-a",
) {
  return prepareRelease({
    releaseId: "release.seo-hardening",
    artifactDigest: ARTIFACT_DIGEST,
    workflowInstanceId,
    preparedAt,
    approvalNonce,
    dataMode: "actual",
    provenance: {
      issuer: "trusted-release-control",
      contractVersion: "release-provenance-v1",
      source: "release-hardening-test",
      recordedAt: preparedAt,
    },
    rollbackPlan: rollbackPlan(),
    review: reviewInput(),
  });
}

function identity(workflow: ReleaseWorkflow): CurrentReleaseIdentity {
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

function approvalInput(
  workflow: ReleaseWorkflow,
  actorId: string,
  approvedAt: string,
  kind: "content" | "production",
) {
  const actor: ApprovalActor = { id: actorId, type: "human" };
  return {
    ...identity(workflow),
    actor,
    approvedAt,
    attestation: createApprovalAttestation(workflow, kind, actor, approvedAt),
    kind,
  };
}

function productionApproved() {
  const prepared = prepareAt();
  const content = approveContentRelease(
    prepared,
    approvalInput(
      prepared,
      "editor.alice",
      "2026-07-18T05:00:00.000Z",
      "content",
    ),
    identity(prepared),
  );
  return approveProductionRelease(
    content,
    approvalInput(
      content,
      "release.bob",
      "2026-07-18T06:00:00.000Z",
      "production",
    ),
    identity(content),
  );
}

describe("release contract hardening", () => {
  it("rejects prototype-inherited workflow and attestation brands", () => {
    const prepared = prepareAt();
    const inheritedWorkflow = Object.create(prepared) as ReleaseWorkflow;

    expect(isTrustedReleaseWorkflow(inheritedWorkflow)).toBe(false);
    expect(() =>
      createApprovalAttestation(
        inheritedWorkflow,
        "content",
        { id: "editor.alice", type: "human" },
        "2026-07-18T05:00:00.000Z",
      ),
    ).toThrow(/trusted prepared workflow/i);

    const trustedAttestation = createApprovalAttestation(
      prepared,
      "content",
      { id: "editor.alice", type: "human" },
      "2026-07-18T05:00:00.000Z",
    );
    const inheritedAttestation = Object.create(trustedAttestation);

    expect(() =>
      approveContentRelease(
        prepared,
        {
          ...approvalInput(
            prepared,
            "editor.alice",
            "2026-07-18T05:00:00.000Z",
            "content",
          ),
          attestation: inheritedAttestation,
        },
        identity(prepared),
      ),
    ).toThrow(/exactly|trusted release control/i);
  });

  it("rejects unknown top-level and nested keys instead of dropping them", () => {
    const checks = passingPreflight() as unknown as Record<string, unknown>;
    checks.schema = { status: "passed", detail: "ok", extra: "reject" };

    expect(() =>
      prepareRelease({
        releaseId: "release.seo-hardening",
        artifactDigest: ARTIFACT_DIGEST,
        workflowInstanceId: "workflow.seo-hardening-unknown",
        preparedAt: "2026-07-18T04:00:00.000Z",
        approvalNonce: "nonce.seo-hardening-unknown",
        dataMode: "actual",
        provenance: {
          issuer: "trusted-release-control",
          contractVersion: "release-provenance-v1",
          source: "release-hardening-test",
          recordedAt: "2026-07-18T04:00:00.000Z",
        },
        rollbackPlan: rollbackPlan(),
        review: reviewInput({ preflightChecks: checks as never }),
      }),
    ).toThrow(/schema.*exactly/i);

    expect(() =>
      prepareRelease({
        releaseId: "release.seo-hardening",
        artifactDigest: ARTIFACT_DIGEST,
        workflowInstanceId: "workflow.seo-hardening-extra",
        preparedAt: "2026-07-18T04:00:00.000Z",
        approvalNonce: "nonce.seo-hardening-extra",
        dataMode: "actual",
        provenance: {
          issuer: "trusted-release-control",
          contractVersion: "release-provenance-v1",
          source: "release-hardening-test",
          recordedAt: "2026-07-18T04:00:00.000Z",
        },
        rollbackPlan: rollbackPlan(),
        review: reviewInput(),
        extra: "reject",
      } as never),
    ).toThrow(/prepareRelease input.*exactly/i);
  });

  it("rejects local timestamps without an explicit UTC timezone", () => {
    expect(() => prepareAt("2026-07-18T04:00:00")).toThrow(
      /UTC|timezone|timestamp/i,
    );
  });

  it("rejects future actual approval evidence after July 18, 2026", () => {
    const workflow = prepareAt();
    const actor: ApprovalActor = { id: "editor.alice", type: "human" };

    expect(() =>
      createApprovalAttestation(
        workflow,
        "content",
        actor,
        "2026-07-19T05:00:00.000Z",
      ),
    ).toThrow(/future observation/i);
  });

  it("rejects credentials, query strings, and fragments in release URLs", () => {
    const unsafeUrls = [
      "https://user:secret@example.com/preview",
      "https://example.com/preview?token=1",
      "https://example.com/preview#frag",
    ];
    for (const previewDestination of unsafeUrls) {
      expect(() =>
        prepareRelease({
          releaseId: "release.seo-hardening",
          artifactDigest: ARTIFACT_DIGEST,
          workflowInstanceId: "workflow.seo-hardening-url",
          preparedAt: "2026-07-18T04:00:00.000Z",
          approvalNonce: "nonce.seo-hardening-url",
          dataMode: "actual",
          provenance: {
            issuer: "trusted-release-control",
            contractVersion: "release-provenance-v1",
            source: "release-hardening-test",
            recordedAt: "2026-07-18T04:00:00.000Z",
          },
          rollbackPlan: rollbackPlan(),
          review: reviewInput({ previewDestination }),
        }),
      ).toThrow(/HTTPS URL|credential|query|fragment/i);
    }
  });

  it("does not accept self-reported or copied approval attestations", () => {
    const workflow = prepareAt();
    const actor: ApprovalActor = { id: "editor.alice", type: "human" };
    const trusted = createApprovalAttestation(
      workflow,
      "content",
      actor,
      "2026-07-18T05:00:00.000Z",
    );

    expect(() =>
      approveContentRelease(
        workflow,
        {
          ...identity(workflow),
          actor,
          approvedAt: "2026-07-18T05:00:00.000Z",
          attestation: { ...trusted },
          kind: "content",
        },
        identity(workflow),
      ),
    ).toThrow(/attestation|provenance|trusted/i);
  });

  it("rejects a prior approval replayed into a fresh preparation", () => {
    const first = prepareAt(
      "2026-07-18T04:00:00.000Z",
      "workflow.seo-hardening-first",
      "nonce.seo-hardening-first",
    );
    const firstContent = approveContentRelease(
      first,
      approvalInput(
        first,
        "editor.alice",
        "2026-07-18T05:00:00.000Z",
        "content",
      ),
      identity(first),
    );
    const fresh = prepareAt(
      "2026-07-18T04:00:00.000Z",
      "workflow.seo-hardening-fresh",
      "nonce.seo-hardening-fresh",
    );

    expect(() =>
      approveContentRelease(
        fresh,
        firstContent.contentApproval!,
        identity(fresh),
      ),
    ).toThrow(/identity|attestation|preparation|workflow/i);
  });

  it("does not report a search notification from deployed state", () => {
    const approved = productionApproved();
    const deployed = recordDeployment(
      approved,
      {
        deploymentId: "deployment.seo-hardening",
        destination: "https://www.winningadventure.com.au",
        deployedAt: "2026-07-18T06:30:00.000Z",
      },
      identity(approved),
    );

    expect(() =>
      recordSearchNotification(
        deployed,
        {
          engine: "google",
          kind: "sitemap",
          target: "https://www.winningadventure.com.au/sitemap.xml",
          status: "submitted",
          recordedAt: "2026-07-18T06:35:00.000Z",
          detail: "submission recorded",
        },
        identity(deployed),
      ),
    ).toThrow(/live_verified|live.*verified/i);
  });

  it("requires notification recordedAt to be later than verifiedAt", () => {
    const approved = productionApproved();
    const deployed = recordDeployment(
      approved,
      {
        deploymentId: "deployment.seo-hardening",
        destination: "https://www.winningadventure.com.au",
        deployedAt: "2026-07-18T06:30:00.000Z",
      },
      identity(approved),
    );
    const verified = recordLiveVerification(
      deployed,
      {
        verifiedAt: "2026-07-18T06:40:00.000Z",
        checks: passingLiveChecks(),
      },
      identity(deployed),
    );

    expect(() =>
      recordSearchNotification(
        verified,
        {
          engine: "google",
          kind: "sitemap",
          target: "https://www.winningadventure.com.au/sitemap.xml",
          status: "submitted",
          recordedAt: "2026-07-18T06:40:00.000Z",
          detail: "submission recorded",
        },
        identity(verified),
      ),
    ).toThrow(/after live verification/i);
  });

  it("requires a typed rollback plan before production preparation", () => {
    expect(() =>
      prepareRelease({
        releaseId: "release.seo-hardening",
        artifactDigest: ARTIFACT_DIGEST,
        workflowInstanceId: "workflow.seo-hardening-missing-rollback",
        preparedAt: "2026-07-18T04:00:00.000Z",
        approvalNonce: "nonce.seo-hardening-missing",
        dataMode: "actual",
        provenance: {
          issuer: "trusted-release-control",
          contractVersion: "release-provenance-v1",
          source: "release-hardening-test",
          recordedAt: "2026-07-18T04:00:00.000Z",
        },
        review: reviewInput(),
      } as never),
    ).toThrow(/rollback/i);
  });

  it("rejects forged rollback evidence and requires post-rollback re-verification", () => {
    const approved = productionApproved();
    const deployed = recordDeployment(
      approved,
      {
        deploymentId: "deployment.seo-hardening",
        destination: "https://www.winningadventure.com.au",
        deployedAt: "2026-07-18T06:30:00.000Z",
      },
      identity(approved),
    );
    const verified = recordLiveVerification(
      deployed,
      {
        verifiedAt: "2026-07-18T06:40:00.000Z",
        checks: passingLiveChecks(),
      },
      identity(deployed),
    );
    const rollbackEvidence = {
      planId: verified.rollbackPlan.planId,
      targetArtifactDigest: verified.rollbackPlan.targetArtifactDigest,
      completedAt: "2026-07-18T06:50:00.000Z",
    };

    expect(() =>
      recordRollback(
        verified,
        {
          ...rollbackEvidence,
          evidenceDigest:
            "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
        },
        identity(verified),
      ),
    ).toThrow(/evidenceDigest/i);

    const rolledBack = recordRollback(
      verified,
      {
        ...rollbackEvidence,
        evidenceDigest: digestRollbackEvidence(rollbackEvidence),
      },
      identity(verified),
    );
    expect(rolledBack.liveVerification).toBeUndefined();
    expect(() =>
      recordSearchNotification(
        rolledBack,
        {
          engine: "google",
          kind: "url",
          target: "https://www.winningadventure.com.au/article/example",
          status: "submitted",
          recordedAt: "2026-07-18T07:00:00.000Z",
          detail: "must not pass",
        },
        identity(rolledBack),
      ),
    ).toThrow(/live_verified/i);
  });

  it("keeps the existing review digest deterministic", () => {
    expect(digestReleaseReview(reviewInput())).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(LIVE_VERIFICATION_CHECKS).toHaveLength(6);
  });
});
