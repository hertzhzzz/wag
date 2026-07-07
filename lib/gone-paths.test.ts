import {
  isBlogGoneSlug,
  getBlogRedirectTarget,
  isGonePath,
  BLOG_REDIRECT_TARGETS,
} from './gone-paths'

describe('gone-paths: 2026-07-07 soft-404 cleanup', () => {
  const MOVED_TO_GONE = [
    'tottenham-hotspur',
    'bunnings-wesfarmers-merger-supply-chain',
    'bbq-galore-retail',
    'australian-retail-trends-grilld-coles',
    'kmart-home-retail',
    'bhp',
    'droneshield',
    'reneweconomy',
    'fitbit-air-sourcing',
    'oura-ring-5-wearable-tech-china-sourcing-guide',
    '007-first-light-sourcing',
    'adam-walton-policy-australian-businesses',
    'australian-business-bankruptcy-2026',
    'road-safety-australia-freight-operations',
    'australia-mining-capital-gains-tax-importers',
    'extreme-weather-supply-chain-risk',
    'kenya-sourcing-destination',
    'dubai-international-airport-australia-china-freight',
  ]

  it('treats all 18 formerly-redirected slugs as gone (410), not redirect', () => {
    for (const slug of MOVED_TO_GONE) {
      expect(isBlogGoneSlug(slug)).toBe(true)
      expect(getBlogRedirectTarget(slug)).toBeUndefined()
    }
  })

  it('removes the 18 moved slugs from BLOG_REDIRECT_TARGETS entirely', () => {
    for (const slug of MOVED_TO_GONE) {
      expect(Object.prototype.hasOwnProperty.call(BLOG_REDIRECT_TARGETS, slug)).toBe(false)
    }
  })

  it('keeps the 5 legitimate redirect-to-real-content entries untouched', () => {
    expect(getBlogRedirectTarget('services-wag')).toBe('/services')
    expect(getBlogRedirectTarget('resource-how-to-verify-chinese-factories-1688')).toBe('/article/verify-chinese-supplier')
    expect(getBlogRedirectTarget('resource-shenzhen-factory-visit')).toBe('/article/china-factory-tour-guide')
    expect(getBlogRedirectTarget('resource-should-i-pay-deposit-chinese-supplier')).toBe('/article/how-to-negotiate-chinese-factory-guide')
    expect(getBlogRedirectTarget('resource-chinese-supplier-quality-not-as-promised')).toBe('/article/china-sourcing-risks')
  })

  it('marks the two dead-redirect-chain article slugs as gone', () => {
    expect(isBlogGoneSlug('byd-company-supply-chain-guide')).toBe(true)
    expect(isBlogGoneSlug('electric-battery-supply-chain-china-sourcing-guide')).toBe(true)
  })

  it('marks the two legacy bare-slug paths as gone via isGonePath', () => {
    expect(isGonePath('/china-vs-alibaba')).toBe(true)
    expect(isGonePath('/china-supplier-verification')).toBe(true)
  })

  it('does not regress existing gone paths', () => {
    expect(isGonePath('/case-studies')).toBe(true)
    expect(isGonePath('/adelaide')).toBe(true)
  })
})
