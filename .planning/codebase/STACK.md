# Technology Stack

**Analysis Date:** 2026-04-07

## Languages

**Primary:**
- TypeScript 5 - Primary development language for all application code
- JavaScript - Limited use, primarily for configuration files

## Runtime

**Environment:**
- Node.js 20+ (specified in devDependencies @types/node)
- Next.js 16.1.7 (React 19.2.4 as peer dependency)

**Package Manager:**
- npm 10.9.0 (specified via packageManager field)
- Lockfile: `package-lock.json` (implicit with npm)

## Frameworks

**Core:**
- Next.js 16.1.7 (App Router) - Primary application framework
- React 19.2.4 - UI library
- Tailwind CSS 3.4 - Styling framework
- @tailwindcss/typography 0.5.19 - Typography plugin for Tailwind

**Data Processing:**
- next-mdx-remote 6.0.0 - MDX content rendering
- remark 15.0.0 + remark-gfm 4.0.1 + remark-html 16.0.0 - Markdown processing
- gray-matter 4.0.3 - Frontmatter parsing for MDX

**Visualization:**
- ECharts 6.0.0 - Charts and data visualization
- echarts-for-react 3.0.6 - React wrapper for ECharts
- leaflet 1.9.4 - Interactive maps
- leaflet.markercluster 1.5.3 - Marker clustering for Leaflet
- react-globe.gl 2.37.0 - 3D globe visualization
- Remotion 4.0.429 - Video animation framework

**Forms & Validation:**
- Zod 4.3.6 - Schema-based validation

**Email:**
- Nodemailer 8.0.1 - Email sending via SMTP
- Resend 6.9.3 - Alternative email service (installed but not visibly used in API routes)

**Image Processing:**
- Sharp 0.34.5 - Image optimization

**Rate Limiting:**
- @upstash/ratelimit 2.0.0 - Redis-based rate limiting
- @upstash/redis 1.34.0 - Redis client for Upstash

**Utilities:**
- csv-parse 6.1.0 - CSV parsing
- lucide-react 0.575.0 - Icon library

**Testing:**
- Playwright 1.58.2 - E2E testing framework
- @playwright/test - Playwright test runner

**Build & Analysis:**
- @next/bundle-analyzer 16.1.7 - Bundle size analysis
- @remotion/cli 4.0.431 - Remotion command-line tools

**Development:**
- ESLint 8.57.1 - Code linting
- eslint-config-next 15.5.13 - Next.js ESLint configuration
- PostCSS 8 - CSS processing

## Configuration

**Build:**
- `next.config.js` - Next.js configuration with bundle analyzer, image domains, redirects, security headers
- `tailwind.config.ts` - Tailwind CSS configuration with custom colors (navy, amber) and fonts (IBM Plex Sans/Serif)
- `postcss.config.js` - PostCSS configuration for Tailwind and Autoprefixer
- `tsconfig.json` - TypeScript configuration with path aliases (@/* -> app/*, @/lib/* -> lib/*)

**Path Aliases:**
- `@/*` maps to `./app/*`
- `@/lib/*` maps to `./lib/*`

**Security Headers (via next.config.js):**
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## Platform Requirements

**Development:**
- Node.js 20+
- npm 10.9.0

**Production:**
- Vercel (inferred from deployment workflow and next.config.js)
- Environment: Next.js App Router deployment

---

*Stack analysis: 2026-04-07*
