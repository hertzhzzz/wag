import Link from 'next/link'
import { BookOpen, Clock, Calendar, ArrowRight } from 'lucide-react'
import type { RecommendedArticle } from './article-utils'

interface RecommendedSidebarProps {
  articles: RecommendedArticle[]
}

export function RecommendedSidebar({ articles }: RecommendedSidebarProps) {
  if (articles.length === 0) return null

  return (
    <aside className="sticky top-24">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <BookOpen size={18} className="text-[#0F2D5E]" />
          <h3 className="font-serif font-semibold text-[#0F2D5E] text-base">
            Recommended Reading
          </h3>
        </div>

        {/* Article list */}
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,45,94,0.1)] transition-all duration-200"
            >
              {/* Thumbnail */}
              {article.coverImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-3">
                <h4 className="font-serif font-semibold text-[#0F2D5E] text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-[#F59E0B] transition-colors">
                  {article.title}
                </h4>

                {article.desc && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {article.desc}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {article.readTime}
                  </span>
                </div>

                {/* Arrow indicator */}
                <div className="flex items-center gap-1 mt-2 text-[#F59E0B]">
                  <span className="text-xs font-medium">Read more</span>
                  <ArrowRight
                    size={12}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
