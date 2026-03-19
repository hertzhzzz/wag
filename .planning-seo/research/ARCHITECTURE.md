# Architecture Research: WAG SEO Site Structure

**Domain:** B2B service website (China factory tour + procurement service)
**Researched:** 2026-03-19
**Confidence:** MEDIUM-HIGH

## Executive Summary

WAG's current architecture is sound for a small site but lacks intentional topic cluster design. With 9 blog posts covering two distinct service pillars (Factory Tours, Bulk Procurement), the site has the foundation for topic authority but is not yet leveraging internal linking or pillar-cluster architecture to maximize SEO ranking potential.

**Critical finding:** WAG should transition from flat blog listing to intentional topic clusters with bidirectional internal links between pillar service pages and cluster blog posts. This is the single highest-impact architectural change available.

---

## Current Site Architecture

### URL Structure (As-Is)

```
/                           Homepage (priority 1.0)
/services                   Services overview (priority 0.9)
/about                     About + founder story (priority 0.7)
/resources                  Blog listing (priority 0.8)
/resources/[slug]           9 blog posts (priority 0.8 each)
/enquiry                    Contact form (priority 0.8)
```

### Current Internal Linking Map

```
Homepage
  -> /services (nav)
  -> /about (nav)
  -> /resources (nav + CTA)
  -> /enquiry (nav + CTA)

Services (/services)
  -> /resources/china-factory-tour-guide (card link)
  -> /resources/bulk-procurement-china-guide (card link)
  -> /enquiry (CTA)

Blog post (/resources/[slug])
  -> /resources (breadcrumb)
  -> /enquiry (sidebar CTA + bottom CTA)
  -> / (breadcrumb)

About (/about)
  -> /enquiry (CTA)
```

### Current Sitemap Assessment

sitemap.ts correctly assigns:
- Homepage: priority 1.0
- Services: priority 0.9
- Resources: priority 0.8
- Blog posts: priority 0.8
- Enquiry: priority 0.8
- All posts: changeFrequency 'weekly'

**Issue identified:** Blog posts all share identical priority (0.8) regardless of topic importance or how central they are to core service pillars.

---

## Recommended Topic Cluster Architecture

### Cluster Structure

For WAG's two service pillars, the recommended architecture is a **Hub-and-Spoke Topic Cluster**:

```
                        HOMEPAGE (Topical Hub)
                              |
              +---------------+----------------+
              |                               |
    /services (Primary Pillar 1)    /services (Primary Pillar 2)
    [Factory Tour Hub]             [Bulk Procurement Hub]
              |                               |
    +---------+---------+            +---------+---------+
    |         |         |            |         |         |
/resources/ /resources/ /resources/  /resources/ /resources/ /resources/
 factory-  verify-    canton-      bulk-     import-    australia-
 tour-     chinese-    fair-        procure-  from-      import-
 guide     supplier    guide        ment-     china      tips
                        |          guide
                   (cluster        |
                    spokes)    (cluster
                                spokes)
```

### Cluster Definitions for WAG

**Cluster A: Factory Tours & Supplier Discovery**
- Pillar page: /services (links to all factory-tour content)
- Supporting content:
  - /resources/china-factory-tour-guide (anchor: factory visit tips)
  - /resources/verify-chinese-supplier (anchor: supplier verification)
  - /resources/china-business-travel-guide-2026 (anchor: travel logistics)
  - /resources/china-supplier-verification (anchor: verification process)
  - /resources/china-vs-alibaba (anchor: direct sourcing vs platforms)

**Cluster B: Bulk Procurement & Import Operations**
- Pillar page: /services (links to all procurement content)
- Supporting content:
  - /resources/bulk-procurement-china-guide (anchor: bulk order process)
  - /resources/how-to-import-from-china (anchor: import procedures)
  - /resources/australia-import-tips (anchor: AU-specific requirements)
  - /resources/china-sourcing-risks (anchor: risk mitigation)

---

## URL Structure Decision: Flat vs Nested

### Recommendation: Hybrid Approach (Flat with Logical Grouping)

| URL Pattern | Current | Recommended | Rationale |
|-------------|---------|-------------|-----------|
| Blog posts | /resources/[slug] (flat) | Keep flat | Small site (<20 posts), flat works well |
| Category pages | None | /resources/factory-tours (future) | Only if content grows beyond 10+ posts per cluster |
| Service pages | /services | Keep as-is | Correct, primary conversion pages |

**Why flat works for WAG at current size:**
- Moz and Ahrefs both confirm flat URL structures perform equally to nested for sites under ~50 pages
- Nested URLs (/services/factory-tours/guide) add complexity without SEO benefit at small scale
- Flat URLs are easier to share, remember, and link to

**When to consider nested (threshold):**
- Blog grows beyond 10 posts per category
- Google Search Console shows difficulty ranking for category-specific keywords
- Site expands to multiple service sub-categories

---

## Keyword Targeting by Page

### Homepage (/)
**Target:** Brand + primary service category keywords
- "china sourcing australia"
- "factory tour china"
- "supplier verification china"
- "adelaide china sourcing"

**Strategy:** Homepage should establish topical authority by linking to both service clusters. Currently lacks explicit links to blog content.

### Services (/services)
**Target:** Service-specific transactional keywords
- "china factory tour service"
- "bulk purchase procurement china"
- "supplier verification service"

**Strategy:** This is the PRIMARY PILLAR PAGE for both topic clusters. Should link comprehensively to all related blog posts. Currently only links to 2 of 9 blog posts.

### About (/about)
**Target:** E-E-A-T signals and brand credibility keywords
- "china sourcing adelaide"
- "south australia sourcing company"
- "australian business china"

**Strategy:** About page is critical for E-E-A-T. Should link to founder's expertise evidence and any press/credentials. Currently links only to /enquiry.

### Blog Listing (/resources)
**Target:** Informational keywords and blog discovery
- "china factory tour guide"
- "how to import from china"
- "supplier verification tips"

**Strategy:** Listing page should organize posts by cluster (factory tours vs procurement), not just chronological. Add category filters.

### Individual Blog Posts (/resources/[slug])
**Target:** Long-tail informational + transactional keywords
- Each post has `primaryKeyword` and `secondaryKeywords` in frontmatter
- Posts should link to relevant service pillar page AND related cluster posts

**Strategy:** Each blog post is a CLUSTER CONTENT PAGE. Must include:
1. Link back to parent service (/services)
2. Links to 2-3 related posts within same cluster
3. Author byline with link to About page (E-E-A-T)

---

## Internal Linking Strategy

### Link Equity Flow (Target State)

```
HOMEPAGE (links out to both clusters)
  |
  +-> /services -----------+--> [Cluster A posts, strongest link equity]
  |                        |
  |                        +--> [Cluster B posts]
  |
  +-> /about --------> [E-E-A-T signal, passes authority to founder content]

/services (pillar page, receives and distributes link equity)
  |
  +-> /resources/china-factory-tour-guide
  +-> /resources/verify-chinese-supplier
  +-> /resources/bulk-procurement-china-guide
  +-> [etc - ALL cluster content]

Blog posts (cluster content, link back to pillar)
  |
  +-> /services (parent pillar)
  +-> Related posts (same cluster)
```

### Implementation Requirements

**From Service Page:**
- Each service card should link to its most relevant blog post (currently done for 2)
- Add "View all [topic] guides" link to each cluster section
- Consider adding a "Related Resources" section at bottom of /services

**From Blog Posts:**
- Breadcrumb: Home > Resources > [Category] > [Post Title]
- Sidebar CTA should link to relevant service, not just /enquiry generically
- Within content: natural links to related blog posts and service pages
- Author byline: "By Andy Liu" should link to /about

**From Homepage:**
- "Learn about our factory tour services" link -> /services
- "Learn about procurement support" link -> /services
- Featured blog posts should represent both clusters

### Internal Link Volume Guidelines

| Page Type | Minimum Internal Links | Target Internal Links |
|-----------|----------------------|----------------------|
| Homepage | 4 | 6-8 |
| Services (pillar) | 5 | 8-12 |
| About | 2 | 3-4 |
| Blog post | 3 | 5-8 |
| Enquiry | 0 | 1 (footer) |

---

## Structured Data Recommendations

### Current State

| Page | Schema | Status |
|------|--------|--------|
| /services | ServiceSchema | Good |
| Blog posts | None | Missing FAQPage |
| /about | FAQPage | Good |
| Homepage | FAQPage (via FAQSchema) | Partial |

### Missing Schema Types

**Homepage: Organization Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Winning Adventure Global",
  "url": "https://www.winningadventure.com.au",
  "logo": "https://www.winningadventure.com.au/logo.png",
  "description": "Australia-based China sourcing service for factory tours and supplier verification.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "5, 54 Melbourne St",
    "addressLocality": "North Adelaide",
    "addressRegion": "SA",
    "postalCode": "5006",
    "addressCountry": "AU"
  },
  "founder": {
    "@type": "Person",
    "name": "Andy Liu"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Australia"
  }
}
```

**Blog Posts: Article + FAQPage Schema**
- Add FAQPage schema to each blog post (currently only on /services and /about)
- Articles already have correct Open Graph metadata including author

**About Page: Person + LocalBusiness Enhancement**
- Person schema for Andy Liu with expertise in China sourcing
- LocalBusiness schema reinforcing Adelaide presence

---

## Sitemap & robots.txt Assessment

### Current State: GOOD

robots.txt:
```
User-agent: *
Allow: /
Sitemap: https://www.winningadventure.com.au/sitemap.xml
```

sitemap.ts correctly:
- Sets homepage priority 1.0
- Sets service pages priority 0.9
- Sets blog posts at 0.8
- Uses correct changeFrequency values

### No Changes Required

sitemap.ts and robots.txt are correctly configured. Only change if site grows significantly (new sections, subdomains).

---

## Next.js/Vercel Performance Optimizations

### Already Implemented (Good)

- Static generation via generateStaticParams for blog posts
- next/image for optimized images (assumed - not verified in code)
- Metadata API for SEO elements

### Recommendations

**1. Font Optimization**
Ensure next/font is used (not Google Fonts directly) for zero layout shift:
```typescript
import { IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font'
```

**2. Image Optimization**
All images should use next/image with:
- Explicit width/height or fill
- priority={true} for above-fold images
- Proper alt text

**3. Core Web Vitals Targets for SEO**

| Metric | Target | SEO Impact |
|--------|--------|------------|
| LCP | < 2.5s | High (ranking factor) |
| FID/INP | < 100ms | Medium |
| CLS | < 0.1 | Medium |

**4. Recommended next.config.js additions**
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
}
```

**5. Lazy Loading**
- All images below fold: default lazy load (next/image behavior)
- Blog post sidebar image: already lazy by default
- Hero images: use priority={true}

---

## Build Order (Priority Sequence)

### Phase 1: Quick Wins (1-2 hours)
1. Add breadcrumb navigation to blog posts (Home > Resources > [Category])
2. Update blog post sidebar CTA to link to relevant service (/services) not just /enquiry
3. Add "View all factory tour guides" / "View all procurement guides" links from /services
4. Add author byline with link to /about on all blog posts

### Phase 2: Topical Authority (Half day)
5. Add related posts section at bottom of each blog post (same cluster, 2-3 links)
6. Update /resources listing page to group by category (Factory Tours | Procurement)
7. Add FAQPage schema to blog posts
8. Add Organization schema to homepage

### Phase 3: Enhanced E-E-A-T (Half day)
9. Add Person schema for Andy Liu on About page
10. Enhance About page with explicit credentials/expertise evidence
11. Add "Expertise" section to About linking to specific blog posts
12. Add LocalBusiness schema with Adelaide address

### Phase 4: Structural (Only if content grows)
13. Consider /resources/factory-tours and /resources/procurement category pages
14. Add breadcrumb schema (JSON-LD) for all pages
15. Implement hub page for each cluster if content exceeds 10 posts per category

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Orphan Blog Posts
**What:** Blog posts with no internal links from pillar pages
**Why bad:** Search engines may crawl them rarely; link equity cannot flow to them
**Fix:** Every blog post must be linked from /services (pillar) or homepage

### Anti-Pattern 2: Generic Sidebar CTAs
**What:** Using same /enquiry CTA on all blog posts regardless of topic
**Why bad:** Misses opportunity to link to related service (Cluster A vs Cluster B posts should have different CTAs)
**Fix:** Factory-tour posts -> CTA for factory tour service. Procurement posts -> CTA for procurement service

### Anti-Pattern 3: No-Follow Internal Links
**What:** Using rel="nofollow" on internal links to "pass less link equity"
**Why bad:** Nofollow does not improve SEO; it only prevents equity flow
**Fix:** Never nofollow internal links

### Anti-Pattern 4: Orphan Pillar Pages
**What:** Service page (/services) has no links TO it from homepage or blog posts
**Why bad:** Pillar pages need incoming link equity to pass to cluster content
**Fix:** Homepage must link prominently to /services; blog posts must link back

### Anti-Pattern 5: Identical Meta Descriptions
**What:** All blog posts share same or similar meta descriptions
**Why bad:** Reduces click-through rate in SERPs; signals low content differentiation
**Fix:** Each post should have unique, compelling meta description incorporating its primary keyword

---

## Quality Gates

- [x] Components clearly defined with boundaries
- [x] Data flow direction explicit (link equity: homepage -> pillar -> cluster)
- [x] Build order implications noted (quick wins before structural changes)
- [x] URL structure decision documented with rationale
- [x] Internal linking strategy specified with link volume targets
- [x] Keyword targeting by page defined
- [x] Structured data gaps identified
- [x] Sitemap/robots.txt assessed as adequate
- [x] Performance optimization recommendations provided
- [x] Anti-patterns catalogued

---

## Sources

- Moz Blog: Topic Clusters Guide (2025) - https://moz.com/blog/blog-topic-clusters
- Slickplan: SEO Silo Architecture (2024) - https://slickplan.com/blog/silo-architecture
- Ahrefs: Website Structure for SEO (2023) - https://ahrefs.com/blog/website-structure/
- Next.js 14 Documentation: Metadata API, Image Optimization, Font Optimization
- Google Search Central: Structured Data Guidelines

---

*Architecture research for: WAG SEO project*
*Researched: 2026-03-19*
