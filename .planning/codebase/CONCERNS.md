# CONCERNS.md - Technical Debt & Issues

**Analysis Date:** 2026-03-17

## Known Issues

### Mobile Navbar
- **Issue**: Hamburger menu background transparency on scroll
- **Status**: Fixed in latest commit
- **File**: `app/components/Navbar.tsx`

## Technical Debt

### Unused Dependencies
- `resend` - Listed but not used
- `echarts` - Listed but not used
- `remotion` - Listed but not used

### Testing
- No unit tests
- No integration tests
- Playwright present but not configured

### Environment Variables
- `GMAIL_USER`, `GMAIL_APP_PASSWORD` required for email
- No `.env.example` file

## Security

- XSS prevention via `escapeHtml()` - Good
- No exposed API keys in code - Good

## Performance

- Static pages generated at build time - Good
- Images use Next.js Image optimization - Good

---

*Concerns analysis: 2026-03-17*
