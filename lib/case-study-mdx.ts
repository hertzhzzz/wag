import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { z } from 'zod'

const CaseStudyFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  industry: z.string(),
  slug: z.string(),
  companyType: z.string(),
  location: z.string(),
  product: z.string(),
  units: z.string(),
  wagActions: z.array(z.string()),
  savings: z.string(),
  verification: z.string(),
  quote: z.string(),
  quoteAttribution: z.string(),
  coverImage: z.string().optional(),
})

export type CaseStudyFrontmatter = z.infer<typeof CaseStudyFrontmatterSchema>

export function getCaseStudyBySlug(
  slug: string,
): { frontmatter: CaseStudyFrontmatter; content: string } | null {
  const CASE_STUDIES_DIR = path.join(process.cwd(), 'content/case-studies')
  const filename = path.join(CASE_STUDIES_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filename)) return null
  const raw = fs.readFileSync(filename, 'utf-8')
  const { data, content } = matter(raw)
  const parsed = CaseStudyFrontmatterSchema.safeParse(data)
  if (!parsed.success) {
    console.error(`[case-study-mdx] Invalid frontmatter for slug "${slug}":`, parsed.error.flatten())
    return null
  }
  return { frontmatter: parsed.data, content }
}

export function getAllCaseStudySlugs(): string[] {
  const CASE_STUDIES_DIR = path.join(process.cwd(), 'content/case-studies')
  if (!fs.existsSync(CASE_STUDIES_DIR)) return []
  return fs
    .readdirSync(CASE_STUDIES_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace('.mdx', ''))
}