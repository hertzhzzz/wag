# Technology Stack: SEO Automation

**Project:** WAG Website SEO Automation
**Researched:** 2026-03-18
**Focus:** Achieving #1 ranking for "epic sourcing" and "china direct" in Google Australia

## Recommended Stack

### Core SEO Platforms

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Semrush** | Pro Plan | All-in-one SEO platform | Industry-leading keyword research (25B+ keywords), position tracking for Australian market, competitive analysis, site audits. Essential for ranking competitive terms. |
| **Google Search Console** | Free | Search performance monitoring | Free official Google data for ranking positions, click-through rates, indexing status. Critical for tracking "epic sourcing" and "china direct" rankings. |
| **Google Analytics 4** | Free | Traffic and conversion tracking | Official Google analytics. Tracks organic traffic, user behavior, conversions from SEO efforts. Integration with Search Console. |

### Content & Content Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Existing: MDX + gray-matter** | Current | Blog content authoring | Already implemented in project. Continue using for SEO blog content. |
| **Content Scheduling** | - | Systematic publishing | Use existing tools or simple calendar system to maintain consistent content output for SEO growth |

### Technical SEO (Next.js Integration)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **next-sitemap** | ^4.x | Automatic sitemap generation | Generates sitemap.xml and robots.txt automatically during build. Critical for Google indexing. |
| **Schema.org (JSON-LD)** | - | Structured data markup | Native Next.js metadata API supports JSON-LD. Add Organization, Service, FAQPage schemas for rich snippets. |
| **Next.js Metadata API** | Built-in | Meta tags, Open Graph | Native App Router support for dynamic metadata. No additional dependency needed. |

### Backlink & Authority Building

| Technology | Purpose | Why |
|------------|---------|-----|
| **Google Business Profile** | Local SEO Australia | Free listing. Critical for local Australian searches. Optimize with accurate NAP (Name, Address, Phone), photos, services. |
| **HARO (Help A Reporter Out)** | Backlink acquisition | Connect journalists with sources. Earn backlinks from authoritative news sites. |
| **Guest Posting** | Quality backlinks | Target Australian and B2B procurement publications for relevant backlinks. |

### Analytics & Monitoring

| Technology | Purpose | Why |
|------------|---------|-----|
| **Google Search Console** | Rank monitoring | Track specific keywords "epic sourcing", "china direct" positions in Australia |
| **Semrush Position Tracking** | Extended tracking | More detailed SERP features tracking, competitor comparisons |
| **PageSpeed Insights** | Core Web Vitals | Monitor LCP, FID, CLS. Already achieving 89 score, continue optimizing to <2.5s LCP |

## Integration with Existing Stack

The existing WAG stack (Next.js 14.2, Tailwind CSS, TypeScript, Vercel) requires minimal additions for SEO automation:

```bash
# Install next-sitemap for automatic sitemap generation
npm install next-sitemap
```

**Configuration:** Add to `next-sitemap.config.js`:
```javascript
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.winningadventure.com.au',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
}
```

**Update package.json:**
```json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| SEO Platform | Semrush | Ahrefs | Semrush has stronger Australian market data and position tracking for specific geo-targeting |
| Analytics | GA4 | Plausible/Pirate | GA4 has official Google integration and Search Console linking. Privacy alternatives may lack local market features |
| Sitemap | next-sitemap | Manual XML | Automation is critical for systematic content publishing. Manual updates won't scale |

## Installation

```bash
# Core SEO tools (external platforms - no installation)
# - Sign up for Semrush Pro
# - Set up Google Search Console
# - Configure Google Analytics 4

# Next.js integration
npm install next-sitemap
```

## Sources

- Semrush 2026 Tutorial (99signals.com)
- Backlinko Best Free SEO Tools 2026
- Next.js Official Documentation (nextjs.org)
- Google Search Console Help
- TechnicalSEO.com Tools

---

**Confidence:** MEDIUM - Based on current 2026 search results and established industry standards. Recommend validating specific Australian market features with Semrush trial.
