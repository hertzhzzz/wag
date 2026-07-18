import {
  CADENCE_GATE_IDS,
  buildWeeklyCadenceReport,
  renderWeeklyCadenceMarkdown,
  type PublicationEventInput,
  type WeeklyCadenceInput,
} from "./weeklyCadence";

const DIGEST_A = `sha256:${"a".repeat(64)}`;
const DIGEST_B = `sha256:${"b".repeat(64)}`;
const DIGEST_C = `sha256:${"c".repeat(64)}`;

function passedGates(): Record<string, unknown> {
  return Object.fromEntries(
    CADENCE_GATE_IDS.map((id) => [
      id,
      { status: "passed", evidence: `${id} evidence` },
    ]),
  );
}

function releaseEnvelope(
  dataMode: "actual" | "synthetic_fixture" = "synthetic_fixture",
) {
  return {
    version: 1,
    eventId: "release-event.hardening-01",
    dataMode,
    workflowInstanceId: "workflow.hardening-01",
    releaseId: "release.hardening-01",
    artifactDigest: DIGEST_A,
    reportDigest: DIGEST_B,
    rollbackPlanDigest: DIGEST_C,
    approvalEvidence: {
      content: {
        principal: "editor.alice",
        approvedAt: "2026-07-18T04:00:00.000Z",
        bindingDigest: `sha256:${"d".repeat(64)}`,
      },
      production: {
        principal: "producer.bob",
        approvedAt: "2026-07-18T04:10:00.000Z",
        bindingDigest: `sha256:${"e".repeat(64)}`,
      },
    },
    deploymentEvidence: {
      deploymentId: "deployment.hardening-01",
      deployedAt: "2026-07-18T05:00:00.000Z",
      destination: "https://www.winningadventure.com.au/article/example",
    },
    liveEvidence: {
      verifiedAt: "2026-07-18T05:05:00.000Z",
      checksDigest: `sha256:${"f".repeat(64)}`,
    },
    rollbackEvidence: {
      state: "ready",
      planDigest: DIGEST_C,
      postRollbackVerificationRequired: true,
    },
    gateEvidenceDigest: `sha256:${"1".repeat(64)}`,
    eventDigest: `sha256:${"2".repeat(64)}`,
    provenance: {
      issuer: "trusted-release-control",
      contractVersion: "release-event-v1",
      recordedAt: "2026-07-18T05:06:00.000Z",
    },
  };
}

function event(overrides: Record<string, unknown> = {}): PublicationEventInput {
  return {
    eventId: "event.hardening-01",
    kind: "high_intent",
    status: "live_verified",
    targetUrl: "https://www.winningadventure.com.au/article/example",
    owner: "Growth Owner",
    nextAction: null,
    artifactDigest: DIGEST_A,
    reviewDigest: DIGEST_B,
    gates: passedGates(),
    failureReasons: [],
    releaseEvent: releaseEnvelope(),
    searchNotification: {
      status: "not_attempted",
      recordedAt: "2026-07-18T05:10:00.000Z",
      detail: "No submission requested",
    },
    indexationObservation: {
      status: "observed_indexed",
      observedAt: "2026-07-18T06:00:00.000Z",
      evidence: "Independent observation",
    },
    ...overrides,
  } as unknown as PublicationEventInput;
}

function candidate(candidateId: string) {
  return {
    candidateId,
    kind: "high_intent",
    opportunityScore: 90,
    scoreStatus: "available",
    evidenceReady: true,
    destinationApproved: true,
    requiredLinksReady: true,
    owner: "Queue Owner",
    nextAction: "Prepare governed brief",
    blockers: [],
  };
}

function baseInput(
  overrides: Record<string, unknown> = {},
): WeeklyCadenceInput {
  const measures = [
    "content",
    "search",
    "geo",
    "graph",
    "evidence",
    "review",
    "enquiry",
  ].map((category) => ({
    id: `${category}.hardening`,
    category,
    label: `${category} measure`,
    definition: `Definition for ${category}`,
    signalType:
      category === "search" || category === "enquiry"
        ? "lagging_outcome"
        : "early_operational",
    status: "available",
    kind: "count",
    rawCount: 1,
    numerator: null,
    denominator: null,
    dateRange: { start: "2026-07-13", end: "2026-07-18" },
    sourceLineage: [
      {
        system: "hardening-fixture",
        dataset: `${category}.dataset`,
        version: "v1",
        asOfDate: "2026-07-18",
      },
    ],
  }));

  return {
    version: 1,
    reportId: "weekly-cadence-hardening-2026-07-13",
    dataMode: "synthetic_fixture",
    provenance: {
      source: "weekly-cadence-hardening",
      capturedAt: "2026-07-18T07:00:00.000Z",
      fixtureId: "cadence-fixture-2026-07-18",
    },
    generatedAt: "2026-07-18T07:00:00.000Z",
    week: { start: "2026-07-13", end: "2026-07-18" },
    targetEvents: 1,
    events: [event()],
    measures,
    capacity: {
      approvedSlots: 2,
      approvedBy: "capacity.reviewer",
      approvedOn: "2026-07-18",
    },
    queueCandidates: [candidate("candidate-01"), candidate("candidate-02")],
    scaleEvidence: {
      consecutiveCompliantWeeks: 1,
      qualityGatesDemonstrated: true,
      safetyGatesDemonstrated: true,
      reviewThroughputSustainable: false,
    },
    ...overrides,
  } as unknown as WeeklyCadenceInput;
}

describe("weekly cadence hardening", () => {
  it("uses an explicit provenance/asOf boundary and never reads ambient clock", () => {
    const nowSpy = jest.spyOn(Date, "now").mockImplementation(() => {
      throw new Error("ambient clock must not be read");
    });

    try {
      const report = buildWeeklyCadenceReport(baseInput());

      expect(report.audit.asOf).toBe("2026-07-18T07:00:00.000Z");
    } finally {
      nowSpy.mockRestore();
    }
  });

  it("rejects an actual report whose explicit asOf is after July 18, 2026", () => {
    expect(() =>
      buildWeeklyCadenceReport(
        baseInput({
          dataMode: "actual",
          provenance: {
            source: "production-adapter",
            capturedAt: "2026-07-18T07:00:00.000Z",
          },
          events: [event({ releaseEvent: releaseEnvelope("actual") })],
        }),
        {
          asOf: "2099-01-01T00:00:00.000Z",
        },
      ),
    ).toThrow(/future|asOf/i);
  });
  it("rejects a caller-fabricated actual release envelope instead of trusting live_verified/status", () => {
    const input = baseInput({
      dataMode: "actual",
      provenance: {
        source: "production-adapter",
        capturedAt: "2026-07-18T07:00:00.000Z",
      },
      events: [
        event({
          releaseEvent: releaseEnvelope("actual"),
          status: "live_verified",
        }),
      ],
    });

    expect(() => buildWeeklyCadenceReport(input)).toThrow(
      /trusted.*release|adapter|attestation|provenance/i,
    );
  });

  it("keeps synthetic fixture completion separate from actual completion", () => {
    const report = buildWeeklyCadenceReport(baseInput());

    expect(report.summary.completedCount).toBe(0);
    expect(report.summary.actualCompletedCount).toBe(0);
    expect(report.summary.syntheticFixtureCompletedCount).toBe(1);
    expect(report.summary.completedCountSource).toBe("none");
    expect(report.summary.targetMet).toBe(false);
  });

  it("keeps search notification and indexation as independent observations", () => {
    const report = buildWeeklyCadenceReport(
      baseInput({
        events: [
          event({
            searchNotification: {
              status: "submitted",
              recordedAt: "2026-07-18T05:10:00.000Z",
              detail: "Submission recorded independently",
            },
            indexationObservation: {
              status: "observed_indexed",
              observedAt: "2026-07-18T06:00:00.000Z",
              evidence: "Independent indexation observation",
            },
          }),
        ],
      }),
    );
    const completed = report.events.completed[0];

    expect(completed.searchNotification.status).toBe("submitted");
    expect(completed.indexationObservation.status).toBe("observed_indexed");
  });

  it("rejects recursive unknown keys instead of silently dropping them", () => {
    const envelope = releaseEnvelope();
    (envelope.approvalEvidence.content as Record<string, unknown>).unexpected =
      "must be rejected";

    expect(() =>
      buildWeeklyCadenceReport(
        baseInput({ events: [event({ releaseEvent: envelope })] }),
      ),
    ).toThrow(/approvalEvidence\.content.*exactly/i);

    expect(() =>
      buildWeeklyCadenceReport(
        baseInput({
          provenance: {
            source: "weekly-cadence-hardening",
            capturedAt: "2026-07-18T07:00:00.000Z",
            fixtureId: "cadence-fixture-2026-07-18",
            unexpected: "must be rejected",
          },
        }),
      ),
    ).toThrow(/provenance.*exactly/i);
  });

  it("rejects local timestamps without an explicit UTC Z suffix", () => {
    expect(() =>
      buildWeeklyCadenceReport(
        baseInput({ generatedAt: "2026-07-18T07:00:00+09:30" }),
      ),
    ).toThrow(/UTC timestamp ending in Z/i);

    expect(() =>
      buildWeeklyCadenceReport(
        baseInput({
          events: [
            event({
              searchNotification: {
                status: "submitted",
                recordedAt: "2026-07-18T05:10:00",
                detail: "Local timestamp must fail",
              },
            }),
          ],
        }),
      ),
    ).toThrow(/UTC timestamp ending in Z/i);
  });

  it("rejects impossible calendar timestamps even when they end in Z", () => {
    expect(() =>
      buildWeeklyCadenceReport(
        baseInput({ generatedAt: "2026-02-30T07:00:00.000Z" }),
      ),
    ).toThrow(/valid calendar timestamp/i);
  });

  it.each([
    "https://user:secret@www.winningadventure.com.au/article/example",
    "https://www.winningadventure.com.au/article/example?token=secret",
    "https://www.winningadventure.com.au/article/example#private",
  ])("rejects unsafe target URLs: %s", (targetUrl) => {
    expect(() =>
      buildWeeklyCadenceReport(
        baseInput({
          events: [
            event({
              status: "draft",
              targetUrl,
              nextAction: "Complete review",
              releaseEvent: null,
            }),
          ],
        }),
      ),
    ).toThrow(/without credentials, query, or fragment/i);
  });

  it("hard-caps selected queue capacity at two while scale decision is hold", () => {
    const report = buildWeeklyCadenceReport(
      baseInput({
        capacity: {
          approvedSlots: 3,
          approvedBy: "capacity.reviewer",
          approvedOn: "2026-07-18",
        },
        queueCandidates: [
          candidate("candidate-01"),
          candidate("candidate-02"),
          candidate("candidate-03"),
        ],
      }),
    );

    expect(report.scaleAssessment.decision).toBe("hold");
    expect(report.nextWeekQueue.recommendedCapacity).toBeDefined();
    expect(report.nextWeekQueue.selectedCapacity).toBeLessThanOrEqual(2);
    expect(report.nextWeekQueue.selected).toHaveLength(2);
  });

  it("deep-freezes the report so runtime mutation cannot alter audit data", () => {
    const report = buildWeeklyCadenceReport(baseInput());
    const originalOwner = report.events.completed[0].owner;
    const originalDigest = report.audit.eventDigests[0];

    try {
      (report.events.completed[0] as { owner: string }).owner = "mutated-owner";
    } catch {
      // Strict-mode assignment to a frozen record throws; either outcome is safe.
    }
    try {
      (report.audit.eventDigests as string[])[0] = "mutated-digest";
    } catch {
      // The immutable audit array rejects writes at runtime.
    }

    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.events.completed[0])).toBe(true);
    expect(Object.isFrozen(report.audit.eventDigests)).toBe(true);
    expect(report.events.completed[0].owner).toBe(originalOwner);
    expect(report.audit.eventDigests[0]).toBe(originalDigest);
  });

  it("escapes HTML metacharacters in markdown and exposes audit evidence", () => {
    const report = buildWeeklyCadenceReport(
      baseInput({
        events: [event({ owner: '<script>alert("x")</script>&owner' })],
      }),
    );
    const markdown = renderWeeklyCadenceMarkdown(report);

    expect(markdown).toContain(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;owner",
    );
    expect(markdown).not.toContain('<script>alert("x")</script>&owner');
    expect(markdown).toMatch(
      /approval|digest|gate evidence|capacity approval|audit/i,
    );
  });
});
