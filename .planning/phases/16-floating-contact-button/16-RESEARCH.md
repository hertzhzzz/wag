# Phase 16: Floating Contact Button - Research

**Researched:** 2026-03-20
**Domain:** UI Component (Floating Button + Modal Contact Form)
**Confidence:** HIGH

## Summary

Phase 16 implements a persistent floating contact button in the bottom-right corner that opens a contact form modal. The implementation leverages existing codebase patterns from `DirectoryAccessModal.tsx` for the modal structure, and uses Tailwind CSS for animations. The primary challenge is reconciling the simplified form fields (Email + Message only) with the existing `/api/enquiry` endpoint which requires fullName, companyName, industry, and lookingFor as required fields.

**Primary recommendation:** Create a new API endpoint `/api/contact` (or use hidden fields with defaults) to handle the floating button's simplified form submission.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Navy (#0F2D5E) button color (brand differentiation from competitor blue #1d4ed8)
- Pulse ring animation: opacity 0.5-1.0, 2s cycle
- Email + Message fields only (no Name field to reduce friction)
- "Send Message" button text
- Fixed position: bottom-right, 20px from edges
- Mobile: smaller size, same position
- Modal animation: 200ms fade-in + zoom-in-95
- Close: ESC key + overlay click
- Overlay: Navy/60 backdrop with backdrop-blur
- POST to `/api/enquiry`
- z-index: 9999 (below Navbar z-100)
- Integration in layout.tsx (not over-encapsulated)

### Claude's Discretion
- How to handle API field mismatch (see Open Questions)

### Deferred Ideas (OUT OF SCOPE)
- Scroll hide functionality (hide on scroll down, show on scroll up)
- GA event tracking for button clicks
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEO-02 | Floating contact button (bottom-right) | This research covers implementation patterns, API integration, and animation specs |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (Next.js) | Next.js 16 | Component framework | Project default |
| Tailwind CSS | 3.4 | Styling + animations | Project default |
| lucide-react | latest | Icons (Mail) | Project default |

### Animation Patterns
| Pattern | Implementation | Source |
|---------|----------------|--------|
| Pulse ring | CSS keyframes with opacity animation | Tailwind animate utilities + custom keyframes |
| Modal animation | `animate-in fade-in zoom-in-95 duration-200` | DirectoryAccessModal.tsx pattern |

---

## Architecture Patterns

### Recommended Project Structure
```
app/
├── components/
│   └── FloatingContactButton.tsx   # New: Floating button + modal
├── layout.tsx                       # Integration point
└── api/
    └── contact/
        └── route.ts                # New: Simplified contact API (or reuse with defaults)
```

### Pattern 1: Pulse Ring Animation

**What:** Continuous circular pulse effect around the floating button
**When to use:** Attention-grabbing CTA that pulses to draw user eye
**Implementation:**
```css
/* Pulse ring keyframe - opacity 0.5 to 1.0, 2s cycle */
@keyframes pulse-ring {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.animate-pulse-ring {
  animation: pulse-ring 2s ease-in-out infinite;
}
```

**Tailwind integration:** Add to `tailwind.config.ts` or use inline styles

### Pattern 2: Modal Overlay (from DirectoryAccessModal.tsx)

**What:** Centered modal with backdrop blur
**Source:** `app/components/DirectoryAccessModal.tsx` lines 60-68
**Key classes:**
- Overlay: `fixed inset-0 bg-navy/60 backdrop-blur-sm`
- Modal: `relative bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200`

### Pattern 3: ESC Key Handler

**What:** Close modal on Escape key press
**Source:** `app/components/DirectoryAccessModal.tsx` lines 18-30
```typescript
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }
  if (isOpen) {
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
  }
  return () => {
    document.removeEventListener('keydown', handleEsc)
    document.body.style.overflow = ''
  }
}, [isOpen, onClose])
```

### Pattern 4: Form Submission with Loading State

**What:** Async form handling with loading/success/error states
**Source:** `app/components/DirectoryAccessModal.tsx` lines 34-57
```typescript
const [loading, setLoading] = useState(false)
const [submitted, setSubmitted] = useState(false)
const [error, setError] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    const res = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message }),
    })
    if (res.ok) setSubmitted(true)
    else {
      const data = await res.json()
      setError(data.error || 'Something went wrong.')
    }
  } catch {
    setError('Failed to submit. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

### Anti-Patterns to Avoid
- **z-index conflicts:** Do not use z-[200] (DirectoryAccessModal uses this) - use z-[9999] for floating button per spec
- **Full form fields:** User explicitly wants Email + Message only, not the full enquiry form
- **Scroll hide (out of scope):** Deferred for future optimization

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal structure | Custom overlay + modal | Reference DirectoryAccessModal.tsx | Already has correct patterns (backdrop-blur, rounded corners, shadow) |
| ESC key handling | Custom keydown listener | Reference DirectoryAccessModal.tsx | Correct cleanup and body overflow handling |
| Loading states | ad-hoc loading | Reference DirectoryAccessModal.tsx pattern | Consistent UX with existing modals |
| Animation | Complex JS animations | Tailwind `animate-in` utilities | Built into project, works with existing setup |

---

## Common Pitfalls

### Pitfall 1: z-index Conflict with Navbar
**What goes wrong:** Floating button appears above Navbar, breaking navigation
**Why it happens:** Navbar uses z-100, floating button spec says z-9999 but modal overlay may need higher
**How to avoid:** Use z-[9999] for button, ensure modal structure doesn't conflict with existing z-[200] modals
**Warning signs:** Nav links unclickable, dropdowns hidden behind button

### Pitfall 2: API Field Mismatch
**What goes wrong:** Form submission fails because /api/enquiry requires fields not in simplified form
**Why it happens:** /api/enquiry requires: fullName, companyName, email, industry, lookingFor (all required except phone)
**How to avoid:** Create new `/api/contact` endpoint or add hidden fields with sensible defaults
**Warning signs:** Console errors about validation failures on submit

### Pitfall 3: Mobile Touch Issues
**What goes wrong:** Pulse animation causes jank on mobile, or button too large on small screens
**Why it happens:** CSS animations can be GPU-intensive on mobile; button sizing not responsive
**How to avoid:** Use `transform` and `opacity` for animation (GPU accelerated), test on mobile sizes
**Warning signs:** Slow animation, layout shifts on mobile

### Pitfall 4: Body Scroll Lock Not Released
**What goes wrong:** Page stuck with overflow hidden after modal closes
**Why it happens:** useEffect cleanup not properly removing overflow style
**How to avoid:** Follow exact pattern from DirectoryAccessModal.tsx (return cleanup function)
**Warning signs:** Page doesn't scroll after closing modal

---

## Code Examples

### Floating Button Component Structure
```typescript
// app/components/FloatingContactButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { Mail, X } from 'lucide-react'

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ESC key closes modal (reference DirectoryAccessModal pattern)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {  // or /api/enquiry with hidden fields
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      })
      if (res.ok) setSubmitted(true)
      else {
        const data = await res.json()
        setError(data.error || 'Something went wrong.')
      }
    } catch {
      setError('Failed to submit.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-transform"
        aria-label="Open contact form"
      >
        {/* Pulse Ring */}
        <span className="absolute inset-0 rounded-full border-2 border-navy/50 animate-pulse-ring" />
        <Mail size={18} />
        <span className="text-sm font-medium hidden sm:inline">Contact Us</span>
      </button>

      {/* Modal (only render when open) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-navy/5"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            {/* Form or Success state */}
            ...
          </div>
        </div>
      )}
    </>
  )
}
```

### Tailwind Pulse Ring Animation
```css
/* Add to globals.css or inline */
@keyframes pulse-ring {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}
.animate-pulse-ring {
  animation: pulse-ring 2s ease-in-out infinite;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Complex multi-field enquiry form | Simplified Email + Message | Phase 16 decision | Lower friction, higher conversion potential |
| Fixed contact button without animation | Pulse ring animation | Phase 16 decision | Better visibility, brand differentiation |
| No floating CTA | Persistent floating button | Phase 16 | Always-visible contact入口 |

**Deprecated/outdated:**
- Competitor's blue (#1d4ed8) floating button - WAG uses Navy (#0F2D5E) for brand differentiation
- Full enquiry form fields - simplified to Email + Message only

---

## Open Questions

### 1. API Endpoint for Simplified Form
**What we know:** `/api/enquiry` requires fullName, companyName, email, industry, lookingFor (all required except phone). The floating button form only has Email + Message.

**What's unclear:** How to handle the field mismatch - create new endpoint, use hidden fields with defaults, or modify existing API?

**Recommendation:** Create new `/api/contact` endpoint with simplified schema:
```typescript
const contactSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1).max(5000),
})
```
This keeps concerns separated and doesn't break existing enquiry flow.

---

### 2. Button Size on Mobile
**What we know:** User wants smaller on mobile but same position (bottom-right, 20px from edges)

**What's unclear:** Exact breakpoint and size - sm? md?

**Recommendation:** Use `bottom-5 right-5` (20px equivalent) and `px-3 py-2` on mobile, `px-4 py-2` on larger screens. Hide "Contact Us" text on mobile (< sm:).

---

## Validation Architecture

> Skip this section entirely if workflow.nyquist_validation is explicitly set to false in .planning/config.json.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected |
| Config file | N/A |
| Quick run command | N/A - component testing only |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements Test Map
| Req ID | Behavior | Test Type | Verification |
|--------|----------|-----------|--------------|
| SEO-02 | Floating button visible on all pages | Manual | Load each page, verify button appears |
| SEO-02 | Click opens modal | Manual | Click button, verify modal opens |
| SEO-02 | ESC closes modal | Manual | Open modal, press ESC |
| SEO-02 | Overlay click closes modal | Manual | Open modal, click overlay |
| SEO-02 | Form submission works | Manual | Submit form, verify success state |
| SEO-02 | Mobile responsive | Manual | Test at 320px width |

### Wave 0 Gaps
None - this is a pure UI component that doesn't require new test infrastructure.

---

## Sources

### Primary (HIGH confidence)
- `app/components/DirectoryAccessModal.tsx` - Modal patterns, ESC handling, form submission
- `app/layout.tsx` - Integration point
- `tailwind.config.ts` - Design tokens (navy, amber)
- `/api/enquiry/route.ts` - Existing API schema

### Secondary (MEDIUM confidence)
- Competitor analysis (AGENT4-FLOATING-BUTTON.md) - Positioning and z-index reference
- CSS animation best practices - Pulse ring implementation

### Tertiary (LOW confidence)
- Web search results for CSS animations - Generic patterns, not Next.js specific

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH - Using project defaults
- Architecture: HIGH - Existing patterns from DirectoryAccessModal
- Pitfalls: MEDIUM - API mismatch identified, solution recommended

**Research date:** 2026-03-20
**Valid until:** 90 days (UI component patterns stable)
