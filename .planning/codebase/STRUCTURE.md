# Codebase Structure

**Analysis Date:** 2026-04-07

## Directory Layout

```
wag/
├── app/                    # Next.js App Router (main application)
│   ├── api/               # API route handlers
│   ├── components/        # Shared React components
│   ├── data/              # FAQ data files
│   ├── enquiry/           # Enquiry page + form components
│   ├── resources/         # Blog/resources pages
│   ├── services/          # Services page
│   ├── about/             # About page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── lib/                   # Shared utilities
├── content/              # MDX blog content
│   └── blog/*.mdx        # Article files
├── shared/               # Cross-project shared code
├── public/               # Static assets
├── social/               # Social media content (not deployed)
└── .claude/              # Claude configuration and skills
```

## Directory Purposes

**app/ (Main Application):**
- Purpose: All Next.js pages, components, API routes
- Contains: Route pages, layouts, API handlers, shared components

**app/components/ (Shared Components):**
- Purpose: Reusable UI components across the application
- Contains: Navbar, Footer, Hero, FAQ, CTABand, schemas, DirectorySection, HowItWorks, TwoWaysAccess, etc.
- Key files: `Navbar.tsx`, `Footer.tsx`, `Hero.tsx`, `FAQ.tsx`, `ResourcesContent.tsx`

**app/components/DirectorySection/ (Subdirectory with Co-located Files):**
- Purpose: Factory directory map feature
- Contains: `DirectoryMap.tsx`, `DirectoryMapInner.tsx`, `CityList.tsx`, `FilterTabs.tsx`, `index.tsx`, `types.ts`, `data/`

**app/components/industries/ (Subdirectory):**
- Purpose: Industry-specific components

**app/api/ (API Routes):**
- Purpose: Handle form submissions and external integrations
- Contains: `enquiry/route.ts`, `newsletter/route.ts`, `contact/route.ts`

**app/enquiry/ (Enquiry Feature):**
- Purpose: Enquiry form page and related components
- Contains: `page.tsx`, `EnquiryForm.tsx`, `components/` (KeyboardAwareInput, KeyboardAwareTextarea)

**app/resources/ (Blog/Resources Feature):**
- Purpose: Article listing and individual article pages
- Contains: `page.tsx` (listing), `[slug]/page.tsx` (individual articles), `faq/`, `metadata.ts`

**app/resources/[slug]/ (Dynamic Route):**
- Purpose: Individual article rendering
- Contains: `page.tsx`, `ReadingProgressBar`, `BackToTopButton`, `ShareButtons`, `ArticleNavigation`, `article-utils.ts`, `mdx-components.tsx`, `how-to-data.ts`, `types.ts`

**app/data/ (Static Data):**
- Purpose: FAQ data exports
- Contains: `faqs.ts`, `faqs-services.ts`

**lib/ (Utilities):**
- Purpose: Shared non-UI logic
- Contains: `rate-limit.ts`, `analytics.ts`, `useScrollDepth.ts`

**shared/ (Cross-Project):**
- Purpose: Code shared between wag and other projects
- Contains: `components/`, `lib/`, `styles/`

**content/blog/ (MDX Content):**
- Purpose: Blog article content with frontmatter
- Contains: `*.mdx` files with frontmatter (title, date, description, author, tags, category, coverImage)

**public/ (Static Assets):**
- Purpose: Static files served directly
- Contains: Images, fonts, favicon, social media assets

**social/ (Social Media Content - NOT deployed):**
- Purpose: Content for LinkedIn, X, Facebook posts
- Contains: `linkedin-post/`, `x-post/`, `facebook-post/` directories with `publish-preview.html` files

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout with fonts, metadata, Google Analytics, Schema.org data
- `app/page.tsx`: Homepage (`/`)
- `app/services/page.tsx`: Services page (`/services`)
- `app/about/page.tsx`: About page (`/about`)
- `app/resources/page.tsx`: Resources listing (`/resources`)
- `app/resources/[slug]/page.tsx`: Article page (`/resources/[slug]`)
- `app/enquiry/page.tsx`: Enquiry form page (`/enquiry`)

**Configuration:**
- `next.config.js`: Next.js configuration with redirects, image patterns, security headers
- `package.json`: Dependencies including Next.js 16.1, React 19, Tailwind CSS 3.4

**API Routes:**
- `app/api/enquiry/route.ts`: POST handler for enquiry form submission
- `app/api/newsletter/route.ts`: POST handler for newsletter subscription
- `app/api/contact/route.ts`: Contact form handler

**Core Logic:**
- `lib/rate-limit.ts`: Rate limiting with Redis and in-memory fallback
- `app/resources/[slug]/article-utils.ts`: MDX article loading utilities
- `app/resources/page.tsx`: Article listing with gray-matter parsing

**Testing:**
- `app/components/DirectorySection/DirectoryMap.test.tsx`
- `app/components/DirectorySection/DirectoryMapBug.test.tsx`

## Naming Conventions

**Files:**
- Components: PascalCase (`Navbar.tsx`, `Hero.tsx`, `FAQ.tsx`)
- Page routes: `page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`
- API routes: `route.ts`
- Utilities: camelCase (`rate-limit.ts`, `analytics.ts`)
- Data files: camelCase or kebab-case (`faqs.ts`, `faqs-services.ts`)
- Test files: `*.test.tsx`, `*.spec.tsx`

**Components:**
- PascalCase for function components (`function Navbar() {}`)
- Props interfaces: `PascalCaseProps` (`interface NavbarProps`)

**Directories:**
- Pages/routes: kebab-case (`enquiry`, `resources`, `api`)
- Feature directories: PascalCase or kebab-case depending on convention
- Sub-components: Often same as parent (`DirectorySection/`)

## Where to Add New Code

**New Page:**
- Create directory under `app/` (e.g., `app/new-page/`)
- Add `page.tsx` inside the directory
- Add `metadata.ts` for SEO metadata (optional)
- Route automatically accessible at `/new-page`

**New Shared Component:**
- Primary: `app/components/NewComponent.tsx`
- Export from `app/components/index.ts` if exists
- Use PascalCase for component name

**New API Route:**
- Create `app/api/new-endpoint/route.ts`
- Export `GET`, `POST`, `PUT`, `DELETE` handlers as needed
- Use Zod for validation, `checkRateLimit` for rate limiting

**New MDX Article:**
- Add `.mdx` file to `content/blog/`
- Include required frontmatter: `title`, `date`, `description`, `author`, `tags`
- Optional: `category`, `coverImage`, `readTime`, `takeaways`, `ctaTitle`, `ctaText`, `ctaButtonText`

**New Utility:**
- Shared utility: `lib/new-utility.ts`
- Component utility: Co-locate in component directory
- Export with explicit TypeScript types

**New FAQ Data:**
- Add to `app/data/faqs.ts` or create new `app/data/faqs-[feature].ts`
- Export array of `{ question: string, answer: string }` objects

**New Schema Component:**
- Create `app/components/SchemaName.tsx`
- Render `<script type="application/ld+json">` with JSON.stringify
- Import and use in page `layout.tsx` or page component

## Special Directories

**content/blog/:**
- Purpose: MDX article content
- Generated: No (manually authored)
- Committed: Yes (git-tracked content)
- Note: Files here are deployed to Vercel

**social/:**
- Purpose: Social media post content and previews
- Generated: May contain generated content
- Committed: Yes
- Note: NOT deployed to Vercel (content center only)

**public/social/:**
- Purpose: Social media images
- Generated: Yes (AI-generated images)
- Committed: Yes
- Note: Only source of truth for social images

**shared/:**
- Purpose: Cross-project code sharing
- Generated: No
- Committed: Yes
- Note: Used by multiple projects

---

*Structure analysis: 2026-04-07*
