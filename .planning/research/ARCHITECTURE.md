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

## Part 3: SEO Automation Architecture (v1.1)

### Executive Summary

This section outlines the recommended architecture for integrating SEO automation into the existing WAG website (Next.js 14.2 + Tailwind + Vercel). The architecture covers four key pillars: content pipeline, analytics/monitoring, automation workflows, and structured data management.

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SEO Automation Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Content Pipeline│  │  Analytics      │  │ Monitoring  │ │
│  │ (MDX + Scripts) │  │  (Vercel)       │  │ (GSC API)   │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                     │                   │        │
├───────────┴─────────────────────┴───────────────────┴────────┤
│                      Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Pages: /, /services, /about, /resources, /enquiry  │    │
│  │  Components: SEO metadata, Schema.org, Sitemap       │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                       Data Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ MDX Files │  │ Config   │  │ Env Vars │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Sitemap Generator | Auto-generate sitemap.xml and robots.txt | `next-sitemap` package, runs post-build |
| Analytics Collector | Track Web Vitals, page performance | `@vercel/analytics` SDK |
| Schema Manager | Generate and inject JSON-LD structured data | Custom React components |
| Content Pipeline | Process MDX content, generate routes | gray-matter + Next.js dynamic routes |
| Monitoring Service | Fetch GSC data, track rankings | Google Search Console API + GitHub Actions |
| Automation Runner | Schedule SEO tasks, alerts | GitHub Actions scheduled workflows |

### Recommended Project Structure

```
wag/
├── app/
│   ├── api/
│   │   └── seo/
│   │       └── route.ts          # SEO API endpoints (rank tracking)
│   ├── resources/
│   │   └── [slug]/
│   │       └── page.tsx         # Blog posts with SEO metadata
│   ├── components/
│   │   └── seo/
│   │       ├── metadata.tsx     # Dynamic metadata generation
│   │       ├── schema.tsx        # Schema.org JSON-LD components
│   │       └── sitemap.tsx      # Sitemap generation
│   ├── lib/
│   │   ├── seo/
│   │   │   ├── config.ts        # SEO configuration
│   │   │   ├── analytics.ts     # Analytics utilities
│   │   │   └── monitoring.ts     # GSC integration
│   │   └── content.ts           # MDX content processing
│   └── layout.tsx               # Root layout with SEO providers
├── content/
│   └── blog/                    # MDX blog posts
│       └── *.mdx
├── scripts/
│   ├── generate-sitemap.ts      # Standalone sitemap generation
│   ├── fetch-rankings.ts        # GSC ranking fetcher
│   └── seo-audit.ts             # Automated SEO audit
├── .github/
│   └── workflows/
│       ├── seo-monitor.yml      # Scheduled SEO monitoring
│       └── content-deploy.yml  # Content deployment pipeline
├── next-sitemap.config.js       # Sitemap configuration
└── public/
    └── robots.txt                # Generated by next-sitemap
```

### Structural Rationale

- **`app/components/seo/`**: Centralized SEO components for reusability across pages
- **`app/lib/seo/`**: SEO utilities and configuration, separated from UI logic
- **`scripts/`**: Standalone Node.js scripts for automation tasks (run outside Next.js build)
- **`.github/workflows/`**: GitHub Actions for automated SEO tasks and monitoring
- **`content/blog/`**: MDX content with frontmatter for SEO metadata

### Architectural Patterns

#### Pattern 1: Build-Time Sitemap Generation

**What:** Generate sitemap.xml and robots.txt during the Next.js build process using `next-sitemap`.

**When to use:** Always - this is the foundation for search engine crawling.

**Trade-offs:**
- Pros: Zero runtime overhead, works with static export
- Cons: Requires rebuild for new content (use ISR or on-demand revalidation to mitigate)

**Example:**
```javascript
// next-sitemap.config.js
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.winningadventure.com.au',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: './public',
}
```

```json
// package.json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

#### Pattern 2: Server-Side SEO Metadata

**What:** Generate page metadata (title, description, og:image) dynamically on the server using Next.js App Router's Metadata API.

**When to use:** For all pages with dynamic content or when metadata needs to be computed.

**Trade-offs:**
- Pros: SEO-friendly, no client-side JavaScript needed for metadata
- Cons: Requires server rendering or ISR

**Example:**
```typescript
// app/services/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'China Sourcing Services | Winning Adventure Global',
  description: 'Professional China sourcing and factory verification services...',
  openGraph: {
    title: 'China Sourcing Services',
    description: 'Professional China sourcing...',
    images: ['/og/services.jpg'],
  },
}
```

#### Pattern 3: JSON-LD Schema Components

**What:** Create reusable React components that inject Schema.org structured data as JSON-LD.

**When to use:** For pages that can benefit from rich search results (LocalBusiness, FAQ, Article).

**Trade-offs:**
- Pros: Enables rich snippets in search results, improves CTR
- Cons: Additional development time, requires validation

**Example:**
```typescript
// components/seo/schema/local-business.tsx
'use client'

interface LocalBusinessSchemaProps {
  name: string
  description: string
  url: string
  telephone: string
  email: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo: {
    latitude: number
    longitude: number
  }
  openingHours: string[]
}

export function LocalBusinessSchema({
  name,
  description,
  url,
  telephone,
  email,
  address,
  geo,
  openingHours,
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    url,
    telephone,
    email,
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      ...geo,
    },
    openingHours,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

#### Pattern 4: On-Demand Revalidation for Sitemaps

**What:** Use Next.js ISR (Incremental Static Regeneration) with on-demand revalidation to update sitemaps without full rebuilds.

**When to use:** When content is added frequently and you need sitemaps to reflect changes quickly.

**Trade-offs:**
- Pros: Fast sitemap updates, no full rebuild needed
- Cons: More complex setup, requires API route

**Example:**
```typescript
// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  revalidatePath('/sitemap.xml')
  revalidatePath('/robots.txt')

  return NextResponse.json({ revalidated: true })
}
```

#### Pattern 5: GitHub Actions SEO Monitoring

**What:** Scheduled GitHub Actions workflows that fetch SEO data and send alerts.

**When to use:** For ongoing SEO monitoring, ranking tracking, and automated audits.

**Trade-offs:**
- Pros: Free, integrates with GitHub, can send notifications
- Cons: Limited execution time (6 hours max), rate limits

**Example:**
```yaml
# .github/workflows/seo-monitor.yml
name: SEO Monitor

on:
  schedule:
    - cron: '0 8 * * *'  # Daily at 8 AM
  workflow_dispatch:

jobs:
  ranking-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Fetch GSC Rankings
        run: node scripts/fetch-rankings.js
        env:
          GSC_CLIENT_EMAIL: ${{ secrets.GSC_CLIENT_EMAIL }}
          GSC_PRIVATE_KEY: ${{ secrets.GSC_PRIVATE_KEY }}
          GSC_PROPERTY_URL: ${{ secrets.GSC_PROPERTY_URL }}

      - name: Check for Drops
        run: node scripts/check-ranking-drops.js

      - name: Notify on Issues
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "SEO Alert: Ranking drops detected",
              "blocks": [...]
            }
```

### Data Flow

#### Content Publication Flow

```
[Content Writer]
      │
      ▼
[Create/Edit MDX File]
      │
      ▼
[Git Push] ───────────────┐
      │                    │
      ▼                    ▼
[GitHub Actions]      [Vercel Build]
      │                    │
      │            ┌──────┴──────┐
      │            ▼             ▼
      │    [next-sitemap]   [Next.js Build]
      │            │             │
      └────────────┴─────────────┘
                       │
                       ▼
              [Deploy to Production]
                       │
                       ▼
              [Google Bot Crawls]
```

#### SEO Monitoring Flow

```
[Scheduled Trigger (GitHub Actions)]
              │
              ▼
[Fetch Google Search Console Data]
              │
              ▼
[Compare with Previous Data]
      │              │
      ▼              ▼
[Within Threshold] [Alert Triggered]
      │              │
      ▼              ▼
[Log Results]  [Send Slack/Email Notification]
              │
              ▼
         [Create GitHub Issue]
```

#### Page SEO Data Flow

```
[Page Request]
      │
      ▼
[Next.js Server Component]
      │
      ├──► [Fetch MDX frontmatter]
      │
      ├──► [Generate Metadata]
      │
      ├──► [Generate Schema.org JSON-LD]
      │
      ▼
[Render HTML with SEO tags]
      │
      ▼
[Response to Client/Bot]
```

### Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 pages | Single sitemap.xml, basic monitoring |
| 100-500 pages | Multiple sitemaps (sitemap-index), weekly monitoring |
| 500+ pages | Dedicated SEO microservice, daily API monitoring |

### Scaling Priorities

1. **First bottleneck:** Sitemap generation time
   - Solution: Split into multiple sitemaps by section (/blog/, /services/)

2. **Second bottleneck:** GSC API rate limits
   - Solution: Cache results, use incremental fetches

3. **Third bottleneck:** Build time with large content
   - Solution: Use ISR, on-demand revalidation

### Anti-Patterns

#### Anti-Pattern 1: Client-Side Only SEO

**What people do:** Use JavaScript to set document.title and meta tags after page load.

**Why it's wrong:** Search engine bots may not execute JavaScript, leading to missing metadata in search results.

**Do this instead:** Use Next.js Metadata API for server-side metadata generation.

#### Anti-Pattern 2: Hardcoded Sitemap URLs

**What people do:** Manually maintain a list of URLs in sitemap.xml.

**Why it's wrong:** Error-prone, doesn't scale, easily becomes outdated.

**Do this instead:** Use `next-sitemap` with dynamic route discovery or generate from content source.

#### Anti-Pattern 3: Ignoring Structured Data Validation

**What people do:** Add Schema.org markup without testing in Google Rich Results Test.

**Why it's wrong:** Invalid structured data can result in penalties or removal from rich results.

**Do this instead:** Add validation step in CI/CD pipeline using Google's API.

#### Anti-Pattern 4: No Monitoring After Launch

**What people do:** Set up SEO and forget about it, only checking manually occasionally.

**Why it's wrong:** Rankings change, competitors optimize, issues go undetected.

**Do this instead:** Implement automated monitoring with alerts for significant changes.

### Integration Points

#### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Search Console | REST API with service account | Requires Google Cloud project setup |
| Google Analytics | @vercel/analytics SDK | Already compatible with Vercel |
| Slack | Incoming Webhooks | For alerting on ranking changes |
| Vercel | Native deployment | Automatic on push to master |

#### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| SEO Components ↔ Pages | Props/Context | Pass SEO data via props or context |
| SEO Lib ↔ Content | File system/MDX | Read content for metadata generation |
| GitHub Actions ↔ GSC | API calls | Use service account for authentication |
| Monitoring ↔ Alerts | Webhooks | Send notifications when thresholds breached |

### Integration with Existing WAG Project

#### Modifications to Existing Files

| File | Change Type | Description |
|------|-------------|-------------|
| `package.json` | Modify | Add `next-sitemap`, `@vercel/analytics` |
| `app/layout.tsx` | Modify | Add Analytics component |
| `app/resources/[slug]/page.tsx` | Modify | Add dynamic metadata, schema |
| `app/services/page.tsx` | Modify | Add LocalBusiness schema |
| `app/about/page.tsx` | Modify | Add organization schema |

#### New Files to Create

| File | Purpose |
|------|---------|
| `next-sitemap.config.js` | Sitemap generation config |
| `app/components/seo/schema.tsx` | Reusable schema components |
| `app/lib/seo/config.ts` | SEO settings and defaults |
| `scripts/fetch-rankings.js` | GSC data fetcher |
| `.github/workflows/seo-monitor.yml` | Scheduled monitoring |

#### Build Order

1. Install dependencies: `npm install next-sitemap @vercel/analytics`
2. Create SEO components in `app/components/seo/`
3. Update existing pages with SEO metadata
4. Configure `next-sitemap.config.js`
5. Set up GitHub Actions workflows
6. Configure GSC API access (if using automated monitoring)

---

## Sources

### Vercel Deployment
- Vercel Documentation: https://vercel.com/docs/frameworks/nextjs
- Next.js Deployment: https://nextjs.org/docs/app/building-your-application/deploying
- Custom Domains: https://vercel.com/docs/concepts/projects/domains

### SEO Automation
- [next-sitemap Documentation](https://github.com/iamvishnusankar/next-sitemap) - HIGH confidence
- [Vercel Analytics](https://vercel.com/docs/concepts/analytics) - HIGH confidence
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - HIGH confidence
- [Schema.org](https://schema.org/docs/schemas.html) - HIGH confidence
- [Google Search Console API](https://developers.google.com/search-console) - HIGH confidence
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - HIGH confidence
- [Yoast JSON-LD Guide](https://yoast.com/json-ld/) - MEDIUM confidence

---

*Updated: 2026-03-18 for v1.1 SEO automation milestone*
