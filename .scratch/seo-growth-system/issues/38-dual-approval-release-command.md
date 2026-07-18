# 38 — Enforce the Dual-Approval Release Command

**What to build:** Provide one release command that validates governed content, generates current artifacts, builds a preview, and produces a review report before stopping for explicit content approval and a separate explicit production approval. After deployment it must verify the live result and report search-engine notifications without claiming indexing success.

**Blocked by:** 05, 26, 27, 30.

**Status:** ready-for-agent

- [ ] Schema, evidence, graph, generated-artifact, build, privacy, and regression checks run before approval is requested.
- [ ] Review output includes affected URLs, content changes, graph changes, attribution changes, risks, and a preview destination.
- [ ] The workflow stops at content approval and records the approver and timestamp.
- [ ] A second independent production approval is required after content approval.
- [ ] No flag, environment shortcut, scheduled task, or retry path can bypass either approval.
- [ ] Post-deploy checks verify live status, canonical, robots, structured data, key links, and expected content.
- [ ] Sitemap or search-engine notifications are reported as submissions, never as proof of indexing.
