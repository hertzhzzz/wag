import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')
const CASE_STUDIES_DIR = path.join(process.cwd(), 'content/case-studies')

const CASE_STUDY_SLUGS = [
  'aesthetics-cosmetics',
  'agricultural-drones',
  'chemical-industrial',
  'fashion-apparel',
  'food-beverage',
  'healthcare-medical',
  'construction-building',
  'technology-electronics',
  'furniture-homewares',
  'av-smart-systems',
  'packaging-print',
  'agriculture-farming',
  'automotive-transport',
  'energy-environment',
  'robotics-automation',
  'textiles-home-textiles',
  'lighting-products',
  'toys-juvenile-products',
  'sporting-goods-equipment',
  'machinery-equipment',
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
        const raw = fs.readFileSync(fullPath, 'utf-8')
        const { data } = matter(raw)
        results.push({ slug, date: data.date || '2026-01-01' })
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
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const caseStudyUrls = [
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...CASE_STUDY_SLUGS.map(slug => ({
      url: `${baseUrl}/case-studies/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/enquiry`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/visiting-chinese-factories`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/china-sourcing-guide-australia`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/adelaide`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sydney`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/melbourne`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/perth`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...caseStudyUrls,
    ...blogUrls,
  ]
}
