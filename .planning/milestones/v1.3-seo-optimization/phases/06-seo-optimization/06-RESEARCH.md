# Phase 6: SEO Optimization - Research

**Researched:** 2026-03-18
**Domain:** Search Engine Optimization (SEO) for Next.js 14 websites
**Confidence:** HIGH

## Summary

Phase 6 focuses on optimizing the WAG website for "china sourcing" keyword ranking in Australia. The existing codebase already has a solid foundation with Next.js Metadata API, JSON-LD structured data (Organization, LocalBusiness), sitemap configuration, and FAQ schema. This phase requires enhancing page-level metadata, adding service-specific structured data, optimizing Core Web Vitals, and executing the content strategy with 4-6 targeted blog articles.

**Primary recommendation:** Focus on page-specific metadata optimization first, then implement Service schema, then create the content strategy. The existing structured data foundation is strong and should be extended rather than rebuilt.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Primary keywords:** "china sourcing", "china sourcing australia"
- **Secondary keywords:** "factory visit china", "china sourcing adelaide", "sourcing trip china", "china factory tour"
- **Target geographic:** Australia (Google.com.au)
- **Content strategy:** 4-6 targeted blog articles focusing on informational content
- **Topics:** factory visit guide, supplier verification, procurement tips
- **Local SEO:** Adelaide-based business with location-specific structured data

### Claude's Discretion
- Specific implementation details for page-level metadata
- Internal linking strategy structure
- Blog article titles and structure
- Image alt text optimization approach

### Deferred Ideas (OUT OF SCOPE)
- Link building campaigns - future phase
- Paid search (Google Ads) - explicitly out of scope
- Email newsletter - separate marketing initiative
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | Page-level metadata optimization (unique titles, descriptions per page) | Next.js Metadata API best practices |
| SEO-02 | Structured data implementation (Organization, LocalBusiness, Service schema) | Google Structured Data guidelines |
| SEO-03 | Content strategy with 4-6 targeted blog articles | Content strategy research |
| SEO-04 | Internal linking strategy and image alt text optimization | SEO best practices |
| SEO-05 | Core Web Vitals focus and local SEO optimization | Google PageSpeed Insights / Web Vitals |
</phase_requirements>

## Standard Stack

### Core SEO Tools
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Metadata API | Built-in (14.2+) | Page metadata, OpenGraph, Twitter cards | Official Next.js solution, server-side rendered |
| next-sitemap | Latest | Sitemap generation | Industry standard for Next.js |
| Google Search Console | Web service | Search performance monitoring | Essential for SEO tracking |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/image | Built-in | Image optimization with lazy loading | All images should use next/image |
| @next/bundle-analyzer | Latest | Bundle size analysis | For Core Web Vitals optimization |

**Installation:**
```bash
# No additional packages needed - Next.js built-in SEO features sufficient
npm install --save-dev next-sitemap @next/bundle-analyzer
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── layout.tsx              # Root metadata + JSON-LD (existing)
├── sitemap.ts             # Dynamic sitemap (existing)
├── page.tsx               # Homepage metadata (needs enhancement)
├── services/
│   └── page.tsx           # Services page metadata (needs enhancement)
├── about/
│   └── page.tsx           # About page metadata (needs enhancement)
├── resources/
│   ├── page.tsx           # Resources listing metadata
│   └── [slug]/
│       └── page.tsx       # Dynamic metadata from frontmatter
├── enquiry/
│   └── page.tsx           # Enquiry page metadata (needs enhancement)
├── components/
│   ├── FAQSchema.tsx      # FAQPage structured data (existing)
│   └── ServiceSchema.tsx # NEW: Service schema component
└── data/
    └── services.ts        # Service data for structured data
content/
└── blog/
    ├── bulk-procurement-china-guide.mdx  # Optimize with keywords
    ├── verify-chinese-supplier.mdx       # NEW article
    ├── factory-visit-china-guide.mdx     # NEW article
    ├── china-sourcing-risks.mdx          # NEW article
    ├── china-vs-alibaba.mdx               # NEW article
    └── sourcing-trip-checklist.mdx       # NEW article
```

### Pattern 1: Page-Level Metadata (Next.js 14)

**What:** Dynamic metadata for each page using Next.js Metadata API
**When to use:** Every page needs unique title, description, and OpenGraph tags
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next'

// Static metadata
export const metadata: Metadata = {
  title: 'China Sourcing Services | Winning Adventure Global',
  description: 'Expert China sourcing services for Australian businesses. Factory tours, supplier verification, and procurement support.',
}

// Dynamic metadata (for blog posts)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  return {
    title: post.seoTitle || post.title,
    description: post.description,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords],
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.description,
      images: [{ url: post.coverImage, alt: post.coverImageAlt }],
    },
  }
}
```

### Pattern 2: Structured Data (JSON-LD)

**What:** Schema.org structured data for rich search results
**When to use:** Organization, LocalBusiness, FAQPage, Service pages
**Example:**
```typescript
// Source: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
function ServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "China Factory Tour Service",
    "provider": {
      "@type": "Organization",
      "name": "Winning Adventure Global",
      "url": "https://www.winningadventure.com.au"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Australia"
    },
    "description": "Guided factory tours in China for Australian businesses...",
    "serviceType": ["Factory Tour", "Supplier Verification", "Procurement Support"]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### Pattern 3: Internal Linking Strategy

**What:** Contextual links between pages to distribute page authority
**When to use:** Blog articles should link to service pages, and vice versa
**Example:**
```typescript
// In blog article about supplier verification:
<Link href="/services" className="text-navy-600 hover:underline">
  Learn about our supplier verification services
</Link>

// In services page:
<Link href="/resources/verify-chinese-supplier" className="text-navy-600 hover:underline">
  Read our guide to verifying Chinese suppliers
</Link>
```

### Pattern 4: Breadcrumb Navigation Schema

**What:** Structured data for breadcrumb navigation in search results
**When to use:** All nested pages (e.g., /resources/[slug])
**Example:**
```typescript
// In app/resources/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    alternates: {
      canonical: `https://www.winningadventure.com.au/resources/${params.slug}`,
      languages: {
        en: `https://www.winningadventure.com.au/resources/${params.slug}`,
      },
    },
  }
}
```

### Anti-Patterns to Avoid

- **Duplicate metadata:** Every page must have unique title and description
- **Missing alt text:** All images must have descriptive alt text (not just "image")
- **Excessive internal links:** Keep contextual, relevant links only
- **Keyword stuffing:** Natural language, not forced keyword repetition
- **Missing hreflang:** Not required for single-language site but canonical is essential

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap generation | Custom XML generation | Next.js built-in sitemap.ts | Built-in support, auto-updates |
| Image optimization | Custom lazy loading | next/image | Automatic WebP/AVIF, responsive sizes |
| Metadata handling | Client-side meta tags | Next.js Metadata API | Server-side rendered, no layout shift |
| Structured data | Manual JSON-LD | Schema.org guidelines | Google's recommended format |

**Key insight:** Next.js 14 provides excellent built-in SEO capabilities. The Metadata API handles all standard SEO requirements without additional packages.

## Common Pitfalls

### Pitfall 1: Duplicate Metadata Across Pages
**What goes wrong:** All pages have same title/description from root layout
**Why it happens:** Not exporting page-specific metadata
**How to avoid:** Export metadata from each page.tsx file
**Warning signs:** Search results show "Winning Adventure Global — ..." for all pages

### Pitfall 2: Missing Alt Text on Images
**What goes wrong:** Images have no alt or generic alt="image"
**Why it happens:** Using standard <img> instead of next/image
**How to avoid:** Use next/image with descriptive alt prop
**Warning signs:** Accessibility audit failures, missing alt in search results

### Pitfall 3: Not Using Next.js Link for Internal Links
**What goes wrong:** Using <a> tags for internal navigation
**Why it happens:** Not understanding Next.js Link component
**How to avoid:** Always use <Link> component for internal pages
**Warning signs:** Slower page transitions, missing prefetching

### Pitfall 4: Ignoring Core Web Vitals
**What goes wrong:** Poor LCP, FID, or CLS scores
**Why it happens:** Large images, render-blocking resources, layout shifts
**How to avoid:** Use next/image, optimize fonts, reserve space for dynamic content
**Warning signs:** Poor Google PageSpeed Insights scores

### Pitfall 5: Not Updating Sitemap for New Content
**What goes wrong:** New blog posts not appearing in sitemap
**Why it happens:** Sitemap not dynamically generating from content
**How to avoid:** Use dynamic sitemap.ts (already implemented)

## Code Examples

### Homepage Metadata Enhancement
```typescript
// app/page.tsx - Homepage specific metadata
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'China Sourcing Australia | Factory Tours & Supplier Verification',
  description: 'Winning Adventure Global helps Australian businesses source from China with factory tours, supplier verification, and end-to-end procurement support. Based in Adelaide.',
  keywords: [
    'china sourcing',
    'china sourcing australia',
    'factory visit china',
    'china sourcing adelaide',
    'sourcing trip china',
    'china factory tour',
    'supplier verification china',
  ],
  openGraph: {
    title: 'China Sourcing Australia | Factory Tours & Supplier Verification',
    description: 'Expert China sourcing services for Australian businesses. Book your factory tour today.',
    url: 'https://www.winningadventure.com.au/',
    siteName: 'Winning Adventure Global',
  },
}
```

### Services Page with Service Schema
```typescript
// app/services/page.tsx
import type { Metadata } from 'next'
import ServiceSchema from '@/components/ServiceSchema'

export const metadata: Metadata = {
  title: 'China Sourcing Services | Factory Tours & Supplier Verification',
  description: 'Our China sourcing services include factory tours, supplier verification, quality inspections, and procurement coordination for Australian businesses.',
  keywords: ['china sourcing services', 'factory tour china', 'supplier verification'],
}

export default function ServicesPage() {
  return (
    <>
      <ServiceSchema />
      {/* Page content */}
    </>
  )
}
```

### Blog Article with Dynamic Metadata
```typescript
// app/resources/[slug]/page.tsx
import type { Metadata } from 'next'
import { getPostBySlug } from '@/lib/blog'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  return {
    title: post.seoTitle || post.title,
    description: post.description,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords],
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.coverImage, alt: post.coverImageAlt }],
    },
    alternates: {
      canonical: `https://www.winningadventure.com.au/resources/${params.slug}`,
    },
  }
}
```

### Image Alt Text Optimization
```typescript
// Using next/image with descriptive alt
import Image from 'next/image'

// Good: Descriptive alt text
<Image
  src="/factory-tour.jpg"
  alt="Australian business owners visiting electronics factory in Shenzhen, China"
  width={800}
  height={600}
  priority={true} // For above-the-fold images (LCP optimization)
/>

// Bad: Generic alt
<Image src="/factory-tour.jpg" alt="Factory" width={800} height={600} />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side meta tags | Server-side Next.js Metadata API | Next.js 13+ (App Router) | Better SEO, no layout shift |
| Manual XML sitemap | Dynamic sitemap.ts | Next.js 13.3+ | Auto-updates with content |
| Generic structured data | Schema-specific (Service, FAQPage) | Current best practice | Rich search results |
| Responsive images | next/image with automatic formats | Next.js 10+ | Better Core Web Vitals |

**Deprecated/outdated:**
- `<Head>` component - Replaced by Metadata API in Next.js 13+
- `next/head` - Replaced by Metadata API
- Custom robots.txt - Use Next.js metadata.robots instead

## Open Questions

1. **Where are SEO-01 through SEO-05 requirements defined?**
   - What we know: Referenced in ROADMAP.md but not in REQUIREMENTS.md
   - What's unclear: Need to define specific acceptance criteria
   - Recommendation: Define requirements before planning tasks

2. **Should blog articles use generateStaticParams for static export?**
   - What we know: Currently using dynamic rendering
   - What's unclear: If static export is needed for SEO
   - Recommendation: Keep dynamic for now, add static params if performance issues

3. **How to track keyword rankings?**
   - What we know: Google Search Console can track impressions
   - What's unclear: Need third-party tracking tool for competitive analysis
   - Recommendation: Start with Google Search Console, add tools if needed

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual SEO audit + Google tools |
| Config file | N/A |
| Quick run command | Google PageSpeed Insights (web) |
| Full suite command | Lighthouse CLI: `npx lighthouse https://www.winningadventure.com.au --output html` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEO-01 | Page metadata unique | Manual | Check each page title in source | N/A |
| SEO-02 | Structured data valid | Tool | Rich Results Test (web) | N/A |
| SEO-03 | Blog articles published | Manual | Check sitemap URLs | N/A |
| SEO-04 | Internal links present | Tool | Screaming Frog or manual | N/A |
| SEO-05 | Core Web Vitals pass | Tool | PageSpeed Insights | N/A |

### Wave 0 Gaps
- None identified - all SEO infrastructure exists

## Sources

### Primary (HIGH confidence)
- Next.js Metadata API Documentation: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Google Structured Data Guidelines: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images

### Secondary (MEDIUM confidence)
- Google Search Console: https://search.google.com/search-console/about
- Lighthouse SEO Audits: https://developer.chrome.com/docs/lighthouse/seo

### Tertiary (LOW confidence)
- N/A - sufficient authoritative sources available

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH - Next.js built-in SEO features are well-documented and stable
- Architecture: HIGH - Existing implementation follows Next.js best practices
- Pitfalls: HIGH - Common SEO issues well-documented

**Research date:** 2026-03-18
**Valid until:** 90 days for stable Next.js APIs, 30 days for SEO best practices
