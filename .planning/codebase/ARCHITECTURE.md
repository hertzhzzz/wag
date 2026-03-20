# Architecture

**Analysis Date:** 2026-03-20

## Pattern Overview

**Overall:** Next.js 16 App Router with Server Components

**Key Characteristics:**
- Server Components by default; Client Components (`'use client'`) only when interactivity required
- Metadata-driven SEO with per-page `Metadata` exports
- API Routes handle server-side operations (validation, email, rate limiting)
- MDX-based blog content with `next-mdx-remote`
- Path aliases: `@/*` maps to `app/*`, `@/lib/*` maps to `lib/*`

## Layers

**Pages (Route Handlers):**
- Purpose: Render UI and handle routing
- Location: `app/[page]/page.tsx`
- Contains: Page components that compose shared components
- Depends on: Shared components, data files
- Examples: `app/page.tsx`, `app/services/page.tsx`, `app/about/page.tsx`, `app/resources/page.tsx`, `app/enquiry/page.tsx`

**API Routes:**
- Purpose: Server-side form handling, email delivery, rate limiting
- Location: `app/api/[route]/route.ts`
- Contains: POST handlers with Zod validation, Nodemailer, CORS, rate limiting
- Depends on: `lib/rate-limit.ts`, `zod`, `nodemailer`
- Examples: `app/api/enquiry/route.ts`, `app/api/newsletter/route.ts`

**Shared Components:**
- Purpose: Reusable UI across pages
- Location: `app/components/`
- Contains: Navbar, Footer, Hero, FAQ, CTABand, HowItWorks, Industries, etc.
- Types: Server Components (default) and Client Components (with `'use client'`)
- Examples: `app/components/Navbar.tsx`, `app/components/FAQ.tsx`, `app/components/industries/index.tsx`

**Enquiry-Specific Components:**
- Purpose: Enquiry form and related utilities
- Location: `app/enquiry/components/`, `app/enquiry/EnquiryForm.tsx`
- Contains: Multi-step form with client-side validation
- Note: `EnquiryForm.tsx` is a Client Component (`'use client'`)

**Data Files:**
- Purpose: Static FAQ data for different pages
- Location: `app/data/`
- Contains: TypeScript arrays of FAQ objects
- Examples: `app/data/faqs.ts`, `app/data/faqs-services.ts`, `app/data/faqs-about.ts`

**Library Utilities:**
- Purpose: Rate limiting implementation
- Location: `lib/rate-limit.ts`
- Contains: Upstash Redis rate limiter with in-memory fallback
- Used by: API routes

**Content (Blog):**
- Purpose: MDX blog articles
- Location: `content/blog/*.mdx`
- Contains: gray-matter frontmatter + MDX body
- Rendered by: `app/resources/[slug]/page.tsx` using `next-mdx-remote`

## Data Flow

**Page Rendering:**
1. User requests page (e.g., `/services`)
2. Next.js App Router matches `app/services/page.tsx`
3. Page component imports shared components from `app/components/`
4. Static data imported from `app/data/` for FAQs
5. Page renders server-side, returns HTML

**Form Submission (Enquiry):**
1. User fills `EnquiryForm.tsx` (Client Component)
2. Client posts to `/api/enquiry` with JSON body
3. API route (`app/api/enquiry/route.ts`):
   - Validates origin (CORS)
   - Checks rate limit via `lib/rate-limit.ts`
   - Parses and Zod-validates body
   - Escapes HTML inputs (XSS prevention)
   - Lazy-loads Nodemailer
   - Sends email via Gmail SMTP
   - Returns JSON response
4. Client handles success/error state

**Blog Article Rendering:**
1. User requests `/resources/[slug]`
2. `app/resources/[slug]/page.tsx`:
   - `generateStaticParams()` lists all MDX slugs at build
   - `generateMetadata()` extracts frontmatter for SEO
   - `getArticle()` reads MDX from `content/blog/[slug].mdx`
   - `MDXRemote` renders content with custom components

## Key Abstractions

**Page Component:**
- Pattern: Export default function + `metadata` export
- Example: `app/about/page.tsx` line 23-295

**API Route Handler:**
- Pattern: `export async function POST(request: Request)`
- Validation: Zod schema + manual HTML escaping
- CORS: Hardcoded allowed origins array
- Rate Limiting: Upstash Redis with in-memory fallback

**Client Component:**
- Pattern: `'use client'` directive at top of file
- Example: `app/enquiry/EnquiryForm.tsx` line 1

**FAQ Data:**
- Pattern: TypeScript array of `{ question: string, answer: string }`
- Example: `app/data/faqs.ts`

**MDX Content:**
- Pattern: gray-matter frontmatter + MDX body
- Frontmatter fields: `title`, `date`, `description`, `author`, `category`, `readTime`, `takeaways`, `coverImage`, `ctaTitle`, `ctaText`, `ctaButtonText`

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page request
- Responsibilities: Fonts (IBM Plex Sans/Serif), global metadata, Google Analytics, Schema.org JSON-LD, global styles

**Homepage:**
- Location: `app/page.tsx`
- Triggers: GET `/`
- Responsibilities: Homepage composition with Hero, HowItWorks, Industries, FAQ, CTABand

**Services Page:**
- Location: `app/services/page.tsx`
- Triggers: GET `/services`

**About Page:**
- Location: `app/about/page.tsx`
- Triggers: GET `/about`

**Resources Page:**
- Location: `app/resources/page.tsx`
- Triggers: GET `/resources`
- Note: Reads MDX directory at build time via `fs`

**Resources Article:**
- Location: `app/resources/[slug]/page.tsx`
- Triggers: GET `/resources/[slug]`
- Responsibilities: MDX rendering with custom components, sidebar CTA

**Enquiry Page:**
- Location: `app/enquiry/page.tsx`
- Triggers: GET `/enquiry`
- Note: Delegates to `EnquiryForm.tsx` Client Component

**Enquiry API:**
- Location: `app/api/enquiry/route.ts`
- Triggers: POST `/api/enquiry`
- Responsibilities: Validation, rate limiting, Gmail email delivery

**Newsletter API:**
- Location: `app/api/newsletter/route.ts`
- Triggers: POST `/api/newsletter`
- Responsibilities: Email validation, logging (no actual email service yet)

## Error Handling

**Strategy:** Graceful degradation with error boundaries

**Patterns:**
- API routes return JSON error responses with appropriate HTTP status codes
- Client components display inline error messages (e.g., `errors.submit` in `EnquiryForm.tsx`)
- `notFound()` from `next/navigation` used in dynamic routes for missing content
- Missing API credentials return user-friendly messages (not raw errors)

**Error Pages:**
- `app/not-found.tsx` - Custom 404 page
- `app/error.tsx` - Client-side error boundary

## Cross-Cutting Concerns

**SEO:** Per-page `Metadata` exports with title templates, descriptions, OpenGraph, canonical URLs

**Analytics:** Google Analytics script in `app/layout.tsx` head via `next/script`

**Schema.org:** JSON-LD structured data in root layout for Organization and LocalBusiness

**CORS:** Hardcoded allowed origins in API routes; no runtime configuration

**Rate Limiting:** Upstash Redis with in-memory Map fallback in `lib/rate-limit.ts`

**XSS Prevention:** Manual HTML escaping (`escapeHtml()`) in API routes before email rendering

**Fonts:** IBM Plex Sans and IBM Plex Serif via `next/font/google`

---

*Architecture analysis: 2026-03-20*
