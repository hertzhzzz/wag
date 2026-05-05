import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import { aboutFaqs } from '@/data/faqs-about'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import PersonSchema from '@/components/PersonSchema'

export const metadata: Metadata = {
  title: 'About WAG | Australia China Sourcing Experts & Factory Tour Guides',
  description: 'Adelaide-based China sourcing agency with 12+ years experience. We arrange factory tours, verify suppliers and support Australian businesses with end-to-end procurement.',
  keywords: [
    'Adelaide China procurement consultant',
    'Australian owned China sourcing company',
    'South Australia import agent',
    'Sydney Melbourne Brisbane Perth China sourcing',
  ],
  authors: [{ name: 'Mark He', url: 'https://www.linkedin.com/in/mark-zhe-he/' }],
  openGraph: {
    title: 'About WAG | Australia China Sourcing Experts',
    description: 'Adelaide-based China sourcing agency with 12+ years experience arranging factory tours and verifying suppliers for Australian businesses across China.',
    url: 'https://www.winningadventure.com.au/about',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/about',
  },
}

export default function AboutPage() {
  return (
    <>
      <FAQSchema faqs={aboutFaqs} />
      <PersonSchema />
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'About', url: 'https://www.winningadventure.com.au/about' }
      ]} />

      {/* Hero - Mobile: static image */}
      <div className="md:hidden relative w-full" style={{ height: '280px' }}>
        <Image
          src="/hero-image.webp"
          alt="Winning Adventure Global team bridging Australian businesses with Chinese manufacturers"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
        <div className="relative z-10 flex flex-col justify-end h-full px-4 pb-6 max-w-[90%] mx-auto">
          <h1 className="font-serif text-[1.75rem] font-normal leading-[1.15] text-white">
            We exist because Australian businesses deserve <em className="italic text-amber">direct access</em> to Chinese manufacturing — without the guesswork.
          </h1>
        </div>
      </div>

      {/* Hero - Desktop: video */}
      <div className="hidden md:block relative w-full" style={{ height: 'clamp(280px, 50vw, 480px)' }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/hero-image.webp"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev/hero_vid.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
        <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-12 pb-8 md:pb-12 max-w-[90%] mx-auto">
          <h1 className="font-serif text-[clamp(1.75rem,5vw,3.5rem)] font-normal leading-[1.15] text-white">
            We exist because Australian businesses deserve <em className="italic text-amber">direct access</em> to Chinese manufacturing — without the guesswork.
          </h1>
        </div>
      </div>

      {/* Founder Story */}
      <div className="py-10 md:py-[60px] px-4 md:px-[72px] max-w-[860px] mx-auto">
        <div className="text-[11px] font-semibold text-amber tracking-[0.12em] uppercase mb-5">
          The Founder&apos;s Story
        </div>
        <h2 className="font-serif text-[34px] font-normal leading-tight mb-7">
          I&apos;ve Spent Years Building the Bridges Most Businesses Never Find
        </h2>
        <p className="text-base leading-relaxed text-gray-700 mb-5">
          When Andy Liu moved from China to Adelaide, the gap was immediately apparent. Australian businesses were leaving millions on the table — not because Chinese suppliers didn&apos;t want to work with them, but because no one was doing the translation work. Not just language. Trust. Process. Relationships.
        </p>
        <p className="text-base leading-relaxed text-gray-700 mb-5">
          Andy has spent years inside Chinese manufacturing hubs — Shenzhen, Foshan, Guangzhou. He knows which suppliers deliver on time, which ones cut corners on quality, and which ones are genuinely excited to build long-term partnerships with Australian B2B buyers.
        </p>
        <blockquote className="border-l-4 border-amber py-4 px-6 bg-[#fffbf0] my-8 font-serif italic text-lg leading-relaxed text-navy">
          &quot;The suppliers are ready. The opportunity is real. You just need someone who&apos;s already on the ground to open the right doors.&quot;
        </blockquote>
        <p className="text-base leading-relaxed text-gray-700">
          Winning Adventure Global is the bridge Andy Liu wished had existed when he was helping his first Australian client source from China. We don&apos;t guess. We verify, match, and deliver.
        </p>
      </div>

      {/* Australia Leadership */}
      <div className="py-10 md:py-[60px] px-4 md:px-[72px] max-w-[1100px] mx-auto hidden">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 md:gap-16 items-start">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] max-w-[280px] bg-gray-100 border-2 border-amber overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 text-gray-400">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Mark He</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center uppercase tracking-wider">
              Managing Director, Australia
            </p>
          </div>

          {/* Profile Content */}
          <div>
            <div className="text-[11px] font-semibold text-amber tracking-[0.12em] uppercase mb-3">
              Australia Team
            </div>
            <h2 className="font-serif text-[34px] font-normal leading-tight mb-7">
              Your Australian Point of Contact for China Sourcing
            </h2>
            <p className="text-base leading-relaxed text-gray-700 mb-5">
              As Managing Director of WAG&apos;s Australia office, I bridge the gap between Australian businesses and Chinese manufacturing. Based in Adelaide, I work directly with clients across Australia — from initial supplier search through to final delivery.
            </p>
            <p className="text-base leading-relaxed text-gray-700 mb-5">
              My focus is simple: helping Australian businesses source with confidence. Whether you are establishing your first supply chain or optimising an existing one, I bring local accountability and direct access to WAG&apos;s verified factory network in China.
            </p>
            <blockquote className="border-l-4 border-amber py-4 px-6 bg-[#fffbf0] my-8 font-serif italic text-lg leading-relaxed text-navy">
              &quot;You do not need to navigate this alone. I am here to translate the process, verify the suppliers, and make sure your interests are protected at every step.&quot;
            </blockquote>
            <p className="text-base leading-relaxed text-gray-700 mb-5">
              If you are evaluating suppliers, worried about quality consistency, or simply want to understand your options before committing — let us have a conversation. No pressure, no obligations. Just straight talk about your sourcing challenges.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.linkedin.com/in/mark-zhe-he/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-navy text-white text-sm font-semibold py-3 px-6 tracking-wide transition-opacity hover:opacity-85 min-h-11"
              >
                Connect on LinkedIn
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <Link
                href="/enquiry"
                className="inline-block bg-amber text-navy text-sm font-semibold py-3 px-8 tracking-wide transition-opacity hover:opacity-85 min-h-11"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Values Strip */}
      <div className="bg-navy py-12 px-4 md:px-20 grid grid-cols-1 md:grid-cols-3 gap-px">
        <div className="py-8 px-8 border-r border-white/10">
          <div className="text-[11px] font-semibold text-amber tracking-[0.1em] mb-3">01</div>
          <h3 className="text-[17px] font-medium text-white mb-2">Verified First, Always</h3>
          <p className="text-[13px] text-[#8a9bb0] leading-relaxed">
            Every supplier in our network passes a 12-point verification process before we recommend them to any Australian client.
          </p>
        </div>
        <div className="py-8 px-8 border-r border-white/10">
          <div className="text-[11px] font-semibold text-amber tracking-[0.1em] mb-3">02</div>
          <h3 className="text-[17px] font-medium text-white mb-2">Relationships Over Transactions</h3>
          <p className="text-[13px] text-[#8a9bb0] leading-relaxed">
            We build long-term partnerships, not one-off deals. Your supply chain should be a competitive advantage.
          </p>
        </div>
        <div className="py-8 px-8">
          <div className="text-[11px] font-semibold text-amber tracking-[0.1em] mb-3">03</div>
          <h3 className="text-[17px] font-medium text-white mb-2">Clarity at Every Step</h3>
          <p className="text-[13px] text-[#8a9bb0] leading-relaxed">
            No jargon, no surprises. You get plain-English reports with real data, real contacts, and real timelines.
          </p>
        </div>
      </div>

      {/* Split Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
        <div className="bg-[#F9FAFB] py-12 md:py-20 px-4 md:px-[60px] border-r border-gray-200">
          <div className="text-[11px] font-semibold text-amber tracking-[0.15em] uppercase mb-4">
            Australian Perspective
          </div>
          <h2 className="font-serif text-[32px] font-normal mb-7 leading-tight">
            What Australian B2B Businesses Need
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-5">
            You&apos;re not looking for the cheapest factory on Alibaba. You need reliable partners who understand quality standards, respond in English, and can scale with your business.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-5">
            You need suppliers who won&apos;t ghost you after the first order. Who understand Australian compliance requirements. Who see you as a long-term partner, not a one-off transaction.
          </p>
          <ul className="list-none mt-8">
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              Verified supplier credentials
            </li>
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              English-responsive communication
            </li>
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              Australian compliance knowledge
            </li>
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              Transparent pricing structures
            </li>
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              Long-term partnership mindset
            </li>
            <li className="py-4 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              Fast turnaround on quotes
            </li>
          </ul>
        </div>

        <div className="bg-white py-12 md:py-20 px-4 md:px-[60px]">
          <div className="text-[11px] font-semibold text-amber tracking-[0.15em] uppercase mb-4">
            Chinese Resources
          </div>
          <h2 className="font-serif text-[32px] font-normal mb-7 leading-tight">
            What Chinese Suppliers Offer
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-5">
            China has the manufacturing capacity, the technical expertise, and the willingness to work with Australian businesses. The challenge isn&apos;t capability — it&apos;s connection.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-5">
            Our network of 500+ verified suppliers across Guangdong Province — Shenzhen, Foshan, and Guangzhou — are actively seeking Australian B2B partners. They&apos;re ready. You just need the introduction.
          </p>
          <ul className="list-none mt-8">
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              7+ industries covered
            </li>
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              500+ verified factory partners
            </li>
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              6 Chinese provinces
            </li>
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              English-speaking liaisons
            </li>
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              Export compliance experience
            </li>
            <li className="py-4 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              Competitive pricing at scale
            </li>
          </ul>
        </div>
      </div>

      {/* Bridge Visual */}
      <div className="py-10 md:py-[60px] px-4 md:px-20 bg-navy text-center">
        <h3 className="font-serif text-[28px] text-white mb-10">
          We are the bridge between these two worlds
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 flex-wrap">
          <div className="flex-1 max-w-[280px] bg-white/5 border-2 border-white/15 py-8 px-6 text-center">
            <h4 className="text-base font-semibold text-white mb-2">Australian Business</h4>
            <p className="text-xs text-[#8a9bb0] leading-relaxed">
              You know your market. You know what your customers need. You need a reliable supply chain.
            </p>
          </div>
          <div className="text-[32px] text-amber px-5">→</div>
          <div className="flex-1 max-w-[280px] bg-amber border-2 border-amber py-8 px-6 text-center">
            <h4 className="text-base font-semibold text-white mb-2">Winning Adventure Global</h4>
            <p className="text-xs text-navy leading-relaxed">
              We verify suppliers. We translate needs. We open doors. We stay with you through the entire relationship.
            </p>
          </div>
          <div className="text-[32px] text-amber px-5">→</div>
          <div className="flex-1 max-w-[280px] bg-white/5 border-2 border-white/15 py-8 px-6 text-center">
            <h4 className="text-base font-semibold text-white mb-2">Chinese Supplier</h4>
            <p className="text-xs text-[#8a9bb0] leading-relaxed">
              They have capacity. They want Australian partners. They need someone who speaks both languages.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <section className="py-10 md:py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl text-navy mb-8">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-2">Address</p>
              <p className="text-gray-700">
                5, 54 Melbourne St<br/>
                North Adelaide SA 5006<br/>
                Australia
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-2">Phone</p>
              <p className="text-gray-700">
                <a href="tel:+61416588198" className="hover:text-amber">0416 588 198</a>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-2">ABN</p>
              <p className="text-gray-700">
                30 659 034 919
                <a
                  href="https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-amber hover:underline text-xs"
                >
                  (Verify)
                </a>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-2">Google</p>
              <a
                href="https://share.google/qQBUJkAAn1ZChq7Mc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-amber transition-colors text-sm flex items-center gap-1"
              >
                Business Profile
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* South Australia Presence */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-[11px] font-semibold text-amber tracking-[0.15em] uppercase mb-4">
            Our Location
          </div>
          <h2 className="font-serif text-[28px] md:text-[32px] font-normal mb-6 text-navy">
            Strategically Positioned in Adelaide, South Australia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Based in Adelaide&apos;s North Adelaide precinct, WAG is positioned at the heart of South Australia&apos;s business community. Our CBD proximity gives us direct access to major transportation networks, including the Port Adelaide container terminals and the Adelaide Airport freight facilities.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                South Australia is rapidly becoming a hub for advanced manufacturing and export-oriented businesses. The Adelaide CBD houses key industry clusters in defense, health, and technology sectors, while surrounding warehouse districts in Dry Creek, Wingfield, and Port Adelaide provide essential logistics infrastructure for import-export operations.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                From our North Adelaide office, we coordinate factory tour programs across China&apos;s manufacturing heartlands while maintaining close relationships with South Australian businesses ready to expand their supplier networks internationally.
              </p>
            </div>
            <div className="bg-gray-50 p-6">
              <div className="text-[11px] font-semibold text-amber tracking-[0.12em] uppercase mb-3">
                Key Locations We Serve
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-amber font-bold">Adelaide CBD</span>
                  <span className="text-sm text-gray-600">Business district and professional services hub</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber font-bold">Port Adelaide</span>
                  <span className="text-sm text-gray-600">Primary container port and freight hub</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber font-bold">Dry Creek / Wingfield</span>
                  <span className="text-sm text-gray-600">Warehouse districts and logistics centers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber font-bold">South Australia</span>
                  <span className="text-sm text-gray-600">State-wide manufacturing and export sector</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Frequently Asked Questions</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy">
              Everything You Need to Know
            </h2>
          </div>
          <FAQ faqs={aboutFaqs} />
        </div>
      </section>

      <Footer />
    </>
  )
}
