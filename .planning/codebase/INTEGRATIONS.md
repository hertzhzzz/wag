# External Integrations

**Analysis Date:** 2026-04-07

## APIs & External Services

**Email Delivery:**
- Gmail SMTP - Primary email service for transactional emails
  - Implementation: `nodemailer` with Gmail service
  - Auth: `GMAIL_USER` + `GMAIL_APP_PASSWORD` environment variables
  - Used in: `app/api/enquiry/route.ts`, `app/api/contact/route.ts`, `app/api/newsletter/route.ts`

**Resend (installed but not visibly integrated):**
- Email API service
  - Package: `resend@6.9.3`
  - Auth: Not visibly configured in API routes

**Rate Limiting:**
- Upstash Redis - Primary rate limiting backend
  - SDK: `@upstash/ratelimit` + `@upstash/redis`
  - Auth: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` environment variables
  - Fallback: In-memory rate limiting when Redis unavailable
  - Implementation: `lib/rate-limit.ts`
  - Limit: 3 requests per 60 seconds (sliding window)

## Data Storage

**Databases:**
- None detected - This is a static/MDX-based site

**File Storage:**
- Local filesystem via MDX files
  - Content: `content/blog/*.mdx`
  - Processed with: gray-matter, remark, remark-gfm, remark-html

**Caching:**
- In-memory rate limit cache (fallback when Redis unavailable)
  - Location: `lib/rate-limit.ts`
  - Map-based: `memoryRateLimitMap`

## Authentication & Identity

**Auth Provider:**
- None - No authentication system detected
- Forms are public with rate limiting protection

## Monitoring & Observability

**Error Tracking:**
- None detected - No external error tracking service (e.g., Sentry)
- Console logging only: `console.error` in API routes

**Logs:**
- Approach: `console.error` for error logging
- Files: API routes log email errors and rate limit errors

## CI/CD & Deployment

**Hosting:**
- Vercel - Primary deployment platform
  - Auto-deploy on push to master branch
  - Production URL: https://www.winningadventure.com.au
  - Custom domain: winningadventure.com.au (configured)

**CI Pipeline:**
- None explicitly detected
- Vercel handles build and deployment automatically

## Environment Configuration

**Required env vars:**
- `GMAIL_USER` - Gmail address for SMTP sender (REQUIRED)
- `GMAIL_APP_PASSWORD` - Gmail App Password (REQUIRED)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL (OPTIONAL)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token (OPTIONAL)
- `ANALYZE` - Enable bundle analysis (OPTIONAL, set to 'true')

**Config file location:**
- `.env.local` - Local environment variables (gitignored)
- `.env.local.example` - Example environment variables (template)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None explicitly configured

## External Image Sources

**Allowed remote patterns (via next.config.js):**
- `https://images.unsplash.com/*` - Unsplash image CDN

## Security Considerations

**CORS:**
- Allowed origins:
  - `https://www.winningadventure.com.au`
  - `https://winningadventure.com.au`
  - `http://localhost:3000` (newsletter only)
  - `http://localhost:3001` (newsletter only)

**Input Validation:**
- Zod schema validation on all API endpoints
- HTML escaping (XSS prevention) on user inputs in email templates
- Rate limiting on all form submissions

**Redirects (HTTP to HTTPS, non-www to www):**
- Configured in `next.config.js` redirects function

---

*Integration audit: 2026-04-07*
