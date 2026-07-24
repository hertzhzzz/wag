import { MetadataRoute } from 'next'
import { liveNavLinks } from '@/data/nav-links'
import { listArticleSummaries } from '@/lib/seo/articleReader'

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
      lastModified: new Date(),
    }))

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/services`, lastModified: new Date() },
    // /china-sourcing-agent enters via liveNavLinks() (By service menu)
    ...navUrls,
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/article`, lastModified: new Date() },
    { url: `${baseUrl}/enquiry`, lastModified: new Date() },
    { url: `${baseUrl}/article/faq`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    ...blogUrls,
  ]
}
