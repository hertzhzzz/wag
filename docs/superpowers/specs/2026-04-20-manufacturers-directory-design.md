# manufacturers.winningadventure.com.au — Design Specification

## 1. Concept & Vision

**`manufacturers.winningadventure.com.au`**
A dark-themed, map-first directory of Chinese manufacturers built for Australian buyers. Styled after Pickleheads (full-screen map + sidebar corridor list), but with WAG's Navy brand palette and manufacturing-specific content. The experience feels like exploring a live map of China's industrial corridors — not browsing a static directory.

> "Find Chinese manufacturers by industrial corridor, not by product category."

---

## 2. Design Language

### Aesthetic Direction
Pickleheads' map-centric discovery UX meets WAG's professional B2B brand. Dark Navy atmosphere, clean data cards, Amber CTAs.

### Color Palette (Chakra UI Custom Tokens)

| Token | Hex | Usage |
|-------|-----|-------|
| `navy.900` | `#0A0A3C` | Page background, deep dark |
| `navy.800` | `#0F2D5E` | Cards, sidebars, elevated surfaces |
| `navy.700` | `#1A4080` | Borders, dividers |
| `navy.600` | `#255099` | Hover states |
| `amber.500` | `#F59E0B` | Primary CTA, active states, highlights |
| `amber.400` | `#FBBF24` | Amber hover |
| `white` | `#FFFFFF` | Primary text |
| `gray.300` | `#D1D5DB` | Secondary text |
| `gray.500` | `#6B7280` | Muted text, placeholders |
| `green.400` | `#34D399` | Verified badges, success states |

### Typography
- **Headings / Display**: Grandstander (variable weight, self-hosted WOFF2) — loaded from Pickleheads assets
- **Body / UI**: Lexend (variable weight, self-hosted WOFF2) — loaded from Pickleheads assets
- **Fallbacks**: `system-ui, sans-serif`
- **Scale**: Chakra UI default scale (sm/base/lg/xl/2xl/3xl...)

### Spatial System
- 4px base unit (Chakra default)
- Card padding: `p-4` or `p-6`
- Section spacing: `py-8` to `py-16`
- Border radius: `rounded-lg` or `rounded-xl`

### Motion Philosophy
- Smooth map pan/zoom (Leaflet default)
- Sidebar list items: fade-in on corridor select (150ms ease-out)
- Cards: subtle scale on hover (1.02x, 200ms)
- Page transitions: Next.js router (fade)

### Visual Assets
- **Icons**: Custom duotone SVG icons (self-hosted, Pickleheads-style)
- **Map**: Leaflet + OpenStreetMap tiles + Chinese tile provider (gaode/CartoDB dark)
- **Logos**: WAG logo in Navy + Amber on dark background

---

## 3. Layout & Structure

### Global Shell

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (fixed, Navy.800 bg, h-16)                          │
│  [WAG Logo]          [Search Input]           [Get Started] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  CORRIDOR PILL TABS (sticky below header)                   │
│  [All] [珠三角电子] [长三角机械] [浙江纺织] [京津冀] ...     │
│                                                              │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│  SIDEBAR      │  FULL-SCREEN MAP (Leaflet)                  │
│  (w-80,       │  China map centered on                       │
│   scrollable) │  35°N, 105°E                                │
│               │                                              │
│  Corridor     │  City markers (circle pins with count)       │
│  + City list  │  Click marker → highlight sidebar item        │
│  + counts     │  Click sidebar item → pan map to city        │
│               │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

### Pages

| Route | Page |
|-------|------|
| `/` | Home — Full map + sidebar (corridor/city list) |
| `/[corridor]/[city]` | City page — Factory Fact Sheet grid for that city |
| `/factory/[slug]` | Factory Detail — Full Fact Sheet page |

### Responsive Strategy
- **Desktop (≥1024px)**: Sidebar + map side by side
- **Tablet (768-1023px)**: Sidebar collapses to drawer, map full width
- **Mobile (<768px)**: Bottom sheet list over map (Pickleheads mobile pattern)

---

## 4. Features & Interactions

### 4.1 Corridor Filter Pills

- Pills: All / 珠三角电子 / 长三角机械 / 浙江纺织 / 京津冀建材 / 中部制造 / 成渝电子
- Single-select (click to filter, click again or "All" to clear)
- Selecting a corridor: sidebar scrolls to that corridor, map shows only cities in that corridor
- Active pill: Amber background, Navy text

### 4.2 Sidebar (Corridor + City List)

- Collapsible corridor groups with factory count badge
- Each city row shows: city name (EN/CN), factory count
- Click city → navigate to `/[corridor]/[city]`
- Active city highlighted in Amber

### 4.3 Map (Leaflet)

- Dark tile layer (CartoDB Dark Matter or Gaode dark style)
- City markers: circle with factory count, Navy fill, Amber border
- Click marker: same as clicking sidebar city row
- Zoom controls: bottom-right
- Map does NOT show individual factory pins (city-level only for MVP)

### 4.4 City Page (`/[corridor]/[city]`)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to map      Shenzhen · 40 manufacturers               │
│                      Pearl River Delta Electronics Corridor   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │ Factory 1 │  │ Factory 2 │  │ Factory 3 │  ...          │
│  │ Card       │  │ Card       │  │ Card       │              │
│  │ (logo,     │  │            │  │            │              │
│  │  name,     │  │            │  │            │              │
│  │  products, │  │            │  │            │              │
│  │  badges)   │  │            │  │            │              │
│  └────────────┘  └────────────┘  └────────────┘              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- Grid of Factory Cards (3 columns desktop, 2 tablet, 1 mobile)
- Pagination or infinite scroll (20 per page)
- No map on this page (clean grid layout)

### 4.5 Factory Card

- Factory name (EN)
- City + Corridor badge
- Product category tags (2-3 max)
- Factory size + Employee count
- Certification badges (ISO, CE, RoHS)
- Click → `/factory/[slug]`

### 4.6 Factory Detail Page (`/factory/[slug]`)

Full Fact Sheet — two-column layout:

**Left Column (Credibility)**
- Factory name + logo
- City, corridor, established year
- Factory area + Employee count
- Certifications (badge grid)
- Factory photos (if available)
- Client cases

**Right Column (Procurement)**
- Product categories (full list)
- OEM/ODM support indicator
- MOQ
- Price range indicator (e.g. "$$", "$$$")
- Lead time
- Capacity

**Bottom**
- Full-width CTA: "联系 WAG 获取详细报价和对接服务 →"
- WAG trust copy: "Your trusted partner for sourcing from China"

### 4.7 Search

- Search input in header (desktop) / search icon → modal (mobile)
- Searches across: factory name, city, product category, corridor
- Results dropdown: grouped by type (Factories / Cities)
- Click result → navigate to factory detail or city page

### 4.8 "Get Started" CTA

- Header CTA button → WAG enquiry form (existing `/enquiry` page, or new modal)

---

## 5. Component Inventory

### Header
- Logo (WAG, Navy + Amber on dark)
- Search input (collapsed to icon on mobile)
- "Get Started" button (Amber CTA)
- States: default, scrolled (subtle shadow)

### CorridorPillTabs
- Horizontal scrollable pill row
- States: default (Navy border), active (Amber bg), hover (Navy.700 bg)

### Sidebar
- Scrollable, max-h calc(vh - header - tabs)
- CorridorGroup: collapsible, shows city count
- CityRow: name, factory count badge, active state

### MapView
- Leaflet container, full height
- CityMarker: circle, count label, click handler
- States: default, hovered, active

### FactoryCard
- Logo/avatar placeholder
- Name, location, tags, badges
- States: default, hovered (scale + shadow lift)

### FactSheetLayout
- Two-column (desktop), stacked (mobile)
- Sticky CTA bar at bottom

### CertBadge
- Small badge: icon + abbreviation (ISO, CE, RoHS)
- Green checkmark accent

### CTAButton
- Amber background, Navy text, full-width or inline
- Arrow icon
- States: default, hover (lighter Amber), disabled (gray)

### SearchModal
- Full-screen overlay, dark bg
- Input + results list
- States: loading, results, no results

---

## 6. Technical Approach

### Framework & Stack
- **Next.js** (App Router, SSG for factory pages)
- **Chakra UI** (v2) with custom Navy/Amber theme tokens
- **Leaflet** + `react-leaflet` (map)
- **TypeScript** throughout

### New Project Structure
```
/manufacturers.winningadventure.com.au   (or new dir in wag-frontend repo)
├── app/
│   ├── layout.tsx          (ChakraProvider, fonts, Header)
│   ├── page.tsx            (Home — map + sidebar)
│   ├── [corridor]/
│   │   └── [city]/
│   │       └── page.tsx    (City factory grid)
│   └── factory/
│       └── [slug]/
│           └── page.tsx    (Fact Sheet detail)
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── CorridorPillTabs.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MapView.tsx
│   │   ├── CityMarker.tsx
│   │   ├── FactoryCard.tsx
│   │   ├── FactSheetLayout.tsx
│   │   ├── CertBadge.tsx
│   │   ├── CTAButton.tsx
│   │   ├── SearchModal.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   ├── corridors.ts    (corridor definitions + city relationships)
│   │   ├── factories.json  (MVP: 20-50 factories, structured data)
│   │   └── cities.ts       (city coordinates for map markers)
│   ├── theme/
│   │   └── index.ts        (Chakra UI custom theme: Navy/Amber)
│   └── fonts/
│       (Grandstander + Lexend WOFF2 from Pickleheads assets)
├── public/
│   ├── fonts/
│   ├── icons/
│   └── logos/
└── package.json
```

### Data Model (MVP — Static JSON)

```ts
interface Corridor {
  id: string;           // 'zhujiang-delta'
  name: string;         // 'Pearl River Delta Electronics'
  nameCn: string;      // '珠三角电子'
  cities: City[];
}

interface City {
  id: string;           // 'shenzhen'
  name: string;         // 'Shenzhen'
  nameCn: string;       // '深圳'
  lat: number;
  lng: number;
  factories: FactoryRef[];
}

interface Factory {
  id: string;
  slug: string;         // 'itc-guangzhou'
  name: string;         // 'ITC — 广东保伦电子'
  nameEn: string;       // 'ITC'
  nameCn: string;       // '广东保伦电子'
  city: string;         // city id
  corridor: string;     // corridor id
  established: number;  // 1993
  area: string;         // '30万㎡'
  employees: string;    // '6,000'
  certifications: string[]; // ['ISO 9001', 'CE', 'RoHS']
  products: string[];  // ['Conference Systems', 'LED Displays', ...]
  oemOdm: boolean;
  moq: string;          // '1台起订'
  priceRange: string;   // '¥¥'
  leadTime: string;     // '15-45 days'
  capacity: string;     // '10,000套/月'
  clients: string[];    // ['Beijing Olympics', 'Shanghai Expo']
  contactHidden: boolean; // always true — data exists, not shown
  // contactInfo fields stored but NOT exposed in page
}
```

### Future Data Pipeline (Post-MVP)
- AI scraping from Alibaba / factory官网 → structured Factory objects
- Contact info stored in `contactInfo` field (never rendered in UI)
- Human review workflow before publishing
- Monthly batch publish cadence

### SEO
- Factory pages: factory name + city + products in `<title>` and meta
- City pages: "Shenzhen manufacturers — [corridor name]"
- Home: "Find Chinese Manufacturers by Industrial Corridor | WAG"
- JSON-LD: Organization schema for WAG

### Deployment
- Subdomain: `manufacturers.winningadventure.com.au`
- Vercel (same as wag-frontend, or separate project)
- Environment: production only (MVP, no staging needed yet)

---

## 7. MVP Scope

### In Scope (MVP)
- [ ] New Next.js project with Chakra UI + Navy theme
- [ ] Pickleheads layout: header + corridor pills + sidebar + map
- [ ] 3-5 corridors, 10-15 cities (subset of full map)
- [ ] 20 factory Fact Sheets (hand-crafted MVP data)
- [ ] City page with factory card grid
- [ ] Factory detail Fact Sheet page
- [ ] Hidden contact info (stored, not rendered)
- [ ] Leaflet map with dark tiles
- [ ] Search (basic, in-memory)
- [ ] Mobile responsive (bottom sheet pattern)

### Out of Scope (Post-MVP)
- [ ] AI scraping pipeline
- [ ] Human review workflow
- [ ] WAG enquiry form integration
- [ ] Full factory dataset (50-100+)
- [ ] Full Chinese city coverage
- [ ] Authentication / user accounts
- [ ] Factory comparisons
- [ ] Favorites / saved factories

---

## 8. Open Questions (Pending)

1. **Subdomain vs subdirectory**: `manufacturers.winningadventure.com.au` or `winningadventure.com.au/manufacturers`? (User chose subdomain — confirm with hosting setup)
2. **Fonts**: Copy Grandstander + Lexend WOFF2 from Pickleheads assets? Or find open-source alternatives?
3. **Map tile provider**: CartoDB Dark Matter (free) or Gaode (China-specific, requires API key)?
4. **Data hosting**: Static JSON in repo (MVP), or external CMS later?
