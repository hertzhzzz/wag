# AI Crawler User-Agents Research

**Researched:** 2026-03-25
**Domain:** AI crawler user-agents for robots.txt
**Confidence:** HIGH

## Summary

This research documents all known AI crawler user-agents that should be considered for robots.txt configuration. It distinguishes between AI training crawlers (that use content for model training) and AI search crawlers (that power AI-powered search features).

**Primary recommendation:** Allow AI search crawlers (they drive traffic), optionally block AI training crawlers (if you don't want content used for training).

## AI Crawler Classification

### Category 1: AI Search Crawlers (Power AI-powered search)

These crawlers index content for AI-powered answer engines and search products. Generally beneficial for discovery.

| User-Agent | Operator | Product | Purpose |
|------------|----------|---------|---------|
| `GPTBot` | OpenAI | ChatGPT Search/Answers | AI-powered search indexing |
| `ChatGPT-User` | OpenAI | ChatGPT (user-initiated) | Individual user requests in ChatGPT |
| `ClaudeBot` | Anthropic | Claude.ai search | Claude's web search feature |
| `Claude-Web` | Anthropic | Claude.ai web access | Direct web content retrieval for Claude |
| `PerplexityBot` | Perplexity AI | Perplexity search engine | AI-powered Q&A search engine |
| `Google-Extended` | Google | Gemini/AI Overviews | Google's AI search features |

### Category 2: AI Training Crawlers (Use content for model training)

These crawlers use content to train AI models rather than for real-time search.

| User-Agent | Operator | Product | Status |
|------------|----------|---------|--------|
| `GPTBot` | OpenAI | ChatGPT training | Can be blocked via `GPTBot` with `Disallow` |
| `CCBot` | Common Crawl | Common Crawl corpus | Web archive for training |
| `MistralAI` | Mistral | Mistral AI training | French AI company |
| `DeepSeek` | DeepSeek | DeepSeek R1 training | Chinese AI company |
| `Bytespider` |字节跳动 ByteDance | Doubao/Coze training | TikTok parent company |
| `Diffbot` | Diffbot | Knowledge graph training | Academic/research use |
| `Amazonbot` | Amazon | Titan model training | Bedrock/AWS related |

## Key User-Agent Pairs Explained

### GPTBot vs ChatGPT-User

| Aspect | `GPTBot` | `ChatGPT-User` |
|--------|----------|----------------|
| Purpose | Search indexing | Real-time user conversations |
| Training use | Can be used for training | Not used for training |
| Block impact | Loses search visibility | Users can't reference your URL in ChatGPT |
| Recommended | Allow (search benefit) | Allow (user engagement) |

**Source:** OpenAI robots.txt and documentation

### ClaudeBot vs Claude-Web

| Aspect | `ClaudeBot` | `Claude-Web` |
|--------|-------------|--------------|
| Purpose | AI search indexing | Web content retrieval |
| Used by | claude.ai search | Claude AI direct queries |
| Recommended | Allow | Allow |

**Source:** Anthropic robots.txt

### Googlebot vs Google-Extended

| Aspect | `Googlebot` | `Google-Extended` |
|--------|-------------|-------------------|
| Purpose | Standard search indexing | AI Overviews/Gemini indexing |
| Block impact | Loses ALL Google search | Loses only AI search features |
| Recommended | Never block | Allow (AI search growing) |

**Source:** Google AI docs

## Other AI Crawlers to Consider

| User-Agent | Operator | Notes |
|------------|----------|-------|
| `Meta-ExternalAgent` | Meta | AI search indexing |
| `FacebookBot` | Meta | External content indexing |
| `Applebot` | Apple | Apple Intelligence (training + search) |
| `DuckDuckBot` | DuckDuckGo | AI-powered Answers in search |
| `YouBot` | You.com | AI search engine |
| `Qwant` | Qwant | European AI search |
| `BingBot` | Microsoft | Copilot integration |

## Current WAG robots.txt Analysis

```robots.txt
User-agent: *
Allow: /
```

**Status:** Only generic rules. No AI bot-specific rules.

## Recommended WAG robots.txt Configuration

```robots.txt
# Allow all AI search crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

# Optional: Block training crawlers (if desired)
# User-agent: CCBot
# Disallow: /

# User-agent: Bytespider
# Disallow: /

Sitemap: https://www.winningadventure.com.au/sitemap.xml
```

## Decision Framework

| Goal | Action |
|------|--------|
| Maximize AI search visibility | Allow all 6 standard bots |
| Block training, allow search | Allow 6 + block CCBot, Bytespider |
| Block all AI | Disallow all AI user-agents |

## Sources

### Official Documentation
- OpenAI: robots.txt + AI crawler docs
- Anthropic: robots.txt + crawler policy
- Perplexity: robots.txt
- Google: Google-Extended documentation

### Community Resources
- airobots.txt (aggregated list)
- Robotstxt.org (standard reference)

## Open Questions

1. **Bytespider (ByteDance):** Known crawler but aggressive reputation. Current context doesn't mention it — consider adding if Chinese market is relevant.
2. **Applebot:** Apple's crawler handles both training and search. No explicit separation.
3. **Meta-ExternalAgent:** Relatively new, not in current CONTEXT decisions.

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard 6 bots | HIGH | Verified via official robots.txt |
| GPTBot vs ChatGPT-User distinction | HIGH | Official OpenAI documentation |
| ClaudeBot vs Claude-Web | HIGH | Official Anthropic documentation |
| Training crawlers | MEDIUM | Community-maintained, may be incomplete |
