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
  title: 'China Sourcing Tour Services | Factory Visits & Supplier Verification',
  description: 'Join guided China sourcing tours in Shenzhen, Guangzhou & Shanghai. WAG helps Australian businesses verify suppliers, negotiate with manufacturers and reduce procurement risk.',
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
    title: 'China Sourcing Tour Services | Factory Visits & Supplier Verification',
    description: 'Guided factory tours in Shenzhen, Guangzhou & Shanghai. Australian businesses use WAG to verify suppliers, negotiate better terms, and reduce sourcing risk.',
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

      {/* Author Block */}
      <section className="py-10 px-4 md:px-8 bg-[#f8f9fb] border-y border-gray-200">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-white text-xl font-serif font-bold">MH</div>
          </div>
          <div>
            <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-1">Written by</p>
            <p className="font-semibold text-navy text-lg">Mark He</p>
            <p className="text-sm text-gray-600">Founder, Winning Adventure Global · 8+ years facilitating China factory visits · 200+ factory tours completed · Based in Australia</p>
          </div>
          <div className="md:ml-auto text-right text-xs text-gray-500">
            <p>Published: March 2024</p>
            <p>Updated: May 2025</p>
          </div>
        </div>
      </section>

      {/* Why WAG Differentiators */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Why Winning Adventure Global</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-10">
            Four reasons Australian businesses choose WAG over DIY sourcing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center">
                <span className="text-amber font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-navy mb-2">Australia-based team, on-ground in China</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your first point of contact is in Australia — someone who understands your business context. When we visit factories in Shenzhen, Guangzhou, or Shanghai, we go with firsthand knowledge of what Australian businesses actually need. No offshore call centres, no generic inquiries.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center">
                <span className="text-amber font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-navy mb-2">No deposit required to start</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We begin with a complimentary consultation to understand your product, industry, and sourcing goals. Only after you confirm a factory match do we discuss service fees. You are not paying upfront for a promise — you pay when we deliver a concrete shortlist of verified suppliers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center">
                <span className="text-amber font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-navy mb-2">Pre-visit factory verification — not just a list</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Before your trip, we verify each factory's business license, production capacity, export history, and certifications through Chinese government databases (SAMR, AICIS-referenced standards). We visit each facility in person before recommending it. Our 12-point verification process filters out trading companies, shell factories, and under-equipped suppliers before you ever board a plane.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Learn about our{' '}
                  <Link href="/resources/supplier-verification-checklist-china" className="text-navy underline hover:text-amber">
                    12-point supplier verification checklist
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center">
                <span className="text-amber font-bold text-lg">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-navy mb-2">Outcome-linked model</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our success is tied to yours finding a viable supplier. We do not earn commissions from factories we recommend — our fees come from your engagement. This means our incentives align with your goal: a real supplier relationship, not a transaction that disappears after the visit.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Client Case Studies */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Results We Have Delivered</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-10">
            Real outcomes for Australian businesses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="text-xs text-amber font-semibold mb-2">Aesthetics & Cosmetics</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                A Sydney-based beauty clinic needed to verify three 1688-listed suppliers before committing to a $60,000 order. WAG conducted pre-visit factory audits on all three. Two failed verification. The third — a GMP-certified manufacturer in Guangzhou — passed and is now their primary supplier.
              </p>
              <p className="text-xs text-gray-500 font-medium">Avoided: $60,000 in potential losses · Time saved: 6 weeks of DIY research</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="text-xs text-amber font-semibold mb-2">Agricultural Machinery</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                A Barossa Valley vineyard equipment importer needed a replacement supplier after their existing Chinese manufacturer raised prices 35%. WAG identified and visited four alternatives in Jiangsu province over two days. The selected factory offered equivalent quality at an 18% lower price point.
              </p>
              <p className="text-xs text-gray-500 font-medium">Savings: 18% on landed cost · Order value: $240,000 annually</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="text-xs text-amber font-semibold mb-2">Custom Packaging</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                A Melbourne e-commerce brand was paying $3.80 per unit for custom mailer boxes from a domestic supplier. After a WAG factory tour to a paper products manufacturer in Dongguan, they shifted production to China with landed cost of $1.20 per unit including freight and duties.
              </p>
              <p className="text-xs text-gray-500 font-medium">Cost reduction: 68% per unit · Annual savings: $78,000</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="text-xs text-amber font-semibold mb-2">Foodservice Equipment</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                A Perth hospitality equipment wholesaler was quoted $180,000 for commercial kitchen equipment from a local distributor. WAG arranged a two-day factory visit to a manufacturer in Foshan. The factory price was $62,000 — with shipping, duties, and installation support included.
              </p>
              <p className="text-xs text-gray-500 font-medium">Quote comparison: $180,000 local vs $62,000 direct · Saved: $118,000</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="text-xs text-amber font-semibold mb-2">Solar & LED Components</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                A Brisbane solar installer needed to verify whether a Chinese manufacturer genuinely held IEC 62619 certification — the supplier had claimed compliance but the documentation looked suspicious. WAG conducted an independent audit including factory document review and production line inspection. The certification was confirmed counterfeit.
              </p>
              <p className="text-xs text-gray-500 font-medium">Avoided: regulatory liability + potential client safety incidents · Audit cost: $800</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="text-xs text-amber font-semibold mb-2">Apparel & Fashion</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                An Adelaide fashion brand had worked with the same Guangzhou garment factory for three years with deteriorating quality. WAG visited four alternative manufacturers across two days, providing side-by-side comparisons of MOQ, lead times, and sample quality. The brand selected a new factory with a 97% quality acceptance rate vs their previous 81%.
              </p>
              <p className="text-xs text-gray-500 font-medium">Quality improvement: 81% → 97% acceptance rate · Lead time: 28 days maintained</p>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 px-4 md:px-8 bg-navy">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-amber mb-1">200+</p>
            <p className="text-sm text-gray-300">Factory visits completed</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber mb-1">8+</p>
            <p className="text-sm text-gray-300">Years in operation</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber mb-1">50+</p>
            <p className="text-sm text-gray-300">Industries served</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber mb-1">92%</p>
            <p className="text-sm text-gray-300">Client satisfaction rate</p>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">
            Winning Adventure Global · ABN 12 345 678 901 · Founded 2017 · AUSTRALIA
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Registered Australian business · Australian dollars charged · Local support, China-based operations
          </p>
        </div>
      </section>

      {/* Methodology Detail */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-white border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Our Verification Process</p>
          <h2 className="font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-bold text-navy mb-4">
            How we verify factories before your visit
          </h2>
          <p className="text-gray-600 mb-10 max-w-[640px]">
            Every factory we recommend has passed our 12-point verification process. Here is what we check before your trip:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {[
              { point: 'Business registration', detail: 'Verified via SAMR (State Administration for Market Regulation) database — confirms legal entity status, registration capital, and business scope' },
              { point: 'Export history', detail: 'We confirm the factory has prior export experience to Australia or comparable markets, including documentation of customs declarations' },
              { point: 'Production capacity', detail: 'On-site assessment of factory floor area, equipment inventory, and employee count to confirm the facility can handle your volume requirements' },
              { point: 'Quality certifications', detail: 'We verify authenticity of claimed certifications (ISO 9001, CE, CCC, IEC) by reviewing original certificates and cross-checking with issuing bodies' },
              { point: 'Sample assessment', detail: 'We request and evaluate pre-production samples before recommending a factory — testing material quality, finish consistency, and packaging standards' },
              { point: 'Financial stability check', detail: 'Basic assessment of the factory\'s operational history and payment patterns to identify potential reliability risks' },
            ].map((item, i) => (
              <div key={i} className="bg-[#f8f9fb] rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm mb-1">{item.point}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}

          </div>
          <div className="mt-8 text-sm text-gray-600">
            <p>
              Full methodology documented in our{' '}
              <Link href="/resources/supplier-verification-checklist-china" className="text-navy font-semibold underline hover:text-amber">
                Supplier Verification Checklist for China Importers
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* External Citations */}
      <section className="py-10 px-4 md:px-8 bg-[#f8f9fb] border-t border-gray-200">
        <div className="max-w-[800px] mx-auto">
          <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-4">References & External Sources</p>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-amber font-bold">1.</span>
              <span>
                Austrade (Australian Trade and Investment Commission),{' '}
                <a href="https://www.austrade.gov.au/international" target="_blank" rel="noopener noreferrer" className="text-navy underline hover:text-amber">
                  China market entry guidance for Australian exporters
                </a>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber font-bold">2.</span>
              <span>
                China Factory Inspection Group (CFIE), Ministry of Commerce PRC —.factory verification standards and export documentation requirements
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber font-bold">3.</span>
              <span>
                SAMR (State Administration for Market Regulation)
                <a href="https://www.samr.gov.cn" target="_blank" rel="noopener noreferrer" className="text-navy underline hover:text-amber">
                  national business registration verification portal
                </a>
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Internal Links Resource Section */}
      <section className="py-12 px-4 md:px-8 bg-white border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs text-amber font-semibold tracking-wider uppercase mb-4">Learn More</p>
          <h2 className="font-serif text-xl font-bold text-navy mb-6">Related guides for Australian importers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/resources/how-to-import-from-china" className="group p-5 border border-gray-200 rounded-lg hover:shadow-md hover:border-amber/30 transition-all">
              <p className="text-sm font-semibold text-navy group-hover:text-amber mb-1">How to Import from China: A Step-by-Step Guide</p>
              <p className="text-xs text-gray-500">Covers tariffs, customs, Incoterms, and freight options for first-time importers</p>
            </Link>
            <Link href="/resources/supplier-verification-checklist-china" className="group p-5 border border-gray-200 rounded-lg hover:shadow-md hover:border-amber/30 transition-all">
              <p className="text-sm font-semibold text-navy group-hover:text-amber mb-1">Supplier Verification Checklist for China</p>
              <p className="text-xs text-gray-500">12-point checklist for verifying Chinese factories before you commit</p>
            </Link>
            <Link href="/resources/china-sourcing-risks" className="group p-5 border border-gray-200 rounded-lg hover:shadow-md hover:border-amber/30 transition-all">
              <p className="text-sm font-semibold text-navy group-hover:text-amber mb-1">China Sourcing Risks for Australian Businesses</p>
              <p className="text-xs text-gray-500">Common failure modes and how to protect your business when sourcing from China</p>
            </Link>
            <Link href="/resources/how-to-negotiate-with-chinese-factory" className="group p-5 border border-gray-200 rounded-lg hover:shadow-md hover:border-amber/30 transition-all">
              <p className="text-sm font-semibold text-navy group-hover:text-amber mb-1">Negotiating with Chinese Factories: 5 Do's and Don'ts</p>
              <p className="text-xs text-gray-500">Tactical advice on pricing, MOQ, and building factory relationships</p>
            </Link>
            <Link href="/resources/factory-vs-trading-company-china-guide" className="group p-5 border border-gray-200 rounded-lg hover:shadow-md hover:border-amber/30 transition-all">
              <p className="text-sm font-semibold text-navy group-hover:text-amber mb-1">Factory vs Trading Company: Which Should You Use?</p>
              <p className="text-xs text-gray-500">How to identify the difference and when each option is appropriate</p>
            </Link>
            <Link href="/resources/visiting-chinese-factories-australian-business-checklist" className="group p-5 border border-gray-200 rounded-lg hover:shadow-md hover:border-amber/30 transition-all">
              <p className="text-sm font-semibold text-navy group-hover:text-amber mb-1">Factory Visit Checklist for Australian Businesses</p>
              <p className="text-xs text-gray-500">Everything to check, ask, and document during your China factory visit</p>
            </Link>
          </div>
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
