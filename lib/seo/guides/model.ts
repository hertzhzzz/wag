import { z } from "zod";
import {
  CANONICAL_CLUSTER_DEFINITIONS,
  CANONICAL_CLUSTER_IDS,
  type ClusterId,
} from "../clusterSchema";
import {
  guidesDiscoveryInputSchema,
  type GuidesDiscoveryArticleRecord,
  type GuidesDiscoveryClusterRecord,
  type GuidesDiscoveryInput,
} from "./contract";
import { compareCodePoints, deepFreeze } from "./deterministic";
import {
  createGuidesIntegrationDescriptors,
  validateGuidesIntegrationDescriptors,
} from "./integration";
import type {
  GuidesAccessibilityViewModel,
  GuidesArticleCard,
  GuidesBlockReason,
  GuidesDiscoveryResult,
  GuidesDiscoverySectionViewModel,
  GuidesFilterOption,
  GuidesFiltersViewModel,
  GuidesPillarCard,
} from "./types";

const GUIDES_ELEMENT_IDS = {
  section: "guides-discovery",
  heading: "guides-heading",
  pillars: "guides-pillars",
  pillarsHeading: "guides-pillars-heading",
  filtersStatus: "guides-filter-status",
  articles: "guides-article-list",
  articlesHeading: "guides-articles-heading",
  recent: "guides-recent",
  recentHeading: "guides-recent-heading",
} as const;

function inputIssues(error: z.ZodError): GuidesBlockReason[] {
  return error.issues
    .map((issue) => {
      const path =
        issue.path.length > 0 ? issue.path.map(String).join(".") : "input";
      return {
        code: "input-invalid" as const,
        clusterId: null,
        destination: null,
        message: `${path}: ${issue.message}`,
      };
    })
    .sort((left, right) => compareCodePoints(left.message, right.message));
}

function blocked(reasons: readonly GuidesBlockReason[]): GuidesDiscoveryResult {
  return deepFreeze({
    status: "blocked",
    contractVersion: 1,
    reasons: [...reasons],
  });
}

function isDiscoveryEligible(article: GuidesDiscoveryArticleRecord): boolean {
  return (
    article.governance.editorialStatus === "approved" &&
    article.governance.publicationStatus === "live" &&
    article.governance.discoveryEligibility === "eligible" &&
    (article.governance.migrationAction === "keep" ||
      article.governance.migrationAction === "refresh")
  );
}

function compareRecentArticles(
  left: GuidesDiscoveryArticleRecord,
  right: GuidesDiscoveryArticleRecord,
): number {
  const governedDate = compareCodePoints(
    right.governance.date,
    left.governance.date,
  );
  if (governedDate !== 0) return governedDate;

  const governedVersion = right.governance.version - left.governance.version;
  if (governedVersion !== 0) return governedVersion;

  const title = compareCodePoints(left.title, right.title);
  if (title !== 0) return title;

  const route = compareCodePoints(left.route, right.route);
  if (route !== 0) return route;

  return compareCodePoints(left.contentId, right.contentId);
}

function canonicalLabel(clusterId: ClusterId): string {
  const canonical = CANONICAL_CLUSTER_DEFINITIONS.find(
    (definition) => definition.id === clusterId,
  );

  if (!canonical) {
    throw new Error(`Missing canonical cluster definition for "${clusterId}".`);
  }

  return canonical.label;
}

function articleElementId(
  contentId: string,
  context: "browse" | "recent",
): string {
  return `guides-${context}-article-${contentId.slice("article.".length)}`;
}

function createArticleCard(
  article: GuidesDiscoveryArticleRecord,
  context: "browse" | "recent",
): GuidesArticleCard {
  return {
    contentId: article.contentId,
    href: article.route,
    title: article.title,
    description: article.description,
    clusterId: article.cluster,
    clusterLabel: canonicalLabel(article.cluster),
    contentRole: article.contentRole,
    publishedDate: article.publishedDate,
    updatedDate: article.updatedDate,
    governedDate: article.governance.date,
    governedVersion: article.governance.version,
    elementId: articleElementId(article.contentId, context),
    linkLabel: `Read ${article.title}`,
  };
}

interface ValidatedPillarSource {
  readonly cluster: GuidesDiscoveryClusterRecord;
  readonly article: GuidesDiscoveryArticleRecord;
}

function validatePillarSources(input: GuidesDiscoveryInput):
  | {
      readonly status: "ready";
      readonly sources: readonly ValidatedPillarSource[];
    }
  | {
      readonly status: "blocked";
      readonly reasons: readonly GuidesBlockReason[];
    } {
  const clusterById = new Map(
    input.clusterRegistry.records.map((cluster) => [cluster.id, cluster]),
  );
  const articleByRoute = new Map(
    input.articleIndex.records.map((article) => [article.route, article]),
  );
  const sources: ValidatedPillarSource[] = [];
  const reasons: GuidesBlockReason[] = [];

  for (const canonical of CANONICAL_CLUSTER_DEFINITIONS) {
    const cluster = clusterById.get(canonical.id);
    if (!cluster) continue;

    if (cluster.editorialPillar.status !== "resolved") {
      reasons.push({
        code: "pillar-unresolved",
        clusterId: canonical.id,
        destination: null,
        message: `The editorial pillar destination for "${canonical.label}" is not approved.`,
      });
      continue;
    }

    const destination = cluster.editorialPillar.root;
    if (!cluster.navigation.visible) {
      reasons.push({
        code: "pillar-navigation-hidden",
        clusterId: canonical.id,
        destination,
        message: `The editorial pillar destination for "${canonical.label}" is not approved for Guides discovery.`,
      });
      continue;
    }

    const article = articleByRoute.get(destination);
    if (!article) {
      reasons.push({
        code: "pillar-article-missing",
        clusterId: canonical.id,
        destination,
        message: `No governed article record resolves the editorial pillar destination for "${canonical.label}".`,
      });
      continue;
    }

    if (article.cluster !== canonical.id) {
      reasons.push({
        code: "pillar-article-cluster-mismatch",
        clusterId: canonical.id,
        destination,
        message: `The governed pillar article at "${destination}" belongs to a different canonical cluster.`,
      });
      continue;
    }

    if (article.contentRole !== "pillar") {
      reasons.push({
        code: "pillar-article-role-invalid",
        clusterId: canonical.id,
        destination,
        message: `The governed article at "${destination}" is not approved as a pillar article.`,
      });
      continue;
    }

    if (!isDiscoveryEligible(article)) {
      reasons.push({
        code: "pillar-article-ineligible",
        clusterId: canonical.id,
        destination,
        message: `The governed pillar article at "${destination}" is not live and eligible for discovery.`,
      });
      continue;
    }

    sources.push({ cluster, article });
  }

  if (reasons.length > 0 || sources.length !== CANONICAL_CLUSTER_IDS.length) {
    return { status: "blocked", reasons };
  }

  return { status: "ready", sources };
}

function createPillarCards(
  sources: readonly ValidatedPillarSource[],
): readonly GuidesPillarCard[] {
  return sources.map(({ cluster, article }) => ({
    clusterId: cluster.id,
    label: cluster.label,
    order: cluster.priority,
    href: article.route,
    contentId: article.contentId,
    title: article.title,
    description: article.description,
    elementId: `guides-pillar-${cluster.id}`,
    linkLabel: `Explore ${cluster.label} guides`,
    describedBy: `guides-pillar-description-${cluster.id}`,
  }));
}

function createFilters(): GuidesFiltersViewModel {
  const options: GuidesFilterOption[] = [
    {
      key: "all",
      value: "all",
      label: "All guides",
      position: 1,
      controlId: "guides-filter-all",
      ariaControls: GUIDES_ELEMENT_IDS.articles,
    },
    ...CANONICAL_CLUSTER_DEFINITIONS.map((cluster, index) => ({
      key: cluster.id,
      value: cluster.id,
      label: cluster.label,
      position: index + 2,
      controlId: `guides-filter-${cluster.id}`,
      ariaControls: GUIDES_ELEMENT_IDS.articles,
    })),
  ];

  return {
    label: "Filter guides by topic",
    stateKey: "cluster",
    defaultValue: "all",
    stateTransport: "component-memory",
    navigationEffect: "none",
    crawlPolicy: "single-document",
    statusElementId: GUIDES_ELEMENT_IDS.filtersStatus,
    options,
  };
}

function createAccessibility(
  pillars: readonly GuidesPillarCard[],
  filters: GuidesFiltersViewModel,
  articles: readonly GuidesArticleCard[],
  recent: readonly GuidesArticleCard[],
): GuidesAccessibilityViewModel {
  return {
    sectionLabel: "Winning Adventure Global Guides discovery",
    headingElementId: GUIDES_ELEMENT_IDS.heading,
    relationships: {
      sectionLabelledBy: GUIDES_ELEMENT_IDS.heading,
      pillarsLabelledBy: GUIDES_ELEMENT_IDS.pillarsHeading,
      recentLabelledBy: GUIDES_ELEMENT_IDS.recentHeading,
      filterControls: GUIDES_ELEMENT_IDS.articles,
      filterStatus: GUIDES_ELEMENT_IDS.filtersStatus,
    },
    focusOrder: [
      "guides-navigation-link",
      ...pillars.map((pillar) => pillar.elementId),
      ...filters.options.map((option) => option.controlId),
      ...articles.map((article) => article.elementId),
      ...recent.map((article) => article.elementId),
    ],
    reviewChecklist: [
      {
        modality: "mobile",
        label: "Mobile review",
        checks: [
          "Preserve canonical pillar order without horizontal-only access.",
          "Keep filter controls and live status adjacent to the article list.",
        ],
      },
      {
        modality: "desktop",
        label: "Desktop review",
        checks: [
          "Preserve the same information and reading order as the mobile layout.",
          "Keep visible focus treatment distinct from hover treatment.",
        ],
      },
      {
        modality: "keyboard",
        label: "Keyboard review",
        checks: [
          "Follow the declared focus order without traps or hidden controls.",
          "Update filters without navigation and retain a predictable focus target.",
        ],
      },
      {
        modality: "screen-reader",
        label: "Screen reader review",
        checks: [
          "Connect section headings, filter controls, the article list, and live status by their declared relationships.",
          "Announce the selected topic and available guide count after each filter change.",
        ],
      },
    ],
  };
}

function createGuidesSection(
  input: GuidesDiscoveryInput,
  pillarSources: readonly ValidatedPillarSource[],
):
  | {
      readonly status: "ready";
      readonly guides: GuidesDiscoverySectionViewModel;
    }
  | {
      readonly status: "blocked";
      readonly reasons: readonly GuidesBlockReason[];
    } {
  const pillars = createPillarCards(pillarSources);
  const eligibleArticles = input.articleIndex.records
    .filter(isDiscoveryEligible)
    .sort(compareRecentArticles);
  const articles = eligibleArticles.map((article) =>
    createArticleCard(article, "browse"),
  );
  const recent = eligibleArticles
    .slice(0, input.presentation.recentLimit)
    .map((article) => createArticleCard(article, "recent"));
  const filters = createFilters();
  const integration = createGuidesIntegrationDescriptors(pillars);
  const integrationValidation =
    validateGuidesIntegrationDescriptors(integration);

  if (integrationValidation.status === "blocked") {
    return {
      status: "blocked",
      reasons: integrationValidation.reasons.map((message) => ({
        code: "integration-invalid",
        clusterId: null,
        destination: null,
        message,
      })),
    };
  }

  return {
    status: "ready",
    guides: {
      kind: "guides-discovery",
      elementId: GUIDES_ELEMENT_IDS.section,
      heading: "Guides",
      description:
        "Explore governed sourcing, verification, audit, inspection, and factory visit guidance from Winning Adventure Global.",
      pillars: {
        elementId: GUIDES_ELEMENT_IDS.pillars,
        headingElementId: GUIDES_ELEMENT_IDS.pillarsHeading,
        label: "Guide topics",
        items: pillars,
      },
      filters,
      articles: {
        elementId: GUIDES_ELEMENT_IDS.articles,
        headingElementId: GUIDES_ELEMENT_IDS.articlesHeading,
        heading: "Browse guides",
        label: "Governed Guides articles",
        items: articles,
      },
      recent: {
        elementId: GUIDES_ELEMENT_IDS.recent,
        headingElementId: GUIDES_ELEMENT_IDS.recentHeading,
        heading: "Recent guides",
        label: "Recently governed Guides articles",
        items: recent,
      },
      integration: integrationValidation.descriptors,
      accessibility: createAccessibility(pillars, filters, articles, recent),
    },
  };
}

export function buildGuidesDiscoveryViewModel(
  input: unknown,
): GuidesDiscoveryResult {
  const parsed = guidesDiscoveryInputSchema.safeParse(input);
  if (!parsed.success) return blocked(inputIssues(parsed.error));

  const pillarValidation = validatePillarSources(parsed.data);
  if (pillarValidation.status === "blocked") {
    return blocked(pillarValidation.reasons);
  }

  const section = createGuidesSection(parsed.data, pillarValidation.sources);
  if (section.status === "blocked") return blocked(section.reasons);

  return deepFreeze({
    status: "ready",
    contractVersion: 1,
    source: {
      clusterRegistryVersion: parsed.data.clusterRegistry.version,
      articleIndexVersion: parsed.data.articleIndex.version,
    },
    guides: section.guides,
  });
}
