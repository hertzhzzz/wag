# INTEGRATIONS.md - External Integrations

**Analysis Date:** 2026-03-17

## Email Services

### Gmail SMTP (Active)
- **Provider**: Gmail via Nodemailer
- **Env Variables**: `GMAIL_USER`, `GMAIL_APP_PASSWORD`
- **Usage**: Enquiry form submissions, Newsletter subscriptions
- **Files**:
  - `app/api/enquiry/route.ts` - POST /api/enquiry
  - `app/api/newsletter/route.ts` - POST /api/newsletter

### Resend (Not Active)
- **Status**: Listed in package.json but NOT used in code
- **Potential Use**: Transactional emails

## External Services

### Calendly
- **Usage**: Meeting scheduling embed on enquiry page
- **URL**: https://calendly.com/mark-winningadventure/
- **Files**: `app/enquiry/page.tsx`, `app/components/CalendlyEmbed.tsx`

### Google Analytics
- **ID**: G-VEGJ1YL8YR
- **File**: `app/layout.tsx`

### Unsplash Images
- **Usage**: Industry cover images, Hero video poster
- **Domain**: images.unsplash.com

## Database

### Supabase (Not Active)
- **Status**: Mentioned in CLAUDE.md but NOT in actual code
- **Potential**: Auth, database storage

## Deployment

- **Platform**: Vercel
- **CI/CD**: GitHub integration (push to master triggers deploy)
- **Project**: https://vercel.com/markhz/wag

---

*Integrations analysis: 2026-03-17*
