import { buildArticleSchema, buildOrganizationSchema, buildServiceSchema } from './schema'
import { extractJsonLd, validateSchemaRoots } from './schema-validation'

describe('schema validation', () => {
  it('extracts server-rendered JSON-LD', () => {
    const html = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>`

    expect(extractJsonLd(html)).toEqual([
      { '@context': 'https://schema.org', '@type': 'WebSite' },
    ])
  })

  it('accepts the canonical organization, service and article schemas', () => {
    const schemas = [
      buildOrganizationSchema(),
      buildServiceSchema({
        name: 'Factory Audit',
        description: 'On-site factory audit.',
        url: 'https://www.winningadventure.com.au/factory-audit-china',
        areaServed: { '@type': 'Country', name: 'Australia' },
      }),
      buildArticleSchema({
        title: 'Guide',
        description: 'Guide description',
        url: 'https://www.winningadventure.com.au/article/guide',
        author: 'Andy Liu',
        datePublished: '2026-01-01',
        image: '/guide.webp',
        wordCount: 1000,
      }),
    ]

    expect(validateSchemaRoots(schemas)).toEqual([])
  })

  it('rejects deprecated, relative and disconnected schemas', () => {
    const schemas = [
      { '@context': 'https://schema.org', '@type': 'FAQPage' },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': '/service#service',
        name: 'Bad service',
        provider: { '@id': '/company' },
      },
      { '@context': 'https://schema.org', '@type': 'Article', timeToRead: 1 },
    ]

    expect(validateSchemaRoots(schemas)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('FAQPage'),
        expect.stringContaining('relative URL'),
        expect.stringContaining('canonical organization'),
        expect.stringContaining('timeToRead'),
        expect.stringContaining('missing headline'),
      ]),
    )
  })
})
