# Plan: WAG Landing Page Refactor

## Objective

Refactor the Next.js landing page to be more architecturally elegant, while keeping all functionality and frontend styles unchanged. Key goal: exclude `social/` and `content/` directories from Vercel deployment.

## Context Brief

**Current State:**
- Next.js App Router landing page at `app/`
- `layout.tsx` contains 3 inline JSON-LD schemas (Organization, LocalBusiness, WebSite) totaling ~250 lines
- Inline Google Analytics and LiveChat scripts
- `social/` and `content/` directories tracked by git and included in Vercel deployment
- Multiple schema components scattered in `app/components/` (FAQSchema, ArticleSchema, ServiceSchema, etc.)

**Project Structure:**
```
wag/
├── app/                    # Next.js App Router (DEPLOY TO VERCEL)
├── public/                 # Static assets (DEPLOY TO VERCEL)
├── social/                 # Marketing content (DO NOT DEPLOY)
├── content/                # Blog MDX content (DO NOT DEPLOY)
├── lib/                    # Utilities
└── ...
```

**What Must NOT Change:**
- Visual appearance / UI
- Page routes (/, /services, /about, /resources, /enquiry)
- Component styling (Tailwind classes)
- Functionality (forms, navigation, schemas)

## Phase 1: Isolate Deployment Scope

### Step 1.1: Update .gitignore

**Task:** Add `social/` and `content/` to `.gitignore`

**Files to modify:**
- `.gitignore` — Add `social/` and `content/` entries

**Verification:**
```bash
git status social/ content/  # Should show "everything is up to date" or ignored
```

**Exit Criteria:**
- `social/` and `content/` are not tracked in git after this commit
- They are NOT deployed to Vercel

**Risk:** None — these files still exist locally, just not tracked

---

## Phase 2: Extract Schemas to lib/schemas/

### Step 2.1: Create Schema Library Structure

**Task:** Create `lib/schemas/` directory with extracted schemas

**Files to create:**
- `lib/schemas/organization.ts` — Organization + LocalBusiness schema (extracted from layout.tsx)
- `lib/schemas/website.ts` — WebSite schema (extracted from page.tsx)
- `lib/schemas/index.ts` — Barrel export

**Exit Criteria:**
- All schema data lives in `lib/schemas/`
- `layout.tsx` imports from `lib/schemas/`
- Build passes without errors

### Step 2.2: Extract Inline JSON-LD from layout.tsx

**Task:** Remove ~200 lines of inline JSON-LD from `layout.tsx`

**Changes to `app/layout.tsx`:**
```tsx
// BEFORE: ~250 lines of inline dangerouslySetInnerHTML
<script type="application/ld+json" dangerouslySetInnerHTML={{
  __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", ... })
}} />

// AFTER: Clean import
<OrganizationSchema />
<LocalBusinessSchema />
```

**Exit Criteria:**
- `layout.tsx` reduced from ~214 lines to ~100 lines
- All schemas render identically

---

## Phase 3: Extract Third-Party Scripts

### Step 3.1: Create Script Library

**Task:** Create `lib/scripts/` for third-party scripts

**Files to create:**
- `lib/scripts/analytics.ts` — Google Analytics gtag script
- `lib/scripts/chat.ts` — LiveChat script
- `lib/scripts/index.ts` — Barrel export

**Exit Criteria:**
- Scripts in `lib/scripts/` are imported by `layout.tsx`
- No inline script strings in `layout.tsx`

---

## Phase 4: Component Organization (Optional Cleanup)

### Step 4.1: Review Component Structure

**Task:** Verify component organization is logical

**Current structure:**
```
app/components/
├── DirectorySection/
│   ├── index.tsx
│   ├── DirectoryMap.tsx
│   ├── DirectoryMapInner.tsx
│   ├── CityList.tsx
│   ├── FilterTabs.tsx
│   ├── types.ts
│   └── data/directory-cities.ts
├── industries/
│   ├── index.tsx
│   ├── IndustryCard.tsx
│   ├── MoreIndustries.tsx
│   └── types.ts
├── FAQSchema.tsx
├── ArticleSchema.tsx
├── ServiceSchema.tsx
├── BreadcrumbSchema.tsx
├── PersonSchema.tsx
├── WebsiteSchema.tsx  # (new - extracted from page.tsx)
└── ...
```

**Decision:** If components are logically organized, skip this step. If not, propose reorganization.

---

## Phase 5: Verification

### Step 5.1: Build Verification

**Commands:**
```bash
npm run build
```

**Exit Criteria:**
- Build succeeds without errors
- All pages render correctly (5 pages: /, /services, /about, /resources, /enquiry)

### Step 5.2: Deployment Test

**Commands:**
```bash
git add .gitignore
git commit -m "chore: exclude social/ and content/ from deployment"
git push origin master
```

**Verification:**
```bash
curl -sI https://www.winningadventure.com.au/ | head -20
curl -sI https://www.winningadventure.com.au/services | head -20
curl -sI https://www.winningadventure.com.au/about | head -20
```

**Exit Criteria:**
- Homepage returns 200
- All pages accessible
- No 404 errors on existing routes

---

## Dependency Graph

```
Step 1.1 (.gitignore)
    ↓
Step 2.1 (Create lib/schemas/)
    ↓
Step 2.2 (Extract schemas from layout.tsx)
    ↓
Step 3.1 (Create lib/scripts/)
    ↓
Step 4.1 (Review components)
    ↓
Step 5.1 (Build verification)
    ↓
Step 5.2 (Deploy + verify)
```

## Parallelization

**CAN run in parallel:**
- Steps 2.1 and 3.1 (create lib/schemas/ and lib/scripts/ simultaneously)

**MUST run serially:**
- All steps after 2.2 depend on schemas being extracted

## Rollback Strategy

If any step fails:
1. `git stash` to preserve uncommitted changes
2. Run build to verify baseline works
3. Identify which step caused the issue
4. Restore with `git stash pop`

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| `layout.tsx` lines | ~214 | ~100 |
| Inline JSON-LD in layout | 3 blocks | 0 |
| Inline script strings | 2+ | 0 |
| social/ in git | tracked | ignored |
| content/ in git | tracked | ignored |
