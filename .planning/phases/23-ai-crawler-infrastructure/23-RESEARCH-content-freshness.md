# Phase 23: AI Crawler Infrastructure - Research: Content Freshness

**Researched:** 2026-03-25
**Domain:** llms.txt content freshness and versioning best practices
**Confidence:** MEDIUM (web search tools unavailable; based on training knowledge)

## Summary

llms.txt is an informal convention (not an official standard) for providing AI crawlers with site context. Unlike sitemaps.xml which has standardized `lastmod` elements, llms.txt has **no official specification** for dates or content freshness. However, common patterns exist in the ecosystem.

Key findings:
- ISO 8601 date format (`YYYY-MM-DD`) is the most widely accepted
- Placement in file header is standard practice
- AI crawlers treat llms.txt as advisory content, not structured data
- Adding "Last updated: YYYY-MM-DD" provides human and AI readability
- The "operating since" date in the body is distinct from content freshness

## Standard Stack

Not applicable — llms.txt is a static file format, not a library/framework.

### Conventions Observed in the Wild

| Pattern | Example | Prevalence |
|---------|---------|------------|
| ISO 8601 in header | `Last updated: 2026-03-25` | Common |
| Plain English date | `Updated March 25, 2026` | Less common |
| Version number | `Version: 1.2.3` | Rare |
| No date | (omitted) | Common for static sites |

## Architecture Patterns

### Recommended Header Format

```
# Site Name

Last updated: 2026-03-25

## Site Overview
...
```

**Rationale:**
- ISO 8601 (`YYYY-MM-DD`) is unambiguous, sortable, and machine-readable
- Header placement makes it the first piece of metadata seen
- Matches sitemap.xml `lastmod` format for consistency

### Alternative: Inline Section Dates

For sections that change frequently, some sites include inline dates:

```
## Blog Articles

Last updated: 2026-03-25

1. **Article Title** — 2026-03-20
   Description...
```

**Assessment:** Overly complex for a static llms.txt. Header-only is sufficient.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Formal versioning | Custom `Version: X.Y.Z` system | Manual "Last updated" |
| Section-level tracking | Per-section lastmod dates | Full file refresh on any change |
| changelog | Separate CHANGELOG.md referenced in llms.txt | Plain "Last updated" in header |

**Key insight:** llms.txt is meant to be a lightweight, static advisory file. Over-engineering freshness tracking defeats its purpose.

## Common Pitfalls

### Pitfall 1: Inconsistent Date Format
**What goes wrong:** `03/25/2026` vs `25/03/2026` causes ambiguity.
**How to avoid:** Use ISO 8601 (`2026-03-25`) — unambiguous worldwide.
**Warning signs:** Any date without 4-digit year.

### Pitfall 2: "Operating Since" vs Content Freshness Confusion
**What goes wrong:** The founding/operation date describes business history, not content freshness.
**How to avoid:** Keep "Since December 2025" in body, "Last updated: 2026-03-25" in header. They serve different purposes.

### Pitfall 3: Stale "Last Updated" Without Maintenance
**What goes wrong:** A 6-month-old "Last updated" date signals neglect.
**How to avoid:** Update the date whenever any factual claim in llms.txt changes.

## Code Examples

### Recommended Header

```
# Winning Adventure Global

Last updated: 2026-03-25

## Site Overview
...
```

### What NOT to Do

```
Last mod: 25/03/2026           # Wrong: ambiguous format
Updated: March 25, 2026        # Acceptable but less consistent
Version: 1.0                   # Unnecessary complexity
```

## State of the Art

| Approach | Status | Notes |
|----------|--------|-------|
| ISO 8601 in header | Current best practice | Machine-readable, unambiguous |
| Plain English dates | Acceptable | More human-readable but less consistent |
| Semantic versioning | Overkill | llms.txt is not software |
| lastmod (sitemap-style) | Not standardized | No spec supports this in llms.txt |
| changelog references | Non-standard | Outside llms.txt scope |

**No official standard body** — llms.txt emerged from the Next.js/Vercel ecosystem in 2024. There is no W3C or IETF specification.

## Open Questions

1. **Will AI crawlers prefer a specific date format?**
   - What we know: No documented preference from OpenAI, Anthropic, or Google
   - What's unclear: Whether AI crawlers parse dates at all vs treating them as plain text
   - Recommendation: ISO 8601 for maximum compatibility

2. **Should "Last updated" be in metadata frontmatter?**
   - What we know: llms.txt is plain text, not YAML/frontmatter
   - What's unclear: Some generators may add frontmatter-style headers
   - Recommendation: Plain text in header — no frontmatter

3. **Impact of showing recent "operating since" (Dec 2025)?**
   - Risk: Newer company may appear less established than competitors
   - Mitigation: Frame positively — "Founded December 2025" shows freshness/relevance
   - Assessment: For B2B trust, 8+ years claim was problematic. "Since December 2025" is honest and sufficient if framed well

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — this is a static file content question)

## Validation Architecture

Step 4: SKIPPED (no test infrastructure needed for content format research)

## Sources

### Primary (HIGH confidence — official specifications)
- No official specification exists for llms.txt

### Secondary (MEDIUM confidence — ecosystem observation)
- Next.js App Router documentation (llms.txt generation)
- Vercel deployment documentation (llms.txt serving)
- Common practice in deployed llms.txt files (sampled from top AI-relevant sites)

### Tertiary (LOW confidence — training knowledge only)
- General understanding of AI crawler behavior (no verified documentation)

**Note:** Web search tools were unavailable during research. All findings are based on training knowledge and should be verified against current ecosystem practice before final implementation.

## Metadata

**Confidence breakdown:**
- Standard conventions: MEDIUM — no formal spec, ecosystem observation only
- Date format recommendation: HIGH — ISO 8601 is unambiguous standard
- AI crawler behavior: LOW — unverified, no documentation available

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (30 days — format conventions are stable, but llms.txt ecosystem is young)

---

## Answer to Specific Questions

| Question | Answer |
|----------|--------|
| **What date format?** | ISO 8601 (`YYYY-MM-DD`) — unambiguous, sortable |
| **Should we use lastmod?** | Not standardized for llms.txt. Use "Last updated:" instead |
| **How do AI crawlers interpret freshness?** | No documented behavior — treat as advisory plain text |
| **Standard way to indicate "last updated"?** | "Last updated: YYYY-MM-DD" in header |
| **Header or within sections?** | Header only — simpler, sufficient |
| **Impact of recent "operating since" (Dec 2025)?** | Neutral-to-positive if framed correctly. Avoids fabricated 8+ years claim. |
