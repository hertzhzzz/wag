import fs from 'node:fs'
import path from 'node:path'

/**
 * Guards against the truncated-SERP-snippet class of SEO regressions.
 *
 * A 2026-08 audit found 32 titles and 34 meta descriptions over the limits.
 * Root cause: no length check anywhere, plus article titles inheriting the
 * root `title.template` which appends " | Winning Adventure Global" (27 chars).
 */

const PROJECT_ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(PROJECT_ROOT, 'content', 'blog')
const PUBLIC_APP_DIR = path.join(PROJECT_ROOT, 'app', '(public)')

const MAX_TITLE = 60
const MIN_DESCRIPTION = 70
const MAX_DESCRIPTION = 160

/** Reads a single-line quoted scalar out of a frontmatter block. */
function frontmatterValue(frontmatter: string, key: string): string | undefined {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*["'](.*)["']\\s*$`, 'm'))
  return match?.[1]
}

function readArticles(): { slug: string; title?: string; seoTitle?: string; description?: string }[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const source = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
      const frontmatter = source.startsWith('---') ? source.split('---', 3)[1] : ''
      return {
        slug: file.replace(/\.mdx$/, ''),
        title: frontmatterValue(frontmatter, 'title'),
        seoTitle: frontmatterValue(frontmatter, 'seoTitle'),
        description: frontmatterValue(frontmatter, 'description'),
      }
    })
}

/** Collects `title: { absolute: '…' }` and `description: '…'` literals from page metadata. */
function readStaticPageMetadata(dir: string, acc: { file: string; title?: string; description?: string }[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Dynamic routes build their metadata from data files at request time.
      if (!entry.name.startsWith('[')) readStaticPageMetadata(full, acc)
      continue
    }
    if (!/^(page\.tsx|metadata\.ts)$/.test(entry.name)) continue
    const source = fs.readFileSync(full, 'utf8')
    if (!source.includes('Metadata')) continue
    const rel = path.relative(PROJECT_ROOT, full)
    const title = source.match(/title:\s*\{\s*absolute:\s*'([^']*)'\s*\}/)?.[1]
    const description = source.match(/^\s*description:\s*\n?\s*'([^']*)',/m)?.[1]
    acc.push({ file: rel, title, description })
  }
  return acc
}

describe('article SERP metadata length', () => {
  const articles = readArticles()

  it('finds articles to check', () => {
    expect(articles.length).toBeGreaterThan(0)
  })

  it.each(articles)('$slug renders a title within $MAX_TITLE chars', ({ slug, title, seoTitle }) => {
    // page.tsx uses `title: { absolute: fm.seoTitle || fm.title }`, so the
    // rendered <title> is exactly this string — no template suffix is added.
    const rendered = seoTitle || title
    expect(rendered).toBeDefined()
    expect({ slug, length: rendered!.length }).toEqual({ slug, length: expect.any(Number) })
    expect(rendered!.length).toBeLessThanOrEqual(MAX_TITLE)
  })

  it.each(articles)('$slug has a description between 70 and 160 chars', ({ description }) => {
    expect(description).toBeDefined()
    expect(description!.length).toBeGreaterThanOrEqual(MIN_DESCRIPTION)
    expect(description!.length).toBeLessThanOrEqual(MAX_DESCRIPTION)
  })

  it('keeps the on-page H1 (title) intact even when a short seoTitle exists', () => {
    // seoTitle must never be used as a substitute for having a real title.
    for (const { slug, title } of articles) {
      expect(typeof title).toBe('string')
      expect(title!.length).toBeGreaterThan(0)
      expect(slug.length).toBeGreaterThan(0)
    }
  })
})

describe('static page SERP metadata length', () => {
  const pages = readStaticPageMetadata(PUBLIC_APP_DIR)

  it('finds static pages to check', () => {
    expect(pages.length).toBeGreaterThan(0)
  })

  it('keeps every absolute title within 60 chars', () => {
    const tooLong = pages
      .filter((p) => p.title && p.title.length > MAX_TITLE)
      .map((p) => ({ file: p.file, length: p.title!.length }))
    expect(tooLong).toEqual([])
  })

  it('keeps every description within 160 chars', () => {
    const tooLong = pages
      .filter((p) => p.description && p.description.length > MAX_DESCRIPTION)
      .map((p) => ({ file: p.file, length: p.description!.length }))
    expect(tooLong).toEqual([])
  })
})
