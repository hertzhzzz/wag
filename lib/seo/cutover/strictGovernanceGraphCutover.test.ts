import { createHash } from "node:crypto";

import { articleMigrationLedger } from "../../../content/seo/migration-ledger";
import type { GraphInput } from "../graph/types";
import { digestGraphInput } from "../graph/canonical";
import type { MigrationLedger } from "../migrationLedger";
import { computeMigrationLedgerDigest } from "../migrationLedger";
import {
  MIGRATION_PREVIEW_CONTRACT_ID,
  type ArticleMigrationPlan,
  type ClusterMigrationPreview,
  type GovernedMigrationTicket,
  type PlannedGovernedFrontmatter,
} from "../migrations/clusterMigrationPreview";
import type { ChinaSourcingOverlaysMigrationPreview } from "../migrations/overlaysMigrationPreview";
import {
  buildStrictGovernanceGraphCutover,
  computeStrictCutoverSourceDigest,
  exportStrictGovernanceGraphCutoverDependency,
  parseStrictGovernanceGraphCutoverDependency,
  STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE,
  type StrictGovernanceGraphCutoverInput,
} from "./index";

const TICKETS: readonly GovernedMigrationTicket[] = [
  "07",
  "08",
  "09",
  "10",
  "11",
];
const CLUSTERS = [
  "supplier-verification",
  "factory-audit",
  "quality-inspection",
  "factory-visits",
  "china-sourcing",
] as const;

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

function fixtureLedger(): MigrationLedger {
  const unsigned = {
    ...articleMigrationLedger,
    baseline: { ...articleMigrationLedger.baseline, asOf: "2026-07-17" },
    approval: {
      approvalStatus: "approved" as const,
      reviewer: "fixture-reviewer",
      approvalDate: "2026-07-18",
    },
    protection: { algorithm: "sha256" as const, expectedDigest: null },
  };
  const digest = computeMigrationLedgerDigest(unsigned);
  return {
    ...unsigned,
    protection: { algorithm: "sha256", expectedDigest: digest },
  };
}

function planFor(
  entry: MigrationLedger["entries"][number],
  cluster: (typeof CLUSTERS)[number],
  role: "pillar" | "supporting",
): ArticleMigrationPlan {
  const frontmatter: PlannedGovernedFrontmatter = {
    contentId: entry.contentId,
    cluster,
    contentRole: role,
    searchIntent: entry.classification.searchIntent,
    funnelStage: entry.classification.funnelStage,
    primaryKeyword: `${entry.slug} keyword`,
    secondaryKeywords: ["fixture keyword"],
    targetMarket: "AU",
    editorialStatus: "approved",
    evidenceIds: [`evidence-${entry.contentId}`],
    firstPartyContributionId: `contribution-${entry.contentId}`,
    commercialRoot: `/services/${cluster}`,
    editorialPillar: `/guides/${cluster}-pillar`,
    requiredLinks: [`/services/${cluster}`, `/guides/${cluster}-pillar`],
    reviewedBy: "fixture-reviewer",
    reviewedDate: "2026-07-18",
    reviewDueDate: "2026-07-18",
    migrationAction: "keep",
  };
  return {
    contentId: entry.contentId,
    slug: entry.slug,
    route: entry.route,
    canonicalRoute: entry.route,
    contentRole: role,
    preservedAuthor: "Winning Adventure Global editorial team",
    expectedLinks: frontmatter.requiredLinks,
    linksToAdd: [],
    expectedFrontmatter: frontmatter,
    evidenceReadiness: {
      status: "reviewed",
      methodologyRef: "fixture-methodology-v1",
      claimBoundary: "fixture claims are synthetic and not public evidence",
    },
  };
}

function buildFixtureGraph(plans: readonly ArticleMigrationPlan[]): GraphInput {
  const nodes: GraphInput["nodes"] = [];
  const relationships: GraphInput["relationships"] = [];
  const clusters: GraphInput["clusters"] = [];

  for (const cluster of CLUSTERS) {
    const clusterPlans = plans.filter(
      (plan) => plan.expectedFrontmatter.cluster === cluster,
    );
    const pillar = clusterPlans.find((plan) => plan.contentRole === "pillar");
    const rootId = `root-${cluster}`;
    const pillarId = pillar ? `article-${plans.indexOf(pillar)}` : "";
    clusters.push({ id: cluster, rootId, pillarId });
    nodes.push({
      id: rootId,
      nodeType: "root",
      title: `${cluster} root`,
      destination: `/services/${cluster}`,
      status: "published",
      funnelStage: "decision",
      topics: [cluster],
    });

    for (const plan of clusterPlans) {
      const articleId = `article-${plans.indexOf(plan)}`;
      nodes.push({
        id: articleId,
        nodeType: "article",
        title: plan.slug,
        destination: plan.route,
        status: "published",
        cluster,
        contentRole: plan.contentRole,
        funnelStage: plan.expectedFrontmatter.funnelStage,
        intent: plan.expectedFrontmatter.searchIntent,
        primaryKeyword: plan.expectedFrontmatter.primaryKeyword,
        topics: [cluster, plan.slug],
      });
      for (const [index, [sourceId, targetId]] of [
        [plan.contentId, rootId],
        [rootId, plan.contentId],
      ].entries()) {
        relationships.push({
          id: `rel-${cluster}-${plans.indexOf(plan)}-${index}`,
          sourceId: sourceId === plan.contentId ? articleId : sourceId,
          targetId: targetId === plan.contentId ? articleId : targetId,
          type: "cluster-member",
          funnelDirection: index === 0 ? "forward" : "backward",
          priority: index,
          anchor: plan.slug,
        });
      }
    }
  }

  return { version: 1, status: "ready", clusters, nodes, relationships };
}

function buildFixtureInput(
  overrides: Partial<StrictGovernanceGraphCutoverInput> = {},
): StrictGovernanceGraphCutoverInput {
  const ledger = fixtureLedger();
  const entries = [...ledger.entries];
  const plans: ArticleMigrationPlan[] = entries.map((entry, index) => {
    const cluster = CLUSTERS[index % CLUSTERS.length];
    return planFor(
      entry,
      cluster,
      index < CLUSTERS.length ? "pillar" : "supporting",
    );
  });
  const ledgerDigest = computeMigrationLedgerDigest(ledger);
  const clusterPreviews = CLUSTERS.map((cluster, index) => ({
    contractId: MIGRATION_PREVIEW_CONTRACT_ID,
    version: 1 as const,
    asOf: STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE,
    dataMode: "synthetic_fixture" as const,
    clusterId: cluster,
    ticket: TICKETS[index],
    ledgerDigest,
    previewReady: true,
    executionAuthorization: "not-authorized" as const,
    executable: false as const,
    diagnostics: [],
    articlePlans: plans.filter(
      (plan) => plan.expectedFrontmatter.cluster === cluster,
    ),
    mutationCommands: [],
    governanceBinding: {
      origin: "fixture" as const,
      public: false,
      releaseId: `fixture-release-${TICKETS[index]}`,
      artifactDigest: ledgerDigest,
      rollbackArtifactDigest: ledgerDigest,
      rollbackOwner: "fixture-owner",
      rollbackTriggers: ["fixture verification failure"],
      rollbackSteps: ["restore fixture artifact"],
    },
  })) as unknown as readonly ClusterMigrationPreview[];
  const graphInput = buildFixtureGraph(plans);
  const graphDigest = digestGraphInput(graphInput);
  const overlaysPreview = {
    version: 1 as const,
    ticket: "12" as const,
    clusterId: "china-sourcing" as const,
    mode: "fixture" as const,
    ledgerDigest,
    status: "ready" as const,
    contractReady: true,
    executable: false as const,
    diagnostics: [],
    parentJourney: null,
    scopeSplit: { supportingRoutes: [], industryOverlayRoutes: [] },
    entries: [],
    industryOverlays: [],
    articlePlans: [],
    mutationCommands: [],
    governanceBinding: null,
  } as unknown as ChinaSourcingOverlaysMigrationPreview;
  const sourceDigest = computeStrictCutoverSourceDigest({
    ledgerDigest,
    clusterPreviews,
    overlaysPreview,
    graphDigest,
  });
  const generatedAt = "2026-07-19";
  const generatedArtifacts = [
    "articles.json",
    "clusters.json",
    "link-graph.json",
    "freshness.json",
  ].map((name) => ({
    name,
    content: JSON.stringify({ name, sourceDigest }),
    digest: "" as string,
    sourceDigest,
    generatedAt,
    deterministic: true as const,
  }));
  for (const artifact of generatedArtifacts)
    artifact.digest = sha256(artifact.content);

  return {
    asOf: STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE,
    mode: "dry-run",
    origin: "synthetic_fixture",
    public: false,
    ledger,
    ledgerReport: {
      status: "valid",
      locked: true,
      digest: ledgerDigest,
      issues: [],
    },
    clusterPreviews,
    overlaysPreview,
    graph: {
      origin: "synthetic_fixture",
      public: false,
      deterministic: true,
      generatedAt,
      inputDigest: graphDigest,
      input: graphInput,
    },
    generatedArtifacts,
    ...overrides,
  } as StrictGovernanceGraphCutoverInput;
}

describe("strict governance graph cutover contract", () => {
  it("returns a non-executable ready dry-run for a deterministic synthetic fixture", () => {
    const result = buildStrictGovernanceGraphCutover(buildFixtureInput());

    expect(result.status).toBe("scaffold-ready");
    expect(result.executable).toBe(false);
    expect(result.commands).toEqual([]);
    expect(result.mode).toBe("dry-run");
    expect(result.asOfDate).toBe(STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE);
  });

  it("rejects unknown keys at the exact runtime boundary", () => {
    const input = { ...buildFixtureInput(), unexpected: true } as unknown;
    const result = buildStrictGovernanceGraphCutover(input);

    expect(result.status).toBe("blocked");
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unknown-input-key",
          path: "input.unexpected",
        }),
      ]),
    );
  });

  it("rejects unknown nested graph keys and non-deterministic input", () => {
    const fixture = buildFixtureInput();
    const input = {
      ...fixture,
      graph: { ...fixture.graph, deterministic: false, unknownGraphKey: true },
    } as unknown;
    const result = buildStrictGovernanceGraphCutover(input);

    expect(result.status).toBe("blocked");
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unknown-input-key",
          path: "graph.unknownGraphKey",
        }),
        expect.objectContaining({ code: "non-deterministic-input" }),
      ]),
    );
  });

  it("fails closed when an artifact digest or graph lineage is tampered", () => {
    const fixture = buildFixtureInput();
    const tampered = {
      ...fixture,
      graph: { ...fixture.graph, inputDigest: "0".repeat(64) },
      generatedArtifacts: fixture.generatedArtifacts.map((artifact, index) =>
        index === 0
          ? { ...artifact, content: `${artifact.content}tampered` }
          : artifact,
      ),
    };
    const result = buildStrictGovernanceGraphCutover(tampered);

    expect(result.status).toBe("blocked");
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "graph-digest-mismatch" }),
        expect.objectContaining({ code: "artifact-digest-mismatch" }),
      ]),
    );
  });

  it("requires reciprocal root connectivity and reports orphan articles", () => {
    const fixture = buildFixtureInput();
    const graph = structuredClone(fixture.graph.input);
    graph.relationships = graph.relationships.filter(
      (relationship) =>
        relationship.sourceId !==
        graph.nodes.find((node) => node.nodeType === "article")?.id,
    );
    const result = buildStrictGovernanceGraphCutover({
      ...fixture,
      graph: {
        ...fixture.graph,
        input: graph,
        inputDigest: digestGraphInput(graph),
      },
    });

    expect(result.status).toBe("blocked");
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "root-not-reciprocal" }),
        expect.objectContaining({ code: "orphan-article" }),
      ]),
    );
  });

  it("fails closed without throwing on malformed nested runtime input", () => {
    const fixture = buildFixtureInput();
    const result = buildStrictGovernanceGraphCutover({
      ...fixture,
      ledger: null,
      ledgerReport: null,
      overlaysPreview: {
        ...fixture.overlaysPreview,
        mutationCommands: null,
      },
    });

    expect(result.status).toBe("blocked");
    expect(result.executable).toBe(false);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid-ledger" }),
        expect.objectContaining({ code: "invalid-ledger-report" }),
        expect.objectContaining({ code: "overlay-execution-not-isolated" }),
      ]),
    );
  });

  it("blocks actual mode at the scaffold boundary without commands", () => {
    const result = buildStrictGovernanceGraphCutover({
      ...buildFixtureInput(),
      mode: "actual",
    });

    expect(result).toEqual(
      expect.objectContaining({
        status: "blocked",
        executable: false,
        commands: [],
        rollback: null,
      }),
    );
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "actual-mode-not-supported" }),
      ]),
    );
  });

  it("rejects supplied approval bindings because this scaffold cannot authorize production", () => {
    const result = buildStrictGovernanceGraphCutover({
      ...buildFixtureInput(),
      releaseWorkflow: { releaseId: "forged-approval" },
    });

    expect(result).toEqual(
      expect.objectContaining({
        status: "blocked",
        executable: false,
        commands: [],
        rollback: null,
        lineage: null,
      }),
    );
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "approval-binding-not-accepted" }),
      ]),
    );
  });

  it("rejects future production governance dates across ledger approval and reviews", () => {
    const fixture = buildFixtureInput();
    const ledger = structuredClone(
      fixture.ledger,
    ) as unknown as MigrationLedger;
    const mutableLedger = ledger as unknown as {
      approval: { approvalDate: string };
      entries: Array<{ decision: { reviewedOn: string | null } }>;
      cannibalisationReviews: Array<{ reviewedOn: string | null }>;
    };
    mutableLedger.approval.approvalDate = "2026-07-19";
    mutableLedger.entries[0].decision.reviewedOn = "2026-07-19";
    mutableLedger.cannibalisationReviews[0].reviewedOn = "2026-07-19";
    const previews = structuredClone(
      fixture.clusterPreviews,
    ) as unknown as ClusterMigrationPreview[];
    const mutablePreviews = previews as unknown as Array<{
      asOf: string;
      dataMode: "actual" | "synthetic_fixture";
      articlePlans: Array<{
        expectedFrontmatter: {
          reviewedDate: string;
          reviewDueDate: string;
        };
      }>;
    }>;
    for (const preview of mutablePreviews) preview.dataMode = "actual";
    mutablePreviews[0].asOf = "2026-07-19";
    mutablePreviews[0].articlePlans[0].expectedFrontmatter.reviewedDate =
      "2026-07-19";
    mutablePreviews[0].articlePlans[0].expectedFrontmatter.reviewDueDate =
      "2026-07-20";

    const result = buildStrictGovernanceGraphCutover({
      ...fixture,
      origin: "production",
      public: true,
      ledger,
      clusterPreviews: previews,
      graph: {
        ...fixture.graph,
        origin: "production",
        public: true,
        generatedAt: "2026-07-18",
      },
      generatedArtifacts: fixture.generatedArtifacts.map((artifact) => ({
        ...artifact,
        generatedAt: "2026-07-18",
      })),
    });

    expect(result.status).toBe("blocked");
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "ledger.approval.approvalDate" }),
        expect.objectContaining({ path: "clusterPreviews[0].asOf" }),
        expect.objectContaining({
          path: "ledger.entries[0].decision.reviewedOn",
        }),
        expect.objectContaining({
          path: "ledger.cannibalisationReviews[0].reviewedOn",
        }),
        expect.objectContaining({
          path: "clusterPreviews[0].articlePlans[0].expectedFrontmatter.reviewedDate",
        }),
        expect.objectContaining({
          path: "clusterPreviews[0].articlePlans[0].expectedFrontmatter.reviewDueDate",
        }),
      ]),
    );
  });

  it("exports a frozen strict dependency and rejects copied or drifted lineage", () => {
    const result = buildStrictGovernanceGraphCutover(buildFixtureInput());
    const dependency = exportStrictGovernanceGraphCutoverDependency(result);

    expect(dependency).toEqual(
      expect.objectContaining({
        ticket: "13",
        status: "scaffold-ready",
        asOf: STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE,
        mode: "dry-run",
        executable: false,
        commands: [],
        migrationLedgerDigest: result.lineage?.ledgerDigest,
        ticket12OverlayDigest: result.lineage?.overlaysPreviewDigest,
        graphDigest: result.lineage?.graphDigest,
        artifactSetDigest: result.lineage?.artifactSetDigest,
        cutoverDigest: result.lineage?.cutoverDigest,
        dependencyDigest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/),
      }),
    );
    expect(Object.isFrozen(dependency)).toBe(true);
    expect(() => {
      (dependency as unknown as { status: string }).status = "blocked";
    }).toThrow();
    expect(() => {
      (
        dependency.ticket07To11PreviewDigests as unknown as Record<
          string,
          string
        >
      )["07"] = sha256("mutation");
    }).toThrow();
    expect(parseStrictGovernanceGraphCutoverDependency(dependency)).toEqual(
      dependency,
    );
    expect(() =>
      parseStrictGovernanceGraphCutoverDependency({
        ...dependency,
        graphDigest: sha256("lineage-drift"),
      }),
    ).toThrow(/lineage drift/i);
    expect(() =>
      parseStrictGovernanceGraphCutoverDependency({
        ...dependency,
        unknown: true,
      }),
    ).toThrow(/invalid/i);
    expect(() =>
      exportStrictGovernanceGraphCutoverDependency({ ...result }),
    ).toThrow(/trusted scaffold result/i);
    expect(() =>
      exportStrictGovernanceGraphCutoverDependency({
        ...result,
        lineage: result.lineage
          ? {
              ...result.lineage,
              cutoverDigest: sha256("drift") as `sha256:${string}`,
            }
          : null,
      }),
    ).toThrow(/trusted scaffold result/i);
  });
});
