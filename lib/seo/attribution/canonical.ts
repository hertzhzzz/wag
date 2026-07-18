import {
  ATTRIBUTION_CHANNELS,
  ATTRIBUTION_DATA_MODES,
  ATTRIBUTION_EVENTS,
  ATTRIBUTION_SCHEMA_VERSION,
  ATTRIBUTION_CONSENT_VERSION,
  ATTRIBUTION_PURPOSE,
  ATTRIBUTION_RETENTION_DAYS,
  ATTRIBUTION_CONSENT_STATES,
  type AttributionAllowlist,
  type AttributionDataMode,
  type AttributionConsentMetadata,
  type AttributionTouch,
} from "./types";
import { AttributionContractError } from "./types";

const RFC3339_WITH_ZONE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const LEGACY_OPAQUE_ID_PATTERN =
  /^(?:enq|touch|session)_[A-Za-z0-9][A-Za-z0-9_-]{7,95}$/;
const HIGH_ENTROPY_OPAQUE_SUFFIX_PATTERN = /^[A-Za-z0-9]{16,95}$/;
const HUMAN_SEMANTIC_OPAQUE_RUN_PATTERN = /(?:[A-Za-z]{5,}|[0-9]{7,})/;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9._-]{0,95}$/;
const SENSITIVE_KEY_PATTERN =
  /(?:name|email|phone|telephone|company|message|brief|product|address|free.?text|contact)/i;

export type AnyRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepFreeze<T>(value: T): T {
  const seen = new WeakSet<object>();

  function freeze(current: unknown): void {
    if (current === null || typeof current !== "object") return;
    if (seen.has(current) || Object.isFrozen(current)) return;
    seen.add(current);
    for (const nested of Object.values(current as Record<string, unknown>)) {
      freeze(nested);
    }
    Object.freeze(current);
  }

  freeze(value);
  return value;
}

export function assertExactKeys(
  value: unknown,
  expectedKeys: readonly string[],
  field: string,
): asserts value is AnyRecord {
  if (!isRecord(value)) {
    throw new AttributionContractError(
      "invalid-object",
      `${field} must be an object.`,
    );
  }
  const expected = new Set(expectedKeys);
  const actual = Object.keys(value);
  const unknown = actual.filter((key) => !expected.has(key));
  const missing = expectedKeys.filter(
    (key) => !Object.prototype.hasOwnProperty.call(value, key),
  );
  if (unknown.length > 0 || missing.length > 0) {
    throw new AttributionContractError(
      "unknown-or-missing-key",
      `${field} must contain exactly the approved keys.`,
    );
  }
  for (const key of actual) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      throw new AttributionContractError(
        "sensitive-key",
        `${field} contains a prohibited field.`,
      );
    }
  }
}

function requireNonEmptyString(
  value: unknown,
  field: string,
  maxLength: number,
): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.trim() !== value
  ) {
    throw new AttributionContractError(
      "invalid-string",
      `${field} must be a trimmed string.`,
    );
  }
  if (value.length > maxLength || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new AttributionContractError(
      "invalid-string",
      `${field} is outside the allowed format.`,
    );
  }
  return value;
}

export function canonicalizeTimestamp(value: unknown, field: string): string {
  const input = requireNonEmptyString(value, field, 64);
  if (!RFC3339_WITH_ZONE.test(input)) {
    throw new AttributionContractError(
      "invalid-timestamp",
      `${field} must be RFC 3339 with an explicit timezone.`,
    );
  }
  const milliseconds = Date.parse(input);
  if (!Number.isFinite(milliseconds)) {
    throw new AttributionContractError(
      "invalid-timestamp",
      `${field} is not a valid timestamp.`,
    );
  }
  return new Date(milliseconds).toISOString();
}

export function timestampMilliseconds(value: string, field: string): number {
  const canonical = canonicalizeTimestamp(value, field);
  const milliseconds = Date.parse(canonical);
  if (!Number.isFinite(milliseconds)) {
    throw new AttributionContractError(
      "invalid-timestamp",
      `${field} is not a valid timestamp.`,
    );
  }
  return milliseconds;
}

function requireEnum<T extends string>(
  value: unknown,
  values: readonly T[],
  field: string,
): T {
  if (typeof value !== "string" || !values.includes(value as T)) {
    throw new AttributionContractError(
      "invalid-enum",
      `${field} is not approved.`,
    );
  }
  return value as T;
}

function normalizeAllowlistValues(
  values: readonly string[],
  field: string,
): readonly string[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new AttributionContractError(
      "invalid-allowlist",
      `${field} must not be empty.`,
    );
  }
  const normalized = values.map((value) => {
    const item = requireNonEmptyString(value, field, 96);
    if (!SLUG_PATTERN.test(item)) {
      throw new AttributionContractError(
        "invalid-allowlist",
        `${field} contains an invalid value.`,
      );
    }
    return item;
  });
  if (new Set(normalized).size !== normalized.length) {
    throw new AttributionContractError(
      "invalid-allowlist",
      `${field} must contain unique values.`,
    );
  }
  return Object.freeze([...normalized].sort());
}

export function normalizeAllowlist(
  input: AttributionAllowlist,
): AttributionAllowlist {
  if (!isRecord(input)) {
    throw new AttributionContractError(
      "invalid-allowlist",
      "policy must be an object.",
    );
  }
  assertExactKeys(
    input,
    ["campaigns", "clusters", "articles", "funnels"],
    "policy",
  );
  return deepFreeze({
    campaigns: normalizeAllowlistValues(
      input.campaigns as readonly string[],
      "campaigns",
    ),
    clusters: normalizeAllowlistValues(
      input.clusters as readonly string[],
      "clusters",
    ),
    articles: normalizeAllowlistValues(
      input.articles as readonly string[],
      "articles",
    ),
    funnels: normalizeAllowlistValues(
      input.funnels as readonly string[],
      "funnels",
    ),
  });
}

function requireNullableSlug(
  value: unknown,
  field: string,
  approvedValues: readonly string[],
): string | null {
  if (value === null) return null;
  const item = requireNonEmptyString(value, field, 96);
  if (!SLUG_PATTERN.test(item) || !approvedValues.includes(item)) {
    throw new AttributionContractError(
      "unapproved-value",
      `${field} is not approved.`,
    );
  }
  return item;
}

export function resolveAttributionRouteId(
  value: unknown,
  policy: AttributionAllowlist,
  field = "touch.path",
): `article:${string}` | "funnel:enquiry" {
  const path = requireNonEmptyString(value, field, 200);
  const normalizedPolicy = normalizeAllowlist(policy);
  if (path === "/enquiry") return "funnel:enquiry";

  const articlePrefix = "/resources/";
  if (!path.startsWith(articlePrefix)) {
    throw new AttributionContractError(
      "unapproved-public-route",
      `${field} is not in the public-route-v1 allowlist.`,
    );
  }
  const article = path.slice(articlePrefix.length);
  if (!normalizedPolicy.articles.includes(article)) {
    throw new AttributionContractError(
      "unapproved-public-route",
      `${field} is not in the public-route-v1 allowlist.`,
    );
  }
  return `article:${article}`;
}

export function validateAttributionPath(
  value: unknown,
  policy: AttributionAllowlist,
  field = "touch.path",
): string {
  resolveAttributionRouteId(value, policy, field);
  return value as string;
}

function requireOpaqueId(
  value: unknown,
  field: string,
  prefix: "enq" | "touch" | "session",
  dataMode: AttributionDataMode,
): string {
  const id = requireNonEmptyString(value, field, 100);
  if (!LEGACY_OPAQUE_ID_PATTERN.test(id) || !id.startsWith(`${prefix}_`)) {
    throw new AttributionContractError(
      "invalid-opaque-id",
      `${field} must be an opaque identifier.`,
    );
  }

  if (dataMode === "actual") {
    const suffix = id.slice(prefix.length + 1);
    const characterClasses = [/[a-z]/, /[A-Z]/, /[0-9]/].filter((pattern) =>
      pattern.test(suffix),
    ).length;
    if (
      !HIGH_ENTROPY_OPAQUE_SUFFIX_PATTERN.test(suffix) ||
      HUMAN_SEMANTIC_OPAQUE_RUN_PATTERN.test(suffix) ||
      characterClasses !== 3 ||
      new Set(suffix).size < 10
    ) {
      throw new AttributionContractError(
        "untrusted-opaque-id",
        `${field} must be a high-entropy, non-semantic identifier for actual data.`,
      );
    }
  }

  return id;
}

export function normalizeConsent(value: unknown): AttributionConsentMetadata {
  assertExactKeys(
    value,
    ["state", "version", "purpose", "retentionDays"],
    "consent",
  );
  const state = requireEnum(
    value.state,
    ATTRIBUTION_CONSENT_STATES,
    "consent.state",
  );
  if (value.version !== ATTRIBUTION_CONSENT_VERSION) {
    throw new AttributionContractError(
      "invalid-consent",
      "consent.version must use the approved attribution consent version.",
    );
  }
  if (value.purpose !== ATTRIBUTION_PURPOSE) {
    throw new AttributionContractError(
      "invalid-consent",
      "consent.purpose must use the approved attribution purpose.",
    );
  }
  if (value.retentionDays !== ATTRIBUTION_RETENTION_DAYS) {
    throw new AttributionContractError(
      "invalid-consent",
      "consent.retentionDays must be exactly the attribution window.",
    );
  }
  return deepFreeze({
    state,
    version: ATTRIBUTION_CONSENT_VERSION,
    purpose: ATTRIBUTION_PURPOSE,
    retentionDays: ATTRIBUTION_RETENTION_DAYS,
  });
}

export function requireOpaqueSessionId(
  value: unknown,
  dataMode: AttributionDataMode,
): string {
  return requireOpaqueId(value, "sessionId", "session", dataMode);
}

export function validateTouch(
  value: unknown,
  policy: AttributionAllowlist,
  dataMode: AttributionDataMode,
): AttributionTouch {
  const normalizedPolicy = normalizeAllowlist(policy);
  assertExactKeys(
    value,
    [
      "touchId",
      "capturedAt",
      "channel",
      "event",
      "path",
      "campaign",
      "cluster",
      "article",
      "funnel",
    ],
    "touch",
  );
  const channel = requireEnum(
    value.channel,
    ATTRIBUTION_CHANNELS,
    "touch.channel",
  );
  const event = requireEnum(value.event, ATTRIBUTION_EVENTS, "touch.event");
  const touch: AttributionTouch = {
    touchId: requireOpaqueId(value.touchId, "touch.touchId", "touch", dataMode),
    capturedAt: canonicalizeTimestamp(value.capturedAt, "touch.capturedAt"),
    channel,
    event,
    path: requireNonEmptyString(value.path, "touch.path", 200),
    campaign: requireNullableSlug(
      value.campaign,
      "touch.campaign",
      normalizedPolicy.campaigns,
    ),
    cluster: requireNullableSlug(
      value.cluster,
      "touch.cluster",
      normalizedPolicy.clusters,
    ),
    article: requireNullableSlug(
      value.article,
      "touch.article",
      normalizedPolicy.articles,
    ),
    funnel: requireNullableSlug(
      value.funnel,
      "touch.funnel",
      normalizedPolicy.funnels,
    ),
  };

  const routeId = resolveAttributionRouteId(
    touch.path,
    normalizedPolicy,
    "touch.path",
  );
  if (touch.article && routeId !== `article:${touch.article}`) {
    throw new AttributionContractError(
      "route-article-mismatch",
      "touch.path must match the approved article identifier.",
    );
  }
  if (routeId === "funnel:enquiry" && touch.funnel !== "enquiry") {
    throw new AttributionContractError(
      "route-funnel-mismatch",
      "The enquiry route must use the approved enquiry funnel.",
    );
  }

  if (channel === "direct") {
    if (
      event !== "landing" ||
      touch.campaign ||
      touch.cluster ||
      touch.article
    ) {
      throw new AttributionContractError(
        "invalid-direct-touch",
        "direct landing touches cannot claim campaign, cluster, or article attribution.",
      );
    }
  } else if (!touch.cluster || !touch.article || !touch.funnel) {
    throw new AttributionContractError(
      "incomplete-touch",
      "non-direct touches require approved cluster, article, and funnel values.",
    );
  }

  return deepFreeze(touch);
}

export function requireDataMode(
  value: unknown,
  field = "dataMode",
): AttributionDataMode {
  return requireEnum(value, ATTRIBUTION_DATA_MODES, field);
}

export function requireOpaqueEnquiryId(
  value: unknown,
  dataMode: AttributionDataMode,
): string {
  return requireOpaqueId(value, "enquiryId", "enq", dataMode);
}

export function isFutureTimestamp(timestamp: string, now: string): boolean {
  return (
    timestampMilliseconds(timestamp, "timestamp") >
    timestampMilliseconds(now, "now")
  );
}

export function isExpiredAt(timestamp: string, now: string): boolean {
  return (
    timestampMilliseconds(timestamp, "timestamp") <=
    timestampMilliseconds(now, "now")
  );
}

export function touchKey(touch: AttributionTouch): string {
  return [
    touch.touchId,
    touch.capturedAt,
    touch.channel,
    touch.event,
    touch.path,
    touch.campaign ?? "",
    touch.cluster ?? "",
    touch.article ?? "",
    touch.funnel ?? "",
  ].join("\u001f");
}

export function serializeDeterministically(value: unknown): string {
  const active = new WeakSet<object>();

  function serialize(current: unknown): string {
    if (current === null) return "null";
    if (typeof current === "string" || typeof current === "boolean") {
      return JSON.stringify(current);
    }
    if (typeof current === "number") {
      if (!Number.isFinite(current)) {
        throw new AttributionContractError(
          "invalid-serialization-value",
          "Deterministic serialization does not allow non-finite numbers.",
        );
      }
      return JSON.stringify(current);
    }
    if (typeof current !== "object") {
      throw new AttributionContractError(
        "invalid-serialization-value",
        "Deterministic serialization only allows JSON values.",
      );
    }
    if (active.has(current)) {
      throw new AttributionContractError(
        "cyclic-serialization-value",
        "Deterministic serialization does not allow cyclic values.",
      );
    }
    active.add(current);
    try {
      if (Array.isArray(current)) {
        const items = [] as string[];
        for (let index = 0; index < current.length; index += 1) {
          if (!Object.prototype.hasOwnProperty.call(current, index)) {
            throw new AttributionContractError(
              "invalid-serialization-value",
              "Deterministic serialization does not allow sparse arrays.",
            );
          }
          items.push(serialize(current[index]));
        }
        return `[${items.join(",")}]`;
      }
      const prototype = Object.getPrototypeOf(current);
      if (prototype !== Object.prototype && prototype !== null) {
        throw new AttributionContractError(
          "invalid-serialization-value",
          "Deterministic serialization only allows plain objects.",
        );
      }
      const record = current as Record<string, unknown>;
      return `{${Object.keys(record)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${serialize(record[key])}`)
        .join(",")}}`;
    } finally {
      active.delete(current);
    }
  }

  return serialize(value);
}

export function validateSchemaVersion(value: unknown): void {
  if (value !== ATTRIBUTION_SCHEMA_VERSION) {
    throw new AttributionContractError(
      "schema-version",
      "Unsupported attribution schema version.",
    );
  }
}
