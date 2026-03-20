# Codebase Structure

**Analysis Date:** 2026-03-20

## Directory Layout

```
/Users/mark/Projects/wag/
├── app/                      # Next.js App Router (main application code)
├── content/blog/             # MDX blog articles
├── lib/                      # Shared utility modules
├── public/                   # Static assets (images, favicons)
├── shared/                   # (Legacy/shared code, minimal use)
├── config/                   # Configuration files
├── .planning/                # GSD planning documents
├── .milestones/              # Milestone tracking
├── .claude/                  # Claude project config
├── docs/                     # Documentation
├── node_modules/             # Dependencies
├── package.json              # Dependencies manifest
├── tsconfig.json             # TypeScript config with path aliases
└── tailwind.config.ts        # Tailwind CSS config
```

## Directory Purposes

**app/ (Main Application):**
- Purpose: Next.js App Router with all pages, API routes, and shared components
- Contains: Page components, API routes, shared components, data files, enquiry-specific components

**app/components/ (Shared UI):**
- Purpose: Reusable UI components across multiple pages
- Contains: Navbar, Footer, Hero, FAQ, CTABand, HowItWorks, Industries, StatsBar, ResourcesContent, Coverage, CalendlyEmbed, FoundingClients, AnnouncementBar, ServiceSchema, FAQSchema

**app/components/industries/ (Industry Components):**
- Purpose: Industry-specific display components
- Contains: `index.tsx`, `IndustryCard.tsx`, `FeaturedPanel.tsx`, `MoreIndustries.tsx`

**app/api/ (API Routes):**
- Purpose: Server-side endpoints
- Contains: `app/api/enquiry/route.ts`, `app/api/newsletter/route.ts`

**app/data/ (Static Data):**
- Purpose: TypeScript data for FAQ content
- Contains: `faqs.ts`, `faqs-services.ts`, `faqs-about.ts`

**app/enquiry/ (Enquiry Feature):**
- Purpose: Enquiry page and form components
- Contains: `page.tsx`, `layout.tsx`, `EnquiryForm.tsx`, `components/`

**app/enquiry/components/ (Form Utilities):**
- Purpose: Keyboard-aware input components for mobile form UX
- Contains: `KeyboardAwareInput.tsx`, `KeyboardAwareTextarea.tsx`

**app/resources/ (Blog System):**
- Purpose: Resources listing and article pages
- Contains: `page.tsx` (listing), `resources/[slug]/page.tsx` (article)

**content/blog/ (MDX Articles):**
- Purpose: Blog content as MDX files with gray-matter frontmatter
- Contains: `*.mdx` files

**lib/ (Utilities):**
- Purpose: Shared library modules
- Contains: `lib/rate-limit.ts` (Upstash Redis + in-memory fallback)

**public/ (Static Assets):**
- Purpose: Publicly served static files
- Contains: `logo.png`, `favicon.ico`, `og-image.jpg`, `hero-image.webp`, `robots.txt`, `sitemap.xml`

**shared/ (Legacy):**
- Purpose: Previously shared code now largely unused
- Contains: Empty `styles/`, `components/`, `lib/` subdirectories

## Key File Locations

**Entry Points:**
- `app/page.tsx` - Homepage
- `app/layout.tsx` - Root layout (fonts, metadata, analytics, Schema.org)
- `app/services/page.tsx` - Services page
- `app/about/page.tsx` - About page
- `app/resources/page.tsx` - Resources/blog listing
- `app/resources/[slug]/page.tsx` - Individual blog article
- `app/enquiry/page.tsx` - Enquiry page
- `app/enquiry/EnquiryForm.tsx` - Enquiry form (Client Component)

**API Routes:**
- `app/api/enquiry/route.ts` - POST /api/enquiry (enquiry form submission)
- `app/api/newsletter/route.ts` - POST /api/newsletter (newsletter signup)

**Shared Components:**
- `app/components/Navbar.tsx` - Navigation bar (Client Component)
- `app/components/Footer.tsx` - Footer
- `app/components/FAQ.tsx` - FAQ accordion component
- `app/components/FAQSchema.tsx` - FAQ JSON-LD schema
- `app/components/Hero.tsx` - Homepage hero section
- `app/components/CTABand.tsx` - Call-to-action band
- `app/components/HowItWorks.tsx` - How-it-works section
- `app/components/industries/index.tsx` - Industries grid

**Data Files:**
- `app/data/faqs.ts` - Homepage FAQs
- `app/data/faqs-services.ts` - Services page FAQs
- `app/data/faqs-about.ts` - About page FAQs

**Utilities:**
- `lib/rate-limit.ts` - Rate limiting (Redis + in-memory fallback)

**Configuration:**
- `tsconfig.json` - Path aliases (`@/*` → `app/*`, `@/lib/*` → `lib/*`)
- `tailwind.config.ts` - Tailwind theme tokens (Navy: #0F2D5E, Amber: #F59E0B)
- `package.json` - Dependencies

## Naming Conventions

**Files:**
- Page files: `page.tsx`
- Layout files: `layout.tsx`
- API route files: `route.ts`
- Component files: `PascalCase.tsx` (e.g., `Navbar.tsx`, `HowItWorks.tsx`)
- Data files: `kebab-case.ts` (e.g., `faqs-services.ts`)
- Utility files: `camelCase.ts` (e.g., `rate-limit.ts`)

**Directories:**
- Pages/routes: `kebab-case` (e.g., `app/services/`, `app/resources/`)
- Components: `PascalCase` or `kebab-case` depending on context
- Dynamic routes: `[slug]`

**Components:**
- Default export from page/component file
- Named exports for metadata objects

## Where to Add New Code

**New Page:**
- Add `app/[route]/page.tsx` with default export + `metadata` export
- Import shared components from `app/components/`

**New Shared Component:**
- Add to `app/components/` directory
- Follow naming: `ComponentName.tsx`
- Default to Server Component (no `'use client'` unless needed)

**New Client Component:**
- Add `'use client'` at top of file
- Use for: forms, interactive UI, hooks, event listeners

**New API Route:**
- Add `app/api/[route]/route.ts` with `POST`/`GET` handlers
- Use Zod for validation, `lib/rate-limit.ts` for rate limiting
- Add CORS headers for allowed origins

**New FAQ Data:**
- Add to `app/data/` directory
- Export array of `{ question: string, answer: string }`

**New Blog Article:**
- Add MDX file to `content/blog/[slug].mdx`
- Include gray-matter frontmatter: `title`, `date`, `description`, `author`, `category`, `readTime`, `takeaways`, `ctaTitle`, `ctaText`, `ctaButtonText`

**New Utility:**
- Add to `lib/` directory (for backend/shared utilities)
- Or add to `app/[feature]/` for feature-specific utilities

## Special Directories

**content/blog/:**
- Purpose: MDX blog articles
- Generated: No (committed to git)
- Contains: 9 MDX files as of analysis

**lib/:**
- Purpose: Shared utilities
- Generated: No
- Contains: `rate-limit.ts` only

**public/:**
- Purpose: Static assets served directly
- Generated: No (except possibly optimized images)
- Contains: Logos, favicons, og-image, hero image, robots.txt, sitemap.xml

**shared/:**
- Purpose: Legacy shared code (largely unused)
- Generated: No
- Note: Directories present but minimal content

**config/mcporter.json:**
- Purpose: MCP Porter configuration for external tools

---

*Structure analysis: 2026-03-20*
