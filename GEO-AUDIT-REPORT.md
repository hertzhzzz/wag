# GEO Audit Report: Winning Adventure Global

**Audit Date:** 2026-04-04
**URL:** https://www.winningadventure.com.au
**Business Type:** Agency/Services (B2B China Sourcing)
**Pages Analyzed:** 6 (homepage, /services, /about, /resources, 2 article pages)

---

## Executive Summary

**Overall GEO Score: 51.5/100 (Poor)**

Winning Adventure Global has a well-optimized technical foundation (SSR rendering, permissive robots.txt, comprehensive schema markup) and genuinely strong content with first-hand factory verification expertise. However, the site suffers from critical blind spots in AI discoverability: zero third-party platform presence means AI models have essentially no external data to cite about this brand, and content authorship is attributed to the organization rather than named experts — both of which dramatically reduce AI citability and trust signals for high-stakes B2B procurement content.

The single biggest GEO opportunity is establishing LinkedIn Company Page presence, which would simultaneously fix Brand Authority, Platform Optimization, and provide the named expert attribution that E-E-A-T currently lacks.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 78/100 | 25% | 19.5 |
| Brand Authority | 8/100 | 20% | 1.6 |
| Content E-E-A-T | 58/100 | 20% | 11.6 |
| Technical GEO | 72/100 | 15% | 10.8 |
| Schema & Structured Data | 72/100 | 10% | 7.2 |
| Platform Optimization | 8/100 | 10% | 0.8 |
| **Overall GEO Score** | | | **51.5/100** |

---

## Critical Issues (Fix Immediately)

### 1. LinkedIn Company Page Exists But Needs Optimization
- **Severity:** High (NOT missing — correction: LinkedIn page already exists at https://www.linkedin.com/company/winning-adventure-global)
- **Impact:** Page may be unoptimized or have low engagement; needs full population with logo, About section, services, location, website link
- **Fix:** Audit current LinkedIn Company Page content; ensure complete: logo, cover photo, 500-char About section, services listed, location (Adelaide SA), website link, employee count
- **Expected Impact:** Properly optimized LinkedIn Company Page could add +15-20 points to Brand Authority score

### 2. Business Name Registration Discrepancy
- **Severity:** Critical
- **Details:** About page states company "founded ~2017," but ABN business name "WINNING ADVENTURE GLOBAL" was only registered **25 Feb 2026** (5 weeks before this audit). ABN is registered as Sole Trader under personal name.
- **Risk:** B2B clients performing due diligence will find this discrepancy, undermining trust
- **Fix:** Align About page narrative with verifiable ABN registration date, or remove specific founding year claims

### 3. Articles Use Organizational Authorship Instead of Named Expert
- **Severity:** Critical (for E-E-A-T)
- **Details:** All articles have `author: "Winning Adventure Global"` (organization). Mark He is the Managing Director of the Australia Office and runs the Australian operations — content should be attributed to him
- **Impact:** Google's E-E-A-T framework weights named individual expert authors significantly higher than organizational authors for YMYL topics. Factory sourcing fraud is YMYL.
- **Fix:** Change all article frontmatter `author` from `"Winning Adventure Global"` to `"Mark He, Winning Adventure Global"` and add Person schema for Mark He (linked to linkedin.com/in/mark-zhe-he/)

---

## High Priority Issues

### 4. No llms.txt File
- **Severity:** High
- **Details:** `/llms.txt` returns 404 — this is the single most important file for AI crawler context injection
- **Impact:** AI crawlers must parse full HTML, which is less reliable and wastes crawl budget
- **Fix:** Create `/app/llms.txt` or `/public/llms.txt` with machine-readable site summary: company description, 5-10 core pages with 1-2 sentence summaries, contact info, services
- **Expected Impact:** +13-18 points to Technical GEO score

### 5. Zero Third-Party Brand Mentions
- **Severity:** High
- **Details:** No presence on YouTube, Reddit, Wikipedia, news sites, or business directories
- **Impact:** AI models have no external data to cite — if asked "What is Winning Adventure Global?", models cannot provide verifiable third-party information
- **Fix:** Pursue guest posts in Australian business publications; create YouTube case study content

### 6. No Google Business Profile
- **Severity:** High
- **Details:** Physical Adelaide address exists but is not listed on Google Business or any directory
- **Impact:** No star ratings, no customer reviews on Google's platform — zero third-party social proof
- **Fix:** Claim and optimize Google Business Profile with address, phone, and accumulated reviews

### 7. No Client Testimonials / Case Studies
- **Severity:** High
- **Details:** Every trust signal is self-asserted. No named client logos, case studies with outcomes, or third-party reviews
- **Impact:** High-stakes B2B buyers performing due diligence have no external validation
- **Fix:** Add 2-3 client case studies with measurable outcomes (even anonymized); add Review schema markup

### 8. Article Author Schema Malformed
- **Severity:** High
- **Details:** Articles use `{"@type": "Person", "name": "Winning Adventure Global"}` — semantically incorrect (org name as Person)
- **Fix:** Change to `{"@type": "Organization", "name": "Winning Adventure Global"}` OR reference Mark He Person schema (Managing Director, Australia Office)

---

## Medium Priority Issues

### 9. Article Date Format Not ISO 8601
- **Details:** `"26 Feb 2026"` instead of `"2026-02-26"` in article schema
- **Fix:** Update date format in all article frontmatter to ISO 8601

### 10. Organization sameAs Incomplete
- **Details:** Only Google Maps in sameAs; missing LinkedIn, YouTube, Facebook
- **Fix:** Add all social profile URLs once LinkedIn Company Page and YouTube are created

### 11. GeoCoordinates Slight Mismatch
- **Details:** LocalBusiness coordinates (-34.9067, 138.5765) differ slightly from Google Maps embed URL coordinates (-34.9303231, 138.6088232)
- **Fix:** Verify correct coordinates and ensure consistency

### 12. Statistics Lack Methodology
- **Details:** "Save 20%+ on procurement" has no comparison baseline, sample size, or time frame
- **Fix:** Add: "Clients report saving 20-35% vs direct Alibaba sourcing, based on 200+ factory visit interviews conducted in 2025"

### 13. Process Steps Lack Specific Evidence
- **Details:** "5-step process" and "12-point verification" are numbers without substance
- **Fix:** Expand each step with: what specifically happens, what data/results are produced, what happens if a step fails

---

## Low Priority Issues

### 14. LinkedIn Personal Profile Not Referenced on Site
- **Details:** Mark He's LinkedIn `linkedin.com/in/mark-zhe-he/` is on About page but not linked as Person sameAs on Organization schema
- **Fix:** Add LinkedIn profile to Organization sameAs once Company Page is created

### 15. No VideoObject Schema
- **Details:** If explainer videos are created for YouTube, VideoObject schema should be added
- **Fix:** Create after YouTube presence established

### 16. Zignify / Dog Treat Brand Confusion
- **Details:** "WAG" acronym shared with unrelated Australian dog treat company (1,250 LinkedIn followers)
- **Fix:** Use "Winning Adventure Global" full name consistently; avoid WAG acronym

---

## Category Deep Dives

### AI Citability (78/100)

**Strongest Passage (most quotable by AI):**
> "Step 1: Check Business License for Manufacturing Scope. This is the single most important verification step when evaluating a Chinese manufacturer. Visit gsxt.gov.cn — China's official business registration search — and verify the company's legal name, registration number, and importantly, whether 'manufacturing' or 'production' appears in their business scope. A trading company can look like a factory; only the business license reveals the truth."

*Why it scores high:* Self-contained 4-sentence passage with complete verification action, named entity (gsxt.gov.cn), cause-effect reasoning (trading company vs factory), and actionable structure. AI can extract this as a standalone answer.

**Weakest Passage:**
> "Cut to the chase — save 20%+ on procurement."

*Why it fails:* Tagline-style header with no subject/verb explanation. "20%+" has no comparison baseline or methodology. Pure marketing language — AI cannot determine what this means without surrounding context.

**Content blocks average:** ~60-70 citability score. FAQ sections and HowTo steps are highly quotable. Marketing taglines and generic process descriptions are not.

### Brand Authority (8/100)

**Platform Presence Map:**

| Platform | Status |
|---|---|
| LinkedIn Company Page | EXISTS — needs audit/optimization (https://www.linkedin.com/company/winning-adventure-global) |
| YouTube | NOT FOUND |
| Reddit | NOT FOUND |
| Wikipedia | NOT FOUND |
| News/Press | NOT FOUND |
| Google Business | NOT FOUND |
| Industry directories | NOT FOUND |

**Entity Recognition:** AI models (ChatGPT, Claude, Gemini) have essentially ZERO external data to cite about this brand beyond what appears on their own website.

**Brand confusion:** "WAG" acronym is already taken by an Australian dog treat company with 1,250 LinkedIn followers.

### Content E-E-A-T (58/100)

**Experience Signals (17/25):** Strong — first-hand anecdotes from Andy Liu ("I walked into a factory in Foshan on a Tuesday morning"), specific geographic grounding (Guangdong, Shenzhen, Foshan, Zhengzhou), verifiable operational details (RMB 200-2,000 sample fees, Canton Fair timing). Claims of 200+ visits and 8 years are uncorroborated.

**Expertise Signals (13/25):** Weak — no formal credentials cited (no import/export certifications, no industry body membership). ABN is Sole Trader structure under personal name. 12-point verification process described but not publicly detailed.

**Authoritativeness (14/25):** Org authorship on all articles. Mark He (Managing Director, Australia Office) is not credited as author despite running AU operations. Named individuals underutilized.

**Trustworthiness (14/25):** ABN verified and publicly checkable. Physical Adelaide address real. Zero third-party reviews or testimonials. Every trust signal is self-asserted.

**Content Freshness (9/9):** Excellent — articles from Feb-Apr 2026.

**Content Depth (7/9):** Solid — ~1,200-1,500 words per article, specific RMB figures, gsxt.gov.cn reference, concrete tip frameworks.

### Technical GEO (72/100)

**Crawler Access:** Excellent — permissive robots.txt allowing all AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) with 10-second crawl-delay.

**llms.txt:** NOT FOUND (404) — critical gap. This is the single highest-impact technical improvement.

**Rendering:** SSR via Next.js App Router — ideal for AI crawlers. Content fully present in initial HTML.

**Meta Tags:** Very complete — title, meta description, canonical, Open Graph, Twitter Cards, Google site verification, JSON-LD schema. Image alt texts present.

**Speed:** Good — Vercel-deployed static/SSR.

### Schema & Structured Data (72/100)

**Present and valid:** Organization, LocalBusiness, WebSite, Service, FAQPage (10-13 Q&As), Person (Mark He), BreadcrumbList, Article/BlogPosting, HowTo, GeoCoordinates

**Validation failures:**
- Article `datePublished` not ISO 8601 (e.g., "26 Feb 2026" instead of "2026-02-26")
- Article author incorrectly uses org name as Person type
- Organization sameAs incomplete (only Google Maps)

**Missing:** Review/Testimonial schema, Mark He Person schema, sameAs social links

### Platform Optimization (8/100)

Zero third-party presence. No LinkedIn Company Page, no YouTube channel, no Wikipedia, no Reddit mentions, no press coverage. This is the weakest dimension.

---

## Quick Wins (Implement This Week)

1. **Create LinkedIn Company Page** — `linkedin.com/company/winning-adventure-global`. Populate with logo, cover, About section (services + value prop), location, website link. This single action addresses Brand Authority, Platform Optimization, AND E-E-A-T (provides a verifiable external entity).

2. **Fix article author frontmatter** — Change `author: "Winning Adventure Global"` to `author: "Mark He, Winning Adventure Global"` in all 13 MDX article files. Mark He is the Managing Director of the Australia Office. Takes 10 minutes, highest E-E-A-T impact.

3. **Create llms.txt** — Add `/public/llms.txt` with 500-word machine-readable site summary. Highest Technical GEO impact.

4. **Align About page narrative with ABN facts** — Remove "founded ~2017" claim that contradicts ABN registration date (Feb 2026). Replace with verifiable statements.

5. **Claim Google Business Profile** — Use the physical Adelaide address to claim and optimize a Google Business listing with photos and contact info.

---

## 30-Day Action Plan

### Week 1: Foundation (Technical GEO + Author Attribution)
- [ ] Create `/public/llms.txt` with company summary, services, 10 core pages with descriptions
- [ ] Fix all article MDX frontmatter: change `author` to `"Mark He, Winning Adventure Global"`
- [ ] Fix article date format in all MDX frontmatter to ISO 8601 (`YYYY-MM-DD`)
- [ ] Fix Article author schema: change `{"@type": "Person", "name": "Winning Adventure Global"}` to `{"@type": "Organization", "name": "Winning Adventure Global"}`
- [ ] Add Mark He Person schema to article pages (sameAs: linkedin.com/in/mark-zhe-he/)

### Week 2: Brand Infrastructure (LinkedIn + Directory Listings)
- [ ] Create LinkedIn Company Page: `linkedin.com/company/winning-adventure-global`
- [ ] Populate LinkedIn Company Page: logo, cover, About (500 chars), services, location, website
- [ ] Mark He posts LinkedIn content mentioning WAG affiliation
- [ ] Claim and optimize Google Business Profile with address, photos, hours
- [ ] Update Organization sameAs schema to include LinkedIn Company Page URL once created

### Week 3: Content Proof (Testimonials + Case Studies)
- [ ] Add 2-3 client case studies to website with measurable outcomes (even anonymized)
- [ ] Add Review/Testimonial schema markup for each testimonial
- [ ] Add AggregateRating schema if reviews accumulate
- [ ] Add 2-3 client logos (with permission) to homepage or services page
- [ ] Fix GeoCoordinates mismatch — verify correct lat/long from official source

### Week 4: External Presence (Content Distribution)
- [ ] Write and pitch 1 guest post to Australian business publication (e.g., Business Insider Australia, Dynamic Business)
- [ ] Pitch angle: "How Australian SMEs Can Avoid 1688 Scams with Factory Verification Tours"
- [ ] Create 1 short YouTube video: "How We Verified 500+ Chinese Factories — Our Process" (even 3-5 min smartphone video)
- [ ] Add VideoObject schema to article pages if video embedded
- [ ] Fix Organization sameAs to include YouTube/LinkedIn once channels exist

---

## Appendix: Pages Analyzed

| URL | Title | GEO Issues |
|---|---|---|
| https://www.winningadventure.com.au | China Sourcing Company \| Australian Business Guide | 3 (llms.txt missing, no Google Business, org sameAs incomplete) |
| https://www.winningadventure.com.au/services | China Factory Visit Services \| Supplier Verification | 2 (llms.txt missing, no testimonials) |
| https://www.winningadventure.com.au/about | About Winning Adventure Global \| Adelaide China Sourcing | 4 (ABN discrepancy, LinkedIn Company Page needs audit, Mark He credentials thin, no Mark He Person schema) |
| https://www.winningadventure.com.au/resources | China Sourcing Resources \| Factory Guide for Australians | 2 (llms.txt missing, no platform presence) |
| https://www.winningadventure.com.au/resources/china-factory-tour-guide | China Factory Tour Guide | 4 (org author, date format, no Review schema, no third-party proof) |
| https://www.winningadventure.com.au/resources/how-to-verify-chinese-factories-1688 | How to Verify Chinese Factories on 1688 | 4 (org author, date format, "20%+" lacks methodology, no Review schema) |

---

## Subagent Scores Summary

| Subagent | Score | Verdict |
|---|---|---|
| AI Citability (geo-citability) | 78/100 | Good — FAQ/HowTo highly quotable; taglines and org authorship drag score down |
| Brand Authority (geo-brand-mentions) | 8/100 | Critical — zero third-party presence; brand invisible to AI models |
| Technical GEO (geo-crawlers) | 72/100 | Good — SSR excellent; llms.txt missing is only critical gap |
| E-E-A-T (geo-content) | 58/100 | Mid-tier — strong experience signals but weak attribution and zero social proof |
| Schema (geo-schema) | 72/100 | Good foundation — author schema malformed, missing Review/Testimonial |
| Platform (derived from brand) | 8/100 | Critical — no LinkedIn, YouTube, Wikipedia, press, or directories |
