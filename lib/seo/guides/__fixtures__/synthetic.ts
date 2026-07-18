/**
 * Synthetic, non-public fixtures for the Guides discovery domain model.
 * These records are invented for tests and must never be published as content.
 */
export const SYNTHETIC_NON_PUBLIC_FIXTURE = true as const;

const PILLARS = [
  {
    id: "supplier-verification",
    label: "Supplier Verification & Due Diligence",
    priority: 1,
    slug: "supplier-verification-guide",
  },
  {
    id: "factory-audit",
    label: "Factory Audit",
    priority: 2,
    slug: "factory-audit-guide",
  },
  {
    id: "quality-inspection",
    label: "Quality Inspection & Quality Control",
    priority: 3,
    slug: "quality-inspection-guide",
  },
  {
    id: "factory-visits",
    label: "Factory Visits in China",
    priority: 4,
    slug: "factory-visits-guide",
  },
  {
    id: "china-sourcing",
    label: "China Sourcing & Procurement",
    priority: 5,
    slug: "china-sourcing-guide",
  },
] as const;

const GOVERNED_DATES = [
  "2026-07-12",
  "2026-07-11",
  "2026-07-10",
  "2026-07-09",
  "2026-07-08",
] as const;

function makePillarArticle(
  pillar: (typeof PILLARS)[number],
  index: number,
): Record<string, unknown> {
  const route = `/article/${pillar.slug}`;

  return {
    contentId: `article.${pillar.slug}`,
    route,
    title: `${pillar.label} Guide`,
    description: `Synthetic guidance for the ${pillar.label} editorial pillar.`,
    cluster: pillar.id,
    contentRole: "pillar",
    publishedDate: "2026-06-01",
    updatedDate: GOVERNED_DATES[index],
    governance: {
      date: GOVERNED_DATES[index],
      version: 1,
      editorialStatus: "approved",
      publicationStatus: "live",
      discoveryEligibility: "eligible",
      migrationAction: "keep",
    },
  };
}

export function createSyntheticNonPublicGuidesInput(): Record<string, unknown> {
  return {
    contractVersion: 1,
    clusterRegistry: {
      version: 1,
      records: PILLARS.map((pillar) => ({
        id: pillar.id,
        label: pillar.label,
        priority: pillar.priority,
        editorialPillar: {
          status: "resolved",
          root: `/article/${pillar.slug}`,
        },
        navigation: {
          visible: true,
        },
      })),
    },
    articleIndex: {
      version: 1,
      records: [
        ...PILLARS.map(makePillarArticle),
        {
          contentId: "article.supplier-risk-signals",
          route: "/article/supplier-risk-signals",
          title: "Supplier Risk Signals",
          description: "Synthetic signals for a governed supporting guide.",
          cluster: "supplier-verification",
          contentRole: "supporting",
          publishedDate: "2026-07-15",
          updatedDate: "2026-07-17",
          governance: {
            date: "2026-07-17",
            version: 2,
            editorialStatus: "approved",
            publicationStatus: "live",
            discoveryEligibility: "eligible",
            migrationAction: "refresh",
          },
        },
      ],
    },
    presentation: {
      recentLimit: 6,
    },
  };
}

export function createSyntheticArticle(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const base = {
    contentId: "article.synthetic-supporting-guide",
    route: "/article/synthetic-supporting-guide",
    title: "Synthetic Supporting Guide",
    description: "Synthetic, non-public guide content for deterministic tests.",
    cluster: "factory-audit",
    contentRole: "supporting",
    publishedDate: "2026-07-01",
    updatedDate: null,
    governance: {
      date: "2026-07-01",
      version: 1,
      editorialStatus: "approved",
      publicationStatus: "live",
      discoveryEligibility: "eligible",
      migrationAction: "keep",
    },
  };

  return {
    ...base,
    ...overrides,
    governance: {
      ...base.governance,
      ...(typeof overrides.governance === "object" &&
      overrides.governance !== null &&
      !Array.isArray(overrides.governance)
        ? overrides.governance
        : {}),
    },
  };
}
