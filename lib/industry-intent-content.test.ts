import {
  buildIndustryPageTitle,
  getIndustryIntentPage,
  INDUSTRY_PRIMARY_CTA,
  INDUSTRY_PRIMARY_PATH_LABEL,
  INDUSTRY_SECONDARY_PATH_LABEL,
} from './industry-intent-content'

describe('buildIndustryPageTitle', () => {
  it('follows the shared title skeleton', () => {
    expect(buildIndustryPageTitle('AV & Lighting')).toBe(
      'AV & Lighting China Sourcing for Australian Businesses',
    )
    expect(buildIndustryPageTitle('Construction Materials')).toBe(
      'Construction Materials China Sourcing for Australian Businesses',
    )
  })
})

describe('AV industry intent page model', () => {
  const av = getIndustryIntentPage('av-lighting')

  it('exists as the first dual-path industry rewrite', () => {
    expect(av).toBeDefined()
    expect(av?.slug).toBe('av-lighting')
  })

  it('uses the shared title skeleton and a differentiated H1', () => {
    expect(av?.title).toBe('AV & Lighting China Sourcing for Australian Businesses')
    expect(av?.h1).toBeTruthy()
    expect(av?.h1).not.toBe(av?.title)
    expect(av?.h1.toLowerCase()).not.toContain('for australian businesses')
  })

  it('positions find-and-vet as primary and visit/verify as secondary', () => {
    expect(av?.primaryPathLabel).toBe(INDUSTRY_PRIMARY_PATH_LABEL)
    expect(av?.secondaryPathLabel).toBe(INDUSTRY_SECONDARY_PATH_LABEL)
    expect(av?.sections.twoPaths.primary.title).toMatch(/find|vet|shortlist/i)
    expect(av?.sections.twoPaths.secondary.title).toMatch(/visit|verify|existing/i)
  })

  it('exposes the eight-section skeleton with AV-specific copy', () => {
    const s = av!.sections
    expect(s.whoFor.heading).toBeTruthy()
    expect(s.twoPaths.primary.body).toBeTruthy()
    expect(s.deliver.heading).toBeTruthy()
    expect(s.proof.heading).toBeTruthy()
    expect(s.engagement.steps.length).toBeGreaterThanOrEqual(4)
    expect(s.beforeContact.checklist.length).toBeGreaterThanOrEqual(3)
    expect(s.faqs.length).toBeGreaterThanOrEqual(3)
    expect(s.finalCta.heading).toBeTruthy()

    // AV-specific, not a renamed generic template
    const blob = JSON.stringify(av)
    expect(blob).toMatch(/RCM|EESS|GEMS|LED|EMC/i)
    expect(blob).not.toMatch(/biosecurity|WaterMark|asbestos ban/i)
  })

  it('limits delivery claims and states non-claims', () => {
    const claims = av!.sections.deliver.claims.join(' ').toLowerCase()
    const nonClaims = av!.sections.deliver.nonClaims.join(' ').toLowerCase()
    expect(claims).toMatch(/find|shortlist|due diligence|visit|coordinat/)
    expect(nonClaims).toMatch(/negotiat|freight|customs|turnkey|place orders|pay suppliers|quality inspection as the primary/)
  })

  it('uses the industry primary CTA label on the final form slot', () => {
    expect(av?.sections.finalCta.ctaLabel).toBe(INDUSTRY_PRIMARY_CTA)
    expect(INDUSTRY_PRIMARY_CTA).toBe('Discuss Your Sourcing Project')
  })

  it('keeps FAQ answers as data available for initial HTML rendering', () => {
    for (const faq of av!.sections.faqs) {
      expect(faq.question.length).toBeGreaterThan(10)
      expect(faq.answer.length).toBeGreaterThan(40)
    }
  })
})

describe('construction and agricultural machinery dual-path models', () => {
  it('are not yet dual-path rewrites in ticket 02', () => {
    expect(getIndustryIntentPage('construction')).toBeUndefined()
    expect(getIndustryIntentPage('agricultural-machinery')).toBeUndefined()
  })
})
