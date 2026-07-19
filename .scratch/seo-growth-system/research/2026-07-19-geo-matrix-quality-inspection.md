# GEO live matrix — Quality Inspection

- Date: 2026-07-19
- Ticket: 33
- Question set: content/seo/geo/questions/quality-inspection.json (status: draft)
- Digest: sha256:7ea4fd81936885385e0d3a9322996609deda06f73345a9daca12ee56dc2cbd1e
- Provenance: external-platform-observation
- Claim mode: observation-only
- Completeness: **40/40** live observations

## Matrix (status / brand / ownedUrl)

| Question | ChatGPT | Perplexity | Google AI Overviews | Bing Copilot |
|---|---|---|---|---|
| 01-stage | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 02-aql | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 03-report | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 04-checklist | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 05-defect-classes | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 06-during-production | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 07-failed-inspection | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 08-reinspection | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 09-compare-services | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |
| 10-packaging-compliance | ans / b=no / u=no | ans / b=no / u=no | absent / b=no / u=no | ans / b=no / u=no |

## Brand / owned URL tallies (observation-only counts)

- brandMention=yes: 0/40
- ownedUrlCited=yes: 0/40

## Platform summaries

### chatgpt (`geo-qi-20260719-chatgpt-r1`)
- observations: 10/10
- observed-answer: 10; surface-absent: 0; blocked: 0
- brandMention yes: 0/10; ownedUrlCited yes: 0/10
- asOf: 2026-07-19T04:07:54.561Z
- surface: chatgpt-chat-web; auth: signed-in-test-account; tier: free

### perplexity (`geo-qi-20260719-perplexity-r1`)
- observations: 10/10
- observed-answer: 10; surface-absent: 0; blocked: 0
- brandMention yes: 0/10; ownedUrlCited yes: 0/10
- asOf: 2026-07-19T04:12:30.916Z
- surface: perplexity-web; auth: signed-in-test-account; tier: free

### google-ai-overviews (`geo-qi-20260719-google-ai-overviews-r1`)
- observations: 10/10
- observed-answer: 0; surface-absent: 10; blocked: 0
- brandMention yes: 0/10; ownedUrlCited yes: 0/10
- asOf: 2026-07-19T04:03:03.455Z
- surface: google-search-serp-en-AU; auth: signed-out

### bing-copilot (`geo-qi-20260719-bing-copilot-r1`)
- observations: 10/10
- observed-answer: 10; surface-absent: 0; blocked: 0
- brandMention yes: 0/10; ownedUrlCited yes: 0/10
- asOf: 2026-07-19T04:05:16.939Z
- surface: bing-serp-generative-answer-en-AU; auth: signed-out

## Run IDs

- `chatgpt`: `geo-qi-20260719-chatgpt-r1` → `content/seo/geo/evidence/live/geo-qi-20260719-chatgpt-r1/`
- `perplexity`: `geo-qi-20260719-perplexity-r1` → `content/seo/geo/evidence/live/geo-qi-20260719-perplexity-r1/`
- `google-ai-overviews`: `geo-qi-20260719-google-ai-overviews-r1` → `content/seo/geo/evidence/live/geo-qi-20260719-google-ai-overviews-r1/`
- `bing-copilot`: `geo-qi-20260719-bing-copilot-r1` → `content/seo/geo/evidence/live/geo-qi-20260719-bing-copilot-r1/`

## Notable competitor domains (frequency across 40 obs; not causal)

- tradeaiders.com (14), epicsourcing.com.au (8), qcadvisor.com (6), the-inspection-company.com (6)
- insight-quality.com (5), tetrainspection.com (5), guidedimports.com (5), hqts.com (5), linkedin.com (5)
- qualityinspection.org (4), huangsourcing.com (4), nbnqc.com (4), ecqa.com (4), qima.com (4)

## Notes

- Google AI Overviews: **all 10** prompts returned organic-only SERP in this capture window (`observed-surface-absent` for generative AIO surface). brand/owned measured from full SERP text when AIO absent → still 0/10.
- Bing Copilot: captured via Bing SERP generative answer surface (en-AU), not full copilot.microsoft.com chat.
- ChatGPT: signed-in Free test account; outbound citations often empty in UI; brand/owned 0/10.
- Perplexity: signed-in Free; brand/owned 0/10 this window.
- Question set JSON `status` remains `draft` as a schema literal; human approval packages were signed by Mark He on 2026-07-19.
- Ticket 33 must NOT be closed without named human approvals (question set + platforms + retention).
- Observation-only: do not treat brand/owned rates as ranking or optimisation causality.

## Next

1. Mark signs question-set + platform/retention packages for Ticket 33.
2. Then advance Tickets 34–35 (factory-visits, china-sourcing) with the same 40/40 live matrix pattern.
3. Do not race Ticket 36 ahead of 34–35.
