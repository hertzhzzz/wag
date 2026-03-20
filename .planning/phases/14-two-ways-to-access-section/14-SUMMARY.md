---
phase: 14-two-ways-to-access-section
plan: 14
subsystem: ui
tags: [nextjs, tailwind, lucide-react, intersection-observer]

# Dependency graph
requires:
  - phase: 13-ui-optimization
    provides: HowItWorks component (animation pattern reference)
provides:
  - TwoWaysAccess section with two service cards (Full Service + Directory Access)
  - Amber/navy card styling following design system
affects:
  - phase: 15-directory-section
  - phase: 16-floating-button

# Tech tracking
tech-stack:
  added: [lucide-react Compass icon, lucide-react Database icon]
  patterns: IntersectionObserver scroll-triggered fade-in-up (700ms, 150ms stagger)

key-files:
  created: [app/components/TwoWaysAccess.tsx]
  modified: [app/page.tsx]

key-decisions:
  - "Full Service card uses amber/5 background with amber/30 border as primary emphasis"
  - "Directory Access card uses default white with navy/5 border as secondary"
  - "IntersectionObserver threshold 0.15 (15% visibility triggers animation)"
  - "CTA hover uses gap-3 to gap-4 transition for arrow slide effect"

patterns-established:
  - "Two-card grid layout: grid-cols-1 md:grid-cols-2 with gap-6 md:gap-8"
  - "Section container: bg-white py-20 md:py-28 px-4 md:px-8 + max-w-[1400px] mx-auto"
  - "Chinese bullet points add authentic China expertise signal"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-03-20
---

# Phase 14: Two Ways to Access Section Summary

**Two Ways to Access section with Full Service guided tours and Factory Directory Access cards, amber/navy design system**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-20T06:27:52Z
- **Completed:** 2026-03-20T06:29:49Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- TwoWaysAccess component with two distinct service cards
- Full Service card: amber styling (bg-amber/5, border-amber/30, amber shadow glow)
- Directory Access card: white/navy styling (bg-white, border-navy/5, subtle shadow)
- IntersectionObserver scroll-triggered animation (700ms duration, 150ms stagger)
- Chinese bullet points for authentic China expertise signal
- Both CTAs link to /enquiry with hover gap-4 arrow slide effect
- Homepage integrated between HowItWorks and Industries sections

## Task Commits

1. **Task 1: Create TwoWaysAccess Component** - `ec2096b3` (feat)
2. **Task 2: Integrate Into Homepage** - `32801a11` (feat)
3. **Task 3: Verify (build)** - `32801a11` (build passed, lint pre-existing issue)

## Files Created/Modified
- `app/components/TwoWaysAccess.tsx` - New Two Ways to Access section component
- `app/page.tsx` - Added TwoWaysAccess import and placement between HowItWorks and Industries

## Decisions Made

- Full Service card (primary) uses amber emphasis to guide user attention
- Directory Access card (secondary) uses subtle navy/5 border to differentiate without competing
- Section eyebrow "Our Services" in italic amber tracking-wide follows HowItWorks pattern
- Chinese bullet points for both cards reinforce authentic China expertise positioning

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npm run lint` fails with "Invalid project directory provided, no such directory: /Users/mark/Projects/wag/lint" - pre-existing project issue unrelated to this phase. ESLint on modified files passes cleanly.

## Next Phase Readiness

- TwoWaysAccess component ready for Phase 15 Directory Section integration
- Phase 16 Floating Contact Button can be developed independently
- No blockers for downstream phases

---
*Phase: 14-two-ways-to-access-section*
*Completed: 2026-03-20*
