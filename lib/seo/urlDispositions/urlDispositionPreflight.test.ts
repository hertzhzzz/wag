import {
  URL_DISPOSITION_PREREQUISITE_TICKETS,
  buildUrlDispositionPreflight,
  computeExpectedUrlDispositionPreflightReportDigest,
  computeUrlDispositionArtifactDigest,
  computeUrlDispositionReportDigest,
  sortCodePoints,
  type TraceEvidence,
  type UrlDispositionAction,
  type UrlDispositionPlanInput,
  type UrlDispositionPlanRecord,
  type UrlDispositionPreflightInput,
  type UrlProbeEvidence,
} from ".";

const AS_OF = "2026-07-18T04:00:00.000Z";
const PREPARED_AT = "2026-07-18T01:00:00.000Z";
const APPROVED_AT = "2026-07-18T02:00:00.000Z";
const CONTENT_APPROVED_AT = "2026-07-18T03:00:00.000Z";
const PRODUCTION_APPROVED_AT = "2026-07-18T04:00:00.000Z";
const REPORT_DIGEST = `sha256:${"b".repeat(64)}` as const;
const LEDGER_DIGEST = "c".repeat(64);

function evidence(
  id: string,
  origin: TraceEvidence["origin"] = "production",
): TraceEvidence {
  return {
    id,
    origin,
    public: origin === "production",
    source: `contract://${id}`,
    capturedAt: "2026-07-18T00:30:00.000Z",
    digest: `sha256:${"a".repeat(64)}`,
  };
}

function liveProbe(
  url: string,
  id: string,
  overrides: Partial<UrlProbeEvidence> = {},
): UrlProbeEvidence {
  return {
    url,
    status: "live",
    httpStatus: 200,
    redirectTarget: null,
    hopCount: 0,
    soft404: "no",
    canonical: url,
    evidence: evidence(id),
    ...overrides,
  };
}

function surfacePlans(finalDestination: string | null, prefix: string) {
  return {
    internalLinks: {
      plannedFinalDestination: finalDestination,
      evidence: evidence(`${prefix}.internal-links`),
    },
    canonicals: {
      plannedFinalDestination: finalDestination,
      evidence: evidence(`${prefix}.canonicals`),
    },
    sitemap: {
      plannedFinalDestination: finalDestination,
      evidence: evidence(`${prefix}.sitemap`),
    },
    breadcrumbs: {
      plannedFinalDestination: finalDestination,
      evidence: evidence(`${prefix}.breadcrumbs`),
    },
    structuredData: {
      plannedFinalDestination: finalDestination,
      evidence: evidence(`${prefix}.structured-data`),
    },
  };
}

function equityPlan(finalDestination: string | null, prefix: string) {
  const state =
    finalDestination === null ? ("none" as const) : ("present" as const);
  return {
    uniqueContent: {
      state,
      preservationDestination: finalDestination,
      plan:
        finalDestination === null
          ? "Reviewed source inventory records no unique content to preserve."
          : "Move every unique section to the approved final destination before cutover.",
      evidence: evidence(`${prefix}.unique-content`),
    },
    backlinkEquity: {
      state,
      preservationDestination: finalDestination,
      plan:
        finalDestination === null
          ? "Reviewed backlink inventory records no external-link equity."
          : "Preserve external-link equity at the approved final destination.",
      evidence: evidence(`${prefix}.backlink-equity`),
    },
  };
}

function commonRecord(
  id: string,
  source: string,
  finalDestination: string | null,
  bundleId: string,
) {
  return {
    id,
    bundleId,
    rationale:
      "Approved intent and quality rationale for this URL disposition.",
    owner: { id: "owner.andy", type: "human" as const },
    source,
    sourceProbe: liveProbe(source, `${id}.source-probe`),
    surfaces: surfacePlans(finalDestination, id),
    equity: equityPlan(finalDestination, id),
    rollback: {
      note: "Restore the source route and prior metadata from the reviewed change set.",
      conditions: [
        "Final destination fails live canonical verification.",
        "Qualified organic entry sessions materially regress after release.",
      ],
      evidence: evidence(`${id}.rollback`),
    },
  };
}

function dispositionRecord(
  options: {
    id?: string;
    action?: UrlDispositionAction;
    source?: string;
    destination?: string;
    bundleId?: string;
  } = {},
): UrlDispositionPlanRecord {
  const id = options.id ?? "disposition.source-one";
  const action = options.action ?? "redirect";
  const source = options.source ?? "/article/source-one";
  const destination = options.destination ?? "/article/final-destination";
  const bundleId = options.bundleId ?? "bundle.intent-one";

  if (action === "keep") {
    return {
      ...commonRecord(id, source, source, bundleId),
      action,
      destination: null,
      transition: { kind: "keep" },
      destinationProbe: null,
    };
  }

  if (action === "retire") {
    return {
      ...commonRecord(id, source, null, bundleId),
      action,
      destination: null,
      transition: { kind: "retire", statusCode: 410 },
      destinationProbe: null,
    };
  }

  if (action === "canonical") {
    return {
      ...commonRecord(id, source, destination, bundleId),
      action,
      destination,
      transition: { kind: "canonical", target: destination },
      destinationProbe: liveProbe(destination, `${id}.destination-probe`),
    };
  }

  return {
    ...commonRecord(id, source, destination, bundleId),
    action,
    destination,
    transition: {
      kind: "redirect",
      statusCode: 301,
      target: destination,
      hopCount: 1,
    },
    destinationProbe: liveProbe(destination, `${id}.destination-probe`),
  };
}

function completeGovernance(): UrlDispositionPlanInput["governance"] {
  return {
    ledger: {
      status: "valid",
      locked: true,
      digest: LEDGER_DIGEST,
      evidence: evidence("governance.ledger"),
    },
    prerequisiteTickets: URL_DISPOSITION_PREREQUISITE_TICKETS.map(
      (ticketId) => ({
        ticketId,
        status: "complete" as const,
        evidence: evidence(`governance.ticket-${ticketId}`),
      }),
    ),
  };
}

function planFor(
  records: UrlDispositionPlanRecord[],
  overrides: Partial<UrlDispositionPlanInput> = {},
): UrlDispositionPlanInput {
  const affected = new Set<string>();
  for (const record of records) {
    affected.add(record.source);
    if (record.destination !== null) affected.add(record.destination);
  }
  const unaffectedUrl = "/article/unaffected-control";

  return {
    version: 1,
    scopeId: "ticket-24.bundle-intent-one",
    preparedAt: PREPARED_AT,
    governance: completeGovernance(),
    records,
    unaffectedReport: {
      baselineUrls: [...affected, unaffectedUrl],
      inventoryEvidence: evidence("unaffected.inventory"),
      unchanged: [
        {
          url: unaffectedUrl,
          expectedCanonical: unaffectedUrl,
          probe: liveProbe(unaffectedUrl, "unaffected.control-probe"),
        },
      ],
      reportEvidence: evidence("unaffected.report"),
    },
    ...overrides,
  };
}

function releaseContract(artifactDigest: `sha256:${string}`) {
  const releaseId = "release.ticket-24.bundle-intent-one";
  return {
    version: 1 as const,
    state: "production_approved" as const,
    releaseId,
    artifactDigest,
    reportDigest: REPORT_DIGEST,
    contentApproval: {
      kind: "content" as const,
      actor: { id: "reviewer.content", type: "human" as const },
      approvedAt: CONTENT_APPROVED_AT,
      releaseId,
      artifactDigest,
      reportDigest: REPORT_DIGEST,
    },
    productionApproval: {
      kind: "production" as const,
      actor: { id: "reviewer.production", type: "human" as const },
      approvedAt: PRODUCTION_APPROVED_AT,
      releaseId,
      artifactDigest,
      reportDigest: REPORT_DIGEST,
    },
  };
}

function boundInput(
  plan: UrlDispositionPlanInput,
): UrlDispositionPreflightInput {
  const artifactDigest = computeUrlDispositionArtifactDigest(plan);
  const candidate: UrlDispositionPreflightInput = {
    asOf: AS_OF,
    plan,
    approvals: plan.records.map((record) => ({
      dispositionId: record.id,
      approver: { id: `reviewer.${record.id}`, type: "human" as const },
      approvedAt: APPROVED_AT,
      artifactDigest,
    })),
    releaseContract: releaseContract(artifactDigest),
  };
  const reportDigest =
    computeExpectedUrlDispositionPreflightReportDigest(candidate);
  return {
    ...candidate,
    releaseContract: {
      ...candidate.releaseContract!,
      reportDigest,
      contentApproval: {
        ...candidate.releaseContract!.contentApproval,
        reportDigest,
      },
      productionApproval: {
        ...candidate.releaseContract!.productionApproval,
        reportDigest,
      },
    },
  };
}

function blockerCodes(input: unknown): string[] {
  return buildUrlDispositionPreflight(input).blockers.map(({ code }) => code);
}

describe("URL disposition pre-execution contract", () => {
  it.each<UrlDispositionAction>([
    "keep",
    "merge",
    "redirect",
    "retire",
    "canonical",
  ])("supports an approved %s plan without exposing execution", (action) => {
    const record = dispositionRecord({ action });
    const report = buildUrlDispositionPreflight(boundInput(planFor([record])));

    expect(report.status).toBe("approved_for_preflight");
    expect(report.productionExecution).toEqual({
      supported: false,
      allowed: false,
      reason:
        "Ticket 24 validates evidence only; production URL execution is outside this contract.",
    });
    const { reportDigest, ...reportSubject } = report;
    expect(reportDigest).toBe(computeUrlDispositionReportDigest(reportSubject));
  });

  it("binds every release report digest claim to the generated report subject", () => {
    const input = boundInput(planFor([dispositionRecord()]));
    const forgedDigest = `sha256:${"f".repeat(64)}` as const;
    input.releaseContract!.reportDigest = forgedDigest;
    input.releaseContract!.contentApproval.reportDigest = forgedDigest;
    input.releaseContract!.productionApproval.reportDigest = forgedDigest;

    const report = buildUrlDispositionPreflight(input);

    expect(report.status).toBe("blocked");
    expect(report.releaseGate.status).toBe("blocked");
    expect(report.releaseGate.verifiedReportDigest).toBe(report.reportDigest);
    expect(report.reportDigest).not.toBe(forgedDigest);
    expect(report.blockers.map(({ code }) => code)).toContain(
      "release_report_digest_mismatch",
    );
  });

  it.each([
    ["production", true, "approved_for_preflight", null],
    ["production", false, "blocked", "input_schema_invalid"],
    ["fixture", true, "blocked", "input_schema_invalid"],
    ["fixture", false, "blocked", "fixture_evidence_forbidden"],
  ] as const)(
    "enforces the origin/public evidence matrix: %s/%s",
    (origin, isPublic, expectedStatus, expectedBlocker) => {
      const input = boundInput(planFor([dispositionRecord()]));
      const record = input.plan.records[0];
      record.sourceProbe.evidence.origin = origin;
      record.sourceProbe.evidence.public = isPublic;

      const report = buildUrlDispositionPreflight(input);

      expect(report.status).toBe(expectedStatus);
      if (expectedBlocker) {
        expect(report.blockers.map(({ code }) => code)).toContain(
          expectedBlocker,
        );
      }
    },
  );

  it("rejects every approval/evidence timestamp after the explicit asOf", () => {
    const input = boundInput(planFor([dispositionRecord()]));
    (input as unknown as { asOf: string }).asOf = "2026-07-18T03:30:00.000Z";

    const report = buildUrlDispositionPreflight(input);

    expect(report.status).toBe("blocked");
    expect(report.blockers.map(({ code }) => code)).toContain(
      "timestamp_after_as_of",
    );
    expect(
      report.blockers.some(({ path }) => path.includes("productionApproval")),
    ).toBe(true);
  });

  it("keeps the current Ticket 24 prerequisites and unlocked ledger blocked", () => {
    const plan = planFor([dispositionRecord()]);
    plan.governance.ledger.status = "approval-required";
    plan.governance.ledger.locked = false;
    plan.governance.prerequisiteTickets =
      plan.governance.prerequisiteTickets.map((ticket) => ({
        ...ticket,
        status: "pending",
      }));

    const report = buildUrlDispositionPreflight(boundInput(plan));

    expect(report.status).toBe("blocked");
    expect(report.blockers.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "ledger_not_valid",
        "ledger_not_locked",
        "prerequisite_incomplete",
      ]),
    );
  });

  it("fails closed when an approval is missing and never creates a placeholder", () => {
    const input = boundInput(planFor([dispositionRecord()]));
    input.approvals = [];

    const report = buildUrlDispositionPreflight(input);

    expect(report.status).toBe("blocked");
    expect(report.blockers.map(({ code }) => code)).toContain(
      "approval_missing",
    );
    expect(input.approvals).toEqual([]);
  });

  it("rejects unknown keys at every strict contract boundary", () => {
    const input = boundInput(planFor([dispositionRecord()]));
    const raw = { ...input, unexpected: true };

    expect(blockerCodes(raw)).toContain("input_schema_invalid");
  });

  it("rejects unknown keys inside nested strict contract objects", () => {
    const input = boundInput(planFor([dispositionRecord()]));
    const [record] = input.plan.records;
    const raw = {
      ...input,
      plan: {
        ...input.plan,
        records: [{ ...record, unexpected: true }],
      },
    };

    expect(blockerCodes(raw)).toContain("input_schema_invalid");
  });

  it("binds rationale and approval identity/time/digest to the artifact", () => {
    const record = dispositionRecord();
    record.rationale = "";
    const input = boundInput(planFor([record]));
    input.approvals = [
      {
        ...input.approvals[0],
        approvedAt: PREPARED_AT,
        artifactDigest: `sha256:${"d".repeat(64)}`,
      },
    ];

    expect(blockerCodes(input)).toEqual(
      expect.arrayContaining([
        "rationale_missing",
        "approval_digest_mismatch",
        "approval_time_invalid",
      ]),
    );
  });

  it("returns split_required when scope exceeds three source URLs", () => {
    const records = [1, 2, 3, 4].map((number) =>
      dispositionRecord({
        id: `disposition.source-${number}`,
        action: "keep",
        source: `/article/source-${number}`,
      }),
    );

    const report = buildUrlDispositionPreflight(boundInput(planFor(records)));

    expect(report.status).toBe("split_required");
    expect(report.scope.sourceCount).toBe(4);
    expect(report.blockers.map(({ code }) => code)).toContain(
      "scope_source_limit_exceeded",
    );
  });

  it("returns split_required for multiple unrelated destination bundles", () => {
    const records = [
      dispositionRecord({
        id: "disposition.one",
        source: "/article/source-one",
        destination: "/article/destination-one",
        bundleId: "bundle.one",
      }),
      dispositionRecord({
        id: "disposition.two",
        source: "/article/source-two",
        destination: "/article/destination-two",
        bundleId: "bundle.two",
      }),
    ];

    const report = buildUrlDispositionPreflight(boundInput(planFor(records)));

    expect(report.status).toBe("split_required");
    expect(report.blockers.map(({ code }) => code)).toContain(
      "scope_multiple_destination_bundles",
    );
  });

  it("blocks redirect chains and loops", () => {
    const chain = [
      dispositionRecord({
        id: "disposition.a-to-b",
        source: "/article/a",
        destination: "/article/b",
      }),
      dispositionRecord({
        id: "disposition.b-to-c",
        source: "/article/b",
        destination: "/article/c",
      }),
    ];
    expect(blockerCodes(boundInput(planFor(chain)))).toContain(
      "redirect_chain",
    );

    const loop = [
      dispositionRecord({
        id: "disposition.a-to-b",
        source: "/article/a",
        destination: "/article/b",
      }),
      dispositionRecord({
        id: "disposition.b-to-a",
        source: "/article/b",
        destination: "/article/a",
      }),
    ];
    expect(blockerCodes(boundInput(planFor(loop)))).toContain("redirect_loop");
  });

  it.each([
    ["soft-404", { soft404: "yes" as const }],
    [
      "unknown probe",
      {
        status: "unknown" as const,
        httpStatus: null,
        soft404: "unknown" as const,
        canonical: null,
      },
    ],
  ])("blocks a destination with %s evidence", (_label, overrides) => {
    const record = dispositionRecord();
    record.destinationProbe = {
      ...record.destinationProbe!,
      ...overrides,
    };

    const codes = blockerCodes(boundInput(planFor([record])));

    expect(codes).toEqual(
      expect.arrayContaining([
        overrides.soft404 === "yes"
          ? "destination_soft_404"
          : "destination_probe_unknown",
      ]),
    );
  });

  it("requires the planned redirect target itself to be canonical", () => {
    const record = dispositionRecord();
    if (record.transition.kind !== "redirect") {
      throw new Error("Test requires a redirect transition.");
    }
    record.transition = {
      ...record.transition,
      target: "/article/final-destination/",
    };

    expect(blockerCodes(boundInput(planFor([record])))).toContain(
      "url_not_canonical",
    );
  });

  it("requires a one-hop permanent redirect to the declared destination", () => {
    const record = dispositionRecord();
    if (record.transition.kind !== "redirect") {
      throw new Error("Test requires a redirect transition.");
    }
    record.transition = {
      ...record.transition,
      statusCode: 302,
      hopCount: 2,
      target: "/article/other-target",
    };

    expect(blockerCodes(boundInput(planFor([record])))).toEqual(
      expect.arrayContaining([
        "redirect_not_permanent",
        "redirect_not_one_hop",
        "redirect_target_mismatch",
      ]),
    );
  });

  it("requires every destination-bearing surface to use the final destination", () => {
    const record = dispositionRecord();
    record.surfaces.sitemap.plannedFinalDestination = record.source;
    record.surfaces.structuredData.plannedFinalDestination = null;

    const codes = blockerCodes(boundInput(planFor([record])));

    expect(
      codes.filter((code) => code === "planned_destination_mismatch"),
    ).toHaveLength(2);
  });

  it("blocks unknown or unpreserved equity and incomplete rollback conditions", () => {
    const record = dispositionRecord();
    record.equity.uniqueContent.state = "unknown";
    record.equity.backlinkEquity.preservationDestination = null;
    record.rollback.note = "";
    record.rollback.conditions = [];

    expect(blockerCodes(boundInput(planFor([record])))).toEqual(
      expect.arrayContaining([
        "equity_unknown",
        "equity_not_preserved",
        "rollback_note_missing",
        "rollback_conditions_missing",
      ]),
    );
  });

  it("requires every live source and destination in the baseline inventory", () => {
    const record = dispositionRecord();
    const plan = planFor([record]);
    plan.unaffectedReport.baselineUrls =
      plan.unaffectedReport.baselineUrls.filter(
        (url) => url !== record.destination,
      );

    expect(blockerCodes(boundInput(plan))).toContain(
      "baseline_destination_missing",
    );
  });

  it("requires an exact, conflict-free unaffected URL report with live probes", () => {
    const record = dispositionRecord();
    const plan = planFor([record]);
    plan.unaffectedReport.unchanged = [
      {
        url: record.source,
        expectedCanonical: record.source,
        probe: liveProbe(record.source, "unaffected.conflict"),
      },
    ];

    expect(blockerCodes(boundInput(plan))).toEqual(
      expect.arrayContaining([
        "unaffected_report_conflict",
        "unaffected_report_incomplete",
        "unaffected_report_unexpected",
      ]),
    );
  });

  it("requires a matching independent dual-approval release contract", () => {
    const missing = boundInput(planFor([dispositionRecord()]));
    missing.releaseContract = null;
    expect(blockerCodes(missing)).toContain("release_contract_missing");

    const drifted = boundInput(planFor([dispositionRecord()]));
    drifted.releaseContract = {
      ...drifted.releaseContract!,
      artifactDigest: `sha256:${"d".repeat(64)}`,
    };
    expect(blockerCodes(drifted)).toContain("release_artifact_digest_mismatch");

    const sameApprover = boundInput(planFor([dispositionRecord()]));
    sameApprover.releaseContract = {
      ...sameApprover.releaseContract!,
      productionApproval: {
        ...sameApprover.releaseContract!.productionApproval,
        actor: sameApprover.releaseContract!.contentApproval.actor,
      },
    };
    expect(blockerCodes(sameApprover)).toContain(
      "release_approvers_not_independent",
    );
  });

  it("never accepts explicit fixture/non-public evidence as approved evidence", () => {
    const record = dispositionRecord();
    record.destinationProbe = {
      ...record.destinationProbe!,
      evidence: evidence("fixture.destination-probe", "fixture"),
    };

    const report = buildUrlDispositionPreflight(boundInput(planFor([record])));

    expect(record.destinationProbe.evidence).toEqual(
      expect.objectContaining({ origin: "fixture", public: false }),
    );
    expect(report.status).toBe("blocked");
    expect(report.blockers.map(({ code }) => code)).toContain(
      "fixture_evidence_forbidden",
    );
  });

  it("is order-independent, uses Unicode code-point sorting, and deep-freezes reports", () => {
    const records = [
      dispositionRecord({
        id: "disposition.alpha",
        action: "keep",
        source: "/article/alpha",
      }),
      dispositionRecord({
        id: "disposition.beta",
        source: "/article/beta",
        destination: "/article/final-destination",
      }),
    ];
    const firstPlan = planFor(records);
    const secondPlan = planFor([...records].reverse());
    secondPlan.governance.prerequisiteTickets = [
      ...secondPlan.governance.prerequisiteTickets,
    ].reverse();
    secondPlan.unaffectedReport.baselineUrls = [
      ...secondPlan.unaffectedReport.baselineUrls,
    ].reverse();
    secondPlan.unaffectedReport.unchanged = [
      ...secondPlan.unaffectedReport.unchanged,
    ].reverse();

    expect(computeUrlDispositionArtifactDigest(firstPlan)).toBe(
      computeUrlDispositionArtifactDigest(secondPlan),
    );
    expect(sortCodePoints(["𐀀", "\uE000", "a"])).toEqual(["a", "\uE000", "𐀀"]);

    const first = boundInput(firstPlan);
    const second = boundInput(secondPlan);
    second.approvals = [...second.approvals].reverse();
    const firstReport = buildUrlDispositionPreflight(first);
    const secondReport = buildUrlDispositionPreflight(second);

    expect(firstReport).toEqual(secondReport);
    expect(Object.isFrozen(firstReport)).toBe(true);
    expect(Object.isFrozen(firstReport.blockers)).toBe(true);
    expect(Object.isFrozen(firstReport.dispositions)).toBe(true);
    expect(Object.isFrozen(firstReport.unaffectedUrls.expected)).toBe(true);
    expect(() => {
      (firstReport.dispositions as unknown as unknown[]).push({});
    }).toThrow();
  });
});
