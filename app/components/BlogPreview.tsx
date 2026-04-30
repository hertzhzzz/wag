import Link from 'next/link'
import Image from 'next/image'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

interface Article {
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  coverImage?: string
  desc?: string
  description?: string
}

function getRecentArticles(count = 3): Article[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((filename) => {
      const slug = filename.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
      const { data } = matter(raw)
      return {
        slug,
        title: data.title || '',
        category: data.category || 'Guide',
        date: data.date
          ? new Date(data.date).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '',
        readTime: data.readTime || '',
        coverImage: data.coverImage,
        desc: data.desc || data.description || '',
      } as Article
    })
    .filter((a) => a.title && a.date)
    .sort((a, b) => {
      if (!a.date || !b.date) return 0
      return a.date < b.date ? 1 : -1
    })
    .slice(0, count)
}

export default function BlogPreview() {
  const articles = getRecentArticles(3)

  if (articles.length === 0) return null

  return (
    <section className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-16">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#F59E0B] mb-2">
              Expert Insights
            </p>
            <h2 className="font-serif text-[#0F2D5E] text-[28px] md:text-[34px] font-semibold leading-tight">
              From Our Blog
            </h2>
            <p className="text-gray-500 text-[15px] mt-2 max-w-[480px]">
              Practical guides on China sourcing, supplier verification, and factory
              visit planning — written for Australian businesses.
            </p>
          </div>
          <Link
            href="/resources"
            className="self-start md:self-auto text-[13px] font-bold text-[#0F2D5E] hover:text-[#F59E0B] transition-colors whitespace-nowrap flex items-center gap-1.5 min-h-11"
          >
            All Articles
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-px">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Article cards — 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <article
              key={article.slug}
              className="bg-white border border-gray-200 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,45,94,0.1)] transition-all duration-200"
            >
              {/* Cover image */}
              <Link
                href={`/resources/${article.slug}`}
                className="relative block h-[180px] bg-[#0F2D5E] flex items-center justify-center overflow-hidden group flex-shrink-0"
              >
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    width={400}
                    height={200}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
                  />
                ) : (
                  <span className="absolute inset-0 bg-[#0F2D5E]" />
                )}
                <span className="absolute top-3 left-3 z-10 bg-[#F59E0B] text-[#0F2D5E] py-1 px-2.5 text-[10px] font-bold uppercase tracking-wide">
                  {article.category}
                </span>
              </Link>

              {/* Card body */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2">
                  {article.date}
                  {article.readTime && (
                    <span className="ml-2">
                      &nbsp;&middot;&nbsp; {article.readTime}
                    </span>
                  )}
                </p>

                <Link href={`/resources/${article.slug}`} className="block flex-1">
                  <h3 className="font-serif text-[18px] font-semibold text-[#0F2D5E] leading-snug mb-3 hover:text-[#F59E0B] transition-colors">
                    {article.title}
                  </h3>
                </Link>

                <p className="text-[14px] text-gray-500 leading-relaxed mb-5 line-clamp-3 flex-1">
                  {article.desc}
                </p>

                <Link
                  href={`/resources/${article.slug}`}
                  className="self-start text-[13px] font-bold text-[#0F2D5E] hover:text-[#F59E0B] transition-colors flex items-center gap-1 min-h-8"
                >
                  Read Guide
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-px">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}