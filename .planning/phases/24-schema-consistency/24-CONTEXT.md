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
- Remove Andy Liu LinkedIn from PersonSchema (personal LinkedIn does not exist)
- Fix server-rendered PersonSchema (currently uses useEffect — AI crawlers miss this)
- Fix server-rendered ArticleSchema and BreadcrumbSchema (already use direct `<script>` tags — no fix needed)
- Add ABN verification link

**Out of scope:**
- Schema changes to blog articles (Phase 25)
- Content creation (Phase 25)
</domain>

<decisions>
## Implementation Decisions

### Geographic Standards (from Phase 23)
- **areaServed**: Australia only — confirmed by stakeholders
- **Supplier count**: 500+ — standardized across all pages
- **Industry count**: 50+ — standardized across all pages
- **China operations**: Guangdong Province only (Shenzhen, Foshan, Guangzhou)
- **No Zhengzhou/Shaanxi** references in any schema

### ABN Verification
- **ABN**: 30 659 034 919
- **Verification URL**: https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919

### Andy Liu LinkedIn
- **Decision**: Remove LinkedIn URL from PersonSchema sameAs — Andy Liu does not have a personal LinkedIn profile
- Remove `"https://www.linkedin.com/in/andyliu-wag"` from sameAs array

### /enquiry BreadcrumbSchema
- **Breadcrumb trail**: Home > Enquiry
- Items: `[{ name: 'Home', url: 'https://www.winningadventure.com.au' }, { name: 'Enquiry', url: 'https://www.winningadventure.com.au/enquiry' }]`
- **Rationale**: Enquiry is a top-level page, not a child of Services

### Server-Side Rendering
- **PersonSchema** (`app/components/PersonSchema.tsx`): Convert from `'use client'` + `useEffect` approach to direct `<script dangerouslySetInnerHTML>` rendering — same pattern as ArticleSchema
- **ArticleSchema** (`app/components/ArticleSchema.tsx`): Already uses `<script dangerouslySetInnerHTML>` directly — no fix needed, already server-compatible
- **BreadcrumbSchema** (`app/components/BreadcrumbSchema.tsx`): Already uses `<script dangerouslySetInnerHTML>` directly — no fix needed, already server-compatible
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 23 Context
- `.planning/phases/23-ai-crawler-infrastructure/23-CONTEXT.md` — Geographic decisions, ABN URL
- `.planning/ROADMAP.md` — Phase 24 scope and success criteria

### Requirements
- `.planning/REQUIREMENTS.md` — GEO-03, GEO-04, GEO-05, GEO-06

### Codebase Files
- `app/components/PersonSchema.tsx` — Andy Liu Person schema (needs LinkedIn removal + server-fix)
- `app/components/BreadcrumbSchema.tsx` — Breadcrumb schema component
- `app/components/ArticleSchema.tsx` — Article schema (already server-compatible)
- `app/about/page.tsx` — Andy Liu Person schema usage location
- `app/enquiry/page.tsx` — BreadcrumbSchema target page
- `app/enquiry/EnquiryForm.tsx` — Client component, no schema here
- `app/resources/[slug]/page.tsx` — ArticleSchema and BreadcrumbSchema usage

### Prior Phase Context
- Phase 23 decisions on standardized numbers and geographic scope
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- JSON-LD script components already exist in codebase
- Organization and Person schemas already partially implemented
- BreadcrumbSchema component accepts `items` array prop — ready for reuse on /enquiry

### Established Patterns
- Next.js App Router with server components
- JSON-LD via `<script type="application/ld+json">` with `dangerouslySetInnerHTML`
- ArticleSchema and BreadcrumbSchema already use server-compatible pattern
- PersonSchema currently uses `useEffect` pattern (PROBLEMATIC — needs conversion)

### Integration Points
- PersonSchema: imported in `app/about/page.tsx`
- BreadcrumbSchema: imported in `app/about/page.tsx` and `app/resources/[slug]/page.tsx`
- ArticleSchema: imported in `app/resources/[slug]/page.tsx`
- /enquiry page (`app/enquiry/page.tsx`) currently has no schema components — needs BreadcrumbSchema added
</code_context>

<specifics>
## Specific Ideas

- ABN verification URL: `https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919`
- Standardized numbers: 500+ suppliers, 50+ industries
- Geographic: Australia HQ, China as supplier location (Guangdong only)
- Andy Liu has NO personal LinkedIn — remove from PersonSchema
- /enquiry breadcrumb: Home > Enquiry only
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 24-schema-consistency*
*Context gathered: 2026-03-25*
