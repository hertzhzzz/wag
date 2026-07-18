import { OPPORTUNITY_BRIEF_SCHEMA_VERSION } from "./constants";
import { deepFreeze } from "./deterministic";
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
  scored: ScoredOpportunity,
): ProvisionalOpportunityBrief {
  return deepFreeze({
    schemaVersion: OPPORTUNITY_BRIEF_SCHEMA_VERSION,
    status:
      scored.eligibilityStatus === "blocked" ? "blocked" : "needs-research",
    provenance: "candidate-inputs-only",
    opportunityId: scored.id,
    taskType: scored.taskType,
    cluster: scored.cluster,
    intendedDestination: scored.intendedDestination,
    reviewer: scored.reviewer,
    reviewerRequirement: {
      assignedReviewer: scored.reviewer,
      realHumanRequired: true,
      verified: false,
    },
    asOfDate: scored.asOfDate,
    scoringVersion: scored.scoringVersion,
    freshnessPolicyVersion: scored.freshnessPolicyVersion,
    finalScore: scored.finalScore,
    eligibilityStatus: scored.eligibilityStatus,
    blockers: [...scored.blockers],
    researchReasons: [...scored.researchReasons],
    missingRealInputs: missingRealInputs(scored),
    inputs: cloneInputs(scored),
    destructiveActionEvaluation: scored.destructiveActionEvaluation,
    draftingAllowed: false,
    publishingAllowed: false,
    draft: null,
    publication: null,
  });
}
