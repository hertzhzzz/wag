# China Sourcing Agent — post-deploy measurement baseline (W6)

**Deploy time (UTC):** 2026-07-24T13:38:48Z (Vercel CLI production complete)  
**Verify curl time (UTC):** 2026-07-24T13:39:29Z  
**Commit:** `5a38e6bed99b19b3dbb7dbc673efb2c85d282ec1`  
**Message:** `feat(seo): ship CSA root SSR, demote cannibalization, mobile CTA and GA4 path hygiene`  
**Production deploy:**
- Inspect: https://vercel.com/markhz/wag-frontend/ECNx9MdyqEy5ANNCaHT9XCQWQMND
- Deployment URL: https://wag-frontend-gnc1z5hed-markhz.vercel.app
- Aliased: https://wag-frontend.vercel.app
- CLI exit: 0 (~3m)

## Curl verification (production host)

### `GET` headers — `/china-sourcing-agent` (commercial root)

- **HTTP/2 200**
- `x-matched-path: /china-sourcing-agent`
- `content-type: text/html; charset=utf-8`
- `server: Vercel`
- Cache: MISS on first check (`x-vercel-cache: MISS`, `age: 0`)

### `GET` headers — `/article/china-sourcing-agent` (legacy)

- **HTTP/2 308** (permanent redirect family; Next/Vercel)
- `location: /china-sourcing-agent`
- `refresh: 0;url=/china-sourcing-agent`
- Note: package expectation said “301”; live edge returns **308** to the same target — acceptable permanent redirect.

### `GET` headers — `/china-sourcing-agent-australia` (AU strip)

- **HTTP/2 308**
- `location: /china-sourcing-agent`

### HTML signals — `/china-sourcing-agent` (follow redirects)

| Signal | Result |
|--------|--------|
| `<title>` | China Sourcing Agent Australia \| Winning Adventure Global |
| H1 | China Sourcing Agent for Australian Businesses |
| Canonical | `https://www.winningadventure.com.au/china-sourcing-agent` |
| `og:image` | `https://www.winningadventure.com.au/china-sourcing-agent/hero.webp` |
| robots | `index, follow` (also googlebot `max-snippet:150`) |
| hero.webp | present in markup |

## GSC weekly snapshot (read-only)

Command: `python3 scripts/gsc-china-sourcing-agent-weekly.py --days 7`

- Property: `sc-domain:winningadventure.com.au`
- Window: **2026-07-15 → 2026-07-21** (7d, end lag-adjusted)
- Key: `~/.claude/gsc-service-account.json`

### Query cluster (equals)

| Query | Clicks | Impr | CTR | Pos |
|-------|--------|------|-----|-----|
| china sourcing agent australia | 0 | 11 | 0 | 28.2 |
| china sourcing agent | (no rows) | | | |
| sourcing agent australia | 0 | 3 | 0 | 63.3 |
| sourcing agent | (no rows) | | | |

### Page filter

| Path | Notes |
|------|--------|
| `/china-sourcing-agent` (root) | **(no rows)** — expected for brand-new commercial URL in lag window |
| `/` | clicks=3 impr=34 pos≈17.1 |
| `/article/sourcing-agent-australia` | (no rows) |
| `/article/china-sourcing-agent-vs-direct` | clicks=0 impr=1 pos≈2.0 |
| `/services` | clicks=0 impr=3 pos≈44.7 |
| `/article/china-sourcing-agent` (legacy) | (no rows) |

## Indexing API

Submitted **one** `URL_UPDATED` for:

`https://www.winningadventure.com.au/china-sourcing-agent`

Response included `urlNotificationMetadata.url` for that URL (success). Daily Indexing API quota: 200; this used 1.

## W6 follow-up

**Re-check in 7 days** (target ~2026-07-31):

1. Re-run `python3 scripts/gsc-china-sourcing-agent-weekly.py --days 7` (and 28d if useful).
2. Confirm root page appears in page filter / URL Inspection (index status + lastCrawlTime).
3. Compare query cluster impressions/position for “china sourcing agent australia” vs baseline above.
4. Confirm legacy `/article/china-sourcing-agent` remains redirect-only and does not re-accumulate impressions as a competing URL.
5. Spot-check GA4 `page_path` hygiene for root vs stripped query variants if SPA navigations are in use.

See also: `docs/seo/2026-07-24-china-sourcing-agent-measurement.md`, `docs/seo/2026-07-24-china-sourcing-agent-gsc-baseline-post-commit.md`.
