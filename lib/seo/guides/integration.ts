import { z } from "zod";
import {
  CANONICAL_CLUSTER_DEFINITIONS,
  CANONICAL_CLUSTER_IDS,
  clusterIdSchema,
} from "../clusterSchema";
import { compareCodePoints, deepFreeze } from "./deterministic";
import { isPublicEnglishCopy } from "./publicCopy";
import type { GuidesIntegrationDescriptors, GuidesPillarCard } from "./types";

export const GUIDES_INTEGRATION_INVARIANTS = deepFreeze([
  {
    id: "guides-only-scope",
    statement:
      "The descriptor owns only the Guides discovery section and cannot define unrelated navigation groups.",
  },
  {
    id: "services-preserved",
    statement:
      "The Services navigation remains an independent commercial contract and must not be replaced by Guides data.",
  },
  {
    id: "legal-preserved",
    statement:
      "Legal links remain an independent compliance contract and must not be replaced by Guides data.",
  },
  {
    id: "destination-parity",
    statement:
      "On-page pillars, footer pillars, and sitemap pillar descriptors must share the same approved destinations.",
  },
] as const);

const publicLabelSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    isPublicEnglishCopy,
    "Expected public English copy with Latin-script letters and without brand abbreviations or emoji.",
  );

const articleRouteSchema = z
  .string()
  .regex(/^\/article\/[a-z0-9]+(?:-[a-z0-9]+)*$/);

const footerItemSchema = z
  .object({
    clusterId: clusterIdSchema,
    label: publicLabelSchema,
    href: articleRouteSchema,
    order: z.number().int().positive(),
    elementId: z.string().regex(/^guides-footer-[a-z0-9]+(?:-[a-z0-9]+)*$/),
  })
  .strict();

const discoveryRootSitemapItemSchema = z
  .object({
    kind: z.literal("discovery-root"),
    label: z.literal("Guides"),
    href: z.literal("/article"),
    order: z.literal(0),
  })
  .strict();

const editorialPillarSitemapItemSchema = z
  .object({
    kind: z.literal("editorial-pillar"),
    clusterId: clusterIdSchema,
    label: publicLabelSchema,
    href: articleRouteSchema,
    order: z.number().int().positive(),
  })
  .strict();

const integrationDescriptorsSchema = z
  .object({
    scope: z.literal("guides-only"),
    navigation: z
      .object({
        kind: z.literal("guides-discovery"),
        label: z.literal("Guides"),
        href: z.literal("/article"),
        elementId: z.literal("guides-navigation-link"),
      })
      .strict(),
    footer: z
      .object({
        sectionLabel: z.literal("Guides"),
        elementId: z.literal("guides-footer-section"),
        items: z.array(footerItemSchema),
      })
      .strict(),
    sitemap: z
      .object({
        items: z.array(
          z.discriminatedUnion("kind", [
            discoveryRootSitemapItemSchema,
            editorialPillarSitemapItemSchema,
          ]),
        ),
      })
      .strict(),
  })
  .strict()
  .superRefine((descriptors, context) => {
    const footerItems = descriptors.footer.items;
    const sitemapItems = descriptors.sitemap.items;
    const rootItems = sitemapItems.filter(
      (item) => item.kind === "discovery-root",
    );
    const pillarSitemapItems = sitemapItems.filter(
      (item) => item.kind === "editorial-pillar",
    );

    if (footerItems.length !== CANONICAL_CLUSTER_IDS.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["footer", "items"],
        message: `Expected exactly ${CANONICAL_CLUSTER_IDS.length} footer pillar descriptors.`,
      });
    }
    if (rootItems.length !== 1 || sitemapItems[0]?.kind !== "discovery-root") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sitemap", "items"],
        message:
          "Expected exactly one Guides discovery root as the first sitemap descriptor.",
      });
    }
    if (pillarSitemapItems.length !== CANONICAL_CLUSTER_IDS.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sitemap", "items"],
        message: `Expected exactly ${CANONICAL_CLUSTER_IDS.length} sitemap pillar descriptors.`,
      });
    }

    CANONICAL_CLUSTER_DEFINITIONS.forEach((canonical, index) => {
      const footer = footerItems[index];
      const sitemap = pillarSitemapItems[index];

      if (
        !footer ||
        footer.clusterId !== canonical.id ||
        footer.label !== canonical.label ||
        footer.order !== canonical.priority
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["footer", "items", index],
          message: `Footer descriptor ${index} must match canonical cluster "${canonical.id}".`,
        });
      }

      if (
        !sitemap ||
        sitemap.clusterId !== canonical.id ||
        sitemap.label !== canonical.label ||
        sitemap.order !== canonical.priority
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sitemap", "items", index + 1],
          message: `Sitemap descriptor ${index + 1} must match canonical cluster "${canonical.id}".`,
        });
      }

      if (footer && sitemap && footer.href !== sitemap.href) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sitemap", "items", index + 1, "href"],
          message: `Destination parity failed for canonical cluster "${canonical.id}".`,
        });
      }
    });

    const footerDestinations = footerItems.map((item) => item.href);
    if (new Set(footerDestinations).size !== footerDestinations.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["footer", "items"],
        message: "Footer pillar destinations must be unique.",
      });
    }
  });

function formatIssues(error: z.ZodError): readonly string[] {
  return error.issues
    .map((issue) => {
      const path =
        issue.path.length > 0
          ? issue.path.map(String).join(".")
          : "integration";
      return `${path}: ${issue.message}`;
    })
    .sort(compareCodePoints);
}

export type GuidesIntegrationValidationResult =
  | {
      readonly status: "valid";
      readonly descriptors: GuidesIntegrationDescriptors;
    }
  | {
      readonly status: "blocked";
      readonly reasons: readonly string[];
    };

export function createGuidesIntegrationDescriptors(
  pillars: readonly GuidesPillarCard[],
): GuidesIntegrationDescriptors {
  return deepFreeze({
    scope: "guides-only",
    navigation: {
      kind: "guides-discovery",
      label: "Guides",
      href: "/article",
      elementId: "guides-navigation-link",
    },
    footer: {
      sectionLabel: "Guides",
      elementId: "guides-footer-section",
      items: pillars.map((pillar) => ({
        clusterId: pillar.clusterId,
        label: pillar.label,
        href: pillar.href,
        order: pillar.order,
        elementId: `guides-footer-${pillar.clusterId}`,
      })),
    },
    sitemap: {
      items: [
        {
          kind: "discovery-root",
          label: "Guides",
          href: "/article",
          order: 0,
        },
        ...pillars.map((pillar) => ({
          kind: "editorial-pillar" as const,
          clusterId: pillar.clusterId,
          label: pillar.label,
          href: pillar.href,
          order: pillar.order,
        })),
      ],
    },
  });
}

export function validateGuidesIntegrationDescriptors(
  input: unknown,
): GuidesIntegrationValidationResult {
  const parsed = integrationDescriptorsSchema.safeParse(input);
  if (!parsed.success) {
    return deepFreeze({
      status: "blocked",
      reasons: formatIssues(parsed.error),
    });
  }

  return deepFreeze({
    status: "valid",
    descriptors: parsed.data,
  });
}
