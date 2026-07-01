import { ORGANIZATION_ID } from './schema'

type JsonObject = Record<string, unknown>

const BANNED_TYPES = new Set(['FAQPage', 'HowTo', 'AggregateRating'])
const URL_KEYS = new Set(['@id', 'url', 'image', 'logo', 'sameAs', 'mainEntityOfPage'])

export function extractJsonLd(html: string): JsonObject[] {
  const scripts = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )

  return [...scripts].flatMap((match) => {
    const value = JSON.parse(match[1]) as JsonObject | JsonObject[]
    return Array.isArray(value) ? value : [value]
  })
}

export function validateSchemaRoots(roots: JsonObject[]): string[] {
  const errors: string[] = []

  const visit = (value: unknown, path: string) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`))
      return
    }
    if (!value || typeof value !== 'object') return

    const object = value as JsonObject
    const rawType = object['@type']
    const types = Array.isArray(rawType) ? rawType : rawType ? [rawType] : []

    for (const type of types) {
      if (typeof type === 'string' && BANNED_TYPES.has(type)) {
        errors.push(`${path}: banned schema type ${type}`)
      }
    }

    if ('timeToRead' in object) errors.push(`${path}: unsupported timeToRead property`)

    if (types.includes('Organization') && object['@id'] && object['@id'] !== ORGANIZATION_ID) {
      errors.push(`${path}: Organization must use the canonical organization @id`)
    }

    if (types.includes('Service')) {
      const provider = object.provider as JsonObject | undefined
      if (provider?.['@id'] !== ORGANIZATION_ID) {
        errors.push(`${path}: Service provider must reference the canonical organization`)
      }
    }

    if (types.includes('Article') || types.includes('BlogPosting')) {
      for (const field of ['headline', 'author', 'datePublished', 'image', 'publisher']) {
        if (!object[field]) errors.push(`${path}: Article missing ${field}`)
      }
    }

    for (const [key, child] of Object.entries(object)) {
      if (URL_KEYS.has(key) && typeof child === 'string' && child.startsWith('/')) {
        errors.push(`${path}.${key}: relative URL ${child}`)
      }
      visit(child, `${path}.${key}`)
    }
  }

  roots.forEach((root, index) => visit(root, `schema[${index}]`))
  return errors
}
