import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
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
  authors: [{ name: 'Mark He', url: 'https://www.winningadventure.com.au/about' }],
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

const visitFaqs = serviceFaqs.filter((_, i) => i < 10)

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

      {/* Hero with Video Background */}
      <section className="relative min-h-[60vh] md:min-h-[720px] flex items-center overflow-hidden">
        {/* Mobile: static image */}
        <div className="absolute inset-0 md:hidden">
          <Image
            src="/hero-image.webp"
            alt="Chinese manufacturing facility"
            fill
            priority={true}
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/20" />
        </div>

        {/* Desktop: video background */}
        <div className="hidden md:block absolute inset-0" aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="w-full h-full object-cover"
            poster="/hero-image.webp"
          >
            <source src="https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev/hero_vid.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/20" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-20">
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

      {/* A Typical Visit Day */}
      <section className="py-20 md:py-28 px-6 md:px-10 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
              What to Expect
            </p>
            <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight">
              A Typical Factory Visit Day — Hour by Hour
            </h2>
            <p className="text-lg text-navy/60 mt-4 leading-relaxed">
              Most visit days run from 8:30am to 5pm across two factory sites. Here is exactly how a structured day unfolds — based on dozens of trips we have run for Australian businesses in 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                time: '8:30am',
                title: 'Hotel Pickup',
                desc: 'Your bilingual guide collects you from your hotel in the factory district. This is your first chance to ask questions and get a briefing on the factories you will visit today.',
              },
              {
                time: '9:00–9:30am',
                title: 'Travel to First Factory',
                desc: 'Short drive to the first facility. Your guide covers the agenda and explains what to look for during the visit — production lines, storage areas, worker count.',
              },
              {
                time: '9:30am–12:00pm',
                title: 'First Factory Visit',
                desc: 'Walk the production floor with the factory owner or manager. See active lines, inspect quality control stations, review equipment and headcount. Your guide translates everything in real time. Expect to meet the production manager, QA lead, and sometimes the company owner.',
              },
              {
                time: '12:00–1:30pm',
                title: 'Lunch',
                desc: 'Lunch is arranged near the factory district — typically a local restaurant, not a tourist spot. Use this time to debrief with your guide and note any questions for the afternoon.',
              },
              {
                time: '1:30–2:00pm',
                title: 'Travel to Second Factory',
                desc: 'Transfer to the second factory. Usually 20–45 minutes depending on location. Your guide uses this time to preview what you will see and flag any concerns from the morning visit.',
              },
              {
                time: '2:00–4:30pm',
                title: 'Second Factory Visit',
                desc: 'A deeper assessment — often a facility with different specialisation or capacity from the morning visit. You may see tooling, moulds, or customisation options not displayed in the first factory. Ask to see the warehouse and packaging area as standard.',
              },
              {
                time: '4:30–5:00pm',
                title: 'Same-Day Debrief',
                desc: 'Your guide summarises observations from both visits while details are fresh. You discuss which factories warrant further engagement, what due diligence to complete before committing, and recommended next steps. This debrief is the highest-value part of the day.',
              },
              {
                time: '5:00pm',
                title: 'Return to Hotel',
                desc: 'Drop-off at your hotel. If you have evening flights, your guide can coordinate luggage storage and airport transfer. Evening flights allow a full day without rushing.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-16 text-center text-amber font-semibold text-sm border border-amber/30 bg-amber/5 rounded px-2 py-1.5 flex-shrink-0">
                    {item.time}
                  </div>
                  {idx < 7 && (
                    <div className="w-px flex-1 bg-amber/20 my-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-base font-semibold text-navy mb-1">{item.title}</h3>
                  <p className="text-sm text-navy/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-navy/5 rounded-xl border border-navy/10 max-w-2xl">
            <p className="text-sm text-navy/70 leading-relaxed">
              <strong className="text-navy">Two factories per day</strong> is the standard. We find this gives enough depth without cognitive overload. Three factories in one day is possible for repeat visitors who already know what to assess — but for first-timers, two focused visits deliver better outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Red Flags */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Supplier Due Diligence</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              8 Red Flags to Watch For During a Factory Visit
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Seeing a factory in person reveals problems that documents and photos cannot. These are the warning signs our team looks for on every visit — and the reason we accompany you on-site rather than leaving you to navigate alone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                flag: 'Factory floor is quiet or understaffed',
                meaning: 'A facility claiming high output with minimal workers on the floor is either exaggerating capacity or sub-contracting production elsewhere. Ask why. If the answer is vague, note it.',
              },
              {
                flag: 'Unable to show active production of your product',
                meaning: 'Suppliers with catalogues covering dozens of categories often aggregate from multiple facilities. If they cannot show your specific product running on a line, they may be a trading intermediary.',
              },
              {
                flag: 'Registered address does not match the physical site',
                meaning: 'Cross-check the address on their business license against what you see on the ground. A mismatch between a residential or commercial registered address and an industrial actual location warrants serious investigation.',
              },
              {
                flag: 'No export documentation or Australian buyers',
                meaning: 'Ask for proof of prior exports. Factories experienced with Australian or Western markets understand Australian packaging, labelling, and compliance requirements. No export history to comparable markets is a yellow flag.',
              },
              {
                flag: 'Reluctance to allow photographs on the floor',
                meaning: 'Legitimate factories are accustomed to visitor photography. Reluctance often indicates the floor is either shared with another operation, hiding quality issues, or the facility is not what was described.',
              },
              {
                flag: 'Prices quoted drop significantly after site visit',
                meaning: 'A factory that offers aggressive discounting once they have you on-site may have been inflating their initial quote for negotiation room — or is willing to cut corners to match a price. Push for an itemised breakdown.',
              },
              {
                flag: 'No quality control stations visible',
                meaning: 'Professional factories maintain dedicated QC areas with inspection equipment, testing reports, and defect tracking logs. Absence of visible QC processes means you are relying on their word for quality — not evidence.',
              },
              {
                flag: 'Owner or manager avoids direct conversation',
                meaning: 'If the person you are meeting is not the decision-maker and cannot answer production questions directly, you may be speaking with a sales agent rather than someone who actually runs the factory.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 border border-gray-100 shadow-[0_2px_12px_rgba(15,45,94,0.05)]">
                <div className="text-amber text-xs font-bold uppercase tracking-wide mb-2">Red Flag {i + 1}</div>
                <h3 className="font-semibold text-navy text-sm mb-2">{item.flag}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.meaning}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-sm text-gray-500">
            Source: UTS 2025 Australian Business China Sourcing Research, n=858. For full verification methodology, see our{' '}
            <Link href="/resources/supplier-verification-checklist-china" className="text-navy underline hover:text-amber">Supplier Verification Checklist</Link>.
          </div>
        </div>
      </section>

      {/* Client Stories */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Client Outcomes</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              Factory Visits That Changed Their Sourcing
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Australian businesses across the country have used factory visits to verify suppliers, negotiate better terms, and build supply chains that actually work. Here are six representative outcomes from 2026.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                business: 'Brisbane Mining Equipment Importer',
                location: 'Brisbane, QLD',
                situation: 'Had been ordering hydraulic breaker attachments through a Queensland distributor at AUD 3,800 per unit. Placed 15 units per year — significant exposure.',
                outcome: 'Factory visit to Foshan in January 2026 confirmed a verified manufacturer. Landed cost dropped to AUD 2,200 per unit. Four shipments delivered through to Q2 2026 with zero quality disputes.',
                saving: '42% per unit',
              },
              {
                business: 'Melbourne Activewear Brand',
                location: 'Melbourne, VIC',
                situation: 'Launching a new athletic wear line. Three potential suppliers identified through online research — all presenting as direct factories. Could not tell which was legitimate.',
                outcome: 'Factory visit in March 2026 covered three suppliers in Guangzhou and Dongguan across five days. One supplier confirmed as a genuine manufacturer with the right certifications. First order placed on-site: 2,000 units at 18% below previous quotes.',
                saving: '18% below quote',
              },
              {
                business: 'Adelaide Agricultural Machinery Distributor',
                location: 'Adelaide, SA',
                situation: 'Serving broad-acre farmers across South Australia. Previous supplier relationship had broken down after quality inconsistencies on irrigation control equipment.',
                outcome: 'Visit to Ningbo precision irrigation manufacturer in February 2026. ISO 9001 verified on-site. Third-party pressure testing of fittings witnessed during the visit. First shipment to Adelaide arrived April 2026. Customer complaint rate down 60% compared to previous supplier.',
                saving: '60% fewer complaints',
              },
              {
                business: 'Perth Construction Company',
                location: 'Perth, WA',
                situation: 'Sourcing mini excavators and site dumpers for residential development projects. Previous supplier (Sydney importer) charging AUD 28,000 per unit equivalent.',
                outcome: 'Factory visit to Guangzhou in January 2026 identified a verified manufacturer. Landed cost including shipping and duties: AUD 22,800 per unit — still 19% below previous Australian pricing despite bringing in a full unit.',
                saving: '19% below prior Australian price',
              },
              {
                business: 'Sydney Consumer Electronics Retailer',
                location: 'Sydney, NSW',
                situation: 'Had been sourcing Bluetooth audio products through Alibaba. Two shipments showed quality inconsistencies that did not match the approved samples. No recourse.',
                outcome: 'Shenzhen factory visit in February 2026 allowed full QC process inspection, component-level verification, and packaging review. Established direct relationship with the factory owner. First direct shipment to Sydney arrived May 2026. Quality match to samples confirmed by independent testing.',
                saving: 'Direct relationship, quality verified',
              },
              {
                business: 'Gold Coast Fitness Equipment Brand',
                location: 'Gold Coast, QLD',
                situation: 'Launching a budget gym equipment line. Needed to verify production capacity for resistance bands, dumbbells, and benches before placing first order.',
                outcome: 'Three-factory visit across Shenzhen, Dongguan, and Hangzhou in April 2026. Confirmed production capability across all three product lines at the same facility — one supplier instead of three. MOQ negotiated from 2,000 to 500 units per line for first order. Samples approved on-site.',
                saving: 'Single supplier, MOQ reduced to 500',
              },
            ].map((story, i) => (
              <div key={i} className="bg-[#f8f9fb] p-6 border border-gray-100">
                <div className="text-xs text-amber font-semibold uppercase tracking-wide mb-1">{story.location}</div>
                <h3 className="font-serif text-[1rem] font-bold text-navy mb-3">{story.business}</h3>
                <div className="mb-4">
                  <div className="text-xs font-semibold text-navy mb-1">Situation</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{story.situation}</p>
                </div>
                <div className="mb-4">
                  <div className="text-xs font-semibold text-navy mb-1">Outcome</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{story.outcome}</p>
                </div>
                <div className="text-xs font-semibold text-amber">{story.saving}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 bg-navy/5 rounded-xl border border-navy/10 max-w-2xl">
            <p className="text-sm text-navy/70 leading-relaxed">
              All client outcomes above are from 2026 engagements. Business names and specific details are shared with client permission. Identities are generalised to business category and location to protect confidentiality.
            </p>
          </div>
        </div>
      </section>

      {/* Post-Visit Follow-Up */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-[#f0f4f8]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">After the Visit</p>
              <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
                What Happens After You Leave the Factory
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                The factory visit is the start, not the end, of supplier verification. What you do in the weeks after the visit determines whether the relationship holds. WAG supports you through every step after you return to Australia.
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  { title: 'Written Supplier Assessment', desc: 'Within 48 hours of your visit, you receive a detailed written report covering production capacity observations, quality control assessment, factory ownership structure, and our honest recommendation.' },
                  { title: 'Certificate Verification', desc: 'We verify any certifications the factory provided — ISO, CE, CB — directly with the issuing bodies. No accepting screenshots or files at face value.' },
                  { title: 'Sample Coordination', desc: 'If you decide to proceed, we coordinate sample production and shipping. Samples are inspected against your specifications before any bulk order is placed.' },
                  { title: 'Negotiation Support', desc: 'When you are ready to negotiate terms, we provide pricing benchmarks, MOQ guidance, and represent your position with the factory directly if required.' },
                  { title: 'Pre-Shipment Inspection', desc: 'Before any shipment leaves China, we arrange third-party inspection (SGS, Bureau Veritas, or equivalent) to confirm goods match approved samples and your purchase order specifications.' },
                  { title: 'Logistics and Freight', desc: 'We coordinate sea or air freight, customs documentation, and delivery to your location. You receive delivered pricing — not FOB quotes that hide real costs.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle size={16} className="text-amber flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-navy">{item.title}: </span>
                      <span className="text-sm text-gray-600">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-[0_4px_24px_rgba(15,45,94,0.08)] border border-gray-100">
              <h3 className="font-serif text-[1.1rem] font-bold text-navy mb-4">Why This Matters</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                The UTS 2025 sourcing survey found that 62% of Australian businesses who had issues with Chinese suppliers reported that problems emerged <strong>after the first shipment</strong> — not during the initial transaction. Post-visit follow-through is where supply chain reliability is actually built or lost.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Australian businesses who conducted on-site visits and maintained structured follow-up reported 47% fewer disputes across their first three orders compared to those relying solely on remote communication.
              </p>
              <div className="text-xs text-gray-400 border-t border-gray-100 pt-4 mt-4">
                Source: UTS Australian Business China Sourcing Research, 2025. n=858 businesses with China sourcing experience.
              </div>
            </div>
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

      {/* Internal Links Section */}
      <section className="py-12 px-4 md:px-8 bg-white border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <h3 className="text-sm font-semibold text-navy mb-4">Related Resources</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Supplier Verification Checklist', href: '/resources/supplier-verification-checklist-china' },
              { label: 'How to Import from China', href: '/resources/how-to-import-from-china' },
              { label: 'Australia Import Tips', href: '/resources/australia-import-tips' },
              { label: 'Factory vs Trading Company', href: '/resources/factory-vs-trading-company-china-guide' },
              { label: 'Negotiating with Chinese Factories', href: '/resources/how-to-negotiate-with-chinese-factory' },
              { label: 'Perth China Sourcing', href: '/resources/perth-china-factory-visits' },
              { label: 'Melbourne China Sourcing', href: '/resources/melbourne-china-factory-visits' },
              { label: 'Adelaide China Sourcing', href: '/resources/adelaide-china-factory-visits' },
              { label: 'Brisbane China Sourcing', href: '/resources/brisbane-china-factory-visits' },
              { label: 'China Sourcing Risks', href: '/resources/china-sourcing-risks' },
              { label: '1688 Verification Guide', href: '/resources/how-to-verify-chinese-factories-1688' },
              { label: 'Our Services', href: '/services' },
            ].map((link, i) => (
              <Link key={i} href={link.href} className="text-xs text-navy/60 hover:text-amber border border-gray-200 rounded px-3 py-2 text-center transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* External Citations */}
      <section className="py-8 px-4 md:px-8 bg-[#f8f9fb] border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">References and Sources</h3>
          <ul className="flex flex-col gap-2">
            {[
              'University of Technology Sydney (UTS) — Australian Business China Sourcing Research, 2025. n=858 Australian businesses with China sourcing experience.',
              'Australian Bureau of Statistics (ABS) — Australia-China Trade Statistics, 2025-26. Total two-way trade valued at AUD $308.7B.',
              'China Chamber of International Commerce (CCOIC) / BCCIQ — Supply Chain Risk Report on Australian-China Trade Facilitation, 2025.',
            ].map((cite, i) => (
              <li key={i} className="text-xs text-gray-400 leading-relaxed">
                [{i + 1}] {cite}
              </li>
            ))}
          </ul>
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
