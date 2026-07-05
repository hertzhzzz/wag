// 137 irrelevant /resources/ → 301 redirects removed 2026-06-22.
// Those URLs now return 410 Gone via proxy.ts (gone-paths.ts).
//
// The 20 /article/{slug} rules that used to live here were migrated into
// lib/gone-paths.ts BLOG_REDIRECT_TARGETS on 2026-07-05: this file only ever
// covered /article/{slug}, so /resources/{slug} fell through to proxy.ts's
// /article/{slug} fallback and then hit this file for a second redirect hop
// (double-hop, seen in GSC as stale "duplicate canonical" reports). Two of the
// slugs (dashdot-property-collapse-asset-liquidation-guide,
// kyle-busch-china-auto-parts-sourcing) were also in BLOG_GONE_SLUGS, so this
// file's redirect was silently shadowing their intended 410. See gone-paths.ts
// for the current single-registry rules.

module.exports = [];
