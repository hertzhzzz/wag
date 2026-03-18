import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

function getAllSlugs() {
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace('.mdx', ''))
}

function getArticle(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { frontmatter: data, content }
}

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}
  const { frontmatter: fm } = article
  return {
    title: fm.title,
    description: fm.description,
    keywords: ['China factory tour', 'factory visit China', 'Australian business China sourcing', 'supplier verification', 'Guangdong manufacturing'],
    authors: [{ name: fm.author }],
    openGraph: {
      title: fm.title,
      description: fm.description,
      type: 'article',
      publishedTime: fm.date,
      authors: [fm.author],
      images: fm.coverImage ? [
        {
          url: fm.coverImage,
          width: 1200,
          height: 630,
          alt: fm.title,
        }
      ] : [],
      url: `https://www.winningadventure.com.au/resources/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: fm.title,
      description: fm.description,
      images: fm.coverImage ? [fm.coverImage] : [],
    },
    alternates: {
      canonical: `https://www.winningadventure.com.au/resources/${slug}`,
    },
  }
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f8f9fb] border border-gray-200 p-5 my-6">
      <p className="text-sm font-semibold text-[#0F2D5E] mb-1">What to do</p>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  )
}


function InlineCTA({ ctaTitle, ctaText, ctaButtonText }: { ctaTitle: string; ctaText: string; ctaButtonText: string }) {
  return (
    <div className="my-10 bg-[#f8f9fb] border-l-4 border-[#F59E0B] p-6">
      <p className="text-sm font-semibold text-[#0F2D5E] mb-1">{ctaTitle}</p>
      <p className="text-sm text-gray-600 mb-4">{ctaText}</p>
      <Link href="/enquiry" className="inline-block bg-[#0F2D5E] text-white text-sm font-semibold px-6 py-3 hover:bg-[#F59E0B] hover:text-[#0F2D5E] transition-colors">
        {ctaButtonText}
      </Link>
    </div>
  )
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const { frontmatter: fm, content } = article
  const takeaways: string[] = fm.takeaways || []

  const components = {
    Tip,
    InlineCTA: () => <InlineCTA ctaTitle={fm.ctaTitle} ctaText={fm.ctaText} ctaButtonText={fm.ctaButtonText} />,
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="font-serif text-2xl font-bold text-[#0F2D5E] mb-4 mt-12" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="text-gray-700 leading-relaxed mb-4" {...props} />
    ),
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
      <table className="w-full border-collapse my-6 table-auto" {...props} />
    ),
    thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <thead className="bg-[#0F2D5E] text-white" {...props} />
    ),
    tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <tbody className="bg-white" {...props} />
    ),
    tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
      <tr className="border-b border-gray-200" {...props} />
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold" {...props} />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
      <td className="border border-gray-200 px-4 py-3 text-sm" {...props} />
    ),
    sup: (props: React.HTMLAttributes<HTMLElement>) => (
      <sup className="text-[#F59E0B] font-semibold cursor-pointer" {...props} />
    ),
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0F2D5E] py-16 px-8">
        <div className="max-w-[1100px] mx-auto">
          <nav className="flex items-center gap-2 text-xs text-blue-300 uppercase tracking-wider mb-6 pt-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>›</span>
            <Link href="/resources" className="hover:text-white">Resources</Link>
            <span>›</span>
            <span className="text-white">{fm.category}</span>
          </nav>
          <p className="text-xs font-semibold tracking-widest text-[#F59E0B] uppercase mb-4">{fm.category}</p>
          <h1 className="font-serif font-bold text-[clamp(1.75rem,3.5vw,2.75rem)] text-white leading-tight mb-6">
            {fm.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-blue-200 mb-8">
            <span>By {fm.author}</span>
            <span>·</span>
            <span>{fm.readTime}</span>
          </div>
        </div>
      </section>


      {/* Article */}
      <article className="py-16 px-8">
        <div className="max-w-[1100px] mx-auto flex gap-12">

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Key Takeaways */}
            {takeaways.length > 0 && (
              <div className="bg-[#0F2D5E] text-white p-8 rounded-lg mb-10">
                <h3 className="font-serif font-bold text-xl mb-5 text-[#F59E0B]">Key Takeaways</h3>
                <ul className="space-y-3">
                  {takeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-blue-100">
                      <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#0F2D5E] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Intro divider */}
            <div className="pb-10 border-b border-gray-200 mb-10 text-lg text-gray-700 leading-relaxed">
              <MDXRemote
                source={content.split('\n## ')[0]}
                components={components}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                  },
                }}
              />
            </div>

            {/* Body */}
            <MDXRemote
              source={'## ' + content.split('\n## ').slice(1).join('\n## ')}
              components={components}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />

            {/* Bottom CTA */}
            <div className="border border-gray-200 p-8 text-center mt-12">
              <p className="text-xs font-semibold tracking-widest text-[#F59E0B] uppercase mb-3">{fm.category}</p>
              <h3 className="font-serif text-2xl font-bold text-[#0F2D5E] mb-3">{fm.ctaTitle}</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{fm.ctaText}</p>
              <Link href="/enquiry" className="inline-block bg-[#0F2D5E] text-white font-semibold px-8 py-4 hover:bg-[#F59E0B] hover:text-[#0F2D5E] transition-colors">
                {fm.ctaButtonText}
              </Link>
              <p className="text-xs text-gray-400 mt-3">Free initial consultation. We respond within 4 business hours.</p>
            </div>
          </div>

          {/* Sticky sidebar */}
          <div className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-[100px] bg-white border border-gray-200 rounded-lg p-6 shadow-[0_4px_20px_rgba(15,45,94,0.08)]">
              <p className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#F59E0B] mb-3">{fm.category}</p>
              <h3 className="font-serif text-lg font-bold text-[#0F2D5E] mb-3 leading-snug">{fm.ctaTitle}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{fm.ctaText}</p>
              <Link
                href="/enquiry"
                className="block w-full bg-[#0F2D5E] text-white text-sm font-semibold px-4 py-3 text-center hover:bg-[#F59E0B] hover:text-[#0F2D5E] transition-colors no-underline rounded-sm"
              >
                {fm.ctaButtonText}
              </Link>
              <p className="text-[0.65rem] text-gray-400 text-center mt-3">Free consultation · We respond within 4 hours</p>
            </div>
          </div>

        </div>
      </article>

      <Footer />
    </>
  )
}
