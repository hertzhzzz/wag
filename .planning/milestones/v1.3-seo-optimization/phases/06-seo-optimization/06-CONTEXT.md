# Phase 6: SEO Optimization - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Optimize website for "china sourcing" keyword ranking in Australia. Implement technical SEO improvements, content strategy with targeted blog articles, and structured data to achieve top rankings in Google Australia.

**Out of scope:** Paid advertising, link building campaigns, email marketing

</domain>

<decisions>
## Implementation Decisions

### Keyword Strategy
- Primary: "china sourcing", "china sourcing australia"
- Secondary: "factory visit china", "china sourcing adelaide", "sourcing trip china", "china factory tour"
- Target geographic: Australia (Google.com.au)

### Content Strategy
- Create 4-6 targeted blog articles targeting long-tail keywords
- Focus on informational content (how-to guides, comparison articles)
- Existing blog content in content/blog/ will be optimized
- Topics: factory visit guide, supplier verification, procurement tips

### Technical SEO Priority
- Page-level metadata optimization (unique titles, descriptions per page)
- Structured data (Organization, LocalBusiness, Service schema)
- Internal linking strategy
- Image alt text optimization
- Sitemap optimization (already exists)
- Core Web Vitals focus

### Local SEO
- Optimize for Adelaide-based business
- Use location-specific structured data
- Target "adelaide" keyword variations

### Measurement
- Track keyword rankings monthly
- Monitor organic traffic via Google Analytics
- Set up Google Search Console if not already

### Blog Content Topics (Priority Order)
1. "How to Verify a Chinese Supplier" - informational
2. "Factory Visit China Guide" - informational
3. "China Sourcing Risks & How to Mitigate" - pain point
4. "Bulk Procurement China Guide" - already exists, optimize
5. "China vs Alibaba - Which is Better for Australian Businesses" - comparison
6. "Sourcing Trip Planning Checklist" - actionable

</decisions>

<canonical_refs>
## Canonical References

### Project Context
- `.planning/ROADMAP.md` — Phase 6 goal and requirements
- `./CLAUDE.md` — Project conventions and tech stack
- `app/layout.tsx` — Existing metadata and structured data
- `app/sitemap.ts` — Existing sitemap configuration

### Technical SEO References
- Next.js Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Google Structured Data: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `app/layout.tsx` — Has metadata, OpenGraph, JSON-LD structured data (Organization, LocalBusiness)
- `app/sitemap.ts` — Dynamic sitemap generation for blog articles
- `content/blog/` — Has 4 existing blog articles in MDX format
- `app/components/FAQ.tsx` — Has FAQSchema component for structured data

### Established Patterns
- Uses Next.js 14 App Router with TypeScript
- Tailwind CSS for styling
- MDX for blog content with frontmatter (title, description, keywords, etc.)
- IBM Plex fonts (Sans + Serif)

### Integration Points
- New metadata will go in individual page.tsx files
- New structured data can use existing JSON-LD pattern in layout.tsx
- Blog articles use content/blog/*.mdx with gray-matter frontmatter

</codebase_context>

<specifics>
## Specific Ideas

- Goal: Rank #1 for "china sourcing" in Google Australia within 3-6 months
- No budget for paid advertising
- Content marketing is primary growth channel
- Adelaide-based business should appear in local results

</specifics>

<deferred>
## Deferred Ideas

- Link building campaigns — future phase
- Paid search (Google Ads) — explicitly out of scope
- Email newsletter — separate marketing initiative

</deferred>

---

*Phase: 06-seo-optimization*
*Context gathered: 2026-03-17*
