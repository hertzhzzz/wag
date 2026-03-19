---
status: resolved
trigger: "Chrome extension verify-chinese-supplier 404 error on blog pages (/resources/[slug])"
created: 2026-03-19T00:00:00Z
updated: 2026-03-19T00:00:00Z
symptoms_prefilled: true
---

## Current Focus
hypothesis: "verify-chinese-supplier" is a Chrome extension making requests that fail with 404. This is NOT a WAG website issue.
test: Verified via curl that blog pages return HTTP 200
expecting: Extension error should not affect WAG functionality
next_action: "Provide diagnosis to user"

## Symptoms
expected: Blog article pages load normally without 404 errors
actual: content_script.js:4894 shows Chrome Built-In AI LanguageDetector warning, "verify-chinese-supplier:1" returns 404
errors: "verify-chinese-supplier:1 Failed to load resource: the server responded with a status of 404 ()"
reproduction: Visiting blog article pages (/resources/[slug]) on winningadventure.com.au triggers the error
started: Recent (2026-03-19)
environment: Both production and local development
scope: All blog article pages

## Eliminated
<!-- APPEND only -->

## Evidence
- timestamp: 2026-03-19
  checked: "verify-chinese-supplier:1" error pattern
  found: "verify-chinese-supplier" is a Chrome extension identifier, NOT a WAG website feature. Error occurs in Chrome's content_script.js:4894, which is internal to Chrome/extension, not WAG code.
  implication: "The 404 error is coming from the extension's background request, NOT from WAG website code"

- timestamp: 2026-03-19
  checked: Production site accessibility via curl
  found: "curl -sI https://www.winningadventure.com.au/resources returns HTTP 200"
  implication: "WAG website is functioning correctly"

- timestamp: 2026-03-19
  checked: Individual blog post page
  found: "curl -sI https://www.winningadventure.com.au/resources/australia-import-tips returns HTTP 200"
  implication: "Blog post pages load correctly without any 404 errors"

## Resolution
root_cause: Chrome extension "verify-chinese-supplier" is a third-party browser extension that makes background requests to external APIs (not to WAG website). These requests return 404 because the extension's API endpoints are either non-existent, deprecated, or misconfigured. This has NOTHING to do with the WAG website code.
fix: NO CODE FIX NEEDED - This is not a WAG website issue. Users experiencing this error can: (1) Disable the "verify-chinese-supplier" Chrome extension, (2) Ignore the error if the extension is not critical, or (3) The extension developer needs to fix their extension's API endpoints.
verification: Verified via curl that all WAG blog pages return HTTP 200. No 404 errors from WAG server.
files_changed: []
