import {
  approvedContributionSchema,
  interviewSessionSchema,
  type ApprovedContributionInput,
  type InterviewSessionInput,
} from "./schema";

export const SYNTHETIC_FIXTURE_METADATA = Object.freeze({
  recordClass: "synthetic" as const,
  publicUse: "prohibited" as const,
  notice:
    "Synthetic fixture only; not an actual interview, client case, quotation, contributor, reviewer, or verified metric.",
});

const SYNTHETIC_INTERVIEW_SESSION_INPUT: InterviewSessionInput = {
  version: 1,
  recordClass: SYNTHETIC_FIXTURE_METADATA.recordClass,
  publicUse: SYNTHETIC_FIXTURE_METADATA.publicUse,
  sessionId: "intv.abcdef012345",
  occurredAt: "2026-01-15T10:00:00+10:00",
  durationMinutes: 45,
  contributor: {
    internalRef: "contributor.abcdef012345",
    name: "Synthetic Contributor",
    role: "Synthetic role",
    authorityScope: ["Synthetic decision-boundary example"],
  },
  interviewer: {
    internalRef: "interviewer.012345abcdef",
    name: "Synthetic Interviewer",
    role: "Synthetic reviewer role",
  },
  consent: {
    capturedOn: "2026-01-15",
    recording: "not-requested",
    transcript: "not-requested",
    internalUse: "granted",
    publicQuotation: "granted",
    namedAttribution: "granted",
    expiresOn: "2026-12-31",
    revokedOn: null,
    revocationReason: null,
  },
  questions: [
    {
      id: "question.synthetic-boundary",
      prompt: "What can the synthetic check establish?",
      responseSummary: "Synthetic response summary for contract tests only.",
      privacyCategories: [],
    },
  ],
  rawNoteRef: "note.abcdef0123456789",
  privacyClassification: {
    level: "internal",
    categories: [],
    classifiedByRef: "reviewer.abcdef012345",
    classifiedOn: "2026-01-15",
  },
  redactionLog: [],
  limitations: [
    "This fixture is not evidence and must not enter public output.",
  ],
};

const SYNTHETIC_APPROVED_CONTRIBUTION_INPUT: ApprovedContributionInput = {
  version: 1,
  recordClass: SYNTHETIC_FIXTURE_METADATA.recordClass,
  publicUse: SYNTHETIC_FIXTURE_METADATA.publicUse,
  contributionId: "contrib.abcdef012345",
  interviewSessionRef: SYNTHETIC_INTERVIEW_SESSION_INPUT.sessionId,
  boundedClaim: "Synthetic bounded claim for contract tests only.",
  claimKind: "decision-boundary",
  permission: {
    status: "permitted",
    scopes: ["public-claim"],
    grantedOn: "2026-01-15",
    expiresOn: "2026-12-31",
    revokedOn: null,
    revocationReason: null,
  },
  privacyClassification: {
    level: "public",
    categories: [],
  },
  allowedAttribution: { mode: "anonymous" },
  supportedArticleIds: ["article.synthetic-expertise-fixture"],
  method: "Synthetic method summary for contract tests only.",
  denominator: null,
  unit: null,
  deduplication: null,
  inclusionCriteria: [],
  exclusionCriteria: [],
  dateRange: null,
  missingData: null,
  limitations: ["Synthetic fixture is not evidence."],
  reviewDueDate: "2026-12-31",
  revocation: { revokedOn: null, reason: null },
  reviews: {
    factual: {
      reviewId: "review.abcdef012345",
      reviewerRef: "reviewer.012345abcdef",
      decision: "approved",
      reviewedOn: "2026-01-15",
      notes: "Synthetic factual review marker; not a real approval.",
    },
    disclosure: {
      reviewId: "review.012345abcdef",
      reviewerRef: "reviewer.abcdef012345",
      decision: "approved",
      reviewedOn: "2026-01-15",
      notes: "Synthetic disclosure review marker; not a real approval.",
    },
  },
  status: "approved",
};

export const SYNTHETIC_INTERVIEW_SESSION = interviewSessionSchema.parse(
  SYNTHETIC_INTERVIEW_SESSION_INPUT,
);

export const SYNTHETIC_APPROVED_CONTRIBUTION = approvedContributionSchema.parse(
  SYNTHETIC_APPROVED_CONTRIBUTION_INPUT,
);
