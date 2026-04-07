# Coding Conventions

**Analysis Date:** 2026-04-07

## Naming Patterns

**Files:**
- Components: `PascalCase.tsx` (e.g., `DirectoryMap.tsx`, `Navbar.tsx`)
- Pages: `page.tsx`, `layout.tsx`
- API Routes: `route.ts`
- Utilities: `camelCase.ts` (e.g., `article-utils.ts`, `string-utils.ts`)
- Types: `camelCase.ts` (e.g., `types.ts`, `article-utils.ts`)
- Data: `camelCase.ts` (e.g., `directory-cities.ts`)
- Tests: `PascalCase.test.tsx` (e.g., `DirectoryMap.test.tsx`)

**Directories:**
- PascalCase for component folders: `app/components/DirectorySection/`
- kebab-case for feature folders: `app/resources/[slug]/`

**TypeScript Types/Interfaces:**
- Object shapes: `interface PascalCase` (e.g., `CityEntry`, `Article`, `Frontmatter`)
- Union types: `type IndustryFilter = 'All' | 'Electronics' | ...`
- Props interfaces: `interface ComponentNameProps`

**Functions/Variables:**
- camelCase: `getArticle`, `checkRateLimit`, `slugify`
- Boolean: `isLoading`, `hasError`, `canSubmit`

## Code Style

**Formatting:**
- Tool: Prettier (implied by project rules)
- Config: Not detected in project root

**Linting:**
- Tool: ESLint
- Config: `.eslintrc.json` extends `next/core-web-vitals` and `next/typescript`
- Run command: `npm run lint`

**TypeScript:**
- Strict mode: enabled (`"strict": true` in `tsconfig.json`)
- JSX: `react-jsx` transform
- Module resolution: `bundler`

## Import Organization

**Order:**
1. Next.js imports (`next/link`, `next/image`, `next/server`)
2. React imports (`react`, `react-dom`)
3. Third-party packages (`lucide-react`, `zod`, etc.)
4. Internal path aliases (`@/components/*`, `@/lib/*`)
5. Relative imports (`./`, `../`)

**Path Aliases:**
- `@/*` maps to `app/*`
- `@/lib/*` maps to `lib/*`

**Example:**
```typescript
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { z } from 'zod'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { slugify } from './string-utils'
import type { Article } from './types'
```

## Component Patterns

**Server vs Client:**
- Default to server components
- Add `'use client'` directive only when needed (hooks, browser APIs, event handlers)

**Client Component Loading:**
```typescript
const DirectoryMapInner = dynamic(() => import('./DirectoryMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-navy/5 animate-pulse rounded-lg...">
      <span className="text-navy/40 text-sm">Loading map...</span>
    </div>
  ),
})
```

**Prop Types:**
```typescript
interface DirectoryMapProps {
  cities: CityEntry[]
  selectedCity: string | null
  onCitySelect: (city: string) => void
}

export default function DirectoryMap(props: DirectoryMapProps) {
  return <DirectoryMapInner {...props} />
}
```

**CSS Styling:**
- Primary: Tailwind CSS utility classes
- Component-specific: `<style jsx>` for scoped styles (see `Navbar.tsx`)
- CSS custom properties via Tailwind tokens (`text-navy`, `bg-[#0F2D5E]`)

## Error Handling

**API Routes:**
```typescript
try {
  const transporter = await getTransporter()
  await transporter.sendMail({ ... })
  return NextResponse.json({ ok: true })
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  console.error('Email error:', errorMessage)
  return NextResponse.json(
    { error: 'Failed to send email. Please try again.' },
    { status: 500 }
  )
}
```

**Form Validation:**
```typescript
const parseResult = enquirySchema.safeParse(await request.json())
if (!parseResult.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
    { status: 400 }
  )
}
```

**Client-Side Fetch:**
```typescript
try {
  const res = await fetch('/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  if (res.ok) {
    setSubmitted(true)
  } else {
    const data = await res.json()
    const errorMsg = data.details
      ? Object.values(data.details).flat().join(', ')
      : data.error
    setErrors({ submit: errorMsg || 'Submission failed.' })
  }
} catch {
  setErrors({ submit: 'Network error. Please try again.' })
}
```

**Safe Type Narrowing:**
```typescript
const errorMessage = error instanceof Error ? error.message : 'Unknown error'
```

## Input Validation

**Zod Schema Validation:**
```typescript
const enquirySchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  industry: z.string().min(1, 'Industry is required').max(100),
  customIndustry: z.string().optional(),
  lookingFor: z.string().min(1, 'Please describe what you need').max(5000),
})
```

**XSS Prevention:**
```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
```

## Function Design

**Size:** Keep under 50 lines; extract sub-components for larger logic

**Parameters:** Explicit types on exported functions; infer obvious local types

**File-based Organization:**
```typescript
// article-utils.ts - related functions grouped
export function getAllSlugs(): string[] { ... }
export function getArticle(slug: string): Article | null { ... }
export function getPrevNextArticles(currentSlug: string): PrevNextArticles { ... }
export function extractHeadings(content: string): Heading[] { ... }
export function splitContent(content: string): { intro: string; body: string } { ... }
```

## Comments

**When Used:**
- Section dividers in large files: `// ============================================`
- TDD phase comments in tests: `/** RED Phase: ... */`
- JSDoc on exported utility functions

**Example:**
```typescript
// ============================================
// FILE SYSTEM HELPERS
// ============================================
```

## API Route Patterns

**Response Format:** `{ ok: true }` for success, `{ error: string, details?: ... }` for errors

**CORS Pattern:**
```typescript
const ALLOWED_ORIGINS = [
  'https://www.winningadventure.com.au',
  'https://winningadventure.com.au'
]

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': origin, ... },
  })
}
```

**Rate Limiting:** Upstash Redis with in-memory fallback

## Module Design

**Exports:** Named exports for utilities; default export for pages/components

**Barrel Files:** `index.tsx` for component folders (e.g., `DirectorySection/index.tsx`)

---

*Convention analysis: 2026-04-07*
