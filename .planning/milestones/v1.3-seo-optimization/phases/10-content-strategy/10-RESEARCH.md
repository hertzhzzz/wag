# Phase 10: Content Strategy - Comprehensive Bug Scan Research

**Researched:** 2026-03-18
**Domain:** MDX Blog System, FAQ System, Next.js Metadata API, Build Verification
**Confidence:** HIGH

## Summary

Phase 10 requires creating 3 SEO-optimized blog guides, expanding the FAQ section with Schema markup, and optimizing service pages with target keywords. The project already has a mature MDX-based blog system with detailed content guidelines (BLOG_PROMPT.md), an existing FAQ component with correct FAQPage JSON-LD schema, and service pages with basic metadata. The key work involves generating new content following existing patterns, expanding FAQ from 4 to 10-15 questions and adding to services/about pages, and enhancing service page metadata with high-intent commercial keywords.

**Primary recommendation:** Use existing BLOG_PROMPT.md for content generation (1500-2200 words per guide), expand existing FAQ data file with 6-11 new questions and import FAQ components to services/about pages, update service page metadata with target keywords "factory visit", "supplier sourcing", "China procurement".

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 3 blog guides: "How to Import from China", "China Supplier Verification", "Australia Import Tips"
- FAQ placement: Inline accordion on services and about pages
- FAQ quantity: 10-15 questions
- Use /skill wag-seo-blog for content generation following BLOG_PROMPT.md guidelines

### Claude's Discretion
- Exact FAQ question text and wording
- Specific H2/H3 structure within each guide
- Internal linking strategy between guides
- Service page content additions vs metadata-only optimization

### Deferred Ideas (OUT OF SCOPE)
- None

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-01 | Create "How to Import from China" guide (blog post) | Existing blog system with MDX, frontmatter fields, quality checklist in BLOG_PROMPT.md |
| CONT-02 | Create "China Supplier Verification" guide (blog post) | Same content system, supplier verification topic aligns with existing brand expertise |
| CONT-03 | Create "Australia Import Tips" guide (blog post) | Same content system, Australian market focus per brand positioning |
| CONT-04 | Add FAQ section to website with schema markup | FAQ already on homepage, needs expansion to 10-15 questions + add to services/about |
| CONT-05 | Optimize service pages with target keywords | Service page metadata exists, needs high-intent keyword enhancement |

</phase_requirements>

---

## Phase-Specific Bug Prevention Analysis

This section identifies technical risks when executing the three content strategy plans. Each plan has specific bug risks that must be addressed during implementation.

### Plan 10-01: Create 3 SEO Blog Guides

#### Critical Risk 1: Filename/Slug URL Mismatch (CRITICAL)

**What goes wrong:** Blog posts return 404 errors because filename does not match URL slug.

**Root cause:** Next.js uses the filename (without extension) as the URL path, NOT the `slug` field in frontmatter. BLOG_PROMPT.md explicitly states:
- "Next.js uses filename as URL, not frontmatter slug field"
- "If slug is `/resources/verify-chinese-supplier`, filename must be `verify-chinese-supplier.mdx`"

**Affected files in Plan 10-01:**

| Plan Filename | Required Frontmatter slug | Risk |
|---------------|---------------------------|------|
| `how-to-import-from-china.mdx` | `/resources/how-to-import-from-china` | Filename must NOT include /resources/ |
| `china-supplier-verification.mdx` | `/resources/china-supplier-verification` | Filename must NOT include /resources/ |
| `australia-import-tips.mdx` | `/resources/australia-import-tips` | Filename must NOT include /resources/ |

**Prevention verification:**
```bash
# After creating each MDX file, verify:
# 1. Filename does NOT have /resources/ prefix
ls content/blog/*.mdx | grep -v "/resources/"

# 2. Page responds with 200 (requires build first)
npm run build && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/resources/how-to-import-from-china
# Expected: 200, Not 404
```

#### Critical Risk 2: Invalid Frontmatter Crashes Build

**What goes wrong:** Build fails due to gray-matter parse error.

**Root cause:** `app/resources/[slug]/page.tsx` lines 19-25:
```typescript
function getArticle(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)  // No try-catch!
  return { frontmatter: data, content }
}
```

**Edge cases that cause parse failure:**
- Invalid YAML syntax (tabs instead of spaces)
- Missing closing `---` in frontmatter
- Special characters without proper escaping
- Empty required fields

**Prevention:**
- Always validate YAML syntax before committing
- Use online YAML validator or `yarn lint` (if configured)

#### Critical Risk 3: Missing Required Frontmatter Fields

**What goes wrong:** Page builds but renders with missing data, broken UI.

**Required fields (verified from existing blog):**
- title, seoTitle, description, category, author, date
- readTime, subtitle, desc, coverImage, coverImageAlt
- slug, primaryKeyword, secondaryKeywords (array), tags (array)
- ctaTitle, ctaText, ctaButtonText
- takeaways (array, minimum 3-5 items)

**Prevention verification:**
```bash
# Verify all required fields exist
for field in title seoTitle description primaryKeyword slug; do
  grep -q "^$field:" content/blog/how-to-import-from-china.mdx || echo "MISSING: $field"
done
```

---

### Plan 10-02: Expand FAQ and Add to Pages

#### Critical Risk 1: Missing FAQSchema Component (CRITICAL)

**What goes wrong:** FAQ renders but no SEO rich results.

**Current state:**
- `app/page.tsx` (homepage): HAS `<FAQSchema />` (line 33)
- `app/services/page.tsx`: MISSING `<FAQSchema />`
- `app/about/page.tsx`: MISSING `<FAQSchema />`

**Task 10-02 requirement:** Add FAQ to services AND about pages.

**Prevention:** Must add BOTH `<FAQ />` AND `<FAQSchema />` to each page:
```typescript
// WRONG - Only adds UI, no JSON-LD
<FAQ />

// CORRECT - Adds UI AND SEO schema
<FAQSchema />
<FAQ />
```

#### Critical Risk 2: FAQ Schema Duplication

**What goes wrong:** Multiple identical FAQPage schemas confuse search engines.

**Current state:**
- Homepage: Has FAQ with its own questions
- Services page: Will have different FAQ questions
- About page: Will have different FAQ questions

**Google's position:** Multiple FAQPage schemas on different URLs are valid IF content differs.

**Prevention:**
- Ensure each page's FAQ has UNIQUE questions
- Do not copy homepage FAQ questions to services/about
- Questions should match page context (services = process/timeline questions, about = company questions)

#### Medium Risk 3: FAQ Data Structure Validation

**What goes wrong:** Empty question/answer renders broken accordion.

**Required structure:**
```typescript
{ question: string, answer: string }
```

**Prevention:**
- Validate each FAQ item has both fields
- Test with very long answers (may break mobile layout)

---

### Plan 10-03: Keyword Optimization

#### Critical Risk 1: Metadata Keywords Array Duplicates (HIGH)

**What goes wrong:** Duplicate keywords may cause warnings or be ignored.

**Current keywords (app/services/page.tsx line 11):**
```typescript
['china sourcing services', 'factory tour china', 'supplier verification china', 'china procurement', 'quality inspection china']
```

**Plan adds:**
`'factory visit', 'supplier sourcing', 'China procurement'`

**PROBLEM:** 'china procurement' already exists (case difference - 'China' vs 'china')

**Prevention:**
```typescript
// Correct keywords array (no duplicates):
keywords: [
  'factory visit',
  'supplier sourcing',
  'China procurement',  // Only one variation
  'china sourcing services',
  'factory tour china',
  'supplier verification china',
  'quality inspection china'
]
```

**Verification:**
```bash
# Check for duplicates
grep -A3 "keywords:" app/services/page.tsx | tr ',' '\n' | sort -f | uniq -d
```

#### Critical Risk 2: Missing OpenGraph Fields

**What goes wrong:** Reduced social sharing quality.

**Current services/page.tsx OpenGraph (lines 12-16):**
```typescript
openGraph: {
  title: '...',
  description: '...',
  url: 'https://www.winningadventure.com.au/services',
  // MISSING: locale, alternateLocale, siteName
}
```

**Homepage has (app/page.tsx lines 16-23):**
```typescript
openGraph: {
  locale: 'en_AU',
  alternateLocale: 'en_US',
  title: '...',
  description: '...',
  url: 'https://www.winningadventure.com.au/',
  siteName: 'Winning Adventure Global',
}
```

**Prevention:** Add missing fields to services page OpenGraph:
```typescript
openGraph: {
  locale: 'en_AU',
  alternateLocale: 'en_US',
  title: '...',
  description: '...',
  url: 'https://www.winningadventure.com.au/services',
  siteName: 'Winning Adventure Global',
}
```

#### Medium Risk 3: Keywords in Content vs Metadata Mismatch

**What goes wrong:** Search engines may penalize mismatch between metadata and page content.

**Prevention:**
```bash
# Check keywords appear in content
grep -ci "factory visit" app/services/page.tsx
grep -ci "supplier sourcing" app/services/page.tsx
# Each should return >= 1
```

#### High Risk 4: Keyword Stuffing

**What goes wrong:** Google penalizes over-optimization.

**Rule:** Keywords should appear naturally, 1-3% density maximum. Do NOT repeat keywords unnaturally.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gray-matter | ^4.0.3 | MDX frontmatter parsing | Already integrated, reads blog metadata |
| next | 16.1.7 | App Router, metadata API | Verified from package.json |

### Supporting
| Library | Version | Purpose |
|---------|---------|---------|
| lucide-react | ^0.575.0 | Icons (CheckCircle for service cards) |
| @playwright/test | ^1.58.2 | E2E testing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom FAQ component | Use existing FAQ.tsx | Existing accordion component is well-styled and accessible |
| Manual JSON-LD | Use existing FAQSchema.tsx | Existing schema generator produces valid FAQPage markup per schema.org |

**Installation:**
No new packages required - all infrastructure already exists.

---

## Architecture Patterns

### Recommended Project Structure

```
content/blog/
├── china-factory-tour-guide.mdx       # Existing
├── verify-chinese-supplier.mdx        # Existing
├── ...                                # 6 existing posts
├── how-to-import-from-china.mdx       # NEW - CONT-01
├── china-supplier-verification.mdx    # NEW - CONT-02
└── australia-import-tips.mdx         # NEW - CONT-03

app/
├── data/
│   └── faqs.ts                        # Expand from 4 to 10-15 questions
├── components/
│   ├── FAQ.tsx                        # Existing accordion component
│   └── FAQSchema.tsx                  # Existing JSON-LD generator
├── services/
│   └── page.tsx                       # Add FAQ section + keyword optimization + OpenGraph fix
└── about/
    └── page.tsx                       # Add FAQ section + FAQSchema (MISSING in current!)
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

### Pattern 2: FAQ Integration (VERIFIED)
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
// app/components/FAQSchema.tsx - JSON-LD generator (VERIFIED CORRECT FORMAT)
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

**FAQPage Format Verification:** Verified against schema.org (2026-03-18) - current implementation uses correct format with Question and Answer types in mainEntity array. Google supports this for FAQ rich results.

**Current Status:** FAQ already implemented on homepage (app/page.tsx lines 8, 33, 38)
**Expansion needed:** Add 6-11 more questions to faqs.ts (target 10-15), import FAQ + FAQSchema to services/about pages

### Pattern 3: Service Page Keyword Optimization
**What:** Update metadata with high-intent commercial keywords
**When to use:** For CONT-05
**Current Implementation:**
```typescript
// app/services/page.tsx - current metadata (MISSING locale/siteName)
export const metadata: Metadata = {
  title: 'China Sourcing Services | Factory Tours & Supplier Verification',
  description: 'Our China sourcing services include factory tours...',
  keywords: ['china sourcing services', 'factory tour china', ...],
  openGraph: {
    title: '...',
    description: '...',
    url: 'https://www.winningadventure.com.au/services',
    // MISSING: locale, alternateLocale, siteName
  },
}
```

**Enhancement needed:** Add "factory visit", "supplier sourcing", "China procurement" as primary keywords in metadata + add content sections with these keywords in H2/H3 headings + FIX missing OpenGraph fields

### Anti-Patterns to Avoid
- **Content without frontmatter**: All blog posts MUST have complete frontmatter per BLOG_PROMPT.md template
- **Duplicate FAQ questions**: Questions must be unique and not repeat content from existing blog posts
- **Keyword stuffing**: Natural keyword placement in content, not repeated unnaturally
- **Missing FAQSchema**: Every page with FAQ must include FAQSchema component for JSON-LD
- **Wrong internal links**: Use relative paths `/services`, not `/resources/services`
- **Filename-slug mismatch**: Next.js uses filename as URL path, ensure filename matches slug without `/resources/` prefix
- **Duplicate ctaTitle in frontmatter**: Existing blog has duplicate ctaTitle - last value wins
- **InlineCTA ignores ctaButtonLink**: Component hardcodes `/enquiry` link

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Blog content format | Create custom MDX template | Follow existing BLOG_PROMPT.md | Already has detailed frontmatter, section structure, component rules |
| FAQ accordion | Build new accordion component | Use existing FAQ.tsx | Already styled, accessible, client-side state handled |
| FAQ schema | Write manual JSON-LD | Use existing FAQSchema.tsx | Already generates valid FAQPage schema from faqs.ts data |
| FAQ data management | Hardcode in components | Update existing faqs.ts | Single source of truth for both UI and schema |

**Key insight:** The content system is already mature with BLOG_PROMPT.md providing comprehensive guidelines. The FAQ system already has both UI component and schema generator. Only content creation and data expansion are needed.

---

## Common Pitfalls

### Pitfall 1: Filename-Slug Mismatch
**What goes wrong:** Blog post 404s because filename doesn't match URL slug
**Why it happens:** Next.js uses filename as URL path, not frontmatter slug field
**How to avoid:** Match filename to slug (e.g., slug: `/resources/verify-chinese-supplier` -> filename: `verify-chinese-supplier.mdx`)
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

### Pitfall 6: Duplicate Frontmatter Fields
**What goes wrong:** gray-matter silently takes last value
**Why it happens:** Existing blog `verify-chinese-supplier.mdx` has duplicate `ctaTitle` field (lines 25 and 268)
**How to avoid:** Ensure each frontmatter field appears only once
**Warning signs:** Build succeeds but wrong value renders

### Pitfall 7: InlineCTA Link Ignored
**What goes wrong:** CTA button doesn't link to intended URL
**Why it happens:** Component hardcodes `/enquiry`, ignores `ctaButtonLink` frontmatter
**How to avoid:** Use `ctaButtonText` (renders) not `ctaButtonLink` (ignored)
**Warning signs:** All blog posts link to /enquiry regardless of frontmatter

---

## Code Examples

### Adding FAQ to Service Page (WITH SCHEMA)
```typescript
// app/services/page.tsx - add imports
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'

export default function ServicesPage() {
  return (
    <>
      <ServiceSchema />
      <Navbar />
      {/* ... existing content ... */}

      {/* FAQ Section - BOTH components required! */}
      <FAQSchema />  {/* JSON-LD for SEO */}
      <FAQ />        {/* UI accordion */}

      <Footer />
    </>
  )
}
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

### Fixed OpenGraph Metadata
```typescript
// app/services/page.tsx - complete OpenGraph
openGraph: {
  locale: 'en_AU',
  alternateLocale: 'en_US',
  title: 'China Sourcing Services | Factory Tours & Supplier Verification',
  description: 'Our China sourcing services include factory tours...',
  url: 'https://www.winningadventure.com.au/services',
  siteName: 'Winning Adventure Global',
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Generic China content | Australia-market-focused content | Brand pivot | Higher relevance for Australian importers |
| No FAQ schema | FAQPage JSON-LD schema | Phase 9 (TECH-04) | Rich snippets in search results |
| FAQ only on homepage | FAQ on services + about pages | CONT-04 (this phase) | Maximum SEO coverage |
| Basic metadata | Keyword-optimized metadata | CONT-05 (this phase) | Better ranking for commercial keywords |
| 4 FAQ questions | 10-15 FAQ questions | CONT-04 (this phase) | Better coverage, more rich result opportunities |
| Missing OpenGraph fields | Complete OpenGraph with locale/siteName | This phase | Better social sharing |

**Deprecated/outdated:**
- Generic "China sourcing" content without market focus - now requires Australian context
- Static metadata without keyword strategy - now requires commercial keyword optimization
- FAQ on single page only - now requires multi-page coverage
- Incomplete OpenGraph - now requires all standard fields

---

## Bug Prevention Verification Checklist

### Before Executing Plan 10-01
- [ ] Verified filename format: `*.mdx` without `/resources/` prefix
- [ ] Verified frontmatter slug format: `/resources/your-slug`
- [ ] Understood that InlineCTA ignores `ctaButtonLink` field
- [ ] Verified no duplicate frontmatter keys (especially ctaTitle)

### During Plan 10-01 Execution
- [ ] After each blog file creation, verify URL responds with 200 (not 404)
- [ ] Verify internal links use `/services` not `/resources/services`
- [ ] Verify no duplicate frontmatter keys
- [ ] Run `npm run build` to catch any issues

### Before Executing Plan 10-02
- [ ] Check homepage FAQ content to ensure uniqueness
- [ ] Prepare different questions for services and about pages
- [ ] Verify about page is MISSING FAQSchema (needs to be added)

### During Plan 10-02 Execution
- [ ] Add BOTH FAQSchema AND FAQ components (not just FAQ!)
- [ ] Verify FAQ component placement (before Footer)
- [ ] Run `npm run build` after changes

### Before Executing Plan 10-03
- [ ] Identify existing keywords to avoid duplicates
- [ ] Note services page is missing OpenGraph locale/siteName

### During Plan 10-03 Execution
- [ ] Remove duplicate keywords (check case sensitivity)
- [ ] Add missing OpenGraph fields: locale, alternateLocale, siteName
- [ ] Verify keywords appear naturally in page content
- [ ] Run `npm run build` and `npm run lint`

---

## Technical Risk Matrix Summary

| Risk Level | Count | Key Items |
|------------|-------|-----------|
| CRITICAL | 5 | Filename/slug mismatch, Invalid frontmatter crash, Missing FAQSchema, Duplicate keywords, Missing OpenGraph fields |
| HIGH | 2 | InlineCTA ignores ctaButtonLink, Duplicate frontmatter fields |
| MEDIUM | 3 | FAQ structure validation, Keyword/content mismatch, Keyword stuffing |
| LOW | 2 | Internal link format, FAQ component placement |

---

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

4. **Should homepage FAQ stay when services/about have FAQ?**
   - What we know: Homepage already has FAQ
   - Risk: Duplicate FAQPage schema across pages
   - Recommendation: Keep homepage FAQ but ensure content differs from services/about

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright ^1.58.2 |
| Config file | None - ad-hoc testing |
| Quick run command | N/A - content validation |
| Full suite command | N/A - manual content review |

### Phase Requirements Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-01 | Blog post exists at /resources/how-to-import-from-china | Manual | Visit URL, verify content | Need to create content/blog/how-to-import-from-china.mdx |
| CONT-02 | Blog post exists at /resources/china-supplier-verification | Manual | Visit URL, verify content | Need to create content/blog/china-supplier-verification.mdx |
| CONT-03 | Blog post exists at /resources/australia-import-tips | Manual | Visit URL, verify content | Need to create content/blog/australia-import-tips.mdx |
| CONT-04 | FAQ section with 10-15 questions on services page | Manual | Inspect /services, count questions | Need to expand faqs.ts + add to services/about |
| CONT-05 | Service page has target keywords in metadata | Manual | Inspect page metadata | Need to update services/page.tsx metadata |

### Sampling Rate
- **Per task commit:** Manual verification of content structure
- **Per wave merge:** Review all new content together
- **Phase gate:** All 5 requirements verified before /gsd:verify-work

### Wave 0 Gaps
- None - existing infrastructure (blog system, FAQ component, Playwright) covers all validation needs
- Validation is primarily content review (manual) rather than automated testing

---

## Sources

### Primary (HIGH confidence)
- content/BLOG_PROMPT.md - Full content generation guidelines
- content/BLOG_QA_PROMPT.md - Quality assurance checklist
- app/components/FAQ.tsx - Existing FAQ component implementation
- app/components/FAQSchema.tsx - Existing JSON-LD schema generator (verified correct format)
- app/data/faqs.ts - Existing FAQ data (4 questions)
- app/resources/[slug]/page.tsx - Dynamic routing implementation
- schema.org/FAQPage - Verified JSON-LD format matches current specification
- package.json - Verified package versions

### Secondary (MEDIUM confidence)
- Next.js App Router documentation for metadata API
- Schema.org FAQPage specification for JSON-LD structure

### Tertiary (LOW confidence)
- N/A - all required patterns already exist in project

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all infrastructure exists, no new packages needed
- Architecture: HIGH - patterns well-defined in existing code and BLOG_PROMPT.md
- Pitfalls: HIGH - known issues documented from existing blog posts
- Bug prevention: HIGH - specific risks identified from actual code inspection

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (content strategy is stable, no rapid changes expected)

---

*Generated for Phase 10: Content Strategy*
*Updated: 2026-03-18 - Comprehensive bug scan with technical risk matrix*
