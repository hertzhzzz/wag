import { CANONICAL_CLUSTER_IDS, type ClusterId } from "../clusterSchema";
import {
  DESTRUCTIVE_ACTION_GATE_IDS,
  OPPORTUNITY_FACTORS,
  OPPORTUNITY_TASK_TYPES,
} from "./constants";
import { cloneDestructiveActionInput } from "./destructive";
import { cloneRawValue, deepFreeze, sortCodePoints } from "./deterministic";
import type {
  OpportunityBriefInput,
  OpportunityCandidateInput,
  OpportunityDataStatus,
  OpportunityFactorInput,
  OpportunityGateInput,
  OpportunityHardGateId,
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

function assertRecord(value: unknown, field: string): asserts value is object {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${field} must be an object.`);
  }
}

function assertExactKeys(
  value: object,
  expected: readonly string[],
  field: string,
): void {
  const actual = sortCodePoints(Object.keys(value));
  const sortedExpected = sortCodePoints(expected);
  if (
    actual.length !== sortedExpected.length ||
    actual.some((key, index) => key !== sortedExpected[index])
  ) {
    throw new TypeError(`${field} must contain exactly the fixed key set.`);
  }
}

function cloneNullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a string or null.`);
  }
  return value;
}

function cloneStringArray(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new TypeError(`${field} must be an array of strings.`);
  }
  return [...value];
}

function cloneGate(value: unknown, field: string): OpportunityGateInput {
  assertRecord(value, field);
  const gate = value as Record<string, unknown>;
  if (
    gate.status !== "pass" &&
    gate.status !== "pending" &&
    gate.status !== "fail"
  ) {
    throw new TypeError(`${field}.status is invalid.`);
  }
  if (typeof gate.reason !== "string") {
    throw new TypeError(`${field}.reason must be a string.`);
  }
  return {
    status: gate.status,
    reason: gate.reason,
    sourceRef: cloneNullableString(gate.sourceRef, `${field}.sourceRef`),
  };
}

function cloneFactor(value: unknown, field: string): OpportunityFactorInput {
  assertRecord(value, field);
  const factor = value as Record<string, unknown>;
  if (
    !OPPORTUNITY_DATA_STATUS_VALUES.includes(
      factor.dataStatus as OpportunityDataStatus,
    )
  ) {
    throw new TypeError(`${field}.dataStatus is invalid.`);
  }
  if (factor.normalized !== null && typeof factor.normalized !== "number") {
    throw new TypeError(`${field}.normalized must be a number or null.`);
  }
  if (typeof factor.confidence !== "number") {
    throw new TypeError(`${field}.confidence must be a number.`);
  }
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
  assertRecord(value, "brief");
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

function cloneDestructiveAction(value: unknown) {
  if (value === null) return null;
  assertRecord(value, "destructiveAction");
  const action = value as Record<string, unknown>;
  if (
    action.humanApproval === null ||
    typeof action.humanApproval !== "object"
  ) {
    throw new TypeError("destructiveAction.humanApproval must be an object.");
  }
  const humanApproval = action.humanApproval as Record<string, unknown>;
  if (
    humanApproval.actorType !== "human" &&
    humanApproval.actorType !== "automation" &&
    humanApproval.actorType !== "service" &&
    humanApproval.actorType !== null
  ) {
    throw new TypeError(
      "destructiveAction.humanApproval.actorType is invalid.",
    );
  }
  if (typeof action.lowTrafficOnly !== "boolean") {
    throw new TypeError("destructiveAction.lowTrafficOnly must be boolean.");
  }
  assertRecord(action.gates, "destructiveAction.gates");
  assertExactKeys(
    action.gates,
    DESTRUCTIVE_ACTION_GATE_IDS,
    "destructiveAction.gates",
  );
  return cloneDestructiveActionInput({
    action: action.action as "merge" | "redirect" | "retire",
    lowTrafficOnly: action.lowTrafficOnly,
    gates: Object.fromEntries(
      DESTRUCTIVE_ACTION_GATE_IDS.map((id) => [
        id,
        cloneGate(
          (action.gates as Record<string, unknown>)[id],
          `destructiveAction.gates.${id}`,
        ),
      ]),
    ) as Record<
      (typeof DESTRUCTIVE_ACTION_GATE_IDS)[number],
      OpportunityGateInput
    >,
    humanApproval: {
      actorType: humanApproval.actorType,
      reviewer: cloneNullableString(
        humanApproval.reviewer,
        "destructiveAction.humanApproval.reviewer",
      ),
      reviewedAt: cloneNullableString(
        humanApproval.reviewedAt,
        "destructiveAction.humanApproval.reviewedAt",
      ),
    },
  });
}

export function freezeOpportunityCandidateInput(
  value: OpportunityCandidateInput,
): OpportunityCandidateInput {
  assertRecord(value, "opportunity candidate");
  const candidate = value as unknown as Record<string, unknown>;
  if (typeof candidate.id !== "string") {
    throw new TypeError("Opportunity id must be a string.");
  }
  if (
    !OPPORTUNITY_TASK_TYPES.includes(
      candidate.taskType as OpportunityCandidateInput["taskType"],
    )
  ) {
    throw new TypeError("Opportunity taskType is invalid.");
  }
  if (!CANONICAL_CLUSTER_IDS.includes(candidate.cluster as ClusterId)) {
    throw new TypeError("Opportunity cluster is invalid.");
  }
  assertRecord(candidate.factors, "opportunity factors");
  const factorIds = OPPORTUNITY_FACTORS.map(({ id }) => id);
  assertExactKeys(candidate.factors, factorIds, "opportunity factors");
  assertRecord(candidate.gates, "opportunity gates");
  assertExactKeys(
    candidate.gates,
    OPPORTUNITY_HARD_GATE_IDS,
    "opportunity gates",
  );

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
    id: candidate.id,
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
