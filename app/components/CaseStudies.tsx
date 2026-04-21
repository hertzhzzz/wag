import { CheckCircle2 } from 'lucide-react'

const caseStudies = [
  {
    industry: 'Audio & AV Equipment',
    industryTag: 'Audio & AV',
    before: 'Paying trader margins on 5,000 speaker units, with no on-site verification before shipment.',
    wagActions: [
      'Arranged visits to 3 verified Shenzhen factories',
      'Negotiated directly, bypassing 2 middlemen',
      'Conducted on-site quality inspection before shipment',
    ],
    savings: '$180,000',
    savingsLabel: 'saved in one trip',
    verification: 'Quality verified before shipment',
    location: 'Melbourne importer',
    product: 'Audio equipment',
    units: '5,000 units',
  },
  {
    industry: 'LED Display Systems',
    industryTag: 'LED Displays',
    before: 'Quality uncertain on 12,000 LED panels — relied on Alibaba listings and trader claims.',
    wagActions: [
      'Pre-screened 8 factories across Shenzhen & Dongguan',
      'Coordinated 3-city visit within a single trip',
      'Delivered full written assessment with capacity verification',
    ],
    savings: '40%',
    savingsLabel: 'cost reduction on first order',
    verification: '12,000 units — first order',
    location: 'Sydney importer',
    product: 'LED display panels',
    units: '12,000 units',
  },
  {
    industry: 'Auto Parts & Components',
    industryTag: 'Car Parts',
    before: 'Supplier in Guangzhou used substandard gaskets — risk of engine failure in Australian conditions.',
    wagActions: [
      'Factory audit identified non-compliant gasket materials',
      'Negotiated full material replacement before shipment',
      'Established QC checklist specific to Australian standards',
    ],
    savings: '$85,000',
    savingsLabel: 'recall risk averted',
    verification: 'Parts inspected before container load',
    location: 'Adelaide importer',
    product: 'Auto parts',
    units: '8,400 units',
  },
]

export default function CaseStudies() {
  return (
    <section className="py-16 md:py-20 bg-navy/5">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-amber mb-4">
            Case Studies
          </p>
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] font-semibold text-navy leading-tight tracking-tight mb-4">
            Results That Speak for Themselves
          </h2>
          <p className="text-navy/60 text-base leading-relaxed">
            Australian businesses use WAG to cut sourcing costs and verify quality face-to-face — before committing to production.
          </p>
        </div>

        {/* Case study cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {caseStudies.map((study, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-navy/10 shadow-[0_4px_24px_rgba(15,45,94,0.06)] hover:shadow-[0_12px_40px_rgba(15,45,94,0.12)] transition-all duration-300 flex flex-col"
            >
              {/* Industry tag */}
              <div className="bg-navy px-5 py-3">
                <p className="text-xs font-semibold tracking-[0.12em] uppercase text-amber">
                  {study.industryTag}
                </p>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                {/* Before */}
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-navy/30 mb-2">Before WAG</p>
                  <p className="text-sm text-navy/70 leading-relaxed">{study.before}</p>
                </div>

                {/* WAG Actions */}
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-amber/80 mb-2">What WAG Did</p>
                  <ul className="space-y-2">
                    {study.wagActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy/70">
                        <span className="text-amber mt-0.5 flex-shrink-0">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Divider */}
                <div className="border-t border-navy/10 my-4" />

                {/* Results */}
                <div className="flex items-end justify-between gap-3 mt-auto">
                  <div>
                    <p className="text-3xl font-serif font-bold text-navy">{study.savings}</p>
                    <p className="text-xs text-navy/50">{study.savingsLabel}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber font-medium bg-amber/10 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={12} />
                    {study.verification}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-navy/10 flex items-center justify-between text-xs text-navy/40">
                  <span>{study.location}</span>
                  <span>{study.units}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <a
            href="/enquiry"
            className="inline-flex items-center gap-3 bg-amber text-navy px-8 py-4 font-bold hover:bg-[#d97706] transition-all duration-300 no-underline min-h-11 shadow-lg hover:shadow-xl hover:shadow-amber/20 hover:-translate-y-0.5"
          >
            Start Your Sourcing Journey
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <p className="text-xs text-navy/40 max-w-md">
            Case studies above are illustrative of typical project outcomes. Individual results may vary.
          </p>
        </div>
      </div>
    </section>
  )
}
