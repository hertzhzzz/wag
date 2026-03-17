# STACK.md - Technology Stack

**Analysis Date:** 2026-03-17

## Languages & Runtime

| Category | Technology |
|----------|------------|
| Language | TypeScript 5.x |
| Runtime | Node.js |
| Framework | Next.js 14.2 (App Router) |

## Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.2.0 | React framework |
| react | 18 | UI library |
| tailwindcss | 3.4.0 | Styling |
| typescript | 5.x | Type safety |

## Key Dependencies

| Package | Purpose |
|---------|---------|
| nodemailer | Gmail SMTP for enquiry form |
| resend | Email service (listed but NOT actively used) |
| gray-matter | Parse MDX frontmatter |
| next-mdx-remote | Render MDX content |
| react-globe.gl | 3D globe visualization |
| echarts | Charts (listed but not actively used) |
| remotion | Video animations (listed but not actively used) |
| zod | Schema validation for API routes |
| lucide-react | Icons |

## Dev Dependencies

| Package | Purpose |
|---------|---------|
| @playwright/test | E2E testing (present but not configured) |
| @tailwindcss/typography | Prose styling |
| eslint-config-next | Linting |
| postcss | CSS processing |

## Configuration

**Path Aliases** (tsconfig.json):
- `@/*` → `./app/*`
- `@/lib/*` → `./lib/*`

**Custom Tailwind Colors:**
- navy: #0F2D5E
- amber: #F59E0B

**Fonts:**
- IBM Plex Sans
- IBM Plex Serif

---

*Technology stack analysis: 2026-03-17*
