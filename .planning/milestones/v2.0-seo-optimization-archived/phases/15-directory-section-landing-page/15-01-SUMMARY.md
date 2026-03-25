---
phase: 15
plan: '01'
subsystem: DirectorySection
tags:
  - directory-section
  - leaflet-map
  - city-list
  - factory-directory
  - industry-filters
dependency_graph:
  requires: []
  provides:
    - DirectorySection component (city list + Leaflet map with 70/30 layout)
  affects:
    - app/page.tsx (when integrated)
tech_stack:
  added:
    - leaflet: ^1.9.4
    - leaflet.markercluster: ^1.5.3
    - @types/leaflet: ^1.9.8
    - @types/leaflet.markercluster: ^1.5.4
  patterns:
    - IntersectionObserver for staggered list animations
    - Dynamic import with ssr: false for Leaflet map
    - Custom amber DivIcon markers
    - MarkerClusterGroup for marker clustering
key_files:
  created:
    - app/components/DirectorySection/types.ts
    - app/components/DirectorySection/data/directory-cities.ts
    - app/components/DirectorySection/FilterTabs.tsx
    - app/components/DirectorySection/CityList.tsx
    - app/components/DirectorySection/DirectoryMap.tsx
    - app/components/DirectorySection/DirectoryMapInner.tsx
    - app/components/DirectorySection/index.tsx
decisions:
  - Used dynamic import wrapper pattern (DirectoryMap.tsx imports DirectoryMapInner.tsx with ssr: false)
  - Created custom amber DivIcon for map markers instead of default Leaflet icons
  - Implemented list-map synchronization via CustomEvent from popup buttons
  - Used IntersectionObserver for both section entrance and list item stagger animations
metrics:
  duration_minutes: ~7
  completed: '2026-03-20T07:54:37Z'
  tasks_completed: 5
  files_created: 7
---

# Phase 15 Plan 01 Summary: DirectorySection Component

## One-liner
Factory directory landing page with city list (30%) and interactive Leaflet map (70%) featuring industry filter tabs, amber markers, and marker clustering.

## Completed Tasks

| Task | Commit | Files |
|------|--------|-------|
| 1. Create TypeScript types and city data | 60b3c311 | types.ts, data/directory-cities.ts |
| 2. Create FilterTabs component | 4be7ef58 | FilterTabs.tsx |
| 3. Create CityList component | 3031eece | CityList.tsx |
| 4. Create DirectoryMap components | 5356e9bf | DirectoryMap.tsx, DirectoryMapInner.tsx |
| 5. Create DirectorySection wrapper | a54d0d2e | index.tsx |

## Implementation Details

### DirectorySection Structure
- **types.ts**: `CityEntry` interface with coords, industries, factories, focus fields; `IndustryFilter` type with 8 options
- **directory-cities.ts**: 10 hardcoded Chinese cities with coordinates and industry tags
- **FilterTabs.tsx**: Horizontal scrollable tabs with amber sliding underline indicator
- **CityList.tsx**: Scrollable city items with IntersectionObserver stagger fade-in (index * 80ms delay), amber border-left on selected
- **DirectoryMap.tsx**: Dynamic import wrapper with ssr: false and loading skeleton
- **DirectoryMapInner.tsx**: Leaflet map with custom amber DivIcon markers, MarkerClusterGroup, custom styled popups
- **index.tsx**: Main wrapper with 70/30 grid layout (desktop), stacked (mobile), IntersectionObserver section entrance

### State Management
- `activeFilter: IndustryFilter` - drives FilterTabs and filters city/map display
- `selectedCity: string | null` - syncs between CityList and DirectoryMap
- `visible: boolean` - IntersectionObserver for section entrance animation

### List-Map Synchronization
- CityList item click → `onCitySelect` callback → DirectoryMap pans to city
- DirectoryMap marker click → `onCitySelect` callback → CityList scroll to city
- Popup "View Directory" button → CustomEvent dispatched → `onCitySelect` handler

## Deviations from Plan

**None - plan executed exactly as written.**

### Note
The plan objective stated "Fully replaces the existing Industries section on homepage" but the tasks did not include updating `app/page.tsx`. The DirectorySection component was created per the task specifications, but integration into the homepage (replacing Industries) was not part of this plan's scope.

## Verification

- Build: `npm run build` passes
- Lint: ESLint passes (though lint script has incorrect directory)
- All 7 files created with correct exports

## Commits (Chronological)

```
60b3c311 feat(phase-15): add DirectorySection types and city data
4be7ef58 feat(phase-15): add FilterTabs component with amber sliding indicator
3031eece feat(phase-15): add CityList component with IntersectionObserver animation
5356e9bf feat(phase-15): add DirectoryMap components with Leaflet and marker clustering
a54d0d2e feat(phase-15): create main DirectorySection wrapper component
```

## Self-Check: PASSED

- [x] All 7 files created in app/components/DirectorySection/
- [x] types.ts exports CityEntry interface and IndustryFilter type
- [x] directory-cities.ts exports 10 cities with coords
- [x] FilterTabs renders 8 industry tabs with amber active state
- [x] CityList has IntersectionObserver stagger animation
- [x] DirectoryMapInner uses Leaflet with marker clustering
- [x] DirectoryMap.tsx is dynamic import wrapper with ssr: false
- [x] DirectorySection/index.tsx wires all components with 70/30 layout
- [x] npm run build passes
