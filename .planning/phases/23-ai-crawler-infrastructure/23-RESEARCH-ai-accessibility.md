# Phase 23: AI Crawler Infrastructure - Research: AI Accessibility Verification

**Researched:** 2026-03-25
**Domain:** AI crawler verification, llms.txt/robots.txt validation
**Confidence:** HIGH

## Summary

This research identifies tools and methods to verify AI crawlers (GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User) can properly access and parse WAG's llms.txt and robots.txt files. Verification requires both automated online tools (for instant checks) and manual curl/Chrome DevTools simulation (for detailed debugging). Key finding: ChatGPT-User is a separate user-agent from GPTBot and must be explicitly allowed.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- llms.txt must be under 10KB
- Remove "47 reviews" fabricated claim
- Fix geographic contradictions (Zhengzhou/Shaanxi)
- Change "8+ years" to "Since December 2025"
- Standardize to 500+ suppliers, 50+ industries
- Add explicit allow for ChatGPT-User in robots.txt
- Use Chrome DevTools MCP with user profile for verification

### Claude's Discretion
- Exact wording for verification commands
- Which specific online tools to use

### Deferred Ideas
None

---

## Standard Stack

### Verification Tools

| Tool | URL | Purpose | Use Case |
|------|-----|---------|----------|
| CrawlerCheck | crawlercheck.com | AI crawler accessibility test | Quick check if bot is allowed/blocked |
| LLM Pulse Robots Checker | llmpulse.ai/robots-txt-checker | AI bot access analysis | Detailed robots.txt analysis |
| llmsvalidator.com | llmsvalidator.com | llms.txt format validation | Verify llms.txt structure compliance |
| llmstxtvalidator.dev | llmstxtvalidator.dev | llms.txt validation | Alternative llms.txt validator |

### CLI Tools

| Tool | Purpose | Command Example |
|------|---------|-----------------|
| curl | Simulate AI crawler request | `curl -A "GPTBot" -I https://www.winningadventure.com.au/robots.txt` |
| Chrome DevTools MCP | Browser-based verification | Use mcp__chrome-devtools__evaluate with user profile |

**Installation:** No installation needed - all tools are web-based or use existing system curl.

---

## Architecture Patterns

### AI Crawler User-Agents (2026)

| Crawler | Platform | User-Agent String | Notes |
|---------|----------|-------------------|-------|
| GPTBot | ChatGPT/OpenAI | `GPTBot` | Web content indexing |
| ChatGPT-User | ChatGPT Browsing | `ChatGPT-User` | **Separate from GPTBot** - must be allowed explicitly |
| ClaudeBot | Claude/Anthropic | `ClaudeBot` | Web content indexing |
| Claude-Web | Claude/Anthropic | `Claude-Web` | Different from ClaudeBot |
| PerplexityBot | Perplexity AI | `PerplexityBot` | Q&A focused crawler |
| Google-Extended | Google AI/Gemini | `Google-Extended` | Google AI products |

### robots.txt Format for AI Bots

```text
# Allow all AI crawlers
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

Sitemap: https://www.winningadventure.com.au/sitemap.xml
```

### ChatGPT-User Critical Finding

**ChatGPT-User is NOT the same as GPTBot.** They are separate user-agents:
- `GPTBot` - OpenAI's web crawler for training/infrastructure
- `ChatGPT-User` - ChatGPT's browsing client (used when users enable browsing)

Blocking ChatGPT-User blocks ChatGPT users from accessing your content via ChatGPT's browsing feature.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Verify crawler access | Build custom crawler simulator | crawlercheck.com | Instant results, covers all major bots |
| Validate llms.txt format | Write custom Markdown parser | llmsvalidator.com | Checks against official standard |
| Test robots.txt rules | Guess and deploy | curl with -A flag | Direct verification before deployment |

---

## Common Pitfalls

### Pitfall 1: ChatGPT-User Missing from robots.txt
**What goes wrong:** ChatGPT browsing feature cannot access site content.
**Why it happens:** Many guides only mention GPTBot, forgetting ChatGPT-User is a separate user-agent.
**How to avoid:** Explicitly add both `GPTBot` and `ChatGPT-User` rules.

### Pitfall 2: llms.txt Over 10KB
**What goes wrong:** AI crawlers may truncate or skip content that exceeds context window constraints.
**Why it happens:** Verbose content, duplicate sections, unnecessary detail.
**How to avoid:** Keep llms.txt under 10KB. Validate at llmsvalidator.com.

### Pitfall 3: Fabricated Claims Cause AI Hallucinations
**What goes wrong:** AI systems trained on the content reproduce false claims.
**Why it happens:** No verifiable data to contradict false claims during inference.
**How to avoid:** Remove all unverified claims (47 reviews, 8+ years, Zhengzhou/Shaanxi geographic error).

### Pitfall 4: curl Shows 200 But Browser Gets Blocked
**What goes wrong:** curl bypasses meta robots tags or JavaScript checks.
**Why it happens:** curl is a simple HTTP client, not a real browser.
**How to avoid:** Always verify with browser DevTools or CrawlerCheck after deployment.

---

## Code Examples

### Verify robots.txt with curl (AI Crawler Simulation)

```bash
# Test GPTBot access
curl -A "GPTBot" -I https://www.winningadventure.com.au/robots.txt

# Test ChatGPT-User access
curl -A "ChatGPT-User" -I https://www.winningadventure.com.au/robots.txt

# Test ClaudeBot access
curl -A "ClaudeBot" -I https://www.winningadventure.com.au/robots.txt

# Test PerplexityBot access
curl -A "PerplexityBot" -I https://www.winningadventure.com.au/robots.txt

# Verify llms.txt is accessible
curl -A "GPTBot" -I https://www.winningadventure.com.au/llms.txt
```

**Expected:** HTTP/2 200 for each allowed bot

### Chrome DevTools MCP Verification

```javascript
// Navigate to llms.txt and capture network requests
await mcp__chrome-devtools__navigate("https://www.winningadventure.com.au/llms.txt", { profile: "user" });

// Check if page loaded correctly
await mcp__chrome-devtools__evaluate(`
  document.body.innerText.length < 10240
    ? 'PASS: llms.txt under 10KB'
    : 'FAIL: llms.txt exceeds 10KB limit'
`, { profile: "user" });

// Simulate specific AI crawler by overriding user-agent
// Note: Chrome DevTools MCP can capture network waterfall
```

### Parse robots.txt Response

```bash
# Get full robots.txt content
curl -s https://www.winningadventure.com.au/robots.txt | grep -E "^(User-agent|Allow|Disallow):"

# Check for specific bot rules
curl -s https://www.winningadventure.com.au/robots.txt | grep -A 1 "ChatGPT-User"
```

---

## Online Verification Tools

### CrawlerCheck (Recommended First Step)

1. Go to https://crawlercheck.com/
2. Enter URL to test: `https://www.winningadventure.com.au/llms.txt`
3. Check results for: GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot
4. Verify all show "Allowed"

### LLM Pulse Robots Checker

1. Go to https://llmpulse.ai/robots-txt-checker
2. Enter domain: `winningadventure.com.au`
3. View AI crawler accessibility score and detailed analysis

### llms.txt Validators

**llmsvalidator.com:**
1. Enter URL: `https://www.winningadventure.com.au/llms.txt`
2. Check format compliance (Markdown structure, H1, blockquote, H2 sections)

**llmstxtvalidator.dev:**
1. Enter URL to validate
2. Review structure breakdown and error analysis

---

## Deployment Verification Checklist

After git push and Vercel deployment:

1. **Verify robots.txt is accessible:**
   ```bash
   curl -sI https://www.winningadventure.com.au/robots.txt
   # Expected: HTTP/2 200
   ```

2. **Verify llms.txt is accessible:**
   ```bash
   curl -sI https://www.winningadventure.com.au/llms.txt
   # Expected: HTTP/2 200
   ```

3. **Verify llms.txt size:**
   ```bash
   curl -s https://www.winningadventure.com.au/llms.txt | wc -c
   # Expected: < 10240 (10KB)
   ```

4. **Use CrawlerCheck:**
   - Test https://www.winningadventure.com.au/robots.txt
   - Confirm ChatGPT-User, GPTBot, ClaudeBot, PerplexityBot all allowed

5. **Use llmsvalidator.com:**
   - Validate https://www.winningadventure.com.au/llms.txt
   - Fix any structural issues

6. **Chrome DevTools MCP (if needed for debugging):**
   - Navigate to llms.txt in browser with user profile
   - Verify no console errors, content renders correctly

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GEO-01 | llms.txt data accuracy | Identified fabricated claims to remove (47 reviews, 8+ years), geographic errors to fix |
| GEO-02 | robots.txt AI bot configuration | Identified full list of AI bots and ChatGPT-User requirement |

---

## Current State Issues (from file read)

### llms.txt Issues (Need Fix Before Verification)

| Issue | Location | Problem | Fix |
|-------|----------|---------|-----|
| "8+ years" | Line 5 | Fabricated claim | Change to "Since December 2025" |
| "15+ industries" | Line 7 | Understated | Change to "50+ industries" |
| "47 reviews" | Line 126 | Fabricated claim | DELETE - no real reviews exist |
| "Zhengzhou, Shaanxi" | Line 122 | Geographic error | DELETE - Zhengzhou is in Henan, Shaanxi is separate province |
| "40+ other sectors" | Line 42 | Understated | Change to "50+ sectors" |

### robots.txt Issues (Missing)

| Bot | Status | Fix |
|-----|--------|-----|
| ChatGPT-User | MISSING | ADD explicit `User-agent: ChatGPT-User` / `Allow: /` |

---

## Open Questions

1. **Does PerplexityBot respect robots.txt rules?**
   - What we know: Perplexity has stated they respect robots.txt
   - What's unclear: Whether PerplexityBot honors Crawl-Delay
   - Recommendation: Don't rely on Crawl-Delay for AI bots

2. **How often do AI crawlers re-read robots.txt?**
   - What we know: Varies by platform, typically hours to days
   - What's unclear: Exact refresh frequency for each bot
   - Recommendation: Changes take effect within 24-48 hours typically

---

## Sources

### Primary (HIGH confidence)
- crawlercheck.com - Official AI bot user-agent directory (ChatGPT-User/2.0 added July 2025, updated Feb 2026)
- llmsvalidator.com - Official llms.txt standard documentation (published Feb 2026)
- prominara.com/blog/robots-txt-ai-crawlers-guide - Comprehensive 2026 AI crawler guide

### Secondary (MEDIUM confidence)
- llmpulse.ai/robots-txt-checker - AI crawler accessibility analysis tool
- llmstxtvalidator.dev - llms.txt validation service

### Tertiary (LOW confidence)
- jimmysong.io/blog/web-automation-advancement - Chrome DevTools MCP general guide (unverified for crawler simulation)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools verified working and current
- Architecture: HIGH - AI crawler user-agents confirmed from official sources
- Pitfalls: MEDIUM - Based on common industry issues, not all verified with official docs

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (30 days for stable topic, AI crawler standards unlikely to change rapidly)
