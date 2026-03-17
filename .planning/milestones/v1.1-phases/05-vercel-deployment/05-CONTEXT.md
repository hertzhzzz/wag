# Phase 5: Vercel Deployment - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy website to Vercel production environment and fix mobile navigation issues. This includes deploying to Vercel with custom domain, fixing mobile sidebar transparency issue, and adding Facebook social link to Footer.

</domain>

<decisions>
## Implementation Decisions

### Mobile Sidebar Background Fix
- Fix sidebar menu background to be pure white (`bg-white`)
- Ensure background is fully opaque, not transparent
- Location: `frontend/app/components/Navbar.tsx` - mobile slide-in menu

### Vercel Deployment
- Use Git auto-deployment (connect GitHub repo, auto-deploy on push)
- Custom domain: winningadventure.com.au
- Configure SSL certificate
- Set up environment variables (Supabase, Resend) in Vercel

### Facebook Social Link
- Add Facebook link to Footer, next to existing LinkedIn button
- Use same button style as LinkedIn for consistency
- Location: `frontend/app/components/Footer.tsx` - Brand column

### Success Criteria
- Website accessible at winningadventure.com.au
- HTTPS working with valid SSL certificate
- Mobile sidebar has solid white background
- Facebook link visible in Footer

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, MOBILE-01, MOBILE-02, SOCIAL-01

### Project Context
- `.planning/ROADMAP.md` — Phase 5 goal and success criteria
- `.planning/PROJECT.md` — Current milestone v1.1 details
- `.planning/STATE.md` — Project state and accumulated context

### Code Files
- `frontend/app/components/Navbar.tsx` — Mobile sidebar menu (lines 79-142)
- `frontend/app/components/Footer.tsx` — Social links section (lines 17-28)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Navbar component already has mobile menu structure
- Footer has LinkedIn button as reference for social link styling

### Established Patterns
- Navbar uses `fixed top-0` positioning with scroll detection
- Footer social link uses button style with icon + text

### Integration Points
- Navbar.tsx: Add `bg-white` to ensure opaque background on mobile menu
- Footer.tsx: Add Facebook link button next to LinkedIn button in Brand column

</code_context>

<specifics>
## Specific Ideas

- User reported: "mobile navbar no longer stays at top when scrolling down, can't click navbar unless scroll to top" - actually the issue is hamburger menu sidebar background becomes transparent
- User wants pure white background for mobile sidebar menu
- User prefers Git auto-deployment for Vercel
- User wants Facebook link next to existing LinkedIn in Footer

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-vercel-deployment*
*Context gathered: 2026-03-17*
