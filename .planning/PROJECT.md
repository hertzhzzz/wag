# WAG Navbar Enhancement

## What This Is

在 WAG 网站导航栏右侧添加可点击拨打电话的按钮，与现有的 "Start Your Factory Tour" CTA 并列显示。

## Core Value

提升用户体验——让有拨打意向的用户能一键拨号，降低沟通摩擦。

## Requirements

### Validated

- ✓ 网站导航栏 (Navbar.tsx) — Next.js App Router, Tailwind CSS
- ✓ CTA 按钮样式系统 — Navy (#0F2D5E) 主色调
- ✓ 响应式设计 — 桌面/移动端适配

### Active

- [ ] **NAV-01**: 导航栏右侧添加电话联系按钮
- [ ] **NAV-02**: 电话按钮支持 `tel:` 点击拨号
- [ ] **NAV-03**: 电话按钮视觉弱化（不抢 CTA 风头）
- [ ] **NAV-04**: 移动端适配（按钮可见且可点击）

### Out of Scope

- 顶部独立联系栏（原参考图的横跨式设计）— 当前方案是内嵌导航栏
- 多电话号码支持

## Context

- **现有导航栏**：固定顶部，白色背景，Logo + 导航链接 + CTA 按钮
- **CTA 按钮**：Navy 背景 + 白色文字，强调样式
- **目标样式**：参考图片——手机图标 + "CALL US TODAY" + 电话号码
- **电话号码**：03 9761 8700
- **设计原则**：电话按钮弱化，CTA 保持主导

## Constraints

- **Tech**: Next.js 16, TypeScript, Tailwind CSS 3.4
- **兼容性**: 移动端点击拨号需使用 `tel:` 协议
- **无新依赖**: 仅修改现有组件样式

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 按钮内嵌而非顶部横栏 | 保持简洁，不破坏现有导航结构 | — Pending |
| 电话按钮弱化 | 保持 CTA 主导地位，避免视觉冲突 | — Pending |

---
*Last updated: 2026-04-07 after initialization*
