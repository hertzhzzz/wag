import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'

import { stringify } from 'yaml'

import {
  assertPublishingSafety,
  assertSeoReleaseSafety,
  buildSeoBaselineAudit,
  compareCodePoints,
  findUnclassifiedPublishingCandidates,
  renderArticleInventoryYaml,
  renderBaselineMarkdown,
  verifySchedulerSnapshotReleaseSafety,
} from './seo-baseline-audit'

const PROJECT_ROOT = path.resolve(__dirname, '..')
const VERCEL_COMMAND = ['ver', 'cel'].join('')
const PRODUCTION_FLAG = ['--pr', 'od'].join('')
const PRODUCTION_TARGET = ['produc', 'tion'].join('')
const VERCEL_DEPLOYMENTS_API = ['https://api.ver', 'cel.com/v13/deploy', 'ments'].join('')
const VERCEL_ACTION = ['amondnet/ver', 'cel-action@v25'].join('')

const SCHEDULER_TASK_FIXTURES = [
  { id: 'seo-purge-remaining-410', enabled: false, fireAt: 1783553400000 },
  { id: 'seo-reindex-updated-pages', enabled: false, fireAt: 1783554300000 },
  { id: 'wag-daily-analytics', enabled: true, cronExpression: '0 8 * * *' },
  { id: 'wag-google-ads-daily-insight', enabled: true, cronExpression: '0 9 * * *' },
] as const

function writeSchedulerReleaseFixture(projectRoot: string, homeRoot: string): string {
  const scheduledTasks = SCHEDULER_TASK_FIXTURES.map((task) => {
    const relativeDefinitionPath = `Claude/Scheduled/${task.id}/SKILL.md`
    const definitionPath = path.join(homeRoot, relativeDefinitionPath)
    const definition = `# ${task.id}\n`
    fs.mkdirSync(path.dirname(definitionPath), { recursive: true })
    fs.writeFileSync(definitionPath, definition)

    return {
      ...task,
      filePath: `~/${relativeDefinitionPath}`,
      definitionSha256: crypto.createHash('sha256').update(definition).digest('hex'),
    }
  })

  const snapshotPath = path.join(projectRoot, 'content/seo/evidence/2026-07-17-scheduler-state.yaml')
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true })
  fs.writeFileSync(snapshotPath, stringify({
    auditDate: '2026-07-17',
    capturedAt: '2026-07-17T05:59:33Z',
    taskCount: scheduledTasks.length,
    scheduledTasks,
  }))

  const registryPath = path.join(projectRoot, 'scheduled-tasks.json')
  fs.writeFileSync(registryPath, JSON.stringify({
    scheduledTasks: scheduledTasks.map((task) => ({
      ...Object.fromEntries(Object.entries(task).filter(([key]) => key !== 'definitionSha256')),
      filePath: path.join(homeRoot, task.filePath.replace(/^~\//, '')),
    })),
  }, null, 2))

  return registryPath
}

describe('SEO baseline and publishing safety audit', () => {
  const audit = buildSeoBaselineAudit(PROJECT_ROOT)

  it('accounts for exactly 23 live articles and four legacy cluster sources', () => {
    expect(audit.articles).toHaveLength(23)
    expect(audit.legacyClusters.map((cluster) => cluster.path)).toEqual([
      'content/clusters/china-sourcing-strategy-cluster.yaml',
      'content/clusters/factory-tour-cluster.yaml',
      'content/clusters/retail-import-cluster.yaml',
      'content/clusters/supply-chain-trade-cluster.yaml',
    ])

    for (const cluster of audit.legacyClusters) {
      expect(cluster.references.every((reference) => reference.inventoryStatus !== 'unaccounted')).toBe(true)
    }

    const legacyStatusCounts = audit.legacyClusters
      .flatMap((cluster) => cluster.references)
      .reduce<Record<string, number>>((counts, reference) => {
        counts[reference.inventoryStatus] = (counts[reference.inventoryStatus] ?? 0) + 1
        return counts
      }, {})

    expect(legacyStatusCounts).toEqual({
      live: 4,
      'gone-410': 12,
      missing: 8,
      'planned-placeholder': 13,
    })
  })

  it('documents every required article discovery surface', () => {
    expect(audit.discoverySurfaces.map((surface) => surface.id).sort()).toEqual([
      'article-detail',
      'article-listing',
      'dashboard',
      'navigation',
      'recommendations',
      'sitemap',
    ])

    const recommendations = audit.discoverySurfaces.find((surface) => surface.id === 'recommendations')
    expect(recommendations?.source).toContain('ArticleNavigation.tsx')
    expect(recommendations?.source).toContain('BlogPreview.tsx')
    expect(recommendations?.source).toContain('data/link-graph.json')
    expect(recommendations?.behavior).toContain('not mounted')

    const articleRoutes = audit.articles.map((article) => article.route)
    expect([...audit.discoveryInventory.articleListingRoutes].sort(compareCodePoints)).toEqual(articleRoutes)
    expect([...audit.discoveryInventory.articleDetailRoutes].sort(compareCodePoints)).toEqual(articleRoutes)
    expect([...audit.discoveryInventory.sitemapArticleRoutes].sort(compareCodePoints)).toEqual(articleRoutes)
    expect(audit.discoveryInventory.articleListingRoutes.slice(0, 3)).toEqual([
      '/article/verify-chinese-supplier',
      '/article/china-factory-tour-guide',
      '/article/bulk-procurement-china-guide',
    ])
    expect(audit.discoveryInventory.articleDetailRoutes.slice(0, 3)).toEqual([
      '/article/bulk-procurement-china-guide',
      '/article/check-chinese-company-samr',
      '/article/china-factory-tour-guide',
    ])
    expect(audit.discoveryInventory.sitemapArticleRoutes).toEqual(audit.discoveryInventory.articleDetailRoutes)
    expect(audit.discoveryInventory.serviceRoots).toEqual([
      '/factory-audit-china',
      '/quality-inspection-china',
      '/services',
      '/supplier-verification',
      '/visiting-chinese-factories',
    ])
    expect(audit.discoveryInventory.globalArticleEntryPoints).toEqual(['/article'])
    expect(new Set(audit.discoveryInventory.recommendationEdges.map((edge) => edge.mechanism))).toEqual(new Set([
      'article-prev-next',
      'factory-link-graph',
      'homepage-top-articles',
    ]))
    expect(audit.findings.articleRoutesMissingFromListing).toEqual([])
    expect(audit.findings.articleRoutesMissingFromDetail).toEqual([])
    expect(audit.findings.articleRoutesMissingFromSitemap).toEqual([])
    expect(audit.findings.duplicateCanonicals).toEqual([])
  })

  it('records dated GSC, GA4, enquiry, indexation, and GEO measurement availability', () => {
    expect(audit.measurements.map((measurement) => measurement.id).sort()).toEqual([
      'enquiry',
      'ga4',
      'geo',
      'gsc',
      'indexation',
    ])

    for (const measurement of audit.measurements) {
      expect(measurement.asOf).toMatch(/^2026-\d{2}-\d{2}$/)
      expect(measurement.limitations.length).toBeGreaterThan(0)
    }
  })

  it('classifies known generation, scheduling, deployment, and notification paths', () => {
    const pathIds = audit.publishingPaths.map((publishingPath) => publishingPath.id)

    expect(pathIds).toEqual(expect.arrayContaining([
      'blog-generator-save',
      'seo-workflow-generate',
      'seo-workflow-schedule',
      'legacy-seo-workflow-scheduling-docs',
      'legacy-auto-publish-docs',
      'legacy-wag-seo-skill',
      'monorepo-agent-skill-publishing-guidance',
      'git-push-production-trigger',
      'vercel-git-production-deploy',
      'vercel-cli-production-deploy',
      'publishing-safety-scanner',
      'github-security-workflow',
      'daily-analytics-dashboard-deploy',
      'claude-scheduled-daily-analytics',
      'claude-scheduled-google-ads',
      'claude-scheduled-seo-purge',
      'claude-scheduled-seo-reindex',
      'cloudflare-dashboard-deploy',
      'cloudflare-dashboard-package',
      'cloudflare-dashboard-rest-fallback',
      'pipeline-db-deploy-marker',
      'indexnow-api',
      'google-indexing-single',
      'google-indexing-batch',
      'google-410-purge',
      'gsc-batch-check',
    ]))

    expect(audit.publishingPaths.find((item) => item.id === 'legacy-auto-publish-docs')).toMatchObject({
      classification: 'unattended',
      observedState: 'disabled',
      productionTarget: 'frontend',
      approvalEnforcement: 'technical',
      initiatesPublication: false,
      canPublishProduction: false,
      technicalControl: {
        state: 'enforced',
        mechanism: 'non-executable-uninstalled-documentation',
      },
    })

    expect(audit.publishingPaths.find((item) => item.id === 'indexnow-api')).toMatchObject({
      classification: 'unattended',
      observedState: 'enabled',
      productionTarget: 'none',
      approvalEnforcement: 'none',
      canPublishProduction: false,
    })

    expect(audit.publishingPaths.find((item) => item.id === 'git-push-production-trigger')).toMatchObject({
      classification: 'manual',
      observedState: 'enabled',
      productionTarget: 'frontend',
      approvalEnforcement: 'technical',
      initiatesPublication: false,
      canPublishProduction: false,
    })

    expect(audit.publishingPaths.find((item) => item.id === 'vercel-git-production-deploy')).toMatchObject({
      classification: 'unattended',
      observedState: 'disabled',
      productionTarget: 'frontend',
      approvalEnforcement: 'technical',
      initiatesPublication: false,
      canPublishProduction: false,
      technicalControl: {
        state: 'enforced',
        mechanism: 'vercel-git-deployments-disabled',
        evidence: 'vercel.json::git.deploymentEnabled=false',
      },
    })

    expect(audit.publishingPaths.find((item) => item.id === 'vercel-cli-production-deploy')).toMatchObject({
      classification: 'manual',
      observedState: 'enabled',
      productionTarget: 'frontend',
      approvalEnforcement: 'policy-only',
      initiatesPublication: true,
      canPublishProduction: true,
      technicalControl: {
        state: 'not-enforced',
        mechanism: 'explicit-manual-vercel-invocation',
      },
    })

    expect(audit.publishingPaths.find((item) => item.id === 'publishing-safety-scanner')).toMatchObject({
      kind: 'tracking',
      productionTarget: 'none',
      initiatesPublication: false,
      canPublishProduction: false,
      evidenceFiles: expect.arrayContaining([
        'lib/seo-baseline-audit.ts::capability.cloudflare-pages-deploy',
        'lib/seo-baseline-audit.ts::capability.frontend-production-deploy',
        'lib/seo-baseline-audit.ts::capability.git-push',
        'lib/seo-baseline-audit.ts::capability.indexing-notification',
      ]),
    })

    expect(audit.publishingPaths.find((item) => item.id === 'monorepo-agent-skill-publishing-guidance')).toMatchObject({
      classification: 'manual',
      observedState: 'enabled',
      productionTarget: 'frontend',
      initiatesPublication: false,
      evidenceFiles: expect.arrayContaining([
        '../.agents/skills/WAG_client/SKILL.md',
        '../.agents/skills/WAG_factory/SKILL.md',
        '../.agents/skills/WAG_seo/SKILL.md',
        '../.agents/skills/release-skills/SKILL.md',
        '../.agents/skills/supplier-report/SKILL.md',
      ]),
    })

    expect(audit.publishingPaths.find((item) => item.id === 'claude-scheduled-daily-analytics')).toMatchObject({
      classification: 'unattended',
      observedState: 'enabled',
      productionTarget: 'dashboard',
      canPublishProduction: true,
    })
    expect(audit.publishingPaths.find((item) => item.id === 'claude-scheduled-google-ads')).toMatchObject({
      classification: 'unattended',
      observedState: 'enabled',
      productionTarget: 'dashboard',
      canPublishProduction: true,
    })
    expect(audit.publishingPaths.find((item) => item.id === 'claude-scheduled-seo-purge')).toMatchObject({
      classification: 'unattended',
      observedState: 'disabled',
      kind: 'notification',
    })
    expect(audit.publishingPaths.find((item) => item.id === 'claude-scheduled-seo-reindex')).toMatchObject({
      classification: 'unattended',
      observedState: 'disabled',
      kind: 'notification',
    })

    expect(audit.publishingPaths.find((item) => item.id === 'cloudflare-dashboard-deploy')).toMatchObject({
      productionTarget: 'dashboard',
      canPublishProduction: true,
    })

    expect(
      audit.publishingPaths.filter((item) => (
        item.classification === 'unattended'
        && item.observedState === 'enabled'
        && item.productionTarget === 'frontend'
        && item.canPublishProduction
      )),
    ).toEqual([])
    expect(audit.findings.unclassifiedPublishingCandidates).toEqual([])
  })

  it('fails closed when a new operational publishing candidate is not classified', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(process.cwd(), '.tmp-seo-baseline-'))
    const scriptsDirectory = path.join(temporaryRoot, 'scripts')
    const toolsDirectory = path.join(temporaryRoot, 'tools')
    const opsDirectory = path.join(temporaryRoot, 'ops')
    const apiDirectory = path.join(temporaryRoot, 'app/api/release')
    const libDirectory = path.join(temporaryRoot, 'lib')
    const workflowsDirectory = path.join(temporaryRoot, '.github/workflows')
    const scratchDirectory = path.join(temporaryRoot, '.scratch/lib')
    fs.mkdirSync(scriptsDirectory, { recursive: true })
    fs.mkdirSync(toolsDirectory, { recursive: true })
    fs.mkdirSync(opsDirectory, { recursive: true })
    fs.mkdirSync(apiDirectory, { recursive: true })
    fs.mkdirSync(libDirectory, { recursive: true })
    fs.mkdirSync(workflowsDirectory, { recursive: true })
    fs.mkdirSync(scratchDirectory, { recursive: true })
    fs.writeFileSync(path.join(scriptsDirectory, 'deploy-new.py'), `subprocess.run(['${VERCEL_COMMAND}', 'deploy', '${PRODUCTION_FLAG}'])\n`)
    fs.writeFileSync(path.join(toolsDirectory, 'publish-new.ts'), 'console.log("publish")\n')
    fs.writeFileSync(path.join(opsDirectory, 'ship.sh'), `${VERCEL_COMMAND} deploy --token "$TOKEN" ${PRODUCTION_FLAG}\n`)
    fs.writeFileSync(path.join(opsDirectory, 'release'), `#!/bin/sh\n${VERCEL_COMMAND} deploy --target ${PRODUCTION_TARGET}\n`)
    fs.writeFileSync(path.join(opsDirectory, 'release.rb'), `system("${VERCEL_COMMAND} deploy --target=${PRODUCTION_TARGET}")\n`)
    fs.writeFileSync(path.join(opsDirectory, 'release.ps1'), `${VERCEL_COMMAND} deploy --target ${PRODUCTION_TARGET}\n`)
    fs.writeFileSync(path.join(opsDirectory, 'ship.cmd'), `${VERCEL_COMMAND} deploy --target ${PRODUCTION_TARGET}\n`)
    fs.writeFileSync(path.join(opsDirectory, 'bun-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'flagged-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'python-worker'), Buffer.alloc((2 * 1024 * 1024) + 1, 65))
    fs.writeFileSync(path.join(opsDirectory, 'worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-continuation-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-backtick-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-deno-worker'), Buffer.alloc((2 * 1024 * 1024) + 1, 65))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-fd-input-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-flagged-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-folded-clip-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-folded-keep-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-folded-strip-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-input-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-leading-input-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-leading-redirection-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-mid-redirection-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-redirection-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-shell-worker'), Buffer.alloc((2 * 1024 * 1024) + 1, 65))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-substitution-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-subshell-worker'), Buffer.alloc((2 * 1024 * 1024) + 1, 65))
    fs.writeFileSync(path.join(opsDirectory, 'workflow-worker'), Buffer.from([0]))
    fs.writeFileSync(path.join(temporaryRoot, 'Makefile'), `release:\n\t${VERCEL_COMMAND} deploy --target=${PRODUCTION_TARGET}\n`)
    fs.writeFileSync(path.join(apiDirectory, 'route.ts'), `fetch('${VERCEL_DEPLOYMENTS_API}')\n`)
    fs.writeFileSync(path.join(libDirectory, 'seo-baseline-audit.ts'), `const example = "${VERCEL_COMMAND} deploy ${PRODUCTION_FLAG}"\n`)
    fs.writeFileSync(path.join(libDirectory, 'hidden-deploy.test.ts'), `execSync("${VERCEL_COMMAND} ${PRODUCTION_FLAG}")\n`)
    fs.writeFileSync(path.join(libDirectory, 'large.test.ts'), Buffer.alloc((2 * 1024 * 1024) + 1, 65))
    fs.writeFileSync(path.join(libDirectory, 'opaque.test.ts'), Buffer.from([0]))
    fs.writeFileSync(path.join(workflowsDirectory, 'release.yml'), [
      'name: Release',
      'on: workflow_dispatch',
      'jobs:',
      '  release:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      `      - uses: ${VERCEL_ACTION}`,
      '      - run: node ops/workflow-worker',
      '      - run: |',
      '          node --trace-warnings ' + String.fromCharCode(92),
      '            ops/workflow-continuation-worker',
      '      - run: node --trace-warnings ops/workflow-flagged-worker',
      '      - run: deno run --allow-net ops/workflow-deno-worker',
      '      - run: >',
      '          node --trace-warnings',
      '          ops/workflow-folded-clip-worker',
      '      - run: >-',
      '          node --trace-warnings',
      '          ops/workflow-folded-strip-worker',
      '      - run: >+',
      '          node --trace-warnings',
      '          ops/workflow-folded-keep-worker',
      '      - run: node < ops/workflow-input-worker',
      '      - run: node 0<ops/workflow-fd-input-worker',
      "      - run: '< ops/workflow-leading-input-worker node'",
      "      - run: '>/dev/null node --trace-warnings ops/workflow-leading-redirection-worker'",
      '      - run: node 2>/dev/null ops/workflow-mid-redirection-worker',
      '      - run: node --trace-warnings ops/workflow-redirection-worker>/dev/null',
      "      - run: bash -lc 'node --trace-warnings ops/workflow-shell-worker'",
      '      - run: echo "prefix `node --trace-warnings ops/workflow-backtick-worker`"',
      '      - run: echo "$(node --trace-warnings ops/workflow-substitution-worker)"',
      '      - run: (node --trace-warnings ops/workflow-subshell-worker)',
      '',
    ].join('\n'))
    fs.writeFileSync(path.join(scratchDirectory, 'hidden-deploy.test.ts'), `execSync("${VERCEL_COMMAND} ${PRODUCTION_FLAG}")\n`)
    fs.writeFileSync(path.join(scratchDirectory, 'large.test.ts'), Buffer.alloc((2 * 1024 * 1024) + 1, 65))
    fs.writeFileSync(path.join(scratchDirectory, 'opaque-auto.test.ts'), Buffer.from([0]))
    fs.writeFileSync(path.join(scratchDirectory, 'x.test.ts'), `console.log("${VERCEL_COMMAND} deploy ${PRODUCTION_FLAG}")\n`)
    fs.writeFileSync(path.join(scratchDirectory, 'opaque.test.ts'), Buffer.from([0]))
    fs.writeFileSync(path.join(temporaryRoot, 'package.json'), JSON.stringify({
      scripts: {
        build: 'next build',
        opaque: 'tsx .scratch/lib/opaque.test.ts',
        runBunWorker: 'bun run ops/bun-worker',
        runFlaggedWorker: 'node --trace-warnings ops/flagged-worker',
        runPythonWorker: 'python -u ops/python-worker',
        runWorker: 'node ops/worker',
        ship: 'node scripts/deploy-new.py',
        sync: 'tsx .scratch/lib/x.test.ts',
      },
    }))

    try {
      expect(findUnclassifiedPublishingCandidates(temporaryRoot)).toEqual([
        '.github/workflows/release.yml',
        '.github/workflows/release.yml::capability.frontend-production-deploy',
        '.scratch/lib/hidden-deploy.test.ts',
        '.scratch/lib/hidden-deploy.test.ts::capability.frontend-production-deploy',
        '.scratch/lib/large.test.ts::unscannable-operational-file',
        '.scratch/lib/opaque-auto.test.ts::unscannable-operational-file',
        '.scratch/lib/opaque.test.ts::unscannable-operational-file',
        '.scratch/lib/opaque.test.ts::unscannable-referenced-entrypoint',
        '.scratch/lib/x.test.ts',
        '.scratch/lib/x.test.ts::capability.frontend-production-deploy',
        'Makefile',
        'Makefile::capability.frontend-production-deploy',
        'app/api/release/route.ts',
        'app/api/release/route.ts::capability.frontend-production-deploy',
        'lib/hidden-deploy.test.ts',
        'lib/hidden-deploy.test.ts::capability.frontend-production-deploy',
        'lib/large.test.ts::unscannable-operational-file',
        'lib/opaque.test.ts::unscannable-operational-file',
        'ops/bun-worker::unscannable-referenced-entrypoint',
        'ops/flagged-worker::unscannable-referenced-entrypoint',
        'ops/python-worker::unscannable-referenced-entrypoint',
        'ops/release',
        'ops/release.ps1',
        'ops/release.ps1::capability.frontend-production-deploy',
        'ops/release.rb',
        'ops/release.rb::capability.frontend-production-deploy',
        'ops/release::capability.frontend-production-deploy',
        'ops/ship.cmd',
        'ops/ship.cmd::capability.frontend-production-deploy',
        'ops/ship.sh',
        'ops/ship.sh::capability.frontend-production-deploy',
        'ops/worker::unscannable-referenced-entrypoint',
        'ops/workflow-backtick-worker::unscannable-referenced-entrypoint',
        'ops/workflow-continuation-worker::unscannable-referenced-entrypoint',
        'ops/workflow-deno-worker::unscannable-referenced-entrypoint',
        'ops/workflow-fd-input-worker::unscannable-referenced-entrypoint',
        'ops/workflow-flagged-worker::unscannable-referenced-entrypoint',
        'ops/workflow-folded-clip-worker::unscannable-referenced-entrypoint',
        'ops/workflow-folded-keep-worker::unscannable-referenced-entrypoint',
        'ops/workflow-folded-strip-worker::unscannable-referenced-entrypoint',
        'ops/workflow-input-worker::unscannable-referenced-entrypoint',
        'ops/workflow-leading-input-worker::unscannable-referenced-entrypoint',
        'ops/workflow-leading-redirection-worker::unscannable-referenced-entrypoint',
        'ops/workflow-mid-redirection-worker::unscannable-referenced-entrypoint',
        'ops/workflow-redirection-worker::unscannable-referenced-entrypoint',
        'ops/workflow-shell-worker::unscannable-referenced-entrypoint',
        'ops/workflow-subshell-worker::unscannable-referenced-entrypoint',
        'ops/workflow-substitution-worker::unscannable-referenced-entrypoint',
        'ops/workflow-worker::unscannable-referenced-entrypoint',
        'package.json::capability.frontend-production-deploy',
        'package.json::scripts.opaque',
        'package.json::scripts.runBunWorker',
        'package.json::scripts.runFlaggedWorker',
        'package.json::scripts.runPythonWorker',
        'package.json::scripts.runWorker',
        'package.json::scripts.ship',
        'package.json::scripts.ship::capability.frontend-production-deploy',
        'package.json::scripts.sync',
        'package.json::scripts.sync::capability.frontend-production-deploy',
        'scripts/deploy-new.py',
        'scripts/deploy-new.py::capability.frontend-production-deploy',
        'tools/publish-new.ts',
      ])
    } finally {
      fs.rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  it('fails closed when a monorepo agent skill cannot be scanned', () => {
    const monorepoRoot = fs.mkdtempSync(path.join(process.cwd(), '.tmp-seo-agent-skill-'))
    const projectRoot = path.join(monorepoRoot, 'frontend')
    const skillPath = path.join(monorepoRoot, '.agents/skills/opaque/SKILL.md')
    fs.mkdirSync(projectRoot, { recursive: true })
    fs.mkdirSync(path.dirname(skillPath), { recursive: true })
    fs.writeFileSync(skillPath, Buffer.from([0]))

    try {
      const findings = findUnclassifiedPublishingCandidates(projectRoot)
      expect(findings).toContain('../.agents/skills/opaque/SKILL.md::unscannable-operational-file')
      expect(findings).not.toContain('../.agents/skills/opaque/SKILL.md')
    } finally {
      fs.rmSync(monorepoRoot, { recursive: true, force: true })
    }
  })

  it('keeps ordinary publishing checks deterministic without live scheduler definitions', () => {
    const originalHome = process.env.HOME
    const temporaryHome = fs.mkdtempSync(path.join(process.cwd(), '.tmp-seo-empty-home-'))
    process.env.HOME = temporaryHome

    try {
      expect(() => assertPublishingSafety(audit, PROJECT_ROOT)).not.toThrow()
    } finally {
      process.env.HOME = originalHome
      fs.rmSync(temporaryHome, { recursive: true, force: true })
    }
  })

  it('binds release safety to the complete live scheduler registry', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(process.cwd(), '.tmp-seo-live-scheduler-'))
    const temporaryHome = fs.mkdtempSync(path.join(process.cwd(), '.tmp-seo-live-home-'))
    const originalHome = process.env.HOME
    process.env.HOME = temporaryHome

    try {
      const registryPath = writeSchedulerReleaseFixture(temporaryRoot, temporaryHome)
      const options = {
        now: new Date('2026-07-17T06:00:00Z'),
        schedulerRegistryPath: registryPath,
      }

      expect(verifySchedulerSnapshotReleaseSafety(temporaryRoot, options)).toEqual([])

      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8')) as {
        scheduledTasks: Array<Record<string, unknown>>
      }
      registry.scheduledTasks.push({
        id: 'unexpected-publisher',
        enabled: true,
        filePath: path.join(temporaryHome, 'Claude/Scheduled/unexpected-publisher/SKILL.md'),
        cronExpression: '*/5 * * * *',
      })
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2))

      expect(verifySchedulerSnapshotReleaseSafety(temporaryRoot, options)).toContain(
        'Live scheduler registry contains unclassified task: unexpected-publisher.',
      )

      registry.scheduledTasks.pop()
      registry.scheduledTasks.find((task) => task.id === 'wag-daily-analytics')!.enabled = false
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2))

      expect(verifySchedulerSnapshotReleaseSafety(temporaryRoot, options)).toContain(
        'wag-daily-analytics enabled state differs between the snapshot and live scheduler registry.',
      )

      expect(verifySchedulerSnapshotReleaseSafety(temporaryRoot, {
        ...options,
        schedulerRegistryPath: path.join(temporaryRoot, 'missing-scheduled-tasks.json'),
      })).toContainEqual(expect.stringContaining('Live scheduler registry is missing'))
    } finally {
      process.env.HOME = originalHome
      fs.rmSync(temporaryRoot, { recursive: true, force: true })
      fs.rmSync(temporaryHome, { recursive: true, force: true })
    }
  })

  it('ignores environment overrides and verifies the canonical live scheduler registry', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(process.cwd(), '.tmp-seo-canonical-scheduler-'))
    const temporaryHome = fs.mkdtempSync(path.join(process.cwd(), '.tmp-seo-canonical-home-'))
    const originalHome = process.env.HOME
    const originalOverride = process.env.SEO_SCHEDULER_REGISTRY_PATH
    process.env.HOME = temporaryHome

    try {
      const cleanRegistryPath = writeSchedulerReleaseFixture(temporaryRoot, temporaryHome)
      const canonicalRegistryPath = path.join(
        temporaryHome,
        'Library/Application Support/Claude/local-agent-mode-sessions/session/task/scheduled-tasks.json',
      )
      const canonicalRegistry = JSON.parse(fs.readFileSync(cleanRegistryPath, 'utf8')) as {
        scheduledTasks: Array<Record<string, unknown>>
      }
      canonicalRegistry.scheduledTasks.push({
        id: 'unexpected-publisher',
        enabled: true,
        filePath: path.join(temporaryHome, 'Claude/Scheduled/unexpected-publisher/SKILL.md'),
        cronExpression: '*/5 * * * *',
      })
      fs.mkdirSync(path.dirname(canonicalRegistryPath), { recursive: true })
      fs.writeFileSync(canonicalRegistryPath, JSON.stringify(canonicalRegistry, null, 2))
      process.env.SEO_SCHEDULER_REGISTRY_PATH = cleanRegistryPath

      expect(verifySchedulerSnapshotReleaseSafety(temporaryRoot, {
        now: new Date('2026-07-17T06:00:00Z'),
      })).toContain('Live scheduler registry contains unclassified task: unexpected-publisher.')
    } finally {
      process.env.HOME = originalHome
      if (originalOverride === undefined) {
        delete process.env.SEO_SCHEDULER_REGISTRY_PATH
      } else {
        process.env.SEO_SCHEDULER_REGISTRY_PATH = originalOverride
      }
      fs.rmSync(temporaryRoot, { recursive: true, force: true })
      fs.rmSync(temporaryHome, { recursive: true, force: true })
    }
  })

  it('rejects unknown scheduled tasks and stale release evidence', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(process.cwd(), '.tmp-seo-scheduler-'))
    const snapshotPath = path.join(temporaryRoot, 'content/seo/evidence/2026-07-17-scheduler-state.yaml')
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true })
    fs.writeFileSync(snapshotPath, `auditDate: 2026-07-17
capturedAt: 2026-07-15T00:00:00Z
taskCount: 5
scheduledTasks:
  - { id: seo-purge-remaining-410, enabled: false, filePath: ~/Claude/Scheduled/seo-purge-remaining-410/SKILL.md, definitionSha256: ${'0'.repeat(64)} }
  - { id: seo-reindex-updated-pages, enabled: false, filePath: ~/Claude/Scheduled/seo-reindex-updated-pages/SKILL.md, definitionSha256: ${'0'.repeat(64)} }
  - { id: wag-daily-analytics, enabled: true, filePath: ~/Claude/Scheduled/wag-daily-analytics/SKILL.md, definitionSha256: ${'0'.repeat(64)} }
  - { id: wag-google-ads-daily-insight, enabled: true, filePath: ~/Claude/Scheduled/wag-google-ads-daily-insight/SKILL.md, definitionSha256: ${'0'.repeat(64)} }
  - { id: unknown-production-task, enabled: true, filePath: ~/Claude/Scheduled/unknown-production-task/SKILL.md, definitionSha256: ${'0'.repeat(64)} }
`)

    try {
      expect(findUnclassifiedPublishingCandidates(temporaryRoot)).toContain('scheduler::unknown-production-task')
      expect(verifySchedulerSnapshotReleaseSafety(temporaryRoot, {
        now: new Date('2026-07-17T06:00:00Z'),
      })).toEqual(expect.arrayContaining([
        expect.stringContaining('outside the 24-hour release-safety window'),
        expect.stringContaining('Unknown scheduler task requires explicit classification'),
      ]))
    } finally {
      fs.rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  it('prevents unsafe baseline artifacts from being blessed', () => {
    const unsafeAudit = {
      ...audit,
      findings: {
        ...audit.findings,
        unclassifiedPublishingCandidates: ['ops/new-publisher.ts::capability.frontend-production-deploy'],
      },
    }

    expect(() => assertPublishingSafety(unsafeAudit, PROJECT_ROOT))
      .toThrow('Unclassified publishing capability or path')
  })

  it('reruns the complete publishing audit for release safety', () => {
    const unsafeAudit = {
      ...audit,
      findings: {
        ...audit.findings,
        unclassifiedPublishingCandidates: ['ops/new-publisher::capability.frontend-production-deploy'],
      },
    }

    expect(() => assertSeoReleaseSafety(unsafeAudit, PROJECT_ROOT))
      .toThrow('Unclassified publishing capability or path')
  })

  it('uses locale-independent code-point ordering', () => {
    expect(['ä', 'z', 'a'].sort(compareCodePoints)).toEqual(['a', 'z', 'ä'])
  })

  it('renders deterministic checked-in artifacts', () => {
    const inventory = renderArticleInventoryYaml(audit)
    const baseline = renderBaselineMarkdown(audit)

    expect(renderArticleInventoryYaml(buildSeoBaselineAudit(PROJECT_ROOT))).toBe(inventory)
    expect(renderBaselineMarkdown(buildSeoBaselineAudit(PROJECT_ROOT))).toBe(baseline)
    expect(audit.schedulerEvidence[0]).toContain('repository scheduler snapshot')
    expect(audit.schedulerEvidence.join('\n')).not.toContain('/Users/')
    expect(inventory).not.toContain('/Users/')
    expect(baseline).not.toContain('/Users/')

    const originalHome = process.env.HOME
    process.env.HOME = '/tmp/alternate-seo-audit-home'
    try {
      expect(renderArticleInventoryYaml(buildSeoBaselineAudit(PROJECT_ROOT))).toBe(inventory)
      expect(renderBaselineMarkdown(buildSeoBaselineAudit(PROJECT_ROOT))).toBe(baseline)
    } finally {
      process.env.HOME = originalHome
    }

    expect(
      fs.readFileSync(
        path.join(PROJECT_ROOT, 'content/seo/migrations/2026-07-17-article-inventory.yaml'),
        'utf8',
      ),
    ).toBe(inventory)
    expect(
      fs.readFileSync(path.join(PROJECT_ROOT, 'docs/seo/2026-07-17-baseline.md'), 'utf8'),
    ).toBe(baseline)
  })
})
