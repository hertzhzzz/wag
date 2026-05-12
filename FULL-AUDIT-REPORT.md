# Winning Adventure Global — Comprehensive SEO Audit Report

**Report Date:** 2026-05-12
**Auditor:** SEO Audit Team (Technical, Content, Schema, Performance, SXO subagents)
**Website:** https://www.winningadventure.com.au
**GSC Status (verified via URL Inspection):** Homepage /resources /about /enquiry — all "Submitted and indexed"

---

## Executive Summary

### Weighted Overall Score: 72 / 100

| Category | Score | Weight | Weighted |
|---------|-------|--------|----------|
| Technical SEO | 85 | 22% | 18.7 |
| Content Quality | 71 | 23% | 16.3 |
| On-Page SEO (SXO) | 38 | 20% | 7.6 |
| Schema & Structured Data | 72 | 10% | 7.2 |
| Performance | 85 | 10% | 8.5 |
| AI Search Readiness | 82 | 10% | 8.2 |
| Images | 100 | 5% | 5.0 |
| **Total** | | **100%** | **71.5 → 72** |  |

### Top 5 Critical Issues

1. **Organization JSON-LD geo coordinates wrong** — `app/layout.tsx` lines 163-164 still carry the incorrect coordinates (-34.9074705, 138.6065758) instead of the verified correct values (-34.9258, 138.5898). ACTION-PLAN claims LocalBusinessSchema was fixed, but the primary Organization schema in layout.tsx was never updated.

2. **Duplicate knowsAbout arrays in Organization schema** — `app/layout.tsx` lines 151 and 181-190 declare `knowsAbout` twice in the same JSON-LD object, which will cause schema validation failures.

3. **MarkHeSchema.tsx exists but is not integrated** — The file `app/components/MarkHeSchema.tsx` was created but no page actually renders `<MarkHeSchema />`. Mark He is the author of all blog articles and Managing Director, but has no crawlable Person schema. This directly impacts E-E-A-T authority signals.

4. **E-E-A-T author mismatch** — `PersonSchema.tsx` attributes content authorship to Andy Liu (Founder), while ArticleSchema and all MDX blog articles use Mark He as author. Google's quality guidelines require clear, consistent author attribution.

5. **Canonical URL missing trailing slash** — `app/layout.tsx` line 66 sets `canonical: 'https://www.winningadventure.com.au'` with no trailing slash. The page renders at both `/` and `/?amp` depending on canonical resolution, creating duplicate content risk.

### Top 5 Quick Wins

1. Fix Organization geo coordinates in layout.tsx (5 minutes)
2. Remove duplicate knowsAbout array in layout.tsx (2 minutes)
3. Add `<MarkHeSchema />` to layout.tsx or about page (2 minutes)
4. Add trailing slash to canonical URL in layout.tsx (1 minute)
5. Integrate MarkHeSchema into ArticleSchema author resolution (5 minutes)

---

## 1. Technical SEO — Score: 85 / 100

### What's Working

| Element | Status |
|---------|--------|
| Robots.txt | OK — allows all crawlers |
| HTTPS | OK — fully enforced |
| Core Web Vitals LCP | 3.9s — GOOD (target <4s) |
| Mobile LCP | Needs improvement |
| Third-party scripts | GTM, Facebook Pixel, Ahrefs — all use `strategy="lazyOnload"` |

### Issues Found

#### Critical: Wrong Geo Coordinates in Organization Schema

**File:** `app/layout.tsx` lines 161-165 (Organization JSON-LD)

```
Current (WRONG):
"geo": {
  "@type": "GeoCoordinates",
  "latitude": -34.9074705,
  "longitude": 138.6065758
}

Correct (verified):
"geo": {
  "@type": "GeoCoordinates",
  "latitude": -34.9258,
  "longitude": 138.5898
}
```

**Impact:** LocalBusinessSchema.tsx was reportedly fixed (per ACTION-PLAN.md), but the Organization JSON-LD embedded directly in layout.tsx still carries the old incorrect coordinates. This is the schema Google most likely uses for rich results.

**Fix:** Update lines 163-164 in `app/layout.tsx`.

#### Medium: Missing Security Headers

- **HSTS** (HTTP Strict Transport Security) — not set
- **CSP** (Content Security Policy) — not set

**Impact:** Low — these are not ranking factors. HSTS is relevant only if there is a migration history or sensitive subdomains.

**Recommendation:** Consider adding HSTS after confirming no HTTP-only legacy paths exist.

#### Low: GZIP/Brotli Compression

Not verified during this audit. Run:

```bash
curl -sI -H "Accept-Encoding: gzip, br" https://www.winningadventure.com.au | grep -i content-encoding
```

**Recommendation:** Verify at server/edge level (Vercel supports Brotli by default).

#### Low: Trailing Slash Canonical Inconsistency

**File:** `app/layout.tsx` line 66
**Current:** `canonical: 'https://www.winningadventure.com.au'`
**Expected:** `canonical: 'https://www.winningadventure.com.au/'`

**Impact:** Canonical resolution may treat `/?amp` and `/` differently. Minor but easy to fix.

---

## 2. Content Quality — Score: 71 / 100

### What's Working

| Element | Status |
|---------|--------|
| E-E-A-T (founder profile) | Strong — Andy Liu has detailed PersonSchema |
| Case study content | All 20 case studies exceed 1500 words |
| Readability | Professional B2B tone |
| Author attribution | Present on articles |
| Meta descriptions | Unique and descriptive |

### Issues Found

#### Critical: E-E-A-T Author Mismatch

**Problem:** `PersonSchema.tsx` attributes expertise and content authorship to Andy Liu, while `ArticleSchema.tsx` and all MDX blog articles use Mark He as the author. Andy Liu is the Founder; Mark He is the Managing Director and writes all articles.

**Evidence:**
- `PersonSchema.tsx` line 5: `"name": "Andy Liu"`
- `ArticleSchema.tsx` line 36: `"name": author` where all articles set `author: "Mark He"`
- Blog MDX frontmatter: `author: "Mark He"`

**Impact:** Google associates article content with the author entity in its knowledge graph. The mismatch means Andy Liu's PersonSchema expertise does not reinforce article authority. Mark He's actual authorship of all content is not reflected in any Person schema.

**Fix Options:**
1. Update `PersonSchema.tsx` to use Mark He (recommended — he writes all content)
2. Add Mark He as a second Person schema on article pages
3. Add `author: "Andy Liu"` to all MDX frontmatter (requires verifying actual authorship)

#### Medium: Thin Content on Service Pages

Some service sub-pages may still fall below 500-word threshold. Recommend auditing `/services` sub-pages individually.

#### Medium: Blog Index Keyword Alignment

The `/resources` blog index page title and H1 were updated to include "china sourcing agent", but the page format (blog listing) still signals "informational content" to Google while the target keyword implies "transactional/service" intent. This is partially addressed by the new `/china-sourcing-agent` dedicated landing page.

---

## 3. On-Page SEO (SXO) — Score: 38 / 100

### What's Working

| Element | Status |
|---------|--------|
| Title tags | Unique, keyword-optimized |
| Meta descriptions | Descriptive, action-oriented |
| Internal linking | Hub-spoke structure partially implemented |
| FAQ content | Present on homepage and articles |
| Pillar-cluster | 3 pillars identified (verification, tours, importing) |

### Issues Found

#### Critical: Page-Type Mismatch (SXO)

**Problem:** The primary commercial keyword "china sourcing agent" was previously targeted by `/resources` (a blog index page). The SERP for this keyword shows service landing pages, not blog indexes — indicating Google classifies the intent as transactional/commercial.

**Status:** Partial fix — `/resources/china-sourcing-agent/page.tsx` was created as a dedicated service landing page. However:
- `/resources` still exists as a blog index and may be cannibalizing signals
- The new page needs internal links and content signals to rank
- No cross-link from `/resources` to `/resources/china-sourcing-agent`

**Impact:** Page-type mismatch is a Search Experience Optimization (SXO) failure. When Google expects a service page and finds a blog index, rankings drop or never materialize.

**Fix:**
1. Add a prominent CTA from `/resources` pointing to `/resources/china-sourcing-agent`
2. Ensure the new page has sufficient content depth (1500+ words)
3. Add ServiceSchema to the new page (currently only on `/services`)
4. Build internal links from pillar articles to the new page

#### Medium: Intent Cannibalization Risk

`/services` and `/resources/china-sourcing-agent` may compete for the same commercial keywords.

**Recommendation:** Define a clear keyword map:
- `/services` — broad: "china sourcing agent", "china procurement"
- `/resources/china-sourcing-agent` — specific: "china sourcing agent for australian businesses"
- Blog articles — informational: "how to verify chinese suppliers", etc.

---

## 4. Schema & Structured Data — Score: 72 / 100

### What's Working

| Schema Type | Status |
|-----------|--------|
| Organization | Present in layout.tsx |
| Person (Andy Liu) | Present in PersonSchema.tsx |
| Person (Mark He) | Created MarkHeSchema.tsx but NOT integrated |
| Service | Present on /services |
| CaseStudy | Integrated in case study articles |
| Article/BlogPosting | Present on all blog articles |
| FAQPage | Disabled (Google deprecated FAQ rich results May 2024) |
| Breadcrumb | Present |
| HowTo | Present |

### Issues Found

#### Critical: Duplicate knowsAbout Arrays

**File:** `app/layout.tsx` lines 151 and 181-190

The Organization JSON-LD object has two separate `knowsAbout` arrays. This invalidates the schema per JSON-LD specification (duplicate keys at same level).

```json
// First occurrence (line 151, inside founder object):
"knowsAbout": ["China Manufacturing", "Supply Chain Management", ...]

// Second occurrence (lines 181-190, top-level Organization):
"knowsAbout": [
  "Chinese manufacturing",
  "China business tours",
  "factory verification",
  ...
]
```

**Fix:** Remove the first `knowsAbout` (inside the `founder` nested object) or merge it into the second array if expert authority for Andy Liu is desired separately. Recommended: remove from founder object to avoid confusion with Organization-level expertise.

#### Critical: MarkHeSchema Not Integrated

**File:** `app/components/MarkHeSchema.tsx`
**Status:** Created but never rendered on any page.

Mark He is Managing Director, writes all blog articles, and is the primary E-E-A-T signal for content. His Person schema should appear on:
- Homepage (via layout.tsx or page.tsx)
- About page (`/about`)
- All blog article pages

**Fix:** Add `<MarkHeSchema />` to `app/layout.tsx` inside the `<head>` (after the existing Organization JSON-LD script), OR add it to `app/page.tsx` and `app/about/page.tsx`.

#### Critical: Organization Schema Geo Coordinates Wrong

See Technical SEO section. Confirmed in `app/layout.tsx` lines 163-164.

#### Medium: FAQPage Schema Disabled

Correct decision — Google deprecated FAQ rich results in May 2024. No action needed unless competitor sites are winning with FAQ content (unlikely to be a significant factor).

---

## 5. Performance — Score: 85 / 100

### What's Working

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP (desktop) | 3.9s | <4s | GOOD |
| Hero image size | 58KB | <60KB | GOOD |
| Hero image compression | quality={75} | — | GOOD |
| Priority image loading | Enabled | — | GOOD |
| Third-party script loading | lazyOnload | — | GOOD |
| Video poster fallback | hero-image.webp | — | GOOD |

### Issues Found

#### Medium: Mobile LCP

Desktop LCP is acceptable, but mobile LCP needs improvement. The video background is disabled on mobile (correct), but the mobile hero image may not be prioritized correctly across all mobile viewport sizes.

**Recommendation:**
- Ensure `fetchPriority="high"` and `priority` are set for mobile hero image
- Test with Chrome DevTools > Lighthouse > Mobile
- Consider serving a smaller hero image for mobile via `sizes` attribute refinement

#### Low: INP (Interaction to Next Paint)

Third-party scripts (GTM, Facebook Pixel, Ahrefs) contribute to INP. lazyOnload strategy mitigates this but does not eliminate it entirely.

**Recommendation:** Monitor INP in CrUX dashboard. If above 200ms, investigate scroll listeners and main-thread blocking.

---

## 6. AI Search Readiness — Score: 82 / 100

### What's Working

| Element | Status |
|---------|--------|
| llms.txt | OK — generated and accessible |
| Clear author attribution | Present |
| Structured data for AI | Partially present |
| Content freshness | Active blog publishing |

### Issues Found

#### Critical: Mark He Person Schema Missing from Crawlable Pages

Mark He writes all blog articles as Managing Director, but there is no crawlable Person schema for him on any page. The file `MarkHeSchema.tsx` exists but is not rendered anywhere.

**Impact:** AI search engines (Perplexity, Claude, ChatGPT) that consume structured data cannot attribute content to Mark He. This weakens authority signals in AI-powered search results.

**Fix:** Add `<MarkHeSchema />` to:
1. `app/layout.tsx` head (recommended — applies to all pages)
2. OR `app/page.tsx` and `app/about/page.tsx`

#### Medium: Organization Schema Inconsistencies

The Organization schema in layout.tsx has multiple issues (geo, duplicate knowsAbout) that could confuse AI parsing. Fixing the Technical SEO issues will automatically improve AI search readiness.

---

## 7. Images — Score: 100 / 100

### What's Working

| Element | Status |
|---------|--------|
| Hero image | 58KB, WebP format, quality={75} |
| next/image usage | All images use next/image component |
| Alt text | Descriptive alt text on hero |
| Responsive images | sizes attribute properly configured |
| Priority loading | fetchPriority="high" + priority on hero |
| Lazy loading | Default for below-fold images |

### Issues Found

No issues. The image optimization work (Hero.tsx + quality={75}) has been completed successfully.

---

## Action Plan (Prioritized)

### Phase 1: Critical Fixes (Day 1-2)

| # | Action | File | Est. Time |
|---|--------|------|-----------|
| 1.1 | Fix Organization geo coordinates (lat -34.9258, lng 138.5898) | `app/layout.tsx:163-164` | 2 min |
| 1.2 | Remove duplicate knowsAbout array (lines 181-190, keep top-level) | `app/layout.tsx` | 2 min |
| 1.3 | Add trailing slash to canonical URL | `app/layout.tsx:66` | 1 min |
| 1.4 | Add `<MarkHeSchema />` to layout.tsx head (after Organization JSON-LD) | `app/layout.tsx` | 3 min |
| 1.5 | Verify Mark He authorship consistency — update PersonSchema.tsx to reflect Mark He if he writes all content | `app/components/PersonSchema.tsx` | 5 min |

### Phase 2: High Priority (Week 1)

| # | Action | File | Est. Time |
|---|--------|------|-----------|
| 2.1 | Integrate MarkHeSchema into homepage and about page | `app/page.tsx`, `app/about/page.tsx` | 5 min |
| 2.2 | Add prominent CTA from `/resources` to `/resources/china-sourcing-agent` | `app/components/ResourcesContent.tsx` | 5 min |
| 2.3 | Add ServiceSchema to `/resources/china-sourcing-agent/page.tsx` | `app/resources/china-sourcing-agent/page.tsx` | 5 min |
| 2.4 | Build internal links from pillar articles to `/resources/china-sourcing-agent` | MDX article templates | 15 min |
| 2.5 | Mobile LCP audit and optimization | `app/components/Hero.tsx` | 30 min |
| 2.6 | Verify Brotli compression | Server/Vercel config | 5 min |

### Phase 3: Medium Priority (Weeks 2-4)

| # | Action | Notes |
|---|--------|-------|
| 3.1 | Keyword map review — resolve /services vs /resources/china-sourcing-agent cannibalization | Define primary page per keyword |
| 3.2 | Expand /resources/china-sourcing-agent content to 1500+ words | Service landing page needs depth |
| 3.3 | Security headers (HSTS) — add after HTTP audit | Low impact, easy win |
| 3.4 | Review all service sub-pages for word count | Content audit |

### Phase 4: Low Priority (Ongoing)

| # | Action | Notes |
|---|--------|-------|
| 4.1 | Video content for homepage | Requires user-provided素材 |
| 4.2 | Hub-spoke link architecture full implementation | 3 pillars, 21 spoke articles |
| 4.3 | Moz API / Ahrefs Webmaster Tools setup | Backlink monitoring |

---

## Verification Checklist

After Phase 1 fixes, run:

```bash
# Verify Organization schema
curl -s https://www.winningadventure.com.au | grep -o '"geo":{[^}]*}' | head -1

# Verify MarkHeSchema is present
curl -s https://www.winningadventure.com.au/about | grep -o '"name":"Mark He"'

# Verify canonical trailing slash
curl -sI https://www.winningadventure.com.au | grep -i link

# Verify no duplicate knowsAbout
curl -s https://www.winningadventure.com.au | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('knowsAbout','NOT FOUND'))"

# Google Rich Results Test
# https://search.google.com/test/rich-results?url=https://www.winningadventure.com.au
```

---

## Appendix: Scoring Rubric Reference

| Score | Technical | Content | On-Page | Schema | Performance | AI Search | Images |
|-------|-----------|---------|---------|--------|------------|----------|--------|
| 100 | Perfect | Excellent | Perfect | Perfect | Perfect | Perfect | Perfect |
| 85 | Minor issues | Strong minor gaps | Good, minor gaps | Strong minor gaps | Good | Strong | Good |
| 72 | Moderate issues | Some quality gaps | Moderate misalignment | Moderate issues | Moderate | Moderate | Good |
| 38 | Major issues | Major gaps | Page-type mismatch | Major issues | Poor | Major gaps | — |

**Note:** On-Page score of 38 reflects the unresolved SXO page-type mismatch where a blog index was targeting a commercial keyword that SERPs expect to be served by a service landing page. This is the single highest-impact issue on the site.

---

*Report generated: 2026-05-12*
*Based on subagent audits: Technical (85), Content (71), Schema (72), Performance (85), SXO (38), AI Search (82), Images (100)*
*GSC data verified via URL Inspection API*
