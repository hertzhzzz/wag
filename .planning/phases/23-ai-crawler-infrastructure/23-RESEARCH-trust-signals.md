# Phase 23: AI Crawler Infrastructure - Trust Signal Research

**Researched:** 2026-03-25
**Domain:** AI search engine trust signal verification / llms.txt authenticity
**Confidence:** MEDIUM (WebSearch verified with authoritative sources)

## Summary

AI search engines (Perplexity, ChatGPT, Google AI Overviews) use retrieval-augmented generation (RAG) to evaluate content credibility before citing. Unlike traditional SEO where ranking is the goal, AI search asks: "Can we trust this enough to cite it?" When trust signals conflict or cannot be verified, content gets filtered out.

**Primary recommendation:** Replace all unverifiable claims with verifiable institutional signals (ABN registration, geographic specificity, service descriptions) that AI engines can cross-reference against authoritative databases.

## How AI Search Engines Verify Claims

### Verification Mechanism

AI engines use RAG (Retrieval-Augmented Generation):
1. Retrieve relevant documents
2. Score by authority, clarity, consistency
3. Synthesize from highest-weighted sources

Unlike Googlebot which crawls and indexes, AI systems actively compare claims against known databases and external verification sources.

### What AI Engines Check

| Signal Type | Verification Method |
|-------------|---------------------|
| Business registration | Cross-reference ABN/Companies House against official registries |
| Geographic claims | Validate against Maps, business directories, postal codes |
| Review counts | Reject if no external source supports the number |
| Age/experience claims | Check domain registration date, archive.org history |
| Credentials | Verify against licensing boards, professional registries |

## Fabricated vs Verifiable Trust Signals

### Fabricated Signals (AI Detects & Penalizes)

| Claim Type | Why AI Rejects It |
|------------|-------------------|
| "47 reviews" with no review platform | No external source to verify; flagged as invented |
| "8+ years experience" (actual: 4 months) | Domain WHOIS + archive.org contradict claim |
| Generic testimonials without source | No review platform, no attribution |
| "Trusted by 1000+ companies" without evidence | Unverifiable magnitude claim |

### Verifiable Signals (AI Accepts)

| Signal | How AI Verifies |
|--------|-----------------|
| ABN 30 659 034 919 | Australian Business Register lookup |
| "Operating since December 2025" | Domain registration + consistent narrative |
| "Shenzhen, Foshan, Guangzhou" | Maps + business directories |
| "500+ verified suppliers" | Verifiable if tied to named sourcing platform |
| "50+ industry sectors" | Too broad to verify; contextual claim safer |

## What Happens When AI Finds Fabricated Claims

1. **Content filtering** — Page excluded from retrieved documents
2. **Trust score reduction** — Overall credibility drops
3. **Brand citation penalty** — Even accurate claims discounted
4. **Negative synthesis** — AI may mention inconsistency in answers

Perplexity and ChatGPT explicitly compare claims across sources. A single contradiction can trigger distrust of all claims on the page.

## WAG Credible Claims Analysis

### SAFE to Claim (Verifiable)

| Claim | Verification Path |
|-------|-------------------|
| "ABN: 30 659 034 919" | Direct ABN lookup via abrs.business.gov.au |
| "Based in Australia" | ABN registration confirms Australian entity |
| "Service area: Australia-wide" | Consistent with ABN location |
| "China operations: Shenzhen, Foshan, Guangzhou" | Geographic specificity; real cities |
| "Operating since December 2025" | Domain age + consistent narrative |
| "500+ verified suppliers" | If verifiable through named sourcing method |
| "50+ industry sectors" | Contextual (not magnitude-verified) |

### CAUTION Required

| Claim | Risk |
|-------|------|
| "200+ factory visits" | Cannot be independently verified; consider removing or adding verification method |
| "Founded by Andy Liu" | Safe if consistent across all pages |
| "Expert in Chinese manufacturing" | Narrative claim; back with specific credentials or experience |

### REMOVE

| Claim | Reason |
|-------|--------|
| "47 reviews" | No review platform; invented number |
| "8+ years experience" | Contradicted by December 2025 start date |
| "Zhengzhou, Shaanxi" | Geographic error; Zhengzhou is in Henan |

## ABN as Primary Trust Signal

The ABN is the strongest verifiable trust signal for WAG because:
- Government-issued, publicly searchable
- Confirms legal entity existence
- Reveals registration date, location, entity type
- Links to Australian regulatory compliance

**Action:** Link ABN prominently with verification URL: `https://www.abrs.business.gov.au/ABRSearch?abn=30659034919`

## Geographic Specificity as Trust Signal

AI engines trust specific, verifiable geography over vague claims.

| Instead of | Use |
|------------|-----|
| "Across China" | "Shenzhen, Foshan, Guangzhou" (specific cities) |
| "Nationwide Australia" | "Australia-wide service" (consistent with ABN) |
| "Zhengzhou, Shaanxi" (wrong) | Remove; only use verified cities |

## Sources

### Primary (HIGH confidence)
- Type and Tale: "AI Content Trust Signals: How Generative Engines Decide What to Cite" (2026-02-23) — Direct explanation of AI verification mechanism

### Secondary (MEDIUM confidence)
- Semrush: "AI Search Trust Signals: The Practical Audit (2026 Guide)" — Trust signal catalog
- Mersel AI: "What Proof Makes AI Trust a Brand?" — B2B trust signals

## Open Questions

1. **"200+ factory visits"** — Can this be verified? If not, recommend removal or reformulation as "helped clients visit factories in Guangdong province"
2. **Industry count methodology** — "50+ sectors" vs "15+ industries" — need consistent definition across all pages
