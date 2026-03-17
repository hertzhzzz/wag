# Stack Research: Vercel Deployment for WAG Website

**Domain:** Next.js Production Deployment
**Researched:** 2026-03-17
**Confidence:** HIGH

## Recommended Stack

### Deployment Platform

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|------------------|
| Vercel | Platform | Hosting & CD | Native Next.js support, zero-config deployment, global CDN |
| Next.js | 14.2.0 | Framework | Current project version, App Router |
| Node.js | 20.x | Runtime | Required by Next.js 14.2, specified in vercel.json |

### Custom Domain Configuration

| Component | Value | Purpose |
|-----------|-------|---------|
| Domain | winningadventure.com.au | Primary domain for Australia-targeting site |
| DNS Type | A record (apex) + CNAME (www) | Standard for .com.au apex domains |
| SSL | Auto-provisioned | Vercel provides free SSL for custom domains |

### Project Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| vercel.json | Build & deployment settings | **Update needed** |
| next.config.js | Next.js configuration | Existing |
| .env.local | Environment variables | Existing (local only) |

---

## Recommended vercel.json Configuration

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "build": {
    "env": {
      "NODE_VERSION": "20.x"
    }
  },
  "framework": "nextjs",
  "regions": ["syd1"],
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api|_next/static|_next/image|favicon.ico).*)",
      "destination": "/"
    }
  ]
}
```

### Configuration Explanation

| Property | Purpose | Why Needed |
|----------|---------|------------|
| `$schema` | IDE autocomplete | Improves DX, catches errors |
| `framework` | Auto-detect override | Explicit for Next.js |
| `regions` | Server location | Sydney closest to Australian users |
| `functions` | API route config | Set timeout for form handling |
| `headers` | Security headers | Protect against common attacks |
| `rewrites` | SPA fallback | Ensure all routes work |

---

## Custom Domain Setup Process

### Step 1: Add Domain in Vercel Dashboard

1. Go to Vercel Dashboard > Project > Settings > Domains
2. Click "Add Domain"
3. Enter: `winningadventure.com.au`
4. Vercel will show DNS records to configure

### Step 2: Configure DNS Records (at Domain Registrar)

For apex domain `winningadventure.com.au`:

| Record Type | Name | Value | TTL |
|------------|------|-------|-----|
| A | @ | 76.76.21.21 | Auto |
| CNAME | www | cname.vercel-dns.com | Auto |

**Note:** Replace `cname.vercel-dns.com` with the actual CNAME shown in Vercel dashboard (unique per project).

### Step 3: Verify & Deploy

- Vercel auto-provisions SSL certificate
- Domain shows "Ready" when verified (may take up to 24 hours)
- Traffic automatically routes to Vercel CDN

---

## Environment Variables for Production

Required in Vercel Project Settings:

| Variable | Current Status | Notes |
|----------|----------------|-------|
| NEXT_PUBLIC_SUPABASE_URL | Not set | Needed for production |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Not set | Needed for production |
| RESEND_API_KEY | Not set | Required for enquiry form |

**Action:** Add these in Vercel Dashboard > Settings > Environment Variables before deployment.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vercel | Netlify | If preferring Netlify's features |
| Vercel | Self-host (VPS) | If needing full server control |
| A + CNAME records | Nameservers | If using Vercel DNS directly |

**Why Vercel for this project:**
- Native Next.js optimization (ISR, SSR, Image Optimization)
- Zero-config deployments from Git
- Free SSL with custom domains
- Closest edge servers to Australian audience (Sydney region)

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Node.js 18 | Next.js 14.2 requires 20.x | Node.js 20.x |
| BuildCommand override | Next.js auto-detects correctly | Remove custom buildCommand |
| outputDirectory: "build" | Next.js uses ".next" | Let Next.js default |

---

## Build & Deploy Commands

Current package.json scripts work without modification:

```bash
# Build (Vercel uses this automatically)
npm run build

# Start (not needed on Vercel - uses Next.js production)
npm run start
```

**Vercel automatically runs:** `npm run build` which executes `next build`

---

## Sources

- [Vercel Project Configuration](https://vercel.com/docs/project-configuration) — **HIGH confidence**
- [Vercel Custom Domains](https://vercel.com/docs/domains/add-a-domain) — **HIGH confidence**
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs) — **HIGH confidence**
- [Vercel vercel.json Schema](https://vercel.com/docs/project-configuration/vercel-json) — **HIGH confidence**

---

*Stack research for: WAG Website v1.1 Deployment*
*Researched: 2026-03-17*
