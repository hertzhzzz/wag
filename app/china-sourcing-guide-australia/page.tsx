import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { CheckCircle, MapPin, Users, Shield, Globe, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'
import ServiceSchema from '@/components/ServiceSchema'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import { sourcingAgentFaqs } from '@/data/faqs-sourcing-agent'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'China Sourcing Agent Australia | Factory Tours & Supplier Verification',
  description:
    'Hire a China sourcing agent in Australia. WAG provides factory tours, supplier verification and procurement support for Australian businesses. Free initial consultation.',
  keywords: [
    'china sourcing agent australia',
    'china sourcing agent for australian business',
    'australian business china sourcing',
    'china procurement support',
    'import from china guide',
    'factory tour china',
    'supplier verification china',
    'china factory visit',
  ],
  openGraph: {
    title: 'China Sourcing Agent Australia | WAG',
    description:
      'Hire a China sourcing agent in Australia. WAG provides factory tours, supplier verification and procurement support for Australian businesses.',
    url: 'https://www.winningadventure.com.au/china-sourcing-agent-australia',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/china-sourcing-agent-australia',
  },
}

const industries = [
  { name: 'AV Equipment', desc: 'Audio-visual equipment, professional staging gear, commercial display systems' },
  { name: 'Automotive Parts', desc: 'Vehicle components, replacement parts, specialist automotive accessories' },
  { name: 'Engineering Machinery', desc: 'Industrial equipment, precision tools, custom fabrication' },
  { name: 'Agricultural Machinery', desc: 'Farm equipment, irrigation systems, post-harvest processing machinery' },
  { name: 'Precision Manufacturing', desc: 'CNC components, machined parts, custom metalwork' },
  { name: 'Heavy Equipment', desc: 'Industrial machinery, construction equipment, mining components' },
]

const steps = [
  { num: '1', title: 'Submit Your Enquiry', desc: 'Tell us your industry, product type, and what you need to source or verify in China.' },
  { num: '2', title: 'Supplier Shortlisting', desc: 'Within 3–7 days we identify and background-check 2–3 factories matched to your requirements.' },
  { num: '3', title: 'Trip Planning', desc: 'We schedule factory appointments, coordinate ground transport, and brief you on what to expect.' },
  { num: '4', title: 'On-Site Visit', desc: 'Your bilingual guide accompanies you through every factory with full translation and facilitation.' },
  { num: '5', title: 'Post-Visit Report', desc: 'You receive a written supplier assessment covering production capacity, quality, and our recommendations.' },
]

const comparisonRows = [
  ['Factory Verification', false, false, true],
  ['Bilingual On-Site Support', false, false, true],
  ['Adelaide-Based Account Manager', false, false, true],
  ['Guided Factory Tour', false, false, true],
  ['Post-Trip Written Assessment', false, false, true],
]

export default function ChinaSourcingAgentPage() {
  return (
    <>
      <ServiceSchema />
      <FAQSchema faqs={sourcingAgentFaqs} />
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'China Sourcing Agent Australia', url: 'https://www.winningadventure.com.au/china-sourcing-agent-australia' },
      ]} />

      {/* Hero */}
      <section className="bg-navy py-20 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <p className="font-serif text-xs tracking-[0.1em] text-amber mb-4 italic uppercase">
            Australia China Sourcing
          </p>
          <h1 className="font-serif font-bold text-[clamp(1.8rem,4vw,3rem)] text-white mb-6 leading-tight max-w-[780px]">
            What is a China Sourcing Agent — and Why Australian Businesses Need One
          </h1>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-[620px]">
            Finding reliable suppliers in China is one of the biggest challenges facing Australian SMEs. A China sourcing agent bridges the gap — providing factory verification, on-site quality control, and hands-on support from shortlisting through to shipment. Here is how it works.
          </p>
          <Link
            href="/enquiry"
            className="inline-block bg-amber text-navy py-3.5 px-8 text-base font-semibold transition-colors hover:bg-amber/90 min-h-11"
          >
            Get a Free Discovery Call <ArrowRight className="inline ml-2" size={16} />
          </Link>
        </div>
      </section>

      {/* What Is a China Sourcing Agent */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[640px] mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">The Basics</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              What Does a China Sourcing Agent Actually Do?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              A China sourcing agent acts as your representative on the ground in China. They find factories suited to your product and industry, conduct background verification, accompany you on factory visits, manage quality inspections, negotiate pricing, and coordinate logistics — removing the language, cultural, and geographic barriers that make sourcing from China difficult for Australian businesses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield size={24} className="text-amber" />, title: 'Verify Suppliers', desc: 'Background checks, factory audits, and credential verification before you commit.' },
              { icon: <Users size={24} className="text-amber" />, title: 'Negotiate Pricing', desc: 'On-site negotiation with real leverage — you have someone who understands the factory floor.' },
              { icon: <CheckCircle size={24} className="text-amber" />, title: 'Manage Quality', desc: 'Pre-shipment inspections and on-site quality assessments throughout production.' },
              { icon: <Globe size={24} className="text-amber" />, title: 'Coordinate Logistics', desc: 'Freight forwarding support and customs documentation from factory to your door.' },
            ].map((item, i) => (
              <div key={i} className="bg-[#f8f9fb] p-6 border border-gray-100">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">How It Works</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              Your China Sourcing Journey, Step by Step
            </h2>
            <p className="text-gray-600 leading-relaxed">
              From your first enquiry to walking out of a factory with a supplier shortlist — here is exactly what to expect when you work with WAG.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px bg-amber/30 z-0" />
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 bg-white p-6 border border-navy/5 shadow-[0_4px_24px_rgba(15,45,94,0.06)]">
                <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-semibold text-sm mb-4">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-navy mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WAG vs Alternatives */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Why WAG</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              WAG vs. Doing It Alone vs. a Generic Agent
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Not all sourcing support is equal. Here is how WAG compares to the alternatives Australian businesses typically consider.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-navy">What You Get</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-400 bg-gray-50">DIY (Alibaba)</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-400 bg-gray-50">Generic Agent</th>
                  <th className="text-center py-4 px-4 font-semibold text-navy bg-amber/10">WAG</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([feature, diiy, generic, wagy], i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium text-navy">{feature as string}</td>
                    <td className="text-center py-4 px-4 bg-gray-50">{diiy ? '✓' : '—'}</td>
                    <td className="text-center py-4 px-4 bg-gray-50">{generic ? '✓' : '—'}</td>
                    <td className="text-center py-4 px-4 bg-amber/10">{wagy ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Industries We Cover</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              Sourcing Support Across Key Australian Import Sectors
            </h2>
            <p className="text-gray-600 leading-relaxed">
              WAG has sourcing experience across a broad range of manufacturing industries. Whatever you are importing, we can help you find the right factory in China.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind, i) => (
              <div key={i} className="bg-white p-6 border border-gray-100 shadow-[0_2px_12px_rgba(15,45,94,0.05)]">
                <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">{ind.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Frequently Asked Questions</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy">
              Common Questions About China Sourcing Agents
            </h2>
          </div>
          <FAQ faqs={sourcingAgentFaqs} />
          <p className="text-center text-sm text-gray-500 mt-8">
            Have a more specific question?{' '}
            <Link href="/enquiry" className="text-navy font-semibold underline hover:text-amber">
              Send us an enquiry →
            </Link>
          </p>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Why WAG</p>
            <h2 className="font-serif text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-navy">
              An Adelaide Team With Feet on the Ground in China
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-10">
            {[
              { value: '50+', label: 'Industries Served' },
              { value: '2–3', label: 'Pre-Screened Factories Per Visit' },
              { value: '100%', label: 'Bilingual On-Site Support' },
              { value: 'Adelaide', label: 'Based in South Australia' },
            ].map((stat, i) => (
              <div key={i}>
                <span className="font-serif text-[2rem] font-bold text-navy block">{stat.value}</span>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <MapPin size={14} className="text-amber" />
              WAG — North Adelaide, SA, Australia
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-navy">
        <div className="max-w-[760px] mx-auto text-center">
          <h2 className="font-serif text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-white mb-4">
            Ready to speak with an Adelaide-based China sourcing agent?
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Tell us what you are looking to source. We will shortlist factories, coordinate your visit, and provide full bilingual on-site support — at no cost for the initial consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/enquiry"
              className="inline-block bg-amber text-navy py-3.5 px-8 text-base font-semibold transition-colors hover:bg-amber/90 min-h-11"
            >
              Get a Free Discovery Call →
            </Link>
            <Link
              href="/services"
              className="inline-block border border-white/40 text-white py-3.5 px-8 text-base font-semibold transition-colors hover:border-white min-h-11"
            >
              View Our Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
