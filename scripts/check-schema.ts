import { extractJsonLd, validateSchemaRoots } from '../lib/schema-validation'

const baseUrl = (process.argv[2] || 'https://www.winningadventure.com.au').replace(/\/$/, '')

async function main() {
  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`)
  if (!sitemapResponse.ok) throw new Error(`sitemap returned ${sitemapResponse.status}`)

  const sitemap = await sitemapResponse.text()
  const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
    const url = new URL(match[1])
    return `${url.pathname}${url.search}`
  })
  const failures: string[] = []

  for (const path of paths) {
    const response = await fetch(`${baseUrl}${path}`)
    if (!response.ok) {
      failures.push(`${path}: HTTP ${response.status}`)
      continue
    }

    try {
      const schemas = extractJsonLd(await response.text())
      if (schemas.length === 0) failures.push(`${path}: no JSON-LD`)
      failures.push(...validateSchemaRoots(schemas).map((error) => `${path}: ${error}`))
    } catch (error) {
      failures.push(`${path}: invalid JSON-LD: ${error instanceof Error ? error.message : error}`)
    }
  }

  if (failures.length) {
    console.error(failures.join('\n'))
    process.exitCode = 1
    return
  }

  console.log(`PASS: ${paths.length} sitemap pages contain valid, consistent JSON-LD`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
