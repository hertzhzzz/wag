# Coding Conventions

**Analysis Date:** 2026-03-16

## Naming Patterns

**Files:**
- PascalCase for components: `Navbar.tsx`, `Hero.tsx`, `Footer.tsx`
- PascalCase for page routes: `page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`
- kebab-case for API route files: `route.ts`
- camelCase for utility files: Not present (lib/ is empty)

**Functions:**
- camelCase: `function handleSubmit()`, `function getArticles()`
- PascalCase for component functions: `export default function Hero()`, `export default function EnquiryPage()`
- Async functions: `async function POST(request: Request)`

**Variables:**
- camelCase: `formData`, `mobileMenuOpen`, `errors`, `activeIndex`
- camelCase with descriptive names: `fullName`, `companyName`, `lookingFor`

**Types:**
- PascalCase: `Industry`, `MoreIndustryCategory`, `Metadata`, `IndustryCardProps`
- Inline type annotations for props and function parameters

## Code Style

**Formatting:**
- Tool: Tailwind CSS 3.4 with `@tailwindcss/typography` plugin
- No Prettier config file found - uses defaults
- Tailwind custom colors defined in `tailwind.config.ts`:
  - Primary: `navy` (#0F2D5E)
  - Accent: `amber` (#F59E0B)
- Fonts: IBM Plex Sans, IBM Plex Serif (configured in Tailwind)

**Linting:**
- Tool: ESLint 8.57.1 with `eslint-config-next` 14.2.0
- No custom `.eslintrc` file - uses Next.js defaults
- Run command: `npm run lint`

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- Module resolution: `bundler`
- JSX: `preserve` (Next.js default)
- Path aliases: `@/*` maps to `./app/*`, `@/lib/*` maps to `./lib/*`

## Import Organization

**Order (as observed in source files):**
1. Next.js built-in imports: `import Link from 'next/link'`, `import Image from 'next/image'`, `import { NextResponse } from 'next/server'`
2. React imports: `import { useState, useEffect } from 'react'`
3. Third-party library imports: `import { z } from 'zod'`, `import { Menu, X } from 'lucide-react'`, `import matter from 'gray-matter'`
4. Local component imports: `import Navbar from '@/components/Navbar'`
5. Local relative imports: `import Hero from './components/Hero'`

**Path Aliases:**
- `@/*` - Application code in `app/` directory
- `@/lib/*` - Utility functions (currently empty)
- Relative imports used within same directory: `import Hero from './components/Hero'`

## Error Handling

**API Routes:**
- Zod validation schema for request body validation
- Try-catch blocks for external operations (email sending, file I/O)
- Return `NextResponse.json()` with appropriate status codes (400, 500)
- Error messages are user-friendly: `'Validation failed'`, `'Failed to send email. Please try again.'`

**Client Components:**
- Form validation functions: `validateStep1()`, `validateStep2()`
- Error state stored in `useState<Record<string, string>>`
- try-catch blocks for API calls in form submission

**Global Error Boundary:**
- `app/error.tsx` handles errors with `'use client'`
- Ignores browser extension errors (postMessage, content_script)
- Returns `null` (silent error handling)

## Logging

**Framework:** console (default browser/Node.js)

**Patterns:**
- Server-side errors: `console.error('Email error:', error)`
- Client-side warnings: `console.warn('Browser extension error ignored:', error.message)`
- Newsletter subscriptions: `console.log('Newsletter subscription:', email)`

## Comments

**When to Comment:**
- Section markers in large files: `// Video Background - Full Width`
- Inline styles for dynamic values: `// Mobile menu overlay`

**JSDoc/TSDoc:**
- Not used in codebase

## Function Design

**Size:**
- No strict line limit enforced
- CLAUDE.md specifies: Components < 200 lines
- Large components split into sub-components

**Parameters:**
- Destructured in function signature: `function IndustryCard({ industry, isActive, onClick }: IndustryCardProps)`
- Type annotations for props and return values
- Optional parameters marked with `?`

**Return Values:**
- Server Components: Implicit return (JSX)
- API Routes: `NextResponse.json({...})`
- Helper functions: Explicit returns

## Module Design

**Exports:**
- Default exports for page components and single-purpose modules
- Named exports for types: `export type { Industry, MoreIndustryCategory }`
- Named exports for data arrays: `export const featured: Industry[]`, `export const moreIndustries`

**Barrel Files:**
- Industry components use `index.tsx` for main component: `app/components/industries/index.tsx`
- Other directories do not use barrel files

## Component Patterns

**Server vs Client:**
- Default to Server Components
- Add `'use client'` directive only when using hooks (useState, useEffect) or browser APIs
- Examples:
  - Server: `app/page.tsx`, `app/layout.tsx`, `app/resources/page.tsx`
  - Client: `app/components/Navbar.tsx`, `app/components/industries/index.tsx`, `app/enquiry/page.tsx`

**Styling Approach:**
- Tailwind utility classes exclusively
- Inline styles for dynamic values only (e.g., `style={{ minWidth: '280px', height: '600px' }}`)
- CSS-in-JS via `<style jsx>` for complex animations in Navbar
- Design tokens from tailwind.config.ts: `navy`, `amber`, `font-sans`, `font-serif`

---

*Convention analysis: 2026-03-16*
