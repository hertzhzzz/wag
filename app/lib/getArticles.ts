import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

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