# Path & Dependency Refactor Design

**Date:** 2026-04-11
**Status:** Approved
**Type:** Refactor / Documentation Fix

## Context

CLAUDE.md was out of sync with actual project structure. Tailwind config referenced non-existent directories. Import style was inconsistent within the same file.

## Goal

Align documentation with reality, establish consistent import conventions, and clean up dead config references.

---

## 1. Path Alias Strategy

**Decision:** Single alias `@/*` for all app code.

**Rationale:**
- `@/lib/*` existed but was used only 3 times (all `rate-limit` imports)
- Single alias reduces mental overhead
- `@/lib/rate-limit` via `@/*` is equivalent and consistent

**Final alias:**
```
@/* → ./app/*
```

**Remove:**
```
@/lib/* → ./lib/*  (dead alias, unused)
```

---

## 2. Import Style Convention

**Rule 1 — Shared components (cross-page):** Use `@/`
```typescript
import FAQ from '@/components/FAQ'
import Navbar from '@/components/Navbar'
```

**Rule 2 — Local components (page-specific only):** Use relative path
```typescript
// app/page.tsx
import Hero from './components/Hero'

// app/enquiry/page.tsx
import EnquiryForm from './EnquiryForm'
```

**Rule 3 — Library utilities:** Use `@/`
```typescript
import { checkRateLimit } from '@/lib/rate-limit'
```

**Change required:**
- `app/layout.tsx`: `import ScrollTracker from './components/ScrollTracker'` → `import ScrollTracker from '@/components/ScrollTracker'`

---

## 3. Configuration Cleanup

### 3a. tailwind.config.ts

Remove references to non-existent directories:
- Delete: `"./admin/**/*.{js,ts,jsx,tsx,mdx}"`
- Delete: `"./shared/**/*.{js,ts,jsx,tsx,mdx}"`

Keep:
```typescript
"./app/**/*.{js,ts,jsx,tsx,mdx}",
"./components/**/*.{js,ts,jsx,tsx,mdx}",
```

### 3b. CLAUDE.md Corrections

| Section | Fix |
|---------|-----|
| `social/` description | Remove "空目录，可删除" — directory contains 4.9M of linkedin-post assets |
| `dev:admin` command | Remove — `admin/` directory does not exist |
| Skill path | Change `.claude/skills/wag-content-hub/` → `wag-linkedin-post/` |

---

## 4. Files to Change

| File | Change |
|------|--------|
| `tailwind.config.ts` | Remove dead content paths |
| `tsconfig.json` | Remove `@/lib/*` alias |
| `CLAUDE.md` | Fix social/ description, remove dev:admin, fix skill path |
| `app/layout.tsx` | Fix 1 import from relative to `@/` |

---

## 5. Actual Outcome

| Change | Status | Note |
|--------|--------|------|
| Remove `./admin/**` and `./shared/**` from tailwind | ✅ Done | Clean |
| Remove `@/lib/*` from tsconfig | ❌ No-op | Actually used in 5 places — would break build |
| Fix layout.tsx import | ❌ No-op | ScrollTracker is local to layout, relative is correct |
| Fix CLAUDE.md | ✅ Done | social/, dev:admin, skill path all corrected |

## 6. Verification

After changes:
- [x] `npm run build` passes
- [ ] `npm run lint` passes (pre-existing errors, unrelated)
- [ ] All 5 pages accessible (`/`, `/services`, `/about`, `/resources`, `/enquiry`)
- [x] No references to `admin/` or `shared/` in configs
- [x] Import style consistent (shared=`@/`, local=relative)
