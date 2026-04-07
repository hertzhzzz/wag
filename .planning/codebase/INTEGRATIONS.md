# External Integrations

**Analysis Date:** 2026-04-07

## APIs & External Services

**Email Delivery:**
- Gmail SMTP - Primary email service for transactional emails
  - Implementation: `nodemailer` with Gmail SMTP transport
  - Auth: `GMAIL_USER` + `GMAIL_APP_PASSWORD` environment variables
  - Used in: `app/api/enquiry/route.ts`, `app/api/contact/route.ts`, `app/api/newsletter/route.ts`
  - Note: Lazy-loaded to avoid SSR issues

**Resend (installed but not visibly integrated):**
- Email API service
  - Package: `resend@6.9.3`
  - Auth: Not visibly configured in API routes
  - Status: Listed in dependencies but not actively used

**Rate Limiting:**
- Upstash Redis - Primary rate limiting backend
  - SDK: `@upstash/ratelimit 2.0.0` + `@upstash/redis 1.34.0`
  - Auth: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` environment variables
  - Fallback: In-memory rate limiting when Redis unavailable
  - Implementation: `lib/rate-limit.ts`
  - Limit: 3 requests per 60 seconds (sliding window)

## Data Storage

**Databases:**
- None actively used - This is a static/MDX-based site
- Supabase configured in env vars but not integrated

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

**Analytics:**
- Google Analytics 4 (GA4) - Event tracking
  - Implementation: `lib/analytics.ts` - Client-side only
  - Events tracked: cta_click, outbound_click, enquiry_form_open, scroll_depth, article_read_progress
  - Global types: `Window.gtag` and `Window.dataLayer`

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
- Build command: `npm run build`
- Output directory: `.next`

## Environment Configuration

**Required env vars:**
| Variable | Purpose | Status |
|----------|---------|--------|
| `GMAIL_USER` | Gmail address for SMTP sender | REQUIRED |
| `GMAIL_APP_PASSWORD` | Gmail App Password | REQUIRED |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | Optional (falls back to memory) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | Optional |

**Optional env vars:**
| Variable | Purpose | Status |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Future database | Not used |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Future database | Not used |
| `SUPABASE_SERVICE_ROLE_KEY` | Future database | Not used |
| `RESEND_API_KEY` | Email service | Not used |
| `ANALYZE` | Bundle analysis | Debug only |

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

**Security Headers (via next.config.js):**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**CORS:**
- Allowed origins:
  - `https://www.winningadventure.com.au`
  - `https://winningadventure.com.au`
  - `http://localhost:3000`
  - `http://localhost:3001`

**Input Validation:**
- Zod schema validation on all API endpoints
- HTML escaping (XSS prevention) on user inputs in email templates
- Rate limiting on all form submissions

**Redirects (HTTP to HTTPS, non-www to www):**
- Configured in `next.config.js` redirects function

---

*Integration audit: 2026-04-07*
