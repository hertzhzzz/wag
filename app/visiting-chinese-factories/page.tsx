import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { CheckCircle, MapPin, Users, Shield, Clock, Star } from 'lucide-react'
import { Metadata } from 'next'
import ServiceSchema from '@/components/ServiceSchema'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import { serviceFaqs } from '@/data/faqs-services'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'Visiting Chinese Factories | Guided Factory Tours for Australian Businesses',
  description: 'Plan your China factory visit with confidence. WAG provides guided factory tours with bilingual support, pre-screened suppliers, and full logistics across Shenzhen, Guangzhou, and Shanghai.',
  keywords: [
    'visiting Chinese factories',
    'China factory visit',
    'factory tour China',
    'Chinese factory inspection',
    'Australia China factory tour',
    'Shenzhen factory visit',
    'Guangzhou factory tour',
    'China supplier verification',
    'factory audit China',
    'guided factory tour China',
  ],
  openGraph: {
    title: 'Visiting Chinese Factories | Guided Factory Tours for Australian Businesses',
    description: 'Plan your China factory visit with confidence. WAG provides guided factory tours with bilingual support, pre-screened suppliers, and full logistics.',
    url: 'https://www.winningadventure.com.au/visiting-chinese-factories',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
    alternateLocale: 'en_US',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/visiting-chinese-factories',
  },
}

const visitFaqs = serviceFaqs.filter((_, i) => i < 8)

export default function VisitingChineseFactoriesPage() {
  return (
    <>
      <ServiceSchema />
      <FAQSchema faqs={visitFaqs} />
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Visiting Chinese Factories', url: 'https://www.winningadventure.com.au/visiting-chinese-factories' },
      ]} />

      {/* Hero */}
      <section className="bg-navy py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">›</span>
            <span>Visiting Chinese Factories</span>
          </div>
          <div className="max-w-[700px]">
            <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
              Guided Factory Tours
            </p>
            <h1 className="font-serif font-bold text-[clamp(2rem,4vw,3rem)] text-white mb-6 leading-tight">
              Visiting Chinese Factories — Done Right
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Visiting factories in China without the right support is risky. Language barriers, unverified suppliers, and unfamiliar logistics can cost you time and money. WAG provides end-to-end guided factory visit services so Australian businesses can see, assess, and decide — with full confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/enquiry"
                className="inline-block bg-amber text-navy py-3.5 px-8 text-base font-semibold text-center transition-colors hover:bg-amber/90 min-h-11"
              >
                Plan My Factory Visit →
              </Link>
              <Link
                href="/services"
                className="inline-block border border-white/40 text-white py-3.5 px-8 text-base font-semibold text-center transition-colors hover:border-white min-h-11"
              >
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-8 px-4 md:px-8 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '50+', label: 'Industries Served' },
              { value: '2–3', label: 'Pre-screened Factories Per Visit' },
              { value: '6–8', label: 'Manufacturing Hubs Covered' },
              { value: '100%', label: 'Bilingual Support On-site' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="font-serif text-[2rem] font-bold text-navy leading-none">{stat.value}</span>
                <span className="text-xs text-gray-500 leading-tight">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Visit Chinese Factories */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Why Visit In Person</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              What You Can Only Learn On the Factory Floor
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Photos, certifications, and online profiles only tell part of the story. A factory visit reveals the full picture — and can save you from costly sourcing mistakes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield size={24} className="text-amber" />,
                title: 'Verify Before You Commit',
                desc: 'See production lines, meet the team, and validate quality standards before placing any order. No more buying blind from Alibaba listings.',
              },
              {
                icon: <Users size={24} className="text-amber" />,
                title: 'Build Real Relationships',
                desc: 'Face-to-face meetings with factory owners and production managers build trust that online communication never can. Better relationships mean better pricing and priority treatment.',
              },
              {
                icon: <Star size={24} className="text-amber" />,
                title: 'Negotiate With Leverage',
                desc: 'Being physically present in the factory gives you negotiating power. You can spot inefficiencies, ask questions on the spot, and secure better terms than remote buyers.',
              },
              {
                icon: <MapPin size={24} className="text-amber" />,
                title: 'Assess Real Capacity',
                desc: 'Paper capacity claims and actual production capabilities are often very different. Walk the floor and see the machinery, headcount, and output firsthand.',
              },
              {
                icon: <Clock size={24} className="text-amber" />,
                title: 'Accelerate Timelines',
                desc: 'Decisions that take weeks over email happen in hours in person. Compress your sourcing cycle and get to production faster with a focused factory visit trip.',
              },
              {
                icon: <CheckCircle size={24} className="text-amber" />,
                title: 'Reduce Supply Chain Risk',
                desc: 'Visiting factories lets you identify red flags — subcontracting without disclosure, poor safety practices, or inflated headcounts — before they become your problem.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 border border-gray-100 shadow-[0_2px_12px_rgba(15,45,94,0.05)]">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What WAG Provides */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

            <div>
              <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Our Factory Visit Service</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-6">
                Everything Handled. You Just Show Up.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                We handle every aspect of your China factory visit — from identifying and pre-screening factories to coordinating transport, providing on-site translation, and facilitating productive meetings.
              </p>
              <ul className="flex flex-col gap-4">
                {[
                  'Pre-trip factory research and shortlisting',
                  'Background checks on all shortlisted suppliers',
                  'Itinerary planning and scheduling',
                  'Ground transport between factories',
                  'Bilingual guide for all meetings and tours',
                  'Real-time translation and cultural interpretation',
                  'Meeting facilitation and question strategy',
                  'Post-visit written summary and supplier assessment',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-navy">
                    <CheckCircle size={16} className="text-amber flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              {/* Factory Tour Card */}
              <div className="border-2 border-gray-200 p-8 flex flex-col gap-4 transition-all hover:shadow-[0_8px_32px_rgba(15,45,94,0.1)] hover:-translate-y-0.5">
                <div className="text-[0.7rem] font-semibold tracking-wider uppercase text-amber bg-amber/10 px-2.5 py-1 w-fit">
                  Business Discovery Trip
                </div>
                <div className="font-serif text-[1.25rem] font-bold text-navy">China Factory Tour</div>
                <div className="text-xl font-bold text-amber">POA</div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Visit 2-3 pre-screened factories with a bilingual guide. All logistics handled. Ideal for supplier discovery and verification.
                </p>
                <Link
                  href="/services"
                  className="inline-block bg-navy text-white py-3 px-6 text-sm font-semibold text-center transition-colors hover:bg-[#1a4080] mt-auto min-h-11"
                >
                  View Service Details →
                </Link>
              </div>

              {/* Procurement Trip Card */}
              <div className="border-2 border-gray-200 p-8 flex flex-col gap-4 transition-all hover:shadow-[0_8px_32px_rgba(15,45,94,0.1)] hover:-translate-y-0.5">
                <div className="text-[0.7rem] font-semibold tracking-wider uppercase text-navy bg-navy/10 px-2.5 py-1 w-fit">
                  End-to-End Procurement
                </div>
                <div className="font-serif text-[1.25rem] font-bold text-navy">Bulk Purchase Procurement Trip</div>
                <div className="text-xl font-bold text-amber">POA</div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Full procurement support from factory visit through to purchase order. Includes negotiation, samples, quality checks, and logistics.
                </p>
                <Link
                  href="/services"
                  className="inline-block bg-navy text-white py-3 px-6 text-sm font-semibold text-center transition-colors hover:bg-[#1a4080] mt-auto min-h-11"
                >
                  View Service Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-[#f0f4f8]">
        <div className="max-w-[1200px] mx-auto">
          <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Where We Operate</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-2">
            Key Manufacturing Hubs in China
          </h2>
          <p className="text-gray-600 mb-10 max-w-[560px]">
            We coordinate factory visits across China&apos;s major manufacturing regions, covering 6-8 core hubs in Jiangsu, Zhejiang, and Guangdong provinces.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                city: 'Shenzhen',
                province: 'Guangdong',
                desc: 'Electronics, tech hardware, consumer goods, EV components, custom manufacturing.',
              },
              {
                city: 'Guangzhou',
                province: 'Guangdong',
                desc: 'Fashion, apparel, furniture, auto parts, Canton Fair proximity.',
              },
              {
                city: 'Dongguan',
                province: 'Guangdong',
                desc: 'Footwear, textiles, electronics assembly, plastics, packaging.',
              },
              {
                city: 'Yiwu / Hangzhou',
                province: 'Zhejiang',
                desc: 'Small commodities, crafts, accessories, wholesale sourcing.',
              },
              {
                city: 'Ningbo',
                province: 'Zhejiang',
                desc: 'Machinery, moulds, hardware, plastics, major port access.',
              },
              {
                city: 'Shanghai / Suzhou',
                province: 'Jiangsu',
                desc: 'Precision manufacturing, chemicals, high-tech industries, industrial equipment.',
              },
            ].map((loc, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-[0_2px_12px_rgba(15,45,94,0.06)]">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin size={16} className="text-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-navy text-sm">{loc.city}</p>
                    <p className="text-[0.7rem] text-amber font-semibold uppercase tracking-wide">{loc.province}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mt-3">{loc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-28 px-6 md:px-10 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
              How It Works
            </p>
            <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight">
              Your Factory Visit, Step by Step
            </h2>
            <p className="text-lg text-navy/60 mt-4 leading-relaxed">
              From your first enquiry to walking out of the factory with confidence — here is exactly what to expect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative">
            <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-px bg-gradient-to-r from-amber/50 via-amber/20 to-amber/50 z-0" />
            {[
              {
                num: '1',
                title: 'Submit Your Enquiry',
                desc: 'Tell us your industry, product type, and what you need to verify or source during your factory visit.',
              },
              {
                num: '2',
                title: 'Supplier Shortlisting',
                desc: 'Within 3-7 days we identify and background-check 2-3 factories matched to your requirements.',
              },
              {
                num: '3',
                title: 'Trip Planning',
                desc: 'We schedule factory appointments, coordinate ground transport, and brief you on what to expect.',
              },
              {
                num: '4',
                title: 'On-Site Visit',
                desc: 'Your bilingual guide accompanies you through every factory. Full translation and facilitation provided.',
              },
              {
                num: '5',
                title: 'Post-Visit Report',
                desc: 'Receive a written supplier assessment covering production capacity, quality, and our recommendations.',
              },
            ].map((step, idx) => {
              const isFirst = idx === 0
              const isLast = idx === 4
              return (
                <div
                  key={idx}
                  className="relative z-10"
                >
                  <div className={`bg-white rounded-2xl p-6 h-full border transition-shadow duration-300 ${
                    isLast
                      ? 'border-amber/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)]'
                      : 'border-navy/5 shadow-[0_4px_24px_rgba(15,45,94,0.06)]'
                  }`}>
                    <div className={`rounded-full font-semibold text-sm flex items-center justify-center mb-4 ${
                      isFirst
                        ? 'w-10 h-10 bg-navy/10 text-navy'
                        : isLast
                        ? 'w-12 h-12 bg-amber text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)]'
                        : 'w-10 h-10 bg-navy text-white'
                    }`}>
                      {step.num}
                    </div>
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

      {/* Who This Is For */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Is This Right for You?</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy">
              Who Benefits from a Guided Factory Visit
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                label: 'First-Time Importers',
                desc: 'Never sourced from China before? A guided factory visit is the safest way to start. You learn the landscape, verify suppliers, and avoid the most common mistakes.',
              },
              {
                label: 'Businesses Burned Before',
                desc: 'Had a bad experience with online sourcing? Visiting factories in person lets you validate every claim and rebuild confidence in your supply chain with eyes-open certainty.',
              },
              {
                label: 'High-Volume Buyers',
                desc: 'Placing large orders? A factory visit pays for itself by confirming production capacity, quality controls, and securing better pricing through direct negotiation.',
              },
              {
                label: 'Entrepreneurs Launching Products',
                desc: 'Turning an idea into a physical product? Meet manufacturers, compare options, get samples approved on the spot, and launch faster with the right partner locked in.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 border border-gray-100 shadow-[0_2px_12px_rgba(15,45,94,0.05)]">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle size={18} className="text-amber flex-shrink-0 mt-0.5" />
                  <h3 className="font-serif text-[1.05rem] font-bold text-navy">{item.label}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-navy">
        <div className="max-w-[760px] mx-auto text-center">
          <h2 className="font-serif text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-white mb-4">
            Ready to visit Chinese factories with confidence?
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Tell us what you are looking to source. We will shortlist factories, handle all logistics, and have a bilingual guide with you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/enquiry"
              className="inline-block bg-amber text-navy py-3.5 px-8 text-base font-semibold transition-colors hover:bg-amber/90 min-h-11"
            >
              Plan My Factory Visit →
            </Link>
            <Link
              href="/services"
              className="inline-block border border-white/40 text-white py-3.5 px-8 text-base font-semibold transition-colors hover:border-white min-h-11"
            >
              Explore All Services
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Frequently Asked Questions</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy">
              Questions About Visiting Chinese Factories
            </h2>
          </div>
          <FAQ faqs={visitFaqs} />
          <p className="text-center text-sm text-gray-500 mt-8">
            Have a more specific question?{' '}
            <Link href="/enquiry" className="text-navy font-semibold underline hover:text-amber">
              Send us an enquiry →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
