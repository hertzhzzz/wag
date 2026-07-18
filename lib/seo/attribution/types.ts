export const ATTRIBUTION_SCHEMA_VERSION = "seo-attribution-v1" as const;
export const ATTRIBUTION_PUBLIC_ROUTE_SCHEMA_VERSION =
  "public-route-v1" as const;
export const ATTRIBUTION_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
export const ATTRIBUTION_MAX_STORAGE_BYTES = 16_384;
export const ATTRIBUTION_CONSENT_VERSION =
  "seo-attribution-consent-v1" as const;
export const ATTRIBUTION_PURPOSE = "content-to-enquiry-attribution" as const;
export const ATTRIBUTION_RETENTION_DAYS = 90 as const;

export const ATTRIBUTION_DATA_MODES = [
  "actual",
  "synthetic_fixture",
  "dry_run",
] as const;
export type AttributionDataMode = (typeof ATTRIBUTION_DATA_MODES)[number];

export const ATTRIBUTION_CONSENT_STATES = [
  "granted",
  "denied",
  "unavailable",
] as const;
export type AttributionConsentState =
  (typeof ATTRIBUTION_CONSENT_STATES)[number];

export interface AttributionConsentMetadata {
  readonly state: AttributionConsentState;
  readonly version: typeof ATTRIBUTION_CONSENT_VERSION;
  readonly purpose: typeof ATTRIBUTION_PURPOSE;
  readonly retentionDays: typeof ATTRIBUTION_RETENTION_DAYS;
}

export interface AttributionJourneyPrivacy {
  readonly consentState: AttributionConsentState;
  readonly consentVersion: typeof ATTRIBUTION_CONSENT_VERSION;
  readonly purpose: typeof ATTRIBUTION_PURPOSE;
  readonly retentionDays: typeof ATTRIBUTION_RETENTION_DAYS;
  readonly consentIssuer: string | null;
  readonly consentProofId: string | null;
}

export const ATTRIBUTION_CHANNELS = [
  "organic",
  "paid",
  "referral",
  "direct",
] as const;
export type AttributionChannel = (typeof ATTRIBUTION_CHANNELS)[number];

export const ATTRIBUTION_EVENTS = ["landing", "content_view"] as const;
export type AttributionEvent = (typeof ATTRIBUTION_EVENTS)[number];

export type AttributionTouchRole = "first_touch" | "assisted_touch";

export interface AttributionAllowlist {
  readonly campaigns: readonly string[];
  readonly clusters: readonly string[];
  readonly articles: readonly string[];
  readonly funnels: readonly string[];
}

export interface AttributionTouchInput {
  readonly touchId: string;
  readonly capturedAt: string;
  readonly channel: AttributionChannel;
  readonly event: AttributionEvent;
  readonly path: string;
  readonly campaign: string | null;
  readonly cluster: string | null;
  readonly article: string | null;
  readonly funnel: string | null;
}

export interface AttributionTouch extends AttributionTouchInput {
  readonly capturedAt: string;
}

export interface AttributionJourneyRecord {
  readonly schemaVersion: typeof ATTRIBUTION_SCHEMA_VERSION;
  readonly dataMode: AttributionDataMode;
  readonly sessionId: string;
  readonly privacy: AttributionJourneyPrivacy;
  readonly capturedAt: string;
  readonly expiresAt: string;
  readonly firstTouch: AttributionTouch | null;
  readonly assistedTouches: readonly AttributionTouch[];
  readonly lastNonDirectPath: string | null;
  readonly touches: readonly AttributionTouch[];
}

export interface AttributionStorage {
  read(): string | null;
  write(serialized: string): void;
}

export interface AttributionTrustedConsentDecision {
  readonly issuer: string;
  readonly proofId: string;
  readonly sessionId: string;
  readonly state: AttributionConsentState;
  readonly version: typeof ATTRIBUTION_CONSENT_VERSION;
  readonly purpose: typeof ATTRIBUTION_PURPOSE;
  readonly retentionDays: typeof ATTRIBUTION_RETENTION_DAYS;
  readonly decidedAt: string;
  readonly validUntil: string;
}

export interface AttributionTrustedSuccessfulEnquiryDecision {
  readonly issuer: string;
  readonly proofId: string;
  readonly sessionId: string;
  readonly enquiryId: string;
  readonly occurredAt: string;
  readonly dataMode: "actual";
}

export interface AttributionTrustedServerAdapter {
  readonly issuer: string;
  readonly observedAt: () => string;
  readonly verifyConsentProof: (
    proof: unknown,
    expected: { readonly sessionId: string; readonly now: string },
  ) => unknown;
  readonly verifySuccessfulEnquiryProof: (
    proof: unknown,
    expected: { readonly sessionId: string; readonly joinedAt: string },
  ) => unknown;
  readonly verifyPersistedConsentProof: (reference: {
    readonly issuer: string;
    readonly proofId: string;
    readonly sessionId: string;
    readonly state: AttributionConsentState;
    readonly version: typeof ATTRIBUTION_CONSENT_VERSION;
    readonly purpose: typeof ATTRIBUTION_PURPOSE;
    readonly retentionDays: typeof ATTRIBUTION_RETENTION_DAYS;
    readonly observedAt: string;
  }) => boolean;
  readonly consumeSuccessfulEnquiryProof: (proofId: string) => boolean;
}

export interface AttributionTrustBoundary {
  readonly __attributionTrustBoundary: true;
}

export interface AttributionCaptureInput {
  readonly now: string;
  readonly dataMode: AttributionDataMode;
  readonly sessionId: string;
  readonly consent?: AttributionConsentMetadata;
  readonly consentProof?: unknown;
  readonly trustBoundary?: AttributionTrustBoundary | null;
  readonly storage: AttributionStorage | null;
  readonly policy: AttributionAllowlist;
  readonly touch: unknown;
}

export type AttributionCaptureReason =
  | "consent-denied"
  | "consent-unavailable"
  | "invalid-consent"
  | "untrusted-consent"
  | "untrusted-time-boundary"
  | "session-mismatch"
  | "storage-unavailable"
  | "storage-corrupt"
  | "storage-size"
  | "invalid-touch"
  | "future-timestamp"
  | "outside-window"
  | "duplicate-touch"
  | "write-failed";

export type AttributionCaptureResult =
  | {
      readonly status: "preview";
      readonly record: AttributionJourneyRecord;
      readonly reason: "dry-run-no-storage-io";
    }
  | {
      readonly status: "stored";
      readonly record: AttributionJourneyRecord;
      readonly reason: "new" | "updated" | "expired-record-replaced";
    }
  | {
      readonly status: "skipped";
      readonly record: null;
      readonly reason: AttributionCaptureReason;
    };

export interface SafeAttributionPayload {
  readonly event: "content_touch";
  readonly touchRole: AttributionTouchRole;
  readonly capturedAt: string;
  readonly channel: AttributionChannel;
  readonly routeSchemaVersion: typeof ATTRIBUTION_PUBLIC_ROUTE_SCHEMA_VERSION;
  readonly routeId: `article:${string}` | "funnel:enquiry";
  readonly campaign: string | null;
  readonly cluster: string | null;
  readonly article: string | null;
  readonly funnel: string | null;
}

export interface SuccessfulEnquiryInput {
  readonly enquiryId: string;
  readonly occurredAt: string;
  readonly dataMode: AttributionDataMode;
}

export interface AttributionJoin {
  readonly scope: "server-reporting";
  readonly schemaVersion: typeof ATTRIBUTION_SCHEMA_VERSION;
  readonly dataMode: AttributionDataMode;
  readonly enquiryId: string;
  readonly joinedAt: string;
  readonly firstTouch: AttributionTouch | null;
  readonly assistedTouches: readonly AttributionTouch[];
  readonly lastNonDirectPath: string | null;
}

export type AttributionJoinReason =
  | "invalid-journey"
  | "invalid-enquiry"
  | "future-timestamp"
  | "expired"
  | "fixture-not-allowed-for-actual"
  | "mode-mismatch"
  | "untrusted-enquiry-proof"
  | "untrusted-journey-proof"
  | "untrusted-time-boundary"
  | "replayed-enquiry-proof";

export type AttributionJoinResult =
  | { readonly status: "joined"; readonly join: AttributionJoin }
  | {
      readonly status: "skipped";
      readonly join: null;
      readonly reason: AttributionJoinReason;
    };

export class AttributionContractError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AttributionContractError";
    this.code = code;
  }
}
