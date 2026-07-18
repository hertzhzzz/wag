import {
  ARTICLE_CLUSTERS,
  CONTENT_ROLES as ARTICLE_CONTENT_ROLES,
  FUNNEL_STAGES as ARTICLE_FUNNEL_STAGES,
  TARGET_MARKETS as ARTICLE_TARGET_MARKETS,
} from "./articleSchema";
import {
  CANONICAL_CLUSTER_DEFINITIONS,
  CANONICAL_CLUSTER_IDS,
  CLUSTER_TARGET_MARKETS,
  CONTENT_ROLES,
  FUNNEL_STAGES,
  TARGET_MARKETS,
  assertKnownClusterReference,
  clusterDefinitionSchema,
  clusterIdSchema,
  clusterRegistrySchema,
  marketCoverageIncludes,
  parseClusterRegistry,
  type ClusterDefinition,
  type ClusterId,
  type ClusterRegistry,
} from "./clusterSchema";

const CANONICAL_IDS = [
  "supplier-verification",
  "factory-audit",
  "quality-inspection",
  "factory-visits",
  "china-sourcing",
] as const;

function canonicalDefinition(id: ClusterId) {
  const definition = CANONICAL_CLUSTER_DEFINITIONS.find(
    (candidate) => candidate.id === id,
  );

  if (!definition) {
    throw new Error(`Missing test fixture for canonical cluster "${id}".`);
  }

  return definition;
}

function makeCluster(
  id: ClusterId,
  overrides: Partial<ClusterDefinition> = {},
): ClusterDefinition {
  const canonical = canonicalDefinition(id);

  return {
    id,
    label: canonical.label,
    priority: canonical.priority,
    commercialRoot: canonical.commercialRoot,
    commercialService: { ...canonical.commercialService },
    editorialPillar: {
      status: "resolved",
      root: `/article/${id}-guide`,
    },
    targetMarkets: ["AU", "NZ"],
    funnelStages: [
      "problem-aware",
      "solution-aware",
      "evaluation",
      "decision",
      "post-purchase",
    ],
    allowedRoles: ["pillar", "supporting", "evidence", "comparison"],
    intentFamilies: ["informational", "commercial-investigation"],
    reviewOwner: "seo-editorial",
    navigation: { visible: true },
    ...overrides,
  };
}

function makeRegistry(
  overrides: Partial<Record<ClusterId, Partial<ClusterDefinition>>> = {},
): { version: 1; clusters: ClusterDefinition[] } {
  return {
    version: 1,
    clusters: CANONICAL_IDS.map((id) => makeCluster(id, overrides[id])),
  };
}

describe("cluster registry schema", () => {
  it("derives the five canonical identities from one stable definition source and keeps article exports compatible", () => {
    expect(CANONICAL_CLUSTER_DEFINITIONS).toEqual([
      {
        id: "supplier-verification",
        label: "Supplier Verification & Due Diligence",
        priority: 1,
        commercialRoot: "/supplier-verification",
        commercialService: {
          id: "supplier-verification",
          label: "Supplier Verification",
        },
      },
      {
        id: "factory-audit",
        label: "Factory Audit",
        priority: 2,
        commercialRoot: "/factory-audit-china",
        commercialService: {
          id: "factory-audit",
          label: "Factory Audit",
        },
      },
      {
        id: "quality-inspection",
        label: "Quality Inspection & Quality Control",
        priority: 3,
        commercialRoot: "/quality-inspection-china",
        commercialService: {
          id: "quality-inspection",
          label: "Quality Inspection",
        },
      },
      {
        id: "factory-visits",
        label: "Factory Visits in China",
        priority: 4,
        commercialRoot: "/visiting-chinese-factories",
        commercialService: {
          id: "factory-visits",
          label: "Factory Visits",
        },
      },
      {
        id: "china-sourcing",
        label: "China Sourcing & Procurement",
        priority: 5,
        commercialRoot: "/services",
        commercialService: {
          id: "china-sourcing",
          label: "China Sourcing",
        },
      },
    ]);
    expect(CANONICAL_CLUSTER_IDS).toEqual(CANONICAL_IDS);
    expect(clusterIdSchema.options).toEqual(CANONICAL_IDS);

    expect(ARTICLE_CLUSTERS).toBe(CANONICAL_CLUSTER_IDS);
    expect(ARTICLE_CONTENT_ROLES).toBe(CONTENT_ROLES);
    expect(ARTICLE_FUNNEL_STAGES).toBe(FUNNEL_STAGES);
    expect(ARTICLE_TARGET_MARKETS).toBe(TARGET_MARKETS);
    expect(CLUSTER_TARGET_MARKETS).toEqual(["AU", "NZ", "global"]);
  });

  it("deep-freezes the exported canonical identity definitions", () => {
    const firstDefinition = CANONICAL_CLUSTER_DEFINITIONS[0];

    expect(Object.isFrozen(CANONICAL_CLUSTER_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(firstDefinition)).toBe(true);
    expect(Object.isFrozen(firstDefinition.commercialService)).toBe(true);
    expect(Reflect.set(firstDefinition, "label", "Consumer mutation")).toBe(
      false,
    );
    expect(
      Reflect.set(firstDefinition.commercialService, "label", "Mutation"),
    ).toBe(false);
    expect(firstDefinition.label).toBe("Supplier Verification & Due Diligence");
    expect(firstDefinition.commercialService.label).toBe(
      "Supplier Verification",
    );
  });

  it("parses through the public schemas and canonicalizes every set-like field deterministically", () => {
    const input = makeRegistry({
      "supplier-verification": {
        targetMarkets: ["NZ", "AU"],
        funnelStages: [
          "post-purchase",
          "decision",
          "evaluation",
          "solution-aware",
          "problem-aware",
        ],
        allowedRoles: ["comparison", "evidence", "supporting", "pillar"],
        intentFamilies: [
          "supplier-risk",
          "company-due-diligence",
          "supplier-verification",
        ],
      },
    });
    input.clusters = [
      input.clusters[4],
      input.clusters[1],
      input.clusters[3],
      input.clusters[0],
      input.clusters[2],
    ];

    expect(clusterDefinitionSchema.parse(input.clusters[0]).id).toBe(
      "china-sourcing",
    );

    const parsed = clusterRegistrySchema.parse(input);
    expect(parsed.clusters.map(({ id }) => id)).toEqual(CANONICAL_IDS);
    expect(parsed.clusters[0]).toMatchObject({
      targetMarkets: ["AU", "NZ"],
      funnelStages: FUNNEL_STAGES,
      allowedRoles: CONTENT_ROLES,
      intentFamilies: [
        "company-due-diligence",
        "supplier-risk",
        "supplier-verification",
      ],
    });
    expect(parseClusterRegistry(input)).toEqual(parsed);
  });

  it("deep-freezes parser-owned output without freezing or aliasing caller input", () => {
    const input = makeRegistry();
    const parsed = parseClusterRegistry(input);
    const firstCluster = parsed.clusters[0];

    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.clusters)).toBe(true);
    expect(Object.isFrozen(firstCluster)).toBe(true);
    expect(Object.isFrozen(firstCluster.commercialService)).toBe(true);
    expect(Object.isFrozen(firstCluster.editorialPillar)).toBe(true);
    expect(Object.isFrozen(firstCluster.targetMarkets)).toBe(true);
    expect(Object.isFrozen(firstCluster.funnelStages)).toBe(true);
    expect(Object.isFrozen(firstCluster.allowedRoles)).toBe(true);
    expect(Object.isFrozen(firstCluster.intentFamilies)).toBe(true);
    expect(Object.isFrozen(firstCluster.navigation)).toBe(true);

    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(input.clusters)).toBe(false);
    expect(Object.isFrozen(input.clusters[0])).toBe(false);
    expect(Object.isFrozen(input.clusters[0].targetMarkets)).toBe(false);
    expect(Object.isFrozen(input.clusters[0].navigation)).toBe(false);

    input.clusters[0].label = "Caller-owned mutation";
    input.clusters[0].targetMarkets.splice(0, 1);
    input.clusters[0].navigation.visible = false;
    input.clusters.reverse();

    expect(firstCluster.label).toBe("Supplier Verification & Due Diligence");
    expect(firstCluster.targetMarkets).toEqual(["AU", "NZ"]);
    expect(firstCluster.navigation.visible).toBe(true);
    expect(parsed.clusters.map(({ id }) => id)).toEqual(CANONICAL_IDS);

    expect(() => Array.prototype.reverse.call(parsed.clusters)).toThrow(
      TypeError,
    );
    expect(() =>
      Array.prototype.splice.call(firstCluster.targetMarkets, 0, 1),
    ).toThrow(TypeError);
    expect(Reflect.set(firstCluster, "label", "Consumer mutation")).toBe(false);
    expect(Reflect.set(firstCluster.navigation, "visible", false)).toBe(false);
  });

  it("accepts an unresolved editorial pillar only through an explicit migration-pending record", () => {
    const registry = makeRegistry({
      "supplier-verification": {
        editorialPillar: {
          status: "migration-pending",
          root: null,
          migrationId: "phase-2-supplier-verification-pillar",
          reason: "Editorial pillar selection is scheduled for Phase 2.",
        },
      },
    });

    expect(parseClusterRegistry(registry).clusters[0].editorialPillar).toEqual({
      status: "migration-pending",
      root: null,
      migrationId: "phase-2-supplier-verification-pillar",
      reason: "Editorial pillar selection is scheduled for Phase 2.",
    });

    const invalid = makeRegistry() as unknown as {
      version: 1;
      clusters: Array<Record<string, unknown>>;
    };
    invalid.clusters[0] = {
      ...invalid.clusters[0],
      editorialPillar: {
        status: "migration-pending",
        root: "/article/not-allowed-for-pending-migration",
        migrationId: "phase-2-supplier-verification-pillar",
        reason: "Pending migration must not claim a resolved root.",
      },
    };

    expect(() => parseClusterRegistry(invalid)).toThrow(/root/i);
  });

  it.each([
    ["label", "Supplier Verification"],
    ["priority", 10],
    ["commercialRoot", "/factory-audit-china"],
  ] as const)(
    "rejects a non-canonical %s binding even when the field is otherwise valid",
    (field, value) => {
      const invalid = makeRegistry() as unknown as {
        version: 1;
        clusters: Array<Record<string, unknown>>;
      };
      invalid.clusters[0] = { ...invalid.clusters[0], [field]: value };

      expect(() => parseClusterRegistry(invalid)).toThrow(
        new RegExp(`supplier-verification.*${field}`, "i"),
      );
    },
  );

  it("rejects swapped canonical priorities instead of accepting a unique renumbering", () => {
    const invalid = makeRegistry({
      "supplier-verification": { priority: 2 },
      "factory-audit": { priority: 1 },
    });

    expect(() => parseClusterRegistry(invalid)).toThrow(
      /supplier-verification.*priority.*1.*received 2/i,
    );
  });

  it.each([
    ["id", "factory-audit"],
    ["label", "Factory Audit"],
  ] as const)(
    "rejects an incorrect canonical commercial service %s",
    (field, value) => {
      const invalid = makeRegistry();
      invalid.clusters[0] = {
        ...invalid.clusters[0],
        commercialService: {
          ...invalid.clusters[0].commercialService,
          [field]: value,
        },
      };

      expect(() => parseClusterRegistry(invalid)).toThrow(
        new RegExp(`supplier-verification.*commercialService\\.${field}`, "i"),
      );
    },
  );

  it("rejects duplicate commercial service IDs with an actionable error", () => {
    const invalid = makeRegistry({
      "factory-audit": {
        commercialService: {
          id: "supplier-verification",
          label: "Factory Audit",
        },
      },
    });

    expect(() => parseClusterRegistry(invalid)).toThrow(
      /duplicate commercial service id "supplier-verification"/i,
    );
  });

  it("requires resolved editorial roots to use exactly /article/<slug>", () => {
    expect(() => parseClusterRegistry(makeRegistry())).not.toThrow();

    for (const root of [
      "/services",
      "/article/supplier-verification/child",
      "/article/Supplier-Verification",
      "/article/supplier_verification",
      "/article/supplier-verification/",
    ]) {
      const invalid = makeRegistry({
        "supplier-verification": {
          editorialPillar: { status: "resolved", root },
        },
      });

      expect(() => parseClusterRegistry(invalid)).toThrow(
        /editorial article route/i,
      );
    }
  });

  it("rejects an editorial root that is also any commercial root", () => {
    const invalid = makeRegistry({
      "supplier-verification": {
        commercialRoot: "/article/shared-root",
      },
      "factory-audit": {
        editorialPillar: {
          status: "resolved",
          root: "/article/shared-root",
        },
      },
    });

    expect(() => parseClusterRegistry(invalid)).toThrow(
      /editorial pillar root "\/article\/shared-root".*commercial root/i,
    );
  });

  it("rejects a registry that does not contain exactly all five canonical IDs", () => {
    const missing = makeRegistry();
    missing.clusters.pop();

    expect(() => parseClusterRegistry(missing)).toThrow(
      /exactly 5 canonical clusters/i,
    );
  });

  it("rejects duplicate cluster IDs with an actionable error", () => {
    const duplicate = makeRegistry();
    duplicate.clusters[4] = makeCluster("supplier-verification", {
      priority: 5,
      commercialRoot: "/services",
      commercialService: {
        id: "china-sourcing",
        label: "China Sourcing",
      },
      editorialPillar: {
        status: "resolved",
        root: "/article/china-sourcing-guide",
      },
    });

    expect(() => parseClusterRegistry(duplicate)).toThrow(
      /duplicate cluster id "supplier-verification"/i,
    );
  });

  it("rejects duplicate commercial roots", () => {
    const duplicate = makeRegistry({
      "factory-audit": { commercialRoot: "/supplier-verification" },
    });

    expect(() => parseClusterRegistry(duplicate)).toThrow(
      /duplicate commercial root "\/supplier-verification"/i,
    );
  });

  it("rejects duplicate resolved editorial pillar roots but ignores migration-pending null roots", () => {
    const duplicate = makeRegistry({
      "factory-audit": {
        editorialPillar: {
          status: "resolved",
          root: "/article/supplier-verification-guide",
        },
      },
    });

    expect(() => parseClusterRegistry(duplicate)).toThrow(
      /duplicate resolved editorial pillar root/i,
    );

    const pending = makeRegistry({
      "supplier-verification": {
        editorialPillar: {
          status: "migration-pending",
          root: null,
          migrationId: "phase-2-supplier-verification-pillar",
          reason: "Selection pending.",
        },
      },
      "factory-audit": {
        editorialPillar: {
          status: "migration-pending",
          root: null,
          migrationId: "phase-2-factory-audit-pillar",
          reason: "Selection pending.",
        },
      },
    });

    expect(() => parseClusterRegistry(pending)).not.toThrow();
  });

  it("rejects duplicate priorities", () => {
    const duplicate = makeRegistry({
      "factory-audit": { priority: 1 },
    });

    expect(() => parseClusterRegistry(duplicate)).toThrow(
      /duplicate priority "1"/i,
    );
  });

  it.each([
    ["targetMarkets", ["NZ", "AU", "NZ"], ["AU", "NZ"]],
    [
      "funnelStages",
      ["decision", "problem-aware", "decision"],
      ["problem-aware", "decision"],
    ],
    [
      "allowedRoles",
      ["comparison", "pillar", "comparison"],
      ["pillar", "comparison"],
    ],
    [
      "intentFamilies",
      ["supplier-risk", "company-due-diligence", "supplier-risk"],
      ["company-due-diligence", "supplier-risk"],
    ],
  ] as const)(
    "deduplicates and stable-sorts values in %s",
    (field, value, expected) => {
      const registry = makeRegistry() as unknown as {
        version: 1;
        clusters: Array<Record<string, unknown>>;
      };
      registry.clusters[0] = { ...registry.clusters[0], [field]: value };

      expect(parseClusterRegistry(registry).clusters[0]).toMatchObject({
        [field]: expected,
      });
    },
  );

  it.each([
    ["allowedRoles", ["not-a-role"]],
    ["targetMarkets", ["US"]],
    ["funnelStages", ["not-a-stage"]],
    ["intentFamilies", ["Not A Machine ID"]],
  ] as const)("rejects invalid %s values", (field, value) => {
    const invalid = makeRegistry() as unknown as {
      version: 1;
      clusters: Array<Record<string, unknown>>;
    };
    invalid.clusters[0] = { ...invalid.clusters[0], [field]: value };

    expect(() => parseClusterRegistry(invalid)).toThrow();
  });

  it.each([
    "targetMarkets",
    "funnelStages",
    "allowedRoles",
    "intentFamilies",
  ] as const)("rejects an empty %s array", (field) => {
    const invalid = makeRegistry() as unknown as {
      version: 1;
      clusters: Array<Record<string, unknown>>;
    };
    invalid.clusters[0] = { ...invalid.clusters[0], [field]: [] };

    expect(() => parseClusterRegistry(invalid)).toThrow();
  });

  it("keeps article market exports compatible while requiring atomic cluster markets", () => {
    expect(TARGET_MARKETS).toEqual(["AU", "NZ", "AU-NZ", "global"]);

    const invalid = makeRegistry({
      "supplier-verification": {
        targetMarkets: [
          "AU-NZ",
        ] as unknown as ClusterDefinition["targetMarkets"],
      },
    });

    expect(() => parseClusterRegistry(invalid)).toThrow(
      /cluster target market/i,
    );
  });

  it("deduplicates global target markets before exclusivity validation", () => {
    const registry = makeRegistry({
      "supplier-verification": { targetMarkets: ["global", "global"] },
    });

    expect(parseClusterRegistry(registry).clusters[0].targetMarkets).toEqual([
      "global",
    ]);
  });

  it.each([[["AU"]], [["NZ"]], [["AU", "NZ"]], [["global"]]] as const)(
    "accepts canonical cluster market scope %j",
    (targetMarkets) => {
      const registry = makeRegistry({
        "supplier-verification": { targetMarkets: [...targetMarkets] },
      });

      expect(parseClusterRegistry(registry).clusters[0].targetMarkets).toEqual(
        targetMarkets,
      );
    },
  );

  it.each([
    [["global", "AU"], 0],
    [["NZ", "global"], 1],
    [["AU", "global", "NZ"], 1],
  ] as const)(
    "rejects non-canonical mixed global cluster market scope %j",
    (targetMarkets, globalIndex) => {
      const registry = makeRegistry({
        "supplier-verification": { targetMarkets: [...targetMarkets] },
      });
      const expectedMessage =
        `Cluster registry validation failed: clusters.0.targetMarkets.${globalIndex}: ` +
        '"global" targetMarkets scope is exclusive; use exactly ["global"], ' +
        'or remove "global" and declare only "AU", "NZ", or both.';

      expect(() => parseClusterRegistry(registry)).toThrow(expectedMessage);
      expect(() => parseClusterRegistry(registry)).toThrow(expectedMessage);
    },
  );

  it("defines one explicit market coverage rule including composite and global behaviour", () => {
    expect(marketCoverageIncludes(["AU", "NZ"], "AU")).toBe(true);
    expect(marketCoverageIncludes(["AU", "NZ"], "NZ")).toBe(true);
    expect(marketCoverageIncludes(["AU", "NZ"], "AU-NZ")).toBe(true);
    expect(marketCoverageIncludes(["AU"], "AU-NZ")).toBe(false);
    expect(marketCoverageIncludes(["AU", "NZ"], "global")).toBe(false);
    expect(marketCoverageIncludes(["global"], "AU")).toBe(true);
    expect(marketCoverageIncludes(["global"], "NZ")).toBe(true);
    expect(marketCoverageIncludes(["global"], "AU-NZ")).toBe(true);
    expect(marketCoverageIncludes(["global"], "global")).toBe(true);
  });

  it.each([
    ["commercialRoot", "https://example.com/supplier-verification"],
    ["commercialRoot", "supplier-verification"],
    ["commercialRoot", "/supplier-verification/"],
    ["commercialRoot", "/supplier_verification"],
  ] as const)(
    "rejects invalid internal route shape for %s: %s",
    (field, value) => {
      const invalid = makeRegistry() as unknown as {
        version: 1;
        clusters: Array<Record<string, unknown>>;
      };
      invalid.clusters[0] = { ...invalid.clusters[0], [field]: value };

      expect(() => parseClusterRegistry(invalid)).toThrow(
        /internal absolute route/i,
      );
    },
  );

  it("fails fast on unknown or absent cluster references", () => {
    const registry = parseClusterRegistry(makeRegistry());

    expect(assertKnownClusterReference(registry, "factory-audit")).toBe(
      "factory-audit",
    );
    expect(() =>
      assertKnownClusterReference(registry, "unknown-cluster"),
    ).toThrow(/unknown cluster reference "unknown-cluster"/i);

    const missingAtRuntime = {
      ...registry,
      clusters: registry.clusters.filter(({ id }) => id !== "factory-audit"),
    } as ClusterRegistry;

    expect(() =>
      assertKnownClusterReference(missingAtRuntime, "factory-audit"),
    ).toThrow(/not present in registry/i);
  });
});
