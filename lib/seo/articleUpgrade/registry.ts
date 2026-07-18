import { deepFreeze } from "./canonical";
import type {
  ArticleRequirementVerification,
  ArticleUpgradeApproval,
  ArticleUpgradeManifestInput,
  ArticleUpgradeProvenance,
  ArticleUpgradeTicketInput,
  ArticleUpgradeTicketSlot,
} from "./types";
import { ARTICLE_UPGRADE_SCHEMA_VERSION } from "./types";

export const ARTICLE_UPGRADE_TICKET_REGISTRY = deepFreeze(
  Array.from({ length: 10 }, (_, index) => ({
    ticketId: String(index + 14),
    rank: index + 1,
  })) as ArticleUpgradeTicketSlot[],
);

function pendingVerification(
  provenance: ArticleUpgradeProvenance,
  explanation: string,
): ArticleRequirementVerification {
  return {
    status: "pending",
    evidenceDigest: null,
    verifiedAt: null,
    explanation,
    provenance,
  };
}

function pendingApproval(
  provenance: ArticleUpgradeProvenance,
): ArticleUpgradeApproval {
  return {
    status: "pending",
    approvalId: null,
    actorId: null,
    approvedAt: null,
    subjectDigest: null,
    provenance,
  };
}

function createPendingTicket(
  slot: ArticleUpgradeTicketSlot,
  asOf: string,
): ArticleUpgradeTicketInput {
  const provenance = "live" as const;
  return {
    ...slot,
    cluster: null,
    target: null,
    owner: null,
    asOf,
    provenance,
    source: { baseline: null, current: null },
    opportunityLock: {
      status: "unlocked",
      opportunityId: null,
      rank: null,
      cluster: null,
      targetUrl: null,
      opportunityDigest: null,
      briefDigest: null,
      rankingEvidenceDigest: null,
      lockedAt: null,
      provenance,
    },
    dependencies: {
      strictCutover: {
        status: "pending",
        evidenceDigest: null,
        checkedAt: null,
        provenance,
      },
      migrationLedger: {
        status: "pending",
        currentDigest: null,
        approvedDigest: null,
        checkedAt: null,
        provenance,
      },
      evidenceGate: {
        status: "pending",
        packageDigest: null,
        reportDigest: null,
        checkedAt: null,
        provenance,
      },
    },
    requirements: {
      answerPassage: {
        ...pendingVerification(
          provenance,
          "Awaiting a verified answer passage.",
        ),
        passageRef: null,
      },
      faq: {
        ...pendingVerification(
          provenance,
          "Awaiting visible FAQ eligibility review.",
        ),
        visibleStatus: "unreviewed",
        eligibility: "unreviewed",
        schemaPlanned: false,
      },
      internalLinks: {
        ...pendingVerification(
          provenance,
          "Awaiting graph-validated link targets.",
        ),
        graphDigest: null,
        targets: { pillar: null, sibling: null, service: null, nextStep: null },
      },
      expertEvidence: {
        ...pendingVerification(
          provenance,
          "Awaiting approved expert or first-party evidence.",
        ),
        contributionId: null,
        contributionDigest: null,
        sourceKind: null,
      },
      mobileReview: {
        ...pendingVerification(
          provenance,
          "Awaiting desktop and mobile review evidence.",
        ),
        desktopPassed: null,
        mobilePassed: null,
      },
      metadataSchema: {
        ...pendingVerification(
          provenance,
          "Awaiting metadata and schema eligibility review.",
        ),
        metadataEligible: null,
        articleSchemaEligible: null,
        faqSchemaEligible: null,
      },
    },
    attribution: {
      mode: "declarative-metadata-only",
      contractRef: null,
      allowlistRef: null,
      campaign: null,
      cluster: null,
      contentId: null,
      trackingParameters: null,
      approval: pendingApproval(provenance),
    },
    approvals: {
      content: pendingApproval(provenance),
      release: pendingApproval(provenance),
    },
    claims: [],
    observations: [
      "search-position",
      "search-clicks",
      "search-impressions",
      "conversions",
    ].map((key) => ({
      key: key as ArticleUpgradeTicketInput["observations"][number]["key"],
      status: "unavailable" as const,
      value: null,
      sourceDigest: null,
      observedAt: null,
    })),
  };
}

export function createPendingArticleUpgradeManifest(
  asOf: string,
): ArticleUpgradeManifestInput {
  return deepFreeze({
    version: ARTICLE_UPGRADE_SCHEMA_VERSION,
    asOf,
    provenance: "live",
    tickets: ARTICLE_UPGRADE_TICKET_REGISTRY.map((slot) =>
      createPendingTicket(slot, asOf),
    ),
  });
}
