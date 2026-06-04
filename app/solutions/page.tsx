import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import ServiceSchema from '@/components/ServiceSchema'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import { serviceFaqs } from '@/data/faqs-services'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ScrollReveal from '@/components/ScrollReveal'
import {
  Palette, Tractor, Sun, Shirt, MessageSquare, Search, Calendar,
  Building2, FileText, Monitor, Car, Wrench, Cog, Truck, Sparkles,
  UtensilsCrossed, Package, Heart, TrendingUp, ArrowRight
} from 'lucide-react'
import '@/components/services-animations.css'

export const metadata: Metadata = {
  title: 'China Sourcing Solutions for Australian Businesses | Factory Tours, Supplier Verification & Procurement',
  description: 'End-to-end China sourcing solutions: factory tours, supplier verification, and bulk procurement support. Australia-based team, bilingual guides, pre-screened factories.',
  keywords: ['china sourcing solutions', 'factory tours china', 'supplier verification australia', 'china procurement support', 'australian business china sourcing', 'factory audit china'],
  openGraph: {
    title: 'China Sourcing Solutions for Australian Businesses | Winning Adventure Global',
    description: 'End-to-end China sourcing solutions: factory tours, supplier verification, and bulk procurement support.',
    url: 'https://www.winningadventure.com.au/solutions',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/solutions',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/solutions',
      'x-default': 'https://www.winningadventure.com.au/solutions',
    },
  },
}

const verificationPoints = [
  {
    title: 'Business License Verification',
    desc: 'Every factory recommendation begins with a SAMR (State Administration for Market Regulation) database check. We confirm the legal entity status, registration capital, and business scope match what the factory claims.',
  },
  {
    title: 'On-Site Factory Audit',
    desc: 'Before recommending any supplier, we visit the facility in person. Our audit covers production floor area, equipment inventory, workforce size, and quality management systems — not just what a website claims.',
  },
  {
    title: 'Certification Authentication',
    desc: 'We cross-check claimed certifications (ISO 9001, CE, CCC, IEC) against issuing-body databases. Counterfeit or expired certificates are flagged and eliminated before a factory reaches your shortlist.',
  },
  {
    title: 'Export History Validation',
    desc: 'We verify whether the factory has genuine export experience to Australia or comparable markets. This includes reviewing customs declarations and confirming familiarity with Australian import standards.',
  },
]

const caseStudies = [
  {
    industry: 'Aesthetics & Cosmetics',
    icon: Palette,
    desc: 'A Sydney-based beauty clinic needed to verify three 1688-listed suppliers before committing to a $60,000 order. Two failed verification. The third — a GMP-certified manufacturer in Guangzhou — is now their primary supplier.',
    result: 'Avoided $60,000 in potential losses',
  },
  {
    industry: 'Agricultural Machinery',
    icon: Tractor,
    desc: 'A Barossa Valley vineyard equipment importer needed a replacement supplier after their existing manufacturer raised prices 35%. Four alternatives were identified and visited in Jiangsu province over two days.',
    result: '18% cost reduction on $240,000 annual spend',
  },
  {
    industry: 'Solar & LED Components',
    icon: Sun,
    desc: 'A Brisbane solar installer needed to verify whether a Chinese manufacturer genuinely held IEC 62619 certification. An independent audit confirmed the certification was counterfeit.',
    result: 'Avoided regulatory liability and client safety risk',
  },
  {
    industry: 'Apparel & Fashion',
    icon: Shirt,
    desc: 'An Adelaide fashion brand had worked with the same Guangzhou garment factory for three years with deteriorating quality. Four alternative manufacturers were evaluated across two days.',
    result: 'Quality acceptance improved from 81% to 97%',
  },
]

const processSteps = [
  {
    num: '1',
    icon: MessageSquare,
    title: 'Submit Enquiry',
    desc: 'Fill out our enquiry form with your industry, product type, volume requirements, and target specifications. We respond within 24 hours to confirm receipt and begin gathering context for your sourcing needs.',
  },
  {
    num: '2',
    icon: Search,
    title: 'Supplier Shortlisting',
    desc: 'Within 3-7 business days, we research and shortlist 2-3 pre-screened factories that match your requirements. Each shortlisted supplier has passed initial verification checks before reaching your review.',
  },
  {
    num: '3',
    icon: Calendar,
    title: 'Trip Planning',
    desc: 'We design a complete itinerary: factory visit schedule, travel logistics, accommodation, and ground transport. You receive a detailed trip brief so you know exactly what to expect before departure.',
  },
  {
    num: '4',
    icon: Building2,
    title: 'On-Site Visit',
    desc: 'Your bilingual guide accompanies you to every factory. You tour production lines, meet management, inspect quality control, and ask questions directly. Translation is provided throughout — no communication gaps.',
  },
  {
    num: '5',
    icon: FileText,
    title: 'Post-Visit Report',
    desc: 'After your trip, you receive a comprehensive report summarising factory observations, supplier comparisons, quality assessments, and recommended next steps. We stay available for follow-up questions and procurement support.',
  },
]

const industries = [
  { name: 'AV Equipment', icon: Monitor },
  { name: 'Automotive Parts', icon: Car },
  { name: 'Engineering Machinery', icon: Wrench },
  { name: 'Agricultural Machinery', icon: Tractor },
  { name: 'Precision Manufacturing', icon: Cog },
  { name: 'Heavy Equipment', icon: Truck },
  { name: 'Aesthetics & Cosmetics', icon: Sparkles },
  { name: 'Fashion & Apparel', icon: Shirt },
  { name: 'Food & Beverage', icon: UtensilsCrossed },
  { name: 'Packaging', icon: Package },
  { name: 'Solar & LED', icon: Sun },
  { name: 'Healthcare', icon: Heart },
]

export default function SolutionsPage() {
  return (
    <>
      <ServiceSchema />
      <FAQSchema faqs={serviceFaqs} />
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Solutions', url: 'https://www.winningadventure.com.au/solutions' },
      ]} />

      {/* ============================================
          #hero — Value Proposition
          ============================================ */}
      <section id="hero" className="relative min-h-[50vh] md:min-h-[520px] flex items-center bg-navy overflow-hidden">
        <Image
          src="/solutions/hero-bg.webp"
          alt=""
          fill
          priority
          className="object-cover z-0"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/75 to-navy/70 z-[1]" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_50%,_white_1px,_transparent_1px)] bg-[length:40px_40px] z-[1]" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-16 md:py-24">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-amber">Solutions</span>
          </div>

          <div className="max-w-[720px]">
            <h1 className="font-serif font-bold text-[clamp(2rem,4.5vw,3.25rem)] text-white mb-6 leading-tight">
              China Sourcing Solutions for Australian Businesses
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-[600px]">
              End-to-end factory tours, supplier verification, and procurement support. Australia-based team with bilingual guides on the ground in China. Pre-screened factories. Independent decision-making. No commissions from suppliers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/enquiry"
                className="inline-flex items-center justify-center bg-amber text-navy py-3.5 px-8 text-sm font-semibold transition-all hover:bg-amber/90 min-h-11 cta-pulse"
              >
                Book a Discovery Call
              </Link>
              <Link
                href="#factory-tours"
                className="inline-flex items-center justify-center bg-white/10 text-white py-3.5 px-8 text-sm font-semibold transition-all hover:bg-white/20 border border-white/30 min-h-11"
              >
                Explore Our Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          #factory-tours — China Factory Tours
          ============================================ */}
      <ScrollReveal>
        <section id="factory-tours" className="py-16 md:py-24 px-4 md:px-8 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Left: Description */}
              <div>
                <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">China Factory Tours</p>
                <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-6 leading-tight">
                  Visit Pre-Screened Factories with a Bilingual Guide
                </h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6">
                  We take you directly to 2-3 pre-screened Chinese factories matched to your product and industry. Your bilingual guide handles all logistics — scheduling, transport, translation, and factory introductions. You visit, ask questions, and decide independently. No obligation to commit to any supplier.
                </p>
                <p className="text-base text-gray-700 leading-relaxed mb-8">
                  Best for businesses exploring new suppliers, verifying existing ones, or planning their first China sourcing trip. All logistics handled so you can focus on evaluating factories and building supplier relationships.
                </p>

                {/* Checklist */}
                <ul className="space-y-3 mb-8">
                  {[
                    '2-3 pre-screened factories matched to your industry',
                    'Bilingual guide for all meetings and negotiations',
                    'Transport, scheduling, and factory introductions arranged',
                    'Independent decision-making with no supplier commissions',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-navy">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber/10 text-amber flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/enquiry"
                  className="inline-flex items-center justify-center bg-navy text-white py-3 px-8 text-sm font-semibold transition-colors hover:bg-[#1a4080] min-h-11"
                >
                  Enquire About a Factory Tour
                </Link>
              </div>

              {/* Right: Resource links */}
              <div className="flex flex-col justify-center gap-6">
                <Link
                  href="/resources/china-factory-tour-guide"
                  className="group block border border-gray-200 rounded-lg p-6 hover:border-amber/40 hover:shadow-lg transition-all"
                >
                  <p className="font-semibold text-navy group-hover:text-amber transition-colors mb-2">
                    China Factory Tour Guide for Australian Businesses
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    What to expect before, during, and after your China factory visit — from packing advice to factory floor questions.
                  </p>
                  <span className="text-xs font-semibold text-amber group-hover:underline">
                    Read the guide &rarr;
                  </span>
                </Link>

                <Link
                  href="/resources/visiting-chinese-factories-australian-business-checklist"
                  className="group block border border-gray-200 rounded-lg p-6 hover:border-amber/40 hover:shadow-lg transition-all"
                >
                  <p className="font-semibold text-navy group-hover:text-amber transition-colors mb-2">
                    Visiting Chinese Factories: Australian Business Checklist
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    Everything to check, ask, and document during your China factory visit. A practical checklist for Australian importers.
                  </p>
                  <span className="text-xs font-semibold text-amber group-hover:underline">
                    Download the checklist &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #procurement — Bulk Procurement Support
          ============================================ */}
      <ScrollReveal>
        <section id="procurement" className="py-16 md:py-24 px-4 md:px-8 bg-navy/5">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Left: Description */}
              <div>
                <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Bulk Procurement Support</p>
                <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-6 leading-tight">
                  End-to-End Procurement with a Dedicated Partner
                </h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6">
                  Already know what you want to source? We accompany you through the full procurement process — from supplier negotiation and sample coordination through to quality checks and logistics setup. You get a dedicated bilingual partner from first factory visit through to purchase order.
                </p>
                <p className="text-base text-gray-700 leading-relaxed mb-8">
                  Best for businesses ready to commit and place bulk orders. We handle the China-side coordination so you can focus on your business operations in Australia.
                </p>

                {/* Key features */}
                <ul className="space-y-3 mb-8">
                  {[
                    'Supplier negotiation with your requirements front and centre',
                    'Sample coordination and pre-production approval',
                    'Quality control checks before shipment',
                    'Logistics setup including freight and customs documentation',
                    'Dedicated bilingual partner throughout the process',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-navy">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber/10 text-amber flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/enquiry"
                  className="inline-flex items-center justify-center bg-navy text-white py-3 px-8 text-sm font-semibold transition-colors hover:bg-[#1a4080] min-h-11"
                >
                  Start Your Procurement Journey
                </Link>
              </div>

              {/* Right: Resource links */}
              <div className="flex flex-col justify-center gap-6">
                <Link
                  href="/resources/bulk-procurement-china-guide"
                  className="group block border border-gray-200 bg-white rounded-lg p-6 hover:border-amber/40 hover:shadow-lg transition-all"
                >
                  <p className="font-semibold text-navy group-hover:text-amber transition-colors mb-2">
                    Bulk Procurement from China: A Complete Guide
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    From MOQ negotiation to shipping logistics — everything Australian businesses need to know about bulk procurement from China.
                  </p>
                  <span className="text-xs font-semibold text-amber group-hover:underline">
                    Read the guide &rarr;
                  </span>
                </Link>

                <Link
                  href="/resources/how-to-negotiate-chinese-factory-guide"
                  className="group block border border-gray-200 bg-white rounded-lg p-6 hover:border-amber/40 hover:shadow-lg transition-all"
                >
                  <p className="font-semibold text-navy group-hover:text-amber transition-colors mb-2">
                    How to Negotiate with Chinese Factories
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    Practical tactics for pricing, MOQ, payment terms, and building long-term supplier relationships with Chinese manufacturers.
                  </p>
                  <span className="text-xs font-semibold text-amber group-hover:underline">
                    Read the guide &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #verification — Supplier Verification
          ============================================ */}
      <ScrollReveal>
        <section id="verification" className="py-16 md:py-24 px-4 md:px-8 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="max-w-[800px] mb-12">
              <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Supplier Verification</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-6 leading-tight">
                12-Point Verification Before You Visit
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                Every factory we recommend has passed our 12-point verification process. Before you board a plane, we have already confirmed the supplier is legitimate, capable, and export-ready. Here is what we check:
              </p>
            </div>

            {/* Verification cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {verificationPoints.map((point, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber/10 text-amber flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy mb-2">{point.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{point.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-600 mb-8">
              Full methodology documented in our detailed verification resources below. Each check is performed before a factory reaches your shortlist.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link
                href="/enquiry"
                className="inline-flex items-center justify-center bg-navy text-white py-3 px-8 text-sm font-semibold transition-colors hover:bg-[#1a4080] min-h-11"
              >
                Get Your Suppliers Verified
              </Link>
            </div>

            {/* Resource links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-gray-100">
              <Link
                href="/resources/verify-chinese-supplier"
                className="group p-5 border border-gray-200 rounded-lg hover:border-amber/40 hover:shadow-md transition-all"
              >
                <p className="text-sm font-semibold text-navy group-hover:text-amber transition-colors mb-1">
                  How to Verify a Chinese Supplier
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Step-by-step guide to verifying Chinese manufacturers before placing an order.
                </p>
              </Link>
              <Link
                href="/resources/supplier-verification-checklist-china"
                className="group p-5 border border-gray-200 rounded-lg hover:border-amber/40 hover:shadow-md transition-all"
              >
                <p className="text-sm font-semibold text-navy group-hover:text-amber transition-colors mb-1">
                  Supplier Verification Checklist for China Importers
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  12-point checklist for verifying Chinese factories before you commit.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #case-studies — Client Outcomes
          ============================================ */}
      <ScrollReveal>
        <section id="case-studies" className="py-16 md:py-24 px-4 md:px-8 bg-navy/5">
          <div className="max-w-[1200px] mx-auto">
            <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Results We Have Delivered</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-10 leading-tight">
              Real Outcomes for Australian Businesses
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {caseStudies.map((study, i) => {
                const Icon = study.icon
                return (
                  <div
                    key={i}
                    className="svc-case-study bg-white border border-gray-200 rounded-xl p-6 flex flex-col h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center mb-4">
                      <Icon size={20} className="text-navy" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs text-amber font-semibold mb-3">{study.industry}</span>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-1">
                      {study.desc}
                    </p>
                    <div className="pt-4 border-t border-gray-100 flex items-start gap-2">
                      <TrendingUp size={14} className="text-amber flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-navy">
                        {study.result}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #how-it-works — Process Steps
          ============================================ */}
      <ScrollReveal>
        <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-8 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="max-w-[800px] mb-12">
              <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">How It Works</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 leading-tight">
                Your Sourcing Journey, Step by Step
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                From your initial enquiry through to a detailed post-visit report — every step is designed to give you clarity, confidence, and control over your China sourcing decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
              {processSteps.map((step, idx) => {
                const Icon = step.icon
                const isLast = idx === processSteps.length - 1
                return (
                  <div
                    key={idx}
                    className={`process-step bg-white rounded-xl p-6 h-full border transition-all duration-300 hover:shadow-md ${
                      isLast
                        ? 'border-amber/30 shadow-[0_6px_24px_rgba(245,158,11,0.08)]'
                        : 'border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
                      isLast ? 'bg-amber/10 text-amber' : 'bg-navy/10 text-navy'
                    }`}>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] text-amber font-bold tracking-widest uppercase block mb-2">Step {step.num}</span>
                    <h3 className="text-base font-semibold text-navy mb-2 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="text-center">
              <Link
                href="/enquiry"
                className="inline-flex items-center justify-center gap-2 bg-navy text-white py-3 px-8 text-sm font-semibold transition-colors hover:bg-[#1a4080] min-h-11"
              >
                Start Your Sourcing Journey
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #industries — Industries Served
          ============================================ */}
      <ScrollReveal>
        <section id="industries" className="py-16 md:py-24 px-4 md:px-8 bg-navy/5">
          <div className="max-w-[1200px] mx-auto">
            <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Industries We Serve</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 leading-tight">
              Specialised Sourcing Across 12+ Industries
            </h2>
            <p className="text-base text-gray-700 leading-relaxed mb-10 max-w-[600px]">
              From precision manufacturing to food and beverage — our factory network spans major Chinese manufacturing hubs across Jiangsu, Zhejiang, and Guangdong provinces.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
              {industries.map((item, i) => {
                const Icon = item.icon
                return (
                  <div
                    key={i}
                    className="industry-card bg-white border border-gray-200 rounded-lg px-4 py-3.5 flex items-center gap-3 hover:border-amber/30 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-md bg-navy/5 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-navy" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm text-navy font-medium">{item.name}</span>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-sm text-gray-500">
              Do not see your industry?{' '}
              <Link href="/enquiry" className="text-navy font-semibold underline hover:text-amber transition-colors">
                Tell us what you need
              </Link>
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #faq — Frequently Asked Questions
          ============================================ */}
      <section id="faq" className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Frequently Asked Questions</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy">
              Everything You Need to Know
            </h2>
          </div>
          <FAQ faqs={serviceFaqs} hideHeading />
        </div>
      </section>

      {/* ============================================
          #cta — Final Conversion
          ============================================ */}
      <section id="cta" className="py-16 md:py-24 px-4 md:px-8 bg-navy">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.5rem)] font-bold text-white mb-4 leading-tight">
            Ready to Source from China with Confidence?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-[560px] mx-auto leading-relaxed">
            Join Australian businesses already sourcing smarter with Winning Adventure Global. Start with a discovery call.
          </p>
          <Link
            href="/enquiry"
            className="inline-flex items-center justify-center bg-amber text-navy py-3.5 px-10 text-base font-semibold transition-all hover:bg-amber/90 min-h-11 cta-pulse"
          >
            Book a Discovery Call
          </Link>
          <p className="text-xs text-white/40 mt-6">
            Australia-based team. Pre-screened factories. No commissions from suppliers.
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
