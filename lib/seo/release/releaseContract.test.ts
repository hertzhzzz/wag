import {
  LIVE_VERIFICATION_CHECKS,
  RELEASE_PREFLIGHT_CHECKS,
  approveContentRelease,
  approveProductionRelease,
  assessRelease,
  canonicalReleaseJson,
  createApprovalAttestation,
  digestReleaseReview,
  digestRollbackEvidence,
  digestRollbackPlan,
  observeIndexation,
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
const OTHER_ARTIFACT_DIGEST =
  "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as const;
const ROLLBACK_ARTIFACT_DIGEST =
  "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc" as const;

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
    affectedUrls: [
      "https://www.winningadventure.com.au/article/verify-chinese-supplier",
      "https://www.winningadventure.com.au/article/china-supplier-scams",
    ],
    contentChanges: ["Refresh governed supplier verification copy"],
    graphChanges: ["Add supplier-verification pillar relationship"],
    attributionChanges: ["No attribution changes"],
    risks: ["Search snippets may be re-evaluated"],
    previewDestination:
      "https://preview.winningadventure.com.au/releases/seo-2026-07-18",
    preflightChecks: passingPreflight(),
    ...overrides,
  };
}

function rollbackPlan(): RollbackPlan {
  const plan = {
    planId: "rollback.seo-2026-07-18",
    state: "ready" as const,
    readiness: "ready" as const,
    targetArtifactDigest: ROLLBACK_ARTIFACT_DIGEST,
    targetDestination: "https://www.winningadventure.com.au",
    verificationRequired: true as const,
  };
  return { ...plan, planDigest: digestRollbackPlan(plan) };
}

function prepare(overrides: Partial<ReleaseReviewInput> = {}) {
  const preparedAt = "2026-07-18T04:00:00.000Z";
  return prepareRelease({
    releaseId: "release.seo-2026-07-18",
    artifactDigest: ARTIFACT_DIGEST,
    workflowInstanceId: "workflow.seo-2026-07-18",
    preparedAt,
    approvalNonce: "nonce.seo-2026-07-18",
    dataMode: "actual",
    provenance: {
      issuer: "trusted-release-control",
      contractVersion: "release-provenance-v1",
      source: "release-contract-test",
      recordedAt: preparedAt,
    },
    rollbackPlan: rollbackPlan(),
    review: reviewInput(overrides),
  });
}

function identity(
  workflow = prepare(),
  overrides: Partial<CurrentReleaseIdentity> = {},
): CurrentReleaseIdentity {
  return {
    releaseId: workflow.releaseId,
    artifactDigest: workflow.artifactDigest,
    reportDigest: workflow.reportDigest,
    workflowInstanceId: workflow.workflowInstanceId,
    preparedAt: workflow.preparedAt,
    approvalNonce: workflow.approvalNonce,
    rollbackPlanDigest: workflow.rollbackPlanDigest,
    ...overrides,
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

function contentApproved() {
  const workflow = prepare();
  return approveContentRelease(
    workflow,
    approvalInput(
      workflow,
      "editor.alice",
      "2026-07-18T05:00:00.000Z",
      "content",
    ),
    identity(workflow),
  );
}

function productionApproved() {
  const workflow = contentApproved();
  return approveProductionRelease(
    workflow,
    approvalInput(
      workflow,
      "release.bob",
      "2026-07-18T06:00:00.000Z",
      "production",
    ),
    identity(workflow),
  );
}

function deployed() {
  const workflow = productionApproved();
  return recordDeployment(
    workflow,
    {
      deploymentId: "deployment.seo-2026-07-18",
      destination: "https://www.winningadventure.com.au",
      deployedAt: "2026-07-18T06:30:00.000Z",
    },
    identity(workflow),
  );
}

describe("release review preparation", () => {
  it("requires the complete deterministic preflight contract", () => {
    expect(RELEASE_PREFLIGHT_CHECKS).toEqual([
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
    ]);
  });

  it("canonicalizes review lists with fixed code-point order and hashes stable bytes", () => {
    const first = reviewInput({
      affectedUrls: ["https://example.com/z", "https://example.com/a"],
      risks: ["Zulu", "Alpha"],
    });
    const second = reviewInput({
      affectedUrls: ["https://example.com/a", "https://example.com/z"],
      risks: ["Alpha", "Zulu"],
    });

    expect(digestReleaseReview(first)).toBe(digestReleaseReview(second));
    expect(canonicalReleaseJson({ z: 1, a: { z: 2, a: 3 } })).toBe(
      '{"a":{"a":3,"z":2},"z":1}',
    );
  });

  it("produces a frozen preview-ready report with every review section", () => {
    const workflow = prepare();

    expect(workflow.state).toBe("preview_ready");
    expect(workflow.dataMode).toBe("actual");
    expect(workflow.report).toMatchObject({
      affectedUrls: expect.any(Array),
      contentChanges: expect.any(Array),
      graphChanges: expect.any(Array),
      attributionChanges: expect.any(Array),
      risks: expect.any(Array),
      previewDestination: expect.stringMatching(/^https:/),
      preflightChecks: expect.any(Object),
    });
    expect(workflow.reportDigest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(workflow.rollbackPlanDigest).toBe(workflow.rollbackPlan.planDigest);
    expect(Object.isFrozen(workflow)).toBe(true);
    expect(Object.isFrozen(workflow.report)).toBe(true);
    expect(Object.isFrozen(workflow.report.affectedUrls)).toBe(true);
  });

  it.each([
    ["failed", "preflight_failed:build"],
    ["blocked", "preflight_blocked:privacy"],
    ["not_run", "preflight_not_run:regression"],
  ] as const)(
    "stops approval when a required check is %s",
    (status, blocker) => {
      const checks = passingPreflight();
      const check =
        status === "failed"
          ? "build"
          : status === "blocked"
            ? "privacy"
            : "regression";
      checks[check] = { status, detail: `${check} is ${status}` };

      const workflow = prepare({ preflightChecks: checks });
      expect(workflow.state).toBe("validated");
      expect(assessRelease(workflow, identity(workflow))).toEqual(
        expect.objectContaining({
          canApproveContent: false,
          blockers: expect.arrayContaining([blocker]),
        }),
      );
    },
  );

  it("treats Ticket 30 privacy blockage as a real release blocker", () => {
    const checks = passingPreflight();
    checks.privacy = {
      status: "blocked",
      detail:
        "Awaiting approved attribution contract, privacy sign-off, consent seam, and immutable baseline",
    };
    const workflow = prepare({ preflightChecks: checks });

    expect(() =>
      approveContentRelease(
        workflow,
        approvalInput(
          workflow,
          "editor.alice",
          "2026-07-18T05:00:00.000Z",
          "content",
        ),
        identity(workflow),
      ),
    ).toThrow(/preflight_blocked:privacy/);
  });
});

describe("dual human approval gate", () => {
  it("records explicit content approval and stops before production approval", () => {
    const approved = contentApproved();

    expect(approved.state).toBe("content_approved");
    expect(approved.contentApproval).toEqual(
      expect.objectContaining({
        kind: "content",
        actor: { id: "editor.alice", type: "human" },
        approvedAt: "2026-07-18T05:00:00.000Z",
      }),
    );
    expect(assessRelease(approved, identity(approved)).canDeploy).toBe(false);
  });

  it("requires a separate later human production approval", () => {
    const content = contentApproved();

    expect(() =>
      approveProductionRelease(
        content,
        approvalInput(
          content,
          "editor.alice",
          "2026-07-18T06:00:00.000Z",
          "production",
        ),
        identity(content),
      ),
    ).toThrow(/independent human/i);

    expect(() =>
      approveProductionRelease(
        content,
        approvalInput(
          content,
          "release.bob",
          "2026-07-18T04:30:00.000Z",
          "production",
        ),
        identity(content),
      ),
    ).toThrow(/later than content approval/i);

    expect(productionApproved().state).toBe("production_approved");
  });

  it.each(["automation", "service", "scheduled_task"] as const)(
    "rejects %s actors rather than exposing an approval bypass",
    (type) => {
      const workflow = prepare();
      expect(() =>
        approveContentRelease(
          workflow,
          {
            ...identity(workflow),
            actor: { id: `actor.${type.replace("_", "-")}`, type },
            approvedAt: "2026-07-18T05:00:00.000Z",
            attestation: {
              issuer: "trusted-release-control",
              contractVersion: "release-attestation-v1",
              principal: `actor.${type.replace("_", "-")}`,
              bindingDigest: OTHER_ARTIFACT_DIGEST,
            },
            kind: "content",
          } as never,
          identity(workflow),
        ),
      ).toThrow(/human actor/i);
    },
  );

  it("invalidates approvals and retries whenever current release identity drifts", () => {
    const workflow = contentApproved();
    const drifted = identity(workflow, {
      artifactDigest: OTHER_ARTIFACT_DIGEST,
    });

    expect(assessRelease(workflow, drifted)).toEqual(
      expect.objectContaining({
        approvalsValid: false,
        canDeploy: false,
        blockers: expect.arrayContaining(["identity_mismatch:artifactDigest"]),
      }),
    );
    expect(() =>
      approveProductionRelease(
        workflow,
        approvalInput(
          workflow,
          "release.bob",
          "2026-07-18T06:00:00.000Z",
          "production",
        ),
        drifted,
      ),
    ).toThrow(/identity_mismatch:artifactDigest/);
  });

  it("does not read time, environment, cwd, or force flags implicitly", () => {
    const source = approveContentRelease.toString();
    expect(source).not.toMatch(
      /Date\.now|new Date\(\)|process\.env|process\.cwd/,
    );
    expect(source).not.toMatch(/force|bypass|--yes|--approve/i);
  });
});

describe("deployment, live verification, rollback, and search reporting", () => {
  it("cannot deploy until both valid approvals exist", () => {
    const content = contentApproved();
    expect(() =>
      recordDeployment(
        content,
        {
          deploymentId: "deployment.preview-only",
          destination: "https://www.winningadventure.com.au",
          deployedAt: "2026-07-18T06:30:00.000Z",
        },
        identity(content),
      ),
    ).toThrow(/production approval/i);
  });

  it("records deployment only after production approval with matching identity", () => {
    const workflow = deployed();

    expect(workflow.state).toBe("deployed");
    expect(workflow.deployment).toEqual(
      expect.objectContaining({
        deploymentId: "deployment.seo-2026-07-18",
        destination: "https://www.winningadventure.com.au",
        releaseId: workflow.releaseId,
        artifactDigest: workflow.artifactDigest,
        rollbackPlanDigest: workflow.rollbackPlanDigest,
        evidenceDigest: expect.stringMatching(/^sha256:/),
      }),
    );
  });

  it("requires all six live checks before declaring live verification", () => {
    expect(LIVE_VERIFICATION_CHECKS).toEqual([
      "http_status",
      "canonical",
      "robots",
      "structured_data",
      "key_links",
      "expected_content",
    ]);
    const workflow = deployed();
    const failedChecks = passingLiveChecks();
    failedChecks.canonical = {
      status: "failed",
      detail: "Canonical points to preview",
    };

    const failed = recordLiveVerification(
      workflow,
      {
        verifiedAt: "2026-07-18T06:40:00.000Z",
        checks: failedChecks,
      },
      identity(workflow),
    );
    expect(failed.state).toBe("deployed");
    expect(assessRelease(failed, identity(failed)).blockers).toContain(
      "live_check_failed:canonical",
    );

    const verified = recordLiveVerification(
      failed,
      {
        verifiedAt: "2026-07-18T06:45:00.000Z",
        checks: passingLiveChecks(),
      },
      identity(failed),
    );
    expect(verified.state).toBe("live_verified");
    expect(assessRelease(verified, identity(verified)).liveVerified).toBe(true);
  });

  it("reports search notification only after live verification and never infers indexing", () => {
    const workflow = deployed();
    const verified = recordLiveVerification(
      workflow,
      {
        verifiedAt: "2026-07-18T06:40:00.000Z",
        checks: passingLiveChecks(),
      },
      identity(workflow),
    );
    const notified = recordSearchNotification(
      verified,
      {
        engine: "google",
        kind: "sitemap",
        target: "https://www.winningadventure.com.au/sitemap.xml",
        status: "submitted",
        recordedAt: "2026-07-18T06:45:00.000Z",
        detail: "Sitemap submission accepted by transport",
      },
      identity(verified),
    );

    expect(notified.searchReports).toHaveLength(1);
    expect(notified.searchReports[0]).toEqual(
      expect.objectContaining({
        notification: expect.objectContaining({ status: "submitted" }),
        indexation: { status: "unknown" },
      }),
    );

    const observed = observeIndexation(
      notified,
      {
        reportId: notified.searchReports[0].id,
        status: "observed_indexed",
        observedAt: "2026-07-18T07:00:00.000Z",
        evidence:
          "Google Search Console URL Inspection returned indexed for the canonical URL",
      },
      identity(notified),
    );
    expect(observed.searchReports[0].indexation).toEqual(
      expect.objectContaining({
        status: "observed_indexed",
        evidence: expect.any(String),
      }),
    );
  });

  it("clears stale live evidence after rollback and requires a later target verification", () => {
    const workflow = deployed();
    const verified = recordLiveVerification(
      workflow,
      {
        verifiedAt: "2026-07-18T06:40:00.000Z",
        checks: passingLiveChecks(),
      },
      identity(workflow),
    );
    const rollbackEvidence = {
      planId: verified.rollbackPlan.planId,
      targetArtifactDigest: verified.rollbackPlan.targetArtifactDigest,
      completedAt: "2026-07-18T06:50:00.000Z",
    };
    const rolledBack = recordRollback(
      verified,
      {
        ...rollbackEvidence,
        evidenceDigest: digestRollbackEvidence(rollbackEvidence),
      },
      identity(verified),
    );

    expect(rolledBack.state).toBe("deployed");
    expect(rolledBack.liveVerification).toBeUndefined();
    expect(assessRelease(rolledBack, identity(rolledBack)).liveVerified).toBe(
      false,
    );
    expect(() =>
      recordLiveVerification(
        rolledBack,
        {
          verifiedAt: "2026-07-18T06:45:00.000Z",
          checks: passingLiveChecks(),
          targetArtifactDigest: ROLLBACK_ARTIFACT_DIGEST,
        },
        identity(rolledBack),
      ),
    ).toThrow(/rollback|later/i);
    expect(() =>
      recordLiveVerification(
        rolledBack,
        {
          verifiedAt: "2026-07-18T07:00:00.000Z",
          checks: passingLiveChecks(),
        },
        identity(rolledBack),
      ),
    ).toThrow(/rollback target/i);

    const reverified = recordLiveVerification(
      rolledBack,
      {
        verifiedAt: "2026-07-18T07:00:00.000Z",
        checks: passingLiveChecks(),
        targetArtifactDigest: ROLLBACK_ARTIFACT_DIGEST,
      },
      identity(rolledBack),
    );
    expect(reverified.state).toBe("live_verified");
    expect(reverified.liveVerification?.verificationGeneration).toBe(1);
    expect(assessRelease(reverified, identity(reverified)).liveVerified).toBe(
      true,
    );
  });
});
