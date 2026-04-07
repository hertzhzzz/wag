# Technology Stack

**Analysis Date:** 2026-04-07

## Languages

**Primary:**
- TypeScript 5 - Primary language for all application code

**Secondary:**
- JavaScript (ES2017) - Legacy support via `allowJs: true` in tsconfig

## Runtime

**Environment:**
- Node.js (version managed by npm 10.9.0)

**Package Manager:**
- npm 10.9.0
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.1.7 (App Router) - React framework for full-stack web application
- React 19.2.4 - UI library

**Styling:**
- Tailwind CSS 3.4.0 - Utility-first CSS framework
- @tailwindcss/typography 0.5.19 - Prose styling for MDX content

**Content:**
- next-mdx-remote 6.0.0 - MDX content rendering
- gray-matter 4.0.3 - Frontmatter parsing
- remark 15.0.0 + remark-gfm 4.0.1 + remark-html 16.0.0 - Markdown processing

## Key Dependencies

**Email:**
- nodemailer 8.0.1 - Email sending via Gmail SMTP
- resend 6.9.3 - Alternative email service (installed but not actively used)

**Rate Limiting:**
- @upstash/ratelimit 2.0.0 - Redis-based rate limiting
- @upstash/redis 1.34.0 - Redis client for Upstash

**Validation:**
- zod 4.3.6 - Schema-based validation

**Visualization:**
- echarts 6.0.0 + echarts-for-react 3.0.6 - Charts and data visualization
- leaflet 1.9.4 + leaflet.markercluster 1.5.3 - Interactive maps
- react-globe.gl 2.37.0 - 3D globe visualization

**Animation & Media:**
- remotion 4.0.429 + @remotion/animation-utils 4.0.429 + @remotion/player 4.0.429 - Video animation
- sharp 0.34.5 - Image optimization

**Utilities:**
- lucide-react 0.575.0 - Icon library
- csv-parse 6.1.0 - CSV parsing
- react 19.2.4 / react-dom 19.2.4

## Build & Dev Tools

**Bundler:**
- Next.js built-in (webpack-based)
- @next/bundle-analyzer 16.1.7 - Bundle size analysis

**Testing:**
- @playwright/test 1.58.2 - E2E testing framework

**Linting:**
- eslint 8.57.1
- eslint-config-next 15.5.13

**Type Checking:**
- TypeScript 5 (tsconfig.json with strict mode enabled)

**CSS Processing:**
- postcss 8 - CSS transformation
- autoprefixer 10.4.27 - Vendor prefix automation

## Configuration Files

**Build:**
- `next.config.js` - Next.js configuration (bundle analyzer, redirects, image domains, security headers)
- `tsconfig.json` - TypeScript configuration (strict mode, path aliases `@/*` and `@/lib/*`)
- `tailwind.config.ts` - Tailwind CSS with custom colors (navy, amber) and IBM Plex fonts
- `postcss.config.js` - PostCSS with Tailwind and Autoprefixer
- `vercel.json` - Vercel deployment configuration

**Path Aliases:**
- `@/*` maps to `./app/*`
- `@/lib/*` maps to `./lib/*`

## Platform Requirements

**Development:**
- Node.js compatible environment
- npm 10.9.0+
- Two dev servers: `npm run dev` (port 3000) and `npm run dev:admin` (port 3001)

**Production:**
- Deployment target: Vercel
- Node.js runtime on Vercel
- Environment variables required (see INTEGRATIONS.md)

---

*Stack analysis: 2026-04-07*
