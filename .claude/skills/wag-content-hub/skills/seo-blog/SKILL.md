---
name: wag-seo-blog
description: "Generate long-form SEO blog articles (1500-3000 words) with meta optimization"
---

# WAG SEO Blog Generator

## Overview

This skill generates long-form SEO blog articles for Winning Adventure Global. Blog articles serve as cornerstone content that ranks on Google and supports the entire content distribution ecosystem.

**Language:** English (for Google SEO and international audience reach)

**When to use:** When a user wants to create an in-depth blog article for SEO purposes. Blog articles expand on LinkedIn post topics with comprehensive coverage, data, and actionable guidance.

## WAG Business Model Context (Core Reference)

**Source:** WAG-Australia 商业模型 v1.0 (2026-03-22)

**Target Customer Pain Points:**
- Australian SME owners (AV/audio/lighting/event rental, automotive) facing 20-30% price premium when buying through Australian wholesalers/importers vs direct factory sourcing
- Three insurmountable barriers: Language, Trust, Logistics
- Cannot independently verify if a factory is real or trustworthy
- Existing sourcing agents take orders on behalf of clients -- clients never build direct relationships with factories
- Some agents hide 20-25% rebates, adding cost without transparency

**WAG Differentiation:**
- NOT a middleman, trading company, or sourcing agent
- Core promise: "Tell me what you need. I get you a free factory quote. If the price works, I take you to see the factory yourself."
- WAG accompanies clients to China, helping them sign contracts directly with factories -- WAG is the guide, not the intermediary

**Key Market Data:**
- 85% of Australian SMBs use Alibaba.com to find overseas suppliers
- China accounts for 62% of all inquiry sources for Australian importers
- Australia-China supply chain management market: USD 949.4M in 2025, projected USD 2,277.9M by 2034 (CAGR 10.21%)

## Content Structure

### Recommended Article Format: Comprehensive Guide

```
[HOOK - compelling intro with pain point]
[META DESCRIPTION - max 160 chars]

[Section 1: Problem Statement]
- Define the verification challenge
- Quantify the stakes (cost of failure)

[Section 2: The 3-Step Framework]
- Step 1: License verification (gsxt.gov.cn)
- Step 2: Live production evidence
- Step 3: Direct certification verification

[Section 3: Australian Legal Context]
- importer of record responsibility
- Australian Consumer Law implications

[Section 4: Case Study / Example]
- Composite scenario based on WAG experience

[Section 5: WAG Process]
- How WAG helps (free quote, factory visit)

[CTA Section]
- Consultation booking
- Next steps for reader
```

## SEO Requirements

### Word Count
- Target: 1500-3000 words
- Minimum: 1200 words (Google favors comprehensive content)
- Ideal density: 1.5-2% keyword density for primary term

### Meta Description
- Max: 160 characters
- Must include primary keyword
- Must include value proposition
- Must include CTA signal

### Header Structure (H1 > H2 > H3)
```
H1: [Primary Keyword] -- Verification Guide for Australian [Industry] Brands
H2: Why [Industry] Companies Struggle with China Supplier Verification
H2: The 3-Step Framework to Verify Any Chinese Factory
H3: Step 1: Check the Business License on gsxt.gov.cn
H3: Step 2: Request Live Production Evidence
H3: Step 3: Verify Certifications Directly
H2: What Australian Consumer Law Means for Your Import
H2: How WAG Helps You Verify Before You Sign
```

### Internal Linking
- Link to other WAG blog posts where relevant
- Use anchor text with keywords (not "click here")
- Target: 3-5 internal links per article

### External Linking
- Link to authoritative sources (gsxt.gov.cn, Australian government sites)
- Use "nofollow" for non-authoritative external links
- Target: 2-3 external links per article

## Frontmatter Template

```yaml
---
title: "{SEO-Optimized Title}"
date: "{YYYY-MM-DD}"
description: "{Meta description - max 160 chars}"
author: "Winning Adventure Global"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
category: "{Category Name}"
readTime: "{N} min read"
coverImage: "/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-factory-vs-trading-company.png"
ctaTitle: "{CTA Title}"
ctaText: "{CTA Description Text}"
ctaButtonText: "{Button Text}"
---
```

## Image Requirements

### Image Embedding (3 Shared Images from LinkedIn Post Batch)

Images are generated once in `social/linkedin-post/{YYYY-MM-DD-topic}/imgs/` and shared across all channels. The SEO blog article MUST embed all 3 images at specific positions.

**Image Positions (from `outline.md`):**

| # | Filename | Position in Article | Purpose |
|---|----------|---------------------|---------|
| 1 | `01-factory-vs-trading-company.png` | After article intro / hook paragraph | Visual hook: Factory vs Trading Company comparison |
| 2 | `02-three-step-verification-framework.png` | After "The 3-Step Framework" H2 section | Visual summary of the verification process |
| 3 | `03-wag-consultation-cta.png` | CTA / conclusion section | Reinforce WAG consultation CTA |

### Frontmatter Image Paths

```yaml
coverImage: "/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-factory-vs-trading-company.png"
```

### In-Article Image Embedding Format

After generating the MDX, insert images at these positions using standard Markdown:

```mdx
![Factory vs Trading Company — Is this supplier actually a factory?](/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-factory-vs-trading-company.png)

![3 Steps to Verify Any Chinese Factory](/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/02-three-step-verification-framework.png)

![Before you sign. See the factory.](/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/03-wag-consultation-cta.png)
```

**Alt text requirements:**
- Image 1: "Factory vs Trading Company — Is this supplier actually a factory?"
- Image 2: "3 Steps to Verify Any Chinese Factory"
- Image 3: "Before you sign. See the factory."

### Cover Image
- Use `01-factory-vs-trading-company.png` as cover
- Path: `/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-factory-vs-trading-company.png`
- Alt text: Descriptive with primary keyword

## Topic Selection (High-SEO-Value)

| Topic | Search Intent | Target Keywords |
|-------|--------------|----------------|
| Factory verification | How-to / Guide | "verify Chinese factory", "China supplier verification" |
| gsxt.gov.cn guide | Tutorial | "how to use gsxt.gov.cn", "Chinese business license check" |
| Import from China legal | Informational | "Australian importer of record", "ACL import responsibility" |
| Sourcing agent vs direct | Comparison | "sourcing agent vs direct factory", "China trading company" |
| AV equipment sourcing | Industry-specific | "pro audio equipment China", "stage lighting suppliers China" |

## RAG Implementation

Before generating, retrieve relevant WAG content:

1. **Glob** -- Find all blog files: `content/blog/*.mdx`
2. **Grep** -- Search for content matching the topic (head_limit: 3)
3. **Read** -- Extract from top matched files
4. **Incorporate** -- Use sourced statistics, examples, case studies

## Quality Gates

Before returning success:
- [ ] Word count 1500-3000
- [ ] Meta description 160 chars
- [ ] H1 contains primary keyword
- [ ] H2/H3 structure established
- [ ] Internal links included (3-5)
- [ ] External links to authoritative sources
- [ ] CTA section present
- [ ] No emoji
- [ ] Facts verified or flagged
- [ ] Images reference `/social/...` (single source in `public/social/`)

## Directory Structure

**Image storage (SINGLE SOURCE):**
```
public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/  # THE ONLY image location
```

**Content working directory:**
```
social/linkedin-post/{YYYY-MM-DD-topic}/
├── post.md          # LinkedIn post text
├── outline.md       # Image generation outline
└── prompts/        # AI image generation prompts
```

**Blog MDX path:**
```
content/blog/{slug}.mdx
```

**Image URL path (in MDX):**
```
/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-xxx.png
```
⚠️ MDX references `/social/...` which Next.js serves directly from `public/social/...` — no copying needed.

## Suggested Next Steps

After generating the blog article:

**1. Generate LinkedIn Post**
> "需要同步生成LinkedIn帖子吗？"
> - Expand blog into LinkedIn format
> - Use Template A (3-step framework) for highest ER

**2. Generate Social Images**
> "需要为博客生成配图吗？"
> - Cover image
> - Feature graphic with key stat

**3. Publish to Website**
> "博客已就绪，提交发布吗？"
> - Run `npm run build` to verify
> - Git push to trigger Vercel deploy

---

## WCSP Output Contract

All SEO blog generation MUST return this structured response:

```yaml
output:
  status: success | warning | error

  summary: "Generated SEO blog: 2,180 words, factory verification guide"

  next_actions:
    - action: user-confirm
      description: "Present blog for approval"
      blocking: true
    - action: publish
      description: "Git push to trigger deploy"
      blocking: false

  artifacts:
    mdx_path: "/content/blog/{slug}.mdx"
    cover_image: "/public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-cover.png"
    word_count: 2180
    meta_chars: 158
    primary_keyword: "China factory verification"
    quality_flags:
      - type: word-count
        detail: "2180 words - optimal range"
        severity: none

  error:
    root_cause: "Word count below 1200 minimum"
    safe_retry: "Expand sections with more examples and data"
    stop_condition: "3 retries exceeded"
```

### Error Recovery

| Error | Recovery | Stop Condition |
|-------|----------|----------------|
| Word count <1200 | Expand with more examples | 3 retries → present short |
| Meta >160 chars | Trim description | Auto-trim to 160 |
| Missing internal links | Add links to existing content | Flag for review |
| Fact unverifiable | Flag + remove or cite source | Block if WAG data |

### Status Definitions

| Status | Meaning |
|--------|---------|
| success | All quality gates passed |
| warning | Minor issues (char count trim, optional link) |
| error | Fatal error, requires regeneration |
| blocked | Missing required input |
