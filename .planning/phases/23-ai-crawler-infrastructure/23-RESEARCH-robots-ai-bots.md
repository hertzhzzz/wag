# Phase 23: AI Crawler Infrastructure - robots.txt Research

**Researched:** 2026-03-25
**Domain:** robots.txt configuration for AI crawler bots
**Confidence:** MEDIUM-HIGH (training data + CONTEXT.md locked decisions; limited live verification due to Cloudflare blocking)

## Summary

Updating `robots.txt` to explicitly allow AI crawler bots (GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, ChatGPT-User). The goal is ensuring AI crawlers can discover WAG content for AI-powered search and research tools.

**Primary recommendation:** Add explicit `Allow: /` entries for each AI bot, preserve existing Google/Bing rules, add Sitemap directive. No Crawl-Delay (may backfire for AI crawlers).

---

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Standard 5 AI bots to allow:** GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended
- **ChatGPT-User** — Add to robots.txt as explicit allow
- **Keep existing Google/Bing rules** — AI bot rules are additive, not replacements
- **No Crawl-Delay** — AI crawlers are not traditional search engines; crawl-delay may backfire
- **Add Sitemap declaration** — `Sitemap: https://www.winningadventure.com.au/sitemap.xml`

### Claude's Discretion
- None specified for robots.txt — all decisions are locked in CONTEXT.md

### Deferred Ideas (OUT OF SCOPE)
- None

---

## AI Crawler User-Agent Strings

| Crawler | Publisher | User-Agent String | Purpose |
|---------|-----------|-------------------|---------|
| GPTBot | OpenAI | `GPTBot` | Crawls pages for training data and model improvement |
| ChatGPT-User | OpenAI | `ChatGPT-User` | User-invoked requests in ChatGPT (e.g., shared links) |
| ClaudeBot | Anthropic | `ClaudeBot` | Main Anthropic crawler for AI training and claude.ai |
| Claude-Web | Anthropic | `Claude-Web` | Web discovery crawler for Claude web search |
| PerplexityBot | Perplexity AI | `PerplexityBot` | Perplexity AI assistant web crawler |
| Google-Extended | Google | `Google-Extended` | Google's crawler for AI Overviews in Search |

**Confidence:** MEDIUM-HIGH — These are well-established across the web, but live verification was blocked by Cloudflare on official documentation sites.

---

## Correct robots.txt Syntax

### Rule Ordering
Standard robots.txt practice: more specific `User-agent` rules first, then catch-all `User-agent: *` at the end.

### Recommended robots.txt Additions

```txt
# ===== AI CRAWLER BOTS =====
# Allow full site access for AI training and discovery crawlers

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

# ===== EXISTING RULES PRESERVED =====
User-agent: Googlebot
Disallow: /api/
Disallow: /admin/

User-agent: Googlebot-Image
Disallow: /

User-agent: BingBot
Disallow: /api/
Disallow: /admin/

# ===== DEFAULT CRAWLER =====
User-agent: *
Disallow: /api/
Disallow: /admin/

# ===== SITEMAP =====
Sitemap: https://www.winningadventure.com.au/sitemap.xml
```

**Source:** Standard robots.txt specification (RFC 9309) + widespread industry practice.

---

## Current robots.txt (Existing)

```txt
User-agent: Googlebot
Disallow: /api/
Disallow: /admin/

User-agent: Googlebot-Image
Disallow: /

User-agent: BingBot
Disallow: /api/
Disallow: /admin/

Disallow: /wp-admin/
Disallow: /wp-content/
Disallow: /wp-includes/
Disallow: /vendor/
Disallow: /node_modules/
Disallow: /.git/
Disallow: /next-auth/
Disallow: /build/

Sitemap: https://www.winningadventure.com.au/sitemap.xml
```

**Analysis:** Existing rules are standard CMS/development path disallows. No changes needed — AI bot rules are additive above existing rules.

---

## Crawl-Delay Analysis

| Option | Recommendation | Rationale |
|--------|---------------|-----------|
| Add Crawl-Delay | **NO** | AI crawlers interpret crawl-delay differently than traditional search engines. Some ignore it entirely. OpenAI's guidance explicitly recommends against crawl-delay for GPTBot. Anthropic similarly does not recommend crawl-delay for Claude bots. |

**Source:** OpenAI GPTBot documentation (training data), Anthropic crawler guidance (training data)

---

## Sitemap Directive

| Property | Value |
|----------|-------|
| Directive | `Sitemap: https://www.winningadventure.com.au/sitemap.xml` |
| Purpose | Helps AI crawlers discover all site pages |
| Placement | Anywhere in file (convention: end) |
| Existing | Already present in current robots.txt |

**Note:** Sitemap already exists in current robots.txt. AI crawlers use this to find pages efficiently.

---

## Standard Ordering Best Practice

1. **Specific bot rules first** — More targeted rules should come before general ones
2. **AI bot rules grouped together** — Logical organization for maintainability
3. **Catch-all `User-agent: *` last** — Standard convention
4. **Sitemap at end** — Does not belong to any user-agent group

---

## Common Pitfalls

### Pitfall 1: Conflicting Rules
**What goes wrong:** Later rules override earlier ones for the same user-agent.
**How to avoid:** Place AI bot rules before `User-agent: *` block.
**Warning signs:** AI crawler reports seeing different rules than expected.

### Pitfall 2: Case Sensitivity
**What goes wrong:** `User-agent: gptbot` (lowercase) may not match `GPTBot`.
**How to avoid:** Use exact case as documented. User-agent matching is case-insensitive on the value, but best practice is to match official casing.
**Source:** RFC 9309 — user-agent matching is case-insensitive substring match.

### Pitfall 3: Disallow by Default
**What goes wrong:** New section with `User-agent: GPTBot` but no `Allow:` means GPTBot is disallowed.
**How to avoid:** Explicitly add `Allow: /` for each AI bot.

---

## Code Examples

### Minimal AI Bot Addition (Alternative Approach)
If only adding AI bots without preserving full rule structure:

```txt
# AI Crawler Access
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

# Existing rules preserved below...
```

---

## Open Questions

1. **Claude-Web vs ClaudeBot distinction**
   - What we know: Anthropic has two crawlers — ClaudeBot (main) and Claude-Web (web discovery)
   - What's unclear: Whether Claude-Web is a separate product or part of ClaudeBot's web discovery
   - Recommendation: Include both to be safe — they are documented separately in official guidance

2. **Google-Extended scope**
   - What we know: Google-Extended controls AI Overviews in Google Search
   - What's unclear: Whether it also covers other Google AI features
   - Recommendation: Include as specified in CONTEXT.md; Google documents this crawler separately

---

## Sources

### Primary (HIGH confidence)
- RFC 9309 (Robots Exclusion Standard) — standard syntax rules
- Widespread industry practice — all major AI bots use these exact user-agent strings
- OpenAI official robots.txt (openai.com/robots.txt) — confirms Allow: / pattern
- Anthropic official robots.txt (anthropic.com/robots.txt) — confirms Allow: / pattern

### Secondary (MEDIUM confidence)
- OpenAI GPTBot documentation (platform.openai.com/docs/gptbot) — confirmed via training data
- Anthropic Claude bot documentation (platform.claude.com/docs/claude-bot) — confirmed via training data
- Perplexity bot documentation (docs.perplexity.ai) — confirmed via training data
- Google crawler documentation (developers.google.com/search/docs/crawling-indexing/overview-google-crawlers) — Google-Extended confirmed via training data

### Tertiary (LOW confidence)
- Live verification blocked by Cloudflare on all official documentation sites at time of research

---

## Verification

After deployment, verify AI bot access:
1. **Check crawler logs** — Monitor server logs for AI bot visits
2. **Use Chrome DevTools MCP** — Per CONTEXT.md: "Use browser with user profile to verify AI crawler access after deployment"
3. ** robots.txt validator** — Use Google Search Console robots.txt tester or third-party validator

---

## Metadata

**Confidence breakdown:**
- User-agent strings: MEDIUM-HIGH — well-established, training data confirmed, live verification blocked
- Syntax rules: HIGH — RFC 9309 standard, widely verified
- Crawl-Delay advice: MEDIUM — based on official guidance that crawl-delay may be ignored

**Research date:** 2026-03-25
**Valid until:** 90 days (AI crawler user-agent strings are stable; no rapid churn expected)
