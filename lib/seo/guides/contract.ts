import { z } from "zod";
import {
  CANONICAL_CLUSTER_DEFINITIONS,
  CANONICAL_CLUSTER_IDS,
  clusterIdSchema,
  contentRoleSchema,
  type ClusterId,
} from "../clusterSchema";
import { isPublicEnglishCopy } from "./publicCopy";

const machineReadableIdSchema = z
  .string()
  .trim()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Expected a lowercase machine-readable ID using letters, numbers, and single hyphens.",
  );

const articleContentIdSchema = z
  .string()
  .trim()
  .regex(
    /^article\.[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Expected an article content ID such as "article.supplier-verification-guide".',
  );

const articleRouteSchema = z
  .string()
  .trim()
  .regex(
    /^\/article\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Expected an editorial article route such as "/article/supplier-verification-guide" with no query or fragment.',
  );

function isLeapYear(year: number): boolean {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function isIsoCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const daysByMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysByMonth[month - 1];
}

const isoDateSchema = z
  .string()
  .refine(
    isIsoCalendarDate,
    "Expected a valid ISO calendar date (YYYY-MM-DD).",
  );

const publicCopySchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    isPublicEnglishCopy,
    "Expected public English copy with Latin-script letters and without brand abbreviations or emoji.",
  );

const resolvedEditorialPillarSchema = z
  .object({
    status: z.literal("resolved"),
    root: articleRouteSchema,
  })
  .strict();

const migrationPendingEditorialPillarSchema = z
  .object({
    status: z.literal("migration-pending"),
    root: z.null(),
    migrationId: machineReadableIdSchema,
    reason: z.string().trim().min(1),
  })
  .strict();

const discoveryClusterRecordSchema = z
  .object({
    id: clusterIdSchema,
    label: publicCopySchema,
    priority: z.number().int().positive(),
    editorialPillar: z.discriminatedUnion("status", [
      resolvedEditorialPillarSchema,
      migrationPendingEditorialPillarSchema,
    ]),
    navigation: z.object({ visible: z.boolean() }).strict(),
  })
  .strict();

const articleGovernanceSchema = z
  .object({
    date: isoDateSchema,
    version: z.number().int().positive(),
    editorialStatus: z.enum(["draft", "evidence-reviewed", "approved"]),
    publicationStatus: z.enum(["live", "blocked"]),
    discoveryEligibility: z.enum(["eligible", "blocked"]),
    migrationAction: z.enum(["keep", "refresh", "merge", "redirect", "retire"]),
  })
  .strict();

const discoveryArticleRecordSchema = z
  .object({
    contentId: articleContentIdSchema,
    route: articleRouteSchema,
    title: publicCopySchema,
    description: publicCopySchema,
    cluster: clusterIdSchema,
    contentRole: contentRoleSchema,
    publishedDate: isoDateSchema,
    updatedDate: isoDateSchema.nullable(),
    governance: articleGovernanceSchema,
  })
  .strict();

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

function canonicalDefinitionFor(id: ClusterId) {
  return CANONICAL_CLUSTER_DEFINITIONS.find(
    (definition) => definition.id === id,
  );
}

export const guidesDiscoveryInputSchema = z
  .object({
    contractVersion: z.literal(1),
    clusterRegistry: z
      .object({
        version: z.number().int().positive(),
        records: z.array(discoveryClusterRecordSchema),
      })
      .strict(),
    articleIndex: z
      .object({
        version: z.number().int().positive(),
        records: z.array(discoveryArticleRecordSchema),
      })
      .strict(),
    presentation: z
      .object({
        recentLimit: z.number().int().min(1).max(50),
      })
      .strict(),
  })
  .strict()
  .superRefine((input, context) => {
    const clusterRecords = input.clusterRegistry.records;
    if (clusterRecords.length !== CANONICAL_CLUSTER_IDS.length) {
      addIssue(
        context,
        ["clusterRegistry", "records"],
        `Expected exactly ${CANONICAL_CLUSTER_IDS.length} canonical cluster records; received ${clusterRecords.length}.`,
      );
    }

    const seenClusterIds = new Map<ClusterId, number>();
    const seenDestinations = new Map<string, number>();

    clusterRecords.forEach((cluster, index) => {
      const firstIndex = seenClusterIds.get(cluster.id);
      if (firstIndex !== undefined) {
        addIssue(
          context,
          ["clusterRegistry", "records", index, "id"],
          `Duplicate cluster ID "${cluster.id}"; first declared at record ${firstIndex}.`,
        );
      } else {
        seenClusterIds.set(cluster.id, index);
      }

      const canonical = canonicalDefinitionFor(cluster.id);
      if (!canonical) return;

      if (cluster.label !== canonical.label) {
        addIssue(
          context,
          ["clusterRegistry", "records", index, "label"],
          `Canonical cluster "${cluster.id}" must use label "${canonical.label}".`,
        );
      }
      if (cluster.priority !== canonical.priority) {
        addIssue(
          context,
          ["clusterRegistry", "records", index, "priority"],
          `Canonical cluster "${cluster.id}" must use priority ${canonical.priority}.`,
        );
      }

      if (cluster.editorialPillar.status === "resolved") {
        const firstDestinationIndex = seenDestinations.get(
          cluster.editorialPillar.root,
        );
        if (firstDestinationIndex !== undefined) {
          addIssue(
            context,
            ["clusterRegistry", "records", index, "editorialPillar", "root"],
            `Duplicate editorial pillar destination "${cluster.editorialPillar.root}"; first declared at record ${firstDestinationIndex}.`,
          );
        } else {
          seenDestinations.set(cluster.editorialPillar.root, index);
        }
      }
    });

    for (const id of CANONICAL_CLUSTER_IDS) {
      if (!seenClusterIds.has(id)) {
        addIssue(
          context,
          ["clusterRegistry", "records"],
          `Missing canonical cluster ID "${id}".`,
        );
      }
    }

    const seenContentIds = new Map<string, number>();
    const seenRoutes = new Map<string, number>();
    input.articleIndex.records.forEach((article, index) => {
      const firstContentIndex = seenContentIds.get(article.contentId);
      if (firstContentIndex !== undefined) {
        addIssue(
          context,
          ["articleIndex", "records", index, "contentId"],
          `Duplicate article content ID "${article.contentId}"; first declared at record ${firstContentIndex}.`,
        );
      } else {
        seenContentIds.set(article.contentId, index);
      }

      const firstRouteIndex = seenRoutes.get(article.route);
      if (firstRouteIndex !== undefined) {
        addIssue(
          context,
          ["articleIndex", "records", index, "route"],
          `Duplicate article route "${article.route}"; first declared at record ${firstRouteIndex}.`,
        );
      } else {
        seenRoutes.set(article.route, index);
      }
    });
  });

export type GuidesDiscoveryInput = z.infer<typeof guidesDiscoveryInputSchema>;
export type GuidesDiscoveryClusterRecord =
  GuidesDiscoveryInput["clusterRegistry"]["records"][number];
export type GuidesDiscoveryArticleRecord =
  GuidesDiscoveryInput["articleIndex"]["records"][number];
