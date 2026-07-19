# GEO live matrix — Factory Audit

- Date: 2026-07-19
- Ticket: 32
- Question set: content/seo/geo/questions/factory-audit.json (status: draft)
- Digest: sha256:3bec0f9c3de17e1cb2c6f36562d1b3f907460d34f66c795040f0d7c8259dec6d
- Provenance: external-platform-observation
- Claim mode: observation-only
- Completeness: **40/40** live observations

## Matrix (status / brand / ownedUrl)

| Question | ChatGPT | Perplexity | Google AI Overviews | Bing Copilot |
|---|---|---|---|---|
| 01-scope | ans / b=no / u=no | ans / b=yes / u=yes | absent / b=no / u=no | ans / b=no / u=yes |
| 02-audit-or-verification | ans / b=no / u=no | ans / b=no / u=no | ans / b=no / u=no | ans / b=no / u=no |
| 03-records | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 04-capacity | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 05-subcontracting | ans / b=no / u=no | ans / b=no / u=no | ans / b=no / u=no | ans / b=no / u=no |
| 06-quality-system | ans / b=no / u=no | ans / b=yes / u=yes | absent / b=yes / u=yes | ans / b=no / u=no |
| 07-technical-audit | ans / b=no / u=no | ans / b=no / u=no | ans / b=no / u=no | ans / b=no / u=no |
| 08-report | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 09-compare-services | ans / b=no / u=no | ans / b=yes / u=yes | absent / b=yes / u=yes | ans / b=no / u=yes |
| 10-stop-findings | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |

## Brand / owned URL tallies (observation-only counts)

- brandMention=yes: 5/40
- ownedUrlCited=yes: 7/40

## Platform summaries

### chatgpt (`geo-fa-20260719-chatgpt-r1`)
- observations: 10/10
- observed-answer: 10; surface-absent: 0; blocked: 0
- brandMention yes: 0/10; ownedUrlCited yes: 0/10

### perplexity (`geo-fa-20260719-perplexity-r1`)
- observations: 10/10
- observed-answer: 10; surface-absent: 0; blocked: 0
- brandMention yes: 3/10; ownedUrlCited yes: 3/10

### google-ai-overviews (`geo-fa-20260719-google-ai-overviews-r1`)
- observations: 10/10
- observed-answer: 3; surface-absent: 7; blocked: 0
- brandMention yes: 2/10; ownedUrlCited yes: 2/10

### bing-copilot (`geo-fa-20260719-bing-copilot-r1`)
- observations: 10/10
- observed-answer: 10; surface-absent: 0; blocked: 0
- brandMention yes: 0/10; ownedUrlCited yes: 2/10

## Run IDs

- `chatgpt`: `geo-fa-20260719-chatgpt-r1` → `content/seo/geo/evidence/live/geo-fa-20260719-chatgpt-r1/`
- `perplexity`: `geo-fa-20260719-perplexity-r1` → `content/seo/geo/evidence/live/geo-fa-20260719-perplexity-r1/`
- `google-ai-overviews`: `geo-fa-20260719-google-ai-overviews-r1` → `content/seo/geo/evidence/live/geo-fa-20260719-google-ai-overviews-r1/`
- `bing-copilot`: `geo-fa-20260719-bing-copilot-r1` → `content/seo/geo/evidence/live/geo-fa-20260719-bing-copilot-r1/`

## Notes

- Google AI Overviews: some prompts returned an AI Overview block (observed-answer); others organic-only (observed-surface-absent). brand/owned measured from full SERP text when AIO absent.
- Bing Copilot: captured via Bing SERP generative answer surface (en-AU), not full copilot.microsoft.com chat. Bing redirect URLs decoded for organic domain list.
- ChatGPT: signed-in Free (Mark He Free); outbound citations often empty in UI.
- Perplexity: signed-in Free; some brand/owned presence on commercial compare prompts.
- Question set JSON `status` remains `draft`; human approval packages still PENDING Mark signature.
- Ticket 32 must NOT be closed without named human approvals (question set + platforms + retention).
- Observation-only: do not treat brand/owned rates as ranking or optimisation causality.

## Next

1. Mark signs question-set + platform/retention packages for Ticket 32.
2. Then advance Tickets 33–35 (quality-inspection, factory-visits, china-sourcing) with the same 40/40 live matrix pattern.
