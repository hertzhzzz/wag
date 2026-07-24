# China Sourcing Agent — Phase 3 authority runbook

**Date:** 2026-07-24  
**Commercial root:** `https://www.winningadventure.com.au/china-sourcing-agent`  
**Status:** Runbook only. No off-site publish, GBP edit, or Medium post is executed by this document.

## Goal

Build third-party trust and AI-citable references that point at the commercial root, without inventing Local Pack dependence or keyword-stuffed directory spam.

## Preconditions

1. Phase 1 commercial root is live in production (separate `vercel --prod` approval).
2. `/article/china-sourcing-agent` returns **301** to `/china-sourcing-agent`.
3. On-site dual-root links are live: root ↔ editorial pillar `/article/sourcing-agent-australia` ↔ compare `/article/china-sourcing-agent-vs-direct`.

## 1. Google Business Profile (human)

| Check | Expected |
|-------|----------|
| Brand name | Winning Adventure Global (full name; no "WAG" public label) |
| Primary category | Matches China sourcing / import consultancy positioning |
| Service area | Australia-wide SAB; do not force Local Pack keywords |
| Website | Prefer commercial root for agent-intent services list, or homepage with clear agent path |
| Description | Align with root H1/title language; author/contact remains Andy Liu / North Adelaide entity |

**Owner:** human GBP access. Agent does not edit GBP from this repo.

## 2. Directory / association citations

Prioritise natural, verifiable listings:

- Export / import industry directories (AU)
- Chamber / trade body member pages where membership is real
- Supplier-side partner pages only with written permission

**Anchor text rules:** brand or natural phrase ("China sourcing support for Australian importers"). Avoid exact-match spam of `china sourcing agent australia` on every link.

**URL to cite:** commercial root first; editorial pillar only for how-to content.

## 3. Medium / content-engine syndication

1. Draft lives under content-engine (or existing Medium draft process).
2. Publish only after human review (no auto-post from this runbook).
3. Canonical / first-line link: commercial root; secondary: pillar or compare article.
4. Do not republish full MDX clones that cannibalise root money terms.

## 4. GEO / AI citation readiness

Align with Growth System ticket 35 (china-sourcing GEO baseline) when that ticket is approved:

| Action | Detail |
|--------|--------|
| Citability | Root FAQ and cost/process paragraphs stay factual, short, and self-contained |
| URL migration | After root is live, any GEO prompts that cited `/article/china-sourcing-agent` should expect the commercial root |
| Platforms | Google AI Overviews, ChatGPT, Perplexity, Bing Copilot — observation only until GEO capture is scheduled |
| Evidence | Store captures under `content/seo/geo/evidence/` with real timestamps; no fabricated citations |

## 5. On-site reverse feeds (already in code path)

- Services `#sourcing-agent` → commercial root
- Verification / audit / QI secondary nav → commercial root
- Factory visits related band → commercial root
- City services grid → commercial root
- Footer + mega-menu → commercial root

Phase 3 off-site work assumes these stay true; re-check after any nav redesign.

## 6. Explicit non-goals

- Local Pack ranking as primary KPI
- Mass directory submission tools
- Guest posts that restate "what is a sourcing agent" without new evidence
- Growth System ticket 11 ledger cutover (see deferred note below)

## 7. Deferred: Growth System ticket 11 ledger cutover

Ticket 11 (`china-sourcing-core-migration`) remains **approval-required / locked=false**. Scaffold and contract tests exist; **no production ledger lock or cluster cutover** in this sprint. Resume only after explicit human approval separate from commercial-root deploy.

## 8. Exit criteria (Phase 3 operational)

- [ ] GBP consistency review signed off (human)
- [ ] At least one real off-site citation to commercial root (human)
- [ ] Medium (or equivalent) piece links to commercial root if published
- [ ] GEO observation note updated post-deploy (script/MCP as available; WAG GSC via service account)

No checkbox may be ticked without evidence dated after production deploy.
