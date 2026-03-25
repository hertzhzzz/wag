# Phase 19 Research: Page SEO + GEO Optimization

**Phase:** 19 — Page SEO + GEO Optimization
**Date:** 2026-03-23
**Status:** Research Complete — Ready for Planning

---

## GEO Audit Summary (winningadventure.com.au)

**Business Type Detected:** Local Service + Agency (Australian B2B China Sourcing)
**Pages Analyzed:** 5 (Homepage, Services, About, 2 Blog Posts)
**Composite GEO Score: 44/100 (Poor)**

### Score Breakdown

| Category | Score | Weight | Weighted |
|----------|-------|-------|---------|
| AI Citability | 72/100 | 25% | 18.00 |
| Brand Authority | 8/100 | 20% | 1.60 |
| Content E-E-A-T | 45/100 | 20% | 9.00 |
| Technical GEO | 61/100 | 15% | 9.15 |
| Schema & Structured Data | 52/100 | 10% | 5.20 |
| Platform Optimization | ~10/100 | 10% | 1.00 |
| **Overall GEO Score** | | | **43.95 ≈ 44/100** |

---

## Critical Issues (Fix Immediately)

### 1. Brand Authority — 8/100 (CRITICAL)
- **No Google Business Profile** — not verified on Google Maps
- **No Wikipedia** — AI cannot identify as legitimate entity
- **No YouTube** — video content heavily cited by AI
- **No Trustpilot/Google Reviews** — zero review profile
- **No Reddit mentions** — no third-party discussion
- **ABN not publicly searchable** — business registration invisible

### 2. Content E-E-A-T — 45/100 (HIGH)
- **No professional photo of founder** — face credibility absent
- **No LinkedIn profile link** — personal brand authority missing
- **No credentials/certifications** — expertise claims unverifiable
- **No client testimonials** — no social proof with names/companies
- **No case studies** — cannot demonstrate applied results
- **Blog author attribution generic** — "Winning Adventure Global" not "Andy Liu"

### 3. llms.txt Missing — Technical GEO (HIGH)
- HTTP 404 at `/llms.txt` — AI crawlers navigate blind
- No `/sitemap-llms.xml` variant

### 4. Missing Article Schema (Schema — 52/100)
- All 5+ blog articles have zero structured data
- No BlogPosting/Article schema on `/resources/[slug]` pages
- No author Person schema for Andy Liu

### 5. No Review/AggregateRating Schema
- No star ratings for AI overviews
- Homepage and About page lack trust signals

---

## High Priority Issues (Fix Within 1 Week)

### AI Crawler robots.txt
- No explicit allow rules for GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- All implicitly allowed via `User-agent: *` / `Allow: /`

### Missing BreadcrumbList Schema
- Site navigation structure opaque to AI
- No breadcrumb context in search results

### Missing Person Schema (Andy Liu)
- Founder exists in Organization schema as nested Person
- But no standalone Person with jobTitle, worksFor, sameAs

### Sitemap Deficiencies
- No `lastmod` timestamps on entries
- No `priority` attributes (homepage=1.0, services=0.8)

---

## Medium Priority Issues

- `abn` property should be `ABN` in Organization schema (casing)
- priceRange inconsistency: Organization uses "$$$" vs LocalBusiness uses "AUD $2,000 - $50,000+"
- Duplicate schema types without @graph wrapper
- No HowTo schema on services page
- No WebSite schema with potentialAction

---

## GEO-Optimized Keywords

| Keyword Cluster | Target Page | Intent |
|----------------|-------------|--------|
| "Australia China sourcing agent" | /services | Commercial |
| "Australian business China factory tour" | /services | Commercial |
| "Adelaide China procurement consultant" | /about | Local commercial |
| "Sydney import from China" | /resources (city page) | Local commercial |
| "Melbourne Alibaba alternative China" | /resources (city page) | Comparison |
| "Australia 1688 sourcing agent" | /services | Commercial |
| "Australian owned China sourcing company" | /about | Brand |
| "China factory verification Australian business" | /services | Commercial |

---

## Quick Wins (Implement This Week)

1. **Create llms.txt** — Aggregate site structure for AI crawlers
2. **Add explicit AI crawler rules** to robots.txt
3. **Add AggregateRating schema** on homepage/about
4. **Add Article/BlogPosting schema** to all blog pages
5. **Add Andy Liu photo** to About page (highest E-E-A-T single fix)

---

## 30-Day GEO Action Plan

### Week 1: Foundation
- Create llms.txt
- Add AI crawler rules to robots.txt
- Add Article schema to blog pages
- Add AggregateRating to homepage

### Week 2: E-E-A-T
- Add founder professional photo to About page
- Add LinkedIn profile link
- Quantify years of experience ("12+ years in Chinese manufacturing")
- Add one client testimonial with name/company

### Week 3: Local GEO
- Claim/verify Google Business Profile
- Submit to Australian directories (Yellow Pages, True Local, ABR)
- Add Review schema
- Add BreadcrumbList schema

### Week 4: Content GEO
- Create city-specific blog posts (Sydney, Melbourne)
- Expand blog author attribution (Andy Liu bio on all posts)
- Add case study content
- Generate sitemap-llms.xml

---

## Phase 19 Requirements (from ROADMAP)

### Must Address
- SEO-05: Page SEO Optimization (title, meta, H1-H3, keywords, alt, internal linking)
- GEO: Google Business Profile
- GEO: LocalBusiness Schema enhancement
- GEO: Australian city keywords in metadata
- GEO: llms.txt generation
- GEO: Review/Testimonial Schema
- GEO: Robots.txt AI crawler rules

---

## Verification

1. Lighthouse SEO 90+ on all pages
2. Google Rich Results Test passes for all schemas
3. GBP listing appears in Google Maps search
4. llms.txt returns HTTP 200 from root
5. Robots.txt has explicit AI crawler rules
6. City keyword metadata on /services and /about
7. AI citability score improves from 72 to 80+
