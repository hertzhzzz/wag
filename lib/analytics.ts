// GA4 Event Tracking Utility
// https://developers.google.com/analytics/devguides/collection/ga4/reference

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

type EventParams = Record<string, string | number | boolean>

/**
 * Track CTA button clicks
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
 * Track outbound link clicks
 */
export function trackOutboundClick(url: string, linkText: string): void {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'outbound_click', {
    url: url,
    link_text: linkText,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track enquiry form opens
 */
export function trackEnquiryFormOpen(source: string): void {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'enquiry_form_open', {
    source: source,
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
 * Track article read progress
 */
export function trackArticleReadProgress(pagePath: string, sectionsRead: number): void {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'article_read_progress', {
    page_path: pagePath,
    sections_read: sectionsRead,
    timestamp: new Date().toISOString(),
  })
}
