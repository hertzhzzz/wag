import { buildLeadFormPayload, normalizeIndustry } from './lead-form-payload'

describe('normalizeIndustry', () => {
  it('returns not_provided for empty values', () => {
    expect(normalizeIndustry()).toBe('not_provided')
    expect(normalizeIndustry('')).toBe('not_provided')
    expect(normalizeIndustry('   ')).toBe('not_provided')
  })

  it('blocks historical service labels', () => {
    expect(normalizeIndustry('Supplier Verification')).toBe('not_provided')
    expect(normalizeIndustry('supplier verification')).toBe('not_provided')
  })

  it('preserves industry slugs', () => {
    expect(normalizeIndustry('av-lighting')).toBe('av-lighting')
    expect(normalizeIndustry(' construction ')).toBe('construction')
  })
})

describe('buildLeadFormPayload', () => {
  const form = {
    fullName: 'Alex Example',
    email: 'alex@example.com',
    phone: '0400000000',
    company: 'Example Pty Ltd',
    budget: '10k_50k' as const,
    orderType: 'one_time' as const,
    lookingFor: 'Need AV suppliers in China',
  }

  it('builds payload with industry slug and sourcePath', () => {
    expect(buildLeadFormPayload(form, {
      sourcePath: '/industries/av-lighting',
      industry: 'av-lighting',
    })).toEqual({
      fullName: 'Alex Example',
      email: 'alex@example.com',
      phone: '0400000000',
      company: 'Example Pty Ltd',
      budget: '10k_50k',
      orderType: 'one_time',
      lookingFor: 'Need AV suppliers in China',
      industry: 'av-lighting',
      sourcePath: '/industries/av-lighting',
    })
  })

  it('defaults missing industry and empty sourcePath', () => {
    expect(buildLeadFormPayload(form, {
      sourcePath: '',
    })).toEqual({
      fullName: 'Alex Example',
      email: 'alex@example.com',
      phone: '0400000000',
      company: 'Example Pty Ltd',
      budget: '10k_50k',
      orderType: 'one_time',
      lookingFor: 'Need AV suppliers in China',
      industry: 'not_provided',
      sourcePath: 'not_provided',
    })
  })

  it('trims phone and company whitespace', () => {
    const payload = buildLeadFormPayload({
      ...form,
      phone: '  0400000000  ',
      company: '  Example Pty Ltd  ',
    }, {
      sourcePath: '/enquiry',
      industry: 'construction',
    })
    expect(payload.phone).toBe('0400000000')
    expect(payload.company).toBe('Example Pty Ltd')
  })

  it('passes through budget and orderType unchanged', () => {
    const payload = buildLeadFormPayload({
      ...form,
      budget: 'over_500k',
      orderType: 'ongoing_supply',
    }, {
      sourcePath: '/enquiry',
      industry: 'construction',
    })
    expect(payload.budget).toBe('over_500k')
    expect(payload.orderType).toBe('ongoing_supply')
  })

  it('never hardcodes Supplier Verification as industry', () => {
    const payload = buildLeadFormPayload(form, {
      sourcePath: '/supplier-verification',
      industry: 'Supplier Verification',
    })
    expect(payload.industry).toBe('not_provided')
    expect(JSON.stringify(payload)).not.toContain('Supplier Verification')
  })

  it('sanitizes dirty absolute URL sourcePath segments', () => {
    const payload = buildLeadFormPayload(form, {
      sourcePath: '/enquiry/https:/www.winningadventure.com.au/services',
    })
    expect(payload.sourcePath).toBe('/enquiry')
  })
})

import { buildEnquiryPagePayload } from './lead-form-payload'

describe('buildEnquiryPagePayload', () => {
  const form = {
    fullName: 'Alex Example',
    email: 'alex@example.com',
    phone: '0400000000',
    company: 'Example Pty Ltd',
    budget: '50k_100k' as const,
    orderType: 'one_time' as const,
    lookingFor: 'Need AV suppliers in China',
    pathIntent: 'find_new' as const,
    timeline: '0-3_months' as const,
  }

  it('builds qualified enquiry page payload with camelCase fields', () => {
    expect(buildEnquiryPagePayload(form, {
      sourcePath: '/enquiry',
      industry: 'construction',
    })).toEqual({
      fullName: 'Alex Example',
      email: 'alex@example.com',
      phone: '0400000000',
      company: 'Example Pty Ltd',
      budget: '50k_100k',
      orderType: 'one_time',
      lookingFor: 'Need AV suppliers in China',
      pathIntent: 'find_new',
      timeline: '0-3_months',
      industry: 'construction',
      sourcePath: '/enquiry',
    })
  })

  it('normalizes empty industry', () => {
    expect(buildEnquiryPagePayload(form, {
      sourcePath: '/enquiry',
    })).toEqual({
      fullName: 'Alex Example',
      email: 'alex@example.com',
      phone: '0400000000',
      company: 'Example Pty Ltd',
      budget: '50k_100k',
      orderType: 'one_time',
      lookingFor: 'Need AV suppliers in China',
      pathIntent: 'find_new',
      timeline: '0-3_months',
      industry: 'not_provided',
      sourcePath: '/enquiry',
    })
  })

  it('trims phone and company whitespace', () => {
    const payload = buildEnquiryPagePayload({
      ...form,
      phone: '  0400000000  ',
      company: '  Example Pty Ltd  ',
    }, {
      sourcePath: '/enquiry',
      industry: 'av-audio-visual',
    })
    expect(payload.phone).toBe('0400000000')
    expect(payload.company).toBe('Example Pty Ltd')
  })

  it('passes through budget and orderType unchanged', () => {
    const payload = buildEnquiryPagePayload({
      ...form,
      budget: 'under_10k',
      orderType: 'ongoing_supply',
    }, {
      sourcePath: '/enquiry',
      industry: 'av-audio-visual',
    })
    expect(payload.budget).toBe('under_10k')
    expect(payload.orderType).toBe('ongoing_supply')
  })
})


describe('buildEnquiryPagePayload for industry qualified embedded intake', () => {
  const form = {
    fullName: 'Alex Example',
    email: 'alex@example.com',
    phone: '0400000000',
    company: 'Example Pty Ltd',
    budget: '100k_250k' as const,
    orderType: 'ongoing_supply' as const,
    lookingFor: 'Need AV suppliers in China for a 200-unit install',
    pathIntent: 'find_new' as const,
    timeline: '0-3_months' as const,
  }

  it('attributes industry slug and industry sourcePath for embedded industry pages', () => {
    expect(buildEnquiryPagePayload(form, {
      sourcePath: '/industries/av-lighting',
      industry: 'av-lighting',
    })).toEqual({
      fullName: 'Alex Example',
      email: 'alex@example.com',
      phone: '0400000000',
      company: 'Example Pty Ltd',
      budget: '100k_250k',
      orderType: 'ongoing_supply',
      lookingFor: 'Need AV suppliers in China for a 200-unit install',
      pathIntent: 'find_new',
      timeline: '0-3_months',
      industry: 'av-lighting',
      sourcePath: '/industries/av-lighting',
    })
  })

  it('never accepts Supplier Verification as industry on industry intake', () => {
    const payload = buildEnquiryPagePayload(form, {
      sourcePath: '/industries/construction',
      industry: 'Supplier Verification',
    })
    expect(payload.industry).toBe('not_provided')
    expect(payload.pathIntent).toBe('find_new')
    expect(payload.timeline).toBe('0-3_months')
  })

  it('includes phone for industry verify_existing path', () => {
    expect(buildEnquiryPagePayload({
      ...form,
      pathIntent: 'verify_existing',
      timeline: '3-6_months',
      phone: '0400111222',
    }, {
      sourcePath: '/industries/agricultural-machinery',
      industry: 'agricultural-machinery',
    })).toEqual({
      fullName: 'Alex Example',
      email: 'alex@example.com',
      phone: '0400111222',
      company: 'Example Pty Ltd',
      budget: '100k_250k',
      orderType: 'ongoing_supply',
      lookingFor: 'Need AV suppliers in China for a 200-unit install',
      pathIntent: 'verify_existing',
      timeline: '3-6_months',
      industry: 'agricultural-machinery',
      sourcePath: '/industries/agricultural-machinery',
    })
  })
})
