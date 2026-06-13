---
title: "RSC pages crash with 500 when importing Node.js crypto or @upstash/redis"
date: "2026-06-13"
module: "rsc"
tags: ["rsc", "imports", "crypto", "upstash", "500", "turbopack"]
problem_type: "runtime_error"
severity: "critical"
status: "resolved"
resolution_type: "architectural_pattern"
category: "runtime-errors"
---

## Problem

React Server Components (RSC) in Next.js 16 with Turbopack crash with HTTP 500 when statically or dynamically importing any module that transitively uses Node.js `crypto` or `@upstash/redis`.

Exact error: `MIDDLEWARE_INVOCATION_FAILED` (middleware) or blank 500 page (server components). Vercel shows no useful runtime logs.

## Symptoms

- API routes (`app/api/*/route.ts`) using crypto/Redis work fine (Node.js runtime)
- Server components (`app/*/page.tsx`, `app/*/layout.tsx`) crash at module load time
- Layout imports are the most dangerous — crash ALL pages under that layout
- Dynamic imports (`await import(...)`) do NOT fix the issue
- The page returns 500 with Next.js error digest in RSC payload

## Root Cause

Next.js Turbopack compiles RSC and API routes through different pipelines. RSC compilation cannot resolve Node.js built-in modules (`crypto`, `node:http` used by `@upstash/redis`) at module evaluation time. The import succeeds at the TypeScript level but crashes at runtime in the Vercel serverless environment.

## Solution

Three-layer pattern:

**1. Layout — cookie existence check only (no imports)**

```typescript
// app/admin/layout.tsx — safe, zero imports
import { cookies } from "next/headers"
export default async function AdminLayout({ children }) {
  const hasSession = !!(await cookies()).get("admin_session")?.value
  if (!hasSession) return <>{children}</>
  return <Aside>{children}</Aside>
}
```

**2. Pages — server-side `fetch()` to API routes**

```typescript
// app/admin/clients/page.tsx — safe, zero crypto/Redis imports
export default async function AdminClientsPage() {
  const sessionCookie = (await cookies()).get("admin_session")
  if (!sessionCookie?.value) redirect("/admin")

  const host = (await headers()).get("host")
  const res = await fetch(`https://${host}/api/admin/clients`, {
    headers: { Cookie: `admin_session=${sessionCookie.value}` }
  })
  const data = await res.json()
  return <ClientList data={data} />
}
```

**3. API routes — full Node.js access (crypto, Redis, bcrypt OK)**

```typescript
// app/api/admin/clients/route.ts — safe, full Node.js runtime
import { Redis } from "@upstash/redis"
import { validateAdminSession } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  if (!(await validateAdminSession(...))) return 401
  const redis = Redis.fromEnv()
  const data = await redis.lrange("access_logs:slug", 0, 99)
  return NextResponse.json(data)
}
```

## Prevention

1. **Never import crypto/Redis in RSC files** (pages, layouts)
2. **API routes are the integration layer** — put all crypto, Redis, bcrypt logic there
3. **Middleware — cookie existence only** (no KV calls in Edge Runtime)
4. **When adding new server data needs**, create an API route first, then `fetch()` from the page

## What Didn't Work

- ✅ Dynamic imports (`await import("@/lib/admin-auth")`) — still crashed in RSC
- ✅ Lazy initialization (`const redis = getRedis()` inside function) — module-level import still crashed
- ✅ Web Crypto API (`crypto.subtle`) — not available in RSC context
- ✅ Node.js crypto (`crypto.createHmac`) — module import crashed in RSC
