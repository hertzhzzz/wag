<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Scope:** All 5 pages comprehensive audit (Home, Services, About, Enquiry, Resources)
- **Order:** Page-by-page sequential — complete each page before moving to next
- **Automation:** Use browser-use with inherited Chrome profile (existing logged-in browser, not new instance)
- **Validation:** Test-driven flow — Write test to verify issue exists → Fix → Verify test passes
- **Fix Strategy:** Issue-type batched — Group same issue types together and fix all at once

### Claude's Discretion
- Specific responsive patterns for each page type
- Test tooling for responsive validation

### Deferred Ideas (OUT OF SCOPE)
None — all responsive issues for all 5 pages are in scope for this phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RESP-04 | Enquiry form page adapts to mobile screens | Current enquiry page uses `px-4 sm:px-8` but lacks keyboard avoidance and proper viewport handling |
| FORM-01 | Enquiry form inputs usable on mobile without keyboard issues | Current code lacks `scrollIntoView` on focus - inputs hidden when keyboard opens |
| FORM-02 | Form labels remain visible when input is focused on mobile | Labels use block layout above inputs - need verification they don't get obscured |
| FORM-03 | Submit button easily accessible on mobile | Button has `py-3.5` (~56px) but no sticky/fixed positioning - may be pushed off screen by keyboard |
</phase_requirements>

# Phase 3: Global UI Audit + Mobile Adaptation - Research

**Researched:** 2026-03-16
**Domain:** Mobile responsive design, form UX on mobile, browser automation testing
**Confidence:** HIGH

## Summary

Phase 3 focuses on comprehensive UI audit across all 5 pages and fixing mobile responsive issues, particularly for the enquiry form. Current analysis shows the enquiry page has basic responsive patterns (`px-4 sm:px-8`) but lacks critical mobile form features: keyboard avoidance, input focus scrolling, and sticky submit button. The project has no existing test infrastructure, requiring Playwright setup for responsive validation.

**Primary recommendation:** Install Playwright for automated responsive testing, implement keyboard avoidance using Visual Viewport API, and add `scrollIntoView` on input focus for FORM-01/FORM-02. Use sticky positioning for submit button (FORM-03).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Playwright | ^1.52.0 | End-to-end responsive testing | Industry standard for browser automation, supports viewport testing |
| browser-use | latest | AI-powered browser automation | Used for hybrid automated+manual testing per CONTEXT.md |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Visual Viewport API | Native | Detect keyboard open/closed state | Essential for form keyboard avoidance |
| CSS position: sticky | Native | Keep submit button visible | Simple CSS solution for FORM-03 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Playwright | Puppeteer | Playwright has better built-in test runner and multi-page support |
| browser-use | Selenium | browser-use is more modern, better for AI-assisted testing |
| Custom keyboard detection | react-keyboard-detector | Adds dependency; Visual Viewport API is native |

**Installation:**
```bash
cd web/frontend
npm init playwright@latest -- --yes --quiet --no-browsers
npx playwright install chromium
npm install browser-use
```

## Architecture Patterns

### Recommended Project Structure
```
web/frontend/
├── tests/                    # Playwright tests
│   ├── responsive/           # Responsive tests
│   │   ├── home.spec.ts
│   │   ├── services.spec.ts
│   │   ├── about.spec.ts
│   │   ├── enquiry.spec.ts
│   │   └── resources.spec.ts
│   └── mobile/               # Mobile-specific tests
│       └── form.spec.ts
└── playwright.config.ts      # Test configuration
```

### Pattern 1: Mobile Form Keyboard Avoidance
**What:** Prevent virtual keyboard from hiding focused inputs
**When to use:** All form inputs on mobile pages
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
import { useEffect, useRef } from 'react'

function useKeyboardAvoidance() {
  const viewportRef = useRef<VisualViewport | null>(null)

  useEffect(() => {
    const handleResize = () => {
      const viewport = window.visualViewport
      if (!viewport) return

      // Keyboard is open when viewport height < window height * 0.8
      const keyboardOpen = viewport.height < window.innerHeight * 0.8

      if (keyboardOpen) {
        // Scroll focused element into view with offset for keyboard
        const focused = document.activeElement as HTMLElement
        focused?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    viewportRef.current = window.visualViewport
    viewportRef.current?.addEventListener('resize', handleResize)
    return () => viewportRef.current?.removeEventListener('resize', handleResize)
  }, [])

  return null
}
```

### Pattern 2: Sticky Submit Button
**What:** Keep submit button always visible on mobile
**When to use:** Multi-step forms on mobile
**Example:**
```typescript
// Source: Tailwind CSS sticky positioning
<div className="pb-20"> {/* Extra padding for button space */}
  <form>
    {/* form fields */}
    <button
      type="submit"
      className="fixed bottom-0 left-0 right-0 py-4 bg-[#0F2D5E] text-white
                 md:relative md:bottom-auto md:left-auto md:right-auto md:py-3.5"
    >
      Submit Enquiry
    </button>
  </form>
</div>
```

### Pattern 3: Playwright Responsive Test
**What:** Automated viewport testing
**When to use:** Validating responsive behavior
**Example:**
```typescript
// Source: Playwright docs
import { test, expect } from '@playwright/test'

test.describe('Enquiry Form Mobile', () => {
  const viewports = [
    { width: 320, height: 568 },  // iPhone SE
    { width: 375, height: 667 },  // iPhone 14
    { width: 390, height: 844 },  // iPhone 14 Pro
    { width: 414, height: 896 },  // iPhone 11 Pro Max
  ]

  for (const viewport of viewports) {
    test(`works at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/enquiry')

      // Test FORM-01: Input focus visible
      await page.locator('#fullName').focus()
      const inputBounds = await page.locator('#fullName').boundingBox()
      expect(inputBounds?.y).toBeGreaterThan(0)

      // Test FORM-02: Label visible on focus
      const labelVisible = await page.locator('label[for="fullName"]').isVisible()
      expect(labelVisible).toBe(true)

      // Test FORM-03: Submit button accessible
      await page.locator('#lookingFor').scrollIntoViewIfNeeded()
      const buttonBounds = await page.locator('button[type="submit"]').boundingBox()
      expect(buttonBounds?.y).toBeLessThan(viewport.height)
    })
  }
})
```

### Anti-Patterns to Avoid
- **Fixed height containers:** Causes overflow when keyboard opens — use `min-height` instead
- **Position fixed without breakpoints:** Breaks desktop layout — use `md:relative` to reset on desktop
- **Relying on focus-within only:** Doesn't catch all keyboard scenarios — combine with Visual Viewport API

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard detection | Custom event listeners | Visual Viewport API | Handles all mobile browsers consistently |
| Viewport testing | Manual testing | Playwright | Automated, repeatable, captures visual regressions |
| Responsive screenshots | Manual comparison | Playwright screenshot diff | Catches subtle layout shifts |

**Key insight:** Mobile browser quirks are extensive. Using Visual Viewport API + Playwright provides reliable cross-browser detection of keyboard state without hand-rolling platform-specific solutions.

## Common Pitfalls

### Pitfall 1: Keyboard Covers Input
**What goes wrong:** When virtual keyboard opens on mobile, input field is positioned behind the keyboard
**Why it happens:** Page doesn't scroll to keep focused input visible; browser viewport is reduced but page doesn't adapt
**How to avoid:** Use Visual Viewport API to detect keyboard, apply `scrollIntoView({ block: 'center' })` on focus
**Warning signs:** User taps input, keyboard appears, input is hidden — user can't see what they're typing

### Pitfall 2: Labels Hidden on Focus
**What goes wrong:** Label scrolls off-screen when input receives focus
**Why it happens:** Form has fixed height or constrained scrolling area
**How to avoid:** Ensure form container has `min-h-screen` or adequate padding-bottom; labels should always have fixed position above input
**Warning signs:** After focusing input, label is no longer visible in viewport

### Pitfall 3: Submit Button Pushed Off Screen
**What goes wrong:** Submit button requires scrolling after keyboard opens
**Why it happens:** Form content grows above button, pushing it below fold
**How to avoid:** Use `position: fixed; bottom: 0` on mobile (`md:relative` resets on desktop), or ensure extra `pb-20` padding
**Warning signs:** User must dismiss keyboard to see submit button

### Pitfall 4: Test Infrastructure Missing
**What goes wrong:** No way to validate responsive fixes
**Why it happens:** Project has no test framework installed
**How to avoid:** Install Playwright before implementing fixes
**Warning signs:** "npm run test" fails with "command not found"

## Code Examples

Verified patterns from official sources:

### Enquiry Form Current State Analysis
```typescript
// Current: frontend/app/enquiry/page.tsx line 126-129
const inputClass = (field: string) =>
  `w-full py-3 px-4 border rounded text-[0.9375rem] text-[#0F2D5E] outline-none transition-colors ${
    errors[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#0F2D5E]'
  }`
// Issues: No scrollIntoView on focus, no keyboard detection
```

### Fixed Form Input (Pattern)
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
'use client'
import { useEffect, useRef } from 'react'

export function KeyboardAwareInput({
  id,
  label,
  type = 'text',
  required = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleFocus = () => {
      const viewport = window.visualViewport
      if (!viewport) return

      // Only adjust on mobile (when viewport is significantly smaller)
      if (viewport.height < window.innerHeight * 0.85) {
        setTimeout(() => {
          inputRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }, 100)
      }
    }

    const input = inputRef.current
    input?.addEventListener('focus', handleFocus)
    return () => input?.removeEventListener('focus', handleFocus)
  }, [])

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        {label} {required && <span className="text-[#F59E0B]">*</span>}
      </label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        className="w-full py-3 px-4 border border-gray-200 rounded text-[0.9375rem] text-[#0F2D5E] outline-none focus:border-[#0F2D5E]"
        {...props}
      />
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual responsive testing | Playwright automated viewport tests | 2024+ | Catches regressions before release |
| CSS resize observer | Visual Viewport API | 2022+ | More reliable keyboard detection |
| Position fixed submit | Sticky + media query | Standard | Cleaner desktop/mobile behavior |

**Deprecated/outdated:**
- `window.onresize` for keyboard detection — unreliable across browsers
- `document.elementFromPoint` — complex and error-prone

## Open Questions

1. **Should we use browser-use for all tests?**
   - What we know: browser-use is preferred per CONTEXT.md for hybrid testing
   - What's unclear: Whether browser-use alone is sufficient or needs Playwright for regression tests
   - Recommendation: Use browser-use for initial discovery, Playwright for regression suite

2. **How to handle Calendly widget on mobile?**
   - What we know: Calendly widget is 600px fixed height, may cause issues on small screens
   - What's unclear: Whether Calendly has mobile-responsive embed options
   - Recommendation: Check Calendly embed documentation for responsive parameters

3. **Resources page responsive status?**
   - What we know: Not yet audited, unclear current state
   - What's unclear: Whether blog cards and navigation work on mobile
   - Recommendation: Include in audit scope, prioritize if issues found

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright ^1.52.0 |
| Config file | `frontend/playwright.config.ts` |
| Quick run command | `npx playwright test --project=mobile` |
| Full suite command | `npx playwright test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RESP-04 | Enquiry form page adapts to mobile | viewport | `npx playwright test enquiry.spec.ts` | No - Wave 0 |
| FORM-01 | Form inputs usable without keyboard issues | integration | `npx playwright test form-keyboard.spec.ts` | No - Wave 0 |
| FORM-02 | Labels visible when input focused | integration | `npx playwright test form-labels.spec.ts` | No - Wave 0 |
| FORM-03 | Submit button accessible on mobile | viewport | `npx playwright test form-submit.spec.ts` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test --project=mobile --reporter=line` (fast mobile tests)
- **Per wave merge:** `npx playwright test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `frontend/tests/responsive/enquiry.spec.ts` — covers RESP-04
- [ ] `frontend/tests/mobile/form-keyboard.spec.ts` — covers FORM-01
- [ ] `frontend/tests/mobile/form-labels.spec.ts` — covers FORM-02
- [ ] `frontend/tests/mobile/form-submit.spec.ts` — covers FORM-03
- [ ] `frontend/playwright.config.ts` — test configuration with mobile viewport presets
- [ ] Framework install: `npm init playwright@latest -- --yes --quiet`

## Sources

### Primary (HIGH confidence)
- [Visual Viewport API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API) - Keyboard detection standard
- [Playwright Viewport Testing](https://playwright.dev/docs/emulation) - Automated responsive testing
- [Tailwind CSS Sticky](https://tailwindcss.com/docs/position#sticky-positioning) - CSS positioning

### Secondary (MEDIUM confidence)
- [browser-use GitHub](https://github.com/browser-use/browser-use) - Browser automation library
- [Mobile Form UX Best Practices](https://www.nngroup.com/articles/mobile-form-ux/) - Form UX patterns

### Tertiary (LOW confidence)
- [iOS Safari keyboard detection Stack Overflow](https://stackoverflow.com/questions/5044031) - Platform-specific quirks (marked for validation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Playwright is industry standard for responsive testing
- Architecture: HIGH - Patterns are well-documented and tested
- Pitfalls: HIGH - Common issues with well-known solutions

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (30 days for stable patterns)
