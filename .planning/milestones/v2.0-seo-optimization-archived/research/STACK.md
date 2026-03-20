# Stack Research: SEO Competitor Analysis Tools

**Domain:** SEO Competitor Analysis Tools for Surpassing Epic Sourcing and ChinaDirect Sourcing
**Project:** WAG Website v2.0 SEO Optimization
**Researched:** 2026-03-20
**Confidence:** MEDIUM

## Executive Summary

To surpass Epic Sourcing Australia (epicsourcing.com.au) and ChinaDirect Sourcing (chinadirectsourcing.com.au) in Google Australia rankings, WAG needs a layered SEO tool stack covering: (1) competitor backlink intelligence, (2) technical site auditing, (3) rank tracking, and (4) ongoing monitoring. The core recommendation is **Ahrefs** as the primary SEO intelligence platform because it offers the most comprehensive backlink database, combined with **Screaming Frog SEO Spider** for deep technical crawling, and **Google Search Console** (free) for owned-site performance. For Next.js CI/CD integration, use **Lighthouse CLI** and **vercel-seo-audit**.

## Recommended Stack

### Core SEO Intelligence Platform

| Technology | Version/Plan | Purpose | Why Recommended |
|------------|--------------|---------|-----------------|
| **Ahrefs** | Webmaster or higher ($99/mo) | Backlink analysis, competitor research, keyword discovery | Industry-standard backlink database (12+ trillion links), fastest crawl updates, competitor gap analysis reveals link opportunities WAG is missing from Epic Sourcing and ChinaDirect Sourcing |
| **Google Search Console** | Free | Owned-site performance, indexing status, Core Web Vitals | Official Google data source; required for monitoring DA 20+ progress; zero cost |
| **Google Lighthouse CLI** | Latest (via npm) | Automated technical SEO auditing | Native Next.js support; CI/CD integration for pre-deploy checks; catches issues before production |

### Site Crawling and Technical Audit

| Technology | Version/Plan | Purpose | Why Recommended |
|------------|--------------|---------|-----------------|
| **Screaming Frog SEO Spider** | v20+ (GBP 199/yr) | Desktop crawler for deep technical audit | Finds 300+ SEO issues (broken links, missing meta, canonical problems); essential for Next.js SSR/SPAs where JavaScript rendering matters |
| **Sitebulb Cloud** | Pro plan | Visual technical SEO reporting | Better UX than Screaming Frog; cloud-based (no local install); strong for presenting audit results to stakeholders |
| **vercel-seo-audit** | Latest (npm) | Next.js-specific SEO audit | Built specifically for Vercel deployments; catches Next.js metadata, OG tags, sitemap issues |

### Rank Tracking

| Technology | Version/Plan | Purpose | Why Recommended |
|------------|--------------|---------|-----------------|
| **SEmonitor** | Pro ($74/mo) | Automated rank tracking + competitor monitoring | Tracks WAG and competitor rankings side-by-side; includes keyword grouping for Australia targeting; 2026 updates include AI Overview tracking |
| **Pro Rank Tracker** | Pro ($99/mo) | SERP tracking with API access | Good API for custom dashboards; tracks AI Overviews which is critical in 2026 search landscape |

### Supporting Libraries (Next.js Integration)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next-sitemap` | v4+ | Automated XML sitemap generation | Keeps Googlebot informed of all pages; required for large content sites |
| `@next/third-parties` | Latest | Google Analytics 4 integration | Sending performance events to GA4; replaces manual gtag setup |
| `next-robots.txt` | Via Next.js config | Crawl directive management | Controls what search engines access; essential for SEO control |

## Installation

```bash
# Core SEO tools (CLI)
npm install -g lighthouse  # Google Lighthouse CLI
npm install -g @sitebulb/audit  # Sitebulb CLI if available

# Next.js SEO libraries
npm install next-sitemap @next/third-parties

# Development dependencies
npm install -D prettier eslint-plugin-next
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|------------------------|
| Ahrefs | SE Ranking | If budget is tight ($39/mo vs $99/mo) but need similar backlink analysis |
| Screaming Frog | Sitebulb | If team prefers cloud-based UI over desktop application |
| SEmonitor | Pro Rank Tracker | If need more flexible API integrations for custom dashboards |
| Lighthouse CLI | PageSpeed Insights API | For programmatic scoring in CI/CD pipelines without local Chrome |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Moz Pro | Declining relevance after founder Rand Fishkin left; backlink index significantly smaller than Ahrefs; slower updates | Ahrefs |
| SEMrush | Higher cost ($120+/mo); less intuitive backlink analysis; stronger for PPC than organic SEO | Ahrefs or SE Ranking |
| Free backlink checker tools | Severe data limitations (500 URLs max); incomplete for competitive analysis | Ahrefs Webmaster ($29/mo) for basic backlink monitoring |
| Generic SEO plugins (Yoast, Rank Math) | Built for WordPress; not applicable to Next.js | next-sitemap + manual metadata |
| Unverified "SEO automation" tools | Data accuracy questionable; no track record | Established names above |

## SEO Tool Categories for Competitor Analysis

To beat Epic Sourcing and ChinaDirect Sourcing, WAG must analyze across these dimensions:

### 1. Backlink Profile Comparison
- **What to analyze**: Total backlinks, referring domains, Domain Rating (DR), link velocity, anchor text distribution
- **Tool**: Ahrefs Site Explorer
- **Why**: Both competitors have 5+ year head start in link building; WAG must identify their high-value links and pursue similar sources

### 2. Keyword Gap Analysis
- **What to analyze**: Keywords Epic Sourcing and ChinaDirect rank for that WAG does not
- **Tool**: Ahrefs Content Gap or SE Ranking Keyword Gap
- **Why**: Reveals content opportunities (e.g., "factory visit China cost", "Australia China supplier verification")

### 3. Technical SEO Audit
- **What to analyze**: Crawl errors, Core Web Vitals, meta completeness, schema markup, JavaScript rendering
- **Tool**: Screaming Frog + Lighthouse CI
- **Why**: Both competitors may have technical debt; WAG can exploit with superior site health scores

### 4. SERP Feature Capture
- **What to analyze**: Who owns featured snippets, "People Also Ask", local packs, AI Overviews
- **Tool**: Ahrefs or SEmonitor
- **Why**: In 2026, AI Overviews and SERP features capture significant clicks; need to optimize for and own these

### 5. Local SEO Presence
- **What to analyze**: Google Business Profile, local citations (Yelp, Yellow Pages, True Local), reviews
- **Tool**: Google Business Profile (free) + BrightLocal or Localo
- **Why**: "Australia China supplier" has strong local intent; dominating Google Maps is critical for visibility

## Stack Patterns by Budget

**If limited budget (GBP 500-1000/yr total):**
- Ahrefs Webmaster ($29/mo) for backlink + keyword research
- Google Search Console (free) for owned data
- Screaming Frog (free tier, 500 URLs) for manual audits
- SEmonitor trial for rank tracking verification

**If full capability (GBP 2000+/yr):**
- Ahrefs Standard ($199/mo) for complete backlink + content analysis
- Screaming Frog paid license (GBP 199/yr)
- Sitebulb Pro for visual reporting
- SEmonitor Pro ($74/mo) for automated rank tracking

**For Next.js CI/CD integration:**
- Lighthouse CI + vercel-seo-audit in pre-deploy pipeline
- GitHub Actions to run nightly audits against staging
- Automated Slack/email alerts for critical SEO issues

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `next-sitemap@4.x` | Next.js 14+ App Router | Generates sitemap for dynamic routes; essential for content site |
| `@next/third-parties` | Next.js 14+ | GA4 integration without manual gtag setup |
| `vercel-seo-audit` | Vercel deployments only | Not compatible with other hosting providers |
| Lighthouse CLI | Node 18+ | Use via npx or dedicated CI container image |

## Why Each Tool Matters for WAG Specifically

### Ahrefs
WAG needs to understand why Epic Sourcing and ChinaDirect rank for target keywords. Ahrefs reveals:
- Their exact backlink sources (directories, guest posts, press)
- Keyword gaps WAG has not targeted
- Content that drives their traffic
- Link building opportunities WAG should pursue

### Screaming Frog
Next.js App Router creates JavaScript-rendered pages that require special handling:
- Detects hreflang issues
- Finds duplicate meta descriptions across pages
- Audits internal linking structure
- Identifies pages blocked by robots.txt

### SEmonitor
Weekly rank tracking against specific competitors:
- "China sourcing Australia" keyword group
- "Factory visit China" keyword group
- Geographic targeting (Sydney, Melbourne, Brisbane)
- Automated alerts when competitor outranks WAG

### Lighthouse
Core Web Vitals directly affect Google rankings:
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
- Next.js optimized builds should score 90+ on all metrics

## Sources

- Screaming Frog SEO Spider official site (v20, 2026-01) — https://www.screamingfrog.co.uk/seo-spider/
- Ahrefs features and pricing — https://ahrefs.com (verified via product documentation)
- Sitebulb Cloud features (2026-02) — https://sitebulb.com
- SEmonitor rank tracking (2026-02) — https://www.seomonitor.com
- Pro Rank Tracker pricing (2026-02) — https://proranktracker.com
- 12 Best SEO Tools for 2026 (Backlinko) — https://backlinko.com/best-free-seo-tools (2026-02)
- next-sitemap npm package — https://www.npmjs.com/package/next-sitemap
- vercel-seo-audit GitHub repository (2026-03) — https://github.com/CichyEZ/vercel-seo-audit

---

*Stack research for: SEO Competitor Analysis*
*Researched: 2026-03-20*
