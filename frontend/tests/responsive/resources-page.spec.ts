import { test, expect } from '@playwright/test'

test.describe('Resources Page Responsive - 320px Viewport', () => {
  const mobileViewport = { width: 320, height: 568 }

  test('no horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize(mobileViewport)
    await page.goto('/resources')

    // Check for actual horizontal scroll (not just content width)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })

  test('navigation visible and functional', async ({ page }) => {
    await page.setViewportSize(mobileViewport)
    await page.goto('/resources')

    // Check main navigation is present
    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()

    // Check hamburger menu exists on mobile
    const hamburger = page.locator('nav button, [aria-label="Menu"]').first()
    await expect(hamburger).toBeVisible()
  })

  test('all interactive elements have adequate touch targets (44px minimum)', async ({ page }) => {
    await page.setViewportSize(mobileViewport)
    await page.goto('/resources')

    // Get all clickable/interactive elements
    const interactiveSelectors = [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[tabindex]:not([tabindex="-1"])',
    ]

    const interactiveElements = page.locator(interactiveSelectors.join(', '))

    const count = await interactiveElements.count()
    expect(count).toBeGreaterThan(0)

    // Check each interactive element has adequate touch target
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i)
      const isVisible = await element.isVisible()

      if (isVisible) {
        const box = await element.boundingBox()
        if (box) {
          // Check height is at least 44px (touch target minimum)
          const height = box.height
          expect(height).toBeGreaterThanOrEqual(44)
        }
      }
    }
  })
})
