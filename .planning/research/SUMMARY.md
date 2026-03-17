# Project Research Summary

**Project:** WAG Website v1.1
**Domain:** Corporate website deployment and mobile UX improvements
**Researched:** 2026-03-17
**Confidence:** HIGH

## Executive Summary

v1.1 里程碑聚焦于将 Winning Adventure Global 官网部署到 Vercel 生产环境并修复已发现的移动端体验问题。基于研究，核心技术栈已就绪：Next.js 14.2 + Vercel 零配置部署 + Tailwind CSS 响应式架构。主要工作包括配置自定义域名（winningadventure.com.au）、修复移动端导航栏固定定位失效问题、以及添加 Facebook 社交链接。

研究识别出 6 个关键陷阱，其中最需关注的是：Vercel 环境变量缺失导致构建失败、iOS Safari 中 fixed 定位失效、以及 SSL 证书配置延迟。建议采用渐进式实施策略，先完成开发环境验证，再部署到生产环境。

## Key Findings

### Recommended Stack

**核心部署架构已确定：** Vercel 平台 + Next.js 14.2 App Router + Node.js 20.x。Vercel 提供原生 Next.js 支持，包含 ISR、SSR、图像优化等开箱即用功能，无需额外配置。

**Core technologies:**
- **Vercel** — 托管与 CDN，原生 Next.js 支持，零配置部署
- **Next.js 14.2** — 当前项目版本，App Router 架构
- **Node.js 20.x** — Next.js 14.2 要求，在 vercel.json 中已配置
- **Tailwind CSS 3.4** — 移动优先响应式设计，已在项目中应用
- **Sydney 区域 (syd1)** — 距离澳大利亚用户最近的边缘节点

### Expected Features

**Must have (table stakes):**
- Vercel 生产部署 — 项目已具备部署条件
- 自定义域名配置 — winningadventure.com.au，DNS 需正确配置
- 移动端导航栏固定定位修复 — 用户已报告此问题
- 环境变量配置 — Supabase + Resend 凭证需在 Vercel Dashboard 配置

**Should have (competitive):**
- Facebook 社交链接添加 — Footer 已有 LinkedIn，参照添加 Facebook
- SSL 证书自动签发 — Vercel 免费提供
- 安全 headers 配置 — X-Frame-Options, X-Content-Type-Options 等

**Defer (v2+):**
- 容器查询 (Container Queries) — 组件级响应式，优先级较低
- 折叠屏设备支持 — 18% 市场份额，高复杂度

### Architecture Approach

**部署架构采用分层模式：**
- **页面层 (Page Layer)** — 布局骨架，容器控制
- **区块组件层 (Section Components)** — 功能区块响应式
- **基础组件层 (Primitive Components)** — 可复用 UI 元素

**Vercel 部署流程：** Git Push → Vercel Detect → Build (next build) → Serverless Functions → CDN

**自定义域名 DNS 配置：**
- A 记录 (@) → 76.76.21.21
- CNAME (www) → cname.vercel-dns.com

### Critical Pitfalls

1. **SSL 证书配置失败** — 域名 DNS 未正确配置时证书处于 Pending 状态，需等待 5 分钟至 24 小时传播
2. **环境变量在 Vercel 构建时缺失** — 仅本地 .env.local 存在，生产构建失败，需添加到 Vercel Project Settings
3. **移动端 fixed 定位在 iOS Safari 失效** — 导航栏随页面滚动消失，建议改用 `position: sticky` 或添加 `transform: translateZ(0)`
4. **Vercel 构建缓存导致样式未更新** — 修改 CSS 后部署仍显示旧样式，需使用 `--force` 重新部署
5. **移动端 hamburger 菜单点击区域不足** — 按钮需最小 44x44px，当前实现已符合标准

## Implications for Roadmap

基于研究，建议采用单阶段实施策略，v1.1 聚焦于部署就绪和小修复。

### Phase 1: Vercel 部署与移动端修复

**Rationale:** 部署是核心目标，移动端修复是用户报告的紧急问题，Facebook 链接是简单的补充任务

**Delivers:**
- Vercel 生产环境部署完成
- 自定义域名 (winningadventure.com.au) 生效
- SSL 证书自动签发
- 移动端导航栏固定定位修复
- Facebook 链接添加

**Addresses:**
- Responsive Layout (from FEATURES.md)
- Mobile Navigation fix (PITFALLS.md Pitfall 3)
- Vercel Deployment (STACK.md)

**Avoids:**
- SSL 证书 Pending — 提前配置 DNS 并等待传播
- 环境变量缺失 — 部署前在 Vercel Dashboard 完整配置

### Phase Ordering Rationale

- **为何此顺序：** 部署是核心目标，修复移动端问题是用户痛点，添加 Facebook 是简单补充
- **为何合并为一阶段：** 三个任务都是 P1 优先级且互不依赖，可并行处理
- **如何避免陷阱：** 部署前完成环境变量配置，在真实 iOS 设备测试导航栏

### Research Flags

Phases likely needing deeper research during planning:
- **无** — v1.1 任务已充分研究，有明确的实施路径

Phases with standard patterns (skip research-phase):
- **Phase 1:** Vercel 部署是标准模式，Next.js + Vercel 文档完善
- **Phase 1:** 移动端 fixed 定位修复有成熟的 CSS 解决方案

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Vercel + Next.js 官方文档完整 |
| Features | HIGH | 部署任务明确，修复已有用户报告 |
| Architecture | HIGH | Next.js App Router 模式成熟 |
| Pitfalls | MEDIUM-HIGH | 已识别 6 个陷阱，有对应解决方案 |

**Overall confidence:** HIGH

### Gaps to Address

- **DNS 传播时间：** 首次配置自定义域名后 SSL 证书可能延迟，需在验证阶段耐心等待
- **真实设备测试：** 移动端 fixed 定位问题需在真实 iOS 设备测试，模拟器可能无法复现

## Sources

### Primary (HIGH confidence)
- Vercel Documentation — https://vercel.com/docs/frameworks/nextjs
- Vercel Custom Domains — https://vercel.com/docs/domains/add-a-domain
- Next.js Deployment — https://nextjs.org/docs/app/building-your-application/deploying

### Secondary (MEDIUM confidence)
- iOS Safari position:fixed Issues — Stack Overflow 社区解决方案
- MDN: position sticky — https://developer.mozilla.org/en-US/docs/Web/CSS/position

---

*Research completed: 2026-03-17*
*Ready for roadmap: yes*
