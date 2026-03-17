# External Integrations

**Analysis Date:** 2026-03-17

## Email Services

### Gmail SMTP (Active)
- **Purpose:** Enquiry form submissions
- **Implementation:** `frontend/app/api/enquiry/route.ts` uses nodemailer
- **Status:** Working - sends emails via Gmail SMTP
- **Credentials:** Uses `GMAIL_USER` and `GMAIL_APP_PASSWORD` env vars

### Resend (Installed but not integrated)
- **Purpose:** Email sending (alternative to Gmail)
- **Status:** Not actively used - SDK installed but no integration
- **Location:** `frontend/package.json` line 33: `"resend": "^6.9.3"`
- **Note:** Should integrate for better deliverability

### Newsletter (Stub)
- **Purpose:** Newsletter subscription
- **Implementation:** `frontend/app/api/newsletter/route.ts`
- **Status:** Not functional - only logs to console, TODO comment for integration
- **Fix:** Integrate with Mailchimp, ConvertKit, or Resend

## Database

### Supabase
- **Status:** SDK installed but not actively used
- **Packages:** `@supabase/supabase-js`
- **Env Vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Note:** Could be used for form submissions storage, user auth, etc.

## Third-Party Services

### Calendly
- **Purpose:** Scheduling meetings
- **Implementation:** Embedded in enquiry page
- **URL:** `https://calendly.com/mark-winningadventure/`
- **Location:** `frontend/app/enquiry/page.tsx` line 33
- **Note:** Hardcoded - should move to env variable

### Google Analytics
- **Purpose:** Website analytics
- **Implementation:** GA4 script in root layout
- **Location:** `frontend/app/layout.tsx`

## Content

### MDX Blog System
- **Purpose:** Blog/resource articles
- **Implementation:** MDX files in `frontend/content/blog/` + `next-mdx-remote`
- **Parsing:** `gray-matter` for frontmatter
- **Status:** Working - 4 blog posts currently

---

*Integrations analysis: 2026-03-17*
