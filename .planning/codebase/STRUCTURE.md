# Codebase Structure

**Analysis Date:** 2026-03-17

## Directory Layout

```
wag/
├── frontend/                     # Next.js 14 App Router project
│   ├── app/                     # App Router pages and components
│   │   ├── page.tsx            # Home page (/)
│   │   ├── layout.tsx          # Root layout
│   │   ├── error.tsx          # Error boundary
│   │   ├── not-found.tsx      # 404 page
│   │   ├── sitemap.ts         # Dynamic sitemap
│   │   ├── about/             # About page (/about)
│   │   │   ├── page.tsx
│   │   │   └── metadata.ts
│   │   ├── services/          # Services page (/services)
│   │   │   ├── page.tsx
│   │   │   └── metadata.ts
│   │   ├── resources/        # Blog listing (/resources)
│   │   │   ├── page.tsx
│   │   │   ├── metadata.ts
│   │   │   └── [slug]/       # Dynamic blog posts
│   │   │       └── page.tsx
│   │   ├── enquiry/          # Enquiry form (/enquiry)
│   │   │   ├── page.tsx      # 'use client' form
│   │   │   ├── layout.tsx
│   │   │   ├── metadata.ts
│   │   │   └── components/   # Form-specific components
│   │   │       ├── KeyboardAwareInput.tsx
│   │   │       └── KeyboardAwareTextarea.tsx
│   │   ├── api/              # API Route Handlers
│   │   │   ├── enquiry/route.ts
│   │   │   └── newsletter/route.ts
│   │   ├── components/       # Shared components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── CTABand.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Coverage.tsx
│   │   │   ├── AnnouncementBar.tsx
│   │   │   ├── CalendlyEmbed.tsx
│   │   │   ├── FAQSchema.tsx
│   │   │   ├── FoundingClients.tsx
│   │   │   ├── ResourcesContent.tsx
│   │   │   └── industries/    # Industry-specific components
│   │   │       ├── index.tsx
│   │   │       ├── IndustryCard.tsx
│   │   │       ├── FeaturedPanel.tsx
│   │   │       ├── MoreIndustries.tsx
│   │   │       └── types.ts
│   │   └── data/             # Static data
│   │       └── faqs.ts
│   ├── content/              # MDX blog content
│   │   └── blog/
│   │       └── *.mdx         # Blog articles
│   ├── public/               # Static assets
│   ├── lib/                  # Utility libraries (empty)
│   ├── shared/               # Shared code (empty)
│   ├── tests/                # Test files
│   ├── scripts/              # Build/maintenance scripts
│   ├── next.config.js       # Next.js config
│   ├── tailwind.config.ts   # Tailwind config
│   ├── tsconfig.json        # TypeScript config
│   ├── package.json
│   └── postcss.config.js
├── config/                   # Project configuration
├── docs/                     # Documentation
└── .planning/                # GSD planning documents
```

## Directory Purposes

- **frontend/app/:** Next.js App Router - all pages, layouts, API routes, and components
- **frontend/app/components/:** Reusable UI components - Navbar, Footer, Hero, etc.
- **frontend/app/api/:** API Route Handlers - backend endpoints for forms
- **frontend/content/blog/:** MDX blog posts - markdown content files with frontmatter
- **frontend/public/:** Static assets - images, fonts, favicons

## Key File Locations

### Entry Points
- `frontend/app/layout.tsx`: Root layout, HTML structure, fonts, analytics
- `frontend/app/page.tsx`: Homepage

### Configuration
- `frontend/next.config.js`: Next.js configuration
- `frontend/tailwind.config.ts`: Design tokens (navy, amber colors)
- `frontend/package.json`: Dependencies

### Core Logic
- `frontend/app/api/enquiry/route.ts`: Enquiry form handler with Zod validation
- `frontend/app/api/newsletter/route.ts`: Newsletter subscription (stub)
- `frontend/app/enquiry/page.tsx`: Multi-step form with validation
- `frontend/app/resources/[slug]/page.tsx`: MDX blog post renderer

### Testing
- `frontend/tests/`: Playwright test files

## Naming Conventions

### Files
- PascalCase: Components (Navbar.tsx, FAQ.tsx)
- kebab-case: Pages with dynamic routes ([slug]/page.tsx)
- camelCase: Utilities, hooks

### Directories
- kebab-case: Page routes (about/, services/, resources/)
- camelCase: Component groups (components/, api/)

## Where to Add New Code

### New Page
- Create directory in `frontend/app/[pagename]/`
- Add `page.tsx` with default export
- Optional: Add `metadata.ts` for page metadata

### New Component
- Add to appropriate location in `frontend/app/components/`
- Server Component by default, `'use client'` only if needed

### New API Endpoint
- Create route file in `frontend/app/api/[endpoint]/route.ts`
- Export handlers (GET, POST, etc.)

### New Blog Post
- Add MDX file to `frontend/content/blog/[slug].mdx`
- Include frontmatter (title, description, date, category)

---

*Structure analysis: 2026-03-17*
