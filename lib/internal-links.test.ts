import fs from 'node:fs'
import path from 'node:path'

import { GONE_SLUGS, isBlogGoneSlug, isGonePath } from './gone-paths'

/**
 * Guards against the broken-internal-link class of SEO regressions.
 *
 * Every root-relative link written into blog MDX must resolve to a route that
 * actually exists and is not retired (410) — a 2026-08 audit found 22 dead
 * links, all of them pointing at either a retired bare-city slug (/adelaide,
 * which is in GONE_SLUGS) or an article that was never published.
 */

const PROJECT_ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(PROJECT_ROOT, 'content', 'blog')
const APP_DIR = path.join(PROJECT_ROOT, 'app', '(public)')

/** Markdown links whose href starts with a single slash. */
const MD_LINK = /\]\((\/[^)\s#?]*)/g

/** Routes served outside app/(public) or generated from data, not from a page.tsx. */
const DYNAMIC_ROUTE_PREFIXES = ['/article/', '/locations/', '/industries/', '/client/', '/factory/']

function collectStaticRoutes(dir: string, prefix = ''): Set<string> {
  const routes = new Set<string>()
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      if (/^page\.(tsx|ts|jsx|js|mdx)$/.test(entry.name)) routes.add(prefix || '/')
      continue
    }
    // Route groups like (public) do not contribute a path segment.
    const segment = entry.name.startsWith('(') ? '' : `/${entry.name}`
    for (const r of collectStaticRoutes(path.join(dir, entry.name), prefix + segment)) routes.add(r)
  }
  return routes
}

function collectBlogSlugs(): Set<string> {
  return new Set(
    fs
      .readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, '')),
  )
}

function collectMdxLinks(): { file: string; href: string }[] {
  const out: { file: string; href: string }[] = []
  for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))) {
    const source = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
    for (const match of source.matchAll(MD_LINK)) out.push({ file, href: match[1] })
  }
  return out
}

describe('internal links in blog MDX', () => {
  const staticRoutes = collectStaticRoutes(APP_DIR)
  const blogSlugs = collectBlogSlugs()
  const links = collectMdxLinks()

  it('finds links to check', () => {
    expect(links.length).toBeGreaterThan(0)
  })

  it('never points at a retired (410) path', () => {
    const dead = links.filter(({ href }) => isGonePath(href))
    expect(dead).toEqual([])
  })

  it('never points at a retired blog slug', () => {
    const dead = links
      .filter(({ href }) => href.startsWith('/article/'))
      .filter(({ href }) => isBlogGoneSlug(href.slice('/article/'.length)))
    expect(dead).toEqual([])
  })

  it('only references articles that exist', () => {
    const missing = links
      .filter(({ href }) => href.startsWith('/article/'))
      .filter(({ href }) => {
        const slug = href.slice('/article/'.length)
        // /article/faq and /article/china-sourcing-agent are hand-built routes.
        return !blogSlugs.has(slug) && !staticRoutes.has(href)
      })
    expect(missing).toEqual([])
  })

  it('only references routes that exist', () => {
    const missing = links.filter(({ href }) => {
      if (href.startsWith('/_next') || href.startsWith('/social') || href.startsWith('/api')) return false
      if (DYNAMIC_ROUTE_PREFIXES.some((p) => href.startsWith(p))) return false
      return !staticRoutes.has(href)
    })
    expect(missing).toEqual([])
  })

  it('keeps the bare-city slugs retired so links must use /locations/<city>', () => {
    // Regression guard: the 2026-08 audit found /adelaide, /perth and
    // /melbourne linked from MDX while all three are 410.
    for (const slug of ['/adelaide', '/perth', '/melbourne', '/sydney', '/brisbane']) {
      expect(GONE_SLUGS).toContain(slug)
    }
  })
})
