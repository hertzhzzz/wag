# Phase 15: Directory Section (Landing Page) - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

替换首页 `Industries` section（`Select Your Sector`），创建工厂目录展示区块。左侧展示城市级别工厂列表，右侧展示 Leaflet 交互地图。列表与地图联动。

**完全替换** 现有 Industries section（12 个行业卡片），不使用 Cities + Industries 混合设计。

</domain>

<decisions>
## Implementation Decisions

### Layout Structure
- **比例：** 70/30（地图占 70%，列表占 30%）
- **列表内容：** 城市级别展示（城市 + 省份 + 工厂数量 + 定位关键词）
- **替换策略：** 完全替换现有 Industries section，不保留 12 个行业卡片

### Map Implementation
- **SSR 处理：** dynamic import + `ssr: false`（Next.js 官方推荐方案）
- **地图库：** Leaflet.js + OpenStreetMap
- **聚类支持：** leaflet.markercluster 插件（多个标记聚集时显示聚类）
- **初始中心点：** 中国全图缩放，显示所有城市标记
- **地图缩放级别：** 支持用户交互缩放

### Filter Design
- **位置：** 地图上方横向 tabs
- **筛选维度：** 仅行业筛选（不含省份）
- **行业选项：** All, Electronics, Furniture, Robotics, EV Battery, CBD Property, Construction, Food & Beverage
- **联动逻辑：** 筛选时地图标记和列表同步更新

### List-Map Interaction
- **点击列表城市：** 地图自动定位到该城市，弹出 marker popup
- **点击地图 marker：** 列表滚动到对应城市高亮（如果列表支持滚动）
- **Popup 内容：** 城市名 + 工厂数量 + "View Directory →" CTA

### Factory Data Model
- **数据方案：** Type-safe hardcoded data（硬编码 + TypeScript interface）
- **城市数据结构：**
  ```typescript
  interface CityEntry {
    city: string        // "Foshan"
    province: string    // "Guangdong"
    factories: number   // 80
    focus: string       // "Furniture manufacturing hub"
    coords: [number, number]  // [lat, lng]
    industries: string[] // ["Furniture", "Construction"]
  }
  ```
- **数据来源：** 硬编码在组件或 `data/directory-cities.ts`

### Animation & States
- **IntersectionObserver：** 列表条目依次淡入（与 TwoWaysAccess 一致）
- **Loading state：** 地图加载时显示骨架屏或 loading 动画
- **Empty state：** 无匹配结果时显示提示

### CTA
- **底部 CTA：** "View Full Directory →" → 链接到 `/directory` 或 `/enquiry`
- **Inline CTA：** 每个城市列表可点击

### Responsive Behavior
- **Mobile（< 768px）：** 地图在上方（固定高度），列表在下方可滚动
- **Desktop（≥ 768px）：** 左右 70/30 布局

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope
- `.planning/ROADMAP.md` § Phase 15 — Directory Section (Landing Page) 任务定义
- `.planning/REQUIREMENTS.md` § SEO-01 — Factory Directory Page 需求

### Existing Components
- `app/components/industries/index.tsx` — 当前 Industries section（将被替换）
- `app/components/industries/IndustryCard.tsx` — 现有 sidebar 卡片设计参考
- `app/components/industries/FeaturedPanel.tsx` — 现有 featured panel 设计参考
- `app/components/TwoWaysAccess.tsx` — IntersectionObserver 动画模式参考

### Brand Design System
- `app/components/HowItWorks.tsx` — 动画模式和卡片样式
- Tailwind tokens: `navy`, `amber` 颜色已在 tailwind.config.ts 定义

### Competitor Reference
- `.planning/research/AGENT5-DIRECTORY.md` — chinafactorytours.com 目录结构分析

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lucide-react` icons: 已使用多种图标
- Tailwind design tokens: `navy`, `amber` 颜色已在 tailwind.config.ts 定义
- IntersectionObserver 动画模式: 见 `HowItWorks.tsx` lines 44-59
- Next.js dynamic import: `next/dynamic` 用于 SSR 兼容

### Established Patterns
- Section 组件结构: `bg-white py-14 md:py-18 px-4 md:px-10` + `max-w-[1100px] mx-auto`
- Card 样式: `rounded-2xl`, `border`, `shadow`, `p-6`
- 动画: `opacity-0 translate-y-8` → `opacity-100 translate-y-0` with transition

### Integration Points
- 替换位置: `app/page.tsx` — 替换 `<Industries />`
- 新组件: `app/components/DirectorySection/`
  - `index.tsx` — 主组件
  - `CityList.tsx` — 城市列表
  - `DirectoryMap.tsx` — Leaflet 地图
  - `FilterTabs.tsx` — 行业筛选 tabs
  - `types.ts` — TypeScript 接口

</code_context>

<specifics>
## Specific Ideas

- 城市数据参考竞品：Foshan (80+), Dongguan (50+), Hangzhou (35+), Guangzhou (60+)
- 保持与现有 Industries section 相同的紧凑间距（`py-14 md:py-16`）
- 地图 popup 样式与整体设计系统一致（navy/amber 配色）

</specifics>

<deferred>
## Deferred Ideas

- `/directory` 独立页面建设 — 未来的 Phase 工作
- 工厂级别详情数据 — 未来 Phase
- CMS 数据扩展 — 未来 Phase

</deferred>

---

*Phase: 15-directory-section-landing-page*
*Context gathered: 2026-03-20*
