# Phase 24: Schema Consistency - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix schema inconsistencies across WAG site and complete remaining GEO schema gaps. Ensure all Schema.org structured data is accurate, properly rendered, and aligned with Phase 23 decisions.

**In scope:**
- Fix geographic consistency: Schema areaServed Australia, content clarifies China as supplier location
- Standardize numbers: 500+ suppliers, 50+ industries across all pages
- Add BreadcrumbSchema to /enquiry page
- Fix Andy Liu LinkedIn in Organization schema (personal profile)
- Add ABN verification link
- Fix server-rendered ArticleSchema and BreadcrumbSchema (currently use useEffect)

**Out of scope:**
- Schema changes to blog articles (Phase 25)
- Content creation (Phase 25)
</domain>

<decisions>
## Implementation Decisions (from Phase 23)

### Geographic Standards
- **areaServed**: Australia only — confirmed by stakeholders
- **Supplier count**: 500+ — standardized across all pages
- **Industry count**: 50+ — standardized across all pages

### ABN Verification
- **ABN**: 30 659 034 919
- **Verification URL**: https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919

### Geographic Data
- **China operations**: Guangdong Province only (Shenzhen, Foshan, Guangzhou)
- **No Zhengzhou/Shaanxi** references in any schema

## Gray Areas (Need Discussion)

### 1. Andy Liu LinkedIn URL
- Organization schema needs personal LinkedIn, not company page
- **Question**: What is Andy Liu's personal LinkedIn profile URL?

### 2. BreadcrumbSchema for /enquiry
- What breadcrumb trail for /enquiry page?
- Options: Home > Enquiry OR Home > Services > Enquiry

### 3. ArticleSchema Server-Rendering
- Current implementation uses useEffect — AI crawlers miss these
- Fix approach: Move JSON-LD generation to server component

### 4. BreadcrumbSchema Server-Rendering
- Same issue as ArticleSchema — useEffect causes AI crawlers to miss
- Fix approach: Same as ArticleSchema
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 23 Context
- `.planning/phases/23-ai-crawler-infrastructure/23-CONTEXT.md` — Geographic decisions, ABN URL
- `.planning/ROADMAP.md` — Phase 24 scope and success criteria

### Requirements
- `.planning/REQUIREMENTS.md` — GEO-03, GEO-04, GEO-05, GEO-06

### Codebase
- `app/layout.tsx` — Organization schema location
- `app/about/page.tsx` — Andy Liu Person schema
- `app/enquiry/page.tsx` — BreadcrumbSchema target
- `app/resources/[slug]/page.tsx` — ArticleSchema

### Prior Phase Context
- Phase 23 decisions on standardized numbers and geographic scope
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- JSON-LD script components already exist in codebase
- Organization and Person schemas already partially implemented

### Established Patterns
- Next.js App Router with server components
- JSON-LD via <script> tags in head
- useEffect currently used for schema rendering (problematic)

### Integration Points
- Organization schema in layout.tsx
- ArticleSchema in blog post pages
- BreadcrumbSchema needs new implementation for /enquiry
</code_context>

<specifics>
## Specific Ideas

- ABN verification link: `https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919`
- Standardized numbers: 500+ suppliers, 50+ industries
- Geographic: Australia HQ, China as supplier location
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 24-schema-consistency*
*Context gathered: 2026-03-25*
