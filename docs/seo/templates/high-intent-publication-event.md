# Ticket 39：首个高意图新文章 Publication Event 合同

> **Contract-only / fail-closed**：此模板只用于构造和审计 `first_high_intent_publication` 输入。它不会写作、修改内容、发布、部署、调用 Search Console、提交 indexing、读取排名，或调用任何外部 API。

## 1. 事件边界

Ticket 39 表示“首个高意图新文章发布事件”，不是“生成文章”或“推荐一个机会”。只有既有合同提供了 typed output/digest，事件才可进入评估：

- Ticket 28：机会必须是 `selection: "selected"`，且带 `opportunityDigest`、`briefDigest`、`approvalDigest`；`recommended` 永远不能替代 selected/approved。
- Ticket 29/30：evidence 必须是 `status: "approved"`，并绑定 evidence/expertise digest。
- Ticket 38：`releaseBinding` 必须来自可信 release adapter，严格绑定 workflow、release、artifact、report、nonce；caller 自报的 `live_verified`、`deployed` 或布尔值不构成可信证明。

真实事件的完成状态只可能来自 Ticket 38 的可信 `live_verified` release。synthetic fixture 和 dry run 最多得到 `fixture_ready`，绝不能得到 `completed: true`。

## 2. 顶层输入（exact keys）

```ts
{
  version: 1,
  eventType: "first_high_intent_publication",
  eventId: "<machine-id>",
  dataMode: "actual" | "synthetic_fixture" | "dry_run",
  occurredAt: "<RFC3339_WITH_TIMEZONE>",
  candidate: { ... },
  opportunity: { ... },
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

未知 key（包括嵌套对象中的 key）必须拒绝。时间必须带 `Z` 或显式 offset；`2026-07-19` 及以后只能出现在 `synthetic_fixture` 测试数据中，`actual` 和 `dry_run` 必须拒绝。

## 3. Candidate 与 gate

```ts
candidate: {
  query: "<reviewed high-intent query>",
  intent: "<governed intent id>",
  cluster: "<governed cluster id>",
  targetUrl: "https://<approved-host>/<path>",
  canonicalUrl: "https://<approved-host>/<path>",
  pageType: "high_intent_article"
}
```

`canonicalUrl` 必须等于 `targetUrl`。`quality` 必须包含并逐项验证：`intent`、`cluster`、`graph`、`geo`、`attribution`、`disclosure`、`mobile`、`metadata`、`schema`、`build`。每项只能是 `{ status: "verified", reportDigest }`，不能放自由文本或未审计的 recommendation。

## 4. 机会与 evidence

```ts
opportunity: {
  selection: "selected",
  opportunityDigest: "sha256:<64 hex>",
  briefDigest: "sha256:<64 hex>",
  approvalDigest: "sha256:<64 hex>"
},
evidence: {
  status: "approved",
  packageDigest: "sha256:<64 hex>",
  expertiseDigest: "sha256:<64 hex>"
}
```

不得伪造真实专家、外部证据、人工批准、URL、部署、live probe、indexation 或排名结果。没有来源 digest 时应阻断，而不是用零值或 recommendation 填充。

## 5. Ticket 38 release binding

`releaseBinding` 只接受 Ticket 38 输出的可信 attestation，或由本目录 `createSyntheticReleaseBinding` 生成的明确 synthetic/dry-run binding。它必须包含：

- `workflowInstanceId`、`releaseId`、`artifactDigest`、`reportDigest`、`nonce`；
- 独立的 content approval 与 production/release approval；
- deployment identity 与目标 URL；
- `liveVerification` 的完整通过状态，且 `state: "live_verified"` 才能完成 actual 事件；
- `rollback.readiness: "ready"` 与 `verificationRequired: true`；
- 可验证的 attestation digest。

`deployed` 不等于 `live_verified`。Ticket 38 未提供可信 binding 时，事件必须是 `blocked`。

## 6. 纯评估与报告

```ts
const decision = evaluateHighIntentPublicationEvent(input);
```

评估是纯函数：只解析、规范化、比较 digest、计算 blocker、生成报告。报告必须明确：

- `sideEffects: []`
- `searchNotification: "not_attempted"`
- `indexation: "not_observed"`
- `claims.indexed: false`
- `claims.ranked: false`

### Synthetic fixture 示例边界

```ts
dataMode: "synthetic_fixture";
// occurredAt 可以使用 2026-07-19 及以后，仅用于测试/fixture
// 结果：state === "fixture_ready", completed === false
```

### Actual 完成条件

只有当 Ticket 38 trusted binding 已证明：独立审批、目标部署、live verification、artifact/report digest、workflow/release/nonce 全部一致，且 rollback 已 ready 且要求 verification，报告才可为 `state: "live_verified"` 和 `completed: true`。本合同层不会主动制造这些证明。
