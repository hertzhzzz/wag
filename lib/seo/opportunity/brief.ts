import { OPPORTUNITY_BRIEF_SCHEMA_VERSION } from "./constants";
import { deepFreeze } from "./deterministic";
import { parseRankedOpportunity, parseScoredOpportunity } from "./schema";
import { rankOpportunityQueue } from "./queue";
import type {
  OpportunityBriefInput,
  ProvisionalOpportunityBrief,
  ScoredOpportunity,
} from "./types";

function cloneInputs(scored: ScoredOpportunity): OpportunityBriefInput {
  return {
    targetIntent: scored.brief.targetIntent,
    readerOutcome: scored.brief.readerOutcome,
    evidenceNeeds: [...scored.brief.evidenceNeeds],
    graphChanges: [...scored.brief.graphChanges],
    conversionPath: scored.brief.conversionPath,
    successMeasures: [...scored.brief.successMeasures],
  };
}

function missingRealInputs(scored: ScoredOpportunity): string[] {
  const missing: string[] = ["reviewer:real-human-assignment-required"];

  for (const factor of scored.factors) {
    if (factor.dataStatus === "missing") {
      missing.push(
        `factor:${factor.id}:${factor.missingReason ?? "missing-real-input"}`,
      );
    } else if (factor.dataStatus === "static-snapshot") {
      missing.push(`factor:${factor.id}:static-snapshot-not-live`);
    } else if (factor.dataStatus === "synthetic-fixture") {
      missing.push(`factor:${factor.id}:synthetic-fixture-not-live`);
    } else if (factor.freshnessStatus === "stale") {
      missing.push(`factor:${factor.id}:stale-observation-refresh-required`);
    }
  }

  if (scored.intendedDestination === null) {
    missing.push("destination:resolved-route-required");
  }
  if (scored.brief.targetIntent === null) {
    missing.push("brief:target-intent-required");
  }
  if (scored.brief.readerOutcome === null) {
    missing.push("brief:reader-outcome-required");
  }
  if (scored.brief.evidenceNeeds.length === 0) {
    missing.push("brief:evidence-needs-required");
  }
  if (scored.brief.graphChanges.length === 0) {
    missing.push("brief:graph-changes-required");
  }
  if (scored.brief.conversionPath === null) {
    missing.push("brief:conversion-path-required");
  }
  if (scored.brief.successMeasures.length === 0) {
    missing.push("brief:success-measures-required");
  }
  if (
    scored.destructiveActionEvaluation !== null &&
    !scored.destructiveActionEvaluation.destructiveActionAllowed
  ) {
    missing.push("destructive-action:human-review-and-gates-required");
  }

  return missing;
}

export function buildProvisionalOpportunityBrief(
  scored: unknown,
): ProvisionalOpportunityBrief {
  const parsedScored =
    typeof scored === "object" && scored !== null && "rank" in scored
      ? parseRankedOpportunity(scored)
      : parseScoredOpportunity(scored);
  return deepFreeze({
    schemaVersion: OPPORTUNITY_BRIEF_SCHEMA_VERSION,
    status:
      parsedScored.eligibilityStatus === "blocked"
        ? "blocked"
        : "needs-research",
    provenance: "candidate-inputs-only",
    opportunityId: parsedScored.id,
    taskType: parsedScored.taskType,
    cluster: parsedScored.cluster,
    intendedDestination: parsedScored.intendedDestination,
    reviewer: parsedScored.reviewer,
    reviewerRequirement: {
      assignedReviewer: parsedScored.reviewer,
      realHumanRequired: true,
      verified: false,
    },
    asOfDate: parsedScored.asOfDate,
    scoringVersion: parsedScored.scoringVersion,
    freshnessPolicyVersion: parsedScored.freshnessPolicyVersion,
    finalScore: parsedScored.finalScore,
    eligibilityStatus: parsedScored.eligibilityStatus,
    blockers: [...parsedScored.blockers],
    researchReasons: [...parsedScored.researchReasons],
    missingRealInputs: missingRealInputs(parsedScored),
    inputs: cloneInputs(parsedScored),
    destructiveActionEvaluation: parsedScored.destructiveActionEvaluation,
    draftingAllowed: false,
    publishingAllowed: false,
    draft: null,
    publication: null,
  });
}

export function buildFirstOpportunityBrief(
  input: unknown,
): ProvisionalOpportunityBrief | null {
  const queue = rankOpportunityQueue(input);
  const selected = queue.items.find(
    ({ id }) => id === queue.selectedOpportunityId,
  );
  return selected === undefined
    ? null
    : buildProvisionalOpportunityBrief(selected);
}
