import { z } from "zod";

import { clusterIdSchema } from "../clusterSchema";
import { canonicalizeArticleUpgradeManifest, deepFreeze } from "./canonical";
import { ARTICLE_UPGRADE_SCHEMA_VERSION } from "./types";
import type {
  ArticleUpgradeEvaluationContext,
  ArticleUpgradeManifestInput,
  Sha256Digest,
} from "./types";

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const RFC3339_PATTERN =
  /^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
const MACHINE_ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const INTERNAL_ROUTE_PATTERN =
  /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isCalendarDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const days = [
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
    year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
  );
}

export const articleUpgradeDateSchema = z
  .string()
  .trim()
  .refine(isCalendarDate, "Expected a real YYYY-MM-DD calendar date.");

function normalizeEvaluationDate(value: string): string | null {
  if (isCalendarDate(value)) return value;
  const match = RFC3339_PATTERN.exec(value);
  if (
    !match ||
    !isCalendarDate(match[1]) ||
    !Number.isFinite(Date.parse(value))
  ) {
    return null;
  }
  return match[1];
}

const articleUpgradeEvaluationDateSchema = z
  .string()
  .trim()
  .refine(
    (value) => normalizeEvaluationDate(value) !== null,
    "Expected a real YYYY-MM-DD calendar date or valid RFC3339 timestamp.",
  )
  .transform((value) => normalizeEvaluationDate(value) as string);

export const articleUpgradeEvaluationContextSchema = z
  .object({
    today: articleUpgradeEvaluationDateSchema,
    environment: z.enum(["test", "production"]),
    dataMode: z.enum(["actual", "synthetic_fixture", "dry_run"]).optional(),
  })
  .strict() as z.ZodType<ArticleUpgradeEvaluationContext>;

export const articleUpgradeDigestSchema = z
  .string()
  .trim()
  .regex(
    SHA256_PATTERN,
    "Expected a lowercase sha256: digest.",
  ) as z.ZodType<Sha256Digest>;

const nullableDigestSchema = articleUpgradeDigestSchema.nullable();
const nullableDateSchema = articleUpgradeDateSchema.nullable();
const nonEmptyTextSchema = z.string().trim().min(1);
const nullableTextSchema = nonEmptyTextSchema.nullable();
const machineIdSchema = nonEmptyTextSchema.regex(
  MACHINE_ID_PATTERN,
  "Expected a lowercase machine-readable ID.",
);
const nullableMachineIdSchema = machineIdSchema.nullable();
const internalRouteSchema = nonEmptyTextSchema.regex(
  INTERNAL_ROUTE_PATTERN,
  "Expected an internal route without query parameters or fragments.",
);
const nullableInternalRouteSchema = internalRouteSchema.nullable();
const provenanceSchema = z.enum(["live", "synthetic-fixture"]);
const gateStatusSchema = z.enum(["pending", "passed", "failed"]);
const approvalStatusSchema = z.enum(["pending", "approved", "rejected"]);
const rankSchema = z.number().int().min(1).max(10);
const ticketIdSchema = z.enum([
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
]);

const ownerSchema = z
  .object({
    id: machineIdSchema,
    kind: z.enum(["human", "test-fixture"]),
  })
  .strict();

const targetSchema = z
  .object({
    articleId: machineIdSchema,
    url: internalRouteSchema,
  })
  .strict();

const sourceSnapshotSchema = z
  .object({
    digest: articleUpgradeDigestSchema,
    capturedAt: articleUpgradeDateSchema,
    provenance: provenanceSchema,
  })
  .strict();

const gateAttestationSchema = z
  .object({
    status: gateStatusSchema,
    evidenceDigest: nullableDigestSchema,
    checkedAt: nullableDateSchema,
    provenance: provenanceSchema,
  })
  .strict();

const ledgerGateSchema = z
  .object({
    status: gateStatusSchema,
    currentDigest: nullableDigestSchema,
    approvedDigest: nullableDigestSchema,
    checkedAt: nullableDateSchema,
    provenance: provenanceSchema,
  })
  .strict();

const evidenceGateSchema = z
  .object({
    status: gateStatusSchema,
    packageDigest: nullableDigestSchema,
    reportDigest: nullableDigestSchema,
    checkedAt: nullableDateSchema,
    provenance: provenanceSchema,
  })
  .strict();

const opportunityLockSchema = z
  .object({
    status: z.enum(["unlocked", "locked"]),
    opportunityId: nullableMachineIdSchema,
    rank: rankSchema.nullable(),
    cluster: clusterIdSchema.nullable(),
    targetUrl: nullableInternalRouteSchema,
    opportunityDigest: nullableDigestSchema,
    briefDigest: nullableDigestSchema,
    rankingEvidenceDigest: nullableDigestSchema,
    lockedAt: nullableDateSchema,
    provenance: provenanceSchema,
  })
  .strict();

const verificationShape = {
  status: gateStatusSchema,
  evidenceDigest: nullableDigestSchema,
  verifiedAt: nullableDateSchema,
  explanation: nullableTextSchema,
  provenance: provenanceSchema,
};

const answerPassageSchema = z
  .object({ ...verificationShape, passageRef: nullableTextSchema })
  .strict();

const faqSchema = z
  .object({
    ...verificationShape,
    visibleStatus: z.enum(["unreviewed", "visible", "not-applicable"]),
    eligibility: z.enum(["unreviewed", "eligible", "ineligible"]),
    schemaPlanned: z.boolean(),
  })
  .strict();

const internalLinksSchema = z
  .object({
    ...verificationShape,
    graphDigest: nullableDigestSchema,
    targets: z
      .object({
        pillar: nullableInternalRouteSchema,
        sibling: nullableInternalRouteSchema,
        service: nullableInternalRouteSchema,
        nextStep: nullableInternalRouteSchema,
      })
      .strict(),
  })
  .strict();

const expertEvidenceSchema = z
  .object({
    ...verificationShape,
    contributionId: nullableMachineIdSchema,
    contributionDigest: nullableDigestSchema,
    sourceKind: z.enum(["expert", "first-party", "both"]).nullable(),
  })
  .strict();

const mobileReviewSchema = z
  .object({
    ...verificationShape,
    desktopPassed: z.boolean().nullable(),
    mobilePassed: z.boolean().nullable(),
  })
  .strict();

const metadataSchema = z
  .object({
    ...verificationShape,
    metadataEligible: z.boolean().nullable(),
    articleSchemaEligible: z.boolean().nullable(),
    faqSchemaEligible: z.boolean().nullable(),
  })
  .strict();

const approvalSchema = z
  .object({
    status: approvalStatusSchema,
    approvalId: nullableMachineIdSchema,
    actorId: nullableMachineIdSchema,
    approvedAt: nullableDateSchema,
    subjectDigest: nullableDigestSchema,
    provenance: provenanceSchema,
  })
  .strict();

const attributionSchema = z
  .object({
    mode: z.literal("declarative-metadata-only"),
    contractRef: nullableTextSchema,
    allowlistRef: nullableTextSchema,
    campaign: nullableMachineIdSchema,
    cluster: clusterIdSchema.nullable(),
    contentId: nullableMachineIdSchema,
    trackingParameters: z.null({
      error:
        "Tracking parameters are forbidden until an approved attribution contract exists.",
    }),
    approval: approvalSchema,
  })
  .strict();

const claimSchema = z
  .object({
    id: machineIdSchema,
    kind: z.enum(["ranking", "causal"]),
    statement: nonEmptyTextSchema,
    evidenceDigest: nullableDigestSchema,
    asOf: articleUpgradeDateSchema,
    provenance: provenanceSchema,
  })
  .strict();

const observationSchema = z
  .object({
    key: z.enum([
      "search-position",
      "search-clicks",
      "search-impressions",
      "conversions",
    ]),
    status: z.enum(["unavailable", "observed", "synthetic-fixture"]),
    value: z.number().finite().nonnegative().nullable(),
    sourceDigest: nullableDigestSchema,
    observedAt: nullableDateSchema,
  })
  .strict()
  .superRefine((observation, context) => {
    if (
      observation.status === "unavailable" &&
      (observation.value !== null ||
        observation.sourceDigest !== null ||
        observation.observedAt !== null)
    ) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message:
          "Unavailable observations require null value, sourceDigest, and observedAt.",
      });
    }
    if (
      observation.status !== "unavailable" &&
      (observation.value === null ||
        observation.sourceDigest === null ||
        observation.observedAt === null)
    ) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message:
          "Observed and synthetic observations require value, sourceDigest, and observedAt.",
      });
    }
    if (observation.key === "search-position" && observation.value === 0) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message:
          "Search position must be null when unavailable or at least 1 when observed.",
      });
    }
  });

const ticketSchema = z
  .object({
    ticketId: ticketIdSchema,
    rank: rankSchema,
    cluster: clusterIdSchema.nullable(),
    target: targetSchema.nullable(),
    owner: ownerSchema.nullable(),
    asOf: articleUpgradeDateSchema,
    provenance: provenanceSchema,
    source: z
      .object({
        baseline: sourceSnapshotSchema.nullable(),
        current: sourceSnapshotSchema.nullable(),
      })
      .strict(),
    opportunityLock: opportunityLockSchema,
    dependencies: z
      .object({
        strictCutover: gateAttestationSchema,
        migrationLedger: ledgerGateSchema,
        evidenceGate: evidenceGateSchema,
      })
      .strict(),
    requirements: z
      .object({
        answerPassage: answerPassageSchema,
        faq: faqSchema,
        internalLinks: internalLinksSchema,
        expertEvidence: expertEvidenceSchema,
        mobileReview: mobileReviewSchema,
        metadataSchema,
      })
      .strict(),
    attribution: attributionSchema,
    approvals: z
      .object({ content: approvalSchema, release: approvalSchema })
      .strict(),
    claims: z.array(claimSchema),
    observations: z.array(observationSchema),
  })
  .strict();

export const articleUpgradeManifestSchema = z
  .object({
    version: z.literal(ARTICLE_UPGRADE_SCHEMA_VERSION),
    asOf: articleUpgradeDateSchema,
    provenance: provenanceSchema,
    tickets: z.array(ticketSchema),
  })
  .strict();

export function parseArticleUpgradeManifest(
  input: unknown,
): ArticleUpgradeManifestInput {
  const parsed = articleUpgradeManifestSchema.parse(
    input,
  ) as ArticleUpgradeManifestInput;
  return deepFreeze(canonicalizeArticleUpgradeManifest(parsed));
}
