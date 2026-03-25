# Phase 24: Schema Consistency - Research

**Researched:** 2026-03-25
**Domain:** Schema.org JSON-LD structured data, Next.js App Router server components, SEO
**Confidence:** HIGH

## Summary

Phase 24 addresses schema consistency issues across the WAG website. The primary problems are:
1. **PersonSchema uses client-side rendering** (`useEffect` pattern) that AI crawlers cannot see
2. **Andy Liu LinkedIn URL is incorrect** - he has no personal LinkedIn, only the company page exists
3. **/enquiry page lacks BreadcrumbSchema** entirely
4. **Numeric inconsistencies** across pages (supplier/industry counts)
5. **Geographic alignment needed** - areaServed Australia, content clarifies China as supplier location

The fix pattern is straightforward: convert `PersonSchema` from `'use client'` + `useEffect` to the server-compatible `dangerouslySetInnerHTML` pattern already used by `ArticleSchema` and `BreadcrumbSchema`. Organization and LocalBusiness schemas in layout.tsx are already correct.

**Primary recommendation:** Convert `PersonSchema.tsx` to server component, remove LinkedIn URL from sameAs, add BreadcrumbSchema to /enquiry page, audit all pages for numeric consistency.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **areaServed**: Australia only — confirmed by stakeholders
- **Supplier count**: 500+ — standardized across all pages
- **Industry count**: 50+ — standardized across all pages
- **China operations**: Guangdong Province only (Shenzhen, Foshan, Guangzhou)
- **No Zhengzhou/Shaanxi** references in any schema
- **ABN**: 30 659 034 919
- **Verification URL**: https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919
- **Andy Liu LinkedIn**: REMOVE `"https://www.linkedin.com/in/andyliu-wag"` from sameAs — personal LinkedIn does not exist

### Claude's Discretion
- Specific implementation approach for PersonSchema conversion
- Which pages to audit first for numeric inconsistencies
- ABN verification link placement strategy

### Deferred Ideas (OUT OF SCOPE)
- Schema changes to blog articles (Phase 25)
- Content creation (Phase 25)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GEO-03 | Article/BlogPosting Schema for blog articles | Already implemented in ArticleSchema.tsx, server-compatible |
| GEO-04 | Organization sameAs — LinkedIn, YouTube, etc | Already in layout.tsx with company LinkedIn; personal LinkedIn to be REMOVED |
| GEO-05 | Andy Liu Person Schema — jobTitle, sameAs, knowsAbout | PersonSchema.tsx needs conversion to server + LinkedIn removal |
| GEO-06 | BreadcrumbList Schema for all pages | BreadcrumbSchema already exists, needs addition to /enquiry; verified on other pages |

## Standard Stack

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js 16.1 | 16.1 | App Router framework | Built-in schema support via `<script>` tags |
| Schema.org | N/A | Structured data vocabulary | Universal standard for SEO |
| TypeScript | 5 | Type safety | Required by project |

**No additional packages required** — this phase uses only existing Next.js capabilities.

## Architecture Patterns

### Server-Compatible JSON-LD Pattern (CORRECT)
```typescript
// ArticleSchema.tsx - Already correct
export default function ArticleSchema({ title, description, ... }: Props) {
  const schema = { "@context": "https://schema.org", "@type": "Article", ... }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### Client-UseEffect Pattern (PROBLEMATIC - TO FIX)
```typescript
// PersonSchema.tsx - Current (BROKEN for SEO)
// AI crawlers cannot see useEffect-injected scripts
'use client'
export default function PersonSchema() {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
  }, [])
  return null
}
```

### Fixed Server Pattern (TARGET)
```typescript
// PersonSchema.tsx - Target after conversion
export default function PersonSchema() {
  const schema = { "@context": "https://schema.org", "@type": "Person", ... }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON-LD injection | useEffect/client pattern | `<script dangerouslySetInnerHTML>` | Server-rendered, visible to all crawlers |
| Schema validation | Custom validation | Google Rich Results Test | Free, official validation tool |
| Breadcrumb structure | Custom JSON-LD | BreadcrumbSchema component | Already exists, consistent with rest of site |

## Common Pitfalls

### Pitfall 1: Client-Side Schema Injection
**What goes wrong:** AI crawlers (GPTBot, ClaudeBot) do not execute JavaScript, so they never see useEffect-injected schemas
**Why it happens:** Developer uses React useEffect to append script to document.head
**How to avoid:** Use Next.js server components with `dangerouslySetInnerHTML` pattern
**Warning signs:** Schema appears in page source but not in crawler fetch results

### Pitfall 2: LinkedIn URL Without Checking
**What goes wrong:** PersonSchema links to non-existent personal LinkedIn profile
**Why it happens:** Assumed personal LinkedIn existed when it was only the company page
**How to avoid:** Verify URL existence before adding to schema; decision to remove was based on stakeholder confirmation
**Warning signs:** Broken LinkedIn links in schema validation

### Pitfall 3: Inconsistent Numbers Across Pages
**What goes wrong:** Different pages claim different supplier counts (100+, 500+, etc.)
**Why it happens:** Content evolved without centralized reference
**How to avoid:** Use Phase 23 decisions (500+ suppliers, 50+ industries) as canonical
**Warning signs:** Manual audit reveals conflicting numbers

## Code Examples

### PersonSchema Conversion (Before -> After)

**Before (app/components/PersonSchema.tsx):**
```typescript
'use client'
import { useEffect } from 'react'

export default function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Andy Liu",
    // ... rest of schema
    "sameAs": [
      "https://www.linkedin.com/in/andyliu-wag"  // TO BE REMOVED
    ],
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return null
}
```

**After (app/components/PersonSchema.tsx):**
```typescript
export default function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Andy Liu",
    "jobTitle": "Founder",
    "description": "China sourcing expert helping Australian businesses connect with verified Chinese manufacturers",
    "url": "https://www.winningadventure.com.au/about",
    "image": "https://www.winningadventure.com.au/andy-liu.jpg",
    "telephone": "+61-416588198",
    "worksFor": {
      "@type": "Organization",
      "name": "Winning Adventure Global",
      "url": "https://www.winningadventure.com.au",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "5, 54 Melbourne St",
        "addressLocality": "North Adelaide",
        "addressRegion": "SA",
        "postalCode": "5006",
        "addressCountry": "AU"
      }
    },
    // NOTE: sameAs array REMOVED - Andy Liu has no personal LinkedIn
    "knowsAbout": ["China manufacturing", "Supplier verification", "B2B procurement", "Factory tours"],
    "areaServed": {
      "@type": "Country",
      "name": "Australia"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### BreadcrumbSchema Addition to /enquiry

**app/enquiry/page.tsx - Add import and component:**
```typescript
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export default function EnquiryPage() {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Enquiry', url: 'https://www.winningadventure.com.au/enquiry' }
      ]} />
      <EnquiryForm />
    </>
  )
}
```

### ABN Verification Link Placement

The ABN is displayed in `/about/page.tsx` (line 238) in the Contact section. Add a verification link:

```typescript
<div>
  <p className="text-xs font-semibold text-amber uppercase tracking-wider mb-2">ABN</p>
  <p className="text-gray-700">
    30 659 034 919
    <a
      href="https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919"
      target="_blank"
      rel="noopener noreferrer"
      className="ml-2 text-amber hover:underline text-xs"
    >
      (Verify)
    </a>
  </p>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useEffect for JSON-LD | dangerouslySetInnerHTML in server components | Now | AI crawlers can index schemas |
| Personal LinkedIn in PersonSchema | Personal LinkedIn removed | Now | Accurate - no broken links |
| No breadcrumb on /enquiry | BreadcrumbList added | Now | Complete schema coverage |

**Deprecated/outdated:**
- `useEffect` schema injection pattern — replaced by server component pattern

## Open Questions

1. **FAQSchema and ServiceSchema also have 'use client' directive**
   - What we know: Both use `dangerouslySetInnerHTML` which works in server components
   - What's unclear: Whether removing 'use client' would break anything
   - Recommendation: Remove 'use client' from FAQSchema and ServiceSchema for consistency

2. **ABN verification link visual placement**
   - What we know: About page has ABN displayed; verification URL confirmed
   - What's unclear: Exact visual treatment for the verify link
   - Recommendation: Small, unobtrusive "(Verify)" link next to ABN

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified — this is a pure code/config phase)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — manual validation required |
| Config file | N/A |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Validation Method |
|--------|----------|-----------|------------------|
| GEO-03 | Article schema on blog posts | Manual | Google Rich Results Test on sample article |
| GEO-04 | Organization sameAs with LinkedIn company page | Manual | Schema validation in layout.tsx |
| GEO-05 | Andy Liu Person schema (server-rendered, no LinkedIn) | Manual | View page source, verify JSON-LD present without useEffect |
| GEO-06 | BreadcrumbList on all pages including /enquiry | Manual | Schema validation on each page |

### Manual Validation Checklist
- [ ] PersonSchema appears in page source of /about (not via useEffect)
- [ ] PersonSchema sameAs array is empty (no LinkedIn)
- [ ] /enquiry page has BreadcrumbSchema in source
- [ ] All pages with FAQ display "500+ suppliers"
- [ ] All pages with industry info display "50+ industries"
- [ ] ABN has verification link in about page
- [ ] Google Rich Results Test passes for all pages with schema

### Wave 0 Gaps
None — existing infrastructure (Google Rich Results Test) covers validation requirements.

## Sources

### Primary (HIGH confidence)
- app/components/PersonSchema.tsx — Current implementation with useEffect issue
- app/components/ArticleSchema.tsx — Reference implementation for server-compatible pattern
- app/components/BreadcrumbSchema.tsx — Reference implementation for server-compatible pattern
- app/layout.tsx — Organization and LocalBusiness schemas (already correct)
- Google Schema.org documentation — JSON-LD best practices

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions — Locked from discussion phase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Next.js App Router with built-in schema support
- Architecture: HIGH — Server component pattern clearly established
- Pitfalls: HIGH — Root causes well understood

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (30 days — stable domain)
