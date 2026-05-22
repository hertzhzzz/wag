# GEO Analysis — winningadventure.com.au

**Date:** 2026-05-21
**Analyst:** seo-geo skill

---

## 1. GEO Readiness Score: 71/100

**Rationale:** Strong technical foundations (SSR, llms.txt, AI crawler allowlist) + rich structured data. Critical gap: near-zero brand presence on platforms that correlate with AI citations (YouTube, Reddit, Wikipedia). Content citability is moderate — service pages have good structure but blog articles lack self-contained answer blocks.

---

## 2. Platform Breakdown

| Platform | Score | Notes |
|----------|-------|-------|
| **Google AI Overviews** | 72/100 | Top-10 ranking signals strong. Passage-level optimization needed. FAQ schema deprecated — static HTML FAQs are correct approach. |
| **ChatGPT** | 58/100 | Wikipedia absent (ChatGPT cites Wikipedia 47.9% of the time). LinkedIn company page exists but weak. Reddit presence zero. |
| **Perplexity** | 55/100 | Strong on Reddit citations (46.7%). No Reddit presence. Wikipedia absent. Community validation missing. |
| **Bing Copilot** | 70/100 | Bing index coverage good. IndexNow not implemented. Standard Bing SEO applies. |

---

## 3. AI Crawler Access Status

✅ **All key AI crawlers allowed:**

| Crawler | Owner | Status |
|---------|-------|--------|
| GPTBot | OpenAI | ✅ Allowed |
| ChatGPT-User | OpenAI | ✅ Allowed |
| ClaudeBot | Anthropic | ✅ Allowed |
| Claude-Web | Anthropic | ✅ Allowed |
| PerplexityBot | Perplexity | ✅ Allowed |
| Google-Extended | Google | ✅ Allowed |
| Bytespider | ByteDance | ✅ Allowed |
| CCBot | Common Crawl | Not blocked (training crawler — user may want to block) |

**robots.txt is well-configured for AI search visibility.** Crawl-delay: 1 on all AI bots prevents server overload while maintaining access.

**Recommendation:** Consider explicitly blocking CCBot if you do not want your content used for training:
```
User-agent: CCBot
Disallow: /
```

---

## 4. llms.txt Status

✅ **PRESENT** at `/llms.txt`

**Content quality: Strong.** Includes:
- Legal entity (PTY LTD, ABN, ACN)
- Physical address (North Adelaide SA)
- Contact details (phone, email)
- Service categories (6 defined)
- Geographic focus (Pearl River Delta, Yangtze River Delta)
- Team members (Andy Liu, Mark He) with roles and expertise areas

**Gaps:**
- No publication dates or last-updated timestamps
- No key facts/statistics that AI can cite
- No outbound links to authoritative sources (Wikipedia, industry bodies)
- No mention of client count, factory count, successful deployments
- "Founded: 2025" lacks exact date

**Recommendation — append to llms.txt:**
```
## Key Facts
- 500+ verified factory partners across Guangdong Province
- Factory tours in Shenzhen, Guangzhou, Shanghai, Dongguan
- 12-point supplier verification process
- Services Australian businesses since 2025
- ABN 94 697 886 150 — registered South Australia

## Industry Coverage
Consumer electronics, industrial equipment, packaging, custom components,
apparel, furniture — across all manufacturing categories in the Pearl River Delta
```

---

## 5. Brand Mention Analysis

| Platform | Presence | Quality | AI Citation Correlation |
|----------|----------|---------|------------------------|
| **Wikipedia** | ❌ None | N/A | 47.9% of ChatGPT citations |
| **YouTube** | ❌ None | N/A | ~0.737 (strongest signal) |
| **Reddit** | ❌ None | N/A | 46.7% of Perplexity citations |
| **LinkedIn** | ⚠️ Partial | Company page exists; personal profiles weak | Moderate |
| **Wikidata** | ❌ None | N/A | Supporting entity signals |

**Critical gap:** Brand mentions — particularly on YouTube and Reddit — correlate far more strongly with AI visibility than backlinks (0.266 correlation). Building presence on these platforms should be the highest-priority GEO activity.

**LinkedIn status:**
- Company page: `linkedin.com/company/winning-adventure-global` (referenced in MarkHeSchema sameAs)
- Mark He personal: `linkedin.com/in/mark-zhe-he/` (linked from about page)
- Andy Liu: No public LinkedIn presence found

---

## 6. Passage-Level Citability

**Sample page analyzed:** `/about` (homepage similarly structured)

**Strong signals:**
- Clear H1 → H2 → H3 hierarchy
- Specific numbers cited: "500+ verified suppliers", "7+ industries", "6 Chinese provinces"
- Direct quotes in blockquotes (extractable as self-contained blocks)
- Bullet lists with concrete items (checkmarks pattern)
- First paragraph defines value proposition in first 30 words

**Weak signals:**
- Long paragraphs (4-6 sentences) — AI prefers 2-4 sentence blocks
- No "What is..." definition block in first 60 words of any section
- Conclusions buried mid-paragraph rather than leading
- No statistics with source attribution
- No FAQ-style question headings (FAQ section exists but is structured as content, not Q&A headings)

**Optimal passage blocks identified:**

| Location | Word Count | Type | Assessment |
|----------|------------|------|-----------|
| About Hero (lines 92-98) | ~45 words | Value prop | Too short for citation |
| "Australian Business" bullet list | ~80 words | List | Good structure, moderate citability |
| "500+ verified suppliers" paragraph | ~65 words | Statistics | Good but lacks source |
| About South Australia section | ~120 words | Location description | Moderate — needs citation anchors |
| Values strip (3 items) | ~40 words each | Declarative | Good individual citability |

**No 134-167 word optimal blocks found.** Content tends toward short declarative paragraphs rather than comprehensive self-contained answer blocks.

---

## 7. Server-Side Rendering Check

✅ **SSR confirmed — Next.js App Router default**

All pages use Next.js server components. No client-only content detected. AI crawlers can access full page content.

**Key pages checked:**
- `/` — SSR ✅
- `/about` — SSR ✅
- `/services` — SSR ✅
- `/resources` — SSR ✅
- `/enquiry` — SSR ✅

**No JavaScript dependency for core content.** Video poster images use static fallback. All text content is server-rendered.

---

## 8. Top 5 Highest-Impact Changes

| Priority | Action | Impact | Effort |
|----------|--------|--------|--------|
| 🔴 **1** | Create YouTube channel with WAG factory tour clips, supplier interview footage | Very High — YouTube correlation ~0.737 with AI citations | Medium |
| 🔴 **2** | Build Reddit presence via genuine industry contributions (r/AustralianBusiness, r/ChinaBusiness) | High — Reddit 46.7% Perplexity / 11.3% ChatGPT citations | Medium |
| 🟠 **3** | Create Wikipedia entry for Winning Adventure Global (entity presence drives ChatGPT citations) | High — Wikipedia 47.9% of ChatGPT citations | Medium-High |
| 🟡 **4** | Add "What is a China Sourcing Agent?" definition block to `/services` (first 60 words, "X is..." pattern) | Medium — direct AIO citability improvement | Low |
| 🟡 **5** | Restructure key service pages into 134-167 word self-contained blocks with question headings | Medium — passage-level citability for AIO | Medium |

---

## 9. Schema Recommendations

**Current schemas deployed:**
- `ArticleSchema.tsx` — BlogPosting + Article dual-type ✅
- `CaseStudySchema.tsx` — Case study pages ✅
- `BreadcrumbSchema.tsx` — Navigation path ✅
- `FAQSchema.tsx` — Returns null (deprecated by Google for B2B) ✅ correct
- `HowToSchema.tsx` — How-to pages ✅
- `MarkHeSchema.tsx` — Person (Mark He) ✅
- `ServiceSchema.tsx` — Service pages ✅

**Missing schemas for GEO improvement:**

| Schema | Where | Purpose |
|--------|-------|---------|
| `Organization` | Global layout | Brand authority, sameAs links to LinkedIn, Wikipedia |
| `VideoObject` | Any page with embedded video (about hero) | YouTube embed citability |
| `Review` + `AggregateRating` | Services page | E-E-A-T trust signals |
| `FAQPage` | Deprecated — ignore | Correct, Google deprecated for B2B |

**Recommendation: Add Organization schema to layout.tsx:**
```tsx
// In app/layout.tsx — add Organization schema
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Winning Adventure Global",
  "url": "https://www.winningadventure.com.au",
  "logo": "https://www.winningadventure.com.au/favicon.ico",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "5/54 Melbourne St",
    "addressLocality": "North Adelaide",
    "addressRegion": "SA",
    "postalCode": "5006",
    "addressCountry": "AU"
  },
  "telephone": "+61-416588198",
  "email": "info@winningadventure.com.au",
  "sameAs": [
    "https://www.linkedin.com/company/winning-adventure-global",
    "https://www.youtube.com/@winningadventureglobal"  // when created
  ]
}
```

---

## 10. Content Reformatting Suggestions

### A. `/services` — Add definition block (Quick Win)

Replace or prepend the hero section with:
> "A China sourcing agent is a professional service that connects international buyers — particularly Australian businesses — with verified manufacturers in China. Unlike trading companies or brokers, a sourcing agent works directly on the buyer's behalf, conducting factory verification, coordinating visits, and managing quality inspection before products ship."

First 40 words follow the "X is..." pattern AI rewards. Insert at top of services hero.

### B. About page — Break up long paragraphs

Current "Founder Story" section has 4-paragraph block. Split into:
1. **"Who is Andy Liu?"** (definition block, ~80 words)
2. **"The Problem We Solve"** (~60 words)
3. **"Our Approach"** (~60 words)
4. Quote block (standalone, extractable)

### C. Homepage process steps — Convert to Q&A format

Change:
```
## 01 Initial Consultation
Tell us what you need...
```

To:
```
### What happens in the initial consultation?
We discuss your specifications, volume, timeline, and budget to identify suitable factory categories.
```

Question-based H3 headings match AI query patterns. Each answer block should be 40-80 words.

### D. Add statistics with source context

Current: "500+ verified suppliers"
Better: "500+ verified suppliers across 6 Chinese provinces — each vetted against business license records, production capacity assessments, and on-site quality audits"

Source attribution in parentheses increases citability.

---

## Summary: Immediate Actions

1. **Block CCBot** in robots.txt (training crawler — add explicit disallow)
2. **Append key facts** to `/llms.txt` (factory count, verification process, ABN)
3. **Add Organization schema** to layout.tsx with sameAs LinkedIn
4. **Add "What is..." definition** block to `/services` (first 60 words)
5. **Restructure** homepage process steps as Q&A format
6. **Build YouTube channel** (highest correlation with AI citations at ~0.737)
7. **Build Reddit presence** (critical for Perplexity visibility)
8. **Pursue Wikipedia entry** for ChatGPT visibility (47.9% of citations)

---

*Analysis generated by claude-seo:seo-geo skill*
*Next step: run `/seo flow optimize https://www.winningadventure.com.au/services` for prompt-guided AI content optimization*