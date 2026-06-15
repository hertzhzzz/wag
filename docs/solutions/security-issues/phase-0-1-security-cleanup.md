---
title: "Phase 0-1 Security Cleanup: Hardcoded Fallback Secrets and Git History Leaks"
date: 2026-06-15
category: security-issues
module: frontend
problem_type: security_issue
component: authentication
severity: critical
symptoms:
  - "Hardcoded fallback secret 'dev-secret-change-me' in admin-hmac.ts allowed forged HMAC signatures when ADMIN_SESSION_SECRET was unset"
  - "Factory auth middleware `|| ''` bypass vector: empty FACTORY_AUTH_TOKEN made any cookie match, granting unauthorized /factory access"
  - "62 AI pipeline prompt files publicly served via public/social/blog/ on production domain"
  - "Client bcrypt hashes (secrets.json) tracked in public git repo github.com/hertzhzzz/wag"
  - "GCP service account private key committed to git history, accessible to anyone cloning the public repo"
root_cause: config_error
resolution_type: code_fix
related_components:
  - tooling
tags:
  - hardcoded-credentials
  - fallback-secrets
  - fail-open
  - git-leak
  - open-redirect
  - auth-bypass
  - secret-management
  - git-filter-repo
---

# Phase 0-1 Security Cleanup: Hardcoded Fallback Secrets and Git History Leaks

## Problem

A public-facing Next.js monorepo with a public GitHub repo contained multiple classes of secrets exposure. Hardcoded fallback credentials in auth verification code created production auth-bypass vectors. AI pipeline prompt assets leaked proprietary content strategy on the production domain. Client access-code bcrypt hashes and a GCP service account private key were committed to git history, readable by anyone cloning the repo. The combination meant compromised credentials could not be rotated by simply changing env vars — the git history itself was a persistent source of valid authentication material.

## Symptoms

1. **HMAC bypass (fail-open fallback):** `lib/admin-hmac.ts` used `process.env.ADMIN_SESSION_SECRET || "dev-secret-change-me"`. If `ADMIN_SESSION_SECRET` was ever unset in production, the HMAC key became the literal string `"dev-secret-change-me"` — discoverable in the public repo. Any attacker reading the source could forge valid admin session tokens.

2. **Factory auth bypass (empty-string match):** `middleware.ts`'s `handleFactoryAuth` used `(process.env.FACTORY_AUTH_TOKEN || "").trim()`. When `FACTORY_AUTH_TOKEN` was unset, the expected token became `""` (empty string). Since the guard checked `!authToken || authToken.value !== expected`, an empty `expected` value caused the entire verification to short-circuit — any request without a cookie (or with any cookie value) would bypass auth.

3. **Open redirect in factory auth:** `POST /api/factory/auth` redirected to `new URL(from, request.url)` with zero origin validation on the `from` parameter, allowing `from=https://evil.com` to redirect users off-site after login.

4. **62 prompt/outline files in production `public/social/blog/`:** Every AI pipeline run deposited `outline.md`, `prompts/01-*.md`, and `batch.json` into `public/`. These contained proprietary content strategy (target audience, infographic layout specs, color palette instructions) and were directly accessible at `https://www.winningadventure.com.au/social/blog/{slug}/outline.md`.

5. **Client bcrypt hashes in git:** `data/clients/secrets.json` was committed with production bcrypt hashes. Both `aaron-sansoni` and `master` entries shared identical hash values, revealing they used the same access code. (session history)

6. **GCP service account key in git history:** `config/gen-lang-client-0955676066-d044932c35c9.json` contained a full RSA private key in 3 commits (April 9-10, 2026). Later replaced with a symlink, but the key persisted in prior commit objects. Repo is public. (session history)

7. **Serper API key hardcoded:** `config/serper_config.json` contained a live API key. The gitignore entry `config/*.json` was missing. (session history)

The IndexNow route (`app/api/indexnow/route.ts`) was also found to have its key hardcoded — a prior instance of the same anti-pattern documented in a separate session (May 31, 2026). (session history)

## What Didn't Work

1. **Selective `.gitignore` additions:** The `.gitignore` caught individual leaked files but missed entire directories. Adding rules one-by-one after discovering each leak led to a perpetually incomplete ignore list.

2. **`git rm` without history rewrite:** Removing `secrets.json` from the working tree via `git rm` only removed it from future commits — the file remained in all prior commits in the public history.

3. **Assuming `public/` was safe for pipeline artifacts:** The content pipeline wrote AI prompts to `public/social/blog/{slug}/` because that was the same directory used for cover images. Next.js serves `public/` unconditionally — there is no selective exclusion. Changing the output target to a non-public directory required pipeline restructuring that was deferred. (session history)

4. **Environment variable fallback as dev convenience:** The `|| "dev-secret"` pattern was originally introduced so local dev worked without setting all env vars. A grep for `|| ""` and `|| "` across the codebase was proposed as a pre-commit hook but the regex produced false positives on legitimate empty-string defaults for non-security config values.

## Solution

Four discrete code-level fixes applied in commit `732c002`, plus a subsequent commit for the GCP key remediation:

### Fix 1 — HMAC secret: fail-closed instead of hardcoded fallback

`lib/admin-hmac.ts`:

```typescript
// BEFORE (fail-open):
const SECRET = () => process.env.ADMIN_SESSION_SECRET || "dev-secret-change-me"

// AFTER (fail-closed):
const SECRET = () => {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error("ADMIN_SESSION_SECRET not set")
  return secret
}
```

Callers in `lib/admin-auth.ts` were wrapped with try/catch to gracefully return `null` instead of crashing:

```typescript
// createAdminSession:
  try { return await signToken(token) } catch { return null }

// validateAdminSession:
  let token: string | null
  try { token = await verifySignedToken(signed) } catch { return null }
```

### Fix 2 — Factory auth middleware: fail-closed

`middleware.ts`:

```typescript
// BEFORE (fail-open — empty string bypass):
function handleFactoryAuth(request: NextRequest): NextResponse {
  const authToken = request.cookies.get("factory_auth")
  if (!authToken || authToken.value !== (process.env.FACTORY_AUTH_TOKEN || "").trim()) {
    // redirect to login
  }

// AFTER (fail-closed — explicit guard):
function handleFactoryAuth(request: NextRequest): NextResponse {
  const expected = process.env.FACTORY_AUTH_TOKEN?.trim()
  if (!expected) {
    return new NextResponse("Auth not configured", { status: 500 })
  }
  const authToken = request.cookies.get("factory_auth")
  if (!authToken || authToken.value !== expected) {
    // redirect to login
  }
```

### Fix 3 — Open redirect: origin validation

`app/api/factory/auth/route.ts`:

```typescript
// BEFORE (unvalidated redirect):
const response = NextResponse.redirect(new URL(from, request.url))

// AFTER (origin-locked):
let redirectUrl: URL
try { redirectUrl = new URL(from, request.url) }
catch { redirectUrl = new URL("/factory", request.url) }
if (redirectUrl.origin !== request.nextUrl.origin) {
  redirectUrl = new URL("/factory", request.url)
}
const response = NextResponse.redirect(redirectUrl)
```

### Fix 4 — Factory auth token: throw instead of default

```typescript
// BEFORE:
const token = (process.env.FACTORY_AUTH_TOKEN || "wag-factory-default-token").trim()

// AFTER:
const token = process.env.FACTORY_AUTH_TOKEN?.trim()
if (!token) throw new Error("FACTORY_AUTH_TOKEN not set")
```

Plus `console.error` added to the catch block so the throw message reaches Vercel logs:

```typescript
  } catch (e) {
    console.error("Factory auth error:", e instanceof Error ? e.message : e)
    return NextResponse.json({ error: "Auth error" }, { status: 500 })
  }
```

### Non-code remediations

| Action | Impact |
|--------|--------|
| Deleted 62 prompt/outline files from `public/social/blog/` | Removes proprietary pipeline strategy from production GET |
| Deleted 29 `resource-*` MDX articles + added `/resources/resource-` to GONE_PATHS | Returns 410 on deleted content |
| Added `data/clients/secrets.json` to `.gitignore` | Prevents future bcrypt hash commits |
| Added `config/*.json` to `.gitignore` (with `!config/ga4_config.json`) | Blocks config API keys, preserves whitelisted GA4 |
| Added `logs/`, `.playwright-mcp/`, `data/logs/`, `data/pipeline.db` to `.gitignore` | Prevents debug artifacts from reaching git |
| GCP service account key rotated in GCP Console + old key deleted | Old key in git history is now invalid |
| `git filter-repo` scrubbed GCP key from all commits + force pushed | Key removed from GitHub history |
| Archived `ads/` to `archive/ads/` | Moves ad creative out of deployable root |
| Deleted `reports/`, `screenshots/` | Removes internal analytics from git |

## Why This Works

The root cause was **configuration missing at runtime silently degrading to known values**. The `|| "fallback"` pattern treats "missing configuration" as recoverable rather than a hard failure. In a deployed environment, a missing secret should never degrade to a known value.

The critical design change across all four code fixes is **fail-closed over fail-open**: when a security-critical configuration is absent, the system refuses to operate rather than admitting access with a weakened or known credential. The `throw Error` pattern propagates through every call site and is caught by the existing middleware/API error boundaries, returning 500 instead of silently accepting forged credentials.

For the git history leak: rotating the GCP key in the cloud console was not sufficient by itself — the old key remained readable in git history. The combination of GCP Console key rotation (making the old key invalid) + `git filter-repo` (removing it from public view) provided defense in depth. Even if someone cloned the repo before the force push, the old key no longer works.

## Prevention

**1. Mandatory secret validation utility**

Replace all direct `process.env.SECRET || "fallback"` with a `requireEnv()` helper that throws:

```typescript
// lib/env.ts
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Required env var ${name} is not set.`)
  }
  return value
}
```

**2. Pre-commit secret scanning**

```bash
# .git/hooks/pre-commit
if git diff --cached | grep -qE '(-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----|sk-[A-Za-z0-9]{20,})'; then
  echo "BLOCKED: commit contains credentials or private keys"
  exit 1
fi
```

**3. Public-directory audit before deploy**

```bash
# scripts/audit-public.sh — flag non-asset files in public/
find public/ -type f ! -name '*.png' ! -name '*.webp' ! -name '*.jpg' \
  ! -name '*.svg' ! -name '*.ico' ! -name '*.woff2' ! -name '*.css' \
  ! -name '*.js' ! -name '*.txt' ! -name '*.xml' -print
```

**4. Pipeline output isolation**

Content pipeline outputs (prompts, outlines, drafts) must write to `content-engine/` or `data/` (both gitignored), never to `public/`.

**5. Vercel env var verification as deploy gate**

```bash
for var in ADMIN_SESSION_SECRET FACTORY_AUTH_TOKEN CLIENT_SECRETS_B64; do
  vercel env ls | grep -q "$var" || { echo "MISSING: $var"; exit 1; }
done
```

## Related Issues

- `docs/solutions/runtime-errors/middleware-edge-kv-crash.md` — middleware.ts touched by both fixes but for different reasons
- `docs/solutions/conventions/1688-content-remediation-checklist.md` — shares grep-based pre-deploy verification pattern

## Related

- IndexNow route hardcoded key (May 31, 2026) — prior instance of the same anti-pattern, resolved separately (session history)
