# Architecture

**Analysis Date:** 2026-03-16

## Pattern Overview

**Overall:** Next.js 14 App Router with Server-First Component Architecture

**Key Characteristics:**
- Server Components by default, client components only when interactivity required
- File-based routing using Next.js App Router conventions
- API routes as serverless functions via Next.js Route Handlers
- MDX-based content management for blog/resources

## Layers

**UI Layer (Pages):**
- Purpose: Render pages and coordinate components
- Location: `frontend/app/`
- Contains: Page components (Home, Services, About, Resources, Enquiry)
- Depends on: Components layer
- Used by: Next.js routing

**Components Layer:**
- Purpose: Reusable UI components
- Location: `frontend/app/components/`
- Contains: Navbar, Footer, Hero, StatsBar, FAQ, CTABand, Industries, HowItWorks, etc.
- Depends on: Shared styles, Tailwind utilities
- Used by: Pages

**API Layer:**
- Purpose: Backend request handling
- Location: `frontend/app/api/`
- Contains: Route handlers (enquiry, newsletter)
- Depends on: Zod validation, nodemailer
- Used by: Client-side forms

**Content Layer:**
- Purpose: Blog/resource content management
- Location: `frontend/content/blog/`
- Contains: MDX files with frontmatter
- Depends on: gray-matter for parsing
- Used by: Resources pages

**Configuration Layer:**
- Purpose: Global settings and metadata
- Location: `frontend/app/layout.tsx`, `frontend/app/*.tsx` (metadata exports)
- Contains: Root layout, fonts, SEO metadata, schema.org markup

## Data Flow

**Static Page Rendering:**

1. User requests page (e.g., `/services`)
2. Next.js matches route to `app/services/page.tsx`
3. Server component reads content/data
4. Components render with Tailwind styles
5. HTML sent to browser

**Dynamic Route (Resources):**

1. User requests `/resources/china-supplier-guide`
2. Next.js matches route to `app/resources/[slug]/page.tsx`
3. Server reads corresponding `.mdx` file from `content/blog/`
4. Parses frontmatter with gray-matter
5. Renders content as React components

**Form Submission:**

1. User submits enquiry form (client component)
2. POST request to `/api/enquiry`
3. Route handler validates with Zod schema
4. HTML escaping for XSS prevention
5. Sends email via nodemailer (Gmail SMTP)
6. Returns JSON response to client

## Key Abstractions

**Server Component:**
- Default component type in Next.js App Router
- Examples: `app/page.tsx`, `app/services/page.tsx`, `app/about/page.tsx`
- Pattern: Async function components without 'use client'

**Client Component:**
- When interactivity required (forms, state, effects)
- Example: `app/components/Navbar.tsx` (has mobile menu state)
- Pattern: `'use client'` directive at top of file

**Route Handler:**
- API endpoints in Next.js
- Examples: `app/api/enquiry/route.ts`, `app/api/newsletter/route.ts`
- Pattern: Export async function named after HTTP method (GET, POST)

**Dynamic Route:**
- Parameterized page routes
- Examples: `app/resources/[slug]/page.tsx`
- Pattern: Folder name in square brackets, `params` prop provides slug

## Entry Points

**Root Layout:**
- Location: `frontend/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: HTML shell, fonts (IBM Plex Sans/Serif), metadata, SEO, schema.org JSON-LD, Google Analytics

**Home Page:**
- Location: `frontend/app/page.tsx`
- Triggers: GET `/`
- Responsibilities: Hero section, stats bar, industries, how it works, FAQ, CTA

**API Routes:**
- Location: `frontend/app/api/*/route.ts`
- Triggers: POST requests to `/api/enquiry`, `/api/newsletter`
- Responsibilities: Form validation, email sending, error handling

## Error Handling

**Strategy:** Next.js built-in error boundaries + custom error pages

**Patterns:**
- `app/error.tsx` - React error boundary for runtime errors
- `app/not-found.tsx` - 404 page
- Zod validation in API routes with detailed error responses
- Try/catch in async handlers with error logging
- HTML escaping for XSS prevention in user input

## Cross-Cutting Concerns

**SEO/Metadata:** Exported `metadata` object in each page.tsx using Next.js Metadata API

**Validation:** Zod schemas in API route handlers (`app/api/enquiry/route.ts`)

**Email:** nodemailer with lazy loading to avoid SSR issues

**External Scripts:** Google Analytics loaded with `next/script` using `afterInteractive` strategy

**Fonts:** Google Fonts via `next/font/google` with CSS variables

---

*Architecture analysis: 2026-03-16*
