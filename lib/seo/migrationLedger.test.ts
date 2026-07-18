import { articleMigrationLedger } from "../../content/seo/migration-ledger";
import { clusterRegistry } from "../../content/seo/clusters";
import { SEO_BASELINE_COHORT } from "./generation/baseline";
import {
  APPROVAL_REQUIRED_CODE,
  MIGRATION_LEDGER_ACTIONS,
  MIGRATION_SEARCH_INTENTS,
  compareCodePoints,
  computeMigrationLedgerDigest,
  sortCodePoints,
  validateMigrationLedger,
  type MigrationLedger,
} from "./migrationLedger";

type Mutable<T> = T extends readonly (infer Item)[]
  ? Mutable<Item>[]
  : T extends object
    ? { -readonly [Key in keyof T]: Mutable<T[Key]> }
    : T;

function cloneLedger(): MigrationLedger {
  return JSON.parse(JSON.stringify(articleMigrationLedger)) as MigrationLedger;
}

function mutableLedger(): Mutable<MigrationLedger> {
  return JSON.parse(
    JSON.stringify(articleMigrationLedger),
  ) as Mutable<MigrationLedger>;
}

function validate(ledger: MigrationLedger = articleMigrationLedger) {
  return validateMigrationLedger(ledger, {
    baseline: SEO_BASELINE_COHORT,
    clusterRegistry,
  });
}

function issueCodes(ledger: MigrationLedger): string[] {
  return validate(ledger).issues.map(({ code }) => code);
}

describe("article migration ledger", () => {
  it("fails closed on unsupported ledger metadata and impossible calendar dates", () => {
    const invalidMetadata = mutableLedger();
    Reflect.set(invalidMetadata, "ledgerVersion", 2);
    invalidMetadata.baseline.id = " ";
    invalidMetadata.baseline.asOf = "2026-02-30";
    Reflect.set(invalidMetadata.protection, "algorithm", "sha1");

    expect(issueCodes(invalidMetadata)).toEqual(
      expect.arrayContaining([
        "unsupported-ledger-version",
        "invalid-baseline-id",
        "invalid-baseline-date",
        "invalid-protection-algorithm",
      ]),
    );

    const invalidMeasurementDate = mutableLedger();
    invalidMeasurementDate.entries[0].opportunity.liveInputs.gscClicks = {
      value: 10,
      dataStatus: "static-snapshot",
      source: "Test-only snapshot",
      asOf: "2026-02-30",
    };
    expect(issueCodes(invalidMeasurementDate)).toContain(
      "available-input-requires-valid-date",
    );

    const invalidReviewDate = mutableLedger();
    invalidReviewDate.entries[0].decision.reviewStatus = "approved";
    invalidReviewDate.entries[0].decision.reviewer = "Test-only reviewer";
    invalidReviewDate.entries[0].decision.reviewedOn = "2026-02-30";
    expect(issueCodes(invalidReviewDate)).toContain(
      "approved-review-requires-valid-date",
    );
  });

  it("locks the exact 23 frozen identities once each without changing a URL", () => {
    const identities = articleMigrationLedger.entries.map(
      ({ contentId, slug, route }) => ({ contentId, slug, route }),
    );

    expect(identities).toHaveLength(23);
    expect(identities).toEqual(SEO_BASELINE_COHORT);
    expect(new Set(identities.map(({ contentId }) => contentId)).size).toBe(23);
    expect(new Set(identities.map(({ slug }) => slug)).size).toBe(23);
    expect(new Set(identities.map(({ route }) => route)).size).toBe(23);

    for (const identity of identities) {
      expect(identity.contentId).toBe(`article.${identity.slug}`);
      expect(identity.route).toBe(`/article/${identity.slug}`);
    }
  });

  it("reports duplicate, missing, unexpected, and URL-changing identities", () => {
    const duplicate = mutableLedger();
    duplicate.entries[1] = duplicate.entries[0];
    expect(issueCodes(duplicate)).toEqual(
      expect.arrayContaining([
        "duplicate-content-id",
        "duplicate-slug",
        "duplicate-route",
        "baseline-identity-missing",
      ]),
    );

    const missing = mutableLedger();
    missing.entries.pop();
    expect(issueCodes(missing)).toContain("baseline-identity-missing");

    const unexpected = mutableLedger();
    unexpected.entries.push({
      ...unexpected.entries[0],
      contentId: "article.unexpected-article",
      slug: "unexpected-article",
      route: "/article/unexpected-article",
    });
    expect(issueCodes(unexpected)).toContain("baseline-identity-unexpected");

    const changedUrl = mutableLedger();
    changedUrl.entries[0].route = "/article/renamed-route";
    expect(issueCodes(changedUrl)).toEqual(
      expect.arrayContaining([
        "identity-route-mismatch",
        "baseline-identity-missing",
        "baseline-identity-unexpected",
      ]),
    );
  });

  it("uses only governed cluster, role, intent, funnel, market, and action values", () => {
    const allowedClusters = new Set(
      clusterRegistry.clusters.map(({ id }) => id),
    );

    for (const entry of articleMigrationLedger.entries) {
      expect(allowedClusters.has(entry.classification.cluster)).toBe(true);
      expect(
        clusterRegistry.clusters
          .find(({ id }) => id === entry.classification.cluster)
          ?.allowedRoles.includes(entry.classification.role),
      ).toBe(true);
      expect(MIGRATION_SEARCH_INTENTS).toContain(
        entry.classification.searchIntent,
      );
      expect(MIGRATION_LEDGER_ACTIONS).toContain(entry.decision.action);
      expect(entry.decision.rationale.length).toBeGreaterThan(20);
      expect(entry.decision.lowTrafficAloneSufficient).toBe(false);
      expect(entry.decision.reviewer).toBeNull();
      expect(entry.decision.reviewedOn).toBeNull();
    }

    const invalid = mutableLedger();
    Reflect.set(invalid.entries[0].classification, "cluster", "not-a-cluster");
    Reflect.set(invalid.entries[1].classification, "role", "not-a-role");
    Reflect.set(
      invalid.entries[2].classification,
      "searchIntent",
      "not-an-intent",
    );
    Reflect.set(
      invalid.entries[3].classification,
      "funnelStage",
      "not-a-stage",
    );
    Reflect.set(
      invalid.entries[4].classification,
      "targetMarket",
      "not-a-market",
    );
    Reflect.set(invalid.entries[5].decision, "action", "create");

    expect(issueCodes(invalid)).toEqual(
      expect.arrayContaining([
        "invalid-cluster",
        "invalid-role",
        "invalid-search-intent",
        "invalid-funnel-stage",
        "invalid-target-market",
        "invalid-migration-action",
      ]),
    );
  });

  it("keeps or refreshes every existing article and never treats low traffic as removal evidence", () => {
    expect(
      articleMigrationLedger.entries.every(({ decision }) =>
        ["keep", "refresh"].includes(decision.action),
      ),
    ).toBe(true);
    expect(
      articleMigrationLedger.entries.some(({ decision }) =>
        ["merge", "redirect", "retire"].includes(decision.action),
      ),
    ).toBe(false);
    expect(
      articleMigrationLedger.entries.some(
        ({ contentId }) =>
          contentId === "article.china-quality-inspection-guide",
      ),
    ).toBe(false);

    const unsafe = mutableLedger();
    Reflect.set(unsafe.entries[0].decision, "action", "retire");
    Reflect.set(unsafe.entries[0].decision, "lowTrafficAloneSufficient", true);
    unsafe.entries[0].decision.rationale = "Low traffic.";
    expect(issueCodes(unsafe)).toEqual(
      expect.arrayContaining([
        "destructive-action-requires-approval",
        "low-traffic-not-sufficient",
      ]),
    );
  });

  it("has one existing pillar per populated cluster and an explicit planned quality exception", () => {
    const expectedPillars = {
      "supplier-verification": "/article/verify-chinese-supplier",
      "factory-audit": "/article/supplier-audit-check-sheet-china",
      "factory-visits":
        "/article/visiting-chinese-factories-australian-business-checklist",
      "china-sourcing": "/article/importing-from-china-australia-guide",
    } as const;

    for (const [cluster, route] of Object.entries(expectedPillars)) {
      const pillars = articleMigrationLedger.entries.filter(
        (entry) =>
          entry.classification.cluster === cluster &&
          entry.classification.role === "pillar",
      );
      expect(pillars.map((entry) => entry.route)).toEqual([route]);
    }

    expect(
      articleMigrationLedger.entries.filter(
        (entry) => entry.classification.cluster === "quality-inspection",
      ),
    ).toHaveLength(0);

    const qualityPlan = articleMigrationLedger.clusterPlans.find(
      ({ cluster }) => cluster === "quality-inspection",
    );
    expect(qualityPlan).toMatchObject({
      baselineCount: 0,
      commercialRoot: "/quality-inspection-china",
      editorialPillar: {
        status: "planned-new",
        route: "/article/china-quality-inspection-guide",
        contentId: null,
        approvalStatus: "pending",
        integrationTicket: "09",
      },
      baselineRoutes: [],
      memberRoutes: [],
    });

    const duplicatePillar = mutableLedger();
    const secondPillar = duplicatePillar.entries.find(
      (entry) =>
        entry.classification.cluster === "supplier-verification" &&
        entry.classification.role !== "pillar",
    );
    expect(secondPillar).toBeDefined();
    secondPillar!.classification.role = "pillar";
    expect(issueCodes(duplicatePillar)).toContain("cluster-pillar-count");
  });

  it("maps every member to its canonical commercial root and proposed editorial pillar", () => {
    for (const plan of articleMigrationLedger.clusterPlans) {
      const cluster = clusterRegistry.clusters.find(
        ({ id }) => id === plan.cluster,
      );
      expect(plan.commercialRoot).toBe(cluster?.commercialRoot);

      const entries = articleMigrationLedger.entries.filter(
        (entry) => entry.classification.cluster === plan.cluster,
      );
      expect(plan.baselineCount).toBe(entries.length);
      expect(plan.baselineRoutes).toEqual(
        sortCodePoints(entries.map(({ route }) => route)),
      );
      expect(plan.memberRoutes).toEqual(
        sortCodePoints(
          entries
            .filter(({ classification }) => classification.role !== "pillar")
            .map(({ route }) => route),
        ),
      );

      for (const entry of entries) {
        const expectedLinks =
          entry.classification.role === "pillar"
            ? [plan.commercialRoot]
            : sortCodePoints([plan.commercialRoot, plan.editorialPillar.route]);
        expect(entry.requiredLinks).toEqual(expectedLinks);
      }
    }

    const incomplete = mutableLedger();
    const member = incomplete.entries.find(
      (entry) => entry.classification.role !== "pillar",
    );
    expect(member).toBeDefined();
    member!.requiredLinks = [member!.requiredLinks[0]];
    expect(issueCodes(incomplete)).toContain("member-required-link-missing");

    const incompletePlan = mutableLedger();
    incompletePlan.clusterPlans[0].memberRoutes.pop();
    expect(issueCodes(incompletePlan)).toContain(
      "cluster-membership-incomplete",
    );
  });

  it("exposes explainable score inputs and keeps unavailable live data null", () => {
    expect(articleMigrationLedger.opportunityModel.dimensions).toEqual([
      {
        id: "service-lead-relevance",
        weight: 30,
        description:
          "Fit with a commercial service and likelihood of a qualified lead.",
      },
      {
        id: "australian-action-intent",
        weight: 20,
        description:
          "Strength of Australia-relevant, action-oriented search intent.",
      },
      {
        id: "evidence-readiness",
        weight: 15,
        description:
          "Readiness of governed evidence and first-party contribution.",
      },
      {
        id: "gsc-performance",
        weight: 15,
        description: "Google Search Console demand and ranking opportunity.",
      },
      {
        id: "serp-gap",
        weight: 10,
        description: "Competitor and SERP coverage gap.",
      },
      {
        id: "geo-answerability",
        weight: 10,
        description:
          "Ability to provide a direct, attributable answer for AI retrieval.",
      },
    ]);
    expect(
      articleMigrationLedger.opportunityModel.dimensions.reduce(
        (total, { weight }) => total + weight,
        0,
      ),
    ).toBe(100);
    expect(articleMigrationLedger.riskModel.dimensions).toEqual([
      {
        id: "cannibalisation-risk",
        description: "Intent and keyword overlap with another baseline route.",
      },
      {
        id: "evidence-risk",
        description: "Evidence gaps that could block a safe content refresh.",
      },
      {
        id: "migration-effort",
        description:
          "Implementation effort that must be measured, not guessed.",
      },
    ]);

    for (const entry of articleMigrationLedger.entries) {
      expect(entry.opportunity.totalScore).toBeNull();
      expect(entry.opportunity.dataStatus).toBe("unavailable");

      for (const factor of Object.values(entry.opportunity.factors)) {
        expect(factor.value).toBeNull();
        expect(factor.dataStatus).toBe("unavailable");
        expect(factor.source).toBeNull();
        expect(factor.asOf).toBeNull();
      }

      for (const input of Object.values(entry.opportunity.liveInputs)) {
        expect(input.value).toBeNull();
        expect(input.dataStatus).toBe("unavailable");
        expect(input.source).toBeNull();
        expect(input.asOf).toBeNull();
      }

      expect(entry.risk.totalScore).toBeNull();
      expect(entry.risk.dataStatus).toBe("unavailable");
      for (const factor of Object.values(entry.risk.factors)) {
        expect(factor.value).toBeNull();
        expect(factor.dataStatus).toBe("unavailable");
        expect(factor.source).toBeNull();
        expect(factor.asOf).toBeNull();
      }
    }

    const fabricated = mutableLedger();
    fabricated.entries[0].opportunity.liveInputs.gscClicks.value = 10;
    expect(issueCodes(fabricated)).toContain("unavailable-input-must-be-null");

    const untraceable = mutableLedger();
    untraceable.entries[0].opportunity.liveInputs.gscClicks = {
      value: 10,
      dataStatus: "static-snapshot",
      source: null,
      asOf: null,
    };
    expect(issueCodes(untraceable)).toContain(
      "available-input-requires-provenance",
    );
  });

  it("records explicit cannibalisation analysis without inventing human review", () => {
    expect(
      articleMigrationLedger.cannibalisationReviews.length,
    ).toBeGreaterThan(0);

    for (const review of articleMigrationLedger.cannibalisationReviews) {
      expect(review.analysisStatus).toBe("analysed");
      expect(review.approvalStatus).toBe("pending");
      expect(review.reviewer).toBeNull();
      expect(review.reviewedOn).toBeNull();
      expect(review.routes.length).toBeGreaterThanOrEqual(2);
      expect(review.routes).toEqual(sortCodePoints(review.routes));
      for (const route of review.routes) {
        expect(
          articleMigrationLedger.entries.some((entry) => entry.route === route),
        ).toBe(true);
      }
    }
  });

  it("reports approval-required until a human-approved digest is attached", () => {
    const pending = validate();

    expect(pending.status).toBe("approval-required");
    expect(pending.locked).toBe(false);
    expect(pending.issues.map(({ code }) => code)).toContain(
      APPROVAL_REQUIRED_CODE,
    );
    expect(articleMigrationLedger.approval).toEqual({
      approvalStatus: "pending",
      reviewer: null,
      approvalDate: null,
    });
    expect(articleMigrationLedger.protection.expectedDigest).toBeNull();

    const approved = mutableLedger();
    approved.approval = {
      approvalStatus: "approved",
      reviewer: "Test-only human reviewer",
      approvalDate: "2026-07-18",
    };
    for (const entry of approved.entries) {
      entry.decision.reviewStatus = "approved";
      entry.decision.reviewer = "Test-only human reviewer";
      entry.decision.reviewedOn = "2026-07-18";
    }
    for (const plan of approved.clusterPlans) {
      plan.editorialPillar.approvalStatus = "approved";
    }
    for (const review of approved.cannibalisationReviews) {
      review.approvalStatus = "approved";
      review.reviewer = "Test-only human reviewer";
      review.reviewedOn = "2026-07-18";
    }
    approved.protection.expectedDigest = computeMigrationLedgerDigest(approved);
    const approvedReport = validate(approved);

    expect(approvedReport.status).toBe("valid");
    expect(approvedReport.locked).toBe(true);
    expect(approved.protection.expectedDigest).toBe(
      computeMigrationLedgerDigest(approved),
    );

    const silentlyChanged = JSON.parse(
      JSON.stringify(approved),
    ) as Mutable<MigrationLedger>;
    silentlyChanged.entries[0].decision.action =
      silentlyChanged.entries[0].decision.action === "keep"
        ? "refresh"
        : "keep";
    expect(issueCodes(silentlyChanged)).toContain("ledger-digest-mismatch");
  });

  it("uses deterministic code-point ordering and a stable SHA-256 digest", () => {
    expect(["ä", "z", "A", "a"].sort(compareCodePoints)).toEqual([
      "A",
      "a",
      "z",
      "ä",
    ]);
    expect(sortCodePoints(["ä", "z", "A", "a"])).toEqual(["A", "a", "z", "ä"]);
    expect(sortCodePoints(["😀", "\uE000"])).toEqual(["\uE000", "😀"]);

    const digest = computeMigrationLedgerDigest(articleMigrationLedger);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(computeMigrationLedgerDigest(cloneLedger())).toBe(digest);

    expect(articleMigrationLedger.entries.map(({ slug }) => slug)).toEqual(
      sortCodePoints(articleMigrationLedger.entries.map(({ slug }) => slug)),
    );
    expect(
      articleMigrationLedger.cannibalisationReviews.map(({ id }) => id),
    ).toEqual(
      sortCodePoints(
        articleMigrationLedger.cannibalisationReviews.map(({ id }) => id),
      ),
    );
  });
});
