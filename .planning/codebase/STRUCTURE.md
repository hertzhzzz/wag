# Codebase Structure

**Analysis Date:** 2026-03-11

## Directory Layout

```
wag/
├── CLAUDE.md                    # Project instructions for Claude
├── web/
│   └── frontend/
│       ├── app/                 # Next.js App Router
│       │   ├── page.tsx         # Home page (/)
│       │   ├── layout.tsx       # Root layout
│       │   ├── error.tsx       # Error boundary
│       │   ├── not-found.tsx   # 404 page
│       │   ├── sitemap.ts      # Sitemap generator
│       │   ├── services/       # Services page (/services)
│       │   ├── about/          # About page (/about)
│       │   ├── resources/      # Blog list (/resources)
│       │   │   └── [slug]/     # Dynamic blog post (/resources/[slug])
│       │   ├── enquiry/        # Enquiry form (/enquiry)
│       │   ├── api/            # API routes
│       │   │   ├── enquiry/   # POST /api/enquiry
│       │   │   └── newsletter/  # POST /api/newsletter
│       │   ├── data/           # Static data files
│       │   └── components/     # Page-specific components
│       │       └── industries/ # Industry-specific components
│       ├── content/            # MDX blog content
│       │   └── blog/           # Blog posts (.mdx files)
│       ├── shared/             # Shared code (unused)
│       │   ├── components/
│       │   ├── lib/
│       │   └── styles/
│       ├── lib/                # Utility functions (empty)
│       ├── public/             # Static assets
│       ├── package.json        # Dependencies
│       ├── tsconfig.json       # TypeScript config
│       ├── tailwind.config.ts  # Tailwind config
│       ├── next.config.js      # Next.js config
│       └── .env.local          # Environment variables
└── docs/                       # Documentation
```

## Directory Purposes

**app/ (Next.js App Router):**
- Purpose: All routes and pages
- Contains: page.tsx files for each route, layout.tsx, API routes, components
- Key files: `layout.tsx`, `page.tsx`, `error.tsx`, `not-found.tsx`

**app/components/ (Page Components):**
- Purpose: Reusable UI components used by pages
- Contains: Navbar, Footer, Hero, StatsBar, FAQ, CTABand, HowItWorks, Coverage, FoundingClients, CalendlyEmbed, FAQSchema, ResourcesContent
- Key files: `Navbar.tsx`, `Footer.tsx`, `Hero.tsx`, `FAQ.tsx`, `Industries.tsx`

**app/components/industries/ (Industry Components):**
- Purpose: Industry-specific UI components
- Contains: Components for different industry verticals

**app/api/ (API Routes):**
- Purpose: Server-side API endpoints
- Contains: Route handlers for enquiry and newsletter
- Key files: `app/api/enquiry/route.ts`, `app/api/newsletter/route.ts`

**app/services/, app/about/, app/resources/, app/enquiry/ (Page Routes):**
- Purpose: Individual page routes
- Contains: page.tsx for each route, metadata.ts for SEO

**content/blog/ (MDX Content):**
- Purpose: Blog posts and articles
- Contains: `.mdx` files with frontmatter
- Pattern: Filename = URL slug, frontmatter = metadata

## Key File Locations

**Entry Points:**
- `web/frontend/app/layout.tsx`: Root HTML layout with fonts, metadata, analytics
- `web/frontend/app/page.tsx`: Home page

**Configuration:**
- `web/frontend/app/layout.tsx`: Global layout and metadata
- `web/frontend/tailwind.config.ts`: Tailwind CSS configuration
- `web/frontend/next.config.js`: Next.js configuration
- `web/frontend/tsconfig.json`: TypeScript configuration

**Core Logic:**
- `web/frontend/app/api/enquiry/route.ts`: Enquiry form API handler
- `web/frontend/app/resources/page.tsx`: Blog listing with gray-matter parsing
- `web/frontend/app/enquiry/page.tsx`: Multi-step enquiry form with validation

**Components:**
- `web/frontend/app/components/Navbar.tsx`: Navigation bar
- `web/frontend/app/components/Footer.tsx`: Footer
- `web/frontend/app/components/Hero.tsx`: Hero section
- `web/frontend/app/components/FAQ.tsx`: FAQ accordion

## Naming Conventions

**Files:**
- Components: PascalCase (`Navbar.tsx`, `Hero.tsx`, `FAQ.tsx`)
- Pages: `page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`
- API Routes: `route.ts`
- Dynamic Routes: `[slug]/page.tsx`
- Styles: `globals.css`
- Config: camelCase/kebab-case (`tailwind.config.ts`, `next.config.js`)

**Directories:**
- Routes: kebab-case (`services`, `about`, `resources`, `enquiry`)
- Components: PascalCase or kebab-case depending on usage
- API: kebab-case (`enquiry`, `newsletter`)

**Types/Variables:**
- Functions: camelCase (`getArticles`, `handleSubmit`, `validateStep1`)
- Constants: PascalCase for components, UPPER_SNAKE for env vars

## Where to Add New Code

**New Feature Page:**
- Implementation: `web/frontend/app/[feature]/page.tsx`
- Metadata: `web/frontend/app/[feature]/metadata.ts` (optional, can inline)
- Components: `web/frontend/app/components/` or co-located

**New Component:**
- Reusable: `web/frontend/app/components/ComponentName.tsx`
- Page-specific: `web/frontend/app/[page]/components/ComponentName.tsx`

**New API Endpoint:**
- Implementation: `web/frontend/app/api/[endpoint]/route.ts`
- Validation: Use Zod schema
- Error handling: Try/catch with appropriate responses

**New Blog Post:**
- Content: `web/frontend/content/blog/[slug].mdx`
- Frontmatter: title, date, category, description, author

**Utilities/Lib Functions:**
- Location: `web/frontend/lib/` (currently empty)
- Pattern: Export utility functions, import with `@/lib/*`

## Special Directories

**content/blog/:**
- Purpose: MDX blog posts
- Generated: No (manually authored)
- Committed: Yes (version controlled)

**public/:**
- Purpose: Static assets (images, favicon)
- Generated: No
- Committed: Yes

**.next/:**
- Purpose: Next.js build output
- Generated: Yes (on build)
- Committed: No (.gitignored)

**node_modules/:**
- Purpose: Dependencies
- Generated: Yes (npm install)
- Committed: No (.gitignored)

---

*Structure analysis: 2026-03-11*
