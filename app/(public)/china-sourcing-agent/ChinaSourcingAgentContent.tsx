'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, Globe, Shield, Users, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FAQ from '@/components/FAQ'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import TrackedEnquiryLink from '@/components/TrackedEnquiryLink'
import { useT } from '@/i18n/useT'

const processSteps = [
  {
    num: '1',
    title: 'Requirements Gathering',
    desc: 'We start with a consultation to understand your product, industry, volume requirements, and quality standards.',
  },
  {
    num: '2',
    title: 'Supplier Matching',
    desc: 'We identify and background-check 2–3 factories matched to your specific requirements within 3–7 days.',
  },
  {
    num: '3',
    title: 'Factory Verification',
    desc: 'Each recommended factory passes our 12-point verification: business registration, export history, production capacity, certifications, and sample quality.',
  },
  {
    num: '4',
    title: 'Quality Control',
    desc: 'Pre-shipment inspections and on-site assessments throughout production. You receive written quality reports before goods leave the factory.',
  },
  {
    num: '5',
    title: 'Logistics Coordination',
    desc: 'We coordinate freight forwarding, customs documentation, and shipping from factory floor to your door in Australia.',
  },
  {
    num: '6',
    title: 'After-Sales Support',
    desc: 'Ongoing communication with your supplier post-delivery. We handle any quality disputes, reorders, or follow-up site visits.',
  },
]

const comparisonRows = [
  ['Initial setup cost', 'High', 'Low', 'Moderate'],
  ['Quality control', 'Difficult — no on-ground support', 'Average — depends on you', 'Strong — on-site inspections'],
  ['Language barrier', 'Significant', 'Moderate', 'None — native Chinese speakers'],
  ['Travel costs', 'High — all trips at your expense', 'Low to moderate', 'Included in service fee'],
  ['Fraud / misrepresentation risk', 'High — no verification', 'Moderate', 'Low — 12-point verification'],
  ['Delivery guarantee', 'Average', 'Average', 'Strong — contractual milestones'],
]

// SEO FAQ copy stays English (not translated) — same pattern as other service landings.
const faqs: Array<{ question: string; answer: string }> = [
  {
    question: 'What industries do you work with?',
    answer:
      'We cover 50+ industries including AV equipment, automotive parts, engineering machinery, agricultural equipment, precision manufacturing, and heavy equipment. If you are importing from China, we can help.',
  },
  {
    question: 'How do you verify factories?',
    answer:
      'Our 12-point verification process covers: SAMR business registration check, export history verification, production capacity assessment, quality certification authentication, sample evaluation, and financial stability review — all before your visit.',
  },
  {
    question: 'What does the service cost?',
    answer:
      'A deposit is required to begin. Service fees are discussed after we understand your product and requirements. You receive a clear scope and fee proposal before any engagement begins.',
  },
  {
    question: 'Do you handle logistics and shipping?',
    answer:
      'Yes. We coordinate freight forwarding, customs clearance documentation, and shipping from the factory to your door in Australia. We work with established freight partners to ensure competitive rates.',
  },
  {
    question: 'Can you help if I have already found a supplier on Alibaba or 1688?',
    answer:
      'Absolutely. Many Australian businesses come to us after a frustrating DIY experience on Alibaba or 1688. We can verify your existing shortlist, conduct independent audits, and help you make a decision — before you commit.',
  },
  {
    question: 'Do I need to travel to China?',
    answer:
      'Factory visits are strongly recommended — they give you the best insight into whether a supplier is genuine and capable. However, if travel is not possible, we can conduct full on-site assessments on your behalf and provide detailed written reports.',
  },
  {
    question: 'What if a factory fails quality expectations after shipment?',
    answer:
      'We provide post-delivery support including dispute resolution with your supplier, re-inspection coordination, and follow-up factory visits if needed. Our relationship with your supplier does not end at delivery.',
  },
  {
    question: 'How is this different from using a generic sourcing agent?',
    answer:
      'Winning Adventure Global is Australia-based with a China-based operations team. We do not take factory commissions, our incentives align with your outcome, and our 12-point verification process is specifically designed for Australian import requirements. We also provide full post-trip written assessments.',
  },
]

export default function ChinaSourcingAgentContent() {
  const t = useT()

  const capabilityCards = [
    {
      icon: <Shield size={24} className="text-[#F59E0B]" aria-hidden="true" />,
      title: t('page.csa.cap1Title'),
      desc: t('page.csa.cap1Desc'),
    },
    {
      icon: <Users size={24} className="text-[#F59E0B]" aria-hidden="true" />,
      title: t('page.csa.cap2Title'),
      desc: t('page.csa.cap2Desc'),
    },
    {
      icon: <CheckCircle size={24} className="text-[#F59E0B]" aria-hidden="true" />,
      title: t('page.csa.cap3Title'),
      desc: t('page.csa.cap3Desc'),
    },
    {
      icon: <Globe size={24} className="text-[#F59E0B]" aria-hidden="true" />,
      title: t('page.csa.cap4Title'),
      desc: t('page.csa.cap4Desc'),
    },
  ]

  return (
    <>
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.winningadventure.com.au' },
          { name: 'Services', url: 'https://www.winningadventure.com.au/services' },
          {
            name: 'China Sourcing Agent',
            url: 'https://www.winningadventure.com.au/china-sourcing-agent',
          },
        ]}
      />

      <main>
        {/* Hero */}
        <section className="relative min-h-[48vh] md:min-h-[420px] flex items-center bg-[#0F2D5E] overflow-hidden border-b-4 border-[#F59E0B]">
          <Image
            src="/china-sourcing-agent/hero.webp"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover z-0"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#0F2D5E]/92 via-[#0F2D5E]/85 to-[#0F2D5E]/75 z-[1]"
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-12 py-16">
            <p className="text-xs font-bold tracking-[2px] uppercase text-[#F59E0B] mb-3">
              {t('page.csa.heroBadge')}
            </p>
            <h1 className="font-serif font-bold text-white text-[clamp(1.8rem,4vw,3rem)] leading-tight max-w-[720px] mb-4">
              {t('page.csa.heroHeading')}
            </h1>
            <p className="text-base text-gray-300 max-w-[560px] leading-relaxed mb-8">
              {t('page.csa.heroSubcopy')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <TrackedEnquiryLink
                buttonName="Book a Consultation"
                location="china-sourcing-agent-hero"
                className="inline-flex items-center justify-center bg-[#F59E0B] text-[#0F2D5E] py-3.5 px-8 text-base font-semibold hover:bg-[#F59E0B]/90 transition-colors min-h-11"
              >
                {t('page.csa.consultButton')} <ArrowRight className="inline ml-2" size={16} aria-hidden="true" />
              </TrackedEnquiryLink>
              <Link
                href="/article/sourcing-agent-australia"
                className="inline-flex items-center justify-center border border-white/30 text-white py-3.5 px-8 text-base font-semibold hover:border-white transition-colors min-h-11"
                aria-label={t('page.csa.pillarLinkLabel')}
              >
                {t('page.csa.pillarLinkLabel')}
              </Link>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-16">
          <div className="max-w-[640px] mb-10">
            <p className="uppercase tracking-[0.12em] text-xs text-[#F59E0B] font-semibold mb-3">
              {t('page.csa.whatWeDoBadge')}
            </p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-[#0F2D5E] mb-4">
              {t('page.csa.whatWeDoHeading')}
            </h2>
            <p className="text-gray-600 leading-relaxed">{t('page.csa.whatWeDoBody')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilityCards.map((item) => (
              <div key={item.title} className="bg-[#f8f9fb] p-6 border border-gray-100">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-serif text-[1.05rem] font-bold text-[#0F2D5E] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="bg-[#f8f9fb] py-16 px-4 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <div className="max-w-[640px] mb-10">
              <p className="uppercase tracking-[0.12em] text-xs text-[#F59E0B] font-semibold mb-3">
                {t('page.csa.processBadge')}
              </p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-[#0F2D5E] mb-4">
                {t('page.csa.processHeading')}
              </h2>
              <p className="text-gray-600 leading-relaxed">{t('page.csa.processBody')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {processSteps.map((step) => (
                <div
                  key={step.num}
                  className="bg-white p-5 border border-[#0F2D5E]/5 shadow-[0_4px_24px_rgba(15,45,94,0.06)]"
                >
                  <div className="w-9 h-9 rounded-full bg-[#0F2D5E] text-white flex items-center justify-center font-semibold text-sm mb-3">
                    {step.num}
                  </div>
                  <h3 className="text-sm font-bold text-[#0F2D5E] mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-[#F59E0B] font-semibold mb-3">
              {t('page.csa.compareBadge')}
            </p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-[#0F2D5E] mb-4">
              {t('page.csa.compareHeading')}
            </h2>
            <p className="text-gray-600 leading-relaxed">{t('page.csa.compareBody')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-[#0F2D5E]">{t('page.csa.compareColDimension')}</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-400 bg-gray-50">
                    {t('page.csa.compareColDirect')}
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-400 bg-gray-50">
                    {t('page.csa.compareColPlatform')}
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-[#0F2D5E] bg-[#F59E0B]/10">
                    {t('page.csa.compareColUs')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([dimension, direct, platform, us]) => (
                  <tr key={dimension as string} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-medium text-[#0F2D5E]">{dimension as string}</td>
                    <td className="text-center py-4 px-4 bg-gray-50">{direct as string}</td>
                    <td className="text-center py-4 px-4 bg-gray-50">{platform as string}</td>
                    <td className="text-center py-4 px-4 bg-[#F59E0B]/10 font-semibold text-[#0F2D5E]">
                      {us as string}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/article/china-sourcing-agent-vs-direct"
              className="text-sm text-[#0F2D5E] font-semibold underline hover:text-[#F59E0B] transition-colors"
            >
              {t('page.csa.compareLinkVsDirect')}
            </Link>
            <Link
              href="/article/importing-from-china-australia-guide"
              className="text-sm text-[#0F2D5E] font-semibold underline hover:text-[#F59E0B] transition-colors"
            >
              {t('page.csa.compareLinkGuide')}
            </Link>
          </div>
        </section>

        {/* Narrative */}
        <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-16 space-y-14">
          <div>
            <h3 className="font-serif text-[clamp(1.3rem,2.5vw,1.75rem)] font-bold text-[#0F2D5E] mb-4">
              {t('page.csa.narrative1Heading')}
            </h3>
            <p className="text-gray-600 leading-relaxed">{t('page.csa.narrative1Body')}</p>
          </div>
          <div>
            <h3 className="font-serif text-[clamp(1.3rem,2.5vw,1.75rem)] font-bold text-[#0F2D5E] mb-4">
              {t('page.csa.narrative2Heading')}
            </h3>
            <p className="text-gray-600 leading-relaxed">{t('page.csa.narrative2Body')}</p>
          </div>
          <div>
            <h3 className="font-serif text-[clamp(1.3rem,2.5vw,1.75rem)] font-bold text-[#0F2D5E] mb-4">
              {t('page.csa.narrative3Heading')}
            </h3>
            <p className="text-gray-600 leading-relaxed">{t('page.csa.narrative3Body')}</p>
          </div>
          <div>
            <h3 className="font-serif text-[clamp(1.3rem,2.5vw,1.75rem)] font-bold text-[#0F2D5E] mb-4">
              {t('page.csa.narrative4Heading')}
            </h3>
            <p className="text-gray-600 leading-relaxed">{t('page.csa.narrative4Body')}</p>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {t('page.csa.relatedIntro')}{' '}
            <Link href="/supplier-verification" className="text-[#0F2D5E] font-semibold underline hover:text-[#F59E0B]">
              {t('page.csa.relatedVerification')}
            </Link>
            {', '}
            <Link href="/visiting-chinese-factories" className="text-[#0F2D5E] font-semibold underline hover:text-[#F59E0B]">
              {t('page.csa.relatedVisits')}
            </Link>
            {', '}
            <Link
              href="/article/sourcing-agent-australia"
              className="text-[#0F2D5E] font-semibold underline hover:text-[#F59E0B]"
            >
              {t('page.csa.relatedPillar')}
            </Link>
            .
          </p>
        </section>

        {/* FAQ */}
        <section className="bg-white py-16 px-4 md:px-12">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-12">
              <p className="uppercase tracking-[0.12em] text-xs text-[#F59E0B] font-semibold mb-3">
                {t('page.csa.faqBadge')}
              </p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-[#0F2D5E]">
                {t('page.csa.faqHeading')}
              </h2>
            </div>
            <FAQ faqs={faqs} />
            <p className="text-center text-sm text-gray-500 mt-8">
              {t('page.csa.faqMore')}{' '}
              <TrackedEnquiryLink
                buttonName="Send us an enquiry"
                location="china-sourcing-agent-faq"
                className="text-[#0F2D5E] font-semibold underline hover:text-[#F59E0B]"
              >
                {t('page.csa.faqEnquiry')}
              </TrackedEnquiryLink>
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-[#F59E0B] py-12 px-4 text-center">
          <div className="max-w-[760px] mx-auto">
            <h2 className="font-serif text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-[#0F2D5E] mb-4">
              {t('page.csa.ctaHeading')}
            </h2>
            <p className="text-[#0F2D5E]/70 mb-6 leading-relaxed">{t('page.csa.ctaBody')}</p>
            <TrackedEnquiryLink
              buttonName="Book a Consultation"
              location="china-sourcing-agent-bottom-cta"
              className="inline-block bg-[#0F2D5E] text-white py-3.5 px-8 text-base font-semibold transition-colors hover:bg-[#1a4080] min-h-11"
            >
              {t('page.csa.consultButton')} <ArrowRight className="inline ml-2" size={16} aria-hidden="true" />
            </TrackedEnquiryLink>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
