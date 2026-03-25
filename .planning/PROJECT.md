# WAG Website

## What This Is

Winning Adventure Global (WAG) company website - a Next.js-based corporate site for an Australian sourcing/consulting company that helps clients connect with verified suppliers in China. The site showcases services, company information, and includes an enquiry form for lead generation.

## Core Value

Help Australian businesses safely connect with verified China manufacturers through professional sourcing services and factory visit experiences.

## Current Milestone: v3.0 GEO Optimization

**Goal:** 全链路 GEO 优化——提升 WAG 在 AI 搜索引擎（Perplexity、ChatGPT、Google AI Overviews、Gemini）中的可见性和引用概率。

**Target platforms:**
- Perplexity AI
- ChatGPT (Web Browsing)
- Google AI Overviews
- Google Gemini

**Key requirements:**
1. `llms.txt` 生成与配置
2. 品牌 AI 可见度建设（平台对标 + 引用概率提升）
3. 内容 Citability 优化（E-E-A-T 深化）
4. GEO 技术审计（crawler 合规性、Indexability、Schema 完整性）

**真实性原则（约束）:**
- 只基于真实已实现的来构建 GEO
- 不得凭空制造信任点（客户评价、案例等必须真实）
- 所有 E-E-A-T 信号必须有实际内容支撑

## Milestones

| Milestone | Version | Phases | Description |
|-----------|---------|--------|-------------|
| MVP | v1.0 | 01-04 | Mobile-first responsive website |
| Deployment | v1.1 | 05 | Vercel deployment + custom domain |
| Security Audit | v1.2 | 08 | Security hardening + rate limiting |
| SEO Optimization | v1.3 | 06, 06.1, 07, 09, 10, 11, 12 | Technical SEO, content strategy |
| UI Optimization | v1.4 | 13 | Visual hierarchy and polish |
| SEO Optimization v2 | v2.0 | 14-22 | Landing page redesign + Directory + UI |
| GEO Optimization | v3.0 | 23+ | 全链路 GEO 优化 |

## Requirements

### Active (v3.0)

- [x] **GEO-01**: 生成并配置 `llms.txt` (Phase 23)
- [x] **GEO-02**: 品牌 AI 可见度对标分析（Perplexity/ChatGPT/Gemini）(Phase 23)
- [ ] **GEO-03**: 内容 Citability 优化（E-E-A-T 深化）
- [ ] **GEO-04**: GEO 技术审计（crawler 合规性、Indexability）
- [ ] **GEO-05**: Schema 完整性审查与补充

### Out of Scope

- [E-commerce functionality] — Not core to B2B sourcing service
- [Multi-language support] — Australian market only for now
- [Chatbot/AI assistant] — Can add after SEO foundation established
- [Fabricated trust signals] — 不得凭空制造客户评价或案例

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
- About (/about)
- Resources (/resources)
- FAQ (/resources/faq)
- Enquiry (/enquiry)

**Brand:**
- Primary: Navy (#0F2D5E)
- Accent: Amber (#F59E0B)
- Fonts: IBM Plex Sans, IBM Plex Serif

**Existing GEO assets (v2.0):**
- FAQPage JSON-LD Schema
- ArticleSchema
- BreadcrumbSchema
- PersonSchema
- WebSite + SearchAction Schema

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobile-first approach | Target audience uses mobile | ✅ All pages verified at 320px |
| Next.js App Router | Modern React framework | ✅ Stable |
| Tailwind CSS | Rapid iteration | ✅ Consistent |
| Vercel deployment | GitHub integration | ✅ Auto-deploy working |
| llms.txt approach | AI crawler 友好 | ⏳ Pending v3.0 |

---

*Last updated: 2026-03-25 after v2.0 milestone completed*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

## Validated Requirements

| ID | Requirement | Validated In |
|----|-------------|--------------|
| SEO-01 | 分析 chinafactorytours.com 全部页面结构 | Phase 14 |
| SEO-02 | 分析 chinafactorytours.com SEO 策略和关键词布局 | Phase 14 |
| SEO-03 | 分析 chinafactorytours.com 内容架构和用户体验 | Phase 14 |
| SEO-04 | 制定 WAG SEO 优化方案（基于竞品分析） | Phase 14 |
| SEO-05 | 创建 Two Ways to Access Section | Phase 14 |
| SEO-07 | 实现右下角悬浮 Contact 按钮 | Phase 16 |
| SEO-08 | 创建 FAQ Page + Schema | Phase 17 |
| CONTENT-01 | LinkedIn post expanded to blog article on 1688 factory verification | Phase 22 |
