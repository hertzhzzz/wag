# Architecture & Implementation Decisions

**Project:** Winning Adventure Global (WAG)
**Domain:** B2B Sourcing/Consulting Service Website
**Researched:** 2026-03-20
**Confidence:** MEDIUM

## Executive Summary

WAG 作为一个 B2B 采购咨询服务网站，其技术架构需要在SEO表现、转化率优化和潜在客户追踪之间取得平衡。基于研究，最佳实践包括：采用 Next.js App Router 实现服务端渲染以提升SEO，使用结构化数据增强搜索可见性，通过清晰的转化路径设计提升询盘表单提交率，以及部署全面的分析追踪系统来衡量营销效果。

## Recommended Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN (Vercel Edge)                    │
├─────────────────────────────────────────────────────────────┤
│                     Next.js 16 App Router                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  Home   │  │Services │  │  About  │  │Enquiry  │       │
│  │  (/)    │  │/services│  │ /about  │  │/enquiry │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │            │            │            │             │
│  ┌────┴────────────┴────────────┴────────────┴────┐       │
│  │              Server Components                  │       │
│  │     (Static Generation + ISR for performance)   │       │
│  └─────────────────────┬───────────────────────────┘       │
│                        │                                    │
│  ┌─────────────────────┴───────────────────────────┐       │
│  │              API Routes (Route Handlers)          │       │
│  │   /api/enquiry    /api/newsletter                 │       │
│  └─────────────────────┬───────────────────────────┘       │
│                        │                                    │
│  ┌─────────────────────┴───────────────────────────┐       │
│  │           Third-party Integrations               │       │
│  │   Nodemailer  │  Upstash Redis  │  Google Analytics│       │
│  └───────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Page Structure

| Page | Purpose | Rendering Strategy | Key Conversion Element |
|------|---------|-------------------|----------------------|
| `/` | 品牌展示 + 价值主张 | SSG (Static) | 服务概述 CTA |
| `/services` | 服务详情 | SSG + ISR | 服务卡片 CTA |
| `/about` | 信任建立 | SSG | 团队/资质展示 |
| `/resources` | 博客/资讯 | SSG (Dynamic) | Newsletter 订阅 |
| `/enquiry` | 询盘表单 | SSR (for rate limiting) | 核心转化点 |

## SEO Strategy

### On-Page SEO Implementation

**Next.js Metadata API for SEO:**

```typescript
// app/services/page.tsx
export const metadata = {
  title: 'China Factory Sourcing Services | Winning Adventure Global',
  description: 'Expert China sourcing solutions for Australian businesses. Verified manufacturers, factory visits, and quality control services.',
  keywords: ['China sourcing', 'factory visits Australia', 'supplier verification', 'manufacturing China'],
  openGraph: {
    title: 'China Factory Sourcing Services',
    description: 'Connect with verified Chinese manufacturers',
    type: 'website',
  },
};
```

### Technical SEO Checklist

| Item | Implementation | Status |
|------|----------------|--------|
| Meta tags | Next.js Metadata API | Required |
| Canonical URLs | Metadata API `alternates.canonical` | Required |
| robots.txt | `app/robots.ts` | Required |
| sitemap.xml | `app/sitemap.ts` | Required |
| Structured data | JSON-LD for Service/Organization | Required |
| hreflang | If multilingual needed | Future |
| Core Web Vitals | Image optimization, font loading | Ongoing |

### Local SEO (Australia Market)

For B2B sourcing targeting Australian businesses:

1. **Google Business Profile** - Claim and optimize (future)
2. **Local keywords** - "Australia China sourcing", "Australian importer China"
3. **Location signals** - Australian hosting consideration (Vercel Edge handles this)
4. **Local citations** - Industry directories, trade associations

### B2B-Specific SEO Keywords

| Keyword Type | Examples | Target Pages |
|--------------|----------|-------------|
| Service | "China sourcing agent", "factory visit China" | /services |
| Industry | "Australia manufacturing China", "import from China Australia" | /, /about |
| Problem | "find reliable China supplier", "China manufacturer verification" | /services |
| Location | "China sourcing Australia", "Australian company China manufacturing" | / |

### Content Strategy for SEO

1. **Service pages** - Comprehensive service descriptions with keywords
2. **Blog/Resources** - Industry insights, China sourcing guides (content-driven SEO)
3. **Case studies** - Success stories with client permission
4. **FAQ section** - Common questions targeting search queries

## Conversion Optimization

### Conversion Path Design

```
┌──────────────────────────────────────────────────────────┐
│                    Conversion Funnel                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Awareness          Interest          Decision          │
│  ┌────────┐        ┌────────┐        ┌────────┐        │
│  │  Home  │───────▶│Services │──────▶│Enquiry │        │
│  │  Page  │        │  Page   │        │  Form  │        │
│  └────────┘        └────────┘        └────────┘        │
│       │                                    │            │
│       │              ┌────────┐            │            │
│       └─────────────▶│ About  │◀───────────┘            │
│                       │  Page  │   Trust building         │
│                       └────────┘                         │
│                                                          │
│                      Action                              │
│                    ┌────────┐                            │
│                    │ Submit │                            │
│                    │ Form   │                            │
│                    └────────┘                            │
└──────────────────────────────────────────────────────────┘
```

### CTA Placement Strategy

| Page | Primary CTA | Secondary CTA | CTA Text |
|------|------------|--------------|----------|
| Home | Above fold | After hero | "Start Your Sourcing Journey" |
| Services | Each service card | Bottom of page | "Get a Quote" |
| About | After trust signals | Bottom | "Contact Us" |
| Enquiry | Form submit | - | "Submit Enquiry" |

### Form Optimization

**Enquiry Form Best Practices:**

1. **Minimal fields** - Name, Email, Company, Message (avoid over-collection)
2. **Clear labels** - No placeholder-as-label pattern
3. **Validation feedback** - Inline, real-time
4. **Trust signals** - Privacy note, response time expectation
5. **Submit button** - Action-oriented, "Send Enquiry" not "Submit"

```typescript
// app/enquiry/page.tsx form fields
const formFields = [
  { name: 'name', label: 'Your Name', type: 'text', required: true },
  { name: 'email', label: 'Email Address', type: 'email', required: true },
  { name: 'company', label: 'Company Name', type: 'text', required: false },
  { name: 'message', label: 'How can we help?', type: 'textarea', required: true },
];
```

### Trust Signals for B2B

| Element | Placement | Purpose |
|---------|-----------|---------|
| Years in business | Home, About | Credibility |
| Service scope | Home, Services | Clarity |
| Process description | Services | Manage expectations |
| Contact information | All pages | Accessibility |
| Privacy assurance | Enquiry form | Anxiety reduction |

## Analytics & Tracking

### Recommended Tracking Stack

| Tool | Purpose | Implementation |
|------|---------|---------------|
| Google Analytics 4 | Traffic, behavior, conversions | gtag.js or Next.js Analytics |
| Google Search Console | SEO performance | DNS verification |
| Conversion tracking | Form submissions | GA4 events |
| Heatmaps (optional) | UX insights | Hotjar/Clarity (future) |

### GA4 Event Tracking Setup

```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

// Usage in components
trackEvent('enquiry_form_submit', {
  method: 'website',
  location: 'enquiry_page',
});
```

### Key Events to Track

| Event | Trigger | Goal |
|-------|---------|------|
| `page_view` | Page load | Default GA4 |
| `enquiry_form_view` | Enquiry page visit | Conversion funnel |
| `enquiry_form_start` | First field focus | Form engagement |
| `enquiry_form_submit` | Form submission | Primary conversion |
| `enquiry_form_error` | Validation error | Form optimization |
| `newsletter_signup` | Newsletter submit | Secondary conversion |
| `cta_click` | CTA button click | Engagement |
| `service_view` | Service page view | Interest signals |

### Conversion Measurement

```typescript
// app/api/enquiry/route.ts - Track conversion on successful submission
export async function POST(request: Request) {
  // ... form processing

  // After successful submission
  trackEvent('conversion', {
    event_category: 'enquiry',
    event_label: 'form_submit',
  });

  return Response.json({ success: true });
}
```

### Funnel Visualization Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    GA4 Funnel Reports                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Landing          → page_view (homepage)            │
│         │                                                   │
│         ▼                                                   │
│  Step 2: Service Pages    → page_view (/services, /about)   │
│         │                                                   │
│         ▼                                                   │
│  Step 3: Enquiry Page     → page_view (/enquiry)            │
│         │                                                   │
│         ▼                                                   │
│  Step 4: Form Submit      → enquiry_form_submit             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Architecture

### Core Web Vitals Targets

| Metric | Target | Implementation |
|--------|--------|---------------|
| LCP (Largest Contentful Paint) | < 2.5s | Image optimization, SSG |
| FID (First Input Delay) | < 100ms | Minimal client JS |
| CLS (Cumulative Layout Shift) | < 0.1 | Reserved image spaces |
| TTFB (Time to First Byte) | < 600ms | Vercel Edge caching |

### Next.js Optimization Features

| Feature | Implementation | Benefit |
|---------|----------------|---------|
| Image optimization | `next/image` | LCP, CLS |
| Font optimization | `next/font` | CLS, load performance |
| Script loading | `next/script` strategy | FID |
| Static generation | Default for content pages | TTFB, SEO |
| ISR | Blog/Resources pages | Fresh content, performance |
| Edge runtime | API routes if needed | Global latency |

## Security Considerations

| Concern | Mitigation | Implementation |
|---------|-----------|----------------|
| Form spam | Rate limiting + validation | Upstash Redis + Zod |
| Email injection | Input sanitization | Nodemailer security |
| XSS | React's built-in escaping | Default React behavior |
| CSRF | Same-origin checks | Next.js defaults |
| Sensitive data | Environment variables | `.env.local` only |

## Scalability Path

| Scale Stage | Users/Month | Architecture Adjustments |
|-------------|-------------|-------------------------|
| Launch | 0 - 1K | Current: SSG + Vercel |
| Growth | 1K - 10K | Add CDN, consider image CDN |
| Established | 10K - 100K | GA4 advanced, possible A/B testing |
| Enterprise | 100K+ | CRM integration, marketing automation |

## Anti-Patterns to Avoid

### 1. Over-Engineering for B2B Service Site
**Bad:** Setting up complex microservice architecture for a brochure site
**Good:** Simple Next.js monorepo with clear page structure

### 2. Client-Side Heavy Rendering
**Bad:** React SPA with all content loaded via client-side fetch
**Good:** SSG/SSR for content, minimal client JS

### 3. Ignoring Core Web Vitals
**Bad:** Large unoptimized images, render-blocking scripts
**Good:** Image optimization, deferred script loading

### 4. Vanity SEO Without Substance
**Bad:** Keyword stuffing, thin content, no internal linking
**Good:** Quality content, clear information architecture, proper meta tags

### 5. Tracking Without Action
**Bad:** Implementing GA4 but never reviewing data
**Good:** Define metrics, review weekly, iterate

## Sources

| Topic | Source | Confidence |
|-------|--------|------------|
| Next.js SEO | CSDN Blog - Next.js SEO Guide 2025 | MEDIUM |
| B2B Website Trends | 2025 B2B Website Design Trends (CSDN) | MEDIUM |
| B2B Website Structure | Baidu Baike - B2B Research Strategy Report | MEDIUM |
| GA4 Setup | GA4 Official Documentation | HIGH |
| Conversion Optimization | Adobe Blog - Ecommerce CRO | MEDIUM |
| SEO Best Practices | Moz CRO Resources | MEDIUM |

## Open Questions

1. **CRM Integration** - Will a CRM be needed immediately, or manual lead management sufficient?
2. **Marketing Automation** - Email sequences for enquiry follow-ups?
3. **A/B Testing** - Is there a plan for systematic conversion optimization?
4. **International SEO** - Is targeting Chinese keywords (pinyin) worth the investment?
5. **Blog Content Strategy** - Who will own content creation and SEO optimization?

## Recommendations

1. **Phase 1:** Implement GA4 with event tracking before launch
2. **Phase 2:** Add structured data markup (JSON-LD) for services
3. **Phase 3:** Set up Search Console monitoring and monthly SEO reviews
4. **Phase 4:** Consider heatmap tools (Hotjar/Clarity) after initial traffic
5. **Phase 5:** A/B test CTA variations once baseline data exists
