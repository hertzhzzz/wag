import ResourcesContent from '@/components/ResourcesContent'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'China Sourcing Resources | Factory Tour Guides & Supplier Verification',
  description: 'Free guides on verifying Chinese suppliers, planning factory visits, and import strategies. Expert resources for Australian businesses sourcing from China.',
  keywords: ['china manufacturing resources', 'factory guide australia', 'supplier tips china', 'china sourcing guide', 'australian import china', 'verify chinese suppliers'],
  openGraph: {
    title: 'China Sourcing Resources | Factory Tour Guides',
    description: 'Expert guides on planning factory visits in China for Australian businesses. Includes supplier verification checklists and import tips.',
    url: 'https://www.winningadventure.com.au/resources',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/resources',
  },
}

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

interface Article {
  slug: string
  title: string
  category: string
  date: string
  updatedDate?: string
  readTime: string
  coverImage?: string
  desc?: string
  description?: string
  featured?: boolean
}

function getArticles(): Article[] {
  const articles = fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map((filename) => {
      const slug = filename.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
      const { data } = matter(raw)
      return {
        slug,
        title: data.title || '',
        category: data.category || 'Uncategorized',
        date: data.date || '',
        updatedDate: data.updatedDate,
        readTime: data.readTime || '',
        coverImage: data.coverImage,
        desc: data.desc,
        description: data.description,
        featured: data.featured || false,
      } as Article
    })
  return articles
}

export default function ResourcesPage() {
  const articles = getArticles()

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Resources', url: 'https://www.winningadventure.com.au/resources' }
      ]} />
      <ResourcesContent articles={articles} />
    </>
  )
}
