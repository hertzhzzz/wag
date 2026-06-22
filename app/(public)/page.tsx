import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import CTABand from '@/components/CTABand'
import Hero from '@/components/Hero'
import BlogPreview from '@/components/BlogPreview'
import HowItWorks from '@/components/HowItWorks'
import TwoWaysAccess from '@/components/TwoWaysAccess'
import WhyChooseUs from '@/components/WhyChooseUs'
import FAQ from '@/components/FAQ'

import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { homepageFaqs } from '@/data/faqs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Factory Tours China | Face-to-Face Sourcing | Winning Adventure Global',
  description: 'We accompany Australian businesses on factory tours in Shenzhen, Guangzhou & Shanghai. Face-to-face supplier meetings with on-ground support.',
  keywords: ['factory tours china', 'china sourcing agent', 'supplier verification china', 'australian business china', 'china factory visit', 'shenzhen factory tour', 'guangzhou sourcing'],
  openGraph: {
    locale: 'en_AU',
    alternateLocale: 'en_US',
    title: 'Factory Tours China | Face-to-Face Sourcing | Winning Adventure Global',
    description: 'We accompany Australian businesses on factory tours in Shenzhen, Guangzhou & Shanghai. Face-to-face supplier meetings with on-ground support.',
    url: 'https://www.winningadventure.com.au/',
    siteName: 'Winning Adventure Global',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/',
  },
}

function WebsiteSchema() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Winning Adventure Global",
    "url": "https://www.winningadventure.com.au",
    "description": "China factory tours and sourcing services for Australian businesses",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.winningadventure.com.au/article?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  )
}

export default function Home() {
  return (
    <>
      <Navbar />
      <WebsiteSchema />
      {/* FAQ content preserved as static HTML — Google deprecated FAQ rich results May 2026 */}
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' }
      ]} />
      <Hero />
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 text-center">
        <Link href="/china-sourcing-agent-australia" className="inline-block bg-navy text-white py-3 px-8 font-semibold hover:bg-navy/90 transition-colors">
          Learn About Our Full Sourcing Agent Service →
        </Link>
      </div>
      <TwoWaysAccess />
      <HowItWorks />
      <WhyChooseUs />
      <BlogPreview />
      <FAQ faqs={homepageFaqs} />
      <CTABand />
      <Footer />
    </>
  )
}
