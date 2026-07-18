import {
  computeArticleUpgradeCandidateDigest,
  computeSha256Digest,
} from "../canonical";
import type {
  ArticleUpgradeManifestInput,
  ArticleUpgradeTicketInput,
  ArticleUpgradeProvenance,
  Sha256Digest,
} from "../types";

const SYNTHETIC_DATE = "2026-07-19";
const SYNTHETIC_RELEASE_DATE = "2026-07-20";
const SYNTHETIC_PROVENANCE: ArticleUpgradeProvenance = "synthetic-fixture";
const CLUSTERS = [
  "supplier-verification",
  "factory-audit",
  "quality-inspection",
  "factory-visits",
  "china-sourcing",
] as const;

function digest(label: string): Sha256Digest {
  return computeSha256Digest({ fixture: "article-upgrade", label });
}

function verification(label: string): {
  status: "passed";
  evidenceDigest: Sha256Digest;
  verifiedAt: string;
  explanation: string;
  provenance: ArticleUpgradeProvenance;
} {
  return {
    status: "passed",
    evidenceDigest: digest(`${label}:evidence`),
    verifiedAt: SYNTHETIC_DATE,
    explanation: `Synthetic test evidence for ${label}; not a live review or approval.`,
    provenance: SYNTHETIC_PROVENANCE,
  };
}

function approval(
  id: string,
  actorId: string,
  subjectDigest: Sha256Digest,
  approvedAt: string,
) {
  return {
    status: "approved" as const,
    approvalId: id,
    actorId,
    approvedAt,
    subjectDigest,
    provenance: SYNTHETIC_PROVENANCE,
  };
}

function createSyntheticTicket(index: number): ArticleUpgradeTicketInput {
  const rank = (index + 1) as ArticleUpgradeTicketInput["rank"];
  const ticketId = String(index + 14) as ArticleUpgradeTicketInput["ticketId"];
  const cluster = CLUSTERS[index % CLUSTERS.length];
  const articleId = `synthetic-ranked-opportunity-${String(rank).padStart(2, "0")}`;
  const url = `/article/${articleId}`;
  const evidenceDigest = digest(`ticket-${ticketId}:evidence-package`);
  const ledgerDigest = digest("ticket-06:approved-ledger");

  const ticket: ArticleUpgradeTicketInput = {
    ticketId,
    rank,
    cluster,
    target: { articleId, url },
    owner: {
      id: `fixture-owner-${String(rank).padStart(2, "0")}`,
      kind: "test-fixture",
    },
    asOf: SYNTHETIC_DATE,
    provenance: SYNTHETIC_PROVENANCE,
    source: {
      baseline: {
        digest: digest(`ticket-${ticketId}:baseline`),
        capturedAt: SYNTHETIC_DATE,
        provenance: SYNTHETIC_PROVENANCE,
      },
      current: {
        digest: digest(`ticket-${ticketId}:current`),
        capturedAt: SYNTHETIC_DATE,
        provenance: SYNTHETIC_PROVENANCE,
      },
    },
    opportunityLock: {
      status: "locked",
      opportunityId: `fixture-opportunity-${String(rank).padStart(2, "0")}`,
      rank,
      cluster,
      targetUrl: url,
      opportunityDigest: digest(`ticket-${ticketId}:opportunity`),
      briefDigest: digest(`ticket-${ticketId}:brief`),
      rankingEvidenceDigest: digest(`ticket-${ticketId}:ranking-evidence`),
      lockedAt: SYNTHETIC_DATE,
      provenance: SYNTHETIC_PROVENANCE,
    },
    dependencies: {
      strictCutover: {
        status: "passed",
        evidenceDigest: digest("ticket-13:strict-cutover"),
        checkedAt: SYNTHETIC_DATE,
        provenance: SYNTHETIC_PROVENANCE,
      },
      migrationLedger: {
        status: "passed",
        currentDigest: ledgerDigest,
        approvedDigest: ledgerDigest,
        checkedAt: SYNTHETIC_DATE,
        provenance: SYNTHETIC_PROVENANCE,
      },
      evidenceGate: {
        status: "passed",
        packageDigest: evidenceDigest,
        reportDigest: digest(`ticket-${ticketId}:evidence-report`),
        checkedAt: SYNTHETIC_DATE,
        provenance: SYNTHETIC_PROVENANCE,
      },
    },
    requirements: {
      answerPassage: {
        ...verification(`ticket-${ticketId}:answer`),
        passageRef: `fixture://ticket-${ticketId}/answer-passage`,
      },
      faq: {
        ...verification(`ticket-${ticketId}:faq`),
        visibleStatus: "visible",
        eligibility: "eligible",
        schemaPlanned: true,
      },
      internalLinks: {
        ...verification(`ticket-${ticketId}:graph`),
        graphDigest: digest(`ticket-${ticketId}:graph`),
        targets: {
          pillar: `/article/synthetic-pillar-${cluster}`,
          sibling: `/article/synthetic-sibling-${String(rank).padStart(2, "0")}`,
          service: "/services",
          nextStep: "/enquiry",
        },
      },
      expertEvidence: {
        ...verification(`ticket-${ticketId}:expert`),
        contributionId: `fixture-contribution-${String(rank).padStart(2, "0")}`,
        contributionDigest: digest(`ticket-${ticketId}:expert-contribution`),
        sourceKind: "both",
      },
      mobileReview: {
        ...verification(`ticket-${ticketId}:mobile`),
        desktopPassed: true,
        mobilePassed: true,
      },
      metadataSchema: {
        ...verification(`ticket-${ticketId}:metadata`),
        metadataEligible: true,
        articleSchemaEligible: true,
        faqSchemaEligible: true,
      },
    },
    attribution: {
      mode: "declarative-metadata-only",
      contractRef: "fixture://ticket-30/approved-attribution-contract",
      allowlistRef: "fixture://ticket-30/approved-allowlist",
      campaign: `article-upgrade-${String(rank).padStart(2, "0")}`,
      cluster,
      contentId: articleId,
      trackingParameters: null,
      approval: approval(
        `fixture-attribution-approval-${String(rank).padStart(2, "0")}`,
        `fixture-privacy-reviewer-${String(rank).padStart(2, "0")}`,
        digest(`ticket-${ticketId}:attribution-contract`),
        SYNTHETIC_DATE,
      ),
    },
    approvals: {
      content: {
        status: "pending",
        approvalId: null,
        actorId: null,
        approvedAt: null,
        subjectDigest: null,
        provenance: SYNTHETIC_PROVENANCE,
      },
      release: {
        status: "pending",
        approvalId: null,
        actorId: null,
        approvedAt: null,
        subjectDigest: null,
        provenance: SYNTHETIC_PROVENANCE,
      },
    },
    claims: [
      {
        id: `fixture-ranking-claim-${String(rank).padStart(2, "0")}`,
        kind: "ranking",
        statement:
          "Synthetic ranking evidence is present for contract testing only.",
        evidenceDigest: digest(`ticket-${ticketId}:ranking-claim`),
        asOf: SYNTHETIC_DATE,
        provenance: SYNTHETIC_PROVENANCE,
      },
      {
        id: `fixture-causal-claim-${String(rank).padStart(2, "0")}`,
        kind: "causal",
        statement:
          "Synthetic causal evidence is present for contract testing only.",
        evidenceDigest: digest(`ticket-${ticketId}:causal-claim`),
        asOf: SYNTHETIC_DATE,
        provenance: SYNTHETIC_PROVENANCE,
      },
    ],
    observations: [
      {
        key: "search-position",
        status: "synthetic-fixture",
        value: rank,
        sourceDigest: digest(`ticket-${ticketId}:position`),
        observedAt: SYNTHETIC_DATE,
      },
      {
        key: "search-clicks",
        status: "synthetic-fixture",
        value: 42 + rank,
        sourceDigest: digest(`ticket-${ticketId}:clicks`),
        observedAt: SYNTHETIC_DATE,
      },
      {
        key: "search-impressions",
        status: "synthetic-fixture",
        value: 420 + rank,
        sourceDigest: digest(`ticket-${ticketId}:impressions`),
        observedAt: SYNTHETIC_DATE,
      },
      {
        key: "conversions",
        status: "synthetic-fixture",
        value: 4,
        sourceDigest: digest(`ticket-${ticketId}:conversions`),
        observedAt: SYNTHETIC_DATE,
      },
    ],
  };

  const candidateDigest = computeArticleUpgradeCandidateDigest(ticket);
  ticket.approvals.content = approval(
    `fixture-content-approval-${String(rank).padStart(2, "0")}`,
    `fixture-content-reviewer-${String(rank).padStart(2, "0")}`,
    candidateDigest,
    SYNTHETIC_DATE,
  );
  ticket.approvals.release = approval(
    `fixture-release-approval-${String(rank).padStart(2, "0")}`,
    `fixture-release-reviewer-${String(rank).padStart(2, "0")}`,
    candidateDigest,
    SYNTHETIC_RELEASE_DATE,
  );

  return ticket;
}

export function createSyntheticArticleUpgradeManifest(): ArticleUpgradeManifestInput {
  return {
    version: 1,
    asOf: SYNTHETIC_DATE,
    provenance: SYNTHETIC_PROVENANCE,
    tickets: Array.from({ length: 10 }, (_, index) =>
      createSyntheticTicket(index),
    ),
  };
}
