import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CTABand from '@/components/CTABand'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import TwoWaysAccess from '@/components/TwoWaysAccess'
import WhyChooseUs from '@/components/WhyChooseUs'
import ClientOutcomes from '@/components/ClientOutcomes'
import SupplierReportPreview from '@/components/SupplierReportPreview'

import BreadcrumbSchema from '@/components/BreadcrumbSchema'
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
      <section className="bg-white py-16 md:py-24 px-8 md:px-20 relative">
        <div className="max-w-[1120px] mx-auto relative">
          {/* Intro content — left aligned, right side reserved for floating card */}
          <div className="lg:pr-[380px] mb-8">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber bg-amber/5 border border-amber/20 px-3 py-1 rounded-full">
                AV Equipment · Electronics
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-navy/60 bg-navy/5 border border-navy/10 px-3 py-1 rounded-full flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Melbourne · Australia
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-[clamp(1.4rem,3vw,2rem)] font-bold text-navy mb-4 leading-tight text-balance">
              How a Melbourne AV Equipment Importer Verified Their Supply Chain
            </h2>

            {/* KPI results */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
              {[
                { label: 'Alternative supplier found', sub: '14 years of AV manufacturing history' },
                { label: 'Better unit pricing', sub: '— margins improved' },
                { label: '6-week transition', sub: '— zero supply interruption' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C97A0A" strokeWidth="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <div>
                    <span className="text-[14px] font-semibold text-navy">{item.label}</span>
                    <span className="text-[14px] text-navy/60"> {item.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-navy/70 leading-relaxed max-w-[600px]">
              A Melbourne-based importer of professional audio-visual equipment had been sourcing from a single Chinese factory for three years. Margins were tightening, quality complaints rising, and the factory had become unresponsive on pricing.
            </p>
          </div>

          {/* Floating report card — absolute positioned, spans across sections */}
          <div className="hidden lg:block absolute right-0 top-0 w-[340px] z-10">
            <SupplierReportPreview />
          </div>
          <div className="lg:hidden">
            <SupplierReportPreview />
          </div>

          {/* Full-width: timeline + CTA + disclaimer */}
          <ClientOutcomes />
        </div>
      </section>
      <WhyChooseUs />
      <CTABand />
      <Footer />
    </>
  )
}
