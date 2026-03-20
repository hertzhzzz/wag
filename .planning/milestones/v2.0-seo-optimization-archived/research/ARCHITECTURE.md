# Architecture Research: SEO Site Structure for WAG

**Domain:** B2B Sourcing Services Website (Australia-China)
**Project:** Winning Adventure Global Website
**Researched:** 2026-03-20
**Confidence:** MEDIUM

## Executive Summary

WAG's SEO architecture needs evolution from basic implementation to competitive levels. Current gaps include missing `robots.ts`, fragmented schema (Client Components where Server Components needed), no breadcrumb schema, no hub-and-spoke content architecture, and missing Article schema for blog posts. This research provides a phased architecture roadmap to achieve Domain Authority 20+ and rank above Epic Sourcing Australia and ChinaDirect Sourcing.

## Current Architecture Assessment

### What Exists

| Component | Status | Location |
|-----------|--------|----------|
| Sitemap | Basic | `app/sitemap.ts` |
| Metadata API | Per-page | `app/*/metadata.ts` |
| JSON-LD Schema | Partial | `app/layout.tsx`, `app/components/*Schema.tsx` |
| Google Analytics | Implemented | `app/layout.tsx` |
| robots.txt | **Missing** | - |

### Current Gaps (Priority Order)

| Gap | Impact | Effort |
|-----|--------|--------|
| No `robots.ts` | Crawl control impossible | Low |
| Schema in Client Components | SEO indexation risk | Medium |
| No breadcrumb schema | Lost sitelinks opportunity | Low |
| No Article schema | Blog posts not rich-indexed | Medium |
| Flat site structure | Weak topical authority | High |
| No service detail pages | Thin content, no long-tail keywords | High |
| No internal linking strategy | PageRank not distributed | Medium |

---

## Recommended Architecture: Hub-and-Spoke SEO Structure

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Search Engine Bot                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Sitemap │  │ Robots  │  │ JSON-LD │  │ Content │        │
│  │ Generator│ │ Generator│ │ Assembler│ │ Hub     │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                    Next.js App Router                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Metadata API Layer                        │    │
│  │  - Per-page metadata exports                          │    │
│  │  - generateMetadata() for dynamic pages               │    │
│  │  - canonical URLs                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Schema Assembly Layer                     │    │
│  │  - Organization (root layout)                        │    │
│  │  - LocalBusiness (root layout)                        │    │
│  │  - WebPage (per page)                                │    │
│  │  - BreadcrumbList (per page)                         │    │
│  │  - FAQPage (service pages)                           │    │
│  │  - Article (blog posts)                              │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Content Structure Layer                  │    │
│  │  - Hub page (/services)                              │    │
│  │  - Spoke pages (/services/[service-name])           │    │
│  │  - Resource center (/resources)                      │    │
│  │  - Blog posts (/resources/[slug])                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `app/sitemap.ts` | Generate XML sitemap | Next.js MetadataRoute API |
| `app/robots.ts` | Generate robots.txt | Next.js MetadataRoute API |
| `app/layout.tsx` | Global schema (Organization, LocalBusiness) | Static JSON-LD in `<head>` |
| `app/components/BreadcrumbSchema.tsx` | BreadcrumbList for each page | Server Component |
| `app/components/ServiceSchema.tsx` | Service schema | Convert to Server Component |
| `app/components/FAQSchema.tsx` | FAQPage schema | Convert to Server Component |
| `app/components/ArticleSchema.tsx` | BlogPosting schema | New Server Component |
| `app/resources/[slug]/page.tsx` | Blog post with full schema | Enhanced with Article schema |

---

## Recommended Project Structure

```
wag/
├── app/
│   ├── layout.tsx              # Root layout: Organization + LocalBusiness
│   ├── sitemap.ts              # Dynamic sitemap generation
│   ├── robots.ts               # NEW: Robots.txt generation
│   ├── page.tsx                # Homepage: Hub with FAQPage
│   ├── services/
│   │   ├── page.tsx            # Services hub page
│   │   ├── metadata.ts         # Services metadata
│   │   └── [service]/          # NEW: Service detail pages
│   │       ├── page.tsx
│   │       └── metadata.ts
│   ├── about/
│   │   ├── page.tsx
│   │   └── metadata.ts
│   ├── resources/
│   │   ├── page.tsx            # Resource center hub
│   │   ├── metadata.ts
│   │   └── [slug]/
│   │       ├── page.tsx        # Blog article with Article schema
│   │       └── metadata.ts
│   ├── enquiry/
│   │   ├── page.tsx
│   │   └── metadata.ts
│   ├── components/
│   │   ├── BreadcrumbSchema.tsx  # NEW: Server Component
│   │   ├── ServiceSchema.tsx     # Refactored: Server Component
│   │   ├── FAQSchema.tsx         # Refactored: Server Component
│   │   ├── ArticleSchema.tsx     # NEW: Blog post schema
│   │   └── FAQ.tsx
│   └── api/
├── content/
│   └── blog/                   # MDX blog content
└── lib/
    └── seo/
        ├── schema.ts           # NEW: Schema assembly utilities
        └── metadata.ts        # NEW: Shared metadata helpers
```

### Structure Rationale

- **`app/robots.ts`:** Next.js 13.3+ file-based metadata API for robots.txt
- **`app/services/[service]/`:** Flat hub-and-spoke structure for service pages; each service gets full page with targeted keywords
- **`app/components/*Schema.tsx`:** Server Components for all JSON-LD (not Client Components with `'use client'`)
- **`lib/seo/`:** Centralized SEO utilities for DRY schema and metadata management

---

## Architectural Patterns

### Pattern 1: Hub-and-Spoke Content Architecture

**What:** Central hub page linking to detailed spoke pages, with cross-links between related content.

**When to use:** B2B service sites with multiple related offerings.

**Example:**
```
/services (Hub)  ─────┬───> /services/factory-tours (Spoke)
                      ├───> /services/supplier-verification (Spoke)
                      └───> /services/quality-inspection (Spoke)

/resources (Hub)  ────┬───> /resources/how-to-source-from-china (Spoke)
                      └───> /resources/factory-visit-checklist (Spoke)
```

**Trade-offs:**
- Pros: Creates topical authority, distributes PageRank, improves crawl depth
- Cons: Requires content strategy investment

### Pattern 2: Hierarchical Schema Assembly

**What:** Layer schemas from general (Organization) to specific (Service) based on page type.

**When to use:** Every page should have WebPage schema referencing the Organization.

**Example:**
```typescript
// app/services/factory-tours/page.tsx
export const metadata = {
  // ... title, description, canonical
}

// Root layout already outputs: Organization + LocalBusiness
// This page adds:
const schemas = [
  WebPageSchema({ path: '/services/factory-tours' }),
  ServiceSchema({ name: 'Factory Tours', ... }),
  FAQPageSchema({ faqs: factoryTourFaqs }),
  BreadcrumbListSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: 'Factory Tours', url: '/services/factory-tours' },
  ]),
]
```

### Pattern 3: Dynamic Metadata with generateMetadata()

**What:** Use Next.js `generateMetadata()` for dynamic pages with full SEO control.

**When to use:** Blog posts, service detail pages, paginated content.

**Example:**
```typescript
// app/resources/[slug]/metadata.ts
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const article = await getArticle(params.slug)
  const baseUrl = 'https://www.winningadventure.com.au'

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      images: [{ url: article.coverImage, alt: article.title }],
    },
    alternates: {
      canonical: `${baseUrl}/resources/${params.slug}`,
    },
  }
}
```

---

## Data Flow

### Request Flow: SEO-Optimized Page

```
User/Bot Request
       ↓
Next.js App Router (matches route)
       ↓
┌──────────────────────────────────────┐
│  1. generateMetadata() [if dynamic] │
│  2. Page Component renders           │
│  3. Server Components output JSON-LD │
│  4. Children render                 │
└──────────────────────────────────────┘
       ↓
HTML Response
       ├── <head>: Metadata + JSON-LD
       └── <body>: Content + Schema Components
```

### Schema Assembly Flow

```
Page Context
    ↓
Determine Page Type (homepage|service|article|about)
    ↓
Assemble Relevant Schemas
    │
    ├── Always: WebPage + Organization reference
    ├── Homepage: LocalBusiness + FAQPage + Service
    ├── Service: Service + FAQPage + BreadcrumbList
    ├── Article: Article + BreadcrumbList + Author
    └── About: Organization (already in layout)
    ↓
Render as <script type="application/ld+json">
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-50 pages | Current flat structure + sitemap is sufficient |
| 50-200 pages | Add hub-and-spoke, service detail pages, improve internal linking |
| 200+ pages | Consider sub-sitemaps, pagination, faceted navigation |

### Scaling Priorities

1. **First bottleneck: Crawl depth** - Add service detail pages to reduce clicks from homepage to content
2. **Second bottleneck: Schema completeness** - Ensure every page has proper WebPage schema with breadcrumb
3. **Third bottleneck: Content freshness** - Implement systematic blog content pipeline

---

## Anti-Patterns

### Anti-Pattern 1: JSON-LD in Client Components

**What people do:** Using `'use client'` for schema components.

**Why it's wrong:** JSON-LD should be in initial HTML for search engines to parse before JavaScript executes. Client Components may not be indexed properly by all crawlers.

**Do this instead:**
```typescript
// app/components/FAQSchema.tsx
// Remove 'use client' - make it a Server Component
export default function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  )
}
```

### Anti-Pattern 2: Duplicate Organization Schema on Every Page

**What people do:** Including full Organization schema on every page.

**Why it's wrong:** Google's documentation states only ONE page should have Organization schema. Others should reference via `@id`.

**Do this instead:**
```typescript
// Root layout: Full Organization schema
// Service pages: WebPage schema with reference
{
  "@type": "WebPage",
  "@id": "https://www.winningadventure.com.au/services/#webpage",
  "publisher": {
    "@id": "https://www.winningadventure.com.au/#organization"
  }
}
```

### Anti-Pattern 3: Missing Canonical URLs

**What people do:** Not specifying canonical URLs, allowing search engines to index parameter variants.

**Why it's wrong:** Duplicate content dilutes PageRank and causes ranking conflicts.

**Do this instead:**
```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.winningadventure.com.au/services/factory-tours',
  },
}
```

### Anti-Pattern 4: Flat Site Structure with No Hierarchy

**What people do:** All pages at same depth (e.g., `/service-1`, `/service-2`, `/about`).

**Why it's wrong:** Search engines trust deeper pages less; no clear topical authority signals.

**Do this instead:**
```
/services (hub, high authority)
  ├── /services/factory-tours
  ├── /services/supplier-verification
  └── /services/quality-inspection
```

---

## Priority Implementation Order

Based on impact and dependencies:

### Phase 1: Foundation (1-2 days)
| Task | Impact | Notes |
|------|--------|-------|
| Create `app/robots.ts` | High | Enable crawl control |
| Convert `*Schema.tsx` to Server Components | High | Fix indexation risk |
| Add canonical URLs to all pages | Medium | Prevent duplicate content |

### Phase 2: Schema Completeness (2-3 days)
| Task | Impact | Notes |
|------|--------|-------|
| Add BreadcrumbList schema to all pages | Medium | Sitelinks eligibility |
| Add Article schema to blog posts | High | Rich results for articles |
| Add WebPage schema with Organization reference | High | Proper entity association |
| Consolidate duplicate Organization schema | Medium | Follow Google guidelines |

### Phase 3: Content Architecture (1-2 weeks)
| Task | Impact | Notes |
|------|--------|-------|
| Create service detail pages | High | Target long-tail keywords |
| Implement hub-and-spoke linking | High | Distribute PageRank |
| Add internal links between related content | Medium | Improve crawl depth |
| Create resource center hub page | Medium | Topical authority |

### Phase 4: Advanced SEO (ongoing)
| Task | Impact | Notes |
|------|--------|-------|
| Image sitemap | Low | Image indexing |
| Video schema (if using Remotion) | Medium | Video search visibility |
| Review/aggregate rating schema | Medium | Trust signals |
| Speakable specification | Low | Voice search readiness |

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Search Console | Verification via meta tag | Already implemented |
| Google Analytics | Script injection | Already implemented |
| Google Business Profile | LocalBusiness schema | Already implemented |
| Bing Webmaster | Verification via meta tag | Add to metadata |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Layout Pages | Props (children), Metadata exports | Server Components by default |
| Page Schema Components | Props (page data) | Pass data to schema components |
| lib/seo Pages | Import utilities | Shared helpers for DRY code |

---

## Sources

| Source | Confidence | Relevance |
|--------|------------|-----------|
| [Next.js Metadata API Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) | HIGH | Primary |
| [Google Structured Data Guidelines](https://developers.google.com/search/docs/structured-data) | HIGH | Primary |
| [Schema.org Documentation](https://schema.org/docs/schemas.html) | HIGH | Primary |
| [Next.js 13.3 File-Based Metadata API](https://nextjs.org/blog/next-13-3) | HIGH | Primary |
| [Google: Hierarchical Schema Best Practices](https://developers.google.com/search/docs/appearance/structured-data/organization) | HIGH | Primary |
| [Moz: Website Architecture for SEO](https://www.searchenginejournal.com/how-to-optimize-website-architecture-for-seo/477179/) | MEDIUM | Secondary |

---

*Architecture research for: WAG Website SEO Optimization*
*Researched: 2026-03-20*
