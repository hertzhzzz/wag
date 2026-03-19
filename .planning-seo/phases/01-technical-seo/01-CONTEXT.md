# Phase 1: Technical SEO Foundation - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>

## Phase Boundary

Fix critical technical SEO issues so search engines can discover, crawl, and index all WAG website content correctly. Deliverables: dynamic sitemap, server-side schema, correct metadata, proper canonical URLs.

</domain>

<decisions>

## Implementation Decisions

### Sitemap approach
- [auto] Delete static `public/sitemap.xml` — use `next-sitemap` package for dynamic generation
- next-sitemap config should include all blog posts, services, and pages
- Priority: homepage 1.0, services 0.9, blog posts 0.8, other pages 0.7

### FAQSchema component
- [auto] Convert FAQSchema.tsx from 'use client' to server component (remove 'use client' directive)
- Schema should be injected via `<script type="application/ld+json">` in server component

### Blog metadata
- [auto] Fix `generateMetadata` in `app/resources/[slug]/page.tsx` to use `primaryKeyword` and `secondaryKeywords` from frontmatter instead of hardcoded array
- Each blog post should have unique meta description derived from frontmatter `description` field

### Article schema
- [auto] Add `@type: 'TechArticle'` schema to all blog posts in `[slug]/page.tsx`
- Include: headline, author (Andy Liu), datePublished, dateModified, publisher

### Breadcrumb schema
- [auto] Add `BreadcrumbList` schema to blog post pages showing: Home > Resources > [Post Title]
- Use `app/components/` structure — create BreadcrumbSchema.tsx if not exists

### Canonical URLs
- [auto] Verify all pages have correct canonical URLs pointing to `https://www.winningadventure.com.au`
- Ensure no self-referencing canonical issues

### Claude's Discretion
- Exact implementation of next-sitemap configuration (defaults acceptable)
- How to structure BreadcrumbSchema.tsx component (standard approach)

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### SEO Project Context
- `.planning-seo/PROJECT.md` — WAG SEO project vision, target keywords
- `.planning-seo/REQUIREMENTS.md` — TECH-01 through TECH-06 requirements
- `.planning-seo/research/SUMMARY.md` — Key findings from research

### WAG Website Codebase
- `app/layout.tsx` — Current metadata, Organization/LocalBusiness schema structure
- `app/components/FAQSchema.tsx` — Current client component that needs conversion
- `app/resources/[slug]/page.tsx` — Blog post page with generateMetadata
- `public/robots.txt` — Current robots configuration
- `app/sitemap.ts` — Current dynamic sitemap generation

</canonical_refs>

<codebase_context>

## Existing Code Insights

### Reusable Assets
- `app/components/FAQSchema.tsx` — Template for server component conversion
- `app/components/ServiceSchema.tsx` — Reference for JSON-LD schema pattern
- `app/sitemap.ts` — Reference for dynamic sitemap generation

### Established Patterns
- Next.js Metadata API for SEO metadata
- JSON-LD schema via inline `<script>` tags
- MDX with gray-matter frontmatter (primaryKeyword, secondaryKeywords fields exist)

### Integration Points
- Changes affect: `app/resources/[slug]/page.tsx`, `app/components/FAQSchema.tsx`, `public/robots.txt`
- new sitemap.ts should replace the need for public/sitemap.xml on Vercel deployment

</codebase_context>

<deferred>

## Deferred Ideas

None — discussion stayed within phase scope (Technical SEO Foundation)

</deferred>

---

*Phase: 01-technical-seo*
*Context gathered: 2026-03-19*
*Auto-advance: proceeding to plan-phase*
