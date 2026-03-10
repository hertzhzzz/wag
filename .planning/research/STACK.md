# Mobile Responsive Design with Next.js + Tailwind CSS

**Project:** WAG Website Improvements
**Researched:** 2026-03-11
**Confidence:** HIGH

## Recommended Approach

### Core Responsive Strategy: Mobile-First

The project should use **mobile-first responsive design** with Tailwind CSS. This means:

1. **Default styles** apply to mobile (smallest screens)
2. **Breakpoint prefixes** (`md:`, `lg:`, etc.) add styles for larger screens
3. **Always test on mobile first** — fix mobile layout before expanding to desktop

**Why mobile-first:**
- Mobile traffic dominates (70%+ of global web traffic in 2025)
- Easier to scale up than scale down (adding complexity vs removing constraints)
- Tailwind's default behavior aligns perfectly with this approach

---

## Tailwind CSS Breakpoints (v3.4/v4 Compatible)

| Prefix | Min Width | Target | Recommended Use |
|--------|-----------|--------|-----------------|
| `sm` | 640px | Large phones / Small tablets | Phablets |
| `md` | 768px | Tablets (portrait) | **Primary tablet breakpoint** |
| `lg` | 1024px | Tablets (landscape) / Small laptops | **Primary desktop breakpoint** |
| `xl` | 1280px | Laptops / Small desktops | Content max-width |
| `2xl` | 1536px | Large desktops | Edge cases |

**Current project is using Tailwind 3.4.0** — these breakpoints are the default and match the official docs.

### Example Usage

```tsx
// WRONG: Only applies to sm and above (leaves mobile unstyled)
<div className="sm:text-center">Hello</div>

// CORRECT: Mobile default, desktop overrides
<div className="text-center lg:text-left">Hello</div>

// Stack for increasing complexity
<div className="w-full md:w-1/2 lg:w-1/3">Content</div>
```

---

## Key Techniques for WAG Website

### 1. Responsive Typography

```tsx
// Fluid typography: scales with viewport
<h1 className="text-3xl md:text-4xl lg:text-5xl lg:leading-tight">
  Winning Adventure Global
</h1>

// Use max-width to prevent line length issues on large screens
<article className="prose prose-lg max-w-none md:prose-xl lg:max-w-4xl">
```

### 2. Responsive Spacing

```tsx
// Consistent padding
<div className="px-4 md:px-8 lg:px-12">
  Content
</div>

// Vertical spacing
<section className="py-12 md:py-16 lg:py-24">
```

### 3. Responsive Grid/Flex Layouts

```tsx
// Grid that adapts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// Flex stack to row
<div className="flex flex-col md:flex-row gap-4">
  {/* Side-by-side on desktop */}
</div>
```

### 4. Responsive Navigation

```tsx
// Mobile: hidden by default, shown via state
<nav className={`fixed inset-0 bg-navy z-50 ${isOpen ? 'block' : 'hidden'} md:relative md:bg-transparent md:block`}>

// Mobile menu button (only visible on mobile)
<button className="md:hidden">Menu</button>
```

### 5. Responsive Images

```tsx
// Use srcset pattern via next/image
<Image
  src="/hero.jpg"
  alt="WAG Services"
  width={800}
  height={400}
  className="w-full h-auto"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 6. Responsive Touch Targets (Critical for Mobile)

```tsx
// Minimum 44x44px touch targets
<button className="min-h-[44px] min-w-[44px] px-4 py-2">
  Contact Us
</button>

// Links in navigation
<a className="block py-3 px-4 min-h-[44px]">Link</a>
```

---

## Container Queries (Advanced)

**When to use:** Components that need to respond to their parent container, not viewport.

**WAG use case:** Reusable cards/components that appear in different page contexts (sidebar, main content, grid).

```tsx
// Parent marks itself as container
<div className="@container">
  {/* Child uses @-prefixed variants */}
  <div className="flex flex-col @md:flex-row">
    Content
  </div>
</div>
```

**Why not default:** Container queries add complexity. Use viewport-based responsive (default Tailwind) first. Add container queries only when:
- Same component used in dramatically different container widths
- Building reusable component library

---

## What NOT to Use

### 1. Desktop-First Mindset

```tsx
// AVOID: Desktop-first (wrong approach)
<div className="lg:w-1/2 w-full">Content</div>

// PREFER: Mobile-first
<div className="w-full lg:w-1/2">Content</div>
```

**Why:** Desktop-first leads to forgotten mobile states and code duplication.

### 2. Hardcoded Pixel Values

```tsx
// AVOID: px values break fluid design
<div className="px-[320px]">

// PREFER: Tailwind spacing scale
<div className="px-4 md:px-8">
```

### 3. Fixed Heights

```tsx
// AVOID: Fixed height clips content
<div className="h-64">

// PREFER: min-height or let content dictate
<div className="min-h-screen">
```

### 4. Ignoring Touch Targets

```tsx
// AVOID: Too small for touch
<button className="px-2 py-1">Click</button>

// PREFER: Minimum 44px touch target
<button className="px-4 py-3">Click</button>
```

---

## Next.js Specific Patterns

### Server Components + Responsive

```tsx
// Server component: fetch data, pass to client component
// app/page.tsx (Server Component)
import { ServicesGrid } from '@/components/ServicesGrid';

export default function Page() {
  const services = await getServices();
  return <ServicesGrid services={services} />;
}

// components/ServicesGrid.tsx (Client Component - needs interactivity)
'use client';
import { useState } from 'react';

export function ServicesGrid({ services }) {
  // Mobile-first: default collapsed state
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
```

### Responsive Images with next/image

```tsx
import Image from 'next/image';

export function HeroImage() {
  return (
    <div className="relative w-full aspect-video">
      <Image
        src="/hero.jpg"
        alt="WAG Team"
        fill
        className="object-cover"
        // Automatically serves different sizes
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
      />
    </div>
  );
}
```

---

## Tailwind Config Recommendations

The current config is minimal. **No changes needed** for responsive design — default breakpoints work well.

**Optional enhancement** if custom breakpoints required:

```ts
// tailwind.config.ts (only if needed)
import type { Config } from "tailwindcss";

const config: Config = {
  content: [/* existing */],
  theme: {
    extend: {
      // Only add if default breakpoints don't work for your design
      // screens: {
      //   'xs': '480px',  // Large phones
      //   '3xl': '1920px', // Ultra-wide
      // },
    },
  },
  plugins: [/* existing */],
};
export default config;
```

**Recommendation:** Keep default breakpoints. They cover 95%+ of use cases.

---

## Priority Order for WAG Pages

Based on likely mobile issues:

| Priority | Page | Common Issues |
|----------|------|---------------|
| 1 | `/enquiry` | Form fields too small, horizontal scroll |
| 2 | `/services` | Grid overflow, card clipping |
| 3 | `/` | Hero text overflow, navigation menu |
| 4 | `/about` | Content width issues on tablet |
| 5 | `/resources` | Article readability on small screens |

---

## Testing Checklist

- [ ] Chrome DevTools Device Mode (all breakpoints)
- [ ] Physical device testing (iOS Safari, Android Chrome)
- [ ] Touch target minimum 44px
- [ ] No horizontal scroll (viewport meta tag correct)
- [ ] Text readable without zooming
- [ ] Images load correctly at all sizes
- [ ] Forms usable on mobile (inputs don't zoom)

---

## Sources

- [Tailwind CSS Official: Responsive Design](https://tailwindcss.com/docs/responsive-design) — **HIGH confidence**
- [Tailwind CSS Official: Container Queries](https://tailwindcss.com/docs/container-queries) — **HIGH confidence**
- [Tailwind Breakpoints: Complete 2025 Guide](https://tailkits.com/blog/tailwind-breakpoints-complete-guide/) — **MEDIUM confidence**
- [Mobile-First Responsive Design Best Practices for 2025](https://www.letsgroto.com/blog/mobile-first-responsive-design-best-practices) — **MEDIUM confidence**
- [9 Responsive Design Best Practices for 2025](https://nextnative.dev/blog/responsive-design-best-practices) — **MEDIUM confidence**
