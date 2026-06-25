import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import FAQ from '@/components/FAQ'
import PhoneCallLink from '@/components/PhoneCallLink'

import { aboutFaqs } from '@/data/faqs-about'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ScrollReveal from '@/components/ScrollReveal'
import { Sparkles, Tractor } from 'lucide-react'

import { metadata } from './metadata'

/** Metadata in dedicated file: ./metadata.ts */

export { metadata }

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'About', url: 'https://www.winningadventure.com.au/about' }
      ]} />

      {/* Hero — statement banner: the quote IS the hero */}
      <section className="py-20 md:py-28 px-4 md:px-8 bg-surface-warm">
        <div className="max-w-[680px] mx-auto text-center">
          <div className="w-12 h-px bg-amber/40 mx-auto mb-10" aria-hidden="true" />

          <blockquote>
            <p className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] italic leading-[1.5] text-navy">
              &quot;The suppliers are ready. The opportunity is real. You just need someone who&apos;s already on the ground to open the right doors.&quot;
            </p>
          </blockquote>

          <p className="mt-8 text-sm text-navy/50">
            Andy Liu, Founder, Winning Adventure Global
          </p>

          <p className="mt-14 text-xs text-navy/35">
            Founded 2025 · Adelaide · Guangdong
          </p>
        </div>
      </section>

      {/* Australia Leadership — Mark He */}
      <section className="py-10 md:py-[60px] px-4 md:px-[72px] max-w-[860px] mx-auto md:text-left text-center scroll-mt-20" id="leadership">
        <h2 className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-tight mb-7">
          Your Australian Point of Contact for China Sourcing
        </h2>
        <p className="text-base leading-relaxed text-navy/70 mb-5">
          As Managing Director of Winning Adventure Global&apos;s Australia office, I bridge the gap between Australian businesses and Chinese manufacturing. Based in Adelaide, I work directly with clients across Australia — from initial supplier search through to final delivery.
        </p>
        <p className="text-base leading-relaxed text-navy/70 mb-5">
          My focus is simple: helping Australian businesses source with confidence. Whether you are establishing your first supply chain or optimising an existing one, I bring local accountability and direct access to our verified factory network in China.
        </p>
        <blockquote className="border border-amber/20 bg-amber/5 py-4 px-6 my-8 font-serif italic text-lg leading-relaxed text-navy">
          &quot;You do not need to navigate this alone. I am here to translate the process, verify the suppliers, and make sure your interests are protected at every step.&quot;
        </blockquote>
        <p className="text-base leading-relaxed text-navy/70 mb-5">
          If you are evaluating suppliers, worried about quality consistency, or simply want to understand your options before committing — let us have a conversation. Straight talk about your sourcing challenges.
        </p>
        <div className="flex items-center gap-4 mt-6 md:justify-start justify-center">
          <a
            href="https://www.linkedin.com/in/mark-zhe-he/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-navy text-white text-sm font-semibold py-3 px-6 tracking-wide transition-opacity hover:opacity-80 rounded-none min-h-11"
          >
            Connect on LinkedIn
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <Link
            href="/enquiry"
            className="inline-block bg-amber text-navy text-sm font-semibold py-3 px-8 tracking-wide transition-opacity hover:opacity-80 rounded-none min-h-11"
          >
            Book a Consultation
          </Link>
        </div>

        {/* TODO: Add professional headshot for Mark He when available - insert here */}
      </section>

      {/* Founder's Story + Values */}
      <section className="py-10 md:py-[60px] px-4 md:px-[72px] max-w-[860px] mx-auto scroll-mt-20" id="founder">
        <h2 className="font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-tight mb-7">
          Andy Liu Spent Years Building the Bridges Most Businesses Never Find
        </h2>
        <p className="text-base leading-relaxed text-navy/70 mb-5">
          When Andy Liu moved from China to Adelaide, the gap was immediately apparent. Australian businesses were leaving millions on the table — not because Chinese suppliers didn&apos;t want to work with them, but because no one was doing the translation work. Not just language. Trust. Process. Relationships.
        </p>
        <p className="text-base leading-relaxed text-navy/70 mb-5">
          Andy has spent years inside Chinese manufacturing hubs — Shenzhen, Foshan, Guangzhou. He knows which suppliers deliver on time, which ones cut corners on quality, and which ones are genuinely excited to build long-term partnerships with Australian B2B buyers.
        </p>
        <p className="text-base leading-relaxed text-navy/70 mb-8">
          Winning Adventure Global is the bridge Andy Liu wished had existed when he was helping his first Australian client source from China. We don&apos;t guess. We verify, match, and deliver.
        </p>

        {/* Values — integrated into founder narrative */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-navy/10">
          <div>
            <div className="text-xs font-semibold text-amber-dark-dark tracking-[0.1em] mb-2">Verified First</div>
            <p className="text-sm text-navy/70 leading-relaxed">
              Every supplier in our network passes a 12-point verification process before we recommend them to any Australian client.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-dark-dark tracking-[0.1em] mb-2">Relationships Over Transactions</div>
            <p className="text-sm text-navy/70 leading-relaxed">
              We build long-term partnerships, not one-off deals. Your supply chain should be a competitive advantage, not a recurring headache.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-dark-dark tracking-[0.1em] mb-2">Clarity at Every Step</div>
            <p className="text-sm text-navy/70 leading-relaxed">
              No jargon, no surprises. You get plain-English reports with real data, real contacts, and real timelines.
            </p>
          </div>
        </div>
      </section>

      {/* Split Section: Australian Needs + Chinese Supply, with Bridge */}
      <section className="scroll-mt-20" id="both-worlds">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
          <div className="bg-surface-warm py-12 md:py-20 px-4 md:px-[60px] border-r border-gray-200">
            <div className="text-xs font-semibold text-amber-dark-dark tracking-[0.12em] uppercase mb-4">
              Australian Perspective
            </div>
            <h2 className="font-serif text-[clamp(1.4rem,2.8vw,2rem)] font-semibold mb-7 leading-tight">
              What Australian B2B Businesses Need
            </h2>
            <p className="text-sm text-navy/70 leading-relaxed mb-5">
              You&apos;re not looking for the cheapest factory on a trading platform. You need reliable partners who understand quality standards, respond in English, and can scale with your business.
            </p>
            <p className="text-sm text-navy/70 leading-relaxed mb-5">
              You need suppliers who won&apos;t disappear after the first order. Who understand Australian compliance requirements. Who see you as a long-term partner, not a one-off transaction.
            </p>
            <ul className="list-none mt-8">
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                Verified supplier credentials
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                English-responsive communication
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                Australian compliance knowledge
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                Transparent pricing structures
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                Long-term partnership mindset
              </li>
              <li className="py-4 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                Fast turnaround on quotes
              </li>
            </ul>
          </div>

          <div className="bg-white py-12 md:py-20 px-4 md:px-[60px]">
            <div className="text-xs font-semibold text-amber-dark-dark tracking-[0.12em] uppercase mb-4">
              Chinese Resources
            </div>
            <h2 className="font-serif text-[clamp(1.4rem,2.8vw,2rem)] font-semibold mb-7 leading-tight">
              What Chinese Suppliers Offer
            </h2>
            <p className="text-sm text-navy/70 leading-relaxed mb-5">
              China is the world&apos;s largest manufacturing economy, with industrial output reaching RMB 41.7 trillion in 2025. Guangdong Province alone — home to Shenzhen, Foshan, and Guangzhou — accounts for roughly 11% of China&apos;s total economic output and one-third of its exports. The capacity is there. The capability is there. The challenge isn&apos;t finding a factory — it&apos;s finding the right one.
            </p>
            <p className="text-sm text-navy/70 leading-relaxed mb-5">
              Our network of verified suppliers across Guangdong Province are actively seeking Australian B2B partners. They&apos;re ready. You just need the introduction.
            </p>
            <ul className="list-none mt-8">
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                10+ industries covered
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                500+ verified factory partners
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                10+ Chinese provinces
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                English-speaking liaisons
              </li>
              <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                Export compliance experience
              </li>
              <li className="py-4 text-sm text-navy font-medium flex items-center gap-3">
                <span className="text-amber font-bold text-base">&#10003;</span>
                Competitive pricing at scale
              </li>
            </ul>
          </div>
        </div>

      </section>

      {/* Client Case Studies — varied layout */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-surface-warm scroll-mt-20" id="results">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-navy mb-4">
            Real outcomes for Australian businesses
          </h2>
          <p className="text-sm text-navy/60 mb-10 max-w-[600px]">
            Every engagement is different. Here are six examples from our recent work across industries and states.
          </p>

          {/* Featured case studies — 2 wider cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Featured: Fitness Equipment */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-6 md:p-8 hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center shrink-0">
                  <Sparkles size={20} className="text-amber" />
                </div>
                <div className="text-xs font-semibold text-amber-dark tracking-wide uppercase">Fitness Equipment</div>
              </div>
              <p className="text-sm text-navy/70 leading-relaxed mb-4">
                A Melbourne retailer faced a 40% tariff pass-through from their local distributor. We identified three manufacturers in Jiangsu and Zhejiang. The selected factory delivered equivalent spec at 22% below the tariff-adjusted local price — saving the client over $39,000 on their first order alone.
              </p>
              <div className="flex items-center gap-4 text-xs text-navy/50 font-medium pt-4 border-t border-gray-100">
                <span>22% cost reduction</span>
                <span className="text-navy/20">|</span>
                <span>Order value: $180,000</span>
              </div>
            </div>
            </ScrollReveal>

            {/* Featured: Industrial Components */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-6 md:p-8 hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center shrink-0">
                  <Tractor size={20} className="text-amber" />
                </div>
                <div className="text-xs font-semibold text-amber-dark tracking-wide uppercase">Industrial Components</div>
              </div>
              <p className="text-sm text-navy/70 leading-relaxed mb-4">
                A Brisbane manufacturer discovered their Ningbo supplier&apos;s quality had degraded over 18 months. We conducted a three-way comparison visit across Zhejiang province. The new supplier delivered 99.2% defect-free production, up from the previous 94.1% — a quality improvement that eliminated an entire rework station.
              </p>
              <div className="flex items-center gap-4 text-xs text-navy/50 font-medium pt-4 border-t border-gray-100">
                <span>Quality: 94.1% to 99.2%</span>
                <span className="text-navy/20">|</span>
                <span>MOQ: 500 units</span>
              </div>
            </div>
            </ScrollReveal>
          </div>

          {/* Compact case studies — 4 in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Medical Equipment */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-5 hover:shadow-card-hover transition-shadow duration-200">
              <div className="text-xs font-semibold text-amber-dark mb-2">Medical Equipment</div>
              <p className="text-sm text-navy/70 leading-relaxed mb-3">
                Adelaide clinic: two factories failed our audit. Third visit confirmed GMP compliance. Avoided a six-figure compliance risk.
              </p>
              <p className="text-xs text-navy/50 font-medium">Verification cost: $1,200</p>
            </div>
            </ScrollReveal>

            {/* Food Ingredients */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-5 hover:shadow-card-hover transition-shadow duration-200">
              <div className="text-xs font-semibold text-amber-dark mb-2">Food Ingredients</div>
              <p className="text-sm text-navy/70 leading-relaxed mb-3">
                Sydney importer: backup supplier sourced in 12 days after Shanghai port congestion disrupted their primary factory.
              </p>
              <p className="text-xs text-navy/50 font-medium">Avoided: 6-week delay</p>
            </div>
            </ScrollReveal>

            {/* Building Materials */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-5 hover:shadow-card-hover transition-shadow duration-200">
              <div className="text-xs font-semibold text-amber-dark mb-2">Building Materials</div>
              <p className="text-sm text-navy/70 leading-relaxed mb-3">
                Perth importer: after a price increase from their 5-year supplier, we found a Foshan alternative at 15% less with equal ASTM certification.
              </p>
              <p className="text-xs text-navy/50 font-medium">15% cost reduction</p>
            </div>
            </ScrollReveal>

            {/* Automotive Parts */}
            <ScrollReveal>
            <div className="rounded-lg bg-white border border-gray-200 p-5 hover:shadow-card-hover transition-shadow duration-200">
              <div className="text-xs font-semibold text-amber-dark mb-2">Automotive Parts</div>
              <p className="text-sm text-navy/70 leading-relaxed mb-3">
                NSW wholesaler: matched with a Shenzhen manufacturer with prior Australian Design Rules experience. Three-month onboarding with documentation review.
              </p>
              <p className="text-xs text-navy/50 font-medium">ADR-compliant supplier</p>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* South Australia Presence */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-white scroll-mt-20" id="location">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-[clamp(1.4rem,2.8vw,2rem)] font-semibold mb-6 text-navy">
            Australia-based, China-present — the best of both worlds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-navy/70 leading-relaxed mb-4">
                Winning Adventure Global is based in Australia, with boots on the ground in both Adelaide and across China&apos;s manufacturing heartlands. China is Australia&apos;s largest trading partner — two-way trade reached $326 billion in 2025, representing 25% of Australia&apos;s total goods and services trade. Yet for most Australian SMEs, that opportunity remains out of reach without someone to bridge the gap.
              </p>
              <p className="text-sm text-navy/70 leading-relaxed mb-4">
                Our Adelaide office serves as your local point of contact, managing client relationships and coordination. Our team in China handles factory verification, supplier matching, and on-the-ground logistics. This dual presence means you deal with someone in your timezone who understands your needs — while we manage the details on the ground.
              </p>
              <p className="text-sm text-navy/70 leading-relaxed">
                Whether you are based in Adelaide or Auckland, Darwin or Docklands, we bring the same rigor to every engagement. Your supply chain success is our priority, backed by boots-on-the-ground verification across Guangdong, Jiangsu, Zhejiang, and beyond.
              </p>
              <p className="text-xs text-navy/40 mt-4">
                Source: Australian Government Department of Foreign Affairs and Trade (DFAT), China Country Brief 2025; China National Bureau of Statistics, Statistical Communiqué 2025.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.007699036242!2d138.6085374!3d-34.906256299999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ab0c9234a2460b1%3A0x4e46dbce81f63d91!2s5%2F54%20Melbourne%20St%2C%20North%20Adelaide%20SA%205006!5e0!3m2!1sen!2sau!4v1779435144896!5m2!1sen!2sau"
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Winning Adventure Global — 5/54 Melbourne St, North Adelaide SA 5006"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ faqs={aboutFaqs} />

      {/* Contact Info */}
      <section className="py-10 md:py-16 px-4 md:px-8 bg-surface-warm scroll-mt-20" id="contact">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-[clamp(1.4rem,2.5vw,1.75rem)] font-semibold text-navy mb-8">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-semibold text-amber-dark uppercase tracking-wider mb-2">Address</p>
              <p className="text-navy/70 text-sm">
                5/54 Melbourne St<br/>
                North Adelaide SA 5006<br/>
                Australia
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-dark uppercase tracking-wider mb-2">Phone</p>
              <p className="text-navy/70 text-sm">
                <PhoneCallLink className="hover:text-amber">0416 588 198</PhoneCallLink>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-dark uppercase tracking-wider mb-2">ABN</p>
              <p className="text-navy/70 text-sm">
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
              <p className="text-xs font-semibold text-amber-dark uppercase tracking-wider mb-2">Google</p>
              <a
                href="https://share.google/Yrax86WiFoxFwFXqD"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy/70 hover:text-amber transition-colors text-sm flex items-center gap-1"
              >
                Business Profile
                <svg aria-hidden="true" className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
