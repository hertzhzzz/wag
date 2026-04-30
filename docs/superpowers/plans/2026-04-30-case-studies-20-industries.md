# Case Studies Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `/case-studies` hub page and 20 individual industry case study pages (`/case-studies/[slug]`), with MDX content files for each of WAG's 20 industries, fully E-E-A-T compliant and SEO-optimized.

**Architecture:**
- Hub page (`/case-studies`) — aggregates all 20 case studies with industry filter
- Dynamic detail page (`/case-studies/[slug]`) — renders individual case study from MDX
- 20 MDX content files in `content/case-studies/`
- Sitemap + internal linking updates for SEO crawlability

**Tech Stack:** Next.js 15 App Router, MDX + gray-matter + next-mdx-remote, TypeScript, Tailwind CSS

---

## File Structure

```
app/
├── case-studies/
│   ├── page.tsx                          # Hub — aggregate + filter
│   └── [slug]/
│       └── page.tsx                       # Dynamic detail page
content/
└── case-studies/                          # 20 MDX files
    ├── aesthetics-cosmetics.mdx
    ├── agricultural-drones.mdx
    ├── chemical-industrial.mdx
    ├── fashion-apparel.mdx
    ├── food-beverage.mdx
    ├── healthcare-medical.mdx
    ├── construction-building.mdx
    ├── technology-electronics.mdx
    ├── furniture-homewares.mdx
    ├── av-smart-systems.mdx
    ├── packaging-print.mdx
    ├── agriculture-farming.mdx
    ├── automotive-transport.mdx
    ├── energy-environment.mdx
    ├── robotics-automation.mdx
    ├── textiles-home-textiles.mdx
    ├── lighting-products.mdx
    ├── toys-juvenile-products.mdx
    ├── sporting-goods-equipment.mdx
    └── machinery-equipment.mdx
app/
└── sitemap.ts                            # Add case study URLs
app/components/
└── CaseStudies.tsx                      # Update to link to /case-studies
```

---

## Tasks

### Task 1: Create Hub Page `app/case-studies/page.tsx`

**Files:**
- Create: `app/case-studies/page.tsx`
- Create: `app/case-studies/loading.tsx`
- Create: `app/case-studies/error.tsx`

### Task 2: Create Detail Page + MDX Loader

**Files:**
- Create: `app/case-studies/[slug]/page.tsx`
- Create: `app/case-studies/[slug]/loading.tsx`
- Create: `lib/case-study-mdx.ts`

### Task 3: Create All 20 MDX Content Files

**Files:**
- Create: `content/case-studies/*.mdx` (20 files)

### Task 4: Update Sitemap

**Files:**
- Modify: `app/sitemap.ts`

### Task 5: Update Internal Linking

**Files:**
- Modify: `app/components/CaseStudies.tsx`

### Task 6: Verify Build

- Run `npm run build`
- Verify all routes accessible
