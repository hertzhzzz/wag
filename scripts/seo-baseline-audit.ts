import fs from 'node:fs'
import path from 'node:path'

import {
  assertPublishingSafety,
  assertSeoReleaseSafety,
  buildSeoBaselineAudit,
  renderArticleInventoryYaml,
  renderBaselineMarkdown,
} from '../lib/seo-baseline-audit'

const projectRoot = path.resolve(__dirname, '..')
const inventoryPath = path.join(
  projectRoot,
  'content/seo/migrations/2026-07-17-article-inventory.yaml',
)
const baselinePath = path.join(projectRoot, 'docs/seo/2026-07-17-baseline.md')

function expectedArtifacts() {
  const audit = buildSeoBaselineAudit(projectRoot)
  assertPublishingSafety(audit, projectRoot)
  return [
    { path: inventoryPath, content: renderArticleInventoryYaml(audit) },
    { path: baselinePath, content: renderBaselineMarkdown(audit) },
  ]
}

function checkReleaseSafety(): void {
  const audit = buildSeoBaselineAudit(projectRoot)

  try {
    assertSeoReleaseSafety(audit, projectRoot)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
    return
  }

  console.log('SEO release-safety checks passed: publishing paths are classified and scheduler evidence is fresh, complete, and bound to current definitions.')
}

function writeArtifacts(): void {
  for (const artifact of expectedArtifacts()) {
    fs.mkdirSync(path.dirname(artifact.path), { recursive: true })
    fs.writeFileSync(artifact.path, artifact.content, 'utf8')
    console.log(`wrote ${path.relative(projectRoot, artifact.path)}`)
  }
}

function checkArtifacts(): void {
  const stale: string[] = []

  for (const artifact of expectedArtifacts()) {
    const actual = fs.existsSync(artifact.path) ? fs.readFileSync(artifact.path, 'utf8') : null
    if (actual !== artifact.content) stale.push(path.relative(projectRoot, artifact.path))
  }

  if (stale.length > 0) {
    console.error(`SEO baseline artifacts are missing or stale:\n${stale.map((item) => `- ${item}`).join('\n')}`)
    console.error('Run npm run seo:baseline:write after intentionally reviewing repository changes.')
    process.exitCode = 1
    return
  }

  console.log('SEO baseline artifacts match the current repository inventory.')
}

const argumentsSet = new Set(process.argv.slice(2))
const selectedModes = ['--write', '--check', '--release-safety'].filter((mode) => argumentsSet.has(mode))
if (selectedModes.length > 1) {
  throw new Error('Choose one of --write, --check, or --release-safety.')
}

if (argumentsSet.has('--write')) {
  writeArtifacts()
} else if (argumentsSet.has('--release-safety')) {
  checkReleaseSafety()
} else {
  checkArtifacts()
}
