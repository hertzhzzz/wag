# Architecture

**Analysis Date:** 2026-03-17

## Pattern Overview

**Overall:** Next.js 14 App Router with Server Components

**Key Characteristics:**
- Server-first architecture: components render on server by default, `'use client'` added only when interactivity is needed
- File-based routing: routes defined by directory structure in `app/`
- API routes: backend endpoints created as Route Handlers in `app/api/`
- Static content: MDX-based blog system with `next-mdx-remote` for dynamic article rendering

## Layers

### Presentation Layer (Pages)
- Location: `frontend/app/`
- Contains: Route pages (`page.tsx`), layouts (`layout.tsx`), metadata exports
- Depends on: Component layer
- Used by: Next.js routing

### Component Layer
- Location: `frontend/app/components/`
- Contains: Reusable UI components (Navbar, Footer, Hero, FAQ, etc.)
- Depends on: Third-party UI libraries (lucide-react), Tailwind CSS
- Used by: Pages, layouts

### Data/Content Layer
- Location: `frontend/content/blog/`, `frontend/app/data/`
- Contains: MDX blog posts, static data arrays (faqs.ts)
- Depends on: gray-matter (MDX parsing), fs module
- Used by: Resource pages, components

### API Layer
- Location: `frontend/app/api/`
- Contains: Route handlers for enquiry form, newsletter
- Depends on: Zod (validation), nodemailer (email)
- Used by: Client-side forms

### Configuration Layer
- Location: `frontend/` root
- Contains: next.config.js, tailwind.config.ts, tsconfig.json
- Defines: Build configuration, design tokens, TypeScript settings

## Data Flow

### Static Page Request
1. User requests `/about`
2. Next.js matches route to `app/about/page.tsx`
3. Page component (Server Component) renders
4. Navbar and Footer components imported and render
5. HTML returned to browser

### Dynamic Resource Request
1. User requests `/resources/china-factory-tour-guide`
2. Next.js matches route to `app/resources/[slug]/page.tsx`
3. `generateStaticParams()` provides static paths at build time
4. Server component reads MDX file from `content/blog/`
5. `gray-matter` parses frontmatter and content
6. `MDXRemote` renders MDX content with custom components
7. Static HTML returned

### Form Submission Flow
1. User submits enquiry form (`app/enquiry/page.tsx`)
2. Client-side `'use client'` component handles form state
3. POST request to `/api/enquiry`
4. Zod validates request body
5. HTML escaping prevents XSS
6. nodemailer sends email via Gmail SMTP
7. JSON response returned to client

## Key Abstractions

### MDX Blog System
- Purpose: Dynamic blog articles from markdown files
- Examples: `frontend/app/resources/page.tsx`, `frontend/app/resources/[slug]/page.tsx`
- Pattern: File-system based content with frontmatter metadata

### Enquiry Form
- Purpose: Multi-step form with validation and email notification
- Examples: `frontend/app/enquiry/page.tsx`, `frontend/app/api/enquiry/route.ts`
- Pattern: Client state management with API route backend

### Component Library
- Purpose: Reusable UI elements with consistent styling
- Examples: `frontend/app/components/Navbar.tsx`, `frontend/app/components/Footer.tsx`
- Pattern: Server Components by default, `'use client'` for interactivity

## Entry Points

### Root Layout
- Location: `frontend/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: HTML structure, fonts (IBM Plex), Google Analytics, Schema.org JSON-LD

### Home Page
- Location: `frontend/app/page.tsx`
- Triggers: Request to `/`
- Responsibilities: Compose homepage from Hero, StatsBar, Industries, HowItWorks, FAQ components

### API Routes
- `frontend/app/api/enquiry/route.ts`: POST handler for enquiry form submissions
- `frontend/app/api/newsletter/route.ts`: POST handler for newsletter signups

## Error Handling

**Strategy:** Next.js built-in error boundaries + custom error pages

**Patterns:**
- `app/error.tsx`: Global error boundary for runtime errors
- `app/not-found.tsx`: Custom 404 page
- API routes: Try-catch with NextResponse.error() returns
- Form validation: Zod schema validation with error responses

## Cross-Cutting Concerns

- **SEO/Metadata:** Each page exports `metadata: Metadata` object
- **Fonts:** Google Fonts via next/font/google (IBM Plex Sans, IBM Plex Serif)
- **Styling:** Tailwind CSS with custom design tokens (navy: #0F2D5E, amber: #F59E0B)
- **Analytics:** Google Analytics 4 via Script component
- **Schema.org:** Organization and LocalBusiness JSON-LD in root layout

---

*Architecture analysis: 2026-03-17*
