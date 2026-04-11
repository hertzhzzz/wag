# CLAUDE.md — WAG Website

> Winning Adventure Global 官网项目

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| Email | Nodemailer (Gmail SMTP) |
| Rate Limiting | Upstash Redis (+ in-memory fallback) |
| Media | Remotion (视频动画) |
| Charts | ECharts |
| Content | MDX + gray-matter + next-mdx-remote |
| Validation | Zod |

## Commands

```bash
# 开发
npm run dev          # 开发服务器 (localhost:3000)

# 构建
npm run build       # 生产构建 [必须提交前通过]
npm run lint        # ESLint 检查

# 部署
git push origin master  # GitHub 自动部署到 Vercel
```

## Project Structure

```
wag-frontend/              # 项目根目录
├── app/                  # Next.js App Router [部署到 Vercel]
│   ├── page.tsx          # 首页 (/)
│   ├── layout.tsx        # 根布局
│   ├── services/         # 服务页面
│   ├── about/            # 关于页面
│   ├── resources/        # 博客列表 + [slug] 动态路由
│   ├── enquiry/          # 询价表单页面 + components/
│   ├── api/              # API 路由
│   │   ├── enquiry/      # POST /api/enquiry (Zod验证 + Nodemailer)
│   │   └── newsletter/   # POST /api/newsletter
│   ├── components/        # 共享组件 (Navbar, Footer, Hero...)
│   └── data/             # FAQ 数据文件
├── content/blog/         # MDX 博客内容 [部署到 Vercel]
│   └── *.mdx             # 博客文章，通过 /resources/[slug] 访问
├── lib/                  # 工具函数
│   └── rate-limit.ts     # Upstash Redis 限流 (+内存备援)
├── public/               # 静态资源 [部署到 Vercel]
│   └── social/           # 博客配图 [SINGLE SOURCE - 不可删除]
│       ├── blog/          # 博客文章专用配图
│       │   └── {article-slug}/*.png
│       └── linkedin-post/ # 博客引用的配图（与文章同名的 date-topic 目录）
│           └── {YYYY-MM-DD-topic}/imgs/*.png
├── social/               # 社交媒体内容资产 (4.9M)
│   └── linkedin-post/    # LinkedIn post 图片
├── .claude/skills/wag-linkedin-post/  # 社交媒体内容 skill
│   ├── social/            # 全部内容：linkedin-post, x-post, facebook-post,
│   │   │                  # cold-email, 生成脚本, prompts, 发布预览 HTML
│   ├── SKILL.md           # 内容 hub skill 定义
│   └── references/        # master-prompts.md, publish-preview-template.html
└── vercel.json           # Vercel 配置
```

## Content Hub (wag-linkedin-post)

**社交媒体内容 skill** — `.claude/skills/wag-linkedin-post/`

**内容生命周期：**
1. **创建内容骨架** → `python social/generate_content.py --topic "xxx" --type single-post|carousel`
2. **AI 填充内容** → 参考 `references/master-prompts.md` 生成高质量初稿
3. **配图** → 使用 `prompts/*.md` 中的 AI 生图 prompt
4. **预览** → `python social/generate_preview.py --topic "YYYY-MM-DD-topic" --type single-post`
5. **分发** → 浏览器打开 `publish-preview.html` 一键复制到各平台
6. **归档** → 发布后归档到 `social/{platform}/archive/`

**图片存储规则 (SINGLE SOURCE):**
- 博客配图：存储在 `public/social/` — 这是网站静态资源，Vercel 部署用
- 博客 MDX 引用格式：`/social/blog/{article-slug}/*.png`
- AI 生图 prompt 输出到 `prompts/*.md`，生成后存入 `public/social/.../imgs/`

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/enquiry` | POST | 询价表单提交，Zod验证+Nodemailer发邮件 |
| `/api/newsletter` | POST | Newsletter 订阅 |

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

**部署方式**：推送到 GitHub master 分支自动触发部署
```bash
git add .
git commit -m "描述改动"
git push origin master
```

**手动部署**（如需立即部署）：
```bash
vercel --prod
```

**自定义域名配置**：
- ✅ 已配置 `winningadventure.com.au`

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

### Standard Rules
- 提交前必须：`npm run build` && `npm run lint`
- 5 个页面必须可访问：`/`, `/services`, `/about`, `/resources`, `/enquiry`
- **本地 build 成功 ≠ 线上可访问** — 部署后必须用 `curl -sI <URL>` 验证

## Env

```
.env.local  # 环境变量 (不要提交到版本控制)
```

**Required variables**:
- `GMAIL_USER` — Gmail address for SMTP sender
- `GMAIL_APP_PASSWORD` — Gmail App Password (not regular password)
- `UPSTASH_REDIS_REST_URL` — Upstash Redis URL (可选，缺失时用内存限流)
- `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis token (可选)

## Validation Checklist

```
[ ] npm run build 通过
[ ] npm run lint 无错误
[ ] 5 个页面均可访问
[ ] 询价表单正常工作
```

## Debugging & Gotchas

| Issue | Symptom | Solution |
|-------|---------|----------|
| Tailwind `bg-amber-500` fails | Button renders with transparent background | Use `bg-amber` instead (single-value custom colors don't generate numbered variants) |
| Image 404 in blog posts | Console errors for missing `/social/linkedin-post/...` images | Blog posts must only use images from `public/social/blog/{slug}/` |
| Duplicate section headings on About page | "Your Australian Point of Contact" appeared twice | Check `about/page.tsx` for accidental duplication after copy-paste |
| Playwright MCP connection timeout | Extension fails to attach on first try | Refresh/re-navigate the page to retry |

## Image Rules

- **Blog MDX images**: Must be in `public/social/blog/{article-slug}/` — this is the single source for website images
- **LinkedIn/social images**: Stored in `public/social/linkedin-post/{date-topic}/imgs/` — these are social media assets, NOT blog images
- **MDX reference format**: `/social/blog/{article-slug}/image.png` (no `/public/` prefix in URLs)
- **AI image prompts**: Output to `prompts/*.md`, generated images saved to appropriate `public/social/` subdirectory

## Design Context

### Users
- **目标用户**: 害怕在 1688/Alibaba 等线上平台采购踩坑的澳大利亚企业
- **用户痛点**: 担心质量问题、欺诈风险、沟通障碍
- **核心需求**: 想要实地考察中国工厂，获得专业的线下服务保障
- **使用场景**: 首次采购或已有供应链想要优化升级的企业决策者

### Brand Personality
- **品牌调性**: 高端定制 + 权威专业
- **核心信息**: 帮助企业安全、高效地连接中国优质制造商
- **情感目标**: 建立信任、消除焦虑、彰显专业价值
- **品牌个性 (3词)**: 可靠、专业、专属

### Aesthetic Direction
- **视觉风格**: 综合平衡 - 大胆现代 + 精致优雅 + 务实可信
- **优化策略**: 基于现有设计系统优化，提升专业度
- **配色**: Navy (#0F2D5E) + Amber (#F59E0B)，IBM Plex 字体
- **主题**: 浅色模式

### UX 优化重点
- **移动端优化**: 确保在各尺寸设备上体验一致
- **交互体验**: 优化表单、按钮、导航等交互元素

### Design Principles
1. **专业感优先**: 每一处细节都要体现专业水准
2. **信任可视化**: 成功案例、数据背书、资质展示
3. **简化决策**: 清晰的服务介绍，降低选择难度
4. **情感共鸣**: 理解用户担忧，提供安全感
5. **高端不张扬**: 质感升级但不俗气
6. **移动端优先**: 移动端体验与桌面端同等重要
7. **交互一致性**: 所有可交互元素有清晰的视觉反馈

---

*Updated: 2026-04-10*

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
