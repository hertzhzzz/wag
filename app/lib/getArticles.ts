import { listArticleSummaries } from '@/lib/seo/articleReader'

export interface Article {
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  coverImage?: string
  desc?: string
  description?: string
}

export function getRecentArticles(count = 3): Article[] {
  const { articles } = listArticleSummaries({ mode: 'compatibility' })

  return [...articles]
    .filter((article) => article.title && article.date)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (isNaN(dateA) || isNaN(dateB)) return 0
      return dateB - dateA
    })
    .slice(0, count)
    .map((article) => ({
      slug: article.slug,
      title: article.title,
      category: article.category,
      date: article.date
        ? new Date(article.date).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '',
      readTime: article.readTime,
      coverImage: article.coverImage,
      desc: article.desc || article.description || '',
      description: article.description,
    }))
}
