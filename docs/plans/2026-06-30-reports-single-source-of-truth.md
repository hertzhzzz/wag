# PR-1 · Reports: single source of truth (file-driven), retire dual registration

> Proposal only, not implemented. Do not execute without explicit go-ahead. Extracted from `frontend/CLAUDE.md` on 2026-07-05 (was a 55-line section crowding the main doc).

**简述（中文）:** 现在加一份报告要同时改 MDX 文件和 `clients.json` 两处（外加 CMS 库的索引卡），元数据三处重复、易漂移；漏改 json 就出现"文件在、门户看不见"。目标——让 **MDX 文件成为报告的唯一事实源**，列表由扫描内容目录自动派生，`clients.json` 只留真正的配置。

**Problem (observed 2026-06-30, Golden Sea report).** A report's metadata lives in 2–3 hand-synced places:

1. `content/reports/{slug}/{id}.mdx` frontmatter — title, supplier, category, date, status, sort_order
2. `data/clients/{slug}.json` → `deliverables[]` — same fields duplicated; this is what actually drives the sidebar/dashboard
3. (cross-repo) CMS vault `Archive/reports/{Name} (DD).md` index card — same fields again

Consequences:

- **Silent failure** — add the MDX but forget the json entry → the report renders at its URL but never appears in the sidebar (nav is built from json, not from files). Exactly what happened with Golden Sea.
- **Drift** — `status` / `title` / `category` / `date` exist in two copies that can disagree; no defined winner.
- **Two ordering systems** — MDX `sort_order` *and* json array order both exist; the sidebar uses array order, so `sort_order` is silently ignored.
- **God-file** — `clients.json` mixes identity, access hash, project meta, the report list, product_matrix, and itinerary.

**Recommended design — content as the source of truth.**

- The **MDX file is canonical** for a report; `report_id` = filename (no separate field).
- New `lib/reports.ts`: `getReports(clientSlug, projectSlug?)` globs `content/reports/{clientSlug}/*.mdx`, parses frontmatter (`gray-matter`, already used by `readReport`), returns a typed list sorted by a single `order` field (fallback `date`), filtered by `status` per caller.
- Sidebar, project dashboard, and `getReportPrevNext` all consume `getReports()` → automatically consistent. **Adding a report = drop one MDX file; zero json edits.** The silent-failure mode is gone by construction.
- `data/clients/{slug}.json` shrinks to genuine config: client identity, access, and per-project non-report config (name/location/status, product_matrix, itinerary). The `deliverables` report list is removed.
- **One ordering mechanism** — single `order` integer in frontmatter; delete `sort_order` and the json-array-order dependency.
- **One status field** — frontmatter `status` is authoritative; json no longer carries report status.

**Status lifecycle (clarify):** draft → delivered → client_reviewed → final. Decide whether `draft` is hidden from the client portal (recommended: hidden = "not client-visible yet", shown only in an internal preview) or shown with a Draft badge (current behavior — note the portal sidebar currently shows drafts because it filters only on `report_id`).

**Integrity guard (DX):** add `scripts/check-reports.mjs` to `npm run build` / lint — assert every MDX has required frontmatter, `report_id` matches filename, referenced images exist. Fail the build instead of failing silently in the live portal.

**Alternatives considered:**

- *Config-as-source* (all metadata in json, MDX body-only) — still two files per report; doesn't remove the "forgot to register" failure. Rejected.
- *Generated manifest* (build script writes json from MDX) — adds a generated artifact to keep in git; more machinery than a content collection needs at this scale. Fallback only if runtime globbing perf ever becomes a concern.

**Migration (phased, reversible, when approved):**

1. Add `lib/reports.ts` (glob + frontmatter → sorted list) alongside the json; cover sort/filter with a small test.
2. Repoint Sidebar + dashboard + `getReportPrevNext` to `getReports()`; diff portal output vs current for parity.
3. Normalize the 7 existing MDX frontmatter (add `order`, confirm `status`, drop `sort_order`).
4. Remove `deliverables` reports from `clients.json` (keep identity / matrix / itinerary). Decide itinerary handling.
5. Add the build-time check; rewrite the "Client Portal & Reports" section in `frontend/CLAUDE.md` to describe the single-source flow; delete the "must also register in json" footgun.

**Blast radius:** ~1 new lib file + 3 call-site swaps + frontmatter touch-up on 7 files + json trim. No DB, fully reversible.

**Open decisions (need product input before executing):**

1. Draft visibility to client — hide, or show with a Draft badge?
2. Non-report deliverables (itinerary; future price-comparison / photo-gallery) — keep as a small explicit list in project config, or model as content too?
3. CMS vault index card (`Archive/reports/*.md`, separate repo) — generate from MDX frontmatter via a sync script, or accept light manual duplication?

*Logged 2026-06-30 — proposal only, not implemented.*
