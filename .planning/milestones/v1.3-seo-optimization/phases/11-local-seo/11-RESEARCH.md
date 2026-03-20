# Phase 11: Local SEO & Authority - Research

**Researched:** 2026-03-18
**Domain:** Local SEO optimization, Google Business Profile, Australian business directories, guest posting for backlink building
**Confidence:** MEDIUM

## Summary

Phase 11 focuses on establishing WAG's local presence in the Australian market and building domain authority through backlinks. The primary activities include optimizing Google Business Profile (LOCAL-01), submitting to Australian directories (LOCAL-02), creating location-specific content for South Australia (LOCAL-03), guest posting on industry sites (AUTH-01), and building backlinks from Australian directories (AUTH-02).

All user decisions are locked from CONTEXT.md - no alternatives to research.

**Primary recommendation:** Execute Google Business Profile setup first (prerequisite for local rankings), then parallelize directory submissions while developing local content and guest post outreach.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Google Business Profile:**
- Business name: Full legal name (as legally registered)
- Address: Physical office address displayed (not just service area)
- CTA buttons: Multiple CTAs (Book a consultation, Get a quote, Contact us)
- Post frequency: Monthly posts with industry tips, case studies, news

**Directory Submissions:**
- Priority strategy: Balanced approach - both general directories (TrueLocal, Yelp) and industry-specific (import/export, B2B sourcing)
- Quality approach: Submit to all available directories (not just high DA)
- NAP consistency: Consistent business name "WAG - Winning Adventure Global" across all directories

**Guest Posting:**
- DA threshold: High DA 40+ sites only
- Geographic focus: Both AU/NZ sites and international sourcing/procurement sites
- Anchor text: Exact match keywords for target keywords
- Target topics: Import/export, logistics, business consulting, China sourcing

**Local Content:**
- Geographic focus: Both Adelaide-specific and broader South Australia content
- Placement: Claude's discretion - new dedicated page or add to existing About/Services pages
- Location keywords: Both specific locations (Adelaide CBD, port, warehouse districts) and general mentions

### Claude's Discretion
- Exact local content page structure and layout
- Specific directory list to submit (prioritization within balanced approach)
- Guest post topics and outreach sequence
- Local content internal linking strategy

### Deferred Ideas (OUT OF SCOPE)
- None - discussion stayed within phase scope

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LOCAL-01 | Claim and optimize Google Business Profile | GBP optimization best practices, category selection, review management |
| LOCAL-02 | Add business to Australian directories (5+) | Australian directory list with 19+ directories identified |
| LOCAL-03 | Add location-specific content (South Australia focus) | Local SEO content strategy, Adelaide/South Australia keywords |
| AUTH-01 | Create 3 guest posts on related industry sites | Guest posting sites in logistics, procurement, sourcing niches |
| AUTH-02 | Build backlinks from Australian business directories | Directory backlink strategy, NAP consistency importance |

## Standard Stack

### Core Tools (No Additional Installation Required)
| Tool | Purpose | Why Standard |
|------|---------|--------------|
| Google Business Profile | Local SEO foundation, Maps visibility | Free, essential for local rankings |
| Apple Business Connect | Apple Maps visibility | Growing alternative to Google |
| Bing Places | Microsoft ecosystem visibility | Secondary but free |
| Moz Link Explorer | DA checking for guest post sites | Industry standard for link metrics |
| Mailto/Email | Outreach for guest posts | Standard communication |

### Supporting Tools
| Tool | Purpose | When to Use |
|------|---------|-------------|
| BrightLocal | Directory tracking, NAP monitoring | If managing many citations |
| Whitespark | Local citation finder | Finding additional directories |

**No additional npm packages required for this phase - all tasks are operational/outreach.**

## Architecture Patterns

### Recommended Project Structure
```
wag/
├── app/
│   ├── about/           # Existing - add local content here or
│   ├── services/       # Existing - add local content here or
│   └── location/       # NEW - dedicated Adelaide/South Australia page
├── content/            # Blog content (already exists)
└── lib/
    └── local-seo.ts    # NEW - local SEO utilities (NAP data, structured data)
```

### Pattern 1: Google Business Profile Optimization

**What:** Complete GBP profile with all fields, categories, photos, posts
**When to use:** LOCAL-01 implementation
**Example:**
```
Business Name: WAG - Winning Adventure Global
Primary Category: Import Export Agent
Secondary Categories: Business Consultant, Freight Forwarding Service
Service Areas: Adelaide, South Australia, Australia
Attributes: [As applicable - AU-owned, etc.]
```

### Pattern 2: NAP Consistency

**What:** Name, Address, Phone must be identical across all directories
**When to use:** Every directory submission
**Critical for:** Local SEO ranking factors (Moz Local Citation studies show 70%+ of citations have errors)

**NAP Format:**
```
WAG - Winning Adventure Global
[Full Address, Adelaide SA XXXX]
+61 X XXX XXX XXX
```

### Pattern 3: Guest Post Anchor Text Strategy

**What:** Use exact match keywords in anchor text
**When to use:** When placing author bio links back to WAG site
**Example anchor texts:**
- "epic sourcing" -> links to /services
- "china direct" -> links to /services
- "import from china" -> links to /resources/blog-post

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Citation tracking | Custom spreadsheet | BrightLocal/Whitespark | Auto-tracks 100+ directories, alerts on inconsistencies |
| GBP posting | Manual monthly reminders | GBP scheduled posts | Built-in scheduling, engagement tracking |
| Guest post DA verification | Guess DA scores | Moz Link Explorer / Ahrefs | Accurate, current metrics |
| Directory discovery | Random search | Whitespark Citation Finder | Finds all AU directories automatically |

## Common Pitfalls

### Pitfall 1: NAP Inconsistency
**What goes wrong:** Google sees different addresses across citations,Confuses search engine,lower local ranking
**Why it happens:** Typos, abbreviations, name variations (WAG vs Winning Adventure Global)
**How to avoid:** Use exact same format everywhere - copy-paste from source of truth
**Warning signs:** Local Pack rankings fluctuate, competitor outranks despite fewer citations

### Pitfall 2: GBP Profile Suspension
**What goes wrong:** Business disappears from Google Maps during verification/optimization
**Why it happens:** Multiple listings, address verification issues, policy violations
**How to avoid:** Verify ownership properly, don't create duplicate listings, use consistent info
**Warning signs:** "Pending" status > 30 days, verification postcard not arriving

### Pitfall 3: Low-Quality Guest Posts
**What goes wrong:** Guest post rejected, published on irrelevant site, or flagged as spam
**Why it happens:** Not following guidelines, poor content quality, aggressive self-promotion
**How to avoid:** Study site's existing content, pitch relevant topics, deliver quality articles
**Warning signs:** Site rejects multiple pitches, DA drops after publishing

### Pitfall 4: Irrelevant Anchor Text
**What goes wrong:** Links flagged as manipulative, potential Google penalty
**Why it happens:** Exact-match anchor text overuse, unrelated topics
**How to avoid:** Mix branded anchors (Winning Adventure Global) with partial and naked URLs
**Warning signs:** Ranking drop after guest post publication, unnatural link profile report

### Pitfall 5: Duplicate Content on Local Pages
**What goes wrong:** Google sees thin/duplicate content, no ranking benefit
**Why it happens:** Copying from other pages, minimal unique value
**How to avoid:** Add genuine local insights (Adelaide-specific stats, local case studies, neighborhood details)
**Warning signs:** "Indexed but not crawled" in Search Console, no local keyword rankings

## Code Examples

### LocalBusiness Schema (Local-SEO.ts)
```typescript
// Source: Google Developers - Schema.org LocalBusiness
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "WAG - Winning Adventure Global",
  "image": "https://www.winningadventure.com.au/logo.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Street Address]",
    "addressLocality": "Adelaide",
    "addressRegion": "SA",
    "postalCode": "[XXXX]",
    "addressCountry": "AU"
  },
  "telephone": "+61 X XXX XXX XXX",
  "url": "https://www.winningadventure.com.au",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "areaServed": {
    "@type": "State",
    "name": "South Australia"
  },
  "priceRange": "$$$$"
}
```

### Guest Post Outreach Email Template
```markdown
Subject: Guest Post Pitch: [Topic Idea] for [Site Name]

Hi [Name],

I came across your article on [Topic] and found it very [compliment].

I'm a [title] at [Company], and I'd like to contribute a guest post about
[Specific Topic] that would complement your existing content.

My proposed topic: "[Exact Title]"
Key points: [Bullet of 3-4 points]
Target keywords: [Primary], [Secondary]

Would you be open to a 1000+ word article on this topic?

Best regards,
[Name]
[Title]
[Company]
[Email]
```

## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Keyword-stuffed GBP descriptions | Natural language with early primary keyword | 2024+ | Better engagement, no penalty risk |
| Quantity over quality directories | Quality + industry-specific balanced approach | 2025+ | Better authority signals |
| Guest posts on any DA site | DA 40+ only, topic-relevant | 2024+ | Reduced spam signals, better ranking |
| Generic "Australia" location content | Hyperlocal (Adelaide CBD, port districts) | 2025+ | Better local intent matching |

**Deprecated/outdated:**
- Directory submissions for pure link building (Google penalizes)
- Guest post networks (now flagged as link schemes)
- Exact-match anchor text only (now looks unnatural)

## Open Questions

1. **Physical Office Address**
   - What we know: User decided to show physical address, not just service area
   - What's unclear: Exact Adelaide address to use
   - Recommendation: Use actual office address; if co-working, list as-is

2. **GBP Verification Timeline**
   - What we know: Postcard verification can take 2-4 weeks
   - What's unclear: Whether any expedited verification is available for AU
   - Recommendation: Start GBP setup immediately; don't wait for verification to proceed with other tasks

3. **Guest Post Publication Timeline**
   - What we know: AUTH-01 requires 3 guest posts on DA 40+ sites
   - What's unclear: Current DA of WAG site (~5), which may limit acceptance
   - Recommendation: Lead with expertise/value pitch; mention company credentials; expect 4-8 week turnaround

## Validation Architecture

> Skip this section entirely if workflow.nyquist_validation is explicitly set to false in .planning/config.json. If the key is absent, treat as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None - Phase 11 is operational/outreach, not code |
| Config file | N/A |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|---------------|
| LOCAL-01 | Google Business Profile claimed and optimized | Manual | N/A - verify at business.google.com | N/A |
| LOCAL-02 | Business listed in 5+ Australian directories | Manual | N/A - verify each directory listing | N/A |
| LOCAL-03 | Location-specific content published | Manual | N/A - check page exists with Adelaide content | N/A |
| AUTH-01 | 3 guest posts published on DA 40+ sites | Manual | N/A - verify each published post | N/A |
| AUTH-02 | Backlinks from directories verified | Manual | N/A - check Moz/Ahrefs for new links | N/A |

**Note:** All Phase 11 requirements are manual/operational verification tasks. No automated testing framework applies.

### Sampling Rate
- **Per task commit:** N/A - operational tasks
- **Per wave merge:** N/A
- **Phase gate:** All 5 manual verifications complete before /gsd:verify-work

### Wave 0 Gaps
- None - Phase 11 requires no code or test infrastructure setup

## Sources

### Primary (HIGH confidence)
- Google Business Profile Help - Tips to improve your local ranking (support.google.com/business/answer/7091)
- Haley Marketing - Ultimate Guide to Google Business Profile Optimization (2025)
- Avintiv Media - 7 Google Business Profile Optimization Tactics That Work in 2025

### Secondary (MEDIUM confidence)
- SGD Australia - Best Australian Directories for SEO in 2026
- The Agency Guide - 40+ High DA Sites That Accept Guest Posts
- Logistics News Today - Write for Us (logistics, supply chain, procurement)
- Purchasing & Procurement Center - Write for Us guidelines
- UnboundB2B - Guest Blogging Opportunities

### Tertiary (LOW confidence - needs validation)
- Directory DA scores not verified - recommend checking with Moz Link Explorer before outreach
- Guest post site DA scores from 2021 - verify current DA before pitch

## Metadata

**Confidence breakdown:**
- Standard Stack: MEDIUM - no npm packages needed, operational tasks only
- Architecture: HIGH - clear patterns for GBP, NAP, schema, outreach
- Pitfalls: MEDIUM - based on industry best practices, no project-specific validation

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (30 days - local SEO best practices relatively stable)
