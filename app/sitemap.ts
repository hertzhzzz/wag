import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { BLOG_GONE_SLUGS } from '@/lib/gone-paths'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

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
        if (BLOG_GONE_SLUGS.includes(slug)) continue
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
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: new Date(article.date),
  }))

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/services`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/article`, lastModified: new Date() },
    { url: `${baseUrl}/enquiry`, lastModified: new Date() },
    { url: `${baseUrl}/visiting-chinese-factories`, lastModified: new Date() },
    { url: `${baseUrl}/china-sourcing-guide-australia`, lastModified: new Date() },
    { url: `${baseUrl}/article/faq`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    ...blogUrls,
  ]
}