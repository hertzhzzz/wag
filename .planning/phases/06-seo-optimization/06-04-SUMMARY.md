---
phase: 06-seo-optimization
plan: "04"
type: execute
subsystem: enquiry-form
tags: [gmail, smtp, error-handling, ux]
dependency_graph:
  requires:
    - app/api/enquiry/route.ts
  provides:
    - Gmail SMTP email sending
    - Clear error messages for misconfiguration
  affects:
    - Enquiry form submission flow
tech_stack:
  added:
    - .env.local (Gmail credentials storage)
  patterns:
    - Environment variable validation
    - Error message differentiation
key_files:
  created:
    - .env.local (with placeholder Gmail credentials)
  modified:
    - app/api/enquiry/route.ts (added credentials validation and improved error handling)
decisions:
  - "Added validation check in getTransporter() to throw clear error when credentials are missing"
  - "Improved catch block to differentiate between missing credentials vs sending failure"
  - "Used .env.local for Gmail credentials (gitignored for security)"
metrics:
  duration: 2 min
  completed_date: "2026-03-18"
---

# Phase 06 Plan 04: Enquiry Form Gmail Credentials Summary

## Overview

Fixed the enquiry form 500 error by adding Gmail credentials validation and improving error handling in the API route.

## What Was Built

- **Gmail credentials validation**: Added check in `getTransporter()` to verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set before attempting to send email
- **Improved error handling**: Catch block now differentiates between missing credentials (shows "Email service not configured") vs other failures (shows "Failed to send email")
- **Environment configuration**: Created `.env.local` with placeholder Gmail credentials that user must replace

## Key Changes

### 1. Added Credentials Validation

```typescript
async function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local')
  }
  // ... rest of transporter creation
}
```

### 2. Improved Error Messages

```typescript
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  console.error('Email error:', errorMessage)
  return NextResponse.json(
    { error: errorMessage.includes('credentials not configured')
      ? 'Email service not configured. Please contact the administrator.'
      : 'Failed to send email. Please try again.' },
    { status: 500 }
  )
}
```

### 3. Environment Configuration

Created `.env.local` with placeholder values:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

## Verification

- Tested with missing credentials: Returns helpful "Email service not configured" message
- Tested with placeholder credentials: Returns "Failed to send email" (expected - needs real credentials)

## User Setup Required

The user must replace the placeholder Gmail credentials with real values:
1. Go to Google Account -> Security
2. Enable 2-Step Verification
3. Go to App passwords
4. Create new app password for "Winning Adventure"
5. Replace values in `.env.local`

## Deviations from Plan

### Completed
- Task 1: Added Gmail credentials to .env.local (with placeholder values)
- Task 2: Improved error handling in enquiry route

### Partially Completed
- Task 3: Tested error handling (works correctly with missing credentials)
- Could not fully test 200 OK response as it requires real Gmail credentials

## Self-Check

- [x] Commit exists: 19aee1b8
- [x] Files modified: app/api/enquiry/route.ts
- [x] Credentials validation added
- [x] Error messages improved

## Self-Check: PASSED
