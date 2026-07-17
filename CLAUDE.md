# CLAUDE.md — WAG Website

> Winning Adventure Global 官网项目

## Commands

```bash
npm run dev        # dev server (localhost:3000)
npm run build      # production build [required before commit]
npm run lint       # ESLint check
vercel build --prod  # local Vercel build validation; does not deploy
git push origin master  # update GitHub only; Vercel Git deployments are disabled
vercel --prod       # manual production deployment; requires separate explicit approval
```

## Quick Reference

**Key files:** `app/page.tsx` · `content/*.mdx` · `app/api/enquiry/` · `public/social/`
**Pages:** `/` · `/services` · `/about` · `/article` · `/enquiry` · `/visiting-chinese-factories` · `/china-sourcing-guide-australia`

---

## Tech Stack

Next.js 16.2 (App Router) · TypeScript 5 · Tailwind CSS 3.4 · MDX + next-mdx-remote · Zod · Nodemailer (Gmail SMTP) · Upstash Redis (in-memory fallback)

## Project Structure

```
frontend/
├── app/              # pages, API routes, components
├── content/          # MDX articles → /article/[slug] + reports → /client/[slug]/[project]/reports/[id]
├── data/             # client configs (clients/{slug}.json), factory data
├── lib/              # utilities (rate-limit.ts, clients.ts, seo/, etc.)
├── public/social/    # blog images [SINGLE SOURCE]
├── public/reports/   # client report images (per-client subdirectory)
└── social/           # source files for AI image generation (NOT deployed)
```

## Content (MDX)

**Frontmatter:** `title` · `date` · `description` · `author: "Andy Liu"` · `updatedDate` · `tags`
**FAQ pattern:** `### Question` headings (NOT `## FAQ`) — aim for 10 FAQs per article
**Images:** Use direct Unsplash URLs. Alternate `align="right"` / `align="left"`. No downloaded images.

## Deployment

1. Run `npm run build` and, when Vercel-specific validation is needed, `vercel build --prod`.
2. Stage only the intended paths and commit them. Never use `git add .` in this worktree.
3. Obtain separate, explicit production release approval.
4. Only after approval, push the reviewed commit, run `vercel --prod`, and verify with `curl -sI https://www.winningadventure.com.au`.

`git push origin master` does not deploy while `vercel.json` sets `git.deploymentEnabled=false`. `vercel --prod` is a production deployment command; never use it as a local validation step.

**No drains configured** — production errors won't be forwarded. Set up Vercel drains or Sentry.

## Rules

Root STRICT rules in `../CLAUDE.md § Rules` — summary of project-specific additions:

- Legal Entity: WINNING ADVENTURE GLOBAL PTY LTD (ACN 697 886 150, ABN 94 697 886 150, TFN 236 473 171) — registered South Australia since 8 May 2026
- Address: 5/54 Melbourne St, North Adelaide SA 5006 (always use slash format)
- All legal pages, schemas, and API from-fields reflect PTY LTD entity
- "Winning Adventure Global Pty Ltd" = legal entity; "Winning Adventure Global" = brand name

### Company Info Location

All ABN/ACN/TFN/address data is scattered across ~9 files in `app/`. Before changing company
registration info: grep all old values first. Key files: layout.tsx, privacy/page.tsx,
terms/page.tsx, about/page.tsx, services/page.tsx, components/Footer.tsx,
components/PersonSchema.tsx, api/*/route.ts. ACN/TFN only in privacy/terms footnotes.

## Validation Checklist

```
[ ] npm run build passes
[ ] npm run lint has no errors
[ ] 5 pages return HTTP 200
[ ] enquiry form submits successfully
```

## Known Gotchas

- `app/services/page.tsx` — 3-tier comparison page: One-Time Procurement / Factory Tour + Supply Chain / Remote Verification + Supply Chain, with feature comparison table
- `app/solutions/page.tsx` — 301 `permanentRedirect` to `/services` (legacy URL preservation)
- Services hero: CSS gradient-only (no background image currently)
- ScrollReveal CSS: `.svc-case-study[data-animate]` → `[data-animate] .svc-case-study` — descendant selectors required because `data-animate` lives on ScrollReveal wrapper, not card elements
- Address format: always use `5/54 Melbourne St` (slash, not comma)

## Images

### Performance (LCP)

Blog article hero cover images must use `next/image` with `priority` prop — never CSS background-image.

```tsx
<Image src={fm.coverImage} alt="" fill priority className="object-cover z-0" sizes="100vw" />
```

For FloatImage (MDX content images):
```tsx
<Image src={src} alt={alt} width={width} height={Math.round(width * 0.75)} />
```

`next/image` enables WebP/AVIF auto-conversion, lazy loading, and `priority` gives fetchpriority="high" — reducing LCP from ~7s to ~2-3s.

### File Locations

Blog images: `public/social/blog/{slug}/` — only source. MDX: `/social/blog/{slug}/image.png`
Cover images (from content pipeline): `public/social/blog/{slug}/cover.png` — 16:9, generated via `baoyu-imagine` batch

**Content Pipeline**: See `ARCHITECTURE.md`. Generates MDX articles + cover images to `frontend/content/blog/`. Social posts to `content-engine/social/`.

## Structured Data (Schema)

Current schemas in `app/components/`:
- `ArticleSchema.tsx` — BlogPosting + Article dual-type for blog MDX pages
- `CaseStudySchema.tsx` — Dedicated case study pages (`/case-studies/[slug]`)
- `BreadcrumbSchema.tsx` — Navigation path
- `FAQSchema.tsx` — Deprecated (returns null); FAQ content kept as static HTML for crawlability

FAQPage schema NOT needed: Google deprecated FAQ rich results May 2026; eligibility restricted to government/health sites only.

## SEO Redirects & Gone Paths

`proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) + `lib/gone-paths.ts` are the SINGLE registry for retired/moved blog content — covers both `/article/{slug}` and the legacy `/resources/{slug}` path:

- `BLOG_GONE_SLUGS` — permanently removed content → 410 (checked first)
- `BLOG_REDIRECT_TARGETS` — moved/consolidated content → 301 to the new location

**Don't add blog-slug rules to `redirects.js`** (next.config.js `redirects()`). It only ever matches `/article/{slug}`, never `/resources/{slug}`, and next.config-level redirects execute *before* `proxy.ts` — so a rule there can silently shadow a `BLOG_GONE_SLUGS` 410, and `/resources/{slug}` ends up double-redirecting (301 → `/article/{slug}` → 301 again) instead of resolving in one hop. All blog-slug routing goes in `gone-paths.ts` (root-caused and fixed 2026-07-05; the double-hop + shadowed-410 had been sitting live for 2+ weeks, showing up in GSC as stale "duplicate canonical" reports on 29 URLs).

## SEO Debugging

```bash
# curl is NOT installed in this environment — use node fetch for HTTP status/redirect checks:
node -e "fetch('URL_HERE', {redirect:'manual'}).then(r => console.log(r.status, r.headers.get('location')))"

# URL Inspection (Google's real-time view of a URL) — the old gsc_query.py/gsc_inspect.py scripts
# under ~/.claude/skills/seo/ no longer exist; call the Search Console API directly instead:
python3 -c "
import google.oauth2.service_account, json, os, urllib.request
from google.auth.transport.requests import Request
creds = google.oauth2.service_account.Credentials.from_service_account_file(
    os.path.expanduser('~/.claude/gsc-service-account.json'),
    scopes=['https://www.googleapis.com/auth/webmasters.readonly'])
creds.refresh(Request())
data = json.dumps({'inspectionUrl': 'URL_HERE', 'siteUrl': 'sc-domain:winningadventure.com.au'}).encode()
req = urllib.request.Request('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
    data=data, headers={'Authorization': f'Bearer {creds.token}', 'Content-Type': 'application/json'})
print(json.loads(urllib.request.urlopen(req).read())['inspectionResult']['indexStatusResult'])
"
```

**GSC report lag:** Page Indexing statuses (incl. "Duplicate, Google chose different canonical than user") reflect Google's *last crawl*, not current site behavior — can run weeks stale. Check the `lastCrawlTime` from the URL Inspection call above before assuming a live bug; see root `CLAUDE.md` § Diagnostics for the general pattern (also covers "Crawled - currently not indexed").

**Thin content fix:** If GSC shows "discovered but not indexed" → expand to 1500+ words, add ArticleSchema, add author/date stamps.

## IndexNow

IndexNow is fully implemented for Bing/Naver/Yandex indexing.

**Key file:** `public/qXFgF78NEr0TmLkL6E2zK2gqmc088qwK.txt`
- Accessible at `https://www.winningadventure.com.au/qXFgF78NEr0TmLkL6E2zK2gqmc088qwK.txt`
- Bing verifies this file to accept URL submissions

**API endpoint:** `POST /api/indexnow`
```bash
curl -X POST https://www.winningadventure.com.au/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.winningadventure.com.au/article/new-article"}'
```

**Auto-submission:** Not wired. Each new article needs manual POST, or wire into the content pipeline as a post-deploy hook.

## Env

`.env.local` — `GMAIL_USER` · `GMAIL_APP_PASSWORD` · `UPSTASH_REDIS_REST_URL` · `UPSTASH_REDIS_REST_TOKEN`
Gmail rotation: SMTP fail → new App Password → verify locally → update Vercel env → redeploy.

**Known states:** ServiceSchema already referenced at `/services` — do not re-add
**Lint principle:** Pre-existing errors in agents/ and lib/ are historical tech debt — do not fix unless in scope

## Client Portal & Reports

**Routes:** `/client/[slug]` → auth gate · `/client/[slug]/[project]` → dashboard · `/client/[slug]/[project]/reports/[id]` → report
**Config:** `data/clients/{slug}.json` — client name, access_code_hash, projects, deliverables, product_matrix, itinerary
**Auth:** Access code hashed with bcrypt, stored in `CLIENT_SECRETS_B64` env var (base64-encoded JSON to avoid `$` mangling by Next.js dotenv-expand)

### Report MDX Pipeline

1. MDX source: `content/reports/{client-slug}/{report-id}.mdx`
2. `readReport()` → `gray-matter` frontmatter + `processFootnotes()` preprocessor
3. `processFootnotes()`: regex converts `[^N]` → `<a data-footnote-ref>` + auto-generates `.terms-glossary` div at end
4. `MDXRemote` with `remarkGfm` renders processed content
5. `FootnoteEnhancer` (client component): event delegation on `a[data-footnote-ref]`, reads popover from `dt#fn-N + dd` sibling

**Critical:** Do NOT add `## Terms Glossary` heading in MDX — it's auto-generated. Use `## Appendix: Terms Glossary` before footnote definitions.

### Report Images

- Images served via API route: `/api/client/reports/images/{slug}/{path}` → reads from `content/reports/{slug}/` at runtime
- `public/reports/` is a SECONDARY copy — both `content/` and `public/` must be synced after image modifications
- API route `Cache-Control: no-cache` — do NOT set `max-age`; browsers would cache stale images across redeploys
- `resolveReportImagePath()` in `imagePath.ts` (non-client pure utility, NOT `use client`)
- `ReportImage.tsx`: client component with `onError` fallback
- `ProductShowcase` + `ProductCard`: client components with React Context lightbox
- Product gallery images: `content/reports/{slug}/images/supplier-catalog/{factory}/` — NEVER use `1688-products` in paths
- Product images from cbu01.alicdn.com need top 13.83% cropped to remove platform banner: `img.crop((0, int(h*0.1383), w, h))`

### Report Content Blacklist

NEVER include in any report: 1688/Alibaba references, FCA report IDs (CANWT/TP/SZXWT/CNIR/SZA), supplier operational metrics (pass rate/fulfillment), company structure/subsidiaries/branches, contact info (phone/email/website), financial data (revenue/brand value/IPO) — **and never reference financials at all, including disclaimers about excluding them** (no "financials are publicly available", "this report excludes financial figures", "financial review on request"); omit silently, Chinese text in body or product titles.

### Report Content Conventions

- Report titles: `Supplier Due Diligence & Capability Assessment` (NOT White Paper, NOT third-party verification)
- Source categories: Public corporate registry records, Commercial business intelligence records, Supplier-disclosed materials, Public certification references
- Structure: Exec Summary → Registration → Certifications → Capability → Portfolio → Risk → Supplier Engagement → Report Basis & Limitations → Appendix: Terms Glossary
- Disclaimer: "prepared by Winning Adventure Global as a supplier due diligence and capability assessment for client review"

## Browser Verification

```bash
# Screenshot + DOM check
browser-harness <<'PY'
new_tab("http://localhost:3000/client/aaron-sansoni/tv-studio-build/reports/itc-baolun")
wait_for_load()
capture_screenshot("/tmp/report.png")
print(js('document.querySelector(".terms-glossary") !== null'))
PY

# Vision cross-check (each image independent, no context pollution)
codex exec -i /tmp/report.png --skip-git-repo-check -s read-only <<< "prompt"
```

### CSS Gotchas

- `overflow-x: clip` on html/body (NOT hidden) — enables `position: sticky` TOC
- `body { padding-top: 72px }` compensated by client layout `-mt-[72px] pt-4`
- `.toc-scroll` — webkit scrollbar styles with `scrollbarGutter: "stable"` for forced visibility

## Pending Refactor

> Proposals captured here are **NOT YET IMPLEMENTED**. Do not execute without explicit go-ahead.

- **PR-1 · Reports single source of truth** — `clients.json` deliverables + MDX frontmatter are hand-synced in 2-3 places; forgetting the json entry causes silent "file exists, portal doesn't show it" failures (Golden Sea, 2026-06-30). Full proposal: `docs/plans/2026-06-30-reports-single-source-of-truth.md`.

---

*Updated: 2026-07-05*
