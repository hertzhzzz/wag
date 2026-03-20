# Phase 14 Plan: Two Ways to Access Section

**Created:** 2026-03-20
**Status:** Ready for execution

---

## Phase Goal

Add a "Two Ways to Access" section to the homepage between `HowItWorks` and `Industries`, presenting two service options side-by-side: Full Service (Guided Tours) and Factory Directory Access.

---

## Deliverables

| Deliverable | File | Verification |
|-------------|------|--------------|
| TwoWaysAccess component | `app/components/TwoWaysAccess.tsx` | Component renders without errors |
| Homepage integration | `app/page.tsx` | Section visible between HowItWorks and Industries |
| Build verification | `npm run build` | No TypeScript or lint errors |

---

## Task Breakdown

### Task 1: Create TwoWaysAccess Component

**File:** `app/components/TwoWaysAccess.tsx`

**Steps:**
1. Add `'use client'` directive at top
2. Import: `useEffect`, `useRef`, `useState` from React; `Link` from next/link; `Compass`, `Database` from lucide-react
3. Define card data array:
   - **Full Service card** (isPrimary: true): Compass icon, "Full Service / Guided Tours" title, description text, 4 bullet points (专属向导陪同, 工厂筛选和对接, 质量管控指导, 后续合同支持), CTA "Start Your Tour" linking to /enquiry
   - **Directory Access card** (isPrimary: false): Database icon, "Factory Directory Access" title, description text, 3 bullet points (浏览部分工厂预览, 海量工厂数据, 提交询价获取完整信息), CTA "Request Directory Access" linking to /enquiry
4. Implement IntersectionObserver pattern from HowItWorks.tsx lines 44-59 (threshold: 0.15)
5. Build section structure:
   - Section wrapper: `className="bg-white py-20 md:py-28 px-4 md:px-8"`
   - Inner container: `className="max-w-[1400px] mx-auto"`
   - Section header: "How Would You Like to Find Your Factory?" (h2, font-serif, text-navy)
   - Grid container: `className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"`
6. Build card structure:
   - Base card: `className="rounded-2xl p-6 md:p-8 h-full"`
   - Primary variant (Full Service): `border-amber/30 bg-amber/5 shadow-[0_8px_32px_rgba(245,158,11,0.15)]`
   - Default variant (Directory): `border-navy/5 bg-white shadow-[0_4px_24px_rgba(15,45,94,0.06)]`
   - Icon container: `w-12 h-12 rounded-xl flex items-center justify-center mb-6`
   - Primary icon bg: `bg-amber/20`, icon color: `text-amber`
   - Default icon bg: `bg-navy/5`, icon color: `text-navy`
   - Title: `text-xl font-semibold text-navy mb-3`
   - Description: `text-navy/60 mb-6`
   - Bullet list: `space-y-2 mb-8`, each item with bullet dot + text
   - CTA button: styled Link with arrow, primary uses amber bg, default uses navy bg
7. Apply staggered animation: cards animate in with 150ms delay between them
8. Add `ref={sectionRef}` to grid container for IntersectionObserver

**Reference:** HowItWorks.tsx lines 44-59 (IntersectionObserver), lines 93-97 (card styling)

---

### Task 2: Integrate Into Homepage

**File:** `app/page.tsx`

**Steps:**
1. Add import: `import TwoWaysAccess from './components/TwoWaysAccess'`
2. Insert `<TwoWaysAccess />` between `<HowItWorks />` and `<Industries />`

**Expected structure:**
```tsx
<HowItWorks />
<TwoWaysAccess />
<Industries />
```

---

### Task 3: Verify

**Commands:**
```bash
npm run build
npm run lint
```

**Visual check:**
- Section header "How Would You Like to Find Your Factory?" visible
- Two cards displayed side-by-side (desktop) or stacked (mobile)
- Full Service card has amber border/background emphasis
- Directory Access card has default white styling
- IntersectionObserver animation triggers on scroll
- Both CTA buttons link to /enquiry

---

## Technical Notes

- **No new dependencies** — all libraries already in project
- **IntersectionObserver pattern** — copied verbatim from HowItWorks.tsx
- **Design tokens** — use `navy` and `amber` from Tailwind config, not raw hex
- **Client component** — required for IntersectionObserver browser API

---

## Out of Scope

- Directory page creation (Phase 15)
- Floating contact button (Phase 16)
- FAQ page (Phase 17)
- Any backend/data fetching

---

## Dependencies

None — Task 1 and Task 2 are independent and can run in parallel.

---
