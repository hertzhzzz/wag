import ResourcesContent from '@/components/ResourcesContent'
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

function getArticles() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map((filename, index) => {
      const slug = filename.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
      const { data } = matter(raw)
      return { slug, index: index + 1, ...data } as any
    })
    .sort((a: any, b: any) => (a.date < b.date ? 1 : -1))
}

export default function ResourcesPage() {
  const articles = getArticles()
  const categories = ['All Articles', ...Array.from(new Set(articles.map((a: any) => a.category).filter(Boolean)))]

  return <ResourcesContent articles={articles as any} categories={categories} />
}
