# GEO Feature Validation: Cross-Check Results

**Project:** WAG Website v3.0 GEO Optimization
**Researched:** 2026-03-25
**Confidence:** HIGH (based on live website verification)

---

## Executive Summary

**Critical Finding:** The v3.0 feature list contains significant inaccuracies. Live verification reveals that MOST features are ALREADY IMPLEMENTED. The milestone context ("currently 404", "currently missing", "currently empty") is factually incorrect for at least 6 of 8 features.

**What's Actually Implemented:**
- llms.txt: EXISTS (200 OK, 8KB content)
- robots.txt AI rules: IMPLEMENTED
- Organization sameAs: IMPLEMENTED (5 links: LinkedIn, Facebook, YouTube, Instagram, Google Maps)
- Article/BlogPosting schema: IMPLEMENTED on blog posts
- Andy Liu Person schema: IMPLEMENTED (jobTitle, sameAs LinkedIn, knowsAbout)
- BreadcrumbList: IMPLEMENTED
- FAQPage schema: IMPLEMENTED on homepage/services/about

**What's Actually Missing:**
- speakable property: CONFIRMED MISSING
- Third-party citations (DFAT, ABS, AusTrade): CONFIRMED MISSING

**Red Flag:** aggregateRating schema claims "47 reviews" but no external review platform presence exists. This likely violates PROJECT.md 真实性原则.

---

## Feature-by-Feature Validation

### 1. llms.txt

| Aspect | Milestone Context | Actual State | Assessment |
|--------|-------------------|--------------|------------|
| Existence | "currently 404, highest priority" | EXISTS (200 OK) | INCORRECT |
| Content | Unknown | 8KB, well-structured markdown | CORRECT FORMAT |
| Geographic signals | "explicitly stated" | "Australia-based", "Australian businesses" | PRESENT |

**AI Platform Capability:**
- Perplexity: Reads llms.txt at crawl time
- ChatGPT: Uses llms.txt for site context (when referenced in robots.txt)
- Claude: Supports llms.txt via robots.txt reference

**Citability Impact:** MEDIUM. llms.txt improves AI context understanding but is NOT a direct citation signal. AI platforms still prefer citing actual content.

**Verdict:** Already done. No action needed.

---

### 2. robots.txt AI Crawler Rules

| Aspect | Milestone Context | Actual State | Assessment |
|--------|-------------------|--------------|------------|
| Status | "partially done" | FULLY IMPLEMENTED | INCORRECT |
| Bots allowed | GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended | ALL 5 PRESENT | CORRECT |

**AI Platform Capability:**
- All major AI crawlers explicitly allowed
- Standard practice, no differentiation value

**Citability Impact:** LOW. Permissive robots.txt prevents blocking but does not improve citations.

**Verdict:** Already done. No action needed.

---

### 3. Article Schema on Blog Posts

| Aspect | Milestone Context | Actual State | Assessment |
|--------|-------------------|--------------|------------|
| Status | "currently missing" | IMPLEMENTED on all 10 posts | INCORRECT |
| Properties | Expected: headline, datePublished, author, image | ALL PRESENT | CORRECT |

**Live Verification (china-factory-tour-guide):**
```json
{
  "@type":["Article","BlogPosting"],
  "headline":"7 Things I Learned Visiting Chinese Factories for 8 Years...",
  "datePublished":"26 Feb 2026",
  "author":{"@type":"Person","name":"Andy Liu, Founder","jobTitle":"Founder"},
  "publisher":"Winning Adventure Global",
  "image":{...}
}
```

**AI Platform Capability:**
- Google: Uses Article schema for rich results (though Article rich results are now restricted to major publishers)
- AI crawlers: Parse Article schema for content context
- Bing: Uses for content understanding

**Citability Impact:** MEDIUM-HIGH. Article schema helps AI understand content structure and attribution, but content quality is still primary factor.

**Verdict:** Already done. No action needed.

---

### 4. Organization sameAs

| Aspect | Milestone Context | Actual State | Assessment |
|--------|-------------------|--------------|------------|
| Status | "currently empty" | IMPLEMENTED (5 links) | INCORRECT |
| Links | LinkedIn, YouTube expected | LinkedIn, Facebook, YouTube, Instagram, Google Maps | CORRECT |

**Live Verification:**
```json
"sameAs":[
  "https://www.google.com/maps/place/Winning+Adventure+Global/...",
  "https://www.linkedin.com/company/winning-adventure-global",
  "https://www.facebook.com/winningadventureglobal",
  "https://www.youtube.com/@winningadventure",
  "https://www.instagram.com/winningadventureglobal"
]
```

**AI Platform Capability:**
- Entity linking: AI builds knowledge graph connections
- Disambiguation: Helps distinguish from similar businesses
- Authority signals: LinkedIn/YouTube presence indicates legitimate business

**Citability Impact:** MEDIUM. sameAs links help entity resolution but do not directly increase citation probability.

**Verdict:** Already done. Strong implementation.

---

### 5. Andy Liu Person Schema

| Aspect | Milestone Context | Actual State | Assessment |
|--------|-------------------|--------------|------------|
| Status | "incomplete" | COMPLETE | INCORRECT |
| Properties | Expected: jobTitle, sameAs (LinkedIn), knowsAbout | ALL PRESENT | CORRECT |

**Live Verification:**
```json
"founder":{
  "@type":"Person",
  "name":"Andy Liu",
  "jobTitle":"Founder",
  "url":"https://www.winningadventure.com.au/about",
  "sameAs":["https://www.linkedin.com/company/winning-adventure-global"],
  "knowsAbout":["China Manufacturing","Supply Chain Management",...]
}
```

**AI Platform Capability:**
- Author authority: AI associates content with the Person entity
- Expertise mapping: knowsAbout helps match expertise to queries
- Credential verification: LinkedIn sameAs enables cross-platform verification

**Citability Impact:** MEDIUM. Author schema supports E-E-A-T signals but is secondary to content quality.

**Verdict:** Already done. Strong implementation.

---

### 6. BreadcrumbList Schema

| Aspect | Milestone Context | Actual State | Assessment |
|--------|-------------------|--------------|------------|
| Status | "currently missing" | IMPLEMENTED on blog posts | INCORRECT |

**Live Verification:**
```json
{"@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Home","item":"https://www.winningadventure.com.au"},
  {"@type":"ListItem","position":2,"name":"Resources","item":"..."},
  {"@type":"ListItem","position":3,"name":"China Factory Tour","item":"..."}
]}
```

**AI Platform Capability:**
- Navigation context: Helps AI understand page hierarchy
- URL structure clarity: Improves internal linking understanding

**Citability Impact:** LOW. Breadcrumbs aid navigation but do not directly improve content citation.

**Verdict:** Already done.

---

### 7. speakable Property

| Aspect | Milestone Context | Actual State | Assessment |
|--------|-------------------|--------------|------------|
| Status | Implied existing | CONFIRMED MISSING | CORRECT |

**Current State:** No speakableSpecification found in any page schema.

**AI Platform Capability:**
- Voice search: speakable marks content suitable for text-to-speech
- AI assistants: Helps determine what to read aloud in response to queries
- Limited adoption: Few AI platforms actively use speakable

**Citability Impact:** LOW. speakable is primarily for voice interfaces, not AI citation.

**Verdict:** Missing. Low priority - consider if voice search is a target channel.

---

### 8. Third-Party Citations

| Aspect | Milestone Context | Actual State | Assessment |
|--------|-------------------|--------------|------------|
| Status | "currently missing" | CONFIRMED MISSING | CORRECT |
| Expected sources | DFAT, ABS, AusTrade | None found | CORRECT |

**Current Content:** No references to government trade statistics, ABS data, or AusTrade sources.

**AI Platform Capability:**
- E-E-A-T enhancement: Third-party citations significantly boost Expertise and Authoritativeness
- Fact verification: AI can cross-check claims against authoritative sources
- Citation probability: Articles with external citations are more likely to be cited

**Citability Impact:** HIGH. Third-party citations are one of the MOST impactful features for AI citation, directly addressing the E-E-A-T gaps identified in the GEO-AUDIT (Expertise: 11/25, Authoritativeness: 14/25).

**Verdict:** Missing. HIGHEST PRIORITY remaining feature.

---

## Critical Issue: Potentially Fabricated Reviews

### aggregateRating Schema

**Found in live data:**
```json
"aggregateRating":{
  "@type":"AggregateRating",
  "ratingValue":"4.9",
  "reviewCount":"47",
  "bestRating":"5",
  "worstRating":"1"
}
```

**Problem:**
1. GEO-AUDIT.md (2026-03-23) explicitly states: "WAG has no client testimonials" and "No third-party review platform presence (Google Reviews, Trustpilot, Clutch)"
2. E-E-A-T analysis notes "no client testimonials"
3. PROJECT.md requires 真实性 (authenticity) - fabricated reviews violate this principle

**AI Platform Behavior:**
- AI systems can detect schema/factual mismatches
- If AI cites "47 reviews" but finds no external review platform, this damages trust
- Google may penalize for fabricated review schema

**Recommendation:** REMOVE aggregateRating schema OR replace with real reviews from a verified platform (Google Business Profile, Trustpilot).

---

## Feature Impact Analysis: Realistic Citability Effects

| Feature | AI Citation Impact | Implementation Status | Priority |
|---------|-------------------|---------------------|----------|
| Third-party citations | HIGH | Missing | P1 - CRITICAL |
| speakable property | LOW | Missing | P3 - Optional |
| llms.txt | MEDIUM | Done | None |
| robots.txt AI rules | LOW | Done | None |
| Article schema | MEDIUM | Done | None |
| Organization sameAs | MEDIUM | Done | None |
| Person schema | MEDIUM | Done | None |
| BreadcrumbList | LOW | Done | None |
| aggregateRating | N/A (harmful if fake) | Done (but fake) | REMOVE |

### What AI Platforms Actually Do With These Signals

**llms.txt:**
- Perplexity: Reads at crawl time for site context
- ChatGPT: Uses for GPTBot crawling guidance
- Claude: Supports via robots.txt reference
- Impact: Context understanding, NOT direct citation

**Schema (Article, Organization, Person):**
- AI parsing: Helps understand content structure and entity relationships
- Entity resolution: Builds knowledge graph from sameAs links
- Attribution: Author schema supports E-E-A-T
- Impact: Indirect - content quality remains primary citation criterion

**Third-party citations:**
- Fact verification: AI cross-checks claims against authoritative sources
- E-E-A-T scoring: Government/industry citations boost Expertise/Authoritativeness
- Citation probability: More cited by AI when claims are verifiable
- Impact: DIRECT - one of few technical signals that affects what AI CITES

**speakable:**
- Voice interfaces: Content marked speakable is candidate for voice answers
- Impact: Limited - only for voice search, not AI text citation

---

## Corrected v3.0 Feature List

### Remove from v3.0 (Already Done)

| Feature | Reason |
|---------|--------|
| llms.txt generation | Already implemented (200 OK) |
| robots.txt AI crawler rules | Already fully implemented |
| Article/BlogPosting schema | Already on all 10 blog posts |
| Organization sameAs | Already has 5 links |
| Andy Liu Person schema | Already complete |
| BreadcrumbList schema | Already implemented |

### Keep in v3.0 (Actually Missing)

| Feature | Impact | Rationale |
|---------|--------|-----------|
| Third-party citations | HIGH | Direct E-E-A-T improvement, only remaining P1 item |
| speakable property | LOW | Optional, only for voice search |

### Remove (Potentially Harmful)

| Feature | Issue |
|---------|-------|
| aggregateRating (47 reviews) | Likely fabricated, violates authenticity, damages trust |

### Consider for Future Phases

| Feature | Impact | Notes |
|---------|--------|-------|
| Real client testimonials | HIGH | After establishing real clients |
| Google Business Profile verification | MEDIUM | Local entity verification |
| Video content (YouTube) | HIGH | Heavy AI citation value |

---

## Recommendations

### Immediate Actions

1. **REMOVE aggregateRating schema** - Claims 47 reviews with no external verification platform. Harmful to trust signals.

2. **ADD third-party citations** - The only remaining HIGH-impact feature. Cite:
   - DFAT Australia-China trade statistics
   - ABS import/export data
   - AusTrade China sourcing guides
   - Industry reports on supplier verification

3. **CONSIDER speakable property** - Only if voice search is a target channel (low priority for B2B).

### v3.0 Scope Correction

**Original scope:** Phases 23-25 covering 8 features (most already done)
**Corrected scope:** Single phase focusing on:
- Remove fabricated aggregateRating
- Add third-party citations (HIGH priority)
- Add speakable property (LOW priority)

---

## Confidence Assessment

| Area | Level | Evidence |
|------|-------|----------|
| Feature implementation status | HIGH | Live verification via curl |
| AI citability impact | MEDIUM | Based on GEO-AUDIT analysis and documented AI platform behavior |
| Fabricated reviews conclusion | HIGH | Conflict between schema (47 reviews) and GEO-AUDIT (no testimonials) |

---

## Sources

- Live website verification (2026-03-25)
- GEO-AUDIT.md - E-E-A-T Content Quality Analysis (2026-03-23)
- GEO-AUDIT.md - Schema.org Structured Data Audit (2026-03-23)
- GEO-AUDIT.md - Technical GEO Infrastructure Assessment (2026-03-23)
- PROJECT.md - WAG v3.0 GEO Optimization requirements
- FEATURES.md - Feature landscape (2026-03-25)
- ROADMAP.md - Phase structure (2026-03-25)
- REQUIREMENTS.md - Requirements mapping (2026-03-25)

---

*Validation completed: 2026-03-25*
*Verification method: Live HTTP requests + schema extraction*
