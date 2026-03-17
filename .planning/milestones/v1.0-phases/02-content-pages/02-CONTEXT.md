# Phase 2: Content Pages - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply responsive layout patterns to Services and About pages. This includes side padding, grid layouts, split sections, and touch targets for mobile devices (320px+).

</domain>

<decisions>
## Implementation Decisions

### Services Page - Side Padding
- Mobile (320px-767px): px-4 (16px) side padding
- Desktop (768px+): px-8 (32px) side padding
- Pattern: Same as home page (px-4 md:px-8)

### Services Page - Process Grid
- Desktop: 5-column grid (grid-cols-5)
- Mobile: 2-column grid (grid-cols-2)
- Pattern: grid-cols-2 md:grid-cols-5

### About Page - Side Padding
- Mobile: px-4 (16px) for all sections
- Desktop: Keep larger padding values (px-12, px-20, px-72) for visual hierarchy
- Pattern: px-4 md:px-12/20/72 based on section

### About Page - Split Section
- Desktop: Side-by-side (grid-cols-2)
- Mobile: Stacked vertically (grid-cols-1)
- Pattern: grid-cols-1 md:grid-cols-2

### About Page - Bridge Visual
- Desktop: 3-column horizontal layout
- Mobile: Single column vertical stack (澳企 → WAG → 中供应商)
- Pattern: Use flex-col on mobile

### Touch Targets
- All buttons: minimum 44px height
- All clickable links: adequate spacing (8px minimum)
- Pattern: min-h-11 class for buttons

### Claude's Discretion
- Specific Tailwind classes for each section
- Exact spacing values (gap-4 vs gap-6)
- Typography adjustments for mobile

</decisions>

<specifics>
## Specific Ideas

- Follow the same responsive patterns established in Phase 1 (home page)
- Keep existing design aesthetic, only adjust layout for mobile
- Preserve content and text, only change width/padding

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Services page: app/services/page.tsx - existing service cards
- About page: app/about/page.tsx - existing split sections
- Home page components: Already have responsive patterns to reference

### Established Patterns (from Phase 1)
- Mobile-first: px-4 for mobile, md:px-8/10/12 for desktop
- Touch targets: min-h-11 for 44px buttons
- Grid layouts: grid-cols-1 md:grid-cols-N

### Integration Points
- Modify app/services/page.tsx for Services page
- Modify app/about/page.tsx for About page

</code_context>

<deferred>
## Deferred Ideas

- Phase 3: Enquiry form responsive (not in scope)
- Phase 4: Resources page responsive (not in scope)

</deferred>

---

*Phase: 02-content-pages*
*Context gathered: 2026-03-11*
