import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { CheckCircle, Globe, Shield, Truck, Users, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'
import ServiceSchema from '@/components/ServiceSchema'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'China Sourcing Agent for Australian Businesses | Winning Adventure Global',
  description:
    'We help Australian businesses source quality products from China with factory verification, quality control, and procurement services. Australia-based team with feet on the ground in China.',
  keywords: [
    'china sourcing agent',
    'china sourcing agent for australian business',
    'australian business china sourcing',
    'china procurement agent',
    'factory verification china',
    'quality control china',
    'supplier verification australia',
  ],
  openGraph: {
    title: 'China Sourcing Agent for Australian Businesses | Winning Adventure Global',
    description:
      'We help Australian businesses source quality products from China with factory verification, quality control, and procurement services.',
    url: 'https://www.winningadventure.com.au/resources/china-sourcing-agent',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/resources/china-sourcing-agent',
  },
}

const processSteps = [
  {
    num: '1',
    title: 'Requirements Gathering',
    desc: 'We start with a free consultation to understand your product, industry, volume requirements, and quality standards.',
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

const faqs: Array<{ question: string; answer: string }> = [
  {
    question: 'What industries do you work with?',
    answer: 'We cover 50+ industries including AV equipment, automotive parts, engineering machinery, agricultural equipment, precision manufacturing, and heavy equipment. If you are importing from China, we can help.',
  },
  {
    question: 'How do you verify factories?',
    answer: 'Our 12-point verification process covers: SAMR business registration check, export history verification, production capacity assessment, quality certification authentication, sample evaluation, and financial stability review — all before your visit.',
  },
  {
    question: 'What does the service cost?',
    answer: 'We offer a free initial consultation. Service fees are discussed after we understand your product and requirements — and only apply when you confirm a factory match. There is no upfront cost to start.',
  },
  {
    question: 'Do you handle logistics and shipping?',
    answer: 'Yes. We coordinate freight forwarding, customs clearance documentation, and shipping from the factory to your door in Australia. We work with established freight partners to ensure competitive rates.',
  },
  {
    question: 'Can you help if I have already found a supplier on Alibaba or 1688?',
    answer: 'Absolutely. Many Australian businesses come to us after a frustrating DIY experience on Alibaba or 1688. We can verify your existing shortlist, conduct independent audits, and help you make a decision — before you commit.',
  },
  {
    question: 'Do I need to travel to China?',
    answer: 'Factory visits are strongly recommended — they give you the best insight into whether a supplier is genuine and capable. However, if travel is not possible, we can conduct full on-site assessments on your behalf and provide detailed written reports.',
  },
  {
    question: 'What if a factory fails quality expectations after shipment?',
    answer: 'We provide post-delivery support including dispute resolution with your supplier, re-inspection coordination, and follow-up factory visits if needed. Our relationship with your supplier does not end at delivery.',
  },
  {
    question: 'How is this different from using a generic sourcing agent?',
    answer: 'WAG is Australia-based with a China-based operations team. We do not take factory commissions, our incentives align with your outcome, and our 12-point verification process is specifically designed for Australian import requirements. We also provide full post-trip written assessments.',
  },
]

export default function ChinaSourcingAgentPage() {
  return (
    <>
      <ServiceSchema />
      <FAQSchema faqs={faqs} />
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Resources', url: 'https://www.winningadventure.com.au/resources' },
        { name: 'China Sourcing Agent', url: 'https://www.winningadventure.com.au/resources/china-sourcing-agent' },
      ]} />

      {/* Hero */}
      <div className="bg-[#0F2D5E] py-16 px-4 md:px-12 border-b-4 border-[#F59E0B]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold tracking-[2px] uppercase text-[#F59E0B] mb-3">Our Services</p>
          <h1 className="font-serif font-bold text-white text-[clamp(1.8rem,4vw,3rem)] leading-tight max-w-[700px] mb-4">
            China Sourcing Agent for Australian Businesses
          </h1>
          <p className="text-base text-gray-300 max-w-[560px] leading-relaxed">
            We help Australian businesses source quality products from China with factory verification, quality control, and procurement services. An Adelaide-based team with feet on the ground in China.
          </p>
        </div>
      </div>

      {/* What We Do */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-16">
        <div className="max-w-[640px] mb-10">
          <p className="uppercase tracking-[0.12em] text-xs text-[#F59E0B] font-semibold mb-3">What We Do</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-[#0F2D5E] mb-4">
            Your representative on the ground in China
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Finding reliable suppliers in China is one of the biggest challenges facing Australian SMEs. A China sourcing agent bridges the gap — providing factory verification, on-site quality control, and hands-on support from shortlisting through to shipment. We act as your dedicated bilingual representative from first factory visit through to delivery.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Shield size={24} className="text-[#F59E0B]" />, title: 'Verify Suppliers', desc: 'Background checks, factory audits, and credential verification before you commit to any factory.' },
            { icon: <Users size={24} className="text-[#F59E0B]" />, title: 'Negotiate Pricing', desc: 'On-site negotiation with real leverage — you have someone who understands the factory floor.' },
            { icon: <CheckCircle size={24} className="text-[#F59E0B]" />, title: 'Manage Quality', desc: 'Pre-shipment inspections and on-site quality assessments throughout production runs.' },
            { icon: <Globe size={24} className="text-[#F59E0B]" />, title: 'Coordinate Logistics', desc: 'Freight forwarding support and customs documentation from factory to your door in Australia.' },
          ].map((item, i) => (
            <div key={i} className="bg-[#f8f9fb] p-6 border border-gray-100">
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-serif text-[1.05rem] font-bold text-[#0F2D5E] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Process */}
      <div className="bg-[#f8f9fb] py-16 px-4 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[640px] mb-10">
            <p className="uppercase tracking-[0.12em] text-xs text-[#F59E0B] font-semibold mb-3">Our Process</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-[#0F2D5E] mb-4">
              How we support your China sourcing journey
            </h2>
            <p className="text-gray-600 leading-relaxed">
              From your first enquiry to walking out of a factory with a supplier shortlist — here is exactly what to expect when you work with WAG.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {processSteps.map((step, i) => (
              <div key={i} className="bg-white p-5 border border-[#0F2D5E]/5 shadow-[0_4px_24px_rgba(15,45,94,0.06)]">
                <div className="w-9 h-9 rounded-full bg-[#0F2D5E] text-white flex items-center justify-center font-semibold text-sm mb-3">
                  {step.num}
                </div>
                <h3 className="text-sm font-bold text-[#0F2D5E] mb-2">{step.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Winning Adventure Global */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="uppercase tracking-[0.12em] text-xs text-[#F59E0B] font-semibold mb-3">Why Winning Adventure Global</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-[#0F2D5E] mb-4">
            WAG vs. Doing It Alone vs. a Generic Agent
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Not all sourcing support is equal. Here is how WAG compares to the alternatives Australian businesses typically consider.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-[#0F2D5E]">Dimension</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-400 bg-gray-50">Direct Factory (DIY)</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-400 bg-gray-50">Alibaba / 1688</th>
                <th className="text-center py-4 px-4 font-semibold text-[#0F2D5E] bg-[#F59E0B]/10">WAG (Us)</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([dimension, direct, alibaba, wag], i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium text-[#0F2D5E]">{dimension as string}</td>
                  <td className="text-center py-4 px-4 bg-gray-50">{direct as string}</td>
                  <td className="text-center py-4 px-4 bg-gray-50">{alibaba as string}</td>
                  <td className="text-center py-4 px-4 bg-[#F59E0B]/10 font-semibold text-[#0F2D5E]">{wag as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/china-sourcing-guide-australia"
            className="text-sm text-[#0F2D5E] font-semibold underline hover:text-[#F59E0B] transition-colors"
          >
            See the full guide to our sourcing process
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white py-16 px-4 md:px-12">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.12em] text-xs text-[#F59E0B] font-semibold mb-3">Frequently Asked Questions</p>
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-[#0F2D5E]">
              Common Questions About China Sourcing Agents
            </h2>
          </div>
          <FAQ faqs={faqs} />
          <p className="text-center text-sm text-gray-500 mt-8">
            Have a more specific question?{' '}
            <Link href="/enquiry" className="text-[#0F2D5E] font-semibold underline hover:text-[#F59E0B]">
              Send us an enquiry
            </Link>
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#F59E0B] py-12 px-4 text-center">
        <div className="max-w-[760px] mx-auto">
          <h2 className="font-serif text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-[#0F2D5E] mb-4">
            Ready to source from China?
          </h2>
          <p className="text-[#0F2D5E]/70 mb-6 leading-relaxed">
            Tell us what you are looking to source. We will shortlist factories, coordinate your visit, and provide full bilingual on-site support — at no cost for the initial consultation.
          </p>
          <Link
            href="/enquiry"
            className="inline-block bg-[#0F2D5E] text-white py-3.5 px-8 text-base font-semibold transition-colors hover:bg-[#1a4080] min-h-11"
          >
            Book a Free Consultation <ArrowRight className="inline ml-2" size={16} />
          </Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
