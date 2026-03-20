# Phase 14: Two Ways to Access Section - Research

**Researched:** 2026-03-20
**Domain:** Next.js Client Component with IntersectionObserver Animations
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Card Layout:** 50/50 side-by-side (desktop), stacked (mobile), equal height
- **Section Header:** "How Would You Like to Find Your Factory?"
- **Card Structure:** Icon, title, description, bullet list, CTA button
- **Visual Emphasis:** Full Service card gets Amber border/background; Directory Access stays white
- **Icons:** `Compass` (Full Service), `Database` (Directory Access) from lucide-react
- **Animation:** IntersectionObserver fade-in-up, staggered delay (consistent with HowItWorks)
- **Integration Point:** Insert between `<HowItWorks />` and `<Industries />` in `app/page.tsx`
- **New Component:** `app/components/TwoWaysAccess.tsx`

### Full Service Card Content (Amber emphasis)
- Icon: `Compass`
- Title: Full Service / Guided Tours
- Bullets: 专属向导陪同, 工厂筛选和对接, 质量管控指导, 后续合同支持
- CTA: "Start Your Tour" -> /enquiry

### Directory Access Card Content (White/default)
- Icon: `Database`
- Title: Factory Directory Access
- Bullets: 浏览部分工厂预览(模糊数据), 海量工厂数据, 提交询价获取完整信息
- CTA: "Request Directory Access" -> /enquiry

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<research_summary>
## Summary

Phase 14 requires creating a "Two Ways to Access" section component that displays two service options side-by-side: Full Service (Guided Tours) and Factory Directory Access. The implementation follows established project patterns — using IntersectionObserver for scroll-triggered animations (pattern verified in `HowItWorks.tsx`), Tailwind for responsive layout, and lucide-react for icons.

**Key findings:**
1. IntersectionObserver animation pattern is already implemented in `HowItWorks.tsx` (lines 44-59) — replicate exactly
2. Card styling uses `rounded-2xl`, `border`, `shadow-[...]` with `navy` and `amber` design tokens
3. Both `Compass` and `Database` icons are available in lucide-react (already used elsewhere in project)
4. Section container pattern: `bg-white py-20 md:py-28 px-4 md:px-8` with `max-w-[1400px] mx-auto`
5. Grid: `grid-cols-1 md:grid-cols-2 gap-6 md:gap-8` for 50/50 layout

**Primary recommendation:** Copy the IntersectionObserver pattern from `HowItWorks.tsx` verbatim, apply the card styling from lines 93-97 with Amber emphasis variant, and integrate at the specified location in `app/page.tsx`.
</research_summary>

<standard_stack>
## Standard Stack

No new dependencies required — all libraries already in project.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | (Next.js 16.1) | UI framework | Project base |
| lucide-react | (existing) | Icons | Already used: Compass, Database, Users, ShieldCheck in codebase |
| tailwindcss | 3.4 | Styling | Project standard |

### Verification Command
```bash
npm view lucide-react version
# Verify Compass, Database icons exist (standard lucide set)
```

### Existing Patterns to Reuse
- IntersectionObserver pattern from `app/components/HowItWorks.tsx` lines 44-59
- Card styling from `HowItWorks.tsx` lines 93-97
- Section container from `HowItWorks.tsx` lines 62-63
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
app/
├── components/
│   └── TwoWaysAccess.tsx    # New component (client component)
└── page.tsx                 # Add <TwoWaysAccess /> between HowItWorks and Industries
```

### Pattern 1: IntersectionObserver Scroll Animation
**What:** Fade-in-up animation triggered when section enters viewport
**When to use:** For card/section reveals on scroll
**Example:**
```typescript
// Source: HowItWorks.tsx lines 44-59 (exact pattern to replicate)
const [visible, setVisible] = useState(false)
const sectionRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setVisible(true)
      }
    },
    { threshold: 0.15 }
  )

  if (sectionRef.current) {
    observer.observe(sectionRef.current)
  }

  return () => observer.disconnect()
}, [])
```

### Pattern 2: Animated Card Reveal
**What:** Staggered fade-in-up for multiple cards
**When to use:** When multiple items should animate sequentially
**Example:**
```typescript
// Source: HowItWorks.tsx lines 88-91
className={`transition-all duration-700 ${
  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
}`}
style={{ transitionDelay: `${idx * 150}ms` }}
```

### Pattern 3: Card with Amber Emphasis
**What:** Border + background treatment for primary card
**When to use:** For Full Service card (primary offering)
**Example:**
```typescript
// Base card (from HowItWorks.tsx line 93):
border-navy/5 shadow-[0_4px_24px_rgba(15,45,94,0.06)]

// Amber emphasis variant (Full Service):
border-amber/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.2)]

// Amber badge/icon background:
bg-amber/20
```

### Pattern 4: Section Container
**What:** Standard section wrapper with responsive padding
**When to use:** Every section component
**Example:**
```typescript
// Source: HowItWorks.tsx lines 62-63
<section className="bg-white py-20 md:py-28 px-4 md:px-8">
  <div className="max-w-[1400px] mx-auto">
```

### Pattern 5: Two-Column Responsive Grid
**What:** 50/50 on desktop, stacked on mobile
**When to use:** For side-by-side card layouts
**Example:**
```typescript
// Grid container:
grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8

// Equal height cards (inside card):
h-full
```

### Anti-Patterns to Avoid
- **Custom animation libraries:** IntersectionObserver + CSS transitions is lighter than framer-motion
- **Hardcoded colors:** Use design tokens (`navy`, `amber`) not raw hex values
- **Server component for animations:** Must be `'use client'` since IntersectionObserver is browser API
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll animations | Custom JS animation library | IntersectionObserver + CSS transitions | Simpler, native browser API, already in codebase |
| Icon components | Custom SVG icons | lucide-react | Consistent style, tree-shakeable, already installed |
| Responsive layout | Media query spaghetti | Tailwind grid/flex utilities | Project standard, readable |

**Key insight:** This component is straightforward — reuse existing patterns rather than introducing new complexity.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Incorrect Insertion Order in page.tsx
**What goes wrong:** Section renders in wrong position
**Why it happens:** Forgetting to place between `<HowItWorks />` and `<Industries />`
**How to avoid:** Follow integration point exactly: `HowItWorks` -> `TwoWaysAccess` -> `Industries`
**Warning signs:** Visual check shows section in wrong location

### Pitfall 2: Missing 'use client' Directive
**What goes wrong:** ReferenceError: IntersectionObserver is not defined
**Why it happens:** Server components cannot use browser APIs
**How to avoid:** Add `'use client'` at top of `TwoWaysAccess.tsx`
**Warning signs:** Build error about IntersectionObserver

### Pitfall 3: Staggered Animation Too Fast/Slow
**What goes wrong:** All cards animate at once or delay too long
**Why it happens:** Incorrect `transitionDelay` values
**How to avoid:** Use 150ms delay between cards (matches HowItWorks pattern)
**Warning signs:** Animation feels janky or robotic

### Pitfall 4: Cards Not Equal Height
**What goes wrong:** Cards have different heights based on content
**Why it happens:** Missing `h-full` on card containers
**How to avoid:** Apply `h-full` to card wrapper divs
**Warning signs:** Desktop layout looks uneven
</common_pitfalls>

<code_examples>
## Code Examples

### TwoWaysAccess Component Structure
```typescript
// Source: Based on HowItWorks.tsx patterns
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Compass, Database } from 'lucide-react'

const cards = [
  {
    icon: Compass,
    title: 'Full Service / Guided Tours',
    description: '...',
    bullets: ['专属向导陪同', '工厂筛选和对接', ...],
    cta: 'Start Your Tour',
    href: '/enquiry',
    isPrimary: true,
  },
  {
    icon: Database,
    title: 'Factory Directory Access',
    description: '...',
    bullets: ['浏览部分工厂预览', '海量工厂数据', ...],
    cta: 'Request Directory Access',
    href: '/enquiry',
    isPrimary: false,
  },
]

export default function TwoWaysAccess() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-white py-20 md:py-28 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy">
            How Would You Like to Find Your Factory?
          </h2>
        </div>

        {/* Cards grid */}
        <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 md:p-8 h-full ${
                card.isPrimary
                  ? 'border-amber/30 bg-amber/5 shadow-[0_8px_32px_rgba(245,158,11,0.15)]'
                  : 'border-navy/5 bg-white shadow-[0_4px_24px_rgba(15,45,94,0.06)]'
              } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-700`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                card.isPrimary ? 'bg-amber/20' : 'bg-navy/5'
              }`}>
                <card.icon size={24} className={card.isPrimary ? 'text-amber' : 'text-navy'} />
              </div>

              {/* Title + Description */}
              <h3 className="text-xl font-semibold text-navy mb-3">{card.title}</h3>
              <p className="text-navy/60 mb-6">{card.description}</p>

              {/* Bullets */}
              <ul className="space-y-2 mb-8">
                {card.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy/70">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${card.isPrimary ? 'bg-amber' : 'bg-navy/30'}`} />
                    {bullet}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={card.href}
                className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all ${
                  card.isPrimary
                    ? 'bg-amber text-white hover:bg-amber/90 hover:gap-3'
                    : 'bg-navy text-white hover:bg-navy/90 hover:gap-3'
                }`}
              >
                {card.cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Integration in page.tsx
```typescript
// Source: app/page.tsx
import TwoWaysAccess from '@/components/TwoWaysAccess'

export default function Home() {
  return (
    <>
      <Navbar />
      <FAQSchema />
      <Hero />
      <HowItWorks />
      <TwoWaysAccess />  {/* ADD HERE */}
      <Industries />
      <FAQ />
      <CTABand />
      <Footer />
    </>
  )
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

No significant changes in this domain — IntersectionObserver, CSS transitions, and Tailwind remain the standard approach for scroll animations in Next.js.

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| className toggle with setTimeout | IntersectionObserver + CSS transitions | Long standing | Cleaner, more reliable |
| framer-motion for simple fades | CSS transitions + IntersectionObserver | 2020+ | Less dependencies |

**No new tools needed for this phase.**
</sota_updates>

<open_questions>
## Open Questions

1. **Exact bullet point wording**
   - What we know: The intent from CONTEXT.md (专属向导陪同, 工厂筛选和对接, etc.)
   - What's unclear: Final Chinese wording for each bullet
   - Recommendation: Planner should confirm exact wording with user or use suggested translations

2. **Amber emphasis intensity**
   - What we know: Full Service card should be emphasized with Amber
   - What's unclear: `bg-amber/5` vs `bg-amber/10` for card background
   - Recommendation: Use `bg-amber/5` (subtle) — can be adjusted during implementation if too faint

3. **Section header subtitle**
   - What we know: Header text is "How Would You Like to Find Your Factory?"
   - What's unclear: Whether to include a subtitle (like HowItWorks has)
   - Recommendation: No subtitle needed — the card descriptions are self-explanatory
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `app/components/HowItWorks.tsx` — IntersectionObserver pattern (lines 44-59), card styling (lines 93-97), section container (lines 62-63)
- `app/page.tsx` — Integration point location
- `tailwind.config.ts` — Design tokens (navy, amber colors)
- lucide-react docs — Compass, Database icons (standard icon set)

### Secondary (MEDIUM confidence)
- None needed — patterns are clearly established in codebase

### Tertiary (LOW confidence - needs validation)
- None — all findings from verified codebase patterns
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Next.js client component, IntersectionObserver
- Ecosystem: lucide-react, Tailwind CSS
- Patterns: Scroll animation, card layout, responsive grid
- Pitfalls: Integration order, client directive, animation timing

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project
- Architecture: HIGH — pattern copied verbatim from existing codebase
- Pitfalls: HIGH — documented from actual experience with HowItWorks
- Code examples: HIGH — derived directly from HowItWorks.tsx

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (30 days — Next.js/lucide patterns stable)
</metadata>

---

*Phase: 14-two-ways-to-access-section*
*Research completed: 2026-03-20*
*Ready for planning: yes*
