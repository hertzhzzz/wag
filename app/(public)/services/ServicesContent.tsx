'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import ServiceSchema from '@/components/ServiceSchema'
import FAQ from '@/components/FAQ'
import { serviceFaqs } from '@/data/faqs-services'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ScrollReveal from '@/components/ScrollReveal'
import { trackCTAClick } from '@/lib/analytics'
import {
  Package, Plane, Monitor, Check, Minus,
  Search, Truck, ArrowRight,
  ClipboardCheck, MessageSquare,
  Palette, Tractor, Sun, Shirt,
  Wrench, Cog, Car, Sparkles,
  UtensilsCrossed, Heart,
} from 'lucide-react'
import '@/components/services-animations.css'
import { useT } from '@/i18n/useT'
import PriorityIndustryLinks from '@/components/PriorityIndustryLinks'

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
  { name: 'AV & Lighting', icon: Monitor, href: '/industries/av-lighting' as const },
  { name: 'Construction Materials', icon: Wrench, href: '/industries/construction' as const },
  { name: 'Agricultural Machinery', icon: Tractor, href: '/industries/agricultural-machinery' as const },
  { name: 'Automotive Parts', icon: Car },
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

export default function ServicesContent() {
  const t = useT()

  const serviceTiers: ServiceTier[] = [
    {
      id: 'procurement',
      icon: Package,
      title: t('page.svc.tier1Title'),
      tagline: t('page.svc.tier1Tagline'),
      bestFor: t('page.svc.tier1BestFor'),
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
      cta: t('page.svc.tier1Cta'),
      ctaHref: '/enquiry',
    },
    {
      id: 'factory-tour',
      icon: Plane,
      title: t('page.svc.tier2Title'),
      tagline: t('page.svc.tier2Tagline'),
      bestFor: t('page.svc.tier2BestFor'),
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
      cta: t('page.svc.tier2Cta'),
      ctaHref: '/enquiry',
    },
    {
      id: 'remote',
      icon: Monitor,
      title: t('page.svc.tier3Title'),
      tagline: t('page.svc.tier3Tagline'),
      bestFor: t('page.svc.tier3BestFor'),
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
      cta: t('page.svc.tier3Cta'),
      ctaHref: '/enquiry',
    },
  ]

  return (
    <>
      <ServiceSchema
        name="China Sourcing Services"
        description="China sourcing for Australian businesses: find and vet new suppliers, or visit and verify an existing factory. Priority industries include AV & lighting, construction materials, and agricultural machinery."
        url="https://www.winningadventure.com.au/services"
        areaServed={{ '@type': 'Country', name: 'Australia' }}
        serviceType={['China Sourcing Agent', 'Factory Tour', 'Supplier Verification', 'Quality Inspection', 'Procurement Support']}
      />
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
              {t('page.svc.heroHeading')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-4 leading-relaxed max-w-[600px]">
              {t('page.svc.heroSubheading')}
            </p>
            <p className="text-sm text-white/50 mb-10 leading-relaxed max-w-[560px]">
              {t('page.svc.heroBody')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#compare"
                className="inline-flex items-center justify-center bg-amber text-navy py-3.5 px-8 text-sm font-semibold transition-all hover:bg-amber/90 min-h-11 cta-pulse"
                aria-label={t('page.svc.heroCtaCompare')}
              >
                {t('page.svc.heroCtaCompare')}
              </Link>
              <Link
                href="/enquiry"
                className="inline-flex items-center justify-center bg-white/10 text-white py-3.5 px-8 text-sm font-semibold transition-all hover:bg-white/20 border border-white/30 min-h-11"
                aria-label={t('page.svc.heroCtaEnquire')}
                onClick={() => trackCTAClick('Services Hero Enquire', 'services-hero')}
              >
                {t('page.svc.heroCtaEnquire')}
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
              <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">{t('page.svc.tiersLabel')}</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 leading-tight">
                {t('page.svc.tiersHeading')}
              </h2>
              <p className="text-base text-gray-600 leading-relaxed max-w-[640px] mx-auto">
                {t('page.svc.tiersBody')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {serviceTiers.map((tier) => {
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
                        {t('page.svc.tiersMostPopular')}
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
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('page.svc.tierBestForLabel')}</p>
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
                      aria-label={tier.cta}
                      onClick={() => trackCTAClick(tier.cta, 'services-tier-card-desktop')}
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
              China Sourcing for Australian Businesses
            </h2>
            <p className="text-gray-600 mb-4 max-w-[720px] leading-relaxed">
              Primary path: find and vet new suppliers in China — shortlist factories, due diligence, visit
              planning, and on-ground coordination. Secondary path: visit or verify a factory you already know.
              You own the commercial relationship.
            </p>
            <p className="text-gray-600 mb-6 max-w-[720px] leading-relaxed">
              Service tiers change how deeply we are involved and whether you travel. They do not change the
              offer: China sourcing for Australian businesses, not verification-as-the-product.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/enquiry"
                className="inline-block bg-navy text-white py-3 px-8 text-sm font-semibold hover:bg-navy/90 transition-colors min-h-11"
                aria-label="Discuss Your Sourcing Project"
                onClick={() => trackCTAClick('Discuss Your Sourcing Project', 'services-sourcing-agent-section')}
              >
                Discuss Your Sourcing Project &rarr;
              </Link>
              <Link
                href="/article/importing-from-china-australia-guide"
                className="inline-block border border-navy/20 text-navy py-3 px-8 text-sm font-semibold hover:border-navy transition-colors min-h-11"
                aria-label="How It Works"
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
              Secondary path: visit or verify an existing factory
            </h2>
            <p className="text-gray-600 mb-4 max-w-[720px] leading-relaxed">
              Already have a factory contact? Visit planning and supplier verification remain available as a
              secondary path — not the primary offer on this site. We help you assess entity legitimacy,
              capability, and credentials before you commit.
            </p>
            <p className="text-gray-600 mb-6 max-w-[720px] leading-relaxed">
              For most Australian buyers, the main job is finding and vetting new suppliers first. Use this
              path when you already know who you want to assess or visit.
            </p>
            <Link
              href="/enquiry"
              className="inline-block bg-amber text-navy py-3 px-8 text-sm font-semibold hover:bg-amber/90 transition-colors min-h-11"
              aria-label="Request a Factory Audit"
              onClick={() => trackCTAClick('Request a Factory Audit', 'services-factory-audit-section')}
            >
              Request a Factory Audit &rarr;
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
              <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">{t('page.svc.compareLabel')}</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 leading-tight">
                {t('page.svc.compareHeading')}
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
                        aria-label={tier.cta}
                        onClick={() => trackCTAClick(tier.cta, 'services-tier-card-mobile')}
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
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 w-[280px]">{t('page.svc.compareTableFeatureHeader')}</th>
                    {serviceTiers.map((tier) => {
                      const Icon = tier.icon
                      return (
                        <th key={tier.id} className={`py-4 px-6 text-center ${tier.highlighted ? 'bg-amber/[0.04]' : 'bg-gray-50'}`}>
                          <div className="flex flex-col items-center gap-2">
                            <Icon size={20} className={tier.highlighted ? 'text-amber' : 'text-navy'} strokeWidth={1.5} />
                            <span className="text-sm font-bold text-navy">{tier.title}</span>
                            {tier.highlighted && (
                              <span className="text-[11px] bg-amber text-navy px-2 py-0.5 rounded-full font-semibold tracking-wide">{t('page.svc.compareTableMostPopular')}</span>
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
                {t('page.svc.compareFooterText')}{' '}
                <Link href="/enquiry" className="text-navy font-semibold underline hover:text-amber transition-colors" onClick={() => trackCTAClick('Services Compare Footer Link', 'services-compare-table')}>
                  {t('page.svc.compareFooterLink')}
                </Link>
                {' '}{t('page.svc.compareFooterSuffix')}
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
              <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">{t('page.svc.howItWorksLabel')}</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 leading-tight">
                {t('page.svc.howItWorksHeading')}
              </h2>
              <p className="text-base text-gray-600 leading-relaxed max-w-[560px] mx-auto">
                {t('page.svc.howItWorksBody')}
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

      <PriorityIndustryLinks
        source="services"
        heading="Priority industry pages"
        intro="Stable entry points into dual-path China sourcing for AV & lighting, construction materials, and agricultural machinery."
      />

      {/* ============================================
          #industries
          ============================================ */}
      <ScrollReveal>
        <section id="industries" className="py-16 md:py-24 px-4 md:px-8 bg-navy/[0.03]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">{t('page.svc.industriesLabel')}</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4 leading-tight">
                {t('page.svc.industriesHeading')}
              </h2>
              <p className="text-base text-gray-600 leading-relaxed max-w-[600px] mx-auto">
                From precision manufacturing to food and beverage — our factory network spans major Chinese manufacturing hubs across Jiangsu, Zhejiang, and Guangdong provinces.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
              {industries.map((item, i) => {
                const Icon = item.icon
                const className = "industry-card bg-white border border-gray-200 rounded-lg px-4 py-3.5 flex items-center gap-3 hover:border-amber/30 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 no-underline"
                const inner = (
                  <>
                    <div className="w-8 h-8 rounded-md bg-navy/5 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-navy" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm text-navy font-medium">{item.name}</span>
                  </>
                )
                if ('href' in item && item.href) {
                  return (
                    <Link key={i} href={item.href} className={className}>
                      {inner}
                    </Link>
                  )
                }
                return (
                  <div key={i} className={className}>
                    {inner}
                  </div>
                )
              })}
            </div>

            <p className="text-center text-sm text-gray-500">
              {t('page.svc.industriesFooterText')}{' '}
              <Link href="/enquiry" className="text-navy font-semibold underline hover:text-amber transition-colors" onClick={() => trackCTAClick('Services Industries Footer Link', 'services-industries-section')}>
                {t('page.svc.industriesFooterLink')}
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
            <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">{t('page.svc.faqLabel')}</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy">
              {t('page.svc.faqHeading')}
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
            {t('page.svc.ctaHeading')}
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-[560px] mx-auto leading-relaxed">
            {t('page.svc.ctaBody')}
          </p>
          <Link
            href="/enquiry"
            className="inline-flex items-center justify-center bg-amber text-navy py-3.5 px-10 text-base font-semibold transition-all hover:bg-amber/90 min-h-11 cta-pulse"
            aria-label={t('page.svc.ctaButton')}
            onClick={() => trackCTAClick('Services Bottom CTA', 'services-page-footer')}
          >
            {t('page.svc.ctaButton')}
          </Link>
          <p className="text-xs text-white/40 mt-6">
            {t('page.svc.ctaFootnote')}
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
