'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import ArticleSchema from '@/components/ArticleSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { useT } from '@/i18n/useT'

import { ReadingProgressBar } from './ReadingProgressBar'
import { BackToTopButton } from './BackToTopButton'
import { ShareButtons } from './ShareButtons'
import { ArticleNavigation } from './ArticleNavigation'
import { AuthorBio } from './AuthorBio'
import { SidebarRail } from './SidebarRail'
import { MidArticleCTA } from './MidArticleCTA'
import { ServicesStrip } from './ServicesStrip'
import type { Frontmatter, ArticleNavItem } from './types'
import { trackCTAClick } from '@/lib/analytics'
import MobileCTABar from '@/components/MobileCTABar'

// ============================================
// TYPES
// ============================================

interface ArticlePageContentProps {
  slug: string
  fm: Frontmatter
  // MDX content rendered server-side, passed as ReactNode
  introNode: ReactNode
  firstHalfNode: ReactNode
  secondHalfNode: ReactNode | null
  takeaways: string[]
  tocHeadings: { text: string; id: string; level: number }[]
  prevArticle?: ArticleNavItem
  nextArticle?: ArticleNavItem
  formattedDatePublished: string
  formattedDateModified: string
  wordCount: number
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ArticlePageContent({
  slug,
  fm,
  introNode,
  firstHalfNode,
  secondHalfNode,
  takeaways,
  tocHeadings,
  prevArticle,
  nextArticle,
  formattedDatePublished,
  formattedDateModified,
  wordCount,
}: ArticlePageContentProps) {
  const t = useT()

  return (
    <>
      {/* Scroll progress indicator */}
      <ReadingProgressBar />

      {/* Back to top floating button */}
      <BackToTopButton />

      {/* Mobile persistent CTA — desktop gets this via SidebarRail instead */}
      <MobileCTABar location="article-mobile-bar" />

      {/* SEO Schemas */}
      <ArticleSchema
        title={fm.title}
        description={fm.description}
        url={`https://www.winningadventure.com.au/article/${slug}`}
        author={fm.author}
        datePublished={formattedDatePublished}
        dateModified={formattedDateModified}
        image={fm.coverImage || '/og-image.webp'}
        category={fm.category}
        tags={fm.tags}
        wordCount={wordCount}
      />

      {/* FAQ content preserved as static HTML — Google deprecated FAQ rich results May 2026 */}

      <BreadcrumbSchema items={[
        { name: t('article.page.breadcrumb.home'), url: 'https://www.winningadventure.com.au' },
        { name: t('article.page.breadcrumb.schema.articles'), url: 'https://www.winningadventure.com.au/article' },
        { name: fm.title, url: `https://www.winningadventure.com.au/article/${slug}` },
      ]} />

      {/* Hero Section */}
      <HeroSection fm={fm} t={t} />

      {/* Article Body — content column + sticky sidebar rail on desktop */}
      <div className="py-10 px-6 pb-24 lg:pb-10">
        <div className="max-w-[1080px] mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          {/* Main article content */}
          <main className="min-w-0">
            <article>

              {/* Key Takeaways - positioned early for scannability */}
              {takeaways.length > 0 && <KeyTakeaways items={takeaways} t={t} />}

              {/* Article Meta with Share */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200 mb-6">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{fm.date}</span>
                </div>
                <ShareButtons
                  title={fm.title}
                  url={`https://www.winningadventure.com.au/article/${slug}`}
                />
              </div>

              {/* Intro Section - The Hook */}
              <div className="pb-8 border-b border-gray-200 mb-8">
                {introNode}
              </div>

              {/* Body Content — split so a mid-article CTA lands near the midpoint */}
              {firstHalfNode}
              {secondHalfNode && (
                <>
                  <MidArticleCTA />
                  {secondHalfNode}
                </>
              )}

              {/* Author credibility — E-E-A-T trust signal */}
              <AuthorBio author={fm.author} date={fm.date} readTime={fm.readTime} />

              {/* Services — every reader sees what we actually offer */}
              <ServicesStrip />

              {/* Bottom CTA */}
              <BottomCTA fm={fm} t={t} />

              {/* Previous / Next Navigation */}
              <ArticleNavigation prevArticle={prevArticle} nextArticle={nextArticle} />

            </article>
          </main>

          {/* Sticky sidebar: table of contents + persistent CTA */}
          <SidebarRail headings={tocHeadings} />
        </div>
      </div>
    </>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

type TFn = ReturnType<typeof useT>

function HeroSection({ fm, t }: { fm: Frontmatter; t: TFn }) {
  const hasCover = !!fm.coverImage
  return (
    <>
      <section className={`relative pt-8 pb-6 px-6 border-b border-gray-100 overflow-hidden ${hasCover ? 'text-white' : 'bg-white'}`}>
        {hasCover && (
          <Image
            src={fm.coverImage as string}
            alt={fm.coverImageAlt || ""}
            fill
            priority
            className="object-cover z-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 900px, 1200px"
            quality={80}
          />
        )}
        {hasCover && <div className="absolute inset-0 bg-[#0F2D5E]/75 z-[1]" />}
        <div className="relative z-10 max-w-[1080px] mx-auto">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider mb-4">
            <Link href="/" className={`hover:text-[#F59E0B] transition-colors ${hasCover ? 'text-white/70' : 'text-gray-400'}`}>
              {t('article.page.breadcrumb.home')}
            </Link>
            <span className={hasCover ? 'text-white/50' : 'text-gray-300'}>›</span>
            <Link href="/article" className={`hover:text-[#F59E0B] transition-colors ${hasCover ? 'text-white/70' : 'text-gray-400'}`}>
              {t('article.page.breadcrumb.resources')}
            </Link>
          </nav>
          <p className="text-xs font-bold tracking-widest uppercase mb-3 text-[#F59E0B]">{fm.category}</p>
          <h1 className={`font-serif font-bold text-[clamp(1.5rem,3vw,2.25rem)] leading-tight mb-4 max-w-3xl ${hasCover ? '' : 'text-[#0F2D5E]'}`}>
            {fm.title}
          </h1>
          {fm.subtitle && (
            <p className={`text-lg leading-relaxed mb-4 max-w-2xl ${hasCover ? 'text-white/80' : 'text-gray-600'}`}>
              {fm.subtitle}
            </p>
          )}
        </div>
      </section>
      <div className="bg-white px-6 py-3 border-b border-gray-100">
        <div className="max-w-[1080px] mx-auto">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/about" className="font-medium text-[#0F2D5E] hover:text-[#F59E0B] transition-colors">{fm.author}</Link>
            <span className="text-gray-300">·</span>
            <span>{fm.date}</span>
            <span className="text-gray-300">·</span>
            <span>{fm.readTime}</span>
          </div>
        </div>
      </div>
    </>
  )
}

function KeyTakeaways({ items, t }: { items: string[]; t: TFn }) {
  return (
    <div className="bg-gray-50 border border-gray-200 text-[#0F2D5E] p-6 rounded-xl mb-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#F59E0B] flex items-center justify-center">
          <svg aria-hidden="true" className="w-5 h-5 text-[#0F2D5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-serif font-bold text-lg text-[#0F2D5E]">{t('article.page.key_takeaways.label')}</h2>
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

function BottomCTA({ fm, t }: { fm: Frontmatter; t: TFn }) {
  return (
    <div className="border-2 border-[#0F2D5E] p-6 text-center mt-12 rounded-xl">
      <p className="text-xs font-bold tracking-widest text-[#F59E0B] uppercase mb-2">{fm.category}</p>
      <h3 className="font-serif text-xl font-bold text-[#0F2D5E] mb-2">{fm.ctaTitle}</h3>
      <p className="text-gray-600 mb-5 max-w-md mx-auto text-sm">{fm.ctaText}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/enquiry"
          className="inline-block bg-[#0F2D5E] text-white font-semibold px-6 py-3 hover:bg-[#F59E0B] hover:text-[#0F2D5E] transition-colors rounded-sm text-sm"
          onClick={() => trackCTAClick(fm.ctaButtonText, 'article-bottom-cta')}
        >
          {fm.ctaButtonText}
        </Link>
        <Link
          href="/services"
          className="inline-block text-[#0F2D5E] font-semibold px-6 py-3 text-sm underline decoration-[#F59E0B]/40 hover:decoration-[#F59E0B] transition-colors"
        >
          {t('article.page.bottom_cta.explore_services')}
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        {t('article.page.bottom_cta.free_consultation')} · {t('article.page.bottom_cta.response_time')}
      </p>
    </div>
  )
}
