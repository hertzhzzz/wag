# Phase 7: PageSpeed Mobile LCP Optimization - Context Save

**Date:** 2026-03-18
**Status:** Research completed, ready for execution

---

## Completed Research

### Critical Finding: Hero Component Bug

**File:** `app/components/Hero.tsx`

**Issue:** Video element covering the image is blocking LCP
- Image has `priority={true}` ✅
- But video with `preload="metadata"` is the actual LCP element
- On mobile, video may be blocking image rendering

### Coverage Component - Already Optimized ✅
- Uses `dynamic(() => import('react-globe.gl'), { ssr: false })`
- No changes needed

### Calendly - Already Client-Side ✅
- Loads via useEffect
- Not optimal but functional

---

## Revised Plan (07-01-PLAN.md)

### Tasks to Execute:

1. **07-01 (CRITICAL)**: Fix Hero video blocking LCP
   - Add mobile-specific image (hide video, show image on mobile)

2. **07-02**: Verify image attributes
   - Hero has priority ✅
   - Navbar logo check needed

3. **07-04**: Install sharp
   - `npm install sharp`

4. **07-07**: Final verification
   - PageSpeed Insights test

### Skipped Tasks:
- 07-03 (Calendly) - Already works
- 07-05 (Bundle analysis) - Optional
- 07-06 (SVG optimization) - Optional

---

## Dependencies to Add

```bash
npm install sharp
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `app/components/Hero.tsx` | Add mobile-specific image/video handling |
| `package.json` | Add sharp |

---

## Execution Prompt

```
/gsd:execute-phase 7.1 && /gsd:execute-phase 7.2 && /gsd:execute-phase 7.4 && /gsd:execute-phase 7.7
```

Or manually:
1. Fix Hero component for mobile
2. Install sharp
3. Run build
4. Test with PageSpeed Insights
