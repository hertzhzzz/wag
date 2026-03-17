# CONVENTIONS.md - Coding Conventions

**Analysis Date:** 2026-03-17

## Naming Patterns

### Files
- Components: PascalCase (e.g., `Navbar.tsx`, `IndustryCard.tsx`)
- Types/Interfaces: PascalCase
- Index files for barrel exports: `index.tsx`

### Functions & Variables
- camelCase (e.g., `handleScroll`, `mobileMenuOpen`, `scrolled`)

### Types
- PascalCase interfaces (e.g., `Industry`, `MoreIndustryCategory`)

## Code Style

- **Formatting**: No explicit Prettier config
- **Styling**: Tailwind CSS utility classes inline
- **Linting**: ESLint with Next.js config
- **Indentation**: 2 spaces

## Import Order

1. Next.js built-ins (`Link`, `Image`)
2. React hooks (`useState`, `useEffect`)
3. Third-party libraries (`lucide-react`, `zod`)
4. Path aliases (`@/components/Navbar`)
5. Relative imports (`./components/KeyboardAwareInput`)

## Server vs Client Components

- Server by default (no directive)
- `'use client'` directive when client-side interactivity needed

## Error Handling

- Zod validation with `safeParse()` for API routes
- try/catch blocks for async operations
- XSS prevention via `escapeHtml()` in `app/api/enquiry/route.ts`

---

*Conventions analysis: 2026-03-17*
