# China Sourcing Agent — Phase 2 deferred notes

**Date:** 2026-07-24  
**Status:** Partial Phase 2 shipped with commercial root; Growth System cutover **blocked** without separate approval.

## Shipped in this implementation pass

- Pillar MDX `content/blog/sourcing-agent-australia.mdx`: bidirectional prose links to `/china-sourcing-agent`; `slug` + `updatedDate` frontmatter.
- Compare MDX `content/blog/china-sourcing-agent-vs-direct.mdx`: service CTAs retargeted from homepage `/` to commercial root; decision tree CTAs to root / verification / visits.
- MDX internal link fix: `factory-vs-trading-company-china-guide.mdx` service link → `/china-sourcing-agent`.
- Gap brief queue (not drafted articles): see `2026-07-24-china-sourcing-agent-content-gap-briefs.md`.

## Explicitly deferred (need separate approval)

| Item | Why deferred |
|------|----------------|
| Growth System **ticket 11** ledger lock + China Sourcing cluster cutover | **Deferred (approval-required).** Scaffold/contract only; `locked=false` on production ledger. Do not cutover without explicit human approval separate from commercial-root deploy. |
| Bulk new SEO articles (2–4 gap posts) | Quality gate: write only from gap briefs after commercial root is live and measured; avoid cannibalisation. |
| Industry/city thin “agent {city}” doorway copy | City pages now feed root via services grid + breadcrumb; no bulk thin pages. |
| Full MDX corpus hygiene re-audit vs 2026-07-01 audit list | Only clearly broken agent-service links retargeted; full corpus pass is a later ticket. |
| Phase 3 off-site execution (GBP edit, Medium publish, directory posts) | Runbook only: `2026-07-24-china-sourcing-agent-authority-runbook.md` |
| Phase 4 live measurement weeks | SOP only until root is production-live: `2026-07-24-china-sourcing-agent-measurement.md` |

## When to resume

1. Production deploy of Phase 1 root approved and live.
2. Optional: re-baseline GSC 7–14 days post-deploy.
3. Explicit approval for ticket 11 ledger lock if Growth System cutover is desired.
4. Then draft 0–2 gap articles from the brief queue (not all four at once).
