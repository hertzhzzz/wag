# ROADMAP Review: Phase 14 Technical SEO Foundation

**Review Date:** 2026-03-20
**Reviewer:** Research Agent
**Confidence:** HIGH (verified against Next.js 16.1 official docs and current SEO standards)

---

## Executive Summary

Phase 14 is well-structured for foundational technical SEO, but has **four critical gaps** that must be addressed before or during execution. The most urgent issue is the **missing sitemap.xml** requirement, which is a standard crawling dependency that should accompany robots.txt. Additionally, **INP has replaced FID** as a Core Web Vital (March 2024), and the success criteria reference outdated FID thresholds. The phase also lacks OpenGraph/Twitter metadata coverage, which is essential for social sharing and is natively supported by Next.js Metadata API.

---

## 1. Technical Requirements Analysis

### 1.1 robots.ts (TECH-10) - VERIFIED CORRECT

| Aspect | Assessment |
|--------|------------|
| **Priority** | Correct - foundational crawl control |
| **Implementation** | Next.js MetadataRoute `app/robots.ts` - correct API |
| **Confidence** | HIGH - Next.js 16.1 natively supports this |

**Feedback:** No changes needed. TECH-10 is correctly prioritized as the first requirement.

---

### 1.2 Schema Server Components (TECH-11) - CORRECT BUT INCOMPLETE

| Aspect | Assessment |
|--------|------------|
| **Priority** | Correct - prerequisite for valid schema |
| **Scope** | Only mentions "Schema components" - too vague |

**Feedback:** Keep, but clarify scope. TECH-11 should explicitly list which schema types need Server Component conversion:
- BreadcrumbList (TECH-12)
- Organization schema (often missing but critical)
- WebSite schema (for rich results)
- Service/LocalBusiness schema (for service pages)

---

### 1.3 BreadcrumbList Schema (TECH-12) - CORRECT

| Aspect | Assessment |
|--------|------------|
| **Priority** | Correct |
| **Success Criteria** | "All pages" - appropriate scope |

**Feedback:** Keep as-is. However, note that TECH-14 (Article schema) is in Phase 15, creating artificial separation. All JSON-LD schema work should be cohesive.

---

### 1.4 Core Web Vitals (TECH-13) - CRITICAL UPDATE NEEDED

| Aspect | Assessment |
|--------|------------|
| **Current Criteria** | "LCP < 2.5s, CLS < 0.1, FID < 100ms" |
| **Problem** | **FID is deprecated since March 2024** |

**What Changed:**
- FID (First Input Delay) was **replaced by INP (Interaction to Next Paint)** on March 12, 2024
- INP measures all user interactions, not just the first
- FID < 100ms threshold does not map to INP

**Required Change:**
```
OLD: FID < 100ms
NEW: INP < 200ms (Google's "Good" threshold)
```

**Additional Missing Metrics:**
- **TTFB (Time to First Byte)** - often overlooked but affects LCP
- **FCP (First Contentful Paint)** - useful for diagnosis

---

### 1.5 Article Schema (TECH-14) - MISPLACED

| Aspect | Assessment |
|--------|------------|
| **Current Location** | Phase 15 |
| **Problem** | TECH-11 and TECH-12 (schema work) are in Phase 14 |

**Feedback:** Move TECH-14 to Phase 14. All JSON-LD schema implementation should be in the same phase because:
1. They all require the same TECH-11 Server Component refactoring
2. Schema validation testing is more efficient when grouped
3. BreadcrumbList and Article schema often share code patterns

---

### 1.6 Canonical URLs (TECH-15) - CORRECT

| Aspect | Assessment |
|--------|------------|
| **Priority** | Correct - prevents duplicate content issues |
| **Success Criteria** | "Correct canonical URLs" - needs specificity |

**Feedback:** Keep, but add specificity to success criteria:
- Specify handling of query parameters
- Specify trailing slash consistency
- Add test case for `/?utm_source=` scenarios

---

## 2. Missing Technical SEO Elements

### 2.1 CRITICAL: sitemap.xml

| Status | Not mentioned in any phase |
|--------|---------------------------|
| **Why Critical** | Primary discovery mechanism alongside robots.txt |
| **Next.js Support** | Native via `app/sitemap.ts` (MetadataRoute API) |

**Next.js Implementation (Official):**
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.winningadventure.com.au',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // ... additional URLs
  ]
}
```

**Recommendation:** Add TECH-16 "Implement sitemap.xml via Next.js MetadataRoute" to Phase 14.

---

### 2.2 CRITICAL: OpenGraph and Twitter Card Metadata

| Status | Not mentioned in any phase |
|--------|---------------------------|
| **Why Critical** | Social sharing is fundamental; OG tags affect click-through rates |
| **Next.js Support** | Native via `metadata` export in layout/page |

**Required Meta Tags:**
```typescript
export const metadata: Metadata = {
  openGraph: {
    title: '...',
    description: '...',
    url: '...',
    siteName: 'Winning Adventure Global',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '...',
    description: '...',
    images: ['/og-image.jpg'],
  },
}
```

**Recommendation:** Add TECH-17 "Implement OpenGraph and Twitter Card metadata" to Phase 14.

---

### 2.3 MEDIUM: next-sitemap Configuration

| Status | Not mentioned |
|--------|---------------|
| **Why Relevant** | Required for Google Search Console integration |
| **Use Case** | Automated sitemap submission via Search Console API |

**Recommendation:** Consider for TECH-16 (sitemap.xml) as part of post-build configuration.

---

### 2.4 MEDIUM: 404 and Error Pages

| Status | Not mentioned |
|--------|---------------|
| **Why Relevant** | Proper error pages prevent crawl waste and improve UX |
| **Next.js Support** | Native `not-found.tsx` |

**Recommendation:** Add to success criteria - verify all error paths return proper status codes.

---

### 2.5 LOW: hreflang for Future Multi-Language

| Status | Not in scope (correctly) |
|--------|-------------------------|
| **Reason** | REQUIREMENTS.md explicitly states "Australian market only for now" |
| **Note** | Should be added to v2.1 Advanced SEO if international expansion occurs |

---

## 3. Success Criteria Evaluation

### 3.1 Measurable and Testable Assessment

| Criteria | Measurable? | Testable? | Issue |
|----------|-------------|-----------|-------|
| robots.txt allows all public pages | Partial | Yes | No definition of "public" |
| JSON-LD renders as Server Components | Yes | Yes | Pass - requires build check |
| BreadcrumbList on all pages | Yes | Yes | Pass |
| Core Web Vitals pass | Yes | Yes | **FID reference outdated** |
| Correct canonical URLs | Partial | Yes | "Correct" undefined |
| Team expertise visible | Yes | Yes | Pass |
| China field experience stated | Yes | Yes | Pass |

### 3.2 Recommended Success Criteria Rewrite

```markdown
**Success Criteria** (what must be TRUE):
1. robots.txt allows all public pages and explicitly references sitemap.xml
2. All JSON-LD schema components (Organization, WebSite, BreadcrumbList, Article, Service)
   render as Server Components (verified via build output)
3. BreadcrumbList schema appears on all pages with valid itemListElement structure
   (verified via schema.org validator)
4. Core Web Vitals pass: LCP < 2.5s, CLS < 0.1, INP < 200ms (measured via PageSpeed Insights)
5. All pages have self-referencing canonical URLs; no missing or incorrect canonicals
   (verified via Screaming Frog)
6. Team expertise and experience visible on all pages via header/footer or layout
7. WAG China field experience stated on site (specific number of factories visited)
8. sitemap.xml exists and includes all public URLs
9. OpenGraph and Twitter Card metadata configured for all pages
```

---

## 4. Phase Dependencies Analysis

### 4.1 Current Dependency Chain

```
Phase 14 → Phase 15 → Phase 16 → Phase 17
```

### 4.2 Dependency Issues

| Issue | Location | Impact |
|-------|----------|--------|
| TECH-14 (Article schema) in Phase 15 | Phase 15 depends on Phase 14 for schema | TECH-14 requires TECH-11 (Server Components), creating implicit dependency |
| ARCH-01 (service pages) in Phase 15 | Phase 15 creates pages | TECH-14 needs these pages to exist for Article schema |

### 4.3 Recommendation: Refined Dependencies

```markdown
Phase 14: Technical SEO Foundation (revised)
  - TECH-10: robots.ts
  - TECH-11: Schema Server Components (Organization, WebSite, BreadcrumbList, Article, Service)
  - TECH-12: BreadcrumbList schema (moved from TECH-12, already in 14)
  - TECH-14: Article schema (moved from Phase 15)
  - TECH-15: Canonical URLs
  - TECH-16: sitemap.xml (NEW)
  - TECH-17: OpenGraph/Twitter metadata (NEW)
  - EEAT-01, EEAT-02: Team expertise signals

Phase 15: Content Architecture (revised)
  - ARCH-01: Service detail pages (now can use Article schema)
  - ARCH-02: Hub-and-spoke structure
  - ARCH-03: Internal linking strategy
```

**Rationale:** Schema work is monolithic - all schema types should be implemented together because they share patterns, validation testing, and Server Component infrastructure.

---

## 5. Summary of Changes

### Keep
- TECH-10 (robots.ts)
- TECH-11 (Server Components) - with expanded scope clarification
- TECH-12 (BreadcrumbList)
- TECH-15 (Canonical URLs)
- EEAT-01, EEAT-02

### Modify
- **TECH-13**: Replace "FID < 100ms" with "INP < 200ms"
- **Success Criteria**: Add sitemap.xml, OpenGraph, and more specific definitions
- **TECH-14**: Move Article schema from Phase 15 to Phase 14

### Add
- **TECH-16**: Implement sitemap.xml via Next.js MetadataRoute
- **TECH-17**: OpenGraph and Twitter Card metadata
- **Metadata export scope** to TECH-11 requirements

### Remove
- None

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| FID reference causes confusion | High | Low | Update success criteria immediately |
| Missing sitemap.xml delays indexing | High | High | Add to Phase 14 scope |
| Schema scattered across phases | Medium | Medium | Consolidate in Phase 14 |
| Social sharing failures | Medium | Medium | Add OpenGraph to Phase 14 |

---

## 7. Verification Checklist for Execution

Before marking Phase 14 complete, verify:

- [ ] `app/robots.ts` exists and exports correct configuration
- [ ] `app/sitemap.ts` exists and generates valid XML
- [ ] All schema files have no `'use client'` directive
- [ ] Schema validation passes (use schema.org validator)
- [ ] PageSpeed Insights shows LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Canonical URLs correct on all pages (including query parameter handling)
- [ ] OpenGraph metadata in all page layouts
- [ ] Twitter Card metadata configured
- [ ] Team expertise visible in shared layout (header/footer)
- [ ] "50+ factories in Guangdong" or similar stated

---

## Sources

| Source | Confidence | URL |
|--------|------------|-----|
| Next.js MetadataRoute sitemap | HIGH | https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap |
| INP replacing FID | HIGH | https://www.seroundtable.com/inp-google-core-web-vitals-march12-36819.html |
| Next.js Core Web Vitals optimization | MEDIUM | https://www.arttus.net/blog/nextjs-performance |
| Core Web Vitals INP 2025 | MEDIUM | https://web.developers.google.cn/ |

---

*Review completed: 2026-03-20*
*Next action: Update ROADMAP.md with revised Phase 14 scope before implementation*
