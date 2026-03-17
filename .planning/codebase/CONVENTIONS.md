# Coding Conventions

**Analysis Date:** 2026-03-17

## Naming Patterns

### Components
- PascalCase: `Navbar.tsx`, `FAQ.tsx`, `IndustryCard.tsx`
- File name matches component name

### Pages/Routes
- kebab-case directories: `app/services/`, `app/enquiry/`
- Dynamic routes: `[slug]/page.tsx`

### Utilities & Hooks
- camelCase: `useFormValidation.ts`, `formatDate.ts`

### Functions
- camelCase with `handle{Action}` pattern: `handleSubmit()`, `handleChange()`

## Code Style

### ESLint
- Config: `frontend/.eslintrc.json`
- Extends: `next/core-web-vitals`
- Run: `npm run lint`

### TypeScript
- Strict mode enabled
- Path aliases in `tsconfig.json`:
  - `@/*` -> `./app/*`
  - `@/lib/*` -> `./lib/*`

### React Patterns
- Server Components by default
- `'use client'` directive only when interactivity needed (state, effects, event handlers)
- Prefer functional components with hooks

### Tailwind CSS
- Version: 3.4
- Custom design tokens in `tailwind.config.ts`:
  - Primary: `navy` (#0F2D5E)
  - Accent: `amber` (#F59E0B)
  - Fonts: IBM Plex Sans, IBM Plex Serif

## Import Order

1. React/Next.js built-ins
2. Next.js imports (Link, Image, usePathname)
3. Third-party (lucide-react, zod)
4. Path aliases (@/data/, @/components/)
5. Local relative imports

Example:
```typescript
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { z } from 'zod'
import { formatDate } from '@/lib/utils'
import { Navbar } from '@/components/Navbar'
```

## Component Patterns

### Server Component
```typescript
export default function Page() {
  return <div>...</div>
}
```

### Client Component
```typescript
'use client'

import { useState } from 'react'

export default function Form() {
  const [state, setState] = useState('')
  // ...
}
```

## Error Handling

### API Routes
- try/catch blocks with NextResponse.json()
- Proper status codes (200, 400, 500)
```typescript
try {
  // logic
  return NextResponse.json({ success: true })
} catch (error) {
  return NextResponse.json({ error: 'Message' }, { status: 500 })
}
```

### Form Validation
- Zod for schema validation
- Client-side validation returning error objects

## CSS/Tailwind Conventions

### Responsive Design
- Mobile-first: default styles for mobile, `md:` prefix for desktop
- Common breakpoints: `md:` (768px), `lg:` (1024px), `xl:` (1280px)

### Spacing
- Use Tailwind spacing scale (p-4, m-2, gap-6)
- Consistent padding: `px-4 md:px-8` for page containers

### Colors
- Use design tokens: `text-navy`, `bg-amber`, `text-white/60`
- Opacity modifiers: `bg-white/90`, `text-white/50`

---

*Conventions analysis: 2026-03-17*
