# Architecture

**Analysis Date:** 2026-04-07

## Pattern Overview

**Overall:** Next.js 16 App Router with Server Components

**Key Characteristics:**
- Server-first rendering by default; `'use client'` directive for interactive components
- Static page generation with `generateStaticParams` for dynamic routes
- API routes using Next.js Route Handlers (`route.ts`)
- MDX content rendering via `next-mdx-remote` with `gray-matter` for frontmatter parsing
- Zod schema validation on API endpoints
- Upstash Redis for rate limiting with in-memory fallback

## Layers

**Page Layer:**
- Purpose: Route-level components that compose the page structure
- Location: `app/` directory with App Router convention
- Contains: `page.tsx` files per route, `layout.tsx` for shared layouts
- Depends on: Components, lib utilities
- Used by: Next.js routing system

**Component Layer:**
- Purpose: Reusable UI building blocks, both server and client components
- Location: `app/components/`, `app/*/components/` (co-located), `shared/components/`
- Contains: UI components, schema components, layout components
- Depends on: No internal deps; may depend on lib utilities
- Used by: Pages, layouts, other components

**API Layer:**
- Purpose: Handle form submissions, external integrations
- Location: `app/api/[endpoint]/route.ts`
- Contains: Enquiry API, newsletter API, contact API
- Depends on: `lib/rate-limit.ts`, `zod` for validation, `nodemailer` for email
- Used by: Client-side forms

**Lib Layer:**
- Purpose: Shared utilities and services
- Location: `lib/`, `shared/lib/`
- Contains: Rate limiting, analytics, scroll tracking
- Depends on: External services (Upstash Redis)
- Used by: API routes, components

**Content Layer:**
- Purpose: MDX blog articles with frontmatter
- Location: `content/blog/*.mdx`
- Depends on: `gray-matter` for parsing, `next-mdx-remote` for rendering
- Used by: `app/resources/[slug]/page.tsx`

## Data Flow

**Static Content Flow:**
1. `app/resources/page.tsx` calls `getArticles()` which reads `content/blog/*.mdx`
2. `gray-matter` parses frontmatter (title, date, category, coverImage, etc.)
3. Article list renders with category filtering
4. Individual article: `app/resources/[slug]/page.tsx` uses `generateStaticParams` for static paths
5. `next-mdx-remote/rsc` renders MDX content with remark plugins

**Form Submission Flow:**
1. Client component `EnquiryForm.tsx` collects form data
2. `POST /api/enquiry` route handler validates with Zod schema
3. Rate limit check via `checkRateLimit()` using IP address
4. On success: `nodemailer` sends HTML email via Gmail SMTP
5. CORS headers added to response

**Rate Limiting Flow:**
1. Check if `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured
2. If Redis available: use `Ratelimit.slidingWindow(3, '60 s')`
3. If not configured: in-memory fallback with `Map<string, { count, resetTime }>`

## Key Abstractions

**Schema Components:**
- Purpose: Generate Schema.org structured data for SEO
- Examples: `ArticleSchema.tsx`, `ServiceSchema.tsx`, `FAQSchema.tsx`, `BreadcrumbSchema.tsx`
- Pattern: Render `<script type="application/ld+json">` with JSON-LD data

**MDX Article Rendering:**
- Purpose: Render blog content with custom components
- Location: `app/resources/[slug]/page.tsx`
- Pattern: `MDXRemote` from `next-mdx-remote/rsc` with remark plugins

**Rate Limiting:**
- Purpose: Protect API endpoints from abuse
- Location: `lib/rate-limit.ts`
- Pattern: Identifier-based limiting with sliding window

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page request
- Responsibilities: Font loading (IBM Plex Sans/Serif), metadata, Google Analytics, Schema.org JSON-LD, global CSS

**Homepage:**
- Location: `app/page.tsx`
- Triggers: `GET /`
- Responsibilities: Homepage composition (Navbar, Hero, TwoWaysAccess, HowItWorks, DirectorySection, FAQ, CTABand, Footer)

**Services Page:**
- Location: `app/services/page.tsx`
- Triggers: `GET /services`
- Responsibilities: Service offerings display with Schema.org Service schema

**Resources Page:**
- Location: `app/resources/page.tsx`
- Triggers: `GET /resources`
- Responsibilities: Article listing with category filtering

**Article Page:**
- Location: `app/resources/[slug]/page.tsx`
- Triggers: `GET /resources/[slug]`
- Responsibilities: Individual MDX article rendering with SEO schemas

**Enquiry Page:**
- Location: `app/enquiry/page.tsx`
- Triggers: `GET /enquiry`
- Responsibilities: Multi-step form display

**API Routes:**
- `app/api/enquiry/route.ts`: `POST` handler for enquiry form
- `app/api/newsletter/route.ts`: `POST` handler for newsletter subscription

## Error Handling

**Strategy:** Next.js error boundaries + custom `error.tsx` and `not-found.tsx`

**Patterns:**
- `notFound()` from `next/navigation` for 404s in dynamic routes
- Zod validation errors return 400 with field-specific messages
- Rate limit exceeded returns 429
- Email failures logged but may return success to prevent user-facing errors
- CORS origin validation returns 403

## Cross-Cutting Concerns

**SEO:** Metadata API with dynamic titles/descriptions, OpenGraph, Twitter cards, canonical URLs, Schema.org JSON-LD

**Analytics:** Google Analytics 4 via gtag.js loaded with `afterInteractive` strategy

**Security:** CORS whitelist, XSS prevention via HTML escaping, rate limiting, security headers (HSTS, X-Frame-Options, etc.)

**Validation:** Zod schemas for API input validation

---

*Architecture analysis: 2026-04-07*
