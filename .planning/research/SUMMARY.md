# Project Research Summary

**Project:** WAG Website SEO Automation
**Domain:** B2B SEO for Australian Sourcing Companies
**Researched:** 2026-03-18
**Confidence:** MEDIUM

---

## Executive Summary

This research synthesizes findings from four parallel research streams to define the technology stack, features, architecture, and pitfalls for achieving #1 ranking in Google Australia for B2B sourcing keywords ("epic sourcing", "china direct").

The recommended approach follows a three-pillar SEO strategy: **Technical SEO** (foundation), **On-Page/Content SEO** (ranking drivers), and **Off-Page SEO** (authority building). For WAG specifically, the critical insight is that "epic sourcing" appears to be a brand-invented term with zero search volume, making it an ineffective primary keyword target. The research strongly recommends focusing on proven commercial keywords like "China sourcing agent", "Australian sourcing company", and "verified China suppliers" where Australian businesses actively search.

The highest-risk pitfalls center on: (1) ignoring search intent in B2B contexts, (2) targeting keywords without verified search volume, (3) neglecting Australian market localization, and (4) technical SEO foundation weaknesses (LCP currently 5.4s vs target 2.5s). A phased approach prioritizing technical fixes before content creation will mitigate these risks.

---

## Key Findings

### Recommended Stack

**Core SEO platforms:**
- **Semrush Pro** — Industry-leading keyword research (25B+ keywords), position tracking for Australian market, competitive analysis. Essential for ranking competitive terms.
- **Google Search Console** — Free official Google data for ranking positions, click-through rates, indexing status. Critical for tracking target keywords.
- **Google Analytics 4** — Official Google analytics with Search Console integration.

**Next.js integration:**
- **next-sitemap** ^4.x — Automatic sitemap generation during build. Generates sitemap.xml and robots.txt automatically.
- **Schema.org (JSON-LD)** — Native Next.js metadata API supports JSON-LD. Add Organization, LocalBusiness, FAQPage schemas for rich snippets.
- **@vercel/analytics** — Web Vitals tracking and analytics.

**Backlink & authority:**
- **Google Business Profile** — Critical for local Australian searches. Optimize with accurate NAP, photos, services.
- **HARO / Connectively** — Backlink acquisition from authoritative news sites.
- **Guest Posting** — Target Australian and B2B procurement publications.

### Expected Features

**Must have (table stakes):**
- XML Sitemap — Google needs roadmap to discover all pages
- Robots.txt — Controls crawler access
- Meta Tags (Title, Description) — Appears in SERP, affects CTR
- Canonical URLs — Prevents duplicate content penalties
- Structured Data (Schema Markup) — Enables rich snippets
- Core Web Vitals Optimization — LCP < 2.5s, FID < 100ms, CLS < 0.1 (current LCP 5.4s needs fixing)
- HTTPS/SSL — Already configured via Vercel

**Should have (competitive):**
- Keyword-Optimized Content Clusters — Build topic clusters around core commercial keywords
- FAQ Schema Implementation — Enables featured snippets (Position 0)
- Local SEO (Australian) — Google Business Profile, local citations, au-specific content
- Backlink Acquisition Strategy — Domain Authority building through guest posting, industry partnerships
- Internal Linking Architecture — Hub-and-spoke model from pillar pages

**Defer (v2+):**
- Automated SEO Audits — Weekly monitoring dashboard
- Content Clusters Expansion — Comprehensive topic coverage beyond initial pillar pages

### Architecture Approach

The SEO automation architecture follows a build-time + server-side pattern with monitoring automation:

**Major components:**
1. **Sitemap Generator** — `next-sitemap` runs post-build, generates sitemap.xml and robots.txt
2. **Schema Manager** — Reusable JSON-LD components for Organization, LocalBusiness, FAQ, Article
3. **Analytics Collector** — @vercel/analytics SDK for Web Vitals tracking
4. **Monitoring Service** — GitHub Actions scheduled workflows fetching GSC data
5. **Content Pipeline** — Existing MDX + gray-matter for blog content with SEO frontmatter

**Key architectural patterns:**
- Build-Time Sitemap Generation (zero runtime overhead)
- Server-Side SEO Metadata (Next.js Metadata API)
- JSON-LD Schema Components (reusable React components)
- On-Demand Revalidation for Sitemaps (ISR)
- GitHub Actions SEO Monitoring (scheduled workflows)

### Critical Pitfalls

1. **Ignoring Search Intent in B2B Context** — Content ranks but fails to convert. B2B buyers have long sales cycles with multiple stakeholders (researchers, evaluators, decision-makers). Map content to full buyer's journey: awareness, consideration, decision stages.

2. **Targeting Wrong Keywords** — "epic sourcing" has zero search volume (invented brand term). Prioritize long-tail keywords with proven search demand: "sourcing agent", "China manufacturing consultant", "Australian sourcing company", "verified China suppliers".

3. **Neglecting Australian Market Localization** — Missing local signals cause Google Australia to deprioritize. Include location-specific keywords, Australian business context (ACL, import regulations), claim Google Business Profile, build citations on Australian directories.

4. **Technical SEO Foundation Weaknesses** — Current LCP 5.4s is a critical blocker. Complete technical SEO audit before content work. Address Core Web Vitals, implement proper schema markup, fix crawl errors.

5. **Thin, Undifferentiated Content** — Content fails to differentiate from competitors. Conduct content gap analysis against top-ranking competitors. Focus on E-E-A-T signals: original research, Australian case studies, expert perspectives.

---

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Technical SEO Foundation
**Rationale:** Current LCP 5.4s is a critical blocker. Without technical foundation, content investment will not yield rankings.

**Delivers:**
- XML Sitemap generation (next-sitemap)
- Robots.txt configuration
- Core Web Vitals fixes (LCP < 2.5s)
- Schema Markup (Organization + LocalBusiness)
- Canonical URLs implementation
- Open Graph tags

**Addresses:** All P1 table stakes from FEATURES.md

**Avoids:** Pitfall #4 (Technical SEO Foundation Weaknesses), Pitfall #5 (Thin Content — can't succeed with poor technical foundation)

### Phase 2: On-Page SEO & Content Strategy
**Rationale:** With technical foundation in place, content strategy can drive keyword rankings.

**Delivers:**
- Page-specific keyword optimization
- FAQ Schema on service pages
- Blog content calendar (2-4 posts/month)
- Internal linking optimization (hub-and-spoke)
- Image alt text audit

**Uses:** Semrush for keyword research, MDX content system

**Avoids:** Pitfall #1 (Ignoring Search Intent), Pitfall #2 (Wrong Keywords — validate with Semrush), Pitfall #8 (Brand keyword with zero volume)

### Phase 3: Off-Page SEO & Authority Building
**Rationale:** Domain authority building required to compete for competitive commercial keywords.

**Delivers:**
- Backlink outreach program (HARO, guest posting)
- Google Business Profile optimization
- Local citations (Australian directories)
- Content clusters expansion

**Avoids:** Pitfall #7 (Ignoring Off-Page Signals)

### Phase Ordering Rationale

- Technical foundation must come first — current PageSpeed issues block content investment
- Content strategy depends on keyword research validation — must verify search volume before creating content
- Off-page SEO depends on having quality content to promote — cannot build links without linkable assets
- Avoids Pitfall #6 (Short-Term Thinking) — realistic 6-12 month timeline for meaningful results

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Keyword validation — need to confirm actual search volume for "epic sourcing" alternative terms using Semrush trial
- **Phase 3:** Backlink outreach strategy — requires understanding Australian B2B procurement publications landscape

Phases with standard patterns (skip research-phase):
- **Phase 1:** Technical SEO — well-documented Next.js + next-sitemap patterns
- **Phase 2:** Content calendar — established editorial workflow patterns

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Based on official Next.js docs, next-sitemap, Vercel documentation. Existing WAG stack integrates seamlessly. |
| Features | HIGH | Table stakes and differentiators from established SEO industry standards (Backlinko, First Page Sage). |
| Architecture | HIGH | Five documented patterns with code examples. Next.js App Router native support for all components. |
| Pitfalls | MEDIUM | B2B SEO pitfalls well-documented, but WAG-specific keyword analysis needs validation. "epic sourcing" volume unconfirmed. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Keyword Volume Validation:** "epic sourcing" may have zero search volume. Need Semrush trial to validate alternative commercial keywords for Australian market.
- **LCP Performance Gap:** Current 5.4s vs target 2.5s requires specific optimization plan during Phase 1 execution.
- **Australian Market Specifics:** Some localization recommendations (directory listings, citation sites) need verification of current 2026 availability.

---

## Sources

### Primary (HIGH confidence)
- Next.js Official Documentation (nextjs.org) — Metadata API, Image Optimization
- next-sitemap GitHub Repository — Sitemap generation
- Google Search Central Documentation — Core Web Vitals, Schema markup
- Backlinko On-Page SEO Guide (2026) — SEO best practices
- First Page Sage Ranking Factors 2025 — Ranking factor权重

### Secondary (MEDIUM confidence)
- Semrush 2026 Tutorial (99signals.com) — Keyword research methodology
- Search Engine Journal — B2B SEO pitfalls and solutions
- Australian SEO agency best practices — Local market considerations

### Tertiary (LOW confidence)
- Chinese SEO industry guides — B2B foreign trade SEO patterns (need validation for Australian market)

---

*Research completed: 2026-03-18*
*Ready for roadmap: yes*
