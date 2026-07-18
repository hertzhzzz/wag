import { CANONICAL_CLUSTER_IDS, type ClusterId } from "../clusterSchema";
import {
  OPPORTUNITY_FACTORS,
  OPPORTUNITY_FRESHNESS_POLICY,
  OPPORTUNITY_FRESHNESS_POLICY_VERSION,
  OPPORTUNITY_SCORING_VERSION,
  OPPORTUNITY_TASK_TYPES,
} from "./constants";
import {
  cloneDestructiveActionInput,
  evaluateDestructiveAction,
} from "./destructive";
import { freezeOpportunityCandidateInput } from "./schema";
import {
  assertIsoDate,
  cloneRawValue,
  deepFreeze,
  differenceInCalendarDays,
  roundDeterministic,
  sortCodePoints,
} from "./deterministic";
import type {
  DestructiveActionEvaluation,
  OpportunityBriefInput,
  OpportunityCandidateInput,
  OpportunityDataStatus,
  OpportunityFactorId,
  OpportunityFreshnessStatus,
  OpportunityGateInput,
  OpportunityHardGateId,
  ScoredOpportunity,
  ScoredOpportunityFactor,
} from "./types";

const HARD_GATE_IDS = [
  "service-relevance",
  "evidence-readiness",
  "destination-resolved",
  "cannibalisation-reviewed",
  "reviewer-assigned",
] as const satisfies readonly OpportunityHardGateId[];

const DATA_STATUSES = [
  "observed",
  "static-snapshot",
  "synthetic-fixture",
  "missing",
  "not-applicable",
] as const satisfies readonly OpportunityDataStatus[];

function exactKeys(
  record: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  const actual = sortCodePoints(Object.keys(record));
  const sortedExpected = sortCodePoints(expected);
  return (
    actual.length === sortedExpected.length &&
    actual.every((key, index) => key === sortedExpected[index])
  );
}

function assertNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }
}

function assertInternalRoute(value: string, field: string): void {
  if (
    !/^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(value)
  ) {
    throw new TypeError(`${field} must be a canonical internal route.`);
  }
}

function assertGate(
  gate: OpportunityGateInput,
  id: OpportunityHardGateId,
): OpportunityGateInput {
  if (!(["pass", "pending", "fail"] as const).includes(gate.status)) {
    throw new TypeError(`Gate ${id} has an invalid status.`);
  }
  assertNonEmpty(gate.reason, `Gate ${id} reason`);
  if (gate.status === "pass" && gate.sourceRef === null) {
    throw new TypeError(`Passing gate ${id} requires a sourceRef.`);
  }
  if (gate.sourceRef !== null) {
    assertNonEmpty(gate.sourceRef, `Gate ${id} sourceRef`);
  }
  return {
    status: gate.status,
    reason: gate.reason,
    sourceRef: gate.sourceRef,
  };
}

function freshnessFor(
  dataStatus: OpportunityDataStatus,
  observedAt: string | null,
  asOfDate: string,
): {
  readonly ageDays: number | null;
  readonly status: OpportunityFreshnessStatus;
  readonly multiplier: number;
} {
  if (dataStatus === "missing") {
    return { ageDays: null, status: "missing", multiplier: 0 };
  }
  if (dataStatus === "not-applicable") {
    return { ageDays: null, status: "not-applicable", multiplier: 0 };
  }
  if (observedAt === null) {
    throw new TypeError(`${dataStatus} factor data requires observedAt.`);
  }

  assertIsoDate(observedAt);
  const ageDays = differenceInCalendarDays(observedAt, asOfDate);
  if (ageDays < 0) {
    throw new TypeError(
      `Factor observedAt ${observedAt} cannot be after asOfDate ${asOfDate}.`,
    );
  }
  if (ageDays <= OPPORTUNITY_FRESHNESS_POLICY.fresh.maximumAgeDays) {
    return {
      ageDays,
      status: "fresh",
      multiplier: OPPORTUNITY_FRESHNESS_POLICY.fresh.multiplier,
    };
  }
  if (ageDays <= OPPORTUNITY_FRESHNESS_POLICY.aging.maximumAgeDays) {
    return {
      ageDays,
      status: "aging",
      multiplier: OPPORTUNITY_FRESHNESS_POLICY.aging.multiplier,
    };
  }
  return {
    ageDays,
    status: "stale",
    multiplier: OPPORTUNITY_FRESHNESS_POLICY.stale.multiplier,
  };
}

function scoreFactor(
  id: OpportunityFactorId,
  asOfDate: string,
  candidate: OpportunityCandidateInput,
): ScoredOpportunityFactor {
  const definition = OPPORTUNITY_FACTORS.find((factor) => factor.id === id);
  if (!definition) {
    throw new TypeError(`Unknown opportunity factor ${id}.`);
  }
  const input = candidate.factors[id];
  if (!DATA_STATUSES.includes(input.dataStatus)) {
    throw new TypeError(`${id} has an invalid dataStatus.`);
  }
  const missing =
    input.dataStatus === "missing" || input.dataStatus === "not-applicable";

  if (
    !Number.isFinite(input.confidence) ||
    input.confidence < 0 ||
    input.confidence > 1
  ) {
    throw new TypeError(`${id} confidence must be between 0 and 1.`);
  }
  if (missing) {
    if (
      input.raw !== null ||
      input.normalized !== null ||
      input.sourceRef !== null ||
      input.observedAt !== null ||
      input.confidence !== 0 ||
      input.missingReason === null
    ) {
      throw new TypeError(
        `${id} ${input.dataStatus} data must keep raw, normalized, sourceRef, and observedAt null, confidence 0, and provide missingReason.`,
      );
    }
    assertNonEmpty(input.missingReason, `${id} missingReason`);
  } else {
    if (
      input.normalized === null ||
      input.normalized < 0 ||
      input.normalized > 100 ||
      !Number.isFinite(input.normalized)
    ) {
      throw new TypeError(`${id} normalized must be between 0 and 100.`);
    }
    if (input.sourceRef === null) {
      throw new TypeError(`${id} observed data requires sourceRef.`);
    }
    assertNonEmpty(input.sourceRef, `${id} sourceRef`);
    if (input.missingReason !== null) {
      throw new TypeError(`${id} observed data cannot provide missingReason.`);
    }
  }

  const freshness = freshnessFor(input.dataStatus, input.observedAt, asOfDate);
  const contribution =
    input.normalized === null
      ? 0
      : roundDeterministic(
          (definition.weight * input.normalized * freshness.multiplier) / 100,
        );

  return {
    id,
    label: definition.label,
    raw: cloneRawValue(input.raw),
    normalized: input.normalized,
    weight: definition.weight,
    contribution,
    sourceRef: input.sourceRef,
    observedAt: input.observedAt,
    asOfDate,
    ageDays: freshness.ageDays,
    freshnessStatus: freshness.status,
    freshnessMultiplier: freshness.multiplier,
    dataStatus: input.dataStatus,
    confidence: input.confidence,
    missingReason: input.missingReason,
    scoringVersion: OPPORTUNITY_SCORING_VERSION,
    freshnessPolicyVersion: OPPORTUNITY_FRESHNESS_POLICY_VERSION,
  };
}

function cloneBrief(
  candidate: OpportunityCandidateInput,
): OpportunityBriefInput {
  return {
    targetIntent: candidate.brief.targetIntent,
    readerOutcome: candidate.brief.readerOutcome,
    evidenceNeeds: [...candidate.brief.evidenceNeeds],
    graphChanges: [...candidate.brief.graphChanges],
    conversionPath: candidate.brief.conversionPath,
    successMeasures: [...candidate.brief.successMeasures],
  };
}

export function scoreOpportunity(
  candidate: OpportunityCandidateInput,
  asOfDate: string,
): ScoredOpportunity {
  assertIsoDate(asOfDate);
  const candidateSnapshot = freezeOpportunityCandidateInput(candidate);
  assertNonEmpty(candidateSnapshot.id, "Opportunity id");
  if (!OPPORTUNITY_TASK_TYPES.includes(candidateSnapshot.taskType)) {
    throw new TypeError(
      `Unsupported opportunity task type ${candidateSnapshot.taskType}.`,
    );
  }
  if (!CANONICAL_CLUSTER_IDS.includes(candidateSnapshot.cluster as ClusterId)) {
    throw new TypeError(
      `Unknown opportunity cluster ${candidateSnapshot.cluster}.`,
    );
  }
  if (candidateSnapshot.intendedDestination !== null) {
    assertInternalRoute(
      candidateSnapshot.intendedDestination,
      "intendedDestination",
    );
  }
  if (candidateSnapshot.reviewer !== null) {
    assertNonEmpty(candidateSnapshot.reviewer, "reviewer");
  }

  const factorIds = OPPORTUNITY_FACTORS.map(({ id }) => id);
  if (
    !exactKeys(
      candidateSnapshot.factors as unknown as Record<string, unknown>,
      factorIds,
    )
  ) {
    throw new TypeError(
      "Opportunity factors must contain exactly six factor IDs.",
    );
  }
  if (
    !exactKeys(
      candidateSnapshot.gates as unknown as Record<string, unknown>,
      HARD_GATE_IDS,
    )
  ) {
    throw new TypeError(
      "Opportunity gates must contain exactly five hard gates.",
    );
  }

  const factors = factorIds.map((id) =>
    scoreFactor(id, asOfDate, candidateSnapshot),
  );
  const gates = Object.fromEntries(
    HARD_GATE_IDS.map((id) => [
      id,
      assertGate(candidateSnapshot.gates[id], id),
    ]),
  ) as Record<OpportunityHardGateId, OpportunityGateInput>;

  if (
    gates["destination-resolved"].status === "pass" &&
    candidateSnapshot.intendedDestination === null
  ) {
    throw new TypeError(
      "A passing destination-resolved gate requires intendedDestination.",
    );
  }
  if (
    gates["reviewer-assigned"].status === "pass" &&
    candidateSnapshot.reviewer === null
  ) {
    throw new TypeError("A passing reviewer-assigned gate requires reviewer.");
  }

  const blockers = HARD_GATE_IDS.filter(
    (id) => gates[id].status === "fail",
  ).map((id) => `gate:${id}:${gates[id].reason}`);
  const researchReasons = [
    ...HARD_GATE_IDS.filter((id) => gates[id].status === "pending").map(
      (id) => `gate:${id}:${gates[id].reason}`,
    ),
    ...factors
      .filter(({ dataStatus }) => dataStatus === "missing")
      .map(
        ({ id, missingReason }) =>
          `factor:${id}:${missingReason ?? "missing-input"}`,
      ),
  ];

  let destructiveActionEvaluation: DestructiveActionEvaluation | null = null;
  if (candidateSnapshot.destructiveAction !== null) {
    destructiveActionEvaluation = evaluateDestructiveAction(
      candidateSnapshot.destructiveAction,
      asOfDate,
    );
    if (!destructiveActionEvaluation.destructiveActionAllowed) {
      blockers.push(
        ...destructiveActionEvaluation.blockers.map(
          (blocker) => `destructive:${blocker}`,
        ),
      );
    }
  } else if (candidateSnapshot.taskType === "merge") {
    blockers.push("destructive-action-plan-required");
  }

  const finalScore = roundDeterministic(
    factors.reduce((sum, factor) => sum + factor.contribution, 0),
  );
  const coverage = roundDeterministic(
    factors.reduce(
      (sum, factor) => sum + (factor.normalized === null ? 0 : factor.weight),
      0,
    ) / 100,
  );
  const confidence = roundDeterministic(
    factors.reduce(
      (sum, factor) =>
        sum + factor.weight * factor.confidence * factor.freshnessMultiplier,
      0,
    ) / 100,
  );
  const eligibilityStatus: ScoredOpportunity["eligibilityStatus"] =
    blockers.length > 0
      ? "blocked"
      : researchReasons.length > 0
        ? "needs-research"
        : "eligible";

  return deepFreeze({
    id: candidateSnapshot.id,
    taskType: candidateSnapshot.taskType,
    cluster: candidateSnapshot.cluster,
    intendedDestination: candidateSnapshot.intendedDestination,
    reviewer: candidateSnapshot.reviewer,
    asOfDate,
    scoringVersion: OPPORTUNITY_SCORING_VERSION,
    freshnessPolicyVersion: OPPORTUNITY_FRESHNESS_POLICY_VERSION,
    finalScore,
    coverage,
    confidence,
    eligibilityStatus,
    blockers,
    researchReasons,
    factors,
    gates,
    brief: cloneBrief(candidateSnapshot),
    destructiveAction:
      candidateSnapshot.destructiveAction === null
        ? null
        : cloneDestructiveActionInput(candidateSnapshot.destructiveAction),
    destructiveActionEvaluation,
  });
}
