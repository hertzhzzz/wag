# GEO Stack Validation: Cross-Validation Findings

**Project:** WAG Website v3.0 GEO Optimization
**Researched:** 2026-03-25
**Confidence:** MEDIUM

## Executive Summary

Our existing findings are **largely confirmed**, but with critical nuances:
1. **llms.txt Route Handler approach** - CONFIRMED as valid
2. **llms.txt actual AI platform adoption** - UNCERTAIN (no major platform officially confirmed usage)
3. **AI crawler robots.txt rules** - NEEDS UPDATE (missing several bots)
4. **Schema.org structured data** - CONFIRMED as the actual mechanism AI systems use

**Key correction:** The real value for GEO is Schema.org structured data (especially FAQPage, Article, SpeakableSpecification), NOT llms.txt itself. llms.txt remains a proposed standard without official adoption.

---

## Finding 1: llms.txt Implementation Approach

### Status: CONFIRMED VALID

**Our recommendation:** Custom Route Handler at `/app/llms.txt/route.ts`

**Research validates:**
- Official llms.txt spec (llmstxt.org) confirms Route Handler is valid
- The `next-llms-txt` package (v1.0.2, Nov 2025) exists but is optional
- For WAG's use case, custom implementation is appropriate and gives full control

**Implementation path confirmed:**
```
/app/llms.txt/route.ts  (dynamic generation)
/public/llms.txt        (static alternative)
```

**However:** See Finding 2 - actual AI platform adoption is uncertain.

---

## Finding 2: Which AI Platforms Actually Consume llms.txt

### Status: UNCERTAIN - No Official Confirmations

**Critical finding from Publii article (Jan 2026):**
> "No AI system currently uses llms.txt. Zero. Zilch. Nada. Google's John Mueller explicitly stated on Reddit and Bluesky: 'No AI system currently uses llms.txt.' OpenAI hasn't announced ChatGPT or GPTBot parse these files. Anthropic - despite publishing their own llms.txt - hasn't confirmed Claude's systems reference it."

**Evidence of crawling vs. usage:**
- Some SEO practitioners see OpenAI crawlers pinging llms.txt files every 15 minutes
- Microsoft and OpenAI bots actively fetch both llms.txt and llms-full.txt
- BUT: Crawling ≠ Using for content generation

**Who has implemented llms.txt:**
- Anthropic (their own docs)
- Stripe
- Cloudflare
- Mintlify (auto-generation for docs sites)
- Fern (automatic generation platform)

**Reality check:**
- llms.txt is a community-driven proposed standard (Sep 2024)
- NOT an IETF or W3C official standard
- May be adopted more widely by 2027 (per WebCraft Feb 2026 analysis)

**Recommendation:** Implement llms.txt as low-cost insurance, but don't over-invest. The REAL GEO value is Schema.org structured data.

---

## Finding 3: AI-Specific Meta Tags and Protocols

### Status: SCHEMA.ORG IS WHAT ACTUALLY WORKS

**Research consensus (Mar 2026):**
- There is no special "AI schema" - same Schema.org vocabulary works
- AI systems (ChatGPT, Perplexity, Google AI Overviews) rely heavily on structured data
- Content with proper schema has 2.5x higher chance of appearing in AI-generated answers

**HIGH IMPACT Schema types for AI citation:**

| Schema Type | AI Impact | WAG Status |
|-------------|-----------|------------|
| FAQPage | Highest | ✅ Already implemented |
| Article/BlogPosting | High | ✅ Already implemented |
| SpeakableSpecification | Medium-High | ⚠️ Recommended to add |
| HowTo | High | ⚠️ Not implemented (if adding guides) |
| Organization | Medium | ✅ Already implemented |
| Person (author) | Medium | ✅ Already implemented |
| BreadcrumbList | Low for AI | ✅ Already implemented |

**SpeakableSpecification details:**
- Originally for voice search, now gaining relevance for AI content extraction
- Marks sections suitable for text-to-speech / AI reading
- Use cssSelector pointing to concise summary sections
- Recommended: Mark only 2-3 key sections per page
- Implementation:
```json
{
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".page-summary", ".key-points"]
  }
}
```

---

## Finding 4: robots.txt AI Crawler Rules

### Status: NEEDS UPDATE - Missing Several Bots

**Current WAG robots.txt:**
```
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
```

**Missing bots (per 2026 research):**

| Crawler | Platform | User-Agent | Should Allow? |
|---------|----------|------------|---------------|
| ChatGPT-User | OpenAI | ChatGPT-User | YES (real-time browsing) |
| Amazonbot | Amazon | Amazonbot | Optional |
| cohere-ai | Cohere | cohere-ai | Optional |
| Applebot-Extended | Apple | Applebot-Extended | Optional |
| Bytespider | ByteDance | Bytespider | Consider blocking |
| CCBot | Common Crawl | CCBot | Optional |
| Meta-ExternalAgent | Meta | meta-externalagent | Optional |

**Recommended minimal update:**
```
# Add to existing AI crawler rules
User-agent: ChatGPT-User
Allow: /
```

**Key insight from Cloudflare (Feb 2026):**
- Claude-SearchBot exists (Anthropic's search-specific crawler)
- Perplexity-User also exists
- Consider allowing these for better citation visibility

---

## Finding 5: Stack Changes Needed

### Status: NO NEW PACKAGES REQUIRED

**Confirmed:**
- No dedicated llms.txt library is required for WAG
- Existing gray-matter + next-mdx-remote is sufficient
- Current Schema.org implementations are solid

**Optional enhancement:**
- `next-llms-txt` package (v1.0.2) if you want automated generation
- But custom Route Handler gives more control for WAG's use case

---

## Validation Summary

| Item | Status | Action Needed |
|------|--------|---------------|
| llms.txt Route Handler approach | ✅ CONFIRMED | Implement as planned |
| llms.txt AI platform adoption | ⚠️ UNCERTAIN | Implement as low-cost insurance |
| robots.txt AI crawler rules | ⚠️ INCOMPLETE | Add ChatGPT-User |
| Schema.org structured data | ✅ CONFIRMED | Add SpeakableSpecification |
| FAQPage schema | ✅ CONFIRMED | Already in good shape |
| Article schema | ✅ CONFIRMED | Already in good shape |
| New packages needed | ✅ NONE | No changes |

---

## Recommendations for Phase 23

### Keep:
1. Custom Route Handler at `/app/llms.txt/route.ts` - correct approach
2. Current robots.txt AI crawler rules as baseline
3. Focus on Schema.org structured data (FAQPage, Article) - this is where real value is

### Add:
1. **ChatGPT-User** to robots.txt AI crawler section
2. **SpeakableSpecification** to FAQPage and Article schemas
3. Consider adding **HowTo** schema if creating step-by-step guides

### Don't over-invest in llms.txt:
- Implement it correctly but simply
- Real AI visibility comes from Schema.org + quality content
- llms.txt is insurance, not the core strategy

---

## Sources

| Source | Confidence | Key Finding |
|--------|------------|-------------|
| llmstxt.org spec | HIGH | Official specification format |
| Publii blog (Jan 2026) | MEDIUM | No AI platform officially confirmed llms.txt usage |
| Stackmatix blog (Mar 2026) | MEDIUM | Schema markup 2.5x higher AI citation chance |
| Cloudflare AI Crawl Control (Feb 2026) | HIGH | Complete list of AI crawler user agents |
| Schema.org SpeakableSpecification | HIGH | Official documentation |
| next-llms-txt package (Nov 2025) | MEDIUM | NPM package exists for Next.js |

---

*Research validation for: WAG Website v3.0 GEO Optimization*
*Completed: 2026-03-25*
