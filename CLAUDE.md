# CLAUDE.md — WAG Website

> Winning Adventure Global 官网项目

## Quick Reference

```bash
npm run dev        # dev server (localhost:3000)
npm run build      # production build [required before commit]
npm run lint       # ESLint check
git push origin master  # deploy to Vercel
```

**Key files:** `app/page.tsx` · `content/blog/*.mdx` · `app/api/enquiry/` · `public/social/`
**5 pages:** `/` · `/services` · `/about` · `/resources` · `/enquiry`

---

## Tech Stack

Next.js 16.2 (App Router) · TypeScript 5 · Tailwind CSS 3.4 · MDX + next-mdx-remote · Zod · Nodemailer (Gmail SMTP) · Upstash Redis (in-memory fallback)

## Project Structure

```
frontend/
├── app/              # pages, API routes, components
├── content/blog/     # MDX articles → /resources/[slug]
├── lib/              # utilities (rate-limit.ts, seo/, etc.)
├── public/social/    # blog images [SINGLE SOURCE]
└── social/           # source files for AI image generation (NOT deployed)
```

## Commands

```bash
vercel --prod        # pre-deploy verification (local build check)
git push origin master  # deploy after local verification passes
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

### Company Information
- **Legal Entity**: WINNING ADVENTURE GLOBAL PTY LTD (ACN 697 886 150, ABN 94 697 886 150, TFN 236 473 171)
- **Registered**: South Australia under Corporations Act 2001 since 8 May 2026
- **Address**: 5/54 Melbourne St, North Adelaide SA 5006
- All legal pages, schemas, and API from-fields reflect PTY LTD entity

### STRICT
- No emoji anywhere in codebase
- No Chinese in page content / UI (exception: blog MDX content)
- No "WA" / "WAG" abbreviation — use "Winning Adventure Global"
- WAG founder is NOT Australian — use "Australia-based", never "Australian-owned"
- WAG-poster-prompt outputs to `ads/post/YYYY-MM-DD/[topic]/` (not `ads/YYYY-MM-DD/`)
- Remotion projects: `/Users/mark/Projects/wag/ads/video/` · React 19 incompatible with `@react-three/fiber` — use `react@18.3.1`

### Must Pass Before Commit
- `npm run build` && `npm run lint`
- 5 pages accessible: `/` · `/services` · `/about` · `/resources` · `/enquiry`

## Validation Checklist

```
[ ] npm run build passes
[ ] npm run lint has no errors
[ ] 5 pages return HTTP 200
[ ] enquiry form submits successfully
```

## SEO Debugging

```bash
python ~/.claude/skills/seo/scripts/gsc_query.py --property sc-domain:winningadventure.com.au --json  # GSC data
python ~/.claude/skills/seo/scripts/gsc_inspect.py <url> --json  # URL Inspection
curl -sI <URL>  # HTTP status check
```

**Thin content fix:** If GSC shows "discovered but not indexed" → expand to 1500+ words, add FAQPage schema, add author/date stamps.

## Image Rules

Blog images: `public/social/blog/{slug}/` — only source. MDX: `/social/blog/{slug}/image.png`

**Known states:** ServiceSchema already referenced at `/services` line 42 — do not re-add
**Lint principle:** Pre-existing errors in agents/ and lib/ are historical tech debt — do not fix unless in scope
**GSC tools:** `python ~/.claude/skills/seo/scripts/gsc_inspect.py <url> --json` and `gsc_query.py`

## Env

`.env.local` — `GMAIL_USER` · `GMAIL_APP_PASSWORD` · `UPSTASH_REDIS_REST_URL` · `UPSTASH_REDIS_REST_TOKEN`
Gmail rotation: SMTP fail → new App Password → verify locally → update Vercel env → redeploy.

---

*Updated: 2026-05-13*
