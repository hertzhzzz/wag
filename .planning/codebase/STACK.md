# Technology Stack

**Analysis Date:** 2026-03-16

## Languages

**Primary:**
- TypeScript 5 - Core web application development

**Secondary:**
- CSS (Tailwind) - Styling

## Runtime

**Environment:**
- Node.js (via Next.js)

**Package Manager:**
- npm (via package-lock.json)
- Lockfile: present at `frontend/package-lock.json`

## Frameworks

**Core:**
- Next.js 14.2.0 - React framework with App Router
- React 18 - UI library
- Tailwind CSS 3.4.0 - Styling framework

**Testing:**
- Not detected (no test framework configured)

**Build/Dev:**
- ESLint 8.57.1 - Linting
- TypeScript 5 - Type checking
- PostCSS 8 - CSS processing
- Autoprefixer 10.4.27 - CSS vendor prefixes
- @tailwindcss/typography 0.5.19 - Prose plugin for markdown

## Key Dependencies

**Critical:**
| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.2.0 | React framework |
| react | 18 | UI library |
| react-dom | 18 | React DOM renderer |
| zod | 4.3.6 | Schema validation |
| lucide-react | 0.575.0 | Icon library |

**Media & Visualization:**
| Package | Version | Purpose |
|---------|---------|---------|
| remotion | 4.0.429 | Video animations |
| @remotion/player | 4.0.429 | Video player |
| @remotion/animation-utils | 4.0.429 | Animation utilities |
| echarts | 6.0.0 | Charts |
| echarts-for-react | 3.0.6 | React ECharts wrapper |
| react-globe.gl | 2.37.0 | 3D globe visualization |

**Content Management:**
| Package | Version | Purpose |
|---------|---------|---------|
| next-mdx-remote | 6.0.0 | MDX rendering |
| gray-matter | 4.0.3 | Frontmatter parsing |
| remark | 15.0.0 | Markdown processor |
| remark-gfm | 4.0.1 | GitHub Flavored Markdown |
| remark-html | 16.0.0 | HTML output |

**Email:**
| Package | Version | Purpose |
|---------|---------|---------|
| nodemailer | 8.0.1 | Email sending (Gmail SMTP) |
| resend | 6.9.3 | Email API (installed but not actively used) |

**Data:**
| Package | Version | Purpose |
|---------|---------|---------|
| csv-parse | 6.1.0 | CSV parsing |

## Configuration

**Environment:**
- `.env.local` - Local environment variables (contains Supabase + Resend + Gmail credentials)
- Not committed to version control (see `.gitignore`)

**Build:**
- `frontend/next.config.js` - Next.js configuration
- `frontend/tailwind.config.ts` - Tailwind CSS config
- `frontend/tsconfig.json` - TypeScript config
- `frontend/postcss.config.js` - PostCSS config
- `frontend/vercel.json` - Vercel deployment config

**Path Aliases:**
```json
{
  "@/*": ["./app/*"],
  "@/lib/*": ["./lib/*"]
}
```

## Platform Requirements

**Development:**
- Node.js
- npm
- Port 3000 (main app), 3001 (admin)

**Production:**
- Node.js runtime
- Deployment: Vercel (configured via `vercel.json`)

---

*Stack analysis: 2026-03-16*
