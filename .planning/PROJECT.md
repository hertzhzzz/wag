# WAG Website Improvements

## What This Is

Winning Adventure Global (WAG) company website - a Next.js-based corporate site for an Australian sourcing/consulting company that helps clients connect with verified suppliers in China. The site showcases services, company information, and includes an enquiry form for lead generation.

## Core Value

Improve mobile responsive layout to ensure the website provides an excellent user experience on all devices, particularly smartphones and tablets.

## Requirements

### Validated

- [x] Improve responsive layout for Home page on mobile devices — v1.0
- [x] Improve responsive layout for Services page on mobile devices — v1.0
- [x] Improve responsive layout for About page on mobile devices — v1.0
- [x] Improve responsive layout for Enquiry form on mobile devices — v1.0

### Active

## Current State: v1.0 Production Release

**Shipped:** 2026-03-18
**Phases:** 4 (06, 06.1, 07, 08)
**Plans:** 17 total

### v1.0 Accomplishments
- SEO optimization with metadata, schema, blog content
- Vercel deployment with Gmail credentials
- PageSpeed mobile LCP optimization (89 score)
- Security audit with headers, CORS, rate limiting

### Tech Debt
- Mobile LCP: 5.4s (target <2.5s) — Unsplash image source limitation

---

<details>
<summary>Previous milestone context (v1.0 MVP)</summary>

## Current Milestone: v1.1 Deployment & Minor Fixes

**Goal:** Deploy website to production and fix remaining minor issues

**Target features:**
- Deploy to Vercel with custom domain winningadventure.com.au
- Add Facebook social link to Footer
- Fix mobile navbar sticky behavior (user reported: scrolls away, can't tap)

</details>

## Next Milestone: v1.1 (Planning)

**Status:** Not yet defined

### Out of Scope

- [New feature development] — Focus on improving existing functionality
- [Backend changes] — No database or API changes required
- [Design system overhaul] — Keep existing design tokens and colors

## Context

**Current Stack:**
- Next.js 14.2 with App Router
- Tailwind CSS 3.4.0 for styling
- TypeScript
- Hosted: Not specified

**Existing Pages:**
- Home page (/)
- Services (/services)
- About (/about)
- Resources/Blog (/resources)
- Enquiry form (/enquiry)

**Mobile Status (v1.0 Complete):**
- All 5 pages verified working on 320px viewport
- Touch targets meet 44px minimum
- Navbar sticky behavior verified
- Horizontal scroll eliminated on all pages

**User Feedback:**
- Navbar sticky issue resolved (user confirmed)
- Touch target improvements applied

## Constraints

- **[Tech Stack]**: Next.js + Tailwind CSS — Must use existing stack
- **[Design]**: Navy (#0F2D5E) + Amber (#F59E0B) color scheme — Maintain brand consistency
- **[Content]**: All existing content must remain — No content removal

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Focus on responsive layout | Mobile-first approach ensures best experience | ✅ All 19 requirements satisfied |
| 320px minimum viewport | Covers smallest mobile devices | ✅ Verified via Playwright tests |
| Tailwind utility classes | Maintain existing patterns | ✅ Consistent across all pages |

---
*Last updated: 2026-03-17 after v1.0 milestone*

## Current Milestone: v1.1 Deployment & Minor Fixes

**Goal:** Deploy website to production and fix remaining minor issues

**Target features:**
- Deploy to Vercel with custom domain winningadventure.com.au
- Add Facebook social link to Footer
- Fix mobile navbar sticky behavior

---
*Last updated: 2026-03-18 after v1.0 production release*
