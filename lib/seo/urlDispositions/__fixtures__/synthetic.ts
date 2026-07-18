import {
  URL_DISPOSITION_PREREQUISITE_TICKETS,
  computeExpectedUrlDispositionPreflightReportDigest,
  computeUrlDispositionArtifactDigest,
  type TraceEvidence,
  type UrlDispositionAction,
  type UrlDispositionPlanInput,
  type UrlDispositionPlanRecord,
  type UrlDispositionPreflightInput,
  type UrlProbeEvidence,
} from "..";

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

export function createApprovedUrlDispositionInput(): UrlDispositionPreflightInput {
  return boundInput(
    planFor([
      dispositionRecord({
        action: "keep",
        source: "/article/alpha",
      }),
    ]),
  );
}
