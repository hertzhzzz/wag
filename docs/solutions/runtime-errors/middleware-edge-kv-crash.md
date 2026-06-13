---
title: "Middleware crashes with MIDDLEWARE_INVOCATION_FAILED when calling Upstash Redis"
date: "2026-06-13"
module: "middleware"
tags: ["middleware", "edge", "upstash", "kv", "500", "MIDDLEWARE_INVOCATION_FAILED"]
problem_type: "runtime_error"
severity: "critical"
status: "resolved"
resolution_type: "architectural_pattern"
category: "runtime-errors"
---

## Problem

Next.js middleware (`middleware.ts`) crashes with `MIDDLEWARE_INVOCATION_FAILED` when calling Upstash Redis KV operations (e.g., `validateSession`).

This breaks ALL requests matching the middleware matcher, not just the route where the KV call happens.

## Root Cause

Next.js middleware runs in Edge Runtime. `@upstash/redis` default export uses `node:http` which is unavailable in Edge. While `@upstash/redis/cloudflare` provides an Edge-compatible export using `fetch()`, it can still fail due to:

1. `Redis.fromEnv()` reading `process.env` at module init time (Edge restricts env access)
2. Network timeouts on KV REST calls exceeding Edge function limits
3. Turbopack bundling differences between Edge and Node.js targets

## Solution

**Middleware — cookie existence check only. NEVER call external services.**

```typescript
// Safe: cookie check only, no imports beyond next/server
function handleAdminAuth(request: NextRequest): NextResponse {
  if (isPublicPath(pathname)) return NextResponse.next()
  const sessionCookie = request.cookies.get("admin_session")
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/admin", request.url), 302)
  }
  return NextResponse.next()
}
```

Full session validation (HMAC verify + KV lookup) happens in:
- API routes (Node.js runtime — full access to crypto, Redis, etc.)
- Page server components (via `fetch()` to API routes)

## Prevention

1. **Middleware is a fast gate, not an auth service** — cookie existence only
2. **No external service calls in middleware** — no Redis, no fetch, no crypto
3. **If middleware needs data** — add a custom header or cookie flag, validate downstream
4. **Test middleware paths after every dependency change** — a new import can silently break all routes

## Detection Pattern

- Error: `MIDDLEWARE_INVOCATION_FAILED`
- All routes return 500 (not just the one being guarded)
- Removing the external service call from middleware fixes ALL routes
- API routes using the same service work fine (different runtime)
