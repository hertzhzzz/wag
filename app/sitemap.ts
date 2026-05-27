import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

const BLOCKED_SLUGS = [
  // resource-* prefix = thin duplicate from early pipeline version
  'resource-adelaide-china-factory-visits',
  'resource-apparel-factory-tour',
  'resource-australia-china-sourcing-fraud-case-studies',
  'resource-av-equipment-china-factory-verification-guide',
  'resource-av-equipment-procurement-china',
  'resource-brisbane-china-factory-visits',
  'resource-canton-fair-tour',
  'resource-china-business-sourcing-tour',
  'resource-china-factory-tours-australia',
  'resource-china-sourcing-risks',
  'resource-china-vs-alibaba',
  'resource-chinese-supplier-quality-not-as-promised',
  'resource-cosmetics-factory-tour',
  'resource-electronics-factory-tour',
  'resource-event-hire-china-factory-verification',
  'resource-factory-vs-trading-company-china-guide',
  'resource-guangzhou-factory-tour',
  'resource-how-to-verify-chinese-factories-1688',
  'resource-machinery-factory-tour',
  'resource-melbourne-china-factory-visits',
  'resource-modern-slavery-act-china-supplier-compliance-2026',
  'resource-perth-china-factory-visits',
  'resource-shenzhen-factory-visit',
  'resource-should-i-pay-deposit-chinese-supplier',
  'resource-supplier-verification-checklist-china',
  'resource-trump-tariffs-australia-china-sourcing-impact',
  'resource-virtual-factory-audit',
  'resource-visiting-chinese-factories-australian-business-checklist',
  'resource-what-happens-when-verification-is-skipped',
  // case study pages — not published
  'case-study-aesthetics-cosmetics',
  'case-study-fashion-apparel',
  'case-study-food-beverage',
  'case-study-healthcare-medical',
  'case-study-lighting-products',
  'case-study-textiles-home-textiles',
]

function getAllArticles() {
  function scanDir(dir: string): Array<{ slug: string; date: string }> {
    const results: Array<{ slug: string; date: string }> = []
    if (!fs.existsSync(dir)) return results
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...scanDir(fullPath))
      } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
        const slug = fullPath.replace(BLOG_DIR + '/', '').replace('.mdx', '')
        if (BLOCKED_SLUGS.includes(slug)) continue
        const raw = fs.readFileSync(fullPath, 'utf-8')
        const { data } = matter(raw)
        results.push({ slug, date: data.date || data.published || '2026-01-01' })
      }
    }
    return results
  }
  return scanDir(BLOG_DIR)
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.winningadventure.com.au'
  const articles = getAllArticles()

  const blogUrls = articles.map(article => ({
    url: `${baseUrl}/resources/${article.slug}`,
    lastModified: new Date(article.date),
  }))

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/services`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/resources`, lastModified: new Date() },
    { url: `${baseUrl}/enquiry`, lastModified: new Date() },
    { url: `${baseUrl}/visiting-chinese-factories`, lastModified: new Date() },
    { url: `${baseUrl}/china-sourcing-guide-australia`, lastModified: new Date() },
    { url: `${baseUrl}/resources/faq`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    ...blogUrls,
  ]
}