import {
  ATTRIBUTION_SCHEMA_VERSION,
  type AttributionAllowlist,
  type AttributionDataMode,
  type AttributionJoin,
  type AttributionJoinResult,
  type AttributionTrustBoundary,
  type AttributionTouch,
  type SuccessfulEnquiryInput,
} from "./types";
import {
  assertExactKeys,
  canonicalizeTimestamp,
  deepFreeze,
  isFutureTimestamp,
  normalizeAllowlist,
  requireDataMode,
  requireOpaqueEnquiryId,
  serializeDeterministically,
  timestampMilliseconds,
  touchKey,
  validateAttributionPath,
  validateSchemaVersion,
  validateTouch,
} from "./canonical";
import { parseAttributionJourney } from "./journey";
import { AttributionContractError } from "./types";
import {
  consumeTrustedSuccessfulEnquiryProof,
  readTrustedObservationAt,
  verifyTrustedPersistedConsentProof,
  verifyTrustedSuccessfulEnquiryProof,
} from "./trustedServer";

function parseSuccessfulEnquiry(value: unknown): SuccessfulEnquiryInput {
  assertExactKeys(
    value,
    ["enquiryId", "occurredAt", "dataMode"],
    "successfulEnquiry",
  );
  const dataMode = requireDataMode(
    value.dataMode,
    "successfulEnquiry.dataMode",
  );
  return deepFreeze({
    enquiryId: requireOpaqueEnquiryId(value.enquiryId, dataMode),
    occurredAt: canonicalizeTimestamp(
      value.occurredAt,
      "successfulEnquiry.occurredAt",
    ),
    dataMode,
  });
}

function invalidJoin(
  reason:
    | "invalid-journey"
    | "invalid-enquiry"
    | "untrusted-enquiry-proof"
    | "untrusted-journey-proof"
    | "untrusted-time-boundary",
): AttributionJoinResult {
  return { status: "skipped", join: null, reason };
}

export function joinAttributionToSuccessfulEnquiry(input: {
  readonly journey: unknown;
  readonly successfulEnquiry?: unknown;
  readonly successfulEnquiryProof?: unknown;
  readonly trustBoundary?: AttributionTrustBoundary | null;
  readonly scope: "server-reporting";
  readonly joinedAt: string;
  readonly reportDataMode: AttributionDataMode;
  readonly policy: AttributionAllowlist;
}): AttributionJoinResult {
  if (input.scope !== "server-reporting") {
    return invalidJoin("invalid-enquiry");
  }

  let policy: AttributionAllowlist;
  try {
    policy = normalizeAllowlist(input.policy);
  } catch {
    return invalidJoin("invalid-journey");
  }

  let reportDataMode: AttributionDataMode;
  try {
    reportDataMode = requireDataMode(input.reportDataMode, "reportDataMode");
  } catch {
    return invalidJoin("invalid-enquiry");
  }

  let joinedAt: string;
  try {
    joinedAt = canonicalizeTimestamp(input.joinedAt, "joinedAt");
  } catch {
    return invalidJoin("invalid-enquiry");
  }

  let journey: ReturnType<typeof parseAttributionJourney>;
  try {
    journey = parseAttributionJourney(input.journey, policy);
  } catch {
    return invalidJoin("invalid-journey");
  }

  if (reportDataMode === "actual") {
    if (journey.dataMode === "synthetic_fixture") {
      return {
        status: "skipped",
        join: null,
        reason: "fixture-not-allowed-for-actual",
      };
    }
    if (journey.dataMode !== "actual") {
      return { status: "skipped", join: null, reason: "mode-mismatch" };
    }
  }

  let successfulEnquiry: SuccessfulEnquiryInput;
  let successfulEnquiryProofId: string | null = null;
  let trustedObservedAt: string | null = null;
  if (reportDataMode === "actual") {
    if (
      input.successfulEnquiry !== undefined ||
      input.successfulEnquiryProof === undefined
    ) {
      return invalidJoin("untrusted-enquiry-proof");
    }
    try {
      const trusted = readTrustedObservationAt(input.trustBoundary);
      trustedObservedAt = trusted.observedAt;
      if (isFutureTimestamp(joinedAt, trustedObservedAt)) {
        return invalidJoin("untrusted-time-boundary");
      }
    } catch {
      return invalidJoin("untrusted-enquiry-proof");
    }
    if (
      !verifyTrustedPersistedConsentProof(input.trustBoundary, {
        issuer: journey.privacy.consentIssuer ?? "",
        proofId: journey.privacy.consentProofId ?? "",
        sessionId: journey.sessionId,
        state: journey.privacy.consentState,
        version: journey.privacy.consentVersion,
        purpose: journey.privacy.purpose,
        retentionDays: journey.privacy.retentionDays,
        observedAt: trustedObservedAt ?? joinedAt,
      })
    ) {
      return invalidJoin("untrusted-journey-proof");
    }
    const decision = verifyTrustedSuccessfulEnquiryProof(
      input.trustBoundary,
      input.successfulEnquiryProof,
      journey.sessionId,
      joinedAt,
    );
    if (!decision) return invalidJoin("untrusted-enquiry-proof");
    successfulEnquiry = decision;
    successfulEnquiryProofId = decision.proofId;
  } else {
    try {
      successfulEnquiry = parseSuccessfulEnquiry(input.successfulEnquiry);
    } catch {
      return invalidJoin("invalid-enquiry");
    }
    if (
      journey.dataMode !== reportDataMode ||
      successfulEnquiry.dataMode !== reportDataMode
    ) {
      return { status: "skipped", join: null, reason: "mode-mismatch" };
    }
  }

  if (isFutureTimestamp(successfulEnquiry.occurredAt, joinedAt)) {
    return { status: "skipped", join: null, reason: "future-timestamp" };
  }
  if (
    journey.touches.some((touch) =>
      isFutureTimestamp(touch.capturedAt, successfulEnquiry.occurredAt),
    )
  ) {
    return { status: "skipped", join: null, reason: "future-timestamp" };
  }
  if (
    timestampMilliseconds(successfulEnquiry.occurredAt, "occurredAt") >=
    timestampMilliseconds(journey.expiresAt, "journey.expiresAt")
  ) {
    return { status: "skipped", join: null, reason: "expired" };
  }

  if (
    successfulEnquiryProofId &&
    !consumeTrustedSuccessfulEnquiryProof(
      input.trustBoundary,
      successfulEnquiryProofId,
    )
  ) {
    return {
      status: "skipped",
      join: null,
      reason: "replayed-enquiry-proof",
    };
  }

  const join: AttributionJoin = deepFreeze({
    schemaVersion: ATTRIBUTION_SCHEMA_VERSION,
    dataMode: reportDataMode,
    enquiryId: successfulEnquiry.enquiryId,
    scope: "server-reporting",
    joinedAt,
    firstTouch: journey.firstTouch,
    assistedTouches: journey.assistedTouches,
    lastNonDirectPath: journey.lastNonDirectPath,
  });
  return { status: "joined", join };
}

function assertNonDirectTouch(
  touch: AttributionTouch,
  field: string,
): AttributionTouch {
  if (touch.channel === "direct") {
    throw new AttributionContractError(
      "invalid-join-touch",
      `${field} must be a non-direct touch.`,
    );
  }
  return touch;
}

function assertOrderedUniqueTouches(
  touches: readonly AttributionTouch[],
): void {
  const ids = new Set<string>();
  for (let index = 0; index < touches.length; index += 1) {
    const touch = touches[index];
    if (ids.has(touch.touchId)) {
      throw new AttributionContractError(
        "duplicate-touch",
        "attributionJoin touch identifiers must be unique.",
      );
    }
    ids.add(touch.touchId);
    if (index === 0) continue;

    const previous = touches[index - 1];
    const previousTime = timestampMilliseconds(
      previous.capturedAt,
      "attributionJoin.touch.capturedAt",
    );
    const currentTime = timestampMilliseconds(
      touch.capturedAt,
      "attributionJoin.touch.capturedAt",
    );
    if (
      previousTime > currentTime ||
      (previousTime === currentTime &&
        touchKey(previous).localeCompare(touchKey(touch), "en") >= 0)
    ) {
      throw new AttributionContractError(
        "join-order",
        "attributionJoin touches must use canonical chronological order.",
      );
    }
  }
}

export function parseAttributionJoin(
  value: unknown,
  policy: AttributionAllowlist,
): AttributionJoin {
  const normalizedPolicy = normalizeAllowlist(policy);
  assertExactKeys(
    value,
    [
      "schemaVersion",
      "dataMode",
      "enquiryId",
      "scope",
      "joinedAt",
      "firstTouch",
      "assistedTouches",
      "lastNonDirectPath",
    ],
    "attributionJoin",
  );
  validateSchemaVersion(value.schemaVersion);
  const dataMode = requireDataMode(value.dataMode, "attributionJoin.dataMode");
  const enquiryId = requireOpaqueEnquiryId(value.enquiryId, dataMode);
  if (value.scope !== "server-reporting") {
    throw new AttributionContractError(
      "invalid-join",
      "attributionJoin.scope must be server-reporting.",
    );
  }
  const joinedAt = canonicalizeTimestamp(
    value.joinedAt,
    "attributionJoin.joinedAt",
  );
  if (!Array.isArray(value.assistedTouches)) {
    throw new AttributionContractError(
      "invalid-join",
      "attributionJoin.assistedTouches must be an array.",
    );
  }

  const firstTouch =
    value.firstTouch === null
      ? null
      : assertNonDirectTouch(
          validateTouch(value.firstTouch, normalizedPolicy, dataMode),
          "attributionJoin.firstTouch",
        );
  const assistedTouches = value.assistedTouches.map((touch, index) =>
    assertNonDirectTouch(
      validateTouch(touch, normalizedPolicy, dataMode),
      `attributionJoin.assistedTouches[${index}]`,
    ),
  );
  if (firstTouch === null && assistedTouches.length > 0) {
    throw new AttributionContractError(
      "invalid-join-projection",
      "attributionJoin.assistedTouches requires a firstTouch.",
    );
  }
  const orderedTouches = firstTouch
    ? [firstTouch, ...assistedTouches]
    : ([] as AttributionTouch[]);
  assertOrderedUniqueTouches(orderedTouches);

  const lastNonDirectPath =
    value.lastNonDirectPath === null
      ? null
      : validateAttributionPath(
          value.lastNonDirectPath,
          normalizedPolicy,
          "attributionJoin.lastNonDirectPath",
        );
  const expectedLastPath = orderedTouches.at(-1)?.path ?? null;
  if (lastNonDirectPath !== expectedLastPath) {
    throw new AttributionContractError(
      "invalid-join-projection",
      "attributionJoin.lastNonDirectPath must match the final non-direct touch.",
    );
  }

  return deepFreeze({
    schemaVersion: ATTRIBUTION_SCHEMA_VERSION,
    dataMode,
    enquiryId,
    scope: "server-reporting",
    joinedAt,
    firstTouch,
    assistedTouches,
    lastNonDirectPath,
  });
}

export function serializeAttributionJoin(
  join: unknown,
  policy: AttributionAllowlist,
): string {
  return serializeDeterministically(parseAttributionJoin(join, policy));
}
