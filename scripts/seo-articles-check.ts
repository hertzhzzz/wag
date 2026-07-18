#!/usr/bin/env tsx
/**
 * Compatibility report for the unified article reader.
 * Exit 0 when all articles are readable (warnings allowed).
 * Exit 1 on hard validation failures.
 */
import { collectArticleCompatibilityReport } from '../lib/seo/articleReader'
import { ArticleValidationError } from '../lib/seo/articleSchema'

function main() {
  try {
    const report = collectArticleCompatibilityReport({ mode: 'compatibility' })

    console.log(`Articles readable: ${report.articleCount}`)
    console.log(`Compatibility warnings: ${report.warnings.length}`)
    console.log(
      `Articles missing governed fields: ${report.articlesMissingGovernedFields.length}`,
    )

    const byCode = new Map<string, number>()
    for (const warning of report.warnings) {
      byCode.set(warning.code, (byCode.get(warning.code) ?? 0) + 1)
    }
    for (const [code, count] of [...byCode.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      console.log(`  ${code}: ${count}`)
    }

    // Sample a few warnings for operator visibility.
    for (const warning of report.warnings.slice(0, 5)) {
      console.log(
        `  - [${warning.code}] ${warning.articleId}.${warning.field}: ${warning.message}`,
      )
    }
    if (report.warnings.length > 5) {
      console.log(`  ... ${report.warnings.length - 5} more`)
    }

    process.exit(0)
  } catch (error) {
    if (error instanceof ArticleValidationError) {
      console.error(error.message)
      for (const issue of error.issues) {
        console.error(`  - ${issue}`)
      }
      process.exit(1)
    }
    throw error
  }
}

main()
