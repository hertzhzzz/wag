import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CTABand from '@/components/CTABand'
import Hero from '@/components/Hero'
import BlogPreview from '@/components/BlogPreview'
import HowItWorks from '@/components/HowItWorks'
import TwoWaysAccess from '@/components/TwoWaysAccess'
import WhyChooseUs from '@/components/WhyChooseUs'
import HomeCaseStudy from '@/components/HomeCaseStudy'

import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { Metadata } from 'next'
import { buildWebSiteSchema } from '@/lib/schema'

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
      <Hero />
      <TwoWaysAccess />
      <HowItWorks />
      <HomeCaseStudy />
      <WhyChooseUs />
      <CTABand />
      <BlogPreview />
      <Footer />
    </>
  )
}
