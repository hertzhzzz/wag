import {
  approvedContributionSchema,
  calendarDateSchema,
  deepFreeze,
  interviewSessionSchema,
  type ApprovedContribution,
  type ApprovedContributionInput,
  type InterviewSession,
  type InterviewSessionInput,
} from "./schema";
import { hasUnsafePublicText } from "./safety";

export const PUBLIC_ELIGIBILITY_REASON_CODES = Object.freeze([
  "consent-expired",
  "consent-internal-use-not-granted",
  "consent-named-attribution-not-granted",
  "consent-public-quotation-not-granted",
  "consent-revoked",
  "contribution-expired",
  "contribution-rejected",
  "contribution-restricted",
  "contribution-revoked",
  "disclosure-review-not-approved",
  "factual-review-not-approved",
  "interview-session-reference-mismatch",
  "permission-expired",
  "permission-named-attribution-scope-missing",
  "permission-not-permitted",
  "permission-public-claim-scope-missing",
  "permission-public-quotation-scope-missing",
  "permission-revoked",
  "privacy-not-public",
  "public-use-prohibited",
  "public-text-unsafe",
  "review-expired",
  "synthetic-record",
] as const);

export type PublicEligibilityReasonCode =
  (typeof PUBLIC_ELIGIBILITY_REASON_CODES)[number];

export interface PublicEligibilityInput {
  readonly interviewSession: InterviewSessionInput | InterviewSession;
  readonly contribution: ApprovedContributionInput | ApprovedContribution;
  readonly asOfDate: string;
}

export interface PublicEligibilityDecision {
  readonly version: 1;
  readonly contributionId: string;
  readonly evaluatedAsOfDate: string;
  readonly publicEligible: boolean;
  readonly reasonCodes: readonly PublicEligibilityReasonCode[];
}

function compareStrings(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function assertActualGovernanceDatesNotFuture(
  interviewSession: InterviewSession,
  contribution: ApprovedContribution,
  asOfDate: string,
): void {
  if (
    interviewSession.recordClass !== "actual" &&
    contribution.recordClass !== "actual"
  ) {
    return;
  }

  const dates: ReadonlyArray<readonly [string, string | null]> = [
    ["interview.occurredAt", interviewSession.occurredAt.slice(0, 10)],
    ["interview.consent.capturedOn", interviewSession.consent.capturedOn],
    ["interview.consent.expiresOn", interviewSession.consent.expiresOn],
    ["interview.consent.revokedOn", interviewSession.consent.revokedOn],
    [
      "interview.privacyClassification.classifiedOn",
      interviewSession.privacyClassification.classifiedOn,
    ],
    ["contribution.permission.grantedOn", contribution.permission.grantedOn],
    ["contribution.permission.expiresOn", contribution.permission.expiresOn],
    ["contribution.permission.revokedOn", contribution.permission.revokedOn],
    ["contribution.reviewDueDate", contribution.reviewDueDate],
    [
      "contribution.reviews.factual.reviewedOn",
      contribution.reviews.factual.reviewedOn,
    ],
    [
      "contribution.reviews.disclosure.reviewedOn",
      contribution.reviews.disclosure.reviewedOn,
    ],
    ["contribution.revocation.revokedOn", contribution.revocation.revokedOn],
  ];

  const future = dates.find(([, date]) => date !== null && date > asOfDate);
  if (future !== undefined) {
    throw new TypeError(
      `Actual governance date ${future[0]}=${future[1]} is after explicit asOfDate=${asOfDate}; synthetic fixtures may use future dates.`,
    );
  }
}

export function evaluatePublicEligibility(
  input: PublicEligibilityInput,
): PublicEligibilityDecision {
  const asOfDate = calendarDateSchema.parse(input.asOfDate);
  const interviewSession = interviewSessionSchema.parse(input.interviewSession);
  const contribution = approvedContributionSchema.parse(input.contribution);
  assertActualGovernanceDatesNotFuture(
    interviewSession,
    contribution,
    asOfDate,
  );
  const reasons = new Set<PublicEligibilityReasonCode>();

  if (
    interviewSession.recordClass === "synthetic" ||
    contribution.recordClass === "synthetic"
  ) {
    reasons.add("synthetic-record");
  }

  if (
    interviewSession.publicUse === "prohibited" ||
    contribution.publicUse === "prohibited"
  ) {
    reasons.add("public-use-prohibited");
  }

  if (contribution.interviewSessionRef !== interviewSession.sessionId) {
    reasons.add("interview-session-reference-mismatch");
  }

  if (contribution.status === "expired") {
    reasons.add("contribution-expired");
  } else if (contribution.status === "rejected") {
    reasons.add("contribution-rejected");
  } else if (contribution.status === "restricted") {
    reasons.add("contribution-restricted");
  }

  if (contribution.privacyClassification.level !== "public") {
    reasons.add("privacy-not-public");
  }

  if (contribution.permission.status !== "permitted") {
    reasons.add("permission-not-permitted");
  }

  if (contribution.permission.status === "revoked") {
    reasons.add("permission-revoked");
  }

  if (!contribution.permission.scopes.includes("public-claim")) {
    reasons.add("permission-public-claim-scope-missing");
  }

  if (
    contribution.permission.expiresOn !== null &&
    asOfDate > contribution.permission.expiresOn
  ) {
    reasons.add("permission-expired");
  }

  if (interviewSession.consent.internalUse !== "granted") {
    reasons.add("consent-internal-use-not-granted");
  }

  if (
    interviewSession.consent.expiresOn !== null &&
    asOfDate > interviewSession.consent.expiresOn
  ) {
    reasons.add("consent-expired");
  }

  if (
    interviewSession.consent.revokedOn !== null &&
    asOfDate >= interviewSession.consent.revokedOn
  ) {
    reasons.add("consent-revoked");
  }

  if (contribution.claimKind === "quotation") {
    if (interviewSession.consent.publicQuotation !== "granted") {
      reasons.add("consent-public-quotation-not-granted");
    }
    if (!contribution.permission.scopes.includes("public-quotation")) {
      reasons.add("permission-public-quotation-scope-missing");
    }
  }

  if (contribution.allowedAttribution.mode !== "anonymous") {
    if (interviewSession.consent.namedAttribution !== "granted") {
      reasons.add("consent-named-attribution-not-granted");
    }
    if (!contribution.permission.scopes.includes("named-attribution")) {
      reasons.add("permission-named-attribution-scope-missing");
    }
  }

  if (hasUnsafePublicText(contribution)) {
    reasons.add("public-text-unsafe");
  }

  if (contribution.reviews.factual.decision !== "approved") {
    reasons.add("factual-review-not-approved");
  }

  if (contribution.reviews.disclosure.decision !== "approved") {
    reasons.add("disclosure-review-not-approved");
  }

  if (asOfDate > contribution.reviewDueDate) {
    reasons.add("review-expired");
  }

  if (
    contribution.revocation.revokedOn !== null &&
    asOfDate >= contribution.revocation.revokedOn
  ) {
    reasons.add("contribution-revoked");
  }

  const reasonCodes = [...reasons].sort(compareStrings);

  return deepFreeze({
    version: 1 as const,
    contributionId: contribution.contributionId,
    evaluatedAsOfDate: asOfDate,
    publicEligible: reasonCodes.length === 0,
    reasonCodes,
  });
}
