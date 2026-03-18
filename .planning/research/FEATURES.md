# Feature Research: SEO Automation

**Domain:** SEO Automation for B2B Corporate Website
**Researched:** 2026-03-18
**Confidence:** HIGH

## Overview

This research identifies the essential features and components needed to achieve #1 ranking in Google Australia for B2B sourcing keywords ("epic sourcing", "china direct"). The SEO automation system is categorized into three pillars: Technical SEO, On-Page SEO, and Content/Off-Page SEO.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Core SEO features that are non-negotiable. Without these, the website cannot rank competitively.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **XML Sitemap** | Google needs roadmap to discover all pages. Missing sitemap = incomplete indexing | LOW | Next.js supports automatic sitemap generation via next-sitemap or built-in sitemap.ts |
| **Robots.txt** | Controls crawler access. Missing = potential indexing issues | LOW | Standard file in public folder or dynamic generation |
| **Meta Tags (Title, Description)** | Appears in SERP. Poor tags = low CTR | LOW | Next.js Metadata API handles this natively |
| **Canonical URLs** | Prevents duplicate content penalties | LOW | Critical for pages with multiple URL variants (trailing slash, query params) |
| **Structured Data (Schema Markup)** | Enables rich snippets, enhances SERP visibility | MEDIUM | JSON-LD for Organization, LocalBusiness, FAQ, Article |
| **Open Graph / Social Meta** | Controls how content appears when shared on social media | LOW | Next.js Metadata API supports og: tags |
| **Core Web Vitals Optimization** | Google ranking signal since 2021. Poor metrics = ranking penalty | MEDIUM | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| **Mobile-Friendly Design** | Mobile-first indexing since 2019 | LOW | Already implemented in v1.0 |
| **HTTPS/SSL** | Ranking factor (confirmed 2% weight by First Page Sage 2025) | LOW | Already implemented via Vercel |
| **Fast Page Load Speed** | Affects both ranking and user experience | MEDIUM | Target: < 3s on 3G, < 1s on 4G |

### Differentiators (Competitive Advantage)

Features that set the website apart and drive competitive ranking for target keywords.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Keyword-Optimized Content Clusters** | Content depth signals E-E-A-T to Google. "epic sourcing" + "china direct" requires comprehensive pillar pages | MEDIUM | Build topic clusters around core keywords |
| **FAQ Schema Implementation** | Enables featured snippets (Position 0). High CTR for B2B queries | MEDIUM | FAQ schema on service pages captures voice search |
| **Local SEO (Australian)** | Targets Google.com.au specifically. Critical for "china direct" + Australia | MEDIUM | Google Business Profile, local citations, au-specific content |
| **Backlink Acquisition Strategy** | Domain Authority (DA) is primary ranking factor. Target: DA 20+ | HIGH | Guest posting, industry partnerships, PR |
| **Automated SEO Audits** | Continuous monitoring prevents ranking drops. Weekly scans catch issues | MEDIUM | Integration with tools like Screaming Frog, Ahrefs, or Semrush |
| **Content Calendar & Automation** | Systematic blog production maintains freshness signals | MEDIUM | Monthly content pipeline with AI-assisted drafting |
| **Internal Linking Architecture** | Distributes page authority, improves crawl efficiency | LOW | Hub-and-spoke model from pillar pages |
| **Image Alt Text Automation** | Accessibility + SEO. Alt text as ranking signal for image search | LOW | Next.js Image component supports alt props |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem beneficial but can harm SEO performance.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Keyword Stuffing** | Old-school ranking tactic | Google penalizes unnatural density. Focus on semantic relevance instead | LSI keywords, natural language, search intent alignment |
| **Excessive Schema Markup** | "More data = better" assumption | Can trigger spam detection if not relevant to page content | Use only relevant schema types |
| **Buying Low-Quality Backlinks** | Quick DA boost | Google Penguin catches this. Risk of manual penalty | Earn links through quality content |
| **AI-Generated Content at Scale** | Fast content production | Google actively downranks low-quality AI content (March 2025 update) | Human-edited AI drafts, E-E-A-T focused |
| **Too Many Redirects** | URL management convenience | Redirect chains slow crawl, pass less link equity | Clean URL structure, minimal redirects |
| **Duplicate Content Across Pages** | Consistency, easier management | Google filters duplicates, dilutes ranking signals | Canonical tags, unique content per page |

---

## Feature Dependencies

```
[XML Sitemap]
    └──requires──> [Page Routes Defined]
                       └──requires──> [Dynamic Routes Handler]

[Schema Markup]
    └──requires──> [JSON-LD Component]
                       └──requires──> [Page-Specific Data]

[Content Clusters]
    └──requires──> [Internal Linking Structure]
                       └──requires──> [Pillar Pages]

[Backlink Strategy]
    └──requires──> [Quality Content Production]
                       └──requires──> [Content Calendar]

[Local SEO]
    └──requires──> [Google Business Profile]
                       └──requires──> [NAP Consistency]
                          └──requires──> [Local Citations]

[Core Web Vitals]
    └──requires──> [Image Optimization]
                       └──requires──> [Next.js Image Component]
```

### Dependency Notes

- **Sitemap requires Page Routes:** All routes must be defined before sitemap generation
- **Schema requires Page-Specific Data:** Each page needs structured data injection
- **Content Clusters require Internal Linking:** Hub-and-spoke model needs cross-links
- **Backlinks require Quality Content:** Linkable assets are prerequisite for outreach
- **Local SEO requires NAP Consistency:** Name, Address, Phone must match across all citations

---

## MVP Definition

### Launch With (v1.1 - SEO Automation)

Core technical SEO to establish foundation for ranking.

- [ ] **XML Sitemap Generation** — Automated, includes all pages, updates on build
- [ ] **Robots.txt Configuration** — Allows Googlebot, blocks scrapers
- [ ] **Core Metadata (Title, Description)** — Optimized for target keywords per page
- [ ] **Canonical URLs** — Prevents duplicate content issues
- [ ] **Schema Markup (Organization + LocalBusiness)** — Business identity in search
- [ ] **Open Graph Tags** — Social sharing optimization
- [ ] **Core Web Vitals Fixes** — Address LCP issues (currently 5.4s target <2.5s)
- [ ] **HTTPS/SSL** — Already configured via Vercel

### Add After Validation (v1.2 - Content SEO)

Content strategy implementation for keyword ranking.

- [ ] **FAQ Schema on Service Pages** — Target featured snippets
- [ ] **Blog Content Calendar** — Systematic production (2-4 posts/month)
- [ ] **Internal Linking Optimization** — Hub-and-spoke from pillar pages
- [ ] **Image Alt Text Audit** — Manual + automated alt text
- [ ] **Page-Specific Keyword Optimization** — Each page targets primary + secondary keywords

### Future Consideration (v1.3+ - Off-Page SEO)

Domain authority building for competitive ranking.

- [ ] **Backlink Outreach Program** — Industry partnerships, guest posting
- [ ] **Google Business Profile Optimization** — Local SEO for Australia
- [ ] **Automated SEO Audits** — Weekly monitoring dashboard
- [ ] **Content Clusters Expansion** — Comprehensive topic coverage

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Dependencies |
|---------|------------|---------------------|----------|--------------|
| XML Sitemap | HIGH | LOW | P1 | Page routes defined |
| Core Metadata | HIGH | LOW | P1 | None |
| Canonical URLs | HIGH | LOW | P1 | None |
| Schema Markup (Org) | HIGH | LOW | P1 | JSON-LD component |
| Core Web Vitals Fix | HIGH | MEDIUM | P1 | Image optimization |
| Robots.txt | MEDIUM | LOW | P1 | None |
| Open Graph | MEDIUM | LOW | P1 | None |
| FAQ Schema | MEDIUM | MEDIUM | P2 | Basic schema in place |
| Content Calendar | HIGH | MEDIUM | P2 | Content strategy defined |
| Internal Linking | HIGH | LOW | P2 | Pages exist |
| Backlink Strategy | HIGH | HIGH | P3 | Content production |
| Local SEO | MEDIUM | MEDIUM | P3 | Business info verified |
| Automated Audits | MEDIUM | MEDIUM | P3 | Monitoring tools |

**Priority key:**
- P1: Must have for launch — Technical foundation
- P2: Should have, add when possible — Content optimization
- P3: Nice to have, future consideration — Off-page authority

---

## Competitor Feature Analysis

| Feature | Competitor A (AussieBiz) | Competitor B (ChinaConnect) | Our Approach |
|---------|--------------------------|----------------------------|--------------|
| XML Sitemap | Yes, basic | Yes, basic | Automated generation |
| Schema Markup | No | Partial (Organization) | Full implementation (Org + LocalBusiness + FAQ) |
| Blog Content | 2 posts/month | 1 post/month | 2-4 posts/month, quality-focused |
| Core Web Vitals | Unknown | Unknown | Target 90+ scores |
| Local SEO | Yes | No | Full optimization for .com.au |
| Backlinks | Domain referrals only | Some guest posts | Systematic outreach |

---

## SEO Automation System Components

### Technical Components

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **Sitemap Generator** | Auto-generate XML sitemap on build | next-sitemap or sitemap.ts |
| **Schema Component** | Reusable JSON-LD injection | Custom Schema.tsx component |
| **Metadata API** | Dynamic title/description per page | Next.js Metadata API |
| **Image Optimizer** | WebP/AVIF conversion, lazy loading | next/image with provider config |
| **Robots Handler** | Dynamic robots.txt | app/robots.ts route handler |

### Content Components

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **Blog System** | Content publication | Existing MDX + gray-matter |
| **Content Calendar** | Editorial scheduling | Notion/Google Sheets integration |
| **Keyword Tracker** | Ranking monitoring | API integration (Ahrefs/Semrush) |
| **Audit Dashboard** | Issue detection | Automated Screaming Frog or custom |

---

## Sources

### Primary (HIGH confidence)
- Backlinko On-Page SEO Guide (2026): https://backlinko.com/on-page-seo
- First Page Sage Ranking Factors 2025: https://www.seoblog.com/google-ranking-factors-2025
- Google Search Central Documentation: https://developers.google.com/search/docs

### Secondary (MEDIUM confidence)
- CognitiveSEO Algorithm Updates: https://cognitiveseo.com/signals/
- TechnicalSEO.com Tools: https://technicalseo.com/
- B2B Content Marketing Guide (Sprout Social): https://sproutsocial.com/insights/b2b-content-marketing/

---

*Feature research for: SEO Automation - B2B Website*
*Researched: 2026-03-18*
*Project: WAG Website v1.1 SEO Automation*
