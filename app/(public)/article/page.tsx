import ResourcesContent from '@/components/ResourcesContent'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Free guides on verifying Chinese suppliers, planning factory visits, and import strategies. Expert resources for Australian businesses sourcing from China.',
  openGraph: {
    title: 'Articles | Winning Adventure Global',
    description: 'Expert guides on planning factory visits in China for Australian businesses. Includes supplier verification checklists and import tips.',
    url: 'https://www.winningadventure.com.au/article',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/article',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/article',
      'x-default': 'https://www.winningadventure.com.au/article',
    },
  },
}

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

// Sorted by GSC impressions (highest first)
// Fetched: python ~/.claude/skills/seo/scripts/gsc_query.py --property "sc-domain:winningadventure.com.au" --json --dimension page
const SLUGS_BY_IMPRESSIONS = [
  'china-home-sales-drop',
  '2026-australian-federal-budget-import-duty-changes',
  'iran-war-australia-china-supply-chain',
  'verify-chinese-supplier',
  '2026-australia-federal-budget-china-sourcing-impact',
  'australian-retail-trends-grilld-coles',
  'us-export-ban-australian-manufacturers',
  'negative-gearing-properties',
  'el-nino-food-supply-chain-australia',
  'china-factory-tour-guide',
  'cba-share-price-impact-australian-procurement',
  'silver-price-impact-china-manufacturing-cost',
  'thucydides-trap-australia-china-supply-chain',
  'australia-import-tips',
  'how-to-plan',
  'bulk-procurement-china-guide',
  'albanese-family-trust-tax-2026',
  'australian-supermarket-china-sourcing-secrets',
  'bunnings-wholesale-guide',
  'china-business-tours',
]

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

  // Sort by GSC impressions order, then by date for articles not in the list
  const impressionsMap = new Map(SLUGS_BY_IMPRESSIONS.map((slug, i) => [slug, i]))
  return articles.sort((a, b) => {
    const aIdx = impressionsMap.get(a.slug)
    const bIdx = impressionsMap.get(b.slug)
    if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx
    if (aIdx !== undefined) return -1
    if (bIdx !== undefined) return 1
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return isNaN(dateA) ? 0 : dateA - dateB
  })
}

export default function ResourcesPage() {
  const articles = getArticles()

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'China Sourcing Agent Articles',
    description: 'Expert guides on China sourcing, factory visits, and cross-border trade for Australian B2B businesses.',
    url: 'https://www.winningadventure.com.au/article',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `https://www.winningadventure.com.au/article/${article.slug}`,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Articles', url: 'https://www.winningadventure.com.au/article' }
      ]} />
      <ResourcesContent articles={articles} />
    </>
  )
}
