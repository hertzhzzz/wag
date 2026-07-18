import { z } from "zod";
import { CANONICAL_CLUSTER_IDS, type ClusterId } from "../clusterSchema";
import {
  DESTRUCTIVE_ACTION_GATE_IDS,
  DESTRUCTIVE_ACTION_SCHEMA_VERSION,
  OPPORTUNITY_AS_OF_BOUNDARY,
  OPPORTUNITY_BRIEF_SCHEMA_VERSION,
  OPPORTUNITY_FACTORS,
  OPPORTUNITY_FRESHNESS_POLICY,
  OPPORTUNITY_FRESHNESS_POLICY_VERSION,
  OPPORTUNITY_QUEUE_SCHEMA_VERSION,
  OPPORTUNITY_SCORING_VERSION,
} from "./constants";
import { cloneDestructiveActionInput } from "./destructive";
import {
  assertIsoDate,
  cloneRawValue,
  compareUnicodeCodePoints,
  deepFreeze,
  differenceInCalendarDays,
  roundDeterministic,
  sortCodePoints,
} from "./deterministic";
import type {
  DestructiveActionEvaluation,
  DestructiveActionInput,
  OpportunityBriefInput,
  OpportunityCandidateInput,
  OpportunityDataStatus,
  OpportunityFactorInput,
  OpportunityGateInput,
  OpportunityHardGateId,
  OpportunityQueueInput,
  OpportunityQueueReport,
  OpportunityRawValue,
  OpportunityRuntimeSchema,
  ProvisionalOpportunityBrief,
  RankedOpportunity,
  ScoredOpportunity,
} from "./types";

export const OPPORTUNITY_HARD_GATE_IDS = deepFreeze([
  "service-relevance",
  "evidence-readiness",
  "destination-resolved",
  "cannibalisation-reviewed",
  "reviewer-assigned",
] as const satisfies readonly OpportunityHardGateId[]);

export const OPPORTUNITY_DATA_STATUS_VALUES = deepFreeze([
  "observed",
  "static-snapshot",
  "synthetic-fixture",
  "missing",
  "not-applicable",
] as const satisfies readonly OpportunityDataStatus[]);

const candidateKeys = [
  "id",
  "taskType",
  "cluster",
  "intendedDestination",
  "reviewer",
  "factors",
  "gates",
  "brief",
  "destructiveAction",
] as const;
const factorKeys = [
  "raw",
  "normalized",
  "sourceRef",
  "observedAt",
  "dataStatus",
  "confidence",
  "missingReason",
] as const;
const gateKeys = ["status", "reason", "sourceRef"] as const;
const briefKeys = [
  "targetIntent",
  "readerOutcome",
  "evidenceNeeds",
  "graphChanges",
  "conversionPath",
  "successMeasures",
] as const;
const humanApprovalKeys = ["actorType", "reviewer", "reviewedAt"] as const;
const destructiveActionKeys = [
  "action",
  "lowTrafficOnly",
  "gates",
  "humanApproval",
] as const;

function isPlainDataObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Reflect.ownKeys(value).every((key) => typeof key === "string") &&
    Object.getOwnPropertyNames(value).every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return descriptor !== undefined && "value" in descriptor;
    })
  );
}

function assertStrictData(value: unknown, field: string): void {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${field} must not contain a non-finite number.`);
    }
    return;
  }
  if (Array.isArray(value)) {
    if (Object.getPrototypeOf(value) !== Array.prototype) {
      throw new TypeError(`${field} must use the intrinsic array prototype.`);
    }
    if (Reflect.ownKeys(value).some((key) => typeof key !== "string")) {
      throw new TypeError(`${field} must not contain symbol keys.`);
    }
    const names = Object.getOwnPropertyNames(value);
    const expected = new Set([
      "length",
      ...Array.from({ length: value.length }, (_, index) => String(index)),
    ]);
    if (
      names.length !== expected.size ||
      names.some((name) => !expected.has(name))
    ) {
      throw new TypeError(`${field} must be a dense array without extra keys.`);
    }
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || !("value" in descriptor)) {
        throw new TypeError(`${field}[${index}] must be a data property.`);
      }
      assertStrictData(descriptor.value, `${field}[${index}]`);
    }
    return;
  }
  if (!isPlainDataObject(value)) {
    throw new TypeError(`${field} must be a strict plain-data object.`);
  }
  for (const key of Object.getOwnPropertyNames(value)) {
    assertStrictData(value[key], `${field}.${key}`);
  }
}

function assertExactKeys(
  value: unknown,
  expected: readonly string[],
  field: string,
): asserts value is Record<string, unknown> {
  assertStrictData(value, field);
  const actual = sortCodePoints(Object.getOwnPropertyNames(value as object));
  const sortedExpected = sortCodePoints(expected);
  if (
    actual.length !== sortedExpected.length ||
    actual.some((key, index) => key !== sortedExpected[index])
  ) {
    throw new TypeError(`${field} must contain exactly the fixed key set.`);
  }
}

function zDate(): z.ZodString {
  return z.string().refine((value) => {
    try {
      assertIsoDate(value);
      return true;
    } catch {
      return false;
    }
  }, "must be a valid ISO calendar date");
}

const taskTypeSchema = z.enum([
  "refresh",
  "new",
  "merge",
  "evidence",
  "internal-link",
]);
const clusterSchema = z.enum(CANONICAL_CLUSTER_IDS);
const dataStatusSchema = z.enum(OPPORTUNITY_DATA_STATUS_VALUES);
const gateSchema = z
  .object({
    status: z.enum(["pass", "pending", "fail"]),
    reason: z.string(),
    sourceRef: z.string().nullable(),
  })
  .strict();
const rawSchema = z.custom<OpportunityRawValue>((value) => {
  try {
    assertStrictData(value, "factor.raw");
    return true;
  } catch {
    return false;
  }
});
const factorSchema = z
  .object({
    raw: rawSchema,
    normalized: z.number().finite().nullable(),
    sourceRef: z.string().nullable(),
    observedAt: zDate().nullable(),
    dataStatus: dataStatusSchema,
    confidence: z.number().finite(),
    missingReason: z.string().nullable(),
  })
  .strict();
const briefSchema = z
  .object({
    targetIntent: z.string().nullable(),
    readerOutcome: z.string().nullable(),
    evidenceNeeds: z.array(z.string()),
    graphChanges: z.array(z.string()),
    conversionPath: z.string().nullable(),
    successMeasures: z.array(z.string()),
  })
  .strict();
const humanApprovalSchema = z
  .object({
    actorType: z.enum(["human", "automation", "service"]).nullable(),
    reviewer: z.string().nullable(),
    reviewedAt: zDate().nullable(),
  })
  .strict();
const destructiveActionSchema = z
  .object({
    action: z.enum(["merge", "redirect", "retire"]),
    lowTrafficOnly: z.boolean(),
    gates: z
      .object(
        Object.fromEntries(
          DESTRUCTIVE_ACTION_GATE_IDS.map((id) => [id, gateSchema]),
        ),
      )
      .strict(),
    humanApproval: humanApprovalSchema,
  })
  .strict();
const candidateSchema = z
  .object({
    id: z.string(),
    taskType: taskTypeSchema,
    cluster: clusterSchema,
    intendedDestination: z.string().nullable(),
    reviewer: z.string().nullable(),
    factors: z
      .object(
        Object.fromEntries(
          OPPORTUNITY_FACTORS.map(({ id }) => [id, factorSchema]),
        ),
      )
      .strict(),
    gates: z
      .object(
        Object.fromEntries(
          OPPORTUNITY_HARD_GATE_IDS.map((id) => [id, gateSchema]),
        ),
      )
      .strict(),
    brief: briefSchema,
    destructiveAction: destructiveActionSchema.nullable(),
  })
  .strict();
const queueInputSchema = z
  .object({
    asOfDate: zDate(),
    candidates: z.array(candidateSchema),
  })
  .strict();

const scoredFactorSchema = z
  .object({
    id: z.enum(
      OPPORTUNITY_FACTORS.map(({ id }) => id) as [
        (typeof OPPORTUNITY_FACTORS)[number]["id"],
        ...(typeof OPPORTUNITY_FACTORS)[number]["id"][],
      ],
    ),
    label: z.string(),
    raw: rawSchema,
    normalized: z.number().finite().nullable(),
    weight: z.number().finite(),
    contribution: z.number().finite(),
    sourceRef: z.string().nullable(),
    observedAt: zDate().nullable(),
    asOfDate: zDate(),
    ageDays: z.number().int().nonnegative().nullable(),
    freshnessStatus: z.enum([
      "fresh",
      "aging",
      "stale",
      "missing",
      "not-applicable",
    ]),
    freshnessMultiplier: z.number().finite(),
    dataStatus: dataStatusSchema,
    confidence: z.number().finite(),
    missingReason: z.string().nullable(),
    scoringVersion: z.literal(OPPORTUNITY_SCORING_VERSION),
    freshnessPolicyVersion: z.literal(OPPORTUNITY_FRESHNESS_POLICY_VERSION),
  })
  .strict();
const evaluationSchema = z
  .object({
    schemaVersion: z.literal(DESTRUCTIVE_ACTION_SCHEMA_VERSION),
    action: z.enum(["merge", "redirect", "retire"]),
    lowTrafficOnly: z.boolean(),
    asOfDate: zDate(),
    scoringVersion: z.literal(OPPORTUNITY_SCORING_VERSION),
    freshnessPolicyVersion: z.literal(OPPORTUNITY_FRESHNESS_POLICY_VERSION),
    status: z.enum(["blocked", "human-approved"]),
    destructiveActionAllowed: z.boolean(),
    automationAllowed: z.literal(false),
    lowTrafficAloneSufficient: z.literal(false),
    blockers: z.array(z.string()),
    gates: z
      .object(
        Object.fromEntries(
          DESTRUCTIVE_ACTION_GATE_IDS.map((id) => [id, gateSchema]),
        ),
      )
      .strict(),
    humanApproval: humanApprovalSchema,
  })
  .strict();
const scoredSchema = z
  .object({
    id: z.string(),
    taskType: taskTypeSchema,
    cluster: clusterSchema,
    intendedDestination: z.string().nullable(),
    reviewer: z.string().nullable(),
    asOfDate: zDate(),
    scoringVersion: z.literal(OPPORTUNITY_SCORING_VERSION),
    freshnessPolicyVersion: z.literal(OPPORTUNITY_FRESHNESS_POLICY_VERSION),
    finalScore: z.number().finite(),
    coverage: z.number().finite(),
    confidence: z.number().finite(),
    eligibilityStatus: z.enum(["eligible", "needs-research", "blocked"]),
    blockers: z.array(z.string()),
    researchReasons: z.array(z.string()),
    factors: z.array(scoredFactorSchema),
    gates: z
      .object(
        Object.fromEntries(
          OPPORTUNITY_HARD_GATE_IDS.map((id) => [id, gateSchema]),
        ),
      )
      .strict(),
    brief: briefSchema,
    destructiveAction: destructiveActionSchema.nullable(),
    destructiveActionEvaluation: evaluationSchema.nullable(),
  })
  .strict();
const rankedSchema = scoredSchema
  .extend({ rank: z.number().int().positive() })
  .strict();
const queueReportSchema = z
  .object({
    schemaVersion: z.literal(OPPORTUNITY_QUEUE_SCHEMA_VERSION),
    asOfDate: zDate(),
    scoringVersion: z.literal(OPPORTUNITY_SCORING_VERSION),
    freshnessPolicyVersion: z.literal(OPPORTUNITY_FRESHNESS_POLICY_VERSION),
    items: z.array(rankedSchema),
    selectedOpportunityId: z.string().nullable(),
    statusCounts: z
      .object({
        eligible: z.number().int().nonnegative(),
        "needs-research": z.number().int().nonnegative(),
        blocked: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict();
const provisionalBriefSchema = z
  .object({
    schemaVersion: z.literal(OPPORTUNITY_BRIEF_SCHEMA_VERSION),
    status: z.enum(["blocked", "needs-research"]),
    provenance: z.literal("candidate-inputs-only"),
    opportunityId: z.string(),
    taskType: taskTypeSchema,
    cluster: clusterSchema,
    intendedDestination: z.string().nullable(),
    reviewer: z.string().nullable(),
    reviewerRequirement: z
      .object({
        assignedReviewer: z.string().nullable(),
        realHumanRequired: z.literal(true),
        verified: z.literal(false),
      })
      .strict(),
    asOfDate: zDate(),
    scoringVersion: z.literal(OPPORTUNITY_SCORING_VERSION),
    freshnessPolicyVersion: z.literal(OPPORTUNITY_FRESHNESS_POLICY_VERSION),
    finalScore: z.number().finite(),
    eligibilityStatus: z.enum(["eligible", "needs-research", "blocked"]),
    blockers: z.array(z.string()),
    researchReasons: z.array(z.string()),
    missingRealInputs: z.array(z.string()),
    inputs: briefSchema,
    destructiveActionEvaluation: evaluationSchema.nullable(),
    draftingAllowed: z.literal(false),
    publishingAllowed: z.literal(false),
    draft: z.null(),
    publication: z.null(),
  })
  .strict();

function makeRuntimeSchema<T>(
  schema: z.ZodType,
  field: string,
  transform?: (value: T) => T,
  validate?: (value: T) => void,
): OpportunityRuntimeSchema<T> {
  return {
    parse(input: unknown): T {
      assertStrictData(input, field);
      const result = schema.safeParse(input);
      if (!result.success) {
        throw new TypeError(
          `${field} failed runtime schema validation: ${result.error.message}`,
        );
      }
      const parsed = result.data as T;
      validate?.(parsed);
      return transform ? transform(parsed) : parsed;
    },
    safeParse(input: unknown) {
      try {
        return { success: true, data: this.parse(input) };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof TypeError ? error : new TypeError(String(error)),
        };
      }
    },
  };
}

function cloneNullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string")
    throw new TypeError(`${field} must be a string or null.`);
  return value;
}

function cloneStringArray(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new TypeError(`${field} must be an array of strings.`);
  }
  return [...value];
}

function cloneGate(value: unknown, field: string): OpportunityGateInput {
  assertExactKeys(value, gateKeys, field);
  const gate = value as Record<string, unknown>;
  if (
    !(["pass", "pending", "fail"] as const).includes(
      gate.status as OpportunityGateInput["status"],
    )
  ) {
    throw new TypeError(`${field}.status is invalid.`);
  }
  if (typeof gate.reason !== "string")
    throw new TypeError(`${field}.reason must be a string.`);
  return {
    status: gate.status as OpportunityGateInput["status"],
    reason: gate.reason,
    sourceRef: cloneNullableString(gate.sourceRef, `${field}.sourceRef`),
  };
}

function cloneFactor(value: unknown, field: string): OpportunityFactorInput {
  assertExactKeys(value, factorKeys, field);
  const factor = value as Record<string, unknown>;
  if (
    !OPPORTUNITY_DATA_STATUS_VALUES.includes(
      factor.dataStatus as OpportunityDataStatus,
    )
  )
    throw new TypeError(`${field}.dataStatus is invalid.`);
  if (
    factor.normalized !== null &&
    (typeof factor.normalized !== "number" ||
      !Number.isFinite(factor.normalized))
  )
    throw new TypeError(`${field}.normalized must be a finite number or null.`);
  if (
    typeof factor.confidence !== "number" ||
    !Number.isFinite(factor.confidence)
  )
    throw new TypeError(`${field}.confidence must be a finite number.`);
  return {
    raw: cloneRawValue(factor.raw as OpportunityFactorInput["raw"]),
    normalized: factor.normalized as number | null,
    sourceRef: cloneNullableString(factor.sourceRef, `${field}.sourceRef`),
    observedAt: cloneNullableString(factor.observedAt, `${field}.observedAt`),
    dataStatus: factor.dataStatus as OpportunityDataStatus,
    confidence: factor.confidence,
    missingReason: cloneNullableString(
      factor.missingReason,
      `${field}.missingReason`,
    ),
  };
}

function cloneBrief(value: unknown): OpportunityBriefInput {
  assertExactKeys(value, briefKeys, "brief");
  const brief = value as Record<string, unknown>;
  return {
    targetIntent: cloneNullableString(brief.targetIntent, "brief.targetIntent"),
    readerOutcome: cloneNullableString(
      brief.readerOutcome,
      "brief.readerOutcome",
    ),
    evidenceNeeds: cloneStringArray(brief.evidenceNeeds, "brief.evidenceNeeds"),
    graphChanges: cloneStringArray(brief.graphChanges, "brief.graphChanges"),
    conversionPath: cloneNullableString(
      brief.conversionPath,
      "brief.conversionPath",
    ),
    successMeasures: cloneStringArray(
      brief.successMeasures,
      "brief.successMeasures",
    ),
  };
}

function cloneDestructiveAction(value: unknown): DestructiveActionInput | null {
  if (value === null) return null;
  assertExactKeys(value, destructiveActionKeys, "destructiveAction");
  const action = value as Record<string, unknown>;
  if (
    !(["merge", "redirect", "retire"] as const).includes(
      action.action as DestructiveActionInput["action"],
    )
  )
    throw new TypeError("destructiveAction.action is invalid.");
  if (typeof action.lowTrafficOnly !== "boolean")
    throw new TypeError("destructiveAction.lowTrafficOnly must be boolean.");
  assertExactKeys(
    action.gates,
    DESTRUCTIVE_ACTION_GATE_IDS,
    "destructiveAction.gates",
  );
  assertExactKeys(
    action.humanApproval,
    humanApprovalKeys,
    "destructiveAction.humanApproval",
  );
  const approval = action.humanApproval as Record<string, unknown>;
  if (
    !(
      approval.actorType === null ||
      ["human", "automation", "service"].includes(approval.actorType as string)
    )
  )
    throw new TypeError(
      "destructiveAction.humanApproval.actorType is invalid.",
    );
  return cloneDestructiveActionInput({
    action: action.action as DestructiveActionInput["action"],
    lowTrafficOnly: action.lowTrafficOnly,
    gates: Object.fromEntries(
      DESTRUCTIVE_ACTION_GATE_IDS.map((id) => [
        id,
        cloneGate(
          (action.gates as Record<string, unknown>)[id],
          `destructiveAction.gates.${id}`,
        ),
      ]),
    ) as DestructiveActionInput["gates"],
    humanApproval: {
      actorType:
        approval.actorType as DestructiveActionInput["humanApproval"]["actorType"],
      reviewer: cloneNullableString(
        approval.reviewer,
        "destructiveAction.humanApproval.reviewer",
      ),
      reviewedAt: cloneNullableString(
        approval.reviewedAt,
        "destructiveAction.humanApproval.reviewedAt",
      ),
    },
  });
}

function assertNonEmptyString(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }
}

function assertCanonicalInternalRoute(value: string, field: string): void {
  if (
    !/^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(value)
  ) {
    throw new TypeError(`${field} must be a canonical internal route.`);
  }
}

function assertGateSemantics(gate: OpportunityGateInput, field: string): void {
  assertNonEmptyString(gate.reason, `${field}.reason`);
  if (gate.status === "pass" && gate.sourceRef === null) {
    throw new TypeError(`${field} requires sourceRef when status is pass.`);
  }
  if (gate.sourceRef !== null) {
    assertNonEmptyString(gate.sourceRef, `${field}.sourceRef`);
  }
}

function validateCandidateSemantics(
  candidate: OpportunityCandidateInput,
): void {
  assertNonEmptyString(candidate.id, "opportunity candidate.id");
  if (candidate.intendedDestination !== null) {
    assertCanonicalInternalRoute(
      candidate.intendedDestination,
      "opportunity candidate.intendedDestination",
    );
  }
  if (candidate.reviewer !== null) {
    assertNonEmptyString(candidate.reviewer, "opportunity candidate.reviewer");
  }
  if (candidate.brief.conversionPath !== null) {
    assertCanonicalInternalRoute(
      candidate.brief.conversionPath,
      "opportunity candidate.brief.conversionPath",
    );
  }

  for (const definition of OPPORTUNITY_FACTORS) {
    const factor = candidate.factors[definition.id];
    if (factor.confidence < 0 || factor.confidence > 1) {
      throw new TypeError(
        `factors.${definition.id}.confidence must be between 0 and 1.`,
      );
    }
    const missing =
      factor.dataStatus === "missing" || factor.dataStatus === "not-applicable";
    if (missing) {
      if (
        factor.raw !== null ||
        factor.normalized !== null ||
        factor.sourceRef !== null ||
        factor.observedAt !== null ||
        factor.confidence !== 0 ||
        factor.missingReason === null
      ) {
        throw new TypeError(
          `factors.${definition.id} missing data must use null evidence fields, zero confidence, and a missingReason.`,
        );
      }
      assertNonEmptyString(
        factor.missingReason,
        `factors.${definition.id}.missingReason`,
      );
      continue;
    }
    if (
      factor.normalized === null ||
      factor.normalized < 0 ||
      factor.normalized > 100
    ) {
      throw new TypeError(
        `factors.${definition.id}.normalized must be between 0 and 100.`,
      );
    }
    if (factor.sourceRef === null || factor.observedAt === null) {
      throw new TypeError(
        `factors.${definition.id} observed data requires sourceRef and observedAt.`,
      );
    }
    assertNonEmptyString(
      factor.sourceRef,
      `factors.${definition.id}.sourceRef`,
    );
    if (factor.missingReason !== null) {
      throw new TypeError(
        `factors.${definition.id} observed data cannot provide missingReason.`,
      );
    }
  }

  for (const id of OPPORTUNITY_HARD_GATE_IDS) {
    assertGateSemantics(candidate.gates[id], `gates.${id}`);
  }
  if (candidate.destructiveAction !== null) {
    for (const id of DESTRUCTIVE_ACTION_GATE_IDS) {
      assertGateSemantics(
        candidate.destructiveAction.gates[id],
        `destructiveAction.gates.${id}`,
      );
    }
  }
}

function validateScoredSemantics(scored: ScoredOpportunity): void {
  assertNonEmptyString(scored.id, "scored opportunity.id");
  if (scored.intendedDestination !== null) {
    assertCanonicalInternalRoute(
      scored.intendedDestination,
      "scored opportunity.intendedDestination",
    );
  }
  if (scored.reviewer !== null) {
    assertNonEmptyString(scored.reviewer, "scored opportunity.reviewer");
  }
  if (scored.brief.conversionPath !== null) {
    assertCanonicalInternalRoute(
      scored.brief.conversionPath,
      "scored opportunity.brief.conversionPath",
    );
  }
  if (
    scored.gates["destination-resolved"].status === "pass" &&
    scored.intendedDestination === null
  ) {
    throw new TypeError(
      "scored opportunity passing destination gate requires a destination.",
    );
  }
  if (
    scored.gates["reviewer-assigned"].status === "pass" &&
    scored.reviewer === null
  ) {
    throw new TypeError(
      "scored opportunity passing reviewer gate requires a reviewer.",
    );
  }

  if (scored.factors.length !== OPPORTUNITY_FACTORS.length) {
    throw new TypeError("scored opportunity must contain exactly six factors.");
  }
  let expectedScore = 0;
  let expectedCoverageWeight = 0;
  let expectedConfidenceWeight = 0;
  let hasSyntheticFixture = false;
  let hasActualEvidence = false;
  OPPORTUNITY_FACTORS.forEach((definition, index) => {
    const factor = scored.factors[index];
    if (
      factor.id !== definition.id ||
      factor.label !== definition.label ||
      factor.weight !== definition.weight
    ) {
      throw new TypeError(
        `scored opportunity factor identity drift at ${definition.id}.`,
      );
    }
    if (factor.asOfDate !== scored.asOfDate) {
      throw new TypeError(
        `scored opportunity factor ${definition.id} asOfDate drift.`,
      );
    }
    if (factor.confidence < 0 || factor.confidence > 1) {
      throw new TypeError(
        `scored opportunity factor ${definition.id} confidence drift.`,
      );
    }
    if (
      factor.dataStatus === "observed" ||
      factor.dataStatus === "static-snapshot"
    ) {
      hasActualEvidence = true;
    }
    if (factor.dataStatus === "synthetic-fixture") {
      hasSyntheticFixture = true;
    }
    const missing =
      factor.dataStatus === "missing" || factor.dataStatus === "not-applicable";
    if (missing) {
      if (
        factor.raw !== null ||
        factor.normalized !== null ||
        factor.sourceRef !== null ||
        factor.observedAt !== null ||
        factor.ageDays !== null ||
        factor.contribution !== 0 ||
        factor.freshnessMultiplier !== 0 ||
        factor.confidence !== 0 ||
        factor.missingReason === null ||
        factor.freshnessStatus !== factor.dataStatus
      ) {
        throw new TypeError(
          `scored opportunity factor ${definition.id} missing-data trace drift.`,
        );
      }
      assertNonEmptyString(
        factor.missingReason,
        `scored opportunity factor ${definition.id}.missingReason`,
      );
      return;
    }
    if (
      factor.normalized === null ||
      factor.normalized < 0 ||
      factor.normalized > 100 ||
      factor.sourceRef === null ||
      factor.observedAt === null ||
      factor.ageDays === null ||
      factor.missingReason !== null
    ) {
      throw new TypeError(
        `scored opportunity factor ${definition.id} observed-data trace drift.`,
      );
    }
    assertNonEmptyString(
      factor.sourceRef,
      `scored opportunity factor ${definition.id}.sourceRef`,
    );
    const expectedAge = differenceInCalendarDays(
      factor.observedAt,
      scored.asOfDate,
    );
    if (expectedAge < 0 || factor.ageDays !== expectedAge) {
      throw new TypeError(
        `scored opportunity factor ${definition.id} age trace drift.`,
      );
    }
    const expectedFreshness =
      expectedAge <= OPPORTUNITY_FRESHNESS_POLICY.fresh.maximumAgeDays
        ? {
            status: "fresh" as const,
            multiplier: OPPORTUNITY_FRESHNESS_POLICY.fresh.multiplier,
          }
        : expectedAge <= OPPORTUNITY_FRESHNESS_POLICY.aging.maximumAgeDays
          ? {
              status: "aging" as const,
              multiplier: OPPORTUNITY_FRESHNESS_POLICY.aging.multiplier,
            }
          : {
              status: "stale" as const,
              multiplier: OPPORTUNITY_FRESHNESS_POLICY.stale.multiplier,
            };
    if (
      factor.freshnessStatus !== expectedFreshness.status ||
      factor.freshnessMultiplier !== expectedFreshness.multiplier
    ) {
      throw new TypeError(
        `scored opportunity factor ${definition.id} freshness trace drift.`,
      );
    }
    const expectedContribution = roundDeterministic(
      (definition.weight * factor.normalized * expectedFreshness.multiplier) /
        100,
    );
    if (factor.contribution !== expectedContribution) {
      throw new TypeError(
        `scored opportunity factor ${definition.id} contribution drift.`,
      );
    }
    expectedScore += expectedContribution;
    expectedCoverageWeight += definition.weight;
    expectedConfidenceWeight +=
      definition.weight * factor.confidence * expectedFreshness.multiplier;
  });

  if (scored.asOfDate > OPPORTUNITY_AS_OF_BOUNDARY) {
    if (hasActualEvidence) {
      throw new TypeError(
        `actual scored opportunity cannot use future asOfDate after ${OPPORTUNITY_AS_OF_BOUNDARY}.`,
      );
    }
    if (!hasSyntheticFixture) {
      throw new TypeError(
        "future scored opportunity requires an explicit synthetic-fixture marker.",
      );
    }
  }
  for (const factor of scored.factors) {
    if (
      (factor.dataStatus === "observed" ||
        factor.dataStatus === "static-snapshot") &&
      factor.observedAt !== null &&
      factor.observedAt > OPPORTUNITY_AS_OF_BOUNDARY
    ) {
      throw new TypeError(
        `actual scored opportunity factor ${factor.id} contains future evidence after ${OPPORTUNITY_AS_OF_BOUNDARY}.`,
      );
    }
  }
  const reviewedAt = scored.destructiveAction?.humanApproval.reviewedAt;
  if (reviewedAt !== null && reviewedAt !== undefined) {
    if (reviewedAt > OPPORTUNITY_AS_OF_BOUNDARY) {
      throw new TypeError(
        `scored opportunity contains future human approval evidence after ${OPPORTUNITY_AS_OF_BOUNDARY}.`,
      );
    }
  }
  if (
    scored.destructiveActionEvaluation !== null &&
    scored.destructiveActionEvaluation.asOfDate !== scored.asOfDate
  ) {
    throw new TypeError(
      "scored opportunity destructive evaluation asOfDate drift.",
    );
  }

  const roundedScore = roundDeterministic(expectedScore);
  const expectedCoverage = roundDeterministic(expectedCoverageWeight / 100);
  const expectedConfidence = roundDeterministic(expectedConfidenceWeight / 100);
  if (
    scored.finalScore !== roundedScore ||
    scored.coverage !== expectedCoverage ||
    scored.confidence !== expectedConfidence
  ) {
    throw new TypeError("scored opportunity aggregate score trace drift.");
  }
  const expectedEligibility =
    scored.blockers.length > 0
      ? "blocked"
      : scored.researchReasons.length > 0
        ? "needs-research"
        : "eligible";
  if (scored.eligibilityStatus !== expectedEligibility) {
    throw new TypeError("scored opportunity eligibility status drift.");
  }
}

function validateQueueReportSemantics(report: OpportunityQueueReport): void {
  const seen = new Set<string>();
  const counts = { eligible: 0, "needs-research": 0, blocked: 0 };
  report.items.forEach((item, index) => {
    validateScoredSemantics(item);
    if (item.asOfDate !== report.asOfDate) {
      throw new TypeError("opportunity queue item asOfDate drift.");
    }
    if (item.rank !== index + 1) {
      throw new TypeError(
        "opportunity queue ranks must be contiguous and ordered.",
      );
    }
    if (seen.has(item.id)) {
      throw new TypeError(`duplicate opportunity queue item ${item.id}.`);
    }
    seen.add(item.id);
    counts[item.eligibilityStatus] += 1;
    const previous = report.items[index - 1];
    if (
      previous !== undefined &&
      (previous.finalScore < item.finalScore ||
        (previous.finalScore === item.finalScore &&
          compareUnicodeCodePoints(previous.id, item.id) > 0))
    ) {
      throw new TypeError("opportunity queue ordering drift.");
    }
  });
  for (const status of ["eligible", "needs-research", "blocked"] as const) {
    if (report.statusCounts[status] !== counts[status]) {
      throw new TypeError(
        `opportunity queue statusCounts drift for ${status}.`,
      );
    }
  }
  const selected = report.items.find(
    ({ eligibilityStatus }) => eligibilityStatus === "eligible",
  );
  if (report.selectedOpportunityId !== (selected?.id ?? null)) {
    throw new TypeError("opportunity queue selectedOpportunityId drift.");
  }
}

function validateProvisionalBriefSemantics(
  brief: ProvisionalOpportunityBrief,
): void {
  if (brief.reviewerRequirement.assignedReviewer !== brief.reviewer) {
    throw new TypeError("provisional brief reviewer identity drift.");
  }
  const expectedStatus =
    brief.eligibilityStatus === "blocked" ? "blocked" : "needs-research";
  if (brief.status !== expectedStatus) {
    throw new TypeError("provisional brief status drift.");
  }
}

function validateCandidateShape(value: unknown): OpportunityCandidateInput {
  assertExactKeys(value, candidateKeys, "opportunity candidate");
  const parsed = candidateSchema.safeParse(value);
  if (!parsed.success)
    throw new TypeError(
      `opportunity candidate failed runtime schema validation: ${parsed.error.message}`,
    );
  const candidate = parsed.data as unknown as OpportunityCandidateInput;
  validateCandidateSemantics(candidate);
  return candidate;
}

export function freezeOpportunityCandidateInput(
  value: unknown,
): OpportunityCandidateInput {
  const candidate = validateCandidateShape(value) as unknown as Record<
    string,
    unknown
  >;
  assertExactKeys(
    candidate.factors,
    OPPORTUNITY_FACTORS.map(({ id }) => id),
    "opportunity factors",
  );
  assertExactKeys(
    candidate.gates,
    OPPORTUNITY_HARD_GATE_IDS,
    "opportunity gates",
  );
  const factorIds = OPPORTUNITY_FACTORS.map(({ id }) => id);
  const factors = Object.fromEntries(
    factorIds.map((id) => [
      id,
      cloneFactor(
        (candidate.factors as Record<string, unknown>)[id],
        `factors.${id}`,
      ),
    ]),
  ) as OpportunityCandidateInput["factors"];
  const gates = Object.fromEntries(
    OPPORTUNITY_HARD_GATE_IDS.map((id) => [
      id,
      cloneGate(
        (candidate.gates as Record<string, unknown>)[id],
        `gates.${id}`,
      ),
    ]),
  ) as OpportunityCandidateInput["gates"];
  return deepFreeze({
    id: candidate.id as string,
    taskType: candidate.taskType as OpportunityCandidateInput["taskType"],
    cluster: candidate.cluster as ClusterId,
    intendedDestination: cloneNullableString(
      candidate.intendedDestination,
      "intendedDestination",
    ),
    reviewer: cloneNullableString(candidate.reviewer, "reviewer"),
    factors,
    gates,
    brief: cloneBrief(candidate.brief),
    destructiveAction: cloneDestructiveAction(candidate.destructiveAction),
  });
}

export const opportunityCandidateInputSchema =
  makeRuntimeSchema<OpportunityCandidateInput>(
    candidateSchema,
    "opportunity candidate",
    freezeOpportunityCandidateInput,
  );
export const opportunityQueueInputSchema =
  makeRuntimeSchema<OpportunityQueueInput>(
    queueInputSchema,
    "opportunity queue input",
    (value) =>
      deepFreeze({
        asOfDate: value.asOfDate,
        candidates: value.candidates.map((candidate) =>
          freezeOpportunityCandidateInput(candidate),
        ),
      }),
  );
export const opportunityQueueReportSchema =
  makeRuntimeSchema<OpportunityQueueReport>(
    queueReportSchema,
    "opportunity queue report",
    undefined,
    validateQueueReportSemantics,
  );
export const provisionalOpportunityBriefSchema =
  makeRuntimeSchema<ProvisionalOpportunityBrief>(
    provisionalBriefSchema,
    "provisional opportunity brief",
    undefined,
    validateProvisionalBriefSemantics,
  );

export function parseOpportunityCandidateInput(
  value: unknown,
): OpportunityCandidateInput {
  return opportunityCandidateInputSchema.parse(value);
}

export function parseOpportunityQueueInput(
  value: unknown,
): OpportunityQueueInput {
  return opportunityQueueInputSchema.parse(value);
}

export function parseOpportunityQueueReport(
  value: unknown,
): OpportunityQueueReport {
  return opportunityQueueReportSchema.parse(value);
}

export function parseProvisionalOpportunityBrief(
  value: unknown,
): ProvisionalOpportunityBrief {
  return provisionalOpportunityBriefSchema.parse(value);
}

export function parseScoredOpportunity(value: unknown): ScoredOpportunity {
  return makeRuntimeSchema<ScoredOpportunity>(
    scoredSchema,
    "scored opportunity",
    undefined,
    validateScoredSemantics,
  ).parse(value);
}

export function parseRankedOpportunity(value: unknown): RankedOpportunity {
  return makeRuntimeSchema<RankedOpportunity>(
    rankedSchema,
    "ranked opportunity",
    undefined,
    validateScoredSemantics,
  ).parse(value);
}

export function parseDestructiveActionEvaluation(
  value: unknown,
): DestructiveActionEvaluation {
  return makeRuntimeSchema<DestructiveActionEvaluation>(
    evaluationSchema,
    "destructive action evaluation",
  ).parse(value);
}
