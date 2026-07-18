import {
  DESTRUCTIVE_ACTION_GATE_IDS,
  DESTRUCTIVE_ACTION_SCHEMA_VERSION,
  OPPORTUNITY_AS_OF_BOUNDARY,
  OPPORTUNITY_FRESHNESS_POLICY_VERSION,
  OPPORTUNITY_SCORING_VERSION,
} from "./constants";
import {
  assertIsoDate,
  deepFreeze,
  differenceInCalendarDays,
  sortCodePoints,
} from "./deterministic";
import type {
  DestructiveActionEvaluation,
  DestructiveActionGateId,
  DestructiveActionInput,
  OpportunityGateInput,
} from "./types";

function assertNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }
}

function assertGate(
  gate: OpportunityGateInput,
  id: DestructiveActionGateId,
): OpportunityGateInput {
  if (!(["pass", "pending", "fail"] as const).includes(gate.status)) {
    throw new TypeError(`Destructive gate ${id} has an invalid status.`);
  }
  assertNonEmpty(gate.reason, `Destructive gate ${id} reason`);
  if (gate.status === "pass" && gate.sourceRef === null) {
    throw new TypeError(`Passing destructive gate ${id} requires sourceRef.`);
  }
  if (gate.sourceRef !== null) {
    assertNonEmpty(gate.sourceRef, `Destructive gate ${id} sourceRef`);
  }
  return {
    status: gate.status,
    reason: gate.reason,
    sourceRef: gate.sourceRef,
  };
}

function hasExactGateSet(input: DestructiveActionInput): boolean {
  const inputKeys = sortCodePoints(Object.keys(input.gates));
  const expectedKeys = sortCodePoints(DESTRUCTIVE_ACTION_GATE_IDS);
  return (
    inputKeys.length === expectedKeys.length &&
    inputKeys.every((key, index) => key === expectedKeys[index])
  );
}

export function cloneDestructiveActionInput(
  input: DestructiveActionInput,
): DestructiveActionInput {
  const gates = Object.fromEntries(
    DESTRUCTIVE_ACTION_GATE_IDS.map((id) => [
      id,
      assertGate(input.gates[id], id),
    ]),
  ) as Record<DestructiveActionGateId, OpportunityGateInput>;

  return {
    action: input.action,
    lowTrafficOnly: input.lowTrafficOnly,
    gates,
    humanApproval: {
      actorType: input.humanApproval.actorType,
      reviewer: input.humanApproval.reviewer,
      reviewedAt: input.humanApproval.reviewedAt,
    },
  };
}

export function evaluateDestructiveAction(
  input: DestructiveActionInput,
  asOfDate: string,
): DestructiveActionEvaluation {
  assertIsoDate(asOfDate);
  if (!(["merge", "redirect", "retire"] as const).includes(input.action)) {
    throw new TypeError(`Unsupported destructive action ${input.action}.`);
  }
  if (typeof input.lowTrafficOnly !== "boolean") {
    throw new TypeError("lowTrafficOnly must be a boolean.");
  }
  if (!hasExactGateSet(input)) {
    throw new TypeError(
      "Destructive action gates must contain the complete fixed gate set.",
    );
  }

  const cloned = cloneDestructiveActionInput(input);
  const blockers: string[] = [];

  for (const id of DESTRUCTIVE_ACTION_GATE_IDS) {
    const gate = cloned.gates[id];
    if (gate.status !== "pass") {
      blockers.push(`gate:${id}:${gate.reason}`);
    }
  }

  if (cloned.lowTrafficOnly) {
    blockers.push("low-traffic-alone-cannot-authorize-destructive-action");
  }

  const approval = cloned.humanApproval;
  if (
    !(["human", "automation", "service", null] as const).includes(
      approval.actorType,
    )
  ) {
    throw new TypeError("humanApproval.actorType is invalid.");
  }
  if (approval.reviewer !== null) {
    assertNonEmpty(approval.reviewer, "humanApproval.reviewer");
  }
  if (approval.reviewedAt !== null) {
    assertIsoDate(approval.reviewedAt);
    if (approval.reviewedAt > OPPORTUNITY_AS_OF_BOUNDARY) {
      throw new TypeError(
        `Human approval reviewedAt ${approval.reviewedAt} is future evidence after ${OPPORTUNITY_AS_OF_BOUNDARY}.`,
      );
    }
    if (differenceInCalendarDays(approval.reviewedAt, asOfDate) < 0) {
      blockers.push("human-approval-date-after-as-of-date");
    }
  }
  if (
    approval.actorType !== "human" ||
    approval.reviewer === null ||
    approval.reviewedAt === null
  ) {
    blockers.push("human-approval-required");
  }

  return deepFreeze({
    schemaVersion: DESTRUCTIVE_ACTION_SCHEMA_VERSION,
    action: cloned.action,
    lowTrafficOnly: cloned.lowTrafficOnly,
    asOfDate,
    scoringVersion: OPPORTUNITY_SCORING_VERSION,
    freshnessPolicyVersion: OPPORTUNITY_FRESHNESS_POLICY_VERSION,
    status: blockers.length === 0 ? "human-approved" : "blocked",
    destructiveActionAllowed: blockers.length === 0,
    automationAllowed: false,
    lowTrafficAloneSufficient: false,
    blockers,
    gates: cloned.gates,
    humanApproval: cloned.humanApproval,
  });
}
