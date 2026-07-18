import {
  approvedContributionSchema,
  deepFreeze,
  interviewSessionSchema,
  type ApprovedContribution,
  type ApprovedContributionInput,
  type InterviewSession,
  type InterviewSessionInput,
} from "./schema";
import { evaluatePublicEligibility } from "./eligibility";

export interface PublicContributionProjectionInput {
  readonly interviewSession: InterviewSessionInput | InterviewSession;
  readonly contribution: ApprovedContributionInput | ApprovedContribution;
  readonly asOfDate: string;
}

export interface PublicContributionProjection {
  readonly version: 1;
  readonly contributionId: string;
  readonly boundedClaim: string;
  readonly claimKind: string;
  readonly attribution: {
    readonly mode: string;
  };
  readonly supportedArticleIds: readonly string[];
  readonly methodology: {
    readonly summary: string;
    readonly quantitative: boolean;
    readonly denominator: number | null;
    readonly unit: string | null;
    readonly deduplication: string | null;
    readonly inclusionCriteria: readonly string[];
    readonly exclusionCriteria: readonly string[];
    readonly dateRange: { readonly start: string; readonly end: string } | null;
    readonly missingData: string | null;
  };
  readonly limitations: readonly string[];
  readonly reviewDueDate: string;
}

export function projectPublicContribution(
  input: PublicContributionProjectionInput,
): PublicContributionProjection | null {
  const interviewSession = interviewSessionSchema.parse(input.interviewSession);
  const contribution = approvedContributionSchema.parse(input.contribution);
  const eligibility = evaluatePublicEligibility({
    interviewSession,
    contribution,
    asOfDate: input.asOfDate,
  });

  if (!eligibility.publicEligible) return null;

  return deepFreeze({
    version: 1 as const,
    contributionId: contribution.contributionId,
    boundedClaim: contribution.boundedClaim,
    claimKind: contribution.claimKind,
    attribution: {
      mode: contribution.allowedAttribution.mode,
    },
    supportedArticleIds: [...contribution.supportedArticleIds],
    methodology: {
      summary: contribution.method,
      quantitative: contribution.claimKind === "quantitative",
      denominator: contribution.denominator,
      unit: contribution.unit,
      deduplication: contribution.deduplication,
      inclusionCriteria: [...contribution.inclusionCriteria],
      exclusionCriteria: [...contribution.exclusionCriteria],
      dateRange:
        contribution.dateRange === null ? null : { ...contribution.dateRange },
      missingData: contribution.missingData,
    },
    limitations: [...contribution.limitations],
    reviewDueDate: contribution.reviewDueDate,
  });
}
