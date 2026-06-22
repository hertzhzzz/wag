/**
 * Shared removed-content routing rules.
 * Used by middleware.ts and app/sitemap.ts.
 */

export const GONE_SLUGS = [
  "/case-studies",
  "/adelaide",
  "/perth",
  "/brisbane",
  "/melbourne",
]

export const BLOG_GONE_SLUGS = [
  "australian-house-price-forecast-china-materials",
  "resource-china-vs-alibaba",
  "trump-tariffs-australia-china-sourcing-impact",
  "byd-melbourne-supply-chain",
  "liverpool-vs-brentford",
  "asia-pacific-airline-procurement",
  "australia-capital-gains-tax-sme-finance-guide",
  "target-australia-retail",
  "liverpool-brentford-standings",
  "reconciliation-week-sourcing",
  "wisetech-global-logistics-supply-chain-guide",
  "resource-what-happens-when-verification-is-skipped",
  "albanese-family-trust-tax-2026",
  "furniture-factory-tour",
  "chinese-supplier-quality-not-as-promised",
  "albanese-government-tax-changes-australian-importers",
  "resource-australia-china-sourcing-fraud-case-studies",
  "resource-virtual-factory-audit",
  "visiting-chinese-factories-guide",
  "china-factory-tours-australia",
  "resource-machinery-factory-tour",
  "should-i-pay-deposit-chinese-supplier",
  "australia-china-sourcing-fraud-case-studies",
  "supplier-verification-guide",
  "resource-trump-tariffs-australia-china-sourcing-impact",
  "modern-slavery-act-china-supplier-compliance-2026",
  "resource-modern-slavery-act-china-supplier-compliance-2026",
  "resource-supplier-verification-checklist-china",
  "canberra-best-city-for-evs-ev-china-sourcing-guide",
  "machinery-factory-tour",
  "matildas-merchandise",
  "av-equipment-china-factory-verification-guide",
  "brisbane-china-factory-visits",
  "resource-av-equipment-china-factory-verification-guide",
  "supplier-verification-checklist-china",
  "cosmetics-factory-tour",
  "resource-adelaide-china-factory-visits",
  "what-happens-when-verification-is-skipped",
  "brisbane-weather-emergency-supplies-guide",
  "resource-cosmetics-factory-tour",
  "adelaide-china-factory-visits",
  "carnival-corporation-hospitality-supply-chain-guide",
  "perth-china-factory-visits",
  "resource-brisbane-china-factory-visits",
  "resource-melbourne-china-factory-visits",
  "event-hire-china-factory-verification",
  "melbourne-china-factory-visits",
  "resource-av-equipment-procurement-china",
  "resource-event-hire-china-factory-verification",
  "apparel-factory-tour",
  "calculator-business-equipment-china-sourcing-guide",
  "canton-fair-tour",
  "china-supplier-verification",
  "china-vs-alibaba",
  "cost-of-living-crisis-china-sourcing-strategy-guide",
  "electronics-factory-tour",
  "guangzhou-factory-tour",
  "how-to-verify-chinese-factories-1688",
  "macquarie-bank-trade-finance-china-sourcing-guide",
  "resource-apparel-factory-tour",
  "resource-canton-fair-tour",
  "resource-china-business-sourcing-tour",
  "resource-china-factory-tours-australia",
  "resource-electronics-factory-tour",
  "resource-factory-vs-trading-company-china-guide",
  "resource-guangzhou-factory-tour",
  "resource-perth-china-factory-visits",
  "resource-visiting-chinese-factories-australian-business-checklist",
  "shenzhen-factory-visit",
  "toyota-hilux-gvm-upgrade-australia",
  "virtual-factory-audit",
  "case-study-aesthetics-cosmetics",
  "case-study-fashion-apparel",
  "case-study-food-beverage",
  "case-study-healthcare-medical",
  "case-study-lighting-products",
  "case-study-textiles-home-textiles",
]

export const BLOG_REDIRECT_TARGETS: Record<string, string> = {
  "resource-how-to-verify-chinese-factories-1688": "/article/verify-chinese-supplier",
  "resource-shenzhen-factory-visit": "/article/china-factory-tour-guide",
  "resource-should-i-pay-deposit-chinese-supplier": "/article/how-to-negotiate-with-chinese-factory",
  "resource-chinese-supplier-quality-not-as-promised": "/article/china-sourcing-risks",
}

const BLOG_GONE_SET = new Set(BLOG_GONE_SLUGS)

export function isBlogGoneSlug(slug: string): boolean {
  return BLOG_GONE_SET.has(slug)
}

export function getBlogRedirectTarget(slug: string): string | undefined {
  return BLOG_REDIRECT_TARGETS[slug]
}

export function isGonePath(pathname: string): boolean {
  for (const gonePath of GONE_SLUGS) {
    if (pathname === gonePath || pathname.startsWith(gonePath + "/")) return true
  }
  return false
}
