# Phase 10: Content Strategy - Research

**Researched:** 2026-03-18
**Domain:** SEO Content Strategy (Blog + FAQ + Service Pages)
**Confidence:** HIGH

## Summary

Phase 10 requires creating 3 SEO-optimized blog guides, expanding the FAQ section with Schema markup, and optimizing service pages with target keywords. The project already has a mature MDX-based blog system with detailed content guidelines, an existing FAQ component with JSON-LD schema, and service pages with basic metadata. The key work involves generating new content following existing patterns, expanding FAQ from 4 to 10-15 questions, and enhancing service page metadata with high-intent commercial keywords.

**Primary recommendation:** Use existing BLOG_PROMPT.md for content generation (1500-2200 words per guide), expand existing FAQ data file with 6-11 new questions, and update service page metadata with target keywords "factory visit", "supplier sourcing", "China procurement".

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Content topics: "How to Import from China" (Australia focus), "China Supplier Verification" (due diligence), "Australia Import Tips" (regulations)
- Content length: 1500-2200 words per BLOG_PROMPT.md
- FAQ: 10-15 questions, inline accordion-style on services/about pages, FAQPage JSON-LD schema
- Keywords: High-intent commercial — "factory visit", "supplier sourcing", "China procurement"
- Pages to optimize: All service pages + homepage

### Claude's Discretion
- Exact FAQ question text and wording
- Specific H2/H3 structure within each guide
- Internal linking strategy between guides
- Service page content additions vs metadata-only optimization

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | Create "How to Import from China" guide (blog post) | Existing blog system with MDX, frontmatter fields, quality checklist in BLOG_PROMPT.md |
| CONT-02 | Create "China Supplier Verification" guide (blog post) | Same content system, supplier verification topic aligns with existing brand expertise |
| CONT-03 | Create "Australia Import Tips" guide (blog post) | Same content system, Australian market focus per brand positioning |
| CONT-04 | Add FAQ section to website with schema markup | Existing FAQ.tsx (accordion), FAQSchema.tsx (JSON-LD), faqs.ts (data) - needs expansion to 10-15 questions |
| CONT-05 | Optimize service pages with target keywords | Service page metadata exists, needs high-intent keyword enhancement |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gray-matter | ^4.0.3 | MDX frontmatter parsing | Already integrated, reads blog metadata |
| next | 14.2.x | App Router, metadata API | Already in use for SEO |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.400.0 | Icons (CheckCircle for service cards) | Already in use |
| @playwright/test | ^1.58.2 | E2E testing | For validating pages and content |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom FAQ component | Use existing FAQ.tsx | Existing accordion component is well-styled and accessible |
| Manual JSON-LD | Use existing FAQSchema.tsx | Existing schema generator already produces valid FAQPage markup |

**Installation:**
No new packages required - all infrastructure already exists.

## Architecture Patterns

### Recommended Project Structure

```
content/blog/
├── china-factory-tour-guide.mdx       # Existing
├── verify-chinese-supplier.mdx        # Existing
├── ...                                # 6 existing posts
├── how-to-import-from-china.mdx       # NEW - CONT-01
├── china-supplier-verification.mdx   # NEW - CONT-02
└── australia-import-tips.mdx          # NEW - CONT-03

app/
├── data/
│   └── faqs.ts                        # Expand from 4 to 10-15 questions
├── components/
│   ├── FAQ.tsx                        # Existing accordion component
│   └── FAQSchema.tsx                  # Existing JSON-LD generator
├── services/
│   └── page.tsx                       # Add FAQ section + keyword optimization
└── about/
    └── page.tsx                       # Add FAQ section (optional per CONTEXT)
```

### Pattern 1: Blog Content Generation
**What:** Create SEO-optimized MDX blog posts following existing guidelines
**When to use:** For CONT-01, CONT-02, CONT-03
**Example:**
Use BLOG_PROMPT.md workflow:
1. Define topic, primary keyword, secondary keywords
2. Generate MDX following frontmatter template (title, seoTitle, description, etc.)
3. Include 5-7 H2 sections with Tip blocks
4. Include exactly 2 InlineCTA components
5. End with FAQ section (3-5 questions)
6. Output JSON-LD Article schema

**Source:** content/BLOG_PROMPT.md (detailed guidelines)

### Pattern 2: FAQ Integration
**What:** Add accordion FAQ with JSON-LD schema to pages
**When to use:** For CONT-04
**Existing Implementation:**
```typescript
// app/components/FAQ.tsx - accordion component
'use client'
import { useState } from 'react'
import { faqs } from '@/data/faqs'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  // Renders accordion with {faqs.map(...)}
}
```

```typescript
// app/components/FAQSchema.tsx - JSON-LD generator
'use client'
import { faqs } from '@/data/faqs'

export default function FAQSchema() {
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
  // Renders <script type="application/ld+json">
}
```

**Expansion needed:** Add 6-11 more questions to faqs.ts, import FAQ + FAQSchema to service pages

### Pattern 3: Service Page Keyword Optimization
**What:** Update metadata with high-intent commercial keywords
**When to use:** For CONT-05
**Example:**
```typescript
// app/services/page.tsx - current metadata
export const metadata: Metadata = {
  title: 'China Sourcing Services | Factory Tours & Supplier Verification',
  description: 'Our China sourcing services include factory tours...',
  keywords: ['china sourcing services', 'factory tour china', 'supplier verification china', 'china procurement', 'quality inspection china'],
}
```

**Enhancement needed:** Add "factory visit", "supplier sourcing", "China procurement" as primary keywords in metadata + add content sections with these keywords

### Anti-Patterns to Avoid
- **Content without frontmatter**: All blog posts MUST have complete frontmatter per BLOG_PROMPT.md template
- **Duplicate FAQ questions**: Questions must be unique and not repeat content from existing blog posts
- **Keyword stuffing**: Natural keyword placement in content, not repeated unnaturally
- **Missing FAQSchema**: Every page with FAQ must include FAQSchema component for JSON-LD
- **Wrong internal links**: Use relative paths `/services`, not `/resources/services`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Blog content format | Create custom MDX template | Follow existing BLOG_PROMPT.md | Already has detailed frontmatter, section structure, component rules |
| FAQ accordion | Build new accordion component | Use existing FAQ.tsx | Already styled, accessible, client-side state handled |
| FAQ schema | Write manual JSON-LD | Use existing FAQSchema.tsx | Already generates valid FAQPage schema from faqs.ts data |
| FAQ data management | Hardcode in components | Update existing faqs.ts | Single source of truth for both UI and schema |

**Key insight:** The content system is already mature with BLOG_PROMPT.md providing comprehensive guidelines. The FAQ system already has both UI component and schema generator. Only content creation and data expansion are needed.

## Common Pitfalls

### Pitfall 1: Filename-Slug Mismatch
**What goes wrong:** Blog post 404s because filename doesn't match URL slug
**Why it happens:** Next.js uses filename as URL path, not frontmatter slug field
**How to avoid:** Match filename to slug (e.g., slug: `/resources/verify-chinese-supplier` → filename: `verify-chinese-supplier.mdx`)
**Warning signs:** Article accessible via frontmatter slug but 404 on actual page

### Pitfall 2: FAQ Not Indexed by Google
**What goes wrong:** FAQ schema is on page but not showing in search results
**Why it happens:** Missing FAQSchema component or invalid JSON-LD syntax
**How to avoid:** Include `<FAQSchema />` component in page, validate with Google Rich Results Test
**Warning signs:** Schema validates but doesn't appear in search console rich results

### Pitfall 3: Content Too Generic
**What goes wrong:** Blog posts don't rank because content is too similar to competitors
**Why it happens:** Not following the "Australia market focus" requirement
**How to avoid:** Anchor every guide to Australian import regulations, GST, customs, quarantine - per topic-specific guidance in CONTEXT.md
**Warning signs:** Content could apply to any country, not specifically Australia

### Pitfall 4: Missing Internal Links
**What goes wrong:** Poor site architecture, lower SEO value
**Why it happens:** Not following internal linking strategy from CONTEXT.md
**How to avoid:** Link between new guides and to existing service pages naturally within content
**Warning signs:** No links from new blog posts to /services, /about, /enquiry

### Pitfall 5: Service Page Keyword Cannibalization
**What goes wrong:** Multiple pages competing for same keywords
**Why it happens:** Adding same keywords to all service pages without differentiation
**How to avoid:** Each page should have unique primary keyword focus; homepage targets brand + "China sourcing", services page targets "factory tour" + "supplier verification"
**Warning signs:** Multiple pages with identical meta descriptions or keyword focus

## Code Examples

### Adding FAQ to Service Page
```typescript
// app/services/page.tsx - add import
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'

// Add before closing <>
<FAQSchema />
// ... existing content ...
<FAQ />
```

### Expanding FAQ Data
```typescript
// app/data/faqs.ts - add new questions
export const faqs = [
  // existing 4 questions
  { question: '...', answer: '...' },
  // add 6-11 more (target: 10-15 total)
  {
    question: 'How long does a factory visit trip take?',
    answer: 'Most factory visit trips range from 3-7 days depending on the number of suppliers you want to visit and your schedule.',
  },
  // ... more questions
]
```

### Blog Post Frontmatter Template
```yaml
---
title: "How to Import from China: Complete Guide for Australian Businesses"
seoTitle: "How to Import from China | Australian Importer's Guide"
description: "Learn the complete process of importing from China to Australia, including customs, GST, quarantine requirements, and supplier verification."
category: "China Factory Tour"
author: "Andy Liu, Founder — Winning Adventure Global"
date: "18 Mar 2026"
readTime: "12 min read"
subtitle: "Everything Australian businesses need to know about sourcing from Chinese manufacturers"
desc: "A comprehensive guide covering Chinese supplier verification, Australian import regulations, customs procedures, and practical tips for first-time importers."
coverImage: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200"
coverImageSource: "Unsplash"
coverImageAlt: "Container ship at Chinese port"
slug: "/resources/how-to-import-from-china"
primaryKeyword: "how to import from china"
secondaryKeywords:
  - "importing to australia from china"
  - "australia china trade"
  - "australian import regulations"
tags:
  - "China Import"
  - "Australia Trade"
  - "Import Guide"
ctaTitle: "Need help planning your China factory visit?"
ctaText: "Winning Adventure Global helps Australian businesses visit, evaluate, and connect with verified Chinese suppliers."
ctaButtonText: "Plan Your China Trip"
takeaways:
  - "Key point 1"
  - "Key point 2"
  - "Key point 3"
  - "Key point 4"
  - "Key point 5"
---
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Generic China content | Australia-market-focused content | Brand pivot | Higher relevance for Australian importers |
| No FAQ schema | FAQPage JSON-LD schema | Phase 9 (TECH-04) | Rich snippets in search results |
| Basic metadata | Keyword-optimized metadata | CONT-05 (this phase) | Better ranking for commercial keywords |
| 4 FAQ questions | 10-15 FAQ questions | CONT-04 (this phase) | Better coverage, more rich result opportunities |

**Deprecated/outdated:**
- Generic "China sourcing" content without market focus - now requires Australian context
- Static metadata without keyword strategy - now requires commercial keyword optimization

## Open Questions

1. **Should FAQ appear on About page as well?**
   - What we know: CONTEXT.md mentions "inline on existing pages (services, about)"
   - What's unclear: Whether both pages need FAQ or just services
   - Recommendation: Add to both for maximum SEO benefit, or prioritize services (higher commercial intent)

2. **How many internal links should each blog guide contain?**
   - What we know: BLOG_PROMPT.md suggests linking to services/about/enquiry
   - What's unclear: Exact quantity per guide
   - Recommendation: 2-4 natural internal links per guide

3. **Should new blog guides have their own FAQ section or use the global FAQ?**
   - What we know: BLOG_PROMPT.md has FAQ rules per article (3-5 questions)
   - What's unclear: Whether to add article-specific FAQ or use global FAQ component
   - Recommendation: Each blog post has its own FAQ per BLOG_PROMPT.md; global FAQ is for service/about pages

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright ^1.58.2 |
| Config file | None — ad-hoc testing |
| Quick run command | N/A - content validation |
| Full suite command | N/A - manual content review |

### Phase Requirements Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-01 | Blog post exists at /resources/how-to-import-from-china | Manual | Visit URL, verify content | ✅ content/blog/how-to-import-from-china.mdx |
| CONT-02 | Blog post exists at /resources/china-supplier-verification | Manual | Visit URL, verify content | ✅ content/blog/china-supplier-verification.mdx |
| CONT-03 | Blog post exists at /resources/australia-import-tips | Manual | Visit URL, verify content | ✅ content/blog/australia-import-tips.mdx |
| CONT-04 | FAQ section with 10-15 questions on services page | Manual | Inspect /services, count questions | ✅ faqs.ts expanded |
| CONT-05 | Service page has target keywords in metadata | Manual | Inspect page metadata | ✅ services/page.tsx optimized |

### Sampling Rate
- **Per task commit:** Manual verification of content structure
- **Per wave merge:** Review all new content together
- **Phase gate:** All 5 requirements verified before /gsd:verify-work

### Wave 0 Gaps
- None — existing infrastructure (blog system, FAQ component, Playwright) covers all validation needs
- Validation is primarily content review (manual) rather than automated testing

## Sources

### Primary (HIGH confidence)
- content/BLOG_PROMPT.md - Full content generation guidelines
- content/BLOG_QA_PROMPT.md - Quality assurance checklist
- app/components/FAQ.tsx - Existing FAQ component implementation
- app/components/FAQSchema.tsx - Existing JSON-LD schema generator
- app/data/faqs.ts - Existing FAQ data (4 questions)

### Secondary (MEDIUM confidence)
- Next.js 14.2 App Router documentation for metadata API
- Schema.org FAQPage specification for JSON-LD structure

### Tertiary (LOW confidence)
- N/A - all required patterns already exist in project

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all infrastructure exists, no new packages needed
- Architecture: HIGH - patterns well-defined in existing code and BLOG_PROMPT.md
- Pitfalls: HIGH - known issues documented from existing blog posts

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (content strategy is stable, no rapid changes expected)

---

*Generated for Phase 10: Content Strategy*
