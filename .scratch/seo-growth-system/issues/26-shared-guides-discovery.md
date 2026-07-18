# 26 — Deliver the Shared Guides Discovery Experience

**What to build:** Create a coherent Guides discovery experience that exposes all five pillars, useful filters, recent governed articles, and direct paths into individual guides. Shared navigation and footer treatment must use the governed registry while leaving Services and legal navigation commercially and semantically distinct.

**Blocked by:** 25.

**Status:** strict discovery contract complete; integration and human review pending / not done

- [ ] All five governed pillars are visible and link to valid destinations.
- [ ] Readers can filter or browse governed articles without creating duplicate crawlable result pages.
- [ ] Recent article ordering is deterministic and excludes drafts or blocked content.
- [ ] Primary Guides navigation routes directly to the article discovery experience.
- [ ] The shared footer lists the five pillar destinations without replacing Services or legal links.
- [ ] Sitemap and on-page discovery use the same governed source of truth.
- [ ] Desktop, mobile, keyboard, and screen-reader reviews pass with no layout overlap.

## P1 contract hardening — 2026-07-18

- The shared Guides discovery input now has a stable versioned contract identity and accepts `unknown` through a strict, exact-key runtime schema. Null, missing, extra-key, custom-prototype, malformed identity, and route/content identity drift fail closed.
- Actual/production `publishedDate`, `updatedDate`, and governance evidence dates are bounded by the explicit shared `asOf`, with 2026-07-18 as the latest permitted actual date. Future fixtures require `dataMode=synthetic_fixture`.
- The contract still requires exactly the five canonical clusters, deterministic governed discovery, English-only public copy, no emoji, and the full name Winning Adventure Global.
- Stable schema-derived exports are available for downstream Guides Integration; no downstream integration file, route, sitemap, navigation, indexing request, commit, push, or deployment was changed or performed here.
- UI integration, route/sitemap wiring, accessibility review, and human publication/indexing gates remain separate work.
