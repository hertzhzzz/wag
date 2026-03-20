# Project Research Summary

**Project:** WAG Website v2.0 SEO Optimization
**Domain:** B2B China Sourcing Services (Australia)
**Researched:** 2026-03-20
**Confidence:** MEDIUM

## Executive Summary

WAG's SEO strategy targets surpassing Epic Sourcing Australia and ChinaDirect Sourcing in "China sourcing Australia" and "factory visit China" keyword rankings. The core differentiation is WAG's on-the-ground factory visit service, which competitors mention but do not prioritize. Research identifies three layered workstreams: (1) technical foundation fixes (robots.ts, schema, Core Web Vitals), (2) hub-and-spoke content architecture with pillar pages targeting factory visit keywords, and (3) Australian-localized trust-building content covering ChAFTA, import regulations, and supplier verification.

The recommended approach prioritizes technical SEO health before content investment, since Google's Helpful Content Update (2024) heavily penalizes thin/AI-generated content and sites must demonstrate genuine E-E-A-T signals to rank for B2B sourcing queries. Key risks include competitor analysis paralysis, thin content creation, and misaligned keyword intent targeting generic high-volume terms instead of commercial investigation keywords. Mitigation requires unique first-hand expertise in all content, not replication of competitor tactics.

## Key Findings

### Recommended Stack

**Core SEO Intelligence Platform:**
- **Ahrefs** ($99+/mo) — Industry-standard backlink database (12+ trillion links), competitor gap analysis, keyword discovery essential for identifying link opportunities Epic Sourcing and ChinaDirect Sourcing already exploit
- **Google Search Console** (free) — Official Google data for DA 20+ progress monitoring, Core Web Vitals, indexing status
- **Google Lighthouse CLI** — Next.js native technical SEO auditing with CI/CD pre-deploy checks

**Site Crawling and Technical Audit:**
- **Screaming Frog SEO Spider** (v20+, GBP 199/yr) — Desktop crawler for 300+ SEO issues, essential for Next.js JavaScript-rendered pages
- **SEmonitor** ($74/mo) — Automated rank tracking with AI Overview tracking (critical for 2026 SERP features)
- **vercel-seo-audit** — Next.js-specific audit built for Vercel deployments

**Next.js SEO Libraries:**
- **next-sitemap** (v4+) — Automated XML sitemap for large content sites
- **@next/third-parties** — GA4 integration replacing manual gtag setup

**What NOT to use:** Moz Pro (declining relevance), SEMrush (higher cost, stronger PPC), generic WordPress SEO plugins

### Expected Features

**Must have (table stakes):**
- XML sitemap with all pages indexed — search engine crawlers need this to discover content
- Core Web Vitals passing (LCP < 2.5s, CLS < 0.1, FID < 100ms) — direct ranking factor
- Unique meta tags per page (title, description, canonical) — prevents duplicate content dilution
- JSON-LD schema (Organization, WebPage, Service) — rich results eligibility
- robots.ts crawl control — prevent accidental blocking

**Should have (competitive differentiators):**
- Hub-and-spoke content architecture with pillar pages for "factory visit China" keyword cluster
- BreadcrumbList schema on all pages — sitelinks eligibility in SERPs
- Article schema on blog posts — rich indexing for resource content
- Australian-localized content (ChAFTA guides, import regulations) — competitor moat
- Team expertise/E-E-A-T signals visible on all pages — trust building for B2B buyers

**Defer (v2+):**
- Video schema for Remotion content — lower priority after text content established
- Image sitemap — secondary to core sitemap
- Review/aggregate rating schema — trust signals but require existing reviews
- Speakable specification for voice search — premature for B2B audience

### Architecture Approach

WAG's current flat site structure (homepage, services, about, resources, enquiry) lacks the hierarchical depth search engines expect for topical authority. The recommended architecture implements a hub-and-spoke model where `/services` acts as a hub linking to dedicated service detail pages (`/services/factory-tours`, `/services/supplier-verification`), and `/resources` links to topic clusters organized around keywords like "factory visit China" and "Australia China sourcing."

Schema implementation requires converting all JSON-LD components to Server Components (not Client Components with `'use client'`) to ensure proper indexing before JavaScript execution. The root layout should output Organization + LocalBusiness schema once, with subsequent pages referencing via `@id` rather than duplicating full Organization schema.

**Major components:**
1. **app/robots.ts** — Next.js MetadataRoute API for crawl control
2. **app/sitemap.ts** — Already exists, needs verification for completeness
3. **app/components/*Schema.tsx** — Server Components for hierarchical schema (WebPage references Organization, Service adds FAQPage, Article adds BreadcrumbList)
4. **app/services/[service]/** — Service detail pages with targeted keywords and full schema
5. **lib/seo/** — Centralized SEO utilities for DRY schema assembly

### Critical Pitfalls

1. **Thin/AI-generated content** — Google's Helpful Content Update demotes sites with quantity-over-quality content. All content must demonstrate unique first-hand expertise, original research, and WAG-specific insights. Prevention: Expert review before publishing, focus on depth over volume.

2. **Duplicate/scraped content** — Using manufacturer descriptions or copying competitor structures triggers Panda demotion. WAG must articulate unique value proposition vs. Epic Sourcing and ChinaDirect. Prevention: Content audit for near-duplicates, canonical tags for similar pages.

3. **E-E-A-T signal weakness** — B2B sourcing is YMYL category held to higher standards. Sites lacking team credentials, first-hand experience descriptions, and trust signals fail to rank for high-intent commercial queries. Prevention: Visible team photos, credentials, "Our team visited this factory region 12 times" narratives.

4. **Core Web Vitals failures** — LCP > 4s, poor mobile scores directly impact rankings. Next.js sites risk image bloat, third-party script delays, excessive re-renders. Prevention: Audit with PageSpeed Insights, use Next/Image with WebP, minimize third-party scripts.

5. **Keyword intent mismatch** — High-volume generic keywords ("import from China") attract price-sensitive shoppers rather than enterprise buyers seeking managed sourcing services. Prevention: Target commercial investigation keywords ("China factory visit service", "Australia China sourcing company"), analyze competitor keyword conversion signals.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Technical Foundation
**Rationale:** All content investment is wasted if search engines cannot crawl, index, or rank the site properly. Core Web Vitals and schema issues must be fixed before publishing content.

**Delivers:**
- `app/robots.ts` implementation
- All `*Schema.tsx` components converted to Server Components
- Canonical URLs on all pages
- BreadcrumbList schema on all pages
- WebPage schema with Organization reference (not duplicate Organization schema)
- On-page fundamentals audit (Screaming Frog crawl)

**Avoids:** Technical SEO Oversights pitfall, On-Page Fundamentals pitfall

### Phase 2: Content Architecture
**Rationale:** Hub-and-spoke structure creates topical authority clusters that distribute PageRank and enable long-tail keyword targeting. Service detail pages address the flat site structure problem identified in architecture research.

**Delivers:**
- Service detail pages (`/services/factory-tours`, `/services/supplier-verification`, `/services/quality-inspection`)
- Resource center hub page with organized topic clusters
- Internal linking strategy connecting pillar pages to spoke content
- First pillar content page targeting "factory visit China" keyword

**Uses:** Screaming Frog for crawl analysis, Ahrefs for keyword gap vs. competitors

**Implements:** Hub-and-spoke architecture pattern

### Phase 3: Content Development (Authority Building)
**Rationale:** Content must demonstrate genuine E-E-A-T signals to rank for B2B sourcing queries. This phase produces the unique, expertise-driven content that differentiates WAG from competitors.

**Delivers:**
- Pillar content: "The Australian Importer's Complete Guide to China Factory Visits" (2000+ words)
- Trust content: Supplier verification guide, Alibaba red flags article
- Australian localization: ChAFTA explained guide
- Case study (with client permission)
- All content with Article schema

**Addresses:** E-E-A-T pitfall, thin/AI content pitfall (requires expert input and original insights)

**Research Flags:** Phase 3 likely needs deeper research on which specific content topics drive competitor traffic (Ahrefs content gap analysis)

### Phase 4: Authority & Backlink Building
**Rationale:** Competitors have 5+ year head start in link building. WAG must pursue natural link earning through original research and industry relationships, avoiding artificial link schemes that trigger Penguin.

**Delivers:**
- Backlink gap analysis vs. Epic Sourcing and ChinaDirect
- Guest post outreach to manufacturing/sourcing publications
- Industry association relationships (Australian chambers of commerce)
- Original research/data assets for earned links
- Proactive toxic link disavowal

**Avoids:** Toxic/Artificial Backlink Profile pitfall

### Phase Ordering Rationale

- **Technical foundation first:** Schema and Core Web Vitals must be correct before content investment
- **Architecture before content:** Hub-and-spoke structure enables content clusters; publishing content into flat structure wastes PageRank
- **Content before link building:** Need quality content assets to attract natural links; link building on thin content provides no ranking benefit
- **E-E-A-T throughout:** Team expertise, first-hand experience must be visible in Phase 1 already (about page, team section)

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Content Development):** Needs Ahrefs content gap analysis to validate which specific topics to prioritize; research here will confirm or adjust MVP content list
- **Phase 4 (Authority Building):** Needs competitor backlink source analysis to identify guest post opportunities

Phases with standard patterns (skip research-phase):
- **Phase 1 (Technical Foundation):** Well-documented Next.js Metadata API patterns, established schema implementations
- **Phase 2 (Content Architecture):** Hub-and-spoke is established SEO pattern with clear implementation steps

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Based on industry-standard tools (Ahrefs, Screaming Frog, Lighthouse); some pricing/plans may need budget validation |
| Features | MEDIUM | Competitor analysis based on website structure; actual content gaps need Ahrefs audit to confirm |
| Architecture | MEDIUM | Based on Next.js documentation and SEO best practices; some gaps may emerge during implementation |
| Pitfalls | MEDIUM-HIGH | Google algorithm guidance is official documentation; B2B E-E-A-T signals well-established |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Competitor backlink profiles:** Exact backlink sources and domain ratings for Epic Sourcing and ChinaDirect need Ahrefs audit to prioritize link building outreach
- **Keyword volume data:** STACK.md references keyword difficulty but actual search volumes and intent classification need Ahrefs/SE Monitor validation
- **Content topic validation:** MVP content list is researcher-assessed; actual performance should be validated with traffic projections before full investment
- **Team E-E-A-T assets:** Availability of team photos, credentials, China experience descriptions for Phase 1 E-E-A-T implementation needs confirmation

## Sources

### Primary (HIGH confidence)
- [Next.js Metadata API Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — App Router metadata patterns
- [Google Structured Data Guidelines](https://developers.google.com/search/docs/structured-data) — Schema implementation standards
- [Schema.org Documentation](https://schema.org/docs/schemas.html) — JSON-LD reference
- [Google Search Central "Helpful Content Update"](https://developers.google.com/search/docs/appearance/structured-data/organization) — Content quality signals
- [Google Search Quality Evaluator Guidelines](https://developers.google.com/search/docs/appearance/structured-data/organization) — E-E-A-T standards

### Secondary (MEDIUM confidence)
- [Screaming Frog SEO Spider v20](https://www.screamingfrog.co.uk/seo-spider/) — Technical audit patterns
- [Ahrefs features and pricing](https://ahrefs.com) — SEO intelligence platform
- [Moz "Duplicate Content and SEO"](https://moz.com/learn/seo/duplicate-content) — Duplicate content guidance
- [Search Engine Journal "Mobile SEO Mistakes"](https://www.searchenginejournal.com/mobile-seo-mistakes/) — Mobile-first considerations
- ChinaDirect Sourcing website structure analysis (2026-03-20)
- Jingsourcing blog content categories (2026-03-20)

### Tertiary (LOW confidence)
- SEmonitor pricing and feature details — needs verification against current product
- Sitebulb Cloud feature parity with Screaming Frog — team preference dependent

---
*Research completed: 2026-03-20*
*Ready for roadmap: yes*
