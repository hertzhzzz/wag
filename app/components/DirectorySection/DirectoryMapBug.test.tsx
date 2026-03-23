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
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    // Zoom in to trigger clustering
    for (let i = 0; i < 6; i++) {
      await page.mouse.click(cx, cy)
      await page.waitForTimeout(200)
    }
    await page.waitForTimeout(500)
  })

  test('factory count inside marker must be perfectly centered', async ({ page }) => {
    // Find markers that show a factory count (not SVG icon)
    const misalignedCounts = await page.evaluate(() => {
      const markers = document.querySelectorAll('.factory-marker')
      const results: Array<{ index: number; offsetX: number; offsetY: number; markerSize: number }> = []
      markers.forEach((el, i) => {
        const innerDiv = el.querySelector('div') as HTMLElement | null
        if (!innerDiv) return
        const span = innerDiv.querySelector('span[data-factories]')
        if (!span) return // This marker shows SVG icon, not count

        const markerRect = innerDiv.getBoundingClientRect()
        const spanRect = span.getBoundingClientRect()

        // Check if span is centered within marker
        const markerCenterX = markerRect.left + markerRect.width / 2
        const markerCenterY = markerRect.top + markerRect.height / 2
        const spanCenterX = spanRect.left + spanRect.width / 2
        const spanCenterY = spanRect.top + spanRect.height / 2

        const offsetX = Math.abs(markerCenterX - spanCenterX)
        const offsetY = Math.abs(markerCenterY - spanCenterY)

        // Allow 1px tolerance for rounding
        if (offsetX > 1 || offsetY > 1) {
          results.push({
            index: i,
            offsetX: Math.round(offsetX * 100) / 100,
            offsetY: Math.round(offsetY * 100) / 100,
            markerSize: markerRect.width
          })
        }
      })
      return results
    })
    expect(misalignedCounts, `Misaligned counts: ${JSON.stringify(misalignedCounts)}`).toHaveLength(0)
  })
})

test.describe('DirectoryMap max zoom behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services/factory-directory', { waitUntil: 'networkidle' })
  })

  test('at max zoom (zoom >= 14), markers must show pin icon NOT factory count', async ({ page }) => {
    const mapEl = page.locator('.leaflet-container')
    const box = await mapEl.boundingBox()
    if (!box) return
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2

    // Zoom in to maximum
    for (let i = 0; i < 12; i++) {
      await page.mouse.click(cx, cy)
      await page.waitForTimeout(150)
    }
    await page.waitForTimeout(800)

    // At max zoom, verify no factory count numbers are displayed inside markers
    // Instead, all markers should show SVG pin icons
    const markersWithCounts = await page.evaluate(() => {
      const markers = document.querySelectorAll('.factory-marker')
      let countWithNumbers = 0
      let countWithSVG = 0
      markers.forEach((el) => {
        const span = el.querySelector('span[data-factories]')
        if (span) {
          countWithNumbers++
        } else {
          // Check if it has SVG
          const svg = el.querySelector('svg')
          if (svg) countWithSVG++
        }
      })
      return { countWithNumbers, countWithSVG, total: markers.length }
    })

    // At max zoom, we expect all visible markers to show SVG pin icons, NOT numbers
    // This tests that the number is replaced by pin at max zoom
    expect(markersWithCounts.countWithNumbers, `At max zoom, markers should show pin icons, not numbers. Found ${markersWithCounts.countWithNumbers} markers with numbers out of ${markersWithCounts.total} total`).toBe(0)
    expect(markersWithCounts.countWithSVG, `At max zoom, markers should show SVG pin icons`).toBeGreaterThan(0)
  })
})
