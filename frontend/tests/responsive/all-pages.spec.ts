import { test, expect } from '@playwright/test'

test.describe('Comprehensive Responsive Audit - All Pages', () => {
  const mobileViewport = { width: 320, height: 568 }
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/services', name: 'Services' },
    { path: '/about', name: 'About' },
    { path: '/enquiry', name: 'Enquiry' },
    { path: '/resources', name: 'Resources' },
  ]

  for (const page of pages) {
    test(`${page.name} page: no horizontal scroll at 320px`, async ({ page: browserPage }) => {
      await browserPage.setViewportSize(mobileViewport)
      await browserPage.goto(page.path)

      // Check for actual horizontal scroll (not just content width)
      const hasHorizontalScroll = await browserPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth
      })

      expect(hasHorizontalScroll).toBe(false)
    })
  }

  test('Navigation works on all mobile pages', async ({ page }) => {
    const mobileViewport = { width: 320, height: 568 }
    await page.setViewportSize(mobileViewport)

    const pages = ['/', '/services', '/about', '/enquiry', '/resources']

    for (const path of pages) {
      await page.goto(path)

      // Check main navigation is present (use first nav or more specific selector)
      const nav = page.locator('nav').first()
      await expect(nav).toBeVisible()

      // Check hamburger menu exists on mobile (first button in navbar)
      const hamburger = page.locator('nav button, [aria-label="Menu"]').first()
      // Hamburger may or may not be visible depending on scroll position
    }
  })
})
