import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CTABand from '@/components/CTABand'
import Hero from '@/components/Hero'
import BlogPreview from '@/components/BlogPreview'
import HowItWorks from '@/components/HowItWorks'
import TwoWaysAccess from '@/components/TwoWaysAccess'
import WhyChooseUs from '@/components/WhyChooseUs'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
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
      <FAQSchema faqs={homepageFaqs} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' }
      ]} />
      <Hero />
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
