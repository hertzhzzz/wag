# Ponytail Audit Report

Date: 2026-06-25

Scope: this audit covers over-engineering, removable complexity, unused assets, unused code, and unused dependencies only. It does not cover security, correctness, SEO quality, or performance issues.

No files were deleted or edited as part of the audit.

## Summary

The main issue in this repository is not the live product code. The largest removable weight comes from historical artifacts, generated media, experimental components, SEO automation scripts, duplicated report assets, and unused package dependencies.

Estimated possible reduction:

- 7,500+ lines of source/config
- 17 direct dependencies
- 850MB+ local/media weight

## Highest-Value Cleanup

| Priority | Tag | What to Cut | Replacement | Path | Estimated Gain |
| --- | --- | --- | --- | --- | --- |
| P0 | delete | Agent worktrees, browser data, and build caches | Recreate worktrees when needed | `.claude/worktrees/*` | ~330MB |
| P0 | delete | Report images duplicated under `content` and `public` | Keep `public/reports` for served images | `content/reports/aaron-sansoni/images` | ~349MB |
| P0 | delete | Social cover directories with no matching blog MDX | Generate covers only after the article exists | `public/social/blog` | ~160MB |
| P1 | delete | Unused H.264 hero video copy | Use `/hero_vid_compressed.mp4` | `public/hero_vid_h264.mp4` | ~15MB |
| P1 | delete | Generated infographic workspaces | Keep shipped public images | `infographic` | ~6MB |
| P1 | delete | Cover-generation prompts | Regenerate prompts when making new covers | `prompts` | ~1.2MB |

## Unused Code

| Tag | What to Cut | Replacement | Path |
| --- | --- | --- | --- |
| delete | SEO automation scripts not wired into the app scripts | Use external tools or one-off scripts when needed | `scripts/*` |
| delete | SEO research lib cluster | Nothing | `lib/exa.ts`, `lib/google-trends.ts`, `lib/keyword-planner.ts`, `lib/retry.ts`, `lib/notify.ts` |
| delete | Old homepage/experiment components with no imports | Nothing | `app/components/AIChatBox.tsx`, `Coverage.tsx`, `HeroBackground.tsx`, `StatsBar.tsx`, `FoundingClients.tsx`, `AnnouncementBar.tsx`, `CalendlyEmbed.tsx` |
| delete | DirectorySection map island and tests, currently not connected | Rebuild only when the map directory is needed | `app/components/DirectorySection/*` |
| delete | Unused article-page components | Nothing | `app/(public)/article/[slug]/AuthorBio.tsx`, `RecommendedSidebar.tsx`, `RelatedFactoryLink.tsx`, `TableOfContents.tsx` |
| delete | Old file access logger | Current callers use `access-log-kv` | `lib/access-log.ts` |
| delete | Unused scroll reveal hooks | Existing `ScrollReveal` component | `hooks/useScrollReveal.ts` |
| delete | Unused article loader | Current pages read articles directly | `app/lib/getArticles.ts` |
| delete | Empty or unused schema components | Nothing | `app/components/FAQSchema.tsx`, `OrganizationSchema.tsx` |

## Dependency Audit

Unused direct dependencies to consider removing:

- `@remotion/animation-utils`
- `@remotion/player`
- `remotion`
- `@remotion/cli`
- `baoyu-design`
- `csv-parse`
- `diff-match-patch`
- `@types/diff-match-patch`
- `echarts`
- `echarts-for-react`
- `isomorphic-dompurify`
- `remark-html`
- `resend`
- `tsx`
- `@types/bcryptjs`

Keep for now:

- `nodemailer`: still dynamically imported by `app/api/contact`, `app/api/newsletter`, and `app/api/enquiry`.
- `@builder.io/partytown`: still referenced by layout/config.
- `@playwright/test`: still referenced by existing test files. Re-evaluate after deleting unused map tests.

## Config Simplification

| Tag | What to Cut | Replacement | Path |
| --- | --- | --- | --- |
| yagni | Bundle analyzer wrapper without a package script | Add only during bundle investigations | `next.config.js` |
| shrink | Duplicated dev/prod CSP/header branches | Extract shared headers and keep only the environment difference | `next.config.js` |
| native | Default Vercel build settings | Keep only the host redirect | `vercel.json` |
| shrink | Dead Tailwind `./components/**/*` content glob | Keep `./app/**/*` | `tailwind.config.ts` |
| shrink | Duplicate keyboard-aware input/textarea wrappers | Native fields plus inline focus handler | `app/(public)/enquiry/components/*` |

## Miscellaneous Cleanup

| Tag | What to Cut | Path |
| --- | --- | --- |
| delete | Stale GSC/GA4/SEO snapshots | `data/gsc-queries.json`, `data/gsc-pages.json`, `data/ga4-pages.json`, `data/seo-baseline.db` |
| delete | FUSE leftover files | `content/blog/.fuse_hidden*` |
| delete | Partytown debug bundle; production only needs non-debug assets | `public/~partytown/debug` |
| delete | Python bytecode, local DB files, macOS leftovers | `scripts/__pycache__`, `data/pipeline.db*`, `.DS_Store` |

## Suggested Execution Order

1. Remove pure local/generated artifacts first: `.claude/worktrees`, `.DS_Store`, `__pycache__`, FUSE leftovers.
2. Remove large duplicated media next: `content/reports/.../images` and unmatched `public/social/blog` directories.
3. Remove unused components and libs, then run `npm run build`.
4. Remove package dependencies, reinstall, and verify the lockfile and build.

## Net

Possible reduction: about 7,500+ source/config lines, 17 direct dependencies, and 850MB+ of local/media weight.
