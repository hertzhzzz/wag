---
status: resolved
trigger: "Enquiry form submission returns 500 Internal Server Error"
created: 2026-03-17T12:00:00Z
updated: 2026-03-17T12:00:00Z
---

## Current Focus
- hypothesis: Missing environment variables for email service
- test: Read .env.local to check for GMAIL credentials
- expecting: If GMAIL_USER and GMAIL_APP_PASSWORD are missing, this confirms the hypothesis
- next_action: Write diagnosis

## Symptoms
- expected: Form submission should send email and return success
- actual: POST /api/enquiry returns 500 Internal Server Error
- errors: "page.tsx:107 POST http://localhost:3002/api/enquiry 500 (Internal Server Error)"
- reproduction: Fill out enquiry form and submit
- started: Unknown - likely since form was first deployed

## Eliminated
- hypothesis: API route validation error
  evidence: The API returns 500 (server error), not 400 (validation error)
- hypothesis: Network issue
  evidence: Error is server-side (500), not client-side fetch failure

## Evidence
- timestamp: 2026-03-17T12:00:00Z
  checked: frontend/app/api/enquiry/route.ts
  found: API uses nodemailer with process.env.GMAIL_USER and process.env.GMAIL_APP_PASSWORD
  implication: Missing env vars will cause transporter creation to fail

- timestamp: 2026-03-17T12:00:00Z
  checked: frontend/.env.local
  found: File exists but only contains VERCEL_OIDC_TOKEN. Missing GMAIL_USER and GMAIL_APP_PASSWORD
  implication: Root cause confirmed

- timestamp: 2026-03-17T12:00:00Z
  checked: .planning/codebase/INTEGRATIONS.md
  found: Documents required env vars: GMAIL_USER, GMAIL_APP_PASSWORD
  implication: Configuration requirement was documented but not set up

## Resolution
- root_cause: The enquiry form API route requires GMAIL_USER and GMAIL_APP_PASSWORD environment variables to send emails via nodemailer. These variables are not set in the frontend/.env.local file, causing the email transporter creation to fail and return a 500 error.
- fix: Add GMAIL_USER and GMAIL_APP_PASSWORD to frontend/.env.local
- verification: Tested by reading the API code and environment configuration
- files_changed: []
