// ============================================
// ARTICLE PAGE TYPES
// ============================================

export interface Frontmatter {
  title: string
  date: string
  description: string
  author: string
  category: string
  readTime: string
  subtitle?: string
  coverImage?: string
  updatedDate?: string
  takeaways?: string[]
  ctaTitle: string
  ctaText: string
  ctaButtonText: string
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
