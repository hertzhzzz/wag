# External Integrations

**Analysis Date:** 2026-03-20

## APIs & External Services

**Email Delivery:**
- Gmail SMTP (Nodemailer) - Enquiry form email delivery
  - Implementation: `app/api/enquiry/route.ts` uses `nodemailer` with Gmail service
  - Auth: `GMAIL_USER` and `GMAIL_APP_PASSWORD` environment variables
  - Fallback: Returns error if credentials not configured

- Resend - Modern email API (available but not actively integrated)
  - Package: `resend@6.9.3` installed
  - Status: Not currently used in codebase (see TODO in newsletter route)

**Newsletter:**
- Mailchimp/ConvertKit/Resend - Planned integration
  - Current status: Placeholder implementation in `app/api/newsletter/route.ts`
  - TODO comment: "TODO: Integrate with email service (e.g., Mailchimp, ConvertKit, Resend)"

**Image CDN:**
- Unsplash - Remote images for Next.js Image component
  - Configuration: `next.config.js` allows `images.unsplash.com`
  - Used for: Hero images and other visual content

## Data Storage

**Databases:**
- None currently deployed
- Supabase - Planned for future (credentials in `.env.local.example`)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Status: Configured in example but not implemented in codebase

**File Storage:**
- Local filesystem - MDX content stored in `content/blog/`
- Images in `public/` directory

**Caching:**
- In-memory rate limit fallback - `lib/rate-limit.ts`
  - Uses JavaScript Map for storage
  - 3 requests per 60 seconds per IP

## Rate Limiting

**Primary:**
- Upstash Redis - Cloud-based Redis rate limiting
  - Package: `@upstash/ratelimit`, `@upstash/redis`
  - Implementation: `lib/rate-limit.ts`
  - Algorithm: Sliding window (3 requests per 60 seconds)
  - Analytics: Enabled
  - Environment variables: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

**Fallback:**
- In-memory rate limiting - Automatic fallback when Redis unavailable
  - Same limits: 3 requests per 60 seconds per IP

## Authentication & Identity

**Auth Provider:**
- None currently implemented
- Supabase Auth - Planned for future (via Supabase integration)

## Monitoring & Observability

**Error Tracking:**
- Console logging - Primary error reporting
  - Used in API routes for error output
  - Example: `console.error('Email error:', errorMessage)` in `app/api/enquiry/route.ts`

**Logs:**
- Vercel logs - Deployment platform logging
- Console output - Development debugging

## CI/CD & Deployment

**Hosting:**
- Vercel - Primary deployment platform
  - Production URL: https://www.winningadventure.com.au
  - GitHub repo: https://github.com/hertzhzzz/wag
  - Auto-deploy: Enabled (push to master triggers deployment)

**CI Pipeline:**
- Vercel - Automatic builds on git push
- Build command: `npm run build`
- Output directory: `.next`

## Environment Configuration

**Required env vars (for enquiry form):**
- `GMAIL_USER` - Gmail address for SMTP sender
- `GMAIL_APP_PASSWORD` - Gmail App Password (16-character app-specific password)

**Optional env vars (for rate limiting):**
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

**Available but unused (from .env.local.example):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

**Secrets location:**
- `.env.local` - Local environment (not committed to git)
- Vercel Environment Variables - Production secrets

## Webhooks & Callbacks

**Incoming:**
- None currently configured

**Outgoing:**
- Email via Gmail SMTP - POST from enquiry form triggers email send
- Newsletter subscription endpoint - Currently logs to console only

## Security

**Headers (configured in next.config.js):**
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

**CORS:**
- Allowed origins: `https://www.winningadventure.com.au`, `https://winningadventure.com.au`
- Used in: `/api/enquiry` and `/api/newsletter`

**Input Sanitization:**
- HTML escaping in enquiry form (`app/api/enquiry/route.ts`)
- Zod schema validation for all API inputs

---

*Integration audit: 2026-03-20*
