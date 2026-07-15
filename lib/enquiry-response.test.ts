import { readSuccessfulEnquiryId } from './enquiry-response'

describe('readSuccessfulEnquiryId', () => {
  it('returns a trimmed non-empty enquiry ID', async () => {
    const response = { json: async () => ({ ok: true, enquiryId: '  enq_123  ' }) }

    await expect(readSuccessfulEnquiryId(response)).resolves.toBe('enq_123')
  })

  it.each([
    undefined,
    null,
    {},
    { ok: true },
    { enquiryId: '' },
    { enquiryId: '   ' },
    { enquiryId: 123 },
  ])('returns undefined for a 2xx body without a valid enquiry ID', async (body) => {
    const response = { json: async () => body }

    await expect(readSuccessfulEnquiryId(response)).resolves.toBeUndefined()
  })

  it('returns undefined when the 2xx response contains malformed JSON', async () => {
    const response = {
      json: async () => { throw new SyntaxError('Unexpected token') },
    }

    await expect(readSuccessfulEnquiryId(response)).resolves.toBeUndefined()
  })
})
