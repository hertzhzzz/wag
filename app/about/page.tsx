import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Metadata } from 'next'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import { aboutFaqs } from '@/data/faqs-about'

export const metadata: Metadata = {
  title: 'About Us | China Sourcing Experts Adelaide',
  description: 'Winning Adventure Global connects Australian businesses with verified Chinese manufacturers. Based in Adelaide, we provide factory tours, supplier verification, and procurement support.',
  keywords: ['china sourcing adelaide', 'south australia sourcing', 'adelaide sourcing company', 'australian business china', 'factory tour china', 'about china sourcing'],
  openGraph: {
    title: 'About Us | China Sourcing Experts Adelaide',
    description: 'Winning Adventure Global connects Australian businesses with verified Chinese manufacturers. Based in Adelaide, we provide factory tours, supplier verification, and procurement support.',
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
      <Navbar />

      {/* Hero */}
      <div className="py-8 md:py-10 px-4 md:px-12 max-w-[90%] mx-auto mt-8">
        <h1 className="font-serif text-[clamp(1.75rem,5vw,3.5rem)] font-normal leading-[1.15] mb-0 text-navy">
          We exist because Australian businesses deserve <em className="italic text-amber">direct access</em> to Chinese manufacturing — without the guesswork.
        </h1>
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
          Andy has spent years inside Chinese manufacturing hubs — Shenzhen, Foshan, Guangzhou, Zhengzhou, Shaanxi. He knows which suppliers deliver on time, which ones cut corners on quality, and which ones are genuinely excited to build long-term partnerships with Australian B2B buyers.
        </p>
        <blockquote className="border-l-4 border-amber py-4 px-6 bg-[#fffbf0] my-8 font-serif italic text-lg leading-relaxed text-navy">
          &quot;The suppliers are ready. The opportunity is real. You just need someone who&apos;s already on the ground to open the right doors.&quot;
        </blockquote>
        <p className="text-base leading-relaxed text-gray-700 mb-5">
          Winning Adventure Global is the bridge Andy Liu wished had existed when he was helping his first Australian client source from China. We don&apos;t guess. We verify, match, and deliver.
        </p>
        <Link
          href="/enquiry"
          className="inline-block mt-4 bg-amber text-navy text-sm font-semibold py-3 px-8 tracking-wide transition-opacity hover:opacity-85 min-h-11"
        >
          Start Your Supplier Search →
        </Link>
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
            Our network of 100+ verified suppliers across Guangdong, Shenzhen, Foshan, Guangzhou, Zhengzhou, and Shaanxi are actively seeking Australian B2B partners. They&apos;re ready. You just need the introduction.
          </p>
          <ul className="list-none mt-8">
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              7+ industries covered
            </li>
            <li className="py-4 border-b border-gray-200 text-sm text-navy font-medium flex items-center gap-3">
              <span className="text-amber font-bold text-base">✓</span>
              100+ verified factory partners
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
              <p className="text-gray-700">30 659 034 919</p>
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
