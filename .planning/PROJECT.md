# WAG Website

## What This Is

Winning Adventure Global (WAG) company website - a Next.js-based corporate site for an Australian sourcing/consulting company that helps clients connect with verified suppliers in China. The site showcases services, company information, and includes an enquiry form for lead generation.

## Core Value

Help Australian businesses safely connect with verified China manufacturers through professional sourcing services and factory visit experiences.

## Current Milestone: v2.0 SEO Optimization

**Goal:** 以 chinafactorytours.com 为第一个对标网站，全面分析其页面结构、SEO策略、关键词、内容架构、UI设计，为WAG网站制定完整的SEO优化方案。目标：超越该竞争对手在相关关键词上的排名。

**Target competitor:**
- China Factory Tours (chinafactorytours.com) — 第一个对标网站

**Key requirements:**
1. 抓取并分析 chinafactorytours.com 全部页面 ✅
2. 分析其 SEO 策略、关键词布局、内容架构 ✅
3. 分析其 UI 设计（特别是右下角悬浮 contact 按钮）✅
4. 为 WAG 制定完整优化方案 ✅
5. 实现 Directory Section（嵌入首页）
6. 实现 Two Ways to Access Section
7. 实现右下角悬浮 Contact 按钮

**Success metrics:**
- 超越 chinafactorytours.com 在相关关键词上的排名
- Two Ways to Access Section 上线
- Directory Section 替换 Select Your Sector
- 悬浮 Contact 按钮上线
- DA 20+

## Milestones

| Milestone | Version | Phases | Description |
|-----------|---------|--------|-------------|
| MVP | v1.0 | 01-04 | Mobile-first responsive website |
| Deployment | v1.1 | 05 | Vercel deployment + custom domain |
| Security Audit | v1.2 | 08 | Security hardening + rate limiting |
| SEO Optimization | v1.3 | 06, 06.1, 07, 09, 10, 11, 12 | Technical SEO, content strategy |
| UI Optimization | v1.4 | 13 | Visual hierarchy and polish |
| SEO Optimization v2 | v2.0 | 14-20 | Landing page redesign + Directory + UI |

## Requirements

### Active (v2.0)

- [x] **SEO-01**: 分析 chinafactorytours.com 全部页面结构
- [x] **SEO-02**: 分析 chinafactorytours.com SEO 策略和关键词布局
- [x] **SEO-03**: 分析 chinafactorytours.com 内容架构和用户体验
- [x] **SEO-04**: 制定 WAG SEO 优化方案（基于竞品分析）
- [x] **SEO-05**: 创建 Two Ways to Access Section ✅
- [ ] **SEO-06**: 创建 Directory Section（嵌入首页）
- [x] **SEO-07**: 实现右下角悬浮 Contact 按钮 ✅ (Phase 16)
- [ ] **SEO-08**: 创建 FAQ Page + Schema
- [ ] **SEO-09**: 优化 About Page E-E-A-T
- [ ] **SEO-10**: Page SEO Optimization
- [ ] **SEO-11**: Technical SEO (sitemap, robots.txt)

### Out of Scope

- [E-commerce functionality] — Not core to B2B sourcing service
- [Multi-language support] — Australian market only for now
- [Chatbot/AI assistant] — Can add after SEO foundation established

## Context

**Tech Stack:**
- Next.js 16.1 (App Router)
- Tailwind CSS 3.4
- TypeScript
- Vercel hosting
- Custom domain: winningadventure.com.au

**Pages:**
- Home (/) — 包含 Two Ways Section + Directory Section
- Services (/services)
- About (/about) — 需优化 E-E-A-T
- Resources (/resources)
- FAQ (/resources/faq) — 新增
- Enquiry (/enquiry)

**Brand:**
- Primary: Navy (#0F2D5E)
- Accent: Amber (#F59E0B)
- Fonts: IBM Plex Sans, IBM Plex Serif

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobile-first approach | Target audience uses mobile | ✅ All pages verified at 320px |
| Next.js App Router | Modern React framework | ✅ Stable |
| Tailwind CSS | Rapid iteration | ✅ Consistent |
| Vercel deployment | GitHub integration | ✅ Auto-deploy working |

---

*Last updated: 2026-03-20 after Phase 16 (floating contact button) completed*
