# Tickets 32–35 GEO landing plan

- Date: 2026-07-19
- Claim mode: observation-only
- Provenance: external-platform-observation
- Platforms: chatgpt, perplexity, google-ai-overviews, bing-copilot
- Ticket 31 complete at `1715f07` (pushed)

## Digests (verified)

| Cluster | Ticket | Digest |
|---|---|---|
| factory-audit | 32 | `sha256:3bec0f9c3de17e1cb2c6f36562d1b3f907460d34f66c795040f0d7c8259dec6d` |
| quality-inspection | 33 | `sha256:7ea4fd81936885385e0d3a9322996609deda06f73345a9daca12ee56dc2cbd1e` |
| factory-visits | 34 | `sha256:d6293d135631269776b7ad944233680c6a6f768ae2ceb0f28f03fd7965ec5dcf` |
| china-sourcing | 35 | `sha256:b6b66e2c8796d2106866588f85df7ac46c859930116c56bdeafd61a4df1e89ef` |

## Run ID scheme

`geo-{abbr}-YYYYMMDD-{platform}-r1`

| Cluster | abbr |
|---|---|
| factory-audit | fa |
| quality-inspection | qi |
| factory-visits | fv |
| china-sourcing | cs |

Example: `geo-fa-20260719-chatgpt-r1`

## Approvals required per ticket

1. Question set package under `content/seo/geo/approvals/question-set-{cluster}.md`
2. Platform packages (extend ticket 31 platform files or add ticket-scoped sections after live runs)
3. Retention/privacy (extend coverage to new run IDs)
4. Ticket 13 cutover already signed for 31+; reaffirm coverage for 32–35 after live matrices

## Do not

- Close tickets without 40/40 live observations + named human approval
- Treat brand/owned URL rates as causal ranking claims
- Stage protected dirty files outside GEO paths

## Progress — 2026-07-19

### Ticket 32 factory-audit — LIVE 40/40 complete; human approval PENDING

| Platform | Run ID | Status |
|---|---|---|
| chatgpt | `geo-fa-20260719-chatgpt-r1` | 10/10 packaged |
| perplexity | `geo-fa-20260719-perplexity-r1` | 10/10 packaged |
| google-ai-overviews | `geo-fa-20260719-google-ai-overviews-r1` | 10/10 packaged |
| bing-copilot | `geo-fa-20260719-bing-copilot-r1` | 10/10 packaged |

- Matrix: `.scratch/seo-growth-system/research/2026-07-19-geo-matrix-factory-audit.md`
- brandMention yes: 5/40; ownedUrlCited yes: 7/40 (observation-only)
- Question-set / platform-T32 / retention reaffirmation: **PENDING_MARK_SIGNATURE**
- Issue: `.scratch/seo-growth-system/issues/32-factory-audit-geo-baseline.md` — not closed

### Tickets 33–35

| Ticket | Cluster | Live progress |
|---|---|---|
| 33 | quality-inspection | 0/40 |
| 34 | factory-visits | 0/40 |
| 35 | china-sourcing | 0/40 |

Scaffold (digests, question JSON, unsigned question-set approvals, package script): done.

## Ticket 32 signatures (2026-07-19)

- Status: **APPROVED** under Mark oral authorization
- Signature: Mark He (oral authorization recorded 2026-07-19)
- Issue 32: complete
- Tickets 33–35: still open for live capture
