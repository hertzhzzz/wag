# CLAUDE.md — WAG Website

> Winning Adventure Global 官网项目

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| Email | Nodemailer (Gmail SMTP) |
| Rate Limiting | Upstash Redis (+ in-memory fallback) |
| Media | Remotion (video animation) |
| Charts | ECharts |
| Content | MDX + gray-matter + next-mdx-remote |
| Validation | Zod |

## Commands

```bash
# development
npm run dev          # dev server (localhost:3000)
npm run build       # production build [required before commit]
npm run lint        # ESLint check

# deployment
git push origin master  # GitHub auto-deploys to Vercel
```

## Project Structure

```
wag-frontend/              # project root
├── app/                  # Next.js App Router
│   ├── page.tsx          # homepage (/)
│   ├── layout.tsx        # root layout
│   ├── services/         # services page
│   ├── about/            # about page
│   ├── resources/        # blog list + [slug] dynamic route
│   ├── enquiry/          # enquiry form page + components/
│   ├── api/              # API routes
│   │   ├── enquiry/      # POST /api/enquiry (Zod + Nodemailer)
│   │   └── newsletter/   # POST /api/newsletter
│   ├── components/        # shared components (Navbar, Footer, Hero...)
│   └── data/             # FAQ data files
├── content/blog/         # MDX blog content
│   └── *.mdx             # articles, accessed via /resources/[slug]
├── lib/                  # utilities
│   └── rate-limit.ts     # Upstash Redis rate limiting (+ in-memory fallback)
├── public/               # static assets (deployed to Vercel)
│   └── social/           # blog images [SINGLE SOURCE]
│       ├── blog/          # per-article images
│       │   └── {article-slug}/*.png
│       └── linkedin-post/ # social media assets
│           └── {YYYY-MM-DD-topic}/imgs/*.png
├── social/               # social content assets (4.9M) — NOT deployed
│   └── linkedin-post/    # source files for AI image generation
├── .claude/skills/wag-linkedin-post/  # content hub skill
│   ├── social/            # content: linkedin-post, x-post, facebook-post,
│   │   │                  # cold-email, scripts, prompts, preview HTML
│   ├── SKILL.md           # content hub skill definition
│   └── references/        # master-prompts.md, publish-preview-template.html
└── vercel.json           # Vercel config
```

## Content Hub (wag-linkedin-post)

**Social media content skill** — `.claude/skills/wag-linkedin-post/`

**Content lifecycle:**
1. **Create skeleton** → `python social/generate_content.py --topic "xxx" --type single-post|carousel`
2. **AI fill content** → reference `references/master-prompts.md` for high-quality draft
3. **Generate images** → use AI image prompts from `prompts/*.md`
4. **Preview** → `python social/generate_preview.py --topic "YYYY-MM-DD-topic" --type single-post`
5. **Distribute** → open `publish-preview.html` in browser, copy to platforms
6. **Archive** → after posting, archive to `social/{platform}/archive/`

**Image storage (SINGLE SOURCE):**
- Blog images: stored in `public/social/` — website static assets, deployed to Vercel
- MDX reference format: `/social/blog/{article-slug}/*.png`
- AI image prompts output to `prompts/*.md`, generated images saved to `public/social/.../imgs/`

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/enquiry` | POST | enquiry form (Zod validation + Nodemailer) |
| `/api/newsletter` | POST | newsletter subscription |

## Content (Blog)

- **Location**: `content/blog/*.mdx`
- **Frontmatter**: `title`, `date`, `description`, `author`, `tags`
- **Rendering**: `next-mdx-remote` + `remark-gfm` + `remark-html`
- **Slug routing**: `/resources/[slug]`

## Deployment

| Item | Value |
|------|-------|
| **Production URL** | https://www.winningadventure.com.au |
| **GitHub Repo** | https://github.com/hertzhzzz/wag |
| **Auto-deploy** | Enabled (push to master triggers Vercel) |

Push to GitHub master to deploy:
```bash
git add .
git commit -m "description"
git push origin master
```

Manual deploy (immediate):
```bash
vercel --prod
```

Custom domain `winningadventure.com.au` is configured.

## Conventions

| Rule | Standard |
|------|----------|
| Components | Server by default, `'use client'` when needed |
| Component size | < 200 lines |
| Naming | PascalCase (components), camelCase (utils) |
| Styling | Tailwind utility classes |

## Design System

| Token | Value |
|-------|-------|
| Primary | `#0F2D5E` (Navy) |
| Accent | `#F59E0B` (Amber) |
| Fonts | IBM Plex Sans, IBM Plex Serif |

## Rules

### STRICT (Violations = Immediate Fix Required)
- **禁止 emoji** — Never use emoji anywhere in the codebase
- **禁止中文** — Page content, UI text, buttons, labels MUST be English only
  - Exception: Blog content in `content/blog/*.mdx` may contain Chinese
  - Exception: Comments in code
  - This rule supersedes all other considerations — any Chinese text found on pages must be fixed immediately
- **禁止 "WA" 缩写** — Use "Winning Adventure Global" or "WAG"
- **WAG team structure**: WAG has Australia-based and China-based teams. The founder is NOT Australian. Use "Australia-based" or "based in Australia" — never "Australian-owned" or "Chinese-owned"
- **Ads/post skill**: WAG-poster-prompt skill generates to `ads/post/YYYY-MM-DD/[topic]/` (not `ads/YYYY-MM-DD/`)
- **Video content**: `/Users/mark/Projects/wag/ads/video/` — Remotion/video projects for WAG

### Standard Rules
- Must run before commit: `npm run build` && `npm run lint`
- 5 pages must be accessible: `/`, `/services`, `/about`, `/resources`, `/enquiry`
- **Local build success != production access** — after deploy, verify with `curl -sI <URL>`

## Env

```
.env.local  # environment variables (do not commit to version control)
```

**Required variables**:
- `GMAIL_USER` — Gmail address for SMTP sender
- `GMAIL_APP_PASSWORD` — Gmail App Password (not regular password)
- `UPSTASH_REDIS_REST_URL` — Upstash Redis URL (optional, falls back to in-memory rate limiting)
- `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis token (optional)

## Validation Checklist

```
[ ] npm run build passes
[ ] npm run lint has no errors
[ ] 5 pages accessible: /, /services, /about, /resources, /enquiry
[ ] enquiry form works
```

## Directory Restructuring

- `wag-frontend/` moved to `wag/frontend/` (2026-04-29)
- GitHub/Vercel connection unaffected — `.git/` is inside frontend/
- Parent directory change does not break `git remote -v` or Vercel deployment
- `wag/` is a local-only monorepo container, not git-connected

## Claude Code 自动化

| 类型 | 配置 |
|------|------|
| MCP 服务器 | context7（通过 `.mcp.json` 配置，询问 Next.js/React 文档时自动激活） |
| 技能 | `new-component`（`/new-component`）、`pr-check`（`/pr-check`） |

## Debugging & Gotchas

| Issue | Symptom | Solution |
|-------|---------|----------|
| Tailwind `bg-amber-500` fails | Button renders with transparent background | Use `bg-amber` instead (single-value custom colors don't generate numbered variants) |
| Image 404 in blog posts | Console errors for missing `/social/linkedin-post/...` images | Blog posts must only use images from `public/social/blog/{slug}/` |
| Duplicate section headings on About page | "Your Australian Point of Contact" appeared twice | Check `about/page.tsx` for accidental duplication after copy-paste |
| Playwright MCP connection timeout | Extension fails to attach on first try | Refresh/re-navigate the page to retry |
| Sitemap `changeFrequency` type error | TypeScript error: `string is not assignable to "weekly" \| "monthly" \| ...` | Add `as const` to string literals in sitemap URL arrays (e.g., `'monthly' as const`) |
| vercel.json `has` redirect conflict | `ERR_TOO_MANY_REDIRECTS` on sitemap/xml | The `has: [{ type: "host" }]` conditional redirect conflicts with Vercel auto-HTTPS. Remove the host-based rule if you already have automatic www redirect via Vercel. |
| vercel.json redirect loop | `ERR_TOO_MANY_REDIRECTS` on sitemap.xml or static assets | Use only one redirect rule for non-www → www. Vercel handles HTTPS/www automatically. Duplicate redirect rules cause loops |
| Canonical URL mismatch | Page indexed but Google-selected canonical differs from user-declared | Always match canonical to actual page URL path exactly |
| GSC "Page with redirect" | URL Inspection shows "Page is not indexed: Page with redirect" | This is CORRECT — redirected pages should not be indexed. Verify Google-selected canonical is the target URL |

## SEO Debugging

| Tool | Location | Usage |
|------|----------|-------|
| GSC Query | `~/.claude/skills/seo/scripts/gsc_query.py` | `python gsc_query.py --property sc-domain:winningadventure.com.au --json` |
| GSC Inspect | `~/.claude/skills/seo/scripts/gsc_inspect.py` | `python gsc_inspect.py <url> --json` |
| GSC Config | `~/.config/claude-seo/google-api.json` | Must have absolute path for `service_account_path` |

| curl URL testing | `curl -sI <URL>` shows headers; `curl -s <URL>` follows redirects | Use `-sI` to check HTTP status without following |
| next.config.ts redirects | Also affect routing alongside vercel.json | Check both when debugging redirect issues |

## Image Rules

- **Blog MDX images**: Must be in `public/social/blog/{article-slug}/` — this is the single source for website images
- **LinkedIn/social images**: Source files in `social/linkedin-post/`, generated outputs go to `public/social/linkedin-post/{date-topic}/imgs/`
- **MDX reference format**: `/social/blog/{article-slug}/image.png` (no `/public/` prefix in URLs)
- **AI image prompts**: Output to `prompts/*.md`, generated images saved to appropriate `public/social/` subdirectory

## Design Context

### Users
- Australian businesses worried about being scammed on 1688/Alibaba
- Pain points: quality issues, fraud risk, communication barriers
- Need: factory visits in China with professional offline support
- Decision-makers optimizing or starting their supply chain

### Brand
- **Positioning**: Premium bespoke + authoritative expertise
- **Core message**: Connect safely and efficiently with quality Chinese manufacturers
- **Emotional goals**: Build trust, reduce anxiety, demonstrate professional value
- **3 words**: Reliable, Professional, Exclusive

### Aesthetic
- Bold-modern + refined-elegant + pragmatic-trustworthy
- Navy (#0F2D5E) + Amber (#F59E0B), IBM Plex fonts, light mode

### Design Principles
1. **Professionalism first** — every detail reflects expertise
2. **Trust visualization** — case studies, data endorsements, credentials
3. **Simplified decisions** — clear service descriptions, reduce choice paralysis
4. **Emotional resonance** — acknowledge concerns, provide security
5. **Premium without ostentation** — upgraded texture, not gaudy
6. **Mobile-first** — same experience on all device sizes
7. **Consistent interaction** — clear visual feedback on all interactive elements

---

*Updated: 2026-04-29*

<!-- GSD:profile-start -->
## Developer Profile

> Generated by GSD from session_analysis. Run `/gsd-profile-user --refresh` to update.

| Dimension | Rating | Confidence |
|-----------|--------|------------|
| Communication | conversational | HIGH |
| Decisions | deliberate-informed | MEDIUM |
| Explanations | concise | HIGH |
| Debugging | fix-first | MEDIUM |
| UX Philosophy | pragmatic | MEDIUM |
| Vendor Choices | conservative | HIGH |
| Frustrations | scope-creep | LOW |
| Learning | self-directed | MEDIUM |

**Directives:**
- **Communication:** Use conversational tone with occasional direct commands.
- **Decisions:** Briefly explain trade-offs when presenting options.
- **Explanations:** Keep responses concise. Direct language only.
- **Debugging:** Prioritize solution over diagnosis.
- **UX Philosophy:** Prioritize functional improvements.
- **Vendor Choices:** Suggest adding only when needed. Verify removals.
- **Frustrations:** Do only what's asked. No extra steps.
- **Learning:** Support independent investigation.
<!-- GSD:profile-end -->
