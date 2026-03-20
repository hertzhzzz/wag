# Coding Conventions

**Analysis Date:** 2026-03-20

## Linting & Formatting

**ESLint:**
- Config: `.eslintrc.json`
- Extends: `["next/core-web-vitals", "next/typescript"]`
- Run via: `npm run lint`

**TypeScript:**
- Config: `tsconfig.json`
- Strict mode: **enabled**
- Path aliases:
  - `@/*` → `./app/*`
  - `@/lib/*` → `./lib/*`

**Styling:**
- Tailwind CSS 3.4 with `@tailwindcss/typography` plugin
- PostCSS config: `postcss.config.js`
- Design tokens in `tailwind.config.ts`:
  - Colors: `navy` (#0F2D5E), `amber` (#F59E0B)
  - Fonts: `sans` (IBM Plex Sans), `serif` (IBM Plex Serif)

**Prettier:**
- Not explicitly configured in project root
- No `.prettierrc` at project level

## Naming Patterns

**Files:**
- Components: `PascalCase.tsx` (e.g., `Navbar.tsx`, `EnquiryForm.tsx`, `KeyboardAwareInput.tsx`)
- Pages: `page.tsx` (lowercase)
- Layouts: `layout.tsx` (lowercase)
- API Routes: `route.ts` (lowercase)
- Utilities: `camelCase.ts` (e.g., `rate-limit.ts`)
- Config: `camelCase.ts` or `kebab-case.*`

**Directories:**
- Route directories: `lowercase` (e.g., `app/api/enquiry/`)
- Component subdirectories: `lowercase` (e.g., `components/industries/`)
- Page directories: `lowercase` (e.g., `app/resources/[slug]/`)

**Functions & Variables:**
- React components: `PascalCase` (e.g., `export default function EnquiryForm()`)
- Regular functions: `camelCase` (e.g., `checkRateLimit`, `escapeHtml`)
- Hooks: `camelCase` starting with `use` (e.g., `useState`, `useEffect`)
- Constants: `SCREAMING_SNAKE_CASE` for true constants (e.g., `MEMORY_RATE_LIMIT`)
- TypeScript interfaces: `PascalCase` (e.g., `KeyboardAwareInputProps`)

## Import Organization

**Order (as enforced by Next.js/TypeScript):**
1. React imports (`import React from 'react'`)
2. Next.js imports (`import Link from 'next/link'`, `import Image from 'next/image'`)
3. Third-party library imports (`import { z } from 'zod'`, `import { Redis } from '@upstash/redis'`)
4. Path alias imports (`import Navbar from '@/components/Navbar'`)
5. Relative imports (`import Footer from './components/Footer'`)

**Path Alias Usage:**
```typescript
import { checkRateLimit } from '@/lib/rate-limit'  // lib/rate-limit.ts
import Navbar from '@/components/Navbar'            // app/components/Navbar.tsx
```

## Component Patterns

**Server vs Client:**
- Default to Server Components
- Add `'use client'` directive only when needed (useState, useEffect, event handlers, browser APIs)
- 17 client components identified in codebase (Navbar, FAQ, EnquiryForm, etc.)

**Component Structure:**
```typescript
'use client'  // Only if needed

import { useState, useEffect } from 'react'
import { SomeIcon } from 'lucide-react'

export default function ComponentName() {
  // State hooks first
  const [state, setState] = useState(initialValue)

  // Effects second
  useEffect(() => {
    // cleanup with return
  }, [dependencies])

  // Handlers
  const handleClick = () => { ... }

  // Return JSX
  return ( ... )
}
```

**Component Size:**
- Target: < 200 lines per component (per CLAUDE.md)
- Larger components should be split (e.g., `EnquiryForm.tsx` imports `KeyboardAwareInput` from `./components/`)

## Error Handling

**API Routes:**
```typescript
export async function POST(request: Request) {
  try {
    // Validation with Zod
    const parseResult = schema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Business logic
    const result = await someOperation()

    return NextResponse.json({ ok: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Operation error:', errorMessage)
    return NextResponse.json(
      { error: 'User-friendly message' },
      { status: 500 }
    )
  }
}
```

**Client-Side Error Boundary:**
- `app/error.tsx` with `'use client'` directive
- Ignores browser extension errors (postMessage, content_script)
- Logs other errors via `console.error`

**Validation:**
- Zod for runtime validation (see `app/api/enquiry/route.ts` lines 27-35)
- HTML escape function `escapeHtml()` for XSS prevention (lines 38-45)

## Logging

**Framework:** Native `console`

**Usage Patterns:**
```typescript
// Errors - always with message and error detail
console.error('Email error:', errorMessage)

// Warnings - for recoverable issues or ignoring certain errors
console.warn('Browser extension error ignored:', error.message)

// Debug - for development notes (only in API routes currently)
console.log('Newsletter subscription:', email)
```

## API Route Conventions

**Location:** `app/api/{resource}/route.ts`

**CORS Pattern:**
```typescript
const ALLOWED_ORIGINS = [
  'https://www.winningadventure.com.au',
  'https://winningadventure.com.au'
]

function addCorsHeaders(response: NextResponse, origin: string): NextResponse {
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  return response
}
```

**Rate Limiting:** Via `@/lib/rate-limit` with in-memory fallback

**Response Shape:**
```typescript
// Success
NextResponse.json({ ok: true })

// Validation error
NextResponse.json({ error: 'Message', details: {...} }, { status: 400 })

// Rate limited
NextResponse.json({ error: 'Too many requests...' }, { status: 429 })

// Server error
NextResponse.json({ error: 'User-friendly message' }, { status: 500 })
```

## Styling Conventions

**Tailwind Classes:**
- Space-separated utility classes
- Custom colors via design tokens (navy, amber)
- Responsive prefixes (md:, lg:)
- State prefixes (hover:, focus:, active:)

**Inline Styles:**
- Rarely used, only for dynamic values
- Example from `app/enquiry/EnquiryForm.tsx`: `style={{ minWidth: '280px', height: '600px' }}`

**CSS-in-JS:**
- `<style jsx>` used in `Navbar.tsx` for `.nav-link` class
- Mostly avoided in favor of Tailwind

## TypeScript Patterns

**Strict Mode:**
- All strict flags enabled
- No implicit any
- Strict null checks

**Common Types:**
```typescript
// Props with interface
interface ComponentProps {
  label: string
  required?: boolean
  error?: string
}

// React element type
import { SomeIcon } from 'lucide-react'
const icon = SomeIcon as React.ElementType

// Record for errors
const errors: Record<string, string> = {}
```

## Security Patterns

**XSS Prevention:**
- `escapeHtml()` function for user-generated content in HTML
- `dangerouslySetInnerHTML` only with pre-serialized JSON in `layout.tsx`

**CORS:**
- Whitelist-based origin checking
- Explicit allowed origins list

**Environment Variables:**
- Checked at runtime (not build time)
- Error messages guide configuration

---

*Convention analysis: 2026-03-20*
