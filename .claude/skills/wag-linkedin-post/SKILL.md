---
name: wag-linkedin-post
description: "Generate WAG-branded LinkedIn posts and expand to blog articles"
---

# WAG LinkedIn Post Generator

## Overview

This skill generates high-quality LinkedIn posts for Winning Adventure Global using a Socratic questioning approach to guide topic selection, combined with RAG-powered retrieval of relevant WAG content. It also handles expansion to blog articles.

**Language approach:** Socratic questions are presented in Simplified Chinese (to match WAG's client base), but the generated LinkedIn post is always in English (for LinkedIn audience reach).

**When to use:** When a user wants to create a LinkedIn post for WAG, invoke this skill to guide them through topic selection (in Chinese), retrieve relevant WAG insights, and produce a formatted English post ready to publish.

## WAG Business Model Context (Core Reference)

**Source:** WAG-Australia 商业模型 v1.0 (2026-03-22)

**Target Customer Pain Points:**
- Australian SME owners (AV/audio/lighting/event rental, automotive) facing 20-30% price premium when buying through Australian wholesalers/importers vs direct factory sourcing
- Three insurmountable barriers: Language, Trust, Logistics
- Cannot independently verify if a factory is real or trustworthy
- Existing sourcing agents take orders on behalf of clients — clients never build direct relationships with factories
- Some agents hide 20-25% rebates, adding cost without transparency

**WAG Differentiation:**
- NOT a middleman, trading company, or sourcing agent
- Core promise: "Tell me what you need. I get you a free factory quote. If the price works, I take you to see the factory yourself."
- Value layers: Access, Trust, Safety, Logistics, Direct Relationship, Transparent Pricing
- WAG accompanies clients to China, helping them sign contracts directly with factories — WAG is the guide, not the intermediary

**Key Market Data:**
- 85% of Australian SMBs use Alibaba.com to find overseas suppliers
- China accounts for 62% of all inquiry sources for Australian importers
- Australia-China供应链管理 market: USD 949.4M in 2025, projected USD 2,277.9M by 2034 (CAGR 10.21%)

**Service Flow:**
- Step 1 (Free): SME describes product needs + current purchase price
- Step 2 (Free): WAG contacts factories for confidential quotes, delivers to client; factory names kept confidential pre-visit
- Step 3 (Paid): WAG coordinates full China trip — flights, hotel, translator, factory appointments; client signs directly with factory

**Pricing Model:**
- Transparent cost-plus: flights (actual) + hotel (actual) + translator (per day) + coordination service fee
- Estimated total per trip: A$5,300-8,300 for one client; A$3,500-5,000 per client when 2-3 SMEs share

## Socratic Question Flow

Before generating any content, guide the user through exactly 5 questions to clarify the post direction. Present questions in Simplified Chinese to match WAG client base, but generate the final LinkedIn post in English.

**Question 1 — Topic Discovery:**
"你的目标读者目前正在面临哪些中国采购挑战？"
*(What specific China sourcing challenge are your ideal LinkedIn post readers dealing with right now?)*
[Context: This identifies the core pain point — e.g., factory verification, quality control, communication barriers, minimum order quantities. Reference WAG business model: new brand companies cannot find source factories, cannot trust if factories are real]

**Question 2 — Pain Point Clarification:**
"关于这个挑战，你听到过哪些最常见的误解？"
*(What's the most common misconception about this challenge that you've encountered?)*
[Context: This surfaces the fear or myth to debunk — e.g., "all Chinese factories are the same," "websites prove legitimacy," "the cheapest option is most efficient," "a professional-looking factory in Australia is proof of Chinese manufacturing capability"]

**Question 3 — Post Tone:**
"你希望这篇文章起到什么作用——教育（建立认知）、挑战（引发讨论）还是激励（展示可能性）？"
*(Do you want this post to educate, challenge, or inspire?)*
[Context: Guides the emotional register — educate for awareness, challenge for engagement, inspire for aspiration]

**Question 4 — CTA Direction:**
"读者读完文章后应该做什么——在评论区分享经验、联系咨询，还是改变对这个话题的看法？"
*(What should readers do after reading — share their experience in comments, reach out for a consultation, or think differently?)*

**Question 5 — Posting Perspective:**
"这篇文章是以公司主页还是个人账号发布？"
*(Company Page or Personal Profile?)*

| 选择 | 影响 |
|------|------|
| **公司主页** | 使用"We"，突出WAG专业服务，品牌积累强 |
| **个人账号** | 使用"I"，创始人IP背书，触及率更高，更易病毒传播 |

[Context: Determines tone, pronouns, and how WAG is positioned in the post. Per 2026 LinkedIn algorithm data, personal profiles outperform company pages by 561% in reach]

## RAG Implementation

After gathering the user's answers, retrieve relevant WAG content before generating the post:

1. **Glob** — Find all blog files:
   ```
   Pattern: content/blog/*.mdx
   ```

2. **Grep** — Search for content matching the user's topic (use `head_limit: 3` to limit matches)

3. **Read** — Extract content from the top 3 matched files

4. **Incorporate** — Use sourced statistics, examples, case studies, or insights from the retrieved content in the generated post

**Important:** Always invoke RAG to retrieve at least 1 WAG blog post before generating. This ensures the post references specific WAG expertise rather than generic content.

## LinkedIn Post Template

```
[HOOK - max 210 characters, bold statement or question that creates curiosity]

[BREAK - line gap]

[BODY - 3-5 short paragraphs]
- Paragraph 1: Context (1-2 sentences establishing the situation)
- Paragraph 2-4: Core insight with specific WAG-relevant examples/data
- Paragraph 5: Transition to CTA

[BREAK]

[CTA - soft question that drives comments]
"What would you do differently? Share in comments."
OR
"How has this affected your sourcing strategy? Let's discuss."

[HASHTAGS - exactly 6-10 strategic tags]
#ChinaSourcing #AustralianBusiness #Manufacturing #etc
```

## 2026 LinkedIn Algorithm Context

**Key algorithm changes (2026):**
- Shift from "like-driven" to "deep engagement-driven" — NLP analyzes comment quality
- External links in post body = -60% reach penalty
- Engagement pods (互赞群) now detected with 97% accuracy, risk of shadow ban
- Best-performing format: Document Carousel (6.6% engagement), Text-only post (4%), Image/Graphic (4.85%)
- Personal Profile outperforms Company Page by 561% in organic reach
- Best posting time (Australia audience): Tuesday-Thursday, 9-11 AM AEDT
- First 60 minutes after posting: must be online to respond to comments (algorithm boost window)

**Optimal hook strategies for 2026:**
- Counterintuitive + specific numbers: "We audited 23 factories for Australian clients in 12 months. Here is what we found."
- Loss framing: "My LinkedIn reach dropped 60%. Then I changed one thing."
- Pain point + promise: "Most Australian businesses overpay on China sourcing because they skip this one step."
- Specific scenario + suspense: "We spent $47K testing every LinkedIn strategy. Here is what actually worked."

## Fact Check Procedure

After generating the LinkedIn post, perform a deep fact check using parallel research agents before presenting to the user.

**Requirement: Deploy at least 5 parallel research agents for cross-validation.**

### Research Agent Protocol

1. **Deploy 5+ research agents in parallel**, each focusing on a different verification angle:

   | Agent | Focus |
   |-------|-------|
   | Agent 1 | Platform supplier verification (1688, Alibaba - trading company vs factory) |
   | Agent 2 | LinkedIn B2B content engagement metrics and algorithm signals |
   | Agent 3 | Australia-China sourcing statistics and challenges 2025-2026 |
   | Agent 4 | Factory verification methods and business license verification in China |
   | Agent 5 | LinkedIn post optimal length, hook strategies, comment-driven engagement |

2. **Each agent must:**
   - Use `mcp__MiniMax__web_search` for real-time data
   - Search at least 3 different sources per claim
   - Cross-validate against multiple authoritative sources
   - Return findings with source URLs

3. **Merge findings** into a unified fact check table:

   ```
   | Claim | Agent 1 | Agent 2 | Agent 3 | Status | Confidence |
   |-------|---------|---------|---------|--------|------------|
   ```

4. **Apply cross-validation rules:**
   - **High Confidence** — Confirmed by 3+ agents across different source types
   - **Medium Confidence** — Confirmed by 2 agents, or single authoritative source
   - **Low Confidence** — Single source, or conflicting findings
   - **Disputed** — Agents return contradictory information

5. **Present to user** with clear confidence levels and source attribution

6. **Update the post** — remove or rephrase any Low Confidence or Disputed claims before final approval

**Note:** Do not skip parallel research. A single web search is insufficient for professional credibility. Cross-validation is mandatory.

## LinkedIn Post → Blog Article Workflow

When a LinkedIn post should be expanded into a blog article, follow this workflow:

### 1. Directory Structure

**Canonical Storage Path:** All generated LinkedIn posts are stored in:

```
social/linkedin-post/{YYYY-MM-DD-topic}/
├── post.md          # Original LinkedIn post content
├── outline.md       # Image outline/briefing
├── imgs/           # Original AI-generated images
│   ├── 01-factory-reality-check.png
│   └── 02-3step-verification.png
└── prompts/        # AI image generation prompt files
    └── 01-factory-reality-check.md
```

**Published Images (for MDX/blog use):** After image generation, copy images to:
```
public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/
```

**Archive Path (after publishing):** Move completed posts to:
```
social/linkedin-post/archive/{YYYY-MM}/{YYYY-MM-DD-topic}/
```

**Date format:** Use `YYYY-MM-DD` prefix for unique identification and chronological sorting.

### 2. Image Naming Convention

Use zero-padded two-digit prefix for ordering:
- `01-fake-factory-reveal.png` — First image (appears earlier in article)
- `02-3step-verification.png` — Second image (appears later)

### 3. Blog MDX Frontmatter Template

```yaml
---
title: "{Post Title}"
date: "{YYYY-MM-DD}"
description: "{Meta description - max 160 chars, compelling summary}"
author: "Winning Adventure Global"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
category: "{Category Name}"
readTime: "{N} min read"
coverImage: "/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/01-description.png"
ctaTitle: "{CTA Title}"
ctaText: "{CTA Description Text}"
ctaButtonText: "{Button Text}"
---
```

### 4. Image Path Rules for MDX

**CRITICAL:** MDX images must use `/public/social/` paths, NOT relative paths.

| Location | Use | Example |
|----------|-----|---------|
| `public/social/...` | MDX blog posts | `/social/linkedin-post/.../imgs/01-foo.png` |
| `social/...` | Source assets only | Original AI generation prompts, outlines |

**Action:** Copy images to `public/social/` before creating MDX:
```bash
mkdir -p public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs
cp social/linkedin-post/{YYYY-MM-DD-topic}/imgs/*.png public/social/linkedin-post/{YYYY-MM-DD-topic}/imgs/
```

### 5. Blog Article Structure

Expand LinkedIn post (Hook→Body→CTA) into blog format:

| LinkedIn Section | Blog Expansion |
|------------------|----------------|
| Hook (1-2 sentences) | Introduction (2-3 paragraphs setup) |
| Body paragraphs | Expanded sections with sub-headings |
| CTA (hard question) | Soft CTA (educational next steps) |

### 6. QA Checklist Before Publishing

- [ ] MDX file in `content/blog/{slug}.mdx`
- [ ] Frontmatter complete: title, date, description, author, tags, category, readTime, coverImage, ctaTitle, ctaText, ctaButtonText
- [ ] Images copied to `public/social/` with correct paths
- [ ] MDX image paths use `/social/` (not `../social/` or `../../social/`)
- [ ] ResourcesContent links use `/resources/${slug}` (not just `${slug}`)
- [ ] `npm run build` passes
- [ ] Article accessible at `/resources/{slug}` after deployment

## WAG Brand Voice Guidelines

**Reference:** CLAUDE.md brand personality — Reliable, Professional, Exclusive

| Do | Don't |
|----|-------|
| Practical, direct language | Salesy or hype-driven copy |
| Specific WAG insights from RAG | Generic B2B clichés |
| Trust signals and credentials | Aggressive CTAs or urgency tactics |
| Experienced, knowledgeable tone | Emoji or informal abbreviations |

**Tone:** Professional but approachable. Position WAG as the knowledgeable guide, not the seller.

**Voice:** Speak from experience. Use specific numbers, dates, or case references when available from RAG content.

## Critical Rules

- **Hook MUST be within 210 characters** — LinkedIn truncates at the "see more" line (~3 lines / 210 chars). If the hook exceeds this, readers never see it.
- **Hashtags: 6-10 maximum** — LinkedIn's algorithm penalizes spam signals from excessive hashtags. Mix broad (#Manufacturing) with specific (#AustraliaChinaTrade) tags.
- **CTA: Soft question only** — Drive comments with engagement questions, not direct links or lead forms. LinkedIn's algorithm rewards comment activity.
- **No emoji anywhere in the post** — WAG brand rule. Emoji dilute professional positioning.
- **Always invoke RAG before generating** — Retrieve at least 1 WAG blog post to source specific insights. Posts without WAG-specific content feel generic.
- **Avoid "WA" abbreviation** — Use "Winning Adventure Global" or "WAG" as appropriate.
- **Fact check required before publishing** — Verify all claims against WAG blog content or web search. Present fact check table to user for approval.
- **Blog images go in public/social/** — MDX files cannot reference `../social/` paths. Always copy to `public/social/` for Next.js static serving.
- **2026 Algorithm Rule: No external links in post body** — Put all links in the first comment. Links in post body receive -60% reach penalty.
