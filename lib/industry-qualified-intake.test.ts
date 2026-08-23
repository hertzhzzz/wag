import { buildIndustryQualifiedIntake } from './industry-qualified-intake'

describe('buildIndustryQualifiedIntake', () => {
  const form = {
    fullName: 'Alex Example',
    email: 'alex@example.com',
    phone: '0400000000',
    company: 'Example Pty Ltd',
    budget: '10k_50k' as const,
    orderType: 'one_time' as const,
    lookingFor: 'Need AV suppliers in China for a 200-unit install',
    pathIntent: 'find_new' as const,
    timeline: '0-3_months' as const,
  }

  it('builds enquiry request body with real pathIntent, timeline, industry slug, and source path', () => {
    const { requestBody } = buildIndustryQualifiedIntake(form, {
      sourcePath: '/industries/av-lighting',
      industry: 'av-lighting',
    })

    expect(requestBody).toEqual({
      fullName: 'Alex Example',
      email: 'alex@example.com',
      phone: '0400000000',
      company: 'Example Pty Ltd',
      budget: '10k_50k',
      orderType: 'one_time',
      lookingFor: 'Need AV suppliers in China for a 200-unit install',
      pathIntent: 'find_new',
      timeline: '0-3_months',
      industry: 'av-lighting',
      sourcePath: '/industries/av-lighting',
    })
  })

  it('builds embedded conversion payload with real pathIntent and timeline', () => {
    const { conversion } = buildIndustryQualifiedIntake({
      ...form,
      pathIntent: 'verify_existing',
      timeline: '3-6_months',
      phone: '0400111222',
    }, {
      sourcePath: '/industries/construction',
      industry: 'construction',
    })

    expect(conversion).toEqual({
      formType: 'embedded',
      pagePath: '/industries/construction',
      industry: 'construction',
      pathIntent: 'verify_existing',
      timeline: '3-6_months',
    })
  })

  it('never attributes Supplier Verification as industry', () => {
    const result = buildIndustryQualifiedIntake(form, {
      sourcePath: '/industries/agricultural-machinery',
      industry: 'Supplier Verification',
    })

    expect(result.requestBody.industry).toBe('not_provided')
    expect(result.conversion.industry).toBe('not_provided')
    expect(JSON.stringify(result)).not.toContain('Supplier Verification')
  })

  it('sanitizes dirty sourcePath for request and conversion', () => {
    const result = buildIndustryQualifiedIntake(form, {
      sourcePath: '/enquiry/https://www.example.com/x',
      industry: 'construction',
    })
    expect(result.requestBody.sourcePath).toBe('/enquiry')
    expect(result.conversion.pagePath).toBe('/enquiry')
  })

  it('exposes the industry primary CTA label', () => {
    expect(buildIndustryQualifiedIntake.defaultCta).toBe('Discuss Your Sourcing Project')
  })
})
