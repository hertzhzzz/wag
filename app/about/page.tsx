import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import { aboutFaqs } from '@/data/faqs-about'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ScrollReveal from '@/services/ScrollReveal'
import { CheckCircle, Sparkles, Tractor, Package, UtensilsCrossed, Sun, Building2, Users, Globe, ArrowRight, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Australia China Sourcing Agency | Factory Tours & Supplier Verification',
  description: 'Australia-based China sourcing agency, Founded 2025. We arrange factory tours, verify suppliers and support Australian businesses with end-to-end procurement. Contact us today.',
  keywords: [
    'Australia-based China procurement consultant',
    'Australian owned China sourcing company',
    'South Australia import agent',
    'Sydney Melbourne Brisbane Perth China sourcing',
  ],
  authors: [{ name: 'Mark He' }],
  alternates: {
    canonical: 'https://www.winningadventure.com.au/about',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/about',
      'x-default': 'https://www.winningadventure.com.au/about',
    },
  },
  openGraph: {
    title: 'About Winning Adventure Global | Australia China Sourcing Experts',
    description: 'Australia-based China sourcing agency, Founded 2025, arranging factory tours and verifying suppliers for Australian businesses across China.',
    url: 'https://www.winningadventure.com.au/about',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
    type: 'website',
    images: [{ url: 'https://www.winningadventure.com.au/og-image.jpg', width: 1200, height: 630, alt: 'Winning Adventure Global' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Winning Adventure Global | Australia China Sourcing Experts',
    description: 'Australia-based China sourcing agency, Founded 2025, arranging factory tours and verifying suppliers for Australian businesses across China.',
    images: ['https://www.winningadventure.com.au/og-image.jpg'],
  },
}

export default function AboutPage() {
  return (
    <>
      <FAQSchema faqs={aboutFaqs} />
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
          <p className="font-serif text-[1.75rem] font-normal leading-[1.15] text-white">
            We exist because Australian businesses deserve <em className="italic text-amber">direct access</em> to Chinese manufacturing — without the guesswork.
          </p>
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
          <source src="/hero_vid_h264.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
        <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-12 pb-8 md:pb-12 max-w-[90%] mx-auto">
          <h1 className="font-serif text-[clamp(1.75rem,5vw,3.5rem)] font-normal leading-[1.15] text-white">
            We exist because Australian businesses deserve <em className="italic text-amber">direct access</em> to Chinese manufacturing — without the guesswork.
          </h1>
        </div>
      </div>

      {/* Australia Leadership - Position 2: Mark He first for trust */}
      {/* Centered layout when image hidden, 2-col grid when image available */}
      <div className="py-10 md:py-[60px] px-4 md:px-[72px] max-w-[860px] mx-auto md:text-left text-center">
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
          If you are evaluating suppliers, worried about quality consistency, or simply want to understand your options before committing — let us have a conversation. Straight talk about your sourcing challenges.
        </p>
        <div className="flex items-center gap-4 mt-6 md:justify-start justify-center">
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

        {/* TODO: Add professional headshot for Mark He when available - insert here */}
      </div>

      {/* Values Strip - Position 3: Principles before narrative */}
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

      {/* Founder Story - Position 4: Origin story after trust established */}
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

      {/* Split Section - Position 5 */}
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

      {/* Stats Bar - Position 6 */}
      <div className="bg-navy py-12 px-4 md:px-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-amber" />
            </div>
            <p className="text-3xl font-bold text-amber mb-1">500+</p>
            <p className="text-sm text-white">Verified Factory Partners</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center mb-3">
              <Globe className="w-6 h-6 text-amber" />
            </div>
            <p className="text-3xl font-bold text-amber mb-1">6</p>
            <p className="text-sm text-white">Chinese Provinces</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6 text-amber" />
            </div>
            <p className="text-3xl font-bold text-amber mb-1">7+</p>
            <p className="text-sm text-white">Industries Covered</p>
          </div>
        </div>
      </div>

      {/* Client Case Studies - Position 7 */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Results We Have Delivered</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-10">
            Real outcomes for Australian businesses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Medical Equipment */}
            <ScrollReveal delay={0}>
            <div className="h-[220px] flex flex-col rounded-xl bg-white border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mb-4">
                <CheckCircle size={20} className="text-amber" />
              </div>
              <div className="text-xs text-amber font-semibold mb-2">Medical Equipment</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                An Adelaide-based clinic needed a verified supplier for theatre-grade instruments. WAG audit found documentation gaps at two factories. Third visit confirmed GMP compliance.
              </p>
              <p className="text-xs text-gray-500 font-medium mt-auto">Avoided: compliance risk · Verification cost: $1,200</p>
            </div>
            </ScrollReveal>

            {/* Fitness Equipment */}
            <ScrollReveal delay={80}>
            <div className="h-[220px] flex flex-col rounded-xl bg-white border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mb-4">
                <Sparkles size={20} className="text-amber" />
              </div>
              <div className="text-xs text-amber font-semibold mb-2">Fitness Equipment</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                A Melbourne retailer faced a 40% tariff pass-through from their local distributor. WAG identified three manufacturers in Jiangsu/Zhejiang. Selected factory delivered equivalent spec at 22% below tariff-adjusted local price.
              </p>
              <p className="text-xs text-gray-500 font-medium mt-auto">22% cost reduction · Order value: $180,000</p>
            </div>
            </ScrollReveal>

            {/* Food Ingredients */}
            <ScrollReveal delay={160}>
            <div className="h-[220px] flex flex-col rounded-xl bg-white border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mb-4">
                <Package size={20} className="text-amber" />
              </div>
              <div className="text-xs text-amber font-semibold mb-2">Food Ingredients</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                A Sydney importer needed a backup supplier after their Shanghai factory failed due to port congestion. WAG arranged audit and sample run from an alternative Guangdong facility in 12 days.
              </p>
              <p className="text-xs text-gray-500 font-medium mt-auto">12-day backup supplier secured · Avoided: 6-week delay</p>
            </div>
            </ScrollReveal>

            {/* Industrial Components */}
            <ScrollReveal delay={240}>
            <div className="h-[220px] flex flex-col rounded-xl bg-white border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mb-4">
                <Tractor size={20} className="text-amber" />
              </div>
              <div className="text-xs text-amber font-semibold mb-2">Industrial Components</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                A Brisbane manufacturer discovered their Ningbo supplier&apos;s quality had degraded over 18 months. WAG conducted a three-way comparison visit. New supplier selected with 99.2% defect rate vs previous 94.1%.
              </p>
              <p className="text-xs text-gray-500 font-medium mt-auto">Quality: 94.1% to 99.2% defect rate · MOQ: 500 units</p>
            </div>
            </ScrollReveal>

            {/* Building Materials */}
            <ScrollReveal delay={320}>
            <div className="h-[220px] flex flex-col rounded-xl bg-white border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mb-4">
                <UtensilsCrossed size={20} className="text-amber" />
              </div>
              <div className="text-xs text-amber font-semibold mb-2">Building Materials</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                A Perth hardware importer sourced from the same Guangzhou factory for 5 years. A price increase prompted a search for alternatives. WAG visited two facilities in Foshan — second offered 15% reduction with equal ASTM certification.
              </p>
              <p className="text-xs text-gray-500 font-medium mt-auto">15% cost reduction · Maintained: ASTM compliance</p>
            </div>
            </ScrollReveal>

            {/* Automotive Parts */}
            <ScrollReveal delay={400}>
            <div className="h-[220px] flex flex-col rounded-xl bg-white border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mb-4">
                <Sun size={20} className="text-amber" />
              </div>
              <div className="text-xs text-amber font-semibold mb-2">Automotive Parts</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                A regional NSW auto parts wholesaler needed a Chinese supplier who understood Australian Design Rules. WAG matched them with a Shenzhen manufacturer with prior ADR experience. Three-month onboarding included documentation review.
              </p>
              <p className="text-xs text-gray-500 font-medium mt-auto">ADR-compliant supplier matched · Onboarding: 3 months</p>
            </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* Bridge Visual - Position 8 */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-navy">
        <div className="max-w-[1100px] mx-auto">
          <h3 className="font-serif text-[28px] text-white mb-12 text-center">
            Bridging Australian Businesses with Chinese Manufacturers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 md:gap-4 items-stretch">

            {/* Australian Business */}
            <div className="bg-white/5 border border-white/20 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-5">
                <Building2 size={28} className="text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-3">Australian Business</h4>
              <p className="text-sm text-[#8a9bb0] leading-relaxed">
                You know your market. You know what your customers need. You need a reliable supply chain.
              </p>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center">
                <ArrowRight size={20} className="text-amber" />
              </div>
            </div>

            {/* WAG Bridge */}
            <div className="bg-amber rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-5">
                <Globe size={28} className="text-white" />
              </div>
              <h4 className="text-lg font-semibold text-navy mb-3">Winning Adventure Global</h4>
              <p className="text-sm text-navy/80 leading-relaxed">
                We verify suppliers. We translate needs. We open doors. We stay with you through the entire relationship.
              </p>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center">
                <ArrowRight size={20} className="text-amber" />
              </div>
            </div>

            {/* Chinese Supplier */}
            <div className="bg-white/5 border border-white/20 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-5">
                <Users size={28} className="text-red-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-3">Chinese Supplier</h4>
              <p className="text-sm text-[#8a9bb0] leading-relaxed">
                They have capacity. They want Australian partners. They need someone who speaks both languages.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* South Australia Presence - Position 9 */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-[11px] font-semibold text-amber tracking-[0.15em] uppercase mb-4">
            Our Location
          </div>
          <h2 className="font-serif text-[28px] md:text-[32px] font-normal mb-6 text-navy">
            Australian-owned, China-based — the best of both worlds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Winning Adventure Global is Australian-owned and operated, with boots on the ground in both Adelaide and across China&apos;s manufacturing heartlands. We work with businesses Australia-wide — from Perth to Sydney, Brisbane to Melbourne — helping each client navigate the complexities of Chinese sourcing with local accountability.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Our Adelaide office serves as your local point of contact, managing client relationships and coordination. Our team in China handles factory verification, supplier matching, and on-the-ground logistics. This dual presence means you deal with someone in your timezone who understands your needs — while we manage the details on the ground.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Whether you are based in Adelaide or Auckland, Darwin or Docklands, we bring the same rigor to every engagement. Your supply chain success is our priority, backed by boots-on-the-ground verification across Guangdong, Jiangsu, Zhejiang, and beyond.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.007699036242!2d138.6085374!3d-34.906256299999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ab0c9234a2460b1%3A0x4e46dbce81f63d91!2s5%2F54%20Melbourne%20St%2C%20North%20Adelaide%20SA%205006!5e0!3m2!1sen!2sau!4v1779435144896!5m2!1sen!2sau"
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Winning Adventure Global - 5/54 Melbourne St, North Adelaide SA 5006"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Position 10: Before Contact for objection handling */}
      {/* Note: FAQ component has its own header built-in */}
      <FAQ faqs={aboutFaqs} />

      {/* Contact Info - Position 11: At end for ready-to-act timing */}
      <section className="py-10 md:py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl text-navy mb-8">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-2">Address</p>
              <p className="text-gray-700">
                5/54 Melbourne St<br/>
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
                94 697 886 150
                <a
                  href="https://abr.business.gov.au/Search/ResultsActive?SearchText=94697886150"
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

      <Footer />
    </>
  )
}