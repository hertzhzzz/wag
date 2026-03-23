import ResourcesContent from '@/components/ResourcesContent'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources | China Factory Tour Guides & Business Insights',
  description: 'Expert guides on planning factory visits in China, sourcing strategies, and business travel tips for Australian businesses.',
  keywords: ['China factory tour guide', 'China business travel', 'factory visit China', 'sourcing from China', 'Canton Fair guide', 'Australian business China'],
  openGraph: {
    title: 'Resources | China Factory Tour Guides',
    description: 'Expert guides on planning factory visits in China for Australian businesses.',
    url: 'https://www.winningadventure.com.au/resources',
  },
}

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

function getArticles(): Article[] {
  const articles = fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map((filename, index) => {
      const slug = filename.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
      const { data } = matter(raw)
      return {
        slug,
        index: index + 1,
        title: data.title || '',
        category: data.category || 'Uncategorized',
        date: data.date || '',
        readTime: data.readTime || '',
        coverImage: data.coverImage,
        desc: data.desc,
        description: data.description,
      } as Article
    })
    .sort((a, b) => {
      const dateA = a.date
      const dateB = b.date
      if (!dateA || !dateB) return 0
      return dateA < dateB ? 1 : -1
    })
  return articles
}

export default function ResourcesPage() {
  const articles = getArticles()
  const categories = ['All Articles', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))]

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Resources', url: 'https://www.winningadventure.com.au/resources' }
      ]} />
      <ResourcesContent articles={articles} categories={categories} />
    </>
  )
}
