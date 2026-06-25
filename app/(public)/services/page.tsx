import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import ServiceSchema from '@/components/ServiceSchema'
import FAQ from '@/components/FAQ'

import { serviceFaqs } from '@/data/faqs-services'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ScrollReveal from '@/components/ScrollReveal'
import {
  Package, Plane, Monitor, Check, Minus,
  Building2, Search, FileText, Truck, ArrowRight,
  ClipboardCheck, Calendar, MessageSquare,
  Palette, Tractor, Sun, Shirt,
  Wrench, Cog, Car, Sparkles,
  UtensilsCrossed, Heart,
} from 'lucide-react'
import '@/components/services-animations.css'

export const metadata: Metadata = {
  title: { absolute: 'China Sourcing Services | Tours, Procurement & Verification' },
  description: 'Three flexible service tiers for Australian businesses sourcing from China. Choose one-time procurement, guided factory tours with supply chain setup, or remote verification with ongoing procurement management.',
  keywords: ['china sourcing services', 'china factory tours', 'remote factory verification', 'china procurement australia', 'supplier verification china', 'bulk procurement china'],
  openGraph: {
    title: 'China Sourcing Services | Winning Adventure Global',
    description: 'Three service tiers for Australian businesses: one-time procurement, guided factory tours, and remote verification with supply chain management.',
    url: 'https://www.winningadventure.com.au/services',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/services',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/services',
      'x-default': 'https://www.winningadventure.com.au/services',
    },
  },
}

interface ServiceTier {
  id: string
  icon: React.ElementType
  title: string
  tagline: string
  bestFor: string
  features: string[]
  highlighted?: boolean
  cta: string
  ctaHref: string
}

const serviceTiers: ServiceTier[] = [
  {
    id: 'procurement',
    icon: Package,
    title: 'One-Time Procurement',
    tagline: 'Your product, your choice — go to China with our guide or let us handle it remotely.',
    bestFor: 'Businesses with a clear product specification ready to place an order. Travel is optional — we accompany you either way.',
    features: [
      'Product specification matching against our factory database',
      'Supplier shortlist with pricing comparison',
      'Option to visit factories in China with your bilingual guide',
      'On-site or remote supplier negotiation support',
      'Pre-shipment quality inspection',
      'Logistics coordination to Australian port',
      'Trip planning and ground logistics if you choose to travel',
      'Transaction summary report',
    ],
    cta: 'Start a Procurement',
    ctaHref: '/enquiry',
  },
  {
    id: 'factory-tour',
    icon: Plane,
    title: 'Factory Tour + Supply Chain',
    tagline: 'Visit China with a bilingual guide and build your supply chain in person.',
    bestFor: 'Businesses that want to meet suppliers, tour production lines, and establish long-term sourcing relationships.',
    features: [
      'Pre-screened factory visits matched to your industry',
      'Full trip planning: scheduling, transport, accommodation',
      'Dedicated bilingual guide for all meetings and negotiations',
      'On-site factory audit: equipment, workforce, quality systems',
      'SAMR business license + certification authentication',
      'Export history validation for each shortlisted supplier',
      'Supplier negotiation with your requirements in the room',
      'Comprehensive post-visit report with recommendations',
      'Ongoing procurement support after you return to Australia',
    ],
    highlighted: true,
    cta: 'Plan a Factory Tour',
    ctaHref: '/enquiry',
  },
  {
    id: 'remote',
    icon: Monitor,
    title: 'Remote Verification + Supply Chain',
    tagline: 'Get verified suppliers and ongoing procurement management without travelling.',
    bestFor: 'Businesses that cannot travel to China but need deep supplier verification and regular procurement support.',
    features: [
      'Pre-screened factory matches from our verified database',
      'SAMR business license verification for every shortlisted supplier',
      'Certification authentication: ISO, CE, CCC, IEC cross-checked against issuing bodies',
      'Export history validation: customs declarations and Australian market experience',
      'Remote factory audit: video walkthrough of production floor and QC systems',
      'Supplier negotiation coordinated remotely',
      'Pre-shipment quality inspection with photo and video evidence',
      'Quarterly supplier performance reviews',
      'Dedicated procurement coordinator for ongoing orders',
    ],
    cta: 'Start Remote Verification',
    ctaHref: '/enquiry',
  },
]

interface ComparisonRow {
  feature: string
  tiers: [string, string, string]
}

const comparisonRows: ComparisonRow[] = [
  { feature: 'Supplier matching & shortlisting', tiers: ['Multiple options', 'Pre-screened', 'Pre-screened'] },
  { feature: 'Factory visit', tiers: ['Optional — travel with guide', 'In-person with bilingual guide', 'Remote video walkthrough'] },
  { feature: 'Business license verification (SAMR)', tiers: ['Basic check', 'Deep verification', 'Deep verification'] },
  { feature: 'Certification authentication', tiers: ['On request', 'On-site + database cross-check', 'Database cross-check'] },
  { feature: 'Export history validation', tiers: ['On request', 'Full customs review', 'Full customs review'] },
  { feature: 'On-site quality inspection', tiers: ['If you travel', 'During factory visit', 'Video-guided inspection'] },
  { feature: 'Pre-shipment quality inspection', tiers: ['Included', 'Included', 'Included with evidence'] },
  { feature: 'Price negotiation support', tiers: ['In-person or remote', 'In-person at factory', 'Remote coordination'] },
  { feature: 'Trip planning & ground logistics', tiers: ['If you travel', 'Full service', 'Not applicable'] },
  { feature: 'Dedicated bilingual guide', tiers: ['If you travel', 'Throughout trip', 'Video calls + messaging'] },
  { feature: 'Post-engagement report', tiers: ['Summary report', 'Comprehensive report', 'Comprehensive report'] },
  { feature: 'Ongoing procurement support', tiers: ['Transaction only', '12-month support', '12-month support'] },
  { feature: 'Time commitment from you', tiers: ['Flexible — travel optional', '5-7 days in China', 'Minimal'] },
  { feature: 'Best for', tiers: ['Single purchase with clear specs', 'Building long-term supply chains', 'Verified sourcing without travel'] },
]

const industries = [
  { name: 'AV Equipment', icon: Monitor },
  { name: 'Automotive Parts', icon: Car },
  { name: 'Engineering Machinery', icon: Wrench },
  { name: 'Agricultural Machinery', icon: Tractor },
  { name: 'Precision Manufacturing', icon: Cog },
  { name: 'Aesthetics & Cosmetics', icon: Sparkles },
  { name: 'Fashion & Apparel', icon: Shirt },
  { name: 'Food & Beverage', icon: UtensilsCrossed },
  { name: 'Solar & LED', icon: Sun },
  { name: 'Healthcare', icon: Heart },
  { name: 'Packaging', icon: Package },
  { name: 'Design & Interiors', icon: Palette },
]

const processSteps = [
  {
    num: '1',
    icon: MessageSquare,
    title: 'Submit Enquiry',
    desc: 'Tell us your industry, product type, and which service tier interests you. We respond within 24 hours to confirm receipt and schedule a discovery call.',
  },
  {
    num: '2',
    icon: Search,
    title: 'Supplier Matching',
    desc: 'We research and shortlist pre-screened factories from our verified database. Each shortlisted supplier has passed initial verification before reaching your review.',
  },
  {
    num: '3',
    icon: ClipboardCheck,
    title: 'Verification & Engagement',
    desc: 'Depending on your tier: visit factories in person with your bilingual guide, review remote audit results, or proceed directly to negotiation and procurement.',
  },
  {
    num: '4',
    icon: Truck,
    title: 'Delivery & Ongoing Support',
    desc: 'Quality inspection before shipment, logistics coordination to Australia, and ongoing procurement support for supply chain clients.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <ServiceSchema />
      {/* FAQ content preserved as static HTML — Google deprecated FAQ rich results May 2026 */}
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Services', url: 'https://www.winningadventure.com.au/services' },
      ]} />

      {/* ============================================
          #hero
          ============================================ */}
      <section id="hero" className="relative min-h-[20vh] md:min-h-[240px] flex items-center bg-navy overflow-hidden">
        <Image
          src="/services/hero.webp"
          alt=""
          fill
          priority
          className="object-cover z-0"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/75 to-navy/70 z-[1]" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_50%,_white_1px,_transparent_1px)] bg-[length:40px_40px] z-[1]" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-amber">Services</span>
          </div>

          <div className="max-w-[720px]">
            <h1 className="font-serif font-bold text-[clamp(2rem,4.5vw,3.25rem)] text-white mb-6 leading-tight">
              China Sourcing Services for Australian Businesses
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-4 leading-relaxed max-w-[600px]">
              Three flexible service tiers. One clear outcome: verified Chinese suppliers delivering quality product to your door.
            </p>
            <p className="text-sm text-white/50 mb-10 leading-relaxed max-w-[560px]">
              Whether you need a single purchase executed well, want to visit factories in person, or prefer remote verification with ongoing management — choose the approach that fits your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#compare"
                className="inline-flex items-center justify-center bg-amber text-navy py-3.5 px-8 text-sm font-semibold transition-all hover:bg-amber/90 min-h-11 cta-pulse"
              >
                Compare Service Tiers
              </Link>
              <Link
                href="/enquiry"
                className="inline-flex items-center justify-center bg-white/10 text-white py-3.5 px-8 text-sm font-semibold transition-all hover:bg-white/20 border border-white/30 min-h-11"
              >
                Enquire Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          #tiers — Three Service Tiers
          ============================================ */}
      <ScrollReveal>
        <section id="tiers" className="py-16 md:py-24 px-4 md:px-8 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Service Tiers</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 leading-tight">
                Choose Your Approach to China Sourcing
              </h2>
              <p className="text-base text-gray-600 leading-relaxed max-w-[640px] mx-auto">
                Every engagement starts with supplier verification. The difference is how deeply you want us involved and whether you visit China yourself.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {serviceTiers.map((tier, idx) => {
                const Icon = tier.icon
                return (
                  <div
                    key={tier.id}
                    className={`svc-tier-card relative flex flex-col rounded-xl border-2 p-6 lg:p-8 transition-all duration-300 hover:-translate-y-1 ${
                      tier.highlighted
                        ? 'border-amber bg-amber/[0.02] shadow-[0_8px_40px_rgba(245,158,11,0.12)]'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-navy text-xs font-bold px-4 py-1 rounded-full tracking-wide">
                        MOST POPULAR
                      </div>
                    )}

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                      tier.highlighted ? 'bg-amber/15' : 'bg-navy/5'
                    }`}>
                      <Icon size={24} className={tier.highlighted ? 'text-amber' : 'text-navy'} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-xl font-bold text-navy mb-2">{tier.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{tier.tagline}</p>

                    <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Best for</p>
                      <p className="text-sm text-navy leading-relaxed">{tier.bestFor}</p>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check size={16} className={`flex-shrink-0 mt-0.5 ${tier.highlighted ? 'text-amber' : 'text-green-600'}`} strokeWidth={2.5} />
                          <span className="text-sm text-gray-700 leading-relaxed">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={tier.ctaHref}
                      className={`inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold transition-all min-h-11 rounded-lg text-center ${
                        tier.highlighted
                          ? 'bg-amber text-navy hover:bg-amber/90'
                          : 'bg-navy text-white hover:bg-[#1a4080]'
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #sourcing-agent — China Sourcing Agent
          ============================================ */}
      <ScrollReveal>
        <section id="sourcing-agent" className="py-12 md:py-16 px-4 md:px-8 bg-white">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-serif text-3xl text-navy mb-4">
              China Sourcing Agent for Australian Businesses
            </h2>
            <p className="text-gray-600 mb-4 max-w-[720px] leading-relaxed">
              We act as your on-the-ground procurement team in China — finding factories, negotiating prices,
              managing quality control, and handling logistics. Unlike online platforms where you never know
              who you are dealing with, we visit factories in person, verify their credentials, and stand
              behind our recommendations.
            </p>
            <p className="text-gray-600 mb-6 max-w-[720px] leading-relaxed">
              Whether you need a one-time bulk order or ongoing supply, we match you with pre-screened
              manufacturers that fit your product, budget, and volume requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/enquiry"
                className="inline-block bg-navy text-white py-3 px-8 text-sm font-semibold hover:bg-navy/90 transition-colors min-h-11"
              >
                Get a Free Supplier Shortlist →
              </Link>
              <Link
                href="/article/importing-from-china-australia-guide"
                className="inline-block border border-navy/20 text-navy py-3 px-8 text-sm font-semibold hover:border-navy transition-colors min-h-11"
              >
                How It Works
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #factory-audit — Factory Audit & Supplier Verification
          ============================================ */}
      <ScrollReveal>
        <section id="factory-audit" className="py-12 md:py-16 px-4 md:px-8 bg-[#f0f4f8]">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-serif text-3xl text-navy mb-4">
              Factory Audit & Supplier Verification in China
            </h2>
            <p className="text-gray-600 mb-4 max-w-[720px] leading-relaxed">
              Before you pay any deposit, we verify the factory exists, holds the certifications they claim,
              and can produce to your specifications. Our audit covers business licence checks, production
              floor assessment, equipment verification, and certificate authentication.
            </p>
            <p className="text-gray-600 mb-6 max-w-[720px] leading-relaxed">
              You receive a written report with photos, licence documentation, and our assessment of whether
              the supplier is a genuine manufacturer — not a trading company posing as one.
            </p>
            <Link
              href="/enquiry"
              className="inline-block bg-amber text-navy py-3 px-8 text-sm font-semibold hover:bg-amber/90 transition-colors min-h-11"
            >
              Request a Factory Audit →
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #compare — Comparison Table
          ============================================ */}
      <ScrollReveal>
        <section id="compare" className="py-16 md:py-24 px-4 md:px-8 bg-navy/[0.03]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Detailed Comparison</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 leading-tight">
                Which Service Tier Fits Your Needs?
              </h2>
              <p className="text-base text-gray-600 leading-relaxed max-w-[640px] mx-auto">
                Compare features across all three tiers to find the right approach for your sourcing requirements.
              </p>
            </div>

            {/* Mobile: card-based comparison */}
            <div className="block lg:hidden space-y-8">
              {serviceTiers.map((tier) => {
                const Icon = tier.icon
                return (
                  <div key={tier.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className={`px-6 py-4 flex items-center gap-3 ${tier.highlighted ? 'bg-amber/10 border-b border-amber/20' : 'bg-gray-50 border-b border-gray-100'}`}>
                      <Icon size={20} className={tier.highlighted ? 'text-amber' : 'text-navy'} strokeWidth={1.5} />
                      <h4 className="font-bold text-navy">{tier.title}</h4>
                      {tier.highlighted && <span className="text-xs bg-amber text-navy px-2 py-0.5 rounded-full font-semibold ml-auto">Popular</span>}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {comparisonRows.map((row, i) => (
                        <div key={i} className="px-6 py-3 flex justify-between items-center gap-4">
                          <span className="text-sm text-gray-600">{row.feature}</span>
                          <span className="text-sm text-navy font-medium text-right">{row.tiers[serviceTiers.indexOf(tier)]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100">
                      <Link
                        href={tier.ctaHref}
                        className={`block text-center py-2.5 px-4 text-sm font-semibold rounded-lg transition-all ${
                          tier.highlighted ? 'bg-amber text-navy hover:bg-amber/90' : 'bg-navy text-white hover:bg-[#1a4080]'
                        }`}
                      >
                        {tier.cta}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: comparison table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 w-[280px]">Feature</th>
                    {serviceTiers.map((tier) => {
                      const Icon = tier.icon
                      return (
                        <th key={tier.id} className={`py-4 px-6 text-center ${tier.highlighted ? 'bg-amber/[0.04]' : 'bg-gray-50'}`}>
                          <div className="flex flex-col items-center gap-2">
                            <Icon size={20} className={tier.highlighted ? 'text-amber' : 'text-navy'} strokeWidth={1.5} />
                            <span className="text-sm font-bold text-navy">{tier.title}</span>
                            {tier.highlighted && (
                              <span className="text-[11px] bg-amber text-navy px-2 py-0.5 rounded-full font-semibold tracking-wide">MOST POPULAR</span>
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-6 text-sm text-gray-700 font-medium">{row.feature}</td>
                      {row.tiers.map((cell, j) => (
                        <td key={j} className={`py-3.5 px-6 text-sm text-center ${serviceTiers[j].highlighted ? 'bg-amber/[0.02]' : ''}`}>
                          {cell === 'Not included' || cell === 'Not applicable' ? (
                            <span className="inline-flex items-center gap-1.5 text-gray-400">
                              <Minus size={16} strokeWidth={2} />
                              {cell}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-navy">
                              <Check size={18} className="text-amber" strokeWidth={2.5} />
                              {cell}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Not sure which tier is right for you?{' '}
                <Link href="/enquiry" className="text-navy font-semibold underline hover:text-amber transition-colors">
                  Book a discovery call
                </Link>
                {' '}and we will help you decide.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #how-it-works
          ============================================ */}
      <ScrollReveal>
        <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-8 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">How It Works</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 leading-tight">
                From Enquiry to Delivery
              </h2>
              <p className="text-base text-gray-600 leading-relaxed max-w-[560px] mx-auto">
                Every engagement follows the same proven process, adapted to your chosen service tier.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={i} className="process-step relative text-center">
                    <div className="w-14 h-14 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-4">
                      <Icon size={24} className="text-navy" strokeWidth={1.5} />
                    </div>
                    <div className="absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] hidden lg:flex items-center" aria-hidden="true">
                      <div className="flex-1 h-[2px] bg-amber/30" />
                      <div className="w-2 h-2 border-t-2 border-r-2 border-amber/30 rotate-45 -mr-[1px]" />
                    </div>
                    <p className="text-xs text-amber font-bold mb-2">STEP {step.num}</p>
                    <h4 className="font-bold text-navy mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ============================================
          #industries
          ============================================ */}
      <ScrollReveal>
        <section id="industries" className="py-16 md:py-24 px-4 md:px-8 bg-navy/[0.03]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Industries We Serve</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 leading-tight">
                Specialised Sourcing Across 12+ Industries
              </h2>
              <p className="text-base text-gray-600 leading-relaxed max-w-[600px] mx-auto">
                From precision manufacturing to food and beverage — our factory network spans major Chinese manufacturing hubs across Jiangsu, Zhejiang, and Guangdong provinces.
              </p>
            </div>

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
          #faq
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
          #cta
          ============================================ */}
      <section id="cta" className="py-16 md:py-24 px-4 md:px-8 bg-navy">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.5rem)] font-bold text-white mb-4 leading-tight">
            Ready to Source from China with Confidence?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-[560px] mx-auto leading-relaxed">
            Join Australian businesses already sourcing smarter with Winning Adventure Global. Start with a discovery call — no commitment, no pressure.
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
