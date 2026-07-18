import ArticleListContent from '@/components/ArticleListContent'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import { listArticleSummaries } from '@/lib/seo/articleReader'
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
  'bulk-procurement-china-guide',
  'albanese-family-trust-tax-2026',
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
  const { articles } = listArticleSummaries({ mode: 'compatibility' })

  // Sort by GSC impressions order, then by date for articles not in the list.
  // Reader returns deterministic slug order; presentation re-sort stays local.
  const impressionsMap = new Map(SLUGS_BY_IMPRESSIONS.map((slug, i) => [slug, i]))
  return articles
    .map((article) => ({
      slug: article.slug,
      title: article.title,
      category: article.category,
      date: article.date,
      updatedDate: article.updatedDate,
      readTime: article.readTime,
      coverImage: article.coverImage,
      desc: article.desc,
      description: article.description,
      featured: article.featured || false,
    }))
    .sort((a, b) => {
      const aIdx = impressionsMap.get(a.slug)
      const bIdx = impressionsMap.get(b.slug)
      if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx
      if (aIdx !== undefined) return -1
      if (bIdx !== undefined) return 1
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return isNaN(dateA) || isNaN(dateB) ? 0 : dateA - dateB
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
      <ArticleListContent articles={articles} />
    </>
  )
}
