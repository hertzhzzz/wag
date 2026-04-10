---
status: resolved
trigger: "blog-404-deployment-failure: Latest blog post failed to deploy properly. Returns 404 after git push to GitHub/Vercel deployment."
created: 2026-04-07T00:00:00.000Z
updated: 2026-04-07T00:00:00.000Z
---

## Current Focus
hypothesis: "File was never committed to git, so never deployed"
test: "git status showed file as untracked"
expecting: "Commit and push would fix 404"
next_action: "VERIFIED - blog now returns HTTP 200"

## Symptoms
expected: Blog should be pushed to GitHub and auto-deploy to Vercel, accessible online
actual: Blog returns 404 error after deployment
errors: None specific
reproduction: Happened with latest blog post
started: First time this happened

## Eliminated

## Evidence
- timestamp: 2026-04-07T00:00:00.000Z
  checked: "git status --porcelain"
  found: "?? content/blog/china-business-sourcing-tour.mdx - file is UNTRACKED"
  implication: "File was never committed to git, never pushed to GitHub, never deployed to Vercel"
- timestamp: 2026-04-07T00:00:00.000Z
  checked: "git log --oneline -1 -- content/blog/china-business-sourcing-tour.mdx"
  found: "No output - file has never been committed"
  implication: "Confirmed file is not in git history"
- timestamp: 2026-04-07T00:00:00.000Z
  checked: "curl -sI https://www.winningadventure.com.au/resources/china-business-sourcing-tour"
  found: "HTTP/2 404 after initial push, HTTP/2 200 after Vercel rebuild"
  implication: "Vercel auto-deployed and blog is now accessible"

## Resolution
root_cause: "File content/blog/china-business-sourcing-tour.mdx was created locally but never committed to git. As a result, git push did not include the new file, Vercel never deployed it, and the blog returned 404."
fix: "Committed and pushed the file to GitHub master branch. Vercel auto-detected the push and triggered a new deployment."
verification: "curl -sI https://www.winningadventure.com.au/resources/china-business-sourcing-tour returns HTTP/2 200"
files_changed:
- content/blog/china-business-sourcing-tour.mdx
