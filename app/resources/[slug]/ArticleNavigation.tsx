import Link from 'next/link'

interface ArticleNavigationProps {
  prevArticle?: { slug: string; title: string; category: string }
  nextArticle?: { slug: string; title: string; category: string }
}

export function ArticleNavigation({ prevArticle, nextArticle }: ArticleNavigationProps) {
  if (!prevArticle && !nextArticle) return null

  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 pt-8 border-t border-gray-200">
      {prevArticle ? (
        <Link
          href={`/resources/${prevArticle.slug}`}
          className="group p-5 border border-gray-200 rounded-lg hover:border-[#0F2D5E] hover:shadow-md transition-all"
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">← Previous</p>
          <p className="font-semibold text-[#0F2D5E] group-hover:text-[#F59E0B] transition-colors line-clamp-2">
            {prevArticle.title}
          </p>
        </Link>
      ) : <div />}
      {nextArticle ? (
        <Link
          href={`/resources/${nextArticle.slug}`}
          className="group p-5 border border-gray-200 rounded-lg hover:border-[#0F2D5E] hover:shadow-md transition-all text-right"
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Next →</p>
          <p className="font-semibold text-[#0F2D5E] group-hover:text-[#F59E0B] transition-colors line-clamp-2">
            {nextArticle.title}
          </p>
        </Link>
      ) : <div />}
    </nav>
  )
}
