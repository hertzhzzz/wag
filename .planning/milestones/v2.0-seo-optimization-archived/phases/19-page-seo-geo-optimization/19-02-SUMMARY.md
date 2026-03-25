---
phase: 19-page-seo-geo-optimization
plan: 02
subsystem: seo
tags: [schema, ee-at, linkedin, reviews, testimonials]

# Dependency graph
requires:
  - phase: 19-01
    provides: PersonSchema with LinkedIn URL in sameAs array
provides:
  - Founder photo placeholder on About page
  - LinkedIn profile link on About page
  - ReviewSchema component with JSON-LD testimonials
  - Review schema on homepage and About page
affects:
  - phase: 19-03
  - phase: 19-04

# Tech tracking
tech-stack:
  added: []
  patterns:
    - JSON-LD schema injection via script tag with dangerouslySetInnerHTML
    - Placeholder pattern with TODO comments for user-provided content

key-files:
  created:
    - app/components/ReviewSchema.tsx - Review/Testimonial JSON-LD schema
  modified:
    - app/about/page.tsx - Founder photo placeholder, LinkedIn link, ReviewSchema
    - app/page.tsx - ReviewSchema import and usage

key-decisions:
  - "Used placeholder URL for LinkedIn since actual profile link not available"
  - "Created placeholder div for founder photo since no image file exists"
  - "ReviewSchema uses placeholder testimonials with TODO comment for user to replace"

patterns-established:
  - "Schema components follow FAQSchema pattern: client component with useEffect or dangerouslySetInnerHTML"

requirements-completed:
  - GEO-03
  - GEO-09

# Metrics
duration: 8min
completed: 2026-03-23
---

# Phase 19-02: Content E-E-A-T Signals Summary

**Founder photo placeholder, LinkedIn profile link, and ReviewSchema for testimonials on homepage and About page**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-23T07:17:06Z
- **Completed:** 2026-03-23T07:25:00Z
- **Tasks:** 3
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- Added founder photo placeholder div with TODO comment for user to provide /public/andy-liu.jpg
- Added LinkedIn profile link with SVG icon (placeholder URL: YOUR-LINKEDIN-USERNAME needs to be replaced)
- Created ReviewSchema component with 2 placeholder testimonials for JSON-LD schema
- Integrated ReviewSchema on both homepage and About page for E-E-A-T SEO signals

## Task Commits

Each task was committed atomically:

1. **Task 1 & 2: Founder photo and LinkedIn link** - `d45c3be` (feat)
2. **Task 3a: ReviewSchema component creation** - `a014254` (feat)
3. **Task 3b: ReviewSchema integration on both pages** - `684bdab` (feat)

## Files Created/Modified
- `app/components/ReviewSchema.tsx` - New component with JSON-LD review schema
- `app/about/page.tsx` - Added founder photo placeholder, LinkedIn link, ReviewSchema
- `app/page.tsx` - Added ReviewSchema import and usage

## Decisions Made
- Used placeholder URL `https://www.linkedin.com/in/YOUR-LINKEDIN-USERNAME` with TODO comment
- Used placeholder div instead of Image component since no photo file exists
- ReviewSchema follows the same pattern as FAQSchema (client component with JSON-LD injection)

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

The following items require user action before going live:
1. **Founder photo**: User should add `/public/andy-liu.jpg` (professional headshot)
2. **LinkedIn URL**: Replace `YOUR-LINKEDIN-USERNAME` in app/about/page.tsx with actual LinkedIn profile
3. **Testimonials**: Replace placeholder reviews in app/components/ReviewSchema.tsx with actual client testimonials

## Next Phase Readiness
- ReviewSchema component ready for use by subsequent plans
- E-E-A-T signals in place for About page and homepage
- Build passes successfully

---
*Phase: 19-page-seo-geo-optimization*
*Completed: 2026-03-23*
