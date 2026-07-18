import {
  GeoBenchmarkNeutralityError,
  type GeoBenchmarkErrorReason,
} from "./types";

interface NeutralityRule {
  reason: GeoBenchmarkErrorReason;
  pattern: RegExp;
  label: string;
}

/**
 * The GEO benchmark question set is an observation instrument, not a sales
 * prompt. Keep this policy local to the contract boundary so every pure
 * ingestion/rendering path applies the same fail-closed rules.
 */
const NEUTRALITY_RULES: readonly NeutralityRule[] = [
  {
    reason: "neutrality_policy_violation",
    pattern: /\b(?:winning adventure global|wag)\b/i,
    label: "brand inducement",
  },
  {
    reason: "neutrality_policy_violation",
    pattern:
      /\b(?:mention(?:ed|s|ing)?|cite(?:d|s|ing)?|recommend(?:ation|ed|s|ing)?|promot(?:e|ed|es|ing|ion)|endorse(?:d|s|ment)?)\b/i,
    label:
      "mention, citation, recommendation, promotion, or endorsement inducement",
  },
  {
    reason: "neutrality_policy_violation",
    pattern:
      /\b(?:(?:prefer(?:red|s|ring)?|preference\s+(?:for|toward(?:s)?))\s+(?:(?:a|an|the)\s+)?(?:brand|company|provider|agency|service|option|choice|supplier)|(?:do|would|should)\s+(?:i|we|you)\s+prefer)\b/i,
    label: "provider preference inducement",
  },
  {
    reason: "neutrality_policy_violation",
    pattern:
      /\b(?:best|top(?:[- ]ranked)?|number\s+one|rank(?:ed|ing|s)?|outperform(?:s|ed|ing)?|better\s+than|leading\s+(?:company|provider|agency|service|option|choice|supplier)|dominant\s+(?:company|provider|agency|service|option|choice|supplier)|dominates?)\b/i,
    label: "ranking claim",
  },
  {
    reason: "neutrality_policy_violation",
    pattern:
      /\b(?:(?:which|what)\b[^?]*\b(?:company|provider|agency|service)\b[^?]*\b(?:should\s+(?:i|we)\s+(?:use|hire|choose)|to\s+(?:use|hire|choose))|who\s+should\s+(?:i|we)\s+(?:use|hire|choose))\b/i,
    label: "recommendation or hiring inducement",
  },
  {
    reason: "neutrality_policy_violation",
    pattern:
      /\b(?:guarantee(?:d|s|ing)?|promise(?:d|s|ing)?|ensure(?:d|s|ing)?|assure(?:d|s|ing)?)\b/i,
    label: "guarantee or assurance claim",
  },
  {
    reason: "neutrality_policy_violation",
    pattern:
      /\b(?:cause(?:d|s|ing)?|causal(?:ity)?|lead(?:s|ing)?\s+to|result(?:ed|s|ing)?\s+in|prov(?:e|ed|en|es|ing)|(?:increase(?:d|s|ing)?|improve(?:d|s|ing)?)\s+(?:[a-z][a-z-]*\s+){0,3}(?:mentions?|citations?|accuracy|completeness|visibility|rankings?|performance|reliability|quality|rates?|conversions?|sales|results?|outcomes?|success|trust)|(?:mentions?|citations?|accuracy|completeness|visibility|rankings?|performance|reliability|quality|rates?|conversions?|sales|results?|outcomes?|success|trust)\s+(?:(?:can|may|might|could|will|would|does|do)\s+)?(?:increase(?:d|s|ing)?|improve(?:d|s|ing)?))\b/i,
    label: "causal or outcome claim",
  },
];

function textForError(value: unknown): string {
  if (typeof value !== "string") {
    throw new GeoBenchmarkNeutralityError(
      "Neutral GEO benchmark text must be a string.",
    );
  }
  return value;
}

export function assertGeoBenchmarkNeutralText(
  value: unknown,
  field: string,
): string {
  const text = textForError(value);
  const matchingRule = NEUTRALITY_RULES.find(({ pattern }) =>
    pattern.test(text),
  );
  if (matchingRule !== undefined) {
    throw new GeoBenchmarkNeutralityError(
      `${field} violates the neutral observation policy (${matchingRule.label}).`,
    );
  }
  return text;
}

export function assertGeoBenchmarkNeutralPrompt(prompt: unknown): string {
  return assertGeoBenchmarkNeutralText(prompt, "Question prompt");
}

export function assertGeoBenchmarkNeutralTextList(
  values: readonly unknown[],
  field: string,
): readonly string[] {
  return values.map((value, index) =>
    assertGeoBenchmarkNeutralText(value, `${field}[${index}]`),
  );
}
