# Project Research Summary

**Project:** WAG Website v3.0 GEO Optimization
**Domain:** GEO (Generative Engine Optimization) for B2B Sourcing Websites
**Researched:** 2026-03-25
**Confidence:** MEDIUM-HIGH

## Executive Summary

GEO optimization for WAG is fundamentally different from traditional SEO — it requires building verifiable trust signals that AI citation systems can cross-reference, not just keyword optimization. The site already has a strong foundation: AI crawler rules are in robots.txt, and existing schemas (Organization, LocalBusiness, FAQPage, Service, Article, Person, Breadcrumb) provide good AI-understandable structured data. The primary gap is the missing `llms.txt` endpoint, which AI crawlers (Perplexity, ChatGPT, Claude) look for as a discovery mechanism. Additional gaps include incomplete Organization `sameAs` arrays (zero social links), missing Article schema on all 10 blog posts, and incomplete Andy Liu Person schema.

The recommended approach is to implement `llms.txt` first, then systematically address schema gaps in dependency order. The critical risk is fabricating E-E-A-T signals — AI systems actively cross-reference claims, and getting caught producing fake trust signals results in permanent trust loss in AI responses. All claims must be verifiable through public, citable evidence.

## Key Findings

### Recommended Stack

No new packages are required. GEO for Next.js is primarily configuration and content strategy. The implementation requires only:

- **Custom `/app/llms.txt/route.ts`** — Dynamic route handler generating markdown summaries for AI crawlers (no library needed)
- **Existing schemas** — Organization, LocalBusiness, FAQPage, Service, Article, Person, Breadcrumb already in place
- **Existing robots.txt** — Already has GPTBot, ClaudeBot, PerplexityBot, Google-Extended allowed
- **Optional enhancements** — SpeakableSpecification on FAQPage, HowTo schema for procedural blog content

### Expected Features

**Must have (table stakes):**
- `llms.txt` — AI crawler discovery file at root. Currently 404. HIGHEST PRIORITY.
- Article/BlogPosting schema — 10 blog posts have zero Article schema. CRITICAL gap.
- Organization `sameAs` array — Links to LinkedIn, YouTube, social profiles. Currently 0 links. CRITICAL.
- Andy Liu Person schema completion — Add jobTitle, sameAs (LinkedIn), knowsAbout, image
- Explicit AI crawler rules in robots.txt — Already complete

**Should have (competitive differentiation):**
- Google Business Profile — Verify and claim (currently NOT claimed)
- Client testimonials with attribution — Must be REAL per constraints, no fabrications
- Third-party statistics with citations — DFAT trade data, ABS import stats
- BreadcrumbList schema — Currently MISSING

**Defer (v2+):**
- YouTube channel + video content — Heavy AI citation value but requires content production
- Wikipedia page — Requires notability thresholds
- Trustpilot/Google Reviews — After establishing client base

### Architecture Approach

Next.js App Router with JSON-LD structured data. GEO additions require:
1. **`app/llms.txt/route.ts`** — Route handler generating markdown with page summaries
2. **`app/components/AIMetaTags.tsx`** — AI-specific meta tags for citability optimization
3. **`app/components/EnhancedOrgSchema.tsx`** — Organization schema with AI-specific properties and `sameAs` arrays

The existing schema infrastructure requires no changes. Build order: llms.txt first (foundational), then AIMetaTags, then layout integration.

### Critical Pitfalls

1. **Fabricated E-E-A-T Signals** — AI systems cross-reference and fact-check trust claims. Getting caught = permanent trust loss. Only claim what can be substantiated with public, citable evidence. Replace stock photos with authentic imagery.

2. **llms.txt Misconfiguration** — AI ignores walls of text. Include only high-value pages (2-3 sentence descriptions max), prioritize by citation value, mark geographic relevance explicitly. Keep under 10KB.

3. **AI Schema Markup Overclaiming** — Copying competitor schema patterns without verification. Audit every schema claim against public verification sources. Use OfficialRecordsSchema for verifiable registrations.

4. **Geographic Signal Confusion** — Schema says one location, footer says another. Be explicit: "Based in Australia, serving Australian businesses with China sourcing" not "global leader."

5. **Thin Content Citability** — Pages look substantial but lack specific factual claims AI needs for citation. Replace "we provide excellent service" with "our verification process includes 12-point factory assessment."

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: llms.txt Foundation
**Rationale:** `llms.txt` is the highest-priority table stakes item and foundational for AI crawler discovery. AI crawlers look for this first. All other GEO work depends on having an accurate site map for AI systems.
**Delivers:** `/app/llms.txt/route.ts` generating markdown summaries of all pages and blog posts
**Addresses:** FEATURES: llms.txt (P1)
**Avoids:** PITFALL: llms.txt misconfiguration — requires careful content prioritization and geographic signal inclusion
**Research Flag:** None needed — standard llms.txt patterns, well understood

### Phase 2: Schema Foundation & Organization Entity
**Rationale:** Organization schema must be complete before adding linked entity data. `sameAs` array is critical for AI to build entity graph. Person schema for Andy Liu depends on Organization schema consistency.
**Delivers:** Complete Organization schema with full `sameAs` array (LinkedIn, YouTube, social), complete Andy Liu Person schema with credentials
**Addresses:** FEATURES: Organization sameAs (P1), Andy Liu Person schema completion (P1), Article schema on blog posts (P1)
**Avoids:** PITFALL: Fabricated E-E-A-T signals — requires all claims to be verifiable
**Research Flag:** None needed — Schema.org patterns well documented

### Phase 3: Content Citability Optimization
**Rationale:** After structural foundations are in place, optimize actual page content for AI citation. This requires auditing content for factual claim density and adding specific verifiable statistics.
**Delivers:** Content audit across all pages, factual claims enhanced, geographic signals consistent across all structured data
**Addresses:** FEATURES: Third-party citations (P2)
**Avoids:** PITFALL: Thin content citability, Geographic signal confusion
**Research Flag:** Phase needs content audit — may require `/gsd:research-phase` for specific content strategy

### Phase 4: GEO Technical Audit & Verification
**Rationale:** Verify all structured data, test with structured data testing tools, ensure geographic consistency. This is the verification phase before claiming completion.
**Delivers:** Schema audit report, geographic signal verification, llms.txt validation
**Addresses:** PITFALL: AI Schema markup overclaiming, Geographic signal confusion
**Research Flag:** Phase may need structured data testing tool research

### Phase 5: Real Trust Signal Accumulation (Client-side)
**Rationale:** Real testimonials and third-party reviews require actual client relationships. This phase is deferred until real clients are available. Cannot be rushed or faked.
**Delivers:** Client testimonials (with permission), Google Business Profile claim and optimization
**Addresses:** FEATURES: Google Business Profile (P2), Client testimonials (P2)
**Avoids:** PITFALL: Fabricated E-E-A-T signals — critical to never fake these
**Research Flag:** None needed — standard Google Business Profile verification process

### Phase Ordering Rationale

- **llms.txt first:** AI crawler discovery is foundational — without it, AI systems may miss or misinterpret content
- **Schema/entity second:** Entity building requires consistent base data before linking
- **Content third:** Content optimization depends on knowing what structure exists
- **Technical audit fourth:** Verification before claiming completion
- **Real trust signals last:** These cannot be rushed — only add when real clients available

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Content Citability):** May need content audit research to identify specific claim gaps
- **Phase 5 (Trust Signals):** Google Business Profile verification process may need research

Phases with standard patterns (skip research-phase):
- **Phase 1 (llms.txt):** Well-documented community convention, established patterns exist
- **Phase 2 (Schema):** Schema.org patterns well documented
- **Phase 4 (Technical Audit):** Standard structured data testing tools

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | No new packages needed; existing Next.js App Router supports all required patterns |
| Features | HIGH | Based on phase 19 GEO audit research, competitor analysis, established SEO/GEO patterns |
| Architecture | MEDIUM | App Router patterns well understood; llms.txt is community convention, not official standard |
| Pitfalls | MEDIUM | Based on established SEO domain patterns; web search was unavailable during research |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **llms.txt specification evolution:** The llms.txt format is still evolving as a community convention. Verify against authoritative source (llmsst.com) before final implementation.
- **AI crawler documentation:** Current AI crawler behavior documentation is sparse. Monitor citation accuracy after deployment.
- **Real testimonials timeline:** Cannot implement client testimonials phase until real client relationships exist. Timeline uncertain.

## Sources

### Primary (HIGH confidence)
- STACK.md — Verified existing WAG codebase, confirmed robots.txt AI crawler rules
- FEATURES.md — Based on phase 19 GEO audit research, established SEO/GEO domain patterns
- ARCHITECTURE.md — Direct analysis of existing WAG App Router architecture

### Secondary (MEDIUM confidence)
- llms.txt standard — https://llmsst.com — Community convention, not official standard
- Schema.org documentation — Official specs for structured data properties
- Google E-E-A-T guidelines — Google Search Central documentation

### Tertiary (LOW confidence)
- PITFALLS.md — Based on established patterns; web search unavailable, needs validation against current AI crawler documentation
- Next.js llms.txt libraries — Confirmed no mature Next.js library exists (inferred from NPM ecosystem search)

---
*Research completed: 2026-03-25*
*Ready for roadmap: yes*
