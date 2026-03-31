# Phase 23: AI Crawler Infrastructure - llms.txt Format Research

**Researched:** 2026-03-25
**Domain:** llms.txt file format specification and best practices
**Confidence:** HIGH

## Summary

The `llms.txt` specification is an emerging standard (v1.1.1 as of 2026-02-13) for providing AI systems with structured, curated information about a business. Unlike robots.txt which controls crawler access, llms.txt provides **content context** for AI systems to accurately represent a business at inference time. The format is Markdown-based with a defined hierarchy: H1 business name (required), blockquote summary (required), optional body text, and H2 sections for categorized information.

**Primary recommendation:** Fix WAG's llms.txt to comply with official specification — remove fabricated claims ("47 reviews", "8+ years"), fix geographic contradictions, add required sections (## Contact already present), and add recommended ## What We Do Not Do section.

## Official Specification Source

- **Canonical spec:** https://www.ai-visibility.org.uk/specifications/llms-txt/ (v1.1.1, 2026-02-13)
- **Reference implementation:** https://llmstxtgenerator.org/llmstxt-documentation

## Standard Stack

### Format Requirements

| Property | Requirement |
|----------|-------------|
| Encoding | UTF-8 (required) |
| Line endings | LF (Unix-style) recommended |
| Syntax | Markdown (CommonMark compatible) |
| Maximum size | No hard limit; recommended under 50KB |

### Required Structure (in order)

1. **H1 heading** — Business name (exactly one, must be first)
2. **Blockquote** — 1-3 sentence summary with `>` prefix
3. **Body text** — Additional context (optional, no headings)
4. **H2 sections** — Categorized information with link lists

### Required Sections

| Section | Status | WAG Current State |
|---------|--------|-------------------|
| `# [Business Name]` | Required | Present (needs update) |
| `> [Summary]` | Required | Present (has fabricated claims) |
| `## Contact` | Required | Present |

### Recommended Sections

| Section | Status | WAG Current State |
|---------|--------|-------------------|
| `## Services` | Recommended | Present |
| `## What We Do Not Do` | Recommended | **Missing** |
| `## Key Information` | Recommended | Present (partial) |
| `## AI Discovery Files` | Recommended | **Missing** |

### Optional Sections

| Section | Notes |
|---------|-------|
| `## Team` or `## Leadership` | Optional - founder info |
| `## Locations` | Optional - geographic presence |
| `## Industries` | Optional - sectors served |

## Architecture Patterns

### Link Format

```
- [Link Text](https://example.com/page): Optional description
```

The colon and description are optional but recommended for clarity.

### Special "Optional" Section

If an H2 section named "Optional" is included, URLs there **can be skipped** if a shorter context is needed. Use for secondary information.

## Content Not Permitted (per spec)

| Forbidden Content | Why | WAG Issues |
|-------------------|-----|------------|
| Marketing hyperbole ("best", "leading", "world-class") | Unverifiable | Some present |
| Pricing information | Outdated quickly | None (correctly linked) |
| Unverified claims | AI will cross-validate | **"47 reviews" is fabricated** |
| Testimonials/reviews | Belongs on website | **"4.9/5 (47 reviews)"** |
| Geographic inaccuracies | Contradicts other data | **"Zhengzhou, Shaanxi"** |

## Key Issues in Current WAG llms.txt

### P0 Issues (Must Fix)

| Issue | Current | Correct | Reference |
|-------|---------|---------|-----------|
| Fabricated reviews | "4.9/5 (47 reviews)" | Remove | Authenticity principle in PROJECT.md |
| Operating years | "8+ years" | "Since December 2025" | CONTEXT.md decisions |
| Geographic contradiction | "Zhengzhou, Shaanxi (6 provinces)" | "Shenzhen, Foshan, Guangzhou" | CONTEXT.md - Zhengzhou is Henan, Shaanxi is separate |

### Recommended Additions

| Section | Purpose |
|---------|---------|
| `## What We Do Not Do` | Prevent AI from incorrectly inferring services |
| `## AI Discovery Files` | Link to robots.txt, sitemap.xml |
| ABN verification link | Add in ## Contact section |

## Size and Freshness

| Aspect | Recommendation |
|--------|----------------|
| Target size | Under 50KB (current ~4KB - healthy) |
| Freshness indicator | Add "Last updated: 2026-03-25" to header |
| Update frequency | Quarterly minimum, or when business changes |

## Trust Signals - What to Include vs Exclude

### Should Include

- Factual, verifiable business information
- ABN with verification link
- Physical address
- Contact methods
- Service descriptions with links
- Explicit exclusions (## What We Do Not Do)

### Should NOT Include

- Statistics that cannot be verified (fabricated "47 reviews")
- Vague duration claims ("8+ years" when operating since Dec 2025)
- Geographic errors (Zhengzhou in Shaanxi)
- Ratings without source
- Marketing superlatives

## Validation Checklist

Based on official spec validation rules:

- [ ] Exactly one H1 heading as first content element
- [ ] Blockquote immediately follows H1 heading
- [ ] All URLs are absolute and use HTTPS
- [ ] Contact information present and accurate
- [ ] No marketing hyperbole or unverified claims
- [ ] No testimonials or reviews
- [ ] Geographic data consistent with other sources

## Sources

### Primary (HIGH confidence)

- ai-visibility.org.uk specification v1.1.1 - canonical format specification
- llmstxtgenerator.org documentation - implementation guidance

### Secondary (MEDIUM confidence)

- None requiring verification

## Metadata

**Confidence breakdown:**
- Format specification: HIGH - official source, dated 2026-02-13
- Best practices: HIGH - from official specification
- WAG issues identified: HIGH - cross-referenced with CONTEXT.md and REQUIREMENTS.md

**Research date:** 2026-03-25
**Valid until:** 2026-06-25 (90 days - specification is stable at v1.1.1)
