import {
  LIVE_VERIFICATION_CHECKS,
  RELEASE_PREFLIGHT_CHECKS,
  approveContentRelease,
  approveProductionRelease,
  createApprovalAttestation,
  digestRollbackPlan,
  prepareRelease,
  recordDeployment,
  recordLiveVerification,
  type ApprovalActor,
  type CurrentReleaseIdentity,
  type LiveVerificationResults,
  type ReleasePreflightResults,
  type ReleaseWorkflow,
  type RollbackPlan,
  type Sha256Digest,
} from "../release/releaseContract";
import {
  CADENCE_GATE_IDS,
  WEEKLY_MEASURE_CATEGORIES,
  adaptReleaseWorkflowToPublicationEvent,
  buildWeeklyCadenceReport,
  isTrustedPublicationReleaseEvent,
  type CadenceGateInput,
  type PublicationEventInput,
  type WeeklyCadenceInput,
  type WeeklyMeasureInput,
} from "./weeklyCadence";

const ARTIFACT_DIGEST = `sha256:${"a".repeat(64)}` as Sha256Digest;
const ROLLBACK_ARTIFACT_DIGEST = `sha256:${"b".repeat(64)}` as Sha256Digest;

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

function preflightChecks(): ReleasePreflightResults {
  return Object.fromEntries(
    RELEASE_PREFLIGHT_CHECKS.map((check) => [
      check,
      { status: "passed", detail: `${check} passed` },
    ]),
  ) as ReleasePreflightResults;
}

function liveChecks(): LiveVerificationResults {
  return Object.fromEntries(
    LIVE_VERIFICATION_CHECKS.map((check) => [
      check,
      { status: "passed", detail: `${check} passed` },
    ]),
  ) as LiveVerificationResults;
}

function rollbackPlan(): RollbackPlan {
  const plan = {
    planId: "rollback.adapter-01",
    state: "ready" as const,
    readiness: "ready" as const,
    targetArtifactDigest: ROLLBACK_ARTIFACT_DIGEST,
    targetDestination: "https://www.winningadventure.com.au",
    verificationRequired: true as const,
  };
  return { ...plan, planDigest: digestRollbackPlan(plan) };
}

function approvedInput(
  workflow: ReleaseWorkflow,
  kind: "content" | "production",
  actor: ApprovalActor,
  approvedAt: string,
) {
  return {
    ...identity(workflow),
    kind,
    actor,
    approvedAt,
    attestation: createApprovalAttestation(workflow, kind, actor, approvedAt),
  };
}

function actualLiveVerifiedWorkflow(): ReleaseWorkflow {
  const prepared = prepareRelease({
    releaseId: "release.adapter-01",
    artifactDigest: ARTIFACT_DIGEST,
    workflowInstanceId: "workflow.adapter-01",
    preparedAt: "2026-07-18T03:00:00.000Z",
    approvalNonce: "nonce.adapter-01",
    dataMode: "actual",
    provenance: {
      issuer: "trusted-release-control",
      contractVersion: "release-provenance-v1",
      source: "release-adapter-test",
      recordedAt: "2026-07-18T03:00:00.000Z",
    },
    rollbackPlan: rollbackPlan(),
    review: {
      affectedUrls: ["https://www.winningadventure.com.au/article/example"],
      contentChanges: ["Refresh governed copy"],
      graphChanges: ["Preserve graph relationship"],
      attributionChanges: ["No attribution change"],
      risks: ["Search snippets may change"],
      previewDestination:
        "https://preview.winningadventure.com.au/releases/adapter-01",
      preflightChecks: preflightChecks(),
    },
  });
  const content = approveContentRelease(
    prepared,
    approvedInput(
      prepared,
      "content",
      { id: "editor.alice", type: "human" },
      "2026-07-18T04:00:00.000Z",
    ),
    identity(prepared),
  );
  const production = approveProductionRelease(
    content,
    approvedInput(
      content,
      "production",
      { id: "release.bob", type: "human" },
      "2026-07-18T05:00:00.000Z",
    ),
    identity(content),
  );
  const deployed = recordDeployment(
    production,
    {
      deploymentId: "deployment.adapter-01",
      destination: "https://www.winningadventure.com.au/article/example",
      deployedAt: "2026-07-18T06:00:00.000Z",
    },
    identity(production),
  );
  return recordLiveVerification(
    deployed,
    {
      verifiedAt: "2026-07-18T06:10:00.000Z",
      checks: liveChecks(),
    },
    identity(deployed),
  );
}

function passedCadenceGates(): Record<string, CadenceGateInput> {
  return Object.fromEntries(
    CADENCE_GATE_IDS.map((gate) => [
      gate,
      { status: "passed", evidence: `${gate} adapter evidence` },
    ]),
  );
}

function measures(): WeeklyMeasureInput[] {
  return WEEKLY_MEASURE_CATEGORIES.map((category) => ({
    id: `${category}.adapter-observation`,
    category,
    label: `${category} adapter observation`,
    definition: `Raw ${category} observation for the adapter test week.`,
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
        system: "release-adapter-test",
        dataset: `${category}.adapter`,
        version: "v1",
        asOfDate: "2026-07-18",
      },
    ],
  }));
}

function actualCadenceInput(
  releaseEvent: PublicationEventInput["releaseEvent"],
): WeeklyCadenceInput {
  if (!releaseEvent)
    throw new Error("releaseEvent is required by this fixture.");
  return {
    version: 1,
    reportId: "weekly-cadence-adapter-2026-07-18",
    dataMode: "actual",
    provenance: {
      source: "release-adapter-test",
      capturedAt: "2026-07-18T06:40:00.000Z",
    },
    generatedAt: "2026-07-18T06:35:00.000Z",
    week: { start: "2026-07-13", end: "2026-07-18" },
    targetEvents: 1,
    events: [
      {
        eventId: "publication.adapter-01",
        kind: "high_intent",
        status: "live_verified",
        targetUrl: releaseEvent.deploymentEvidence.destination,
        owner: "Growth Owner",
        nextAction: null,
        artifactDigest: releaseEvent.artifactDigest,
        reviewDigest: releaseEvent.reportDigest,
        gates: passedCadenceGates() as PublicationEventInput["gates"],
        failureReasons: [],
        releaseEvent,
        searchNotification: {
          status: "submitted",
          recordedAt: "2026-07-18T06:30:00.000Z",
          detail: "Submission recorded after live verification",
        },
        indexationObservation: { status: "unknown" },
      },
    ],
    measures: measures(),
    capacity: {
      approvedSlots: 2,
      approvedBy: "capacity.reviewer",
      approvedOn: "2026-07-18",
    },
    queueCandidates: [],
    scaleEvidence: {
      consecutiveCompliantWeeks: 1,
      qualityGatesDemonstrated: true,
      safetyGatesDemonstrated: true,
      reviewThroughputSustainable: false,
    },
  };
}

describe("release workflow publication event adapter", () => {
  it("counts an actual completion only through a trusted live-verified release adapter", () => {
    const workflow = actualLiveVerifiedWorkflow();
    const releaseEvent = adaptReleaseWorkflowToPublicationEvent(workflow, {
      eventId: "release-event.adapter-01",
      recordedAt: "2026-07-18T06:20:00.000Z",
    });

    expect(isTrustedPublicationReleaseEvent(releaseEvent)).toBe(true);
    expect(Object.isFrozen(releaseEvent)).toBe(true);

    const report = buildWeeklyCadenceReport(actualCadenceInput(releaseEvent), {
      asOf: "2026-07-18T07:00:00.000Z",
    });
    expect(report.summary).toEqual(
      expect.objectContaining({
        completedCount: 1,
        actualCompletedCount: 1,
        syntheticFixtureCompletedCount: 0,
        completedCountSource: "actual",
      }),
    );
    expect(report.events.completed[0]).toEqual(
      expect.objectContaining({
        trustedReleaseEvidence: true,
        completionSource: "actual",
      }),
    );
  });

  it("rejects impossible and future actual adapter timestamps", () => {
    const workflow = actualLiveVerifiedWorkflow();

    expect(() =>
      adaptReleaseWorkflowToPublicationEvent(workflow, {
        eventId: "release-event.adapter-invalid-calendar",
        recordedAt: "2026-09-31T06:20:00.000Z",
      }),
    ).toThrow(/valid calendar timestamp/i);

    expect(() =>
      adaptReleaseWorkflowToPublicationEvent(workflow, {
        eventId: "release-event.adapter-future",
        recordedAt: "2026-07-19T06:20:00.000Z",
      }),
    ).toThrow(/future observation/i);
  });

  it("rejects fixture workflows and prototype-inherited adapter brands", () => {
    const actualWorkflow = actualLiveVerifiedWorkflow();
    const trustedEvent = adaptReleaseWorkflowToPublicationEvent(
      actualWorkflow,
      {
        eventId: "release-event.adapter-02",
        recordedAt: "2026-07-18T06:20:00.000Z",
      },
    );
    const inheritedEvent = Object.create(trustedEvent);

    expect(isTrustedPublicationReleaseEvent(inheritedEvent)).toBe(false);
    expect(() =>
      buildWeeklyCadenceReport(actualCadenceInput(inheritedEvent), {
        asOf: "2026-07-18T07:00:00.000Z",
      }),
    ).toThrow(/exactly|trusted release workflow adapter/i);

    const fixtureWorkflow = {
      ...actualWorkflow,
      dataMode: "synthetic_fixture" as const,
    };
    expect(() =>
      adaptReleaseWorkflowToPublicationEvent(fixtureWorkflow, {
        eventId: "release-event.adapter-fixture",
        recordedAt: "2026-07-18T06:20:00.000Z",
      }),
    ).toThrow(/trusted release workflow|fixture and dry-run/i);
  });
});
