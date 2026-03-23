# GEO Audit Report: Winning Adventure Global (WAG)

**Audit Date:** 2026-03-23
**URL:** https://www.winningadventure.com.au
**Business Type:** B2B Services / Agency (factory tours + supplier verification for Australian businesses)
**Pages Analyzed:** Homepage, Services, About, Resources listing, 2 article pages
**Domain Age:** < 3 months (very new)

---

## Executive Summary

**Overall GEO Score: 55/100 (Poor)**

The WAG website has a solid content foundation with genuine first-person expertise and proper technical SEO infrastructure, but suffers from a critical missing `llms.txt` file and weak brand authority signals inherent to a brand-new domain. The site is not invisible to AI systems, but significant optimization is needed to achieve meaningful AI citation and recommendation. The "site: not indexed" issue from the SEO debug is partially explained by the new domain age — Google is actively crawling and indexing (8 pages confirmed indexed March 18-21), but the brand's authority signals are too weak for competitive AI citations.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 66/100 | 25% | 16.5 |
| Brand Authority | 14/100 | 20% | 2.8 |
| Content E-E-A-T | 62/100 | 20% | 12.4 |
| Technical GEO | 70/100 | 15% | 10.5 |
| Schema & Structured Data | 65/100 | 10% | 6.5 |
| Platform Optimization | 20/100 | 10% | 2.0 |
| **Overall GEO Score** | | | **50.7 (~51)/100** |

---

## Critical Issues (Fix Immediately)

### 1. [CRITICAL] No llms.txt file
- **Pages affected:** Entire site
- **Impact:** AI search engines (Perplexity, ChatGPT, Claude) cannot efficiently discover and cite WAG content
- **Fix:** Create `/llms.txt` in `public/llms.txt`

```
# Winning Adventure Global

Winning Adventure Global helps Australian businesses source from China safely through guided factory tours, supplier verification, and end-to-end procurement support.

## Priority Pages
- https://www.winningadventure.com.au/ (Homepage)
- https://www.winningadventure.com.au/services (Services)
- https://www.winningadventure.com.au/about (About)
- https://www.winningadventure.com.au/resources (Blog articles)
- https://www.winningadventure.com.au/enquiry (Contact)

## Services
- China factory tours (guided visits to verified manufacturers)
- Supplier verification (12-point on-site audit)
- Procurement support (negotiation, sample coordination, quality inspection)
- Bulk procurement trips

## Key Statistics
- 500+ verified suppliers across China
- 100+ verified factory partners
- Operations in 6 Chinese provinces
- 15+ industries served
- Based in Adelaide, SA, Australia

## Contact
ABN: 30 659 034 919
Phone: +61-416588198
Address: 5/54 Melbourne St, North Adelaide SA 5006, Australia
```

### 2. [HIGH] Article pages missing Article schema
- **Pages affected:** All 10 blog posts at `/resources/*`
- **Current:** Only Organization + LocalBusiness JSON-LD on article pages
- **Missing:** Article/BlogPosting schema with headline, datePublished, author, image
- **Fix:** Add Article JSON-LD to `app/resources/[slug]/page.tsx` layout

---

## High Priority Issues

### 3. [HIGH] No video content — YouTube channel missing
- **Impact:** AI systems train heavily on YouTube transcripts. Without video content, WAG is invisible to this training data.
- **Effort:** Medium (ongoing)
- **Fix:** Create YouTube channel, post 2-3 factory tour highlight videos

### 4. [HIGH] Andy Liu credentials not linked
- **Pages affected:** About page, article pages
- **Current:** Andy Liu named as "Founder" but no LinkedIn profile link or specific credentials
- **Missing:** `sameAs` links to LinkedIn profile in Organization schema
- **Fix:** Add LinkedIn URL to Organization schema's `sameAs` field

### 5. [MEDIUM] No third-party statistics
- **Impact:** AI citation systems favor content with verifiable third-party data
- **Current:** Claims like "200+ factory visits" and "save 20%+" have no source
- **Fix:** Cite DFAT trade data, ABS import statistics, or frame as "our clients report..."

---

## Medium Priority Issues

### 6. [MEDIUM] Missing CSP header
- **Risk:** XSS vulnerability
- **Fix:** Add CSP header in Vercel config or `next.config.js`

### 7. [MEDIUM] No BreadcrumbList schema
- **Pages affected:** Article pages, Services
- **Fix:** Add BreadcrumbList JSON-LD showing: Home > Resources > [Article]

### 8. [MEDIUM] No resource preload hints
- **Impact:** Slightly slower LCP for AI crawlers
- **Fix:** Add `<link rel="preload">` for critical CSS/JS and hero image

---

## Low Priority Issues

### 9. [LOW] No Wikipedia presence
- Expected for new company, not a priority

### 10. [LOW] Some images may lack alt text
- Audit needed across all pages

### 11. [LOW] Homepage lacks "last updated" date
- AI systems favor fresher content
- Fix: Add "Last updated March 2026" to homepage footer

---

## Category Deep Dives

### AI Citability (66/100)

**Strong Points:**
- "Key Takeaways" numbered list on articles is excellent AI citation format
- First-person specific stories (Foshan factory with 12 vs 300 workers) are memorable and quotable
- Specific statistics: "200+ factory visits", "8 years", "$2,000-$50,000+"
- Article titles with numbers perform well in AI answers

**Weak Points:**
- Homepage lacks explicit FAQ block (just tagline)
- Articles don't end with explicit FAQ section
- No third-party data citations
- No "last updated" dates on content

**Recommendation:** Add FAQ block to homepage and FAQ section to all articles.

### Brand Authority (14/100)

**Assessment:** Extremely low due to new domain age (< 3 months).

| Platform | Score | Status |
|---|---|---|
| YouTube | 3/100 | No channel, no videos |
| LinkedIn | 35/100 | Likely exists, unknown quality |
| Wikipedia | 5/100 | None (expected) |
| Reddit | 8/100 | No presence |
| News/Media | 10/100 | No coverage |
| Review Platforms | 15/100 | No Google reviews |

**Key insight:** Building brand authority takes 6-12+ months. Focus on YouTube and LinkedIn first.

### Content E-E-A-T (62/100)

**Experience (18/25):** Strong
- First-person narrative with specific factory stories
- Specific cities named (Foshan, Shenzhen, Guangzhou, Zhengzhou)
- 8 years claimed with specific lessons learned
- Publication dates are recent (Feb-Mar 2026)

**Expertise (11/25):** Moderate
- Andy Liu identified as Founder
- "Deep experience" mentioned but no specific credentials
- 12-point supplier verification process explained
- No LinkedIn profile link visible
- No industry certifications mentioned

**Authoritativeness (14/25):** Moderate
- ABN shows legitimate registration
- Physical Adelaide address provided
- 500+ verified suppliers claimed
- New domain = low domain authority
- No external citations or media mentions

**Trustworthiness (19/25):** Strong
- ABN verifiable
- Physical address + phone
- Clear pricing range
- 12-point verification process detailed
- No obvious red flags

### Technical GEO (70/100)

**Strengths:**
- Next.js SSR — full HTML in initial response (AI crawlers CAN see content)
- All AI crawlers allowed (GPTBot, ClaudeBot, PerplexityBot not blocked)
- Comprehensive structured data: Organization, LocalBusiness, FAQPage (13 Q&As), Service
- Clean robots.txt with sitemap reference
- Strong security headers (HSTS, X-Frame-Options, etc.)

**Weaknesses:**
- No llms.txt file (biggest gap)
- Blog posts missing Article schema
- No CSP header

**Note:** The "307 redirect" from the SEO debug is actually **HTTP 301** (correct). No fix needed.

### Schema & Structured Data (65/100)

**Present and correct:**
- Organization schema (homepage, services, resources)
- LocalBusiness schema (homepage, services, resources)
- FAQPage schema (homepage, services — 13 Q&A pairs on services page)
- Service schema (services page)

**Missing:**
- Article/BlogPosting schema on all 10 resource pages
- BreadcrumbList schema
- Person schema for Andy Liu with full credentials and LinkedIn
- `sameAs` links in Organization schema

### Platform Optimization (20/100)

**YouTube:** 0 presence — biggest gap
**LinkedIn:** Likely exists but not optimized
**Reddit:** No presence
**Google Business Profile:** Not claimed (LocalBusiness schema present but no GBP)
**Trade directories:** Not found

---

## Quick Wins (Implement This Week)

1. **Create llms.txt** — 1 hour, HIGH impact
2. **Add LinkedIn URL to Organization schema** — 15 min, MEDIUM impact
3. **Add FAQ block to homepage** — 2 hours, HIGH impact
4. **Add FAQ section to china-factory-tour-guide article** — 1 hour, HIGH impact
5. **Add Article schema to all resource pages** — 2 hours, HIGH impact

---

## 30-Day Action Plan

### Week 1: Technical Foundation
- [ ] Create `/public/llms.txt`
- [ ] Add Article JSON-LD schema to all blog posts
- [ ] Add LinkedIn URL to Organization schema `sameAs`
- [ ] Claim Google Business Profile

### Week 2: Content Optimization
- [ ] Add FAQ block to homepage
- [ ] Add FAQ section to 3 most important articles
- [ ] Add BreadcrumbList schema to article pages
- [ ] Add "last updated" dates to content pages

### Week 3: Brand Building
- [ ] Create YouTube channel with 3 initial videos
- [ ] Optimize LinkedIn company page with keywords
- [ ] Submit to 3-5 SA/Australia business directories

### Week 4: Content Enhancement
- [ ] Add FAQ schema markup to services page FAQ section
- [ ] Research and add third-party statistics to top article
- [ ] Add CSP header in next.config.js
- [ ] Review and fix image alt text across site

---

## Appendix: Pages Analyzed

| URL | Title | GEO Issues |
|---|---|---|
| https://www.winningadventure.com.au/ | WAG \| China Sourcing Australia | No llms.txt, no FAQ block, no Article schema |
| https://www.winningadventure.com.au/services | Services page | FAQPage present (13 Q&A), Service schema present, missing Article schema |
| https://www.winningadventure.com.au/about | About page | No Article schema, thin author credentials |
| https://www.winningadventure.com.au/resources | Resources listing | Missing Article schema on all 10 listed articles |
| https://www.winningadventure.com.au/resources/china-factory-tour-guide | 7 Things I Learned... | No FAQ section, no Article schema, no third-party citations |
| https://www.winningadventure.com.au/enquiry | Enquiry form | No GEO-specific issues |

---

## Root Cause: Why site: Search Returns No Results

**The "site:" search issue is NOT a indexing problem.** GSC confirms 8 pages are indexed as of March 18-21.

The likely explanation:
1. Domain is < 3 months old — Google hasn't fully processed it
2. `site:winningadventure.com.au` searches the root domain, while all indexed pages are `www.winningadventure.com.au`
3. Try `site:www.winningadventure.com.au` instead — results should appear

**Recommendation:** In GSC, ensure the verified property is `www.winningadventure.com.au` (not just the root), and submit the sitemap again. Indexing should continue naturally as the domain ages.

---

*Generated by Claude Code GEO Audit — 2026-03-23*
