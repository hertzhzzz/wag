# Stack Research

**Domain:** SEO Tools and Technical Stack for Australian B2B Sourcing Website
**Researched:** 2026-03-19
**Confidence:** MEDIUM

## Recommended Stack

### Core SEO Tools

| Tool | Plan/Version | Purpose | Why Recommended |
|------|-------------|---------|-----------------|
| Google Search Console | Free | Keyword performance data, indexing status, Core Web Vitals | Primary data source for what keywords already drive traffic; free and authoritative |
| Ahrefs Webmaster Tools | Free | Backlink monitoring, domain authority tracking, competitor backlink analysis | Best free backlink database; limited free tier but sufficient for monitoring |
| Google Keyword Planner | Free (with Google Ads account) | Keyword search volume, competition level, bid estimates | Directly from Google; best for Australian market search volume data |
| Notion | Free/Plus | SEO content calendar, keyword tracking spreadsheet, content pipeline | Simple, visual, works natively with existing workflow |
| Next.js built-in Metadata API | v14.2 (already in use) | Page titles, descriptions, Open Graph, Twitter cards, robots | WAG already uses this well in `app/layout.tsx`; no additional library needed |

### Content Management (Already in Use)

| Technology | Purpose | Why Already Optimal |
|------------|---------|-------------------|
| MDX + gray-matter | Blog content authoring | WAG already has this; keeps content in Git, simple workflow |
| Next.js App Router | Static page generation for blog posts | Generates `/resources/[slug]` routes automatically |
| Contentlayer (optional) | Type-safe MDX content layer | Only add if content complexity grows; currently gray-matter is sufficient |

### Technical SEO (Next.js-Specific)

| Library/Tool | Purpose | Why Use |
|-------------|---------|---------|
| `next-sitemap` | Automated `sitemap.xml` and `robots.txt` generation at build time | Essential for Google discovery; integrates with Next.js build pipeline |
| `next/font` | Self-hosted Google Fonts (already in use) | Improves Core Web Vitals (LCP); WAG already uses IBM Plex via this |
| Vercel Analytics | Core Web Vitals monitoring | Built into Vercel hosting; free tier sufficient for tracking LCP, CLS, FID |

### Rank Tracking

| Tool | Plan | Purpose | Why Recommended |
|------|------|---------|-----------------|
| Google Search Console (manual) | Free | Track keyword positions for target terms | Free, authoritative, already has data for WAG |
| SerpWatch.io | Starter (~$15/month) | Automated rank tracking with Australian Google | Affordable, focused on Australian SERPs, good for small team |
| **or** Nozzle.io | Free tier | Bulk keyword tracking | If budget is tight, free tier works for up to 5 keywords |

### Link Building for Australian B2B

| Platform | Purpose | Why Recommended |
|----------|---------|-----------------|
| HARO (Connectively) | Respond to journalist queries for backlinks | Free; Australian B2B niche has relevant queries; builds contextual links |
| LinkedIn Outreach | Direct link building to Australian businesses | B2B niche; WAG founder Andy Liu can leverage personal network |
| Industry Directories | Aussie B2B directories (e.g., Aussie Business, Australian Business Register) | Local citations strengthen geo-targeting for Google.com.au |
| Guest Posts (manual outreach) | Write for Australian manufacturing/procurement blogs | Highest quality backlinks; time-intensive but durable |

---

## Installation

```bash
# Technical SEO
npm install next-sitemap

# Optional: Content layer (only if content complexity grows)
npm install contentlayer

# Optional: SEO monitoring
npm install @vercel/analytics
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Ahrefs Webmaster (free) | Ahrefs Paid ($99+/month) | When WAG needs daily backlink crawling, not just weekly snapshots |
| Google Keyword Planner | SEMrush ($120+/month) | When detailed competitive gap analysis is critical; overkill for initial SEO |
| Google Keyword Planner | Ahrefs Keywords Explorer ($99+/month) | When Australian search volume by city/region is needed |
| SerpWatch.io | Ahrefs Rank Tracker ($30+/month) | When you need integration with full Ahrefs backlink data |
| next-sitemap | Manual sitemap.xml | Only if Next.js build pipeline has issues; automated is better |
| Notion | SEO spreadsheets (Excel/Google Sheets) | When team is more comfortable with spreadsheets; Notion is more visual |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| SEMrush | $120+/month is enterprise pricing; far beyond SMB needs for initial SEO | Google Keyword Planner + Ahrefs Webmaster (both free) |
| Ahrefs paid plans | $99+/month for full features; free tier sufficient for monitoring | Ahrefs Webmaster (free) for backlink monitoring |
| Scraped keyword data from third-party tools | Often stale, inaccurate for Australian market | GSC actual data + Google Keyword Planner directly |
| Automated link building services | High risk of spammy links that damage domain authority | Manual outreach + HARO + directory citations |
| Yoast SEO (WordPress plugin) | WordPress-specific; WAG is Next.js | Next.js built-in Metadata API (already in use) |
| All-in-one SEO plugins for Next.js | Add unnecessary bloat; WAG already has good metadata in layout.tsx | Built-in Next.js metadata API + next-sitemap only |

---

## Stack Patterns by Variant

**If budget is zero (free only):**
- GSC + Ahrefs Webmaster + Google Keyword Planner + Notion (free tier)
- next-sitemap for technical SEO
- Manual rank checking via GSC
- Rank tracking via simple Notion table

**If budget is ~$15-50/month:**
- Add SerpWatch.io for automated rank tracking with Australian Google targeting
- Add Notion Plus for team collaboration
- Consider Ahrefs Lite ($29/month) only if backlink monitoring becomes critical

**If content volume scales (20+ blog posts/month):**
- Add Contentlayer for type-safe MDX content management
- Add a dedicated SEO writing tool (e.g., Clearscope or MarketMuse) for content optimization
- Consider SEO-focused CMS like Sanity if MDX workflow becomes painful

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `next-sitemap@4.x` | Next.js 14.x, 15.x | Works with App Router; configure in `next-sitemap.config.ts` |
| `next/font` | Next.js 14.2+ | WAG already uses this optimally |
| Contentlayer | Next.js 14.x | May need adjustment for Next.js 15 App Router changes |
| Ahrefs Webmaster | Any website | Free tool; no install needed |

---

## Technical SEO Checklist for WAG (Next.js App Router)

Based on existing `app/layout.tsx`, WAG already has:

- [x] Metadata API with title templates, descriptions, keywords
- [x] Open Graph tags (locale: `en_AU`)
- [x] Twitter card tags
- [x] Canonical URL
- [x] Google verification tag
- [x] Schema.org JSON-LD (Organization + LocalBusiness)
- [x] Google Analytics (GA4)
- [x] Responsive viewport meta tag
- [x] IBM Plex fonts via next/font (good for Core Web Vitals)

**Still needed for complete technical SEO:**

- [ ] `next-sitemap` configuration for automatic sitemap.xml generation
- [ ] robots.txt (can be generated by next-sitemap)
- [ ] Consider adding `application/ld+json` for `Service` schema type (WAG offers factory tours)
- [ ] Consider adding `BreadcrumbList` schema for resource pages
- [ ] Image alt text audit (all Unsplash images should have descriptive alt attributes)
- [ ] Internal linking strategy documentation

---

## Sources

- Google Search Console — [official documentation](https://developers.google.com/search) — HIGH confidence
- Ahrefs Webmaster Tools — [official site](https://ahrefs.com/webmaster-tools) — HIGH confidence
- next-sitemap npm — [package page](https://www.npmjs.com/package/next-sitemap) — HIGH confidence
- Next.js Metadata API — [official docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — HIGH confidence
- Google Keyword Planner — [official documentation](https://ads.google.com/keywordplanner) — HIGH confidence
- SERP tracking comparison (Nozzle, SerpWatch) — 99signals.com — MEDIUM confidence

---

*Stack research for: WAG SEO Project*
*Researched: 2026-03-19*
