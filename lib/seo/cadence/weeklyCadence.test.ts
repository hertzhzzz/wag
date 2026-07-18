import {
  CADENCE_GATE_IDS,
  WEEKLY_MEASURE_CATEGORIES,
  buildWeeklyCadenceReport,
  renderWeeklyCadenceMarkdown,
  type PublicationEventInput,
  type WeeklyCadenceInput,
  type WeeklyMeasureInput,
} from "./weeklyCadence";

const DIGEST_A = `sha256:${"a".repeat(64)}` as `sha256:${string}`;
const DIGEST_B = `sha256:${"b".repeat(64)}` as `sha256:${string}`;
const DIGEST_C = `sha256:${"c".repeat(64)}` as `sha256:${string}`;
const DIGEST_D = `sha256:${"d".repeat(64)}` as `sha256:${string}`;
const DIGEST_E = `sha256:${"e".repeat(64)}` as `sha256:${string}`;
const DIGEST_F = `sha256:${"f".repeat(64)}` as `sha256:${string}`;
const DIGEST_ONE = `sha256:${"1".repeat(64)}` as `sha256:${string}`;
const DIGEST_TWO = `sha256:${"2".repeat(64)}` as `sha256:${string}`;

function passedGates(): PublicationEventInput["gates"] {
  return Object.fromEntries(
    CADENCE_GATE_IDS.map((id) => [
      id,
      { status: "passed", evidence: `${id} test evidence` },
    ]),
  ) as PublicationEventInput["gates"];
}

function releaseEnvelope(eventId: string, targetUrl: string) {
  return {
    version: 1 as const,
    eventId: `release-${eventId}`,
    dataMode: "synthetic_fixture" as const,
    workflowInstanceId: `workflow-${eventId}`,
    releaseId: `release-${eventId}`,
    artifactDigest: DIGEST_A,
    reportDigest: DIGEST_B,
    rollbackPlanDigest: DIGEST_C,
    approvalEvidence: {
      content: {
        principal: "editor.alice",
        approvedAt: "2026-07-18T04:00:00.000Z",
        bindingDigest: DIGEST_D,
      },
      production: {
        principal: "producer.bob",
        approvedAt: "2026-07-18T04:10:00.000Z",
        bindingDigest: DIGEST_E,
      },
    },
    deploymentEvidence: {
      deploymentId: `deployment-${eventId}`,
      deployedAt: "2026-07-18T05:00:00.000Z",
      destination: targetUrl,
    },
    liveEvidence: {
      verifiedAt: "2026-07-18T05:05:00.000Z",
      checksDigest: DIGEST_F,
    },
    rollbackEvidence: {
      state: "ready" as const,
      planDigest: DIGEST_C,
      postRollbackVerificationRequired: true as const,
    },
    gateEvidenceDigest: DIGEST_ONE,
    eventDigest: DIGEST_TWO,
    provenance: {
      issuer: "trusted-release-control" as const,
      contractVersion: "release-event-v1" as const,
      recordedAt: "2026-07-18T05:06:00.000Z",
    },
  };
}

function event(
  overrides: Partial<PublicationEventInput> &
    Pick<PublicationEventInput, "eventId" | "kind" | "status">,
): PublicationEventInput {
  const targetUrl =
    overrides.targetUrl ??
    (overrides.status === "live_verified"
      ? `https://www.winningadventure.com.au/article/${overrides.eventId}`
      : `/article/${overrides.eventId}`);
  return {
    owner: "Test Owner",
    nextAction:
      overrides.status === "live_verified" ? null : "Resolve the recorded gate",
    artifactDigest: DIGEST_A,
    reviewDigest: DIGEST_B,
    gates: passedGates(),
    failureReasons: [],
    releaseEvent:
      overrides.status === "live_verified"
        ? releaseEnvelope(overrides.eventId, targetUrl)
        : null,
    searchNotification: {
      status:
        overrides.status === "live_verified" ? "submitted" : "not_attempted",
      recordedAt: "2026-07-18T05:10:00.000Z",
      detail: "Test-only observation",
    },
    indexationObservation: { status: "unknown" },
    ...overrides,
    targetUrl,
  };
}

function metric(
  category: WeeklyMeasureInput["category"],
  signalType: WeeklyMeasureInput["signalType"] = "early_operational",
): WeeklyMeasureInput {
  return {
    id: `${category}.test-measure`,
    category,
    label: `${category} test measure`,
    definition: `Raw ${category} test measure for the reporting week.`,
    signalType,
    status: "available",
    kind: "count",
    rawCount: 1,
    numerator: null,
    denominator: null,
    dateRange: { start: "2026-07-13", end: "2026-07-19" },
    sourceLineage: [
      {
        system: "test-fixture",
        dataset: `${category}-dataset`,
        version: "v1",
        asOfDate: "2026-07-19",
      },
    ],
  };
}

function validInput(): WeeklyCadenceInput {
  return {
    version: 1,
    reportId: "weekly-cadence-2026-07-13",
    dataMode: "synthetic_fixture",
    provenance: {
      source: "weekly-cadence-test",
      capturedAt: "2026-07-20T00:00:00Z",
      fixtureId: "weekly-cadence-fixture-2026-07-20",
    },
    generatedAt: "2026-07-20T00:00:00Z",
    week: { start: "2026-07-13", end: "2026-07-19" },
    targetEvents: 2,
    events: [
      event({
        eventId: "high-intent-01",
        kind: "high_intent",
        status: "live_verified",
      }),
      event({
        eventId: "refresh-01",
        kind: "refresh",
        status: "live_verified",
      }),
      event({
        eventId: "failed-01",
        kind: "refresh",
        status: "failed",
        failureReasons: ["build gate failed"],
      }),
      event({
        eventId: "blocked-01",
        kind: "high_intent",
        status: "blocked",
        failureReasons: ["privacy approval missing"],
      }),
      event({
        eventId: "deferred-01",
        kind: "evidence_upgrade",
        status: "deferred",
        failureReasons: ["evidence source unavailable"],
      }),
      event({
        eventId: "rescheduled-01",
        kind: "internal_link_upgrade",
        status: "rescheduled",
        failureReasons: ["review capacity moved to next week"],
      }),
      event({
        eventId: "deployed-not-live",
        kind: "pillar_improvement",
        status: "deployed",
        nextAction: "Complete independent live verification",
      }),
    ],
    measures: WEEKLY_MEASURE_CATEGORIES.map((category) =>
      metric(
        category,
        category === "search" || category === "enquiry"
          ? "lagging_outcome"
          : "early_operational",
      ),
    ),
    capacity: {
      approvedSlots: 2,
      approvedBy: "Test-only human capacity reviewer",
      approvedOn: "2026-07-19",
    },
    queueCandidates: [
      {
        candidateId: "candidate-high-02",
        kind: "high_intent",
        opportunityScore: 91,
        scoreStatus: "available",
        evidenceReady: true,
        destinationApproved: true,
        requiredLinksReady: true,
        owner: "Content Owner",
        nextAction: "Prepare governed brief",
        blockers: [],
      },
      {
        candidateId: "candidate-refresh-02",
        kind: "refresh",
        opportunityScore: 88,
        scoreStatus: "available",
        evidenceReady: true,
        destinationApproved: true,
        requiredLinksReady: true,
        owner: "Content Owner",
        nextAction: "Prepare refresh brief",
        blockers: [],
      },
      {
        candidateId: "candidate-blocked",
        kind: "high_intent",
        opportunityScore: null,
        scoreStatus: "unavailable",
        evidenceReady: false,
        destinationApproved: false,
        requiredLinksReady: false,
        owner: "Research Owner",
        nextAction: "Collect evidence and approve the destination",
        blockers: ["destination approval missing", "score inputs unavailable"],
      },
    ],
    scaleEvidence: {
      consecutiveCompliantWeeks: 1,
      qualityGatesDemonstrated: true,
      safetyGatesDemonstrated: true,
      reviewThroughputSustainable: false,
    },
  };
}

describe("weekly cadence report", () => {
  it("counts only fully gated live-verified events as completed output", () => {
    const report = buildWeeklyCadenceReport(validInput());

    expect(report.summary.completedCount).toBe(0);
    expect(report.summary.syntheticFixtureCompletedCount).toBe(2);
    expect(report.summary.actualCompletedCount).toBe(0);
    expect(report.summary.completedCountSource).toBe("none");
    expect(report.summary.targetMet).toBe(false);
    expect(report.events.completed.map(({ eventId }) => eventId)).toEqual([
      "high-intent-01",
      "refresh-01",
    ]);
    expect(report.events.pending.map(({ eventId }) => eventId)).toContain(
      "deployed-not-live",
    );
    expect(report.events.completed.map(({ eventId }) => eventId)).not.toContain(
      "deployed-not-live",
    );
  });

  it("keeps failed, blocked, deferred, and rescheduled work separate with owners and next actions", () => {
    const report = buildWeeklyCadenceReport(validInput());

    expect(report.events.failed.map(({ eventId }) => eventId)).toEqual([
      "failed-01",
    ]);
    expect(report.events.blocked.map(({ eventId }) => eventId)).toEqual([
      "blocked-01",
    ]);
    expect(report.events.deferred.map(({ eventId }) => eventId)).toEqual([
      "deferred-01",
    ]);
    expect(report.events.rescheduled.map(({ eventId }) => eventId)).toEqual([
      "rescheduled-01",
    ]);
    for (const item of [
      ...report.events.failed,
      ...report.events.blocked,
      ...report.events.deferred,
      ...report.events.rescheduled,
      ...report.events.pending,
    ]) {
      expect(item.owner).toBeTruthy();
      expect(item.nextAction).toBeTruthy();
    }
  });

  it("rejects a false live-verified claim when any required gate did not pass", () => {
    const input = validInput();
    input.events[0].gates = {
      ...input.events[0].gates,
      evidence: { status: "blocked", evidence: "approval missing" },
    };

    expect(() => buildWeeklyCadenceReport(input)).toThrow(
      /live_verified.*all required gates/i,
    );
  });

  it("does not treat a submitted search notification as indexation", () => {
    const report = buildWeeklyCadenceReport(validInput());
    const completed = report.events.completed[0];

    expect(completed.searchNotification.status).toBe("submitted");
    expect(completed.indexationObservation.status).toBe("unknown");
  });

  it("preserves definitions, raw counts, date ranges, and source lineage across all seven measure categories", () => {
    const report = buildWeeklyCadenceReport(validInput());

    expect(report.measures.map(({ category }) => category)).toEqual(
      WEEKLY_MEASURE_CATEGORIES,
    );
    for (const measure of report.measures) {
      expect(measure.definition).toBeTruthy();
      expect(measure.rawCount).toBe(1);
      expect(measure.dateRange).toEqual({
        start: "2026-07-13",
        end: "2026-07-19",
      });
      expect(measure.sourceLineage).toHaveLength(1);
    }
    expect(report.signals.earlyOperational).not.toHaveLength(0);
    expect(report.signals.laggingOutcomes).not.toHaveLength(0);
  });

  it("keeps unavailable measures null rather than converting them to zero", () => {
    const input = validInput();
    input.measures[0] = {
      ...input.measures[0],
      status: "missing",
      rawCount: null,
    };

    const report = buildWeeklyCadenceReport(input);
    expect(report.measures[0].rawCount).toBeNull();

    const fabricated = validInput();
    fabricated.measures[0] = {
      ...fabricated.measures[0],
      status: "missing",
      rawCount: 0,
    };
    expect(() => buildWeeklyCadenceReport(fabricated)).toThrow(
      /unavailable.*null/i,
    );
  });

  it("regenerates a deterministic mixed next-week queue from readiness and approved capacity", () => {
    const report = buildWeeklyCadenceReport(validInput());

    expect(
      report.nextWeekQueue.selected.map(({ candidateId }) => candidateId),
    ).toEqual(["candidate-high-02", "candidate-refresh-02"]);
    expect(
      report.nextWeekQueue.deferred.map(({ candidateId }) => candidateId),
    ).toEqual(["candidate-blocked"]);
    expect(report.nextWeekQueue.approvedCapacity).toBe(2);
    expect(report.nextWeekQueue.selectedCapacity).toBe(2);
  });

  it("never recommends automatic scaling and caps selected capacity before eight compliant weeks", () => {
    const report = buildWeeklyCadenceReport(validInput());

    expect(report.scaleAssessment.decision).toBe("hold");
    expect(report.scaleAssessment.automaticIncrease).toBe(false);
    expect(report.scaleAssessment.recommendedCapacity).toBe(2);
    expect(report.scaleAssessment.selectedCapacity).toBe(2);

    const eligible = validInput();
    eligible.scaleEvidence = {
      consecutiveCompliantWeeks: 8,
      qualityGatesDemonstrated: true,
      safetyGatesDemonstrated: true,
      reviewThroughputSustainable: true,
    };
    const eligibleReport = buildWeeklyCadenceReport(eligible);
    expect(eligibleReport.scaleAssessment.decision).toBe(
      "eligible_for_human_review",
    );
    expect(eligibleReport.scaleAssessment.automaticIncrease).toBe(false);
    expect(eligibleReport.scaleAssessment.recommendedCapacity).toBe(2);
    expect(eligibleReport.scaleAssessment.selectedCapacity).toBe(2);
  });

  it("keeps a three-slot recommendation separate from the two-slot hold selection", () => {
    const input = validInput();
    input.capacity.approvedSlots = 3;
    input.queueCandidates.push({
      candidateId: "candidate-third",
      kind: "refresh",
      opportunityScore: 87,
      scoreStatus: "available",
      evidenceReady: true,
      destinationApproved: true,
      requiredLinksReady: true,
      owner: "Content Owner",
      nextAction: "Prepare governed brief",
      blockers: [],
    });
    const report = buildWeeklyCadenceReport(input);
    expect(report.scaleAssessment.decision).toBe("hold");
    expect(report.nextWeekQueue.recommendedCapacity).toBe(3);
    expect(report.nextWeekQueue.selectedCapacity).toBe(2);
    expect(report.nextWeekQueue.selected).toHaveLength(2);
  });

  it("rejects unapproved capacity", () => {
    const missingApproval = validInput();
    missingApproval.capacity.approvedBy = null;
    expect(() => buildWeeklyCadenceReport(missingApproval)).toThrow(
      /approvedBy/i,
    );
  });

  it("is deterministic, deeply frozen, and renders an explicit synthetic-fixture report", () => {
    const first = buildWeeklyCadenceReport(validInput());
    const second = buildWeeklyCadenceReport(validInput());

    expect(second).toEqual(first);
    expect(first.reportDigest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.events.completed)).toBe(true);
    expect(Object.isFrozen(first.measures[0].sourceLineage)).toBe(true);

    const markdown = renderWeeklyCadenceMarkdown(first);
    expect(markdown).toContain("Synthetic-fixture operating report");
    expect(markdown).toContain("Verified actual completed: 0/2");
    expect(markdown).toContain("Synthetic fixture completed: 2");
    expect(markdown).toContain("Publication event gate checklist");
    expect(markdown).toContain("schema=passed");
    expect(markdown).toContain("Seven measurement categories");
    expect(markdown).toContain("content test measure");
    expect(markdown).toContain("test-fixture/content-dataset@v1");
    expect(markdown).toContain(
      "Submitted search notifications are not indexation proof",
    );
    expect(markdown).toContain("No automatic publishing-volume increase");
  });
});
