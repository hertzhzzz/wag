# Enquiry Form Optimisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce enquiry form to 3 fields, single-column layout, fix all bugs, improve completion rate.

**Architecture:** Single-page form (no multi-step), centred single-column layout, 3 required fields, Calendly demoted to text link below form, inline validation on blur.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, Zod validation, Nodemailer

---

## File Map

| File | Responsibility |
|------|---------------|
| `app/enquiry/EnquiryForm.tsx` | Main form UI, validation, layout — all changes here |
| `app/enquiry/metadata.ts` | Fix wrong metadata |
| `app/enquiry/layout.tsx` | Remove duplicate metadata export |
| `app/api/enquiry/route.ts` | Update Zod schema + email HTML template |

---

## Task 1: Update API Schema and Email Template

**Files:**
- Modify: `app/api/enquiry/route.ts`

- [ ] **Step 1: Update Zod schema — remove companyName, industry, customIndustry**

Locate `enquirySchema` (around line 27) and update it:

```typescript
// Before:
const enquirySchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  industry: z.string().min(1, 'Industry is required').max(100),
  customIndustry: z.string().optional(),
  lookingFor: z.string().min(1, 'Please describe what you need').max(5000),
})

// After:
const enquirySchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  lookingFor: z.string().min(1, 'Please describe what you need').max(5000),
})
```

- [ ] **Step 2: Update destructuring — remove companyName, industry, customIndustry**

Locate line 103:
```typescript
// Before:
const { fullName, companyName, email, phone, industry, customIndustry, lookingFor } = parseResult.data

// After:
const { fullName, email, phone, lookingFor } = parseResult.data
```

- [ ] **Step 3: Update displayIndustry logic — remove**

Locate lines 105-106 (displayIndustry logic) and remove it:
```typescript
// Remove these two lines:
// const displayIndustry = industry === 'other' && customIndustry ? customIndustry : industry
```

- [ ] **Step 4: Update XSS escape — remove companyName, industry, customIndustry, displayIndustry**

Locate lines 108-114. Update to:
```typescript
const safeFullName = escapeHtml(fullName)
const safeEmail = escapeHtml(email)
const safePhone = escapeHtml(phone || '')
const safeLookingFor = escapeHtml(lookingFor)
```

- [ ] **Step 5: Update email HTML template — remove company/industry rows, keep only name/email/phone/whatTheyNeed**

Locate the HTML email template in `sendMail` (around lines 123-162). Replace the `<table>` section with:

```html
<table style="width:100%;border-collapse:collapse;">
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;width:140px;">Full Name</td>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:600;">${safeFullName}</td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Email</td>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#0F2D5E;">${safeEmail}</a></td>
  </tr>
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Phone</td>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${safePhone || '—'}</td>
  </tr>
</table>
```

- [ ] **Step 6: Commit**

```bash
git add app/api/enquiry/route.ts
git commit -m "fix(enquiry-api): remove companyName/industry from schema and email template"
```

---

## Task 2: Fix metadata.ts

**Files:**
- Modify: `app/enquiry/metadata.ts`

- [ ] **Step 1: Overwrite with correct metadata**

Read the file, then overwrite with:

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact WAG | Request a Free Discovery Call',
  description: 'Get in touch for China sourcing consultation. Factory tours, supplier verification, and bulk procurement support for Australian businesses. Book your free discovery call today.',
  keywords: ['china sourcing consultation', 'factory tour enquiry', 'australian business china', 'contact wag', 'supplier verification quote', 'china procurement help'],
  openGraph: {
    title: 'Contact Winning Adventure Global',
    description: 'Get expert China sourcing help. Book your free discovery call.',
    url: 'https://www.winningadventure.com.au/enquiry',
    siteName: 'Winning Adventure Global',
    images: [
      {
        url: 'https://www.winningadventure.com.au/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Winning Adventure Global - China Sourcing Experts',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Winning Adventure Global',
    description: 'Get expert China sourcing help. Book your free discovery call.',
    images: ['https://www.winningadventure.com.au/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/enquiry',
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add app/enquiry/metadata.ts
git commit -m "fix(enquiry): correct metadata title and description"
```

---

## Task 3: Fix layout.tsx — Remove Duplicate Metadata

**Files:**
- Modify: `app/enquiry/layout.tsx`

- [ ] **Step 1: Read current layout.tsx and remove metadata export**

Current content:
```typescript
import { Metadata } from 'next'

export const metadata: Metadata = { ... }  // REMOVE THIS

export default function EnquiryLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

Replace the entire file with:
```typescript
export default function EnquiryLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

- [ ] **Step 2: Commit**

```bash
git add app/enquiry/layout.tsx
git commit -m "fix(enquiry): remove duplicate metadata from layout, keep only page-level metadata"
```

---

## Task 4: Refactor EnquiryForm.tsx — Single-Column, 3 Fields, Inline Validation

**Files:**
- Modify: `app/enquiry/EnquiryForm.tsx`

- [ ] **Step 1: Read current file completely**

- [ ] **Step 2: Remove CalendlyWidget component and selectedContact state**

Remove the entire `CalendlyWidget` function (lines 11-38).
Remove `selectedContact` from `useState` (line 52).
Remove `import { Lock, MapPin, Mail, CheckCircle, DollarSign, Building2 }` — keep only what's needed: `CheckCircle` stays (used in success state and trust section), add `MapPin`, `Mail`, `DollarSign`, `Building2` if removed but still used elsewhere — check after rewrite.

- [ ] **Step 3: Rewrite form state and validate function**

```typescript
const [formData, setFormData] = useState({
  fullName: '', email: '', lookingFor: '',
})
const [errors, setErrors] = useState<Record<string, string>>({})
const [touched, setTouched] = useState<Record<string, boolean>>({})

// Inline validation on blur
const handleBlur = (field: string) => {
  setTouched({ ...touched, [field]: true })
  const newErrors: Record<string, string> = {}
  if (field === 'fullName' && !formData.fullName.trim()) {
    newErrors.fullName = 'Full name is required'
  }
  if (field === 'email') {
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
  }
  if (field === 'lookingFor' && !formData.lookingFor.trim()) {
    newErrors.lookingFor = 'Please describe what you need'
  }
  setErrors((prev) => ({ ...prev, ...newErrors }))
}

// Clear error as user types
const handleChange = (field: string, value: string) => {
  setFormData({ ...formData, [field]: value })
  if (errors[field]) {
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next })
  }
}
```

- [ ] **Step 4: Update handleSubmit to validate all 3 fields on submit attempt**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const submitErrors: Record<string, string> = {}
  if (!formData.fullName.trim()) submitErrors.fullName = 'Full name is required'
  if (!formData.email.trim()) submitErrors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) submitErrors.email = 'Please enter a valid email'
  if (!formData.lookingFor.trim()) submitErrors.lookingFor = 'Please describe what you need'
  if (Object.keys(submitErrors).length > 0) {
    setErrors(submitErrors)
    setTouched({ fullName: true, email: true, lookingFor: true })
    return
  }
  setSubmitting(true)
  setErrors({})
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
      setErrors({ submit: errorMsg || 'Submission failed. Please try again.' })
    }
  } catch {
    setErrors({ submit: 'Network error. Please try again.' })
  } finally {
    setSubmitting(false)
  }
}
```

- [ ] **Step 5: Rewrite JSX — remove two-column layout, remove tab selector, single-column centred form**

**Remove:**
- Mobile tab selector (lines 197-215)
- Two-column grid wrapper (lines 218-411) — replace with single-column
- Left column (Calendly widget)
- All `KeyboardAwareInput` except fullName, email
- Industry select dropdown
- sourcingType radio group
- All traces of `selectedContact`

**Keep:**
- Hero section
- "What happens next" (two path cards) — move above form in DOM order
- Trust stats bar — move above form
- Contact info section
- FAQ accordion

**Add:**
- Single-column wrapper: `<div className="max-w-[600px] mx-auto">`
- "What happens next" and trust bar sections reordered above form
- "Prefer to talk?" link below submit button: `<a href="https://calendly.com/mark-winningadventure/" target="_blank" rel="noopener noreferrer" className="block text-center text-sm text-[#0F2D5E] hover:text-[#F59E0B] mt-3">Prefer to talk? Book a call →</a>`

**Form JSX structure:**
```tsx
<div className="max-w-[600px] mx-auto">
  {/* Hero */}
  <section>...</section>

  {/* What happens next */}
  <div>...</div>

  {/* Trust stats */}
  <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-100">
    <div className="text-center">
      <p className="text-lg font-bold text-[#0F2D5E]">Verified</p>
      <p className="text-[0.6rem] text-gray-400 uppercase tracking-wider">Listed Partner</p>
    </div>
    <div className="text-center border-x border-gray-100">
      <p className="text-lg font-bold text-[#0F2D5E]">4hrs</p>
      <p className="text-[0.6rem] text-gray-400 uppercase tracking-wider">Response</p>
    </div>
    <div className="text-center">
      <p className="text-lg font-bold text-[#0F2D5E]">$0</p>
      <p className="text-[0.6rem] text-gray-400 uppercase tracking-wider">Upfront</p>
    </div>
  </div>

  {/* Form card */}
  <div className="bg-white border border-gray-200 rounded-lg p-8 mt-8">
    <form onSubmit={handleSubmit} noValidate>
      {/* fullName */}
      <KeyboardAwareInput
        id="fullName"
        label="Full Name"
        required
        value={formData.fullName}
        onChange={(e) => handleChange('fullName', e.target.value)}
        onBlur={() => handleBlur('fullName')}
        placeholder="Jane Smith"
        autoComplete="name"
        error={touched.fullName ? errors.fullName : undefined}
      />
      {/* email */}
      <KeyboardAwareInput
        id="email"
        type="email"
        label="Email Address"
        required
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
        placeholder="jane@company.com.au"
        autoComplete="email"
        error={touched.email ? errors.email : undefined}
      />
      {/* lookingFor */}
      <KeyboardAwareTextarea
        id="lookingFor"
        label="What do you need?"
        required
        value={formData.lookingFor}
        onChange={(e) => handleChange('lookingFor', e.target.value)}
        onBlur={() => handleBlur('lookingFor')}
        placeholder="Describe your product, quantity, quality requirements..."
        rows={4}
        error={touched.lookingFor ? errors.lookingFor : undefined}
      />

      {/* Submit error */}
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm mb-4">
          {errors.submit}
        </div>
      )}

      {/* Submit button */}
      <button type="submit" disabled={submitting} ...>
        {submitting ? 'Sending…' : 'Submit Enquiry →'}
      </button>

      {/* Calendly link */}
      <a href="https://calendly.com/mark-winningadventure/" target="_blank" rel="noopener noreferrer" className="block text-center text-sm text-[#0F2D5E] hover:text-[#F59E0B] mt-3">
        Prefer to talk? Book a call →
      </a>
    </form>
  </div>

  {/* FAQ */}
  <div>...</div>

  {/* Contact */}
  <div>...</div>
</div>
```

- [ ] **Step 6: Update KeyboardAwareInput to support onBlur prop**

Check `app/enquiry/components/KeyboardAwareInput.tsx` — it currently only accepts `onChange`. Need to add `onBlur` prop:

```typescript
// Read the file first
// In the input element, add onBlur={onBlur} before the self-closing />
// Add onBlur?: () => void to the interface
```

Same for `KeyboardAwareTextarea.tsx` — add `onBlur` prop.

- [ ] **Step 7: Commit**

```bash
git add app/enquiry/EnquiryForm.tsx app/enquiry/components/KeyboardAwareInput.tsx app/enquiry/components/KeyboardAwareTextarea.tsx
git commit -m "feat(enquiry): single-column 3-field form, inline validation, Calendly demoted to link"
```

---

## Task 5: Final Verification

- [ ] **Step 1: Run build**

```bash
npm run build 2>&1 | tail -30
```
Expected: no TypeScript errors, no build errors

- [ ] **Step 2: Run lint**

```bash
npm run lint 2>&1
```
Expected: no errors

- [ ] **Step 3: Verify page renders correctly**

Open `app/enquiry/page.tsx` in browser (dev server) and check:
- Form has only 3 fields (name, email, textarea)
- No tab selector at top
- No Calendly widget
- "Prefer to talk?" link visible below submit
- Form is centred, max-width 600px
- Trust stats visible above form
- "What happens next" cards visible above form

- [ ] **Step 4: Test inline validation**

Fill nothing, click submit → all 3 errors should appear
Fill name + email, leave textarea empty, click submit → textarea error should appear
Fill valid data, submit → should succeed or show API error inline

- [ ] **Step 5: Verify no console errors on page load**

```bash
# Check browser console via Playwright MCP
```
Expected: no errors

---

## Task 6: Final Commit (if all tasks passed)

```bash
git push origin master
```

Monitor Vercel deployment. After deploy, verify with:
```bash
curl -sI https://www.winningadventure.com.au/enquiry | grep HTTP
```
