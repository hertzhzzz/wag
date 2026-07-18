import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import clusterRegistry from "../../content/seo/clusters";

import {
  ArticleValidationError,
  parseArticleFrontmatter,
  type ContentRole,
  type FunnelStage,
  type TargetMarket,
} from "./articleSchema";
import { readAllArticles, type ValidatedArticle } from "./articleReader";
import { buildClusterMembershipReport } from "./clusterDiagnostic";
import {
  parseClusterRegistry,
  type ClusterId,
  type ClusterRegistry,
  type ClusterTargetMarket,
} from "./clusterSchema";

const VALID_DISPLAY = {
  title: "Diagnostic fixture article",
  date: "2026-07-18",
  description: "A fixture used to verify governed cluster diagnostics.",
  author: "Winning Adventure Global",
  category: "China Sourcing",
  readTime: "5 min read",
  ctaTitle: "Need a governed sourcing plan?",
  ctaText: "Use a reviewed sourcing workflow before committing funds.",
  ctaButtonText: "Request a Sourcing Plan",
};

const tempBlogDirs: string[] = [];

function cloneCanonicalRegistry(): ClusterRegistry {
  return parseClusterRegistry(JSON.parse(JSON.stringify(clusterRegistry)));
}

function registryWithClusterContract(
  clusterId: ClusterId,
  overrides: {
    targetMarkets?: readonly ClusterTargetMarket[];
    funnelStages?: readonly FunnelStage[];
    allowedRoles?: readonly ContentRole[];
  },
): ClusterRegistry {
  return parseClusterRegistry({
    version: clusterRegistry.version,
    clusters: clusterRegistry.clusters.map((cluster) => ({
      ...cluster,
      commercialService: { ...cluster.commercialService },
      editorialPillar: { ...cluster.editorialPillar },
      targetMarkets:
        cluster.id === clusterId && overrides.targetMarkets
          ? [...overrides.targetMarkets]
          : [...cluster.targetMarkets],
      funnelStages:
        cluster.id === clusterId && overrides.funnelStages
          ? [...overrides.funnelStages]
          : [...cluster.funnelStages],
      allowedRoles:
        cluster.id === clusterId && overrides.allowedRoles
          ? [...overrides.allowedRoles]
          : [...cluster.allowedRoles],
      intentFamilies: [...cluster.intentFamilies],
      navigation: { ...cluster.navigation },
    })),
  });
}

function makeParsedArticle(
  slug: string,
  governed: Record<string, unknown> = {},
): ValidatedArticle {
  const { frontmatter, warnings } = parseArticleFrontmatter(
    {
      ...VALID_DISPLAY,
      title: `Diagnostic fixture: ${slug}`,
      ...governed,
    },
    slug,
    "compatibility",
  );

  return {
    slug,
    sourcePath: `/content/blog/${slug}.mdx`,
    frontmatter,
    content: "",
    warnings,
  };
}

function makeTempBlogDir(): string {
  const blogDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "wag-cluster-diagnostic-"),
  );
  tempBlogDirs.push(blogDir);
  return blogDir;
}

function toYamlScalar(value: unknown): string {
  if (value === null) return "null";
  return JSON.stringify(value);
}

function writeArticleFixture(
  blogDir: string,
  slug: string,
  governed: Record<string, unknown> = {},
): void {
  const absolutePath = path.join(blogDir, `${slug}.mdx`);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

  const frontmatter = {
    ...VALID_DISPLAY,
    title: `Diagnostic fixture: ${slug}`,
    ...governed,
  };
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${toYamlScalar(value)}`)
    .join("\n");

  fs.writeFileSync(
    absolutePath,
    `---\n${yaml}\n---\n\nFixture body for ${slug}.\n`,
    "utf8",
  );
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

describe("buildClusterMembershipReport", () => {
  afterEach(() => {
    for (const blogDir of tempBlogDirs.splice(0)) {
      fs.rmSync(blogDir, { recursive: true, force: true });
    }
  });

  it("groups parser-validated articles by canonical registry priority and slug", () => {
    const report = buildClusterMembershipReport(clusterRegistry, [
      makeParsedArticle("zeta-audit", {
        cluster: "factory-audit",
        contentRole: "evidence",
      }),
      makeParsedArticle("alpha-verification", {
        cluster: "supplier-verification",
        contentRole: "supporting",
      }),
      makeParsedArticle("beta-verification", {
        cluster: "supplier-verification",
      }),
    ]);

    expect(report).toMatchObject({
      registryVersion: 1,
      articleCount: 3,
      assignedCount: 3,
      unassignedCount: 0,
    });
    expect(report.clusters.map((cluster) => cluster.id)).toEqual([
      "supplier-verification",
      "factory-audit",
      "quality-inspection",
      "factory-visits",
      "china-sourcing",
    ]);
    expect(report.clusters[0]).toEqual({
      id: "supplier-verification",
      label: "Supplier Verification & Due Diligence",
      commercialRoot: "/supplier-verification",
      articleCount: 2,
      articles: [
        {
          slug: "alpha-verification",
          contentId: "article.alpha-verification",
          contentRole: "supporting",
        },
        {
          slug: "beta-verification",
          contentId: "article.beta-verification",
          contentRole: null,
        },
      ],
    });
    expect(report.clusters[4].articles).toEqual([]);
  });

  it("uses the real compatibility reader for unassigned and missing-role articles", () => {
    const blogDir = makeTempBlogDir();
    writeArticleFixture(blogDir, "legacy-unassigned");
    writeArticleFixture(blogDir, "assigned-without-role", {
      contentId: "article.assigned-without-role",
      cluster: "supplier-verification",
    });

    const corpus = readAllArticles({ blogDir, mode: "compatibility" });
    const report = buildClusterMembershipReport(
      clusterRegistry,
      corpus.articles,
    );

    expect(report.articleCount).toBe(2);
    expect(report.assignedCount).toBe(1);
    expect(report.unassignedCount).toBe(1);
    expect(report.unassignedArticles).toEqual([
      {
        slug: "legacy-unassigned",
        contentId: "article.legacy-unassigned",
      },
    ]);
    expect(report.clusters[0].articles).toEqual([
      {
        slug: "assigned-without-role",
        contentId: "article.assigned-without-role",
        contentRole: null,
      },
    ]);
  });

  it("rejects a cluster-specific disallowed role with actionable context", () => {
    const blogDir = makeTempBlogDir();
    writeArticleFixture(blogDir, "disallowed-evidence-role", {
      contentId: "article.disallowed-evidence-role",
      cluster: "supplier-verification",
      contentRole: "evidence",
    });
    const corpus = readAllArticles({ blogDir, mode: "compatibility" });
    const restrictedRegistry = registryWithClusterContract(
      "supplier-verification",
      { allowedRoles: ["supporting"] },
    );

    expect(() =>
      buildClusterMembershipReport(restrictedRegistry, corpus.articles),
    ).toThrow(
      'Article "article.disallowed-evidence-role" (slug "disallowed-evidence-role") uses content role "evidence" in cluster "supplier-verification", but allowed roles are: supporting.',
    );
  });

  it("rejects an explicit target market outside the cluster contract", () => {
    const restrictedRegistry = registryWithClusterContract(
      "supplier-verification",
      { targetMarkets: ["AU"] },
    );
    const article = makeParsedArticle("nz-market-mismatch", {
      contentId: "article.nz-market-mismatch",
      cluster: "supplier-verification",
      targetMarket: "NZ",
    });

    expect(() =>
      buildClusterMembershipReport(restrictedRegistry, [article]),
    ).toThrow(
      'Article "article.nz-market-mismatch" (slug "nz-market-mismatch") targets market "NZ" in cluster "supplier-verification", but allowed markets are: AU.',
    );
  });

  it("accepts AU-NZ only when the cluster covers both AU and NZ", () => {
    const singleMarketRegistry = registryWithClusterContract(
      "supplier-verification",
      { targetMarkets: ["AU"] },
    );
    const dualMarketRegistry = registryWithClusterContract(
      "supplier-verification",
      { targetMarkets: ["AU", "NZ"] },
    );
    const article = makeParsedArticle("dual-market-coverage", {
      cluster: "supplier-verification",
      targetMarket: "AU-NZ",
    });

    expect(() =>
      buildClusterMembershipReport(singleMarketRegistry, [article]),
    ).toThrow(
      'Article "article.dual-market-coverage" (slug "dual-market-coverage") targets market "AU-NZ" in cluster "supplier-verification", but allowed markets are: AU.',
    );

    const report = buildClusterMembershipReport(dualMarketRegistry, [article]);

    expect(report.assignedCount).toBe(1);
    expect(report.clusters[0].articles).toEqual([
      {
        slug: "dual-market-coverage",
        contentId: "article.dual-market-coverage",
        contentRole: null,
      },
    ]);
  });

  it("requires global cluster coverage for a global article", () => {
    const regionalRegistry = registryWithClusterContract(
      "supplier-verification",
      { targetMarkets: ["AU", "NZ"] },
    );
    const article = makeParsedArticle("global-market-mismatch", {
      contentId: "article.global-market-mismatch",
      cluster: "supplier-verification",
      targetMarket: "global",
    });

    expect(() =>
      buildClusterMembershipReport(regionalRegistry, [article]),
    ).toThrow(
      'Article "article.global-market-mismatch" (slug "global-market-mismatch") targets market "global" in cluster "supplier-verification", but allowed markets are: AU, NZ.',
    );
  });

  it("allows global cluster coverage to include any article market", () => {
    const globalRegistry = registryWithClusterContract(
      "supplier-verification",
      { targetMarkets: ["global"] },
    );
    const targetMarkets: readonly TargetMarket[] = [
      "AU",
      "NZ",
      "AU-NZ",
      "global",
    ];
    const articles = targetMarkets.map((targetMarket) =>
      makeParsedArticle(`global-covers-${targetMarket.toLowerCase()}`, {
        cluster: "supplier-verification",
        targetMarket,
      }),
    );

    const report = buildClusterMembershipReport(globalRegistry, articles);

    expect(report.assignedCount).toBe(targetMarkets.length);
    expect(report.clusters[0].articles).toHaveLength(targetMarkets.length);
  });

  it("keeps validation errors deterministic when primary article sort fields tie", () => {
    const restrictedRegistry = registryWithClusterContract(
      "supplier-verification",
      { targetMarkets: ["AU"] },
    );
    const base = makeParsedArticle("duplicate-identity", {
      contentId: "article.duplicate-identity",
      cluster: "supplier-verification",
      contentRole: "supporting",
    });
    const articles = [
      {
        ...base,
        sourcePath: "/content/blog/duplicate-identity-global.mdx",
        frontmatter: { ...base.frontmatter, targetMarket: "global" as const },
      },
      {
        ...base,
        sourcePath: "/content/blog/duplicate-identity-nz.mdx",
        frontmatter: { ...base.frontmatter, targetMarket: "NZ" as const },
      },
    ];

    const captureError = (input: readonly ValidatedArticle[]): string => {
      try {
        buildClusterMembershipReport(restrictedRegistry, input);
      } catch (error) {
        return (error as Error).message;
      }
      throw new Error("Expected cluster diagnostic to reject invalid markets.");
    };

    expect(captureError(articles)).toBe(captureError([...articles].reverse()));
    expect(captureError(articles)).toContain('targets market "NZ"');
  });

  it("rejects an explicit funnel stage outside the cluster contract", () => {
    const restrictedRegistry = registryWithClusterContract(
      "supplier-verification",
      { funnelStages: ["decision"] },
    );
    const article = makeParsedArticle("funnel-stage-mismatch", {
      contentId: "article.funnel-stage-mismatch",
      cluster: "supplier-verification",
      funnelStage: "evaluation",
    });

    expect(() =>
      buildClusterMembershipReport(restrictedRegistry, [article]),
    ).toThrow(
      'Article "article.funnel-stage-mismatch" (slug "funnel-stage-mismatch") uses funnel stage "evaluation" in cluster "supplier-verification", but allowed stages are: decision.',
    );
  });

  it("rejects an unknown cluster at the real article reader boundary", () => {
    const blogDir = makeTempBlogDir();
    writeArticleFixture(blogDir, "unknown-cluster", {
      cluster: "not-a-real-cluster",
    });

    expect(() => readAllArticles({ blogDir, mode: "compatibility" })).toThrow(
      ArticleValidationError,
    );

    try {
      readAllArticles({ blogDir, mode: "compatibility" });
    } catch (error) {
      const validationError = error as ArticleValidationError;
      expect(validationError.articleId).toBe("unknown-cluster");
      expect(validationError.field).toBe("cluster");
      expect(validationError.message).toContain("expected one of");
    }
  });

  it("rejects an explicit null contentRole at the real article reader boundary", () => {
    const blogDir = makeTempBlogDir();
    writeArticleFixture(blogDir, "null-content-role", {
      cluster: "supplier-verification",
      contentRole: null,
    });

    expect(() => readAllArticles({ blogDir, mode: "compatibility" })).toThrow(
      ArticleValidationError,
    );

    try {
      readAllArticles({ blogDir, mode: "compatibility" });
    } catch (error) {
      const validationError = error as ArticleValidationError;
      expect(validationError.articleId).toBe("null-content-role");
      expect(validationError.field).toBe("contentRole");
    }
  });

  it("defensively rejects an unknown cluster if a caller bypasses article validation", () => {
    const validArticle = makeParsedArticle("unknown-cluster-bypass");
    const uncheckedArticle = {
      ...validArticle,
      frontmatter: {
        ...validArticle.frontmatter,
        cluster: "not-in-the-registry",
      },
    } as unknown as ValidatedArticle;

    expect(() =>
      buildClusterMembershipReport(clusterRegistry, [uncheckedArticle]),
    ).toThrow('Unknown cluster reference "not-in-the-registry"');
  });

  it("is deterministic for reordered real-corpus input and does not mutate deep-frozen inputs", () => {
    const registry = deepFreeze(cloneCanonicalRegistry());
    const corpus = readAllArticles({ mode: "compatibility" });
    const articles = deepFreeze(corpus.articles);
    const registryBefore = JSON.stringify(registry);
    const articlesBefore = JSON.stringify(articles);

    expect(articles.length).toBeGreaterThan(0);

    const forward = buildClusterMembershipReport(registry, articles);
    const reversed = buildClusterMembershipReport(
      registry,
      [...articles].reverse(),
    );

    expect(JSON.stringify(forward)).toBe(JSON.stringify(reversed));
    expect(forward.articleCount).toBe(articles.length);
    expect(forward.assignedCount + forward.unassignedCount).toBe(
      articles.length,
    );
    expect(JSON.stringify(registry)).toBe(registryBefore);
    expect(JSON.stringify(articles)).toBe(articlesBefore);
  });
});
