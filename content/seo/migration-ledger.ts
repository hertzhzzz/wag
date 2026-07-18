import {
  defineMigrationLedger,
  sortCodePoints,
  type MigrationLedger,
  type MigrationLedgerEntry,
  type MigrationOpportunityRecord,
  type MigrationRiskRecord,
  type TraceableNumericInput,
} from "../../lib/seo/migrationLedger";
import type { ClusterId } from "../../lib/seo/clusterSchema";

const commercialRootByCluster: Readonly<Record<ClusterId, string>> = {
  "supplier-verification": "/supplier-verification",
  "factory-audit": "/factory-audit-china",
  "quality-inspection": "/quality-inspection-china",
  "factory-visits": "/visiting-chinese-factories",
  "china-sourcing": "/services",
};

const editorialPillarByCluster: Readonly<Record<ClusterId, string>> = {
  "supplier-verification": "/article/verify-chinese-supplier",
  "factory-audit": "/article/supplier-audit-check-sheet-china",
  "quality-inspection": "/article/china-quality-inspection-guide",
  "factory-visits":
    "/article/visiting-chinese-factories-australian-business-checklist",
  "china-sourcing": "/article/importing-from-china-australia-guide",
};

function unavailableInput(): TraceableNumericInput {
  return {
    value: null,
    dataStatus: "unavailable",
    source: null,
    asOf: null,
  };
}

function unavailableOpportunity(): MigrationOpportunityRecord {
  return {
    totalScore: null,
    dataStatus: "unavailable",
    factors: {
      "service-lead-relevance": unavailableInput(),
      "australian-action-intent": unavailableInput(),
      "evidence-readiness": unavailableInput(),
      "gsc-performance": unavailableInput(),
      "serp-gap": unavailableInput(),
      "geo-answerability": unavailableInput(),
    },
    liveInputs: {
      gscClicks: unavailableInput(),
      gscImpressions: unavailableInput(),
      gscAveragePosition: unavailableInput(),
      ga4OrganicSessions: unavailableInput(),
      qualifiedLeads: unavailableInput(),
      migrationEffort: unavailableInput(),
    },
  };
}

function unavailableRisk(): MigrationRiskRecord {
  return {
    totalScore: null,
    dataStatus: "unavailable",
    factors: {
      "cannibalisation-risk": unavailableInput(),
      "evidence-risk": unavailableInput(),
      "migration-effort": unavailableInput(),
    },
  };
}

type EntrySeed = Pick<MigrationLedgerEntry, "contentId" | "slug" | "route"> & {
  readonly classification: MigrationLedgerEntry["classification"];
  readonly action: MigrationLedgerEntry["decision"]["action"];
  readonly rationale: string;
};

function entry(seed: EntrySeed): MigrationLedgerEntry {
  const commercialRoot = commercialRootByCluster[seed.classification.cluster];
  const editorialPillar = editorialPillarByCluster[seed.classification.cluster];
  const requiredLinks =
    seed.classification.role === "pillar"
      ? [commercialRoot]
      : sortCodePoints([commercialRoot, editorialPillar]);

  return {
    contentId: seed.contentId,
    slug: seed.slug,
    route: seed.route,
    classification: seed.classification,
    requiredLinks,
    decision: {
      action: seed.action,
      rationale: seed.rationale,
      reviewStatus: "pending",
      reviewer: null,
      reviewedOn: null,
      lowTrafficAloneSufficient: false,
    },
    opportunity: unavailableOpportunity(),
    risk: unavailableRisk(),
  };
}

const entries: readonly MigrationLedgerEntry[] = [
  entry({
    contentId: "article.bulk-procurement-china-guide",
    slug: "bulk-procurement-china-guide",
    route: "/article/bulk-procurement-china-guide",
    classification: {
      cluster: "china-sourcing",
      role: "supporting",
      searchIntent: "bulk-procurement",
      funnelStage: "evaluation",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Preserve the existing bulk-procurement URL while adding governed sourcing evidence and links to the sourcing service and importing pillar.",
  }),
  entry({
    contentId: "article.check-chinese-company-samr",
    slug: "check-chinese-company-samr",
    route: "/article/check-chinese-company-samr",
    classification: {
      cluster: "supplier-verification",
      role: "supporting",
      searchIntent: "company-registry-check",
      funnelStage: "evaluation",
      targetMarket: "AU",
    },
    action: "keep",
    rationale:
      "Keep the governed SAMR pilot at its current URL because it has a distinct company-registry task and already carries the approved evidence contract.",
  }),
  entry({
    contentId: "article.china-factory-tour-guide",
    slug: "china-factory-tour-guide",
    route: "/article/china-factory-tour-guide",
    classification: {
      cluster: "factory-visits",
      role: "supporting",
      searchIntent: "factory-tour-planning",
      funnelStage: "solution-aware",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Retain the factory-tour planning URL and refresh its practical evidence, scope boundaries, and links to both factory-visit roots.",
  }),
  entry({
    contentId: "article.china-factory-visit-agent-australia",
    slug: "china-factory-visit-agent-australia",
    route: "/article/china-factory-visit-agent-australia",
    classification: {
      cluster: "factory-visits",
      role: "supporting",
      searchIntent: "factory-visit-agent",
      funnelStage: "decision",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Preserve the Australia-focused visit-agent URL while clarifying service boundaries and connecting decision-stage readers to both visit roots.",
  }),
  entry({
    contentId: "article.china-sourcing-agent-vs-direct",
    slug: "china-sourcing-agent-vs-direct",
    route: "/article/china-sourcing-agent-vs-direct",
    classification: {
      cluster: "china-sourcing",
      role: "comparison",
      searchIntent: "sourcing-model-comparison",
      funnelStage: "evaluation",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Keep the comparison URL and refresh the decision framework so it remains distinct from the general importing pillar and sourcing-agent service content.",
  }),
  entry({
    contentId: "article.china-sourcing-risks",
    slug: "china-sourcing-risks",
    route: "/article/china-sourcing-risks",
    classification: {
      cluster: "china-sourcing",
      role: "supporting",
      searchIntent: "sourcing-risk-management",
      funnelStage: "problem-aware",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Preserve the broad sourcing-risk URL while separating procurement risk from supplier-scam verification and strengthening evidence-backed mitigations.",
  }),
  entry({
    contentId: "article.china-supplier-scams",
    slug: "china-supplier-scams",
    route: "/article/china-supplier-scams",
    classification: {
      cluster: "supplier-verification",
      role: "supporting",
      searchIntent: "supplier-scam-prevention",
      funnelStage: "problem-aware",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Retain the scam-prevention URL and refresh it around verification evidence, warning-sign boundaries, and links to the verification service and pillar.",
  }),
  entry({
    contentId: "article.construction-materials-sourcing-from-china",
    slug: "construction-materials-sourcing-from-china",
    route: "/article/construction-materials-sourcing-from-china",
    classification: {
      cluster: "china-sourcing",
      role: "supporting",
      searchIntent: "category-sourcing",
      funnelStage: "solution-aware",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Keep this category-specific URL and refresh its Australian procurement evidence without merging it into the broader importing guide.",
  }),
  entry({
    contentId: "article.factory-vs-trading-company-china-guide",
    slug: "factory-vs-trading-company-china-guide",
    route: "/article/factory-vs-trading-company-china-guide",
    classification: {
      cluster: "supplier-verification",
      role: "comparison",
      searchIntent: "supplier-type-comparison",
      funnelStage: "evaluation",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Preserve the factory-versus-trader comparison URL and refresh the verification tests that distinguish supplier type from supplier legitimacy.",
  }),
  entry({
    contentId: "article.how-to-negotiate-chinese-factory-guide",
    slug: "how-to-negotiate-chinese-factory-guide",
    route: "/article/how-to-negotiate-chinese-factory-guide",
    classification: {
      cluster: "china-sourcing",
      role: "supporting",
      searchIntent: "supplier-negotiation",
      funnelStage: "decision",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Retain the negotiation URL and refresh its evidence, commercial boundaries, and links to the sourcing service and importing pillar.",
  }),
  entry({
    contentId: "article.importing-electronics-from-china-to-australia",
    slug: "importing-electronics-from-china-to-australia",
    route: "/article/importing-electronics-from-china-to-australia",
    classification: {
      cluster: "china-sourcing",
      role: "supporting",
      searchIntent: "category-sourcing",
      funnelStage: "solution-aware",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Keep the electronics-specific importing URL and refresh its category controls while preserving separation from the general Australia importing pillar.",
  }),
  entry({
    contentId: "article.importing-from-china-australia-guide",
    slug: "importing-from-china-australia-guide",
    route: "/article/importing-from-china-australia-guide",
    classification: {
      cluster: "china-sourcing",
      role: "pillar",
      searchIntent: "importing-to-australia",
      funnelStage: "solution-aware",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Preserve this established Australia importing URL as the proposed sourcing pillar and refresh it to govern the complete member-topic map.",
  }),
  entry({
    contentId: "article.minimum-wage-china-sourcing",
    slug: "minimum-wage-china-sourcing",
    route: "/article/minimum-wage-china-sourcing",
    classification: {
      cluster: "china-sourcing",
      role: "supporting",
      searchIntent: "sourcing-cost-compliance",
      funnelStage: "evaluation",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Retain the labour-cost context URL and refresh time-sensitive evidence so wage data informs sourcing decisions without becoming an unsupported cost claim.",
  }),
  entry({
    contentId: "article.new-zealand-vs-china-sourcing",
    slug: "new-zealand-vs-china-sourcing",
    route: "/article/new-zealand-vs-china-sourcing",
    classification: {
      cluster: "china-sourcing",
      role: "comparison",
      searchIntent: "market-comparison",
      funnelStage: "evaluation",
      targetMarket: "NZ",
    },
    action: "refresh",
    rationale:
      "Preserve the New Zealand comparison URL and refresh its market-specific evidence while keeping it subordinate to the broader sourcing pillar.",
  }),
  entry({
    contentId: "article.pay-chinese-suppliers-safely",
    slug: "pay-chinese-suppliers-safely",
    route: "/article/pay-chinese-suppliers-safely",
    classification: {
      cluster: "china-sourcing",
      role: "supporting",
      searchIntent: "supplier-payment",
      funnelStage: "decision",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Keep supplier payment within the procurement cluster and refresh the safeguards without reclassifying the page as a verification article.",
  }),
  entry({
    contentId: "article.rare-earth-supply-chain-risks",
    slug: "rare-earth-supply-chain-risks",
    route: "/article/rare-earth-supply-chain-risks",
    classification: {
      cluster: "china-sourcing",
      role: "evidence",
      searchIntent: "geopolitical-supply-risk",
      funnelStage: "problem-aware",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Retain the supply-risk evidence URL and refresh volatile geopolitical claims with dated sources rather than merging it into evergreen sourcing guidance.",
  }),
  entry({
    contentId: "article.sourcing-agent-australia",
    slug: "sourcing-agent-australia",
    route: "/article/sourcing-agent-australia",
    classification: {
      cluster: "china-sourcing",
      role: "supporting",
      searchIntent: "sourcing-agent-selection",
      funnelStage: "decision",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Preserve the Australia sourcing-agent URL and refresh service-selection criteria while distinguishing it from the agent-versus-direct comparison.",
  }),
  entry({
    contentId: "article.sourcing-mining-equipment-from-china",
    slug: "sourcing-mining-equipment-from-china",
    route: "/article/sourcing-mining-equipment-from-china",
    classification: {
      cluster: "china-sourcing",
      role: "supporting",
      searchIntent: "category-sourcing",
      funnelStage: "solution-aware",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Keep the mining-equipment category URL and refresh its category evidence, controls, and links without consolidating the existing route.",
  }),
  entry({
    contentId: "article.supplier-audit-check-sheet-china",
    slug: "supplier-audit-check-sheet-china",
    route: "/article/supplier-audit-check-sheet-china",
    classification: {
      cluster: "factory-audit",
      role: "pillar",
      searchIntent: "factory-audit-checklist",
      funnelStage: "evaluation",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Preserve the only frozen factory-audit URL as the proposed audit pillar and refresh its checklist around governed service evidence.",
  }),
  entry({
    contentId: "article.verify-alibaba-supplier",
    slug: "verify-alibaba-supplier",
    route: "/article/verify-alibaba-supplier",
    classification: {
      cluster: "supplier-verification",
      role: "supporting",
      searchIntent: "marketplace-supplier-verification",
      funnelStage: "evaluation",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Retain the marketplace-specific URL and refresh it to distinguish Alibaba checks from broader legal-entity and factory verification.",
  }),
  entry({
    contentId: "article.verify-chinese-factory-certifications",
    slug: "verify-chinese-factory-certifications",
    route: "/article/verify-chinese-factory-certifications",
    classification: {
      cluster: "supplier-verification",
      role: "evidence",
      searchIntent: "certification-verification",
      funnelStage: "evaluation",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Preserve the certification-verification URL and refresh source authority, expiry handling, and claim boundaries as cluster evidence.",
  }),
  entry({
    contentId: "article.verify-chinese-supplier",
    slug: "verify-chinese-supplier",
    route: "/article/verify-chinese-supplier",
    classification: {
      cluster: "supplier-verification",
      role: "pillar",
      searchIntent: "supplier-verification",
      funnelStage: "solution-aware",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Preserve this established URL as the proposed supplier-verification pillar and refresh it to govern all verification member intents.",
  }),
  entry({
    contentId:
      "article.visiting-chinese-factories-australian-business-checklist",
    slug: "visiting-chinese-factories-australian-business-checklist",
    route: "/article/visiting-chinese-factories-australian-business-checklist",
    classification: {
      cluster: "factory-visits",
      role: "pillar",
      searchIntent: "factory-visit-checklist",
      funnelStage: "solution-aware",
      targetMarket: "AU",
    },
    action: "refresh",
    rationale:
      "Preserve the Australian factory-visit checklist URL as the proposed visits pillar and refresh it to coordinate planning and agent member pages.",
  }),
];

export const articleMigrationLedger: MigrationLedger = defineMigrationLedger({
  ledgerVersion: 1,
  baseline: {
    id: "seo-frozen-article-baseline-2026-07-17",
    asOf: "2026-07-17",
    expectedCount: 23,
  },
  opportunityModel: {
    scoreScale: 100,
    dimensions: [
      {
        id: "service-lead-relevance",
        weight: 30,
        description:
          "Fit with a commercial service and likelihood of a qualified lead.",
      },
      {
        id: "australian-action-intent",
        weight: 20,
        description:
          "Strength of Australia-relevant, action-oriented search intent.",
      },
      {
        id: "evidence-readiness",
        weight: 15,
        description:
          "Readiness of governed evidence and first-party contribution.",
      },
      {
        id: "gsc-performance",
        weight: 15,
        description: "Google Search Console demand and ranking opportunity.",
      },
      {
        id: "serp-gap",
        weight: 10,
        description: "Competitor and SERP coverage gap.",
      },
      {
        id: "geo-answerability",
        weight: 10,
        description:
          "Ability to provide a direct, attributable answer for AI retrieval.",
      },
    ],
  },
  riskModel: {
    dimensions: [
      {
        id: "cannibalisation-risk",
        description: "Intent and keyword overlap with another baseline route.",
      },
      {
        id: "evidence-risk",
        description: "Evidence gaps that could block a safe content refresh.",
      },
      {
        id: "migration-effort",
        description:
          "Implementation effort that must be measured, not guessed.",
      },
    ],
  },
  approval: {
    approvalStatus: "pending",
    reviewer: null,
    approvalDate: null,
  },
  protection: {
    algorithm: "sha256",
    expectedDigest: null,
  },
  clusterPlans: [
    {
      cluster: "supplier-verification",
      commercialRoot: commercialRootByCluster["supplier-verification"],
      editorialPillar: {
        status: "existing-baseline",
        route: editorialPillarByCluster["supplier-verification"],
        contentId: "article.verify-chinese-supplier",
        approvalStatus: "pending",
        integrationTicket: null,
      },
      baselineCount: 6,
      baselineRoutes: sortCodePoints([
        "/article/check-chinese-company-samr",
        "/article/china-supplier-scams",
        "/article/factory-vs-trading-company-china-guide",
        "/article/verify-alibaba-supplier",
        "/article/verify-chinese-factory-certifications",
        "/article/verify-chinese-supplier",
      ]),
      memberRoutes: sortCodePoints([
        "/article/check-chinese-company-samr",
        "/article/china-supplier-scams",
        "/article/factory-vs-trading-company-china-guide",
        "/article/verify-alibaba-supplier",
        "/article/verify-chinese-factory-certifications",
      ]),
    },
    {
      cluster: "factory-audit",
      commercialRoot: commercialRootByCluster["factory-audit"],
      editorialPillar: {
        status: "existing-baseline",
        route: editorialPillarByCluster["factory-audit"],
        contentId: "article.supplier-audit-check-sheet-china",
        approvalStatus: "pending",
        integrationTicket: null,
      },
      baselineCount: 1,
      baselineRoutes: ["/article/supplier-audit-check-sheet-china"],
      memberRoutes: [],
    },
    {
      cluster: "quality-inspection",
      commercialRoot: commercialRootByCluster["quality-inspection"],
      editorialPillar: {
        status: "planned-new",
        route: editorialPillarByCluster["quality-inspection"],
        contentId: null,
        approvalStatus: "pending",
        integrationTicket: "09",
      },
      baselineCount: 0,
      baselineRoutes: [],
      memberRoutes: [],
    },
    {
      cluster: "factory-visits",
      commercialRoot: commercialRootByCluster["factory-visits"],
      editorialPillar: {
        status: "existing-baseline",
        route: editorialPillarByCluster["factory-visits"],
        contentId:
          "article.visiting-chinese-factories-australian-business-checklist",
        approvalStatus: "pending",
        integrationTicket: null,
      },
      baselineCount: 3,
      baselineRoutes: sortCodePoints([
        "/article/china-factory-tour-guide",
        "/article/china-factory-visit-agent-australia",
        "/article/visiting-chinese-factories-australian-business-checklist",
      ]),
      memberRoutes: sortCodePoints([
        "/article/china-factory-tour-guide",
        "/article/china-factory-visit-agent-australia",
      ]),
    },
    {
      cluster: "china-sourcing",
      commercialRoot: commercialRootByCluster["china-sourcing"],
      editorialPillar: {
        status: "existing-baseline",
        route: editorialPillarByCluster["china-sourcing"],
        contentId: "article.importing-from-china-australia-guide",
        approvalStatus: "pending",
        integrationTicket: null,
      },
      baselineCount: 13,
      baselineRoutes: sortCodePoints([
        "/article/bulk-procurement-china-guide",
        "/article/china-sourcing-agent-vs-direct",
        "/article/china-sourcing-risks",
        "/article/construction-materials-sourcing-from-china",
        "/article/how-to-negotiate-chinese-factory-guide",
        "/article/importing-electronics-from-china-to-australia",
        "/article/importing-from-china-australia-guide",
        "/article/minimum-wage-china-sourcing",
        "/article/new-zealand-vs-china-sourcing",
        "/article/pay-chinese-suppliers-safely",
        "/article/rare-earth-supply-chain-risks",
        "/article/sourcing-agent-australia",
        "/article/sourcing-mining-equipment-from-china",
      ]),
      memberRoutes: sortCodePoints([
        "/article/bulk-procurement-china-guide",
        "/article/china-sourcing-agent-vs-direct",
        "/article/china-sourcing-risks",
        "/article/construction-materials-sourcing-from-china",
        "/article/how-to-negotiate-chinese-factory-guide",
        "/article/importing-electronics-from-china-to-australia",
        "/article/minimum-wage-china-sourcing",
        "/article/new-zealand-vs-china-sourcing",
        "/article/pay-chinese-suppliers-safely",
        "/article/rare-earth-supply-chain-risks",
        "/article/sourcing-agent-australia",
        "/article/sourcing-mining-equipment-from-china",
      ]),
    },
  ],
  entries,
  cannibalisationReviews: [
    {
      id: "china-sourcing-guide-vs-agent-pages",
      routes: sortCodePoints([
        "/article/china-sourcing-agent-vs-direct",
        "/article/importing-from-china-australia-guide",
        "/article/sourcing-agent-australia",
      ]),
      overlap:
        "All three routes can answer how an Australian importer should organise sourcing support.",
      recommendation:
        "Keep the importing guide broad, preserve the explicit comparison intent, and reserve the agent page for service-selection criteria.",
      analysisStatus: "analysed",
      approvalStatus: "pending",
      reviewer: null,
      reviewedOn: null,
    },
    {
      id: "china-sourcing-guide-vs-category-overlays",
      routes: sortCodePoints([
        "/article/construction-materials-sourcing-from-china",
        "/article/importing-electronics-from-china-to-australia",
        "/article/importing-from-china-australia-guide",
        "/article/sourcing-mining-equipment-from-china",
      ]),
      overlap:
        "Category pages repeat portions of the general Australia importing process.",
      recommendation:
        "Keep category routes for category controls and use the importing pillar for shared process guidance instead of consolidation.",
      analysisStatus: "analysed",
      approvalStatus: "pending",
      reviewer: null,
      reviewedOn: null,
    },
    {
      id: "china-sourcing-risks-vs-supplier-scams",
      routes: sortCodePoints([
        "/article/china-sourcing-risks",
        "/article/china-supplier-scams",
      ]),
      overlap:
        "Both routes discuss risk, but one covers procurement exposure while the other covers supplier fraud warning signs.",
      recommendation:
        "Keep both routes and enforce a procurement-risk versus verification-risk boundary with cross-cluster links.",
      analysisStatus: "analysed",
      approvalStatus: "pending",
      reviewer: null,
      reviewedOn: null,
    },
    {
      id: "factory-visit-checklist-vs-tour-and-agent",
      routes: sortCodePoints([
        "/article/china-factory-tour-guide",
        "/article/china-factory-visit-agent-australia",
        "/article/visiting-chinese-factories-australian-business-checklist",
      ]),
      overlap:
        "The visit pages share preparation and on-site execution vocabulary.",
      recommendation:
        "Keep the checklist as the broad pillar, the tour guide for itinerary planning, and the agent page for service selection.",
      analysisStatus: "analysed",
      approvalStatus: "pending",
      reviewer: null,
      reviewedOn: null,
    },
    {
      id: "supplier-verification-vs-alibaba",
      routes: sortCodePoints([
        "/article/verify-alibaba-supplier",
        "/article/verify-chinese-supplier",
      ]),
      overlap:
        "The Alibaba page can repeat general supplier-verification steps.",
      recommendation:
        "Keep Alibaba checks marketplace-specific and route complete legal and operational verification to the pillar.",
      analysisStatus: "analysed",
      approvalStatus: "pending",
      reviewer: null,
      reviewedOn: null,
    },
    {
      id: "supplier-verification-vs-company-registry",
      routes: sortCodePoints([
        "/article/check-chinese-company-samr",
        "/article/verify-chinese-supplier",
      ]),
      overlap:
        "The pillar and SAMR page both cover Chinese legal-entity checks.",
      recommendation:
        "Keep SAMR as the procedural registry task and use the pillar for the broader multi-layer verification workflow.",
      analysisStatus: "analysed",
      approvalStatus: "pending",
      reviewer: null,
      reviewedOn: null,
    },
    {
      id: "supplier-verification-vs-type-and-certification",
      routes: sortCodePoints([
        "/article/factory-vs-trading-company-china-guide",
        "/article/verify-chinese-factory-certifications",
        "/article/verify-chinese-supplier",
      ]),
      overlap:
        "Supplier type and certification checks are components of the broader verification workflow.",
      recommendation:
        "Keep the comparison and evidence routes narrow, with the pillar owning the end-to-end verification intent.",
      analysisStatus: "analysed",
      approvalStatus: "pending",
      reviewer: null,
      reviewedOn: null,
    },
  ],
  integrationBlockers: [
    {
      id: "ticket-09-quality-pillar-create-action",
      ticket: "09",
      status: "open",
      reason:
        "The future quality-inspection pillar needs a create decision in Ticket 09; create is intentionally not added to the frozen baseline migrationAction enum or this 23-entry ledger.",
    },
  ],
});

export default articleMigrationLedger;
