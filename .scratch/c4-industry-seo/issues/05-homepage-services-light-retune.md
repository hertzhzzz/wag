# 05 — Homepage + services light retune

**What to build:** Lightly retune homepage and services so site-wide positioning matches the industry dual-path offer: China sourcing for Australian businesses, find-and-vet primary, visit/verify secondary. Add stable SSR-friendly internal links into the three priority industry pages. No full visual redesign, nav IA rebuild, or mega-menu work.

**Blocked by:** 02 — Industry content model + AV rewrite

**Status:** done

- [x] Homepage primary promise frames China sourcing for Australian businesses
- [x] Homepage exposes clear entries/links to all three priority industries
- [x] Services presents find-and-vet as primary and visit/verify as secondary
- [x] Services includes stable internal links to the three industry URLs
- [x] Changes remain light retune only — no full redesign or IA rebuild
- [x] Public copy stays English; brand name remains “Winning Adventure Global”

## Verification

- Source + unit tests only (no `view_image` / visual PNG load).
- `npx jest lib/c4-site-retune.test.ts lib/priority-industry-links.test.ts --runInBand` — pass.
