import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CTABand from '@/components/CTABand'
import Hero from './components/Hero'
import BlogPreview from './components/BlogPreview'
import DirectorySection from './components/DirectorySection'
import HowItWorks from './components/HowItWorks'
import TwoWaysAccess from './components/TwoWaysAccess'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import CaseStudies from '@/components/CaseStudies'
import { homepageFaqs } from '@/data/faqs'
import { Metadata } from 'next'

function WhyChooseUs() {
  const reasons = [
    {
      title: 'Direct Factory Access',
      description: 'No traders, no middlemen. We introduce you directly to manufacturers and accompany you through every meeting, translation, and negotiation.',
    },
    {
      title: 'Australia-Based Team',
      description: 'Our Adelaide office manages your project with Australian standards of communication and professionalism, while our Shenzhen team provides on-ground support.',
    },
    {
      title: 'Verified Suppliers Only',
      description: 'Every factory in our directory has been physically vetted. We verify business licenses, production capacity, quality control systems, and sample quality.',
    },
    {
      title: 'Risk Mitigation',
      description: 'We help Australian businesses avoid common pitfalls: fraud, quality failures, and communication breakdowns that plague unsolicited factory contacts.',
    },
    {
      title: 'Industry Agnostic',
      description: 'From consumer electronics to industrial equipment, from packaging to custom components — we source across all manufacturing categories in the Pearl River Delta.',
    },
    {
      title: 'End-to-End Support',
      description: 'Factory matching, visit coordination, quality inspection, shipping logistics, and customs clearance — we can support as little or as much as you need.',
    },
  ]

  return (
    <section className="bg-navy/5 py-16 md:py-20 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
            Our Commitment
          </p>
          <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight mb-4">
            Why Winning Adventure Global
          </h2>
          <p className="text-navy/70 text-lg leading-relaxed">
            We founded Winning Adventure Global because Australian businesses deserve better than dealing with factories through brokers or cold outreach. Our model is simple: introduce you directly to verified manufacturers, accompany you through the process, and ensure every box gets inspected before it leaves China.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-navy/5">
              <h3 className="text-lg font-semibold text-navy mb-3">{reason.title}</h3>
              <p className="text-navy/60 text-sm leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function OurProcess() {
  const steps = [
    {
      number: '01',
      title: 'Initial Consultation',
      description: 'Tell us what you need to manufacture. We discuss your specifications, volume, timeline, and budget to identify suitable factory categories.',
    },
    {
      number: '02',
      title: 'Factory Matching',
      description: 'We pre-screen our directory and identify 3-5 factories that match your requirements. You receive detailed profiles including capabilities, certifications, and sample pricing.',
    },
    {
      number: '03',
      title: 'Schedule Factory Visits',
      description: 'We coordinate your visit itinerary in Shenzhen, Guangzhou, or Shanghai. Our team accompanies you to each factory, handling translation and technical questions.',
    },
    {
      number: '04',
      title: 'Sample Evaluation',
      description: 'Request samples from your shortlisted factories. We coordinate shipping, customs documentation, and delivery to your Australian address.',
    },
    {
      number: '05',
      title: 'Order Confirmation',
      description: 'Once you select a factory, we assist with contract review, payment terms, and production scheduling. All communication goes through us for clarity.',
    },
    {
      number: '06',
      title: 'Quality Inspection',
      description: 'Before shipment, we conduct pre-shipment inspection at the factory. You receive a detailed report with photos and quality verification.',
    },
  ]

  return (
    <section className="bg-white py-16 md:py-20 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
            How It Works
          </p>
          <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight mb-4">
            Our Service Process
          </h2>
          <p className="text-navy/70 text-lg leading-relaxed">
            Whether you join one of our scheduled group factory tours or arrange a private visit, our process ensures you leave China with qualified supplier relationships and clear next steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="text-6xl font-serif font-bold text-amber/10 absolute -top-2 -left-1">
                {step.number}
              </div>
              <div className="relative pt-8">
                <h3 className="text-lg font-semibold text-navy mb-2">{step.title}</h3>
                <p className="text-navy/60 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const metadata: Metadata = {
  title: 'China Sourcing Agent Australia | Factory Tours & Supplier Verification',
  description: 'Australian-owned China sourcing agent. We arrange factory tours in Shenzhen, Guangzhou & Shanghai, verify suppliers, and protect Australian businesses from fraud. Serving Adelaide, Sydney, Melbourne.',
  keywords: ['china sourcing agent australia', 'china sourcing company', 'australian business china', 'verified suppliers china', 'factory tour china', 'supplier verification', 'china factory visit', 'australian import china'],
  openGraph: {
    locale: 'en_AU',
    alternateLocale: 'en_US',
    title: 'Winning Adventure Global | Australia\'s China Sourcing Agent | Factory Tours & Supplier Verification',
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
      <WhyChooseUs />
      <OurProcess />
      <CaseStudies />
      <HowItWorks />
      <DirectorySection />
      <BlogPreview />
      <FAQ faqs={homepageFaqs} />
      <CTABand />
      <Footer />
    </>
  )
}
