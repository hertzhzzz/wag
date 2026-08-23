// GA4 Event Tracking Utility
// https://developers.google.com/analytics/devguides/collection/ga4/reference
// Successful Enquiry conversion: docs/adr/0001-successful-enquiry-conversion.md

import type { SubmittedPathIntent, Timeline } from './enquiry-qualification'

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
export type EnquiryFormSurface = 'enquiry_page' | 'embedded_general' | 'embedded_industry'
export type EnquiryFormVersion = 'legacy_baseline' | 'unified_v1'
export type EnquiryFormStep = 'legacy' | 'qualification' | 'submission'
export type EnquiryFormFieldKey =
  | 'full_name'
  | 'email'
  | 'phone'
  | 'company'
  | 'budget'
  | 'order_type'
  | 'path_intent'
  | 'timeline'
  | 'looking_for'
  | 'form'
export type EnquiryFormErrorType =
  | 'required'
  | 'invalid_format'
  | 'too_short'
  | 'too_long'
  | 'network'
  | 'rate_limited'
  | 'server'

export interface EnquiryFunnelContext {
  sourcePath: string
  formSurface: EnquiryFormSurface
  formVersion: EnquiryFormVersion
  industry?: string
}

export interface EnquiryStepComplete {
  pathIntent: SubmittedPathIntent
  timeline: Timeline
}

export interface EnquiryFormError {
  step: EnquiryFormStep
  fieldKey: EnquiryFormFieldKey
  errorType: EnquiryFormErrorType
}

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

/**
 * Normalize a path for GA4 page_path / source_path.
 * Prevents dirty paths such as `/enquiry/https:/www.example.com/...` that appear when
 * absolute URLs are accidentally treated as relative path segments under /enquiry.
 */
export function normalizeAnalyticsPagePath(input?: string | null): string {
  if (input == null) return 'not_provided'
  let raw = String(input).trim()
  if (!raw) return 'not_provided'

  // Absolute URL → pathname only
  try {
    if (/^https?:\/\//i.test(raw) || raw.startsWith('//')) {
      const href = raw.startsWith('//') ? `https:${raw}` : raw
      raw = new URL(href).pathname
    }
  } catch {
    return 'not_provided'
  }

  // Strip query/hash before further cleanup
  raw = raw.split(/[?#]/, 1)[0] ?? raw

  // Collapse concatenated absolute URLs: /enquiry/https:/... or /foo/https://...
  raw = raw.replace(/\/https?:\/+.*$/i, '')

  // Reject residual protocol junk (e.g. leftover "https:")
  if (/https?:/i.test(raw) || raw.includes('://')) return 'not_provided'

  if (!raw.startsWith('/')) {
    // Bare path segment without leading slash — accept only safe relative paths
    if (!/^[A-Za-z0-9._~/-]+$/.test(raw)) return 'not_provided'
    raw = `/${raw}`
  }

  // Normalize trailing slash (keep root as "/")
  if (raw.length > 1 && raw.endsWith('/')) {
    raw = raw.slice(0, -1)
  }

  // Cap length to keep GA4 dimensions clean
  if (raw.length > 300) return 'not_provided'

  return raw || '/'
}

function normalizeFunnelSourcePath(sourcePath: string): string {
  return normalizeAnalyticsPagePath(sourcePath)
}

function normalizeFunnelIndustry(industry?: string): string {
  const value = industry?.trim()
  if (!value || /^supplier verification$/i.test(value)) return 'not_provided'
  return value
}

function funnelDimensions(context: EnquiryFunnelContext) {
  return {
    source_path: normalizeFunnelSourcePath(context.sourcePath),
    form_surface: context.formSurface,
    form_version: context.formVersion,
    industry: normalizeFunnelIndustry(context.industry),
  }
}

function trackEnquiryFunnelEvent(
  eventName: 'form_view' | 'form_start' | 'form_step_complete' | 'form_error',
  context: EnquiryFunnelContext,
  details: Record<string, string> = {},
): boolean {
  if (typeof window === 'undefined') return false

  try {
    if (window.gtag) {
      window.gtag('event', eventName, {
        ...funnelDimensions(context),
        ...details,
      })
      return true
    }
    // gtag not loaded yet (e.g. consent pending, script still loading) — fall back
    // to pushing straight onto dataLayer so the event isn't silently dropped.
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...funnelDimensions(context),
        ...details,
      })
      return true
    }
    return false
  } catch {
    return false
  }
}

export function trackEnquiryFormView(context: EnquiryFunnelContext): boolean {
  return trackEnquiryFunnelEvent('form_view', context)
}

export function trackEnquiryFormStart(context: EnquiryFunnelContext): boolean {
  return trackEnquiryFunnelEvent('form_start', context)
}

export function trackEnquiryFormStepComplete(
  context: EnquiryFunnelContext,
  details: EnquiryStepComplete,
): boolean {
  return trackEnquiryFunnelEvent('form_step_complete', context, {
    path_intent: details.pathIntent,
    timeline: details.timeline,
  })
}

export function trackEnquiryFormError(
  context: EnquiryFunnelContext,
  details: EnquiryFormError,
): boolean {
  return trackEnquiryFunnelEvent('form_error', context, {
    step: details.step,
    field_key: details.fieldKey,
    error_type: details.errorType,
  })
}

type EnquiryFunnelContextProvider = EnquiryFunnelContext | (() => EnquiryFunnelContext)

/**
 * Component-instance one-shot guards for baseline funnel events.
 * Errors stay repeatable so diagnostics reflect each surfaced failure.
 */
export function createEnquiryFunnelTracker(contextProvider: EnquiryFunnelContextProvider) {
  let viewed = false
  let started = false
  let stepCompleted = false
  const context = () => (
    typeof contextProvider === 'function' ? contextProvider() : contextProvider
  )

  return {
    view(): boolean {
      if (viewed) return false
      viewed = true
      trackEnquiryFormView(context())
      return true
    },
    start(): boolean {
      if (started) return false
      started = true
      trackEnquiryFormStart(context())
      return true
    },
    stepComplete(details: EnquiryStepComplete): boolean {
      if (stepCompleted) return false
      stepCompleted = true
      trackEnquiryFormStepComplete(context(), details)
      return true
    },
    error(details: EnquiryFormError): boolean {
      return trackEnquiryFormError(context(), details)
    },
  }
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
      pagePath: normalizeAnalyticsPagePath(payload.pagePath),
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
    page_path: normalizeAnalyticsPagePath(pagePath),
    timestamp: new Date().toISOString(),
  })
}

/**
 * Manual SPA page_view for App Router client navigations.
 * Initial load is handled by gtag('config', ...); this covers soft navigations
 * so landing/page_path attribution does not stay stuck or become (not set).
 */
export function trackPageView(pagePath?: string, pageTitle?: string): void {
  if (typeof window === 'undefined' || !window.gtag) return

  const path = normalizeAnalyticsPagePath(
    pagePath ?? window.location.pathname + window.location.search,
  )
  if (path === 'not_provided') return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: pageTitle || document.title,
    page_location: `${window.location.origin}${path}`,
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
    page_path: normalizeAnalyticsPagePath(pagePath),
    timestamp: new Date().toISOString(),
  })
}
