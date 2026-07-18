import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

import matter from "gray-matter";
import { parse, stringify } from "yaml";

import { BLOG_GONE_SLUGS } from "./gone-paths";

const AUDIT_DATE = "2026-07-17";
const BASE_URL = "https://www.winningadventure.com.au";

const LEGACY_CLUSTER_PATHS = [
  "content/clusters/china-sourcing-strategy-cluster.yaml",
  "content/clusters/factory-tour-cluster.yaml",
  "content/clusters/retail-import-cluster.yaml",
  "content/clusters/supply-chain-trade-cluster.yaml",
] as const;

type PublishingClassification = "manual" | "gated" | "unattended";
type LegacyInventoryStatus =
  | "live"
  | "gone-410"
  | "missing"
  | "planned-placeholder"
  | "unaccounted";
type PublishingObservedState =
  | "enabled"
  | "disabled"
  | "not-observed"
  | "unverified";
type PublishingTarget = "frontend" | "dashboard" | "none";
type ApprovalEnforcement =
  | "technical"
  | "policy-only"
  | "none"
  | "not-applicable";
type TechnicalControlState = "enforced" | "not-enforced" | "not-applicable";

export interface ArticleInventoryItem {
  file: string;
  slug: string;
  route: string;
  frontmatterSlug: string | null;
  title: string;
  category: string;
  publishedDate: string;
  canonical: string;
  canonicalSource: "frontmatter" | "derived-route";
  indexable: boolean;
  internalLinks: string[];
}

export interface LegacyClusterReference {
  role: "pillar" | "cluster";
  type: string;
  slug: string | null;
  title: string;
  declaredStatus: string;
  inventoryStatus: LegacyInventoryStatus;
}

export interface LegacyClusterInventory {
  path: string;
  description: string;
  references: LegacyClusterReference[];
}

export interface DiscoverySurface {
  id: string;
  source: string;
  behavior: string;
  limitations: string;
}

export interface RecommendationEdge {
  mechanism:
    | "article-prev-next"
    | "homepage-top-articles"
    | "factory-link-graph";
  sourceRoute: string;
  targetRoute: string;
  relationshipCount: number;
  source: string;
}

export interface DiscoveryInventory {
  articleListingRoutes: string[];
  articleDetailRoutes: string[];
  sitemapArticleRoutes: string[];
  sitemapRoutes: string[];
  serviceRoots: string[];
  globalArticleEntryPoints: string[];
  recommendationEdges: RecommendationEdge[];
  dashboardSources: string[];
}

export interface MeasurementBaseline {
  id: string;
  asOf: string;
  availability: "available" | "partial" | "unavailable";
  baseline: string;
  source: string;
  limitations: string;
}

export interface PublishingPath {
  id: string;
  kind:
    | "generation"
    | "scheduling"
    | "deployment"
    | "notification"
    | "tracking";
  source: string;
  classification: PublishingClassification;
  observedState: PublishingObservedState;
  productionTarget: PublishingTarget;
  approvalEnforcement: ApprovalEnforcement;
  initiatesPublication: boolean;
  canPublishProduction: boolean;
  hardBlocker: string;
  evidenceFiles: string[];
  technicalControl: {
    state: TechnicalControlState;
    mechanism: string;
    evidence: string;
  };
}

export interface SeoBaselineAudit {
  auditDate: string;
  articles: ArticleInventoryItem[];
  legacyClusters: LegacyClusterInventory[];
  discoverySurfaces: DiscoverySurface[];
  discoveryInventory: DiscoveryInventory;
  measurements: MeasurementBaseline[];
  publishingPaths: PublishingPath[];
  findings: {
    missingPublishedLegacySlugs: string[];
    retiredLegacySlugs: string[];
    missingLegacySlugs: string[];
    duplicateLegacySlugs: string[];
    articlesAbsentFromLegacyClusters: string[];
    articlesMissingFrontmatterSlug: string[];
    plannedLegacyPlaceholders: number;
    articleRoutesMissingFromListing: string[];
    articleRoutesMissingFromDetail: string[];
    articleRoutesMissingFromSitemap: string[];
    duplicateCanonicals: string[];
    staleArticleLinks: string[];
    articlesWithoutBodyInboundLinks: string[];
    configuredRecommendationTargetsMissing: string[];
    unclassifiedPublishingCandidates: string[];
  };
  schedulerEvidence: string[];
}

interface LegacyClusterYaml {
  pillar?: string;
  pillar_slug?: string;
  description?: string;
  clusters?: Array<{
    type?: string;
    slug?: string;
    title?: string;
    status?: string;
  }>;
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

export function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function scanMdxFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return scanMdxFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith(".mdx")) return [fullPath];
      return [];
    })
    .sort(compareCodePoints);
}

function scanMdxFilesInRuntimeOrder(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];

  const files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...scanMdxFilesInRuntimeOrder(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeInternalUrl(rawUrl: string): string | null {
  const unwrapped = rawUrl.trim().replace(/^<|>$/g, "");
  let pathname = unwrapped;

  if (unwrapped.startsWith(BASE_URL)) {
    pathname = unwrapped.slice(BASE_URL.length) || "/";
  } else if (
    /^https?:\/\//.test(unwrapped) ||
    unwrapped.startsWith("mailto:") ||
    unwrapped.startsWith("tel:")
  ) {
    return null;
  }

  if (!pathname.startsWith("/")) return null;
  if (/\.(?:avif|gif|jpe?g|pdf|png|svg|webp)(?:[?#].*)?$/i.test(pathname))
    return null;

  return pathname;
}

function extractInternalLinks(content: string): string[] {
  const links = new Set<string>();
  const linkPattern =
    /(?:href\s*=\s*["']([^"']+)["']|\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\))/g;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(content)) !== null) {
    const normalized = normalizeInternalUrl(match[1] ?? match[2] ?? "");
    if (normalized) links.add(normalized);
  }

  return [...links].sort(compareCodePoints);
}

function collectArticles(projectRoot: string): ArticleInventoryItem[] {
  const blogDirectory = path.join(projectRoot, "content/blog");

  return scanMdxFiles(blogDirectory).map((filePath) => {
    const relativeMdxPath = toPosixPath(path.relative(blogDirectory, filePath));
    const slug = relativeMdxPath.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const route = `/article/${slug}`;
    const frontmatterCanonical =
      typeof data.canonical === "string" ? data.canonical.trim() : "";
    const frontmatterSlug =
      typeof data.slug === "string" && data.slug.trim()
        ? data.slug.trim()
        : null;

    return {
      file: toPosixPath(path.relative(projectRoot, filePath)),
      slug,
      route,
      frontmatterSlug,
      title: String(data.title ?? ""),
      category: String(data.category ?? "Uncategorized"),
      publishedDate: String(data.date ?? data.published ?? ""),
      canonical: frontmatterCanonical || `${BASE_URL}${route}`,
      canonicalSource: frontmatterCanonical ? "frontmatter" : "derived-route",
      indexable: data.noindex !== true && data.draft !== true,
      internalLinks: extractInternalLinks(content),
    };
  });
}

function referenceInventoryStatus(
  slug: string | null,
  declaredStatus: string,
  liveSlugs: Set<string>,
): LegacyInventoryStatus {
  if (!slug)
    return declaredStatus === "planned" ? "planned-placeholder" : "unaccounted";
  if (BLOG_GONE_SLUGS.includes(slug)) return "gone-410";
  return liveSlugs.has(slug) ? "live" : "missing";
}

function collectLegacyClusters(
  projectRoot: string,
  articles: ArticleInventoryItem[],
): LegacyClusterInventory[] {
  const liveSlugs = new Set(articles.map((article) => article.slug));

  return LEGACY_CLUSTER_PATHS.map((relativePath) => {
    const filePath = path.join(projectRoot, relativePath);
    const data = parse(fs.readFileSync(filePath, "utf8")) as LegacyClusterYaml;
    const pillarSlug = data.pillar_slug?.trim() || null;
    const references: LegacyClusterReference[] = [
      {
        role: "pillar",
        type: "pillar",
        slug: pillarSlug,
        title: data.pillar?.trim() ?? "",
        declaredStatus: "declared-pillar",
        inventoryStatus: referenceInventoryStatus(
          pillarSlug,
          "declared-pillar",
          liveSlugs,
        ),
      },
      ...(data.clusters ?? []).map((cluster): LegacyClusterReference => {
        const slug = cluster.slug?.trim() || null;
        const declaredStatus = cluster.status?.trim() || "unspecified";
        return {
          role: "cluster",
          type: cluster.type?.trim() || "unspecified",
          slug,
          title: cluster.title?.trim() ?? "",
          declaredStatus,
          inventoryStatus: referenceInventoryStatus(
            slug,
            declaredStatus,
            liveSlugs,
          ),
        };
      }),
    ];

    return {
      path: relativePath,
      description: data.description?.trim() ?? "",
      references,
    };
  });
}

const DISCOVERY_SURFACES: DiscoverySurface[] = [
  {
    id: "article-listing",
    source:
      "app/(public)/article/page.tsx and app/components/ArticleListContent.tsx",
    behavior:
      "Reads top-level content/blog MDX files, orders known high-impression slugs first, and links each card to /article/{slug}.",
    limitations:
      "The listing scan is not recursive and its hard-coded impression order can become stale.",
  },
  {
    id: "article-detail",
    source: "app/(public)/article/[slug]/page.tsx and article-utils.ts",
    behavior:
      "Recursively scans content/blog, loads the requested MDX file, renders metadata and body content, and supplies previous/next navigation through ArticleNavigation.",
    limitations:
      "Seven blocked slugs are excluded by article-utils; frontmatter slug is not the routing source.",
  },
  {
    id: "sitemap",
    source: "app/sitemap.ts",
    behavior:
      "Recursively scans content/blog and emits /article/{slug} entries after excluding BLOG_GONE_SLUGS.",
    limitations:
      "lastModified falls back to 2026-01-01 when an article date is absent.",
  },
  {
    id: "navigation",
    source:
      "app/components/Navbar.tsx, app/components/Footer.tsx, and app/data/nav-links.ts",
    behavior:
      "Navbar and footer expose the article index; the shared live service menu also feeds sitemap service URLs.",
    limitations:
      "No topic-cluster or pillar navigation is currently exposed in the global navigation.",
  },
  {
    id: "recommendations",
    source:
      "app/(public)/article/[slug]/ArticleNavigation.tsx; app/(public)/article/[slug]/RecommendedSidebar.tsx; app/components/BlogPreview.tsx; app/factory/[slug]/page.tsx; data/link-graph.json",
    behavior:
      "Article detail pages expose previous/next links in the recursive filesystem order returned by article-utils. Homepage recommendations use a hard-coded TOP_SLUGS list. Factory pages use explicit link-graph relationships. The same-category RecommendedSidebar helper exists but is not mounted in the article page.",
    limitations:
      "Recommendation behavior is split across three mechanisms; previous/next order is filesystem-dependent, the dormant sidebar is not an active discovery surface, and no shared service-led topic graph exists yet.",
  },
  {
    id: "dashboard",
    source:
      "../productivity/growth-dashboard/ and ../productivity/daily-analytics/reports/",
    behavior:
      "Local growth-dashboard data and dated analytics exports expose article performance for internal review.",
    limitations:
      "The dashboard is outside the frontend Git repository and daily_report.py mutates data and may deploy Cloudflare Pages, so this audit reads dated exports only.",
  },
];

const MEASUREMENTS: MeasurementBaseline[] = [
  {
    id: "gsc",
    asOf: "2026-07-14",
    availability: "available",
    baseline:
      "Last 28 days: 182 clicks, 14,711 impressions, 1.2% CTR. /article/verify-chinese-supplier: 4 clicks, 212 impressions, average position 8.5.",
    source: "../productivity/daily-analytics/reports/2026-07-14.md",
    limitations:
      "Static export, not a live query; the report still includes legacy 410 URLs among top pages.",
  },
  {
    id: "ga4",
    asOf: "2026-07-14",
    availability: "available",
    baseline:
      "GA4 property 526384627, last 28 days Organic Search: 250 sessions, 180 users, and 4 form submissions.",
    source: "../productivity/daily-analytics/reports/2026-07-14.md",
    limitations:
      "Static export; it does not provide durable article-to-lead attribution or qualified-lead outcome data.",
  },
  {
    id: "enquiry",
    asOf: "2026-07-14",
    availability: "partial",
    baseline:
      "Four Organic Search form submissions are visible in the latest GA4 export.",
    source:
      "../productivity/daily-analytics/reports/2026-07-14.md and current GA4 form_submit tracking",
    limitations:
      "No approved 90-day attribution store, qualification status, or privacy-safe article-to-enquiry contract is available yet.",
  },
  {
    id: "indexation",
    asOf: "2026-07-16",
    availability: "partial",
    baseline:
      "/article/check-chinese-company-samr is live and awaiting first-crawl/indexation monitoring through sitemap, internal links, and GSC URL Inspection.",
    source: "../productivity/TASKS.md and ../Handoff.md",
    limitations:
      "Historical Indexing API and IndexNow submissions are notifications, not proof of crawl or indexation; no live URL Inspection export is stored for this audit.",
  },
  {
    id: "geo",
    asOf: AUDIT_DATE,
    availability: "unavailable",
    baseline:
      "No reproducible answer-engine visibility baseline has been captured.",
    source: "docs/superpowers/specs/2026-07-17-seo-growth-system-design.md",
    limitations:
      "The approved 50-question baseline and citation checks are implemented by later tickets 31-36.",
  },
];

interface ScheduledTaskRecord {
  id: string;
  enabled: boolean;
  cronExpression?: string;
  fireAt?: number;
  filePath?: string;
  definitionSha256?: string;
  lastRunAt?: string;
}

interface ScheduledTaskRegistry {
  scheduledTasks?: ScheduledTaskRecord[];
}

interface ScheduledTaskSnapshot extends ScheduledTaskRegistry {
  auditDate?: string;
  capturedAt?: string;
  taskCount?: number;
  source?: string;
  inspection?: string[];
}

interface SchedulerReleaseSafetyOptions {
  maxAgeHours?: number;
  now?: Date;
  schedulerRegistryPath?: string;
}

const SCHEDULER_SNAPSHOT_PATH =
  "content/seo/evidence/2026-07-17-scheduler-state.yaml";

const SCHEDULED_TASK_DEFINITIONS = {
  "seo-purge-remaining-410":
    "~/Claude/Scheduled/seo-purge-remaining-410/SKILL.md",
  "seo-reindex-updated-pages":
    "~/Claude/Scheduled/seo-reindex-updated-pages/SKILL.md",
  "wag-daily-analytics": "~/Claude/Scheduled/wag-daily-analytics/SKILL.md",
  "wag-google-ads-daily-insight":
    "~/Claude/Scheduled/wag-google-ads-daily-insight/SKILL.md",
} as const;

type ScheduledTaskId = keyof typeof SCHEDULED_TASK_DEFINITIONS;
type PublishingCapability =
  | "cloudflare-pages-deploy"
  | "frontend-production-deploy"
  | "git-push"
  | "indexing-notification";

const SCHEDULED_TASK_IDS = Object.keys(SCHEDULED_TASK_DEFINITIONS).sort(
  compareCodePoints,
) as ScheduledTaskId[];

function uniqueSorted<T extends string>(values: T[]): T[] {
  return [...new Set(values)].sort(compareCodePoints);
}

function publishingPath(
  input: Omit<PublishingPath, "evidenceFiles" | "technicalControl"> & {
    evidenceFiles?: string[];
    technicalControl?: PublishingPath["technicalControl"];
  },
): PublishingPath {
  return {
    ...input,
    evidenceFiles: input.evidenceFiles ?? [],
    technicalControl: input.technicalControl ?? {
      state: "not-applicable",
      mechanism: "none",
      evidence:
        "No production publication capability is present for this path.",
    },
  };
}

function resolveEvidencePath(filePath: string): string {
  if (filePath === "~") return process.env.HOME ?? filePath;
  if (filePath.startsWith("~/") && process.env.HOME) {
    return path.join(process.env.HOME, filePath.slice(2));
  }
  return path.resolve(filePath);
}

function sha256File(filePath: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

function schedulerTaskToken(id: string): string {
  return `scheduler::${id}`;
}

function readScheduledTaskSnapshot(projectRoot: string): {
  path: string;
  source: string;
  inspection: string[];
  tasks: Map<string, ScheduledTaskRecord>;
} {
  const snapshotPath = path.join(projectRoot, SCHEDULER_SNAPSHOT_PATH);
  if (!fs.existsSync(snapshotPath)) {
    return {
      path: SCHEDULER_SNAPSHOT_PATH,
      source: "not captured",
      inspection: [],
      tasks: new Map(),
    };
  }

  const snapshot = parse(
    fs.readFileSync(snapshotPath, "utf8"),
  ) as ScheduledTaskSnapshot;
  if (snapshot.auditDate !== AUDIT_DATE) {
    throw new Error(
      `${SCHEDULER_SNAPSHOT_PATH} must use auditDate ${AUDIT_DATE}.`,
    );
  }

  const tasks = snapshot.scheduledTasks ?? [];
  const taskIds = tasks.map((task) => task.id);
  if (new Set(taskIds).size !== taskIds.length) {
    throw new Error(
      `${SCHEDULER_SNAPSHOT_PATH} contains duplicate scheduled task IDs.`,
    );
  }
  if (snapshot.taskCount !== tasks.length) {
    throw new Error(
      `${SCHEDULER_SNAPSHOT_PATH} taskCount must equal scheduledTasks.length.`,
    );
  }

  return {
    path: SCHEDULER_SNAPSHOT_PATH,
    source: snapshot.source ?? "not documented",
    inspection: snapshot.inspection ?? [],
    tasks: new Map(tasks.map((task) => [task.id, task])),
  };
}

function verifySchedulerSnapshotStructure(projectRoot: string): string[] {
  const snapshotPath = path.join(projectRoot, SCHEDULER_SNAPSHOT_PATH);
  if (!fs.existsSync(snapshotPath))
    return [`${SCHEDULER_SNAPSHOT_PATH} is missing.`];

  const snapshot = parse(
    fs.readFileSync(snapshotPath, "utf8"),
  ) as ScheduledTaskSnapshot;
  const errors: string[] = [];
  const tasks = snapshot.scheduledTasks ?? [];
  const taskIds = tasks.map((task) => task.id);
  const actualIds = new Set(taskIds);

  if (snapshot.auditDate !== AUDIT_DATE) {
    errors.push(`${SCHEDULER_SNAPSHOT_PATH} auditDate must be ${AUDIT_DATE}.`);
  }
  if (
    !snapshot.capturedAt ||
    Number.isNaN(new Date(snapshot.capturedAt).getTime())
  ) {
    errors.push(
      `${SCHEDULER_SNAPSHOT_PATH} capturedAt must be a valid ISO timestamp.`,
    );
  }
  if (snapshot.taskCount !== tasks.length) {
    errors.push(
      `${SCHEDULER_SNAPSHOT_PATH} taskCount must equal scheduledTasks.length.`,
    );
  }
  if (actualIds.size !== taskIds.length) {
    errors.push(
      `${SCHEDULER_SNAPSHOT_PATH} contains duplicate scheduled task IDs.`,
    );
  }
  for (const id of taskIds
    .filter((id) => !SCHEDULED_TASK_IDS.includes(id as ScheduledTaskId))
    .sort(compareCodePoints)) {
    errors.push(
      `Unknown scheduler task requires explicit classification: ${id}.`,
    );
  }
  for (const id of SCHEDULED_TASK_IDS.filter((id) => !actualIds.has(id))) {
    errors.push(`Expected scheduler task is missing from the snapshot: ${id}.`);
  }
  for (const task of tasks) {
    const expectedDefinition =
      SCHEDULED_TASK_DEFINITIONS[task.id as ScheduledTaskId];
    if (!expectedDefinition) continue;
    if (task.filePath !== expectedDefinition) {
      errors.push(`${task.id} filePath must be ${expectedDefinition}.`);
    }
    if (!/^[a-f0-9]{64}$/.test(task.definitionSha256 ?? "")) {
      errors.push(
        `${task.id} definitionSha256 must be a lowercase SHA-256 digest.`,
      );
    }
  }

  return uniqueSorted(errors);
}

export function verifySchedulerSnapshotBinding(projectRoot: string): string[] {
  const snapshotPath = path.join(projectRoot, SCHEDULER_SNAPSHOT_PATH);
  if (!fs.existsSync(snapshotPath))
    return [`${SCHEDULER_SNAPSHOT_PATH} is missing.`];

  const snapshot = parse(
    fs.readFileSync(snapshotPath, "utf8"),
  ) as ScheduledTaskSnapshot;
  const errors = verifySchedulerSnapshotStructure(projectRoot);
  const tasks = snapshot.scheduledTasks ?? [];

  for (const task of tasks.sort((left, right) =>
    compareCodePoints(left.id, right.id),
  )) {
    const expectedDefinition =
      SCHEDULED_TASK_DEFINITIONS[task.id as ScheduledTaskId];
    if (!expectedDefinition) continue;
    const expectedEvidencePath = expectedDefinition;
    if (task.filePath !== expectedEvidencePath) {
      errors.push(`${task.id} filePath must be ${expectedEvidencePath}.`);
      continue;
    }

    const definitionPath = resolveEvidencePath(task.filePath);
    if (!fs.existsSync(definitionPath)) {
      errors.push(`${task.id} definition is missing at ${task.filePath}.`);
      continue;
    }
    const currentHash = sha256File(definitionPath);
    if (task.definitionSha256 !== currentHash) {
      errors.push(
        `${task.id} definition hash does not match the captured snapshot.`,
      );
    }
  }

  return uniqueSorted(errors);
}

function findFilesNamed(directory: string, filename: string): string[] {
  if (!fs.existsSync(directory)) return [];

  try {
    return fs
      .readdirSync(directory, { withFileTypes: true })
      .flatMap((entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return findFilesNamed(fullPath, filename);
        return entry.isFile() && entry.name === filename ? [fullPath] : [];
      });
  } catch {
    return [];
  }
}

function resolveLiveSchedulerRegistryPath(
  options: SchedulerReleaseSafetyOptions,
): {
  registryPath: string | null;
  errors: string[];
} {
  const explicitPath = options.schedulerRegistryPath;
  if (explicitPath) {
    const registryPath = path.resolve(explicitPath);
    return fs.existsSync(registryPath)
      ? { registryPath, errors: [] }
      : {
          registryPath: null,
          errors: [
            `Live scheduler registry is missing at ${toPosixPath(registryPath)}.`,
          ],
        };
  }

  const homeRoot = process.env.HOME;
  if (!homeRoot) {
    return {
      registryPath: null,
      errors: [
        "HOME is unavailable; the canonical live scheduler registry cannot be verified.",
      ],
    };
  }

  const registryRoot = path.join(
    homeRoot,
    "Library/Application Support/Claude/local-agent-mode-sessions",
  );
  const candidates = findFilesNamed(registryRoot, "scheduled-tasks.json").sort(
    compareCodePoints,
  );
  if (candidates.length === 1)
    return { registryPath: candidates[0], errors: [] };
  if (candidates.length === 0) {
    return {
      registryPath: null,
      errors: [
        `Live scheduler registry was not found under ${toPosixPath(registryRoot)}.`,
      ],
    };
  }

  return {
    registryPath: null,
    errors: [
      `Multiple live scheduler registries were found under ${toPosixPath(registryRoot)} (${candidates.length} candidates).`,
    ],
  };
}

function normalizeSchedulerDefinitionPath(
  filePath: string | undefined,
): string | undefined {
  if (!filePath) return undefined;
  if (filePath === "~" || filePath.startsWith("~/"))
    return toPosixPath(filePath);

  const homeRoot = process.env.HOME ? path.resolve(process.env.HOME) : null;
  const absolutePath = path.resolve(filePath);
  if (homeRoot && absolutePath.startsWith(`${homeRoot}${path.sep}`)) {
    return `~/${toPosixPath(path.relative(homeRoot, absolutePath))}`;
  }
  return toPosixPath(absolutePath);
}

function verifyLiveSchedulerRegistryBinding(
  projectRoot: string,
  options: SchedulerReleaseSafetyOptions,
): string[] {
  const snapshotPath = path.join(projectRoot, SCHEDULER_SNAPSHOT_PATH);
  if (!fs.existsSync(snapshotPath))
    return [`${SCHEDULER_SNAPSHOT_PATH} is missing.`];

  const resolvedRegistry = resolveLiveSchedulerRegistryPath(options);
  if (!resolvedRegistry.registryPath) return resolvedRegistry.errors;

  let liveRegistry: ScheduledTaskRegistry;
  try {
    liveRegistry = JSON.parse(
      fs.readFileSync(resolvedRegistry.registryPath, "utf8"),
    ) as ScheduledTaskRegistry;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [`Live scheduler registry could not be parsed: ${message}`];
  }

  const snapshot = parse(
    fs.readFileSync(snapshotPath, "utf8"),
  ) as ScheduledTaskSnapshot;
  const snapshotTasks = new Map(
    (snapshot.scheduledTasks ?? []).map((task) => [task.id, task]),
  );
  const liveTasks = liveRegistry.scheduledTasks ?? [];
  const liveTaskIds = liveTasks.map((task) => task.id);
  const errors = [...resolvedRegistry.errors];

  if (new Set(liveTaskIds).size !== liveTaskIds.length) {
    errors.push("Live scheduler registry contains duplicate task IDs.");
  }

  const liveTaskMap = new Map(liveTasks.map((task) => [task.id, task]));
  for (const id of liveTaskIds.filter(
    (id) => !SCHEDULED_TASK_IDS.includes(id as ScheduledTaskId),
  )) {
    errors.push(`Live scheduler registry contains unclassified task: ${id}.`);
  }
  for (const id of SCHEDULED_TASK_IDS.filter((id) => !liveTaskMap.has(id))) {
    errors.push(
      `Expected task is missing from the live scheduler registry: ${id}.`,
    );
  }

  for (const id of SCHEDULED_TASK_IDS) {
    const capturedTask = snapshotTasks.get(id);
    const liveTask = liveTaskMap.get(id);
    if (!capturedTask || !liveTask) continue;

    if (capturedTask.enabled !== liveTask.enabled) {
      errors.push(
        `${id} enabled state differs between the snapshot and live scheduler registry.`,
      );
    }
    if (capturedTask.cronExpression !== liveTask.cronExpression) {
      errors.push(
        `${id} cronExpression differs between the snapshot and live scheduler registry.`,
      );
    }
    if (capturedTask.fireAt !== liveTask.fireAt) {
      errors.push(
        `${id} fireAt differs between the snapshot and live scheduler registry.`,
      );
    }
    if (
      capturedTask.filePath !==
      normalizeSchedulerDefinitionPath(liveTask.filePath)
    ) {
      errors.push(
        `${id} filePath differs between the snapshot and live scheduler registry.`,
      );
    }
  }

  return uniqueSorted(errors);
}

export function verifySchedulerSnapshotReleaseSafety(
  projectRoot: string,
  options: SchedulerReleaseSafetyOptions = {},
): string[] {
  const snapshotPath = path.join(projectRoot, SCHEDULER_SNAPSHOT_PATH);
  if (!fs.existsSync(snapshotPath))
    return [`${SCHEDULER_SNAPSHOT_PATH} is missing.`];

  const snapshot = parse(
    fs.readFileSync(snapshotPath, "utf8"),
  ) as ScheduledTaskSnapshot;
  const errors = [
    ...verifySchedulerSnapshotBinding(projectRoot),
    ...verifyLiveSchedulerRegistryBinding(projectRoot, options),
  ];
  const capturedAt = snapshot.capturedAt ? new Date(snapshot.capturedAt) : null;

  if (!capturedAt || Number.isNaN(capturedAt.getTime())) {
    errors.push(
      `${SCHEDULER_SNAPSHOT_PATH} capturedAt must be a valid ISO timestamp.`,
    );
  } else {
    const now = options.now ?? new Date();
    const maxAgeHours = options.maxAgeHours ?? 24;
    const ageMilliseconds = now.getTime() - capturedAt.getTime();
    if (ageMilliseconds < 0 || ageMilliseconds > maxAgeHours * 60 * 60 * 1000) {
      errors.push(
        `${SCHEDULER_SNAPSHOT_PATH} is outside the ${maxAgeHours}-hour release-safety window.`,
      );
    }
  }

  return uniqueSorted(errors);
}

function buildPublishingPaths(projectRoot: string): {
  paths: PublishingPath[];
  schedulerEvidence: string[];
} {
  const vercelConfigPath = path.join(projectRoot, "vercel.json");
  const vercelConfig = fs.existsSync(vercelConfigPath)
    ? (JSON.parse(fs.readFileSync(vercelConfigPath, "utf8")) as {
        git?: { deploymentEnabled?: boolean };
      })
    : {};
  const gitDeploymentsDisabled = vercelConfig.git?.deploymentEnabled === false;
  const scheduler = readScheduledTaskSnapshot(projectRoot);
  const monorepoAgentSkillInspection =
    inspectMonorepoAgentSkillPublishingEvidence(projectRoot);
  const scheduledDefinition = (id: keyof typeof SCHEDULED_TASK_DEFINITIONS) =>
    SCHEDULED_TASK_DEFINITIONS[id];
  const scheduledState = (
    id: keyof typeof SCHEDULED_TASK_DEFINITIONS,
  ): PublishingObservedState => {
    const task = scheduler.tasks.get(id);
    if (!task) return "not-observed";
    return task.enabled ? "enabled" : "disabled";
  };

  const schedulerEvidence = [
    `${AUDIT_DATE} repository scheduler snapshot: ${scheduler.path}; source: ${scheduler.source}.`,
    ...Object.keys(SCHEDULED_TASK_DEFINITIONS)
      .sort(compareCodePoints)
      .map((id) => {
        const task = scheduler.tasks.get(id);
        if (!task) return `${id}: not present in the discovered registry.`;
        const cadence = task.cronExpression
          ? `cron ${task.cronExpression}`
          : `one-time fireAt ${task.fireAt ?? "unknown"}`;
        return `${id}: ${task.enabled ? "enabled" : "disabled"}; ${cadence}; lastRunAt ${task.lastRunAt ?? "never"}.`;
      }),
    ...scheduler.inspection,
    "Repository GitHub Actions: security.yml is the only workflow and contains verification only.",
    "package.json: validation and release-safety commands are registered, but no production publish, deploy, IndexNow, or Indexing API npm command is registered.",
  ];

  return {
    schedulerEvidence,
    paths: [
      publishingPath({
        id: "package-script-surface",
        kind: "tracking",
        source: "package.json::scripts",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The registered npm scripts contain validation and local generation commands, but no production publish or deploy command.",
        evidenceFiles: [
          "package.json",
          "package.json::scripts.seo:baseline:release-safety",
        ],
      }),
      publishingPath({
        id: "publishing-safety-scanner",
        kind: "tracking",
        source: "lib/seo-baseline-audit.ts",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The file contains detection signatures for read-only repository inspection and has no publication side effect.",
        evidenceFiles: [
          "lib/seo-baseline-audit.ts",
          "lib/seo-baseline-audit.ts::capability.cloudflare-pages-deploy",
          "lib/seo-baseline-audit.ts::capability.frontend-production-deploy",
          "lib/seo-baseline-audit.ts::capability.git-push",
          "lib/seo-baseline-audit.ts::capability.indexing-notification",
        ],
      }),
      publishingPath({
        id: "seo-release-governance-contracts",
        kind: "tracking",
        source: "lib/seo/release/** and release event adapters",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "These deterministic contracts and adapters validate release evidence but expose no filesystem, network, deployment, or publication side effect.",
        evidenceFiles: [
          "lib/seo/cadence/releaseEventAdapter.test.ts",
          "lib/seo/cadence/releaseEventAdapter.ts",
          "lib/seo/publication/releaseBinding.ts",
          "lib/seo/release/releaseContract.hardening.test.ts",
          "lib/seo/release/releaseContract.test.ts",
          "lib/seo/release/releaseContract.ts",
        ],
      }),
      publishingPath({
        id: "blog-generator-save",
        kind: "generation",
        source: "scripts/blog_generator.py::BlogGenerator.save_blog",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "policy-only",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "Direct invocation can mutate canonical MDX content, but it cannot commit, push, or deploy.",
        evidenceFiles: ["scripts/blog_generator.py"],
      }),
      publishingPath({
        id: "seo-workflow-generate",
        kind: "generation",
        source: "scripts/seo_workflow.py --mode generate",
        classification: "manual",
        observedState: "disabled",
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The generate branch is a TODO and performs no content generation or publication.",
        evidenceFiles: ["scripts/seo_workflow.py"],
      }),
      publishingPath({
        id: "seo-workflow-schedule",
        kind: "scheduling",
        source: "scripts/seo_workflow.py --mode schedule",
        classification: "unattended",
        observedState: "disabled",
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The schedule branch is a TODO and has no runnable scheduler implementation.",
        evidenceFiles: ["scripts/seo_workflow.py"],
      }),
      publishingPath({
        id: "legacy-seo-workflow-scheduling-docs",
        kind: "scheduling",
        source: "scripts/README.md::launchd and cron examples",
        classification: "unattended",
        observedState: "disabled",
        productionTarget: "none",
        approvalEnforcement: "technical",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The examples target an obsolete repository path, the schedule implementation remains a TODO, and the dated scheduler snapshot found no installed cron or LaunchAgent entry.",
        evidenceFiles: [
          "scripts/README.md",
          "scripts/seo_workflow.py",
          scheduler.path,
        ],
        technicalControl: {
          state: "enforced",
          mechanism: "non-executable-obsolete-scheduling-example",
          evidence:
            "The documented launchd and cron commands cannot reach a runnable publishing implementation.",
        },
      }),
      publishingPath({
        id: "legacy-auto-publish-docs",
        kind: "scheduling",
        source: "docs/superpowers specs and plans dated 2026-05-01",
        classification: "unattended",
        observedState: "disabled",
        productionTarget: "frontend",
        approvalEnforcement: "technical",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "Both files are non-executable documentation, and the dated scheduler snapshot plus repository scan found no installed scheduler or unattended publisher for this path.",
        evidenceFiles: [
          "docs/superpowers/plans/2026-05-01-WAG-SEO-文章自动流水线实施计划.md",
          "docs/superpowers/specs/2026-05-01-WAG-SEO-文章自动流水线设计.md",
        ],
        technicalControl: {
          state: "enforced",
          mechanism: "non-executable-uninstalled-documentation",
          evidence:
            "The files are documentation only; no executable launcher for this path was found, and Vercel Git deployments are disabled in vercel.json.",
        },
      }),
      publishingPath({
        id: "legacy-wag-seo-skill",
        kind: "deployment",
        source: "../.agents/skills/WAG_seo/SKILL.md::human_approved_publish",
        classification: "gated",
        observedState: "disabled",
        productionTarget: "frontend",
        approvalEnforcement: "technical",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The referenced publisher.publish implementation is absent, so the documented path cannot execute.",
        evidenceFiles: ["../.agents/skills/WAG_seo/SKILL.md"],
        technicalControl: {
          state: "enforced",
          mechanism: "missing-publisher-implementation",
          evidence:
            "../.agents/skills/WAG_seo/SKILL.md references publisher.publish, which is not present in the repository.",
        },
      }),
      publishingPath({
        id: "monorepo-agent-skill-publishing-guidance",
        kind: "deployment",
        source: "../.agents/skills/**/SKILL.md publishing commands",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "frontend",
        approvalEnforcement: "technical",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "Agent skill files are non-executable guidance; their Git push commands require an explicit operator or agent invocation, and Vercel Git deployments are disabled.",
        evidenceFiles: monorepoAgentSkillInspection.evidence,
        technicalControl: {
          state: "enforced",
          mechanism: "non-executable-guidance-and-vercel-git-disabled",
          evidence:
            "Publishing-capable skill guidance is fully inventoried, and vercel.json disables Git-triggered deployments.",
        },
      }),
      publishingPath({
        id: "git-push-production-trigger",
        kind: "deployment",
        source: "git push origin master",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "frontend",
        approvalEnforcement: "technical",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "A push can update GitHub, but Vercel Git deployments are disabled in vercel.json.",
        evidenceFiles: ["CLAUDE.md", "vercel.json"],
        technicalControl: {
          state: gitDeploymentsDisabled ? "enforced" : "not-enforced",
          mechanism: gitDeploymentsDisabled
            ? "vercel-git-deployments-disabled"
            : "none",
          evidence: gitDeploymentsDisabled
            ? "vercel.json::git.deploymentEnabled=false"
            : "vercel.json does not disable Git deployments.",
        },
      }),
      publishingPath({
        id: "vercel-git-production-deploy",
        kind: "deployment",
        source: "Vercel Git integration",
        classification: "unattended",
        observedState: gitDeploymentsDisabled ? "disabled" : "enabled",
        productionTarget: "frontend",
        approvalEnforcement: "technical",
        initiatesPublication: false,
        canPublishProduction: !gitDeploymentsDisabled,
        hardBlocker: gitDeploymentsDisabled
          ? "Vercel Git deployments are disabled for every branch."
          : "No technical Git-deployment blocker is configured.",
        evidenceFiles: ["vercel.json"],
        technicalControl: {
          state: gitDeploymentsDisabled ? "enforced" : "not-enforced",
          mechanism: gitDeploymentsDisabled
            ? "vercel-git-deployments-disabled"
            : "none",
          evidence: gitDeploymentsDisabled
            ? "vercel.json::git.deploymentEnabled=false"
            : "vercel.json does not disable Git deployments.",
        },
      }),
      publishingPath({
        id: "vercel-cli-production-deploy",
        kind: "deployment",
        source: "vercel deploy --prod / vercel deploy --target production",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "frontend",
        approvalEnforcement: "policy-only",
        initiatesPublication: true,
        canPublishProduction: true,
        hardBlocker:
          "No unattended repository launcher was observed. Production publication still requires an explicit authenticated manual Vercel command; a technical dual-approval gate remains a Ticket 38 blocker.",
        evidenceFiles: ["CLAUDE.md", "vercel.json"],
        technicalControl: {
          state: "not-enforced",
          mechanism: "explicit-manual-vercel-invocation",
          evidence:
            "Vercel CLI and REST credentials can bypass repository build hooks; the current boundary is manual invocation plus the absence of an unattended launcher.",
        },
      }),
      publishingPath({
        id: "github-security-workflow",
        kind: "tracking",
        source: ".github/workflows/security.yml",
        classification: "unattended",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker: "The workflow runs audit and build checks only.",
        evidenceFiles: [".github/workflows/security.yml"],
      }),
      publishingPath({
        id: "daily-analytics-dashboard-deploy",
        kind: "deployment",
        source: "../productivity/daily-analytics/daily_report.py",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "dashboard",
        approvalEnforcement: "policy-only",
        initiatesPublication: true,
        canPublishProduction: true,
        hardBlocker:
          "Direct invocation may deploy the separate Cloudflare dashboard; it cannot publish frontend content.",
        evidenceFiles: [
          "../productivity/daily-analytics/daily_report.py",
          "../productivity/daily-analytics/daily_report.py::capability.cloudflare-pages-deploy",
        ],
        technicalControl: {
          state: "not-enforced",
          mechanism: "dashboard-only-boundary",
          evidence:
            "The script targets productivity/growth-dashboard, not frontend or Vercel.",
        },
      }),
      publishingPath({
        id: "claude-scheduled-daily-analytics",
        kind: "scheduling",
        source: scheduledDefinition("wag-daily-analytics"),
        classification: "unattended",
        observedState: scheduledState("wag-daily-analytics"),
        productionTarget: "dashboard",
        approvalEnforcement: "none",
        initiatesPublication: true,
        canPublishProduction:
          scheduledState("wag-daily-analytics") === "enabled",
        hardBlocker:
          "The enabled task refreshes and deploys the separate growth dashboard, not the frontend.",
        evidenceFiles: [
          scheduledDefinition("wag-daily-analytics"),
          `${scheduledDefinition("wag-daily-analytics")}::capability.cloudflare-pages-deploy`,
          scheduler.path,
          schedulerTaskToken("wag-daily-analytics"),
        ],
        technicalControl: {
          state: "not-enforced",
          mechanism: "dashboard-only-boundary",
          evidence:
            "The scheduled definition calls productivity/growth-dashboard/deploy-cloudflare.sh.",
        },
      }),
      publishingPath({
        id: "claude-scheduled-google-ads",
        kind: "scheduling",
        source: scheduledDefinition("wag-google-ads-daily-insight"),
        classification: "unattended",
        observedState: scheduledState("wag-google-ads-daily-insight"),
        productionTarget: "dashboard",
        approvalEnforcement: "none",
        initiatesPublication: true,
        canPublishProduction:
          scheduledState("wag-google-ads-daily-insight") === "enabled",
        hardBlocker:
          "The enabled task deploys Ads data to the separate growth dashboard, not the frontend.",
        evidenceFiles: [
          scheduledDefinition("wag-google-ads-daily-insight"),
          `${scheduledDefinition("wag-google-ads-daily-insight")}::capability.cloudflare-pages-deploy`,
          scheduler.path,
          schedulerTaskToken("wag-google-ads-daily-insight"),
        ],
        technicalControl: {
          state: "not-enforced",
          mechanism: "dashboard-only-boundary",
          evidence:
            "The scheduled definition calls productivity/growth-dashboard/deploy-cloudflare.sh.",
        },
      }),
      publishingPath({
        id: "claude-scheduled-seo-purge",
        kind: "notification",
        source: scheduledDefinition("seo-purge-remaining-410"),
        classification: "unattended",
        observedState: scheduledState("seo-purge-remaining-410"),
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The one-time notification task is disabled and cannot publish a page.",
        evidenceFiles: [
          scheduledDefinition("seo-purge-remaining-410"),
          `${scheduledDefinition("seo-purge-remaining-410")}::capability.indexing-notification`,
          scheduler.path,
          schedulerTaskToken("seo-purge-remaining-410"),
        ],
        technicalControl: {
          state:
            scheduledState("seo-purge-remaining-410") === "disabled"
              ? "enforced"
              : "not-enforced",
          mechanism: "scheduler-disabled",
          evidence: `Claude Scheduled Tasks registry enabled=${scheduler.tasks.get("seo-purge-remaining-410")?.enabled ?? "not-observed"}.`,
        },
      }),
      publishingPath({
        id: "claude-scheduled-seo-reindex",
        kind: "notification",
        source: scheduledDefinition("seo-reindex-updated-pages"),
        classification: "unattended",
        observedState: scheduledState("seo-reindex-updated-pages"),
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The one-time notification task is disabled and cannot publish a page.",
        evidenceFiles: [
          scheduledDefinition("seo-reindex-updated-pages"),
          `${scheduledDefinition("seo-reindex-updated-pages")}::capability.indexing-notification`,
          scheduler.path,
          schedulerTaskToken("seo-reindex-updated-pages"),
        ],
        technicalControl: {
          state:
            scheduledState("seo-reindex-updated-pages") === "disabled"
              ? "enforced"
              : "not-enforced",
          mechanism: "scheduler-disabled",
          evidence: `Claude Scheduled Tasks registry enabled=${scheduler.tasks.get("seo-reindex-updated-pages")?.enabled ?? "not-observed"}.`,
        },
      }),
      publishingPath({
        id: "cloudflare-dashboard-deploy",
        kind: "deployment",
        source: "../productivity/growth-dashboard/deploy-cloudflare.sh",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "dashboard",
        approvalEnforcement: "policy-only",
        initiatesPublication: true,
        canPublishProduction: true,
        hardBlocker:
          "Direct shell invocation deploys only the separate growth dashboard.",
        evidenceFiles: [
          "../productivity/growth-dashboard/deploy-cloudflare.sh",
          "../productivity/growth-dashboard/deploy-cloudflare.sh::capability.cloudflare-pages-deploy",
        ],
        technicalControl: {
          state: "not-enforced",
          mechanism: "dashboard-only-boundary",
          evidence:
            "Cloudflare Pages project is separate from the Vercel frontend.",
        },
      }),
      publishingPath({
        id: "cloudflare-dashboard-package",
        kind: "generation",
        source: "../productivity/growth-dashboard/make-deploy.sh",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The script prepares a local deploy directory and performs no network upload.",
        evidenceFiles: ["../productivity/growth-dashboard/make-deploy.sh"],
      }),
      publishingPath({
        id: "cloudflare-dashboard-rest-fallback",
        kind: "deployment",
        source:
          "../productivity/growth-dashboard/COORDINATION.md::Cloudflare Pages Direct Upload REST API",
        classification: "manual",
        observedState: "unverified",
        productionTarget: "dashboard",
        approvalEnforcement: "none",
        initiatesPublication: true,
        canPublishProduction: true,
        hardBlocker:
          "The credentialed REST fallback can publish only the separate dashboard.",
        evidenceFiles: ["../productivity/growth-dashboard/COORDINATION.md"],
        technicalControl: {
          state: "not-enforced",
          mechanism: "dashboard-only-boundary",
          evidence:
            "The documented endpoint targets the Cloudflare growth-dashboard project.",
        },
      }),
      publishingPath({
        id: "pipeline-db-deploy-marker",
        kind: "tracking",
        source: "scripts/pipeline-db.py deploy",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker: "The command updates local SQLite metadata only.",
        evidenceFiles: ["scripts/pipeline-db.py"],
      }),
      publishingPath({
        id: "indexnow-api",
        kind: "notification",
        source: "app/api/indexnow/route.ts POST",
        classification: "unattended",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "none",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The route can submit Bing notifications but cannot publish content; notification is not indexation proof.",
        evidenceFiles: [
          "app/api/indexnow/route.ts",
          "app/api/indexnow/route.ts::capability.indexing-notification",
        ],
      }),
      publishingPath({
        id: "google-indexing-single",
        kind: "notification",
        source: "scripts/indexing_submit.py",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "none",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The script sends a notification and cannot publish a page.",
        evidenceFiles: [
          "scripts/indexing_submit.py",
          "scripts/indexing_submit.py::capability.indexing-notification",
        ],
      }),
      publishingPath({
        id: "google-indexing-batch",
        kind: "notification",
        source: "scripts/indexing_submit_58.py",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "none",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The batch script sends notifications and cannot publish a page.",
        evidenceFiles: [
          "scripts/indexing_submit_58.py",
          "scripts/indexing_submit_58.py::capability.indexing-notification",
        ],
      }),
      publishingPath({
        id: "google-410-purge",
        kind: "notification",
        source: "../productivity/seo-purge/purge_410.py",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "none",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The script submits URL_DELETED notifications and cannot publish content.",
        evidenceFiles: [
          "../productivity/seo-purge/purge_410.py",
          "../productivity/seo-purge/purge_410.py::capability.indexing-notification",
        ],
      }),
      publishingPath({
        id: "gsc-batch-check",
        kind: "tracking",
        source: "scripts/gsc-batch-check.sh",
        classification: "manual",
        observedState: "enabled",
        productionTarget: "none",
        approvalEnforcement: "not-applicable",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The helper performs read-only URL Inspection and writes local results.",
        evidenceFiles: ["scripts/gsc-batch-check.sh"],
      }),
      publishingPath({
        id: "legacy-content-automation-sop",
        kind: "scheduling",
        source: "../productivity/WAG-Content-Automation-SOP.md",
        classification: "unattended",
        observedState: "disabled",
        productionTarget: "frontend",
        approvalEnforcement: "technical",
        initiatesPublication: false,
        canPublishProduction: false,
        hardBlocker:
          "The SOP is historical documentation and no referenced unattended publisher is installed.",
        evidenceFiles: ["../productivity/WAG-Content-Automation-SOP.md"],
        technicalControl: {
          state: "enforced",
          mechanism: "non-executable-historical-documentation",
          evidence:
            "The file is documentation only and the current frontend Git deployment path is disabled.",
        },
      }),
    ],
  };
}

function normalizeCandidatePath(projectRoot: string, filePath: string): string {
  if (filePath === "~" || filePath.startsWith("~/"))
    return toPosixPath(filePath);
  const absoluteProjectRoot = path.resolve(projectRoot);
  const absoluteFilePath = path.resolve(filePath);
  const parentRoot = path.dirname(absoluteProjectRoot);
  const homeRoot = process.env.HOME ? path.resolve(process.env.HOME) : null;
  if (absoluteFilePath.startsWith(`${absoluteProjectRoot}${path.sep}`)) {
    return toPosixPath(path.relative(absoluteProjectRoot, absoluteFilePath));
  }
  if (absoluteFilePath.startsWith(`${parentRoot}${path.sep}`)) {
    return toPosixPath(path.relative(absoluteProjectRoot, absoluteFilePath));
  }
  if (homeRoot && absoluteFilePath.startsWith(`${homeRoot}${path.sep}`)) {
    return `~/${toPosixPath(path.relative(homeRoot, absoluteFilePath))}`;
  }
  return toPosixPath(absoluteFilePath);
}

function listFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (
      entry.isDirectory() &&
      [
        ".git",
        ".next",
        ".scratch",
        ".worktrees",
        "__pycache__",
        "coverage",
        "logs",
        "node_modules",
        "worktrees",
      ].includes(entry.name)
    )
      return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    return entry.isFile() && !/\.(?:pyc|pyo)$/.test(entry.name)
      ? [fullPath]
      : [];
  });
}

const MAX_PUBLISHING_SCAN_FILE_BYTES = 2 * 1024 * 1024;
const OPERATIONAL_NAME_PATTERN =
  /(blog_generator|seo_workflow|publish|deploy|release|schedul|indexing|indexnow|gsc-batch-check|pipeline-db)/i;
const OPERATIONAL_SOURCE_EXTENSIONS = new Set([
  ".bash",
  ".bat",
  ".c",
  ".cjs",
  ".cmd",
  ".cpp",
  ".cs",
  ".cts",
  ".fish",
  ".go",
  ".java",
  ".js",
  ".jsx",
  ".kt",
  ".lua",
  ".mjs",
  ".mts",
  ".php",
  ".pl",
  ".ps1",
  ".py",
  ".rb",
  ".rs",
  ".sh",
  ".swift",
  ".ts",
  ".tsx",
  ".zsh",
]);
const REFERENCED_ENTRYPOINT_PATTERN =
  /(?:~\/|\/|\.\.?\/)?[A-Za-z0-9_@.+*/\\-]+\.(?:bash|bat|cjs|cmd|cts|fish|js|jsx|mjs|mts|php|pl|ps1|py|rb|sh|ts|tsx|zsh)\b/g;
const RUNTIME_EXECUTABLE_PATTERN =
  /^(?:node(?:js)?|tsx|ts-node|bun|python(?:\d+(?:\.\d+)*)?|bash|sh|zsh|ruby|php|deno)$/i;
const SHELL_COMMAND_BOUNDARY_CHARS = new Set([
  ";",
  "|",
  "&",
  "(",
  ")",
  "{",
  "}",
  "`",
]);
const SHELL_REDIRECTION_CHARS = new Set(["<", ">"]);
const SHELL_COMMAND_RUNTIMES = new Set(["bash", "sh", "zsh"]);
const MAX_SHELL_COMMAND_DEPTH = 4;
const TEST_OR_SPEC_SOURCE_PATTERN = /\.(?:spec|test)\.(?:[cm]?[jt]sx?)$/i;

function detectPublishingCapabilities(content: string): PublishingCapability[] {
  const capabilities: PublishingCapability[] = [];
  const vercelProductionFlag = String.raw`(?:--prod\b|--target(?:=|\s+)["']?production\b["']?)`;
  const vercelCliPattern = new RegExp(
    `(?:\\bvercel\\b[^\\r\\n;&|]{0,320}${vercelProductionFlag}|${vercelProductionFlag}[^\\r\\n;&|]{0,320}\\bvercel\\b)`,
    "i",
  );
  const cloudflarePagesPattern =
    /(?:\bwrangler\b[^\r\n;&|]{0,320}\bpages\b[^\r\n;&|]{0,320}\bdeploy\b|\bdeploy-cloudflare\.sh\b|api\.cloudflare\.com[^\r\n]{0,240}pages)/i;

  if (
    vercelCliPattern.test(content) ||
    /\bvercel-action(?:@|\b)/i.test(content) ||
    /api\.vercel\.com\/(?:v\d+\/)?deployments\b/i.test(content) ||
    /\bcreateDeployment\s*\(/.test(content)
  ) {
    capabilities.push("frontend-production-deploy");
  }
  if (cloudflarePagesPattern.test(content))
    capabilities.push("cloudflare-pages-deploy");
  if (/\bgit\s+push\b/i.test(content)) capabilities.push("git-push");
  if (
    /(?:https?:\/\/)?(?:api\.indexnow\.org|www\.bing\.com)\/indexnow\b/i.test(
      content,
    ) ||
    /\b(?:submit|publish|notify)(?:Url)?ToIndexNow\s*\(/i.test(content) ||
    /\bIndexNow(?:Client|Service)?\s*[.(]/.test(content) ||
    /indexing\.googleapis\.com\/v3\/urlNotifications:publish/i.test(content) ||
    /urlNotifications\s*\(\s*\)\s*\.\s*publish/i.test(content)
  ) {
    capabilities.push("indexing-notification");
  }

  return uniqueSorted(capabilities);
}

function publishingCapabilityToken(
  projectRoot: string,
  filePath: string,
  capability: PublishingCapability,
): string {
  return `${normalizeCandidatePath(projectRoot, filePath)}::capability.${capability}`;
}

function readLikelyTextFile(filePath: string): string | null {
  const stats = fs.statSync(filePath);
  if (!stats.isFile() || stats.size > MAX_PUBLISHING_SCAN_FILE_BYTES)
    return null;

  const content = fs.readFileSync(filePath);
  if (content.includes(0)) return null;
  return content.toString("utf8");
}

function readReferencedEntrypoint(filePath: string): string | null {
  const stats = fs.statSync(filePath);
  if (!stats.isFile() || stats.size > MAX_PUBLISHING_SCAN_FILE_BYTES)
    return null;

  const content = fs.readFileSync(filePath);
  if (content.includes(0)) return null;
  return content.toString("utf8");
}

function tokenizeShellCommandSegments(source: string): string[][] {
  const segments: string[][] = [];
  let segment: string[] = [];
  let inputRedirectionTargets: string[] = [];
  let token = "";
  let quote: "single" | "double" | null = null;
  let escaped = false;
  let redirectionQuote: "single" | "double" | null = null;
  let redirectionEscaped = false;
  let redirectionStarted = false;
  let redirectionTarget = "";
  let redirectionMode: "input-file" | "skip" | null = null;

  const flushToken = () => {
    if (token.length > 0) segment.push(token);
    token = "";
  };
  const finishRedirectionTarget = () => {
    if (redirectionMode === "input-file" && redirectionTarget.length > 0) {
      inputRedirectionTargets.push(redirectionTarget);
    }
    redirectionQuote = null;
    redirectionEscaped = false;
    redirectionStarted = false;
    redirectionTarget = "";
    redirectionMode = null;
  };
  const flushSegment = () => {
    flushToken();
    finishRedirectionTarget();
    const completeSegment = [...segment, ...inputRedirectionTargets];
    if (completeSegment.length > 0) segments.push(completeSegment);
    segment = [];
    inputRedirectionTargets = [];
  };
  const startRedirection = (character: string): "input-file" | "skip" => {
    redirectionQuote = null;
    redirectionEscaped = false;
    redirectionStarted = false;
    redirectionTarget = "";
    return character === "<" ? "input-file" : "skip";
  };

  const normalizedSource = source.replace(/\\\r?\n/g, " ");
  for (const [index, character] of [...normalizedSource].entries()) {
    if (redirectionMode !== null) {
      if (redirectionEscaped) {
        if (redirectionMode === "input-file") redirectionTarget += character;
        redirectionEscaped = false;
        redirectionStarted = true;
        continue;
      }
      if (redirectionQuote === "single") {
        if (character === "'") redirectionQuote = null;
        else if (redirectionMode === "input-file")
          redirectionTarget += character;
        continue;
      }
      if (redirectionQuote === "double") {
        if (character === '"') redirectionQuote = null;
        else if (character === "\\") redirectionEscaped = true;
        else if (redirectionMode === "input-file")
          redirectionTarget += character;
        continue;
      }
      if (!redirectionStarted) {
        if (/\s/.test(character)) {
          if (character === "\n") flushSegment();
          continue;
        }
        if (character === "<") {
          redirectionMode = "skip";
          continue;
        }
        if (character === ">") continue;
        if (character === "&" || character === "|") {
          redirectionMode = "skip";
          continue;
        }
        if (character === "\\") {
          redirectionEscaped = true;
          redirectionStarted = true;
          continue;
        }
        if (character === "'") {
          redirectionQuote = "single";
          redirectionStarted = true;
          continue;
        }
        if (character === '"') {
          redirectionQuote = "double";
          redirectionStarted = true;
          continue;
        }
        if (SHELL_COMMAND_BOUNDARY_CHARS.has(character)) {
          flushSegment();
          continue;
        }
        redirectionStarted = true;
        if (redirectionMode === "input-file") redirectionTarget += character;
        continue;
      }
      if (character === "\\") {
        redirectionEscaped = true;
        continue;
      }
      if (character === "'") {
        redirectionQuote = "single";
        continue;
      }
      if (character === '"') {
        redirectionQuote = "double";
        continue;
      }
      if (/\s/.test(character)) {
        finishRedirectionTarget();
        if (character === "\n") flushSegment();
        continue;
      }
      if (SHELL_REDIRECTION_CHARS.has(character)) {
        finishRedirectionTarget();
        redirectionMode = startRedirection(character);
        continue;
      }
      if (SHELL_COMMAND_BOUNDARY_CHARS.has(character)) {
        flushSegment();
        continue;
      }
      if (redirectionMode === "input-file") redirectionTarget += character;
      continue;
    }
    if (escaped) {
      token += character;
      escaped = false;
      continue;
    }
    if (quote === "single") {
      if (character === "'") quote = null;
      else token += character;
      continue;
    }
    if (quote === "double") {
      if (character === '"') quote = null;
      else if (character === "\\") escaped = true;
      else token += character;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (character === "'") {
      quote = "single";
      continue;
    }
    if (character === '"') {
      quote = "double";
      continue;
    }
    if (character === "\n") {
      flushSegment();
      continue;
    }
    if (/\s/.test(character)) {
      flushToken();
      continue;
    }
    if (
      SHELL_REDIRECTION_CHARS.has(character) ||
      (character === "&" && normalizedSource[index + 1] === ">")
    ) {
      if (/^\d+$/.test(token)) token = "";
      else flushToken();
      redirectionMode = startRedirection(character);
      continue;
    }
    if (SHELL_COMMAND_BOUNDARY_CHARS.has(character)) {
      flushSegment();
      continue;
    }
    token += character;
  }

  if (escaped) token += "\\";
  flushSegment();
  return segments;
}

function readDollarCommandSubstitution(
  source: string,
  startIndex: number,
): { payload: string; endIndex: number } | null {
  const contexts: Array<{
    escaped: boolean;
    quote: "single" | "double" | null;
  }> = [{ escaped: false, quote: null }];

  for (let index = startIndex; index < source.length; index += 1) {
    const character = source[index];
    const context = contexts.at(-1);
    if (!context) return null;

    if (context.escaped) {
      context.escaped = false;
      continue;
    }
    if (character === "\\") {
      context.escaped = true;
      continue;
    }
    if (context.quote === "single") {
      if (character === "'") context.quote = null;
      continue;
    }
    if (context.quote === "double") {
      if (character === '"') {
        context.quote = null;
        continue;
      }
      if (character === "`") {
        const substitution = readBacktickCommandSubstitution(source, index + 1);
        if (substitution) index = substitution.endIndex;
        continue;
      }
      if (character === "$" && source[index + 1] === "(") {
        contexts.push({ escaped: false, quote: null });
        index += 1;
      }
      continue;
    }

    if (character === "$" && source[index + 1] === "(") {
      contexts.push({ escaped: false, quote: null });
      index += 1;
      continue;
    }
    if (character === "'") {
      context.quote = "single";
      continue;
    }
    if (character === '"') {
      context.quote = "double";
      continue;
    }
    if (character === "`") {
      const substitution = readBacktickCommandSubstitution(source, index + 1);
      if (substitution) index = substitution.endIndex;
      continue;
    }
    if (character === "(") {
      contexts.push({ escaped: false, quote: null });
      continue;
    }
    if (character === ")") {
      contexts.pop();
      if (contexts.length === 0) {
        return { payload: source.slice(startIndex, index), endIndex: index };
      }
    }
  }

  return null;
}

function readBacktickCommandSubstitution(
  source: string,
  startIndex: number,
): { payload: string; endIndex: number } | null {
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const character = source[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (character === "`") {
      return { payload: source.slice(startIndex, index), endIndex: index };
    }
  }

  return null;
}

function extractShellCommandSubstitutionPayloads(source: string): string[] {
  const payloads: string[] = [];
  let quote: "single" | "double" | null = null;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (quote === "single") {
      if (character === "'") quote = null;
      continue;
    }
    if (character === "'" && quote === null) {
      quote = "single";
      continue;
    }
    if (character === '"') {
      quote = quote === "double" ? null : "double";
      continue;
    }
    if (character === "$" && source[index + 1] === "(") {
      const substitution = readDollarCommandSubstitution(source, index + 2);
      if (!substitution) continue;
      payloads.push(substitution.payload);
      index = substitution.endIndex;
      continue;
    }
    if (character === "`") {
      const substitution = readBacktickCommandSubstitution(source, index + 1);
      if (!substitution) continue;
      payloads.push(substitution.payload);
      index = substitution.endIndex;
    }
  }

  return payloads;
}

function extractWorkflowRunCommands(source: string): {
  commands: string[];
  parseError: string | null;
} {
  let workflow: unknown;
  try {
    workflow = parse(source);
  } catch (error) {
    return {
      commands: [],
      parseError: error instanceof Error ? error.message : String(error),
    };
  }

  const commands: string[] = [];
  const visited = new WeakSet<object>();
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object" || visited.has(value)) return;
    visited.add(value);

    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }

    for (const [key, child] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (key === "run" && typeof child === "string") commands.push(child);
      visit(child);
    }
  };

  visit(workflow);
  return { commands: uniqueSorted(commands), parseError: null };
}

function extractRuntimeEntrypointCandidates(
  source: string,
  depth = 0,
): string[] {
  if (depth > MAX_SHELL_COMMAND_DEPTH) return [];

  const candidates = extractShellCommandSubstitutionPayloads(source).flatMap(
    (payload) => extractRuntimeEntrypointCandidates(payload, depth + 1),
  );

  for (const tokens of tokenizeShellCommandSegments(source)) {
    for (const [runtimeIndex, runtimeToken] of tokens.entries()) {
      const runtimeName = (
        runtimeToken.replace(/\\/g, "/").split("/").at(-1) ?? ""
      ).toLowerCase();
      if (!RUNTIME_EXECUTABLE_PATTERN.test(runtimeName)) continue;

      const runtimeArguments = tokens.slice(runtimeIndex + 1);
      const shellCommandPayloadIndexes = new Set<number>();
      if (SHELL_COMMAND_RUNTIMES.has(runtimeName)) {
        for (const [argumentIndex, argument] of runtimeArguments.entries()) {
          if (
            argument !== "--command" &&
            !/^-[A-Za-z]*c[A-Za-z]*$/.test(argument)
          )
            continue;
          const payloadIndex = runtimeArguments.findIndex(
            (candidate, candidateIndex) =>
              candidateIndex > argumentIndex &&
              candidate !== "--" &&
              !candidate.startsWith("-"),
          );
          if (payloadIndex === -1) continue;
          shellCommandPayloadIndexes.add(payloadIndex);
          candidates.push(
            ...extractRuntimeEntrypointCandidates(
              runtimeArguments[payloadIndex],
              depth + 1,
            ),
          );
        }
      }

      for (const [argumentIndex, argument] of runtimeArguments.entries()) {
        if (argument.startsWith("-")) continue;
        if (shellCommandPayloadIndexes.has(argumentIndex)) continue;
        if (
          (runtimeName === "bun" || runtimeName === "deno") &&
          argumentIndex === 0 &&
          argument === "run"
        )
          continue;
        candidates.push(argument);
      }
    }
  }

  return uniqueSorted(candidates);
}

function extractReferencedEntrypoints(
  projectRoot: string,
  source: string,
  baseDirectory = projectRoot,
): string[] {
  const matches = [
    ...(source.match(REFERENCED_ENTRYPOINT_PATTERN) ?? []),
    ...extractRuntimeEntrypointCandidates(source),
  ];
  const resolved = matches.flatMap((rawMatch) => {
    const candidate = rawMatch.replace(/\\/g, path.sep);
    if (candidate.includes("*")) return [];

    const possiblePaths =
      candidate === "~" || candidate.startsWith("~/")
        ? [resolveEvidencePath(candidate)]
        : path.isAbsolute(candidate)
          ? [candidate]
          : [
              path.resolve(projectRoot, candidate),
              path.resolve(baseDirectory, candidate),
            ];

    return possiblePaths.filter(
      (filePath) => fs.existsSync(filePath) && fs.statSync(filePath).isFile(),
    );
  });

  return uniqueSorted(resolved.map((filePath) => path.resolve(filePath)));
}

function inspectMonorepoAgentSkillPublishingEvidence(projectRoot: string): {
  blockers: string[];
  evidence: string[];
} {
  const skillsRoot = path.join(path.dirname(projectRoot), ".agents/skills");
  const evidence: string[] = [];
  const blockers: string[] = [];

  for (const filePath of listFiles(skillsRoot)) {
    if (path.basename(filePath) !== "SKILL.md") continue;
    const content = readReferencedEntrypoint(filePath);
    if (content === null) {
      evidence.push(normalizeCandidatePath(projectRoot, filePath));
      blockers.push(
        `${normalizeCandidatePath(projectRoot, filePath)}::unscannable-operational-file`,
      );
      continue;
    }
    const capabilities = detectPublishingCapabilities(content);
    if (capabilities.length === 0) continue;

    evidence.push(normalizeCandidatePath(projectRoot, filePath));
    evidence.push(
      ...capabilities.map((capability) =>
        publishingCapabilityToken(projectRoot, filePath, capability),
      ),
    );
  }

  return {
    blockers: uniqueSorted(blockers),
    evidence: uniqueSorted(evidence),
  };
}

function canContainExecutablePublishingCapability(
  projectRoot: string,
  filePath: string,
  content: string,
): boolean {
  const relativePath = toPosixPath(path.relative(projectRoot, filePath));
  const basename = path.basename(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const mode = fs.statSync(filePath).mode;

  return (
    OPERATIONAL_SOURCE_EXTENSIONS.has(extension) ||
    OPERATIONAL_NAME_PATTERN.test(basename) ||
    /^(?:Makefile|GNUmakefile|Dockerfile|Procfile)$/i.test(basename) ||
    relativePath.startsWith(".github/workflows/") ||
    (mode & 0o111) !== 0 ||
    content.startsWith("#!")
  );
}

function collectPublishingCandidates(projectRoot: string): string[] {
  const candidates: string[] = [];
  const semanticCandidates: string[] = [];
  const projectFileCapabilities = new Map<string, PublishingCapability[]>();
  const addIfExists = (filePath: string) => {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile())
      candidates.push(filePath);
  };

  const addOperationalCandidate = (filePath: string, content: string) => {
    const capabilities = canContainExecutablePublishingCapability(
      projectRoot,
      filePath,
      content,
    )
      ? detectPublishingCapabilities(content)
      : [];
    if (capabilities.length > 0) {
      projectFileCapabilities.set(
        normalizeCandidatePath(projectRoot, filePath),
        capabilities,
      );
    }
    if (
      OPERATIONAL_NAME_PATTERN.test(path.basename(filePath)) ||
      capabilities.length > 0
    )
      candidates.push(filePath);
    semanticCandidates.push(
      ...capabilities.map((capability) =>
        publishingCapabilityToken(projectRoot, filePath, capability),
      ),
    );
  };

  const inspectReferencedEntrypoints = (
    source: string,
    baseDirectory: string,
  ) => {
    const referencedPaths = extractReferencedEntrypoints(
      projectRoot,
      source,
      baseDirectory,
    );
    const capabilities: PublishingCapability[] = [];
    let hasUnscannableEntrypoint = false;

    for (const filePath of referencedPaths) {
      const content = readReferencedEntrypoint(filePath);
      if (content === null) {
        hasUnscannableEntrypoint = true;
        semanticCandidates.push(
          `${normalizeCandidatePath(projectRoot, filePath)}::unscannable-referenced-entrypoint`,
        );
        continue;
      }

      addOperationalCandidate(filePath, content);
      capabilities.push(...detectPublishingCapabilities(content));
    }

    return {
      capabilities: uniqueSorted(capabilities) as PublishingCapability[],
      hasUnscannableEntrypoint,
      referencedPaths,
    };
  };

  for (const filePath of listFiles(projectRoot)) {
    const content = readLikelyTextFile(filePath);
    if (content === null) {
      if (canContainExecutablePublishingCapability(projectRoot, filePath, "")) {
        semanticCandidates.push(
          `${normalizeCandidatePath(projectRoot, filePath)}::unscannable-operational-file`,
        );
      }
      continue;
    }
    addOperationalCandidate(filePath, content);
  }

  for (const filePath of listFiles(path.join(projectRoot, ".scratch")).filter(
    (candidate) => TEST_OR_SPEC_SOURCE_PATTERN.test(candidate),
  )) {
    const content = readLikelyTextFile(filePath);
    if (content === null) {
      semanticCandidates.push(
        `${normalizeCandidatePath(projectRoot, filePath)}::unscannable-operational-file`,
      );
      continue;
    }
    addOperationalCandidate(filePath, content);
  }

  for (const filePath of listFiles(
    path.join(projectRoot, ".github/workflows"),
  )) {
    candidates.push(filePath);
    const content = readReferencedEntrypoint(filePath);
    if (content === null) {
      semanticCandidates.push(
        `${normalizeCandidatePath(projectRoot, filePath)}::unscannable-operational-file`,
      );
      continue;
    }
    const workflowCommands = extractWorkflowRunCommands(content);
    if (workflowCommands.parseError) {
      semanticCandidates.push(
        `${normalizeCandidatePath(projectRoot, filePath)}::unparseable-workflow`,
      );
    }
    const executableSource = [content, ...workflowCommands.commands].join("\n");
    const referenced = inspectReferencedEntrypoints(
      executableSource,
      path.dirname(filePath),
    );
    const capabilities = uniqueSorted([
      ...detectPublishingCapabilities(executableSource),
      ...referenced.capabilities,
    ]) as PublishingCapability[];
    semanticCandidates.push(
      ...capabilities.map((capability) =>
        publishingCapabilityToken(projectRoot, filePath, capability),
      ),
    );
  }

  const packageJsonPath = path.join(projectRoot, "package.json");
  addIfExists(packageJsonPath);
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf8"),
    ) as { scripts?: Record<string, string> };
    for (const [name, command] of Object.entries(
      packageJson.scripts ?? {},
    ).sort(([left], [right]) => compareCodePoints(left, right))) {
      const referenced = inspectReferencedEntrypoints(command, projectRoot);
      const previouslyDiscoveredCapabilities = [
        ...projectFileCapabilities.entries(),
      ]
        .filter(([relativePath]) => command.includes(relativePath))
        .flatMap(([, capabilities]) => capabilities);
      const referencedCapabilities = uniqueSorted([
        ...referenced.capabilities,
        ...previouslyDiscoveredCapabilities,
      ]) as PublishingCapability[];
      const capabilities = uniqueSorted([
        ...detectPublishingCapabilities(command),
        ...referencedCapabilities,
      ]) as PublishingCapability[];
      if (
        OPERATIONAL_NAME_PATTERN.test(name) ||
        OPERATIONAL_NAME_PATTERN.test(command) ||
        referenced.hasUnscannableEntrypoint ||
        capabilities.length > 0
      ) {
        semanticCandidates.push(`package.json::scripts.${name}`);
      }
      semanticCandidates.push(
        ...capabilities.map(
          (capability) =>
            `package.json::scripts.${name}::capability.${capability}`,
        ),
      );
      semanticCandidates.push(
        ...referencedCapabilities.map(
          (capability) => `package.json::capability.${capability}`,
        ),
      );
    }
  }
  addIfExists(path.join(projectRoot, "vercel.json"));
  addIfExists(path.join(projectRoot, "CLAUDE.md"));
  addIfExists(path.join(projectRoot, "scripts/README.md"));
  addIfExists(path.join(projectRoot, SCHEDULER_SNAPSHOT_PATH));
  addIfExists(
    path.join(
      projectRoot,
      "docs/superpowers/plans/2026-05-01-WAG-SEO-文章自动流水线实施计划.md",
    ),
  );
  addIfExists(
    path.join(
      projectRoot,
      "docs/superpowers/specs/2026-05-01-WAG-SEO-文章自动流水线设计.md",
    ),
  );

  const monorepoRoot = path.dirname(projectRoot);
  const monorepoAgentSkillInspection =
    inspectMonorepoAgentSkillPublishingEvidence(projectRoot);
  semanticCandidates.push(
    ...monorepoAgentSkillInspection.evidence,
    ...monorepoAgentSkillInspection.blockers,
  );
  addIfExists(
    path.join(monorepoRoot, "productivity/WAG-Content-Automation-SOP.md"),
  );
  const dailyReportPath = path.join(
    monorepoRoot,
    "productivity/daily-analytics/daily_report.py",
  );
  addIfExists(dailyReportPath);
  if (fs.existsSync(dailyReportPath)) {
    const capabilities = detectPublishingCapabilities(
      fs.readFileSync(dailyReportPath, "utf8"),
    );
    semanticCandidates.push(
      ...capabilities.map((capability) =>
        publishingCapabilityToken(projectRoot, dailyReportPath, capability),
      ),
    );
  }
  addIfExists(
    path.join(monorepoRoot, "productivity/growth-dashboard/COORDINATION.md"),
  );
  const dashboardDeployPath = path.join(
    monorepoRoot,
    "productivity/growth-dashboard/deploy-cloudflare.sh",
  );
  addIfExists(dashboardDeployPath);
  if (fs.existsSync(dashboardDeployPath)) {
    const capabilities = detectPublishingCapabilities(
      fs.readFileSync(dashboardDeployPath, "utf8"),
    );
    semanticCandidates.push(
      ...capabilities.map((capability) =>
        publishingCapabilityToken(projectRoot, dashboardDeployPath, capability),
      ),
    );
  }
  addIfExists(
    path.join(monorepoRoot, "productivity/growth-dashboard/make-deploy.sh"),
  );
  for (const filePath of listFiles(
    path.join(monorepoRoot, "productivity/seo-purge"),
  )) {
    if (/\.(?:py|sh)$/.test(filePath)) {
      candidates.push(filePath);
      const capabilities = detectPublishingCapabilities(
        fs.readFileSync(filePath, "utf8"),
      );
      semanticCandidates.push(
        ...capabilities.map((capability) =>
          publishingCapabilityToken(projectRoot, filePath, capability),
        ),
      );
    }
  }

  for (const definition of Object.values(SCHEDULED_TASK_DEFINITIONS)) {
    const definitionPath = resolveEvidencePath(definition);
    addIfExists(definitionPath);
    if (fs.existsSync(definitionPath)) {
      const content = fs.readFileSync(definitionPath, "utf8");
      const referenced = inspectReferencedEntrypoints(
        content,
        path.dirname(definitionPath),
      );
      const capabilities = uniqueSorted([
        ...detectPublishingCapabilities(content),
        ...referenced.capabilities,
      ]) as PublishingCapability[];
      semanticCandidates.push(
        ...capabilities.map((capability) =>
          publishingCapabilityToken(projectRoot, definitionPath, capability),
        ),
      );
    }
  }

  const schedulerSnapshotPath = path.join(projectRoot, SCHEDULER_SNAPSHOT_PATH);
  if (fs.existsSync(schedulerSnapshotPath)) {
    const snapshot = parse(
      fs.readFileSync(schedulerSnapshotPath, "utf8"),
    ) as ScheduledTaskSnapshot;
    const actualIds = new Set(
      (snapshot.scheduledTasks ?? []).map((task) => task.id),
    );
    semanticCandidates.push(...[...actualIds].map(schedulerTaskToken));
    semanticCandidates.push(
      ...SCHEDULED_TASK_IDS.filter((id) => !actualIds.has(id)).map(
        (id) => `scheduler::missing::${id}`,
      ),
    );
  }

  return uniqueSorted([
    ...candidates.map((candidate) =>
      normalizeCandidatePath(projectRoot, candidate),
    ),
    ...semanticCandidates,
  ]);
}

export function findUnclassifiedPublishingCandidates(
  projectRoot: string,
): string[] {
  const { paths } = buildPublishingPaths(projectRoot);
  const classified = new Set(
    paths.flatMap((publishingPath) => publishingPath.evidenceFiles),
  );
  return collectPublishingCandidates(projectRoot).filter(
    (candidate) => !classified.has(candidate),
  );
}

export function assertPublishingSafety(
  audit: SeoBaselineAudit,
  projectRoot: string,
): void {
  const blockers = [
    ...verifySchedulerSnapshotStructure(projectRoot),
    ...audit.findings.unclassifiedPublishingCandidates.map(
      (candidate) =>
        `Unclassified publishing capability or path: ${candidate}.`,
    ),
  ];

  for (const publishingPath of audit.publishingPaths) {
    if (
      publishingPath.productionTarget === "frontend" &&
      publishingPath.classification === "unattended" &&
      publishingPath.canPublishProduction
    ) {
      blockers.push(
        `Unattended frontend production publication path remains capable of publishing: ${publishingPath.id}.`,
      );
    }
    if (
      publishingPath.productionTarget === "frontend" &&
      publishingPath.classification === "gated" &&
      publishingPath.initiatesPublication &&
      (publishingPath.approvalEnforcement !== "technical" ||
        publishingPath.technicalControl.state !== "enforced")
    ) {
      blockers.push(
        `Frontend publication path lacks a technical approval or hard-block control: ${publishingPath.id}.`,
      );
    }
  }

  if (blockers.length > 0) {
    throw new Error(
      `SEO publishing safety audit failed:\n${uniqueSorted(blockers)
        .map((blocker) => `- ${blocker}`)
        .join("\n")}`,
    );
  }
}

export function assertSeoReleaseSafety(
  audit: SeoBaselineAudit,
  projectRoot: string,
  options: SchedulerReleaseSafetyOptions = {},
): void {
  assertPublishingSafety(audit, projectRoot);
  const blockers = verifySchedulerSnapshotReleaseSafety(projectRoot, options);

  if (blockers.length > 0) {
    throw new Error(
      `SEO release-safety audit failed:\n${blockers.map((blocker) => `- ${blocker}`).join("\n")}`,
    );
  }
}

function extractArrayStringValues(
  source: string,
  variableName: string,
): string[] {
  const escapedName = variableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const arrayMatch = source.match(
    new RegExp(`const\\s+${escapedName}\\s*=\\s*\\[([\\s\\S]*?)\\]`),
  );
  if (!arrayMatch) return [];
  return [...arrayMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(
    (match) => match[1],
  );
}

function extractLiveNavHrefs(source: string): string[] {
  return uniqueSorted(
    [...source.matchAll(/href:\s*['"]([^'"]+)['"],\s*live:\s*true/g)].map(
      (match) => match[1],
    ),
  );
}

function collectDiscoveryInventory(
  projectRoot: string,
  articles: ArticleInventoryItem[],
): DiscoveryInventory {
  const blogDirectory = path.join(projectRoot, "content/blog");
  const listingSourcePath = path.join(
    projectRoot,
    "app/(public)/article/page.tsx",
  );
  const listingSource = fs.existsSync(listingSourcePath)
    ? fs.readFileSync(listingSourcePath, "utf8")
    : "";
  const slugsByImpressions = extractArrayStringValues(
    listingSource,
    "SLUGS_BY_IMPRESSIONS",
  );
  const impressionOrder = new Map(
    slugsByImpressions.map((slug, index) => [slug, index]),
  );
  const articleListingRoutes = fs.existsSync(blogDirectory)
    ? fs
        .readdirSync(blogDirectory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
        .map((entry) => {
          const slug = entry.name.replace(/\.mdx$/, "");
          const raw = fs.readFileSync(
            path.join(blogDirectory, entry.name),
            "utf8",
          );
          const { data } = matter(raw);
          return { slug, date: String(data.date ?? "") };
        })
        .sort((left, right) => {
          const leftIndex = impressionOrder.get(left.slug);
          const rightIndex = impressionOrder.get(right.slug);
          if (leftIndex !== undefined && rightIndex !== undefined)
            return leftIndex - rightIndex;
          if (leftIndex !== undefined) return -1;
          if (rightIndex !== undefined) return 1;
          const leftDate = new Date(left.date).getTime();
          const rightDate = new Date(right.date).getTime();
          return Number.isNaN(leftDate) ? 0 : leftDate - rightDate;
        })
        .map((article) => `/article/${article.slug}`)
    : [];

  const articleUtilsPath = path.join(
    projectRoot,
    "app/(public)/article/[slug]/article-utils.ts",
  );
  const articleUtilsSource = fs.existsSync(articleUtilsPath)
    ? fs.readFileSync(articleUtilsPath, "utf8")
    : "";
  const blockedSlugs = new Set(
    extractArrayStringValues(articleUtilsSource, "BLOCKED_SLUGS"),
  );
  const runtimeArticleSlugs = scanMdxFilesInRuntimeOrder(blogDirectory).map(
    (filePath) =>
      toPosixPath(path.relative(blogDirectory, filePath)).replace(/\.mdx$/, ""),
  );
  const articleDetailRoutes = runtimeArticleSlugs
    .filter((slug) => !blockedSlugs.has(slug))
    .map((slug) => `/article/${slug}`);
  const sitemapArticleRoutes = runtimeArticleSlugs
    .filter((slug) => !BLOG_GONE_SLUGS.includes(slug))
    .map((slug) => `/article/${slug}`);

  const navSourcePath = path.join(projectRoot, "app/data/nav-links.ts");
  const navSource = fs.existsSync(navSourcePath)
    ? fs.readFileSync(navSourcePath, "utf8")
    : "";
  const liveNavHrefs = extractLiveNavHrefs(navSource);
  const byServiceBlock =
    navSource.match(
      /heading:\s*['"]nav\.menu\.byService['"][\s\S]*?links:\s*\[([\s\S]*?)\]\s*,\s*\}/,
    )?.[1] ?? "";
  const serviceRoots = uniqueSorted(
    [
      ...byServiceBlock.matchAll(/href:\s*['"]([^'"]+)['"],\s*live:\s*true/g),
    ].map((match) => match[1]),
  );

  const sitemapStaticRoutes = [
    "/",
    "/services",
    ...liveNavHrefs.filter((href) => href !== "/services"),
    "/about",
    "/article",
    "/enquiry",
    "/solutions",
    "/article/faq",
    "/privacy",
    "/terms",
  ];
  const globalArticleEntryPoints = [
    "app/components/Navbar.tsx",
    "app/components/Footer.tsx",
  ].flatMap((relativePath) => {
    const filePath = path.join(projectRoot, relativePath);
    if (!fs.existsSync(filePath)) return [];
    const source = fs.readFileSync(filePath, "utf8");
    return /(?:href|to)=['"]\/article['"]/.test(source) ? ["/article"] : [];
  });

  const recommendationEdges: RecommendationEdge[] = [];
  for (let index = 0; index < articleDetailRoutes.length - 1; index += 1) {
    const currentRoute = articleDetailRoutes[index];
    const nextRoute = articleDetailRoutes[index + 1];
    recommendationEdges.push({
      mechanism: "article-prev-next",
      sourceRoute: currentRoute,
      targetRoute: nextRoute,
      relationshipCount: 1,
      source:
        "app/(public)/article/[slug]/article-utils.ts::getPrevNextArticles",
    });
    recommendationEdges.push({
      mechanism: "article-prev-next",
      sourceRoute: nextRoute,
      targetRoute: currentRoute,
      relationshipCount: 1,
      source:
        "app/(public)/article/[slug]/article-utils.ts::getPrevNextArticles",
    });
  }

  const blogPreviewPath = path.join(
    projectRoot,
    "app/components/BlogPreview.tsx",
  );
  const blogPreviewSource = fs.existsSync(blogPreviewPath)
    ? fs.readFileSync(blogPreviewPath, "utf8")
    : "";
  const liveSlugs = new Set(articles.map((article) => article.slug));
  const homepageSlugs = extractArrayStringValues(blogPreviewSource, "TOP_SLUGS")
    .filter((slug) => liveSlugs.has(slug))
    .slice(0, 2);
  for (const slug of homepageSlugs) {
    recommendationEdges.push({
      mechanism: "homepage-top-articles",
      sourceRoute: "/",
      targetRoute: `/article/${slug}`,
      relationshipCount: 1,
      source: "app/components/BlogPreview.tsx::TOP_SLUGS and getTopArticles(2)",
    });
  }

  const linkGraphPath = path.join(projectRoot, "data/link-graph.json");
  if (fs.existsSync(linkGraphPath)) {
    const graph = JSON.parse(fs.readFileSync(linkGraphPath, "utf8")) as {
      factory_to_articles?: Record<string, Array<{ slug?: string }>>;
    };
    const targetCounts = new Map<string, number>();
    for (const links of Object.values(graph.factory_to_articles ?? {})) {
      for (const link of links) {
        if (!link.slug || !liveSlugs.has(link.slug)) continue;
        targetCounts.set(link.slug, (targetCounts.get(link.slug) ?? 0) + 1);
      }
    }
    for (const [slug, relationshipCount] of [...targetCounts.entries()].sort(
      ([left], [right]) => compareCodePoints(left, right),
    )) {
      recommendationEdges.push({
        mechanism: "factory-link-graph",
        sourceRoute: "/factory/*",
        targetRoute: `/article/${slug}`,
        relationshipCount,
        source: "data/link-graph.json::factory_to_articles",
      });
    }
  }

  recommendationEdges.sort((left, right) =>
    compareCodePoints(
      `${left.mechanism}\u0000${left.sourceRoute}\u0000${left.targetRoute}`,
      `${right.mechanism}\u0000${right.sourceRoute}\u0000${right.targetRoute}`,
    ),
  );

  return {
    articleListingRoutes,
    articleDetailRoutes,
    sitemapArticleRoutes,
    sitemapRoutes: [
      ...new Set([...sitemapStaticRoutes, ...sitemapArticleRoutes]),
    ],
    serviceRoots,
    globalArticleEntryPoints: uniqueSorted(globalArticleEntryPoints),
    recommendationEdges,
    dashboardSources: [
      "../productivity/daily-analytics/reports/2026-07-14.md",
      "../productivity/growth-dashboard/seo-data.js",
      "../productivity/growth-dashboard/todo-data.js",
    ],
  };
}

function collectFindings(
  projectRoot: string,
  articles: ArticleInventoryItem[],
  legacyClusters: LegacyClusterInventory[],
  discoveryInventory: DiscoveryInventory,
  unclassifiedPublishingCandidates: string[],
): SeoBaselineAudit["findings"] {
  const references = legacyClusters.flatMap((cluster) => cluster.references);
  const articleRoutes = articles
    .map((article) => article.route)
    .sort(compareCodePoints);
  const nonBlankSlugs = references.flatMap((reference) =>
    reference.slug ? [reference.slug] : [],
  );
  const counts = new Map<string, number>();
  for (const slug of nonBlankSlugs)
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  const referencedSlugs = new Set(nonBlankSlugs);

  return {
    missingPublishedLegacySlugs: [
      ...new Set(
        references
          .filter(
            (reference) =>
              reference.declaredStatus === "published" &&
              reference.inventoryStatus === "missing",
          )
          .flatMap((reference) => (reference.slug ? [reference.slug] : [])),
      ),
    ].sort(compareCodePoints),
    retiredLegacySlugs: [
      ...new Set(
        references
          .filter((reference) => reference.inventoryStatus === "gone-410")
          .flatMap((reference) => (reference.slug ? [reference.slug] : [])),
      ),
    ].sort(compareCodePoints),
    missingLegacySlugs: [
      ...new Set(
        references
          .filter((reference) => reference.inventoryStatus === "missing")
          .flatMap((reference) => (reference.slug ? [reference.slug] : [])),
      ),
    ].sort(compareCodePoints),
    duplicateLegacySlugs: [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([slug]) => slug)
      .sort(compareCodePoints),
    articlesAbsentFromLegacyClusters: articles
      .map((article) => article.slug)
      .filter((slug) => !referencedSlugs.has(slug))
      .sort(compareCodePoints),
    articlesMissingFrontmatterSlug: articles
      .filter((article) => !article.frontmatterSlug)
      .map((article) => article.slug)
      .sort(compareCodePoints),
    plannedLegacyPlaceholders: references.filter(
      (reference) => reference.inventoryStatus === "planned-placeholder",
    ).length,
    articleRoutesMissingFromListing: articleRoutes.filter(
      (route) => !discoveryInventory.articleListingRoutes.includes(route),
    ),
    articleRoutesMissingFromDetail: articleRoutes.filter(
      (route) => !discoveryInventory.articleDetailRoutes.includes(route),
    ),
    articleRoutesMissingFromSitemap: articleRoutes.filter(
      (route) => !discoveryInventory.sitemapArticleRoutes.includes(route),
    ),
    duplicateCanonicals: [
      ...articles
        .reduce<Map<string, string[]>>((groups, article) => {
          groups.set(article.canonical, [
            ...(groups.get(article.canonical) ?? []),
            article.route,
          ]);
          return groups;
        }, new Map())
        .entries(),
    ]
      .filter(([, routes]) => routes.length > 1)
      .map(
        ([canonical, routes]) =>
          `${canonical} => ${routes.sort(compareCodePoints).join(", ")}`,
      )
      .sort(compareCodePoints),
    staleArticleLinks: uniqueSorted(
      articles
        .flatMap((article) => article.internalLinks)
        .map((link) => link.split(/[?#]/, 1)[0].replace(/\/$/, ""))
        .filter(
          (link) =>
            link.startsWith("/article/") &&
            link !== "/article/faq" &&
            !articleRoutes.includes(link),
        ),
    ),
    articlesWithoutBodyInboundLinks: articleRoutes.filter(
      (route) =>
        !articles.some((article) =>
          article.internalLinks
            .map((link) => link.split(/[?#]/, 1)[0].replace(/\/$/, ""))
            .includes(route),
        ),
    ),
    configuredRecommendationTargetsMissing: (() => {
      const blogPreviewPath = path.join(
        projectRoot,
        "app/components/BlogPreview.tsx",
      );
      const source = fs.existsSync(blogPreviewPath)
        ? fs.readFileSync(blogPreviewPath, "utf8")
        : "";
      const liveSlugs = new Set(articles.map((article) => article.slug));
      return extractArrayStringValues(source, "TOP_SLUGS")
        .filter((slug) => !liveSlugs.has(slug))
        .map((slug) => `/article/${slug}`)
        .sort(compareCodePoints);
    })(),
    unclassifiedPublishingCandidates,
  };
}

export function buildSeoBaselineAudit(projectRoot: string): SeoBaselineAudit {
  const articles = collectArticles(projectRoot);
  const legacyClusters = collectLegacyClusters(projectRoot, articles);
  const discoveryInventory = collectDiscoveryInventory(projectRoot, articles);
  const publishing = buildPublishingPaths(projectRoot);
  const unclassifiedPublishingCandidates =
    findUnclassifiedPublishingCandidates(projectRoot);

  return {
    auditDate: AUDIT_DATE,
    articles,
    legacyClusters,
    discoverySurfaces: DISCOVERY_SURFACES,
    discoveryInventory,
    measurements: MEASUREMENTS,
    publishingPaths: publishing.paths,
    findings: collectFindings(
      projectRoot,
      articles,
      legacyClusters,
      discoveryInventory,
      unclassifiedPublishingCandidates,
    ),
    schedulerEvidence: publishing.schedulerEvidence,
  };
}

export function renderArticleInventoryYaml(audit: SeoBaselineAudit): string {
  return stringify(
    {
      auditDate: audit.auditDate,
      baseUrl: BASE_URL,
      articleCount: audit.articles.length,
      legacyClusterSourceCount: audit.legacyClusters.length,
      articles: audit.articles,
      legacyClusters: audit.legacyClusters,
      discoverySurfaces: audit.discoverySurfaces,
      discoveryInventory: audit.discoveryInventory,
      measurements: audit.measurements,
      publishingPaths: audit.publishingPaths,
      findings: audit.findings,
      schedulerEvidence: audit.schedulerEvidence,
    },
    {
      lineWidth: 0,
    },
  );
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function renderList(items: string[]): string {
  return items.length > 0
    ? items.map((item) => `- \`${item}\``).join("\n")
    : "- None";
}

export function renderBaselineMarkdown(audit: SeoBaselineAudit): string {
  const articleRows = audit.articles
    .map((article) =>
      [
        `\`${article.slug}\``,
        escapeTableCell(article.title),
        article.publishedDate || "Missing",
        escapeTableCell(article.category),
        article.indexable ? "Yes" : "No",
        article.frontmatterSlug ? "Present" : "Missing",
        String(article.internalLinks.length),
      ].join(" | "),
    )
    .join("\n");

  const clusterRows = audit.legacyClusters
    .map((cluster) => {
      const live = cluster.references.filter(
        (reference) => reference.inventoryStatus === "live",
      ).length;
      const gone = cluster.references.filter(
        (reference) => reference.inventoryStatus === "gone-410",
      ).length;
      const missing = cluster.references.filter(
        (reference) => reference.inventoryStatus === "missing",
      ).length;
      const planned = cluster.references.filter(
        (reference) => reference.inventoryStatus === "planned-placeholder",
      ).length;
      return `\`${cluster.path}\` | ${cluster.references.length} | ${live} | ${gone} | ${missing} | ${planned}`;
    })
    .join("\n");

  const legacyReferenceRows = audit.legacyClusters
    .flatMap((cluster) =>
      cluster.references.map((reference) =>
        [
          `\`${cluster.path}\``,
          reference.role,
          reference.type,
          reference.slug ? `\`${reference.slug}\`` : "(blank)",
          reference.declaredStatus,
          reference.inventoryStatus,
        ].join(" | "),
      ),
    )
    .join("\n");

  const discoveryRows = audit.discoverySurfaces
    .map((surface) =>
      [
        surface.id,
        `\`${surface.source}\``,
        escapeTableCell(surface.behavior),
        escapeTableCell(surface.limitations),
      ].join(" | "),
    )
    .join("\n");

  const discoveryCoverageRows = [
    {
      surface: "Article listing",
      routes: audit.discoveryInventory.articleListingRoutes,
      missing: audit.findings.articleRoutesMissingFromListing,
    },
    {
      surface: "Article detail",
      routes: audit.discoveryInventory.articleDetailRoutes,
      missing: audit.findings.articleRoutesMissingFromDetail,
    },
    {
      surface: "Sitemap articles",
      routes: audit.discoveryInventory.sitemapArticleRoutes,
      missing: audit.findings.articleRoutesMissingFromSitemap,
    },
  ]
    .map((item) =>
      [
        item.surface,
        String(item.routes.length),
        item.missing.length === 0
          ? "None"
          : item.missing.map((route) => `\`${route}\``).join(", "),
      ].join(" | "),
    )
    .join("\n");

  const recommendationRows = audit.discoveryInventory.recommendationEdges
    .map((edge) =>
      [
        edge.mechanism,
        `\`${edge.sourceRoute}\``,
        `\`${edge.targetRoute}\``,
        String(edge.relationshipCount),
        `\`${edge.source}\``,
      ].join(" | "),
    )
    .join("\n");

  const measurementRows = audit.measurements
    .map((measurement) =>
      [
        measurement.id.toUpperCase(),
        measurement.asOf,
        measurement.availability,
        escapeTableCell(measurement.baseline),
        escapeTableCell(measurement.limitations),
      ].join(" | "),
    )
    .join("\n");

  const publishingRows = audit.publishingPaths
    .map((publishingPath) =>
      [
        publishingPath.id,
        publishingPath.kind,
        publishingPath.classification,
        publishingPath.observedState,
        publishingPath.productionTarget,
        publishingPath.approvalEnforcement,
        publishingPath.initiatesPublication ? "Yes" : "No",
        publishingPath.canPublishProduction ? "Yes" : "No",
        `${publishingPath.technicalControl.state}: ${publishingPath.technicalControl.mechanism}`,
        publishingPath.evidenceFiles.map((file) => `\`${file}\``).join(", ") ||
          "None",
        escapeTableCell(publishingPath.hardBlocker),
      ].join(" | "),
    )
    .join("\n");

  const enabledUnattendedFrontendDeploys = audit.publishingPaths.filter(
    (item) =>
      item.classification === "unattended" &&
      item.observedState === "enabled" &&
      item.productionTarget === "frontend" &&
      item.canPublishProduction,
  ).length;

  const unguardedNotificationPaths = audit.publishingPaths.filter(
    (item) =>
      item.kind === "notification" &&
      item.observedState === "enabled" &&
      item.approvalEnforcement === "none",
  ).length;

  const enabledUnattendedDashboardDeploys = audit.publishingPaths.filter(
    (item) =>
      item.classification === "unattended" &&
      item.observedState === "enabled" &&
      item.productionTarget === "dashboard" &&
      item.canPublishProduction,
  ).length;

  const manualFrontendProductionPaths = audit.publishingPaths.filter(
    (item) =>
      item.classification === "manual" &&
      item.observedState === "enabled" &&
      item.productionTarget === "frontend" &&
      item.canPublishProduction,
  ).length;

  return `# SEO Baseline and Publishing Safety Audit

**Audit date:** ${audit.auditDate}
**Scope:** Winning Adventure Global frontend article corpus, legacy SEO cluster files, discovery surfaces, measurement availability, and local publication paths.

This document is generated from repository state. Re-run \`npm run seo:baseline:check\` to verify it, or use \`npm run seo:baseline:write\` only when intentionally refreshing the checked-in baseline. Neither command queries live analytics nor deploys anything.

## Baseline Summary

- Live MDX articles accounted for: **${audit.articles.length}**
- Legacy cluster YAML sources accounted for: **${audit.legacyClusters.length}**
- Enabled unattended frontend production deploys: **${enabledUnattendedFrontendDeploys}**
- Enabled unattended dashboard deploy paths: **${enabledUnattendedDashboardDeploys}**
- Enabled manual frontend production paths: **${manualFrontendProductionPaths}**
- Enabled notification paths without a technical approval gate: **${unguardedNotificationPaths}**
- Production publication chain: \`git push origin master\` can update GitHub but cannot deploy because \`vercel.json\` sets \`git.deploymentEnabled=false\`. The remaining frontend production escape hatch is the explicit, authenticated, manual \`vercel --prod\` command.

## Article Inventory

The filesystem-derived slug is the live routing source. Canonicals in the YAML inventory are either explicit frontmatter values or deterministic \`${BASE_URL}/article/{slug}\` derivations.

Slug | Title | Date | Category | Indexable | Frontmatter slug | Internal links
--- | --- | --- | --- | --- | --- | ---
${articleRows}

## Legacy Cluster Sources

Source | References including pillar | Live | Retired 410 | Missing | Planned blanks
--- | ---: | ---: | ---: | ---: | ---:
${clusterRows}

Source | Role | Type | Slug | Declared status | Inventory status
--- | --- | --- | --- | --- | ---
${legacyReferenceRows}

### Drift Findings

**Published legacy slugs missing from the live corpus**

${renderList(audit.findings.missingPublishedLegacySlugs)}

**Legacy slugs intentionally retired with 410 responses**

${renderList(audit.findings.retiredLegacySlugs)}

**Legacy slugs missing without a recorded 410 retirement**

${renderList(audit.findings.missingLegacySlugs)}

**Legacy slugs referenced more than once**

${renderList(audit.findings.duplicateLegacySlugs)}

**Live articles absent from all four legacy cluster files**

${renderList(audit.findings.articlesAbsentFromLegacyClusters)}

**Live articles missing a frontmatter slug**

${renderList(audit.findings.articlesMissingFrontmatterSlug)}

- Planned blank legacy entries: **${audit.findings.plannedLegacyPlaceholders}**
- No production content or routing change is made by this audit; later migration tickets resolve the drift.

## Discovery Surfaces

Surface | Source | Current behavior | Limitation
--- | --- | --- | ---
${discoveryRows}

### Structured Discovery Inventory

- Service roots: ${audit.discoveryInventory.serviceRoots.map((route) => `\`${route}\``).join(", ")}
- Global article entry points: ${audit.discoveryInventory.globalArticleEntryPoints.map((route) => `\`${route}\``).join(", ")}
- Sitemap routes: **${audit.discoveryInventory.sitemapRoutes.length}** total, including **${audit.discoveryInventory.sitemapArticleRoutes.length}** article routes
- Dashboard evidence sources: ${audit.discoveryInventory.dashboardSources.map((source) => `\`${source}\``).join(", ")}

Surface | Discovered article routes | Missing live routes
--- | ---: | ---
${discoveryCoverageRows}

Mechanism | Source route | Target route | Relationships | Evidence
--- | --- | --- | ---: | ---
${recommendationRows}

### Discovery Findings

**Duplicate canonicals**

${renderList(audit.findings.duplicateCanonicals)}

**Stale article links**

${renderList(audit.findings.staleArticleLinks)}

**Articles without body-level inbound links**

${renderList(audit.findings.articlesWithoutBodyInboundLinks)}

**Configured recommendation targets missing from the live corpus**

${renderList(audit.findings.configuredRecommendationTargetsMissing)}

## Measurement Availability

Measurement | As of | Availability | Baseline | Limitations
--- | --- | --- | --- | ---
${measurementRows}

## Publishing Safety Classification

Path | Kind | Invocation | Observed state | Target | Approval enforcement | Initiates publication | Can publish production | Technical control | Evidence files | Hard blocker, boundary, or unresolved gap
--- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---
${publishingRows}

\`manual\`, \`gated\`, and \`unattended\` describe invocation mode, not proof of approval enforcement. Vercel Git deployments are technically disabled, so no enabled unattended path can publish frontend SEO content. \`vercel --prod\` remains a manual operator escape hatch and must only run after a separate release approval. Notification success must never be reported as crawl or indexation success.

**Unclassified publishing candidates**

${renderList(audit.findings.unclassifiedPublishingCandidates)}

### Scope Boundary

- Included: repository content generators, documented schedulers, frontend and dashboard deployment paths, search-engine notification scripts/routes, and indexation tracking helpers.
- Excluded: enquiry, contact, and newsletter delivery emails because they are operational user communications, not SEO content generation, deployment, or indexation paths.
- Excluded: social and Medium publishing scaffolds because no active repository implementation that publishes website SEO content was observed. Any future implementation must enter this inventory before activation.

### Scheduler Evidence

${audit.schedulerEvidence.map((item) => `- ${item}`).join("\n")}

## Operational Guardrails

1. Content approval and release approval remain separate decisions.
2. The baseline audit never runs \`daily_report.py\`, Indexing API scripts, IndexNow, \`git push\`, Vercel deployment, or Cloudflare deployment.
3. The old 2026-05 unattended publishing design and plan are superseded and must not be executed.
4. \`vercel --prod\` is a production mutation, not a local validation command. Use \`vercel build --prod\` for local Vercel validation.
5. The current inventory is deterministic: sorted filesystem paths, fixed source lists, and a fixed audit date produce byte-identical artifacts while repository inputs remain unchanged.
6. Live GSC, GA4, enquiry attribution, indexation, and GEO refreshes require later human-gated tickets; this baseline records only dated evidence already stored locally.
`;
}
