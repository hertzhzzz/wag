---
phase: 06-seo-optimization
plan: "05"
subsystem: Blog Article Page
tags: [gap-closure, hero-section, cover-image]
dependency_graph:
  requires: []
  provides:
    - "Cover image displayed in Hero section"
  affects:
    - "app/resources/[slug]/page.tsx"
tech_stack:
  added: []
  patterns:
    - "Conditional rendering with && operator for optional cover image"
    - "Responsive image sizing with clamp/mobile breakpoints"
key_files:
  created: []
  modified:
    - "app/resources/[slug]/page.tsx"
decisions:
  - "Used conditional && rendering for cover image (graceful fallback for articles without)"
  - "Responsive height: 200px mobile, 300px desktop"
metrics:
  duration: 1 min
  completed_date: "2026-03-18"
---

# Phase 06 Plan 05: Display Cover Image in Blog Hero Summary

## Objective

Display the blog article cover image in the Hero section, not just in OpenGraph metadata.

## Gap Description

User reported article's cover image is not displayed on the page (only in OpenGraph metadata).

## Solution

Modified the Hero section in `app/resources/[slug]/page.tsx` to:
- Add conditional cover image display when `fm.coverImage` exists
- Use responsive sizing: `h-[200px]` mobile, `h-[300px]` desktop
- Use `object-cover` for proper aspect ratio preservation
- Added `mb-8` to metadata for spacing before image
- Changed `py-16` to `pb-16` to balance image at bottom

## Implementation Details

```typescript
{/* Cover image */}
{fm.coverImage && (
  <div className="mt-6 rounded-lg overflow-hidden">
    <img
      src={fm.coverImage}
      alt={fm.title}
      className="w-full h-[200px] md:h-[300px] object-cover"
    />
  </div>
)}
```

## Verification

- Build passes: `npm run build` completes successfully
- All 17 static pages generated correctly
- Cover image renders in Hero section for articles with coverImage
- No image shown for articles without coverImage (graceful fallback)

## Tasks Completed

| Task | Name | Status |
|------|------|--------|
| 1 | Add cover image to Hero section | Done |
| 2 | Verify build passes | Done |

## Commits

- `653affe8`: feat(06-05): display cover image in blog article Hero section

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] Modified file exists: app/resources/[slug]/page.tsx
- [x] Commit exists: 653affe8
- [x] Build passes without errors
