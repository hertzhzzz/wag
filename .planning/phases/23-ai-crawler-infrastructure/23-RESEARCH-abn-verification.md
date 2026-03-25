# Phase 23: ABN Verification - Research

**Researched:** 2026-03-25
**Domain:** Australian Business Number (ABN) verification URL standards
**Confidence:** HIGH

## Summary

The proposed ABN verification URL `https://www.abrs.business.gov.au/ABRSearch?abn=30659034919` is **INCORRECT**. The official Australian Business Register (ABR) operates at `abr.business.gov.au`, not `abrs.business.gov.au`. Additionally, the URL parameter format is `SearchText`, not `abn`.

**Primary recommendation:** Use `https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919` for ABN verification. Display ABN as `30 659 034 919` (with spaces in 2-3-3-3 format per official ABR examples).

## Official ABN Verification URL

### Correct URL Format

| Component | Value |
|-----------|-------|
| Domain | `abr.business.gov.au` (not `abrs.business.gov.au`) |
| Path | `/Search/ResultsActive` |
| Parameter | `SearchText=30659034919` (no spaces) |
| Full URL | `https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919` |

**Verification result:** ABN 30 659 034 919 is registered to "LIU, ZHANGYUANZIHAI" with business name "WINNING ADVENTURE GLOBAL", active from 22 Aug 2023.

### Why the Proposed URL is Wrong

The proposed URL `https://www.abrs.business.gov.au/ABRSearch?abn=30659034919` has two errors:

1. **Wrong domain:** `abrs.business.gov.au` does not exist. The ABR operates at `abr.business.gov.au`
2. **Wrong parameter:** The search endpoint uses `SearchText`, not `abn`

Note: `abrs.gov.au` is Australian Business Registry Services, which handles director identification numbers (director ID), not ABN lookup.

## ABN Display Format

### Official Standard

The official ABR documentation shows ABN formatted with spaces in groups of 2-3-3-3:

```
51 824 753 556  (ATO's own ABN, shown in official docs)
30 659 034 919  (WAG's ABN)
```

### ABN Format Options

According to official ABN format documentation, ABN can be displayed in multiple valid formats:

| Format | Example | Use Case |
|--------|---------|----------|
| With spaces (2-3-3-3) | `30 659 034 919` | **Recommended for trust signals** |
| With hyphens | `30-659-034-919` | Alternative readable format |
| With dots | `30.659.034.919` | Alternative readable format |
| No delimiter | `30659034919` | Database/URL storage only |

**Recommendation for llms.txt:** Display as `30 659 034 919` (with spaces). This matches the official format and is most recognizable to humans reading the document.

## ABN as Trust Signal

### No Official "Verified" Badge

There is **no official "verified" badge** for ABN. The ABR provides a public search database only. Any "verified" badge displayed on websites is a third-party interpretation, not an official endorsement.

### Best Practice for Trust Signals

For llms.txt and similar trust signal contexts:

1. **Display ABN in standard format** with spaces: `30 659 034 919`
2. **Include direct verification link** that links to the official ABR search result
3. **Do not claim "verified" status** unless you have actually undergone a formal verification process
4. **Link text should indicate the purpose**, e.g., `Verify ABN: 30 659 034 919`

### Example in llms.txt

```
ABN: 30 659 034 919 (Verify at https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919)
```

Or with link markup:

```
ABN: [30 659 034 919](https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919)
```

Note: llms.txt is plain text, so markdown links may or may not be parsed correctly by AI crawlers. The raw URL approach is safer.

## Clickable Links in llms.txt

### Recommendation

**Yes, include clickable verification links.** AI crawlers can parse URLs and use them to verify claims. A direct link to the official ABN record is more useful than a link to the general ABR homepage.

### Format for AI Crawlers

Plain text URL format is most reliable:

```
ABN: 30 659 034 919
Verification: https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919
```

## Summary of Corrections

| Item | Proposed (INCORRECT) | Correct |
|------|---------------------|---------|
| Domain | `abrs.business.gov.au` | `abr.business.gov.au` |
| Parameter | `?abn=30659034919` | `?SearchText=30659034919` |
| Full URL | (invalid) | `https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919` |
| ABN display | unknown | `30 659 034 919` (with spaces) |

## Sources

### Primary (HIGH confidence)
- [ABN Lookup Official Site](https://abr.business.gov.au/) - Confirms domain is `abr.business.gov.au`
- [Format of the ABN](https://abr.business.gov.au/Help/AbnFormat) - Official format documentation showing `51 824 753 556` with spaces
- [ABR Search Results for WAG ABN](https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919) - Live verification of WAG's ABN

### Secondary (MEDIUM confidence)
- [LookupTax ABN Verification Guide](https://lookuptax.com/docs/how-to-verify/abn-verification) - Confirms ABR search URL format
- [Wikipedia: Australian Business Number](https://en.wikipedia.org/wiki/Australian_Business_Number) - General ABN information

## Metadata

**Confidence breakdown:**
- Official URL format: HIGH - Verified via official ABR website
- Display format: HIGH - Official documentation shows space format
- Trust signal standards: HIGH - No official verified badge exists

**Research date:** 2026-03-25
**Valid until:** 90 days (ABR URL structure is stable)
