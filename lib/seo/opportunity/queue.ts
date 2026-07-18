import {
  OPPORTUNITY_FRESHNESS_POLICY_VERSION,
  OPPORTUNITY_QUEUE_SCHEMA_VERSION,
  OPPORTUNITY_SCORING_VERSION,
} from "./constants";
import {
  assertIsoDate,
  compareUnicodeCodePoints,
  deepFreeze,
} from "./deterministic";
import { parseOpportunityQueueInput } from "./schema";
import { scoreOpportunity } from "./scoring";
import type {
  OpportunityEligibilityStatus,
  OpportunityQueueReport,
  RankedOpportunity,
  ScoredOpportunity,
} from "./types";

function compareOpportunities(
  left: ScoredOpportunity,
  right: ScoredOpportunity,
): number {
  if (left.finalScore !== right.finalScore) {
    return right.finalScore - left.finalScore;
  }
  return compareUnicodeCodePoints(left.id, right.id);
}

export function rankOpportunityQueue(input: unknown): OpportunityQueueReport {
  const parsedInput = parseOpportunityQueueInput(input);
  assertIsoDate(parsedInput.asOfDate);
  const seenIds = new Set<string>();
  const scored = parsedInput.candidates.map((candidate) => {
    if (seenIds.has(candidate.id)) {
      throw new TypeError(`Duplicate opportunity id "${candidate.id}".`);
    }
    seenIds.add(candidate.id);
    return scoreOpportunity(candidate, parsedInput.asOfDate);
  });
  const sorted = [...scored].sort(compareOpportunities);
  const items: RankedOpportunity[] = sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
  const selected = items.find(
    ({ eligibilityStatus }) => eligibilityStatus === "eligible",
  );
  const statusCounts: Record<OpportunityEligibilityStatus, number> = {
    eligible: 0,
    "needs-research": 0,
    blocked: 0,
  };
  for (const item of items) {
    statusCounts[item.eligibilityStatus] += 1;
  }

  return deepFreeze({
    schemaVersion: OPPORTUNITY_QUEUE_SCHEMA_VERSION,
    asOfDate: parsedInput.asOfDate,
    scoringVersion: OPPORTUNITY_SCORING_VERSION,
    freshnessPolicyVersion: OPPORTUNITY_FRESHNESS_POLICY_VERSION,
    items,
    selectedOpportunityId: selected?.id ?? null,
    statusCounts,
  });
}
