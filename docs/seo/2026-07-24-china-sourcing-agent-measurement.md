# China Sourcing Agent — Phase 4 measurement plan

**Date:** 2026-07-24  
**Commercial root:** `/china-sourcing-agent`  
**Baseline research:** `docs/seo/research/2026-07-24-china-sourcing-agent-current-state.md`  
**Status:** Measurement SOP. Does not call GSC/GA4 APIs or deploy.

## Success framing

SEO success = **qualified enquiries** attributed to organic discovery of the agent cluster — not impressions alone. GA4 keyEvents remain untrusted until funnel instrumentation is validated; prefer real enquiry submissions.

## Keyword ownership (do not reassign casually)

| Role | URL | Primary queries |
|------|-----|-----------------|
| Commercial root | `/china-sourcing-agent` | `china sourcing agent australia`, `china sourcing agent`, transactional `sourcing agent australia` |
| Editorial pillar | `/article/sourcing-agent-australia` | how to choose / fees / red flags |
| Compare | `/article/china-sourcing-agent-vs-direct` | agent vs direct |
| Services hub | `/services` | multi-service; not money-term owner |
| Home | `/` | brand + broad China sourcing; links to root |

## Pre-deploy baseline (2026-07-24 research window)

GSC (approx. 2026-06-24 → 2026-07-21), service account:

| Query | Clicks | Impressions | Avg position |
|-------|--------|-------------|--------------|
| china sourcing agent australia | 0 | 36 | 34.5 |
| sourcing agent australia | 0 | 23 | 37.7 |
| sourcing agent | 0 | 21 | 39.4 |
| china sourcing agent | 0 | 1 | 90.0 |

Organic agent-specific sessions near zero; re-baseline within 24h of production deploy if delay > 7 days.

## Weekly cadence (after root is live)

**Tooling:** GSC service account scripts (not Cursor GSC MCP for WAG). GA4 property `526384627`.

| Metric | Source | Note |
|--------|--------|------|
| Root impressions / clicks / position | GSC page filter `/china-sourcing-agent` | Trust URL Inspection over stale Coverage |
| Money queries | GSC query filter | Track cluster sum, not only one string |
| Legacy path | GSC `/article/china-sourcing-agent` | Should decay after 301 |
| Organic sessions to root | GA4 | Session default channel Organic Search |
| Enquiries from root | Form analytics / CRM | Prefer real submissions over keyEvents |
| Cannibalisation | GSC page×query | Home / about / pillar / root competing on same money query |

**Weekly actions:**

1. Record numbers with date window in growth dashboard or a dated note (do not invent zeros).
2. If CTR is low at position ≤ 15, queue title/description refresh on root only (human approve copy).
3. If home still outranks root on money terms after 4+ weeks live, audit internal links and titles — do not add new competing articles.

## Monthly cadence

1. Title/description CTR review for root + pillar + compare.
2. Internal-link orphan audit: China Sourcing Strategy MDX should prose-link commercial root where service is mentioned.
3. Indexation: URL Inspection for commercial root; check `lastCrawlTime` before assuming bugs.
4. Gap brief queue: draft 0–2 articles max from `2026-07-24-china-sourcing-agent-content-gap-briefs.md` only if matrix still shows gap.

## Expansion rule

Do **not** expand secondary modifiers (city+agent, industry+agent bulk pages) until commercial root money queries are **average position ≤ 10** with non-zero clicks over a full 28-day window.

Then restore balanced investment in Verification / Audit / Inspection / Visits clusters.

## Reporting template (minimal)

```
Week of: YYYY-MM-DD
Root: impr=  clicks=  pos=
Money query cluster: impr=  clicks=
Organic sessions (root):
Qualified enquiries (organic, attributed):
Cannibalisation notes:
Actions next week:
```

## Human approvals still required for measurement-affecting ops

- Production deploy (`vercel --prod`)
- Indexing API batch submit (quota 200/day) if used to nudge re-crawl
- Ticket 11 ledger cutover (deferred; not part of weekly SEO ops)
- Any title rewrite that changes commercial positioning

## Explicit non-actions

- Do not run daily analytics deploy scripts as part of this plan unless the growth-dashboard session owns that job.
- Do not treat GSC Coverage lag as a live bug without `lastCrawlTime` check.
- Do not mark Phase 4 "complete" from documentation alone; completion is sustained measurement after live root.
