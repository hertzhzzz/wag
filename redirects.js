// 137 irrelevant /resources/ → 301 redirects removed 2026-06-22.
// Those URLs now return 410 Gone via middleware.ts (gone-paths.ts).
// Reason: sports/entertainment/news pages poisoned topical signal (83.6% of GSC impressions).

module.exports = [
  // ============================================
  // Category D article cleanup — 2026-06-22
  // Removed sports/entertainment/news MDX files. 301 to /article index.
  // ============================================
  { source: '/article/tottenham-hotspur', destination: '/article', permanent: true },
  { source: '/article/bunnings-wesfarmers-merger-supply-chain', destination: '/article', permanent: true },
  { source: '/article/bbq-galore-retail', destination: '/article', permanent: true },
  { source: '/article/australian-retail-trends-grilld-coles', destination: '/article', permanent: true },
  { source: '/article/kmart-home-retail', destination: '/article', permanent: true },
  { source: '/article/bhp', destination: '/article', permanent: true },
  { source: '/article/droneshield', destination: '/article', permanent: true },
  { source: '/article/reneweconomy', destination: '/article', permanent: true },
  { source: '/article/fitbit-air-sourcing', destination: '/article', permanent: true },
  { source: '/article/oura-ring-5-wearable-tech-china-sourcing-guide', destination: '/article', permanent: true },
  { source: '/article/dashdot-property-collapse-asset-liquidation-guide', destination: '/article', permanent: true },
  { source: '/article/007-first-light-sourcing', destination: '/article', permanent: true },
  { source: '/article/adam-walton-policy-australian-businesses', destination: '/article', permanent: true },
  { source: '/article/australian-business-bankruptcy-2026', destination: '/article', permanent: true },
  { source: '/article/road-safety-australia-freight-operations', destination: '/article', permanent: true },
  { source: '/article/australia-mining-capital-gains-tax-importers', destination: '/article', permanent: true },
  { source: '/article/kyle-busch-china-auto-parts-sourcing', destination: '/article', permanent: true },
  { source: '/article/extreme-weather-supply-chain-risk', destination: '/article', permanent: true },
  { source: '/article/kenya-sourcing-destination', destination: '/article', permanent: true },
  { source: '/article/dubai-international-airport-australia-china-freight', destination: '/article', permanent: true },
];
