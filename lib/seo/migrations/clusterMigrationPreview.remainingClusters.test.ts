import { clusterRegistry } from "../../../content/seo/clusters";
import { articleMigrationLedger } from "../../../content/seo/migration-ledger";
import { CANONICAL_CLUSTER_IDS, type ClusterId } from "../clusterSchema";
import {
  computeMigrationLedgerDigest,
  defineMigrationLedger,
  type MigrationLedger,
  type MigrationLedgerReport,
  validateMigrationLedger,
} from "../migrationLedger";
import {
  buildClusterMigrationPreview,
  deriveGovernedMigrationClusterContracts,
  GOVERNED_MIGRATION_CLUSTER_CONTRACTS,
  GOVERNED_MIGRATION_CLUSTER_IDS,
  type GovernedMigrationClusterId,
  type MigrationArticleSnapshot,
  type MigrationPreviewGovernanceBinding,
} from "./clusterMigrationPreview";

type DeepMutable<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? DeepMutable<Item>[]
    : T extends object
      ? { -readonly [Key in keyof T]: DeepMutable<T[Key]> }
      : T;

const REMAINING_CLUSTER_IDS = [
  "quality-inspection",
  "factory-visits",
  "china-sourcing",
] as const satisfies readonly GovernedMigrationClusterId[];
const SYNTHETIC_REVIEWER = "synthetic-ticket-09-11-reviewer";
const SYNTHETIC_REVIEW_DATE = "2026-07-17";
const SYNTHETIC_REVIEW_DUE_DATE = "2026-07-18";

function mutableLedger(
  ledger: MigrationLedger = articleMigrationLedger,
): DeepMutable<MigrationLedger> {
  return structuredClone(ledger) as DeepMutable<MigrationLedger>;
}

function approveSyntheticLedger(): {
  readonly ledger: MigrationLedger;
  readonly report: MigrationLedgerReport;
} {
  const ledger = mutableLedger();
  ledger.approval = {
    approvalStatus: "approved",
    reviewer: SYNTHETIC_REVIEWER,
    approvalDate: SYNTHETIC_REVIEW_DATE,
  };
  ledger.clusterPlans = ledger.clusterPlans.map((plan) => ({
    ...plan,
    editorialPillar: {
      ...plan.editorialPillar,
      approvalStatus: "approved",
    },
  }));
  ledger.entries = ledger.entries.map((entry) => ({
    ...entry,
    decision: {
      ...entry.decision,
      reviewStatus: "approved",
      reviewer: SYNTHETIC_REVIEWER,
      reviewedOn: SYNTHETIC_REVIEW_DATE,
    },
  }));
  ledger.cannibalisationReviews = ledger.cannibalisationReviews.map(
    (review) => ({
      ...review,
      approvalStatus: "approved",
      reviewer: SYNTHETIC_REVIEWER,
      reviewedOn: SYNTHETIC_REVIEW_DATE,
    }),
  );
  ledger.protection.expectedDigest = computeMigrationLedgerDigest(ledger);

  const frozenLedger = defineMigrationLedger(ledger);
  const report = validateMigrationLedger(frozenLedger, {
    baseline: frozenLedger.entries.map(({ contentId, slug, route }) => ({
      contentId,
      slug,
      route,
    })),
    clusterRegistry,
  });

  if (!report.locked || report.status !== "valid") {
    throw new Error(
      `Synthetic ledger failed to lock: ${report.issues
        .map(({ code }) => code)
        .join(", ")}`,
    );
  }

  return { ledger: frozenLedger, report };
}

function currentPendingReport(): MigrationLedgerReport {
  return validateMigrationLedger(articleMigrationLedger, {
    baseline: articleMigrationLedger.entries.map(
      ({ contentId, slug, route }) => ({ contentId, slug, route }),
    ),
    clusterRegistry,
  });
}

function expectedBodyLinks(
  ledger: MigrationLedger,
  clusterId: GovernedMigrationClusterId,
  route: string,
): string[] {
  const plan = ledger.clusterPlans.find(({ cluster }) => cluster === clusterId);
  if (!plan) throw new Error(`Missing plan for ${clusterId}.`);

  return route === plan.editorialPillar.route
    ? [plan.commercialRoot, ...plan.memberRoutes].sort()
    : [plan.commercialRoot, plan.editorialPillar.route].sort();
}

function snapshotsFor(
  ledger: MigrationLedger,
  clusterId: GovernedMigrationClusterId,
): MigrationArticleSnapshot[] {
  return ledger.entries
    .filter(({ classification }) => classification.cluster === clusterId)
    .map((entry) => ({
      contentId: entry.contentId,
      slug: entry.slug,
      route: entry.route,
      canonicalRoute: entry.route,
      currentLinks: expectedBodyLinks(ledger, clusterId, entry.route),
      frontmatter: {
        author: "Synthetic Test Author",
        primaryKeyword: `synthetic ${entry.slug}`,
        secondaryKeywords: [],
        editorialStatus: "approved",
        evidenceIds: [`evidence.synthetic.${entry.slug}`],
        firstPartyContributionId: null,
        reviewedBy: SYNTHETIC_REVIEWER,
        reviewedDate: SYNTHETIC_REVIEW_DATE,
        reviewDueDate: SYNTHETIC_REVIEW_DUE_DATE,
      },
      evidenceReadiness: {
        status: "reviewed",
        methodologyRef: `methodology.synthetic.${entry.slug}`,
        claimBoundary: "Synthetic test-only claim boundary.",
      },
    }));
}

function issueCodes(
  preview: ReturnType<typeof buildClusterMigrationPreview>,
): string[] {
  return preview.diagnostics.map(({ code }) => code);
}

function fixtureBinding(digest: string): MigrationPreviewGovernanceBinding {
  return {
    origin: "fixture",
    public: false,
    releaseId: "ticket-09-11-preview-release",
    artifactDigest: digest,
    rollbackArtifactDigest: digest,
    rollbackOwner: "human-release-owner",
    rollbackTriggers: ["identity-drift", "post-release-review-failure"],
    rollbackSteps: ["stop-execution", "restore-baseline-artifact"],
  };
}

describe("remaining governed cluster migration contracts", () => {
  it("derives all five immutable contracts from the canonical registry and ledger", () => {
    expect(GOVERNED_MIGRATION_CLUSTER_IDS).toEqual(CANONICAL_CLUSTER_IDS);

    const derived = deriveGovernedMigrationClusterContracts(
      clusterRegistry,
      articleMigrationLedger,
    );

    expect(derived).toEqual(GOVERNED_MIGRATION_CLUSTER_CONTRACTS);
    for (const clusterId of CANONICAL_CLUSTER_IDS) {
      const registryCluster = clusterRegistry.clusters.find(
        ({ id }) => id === clusterId,
      );
      const plan = articleMigrationLedger.clusterPlans.find(
        ({ cluster }) => cluster === clusterId,
      );
      if (!registryCluster || !plan) throw new Error(`Missing ${clusterId}.`);

      const contract = derived[clusterId];
      expect(contract.commercialRoot).toBe(registryCluster.commercialRoot);
      expect(contract.commercialRoot).toBe(plan.commercialRoot);
      expect(contract.editorialPillar).toBe(plan.editorialPillar.route);
      expect(contract.editorialPillarStatus).toBe(plan.editorialPillar.status);
      expect(contract.editorialPillarContentId).toBe(
        plan.editorialPillar.contentId,
      );
      expect(contract.integrationTicket).toBe(
        plan.editorialPillar.integrationTicket,
      );
      expect(contract.baselineCount).toBe(plan.baselineCount);
      expect(contract.baselineRoutes).toEqual(plan.baselineRoutes);
      expect(contract.memberRoutes).toEqual(plan.memberRoutes);
      expect(contract.entries.map(({ route }) => route)).toEqual(
        plan.baselineRoutes,
      );
    }

    expect(Object.isFrozen(derived)).toBe(true);
    expect(Object.isFrozen(derived["china-sourcing"])).toBe(true);
    expect(Object.isFrozen(derived["china-sourcing"].entries)).toBe(true);
  });

  it.each(REMAINING_CLUSTER_IDS)(
    "%s remains blocked by the current production ledger and emits no commands",
    (clusterId) => {
      const preview = buildClusterMigrationPreview({
        ledger: articleMigrationLedger,
        ledgerReport: currentPendingReport(),
        clusterId,
        articles: snapshotsFor(articleMigrationLedger, clusterId),
      });

      expect(preview.executable).toBe(false);
      expect(preview.mutationCommands).toEqual([]);
      expect(issueCodes(preview)).toEqual(
        expect.arrayContaining(["ledger-not-locked"]),
      );
      if (clusterId === "quality-inspection") {
        expect(issueCodes(preview)).toContain(
          "planned-new-pillar-create-required",
        );
      }
    },
  );

  it.each([
    ["factory-visits", 3, "10"],
    ["china-sourcing", 13, "11"],
  ] as const)(
    "%s validates a synthetic approved baseline with fixture-only release and rollback binding",
    (clusterId, expectedCount, ticket) => {
      const approved = approveSyntheticLedger();
      const digest = computeMigrationLedgerDigest(approved.ledger);
      const preview = buildClusterMigrationPreview({
        ledger: approved.ledger,
        ledgerReport: approved.report,
        clusterId,
        articles: snapshotsFor(approved.ledger, clusterId),
        governanceBinding: fixtureBinding(digest),
      });

      expect(preview.ticket).toBe(ticket);
      expect(preview.executable).toBe(false);
      expect(preview.articlePlans).toHaveLength(expectedCount);
      expect(preview.mutationCommands).toEqual([]);
      expect(preview.ledgerDigest).toBe(digest);
      expect(preview.governanceBinding).toEqual(
        expect.objectContaining({
          origin: "fixture",
          public: false,
          artifactDigest: digest,
          rollbackArtifactDigest: digest,
        }),
      );
      expect(
        preview.diagnostics
          .filter(({ severity }) => severity === "error")
          .map(({ code }) => code),
      ).toEqual(["fixture-execution-forbidden"]);
    },
  );

  it("keeps the planned-new Quality Inspection exception fail-closed until Ticket 09 represents a create action", () => {
    const approved = approveSyntheticLedger();
    const digest = computeMigrationLedgerDigest(approved.ledger);
    const preview = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "quality-inspection",
      articles: [],
      governanceBinding: fixtureBinding(digest),
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toContain("planned-new-pillar-create-required");
  });

  it("requires a split for unrelated clusters, oversized scopes, and unknown counts", () => {
    const approved = approveSyntheticLedger();
    const digest = computeMigrationLedgerDigest(approved.ledger);
    const articles = snapshotsFor(approved.ledger, "factory-visits");

    const unrelated = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "factory-visits",
      articles,
      governanceBinding: fixtureBinding(digest),
      scope: {
        clusterIds: ["factory-visits", "china-sourcing"],
      },
    });
    expect(unrelated.executable).toBe(false);
    expect(unrelated.mutationCommands).toEqual([]);
    expect(issueCodes(unrelated)).toContain("scope-split-required");

    const oversized = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "factory-visits",
      articles,
      governanceBinding: fixtureBinding(digest),
      scope: { articleCount: articles.length, maxArticleCount: 2 },
    });
    expect(oversized.executable).toBe(false);
    expect(oversized.mutationCommands).toEqual([]);
    expect(issueCodes(oversized)).toContain("scope-split-required");

    const unknown = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "factory-visits",
      articles,
      governanceBinding: fixtureBinding(digest),
      scope: { articleCount: null },
    });
    expect(unknown.executable).toBe(false);
    expect(unknown.mutationCommands).toEqual([]);
    expect(issueCodes(unknown)).toContain("scope-count-unknown");
  });

  it.each([
    "cluster-entry-contract-mismatch",
    "article-identity-mismatch",
    "canonical-route-drift",
    "required-links-contract-mismatch",
    "destructive-action-forbidden",
    "cross-cluster-primary-assignment",
  ] as const)("fails closed for remaining-cluster tamper: %s", (tamper) => {
    const approved = approveSyntheticLedger();
    const ledger = mutableLedger(approved.ledger);
    const target = ledger.entries.find(
      ({ classification }) => classification.cluster === "factory-visits",
    );
    if (!target) throw new Error("Missing factory-visits synthetic entry.");

    if (tamper === "cluster-entry-contract-mismatch") {
      target.classification = {
        ...target.classification,
        funnelStage: "decision",
      };
    } else if (tamper === "article-identity-mismatch") {
      target.slug = `${target.slug}-tampered`;
    } else if (tamper === "required-links-contract-mismatch") {
      target.requiredLinks = ["/services"];
    } else if (tamper === "destructive-action-forbidden") {
      target.decision = { ...target.decision, action: "redirect" };
    } else if (tamper === "cross-cluster-primary-assignment") {
      target.route = "/article/importing-from-china-australia-guide";
    }

    const frozenLedger = defineMigrationLedger(ledger);
    const report: MigrationLedgerReport = {
      ...approved.report,
      digest: computeMigrationLedgerDigest(frozenLedger),
      locked: true,
      status: "valid",
    };
    const articles = snapshotsFor(frozenLedger, "factory-visits");
    if (tamper === "canonical-route-drift") {
      const snapshot = articles[0];
      if (!snapshot) throw new Error("Missing factory-visits snapshot.");
      articles[0] = { ...snapshot, canonicalRoute: `${snapshot.route}-drift` };
    }

    const preview = buildClusterMigrationPreview({
      ledger: frozenLedger,
      ledgerReport: report,
      clusterId: "factory-visits",
      articles,
      governanceBinding: fixtureBinding(report.digest),
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toContain(tamper);
  });

  it("rejects fixture bindings that claim public or executable release state", () => {
    const approved = approveSyntheticLedger();
    const digest = computeMigrationLedgerDigest(approved.ledger);
    const preview = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "factory-visits",
      articles: snapshotsFor(approved.ledger, "factory-visits"),
      governanceBinding: {
        ...fixtureBinding(digest),
        origin: "fixture",
        public: true,
      },
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toEqual(
      expect.arrayContaining([
        "fixture-public-forbidden",
        "fixture-execution-forbidden",
      ]),
    );
  });

  it("does not mutate inputs and deep-freezes a deterministic preview", () => {
    const approved = approveSyntheticLedger();
    const digest = computeMigrationLedgerDigest(approved.ledger);
    const articles = snapshotsFor(approved.ledger, "china-sourcing");
    const before = JSON.stringify({ ledger: approved.ledger, articles });
    const forward = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "china-sourcing",
      articles,
      governanceBinding: fixtureBinding(digest),
    });
    const reversed = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: {
        ...approved.report,
        issues: [...approved.report.issues].reverse(),
      },
      clusterId: "china-sourcing",
      articles: [...articles].reverse().map((article) => ({
        ...article,
        currentLinks: [...article.currentLinks].reverse(),
      })),
      governanceBinding: fixtureBinding(digest),
    });

    expect(JSON.stringify(forward)).toBe(JSON.stringify(reversed));
    expect(JSON.stringify({ ledger: approved.ledger, articles })).toBe(before);
    expect(Object.isFrozen(forward)).toBe(true);
    expect(Object.isFrozen(forward.governanceBinding)).toBe(true);
    expect(Object.isFrozen(forward.mutationCommands)).toBe(true);
  });

  it.each(["factory-visits", "china-sourcing"] as const)(
    "%s requires an explicit production release and rollback binding",
    (clusterId) => {
      const approved = approveSyntheticLedger();
      const preview = buildClusterMigrationPreview({
        ledger: approved.ledger,
        ledgerReport: approved.report,
        clusterId,
        articles: snapshotsFor(approved.ledger, clusterId),
      });

      expect(preview.executable).toBe(false);
      expect(preview.mutationCommands).toEqual([]);
      expect(issueCodes(preview)).toContain("governance-binding-required");
    },
  );

  it("blocks draft evidence for a remaining cluster even when the ledger is synthetically approved", () => {
    const approved = approveSyntheticLedger();
    const digest = computeMigrationLedgerDigest(approved.ledger);
    const articles = snapshotsFor(approved.ledger, "factory-visits");
    const first = articles[0];
    if (!first) throw new Error("Missing factory-visits draft seed.");
    articles[0] = {
      ...first,
      frontmatter: {
        ...first.frontmatter,
        editorialStatus: "draft",
        evidenceIds: [],
      },
      evidenceReadiness: {
        status: "gaps-visible",
        methodologyRef: null,
        claimBoundary: null,
      },
    };

    const preview = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "factory-visits",
      articles,
      governanceBinding: fixtureBinding(digest),
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toContain("draft-evidence-forbidden");
  });

  it("treats null review dates and malformed binding arrays as invalid instead of throwing", () => {
    const approved = approveSyntheticLedger();
    const digest = computeMigrationLedgerDigest(approved.ledger);
    const articles = snapshotsFor(approved.ledger, "factory-visits");
    const first = articles[0];
    if (!first) throw new Error("Missing factory-visits null-date seed.");
    articles[0] = {
      ...first,
      frontmatter: {
        ...first.frontmatter,
        reviewedDate: null as unknown as string,
      },
    };

    const preview = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "factory-visits",
      articles,
      governanceBinding: {
        ...fixtureBinding(digest),
        rollbackTriggers: null as unknown as readonly string[],
        rollbackSteps: null as unknown as readonly string[],
      },
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toEqual(
      expect.arrayContaining([
        "article-review-contract-invalid",
        "rollback-binding-invalid",
      ]),
    );
  });

  it("keeps invalid runtime cluster ids fail-closed without treating a canonical cluster as unsupported", () => {
    const approved = approveSyntheticLedger();
    const preview = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "not-a-cluster" as ClusterId,
      articles: [],
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toContain("unsupported-migration-cluster");
  });
});
