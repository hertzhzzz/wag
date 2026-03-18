<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full security audit: OWASP Top 10 + dependency scanning + API routes + security headers
- Detection method: Automated tools (npm audit, npm outdated) + manual code review
- Include dependency scanning as part of this phase
- Rate limiting: Add to enquiry form API route
- Security headers: Standard headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Scanning tools: Free tools (npm audit, npm outdated, code review)

### Claude's Discretion
- Specific rate limiting implementation (in-memory vs Redis/Vercel KV)
- Exact security headers to implement
- Whether to add CSP (Content Security Policy)
- How to verify the fixes work

### Deferred Ideas (OUT OF SCOPE)
- Paid security tools (Snyk, Dependabot) — future consideration
- Email security records (SPF, DKIM, DMARC) — if needed after audit
- User authentication (no user accounts on site currently)

</user_constraints>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEC-01 | Run npm audit to identify dependency vulnerabilities | Research covers npm audit commands and interpretation |
| SEC-02 | Run npm outdated to identify outdated packages | Research covers npm outdated and upgrade strategies |
| SEC-03 | Add security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) | Research covers Next.js headers configuration |
| SEC-04 | Add CORS configuration to API routes | Research covers CORS best practices for Next.js API routes |
| SEC-05 | Enhance rate limiting on enquiry form | Research covers rate limiting libraries (upstash/ratelimit-js) |
| SEC-06 | Manual code review for common vulnerabilities | Research covers OWASP Top 10 for Next.js |
| SEC-07 | Add security scanning to CI/CD pipeline | Research covers GitHub Actions security workflows |

---

# Phase 8: Security Audit - Research

**Researched:** 2026-03-18
**Domain:** Web Application Security (Next.js + Supabase)
**Confidence:** HIGH

## Summary

This phase covers a comprehensive security audit for the WAG website built on Next.js 14.2 with Supabase and Resend. The research identifies that the project currently has basic security measures (in-memory rate limiting on enquiry form, Zod validation, HTML escaping) but lacks critical security headers, proper CORS configuration, and dependency vulnerability scanning. Key findings include: (1) Next.js 14.2 has known vulnerabilities (CVE-2025-29927) that should be addressed, (2) npm audit is the primary free tool for dependency scanning, (3) security headers can be added via Next.js headers configuration, and (4) rate limiting should use a persistent solution like upstash/ratelimit-js for production.

**Primary recommendation:** Implement security headers via next.config.js, add CORS to API routes, switch to persistent rate limiting with upstash/ratelimit-js, and add npm audit to CI/CD pipeline.

## Standard Stack

### Core Security Tools
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| npm audit | Built-in | Dependency vulnerability scanning | Official npm tool, integrated with package-lock.json |
| npm outdated | Built-in | Outdated package detection | Official npm tool, identifies upgrade candidates |
| upstash/ratelimit-js | ^1.0.0 | Rate limiting for serverless | Designed for Vercel/serverless, free tier available |
| zod | ^4.3.6 | Input validation | Already in project, prevents injection attacks |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @upstash/redis | ^1.x | Redis for rate limiting | When upstash/ratelimit-js needs persistent storage |
| GitHub Security | Built-in | Dependency scanning | GitHub's native Dependabot (free for public repos) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| upstash/ratelimit-js | Vercel KV | More expensive, requires Vercel Pro |
| upstash/ratelimit-js | In-memory (current) | Simple but resets on server restart, not suitable for production |
| npm audit | Snyk | More comprehensive but paid for private repos |
| npm audit | Dependabot | GitHub-native, but requires GitHub integration |

**Installation:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Version verification:**
```bash
npm view @upstash/ratelimit version  # Latest: 1.3.1 (2025-12)
npm view @upstash/redis version      # Latest: 1.3.0 (2025-11)
```

## Architecture Patterns

### Recommended Project Structure
```
wag/
├── app/
│   ├── api/
│   │   ├── enquiry/route.ts       # Add CORS headers + enhanced rate limiting
│   │   └── newsletter/route.ts     # Add CORS headers + basic rate limiting
│   └── middleware.ts               # For advanced routing security (if needed)
├── lib/
│   └── security.ts                 # Rate limiting + security utilities
├── next.config.js                  # Security headers configuration
└── .github/
    └── workflows/
        └── security.yml            # CI/CD security scanning
```

### Pattern 1: Next.js Security Headers
**What:** Configure HTTP security headers in next.config.js
**When to use:** All production Next.js applications
**Example:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

**Source:** [Next.js Headers Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

### Pattern 2: API Route CORS
**What:** Add CORS headers to Next.js API routes
**When to use:** When API routes need to be accessed from specific origins
**Example:**
```typescript
// app/api/enquiry/route.ts
import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://www.winningadventure.com.au',
  'https://winningadventure.com.au'
]

export async function POST(request: Request) {
  // CORS check
  const origin = request.headers.get('origin')
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { error: 'Origin not allowed' },
      { status: 403 }
    )
  }

  // ... rest of handler
  const response = NextResponse.json({ ok: true })

  // Add CORS headers to response
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  }

  return response
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.winningadventure.com.au',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}
```

### Pattern 3: Rate Limiting with upstash/ratelimit-js
**What:** Persistent rate limiting using Redis
**When to use:** Production applications requiring robust rate limiting
**Example:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create rate limiter
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '60 s'), // 3 requests per minute
  analytics: true
})

// Usage in API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  // ... rest of handler
}
```

**Source:** [upstash/ratelimit-js GitHub](https://github.com/upstash/ratelimit-js)

### Pattern 4: Input Validation with Zod
**What:** Validate and sanitize all user inputs
**When to use:** All API routes accepting user input
**Example:**
```typescript
// Already implemented in enquiry route
const enquirySchema = z.object({
  fullName: z.string().min(1).max(100),
  companyName: z.string().min(1).max(200),
  email: z.string().email(),
  // ... etc
})
```

### Anti-Patterns to Avoid
- **Allowing all origins (CORS):** `Access-Control-Allow-Origin: *` is insecure for API routes
- **No rate limiting:** Without rate limiting, APIs are vulnerable to abuse
- **Storing secrets in code:** Never commit API keys or secrets to version control
- **Disabled security headers:** Next.js defaults are minimal; always add security headers
- **Trusting client input:** Always validate and sanitize on the server side

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting | Custom in-memory solution | upstash/ratelimit-js | Handles distributed requests, survives server restarts |
| Vulnerability scanning | Custom scanner | npm audit | Official, comprehensive, integrated |
| Security headers | Custom middleware | Next.js headers config | Built-in, optimized for Next.js |
| Input validation | Regex parsing | zod | Type-safe, declarative, battle-tested |

**Key insight:** Security tools like npm audit and Next.js headers are maintained by trusted sources and updated for new vulnerabilities. Custom solutions often have edge cases that attackers exploit.

## Common Pitfalls

### Pitfall 1: Missing Security Headers
**What goes wrong:** Applications are vulnerable to XSS, clickjacking, and MIME sniffing attacks
**Why it happens:** Developers assume Next.js includes security headers by default
**How to avoid:** Explicitly configure all security headers in next.config.js
**Warning signs:** Security scanner reports missing headers, browser console warnings

### Pitfall 2: Overly Permissive CORS
**What goes wrong:** API routes accept requests from any origin, enabling CSRF attacks
**Why it happens:** Using `*` for Allow-Origin during development
**How to avoid:** Explicitly whitelist allowed origins in production
**Warning signs:** API responds to requests from unknown domains

### Pitfall 3: In-Memory Rate Limiting
**What goes wrong:** Rate limits reset when server restarts, allowing burst attacks
**Why it happens:** Simple Map-based solution seems sufficient for development
**How to avoid:** Use persistent rate limiting (Redis) in production
**Warning signs:** Sudden spikes in API calls after deployments

### Pitfall 4: Dependency Vulnerabilities
**What goes wrong:** Known vulnerabilities in dependencies are exploited
**Why it happens:** Not running npm audit regularly, ignoring vulnerability reports
**How to avoid:** Run npm audit in CI/CD, prioritize critical/high vulnerabilities
**Warning signs:** npm audit shows vulnerabilities, especially critical/high severity

### Pitfall 5: Next.js CVE-2025-29927 (Middleware Bypass)
**What goes wrong:** Attackers bypass middleware authentication/authorization
**Why it happens:** Vulnerability in Next.js < 14.2.25 and < 15.2.3
**How to avoid:** Upgrade to latest Next.js version (14.2.25+ or 15.2.3+)
**Warning signs:** Using older Next.js versions, suspicious x-middleware-subrequest headers

## Code Examples

### Security Headers Configuration (Complete)
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // HTTPS enforcement (1 year)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Control browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

### Enhanced API Route with Full Security
```typescript
// app/api/enquiry/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ratelimit } from '@/lib/rate-limit'

const ALLOWED_ORIGINS = [
  'https://www.winningadventure.com.au',
  'https://winningadventure.com.au'
]

const enquirySchema = z.object({
  fullName: z.string().min(1).max(100),
  // ... other fields
})

export async function POST(request: Request) {
  // 1. CORS check
  const origin = request.headers.get('origin')
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { error: 'Origin not allowed' },
      { status: 403 }
    )
  }

  // 2. Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // 3. Input validation
  const parseResult = enquirySchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 400 }
    )
  }

  // 4. Process request...

  const response = NextResponse.json({ ok: true })

  // 5. Add CORS headers
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  return response
}
```

### GitHub Actions Security Workflow
```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=high
        env:
          ADVISORY_API_URL: ${{ secrets.ADVISORY_API_URL }}

      - name: Check for outdated packages
        run: npm outdated --depth=0

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual security audits | Automated npm audit in CI/CD | npm v6+ (2018) | Continuous vulnerability detection |
| Server-side rate limiting | Edge/serverless rate limiting | upstash (2021) | Distributed protection without infrastructure |
| Basic auth headers | Comprehensive security headers | OWASP awareness (ongoing) | Defense in depth |
| Single-layer security | Defense in depth | Modern security best practices | Multiple security controls |

**Deprecated/outdated:**
- `helmet` package for Next.js: Now recommended to use native Next.js headers config
- In-memory rate limiting for production: Not persistent, security bypass on restart
- `*` CORS origins: Security risk, should whitelist specific domains

## Open Questions

1. **Should Content Security Policy (CSP) be implemented?**
   - What we know: CSP provides strong XSS protection but requires careful configuration
   - What's unclear: Whether the current third-party integrations (Remotion, ECharts) are compatible with strict CSP
   - Recommendation: Start with basic CSP headers, refine over time

2. **Which rate limiting solution for Vercel free tier?**
   - What we know: upstash/ratelimit-js has free tier with 10k requests/day
   - What's unclear: Whether the free tier meets WAG's traffic needs
   - Recommendation: Use upstash/ratelimit-js with free tier, upgrade if needed

3. **Should Supabase Row Level Security (RLS) be audited?**
   - What we know: No user authentication currently, Supabase may not be actively used
   - What's unclear: Whether Supabase is being used for any data storage
   - Recommendation: Check if Supabase is being used, audit if applicable

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | npm audit (built-in) + npm outdated (built-in) |
| Config file | package.json scripts + next.config.js |
| Quick run command | `npm audit --audit-level=high` |
| Full suite command | `npm audit && npm outdated` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | Identify dependency vulnerabilities | automated | `npm audit --audit-level=high` | N/A |
| SEC-02 | Identify outdated packages | automated | `npm outdated` | N/A |
| SEC-03 | Security headers present | manual | Check next.config.js | YES |
| SEC-04 | CORS configured on API routes | manual | Check API route files | YES |
| SEC-05 | Rate limiting working | manual | Test API endpoint with multiple requests | YES |
| SEC-06 | No common vulnerabilities in code | manual | Code review | YES |
| SEC-07 | CI/CD security workflow exists | automated | Check .github/workflows/ | NO |

### Sampling Rate
- **Per task commit:** `npm audit --audit-level=high`
- **Per wave merge:** Full suite (`npm audit && npm outdated`)
- **Phase gate:** All security checks pass + manual code review

### Wave 0 Gaps
- [ ] `.github/workflows/security.yml` — CI/CD security scanning workflow
- [ ] Updated next.config.js with security headers
- [ ] API routes with CORS configuration
- [ ] Enhanced rate limiting implementation

## Sources

### Primary (HIGH confidence)
- [Next.js Headers Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/headers) - Official Next.js docs for headers configuration
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Official npm docs
- [OWASP Top 10 2025](https://owasp.org/Top10/2025) - Official OWASP security guidelines
- [upstash/ratelimit-js GitHub](https://github.com/upstash/ratelimit-js) - Official rate limiting library

### Secondary (MEDIUM confidence)
- [CVE-2025-29927 Next.js Vulnerability](https://net.njfu.edu.cn/2025/0327/c1363a27183/page.htm) - Security advisory for Next.js middleware bypass
- [Next.js Security Best Practices](https://blog.csdn.net/liuweni/article/details/144389518) - CSP configuration guide

### Tertiary (LOW confidence)
- [NPM Security OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html) - General npm security best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools verified with official sources
- Architecture: HIGH - Next.js patterns from official documentation
- Pitfalls: HIGH - Based on OWASP Top 10 and known Next.js vulnerabilities
- Rate limiting: MEDIUM - upstash recommendation based on ecosystem usage, not direct testing

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (30 days for stable, 7 for fast-moving)
- Note: Next.js security vulnerabilities may require faster updates
- Check npm audit weekly in production

---

*Generated for Phase 8: Security Audit*
