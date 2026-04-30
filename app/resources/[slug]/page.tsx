import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import ArticleSchema from '@/components/ArticleSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import HowToSchema from '@/components/HowToSchema'
import FAQSchema from '@/components/FAQSchema'
import { ReadingProgressBar } from './ReadingProgressBar'
import { BackToTopButton } from './BackToTopButton'
import { ShareButtons } from './ShareButtons'
import { ArticleNavigation } from './ArticleNavigation'
import { getArticle, getAllSlugs, getPrevNextArticles, splitContent, extractFaqsFromContent, formatDateForSchema } from './article-utils'
import { HOW_TO_ARTICLES } from './how-to-data'
import { createMdxComponents } from './mdx-components'
import type { Frontmatter } from './types'

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
      url: `https://www.winningadventure.com.au/resources/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: fm.title,
      description: fm.description,
      images: fm.coverImage ? [fm.coverImage] : [],
    },
    alternates: {
      canonical: `https://www.winningadventure.com.au/resources/${slug}`,
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
  // Extract FAQs from MDX content for JSON-LD schema
  const articleFaqs = extractFaqsFromContent(content)

  // Create MDX component mapping with article-specific CTA data
  const components = createMdxComponents(fm.ctaTitle, fm.ctaText, fm.ctaButtonText)

  // Check if this article has HowTo schema
  const howToData = HOW_TO_ARTICLES[slug]

  return (
    <>
      {/* Navigation */}
      <Navbar />

      {/* Scroll progress indicator */}
      <ReadingProgressBar />

      {/* Back to top floating button */}
      <BackToTopButton />

      {/* SEO Schemas */}
      <ArticleSchema
        title={fm.title}
        description={fm.description}
        url={`https://www.winningadventure.com.au/resources/${slug}`}
        author={fm.author}
        datePublished={formatDateForSchema(fm.date)}
        dateModified={fm.updatedDate ? formatDateForSchema(fm.updatedDate) : formatDateForSchema(fm.date)}
        image={fm.coverImage}
        category={fm.category}
      />

      {howToData && (
        <HowToSchema
          name={howToData.name}
          description={howToData.description}
          image={fm.coverImage}
          steps={howToData.steps}
        />
      )}

      {articleFaqs.length > 0 && <FAQSchema faqs={articleFaqs} />}

      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Resources', url: 'https://www.winningadventure.com.au/resources' },
        { name: fm.category, url: `https://www.winningadventure.com.au/resources/${slug}` },
      ]} />

      {/* Hero Section */}
      <HeroSection fm={fm} />

      {/* Article Body */}
      <article className="py-10 px-6">
        <div className="max-w-[900px] mx-auto">

          {/* Key Takeaways - positioned early for scannability */}
          {takeaways.length > 0 && <KeyTakeaways items={takeaways} />}

          {/* Article Meta with Share */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200 mb-6">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{fm.date}</span>
            </div>
            <ShareButtons
              title={fm.title}
              url={`https://www.winningadventure.com.au/resources/${slug}`}
            />
          </div>

          {/* Intro Section - The Hook */}
          <div className="pb-8 border-b border-gray-200 mb-8">
            <MDXRemote source={intro} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </div>

          {/* Body Content */}
          <MDXRemote source={body} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />

          {/* Bottom CTA */}
          <BottomCTA fm={fm} />

          {/* Previous / Next Navigation */}
          <ArticleNavigation prevArticle={prevArticle} nextArticle={nextArticle} />
        </div>
      </article>

      <Footer />
    </>
  )
}

// ============================================
// SUB-COMPONENTS (preserve exact original styles)
// ============================================

function HeroSection({ fm }: { fm: Frontmatter }) {
  return (
    <section className="bg-white pt-8 pb-6 px-6 border-b border-gray-100">
      <div className="max-w-[900px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider mb-4">
          <Link href="/" className="hover:text-[#0F2D5E] transition-colors">Home</Link>
          <span>›</span>
          <Link href="/resources" className="hover:text-[#0F2D5E] transition-colors">Resources</Link>
        </nav>

        {/* Category */}
        <p className="text-xs font-bold tracking-widest text-[#F59E0B] uppercase mb-3">{fm.category}</p>

        {/* Title */}
        <h1 className="font-serif font-bold text-[clamp(1.5rem,3vw,2.25rem)] text-[#0F2D5E] leading-tight mb-4 max-w-3xl">
          {fm.title}
        </h1>

        {/* Subtitle - Hook */}
        {fm.subtitle && (
          <p className="text-lg text-gray-600 leading-relaxed mb-4 max-w-2xl">
            {fm.subtitle}
          </p>
        )}

        {/* Meta bar */}
        <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
          <Link href="/about" className="font-medium text-[#0F2D5E] hover:text-[#F59E0B] transition-colors">{fm.author}</Link>
          <span className="text-gray-300">·</span>
          <span>{fm.date}</span>
          <span className="text-gray-300">·</span>
          <span>{fm.readTime}</span>
        </div>
      </div>
    </section>
  )
}

function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <div className="bg-gray-50 border border-gray-200 text-[#0F2D5E] p-6 rounded-xl mb-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#F59E0B] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#0F2D5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-serif font-bold text-lg text-[#0F2D5E]">Key Takeaways</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
            <span className="w-5 h-5 rounded-full bg-[#0F2D5E] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function BottomCTA({ fm }: { fm: Frontmatter }) {
  return (
    <div className="border-2 border-[#0F2D5E] p-6 text-center mt-8 rounded-xl">
      <p className="text-xs font-bold tracking-widest text-[#F59E0B] uppercase mb-2">{fm.category}</p>
      <h3 className="font-serif text-xl font-bold text-[#0F2D5E] mb-2">{fm.ctaTitle}</h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm">{fm.ctaText}</p>
      <Link
        href="/enquiry"
        className="inline-block bg-[#0F2D5E] text-white font-semibold px-6 py-3 hover:bg-[#F59E0B] hover:text-[#0F2D5E] transition-colors rounded-sm text-sm"
      >
        {fm.ctaButtonText}
      </Link>
      <p className="text-xs text-gray-400 mt-3">Free initial consultation · We respond within 4 business hours</p>
    </div>
  )
}
