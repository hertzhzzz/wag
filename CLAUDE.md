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
npm run build        # production build [required before commit]
npm run lint         # ESLint check

# pre-deploy verification (run locally before git push)
vercel --prod        # verify with Vercel CLI first

# deployment (after local verification passes)
git push origin master  # GitHub Actions security scan → Vercel auto-deploy
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
| **Auto-deploy** | Push to master triggers GitHub Actions → Vercel |

**Required workflow — must pass in this order before production:**

1. **Local build check**: `vercel --prod` (Vercel CLI runs full build, catches TypeScript/module errors)
2. **GitHub security scan**: `.github/workflows/security.yml` (npm audit + build on Node.js 24)
3. **Vercel deploy**: automatic after GitHub Actions passes

```bash
# Step 1: run locally first
vercel --prod

# Step 2: only push after step 1 succeeds
git add .
git commit -m "description"
git push origin master
```

Manual deploy (bypasses GitHub scan — use only for hotfixes):
```bash
vercel --prod --yes
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

## Google Trends Scraping

Uses browser-harness CDP (Chrome DevTools Protocol) via skill at `~/.claude/skills/browser-harness/SKILL.md`.
No API key required — connects to user's logged-in Chrome via `BU_NAME=default`.
Binary: `/Users/mark/Projects/browser-harness/.venv/bin/browser-harness`

Direct URL: `https://trends.google.com/trends/explore?q={keyword}&geo=AU`
Input aria-label is "Search term" (not "Add a search term").
Available helpers: `goto_url`, `wait_for_load`, `wait`, `js`, `type_text`, `press_key`, `page_info`, `list_tabs`, `switch_tab`. Use `js("element.click()")` instead of `click()`.

**Testing lib modules directly** (no build needed):
```bash
node --input-type=module -e "import { fn } from './lib/xxx.ts'; ..."
```
For browser-harness Python scripts, use heredoc to avoid shell-escaping issues:
```bash
python3 - << 'PYEOF'
# script here
PYEOF
```

## lib/ SEO Modules

| File | Purpose |
|------|---------|
| `lib/google-trends.ts` | Google Trends scraping (browser-harness CDP) |
| `lib/exa.ts` | Exa Search API research |
| `lib/keyword-planner.ts` | Keyword planning + Google Ads data |
| `lib/scholar.ts` | Semantic Scholar academic papers |
| `lib/originality.ts` | Plagiarism/originality detection |
| `lib/ai-detector.ts` | AI content detection |
| `lib/notify.ts` | Slack/Email notifications |

`★ Insight ─────────────────────────────────────`
Direct `node --input-type=module` testing skips the full build — useful for rapid debugging of lib modules without triggering Vercel or webpack.
`─────────────────────────────────────────────────`

## Claude Code 自动化

| 类型 | 配置 |
|------|------|
| MCP 服务器 | context7（通过 `.mcp.json` 配置，询问 Next.js/React 文档时自动激活） |
| 技能 | `new-component`（`/new-component`）、`pr-check`（`/pr-check`）、`wag-start-team`（`/wag-start-team`） |

## Subagent 工作流规范

**核心原则：永远使用 subagents 执行批量任务，不占用当前 context。**

当任务符合以下条件时，必须使用 subagent：
- 需要对 5+ 个文件执行相同的编辑操作（如批量更新 frontmatter、扩展 FAQ）
- 需要在任务执行期间持续监控构建状态
- 耗时的研究任务（如关键词扩展、内容验证）
- 任何会污染当前 context 的重复性工作

**Subagent 类型选择：**
| 任务类型 | subagent_type |
|---------|--------------|
| 批量文件编辑（已知文件列表） | `general-purpose` |
| 并行研究/搜索（多角度探索） | `Explore` |
| 持续监控（构建、部署） | `general-purpose`（后台运行） |
| 复杂多步骤协调 | `general-purpose`（带 team） |

**标准工作流（以博客 FAQ 扩展为例）：**
```typescript
// 1. 主 session：启动后台 agent 处理批量任务
Agent({
  description: "Expand blog MDX FAQs",
  prompt: "对 17 个 MDX 文件执行 FAQ 扩展...",
  run_in_background: true,
  subagent_type: "general-purpose"
})

// 2. 同时启动 build 监控 agent
Agent({
  description: "Build monitor",
  prompt: "每 30 秒运行 npm run build，报告错误...",
  run_in_background: true,
  subagent_type: "general-purpose"
})

// 3. 主 session 继续其他工作，不占用 context
// 两个 agent 完成后会自动通知
```

**后台 agent 约束：**
- 必须设置 `run_in_background: true`
- 必须指定 `description` 和 `subagent_type`
- 永远不要在后台 agent 中使用 `run_in_background: false`（会阻塞等待）
- 不要 `Read` 或 `tail` output 文件 — 会 overflow context
- 通过 notification 机制跟踪进度，不要主动 poll

**Subagent 内使用 Edit 工具：**
- 永远先 `Read` 文件，再用 `Edit`（不能跳过 Read）
- 批量文件操作时，每个文件都要先 Read 再 Edit
- 不要在 subagent 中使用 `Write` — 用 `Edit` 代替

## Deployment 工作流

**标准部署命令：**
```bash
vercel --prod   # 直接部署到生产环境
```

**Preflight 检查（每次 deploy 前必须执行）：**
1. `which vercel && vercel --version` — 确认 CLI 可用
2. `ls .vercel/project.json` — 确认项目已 linked
3. `git status --porcelain` — 检查是否有未提交更改
4. 检查 `turbo.json` / `pnpm-workspace.yaml` — 判断是否 monorepo

**Subagent 与 Deploy 的交互原则：**
- Subagent 处理批量任务期间，**不要**立即 deploy
- 等 subagent 完成并 commit 所有更改后，再执行 deploy
- 未提交的 subagent 更改不会被 deploy，包含在当前 HEAD 的内容才会被部署
- 如果需要立即 deploy，先 commit 已完成的部分

**Preflight 未提交更改的决策矩阵：**

| 情况 | 推荐操作 |
|------|---------|
| Subagent 还在运行 | 等完成 → commit → deploy |
| 部分 subagent 文件已完成 | 可选：先 commit 已完成的 → deploy（跳过未完成文件）|
| 所有文件已完成但未 commit | Commit 所有 → deploy |

**Build 监控：** Subagent 运行期间 npm build 可能因文件未完成而失败，这是正常现象。Subagent 完成后 build 自动通过。

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
| MDX `style` prop crash | `The style prop expects a mapping from style properties to values, not a string` | MDX compiler passes `style="..."` as string, React requires object. Use `<FloatImage>` component, not raw HTML with inline styles |
| FloatImage spacing | Image touches text with no margin | Use `marginInlineEnd` (CSS logical property) — works for both left and right floats |
| parseTrendsBody() pattern order | Rising queries with `+4,250%` fail if `isNoise(val)` runs first. Always check `+X,XXX%` pattern before isNoise() in value-lookup loops |
| `npx tsc` intercepted | Shows "This is not the tsc command you are looking for" wrapper message | Use `./node_modules/.bin/tsc` directly |
| heredoc for Python scripts | Complex JS inside Python `-c "..."` causes quoting issues | Write script to `/tmp/script.py` via `cat > /tmp/script.py << 'PYEOF'` then `python3 /tmp/script.py` |

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
- **Every article paragraph needs a contextual image**: Use `<FloatImage src="..." alt="..." align="right" width={280} />` in MDX. Alternate `align="right"` and `align="left"` for visual interest — never stack all images on the same side. Use direct Unsplash URLs (e.g., `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80`) — do NOT download images to disk. Author must be "Mark He" for all articles.

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

*Updated: 2026-05-05 6:00pm*

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
