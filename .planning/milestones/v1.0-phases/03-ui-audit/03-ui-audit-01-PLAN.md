---
phase: 03-ui-audit
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: []
user_setup: []
must_haves:
  truths:
    - "Automated responsive tests can run on mobile viewports"
    - "Browser automation can use inherited Chrome profile for testing"
    - "Test infrastructure validates mobile behavior"
  artifacts:
    - path: "frontend/playwright.config.ts"
      provides: "Playwright test configuration"
    - path: "frontend/package.json"
      provides: "Playwright dependency added"
  key_links: []
---

<objective>
Install test infrastructure for responsive validation

Purpose: Project has no test framework - need Playwright for automated responsive testing per CONTEXT.md requirements. This enables test-driven validation workflow.

Output: Test infrastructure ready for responsive test creation
</objective>

<context>
@/Users/mark/Projects/wag/.planning/phases/03-ui-audit/03-RESEARCH.md
@/Users/mark/Projects/wag/.planning/phases/03-ui-audit/03-CONTEXT.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Playwright test framework</name>
  <files>frontend/package.json</files>
  <read_first>frontend/package.json</read_first>
  <action>
Install Playwright in frontend directory:
- Run: cd frontend && npm init playwright@latest -- --yes --quiet --no-browsers
- Install chromium: npx playwright install chromium
- Install browser-use: npm install browser-use
  </action>
  <verify>
    <automated>cd frontend && npx playwright --version</automated>
  </verify>
  <done>Playwright version is displayed</done>
  <acceptance_criteria>
- [ ] Playwright is listed in package.json dependencies
- [ ] npx playwright --version returns version number
- [ ] browser-use is in package.json
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 2: Configure Playwright for mobile viewport testing</name>
  <files>frontend/playwright.config.ts</files>
  <read_first>frontend/package.json</read_first>
  <action>
Create playwright.config.ts with mobile viewport presets:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
```
  </action>
  <verify>
    <automated>cd frontend && npx playwright test --list</automated>
  </verify>
  <done>Playwright lists mobile and chromium projects</done>
  <acceptance_criteria>
- [ ] playwright.config.ts exists in frontend/
- [ ] Config includes 'mobile' project using iPhone 14 viewport
- [ ] Config includes 'chromium' project for desktop testing
  </acceptance_criteria>
</task>

<task type="auto">
  <name>Task 3: Verify dev server runs for testing</name>
  <files>frontend/package.json</files>
  <read_first>frontend/package.json</read_first>
  <action>
Ensure dev server is runnable:
- Verify npm run dev works (can start in background or check it starts)
- Dev server should run on localhost:3000 per CLAUDE.md
  </action>
  <verify>
    <automated>cd frontend && timeout 10 npm run dev || true</automated>
  </verify>
  <done>Dev server starts without errors</done>
  <acceptance_criteria>
- [ ] npm run dev executes without immediate errors
- [ ] Server would start on localhost:3000
  </acceptance_criteria>
</task>

</tasks>

<verification>
After completion, run: cd frontend && npx playwright test --project=mobile --list
Expected: Shows mobile project configured
</verification>

<success_criteria>
- [ ] Playwright installed with version displayed
- [ ] playwright.config.ts created with mobile project
- [ ] browser-use package installed
- [ ] Tests can be listed via npx playwright test --list
</success_criteria>

<output>
After completion, create `.planning/phases/03-ui-audit/03-ui-audit-01-SUMMARY.md`
</output>
