import {
  OPPORTUNITY_AS_OF_BOUNDARY,
  OPPORTUNITY_FACTORS,
  OPPORTUNITY_FRESHNESS_POLICY,
  OPPORTUNITY_SCORING_VERSION,
  OPPORTUNITY_TASK_TYPES,
  opportunityCandidateInputSchema,
  opportunityQueueInputSchema,
  opportunityQueueReportSchema,
  provisionalOpportunityBriefSchema,
  buildFirstOpportunityBrief,
  buildProvisionalOpportunityBrief,
  evaluateDestructiveAction,
  rankOpportunityQueue,
  scoreOpportunity,
} from "./index";
import { buildSyntheticCandidate } from "./fixtures";

describe("Ticket 28 opportunity scoring contract", () => {
  it("rejects malformed candidate and queue graphs at the strict runtime boundary", () => {
    const candidate = buildSyntheticCandidate();
    expect(opportunityCandidateInputSchema.safeParse(candidate).success).toBe(
      true,
    );
    expect(
      opportunityCandidateInputSchema.safeParse({ ...candidate, extra: true })
        .success,
    ).toBe(false);
    const missing = { ...candidate } as Record<string, unknown>;
    delete missing.brief;
    expect(opportunityCandidateInputSchema.safeParse(missing).success).toBe(
      false,
    );
    expect(
      opportunityCandidateInputSchema.safeParse({ ...candidate, factors: null })
        .success,
    ).toBe(false);
    const customPrototype = Object.assign(
      Object.create({ copied: true }) as Record<string, unknown>,
      candidate,
    );
    expect(
      opportunityCandidateInputSchema.safeParse(customPrototype).success,
    ).toBe(false);
    const getterCandidate = { ...candidate } as Record<string, unknown>;
    Object.defineProperty(getterCandidate, "id", {
      enumerable: true,
      configurable: true,
      get: () => candidate.id,
    });
    expect(
      opportunityCandidateInputSchema.safeParse(getterCandidate).success,
    ).toBe(false);

    const queueInput = {
      asOfDate: "2026-07-18",
      candidates: [candidate],
    };
    expect(opportunityQueueInputSchema.safeParse(queueInput).success).toBe(
      true,
    );
    expect(
      opportunityQueueInputSchema.safeParse({ ...queueInput, extra: true })
        .success,
    ).toBe(false);
    const queue = rankOpportunityQueue(queueInput);
    expect(opportunityQueueReportSchema.safeParse(queue).success).toBe(true);
    expect(
      opportunityQueueReportSchema.safeParse({
        ...queue,
        scoringVersion: "self-reported-version-drift",
      }).success,
    ).toBe(false);
    expect(
      opportunityQueueReportSchema.safeParse({
        ...queue,
        items: [
          {
            ...queue.items[0],
            finalScore: queue.items[0].finalScore + 1,
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      opportunityQueueReportSchema.safeParse({
        ...queue,
        items: [
          {
            ...queue.items[0],
            intendedDestination: "https://example.com/copied-route",
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      opportunityQueueReportSchema.safeParse({
        ...queue,
        items: [{ ...queue.items[0], asOfDate: "2026-07-17" }],
      }).success,
    ).toBe(false);
    const queueWithPrototype = Object.assign(
      Object.create({ copied: true }) as Record<string, unknown>,
      queue,
    );
    expect(
      opportunityQueueReportSchema.safeParse(queueWithPrototype).success,
    ).toBe(false);

    const brief = buildFirstOpportunityBrief(queueInput);
    expect(brief).not.toBeNull();
    expect(provisionalOpportunityBriefSchema.safeParse(brief).success).toBe(
      true,
    );
    expect(
      provisionalOpportunityBriefSchema.safeParse({
        ...brief,
        extra: true,
      }).success,
    ).toBe(false);
  });

  it("rejects future actual observations but permits an explicit synthetic future snapshot", () => {
    expect(OPPORTUNITY_AS_OF_BOUNDARY).toBe("2026-07-18");
    const base = buildSyntheticCandidate();
    const futureActual = buildSyntheticCandidate({
      factors: {
        ...base.factors,
        "gsc-performance": {
          ...base.factors["gsc-performance"],
          dataStatus: "observed",
          sourceRef: "gsc://actual/2026-07-19",
          observedAt: "2026-07-19",
        },
      },
    });
    expect(() => scoreOpportunity(futureActual, "2026-07-18")).toThrow(
      /future|after as-of/i,
    );
    expect(() => scoreOpportunity(base, "2026-07-19")).not.toThrow();

    const noSyntheticMarker = buildSyntheticCandidate({
      factors: Object.fromEntries(
        OPPORTUNITY_FACTORS.map(({ id }) => [
          id,
          {
            raw: null,
            normalized: null,
            sourceRef: null,
            observedAt: null,
            dataStatus: "missing",
            confidence: 0,
            missingReason: "governed-input-not-provided",
          },
        ]),
      ) as ReturnType<typeof buildSyntheticCandidate>["factors"],
    });
    expect(() => scoreOpportunity(noSyntheticMarker, "2026-07-19")).toThrow(
      /explicit synthetic-fixture/i,
    );
  });

  it("supports every governed task type and turns the first ranked item into a non-executable brief", () => {
    const candidates = OPPORTUNITY_TASK_TYPES.map((taskType, index) =>
      buildSyntheticCandidate({
        id: `opportunity-task-${index}`,
        taskType,
        destructiveAction:
          taskType === "merge"
            ? {
                action: "merge",
                lowTrafficOnly: false,
                gates: {
                  "human-approval": {
                    status: "pending",
                    reason: "human approval is not present",
                    sourceRef: null,
                  },
                  "successor-decision": {
                    status: "pending",
                    reason: "successor decision is not present",
                    sourceRef: null,
                  },
                  "gone-decision": {
                    status: "pending",
                    reason: "gone decision is not present",
                    sourceRef: null,
                  },
                  "backlink-review": {
                    status: "pending",
                    reason: "backlink review is not present",
                    sourceRef: null,
                  },
                  "evidence-review": {
                    status: "pending",
                    reason: "evidence review is not present",
                    sourceRef: null,
                  },
                  "orphan-review": {
                    status: "pending",
                    reason: "orphan review is not present",
                    sourceRef: null,
                  },
                  "redirect-chain-review": {
                    status: "pending",
                    reason: "redirect chain review is not present",
                    sourceRef: null,
                  },
                  "rollback-plan": {
                    status: "pending",
                    reason: "rollback plan is not present",
                    sourceRef: null,
                  },
                },
                humanApproval: {
                  actorType: null,
                  reviewer: null,
                  reviewedAt: null,
                },
              }
            : null,
      }),
    );
    const queue = rankOpportunityQueue({
      asOfDate: "2026-07-18",
      candidates,
    });
    expect(queue.items.map(({ taskType }) => taskType)).toEqual(
      expect.arrayContaining([...OPPORTUNITY_TASK_TYPES]),
    );
    expect(queue.items[0]).toEqual(
      expect.objectContaining({
        reviewer: expect.any(String),
        intendedDestination: "/article/verify-chinese-supplier",
        cluster: "supplier-verification",
        gates: expect.objectContaining({
          "service-relevance": expect.objectContaining({ status: "pass" }),
          "evidence-readiness": expect.objectContaining({ status: "pass" }),
          "cannibalisation-reviewed": expect.objectContaining({
            status: "pass",
          }),
        }),
      }),
    );
    const brief = buildFirstOpportunityBrief({
      asOfDate: "2026-07-18",
      candidates,
    });
    expect(brief).not.toBeNull();
    expect(provisionalOpportunityBriefSchema.safeParse(brief).success).toBe(
      true,
    );
    expect(brief).toEqual(
      expect.objectContaining({
        intendedDestination: "/article/verify-chinese-supplier",
        cluster: "supplier-verification",
        reviewerRequirement: expect.objectContaining({
          assignedReviewer: expect.any(String),
          realHumanRequired: true,
          verified: false,
        }),
        inputs: expect.objectContaining({
          targetIntent: expect.any(String),
          readerOutcome: expect.any(String),
          evidenceNeeds: expect.any(Array),
          graphChanges: expect.any(Array),
          conversionPath: expect.any(String),
          successMeasures: expect.any(Array),
        }),
        draftingAllowed: false,
        publishingAllowed: false,
        draft: null,
        publication: null,
      }),
    );
  });

  it("publishes the six fixed factors with a 100-point total", () => {
    expect(OPPORTUNITY_SCORING_VERSION).toBe("seo-opportunity-score-v1");
    expect(OPPORTUNITY_FACTORS).toEqual([
      {
        id: "service-lead-relevance",
        label: "Core-service and qualified-lead relevance",
        weight: 30,
      },
      {
        id: "australian-action-intent",
        label: "Australian buyer action intent",
        weight: 20,
      },
      {
        id: "evidence-readiness",
        label: "Evidence readiness and first-party advantage",
        weight: 15,
      },
      {
        id: "gsc-performance",
        label: "Google Search Console opportunity",
        weight: 15,
      },
      {
        id: "serp-gap",
        label: "Achievable SERP coverage gap",
        weight: 10,
      },
      {
        id: "geo-answerability",
        label: "GEO citation opportunity",
        weight: 10,
      },
    ]);
    expect(
      OPPORTUNITY_FACTORS.reduce((sum, factor) => sum + factor.weight, 0),
    ).toBe(100);
    expect(OPPORTUNITY_FRESHNESS_POLICY).toEqual({
      version: "seo-opportunity-freshness-v1",
      fresh: { maximumAgeDays: 30, multiplier: 1 },
      aging: { maximumAgeDays: 90, multiplier: 0.75 },
      stale: { maximumAgeDays: null, multiplier: 0.5 },
      missing: { maximumAgeDays: null, multiplier: 0 },
      notApplicable: { maximumAgeDays: null, multiplier: 0 },
    });
    expect(Object.isFrozen(OPPORTUNITY_FACTORS)).toBe(true);
    expect(Object.isFrozen(OPPORTUNITY_FRESHNESS_POLICY)).toBe(true);
  });

  it("scores a complete fixed-date candidate with transparent factor traces", () => {
    const scored = scoreOpportunity(buildSyntheticCandidate(), "2026-07-18");

    expect(scored.finalScore).toBe(83);
    expect(scored.coverage).toBe(1);
    expect(scored.confidence).toBe(1);
    expect(scored.eligibilityStatus).toBe("eligible");
    expect(scored.blockers).toEqual([]);
    expect(scored.researchReasons).toEqual([]);
    expect(scored.factors).toHaveLength(6);
    expect(scored.factors[0]).toEqual(
      expect.objectContaining({
        id: "service-lead-relevance",
        raw: "High fit with an active commercial service",
        normalized: 90,
        weight: 30,
        contribution: 27,
        sourceRef: "fixture://opportunity/full/service-relevance",
        observedAt: "2026-07-10",
        asOfDate: "2026-07-18",
        ageDays: 8,
        freshnessStatus: "fresh",
        freshnessMultiplier: 1,
        confidence: 1,
        missingReason: null,
        scoringVersion: "seo-opportunity-score-v1",
      }),
    );
    expect(Object.isFrozen(scored)).toBe(true);
    expect(Object.isFrozen(scored.factors)).toBe(true);
    expect(Object.isFrozen(scored.factors[0])).toBe(true);
  });

  it("keeps missing GSC data null, contributes zero, and marks research required", () => {
    const base = buildSyntheticCandidate();
    const scored = scoreOpportunity(
      buildSyntheticCandidate({
        factors: {
          ...base.factors,
          "gsc-performance": {
            raw: null,
            normalized: null,
            sourceRef: null,
            observedAt: null,
            dataStatus: "missing",
            confidence: 0,
            missingReason: "gsc-export-not-provided",
          },
        },
      }),
      "2026-07-18",
    );

    expect(scored.finalScore).toBe(71);
    expect(scored.coverage).toBe(0.85);
    expect(scored.confidence).toBe(0.85);
    expect(scored.eligibilityStatus).toBe("needs-research");
    expect(scored.researchReasons).toEqual([
      "factor:gsc-performance:gsc-export-not-provided",
    ]);
    expect(scored.factors.find(({ id }) => id === "gsc-performance")).toEqual(
      expect.objectContaining({
        raw: null,
        normalized: null,
        contribution: 0,
        ageDays: null,
        freshnessStatus: "missing",
        freshnessMultiplier: 0,
        missingReason: "gsc-export-not-provided",
      }),
    );
  });

  it("discounts a stale historical GSC snapshot without describing it as live", () => {
    const base = buildSyntheticCandidate();
    const scored = scoreOpportunity(
      buildSyntheticCandidate({
        factors: {
          ...base.factors,
          "gsc-performance": {
            ...base.factors["gsc-performance"],
            sourceRef: "snapshot://gsc/fixture-2026-03-01",
            observedAt: "2026-03-01",
            dataStatus: "static-snapshot",
          },
        },
      }),
      "2026-07-18",
    );
    const gsc = scored.factors.find(({ id }) => id === "gsc-performance");

    expect(scored.finalScore).toBe(77);
    expect(scored.confidence).toBe(0.925);
    expect(gsc).toEqual(
      expect.objectContaining({
        dataStatus: "static-snapshot",
        observedAt: "2026-03-01",
        asOfDate: "2026-07-18",
        ageDays: 139,
        freshnessStatus: "stale",
        freshnessMultiplier: 0.5,
        contribution: 6,
      }),
    );
  });

  it("represents a new page's GSC history as not applicable without redistributing weight", () => {
    const base = buildSyntheticCandidate();
    const scored = scoreOpportunity(
      buildSyntheticCandidate({
        id: "opportunity-fixture-new-quality-guide",
        taskType: "new",
        cluster: "quality-inspection",
        intendedDestination: "/article/china-quality-inspection-guide",
        factors: {
          ...base.factors,
          "gsc-performance": {
            raw: null,
            normalized: null,
            sourceRef: null,
            observedAt: null,
            dataStatus: "not-applicable",
            confidence: 0,
            missingReason: "new-page-has-no-gsc-history",
          },
        },
      }),
      "2026-07-18",
    );
    const gsc = scored.factors.find(({ id }) => id === "gsc-performance");

    expect(scored.finalScore).toBe(71);
    expect(scored.coverage).toBe(0.85);
    expect(scored.eligibilityStatus).toBe("eligible");
    expect(scored.researchReasons).toEqual([]);
    expect(gsc).toEqual(
      expect.objectContaining({
        normalized: null,
        contribution: 0,
        freshnessStatus: "not-applicable",
        freshnessMultiplier: 0,
        missingReason: "new-page-has-no-gsc-history",
      }),
    );
  });

  it.each([
    ["service-relevance", "service fit not established"],
    ["evidence-readiness", "governed evidence not ready"],
  ] as const)(
    "blocks a high score when the %s hard gate fails",
    (gateId, reason) => {
      const base = buildSyntheticCandidate();
      const scored = scoreOpportunity(
        buildSyntheticCandidate({
          gates: {
            ...base.gates,
            [gateId]: {
              status: "fail",
              reason,
              sourceRef: `fixture://opportunity/failed-gates/${gateId}`,
            },
          },
        }),
        "2026-07-18",
      );

      expect(scored.finalScore).toBe(83);
      expect(scored.eligibilityStatus).toBe("blocked");
      expect(scored.blockers).toEqual([`gate:${gateId}:${reason}`]);
    },
  );

  it("blocks unresolved cannibalisation even when every score input is complete", () => {
    const base = buildSyntheticCandidate();
    const scored = scoreOpportunity(
      buildSyntheticCandidate({
        gates: {
          ...base.gates,
          "cannibalisation-reviewed": {
            status: "fail",
            reason: "destination overlap remains unresolved",
            sourceRef: "fixture://opportunity/cannibalisation/unresolved",
          },
        },
      }),
      "2026-07-18",
    );

    expect(scored.finalScore).toBe(83);
    expect(scored.eligibilityStatus).toBe("blocked");
    expect(scored.blockers).toEqual([
      "gate:cannibalisation-reviewed:destination overlap remains unresolved",
    ]);
  });

  it("uses Unicode code-point order as the stable tie-break and selects only eligible work", () => {
    const blockedBase = buildSyntheticCandidate();
    const queue = rankOpportunityQueue({
      asOfDate: "2026-07-18",
      candidates: [
        buildSyntheticCandidate({ id: "opportunity-2" }),
        buildSyntheticCandidate({
          id: "opportunity-0-blocked",
          gates: {
            ...blockedBase.gates,
            "service-relevance": {
              status: "fail",
              reason: "service gate failed",
              sourceRef: "fixture://opportunity/gates/service-failed",
            },
          },
        }),
        buildSyntheticCandidate({ id: "opportunity-10" }),
      ],
    });

    expect(queue.items.map(({ id, rank }) => [id, rank])).toEqual([
      ["opportunity-0-blocked", 1],
      ["opportunity-10", 2],
      ["opportunity-2", 3],
    ]);
    expect(queue.selectedOpportunityId).toBe("opportunity-10");
    expect(Object.isFrozen(queue)).toBe(true);
    expect(Object.isFrozen(queue.items)).toBe(true);
  });

  it("makes score and ordering changes traceable to the changed raw input", () => {
    const base = buildSyntheticCandidate();
    const stable = buildSyntheticCandidate({ id: "opportunity-stable" });
    const lowerServiceRelevance = buildSyntheticCandidate({
      id: "opportunity-changing",
      factors: {
        ...base.factors,
        "service-lead-relevance": {
          ...base.factors["service-lead-relevance"],
          raw: "Moderate fit with an active commercial service",
          normalized: 70,
          sourceRef: "fixture://opportunity/ranking/service-moderate",
        },
      },
    });
    const higherServiceRelevance = buildSyntheticCandidate({
      id: "opportunity-changing",
      factors: {
        ...base.factors,
        "service-lead-relevance": {
          ...base.factors["service-lead-relevance"],
          raw: "Direct fit with an active commercial service",
          normalized: 100,
          sourceRef: "fixture://opportunity/ranking/service-direct",
        },
      },
    });

    const before = rankOpportunityQueue({
      asOfDate: "2026-07-18",
      candidates: [stable, lowerServiceRelevance],
    });
    const after = rankOpportunityQueue({
      asOfDate: "2026-07-18",
      candidates: [stable, higherServiceRelevance],
    });
    const beforeChanged = before.items.find(
      ({ id }) => id === "opportunity-changing",
    );
    const afterChanged = after.items.find(
      ({ id }) => id === "opportunity-changing",
    );

    expect(before.items.map(({ id }) => id)).toEqual([
      "opportunity-stable",
      "opportunity-changing",
    ]);
    expect(after.items.map(({ id }) => id)).toEqual([
      "opportunity-changing",
      "opportunity-stable",
    ]);
    expect(beforeChanged).toEqual(
      expect.objectContaining({ finalScore: 77, rank: 2 }),
    );
    expect(afterChanged).toEqual(
      expect.objectContaining({ finalScore: 86, rank: 1 }),
    );
    expect(
      beforeChanged?.factors.find(({ id }) => id === "service-lead-relevance"),
    ).toEqual(
      expect.objectContaining({
        raw: "Moderate fit with an active commercial service",
        normalized: 70,
        contribution: 21,
        sourceRef: "fixture://opportunity/ranking/service-moderate",
      }),
    );
    expect(
      afterChanged?.factors.find(({ id }) => id === "service-lead-relevance"),
    ).toEqual(
      expect.objectContaining({
        raw: "Direct fit with an active commercial service",
        normalized: 100,
        contribution: 30,
        sourceRef: "fixture://opportunity/ranking/service-direct",
      }),
    );
  });

  it("supports the five non-retire queue task types", () => {
    expect(OPPORTUNITY_TASK_TYPES).toEqual([
      "refresh",
      "new",
      "merge",
      "evidence",
      "internal-link",
    ]);
  });

  it("never treats low traffic as sufficient for an unapproved retire action", () => {
    const pendingGate = (id: string) => ({
      status: "pending" as const,
      reason: `${id} has not received human review`,
      sourceRef: null,
    });
    const evaluation = evaluateDestructiveAction(
      {
        action: "retire",
        lowTrafficOnly: true,
        gates: {
          "human-approval": pendingGate("human-approval"),
          "successor-decision": pendingGate("successor-decision"),
          "gone-decision": pendingGate("gone-decision"),
          "backlink-review": pendingGate("backlink-review"),
          "evidence-review": pendingGate("evidence-review"),
          "orphan-review": pendingGate("orphan-review"),
          "redirect-chain-review": pendingGate("redirect-chain-review"),
          "rollback-plan": pendingGate("rollback-plan"),
        },
        humanApproval: {
          actorType: null,
          reviewer: null,
          reviewedAt: null,
        },
      },
      "2026-07-18",
    );

    expect(evaluation.status).toBe("blocked");
    expect(evaluation.destructiveActionAllowed).toBe(false);
    expect(evaluation.automationAllowed).toBe(false);
    expect(evaluation.lowTrafficAloneSufficient).toBe(false);
    expect(evaluation.blockers).toEqual(
      expect.arrayContaining([
        "low-traffic-alone-cannot-authorize-destructive-action",
        "gate:human-approval:human-approval has not received human review",
        "human-approval-required",
      ]),
    );
    expect(Object.isFrozen(evaluation)).toBe(true);
  });

  it("builds a provisional brief that cannot draft or publish", () => {
    const scored = scoreOpportunity(buildSyntheticCandidate(), "2026-07-18");
    const brief = buildProvisionalOpportunityBrief(scored);

    expect(brief.status).toBe("needs-research");
    expect(brief.draftingAllowed).toBe(false);
    expect(brief.publishingAllowed).toBe(false);
    expect(brief.draft).toBeNull();
    expect(brief.publication).toBeNull();
    expect(brief.opportunityId).toBe(scored.id);
    expect(brief.reviewer).toBe(scored.reviewer);
    expect(brief.missingRealInputs).toEqual(
      expect.arrayContaining([
        "reviewer:real-human-assignment-required",
        "factor:service-lead-relevance:synthetic-fixture-not-live",
        "factor:gsc-performance:synthetic-fixture-not-live",
      ]),
    );
    expect(brief.inputs).toEqual({
      targetIntent: "Synthetic target intent",
      readerOutcome: "Synthetic reader outcome",
      evidenceNeeds: ["Synthetic evidence need"],
      graphChanges: ["Synthetic graph change"],
      conversionPath: "/enquiry",
      successMeasures: ["Synthetic success measure"],
    });
    expect(Object.isFrozen(brief)).toBe(true);
    expect(Object.isFrozen(brief.inputs)).toBe(true);
    expect(Object.isFrozen(brief.missingRealInputs)).toBe(true);
  });

  it("keeps a blocked gate visible in the provisional brief", () => {
    const base = buildSyntheticCandidate();
    const scored = scoreOpportunity(
      buildSyntheticCandidate({
        gates: {
          ...base.gates,
          "cannibalisation-reviewed": {
            status: "fail",
            reason: "destination overlap remains unresolved",
            sourceRef: "fixture://opportunity/cannibalisation/unresolved",
          },
        },
      }),
      "2026-07-18",
    );
    const brief = buildProvisionalOpportunityBrief(scored);

    expect(brief.status).toBe("blocked");
    expect(brief.blockers).toEqual([
      "gate:cannibalisation-reviewed:destination overlap remains unresolved",
    ]);
    expect(brief.draftingAllowed).toBe(false);
    expect(brief.publishingAllowed).toBe(false);
  });

  it("reproduces the same fixed as-of snapshot without mutating the input", () => {
    const candidate = buildSyntheticCandidate();
    const first = scoreOpportunity(candidate, "2026-07-18");
    const second = scoreOpportunity(candidate, "2026-07-18");
    const later = scoreOpportunity(candidate, "2026-08-20");

    expect(second).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(later).not.toEqual(first);
    expect(later.factors[0].freshnessStatus).toBe("aging");
    expect(candidate.destructiveAction).toBeNull();
    expect(candidate.brief.evidenceNeeds).toEqual(["Synthetic evidence need"]);
  });

  it("requires every destructive gate even when a merge scores highly", () => {
    const candidate = buildSyntheticCandidate({
      taskType: "merge",
      destructiveAction: null,
    });
    const scored = scoreOpportunity(candidate, "2026-07-18");

    expect(scored.finalScore).toBe(83);
    expect(scored.eligibilityStatus).toBe("blocked");
    expect(scored.blockers).toContain("destructive-action-plan-required");
  });

  it("rejects destructive approval evidence after the shared actual-date boundary", () => {
    const passGate = (id: string) => ({
      status: "pass" as const,
      reason: `${id} reviewed by a human operator`,
      sourceRef: `review://destructive/${id}`,
    });

    expect(() =>
      evaluateDestructiveAction(
        {
          action: "merge",
          lowTrafficOnly: false,
          gates: {
            "human-approval": passGate("human-approval"),
            "successor-decision": passGate("successor-decision"),
            "gone-decision": passGate("gone-decision"),
            "backlink-review": passGate("backlink-review"),
            "evidence-review": passGate("evidence-review"),
            "orphan-review": passGate("orphan-review"),
            "redirect-chain-review": passGate("redirect-chain-review"),
            "rollback-plan": passGate("rollback-plan"),
          },
          humanApproval: {
            actorType: "human",
            reviewer: "human-reviewer-01",
            reviewedAt: "2026-07-19",
          },
        },
        "2026-07-19",
      ),
    ).toThrow(/future evidence.*2026-07-18/i);
  });

  it("recognises human-approved destructive evidence but never authorises automation", () => {
    const passGate = (id: string) => ({
      status: "pass" as const,
      reason: `${id} reviewed by a human operator`,
      sourceRef: `review://destructive/${id}`,
    });
    const evaluation = evaluateDestructiveAction(
      {
        action: "merge",
        lowTrafficOnly: false,
        gates: {
          "human-approval": passGate("human-approval"),
          "successor-decision": passGate("successor-decision"),
          "gone-decision": passGate("gone-decision"),
          "backlink-review": passGate("backlink-review"),
          "evidence-review": passGate("evidence-review"),
          "orphan-review": passGate("orphan-review"),
          "redirect-chain-review": passGate("redirect-chain-review"),
          "rollback-plan": passGate("rollback-plan"),
        },
        humanApproval: {
          actorType: "human",
          reviewer: "human-reviewer-01",
          reviewedAt: "2026-07-17",
        },
      },
      "2026-07-18",
    );

    expect(evaluation.status).toBe("human-approved");
    expect(evaluation.destructiveActionAllowed).toBe(true);
    expect(evaluation.automationAllowed).toBe(false);
    expect(evaluation.lowTrafficAloneSufficient).toBe(false);
    expect(evaluation.humanApproval).toEqual({
      actorType: "human",
      reviewer: "human-reviewer-01",
      reviewedAt: "2026-07-17",
    });
  });
});
