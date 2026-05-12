import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { XCircle, Minus } from 'lucide-react'
import { Metadata } from 'next'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'China Sourcing Options Compared | Winning Adventure Global',
  description:
    'Compare direct factory sourcing, Alibaba, and using a procurement agent. Australian businesses benefit from understanding the real trade-offs before importing from China.',
  keywords: [
    'china sourcing comparison',
    'alibaba vs sourcing agent',
    'direct factory sourcing vs agent',
    'import from china comparison',
    'australian business china sourcing options',
  ],
  openGraph: {
    title: 'China Sourcing Options Compared | Winning Adventure Global',
    description:
      'Compare direct factory sourcing, Alibaba, and using a procurement agent for Australian businesses importing from China.',
    url: 'https://www.winningadventure.com.au/resources/china-sourcing-comparison',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/resources/china-sourcing-comparison',
  },
}

type CellValue = 'high' | 'medium' | 'low' | 'good' | 'average' | 'poor' | 'native' | 'moderate' | 'difficult' | 'strong' | 'included' | 'yes' | 'no' | 'check'

const comparisonData = [
  {
    category: 'Cost',
    rows: [
      { dimension: 'Initial setup cost', direct: 'High', alibaba: 'Low', agent: 'Moderate' },
      { dimension: 'Travel costs', direct: 'High — all trips at your expense', alibaba: 'Low to moderate', agent: 'Included in service fee' },
      { dimension: 'Ongoing management', direct: 'High — full-time attention needed', alibaba: 'Moderate', agent: 'Handled on your behalf' },
      { dimension: 'Unit cost savings', direct: 'Highest potential', alibaba: 'Moderate', agent: 'Good — negotiation leverage on your behalf' },
    ],
  },
  {
    category: 'Quality Control',
    rows: [
      { dimension: 'Pre-shipment inspection', direct: 'Difficult to arrange independently', alibaba: 'Optional third-party', agent: 'Included — on-site inspections' },
      { dimension: 'Production monitoring', direct: 'Not practical from Australia', alibaba: 'Not standard', agent: 'Available on request' },
      { dimension: 'Quality consistency', direct: 'Depends entirely on you', alibaba: 'Average — you manage it', agent: 'Strong — contractual quality milestones' },
      { dimension: 'Sample evaluation', direct: 'Possible but slow', alibaba: 'Available', agent: 'Included — we request and assess samples' },
    ],
  },
  {
    category: 'Language & Communication',
    rows: [
      { dimension: 'Negotiation in Chinese', direct: 'Difficult without Mandarin', alibaba: 'Moderate — written English often available', agent: 'Native Chinese speakers on your behalf' },
      { dimension: 'Factory communication', direct: 'Challenging across time zones', alibaba: 'Moderate', agent: 'Fully managed — you receive English updates' },
      { dimension: 'Contract clarity', direct: 'Legal risk if contracts in Chinese', alibaba: 'Usually English contracts available', agent: 'We review and explain all contracts in English' },
      { dimension: 'Documentation', direct: 'You manage all customs paperwork', alibaba: 'Partial — some facilitation', agent: 'Full coordination of customs documentation' },
    ],
  },
  {
    category: 'Risk & Verification',
    rows: [
      { dimension: 'Factory verification', direct: 'High risk — no independent check', alibaba: 'Moderate — reviews are public', agent: '12-point verification before recommendation' },
      { dimension: 'Fraud / misrepresentation', direct: 'High — no verification', alibaba: 'Moderate — known fraud cases on platform', agent: 'Low — we filter out bad actors before you see them' },
      { dimension: 'Business license check', direct: 'Not accessible', alibaba: 'Not independently verified', agent: 'SAMR database verification included' },
      { dimension: 'Certification authenticity', direct: 'Cannot verify independently', alibaba: 'Moderate — photos can be fake', agent: 'Cross-checked with issuing bodies included' },
    ],
  },
  {
    category: 'Delivery & Logistics',
    rows: [
      { dimension: 'Shipping coordination', direct: 'You arrange independently', alibaba: 'Partial — some factories offer DDP', agent: 'Full freight coordination included' },
      { dimension: 'Customs clearance', direct: 'You or your customs broker', alibaba: 'Usually factory-managed to port', agent: 'Documentation coordination included' },
      { dimension: 'Delivery timeline guarantee', direct: 'Average — you chase', alibaba: 'Average — depends on factory', agent: 'Strong — contractual milestones tracked' },
      { dimension: 'Dispute resolution', direct: 'Difficult from Australia', alibaba: 'Platform mediation available', agent: 'We handle disputes directly with factory' },
    ],
  },
]

function Cell({ value }: { value: string }) {
  const high = value.startsWith('High') || value === 'Difficult' || value === 'High risk'
  const low = value.startsWith('Low') || value === 'Not practical' || value === 'Not accessible' || value === 'Cannot verify'
  const good = value === 'Strong' || value === 'Included in service fee' || value === 'Full coordination' || value === 'Full freight coordination' || value === 'Full'
  const native = value === 'Native Chinese speakers on your behalf'

  if (native) {
    return <span className="text-[#0F2D5E] font-semibold">{value}</span>
  }
  if (good) {
    return <span className="text-[#0F2D5E] font-semibold">{value}</span>
  }
  if (high) {
    return <span className="text-red-600">{value}</span>
  }
  if (low) {
    return <span className="text-green-600">{value}</span>
  }
  return <span className="text-gray-700">{value}</span>
}

export default function ChinaSourcingComparisonPage() {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Resources', url: 'https://www.winningadventure.com.au/resources' },
        { name: 'China Sourcing Comparison', url: 'https://www.winningadventure.com.au/resources/china-sourcing-comparison' },
      ]} />
      <Navbar />

      {/* Hero */}
      <div className="bg-[#0F2D5E] py-16 px-4 md:px-12 border-b-4 border-[#F59E0B]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-xs font-bold tracking-[2px] uppercase text-[#F59E0B] mb-3">Resource</p>
          <h1 className="font-serif font-bold text-white text-[clamp(1.8rem,4vw,3rem)] leading-tight max-w-[700px] mb-4">
            China Sourcing Options Compared for Australian Businesses
          </h1>
          <p className="text-base text-gray-300 max-w-[560px] leading-relaxed">
            Direct factory sourcing, Alibaba, and using a procurement agent — here is the honest comparison across the dimensions that matter most when importing from China.
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-12">
        <div className="max-w-[700px] mb-10">
          <p className="text-gray-600 leading-relaxed text-lg">
            Australian businesses sourcing from China typically weigh three main options: going directly to factories, using Alibaba or 1688, or engaging a procurement agent. Each has legitimate trade-offs. This comparison looks at the real-world differences across cost, quality control, language barriers, risk, and logistics.
          </p>
        </div>

        {/* Comparison Tables */}
        {comparisonData.map((section) => (
          <div key={section.category} className="mb-12">
            <h2 className="font-serif text-[clamp(1.2rem,2vw,1.6rem)] font-bold text-[#0F2D5E] mb-4 pb-2 border-b border-gray-200">
              {section.category}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-[#0F2D5E]">Dimension</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500">Direct Factory (DIY)</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500">Alibaba / 1688</th>
                    <th className="text-center py-3 px-4 font-semibold text-[#0F2D5E] bg-[#F59E0B]/10">WAG Procurement Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-4 px-4 font-medium text-[#0F2D5E]">{row.dimension}</td>
                      <td className="text-center py-4 px-4"><Cell value={row.direct} /></td>
                      <td className="text-center py-4 px-4"><Cell value={row.alibaba} /></td>
                      <td className="text-center py-4 px-4 bg-[#F59E0B]/10"><Cell value={row.agent} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Prose Sections */}
        <div className="max-w-[700px] mx-auto mt-4 space-y-10">

          {/* Section 1 */}
          <div className="mb-12">
            <h3 className="font-serif text-xl font-bold text-[#0F2D5E] mb-3">
              Why Australian Businesses Fail at DIY China Sourcing
            </h3>
            <p className="text-gray-700 leading-relaxed">
              The most common failure mode is not product quality — it is contract interpretation. Chinese factories routinely make verbal commitments that do not appear in written agreements, and without fluent Mandarin speakers on your team, there is no way to catch the gap before production starts. A second major risk is factory verification: Australian businesses cannot independently check whether a supplier holds a valid business license, operates from the claimed address, or has a history of disputes. Fraud rates on unwatched direct-import channels remain significant. A third issue is quality timeline: problems are typically discovered only when the shipment arrives in Australia, at which point退货 and re-production cost far more than a proper pre-shipment inspection would have.
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h3 className="font-serif text-xl font-bold text-[#0F2D5E] mb-3">
              When Alibaba Is Enough — and When It Is Not
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Alibaba and 1688 are practical for businesses with low-to-moderate order volumes, straightforward products, and internal China experience to manage negotiations and quality checks independently. If your product is technically complex, requires certification (CE, FCC, SAA), or involves orders above $50,000, platform sourcing alone carries too much unsupervised risk. Factory ratings and reviews on platforms are public and manipulable — a Chinese-language search on 工厂骗子 will surface dozens of documented fraud cases that do not appear in any supplier profile.
            </p>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h3 className="font-serif text-xl font-bold text-[#0F2D5E] mb-3">
              The Hidden Cost of Factory Visits Without an Agent
            </h3>
            <p className="text-gray-700 leading-relaxed">
              A solo factory visit to China typically costs $4,000–$8,000 in airfare, accommodation, interpreter hire, and on-the-ground logistics — before factoring in the time your team is offline. Three or four factory visits per year quickly surpasses $20,000 with limited accountability on what was actually verified. Without a Mandarin-speaking agent present, you rely on factory-provided translators, which means the factory controls what you learn. WAG service fees cover pre-trip verification, on-site inspection, and post-visit written reporting — effectively turning factory visits into a managed, auditable process rather than an expensive fact-finding trip with limited oversight.
            </p>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h3 className="font-serif text-xl font-bold text-[#0F2D5E] mb-3">
              How to Choose the Right Sourcing Model
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Start with three questions: What is the order value? How technically complex is the product? What quality standard must it meet? Orders above $30,000 on technically demanding products with compliance requirements point strongly toward a procurement agent. Low-value, straightforward product orders with no certification requirements can work on Alibaba if you have the internal bandwidth to manage quality independently. If you answered yes to any of the following — certified quality required, supplier fraud concerns, or Mandarin limitations — the honest answer is that a sourcing agent will likely save more than it costs. Start a conversation with Winning Adventure Global and we will tell you exactly where your situation falls.
            </p>
          </div>

        </div>

        {/* Summary */}
        <div className="bg-[#f8f9fb] rounded-xl p-8 mt-8">
          <h2 className="font-serif text-xl font-bold text-[#0F2D5E] mb-4">Which option is right for my business?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-[#0F2D5E] mb-2">Direct Factory</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Best for businesses with in-house China expertise, Mandarin-speaking staff, and the capacity to manage ongoing relationships independently. Highest risk, highest potential reward.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#0F2D5E] mb-2">Alibaba / 1688</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Best for businesses with low-to-moderate order volumes, willingness to manage their own quality control, and the ability to absorb some fraud risk. Cost-effective for straightforward, well-documented products.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#0F2D5E] mb-2">Procurement Agent (WAG)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Best for Australian SMEs who want factory access without the language, travel, and verification burden. Recommended when quality matters, orders are significant, or the product is technically complex.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#F59E0B] py-12 px-4 text-center">
        <div className="max-w-[760px] mx-auto">
          <h2 className="font-serif text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-[#0F2D5E] mb-4">
            Not sure which option is right for you?
          </h2>
          <p className="text-[#0F2D5E]/70 mb-6 leading-relaxed">
            Book a free consultation and we will walk you through the honest answer — including whether we are the right fit.
          </p>
          <Link
            href="/enquiry"
            className="inline-block bg-[#0F2D5E] text-white py-3.5 px-8 text-base font-semibold transition-colors hover:bg-[#1a4080] min-h-11"
          >
            Book a Free Consultation
          </Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
