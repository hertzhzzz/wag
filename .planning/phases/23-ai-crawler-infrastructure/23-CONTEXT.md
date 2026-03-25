# Phase 23: AI Crawler Infrastructure - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) can properly discover and access WAG site content via `llms.txt` and properly configured `robots.txt`.

**In scope:**
- Fix `llms.txt` P0 data accuracy issues (fabricated claims, geographic contradictions)
- Update `robots.txt` to explicitly allow AI crawler bots
- Add geographic alignment with Organization schema

**Out of scope:**
- Schema markup changes (Phase 24)
- Content creation or E-E-A-T improvements (Phase 25)
</domain>

<decisions>
## Implementation Decisions

### llms.txt Data Accuracy

- **Remove "47 reviews" fabricated claim** — No real reviews data exists. Direct deletion per PROJECT.md authenticity principle.
- **Fix geographic contradiction** — "Zhengzhou, Shaanxi (6 provinces)" is wrong. Zhengzhou is in Henan province, Shaanxi is a separate province. Delete the incorrect Shaanxi reference.
- **Fix "8+ years" claim** — Operating since December 2025, not 8+ years. Change to "Since December 2025" or "Operating since 2025".
- **Geographic Focus section** — Keep current structure: Service Area: Australia-wide + China Operations section separately stating Chinese cities. No new dedicated section needed.

### Geographic Data Alignment

- **Supplier count: 500+** — Confirmed accurate. Keep as-is.
- **Industry count: 50+** — Sync with Phase 24 standardization. Change from "15+ industries" to "50+ industries" with "across 50+ sectors" phrasing.
- **Factory visits: 200+** — Confirmed accurate. Keep as-is.
- **China cities: Shenzhen, Foshan, Guangzhou** — Correct Guangdong province cities. Keep. Remove incorrect "Zhengzhou" reference.

### AI Bot List (robots.txt)

- **Standard 5 AI bots to allow:**
  - `GPTBot` (OpenAI)
  - `ClaudeBot` (Anthropic)
  - `Claude-Web` (Anthropic web access)
  - `PerplexityBot` (Perplexity AI)
  - `Google-Extended` (Google AI)
- **ChatGPT-User** — Add to robots.txt as explicit allow (per ROADMAP P0 issue)
- **Keep existing human搜索引擎 rules** — Don't remove Google, Bing rules. AI bot rules are additive.
- **No Crawl-Delay** — AI crawlers are not traditional search engines. Adding crawl-delay may backfire.
- **Add Sitemap declaration** — Help AI crawlers discover all pages. Add `Sitemap: https://www.winningadventure.com.au/sitemap.xml`

### ABN Verification

- **Add ABN verification link** — ABN 30 659 034 919. Link to Australian Business Register lookup: `https://abr.business.gov.au/Search/ResultsActive?SearchText=30659034919`

### Verification

- **Use Chrome DevTools MCP** — Use browser with user profile to verify AI crawler access after deployment.

### Content Details

- **Add "Last updated: 2026-03-25"** to llms.txt header — Helps AI assess content freshness.
- **No changelog/version tracking** — Static file, maintain manually on updates.
- **Keep founder description concise** — Current "Our founder Andy Liu has spent years inside Chinese manufacturing hubs" is sufficient.
- **Keep full contact info** — Address, phone, email as currently stated.

### Claude's Discretion

- Exact wording for "Since December 2025" phrasing
- Exact fix for "Zhengzhou/Shaanxi" geographic contradiction (likely just delete Shaanxi)
- Minor wording adjustments for natural language flow
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 23 Requirements
- `.planning/ROADMAP.md` — Phase 23 goal, P0/P1 issues, success criteria
- `.planning/REQUIREMENTS.md` — GEO-01 (llms.txt), GEO-02 (robots.txt AI bots) requirements
- `.planning/PROJECT.md` — Authenticity principle: no fabricated trust signals

### Prior Phase Context
- None yet — Phase 23 is first phase of v3.0 milestone

### Codebase Assets
- `public/llms.txt` — Existing file to be fixed
- `robots.txt` — Existing file to be updated
- `.planning/codebase/STACK.md` — Tech stack (Next.js 16.1)
- `.planning/codebase/CONVENTIONS.md` — File naming, coding conventions

### Geographic Standards
- Phase 24 scope: areaServed: Australia only — applies to llms.txt geographic claims
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/llms.txt` — Static file in public/ directory, can be edited directly
- `robots.txt` — Static file at project root, standard robots.txt format

### Established Patterns
- Next.js static file serving — Files in `public/` are served at root path
- Standard robots.txt syntax — `Allow:` and `Disallow:` directives with User-agent

### Integration Points
- `public/llms.txt` → served at `/llms.txt`
- `robots.txt` → existing file at project root
- No code changes needed — both are static files
</code_context>

<specifics>
## Specific Ideas

- ABN verification URL: `https://www.abrs.business.gov.au/ABRSearch?abn=30659034919`
- Operating since: December 2025 (not 8+ years as currently stated)
- Verified supplier count: 500+
- Industry coverage: 50+ sectors
- China operations cities: Shenzhen, Foshan, Guangzhou (not Zhengzhou/Shaanxi)
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 23-ai-crawler-infrastructure*
*Context gathered: 2026-03-25*
