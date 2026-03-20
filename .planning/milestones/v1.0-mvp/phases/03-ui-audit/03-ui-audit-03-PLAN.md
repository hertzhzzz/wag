---
phase: 03-ui-audit
plan: 03
type: execute
wave: 3
depends_on: ["03-ui-audit-02"]
files_modified: []
autonomous: true
requirements: ["FORM-01", "FORM-02", "FORM-03"]
user_setup: []
must_haves:
  truths:
    - "Enquiry form inputs are usable on mobile without keyboard covering them (FORM-01)"
    - "Form labels remain visible when input is focused on mobile (FORM-02)"
    - "Submit button is always accessible on mobile without scrolling (FORM-03)"
  artifacts:
    - path: "frontend/app/enquiry/components/KeyboardAwareInput.tsx"
      provides: "Input component with scrollIntoView on focus"
    - path: "frontend/app/enquiry/page.tsx"
      provides: "Enquiry form with keyboard avoidance"
  key_links:
    - from: "KeyboardAwareInput.tsx"
      to: "Visual Viewport API"
      via: "useEffect event listener"
      pattern: "window.visualViewport.*addEventListener"
    - from: "enquiry/page.tsx"
      to: "KeyboardAwareInput"
      via: "import and use in JSX"
      pattern: "import.*KeyboardAwareInput"
---

<objective>
Fix enquiry form mobile keyboard issues

Purpose: Implement keyboard avoidance for FORM-01, label visibility for FORM-02, and sticky submit button for FORM-03. Uses Visual Viewport API for keyboard detection and scrollIntoView for input visibility.

Output: Enquiry form fully functional on mobile without keyboard issues
</objective>

<context>
@/Users/mark/Projects/wag/.planning/phases/03-ui-audit/03-ui-audit-02-SUMMARY.md
@/Users/mark/Projects/wag/.planning/phases/03-ui-audit/03-RESEARCH.md
@/Users/mark/Projects/wag/.planning/phases/03-ui-audit/03-UI-SPEC.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create KeyboardAwareInput component</name>
  <files>frontend/app/enquiry/components/KeyboardAwareInput.tsx</files>
  <read_first>frontend/app/enquiry/page.tsx</read_first>
  <action>
Create KeyboardAwareInput component with keyboard avoidance:

```typescript
'use client'
import { useEffect, useRef } from 'react'

interface KeyboardAwareInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
}

export function KeyboardAwareInput({
  label,
  required = false,
  id,
  ...props
}: KeyboardAwareInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleFocus = () => {
      const viewport = window.visualViewport
      if (!viewport) return

      // Only adjust on mobile (when viewport is significantly smaller)
      if (viewport.height < window.innerHeight * 0.85) {
        setTimeout(() => {
          inputRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }, 100)
      }
    }

    const input = inputRef.current
    input?.addEventListener('focus', handleFocus)
    return () => input?.removeEventListener('focus', handleFocus)
  }, [])

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
      >
        {label} {required && <span className="text-[#F59E0B]">*</span>}
      </label>
      <input
        ref={inputRef}
        id={id}
        className="w-full py-3 px-4 border border-gray-200 rounded text-[0.9375rem] text-[#0F2D5E] outline-none focus:border-[#0F2D5E]"
        {...props}
      />
    </div>
  )
}
```
  </action>
  <verify>
    <automated>ls -la frontend/app/enquiry/components/KeyboardAwareInput.tsx</automated>
  </verify>
  <done>KeyboardAwareInput component created with scroll behavior</done>
  <acceptance_criteria>
- [ ] File exists: frontend/app/enquiry/components/KeyboardAwareInput.tsx
- [ ] Contains: 'scrollIntoView' with block: 'center'
- [ ] Contains: 'window.visualViewport' check
- [ ] Exports: KeyboardAwareInput component
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 2: Create KeyboardAwareTextarea component</name>
  <files>frontend/app/enquiry/components/KeyboardAwareTextarea.tsx</files>
  <read_first>frontend/app/enquiry/page.tsx</read_first>
  <action>
Create KeyboardAwareTextarea for message textarea with keyboard avoidance:

```typescript
'use client'
import { useEffect, useRef } from 'react'

interface KeyboardAwareTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
}

export function KeyboardAwareTextarea({
  label,
  required = false,
  id,
  ...props
}: KeyboardAwareTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleFocus = () => {
      const viewport = window.visualViewport
      if (!viewport) return

      if (viewport.height < window.innerHeight * 0.85) {
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }, 100)
      }
    }

    const textarea = textareaRef.current
    textarea?.addEventListener('focus', handleFocus)
    return () => textarea?.removeEventListener('focus', handleFocus)
  }, [])

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
      >
        {label} {required && <span className="text-[#F59E0B]">*</span>}
      </label>
      <textarea
        ref={textareaRef}
        id={id}
        className="w-full py-3 px-4 border border-gray-200 rounded text-[0.9375rem] text-[#0F2D5E] outline-none focus:border-[#0F2D5E] min-h-[120px] resize-y"
        {...props}
      />
    </div>
  )
}
```
  </action>
  <verify>
    <automated>ls -la frontend/app/enquiry/components/KeyboardAwareTextarea.tsx</automated>
  </verify>
  <done>KeyboardAwareTextarea component created with scroll behavior</done>
  <acceptance_criteria>
- [ ] File exists: frontend/app/enquiry/components/KeyboardAwareTextarea.tsx
- [ ] Contains: 'scrollIntoView' with block: 'center'
- [ ] Exports: KeyboardAwareTextarea component
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 3: Update enquiry page to use keyboard-aware components</name>
  <files>frontend/app/enquiry/page.tsx</files>
  <read_first>frontend/app/enquiry/page.tsx</read_first>
  <action>
Update enquiry/page.tsx:
1. Import KeyboardAwareInput and KeyboardAwareTextarea
2. Replace all `<input>` elements with KeyboardAwareInput
3. Replace `<textarea>` with KeyboardAwareTextarea
4. Add sticky submit button for mobile: `fixed bottom-0 left-0 right-0 py-4 md:relative md:bottom-auto md:left-auto md:right-auto md:py-3.5`
5. Add pb-20 to form container for extra padding on mobile

Preserve existing:
- Form validation logic
- Error handling
- Multi-step form state
- Success state
  </action>
  <verify>
    <automated>grep -n "KeyboardAwareInput\|KeyboardAwareTextarea" frontend/app/enquiry/page.tsx</automated>
  </verify>
  <done>Enquiry form uses keyboard-aware components</done>
  <acceptance_criteria>
- [ ] Imports KeyboardAwareInput from ./components/KeyboardAwareInput
- [ ] Imports KeyboardAwareTextarea from ./components/KeyboardAwareTextarea
- [ ] Uses KeyboardAwareInput for all text inputs (fullName, companyName, email, phone)
- [ ] Uses KeyboardAwareTextarea for message textarea
- [ ] Submit button has: `fixed bottom-0 left-0 right-0 py-4 md:relative md:bottom-auto md:py-3.5`
- [ ] Form container has: `pb-20` for extra bottom padding
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 4: Run tests to verify fixes work</name>
  <files>frontend/tests/mobile/*.spec.ts</files>
  <action>
Run the mobile form tests to verify the fixes pass:
- Ensure dev server is running: cd frontend && npm run dev
- Run tests: cd frontend && npx playwright test tests/mobile/ --project=mobile
  </action>
  <verify>
    <automated>cd frontend && npx playwright test tests/mobile/ --project=mobile</automated>
  </verify>
  <done>All form mobile tests pass</done>
  <acceptance_criteria>
- [ ] FORM-01 test passes (inputs usable on mobile)
- [ ] FORM-02 test passes (labels visible on focus)
- [ ] FORM-03 test passes (submit button accessible)
  </acceptance_criteria>
</task>

</tasks>

<verification>
Build verification:
- Run: cd frontend && npm run build
Expected: Build completes without errors
</verification>

<success_criteria>
- [ ] KeyboardAwareInput component created
- [ ] KeyboardAwareTextarea component created
- [ ] Enquiry page uses keyboard-aware components
- [ ] Submit button is sticky on mobile (fixed bottom-0)
- [ ] All form mobile tests pass
- [ ] Build passes without errors
</success_criteria>

<output>
After completion, create `.planning/phases/03-ui-audit/03-ui-audit-03-SUMMARY.md`
</output>
