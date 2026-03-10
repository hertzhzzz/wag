# WAG Website Improvements

## What This Is

Winning Adventure Global (WAG) company website - a Next.js-based corporate site for an Australian sourcing/consulting company that helps clients connect with verified suppliers in China. The site showcases services, company information, and includes an enquiry form for lead generation.

## Core Value

Improve mobile responsive layout to ensure the website provides an excellent user experience on all devices, particularly smartphones and tablets.

## Requirements

### Validated

(None yet - ship to validate)

### Active

- [ ] Improve responsive layout for Home page on mobile devices
- [ ] Improve responsive layout for Services page on mobile devices
- [ ] Improve responsive layout for About page on mobile devices
- [ ] Improve responsive layout for Enquiry form on mobile devices

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

**Mobile Considerations:**
- Tailwind already configured with responsive prefixes (md:, lg:, etc.)
- Current layout may have issues with touch targets, spacing, or content overflow on small screens
- Need to ensure all interactive elements are accessible on mobile

## Constraints

- **[Tech Stack]**: Next.js + Tailwind CSS — Must use existing stack
- **[Design]**: Navy (#0F2D5E) + Amber (#F59E0B) color scheme — Maintain brand consistency
- **[Content]**: All existing content must remain — No content removal

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Focus on responsive layout | Mobile-first approach ensures best experience | — Pending |

---
*Last updated: 2026-03-11 after project initialization*
