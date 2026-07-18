import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  approvedContributionSchema,
  evaluatePublicEligibility,
  interviewSessionSchema,
  projectPublicContribution,
  SYNTHETIC_APPROVED_CONTRIBUTION,
  SYNTHETIC_INTERVIEW_SESSION,
} from "./index";

const BASE_INTERVIEW_INPUT = {
  version: 1 as const,
  recordClass: "actual" as const,
  publicUse: "governed" as const,
  sessionId: "intv.0123456789ab",
  occurredAt: "2026-07-18T09:00:00+09:30",
  durationMinutes: 45,
  contributor: {
    internalRef: "contributor.0123456789ab",
    name: "Example Contributor",
    role: "Operations lead",
    authorityScope: ["Supplier verification decision boundaries"],
  },
  interviewer: {
    internalRef: "interviewer.abcdef012345",
    name: "Example Interviewer",
    role: "Content reviewer",
  },
  consent: {
    capturedOn: "2026-07-18",
    recording: "denied" as const,
    transcript: "denied" as const,
    internalUse: "granted" as const,
    publicQuotation: "denied" as const,
    namedAttribution: "denied" as const,
    expiresOn: "2026-10-18",
    revokedOn: null,
    revocationReason: null,
  },
  questions: [
    {
      id: "question.decision-boundary",
      prompt: "What can this check establish, and what can it not establish?",
      responseSummary: "An internal summary pending evidence review.",
      privacyCategories: [],
    },
  ],
  rawNoteRef: "note.0123456789abcdef",
  privacyClassification: {
    level: "internal" as const,
    categories: [],
    classifiedByRef: "reviewer.0123456789ab",
    classifiedOn: "2026-07-18",
  },
  redactionLog: [],
  limitations: [
    "The interview does not independently verify third-party facts.",
  ],
};

describe("expertise interview contract", () => {
  it("accepts a bounded 45-minute interview and returns a deep-frozen record", () => {
    const parsed = interviewSessionSchema.parse(BASE_INTERVIEW_INPUT);

    expect(parsed.durationMinutes).toBe(45);
    expect(parsed.sessionId).toBe("intv.0123456789ab");
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.contributor)).toBe(true);
    expect(Object.isFrozen(parsed.questions)).toBe(true);
    expect(Object.isFrozen(parsed.questions[0])).toBe(true);
  });
});

const BASE_CONTRIBUTION_INPUT = {
  version: 1 as const,
  recordClass: "actual" as const,
  publicUse: "governed" as const,
  contributionId: "contrib.0123456789ab",
  interviewSessionRef: "intv.0123456789ab",
  boundedClaim:
    "A registry check can confirm recorded company details but cannot establish current operating capability.",
  claimKind: "decision-boundary" as const,
  permission: {
    status: "permitted" as const,
    scopes: ["public-claim" as const],
    grantedOn: "2026-07-18",
    expiresOn: "2026-10-18",
    revokedOn: null,
    revocationReason: null,
  },
  privacyClassification: {
    level: "public" as const,
    categories: [],
  },
  allowedAttribution: { mode: "anonymous" as const },
  supportedArticleIds: ["article.verify-chinese-supplier"],
  method: "Structured expertise interview followed by bounded claim review.",
  denominator: null,
  unit: null,
  deduplication: null,
  inclusionCriteria: [],
  exclusionCriteria: [],
  dateRange: null,
  missingData: null,
  limitations: [
    "The contribution does not replace current official registry evidence.",
  ],
  reviewDueDate: "2026-10-18",
  revocation: { revokedOn: null, reason: null },
  reviews: {
    factual: {
      reviewId: "review.0123456789ab",
      reviewerRef: "reviewer.0123456789ab",
      decision: "approved" as const,
      reviewedOn: "2026-07-18",
      notes: "The claim is bounded to the contributor's authority scope.",
    },
    disclosure: {
      reviewId: "review.abcdef012345",
      reviewerRef: "reviewer.abcdef012345",
      decision: "approved" as const,
      reviewedOn: "2026-07-18",
      notes: "The approved wording contains no restricted details.",
    },
  },
  status: "approved" as const,
};

describe("approved expertise contribution contract", () => {
  it("accepts a bounded non-quantitative contribution with independent reviews", () => {
    const parsed = approvedContributionSchema.parse(BASE_CONTRIBUTION_INPUT);

    expect(parsed.contributionId).toBe("contrib.0123456789ab");
    expect(parsed.reviews.factual.reviewId).not.toBe(
      parsed.reviews.disclosure.reviewId,
    );
    expect(parsed.reviews.factual.reviewerRef).not.toBe(
      parsed.reviews.disclosure.reviewerRef,
    );
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.reviews)).toBe(true);
  });

  it("rejects quantitative evidence without denominator, date range, unit, criteria, dedupe, missing-data, limitations, reviewer, and permission", () => {
    expect(() =>
      approvedContributionSchema.parse({
        ...BASE_CONTRIBUTION_INPUT,
        claimKind: "quantitative",
        limitations: [],
        permission: {
          ...BASE_CONTRIBUTION_INPUT.permission,
          status: "unresolved",
        },
      }),
    ).toThrow(
      /denominator|dateRange|unit|inclusionCriteria|exclusionCriteria|deduplication|missingData|limitations|review|permission/i,
    );
  });
});

describe("public eligibility gate", () => {
  it("allows a reviewed bounded claim even when recording and transcript consent were denied", () => {
    const decision = evaluatePublicEligibility({
      interviewSession: BASE_INTERVIEW_INPUT,
      contribution: BASE_CONTRIBUTION_INPUT,
      asOfDate: "2026-07-18",
    });

    expect(decision).toEqual({
      version: 1,
      contributionId: "contrib.0123456789ab",
      evaluatedAsOfDate: "2026-07-18",
      publicEligible: true,
      reasonCodes: [],
    });
    expect(Object.isFrozen(decision)).toBe(true);
    expect(Object.isFrozen(decision.reasonCodes)).toBe(true);
  });

  it("requires quotation and named-attribution consent only when those scopes are used", () => {
    const quotation = evaluatePublicEligibility({
      interviewSession: BASE_INTERVIEW_INPUT,
      contribution: {
        ...BASE_CONTRIBUTION_INPUT,
        claimKind: "quotation",
        permission: {
          ...BASE_CONTRIBUTION_INPUT.permission,
          scopes: ["public-claim", "public-quotation"],
        },
      },
      asOfDate: "2026-07-18",
    });
    const named = evaluatePublicEligibility({
      interviewSession: BASE_INTERVIEW_INPUT,
      contribution: {
        ...BASE_CONTRIBUTION_INPUT,
        permission: {
          ...BASE_CONTRIBUTION_INPUT.permission,
          scopes: ["named-attribution", "public-claim"],
        },
        allowedAttribution: { mode: "named" },
      },
      asOfDate: "2026-07-18",
    });

    expect(quotation.publicEligible).toBe(false);
    expect(quotation.reasonCodes).toContain(
      "consent-public-quotation-not-granted",
    );
    expect(named.publicEligible).toBe(false);
    expect(named.reasonCodes).toContain(
      "consent-named-attribution-not-granted",
    );
  });
});

describe("public contribution projection", () => {
  it("projects only approved bounded public fields and removes private interview data", () => {
    const projection = projectPublicContribution({
      interviewSession: BASE_INTERVIEW_INPUT,
      contribution: BASE_CONTRIBUTION_INPUT,
      asOfDate: "2026-07-18",
    });

    expect(projection).toEqual({
      version: 1,
      contributionId: "contrib.0123456789ab",
      boundedClaim:
        "A registry check can confirm recorded company details but cannot establish current operating capability.",
      claimKind: "decision-boundary",
      attribution: { mode: "anonymous" },
      supportedArticleIds: ["article.verify-chinese-supplier"],
      methodology: {
        summary:
          "Structured expertise interview followed by bounded claim review.",
        quantitative: false,
        denominator: null,
        unit: null,
        deduplication: null,
        inclusionCriteria: [],
        exclusionCriteria: [],
        dateRange: null,
        missingData: null,
      },
      limitations: [
        "The contribution does not replace current official registry evidence.",
      ],
      reviewDueDate: "2026-10-18",
    });

    const serialised = JSON.stringify(projection);
    expect(serialised).not.toContain("note.0123456789abcdef");
    expect(serialised).not.toContain("intv.0123456789ab");
    expect(serialised).not.toContain("contributor.0123456789ab");
    expect(serialised).not.toContain("interviewer.abcdef012345");
    expect(serialised).not.toContain("reviewer.0123456789ab");
    expect(serialised).not.toContain("Example Contributor");
    expect(serialised).not.toContain("Example Interviewer");
    expect(serialised).not.toContain("privacyClassification");
    expect(serialised).not.toContain("permission");
    expect(serialised).not.toContain("reviews");
    expect(Object.isFrozen(projection)).toBe(true);
    expect(Object.isFrozen(projection?.methodology)).toBe(true);
  });

  it("returns null for revoked material instead of exposing it", () => {
    const projection = projectPublicContribution({
      interviewSession: BASE_INTERVIEW_INPUT,
      contribution: {
        ...BASE_CONTRIBUTION_INPUT,
        revocation: {
          revokedOn: "2026-07-18",
          reason: "Permission was withdrawn by the contributor.",
        },
      },
      asOfDate: "2026-07-18",
    });

    expect(projection).toBeNull();
  });
});

describe("expertise safety boundaries", () => {
  it("rejects URLs, local paths, email addresses, and phone numbers as raw-note references", () => {
    for (const rawNoteRef of [
      "https://private.example/interview.txt",
      "/private/interview.txt",
      "../private/interview.txt",
      "person@example.com",
      "+61 400 123 456",
    ]) {
      expect(() =>
        interviewSessionSchema.parse({
          ...BASE_INTERVIEW_INPUT,
          rawNoteRef,
        }),
      ).toThrow(/opaque private-store reference/i);
    }
  });

  it("rejects sessions longer than the promised 45-minute human interview", () => {
    expect(() =>
      interviewSessionSchema.parse({
        ...BASE_INTERVIEW_INPUT,
        durationMinutes: 46,
      }),
    ).toThrow(/45/);
  });

  it("requires distinct factual and disclosure reviewers", () => {
    expect(() =>
      approvedContributionSchema.parse({
        ...BASE_CONTRIBUTION_INPUT,
        reviews: {
          ...BASE_CONTRIBUTION_INPUT.reviews,
          disclosure: {
            ...BASE_CONTRIBUTION_INPUT.reviews.disclosure,
            reviewerRef: BASE_CONTRIBUTION_INPUT.reviews.factual.reviewerRef,
          },
        },
      }),
    ).toThrow(/independent reviewers/i);
  });

  it("requires complete quantitative provenance instead of accepting a bare number", () => {
    const complete = approvedContributionSchema.parse({
      ...BASE_CONTRIBUTION_INPUT,
      claimKind: "quantitative",
      denominator: 42,
      unit: "supplier records",
      deduplication: "One record per supplier per review period.",
      inclusionCriteria: ["Records meeting the stated review scope."],
      exclusionCriteria: ["Duplicate records and incomplete records."],
      dateRange: { start: "2026-01-01", end: "2026-06-30" },
      missingData: "Two records lacked a complete date and were excluded.",
    });

    expect(complete.denominator).toBe(42);
    expect(complete.dateRange).toEqual({
      start: "2026-01-01",
      end: "2026-06-30",
    });
  });

  it("blocks consent expiry and revocation at the explicit as-of date", () => {
    const expired = evaluatePublicEligibility({
      interviewSession: BASE_INTERVIEW_INPUT,
      contribution: BASE_CONTRIBUTION_INPUT,
      asOfDate: "2026-10-19",
    });
    const revoked = evaluatePublicEligibility({
      interviewSession: {
        ...BASE_INTERVIEW_INPUT,
        consent: {
          ...BASE_INTERVIEW_INPUT.consent,
          revokedOn: "2026-07-18",
          revocationReason: "Consent was withdrawn.",
        },
      },
      contribution: BASE_CONTRIBUTION_INPUT,
      asOfDate: "2026-07-18",
    });

    expect(expired.publicEligible).toBe(false);
    expect(expired.reasonCodes).toEqual(
      expect.arrayContaining(["consent-expired", "permission-expired"]),
    );
    expect(revoked.publicEligible).toBe(false);
    expect(revoked.reasonCodes).toContain("consent-revoked");
  });

  it("never treats synthetic fixtures as public evidence", () => {
    const decision = evaluatePublicEligibility({
      interviewSession: SYNTHETIC_INTERVIEW_SESSION,
      contribution: SYNTHETIC_APPROVED_CONTRIBUTION,
      asOfDate: "2026-07-18",
    });

    expect(SYNTHETIC_INTERVIEW_SESSION.recordClass).toBe("synthetic");
    expect(SYNTHETIC_INTERVIEW_SESSION.publicUse).toBe("prohibited");
    expect(SYNTHETIC_APPROVED_CONTRIBUTION.recordClass).toBe("synthetic");
    expect(SYNTHETIC_APPROVED_CONTRIBUTION.publicUse).toBe("prohibited");
    expect(decision.publicEligible).toBe(false);
    expect(decision.reasonCodes).toContain("synthetic-record");
  });
});

describe("expertise determinism and release safety", () => {
  it("canonicalises equivalent input order without mutating inputs", () => {
    const interviewInput = {
      ...BASE_INTERVIEW_INPUT,
      contributor: {
        ...BASE_INTERVIEW_INPUT.contributor,
        authorityScope: [
          "Safe examples",
          "Supplier verification decision boundaries",
          "Safe examples",
        ],
      },
      questions: [
        {
          id: "question.z-last",
          prompt: "What is the final boundary?",
          responseSummary: "A synthetic ordering check.",
          privacyCategories: ["supplier" as const, "person" as const],
        },
        ...BASE_INTERVIEW_INPUT.questions,
      ],
    };
    const contributionInput = {
      ...BASE_CONTRIBUTION_INPUT,
      supportedArticleIds: [
        "article.z-last",
        "article.verify-chinese-supplier",
        "article.z-last",
      ],
      inclusionCriteria: ["B", "A", "B"],
      exclusionCriteria: ["D", "C", "D"],
      limitations: [
        "Second limitation",
        "First limitation",
        "Second limitation",
      ],
    };
    const interviewBefore = JSON.stringify(interviewInput);
    const contributionBefore = JSON.stringify(contributionInput);

    const canonicalInterview = interviewSessionSchema.parse(interviewInput);
    const canonicalContribution =
      approvedContributionSchema.parse(contributionInput);
    const canonicalInterviewAgain = interviewSessionSchema.parse({
      ...interviewInput,
      questions: [...interviewInput.questions].reverse(),
      contributor: {
        ...interviewInput.contributor,
        authorityScope: [
          ...interviewInput.contributor.authorityScope,
        ].reverse(),
      },
    });
    const canonicalContributionAgain = approvedContributionSchema.parse({
      ...contributionInput,
      supportedArticleIds: [...contributionInput.supportedArticleIds].reverse(),
      inclusionCriteria: [...contributionInput.inclusionCriteria].reverse(),
      exclusionCriteria: [...contributionInput.exclusionCriteria].reverse(),
      limitations: [...contributionInput.limitations].reverse(),
    });

    expect(JSON.stringify(canonicalInterview)).toBe(
      JSON.stringify(canonicalInterviewAgain),
    );
    expect(JSON.stringify(canonicalContribution)).toBe(
      JSON.stringify(canonicalContributionAgain),
    );
    expect(JSON.stringify(interviewInput)).toBe(interviewBefore);
    expect(JSON.stringify(contributionInput)).toBe(contributionBefore);
  });

  it("deep-freezes every emitted nested object and array", () => {
    const assertDeepFrozen = (value: unknown): void => {
      if (value === null || typeof value !== "object") return;
      expect(Object.isFrozen(value)).toBe(true);
      for (const nestedValue of Object.values(value)) {
        assertDeepFrozen(nestedValue);
      }
    };

    const interview = interviewSessionSchema.parse({
      ...BASE_INTERVIEW_INPUT,
      redactionLog: [
        {
          id: "redaction.0123456789ab",
          category: "supplier",
          action: "generalised",
          rationale: "Specific supplier detail removed from the safe summary.",
        },
      ],
    });
    const contribution = approvedContributionSchema.parse({
      ...BASE_CONTRIBUTION_INPUT,
      claimKind: "quantitative",
      denominator: 42,
      unit: "reviewed records",
      deduplication: "One record per reviewed supplier.",
      inclusionCriteria: ["Records in the stated review period."],
      exclusionCriteria: ["Duplicates and incomplete records."],
      dateRange: { start: "2026-01-01", end: "2026-06-30" },
      missingData: "No records were available outside the stated period.",
    });
    const projection = projectPublicContribution({
      interviewSession: interview,
      contribution,
      asOfDate: "2026-07-18",
    });

    assertDeepFrozen(interview);
    assertDeepFrozen(contribution);
    assertDeepFrozen(projection);
  });

  it("blocks restricted, rejected, expired, and independently unapproved records", () => {
    for (const status of ["restricted", "rejected", "expired"] as const) {
      const decision = evaluatePublicEligibility({
        interviewSession: BASE_INTERVIEW_INPUT,
        contribution: { ...BASE_CONTRIBUTION_INPUT, status },
        asOfDate: "2026-07-18",
      });

      expect(decision.publicEligible).toBe(false);
      expect(
        projectPublicContribution({
          interviewSession: BASE_INTERVIEW_INPUT,
          contribution: { ...BASE_CONTRIBUTION_INPUT, status },
          asOfDate: "2026-07-18",
        }),
      ).toBeNull();
    }

    const factualPending = evaluatePublicEligibility({
      interviewSession: BASE_INTERVIEW_INPUT,
      contribution: {
        ...BASE_CONTRIBUTION_INPUT,
        status: "restricted",
        reviews: {
          ...BASE_CONTRIBUTION_INPUT.reviews,
          factual: {
            ...BASE_CONTRIBUTION_INPUT.reviews.factual,
            decision: "changes-required",
          },
        },
      },
      asOfDate: "2026-07-18",
    });
    const disclosurePending = evaluatePublicEligibility({
      interviewSession: BASE_INTERVIEW_INPUT,
      contribution: {
        ...BASE_CONTRIBUTION_INPUT,
        status: "restricted",
        reviews: {
          ...BASE_CONTRIBUTION_INPUT.reviews,
          disclosure: {
            ...BASE_CONTRIBUTION_INPUT.reviews.disclosure,
            decision: "changes-required",
          },
        },
      },
      asOfDate: "2026-07-18",
    });

    expect(factualPending.reasonCodes).toContain("factual-review-not-approved");
    expect(disclosurePending.reasonCodes).toContain(
      "disclosure-review-not-approved",
    );
  });

  it("requires named-attribution consent for every non-anonymous attribution mode", () => {
    for (const mode of ["organisation-only", "role-only"] as const) {
      const decision = evaluatePublicEligibility({
        interviewSession: BASE_INTERVIEW_INPUT,
        contribution: {
          ...BASE_CONTRIBUTION_INPUT,
          allowedAttribution: { mode },
          permission: {
            ...BASE_CONTRIBUTION_INPUT.permission,
            scopes: ["public-claim", "named-attribution"],
          },
        },
        asOfDate: "2026-07-18",
      });

      expect(decision.publicEligible).toBe(false);
      expect(decision.reasonCodes).toContain(
        "consent-named-attribution-not-granted",
      );
    }
  });

  it("never projects obvious private data embedded in a publishable text field", () => {
    const projection = projectPublicContribution({
      interviewSession: BASE_INTERVIEW_INPUT,
      contribution: {
        ...BASE_CONTRIBUTION_INPUT,
        boundedClaim:
          "Contact person@example.com at +61 400 123 456 for the private note.",
      },
      asOfDate: "2026-07-18",
    });

    expect(projection).toBeNull();
  });
});

describe("expertise expiry, revocation, and side-effect guards", () => {
  it("rejects zero or negative quantitative denominators", () => {
    for (const denominator of [0, -1]) {
      expect(() =>
        approvedContributionSchema.parse({
          ...BASE_CONTRIBUTION_INPUT,
          claimKind: "quantitative",
          denominator,
          unit: "reviewed records",
          deduplication: "One record per reviewed supplier.",
          inclusionCriteria: ["Records in the stated review period."],
          exclusionCriteria: ["Duplicates and incomplete records."],
          dateRange: { start: "2026-01-01", end: "2026-06-30" },
          missingData: "No records were available outside the stated period.",
        }),
      ).toThrow(/denominator|greater than 0|too small/i);
    }
  });

  it("blocks permission revocation and an expired review window", () => {
    const permissionRevoked = evaluatePublicEligibility({
      interviewSession: BASE_INTERVIEW_INPUT,
      contribution: {
        ...BASE_CONTRIBUTION_INPUT,
        status: "restricted",
        permission: {
          ...BASE_CONTRIBUTION_INPUT.permission,
          status: "revoked",
          revokedOn: "2026-07-18",
          revocationReason: "The contributor withdrew publication permission.",
        },
      },
      asOfDate: "2026-07-18",
    });
    const reviewExpired = evaluatePublicEligibility({
      interviewSession: {
        ...BASE_INTERVIEW_INPUT,
        consent: {
          ...BASE_INTERVIEW_INPUT.consent,
          expiresOn: "2026-12-31",
        },
      },
      contribution: {
        ...BASE_CONTRIBUTION_INPUT,
        permission: {
          ...BASE_CONTRIBUTION_INPUT.permission,
          expiresOn: "2026-12-31",
        },
      },
      asOfDate: "2026-10-19",
    });

    expect(permissionRevoked.publicEligible).toBe(false);
    expect(permissionRevoked.reasonCodes).toEqual(
      expect.arrayContaining([
        "permission-not-permitted",
        "permission-revoked",
      ]),
    );
    expect(reviewExpired.publicEligible).toBe(false);
    expect(reviewExpired.reasonCodes).toContain("review-expired");
  });

  it("does not import wall-clock, environment, filesystem, network, or publication APIs", () => {
    for (const fileName of [
      "schema.ts",
      "eligibility.ts",
      "safety.ts",
      "publicProjection.ts",
      "fixtures.ts",
    ]) {
      const source = readFileSync(join(__dirname, fileName), "utf8");

      expect(source).not.toMatch(/\bDate\.now\s*\(/);
      expect(source).not.toMatch(/\bnew\s+Date\s*\(/);
      expect(source).not.toMatch(/\bprocess\.(?:env|cwd)\b/);
      expect(source).not.toMatch(/\bfetch\s*\(/);
      expect(source).not.toMatch(
        /from\s+["'](?:node:)?(?:fs|child_process|http|https)["']/,
      );
      expect(source).not.toMatch(/\b(?:publish|deploy|indexing)\s*\(/i);
      expect(source).not.toMatch(/content\/(?:blog|seo\/evidence)/);
    }
  });
});
