import {
  ORGANIZATION_ID,
  ANDY_ID,
  buildOrganizationSchema,
  buildAndySchema,
  buildArticleSchema,
  buildWebSiteSchema,
  buildServiceSchema,
} from './schema'
import fs from 'node:fs'
import path from 'node:path'

describe('schema builders', () => {
  it('uses one canonical organization id and omits unverified facts', () => {
    const schema = buildOrganizationSchema()

    expect(schema['@id']).toBe('https://www.winningadventure.com.au/#organization')
    expect(schema.hasOfferCatalog.url).toBe('https://www.winningadventure.com.au/services')
    expect(schema).not.toHaveProperty('foundingDate')
    expect(schema).not.toHaveProperty('geo')
  })

  it('links services to the canonical organization', () => {
    const schema = buildServiceSchema({
      name: 'Factory Audit in China',
      description: 'On-site factory audit for Australian importers.',
      url: 'https://www.winningadventure.com.au/factory-audit-china',
      areaServed: { '@type': 'Country', name: 'Australia' },
    })

    expect(schema['@id']).toBe(
      'https://www.winningadventure.com.au/factory-audit-china#service',
    )
    expect(schema.provider).toEqual({ '@id': ORGANIZATION_ID })
  })

  it('renders the shared organization without conflicting global people or facts', () => {
    const layout = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')

    expect(layout).toContain('buildOrganizationSchema')
    expect(layout).not.toContain('MarkHeSchema')
    expect(layout).not.toContain('foundingDate')
    expect(layout).not.toContain('GeoCoordinates')
    expect(layout).not.toContain('winningadventure.com.au/solutions')
  })

  it('identifies Andy only on the about page without a fake personal social profile', () => {
    const schema = buildAndySchema()

    expect(schema['@id']).toBe(ANDY_ID)
    expect(schema.mainEntityOfPage).toBe('https://www.winningadventure.com.au/about')
    expect(schema.worksFor).toEqual({ '@id': ORGANIZATION_ID })
    expect(schema).not.toHaveProperty('sameAs')
  })

  it('routes every service page through the shared service schema', () => {
    const files = [
      'app/(public)/supplier-verification/page.tsx',
      'app/(public)/factory-audit-china/FactoryAuditContent.tsx',
      'app/(public)/quality-inspection-china/page.tsx',
      'app/(public)/locations/[city]/page.tsx',
      'app/(public)/industries/[industry]/page.tsx',
      'app/(public)/article/china-sourcing-agent/page.tsx',
    ]

    for (const file of files) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
      expect(source).toContain('<ServiceSchema')
      expect(source).toMatch(/<ServiceSchema[\s\S]*?url=/)
      expect(source).not.toContain('const serviceSchema =')
    }
  })

  it('emits truthful article authors, reading time and publisher references', () => {
    const schema = buildArticleSchema({
      title: 'How to Verify a Chinese Supplier',
      description: 'A practical verification guide.',
      url: 'https://www.winningadventure.com.au/article/verify-chinese-supplier',
      author: 'Mark He',
      datePublished: '2026-03-08',
      dateModified: '2026-06-30',
      image: '/social/blog/verify-chinese-supplier/cover.png',
      wordCount: 1800,
    })

    expect(schema.image.url).toBe(
      'https://www.winningadventure.com.au/social/blog/verify-chinese-supplier/cover.png',
    )
    expect(schema.publisher).toEqual({ '@id': ORGANIZATION_ID })
    expect(schema.author).toMatchObject({ '@type': 'Person', name: 'Mark He' })
    expect(schema.author).not.toHaveProperty('sameAs')
    expect(schema.wordCount).toBe(1800)
    expect(schema.timeRequired).toBe('PT9M')
    expect(schema).not.toHaveProperty('timeToRead')
  })

  it('does not advertise a site search that does not exist', () => {
    const schema = buildWebSiteSchema()

    expect(schema['@id']).toBe('https://www.winningadventure.com.au/#website')
    expect(schema.publisher).toEqual({ '@id': ORGANIZATION_ID })
    expect(schema.inLanguage).toBe('en-AU')
    expect(schema).not.toHaveProperty('potentialAction')
  })

  it('uses the site image when an article has no cover image', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'app/(public)/article/[slug]/ArticlePageContent.tsx'),
      'utf8',
    )

    expect(source).toContain("image={fm.coverImage || '/og-image.webp'}")
  })
})
