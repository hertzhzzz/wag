export const SITE_URL = 'https://www.winningadventure.com.au'
export const ORGANIZATION_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const ANDY_ID = `${SITE_URL}/about#andy-liu`
export const MARK_ID = `${SITE_URL}/#mark-he`

export type AreaServed = {
  '@type': 'Country' | 'City'
  name: string
}

export type ServiceSchemaInput = {
  name: string
  description: string
  url: string
  areaServed: AreaServed
  serviceType?: string | string[]
}

export type ArticleSchemaInput = {
  title: string
  description: string
  url: string
  author: string
  datePublished: string
  dateModified?: string
  image: string
  category?: string
  tags?: string[]
  wordCount: number
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': ORGANIZATION_ID,
    name: 'Winning Adventure Global',
    legalName: 'WINNING ADVENTURE GLOBAL PTY LTD',
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/logos/logo.png` },
    description:
      'Australia-based China sourcing, supplier verification, factory audit and quality inspection services for Australian importers.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '5/54 Melbourne St',
      addressLocality: 'North Adelaide',
      addressRegion: 'SA',
      postalCode: '5006',
      addressCountry: 'AU',
    },
    telephone: '+61-416-588-198',
    email: 'info@winningadventure.com.au',
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'ABN', value: '94 697 886 150' },
      { '@type': 'PropertyValue', propertyID: 'ACN', value: '697 886 150' },
    ],
    areaServed: { '@type': 'Country', name: 'Australia' },
    founder: { '@id': ANDY_ID },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'China Sourcing Services',
      url: `${SITE_URL}/services`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+61-416-588-198',
      contactType: 'sales',
      areaServed: 'AU',
      availableLanguage: ['English', 'Mandarin', 'Cantonese'],
    },
    sameAs: [
      'https://www.linkedin.com/company/winning-adventure-global',
      'https://www.facebook.com/winningadventureglobal',
      'https://www.instagram.com/winningadventureglobal',
    ],
  }
}

export function buildAndySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': ANDY_ID,
    name: 'Andy Liu',
    jobTitle: 'Founder',
    description:
      'Founder of Winning Adventure Global, helping Australian businesses source from verified Chinese manufacturers.',
    mainEntityOfPage: `${SITE_URL}/about`,
    worksFor: { '@id': ORGANIZATION_ID },
  }
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Winning Adventure Global',
    url: `${SITE_URL}/`,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-AU',
  }
}

export function buildServiceSchema(input: ServiceSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${input.url}#service`,
    ...input,
    provider: { '@id': ORGANIZATION_ID },
  }
}

export function buildArticleSchema(input: ArticleSchemaInput) {
  const authorId = input.author === 'Andy Liu' ? ANDY_ID : MARK_ID
  const imageUrl = input.image.startsWith('http')
    ? input.image
    : `${SITE_URL}${input.image}`

  return {
    '@context': 'https://schema.org',
    '@type': ['Article', 'BlogPosting'],
    headline: input.title,
    description: input.description,
    url: input.url,
    author: {
      '@type': 'Person',
      '@id': authorId,
      name: input.author,
      worksFor: { '@id': ORGANIZATION_ID },
    },
    publisher: { '@id': ORGANIZATION_ID },
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    articleSection: input.category,
    keywords: input.tags?.join(', '),
    wordCount: input.wordCount,
    timeRequired: `PT${Math.max(1, Math.ceil(input.wordCount / 200))}M`,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
  }
}
