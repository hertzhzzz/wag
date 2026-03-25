# Stack Research: GEO Optimization

**Domain:** Next.js GEO (Generative Engine Optimization)
**Project:** WAG Website v3.0 GEO Optimization
**Researched:** 2026-03-25
**Confidence:** MEDIUM-HIGH

## Executive Summary

WAG already has a strong foundation for GEO. The robots.txt is already configured for AI crawlers, and existing schemas (Organization, LocalBusiness, FAQPage, Article, Service, Breadcrumb, Person) provide good AI-understandable structured data.

**No new packages are required for GEO.** The main work is:
1. Creating `llms.txt` (custom implementation, no library needed)
2. Optionally enhancing schemas with `SpeakableSpecification` for AI
3. Keeping current robots.txt configuration (already correct)

## Current Stack Assessment

### Already in Place (Good for GEO)

| Component | Status | Notes |
|-----------|--------|-------|
| robots.txt AI crawler rules | ✅ Complete | GPTBot, ClaudeBot, PerplexityBot, Google-Extended all allowed |
| Organization schema | ✅ In layout.tsx | Full details including founder, address, ABN, social links |
| LocalBusiness schema | ✅ In layout.tsx | Includes geo, openingHours, aggregateRating |
| FAQPage schema | ✅ Component | Good for AI Q&A extraction |
| Article/BlogPosting schema | ✅ Component | Includes aggregateRating (4.9/47) |
| Service schema | ✅ Component | OfferCatalog with 3 service offerings |
| Breadcrumb schema | ✅ Component | Good for path understanding |
| Person schema | ✅ About page | Founder Andy Liu |
| sitemap.xml | ✅ Next.js sitemap.ts | Auto-generated |

### Missing for Full GEO

| Component | Status | Notes |
|-----------|--------|-------|
| llms.txt | ❌ Missing | AI crawler-friendly content summary |
| robots.txt AI bot rules | ✅ Done | Already configured |

---

## Recommended Stack

### Core Technologies

**No new core technologies required.** GEO for Next.js is primarily configuration and content strategy, not library additions.

### Supporting Libraries

| Library | Version | Purpose | Recommendation |
|---------|---------|---------|-----------------|
| (none required) | - | llms.txt generation | Custom route handler, see implementation below |
| @unhead/schema-org | ^2.1.12 | Reference for schema patterns | Not needed - current inline approach is cleaner |

**Rationale:** No dedicated Next.js library exists for llms.txt generation. The ecosystem shows:
- `astro-llms-generate` (Astro)
- `nuxt-llms` (Nuxt)
- `eleventy-plugin-llms-txt` (Eleventy)

All use framework-specific build plugins. For Next.js, a custom route handler is the standard approach.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Next.js 16.1 App Router | Existing foundation | Works as-is |
| sitemap.ts | Existing | Already generating sitemap.xml |

---

## GEO Implementation Guide

### 1. llms.txt Generation

**Approach:** Create `/app/llms.txt/route.ts` - a dynamic route that generates llms.txt content.

```typescript
// /app/llms.txt/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

function generateLLMSTxt(): string {
  const baseUrl = 'https://www.winningadventure.com.au'

  const pages = [
    {
      title: 'Winning Adventure Global',
      url: baseUrl,
      description: 'China factory tours and sourcing services for Australian businesses. We help businesses visit verified manufacturers in China with bilingual guides and 12-point supplier verification.'
    },
    {
      title: 'Our Services',
      url: `${baseUrl}/services`,
      description: 'Two core services: China Factory Tour (2-3 pre-screened factories, bilingual guide, logistics handled) and Bulk Purchase Procurement Trip (end-to-end supplier negotiation and quality checks).'
    },
    {
      title: 'About Us',
      url: `${baseUrl}/about`,
      description: 'Founded by Andy Liu. Australian business helping companies source from China factories. Based in Adelaide, SA.'
    },
    {
      title: 'Resources',
      url: `${baseUrl}/resources`,
      description: 'Guides on China factory verification, 1688 sourcing, import regulations, and procurement strategies for Australian businesses.'
    },
    {
      title: 'Contact / Enquiry',
      url: `${baseUrl}/enquiry`,
      description: 'Submit an enquiry for China factory tour or sourcing services.'
    }
  ]

  // Add blog articles
  const blogFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))
  const articles = blogFiles.map(filename => {
    const slug = filename.replace('.mdx', '')
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
    const { data } = matter(raw)
    return {
      title: data.title || slug,
      url: `${baseUrl}/resources/${slug}`,
      description: data.description || data.title || ''
    }
  })

  const allPages = [...pages, ...articles]

  let output = `# Winning Adventure Global - AI-Friendly Site Summary\n\n`
  output += `Site: ${baseUrl}\n`
  output += `Purpose: Help Australian businesses connect with verified Chinese manufacturers through factory tours and procurement services.\n\n`
  output += `## Pages\n\n`

  for (const page of allPages) {
    output += `### ${page.title}\n`
    output += `URL: ${page.url}\n`
    output += `Summary: ${page.description}\n\n`
  }

  return output
}

export async function GET() {
  const content = generateLLMSTxt()
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
```

**Also add to robots.txt:**
```
# llms.txt - AI crawler friendly content summary
Sitemap: https://www.winningadventure.com.au/llms.txt
```

Or use Next.js metadata route to serve at `/llms.txt`:

```typescript
// /app/llms.txt/page.tsx (if you want /llms.txt route)
export default function LLMsTxtPage() {
  // Redirect to the route handler or inline the content
}
```

### 2. AI Crawler Detection (robots.txt)

**Current status: ✅ Already complete**

The existing robots.txt already has proper AI crawler rules:
```
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
```

**No changes needed.**

### 3. Structured Data Enhancements

**Current status: ✅ Strong foundation**

Existing schemas are well-implemented. Optional enhancements for AI visibility:

#### A. Add SpeakableSpecification to FAQPage

```typescript
// In FAQSchema.tsx - add to existing schema
"SpeakableSpecification": {
  "@type": "SpeakableSpecification",
  "cssSelector": [".faq-question", ".faq-answer"],
  "xpath": ["/html/head/title"]
}
```

This tells AI which content is most relevant for answering questions.

#### B. Add HowTo Schema for Procedural Content

For blog posts that are guides (e.g., "How to verify a Chinese factory"), add `HowTo` schema:

```typescript
// In ArticleSchema.tsx - conditional for guide content
"@type": ["Article", "BlogPosting", "HowTo"],
"step": [
  { "@type": "HowToStep", "text": "Step 1 description" },
  { "@type": "HowToStep", "text": "Step 2 description" }
]
```

#### C. Consider Corporation Schema

The Organization schema could explicitly set `@type: "Corporation"` for clearer entity typing.

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Third-party GEO "optimization" plugins | Often add bloat, no demonstrated benefit over native implementation | Custom implementation or established SEO tools |
| AI-generated content tools | Contradicts E-E-A-T principle of authentic expertise | Real content from real experience |
| Separate AI sitemap generators | Unnecessary - existing sitemap.ts covers this | Keep existing sitemap.ts |

---

## Alternative Approaches

### Option A: Static llms.txt (Simpler)

Generate llms.txt at build time and serve as static file:

```
/public/llms.txt
```

**Pros:** Simpler, no runtime generation
**Cons:** Must regenerate on content changes

### Option B: Dynamic Route (Recommended)

Generate via `/app/llms.txt/route.ts` as shown above.

**Pros:** Always current, can include dynamic content
**Cons:** Slight runtime overhead

### Option C: Next.js Metadata Route

Use Next.js 15+ `MetadataRoute` for `/llms.txt`:

**Note:** Next.js does not natively support `llms.txt` via MetadataRoute yet. Use Option B.

---

## Version Compatibility

| Package | Current | Compatible | Notes |
|---------|---------|------------|-------|
| Next.js | 16.1.7 | ✅ Yes | llms.txt route works with App Router |
| React | 19.2.4 | ✅ Yes | No conflicts |
| gray-matter | ^4.0.3 | ✅ Yes | Already in use for blog |
| next-mdx-remote | ^6.0.0 | ✅ Yes | Already in use |

---

## Installation

**No new packages required.**

To implement GEO features:

1. Create `/app/llms.txt/route.ts` (copy code from above)
2. Update `/app/components/FAQSchema.tsx` to add SpeakableSpecification (optional)
3. Verify robots.txt (already correct)

---

## Sources

- **llms.txt standard:** https://llmsst.com — Authoritative source on the llms.txt specification
- **robots.txt AI rules:** Based on OpenAI, Anthropic, Perplexity, and Google documentation
- **Schema.org SpeakableSpecification:** https://schema.org/SpeakableSpecification
- **Next.js 16.1 App Router:** Works as-is for dynamic routes
- **NPM ecosystem search:** Confirmed no mature Next.js llms.txt libraries exist

---

*Stack research for: GEO optimization*
*Researched: 2026-03-25*
