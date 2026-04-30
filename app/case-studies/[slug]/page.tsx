import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import DOMPurify from 'isomorphic-dompurify'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { industries } from '@/components/industries'
import { getCaseStudyBySlug, getAllCaseStudySlugs } from '@/lib/case-study-mdx'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllCaseStudySlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = getCaseStudyBySlug(slug)
  if (!data) return {}
  const { frontmatter } = data
  return {
    title: `${frontmatter.title} | Winning Adventure Global`,
    description: frontmatter.description,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: `https://www.winningadventure.com.au/case-studies/${slug}`,
      siteName: 'Winning Adventure Global',
      locale: 'en_AU',
    },
    alternates: {
      canonical: `https://www.winningadventure.com.au/case-studies/${slug}`,
    },
  }
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params
  const data = getCaseStudyBySlug(slug)
  if (!data) notFound()

  const { frontmatter, content } = data

  const relatedIndustries = industries.filter((i) => i.slug !== slug).slice(0, 3)

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.winningadventure.com.au' },
          {
            name: 'Case Studies',
            url: 'https://www.winningadventure.com.au/case-studies',
          },
          {
            name: frontmatter.title,
            url: `https://www.winningadventure.com.au/case-studies/${slug}`,
          },
        ]}
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-navy py-14 md:py-20 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-xs text-gray-400 mb-4">
            <Link href="/case-studies" className="hover:text-white">
              ← Back to Case Studies
            </Link>
          </div>
          <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-amber bg-amber/10 px-2.5 py-1 w-fit block mb-4">
            {frontmatter.industry}
          </span>
          <h1 className="font-serif font-bold text-[clamp(2rem,4vw,3rem)] text-white mb-4 leading-tight">
            {frontmatter.title}
          </h1>
          <p className="text-lg text-gray-300 max-w-[640px] leading-relaxed">
            {frontmatter.description}
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-400">
            <span>{frontmatter.companyType}</span>
            <span className="text-navy/30">|</span>
            <span>{frontmatter.location}</span>
            <span className="text-navy/30">|</span>
            <span>{frontmatter.product}</span>
          </div>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="py-14 md:py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div
              className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-navy prose-p:text-gray-700 prose-li:text-gray-700"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* The Results card */}
            <div className="bg-amber/10 border border-amber/30 p-7">
              <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-amber mb-4">
                The Results
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Savings</p>
                  <p className="font-serif text-2xl font-bold text-navy">
                    {frontmatter.savings}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Verification</p>
                  <p className="text-sm text-gray-700">{frontmatter.verification}</p>
                </div>
              </div>
            </div>

            {/* Quote card */}
            <div className="bg-navy p-7 text-white">
              <blockquote className="text-lg leading-relaxed mb-4 font-serif">
                &ldquo;{frontmatter.quote}&rdquo;
              </blockquote>
              <p className="text-xs text-gray-400">— {frontmatter.quoteAttribution}</p>
            </div>

            {/* How WAG Helped */}
            <div className="border-2 border-navy p-7">
              <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-navy mb-4">
                How WAG Helped
              </h3>
              <ul className="space-y-3">
                {frontmatter.wagActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <svg
                      className="w-4 h-4 text-amber mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <Link
              href="/enquiry"
              className="block bg-amber text-navy py-3.5 px-6 text-center font-semibold text-sm hover:bg-amber/90 transition-colors"
            >
              Start Your Journey →
            </Link>
          </div>
        </div>
      </section>

      {/* More industries */}
      <section className="py-14 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-serif text-2xl font-bold text-navy mb-8 text-center">
            More Industries
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedIndustries.map((industry) => (
              <Link
                key={industry.slug}
                href={`/case-studies/${industry.slug}`}
                className="group bg-white border-2 border-gray-200 p-7 flex flex-col gap-4 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(15,45,94,0.1)] hover:-translate-y-0.5 hover:border-navy/20"
              >
                <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-amber bg-amber/10 px-2.5 py-1 w-fit">
                  {industry.category}
                </span>
                <h3 className="font-serif text-[1.15rem] font-bold text-navy leading-snug group-hover:text-[#1a4080] transition-colors">
                  {industry.title}
                </h3>
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

      <Footer />
    </>
  )
}