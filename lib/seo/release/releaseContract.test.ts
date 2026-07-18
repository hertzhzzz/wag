import {
  LIVE_VERIFICATION_CHECKS,
  RELEASE_PREFLIGHT_CHECKS,
  approveContentRelease,
  approveProductionRelease,
  assessRelease,
  canonicalReleaseJson,
  digestReleaseReview,
  observeIndexation,
  prepareRelease,
  recordDeployment,
  recordLiveVerification,
  recordSearchNotification,
  type CurrentReleaseIdentity,
  type ReleaseReviewInput,
} from "./releaseContract";

const ARTIFACT_DIGEST =
  "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
const OTHER_ARTIFACT_DIGEST =
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

function prepare(overrides: Partial<ReleaseReviewInput> = {}) {
  return prepareRelease({
    releaseId: "release.seo-2026-07-18",
    artifactDigest: ARTIFACT_DIGEST,
    preparedAt: "2026-07-18T04:00:00.000Z",
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
    ...overrides,
  };
}

function contentApproved() {
  const workflow = prepare();
  return approveContentRelease(
    workflow,
    {
      actor: { id: "editor.alice", type: "human" },
      approvedAt: "2026-07-18T05:00:00.000Z",
      ...identity(workflow),
    },
    identity(workflow),
  );
}

function productionApproved() {
  const workflow = contentApproved();
  return approveProductionRelease(
    workflow,
    {
      actor: { id: "release.bob", type: "human" },
      approvedAt: "2026-07-18T06:00:00.000Z",
      ...identity(workflow),
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
        {
          actor: { id: "editor.alice", type: "human" },
          approvedAt: "2026-07-18T05:00:00.000Z",
          ...identity(workflow),
        },
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
        {
          actor: { id: "editor.alice", type: "human" },
          approvedAt: "2026-07-18T06:00:00.000Z",
          ...identity(content),
        },
        identity(content),
      ),
    ).toThrow(/independent human/i);

    expect(() =>
      approveProductionRelease(
        content,
        {
          actor: { id: "release.bob", type: "human" },
          approvedAt: "2026-07-18T04:30:00.000Z",
          ...identity(content),
        },
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
            actor: { id: `actor.${type}`, type },
            approvedAt: "2026-07-18T05:00:00.000Z",
            ...identity(workflow),
          },
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
        {
          actor: { id: "release.bob", type: "human" },
          approvedAt: "2026-07-18T06:00:00.000Z",
          ...identity(workflow),
        },
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

describe("deployment, live verification, and search reporting", () => {
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
    const approved = productionApproved();
    const deployed = recordDeployment(
      approved,
      {
        deploymentId: "deployment.seo-2026-07-18",
        destination: "https://www.winningadventure.com.au",
        deployedAt: "2026-07-18T06:30:00.000Z",
      },
      identity(approved),
    );

    expect(deployed.state).toBe("deployed");
    expect(deployed.deployment).toEqual(
      expect.objectContaining({
        deploymentId: "deployment.seo-2026-07-18",
        destination: "https://www.winningadventure.com.au",
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
    const approved = productionApproved();
    const deployed = recordDeployment(
      approved,
      {
        deploymentId: "deployment.seo-2026-07-18",
        destination: "https://www.winningadventure.com.au",
        deployedAt: "2026-07-18T06:30:00.000Z",
      },
      identity(approved),
    );
    const failedChecks = passingLiveChecks();
    failedChecks.canonical = {
      status: "failed",
      detail: "Canonical points to preview",
    };

    const failed = recordLiveVerification(
      deployed,
      {
        verifiedAt: "2026-07-18T06:40:00.000Z",
        checks: failedChecks,
      },
      identity(deployed),
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
  });

  it("reports search notification separately and never infers indexing", () => {
    const approved = productionApproved();
    const deployed = recordDeployment(
      approved,
      {
        deploymentId: "deployment.seo-2026-07-18",
        destination: "https://www.winningadventure.com.au",
        deployedAt: "2026-07-18T06:30:00.000Z",
      },
      identity(approved),
    );
    const notified = recordSearchNotification(
      deployed,
      {
        engine: "google",
        kind: "sitemap",
        target: "https://www.winningadventure.com.au/sitemap.xml",
        status: "submitted",
        recordedAt: "2026-07-18T06:35:00.000Z",
        detail: "Sitemap submission accepted by transport",
      },
      identity(deployed),
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
        observedAt: "2026-07-19T02:00:00.000Z",
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
});
