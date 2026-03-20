# Phase 8: Security Audit - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Comprehensive security audit of the WAG website to identify and fix vulnerabilities. Includes dependency scanning, API route security, security headers, and hardening measures. Does not include user authentication (no user accounts on site).

</domain>

<decisions>
## Implementation Decisions

### Security Scan Scope
- Full security audit: OWASP Top 10 + dependency scanning + API routes + security headers
- Detection method: Automated tools (npm audit, npm outdated) + manual code review
- Include dependency scanning as part of this phase

### Vulnerability Prioritization
- Standard CVSS severity levels: Critical → High → Medium → Low
- Focus on data/service exposure vulnerabilities: RCE, SQL injection, auth bypass, data exposure
- Business risk-based secondary prioritization

### Remediation Approach
- Both: Fix found vulnerabilities + proactive hardening
- Rate limiting: Add to enquiry form API route
- Security headers: Standard headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Environment variable security: Verify env vars properly secured in Vercel
- Email security: Verify current Resend setup is properly secured
- Auth: Check Supabase auth patterns if used (current setup only)
- CORS: Verify API routes only accept expected origins
- Scanning tools: Free tools (npm audit, npm outdated, code review)

### Verification Method
- Both automated + manual verification
- Pass criteria: Build passes, no vulnerabilities in npm audit, security headers present
- Add security scanning to CI/CD pipeline

</decisions>

<canonical_refs>
## Canonical References

### Project Context
- `.planning/ROADMAP.md` — Phase 8 goal and requirements
- `./CLAUDE.md` — Project conventions and tech stack

### Technical References
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security Headers: https://nextjs.org/docs/app/api-reference/next-config-js/headers
- npm audit: https://docs.npmjs.com/cli/v8/commands/npm-audit

</canonical_refs>

<codebase_context>
## Existing Code Insights

### API Routes
- `app/api/enquiry/route.ts` — Enquiry form submission (Resend)
- `app/api/newsletter/route.ts` — Newsletter signup

### Environment
- `.env.local` — Local environment variables
- Vercel configured with production env vars

### Security Current State
- No custom middleware
- No custom security headers
- No rate limiting currently
- Resend for email

</codebase_context>

<specifics>
## Specific Ideas

- Production site: https://www.winningadventure.com.au
- Want comprehensive coverage but prioritize data exposure risks
- Prefer free tools to minimize cost

</specifics>

<deferred>
## Deferred Ideas

- Paid security tools (Snyk, Dependabot) — future consideration
- Email security records (SPF, DKIM, DMARC) — if needed after audit

</deferred>

---

*Phase: 08-security-audit*
*Context gathered: 2026-03-18*
