---
phase: 03-ui-audit
plan: 06
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/app/components/Navbar.tsx
autonomous: true
gap_closure: true
requirements: []
must_haves:
  truths:
    - "Mobile navbar stays fixed at top when scrolling on mobile devices"
    - "Form submission works without server errors (returns 200, not 500)"
  artifacts:
    - path: "frontend/app/components/Navbar.tsx"
      provides: "Fixed navbar positioning for mobile"
      contains: "fixed top-0"
  key_links:
    - from: "Navbar.tsx"
      to: "viewport"
      via: "fixed positioning"
      pattern: "fixed top-0 left-0 right-0"
---

<objective>
Fix remaining gaps from verification: mobile navbar sticky behavior and enquiry form submission.

Purpose: Close out the last remaining issues identified in VERIFICATION.md and UAT.md
Output: Fully functional mobile navbar and enquiry form
</objective>

<execution_context>
@/Users/mark/.claude/get-shit-done/workflows/execute-plan.md
@/Users/mark/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-ui-audit/03-VERIFICATION.md
@.planning/phases/03-ui-audit/03-UAT.md

From VERIFICATION.md:
- Gap: "Mobile navbar stays fixed at top when scrolling" - FAILED
- Root cause: sticky positioning not working on iOS Safari
- Fix: Change sticky to fixed

From UAT.md:
- Gap: "Form submission works without server errors" - issue
- Root cause: Missing GMAIL_USER and GMAIL_APP_PASSWORD (now added to .env.local)
- May need server restart
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix mobile navbar sticky positioning</name>
  <files>frontend/app/components/Navbar.tsx</files>
  <read_first>frontend/app/components/Navbar.tsx</read_first>
  <action>
Change the navbar from `sticky top-0` to `fixed top-0` for guaranteed mobile support.

In frontend/app/components/Navbar.tsx line 16:
- Change: `className="bg-white h-[72px] flex items-center px-4 md:px-10 border-b border-gray-200 sticky top-0 z-[100]"`
- To: `className="bg-white h-[72px] flex items-center px-4 md:px-10 border-b border-gray-200 fixed top-0 left-0 right-0 z-[100]"`

This ensures the navbar stays fixed at the top on all mobile devices including iOS Safari.
  </action>
  <verify>
    <automated>grep -n "fixed top-0" frontend/app/components/Navbar.tsx</automated>
  </verify>
  <acceptance_criteria>
- [ ] Navbar.tsx contains "fixed top-0" instead of "sticky top-0"
- [ ] Navbar has "left-0 right-0" to span full width when fixed
  </acceptance_criteria>
  <done>Mobile navbar stays fixed at top when scrolling on all devices</done>
</task>

<task type="auto">
  <name>Task 2: Verify enquiry form works</name>
  <files>frontend/app/api/enquiry/route.ts, frontend/.env.local</files>
  <read_first>frontend/.env.local</read_first>
  <action>
Verify that the enquiry form API has the required environment variables and works correctly.

1. Check that frontend/.env.local contains:
   - GMAIL_USER=mark@winningadventure.com.au
   - GMAIL_APP_PASSWORD= (a 16-character app password with spaces)

2. If the form still returns 500, check the API route handler for any other issues:
   - Verify nodemailer transporter creation handles missing env gracefully
   - Consider adding better error logging

3. Test the form submission to confirm it works without 500 error.
  </action>
  <verify>
    <automated>grep -E "^(GMAIL_USER|GMAIL_APP_PASSWORD)=" frontend/.env.local</automated>
  </verify>
  <acceptance_criteria>
- [ ] GMAIL_USER is set in .env.local
- [ ] GMAIL_APP_PASSWORD is set in .env.local
- [ ] Form submission returns 200 OK (not 500)
  </acceptance_criteria>
  <done>Enquiry form submission works without server errors</done>
</task>

</tasks>

<verification>
- Mobile navbar stays fixed at top when scrolling on mobile
- Enquiry form submits successfully without 500 error
</verification>

<success_criteria>
Both gaps from VERIFICATION.md and UAT.md are closed:
1. Mobile navbar stays fixed at top when scrolling
2. Form submission works without server errors
</success_criteria>

<output>
After completion, create `.planning/phases/03-ui-audit/03-ui-audit-06-SUMMARY.md`
</output>
