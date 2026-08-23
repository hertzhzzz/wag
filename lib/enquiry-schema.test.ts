import { enquirySchema } from './enquiry-schema'

const validLead = {
  fullName: 'Jane Smith',
  email: 'jane@example.com',
  lookingFor: 'A verified component supplier',
}

const validEnquiryPage = {
  ...validLead,
  company: 'Example Pty Ltd',
  pathIntent: 'find_new' as const,
  timeline: '0-3_months' as const,
  sourcePath: '/enquiry',
}

describe('enquirySchema', () => {
  it('accepts compact Lead Form payloads without qualification fields', () => {
    const result = enquirySchema.safeParse(validLead)
    expect(result.success).toBe(true)
  })

  it('accepts Enquiry Page Form payloads with pathIntent and timeline', () => {
    const result = enquirySchema.safeParse(validEnquiryPage)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.pathIntent).toBe('find_new')
      expect(result.data.timeline).toBe('0-3_months')
      expect(result.data.company).toBe('Example Pty Ltd')
    }
  })

  it('rejects pathIntent outside the procurement allowlist', () => {
    expect(enquirySchema.safeParse({
      ...validLead,
      pathIntent: 'not_provided',
    }).success).toBe(false)
    expect(enquirySchema.safeParse({
      ...validLead,
      pathIntent: 'travel',
    }).success).toBe(false)
  })

  it('rejects timeline outside the allowlist', () => {
    expect(enquirySchema.safeParse({
      ...validLead,
      timeline: 'soon',
    }).success).toBe(false)
  })

  it('accepts verify_existing and exploring', () => {
    const result = enquirySchema.safeParse({
      ...validEnquiryPage,
      pathIntent: 'verify_existing',
      timeline: 'exploring',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing required identity fields', () => {
    expect(enquirySchema.safeParse({
      email: 'jane@example.com',
      lookingFor: 'Need help',
    }).success).toBe(false)
    expect(enquirySchema.safeParse({
      fullName: 'Jane',
      lookingFor: 'Need help',
    }).success).toBe(false)
  })

  it('accepts payloads with valid budget and orderType', () => {
    const result = enquirySchema.safeParse({
      ...validEnquiryPage,
      budget: '10k_50k',
      orderType: 'one_time',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.budget).toBe('10k_50k')
      expect(result.data.orderType).toBe('one_time')
    }
  })

  it('rejects budget outside the allowlist', () => {
    expect(enquirySchema.safeParse({
      ...validLead,
      budget: '1m',
    }).success).toBe(false)
  })

  it('rejects orderType outside the allowlist', () => {
    expect(enquirySchema.safeParse({
      ...validLead,
      orderType: 'rental',
    }).success).toBe(false)
  })

  it('still accepts payloads missing budget/orderType (server keeps them optional)', () => {
    const result = enquirySchema.safeParse(validLead)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.budget).toBeUndefined()
      expect(result.data.orderType).toBeUndefined()
    }
  })
})
