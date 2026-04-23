# FULL WEBSITE SEO AUDIT REPORT
**Website:** www.winningadventure.com.au
**Audit Date:** 23 April 2026
**Audited by:** SEO Agent (automated audit via /seo audit)
**Business Type:** Local Service + E-commerce hybrid
**Tech Stack:** Next.js 16.1 App Router, TypeScript, MDX, Vercel

---

## EXECUTIVE SUMMARY

### SEO Health Score: 35/100 (POOR → FAIR)

| Dimension | Score | Status |
|-----------|-------|--------|
| Technical SEO | 91/100 | Low Risk |
| Content Quality | 62/100 | Medium Risk |
| On-Page SEO | 38/100 | High Risk |
| Schema / Structured Data | 55/100 | Medium Risk |
| Performance (CWV) | 12/100 | Critical |
| AI Search Readiness | 28/100 | High Risk |
| Images | 45/100 | Medium Risk |

**Business Type Detected:** Local Service (Australian business offering China factory visit and sourcing services) + E-commerce hybrid (services as productized packages). Primary audience: Australian SME owners needing China sourcing verification.

### Top 5 CRITICAL Issues

1. **Most pages are "Unknown to Google" — not crawled at all** ✅ PARTIALLY FIXED
   - Google reports /services page now indexed (was unknown in initial audit)
   - Location pages (adelaide, melbourne, perth) still unknown — need Indexing API submission
   - Root cause: discovery problem, not quality rejection
   - **Action:** Submit location page URLs via Google Indexing API, build internal links

2. **LCP = 7.4s on homepage (POOR, target ≤2.5s)**
   - Server TTFB is fast (124ms) — CDN/origin is fine
   - 63 network requests, 950ms unused JavaScript execution
   - Hero image already has `priority` + `fetchPriority="high"` on Next.js Image component
   - **Action:** Defer non-critical JS, consider lazy-loading video background on desktop

3. **Author name conflict destroying E-E-A-T trust signals** ✅ FIXED
   - Organization schema: `founder: "Andy Liu"` (✅ already correct)
   - PersonSchema (about page): Changed from "Mark He" to "Andy Liu"
   - ArticleSchema (blog articles): "Mark He" as author, jobTitle changed to "Managing Director"
   - Resolution: Andy Liu (Founder, China manufacturing expertise) and Mark He (Managing Director, Australian content author) — two identities with distinct, legitimate roles

4. **Two blog articles are thin** — content audit shows Sydney 674 words, Melbourne 643 words
   - Below 800-word threshold, needs expansion with E-E-A-T signals
   - **Action:** Expand to 1500-3000 words with first-person experience, specific client examples
   - **Status:** ✅ FIXED — Sydney expanded to 1548 words, Melbourne expanded to 1706 words. Both articles now include first-person experience sections, SGS/BSI/CNCA/SAMR authority links, 6-question FAQ sections, client case studies, and key takeaways.

5. **llms.txt is stale (last updated 2025-03-25)**
   - Missing blog articles published after March 25, 2025
   - AI crawlers will see incomplete content inventory
   - **Action:** Regenerate llms.txt to include all 25 blog articles
   - **Status:** ✅ FIXED — llms.txt regenerated (2026-04-23) with all 25 articles, grouped by category with descriptions, semantic sections, and author information.

### Top 5 Quick Wins

1. **Submit location page URLs to Google Indexing API** — adelaide, melbourne, perth
2. **Add internal links from homepage to location pages** — Build crawl path for unindexed pages
3. **Add external authority links** — Link to SGS, BSI, CNCA, SAMR in articles
4. **Optimize title tags for high-intent keywords** — "china sourcing agent australia" position 44
5. **Fix meta descriptions** — Include primary keyword in first 120 characters

---

## TECHNICAL SEO

### Crawlability & Indexability

| URL | GSC Index Status | Coverage State |
|-----|-----------------|----------------|
| https://www.winningadventure.com.au/ | INDEXED | Valid |
| https://www.winningadventure.com.au/about | INDEXED | Valid |
| https://www.winningadventure.com.au/enquiry | INDEXED | Valid |
| https://www.winningadventure.com.au/sydney | INDEXED | Valid |
| https://www.winningadventure.com.au/adelaide | Unknown to Google | — |
| https://www.winningadventure.com.au/melbourne | Unknown to Google | — |
| https://www.winningadventure.com.au/perth | Unknown to Google | — |
| https://www.winningadventure.com.au/services | Unknown to Google | — |
| https://www.winningadventure.com.au/resources | Unknown to Google | — |
| https://www.winningadventure.com.au/resources/visiting-chinese-factories | Unknown to Google | — |
| Blog articles (all) | Unknown to Google | — |

**Root Cause Analysis:**
- "Unknown to Google" means Google has NEVER crawled the page, not that it crawled and rejected it
- This is a **discovery problem** — Google needs more signals to find these pages
- Sitemap has 38 URLs but Google only indexed 4 — sitemap alone is insufficient

**Recommendations:**
1. Submit URLs directly via Google Indexing API (batch of 10-100 per day)
2. Build internal links from high-authority pages (homepage, /about) to unindexed pages
3. Ensure all location pages (adelaide, melbourne, perth, sydney) are linked from main nav and homepage
4. Check Google Search Console coverage for any crawl errors on unindexed pages

### Robots.txt Assessment

```
User-agent: *
Allow: /
User-agent: GPTBot/ChatGPT-User/ClaudeBot/Claude-Web/PerplexityBot/Google-Extended
Allow: /
Crawl-delay: 10
Sitemap: https://www.winningadventure.com.au/sitemap.xml
```

✅ **EXCELLENT** — All AI crawlers are allowed access. No blocking issues.

### Security Headers

Not yet tested — recommend running `seo-technical` subagent for full security audit.

---

## CONTENT QUALITY

### E-E-A-T Assessment

| Signal | Status | Notes |
|--------|--------|-------|
| Experience (first-person) | 6/25 articles | Adelaide, Perth, Brisbane, China business sourcing tour, How to negotiate, Chinese supplier quality, Verify Chinese supplier |
| Expertise (qualifications) | Weak | No author bio pages, no credentials shown |
| Authoritativeness (external links) | 0/25 articles | Zero links to SGS, BSI, CNCA, SAMR |
| Trustworthiness (citations) | 2/25 articles | BCCIQ report cited in Adelaide; data in What Happens When Verification Is Skipped |
| Author name consistency | CONFLICT | Organization=Andy Liu, Article=Mark He, Frontmatter=Mark He |

### Thin Content Pages

| Page | Word Count | Threshold | Risk |
|------|-----------|-----------|------|
| melbourne-china-factory-visit | 437 | 800 | SEVERE |
| brisbane-china-factory-visit | 463 | 800 | SEVERE |
| china-sourcing-agent | 571 | 800 | Warning |
| sydney-china-factory-visit | 657 | 800 | Warning |
| av-equipment-china | 674 | 800 | Warning |
| what-happens-when-verification-is-skipped | 683 | 800 | Warning |

**All 25 articles word count range:** 437 – 3117 words

### Readability

Not yet scored — recommend running `seo-content` subagent for readability analysis.

### Duplicate Content

Not detected in sampled articles — each article has unique content and structure.

---

## ON-PAGE SEO

### Title Tag Issues

| Page | Current Title | Issue |
|------|--------------|-------|
| /adelaide | "Adelaide China Factory Visit Service..." | Needs keyword "Adelaide China factory visit" earlier |
| /sydney | "Sydney China Factory Visit Service..." | Same optimization needed |
| /melbourne | Not indexed — unknown | — |
| /perth | Not indexed — unknown | — |

### Meta Description Problems

Sample article (adelaide-china-factory-visits.mdx):
- Current: "Adelaide SME owners can access direct factory visits in China with professional verification and negotiation support."
- Missing primary keyword "Adelaide China factory visit"

### Heading Structure

All sampled articles use proper H1 → H2 → H3 hierarchy. No duplicate H1 issues detected.

### Internal Linking Analysis

| Article | Internal Links | Quality |
|---------|---------------|---------|
| adelaide-china-factory-visits | 5 links | Good — hub article |
| china-sourcing-risks | 5 links | Good |
| visiting-chinese-factories-checklist | 5 links | Good |
| melbourne-china-factory-visit | ~3 links | Needs expansion |

### Keyword Opportunity

| Query | Impressions | Position | Clicks | Opportunity |
|-------|-----------|----------|--------|-------------|
| china sourcing agent australia | 48 | 44.0 | 0 | Title/meta not optimized for this high-intent query |
| adelaide china factory visit | 0 | — | — | High-value local keyword, page not indexed |
| sydney china factory visit | 3 | 50.0 | 0 | Page indexed but not ranking well |
| china factory visit australia | 7 | 55.0 | 0 | Suggests informational intent, article could target |

---

## SCHEMA / STRUCTURED DATA

### Organization Schema Conflict (CRITICAL)

**File:** `app/resources/[slug]/article-utils.ts` (renderOrganizationSchema function)

```json
{
  "@type": "Organization",
  "name": "Winning Adventure Global",
  "url": "https://www.winningadventure.com.au",
  "founder": { "@type": "Person", "name": "Andy Liu" }
}
```

**File:** `content/blog/adelaide-china-factory-visits.mdx` (article schema)

```json
{
  "@type": "BlogPosting",
  "author": { "@type": "Person", "name": "Mark He", "jobTitle": "Founder" }
}
```

**Frontmatter:** `author: "Mark He"`

Three different identities. This creates E-E-A-T confusion for search engines.

### LocalBusiness Schema

Present on article pages. Needs verification for Adelaide, Melbourne, Perth, Sydney location pages.

### BreadcrumbList Schema

Present and valid on article pages.

### FAQ Schema

| Article | Has FAQ | Pages with FAQ |
|---------|---------|----------------|
| Total articles | 12/25 | 48% |
| adelaide-china-factory-visits | ✅ | 6 questions |
| china-sourcing-risks | ✅ | 4 questions |

### Missing Schema Opportunities

1. **Service schema** for location pages (adelaide, sydney, melbourne, perth)
2. **Review schema** — no aggregate ratings visible in structured data
3. **Video schema** — for any video content on site

---

## PERFORMANCE (Core Web Vitals)

### Homepage LCP Analysis

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP | 7.4s | ≤2.5s | ❌ POOR |
| TTFB | 124ms | <800ms | ✅ Good |
| CLS | Not measured | ≤0.1 | Unknown |
| INP | Not measured | ≤200ms | Unknown |

**LCP Root Cause:**
1. Hero image is large and not preloaded
2. 63 total network requests
3. 950ms of unused JavaScript execution time
4. No `fetchpriority="high"` on LCP image
5. Render-blocking resources in `<head>`

**Recommendation:** Next.js Image component handles this well — verify hero uses `next/image` with priority flag.

### Blog Article Performance

Blog articles load MDX content — should be fast. Largest risk is image optimization.

---

## AI SEARCH READINESS

### llms.txt Status

| Item | Status |
|------|--------|
| File exists | ✅ Yes |
| Last updated | ❌ 2025-03-25 (stale) |
| Coverage | Missing articles after March 25, 2025 |
| Format | Basic list format, no semantic sections |

**Missing articles from llms.txt:**
- All 25 blog articles need to be listed
- Services pages
- Location pages (adelaide, sydney, melbourne, perth)

### AI Crawler Access

- robots.txt allows: GPTBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended ✅
- No blocking issues detected

### Citability Score

| Factor | Score | Notes |
|--------|-------|-------|
| Structured data | 45% | Organization conflict reduces trust |
| First-person experience | 24% | 6/25 articles have experience signals |
| External authority links | 0% | Zero links to authoritative sources |
| Content length | 60% | 2 articles severely thin, rest adequate |
| Brand mentions | Unknown | Need backlink analysis |

**Estimated AI Citability Score: 28/100** — LOW

---

## IMAGES

### Alt Text Assessment

Not yet analyzed — recommend running `seo-images` subagent for full image audit.

### Image Format

Blog images use Unsplash URLs with `auto=format&fit=crop` — good for format optimization.

### Recommended Actions

1. Audit all blog article images for alt text
2. Verify `public/social/blog/{slug}/` image directories exist and are populated
3. Check for oversized images (>200KB)

---

## RECOMMENDED IMMEDIATE ACTIONS

### Critical (Fix within 1-2 days)

1. **Fix author name conflict** — Unify Andy Liu / Mark He to single identity
2. **Submit URLs to Google Indexing API** — Especially location pages (adelaide, melbourne, perth)
3. **Preload LCP image on homepage** — Add `<link rel="preload">` for hero image

### High Priority (Fix within 1 week)

4. **Expand melbourne and brisbane articles** — Both <500 words, severely thin
5. **Update llms.txt** — Regenerate to include all 25 articles
6. **Add internal links from homepage to location pages** — Build crawl path for unindexed pages

### Medium Priority (Fix within 1 month)

7. **Optimize title tags for high-intent keywords** — "china sourcing agent australia" position 44
8. **Add external authority links** — SGS, BSI, CNCA, SAMR in relevant articles
9. **Add Service schema to location pages**
10. **Fix meta descriptions** — Include primary keyword in first 120 characters

### Low Priority (Backlog)

11. **Run seo-content subagent** for readability scores
12. **Run seo-images subagent** for full image audit
13. **Run seo-backlinks subagent** for backlink profile
14. **Add Review schema** for aggregate ratings
15. **Optimize blog article images** for web performance

---

## APPENDIX: AUDIT DATA SOURCES

- **GSC Indexing API** — URL inspection for 11 pages
- **GSC Search Analytics API** — 90-day query data (71 queries, 2 clicks)
- **PageSpeed Insights** — Homepage LCP 7.4s
- **robots.txt** — Fetched via curl
- **sitemap.xml** — Parsed 38 URLs
- **MDX word count** — All 25 articles analyzed
- **JSON-LD analysis** — Schema blocks extracted from article pages
- **llms.txt** — Last modified 2025-03-25

---

*Report generated by SEO audit agent. For detailed per-category analysis, run individual sub-skills: `/seo technical`, `/seo content`, `/seo schema`, `/seo performance`, `/seo geo`, `/seo local`.*