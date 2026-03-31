# Phase 23: AI Crawler Infrastructure - Research

**Consolidated:** 2026-03-25
**Phase:** 23 - AI Crawler Infrastructure
**Status:** Research Complete (5/8 research files received)

## Research Summary

### 1. llms.txt Format Specification
**Source:** ai-visibility.org.uk specification v1.1.1 (2026-02-13)

**Required Structure:**
- H1 business name (required, exactly one)
- Blockquote summary (required)
- H2 sections: ## Contact (required), ## Services (recommended), ## What We Do Not Do (recommended)

**Current WAG Issues:**
- "4.9/5 (47 reviews)" — Fabricated, must remove
- "8+ years" — Wrong, actual start is Dec 2025
- Geographic contradictions — Zhengzhou/Shaanxi error
- Missing ## What We Do Not Do section
- Missing ## AI Discovery Files section

**Size:** Current ~4KB, healthy (under 50KB limit)

### 2. AI Bot List (robots.txt)
**Source:** Official robots.txt from OpenAI, Anthropic, Perplexity, Google

**Category 1: AI Search Crawlers (Allow — drive traffic)**
| User-Agent | Operator | Product |
|------------|----------|---------|
| GPTBot | OpenAI | ChatGPT Search |
| ChatGPT-User | OpenAI | ChatGPT user conversations |
| ClaudeBot | Anthropic | Claude.ai search |
| Claude-Web | Anthropic | Claude direct queries |
| PerplexityBot | Perplexity | AI search engine |
| Google-Extended | Google | Gemini/AI Overviews |

**Category 2: Training Crawlers (Optional block)**
CCBot, MistralAI, DeepSeek, Bytespider — block if unwanted for training

### 3. Geographic Accuracy
**Source:** Chinese administrative geography (established facts)

**Critical Errors in Current llms.txt:**
| Error | Location | Fix |
|-------|----------|-----|
| Zhengzhou in Shaanxi | Line 122 | Zhengzhou is in Henan province |
| Shaanxi as city | Line 122 | Shaanxi is a province, not a city |
| "6 provinces" claim | Line 122 | No factual basis |
| Guangdong/Shenzhen redundancy | Line 68 | Shenzhen IS in Guangdong |

**Correct Cities:**
- Shenzhen, Foshan, Guangzhou — all in Guangdong Province
- Zhengzhou — in Henan Province

**Recommended China Operations format:**
```
China Operations: Factory tours in Guangdong Province (Shenzhen, Foshan, Guangzhou) and Henan Province (Zhengzhou)
```

### 4. Trust Signal Authenticity
**Source:** AI search verification mechanisms (RAG-based)

**Fabricated Claims (Remove):**
- "47 reviews" — No review platform to verify
- "8+ years experience" — Contradicted by Dec 2025 start

**Verifiable Claims (Keep):**
- ABN 30 659 034 919 with verification link
- "Operating since December 2025"
- "500+ verified suppliers"
- "50+ industry sectors"
- Geographic specificity (Shenzhen, Foshan, Guangzhou)

**ABN Verification URL:** `https://www.abrs.business.gov.au/ABRSearch?abn=30659034919`

### 5. Content Freshness
**Source:** llms.txt specification best practices

- ISO 8601 date format (`YYYY-MM-DD`) — universal, unambiguous
- "Last updated: 2026-03-25" in header — helps AI assess freshness
- "Operating since" is business history, separate from content freshness

**Recommended:** Add "Last updated: 2026-03-25" to llms.txt header

## Research Coverage

| Topic | File | Status |
|-------|------|--------|
| llms.txt format | 23-RESEARCH-llms-format.md | Complete |
| AI bot list | 23-RESEARCH-ai-bot-list.md | Complete |
| Geographic accuracy | 23-RESEARCH-geographic-accuracy.md | Complete |
| Trust signals | 23-RESEARCH-trust-signals.md | Complete |
| Content freshness | 23-RESEARCH-content-freshness.md | Complete |
| ABN verification | (missing) | Using CONTEXT.md |
| robots.txt syntax | (missing) | Using 23-RESEARCH-ai-bot-list.md |
| AI accessibility | (missing) | Using general knowledge |

## Key Decisions from Research

1. **Remove "47 reviews" fabricated claim** — violates authenticity principle
2. **Fix "8+ years" → "Since December 2025"** — accurate, verifiable
3. **Fix Zhengzhou/Shaanxi geographic error** — Zhengzhou is in Henan, Shaanxi is separate province
4. **Add ABN verification link** — strongest verifiable trust signal
5. **Add "Last updated: 2026-03-25"** — ISO 8601 in header
6. **Allow 6 AI search bots** — GPTBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended
7. **Add Sitemap declaration** to robots.txt

## Files for Planning

| File | Purpose |
|------|---------|
| 23-CONTEXT.md | Implementation decisions |
| 23-RESEARCH-llms-format.md | llms.txt spec |
| 23-RESEARCH-ai-bot-list.md | robots.txt AI bots |
| 23-RESEARCH-geographic-accuracy.md | Geographic fixes |
| 23-RESEARCH-trust-signals.md | Trust signal analysis |
| 23-RESEARCH-content-freshness.md | Content freshness |
| public/llms.txt | Current file to fix |
| robots.txt | File to create |

---

*Research completed: 2026-03-25*
