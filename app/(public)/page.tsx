import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CTABand from '@/components/CTABand'
import Hero from '@/components/Hero'
import BlogPreview from '@/components/BlogPreview'
import HowItWorks from '@/components/HowItWorks'
import TwoWaysAccess from '@/components/TwoWaysAccess'
import WhyChooseUs from '@/components/WhyChooseUs'
import FactoryVisit from '@/components/FactoryVisit'
import ClientOutcomes from '@/components/ClientOutcomes'
import BreathingBand from '@/components/BreathingBand'
import FAQ from '@/components/FAQ'

import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { homepageFaqs } from '@/data/faqs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'China Sourcing Agent Australia | Verified Factories' },
  description: 'Adelaide-based China sourcing agent for Australian businesses. Factory tours, supplier verification, on-ground support across Guangdong, Zhejiang & Jiangsu. Free consultation.',
  keywords: ['china sourcing agent australia', 'china sourcing agent', 'australia china sourcing', 'china factory visit', 'china factory tour', 'visiting chinese factories', 'factory verification china', 'supplier verification china', 'china procurement agent australia', 'guided factory tour china'],
  openGraph: {
    locale: 'en_AU',
    alternateLocale: 'en_US',
    title: 'China Sourcing Agent Australia | Factory Tours & Supplier Verification',
    description: 'Adelaide-based. We accompany Australian businesses to verified Chinese factories — translation, negotiation & quality inspection included. Free consultation.',
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
      <TwoWaysAccess />
      <HowItWorks />
      <WhyChooseUs />
      <BreathingBand
        stat="80+"
        statement="Australian businesses already source through us — from Adelaide SMEs to Perth mining services firms."
        image="https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=70&auto=format&fit=crop"
      />
      <FactoryVisit />
      <ClientOutcomes />
      <BlogPreview />
      <FAQ faqs={homepageFaqs} />
      <CTABand />
      <Footer />
    </>
  )
}
