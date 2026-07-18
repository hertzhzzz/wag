# Guides Discovery Integration Contract

## Purpose

`lib/seo/guides` provides a pure, deterministic contract for the future Winning Adventure Global Guides discovery experience. It does not read repository files, generated artifacts, runtime state, or network resources, and it does not modify navigation, footer, sitemap, or page components.

Production integration remains blocked until Ticket 25 approves all five editorial pillar destinations and the governed article projection is available.

## Adapter boundary

A future adapter must explicitly project governed records into `GuidesDiscoveryInput`:

- `clusterRegistry.records`: exactly the five canonical clusters, canonical labels and priorities, approved editorial pillar state, and discovery visibility.
- `articleIndex.records`: exact governed article records with publication, discovery, migration, date, and version decisions.
- `presentation.recentLimit`: an explicit positive integer; no runtime clock or environment default.

The adapter must not pass legacy cluster configuration directly. It must not infer, invent, or repair an editorial destination. Unknown keys are rejected rather than stripped.

## Fail-closed behavior

The builder returns `status: "blocked"` and no Guides view model when any canonical pillar is unresolved, hidden, missing its article record, assigned to the wrong cluster or role, or not live and eligible. Invalid routes and malformed records are contract errors.

Supporting articles are included only when they are approved, live, discovery-eligible, and governed by a `keep` or `refresh` migration action. Draft, blocked, merged, redirected, and retired records are excluded.

## Integration invariants

- The primary Guides descriptor points to `/article`.
- On-page pillar cards, footer pillar descriptors, and sitemap pillar descriptors share the same five approved destinations and canonical order.
- Guides descriptors have `guides-only` scope.
- Services navigation remains a separate commercial contract.
- Legal links remain a separate compliance contract.
- Filters are same-document component state and must not create crawlable result pages or query contracts.

## Accessibility handoff

The view model supplies stable section, heading, control, status, list, card, and link identifiers; explicit relationships; deterministic focus order; and review checks for mobile, desktop, keyboard, and screen-reader behavior. A production renderer must preserve these relationships and complete visual and assistive-technology review before release.

## Remaining gates

1. Ticket 25 approves all five editorial pillar destinations.
2. The Ticket 05 generated records and article governance adapter are accepted as the production projection source.
3. A human reviewer confirms the final public labels and destination dispositions.
4. A later integration ticket wires the descriptors into production UI and sitemap code without replacing Services or legal items.
5. Mobile, desktop, keyboard, and screen-reader reviews pass in the rendered application.
