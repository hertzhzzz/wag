# Testing Patterns

**Analysis Date:** 2026-03-20

## Test Framework

**Status:** No project-specific test files detected

**Dependencies Available:**
- `@playwright/test` (v1.58.2) - Installed but no test files found
- No Jest config
- No Vitest config

**Run Commands:**
```bash
npm run lint    # ESLint checks (next lint)
npm run build   # Production build with type checking
```

## Project Test Philosophy

Based on codebase analysis:
- No unit tests in project
- No integration tests in project
- Playwright is installed for potential E2E testing but not utilized
- Quality assurance via:
  - TypeScript strict mode (`tsconfig.json`)
  - ESLint (`next/core-web-vitals`, `next/typescript`)
  - Manual testing
  - Build verification (`npm run build`)

## Testing Patterns in Codebase

### Validation Testing (Manual via Zod)

**Example from `app/api/enquiry/route.ts`:**
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

// Usage
const parseResult = enquirySchema.safeParse(await request.json())
if (!parseResult.success) {
  // Handle validation errors
}
```

### Form Validation (Client-Side)

**Pattern from `app/enquiry/EnquiryForm.tsx`:**
```typescript
const validateStep1 = () => {
  const newErrors: Record<string, string> = {}
  if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
  if (!formData.email.trim()) newErrors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email'
  }
  return newErrors
}
```

### Error Boundary Pattern

**`app/error.tsx`:**
```typescript
'use client'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Ignore browser extension errors
    if (error.message?.includes('postMessage') ||
        error.message?.includes('content_script')) {
      console.warn('Browser extension error ignored:', error.message)
      return
    }
    // Log other errors
    console.error(error)
  }, [error])

  return null
}
```

## Mocking Patterns

**No mocking libraries configured.** If testing were implemented:

**What to Mock (based on dependencies):**
- `@upstash/redis` - Redis client for rate limiting
- `@upstash/ratelimit` - Rate limiter
- `nodemailer` - Email sending (in API routes)

**Example of potential mocking approach (not implemented):**
```typescript
// lib/rate-limit.ts test would mock Redis
jest.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: jest.fn()
  }
}))

// api/enquiry/route.ts test would mock nodemailer
jest.mock('nodemailer', () => ({
  default: {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test' })
    })
  }
}))
```

## Test File Organization

**Current State:** No test files exist in project

**Recommended Locations (if tests were added):**
```
wag/
├── app/
│   ├── api/
│   │   ├── enquiry/
│   │   │   └── route.test.ts      # API route tests
│   │   └── newsletter/
│   │       └── route.test.ts
│   ├── components/
│   │   ├── Navbar.test.tsx
│   │   └── enquiry/
│   │       └── EnquiryForm.test.tsx
│   └── ...
├── lib/
│   └── rate-limit.test.ts          # Utility tests
└── ...
```

## Coverage

**Current Coverage:** None enforced

**Build Process (`npm run build`):**
- Runs `next build` which includes TypeScript type checking
- Does NOT generate coverage reports

## Test Types Not Used

**Unit Tests:** Not present
- No Jest or Vitest configured
- No test files with `.test.ts` or `.spec.ts`

**Integration Tests:** Not present
- API routes tested manually only

**E2E Tests:** Not present
- Playwright installed but no test files
- No `tests/` or `e2e/` directories

## Dependencies That Need Testing Consideration

If tests were to be added:

**Rate Limiting (`lib/rate-limit.ts`):**
- `isRedisConfigured` flag detection
- `checkRateLimit()` with Redis
- `checkRateLimit()` with memory fallback
- Concurrent request handling

**API Routes:**
- CORS header validation
- Rate limit enforcement
- Zod schema validation (valid/invalid inputs)
- Email sending success/failure
- Error recovery

**Components:**
- Form validation UX
- Mobile menu state
- Scroll-based styling changes

## Recommended Testing Setup

If implementing tests, use:
```bash
# Install Vitest (lighter weight for Next.js)
npm install -D vitest @vitest/coverage-v8

# Add to package.json scripts
"test": "vitest",
"test:coverage": "vitest --coverage"
```

**Config file (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx}'],
    globals: true,
  },
})
```

---

*Testing analysis: 2026-03-20*
