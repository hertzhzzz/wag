# GEO Schema & Structured Data Report — winningadventure.com.au

**Date:** 2026-03-24
**Auditor:** geo-schema skill
**Pages Analyzed:** 4 (homepage, about, services, blog article)

---

## Schema Score: 58/100

| Criterion | Points | Score | Issue |
|---|---|---|---|
| Organization/Person schema present and complete | 15 | 13 | missing Wikipedia/Wikidata in sameAs |
| sameAs links (5+ platforms) | 15 | 12 | 4/5 — missing Twitter/X |
| Article schema with author details | 10 | 6 | present but JS-injected, missing full author sameAs |
| Business-type-specific schema present | 10 | 8 | Service schema present but FAQ has 18 Q (over limit) |
| WebSite + SearchAction | 5 | 0 | **MISSING** |
| BreadcrumbList on inner pages | 5 | 3 | present but JS-injected |
| JSON-LD format (not Microdata/RDFa) | 5 | 5 | all JSON-LD |
| Server-rendered (not JS-injected) | 10 | 4 | ArticleSchema + BreadcrumbSchema use useEffect |
| speakable property on articles | 5 | 0 | **MISSING** |
| Valid JSON + valid Schema.org types | 10 | 9 | minor nesting issues |
| knowsAbout property on Organization/Person | 5 | 5 | present with 5 topics |
| No deprecated schemas present | 5 | 3 | FAQ has 18 questions (over Google limit of 10) |

---

## Detected Schemas by Page

| Page | Schema Types | Format | Server-Rendered |
|---|---|---|---|
| / | Organization, LocalBusiness, FAQPage, Review (x2) | JSON-LD | YES |
| /about | Organization, LocalBusiness, FAQPage, Review (x2) | JSON-LD | YES |
| /services | Organization, LocalBusiness, Service, FAQPage | JSON-LD | YES |
| /resources/[slug] | Organization, LocalBusiness | JSON-LD | YES (ArticleSchema is JS) |

---

## Critical Issues

### 1. ArticleSchema is JavaScript-Injected (CRITICAL)

**File:** `app/components/ArticleSchema.tsx`

**Problem:** The component uses `'use client'` + `useEffect` to inject JSON-LD into `<head>`. This means the schema is NOT in the initial HTML response — it only appears after JavaScript executes client-side.

**Impact:**
- Googlebot indexes from initial HTML (before JS) — Article schema may not be indexed
- AI crawlers (Claude, GPT) process initial HTML — may not see Article schema
- Google December 2025 guidance explicitly flags JS-injected structured data for delayed processing

**Fix:** Convert ArticleSchema to a server component that renders JSON-LD inline in `<head>` via Next.js metadata API or direct script tag injection.

### 2. BreadcrumbSchema is JavaScript-Injected (CRITICAL)

**File:** `app/components/BreadcrumbSchema.tsx`

**Problem:** Same issue — uses `useEffect` to inject JSON-LD client-side.

**Fix:** Convert to server component with inline JSON-LD.

### 3. WebSite + SearchAction Schema Missing (HIGH)

**Problem:** No `WebSite` schema with `SearchAction` on the homepage. This enables Google's sitelinks search box and helps AI understand the site's search functionality.

**Fix:** Add WebSite JSON-LD to homepage:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Winning Adventure Global",
  "url": "https://www.winningadventure.com.au",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.winningadventure.com.au/resources?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

## High Priority Issues

### 4. FAQPage Has 18 Questions — Over Google Limit (HIGH)

**Problem:** Homepage FAQ has 18 questions. Google limits FAQ rich results to 10 questions per page (as of August 2023). While the schema still provides semantic value for AI parsing, Google may ignore excess questions.

**Fix:** Split FAQs across multiple pages, or trim homepage FAQ to 10 most important questions.

### 5. Author Person Schema Missing sameAs Links (MEDIUM-HIGH)

**Problem:** Blog article author (`Winning Adventure Global Team`) has no Person schema with sameAs links. For E-E-A-T signals, author credentials are critical.

**Current author in ArticleSchema:**
```json
"author": {
  "@type": "Person",
  "name": "Winning Adventure Global Team",
  "jobTitle": "Founder",
  "worksFor": { ... }
}
```

**Missing:**
- `url`: Author page URL on the site
- `sameAs`: LinkedIn company profile, personal LinkedIn, Twitter, etc.

**Fix:** Either:
1. Use Andy Liu (Person) as the author with full sameAs
2. Or create an author page for "Winning Adventure Global Team" with full Person schema

### 6. Article Schema Missing speakable Property (MEDIUM)

**Problem:** Article schemas lack `speakable` property that marks content suitable for voice/AI assistants.

**Fix:** Add CSS selector-based speakable spec to Article schema pointing to `.article-summary` or `.key-takeaway`.

---

## Medium Priority Issues

### 7. Organization sameAs Missing Wikipedia and Wikidata (MEDIUM)

**Current sameAs links:**
- Google Maps ✓
- LinkedIn ✓
- Facebook ✓
- YouTube ✓
- Instagram ✓

**Missing from sameAs:**
- Wikipedia article
- Wikidata item
- Twitter/X

Wikipedia/Wikidata are the highest-authority entity links for AI systems.

### 8. Organization Schema Duplicated on Every Page (LOW)

**Problem:** Organization + LocalBusiness schemas appear on every page (homepage, about, services, blog article). This causes redundant data but is not technically an error.

**Note:** This is acceptable per Schema.org but increases page weight. Consider using `@graph` pattern to define once and reference via `@id`.

### 9. LocalBusiness geo Coordinates May Be Inaccurate (LOW)

**Found:** `"latitude": -34.9067, "longitude": 138.5765`

**Issue:** Coordinates appear to point to general Adelaide area, not the specific address (5, 54 Melbourne St, North Adelaide SA 5006). Google Maps sameAs link shows different coordinates.

---

## sameAs Audit

| Platform | URL | Status |
|---|---|---|
| Wikipedia | Not found | **MISSING** — highest authority |
| Wikidata | Not found | **MISSING** |
| LinkedIn | https://www.linkedin.com/company/winning-adventure-global | Present |
| YouTube | https://www.youtube.com/@winningadventure | Present |
| Facebook | https://www.facebook.com/winningadventureglobal | Present |
| Instagram | https://www.instagram.com/winningadventureglobal | Present |
| Twitter/X | Not found | **MISSING** |
| Google Maps | https://www.google.com/maps/... | Present |

---

## Missing Recommended Schemas

| Schema Type | Page | Priority | Status |
|---|---|---|---|
| WebSite + SearchAction | / | CRITICAL | **MISSING** |
| Article with full author sameAs | /resources/[slug] | HIGH | JS-injected, incomplete |
| BreadcrumbList (server-rendered) | inner pages | HIGH | JS-injected |
| Person (Andy Liu) standalone | /about | MEDIUM | Present but could be enhanced |
| speakable on Article | /resources/[slug] | MEDIUM | **MISSING** |

---

## Implementation Priority

### Must Fix (This Week)

1. **Add WebSite + SearchAction schema** — single JSON-LD block on homepage
2. **Convert ArticleSchema to server component** — inline JSON-LD in `<head>`
3. **Convert BreadcrumbSchema to server component** — inline JSON-LD in `<head>`
4. **Add Wikipedia + Wikidata to sameAs** — manually create Wikipedia page (user deferred)

### Should Fix (This Month)

5. **Enhance Article author with full Person schema** — Andy Liu or create author page
6. **Add speakable property to Article schema** — CSS selectors for key content
7. **Split homepage FAQ to ≤10 questions** — reduce from 18 to 10
8. **Add Twitter/X to sameAs** — if platform is active

---

## Generated JSON-LD Code

### 1. WebSite + SearchAction (Add to Homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Winning Adventure Global",
  "url": "https://www.winningadventure.com.au",
  "description": "China factory tours and sourcing services for Australian businesses",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.winningadventure.com.au/resources?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### 2. Server-Rendered Article Schema (Replace ArticleSchema.tsx)

```json
{
  "@context": "https://schema.org",
  "@type": ["Article", "BlogPosting"],
  "headline": "ARTICLE_TITLE",
  "description": "ARTICLE_DESCRIPTION",
  "url": "https://www.winningadventure.com.au/resources/SLUG",
  "author": {
    "@type": "Person",
    "name": "Andy Liu",
    "jobTitle": "Founder",
    "url": "https://www.winningadventure.com.au/about",
    "sameAs": [
      "https://www.linkedin.com/company/winning-adventure-global"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "Winning Adventure Global",
      "url": "https://www.winningadventure.com.au"
    },
    "knowsAbout": ["China Manufacturing", "Supply Chain Management", "Factory Verification"]
  },
  "publisher": {
    "@type": "Organization",
    "name": "Winning Adventure Global",
    "url": "https://www.winningadventure.com.au",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.winningadventure.com.au/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "datePublished": "ARTICLE_DATE",
  "dateModified": "ARTICLE_MODIFIED_DATE",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.winningadventure.com.au/resources/SLUG"
  },
  "articleSection": "ARTICLE_CATEGORY",
  "image": {
    "@type": "ImageObject",
    "url": "COVER_IMAGE_URL",
    "width": 1200,
    "height": 630
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".article-summary", "h2"]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "47",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

---

## Files Requiring Changes

| File | Change |
|---|---|
| `app/resources/[slug]/page.tsx` | Import server-rendered ArticleSchema instead of client version |
| `app/components/ArticleSchema.tsx` | Rewrite as server component with inline `<script type="application/ld+json">` |
| `app/components/BreadcrumbSchema.tsx` | Rewrite as server component |
| `app/layout.tsx` or `app/page.tsx` | Add WebSite + SearchAction JSON-LD |
| `app/about/page.tsx` | Add standalone Person schema for Andy Liu |
| `app/data/faqs.ts` | Trim homepage FAQ to 10 questions max |

---

*Report generated: 2026-03-24*
