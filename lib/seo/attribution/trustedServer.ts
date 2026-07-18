// Server composition only; intentionally omitted from the browser-facing index.
import {
  assertExactKeys,
  canonicalizeTimestamp,
  deepFreeze,
  normalizeConsent,
  requireOpaqueEnquiryId,
  requireDataMode,
  serializeDeterministically,
  timestampMilliseconds,
} from "./canonical";
import {
  ATTRIBUTION_WINDOW_MS,
  type AttributionTrustBoundary,
  type AttributionTrustedConsentDecision,
  type AttributionTrustedServerAdapter,
  type AttributionTrustedSuccessfulEnquiryDecision,
} from "./types";
import { AttributionContractError } from "./types";

const PROOF_ID_PATTERN = /^proof_[A-Za-z0-9]{16,95}$/;
const ISSUER_PATTERN = /^[a-z0-9][a-z0-9._:-]{0,95}$/;
const boundaries = new WeakMap<object, AttributionTrustedServerAdapter>();

function requireIssuer(value: unknown, field: string): string {
  if (
    typeof value !== "string" ||
    !ISSUER_PATTERN.test(value) ||
    value.trim() !== value
  ) {
    throw new AttributionContractError(
      "untrusted-server-proof",
      `${field} must be a stable server issuer identifier.`,
    );
  }
  return value;
}

function requireProofId(value: unknown, field: string): string {
  if (typeof value !== "string" || !PROOF_ID_PATTERN.test(value)) {
    throw new AttributionContractError(
      "untrusted-server-proof",
      `${field} must be an opaque server proof identifier.`,
    );
  }
  return value;
}

function validateDecisionObject(value: unknown, field: string): void {
  // This also rejects class instances, null-prototype surprises, cycles, and
  // non-JSON values before the exact-key contract is evaluated.
  serializeDeterministically(value);
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    throw new AttributionContractError(
      "untrusted-server-proof",
      `${field} must be a plain object.`,
    );
  }
}

function resolveBoundary(
  boundary: AttributionTrustBoundary | null | undefined,
): AttributionTrustedServerAdapter {
  if (!boundary || typeof boundary !== "object") {
    throw new AttributionContractError(
      "untrusted-server-proof",
      "A server-created attribution trust boundary is required.",
    );
  }
  const adapter = boundaries.get(boundary as object);
  if (!adapter) {
    throw new AttributionContractError(
      "untrusted-server-proof",
      "The attribution trust boundary was not created by the server adapter.",
    );
  }
  return adapter;
}

export function createAttributionServerTrustBoundary(
  adapter: AttributionTrustedServerAdapter,
): AttributionTrustBoundary {
  if (!adapter || typeof adapter !== "object") {
    throw new AttributionContractError(
      "untrusted-server-proof",
      "A trusted server adapter is required.",
    );
  }
  if (Object.getPrototypeOf(adapter) !== Object.prototype) {
    throw new AttributionContractError(
      "untrusted-server-proof",
      "The trusted server adapter must be a plain object.",
    );
  }
  assertExactKeys(
    adapter,
    [
      "issuer",
      "observedAt",
      "verifyConsentProof",
      "verifySuccessfulEnquiryProof",
      "verifyPersistedConsentProof",
      "consumeSuccessfulEnquiryProof",
    ],
    "trustedServerAdapter",
  );
  const issuer = requireIssuer(adapter.issuer, "adapter.issuer");
  for (const [name, value] of Object.entries(adapter)) {
    if (name === "issuer") continue;
    if (typeof value !== "function") {
      throw new AttributionContractError(
        "untrusted-server-proof",
        `adapter.${name} must be a function.`,
      );
    }
  }
  const trustedAdapter = Object.freeze({
    issuer,
    observedAt: adapter.observedAt,
    verifyConsentProof: adapter.verifyConsentProof,
    verifySuccessfulEnquiryProof: adapter.verifySuccessfulEnquiryProof,
    verifyPersistedConsentProof: adapter.verifyPersistedConsentProof,
    consumeSuccessfulEnquiryProof: adapter.consumeSuccessfulEnquiryProof,
  }) satisfies AttributionTrustedServerAdapter;
  const boundary = Object.freeze({
    __attributionTrustBoundary: true as const,
  });
  boundaries.set(boundary, trustedAdapter);
  return boundary;
}

export function normalizeTrustedConsentReference(
  issuer: unknown,
  proofId: unknown,
): { readonly issuer: string; readonly proofId: string } {
  return deepFreeze({
    issuer: requireIssuer(issuer, "journey.privacy.consentIssuer"),
    proofId: requireProofId(proofId, "journey.privacy.consentProofId"),
  });
}

export function verifyTrustedPersistedConsentProof(
  boundary: AttributionTrustBoundary | null | undefined,
  reference: {
    readonly issuer: string;
    readonly proofId: string;
    readonly sessionId: string;
    readonly state: AttributionTrustedConsentDecision["state"];
    readonly version: AttributionTrustedConsentDecision["version"];
    readonly purpose: AttributionTrustedConsentDecision["purpose"];
    readonly retentionDays: AttributionTrustedConsentDecision["retentionDays"];
    readonly observedAt: string;
  },
): boolean {
  try {
    const adapter = resolveBoundary(boundary);
    const normalized = normalizeTrustedConsentReference(
      reference.issuer,
      reference.proofId,
    );
    const observedAt = canonicalizeTimestamp(
      reference.observedAt,
      "persistedConsentReference.observedAt",
    );
    return (
      normalized.issuer === adapter.issuer &&
      adapter.verifyPersistedConsentProof(
        deepFreeze({ ...reference, ...normalized, observedAt }),
      ) === true
    );
  } catch {
    return false;
  }
}

export function readTrustedObservationAt(
  boundary: AttributionTrustBoundary | null | undefined,
): {
  readonly adapter: AttributionTrustedServerAdapter;
  readonly observedAt: string;
} {
  const adapter = resolveBoundary(boundary);
  return {
    adapter,
    observedAt: canonicalizeTimestamp(
      adapter.observedAt(),
      "trustedObservedAt",
    ),
  };
}

export function verifyTrustedConsentProof(
  boundary: AttributionTrustBoundary | null | undefined,
  proof: unknown,
  sessionId: string,
  now: string,
): AttributionTrustedConsentDecision | null {
  let adapter: AttributionTrustedServerAdapter;
  try {
    adapter = resolveBoundary(boundary);
    const decision = adapter.verifyConsentProof(
      proof,
      deepFreeze({ sessionId, now }),
    );
    validateDecisionObject(decision, "trustedConsentDecision");
    assertExactKeys(
      decision,
      [
        "issuer",
        "proofId",
        "sessionId",
        "state",
        "version",
        "purpose",
        "retentionDays",
        "decidedAt",
        "validUntil",
      ],
      "trustedConsentDecision",
    );
    const consent = normalizeConsent({
      state: decision.state,
      version: decision.version,
      purpose: decision.purpose,
      retentionDays: decision.retentionDays,
    });
    const decidedAt = canonicalizeTimestamp(
      decision.decidedAt,
      "trustedConsentDecision.decidedAt",
    );
    const validUntil = canonicalizeTimestamp(
      decision.validUntil,
      "trustedConsentDecision.validUntil",
    );
    const nowMs = timestampMilliseconds(now, "now");
    const proofId = requireProofId(
      decision.proofId,
      "trustedConsentDecision.proofId",
    );
    if (
      decision.issuer !== adapter.issuer ||
      decision.sessionId !== sessionId ||
      timestampMilliseconds(decidedAt, "decidedAt") > nowMs ||
      timestampMilliseconds(validUntil, "validUntil") <= nowMs ||
      timestampMilliseconds(validUntil, "validUntil") !==
        timestampMilliseconds(decidedAt, "decidedAt") + ATTRIBUTION_WINDOW_MS
    ) {
      return null;
    }
    return deepFreeze({
      issuer: adapter.issuer,
      proofId,
      sessionId,
      ...consent,
      decidedAt,
      validUntil,
    });
  } catch {
    return null;
  }
}

export function verifyTrustedSuccessfulEnquiryProof(
  boundary: AttributionTrustBoundary | null | undefined,
  proof: unknown,
  sessionId: string,
  joinedAt: string,
): AttributionTrustedSuccessfulEnquiryDecision | null {
  let adapter: AttributionTrustedServerAdapter;
  try {
    adapter = resolveBoundary(boundary);
    const decision = adapter.verifySuccessfulEnquiryProof(
      proof,
      deepFreeze({ sessionId, joinedAt }),
    );
    validateDecisionObject(decision, "trustedSuccessfulEnquiryDecision");
    assertExactKeys(
      decision,
      ["issuer", "proofId", "sessionId", "enquiryId", "occurredAt", "dataMode"],
      "trustedSuccessfulEnquiryDecision",
    );
    const dataMode = requireDataMode(
      decision.dataMode,
      "trustedSuccessfulEnquiryDecision.dataMode",
    );
    const occurredAt = canonicalizeTimestamp(
      decision.occurredAt,
      "trustedSuccessfulEnquiryDecision.occurredAt",
    );
    const proofId = requireProofId(
      decision.proofId,
      "trustedSuccessfulEnquiryDecision.proofId",
    );
    if (
      decision.issuer !== adapter.issuer ||
      decision.sessionId !== sessionId ||
      dataMode !== "actual"
    ) {
      return null;
    }
    const enquiryId = requireOpaqueEnquiryId(decision.enquiryId, "actual");
    return deepFreeze({
      issuer: adapter.issuer,
      proofId,
      sessionId,
      enquiryId,
      occurredAt,
      dataMode: "actual",
    });
  } catch {
    return null;
  }
}

export function consumeTrustedSuccessfulEnquiryProof(
  boundary: AttributionTrustBoundary | null | undefined,
  proofId: string,
): boolean {
  try {
    return resolveBoundary(boundary).consumeSuccessfulEnquiryProof(proofId);
  } catch {
    return false;
  }
}
