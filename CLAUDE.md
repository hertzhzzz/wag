# CLAUDE.md — WAG Website

> Winning Adventure Global 官网项目

## Commands

```bash
npm run dev        # dev server (localhost:3000)
npm run build      # production build [required before commit]
npm run lint       # ESLint check
vercel --prod      # local build verification [required before commit]
git push origin master  # deploy to Vercel
```

## Quick Reference

**Key files:** `app/page.tsx` · `content/*.mdx` · `app/api/enquiry/` · `public/social/`
**Pages:** `/` · `/solutions` · `/about` · `/resources` · `/enquiry` · `/visiting-chinese-factories` · `/china-sourcing-guide-australia`

---

## Tech Stack

Next.js 16.2 (App Router) · TypeScript 5 · Tailwind CSS 3.4 · MDX + next-mdx-remote · Zod · Nodemailer (Gmail SMTP) · Upstash Redis (in-memory fallback)

## Project Structure

```
frontend/
├── app/              # pages, API routes, components
├── content/          # MDX articles → /resources/[slug]
├── lib/              # utilities (rate-limit.ts, seo/, etc.)
├── public/social/    # blog images [SINGLE SOURCE]
└── social/           # source files for AI image generation (NOT deployed)
```

## Content (MDX)

**Frontmatter:** `title` · `date` · `description` · `author: "Mark He"` · `updatedDate` · `tags`
**FAQ pattern:** `### Question` headings (NOT `## FAQ`) — aim for 10 FAQs per article
**Images:** Use direct Unsplash URLs. Alternate `align="right"` / `align="left"`. No downloaded images.

## Deployment

1. `vercel --prod` (local build check)
2. `git add . && git commit && git push origin master`
3. Verify: `curl -sI https://www.winningadventure.com.au`

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

- `app/services/page.tsx` — 301 `permanentRedirect` to `/solutions` (was placeholder ABN `12 345 678 901`)
- `app/solutions/page.tsx` — 9-section hub page with anchor nav: #factory-tours, #procurement, #verification, #case-studies, #how-it-works, #industries, #faq, #cta
- Hero background: `public/solutions/hero-bg.webp` (122KB WebP, 1920x1080, Google Imagen)
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

**Content Pipeline**: See `wag-content-pipeline` skill. Generates MDX articles + cover images + social posts to `ads/post/{YYYY-MM-DD}/{slug}/`.

## Structured Data (Schema)

Current schemas in `app/components/`:
- `ArticleSchema.tsx` — BlogPosting + Article dual-type for blog MDX pages
- `CaseStudySchema.tsx` — Dedicated case study pages (`/case-studies/[slug]`)
- `BreadcrumbSchema.tsx` — Navigation path
- `FAQSchema.tsx` — Deprecated (returns null); FAQ content kept as static HTML for crawlability

FAQPage schema NOT needed: Google deprecated FAQ rich results May 2026; eligibility restricted to government/health sites only.

## SEO Debugging

```bash
python ~/.claude/skills/seo/scripts/gsc_query.py --property sc-domain:winningadventure.com.au --json  # GSC data
python ~/.claude/skills/seo/scripts/gsc_inspect.py <url> --json  # URL Inspection
curl -sI <URL>  # HTTP status check
```

**Thin content fix:** If GSC shows "discovered but not indexed" → expand to 1500+ words, add ArticleSchema, add author/date stamps.

## Env

`.env.local` — `GMAIL_USER` · `GMAIL_APP_PASSWORD` · `UPSTASH_REDIS_REST_URL` · `UPSTASH_REDIS_REST_TOKEN`
Gmail rotation: SMTP fail → new App Password → verify locally → update Vercel env → redeploy.

**Known states:** ServiceSchema already referenced at `/solutions` — do not re-add
**Lint principle:** Pre-existing errors in agents/ and lib/ are historical tech debt — do not fix unless in scope

---

*Updated: 2026-06-01*
