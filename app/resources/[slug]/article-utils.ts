import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { slugify } from './string-utils'
import type { Article, ArticleNavItem, PrevNextArticles, Frontmatter, Heading, FAQItem } from './types'

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

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Convert "14 Apr 2026" to "2026-04-14" ISO 8601 format for schema.
 */
export function formatDateForSchema(dateStr: string): string {
  if (!dateStr) return ''
  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  // Parse "14 Apr 2026" format
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  }
  const parts = dateStr.split(' ')
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const month = months[parts[1]] || '01'
    const year = parts[2]
    return `${year}-${month}-${day}`
  }
  return dateStr
}

// ============================================
// FAQ EXTRACTION FROM MDX CONTENT
// ============================================

export function extractFaqsFromContent(content: string): FAQItem[] {
  const faqs: FAQItem[] = []
  // Match the FAQ section heading (case-insensitive)
  const faqSectionMatch = content.match(/##\s+[Ff]requently\s+[Aa]sked\s+[Qq]uestions\n([\s\S]*?)(?=\n##\s|\n---\n|$)/)
  if (!faqSectionMatch) return faqs

  const faqSection = faqSectionMatch[1]
  // Match ### Question patterns followed by answer paragraphs
  const questionMatches = faqSection.matchAll(/###\s+(.+?)\n([\s\S]*?)(?=\n###\s|\n---\n|$)/g)

  for (const match of questionMatches) {
    const question = match[1].trim()
    let answer = match[2].trim()
    // Clean up answer: remove MDX components like <Tip>, <InlineCTA /> etc.
    answer = answer.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '').trim()
    // Remove markdown links but keep text
    answer = answer.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
    if (question && answer) {
      faqs.push({ question, answer })
    }
  }

  return faqs
}
