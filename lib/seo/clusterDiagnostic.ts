import type { ContentRole } from "./articleSchema";
import type { ValidatedArticle } from "./articleReader";
import {
  assertKnownClusterReference,
  marketCoverageIncludes,
  type ClusterId,
  type ClusterRegistry,
} from "./clusterSchema";

export interface ClusterMembershipArticle {
  slug: string;
  contentId: string;
  contentRole: ContentRole | null;
}

export interface UnassignedClusterMembershipArticle {
  slug: string;
  contentId: string;
}

export interface ClusterMembershipGroup {
  id: ClusterId;
  label: string;
  commercialRoot: string;
  articleCount: number;
  articles: ClusterMembershipArticle[];
}

export interface ClusterMembershipReport {
  registryVersion: ClusterRegistry["version"];
  articleCount: number;
  assignedCount: number;
  unassignedCount: number;
  clusters: ClusterMembershipGroup[];
  unassignedArticles: UnassignedClusterMembershipArticle[];
}

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function compareArticle(
  left: ValidatedArticle,
  right: ValidatedArticle,
): number {
  return (
    compareText(left.slug, right.slug) ||
    compareText(left.frontmatter.contentId, right.frontmatter.contentId) ||
    compareText(
      left.frontmatter.cluster ?? "",
      right.frontmatter.cluster ?? "",
    ) ||
    compareText(
      left.frontmatter.contentRole ?? "",
      right.frontmatter.contentRole ?? "",
    ) ||
    compareText(
      left.frontmatter.targetMarket ?? "",
      right.frontmatter.targetMarket ?? "",
    ) ||
    compareText(
      left.frontmatter.funnelStage ?? "",
      right.frontmatter.funnelStage ?? "",
    ) ||
    compareText(left.sourcePath, right.sourcePath)
  );
}

/**
 * Build a deterministic, read-only view of governed article membership.
 *
 * Compatibility-mode articles without a cluster remain visible under
 * `unassignedArticles`. A present cluster reference must be governed by the
 * supplied registry; unknown references fail immediately.
 */
export function buildClusterMembershipReport(
  registry: ClusterRegistry,
  articles: readonly ValidatedArticle[],
): ClusterMembershipReport {
  const orderedClusters = [...registry.clusters].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.id.localeCompare(b.id);
  });
  const clusterDefinitions = new Map<
    ClusterId,
    ClusterRegistry["clusters"][number]
  >(orderedClusters.map((cluster) => [cluster.id, cluster]));
  const articlesByCluster = new Map<ClusterId, ClusterMembershipArticle[]>(
    orderedClusters.map((cluster) => [cluster.id, []]),
  );
  const unassignedArticles: UnassignedClusterMembershipArticle[] = [];

  for (const article of [...articles].sort(compareArticle)) {
    const { cluster, contentId, contentRole, funnelStage, targetMarket } =
      article.frontmatter;

    if (cluster === undefined) {
      unassignedArticles.push({ slug: article.slug, contentId });
      continue;
    }

    const clusterId = assertKnownClusterReference(registry, cluster);
    const clusterDefinition = clusterDefinitions.get(clusterId);
    const membership = articlesByCluster.get(clusterId);
    if (!clusterDefinition || !membership) {
      throw new Error(
        `Cluster "${clusterId}" is not present in the membership report.`,
      );
    }

    if (
      contentRole !== undefined &&
      !clusterDefinition.allowedRoles.includes(contentRole)
    ) {
      throw new Error(
        `Article "${contentId}" (slug "${article.slug}") uses content role "${contentRole}" in cluster "${clusterId}", but allowed roles are: ${clusterDefinition.allowedRoles.join(", ")}.`,
      );
    }

    if (
      targetMarket !== undefined &&
      !marketCoverageIncludes(clusterDefinition.targetMarkets, targetMarket)
    ) {
      throw new Error(
        `Article "${contentId}" (slug "${article.slug}") targets market "${targetMarket}" in cluster "${clusterId}", but allowed markets are: ${clusterDefinition.targetMarkets.join(", ")}.`,
      );
    }

    if (
      funnelStage !== undefined &&
      !clusterDefinition.funnelStages.includes(funnelStage)
    ) {
      throw new Error(
        `Article "${contentId}" (slug "${article.slug}") uses funnel stage "${funnelStage}" in cluster "${clusterId}", but allowed stages are: ${clusterDefinition.funnelStages.join(", ")}.`,
      );
    }

    membership.push({
      slug: article.slug,
      contentId,
      contentRole: contentRole ?? null,
    });
  }

  const clusters = orderedClusters.map((cluster) => {
    const clusterArticles = articlesByCluster.get(cluster.id) ?? [];
    return {
      id: cluster.id,
      label: cluster.label,
      commercialRoot: cluster.commercialRoot,
      articleCount: clusterArticles.length,
      articles: clusterArticles,
    };
  });
  const assignedCount = clusters.reduce(
    (count, cluster) => count + cluster.articleCount,
    0,
  );

  return {
    registryVersion: registry.version,
    articleCount: articles.length,
    assignedCount,
    unassignedCount: unassignedArticles.length,
    clusters,
    unassignedArticles,
  };
}
