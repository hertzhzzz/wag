import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { slugify } from './string-utils'
import type { Article, ArticleNavItem, PrevNextArticles, Frontmatter, Heading } from './types'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

// ============================================
// FILE SYSTEM HELPERS
// ============================================

export function getAllSlugs(): string[] {
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace('.mdx', ''))
}

export function getArticle(slug: string): Article | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { frontmatter: data as Frontmatter, content, slug }
}

// ============================================
// NAVIGATION HELPERS
// ============================================

export function getPrevNextArticles(currentSlug: string): PrevNextArticles {
  const allSlugs = getAllSlugs()
  const currentIndex = allSlugs.indexOf(currentSlug)

  if (currentIndex === -1) {
    return {}
  }

  // Pre-fetch both articles in a single pass
  const articlesCache = new Map<string, ArticleNavItem | null>()

  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null
  const nextSlug = currentIndex < allSlugs.length - 1 ? allSlugs[currentIndex + 1] : null

  if (prevSlug) {
    const article = getArticle(prevSlug)
    articlesCache.set(prevSlug, article ? {
      slug: prevSlug,
      title: article.frontmatter.title,
      category: article.frontmatter.category,
    } : null)
  }

  if (nextSlug) {
    const article = getArticle(nextSlug)
    articlesCache.set(nextSlug, article ? {
      slug: nextSlug,
      title: article.frontmatter.title,
      category: article.frontmatter.category,
    } : null)
  }

  return {
    prevArticle: prevSlug ? articlesCache.get(prevSlug) ?? undefined : undefined,
    nextArticle: nextSlug ? articlesCache.get(nextSlug) ?? undefined : undefined,
  }
}

// ============================================
// HEADING EXTRACTION
// ============================================

export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = slugify(text)
      headings.push({ id, text, level })
    }
  }

  return headings
}

// ============================================
// CONTENT SPLITTING
// ============================================

export function splitContent(content: string): { intro: string; body: string } {
  const parts = content.split('\n## ')
  if (parts.length <= 1) {
    return { intro: content, body: '' }
  }
  return {
    intro: parts[0],
    body: '\n## '.concat(parts.slice(1).join('\n## ')),
  }
}
