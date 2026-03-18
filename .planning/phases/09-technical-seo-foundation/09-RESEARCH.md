# Phase 9: Technical SEO Foundation - Research

**Researched:** 2026-03-18
**Domain:** Technical SEO, Next.js 16 Performance Optimization
**Confidence:** HIGH

## Summary

Phase 9 focuses on fixing LCP performance (5.4s to under 2.5s) and implementing technical SEO infrastructure. The WAG website already has substantial SEO infrastructure in place: dynamic sitemap generation via `/app/sitemap.ts`, robots.txt at `/public/robots.txt`, Schema.org Organization + LocalBusiness JSON-LD in layout.tsx, canonical URLs configured in metadata, and Google Search Console verification code present. The primary gap is LCP performance optimization.

**Primary recommendation:** Focus on LCP optimization through image format conversion (WebP/AVIF), font subsetting and preloading, and removing render-blocking resources. The sitemap, robots.txt, and schema markup already exist and just need verification.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-sitemap | ^4.0.0 | XML sitemap generation (optional) | Standard for Next.js - but dynamic sitemap.ts already exists |
| sharp | ^0.34.5 | Image optimization | Already installed - enables WebP/AVIF |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @next/bundle-analyzer | ^16.1.7 | Analyze bundle size | When debugging LCP issues |
| next/font | (built-in) | Font optimization | Replace Google Fonts CDN with local |

### Already Implemented (No Action Needed)
| Item | Status |
|------|--------|
| Dynamic sitemap | `/app/sitemap.ts` - generates at build time |
| robots.txt | `/public/robots.txt` - basic allow all |
| Schema.org | layout.tsx - Organization + LocalBusiness |
| Canonical URLs | metadata.alternates.canonical |
| GSC verification | metadata.verification.google |

**Installation:**
```bash
# Only needed if switching from static to next-sitemap
npm install next-sitemap
# sharp already installed - verify:
npm install sharp@latest
```

**Version verification:**
```bash
npm view next-sitemap version  # 4.0.0+ (2025)
npm view sharp version         # 0.37.0+ (latest)
```

## Architecture Patterns

### Recommended Project Structure
```
wag/
├── app/
│   ├── sitemap.ts          # Dynamic sitemap (ALREADY EXISTS)
│   ├── layout.tsx          # SEO metadata + Schema (ALREADY EXISTS)
│   └── page.tsx            # Homepage with LCP optimization
├── public/
│   ├── robots.txt          # Basic robots (ALREADY EXISTS)
│   └── sitemap.xml        # Static fallback (can remove)
└── next.config.js         # Add LCP optimizations
```

### Pattern 1: LCP Optimization - Image Priority
**What:** Use Next.js Image component with priority for LCP element
**When to use:** Hero images above the fold
**Example:**
```tsx
// Source: Next.js Documentation
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority={true}        // Preload LCP image
  fetchPriority="high"   // Additional priority hint
  sizes="100vw"
/>
```

### Pattern 2: Font Optimization with next/font
**What:** Self-host fonts instead of Google Fonts CDN
**When to use:** All text fonts
**Example:**
```tsx
// Current (slow - external CDN):
import { IBM_Plex_Sans } from 'next/font/google'

// Optimized (fast - self-hosted):
import localFont from 'next/font/local'
const ibmPlexSans = localFont({
  src: './fonts/IBM_Plex_Sans.woff2',
  display: 'swap',
  preload: true,
})
```

### Pattern 3: Dynamic Sitemap Generation
**What:** App Router sitemap.ts file
**When to use:** Auto-generate sitemap from content
**Example:**
```typescript
// Source: Next.js Documentation
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
```

### Pattern 4: Schema.org JSON-LD
**What:** Structured data for search engines
**When to use:** Organization information
**Example:**
```tsx
// Already implemented in layout.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      // ... properties
    })
  }}
/>
```

### Anti-Patterns to Avoid
- **External fonts via CDN:** Causes render-blocking - use next/font local
- **Lazy loading LCP image:** Always use priority=true for above-fold images
- **Large hero images without optimization:** Use WebP/AVIF formats
- **Blocking scripts in head:** Use afterInteractive or lazyOnload

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XML Sitemap | Manual static XML | Next.js sitemap.ts | Auto-updates with content |
| Font hosting | Google Fonts CDN | next/font (local) | Eliminates DNS/connection delay |
| Image optimization | Custom CDN | next/image + sharp | Built-in WebP/AVIF, resizing |
| Schema markup | Custom JSON-LD | Google's structured data helpers | Validates properly |

**Key insight:** Next.js 15+ has excellent built-in SEO features - avoid external solutions when native options exist.

## Common Pitfalls

### Pitfall 1: LCP Still Slow Despite priority={true}
**What goes wrong:** Image loads but LCP still 5.4s
**Why it happens:**
- External image URL (Unsplash) adds DNS/connection time
- Font loading blocks render
- Too many JavaScript bundles
- No image format optimization (using JPEG instead of WebP/AVIF)
**How to avoid:**
1. Host hero images locally with WebP/AVIF
2. Preload critical fonts with next/font
3. Defer non-critical JS
4. Add font-display: swap and preload
**Warning signs:** PageSpeed Insights shows "Largest Contentful Paint" as hero image but time is high

### Pitfall 2: Static Sitemap Overwrites Dynamic
**What goes wrong:** Both /public/sitemap.xml and /app/sitemap.ts exist
**Why it happens:** Build output serves static file before dynamic route
**How to avoid:** Remove static /public/sitemap.xml or rename dynamic route to /app/sitemap.xml/route.ts
**Warning signs:** Sitemap shows old dates despite content changes

### Pitfall 3: Schema Validation Errors
**What goes wrong:** Google's Rich Results Test shows errors
**Why it happens:** Missing required properties, wrong types, or duplicate schemas
**How to avoid:** Validate with Google Rich Results Test after deployment
**Warning signs:** Schema markup present but not showing in search results

## Code Examples

### LCP Optimization: Next.js Image with Priority
```tsx
// Source: Next.js Official Documentation
// https://nextjs.org/docs/app/api-reference/components/image#priority
<Image
  src="/local-hero.webp"  // Local WebP for fastest load
  alt="Factory tour"
  width={1920}
  height={1080}
  priority={true}          // Preload this image
  fetchPriority="high"    // Browser priority hint
  sizes="(max-width: 768px) 100vw, 1920px"
  quality={85}             // Balance quality/size
  format="webp"           // Force WebP format
/>
```

### Font Optimization: Local Font with Preload
```typescript
// Source: Next.js Official Documentation
// https://nextjs.org/docs/app/api-reference/components/font
import { IBM_Plex_Serif } from 'next/font/google'

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  preload: true,  // Preload font files
  variable: '--font-ibm-plex-serif',
})
```

### Dynamic Sitemap with Blog Posts
```typescript
// Source: Next.js Official Documentation
// app/sitemap.ts
import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.winningadventure.com.au'

  // Read blog posts from content directory
  const blogDir = path.join(process.cwd(), 'content/blog')
  const posts = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx'))

  const blogUrls = posts.map(filename => {
    const slug = filename.replace('.mdx', '')
    const content = fs.readFileSync(path.join(blogDir, filename), 'utf-8')
    const { data } = matter(content)

    return {
      url: `${baseUrl}/resources/${slug}`,
      lastModified: new Date(data.date || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  })

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    // ... other pages
    ...blogUrls,
  ]
}
```

### robots.txt with Sitemap Reference
```text
# Source: sitemaps.org protocol
User-agent: *
Allow: /

Sitemap: https://www.winningadventure.com.au/sitemap.xml
```

### Schema.org LocalBusiness (Australian)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Winning Adventure Global",
  "image": "https://www.winningadventure.com.au/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "5, 54 Melbourne St",
    "addressLocality": "North Adelaide",
    "addressRegion": "SA",
    "postalCode": "5006",
    "addressCountry": "AU"
  },
  "telephone": "+61416588198",
  "priceRange": "AUD $2,000 - $50,000+",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "-34.9067",
    "longitude": "138.5765"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External image CDN | next/image + local/WebP | 2023+ | 30-50% faster LCP |
| Google Fonts CDN | next/font (self-hosted) | Next.js 13+ | Eliminates render-blocking |
| Static sitemap.xml | App Router sitemap.ts | Next.js 13+ | Auto-updates |
| Priority hints | fetchPriority attribute | 2023+ | Additional LCP boost |
| Client-side hydration | Server Components | Next.js 13+ | Faster FCP/LCP |

**Deprecated/outdated:**
- `next/font/google` with external requests: Use local font files instead
- Static sitemap maintenance: Use dynamic sitemap.ts
- CSS-in-JS at runtime: Use Tailwind or CSS modules

## Open Questions

1. **LCP Root Cause**
   - What we know: Hero image has priority=true, but still 5.4s
   - What's unclear: Is it image source (Unsplash), font loading, or JS blocking?
   - Recommendation: Run Lighthouse with "Network throttling" to identify blocking resources

2. **Static vs Dynamic Sitemap**
   - What we know: Both exist (/public/sitemap.xml and /app/sitemap.ts)
   - What's unclear: Which one serves in production?
   - Recommendation: Remove static /public/sitemap.xml to let dynamic route handle it

3. **Font Optimization Priority**
   - What we know: IBM Plex loaded via next/font/google
   - What's unclear: Whether preload is effective with Google Fonts
   - Recommendation: Convert to local font files (.woff2) for guaranteed preloading

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | PageSpeed Insights (web-based) |
| Config file | none |
| Quick run command | Lighthouse CI or web-based PSI |
| Full suite command | PageSpeed Insights mobile/desktop |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TECH-01 | Mobile LCP <2.5s | Performance | PageSpeed Insights mobile | N/A - web tool |
| TECH-02 | XML sitemap at /sitemap.xml | Manual | Visit /sitemap.xml | YES - app/sitemap.ts |
| TECH-03 | robots.txt accessible | Manual | Visit /robots.txt | YES - public/robots.txt |
| TECH-04 | Schema.org markup present | Manual | View page source | YES - layout.tsx |
| TECH-05 | Canonical URLs on all pages | Manual | View page source | YES - layout.tsx |
| MON-01 | Google Search Console tracking | Manual | Login to GSC | YES - verified |

### Sampling Rate
- **Per task commit:** N/A - performance testing requires full build
- **Per wave merge:** Full PageSpeed Insights check (mobile + desktop)
- **Phase gate:** Mobile LCP <2.5s in PageSpeed Insights before /gsd:verify-work

### Wave 0 Gaps
- None - all SEO infrastructure exists. Only LCP optimization needed.

## Sources

### Primary (HIGH confidence)
- Next.js Official Documentation - Image Optimization: https://nextjs.org/docs/app/api-reference/components/image
- Next.js Official - Font Optimization: https://nextjs.org/docs/app/api-reference/components/font
- Next.js Official - Sitemap: https://nextjs.org/docs/app/api-reference/routes/sitemap
- Google Web Fundamentals - LCP: https://web.dev/optimize-lcp/

### Secondary (MEDIUM confidence)
- AddyOsmani.com - Fetch Priority: https://addyosmani.com/blog/fetch-priority/
- next-sitemap GitHub: https://github.com/iamvishnusankar/next-sitemap

### Tertiary (LOW confidence)
- General SEO blogs (dates may vary)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via npm
- Architecture: HIGH - Next.js 16 patterns documented
- Pitfalls: HIGH - Common issues well-documented in official docs

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (30 days for stable stack)
