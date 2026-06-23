---
title: "Legacy Content Governance — Bulk Cleanup with SEO-Preserving Routing"
module: frontend
date: 2026-06-22
problem_type: convention
component: development_workflow
severity: medium
tags: [content-governance, legacy-cleanup, seo-routing, 410-gone, 301-redirect, nextjs-middleware, sitemap, redirects-dead-links, claude-md-conventions, content-quality]
---

# Legacy Content Governance — Bulk Cleanup with SEO-Preserving Routing

## Context

A Next.js content site accumulated 136 articles, of which 100 were marked `pending-delete`, 34 were `ai-generated-unreviewed`, and only 1 cited the site's core data asset (Factory Wiki). Most had zero GSC clicks and zero GA4 sessions, but their URLs remained indexed by Google, diluting topical authority. The user, a non-technical product/business stakeholder, wanted the site cleaned up.

The core challenge: deleting 71 MDX files is the easy part. The real work is pre-serving SEO equity through correct HTTP status codes, fixing existing redirect chains whose targets were themselves being deleted, and keeping the sitemap consistent — all while running preview-first deployment so nothing breaks in production.

## Guidance

### 1. Content cleanup is a routing-layer engineering task, not a file operation

Deleting MDX files from `content/blog/` is step one. The durable work lives in the routing layer:

- **Remove gone URLs return 410 Gone**, not 404. Google distinguishes "this page once existed and I intentionally removed it" (410) from "this URL never existed" (404). The former accelerates de-indexing; the latter causes repeated crawl retries.
- **Use an explicit slug list, not a catch-all pattern.** Every deleted slug must appear in `lib/gone-paths.ts`. This is the single source of truth for auditing, sitemap exclusion, and middleware routing.
- **Fix redirect dead-ends before deployment.** Existing redirects like `/resources/xxx → /article/xxx` may point to pages that are themselves being removed. Retarget those destinations to surviving evergreen pages or let the source URL return 410 directly.

### 2. Never redirect low-quality or off-topic pages to the homepage

A `/resources/liverpool-vs-brentford` URL should not 301 to `/`. That is a soft-404 signal to Google. If no closely matched procurement page exists, return 410. If a reasonable match exists (e.g., a sports-merchandise article → `china-sourcing-risks`), redirect there.

### 3. Isolate destructive work in a git worktree

For bulk deletions (71 files), create a git worktree on a feature branch:

```bash
git worktree add .worktrees/cleanup -b cleanup-branch
cd .worktrees/cleanup
# perform all deletions and code changes
npm run build  # verify in isolation
```

Then merge back. If anything goes wrong, `git worktree remove` discards everything cleanly. The main working tree stays untouched.

### 4. Multi-layer verification chain

| Layer | What to check | How |
|-------|--------------|-----|
| Build | `npm run build` exits 0 | Next.js build |
| Route | gone URLs return 410, live pages return 200 | HTTP client + batch script |
| Redirect | `/resources/{live}` 301 → `/article/{live}` | HTTP client |
| Sitemap | `sitemap.xml` contains no gone slugs | grep |
| Runtime | production has no 5xx errors | Vercel runtime logs |

### 5. Preview-first deployment for URL-changing deploys

For any deploy that changes which URLs exist or return which status codes:

1. Push to a feature branch → Vercel auto-creates preview deployment
2. Run the full HTTP verification suite on the preview URL
3. Only then merge to master → production deploy
4. Smoke-test again on `www.winningadventure.com.au`

This adds ~5 minutes but catches 410/301 configuration errors before they hit production.

### 6. Non-technical user interaction contract

When the user is a product/business stakeholder who does not write code or use terminals:

- **Requirements phase**: use Socratic questioning to translate "the site feels messy" into executable cleanup criteria
- **Execution phase**: communicate in outcomes and impact, not technical implementation ("these articles get zero Google traffic" not "GSC shows zero clicks")
- **Decision phase**: every destructive action follows "preview → confirm → execute" — never skip confirmation
- **Results phase**: report before/after numbers (136 → 65 articles, 71 gone URLs returning 410) rather than code diffs

Codify this in `~/.claude/CLAUDE.md` and the project `CLAUDE.md` so it applies across sessions and tools.

## Why This Matters

1. **Topical authority is the foundation of ranking.** Google evaluates sites as topical entities. 136 articles spanning sports scores, political events, weather emergencies, and brand news tell Google "this site is about everything," not "this is an authority on China procurement." Removing 71 off-topic articles concentrates the remaining 65 around a clear subject.

2. **410 vs 404 affects de-indexing speed.** Google's de-indexing cycle for 410 is significantly shorter than for 404. If 71 URLs all returned 404, Google would keep retrying for months. 410 signals intentional removal; de-indexing typically completes within weeks.

3. **Broken redirect chains are a silent SEO injury.** A chain like `/resources/xxx` → 301 → `/article/xxx` → 410 means both Googlebot and users see a dead end. Fixing redirect destinations before deploying gone rules prevents this.

4. **The interaction contract prevents recurrence.** Without codifying "user is non-technical, translate product language into technical tasks," the same pattern recurs: vague requests lead to misunderstood implementations, which produce more low-quality content that needs cleaning later.

## When to Apply

- GSC Coverage report shows many pages with zero clicks or `Crawled - currently not indexed`
- Article count exceeds core topic coverage by 3x or more
- Content audit reveals AI-generated, low-quality, or off-topic articles
- GA4 shows many pages with zero sessions across unrelated topics
- Site is being perceived as a broad content farm rather than a topical authority

**Do NOT apply for:**
- Normal content updates or rewrites (preserve the URL, no gone routing)
- Deleting fewer than ~5 articles (manual handling is fine)
- News or media sites where time-sensitive content expiry is normal behavior

## Examples

### Explicit gone-paths configuration

```typescript
// lib/gone-paths.ts
export const BLOG_GONE_SLUGS = [
  "liverpool-vs-brentford",
  "matildas-merchandise",
  "trump-tariffs-australia-china-sourcing-impact",
  // ... 71 total
]

const BLOG_GONE_SET = new Set(BLOG_GONE_SLUGS)

export function isBlogGoneSlug(slug: string): boolean {
  return BLOG_GONE_SET.has(slug)
}
```

### Middleware: per-slug routing decisions

```typescript
// middleware.ts
const articleSlug = getArticleSlug(pathname)
if (articleSlug && isBlogGoneSlug(articleSlug)) {
  return new NextResponse("Gone", { status: 410 })
}

const resourceSlug = getResourceSlug(pathname)
if (resourceSlug) {
  if (isBlogGoneSlug(resourceSlug)) {
    return new NextResponse("Gone", { status: 410 })
  }
  const target = getBlogRedirectTarget(resourceSlug) || `/article/${resourceSlug}`
  return NextResponse.redirect(new URL(target, request.url), 301)
}
```

### Fixing redirect dead-ends

```diff
# redirects.js — retarget destinations that were themselves deleted
- /resources/albanese-tax-changes-sourcing → /article/albanese-family-trust-tax-2026  # deleted → 410
+ /resources/albanese-tax-changes-sourcing → /article/how-to-import-from-china         # live → 200
```

### Verification script (run on preview URL)

```bash
# Verify gone URLs return 410
python3 -c "
import urllib.request, urllib.error
for slug in ['liverpool-vs-brentford', 'trump-tariffs-australia-china-sourcing-impact']:
    try:
        urllib.request.urlopen(f'https://preview-url/article/{slug}')
    except urllib.error.HTTPError as e:
        assert e.code == 410, f'{slug} returned {e.code}, expected 410'
"
```

## Related

- `wag/CLAUDE.md` — project rules including non-technical user interaction contract
- `~/.claude/CLAUDE.md` — global Claude configuration with the same contract
- `frontend/lib/gone-paths.ts` — canonical gone slug list
- `frontend/middleware.ts` — SEO routing decisions
- `frontend/redirects.js` — legacy redirect map
- WAG_content skill — content pipeline with human review gates
