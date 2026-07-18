import { clusterRegistry } from "../../../content/seo/clusters";
import { articleMigrationLedger } from "../../../content/seo/migration-ledger";
import { ARTICLE_GOVERNED_FIELDS } from "../articleSchema";
import type { ClusterId } from "../clusterSchema";
import {
  computeMigrationLedgerDigest,
  defineMigrationLedger,
  type MigrationLedger,
  type MigrationLedgerReport,
  validateMigrationLedger,
} from "../migrationLedger";
import {
  buildClusterMigrationPreview,
  GOVERNED_MIGRATION_CLUSTER_CONTRACTS,
  type GovernedMigrationClusterId,
  type MigrationArticleSnapshot,
} from "./clusterMigrationPreview";

type DeepMutable<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? DeepMutable<Item>[]
    : T extends object
      ? { -readonly [Key in keyof T]: DeepMutable<T[Key]> }
      : T;

const SYNTHETIC_REVIEWER = "synthetic-test-only-reviewer";
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
      `Synthetic test ledger failed to lock: ${report.issues
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
  if (!plan) throw new Error(`Missing synthetic plan for ${clusterId}.`);

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

function previewWith(
  clusterId: GovernedMigrationClusterId,
  input?: Partial<{
    ledger: MigrationLedger;
    report: MigrationLedgerReport;
    articles: readonly MigrationArticleSnapshot[];
  }>,
) {
  const approved = approveSyntheticLedger();
  return buildClusterMigrationPreview({
    ledger: input?.ledger ?? approved.ledger,
    ledgerReport: input?.report ?? approved.report,
    clusterId,
    articles: input?.articles ?? snapshotsFor(approved.ledger, clusterId),
  });
}

describe("cluster migration preview governance", () => {
  it("keeps the real pending ledger fail-closed with zero mutation commands", () => {
    const report = currentPendingReport();
    const preview = buildClusterMigrationPreview({
      ledger: articleMigrationLedger,
      ledgerReport: report,
      clusterId: "supplier-verification",
      articles: snapshotsFor(articleMigrationLedger, "supplier-verification"),
    });

    expect(report).toMatchObject({
      status: "approval-required",
      locked: false,
      digest:
        "38ed6dc3e224c45aa39457b4193b0e7dc5ff491eaedda0ab52697eac0165d2dd",
    });
    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toEqual(
      expect.arrayContaining([
        "ledger-not-locked",
        "cluster-plan-not-approved",
        "entry-decision-not-approved",
      ]),
    );
    expect(preview.articlePlans).toHaveLength(6);
  });

  it.each([
    ["supplier-verification", 6, "/article/verify-chinese-supplier"],
    ["factory-audit", 1, "/article/supplier-audit-check-sheet-china"],
  ] as const)(
    "creates a deterministic execution-ready synthetic preview for %s",
    (clusterId, expectedCount, pillarRoute) => {
      const approved = approveSyntheticLedger();
      const preview = buildClusterMigrationPreview({
        ledger: approved.ledger,
        ledgerReport: approved.report,
        clusterId,
        articles: snapshotsFor(approved.ledger, clusterId).reverse(),
      });

      expect(preview.executable).toBe(true);
      expect(
        preview.diagnostics.filter(({ severity }) => severity === "error"),
      ).toEqual([]);
      expect(preview.articlePlans).toHaveLength(expectedCount);
      expect(preview.mutationCommands).toHaveLength(expectedCount);
      expect(preview.articlePlans.map(({ route }) => route)).toEqual(
        GOVERNED_MIGRATION_CLUSTER_CONTRACTS[clusterId].baselineRoutes,
      );
      expect(
        preview.articlePlans.filter(
          ({ contentRole }) => contentRole === "pillar",
        ),
      ).toHaveLength(1);

      const pillar = preview.articlePlans.find(
        ({ route }) => route === pillarRoute,
      );
      expect(pillar?.expectedFrontmatter.editorialPillar).toBe(pillarRoute);
      expect(pillar?.expectedLinks).toEqual(
        expectedBodyLinks(approved.ledger, clusterId, pillarRoute),
      );
      expect(Object.keys(pillar?.expectedFrontmatter ?? {}).sort()).toEqual(
        [...ARTICLE_GOVERNED_FIELDS].sort(),
      );
      expect(
        preview.mutationCommands.every(
          ({ preconditions, mutation }) =>
            preconditions.expectedRoute ===
              preconditions.expectedCanonicalRoute &&
            mutation.routeChange === null &&
            mutation.canonicalChange === null,
        ),
      ).toBe(true);
    },
  );

  it("rejects digest and report identity tampering even when locked is claimed", () => {
    const approved = approveSyntheticLedger();
    const preview = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: {
        ...approved.report,
        digest: "0".repeat(64),
      },
      clusterId: "supplier-verification",
      articles: snapshotsFor(approved.ledger, "supplier-verification"),
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toEqual(
      expect.arrayContaining([
        "ledger-report-digest-mismatch",
        "ledger-lock-contract-mismatch",
      ]),
    );
  });

  it("rejects claimed locks with invalid global approval metadata or any pending non-target entry", () => {
    const approved = approveSyntheticLedger();
    const tampered = mutableLedger(approved.ledger);
    tampered.approval.reviewer = null;
    tampered.approval.approvalDate = "2026-02-30";
    const nonTarget = tampered.entries.find(
      ({ classification }) => classification.cluster === "china-sourcing",
    );
    if (!nonTarget) throw new Error("Missing synthetic non-target entry.");
    nonTarget.decision.reviewStatus = "pending";
    nonTarget.decision.reviewer = null;
    nonTarget.decision.reviewedOn = null;
    tampered.protection.expectedDigest = computeMigrationLedgerDigest(tampered);
    const ledger = defineMigrationLedger(tampered);
    const report: MigrationLedgerReport = {
      status: "valid",
      locked: true,
      digest: computeMigrationLedgerDigest(ledger),
      issues: [],
    };
    const preview = buildClusterMigrationPreview({
      ledger,
      ledgerReport: report,
      clusterId: "supplier-verification",
      articles: snapshotsFor(ledger, "supplier-verification"),
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toEqual(
      expect.arrayContaining([
        "ledger-approval-metadata-invalid",
        "ledger-entry-decisions-incomplete",
      ]),
    );
  });

  it("rejects missing, extra, mismatched, or drifted article identities", () => {
    const approved = approveSyntheticLedger();
    const baseline = snapshotsFor(approved.ledger, "supplier-verification");
    const missing = previewWith("supplier-verification", {
      ledger: approved.ledger,
      report: approved.report,
      articles: baseline.slice(1),
    });
    const extra = previewWith("supplier-verification", {
      ledger: approved.ledger,
      report: approved.report,
      articles: [
        ...baseline,
        {
          ...baseline[0],
          contentId: "article.synthetic-extra",
          slug: "synthetic-extra",
          route: "/article/synthetic-extra",
          canonicalRoute: "/article/synthetic-extra",
        },
      ],
    });
    const drifted = previewWith("supplier-verification", {
      ledger: approved.ledger,
      report: approved.report,
      articles: baseline.map((article, index) =>
        index === 0
          ? { ...article, canonicalRoute: "/article/changed-route" }
          : article,
      ),
    });
    const mismatched = previewWith("supplier-verification", {
      ledger: approved.ledger,
      report: approved.report,
      articles: baseline.map((article, index) =>
        index === 0
          ? {
              ...article,
              contentId: "article.synthetic-identity-tamper",
              slug: "synthetic-identity-tamper",
            }
          : article,
      ),
    });

    expect(issueCodes(missing)).toContain("article-snapshot-missing");
    expect(issueCodes(extra)).toContain("article-snapshot-unexpected");
    expect(issueCodes(drifted)).toContain("canonical-route-drift");
    expect(issueCodes(mismatched)).toContain("article-identity-mismatch");
    for (const preview of [missing, extra, drifted, mismatched]) {
      expect(preview.executable).toBe(false);
      expect(preview.mutationCommands).toEqual([]);
    }
  });

  it("rejects ledger link, pillar, destructive-action, and cross-cluster tampering", () => {
    const approved = approveSyntheticLedger();
    const tampered = mutableLedger(approved.ledger);
    const supplierEntries = tampered.entries.filter(
      ({ classification }) =>
        classification.cluster === "supplier-verification",
    );
    supplierEntries[0].requiredLinks = [];
    supplierEntries[1].classification.role = "pillar";
    supplierEntries[2].decision.action = "redirect";
    const supplierPlan = tampered.clusterPlans.find(
      ({ cluster }) => cluster === "supplier-verification",
    );
    if (!supplierPlan) throw new Error("Missing synthetic supplier plan.");
    supplierPlan.memberRoutes = supplierPlan.memberRoutes.slice(1);
    supplierPlan.editorialPillar.contentId = "article.synthetic-wrong-pillar";
    const supplierDuplicate = tampered.entries.find(
      ({ classification }) => classification.cluster === "china-sourcing",
    );
    if (!supplierDuplicate)
      throw new Error("Missing synthetic duplicate seed.");
    supplierDuplicate.contentId = supplierEntries[3].contentId;
    tampered.protection.expectedDigest = computeMigrationLedgerDigest(tampered);
    const ledger = defineMigrationLedger(tampered);
    const report: MigrationLedgerReport = {
      status: "valid",
      locked: true,
      digest: computeMigrationLedgerDigest(ledger),
      issues: [],
    };
    const preview = buildClusterMigrationPreview({
      ledger,
      ledgerReport: report,
      clusterId: "supplier-verification",
      articles: snapshotsFor(ledger, "supplier-verification"),
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toEqual(
      expect.arrayContaining([
        "required-links-contract-mismatch",
        "pillar-count-mismatch",
        "cluster-plan-contract-mismatch",
        "cluster-member-routes-mismatch",
        "destructive-action-forbidden",
        "cross-cluster-primary-assignment",
      ]),
    );
  });

  it("enforces the exact one-route Factory Audit frozen baseline", () => {
    const approved = approveSyntheticLedger();
    const tampered = mutableLedger(approved.ledger);
    const source = tampered.entries.find(
      ({ classification }) =>
        classification.cluster === "supplier-verification",
    );
    if (!source)
      throw new Error("Missing synthetic factory-audit tamper seed.");
    source.classification.cluster = "factory-audit";
    tampered.protection.expectedDigest = computeMigrationLedgerDigest(tampered);
    const ledger = defineMigrationLedger(tampered);
    const report: MigrationLedgerReport = {
      status: "valid",
      locked: true,
      digest: computeMigrationLedgerDigest(ledger),
      issues: [],
    };
    const preview = buildClusterMigrationPreview({
      ledger,
      ledgerReport: report,
      clusterId: "factory-audit",
      articles: snapshotsFor(ledger, "factory-audit"),
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toEqual(
      expect.arrayContaining([
        "frozen-baseline-membership-mismatch",
        "factory-audit-baseline-count-mismatch",
      ]),
    );
  });

  it("does not allow approved editorial status to overstate weak evidence", () => {
    const approved = approveSyntheticLedger();
    const articles = snapshotsFor(approved.ledger, "supplier-verification");
    articles[0] = {
      ...articles[0],
      frontmatter: {
        ...articles[0].frontmatter,
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
      clusterId: "supplier-verification",
      articles,
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toEqual(
      expect.arrayContaining([
        "approved-status-without-reviewed-evidence",
        "methodology-reference-missing",
        "claim-boundary-missing",
      ]),
    );
  });

  it("allows visible evidence gaps only when the planned status remains draft", () => {
    const approved = approveSyntheticLedger();
    const articles = snapshotsFor(approved.ledger, "factory-audit");
    articles[0] = {
      ...articles[0],
      frontmatter: {
        ...articles[0].frontmatter,
        editorialStatus: "draft",
        evidenceIds: [],
      },
      evidenceReadiness: {
        status: "gaps-visible",
        methodologyRef: null,
        claimBoundary: "Known evidence limitations must remain visible.",
      },
    };
    const preview = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "factory-audit",
      articles,
    });

    expect(preview.executable).toBe(true);
    expect(issueCodes(preview)).toContain("evidence-gap-visible");
    expect(
      preview.diagnostics.find(({ code }) => code === "evidence-gap-visible")
        ?.severity,
    ).toBe("advisory");
    expect(preview.mutationCommands).toHaveLength(1);
  });

  it("is byte-stable for reversed inputs, uses code-point order, and deep-freezes output", () => {
    const approved = approveSyntheticLedger();
    const articles = snapshotsFor(approved.ledger, "supplier-verification");
    const forward = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "supplier-verification",
      articles,
    });
    const reversed = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: {
        ...approved.report,
        issues: [...approved.report.issues].reverse(),
      },
      clusterId: "supplier-verification",
      articles: [...articles].reverse().map((article) => ({
        ...article,
        currentLinks: [...article.currentLinks].reverse(),
        frontmatter: {
          ...article.frontmatter,
          secondaryKeywords: [
            ...article.frontmatter.secondaryKeywords,
          ].reverse(),
          evidenceIds: [...article.frontmatter.evidenceIds].reverse(),
        },
      })),
    });

    expect(JSON.stringify(forward)).toBe(JSON.stringify(reversed));
    expect(Object.isFrozen(forward)).toBe(true);
    expect(Object.isFrozen(forward.articlePlans)).toBe(true);
    expect(Object.isFrozen(forward.articlePlans[0].expectedLinks)).toBe(true);
    expect(() => {
      (
        forward.articlePlans as unknown as Array<
          (typeof forward.articlePlans)[number]
        >
      ).push(forward.articlePlans[0]);
    }).toThrow();
  });

  it("never emits URL mutation fields or executable commands while an entry decision is pending", () => {
    const approved = approveSyntheticLedger();
    const tampered = mutableLedger(approved.ledger);
    const target = tampered.entries.find(
      ({ classification }) =>
        classification.cluster === "supplier-verification",
    );
    if (!target) throw new Error("Missing synthetic pending decision seed.");
    target.decision.reviewStatus = "pending";
    target.decision.reviewer = null;
    target.decision.reviewedOn = null;
    tampered.protection.expectedDigest = computeMigrationLedgerDigest(tampered);
    const ledger = defineMigrationLedger(tampered);
    const report: MigrationLedgerReport = {
      status: "valid",
      locked: true,
      digest: computeMigrationLedgerDigest(ledger),
      issues: [],
    };
    const preview = buildClusterMigrationPreview({
      ledger,
      ledgerReport: report,
      clusterId: "supplier-verification",
      articles: snapshotsFor(ledger, "supplier-verification"),
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toContain("entry-decision-not-approved");
    expect(
      preview.articlePlans.every(
        ({ route, canonicalRoute }) => route === canonicalRoute,
      ),
    ).toBe(true);
  });

  it("rejects unsupported cluster ids at runtime without mutating inputs", () => {
    const approved = approveSyntheticLedger();
    const articles = snapshotsFor(approved.ledger, "supplier-verification");
    const before = JSON.stringify({ ledger: approved.ledger, articles });
    const preview = buildClusterMigrationPreview({
      ledger: approved.ledger,
      ledgerReport: approved.report,
      clusterId: "not-a-cluster" as ClusterId as GovernedMigrationClusterId,
      articles,
    });

    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(issueCodes(preview)).toContain("unsupported-migration-cluster");
    expect(JSON.stringify({ ledger: approved.ledger, articles })).toBe(before);
  });
});
