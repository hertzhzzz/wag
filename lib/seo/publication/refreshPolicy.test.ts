import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PUBLICATION_GATE_NAMES,
  PUBLICATION_LIVE_CHECK_NAMES,
  type LiveCheckResults,
  type PublicationGateResults,
  type Sha256Digest,
} from "./contracts";
import {
  evaluateRefreshPublication,
  type RefreshPublicationInput,
} from "./refreshPolicy";

const digest = (character: string): Sha256Digest =>
  `sha256:${character.repeat(64)}` as Sha256Digest;

const BEFORE_DIGEST = digest("1");
const AFTER_DIGEST = digest("2");
const REVIEW_DIGEST = digest("3");
const SOURCE_DIGEST = digest("4");

function verifiedGates(): PublicationGateResults {
  return Object.fromEntries(
    PUBLICATION_GATE_NAMES.map((name) => [
      name,
      {
        status: "verified",
        detail: `${name} was verified by its owning contract`,
        artifactDigest: AFTER_DIGEST,
      },
    ]),
  ) as PublicationGateResults;
}

function verifiedLiveChecks(): LiveCheckResults {
  return Object.fromEntries(
    PUBLICATION_LIVE_CHECK_NAMES.map((name) => [
      name,
      { status: "verified", detail: `${name} matched the approved artifact` },
    ]),
  ) as LiveCheckResults;
}

function input(): RefreshPublicationInput {
  const existingUrl =
    "https://www.winningadventure.com.au/article/china-factory-audit-guide";

  return {
    version: 1,
    eventId: "ticket-40-factory-audit-refresh",
    claimedState: "live_verified",
    candidate: {
      slug: "china-factory-audit-guide",
      existingUrl,
      targetUrl: existingUrl,
      urlDisposition: {
        kind: "preserve",
        reason: "The existing canonical URL remains the approved destination",
        approval: null,
        redirectPlan: [],
      },
    },
    beforeArtifactDigest: BEFORE_DIGEST,
    afterArtifactDigest: AFTER_DIGEST,
    changeReasons: [
      "Replace evidence that is outside its review window",
      "Improve reviewed internal links without changing the destination URL",
    ],
    changes: {
      evidence: [
        {
          id: "evidence-refresh-001",
          action: "replace",
          detail:
            "Replace an expired registry reference with a reviewed source",
          sourceDigest: SOURCE_DIGEST,
        },
      ],
      internalLinks: [
        {
          fromUrl: existingUrl,
          toUrl:
            "https://www.winningadventure.com.au/services/factory-audits-china",
          action: "add",
          detail: "Add the governed Commercial Root link",
        },
      ],
      metadata: [
        {
          field: "description",
          action: "update",
          detail: "Align the description with the reviewed page intent",
        },
      ],
      governedContent: [
        {
          kind: "statistic",
          action: "remove",
          verification: "unverified",
          actor: { id: "andy-liu", type: "human" },
          reason: "No current source supports the previous number",
        },
        {
          kind: "fact",
          action: "unchanged",
          verification: "verified",
          actor: null,
          reason: "The reviewed service boundary remains accurate",
        },
      ],
    },
    gates: verifiedGates(),
    audit: {
      artifactDigest: AFTER_DIGEST,
      reviewDigest: REVIEW_DIGEST,
      sourceLineage: [
        {
          id: "source-review",
          kind: "review",
          reference: "review:ticket-40-factory-audit-refresh",
          digest: REVIEW_DIGEST,
        },
        {
          id: "source-before",
          kind: "artifact",
          reference: "artifact:before-refresh",
          digest: BEFORE_DIGEST,
        },
      ],
    },
    approvals: {
      content: {
        actor: { id: "andy-liu", type: "human" },
        recordedAt: "2026-07-18T05:00:00.000Z",
        artifactDigest: AFTER_DIGEST,
        reviewDigest: REVIEW_DIGEST,
      },
      production: {
        actor: { id: "release-owner", type: "human" },
        recordedAt: "2026-07-18T05:30:00.000Z",
        artifactDigest: AFTER_DIGEST,
        reviewDigest: REVIEW_DIGEST,
      },
    },
    deployment: {
      id: "deployment-ticket-40",
      targetUrl: existingUrl,
      artifactDigest: AFTER_DIGEST,
      recordedAt: "2026-07-18T06:00:00.000Z",
    },
    liveVerification: {
      targetUrl: existingUrl,
      canonicalUrl: existingUrl,
      artifactDigest: AFTER_DIGEST,
      recordedAt: "2026-07-18T06:15:00.000Z",
      checks: verifiedLiveChecks(),
    },
    search: {
      notification: {
        status: "submitted",
        target: "https://www.winningadventure.com.au/sitemap.xml",
        recordedAt: "2026-07-18T06:20:00.000Z",
        detail: "Transport accepted a sitemap notification",
      },
      indexation: {
        status: "pending",
        observedAt: null,
        evidence: null,
      },
    },
    metrics: [
      {
        id: "gsc-refresh-clicks",
        status: "unavailable",
        value: null,
        unit: "count",
        sourceLineage: ["google-search-console"],
        reason: "Authenticated post-release data is not attached",
      },
    ],
    rollback: {
      owner: { id: "release-owner", type: "human" },
      artifactDigest: BEFORE_DIGEST,
      triggers: ["Live content differs from the approved refresh artifact"],
      steps: ["Restore the before artifact at the governed URL"],
    },
    reviewPlan: {
      owner: { id: "andy-liu", type: "human" },
      dueAt: null,
      reasons: ["Recheck evidence age before the next factual update"],
    },
    failureReasons: [],
  };
}

describe("refresh publication policy", () => {
  it("accepts a governed refresh that preserves the existing URL", () => {
    const decision = evaluateRefreshPublication(input());

    expect(decision).toEqual(
      expect.objectContaining({
        policy: "refresh_publication",
        state: "live_verified",
        published: true,
        completed: true,
        blockers: [],
      }),
    );
    expect(decision.record.candidate.targetUrl).toBe(
      decision.record.candidate.existingUrl,
    );
    expect(decision.record.beforeArtifactDigest).toBe(BEFORE_DIGEST);
    expect(decision.record.afterArtifactDigest).toBe(AFTER_DIGEST);
    expect(decision.summary).toContain("state=live_verified");
  });

  it("blocks a slug that does not identify the existing URL", () => {
    const fixture = input();
    fixture.candidate.slug = "different-existing-page";

    const decision = evaluateRefreshPublication(fixture);

    expect(decision.state).toBe("blocked");
    expect(decision.blockers).toContain("existing_url_slug_mismatch");
  });

  it("supports a deterministic no-op without claiming publication", () => {
    const fixture = input();
    fixture.claimedState = "no-op";
    fixture.afterArtifactDigest = BEFORE_DIGEST;
    fixture.audit.artifactDigest = BEFORE_DIGEST;
    fixture.gates = verifiedGates();
    for (const gate of PUBLICATION_GATE_NAMES) {
      fixture.gates[gate].artifactDigest = BEFORE_DIGEST;
    }
    fixture.changeReasons = [];
    fixture.changes = {
      evidence: [],
      internalLinks: [],
      metadata: [],
      governedContent: [],
    };
    fixture.approvals = { content: null, production: null };
    fixture.deployment = null;
    fixture.liveVerification = null;
    fixture.rollback.artifactDigest = BEFORE_DIGEST;

    const decision = evaluateRefreshPublication(fixture);

    expect(decision.state).toBe("no-op");
    expect(decision.published).toBe(false);
    expect(decision.completed).toBe(false);
    expect(decision.blockers).toEqual([]);
  });

  it("blocks silent URL changes", () => {
    const fixture = input();
    fixture.candidate.targetUrl =
      "https://www.winningadventure.com.au/article/new-factory-audit-guide";

    const decision = evaluateRefreshPublication(fixture);

    expect(decision.state).toBe("blocked");
    expect(decision.blockers).toContain("url_change_requires_approval");
  });

  it("accepts an explicitly approved URL disposition and verifies that URL", () => {
    const fixture = input();
    const targetUrl =
      "https://www.winningadventure.com.au/article/factory-audit-guide";
    fixture.candidate.targetUrl = targetUrl;
    fixture.candidate.urlDisposition = {
      kind: "change",
      reason: "A separately reviewed migration decision approved this URL",
      approval: {
        actor: { id: "migration-owner", type: "human" },
        recordedAt: "2026-07-18T04:45:00.000Z",
        fromUrl: fixture.candidate.existingUrl,
        toUrl: targetUrl,
        beforeArtifactDigest: BEFORE_DIGEST,
        afterArtifactDigest: AFTER_DIGEST,
        reviewDigest: REVIEW_DIGEST,
      },
      redirectPlan: [
        `${fixture.candidate.existingUrl} -> ${targetUrl} (permanent)`,
      ],
    };
    fixture.deployment!.targetUrl = targetUrl;
    fixture.liveVerification!.targetUrl = targetUrl;
    fixture.liveVerification!.canonicalUrl = targetUrl;

    const decision = evaluateRefreshPublication(fixture);

    expect(decision.state).toBe("live_verified");
    expect(decision.completed).toBe(true);
    expect(decision.record.candidate.urlDisposition.kind).toBe("change");
  });

  it.each(["fact", "case_study", "statistic", "publication_date"] as const)(
    "blocks an unverified %s update instead of inventing a replacement",
    (kind) => {
      const fixture = input();
      fixture.changes.governedContent = [
        {
          kind,
          action: "update",
          verification: "unverified",
          actor: { id: "andy-liu", type: "human" },
          reason: "The proposed replacement has no approved evidence",
        },
      ];

      const decision = evaluateRefreshPublication(fixture);

      expect(decision.state).toBe("blocked");
      expect(decision.blockers).toContain(
        `unverified_content_not_safely_disposed:${kind}`,
      );
    },
  );

  it.each(["remove", "generalize"] as const)(
    "allows a human-reviewed %s disposition for unverified content",
    (action) => {
      const fixture = input();
      fixture.changes.governedContent = [
        {
          kind: "fact",
          action,
          verification: "unverified",
          actor: { id: "andy-liu", type: "human" },
          reason: "The source cannot support a specific public claim",
        },
      ];

      const decision = evaluateRefreshPublication(fixture);
      expect(decision.blockers).not.toContain(
        "unverified_content_not_safely_disposed:fact",
      );
    },
  );

  it("distinguishes ready, validated, approved, deployed, and live verification", () => {
    const readyInput = input();
    readyInput.claimedState = "ready";
    readyInput.gates.schema = {
      status: "not_run",
      detail: "Validation has not run",
      artifactDigest: null,
    };
    readyInput.approvals = { content: null, production: null };
    readyInput.deployment = null;
    readyInput.liveVerification = null;
    expect(evaluateRefreshPublication(readyInput).state).toBe("ready");

    const validatedInput = input();
    validatedInput.claimedState = "validated";
    validatedInput.approvals = { content: null, production: null };
    validatedInput.deployment = null;
    validatedInput.liveVerification = null;
    expect(evaluateRefreshPublication(validatedInput).state).toBe("validated");

    const approvedInput = input();
    approvedInput.claimedState = "approved";
    approvedInput.deployment = null;
    approvedInput.liveVerification = null;
    expect(evaluateRefreshPublication(approvedInput).state).toBe("approved");

    const deployedInput = input();
    deployedInput.claimedState = "deployed";
    deployedInput.liveVerification = null;
    const deployed = evaluateRefreshPublication(deployedInput);
    expect(deployed.state).toBe("deployed");
    expect(deployed.completed).toBe(false);

    expect(evaluateRefreshPublication(input()).state).toBe("live_verified");
  });

  it("blocks digest drift and undeclared artifact changes", () => {
    const approvalDrift = input();
    approvalDrift.approvals.production!.artifactDigest = digest("9");
    const approvalDecision = evaluateRefreshPublication(approvalDrift);
    expect(approvalDecision.state).toBe("blocked");
    expect(approvalDecision.blockers).toContain(
      "production_approval_artifact_digest_mismatch",
    );

    const undeclared = input();
    undeclared.changeReasons = [];
    undeclared.changes = {
      evidence: [],
      internalLinks: [],
      metadata: [],
      governedContent: [],
    };
    const undeclaredDecision = evaluateRefreshPublication(undeclared);
    expect(undeclaredDecision.state).toBe("blocked");
    expect(undeclaredDecision.blockers).toContain(
      "artifact_changed_without_declared_changes",
    );
  });

  it("keeps submitted notifications, pending indexation, and null metrics distinct", () => {
    const decision = evaluateRefreshPublication(input());

    expect(decision.record.search.notification.status).toBe("submitted");
    expect(decision.record.search.indexation.status).toBe("pending");
    expect(decision.record.metrics[0].value).toBeNull();

    const fixture = input();
    fixture.metrics[0].value = 0;
    expect(() => evaluateRefreshPublication(fixture)).toThrow(
      /unavailable.*null/i,
    );
  });

  it("rejects live URL drift from the governed disposition", () => {
    const fixture = input();
    fixture.liveVerification!.canonicalUrl =
      "https://www.winningadventure.com.au/article/another-url";

    const decision = evaluateRefreshPublication(fixture);

    expect(decision.state).toBe("blocked");
    expect(decision.blockers).toContain("live_canonical_url_mismatch");
  });

  it("returns deterministic deeply frozen data", () => {
    const firstInput = input();
    firstInput.changeReasons.reverse();
    firstInput.failureReasons = ["z failure", "a failure"];

    const secondInput = input();
    secondInput.failureReasons = ["a failure", "z failure"];
    secondInput.audit.sourceLineage.reverse();

    const first = evaluateRefreshPublication(firstInput);
    const second = evaluateRefreshPublication(secondInput);

    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.record)).toBe(true);
    expect(Object.isFrozen(first.record.changes)).toBe(true);
    expect(Object.isFrozen(first.record.changes.evidence)).toBe(true);
    expect(Object.isFrozen(first.record.metrics[0])).toBe(true);
  });

  it("rejects unknown privilege-escalation switches", () => {
    const fixture = {
      ...input(),
      skipReview: true,
    } as unknown as RefreshPublicationInput;

    expect(() => evaluateRefreshPublication(fixture)).toThrow(
      /unknown field.*skipReview/i,
    );
  });

  it("contains no ambient time, environment, non-deterministic, or action APIs", () => {
    const source = ["contracts.ts", "refreshPolicy.ts"]
      .map((file) => readFileSync(join(__dirname, file), "utf8"))
      .join("\n");

    expect(source).not.toMatch(/Date\.now|new Date\s*\(/);
    expect(source).not.toMatch(/process\.(env|cwd)/);
    expect(source).not.toMatch(/Math\.random|randomUUID|randomBytes/);
    expect(source).not.toMatch(/\b(force|bypass)\b/i);
    expect(source).not.toMatch(/\b(fetch|axios|exec|spawn)\s*\(/i);
  });
});
