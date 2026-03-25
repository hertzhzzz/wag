# Feature Research

**Domain:** GEO Optimization for B2B Sourcing Websites
**Researched:** 2026-03-25
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features that B2B sourcing websites must have for GEO visibility. Missing these = AI platforms ignore or distrust the content.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| llms.txt | AI crawlers (Perplexity, ChatGPT, Claude) look for this first | MEDIUM | Must list site purpose, priority pages, contact info. Currently MISSING (0/100). |
| FAQPage schema | AI extracts Q&A for direct answers | LOW | WAG has FAQPage on homepage/services/about. Restricted by Google since Aug 2023 but still valuable for AI semantic parsing. |
| Article/BlogPosting schema | AI indexes blog content with full context | MEDIUM | WAG MISSING on all 10 blog posts. Critical gap. |
| Organization schema with sameAs | Entity linking to LinkedIn, Wikipedia, social profiles | MEDIUM | WAG has Organization but missing sameAs entirely. Without this, AI cannot build entity graph. |
| Author Person schema | Establishes content creator authority | MEDIUM | Andy Liu Person exists but incomplete (no LinkedIn, credentials, jobTitle). |
| Crawler-accessible robots.txt | AI bots must not be blocked | LOW | WAG robots.txt is permissive. Add explicit AI crawler rules (GPTBot, ClaudeBot, PerplexityBot). |
| SSR/SSG rendering | AI crawlers typically do NOT execute JavaScript | LOW | WAG uses Next.js App Router with SSR - content visible without JS execution. |

### Differentiators (Competitive Advantage)

Features that increase citation probability in AI answers. Not required, but directly improve AI visibility.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Author credential documentation | Increases Expertise score (currently 11/25) | MEDIUM | LinkedIn profile, professional background, certifications. Andy Liu has 8 years experience but zero documented credentials. |
| Client testimonials with attribution | Boosts Trustworthiness and Experience signals | MEDIUM | WAG has no client testimonials. Must be REAL per PROJECT.md constraints. |
| Third-party statistics with citations | Increases E-E-A-T statistical density | LOW | WAG claims "200+ factory visits", "8 years" but no external sources. Cite DFAT trade data, ABS import stats. |
| Google Business Profile | Local business entity verification | LOW | WAG NOT verified on Google Maps. Critical for "Australian business China sourcing" queries. |
| Wikipedia presence | AI heavily weights Wikipedia entities | HIGH | Requires notability - press coverage, awards, significant partnerships. Not quickly achievable. |
| Video content (YouTube) | AI platforms cite video content heavily | MEDIUM | WAG has zero video. Factory tour walkthroughs would be high-value. |
| Trustpilot/Google Reviews | Third-party review aggregation | MEDIUM | WAG has zero reviews on external platforms. |
| BreadcrumbList schema | Navigation context for AI | LOW | WAG MISSING. Would improve AI understanding of page hierarchy. |
| speakable property | Marks content suitable for text-to-speech | LOW | WAG MISSING. Useful for voice search and AI assistants. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems or are ineffective.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Fabricated testimonials | "Other sites have testimonials" | Violates PROJECT.md真实性原则. AI can detect fabricated trust signals. | Use REAL client quotes with permission. Add case studies with actual outcomes. |
| Guaranteed rankings/clicks claims | "We can get you to the top" | Misleading. AI platforms don't work like traditional SEO. | Focus on E-E-A-T signals that AI actually weights. |
| Auto-generated FAQ content | "Fill the page with Q&A" | Low quality, duplicates existing content. AI penalizes thin, repetitive content. | Add genuinely useful FAQ based on actual client questions. |
| Wikipedia for new businesses | "We need a Wikipedia page" | Requires notability thresholds. AI ignores small business Wikipedia attempts. | Build entity authority through LinkedIn, press mentions, industry citations first. |
| Review schema without real reviews | "Add star ratings to look trustworthy" | Schema validation catches fake reviews. Damages trust if AI detects mismatch. | Earn genuine reviews first, then add schema. |

## Feature Dependencies

```
llms.txt
    └──requires──> Site structure definition (priority pages, services)
                       └──requires──> Organization schema (for entity consistency)

Article Schema (blog posts)
    └──requires──> Author Person schema (Andy Liu with credentials)
                       └──requires──> LinkedIn profile (credential verification)

E-E-A-T Deepening
    ├──requires──> Google Business Profile (local entity verification)
    ├──requires──> Real client testimonials (Trustworthiness)
    ├──requires──> Third-party citations (Expertise)
    └──requires──> Author credential documentation

AI Crawler Compliance
    ├──requires──> robots.txt explicit AI rules
    └──requires──> Structured data in initial HTML (not JS-dependent)
```

### Dependency Notes

- **llms.txt requires Organization schema:** The llms.txt must accurately reflect the organization name, services, and contact info - any mismatch with Organization schema confuses AI.
- **Article schema requires Person schema:** Blog posts cite the author; if the author Person schema is incomplete, citations lose authority.
- **E-E-A-T requires REAL signals:** All three E-E-A-T components (Experience, Expertise, Authoritativeness) must be backed by actual, verifiable content per PROJECT.md constraints.

## MVP Definition

### Launch With (v3.0 GEO Core)

Minimum viable GEO optimization - essential signals AI platforms expect.

- [ ] **llms.txt** — AI crawler discovery file at root. HIGHEST PRIORITY. Currently 404.
- [ ] **Article schema on blog posts** — 10 blog posts have zero Article/BlogPosting schema. HIGH PRIORITY.
- [ ] **Organization sameAs array** — Links to LinkedIn, YouTube, social profiles. Currently 0 links. CRITICAL.
- [ ] **Andy Liu Person schema completion** — Add jobTitle, sameAs (LinkedIn), knowsAbout, image.
- [ ] **Explicit AI crawler rules in robots.txt** — Add GPTBot, ClaudeBot, PerplexityBot allow rules.

### Add After Validation (v3.x)

Features to add once core GEO signals are in place.

- [ ] **Google Business Profile** — Verify and optimize. Currently NOT claimed.
- [ ] **BreadcrumbList schema** — On all pages. Currently MISSING.
- [ ] **WebSite + SearchAction schema** — Sitelinks search box. LOW priority.
- [ ] **Client testimonials** — With explicit permission. Must be REAL per constraints.
- [ ] **Third-party citations** — DFAT trade data, ABS statistics, AusTrade guides.

### Future Consideration (v4.0+)

Features to defer until core GEO is validated.

- [ ] **YouTube channel + video content** — Heavy AI citation value. Requires content production capability.
- [ ] **Wikipedia page** — Requires notability. Long-term goal.
- [ ] **Trustpilot/Google Reviews** — Third-party review aggregation. After establishing client base.
- [ ] **City-specific landing pages** — For "Sydney China sourcing", "Melbourne 1688 agent" keywords.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| llms.txt | HIGH - AI crawler discovery | MEDIUM - 1-2 hours | P1 |
| Article schema (blog) | HIGH - AI content indexing | LOW - 2-3 hours per page | P1 |
| Organization sameAs | HIGH - entity linking | LOW - 30 min | P1 |
| Person schema (Andy Liu) | HIGH - author authority | LOW - 1 hour | P1 |
| AI crawler robots.txt | MEDIUM - explicit permissions | LOW - 15 min | P1 |
| Google Business Profile | HIGH - local entity | LOW - 2 hours setup | P2 |
| BreadcrumbList schema | MEDIUM - navigation context | LOW - 1 hour | P2 |
| Client testimonials | HIGH - trust signals | MEDIUM - requires real clients | P2 |
| Third-party citations | MEDIUM - expertise evidence | LOW - 2-3 hours research | P2 |
| speakable property | LOW - voice search | LOW - 30 min | P3 |
| WebSite + SearchAction | LOW - sitelinks | LOW - 30 min | P3 |
| YouTube channel | HIGH - video citation value | HIGH - content production | P3 |
| Trustpilot reviews | MEDIUM - third-party trust | MEDIUM - requires clients | P3 |

**Priority key:**
- P1: Must have for GEO foundation
- P2: Should have, add after core
- P3: Nice to have, future consideration

## Competitor Feature Analysis

Based on phase 19 research comparing B2B China sourcing sites.

| Feature | WAG Current | Competitor Sites | Our Approach |
|---------|-------------|------------------|--------------|
| llms.txt | MISSING (404) | Rare among SMBs | Implement first - differentiation |
| Organization sameAs | MISSING (0 links) | Partial - some have LinkedIn | Add all available social links |
| Article schema | MISSING | Standard on blog sites | Add to all 10 blog posts |
| Person author schema | Incomplete | Full on authority sites | Complete Andy Liu schema |
| FAQPage schema | Present | Standard | Keep, add more Q&A blocks |
| Google Business Profile | NOT claimed | Industry leaders claimed | Claim and verify |
| Video content | None | Some have factory videos | Future consideration |
| Third-party citations | None | Minimal | Add government/industry data |
| Client testimonials | None | Some have logos/quotes | Add when REAL clients available |

## Sources

- Phase 19 GEO Audit Research (2026-03-23)
- GEO-AUDIT.md - AI Citability Analysis
- GEO-AUDIT.md - Technical GEO Infrastructure Assessment
- GEO-AUDIT.md - Schema.org Structured Data Audit
- GEO-AUDIT.md - E-E-A-T Content Quality Analysis
- PROJECT.md - WAG v3.0 GEO Optimization requirements

---
*Feature research for: GEO Optimization v3.0*
*Researched: 2026-03-25*
