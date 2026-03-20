# Technology Stack

**Analysis Date:** 2026-03-20

## Languages

**Primary:**
- TypeScript 5 - Primary development language for all application code

**Secondary:**
- JavaScript - Used for configuration files (next.config.js, postcss.config.js, tailwind.config.ts)

## Runtime

**Environment:**
- Node.js - Server-side runtime (via Next.js)
- Browser - Client-side execution via Next.js React components

**Package Manager:**
- npm 10.9.0
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.1.7 (App Router) - Full-stack React framework
- React 19.2.4 - UI library

**Styling:**
- Tailwind CSS 3.4 - Utility-first CSS framework
- PostCSS 8 - CSS transformation pipeline
- @tailwindcss/typography 0.5.19 - Typography plugin for Tailwind

**Build/Dev:**
- @next/bundle-analyzer 16.1.7 - Bundle size analysis (enabled via ANALYZE=true)
- ESLint 8.57.1 - Code linting
- eslint-config-next 15.5.13 - Next.js ESLint configuration

**Content:**
- MDX - Markdown with JSX support
- gray-matter 4.0.3 - Frontmatter parsing for MDX files
- next-mdx-remote 6.0.0 - Load MDX content remotely in Next.js
- remark 15.0.0 - Markdown processor
- remark-gfm 4.0.1 - GitHub Flavored Markdown support
- remark-html 16.0.0 - Convert Markdown to HTML

**Data Visualization:**
- ECharts 6.0.0 - Interactive charts library
- echarts-for-react 3.0.6 - React wrapper for ECharts
- react-globe.gl 2.37.0 - 3D interactive globe visualization

**Video Animation:**
- Remotion 4.0.429 - Programmatic video creation using React
- @remotion/animation-utils 4.0.429 - Remotion animation utilities
- @remotion/player 4.0.429 - Video player component
- @remotion/cli 4.0.431 - Remotion command-line interface

**Validation:**
- Zod 4.3.6 - TypeScript-first schema validation

**Email:**
- Nodemailer 8.0.1 - Email sending library
- resend 6.9.3 - Modern email API (available but not actively used)

**Rate Limiting:**
- @upstash/ratelimit 2.0.0 - Rate limiting library
- @upstash/redis 1.34.0 - Redis client for Upstash

**Image Processing:**
- sharp 34.5 - High-performance image processing

**Icons:**
- lucide-react 0.575.0 - Icon library

**Utilities:**
- csv-parse 6.1.0 - CSV parsing library

## Configuration

**TypeScript:**
- `tsconfig.json` - Strict mode enabled, bundler module resolution
- Path aliases: `@/*` maps to `./app/*`, `@/lib/*` maps to `./lib/*`

**Next.js:**
- `next.config.js` - Custom redirects, image optimization, security headers, bundle analyzer
- React Strict Mode: enabled
- Transpiled packages: react-globe.gl, three-globe, globe.gl

**Tailwind:**
- `tailwind.config.ts` - Custom colors (navy: #0F2D5E, amber: #F59E0B), custom fonts (IBM Plex Sans/Serif)
- Custom fonts via CSS variables: `var(--font-ibm-plex-sans)`, `var(--font-ibm-plex-serif)`

**PostCSS:**
- `postcss.config.js` - tailwindcss and autoprefixer plugins

**Path Aliases (tsconfig.json):**
```
@/*        -> ./app/*
@/lib/*    -> ./lib/*
```

**Vercel Deployment:**
- `vercel.json` - Build command: `npm run build`, output directory: `.next`

## Platform Requirements

**Development:**
- Node.js compatible environment
- npm 10.9.0+

**Production:**
- Deployed on Vercel
- Custom domain: winningadventure.com.au (configured)
- Environment variables required (see INTEGRATIONS.md)

---

*Stack analysis: 2026-03-20*
