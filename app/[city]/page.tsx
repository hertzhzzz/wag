import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { CheckCircle, MapPin, Users, Shield, Clock, Star } from 'lucide-react'
import { Metadata } from 'next'
import ServiceSchema from '@/components/ServiceSchema'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import { cityFaqs, type CityFaqItem } from '@/data/faqs-city'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import LocalBusinessSchema from '@/components/LocalBusinessSchema'

type CityKey = 'adelaide' | 'sydney' | 'melbourne' | 'perth' | 'brisbane'

const VALID_CITIES: CityKey[] = ['adelaide', 'sydney', 'melbourne', 'perth', 'brisbane']

interface CityContent {
  headline: string
  heroIntro: string
  metaDescription: string
  metaKeywords: string[]
  whyLocalBullet1: string
  whyLocalBullet2: string
  whyLocalBullet3: string
  whyLocalBullet4: string
  ctaHeadline: string
  ctaBody: string
}

const cityContent: Record<CityKey, CityContent> = {
  adelaide: {
    headline: 'Adelaide Businesses Source Smarter with China Factory Visits',
    heroIntro: 'Adelaide businesses fly direct to Shenzhen twice weekly, making focused factory visits genuinely practical without major travel disruption. WAG coordinates pre-screened supplier appointments, provides bilingual on-site support, and handles all ground logistics so you can focus on evaluating factories and making confident sourcing decisions.',
    metaDescription: 'Adelaide businesses benefit from direct Shenzhen flights for guided Chinese factory tours. WAG provides pre-screened suppliers, bilingual guides, and full logistics for Adelaide importers.',
    metaKeywords: [
      'Adelaide China factory visit',
      'Adelaide sourcing China',
      'Shenzhen factory tour Adelaide',
      'Australian importer Adelaide',
      'China supplier verification Adelaide',
      'Adelaide AV equipment sourcing',
    ],
    whyLocalBullet1: 'Direct Tuesday and Thursday flights to Shenzhen allow Adelaide businesses to complete a productive 4-5 day factory visit with minimal time away from operations.',
    whyLocalBullet2: 'Adelaide\'s AV integration and entertainment sector — including suppliers to the Adelaide Convention Centre — sources heavily from Chinese manufacturers of LED walls, pro audio, and staging equipment.',
    whyLocalBullet3: 'South Australian businesses in automotive aftermarket, food processing, and industrial manufacturing verify Chinese suppliers in person before committing to volume orders.',
    whyLocalBullet4: 'Perth-based importers can connect through Adelaide\'s Shenzhen route, and WAG frequently coordinates combined visits across both cities\' supplier networks.',
    ctaHeadline: 'Ready to visit Chinese factories from Adelaide?',
    ctaBody: 'Tell us what you are sourcing and we will shortlist pre-screened factories matched to your requirements. Direct flight access to Shenzhen makes it easier than ever to verify suppliers in person.',
  },
  sydney: {
    headline: 'Sydney Factory Visits to China — Guided Tours for NSW Importers',
    heroIntro: 'Sydney\'s events and AV integration industry sources heavily from China — LED walls, pro audio systems, rigging equipment, and staging gear all flow through Shenzhen and Guangzhou manufacturers. WAG provides Sydney businesses with pre-screened supplier visits, bilingual on-site facilitation, and coordinated logistics across multiple manufacturing hubs in a single trip.',
    metaDescription: 'Sydney businesses source from China with guided factory tours. WAG provides pre-screened suppliers, daily flights to China, bilingual guides, and full logistics for Sydney importers.',
    metaKeywords: [
      'Sydney China factory visit',
      'Sydney sourcing China',
      'NSW importer China',
      'Shenzhen factory tour Sydney',
      'Sydney AV equipment sourcing',
      'Sydney automotive parts China',
    ],
    whyLocalBullet1: 'Daily flights from Sydney to Guangzhou, Shenzhen, and Shanghai give Sydney businesses maximum flexibility — depart any day, visit multiple factories across different cities, return within the week.',
    whyLocalBullet2: 'Sydney is Australia\'s largest market for AV integration and events companies sourcing professional equipment from Chinese manufacturers, creating strong demand for on-site supplier verification.',
    whyLocalBullet3: 'The Sydney automotive aftermarket and medical device sectors rely on Chinese factories for components and finished products, requiring regular quality audits and relationship management.',
    whyLocalBullet4: 'Sydney importers benefit from our established network across all major manufacturing hubs — Shenzhen for electronics, Dongguan for mouldings, Suzhou for precision manufacturing.',
    ctaHeadline: 'Ready to visit Chinese factories from Sydney?',
    ctaBody: 'Sydney\'s daily China flights make it the most accessible Australian city for factory visits. Tell us your sourcing requirements and we will arrange pre-screened factory appointments with bilingual support throughout.',
  },
  melbourne: {
    headline: 'Melbourne Businesses Source Smarter with China Factory Visits',
    heroIntro: 'Melbourne is Australia\'s second-largest city and a major manufacturing hub, with daily flights to Guangzhou, Shenzhen, and Shanghai making factory visits highly practical. Victorian businesses in food processing, packaging, events, and industrial manufacturing source significant volumes from Chinese manufacturers, and WAG helps Melbourne importers verify suppliers, negotiate terms, and manage quality — all backed by bilingual on-site support.',
    metaDescription: 'Melbourne businesses visit Chinese factories with guided tours. WAG provides pre-screened suppliers, bilingual guides, and full logistics for Victorian importers sourcing from China.',
    metaKeywords: [
      'Melbourne China factory visit',
      'Melbourne sourcing China',
      'Victoria importer China',
      'Shenzhen factory tour Melbourne',
      'Melbourne food processing equipment China',
      'Melbourne events industry sourcing',
    ],
    whyLocalBullet1: 'Daily flights from Melbourne to Guangzhou, Shenzhen, and Shanghai give Victorian businesses maximum scheduling flexibility for factory visits — depart any evening, arrive the next morning, cover multiple factories, and return within the week.',
    whyLocalBullet2: 'Melbourne\'s food processing and packaging equipment sector sources heavily from Chinese manufacturers, requiring regular verification of production capacity and quality management systems before volume orders.',
    whyLocalBullet3: 'The Melbourne Convention and Exhibition Centre supplier ecosystem relies on Chinese AV equipment, staging, and audio manufacturers — all of which benefit from on-site inspection before purchase.',
    whyLocalBullet4: 'Melbourne\'s strong fashion and textiles industry sources fabrics, trims, and accessories from Chinese factories, with many buyers attending the Canton Fair in Guangzhou as part of their sourcing trips.',
    ctaHeadline: 'Ready to visit Chinese factories from Melbourne?',
    ctaBody: 'Melbourne\'s daily China flights make it one of the most accessible Australian cities for factory visits. Tell us your product requirements and we will arrange pre-screened factory appointments with bilingual support throughout.',
  },
  perth: {
    headline: 'Perth Factory Visits to China — Guided Tours for WA Importers',
    heroIntro: 'Perth\'s position as Australia\'s western gateway to Asia means faster logistics and tighter time zones — only 2 hours behind Beijing. WA businesses in mining equipment, agriculture, and regional manufacturing source from Chinese factories and benefit from on-site verification that online communication simply cannot provide. WAG provides pre-screened supplier visits, bilingual guides, and coordinated logistics for Perth businesses making the most of their China trips.',
    metaDescription: 'Perth businesses visit Chinese factories with guided tours. WAG provides pre-screened suppliers, bilingual guides, and logistics for WA importers with western gateway logistics advantages.',
    metaKeywords: [
      'Perth China factory visit',
      'Perth sourcing China',
      'Western Australia importer China',
      'WA mining equipment China',
      'Perth agricultural machinery sourcing',
      'Australia western gateway China',
    ],
    whyLocalBullet1: 'Perth operates on Beijing time plus 2 hours, meaning real-time communication with Chinese suppliers during business hours is far easier than from the eastern seaboard — reducing email delays and accelerating decision-making.',
    whyLocalBullet2: 'Western Australia\'s mining sector sources pumps, compressors, conveyor components, and heavy equipment from Chinese manufacturers, requiring on-site capacity verification before committing to supply contracts.',
    whyLocalBullet3: 'Perth\'s agricultural and regional machinery sector sources tractors, harvesters, and irrigation equipment from Chinese factories, with shorter sea freight transit times to Fremantle compared to eastern Australian ports.',
    whyLocalBullet4: 'Despite fewer direct flights, Perth businesses can leverage the western gateway position for faster turnaround on both factory visit trips and ongoing supply chain communications with Chinese partners.',
    ctaHeadline: 'Ready to visit Chinese factories from Perth?',
    ctaBody: 'Perth\'s time zone advantage and port proximity make it a strategically important hub for China sourcing. Tell us what you need to source and we will arrange a focused factory visit with pre-screened suppliers and bilingual support.',
  },
  brisbane: {
    headline: 'Brisbane Factory Visits to China — Guided Tours for Queensland Importers',
    heroIntro: 'Brisbane is Queensland\'s capital and Australia\'s fourth-largest city, with direct flights to Singapore, Shanghai, and Guangzhou providing strong connectivity to Chinese manufacturing hubs. Queensland businesses in mining equipment, agriculture, and food processing source from Chinese manufacturers, and WAG helps Brisbane importers verify suppliers, negotiate terms, and manage quality — all backed by bilingual on-site support.',
    metaDescription: 'Brisbane businesses visit Chinese factories with guided tours. WAG provides pre-screened suppliers, bilingual guides, and full logistics for Queensland importers sourcing from China.',
    metaKeywords: [
      'Brisbane China factory visit',
      'Brisbane sourcing China',
      'Queensland importer China',
      'Shenzhen factory tour Brisbane',
      'Brisbane AV equipment sourcing',
      'Brisbane automotive parts China',
    ],
    whyLocalBullet1: 'Brisbane Airport offers direct flights to Singapore, Shanghai, and Guangzhou, giving Queensland businesses direct access to major Chinese manufacturing hubs without requiring eastern seaboard connections.',
    whyLocalBullet2: 'Brisbane\'s strong manufacturing sector in Wacol, Richlands, and Carole Park industrial areas sources components and equipment from Chinese factories, requiring regular on-site verification of production capacity and quality systems.',
    whyLocalBullet3: 'Queensland\'s mining equipment, agriculture, and food processing sectors rely on Chinese manufacturers for specialized machinery and components, with many businesses requiring face-to-face meetings before committing to volume orders.',
    whyLocalBullet4: 'Brisbane\'s position as a gateway to Asia through Singapore makes it an increasingly important hub for Queensland businesses establishing long-term sourcing relationships with Chinese suppliers.',
    ctaHeadline: 'Ready to visit Chinese factories from Brisbane?',
    ctaBody: 'Brisbane\'s direct flight access to Asia makes factory visits highly practical for Queensland businesses. Tell us your sourcing requirements and we will arrange pre-screened factory appointments with bilingual support throughout.',
  },
}

export async function generateStaticParams() {
  return VALID_CITIES.map((city) => ({
    city,
  }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> }
): Promise<Metadata> {
  const { city } = await params
  const cityLower = city.toLowerCase() as CityKey

  if (!VALID_CITIES.includes(cityLower)) {
    return {}
  }

  const content = cityContent[cityLower]
  const baseUrl = 'https://www.winningadventure.com.au'
  const cityName = cityLower.charAt(0).toUpperCase() + cityLower.slice(1)

  return {
    title: content.headline,
    description: content.metaDescription,
    keywords: content.metaKeywords,
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: content.headline,
      description: content.metaDescription,
      url: `${baseUrl}/${cityLower}`,
      siteName: 'Winning Adventure Global',
      locale: 'en_AU',
      alternateLocale: 'en_US',
    },
    alternates: {
      canonical: `${baseUrl}/${cityLower}`,
    },
  }
}

export default async function CityPage(
  { params }: { params: Promise<{ city: string }> }
) {
  const { city } = await params
  const cityLower = city.toLowerCase() as CityKey

  if (!VALID_CITIES.includes(cityLower)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>City not found</p>
      </div>
    )
  }

  const content = cityContent[cityLower]
  const faqs = cityFaqs[cityLower] ?? []
  const cityName = cityLower.charAt(0).toUpperCase() + cityLower.slice(1)
  const baseUrl = 'https://www.winningadventure.com.au'

  return (
    <>
      <ServiceSchema />
      <FAQSchema faqs={faqs as CityFaqItem[]} />
      <LocalBusinessSchema />
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: baseUrl },
        { name: cityName, url: `${baseUrl}/${cityLower}` },
      ]} />

      {/* Hero */}
      <section className="bg-navy py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">›</span>
            <span>{cityName}</span>
          </div>
          <div className="max-w-[700px]">
            <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
              China Sourcing for {cityName} Businesses
            </p>
            <h1 className="font-serif font-bold text-[clamp(2rem,4vw,3rem)] text-white mb-6 leading-tight">
              {content.headline}
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              {content.heroIntro}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/enquiry"
                className="inline-block bg-amber text-navy py-3.5 px-8 text-base font-semibold text-center transition-colors hover:bg-amber/90 min-h-11"
              >
                Get a Factory Visit Quote →
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

      {/* Why Local Businesses Need This */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Why {cityName} Businesses Need This</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              Why {cityName} Importers Visit Chinese Factories
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {cityName} businesses sourcing from China face real risks — unverified suppliers, quality inconsistencies, and communication barriers that email simply cannot resolve. A guided factory visit changes everything.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 border border-gray-100 shadow-[0_2px_12px_rgba(15,45,94,0.05)] flex items-start gap-4">
              <Shield size={24} className="text-amber flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">Verify Before You Commit</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{content.whyLocalBullet1}</p>
              </div>
            </div>
            <div className="bg-white p-8 border border-gray-100 shadow-[0_2px_12px_rgba(15,45,94,0.05)] flex items-start gap-4">
              <Users size={24} className="text-amber flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">Local Industry Context</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{content.whyLocalBullet2}</p>
              </div>
            </div>
            <div className="bg-white p-8 border border-gray-100 shadow-[0_2px_12px_rgba(15,45,94,0.05)] flex items-start gap-4">
              <Star size={24} className="text-amber flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">Negotiate From Strength</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{content.whyLocalBullet3}</p>
              </div>
            </div>
            <div className="bg-white p-8 border border-gray-100 shadow-[0_2px_12px_rgba(15,45,94,0.05)] flex items-start gap-4">
              <MapPin size={24} className="text-amber flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">Supplier Network Access</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{content.whyLocalBullet4}</p>
              </div>
            </div>
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
                We handle every aspect of your China factory visit — from identifying and pre-screening factories to coordinating transport, providing on-site translation, and facilitating productive meetings. {cityName} businesses get the same comprehensive support we provide to clients across Australia.
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

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-navy">
        <div className="max-w-[760px] mx-auto text-center">
          <h2 className="font-serif text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-white mb-4">
            {content.ctaHeadline}
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            {content.ctaBody}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/enquiry"
              className="inline-block bg-amber text-navy py-3.5 px-8 text-base font-semibold transition-colors hover:bg-amber/90 min-h-11"
            >
              Get a Factory Visit Quote →
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
              {cityName} Factory Visit Questions
            </h2>
          </div>
          <FAQ faqs={faqs as CityFaqItem[]} />
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
