import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Shield, Factory, ClipboardCheck, Search, Users, MapPin, ArrowRight, Briefcase, Star } from 'lucide-react'
import { Metadata } from 'next'
import ServiceSchema from '@/components/ServiceSchema'
import FAQ from '@/components/FAQ'
import { sourcingAgentFaqs } from '@/data/faqs-sourcing-agent'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'China Sourcing Agent Australia: On-Ground Expert Support | Winning Adventure',
  description:
    'Adelaide-based China sourcing agent for Australian businesses. We verify factories, negotiate pricing, and accompany you to China. Book a free consultation.',
  keywords: [
    'china sourcing agent australia',
    'china sourcing agent',
    'australia china sourcing',
    'china factory sourcing agent',
    'china procurement agent australia',
  ],
  openGraph: {
    title: 'China Sourcing Agent Australia: On-Ground Expert Support | Winning Adventure',
    description:
      'Adelaide-based China sourcing agent for Australian businesses. We verify factories, negotiate pricing, and accompany you to China.',
    url: 'https://www.winningadventure.com.au/china-sourcing-agent-australia',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/china-sourcing-agent-australia',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/china-sourcing-agent-australia',
      'x-default': 'https://www.winningadventure.com.au/china-sourcing-agent-australia',
    },
  },
}

const services = [
  {
    icon: <Factory size={24} className="text-amber" />,
    title: 'Factory Verification',
    desc: 'On-site factory audits verifying registration, production capacity, certifications and operational maturity — not just a database lookup.',
  },
  {
    icon: <ClipboardCheck size={24} className="text-amber" />,
    title: 'On-Site Quality Inspection',
    desc: 'Pre-production and pre-shipment quality checks conducted in person at the factory floor. We catch defects before containers leave China.',
  },
  {
    icon: <Briefcase size={24} className="text-amber" />,
    title: 'Negotiation Support',
    desc: 'Mandarin-speaking negotiators on the factory floor advocating for your pricing, payment terms, and contract conditions with genuine leverage.',
  },
  {
    icon: <Search size={24} className="text-amber" />,
    title: 'Supplier Sourcing',
    desc: 'We identify and shortlist 2–3 pre-screened factories matched to your product, industry, and volume requirements within 3–7 business days.',
  },
  {
    icon: <Users size={24} className="text-amber" />,
    title: 'Project Accompaniment',
    desc: 'Your bilingual guide accompanies you through every factory visit — handling translation, cultural facilitation, and ground logistics so you stay focused on evaluation.',
  },
]

const cities = [
  { name: 'Adelaide', desc: 'Head office in North Adelaide — your local account manager is based here.' },
  { name: 'Sydney', desc: 'We work with importers across greater Sydney, from Western Sydney warehousing to Port Botany logistics.' },
  { name: 'Melbourne', desc: 'Melbourne-based clients include manufacturing SMEs, AV equipment importers and automotive parts distributors.' },
  { name: 'Brisbane', desc: 'Queensland clients benefit from our experience sourcing heavy equipment and agricultural machinery from China.' },
  { name: 'Perth', desc: 'Western Australian mining services and industrial equipment firms work with us for China factory verification.' },
]

const trustStats = [
  { value: '120+', label: 'Factories Visited' },
  { value: '80+', label: 'Australian Clients Served' },
  { value: '8+', label: 'Years in China Sourcing' },
  { value: '2–3', label: 'Pre-Screened Factories Per Visit' },
]

const coverageFaqs = [
  {
    question: 'What does a China sourcing agent actually do?',
    answer: 'A China sourcing agent is your boots-on-the-ground representative in China. They find and pre-screen factories, negotiate pricing and terms, coordinate quality inspections, manage communication across language barriers, and help coordinate logistics — so you focus on running your business.',
  },
  {
    question: 'Is a China sourcing agent worth the cost for a small Australian business?',
    answer: 'For orders above roughly AUD $5,000–$10,000 per production run, a sourcing agent typically pays for itself through better pricing, fewer quality failures, and reduced travel costs. Below that threshold, the agent fee may outweigh the savings. We are upfront about this during your consultation — if going direct makes more sense for your order size, we will tell you.',
  },
  {
    question: 'How are you different from platforms like NewBuyingAgent, Imex or Dragon Sourcing?',
    answer: 'Unlike large-volume platforms that move high quantities of low-value RFQs through a centralised system, WAG is a small Australia-based team. Your account manager is based in Adelaide and you deal with the same person throughout. Our factory visits are conducted by our own team — not subcontracted to third-party inspectors. We do not charge commission on order value, which means our factory recommendations are not influenced by supplier rebates.',
  },
  {
    question: 'What does a factory visit look like when WAG accompanies me?',
    answer: 'Typically 2 to 4 factories per day with your bilingual guide handling all translation and facilitation. We brief you beforehand on what to look for — machinery condition, workforce organisation, quality control processes — and produce a written post-visit assessment covering production capacity, defect rates, and our outright recommendation.',
  },
  {
    question: 'Can WAG help if I already have a supplier in China?',
    answer: 'Yes. We frequently work with Australian businesses that have existing supplier relationships but need independent verification, renegotiation support, or quality inspection. An existing supplier relationship does not eliminate the need for periodic on-site verification — and we approach every engagement with complete objectivity.',
  },
]

export default function ChinaSourcingAgentPage() {
  return (
    <>
      <ServiceSchema />
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'China Sourcing Agent Australia', url: 'https://www.winningadventure.com.au/china-sourcing-agent-australia' },
      ]} />

      {/* 1. Hero */}
      <section className="bg-navy py-20 md:py-28 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <p className="font-serif text-xs tracking-[0.1em] text-amber mb-4 italic uppercase">
            Australia-Based China Sourcing
          </p>
          <h1 className="font-serif font-bold text-[clamp(1.8rem,4vw,3rem)] text-white mb-6 leading-tight max-w-[780px]">
            Your Australia-Based China Sourcing Agent
          </h1>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-[620px]">
            Adelaide-based team physically accompanies you to Chinese factories. Verification, translation and negotiation — all included.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/enquiry"
              className="inline-block bg-amber text-navy py-3.5 px-8 text-base font-semibold transition-colors hover:bg-amber/90 min-h-11"
            >
              Book a Free Consultation <ArrowRight className="inline ml-2" size={16} />
            </Link>
            <Link
              href="#services"
              className="inline-block border border-white/40 text-white py-3.5 px-8 text-base font-semibold transition-colors hover:border-white min-h-11"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Services Grid */}
      <section id="services" className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[640px] mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">What We Do</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              Full-Service China Sourcing Support, Managed from Australia
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Unlike large-volume platforms that process RFQs through a centralised system, WAG is an Adelaide-based team with its own people on the ground in China. Every service below is delivered by our team — never subcontracted to third-party inspectors or rebate-influenced agents.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <div key={i} className="bg-[#f8f9fb] p-6 border border-gray-100">
                <div className="mb-4">{svc.icon}</div>
                <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">{svc.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Geographic Coverage */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[640px] mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Where We Work</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              We Serve Australian Businesses from Adelaide, Sydney, Melbourne, Brisbane and Perth
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Your account manager is based in North Adelaide. Our on-ground team operates across China's major manufacturing hubs — Guangdong, Zhejiang, Jiangsu and Shandong. Whether you are a Sydney-based importer, a Melbourne manufacturer, or a Perth mining services firm, your sourcing project is managed from Australia with feet on the ground in China.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city, i) => (
              <div key={i} className="flex items-start gap-3 bg-white p-5 border border-gray-100 shadow-[0_2px_12px_rgba(15,45,94,0.05)]">
                <MapPin size={18} className="text-amber mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-base font-bold text-navy">{city.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{city.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trust Numbers */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-navy">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">By the Numbers</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-white mb-4">
              Australia's China Sourcing Partner
            </h2>
            <p className="text-gray-300 leading-relaxed max-w-[540px] mx-auto">
              Real experience on the ground in China. Our team has visited factories across Guangdong, Zhejiang, Jiangsu and Shandong — and we bring that experience to every client engagement.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {trustStats.map((stat, i) => (
              <div key={i}>
                <span className="font-serif text-[2.25rem] font-bold text-amber block">{stat.value}</span>
                <span className="text-sm text-gray-300">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
              <MapPin size={14} className="text-amber" />
              WAG — North Adelaide, SA, Australia
            </p>
          </div>
        </div>
      </section>

      {/* 5. Case Study */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[640px] mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Client Story</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
              How a Melbourne AV Equipment Importer Verified Their Supply Chain
            </h2>
            <p className="text-gray-600 leading-relaxed">
              A Melbourne-based importer of professional audio-visual equipment had been sourcing from a single Chinese factory for three years. Margins were tightening, quality complaints were rising, and the factory had become increasingly unresponsive on pricing renegotiation. They reached out to WAG to verify their existing supplier and explore alternatives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#f8f9fb] p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center mb-4">
                <Search size={20} className="text-navy" />
              </div>
              <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">The Challenge</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                The existing supplier had stopped allowing factory visits, quality defect rates had doubled over 12 months, and the importer had no way to independently verify whether the factory was still manufacturing in-house or sub-contracting production to smaller workshops.
              </p>
            </div>
            <div className="bg-[#f8f9fb] p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mb-4">
                <Factory size={20} className="text-amber" />
              </div>
              <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">WAG's Approach</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Over four days our team visited the existing factory and two alternative suppliers in Guangdong. We verified business registrations, photographed production lines, interviewed floor managers, and cross-checked claimed certifications against issuing bodies.
              </p>
            </div>
            <div className="bg-[#f8f9fb] p-6 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center mb-4">
                <Star size={20} className="text-white" />
              </div>
              <h3 className="font-serif text-[1.05rem] font-bold text-navy mb-2">The Outcome</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our verification confirmed the existing factory had shifted significant production to an unregistered sub-contractor. We shortlisted an alternative supplier with 14 years of AV equipment manufacturing history and better unit pricing — the client transitioned within six weeks with zero supply interruption.
              </p>
            </div>
          </div>

          <div className="bg-[#f8f9fb] border border-gray-100 p-6 max-w-[640px]">
            <p className="text-sm text-gray-500 leading-relaxed italic">
              Client details de-identified. Results are specific to this engagement and do not guarantee identical outcomes. Every sourcing project is assessed individually based on product type, industry, and factory landscape.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-20 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">Frequently Asked Questions</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy">
              Common Questions About China Sourcing Agents
            </h2>
          </div>
          <FAQ faqs={coverageFaqs} />
          <p className="text-center text-sm text-gray-500 mt-8">
            Have a more specific question?{' '}
            <Link href="/enquiry" className="text-navy font-semibold underline hover:text-amber">
              Send us an enquiry →
            </Link>
          </p>
        </div>
      </section>

      {/* 7. Bottom CTA */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-navy">
        <div className="max-w-[760px] mx-auto text-center">
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-white mb-4">
            Ready to source from China with confidence?
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed max-w-[540px] mx-auto">
            Whether you are visiting factories for the first time or need independent verification of existing suppliers, your Adelaide-based account manager is ready to help. No volume minimums. No commission-driven recommendations. Just honest, on-the-ground support from a team that has been doing this for years.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/enquiry"
              className="inline-block bg-amber text-navy py-3.5 px-8 text-base font-semibold transition-colors hover:bg-amber/90 min-h-11"
            >
              Book a Free Consultation <ArrowRight className="inline ml-2" size={16} />
            </Link>
            <Link
              href="/services"
              className="inline-block border border-white/40 text-white py-3.5 px-8 text-base font-semibold transition-colors hover:border-white min-h-11"
            >
              View Our Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
