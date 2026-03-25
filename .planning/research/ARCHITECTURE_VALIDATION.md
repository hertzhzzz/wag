# GEO Architecture Validation: Phase Ordering and Dependencies

**Project:** WAG Website v3.0 GEO Optimization
**Researched:** 2026-03-25
**Confidence:** HIGH

---

## Executive Summary

The proposed 3-phase architecture (23 → 24 → 25) is fundamentally sound, but **Phase 23 is partially complete** and **Phase 24 is mostly complete**. This creates misleading status reporting and suggests restructuring for clarity. The phase ordering dependency chain is correct.

**Key finding:** Only ~40% of planned work remains. Phase 25 (Content Citability) has the most remaining work.

---

## Current State Audit

### Phase 23: AI Crawler Infrastructure

| Requirement | Status | Location |
|-------------|--------|----------|
| `/llms.txt` endpoint | **MISSING** | Needs creation |
| robots.txt AI crawler rules | **DONE** | `public/robots.txt` already allows GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended |

**Issue:** Phase 23 is marked "Not started" in ROADMAP.md but robots.txt work is complete. Only llms.txt creation is needed.

### Phase 24: Schema Foundation

| Requirement | Status | Location |
|-------------|--------|----------|
| Article schema on all 10 blog posts | **DONE** | `ArticleSchema.tsx` + `resources/[slug]/page.tsx` |
| Organization sameAs links | **DONE** | `layout.tsx` lines 144-150 (LinkedIn, Facebook, YouTube, Instagram, Google Maps) |
| Person schema with sameAs + knowsAbout | **DONE** | `PersonSchema.tsx` + nested in Organization schema |
| BreadcrumbList on all pages | **PARTIAL** | Present on /services, /about, /resources, /resources/[slug], /resources/faq; **MISSING on /enquiry** |

**Issue:** Phase 24 success criteria states "all pages" but enquiry page lacks BreadcrumbSchema.

### Phase 25: Content Citability

| Requirement | Status | Impact |
|-------------|--------|--------|
| FAQPage speakableSpecification | **MISSING** | `FAQSchema.tsx` lacks `xpath` or `cssSelector` for citation marking |
| Third-party citations | **MISSING** | No external authoritative sources (DFAT, ABS, AusTrade) referenced |
| Geographic consistency | **NEEDS REVIEW** | Schema shows `areaServed: Australia` only, but content mentions China factory locations |

---

## Phase Ordering Validation

### Dependency Chain Analysis

```
Phase 23 (llms.txt)
    ↓ [no technical dependency, but logical first]
Phase 24 (Schema Enhancement)
    ↓ [depends on 23 for AI crawler access, but schemas are independent]
Phase 25 (Content Citability)
    ↓ [depends on 24's enhanced schemas]
```

**Verdict:** Ordering is correct. Phase 23 should be first because:
1. llms.txt provides AI crawlers explicit access to content
2. Without llms.txt, AI crawlers may miss enhanced schemas in Phase 24
3. Phase 25's speakable specifications work best when AI can already discover content

### Cross-Phase Dependencies

| Dependency | Type | Risk | Mitigation |
|------------|------|------|------------|
| llms.txt → Phase 24 schemas | Logical | Low | None needed - no technical coupling |
| Phase 24 schemas → Phase 25 speakable | Technical | Low | speakable works on existing FAQPage structure |
| Geographic claims consistency | Cross-cutting | Medium | Must verify JSON-LD matches visible content |

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Risk |
|----------|---------------|------|
| llms.txt route → blog MDX files | Reads via `fs` at request time | Performance at scale (mitigate with caching) |
| FAQSchema → FAQ data | Props passed from page components | Low - simple data flow |
| BreadcrumbSchema → Page data | Props passed from pages | Low - explicit contract |

### External Services

| Service | Integration | Status |
|---------|-------------|--------|
| Perplexity AI | robots.txt + llms.txt | Already allowed |
| ChatGPT | robots.txt + structured data | Already allowed |
| Claude AI | robots.txt + crawls web | Already allowed |
| Google AI Overviews | sitemap.xml + structured data | Already allowed |

---

## Geographic Consistency Issue

### Problem Identified

**JSON-LD claims:**
- `Organization.areaServed`: `"Australia"` only
- `LocalBusiness.serviceArea`: `"Australia"` only

**Content claims (FAQ, About page):**
- "factory visits in Shenzhen, Foshan, and Guangzhou"
- "500+ verified suppliers across Guangdong, Shenzhen, Foshan, Guangzhou, Zhengzhou, and Shaanxi"
- "6 Chinese provinces"

### Root Cause

The service is Australia-based (headquarters), but the service delivery happens in China. Current schema only marks Australia as service area, missing the China manufacturing hub context.

### Recommended Fix

Add `areaServed: China` to Organization schema to match content:
```json
"areaServed": [
  { "@type": "Country", "name": "Australia" },
  { "@type": "Country", "name": "China" }
]
```

This should be addressed in Phase 24 (not Phase 25) since it's a schema consistency issue.

---

## Recommended Restructure

### Option A: Keep 3 Phases, Update Status

| Phase | Actual Work Remaining |
|-------|----------------------|
| Phase 23 | Create llms.txt route handler only |
| Phase 24 | Add BreadcrumbSchema to /enquiry + Fix geographic consistency |
| Phase 25 | Add speakableSpecification + Add third-party citations |

### Option B: Consolidate to 2 Phases (Recommended)

| Phase | Work |
|-------|------|
| Phase 23 | llms.txt + robots.txt reference (1 item remaining) |
| Phase 24 | All schema work (breadcrumbs on /enquiry, geographic fix, speakable, citations) |

**Rationale:** Phase 24 and Phase 25 are both schema/content work with minimal dependency on each other. Separating them creates unnecessary phase overhead.

### Option C: Reorder + Consolidate (Optimal)

| Phase | Work |
|-------|------|
| Phase 23 | AI Crawler Infrastructure (llms.txt creation) |
| Phase 24 | Schema Enhancement (breadcrumbs, geographic consistency) |
| Phase 25 | Content Citability (speakable, third-party citations) |

Keep ordering but clarify that robots.txt is DONE and only llms.txt is Phase 23's remaining work.

---

## Issues Requiring Resolution

### 1. Phase Status Misreporting
**Problem:** ROADMAP.md marks Phase 23 as "Not started" but robots.txt work is complete.
**Action:** Update ROADMAP.md to reflect actual state, or split Phase 23 into sub-tasks.

### 2. BreadcrumbSchema Missing on /enquiry
**Problem:** Success criteria says "all pages" but enquiry page has no breadcrumbs.
**Action:** Add BreadcrumbSchema to `/enquiry/page.tsx` in Phase 24.

### 3. Geographic Inconsistency
**Problem:** Schema shows Australia only; content references China.
**Action:** Add China to `areaServed` in Organization/LocalBusiness schema.

### 4. FAQPage Missing speakableSpecification
**Problem:** Phase 25 requires but FAQSchema lacks speakable marking.
**Action:** Add `xpath` or `cssSelector` to FAQPage JSON-LD in Phase 25.

### 5. No Third-Party Citations
**Problem:** Phase 25 requires verifiable external references.
**Action:** Identify authoritative sources (DFAT trade data, ABS import statistics, AusTrade resources) and integrate into blog content.

---

## Verification Checklist

Before Phase 23 completion:
- [ ] `/llms.txt` returns 200 with markdown content
- [ ] robots.txt already has AI crawler rules (verify present)

Before Phase 24 completion:
- [ ] All blog posts have Article schema (verify 10 posts)
- [ ] Organization has sameAs to all social profiles
- [ ] Person schema has sameAs + knowsAbout
- [ ] BreadcrumbSchema added to /enquiry page
- [ ] Geographic consistency verified (China + Australia in areaServed)

Before Phase 25 completion:
- [ ] FAQPage has speakableSpecification
- [ ] Third-party citations added to at least one page
- [ ] Geographic claims consistent between schema and visible content

---

## Conclusion

**Phase ordering is correct.** The dependency chain (23 → 24 → 25) makes logical sense. However:

1. **Phase 23 is mostly done** - only llms.txt creation needed
2. **Phase 24 is mostly done** - only /enquiry breadcrumbs + geographic fix needed
3. **Phase 25 has the most remaining work** - speakable + citations

**Recommendation:** Use Option C (keep 3 phases with clear status) to maintain granularity while ensuring accurate progress tracking.

---

*Validation completed: 2026-03-25*
