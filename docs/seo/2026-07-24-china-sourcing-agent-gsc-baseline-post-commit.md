# GSC baseline — China Sourcing Agent (post-commit 626fb09)

**Date recorded:** 2026-07-24  
**Script:** `scripts/gsc-china-sourcing-agent-weekly.py --days 28`  
**Auth:** `~/.claude/gsc-service-account.json` (Owner on `sc-domain:winningadventure.com.au`)  
**Property:** `sc-domain:winningadventure.com.au`  
**Window:** 2026-06-24 → 2026-07-21 (28d, end lag-adjusted by script)  
**Code state:** commercial root committed as `626fb09`; hygiene follow-ups on `cc18a4c` / `f9c5f54`; **not** production-deployed at measurement time.

## Query cluster (equals)

| Query | Clicks | Impressions | CTR | Avg position |
|-------|--------|-------------|-----|--------------|
| china sourcing agent australia | 0 | 36 | 0 | 34.5 |
| china sourcing agent | 0 | 1 | 0 | 90.0 |
| sourcing agent australia | 0 | 23 | 0 | 37.7 |
| sourcing agent | 0 | 21 | 0 | 39.4 |

## Page filter (equals host path after script fix)

First run of the weekly script used `contains` for `/china-sourcing-agent`, which **false-matched** `/article/china-sourcing-agent-vs-direct` (15 impr / pos 20.1). Filters were tightened to exact page URLs. Re-run results:

| Page | Clicks | Impressions | Approx position | Notes |
|------|--------|-------------|-----------------|-------|
| `/china-sourcing-agent` (root) | — | — | — | **No GSC rows** — expected while prod still 404 / not deployed |
| `/` | 22 | 179 | 12.4 | Brand + broad; not money-term owner |
| `/article/sourcing-agent-australia` | 0 | 105 | 31.9 | Editorial pillar |
| `/article/china-sourcing-agent-vs-direct` | 0 | 15 | 20.1 | Compare article |
| `/services` | 0 | 23 | 37.0 | Multi-service hub |
| `/article/china-sourcing-agent` (legacy) | — | — | — | No rows this window |

## Interpretation

- Money-query cluster still **0 clicks**; primary AU string ~36 impr / pos 34.5 (unchanged vs research note).
- Commercial root will only appear in GSC after **production deploy** + crawl.
- Do not treat pre-deploy “root” impressions from the buggy contains filter as real root equity.

## Next measurement

1. After approved `vercel --prod`, re-run this script within 24–48h and again at +7d / +14d.
2. URL Inspection on `https://www.winningadventure.com.au/china-sourcing-agent` after live.
3. Optional Indexing API submit (quota-aware) once live — not done here.
