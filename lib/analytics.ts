// GA4 Event Tracking Utility
// https://developers.google.com/analytics/devguides/collection/ga4/reference
// Successful Enquiry conversion: docs/adr/0001-successful-enquiry-conversion.md

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: MetaPixel
    dataLayer: unknown[]
  }
}

type MetaPixel = (...args: unknown[]) => void

const inMemoryDeliveryProgress = new WeakMap<Window, Set<string>>()
const deliveryStates = new WeakMap<Window, Map<string, DeliveryState>>()
const RETRY_DELAY_MS = 1000
const MAX_RETRY_ATTEMPTS = 3

export type EnquiryFormType = 'embedded' | 'enquiry_page'
export type PathIntent = 'find_new' | 'verify_existing' | 'not_provided'

interface DeliveryState {
  inFlight: boolean
  retryAttempts: number
  retryTimer?: ReturnType<typeof setTimeout>
  payload: SuccessfulEnquiry
}

/**
 * Payload for a Successful Enquiry conversion.
 * Do not put PII (name, email, phone, company, free-text brief) here.
 */
export interface SuccessfulEnquiry {
  enquiryId: string
  formType: EnquiryFormType
  pagePath: string
  industry: string
  pathIntent: PathIntent
  timeline?: string
}

function deliveryProgressFor(currentWindow: Window): Set<string> {
  const existing = inMemoryDeliveryProgress.get(currentWindow)
  if (existing) return existing

  const progress = new Set<string>()
  inMemoryDeliveryProgress.set(currentWindow, progress)
  return progress
}

function hasDeliveryProgress(currentWindow: Window, key: string): boolean {
  const memoryProgress = deliveryProgressFor(currentWindow)
  if (memoryProgress.has(key)) return true

  try {
    if (currentWindow.sessionStorage.getItem(key)) {
      memoryProgress.add(key)
      return true
    }
  } catch {
    // Fall back to page-lifetime memory when browser storage is unavailable.
  }

  return false
}

function markDeliveryProgress(currentWindow: Window, key: string): void {
  deliveryProgressFor(currentWindow).add(key)

  try {
    currentWindow.sessionStorage.setItem(key, '1')
  } catch {
    // The in-memory marker still prevents duplicate delivery on this page.
  }
}

function stateFor(currentWindow: Window, payload: SuccessfulEnquiry): DeliveryState {
  let states = deliveryStates.get(currentWindow)
  if (!states) {
    states = new Map<string, DeliveryState>()
    deliveryStates.set(currentWindow, states)
  }

  const existing = states.get(payload.enquiryId)
  if (existing) return existing

  const state: DeliveryState = {
    inFlight: false,
    retryAttempts: 0,
    payload: {
      enquiryId: payload.enquiryId,
      formType: payload.formType,
      pagePath: payload.pagePath,
      industry: payload.industry || 'not_provided',
      pathIntent: payload.pathIntent || 'not_provided',
      timeline: payload.timeline,
    },
  }
  states.set(payload.enquiryId, state)
  return state
}

function scheduleRetry(currentWindow: Window, state: DeliveryState): void {
  if (state.retryTimer !== undefined || state.retryAttempts >= MAX_RETRY_ATTEMPTS) return

  state.retryTimer = setTimeout(() => {
    state.retryTimer = undefined
    state.retryAttempts += 1
    deliverEnquiryAnalytics(currentWindow, state)
  }, RETRY_DELAY_MS)
}

function clearRetry(state: DeliveryState): void {
  if (state.retryTimer === undefined) return
  clearTimeout(state.retryTimer)
  state.retryTimer = undefined
}

function deliverEnquiryAnalytics(currentWindow: Window, state: DeliveryState): boolean {
  if (state.inFlight) return false

  const { payload } = state
  const storageKey = `wag:lead:${payload.enquiryId}`
  const ga4Key = `${storageKey}:ga4`
  const adsKey = `${storageKey}:ads`
  const metaKey = `${storageKey}:meta`

  state.inFlight = true

  try {
    if (!hasDeliveryProgress(currentWindow, ga4Key) && currentWindow.gtag) {
      try {
        const eventParams: Record<string, string | number> = {
          enquiry_id: payload.enquiryId,
          form_type: payload.formType,
          page_path: payload.pagePath,
          industry: payload.industry || 'not_provided',
          path_intent: payload.pathIntent || 'not_provided',
        }
        if (payload.timeline) {
          eventParams.timeline = payload.timeline
        }
        currentWindow.gtag('event', 'generate_lead', eventParams)
        markDeliveryProgress(currentWindow, ga4Key)
      } catch {
        // Bounded retry chain will retry unfinished channels.
      }
    }

    if (!hasDeliveryProgress(currentWindow, adsKey) && currentWindow.gtag) {
      try {
        currentWindow.gtag('event', 'conversion', {
          send_to: 'AW-18216448449/6Uh5CLv_z8QcEMHjo-5D',
          value: 1,
          currency: 'AUD',
          transaction_id: payload.enquiryId,
        })
        markDeliveryProgress(currentWindow, adsKey)
      } catch {
        // Bounded retry chain will retry unfinished channels.
      }
    }

    if (!hasDeliveryProgress(currentWindow, metaKey) && currentWindow.fbq) {
      try {
        currentWindow.fbq('track', 'Lead', {
          content_category: payload.formType,
          content_name: payload.industry || 'not_provided',
        })
        markDeliveryProgress(currentWindow, metaKey)
      } catch {
        // Meta is optional; retry may recover a transient failure.
      }
    }

    const requiredComplete =
      hasDeliveryProgress(currentWindow, ga4Key) && hasDeliveryProgress(currentWindow, adsKey)
    const metaComplete = hasDeliveryProgress(currentWindow, metaKey)

    if (requiredComplete) markDeliveryProgress(currentWindow, storageKey)

    if (requiredComplete && metaComplete) {
      clearRetry(state)
    } else {
      scheduleRetry(currentWindow, state)
    }

    return requiredComplete
  } finally {
    state.inFlight = false
  }
}

/**
 * Track a lead only after the enquiry API confirms success and returns enquiryId.
 * Returns true when required channels (GA4 + Ads) were delivered on this call.
 */
export function trackSuccessfulEnquiry(payload: SuccessfulEnquiry): boolean {
  if (typeof window === 'undefined') return false
  if (!payload.enquiryId?.trim()) return false

  const storageKey = `wag:lead:${payload.enquiryId}`
  const state = stateFor(window, payload)
  if (state.inFlight) return false
  if (hasDeliveryProgress(window, storageKey)) return false

  return deliverEnquiryAnalytics(window, state)
}

/**
 * Track CTA button clicks (never a lead).
 */
export function trackCTAClick(buttonName: string, location: string): void {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'cta_click', {
    button_name: buttonName,
    location: location,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track scroll depth milestones
 */
export function trackScrollDepth(percent: number, pagePath: string): void {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'scroll_depth', {
    percent_scrolled: percent,
    page_path: pagePath,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track phone number clicks as a Google Ads call conversion (separate from form lead).
 */
export function trackPhoneCall(): void {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'conversion', {
    send_to: 'AW-18216448449/JPD6CIzAgsUcEMHjo-5D',
    value: 100.0,
    currency: 'AUD',
  })
}

/**
 * Track clicks on factory directory links from blog articles
 */
export function trackFactoryLinkClick(articleSlug: string, factorySlug: string): void {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'article_factory_link_click', {
    article_slug: articleSlug,
    factory_slug: factorySlug,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track internal link clicks (article-to-article, article-to-service, etc.)
 */
export function trackInternalLink(fromPage: string, toPage: string, linkText: string): void {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'internal_link_click', {
    from_page: fromPage,
    to_page: toPage,
    link_text: linkText,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Process event for a successful form submit path.
 * Not the lead KPI — use trackSuccessfulEnquiry for generate_lead.
 */
export function trackFormSubmission(formType: string, pagePath: string): void {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'form_submit', {
    form_type: formType,
    page_path: pagePath,
    timestamp: new Date().toISOString(),
  })
}
