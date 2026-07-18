import type { SeoBaselineIdentity } from "./types";

/**
 * Frozen pre-migration cohort from Ticket 05. Ticket 06 may replace this with
 * the migration ledger, but this gate intentionally requires exact identity
 * and exact-once presence rather than only checking that the count is 23.
 */
export const SEO_BASELINE_COHORT: readonly SeoBaselineIdentity[] =
  Object.freeze(
    [
      {
        contentId: "article.bulk-procurement-china-guide",
        slug: "bulk-procurement-china-guide",
        route: "/article/bulk-procurement-china-guide",
      },
      {
        contentId: "article.check-chinese-company-samr",
        slug: "check-chinese-company-samr",
        route: "/article/check-chinese-company-samr",
      },
      {
        contentId: "article.china-factory-tour-guide",
        slug: "china-factory-tour-guide",
        route: "/article/china-factory-tour-guide",
      },
      {
        contentId: "article.china-factory-visit-agent-australia",
        slug: "china-factory-visit-agent-australia",
        route: "/article/china-factory-visit-agent-australia",
      },
      {
        contentId: "article.china-sourcing-agent-vs-direct",
        slug: "china-sourcing-agent-vs-direct",
        route: "/article/china-sourcing-agent-vs-direct",
      },
      {
        contentId: "article.china-sourcing-risks",
        slug: "china-sourcing-risks",
        route: "/article/china-sourcing-risks",
      },
      {
        contentId: "article.china-supplier-scams",
        slug: "china-supplier-scams",
        route: "/article/china-supplier-scams",
      },
      {
        contentId: "article.construction-materials-sourcing-from-china",
        slug: "construction-materials-sourcing-from-china",
        route: "/article/construction-materials-sourcing-from-china",
      },
      {
        contentId: "article.factory-vs-trading-company-china-guide",
        slug: "factory-vs-trading-company-china-guide",
        route: "/article/factory-vs-trading-company-china-guide",
      },
      {
        contentId: "article.how-to-negotiate-chinese-factory-guide",
        slug: "how-to-negotiate-chinese-factory-guide",
        route: "/article/how-to-negotiate-chinese-factory-guide",
      },
      {
        contentId: "article.importing-electronics-from-china-to-australia",
        slug: "importing-electronics-from-china-to-australia",
        route: "/article/importing-electronics-from-china-to-australia",
      },
      {
        contentId: "article.importing-from-china-australia-guide",
        slug: "importing-from-china-australia-guide",
        route: "/article/importing-from-china-australia-guide",
      },
      {
        contentId: "article.minimum-wage-china-sourcing",
        slug: "minimum-wage-china-sourcing",
        route: "/article/minimum-wage-china-sourcing",
      },
      {
        contentId: "article.new-zealand-vs-china-sourcing",
        slug: "new-zealand-vs-china-sourcing",
        route: "/article/new-zealand-vs-china-sourcing",
      },
      {
        contentId: "article.pay-chinese-suppliers-safely",
        slug: "pay-chinese-suppliers-safely",
        route: "/article/pay-chinese-suppliers-safely",
      },
      {
        contentId: "article.rare-earth-supply-chain-risks",
        slug: "rare-earth-supply-chain-risks",
        route: "/article/rare-earth-supply-chain-risks",
      },
      {
        contentId: "article.sourcing-agent-australia",
        slug: "sourcing-agent-australia",
        route: "/article/sourcing-agent-australia",
      },
      {
        contentId: "article.sourcing-mining-equipment-from-china",
        slug: "sourcing-mining-equipment-from-china",
        route: "/article/sourcing-mining-equipment-from-china",
      },
      {
        contentId: "article.supplier-audit-check-sheet-china",
        slug: "supplier-audit-check-sheet-china",
        route: "/article/supplier-audit-check-sheet-china",
      },
      {
        contentId: "article.verify-alibaba-supplier",
        slug: "verify-alibaba-supplier",
        route: "/article/verify-alibaba-supplier",
      },
      {
        contentId: "article.verify-chinese-factory-certifications",
        slug: "verify-chinese-factory-certifications",
        route: "/article/verify-chinese-factory-certifications",
      },
      {
        contentId: "article.verify-chinese-supplier",
        slug: "verify-chinese-supplier",
        route: "/article/verify-chinese-supplier",
      },
      {
        contentId:
          "article.visiting-chinese-factories-australian-business-checklist",
        slug: "visiting-chinese-factories-australian-business-checklist",
        route:
          "/article/visiting-chinese-factories-australian-business-checklist",
      },
    ].map((identity) => Object.freeze(identity)),
  );
