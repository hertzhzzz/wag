# 01 — Establish the SEO Baseline and Publishing Safety Audit

**What to build:** Produce a reproducible current-state audit that accounts for the live article corpus, legacy cluster data, every article discovery surface, current measurement baselines, and every scheduling or deployment path. The audit must prove that no unattended route can publish SEO content before later human-gated work begins.

**Blocked by:** None.

**Status:** completed

- [x] Exactly 23 baseline articles and four legacy cluster sources are accounted for.
- [x] Article listing, detail, sitemap, navigation, recommendations, and dashboard discovery surfaces are documented.
- [x] Current GSC, GA4, enquiry, indexation, and GEO measurement availability is recorded with dates and limitations.
- [x] Every content scheduling, generation, deployment, and notification path is classified as manual, gated, or unattended.
- [x] Any path capable of publishing without explicit approval is disabled or documented as a hard blocker.
- [x] The audit can be rerun and produces the same inventory when the repository has not changed.

## Completion evidence

- Baseline inventory: `content/seo/migrations/2026-07-17-article-inventory.yaml`.
- Human-readable audit and dated measurement limitations: `docs/seo/2026-07-17-baseline.md`.
- Scheduler evidence bound to the live four-task registry and current task-definition hashes: `content/seo/evidence/2026-07-17-scheduler-state.yaml`.
- Deterministic audit implementation and tests: `lib/seo-baseline-audit.ts`, `scripts/seo-baseline-audit.ts`, and `lib/seo-baseline-audit.test.ts`.
- Git-integrated Vercel deployments are disabled in `vercel.json`. Direct `vercel --prod` remains an explicit manual operator action; the technical dual-approval release command is intentionally deferred to Ticket 38.
- Verification on 2026-07-17: 14 focused tests passed, including canonical scheduler-registry binding and test/binary/oversized entrypoint fail-closed regressions; 133 non-external main-repository tests passed; target ESLint passed with zero findings; baseline check passed; release-safety check passed; production build passed; two consecutive artifact writes produced identical SHA-256 hashes.
- Known repository-level checks outside this ticket remain unchanged: `lib/google-trends.test.ts` depends on a missing local browser harness and has one existing TypeScript call-signature error; full lint retains two existing errors outside Ticket 01.
