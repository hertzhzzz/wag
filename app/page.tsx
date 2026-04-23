import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CTABand from '@/components/CTABand'
import Hero from './components/Hero'
import DirectorySection from './components/DirectorySection'
import HowItWorks from './components/HowItWorks'
import TwoWaysAccess from './components/TwoWaysAccess'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import CaseStudies from '@/components/CaseStudies'
import { homepageFaqs } from '@/data/faqs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'China Sourcing Agent Australia | Factory Tours & Supplier Verification | WAG',
  description: 'Australian-owned China sourcing agent. We arrange factory tours in Shenzhen, Guangzhou & Shanghai, verify suppliers, and protect Australian businesses from fraud. Serving Adelaide, Sydney, Melbourne.',
  keywords: ['china sourcing agent australia', 'china sourcing company', 'australian business china', 'verified suppliers china', 'factory tour china', 'supplier verification', 'china factory visit', 'australian import china'],
  openGraph: {
    locale: 'en_AU',
    alternateLocale: 'en_US',
    title: 'WAG | Australia\'s China Sourcing Agent | Factory Tours & Supplier Verification',
    description: 'Australian-owned and operated. We escort Australian businesses on factory tours in China, verify suppliers, and ensure your sourcing is safe and successful.',
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
      <FAQSchema faqs={homepageFaqs} />
      <Hero />
      <TwoWaysAccess />
      <CaseStudies />
      <HowItWorks />
      <DirectorySection />
      <FAQ faqs={homepageFaqs} />
      <CTABand />
      <Footer />
    </>
  )
}
