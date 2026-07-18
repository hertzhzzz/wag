import { z } from "zod";

export const EXPERTISE_RECORD_CLASSES = Object.freeze([
  "actual",
  "synthetic",
] as const);

export const EXPERTISE_PUBLIC_USE_POLICIES = Object.freeze([
  "governed",
  "prohibited",
] as const);

export const CONSENT_DECISIONS = Object.freeze([
  "granted",
  "denied",
  "not-requested",
] as const);

export const EXPERTISE_PRIVACY_LEVELS = Object.freeze([
  "public",
  "internal",
  "restricted",
] as const);

export const EXPERTISE_PRIVACY_CATEGORIES = Object.freeze([
  "address",
  "banking",
  "identifier",
  "other-confidential",
  "person",
  "pricing",
  "supplier",
] as const);

export const REDACTION_ACTIONS = Object.freeze([
  "generalised",
  "masked",
  "removed",
] as const);

const exactNonEmptyStringSchema = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), {
    message: "must not contain leading or trailing whitespace",
  });

const opaqueId = (prefix: string) =>
  z
    .string()
    .regex(
      new RegExp(`^${prefix}\\.[0-9a-f]{12}$`),
      `must be an opaque ${prefix}. identifier`,
    );

const sessionIdSchema = opaqueId("intv");
const contributorRefSchema = opaqueId("contributor");
const interviewerRefSchema = opaqueId("interviewer");
const reviewerRefSchema = opaqueId("reviewer");
const redactionIdSchema = opaqueId("redaction");

const rawNoteRefSchema = z
  .string()
  .regex(
    /^note\.[0-9a-f]{16}$/,
    "must be an opaque private-store reference such as note.<16 lowercase hex characters>",
  );

function compareStrings(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function dedupeAndSort(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareStrings);
}

type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

export function deepFreeze<T>(value: T): DeepReadonly<T>;
export function deepFreeze(value: unknown): unknown {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const nestedValue of Object.values(value)) {
    deepFreeze(nestedValue);
  }

  return Object.freeze(value);
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isRealCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
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

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

export const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must use YYYY-MM-DD")
  .refine(isRealCalendarDate, "must be a real calendar date");

const occurredAtSchema = z
  .string()
  .datetime({ offset: true, precision: 0 })
  .refine((value) => value === value.trim(), {
    message: "must not contain leading or trailing whitespace",
  });

const canonicalStringSetSchema = z
  .array(exactNonEmptyStringSchema)
  .transform(dedupeAndSort);

const privacyCategoriesSchema = z
  .array(z.enum(EXPERTISE_PRIVACY_CATEGORIES))
  .transform(
    (values) =>
      dedupeAndSort(values) as (typeof EXPERTISE_PRIVACY_CATEGORIES)[number][],
  );

const contributorSchema = z
  .object({
    internalRef: contributorRefSchema,
    name: exactNonEmptyStringSchema,
    role: exactNonEmptyStringSchema,
    authorityScope: canonicalStringSetSchema.pipe(z.array(z.string()).min(1)),
  })
  .strict();

const interviewerSchema = z
  .object({
    internalRef: interviewerRefSchema,
    name: exactNonEmptyStringSchema,
    role: exactNonEmptyStringSchema,
  })
  .strict();

const consentSchema = z
  .object({
    capturedOn: calendarDateSchema,
    recording: z.enum(CONSENT_DECISIONS),
    transcript: z.enum(CONSENT_DECISIONS),
    internalUse: z.enum(CONSENT_DECISIONS),
    publicQuotation: z.enum(CONSENT_DECISIONS),
    namedAttribution: z.enum(CONSENT_DECISIONS),
    expiresOn: calendarDateSchema.nullable(),
    revokedOn: calendarDateSchema.nullable(),
    revocationReason: exactNonEmptyStringSchema.nullable(),
  })
  .strict()
  .superRefine((consent, context) => {
    if ((consent.revokedOn === null) !== (consent.revocationReason === null)) {
      context.addIssue({
        code: "custom",
        path: ["revocationReason"],
        message:
          "revokedOn and revocationReason must both be set or both be null",
      });
    }

    if (consent.expiresOn !== null && consent.expiresOn < consent.capturedOn) {
      context.addIssue({
        code: "custom",
        path: ["expiresOn"],
        message: "must not be earlier than capturedOn",
      });
    }

    if (consent.revokedOn !== null && consent.revokedOn < consent.capturedOn) {
      context.addIssue({
        code: "custom",
        path: ["revokedOn"],
        message: "must not be earlier than capturedOn",
      });
    }
  });

const interviewQuestionSchema = z
  .object({
    id: z
      .string()
      .regex(
        /^question\.[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "must be a stable question.<kebab-case> identifier",
      ),
    prompt: exactNonEmptyStringSchema,
    responseSummary: exactNonEmptyStringSchema,
    privacyCategories: privacyCategoriesSchema,
  })
  .strict();

const buyerQuestionSchema = z
  .object({
    id: z
      .string()
      .regex(
        /^buyer-question\.[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "must be a stable buyer-question.<kebab-case> identifier",
      ),
    question: exactNonEmptyStringSchema,
    buyerNeed: exactNonEmptyStringSchema,
    privacyCategories: privacyCategoriesSchema,
  })
  .strict();

const safeExampleSchema = z
  .object({
    id: z
      .string()
      .regex(
        /^example\.[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "must be a stable example.<kebab-case> identifier",
      ),
    summary: exactNonEmptyStringSchema,
    permittedClaimBoundary: exactNonEmptyStringSchema,
    privacyCategories: privacyCategoriesSchema,
  })
  .strict();

const externalSupportClaimSchema = z
  .object({
    id: z
      .string()
      .regex(
        /^support\.[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "must be a stable support.<kebab-case> identifier",
      ),
    claim: exactNonEmptyStringSchema,
    requiredEvidenceType: exactNonEmptyStringSchema,
    reason: exactNonEmptyStringSchema,
  })
  .strict();

const privacyClassificationSchema = z
  .object({
    level: z.enum(["internal", "restricted"] as const),
    categories: privacyCategoriesSchema,
    classifiedByRef: reviewerRefSchema,
    classifiedOn: calendarDateSchema,
  })
  .strict();

const redactionLogEntrySchema = z
  .object({
    id: redactionIdSchema,
    category: z.enum(EXPERTISE_PRIVACY_CATEGORIES),
    action: z.enum(REDACTION_ACTIONS),
    rationale: exactNonEmptyStringSchema,
  })
  .strict();

const rawInterviewSessionSchema = z
  .object({
    version: z.literal(1),
    recordClass: z.enum(EXPERTISE_RECORD_CLASSES),
    publicUse: z.enum(EXPERTISE_PUBLIC_USE_POLICIES),
    sessionId: sessionIdSchema,
    occurredAt: occurredAtSchema,
    durationMinutes: z.number().int().positive().max(45),
    contributor: contributorSchema,
    interviewer: interviewerSchema,
    consent: consentSchema,
    questions: z.array(interviewQuestionSchema).min(1),
    buyerQuestions: z.array(buyerQuestionSchema).min(1),
    practicalBoundaries: canonicalStringSetSchema.pipe(
      z.array(z.string()).min(1),
    ),
    safeExamples: z.array(safeExampleSchema).min(1),
    externalSupportClaims: z.array(externalSupportClaimSchema).min(1),
    rawNoteRef: rawNoteRefSchema,
    privacyClassification: privacyClassificationSchema,
    redactionLog: z.array(redactionLogEntrySchema),
    limitations: canonicalStringSetSchema.pipe(z.array(z.string()).min(1)),
  })
  .strict()
  .superRefine((session, context) => {
    if (
      session.recordClass === "synthetic" &&
      session.publicUse !== "prohibited"
    ) {
      context.addIssue({
        code: "custom",
        path: ["publicUse"],
        message:
          "synthetic interview records must be non-public and prohibited",
      });
    }

    if (session.recordClass === "actual" && session.publicUse !== "governed") {
      context.addIssue({
        code: "custom",
        path: ["publicUse"],
        message: "actual interview records must use the governed workflow",
      });
    }
  });

export const interviewSessionSchema = rawInterviewSessionSchema.transform(
  (session) =>
    deepFreeze({
      ...session,
      contributor: {
        ...session.contributor,
        authorityScope: [...session.contributor.authorityScope],
      },
      interviewer: { ...session.interviewer },
      consent: { ...session.consent },
      questions: [...session.questions]
        .sort((left, right) => compareStrings(left.id, right.id))
        .map((question) => ({
          ...question,
          privacyCategories: [...question.privacyCategories],
        })),
      buyerQuestions: [...session.buyerQuestions]
        .sort((left, right) => compareStrings(left.id, right.id))
        .map((question) => ({
          ...question,
          privacyCategories: [...question.privacyCategories],
        })),
      practicalBoundaries: [...session.practicalBoundaries],
      safeExamples: [...session.safeExamples]
        .sort((left, right) => compareStrings(left.id, right.id))
        .map((example) => ({
          ...example,
          privacyCategories: [...example.privacyCategories],
        })),
      externalSupportClaims: [...session.externalSupportClaims]
        .sort((left, right) => compareStrings(left.id, right.id))
        .map((claim) => ({ ...claim })),
      privacyClassification: {
        ...session.privacyClassification,
        categories: [...session.privacyClassification.categories],
      },
      redactionLog: [...session.redactionLog]
        .sort((left, right) => compareStrings(left.id, right.id))
        .map((entry) => ({ ...entry })),
      limitations: [...session.limitations],
    }),
);

export type InterviewSession = z.infer<typeof interviewSessionSchema>;

export const EXPERTISE_CLAIM_KINDS = Object.freeze([
  "decision-boundary",
  "fact",
  "inference",
  "observation",
  "quantitative",
  "quotation",
  "safe-example",
] as const);

export const EXPERTISE_PERMISSION_STATUSES = Object.freeze([
  "permitted",
  "restricted",
  "revoked",
  "unresolved",
] as const);

export const EXPERTISE_PERMISSION_SCOPES = Object.freeze([
  "internal-analysis",
  "named-attribution",
  "public-claim",
  "public-quotation",
] as const);

export const EXPERTISE_ATTRIBUTION_MODES = Object.freeze([
  "anonymous",
  "named",
  "organisation-only",
  "role-only",
] as const);

export const EXPERTISE_REVIEW_DECISIONS = Object.freeze([
  "approved",
  "changes-required",
  "rejected",
] as const);

export const EXPERTISE_CONTRIBUTION_STATUSES = Object.freeze([
  "approved",
  "expired",
  "rejected",
  "restricted",
] as const);

const contributionIdSchema = opaqueId("contrib");
const reviewIdSchema = opaqueId("review");
const articleIdSchema = z
  .string()
  .regex(
    /^article\.[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "must be an article.<kebab-case> identifier",
  );

const permissionScopeSetSchema = z
  .array(z.enum(EXPERTISE_PERMISSION_SCOPES))
  .transform(
    (values) =>
      dedupeAndSort(values) as (typeof EXPERTISE_PERMISSION_SCOPES)[number][],
  );

const contributionPermissionSchema = z
  .object({
    status: z.enum(EXPERTISE_PERMISSION_STATUSES),
    scopes: permissionScopeSetSchema,
    grantedOn: calendarDateSchema,
    expiresOn: calendarDateSchema.nullable(),
    revokedOn: calendarDateSchema.nullable(),
    revocationReason: exactNonEmptyStringSchema.nullable(),
  })
  .strict()
  .superRefine((permission, context) => {
    if (
      (permission.revokedOn === null) !==
      (permission.revocationReason === null)
    ) {
      context.addIssue({
        code: "custom",
        path: ["revocationReason"],
        message:
          "revokedOn and revocationReason must both be set or both be null",
      });
    }

    if (
      permission.expiresOn !== null &&
      permission.expiresOn < permission.grantedOn
    ) {
      context.addIssue({
        code: "custom",
        path: ["expiresOn"],
        message: "must not be earlier than grantedOn",
      });
    }

    if (
      permission.revokedOn !== null &&
      permission.revokedOn < permission.grantedOn
    ) {
      context.addIssue({
        code: "custom",
        path: ["revokedOn"],
        message: "must not be earlier than grantedOn",
      });
    }

    if (permission.status === "revoked" && permission.revokedOn === null) {
      context.addIssue({
        code: "custom",
        path: ["revokedOn"],
        message: "is required when permission status is revoked",
      });
    }

    if (permission.status !== "revoked" && permission.revokedOn !== null) {
      context.addIssue({
        code: "custom",
        path: ["status"],
        message: "must be revoked when revocation details are present",
      });
    }
  });

const contributionPrivacySchema = z
  .object({
    level: z.enum(EXPERTISE_PRIVACY_LEVELS),
    categories: privacyCategoriesSchema,
  })
  .strict()
  .superRefine((privacy, context) => {
    if (privacy.level === "public" && privacy.categories.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["categories"],
        message: "public contributions cannot retain confidential categories",
      });
    }
  });

const dateRangeSchema = z
  .object({
    start: calendarDateSchema,
    end: calendarDateSchema,
  })
  .strict()
  .superRefine((range, context) => {
    if (range.start > range.end) {
      context.addIssue({
        code: "custom",
        path: ["end"],
        message: "must not be earlier than start",
      });
    }
  });

const expertiseReviewSchema = z
  .object({
    reviewId: reviewIdSchema,
    reviewerRef: reviewerRefSchema,
    decision: z.enum(EXPERTISE_REVIEW_DECISIONS),
    reviewedOn: calendarDateSchema,
    notes: exactNonEmptyStringSchema,
  })
  .strict();

const revocationSchema = z
  .object({
    revokedOn: calendarDateSchema.nullable(),
    reason: exactNonEmptyStringSchema.nullable(),
  })
  .strict()
  .superRefine((revocation, context) => {
    if ((revocation.revokedOn === null) !== (revocation.reason === null)) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "revokedOn and reason must both be set or both be null",
      });
    }
  });

const rawApprovedContributionSchema = z
  .object({
    version: z.literal(1),
    recordClass: z.enum(EXPERTISE_RECORD_CLASSES),
    publicUse: z.enum(EXPERTISE_PUBLIC_USE_POLICIES),
    contributionId: contributionIdSchema,
    interviewSessionRef: sessionIdSchema,
    boundedClaim: exactNonEmptyStringSchema,
    permittedClaimBoundary: exactNonEmptyStringSchema,
    claimKind: z.enum(EXPERTISE_CLAIM_KINDS),
    permission: contributionPermissionSchema,
    privacyClassification: contributionPrivacySchema,
    allowedAttribution: z
      .object({ mode: z.enum(EXPERTISE_ATTRIBUTION_MODES) })
      .strict(),
    supportedArticleIds: z
      .array(articleIdSchema)
      .min(1)
      .transform(dedupeAndSort),
    method: exactNonEmptyStringSchema,
    denominator: z.number().int().positive().nullable(),
    unit: exactNonEmptyStringSchema.nullable(),
    deduplication: exactNonEmptyStringSchema.nullable(),
    inclusionCriteria: canonicalStringSetSchema,
    exclusionCriteria: canonicalStringSetSchema,
    dateRange: dateRangeSchema.nullable(),
    missingData: exactNonEmptyStringSchema.nullable(),
    limitations: canonicalStringSetSchema.pipe(z.array(z.string()).min(1)),
    reviewDueDate: calendarDateSchema,
    revocation: revocationSchema,
    reviews: z
      .object({
        factual: expertiseReviewSchema,
        disclosure: expertiseReviewSchema,
      })
      .strict(),
    status: z.enum(EXPERTISE_CONTRIBUTION_STATUSES),
  })
  .strict()
  .superRefine((contribution, context) => {
    if (
      contribution.recordClass === "synthetic" &&
      contribution.publicUse !== "prohibited"
    ) {
      context.addIssue({
        code: "custom",
        path: ["publicUse"],
        message: "synthetic contributions must be non-public and prohibited",
      });
    }

    if (
      contribution.recordClass === "actual" &&
      contribution.publicUse !== "governed"
    ) {
      context.addIssue({
        code: "custom",
        path: ["publicUse"],
        message: "actual contributions must use the governed workflow",
      });
    }

    if (
      contribution.revocation.revokedOn !== null &&
      contribution.revocation.revokedOn < contribution.permission.grantedOn
    ) {
      context.addIssue({
        code: "custom",
        path: ["revocation", "revokedOn"],
        message: "must not be earlier than permission.grantedOn",
      });
    }

    if (
      contribution.reviewDueDate < contribution.reviews.factual.reviewedOn ||
      contribution.reviewDueDate < contribution.reviews.disclosure.reviewedOn
    ) {
      context.addIssue({
        code: "custom",
        path: ["reviewDueDate"],
        message: "must not be earlier than either review date",
      });
    }

    if (
      contribution.reviews.factual.reviewId ===
      contribution.reviews.disclosure.reviewId
    ) {
      context.addIssue({
        code: "custom",
        path: ["reviews", "disclosure", "reviewId"],
        message: "factual and disclosure reviews must be independent records",
      });
    }

    if (
      contribution.reviews.factual.reviewerRef ===
      contribution.reviews.disclosure.reviewerRef
    ) {
      context.addIssue({
        code: "custom",
        path: ["reviews", "disclosure", "reviewerRef"],
        message: "factual and disclosure reviews require independent reviewers",
      });
    }

    if (contribution.claimKind === "quantitative") {
      const requiredQuantitativeFields: ReadonlyArray<
        readonly [
          (
            | "denominator"
            | "unit"
            | "deduplication"
            | "dateRange"
            | "missingData"
          ),
          unknown,
        ]
      > = [
        ["denominator", contribution.denominator],
        ["unit", contribution.unit],
        ["deduplication", contribution.deduplication],
        ["dateRange", contribution.dateRange],
        ["missingData", contribution.missingData],
      ];

      for (const [field, value] of requiredQuantitativeFields) {
        if (value === null) {
          context.addIssue({
            code: "custom",
            path: [field],
            message: `is required for quantitative evidence`,
          });
        }
      }

      if (contribution.inclusionCriteria.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["inclusionCriteria"],
          message: "is required for quantitative evidence",
        });
      }

      if (contribution.exclusionCriteria.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["exclusionCriteria"],
          message: "is required for quantitative evidence",
        });
      }

      if (contribution.permission.status !== "permitted") {
        context.addIssue({
          code: "custom",
          path: ["permission", "status"],
          message: "must be permitted for quantitative evidence",
        });
      }
    }

    if (contribution.status === "approved") {
      if (contribution.permission.status !== "permitted") {
        context.addIssue({
          code: "custom",
          path: ["permission", "status"],
          message: "must be permitted before contribution status is approved",
        });
      }

      if (!contribution.permission.scopes.includes("public-claim")) {
        context.addIssue({
          code: "custom",
          path: ["permission", "scopes"],
          message:
            "must include public-claim before contribution status is approved",
        });
      }

      if (contribution.privacyClassification.level !== "public") {
        context.addIssue({
          code: "custom",
          path: ["privacyClassification", "level"],
          message: "must be public before contribution status is approved",
        });
      }

      if (
        contribution.reviews.factual.decision !== "approved" ||
        contribution.reviews.disclosure.decision !== "approved"
      ) {
        context.addIssue({
          code: "custom",
          path: ["reviews"],
          message: "factual and disclosure reviews must both be approved",
        });
      }
    }
  });

export const approvedContributionSchema =
  rawApprovedContributionSchema.transform((contribution) =>
    deepFreeze({
      ...contribution,
      permission: {
        ...contribution.permission,
        scopes: [...contribution.permission.scopes],
      },
      privacyClassification: {
        ...contribution.privacyClassification,
        categories: [...contribution.privacyClassification.categories],
      },
      allowedAttribution: { ...contribution.allowedAttribution },
      supportedArticleIds: [...contribution.supportedArticleIds],
      inclusionCriteria: [...contribution.inclusionCriteria],
      exclusionCriteria: [...contribution.exclusionCriteria],
      dateRange:
        contribution.dateRange === null ? null : { ...contribution.dateRange },
      limitations: [...contribution.limitations],
      revocation: { ...contribution.revocation },
      reviews: {
        factual: { ...contribution.reviews.factual },
        disclosure: { ...contribution.reviews.disclosure },
      },
    }),
  );

export type ApprovedContribution = z.infer<typeof approvedContributionSchema>;

export type InterviewSessionInput = z.input<typeof interviewSessionSchema>;
export type ApprovedContributionInput = z.input<
  typeof approvedContributionSchema
>;
