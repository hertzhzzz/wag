import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

import { isBlogGoneSlug } from '@/lib/gone-paths'
import {
  ArticleValidationError,
  type ArticleCompatibilityWarning,
  type ArticleValidationMode,
  type NormalizedArticleFrontmatter,
  parseArticleFrontmatter,
} from './articleSchema'

export interface ArticleReaderOptions {
  /** Absolute or cwd-relative path to content/blog. Defaults to `<cwd>/content/blog`. */
  blogDir?: string
  /** compatibility (default) or strict governed contract. */
  mode?: ArticleValidationMode
  /** Include BLOG_GONE_SLUGS. Default false. */
  includeGone?: boolean
  /** Project root for resolving default blog dir. Defaults to process.cwd(). */
  projectRoot?: string
}

export interface ValidatedArticle {
  slug: string
  sourcePath: string
  frontmatter: NormalizedArticleFrontmatter
  content: string
  warnings: ArticleCompatibilityWarning[]
}

export interface ArticleSummary {
  slug: string
  title: string
  category: string
  date: string
  updatedDate?: string
  readTime: string
  coverImage?: string
  desc?: string
  description: string
  featured?: boolean
  author: string
  contentId: string
}

export interface ArticleCorpus {
  articles: ValidatedArticle[]
  warnings: ArticleCompatibilityWarning[]
}

function resolveBlogDir(options: ArticleReaderOptions = {}): string {
  if (options.blogDir) {
    if (path.isAbsolute(options.blogDir)) return options.blogDir

    return path.join(
      /* turbopackIgnore: true */ options.projectRoot ?? process.cwd(),
      options.blogDir,
    )
  }

  if (options.projectRoot) {
    return path.join(
      /* turbopackIgnore: true */ options.projectRoot,
      'content/blog',
    )
  }

  return path.join(process.cwd(), 'content', 'blog')
}

function compareSlug(a: string, b: string): number {
  return a.localeCompare(b)
}

function compareWarning(
  a: ArticleCompatibilityWarning,
  b: ArticleCompatibilityWarning,
): number {
  if (a.articleId !== b.articleId) return a.articleId.localeCompare(b.articleId)
  if (a.field !== b.field) return a.field.localeCompare(b.field)
  if (a.code !== b.code) return a.code.localeCompare(b.code)
  return a.message.localeCompare(b.message)
}

/**
 * Recursively discover MDX article paths under the blog directory.
 * Returns absolute paths sorted by route slug for deterministic scans.
 */
export function discoverArticleFiles(options: ArticleReaderOptions = {}): Array<{
  slug: string
  absolutePath: string
}> {
  const blogDir = resolveBlogDir(options)
  const includeGone = options.includeGone === true
  const results: Array<{ slug: string; absolutePath: string }> = []

  function scan(dir: string): void {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    // Stable directory walk: sort names before recursion.
    entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        scan(fullPath)
        continue
      }
      if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue
      const relative = path.relative(blogDir, fullPath).replace(/\\/g, '/')
      const slug = relative.replace(/\.mdx$/, '')
      if (!includeGone && isBlogGoneSlug(slug)) continue
      results.push({ slug, absolutePath: fullPath })
    }
  }

  scan(blogDir)
  results.sort((a, b) => compareSlug(a.slug, b.slug))
  return results
}

export function listArticleSlugs(options: ArticleReaderOptions = {}): string[] {
  return discoverArticleFiles(options).map((entry) => entry.slug)
}

function loadAndValidateFile(
  slug: string,
  absolutePath: string,
  mode: ArticleValidationMode,
): ValidatedArticle {
  const raw = fs.readFileSync(absolutePath, 'utf8')
  const { data, content } = matter(raw)
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ArticleValidationError(slug, 'frontmatter', [
      'frontmatter must be a YAML mapping',
    ])
  }

  const { frontmatter, warnings } = parseArticleFrontmatter(
    data as Record<string, unknown>,
    slug,
    mode,
  )

  return {
    slug,
    sourcePath: absolutePath,
    frontmatter,
    content,
    warnings,
  }
}

/**
 * Read one article by route slug. Returns null when the file is missing or gone.
 * Throws ArticleValidationError when required fields are invalid.
 */
export function readArticle(
  slug: string,
  options: ArticleReaderOptions = {},
): ValidatedArticle | null {
  if (!options.includeGone && isBlogGoneSlug(slug)) return null

  const blogDir = resolveBlogDir(options)
  const absolutePath = path.join(blogDir, `${slug}.mdx`)
  if (!fs.existsSync(absolutePath)) return null

  return loadAndValidateFile(slug, absolutePath, options.mode ?? 'compatibility')
}

/**
 * Load the full validated corpus. Deterministic article and warning order.
 * Throws on the first hard validation failure.
 */
export function readAllArticles(options: ArticleReaderOptions = {}): ArticleCorpus {
  const mode = options.mode ?? 'compatibility'
  const articles: ValidatedArticle[] = []
  const warnings: ArticleCompatibilityWarning[] = []

  for (const entry of discoverArticleFiles(options)) {
    const article = loadAndValidateFile(entry.slug, entry.absolutePath, mode)
    articles.push(article)
    warnings.push(...article.warnings)
  }

  warnings.sort(compareWarning)
  return { articles, warnings }
}

export function toArticleSummary(article: ValidatedArticle): ArticleSummary {
  const { frontmatter, slug } = article
  return {
    slug,
    title: frontmatter.title,
    category: frontmatter.category,
    date: String(frontmatter.date),
    updatedDate: frontmatter.updatedDate
      ? String(frontmatter.updatedDate)
      : undefined,
    readTime: frontmatter.readTime,
    coverImage: frontmatter.coverImage,
    desc: frontmatter.desc,
    description: frontmatter.description,
    featured: frontmatter.featured,
    author: frontmatter.author,
    contentId: frontmatter.contentId,
  }
}

/**
 * Summaries for listing surfaces. Deterministic slug order; callers may re-sort
 * for presentation (e.g. impression order on /article).
 */
export function listArticleSummaries(
  options: ArticleReaderOptions = {},
): { articles: ArticleSummary[]; warnings: ArticleCompatibilityWarning[] } {
  const corpus = readAllArticles(options)
  return {
    articles: corpus.articles.map(toArticleSummary),
    warnings: corpus.warnings,
  }
}

/**
 * Assert every on-disk article is readable under the chosen mode.
 * Useful for CI / release gates.
 */
export function assertArticlesReadable(options: ArticleReaderOptions = {}): ArticleCorpus {
  return readAllArticles(options)
}

/**
 * Collect compatibility warnings without throwing when mode is compatibility.
 * Hard validation failures still throw.
 */
export function collectArticleCompatibilityReport(
  options: ArticleReaderOptions = {},
): {
  articleCount: number
  warnings: ArticleCompatibilityWarning[]
  articlesMissingGovernedFields: string[]
} {
  const corpus = readAllArticles({ ...options, mode: options.mode ?? 'compatibility' })
  const missing = new Set<string>()
  for (const warning of corpus.warnings) {
    if (warning.code === 'missing_governed_field') {
      missing.add(warning.articleId)
    }
  }
  return {
    articleCount: corpus.articles.length,
    warnings: corpus.warnings,
    articlesMissingGovernedFields: [...missing].sort(compareSlug),
  }
}
