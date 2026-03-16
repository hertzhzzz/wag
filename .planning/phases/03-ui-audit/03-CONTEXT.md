# Phase 3: Global UI Audit + Mobile Adaptation - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Perform comprehensive UI audit across all 5 pages (Home, Services, About, Enquiry, Resources) and fix mobile responsive issues. This phase addresses all remaining responsive issues identified in REQUIREMENTS.md and ensures consistent mobile experience across the entire website.

</domain>

<decisions>
## Implementation Decisions

### Audit Scope + Priority
- **Scope:** All 5 pages comprehensive audit (Home, Services, About, Enquiry, Resources)
- **Order:** Page-by-page sequential — complete each page before moving to next

### Audit Methodology
- **Approach:** Hybrid (Automated + Manual)
- **Automation:** Use browser-use with inherited Chrome profile (existing logged-in browser, not new instance)
- **Manual:** Human verification after automated tests

### Validation Approach
- **Method:** Test-driven
- **Flow:** Write test to verify issue exists → Fix → Verify test passes
- **Tools:** Browser automation for responsive testing

### Fix Strategy
- **Organization:** Issue-type batched
- **Pattern:** Group same issue types together and fix all at once
  - E.g., fix all padding issues across all pages, then all grid issues, then all touch target issues

### Specific Requirements to Address
- FORM-01: Enquiry form inputs usable on mobile without keyboard issues
- FORM-02: Form labels remain visible when input focused on mobile
- FORM-03: Submit button easily accessible on mobile
- All remaining responsive issues from phases 1-2

</decisions>

<canonical_refs>
## Canonical References

### Requirements
- `.planning/REQUIREMENTS.md` — FORM-01, FORM-02, FORM-03 (Enquiry form mobile requirements)

### Prior Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Established responsive patterns (px-4 md:px-8, min-h-11, grid-cols-1 md:grid-cols-N)
- `.planning/phases/02-content-pages/02-CONTEXT.md` — Services and About responsive patterns

### Project
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria

</canonical_refs>

<specifics>
## Specific Ideas

- Continue using responsive patterns established in Phase 1 and 2
- Use inherited Chrome profile for browser automation (user's existing logged-in session)
- Ensure consistency across all 5 pages

</specifics>

.code_context
## Existing Code Insights

### Reusable Assets
- Responsive patterns from Phase 1: px-4 md:px-8 padding, min-h-11 for buttons, grid-cols-1 md:grid-cols-N
- Touch target classes already defined
- Components in frontend/app/components/

### Established Patterns
- Mobile-first responsive: px-4 for mobile, md:px-8/10/12 for desktop
- Touch targets: min-h-11 (44px)
- Grid layouts: grid-cols-1 md:grid-cols-N
- Navigation: Hamburger menu with slide-in panel

### Integration Points
- Enquiry form: frontend/app/enquiry/page.tsx
- Resources page: frontend/app/resources/page.tsx
- All components: frontend/app/components/

</code_context>

<deferred>
## Deferred Ideas

None — all responsive issues for all 5 pages are in scope for this phase.

</deferred>

---

*Phase: 03-ui-audit*
*Context gathered: 2026-03-16*
