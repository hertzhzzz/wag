# China Sourcing Agent SEO — Current State Research

**Date:** 2026-07-24  
**Scope:** Winning Adventure Global frontend (`frontend/`), Australia / en-AU money terms around **China sourcing agent**  
**Method:** Read-only repo audit + live HTTP checks + GSC Search Analytics (service account) + GA4 Data API  
**Plan consumer:** `~/.cursor/plans/china_sourcing_agent_seo_fbbc3bfd.plan.md`  
**No code shipped / no deploy** in this research pass.

---

## 1. Executive summary

| Finding | Evidence |
|---------|----------|
| **No dedicated commercial root at `/china-sourcing-agent`** | Live URL returns **404**; local `app/(public)/china-sourcing-agent/` is an **empty directory** (no `page.tsx`) |
| **Closest commercial-ish page is mis-nested** | Live **200**: `/article/china-sourcing-agent` — hard-coded service landing under `article/`, not MDX, not in Services mega-menu |
| **Money-query ownership is split / wrong** | GSC page×query: homepage + about + editorial articles share `china sourcing agent australia` impressions; no single commercial winner |
| **Footer “China Sourcing Agent” is broken / weak** | Points to `/#capabilities`, but homepage **does not render** `SourcingCapabilities` (`id="capabilities"` exists only in an unused component) |
| **Legacy 301s point at that dead anchor** | `next.config.js`: `/china-sourcing-agent-australia` and `/china-sourcing-guide-australia` → `/#capabilities` |
| **GSC agent cluster: impressions, ~0 clicks** | Window **2026-06-24 → 2026-07-21**: top query `china sourcing agent australia` = **36 impr / 0 clicks / pos 34.5** |
| **GA4: organic demand for agent URLs is tiny** | Last 28d: `/services` organic 9 sessions; agent articles/page mostly Direct / AI, not organic |
| **Phase 1 not started in code** | Only partial working-tree assets: empty route dir + untracked `public/china-sourcing-agent/hero.webp` |

**Default strategic recommendation (Decision A):** still **create `/china-sourcing-agent` as Commercial Root**, migrate equity from `/article/china-sourcing-agent` (301), fix footer/nav/sitemap, demote homepage from money-term owner. Evidence strengthens this path (split SERP ownership + article-path confusion + dead anchors).

---

## 2. AS-IS keyword → URL ownership matrix

### 2.1 Intended vs observed (commercial money cluster)

| Intent / keyword | Design owner (2026-07-02 onsite plan) | Actual strongest receivers (GSC page×query, 2026-06-24–07-21) | Repo surface that claims the term | Assessment |
|------------------|----------------------------------------|----------------------------------------------------------------|-------------------------------------|------------|
| `china sourcing agent australia` | `/` (homepage) | `/` **20 impr / pos 23.9**; `/about` **14 / 56.1**; `/article/sourcing-agent-australia` **10 / 58.2**; vs-direct **1** | Home keywords meta; city pages titles; article service page H1/title | **Cannibalisation** — no commercial root |
| `china sourcing agent` | (implicit home / services) | vs-direct **1 impr / pos 90** only in sample | `/article/china-sourcing-agent` title/H1/keywords | Near-invisible |
| `sourcing agent australia` | `/` | Page-level: `/article/sourcing-agent-australia` **105 impr / pos 31.9** (page total, multi-query) | Editorial MDX pillar | **Editorial owns** informational “how to choose” — correct if commercial root exists |
| `sourcing agent` / variants | mixed | Query list only; no strong page concentration | various | Noise / career / generic |
| `china sourcing agent near me` | city pages | `/` **1 impr / pos 14** (http host variant) | `/locations/*` titles say “China Sourcing Agent for {City}” | City pages **claim agent** in title without linking to a real agent commercial root |
| Multi-service browse | `/services` | `/services` **23 impr / pos 37** (page filter) | Services title = “China Sourcing **Services**” | Correct hub role; **not** agent money root |
| Agent vs direct | comparison article | `/article/china-sourcing-agent-vs-direct` **15 impr / pos 20.1** | MDX | Keep as decision content |
| Supplier verification / audit / visits | dedicated service URLs | Out of primary agent matrix (separate clusters) | live service pages | Do not absorb into agent title |

### 2.2 Target TO-BE ownership (for plan — not implemented)

| Role | URL | Primary keywords |
|------|-----|------------------|
| **Commercial Root** | `/china-sourcing-agent` (**new**) | `china sourcing agent australia`, `china sourcing agent`, `sourcing agent australia` (transactional) |
| **Editorial Pillar** | `/article/sourcing-agent-australia` | how to choose, fees, red flags |
| **Decision / comparison** | `/article/china-sourcing-agent-vs-direct` | agent vs direct |
| **Legacy commercial content** | `/article/china-sourcing-agent` → **301** to Commercial Root after ship | equity transfer |
| **Services hub** | `/services` | multi-service compare; section may link **to** root |
| **Home** | `/` | brand + broad “China sourcing for Australian businesses”; **link to** root; **stop** owning agent money title |
| **City / industry overlays** | `/locations/*`, `/industries/*` | geo/industry modifiers; prose link to root; avoid thin “agent {city}” doorway pages |

Full matrix source of truth for execution: this file + plan §「现状调研结论」.

---

## 3. Page inventory (primary sources)

### 3.1 Commercial / structural routes

| Path | Status (live 2026-07-24) | Code | Metadata notes |
|------|--------------------------|------|----------------|
| `/china-sourcing-agent` | **404** | Empty dir `app/(public)/china-sourcing-agent/` | — |
| `/article/china-sourcing-agent` | **200** | `app/(public)/article/china-sourcing-agent/page.tsx` | Title “China Sourcing Agent Services”; Service schema; breadcrumb under Articles |
| `/services` | 200 | `app/(public)/services/page.tsx` + `ServicesContent.tsx` | Title services-focused; `#sourcing-agent` section exists but H2 is “China Sourcing for Australian Businesses” |
| `/` | 200 | `app/(public)/page.tsx` | Title “China Sourcing for Australian Businesses…”; keywords include agent AU |
| `/locations/{city}` | 200 | `app/(public)/locations/[city]/page.tsx` | Title pattern: “China Sourcing Agent for {City} Importers” |
| `/supplier-verification`, `/factory-audit-china`, `/quality-inspection-china`, `/visiting-chinese-factories` | 200 | service landings | Live in mega-menu (`app/data/nav-links.ts`) |
| `/china-sourcing-agent-australia` | **301 → `/#capabilities`** | `next.config.js` | Dead anchor target risk |
| `/china-sourcing-guide-australia` | **301 → `/#capabilities`** | `next.config.js` | Same; also linked from agent article body |
| `/solutions` | redirect to `/services` | `app/(public)/solutions/page.tsx` | Still listed in `app/sitemap.ts` (dirty) |

### 3.2 Editorial (MDX)

| Slug | Path | Role |
|------|------|------|
| `sourcing-agent-australia` | `content/blog/sourcing-agent-australia.mdx` | Best editorial pillar (choose agent / fees / red flags); author Andy Liu; links to vs-direct |
| `china-sourcing-agent-vs-direct` | `content/blog/china-sourcing-agent-vs-direct.mdx` | Decision guide |
| Other China Sourcing Strategy articles | various | Supporting; several link to `/article/china-sourcing-agent` as “service” |

### 3.3 Navigation & discovery surfaces

| Surface | Agent-related behaviour | Issue |
|---------|-------------------------|--------|
| Services mega-menu (`nav-links.ts`) | Verification / visits / audit / QI / services overview | **No** China Sourcing Agent commercial link |
| Footer (`Footer.tsx`) | Label `footer.linkSourcingAgent` → **`/#capabilities`** | Anchor not on homepage; **wrong target** |
| Article list explore (`ArticleListContent.tsx`) | “China Sourcing Agent” → `/article/china-sourcing-agent` | Nested under article IA; labelled “Service Page” in i18n |
| Sitemap (`sitemap.ts`) | services, nav live links, articles | **No** `/china-sourcing-agent`; still includes `/solutions` |
| Internal links | MDX + list CTAs point at `/article/china-sourcing-agent` | Will need retarget after new root |

### 3.4 Working-tree partials (not shipped)

| Asset | State |
|-------|--------|
| `app/(public)/china-sourcing-agent/` | Empty directory only (created 2026-07-24 in tree) |
| `public/china-sourcing-agent/hero.webp` | **Untracked** (~105KB); usable for Phase 1 hero if approved |
| No `page.tsx` / no i18n keys for new commercial root yet | Confirmed by glob + git status |

---

## 4. GSC baseline (service account)

**Property:** `sc-domain:winningadventure.com.au`  
**Auth:** `~/.claude/gsc-service-account.json` (Owner)  
**Cursor GSC MCP:** only `sc-domain:footytonight.com` — **cannot** use MCP for WAG; scripts required.  
**Window:** **2026-06-24 → 2026-07-21** (28 days ending with ~3-day GSC lag from research date 2026-07-24)

### 4.1 Query cluster (regex: china sourcing agent / sourcing agent…)

| Query | Clicks | Impressions | CTR | Avg position |
|-------|--------|-------------|-----|--------------|
| china sourcing agent australia | 0 | 36 | 0% | 34.5 |
| sourcing agent australia | 0 | 23 | 0% | 37.7 |
| sourcing agent | 0 | 21 | 0% | 39.4 |
| manufacturing sourcing agent | 0 | 15 | 0% | 57.5 |
| product sourcing agent | 0 | 13 | 0% | 66.6 |
| sourcing agent in australia | 0 | 4 | 0% | 43.0 |
| china sourcing agent | 0 | 1 | 0% | 90.0 |
| china sourcing agent near me | 0 | 1 | 0% | 14.0 |
| (+ long-tail career/contract queries) | 0 | low | — | mixed |

**Equals filter:** `china sourcing services australia` / `china sourcing australia` → **no rows** in this window.

### 4.2 Page filter (agent-related paths)

| Page | Clicks | Impr | Pos |
|------|--------|------|-----|
| `/article/sourcing-agent-australia` | 0 | 105 | 31.9 |
| `/services` | 0 | 23 | 37.0 |
| `/article/china-sourcing-agent-vs-direct` | 0 | 15 | 20.1 |

Note: `/article/china-sourcing-agent` did **not** appear in this page-filter top set for the window (low or zero Search Console page reporting despite live 200).

### 4.3 Historical comparison

| Source | Metric | Value |
|--------|--------|-------|
| Audit 2026-07-01 | `china sourcing agent australia` | ~31 impr, pos ~40.1, 0 clicks |
| This research 2026-07-24 | same query | 36 impr, pos 34.5, 0 clicks |

Slight position improvement, still **page-2+/low CTR**, still **zero clicks**.

### 4.4 Older sitewide GSC (context only)

From `docs/plans/2026-07-02-wag-onsite-seo-design.md` (API verified 2026-07-02): ~12 clicks / 3,654 impressions sitewide 28d — not re-pulled as full site export in this pass.

---

## 5. GA4 baseline

**Property:** `526384627` (from `.secrets/ga4-property-id.txt`)  
**API:** Analytics Data API via same service account  
**Window:** last 28 days ending yesterday (relative to 2026-07-24)

### 5.1 Sitewide channels

| Channel | Sessions | Users | Key events |
|---------|----------|-------|------------|
| Direct | 1304 | 1242 | 65 |
| Organic Search | 170 | 129 | 18 |
| Paid Search | 86 | 82 | 11 |
| AI Assistant | 11 | 11 | 2 |
| Organic Social | 11 | 11 | 0 |
| Referral | 10 | 5 | 8 |

### 5.2 Agent-related pagePath × channel (partial regex)

| pagePath | Channel | Sessions | Users | Views |
|----------|---------|----------|-------|-------|
| `/services` | Direct | 16 | 13 | 31 |
| `/services` | Paid Search | 15 | 14 | 16 |
| `/services` | Organic Search | 9 | 6 | 15 |
| `/article/sourcing-agent-australia` | Direct | 2 | 2 | 2 |
| `/article/china-sourcing-agent` | AI Assistant | 1 | 1 | 1 |
| `/article/china-sourcing-agent` | Direct | 1 | 1 | 1 |
| `/article/china-sourcing-agent-vs-direct` | Direct | 1 | 1 | 1 |

**Read:** commercial interest is mostly **Paid + Direct on `/services`**. Organic agent-specific sessions are **near zero**. AI assistants already surface `/article/china-sourcing-agent` at tiny volume.

**Enquiry quality:** 2026-07-02 design still notes real qualified enquiries ~0 and polluted `generate_lead` events — treat keyEvents as **untrusted for SEO ROI** until form funnel ADR work is trusted.

---

## 6. Confirmed gaps & cannibalisation

1. **Missing Commercial Root** `/china-sourcing-agent` (404).  
2. **Service page under `/article/`** confuses IA (breadcrumb “Articles”, list cards, not mega-menu).  
3. **Footer + legacy 301s → `/#capabilities`** while homepage never mounts `SourcingCapabilities`.  
4. **Home keywords claim agent AU** while title/H1 do not say “Agent” — soft claim without conversion page.  
5. **City pages** use “China Sourcing Agent for {City}” titles without a sitewide commercial root to absorb equity.  
6. **Sitemap** includes `/solutions` redirect URL; omits future commercial root.  
7. **Broken outbound** from agent article: `/china-sourcing-guide-australia` → homepage dead anchor.  
8. **Growth System ticket 11** (China Sourcing core migration): scaffold/contracts only; **ledger still approval-required / locked=false** — not production cutover.  
9. **Legacy cluster YAML** pillar `china-sourcing-strategy-australia` still **missing** live (baseline 2026-07-17).  
10. **GSC MCP** unusable for WAG in Cursor — operational friction for weekly measurement.

---

## 7. What is already partially built (do not invent)

| Item | Built? | Notes |
|------|--------|-------|
| Live `/article/china-sourcing-agent` service-style page | **Yes (prod)** | Process, comparison table, FAQ, Service schema, enquiry CTAs |
| Empty `app/(public)/china-sourcing-agent/` | Dir only | **No page implementation** |
| `public/china-sourcing-agent/hero.webp` | Local untracked | Asset only |
| Editorial MDX pair (pillar + vs-direct) | Yes | Strong content base |
| Dual-root ADR 0006 + Growth System design | Docs/scaffold | China Sourcing priority still #5 in default portfolio |
| i18n keys for footer label “China Sourcing Agent” | Yes | Wrong href |
| Production `/china-sourcing-agent` | **No** | 404 |

---

## 8. Decision A evidence check

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A1 New `/china-sourcing-agent`** | Clean money URL; matches dual-root ADR; can 301 article path; mega-menu/footer/sitemap fit other service landings | One more URL; need equity transfer + redirect hygiene | **Recommended** |
| **A2 Rewrite `/services` as agent root** | Fewer URLs | Conflicts multi-service hub; paid/organic already use services as hub; dilutes verification/visit siblings | Reject for money root |
| **A3 Keep only `/article/china-sourcing-agent`** | Already live content | Wrong IA; weak GSC page reporting; list/breadcrumb treat as article; title not fully money-aligned | Temporary only |

**Conclusion:** Research **does not contradict** default Decision A. It **strengthens** A1: treat existing article service page as **content donor + 301 source**, not final root.

---

## 9. Files most relevant to Phase 1 (when approved)

| File | Why |
|------|-----|
| `app/(public)/china-sourcing-agent/page.tsx` (+ Content component) | **Create** commercial root |
| `public/china-sourcing-agent/hero.webp` | Optional hero (already staged locally) |
| `app/(public)/article/china-sourcing-agent/page.tsx` | 301/retarget after root ships |
| `next.config.js` | Retarget `/china-sourcing-agent-australia` (and guide?) away from `/#capabilities` |
| `app/components/Footer.tsx` | Fix agent + guide links |
| `app/data/nav-links.ts` | Add live service link |
| `app/sitemap.ts` | Add root; drop `/solutions` |
| `app/i18n/dictionaries/en.ts` / `zh.ts` | New page keys |
| `app/components/ArticleListContent.tsx`, `ResourcesContent.tsx` | Retarget explore cards |
| MDX internal links to `/article/china-sourcing-agent` | Batch contextual update (human-reviewed anchors) |
| `app/(public)/page.tsx` | Soften agent keyword ownership; link to root |
| `app/(public)/locations/[city]/page.tsx` | Link to root; avoid competing as sole agent owner |
| `app/(public)/services/ServicesContent.tsx` | Link `#sourcing-agent` section → root |

---

## 10. Risks / blockers for execution

| Blocker | Owner |
|---------|-------|
| Explicit **implement approval** for Phase 1 (this research/plan pass must not ship code) | Mark |
| **Production deploy** still manual `vercel --prod` after push | Mark |
| GSC weekly pulls via **service account script**, not Cursor MCP | Agent ops |
| Growth System ledger lock for ticket 11 if Phase 2 migrates cluster | Mark approval |
| Key event / enquiry attribution trust | Separate funnel work |
| Do not auto-publish factory directory `/factory` as SEO bet | Product decision |

---

## 11. Sources

- Repo: `app/(public)/*`, `content/blog/*`, `app/sitemap.ts`, `app/data/nav-links.ts`, `app/components/Footer.tsx`, `next.config.js`
- `docs/audits/2026-07-01-full-site-seo-audit.md`
- `docs/plans/2026-07-02-wag-onsite-seo-design.md`
- `docs/seo/2026-07-17-baseline.md`
- `docs/adr/0006-service-led-dual-root-seo-graph.md`
- `.scratch/seo-growth-system/issues/11-china-sourcing-core-migration.md`
- Live HTTP: `/article/china-sourcing-agent` 200; `/china-sourcing-agent` 404
- GSC Search Analytics API (2026-06-24–2026-07-21)
- GA4 Data API property `526384627` (28 days)

---

*End of research note — 2026-07-24*
