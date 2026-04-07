# Testing Patterns

**Analysis Date:** 2026-04-07

## Test Framework

**E2E Testing:**
- Framework: **Playwright** (installed via `@playwright/test`)
- Config: Not detected in project root (no `playwright.config.ts`)
- Test command: `npx playwright test`

**Unit/Integration Testing:**
- Framework: **Not configured** (no Jest, Vitest, or React Testing Library detected)
- Coverage: No coverage enforcement detected

## Test File Organization

**Location:**
- Co-located with components: `app/components/DirectorySection/DirectoryMap.test.tsx`

**Naming:**
- Pattern: `ComponentName.test.tsx`
- TDD bug tests: `ComponentNameBug.test.tsx`

## Test Structure

**Playwright E2E Tests:**

```typescript
'use client'

/**
 * TDD Test: Map marker alignment and max-zoom behavior
 *
 * RED Phase:
 * 1. Number inside marker must be pixel-perfect centered (no offset)
 * 2. At max zoom (zoom >= 14), markers must show pin icon NOT factory count
 */

import { test, expect } from '@playwright/test'
import { directoryCities } from './data/directory-cities'

test.describe('DirectoryMap marker alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services/factory-directory', { waitUntil: 'networkidle' })
    const mapEl = page.locator('.leaflet-container')
    const box = await mapEl.boundingBox()
    if (!box) return
    // Zoom in to trigger clustering
    for (let i = 0; i < 6; i++) {
      await page.mouse.click(cx, cy)
      await page.waitForTimeout(200)
    }
    await page.waitForTimeout(500)
  })

  test('factory count inside marker must be perfectly centered', async ({ page }) => {
    const misalignedCounts = await page.evaluate(() => {
      const markers = document.querySelectorAll('.factory-marker')
      const results: Array<{...}> = []
      // DOM evaluation logic
      return results
    })
    expect(misalignedCounts, `...`).toHaveLength(0)
  })
})
```

## Mocking

**Playwright:**
- Uses `page.evaluate()` for DOM inspection
- No explicit mocking framework detected
- Data imported directly from `data/directory-cities.ts`

**Pattern:**
```typescript
const directoryCities = require('./data/directory-cities')
// or
import { directoryCities } from './data/directory-cities'
```

## TDD Approach

**Observed Pattern:**
```typescript
/**
 * TDD Test: [Feature description]
 *
 * RED Phase:
 * 1. [Requirement 1]
 * 2. [Requirement 2]
 */
```

Tests define expected behavior before implementation:
- Marker alignment (pixel-perfect centering)
- Max zoom behavior (show pin icon, not count)
- Cluster circle shape (width equals height)
- Color validation (Navy background, white text)
- Factory count aggregation

## Test Patterns

**Visual/Behavior Testing via page.evaluate():**
```typescript
const markersWithCounts = await page.evaluate(() => {
  const markers = document.querySelectorAll('.factory-marker')
  let countWithNumbers = 0
  let countWithSVG = 0
  markers.forEach((el) => {
    const span = el.querySelector('span[data-factories]')
    if (span) {
      countWithNumbers++
    } else {
      const svg = el.querySelector('svg')
      if (svg) countWithSVG++
    }
  })
  return { countWithNumbers, countWithSVG, total: markers.length }
})
expect(markersWithCounts.countWithNumbers).toBe(0)
```

**DOM Measurement:**
```typescript
const nonCircularClusters = await page.evaluate(() => {
  const clusters = document.querySelectorAll('.factory-cluster')
  const results: Array<{ index: number; width: number; height: number }> = []
  clusters.forEach((el, i) => {
    const innerDiv = el.querySelector('div')
    if (!innerDiv) return
    const w = innerDiv.offsetWidth
    const h = innerDiv.offsetHeight
    if (w !== h) results.push({ index: i, width: w, height: h })
  })
  return results
})
```

**Style Validation:**
```typescript
const orangeClusters = await page.evaluate(() => {
  const clusters = document.querySelectorAll('.factory-cluster')
  const results: Array<{ index: number; bg: string }> = []
  clusters.forEach((el, i) => {
    const innerDiv = el.querySelector('div')
    if (!innerDiv) return
    const cs = window.getComputedStyle(innerDiv)
    const bg = cs.background
    if (bg.includes('#F59E0B') || bg.includes('#D97706') || ...) {
      results.push({ index: i, bg })
    }
  })
  return results
})
```

**Interactive Testing:**
```typescript
// Zoom in to trigger clustering
for (let i = 0; i < 6; i++) {
  await page.mouse.click(cx, cy)
  await page.waitForTimeout(200)
}
await page.waitForTimeout(500)
```

## Test Data

**Fixtures Located:**
- `app/components/DirectorySection/data/directory-cities.ts`

**Pattern:**
```typescript
export const directoryCities = [
  { city: 'Dongguan', province: 'Guangdong', factories: 30, focus: 'Electronics', coords: [23..., 113...] as [number, number], industries: ['Electronics'] },
  // ...
]
```

## Coverage

**Requirements:** Not enforced

**Current State:** Only E2E tests exist for DirectoryMap component; no unit tests for utilities or API routes

## Common Patterns

**Async/Await with try-catch:**
```typescript
test('cluster number must equal sum of factory counts', async ({ page }) => {
  const totalFactories = directoryCities.reduce((sum, c) => sum + c.factories, 0)
  const clusterNumbers = await page.evaluate(() => { ... })
  const clusterSum = clusterNumbers.reduce((a, b) => a + b, 0)
  expect(clusterSum).toBeGreaterThan(0)
})
```

**Multiple Assertions per Test:**
```typescript
expect(markersWithCounts.countWithNumbers, `...`).toBe(0)
expect(markersWithCounts.countWithSVG, `...`).toBeGreaterThan(0)
```

**Descriptive Error Messages:**
```typescript
expect(misalignedCounts, `Misaligned counts: ${JSON.stringify(misalignedCounts)}`).toHaveLength(0)
```

## Missing Test Coverage

**Not Tested:**
- API routes (`/api/enquiry`, `/api/newsletter`)
- Rate limiting logic (`lib/rate-limit.ts`)
- Form validation logic
- MDX rendering utilities
- Schema generation functions
- Individual React components in isolation

---

*Testing analysis: 2026-04-07*
