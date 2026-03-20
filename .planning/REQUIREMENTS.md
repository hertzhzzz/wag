# Requirements: WAG Website v2.0 SEO Optimization

**Defined:** 2026-03-20
**Core Value:** Help Australian businesses safely connect with verified China manufacturers
**Milestone:** v2.0 SEO Optimization — 超越 Epic Sourcing Australia

## Target Keywords

| Priority | Keyword | Competitor | Intent |
|----------|---------|------------|--------|
| 🔴 Primary | "factory visit China" | 提到但未重点 | Commercial |
| 🔴 Primary | "China factory tour" | 几乎无 | Commercial |
| 🟠 Secondary | "China sourcing agent" | Epic Sourcing (main) | Commercial |
| 🟠 Secondary | "Supplier verification" | Epic Sourcing | Commercial |
| 🟠 Secondary | "Factory audits" | Epic Sourcing | Commercial |
| 🟡 Supporting | "Quality control" | Epic + ChinaDirect | Commercial |
| 🟡 Supporting | "Canton Fair tours" | Epic Sourcing | Commercial |

**Strategy:** WAG dominates "factory visit China" niche; competes on "China sourcing agent" as secondary.

## v2.0 Requirements

### Technical SEO (Foundation)

- [ ] **TECH-10**: 实现 app/robots.ts 爬取控制 (Next.js MetadataRoute API)
- [ ] **TECH-11**: 将所有 Schema 组件转换为 Server Components (修复 'use client' 导致的问题)
- [ ] **TECH-12**: 在所有页面添加 BreadcrumbList schema (提高 Sitelinks eligibility)
- [ ] **TECH-13**: 修复 Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms — FID已废弃)
- [ ] **TECH-14**: 在所有页面添加 Article schema (博客文章)
- [ ] **TECH-15**: 审计并修复所有页面的 canonical URLs
- [ ] **TECH-16**: 创建 app/sitemap.ts (Next.js 原生 sitemap)
- [ ] **TECH-17**: 添加 OpenGraph 和 Twitter Card metadata

### Content Architecture

- [ ] **ARCH-01**: 创建服务详情页 (/services/factory-tours, /services/supplier-verification, /services/quality-inspection)
- [ ] **ARCH-02**: 实现 Hub-and-Spoke 内容架构 (pillar pages + topic clusters)
- [ ] **ARCH-03**: 建立内部链接策略连接 pillar pages 到 spoke content

### Content Development (Keyword-Focused)

- [ ] **CONT-10**: 创建 Pillar Content: "The Complete Guide to Factory Visits in China" (target: "factory visit China", "China factory tour") (2000+ words)
- [ ] **CONT-11**: 创建 Trust Content: "How to Verify Chinese Suppliers" (target: "supplier verification") + "Red Flags When Sourcing from China" (target: "China sourcing agent")
- [ ] **CONT-12**: 创建 "China Factory Audit Checklist" (target: "factory audits")
- [ ] **CONT-13**: 创建案例研究 (需客户授权)
- [ ] **CONT-14**: 建立系统性内容发布流程 (月度新闻评论)
- [ ] **CONT-15**: 创建 "ChAFTA Import Guide for Australian Businesses" (目标: "Australia China sourcing")
- [ ] **CONT-16**: 创建 "Australia Import Regulations Overview"

### Authority Building

- [ ] **AUTH-10**: 完成竞品外链差距分析 (vs Epic Sourcing)
- [ ] **AUTH-11**: Guest post 外展至制造/采购出版物
- [ ] **AUTH-12**: 建立与澳大利亚商会的行业关系

### E-E-A-T Signals

- [ ] **EEAT-01**: 在所有页面显示团队专业技能和经验
- [ ] **EEAT-02**: 添加 WAG 中国实地经验的具体描述 (如 "Our team has visited 50+ factories in Guangdong")

## v2.1 Requirements (Future)

Deferred to future release.

### Advanced SEO

- [ ] **TECH-20**: 实现 Video schema for Remotion content
- [ ] **TECH-21**: 添加 Image sitemap
- [ ] **TECH-22**: 实现 Review/aggregate rating schema

### Content Expansion

- [ ] **CONT-20**: 创建 10+ 额外博客文章
- [ ] **CONT-21**: 视频内容系列 (factory tour)
- [ ] **CONT-22**: 行业特定指南

## Out of Scope

| Feature | Reason |
|---------|--------|
| E-commerce functionality | Not core to B2B sourcing service |
| Multi-language support | Australian market only for now |
| Chatbot/AI assistant | Can add after SEO foundation established |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TECH-10 | Phase 14 | Pending |
| TECH-11 | Phase 14 | Pending |
| TECH-12 | Phase 14 | Pending |
| TECH-13 | Phase 14 | Pending |
| TECH-14 | Phase 14 | Pending |
| TECH-15 | Phase 14 | Pending |
| TECH-16 | Phase 14 | Pending |
| TECH-17 | Phase 14 | Pending |
| EEAT-01 | Phase 14 | Pending |
| EEAT-02 | Phase 14 | Pending |
| ARCH-01 | Phase 15 | Pending |
| ARCH-02 | Phase 15 | Pending |
| ARCH-03 | Phase 15 | Pending |
| CONT-10 | Phase 16 | Pending |
| CONT-11 | Phase 16 | Pending |
| CONT-12 | Phase 16 | Pending |
| CONT-14 | Phase 16 | Pending |
| CONT-15 | Phase 16B | Pending |
| CONT-16 | Phase 16B | Pending |
| CONT-13 | Phase 16B | Pending |
| AUTH-10 | Phase 17 | Pending |
| AUTH-11 | Phase 17 | Pending |
| AUTH-12 | Phase 17 | Pending |

**Coverage:**
- v2.0 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 after 5-reviewer analysis — added TECH-16, TECH-17, CONT-15, CONT-16*
