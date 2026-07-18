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
  evaluateHighIntentPublication,
  type HighIntentPublicationInput,
} from "./highIntentPolicy";

const digest = (character: string): Sha256Digest =>
  `sha256:${character.repeat(64)}` as Sha256Digest;

const ARTIFACT_DIGEST = digest("a");
const REVIEW_DIGEST = digest("b");
const SOURCE_DIGEST = digest("c");

function verifiedGates(): PublicationGateResults {
  return Object.fromEntries(
    PUBLICATION_GATE_NAMES.map((name) => [
      name,
      {
        status: "verified",
        detail: `${name} was verified by its owning contract`,
        artifactDigest: ARTIFACT_DIGEST,
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

function input(): HighIntentPublicationInput {
  const targetUrl =
    "https://www.winningadventure.com.au/article/verify-chinese-supplier";

  return {
    version: 1,
    eventId: "ticket-39-supplier-verification",
    claimedState: "live_verified",
    candidate: {
      query: "how to verify a chinese supplier for an australian buyer",
      intent: "commercial investigation",
      cluster: "supplier-verification",
      targetUrl,
      pageType: "high_intent_article",
    },
    gates: verifiedGates(),
    audit: {
      artifactDigest: ARTIFACT_DIGEST,
      reviewDigest: REVIEW_DIGEST,
      sourceLineage: [
        {
          id: "source-evidence",
          kind: "evidence",
          reference: "evidence-registry:supplier-verification-001",
          digest: SOURCE_DIGEST,
        },
        {
          id: "source-brief",
          kind: "brief",
          reference: "brief:ticket-39-supplier-verification",
          digest: REVIEW_DIGEST,
        },
      ],
    },
    approvals: {
      content: {
        actor: { id: "andy-liu", type: "human" },
        recordedAt: "2026-07-18T03:00:00.000Z",
        artifactDigest: ARTIFACT_DIGEST,
        reviewDigest: REVIEW_DIGEST,
      },
      production: {
        actor: { id: "release-owner", type: "human" },
        recordedAt: "2026-07-18T03:30:00.000Z",
        artifactDigest: ARTIFACT_DIGEST,
        reviewDigest: REVIEW_DIGEST,
      },
    },
    deployment: {
      id: "deployment-ticket-39",
      targetUrl,
      artifactDigest: ARTIFACT_DIGEST,
      recordedAt: "2026-07-18T04:00:00.000Z",
    },
    liveVerification: {
      targetUrl,
      canonicalUrl: targetUrl,
      artifactDigest: ARTIFACT_DIGEST,
      recordedAt: "2026-07-18T04:15:00.000Z",
      checks: verifiedLiveChecks(),
    },
    search: {
      notification: {
        status: "submitted",
        target: "https://www.winningadventure.com.au/sitemap.xml",
        recordedAt: "2026-07-18T04:20:00.000Z",
        detail: "Transport accepted a sitemap notification",
      },
      indexation: {
        status: "unknown",
        observedAt: null,
        evidence: null,
      },
    },
    metrics: [
      {
        id: "gsc-non-brand-clicks",
        status: "unavailable",
        value: null,
        unit: "count",
        sourceLineage: ["google-search-console"],
        reason: "No authenticated observation is attached to this scaffold",
      },
    ],
    rollback: {
      owner: { id: "release-owner", type: "human" },
      artifactDigest: ARTIFACT_DIGEST,
      triggers: ["Live content differs from the approved artifact"],
      steps: ["Restore the last independently approved artifact"],
    },
    reviewPlan: {
      owner: { id: "andy-liu", type: "human" },
      dueAt: null,
      reasons: ["Recheck evidence and service boundaries before reuse"],
    },
    failureReasons: [],
  };
}

describe("high-intent publication policy", () => {
  it("accepts a fully evidenced live verification record without performing publication", () => {
    const decision = evaluateHighIntentPublication(input());

    expect(decision).toEqual(
      expect.objectContaining({
        policy: "high_intent_publication",
        state: "live_verified",
        eligible: true,
        published: true,
        completed: true,
        blockers: [],
      }),
    );
    expect(decision.record.candidate).toEqual(
      expect.objectContaining({
        query: expect.any(String),
        intent: expect.any(String),
        cluster: "supplier-verification",
        targetUrl:
          "https://www.winningadventure.com.au/article/verify-chinese-supplier",
        pageType: "high_intent_article",
      }),
    );
    expect(
      decision.record.audit.sourceLineage.map((entry) => entry.id),
    ).toEqual(["source-brief", "source-evidence"]);
    expect(decision.summary).toContain("state=live_verified");
    expect(decision.summaryDigest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it.each(["query", "intent", "cluster", "targetUrl", "pageType"] as const)(
    "rejects a candidate without an explicit %s",
    (field) => {
      const fixture = input();
      fixture.candidate[field] = "" as never;

      expect(() => evaluateHighIntentPublication(fixture)).toThrow(
        new RegExp(`candidate\\.${field}`, "i"),
      );
    },
  );

  it("rejects missing or blocked governed gates", () => {
    const fixture = input();
    fixture.gates.evidence = {
      status: "blocked",
      detail: "First-party evidence approval is unresolved",
      artifactDigest: null,
    };
    fixture.gates.metadata = {
      status: "missing",
      detail: "Metadata validation output is absent",
      artifactDigest: null,
    };

    const decision = evaluateHighIntentPublication(fixture);

    expect(decision.state).toBe("draft");
    expect(decision.eligible).toBe(false);
    expect(decision.completed).toBe(false);
    expect(decision.blockers).toEqual([
      "gate_blocked:evidence",
      "gate_missing:metadata",
    ]);
  });

  it("does not treat deployment as publication completion", () => {
    const fixture = input();
    fixture.claimedState = "deployed";
    fixture.liveVerification = null;

    const decision = evaluateHighIntentPublication(fixture);

    expect(decision.state).toBe("deployed");
    expect(decision.published).toBe(false);
    expect(decision.completed).toBe(false);
  });

  it("keeps search notification submission separate from indexation", () => {
    const decision = evaluateHighIntentPublication(input());

    expect(decision.record.search.notification.status).toBe("submitted");
    expect(decision.record.search.indexation).toEqual({
      status: "unknown",
      observedAt: null,
      evidence: null,
    });
  });

  it("preserves unavailable metrics as null and rejects zero substitution", () => {
    const decision = evaluateHighIntentPublication(input());
    expect(decision.record.metrics[0]).toEqual(
      expect.objectContaining({ status: "unavailable", value: null }),
    );

    const fixture = input();
    fixture.metrics[0].value = 0;
    expect(() => evaluateHighIntentPublication(fixture)).toThrow(
      /unavailable.*null/i,
    );
  });

  it("rejects approval digest drift and cannot advance past validation", () => {
    const fixture = input();
    fixture.claimedState = "approved";
    fixture.deployment = null;
    fixture.liveVerification = null;
    fixture.approvals.content!.artifactDigest = digest("d");

    const decision = evaluateHighIntentPublication(fixture);

    expect(decision.state).toBe("validated");
    expect(decision.completed).toBe(false);
    expect(decision.blockers).toContain(
      "content_approval_artifact_digest_mismatch",
    );
  });

  it("rejects deployment URL drift from the governed target", () => {
    const fixture = input();
    fixture.claimedState = "deployed";
    fixture.liveVerification = null;
    fixture.deployment!.targetUrl =
      "https://www.winningadventure.com.au/article/different-target";

    const decision = evaluateHighIntentPublication(fixture);

    expect(decision.state).toBe("approved");
    expect(decision.blockers).toContain("deployment_target_url_mismatch");
  });

  it("returns a deterministic deeply frozen record and summary", () => {
    const firstInput = input();
    firstInput.failureReasons = ["z correction", "a correction"];
    firstInput.rollback.triggers = ["z trigger", "a trigger"];

    const secondInput = input();
    secondInput.failureReasons = ["a correction", "z correction"];
    secondInput.rollback.triggers = ["a trigger", "z trigger"];
    secondInput.audit.sourceLineage.reverse();

    const first = evaluateHighIntentPublication(firstInput);
    const second = evaluateHighIntentPublication(secondInput);

    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.record)).toBe(true);
    expect(Object.isFrozen(first.record.audit.sourceLineage)).toBe(true);
    expect(Object.isFrozen(first.record.audit.sourceLineage[0])).toBe(true);
    expect(Object.isFrozen(first.blockers)).toBe(true);
  });

  it("rejects unknown privilege-escalation switches", () => {
    const fixture = {
      ...input(),
      skipApprovals: true,
    } as unknown as HighIntentPublicationInput;

    expect(() => evaluateHighIntentPublication(fixture)).toThrow(
      /unknown field.*skipApprovals/i,
    );
  });

  it("contains no ambient time, environment, non-deterministic, or action APIs", () => {
    const source = ["contracts.ts", "highIntentPolicy.ts"]
      .map((file) => readFileSync(join(__dirname, file), "utf8"))
      .join("\n");

    expect(source).not.toMatch(/Date\.now|new Date\s*\(/);
    expect(source).not.toMatch(/process\.(env|cwd)/);
    expect(source).not.toMatch(/Math\.random|randomUUID|randomBytes/);
    expect(source).not.toMatch(/\b(force|bypass)\b/i);
    expect(source).not.toMatch(/\b(fetch|axios|exec|spawn)\s*\(/i);
  });
});
