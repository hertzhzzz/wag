# 02 — Build a Compatible Unified Article Reader

**What to build:** Replace duplicated article parsing with one validated reader that supplies article lists, article pages, sitemaps, and downstream SEO tooling while preserving the current public output. It must accept the existing 23-article format during migration and surface actionable compatibility warnings instead of silently dropping content.

**Blocked by:** 01.

**Status:** completed

- [x] Article list, detail, sitemap, and shared article utilities consume the same validated reader.
- [x] All 23 existing articles remain discoverable at their current URLs with equivalent metadata and rendered content.
- [x] Legacy-compatible fields are accepted with explicit, deterministic warnings.
- [x] Invalid required fields fail with an article identifier and a useful validation message.
- [x] A deliberately invalid fixture proves that malformed content cannot be silently published.
- [x] Reader output is deterministic across repeated runs on an unchanged corpus.
