# 05 — Add Deterministic SEO Generation and Validation

**What to build:** Provide one repeatable command path that validates governed content and regenerates SEO indexes, cluster maps, graph inputs, and review reports. Unchanged inputs must produce byte-identical outputs, stale generated files must fail checks, and validation must clearly separate hard failures from advisory warnings.

**Blocked by:** 02, 03, 04.

**Status:** complete

- [x] Repeated generation from unchanged inputs produces byte-identical governed artifacts.
- [x] A check mode fails when committed generated artifacts are stale or manually edited.
- [x] Hard failures cover schema, evidence, graph, duplicate identity, and unsafe disclosure violations.
- [x] Advisory warnings are clearly labeled and do not masquerade as successful hard checks.
- [x] Fixtures prove both passing and failing validation paths.
- [x] All 23 current articles receive a compatibility report before strict migration begins.
- [x] The command performs no deployment, indexing request, or production mutation.
