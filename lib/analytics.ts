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
 * Track phone number clicks as a Google Ads call conversion
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
 * Track enquiry form submission
 */
export function trackFormSubmission(formType: string, pagePath: string): void {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', 'form_submit', {
    form_type: formType,
    page_path: pagePath,
    timestamp: new Date().toISOString(),
  })
}
