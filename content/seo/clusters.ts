import {
  parseClusterRegistry,
  type ClusterRegistry,
} from "@/lib/seo/clusterSchema";

const targetMarkets = ["AU", "NZ"] as const;
const funnelStages = [
  "problem-aware",
  "solution-aware",
  "evaluation",
  "decision",
  "post-purchase",
] as const;
const allowedRoles = [
  "pillar",
  "supporting",
  "evidence",
  "comparison",
] as const;
const editorialPillarMigration = {
  status: "migration-pending",
  root: null,
  migrationId: "phase-2-editorial-pillar-selection",
  reason:
    "Editorial pillar selection is pending the governed Phase 2 migration.",
} as const;
const reviewOwner = "seo-growth-system";
const navigation = { visible: true } as const;

export const clusterRegistry = parseClusterRegistry({
  version: 1,
  clusters: [
    {
      id: "supplier-verification",
      label: "Supplier Verification & Due Diligence",
      priority: 1,
      commercialRoot: "/supplier-verification",
      commercialService: {
        id: "supplier-verification",
        label: "Supplier Verification",
      },
      editorialPillar: editorialPillarMigration,
      targetMarkets,
      funnelStages,
      allowedRoles,
      intentFamilies: [
        "supplier-verification",
        "company-due-diligence",
        "supplier-risk",
      ],
      reviewOwner,
      navigation,
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
      editorialPillar: editorialPillarMigration,
      targetMarkets,
      funnelStages,
      allowedRoles,
      intentFamilies: [
        "factory-audit",
        "supplier-capability",
        "social-compliance",
      ],
      reviewOwner,
      navigation,
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
      editorialPillar: editorialPillarMigration,
      targetMarkets,
      funnelStages,
      allowedRoles,
      intentFamilies: [
        "quality-inspection",
        "quality-control",
        "defect-prevention",
      ],
      reviewOwner,
      navigation,
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
      editorialPillar: editorialPillarMigration,
      targetMarkets,
      funnelStages,
      allowedRoles,
      intentFamilies: [
        "factory-visits",
        "supplier-meetings",
        "china-trip-planning",
      ],
      reviewOwner,
      navigation,
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
      editorialPillar: editorialPillarMigration,
      targetMarkets,
      funnelStages,
      allowedRoles,
      intentFamilies: [
        "china-sourcing",
        "supplier-discovery",
        "procurement-strategy",
      ],
      reviewOwner,
      navigation,
    },
  ],
});

export const clusters: ReadonlyArray<ClusterRegistry["clusters"][number]> =
  clusterRegistry.clusters;

export default clusterRegistry;
