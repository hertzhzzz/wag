import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import BlogPreviewClient from './BlogPreviewClient'

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

// Top articles by GSC impressions (last 28 days)
// Fetched via: python ~/.claude/skills/seo/scripts/gsc_query.py --property "sc-domain:winningadventure.com.au" --json --dimension page
const TOP_SLUGS = [
  'china-home-sales-drop',
  'verify-chinese-supplier',
  '2026-australian-federal-budget-import-duty-changes',
  'iran-war-australia-china-supply-chain',
  'stateside-sports',
]

function getTopArticles(count = 3): Article[] {
  const all = fs
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

  // Preserve TOP_SLUGS order for top articles
  const topMap = new Map(TOP_SLUGS.map((slug, i) => [slug, i]))
  const sorted = [...all].sort((a, b) => {
    const ai = topMap.get(a.slug)
    const bi = topMap.get(b.slug)
    if (ai !== undefined && bi !== undefined) return ai - bi
    if (ai !== undefined) return -1
    if (bi !== undefined) return 1
    if (!a.date || !b.date) return 0
    return a.date < b.date ? 1 : -1
  })
  return sorted.slice(0, count)
}

// Server 壳：仅读文件系统拿文章数据，渲染交给 client 子组件（使文案可随语言切换）。
export default function BlogPreview() {
  return <BlogPreviewClient articles={getTopArticles(2)} />
}
