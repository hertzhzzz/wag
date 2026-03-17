# Directory Structure

**Analysis Date:** 2026-03-16

## Directory Layout

```
wag/
├── CLAUDE.md                    # Project instructions for Claude
├── frontend/                   # Next.js frontend application
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Homepage (/)
│   │   ├── layout.tsx          # Root layout
│   │   ├── error.tsx           # Error boundary
│   │   ├── not-found.tsx       # 404 page
│   │   ├── sitemap.ts          # Sitemap generator
│   │   ├── globals.css          # Global Tailwind styles
│   │   ├── about/
│   │   │   └── page.tsx        # About page (/about)
│   │   ├── services/
│   │   │   └── page.tsx        # Services page (/services)
│   │   ├── resources/
│   │   │   ├── page.tsx        # Blog listing (/resources)
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Dynamic blog post (/resources/[slug])
│   │   ├── enquiry/
│   │   │   ├── layout.tsx      # Enquiry layout
│   │   │   └── page.tsx        # Contact form (/enquiry)
│   │   ├── api/
│   │   │   ├── enquiry/
│   │   │   │   └── route.ts    # POST /api/enquiry
│   │   │   └── newsletter/
│   │   │       └── route.ts    # POST /api/newsletter
│   │   ├── data/
│   │   │   └── faqs.ts         # Static FAQ data
│   │   ├── services/
│   │   │   └── metadata.ts     # Page metadata (optional)
│   │   └── components/         # UI components
│   │       ├── Navbar.tsx      # Client component: mobile menu
│   │       ├── Footer.tsx
│   │       ├── Hero.tsx
│   │       ├── StatsBar.tsx
│   │       ├── HowItWorks.tsx
│   │       ├── FAQ.tsx
│   │       ├── CTABand.tsx
│   │       ├── Coverage.tsx
│   │       ├── FoundingClients.tsx
│   │       ├── CalendlyEmbed.tsx
│   │       ├── FAQSchema.tsx
│   │       ├── ResourcesContent.tsx
│   │       └── industries/
│   │           ├── index.tsx
│   │           ├── IndustryCard.tsx
│   │           ├── FeaturedPanel.tsx
│   │           ├── MoreIndustries.tsx
│   │           └── types.ts
│   ├── content/
│   │   └── blog/              # MDX blog posts
│   │       ├── australia-china-sourcing-guide.mdx
│   │       ├── bulk-procurement-china-guide.mdx
│   │       ├── china-business-travel-guide-2026.mdx
│   │       ├── china-factory-tour-guide.mdx
│   │       ├── how-to-inspect-factories-china.mdx
│   │       └── verify-chinese-supplier.mdx
│   ├── public/                 # Static assets (images, favicon)
│   ├── shared/                 # Shared code (currently empty)
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   ├── lib/                    # Utility functions (currently empty)
│   ├── scripts/                # Build scripts
│   │   └── compile-hero.sh
│   ├── package.json            # Dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── tailwind.config.ts      # Tailwind config
│   ├── next.config.js          # Next.js config
│   ├── postcss.config.js       # PostCSS config
│   ├── vercel.json             # Vercel deployment config
│   ├── .env.local              # Environment variables (secret)
│   └── README.md
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
- Key files: `Navbar.tsx`, `Footer.tsx`, `Hero.tsx`, `FAQ.tsx`

**app/components/industries/ (Industry Components):**
- Purpose: Industry-specific UI components
- Contains: Components for different industry verticals
- Types: `types.ts` defines TypeScript interfaces

**app/api/ (API Routes):**
- Purpose: Server-side API endpoints
- Contains: Route handlers for enquiry and newsletter
- Key files: `app/api/enquiry/route.ts`, `app/api/newsletter/route.ts`

**app/about/, app/services/, app/resources/, app/enquiry/ (Page Routes):**
- Purpose: Individual page routes
- Contains: page.tsx for each route

**content/blog/ (MDX Content):**
- Purpose: Blog posts and articles
- Contains: `.mdx` files with frontmatter
- Pattern: Filename = URL slug, frontmatter = metadata

## Key File Locations

**Entry Points:**
- `frontend/app/layout.tsx`: Root HTML layout with fonts, metadata, analytics
- `frontend/app/page.tsx`: Home page

**Configuration:**
- `frontend/app/layout.tsx`: Global layout and metadata
- `frontend/tailwind.config.ts`: Tailwind CSS configuration
- `frontend/next.config.js`: Next.js configuration
- `frontend/tsconfig.json`: TypeScript configuration

**Core Logic:**
- `frontend/app/api/enquiry/route.ts`: Enquiry form API handler with Zod validation
- `frontend/app/resources/page.tsx`: Blog listing with gray-matter parsing
- `frontend/app/enquiry/page.tsx`: Contact form with validation

**Components:**
- `frontend/app/components/Navbar.tsx`: Navigation bar (client component)
- `frontend/app/components/Footer.tsx`: Footer
- `frontend/app/components/Hero.tsx`: Hero section
- `frontend/app/components/FAQ.tsx`: FAQ accordion

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
- Implementation: `frontend/app/[feature]/page.tsx`
- Components: `frontend/app/components/` or co-located

**New Component:**
- Reusable: `frontend/app/components/ComponentName.tsx`
- Page-specific: `frontend/app/[page]/components/ComponentName.tsx`

**New API Endpoint:**
- Implementation: `frontend/app/api/[endpoint]/route.ts`
- Validation: Use Zod schema
- Error handling: Try/catch with appropriate responses

**New Blog Post:**
- Content: `frontend/content/blog/[slug].mdx`
- Frontmatter: title, date, category, description, author

**Utilities/Lib Functions:**
- Location: `frontend/lib/` (currently empty)
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

**shared/:**
- Purpose: Intended for shared code but currently empty
- Contains: `components/`, `lib/`, `styles/` subdirectories (all empty)

---

*Structure analysis: 2026-03-16*
