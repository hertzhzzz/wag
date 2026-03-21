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
npm run dev:admin   # 管理后台 (localhost:3001)

# 构建
npm run build       # 生产构建 [必须提交前通过]
npm run lint        # ESLint 检查

# 部署
git push origin master  # GitHub 自动部署到 Vercel
```

## Project Structure

```
wag/                      # 项目根目录
├── app/                  # Next.js App Router
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
├── content/blog/         # MDX 博客内容 (gray-matter frontmatter)
├── lib/                  # 工具函数
│   └── rate-limit.ts     # Upstash Redis 限流 (+内存备援)
├── public/               # 静态资源
├── .planning/            # GSD 项目规划 (milestones/phases)
├── social/               # 社交媒体内容
│   └── linkedin-post/    # LinkedIn 帖子资产
│       └── {YYYY-MM-DD-topic}/  # 按日期+主题分类
│           ├── post.md    # 帖子正文
│           ├── outline.md # 配图大纲
│           ├── imgs/     # 配图
│           └── prompts/   # AI 生图 prompt 文件
└── vercel.json           # Vercel 配置
```

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

*Updated: 2026-03-20*
