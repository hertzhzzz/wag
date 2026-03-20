# Phase 14: Two Ways to Access Section - Context

**Gathered:** 2026-03-20
**Updated:** 2026-03-20 (UI refinements)
**Status:** Ready for planning

<domain>
## Phase Boundary

在首页 `HowItWorks` 和 `Industries` 之间新增 "Two Ways to Access" 服务对比区块。两个服务选项并列展示：Full Service (Guided Tours) 和 Factory Directory Access。插入位置在 `<HowItWorks />` 之后 `<Industries />` 之前。

</domain>

<decisions>
## Implementation Decisions

### Card Layout
- 50/50 完全平等并排（跟随竞品）
- 移动端上下堆叠
- 卡片等高设计

### Section Header
- 标题文案: "How Would You Like to Find Your Factory?"
- 口语化、引导性语气

### Card Structure
- 结构: 图标 → 标题 → 描述 → bullet列表 → 底部CTA
- 跟随竞品布局

### Visual Emphasis
- Full Service 卡片用 Amber 色强调（边框/背景色块）
- Directory Access 卡片保持默认白色

### Full Service Card Content
- **图标:** `Compass` (lucide-react)
- **标题:** Full Service / Guided Tours
- **描述:** 一句话说明全程服务
- **特性列表:**
  1. 专属向导陪同
  2. 工厂筛选和对接
  3. 质量管控指导
  4. 后续合同支持
- **CTA 按钮:** "Start Your Tour" → /enquiry

### Directory Access Card Content
- **图标:** `Database` (lucide-react)
- **标题:** Factory Directory Access
- **描述:** 一句话说明自主探索服务
- **特性列表:**
  1. 浏览部分工厂预览（模糊数据）
  2. 海量工厂数据
  3. 提交询价获取完整信息
- **CTA 按钮:** "Request Directory Access" → /enquiry

### Animation
- IntersectionObserver 依次淡入上浮（与 HowItWorks 一致）

### UI Refinements (Post-Implementation)
- **Navbar CTA 按钮**：移除渐变色 `bg-gradient-to-r from-amber to-navy`，改为纯色 `bg-amber`，与 TwoWaysAccess 主按钮一致
- **Section 左右 padding**：`px-4 md:px-8` → `px-6 md:px-10`（HowItWorks 和 TwoWaysAccess 两个 section）

### Technical
- 使用 Lucide React icons
- Tailwind 响应式布局
- Client Component（需要 IntersectionObserver）

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope
- `.planning/ROADMAP.md` § Phase 14 — Two Ways to Access Section 任务定义
- `.planning/REQUIREMENTS.md` § SEO-01-06 — v2.0 需求概述

### Brand Design System
- `.planning/codebase/CONVENTIONS.md` — Tailwind tokens, 颜色变量 (navy, amber)
- `.planning/codebase/STRUCTURE.md` — 组件目录结构
- `app/components/HowItWorks.tsx` — 现有动画模式和卡片样式参考

### Competitor Reference
- 竞品分析截图（见 discussion）: chinafactorytours.com "Two Ways to Access" section

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lucide-react` icons: 已使用 `Compass`, `Database`, `Users`, `ShieldCheck` 等
- Tailwind design tokens: `navy`, `amber` 颜色已在 tailwind.config.ts 定义
- IntersectionObserver 动画模式: 见 `HowItWorks.tsx` lines 44-59

### Established Patterns
- Section 组件结构: `bg-white py-20 md:py-28 px-4 md:px-8` + `max-w-[1400px] mx-auto`
- Card 样式: `rounded-2xl`, `border`, `shadow`, `p-6`
- 动画: `opacity-0 translate-y-8` → `opacity-100 translate-y-0` with transition

### Integration Points
- 插入位置: `app/page.tsx` — `<HowItWorks />` 之后 `<Industries />` 之前
- 新组件: `app/components/TwoWaysAccess.tsx`

</code_context>

<specifics>
## Specific Ideas

- Directory Access 的工厂数据是**模糊/部分展示**，用户需留下邮箱获取完整信息
- Full Service 是主推服务，用 Amber 色强调视觉区分
- CTA 按钮目的地统一是 /enquiry 表单

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-two-ways-to-access-section*
*Context gathered: 2026-03-20*
