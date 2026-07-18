import { freezeOpportunityCandidateInput } from "./schema";
import type {
  OpportunityCandidateInput,
  OpportunityFactorInput,
  OpportunityGateInput,
} from "./types";

const OBSERVED_AT = "2026-07-10";

function factor(
  raw: OpportunityFactorInput["raw"],
  normalized: number,
  source: string,
): OpportunityFactorInput {
  return {
    raw,
    normalized,
    sourceRef: `fixture://opportunity/full/${source}`,
    observedAt: OBSERVED_AT,
    dataStatus: "synthetic-fixture",
    confidence: 1,
    missingReason: null,
  };
}

function passingGate(id: string): OpportunityGateInput {
  return {
    status: "pass",
    reason: `Synthetic fixture passes ${id}; this is not human approval.`,
    sourceRef: `fixture://opportunity/full/gates/${id}`,
  };
}

export function buildSyntheticCandidate(
  overrides: Partial<OpportunityCandidateInput> = {},
): OpportunityCandidateInput {
  return freezeOpportunityCandidateInput({
    id: "opportunity-fixture-complete",
    taskType: "refresh",
    cluster: "supplier-verification",
    intendedDestination: "/article/verify-chinese-supplier",
    reviewer: "Synthetic fixture reviewer; not a real assignment",
    factors: {
      "service-lead-relevance": factor(
        "High fit with an active commercial service",
        90,
        "service-relevance",
      ),
      "australian-action-intent": factor(
        "Strong Australian buyer action intent",
        80,
        "action-intent",
      ),
      "evidence-readiness": factor(
        "Governed synthetic evidence fixture is complete",
        100,
        "evidence-readiness",
      ),
      "gsc-performance": factor(
        { clicks: 20, impressions: 1000, averagePosition: 8 },
        80,
        "gsc-performance",
      ),
      "serp-gap": factor("Achievable synthetic coverage gap", 70, "serp-gap"),
      "geo-answerability": factor(
        "Synthetic answerability fixture",
        60,
        "geo-answerability",
      ),
    },
    gates: {
      "service-relevance": passingGate("service-relevance"),
      "evidence-readiness": passingGate("evidence-readiness"),
      "destination-resolved": passingGate("destination-resolved"),
      "cannibalisation-reviewed": passingGate("cannibalisation-reviewed"),
      "reviewer-assigned": passingGate("reviewer-assigned"),
    },
    brief: {
      targetIntent: "Synthetic target intent",
      readerOutcome: "Synthetic reader outcome",
      evidenceNeeds: ["Synthetic evidence need"],
      graphChanges: ["Synthetic graph change"],
      conversionPath: "/enquiry",
      successMeasures: ["Synthetic success measure"],
    },
    destructiveAction: null,
    ...overrides,
  });
}
