# China Sourcing Agent — measure-only T+0 snapshot

**Snapshot type:** Measure-only (read-only GSC + GA4 + prod smoke). No new articles, no authority publish, no commercial copy change.  
**Captured (local):** 2026-07-24 (evening AU; API pull ~14:20 UTC)  
**Companion baseline (do not overwrite):** [`2026-07-24-china-sourcing-agent-post-deploy-baseline.md`](./2026-07-24-china-sourcing-agent-post-deploy-baseline.md)  
**Live root:** `https://www.winningadventure.com.au/china-sourcing-agent`  
**Next recheck:** ~**2026-07-31** → write `2026-07-31-china-sourcing-agent-measure-T+7.md` (or same-day T+7 name)

---

## 1. Windows and commands

### GSC

- Property: `sc-domain:winningadventure.com.au`
- Key: `~/.claude/gsc-service-account.json`
- Lag-adjusted end date (script): **2026-07-21**
- Windows:
  - **7d:** 2026-07-15 → 2026-07-21
  - **28d:** 2026-06-24 → 2026-07-21

```bash
cd /Users/mark/Projects/wag/frontend
python3 scripts/gsc-china-sourcing-agent-weekly.py --days 7
python3 scripts/gsc-china-sourcing-agent-weekly.py --days 28
```

Supplemental (same SA, Search Analytics API):

- Query equals: `china sourcing`, `china sourcing solutions` (+ script money terms)
- Page × query equals for `china sourcing agent australia` (7d + 28d)

### GA4

- Property: **`526384627`** (Winning Adventure Global only)
- API: Analytics Data API via service account (not Cursor GA4 MCP)
- Windows:
  - **7d:** `7daysAgo` → `yesterday`
  - **28d:** `28daysAgo` → `yesterday`

### Prod smoke

```bash
curl -sI https://www.winningadventure.com.au/china-sourcing-agent
curl -sL https://www.winningadventure.com.au/china-sourcing-agent  # H1 / canonical / from-navy/90
curl -sI https://www.winningadventure.com.au/article/china-sourcing-agent
curl -sI https://www.winningadventure.com.au/china-sourcing-agent-australia
curl -sI https://www.winningadventure.com.au/china-sourcing-agent/hero.webp
```

---

## 2. Production smoke (curl)

| Check | Result | Status |
|-------|--------|--------|
| `GET /china-sourcing-agent` | HTTP/2 **200**; `x-matched-path: /china-sourcing-agent` | OK |
| `<title>` | China Sourcing Agent Australia \| Winning Adventure Global | OK |
| H1 | China Sourcing Agent for Australian Businesses | OK |
| Canonical | `https://www.winningadventure.com.au/china-sourcing-agent` | OK |
| Hero overlay class | `from-navy/90` **present** in HTML | OK |
| `og:image` | `.../china-sourcing-agent/hero.webp` | OK |
| `GET /article/china-sourcing-agent` | HTTP/2 **308** → `/china-sourcing-agent` | OK |
| `GET /china-sourcing-agent-australia` | HTTP/2 **308** → `/china-sourcing-agent` | OK |
| `GET /china-sourcing-agent/hero.webp` | HTTP/2 **200**, `image/webp`, ~365 KB | OK |

**Production issues found:** none (no 404, no missing overlay class, redirects intact). No `vercel --prod` required.

---

## 3. GSC tables

### 3.1 Query cluster (equals) — weekly script

#### 7d (2026-07-15 → 2026-07-21)

| Query | Clicks | Impr | CTR | Pos |
|-------|--------|------|-----|-----|
| china sourcing agent australia | 0 | 11 | 0 | 28.2 |
| china sourcing agent | (no rows) | | | |
| sourcing agent australia | 0 | 3 | 0 | 63.3 |
| sourcing agent | (no rows) | | | |

#### 28d (2026-06-24 → 2026-07-21)

| Query | Clicks | Impr | CTR | Pos |
|-------|--------|------|-----|-----|
| china sourcing agent australia | 0 | 36 | 0 | 34.5 |
| china sourcing agent | 0 | 1 | 0 | 90.0 |
| sourcing agent australia | 0 | 23 | 0 | 37.7 |
| sourcing agent | 0 | 21 | 0 | 39.4 |

### 3.2 Supplemental queries (equals)

| Query | Window | Clicks | Impr | Pos |
|-------|--------|--------|------|-----|
| china sourcing | 7d | 0 | 11 | 67.9 |
| china sourcing | 28d | 0 | 62 | 69.5 |
| china sourcing solutions | 7d | 0 | 2 | 3.0 |
| china sourcing solutions | 28d | 1 | 6 | 9.0 |

### 3.3 Page filter (equals URL)

#### 7d

| Path | Clicks | Impr | Pos | Notes |
|------|--------|------|-----|-------|
| `/china-sourcing-agent` (root) | — | — | — | **(no rows)** |
| `/` | 3 | 34 | ~17.1 | |
| `/article/sourcing-agent-australia` | — | — | — | (no rows) |
| `/article/china-sourcing-agent-vs-direct` | 0 | 1 | ~2.0 | |
| `/services` | 0 | 3 | ~44.7 | |
| `/article/china-sourcing-agent` (legacy) | — | — | — | (no rows) — good (redirect-only) |

#### 28d

| Path | Clicks | Impr | Pos | Notes |
|------|--------|------|-----|-------|
| `/china-sourcing-agent` (root) | — | — | — | **(no rows)** |
| `/` | 22 | 179 | ~12.4 | |
| `/article/sourcing-agent-australia` | 0 | 105 | ~31.9 | pillar still holds impr |
| `/article/china-sourcing-agent-vs-direct` | 0 | 15 | ~20.1 | |
| `/services` | 0 | 23 | ~37.0 | |
| `/article/china-sourcing-agent` (legacy) | — | — | — | (no rows) |

### 3.4 Page × query — main money term `china sourcing agent australia`

#### 7d

| Page | Impr | Pos | Clicks |
|------|------|-----|--------|
| `/` | 6 | 30.0 | 0 |
| `/about` | 6 | 34.3 | 0 |
| **root `/china-sourcing-agent`** | **0** | — | — |

#### 28d

| Page | Impr | Pos | Clicks |
|------|------|-----|--------|
| `/` | 20 | 23.9 | 0 |
| `/about` | 14 | 56.1 | 0 |
| `/article/sourcing-agent-australia` | 10 | 58.2 | 0 |
| `/article/china-sourcing-agent-vs-direct` | 1 | 35.0 | 0 |
| **root `/china-sourcing-agent`** | **0** | — | — |

**Read:** Money-term impressions still split across home / about / pillar. Commercial root has **not** entered GSC Search Analytics rows yet (expected: deploy day + 2–3d lag; GSC end still 2026-07-21).

---

## 4. GA4 tables (property 526384627)

KeyEvents remain **untrusted for SEO ROI** (funnel hygiene); reported for trend only.

### 4.1 Channel mix

#### 7d (`7daysAgo`–`yesterday`)

| Channel | Sessions | Engaged sessions | Bounce rate | Key events |
|---------|----------|------------------|-------------|------------|
| Direct | 541 | 28 | 0.948 | 2 |
| Organic Search | 30 | 14 | 0.533 | 0 |
| Paid Search | 26 | 13 | 0.500 | 0 |
| Organic Social | 4 | 0 | 1.000 | 0 |
| AI Assistant | 2 | 1 | 0.500 | 0 |
| Unassigned | 1 | 0 | 1.000 | 0 |

#### 28d (`28daysAgo`–`yesterday`)

| Channel | Sessions | Engaged sessions | Bounce rate | Key events |
|---------|----------|------------------|-------------|------------|
| Direct | 1304 | 113 | 0.913 | 65 |
| Organic Search | 170 | 79 | 0.535 | 18 |
| Paid Search | 86 | 44 | 0.488 | 11 |
| Cross-network | 22 | 5 | 0.773 | 0 |
| AI Assistant | 11 | 7 | 0.364 | 2 |
| Organic Social | 11 | 2 | 0.818 | 0 |
| Referral | 10 | 5 | 0.500 | 8 |
| Unassigned | 3 | 0 | 1.000 | 0 |

### 4.2 Organic Search landing pages (top)

#### 7d (selected; total organic sessions = 30)

| Landing page | Sessions | Bounce | KE |
|--------------|----------|--------|-----|
| `/article/importing-from-china-australia-guide` | 6 | 0.50 | 0 |
| `(not set)` | 3 | 1.00 | 0 |
| `/` | 3 | 0.67 | 0 |
| `/about` | 3 | 0.33 | 0 |
| `/china-sourcing-agent` | **0** | — | — |

#### 28d (top + agent-relevant)

| Landing page | Sessions | Bounce | KE |
|--------------|----------|--------|-----|
| `/` | 31 | 0.32 | 12 |
| `(not set)` | 16 | 1.00 | 0 |
| `/article/importing-from-china-australia-guide` | 14 | 0.36 | 0 |
| `/resources/netherlands-japan-football` | 13 | 0.85 | 4 |
| `/article` | 12 | 0.58 | 0 |
| `/services` | 3 | 0.33 | 0 |
| `/china-sourcing-agent` | **0** | — | — |

### 4.3 Paths / landings containing `china-sourcing-agent`

| Window | Signal | Result |
|--------|--------|--------|
| 7d | pagePath / landingPage contains `china-sourcing-agent` | **(no rows)** |
| 28d | pagePath | `/article/china-sourcing-agent` AI 1 + Direct 1; vs-direct Direct 1 |
| 28d | landingPage | same legacy article paths only (pre-redirect era traffic) |
| any | organic → commercial root | **0 sessions** |

### 4.4 Organic by device

| Window | Device | Sessions | Bounce | KE |
|--------|--------|----------|--------|-----|
| 7d | desktop | 22 | 0.545 | 0 |
| 7d | mobile | 8 | 0.500 | 0 |
| 28d | desktop | 113 | 0.469 | **18** |
| 28d | mobile | 55 | 0.655 | **0** |
| 28d | tablet | 2 | 1.000 | 0 |

**Mobile organic KE still ≈ 0** on 28d (desktop holds all 18). Sticky CTA / enquiry path remains a T+7 watch item, not a content brief trigger.

### 4.5 Dirty path regression

| Filter | 7d | 28d |
|--------|----|-----|
| `pagePath` contains `enquiry/https` | no rows | no rows |
| `pagePath` contains `https:` | no rows | no rows |

Path hygiene looks clean post-deploy.

---

## 5. Diff vs post-deploy baseline

Baseline file: `2026-07-24-china-sourcing-agent-post-deploy-baseline.md`  
Baseline GSC window was the same **7d 2026-07-15 → 2026-07-21** pull.

| Metric | Post-deploy baseline | This measure T+0 | Diff |
|--------|----------------------|------------------|------|
| GSC 7d `china sourcing agent australia` | 0 clk / 11 impr / pos 28.2 | 0 / 11 / 28.2 | **持平** (same lag window) |
| GSC 7d `sourcing agent australia` | 0 / 3 / 63.3 | 0 / 3 / 63.3 | **持平** |
| GSC root page `/china-sourcing-agent` | no rows | no rows | **仍无 rows** (expected) |
| GSC 7d `/` page | 3 / 34 / ~17.1 | 3 / 34 / ~17.1 | **持平** |
| GSC legacy article page | no rows | no rows | **持平** (good) |
| GSC 28d money term | not in post-deploy note | 0 / 36 / pos 34.5 | **new 28d anchor** |
| Prod root 200 + H1 + canonical | OK | OK | **持平** |
| Prod overlay `from-navy/90` | (post-deploy HTML check) | present | **OK** |
| Legacy 308 → root | OK | OK | **持平** |
| hero.webp | present in markup | 200 ~365 KB | **OK** |
| GA4 organic root sessions | not in post-deploy note | 0 (7d+28d) | **仍无** organic root |
| GA4 dirty paths | not quantified | 0 rows | **clean** |
| GA4 mobile organic KE (28d) | n/a | 0 vs desktop 18 | **watch** |

**Interpretation:** This T+0 measure re-anchors the same GSC lag window as W6 baseline (no new GSC days yet) and adds 28d GSC + full GA4 slices. Success of this phase = **reproducible snapshot**, not ranking lift.

---

## 6. Decision gate — current status only (do not write article)

### Content gate — fees article (Brief 1)

| Gate version | Criteria | Current status (T+0) | Action |
|--------------|----------|----------------------|--------|
| **Suggested (preferred for this site)** | Root 28d has GSC impressions **and** (main-term clicks ≥ 1 **or** root organic sessions measurable) | Root GSC impr = **0**; main-term clicks = **0**; root organic sessions = **0** | **Do not write** fees article |
| **Strict (original roadmap)** | Main term 28d pos ≤ 10 **and** clicks > 0 | pos **34.5**, clicks **0** | **Do not write** |
| T+7 decision | Re-evaluate suggested vs strict | Pending ~2026-07-31 | No auto-write |

**This phase:** no MDX, no authority materials, no commercial copy edits.

### Other deferred items (unchanged)

- GBP / Medium / directory: runbook only; human publish later
- Growth System ticket 11 cutover: not in scope
- No production deploy unless P0 technical fault (none found)

---

## 7. 7-day recheck protocol (~2026-07-31)

**When:** ~2026-07-31 (or first business day after).  
**Do:** re-run the same command set; write a new file `...-measure-T+7.md` (do not overwrite this file or post-deploy-baseline).

| Signal | Healthy direction | Unhealthy → next action (approve later) |
|--------|-------------------|----------------------------------------|
| Root URL GSC impr | 0 → has rows | Still 0: URL Inspection + optional 1× Indexing `URL_UPDATED` |
| Main term pos | Flat or better than ~28–37 (28d) | Worse: authority runbook + internal-link audit **before** new content |
| Main term / root clicks | > 0 | 0 but impr rising: W4 title/CTR on root only |
| GA4 organic → root | sessions ≥ 1 | 0: internal links + indexation, not new article |
| Mobile organic KE | Improve vs desktop share | Still ≈ 0: sticky CTA / enquiry path audit |

Compare tables in this T+0 file against T+7 line-by-line.

---

## 8. Ops notes

- **No commit** required for this note unless user asks.
- **No `vercel --prod`** (prod healthy).
- Indexing API was already submitted at post-deploy; not re-submitted in this measure pass.
- Do not use full-site organic spikes (e.g. football resource landings) to judge Agent SEO health.

---

*End of measure-only T+0 snapshot.*
