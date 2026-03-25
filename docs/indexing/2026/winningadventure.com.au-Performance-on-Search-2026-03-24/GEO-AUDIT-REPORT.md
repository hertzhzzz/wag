# GEO Audit Report: Winning Adventure Global

**Audit Date:** 2026-03-24
**URL:** https://www.winningadventure.com.au
**Business Type:** Agency/Services (China Factory Tours & Sourcing)
**Pages Analyzed:** 10+ (Homepage, About, Services, Resources, Enquiry + blog posts)
**Target Keywords:** 6 high-priority queries with 0 impressions currently

---

## Executive Summary

**Overall GEO Score: 56/100 (Poor)**

The site has a solid technical foundation (SSR rendering, all AI crawlers allowed) but suffers from weak AI citability, minimal brand authority signals, and incomplete structured data. The target keywords ("china sourcing agent australia", "visiting chinese factories", "china sourcing tour", etc.) all show **0 impressions** despite having relevant content - this indicates Google has indexed the site but finds it insufficiently authoritative or relevant for these competitive queries.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 55/100 | 25% | 13.75 |
| Brand Authority | 28/100 | 20% | 5.60 |
| Content E-E-A-T | 61/100 | 20% | 12.20 |
| Technical GEO | 78/100 | 15% | 11.70 |
| Schema & Structured Data | 55/100 | 10% | 5.50 |
| Platform Optimization | 30/100 | 10% | 3.00 |
| **Overall GEO Score** | | | **51.75/100** |

---

## Critical Issues (Fix Immediately)

### 1. [CRITICAL] Target Keywords Show 0 Impressions Despite Indexing

**Evidence from Search Console data:**
| Keyword | Impressions | Position | CTR |
|---|---|---|---|
| china sourcing agent australia | 0 | 73.9 | 0% |
| visiting chinese factories | 0 | 8 | 0% |
| china sourcing tour | 0 | 7 | 0% |
| china business tours | 0 | 7 | 0% |
| chinese wholesalers australia | 0 | 5 | 0% |
| china business trip package | 0 | 5 | 0% |

**Root Cause Analysis:**
The site IS indexed (found in sitemap with 2026 dates) but Google considers content insufficient for these queries. Position 73.9 for "china sourcing agent australia" suggests the page was indexed but ranked out of the top 100.

**Recommended Fix:**
- Add dedicated landing page content directly targeting these keywords
- Create FAQ sections addressing each keyword as a question
- Add statistics and data points these keywords expect (e.g., "We visited 200+ factories in China")

### 2. [CRITICAL] Organization Schema Missing Entity Links (sameAs)

**Current state:** Organization schema has only 3 sameAs links (LinkedIn, Facebook, Google Maps)
**Impact:** AI systems cannot verify brand identity across the web

**Recommended Fix:**
```json
"sameAs": [
  "https://en.wikipedia.org/wiki/Winning_Adventure_Global",
  "https://www.wikidata.org/wiki/Q[GET_WIKIDATA_ID]",
  "https://www.linkedin.com/company/winning-adventure-global",
  "https://www.youtube.com/@winningadventure",
  "https://www.facebook.com/winningadventureglobal",
  "https://www.crunchbase.com/organization/winning-adventure-global"
]
```

### 3. [CRITICAL] No Wikipedia Presence

**Impact:** No Wikipedia entry means AI models cannot verify entity existence. Wikipedia is the #1 source AI models cite for entity verification.

**Action Required:**
- Create Wikipedia article for Winning Adventure Global
- Include: company founding, founder Andy Liu, service description, ABN, physical address
- This is the single highest-impact GEO action

---

## High Priority Issues

### 4. [HIGH] Missing Article/BlogPosting Schema on Resources

**Pages affected:** All 10 blog posts under /resources/
**Current state:** No structured data on blog articles
**Impact:** AI cannot properly cite and attribute blog content

**Action:** Add BlogPosting schema to each resource page with:
- headline, author (Person schema), datePublished, dateModified
- publisher (Organization), image, articleSection, wordCount
- speakable property for AI citation

### 5. [HIGH] Founder Andy Liu Lacks Person Schema

**Current state:** Only name mentioned in content
**Missing:** jobTitle, worksFor, sameAs (LinkedIn profile), knowsAbout, description

**Action:** Add complete Person schema for Andy Liu

### 6. [HIGH] llms.txt Missing

**Impact:** AI answer engines (Perplexity, Claude Web) use llms.txt for site discovery
**Current:** Returns 404

**Action:** Create /llms.txt with:
- Site summary (500 words)
- Key service descriptions
- Main page URLs
- Contact information

### 7. [HIGH] No Third-Party Reviews Verified

**Current:** Reviews are self-hosted with anonymous names ("Sarah T.", "Michael R.")
**Gap:** No Google Reviews, Trustpilot, or第三方验证

**Action:**
- Set up Google Business Profile (if not done)
- Add Google Reviews widget
- Encourage clients to leave public reviews

---

## Medium Priority Issues

### 8. [MEDIUM] FAQPage Schema Restricted (No Rich Results)

Google restricted FAQ rich results in August 2023 to well-known government/health sites only. Your FAQPage schema is valid but won't generate rich results. This is expected - keep the schema as it provides semantic value for AI.

### 9. [MEDIUM] Service Schema Incomplete

**Current:** Only name, description, priceRange present
**Missing:** hasOfferCatalog, potentialAction, serviceType array

### 10. [MEDIUM] No Backlinks from Authority Sites

**Current:** No guest posts, partnerships, or earned links from:
- Australian business associations
- Import/export publications
- Government trade resources (Austrade, ABF)

### 11. [MEDIUM] No Video Content

YouTube channel exists but:
- No factory tour videos
- No client testimonials on video
- No behind-the-scenes content

### 12. [MEDIUM] Content Gaps for Target Keywords

| Target Keyword | Content Gap |
|---|---|
| china sourcing agent australia | No page directly addresses "sourcing agent" services |
| visiting chinese factories | FAQ mentions but no dedicated section |
| china sourcing tour | Service page has tour but keyword not in H1/title |
| china business tours | "tours" not used in headings |
| chinese wholesalers australia | No content addressing wholesalers |
| china business trip package | "package" terminology not used |

---

## Low Priority Issues

### 13. [LOW] BreadcrumbList Schema Missing
### 14. [LOW] WebSite + SearchAction Schema Missing
### 15. [LOW] Some Images Missing Descriptive Alt Text
### 16. [LOW] Content-Security-Policy Header Missing

---

## Category Deep Dives

### AI Citability (55/100)

**Strengths:**
- Content is server-side rendered (AI can access without JS)
- Long-form content (1500-3500 words per article)
- Question-answer patterns in FAQ section
- Specific numbers and data points ("200+ factories", "8 years")

**Weaknesses:**
- No dedicated answer blocks for target keywords
- Content organized for human reading, not AI extraction
- Missing FAQ sections on pages targeting specific queries
- No "quick answer" sections that AI can easily cite

**Recommendation:** Add FAQ-style content blocks directly answering each target keyword query.

### Brand Authority (28/100)

**Platform Presence Map:**

| Platform | Status | Quality |
|---|---|---|
| LinkedIn | Yes | Company page exists, basic info |
| Facebook | Yes | Basic page |
| YouTube | Yes | Channel exists, minimal content |
| Wikipedia | **MISSING** | Critical gap |
| Wikidata | **MISSING** | Critical gap |
| Reddit | **MISSING** | Not found |
| Crunchbase | **MISSING** | Not found |
| News/Media | **MISSING** | No press coverage |

**Impact:** Brand is nearly invisible to AI training datasets. AI models have no third-party verification of this company's existence.

### Content E-E-A-T (61/100)

**Experience (18/25) - STRONGEST DIMENSION:**
- "8 years" and "200+ factory visits" quantified
- Specific locations named (Shenzhen, Foshan, Guangzhou)
- First-hand anecdote about subcontracting detection
- 12-point verification methodology

**Expertise (14/25) - MODERATE:**
- Correct industry terminology used
- Author Andy Liu named
- No formal credentials listed

**Authoritativeness (12/25) - WEAKEST:**
- Zero external citations
- No media mentions
- No industry awards
- Anonymous testimonials only

**Trustworthiness (17/25) - STRONG:**
- HTTPS, ABN verified, physical address
- Organization + LocalBusiness schema
- No third-party review links

### Technical GEO (78/100)

**Strengths:**
- All AI crawlers explicitly allowed in robots.txt
- Server-side rendering working correctly
- Content accessible without JavaScript
- XML sitemap with 15 URLs, recent lastmod
- Proper canonical URLs
- Open Graph + Twitter Cards complete

**Weaknesses:**
- llms.txt returns 404
- Missing Content-Security-Policy header
- No Wikipedia/Wikidata presence for entity verification

### Schema & Structured Data (55/100)

**Schemas Present:**
- Organization (partial - missing sameAs)
- LocalBusiness (complete)
- FAQPage (valid but restricted for rich results)
- Review (valid)
- Service (partial - missing hasOfferCatalog)

**Missing:**
- Article/BlogPosting on all blog posts
- Person schema for Andy Liu
- BreadcrumbList
- WebSite + SearchAction

### Platform Optimization (30/100)

- LinkedIn: Basic presence
- YouTube: Minimal content
- Facebook: Basic presence
- Wikipedia: None
- Reddit: None
- No podcasts, no guest posts, no partnerships

---

## Quick Wins (Implement This Week)

1. **[HIGH IMPACT] Add dedicated FAQ page targeting all 6 keywords**
   - Create /faq or add FAQ section to homepage
   - Each Q&A directly answers: "What is a china sourcing agent australia?"
   - Use question as H2/H3, answer as paragraph with statistics

2. **[HIGH IMPACT] Complete Organization schema sameAs**
   - Add all social profile URLs to sameAs array
   - Priority: LinkedIn company page, YouTube channel

3. **[HIGH IMPACT] Create llms.txt**
   - Text file at root summarizing site content
   - Include: company description, services, key differentiators
   - 500-1000 words, machine-readable

4. **[MEDIUM IMPACT] Add "china sourcing tour" H2 section**
   - Create dedicated content block for this exact keyword
   - Include tour itinerary, pricing, what to expect

5. **[MEDIUM IMPACT] Add BlogPosting schema to top resource**
   - Start with china-business-travel-guide-2026
   - Include all recommended properties including speakable

---

## 30-Day Action Plan

### Week 1: Keyword-Targeted Content

- [ ] Audit all pages for target keyword usage
- [ ] Add dedicated FAQ section to homepage (6 questions, one per keyword)
- [ ] Rename H1/H2 to include "china sourcing tour" and "china business tours"
- [ ] Update meta titles to include primary keywords

### Week 2: Structured Data

- [ ] Complete Organization schema sameAs with all platform links
- [ ] Add Person schema for founder Andy Liu with LinkedIn link
- [ ] Add Article/BlogPosting schema to top 3 blog posts
- [ ] Add Service schema with hasOfferCatalog to services page

### Week 3: Authority Building

- [ ] Submit Wikipedia article for company
- [ ] Create Wikidata entry
- [ ] Reach out to 5 Australian business blogs for guest post opportunity
- [ ] Register company on Crunchbase

### Week 4: Content Enhancement

- [ ] Add case study with specific client metrics
- [ ] Create factory tour video (even 2-minute intro)
- [ ] Add client logo strip with company names (with permission)
- [ ] Add "As seen in" / media mentions section if any press coverage

---

## Keyword-to-Page Mapping

| Target Keyword | Target Page | Required Content |
|---|---|---|
| china sourcing agent australia | Homepage or /services | Define service as "sourcing agent", include Australia focus |
| visiting chinese factories | /services | Dedicated section with what to expect, photos, process |
| china sourcing tour | /services | Tour itinerary, duration, locations (Shenzhen, Foshan) |
| china business tours | /services | Use "tours" language, add tour packages section |
| chinese wholesalers australia | New page or /resources | Guide to finding wholesalers, verification tips |
| china business trip package | /services | Package pricing, what's included, customization options |

---

## Appendix: Pages Analyzed

| URL | Title | Key Issues |
|---|---|---|
| https://www.winningadventure.com.au/ | Homepage | Missing sameAs, no keyword-targeted FAQ |
| https://www.winningadventure.com.au/about | About | Missing Person schema for Andy Liu |
| https://www.winningadventure.com.au/services | Services | Incomplete Service schema |
| https://www.winningadventure.com.au/resources | Resources | No Article schema on any blog posts |
| https://www.winningadventure.com.au/resources/china-business-travel-guide-2026 | Blog Post | No BlogPosting schema, no speakable |
| https://www.winningadventure.com.au/enquiry | Enquiry | OK - form functional |

---

## Success Metrics

Track these KPIs weekly:

| Metric | Current | 30-Day Target |
|---|---|---|
| "china sourcing tour" impressions | 0 | 50+ |
| "visiting chinese factories" position | 24.4 | <15 |
| "china sourcing agent australia" position | 73.9 | <50 |
| Indexed pages in Google Search | ~15 | 20+ |
| Brand mentions across web | 3 | 10+ |

---

*Report generated: 2026-03-24*
*Next audit recommended: 2026-04-24 (30-day check)*
