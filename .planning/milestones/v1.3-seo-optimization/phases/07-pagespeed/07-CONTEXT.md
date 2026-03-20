# Phase 7: PageSpeed Mobile LCP Optimization - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Optimize Mobile LCP (Largest Contentful Paint) from 9.2s to <2.5s and reduce image sizes across all pages. This is a performance optimization phase focused on Core Web Vitals improvements.

**Scope:**
- All 5 pages: Home, Services, About, Resources, Enquiry
- Image optimization across the site
- Third-party script optimization
- Resource loading improvements
- Static generation for blog pages

**Out of scope:**
- New feature development
- Design changes
- Backend modifications

</domain>

<decisions>
## Implementation Decisions

### LCP Element Priorities
- **Measurement approach:** Run PageSpeed Insights before and after changes, measure which elements cause slow LCP on each page
- **Priority images:** Let planner decide based on PageSpeed measurements which elements need priority

### Image Optimization Strategy
- **Format:** WebP format for all images (30-50% size reduction)
- **Quality:** Default quality (75%) - good balance of quality and size
- **Responsive images:** Use responsive images with srcset - mobile loads smaller, desktop loads larger

### Third-Party Script Handling
- **Google Analytics:** Keep current (afterInteractive) - already optimized
- **3D Globe (Coverage page):** Optimize/defer on mobile - it's heavy (~500KB+)
- **Calendly:** Dynamic import (covered in resource loading)

### Resource Loading Order
- **Fonts:** display:swap (already using next/font/google - this is optimal)
- **Dynamic imports:** Use next/dynamic for heavy components (3D globe, Calendly widget)
- **CSS:** Trust Tailwind built-in optimization

### Caching Strategy
- **CDN caching:** Use Vercel default (automatic edge caching)
- **Dynamic pages:** Let Vercel handle automatically

### Preload Critical Resources
- **Preload:** Add preload for critical fonts and hero images

### Static Generation
- **Blog pages:** Switch from SSR to static generation (SSG/ISR) - content doesn't change often, faster page loads

### Image CDN
- **Service:** Use Vercel Image (default with next/image on Vercel deployments)

### Pre-compress Images
- **Tool:** Add sharp as build dependency for build-time image optimization

### Fetch Priority
- **API:** Add fetchpriority='high' on LCP images - newer browser API that prioritizes critical images

### Bundle Analysis
- **Tool:** Add @next/bundle-analyzer to identify unused JavaScript

### Script Loading
- **Non-critical scripts:** Use lazyOnload strategy - load after page is fully interactive

### Image Decoding
- **Strategy:** Use decoding='async' on non-LCP images - moves decoding off main thread

### Page Prefetching
- **Strategy:** Trust Next.js default (automatic prefetch for Link components in viewport)

### SVG Optimization
- **Action:** Optimize SVG assets - remove metadata, use sprites, convert to React components

### Code Splitting
- **Action:** Use code splitting, defer non-critical JS (covered by dynamic imports for heavy components)

### Claude's Discretion
- **CLS prevention dimensions:** Decide based on PageSpeed measurements - add dimensions to all images or LCP images only
- **DOM simplification:** Decide based on bundle analysis results
- **Specific image sizes:** Let planner determine exact sizes for responsive images based on design

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Performance Best Practices
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
- Core Web Vitals: https://web.dev/vitals/
- Lighthouse Performance: https://developer.chrome.com/docs/lighthouse/performance

### Project Context
- `./CLAUDE.md` — Project conventions and tech stack
- `.planning/ROADMAP.md` — Phase 7 goal and requirements
- `.planning/phases/06-seo-optimization/06-CONTEXT.md` — Prior SEO phase (Core Web Vitals mentioned)

### Technical References
- Next.js dynamic imports: https://nextjs.org/docs/app/building-your-application/optimizing/code-splitting
- next/font: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- fetchpriority: https://web.dev/articles/fetch-priority-hint

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Current Image Usage
- `app/components/Navbar.tsx` — Logo has `priority` prop (good for LCP)
- `app/components/Hero.tsx` — Unsplash image, no priority yet
- `app/components/Footer.tsx` — Logo image, no priority
- `app/components/ResourcesContent.tsx` — Article cover images
- `app/components/industries/FeaturedPanel.tsx` — Industry images
- `app/components/Coverage.tsx` — 3D globe (heavy!)

### Existing Config
- `next.config.js` — Already configured for Unsplash remote patterns
- Fonts: IBM Plex Sans + Serif via next/font/google (optimal setup)

### Heavy Components to Optimize
- Three-globe in Coverage.tsx (~500KB+)
- Calendly widget in Enquiry form
- Possibly large hero images

### Third-Party Scripts
- Google Analytics (gtag) - loaded with afterInteractive
- Calendly widget - loaded on demand

</codebase_context>

<specifics>
## Specific Ideas

- Goal: Mobile LCP from 9.2s to <2.5s (target <2.5s is Google's "good" threshold)
- Approach: Measure first, then apply targeted fixes
- Blog pages: Switch to SSG for better performance
- 3D Globe: Critical optimization for mobile - current coverage page may be very slow on mobile

</specifics>

<deferred>
## Deferred Ideas

- Remove Google Analytics entirely (user chose to keep it)
- Custom caching headers beyond Vercel defaults
- Manual critical CSS inlining (user trusted Tailwind)
- External image CDN beyond Vercel default

</deferred>

---

*Phase: 07-pagespeed-mobile-lcp-9-2s-2-5s*
*Context gathered: 2026-03-18*
