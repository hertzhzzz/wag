---
phase: 15
slug: directory-section-landing-page
status: draft
shadcn_initialized: false
preset: none
created: 2026-03-20
---

# Phase 15 — UI Design Contract

> Visual and interaction contract for Directory Section (Landing Page). Replaces Industries section on homepage.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react (already in use) |
| Font | IBM Plex Sans (sans), IBM Plex Serif (serif) |

### Established from Existing Code
- `navy: '#0F2D5E'` — primary brand color
- `amber: '#F59E0B'` — accent color
- Section wrapper: `bg-white py-14 md:py-18 px-4 md:px-10` + `max-w-[1100px] mx-auto`
- Card style: `rounded-2xl`, `border`, `shadow`, `p-6`
- Animation: `opacity-0 translate-y-8` → `opacity-100 translate-y-0` with `duration-700`
- CTA button: `min-h-11`, `px-6 py-3`, `font-semibold`, `text-sm`

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing, bullet gaps |
| md | 16px | Default element spacing, card padding |
| lg | 24px | Section padding, card gap |
| xl | 32px | Layout gaps, major spacing |
| 2xl | 48px | Section vertical padding (py-14 md:py-16) |
| 3xl | 64px | Page-level spacing |

**Exceptions:**
- Map marker touch targets: minimum 44px (mobile accessibility)
- Mobile map height: `h-[300px]` (fixed, non-scrollable)
- Desktop map/list split: `70% / 30%` via CSS grid

---

## Typography

| Role | Size | Weight | Line Height | Notes |
|------|------|--------|-------------|-------|
| Body | 14px | 400 (regular) | 1.5 | City descriptions, list items |
| Label | 12px | 600 (semibold) | 1.4 | Filter tabs, uppercase tracking |
| Heading | 18-20px | 600 (semibold) | 1.3 | City names in list, card titles |
| Section title | 36-48px | 600 (semibold) | 1.2 | `font-serif`, responsive via `clamp` |

**Reference from existing components:**
- Section header: `font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight`
- Card body: `text-sm text-navy/80`
- Filter tabs: `text-xs font-semibold uppercase tracking-[0.08em]`

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FFFFFF` (white) | Page background, surfaces |
| Secondary (30%) | `#F0F4F8` (cool gray) | Section background, list panel |
| Accent (10%) | `#F59E0B` (amber) | Interactive highlights only |
| Primary | `#0F2D5E` (navy) | Text, borders, buttons |

**Accent reserved for:**
- Active filter tab underline/background
- "View Directory" CTA buttons
- Hover state on city list items (amber/10 background)
- Verified badge icons
- Map marker pins (amber fill)

**Never use accent for:** section backgrounds, body text, borders on cards

---

## Copywriting Contract

| Element | Copy | Source |
|---------|------|--------|
| Primary CTA | "View Full Directory" | 15-CONTEXT.md decisions |
| Bottom CTA | "View Full Directory" with arrow SVG | Links to /directory or /enquiry |
| Section label | "Factory Directory" | Uppercase amber label |
| Section heading | "Explore Verified Manufacturers" | font-serif, navy |
| Empty state heading | "No factories found" | When filter returns 0 |
| Empty state body | "Try selecting a different industry filter above." | With next step |
| Error state | "Unable to load directory. Please refresh the page." | Problem + action |
| Destructive confirmation | none | No destructive actions in this phase |

**Filter Tab Labels:**
- "All" — default selected
- "Electronics"
- "Furniture"
- "Robotics"
- "EV Battery"
- "CBD Property"
- "Construction"
- "Food & Beverage"

**City List Item Copy:**
- City name (bold, 18px)
- Province (inline, muted)
- "{N} factories" (factory count)
- Focus keyword (e.g., "Furniture manufacturing hub")

---

## Map Popup Contract

| Element | Copy |
|---------|------|
| City name | "{City}, {Province}" |
| Factory count | "{N} verified factories" |
| CTA | "View Directory" (amber button) |

**Popup styling:** Match design system — navy header, white body, amber CTA button. Use Leaflet popup custom styling classes.

---

## Component Inventory

### DirectorySection (wrapper)
- **Location:** `app/components/DirectorySection/index.tsx`
- **Props:** none (self-contained)
- **States:** loading (skeleton), default (with data), empty (no filter results)

### FilterTabs
- **Location:** `app/components/DirectorySection/FilterTabs.tsx`
- **Visual:** Horizontal scrollable tabs above map
- **States:** default, active (amber underline + text), hover (amber/10 bg)
- **Animation:** Underline slides to active tab

### CityList
- **Location:** `app/components/DirectorySection/CityList.tsx`
- **Visual:** Scrollable list panel (30% width on desktop)
- **Item states:** default, hover (amber/10 bg), selected (amber border-left)
- **Animation:** IntersectionObserver stagger fade-in (per item, `delay: index * 80ms`)

### DirectoryMap
- **Location:** `app/components/DirectorySection/DirectoryMap.tsx`
- **SSR:** `dynamic(() => import('./DirectoryMap'), { ssr: false })`
- **Visual:** 70% width on desktop, full-width on mobile (h-[300px])
- **Marker:** Custom amber circle markers
- **Popup:** Custom styled (navy header, white body, amber CTA)
- **Clustering:** leaflet.markercluster for grouped markers

### types.ts
```typescript
interface CityEntry {
  city: string        // "Foshan"
  province: string    // "Guangdong"
  factories: number   // 80
  focus: string       // "Furniture manufacturing hub"
  coords: [number, number]  // [lat, lng]
  industries: string[] // ["Furniture", "Construction"]
}
```

---

## Responsive Behavior

| Breakpoint | Layout | Map Height | List |
|------------|--------|------------|------|
| Mobile (< 768px) | Stacked (map top) | 300px fixed | Below map, scrollable |
| Desktop (>= 768px) | Side-by-side (70/30) | Full height | Left panel, scrollable |

**Touch targets:** All interactive elements minimum 44px. Map markers cluster at zoom levels < 10.

---

## Motion & Animation

| Element | Animation | Duration | Easing | Trigger |
|---------|-----------|----------|--------|---------|
| Section entrance | fade-in + translateY(0) | 700ms | ease-out | IntersectionObserver 15% |
| City list items | stagger fade-in | 700ms | ease-out | IntersectionObserver, delay: idx * 80ms |
| Filter tab underline | slide | 200ms | ease-in-out | tab click |
| Map marker hover | scale(1.1) | 150ms | ease | mouseover |
| List item hover | bg transition | 200ms | ease | mouseover |
| Modal/drawer | slide-up + fade | 300ms | ease-out | open/close |

**Reduced motion:** All animations respect `prefers-reduced-motion: reduce` via global style override (see TwoWaysAccess.tsx lines 177-189).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | n/a | not applicable |

**No third-party component registries used.** All components are custom-built using existing Tailwind tokens and lucide-react icons.

---

## Implementation Reference Points

| Pattern | Location | Usage |
|---------|----------|-------|
| IntersectionObserver animation | `TwoWaysAccess.tsx` lines 43-58 | Stagger fade-in for list items |
| Section wrapper | `industries/index.tsx` lines 116-117 | Background, padding, max-width |
| Card shadow | `TwoWaysAccess.tsx` lines 86-87 | `shadow-[0_8px_32px_rgba(...)]` |
| Leaflet SSR | `next/dynamic` with `ssr: false` | Map component loading |
| CTA button style | `TwoWaysAccess.tsx` lines 130-166 | `min-h-11 px-6 py-3 text-sm font-semibold` |
| Reduced motion | `TwoWaysAccess.tsx` lines 177-189 | `prefers-reduced-motion` support |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending 2026-03-20
