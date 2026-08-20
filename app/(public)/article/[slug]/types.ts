// ============================================
// ARTICLE PAGE TYPES
// ============================================

export interface FAQItem {
  question: string
  answer: string
}

export interface Frontmatter {
  title: string
  /**
   * Optional short title used only for the <title> tag / SERP snippet.
   * The on-page H1 always uses `title`. Keep under 60 chars so Google
   * does not truncate it (enforced by lib/seo-metadata-length.test.ts).
   */
  seoTitle?: string
  date: string
  description: string
  author: string
  category: string
  readTime: string
  subtitle?: string
  coverImage?: string
  coverImageAlt?: string
  updatedDate?: string
  takeaways?: string[]
  tags?: string[]
  ctaTitle: string
  ctaText: string
  ctaButtonText: string
  faqs?: FAQItem[]
  featured?: boolean
  desc?: string
  sourceType?: string
  // Governed SEO Growth fields (optional during compatibility migration)
  contentId?: string
  cluster?: string
  contentRole?: string
  searchIntent?: string
  funnelStage?: string
  primaryKeyword?: string
  secondaryKeywords?: string[]
  targetMarket?: string
  editorialStatus?: string
  evidenceIds?: string[]
  commercialRoot?: string
  editorialPillar?: string
  requiredLinks?: string[]
  reviewedBy?: string
  reviewedDate?: string
  reviewDueDate?: string
  migrationAction?: string
}

export interface Article {
  frontmatter: Frontmatter
  content: string
  slug: string
}

export interface ArticleNavItem {
  slug: string
  title: string
  category: string
}

export interface PrevNextArticles {
  prevArticle?: ArticleNavItem
  nextArticle?: ArticleNavItem
}

export interface HowToStep {
  name: string
  text: string
}

export interface HowToArticle {
  name: string
  description: string
  steps: HowToStep[]
}

export interface Heading {
  id: string
  text: string
  level: number
}

export interface BreadcrumbItem {
  name: string
  url: string
}

// MDX Component Props
export interface TipProps {
  children: React.ReactNode
}

export interface InlineCTAProps {
  ctaTitle: string
  ctaText: string
  ctaButtonText: string
}

export interface FAQProps {
  question: string
  answer: string
}

export interface AuthorBioProps {
  author: string
  date: string
  readTime: string
}

export interface ArticleNavigationProps {
  prevArticle?: ArticleNavItem
  nextArticle?: ArticleNavItem
}

export interface ShareButtonsProps {
  title: string
  url: string
}

export interface StickyCTAProps {
  category: string
  ctaTitle: string
  ctaText: string
  ctaButtonText: string
}
