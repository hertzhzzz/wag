import {
  assertExactKeys,
  assertRecord,
  compareCodePoints,
  deepFreeze,
  normalizeDigest,
  normalizeHttpsUrl,
  normalizeMachineId,
  normalizeNonEmptyString,
  normalizeStringList,
  type Sha256Digest,
} from "./contracts";
import {
  assertTrustedBindingShape,
  isTrustedPublicationReleaseBinding,
} from "./releaseBinding";
import {
  PUBLICATION_EVENT_SCHEMA_VERSION,
  type ApprovedEvidence,
  type ArticleUpgradeDigest,
  type HighIntentCandidate,
  type HighIntentPublicationEventInput,
  type HighIntentQuality,
  type PublicationDataMode,
  type PublicationDigestPair,
  type PublicationEventInput,
  type PublicationGateAttestation,
  type PublicationReleaseIdentity,
  type RefreshCandidate,
  type RefreshChanges,
  type RefreshPublicationEventInput,
  type RefreshQuality,
  type SelectedOpportunity,
  type TrustedReleaseBinding,
} from "./types";

const RFC3339_WITH_ZONE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/;
const FIRST_FUTURE_FIXTURE_DATE = "2026-07-19";

const BASE_KEYS = [
  "version",
  "eventType",
  "eventId",
  "dataMode",
  "occurredAt",
  "candidate",
  "opportunity",
  "evidence",
  "quality",
  "artifact",
  "releaseIdentity",
  "releaseBinding",
  "failureReasons",
] as const;

const HIGH_INTENT_QUALITY_KEYS = [
  "intent",
  "cluster",
  "graph",
  "geo",
  "attribution",
  "disclosure",
  "mobile",
  "metadata",
  "schema",
  "build",
] as const;

const REFRESH_QUALITY_KEYS = [
  "evidenceAge",
  "authorship",
  "reviewDate",
  "methodology",
  "geo",
  "graph",
  "attribution",
  "disclosure",
  "mobile",
  "metadata",
  "schema",
  "build",
] as const;

function normalizeDataMode(value: unknown): PublicationDataMode {
  if (
    value !== "actual" &&
    value !== "synthetic_fixture" &&
    value !== "dry_run"
  ) {
    throw new Error("dataMode must be actual, synthetic_fixture, or dry_run.");
  }
  return value;
}

export function normalizePublicationTimestamp(
  value: unknown,
  label: string,
  dataMode: PublicationDataMode,
): string {
  const timestamp = normalizeNonEmptyString(value, label);
  const match = RFC3339_WITH_ZONE.exec(timestamp);
  if (!match)
    throw new Error(`${label} must be RFC3339 with an explicit timezone.`);
  const [, year, month, day, hour, minute, second, millis = "0", zone] = match;
  const numbers = [year, month, day, hour, minute, second].map(Number);
  const [y, m, d, h, min, s] = numbers;
  if (m < 1 || m > 12 || h > 23 || min > 59 || s > 59) {
    throw new Error(`${label} must be a valid RFC3339 calendar timestamp.`);
  }
  const maxDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (d < 1 || d > maxDay || Number(millis.padEnd(3, "0")) > 999) {
    throw new Error(`${label} must be a valid RFC3339 calendar timestamp.`);
  }
  if (zone !== "Z") {
    const zoneHour = Number(zone.slice(1, 3));
    const zoneMinute = Number(zone.slice(4, 6));
    if (zoneHour > 23 || zoneMinute > 59) {
      throw new Error(`${label} must have a valid RFC3339 timezone.`);
    }
  }
  if (!Number.isFinite(Date.parse(timestamp))) {
    throw new Error(`${label} must be a valid RFC3339 timestamp.`);
  }
  if (
    dataMode !== "synthetic_fixture" &&
    timestamp.slice(0, 10) >= FIRST_FUTURE_FIXTURE_DATE
  ) {
    throw new Error(
      `${label} uses a future date reserved for synthetic fixtures/tests.`,
    );
  }
  return timestamp;
}

function normalizeGate(
  value: unknown,
  label: string,
): PublicationGateAttestation {
  assertRecord(value, label);
  assertExactKeys(value, ["status", "reportDigest"], label);
  if (value.status !== "verified")
    throw new Error(`${label}.status must be verified.`);
  return {
    status: "verified",
    reportDigest: normalizeDigest(value.reportDigest, `${label}.reportDigest`),
  };
}

function normalizeQuality<T extends object>(
  value: unknown,
  keys: readonly string[],
  label: string,
): T {
  assertRecord(value, label);
  assertExactKeys(value, keys, label);
  return Object.fromEntries(
    [...keys]
      .sort(compareCodePoints)
      .map((key) => [key, normalizeGate(value[key], `${label}.${key}`)]),
  ) as T;
}

function normalizeDigestPair(
  value: unknown,
  label: string,
): PublicationDigestPair {
  assertRecord(value, label);
  assertExactKeys(value, ["artifactDigest", "reportDigest"], label);
  return {
    artifactDigest: normalizeDigest(
      value.artifactDigest,
      `${label}.artifactDigest`,
    ),
    reportDigest: normalizeDigest(value.reportDigest, `${label}.reportDigest`),
  };
}

function normalizeReleaseIdentity(value: unknown): PublicationReleaseIdentity {
  assertRecord(value, "releaseIdentity");
  assertExactKeys(
    value,
    [
      "workflowInstanceId",
      "releaseId",
      "artifactDigest",
      "reportDigest",
      "nonce",
    ],
    "releaseIdentity",
  );
  return {
    workflowInstanceId: normalizeMachineId(
      value.workflowInstanceId,
      "releaseIdentity.workflowInstanceId",
    ),
    releaseId: normalizeMachineId(value.releaseId, "releaseIdentity.releaseId"),
    artifactDigest: normalizeDigest(
      value.artifactDigest,
      "releaseIdentity.artifactDigest",
    ),
    reportDigest: normalizeDigest(
      value.reportDigest,
      "releaseIdentity.reportDigest",
    ),
    nonce: normalizeNonEmptyString(value.nonce, "releaseIdentity.nonce"),
  };
}

function normalizeOpportunity(value: unknown): SelectedOpportunity {
  assertRecord(value, "opportunity");
  assertExactKeys(
    value,
    ["selection", "opportunityDigest", "briefDigest", "approvalDigest"],
    "opportunity",
  );
  if (value.selection !== "selected") {
    throw new Error(
      "opportunity.selection must be selected; recommendation is not approval.",
    );
  }
  return {
    selection: "selected",
    opportunityDigest: normalizeDigest(
      value.opportunityDigest,
      "opportunity.opportunityDigest",
    ),
    briefDigest: normalizeDigest(value.briefDigest, "opportunity.briefDigest"),
    approvalDigest: normalizeDigest(
      value.approvalDigest,
      "opportunity.approvalDigest",
    ),
  };
}

function normalizeEvidence(value: unknown): ApprovedEvidence {
  assertRecord(value, "evidence");
  assertExactKeys(
    value,
    ["status", "packageDigest", "expertiseDigest"],
    "evidence",
  );
  if (value.status !== "approved")
    throw new Error("evidence.status must be approved.");
  return {
    status: "approved",
    packageDigest: normalizeDigest(
      value.packageDigest,
      "evidence.packageDigest",
    ),
    expertiseDigest: normalizeDigest(
      value.expertiseDigest,
      "evidence.expertiseDigest",
    ),
  };
}

function normalizeHighIntentCandidate(value: unknown): HighIntentCandidate {
  assertRecord(value, "candidate");
  assertExactKeys(
    value,
    ["query", "intent", "cluster", "targetUrl", "canonicalUrl", "pageType"],
    "candidate",
  );
  return {
    query: normalizeNonEmptyString(value.query, "candidate.query"),
    intent: normalizeMachineId(value.intent, "candidate.intent"),
    cluster: normalizeMachineId(value.cluster, "candidate.cluster"),
    targetUrl: normalizeHttpsUrl(value.targetUrl, "candidate.targetUrl"),
    canonicalUrl: normalizeHttpsUrl(
      value.canonicalUrl,
      "candidate.canonicalUrl",
    ),
    pageType: normalizeNonEmptyString(value.pageType, "candidate.pageType"),
  };
}

function normalizeRefreshCandidate(value: unknown): RefreshCandidate {
  assertRecord(value, "candidate");
  assertExactKeys(
    value,
    ["existingUrl", "targetUrl", "canonicalUrl", "cluster", "intent"],
    "candidate",
  );
  return {
    existingUrl: normalizeHttpsUrl(value.existingUrl, "candidate.existingUrl"),
    targetUrl: normalizeHttpsUrl(value.targetUrl, "candidate.targetUrl"),
    canonicalUrl: normalizeHttpsUrl(
      value.canonicalUrl,
      "candidate.canonicalUrl",
    ),
    cluster: normalizeMachineId(value.cluster, "candidate.cluster"),
    intent: normalizeMachineId(value.intent, "candidate.intent"),
  };
}

function normalizeArticleUpgrade(value: unknown): ArticleUpgradeDigest {
  assertRecord(value, "articleUpgrade");
  assertExactKeys(
    value,
    ["status", "ticketId", "candidateDigest", "reportDigest"],
    "articleUpgrade",
  );
  if (value.status !== "approved")
    throw new Error("articleUpgrade.status must be approved.");
  return {
    status: "approved",
    ticketId: normalizeMachineId(value.ticketId, "articleUpgrade.ticketId"),
    candidateDigest: normalizeDigest(
      value.candidateDigest,
      "articleUpgrade.candidateDigest",
    ),
    reportDigest: normalizeDigest(
      value.reportDigest,
      "articleUpgrade.reportDigest",
    ),
  };
}

function normalizeRefreshChanges(value: unknown): RefreshChanges {
  assertRecord(value, "changes");
  assertExactKeys(
    value,
    [
      "kind",
      "beforeArtifactDigest",
      "afterArtifactDigest",
      "changeDigest",
      "urlDisposition",
    ],
    "changes",
  );
  const kinds = [
    "refresh",
    "evidence_upgrade",
    "internal_link_upgrade",
    "pillar_improvement",
  ] as const;
  if (!kinds.includes(value.kind as (typeof kinds)[number])) {
    throw new Error("changes.kind is invalid.");
  }
  assertRecord(value.urlDisposition, "changes.urlDisposition");
  assertExactKeys(
    value.urlDisposition,
    ["kind", "approvalDigest"],
    "changes.urlDisposition",
  );
  if (
    value.urlDisposition.kind !== "preserve" &&
    value.urlDisposition.kind !== "change"
  ) {
    throw new Error("changes.urlDisposition.kind must be preserve or change.");
  }
  const approvalDigest =
    value.urlDisposition.approvalDigest === null
      ? null
      : normalizeDigest(
          value.urlDisposition.approvalDigest,
          "changes.urlDisposition.approvalDigest",
        );
  if (value.urlDisposition.kind === "preserve" && approvalDigest !== null) {
    throw new Error("preserve disposition cannot carry an approval digest.");
  }
  if (value.urlDisposition.kind === "change" && approvalDigest === null) {
    throw new Error("change disposition requires an approval digest.");
  }
  return {
    kind: value.kind as RefreshChanges["kind"],
    beforeArtifactDigest: normalizeDigest(
      value.beforeArtifactDigest,
      "changes.beforeArtifactDigest",
    ),
    afterArtifactDigest: normalizeDigest(
      value.afterArtifactDigest,
      "changes.afterArtifactDigest",
    ),
    changeDigest: normalizeDigest(value.changeDigest, "changes.changeDigest"),
    urlDisposition:
      value.urlDisposition.kind === "preserve"
        ? { kind: "preserve", approvalDigest: null }
        : { kind: "change", approvalDigest: approvalDigest as Sha256Digest },
  };
}

function assertReleaseBindingExactKeys(
  value: unknown,
): asserts value is Record<string, unknown> {
  assertRecord(value, "releaseBinding");
  assertExactKeys(
    value,
    [
      "dataMode",
      "workflowInstanceId",
      "releaseId",
      "artifactDigest",
      "reportDigest",
      "nonce",
      "state",
      "liveVerified",
      "contentApproval",
      "productionApproval",
      "deployment",
      "liveVerification",
      "rollback",
      "attestationDigest",
    ],
    "releaseBinding",
  );
  for (const approval of ["contentApproval", "productionApproval"] as const) {
    if (value[approval] != null) {
      assertRecord(value[approval], `releaseBinding.${approval}`);
      assertExactKeys(
        value[approval],
        ["principal", "approvedAt", "attestationDigest"],
        `releaseBinding.${approval}`,
      );
    }
  }
  if (value.deployment != null) {
    assertRecord(value.deployment, "releaseBinding.deployment");
    assertExactKeys(
      value.deployment,
      ["deploymentId", "destination", "deployedAt", "evidenceDigest"],
      "releaseBinding.deployment",
    );
  }
  if (value.liveVerification != null) {
    assertRecord(value.liveVerification, "releaseBinding.liveVerification");
    assertExactKeys(
      value.liveVerification,
      ["verifiedAt", "evidenceDigest", "checksPassed"],
      "releaseBinding.liveVerification",
    );
  }
  assertRecord(value.rollback, "releaseBinding.rollback");
  assertExactKeys(
    value.rollback,
    ["readiness", "verificationRequired", "planDigest"],
    "releaseBinding.rollback",
  );
}

function normalizeReleaseBinding(value: unknown): TrustedReleaseBinding {
  assertReleaseBindingExactKeys(value);
  if (!isTrustedPublicationReleaseBinding(value)) {
    throw new Error(
      "releaseBinding requires a trusted release binding from Ticket 38.",
    );
  }
  assertTrustedBindingShape(value);
  return value;
}

function normalizeBase(
  value: Record<string, unknown>,
  dataMode: PublicationDataMode,
): Pick<
  PublicationEventInput,
  | "version"
  | "eventId"
  | "dataMode"
  | "occurredAt"
  | "opportunity"
  | "evidence"
  | "artifact"
  | "releaseIdentity"
  | "releaseBinding"
  | "failureReasons"
> {
  return {
    version: PUBLICATION_EVENT_SCHEMA_VERSION,
    eventId: normalizeMachineId(value.eventId, "eventId"),
    dataMode,
    occurredAt: normalizePublicationTimestamp(
      value.occurredAt,
      "occurredAt",
      dataMode,
    ),
    opportunity: normalizeOpportunity(value.opportunity),
    evidence: normalizeEvidence(value.evidence),
    artifact: normalizeDigestPair(value.artifact, "artifact"),
    releaseIdentity: normalizeReleaseIdentity(value.releaseIdentity),
    releaseBinding: normalizeReleaseBinding(value.releaseBinding),
    failureReasons: normalizeStringList(
      value.failureReasons,
      "failureReasons",
      { allowEmpty: true },
    ),
  };
}

export function parsePublicationEvent(value: unknown): PublicationEventInput {
  assertRecord(value, "publication event");
  if (value.version !== PUBLICATION_EVENT_SCHEMA_VERSION) {
    throw new Error(
      `publication event.version must be ${PUBLICATION_EVENT_SCHEMA_VERSION}.`,
    );
  }
  const dataMode = normalizeDataMode(value.dataMode);
  const base = normalizeBase(value, dataMode);

  if (value.eventType === "first_high_intent_publication") {
    assertExactKeys(value, BASE_KEYS, "publication event");
    const event: HighIntentPublicationEventInput = {
      ...base,
      eventType: "first_high_intent_publication",
      candidate: normalizeHighIntentCandidate(value.candidate),
      quality: normalizeQuality<HighIntentQuality>(
        value.quality,
        HIGH_INTENT_QUALITY_KEYS,
        "quality",
      ),
    };
    return deepFreeze(event);
  }

  if (value.eventType === "first_refresh_publication") {
    assertExactKeys(
      value,
      [...BASE_KEYS, "articleUpgrade", "changes"],
      "publication event",
    );
    const event: RefreshPublicationEventInput = {
      ...base,
      eventType: "first_refresh_publication",
      candidate: normalizeRefreshCandidate(value.candidate),
      articleUpgrade: normalizeArticleUpgrade(value.articleUpgrade),
      changes: normalizeRefreshChanges(value.changes),
      quality: normalizeQuality<RefreshQuality>(
        value.quality,
        REFRESH_QUALITY_KEYS,
        "quality",
      ),
    };
    return deepFreeze(event);
  }

  throw new Error("publication event.eventType is invalid.");
}
