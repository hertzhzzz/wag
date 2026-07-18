import { CANONICAL_CLUSTER_IDS } from "../clusterSchema";
import {
  GUIDES_INTEGRATION_INVARIANTS,
  buildGuidesDiscoveryViewModel,
  guidesDiscoveryInputSchema,
  selectGuidesArticles,
  validateGuidesIntegrationDescriptors,
} from "./index";
import {
  SYNTHETIC_NON_PUBLIC_FIXTURE,
  createSyntheticArticle,
  createSyntheticNonPublicGuidesInput,
} from "./__fixtures__/synthetic";

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function expectDeepFrozen(value: unknown): void {
  if (value === null || typeof value !== "object") return;

  expect(Object.isFrozen(value)).toBe(true);
  for (const nested of Object.values(value)) {
    expectDeepFrozen(nested);
  }
}

function requireReady(
  result: ReturnType<typeof buildGuidesDiscoveryViewModel>,
) {
  if (result.status !== "ready") {
    throw new Error(
      `Expected a ready Guides model, received: ${JSON.stringify(result.reasons)}`,
    );
  }

  return result;
}

function requireBlocked(
  result: ReturnType<typeof buildGuidesDiscoveryViewModel>,
) {
  if (result.status !== "blocked") {
    throw new Error("Expected the Guides model to fail closed.");
  }

  return result;
}

function recordsOf(
  input: Record<string, unknown>,
): Array<Record<string, unknown>> {
  const articleIndex = input.articleIndex as Record<string, unknown>;
  return articleIndex.records as Array<Record<string, unknown>>;
}

function clustersOf(
  input: Record<string, unknown>,
): Array<Record<string, unknown>> {
  const clusterRegistry = input.clusterRegistry as Record<string, unknown>;
  return clusterRegistry.records as Array<Record<string, unknown>>;
}

describe("Guides discovery domain model", () => {
  it("uses fixtures that are explicitly synthetic and non-public", () => {
    expect(SYNTHETIC_NON_PUBLIC_FIXTURE).toBe(true);
  });

  it("returns exactly the five canonical pillar cards in canonical order", () => {
    const ready = requireReady(
      buildGuidesDiscoveryViewModel(createSyntheticNonPublicGuidesInput()),
    );

    expect(ready.guides.pillars.items).toHaveLength(5);
    expect(ready.guides.pillars.items.map((item) => item.clusterId)).toEqual(
      CANONICAL_CLUSTER_IDS,
    );
    expect(ready.guides.pillars.items.map((item) => item.order)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(
      ready.guides.pillars.items.every((item) =>
        item.href.startsWith("/article/"),
      ),
    ).toBe(true);
  });

  it("fails closed when a pillar destination is unresolved, missing, or invalid", () => {
    const unresolvedInput = createSyntheticNonPublicGuidesInput();
    clustersOf(unresolvedInput)[0].editorialPillar = {
      status: "migration-pending",
      root: null,
      migrationId: "synthetic-pending-pillar",
      reason: "Synthetic pillar destination is not approved.",
    };
    const unresolved = requireBlocked(
      buildGuidesDiscoveryViewModel(unresolvedInput),
    );
    expect(unresolved.reasons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "pillar-unresolved" }),
      ]),
    );
    expect("guides" in unresolved).toBe(false);

    const missingInput = createSyntheticNonPublicGuidesInput();
    const firstRoot = (
      clustersOf(missingInput)[0].editorialPillar as Record<string, unknown>
    ).root;
    const articleIndex = missingInput.articleIndex as Record<string, unknown>;
    articleIndex.records = recordsOf(missingInput).filter(
      (article) => article.route !== firstRoot,
    );
    const missing = requireBlocked(buildGuidesDiscoveryViewModel(missingInput));
    expect(missing.reasons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "pillar-article-missing" }),
      ]),
    );

    const invalidInput = createSyntheticNonPublicGuidesInput();
    (
      clustersOf(invalidInput)[0].editorialPillar as Record<string, unknown>
    ).root = "/services";
    const invalid = requireBlocked(buildGuidesDiscoveryViewModel(invalidInput));
    expect(invalid.reasons[0]).toEqual(
      expect.objectContaining({ code: "input-invalid" }),
    );
    expect("guides" in invalid).toBe(false);
  });

  it("fails closed when a pillar article is blocked from discovery", () => {
    const input = createSyntheticNonPublicGuidesInput();
    const pillarArticle = recordsOf(input).find(
      (article) => article.route === "/article/factory-audit-guide",
    );
    const governance = pillarArticle?.governance as Record<string, unknown>;
    governance.publicationStatus = "blocked";
    governance.discoveryEligibility = "blocked";

    const blocked = requireBlocked(buildGuidesDiscoveryViewModel(input));
    expect(blocked.reasons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "pillar-article-ineligible",
          clusterId: "factory-audit",
        }),
      ]),
    );
  });

  it("models filters as stable, non-crawlable, same-document state", () => {
    const ready = requireReady(
      buildGuidesDiscoveryViewModel(createSyntheticNonPublicGuidesInput()),
    );

    expect(ready.guides.filters).toEqual(
      expect.objectContaining({
        stateKey: "cluster",
        defaultValue: "all",
        stateTransport: "component-memory",
        navigationEffect: "none",
        crawlPolicy: "single-document",
      }),
    );
    expect(ready.guides.filters.options).toHaveLength(6);
    expect(JSON.stringify(ready.guides.filters)).not.toMatch(
      /href|url|route|path|query|resultPage/i,
    );

    const selected = selectGuidesArticles(ready.guides, {
      key: "cluster",
      value: "factory-audit",
    });
    expect(selected.status).toBe("ready");
    if (selected.status === "ready") {
      expect(selected.items.length).toBeGreaterThan(0);
      expect(
        selected.items.every((item) => item.clusterId === "factory-audit"),
      ).toBe(true);
      expect(selected.state).toEqual({
        key: "cluster",
        value: "factory-audit",
      });
    }

    const invalidState = selectGuidesArticles(ready.guides, {
      key: "cluster",
      value: "factory-audit",
      href: "/article?cluster=factory-audit",
    });
    expect(invalidState).toEqual(
      expect.objectContaining({ status: "blocked", code: "state-invalid" }),
    );
  });

  it("orders recent articles by explicit governed date and version, then Unicode code points", () => {
    const input = createSyntheticNonPublicGuidesInput();
    const articleIndex = input.articleIndex as Record<string, unknown>;
    const records = recordsOf(input);
    records.push(
      createSyntheticArticle({
        contentId: "article.version-four-guide",
        route: "/article/version-four-guide",
        title: "Version Four Guide",
        governance: { date: "2026-07-18", version: 4 },
      }),
      createSyntheticArticle({
        contentId: "article.alpha-guide",
        route: "/article/alpha-guide",
        title: "Alpha Guide",
        governance: { date: "2026-07-18", version: 3 },
      }),
      createSyntheticArticle({
        contentId: "article.zulu-guide",
        route: "/article/zulu-guide",
        title: "Zulu Guide",
        governance: { date: "2026-07-18", version: 3 },
      }),
      createSyntheticArticle({
        contentId: "article.angstrom-guide",
        route: "/article/angstrom-guide",
        title: "Ångström Guide",
        governance: { date: "2026-07-18", version: 3 },
      }),
      createSyntheticArticle({
        contentId: "article.prior-date-guide",
        route: "/article/prior-date-guide",
        title: "Prior Date Guide",
        governance: { date: "2026-07-17", version: 99 },
      }),
    );
    articleIndex.records = records;
    (input.presentation as Record<string, unknown>).recentLimit = 20;

    const first = requireReady(buildGuidesDiscoveryViewModel(input));
    const second = requireReady(buildGuidesDiscoveryViewModel(input));
    const titles = first.guides.recent.items.map((article) => article.title);

    expect(titles.slice(0, 5)).toEqual([
      "Version Four Guide",
      "Alpha Guide",
      "Zulu Guide",
      "Ångström Guide",
      "Prior Date Guide",
    ]);
    expect(second.guides.recent.items).toEqual(first.guides.recent.items);
  });

  it("excludes draft, blocked, and redirected articles from browse and recent results", () => {
    const input = createSyntheticNonPublicGuidesInput();
    recordsOf(input).push(
      createSyntheticArticle({
        contentId: "article.synthetic-draft",
        route: "/article/synthetic-draft",
        title: "Synthetic Draft",
        governance: {
          editorialStatus: "draft",
          publicationStatus: "blocked",
          discoveryEligibility: "blocked",
        },
      }),
      createSyntheticArticle({
        contentId: "article.synthetic-blocked",
        route: "/article/synthetic-blocked",
        title: "Synthetic Blocked Guide",
        governance: {
          publicationStatus: "blocked",
          discoveryEligibility: "blocked",
        },
      }),
      createSyntheticArticle({
        contentId: "article.synthetic-redirected",
        route: "/article/synthetic-redirected",
        title: "Synthetic Redirected Guide",
        governance: {
          migrationAction: "redirect",
        },
      }),
    );

    const ready = requireReady(buildGuidesDiscoveryViewModel(input));
    const allIds = ready.guides.articles.items.map(
      (article) => article.contentId,
    );
    const recentIds = ready.guides.recent.items.map(
      (article) => article.contentId,
    );

    for (const excludedId of [
      "article.synthetic-draft",
      "article.synthetic-blocked",
      "article.synthetic-redirected",
    ]) {
      expect(allIds).not.toContain(excludedId);
      expect(recentIds).not.toContain(excludedId);
    }
  });

  it("derives navigation, footer, sitemap, and on-page destinations from one source", () => {
    const ready = requireReady(
      buildGuidesDiscoveryViewModel(createSyntheticNonPublicGuidesInput()),
    );
    const onPage = ready.guides.pillars.items.map((item) => item.href);
    const footer = ready.guides.integration.footer.items.map(
      (item) => item.href,
    );
    const sitemap = ready.guides.integration.sitemap.items
      .filter((item) => item.kind === "editorial-pillar")
      .map((item) => item.href);

    expect(ready.guides.integration.navigation.href).toBe("/article");
    expect(footer).toEqual(onPage);
    expect(sitemap).toEqual(onPage);
    expect(ready.guides.integration.sitemap.items[0]).toEqual(
      expect.objectContaining({ kind: "discovery-root", href: "/article" }),
    );
    expect(
      validateGuidesIntegrationDescriptors(ready.guides.integration),
    ).toEqual(expect.objectContaining({ status: "valid" }));
  });

  it("keeps Guides descriptors isolated from Services and legal navigation", () => {
    const ready = requireReady(
      buildGuidesDiscoveryViewModel(createSyntheticNonPublicGuidesInput()),
    );
    const serialized = JSON.stringify(ready.guides.integration);

    expect(ready.guides.integration.scope).toBe("guides-only");
    expect(Object.keys(ready.guides.integration).sort()).toEqual([
      "footer",
      "navigation",
      "scope",
      "sitemap",
    ]);
    expect(serialized).not.toMatch(/"services"|"legal"/i);
    expect(GUIDES_INTEGRATION_INVARIANTS.map((item) => item.id)).toEqual([
      "guides-only-scope",
      "services-preserved",
      "legal-preserved",
      "destination-parity",
    ]);

    const invalidDescriptor = {
      ...ready.guides.integration,
      services: [],
      legal: [],
    };
    expect(validateGuidesIntegrationDescriptors(invalidDescriptor)).toEqual(
      expect.objectContaining({ status: "blocked" }),
    );
  });

  it("provides deterministic accessibility labels, relationships, focus order, and review checks", () => {
    const ready = requireReady(
      buildGuidesDiscoveryViewModel(createSyntheticNonPublicGuidesInput()),
    );
    const accessibility = ready.guides.accessibility;

    expect(accessibility.sectionLabel).toContain("Winning Adventure Global");
    expect(accessibility.relationships.filterControls).toBe(
      ready.guides.articles.elementId,
    );
    expect(accessibility.relationships.filterStatus).toBe(
      ready.guides.filters.statusElementId,
    );
    expect(accessibility.focusOrder[0]).toBe(
      ready.guides.integration.navigation.elementId,
    );
    expect(accessibility.reviewChecklist.map((item) => item.modality)).toEqual([
      "mobile",
      "desktop",
      "keyboard",
      "screen-reader",
    ]);

    const publicCopy = JSON.stringify({
      heading: ready.guides.heading,
      description: ready.guides.description,
      accessibility,
      integration: ready.guides.integration,
    });
    expect(publicCopy).not.toMatch(/\b(?:WAG|WA)\b/);
    expect(publicCopy).not.toMatch(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u,
    );
    expect(publicCopy).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it("uses distinct accessibility targets for browse and recent article links", () => {
    const ready = requireReady(
      buildGuidesDiscoveryViewModel(createSyntheticNonPublicGuidesInput()),
    );
    const browseIds = ready.guides.articles.items.map(
      (article) => article.elementId,
    );
    const recentIds = ready.guides.recent.items.map(
      (article) => article.elementId,
    );
    const allInteractiveIds = [
      ready.guides.integration.navigation.elementId,
      ...ready.guides.pillars.items.map((pillar) => pillar.elementId),
      ...ready.guides.filters.options.map((option) => option.controlId),
      ...browseIds,
      ...recentIds,
    ];

    expect(browseIds.every((id) => id.startsWith("guides-browse-"))).toBe(true);
    expect(recentIds.every((id) => id.startsWith("guides-recent-"))).toBe(true);
    expect(new Set([...browseIds, ...recentIds]).size).toBe(
      browseIds.length + recentIds.length,
    );
    expect(ready.guides.accessibility.focusOrder).toEqual(allInteractiveIds);
    expect(new Set(allInteractiveIds).size).toBe(allInteractiveIds.length);
  });

  it("freezes selector results without mutating or freezing a supplied view model", () => {
    const ready = requireReady(
      buildGuidesDiscoveryViewModel(createSyntheticNonPublicGuidesInput()),
    );
    const mutableGuides = deepClone(ready.guides);
    const before = deepClone(mutableGuides);

    const selected = selectGuidesArticles(mutableGuides, {
      key: "cluster",
      value: "factory-audit",
    });

    expect(mutableGuides).toEqual(before);
    expect(Object.isFrozen(mutableGuides)).toBe(false);
    expect(
      mutableGuides.articles.items.every(
        (article) => !Object.isFrozen(article),
      ),
    ).toBe(true);
    expectDeepFrozen(selected);
  });

  it("rejects non-English public copy and prohibited brand abbreviations", () => {
    const nonEnglish = createSyntheticNonPublicGuidesInput();
    recordsOf(nonEnglish)[0].title = "Guide Ω";
    const nonEnglishResult = requireBlocked(
      buildGuidesDiscoveryViewModel(nonEnglish),
    );
    expect(nonEnglishResult.reasons[0]).toEqual(
      expect.objectContaining({ code: "input-invalid" }),
    );

    const abbreviated = createSyntheticNonPublicGuidesInput();
    recordsOf(abbreviated)[0].description = "A WAG public description.";
    const abbreviatedResult = requireBlocked(
      buildGuidesDiscoveryViewModel(abbreviated),
    );
    expect(abbreviatedResult.reasons[0]).toEqual(
      expect.objectContaining({ code: "input-invalid" }),
    );
  });

  it("rejects unknown keys instead of stripping them", () => {
    const topLevel = createSyntheticNonPublicGuidesInput();
    topLevel.unexpected = true;
    const topLevelResult = requireBlocked(
      buildGuidesDiscoveryViewModel(topLevel),
    );
    expect(topLevelResult.reasons[0]).toEqual(
      expect.objectContaining({ code: "input-invalid" }),
    );
    expect(topLevelResult.reasons[0].message).toContain("unexpected");

    const nested = createSyntheticNonPublicGuidesInput();
    clustersOf(nested)[0].unknownField = "not allowed";
    const nestedResult = requireBlocked(buildGuidesDiscoveryViewModel(nested));
    expect(nestedResult.reasons[0].message).toContain("unknownField");
  });

  it("deep-freezes every result without mutating or freezing the input", () => {
    const input = createSyntheticNonPublicGuidesInput();
    const before = deepClone(input);

    const result = buildGuidesDiscoveryViewModel(input);

    expect(input).toEqual(before);
    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(clustersOf(input)[0])).toBe(false);
    expectDeepFrozen(result);

    const unresolvedInput = createSyntheticNonPublicGuidesInput();
    clustersOf(unresolvedInput)[0].editorialPillar = {
      status: "migration-pending",
      root: null,
      migrationId: "synthetic-pending-pillar",
      reason: "Synthetic pillar destination is not approved.",
    };
    expectDeepFrozen(buildGuidesDiscoveryViewModel(unresolvedInput));
  });
  it("rejects missing, null, custom-prototype, and identity-drift inputs at the strict contract boundary", () => {
    const valid = createSyntheticNonPublicGuidesInput();
    expect(guidesDiscoveryInputSchema.safeParse(valid).success).toBe(true);

    const missing = createSyntheticNonPublicGuidesInput();
    delete missing.asOf;
    expect(guidesDiscoveryInputSchema.safeParse(missing).success).toBe(false);

    const nullMode = createSyntheticNonPublicGuidesInput();
    nullMode.dataMode = null;
    expect(guidesDiscoveryInputSchema.safeParse(nullMode).success).toBe(false);

    const customPrototype = Object.assign(
      Object.create({ copiedContract: true }) as Record<string, unknown>,
      createSyntheticNonPublicGuidesInput(),
    );
    expect(guidesDiscoveryInputSchema.safeParse(customPrototype).success).toBe(
      false,
    );

    const identityDrift = createSyntheticNonPublicGuidesInput();
    recordsOf(identityDrift)[0].contentId = "article.different-slug";
    expect(guidesDiscoveryInputSchema.safeParse(identityDrift).success).toBe(
      false,
    );
  });

  it("uses 2026-07-18 as the inclusive actual boundary and permits future dates only for synthetic fixtures", () => {
    const boundary = createSyntheticNonPublicGuidesInput();
    boundary.dataMode = "actual";
    expect(buildGuidesDiscoveryViewModel(boundary).status).toBe("ready");

    const futureActual = createSyntheticNonPublicGuidesInput();
    futureActual.dataMode = "actual";
    const actualArticle = recordsOf(futureActual)[0];
    actualArticle.publishedDate = "2026-07-19";
    actualArticle.updatedDate = "2026-07-19";
    (actualArticle.governance as Record<string, unknown>).date = "2026-07-19";
    const blockedActual = requireBlocked(
      buildGuidesDiscoveryViewModel(futureActual),
    );
    expect(JSON.stringify(blockedActual.reasons)).toContain("2026-07-18");

    const futureActualAsOf = createSyntheticNonPublicGuidesInput();
    futureActualAsOf.dataMode = "actual";
    futureActualAsOf.asOf = "2026-07-19";
    expect(buildGuidesDiscoveryViewModel(futureActualAsOf).status).toBe(
      "blocked",
    );

    const syntheticFuture = createSyntheticNonPublicGuidesInput();
    syntheticFuture.asOf = "2026-07-19";
    const syntheticArticle = recordsOf(syntheticFuture)[0];
    syntheticArticle.publishedDate = "2026-07-19";
    syntheticArticle.updatedDate = "2026-07-19";
    (syntheticArticle.governance as Record<string, unknown>).date =
      "2026-07-19";
    expect(buildGuidesDiscoveryViewModel(syntheticFuture).status).toBe("ready");
  });
});
