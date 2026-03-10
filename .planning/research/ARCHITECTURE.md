# 响应式设计架构

**项目:** WAG 网站移动端优化
**分析日期:** 2026-03-11

## 架构概述

**总体架构:** 基于 Tailwind CSS 移动优先的响应式组件系统

**核心特征:**
- Tailwind CSS 默认断点系统 (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
- 移动优先样式策略: 默认样式针对小屏幕，通过断点前缀逐步增强
- 响应式组件封装: 组件内部处理自身响应式逻辑，父组件无需关心具体实现
- 容器查询 (Container Queries): 组件级响应式布局，独立于视口尺寸

## 组件边界

### 页面层 (Page Layer)

**职责:** 页面布局骨架，响应式容器控制

**位置:** `web/frontend/app/*.tsx` (各页面)

**响应式职责:**
- 主容器宽度控制 (`max-w-*`, `mx-auto`)
- 页面级间距管理 (`py-*, px-*`)
- 网格/弹性布局基础 (`grid`, `flex`)
- 跨断点内容顺序控制 (`order-*`)

**示例:**
```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 页面内容 */}
    </main>
  )
}
```

### 区块组件层 (Section Components)

**职责:** 页面内独立功能区块的响应式布局

**位置:** `web/frontend/app/components/*.tsx`

**响应式职责:**
- 区块内元素排版 (`flex-col` mobile → `flex-row` desktop)
- 字体大小缩放 (`text-xl md:text-2xl lg:text-3xl`)
- 间距自适应 (`gap-4 md:gap-6 lg:gap-8`)
- 隐藏/显示控制 (`hidden md:block`)

**示例:**
```tsx
// Hero 组件
export function Hero() {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center gap-8">
      <div className="w-full md:w-1/2">
        {/* 文本内容 */}
      </div>
      <div className="w-full md:w-1/2">
        {/* 图片/视觉内容 */}
      </div>
    </section>
  )
}
```

### 基础组件层 (Primitive Components)

**职责:** 可复用的响应式 UI 元素

**位置:** `web/frontend/app/components/ui/` 或共享组件库

**响应式职责:**
- 按钮尺寸适配 (`px-4 py-2 md:px-6 md:py-3`)
- 输入框响应式宽度 (`w-full md:w-auto`)
- 触摸目标尺寸保障 (`min-h-[44px]` 移动端可点击)
- 图标缩放 (`w-5 h-5 md:w-6 md:h-6`)

**示例:**
```tsx
// 响应式按钮
function ResponsiveButton({ children }) {
  return (
    <button className="
      px-4 py-2           /* 移动端 */
      md:px-6 md:py-3     /* 桌面端增强 */
      text-sm             /* 移动端字体 */
      md:text-base        /* 桌面端字体 */
      rounded-lg
      bg-primary hover:bg-primary/90
      transition-colors
    ">
      {children}
    </button>
  )
}
```

## 数据流

### 响应式布局数据流

```
┌─────────────────────────────────────────────────────────────┐
│                        页面请求                              │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    页面层 (Page)                              │
│  - 设置主容器 max-w-* + mx-auto                              │
│  - 定义响应式网格/弹性布局基础                                │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               区块组件层 (Sections)                           │
│  - Hero: flex-col-reverse → flex-row                        │
│  - StatsBar: grid-cols-1 → grid-cols-3                      │
│  - Industries: grid-cols-1 → grid-cols-2/3/4               │
│  - FAQ: accordion 移动端展开 → 桌面端可展开                  │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              基础组件层 (Primitives)                          │
│  - Button: 触摸目标 + 尺寸                                   │
│  - Input: 宽度自适应                                         │
│  - Card: padding 响应式                                      │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      浏览器渲染                              │
│  - Tailwind 编译器生成响应式 CSS                             │
│  - 媒体查询注入按需加载                                       │
└─────────────────────────────────────────────────────────────┘
```

### 响应式状态流

**无状态响应式 (推荐):**
- 纯 CSS 响应式，无需 React 状态
- 利用 Tailwind 断点类 (`md:`, `lg:`)
- 性能最优，无需客户端 JavaScript

**有状态响应式 (谨慎使用):**
- 移动端菜单展开/折叠
- 移动端侧边栏显隐
- 使用 `useMediaQuery` 或 `window.matchMedia`

```tsx
// 移动端菜单状态
'use client'
import { useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* 桌面端导航 */}
      <nav className="hidden md:flex">...</nav>

      {/* 移动端汉堡菜单按钮 */}
      <button
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>

      {/* 移动端下拉菜单 */}
      {isOpen && (
        <div className="md:hidden absolute ...">
          ...
        </div>
      )}
    </>
  )
}
```

## 构建顺序

### 推荐构建顺序

| 阶段 | 任务 | 依赖 | 原因 |
|------|------|------|------|
| 1 | 页面容器响应式 | 无 | 基础骨架，为所有子组件提供约束 |
| 2 | 区块组件布局重构 | 1 | 页面结构确定后，调整区块排版 |
| 3 | 基础组件响应式 | 2 | 统一 UI 组件的跨设备体验 |
| 4 | 交互组件优化 | 3 | 移动端菜单、折叠面板等 |
| 5 | 视觉细节调整 | 4 | 字体、间距、动画等微调 |
| 6 | 跨浏览器/设备测试 | 5 | 真机验证，发现遗漏 |

### 页面级构建顺序

```
1. 首页 (/) — 组件最多，先行验证响应式模式
   ↓
2. 服务页 (/services) — 服务卡片网格响应式
   ↓
3. 关于页 (/about) — 团队/时间线响应式
   ↓
4. 询价页 (/enquiry) — 表单移动端可用性
   ↓
5. 资源页 (/resources) — 卡片网格 + 文章布局
```

### 组件级构建顺序

```
1. Layout/容器 — max-w, mx-auto, padding
   ↓
2. Hero/首屏区块 — 最重要的首屏体验
   ↓
3. 导航 Navbar — 移动端菜单
   ↓
4. 内容区块 (Stats, Features, etc.)
   ↓
5. CTA/Footer — 收尾区块
   ↓
6. 表单组件 — 输入体验
```

## 响应式模式

### 模式一: 移动优先列布局

```tsx
// 默认单列 → 桌面多列
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 内容 */}
</div>
```

**适用场景:** 服务卡片、特性列表、团队成员

### 模式二: 反向列布局

```tsx
// 移动端: 视觉在下、文本在上
// 桌面端: 文本在左、视觉在右
<div className="flex flex-col-reverse md:flex-row gap-8">
  <div className="md:w-1/2">{/* 文本 */}</div>
  <div className="md:w-1/2">{/* 视觉 */}</div>
</div>
```

**适用场景:** Hero、分隔式内容区块

### 模式三: 隐藏/显示切换

```tsx
// 移动端隐藏非核心内容
<div className="hidden md:block">
  {/* 桌面端专属内容 */}
</div>

// 移动端显示，桌面端隐藏
<button className="md:hidden">
  菜单
</button>
```

**适用场景:** 导航菜单、辅助信息、复杂图表

### 模式四: 触摸友好间距

```tsx
// 移动端增大触摸目标
<button className="
  px-4 py-3           /* 移动端更大 */
  md:px-4 md:py-2     /* 桌面端正常 */
  min-h-[44px]        /* 最小触摸高度 */
">
  操作
</button>
```

**适用场景:** 所有可点击元素

### 模式五: 响应式字体

```tsx
// 字体大小随视口平滑缩放
<p className="
  text-base           /* 移动端基础 */
  md:text-lg          /* 平板 */
  lg:text-xl          /* 桌面 */
">
  内容
</p>
```

**适用场景:** 正文、标题、强调文字

## 反模式

### 反模式一: 仅桌面优先

```tsx
// 错误: 默认样式针对桌面，移动端需覆盖
<div className="flex text-xl">
  {/* 移动端需用 hidden md:flex 覆盖 */}
</div>

// 正确: 移动优先
<div className="flex text-base md:text-xl">
  {/* 移动端默认，桌面端增强 */}
</div>
```

### 反模式二: 断点跳跃

```tsx
// 错误: 跳过了 md 断点
<div className="flex-col lg:flex-row">
  {/* lg 之前没有样式定义 */}
</div>

// 正确: 逐级定义
<div className="flex-col md:flex-row">
  {/* sm/md/lg 每级都有明确定义 */}
</div>
```

### 反模式三: 硬编码像素

```tsx
// 错误: 固定像素值不支持缩放
<div style={{ width: '320px' }}>

// 正确: 使用相对单位
<div className="w-full max-w-md">
  {/* 响应式宽度 */}
</div>
```

### 反模式四: 忽略触摸目标

```tsx
// 错误: 移动端点击困难
<button className="px-2 py-1">点击</button>

// 正确: 保证触摸区域
<button className="px-4 py-2 min-h-[44px]">点击</button>
```

## 可扩展性考虑

### 短期 (100-1000 用户)

- 纯 CSS 响应式，无状态组件
- 客户端仅处理少量交互 (菜单)
- 首屏渲染性能优先

### 中期 (1000-10000 用户)

- 考虑图片响应式 (`srcset`, `sizes`)
- 考虑懒加载大型组件
- 监控 Core Web Vitals

### 长期 (10000+ 用户)

- 服务端组件缓存优化
- CDN 边缘缓存
- 渐进式增强 (PWA 能力)

---

**参考来源:**
- [Tailwind CSS 响应式设计文档](https://tailwindcss.com/docs/responsive-design) (HIGH - 官方文档)

*架构分析: 2026-03-11*
