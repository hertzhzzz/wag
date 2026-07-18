# Ticket 40：首个 Refresh / Evidence / Link Upgrade Publication Event 合同

> **Contract-only / fail-closed**：此模板只用于构造和审计 `first_refresh_publication` 输入。它不会编辑文章、发布、部署、调用 Search Console、提交 indexing、读取排名，或调用任何外部 API。

## 1. 事件边界

Ticket 40 表示首个既有 URL 的 refresh、evidence upgrade、internal-link upgrade 或 pillar improvement 事件。它必须消费 Ticket 28/29/30 与 Ticket 38 的 typed output/digest，不能绕过机会选择、evidence 审批、articleUpgrade 审批或 release gate。

真实事件的完成状态只可能来自 Ticket 38 的可信 `live_verified` release。`synthetic_fixture` 和 `dry_run` 只可得到 `fixture_ready`；它们不能声称已发布、已部署、已索引或已排名。

## 2. 顶层输入（exact keys）

```ts
{
  version: 1,
  eventType: "first_refresh_publication",
  eventId: "<machine-id>",
  dataMode: "actual" | "synthetic_fixture" | "dry_run",
  occurredAt: "<RFC3339_WITH_TIMEZONE>",
  candidate: {
    existingUrl: "https://<approved-host>/<existing-path>",
    targetUrl: "https://<approved-host>/<path>",
    canonicalUrl: "https://<approved-host>/<path>",
    cluster: "<governed cluster id>",
    intent: "<governed intent id>"
  },
  opportunity: { ... },
  articleUpgrade: { ... },
  changes: { ... },
  evidence: { ... },
  quality: { ... },
  artifact: { artifactDigest: "sha256:<64 hex>", reportDigest: "sha256:<64 hex>" },
  releaseIdentity: {
    workflowInstanceId: "<machine-id>",
    releaseId: "<machine-id>",
    artifactDigest: "sha256:<64 hex>",
    reportDigest: "sha256:<64 hex>",
    nonce: "<non-empty nonce>"
  },
  releaseBinding: "<trusted Ticket 38 binding>",
  failureReasons: []
}
```

所有对象 exact keys 且递归拒绝未知 key。时间必须是带时区的 RFC3339；`2026-07-19` 及以后仅允许 synthetic fixture/test，actual 与 dry run 一律拒绝。

## 3. URL、articleUpgrade 与 changes

默认必须保留 URL：

```ts
candidate.existingUrl === candidate.targetUrl
changes.urlDisposition: { kind: "preserve", approvalDigest: null }
```

只有在 URL 真的改变且存在独立批准时才可使用：

```ts
changes.urlDisposition: { kind: "change", approvalDigest: "sha256:<64 hex>" }
```

`articleUpgrade` 必须是 `status: "approved"`，并带 `ticketId`、`candidateDigest`、`reportDigest`。`changes.afterArtifactDigest` 必须等于事件 `artifact.artifactDigest`，且必须不同于 `beforeArtifactDigest`。没有批准的 URL disposition、没有 evidence digest 或把 recommendation 当 selected 都必须阻断/拒绝。

```ts
changes: {
  kind: "refresh" | "evidence_upgrade" | "internal_link_upgrade" | "pillar_improvement",
  beforeArtifactDigest: "sha256:<64 hex>",
  afterArtifactDigest: "sha256:<64 hex>",
  changeDigest: "sha256:<64 hex>",
  urlDisposition: { kind: "preserve", approvalDigest: null }
}
```

## 4. Gate 与 trusted release binding

`quality` 必须逐项 verified：`evidenceAge`、`authorship`、`reviewDate`、`methodology`、`geo`、`graph`、`attribution`、`disclosure`、`mobile`、`metadata`、`schema`、`build`。每项都必须绑定 `reportDigest`。

`releaseBinding` 必须来自可信 Ticket 38 adapter，严格绑定：

- `workflowInstanceId`、`releaseId`、`artifactDigest`、`reportDigest`、`nonce`；
- 独立 content approval 与 production/release approval；
- deployment identity、目标地址和 live verification；
- `state: "live_verified"` 以及 `liveVerified: true`（actual 完成所需）；
- `rollback.readiness: "ready"` 与 `verificationRequired: true`；
- attestation digest。

调用方自报 `deployed` 或 `live_verified` 不被接受。未经过可信 attestation 的 release binding 必须 `blocked`。

## 5. 纯评估与报告

```ts
const decision = evaluateRefreshPublicationEvent(input);
```

该调用不执行任何副作用，只返回规范化 record、排序后的 blockers 和可审计报告。报告必须保持：

```ts
sideEffects: []
searchNotification: "not_attempted"
indexation: "not_observed"
claims: { indexed: false, ranked: false }
```

### Fixture 规则

`synthetic_fixture` 可以使用未来 fixture 时间（包括 2026-07-19 及以后），但结果只能是 `fixture_ready` 且 `completed: false`。fixture 不得冒充真实 evidence、Search Console、indexation、ranking、deployment 或人工批准。

### Actual 完成规则

只有可信 Ticket 38 `live_verified` binding 与事件中的 release identity、artifact/report digest 完全匹配，URL disposition、articleUpgrade、evidence、质量 gates、rollback 条件全部满足时，才允许 `completed: true`。本合同层只记录和评估这些输入，不会触发真实 refresh 或发布。
