---
phase: 03-ui-audit
plan: 05
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/.env.local
autonomous: false
gap_closure: true
requirements: []
user_setup:
  - service: gmail
    why: "Sending enquiry form emails"
    env_vars:
      - name: GMAIL_USER
        source: "Your Gmail address (e.g., yourname@gmail.com)"
      - name: GMAIL_APP_PASSWORD
        source: "Google Account -> Security -> 2-Step Verification -> App Passwords"
    setup_steps:
      - "1. Go to https://myaccount.google.com/security"
      - "2. Enable 2-Step Verification if not already enabled"
      - "3. Search for 'App Passwords' or go to Security -> App Passwords"
      - "4. Create a new app password for 'Mail'"
      - "5. Copy the 16-character password"

must_haves:
  truths:
    - "Form submission works without server errors"
  artifacts:
    - path: "frontend/.env.local"
      contains: "GMAIL_USER"
    - path: "frontend/.env.local"
      contains: "GMAIL_APP_PASSWORD"
  key_links:
    - from: "frontend/app/api/enquiry/route.ts"
      to: "GMAIL_USER"
      via: "process.env.GMAIL_USER"
    - from: "frontend/app/api/enquiry/route.ts"
      to: "GMAIL_APP_PASSWORD"
      via: "process.env.GMAIL_APP_PASSWORD"
---

<objective>
Fix the enquiry form 500 error by adding required Gmail credentials to environment configuration.

Purpose: The nodemailer transporter fails without credentials, causing form submissions to return 500 errors.

Output: Working enquiry form that sends emails successfully.
</objective>

<context>
@frontend/app/api/enquiry/route.ts - Uses GMAIL_USER and GMAIL_APP_PASSWORD for nodemailer
@frontend/.env.local - Current file only has VERCEL_OIDC_TOKEN
@.planning/phases/03-ui-audit/03-UAT.md - Gap diagnosis
</context>

<tasks>

<task type="checkpoint:human-action">
  <name>Task 1: Add Gmail credentials to environment</name>
  <files>frontend/.env.local</files>
  <action>
    The enquiry form API requires Gmail credentials to send emails. Add the following environment variables to frontend/.env.local:

    GMAIL_USER=your-email@gmail.com
    GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx

    Replace the values with your actual Gmail address and App Password.
  </action>
  <how-to-add>
    1. Open frontend/.env.local in your editor
    2. Add these two lines at the end:
       GMAIL_USER=your-email@gmail.com
       GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
    3. Replace with your actual Gmail credentials
  </how-to-add>
  <how-to-verify>
    1. Restart the dev server: cd frontend && npm run dev
    2. Go to http://localhost:3000/enquiry
    3. Fill out the form and submit
    4. Verify: Form submits successfully (no 500 error), email is sent
  </how-to-verify>
  <done>Form submission returns 200 OK and email is sent</done>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
After adding credentials and restarting dev server:
- POST /api/enquiry returns 200 OK
- No 500 error in browser console
- Email is received at the GMAIL_USER address
</verification>

<success_criteria>
Form submission works without server errors - the API successfully sends email via Gmail SMTP.
</success_criteria>

<output>
After completion, create `.planning/phases/03-ui-audit/03-ui-audit-05-SUMMARY.md`
</output>
