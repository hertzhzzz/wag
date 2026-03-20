# Phase 1: Foundation - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish responsive layout patterns on home page and fix global navigation for mobile. This phase covers 13 requirements: RESP-01, RESP-05, TOUCH-01, TOUCH-02, TOUCH-03, TYPE-01, TYPE-02, TYPE-03, NAV-01, NAV-02, NAV-03, SPACE-01, SPACE-02.

</domain>

<decisions>
## Implementation Decisions

### 首页布局 (Home Page Layout)
- 移动端布局: 单列堆叠 (flex-col, 各区块垂直排列)
- Hero 高度: 半屏 Hero (50-60vh)，让用户能看到下一区块入口
- 装饰图片: 保留图片，但使用优化版本
- 内容调整: 保持内容不变，仅调整宽度

### 导航菜单 (Mobile Navigation)
- 展开动画: 侧边栏滑入 (slide-in from right)
- 关闭机制: X 按钮 + 点击遮罩关闭 (两者都要)
- 链接排列: 垂直列表，易于点击
- 链接点击后: 立即关闭菜单并跳转

### 触摸区域 (Touch Targets)
- 实现方式: 全局工具类 (如 .touch-target)
- 最小尺寸: 44x44px (遵循 Apple/Google 标准)
- 相邻间距: 8px 间距
- 文字链接: 保持原样，不扩展触摸区域

### 垂直间距 (Vertical Spacing)
- 区块间距: 32-48px (宽松间距，滚动体验更好)
- 两侧内边距: 16px (px-4)
- 实现方式: Tailwind 工具类 (space-y-*, gap-*)
- 断点策略: 使用 Tailwind 默认断点 (sm:640px, md:768px)

### Claude's Discretion
- 具体的 Tailwind 工具类选择 (如 space-y-8 vs space-y-12)
- Hero 背景图片的优化策略 (使用 next/image 或 picture 标签)
- 导航菜单的动画时长和缓动函数
- 如何处理横屏移动设备的布局

</decisions>

<specifics>
## Specific Ideas

- 单列堆叠 + 半屏 Hero 的组合是移动端最常见且用户熟悉的模式
- 侧边栏滑入 + 两者都有关闭机制是用户期望的标准移动导航行为
- 44px + 8px 间距遵循 WCAG 2.1 触摸目标指南

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Navbar.tsx: 已有 mobileMenuOpen 状态和基础结构
- Hero.tsx: 已有 Hero 组件，可添加响应式变体
- Footer.tsx: 已有 Footer 组件
- Tailwind 配置: 已定义 navy (#0F2D5E) 和 amber (#F59E0B) 颜色

### Established Patterns
- 组件默认使用 Server Component，需要交互时添加 'use client'
- 样式完全使用 Tailwind 工具类
- 响应式使用 md:, lg: 等前缀

### Integration Points
- 修改 Navbar.tsx 添加移动端菜单样式和动画
- 修改首页各区块组件 (Hero, StatsBar, FAQ 等) 添加响应式类
- 全局 CSS 或 Tailwind 插件添加触摸目标工具类

</code_context>

<deferred>
## Deferred Ideas

- Phase 2 会处理 Services 和 About 页面的响应式
- Phase 3 会处理 Enquiry 表单的响应式
- Phase 4 会处理 Resources 页面

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-11*
