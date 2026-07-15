import { trackSuccessfulEnquiry, type SuccessfulEnquiry } from './analytics'

function createSessionStorage() {
  const values = new Map<string, string>()

  return {
    getItem: jest.fn((key: string) => values.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => values.set(key, value)),
    removeItem: jest.fn((key: string) => values.delete(key)),
    clear: jest.fn(() => values.clear()),
    key: jest.fn((index: number) => Array.from(values.keys())[index] ?? null),
    get length() {
      return values.size
    },
  }
}

function installBrowser(options: {
  withGtag?: boolean
  withFbq?: boolean
  gtag?: jest.Mock
  fbq?: jest.Mock
  storageThrows?: boolean
} = {}) {
  const gtag = options.gtag ?? jest.fn()
  const fbq = options.fbq ?? jest.fn()
  const sessionStorage = options.storageThrows
    ? {
        getItem: jest.fn(() => { throw new Error('Storage unavailable') }),
        setItem: jest.fn(() => { throw new Error('Storage unavailable') }),
      }
    : createSessionStorage()
  const browserWindow = {
    ...(options.withGtag === false ? {} : { gtag }),
    ...(options.withFbq ? { fbq } : {}),
    sessionStorage,
  }

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: browserWindow,
  })

  return { gtag, fbq, sessionStorage }
}

const enquiry: SuccessfulEnquiry = {
  enquiryId: 'enq_123',
  formType: 'enquiry_page',
  pagePath: '/enquiry',
  industry: 'av-lighting',
  pathIntent: 'not_provided',
}

describe('trackSuccessfulEnquiry', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    Reflect.deleteProperty(globalThis, 'window')
    jest.restoreAllMocks()
  })

  it('emits one GA4 lead and the Google Ads enquiry conversion with path_intent', () => {
    const { gtag } = installBrowser()

    expect(trackSuccessfulEnquiry(enquiry)).toBe(true)
    expect(gtag).toHaveBeenCalledTimes(2)
    expect(gtag).toHaveBeenNthCalledWith(1, 'event', 'generate_lead', {
      enquiry_id: 'enq_123',
      form_type: 'enquiry_page',
      page_path: '/enquiry',
      industry: 'av-lighting',
      path_intent: 'not_provided',
    })
    expect(gtag).toHaveBeenNthCalledWith(2, 'event', 'conversion', {
      send_to: 'AW-18216448449/6Uh5CLv_z8QcEMHjo-5D',
      value: 1,
      currency: 'AUD',
      transaction_id: 'enq_123',
    })
  })

  it('supports embedded form_type and find_new path_intent', () => {
    const { gtag } = installBrowser()
    const embedded: SuccessfulEnquiry = {
      enquiryId: 'enq_embedded',
      formType: 'embedded',
      pagePath: '/industries/construction',
      industry: 'construction',
      pathIntent: 'find_new',
    }

    expect(trackSuccessfulEnquiry(embedded)).toBe(true)
    expect(gtag).toHaveBeenNthCalledWith(1, 'event', 'generate_lead', {
      enquiry_id: 'enq_embedded',
      form_type: 'embedded',
      page_path: '/industries/construction',
      industry: 'construction',
      path_intent: 'find_new',
    })
  })

  it('defaults missing industry and pathIntent to not_provided', () => {
    const { gtag } = installBrowser()
    const sparse = {
      enquiryId: 'enq_sparse',
      formType: 'embedded' as const,
      pagePath: '/services',
      industry: '',
      pathIntent: undefined,
    } as unknown as SuccessfulEnquiry

    expect(trackSuccessfulEnquiry(sparse)).toBe(true)
    expect(gtag).toHaveBeenNthCalledWith(1, 'event', 'generate_lead', {
      enquiry_id: 'enq_sparse',
      form_type: 'embedded',
      page_path: '/services',
      industry: 'not_provided',
      path_intent: 'not_provided',
    })
  })

  it('includes optional timeline when provided', () => {
    const { gtag } = installBrowser()
    expect(trackSuccessfulEnquiry({ ...enquiry, timeline: '0-3_months' })).toBe(true)
    expect(gtag).toHaveBeenNthCalledWith(1, 'event', 'generate_lead', expect.objectContaining({
      timeline: '0-3_months',
    }))
  })

  it('deduplicates the same enquiry ID within session storage', () => {
    const { gtag, sessionStorage } = installBrowser()

    expect(trackSuccessfulEnquiry(enquiry)).toBe(true)
    expect(trackSuccessfulEnquiry(enquiry)).toBe(false)
    expect(sessionStorage.setItem).toHaveBeenCalledWith('wag:lead:enq_123', '1')
    expect(gtag).toHaveBeenCalledTimes(2)
  })

  it('deduplicates in memory when session storage is unavailable', () => {
    const { gtag } = installBrowser({ storageThrows: true })

    expect(trackSuccessfulEnquiry(enquiry)).toBe(true)
    expect(trackSuccessfulEnquiry(enquiry)).toBe(false)
    expect(gtag).toHaveBeenCalledTimes(2)
  })

  it('returns false and retries when the first required event throws', () => {
    const gtag = jest.fn()
      .mockImplementationOnce(() => { throw new Error('GA unavailable') })
      .mockImplementation(() => undefined)
    installBrowser({ gtag })

    expect(trackSuccessfulEnquiry(enquiry)).toBe(false)
    jest.advanceTimersByTime(1000)
    expect(gtag).toHaveBeenCalledTimes(3)
    expect(gtag.mock.calls.filter((call) => call[1] === 'generate_lead')).toHaveLength(2)
    expect(gtag.mock.calls.filter((call) => call[1] === 'conversion')).toHaveLength(1)
  })

  it('retries only unfinished required events after partial delivery', () => {
    const gtag = jest.fn()
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => { throw new Error('Ads unavailable') })
      .mockImplementation(() => undefined)
    const { fbq } = installBrowser({ gtag, withFbq: true })

    expect(trackSuccessfulEnquiry(enquiry)).toBe(false)
    jest.advanceTimersByTime(1000)
    expect(gtag.mock.calls.filter((call) => call[1] === 'generate_lead')).toHaveLength(1)
    expect(gtag.mock.calls.filter((call) => call[1] === 'conversion')).toHaveLength(2)
    expect(fbq).toHaveBeenCalledTimes(1)
  })

  it('blocks a synchronous reentrant call for the same enquiry', () => {
    let reentrantResult: boolean | undefined
    const gtag = jest.fn().mockImplementationOnce(() => {
      reentrantResult = trackSuccessfulEnquiry(enquiry)
    })
    installBrowser({ gtag, withFbq: true })

    expect(trackSuccessfulEnquiry(enquiry)).toBe(true)
    expect(reentrantResult).toBe(false)
    expect(gtag).toHaveBeenCalledTimes(2)
  })

  it('tracks Meta after the pixel loads without reopening required channels', () => {
    const { gtag } = installBrowser()
    const fbq = jest.fn()

    expect(trackSuccessfulEnquiry(enquiry)).toBe(true)
    ;(window as Window & { fbq?: jest.Mock }).fbq = fbq
    jest.advanceTimersByTime(1000)

    expect(gtag).toHaveBeenCalledTimes(2)
    expect(fbq).toHaveBeenCalledTimes(1)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('retries a throwing Meta pixel without repeating required channels', () => {
    const fbq = jest.fn()
      .mockImplementationOnce(() => { throw new Error('Meta unavailable') })
      .mockImplementation(() => undefined)
    const { gtag } = installBrowser({ withFbq: true, fbq })

    expect(trackSuccessfulEnquiry(enquiry)).toBe(true)
    jest.advanceTimersByTime(1000)

    expect(gtag).toHaveBeenCalledTimes(2)
    expect(fbq).toHaveBeenCalledTimes(2)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('uses one bounded retry timer chain for persistent failures', () => {
    const gtag = jest.fn(() => { throw new Error('Analytics unavailable') })
    installBrowser({ gtag })

    expect(trackSuccessfulEnquiry(enquiry)).toBe(false)
    expect(jest.getTimerCount()).toBe(1)
    expect(trackSuccessfulEnquiry(enquiry)).toBe(false)
    expect(jest.getTimerCount()).toBe(1)

    for (let attempt = 0; attempt < 10; attempt += 1) {
      jest.advanceTimersByTime(1000)
    }
    const callsAfterRetryLimit = gtag.mock.calls.length

    expect(jest.getTimerCount()).toBe(0)
    jest.advanceTimersByTime(10_000)
    expect(gtag).toHaveBeenCalledTimes(callsAfterRetryLimit)
  })

  it('does not include enquiry PII or requirements in analytics payloads', () => {
    const { gtag, fbq } = installBrowser({ withFbq: true })
    const payload = {
      ...enquiry,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0400000000',
      company: 'Example Pty Ltd',
      requirements: 'Secret product specification',
      body: 'Private enquiry body',
    } as SuccessfulEnquiry

    trackSuccessfulEnquiry(payload)

    const analyticsPayloads = [...gtag.mock.calls, ...fbq.mock.calls]
      .map((call) => JSON.stringify(call))
      .join(' ')
    expect(analyticsPayloads).not.toContain('Jane Smith')
    expect(analyticsPayloads).not.toContain('jane@example.com')
    expect(analyticsPayloads).not.toContain('0400000000')
    expect(analyticsPayloads).not.toContain('Example Pty Ltd')
    expect(analyticsPayloads).not.toContain('Secret product specification')
    expect(analyticsPayloads).not.toContain('Private enquiry body')
  })

  it('returns safely without tracking server-side or when gtag is unavailable', () => {
    expect(trackSuccessfulEnquiry(enquiry)).toBe(false)

    const { sessionStorage } = installBrowser({ withGtag: false })
    expect(trackSuccessfulEnquiry(enquiry)).toBe(false)
    expect(sessionStorage.setItem).not.toHaveBeenCalled()
  })

  it('returns false when enquiryId is empty', () => {
    installBrowser()
    expect(trackSuccessfulEnquiry({ ...enquiry, enquiryId: '   ' })).toBe(false)
  })

  it('tracks Meta Lead with form_type and industry after success', () => {
    const { fbq } = installBrowser({ withFbq: true })

    expect(fbq).not.toHaveBeenCalled()
    expect(trackSuccessfulEnquiry(enquiry)).toBe(true)
    expect(fbq).toHaveBeenCalledTimes(1)
    expect(fbq).toHaveBeenCalledWith('track', 'Lead', {
      content_category: 'enquiry_page',
      content_name: 'av-lighting',
    })
  })
})
