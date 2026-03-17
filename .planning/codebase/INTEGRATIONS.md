# External Integrations

**Analysis Date:** 2026-03-16

## APIs & External Services

**Content Management:**
- MDX + gray-matter - Local file-based blog/content system
  - Content stored in: `frontend/content/blog/`
  - Frontmatter parsing via gray-matter 4.0.3
  - Rendering via next-mdx-remote 6.0.0
  - Markdown processing via remark + remark-gfm

**Email:**
- Gmail (via nodemailer) - Transactional email for enquiry form
  - Implementation: `frontend/app/api/enquiry/route.ts`
  - Auth: `GMAIL_USER`, `GMAIL_APP_PASSWORD` env vars
  - Note: resend package is installed but not actively used
  - Newsletter: `frontend/app/api/newsletter/route.ts` (stub, logs to console)

**Visualization:**
- Unsplash - Image hosting for Next.js Image component
  - Configuration: `frontend/next.config.js`
  - Domain: images.unsplash.com

## Data Storage

**Database:**
- Supabase (PostgreSQL) - For chinafactory sub-project
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` env var
  - Auth key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` env var
  - Client: @supabase/supabase-js (installed but not in frontend package.json)
  - Implementation: `web/chinafactory/lib/supabase.ts`

**Database Schema (chinafactory):**
- factories - Factory information table
- quote_requests - Quote request tracking
- industries - Industry lookup table
- certifications - Certification lookup table

**File Storage:**
- Local filesystem only
- No cloud storage integration detected

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: via @supabase/supabase-js
  - Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Used by: chinafactory sub-project

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- console.error for errors in API routes

## CI/CD & Deployment

**Hosting:**
- Vercel - configured via `frontend/vercel.json`

**CI Pipeline:**
- None detected (using Vercel's built-in CI)

## Environment Configuration

**Required env vars:**
- `GMAIL_USER` - Gmail account for sending enquiry emails
- `GMAIL_APP_PASSWORD` - Gmail app password for SMTP auth
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (chinafactory)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (chinafactory)

**Secrets location:**
- `frontend/.env.local` - Frontend env vars
- `.telegram_bot/.env` - Telegram bot credentials

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- Enquiry form submission: POST to `/api/enquiry`
  - Sends HTML email via Gmail SMTP

---

*Integration audit: 2026-03-16*
