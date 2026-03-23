import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Metadata } from 'next'
import ServiceSchema from '@/components/ServiceSchema'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import { serviceFaqs } from '@/data/faqs-services'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'China Factory Visit Services | Supplier Verification',
  description: 'Join guided factory tours in Shenzhen, Guangzhou, and Shanghai. WAG helps Australian businesses verify suppliers and negotiate with manufacturers.',
  keywords: [
    'Australia China sourcing agent',
    'Australian business China factory tour',
    'Sydney China procurement',
    'Melbourne import from China',
    'Brisbane Alibaba alternative',
    'Perth China sourcing',
    'Adelaide factory visit',
    'China factory verification',
  ],
  openGraph: {
    title: 'China Sourcing Services | Factory Tours & Supplier Verification',
    description: 'Our China sourcing services include factory tours, supplier verification, quality inspections, and procurement coordination for Australian businesses.',
    url: 'https://www.winningadventure.com.au/services',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
    alternateLocale: 'en_US',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/services',
  },
}

export default function ServicesPage() {
  return (
    <>
      <ServiceSchema />
      <FAQSchema faqs={serviceFaqs} />
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Services', url: 'https://www.winningadventure.com.au/services' }
      ]} />

      {/* Hero */}
      <section className="bg-navy py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">›</span>
            <span>Services</span>
          </div>
          <h1 className="font-serif font-bold text-[clamp(2rem,4vw,3rem)] text-white mb-4 leading-tight">
            Our Services
          </h1>
          <p className="text-lg text-gray-300 max-w-[600px]">
            From supplier discovery to factory visits and end-to-end China procurement — we handle every step of your China sourcing journey.
          </p>
        </div>
      </section>

      {/* Services Cards */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Card 1: China Factory Tour */}
          <div className="border-2 border-gray-200 p-10 flex flex-col gap-5 transition-all hover:shadow-[0_8px_32px_rgba(15,45,94,0.1)] hover:-translate-y-0.5">
            <div className="text-[0.7rem] font-semibold tracking-wider uppercase text-amber bg-amber/10 px-2.5 py-1 w-fit">
              Business Discovery Trip
            </div>
            <div className="font-serif text-[1.35rem] font-bold text-navy leading-tight">
              China Factory Tour
            </div>
            <div className="text-2xl font-bold text-amber">POA</div>
            <p className="text-[0.95rem] text-gray-600 leading-relaxed">
              We take you directly to 2-3 pre-screened Chinese factories for your supplier sourcing needs. Your bilingual guide handles all logistics — scheduling, transport, translation, and factory introductions. You visit, ask questions, and decide independently. Best for: businesses exploring new suppliers or verifying existing ones before committing.
            </p>
            <ul className="list-none flex flex-col gap-2">
              <li className="text-sm text-navy flex items-center gap-2">
                <CheckCircle size={16} className="text-amber flex-shrink-0" />
                2-3 pre-screened factories
              </li>
              <li className="text-sm text-navy flex items-center gap-2">
                <CheckCircle size={16} className="text-amber flex-shrink-0" />
                Bilingual guide included
              </li>
              <li className="text-sm text-navy flex items-center gap-2">
                <CheckCircle size={16} className="text-amber flex-shrink-0" />
                All logistics handled
              </li>
              <li className="text-sm text-navy flex items-center gap-2">
                <CheckCircle size={16} className="text-amber flex-shrink-0" />
                Factory introductions
              </li>
              <li className="text-sm text-navy flex items-center gap-2">
                <CheckCircle size={16} className="text-amber flex-shrink-0" />
                Independent decision-making
              </li>
            </ul>
            <Link
              href="/resources/china-factory-tour-guide"
              className="inline-block bg-navy text-white py-3 px-6 text-sm font-semibold text-center transition-colors hover:bg-[#1a4080] mt-auto min-h-11"
            >
              Learn More About Factory Tours →
            </Link>
          </div>

          {/* Card 2: Bulk Purchase Procurement Trip */}
          <div className="border-2 border-gray-200 p-10 flex flex-col gap-5 transition-all hover:shadow-[0_8px_32px_rgba(15,45,94,0.1)] hover:-translate-y-0.5">
            <div className="text-[0.7rem] font-semibold tracking-wider uppercase text-navy bg-navy/10 px-2.5 py-1 w-fit">
              End-to-End Procurement Support
            </div>
            <div className="font-serif text-[1.35rem] font-bold text-navy leading-tight">
              Bulk Purchase Procurement Trip
            </div>
            <div className="text-2xl font-bold text-amber">POA</div>
            <p className="text-[0.95rem] text-gray-600 leading-relaxed">
              Already know what you want to source? We accompany you through the full procurement process — supplier negotiation, sample coordination, quality checks, and logistics setup. You get a dedicated bilingual partner from first factory visit through to purchase order. Best for: businesses ready to commit and place bulk orders.
            </p>
            <ul className="list-none flex flex-col gap-2">
              <li className="text-sm text-navy flex items-center gap-2">
                <CheckCircle size={16} className="text-amber flex-shrink-0" />
                Supplier negotiation
              </li>
              <li className="text-sm text-navy flex items-center gap-2">
                <CheckCircle size={16} className="text-amber flex-shrink-0" />
                Sample coordination
              </li>
              <li className="text-sm text-navy flex items-center gap-2">
                <CheckCircle size={16} className="text-amber flex-shrink-0" />
                Quality checks
              </li>
              <li className="text-sm text-navy flex items-center gap-2">
                <CheckCircle size={16} className="text-amber flex-shrink-0" />
                Logistics setup
              </li>
              <li className="text-sm text-navy flex items-center gap-2">
                <CheckCircle size={16} className="text-amber flex-shrink-0" />
                Dedicated bilingual partner
              </li>
            </ul>
            <Link
              href="/resources/bulk-procurement-china-guide"
              className="inline-block bg-navy text-white py-3 px-6 text-sm font-semibold text-center transition-colors hover:bg-[#1a4080] mt-auto min-h-11"
            >
              Learn More About Procurement Trips →
            </Link>
          </div>

        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-28 px-6 md:px-10 bg-[#f8f9fb]">
        <div className="max-w-[1400px] mx-auto">
          {/* Section header */}
          <div className="max-w-2xl mb-16">
            <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
              Our Process
            </p>
            <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight">
              Your China Trip, End to End
            </h2>
            <p className="text-lg text-navy/60 mt-4 leading-relaxed">
              From pre-trip research to post-trip contracts — we handle every step of your sourcing journey with expertise and care.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 mb-16 relative">
            {/* Connecting line - desktop only */}
            <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-px bg-gradient-to-r from-amber/50 via-amber/20 to-amber/50 z-0" />

            {[
              {
                num: '1',
                title: 'Submit Your Inquiry',
                desc: 'Fill out our enquiry form with your industry, product type, and sourcing requirements.',
              },
              {
                num: '2',
                title: 'We Review & Match',
                desc: 'Within 3-7 days, we review your requirements and shortlist 2-3 pre-screened factories.',
              },
              {
                num: '3',
                title: 'Initial Consultation',
                desc: 'We schedule a meeting to discuss your trip details, timeline, and specific factory requirements.',
              },
              {
                num: '4',
                title: 'Confirm Your Trip',
                desc: 'We arrange flights, accommodation, transport, and your full itinerary in China.',
              },
              {
                num: '5',
                title: 'Factory Visit Experience',
                desc: 'Your bilingual guide accompanies you throughout. Visit factories and make informed decisions.',
              },
            ].map((step, idx) => {
              const isFirst = idx === 0
              const isLast = idx === 4
              return (
                <div
                  key={idx}
                  className={`relative z-10 transition-all duration-700 ${
                    isLast ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
                  }`}
                >
                  <div className={`bg-white rounded-2xl p-6 h-full border transition-shadow duration-300 ${
                    isLast
                      ? 'border-amber/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)]'
                      : 'border-navy/5 shadow-[0_4px_24px_rgba(15,45,94,0.06)]'
                  }`}>
                    {/* Step number badge */}
                    <div className={`rounded-full font-semibold text-sm flex items-center justify-center mb-4 ${
                      isFirst
                        ? 'w-10 h-10 bg-navy/10 text-navy'
                        : isLast
                        ? 'w-12 h-12 bg-amber text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)]'
                        : 'w-10 h-10 bg-navy text-white'
                    }`}>
                      {step.num}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-navy mb-2 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-navy/60 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>


      {/* Industries — lightweight grid */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-[#f0f4f8]">
        <div className="max-w-[1200px] mx-auto">
          <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Industries We Serve</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-2">
            50+ Industries. One Point of Contact.
          </h2>
          <p className="text-gray-600 mb-10 max-w-[560px]">
            Across 6-8 core manufacturing hubs in Jiangsu, Zhejiang & Guangdong.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { cat: 'Manufacturing', items: ['Aesthetics & Cosmetics', 'Fashion & Apparel', 'Chemical & Industrial', 'Furniture & Homewares'] },
              { cat: 'Technology', items: ['AV & Smart Systems', 'Agricultural Drones', 'Solar & LED', 'Consumer Electronics'] },
              { cat: 'Food & Health', items: ['Food & Beverage', 'Healthcare & Medical', 'Health Supplements', 'PPE & Safety'] },
              { cat: 'Construction', items: ['Tiles & Flooring', 'Steel & Aluminium', 'Glass & Windows', 'Hardware & Fasteners'] },
              { cat: 'Property', items: ['Industrial Property', 'CBD Retail & Commercial', 'Factory & Warehouse', 'Office Space'] },
              { cat: 'Agriculture', items: ['Farm Equipment', 'Greenhouse Systems', 'Irrigation', 'Cold Chain Logistics'] },
              { cat: 'Automotive', items: ['Auto Parts', 'EV Components', 'Fleet Equipment', 'Workshop Tools'] },
              { cat: 'Packaging', items: ['Custom Packaging', 'Label Printing', 'Eco Packaging', 'Display Stands'] },
            ].map((cat, i) => (
              <div key={i} className="bg-white rounded-lg p-5 shadow-[0_2px_12px_rgba(15,45,94,0.06)]">
                <p className="text-[0.7rem] font-bold tracking-[0.1em] uppercase text-navy mb-3">{cat.cat}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item, j) => (
                    <span key={j} className="text-[0.68rem] text-[#475569] bg-[#f0f4f8] px-2 py-1 rounded-sm">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">
            Don&apos;t see your industry?{' '}
            <Link href="/enquiry" className="text-navy font-semibold underline hover:text-amber">
              Tell us what you need →
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[760px] mx-auto border-2 border-navy p-12 text-center">
          <h2 className="font-serif text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-navy mb-3">
            Ready to find your Chinese supplier?
          </h2>
          <p className="text-gray-600 mb-8">
            Join Australian businesses already sourcing smarter with Winning Adventure Global.
          </p>
          <Link
            href="/enquiry"
            className="inline-block bg-navy text-white py-3.5 px-8 text-base font-semibold transition-colors hover:bg-[#1a4080] min-h-11"
          >
            Get Started →
          </Link>
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
          <FAQ faqs={serviceFaqs} />
        </div>
      </section>

      <Footer />
    </>
  )
}
