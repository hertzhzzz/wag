# Phase 8: Security Implementation Safety Analysis

**Date:** 2026-03-18
**Phase:** 08-security-audit
**Confidence:** HIGH

---

## 1. Current State Analysis

### 1.1 Package Dependencies (package.json)

| Package | Current Version | Status |
|---------|----------------|--------|
| next | 14.2.0 | VULNERABLE - CVE-2025-29927 |
| zod | ^4.3.6 | OK |
| resend | ^6.9.3 | OK |
| nodemailer | ^8.0.1 | OK |
| @upstash/ratelimit | NOT INSTALLED | Required for Phase 08-03 |
| @upstash/redis | NOT INSTALLED | Required for Phase 08-03 |

**Current vulnerabilities:**
- Next.js 14.2.0 is vulnerable to CVE-2025-29927 (middleware authorization bypass)
- No rate limiting packages installed yet

### 1.2 Next.js Configuration (next.config.js)

```javascript
// Current state - NO security headers
const nextConfig = {
  transpilePackages: ['react-globe.gl', 'three-globe', 'globe.gl'],
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
}
```

**Missing security configurations:**
- No security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- No CSP configuration

### 1.3 API Routes

#### Enquiry Route (app/api/enquiry/route.ts)

| Feature | Status | Notes |
|---------|--------|-------|
| Rate limiting | IN-MEMORY | Resets on server restart - NOT PERSISTENT |
| Input validation | Zod | Properly configured |
| HTML escaping | Manual | Custom escapeHtml function |
| CORS | NONE | Not configured |
| Origin checking | NONE | Accepts all origins |

#### Newsletter Route (app/api/newsletter/route.ts)

| Feature | Status | Notes |
|---------|--------|-------|
| Rate limiting | NONE | No protection |
| Input validation | Regex only | Basic email validation |
| HTML escaping | NONE | Not needed (no HTML output) |
| CORS | NONE | Not configured |
| Origin checking | NONE | Accepts all origins |

### 1.4 Middleware Status

**No custom middleware.ts file exists in the project.**

This is IMPORTANT because:
- CVE-2025-29927 specifically affects apps using middleware for auth
- The vulnerability allows bypassing middleware-based authorization
- Since no custom middleware exists, the direct exploit path is less likely
- HOWEVER: Upgrading is still REQUIRED because:
  - Vercel may add internal middleware
  - Future middleware additions would be vulnerable
  - Security best practice requires patched versions

---

## 2. Risk Assessment by Plan

### Plan 08-01: Dependency Updates

| Risk | Severity | Description |
|------|----------|-------------|
| Breaking changes in Next.js upgrade | MEDIUM | 14.2.0 to 14.2.25 is a minor version within same major - typically safe |
| Peer dependency conflicts | LOW | No conflicting peer deps detected |
| Build failures after upgrade | LOW | Standard upgrade path, well-tested |

**Specific upgrade analysis:**
- Next.js 14.2.0 -> 14.2.25: This is a PATCH/MINOR within 14.x
- According to Next.js versioning, 14.2.25 includes only bug fixes and security patches
- No breaking API changes expected between 14.2.0 and 14.2.25
- The main change is security fix for CVE-2025-29927

**Mitigation:** Run `npm run build` after upgrade to verify

### Plan 08-02: Security Headers + CORS

| Risk | Severity | Description |
|------|----------|-------------|
| Headers conflict with existing config | LOW | No existing headers in next.config.js |
| Vercel deployment header issues | LOW | Next.js headers API works with Vercel |
| CSP blocking external resources | MEDIUM | Need to verify Remotion, ECharts, Unsplash images work |
| CORS breaking legitimate requests | MEDIUM | Must include both www and non-www domains |

**Specific concerns:**

1. **CSP (Content Security Policy)**: NOT in current plan, but referenced in research
   - If added later, may break:
     - Remotion video animations (uses inline scripts)
     - ECharts (may need unsafe-inline for some features)
     - Google Fonts
     - Unsplash images
   - **Recommendation:** Don't add CSP in this phase - test thoroughly first

2. **CORS Configuration**:
   - Must allow BOTH:
     - `https://www.winningadventure.com.au`
     - `https://winningadventure.com.au`
   - If site uses redirects, wrong origin may be sent
   - **Mitigation:** Check actual origin in browser devtools

### Plan 08-03: Rate Limiting with Upstash

| Risk | Severity | Description |
|------|----------|-------------|
| Redis connection failures | HIGH | App will crash without UPSTASH_REDIS_REST_URL |
| Environment variable missing | HIGH | Build/runtime failure if not set |
| Edge runtime incompatibility | LOW | upstash/ratelimit supports edge |
| Vercel free tier limits | MEDIUM | 10k requests/day may not be enough |

**Specific concerns:**

1. **Missing environment variables:**
   ```
   UPSTASH_REDIS_REST_URL  (required)
   UPSTASH_REDIS_REST_TOKEN (required)
   ```
   - If not set, the rate limiter will fail on import
   - **Mitigation:** Add fallback to in-memory rate limiting OR check for env vars

2. **Redis connection in serverless:**
   - Each Vercel function instance connects to Redis
   - First request after cold start may be slow
   - **Mitigation:** Use connection caching

3. **Import issues:**
   ```typescript
   // This will FAIL if env vars are missing
   import { Redis } from '@upstash/redis'
   export const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(), // Throws if env vars missing
   })
   ```
   - **Recommendation:** Add error handling/fallback

---

## 3. Mitigation Strategies

### 3.1 Next.js Upgrade (Plan 08-01)

```bash
# Step 1: Backup current state
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup

# Step 2: Run npm audit first to see vulnerabilities
npm audit

# Step 3: Upgrade Next.js
npm install next@14.2.25

# Step 4: Verify build
npm run build

# Step 5: If build fails, restore and investigate
# cp package.json.backup package.json
# npm install
```

**Rollback:**
```bash
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json
npm install
```

### 3.2 Security Headers (Plan 08-02)

**Test before deployment:**
1. Run locally: `npm run dev`
2. Check headers: `curl -I http://localhost:3000`
3. Verify each header is present

**Headers to add:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**CORS testing:**
- Test from https://www.winningadventure.com.au
- Test from https://winningadventure.com.au
- Test from https://evil.com (should be blocked)

### 3.3 Rate Limiting (Plan 08-03)

**Safe implementation pattern:**

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Redis is configured
const isRedisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

// Fallback to in-memory if Redis not configured
let ratelimit: Ratelimit | null = null

if (isRedisConfigured) {
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, '60 s'),
      analytics: true,
    })
  } catch (error) {
    console.error('Failed to initialize rate limiter:', error)
  }
}

// In-memory fallback
const memoryRateLimitMap = new Map<string, { count: number; resetTime: number }>()
const MEMORY_RATE_LIMIT = 3
const MEMORY_WINDOW = 60 * 1000

export async function checkRateLimit(identifier: string): Promise<boolean> {
  // Use Redis rate limiter if available
  if (ratelimit) {
    try {
      const result = await ratelimit.limit(identifier)
      return result.success
    } catch (error) {
      console.error('Rate limit error:', error)
      // Fall through to memory rate limit on error
    }
  }

  // Fallback to in-memory
  const now = Date.now()
  const record = memoryRateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    memoryRateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + MEMORY_WINDOW,
    })
    return true
  }

  if (record.count >= MEMORY_RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}
```

**Environment variable documentation:**
```
# Upstash Redis (for rate limiting)
# Get from: https://console.upstash.com/
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxx
```

---

## 4. Testing Plan

### 4.1 Pre-Implementation Tests

| Test | Command | Expected |
|------|---------|----------|
| Current vulnerabilities | `npm audit` | Show CVE-2025-29927 |
| Outdated packages | `npm outdated` | Show next@14.2.0 |
| Current headers | `curl -I localhost:3000` | No security headers |

### 4.2 Post-Implementation Tests (Plan 08-01)

| Test | Command | Expected |
|------|---------|----------|
| Next.js version | `npm list next` | next@14.2.25+ |
| Build works | `npm run build` | Exit code 0 |
| No critical vulnerabilities | `npm audit --audit-level=high` | Exit code 0 |

### 4.3 Post-Implementation Tests (Plan 08-02)

| Test | Command | Expected |
|------|---------|----------|
| Security headers | `curl -I localhost:3000` | All 5 headers present |
| CORS - allowed origin | `curl -H "Origin: https://www.winningadventure.com.au" -X OPTIONS ...` | 204 response with headers |
| CORS - blocked origin | `curl -H "Origin: https://evil.com" -X POST ...` | 403 response |

### 4.4 Post-Implementation Tests (Plan 08-03)

| Test | Command | Expected |
|------|---------|----------|
| Rate limiter installed | `npm list @upstash/ratelimit` | Package listed |
| Rate limiting works | Make 4 rapid requests | 4th request returns 429 |
| Redis connection | Check Vercel function logs | No connection errors |

---

## 5. Rollback Plan

### 5.1 If Next.js Upgrade Fails

```bash
# Restore package files
git checkout package.json package-lock.json

# Reinstall
npm install

# Verify old version
npm list next

# Verify build
npm run build
```

### 5.2 If Security Headers Break Site

```bash
# Rollback next.config.js
git checkout next.config.js

# Redeploy
git push origin master
```

### 5.3 If Rate Limiting Breaks API

```bash
# Option 1: Remove upstash packages
npm uninstall @upstash/ratelimit @upstash/redis

# Option 2: Disable rate limiting in code (comment out import)
# Edit app/api/enquiry/route.ts
# Comment out: import { checkRateLimit } from '@/lib/rate-limit'
# Comment out: const { success } = await checkRateLimit(ip)

# Redeploy
git push origin master
```

---

## 6. Implementation Order

**Recommended sequence:**

1. **Phase 08-01 FIRST** (dependency updates)
   - Upgrade Next.js
   - Run npm audit
   - Verify build

2. **Phase 08-02 SECOND** (headers + CORS)
   - Add security headers
   - Add CORS to API routes
   - Test locally

3. **Phase 08-03 LAST** (rate limiting)
   - Install upstash packages
   - Create lib/rate-limit.ts with fallback
   - Add env vars to Vercel
   - Test rate limiting

**Why this order:**
- Each phase has a dependency on the previous (build must pass)
- Headers are low-risk, easy to rollback
- Rate limiting requires env var setup - do last

---

## 7. Summary Checklist

Before implementing each plan:

### Plan 08-01
- [ ] Backup package.json and package-lock.json
- [ ] Run npm audit to see current vulnerabilities
- [ ] Run npm outdated to see update candidates
- [ ] Execute: `npm install next@14.2.25`
- [ ] Verify: `npm run build` passes
- [ ] Verify: `npm audit --audit-level=high` returns 0

### Plan 08-02
- [ ] Read next.config.js current state
- [ ] Add headers function
- [ ] Test locally: `curl -I localhost:3000`
- [ ] Add CORS to enquiry route
- [ ] Add CORS to newsletter route
- [ ] Verify both origins work

### Plan 08-03
- [ ] Install: `npm install @upstash/ratelimit @upstash/redis`
- [ ] Create lib/rate-limit.ts with fallback
- [ ] Update enquiry route to use rate limiter
- [ ] Update newsletter route to use rate limiter
- [ ] Add UPSTASH_REDIS_REST_URL to .env.local (for local dev)
- [ ] Add UPSTASH_REDIS_REST_URL to Vercel project settings
- [ ] Add UPSTASH_REDIS_REST_TOKEN to Vercel project settings
- [ ] Test: Make 4 rapid requests, 4th should be 429

---

## 8. Key Files to Modify

| File | Plan | Changes |
|------|------|---------|
| package.json | 08-01 | Update next to 14.2.25, add @upstash packages |
| package-lock.json | 08-01 | Auto-generated |
| next.config.js | 08-02 | Add headers() function |
| app/api/enquiry/route.ts | 08-02, 08-03 | Add CORS, update rate limiting |
| app/api/newsletter/route.ts | 08-02, 08-03 | Add CORS, add rate limiting |
| lib/rate-limit.ts | 08-03 | NEW FILE - rate limiter with fallback |
| .env.local | 08-03 | Add UPSTASH_REDIS_REST_URL and TOKEN (dev only) |
| Vercel env vars | 08-03 | Add UPSTASH vars to production |

---

## 9. Known Limitations

1. **Rate limiting by IP only:** Does not account for users behind NAT or VPN (shared IP)
2. **CORS origin matching:** Exact string matching - may need regex for advanced cases
3. **No CSP yet:** Content Security Policy not implemented (requires testing)
4. **No auth middleware:** Project doesn't use middleware for auth (less risk from CVE)
5. **Free tier limits:** Upstash free tier is 10k requests/day - may need upgrade

---

*Generated for Phase 8: Security Audit Implementation*
*Valid for implementation planning - re-verify if starting implementation after 2026-04-01*
