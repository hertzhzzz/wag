# Phase 10: Content Strategy - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Create high-quality blog content to compete with Epic Sourcing and ChinaDirect. Includes 3 SEO-optimized blog guides, FAQ section with Schema markup, and service page keyword optimization.

</domain>

<decisions>
## Implementation Decisions

### Content Topics
- **"How to Import from China" guide**: Australia Market Focus — target "importing to Australia tips", "Australia China trade", "Australian import regulations"
- **"China Supplier Verification" guide**: Due Diligence Focus — factory verification steps, red flags, how to avoid scams
- **"Australia Import Tips" guide**: Regulations Focus — customs duties, GST, quarantine requirements, product compliance
- **Content length**: Detailed (1500-2200 words) per existing BLOG_PROMPT.md guidelines

### FAQ Implementation
- **Placement**: Inline on existing pages (services, about) — accordion-style sections
- **Quantity**: 10-15 questions
- **Topics**: Service Questions focus (sourcing process, timelines, costs, how WAG helps)
- **Schema**: FAQPage JSON-LD schema for SEO

### Service Page Keywords
- **Keyword type**: High-intent commercial keywords — "factory visit", "supplier sourcing", "China procurement"
- **Pages to optimize**: All service pages + homepage

### Content Generation Process
- **Method**: Use /skill wag-seo-blog for each article, following existing BLOG_PROMPT.md guidelines
- **Quality**: Follow existing brand tone —务实, 直接, 有经验, 可信

### Claude's Discretion
- Exact FAQ question text and wording
- Specific H2/H3 structure within each guide
- Internal linking strategy between guides
- Service page content additions vs metadata-only optimization

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Content System
- `content/BLOG_PROMPT.md` — Full content generation guidelines, brand voice rules, MDX structure requirements
- `content/BLOG_QA_PROMPT.md` — Quality assurance guidelines for blog content
- `app/resources/page.tsx` — Blog listing page implementation

### SEO Requirements
- `.planning/REQUIREMENTS.md` — CONT-01 through CONT-05 requirements

### Prior Phase Context
- `.planning/phases/09-technical-seo-foundation/09-CONTEXT.md` — Technical SEO decisions

### No external specs
- No external specs — requirements fully captured in decisions above

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Blog system: MDX files in `content/blog/`, frontmatter via gray-matter
- 6 existing blog posts already published
- `/skill wag-seo-blog` — Existing skill for generating SEO blog content
- Service pages exist at `/services` and individual route pages

### Established Patterns
- Blog uses: title, seoTitle, description, category, author, date, readTime, subtitle, desc, coverImage, primaryKeyword, secondaryKeywords, tags, ctaTitle, ctaText, ctaButtonText, takeaways
- Component pattern: `<Tip>`, `<InlineCTA />` per section
- FAQ accordion likely reusable component pattern

### Integration Points
- Blog posts: Add new .mdx files to `content/blog/`
- FAQ: Add inline section to service pages with FAQPage schema
- Service pages: Update metadata + add keyword-rich content sections

</code_context>

<specifics>
## Specific Ideas

- "How to Import from China" guide should anchor to Australian market context throughout
- "China Supplier Verification" guide should include practical red flags and verification checklist
- "Australia Import Tips" should cover customs, GST, quarantine, compliance
- FAQ should answer common questions from Australian importers
- Use wag-seo-blog skill with specific keywords per guide

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-content-strategy*
*Context gathered: 2026-03-18*
