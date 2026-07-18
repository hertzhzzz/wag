import { z } from "zod";

import {
  CANONICAL_CLUSTER_IDS,
  CONTENT_ROLES,
  FUNNEL_STAGES,
  TARGET_MARKETS,
} from "./clusterSchema";

export { CONTENT_ROLES, FUNNEL_STAGES, TARGET_MARKETS } from "./clusterSchema";

/**
 * Typed article frontmatter for the SEO Growth System.
 *
 * Compatibility mode accepts the existing 23-article display shape and reports
 * missing governed fields as deterministic warnings. Strict mode requires the
 * full governed contract.
 */

export const SITE_ORIGIN = "https://www.winningadventure.com.au";

export const ARTICLE_CLUSTERS = CANONICAL_CLUSTER_IDS;

export const EDITORIAL_STATUSES = [
  "draft",
  "evidence-reviewed",
  "approved",
] as const;

export const MIGRATION_ACTIONS = [
  "keep",
  "refresh",
  "merge",
  "redirect",
  "retire",
] as const;

export type ArticleCluster = (typeof ARTICLE_CLUSTERS)[number];
export type ContentRole = (typeof CONTENT_ROLES)[number];
export type FunnelStage = (typeof FUNNEL_STAGES)[number];
export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];
export type MigrationAction = (typeof MIGRATION_ACTIONS)[number];
export type TargetMarket = (typeof TARGET_MARKETS)[number];

export type ArticleValidationMode = "compatibility" | "strict";

export type ArticleWarningCode =
  | "missing_governed_field"
  | "legacy_field_alias"
  | "slug_mismatch"
  | "canonical_mismatch"
  | "soft_default_applied"
  | "invalid_optional_field";

export interface ArticleCompatibilityWarning {
  articleId: string;
  code: ArticleWarningCode;
  field: string;
  message: string;
}

export class ArticleValidationError extends Error {
  readonly articleId: string;
  readonly field: string;
  readonly issues: string[];

  constructor(articleId: string, field: string, issues: string[]) {
    const detail = issues.join("; ");
    super(`Article "${articleId}" failed validation on ${field}: ${detail}`);
    this.name = "ArticleValidationError";
    this.articleId = articleId;
    this.field = field;
    this.issues = issues;
  }
}

const nonEmptyString = z.string().trim().min(1);
const optionalString = z.string().trim().min(1).optional();
const stringArray = z.array(z.string().trim().min(1)).default([]);

const dateLike = z.union([
  z.string().trim().min(1),
  z.date().transform((value) => value.toISOString().slice(0, 10)),
]);

/** Display fields used by the public article shell today. */
export const articleDisplayFieldsSchema = z.object({
  title: nonEmptyString,
  date: dateLike,
  description: nonEmptyString,
  author: nonEmptyString,
  category: nonEmptyString,
  readTime: nonEmptyString,
  ctaTitle: nonEmptyString,
  ctaText: nonEmptyString,
  ctaButtonText: nonEmptyString,
  subtitle: optionalString,
  coverImage: optionalString,
  coverImageAlt: optionalString,
  updatedDate: dateLike.optional(),
  takeaways: z.array(z.string().trim().min(1)).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  featured: z.boolean().optional(),
  desc: optionalString,
  sourceType: optionalString,
  /** Legacy frontmatter slug, often `/article/{slug}`. */
  slug: optionalString,
});

/** Governed SEO Growth fields. Optional in compatibility mode. */
export const articleGovernedFieldsSchema = z.object({
  contentId: nonEmptyString.optional(),
  cluster: z.enum(ARTICLE_CLUSTERS).optional(),
  contentRole: z.enum(CONTENT_ROLES).optional(),
  searchIntent: nonEmptyString.optional(),
  funnelStage: z.enum(FUNNEL_STAGES).optional(),
  primaryKeyword: nonEmptyString.optional(),
  secondaryKeywords: stringArray.optional(),
  targetMarket: z.enum(TARGET_MARKETS).optional(),
  editorialStatus: z.enum(EDITORIAL_STATUSES).optional(),
  evidenceIds: stringArray.optional(),
  firstPartyContributionId: z.string().trim().min(1).nullable().optional(),
  commercialRoot: nonEmptyString.optional(),
  editorialPillar: nonEmptyString.optional(),
  requiredLinks: z.array(nonEmptyString).optional(),
  reviewedBy: nonEmptyString.optional(),
  reviewedDate: dateLike.optional(),
  reviewDueDate: dateLike.optional(),
  migrationAction: z.enum(MIGRATION_ACTIONS).optional(),
});

export const articleFrontmatterSchema = articleDisplayFieldsSchema.merge(
  articleGovernedFieldsSchema,
);

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export interface NormalizedArticleFrontmatter extends ArticleFrontmatter {
  contentId: string;
  description: string;
  category: string;
  secondaryKeywords: string[];
  evidenceIds: string[];
}

export type ArticleGovernedField = keyof z.infer<
  typeof articleGovernedFieldsSchema
>;

/**
 * Canonical governed-field contract. The Zod schema is the single source of
 * truth so validation, compatibility reporting, and generators cannot drift.
 */
export const ARTICLE_GOVERNED_FIELDS = Object.freeze(
  Object.keys(articleGovernedFieldsSchema.shape) as ArticleGovernedField[],
);

export function deriveContentId(slug: string): string {
  return `article.${slug.replace(/\//g, ".")}`;
}

export function articleRoutePath(slug: string): string {
  return `/article/${slug}`;
}

export function articleCanonicalUrl(slug: string): string {
  return `${SITE_ORIGIN}${articleRoutePath(slug)}`;
}

function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  });
}

function isPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function hasGovernedField(
  data: Record<string, unknown>,
  field: ArticleGovernedField,
): boolean {
  return (
    Object.prototype.hasOwnProperty.call(data, field) &&
    data[field] !== undefined
  );
}

function compareCodePoints(left: string, right: string): number {
  const leftPoints = Array.from(
    left,
    (character) => character.codePointAt(0) ?? 0,
  );
  const rightPoints = Array.from(
    right,
    (character) => character.codePointAt(0) ?? 0,
  );
  const length = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < length; index += 1) {
    const difference = leftPoints[index] - rightPoints[index];
    if (difference !== 0) return difference;
  }

  return leftPoints.length - rightPoints.length;
}

/**
 * Validate raw frontmatter against the article contract.
 * @param raw - gray-matter `data` object
 * @param fileSlug - route slug derived from the filename (source of truth)
 * @param mode - compatibility accepts legacy corpus; strict requires governed fields
 */
export function parseArticleFrontmatter(
  raw: Record<string, unknown>,
  fileSlug: string,
  mode: ArticleValidationMode = "compatibility",
): {
  frontmatter: NormalizedArticleFrontmatter;
  warnings: ArticleCompatibilityWarning[];
} {
  const articleId = fileSlug;
  const warnings: ArticleCompatibilityWarning[] = [];
  const data: Record<string, unknown> = { ...raw };

  // Legacy alias: `desc` may stand in for `description` during migration.
  if (!isPresent(data.description) && isPresent(data.desc)) {
    data.description = data.desc;
    warnings.push({
      articleId,
      code: "legacy_field_alias",
      field: "description",
      message: `Article "${articleId}" used legacy field "desc" as description.`,
    });
  }

  // Soft defaults used by existing list/detail loaders when category is absent.
  if (!isPresent(data.category)) {
    data.category = "Uncategorized";
    warnings.push({
      articleId,
      code: "soft_default_applied",
      field: "category",
      message: `Article "${articleId}" missing category; defaulted to "Uncategorized".`,
    });
  }

  const displayResult = articleDisplayFieldsSchema.safeParse(data);
  if (!displayResult.success) {
    const issues = formatZodIssues(displayResult.error);
    const firstPath = displayResult.error.issues[0]?.path[0];
    const field = typeof firstPath === "string" ? firstPath : "frontmatter";
    throw new ArticleValidationError(articleId, field, issues);
  }

  // Governed fields: when present, enum/type must be valid even in compatibility mode.
  const governedInput: Record<string, unknown> = {};
  for (const field of ARTICLE_GOVERNED_FIELDS) {
    if (hasGovernedField(data, field)) {
      governedInput[field] = data[field];
    }
  }
  const governedResult = articleGovernedFieldsSchema.safeParse(governedInput);
  if (!governedResult.success) {
    const issues = formatZodIssues(governedResult.error);
    const firstPath = governedResult.error.issues[0]?.path[0];
    const field = typeof firstPath === "string" ? firstPath : "governed";
    throw new ArticleValidationError(articleId, field, issues);
  }

  if (mode === "strict") {
    const missing: string[] = [];
    for (const field of ARTICLE_GOVERNED_FIELDS) {
      if (!hasGovernedField(governedInput, field)) {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      throw new ArticleValidationError(
        articleId,
        missing[0],
        missing.map((field) => `${field}: required in strict mode`),
      );
    }
  } else {
    for (const field of ARTICLE_GOVERNED_FIELDS) {
      if (!hasGovernedField(governedInput, field)) {
        warnings.push({
          articleId,
          code: "missing_governed_field",
          field,
          message: `Article "${articleId}" is missing governed field "${field}" (compatibility mode).`,
        });
      }
    }
  }

  const routePath = articleRoutePath(fileSlug);
  const fmSlug = displayResult.data.slug;
  if (fmSlug) {
    const normalized = fmSlug.startsWith("/") ? fmSlug : `/${fmSlug}`;
    if (normalized !== routePath && normalized !== fileSlug) {
      warnings.push({
        articleId,
        code: "slug_mismatch",
        field: "slug",
        message: `Article "${articleId}" frontmatter slug "${fmSlug}" does not match route "${routePath}". Filename slug is authoritative.`,
      });
    }
  }

  const contentId = governedResult.data.contentId ?? deriveContentId(fileSlug);
  if (!governedResult.data.contentId) {
    // already warned as missing_governed_field; contentId is derived for indexes
  }

  const frontmatter: NormalizedArticleFrontmatter = {
    ...displayResult.data,
    ...governedResult.data,
    contentId,
    description: displayResult.data.description,
    category: displayResult.data.category,
    secondaryKeywords: governedResult.data.secondaryKeywords ?? [],
    evidenceIds: governedResult.data.evidenceIds ?? [],
  };

  // Deterministic warning order for stable tooling output.
  warnings.sort((a, b) => {
    if (a.articleId !== b.articleId)
      return compareCodePoints(a.articleId, b.articleId);
    if (a.field !== b.field) return compareCodePoints(a.field, b.field);
    if (a.code !== b.code) return compareCodePoints(a.code, b.code);
    return compareCodePoints(a.message, b.message);
  });

  return { frontmatter, warnings };
}
