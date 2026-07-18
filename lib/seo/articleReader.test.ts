import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { ArticleValidationError } from './articleSchema'
import {
  assertArticlesReadable,
  collectArticleCompatibilityReport,
  listArticleSlugs,
  listArticleSummaries,
  readAllArticles,
  readArticle,
} from './articleReader'

const PROJECT_ROOT = path.resolve(__dirname, '../..')
const LIVE_BLOG = path.join(PROJECT_ROOT, 'content/blog')
const FIXTURE_DIR = path.join(PROJECT_ROOT, 'content/seo/fixtures/articles')

function makeTempBlog(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wag-article-reader-'))
  for (const [relative, contents] of Object.entries(files)) {
    const absolute = path.join(dir, relative)
    fs.mkdirSync(path.dirname(absolute), { recursive: true })
    fs.writeFileSync(absolute, contents)
  }
  return dir
}

describe('articleReader', () => {
  it('loads all live articles through one reader without hard failures', () => {
    const corpus = readAllArticles({
      blogDir: LIVE_BLOG,
      mode: 'compatibility',
    })

    const slugs = corpus.articles.map((article) => article.slug)
    expect(slugs.length).toBeGreaterThan(0)
    expect(slugs).toEqual(listArticleSlugs({ blogDir: LIVE_BLOG }))

    expect(slugs).toEqual([...slugs].sort((a, b) => a.localeCompare(b)))
    expect(slugs).toContain('check-chinese-company-samr')
    expect(slugs).toContain('verify-chinese-supplier')

    for (const article of corpus.articles) {
      expect(article.frontmatter.title.length).toBeGreaterThan(0)
      expect(article.frontmatter.description.length).toBeGreaterThan(0)
      expect(article.content.length).toBeGreaterThan(0)
      expect(article.frontmatter.contentId).toMatch(/^article\./)
    }
  })

  it('is deterministic across repeated runs on an unchanged corpus', () => {
    const first = readAllArticles({ blogDir: LIVE_BLOG, mode: 'compatibility' })
    const second = readAllArticles({ blogDir: LIVE_BLOG, mode: 'compatibility' })

    expect(first.articles.map((a) => a.slug)).toEqual(
      second.articles.map((a) => a.slug),
    )
    expect(first.articles.map((a) => a.frontmatter.title)).toEqual(
      second.articles.map((a) => a.frontmatter.title),
    )
    expect(
      first.warnings.map((w) => `${w.articleId}|${w.field}|${w.code}|${w.message}`),
    ).toEqual(
      second.warnings.map((w) => `${w.articleId}|${w.field}|${w.code}|${w.message}`),
    )
  })

  it('surfaces compatibility warnings for the live legacy corpus', () => {
    const report = collectArticleCompatibilityReport({ blogDir: LIVE_BLOG })

    expect(report.articlesMissingGovernedFields).not.toContain(
      'article.check-chinese-company-samr',
    )
    expect(report.warnings.some((w) => w.code === 'missing_governed_field')).toBe(
      true,
    )
  })

  it('reads a single live article with equivalent display metadata', () => {
    const article = readArticle('check-chinese-company-samr', {
      blogDir: LIVE_BLOG,
      mode: 'compatibility',
    })

    expect(article).not.toBeNull()
    expect(article!.frontmatter.title).toContain('SAMR')
    expect(article!.frontmatter.author).toBe('Andy Liu')
    expect(article!.frontmatter.coverImage).toContain('check-chinese-company-samr')
    expect(article!.content).toContain('Unified Social Credit')
  })

  it('returns null for gone or missing slugs without throwing', () => {
    expect(
      readArticle('china-factory-tours-australia', {
        blogDir: LIVE_BLOG,
        mode: 'compatibility',
      }),
    ).toBeNull()
    expect(
      readArticle('does-not-exist-article', {
        blogDir: LIVE_BLOG,
        mode: 'compatibility',
      }),
    ).toBeNull()
  })

  it('refuses to silently publish a deliberately invalid fixture', () => {
    const blogDir = makeTempBlog({
      'invalid-missing-title.mdx': fs.readFileSync(
        path.join(FIXTURE_DIR, 'invalid-missing-title.mdx'),
        'utf8',
      ),
      'valid-legacy.mdx': fs.readFileSync(
        path.join(FIXTURE_DIR, 'valid-legacy.mdx'),
        'utf8',
      ),
    })

    expect(() =>
      readArticle('invalid-missing-title', { blogDir, mode: 'compatibility' }),
    ).toThrow(ArticleValidationError)

    try {
      assertArticlesReadable({ blogDir, mode: 'compatibility' })
      throw new Error('expected assertArticlesReadable to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(ArticleValidationError)
      const validationError = error as ArticleValidationError
      expect(validationError.articleId).toBe('invalid-missing-title')
      expect(validationError.message).toContain('title')
    }

    // Valid sibling remains readable in isolation.
    const valid = readArticle('valid-legacy', { blogDir, mode: 'compatibility' })
    expect(valid?.frontmatter.title).toBe('Valid Legacy Fixture')
  })

  it('exposes list summaries for listing and sitemap consumers', () => {
    const { articles, warnings } = listArticleSummaries({
      blogDir: LIVE_BLOG,
      mode: 'compatibility',
    })

    expect(articles.length).toBeGreaterThan(1)
    expect(articles.map((article) => article.slug)).toEqual(
      listArticleSlugs({ blogDir: LIVE_BLOG }),
    )
    expect(articles[0].slug <= articles[1].slug).toBe(true)
    expect(articles.every((a) => a.description.length > 0)).toBe(true)
    expect(warnings.length).toBeGreaterThan(0)
  })
})
