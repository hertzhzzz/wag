import {
  listArticleSlugs,
  readArticle,
  type ValidatedArticle,
} from '@/lib/seo/articleReader'
import { slugify } from './string-utils'
import type {
  Article,
  ArticleNavItem,
  PrevNextArticles,
  Frontmatter,
  Heading,
  FAQItem,
} from './types'

// ============================================
// FILE SYSTEM HELPERS (unified SEO reader)
// ============================================

function toFrontmatter(article: ValidatedArticle): Frontmatter {
  const fm = article.frontmatter
  return {
    title: fm.title,
    date: String(fm.date),
    description: fm.description,
    author: fm.author,
    category: fm.category,
    readTime: fm.readTime,
    subtitle: fm.subtitle,
    coverImage: fm.coverImage,
    coverImageAlt: fm.coverImageAlt,
    updatedDate: fm.updatedDate ? String(fm.updatedDate) : undefined,
    takeaways: fm.takeaways,
    tags: fm.tags,
    ctaTitle: fm.ctaTitle,
    ctaText: fm.ctaText,
    ctaButtonText: fm.ctaButtonText,
    featured: fm.featured,
    desc: fm.desc,
    sourceType: fm.sourceType,
    contentId: fm.contentId,
    cluster: fm.cluster,
    contentRole: fm.contentRole,
    searchIntent: fm.searchIntent,
    funnelStage: fm.funnelStage,
    primaryKeyword: fm.primaryKeyword,
    secondaryKeywords: fm.secondaryKeywords,
    targetMarket: fm.targetMarket,
    editorialStatus: fm.editorialStatus,
    evidenceIds: fm.evidenceIds,
    commercialRoot: fm.commercialRoot,
    editorialPillar: fm.editorialPillar,
    requiredLinks: fm.requiredLinks,
    reviewedBy: fm.reviewedBy,
    reviewedDate: fm.reviewedDate ? String(fm.reviewedDate) : undefined,
    reviewDueDate: fm.reviewDueDate ? String(fm.reviewDueDate) : undefined,
    migrationAction: fm.migrationAction,
  }
}

export function getAllSlugs(): string[] {
  return listArticleSlugs()
}

export function getArticle(slug: string): Article | null {
  const article = readArticle(slug)
  if (!article) return null
  return {
    slug: article.slug,
    content: article.content,
    frontmatter: toFrontmatter(article),
  }
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

  const articlesCache = new Map<string, ArticleNavItem | null>()

  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null
  const nextSlug = currentIndex < allSlugs.length - 1 ? allSlugs[currentIndex + 1] : null

  if (prevSlug) {
    const article = getArticle(prevSlug)
    articlesCache.set(
      prevSlug,
      article
        ? {
            slug: prevSlug,
            title: article.frontmatter.title,
            category: article.frontmatter.category,
          }
        : null,
    )
  }

  if (nextSlug) {
    const article = getArticle(nextSlug)
    articlesCache.set(
      nextSlug,
      article
        ? {
            slug: nextSlug,
            title: article.frontmatter.title,
            category: article.frontmatter.category,
          }
        : null,
    )
  }

  return {
    prevArticle: prevSlug ? articlesCache.get(prevSlug) ?? undefined : undefined,
    nextArticle: nextSlug ? articlesCache.get(nextSlug) ?? undefined : undefined,
  }
}

// ============================================
// RECOMMENDED ARTICLES
// ============================================

export interface RecommendedArticle {
  slug: string
  title: string
  category: string
  readTime: string
  date: string
  coverImage?: string
  desc?: string
}

/**
 * Get recommended articles based on same category.
 * Excludes current article, returns up to 4 most recent in same category.
 */
export function getRecommendedArticles(
  currentSlug: string,
  category: string,
): RecommendedArticle[] {
  const allSlugs = getAllSlugs()
  const recommended: RecommendedArticle[] = []

  for (const slug of allSlugs) {
    if (slug === currentSlug) continue
    const article = getArticle(slug)
    if (!article) continue
    if (article.frontmatter.category !== category) continue
    recommended.push({
      slug,
      title: article.frontmatter.title,
      category: article.frontmatter.category,
      readTime: article.frontmatter.readTime,
      date: article.frontmatter.date,
      coverImage: article.frontmatter.coverImage,
      desc: article.frontmatter.desc || article.frontmatter.description,
    })
  }

  // Sort by date descending (most recent first)
  recommended.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })

  return recommended.slice(0, 4)
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

/**
 * Split the article body into two halves at an H2 boundary near the midpoint,
 * so a mid-article CTA can be injected at the highest-converting position.
 * Returns an empty secondHalf when the body is too short to warrant a mid CTA.
 */
export function splitBodyForMidCTA(body: string): {
  firstHalf: string
  secondHalf: string
} {
  // Keep the '## ' marker on each section via lookahead split.
  const sections = body.split(/\n(?=## )/).filter((s) => s.trim().length > 0)
  // Need at least 3 sections so the CTA never lands before the first or after the last.
  if (sections.length < 3) return { firstHalf: body, secondHalf: '' }

  const total = body.length
  let acc = 0
  let splitIndex = 1
  for (let i = 0; i < sections.length; i++) {
    acc += sections[i].length
    if (acc >= total / 2) {
      splitIndex = i + 1
      break
    }
  }
  splitIndex = Math.min(Math.max(splitIndex, 1), sections.length - 1)

  return {
    firstHalf: sections.slice(0, splitIndex).join('\n'),
    secondHalf: sections.slice(splitIndex).join('\n'),
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
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
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
  const faqSectionMatch = content.match(
    /##\s+[Ff]requently\s+[Aa]sked\s+[Qq]uestions\n([\s\S]*?)(?=\n##\s|\n---\n|$)/,
  )
  if (!faqSectionMatch) return faqs

  const faqSection = faqSectionMatch[1]
  // Match ### Question patterns followed by answer paragraphs
  const questionMatches = faqSection.matchAll(
    /###\s+(.+?)\n([\s\S]*?)(?=\n###\s|\n---\n|$)/g,
  )

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
