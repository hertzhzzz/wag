import { clusterRegistry, clusters } from "../../content/seo/clusters";
import { CANONICAL_CLUSTER_DEFINITIONS } from "./clusterSchema";

const EXPECTED_CLUSTER_IDS = [
  "supplier-verification",
  "factory-audit",
  "quality-inspection",
  "factory-visits",
  "china-sourcing",
];

const EXPECTED_LABELS = [
  "Supplier Verification & Due Diligence",
  "Factory Audit",
  "Quality Inspection & Quality Control",
  "Factory Visits in China",
  "China Sourcing & Procurement",
];

const EXPECTED_COMMERCIAL_ROOTS = [
  "/supplier-verification",
  "/factory-audit-china",
  "/quality-inspection-china",
  "/visiting-chinese-factories",
  "/services",
];

const EXPECTED_COMMERCIAL_SERVICES = [
  { id: "supplier-verification", label: "Supplier Verification" },
  { id: "factory-audit", label: "Factory Audit" },
  { id: "quality-inspection", label: "Quality Inspection" },
  { id: "factory-visits", label: "Factory Visits" },
  { id: "china-sourcing", label: "China Sourcing" },
];

const EXPECTED_FUNNEL_STAGES = [
  "problem-aware",
  "solution-aware",
  "evaluation",
  "decision",
  "post-purchase",
];

const EXPECTED_ALLOWED_ROLES = [
  "pillar",
  "supporting",
  "evidence",
  "comparison",
];

const EXPECTED_INTENT_FAMILIES = [
  ["company-due-diligence", "supplier-risk", "supplier-verification"],
  ["factory-audit", "social-compliance", "supplier-capability"],
  ["defect-prevention", "quality-control", "quality-inspection"],
  ["china-trip-planning", "factory-visits", "supplier-meetings"],
  ["china-sourcing", "procurement-strategy", "supplier-discovery"],
];

const PILLAR_MIGRATION = {
  status: "migration-pending",
  root: null,
  migrationId: "phase-2-editorial-pillar-selection",
  reason:
    "Editorial pillar selection is pending the governed Phase 2 migration.",
};

describe("clusterRegistry", () => {
  it("exposes exactly the canonical definitions in governed priority order", () => {
    expect(clusterRegistry.version).toBe(1);
    expect(clusters).toBe(clusterRegistry.clusters);
    expect(clusters).toHaveLength(5);
    expect(clusters.map((cluster) => cluster.id)).toEqual(EXPECTED_CLUSTER_IDS);
    expect(clusters.map((cluster) => cluster.label)).toEqual(EXPECTED_LABELS);
    expect(clusters.map((cluster) => cluster.priority)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(clusters.map((cluster) => cluster.commercialRoot)).toEqual(
      EXPECTED_COMMERCIAL_ROOTS,
    );
    expect(clusters.map((cluster) => cluster.commercialService)).toEqual(
      EXPECTED_COMMERCIAL_SERVICES,
    );
    expect(
      CANONICAL_CLUSTER_DEFINITIONS.map((definition) => ({
        id: definition.id,
        label: definition.label,
        priority: definition.priority,
        commercialRoot: definition.commercialRoot,
        commercialService: definition.commercialService,
      })),
    ).toEqual(
      clusters.map((cluster) => ({
        id: cluster.id,
        label: cluster.label,
        priority: cluster.priority,
        commercialRoot: cluster.commercialRoot,
        commercialService: cluster.commercialService,
      })),
    );
  });

  it("keeps every editorial pillar explicitly migration-pending", () => {
    expect(clusters.map((cluster) => cluster.editorialPillar)).toEqual(
      Array.from({ length: 5 }, () => PILLAR_MIGRATION),
    );
  });

  it("declares explicit atomic market, funnel, role, service, and intent relationships", () => {
    expect(clusters.map((cluster) => cluster.targetMarkets)).toEqual(
      Array.from({ length: 5 }, () => ["AU", "NZ"]),
    );
    expect(clusters.map((cluster) => cluster.funnelStages)).toEqual(
      Array.from({ length: 5 }, () => EXPECTED_FUNNEL_STAGES),
    );
    expect(clusters.map((cluster) => cluster.allowedRoles)).toEqual(
      Array.from({ length: 5 }, () => EXPECTED_ALLOWED_ROLES),
    );
    expect(clusters.map((cluster) => cluster.commercialService)).toEqual(
      EXPECTED_COMMERCIAL_SERVICES,
    );
    expect(clusters.map((cluster) => cluster.intentFamilies)).toEqual(
      EXPECTED_INTENT_FAMILIES,
    );

    for (const cluster of clusters) {
      expect(cluster.reviewOwner).toBe("seo-growth-system");
      expect(cluster.navigation).toEqual({ visible: true });
      expect(cluster.intentFamilies).not.toHaveLength(0);
      expect(
        cluster.intentFamilies.every((intent) =>
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(intent),
        ),
      ).toBe(true);
    }
  });

  it("exports a runtime deep-readonly registry that consumers cannot pollute", () => {
    const firstCluster = clusters[0];
    const expectedIds = clusters.map(({ id }) => id);
    const expectedSerialization = JSON.stringify(clusterRegistry);

    expect(Object.isFrozen(clusterRegistry)).toBe(true);
    expect(Object.isFrozen(clusters)).toBe(true);
    expect(Object.isFrozen(firstCluster)).toBe(true);
    expect(Object.isFrozen(firstCluster.commercialService)).toBe(true);
    expect(Object.isFrozen(firstCluster.editorialPillar)).toBe(true);
    expect(Object.isFrozen(firstCluster.targetMarkets)).toBe(true);
    expect(Object.isFrozen(firstCluster.funnelStages)).toBe(true);
    expect(Object.isFrozen(firstCluster.allowedRoles)).toBe(true);
    expect(Object.isFrozen(firstCluster.intentFamilies)).toBe(true);
    expect(Object.isFrozen(firstCluster.navigation)).toBe(true);

    expect(() => Array.prototype.reverse.call(clusters)).toThrow(TypeError);
    expect(() =>
      Array.prototype.splice.call(firstCluster.intentFamilies, 0, 1),
    ).toThrow(TypeError);
    expect(Reflect.set(firstCluster, "label", "Consumer mutation")).toBe(false);
    expect(Reflect.set(firstCluster.navigation, "visible", false)).toBe(false);

    expect(clusters.map(({ id }) => id)).toEqual(expectedIds);
    expect(JSON.stringify(clusterRegistry)).toBe(expectedSerialization);
  });

  it("serializes identically across fresh module imports", async () => {
    jest.resetModules();
    const firstImport = await import("../../content/seo/clusters");
    const firstSerialization = JSON.stringify(firstImport.clusterRegistry);

    jest.resetModules();
    const secondImport = await import("../../content/seo/clusters");
    const secondSerialization = JSON.stringify(secondImport.clusterRegistry);

    expect(secondSerialization).toBe(firstSerialization);
  });
});
