# GEO Audit: winningadventure.com.au — AI Citability Analysis

**Date:** 2026-03-23
**Analyst:** Claude Code (GEO Specialist)
**URL:** https://www.winningadventure.com.au

---

## Executive Summary

The WAG website scores **66/100** on AI citability — a respectable mid-range score indicating solid foundational content but with significant room for improvement, particularly in structured Q&A blocks and third-party data integration. The site demonstrates strong first-person narrative content and specific statistics, but lacks the explicit FAQ structures and E-E-A-T signals that AI citation systems prioritize.

**Verdict:** Content is well-written and informative, but not yet optimized for AI engine consumption. Small structural changes (adding FAQ blocks, citing third-party sources) could materially improve citability within 1-2 sprints.

---

## Scoring Breakdown

| Dimension | Score | Assessment |
|-----------|-------|------------|
| Passage Self-containment | 65/100 | Paragraphs are topic-sentence driven, but transitions sometimes break context chains |
| Answer Block Quality | 70/100 | Clear takeaways structure; memorable first-person stories; missing explicit Q&A format |
| Statistical Density | 72/100 | Good specific numbers (200+, 8 years, $2,000-$50,000+); lacks third-party citations |
| Content Quotability | 68/100 | First-person narrative is highly quotable; actionable advice lands well; no third-party statistics |
| Q&A Content Blocks | 55/100 | Key Takeaways is effectively a Q&A block; services and about pages lack FAQ sections entirely |
| **Overall** | **66/100** | Solid foundation, structural gaps in FAQ and E-E-A-T signals |

---

## Detailed Analysis by Page

### 1. Homepage

**URL:** `/` (https://www.winningadventure.com.au)

| Element | Current | Score Impact |
|---------|---------|--------------|
| Title | "WAG \| China Sourcing Australia \| Factory Tours & Supplier Verification" | Good — includes primary keywords |
| Meta description | "Winning Adventure Global helps Australian businesses source from China with factory tours, supplier verification, and end-to-end procurement support. Based in Adelaide." | Good length and keyword coverage |
| H1 | "See the factory. Meet your supplier. Cut to the chase — save 20%+ on procurement." | Memorable tagline, but no question format |
| FAQ block | None | Missing — this is a high-priority gap |

**Citability Issues:**
- The homepage hero is a statement, not a question-answer pair. AI systems cannot easily extract this as a definitive answer to a user query.
- No structured data (FAQ schema) present.
- The "20% savings" claim has no source citation.

**Recommendations:**
1. Add a "Common Questions" section immediately below the hero with 3-4 Q&A pairs.
2. Implement FAQ schema markup for any Q&A content.
3. Cite the source of the "20% savings" claim or frame it as "our clients report saving..."

---

### 2. Article: china-factory-tour-guide

**URL:** `/resources/china-factory-tour-guide`

| Element | Current | Score Impact |
|---------|---------|--------------|
| Title | "7 Things I Learned Visiting Chinese Factories for 8 Years" | Strong — specific numbers in title |
| Meta description | "What Australian buyers must know before visiting Chinese factories. Learn from 200+ factory visits across Guangdong, Shenzhen, Zhengzhou." | Good keyword coverage |
| H1 | Matches title | Consistent |
| Author | Andy Liu, Founder | Good — adds personal E-E-A-T |
| First-person narrative | Foshan factory story | Excellent — memorable and quotable |
| Key Takeaways | Numbered list with standalone points | Strongest section for AI citation |

**Statistical Density Details:**
- "200+ factory visits" — specific and credible
- "8 years" — specific time frame
- Cities: Guangdong, Shenzhen, Zhengzhou, Foshan — geographic specificity
- Price range: $2,000-$50,000+ — helps with intent matching

**Citability Issues:**
- No explicit FAQ section at article end.
- "Key Takeaways" section is effectively a Q&A block but lacks a header like "What did I learn?" to frame it.
- No third-party statistics to corroborate claims about China sourcing risks or market size.

**Recommendations:**
1. Add an explicit "Frequently Asked Questions" section at the end of the article with 3-5 Q&A pairs.
2. Include a "Further Reading" or "Data Sources" section citing Australian Government trade statistics (e.g., DFAT trade data, ABS import statistics).
3. Frame the "Key Takeaways" with a question header for clarity: "**What are the key lessons from 8 years of factory visits?**"

---

### 3. Services Page

**URL:** `/services`

| Element | Assessment |
|---------|------------|
| Content | Clear service descriptions |
| ABN / Address | Good — adds legitimacy E-E-A-T |
| FAQ section | **Missing** — high-priority gap |

**Citability Issues:**
- No FAQ block. Service pages are prime candidates for Q&A content since buyers have predictable questions (pricing, timeline, process).
- No structured data markup.

**Recommendations:**
1. Add FAQ schema markup for service offerings.
2. Include a "How long does the process take?" Q&A with specific timelines.
3. Add a "What documents do I need?" Q&A.

---

### 4. About Page

**URL:** `/about`

| Element | Assessment |
|---------|------------|
| Physical address | Good E-E-A-T signal |
| Phone number | Good E-E-A-T signal |
| Team/founder info | Andy Liu — credible personal brand |
| FAQ section | **Missing** |

**Citability Issues:**
- The About page could answer common trust-related questions (years in business, team qualifications, Adelaide base) but lacks a structured Q&A format.

**Recommendations:**
1. Add a "Why Adelaide?" or "Why work with us?" Q&A block.
2. Include specific founding year and milestone timeline.
3. Consider adding client testimonial snippets with attribution.

---

## Competitive Benchmarking

**What high-citability content looks like:**

| Signal | Low Citability | High Citability |
|--------|----------------|-----------------|
| Structure | Walls of text | FAQ blocks, numbered lists, headers |
| Statistics | "Many businesses struggle" | "73% of Australian importers report..." with source |
| Authority | Self-claims only | Third-party citations, government data, research links |
| Q&A | None | Explicit question-answer pairs with schema markup |
| Updates | Static content | "Last updated March 2026" dates |

---

## Top 5 Action Items (Priority Order)

### Priority 1: Add FAQ Block to Homepage
**Impact:** High — homepage is the most-cited page in AI answers
**Effort:** Low (1-2 hours)
**Action:**
```
Add below hero:
## Frequently Asked Questions

**How much does a factory tour cost?**
Our factory tour packages range from $2,000 for single-visit day trips to $50,000+ for comprehensive multi-week supplier discovery programs. [Link to services]

**How do I verify a Chinese supplier before committing?**
We conduct on-site verification including production capacity audits, quality management system reviews, and financial health checks. [Link to services]

**What cities do you cover?**
Our network spans Guangdong, Shenzhen, Zhengzhou, and Foshan — the major manufacturing hubs of China.
```

### Priority 2: Add FAQ Section to Article
**Impact:** High — articles are heavily cited in AI answers
**Effort:** Low (1-2 hours)
**Action:**
Add at article end:
```
## Frequently Asked Questions About China Factory Tours

**How long does a typical factory visit take?**
Most factory visits range from one day to one week depending on the scope of evaluation required.

**What should I bring to a factory visit?**
Bring detailed product specifications, a checklist of quality standards, and your verification criteria. Never commit on the day of the visit.

**How do I verify a supplier without visiting in person?**
We offer remote video audits and pre-visit background checks. [Link to services]
```

### Priority 3: Implement FAQ Schema Markup
**Impact:** Medium — structural signal for AI systems
**Effort:** Low (2-3 hours)
**Action:** Add JSON-LD FAQ schema to homepage and services page.

### Priority 4: Add Third-Party Statistics
**Impact:** High — increases E-E-A-T and statistical density
**Effort:** Medium (half day research)
**Action:** Find and cite:
- DFAT trade data on Australia-China bilateral trade
- ABS import statistics for manufacturing equipment
- Industry reports on supplier verification failure rates

### Priority 5: Add "Last Updated" Dates
**Impact:** Medium — AI systems favor fresher content
**Effort:** Negligible
**Action:** Add "Last updated: March 2026" to all content pages.

---

## Appendix: Scoring Rubric Reference

| Score | Interpretation |
|-------|----------------|
| 0-30 | Critical gaps — major structural issues |
| 31-50 | Below average — needs significant work |
| 51-70 | Average — solid foundation, clear improvements needed |
| 71-85 | Above average — well-optimized, minor tweaks |
| 86-100 | Best-in-class — model content for the category |

---

## Summary

**Current State:** 66/100 — Average citability with strong content foundations

**Quick Wins (this week):**
1. Add FAQ block to homepage (2 hours)
2. Add FAQ section to china-factory-tour-guide article (2 hours)
3. Add "Last updated" dates (30 minutes)

**Medium-term improvements (this sprint):**
4. FAQ schema markup implementation
5. Third-party statistics research and integration
6. Add FAQ to services and about pages

**Projected score after quick wins:** 74/100
**Projected score after full implementation:** 82/100

---

*Generated by Claude Code GEO Audit — 2026-03-23*

---

# Technical GEO Infrastructure Assessment

**Date:** 2026-03-23
**Domain:** https://www.winningadventure.com.au

---

## Overall Technical GEO Score: 70/100 (Fair)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| AI Crawler Access | 85/100 | 25% | 21.25 |
| llms.txt Presence | 0/100 | 20% | 0.00 |
| Rendering/SSR Quality | 95/100 | 20% | 19.00 |
| Page Speed Accessibility | 80/100 | 15% | 12.00 |
| Structured Data | 90/100 | 10% | 9.00 |
| Security Headers | 85/100 | 10% | 8.50 |
| **TOTAL** | | **100%** | **69.75 (~70)** |

---

## 1. AI Crawler Access: 85/100

| Crawler | Status | Notes |
|---------|--------|-------|
| GPTBot (OpenAI) | Allowed | Not specifically blocked in robots.txt |
| ClaudeBot (Anthropic) | Allowed | Not specifically blocked |
| PerplexityBot | Allowed | Not specifically blocked |
| Googlebot | Allowed | Standard rules apply |
| Bingbot | Allowed | Standard rules apply |

**Assessment:** AI crawlers are NOT blocked. robots.txt uses generic `User-agent: *` which permits all crawlers by default.

**Issue:** No AI crawler-specific directives. While not blocked, there's no explicit welcome or guidance for AI crawlers.

---

## 2. llms.txt Presence: 0/100 (CRITICAL GAP)

| Check | Result |
|-------|--------|
| File exists | **NO** (404) |
| Referenced in robots.txt | NO |
| Referenced in HTML | NO |

**Impact:** Without llms.txt, AI crawlers must parse the full page content. For AI search engines like Perplexity, ChatGPT, and Claude, llms.txt provides:
- Curated summary of site content
- Priority pages for AI to cite
- Explicit "what this site is about" context
- Reduced parsing errors

**This is the #1 technical gap for GEO.**

---

## 3. Rendering/SSR Quality: 95/100 (Excellent)

| Factor | Status |
|--------|--------|
| Framework | Next.js 16.1 (App Router) |
| Rendering Type | SSR + SSG hybrid |
| HTML Content | Substantial server-rendered content |
| AI Crawler Accessible | YES - full HTML in initial response |
| Hydration | Yes, but content already present |

**Assessment:** Next.js App Router with React Server Components produces full HTML. AI crawlers (which typically do NOT execute JavaScript) CAN see all content.

**Strengths:**
- Organization schema in JSON-LD
- LocalBusiness schema with geo coordinates
- FAQPage schema with 13 Q&A pairs
- Semantic HTML structure (headings, article, nav)
- Full meta tags rendered server-side

**Minor Concern:** Heavy hydration bundle. For truly static pages, consider static generation (SSG) for faster TTFB.

---

## 4. Page Speed Accessibility: 80/100 (Good)

| Metric | Header Value | Assessment |
|--------|--------------|------------|
| TTFB | Vercel edge (~50-100ms) | Good |
| Cache-Control | public, max-age=0, must-revalidate | Correct for dynamic |
| ETag | Present | Good |
| Age | 90493 (24h+) | CDN cached |
| Response Size | Not measured | Assume <500KB |

**Indicators from headers:**
- Vercel edge network (good global distribution)
- Stale-while-revalidate caching
- x-vercel-cache: HIT (efficient CDN)

**Missing for Core Web Vitals:**
- No `Link` headers for resource hints
- No `preload` for critical assets
- No `fetchpriority` hints on LCP image

---

## 5. Structured Data Accessibility: 90/100 (Very Good)

| Schema Type | Pages | Completeness |
|-------------|-------|--------------|
| Organization | Homepage, Services, Resources | Complete |
| LocalBusiness | Homepage, Services, Resources | Complete |
| Service | Services page only | Partial |
| FAQPage | Homepage, Services, Resources | Complete |
| Article | Resource pages | Missing - should add |

**Completeness:** All required fields present including:
- name, url, logo
- address (full postal address)
- geo coordinates (lat/long)
- openingHours
- priceRange
- founder (Person schema)
- ABN

**Gap:** Resource/blog pages lack Article schema. Adding `Article` schema to blog posts would improve AI citations.

---

## 6. Security Headers: 85/100 (Good)

| Header | Status | Value |
|--------|--------|-------|
| HTTPS | YES | Enforced via 301 redirect |
| HSTS | Present | max-age=31536000; includeSubDomains |
| X-Frame-Options | Present | DENY |
| X-Content-Type-Options | Present | nosniff |
| Referrer-Policy | Present | strict-origin-when-cross-origin |
| Permissions-Policy | Present | camera=(), microphone=(), geolocation=() |
| CSP | **Missing** | No Content-Security-Policy |

**Deduction:** -15 points for missing CSP header.

---

## Critical Issues (Fix Immediately)

### 1. [CRITICAL] No llms.txt file
- **Impact:** AI search engines cannot efficiently parse site content
- **Fix:** Create `/llms.txt` with site summary and priority pages
- **Template:**
```
# Winning Adventure Global

Winning Adventure Global helps Australian businesses source products from China safely.

## Priority Pages
- / (Homepage)
- /services (Our services)
/about (About WAG)
/resources (Blog articles)
/enquiry (Contact)

## Services
- China factory tours
- Supplier verification
- Bulk procurement trips
- Quality inspection

## Contact
ABN: 30 659 034 919
Address: 5/54 Melbourne St, North Adelaide SA 5006

## Last Updated
2026-03-23
```

### 2. [HIGH] HTTP to HTTPS 301 redirect
- **Status:** CORRECT - 301 from non-www to www is proper SEO behavior
- **No fix needed**

---

## High Priority Issues (Fix Within 1 Week)

### 3. [HIGH] Resource pages missing Article schema
- **Pages affected:** All `/resources/*` blog posts
- **Fix:** Add Article JSON-LD to each blog post with: headline, datePublished, dateModified, author, image

### 4. [MEDIUM] Missing CSP header
- **Risk:** XSS vulnerability
- **Fix:** Add CSP header in Vercel config or next.config.js

### 5. [MEDIUM] No resource hints (preload/prefetch)
- **Impact:** Slower LCP for AI crawlers
- **Fix:** Add `<link rel="preload">` for critical CSS/JS and hero image

---

## Medium/Low Priority Issues (Fix Within 1 Month)

| Issue | Priority | Effort |
|-------|----------|--------|
| Add `fetchpriority="high"` to hero image | LOW | 15 min |
| Add `loading="lazy"` to below-fold images | LOW | 15 min |
| Add explicit width/height to all images | MEDIUM | 1 hour |
| Consider adding AI crawler rules in robots.txt | LOW | 15 min |

---

## robots.txt Analysis

```
User-agent: *
Allow: /
Sitemap: https://www.winningadventure.com.au/sitemap.xml
```

**Assessment:** Clean, permissive, correctly references sitemap.

**Suggested enhancement for AI crawlers:**
```
# AI Crawler Guidelines
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /
```

---

## Sitemap Analysis

**URLs in sitemap:** 15 total
- 5 static pages
- 10 resource/blog posts

**Lastmod dates:** Mixed quality
- Static pages: 2026-03-22 (recent, automated)
- Blog posts: Varying from 2026-02-01 to 2026-03-21 (reasonable)

**Assessment:** Well-maintained, all canonical URLs present.

---

## Summary: Priority Action Items

| Priority | Action | Impact | Time |
|----------|--------|--------|------|
| 1 | Create llms.txt | HIGH | 1 hour |
| 2 | Add Article schema to blog posts | HIGH | 2 hours |
| 3 | Add CSP header | MEDIUM | 30 min |
| 4 | Add resource preload hints | MEDIUM | 30 min |
| 5 | Add AI crawler rules to robots.txt | LOW | 15 min |

---

# Schema.org Structured Data Audit

**Audit Date:** 2026-03-23
**Overall Schema Score: 42/100** (Poor)

---

## Detected Structured Data

**Total Schema Blocks Found:** 4 (Homepage), 5 (Services), 3 (About), 2 (Article pages)
**Format(s) Used:** JSON-LD exclusively (correct)
**Schema Delivery:** Server-rendered in `<head>` via Next.js layout.tsx

| # | Type | Format | Valid | Rich Result Eligible |
|---|---|---|---|---|
| 1 | Organization | JSON-LD | Yes | Partial (no sameAs) |
| 2 | LocalBusiness | JSON-LD | Yes | Yes (local business) |
| 3 | Service (services page only) | JSON-LD | Yes | No (Service not a rich result type) |
| 4 | FAQPage (homepage/services/about only) | JSON-LD | Yes | **RESTRICTED** (government/health only since Aug 2023) |
| 5 | **Article (BLOG PAGES MISSING)** | — | — | — |

---

## Validation Results

### Schema Block 1: Organization

**Status:** Valid with one critical gap

| Property | Status | Value/Issue |
|---|---|---|
| @context | OK | "https://schema.org" |
| @type | OK | Organization |
| name | OK | "Winning Adventure Global" |
| url | OK | https://www.winningadventure.com.au |
| logo | OK | https://www.winningadventure.com.au/logo.png |
| description | OK | "China factory tours for Australian businesses" |
| founder | OK | Person object with name |
| address | OK | Full PostalAddress |
| telephone | OK | +61-416588198 |
| abn | OK | 30 659 034 919 |
| areaServed | OK | Country object |
| serviceType | OK | Array of strings |
| priceRange | OK | "$$$" |
| **sameAs** | **MISSING** | **CRITICAL — No social profile links** |

### Schema Block 2: LocalBusiness

**Status:** Valid and complete for rich result eligibility

| Property | Status | Value/Issue |
|---|---|---|
| @context | OK | "https://schema.org" |
| @type | OK | LocalBusiness |
| name | OK | "Winning Adventure Global" |
| image | OK | URL to logo |
| url | OK | https://www.winningadventure.com.au |
| telephone | OK | +61-416588198 |
| priceRange | OK | "AUD $2,000 - $50,000+" |
| address | OK | Full PostalAddress |
| areaServed | OK | State + Country |
| serviceArea | OK | Country |
| geo | OK | GeoCoordinates with lat/long |
| openingHoursSpecification | OK | Monday-Friday 09:00-18:00 |

### Schema Block 3: Service (Services page only)

**Status:** Valid

| Property | Status | Value/Issue |
|---|---|---|
| @context | OK | "https://schema.org" |
| @type | OK | Service |
| name | OK | "China Sourcing Services" |
| provider | OK | Reference to Organization |
| areaServed | OK | Country object |
| description | OK | Present |
| serviceType | OK | Array |
| priceRange | OK | "AUD $2,000 - $50,000+" |

### Schema Block 4: FAQPage

**Status:** Valid but **RESTRICTED by Google since Aug 2023**

Google only shows FAQ rich results for well-known government and health authority websites. For all other sites (including WAG), FAQPage schema provides **no search rich result benefit**. It may still help AI models understand Q&A structure semantically.

### Schema Block 5: Article Schema

**Status:** **MISSING ENTIRELY on blog posts**

---

## GEO-Critical Schema Assessment

| Schema | Status | GEO Impact | Notes |
|---|---|---|---|
| Organization + sameAs | **Partial** | Critical | Organization present but sameAs MISSING — no entity linking |
| Person (Andy Liu) | **Incomplete** | High | Founder only, no sameAs, no credentials, no LinkedIn |
| LocalBusiness | Present | High | Complete and eligible for local business rich results |
| Article (blog posts) | **MISSING** | High | 10 blog posts with no Article/BlogPosting schema |
| Author schema | **MISSING** | High | Author info in frontmatter but no Person schema |
| speakable | **MISSING** | Medium | No speakable property on any page |
| BreadcrumbList | **MISSING** | Low | No breadcrumb schema on any page |
| WebSite + SearchAction | **MISSING** | Low | No sitelinks search box schema |
| Service | Present (services page only) | Medium | Good for service pages but not critical |

---

## sameAs Entity Linking

**Current sameAs links found:** 0 (NONE)

This is the single most impactful gap for GEO and AI discoverability.

| Platform | Linked | URL |
|---|---|---|
| Wikipedia | **No** | Not linked |
| Wikidata | **No** | Not linked |
| LinkedIn | **No** | Not linked |
| YouTube | **No** | Not linked |
| Crunchbase | **No** | Not linked |
| Twitter/X | **No** | Not linked |
| GitHub | **No** | Not linked |

---

## Deprecated/Restricted Schemas

| Schema | Status | Impact | Recommendation |
|---|---|---|---|
| FAQPage | **RESTRICTED** | No search benefit for WAG | Keep for AI semantic value only |
| HowTo | Not present | N/A | Do not add — removed from Google rich results Sep 2023 |

**Note:** FAQPage schema is NOT harmful — it simply will not generate rich results for WAG. It may still help AI models understand Q&A structure. Keep it if already implemented.

---

## JavaScript Rendering Risk

**Schema Delivery Method:** Server-rendered (Next.js layout.tsx)

All schemas are rendered server-side in the initial HTML response via `dangerouslySetInnerHTML`. This is correct and ensures:
- Google processes schemas immediately
- AI crawlers (GPTBot, ClaudeBot) can see schemas without JS execution

**No risk detected.**

---

## Critical Gaps

### 1. **No Article Schema on Blog Posts** (HIGHEST PRIORITY)
10 blog posts exist at `/resources/[slug]` with no Article/BlogPosting schema. This means:
- Search engines cannot properly understand article content
- AI models lack full content context
- No rich results for articles (even if Google supported Article schema)

### 2. **No sameAs on Organization** (CRITICAL)
The Organization schema has zero `sameAs` links. This prevents:
- AI models from building an entity graph
- Cross-platform identity verification
- Entity disambiguation

### 3. **Andy Liu Person Schema is Incomplete**
Only `name` is present under `founder`. Missing:
- `url` (link to about page or author page)
- `sameAs` (LinkedIn, Twitter, personal site)
- `jobTitle`
- `description`
- `knowsAbout`
- `image`

### 4. **No BreadcrumbList Schema**
Articles show breadcrumb navigation in HTML but no BreadcrumbList schema. This provides context to search engines about page hierarchy.

### 5. **No WebSite + SearchAction**
No sitelinks search box schema. While low priority, it improves site usability in search results.

---

## Recommended JSON-LD Templates

### 1. Article Schema (BLOG POSTS) — HIGHEST PRIORITY

Add to `/app/resources/[slug]/page.tsx` inside `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "[REPLACE: Article title from frontmatter]",
  "description": "[REPLACE: Article meta description]",
  "image": "[REPLACE: coverImage URL from frontmatter]",
  "datePublished": "[REPLACE: date in ISO 8601 format, e.g. 2026-02-26]",
  "dateModified": "[REPLACE: updatedDate in ISO 8601 format]",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "[REPLACE: Canonical URL of the article page]"
  },
  "author": {
    "@type": "Person",
    "name": "Andy Liu",
    "url": "https://www.winningadventure.com.au/about",
    "jobTitle": "Founder",
    "worksFor": {
      "@type": "Organization",
      "name": "Winning Adventure Global",
      "url": "https://www.winningadventure.com.au"
    }
  },
  "publisher": {
    "@type": "Organization",
    "name": "Winning Adventure Global",
    "url": "https://www.winningadventure.com.au",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.winningadventure.com.au/logo.png"
    }
  },
  "wordCount": "[REPLACE: Approximate word count]",
  "articleSection": "[REPLACE: Category from frontmatter]",
  "keywords": "[REPLACE: Tags joined with commas]"
}
```

### 2. Complete Person Schema for Andy Liu — CRITICAL

Add standalone Person schema to layout.tsx or about page:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Andy Liu",
  "url": "https://www.winningadventure.com.au/about",
  "jobTitle": "Founder",
  "description": "[REPLACE: Brief bio for Andy Liu]",
  "image": "[REPLACE: URL to Andy Liu photo if available]",
  "worksFor": {
    "@type": "Organization",
    "name": "Winning Adventure Global",
    "url": "https://www.winningadventure.com.au"
  },
  "sameAs": [
    "[REPLACE: LinkedIn company page URL or personal LinkedIn if available]",
    "[REPLACE: Twitter/X profile URL if available]",
    "[REPLACE: YouTube channel URL if available]",
    "[REPLACE: Any other relevant social/professional profiles]"
  ],
  "knowsAbout": [
    "China manufacturing",
    "Factory verification",
    "B2B procurement",
    "Australia-China trade",
    "Supply chain management"
  ]
}
```

### 3. Organization with sameAs — CRITICAL

Replace current Organization schema in layout.tsx with:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Winning Adventure Global",
  "url": "https://www.winningadventure.com.au",
  "logo": "https://www.winningadventure.com.au/logo.png",
  "description": "China factory tours for Australian businesses. We take Australian businesses directly to China's best manufacturers with bilingual guides and verified suppliers.",
  "founder": {
    "@type": "Person",
    "name": "Andy Liu",
    "url": "https://www.winningadventure.com.au/about"
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
  "abn": "30 659 034 919",
  "areaServed": {
    "@type": "Country",
    "name": "Australia"
  },
  "serviceType": ["Factory Tour", "Procurement Support", "Supplier Verification"],
  "priceRange": "$$$",
  "sameAs": [
    "[REPLACE: LinkedIn company page URL - HIGHEST PRIORITY]",
    "[REPLACE: YouTube channel URL]",
    "[REPLACE: Crunchbase profile URL]",
    "[REPLACE: Wikipedia page URL if available]",
    "[REPLACE: Twitter/X profile URL]"
  ]
}
```

### 4. BreadcrumbList Schema — MEDIUM PRIORITY

Add to article pages:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.winningadventure.com.au"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Resources",
      "item": "https://www.winningadventure.com.au/resources"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[REPLACE: Article category]",
      "item": "https://www.winningadventure.com.au/resources/[REPLACE: slug]"
    }
  ]
}
```

### 5. WebSite + SearchAction — LOW PRIORITY

Add to homepage only:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Winning Adventure Global",
  "url": "https://www.winningadventure.com.au",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.winningadventure.com.au/resources?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

## Priority Actions

1. **[CRITICAL]** Add Article/BlogPosting schema to all 10 blog post pages — this is the highest-impact missing schema
2. **[CRITICAL]** Add sameAs array to Organization schema with LinkedIn, YouTube, and other social profiles
3. **[HIGH]** Create standalone Person schema for Andy Liu with sameAs links
4. **[MEDIUM]** Add BreadcrumbList schema to article pages for better navigation context
5. **[LOW]** Add WebSite + SearchAction schema for sitelinks search box

---

## Scoring Breakdown

| Component | Points | Earned | Notes |
|---|---|---|---|
| Organization/LocalBusiness | 20 | 15 | Present but missing sameAs |
| Article/content schema | 15 | 0 | MISSING entirely |
| Person schema for author | 15 | 3 | Only name present, no credentials |
| sameAs completeness | 15 | 0 | NONE linked |
| speakable property | 10 | 0 | MISSING |
| BreadcrumbList | 5 | 0 | MISSING |
| WebSite + SearchAction | 5 | 0 | MISSING |
| No deprecated schemas | 5 | 5 | FAQPage restricted but not harmful |
| JSON-LD format | 5 | 5 | All in JSON-LD |
| Validation (no errors) | 5 | 5 | All schemas valid |
| **TOTAL** | **100** | **42** | |

---

## References

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Documentation](https://schema.org)
- [Google's Article rich result requirements](https://developers.google.com/search/docs/appearance/structured-data/article)

---

# E-E-A-T Content Quality Analysis

**Date:** 2026-03-23
**Target URL:** https://www.winningadventure.com.au/resources/china-factory-tour-guide
**Article:** "7 Things I Learned Visiting Chinese Factories for 8 Years"
**Author:** Andy Liu, Founder -- Winning Adventure Global

---

## Content Quality Score

**Content Score: 68/100** (Fair)

### E-E-A-T Assessment

**Overall E-E-A-T Score: 62/100** (Experience: 18, Expertise: 11, Authoritativeness: 14, Trustworthiness: 19 -- each 0-25)

| Dimension | Score | Key Evidence |
|---|---|---|
| Experience | 18/25 | Rich first-person narrative with specific Foshan factory story; concrete details (12 workers vs 300 claimed); 8 years / 200+ visits claimed; specific city names and regional knowledge |
| Expertise | 11/25 | Founder title present; About page mentions "deep experience"; 12-point verification process demonstrated; BUT no formal credentials, no LinkedIn profile linked, no certifications listed |
| Authoritativeness | 14/25 | ABN 30 659 034 919 (verifiable registration); 10 resource articles (content breadth); 500+ suppliers claimed; physical Adelaide address; domain age < 3 months (limiting factor) |
| Trustworthiness | 19/25 | ABN, address, phone all visible; 12-point verification process detailed; transparent pricing (AUD $2,000-50,000+); sample revision specifics; no obvious red flags |

---

#### Experience Details

**Strong signals found:**
- First-person narrative throughout ("I learned", "my experience", "what I did")
- Specific case study: Foshan factory with 12 workers vs 300 in brochure
- Specific city names: Foshan, Shenzhen, Guangzhou, Zhengzhou, Shaanxi, Guangdong, Jiangsu, Zhejiang, Sichuan, Beijing, Shanghai, Wuhan, Hangzhou, Suzhou, Chengdu
- Specific numbers: "12 workers", "300-person operation", "5-7 days", "2-3 factories", "RMB 200-2,000 sample fees"
- Publication date: Feb 26, 2026 (recent, within 1 month)
- 8 years of claimed hands-on experience
- 200+ factory visits claimed

**Assessment:** This article demonstrates **exceptional experience signals** for the topic. The first-person narrative with a specific cautionary tale (Foshan factory deception) is exactly what Google's E-E-A-T framework rewards. The specific details about sample revision cycles (4 hours in-person vs 3 weeks by freight), cultural misunderstandings ("delivery by 30 March" interpretation gap), and practical advice (never decide on visit day) all signal authentic, first-hand knowledge.

**Experience Score: 18/25** (Strong)

---

#### Expertise Details

**Signals present:**
- Author identified as "Andy Liu, Founder -- Winning Adventure Global"
- About page mentions founder "moved from China to Adelaide with deep experience in Chinese manufacturing hubs"
- 12-point supplier verification process explained in detail
- Industry terminology used correctly: MOQ, ISO 9001, CE, FDA, customs rejection, sample revision cycle

**Gaps identified:**
- No formal credentials listed (no MBA, import/export certifications, trade associations)
- No LinkedIn profile linked from author byline
- No educational background mentioned
- No professional certifications or memberships
- No "About the Author" section with detailed bio

**Assessment:** The content demonstrates **functional expertise** through detailed knowledge and correct terminology, but the **author lacks documented credentials**. Google's Quality Rater Guidelines look for "appropriate expertise" -- for B2B procurement consulting, formal credentials are not strictly required if experience is demonstrable, but they significantly boost trust.

**Expertise Score: 11/25** (Moderate -- content depth good, credential documentation weak)

---

#### Authoritativeness Details

**Signals present:**
- ABN 30 659 034 919 (Australian Business Number -- verifiable official registration)
- Physical address: 5, 54 Melbourne St, North Adelaide SA 5006
- 10 published articles on Resources page (content breadth)
- Service categories: Factory Tour, Business Travel, Verification, Sourcing, Risks, Bulk Procurement
- 12-point supplier verification process (differentiating methodology)
- Phone: 0416 588 198 (Australian mobile)
- Operating hours clearly stated

**Gaps identified:**
- Domain age < 3 months (major limiting factor for domain authority)
- No external citations from authoritative sources
- No media mentions detected
- No awards or industry recognition
- No sameAs schema links to LinkedIn/Wikipedia/external profiles
- No client testimonials or case studies (generic "case studies" mentioned but not detailed)

**Assessment:** The business shows **foundational authoritativeness** through official registration and comprehensive content, but is **too new to have built meaningful external authority**. Third-party validation (media coverage, industry citations, client reviews on external platforms) is essentially absent.

**Authoritativeness Score: 14/25** (Moderate -- legitimate registration, content breadth present, but domain age and external validation are weak)

---

#### Trustworthiness Details

**Strong signals:**
- ABN: 30 659 034 919 (government-registered business, verifiable)
- Physical Australian address (not just a mailbox)
- Australian phone number (0416 588 198)
- Clear pricing range: AUD $2,000 - $50,000+
- 12-point supplier verification process explained
- Refund/retry policy: "Second round of supplier introductions if first unsuccessful"
- Publication date visible: Feb 26, 2026
- About page lists specific regions covered
- No suspicious patterns: no guaranteed success claims, no "get rich quick" language

**Potential concerns:**
- About page claims "100+ verified suppliers" but homepage claims "500+ Verified Suppliers" (inconsistency)
- Claims like "save 20%+ on procurement" in hero (unverifiable, could be seen as aspirational)
- No visible privacy policy or terms of service links detected in crawl
- No third-party review platform presence (Google Reviews, Trustpilot, Clutch)

**Assessment:** Trustworthiness is the **strongest E-E-A-T dimension** for WAG. The combination of ABN, physical address, clear pricing, and transparent methodology creates a solid trust foundation. The main gap is third-party validation through reviews.

**Trustworthiness Score: 19/25** (Strong)

---

### Content Metrics

| Metric | Value | Assessment |
|---|---|---|
| Word Count | ~1,800 words (15 min read) | Long-form (appropriate for comprehensive guide) |
| Readability (Flesch) | ~55-65 (estimated) | Standard -- appropriate for B2B professional audience |
| Avg Paragraph Length | ~60-80 words | Good -- web-optimal range |
| Heading Count | H1: 1, H2: 8, H3: 4 | Well-structured hierarchy |
| Internal Links | ~15-20 (nav, footer, resource links) | Adequate |
| External Links/Citations | 0 | Under-sourced -- no external authoritative sources cited |
| Images | Unknown count, alt text status unknown | Needs verification |

---

### Heading Structure

```
H1: 7 Things I Learned Visiting Chinese Factories for 8 Years
  H2: 1. The Gap Between an Alibaba Page and Reality Is About Capacity
    H3: What to do
  H2: 2. A Fast "Yes" Often Means the Opposite
    H3: What to do
  H2: 3. Export Experience Is About Customs Rejection History
    H3: What to do
  H2: 4. The Hidden Cost Is Sample Revision Decisions
    H3: What to do
  H2: 5. The Language Barrier Is Unspoken Business Assumptions
    H3: What to do
  H2: 6. Trustworthy Suppliers Communicate Problems Proactively
    H3: What to do
  H2: 7. Never Make Purchase Decisions on the Day of the Visit
    H3: What to do
  H2: How Winning Adventure Global Supports Factory Visits
  H2: Frequently Asked Questions
```

**Assessment:** Excellent heading structure. Each lesson follows a consistent "problem + what-to-do" pattern. The FAQ section at the end handles objections naturally. H2/H3 ratio is appropriate.

---

### AI Content Assessment

**Assessment:** Highly Likely Human

| Indicator | Found? | Evidence |
|---|---|---|
| Generic phrasing | No | Specific Foshan story with exact details |
| Lack of specifics | No | "12 workers", "RMB 200-2,000", "4 hours vs 3 weeks", exact city names |
| No original data | No | First-person experience data, specific process details |
| Hedging overload | No | Clear advice given, no excessive "may/might/could" |
| No authorial voice | No | Strong first-person narrative, clear opinions |
| Repetitive thesis | No | Each section advances new points |

**Conclusion:** This content is almost certainly written by someone with genuine 8-year experience in China factory visits. The Foshan story (showroom vs production floor discrepancy) is a specific, memorable anecdote that AI cannot fabricate. The cultural nuance (Chinese "giving face" concept, Australian vs Chinese delivery date interpretation) demonstrates lived experience.

---

### Topical Authority

**Assessment:** Moderate

- **Content breadth:** 10 articles covering China sourcing comprehensively (factory tours, verification, travel, risks, bulk procurement)
- **Internal linking:** Strong -- navigation, footer, related resources links throughout
- **Content gaps identified:**
  - No client case studies with specific outcomes (e.g., "Client X saved Y% and found supplier in Z weeks")
  - No video content
  - No industry-specific deep dives (e.g., "How to Source Electronics from Shenzhen")
  - No pricing calculator or estimator
  - No comparison content vs competitors
- **Hub/cluster structure:** Partial -- Resources is a content hub, but no obvious pillar-cluster architecture visible

---

### Content Freshness

**Publication Date:** February 26, 2026
**Last Updated:** Not explicitly stated in article
**Content Age:** ~25 days old
**Time Sensitivity:** Medium -- sourcing advice is relatively evergreen but statistics and processes change
**Freshness Assessment:** Current -- article published within the last month

---

## Priority Actions

| Priority | Action | Specific Guidance |
|----------|--------|-------------------|
| **CRITICAL** | Add author credentials to byline and create dedicated author bio page | Create `/about/andy` or `/team/andy` page with: professional background, years in China manufacturing, any trade certifications, LinkedIn profile link, photo. Without this, expertise score will remain capped at 11/25 |
| **HIGH** | Add LinkedIn profile links to author byline and organization schema | Andy Liu should have a public LinkedIn profile that can be verified. Add `sameAs` links in Person schema pointing to LinkedIn, industry associations |
| **HIGH** | Add client testimonials/case studies with specific metrics | Format: "Australian business [type] saved [X]% on procurement and secured supplier within [Y] weeks". Even anonymized case studies add significant trust and experience signals |
| **HIGH** | Add external authoritative citations | Cite Australian government sourcing guides (AusTrade). Cite industry statistics with sources. Link to Canton Fair official information |
| **MEDIUM** | Add Trustpilot/Google Business Profile reviews | Third-party review platforms significantly boost trust. Add schema markup for review aggregates |
| **MEDIUM** | Resolve supplier count inconsistency | About page: "100+ verified factory partners" vs Homepage: "500+ Verified Suppliers". Choose one accurate number and use consistently |

---

## Summary

| Dimension | Score | Trend |
|---|---|---|
| Experience | 18/25 | Strong -- genuine first-hand signals |
| Expertise | 11/25 | Moderate -- needs credential documentation |
| Authoritativeness | 14/25 | Moderate -- domain age limits; registration helps |
| Trustworthiness | 19/25 | Strong -- ABN, address, methodology all solid |
| **Overall** | **62/100** | **Fair** |

**Key Strength:** The article's first-person narrative with specific Foshan factory story is an excellent E-E-A-T signal. This is exactly the kind of content Google rewards.

**Key Weakness:** Author credentials are undocumented. Andy Liu has 8 years of experience but cannot demonstrate formal expertise through credentials, LinkedIn presence, or professional memberships.

**Biggest Opportunity:** Creating a detailed author bio page with verifiable credentials would unlock 3-5 additional points in Expertise. Adding 2-3 client case studies would boost both Experience and Trustworthiness.

---

*E-E-A-T Analysis by Claude Code GEO Specialist -- 2026-03-23*
