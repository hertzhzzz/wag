# Technology Stack

**Analysis Date:** 2026-03-17

## Languages & Runtime

- **Language:** TypeScript 5.x
- **Runtime:** Node.js 20.x
- **Package Manager:** npm with package-lock.json

## Core Frameworks

- **Framework:** Next.js 14.2 (App Router)
- **Styling:** Tailwind CSS 3.4
- **Testing:** Playwright 1.58.2

## Key Dependencies

### UI & Components
- `react` ^18.x - UI library
- `lucide-react` - Icons
- `clsx`, `tailwind-merge` - Class utilities

### Content & MDX
- `next-mdx-remote` - MDX rendering
- `gray-matter` - Frontmatter parsing

### Data & Validation
- `zod` ^4.3.6 - Schema validation (NOTE: v4.x is experimental)
- `@supabase/supabase-js` - Database client (installed but not actively used)

### Email
- `nodemailer` - Gmail SMTP for enquiry form
- `resend` ^6.9.3 - Email SDK (installed but not integrated)

### Visualization
- `echarts` - Charts
- `react-globe.gl` - 3D globe
- `@remotion/*` - Video animation

### Deployment
- `vercel` - Deployment platform

## Configuration Files

- `frontend/package.json` - Dependencies
- `frontend/tsconfig.json` - TypeScript config with path aliases
- `frontend/next.config.js` - Next.js config
- `frontend/tailwind.config.ts` - Tailwind with navy/amber colors, IBM Plex fonts
- `frontend/.eslintrc.json` - ESLint (extends next/core-web-vitals)
- `frontend/playwright.config.ts` - E2E testing config
- `frontend/vercel.json` - Vercel deployment (Node 20.x)
- `frontend/postcss.config.js` - PostCSS config
- `frontend/.env.local` - Environment variables

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `GMAIL_USER` - Gmail address for nodemailer
- `GMAIL_APP_PASSWORD` - Gmail app password
- `RESEND_API_KEY` - Resend API key (not currently used)

---

*Stack analysis: 2026-03-17*
