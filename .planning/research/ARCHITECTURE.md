# Vercel Deployment Architecture

**Project:** WAG Website v1.1
**Researched:** 2026-03-17
**Domain:** Next.js + Vercel Deployment Integration
**Confidence:** HIGH

---

## Part 1: Responsive Design Architecture (v1.0)

**Original Date:** 2026-03-11

### 架构概述

**总体架构:** 基于 Tailwind CSS 移动优先的响应式组件系统

**核心特征:**
- Tailwind CSS 默认断点系统 (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
- 移动优先样式策略: 默认样式针对小屏幕，通过断点前缀逐步增强
- 响应式组件封装: 组件内部处理自身响应式逻辑，父组件无需关心具体实现
- 容器查询 (Container Queries): 组件级响应式布局，独立于视口尺寸

### 组件边界

#### 页面层 (Page Layer)

**职责:** 页面布局骨架，响应式容器控制

**位置:** `frontend/app/*.tsx` (各页面)

**响应式职责:**
- 主容器宽度控制 (`max-w-*`, `mx-auto`)
- 页面级间距管理 (`py-*, px-*`)
- 网格/弹性布局基础 (`grid`, `flex`)
- 跨断点内容顺序控制 (`order-*`)

#### 区块组件层 (Section Components)

**职责:** 页面内独立功能区块的响应式布局

**位置:** `frontend/app/components/*.tsx`

**响应式职责:**
- 区块内元素排版 (`flex-col` mobile → `flex-row` desktop)
- 字体大小缩放 (`text-xl md:text-2xl lg:text-3xl`)
- 间距自适应 (`gap-4 md:gap-6 lg:gap-8`)
- 隐藏/显示控制 (`hidden md:block`)

#### 基础组件层 (Primitive Components)

**职责:** 可复用的响应式 UI 元素

**位置:** `frontend/app/components/ui/` 或共享组件库

**响应式职责:**
- 按钮尺寸适配 (`px-4 py-2 md:px-6 md:py-3`)
- 输入框响应式宽度 (`w-full md:w-auto`)
- 触摸目标尺寸保障 (`min-h-[44px]` 移动端可点击)
- 图标缩放 (`w-5 h-5 md:w-6 md:h-6`)

### 响应式模式

#### 模式一: 移动优先列布局

```tsx
// 默认单列 → 桌面多列
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 内容 */}
</div>
```

#### 模式二: 反向列布局

```tsx
// 移动端: 视觉在下、文本在上
// 桌面端: 文本在左、视觉在右
<div className="flex flex-col-reverse md:flex-row gap-8">
  <div className="md:w-1/2">{/* 文本 */}</div>
  <div className="md:w-1/2">{/* 视觉 */}</div>
</div>
```

#### 模式三: 触摸友好间距

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

---

## Part 2: Vercel Deployment Architecture (v1.1)

### Executive Summary

Vercel is the native deployment platform for Next.js and provides zero-config integration. The WAG website's existing Next.js 14.2 App Router architecture deploys to Vercel with minimal configuration. Key integration points: automatic detection, build command, environment variables, and custom domain setup.

### Vercel Integration with Next.js

#### Automatic Detection

Vercel automatically detects Next.js projects by identifying `package.json` with `next` dependency. No manual configuration required.

| Detection Method | Status |
|-----------------|--------|
| package.json with "next" | ✅ Detected |
| next.config.js | ✅ Present |
| App Router structure | ✅ Present |

#### Build Configuration

The existing `vercel.json` specifies Node 20.x:

```json
{
  "build": {
    "env": {
      "NODE_VERSION": "20.x"
    }
  }
}
```

**Build Command:** `next build` (Vercel defaults to this for Next.js)

**Output:** Vercel handles serverless function generation automatically - no output directory needed.

#### Framework Preset

Vercel automatically uses `nextjs` framework preset when detected, which configures:
- Next.js build pipeline
- ISR (Incremental Static Regeneration) support
- API routes as serverless functions
- Image optimization

### Architecture Patterns

#### Deployment Flow

```
Git Push → Vercel Detect → Build (next build) → Serverless Functions → CDN
```

#### Component Mapping

| Next.js Component | Vercel Equivalent |
|-------------------|-------------------|
| Pages Router | Serverless functions |
| API Routes | Serverless endpoints |
| Static pages | Edge network (CDN) |
| Images (next/image) | Vercel Image Optimization |
| Dynamic routes | On-demand serverless |

### Environment Variables

**Required for WAG:**

| Variable | Source | Status |
|----------|--------|--------|
| NEXT_PUBLIC_SUPABASE_URL | .env.local | Needed |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | .env.local | Needed |
| SUPABASE_SERVICE_ROLE_KEY | .env.local | Needed |
| RESEND_API_KEY | .env.local | Needed |

**Configuration:** Set in Vercel Dashboard → Project → Environment Variables

### Integration Points

#### 1. Supabase Integration
- Connection string via environment variables
- Auth cookies handled client-side
- Database queries go direct from client (Supabase handles)

#### 2. Resend (Email)
- API key in environment variable
- Server-side API route triggers send
- No additional configuration needed

#### 3. Static Assets
- `/public` folder deployed to CDN
- Images use `next/image` with Unsplash remote pattern (already configured)

### Custom Domain Setup

#### Domain: winningadventure.com.au

**DNS Configuration Required:**

| Record Type | Name | Value |
|-------------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

**Alternative (recommended):**
- Add domain in Vercel Dashboard
- Vercel provides nameservers or DNS records
- SSL certificate auto-provisioned

#### SSL/TLS

- Automatic with Vercel
- Let's Encrypt certificate provisioned
- HTTP → HTTPS redirect automatic

### Production Considerations

#### Build Optimization

Current `next.config.js` settings are production-ready:

```javascript
const nextConfig = {
  reactStrictMode: true, // ✅ Enabled
  // Output handled by Vercel
}
```

#### Performance

| Feature | Vercel Support |
|---------|---------------|
| Edge Functions | ✅ Available |
| ISR/Revalidation | ✅ Supported |
| Image Optimization | ✅ Built-in |
| Caching | ✅ Automatic CDN |

#### Monitoring

- Vercel Dashboard provides:
  - Deployment status
  - Function invocation logs
  - Performance metrics
  - Serverless function duration

### Changes Required for Deployment

#### Minimal - Already Complete

1. ✅ `vercel.json` exists with Node 20.x
2. ✅ `next.config.js` properly configured
3. ✅ `package.json` has build script

#### To Complete

1. **Environment Variables:** Add to Vercel project settings
2. **Custom Domain:** Configure DNS records
3. **Deploy:** Push to GitHub/GitLab and connect to Vercel

#### Recommended Additions

**vercel.json (enhanced):**

```json
{
  "build": {
    "env": {
      "NODE_VERSION": "20.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Scalability

| Scale Level | Vercel Handles |
|--------------|---------------|
| 100 users | Auto |
| 10K users | Auto (CDN + Serverless) |
| 100K users | Auto + paid plan |

**Note:** WAG website is primarily static content - scales infinitely via CDN.

---

## Sources

- Vercel Documentation: https://vercel.com/docs/frameworks/nextjs
- Next.js Deployment: https://nextjs.org/docs/app/building-your-application/deploying
- Custom Domains: https://vercel.com/docs/concepts/projects/domains

---

*Updated: 2026-03-17 for v1.1 deployment milestone*
