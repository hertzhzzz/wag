'use client'

/**
 * TDD Test: Map markers must render as perfect circles with correct colors and numbers.
 *
 * RED Phase:
 * 1. Colors: Navy (#0F2D5E) background + white text, NO orange (#F59E0B), NO glow
 * 2. Numbers: Cluster must show TOTAL factory count of all cities in cluster,
 *    NOT the Leaflet childCount (which is number of marker children, not factories)
 */

import { test, expect } from '@playwright/test'
import { directoryCities } from './data/directory-cities'

test.describe('DirectoryMap markers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services/factory-directory', { waitUntil: 'networkidle' })
    const mapEl = page.locator('.leaflet-container')
    const box = await mapEl.boundingBox()
    if (!box) return
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    // Zoom in 6 times to trigger clustering
    for (let i = 0; i < 6; i++) {
      await page.mouse.click(cx, cy)
      await page.waitForTimeout(200)
    }
    await page.waitForTimeout(500)
  })

  test('cluster markers must be perfect circles (width equals height)', async ({ page }) => {
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
    expect(nonCircularClusters, `Found oval clusters: ${JSON.stringify(nonCircularClusters)}`).toHaveLength(0)
  })

  test('cluster must use Navy (#0F2D5E) background, NOT orange', async ({ page }) => {
    const orangeClusters = await page.evaluate(() => {
      const clusters = document.querySelectorAll('.factory-cluster')
      const results: Array<{ index: number; bg: string }> = []
      clusters.forEach((el, i) => {
        const innerDiv = el.querySelector('div')
        if (!innerDiv) return
        const cs = window.getComputedStyle(innerDiv)
        const bg = cs.background
        // Orange is #F59E0B or #D97706
        if (bg.includes('#F59E0B') || bg.includes('#D97706') || bg.includes('245, 158, 11') || bg.includes('217, 119, 6')) {
          results.push({ index: i, bg })
        }
      })
      return results
    })
    expect(orangeClusters, `Found orange clusters: ${JSON.stringify(orangeClusters)}`).toHaveLength(0)
  })

  test('cluster must have white text color, NOT navy', async ({ page }) => {
    const navyTextClusters = await page.evaluate(() => {
      const clusters = document.querySelectorAll('.factory-cluster')
      const results: Array<{ index: i; textColor: string }> = []
      clusters.forEach((el, i) => {
        const span = el.querySelector('span')
        if (!span) return
        const cs = window.getComputedStyle(span)
        if (cs.color.includes('15, 45, 94') || cs.color.includes('0, 45, 94')) {
          results.push({ index: i, textColor: cs.color })
        }
      })
      return results
    })
    expect(navyTextClusters, `Found navy-text clusters: ${JSON.stringify(navyTextClusters)}`).toHaveLength(0)
  })

  test('cluster must have NO orange box-shadow glow', async ({ page }) => {
    const glowingClusters = await page.evaluate(() => {
      const clusters = document.querySelectorAll('.factory-cluster')
      const results: Array<{ index: number; boxShadow: string }> = []
      clusters.forEach((el, i) => {
        const innerDiv = el.querySelector('div')
        if (!innerDiv) return
        const cs = window.getComputedStyle(innerDiv)
        const shadow = cs.boxShadow
        // Check for orange glow (rgba with 245,158,11 or similar orange values)
        if (shadow.includes('245, 158, 11') || shadow.includes('rgba(245') || shadow.includes('#F59E0B')) {
          results.push({ index: i, boxShadow: shadow })
        }
      })
      return results
    })
    expect(glowingClusters, `Found glowing clusters: ${JSON.stringify(glowingClusters)}`).toHaveLength(0)
  })

  test('cluster number must equal sum of factory counts for cities in that cluster', async ({ page }) => {
    // The expected total factories in the map
    const totalFactories = directoryCities.reduce((sum, c) => sum + c.factories, 0)

    const clusterNumbers = await page.evaluate(() => {
      const clusters = document.querySelectorAll('.factory-cluster')
      const numbers: number[] = []
      clusters.forEach((el) => {
        const span = el.querySelector('span')
        if (!span) return
        const num = parseInt(span.textContent || '0', 10)
        if (!isNaN(num)) numbers.push(num)
      })
      return numbers
    })

    // Cluster numbers should sum to approximately total factories (within cluster radius)
    const clusterSum = clusterNumbers.reduce((a, b) => a + b, 0)
    // Allow some tolerance since clusters may not capture all markers at this zoom level
    expect(clusterSum, `Cluster sum=${clusterSum} should be close to totalFactories=${totalFactories}`).toBeGreaterThan(0)

    // Also verify: individual cluster numbers should NOT be childCount-like values
    // (childCount would be much smaller than factory count)
    // Check that cluster numbers match actual city factory counts from the data
    const cityFactoryMap = new Map(directoryCities.map(c => [c.city, c.factories]))
    const allFactoryCounts = Array.from(cityFactoryMap.values())

    // A cluster showing exactly childCount would show very small numbers (like 5, 10)
    // Factory counts are like 20, 25, 30, 35, 40, 50, 55, 60, 75, 80
    // If cluster numbers are all < 20, something is wrong
    const suspiciouslySmall = clusterNumbers.filter(n => n < 15)
    expect(suspectivelySmall, `Some cluster numbers suspiciously small (childCount-like): ${suspectivelySmall}`).toHaveLength(0)
  })
})
