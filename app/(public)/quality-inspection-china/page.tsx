// app/(public)/quality-inspection-china/page.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { Metadata } from 'next'
import FAQ from '@/components/FAQ'
import ScrollReveal from '@/components/ScrollReveal'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import LeadForm from '@/components/LeadForm'
import {
  Search, ShieldCheck, FileCheck2, Boxes,
  AlertTriangle, Ruler, ClipboardCheck, Check,
} from 'lucide-react'

export const metadata: Metadata = {
  title: { absolute: 'Pre-Shipment Quality Inspection in China | AQL Sampling & Testing' },
  description:
    'Pre-shipment quality inspection for Australian importers sourcing from China. AQL random sampling (ISO 2859-1), functional testing, packaging verification, and quantity check. Australia-based oversight. Book a free consult.',
  keywords: [
    'quality inspection china',
    'pre-shipment inspection china',
    'AQL inspection china',
    'product inspection service china',
    'final random inspection china',
  ],
  openGraph: {
    title: 'Quality Inspection in China | Winning Adventure Global',
    description:
      'Pre-shipment quality inspection using AQL sampling (ISO 2859-1 / ANSI-ASQ Z1.4): product checks, functional tests, packaging verification, and quantity confirmation. We inspect on your behalf before your shipment leaves China.',
    url: 'https://www.winningadventure.com.au/quality-inspection-china',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/quality-inspection-china',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/quality-inspection-china',
      'x-default': 'https://www.winningadventure.com.au/quality-inspection-china',
    },
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Pre-Shipment Quality Inspection in China',
  serviceType: 'Quality Inspection',
  provider: {
    '@type': 'Organization',
    name: 'Winning Adventure Global',
    url: 'https://www.winningadventure.com.au',
  },
  areaServed: { '@type': 'Country', name: 'Australia' },
  description:
    'Pre-shipment quality inspection for Australian importers: AQL random sampling (ISO 2859-1 / ANSI-ASQ Z1.4 standards), functional testing, packaging and labeling verification, quantity confirmation, and container loading supervision. We inspect on the factory floor on your behalf.',
  priceRange: 'Quoted per inspection day — free consult to scope',
}

const heroBullets = [
  'AQL random sampling (ISO 2859-1 / ANSI-ASQ Z1.4)',
  'Functional testing & workmanship assessment',
  'Packaging, labeling & quantity verification',
  'Photo-documented report with pass/hold/rework decision',
]

const stats = [
  { value: '1,200+', label: 'Pre-screened factories' },
  { value: '48', label: 'Hours to on-site inspection' },
  { value: '3', label: 'Defect levels: critical, major, minor' },
  { value: '25+', label: 'Provinces covered' },
]

const steps = [
  {
    icon: Boxes,
    title: 'Sample Selection (AQL Random Sampling)',
    body: 'When at least 80% of your order is finished and packed, our inspector selects a random sample from the total quantity following the internationally recognised ANSI-ASQ Z1.4 (ISO 2859-1) statistical sampling procedure. The sample size and defect thresholds are calculated per your Acceptable Quality Limit (AQL) — typically 0 for critical defects, 2.5 for major, and 4.0 for minor.',
  },
  {
    icon: Ruler,
    title: 'Product Checks & Functional Testing',
    body: 'Every sampled unit is inspected against your specification, approved sample, and purchase order: dimensions, materials, colour, finish, and workmanship. Critical functions are tested on site — power-on, mechanical operation, safety features, or any test you specify. Defects are classified as critical, major, or minor and recorded with photos and measurements.',
  },
  {
    icon: ClipboardCheck,
    title: 'Packaging, Label & Quantity Verification',
    body: 'We confirm that packaging materials, carton markings, labels, barcodes, and packing quantities match your order requirements and are suitable for export. The total carton count is verified against the packing list. Misbranded or insufficient packaging is the most common minor defect caught at this stage.',
  },
  {
    icon: FileCheck2,
    title: 'Documented Report & Shipment Decision',
    body: 'Within 24 hours of the inspection you receive a comprehensive report with: executive pass/hold/rework summary, AQL sampling data and defect breakdown (critical, major, minor), photographs of every defect, measurements against tolerances, and a clear recommendation. This report is your evidence-based decision tool for releasing the shipment, requesting rework, or holding at port.',
  },
]

const faqs = [
  {
    question: 'What is AQL and why does it matter?',
    answer:
      'AQL stands for Acceptable Quality Limit — the internationally recognised random sampling method defined by ISO 2859-1 and ANSI-ASQ Z1.4. It specifies exactly how many items to inspect from your order and how many defects are acceptable at each severity level (critical, major, minor). Using AQL ensures that your inspection decision is statistically grounded, not subjective.',
  },
  {
    question: 'How is this different from a factory audit?',
    answer:
      'A factory audit evaluates the factory\'s capability to produce quality goods — it checks equipment, systems, certifications, and workforce. A quality inspection checks the actual finished goods before shipment — are they made to your specification? Most clients use both: audit the factory first, then inspect every significant shipment before release.',
  },
  {
    question: 'What happens if my shipment fails inspection?',
    answer:
      'If the number of defects exceeds your AQL threshold, the shipment fails. You then have options: (a) request the factory to rework the defects and schedule a re-inspection, (b) negotiate a discount with the supplier and release with the known defects documented, or (c) hold the shipment at the port. Our report gives you the evidence to make that decision with confidence.',
  },
  {
    question: 'How quickly can an inspection be arranged?',
    answer:
      'Our inspectors can be on site at your supplier\'s factory within 48 hours of booking in most manufacturing regions (Guangdong, Zhejiang, Jiangsu, Fujian). For more remote provinces we typically schedule within 3-5 business days.',
  },
  {
    question: 'Can I customise what the inspector checks?',
    answer:
      'Yes. Before each inspection we send you a checklist based on your product category and purchase order. You can add specific checkpoints — dimensions against a drawing, material verification, a particular functional test, label accuracy, or packaging specifications. The checklist is finalised with you before the inspector visits the factory.',
  },
]

function ConsultButton({ className = '' }: { className?: string }) {
  return (
    <a
      href="#book"
      className={`inline-flex items-center justify-center bg-amber text-navy font-semibold px-8 py-3.5 hover:translate-y-[-1px] transition-transform ${className}`}
    >
      Book Free Consult
    </a>
  )
}

export default function QualityInspectionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.winningadventure.com.au' },
          { name: 'Services', url: 'https://www.winningadventure.com.au/services' },
          {
            name: 'Quality Inspection',
            url: 'https://www.winningadventure.com.au/quality-inspection-china',
          },
        ]}
      />

      <main>
        {/* ============================================ Hero + lead form ============================================ */}
        <section className="relative min-h-[60vh] md:min-h-[720px] flex items-center bg-navy overflow-hidden">
          <Image
            src="/quality-inspection-hero.webp"
            alt=""
            fill
            priority
            className="object-cover z-0"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/75 to-navy/40 z-[1]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_30%_50%,_white_1px,_transparent_1px)] bg-[length:40px_40px] z-[1]"
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 py-10 md:py-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-amber" aria-hidden="true" />
                <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                  Pre-shipment · Australia-managed
                </p>
              </div>
              <h1 className="font-serif font-bold text-white text-[clamp(2.1rem,4.6vw,3.25rem)] leading-[1.06] mb-5">
                Inspect Your Goods Before They Leave China
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-7">
                AQL random sampling, functional testing, packaging checks, and quantity verification — on the factory floor, on your behalf. Book a free consult and tell us about your order.
              </p>
              <ul className="flex flex-col gap-2.5">
                {heroBullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/90 text-[15px]">
                    <Check size={18} className="text-amber flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:pl-4">
              <LeadForm id="book" />
            </div>
          </div>
        </section>

        {/* ============================================ Trust stat strip ============================================ */}
        <section className="bg-white border-b border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif font-bold text-navy text-3xl md:text-4xl mb-1">{s.value}</p>
                <p className="text-navy/60 text-[13px] leading-snup">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================ Why it matters (risk) ============================================ */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-amber" aria-hidden="true" />
              <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                Why it matters
              </p>
            </div>
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-10 max-w-[760px] text-balance">
              The balance of your payment is due before the container arrives. A pre-shipment inspection is your last checkpoint.
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <AlertTriangle size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">Acceptable Quality Limit (AQL)</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  Under ISO 2859-1, a standard defect threshold is AQL 2.5 for major defects — meaning up to 5 defective units per 315 inspected may be accepted. Without an independent inspector, that decision is left to the supplier&apos;s own QC.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <Boxes size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">Three defect levels</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  Critical defects (safety, regulatory — AQL 0), major defects (function, appearance — AQL 2.5), and minor defects (workmanship, finish — AQL 4.0). Each is tracked, photographed, and reported so you know exactly what you are accepting.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="border border-navy/10 p-6 h-full">
                <Search size={26} className="text-amber mb-4" />
                <p className="font-serif font-bold text-navy text-2xl mb-2">You own the decision</p>
                <p className="text-navy/70 text-[15px] leading-relaxed">
                  A pre-shipment inspection report does not block your shipment — it gives you the evidence to decide: release the goods, request rework, renegotiate, or hold. Without evidence, your only option is to trust the supplier.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="text-center">
              <ConsultButton />
            </div>
          </ScrollReveal>
        </section>

        {/* ============================================ How it works ============================================ */}
        <section className="bg-navy/[0.03] border-y border-navy/10">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
            <ScrollReveal>
              <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-12 text-center text-balance">
                How a Quality Inspection Works
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {steps.map((s, i) => (
                <ScrollReveal key={s.title}>
                  <div className="bg-white border border-navy/10 p-7 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <s.icon size={26} className="text-amber" />
                      <span className="font-serif font-bold text-navy/25 text-2xl">0{i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-navy text-lg mb-2">{s.title}</h3>
                    <p className="text-navy/70 text-[15px] leading-relaxed">{s.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal>
              <div className="text-center">
                <ConsultButton />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ============================================ Data advantage (trust) ============================================ */}
        <section className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <ScrollReveal>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-amber" aria-hidden="true" />
                  <p className="text-amber text-xs font-semibold uppercase tracking-[0.18em]">
                    Why us
                  </p>
                </div>
                <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] leading-tight mb-5 text-balance">
                  Industry-standard methodology with Australia-based oversight
                </h2>
                <p className="text-navy/70 text-lg leading-relaxed mb-6">
                  Every inspection follows the internationally recognised AQL sampling procedure (ISO 2859-1 / ANSI-ASQ Z1.4). Your checklist is customised per product category and confirmed before the inspector visits. You receive a photo-documented report within 24 hours, with a clear pass-or-fail recommendation grounded in statistically valid sampling.
                </p>
                <ul className="flex flex-col gap-3">
                  {[
                    'Standard inspection arranged within 48 hours across Guangdong, Zhejiang, Jiangsu, and Fujian manufacturing regions.',
                    'Custom checklist per order — dimensions, materials, function, packaging, labels, and any special tests you require.',
                    'Container Loading Supervision (CLS) available as an add-on to confirm your goods are loaded correctly and securely.',
                  ].map((point) => (
                    <li key={point} className="flex gap-3 text-navy/75 text-[15px] leading-relaxed">
                      <Check size={18} className="text-amber flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="bg-navy text-white p-8 md:p-10">
                <Ruler size={34} className="text-amber mb-5" />
                <p className="font-serif font-bold text-2xl md:text-3xl mb-3 leading-snug">
                  Not sure when to inspect?
                </p>
                <p className="text-white/75 leading-relaxed mb-6">
                  Most of our clients book a pre-shipment inspection when goods are at least 80% finished and packed. But there are earlier checkpoints too:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Pre-production check',
                    'During-production check',
                    'Pre-shipment (most common)',
                    'Container loading',
                    'Rework verification',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-[13px] text-white/85 border border-white/20 px-3 py-1.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ============================================ FAQ ============================================ */}
        <section className="bg-navy/[0.03] border-t border-navy/10">
          <div className="max-w-[900px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif font-bold text-navy text-2xl md:text-[2.1rem] mb-10 text-center">
              Quality Inspection FAQs
            </h2>
            <FAQ faqs={faqs} hideHeading />
          </div>
        </section>

        {/* ============================================ Closing conversion ============================================ */}
        <section className="bg-navy text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="font-serif font-bold text-2xl md:text-[2.2rem] leading-tight mb-4">
                Know your shipment is right before it sails
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
                Tell us about your order — product, quantity, supplier, and any special quality requirements. We&apos;ll scope the inspection on a free, no-obligation consult.
              </p>
              <ul className="flex flex-col gap-2.5">
                {heroBullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/90 text-[15px]">
                    <Check size={18} className="text-amber flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <LeadForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
