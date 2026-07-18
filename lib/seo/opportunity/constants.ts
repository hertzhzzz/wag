export const OPPORTUNITY_SCORING_VERSION = "seo-opportunity-score-v1" as const;
export const OPPORTUNITY_QUEUE_SCHEMA_VERSION =
  "seo-opportunity-queue-v1" as const;
export const OPPORTUNITY_BRIEF_SCHEMA_VERSION =
  "seo-opportunity-brief-v1" as const;
export const DESTRUCTIVE_ACTION_SCHEMA_VERSION =
  "seo-opportunity-destructive-action-v1" as const;

export const OPPORTUNITY_TASK_TYPES = deepFreeze([
  "refresh",
  "new",
  "merge",
  "evidence",
  "internal-link",
] as const);

export const DESTRUCTIVE_ACTION_GATE_IDS = deepFreeze([
  "human-approval",
  "successor-decision",
  "gone-decision",
  "backlink-review",
  "evidence-review",
  "orphan-review",
  "redirect-chain-review",
  "rollback-plan",
] as const);

export const OPPORTUNITY_FRESHNESS_POLICY_VERSION =
  "seo-opportunity-freshness-v1" as const;

export const OPPORTUNITY_FACTORS = deepFreeze([
  {
    id: "service-lead-relevance",
    label: "Core-service and qualified-lead relevance",
    weight: 30,
  },
  {
    id: "australian-action-intent",
    label: "Australian buyer action intent",
    weight: 20,
  },
  {
    id: "evidence-readiness",
    label: "Evidence readiness and first-party advantage",
    weight: 15,
  },
  {
    id: "gsc-performance",
    label: "Google Search Console opportunity",
    weight: 15,
  },
  {
    id: "serp-gap",
    label: "Achievable SERP coverage gap",
    weight: 10,
  },
  {
    id: "geo-answerability",
    label: "GEO citation opportunity",
    weight: 10,
  },
] as const);

export const OPPORTUNITY_FRESHNESS_POLICY = deepFreeze({
  version: OPPORTUNITY_FRESHNESS_POLICY_VERSION,
  fresh: { maximumAgeDays: 30, multiplier: 1 },
  aging: { maximumAgeDays: 90, multiplier: 0.75 },
  stale: { maximumAgeDays: null, multiplier: 0.5 },
  missing: { maximumAgeDays: null, multiplier: 0 },
  notApplicable: { maximumAgeDays: null, multiplier: 0 },
} as const);

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}
