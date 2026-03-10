# External Integrations

**Analysis Date:** 2026-03-11

## APIs & External Services

**Content Management:**
- MDX + gray-matter - Local file-based blog/content system
  - Content stored in: `web/frontend/content/`
  - Frontmatter parsing via gray-matter
  - Rendering via next-mdx-remote

**Email:**
- Gmail (via nodemailer) - Transactional email for enquiry form
  - Implementation: `web/frontend/app/api/enquiry/route.ts`
  - Auth: `GMAIL_USER`, `GMAIL_APP_PASSWORD` env vars
  - Note: resend package is installed but not actively used

**Visualization:**
- Unsplash - Image hosting for Next.js Image component
  - Configuration: `web/frontend/next.config.js`
  - Domain: images.unsplash.com

## Data Storage

**Database:**
- Supabase (PostgreSQL)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` env var
  - Auth key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` env var
  - Client: @supabase/supabase-js
  - Implementation: `web/chinafactory/lib/supabase.ts`
  - Used by: chinafactory sub-project

**Database Schema:**
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
- console.error for errors
- File-based logs in `.telegram_bot/logs/` for Telegram bot

## CI/CD & Deployment

**Hosting:**
- Not specified

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- `GMAIL_USER` - Gmail account for sending enquiry emails
- `GMAIL_APP_PASSWORD` - Gmail app password for SMTP auth
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

**Secrets location:**
- `web/frontend/.env.local` - Frontend env vars
- `.telegram_bot/.env` - Telegram bot credentials

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- Enquiry form submission: POST to `/api/enquiry`
  - Sends email via Gmail SMTP

---

*Integration audit: 2026-03-11*
