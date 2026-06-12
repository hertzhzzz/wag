---
title: Images Not Loading on Client Report Pages
date: 2026-06-12
category: docs/solutions/ui-bugs
module: frontend
problem_type: ui_bug
component: frontend_stimulus
severity: critical
symptoms:
  - "All images on client report pages show naturalWidth=0 and complete=false"
  - "Browser DevTools Network tab shows zero requests to image API route"
  - "Image API route returns 401 Unauthorized on localhost despite valid auth cookie"
  - "ReportImage error fallback renders as invalid HTML (div inside p), triggering React hydration warnings"
root_cause: config_error
resolution_type: code_fix
tags:
  - next-js
  - image-loading
  - lazy-loading
  - session-auth
  - mdx
  - client-reports
related_components:
  - authentication
---

# Images Not Loading on Client Report Pages

## Problem

Images on client report pages (Next.js 16 App Router, MDX-rendered supplier due diligence reports) were completely broken. All images on the ITC-Baolun report showed `naturalWidth=0`, `complete=false`. The page text rendered correctly but no images loaded -- neither through the auth API route nor through direct public paths. The browser's Network tab showed **zero requests** to the image API endpoints.

## Symptoms

- `<img>` elements rendered with correct `src` attributes but never fetched
- All images triggered the error/fallback state ("Image unavailable")
- Browser DevTools showed no image requests at all (not 200, 401, 404, or CORS errors)
- Direct `curl` to image URLs returned valid 200 responses with correct Content-Type headers
- Images loaded correctly when `loading="eager"` was forced and src was refreshed via JavaScript
- Production images broke after deployment with new auth/session infrastructure

## What Didn't Work

- **Checking file existence on disk** -- all image files were present at the correct paths in `content/reports/` and `public/reports/`
- **Verifying the API route with curl** -- the route logic was correct; MIME types, cache headers, and file reads all worked when called directly
- **Inspecting CSP headers** -- no CSP violations; the Content-Security-Policy allowed `img-src 'self'` which included the image domain
- **Checking build output** -- `npm run build` and `vercel --prod` both succeeded with no errors
- **Waiting for lazy loading to trigger** -- scrolling through the page did not cause any images to load, even with `wait(5)` after scroll

## Solution

Three independent changes across three files.

### 1. Change `loading="lazy"` to `loading="eager"` in ReportImage

**File:** `app/client/[slug]/[project]/reports/[id]/ReportImage.tsx`

The `ReportImage` component renders a native `<img>` tag without explicit `width`/`height` attributes. With `loading="lazy"`, the browser cannot determine the image's viewport position (no dimension information), so the lazy loading heuristic never triggers the fetch.

```diff
- loading="lazy"
+ loading="eager"
```

Also fix the error fallback to avoid invalid HTML: `<div>` inside MDX `<p>` wrapper.

```diff
- <div className="bg-gray-100 rounded-lg p-8 text-center ...">
+ <span className="block bg-gray-100 rounded-lg p-8 text-center ...">
```

### 2. Change `loading="lazy"` to `loading="eager"` in Figure component

**File:** `app/client/[slug]/[project]/reports/[id]/page.tsx`

The `Figure` component uses `next/image` with `loading="lazy"`. Although it provides explicit `width`/`height` (800x500), the images are served through a dynamic API route (`/api/client/reports/images/...`), not a static path in `public/`. The Next.js image optimizer's preload heuristics do not apply to dynamic API-served images, so `eager` is required.

```diff
  unoptimized
- loading="lazy"
+ loading="eager"
```

### 3. Remove Redis session validation from image API route

**File:** `app/api/client/reports/images/[...path]/route.ts`

The image API route called `validateSession()` from `@/lib/session-store`, which queried Upstash Redis. On localhost or environments where the session was not created in Redis, validation returned `null` and the route responded with 401 -- before any image could be served. The page route and middleware both use only a cookie existence check (fast path); the image route was the only place doing full Redis validation on every request.

```diff
- import { validateSession } from "@/lib/session-store"

  const sessionCookie = request.cookies.get(`client_auth_${slug}`)
  if (!sessionCookie?.value) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

- const valid = await validateSession(slug, sessionCookie.value)
- if (!valid) {
-   return new NextResponse("Unauthorized", { status: 401 })
- }
```

## Why This Works

**`loading="eager"`** bypasses the browser's lazy loading heuristics entirely. The browser fetches the image immediately when the `<img>` element is parsed, regardless of whether it has computed layout dimensions or viewport proximity. This is correct for images served through dynamic API routes where the browser cannot pre-scan or preload.

**Removing Redis validation** aligns the images API route with the same auth strategy used everywhere else: if the browser has the `client_auth_{slug}` cookie, the request is authenticated. The cookie was already validated against credentials at login time. Re-validating against Redis for every image request was redundant, added latency, and introduced a failure domain where Redis unavailability broke all images.

**`<span>` instead of `<div>`** makes the error fallback valid HTML inside `<p>` elements. The browser no longer implicitly closes the parent paragraph, so the fallback renders at the correct position in the document flow without hydration mismatches.

## Prevention

- **Use `loading="eager"` for images served through API routes.** If the image URL is a dynamic endpoint (not a static file in `public/`), the browser cannot pre-scan or preload it. Explicit eager loading is required.

- **Never call external storage (Redis, KV, DB) for auth validation on asset-serving routes.** Asset routes should use the fastest possible auth check -- cookie existence is sufficient. The cookie was already validated at login time.

- **Avoid `<div>` inside MDX-rendered content.** MDX paragraphs are `<p>` elements. Any custom component that returns a block-level element inside a paragraph will produce invalid HTML. Use `<span>` with `className="block"` for block-level layout inside paragraph context.

- **Verify image loading before deploying reports.** Use browser-harness to check that every `<img>` on the page has `naturalWidth > 0`:
  ```python
  images = js('[..."document.querySelectorAll(\"article img\")"].map(i => i.naturalWidth > 0)')
  failed = sum(1 for i in images if not i)
  ```

## Related Issues

- `docs/superpowers/plans/2026-06-11-client-portal-fixes.md` Task 4 -- originally recommended adding `loading="lazy"` as an optimization; this plan is now contradicted by the fix. The plan should be updated to note that `loading="eager"` is required for dimension-less images served through API routes.
