import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CTABand from '@/components/CTABand'
import Hero from './components/Hero'
import DirectorySection from './components/DirectorySection'
import HowItWorks from './components/HowItWorks'
import TwoWaysAccess from './components/TwoWaysAccess'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import ReviewSchema from '@/components/ReviewSchema'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'China Sourcing Company | Australian Business Guide',
  description: 'Connect with verified Chinese manufacturers. Factory tours, supplier verification, and procurement support for Australian businesses since 2012.',
  keywords: ['china sourcing company', 'australian business china', 'verified suppliers china', 'factory tour china', 'china sourcing agent', 'supplier verification'],
  openGraph: {
    locale: 'en_AU',
    alternateLocale: 'en_US',
    title: 'WAG | China Sourcing Australia | Factory Tours & Supplier Verification',
    description: 'Winning Adventure Global helps Australian businesses source from China with factory tours, supplier verification, and end-to-end procurement support. Based in Adelaide.',
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
        "urlTemplate": "https://www.winningadventure.com.au/resources?q={search_term_string}"
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
      <FAQSchema />
      <ReviewSchema />
      <Hero />
      <TwoWaysAccess />
      <HowItWorks />
      <DirectorySection />
      <FAQ />
      <CTABand />
      <Footer />
    </>
  )
}
