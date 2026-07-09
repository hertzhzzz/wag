# 410 Cleanup and Error Page Auto-Redirect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert 22 URLs that currently masquerade as redirects (but actually point to content that's gone) into direct HTTP 410 responses, and add a 5-second auto-redirect-to-home countdown to the site's 404 and 410 error pages.

**Architecture:** Reuses the existing single-registry SEO governance pattern (`lib/gone-paths.ts`, read by both `proxy.ts` and `app/sitemap.ts`) — no new architecture, just moving data between its existing arrays and removing 4 `next.config.js` rules that currently shadow it. The countdown is a small shared client component rendered from two existing server-component error pages.

**Tech Stack:** Next.js 16 App Router, TypeScript, Jest + ts-jest (existing config), no new dependencies.

## Global Constraints

- Page content / UI text must be English only (root `CLAUDE.md` STRICT rule) — the countdown message text must be English.
- No emoji anywhere in the frontend codebase.
- New code comments must be English, matching the existing comment language in `lib/gone-paths.ts`, `proxy.ts`, and `next.config.js`.
- Do not add new dependencies — `next/navigation`'s `useRouter` and React's `useEffect`/`useState` cover everything needed.
- `npm run build` and `npm run lint` must both pass with no new errors before any task is considered done (existing project Validation Checklist, `frontend/CLAUDE.md`).
- Jest's `testMatch` is restricted to `**/lib/**/*.test.ts` (see `frontend/jest.config.ts`) — only the `lib/gone-paths.ts` change gets an automated test. `proxy.ts`, `next.config.js`, and the new React component are verified manually (build + `node fetch` / browser check), matching this project's existing convention. There is no Playwright config or React testing library wired up despite `@playwright/test` being an unused devDependency — do not stand up new test infra for this task.

---

### Task 1: Move soft-404 blog slugs into BLOG_GONE_SLUGS

**Files:**
- Modify: `frontend/lib/gone-paths.ts`
- Test: `frontend/lib/gone-paths.test.ts` (new)

**Interfaces:**
- Consumes: nothing new — uses existing exports `BLOG_GONE_SLUGS: string[]`, `BLOG_REDIRECT_TARGETS: Record<string, string>`, `GONE_SLUGS: string[]`, `isBlogGoneSlug(slug: string): boolean`, `getBlogRedirectTarget(slug: string): string | undefined`, `isGonePath(pathname: string): boolean`.
- Produces: same function signatures, unchanged — Task 2 relies on `isBlogGoneSlug`, `getBlogRedirectTarget`, and `isGonePath` behaving correctly for the new entries added here.

- [ ] **Step 1: Write the failing test**

Create `frontend/lib/gone-paths.test.ts`:

```ts
import {
  isBlogGoneSlug,
  getBlogRedirectTarget,
  isGonePath,
  BLOG_REDIRECT_TARGETS,
} from './gone-paths'

describe('gone-paths: 2026-07-07 soft-404 cleanup', () => {
  const MOVED_TO_GONE = [
    'tottenham-hotspur',
    'bunnings-wesfarmers-merger-supply-chain',
    'bbq-galore-retail',
    'australian-retail-trends-grilld-coles',
    'kmart-home-retail',
    'bhp',
    'droneshield',
    'reneweconomy',
    'fitbit-air-sourcing',
    'oura-ring-5-wearable-tech-china-sourcing-guide',
    '007-first-light-sourcing',
    'adam-walton-policy-australian-businesses',
    'australian-business-bankruptcy-2026',
    'road-safety-australia-freight-operations',
    'australia-mining-capital-gains-tax-importers',
    'extreme-weather-supply-chain-risk',
    'kenya-sourcing-destination',
    'dubai-international-airport-australia-china-freight',
  ]

  it('treats all 18 formerly-redirected slugs as gone (410), not redirect', () => {
    for (const slug of MOVED_TO_GONE) {
      expect(isBlogGoneSlug(slug)).toBe(true)
      expect(getBlogRedirectTarget(slug)).toBeUndefined()
    }
  })

  it('removes the 18 moved slugs from BLOG_REDIRECT_TARGETS entirely', () => {
    for (const slug of MOVED_TO_GONE) {
      expect(Object.prototype.hasOwnProperty.call(BLOG_REDIRECT_TARGETS, slug)).toBe(false)
    }
  })

  it('keeps the 5 legitimate redirect-to-real-content entries untouched', () => {
    expect(getBlogRedirectTarget('services-wag')).toBe('/services')
    expect(getBlogRedirectTarget('resource-how-to-verify-chinese-factories-1688')).toBe('/article/verify-chinese-supplier')
    expect(getBlogRedirectTarget('resource-shenzhen-factory-visit')).toBe('/article/china-factory-tour-guide')
    expect(getBlogRedirectTarget('resource-should-i-pay-deposit-chinese-supplier')).toBe('/article/how-to-negotiate-chinese-factory-guide')
    expect(getBlogRedirectTarget('resource-chinese-supplier-quality-not-as-promised')).toBe('/article/china-sourcing-risks')
  })

  it('marks the two dead-redirect-chain article slugs as gone', () => {
    expect(isBlogGoneSlug('byd-company-supply-chain-guide')).toBe(true)
    expect(isBlogGoneSlug('electric-battery-supply-chain-china-sourcing-guide')).toBe(true)
  })

  it('marks the two legacy bare-slug paths as gone via isGonePath', () => {
    expect(isGonePath('/china-vs-alibaba')).toBe(true)
    expect(isGonePath('/china-supplier-verification')).toBe(true)
  })

  it('does not regress existing gone paths', () => {
    expect(isGonePath('/case-studies')).toBe(true)
    expect(isGonePath('/adelaide')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest lib/gone-paths.test.ts`
Expected: FAIL — the "treats all 18 formerly-redirected slugs as gone", "marks the two dead-redirect-chain article slugs as gone", and "marks the two legacy bare-slug paths as gone" assertions fail, because `gone-paths.ts` hasn't changed yet (those slugs are still in `BLOG_REDIRECT_TARGETS` or missing from `GONE_SLUGS`/`BLOG_GONE_SLUGS`).

- [ ] **Step 3: Update `GONE_SLUGS`**

In `frontend/lib/gone-paths.ts`, replace:

```ts
export const GONE_SLUGS = [
  "/case-studies",
  "/adelaide",
  "/perth",
  "/brisbane",
  "/melbourne",
]
```

with:

```ts
export const GONE_SLUGS = [
  "/case-studies",
  "/adelaide",
  "/perth",
  "/brisbane",
  "/melbourne",
  // Added 2026-07-07 — legacy bare-slug URLs. next.config.js used to 301
  // these to an /article/{slug} page that is itself a BLOG_GONE_SLUGS entry
  // (a dead redirect chain: 301 -> 410). Serving 410 directly removes the
  // pointless hop. The next.config.js rules were removed in the same change.
  "/china-vs-alibaba",
  "/china-supplier-verification",
]
```

- [ ] **Step 4: Add the 20 new entries to `BLOG_GONE_SLUGS`**

In `frontend/lib/gone-paths.ts`, find the end of the `BLOG_GONE_SLUGS` array:

```ts
  "rav4-supply-chain-automotive-sourcing",
  "byd-company-china-supply-chain-guide",
  "bunnings-wholesale-guide",
  "australian-supermarket-china-sourcing-secrets",
]
```

Replace with:

```ts
  "rav4-supply-chain-automotive-sourcing",
  "byd-company-china-supply-chain-guide",
  "bunnings-wholesale-guide",
  "australian-supermarket-china-sourcing-secrets",

  // ============================================
  // Added 2026-07-07 — previously 301-redirected to the generic /article
  // listing page (soft-404 pattern: technically a redirect, but to a page
  // with no real successor content). Converted to 410 for an accurate
  // "this content is gone" signal instead of implying it moved somewhere.
  "tottenham-hotspur",
  "bunnings-wesfarmers-merger-supply-chain",
  "bbq-galore-retail",
  "australian-retail-trends-grilld-coles",
  "kmart-home-retail",
  "bhp",
  "droneshield",
  "reneweconomy",
  "fitbit-air-sourcing",
  "oura-ring-5-wearable-tech-china-sourcing-guide",
  "007-first-light-sourcing",
  "adam-walton-policy-australian-businesses",
  "australian-business-bankruptcy-2026",
  "road-safety-australia-freight-operations",
  "australia-mining-capital-gains-tax-importers",
  "extreme-weather-supply-chain-risk",
  "kenya-sourcing-destination",
  "dubai-international-airport-australia-china-freight",

  // Added 2026-07-07 — next.config.js redirected these to a destination
  // that is itself a BLOG_GONE_SLUGS entry (dead redirect chain: 301 ->
  // 410). Adding the source slug here + removing the next.config.js rule
  // collapses it to a single direct 410.
  "byd-company-supply-chain-guide",
  "electric-battery-supply-chain-china-sourcing-guide",
]
```

- [ ] **Step 5: Remove the 18 moved entries from `BLOG_REDIRECT_TARGETS`**

In `frontend/lib/gone-paths.ts`, replace the entire `BLOG_REDIRECT_TARGETS` block:

```ts
export const BLOG_REDIRECT_TARGETS: Record<string, string> = {
  // Duplicate of the real /services page — 301 to consolidate (2026-06-26 SEO audit).
  "services-wag": "/services",
  "resource-how-to-verify-chinese-factories-1688": "/article/verify-chinese-supplier",
  "resource-shenzhen-factory-visit": "/article/china-factory-tour-guide",
  "resource-should-i-pay-deposit-chinese-supplier": "/article/how-to-negotiate-chinese-factory-guide",
  "resource-chinese-supplier-quality-not-as-promised": "/article/china-sourcing-risks",

  // Migrated from redirects.js (2026-07-05) — that file only covered /article/{slug},
  // so /resources/{slug} fell through to the /article/{slug} fallback below, then hit
  // redirects.js for a second hop. Registering here gives both paths a single 301.
  "tottenham-hotspur": "/article",
  "bunnings-wesfarmers-merger-supply-chain": "/article",
  "bbq-galore-retail": "/article",
  "australian-retail-trends-grilld-coles": "/article",
  "kmart-home-retail": "/article",
  "bhp": "/article",
  "droneshield": "/article",
  "reneweconomy": "/article",
  "fitbit-air-sourcing": "/article",
  "oura-ring-5-wearable-tech-china-sourcing-guide": "/article",
  "007-first-light-sourcing": "/article",
  "adam-walton-policy-australian-businesses": "/article",
  "australian-business-bankruptcy-2026": "/article",
  "road-safety-australia-freight-operations": "/article",
  "australia-mining-capital-gains-tax-importers": "/article",
  "extreme-weather-supply-chain-risk": "/article",
  "kenya-sourcing-destination": "/article",
  "dubai-international-airport-australia-china-freight": "/article",
}
```

with:

```ts
export const BLOG_REDIRECT_TARGETS: Record<string, string> = {
  // Duplicate of the real /services page — 301 to consolidate (2026-06-26 SEO audit).
  "services-wag": "/services",
  "resource-how-to-verify-chinese-factories-1688": "/article/verify-chinese-supplier",
  "resource-shenzhen-factory-visit": "/article/china-factory-tour-guide",
  "resource-should-i-pay-deposit-chinese-supplier": "/article/how-to-negotiate-chinese-factory-guide",
  "resource-chinese-supplier-quality-not-as-promised": "/article/china-sourcing-risks",
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx jest lib/gone-paths.test.ts`
Expected: PASS — all 6 assertions green.

- [ ] **Step 7: Commit**

```bash
git add lib/gone-paths.ts lib/gone-paths.test.ts
git commit -m "fix(seo): convert 20 soft-404 blog slugs from redirect to 410, add 2 legacy bare-slug gone paths"
```

---

### Task 2: Remove the 4 dead-redirect-chain rules from next.config.js and extend proxy.ts matcher

**Files:**
- Modify: `frontend/next.config.js`
- Modify: `frontend/proxy.ts`

**Interfaces:**
- Consumes: `isGonePath`, `isBlogGoneSlug` from `frontend/lib/gone-paths.ts` (unchanged signatures, now returning `true` for the paths/slugs added in Task 1).
- Produces: no new exports — this task only changes route configuration. Nothing downstream depends on it besides the manual verification within this task.

- [ ] **Step 1: Confirm the current (broken) behavior before touching code**

Start the dev server in one terminal: `npm run dev`

In another terminal, run:

```bash
node -e "
const urls = [
  'http://localhost:3000/china-vs-alibaba',
  'http://localhost:3000/china-supplier-verification',
  'http://localhost:3000/article/byd-company-supply-chain-guide',
  'http://localhost:3000/article/electric-battery-supply-chain-china-sourcing-guide',
];
(async () => {
  for (const url of urls) {
    const res = await fetch(url, { redirect: 'manual' });
    console.log(res.status, res.headers.get('location'), url);
  }
})();
"
```

Expected (current, broken behavior): all 4 print `301` with a `location` header — Task 1's data change alone doesn't fix these, because `next.config.js` still intercepts these paths before `proxy.ts` ever runs.

- [ ] **Step 2: Remove the 4 dead-chain rules from `next.config.js`**

In `frontend/next.config.js`, remove this block (in the "Blog slug redirects" section):

```js
      {
        source: '/china-vs-alibaba',
        destination: '/article/china-vs-alibaba',
        permanent: true,
      },
```

Remove this block (in the "Blog slug redirects" section):

```js
      {
        source: '/china-supplier-verification',
        destination: '/article/china-supplier-verification',
        permanent: true,
      },
```

Remove this block (in the "Duplicate article consolidation" section):

```js
      {
        source: '/article/byd-company-supply-chain-guide',
        destination: '/article/byd-company-china-supply-chain-guide',
        permanent: true,
      },
```

Remove this block (in the "Duplicate article consolidation" section):

```js
      {
        source: '/article/electric-battery-supply-chain-china-sourcing-guide',
        destination: '/article/electric-battery-china',
        permanent: true,
      },
```

- [ ] **Step 3: Add the 2 legacy bare-slug paths to `proxy.ts`'s matcher**

In `frontend/proxy.ts`, replace:

```ts
export const config = {
  matcher: [
    "/factory/:path*",
    "/client/:path*", "/api/client/:path*",
    "/case-studies/:path*", "/adelaide", "/perth", "/brisbane", "/melbourne",
    "/article/:slug*",
    "/resources/:slug*",
  ],
}
```

with:

```ts
export const config = {
  matcher: [
    "/factory/:path*",
    "/client/:path*", "/api/client/:path*",
    "/case-studies/:path*", "/adelaide", "/perth", "/brisbane", "/melbourne",
    "/china-vs-alibaba", "/china-supplier-verification",
    "/article/:slug*",
    "/resources/:slug*",
  ],
}
```

- [ ] **Step 4: Restart the dev server and re-run the same 4-URL check**

Config/middleware changes require a dev server restart. Stop `npm run dev`, start it again, then re-run the exact command from Step 1.

Expected: all 4 now print `410`.

- [ ] **Step 5: Run the full 22-URL verification**

```bash
node -e "
const goneUrls = [
  'http://localhost:3000/article/tottenham-hotspur',
  'http://localhost:3000/article/bunnings-wesfarmers-merger-supply-chain',
  'http://localhost:3000/article/bbq-galore-retail',
  'http://localhost:3000/article/australian-retail-trends-grilld-coles',
  'http://localhost:3000/article/kmart-home-retail',
  'http://localhost:3000/article/bhp',
  'http://localhost:3000/article/droneshield',
  'http://localhost:3000/article/reneweconomy',
  'http://localhost:3000/article/fitbit-air-sourcing',
  'http://localhost:3000/article/oura-ring-5-wearable-tech-china-sourcing-guide',
  'http://localhost:3000/article/007-first-light-sourcing',
  'http://localhost:3000/article/adam-walton-policy-australian-businesses',
  'http://localhost:3000/article/australian-business-bankruptcy-2026',
  'http://localhost:3000/article/road-safety-australia-freight-operations',
  'http://localhost:3000/article/australia-mining-capital-gains-tax-importers',
  'http://localhost:3000/article/extreme-weather-supply-chain-risk',
  'http://localhost:3000/article/kenya-sourcing-destination',
  'http://localhost:3000/article/dubai-international-airport-australia-china-freight',
  'http://localhost:3000/china-vs-alibaba',
  'http://localhost:3000/china-supplier-verification',
  'http://localhost:3000/article/byd-company-supply-chain-guide',
  'http://localhost:3000/article/electric-battery-supply-chain-china-sourcing-guide',
];
(async () => {
  let failures = 0;
  for (const url of goneUrls) {
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status !== 410) { failures++; console.log('FAIL', res.status, url); }
    else { console.log('PASS 410', url); }
  }
  console.log(failures === 0 ? 'ALL 22 PASS' : \`\${failures} FAILURES\`);
})();
"
```

Expected: `ALL 22 PASS`.

- [ ] **Step 6: Regression-check retained redirects and client auth**

```bash
node -e "
const checks = [
  ['http://localhost:3000/services-wag', 301],
  ['http://localhost:3000/china-sourcing-agent-australia', 301],
  ['http://localhost:3000/article/av-equipment-procurement-china', 301],
  ['http://localhost:3000/resources/how-to-verify-chinese-factories-1688', 301],
];
(async () => {
  for (const [url, expectStatus] of checks) {
    const res = await fetch(url, { redirect: 'manual' });
    console.log(res.status === expectStatus ? 'PASS' : 'FAIL', url, '->', res.status, res.headers.get('location'));
  }
  const clientRes = await fetch('http://localhost:3000/client/test-slug/test-project', { redirect: 'manual' });
  console.log(clientRes.status === 302 ? 'PASS' : 'FAIL', 'client auth guard ->', clientRes.status, clientRes.headers.get('location'));
})();
"
```

Expected: all `PASS` — the retained redirects still 301 to their original destinations, and the client portal auth guard still 302s to its login URL (unaffected by this change).

- [ ] **Step 7: Verify sitemap excludes the new gone slugs**

```bash
node -e "
const bad = ['tottenham-hotspur','bunnings-wesfarmers-merger-supply-chain','bbq-galore-retail','australian-retail-trends-grilld-coles','kmart-home-retail','bhp','droneshield','reneweconomy','fitbit-air-sourcing','oura-ring-5-wearable-tech-china-sourcing-guide','007-first-light-sourcing','adam-walton-policy-australian-businesses','australian-business-bankruptcy-2026','road-safety-australia-freight-operations','australia-mining-capital-gains-tax-importers','extreme-weather-supply-chain-risk','kenya-sourcing-destination','dubai-international-airport-australia-china-freight','byd-company-supply-chain-guide','electric-battery-supply-chain-china-sourcing-guide'];
(async () => {
  const res = await fetch('http://localhost:3000/sitemap.xml');
  const xml = await res.text();
  const leaked = bad.filter(slug => xml.includes('/article/' + slug + '<'));
  console.log(leaked.length === 0 ? 'PASS: sitemap excludes all 20 new gone slugs' : 'FAIL: leaked ' + leaked.join(', '));
})();
"
```

Expected: `PASS: sitemap excludes all 20 new gone slugs`.

- [ ] **Step 8: Production build check**

Run: `npm run build`
Expected: build succeeds with no new errors (Next.js validates the `redirects()` array shape at build time — this catches any syntax mistake from Step 2's edits).

Run: `npm run lint`
Expected: no new lint errors.

- [ ] **Step 9: Commit**

```bash
git add next.config.js proxy.ts
git commit -m "fix(seo): remove 4 next.config.js rules that shadowed 410s with a dead redirect chain"
```

---

### Task 3: Add a 5-second auto-redirect-to-home countdown to the 404 and 410 pages

**Files:**
- Create: `frontend/app/components/AutoRedirectCountdown.tsx`
- Modify: `frontend/app/not-found.tsx`
- Modify: `frontend/app/gone/page.tsx`

**Interfaces:**
- Consumes: `useRouter` from `next/navigation` (Next.js built-in).
- Produces: `export default function AutoRedirectCountdown(): JSX.Element` — a client component with no props, rendered directly by both pages.

- [ ] **Step 1: Create the component**

Create `frontend/app/components/AutoRedirectCountdown.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const REDIRECT_SECONDS = 5
const REDIRECT_TARGET = '/'

// Visible countdown that sends the user home after REDIRECT_SECONDS.
// Existing page buttons/links are untouched and remain clickable the
// whole time — this only fires if the user hasn't already navigated away.
export default function AutoRedirectCountdown() {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.push(REDIRECT_TARGET)
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, router])

  return (
    <p className="text-blue-200 text-sm mt-6">
      Redirecting to home in {secondsLeft}s...
    </p>
  )
}
```

- [ ] **Step 2: Wire it into the 404 page**

In `frontend/app/not-found.tsx`, replace:

```tsx
import Footer from '@/components/Footer'
```

with:

```tsx
import Footer from '@/components/Footer'
import AutoRedirectCountdown from '@/components/AutoRedirectCountdown'
```

Then replace:

```tsx
            <Link
              href="/services"
              className="border border-white/30 text-white px-8 py-4 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>
```

with:

```tsx
            <Link
              href="/services"
              className="border border-white/30 text-white px-8 py-4 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              View Services
            </Link>
          </div>
          <AutoRedirectCountdown />
        </div>
      </section>
```

- [ ] **Step 3: Wire it into the 410 page**

In `frontend/app/gone/page.tsx`, replace:

```tsx
import Footer from '@/components/Footer'
```

with:

```tsx
import Footer from '@/components/Footer'
import AutoRedirectCountdown from '@/components/AutoRedirectCountdown'
```

Then replace:

```tsx
            <Link
              href="/"
              className="border border-white/30 text-white px-8 py-4 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
```

with:

```tsx
            <Link
              href="/"
              className="border border-white/30 text-white px-8 py-4 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Back to Home
            </Link>
          </div>
          <AutoRedirectCountdown />
        </div>
      </section>
```

- [ ] **Step 4: Manual browser verification**

Start the dev server if it isn't already running: `npm run dev`

Using `browser-harness` (documented in `frontend/CLAUDE.md` § Browser Verification):

```
browser-harness <<'PY'
new_tab("http://localhost:3000/this-path-does-not-exist-xyz")
wait_for_load()
print(js('document.body.innerText.includes("Redirecting to home in")'))
sleep(6)
print(js('window.location.pathname'))
PY
```

Expected: first print is `True` (countdown text present), second print is `/` (redirect fired after ~5s).

Repeat against `http://localhost:3000/gone` for the 410 page — same expectation.

- [ ] **Step 5: Manually verify buttons still work during the countdown**

```
browser-harness <<'PY'
new_tab("http://localhost:3000/this-path-does-not-exist-xyz")
wait_for_load()
click("text=Back to Home")
sleep(1)
print(js('window.location.pathname'))
PY
```

Expected: `/` — clicking the button navigates immediately, well before the 5-second timer would fire, confirming the countdown never disables the existing buttons.

- [ ] **Step 6: Build and lint check**

Run: `npm run build`
Expected: succeeds, no new errors (confirms the `'use client'` boundary is valid and the component type-checks).

Run: `npm run lint`
Expected: no new lint errors.

- [ ] **Step 7: Commit**

```bash
git add app/components/AutoRedirectCountdown.tsx app/not-found.tsx app/gone/page.tsx
git commit -m "feat(errors): auto-redirect 404/410 pages to home after 5s, buttons remain clickable"
```
