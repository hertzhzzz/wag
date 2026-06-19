/**
 * Shared GONE_SLUGS — single source of truth for 410-deleted content.
 *
 * Used by middleware.ts (410 responses) and app/sitemap.ts (URL exclusion).
 * When removing content, add its slug or prefix here and update both consumers
 * automatically via this shared import.
 *
 * Prefix entries end with "-" and match any slug starting with that string.
 */

export const GONE_SLUGS = [
  "/case-studies",
  "/adelaide",
  "/perth",
  "/brisbane",
  "/melbourne",
  "/article/resource-", // 29 deleted resource-* articles (Phase 1 cleanup)
]

export const GONE_PREFIXES = GONE_SLUGS.filter(s => s.endsWith("-"))

/** Blog slugs excluded from sitemap — sitemap.ts imports this list */
export const BLOG_GONE_SLUGS = [
  "resource-adelaide-china-factory-visits",
  "resource-apparel-factory-tour",
  "resource-australia-china-sourcing-fraud-case-studies",
  "resource-av-equipment-china-factory-verification-guide",
  "resource-av-equipment-procurement-china",
  "resource-brisbane-china-factory-visits",
  "resource-canton-fair-tour",
  "resource-china-business-sourcing-tour",
  "resource-china-factory-tours-australia",
  "resource-china-sourcing-risks",
  "resource-china-vs-alibaba",
  "resource-chinese-supplier-quality-not-as-promised",
  "resource-cosmetics-factory-tour",
  "resource-electronics-factory-tour",
  "resource-event-hire-china-factory-verification",
  "resource-factory-vs-trading-company-china-guide",
  "resource-guangzhou-factory-tour",
  "resource-how-to-verify-chinese-factories-1688",
  "resource-machinery-factory-tour",
  "resource-melbourne-china-factory-visits",
  "resource-modern-slavery-act-china-supplier-compliance-2026",
  "resource-perth-china-factory-visits",
  "resource-shenzhen-factory-visit",
  "resource-should-i-pay-deposit-chinese-supplier",
  "resource-supplier-verification-checklist-china",
  "resource-trump-tariffs-australia-china-sourcing-impact",
  "resource-virtual-factory-audit",
  "resource-visiting-chinese-factories-australian-business-checklist",
  "resource-what-happens-when-verification-is-skipped",
  "case-study-aesthetics-cosmetics",
  "case-study-fashion-apparel",
  "case-study-food-beverage",
  "case-study-healthcare-medical",
  "case-study-lighting-products",
  "case-study-textiles-home-textiles",
]

export function isGonePath(pathname: string): boolean {
  for (const gonePath of GONE_SLUGS) {
    if (gonePath.endsWith("-")) {
      if (pathname.startsWith(gonePath)) return true
    } else if (pathname === gonePath || pathname.startsWith(gonePath + "/")) {
      return true
    }
  }
  return false
}
