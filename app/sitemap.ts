import { MetadataRoute } from 'next'
import { liveNavLinks } from '@/data/nav-links'
import { listArticleSummaries } from '@/lib/seo/articleReader'

// Fixed lastmod for static marketing routes. Do not use new Date() — it
// rewrites every build and makes sitemap lastModified dishonest to crawlers.
// Bump a route's date only when that page's content meaningfully changes.
const STATIC_LASTMOD = {
  home: new Date('2026-07-01'),
  services: new Date('2026-07-01'),
  about: new Date('2026-07-01'),
  articleIndex: new Date('2026-07-05'),
  enquiry: new Date('2026-06-15'),
  faq: new Date('2026-06-01'),
  privacy: new Date('2026-05-08'),
  terms: new Date('2026-05-08'),
  navDefault: new Date('2026-07-01'),
  chinaSourcingAgent: new Date('2026-07-24'),
} as const

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.winningadventure.com.au'
  const { articles } = listArticleSummaries({ mode: 'compatibility' })

  const blogUrls = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: new Date(article.date),
  }))

  const navUrls = liveNavLinks()
    .filter((l) => l.href !== '/services')
    .map((l) => ({
      url: `${baseUrl}${l.href}`,
      lastModified:
        l.href === '/china-sourcing-agent'
          ? STATIC_LASTMOD.chinaSourcingAgent
          : STATIC_LASTMOD.navDefault,
    }))

  return [
    { url: baseUrl, lastModified: STATIC_LASTMOD.home },
    { url: `${baseUrl}/services`, lastModified: STATIC_LASTMOD.services },
    // /china-sourcing-agent enters via liveNavLinks() (By service menu)
    ...navUrls,
    { url: `${baseUrl}/about`, lastModified: STATIC_LASTMOD.about },
    { url: `${baseUrl}/article`, lastModified: STATIC_LASTMOD.articleIndex },
    { url: `${baseUrl}/enquiry`, lastModified: STATIC_LASTMOD.enquiry },
    { url: `${baseUrl}/article/faq`, lastModified: STATIC_LASTMOD.faq },
    { url: `${baseUrl}/privacy`, lastModified: STATIC_LASTMOD.privacy },
    { url: `${baseUrl}/terms`, lastModified: STATIC_LASTMOD.terms },
    ...blogUrls,
  ]
}
