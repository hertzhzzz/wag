# Path & Dependency Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align documentation and configs with actual project structure; establish consistent import conventions.

**Architecture:** Single-pass config cleanup + one import fix. No new functionality.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS

---

## Files to Modify

| File | Change |
|------|--------|
| `tailwind.config.ts` | Remove dead `./admin/**` and `./shared/**` content paths |
| `tsconfig.json` | Remove `@/lib/*` alias |
| `CLAUDE.md` | Fix social/ description, remove dev:admin, fix skill path |
| `app/layout.tsx` | Fix 1 import from relative to `@/` |

---

## Task 1: Clean up tailwind.config.ts

**Files:**
- Modify: `tailwind.config.ts:1-27`

- [ ] **Step 1: Remove dead content paths**

Edit `tailwind.config.ts` — remove lines 7-8:
```typescript
// DELETE THESE TWO LINES:
"./admin/**/*.{js,ts,jsx,tsx,mdx}",
"./shared/**/*.{js,ts,jsx,tsx,mdx}",
```

Keep only:
```typescript
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
],
```

- [ ] **Step 2: Verify build still works**

Run: `npm run build`
Expected: Build succeeds (no errors about missing directories)

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "fix: remove dead admin/shared paths from tailwind content"
```

---

## Task 2: Remove dead `@/lib/*` alias from tsconfig

**⚠️ NO-OP — Do not execute**

Investigation revealed `@/lib/*` IS actively used in:
- `app/api/contact/route.ts` → `@/lib/rate-limit`
- `app/api/enquiry/route.ts` → `@/lib/rate-limit`
- `app/api/newsletter/route.ts` → `@/lib/rate-limit`
- `app/components/CTABand.tsx` → `@/lib/analytics`
- `app/components/ScrollTracker.tsx` → `@/lib/useScrollDepth`

Removing it breaks the build. This was a false assumption during design.

---

## Task 3: Fix import in app/layout.tsx

**⚠️ NO-OP — Do not execute**

ScrollTracker is used ONLY in `app/layout.tsx` (verified via grep). Under the established convention ("local components → relative path"), the relative import is CORRECT. The design assumption was wrong.

---

## Task 4: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Fix social/ directory description**

Find the social/ section and replace:
```
social/               # [已移至 skill 目录] — 空目录，可删除
```

With accurate description:
```
social/               # Social media content assets
│   └── linkedin-post/ # LinkedIn post images (4.9M)
```

- [ ] **Step 2: Remove `dev:admin` command**

Delete the line:
```bash
npm run dev:admin   # 管理后台 (localhost:3001)
```

- [ ] **Step 3: Fix skill path**

Find and replace:
```
.claude/skills/wag-content-hub/
```
With:
```
.claude/skills/wag-linkedin-post/
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: fix CLAUDE.md - correct social/ description, remove dead admin command, fix skill path"
```

---

## Task 5: Final Verification

- [ ] **Step 1: Run full build check**

Run: `npm run build && npm run lint`
Expected: Both pass

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "chore: path refactor complete"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| Remove dead `@/lib/*` alias | Task 2 |
| Remove dead tailwind paths | Task 1 |
| Fix CLAUDE.md social/ | Task 4 |
| Fix CLAUDE.md dev:admin | Task 4 |
| Fix CLAUDE.md skill path | Task 4 |
| Fix layout.tsx import | Task 3 |
| Build verification | Tasks 1,2,3,5 |
