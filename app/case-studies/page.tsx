import Link from 'next/link'
import { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { industries } from '@/components/industries'

export const metadata: Metadata = {
  title: 'China Sourcing Case Studies | 20 Industries Verified | Winning Adventure Global',
  description:
    '20 detailed case studies of Australian businesses who sourced safely from China. See how we verified suppliers, arranged factory visits, and delivered results.',
  keywords: [
    'China sourcing case study',
    'Australian business China factory',
    'supplier verification Australia',
    'China factory visit case study',
    'Australian importer China success',
  ],
  openGraph: {
    title: 'China Sourcing Case Studies | Winning Adventure Global',
    description:
      '20 detailed case studies of Australian businesses who sourced safely from China.',
    url: 'https://www.winningadventure.com.au/case-studies',
    siteName: 'Winning Adventure Global',
    locale: 'en_AU',
    alternateLocale: 'en_US',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/case-studies',
  },
}

export default function CaseStudiesPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.winningadventure.com.au' },
          {
            name: 'Case Studies',
            url: 'https://www.winningadventure.com.au/case-studies',
          },
        ]}
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-navy py-14 md:py-20 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span>Case Studies</span>
          </div>
          <h1 className="font-serif font-bold text-[clamp(2rem,4vw,3rem)] text-white mb-4 leading-tight">
            20 Industries.{' '}
            <span className="text-amber">Proven Results.</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-[640px] leading-relaxed">
            Australian businesses who partnered with Winning Adventure Global to
            verify Chinese suppliers, reduce sourcing risk, and protect their
            supply chains.
          </p>
        </div>
      </section>

      {/* Industry Grid */}
      <section className="py-14 md:py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <Link
                key={industry.slug}
                href={`/case-studies/${industry.slug}`}
                className="group bg-white border-2 border-gray-200 p-7 flex flex-col gap-4 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(15,45,94,0.1)] hover:-translate-y-0.5 hover:border-navy/20"
              >
                <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-amber bg-amber/10 px-2.5 py-1 w-fit">
                  {industry.category}
                </span>
                <h2 className="font-serif text-[1.15rem] font-bold text-navy leading-snug group-hover:text-[#1a4080] transition-colors">
                  {industry.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                  {industry.description}
                </p>
                <span className="text-xs font-semibold text-navy/60 group-hover:text-amber transition-colors flex items-center gap-1 mt-auto">
                  Read case study
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[720px] mx-auto border-2 border-navy p-10 md:p-14 text-center">
          <h2 className="font-serif text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-navy mb-3">
            Ready to add your success story?
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Join Australian businesses already sourcing smarter with Winning
            Adventure Global. Every supply chain starts with a single enquiry.
          </p>
          <Link
            href="/enquiry"
            className="inline-block bg-navy text-white py-3.5 px-8 text-base font-semibold transition-colors hover:bg-[#1a4080] min-h-11"
          >
            Start Your Journey →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
