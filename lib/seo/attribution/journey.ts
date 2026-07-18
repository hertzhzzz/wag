import {
  ATTRIBUTION_MAX_STORAGE_BYTES,
  type AttributionConsentMetadata,
  type AttributionJourneyPrivacy,
  ATTRIBUTION_PUBLIC_ROUTE_SCHEMA_VERSION,
  ATTRIBUTION_SCHEMA_VERSION,
  ATTRIBUTION_WINDOW_MS,
  type AttributionAllowlist,
  type AttributionCaptureInput,
  type AttributionCaptureReason,
  type AttributionCaptureResult,
  type AttributionDataMode,
  type AttributionJourneyRecord,
  type AttributionTouch,
  type SafeAttributionPayload,
} from "./types";
import {
  assertExactKeys,
  canonicalizeTimestamp,
  deepFreeze,
  isFutureTimestamp,
  normalizeAllowlist,
  normalizeConsent,
  requireOpaqueSessionId,
  requireDataMode,
  resolveAttributionRouteId,
  serializeDeterministically,
  timestampMilliseconds,
  touchKey,
  validateSchemaVersion,
  validateTouch,
} from "./canonical";
import { AttributionContractError } from "./types";
import {
  normalizeTrustedConsentReference,
  readTrustedObservationAt,
  verifyTrustedConsentProof,
  verifyTrustedPersistedConsentProof,
} from "./trustedServer";

type ConsentReference = Readonly<{
  issuer: string;
  proofId: string;
}> | null;

function compareTouches(
  left: AttributionTouch,
  right: AttributionTouch,
): number {
  const byTime =
    timestampMilliseconds(left.capturedAt, "capturedAt") -
    timestampMilliseconds(right.capturedAt, "capturedAt");
  if (byTime !== 0) return byTime;
  return touchKey(left).localeCompare(touchKey(right), "en");
}

function createJourneyFromTouches(
  touches: readonly AttributionTouch[],
  dataMode: AttributionDataMode,
  sessionId: string,
  consent: AttributionConsentMetadata,
  consentReference: ConsentReference,
): AttributionJourneyRecord {
  const sortedTouches = [...touches].sort(compareTouches);
  const ids = new Set<string>();
  for (const touch of sortedTouches) {
    if (ids.has(touch.touchId)) {
      throw new AttributionContractError(
        "duplicate-touch",
        "Journey touch identifiers must be unique.",
      );
    }
    ids.add(touch.touchId);
  }

  const nonDirect = sortedTouches.filter((touch) => touch.channel !== "direct");
  const firstTouch = nonDirect[0] ?? null;
  const assistedTouches = nonDirect.slice(1);
  const lastNonDirectPath = nonDirect.at(-1)?.path ?? null;
  const capturedAt = sortedTouches[0]?.capturedAt;
  if (!capturedAt) {
    throw new AttributionContractError(
      "empty-journey",
      "Journey must contain at least one touch.",
    );
  }
  const expiresAt = new Date(
    timestampMilliseconds(capturedAt, "journey.capturedAt") +
      ATTRIBUTION_WINDOW_MS,
  ).toISOString();

  return deepFreeze({
    schemaVersion: ATTRIBUTION_SCHEMA_VERSION,
    dataMode,
    sessionId,
    privacy: {
      consentState: consent.state,
      consentVersion: consent.version,
      purpose: consent.purpose,
      retentionDays: consent.retentionDays,
      consentIssuer: consentReference?.issuer ?? null,
      consentProofId: consentReference?.proofId ?? null,
    } satisfies AttributionJourneyPrivacy,
    capturedAt,
    expiresAt,
    firstTouch,
    assistedTouches,
    lastNonDirectPath,
    touches: sortedTouches,
  });
}

export function parseAttributionJourney(
  value: unknown,
  policy: AttributionAllowlist,
): AttributionJourneyRecord {
  const normalizedPolicy = normalizeAllowlist(policy);
  assertExactKeys(
    value,
    [
      "schemaVersion",
      "dataMode",
      "sessionId",
      "privacy",
      "capturedAt",
      "expiresAt",
      "firstTouch",
      "assistedTouches",
      "lastNonDirectPath",
      "touches",
    ],
    "journey",
  );
  validateSchemaVersion(value.schemaVersion);
  const dataMode = requireDataMode(value.dataMode, "journey.dataMode");
  const sessionId = requireOpaqueSessionId(value.sessionId, dataMode);
  if (typeof value.privacy !== "object" || value.privacy === null) {
    throw new AttributionContractError(
      "invalid-consent",
      "journey.privacy must be an explicit privacy metadata object.",
    );
  }
  const privacyValue = value.privacy as Record<string, unknown>;
  assertExactKeys(
    privacyValue,
    [
      "consentState",
      "consentVersion",
      "purpose",
      "retentionDays",
      "consentIssuer",
      "consentProofId",
    ],
    "journey.privacy",
  );
  const consent = normalizeConsent({
    state: privacyValue.consentState,
    version: privacyValue.consentVersion,
    purpose: privacyValue.purpose,
    retentionDays: privacyValue.retentionDays,
  });
  if (dataMode !== "dry_run" && consent.state !== "granted") {
    throw new AttributionContractError(
      "invalid-consent",
      "Stored actual attribution requires granted consent.",
    );
  }
  let consentReference: ConsentReference = null;
  if (dataMode === "actual") {
    consentReference = normalizeTrustedConsentReference(
      privacyValue.consentIssuer,
      privacyValue.consentProofId,
    );
  } else if (
    privacyValue.consentIssuer !== null ||
    privacyValue.consentProofId !== null
  ) {
    throw new AttributionContractError(
      "invalid-consent",
      "Only actual journeys may contain a trusted consent reference.",
    );
  }
  canonicalizeTimestamp(value.capturedAt, "journey.capturedAt");
  canonicalizeTimestamp(value.expiresAt, "journey.expiresAt");
  if (
    value.lastNonDirectPath !== null &&
    typeof value.lastNonDirectPath !== "string"
  ) {
    throw new AttributionContractError(
      "invalid-last-non-direct-path",
      "journey.lastNonDirectPath must be a pathname or null.",
    );
  }
  if (!Array.isArray(value.touches) || !Array.isArray(value.assistedTouches)) {
    throw new AttributionContractError(
      "invalid-touch-list",
      "Journey touch lists must be arrays.",
    );
  }
  const touches = value.touches.map((touch) =>
    validateTouch(touch, normalizedPolicy, dataMode),
  );
  const canonical = createJourneyFromTouches(
    touches,
    dataMode,
    sessionId,
    consent,
    consentReference,
  );

  const suppliedFirstTouch =
    value.firstTouch === null
      ? null
      : validateTouch(value.firstTouch, normalizedPolicy, dataMode);
  const suppliedAssisted = value.assistedTouches.map((touch) =>
    validateTouch(touch, normalizedPolicy, dataMode),
  );
  const suppliedProjection = {
    schemaVersion: value.schemaVersion,
    dataMode,
    sessionId,
    privacy: {
      consentState: consent.state,
      consentVersion: consent.version,
      purpose: consent.purpose,
      retentionDays: consent.retentionDays,
      consentIssuer: consentReference?.issuer ?? null,
      consentProofId: consentReference?.proofId ?? null,
    },
    capturedAt: canonicalizeTimestamp(value.capturedAt, "journey.capturedAt"),
    expiresAt: canonicalizeTimestamp(value.expiresAt, "journey.expiresAt"),
    firstTouch: suppliedFirstTouch,
    assistedTouches: suppliedAssisted,
    lastNonDirectPath: value.lastNonDirectPath,
    touches,
  };
  if (
    serializeDeterministically(suppliedProjection) !==
    serializeDeterministically(canonical)
  ) {
    throw new AttributionContractError(
      "journey-integrity",
      "Journey projections do not match the canonical touch sequence.",
    );
  }
  return canonical;
}

function skipped(reason: AttributionCaptureReason): AttributionCaptureResult {
  return { status: "skipped", record: null, reason };
}

function parseStoredJourney(
  raw: string,
  policy: AttributionAllowlist,
): AttributionJourneyRecord {
  if (
    new TextEncoder().encode(raw).byteLength > ATTRIBUTION_MAX_STORAGE_BYTES
  ) {
    throw new AttributionContractError(
      "storage-size",
      "Stored attribution exceeds the size limit.",
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new AttributionContractError(
      "storage-json",
      "Stored attribution is not valid JSON.",
    );
  }
  return parseAttributionJourney(parsed, policy);
}

export function captureAttributionTouch(
  input: AttributionCaptureInput,
): AttributionCaptureResult {
  let dataMode: AttributionDataMode;
  let sessionId: string;
  let now: string;
  try {
    dataMode = requireDataMode(input.dataMode);
    sessionId = requireOpaqueSessionId(input.sessionId, dataMode);
    now = canonicalizeTimestamp(input.now, "now");
  } catch {
    return skipped("invalid-consent");
  }

  let consent: AttributionConsentMetadata;
  let consentReference: ConsentReference = null;
  let trustedConsentDecidedAt: string | null = null;
  let trustedObservedAt: string | null = null;
  if (dataMode === "actual") {
    if (input.consent !== undefined || input.consentProof === undefined) {
      return skipped("untrusted-consent");
    }
    try {
      const trusted = readTrustedObservationAt(input.trustBoundary);
      trustedObservedAt = trusted.observedAt;
      if (isFutureTimestamp(now, trustedObservedAt)) {
        return skipped("untrusted-time-boundary");
      }
    } catch {
      return skipped("untrusted-consent");
    }
    const decision = verifyTrustedConsentProof(
      input.trustBoundary,
      input.consentProof,
      sessionId,
      trustedObservedAt ?? now,
    );
    if (!decision) return skipped("untrusted-consent");
    consent = normalizeConsent({
      state: decision.state,
      version: decision.version,
      purpose: decision.purpose,
      retentionDays: decision.retentionDays,
    });
    consentReference = {
      issuer: decision.issuer,
      proofId: decision.proofId,
    };
    trustedConsentDecidedAt = decision.decidedAt;
  } else {
    try {
      consent = normalizeConsent(input.consent);
    } catch {
      return skipped("invalid-consent");
    }
  }

  if (dataMode !== "dry_run") {
    if (consent.state === "denied") return skipped("consent-denied");
    if (consent.state !== "granted") return skipped("consent-unavailable");
    if (!input.storage) return skipped("storage-unavailable");
  }

  let policy: AttributionAllowlist;
  let touch: AttributionTouch;
  try {
    policy = normalizeAllowlist(input.policy);
    touch = validateTouch(input.touch, policy, dataMode);
  } catch {
    return skipped("invalid-touch");
  }

  if (
    dataMode !== "synthetic_fixture" &&
    isFutureTimestamp(touch.capturedAt, now)
  ) {
    return skipped("future-timestamp");
  }
  const observationBoundary = trustedObservedAt ?? now;
  if (
    timestampMilliseconds(touch.capturedAt, "touch.capturedAt") +
      ATTRIBUTION_WINDOW_MS <=
    timestampMilliseconds(observationBoundary, "observationBoundary")
  ) {
    return skipped("outside-window");
  }
  if (
    trustedConsentDecidedAt &&
    timestampMilliseconds(touch.capturedAt, "touch.capturedAt") <
      timestampMilliseconds(trustedConsentDecidedAt, "trustedConsentDecidedAt")
  ) {
    return skipped("untrusted-consent");
  }

  if (dataMode === "dry_run") {
    return {
      status: "preview",
      record: createJourneyFromTouches(
        [touch],
        dataMode,
        sessionId,
        consent,
        consentReference,
      ),
      reason: "dry-run-no-storage-io",
    };
  }

  const storage = input.storage;
  if (!storage) return skipped("storage-unavailable");

  let raw: string | null;
  try {
    raw = storage.read();
  } catch {
    return skipped("storage-unavailable");
  }

  let existing: AttributionJourneyRecord | null = null;
  if (raw !== null) {
    try {
      existing = parseStoredJourney(raw, policy);
    } catch {
      return skipped("storage-corrupt");
    }
    if (existing.dataMode !== dataMode) return skipped("storage-corrupt");
  }

  const expiredExisting = Boolean(
    existing &&
    timestampMilliseconds(existing.expiresAt, "journey.expiresAt") <=
      timestampMilliseconds(observationBoundary, "observationBoundary"),
  );
  if (expiredExisting) existing = null;
  if (existing && existing.sessionId !== sessionId) {
    return skipped("session-mismatch");
  }
  if (
    existing &&
    dataMode === "actual" &&
    !verifyTrustedPersistedConsentProof(input.trustBoundary, {
      issuer: existing.privacy.consentIssuer ?? "",
      proofId: existing.privacy.consentProofId ?? "",
      sessionId: existing.sessionId,
      state: existing.privacy.consentState,
      version: existing.privacy.consentVersion,
      purpose: existing.privacy.purpose,
      retentionDays: existing.privacy.retentionDays,
      observedAt: observationBoundary,
    })
  ) {
    return skipped("untrusted-consent");
  }

  if (
    existing?.touches.some((candidate) => candidate.touchId === touch.touchId)
  ) {
    return skipped("duplicate-touch");
  }
  if (existing) {
    const windowStart = timestampMilliseconds(
      existing.capturedAt,
      "journey.capturedAt",
    );
    const windowEnd = timestampMilliseconds(
      existing.expiresAt,
      "journey.expiresAt",
    );
    const touchTime = timestampMilliseconds(
      touch.capturedAt,
      "touch.capturedAt",
    );
    if (touchTime < windowStart || touchTime >= windowEnd)
      return skipped("outside-window");
  }

  let record: AttributionJourneyRecord;
  try {
    record = createJourneyFromTouches(
      existing ? [...existing.touches, touch] : [touch],
      dataMode,
      sessionId,
      consent,
      consentReference,
    );
    const serialized = serializeDeterministically(record);
    if (
      new TextEncoder().encode(serialized).byteLength >
      ATTRIBUTION_MAX_STORAGE_BYTES
    ) {
      return skipped("storage-size");
    }
    storage.write(serialized);
  } catch {
    return skipped("write-failed");
  }

  return {
    status: "stored",
    record,
    reason: expiredExisting
      ? "expired-record-replaced"
      : existing
        ? "updated"
        : "new",
  };
}

export function buildSafeAttributionPayloads(
  journey: unknown,
  policy: AttributionAllowlist,
): readonly SafeAttributionPayload[] {
  const record = parseAttributionJourney(journey, policy);
  if (record.privacy.consentState !== "granted") return deepFreeze([]);
  const payloads: SafeAttributionPayload[] = [];
  if (record.firstTouch) {
    payloads.push({
      event: "content_touch",
      touchRole: "first_touch",
      capturedAt: record.firstTouch.capturedAt,
      channel: record.firstTouch.channel,
      routeSchemaVersion: ATTRIBUTION_PUBLIC_ROUTE_SCHEMA_VERSION,
      routeId: resolveAttributionRouteId(record.firstTouch.path, policy),
      campaign: record.firstTouch.campaign,
      cluster: record.firstTouch.cluster,
      article: record.firstTouch.article,
      funnel: record.firstTouch.funnel,
    });
  }
  for (const touch of record.assistedTouches) {
    payloads.push({
      event: "content_touch",
      touchRole: "assisted_touch",
      capturedAt: touch.capturedAt,
      channel: touch.channel,
      routeSchemaVersion: ATTRIBUTION_PUBLIC_ROUTE_SCHEMA_VERSION,
      routeId: resolveAttributionRouteId(touch.path, policy),
      campaign: touch.campaign,
      cluster: touch.cluster,
      article: touch.article,
      funnel: touch.funnel,
    });
  }
  return deepFreeze(payloads);
}

export function serializeAttributionJourney(
  journey: unknown,
  policy: AttributionAllowlist,
): string {
  return serializeDeterministically(parseAttributionJourney(journey, policy));
}
