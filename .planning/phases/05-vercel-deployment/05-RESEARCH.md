# Phase 5: Vercel Deployment - Research

**Researched:** 2026-03-17
**Domain:** Next.js deployment, mobile navigation, social links
**Confidence:** HIGH

## Summary

This phase involves deploying the WAG website to Vercel production and fixing two UI issues: mobile sidebar transparency and adding Facebook link to Footer. The project already has Next.js 14.2 configured with Vercel settings, making deployment straightforward. The mobile sidebar already has `bg-white` in the code (line 81 of Navbar.tsx), suggesting the issue may be a verification task or the fix hasn't been applied to the local environment yet. Adding Facebook link follows the existing LinkedIn pattern in Footer.tsx.

**Primary recommendation:** Use Vercel Git integration for auto-deployment with environment variables configured in Vercel dashboard. Verify mobile sidebar has solid white background and add Facebook link using same pattern as LinkedIn button.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Mobile Sidebar Background Fix:** Fix sidebar menu background to be pure white (`bg-white`), ensure fully opaque, not transparent. Location: `frontend/app/components/Navbar.tsx` - mobile slide-in menu
- **Vercel Deployment:** Use Git auto-deployment (connect GitHub repo, auto-deploy on push), custom domain: winningadventure.com.au, configure SSL certificate, set up environment variables (Supabase, Resend) in Vercel
- **Facebook Social Link:** Add Facebook link to Footer, next to existing LinkedIn button, use same button style as LinkedIn for consistency. Location: `frontend/app/components/Footer.tsx` - Brand column

### Claude's Discretion

None - all decisions are locked

### Deferred Ideas (OUT OF SCOPE)

None

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEPLOY-01 | Website is deployed to Vercel production environment | Vercel Git auto-deploy workflow documented below |
| DEPLOY-02 | Custom domain winningadventure.com.au is configured and accessible | Vercel custom domain setup documented below |
| DEPLOY-03 | SSL certificate is issued and HTTPS works | Vercel auto-SSL for custom domains |
| DEPLOY-04 | Environment variables (Supabase, Resend) are configured in Vercel | Vercel env var configuration documented below |
| MOBILE-01 | Navbar remains visible when scrolling down on mobile devices | Code shows `fixed top-0` positioning - already implemented |
| MOBILE-02 | Navbar is clickable/tappable when scrolled down on mobile | Code shows z-[100] with proper layering |
| SOCIAL-01 | Facebook link is added to Footer alongside existing LinkedIn | Add similar button pattern to Footer.tsx |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.2 | React framework | Official Vercel-supported framework |
| Vercel | Platform | Deployment | Native Next.js deployment platform |
| Tailwind CSS | 3.4 | Styling | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.575.0 | Icons | For Facebook icon in Footer |

## Architecture Patterns

### Recommended Project Structure
```
frontend/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx      # Mobile sidebar fix (line 81)
│   │   └── Footer.tsx      # Facebook link (lines 17-28)
│   └── ...
├── vercel.json             # Already configured (Node 20.x)
└── package.json            # Next.js 14.2
```

### Pattern 1: Vercel Git Auto-Deploy
**What:** Connect GitHub repository to Vercel for automatic deployments on push
**When to use:** Standard deployment workflow
**Steps:**
1. Import GitHub repo in Vercel dashboard
2. Select "Next.js" framework preset (auto-detected)
3. Add environment variables in Vercel project settings
4. Configure custom domain in Vercel domain settings
5. SSL auto-configures for custom domains

### Pattern 2: Mobile Sidebar Fix
**What:** Ensure mobile sidebar has opaque white background
**Code Location:** `frontend/app/components/Navbar.tsx` line 81
```tsx
// Current code (line 79-84):
<div
  id="mobile-menu"
  className={`fixed right-0 top-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ${
    mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
  }`}
>
```
**Analysis:** Code already has `bg-white` - the fix may need verification or the issue is elsewhere
**If transparency persists:** Add `bg-white` explicitly with `!important` or verify no opacity is being inherited

### Pattern 3: Social Link Addition
**What:** Add Facebook button next to LinkedIn in Footer Brand column
**Code Location:** `frontend/app/components/Footer.tsx` lines 17-28
```tsx
// Current LinkedIn pattern:
<a
  href="https://www.linkedin.com/company/winning-adventure-global"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Winning Adventure Global on LinkedIn"
  className="inline-flex items-center gap-2 text-white/70 text-sm font-medium border border-white/20 px-4 py-2 rounded-lg hover:border-amber hover:text-amber hover:bg-white/5 transition-all duration-300"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
  Follow us on LinkedIn
</a>
```
**Facebook link format:** `https://www.facebook.com/winningadventureglobal` or company page URL

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSL certificates | Manually configure Let's Encrypt | Vercel automatic SSL | Custom domains get auto SSL |
| Environment config | Build-time env injection | Vercel dashboard env vars | Secure, per-environment |
| Deployment pipeline | Manual npm deploy | Vercel Git integration | Auto-deploy on push |

## Common Pitfalls

### Pitfall 1: Environment Variables Not Set
**What goes wrong:** App builds but API calls fail (Supabase, Resend)
**Why it happens:** Environment variables not added to Vercel project settings
**How to avoid:** Add all required env vars in Vercel dashboard before first production deploy
**Warning signs:** Form submission fails, auth errors in console

### Pitfall 2: Custom Domain Propagation Delay
**What goes wrong:** Domain shows "Site not found" or old content
**Why it happens:** DNS propagation takes 24-48 hours
**How to avoid:** Use Vercel分配的 DNS records, verify with `dig` command
**Warning signs:** Domain resolves to different content or 404

### Pitfall 3: Mobile Menu Z-Index Conflict
**What goes wrong:** Mobile menu appears behind page content
**Why it happens:** z-index stacking context issues with other fixed elements
**How to avoid:** Ensure mobile menu has highest z-index (z-50) and no parent has higher stacking context
**Warning signs:** Can't tap menu items, menu appears but not interactive

## Code Examples

### Environment Variables Required
```bash
# Supabase (from existing .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Resend
RESEND_API_KEY=re_xxx

# Add these in Vercel Project Settings > Environment Variables
```

### Vercel.json Already Configured
```json
{
  "build": {
    "env": {
      "NODE_VERSION": "20.x"
    }
  }
}
```

### Navbar Mobile Menu (Current - Has bg-white)
```tsx
// Line 79-84 of Navbar.tsx
<div
  id="mobile-menu"
  className={`fixed right-0 top-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ${
    mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
  }`}
>
```

### Facebook Icon SVG (For Footer)
```tsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
</svg>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-------------------|--------------|--------|
| Manual FTP deploy | Vercel Git auto-deploy | Standard now | Faster, more reliable |
| Let's Encrypt manual | Vercel auto-SSL | Standard now | Zero config |
| Build-time env injection | Vercel dashboard env vars | Standard now | Secure per-env |

**Deprecated/outdated:**
- None relevant to this phase

## Open Questions

1. **Facebook Page URL**
   - What we know: Need to add Facebook link to Footer
   - What's unclear: Exact Facebook page URL to use
   - Recommendation: Use placeholder `https://www.facebook.com/winningadventureglobal` or confirm exact URL with user

2. **Supabase/Resend Credentials**
   - What we know: Need to configure these in Vercel
   - What's unclear: Exact values from .env.local
   - Recommendation: Read from `web/frontend/.env.local` during implementation

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 |
| Config file | frontend/playwright.config.ts |
| Quick run command | `npx playwright test` |
| Full suite command | `npx playwright test --reporter=html` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEPLOY-01 | Website deployed to Vercel | Manual | Visit winningadventure.com.au | N/A |
| DEPLOY-02 | Custom domain accessible | Manual | `nslookup winningadventure.com.au` | N/A |
| DEPLOY-03 | HTTPS works | Manual | Visit https://winningadventure.com.au | N/A |
| DEPLOY-04 | Env vars configured | Manual | Check Vercel dashboard | N/A |
| MOBILE-01 | Navbar visible when scrolling | Playwright | `npx playwright test` (existing viewport tests) | Tests folder empty |
| MOBILE-02 | Navbar clickable when scrolled | Playwright | Same as above | Tests folder empty |
| SOCIAL-01 | Facebook link in Footer | Playwright | Same as above | Tests folder empty |

### Sampling Rate
- **Per task commit:** N/A - deployment tasks
- **Per wave merge:** N/A - deployment phase
- **Phase gate:** Manual verification of deployed site

### Wave 0 Gaps
- [ ] `tests/footer-social.spec.ts` — covers SOCIAL-01
- [ ] `tests/mobile-navbar.spec.ts` — covers MOBILE-01, MOBILE-02
- [ ] Tests folder exists but is empty - no test files yet

## Sources

### Primary (HIGH confidence)
- Code inspection: Navbar.tsx, Footer.tsx (existing implementation)
- Vercel documentation (known from training): Auto-deployment, custom domains, SSL

### Secondary (MEDIUM confidence)
- Project config: vercel.json, package.json

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js + Vercel is standard, verified by code
- Architecture: HIGH - Simple deployment, existing patterns
- Pitfalls: MEDIUM - Known from general experience with Vercel

**Research date:** 2026-03-17
**Valid until:** 90 days for Vercel deployment (stable), 30 days for UI patterns
