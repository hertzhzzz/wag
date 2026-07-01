import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

import { ArticlePageContent } from './ArticlePageContent'
import { getArticle, getAllSlugs, getPrevNextArticles, splitContent, splitBodyForMidCTA, extractHeadings, formatDateForSchema } from './article-utils'
import { HOW_TO_ARTICLES } from './how-to-data'
import { createMdxComponents } from './mdx-components'

// ============================================
// STATIC GENERATION
// ============================================

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

// ============================================
// METADATA
// ============================================

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}

  const { frontmatter: fm } = article
  // Build dynamic keywords from frontmatter tags and category
  const tagKeywords = Array.isArray(fm.tags) ? fm.tags : []
  const categoryKeyword = fm.category ? [fm.category] : []
  const dynamicKeywords = [...categoryKeyword, ...tagKeywords]

  return {
    title: fm.title,
    description: fm.description,
    keywords: dynamicKeywords.length > 0 ? dynamicKeywords : ['China factory tour', 'factory visit China', 'Australian business China sourcing', 'supplier verification'],
    authors: [{ name: fm.author }],
    openGraph: {
      title: fm.title,
      description: fm.description,
      type: 'article',
      publishedTime: fm.date,
      authors: [fm.author],
      images: fm.coverImage ? [{ url: fm.coverImage, width: 1200, height: 630, alt: fm.title }] : [],
      url: `https://www.winningadventure.com.au/article/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: fm.title,
      description: fm.description,
      images: fm.coverImage ? [fm.coverImage] : [],
    },
    alternates: {
      canonical: `https://www.winningadventure.com.au/article/${slug}`,
      languages: {
        'en-AU': `https://www.winningadventure.com.au/article/${slug}`,
        'x-default': `https://www.winningadventure.com.au/article/${slug}`,
      },
    },
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const { frontmatter: fm, content } = article
  const takeaways: string[] = fm.takeaways || []
  const { prevArticle, nextArticle } = getPrevNextArticles(slug)
  const { intro, body } = splitContent(content)
  // Split body so a mid-article CTA lands near the highest-converting midpoint
  const { firstHalf, secondHalf } = splitBodyForMidCTA(body)
  // Section headings (H2) feed the sticky table of contents in the sidebar
  const tocHeadings = extractHeadings(content)
    .filter(h => h.level === 2)
    .map(h => ({ ...h, level: 1 }))

  // Create MDX component mapping with article-specific CTA data
  const components = createMdxComponents(fm.ctaTitle, fm.ctaText, fm.ctaButtonText)

  // Check if this article has HowTo schema (reserved for future structured data use)
  void HOW_TO_ARTICLES[slug]

  // Render MDX server-side — pass ReactNode to the client shell component
  const mdxOptions = { mdxOptions: { remarkPlugins: [remarkGfm] } }
  const introNode = <MDXRemote source={intro} components={components} options={mdxOptions} />
  const firstHalfNode = <MDXRemote source={firstHalf} components={components} options={mdxOptions} />
  const secondHalfNode = secondHalf
    ? <MDXRemote source={secondHalf} components={components} options={mdxOptions} />
    : null

  return (
    <>
      <Navbar />
      <ArticlePageContent
        slug={slug}
        fm={fm}
        introNode={introNode}
        firstHalfNode={firstHalfNode}
        secondHalfNode={secondHalfNode}
        takeaways={takeaways}
        tocHeadings={tocHeadings}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
        formattedDatePublished={formatDateForSchema(fm.date)}
        formattedDateModified={fm.updatedDate ? formatDateForSchema(fm.updatedDate) : formatDateForSchema(fm.date)}
        wordCount={content.split(/\s+/).filter(Boolean).length}
      />
      <Footer />
    </>
  )
}
