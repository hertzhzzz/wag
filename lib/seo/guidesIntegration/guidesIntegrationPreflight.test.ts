import { CANONICAL_CLUSTER_IDS, type ClusterId } from "../clusterSchema";
import { digestStrictCutoverValue } from "../cutover";
import {
  buildGuidesDiscoveryViewModel,
  createGuidesIntegrationDescriptors,
  type GuidesDiscoveryReadyResult,
} from "../guides";
import { createSyntheticNonPublicGuidesInput } from "../guides/__fixtures__/synthetic";
import {
  buildGraphRecommendations,
  digestGraphInput,
  type GraphInput,
} from "../graph";
import {
  buildUrlDispositionPreflight,
  computeUrlDispositionReportDigest,
  type UrlDispositionPreflightReport,
} from "../urlDispositions";
import { createApprovedUrlDispositionInput } from "../urlDispositions/__fixtures__/synthetic";
import {
  buildSourceRetirementPreflight,
  computeSourceRetirementReportDigest,
  type SourceRetirementPreflightReport,
} from "../sourceRetirement";
import { createSyntheticSourceRetirementInput } from "../sourceRetirement/__fixtures__/synthetic";
import {
  GUIDES_INTEGRATION_SURFACES,
  buildGuidesIntegrationPreflight,
  canonicalizeGuidesIntegrationValue,
  compareCodePoints,
  computeGuidesIntegrationArtifactDigest,
  computeGuidesIntegrationArtifactSubjectDigest,
  computeGuidesIntegrationTicket27BReportDigest,
  type GuidesIntegrationEvidence,
  type GuidesIntegrationPreflightInput,
  type GuidesIntegrationReasonCode,
  type GuidesIntegrationSurfaceIdentity,
  type GuidesIntegrationTicket25,
} from ".";

const AS_OF = "2026-07-18";
const CAPTURED_AT = "2026-07-18T00:00:00.000Z";
// Explicit synthetic fixture for the required future-evidence rejection test.
const SYNTHETIC_FUTURE_CAPTURED_AT = "2026-07-19T00:00:00.000Z";
const ARTIFACT_DIGEST = computeGuidesIntegrationArtifactDigest({
  kind: "synthetic-guides-integration-artifact",
  version: 1,
});
const REPORT_DIGEST = computeGuidesIntegrationArtifactDigest({
  kind: "synthetic-guides-integration-report",
  version: 1,
});
const RENDER_ARTIFACT_DIGEST = computeGuidesIntegrationArtifactDigest({
  kind: "synthetic-render-artifact",
  version: 1,
});
const RELEASE_ID = "synthetic-guides-release";
const EXECUTION_REASON =
  "This contract only builds a descriptive preflight report; it exposes no production mutation API.";

function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function ticket25Reference(
  report: SourceRetirementPreflightReport,
): GuidesIntegrationTicket25 {
  return {
    sourceRetirementReport: clonePlain(
      report,
    ) as unknown as GuidesIntegrationTicket25["sourceRetirementReport"],
  };
}

function requireReadyGuides(): GuidesDiscoveryReadyResult {
  const result = buildGuidesDiscoveryViewModel(
    createSyntheticNonPublicGuidesInput(),
  );
  if (result.status !== "ready") {
    throw new Error(
      "Synthetic Guides fixture must produce a ready view model.",
    );
  }
  return clonePlain(result);
}

function evidence(
  id: string,
  capturedAt = CAPTURED_AT,
  digest = ARTIFACT_DIGEST,
): GuidesIntegrationEvidence {
  return {
    id,
    origin: "fixture",
    public: false,
    source: "Synthetic non-public Ticket 27B contract fixture",
    capturedAt,
    digest,
  };
}

function createGraph(guides: GuidesDiscoveryReadyResult): GraphInput {
  const rootId = "guides-root";
  const pillars = guides.guides.pillars.items;

  return {
    version: 1,
    status: "ready",
    clusters: pillars.map((pillar) => ({
      id: pillar.clusterId,
      rootId,
      pillarId: `guides-${pillar.clusterId}-pillar`,
    })),
    nodes: [
      {
        id: rootId,
        nodeType: "root",
        title: "Guides",
        destination: "/article",
        status: "published",
        funnelStage: "problem-aware",
        topics: ["guides"],
      },
      ...pillars.map((pillar) => ({
        id: `guides-${pillar.clusterId}-pillar`,
        nodeType: "article" as const,
        title: pillar.title,
        destination: pillar.href,
        status: "published" as const,
        cluster: pillar.clusterId,
        contentRole: "pillar" as const,
        funnelStage: "solution-aware" as const,
        topics: [pillar.clusterId],
      })),
    ],
    relationships: pillars.map((pillar, index) => ({
      id: `guides-root-${pillar.clusterId}`,
      sourceId: rootId,
      targetId: `guides-${pillar.clusterId}-pillar`,
      type: "cluster-member",
      anchor: `${pillar.label} guide`,
      funnelDirection: "forward" as const,
      priority: index + 1,
    })),
  };
}

function humanApproval(
  kind: "integration" | "guides" | "content" | "production",
) {
  return {
    kind,
    actor: {
      id: `synthetic-${kind}-reviewer`,
      type: "human" as const,
    },
    approvedAt: CAPTURED_AT,
    releaseId: RELEASE_ID,
    artifactDigest: ARTIFACT_DIGEST,
    reportDigest: REPORT_DIGEST,
    evidence: evidence(`synthetic-${kind}-approval-evidence`),
  };
}

function createTicket13CutoverDependency(graphDigest: string) {
  const payload = {
    ticket: "13" as const,
    status: "scaffold-ready" as const,
    asOf: AS_OF,
    mode: "preview" as const,
    executable: false as const,
    commands: [] as const,
    migrationLedgerDigest: computeGuidesIntegrationArtifactDigest({
      kind: "migration-ledger",
    }),
    ticket07To11PreviewDigests: {
      "07": computeGuidesIntegrationArtifactDigest({ ticket: "07" }),
      "08": computeGuidesIntegrationArtifactDigest({ ticket: "08" }),
      "09": computeGuidesIntegrationArtifactDigest({ ticket: "09" }),
      "10": computeGuidesIntegrationArtifactDigest({ ticket: "10" }),
      "11": computeGuidesIntegrationArtifactDigest({ ticket: "11" }),
    },
    ticket12OverlayDigest: computeGuidesIntegrationArtifactDigest({
      ticket: "12",
    }),
    graphDigest,
    artifactSetDigest: computeGuidesIntegrationArtifactDigest({
      kind: "ticket13-artifact-set",
    }),
    cutoverDigest: computeGuidesIntegrationArtifactDigest({
      kind: "ticket13-cutover",
    }),
  };
  return {
    ...payload,
    dependencyDigest: digestStrictCutoverValue(payload),
  };
}

function createTicket27BReport(
  graph: GraphInput,
  ticket25: SourceRetirementPreflightReport,
  artifactDigest = ARTIFACT_DIGEST,
): NonNullable<GuidesIntegrationPreflightInput["ticket27BReport"]> {
  const recommendationResult = buildGraphRecommendations(graph, "guides-root");
  const report = {
    schemaVersion: "ticket27b-recommendations-diagnostics-v1" as const,
    status: "ready" as const,
    deterministic: true as const,
    asOf: CAPTURED_AT,
    graphDigest: recommendationResult.graphDigest as `sha256:${string}`,
    recommendationDigest: computeGuidesIntegrationArtifactDigest(
      recommendationResult.recommendations,
    ),
    diagnosticDigest: computeGuidesIntegrationArtifactDigest(
      recommendationResult.diagnostics,
    ),
    artifactDigest,
    reportDigest: REPORT_DIGEST,
    productionExecution: { supported: false as const, allowed: false as const },
    lineage: {
      ticket25ReportDigest: ticket25.reportDigest,
      graphDigest: recommendationResult.graphDigest as `sha256:${string}`,
      artifactDigest,
      asOf: CAPTURED_AT,
    },
  };
  return {
    ...report,
    reportDigest: computeGuidesIntegrationTicket27BReportDigest(report),
  };
}

function createSyntheticContractInput(): GuidesIntegrationPreflightInput {
  const guides = requireReadyGuides();
  const descriptors = clonePlain(
    createGuidesIntegrationDescriptors(guides.guides.pillars.items),
  );
  const graph = createGraph(guides);
  const graphDigest = digestGraphInput(graph);
  const ticket24Input = createApprovedUrlDispositionInput();
  const ticket24 = buildUrlDispositionPreflight(ticket24Input);
  const ticket25 = buildSourceRetirementPreflight(
    createSyntheticSourceRetirementInput({ urlDisposition: ticket24 }),
  );
  if (ticket24.status !== "approved_for_preflight")
    throw new Error("Synthetic Ticket 24 fixture must be approved.");
  if (ticket25.status !== "preview_ready" || !ticket25.artifact.digest)
    throw new Error("Synthetic Ticket 25 fixture must be preview_ready.");
  const root: GuidesIntegrationSurfaceIdentity = {
    clusterId: null,
    contentId: "guides.discovery",
    route: "/article",
    canonicalRoute: "/article",
    graphNodeId: "guides-root",
  };
  const pillars = guides.guides.pillars.items.map((pillar) => ({
    clusterId: pillar.clusterId,
    contentId: pillar.contentId,
    route: pillar.href,
    canonicalRoute: pillar.href,
    graphNodeId: `guides-${pillar.clusterId}-pillar`,
  }));
  const references = pillars
    .map((pillar) => ({
      kind: "pillar" as const,
      sourceContentId: root.contentId,
      targetContentId: pillar.contentId,
      targetRoute: pillar.route,
      targetCanonicalRoute: pillar.canonicalRoute,
      targetGraphNodeId: pillar.graphNodeId,
    }))
    .sort((left, right) =>
      compareCodePoints(
        canonicalizeGuidesIntegrationValue(left),
        canonicalizeGuidesIntegrationValue(right),
      ),
    );
  type SurfaceProjections = NonNullable<
    GuidesIntegrationPreflightInput["projections"]
  >["surfaces"];
  const surfaces = GUIDES_INTEGRATION_SURFACES.reduce((result, surface) => {
    result[surface] = {
      surface,
      scope: "guides-only",
      artifactDigest: ARTIFACT_DIGEST,
      graphDigest,
      root: clonePlain(root),
      pillars: clonePlain(pillars),
      references: clonePlain(references),
      filter: {
        crawlPolicy: "single-document",
        navigationEffect: "none",
        queryResultUrls: [],
      },
    };
    return result;
  }, {} as SurfaceProjections);

  const input: GuidesIntegrationPreflightInput = {
    schemaVersion: "guides-integration-preflight-v1",
    asOf: AS_OF,
    ticket13Cutover: createTicket13CutoverDependency(graphDigest),
    ticket27BReport: createTicket27BReport(graph, ticket25),
    urlDispositionPreflight: {
      input: ticket24Input,
      report: clonePlain(ticket24) as unknown as NonNullable<
        GuidesIntegrationPreflightInput["urlDispositionPreflight"]
      >["report"],
    },
    artifact: {
      version: 1,
      id: "synthetic-guides-integration",
      digest: ARTIFACT_DIGEST,
      reportDigest: REPORT_DIGEST,
      origin: "fixture",
      public: false,
      evidence: evidence("synthetic-artifact-evidence"),
    },
    ticket25: ticket25Reference(ticket25),
    guides: {
      version: 1,
      origin: "fixture",
      public: false,
      model: guides,
      modelDigest: computeGuidesIntegrationArtifactDigest(guides),
      descriptors,
      descriptorsDigest: computeGuidesIntegrationArtifactDigest(descriptors),
      evidence: evidence("synthetic-guides-evidence"),
    },
    graph: {
      version: 1,
      origin: "fixture",
      public: false,
      input: graph,
      digest: graphDigest,
      artifactDigest: ARTIFACT_DIGEST,
      evidence: evidence("synthetic-graph-evidence"),
    },
    urlDisposition: {
      version: 1,
      status: "approved",
      artifactDigest: ticket24.artifactDigest!,
      reportDigest: ticket24.reportDigest,
      destinations: pillars.map((pillar) => ({
        clusterId: pillar.clusterId,
        contentId: pillar.contentId,
        route: pillar.route,
        canonicalRoute: pillar.canonicalRoute,
        action: "keep" as const,
      })),
      productionExecution: {
        supported: false,
        allowed: false,
      },
    },
    projections: {
      version: 1,
      artifactDigest: ARTIFACT_DIGEST,
      graphDigest,
      surfaces,
      rollout: {
        mode: "all-or-nothing",
        status: "complete",
        expectedSurfaces: [...GUIDES_INTEGRATION_SURFACES],
        readySurfaces: [...GUIDES_INTEGRATION_SURFACES],
      },
    },
    releaseBinding: {
      version: 1,
      state: "production_approved",
      releaseId: RELEASE_ID,
      artifactDigest: ARTIFACT_DIGEST,
      reportDigest: REPORT_DIGEST,
      contentApproval: humanApproval("content"),
      productionApproval: humanApproval("production"),
    },
    renderAcceptance: {
      version: 1,
      status: "passed",
      artifactDigest: ARTIFACT_DIGEST,
      renderArtifactDigest: RENDER_ARTIFACT_DIGEST,
      checks: {
        mobile: {
          status: "passed",
          evidence: evidence(
            "synthetic-mobile-render-evidence",
            CAPTURED_AT,
            RENDER_ARTIFACT_DIGEST,
          ),
        },
        desktop: {
          status: "passed",
          evidence: evidence(
            "synthetic-desktop-render-evidence",
            CAPTURED_AT,
            RENDER_ARTIFACT_DIGEST,
          ),
        },
        keyboard: {
          status: "passed",
          evidence: evidence(
            "synthetic-keyboard-render-evidence",
            CAPTURED_AT,
            RENDER_ARTIFACT_DIGEST,
          ),
        },
        screenReader: {
          status: "passed",
          evidence: evidence(
            "synthetic-screen-reader-render-evidence",
            CAPTURED_AT,
            RENDER_ARTIFACT_DIGEST,
          ),
        },
      },
    },
    humanApprovals: {
      integration: humanApproval("integration"),
      guides: humanApproval("guides"),
    },
  };
  bindIntegrationArtifact(
    input,
    computeGuidesIntegrationArtifactSubjectDigest(input),
  );
  return input;
}

function bindIntegrationArtifact(
  input: GuidesIntegrationPreflightInput,
  artifactDigest: `sha256:${string}`,
): void {
  if (
    !input.artifact ||
    !input.projections ||
    !input.urlDisposition ||
    !input.releaseBinding ||
    !input.humanApprovals
  )
    return;
  input.artifact.digest = artifactDigest;
  input.artifact.evidence.digest = artifactDigest;
  input.graph.artifactDigest = artifactDigest;
  if (input.graph.evidence) input.graph.evidence.digest = artifactDigest;
  if (input.guides.evidence) input.guides.evidence.digest = artifactDigest;
  input.projections.artifactDigest = artifactDigest;
  GUIDES_INTEGRATION_SURFACES.forEach((surface) => {
    input.projections!.surfaces[surface].artifactDigest = artifactDigest;
  });
  input.releaseBinding.artifactDigest = artifactDigest;
  if (input.ticket27BReport) {
    input.ticket27BReport.artifactDigest = artifactDigest;
    input.ticket27BReport.lineage.artifactDigest = artifactDigest;
  }
  const { contentApproval, productionApproval } = input.releaseBinding;
  if (!contentApproval || !productionApproval) return;
  contentApproval.artifactDigest = artifactDigest;
  contentApproval.evidence.digest = artifactDigest;
  productionApproval.artifactDigest = artifactDigest;
  productionApproval.evidence.digest = artifactDigest;
  if (input.humanApprovals.integration) {
    input.humanApprovals.integration.artifactDigest = artifactDigest;
    input.humanApprovals.integration.evidence.digest = artifactDigest;
  }
  if (input.humanApprovals.guides) {
    input.humanApprovals.guides.artifactDigest = artifactDigest;
    input.humanApprovals.guides.evidence.digest = artifactDigest;
  }
  if (input.renderAcceptance)
    input.renderAcceptance.artifactDigest = artifactDigest;
}

function blockerCodes(
  input: unknown,
): ReadonlySet<GuidesIntegrationReasonCode> {
  return new Set(
    buildGuidesIntegrationPreflight(input).blockers.map((item) => item.code),
  );
}

function expectBlockedBy(
  mutate: (input: GuidesIntegrationPreflightInput) => void,
  expectedCode: GuidesIntegrationReasonCode,
): void {
  const input = createSyntheticContractInput();
  mutate(input);
  expect(blockerCodes(input)).toContain(expectedCode);
}

describe("Guides integration preflight contract", () => {
  it("binds artifact.digest to the complete current integration subject", () => {
    const input = createSyntheticContractInput();
    expect(input.artifact).not.toBeNull();
    expect(input.artifact!.digest).toBe(
      computeGuidesIntegrationArtifactSubjectDigest(input),
    );

    const mutations: Array<
      [string, (candidate: GuidesIntegrationPreflightInput) => void]
    > = [
      [
        "Ticket 25 report identity",
        (candidate) => {
          if (!candidate.ticket25)
            throw new Error("Ticket 25 fixture is required.");
          candidate.ticket25.sourceRetirementReport.scope.articleIds = [
            "article.mutated",
          ];
          const { reportDigest: _ignored, ...subject } =
            candidate.ticket25.sourceRetirementReport;
          void _ignored;
          candidate.ticket25.sourceRetirementReport.reportDigest =
            computeSourceRetirementReportDigest(subject);
        },
      ],
      [
        "model",
        (candidate) => {
          const model = candidate.guides.model as GuidesDiscoveryReadyResult;
          const mutableModel = model as unknown as {
            guides: { pillars: { items: Array<{ title: string }> } };
          };
          mutableModel.guides.pillars.items[0].title = "Mutated pillar";
          candidate.guides.modelDigest =
            computeGuidesIntegrationArtifactDigest(model);
        },
      ],
      [
        "descriptors",
        (candidate) => {
          const descriptors = candidate.guides.descriptors as Record<
            string,
            unknown
          >;
          descriptors.version = "mutated";
          candidate.guides.descriptorsDigest =
            computeGuidesIntegrationArtifactDigest(descriptors);
        },
      ],
      [
        "graph",
        (candidate) => {
          const graph = candidate.graph.input as GraphInput;
          graph.nodes[0].title = "Mutated graph root";
          candidate.graph.digest = digestGraphInput(graph);
        },
      ],
      [
        "URL dispositions",
        (candidate) => {
          candidate.urlDisposition!.destinations[0].action = "refresh";
        },
      ],
      [
        "rollout scope",
        (candidate) => {
          candidate.projections!.rollout.readySurfaces = ["route"];
          candidate.projections!.rollout.status = "partial";
        },
      ],
    ];

    for (const [label, mutate] of mutations) {
      const mutated = clonePlain(input);
      mutate(mutated);
      const report = buildGuidesIntegrationPreflight(mutated);
      expect(report.blockers.map((item) => item.code)).toContain(
        "artifact-digest-drift",
      );
      expect(label).not.toHaveLength(0);
    }
  });

  it("fails closed when the Ticket 27B contract inputs are incomplete", () => {
    const guides = requireReadyGuides();
    const graph: GraphInput = {
      version: 1,
      status: "blocked_no_live_graph",
      clusters: [],
      nodes: [],
      relationships: [],
    };
    const input = {
      schemaVersion: "guides-integration-preflight-v1",
      asOf: AS_OF,
      artifact: null,
      ticket25: null,
      guides: {
        version: 1,
        origin: "fixture",
        public: false,
        model: guides,
        modelDigest: null,
        descriptors: null,
        descriptorsDigest: null,
        evidence: null,
      },
      graph: {
        version: 1,
        origin: "fixture",
        public: false,
        input: graph,
        digest: digestGraphInput(graph),
        artifactDigest: null,
        evidence: null,
      },
      urlDisposition: null,
      projections: null,
      releaseBinding: null,
      renderAcceptance: null,
      humanApprovals: null,
    } as unknown as GuidesIntegrationPreflightInput;

    const report = buildGuidesIntegrationPreflight(input);

    expect(report.status).toBe("blocked");
    expect(report.contractStatus).toBe("blocked");
    expect(report.productionExecution).toEqual({
      supported: false,
      allowed: false,
      reason: EXECUTION_REASON,
    });
    expect(report.blockers.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "artifact-missing",
        "ticket25-missing",
        "url-disposition-missing",
        "projection-missing",
        "release-unbound",
        "render-acceptance-missing",
      ]),
    );
  });

  it("passes only the shape contract for a synthetic non-public fixture and never authorizes production", () => {
    const report = buildGuidesIntegrationPreflight(
      createSyntheticContractInput(),
    );
    const codes = new Set(report.blockers.map((item) => item.code));

    expect(report.contractStatus).toBe("pass");
    expect(report.status).toBe("blocked");
    expect(report.artifactOrigin).toBe("fixture");
    expect(report.artifactExportable).toBe(false);
    expect(report.productionExecution).toEqual({
      supported: false,
      allowed: false,
      reason: EXECUTION_REASON,
    });
    expect(codes).toEqual(
      new Set(["artifact-provenance-unapproved", "render-evidence-unapproved"]),
    );
    expect(report.counts).toMatchObject({
      expectedPillars: 5,
      observedPillars: 5,
      expectedSurfaces: 7,
      observedSurfaces: 7,
    });
  });

  it("binds a real Ticket 24 report through Ticket 25 into Ticket 27B", () => {
    const input = createSyntheticContractInput();
    const ticket24 = input.urlDispositionPreflight?.report;
    const ticket25 = input.ticket25?.sourceRetirementReport;
    const ticket27B = input.ticket27BReport;
    if (!ticket24 || !ticket25 || !ticket27B || !input.artifact)
      throw new Error("Expected the complete in-memory dependency chain.");

    const { reportDigest: _ticket24Digest, ...ticket24Subject } = ticket24;
    void _ticket24Digest;
    expect(ticket24.reportDigest).toBe(
      computeUrlDispositionReportDigest(
        ticket24Subject as unknown as Omit<
          UrlDispositionPreflightReport,
          "reportDigest"
        >,
      ),
    );
    expect(ticket25.status).toBe("preview_ready");
    expect(ticket25.asOf).toBe(AS_OF);
    expect(ticket25.blockers).toEqual([]);
    expect(ticket27B.lineage.ticket25ReportDigest).toBe(ticket25.reportDigest);
    expect(ticket27B.lineage.graphDigest).toBe(input.graph.digest);
    expect(ticket27B.artifactDigest).toBe(input.artifact.digest);
    expect(ticket27B.reportDigest).toBe(
      computeGuidesIntegrationTicket27BReportDigest(ticket27B),
    );

    const report = buildGuidesIntegrationPreflight(input);

    expect(report.contractStatus).toBe("pass");
    expect(report.blockers.map((item) => item.code)).not.toEqual(
      expect.arrayContaining([
        "ticket13-missing",
        "url-disposition-report-invalid",
        "ticket25-report-digest-drift",
        "ticket27b-digest-drift",
        "ticket27b-lineage-drift",
      ]),
    );
    expect(report.productionExecution).toEqual({
      supported: false,
      allowed: false,
      reason: EXECUTION_REASON,
    });
  });

  it("rejects Ticket 25 when its explicit asOf drifts from the shared chain", () => {
    const input = createSyntheticContractInput();
    const ticket25 = input.ticket25?.sourceRetirementReport;
    if (!ticket25 || !input.artifact)
      throw new Error(
        "Expected the Ticket 25 fixture and integration artifact.",
      );

    ticket25.asOf = "2026-07-17";
    const { reportDigest: _ignored, ...subject } = ticket25;
    void _ignored;
    ticket25.reportDigest = computeSourceRetirementReportDigest(subject);
    bindIntegrationArtifact(
      input,
      computeGuidesIntegrationArtifactSubjectDigest(input),
    );

    expect(blockerCodes(input)).toContain("ticket25-as-of-mismatch");
  });

  it("requires the strict Ticket 13 scaffold dependency and rejects executable or drifted variants", () => {
    const missing = createSyntheticContractInput();
    missing.ticket13Cutover = null;

    const executable = createSyntheticContractInput();
    executable.ticket13Cutover = {
      ...(executable.ticket13Cutover as Record<string, unknown>),
      mode: "actual",
      executable: true,
      commands: ["deploy"],
    };

    const drifted = createSyntheticContractInput();
    const dependency = drifted.ticket13Cutover as Record<string, unknown>;
    const { dependencyDigest: _dependencyDigest, ...payload } = dependency;
    void _dependencyDigest;
    payload.graphDigest = computeGuidesIntegrationArtifactDigest({
      kind: "drifted-ticket13-graph",
    });
    drifted.ticket13Cutover = {
      ...payload,
      dependencyDigest: digestStrictCutoverValue(payload),
    };

    expect(blockerCodes(missing)).toContain("ticket13-missing");
    expect(blockerCodes(executable)).toContain("ticket13-invalid");
    expect(blockerCodes(drifted)).toContain("ticket13-digest-drift");
  });

  it("rejects a forged or drifted full Ticket 24 dependency", () => {
    const forged = clonePlain(createSyntheticContractInput());
    if (!forged.urlDispositionPreflight)
      throw new Error("Expected the Ticket 24 fixture.");
    forged.urlDispositionPreflight.report.releaseGate.verifiedReportDigest =
      computeGuidesIntegrationArtifactDigest({
        kind: "forged-ticket24-report",
      });

    const drifted = clonePlain(createSyntheticContractInput());
    if (!drifted.urlDispositionPreflight?.input.releaseContract)
      throw new Error("Expected the Ticket 24 release contract fixture.");
    drifted.urlDispositionPreflight.input.releaseContract.productionApproval.actor.id =
      "production-reviewer-drift";

    expect(blockerCodes(forged)).toContain("url-disposition-report-invalid");
    expect(blockerCodes(drifted)).toContain("url-disposition-report-invalid");
  });

  it("rejects Ticket 27B recommendation/report drift even when the graph input is unchanged", () => {
    const input = createSyntheticContractInput();
    if (!input.ticket27BReport)
      throw new Error("Expected the Ticket 27B fixture.");
    input.ticket27BReport.recommendationDigest =
      computeGuidesIntegrationArtifactDigest({
        kind: "mutated-ticket27b-recommendations",
      });

    const codes = blockerCodes(input);
    expect(codes).toContain("artifact-digest-drift");
    expect(codes).toContain("ticket27b-digest-drift");
  });

  it("rejects future Ticket 27B and human-approval timestamps against the explicit asOf", () => {
    const ticket27Future = createSyntheticContractInput();
    if (!ticket27Future.ticket27BReport)
      throw new Error("Expected the Ticket 27B fixture.");
    ticket27Future.ticket27BReport.asOf = SYNTHETIC_FUTURE_CAPTURED_AT;
    ticket27Future.ticket27BReport.lineage.asOf = SYNTHETIC_FUTURE_CAPTURED_AT;

    const approvalFuture = createSyntheticContractInput();
    if (!approvalFuture.humanApprovals?.integration)
      throw new Error("Expected the human approval fixture.");
    approvalFuture.humanApprovals.integration.approvedAt =
      SYNTHETIC_FUTURE_CAPTURED_AT;

    expect(blockerCodes(ticket27Future)).toContain("future-dated-evidence");
    expect(blockerCodes(approvalFuture)).toContain("future-dated-evidence");
  });

  it("is deterministic, recursively frozen, and does not mutate its input", () => {
    const input = createSyntheticContractInput();
    const before = clonePlain(input);

    const first = buildGuidesIntegrationPreflight(input);
    const second = buildGuidesIntegrationPreflight(input);

    expect(first).toEqual(second);
    expect(first.reportDigest).toBe(second.reportDigest);
    expect(input).toEqual(before);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.identity)).toBe(true);
    expect(Object.isFrozen(first.productionExecution)).toBe(true);
    expect(Object.isFrozen(first.blockers)).toBe(true);
    expect(first.blockers.every((item) => Object.isFrozen(item))).toBe(true);
    expect(() => {
      (first.productionExecution as unknown as { allowed: boolean }).allowed =
        true;
    }).toThrow(TypeError);
  });

  it("uses Unicode code-point sorting and a stable canonical digest", () => {
    const value = { "😀": 4, é: 3, a: 2, A: 1 };

    expect(canonicalizeGuidesIntegrationValue(value)).toBe(
      '{"A":1,"a":2,"é":3,"😀":4}',
    );
    expect(computeGuidesIntegrationArtifactDigest(value)).toBe(
      computeGuidesIntegrationArtifactDigest({ a: 2, "😀": 4, A: 1, é: 3 }),
    );
  });

  it("rejects unknown keys and preserves null-not-zero observations", () => {
    const input = {
      ...createSyntheticContractInput(),
      unexpected: true,
    };
    const unknownKeyReport = buildGuidesIntegrationPreflight(input);
    const emptyReport = buildGuidesIntegrationPreflight({});

    expect(unknownKeyReport.blockers.map((item) => item.code)).toContain(
      "input-invalid",
    );
    expect(emptyReport.identity).toEqual({
      artifactDigest: null,
      graphDigest: null,
      modelDigest: null,
      descriptorsDigest: null,
    });
    expect(emptyReport.counts.observedPillars).toBeNull();
    expect(emptyReport.counts.observedSurfaces).toBeNull();
  });

  it("rejects unknown keys recursively inside the Ticket 25 report", () => {
    const input = clonePlain(createSyntheticContractInput()) as unknown as {
      ticket25: {
        sourceRetirementReport: {
          artifact: Record<string, unknown>;
        };
      };
    };
    input.ticket25.sourceRetirementReport.artifact.unexpected = true;

    expect(blockerCodes(input)).toContain("input-invalid");
  });

  it("requires independent content and production actors", () => {
    const input = createSyntheticContractInput();
    if (
      !input.releaseBinding?.contentApproval ||
      !input.releaseBinding.productionApproval
    )
      throw new Error("Expected release approvals fixture.");
    input.releaseBinding.productionApproval.actor =
      input.releaseBinding.contentApproval.actor;

    expect(blockerCodes(input)).toContain("approval-not-independent");
  });

  it("binds every render check to the declared render artifact and current integration artifact", () => {
    const evidenceDrift = createSyntheticContractInput();
    if (!evidenceDrift.renderAcceptance)
      throw new Error("Expected render fixture.");
    evidenceDrift.renderAcceptance.checks.mobile.evidence!.digest =
      ARTIFACT_DIGEST;

    const integrationDrift = createSyntheticContractInput();
    if (!integrationDrift.renderAcceptance)
      throw new Error("Expected render fixture.");
    integrationDrift.renderAcceptance.artifactDigest =
      computeGuidesIntegrationArtifactDigest({ kind: "stale-integration" });

    expect(blockerCodes(evidenceDrift)).toContain(
      "render-artifact-digest-drift",
    );
    expect(blockerCodes(integrationDrift)).toContain(
      "render-artifact-digest-drift",
    );
  });

  it("rejects non-Guides sources, duplicate references, and unstable reference ordering", () => {
    const nonGuides = createSyntheticContractInput();
    const duplicate = createSyntheticContractInput();
    const unsorted = createSyntheticContractInput();
    if (
      !nonGuides.projections ||
      !duplicate.projections ||
      !unsorted.projections
    )
      throw new Error("Expected projection fixtures.");

    nonGuides.projections.surfaces.navigation.references[0].sourceContentId =
      "services.factory-audit";
    duplicate.projections.surfaces.navigation.references.push(
      clonePlain(duplicate.projections.surfaces.navigation.references[0]),
    );
    unsorted.projections.surfaces.navigation.references.reverse();

    expect(blockerCodes(nonGuides)).toContain("projection-non-guides-leak");
    expect(blockerCodes(duplicate)).toContain("projection-identity-drift");
    expect(blockerCodes(unsorted)).toContain("projection-identity-drift");
  });

  it.each([
    [
      "Ticket 25 is blocked",
      (input: GuidesIntegrationPreflightInput) => {
        if (!input.ticket25) return;
        const report = input.ticket25.sourceRetirementReport;
        const { reportDigest: _reportDigest, ...subject } = report;
        void _reportDigest;
        const blockedSubject = { ...subject, status: "blocked" as const };
        input.ticket25.sourceRetirementReport = {
          ...blockedSubject,
          reportDigest: computeSourceRetirementReportDigest(blockedSubject),
        };
      },
      "ticket25-blocked",
    ],
    [
      "Ticket 25 artifact binding drifts",
      (input: GuidesIntegrationPreflightInput) => {
        if (!input.ticket25) return;
        const report = input.ticket25.sourceRetirementReport;
        const { reportDigest: _reportDigest, ...subject } = report;
        void _reportDigest;
        const driftedSubject = {
          ...subject,
          artifact: {
            ...subject.artifact,
            digest: computeGuidesIntegrationArtifactDigest({
              kind: "different-ticket25-artifact",
            }),
          },
        };
        input.ticket25.sourceRetirementReport = {
          ...driftedSubject,
          reportDigest: computeSourceRetirementReportDigest(driftedSubject),
        };
      },
      "artifact-digest-drift",
    ],
    [
      "Ticket 25 report digest is tampered",
      (input: GuidesIntegrationPreflightInput) => {
        if (input.ticket25) {
          input.ticket25.sourceRetirementReport.reportDigest =
            computeGuidesIntegrationArtifactDigest({
              kind: "tampered-ticket25-report",
            });
        }
      },
      "ticket25-report-digest-drift",
    ],
    [
      "graph digest drifts",
      (input: GuidesIntegrationPreflightInput) => {
        input.graph.digest = "f".repeat(64);
      },
      "graph-digest-drift",
    ],
    [
      "approved route drifts",
      (input: GuidesIntegrationPreflightInput) => {
        if (input.urlDisposition)
          input.urlDisposition.destinations[0].route =
            "/article/supplier-verification-drift";
      },
      "url-destination-mismatch",
    ],
    [
      "projection digest drifts",
      (input: GuidesIntegrationPreflightInput) => {
        if (input.projections)
          input.projections.surfaces.footer.graphDigest = "e".repeat(64);
      },
      "projection-digest-drift",
    ],
    [
      "rollout is partial",
      (input: GuidesIntegrationPreflightInput) => {
        if (!input.projections) return;
        input.projections.rollout.mode = "partial";
        input.projections.rollout.status = "partial";
        input.projections.rollout.readySurfaces = ["route"];
      },
      "rollout-partial",
    ],
    [
      "release binding drifts",
      (input: GuidesIntegrationPreflightInput) => {
        if (input.releaseBinding)
          input.releaseBinding.artifactDigest =
            computeGuidesIntegrationArtifactDigest({
              kind: "different-release-artifact",
            });
      },
      "release-digest-drift",
    ],
    [
      "mobile review is incomplete",
      (input: GuidesIntegrationPreflightInput) => {
        if (input.renderAcceptance)
          input.renderAcceptance.checks.mobile.status = "unknown";
      },
      "render-review-incomplete",
    ],
  ] as const)("fails closed when %s", (_label, mutate, expectedCode) => {
    expectBlockedBy(mutate, expectedCode);
  });

  it("rejects an unsupported contract version", () => {
    const input = createSyntheticContractInput();
    const invalid = {
      ...input,
      graph: { ...input.graph, version: 2 },
    };

    expect(blockerCodes(invalid)).toContain("input-invalid");
  });

  it("rejects future-dated evidence using an explicit synthetic fixture", () => {
    expectBlockedBy((input) => {
      input.graph.evidence = evidence(
        "synthetic-future-graph-evidence",
        SYNTHETIC_FUTURE_CAPTURED_AT,
      );
    }, "future-dated-evidence");
  });

  it("rejects crawlable filter state in both Guides and surface projections", () => {
    const input = createSyntheticContractInput();
    const model = input.guides.model as GuidesDiscoveryReadyResult;
    const mutableFilters = model.guides.filters as unknown as {
      stateTransport: string;
    };
    mutableFilters.stateTransport = "url-query";
    if (input.projections?.surfaces.route.filter) {
      input.projections.surfaces.route.filter.queryResultUrls = [
        "/article?cluster=factory-audit",
      ];
    }

    const codes = blockerCodes(input);
    expect(codes).toContain("guides-filter-crawlable");
    expect(codes).toContain("projection-filter-crawlable");
  });

  it.each([
    [
      "Services",
      "services.factory-audit",
      "/services",
      "service-factory-audit",
    ],
    ["legal", "legal.privacy", "/privacy", "legal-privacy"],
  ])(
    "keeps %s identities outside every Guides-only projection",
    (_label, contentId, route, graphNodeId) => {
      const input = createSyntheticContractInput();
      if (!input.projections) throw new Error("Expected projections fixture.");
      input.projections.surfaces.navigation.references.push({
        kind: "link",
        sourceContentId: "guides.discovery",
        targetContentId: contentId,
        targetRoute: route,
        targetCanonicalRoute: route,
        targetGraphNodeId: graphNodeId,
      });

      expect(blockerCodes(input)).toContain("projection-non-guides-leak");
    },
  );

  it("rejects accessibility ID collisions and incomplete stable focus references", () => {
    const input = createSyntheticContractInput();
    const model = input.guides.model as GuidesDiscoveryReadyResult;
    const duplicateId = model.guides.articles.items[0].elementId;
    const recent = model.guides.recent.items[0] as unknown as {
      elementId: string;
    };
    recent.elementId = duplicateId;
    const focusOrder = model.guides.accessibility
      .focusOrder as unknown as string[];
    focusOrder.push(focusOrder[0]);

    expect(blockerCodes(input)).toContain("accessibility-id-collision");
  });

  it("rejects a missing graph pillar and a surface identity that no longer matches it", () => {
    const input = createSyntheticContractInput();
    const graph = input.graph.input as GraphInput;
    graph.clusters[0].pillarId = null;
    input.graph.digest = digestGraphInput(graph);

    const codes = blockerCodes(input);
    expect(codes).toContain("graph-route-mismatch");
    expect(codes).toContain("projection-identity-drift");
  });

  it("sorts reason codes, paths, and messages by Unicode code point", () => {
    const input = createSyntheticContractInput();
    if (!input.ticket25 || !input.projections || !input.renderAcceptance) {
      throw new Error("Expected complete synthetic fixture.");
    }
    const ticket25Report = input.ticket25.sourceRetirementReport;
    const { reportDigest: _reportDigest, ...ticket25Subject } = ticket25Report;
    void _reportDigest;
    const blockedTicket25Subject = {
      ...ticket25Subject,
      status: "blocked" as const,
    };
    input.ticket25.sourceRetirementReport = {
      ...blockedTicket25Subject,
      reportDigest: computeSourceRetirementReportDigest(blockedTicket25Subject),
    };
    input.projections.rollout.status = "partial";
    input.renderAcceptance.checks.keyboard.status = "unknown";

    const blockers = buildGuidesIntegrationPreflight(input).blockers;
    const keys = blockers.map(
      (item) => `${item.code}\u0000${item.path}\u0000${item.message}`,
    );

    expect(keys).toEqual([...keys].sort(compareCodePoints));
  });

  it("preserves the exact five canonical clusters one-to-one", () => {
    const input = createSyntheticContractInput();
    const model = input.guides.model as GuidesDiscoveryReadyResult;
    const observed = model.guides.pillars.items.map(
      (pillar) => pillar.clusterId,
    );

    expect(observed).toEqual(CANONICAL_CLUSTER_IDS);
    expect(new Set<ClusterId>(observed).size).toBe(5);
  });
});
