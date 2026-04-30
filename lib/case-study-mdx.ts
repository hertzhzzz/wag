import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface CaseStudyFrontmatter {
  title: string
  description: string
  date: string
  industry: string
  slug: string
  companyType: string
  location: string
  product: string
  units: string
  wagActions: string[]
  savings: string
  verification: string
  quote: string
  quoteAttribution: string
  coverImage?: string
}

export function getCaseStudyBySlug(
  slug: string,
): { frontmatter: CaseStudyFrontmatter; content: string } | null {
  const CASE_STUDIES_DIR = path.join(process.cwd(), 'content/case-studies')
  const filename = path.join(CASE_STUDIES_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filename)) return null
  const raw = fs.readFileSync(filename, 'utf-8')
  const { data, content } = matter(raw)
  return { frontmatter: data as CaseStudyFrontmatter, content }
}

export function getAllCaseStudySlugs(): string[] {
  const CASE_STUDIES_DIR = path.join(process.cwd(), 'content/case-studies')
  if (!fs.existsSync(CASE_STUDIES_DIR)) return []
  return fs
    .readdirSync(CASE_STUDIES_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace('.mdx', ''))
}