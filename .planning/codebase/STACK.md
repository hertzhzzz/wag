# Technology Stack

**Analysis Date:** 2026-03-11

## Languages

**Primary:**
- TypeScript 5 - Core web application development

**Secondary:**
- Not applicable

## Runtime

**Environment:**
- Node.js 20 (LTS)
- Next.js 14.2 App Router

**Package Manager:**
- npm (via package-lock.json)
- Version: Lockfile present at `web/frontend/package-lock.json`

## Frameworks

**Core:**
- Next.js 14.2.0 - React framework with App Router
- React 18 - UI library
- Tailwind CSS 3.4.0 - Styling framework

**Testing:**
- Not detected (no test framework configured)

**Build/Dev:**
- ESLint 8.57.1 - Linting
- PostCSS 8 - CSS processing
- Autoprefixer 10.4.27 - CSS vendor prefixes

## Key Dependencies

**Critical:**
- next 14.2.0 - React framework
- react 18 - React library
- react-dom 18 - React DOM renderer
- zod 4.3.6 - Schema validation
- lucide-react 0.575.0 - Icon library

**Media & Visualization:**
- remotion 4.0.429 - Video animations
- @remotion/player 4.0.429 - Video player
- @remotion/animation-utils 4.0.429 - Animation utilities
- echarts 6.0.0 - Charts
- echarts-for-react 3.0.6 - React ECharts wrapper
- react-globe.gl 2.37.0 - 3D globe visualization
- three-globe (transpiled via globe.gl) - Three.js globe

**Content Management:**
- next-mdx-remote 6.0.0 - MDX rendering
- gray-matter 4.0.3 - Frontmatter parsing
- remark 15.0.0 - Markdown processor
- remark-gfm 4.0.1 - GitHub Flavored Markdown
- remark-html 16.0.0 - HTML output

**Email:**
- nodemailer 8.0.1 - Email sending
- resend 6.9.3 - Email API (available but not actively used)

**Data:**
- csv-parse 6.1.0 - CSV parsing

## Configuration

**Environment:**
- `.env.local` - Local environment variables
- Configured via process.env in code

**Build:**
- `web/frontend/next.config.js` - Next.js configuration
- `web/frontend/tailwind.config.ts` - Tailwind CSS config
- `web/frontend/tsconfig.json` - TypeScript config
- `web/frontend/postcss.config.js` - PostCSS config

**Path Aliases:**
```json
{
  "@/*": ["./app/*"],
  "@/lib/*": ["./lib/*"]
}
```

## Platform Requirements

**Development:**
- Node.js 20+
- npm
- Port 3000 (main app), 3001 (admin)

**Production:**
- Node.js runtime
- Deployment: Not specified (static export capable via Next.js)

---

*Stack analysis: 2026-03-11*
