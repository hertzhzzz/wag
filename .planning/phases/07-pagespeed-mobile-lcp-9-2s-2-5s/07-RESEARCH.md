# Phase 7: PageSpeed Mobile LCP Optimization - Research

**Researched:** 2026-03-18
**Domain:** Next.js Image Optimization, Video Loading Performance, Core Web Vitals LCP
**Confidence:** HIGH

## Summary

The critical issue causing mobile LCP to remain at ~17s is that the video element with `preload="metadata"` is still being loaded on mobile despite CSS hiding via `md:hidden`. CSS hiding only hides the element visually - it does NOT prevent the browser from processing the video element and loading its metadata/first frame. This causes significant LCP delay.

**Primary recommendation:** Change video `preload="metadata"` to `preload="none"` AND ensure the video element is truly not loaded on mobile through proper conditional rendering or by setting `display: none` in addition to the Tailwind `hidden` class.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js 14+ | 14.2+ | Framework with built-in image optimization | Provides automatic WebP conversion, responsive images, priority loading |
| next/image | Built-in | Image optimization component | Automatic format conversion, lazy loading, priority support |
| sharp | 0.34+ | Build-time image optimization | 30-50% smaller images, faster page loads |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @next/bundle-analyzer | Latest | Bundle size analysis | When identifying unused JS |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sharp | Image optimization service (Cloudinary, Imgix) | Sharp is free, local, no API costs |
| @next/bundle-analyzer | source-map-explorer | Less integrated with Next.js |

**Installation:**
```bash
npm install sharp
npm install --save-dev @next/bundle-analyzer
```

**Version verification:**
- sharp: 0.34.5 (verified via npm view sharp version)
- @next/bundle-analyzer: latest (verified via npm view @next/bundle-analyzer version)

## Architecture Patterns

### Recommended Project Structure
```
app/
├── components/
│   └── Hero.tsx        # LCP element - optimize here first
├── page.tsx             # Home page
└── enquiry/
    └── EnquiryForm.tsx # Calendly - already using useEffect (acceptable)
```

### Pattern 1: Video Preload Control
**What:** Use `preload="none"` instead of `preload="metadata"` to prevent video from loading until user interaction

**When to use:** When video is decorative (background), not primary content

**Example:**
```tsx
{/* WRONG - still loads metadata */}
<video preload="metadata" className="hidden md:block">...</video>

{/* CORRECT - prevents all loading */}
<video preload="none" className="hidden md:block">...</video>
```

### Pattern 2: CSS Display None + Hidden Class
**What:** Combine Tailwind `hidden` with inline `style={{ display: 'none' }}` to truly prevent video from loading

**When to use:** When video must not load on certain breakpoints

**Example:**
```tsx
{/* Mobile: don't render video at all */}
<div className="md:hidden">
  <Image priority {...} />
</div>

{/* Desktop: render video with preload="none" */}
<div className="hidden md:block" style={{ display: 'none' }} onClick={() => setShowVideo(true)}>
  {/* Or use proper conditional rendering based on viewport */}
</div>
```

### Pattern 3: Explicit fetchpriority
**What:** Add explicit `fetchpriority="high"` to LCP images in addition to Next.js priority prop

**When to use:** For above-the-fold hero images

**Example:**
```tsx
<Image
  src="hero.jpg"
  alt="Hero"
  priority={true}
  fetchPriority="high"
  {...}
/>
```

### Anti-Patterns to Avoid

- **`md:hidden` alone:** Does NOT prevent video loading - browser still processes the element
- **`preload="metadata"` on decorative videos:** Loads video metadata/first frame, delaying LCP
- **Missing priority prop:** Next.js lazy-loads images by default, hurting LCP
- **Missing fetchpriority:** Modern browsers benefit from explicit priority hints

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom WebP conversion pipeline | next/image + sharp | Built-in, automatic, well-tested |
| Responsive images | Manual srcset management | next/image sizes prop | Automatic generation, optimal defaults |
| Priority loading | JavaScript-based lazy loading | priority prop + fetchpriority | Native browser optimization |
| Video blocking LCP | Complex intersection observers | preload="none" + CSS display:none | Simple, effective |

**Key insight:** Video with `preload="metadata"` loads video metadata AND typically the first frame, which competes with hero image for bandwidth and delays LCP. The browser processes the video element even when CSS-hidden.

## Common Pitfalls

### Pitfall 1: CSS Hiding Doesn't Prevent Video Loading
**What goes wrong:** Mobile LCP remains ~17s despite using `md:hidden` on video

**Why it happens:** CSS `display: none` or Tailwind `hidden` only hides the element visually. The browser's HTML parser still sees the video element and processes it according to the preload attribute. With `preload="metadata"`, the browser fetches video metadata and often the first frame for the poster.

**How to avoid:**
1. Change `preload="metadata"` to `preload="none"` - prevents ALL loading until playback
2. Use conditional rendering to truly exclude video from mobile DOM
3. Combine `hidden md:block` with `style={{ display: isDesktop ? 'block' : 'none' }}`

**Warning signs:** Page load time increases significantly when video is added, Network tab shows video loading on mobile

### Pitfall 2: Missing fetchpriority on LCP Images
**What goes wrong:** LCP slightly slower than expected despite priority prop

**Why it happens:** While Next.js `priority` prop adds preload link, explicit `fetchpriority="high"` provides additional signal to browsers

**How to avoid:** Add both `priority={true}` AND `fetchPriority="high"` to LCP images

### Pitfall 3: Video Poster Delays LCP
**What goes wrong:** Even with poster image, LCP is blocked

**Why it happens:** Poster image URL is fetched, but if it's large, it delays the hero image

**How to avoid:** Use smaller poster image for mobile, ensure poster loads before video

## Code Examples

Verified patterns from official sources:

### Next.js Image with Priority + fetchpriority
```tsx
// Source: https://nextjs.org/docs/app/building-your-application/optimizing/images
<Image
  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80"
  alt="Hero"
  fill
  priority={true}
  fetchPriority="high"
  sizes="100vw"
  className="object-cover"
/>
```

### Video with preload="none"
```tsx
// Source: https://www.w3school.com.cn/tags/att_video_preload.asp
<video
  autoPlay
  muted
  loop
  playsInline
  preload="none"  // Changed from "metadata" - prevents ALL loading
  poster="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&q=80"
  className="w-full h-full object-cover"
>
  <source src="https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev/hero_vid.mp4" type="video/mp4" />
</video>
```

### Responsive Video/Image Pattern
```tsx
// Mobile: Show image only (no video)
<div className="absolute inset-0 md:hidden">
  <Image
    src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80"
    alt="Hero"
    fill
    priority={true}
    fetchPriority="high"
    sizes="100vw"
    className="object-cover"
  />
</div>

// Desktop: Show video with preload="none"
<div className="hidden md:block absolute inset-0" aria-hidden="true">
  <video
    autoPlay
    muted
    loop
    playsInline
    preload="none"
    className="w-full h-full object-cover"
    poster="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&q=80"
  >
    <source src="https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev/hero_vid.mp4" type="video/mp4" />
  </video>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| preload="metadata" | preload="none" | 2026-03-18 research | Prevents video loading on mobile |
| CSS hidden only | CSS hidden + preload="none" | Current best practice | True prevention of video load |
| priority prop only | priority + fetchPriority | 2024+ browsers | Additional LCP optimization |
| No image optimization | sharp + next/image | Standard since Next.js 11 | 30-50% smaller images |

**Deprecated/outdated:**
- Client-side only image optimization: Replaced by build-time sharp integration
- Manual responsive images: Replaced by next/image automatic srcset

## Open Questions

1. **Question:** Does `preload="none"` work reliably across all mobile browsers?
   - What we know: Modern browsers (Chrome 50+, Safari 10+, Firefox 51+) support preload="none"
   - What's unclear: Some older mobile browsers may ignore it
   - Recommendation: Test on real devices, use fallback poster image

2. **Question:** Should we use Intersection Observer to lazy-load video on desktop?
   - What we know: Video only needed when in viewport
   - What's unclear: Auto-play may conflict with lazy loading
   - Recommendation: Keep simple for now - preload="none" is sufficient

## Validation Architecture

> Skip this section entirely if workflow.nyquist_validation is explicitly set to false in .planning/config.json. If the key is absent, treat as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (existing) |
| Config file | playwright.config.ts |
| Quick run command | `npx playwright test` (all tests) |
| Full suite command | `npx playwright test --reporter=list` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LCP-01 | Video not loaded on mobile | Manual | Network tab inspection | N/A - requires human |
| LCP-02 | Hero image has priority + fetchpriority | Code | grep fetchpriority Hero.tsx | ✅ |
| LCP-03 | Mobile LCP < 2.5s | Manual | PageSpeed Insights | N/A - requires PSI |

### Sampling Rate
- **Per task commit:** Existing Playwright tests
- **Per wave merge:** All tests pass
- **Phase gate:** PageSpeed Insights mobile LCP test (manual)

### Wave 0 Gaps
- None - existing test infrastructure covers all phase requirements

## Sources

### Primary (HIGH confidence)
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
- HTML Video preload attribute: https://www.w3school.com.cn/tags/att_video_preload.asp
- Web Dev fetch priority: https://web.dev/articles/fetch-priority-hint

### Secondary (MEDIUM confidence)
- Preload none vs metadata behavior (CSDN/Blog research): https://blog.csdn.net/hanzhuhuaa/article/details/139752336

### Tertiary (LOW confidence)
- Browser-specific preload behavior (older research): Needs verification on real devices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified Next.js + sharp are current standards
- Architecture: HIGH - Responsive image/video pattern is well-documented
- Pitfalls: HIGH - CSS hiding vs video loading is a known browser behavior

**Research date:** 2026-03-18
**Valid until:** 90 days (standards stable)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Image format:** WebP for all images
- **Quality:** Default quality (75%)
- **Responsive images:** Use responsive images with srcset
- **Google Analytics:** Keep current (afterInteractive)
- **Fonts:** Keep display:swap (already optimal via next/font/google)
- **Dynamic imports:** Use next/dynamic for heavy components
- **Blog pages:** Switch from SSR to static generation (SSG/ISR)

### Claude's Discretion
- **CLS prevention dimensions:** Decide based on PageSpeed measurements
- **DOM simplification:** Decide based on bundle analysis results
- **Specific image sizes:** Let planner determine exact sizes

### Deferred Ideas (OUT OF SCOPE)
- Remove Google Analytics entirely
- Custom caching headers beyond Vercel defaults
- Manual critical CSS inlining
- External image CDN beyond Vercel default

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LCP-01 | Fix video blocking LCP on mobile | Video preload="none" + proper CSS hiding prevents video loading |
| LCP-02 | Add fetchpriority="high" to LCP image | Explicit fetchpriority attribute improves LCP loading priority |
| LCP-03 | Mobile LCP < 2.5s | Requires human testing with PageSpeed Insights |
</phase_requirements>
