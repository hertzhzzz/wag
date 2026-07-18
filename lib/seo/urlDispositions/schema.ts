import { z } from "zod";

export const URL_DISPOSITION_SCHEMA_VERSION = 1 as const;
export const URL_DISPOSITION_ACTIONS = [
  "keep",
  "merge",
  "redirect",
  "retire",
  "canonical",
] as const;
export const URL_DISPOSITION_PREREQUISITE_TICKETS = [
  "13",
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
] as const;

export type UrlDispositionAction = (typeof URL_DISPOSITION_ACTIONS)[number];
export type Sha256Digest = `sha256:${string}`;

const MACHINE_ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const LEDGER_DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const UTC_TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
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
  return days[month - 1] ?? 0;
}

export function isAbsoluteUtcTimestamp(value: string): boolean {
  const match = UTC_TIMESTAMP_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);

  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59 &&
    second >= 0 &&
    second <= 59
  );
}

const trimmedTextSchema = z.string().trim();
const nonEmptyTextSchema = trimmedTextSchema.min(1);
const machineIdSchema = nonEmptyTextSchema.regex(
  MACHINE_ID_PATTERN,
  "Expected a lowercase machine-readable ID.",
);
const routeSchema = trimmedTextSchema;
const nullableRouteSchema = routeSchema.nullable();
const timestampSchema = nonEmptyTextSchema.refine(isAbsoluteUtcTimestamp, {
  message: "Expected an absolute UTC ISO-8601 timestamp with milliseconds.",
});
const sha256DigestSchema = nonEmptyTextSchema.regex(
  SHA256_PATTERN,
  "Expected a lowercase sha256: digest.",
) as z.ZodType<Sha256Digest>;

export const traceEvidenceSchema = z
  .object({
    id: machineIdSchema,
    origin: z.enum(["production", "fixture"]),
    public: z.boolean(),
    source: nonEmptyTextSchema,
    capturedAt: timestampSchema,
    digest: sha256DigestSchema,
  })
  .strict()
  .superRefine((evidence, context) => {
    if (evidence.origin === "fixture" && evidence.public) {
      context.addIssue({
        code: "custom",
        path: ["public"],
        message: "Fixture evidence must be explicitly non-public.",
      });
    }
    if (evidence.origin === "production" && !evidence.public) {
      context.addIssue({
        code: "custom",
        path: ["public"],
        message: "Production evidence must be explicitly public.",
      });
    }
  });

export type TraceEvidence = z.infer<typeof traceEvidenceSchema>;

export const urlProbeEvidenceSchema = z
  .object({
    url: routeSchema,
    status: z.enum(["live", "redirect", "retired", "missing", "unknown"]),
    httpStatus: z.number().int().min(100).max(599).nullable(),
    redirectTarget: nullableRouteSchema,
    hopCount: z.number().int().min(0).max(100).nullable(),
    soft404: z.enum(["no", "yes", "unknown"]),
    canonical: nullableRouteSchema,
    evidence: traceEvidenceSchema,
  })
  .strict();

export type UrlProbeEvidence = z.infer<typeof urlProbeEvidenceSchema>;

const surfacePlanSchema = z
  .object({
    plannedFinalDestination: nullableRouteSchema,
    evidence: traceEvidenceSchema,
  })
  .strict();

const destinationSurfacesSchema = z
  .object({
    internalLinks: surfacePlanSchema,
    canonicals: surfacePlanSchema,
    sitemap: surfacePlanSchema,
    breadcrumbs: surfacePlanSchema,
    structuredData: surfacePlanSchema,
  })
  .strict();

const equityAssessmentSchema = z
  .object({
    state: z.enum(["present", "none", "unknown"]),
    preservationDestination: nullableRouteSchema,
    plan: trimmedTextSchema,
    evidence: traceEvidenceSchema,
  })
  .strict();

const equityPlanSchema = z
  .object({
    uniqueContent: equityAssessmentSchema,
    backlinkEquity: equityAssessmentSchema,
  })
  .strict();

const rollbackPlanSchema = z
  .object({
    note: trimmedTextSchema,
    conditions: z.array(trimmedTextSchema),
    evidence: traceEvidenceSchema,
  })
  .strict();

const ownerSchema = z
  .object({
    id: machineIdSchema,
    type: z.literal("human"),
  })
  .strict();

const commonRecordShape = {
  id: machineIdSchema,
  bundleId: machineIdSchema,
  rationale: trimmedTextSchema,
  owner: ownerSchema,
  source: routeSchema,
  sourceProbe: urlProbeEvidenceSchema,
  surfaces: destinationSurfacesSchema,
  equity: equityPlanSchema,
  rollback: rollbackPlanSchema,
};

const keepRecordSchema = z
  .object({
    ...commonRecordShape,
    action: z.literal("keep"),
    destination: z.null(),
    transition: z.object({ kind: z.literal("keep") }).strict(),
    destinationProbe: z.null(),
  })
  .strict();

const redirectTransitionSchema = z
  .object({
    kind: z.literal("redirect"),
    statusCode: z.number().int().min(300).max(399),
    target: routeSchema,
    hopCount: z.number().int().min(0).max(100),
  })
  .strict();

const mergeRecordSchema = z
  .object({
    ...commonRecordShape,
    action: z.literal("merge"),
    destination: routeSchema,
    transition: redirectTransitionSchema,
    destinationProbe: urlProbeEvidenceSchema,
  })
  .strict();

const redirectRecordSchema = z
  .object({
    ...commonRecordShape,
    action: z.literal("redirect"),
    destination: routeSchema,
    transition: redirectTransitionSchema,
    destinationProbe: urlProbeEvidenceSchema,
  })
  .strict();

const retireRecordSchema = z
  .object({
    ...commonRecordShape,
    action: z.literal("retire"),
    destination: z.null(),
    transition: z
      .object({
        kind: z.literal("retire"),
        statusCode: z.number().int().min(400).max(499),
      })
      .strict(),
    destinationProbe: z.null(),
  })
  .strict();

const canonicalRecordSchema = z
  .object({
    ...commonRecordShape,
    action: z.literal("canonical"),
    destination: routeSchema,
    transition: z
      .object({
        kind: z.literal("canonical"),
        target: routeSchema,
      })
      .strict(),
    destinationProbe: urlProbeEvidenceSchema,
  })
  .strict();

export const urlDispositionPlanRecordSchema = z.discriminatedUnion("action", [
  keepRecordSchema,
  mergeRecordSchema,
  redirectRecordSchema,
  retireRecordSchema,
  canonicalRecordSchema,
]);

export type UrlDispositionPlanRecord = z.infer<
  typeof urlDispositionPlanRecordSchema
>;

const ledgerGateSchema = z
  .object({
    status: z.enum(["approval-required", "invalid", "valid"]),
    locked: z.boolean(),
    digest: nonEmptyTextSchema.regex(
      LEDGER_DIGEST_PATTERN,
      "Expected a lowercase ledger sha256 digest.",
    ),
    evidence: traceEvidenceSchema,
  })
  .strict();

const prerequisiteTicketSchema = z
  .object({
    ticketId: z.enum(URL_DISPOSITION_PREREQUISITE_TICKETS),
    status: z.enum(["complete", "pending", "blocked"]),
    evidence: traceEvidenceSchema,
  })
  .strict();

const governanceGateSchema = z
  .object({
    ledger: ledgerGateSchema,
    prerequisiteTickets: z.array(prerequisiteTicketSchema),
  })
  .strict();

const unaffectedUrlSchema = z
  .object({
    url: routeSchema,
    expectedCanonical: routeSchema,
    probe: urlProbeEvidenceSchema,
  })
  .strict();

const unaffectedReportSchema = z
  .object({
    baselineUrls: z.array(routeSchema),
    inventoryEvidence: traceEvidenceSchema,
    unchanged: z.array(unaffectedUrlSchema),
    reportEvidence: traceEvidenceSchema,
  })
  .strict();

export const urlDispositionPlanSchema = z
  .object({
    version: z.literal(URL_DISPOSITION_SCHEMA_VERSION),
    scopeId: machineIdSchema,
    preparedAt: timestampSchema,
    governance: governanceGateSchema,
    records: z.array(urlDispositionPlanRecordSchema),
    unaffectedReport: unaffectedReportSchema,
  })
  .strict();

export type UrlDispositionPlanInput = z.infer<typeof urlDispositionPlanSchema>;

const dispositionApprovalSchema = z
  .object({
    dispositionId: machineIdSchema,
    approver: ownerSchema,
    approvedAt: timestampSchema,
    artifactDigest: sha256DigestSchema,
  })
  .strict();

const releaseApprovalSchema = z
  .object({
    kind: z.enum(["content", "production"]),
    actor: ownerSchema,
    approvedAt: timestampSchema,
    releaseId: machineIdSchema,
    artifactDigest: sha256DigestSchema,
    reportDigest: sha256DigestSchema,
  })
  .strict();

export const urlDispositionReleaseContractSchema = z
  .object({
    version: z.literal(1),
    state: z.enum([
      "draft",
      "validated",
      "preview_ready",
      "content_approved",
      "production_approved",
      "deployed",
      "live_verified",
    ]),
    releaseId: machineIdSchema,
    artifactDigest: sha256DigestSchema,
    reportDigest: sha256DigestSchema,
    contentApproval: releaseApprovalSchema,
    productionApproval: releaseApprovalSchema,
  })
  .strict();

export type UrlDispositionReleaseContract = z.infer<
  typeof urlDispositionReleaseContractSchema
>;

export const urlDispositionPreflightInputSchema = z
  .object({
    asOf: timestampSchema,
    plan: urlDispositionPlanSchema,
    approvals: z.array(dispositionApprovalSchema),
    releaseContract: urlDispositionReleaseContractSchema.nullable(),
  })
  .strict();

export type UrlDispositionPreflightInput = z.infer<
  typeof urlDispositionPreflightInputSchema
>;

const urlDispositionReportDigestSchema = z
  .string()
  .regex(
    SHA256_PATTERN,
    "Expected a lowercase sha256: digest.",
  ) as z.ZodType<Sha256Digest>;

export const urlDispositionPreflightReportSchema = z
  .object({
    version: z.literal(1),
    asOf: timestampSchema.nullable(),
    status: z.enum(["blocked", "split_required", "approved_for_preflight"]),
    artifactDigest: sha256DigestSchema.nullable(),
    reportDigest: urlDispositionReportDigestSchema,
    scope: z
      .object({
        scopeId: machineIdSchema.nullable(),
        dispositionIds: z.array(machineIdSchema),
        sourceUrls: z.array(routeSchema),
        sourceCount: z.number().int().nonnegative(),
        destinationBundles: z.array(machineIdSchema),
      })
      .strict(),
    blockers: z.array(
      z
        .object({
          code: nonEmptyTextSchema,
          path: nonEmptyTextSchema,
          message: nonEmptyTextSchema,
          dispositionIds: z.array(machineIdSchema),
        })
        .strict(),
    ),
    dispositions: z.array(
      z
        .object({
          id: machineIdSchema,
          bundleId: machineIdSchema,
          action: z.enum(URL_DISPOSITION_ACTIONS),
          source: routeSchema,
          destination: routeSchema.nullable(),
          finalDestination: routeSchema.nullable(),
          status: z.enum(["validated", "blocked"]),
          blockerCodes: z.array(nonEmptyTextSchema),
        })
        .strict(),
    ),
    unaffectedUrls: z
      .object({
        status: z.enum(["satisfied", "blocked"]),
        expected: z.array(routeSchema),
        reported: z.array(routeSchema),
        missing: z.array(routeSchema),
        unexpected: z.array(routeSchema),
        conflicts: z.array(routeSchema),
      })
      .strict(),
    releaseGate: z
      .object({
        status: z.enum(["satisfied", "blocked"]),
        releaseId: machineIdSchema.nullable(),
        artifactDigest: sha256DigestSchema.nullable(),
        contentApprover: machineIdSchema.nullable(),
        productionApprover: machineIdSchema.nullable(),
        verifiedReportDigest: sha256DigestSchema.nullable(),
      })
      .strict(),
    productionExecution: z
      .object({
        supported: z.literal(false),
        allowed: z.literal(false),
        reason: nonEmptyTextSchema,
      })
      .strict(),
  })
  .strict();
