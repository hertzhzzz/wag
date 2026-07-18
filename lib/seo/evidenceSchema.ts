import { createHash } from "node:crypto";
import { isScalar, parseDocument, visit } from "yaml";
import { z } from "zod";

import { TARGET_MARKETS } from "./articleSchema";

export const EVIDENCE_SOURCE_TYPES = Object.freeze([
  "official",
  "first-party",
  "industry-analysis",
  "interview",
  "allowlisted-other",
] as const);

export const EVIDENCE_PRIVACY_LEVELS = Object.freeze([
  "public",
  "internal",
  "restricted",
] as const);

export const EVIDENCE_PERMISSION_STATUSES = Object.freeze([
  "permitted",
  "restricted",
  "unresolved",
] as const);

export const EVIDENCE_SUPPORT_STATUSES = Object.freeze([
  "supported",
  "unsupported",
] as const);

export const EVIDENCE_CLAIM_KINDS = Object.freeze([
  "fact",
  "signal",
  "inference",
  "limitation",
] as const);

export const EVIDENCE_REVIEW_DECISIONS = Object.freeze([
  "approved",
  "rejected",
  "correction-requested",
] as const);

export const EVIDENCE_STATUSES = Object.freeze([
  "public",
  "restricted",
  "expired",
  "unsupported",
] as const);

export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number];
export type EvidencePrivacyLevel = (typeof EVIDENCE_PRIVACY_LEVELS)[number];
export type EvidencePermissionStatus =
  (typeof EVIDENCE_PERMISSION_STATUSES)[number];
export type EvidenceSupportStatus = (typeof EVIDENCE_SUPPORT_STATUSES)[number];
export type EvidenceClaimKind = (typeof EVIDENCE_CLAIM_KINDS)[number];
export type EvidenceReviewDecisionValue =
  (typeof EVIDENCE_REVIEW_DECISIONS)[number];
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

const evidenceIdSchema = z
  .string()
  .trim()
  .regex(
    /^ev\.[a-f0-9]{8}$/,
    'Expected an opaque evidence ID such as "ev.2b6f9d04".',
  );

const controlledReferenceIdSchema = z
  .string()
  .trim()
  .regex(
    /^ref\.[a-f0-9]{8}$/,
    'Expected an opaque controlled reference ID such as "ref.1234abcd".',
  );

const machineReadableIdSchema = z
  .string()
  .trim()
  .regex(
    /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/,
    "Expected a lowercase machine-readable ID using letters, numbers, dots, or single hyphens.",
  );

const claimIdSchema = z
  .string()
  .trim()
  .regex(
    /^claim\.[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Expected a claim machine ID such as "claim.usci-format-and-standard".',
  );

const jurisdictionSchema = z
  .string()
  .trim()
  .regex(
    /^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*$/,
    "Expected a non-empty machine-readable jurisdiction value.",
  );

const nonEmptyStringSchema = z.string().trim().min(1);
const exactNonEmptyStringSchema = z
  .string()
  .refine(
    (value) => value.trim().length > 0,
    "Expected a non-empty exact article substring.",
  );

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isRealCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const daysInMonth = [
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

  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth[month - 1]
  );
}

const calendarDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD calendar date format.")
  .refine(isRealCalendarDate, "Expected a real YYYY-MM-DD calendar date.");

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const httpsUrlSchema = z.string().trim().url().refine(isHttpsUrl, {
  message: "Expected an HTTPS URL.",
});

const articlePathSchema = z
  .string()
  .trim()
  .regex(
    /^content\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/,
    "Expected a repository-relative content/blog/*.mdx article path.",
  );

const digestSchema = z
  .string()
  .trim()
  .regex(
    /^sha256:[a-f0-9]{64}$/,
    "Expected a sha256: digest followed by 64 lowercase hexadecimal characters.",
  );

function compareStrings(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function dedupeAndSort(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareStrings);
}

function sortByCanonicalOrder<T extends string>(
  values: readonly T[],
  canonicalOrder: readonly T[],
): T[] {
  const order = new Map(canonicalOrder.map((value, index) => [value, index]));

  return [...new Set(values)].sort(
    (left, right) =>
      (order.get(left) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(right) ?? Number.MAX_SAFE_INTEGER) ||
      compareStrings(left, right),
  );
}

function addDuplicateIdIssues(
  values: readonly { id: string }[],
  context: z.RefinementCtx,
  label: string,
): void {
  const firstIndexes = new Map<string, number>();

  values.forEach(({ id }, index) => {
    const firstIndex = firstIndexes.get(id);
    if (firstIndex === undefined) {
      firstIndexes.set(id, index);
      return;
    }

    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [index, "id"],
      message: `Duplicate ${label} ID "${id}"; first declared at index ${firstIndex}.`,
    });
  });
}

const stringSetSchema = z
  .array(nonEmptyStringSchema)
  .min(1)
  .transform(dedupeAndSort);

const jurisdictionSetSchema = z
  .array(jurisdictionSchema)
  .min(1)
  .transform(dedupeAndSort);

const targetMarketSetSchema = z
  .array(z.enum(TARGET_MARKETS))
  .min(1)
  .transform((values) => sortByCanonicalOrder(values, TARGET_MARKETS));

const evidenceIdSetSchema = z
  .array(evidenceIdSchema)
  .min(1)
  .transform(dedupeAndSort);

const publicUrlSourceSchema = z
  .object({
    kind: z.literal("public-url"),
    url: httpsUrlSchema,
  })
  .strict();

const controlledReferenceSourceSchema = z
  .object({
    kind: z.literal("controlled-reference"),
    referenceId: controlledReferenceIdSchema,
  })
  .strict();

const evidenceSourceSchema = z.discriminatedUnion("kind", [
  publicUrlSourceSchema,
  controlledReferenceSourceSchema,
]);

const supportedClaimSchema = z
  .object({
    id: claimIdSchema,
    boundary: nonEmptyStringSchema,
  })
  .strict();

const supportedClaimsSchema = z
  .array(supportedClaimSchema)
  .min(1)
  .superRefine((values, context) => {
    addDuplicateIdIssues(values, context, "supported claim");
  })
  .transform((values) =>
    [...values].sort((a, b) => compareStrings(a.id, b.id)),
  );

const evidencePermissionSchema = z
  .object({
    status: z.enum(EVIDENCE_PERMISSION_STATUSES),
    attributionRequired: z.boolean(),
    attribution: nonEmptyStringSchema.optional(),
  })
  .strict();

const evidenceMethodSchema = z
  .object({
    summary: nonEmptyStringSchema,
    denominator: z.number().int().positive().optional(),
    deduplication: nonEmptyStringSchema.optional(),
  })
  .strict();

type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

function deepFreeze<T>(value: T): DeepReadonly<T>;
function deepFreeze(value: unknown): unknown {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const nestedValue of Object.values(value)) {
    deepFreeze(nestedValue);
  }

  return Object.freeze(value);
}

const rawEvidenceRecordSchema = z
  .object({
    id: evidenceIdSchema,
    title: nonEmptyStringSchema,
    sourceType: z.enum(EVIDENCE_SOURCE_TYPES),
    source: evidenceSourceSchema,
    capturedDate: calendarDateSchema,
    jurisdictions: jurisdictionSetSchema,
    targetMarkets: targetMarketSetSchema,
    supportStatus: z.enum(EVIDENCE_SUPPORT_STATUSES),
    supportedClaims: supportedClaimsSchema,
    limitations: stringSetSchema,
    reviewDueDate: calendarDateSchema,
    permission: evidencePermissionSchema,
    privacy: z.enum(EVIDENCE_PRIVACY_LEVELS),
    quantitative: z.boolean().default(false),
    method: evidenceMethodSchema.optional(),
  })
  .strict();

export const evidenceRecordSchema = rawEvidenceRecordSchema.transform(
  (record) =>
    deepFreeze({
      id: record.id,
      title: record.title,
      sourceType: record.sourceType,
      source:
        record.source.kind === "public-url"
          ? { kind: record.source.kind, url: record.source.url }
          : {
              kind: record.source.kind,
              referenceId: record.source.referenceId,
            },
      capturedDate: record.capturedDate,
      jurisdictions: [...record.jurisdictions],
      targetMarkets: [...record.targetMarkets],
      supportStatus: record.supportStatus,
      supportedClaims: record.supportedClaims.map((claim) => ({ ...claim })),
      limitations: [...record.limitations],
      reviewDueDate: record.reviewDueDate,
      permission: {
        status: record.permission.status,
        attributionRequired: record.permission.attributionRequired,
        ...(record.permission.attribution === undefined
          ? {}
          : { attribution: record.permission.attribution }),
      },
      privacy: record.privacy,
      quantitative: record.quantitative,
      ...(record.method === undefined
        ? {}
        : {
            method: {
              summary: record.method.summary,
              ...(record.method.denominator === undefined
                ? {}
                : { denominator: record.method.denominator }),
              ...(record.method.deduplication === undefined
                ? {}
                : { deduplication: record.method.deduplication }),
            },
          }),
    }),
);

export type EvidenceRecord = z.infer<typeof evidenceRecordSchema>;

const rawEvidenceRegistrySchema = z
  .object({
    version: z.literal(1),
    evidence: z.array(evidenceRecordSchema),
  })
  .strict()
  .superRefine((registry, context) => {
    addDuplicateIdIssues(registry.evidence, context, "evidence");
  });

export const evidenceRegistrySchema = rawEvidenceRegistrySchema.transform(
  (registry) =>
    deepFreeze({
      version: registry.version,
      evidence: [...registry.evidence].sort((left, right) =>
        compareStrings(left.id, right.id),
      ),
    }),
);

export type EvidenceRegistry = z.infer<typeof evidenceRegistrySchema>;

const evidenceClaimSchema = z
  .object({
    id: claimIdSchema,
    kind: z.enum(EVIDENCE_CLAIM_KINDS),
    excerpt: exactNonEmptyStringSchema,
    boundary: nonEmptyStringSchema,
    evidenceIds: evidenceIdSetSchema,
  })
  .strict();

const rawEvidenceClaimManifestSchema = z
  .object({
    version: z.literal(1),
    articleId: machineReadableIdSchema,
    articlePath: articlePathSchema,
    claims: z.array(evidenceClaimSchema).min(1),
  })
  .strict()
  .superRefine((manifest, context) => {
    addDuplicateIdIssues(manifest.claims, context, "claim");
  });

export const evidenceClaimManifestSchema =
  rawEvidenceClaimManifestSchema.transform((manifest) =>
    deepFreeze({
      version: manifest.version,
      articleId: manifest.articleId,
      articlePath: manifest.articlePath,
      claims: [...manifest.claims]
        .sort((left, right) => compareStrings(left.id, right.id))
        .map((claim) => ({
          id: claim.id,
          kind: claim.kind,
          excerpt: claim.excerpt,
          boundary: claim.boundary,
          evidenceIds: [...claim.evidenceIds],
        })),
    }),
  );

export type EvidenceClaimManifest = z.infer<typeof evidenceClaimManifestSchema>;

const rawEvidenceReviewDecisionSchema = z
  .object({
    version: z.literal(1),
    articleId: machineReadableIdSchema,
    decision: z.enum(EVIDENCE_REVIEW_DECISIONS),
    reviewer: nonEmptyStringSchema,
    reviewedDate: calendarDateSchema,
    articleDigest: digestSchema,
    claimManifestDigest: digestSchema,
    notes: nonEmptyStringSchema.optional(),
  })
  .strict();

export const evidenceReviewDecisionSchema =
  rawEvidenceReviewDecisionSchema.transform((decision) =>
    deepFreeze({
      version: decision.version,
      articleId: decision.articleId,
      decision: decision.decision,
      reviewer: decision.reviewer,
      reviewedDate: decision.reviewedDate,
      articleDigest: decision.articleDigest,
      claimManifestDigest: decision.claimManifestDigest,
      ...(decision.notes === undefined ? {} : { notes: decision.notes }),
    }),
  );

export type EvidenceReviewDecision = z.infer<
  typeof evidenceReviewDecisionSchema
>;

function describeYamlError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
  const message = error instanceof Error ? error.message : String(error);

  if (code === "DUPLICATE_KEY" || /keys? must be unique/i.test(message)) {
    return `Duplicate key: ${message}`;
  }

  return message;
}

function formatValidationError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length === 0 ? "<root>" : issue.path.join(".");
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

function parseYamlWithSchema<Schema extends z.ZodType>(
  source: string,
  schema: Schema,
  label: string,
  sourcePath?: string,
): z.output<Schema> {
  const location = sourcePath ?? `<${label}>`;
  const document = parseDocument(source, {
    merge: false,
    uniqueKeys: true,
  });

  if (document.errors.length > 0) {
    throw new Error(
      `${location}: YAML parse failed: ${document.errors.map(describeYamlError).join("; ")}`,
    );
  }

  const prohibitedSyntax = new Set<string>();
  visit(document, {
    Alias: () => {
      prohibitedSyntax.add("alias");
    },
    Node: (_key, node) => {
      if (node.anchor) prohibitedSyntax.add("anchor");
    },
    Pair: (_key, pair) => {
      if (isScalar(pair.key) && pair.key.value === "<<") {
        prohibitedSyntax.add("merge key");
      }
    },
  });

  if (prohibitedSyntax.size > 0) {
    throw new Error(
      `${location}: YAML anchors, aliases, and merge keys are not permitted; found ${[...prohibitedSyntax].sort(compareStrings).join(", ")}.`,
    );
  }

  let input: unknown;
  try {
    input = document.toJS({ maxAliasCount: 0 });
  } catch (error) {
    throw new Error(
      `${location}: YAML conversion failed: ${describeYamlError(error)}`,
    );
  }

  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `${location}: ${label} validation failed: ${formatValidationError(result.error)}`,
    );
  }

  return result.data;
}

export function parseEvidenceRegistryYaml(
  source: string,
  sourcePath?: string,
): EvidenceRegistry {
  return parseYamlWithSchema(
    source,
    evidenceRegistrySchema,
    "evidence registry",
    sourcePath,
  );
}

export function parseEvidenceClaimManifestYaml(
  source: string,
  sourcePath?: string,
): EvidenceClaimManifest {
  return parseYamlWithSchema(
    source,
    evidenceClaimManifestSchema,
    "evidence claim manifest",
    sourcePath,
  );
}

export function parseEvidenceReviewDecisionYaml(
  source: string,
  sourcePath?: string,
): EvidenceReviewDecision {
  return parseYamlWithSchema(
    source,
    evidenceReviewDecisionSchema,
    "evidence review decision",
    sourcePath,
  );
}

export function evaluateEvidenceStatus(
  record: EvidenceRecord,
  asOfDate: string,
): EvidenceStatus {
  const parsedAsOfDate = calendarDateSchema.safeParse(asOfDate);
  if (!parsedAsOfDate.success) {
    throw new Error(
      `Invalid asOfDate: ${formatValidationError(parsedAsOfDate.error)}`,
    );
  }

  if (record.supportStatus === "unsupported") return "unsupported";

  // Fixed-width ISO calendar dates sort in UTC calendar order without clock or
  // local-time conversion. The review due date itself remains valid.
  if (parsedAsOfDate.data > record.reviewDueDate) return "expired";

  if (record.privacy !== "public" || record.permission.status !== "permitted") {
    return "restricted";
  }

  return "public";
}

export function sha256Source(source: string): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(source, "utf8").digest("hex")}`;
}
