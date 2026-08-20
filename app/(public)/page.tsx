import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CTABand from '@/components/CTABand'
import Hero from '@/components/Hero'
import BlogPreview from '@/components/BlogPreview'
import HowItWorks from '@/components/HowItWorks'
import TwoWaysAccess from '@/components/TwoWaysAccess'
import WhyChooseUs from '@/components/WhyChooseUs'
import HomeCaseStudy from '@/components/HomeCaseStudy'
import PriorityIndustryLinks from '@/components/PriorityIndustryLinks'
import HomeAgentLink from '@/components/HomeAgentLink'
import MobileCTABar from '@/components/MobileCTABar'

import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { Metadata } from 'next'
import { buildWebSiteSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: { absolute: 'China Sourcing for Australian Businesses' },
  description: 'Australia-based China sourcing: find and vet new suppliers, or visit and verify an existing factory. AV & lighting, construction, agricultural machinery.',
  keywords: ['china sourcing australia', 'find china suppliers australia', 'av lighting sourcing china', 'construction materials china sourcing', 'agricultural machinery china sourcing', 'supplier verification china', 'factory visit china'],
  openGraph: {
    locale: 'en_AU',
    alternateLocale: 'en_US',
    title: 'China Sourcing for Australian Businesses | Winning Adventure Global',
    description: 'Find and vet China suppliers for Australian businesses — or visit and verify a factory you already know. AV & lighting, construction, agricultural machinery.',
    url: 'https://www.winningadventure.com.au/',
    siteName: 'Winning Adventure Global',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/',
      'x-default': 'https://www.winningadventure.com.au/',
    },
  },
}

function WebsiteSchema() {
  const websiteSchema = buildWebSiteSchema()
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
      {/* Hero owns mobile LCP (priority poster). Desktop video is deferred in Hero.tsx. */}
      <Hero />
      <TwoWaysAccess />
      <HomeAgentLink />
      <PriorityIndustryLinks source="homepage" />
      <HowItWorks />
      <HomeCaseStudy />
      <WhyChooseUs />
      <CTABand />
      <BlogPreview />
      <Footer />
      {/* Bottom padding so sticky mobile CTA does not cover footer links */}
      <div className="md:hidden h-20" aria-hidden="true" />
      <MobileCTABar location="home-mobile-sticky" />
    </>
  )
}
