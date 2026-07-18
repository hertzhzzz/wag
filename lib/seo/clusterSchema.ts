import { z } from "zod";

/**
 * Canonical cluster identity, display, ordering, commercial route, and service
 * bindings. Every derived cluster key and registry assertion comes from this
 * single source so later generators cannot silently remap an identity.
 */
export const CANONICAL_CLUSTER_DEFINITIONS = deepFreeze([
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
] as const);

export type CanonicalClusterDefinition =
  (typeof CANONICAL_CLUSTER_DEFINITIONS)[number];
export type ClusterId = CanonicalClusterDefinition["id"];

export const CANONICAL_CLUSTER_IDS = Object.freeze(
  CANONICAL_CLUSTER_DEFINITIONS.map(({ id }) => id),
) as unknown as readonly [ClusterId, ...ClusterId[]];

/**
 * Canonical domain vocabulary shared by cluster configuration and article
 * frontmatter. This module is intentionally dependency-free beyond Zod so it
 * can remain the lowest-level SEO Growth System schema boundary.
 */
export const CONTENT_ROLES = [
  "pillar",
  "supporting",
  "evidence",
  "comparison",
] as const;

export const FUNNEL_STAGES = [
  "problem-aware",
  "solution-aware",
  "evaluation",
  "decision",
  "post-purchase",
] as const;

/** Kept stable for article frontmatter compatibility. */
export const TARGET_MARKETS = ["AU", "NZ", "AU-NZ", "global"] as const;

/** Cluster scope is atomic; composite article markets are evaluated by helper. */
export const CLUSTER_TARGET_MARKETS = ["AU", "NZ", "global"] as const;

export const clusterIdSchema = z.enum(CANONICAL_CLUSTER_IDS);
export const contentRoleSchema = z.enum(CONTENT_ROLES);
export const funnelStageSchema = z.enum(FUNNEL_STAGES);
export const targetMarketSchema = z.enum(TARGET_MARKETS);
export const clusterTargetMarketSchema = z.enum(CLUSTER_TARGET_MARKETS, {
  error: `Expected an atomic cluster target market: ${CLUSTER_TARGET_MARKETS.join(", ")}.`,
});

export type TargetMarket = z.infer<typeof targetMarketSchema>;
export type ClusterTargetMarket = z.infer<typeof clusterTargetMarketSchema>;

const nonEmptyString = z.string().trim().min(1);
const machineReadableId = z
  .string()
  .trim()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Expected a lowercase machine-readable ID using letters, numbers, and single hyphens.",
  );

const internalAbsoluteRouteSchema = z
  .string()
  .trim()
  .regex(
    /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
    'Expected an internal absolute route such as "/supplier-verification" with lowercase path segments and no trailing slash, query, or fragment.',
  );

const editorialArticleRouteSchema = z
  .string()
  .trim()
  .regex(
    /^\/article\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Expected an editorial article route such as "/article/supplier-verification-guide" with one lowercase slug and no trailing slash, query, or fragment.',
  );

const commercialServiceSchema = z
  .object({
    id: machineReadableId,
    label: nonEmptyString,
  })
  .strict();

const resolvedEditorialPillarSchema = z
  .object({
    status: z.literal("resolved"),
    root: editorialArticleRouteSchema,
  })
  .strict();

const migrationPendingEditorialPillarSchema = z
  .object({
    status: z.literal("migration-pending"),
    root: z.null(),
    migrationId: machineReadableId,
    reason: nonEmptyString,
  })
  .strict();

const editorialPillarSchema = z.discriminatedUnion("status", [
  resolvedEditorialPillarSchema,
  migrationPendingEditorialPillarSchema,
]);

type DeepReadonly<T> = T extends object
  ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
  : T;

function deepFreeze<T>(value: T): DeepReadonly<T>;
function deepFreeze(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }

  for (const nestedValue of Object.values(value)) {
    deepFreeze(nestedValue);
  }

  return Object.freeze(value);
}

function dedupeValues<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function sortByCanonicalOrder<T extends string>(
  values: readonly T[],
  canonicalOrder: readonly T[],
): T[] {
  const order = new Map(canonicalOrder.map((value, index) => [value, index]));

  return [...values].sort(
    (left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0),
  );
}

function compareMachineIds(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

const clusterTargetMarketsSchema = z
  .array(clusterTargetMarketSchema)
  .min(1)
  .transform(dedupeValues)
  .superRefine((values, context) => {
    const globalIndex = values.indexOf("global");
    if (globalIndex !== -1 && values.length !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [globalIndex],
        message:
          '"global" targetMarkets scope is exclusive; use exactly ["global"], ' +
          'or remove "global" and declare only "AU", "NZ", or both.',
      });
    }
  })
  .transform((values) => sortByCanonicalOrder(values, CLUSTER_TARGET_MARKETS));

const funnelStagesSchema = z
  .array(funnelStageSchema)
  .min(1)
  .transform(dedupeValues)
  .transform((values) => sortByCanonicalOrder(values, FUNNEL_STAGES));

const allowedRolesSchema = z
  .array(contentRoleSchema)
  .min(1)
  .transform(dedupeValues)
  .transform((values) => sortByCanonicalOrder(values, CONTENT_ROLES));

const intentFamiliesSchema = z
  .array(machineReadableId)
  .min(1)
  .transform(dedupeValues)
  .transform((values) => [...values].sort(compareMachineIds));

export const clusterDefinitionSchema = z
  .object({
    id: clusterIdSchema,
    label: nonEmptyString,
    priority: z.number().int().positive(),
    commercialRoot: internalAbsoluteRouteSchema,
    commercialService: commercialServiceSchema,
    editorialPillar: editorialPillarSchema,
    targetMarkets: clusterTargetMarketsSchema,
    funnelStages: funnelStagesSchema,
    allowedRoles: allowedRolesSchema,
    intentFamilies: intentFamiliesSchema,
    reviewOwner: nonEmptyString,
    navigation: z.object({ visible: z.boolean() }).strict(),
  })
  .strict();

export type ClusterDefinition = z.infer<typeof clusterDefinitionSchema>;

function addIssue(
  context: z.RefinementCtx,
  path: Array<string | number>,
  message: string,
): void {
  context.addIssue({
    code: z.ZodIssueCode.custom,
    path,
    message,
  });
}

function getCanonicalClusterDefinition(
  id: ClusterId,
): CanonicalClusterDefinition {
  const definition = CANONICAL_CLUSTER_DEFINITIONS.find(
    (candidate) => candidate.id === id,
  );

  if (!definition) {
    throw new Error(`Missing canonical definition for cluster "${id}".`);
  }

  return definition;
}

function formatExpectedValue(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : String(value);
}

function assertCanonicalBinding(
  context: z.RefinementCtx,
  clusterIndex: number,
  clusterId: ClusterId,
  fieldPath: readonly string[],
  expected: unknown,
  actual: unknown,
): void {
  if (actual === expected) return;

  const field = fieldPath.join(".");
  addIssue(
    context,
    ["clusters", clusterIndex, ...fieldPath],
    `Canonical cluster "${clusterId}" ${field} must be ${formatExpectedValue(expected)}; received ${formatExpectedValue(actual)}.`,
  );
}

const rawClusterRegistrySchema = z
  .object({
    version: z.literal(1),
    clusters: z.array(clusterDefinitionSchema),
  })
  .strict()
  .superRefine((registry, context) => {
    if (registry.clusters.length !== CANONICAL_CLUSTER_IDS.length) {
      addIssue(
        context,
        ["clusters"],
        `Cluster registry must contain exactly ${CANONICAL_CLUSTER_IDS.length} canonical clusters; received ${registry.clusters.length}.`,
      );
    }

    const seenIds = new Map<ClusterId, number>();
    const seenCommercialRoots = new Map<
      string,
      { id: ClusterId; index: number }
    >();
    const seenCommercialServiceIds = new Map<
      string,
      { id: ClusterId; index: number }
    >();
    const seenPriorities = new Map<number, { id: ClusterId; index: number }>();

    registry.clusters.forEach((cluster, index) => {
      const canonical = getCanonicalClusterDefinition(cluster.id);

      assertCanonicalBinding(
        context,
        index,
        cluster.id,
        ["label"],
        canonical.label,
        cluster.label,
      );
      assertCanonicalBinding(
        context,
        index,
        cluster.id,
        ["priority"],
        canonical.priority,
        cluster.priority,
      );
      assertCanonicalBinding(
        context,
        index,
        cluster.id,
        ["commercialRoot"],
        canonical.commercialRoot,
        cluster.commercialRoot,
      );
      assertCanonicalBinding(
        context,
        index,
        cluster.id,
        ["commercialService", "id"],
        canonical.commercialService.id,
        cluster.commercialService.id,
      );
      assertCanonicalBinding(
        context,
        index,
        cluster.id,
        ["commercialService", "label"],
        canonical.commercialService.label,
        cluster.commercialService.label,
      );

      const firstIdIndex = seenIds.get(cluster.id);
      if (firstIdIndex !== undefined) {
        addIssue(
          context,
          ["clusters", index, "id"],
          `Duplicate cluster id "${cluster.id}"; first declared at clusters[${firstIdIndex}].id.`,
        );
      } else {
        seenIds.set(cluster.id, index);
      }

      const firstCommercialRoot = seenCommercialRoots.get(
        cluster.commercialRoot,
      );
      if (firstCommercialRoot) {
        addIssue(
          context,
          ["clusters", index, "commercialRoot"],
          `Duplicate commercial root "${cluster.commercialRoot}" for clusters "${firstCommercialRoot.id}" and "${cluster.id}".`,
        );
      } else {
        seenCommercialRoots.set(cluster.commercialRoot, {
          id: cluster.id,
          index,
        });
      }

      const firstService = seenCommercialServiceIds.get(
        cluster.commercialService.id,
      );
      if (firstService) {
        addIssue(
          context,
          ["clusters", index, "commercialService", "id"],
          `Duplicate commercial service id "${cluster.commercialService.id}" for clusters "${firstService.id}" and "${cluster.id}".`,
        );
      } else {
        seenCommercialServiceIds.set(cluster.commercialService.id, {
          id: cluster.id,
          index,
        });
      }

      const firstPriority = seenPriorities.get(cluster.priority);
      if (firstPriority) {
        addIssue(
          context,
          ["clusters", index, "priority"],
          `Duplicate priority "${cluster.priority}" for clusters "${firstPriority.id}" and "${cluster.id}".`,
        );
      } else {
        seenPriorities.set(cluster.priority, { id: cluster.id, index });
      }
    });

    const seenEditorialRoots = new Map<
      string,
      { id: ClusterId; index: number }
    >();

    registry.clusters.forEach((cluster, index) => {
      if (cluster.editorialPillar.status !== "resolved") return;

      const editorialRoot = cluster.editorialPillar.root;
      const commercialOwner = seenCommercialRoots.get(editorialRoot);
      if (commercialOwner) {
        addIssue(
          context,
          ["clusters", index, "editorialPillar", "root"],
          `Resolved editorial pillar root "${editorialRoot}" for cluster "${cluster.id}" cannot also be a commercial root owned by cluster "${commercialOwner.id}".`,
        );
      }

      const firstEditorialRoot = seenEditorialRoots.get(editorialRoot);
      if (firstEditorialRoot) {
        addIssue(
          context,
          ["clusters", index, "editorialPillar", "root"],
          `Duplicate resolved editorial pillar root "${editorialRoot}" for clusters "${firstEditorialRoot.id}" and "${cluster.id}".`,
        );
      } else {
        seenEditorialRoots.set(editorialRoot, { id: cluster.id, index });
      }
    });

    for (const canonicalId of CANONICAL_CLUSTER_IDS) {
      if (!seenIds.has(canonicalId)) {
        addIssue(
          context,
          ["clusters"],
          `Missing canonical cluster id "${canonicalId}".`,
        );
      }
    }
  });

export const clusterRegistrySchema = rawClusterRegistrySchema.transform(
  (registry) =>
    deepFreeze({
      version: registry.version,
      clusters: [...registry.clusters].sort(
        (left, right) =>
          left.priority - right.priority || left.id.localeCompare(right.id),
      ),
    }),
);

export type ClusterRegistry = z.infer<typeof clusterRegistrySchema>;

/**
 * Returns whether atomic cluster coverage includes an article market.
 * `global` cluster coverage includes every article market; a global article
 * requires global cluster coverage; and `AU-NZ` requires both AU and NZ.
 */
export function marketCoverageIncludes(
  clusterMarkets: readonly ClusterTargetMarket[],
  articleMarket: TargetMarket,
): boolean {
  if (clusterMarkets.includes("global")) return true;
  if (articleMarket === "global") return false;
  if (articleMarket === "AU-NZ") {
    return clusterMarkets.includes("AU") && clusterMarkets.includes("NZ");
  }

  return clusterMarkets.includes(articleMarket);
}

export function parseClusterRegistry(input: unknown): ClusterRegistry {
  try {
    return clusterRegistrySchema.parse(input);
  } catch (error) {
    if (!(error instanceof z.ZodError)) {
      throw error;
    }

    const detail = error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "registry";
        return `${path}: ${issue.message}`;
      })
      .join("; ");

    throw new Error(`Cluster registry validation failed: ${detail}`);
  }
}

export function assertKnownClusterReference(
  registry: ClusterRegistry,
  value: unknown,
): ClusterId {
  const parsedReference = clusterIdSchema.safeParse(value);

  if (!parsedReference.success) {
    throw new Error(
      `Unknown cluster reference "${String(value)}". Expected one of: ${CANONICAL_CLUSTER_IDS.join(", ")}.`,
    );
  }

  if (
    !registry.clusters.some((cluster) => cluster.id === parsedReference.data)
  ) {
    throw new Error(
      `Known cluster reference "${parsedReference.data}" is not present in registry version ${registry.version}.`,
    );
  }

  return parsedReference.data;
}
