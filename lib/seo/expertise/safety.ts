import type { ApprovedContribution } from "./schema";

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN =
  /(?:^|[^\d])\+\d{1,3}[\s().-]?(?:\d[\s().-]?){6,}\d(?:$|[^\d])/;
const PRIVATE_REFERENCE_PATTERN =
  /\b(?:note|contributor|interviewer|reviewer)\.[0-9a-f]{12,16}\b/i;
const PRIVATE_FILE_PATTERN =
  /(?:^|[\s("'])file:\/\/|(?:^|[\s("'])\.{1,2}\/|(?:^|[\s("'])\/(?:[^/\s]+\/)+/i;

function containsUnsafeToken(value: string): boolean {
  return (
    EMAIL_PATTERN.test(value) ||
    PHONE_PATTERN.test(value) ||
    PRIVATE_REFERENCE_PATTERN.test(value) ||
    PRIVATE_FILE_PATTERN.test(value)
  );
}

/**
 * Conservative, deterministic guard for text that would be emitted publicly.
 * It is not a substitute for a human disclosure review; it fails closed for
 * obvious contact details and private-store references.
 */
export function hasUnsafePublicText(
  contribution: ApprovedContribution,
): boolean {
  const publicText = [
    contribution.boundedClaim,
    contribution.method,
    contribution.unit,
    contribution.deduplication,
    contribution.missingData,
    ...contribution.inclusionCriteria,
    ...contribution.exclusionCriteria,
    ...contribution.limitations,
  ];

  return publicText.some(
    (value): value is string => value !== null && containsUnsafeToken(value),
  );
}
