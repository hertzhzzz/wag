# Architecture Research: GEO Optimization for WAG

**Domain:** Next.js App Router website GEO (Generative Engine Optimization)
**Researched:** 2026-03-25
**Confidence:** MEDIUM

---

## Executive Summary

GEO optimization for the WAG Next.js App Router website requires adding an `llms.txt` endpoint, AI-specific meta tags, enhanced structured data for AI platforms, and crawler compliance monitoring. The existing schema infrastructure provides a solid foundation - Organization, LocalBusiness, Service, FAQPage, Article, Person, and Breadcrumb schemas are already implemented. The robots.txt already includes AI crawler rules for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended.

**Key finding:** The primary gap is the missing `llms.txt` endpoint and AI-specific metadata for citability optimization.

---

## System Overview

### Current Architecture (v2.0)

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Pages   │  │  Schema  │  │  Sitemap │  │  robots  │    │
│  │ (5 main) │  │Components│  │  .xml    │  │  .txt    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │            │
├───────┴─────────────┴─────────────┴─────────────┴────────────┤
│                    Existing Schemas (JSON-LD)                  │
│  Organization │ LocalBusiness │ Service │ FAQPage │ Article │
│  Person │ BreadcrumbList │ WebSite+SearchAction               │
└─────────────────────────────────────────────────────────────┘
```

### GEO Architecture (v3.0 additions)

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Pages   │  │  Schema  │  │  Sitemap │  │  robots  │    │
│  │ (5 main) │  │Components│  │  .xml    │  │  .txt    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │            │
├───────┴─────────────┴─────────────┴─────────────┴────────────┤
│                    Existing Schemas (JSON-LD)                  │
│  Organization │ LocalBusiness │ Service │ FAQPage │ Article │
│  Person │ BreadcrumbList │ WebSite+SearchAction               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │  llms.txt       │  │  AI Meta Tags │  │  AIIsa       │  │
│  │  Route Handler  │  │  (new comps)   │  │  (enhancement) │  │
│  └────────┬────────┘  └───────┬───────┘  └──────┬───────┘  │
│           │                   │                  │          │
└───────────┴───────────────────┴──────────────────┴──────────┘
```

---

## Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `app/llms.txt/route.ts` | Generate llms.txt markdown for AI crawlers | Next.js Route Handler (App Router) |
| `app/components/AIMetaTags.tsx` | Add AI-specific meta tags for citability | Client component with metadata API |
| `app/components/OrganizationSchema.tsx` | Enhanced org schema with AI-specific properties | Server component with JSON-LD |
| `robots.txt` (existing) | AI crawler permissions | Static file in `/public` |
| `sitemap.ts` (existing) | XML sitemap for all pages | Next.js MetadataRoute |

---

## Recommended Project Structure

```
wag/
├── app/
│   ├── llms.txt/
│   │   └── route.ts          # NEW: llms.txt endpoint
│   ├── components/
│   │   ├── AIMetaTags.tsx     # NEW: AI crawler meta tags
│   │   ├── EnhancedOrgSchema.tsx  # NEW: AI-enhanced organization schema
│   │   ├── FAQSchema.tsx      # EXISTING: No changes needed
│   │   ├── ArticleSchema.tsx  # EXISTING: No changes needed
│   │   ├── ServiceSchema.tsx  # EXISTING: No changes needed
│   │   └── PersonSchema.tsx  # EXISTING: No changes needed
│   ├── layout.tsx            # MODIFIED: Import AIMetaTags
│   ├── sitemap.ts            # EXISTING: Already comprehensive
│   └── api/
│       └── (existing)        # No changes needed
├── public/
│   ├── robots.txt            # MODIFIED: Add llms.txt reference
│   └── (existing assets)
└── content/
    └── blog/                 # Already indexed via sitemap
```

### Structure Rationale

- **`app/llms.txt/route.ts`:** App Router convention for static text outputs; returns markdown content with `Content-Type: text/plain`
- **`app/components/AIMetaTags.tsx`:** Follows existing component pattern; client component for dynamic AI bot detection
- **`public/robots.txt`:** Add `llms.txt` reference per AI crawler conventions

---

## Architectural Patterns

### Pattern 1: llms.txt Route Handler

**What:** A Next.js Route Handler that generates a markdown file listing all important pages with summaries.

**When to use:** For AI crawler accessibility (Perplexity, Claude, ChatGPT browsing).

**Trade-offs:**
- Pro: Provides explicit sitemap for AI systems
- Pro: Low implementation complexity
- Con: Not yet an official standard (community convention)

**Example implementation:**
```typescript
// app/llms.txt/route.ts
import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

function getPageSummaries(): { url: string; summary: string }[] {
  return [
    {
      url: 'https://www.winningadventure.com.au',
      summary: 'Winning Adventure Global helps Australian businesses connect with verified China manufacturers through guided factory tours and professional sourcing services.'
    },
    {
      url: 'https://www.winningadventure.com.au/services',
      summary: 'China sourcing services including factory tours, supplier verification, quality inspections, and end-to-end procurement coordination.'
    },
    {
      url: 'https://www.winningadventure.com.au/about',
      summary: 'About Andy Liu, founder of Winning Adventure Global with expertise in China manufacturing and supplier verification.'
    }
  ]
}

function getBlogSummaries() {
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(filename => {
      const slug = filename.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
      const { data, content } = matter(raw)
      return {
        url: `https://www.winningadventure.com.au/resources/${slug}`,
        summary: data.description || content.slice(0, 200)
      }
    })
}

export async function GET() {
  const pages = getPageSummaries()
  const blogs = getBlogSummaries()
  const allContent = [...pages, ...blogs]

  const markdown = `# Winning Adventure Global Site Map

This is a site map for AI systems. Last updated: ${new Date().toISOString()}.

## Site Structure

${allContent.map(page => `### ${page.url}
${page.summary}`).join('\n\n')}

---
Site: https://www.winningadventure.com.au
Purpose: B2B China sourcing services for Australian businesses
`

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
```

### Pattern 2: AI Meta Tags Component

**What:** Component that adds specific meta tags for AI citability optimization.

**When to use:** To improve how AI systems extract and cite content from pages.

**Trade-offs:**
- Pro: Standard meta tags improve AI content extraction
- Pro: Low overhead, no API dependencies
- Con: Limited standardization across AI platforms

**Example implementation:**
```typescript
// app/components/AIMetaTags.tsx
interface AIMetaTagsProps {
  title: string
  description: string
  url: string
  type: 'website' | 'article' | 'faq'
  publishedTime?: string
  author?: string
  section?: string
}

export default function AIMetaTags({
  title,
  description,
  url,
  type,
  publishedTime,
  author,
  section
}: AIMetaTagsProps) {
  return (
    <>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="author" content={author || 'Winning Adventure Global'} />
      <meta name="topic" content={section || 'China sourcing services'} />
      <meta name="generator" content="Winning Adventure Global" />

      {/* AI-specific */}
      <meta name="ai-content-url" content={url} />
      <meta name="ai-content-type" content={type} />
      {publishedTime && <meta name="article:published_time" content={publishedTime} />}
      {section && <meta name="article:section" content={section} />}

      {/* Canonical - critical for AI deduplication */}
      <link rel="canonical" href={url} />
    </>
  )
}
```

### Pattern 3: Enhanced Organization Schema

**What:** Enhanced JSON-LD schema with AI-specific properties for better entity recognition.

**When to use:** For pages where organization identity should be strongly emphasized.

**Trade-offs:**
- Pro: Improves entity recognition in AI systems
- Pro: Extends existing Organization schema
- Con: Some AI-specific properties not in official Schema.org

**Example implementation:**
```typescript
// app/components/EnhancedOrgSchema.tsx
export default function EnhancedOrgSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
    "name": "Winning Adventure Global",
    "url": "https://www.winningadventure.com.au",
    "logo": "https://www.winningadventure.com.au/logo.png",
    "description": "Expert China sourcing services for Australian businesses including guided factory tours, supplier verification, and end-to-end procurement coordination.",
    "founder": {
      "@type": "Person",
      "name": "Andy Liu",
      "jobTitle": "Founder",
      "url": "https://www.winningadventure.com.au/about",
      "sameAs": ["https://www.linkedin.com/in/andyliu-wag"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "5, 54 Melbourne St",
      "addressLocality": "North Adelaide",
      "addressRegion": "SA",
      "postalCode": "5006",
      "addressCountry": "AU"
    },
    "telephone": "+61-416588198",
    "ABN": "30 659 034 919",
    "areaServed": [
      { "@type": "Country", "name": "Australia" },
      { "@type": "Country", "name": "China" }
    ],
    "serviceType": ["Factory Tour", "Procurement Support", "Supplier Verification", "Quality Inspection"],
    "priceRange": "Contact for quote",

    // AI-specific enhancements
    "sameAs": [
      "https://www.linkedin.com/company/winning-adventure-global",
      "https://www.facebook.com/winningadventureglobal",
      "https://www.youtube.com/@winningadventure",
      "https://www.instagram.com/winningadventureglobal",
      "https://www.google.com/maps/place/Winning+Adventure+Global"
    ],
    "hasCredential": [
      { "@type": "EducationalOccupationalCredential", "name": "China Sourcing Agent" }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

## Data Flow

### llms.txt Generation Flow

```
Request (AI Crawler)
    ↓
GET /llms.txt
    ↓
Route Handler (route.ts)
    ↓
Read pages from config + blog MDX files
    ↓
Generate markdown with summaries
    ↓
Return Response (text/plain)
    ↓
Cache-Control: public, max-age=3600
```

### AI Crawler Detection (via robots.txt)

```
AI Crawler visits
    ↓
Check robots.txt for permissions
    ↓
If allowed: Crawl pages + read llms.txt
    ↓
Parse structured data + content
    ↓
Index for AI search/answers
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (small business) | Single llms.txt endpoint, static generation sufficient |
| 100+ blog posts | Consider generating llms.txt at build time, paginate |
| 1000+ pages | Dynamic generation with ISR caching |

### Scaling Priorities

1. **First consideration:** Add `Cache-Control` headers to llms.txt to reduce compute
2. **Second consideration:** If blog grows large, generate llms.txt at build time instead of runtime

---

## Anti-Patterns

### Anti-Pattern 1: Multiple Conflicting Schemas

**What people do:** Duplicate Organization schemas with conflicting data.

**Why it's wrong:** AI systems may pick the wrong data or ignore schemas entirely.

**Do this instead:** Consolidate Organization data in one place, reference in layout.tsx.

### Anti-Pattern 2: llms.txt with Promotional Content

**What people do:** Write llms.txt as marketing copy rather than structured summaries.

**Why it's wrong:** AI crawlers use llms.txt to understand page purpose; promotional content reduces citability.

**Do this instead:** Use factual summaries of page content, not marketing language.

### Anti-Pattern 3: Ignoring Canonical URLs

**What people do:** Missing or incorrect canonical URLs across pages.

**Why it's wrong:** AI systems may index duplicate content, diluting relevance.

**Do this instead:** Ensure all pages have correct canonical URLs (WAG already does this well).

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Perplexity AI | Read robots.txt + llms.txt | Already in robots.txt |
| ChatGPT Web Browsing | Read robots.txt + structured data | GPTBot already allowed |
| Claude AI | Read robots.txt + crawls web | ClaudeBot already allowed |
| Google AI Overviews | Read sitemap.xml + structured data | Google-Extended already allowed |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Pages -> Schemas | Server components import schemas | No runtime coupling |
| API Routes -> Pages | No direct coupling | Separate layers |
| llms.txt -> Pages | Reads MDX files via fs | Build-time or runtime read |

---

## Integration with Existing Architecture

### Components to ADD (new files)

1. **`app/llms.txt/route.ts`** - llms.txt endpoint
2. **`app/components/AIMetaTags.tsx`** - AI meta tags

### Components to MODIFY

1. **`app/layout.tsx`** - Import AIMetaTags and EnhancedOrgSchema
2. **`public/robots.txt`** - Add `Disallow` or reference for llms.txt if needed

### Components to VERIFY (no changes expected)

1. FAQSchema - Already comprehensive
2. ArticleSchema - Already comprehensive
3. ServiceSchema - Already comprehensive
4. PersonSchema - Already comprehensive
5. BreadcrumbSchema - Already comprehensive
6. sitemap.ts - Already comprehensive

---

## Recommended Build Order

1. **Phase 1:** Create `app/llms.txt/route.ts` - foundational for AI accessibility
2. **Phase 2:** Create `app/components/AIMetaTags.tsx` - add to all page layouts
3. **Phase 3:** Update `app/layout.tsx` to include AIMetaTags
4. **Phase 4:** Verify robots.txt has AI crawler rules (already done)
5. **Phase 5:** Update robots.txt to reference llms.txt location
6. **Phase 6:** Create EnhancedOrgSchema for about page (optional enhancement)

---

## Sources

**Note:** WebSearch was unavailable during research. This document is based on:
- Direct analysis of existing WAG codebase
- Standard Next.js App Router patterns
- Known GEO/llms.txt conventions from training data (2024-2025)

**Key conventions used:**
- llms.txt specification by Jeremy Helms (@baldand)
- Next.js App Router Route Handler patterns
- Schema.org JSON-LD standards

**Confidence:** MEDIUM - Web search verification recommended before implementation.

---

*Architecture research for: WAG v3.0 GEO Optimization*
*Researched: 2026-03-25*
