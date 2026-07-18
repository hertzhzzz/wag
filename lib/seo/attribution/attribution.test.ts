import {
  ATTRIBUTION_MAX_STORAGE_BYTES,
  ATTRIBUTION_WINDOW_MS,
  buildSafeAttributionPayloads,
  captureAttributionTouch,
  joinAttributionToSuccessfulEnquiry,
  parseAttributionJoin,
  parseAttributionJourney,
  serializeAttributionJoin,
  serializeAttributionJourney,
  serializeDeterministically,
  ATTRIBUTION_CONSENT_VERSION,
  ATTRIBUTION_PURPOSE,
  ATTRIBUTION_RETENTION_DAYS,
  type AttributionStorage,
  type AttributionTrustedServerAdapter,
  type AttributionTouchInput,
} from "./index";
import { createAttributionServerTrustBoundary } from "./trustedServer";

const NOW = "2026-07-18T00:00:00.000Z";
const TOUCH_IDS = {
  first: "touch_A7mQ2vN9xK4pR8sT",
  direct: "touch_B8nR3wP0yL5qS9tU",
  assisted: "touch_C9pS4xQ1zM6rT0uV",
  writeFailure: "touch_D0qT5yR2aN7sU1vW",
  roundTrip: "touch_E1rU6zS3bP8tV2wX",
  joinedAssisted: "touch_F2sV7aT4cQ9uW3xY",
} as const;
const ENQUIRY_IDS = {
  actual: "enq_M7qP2xV9kR4nT8sW",
  fixture: "enq_N8rQ3yW0mS5pU9tX",
  future: "enq_P9sR4zX1nT6qV0uY",
  roundTrip: "enq_Q0tS5aY2pU7rW1vZ",
  projection: "enq_R1uT6bZ3qV8sX2wA",
} as const;
const POLICY = {
  campaigns: ["seo-growth-system", "campaign-a"],
  clusters: ["supplier-verification", "factory-audit"],
  articles: ["supplier-verification-guide", "factory-audit-guide"],
  funnels: ["seo-content", "enquiry"],
} as const;

class MemoryStorage implements AttributionStorage {
  value: string | null = null;
  readError = false;
  writeError = false;
  readCount = 0;
  writeCount = 0;

  read(): string | null {
    this.readCount += 1;
    if (this.readError) throw new Error("storage unavailable");
    return this.value;
  }

  write(serialized: string): void {
    this.writeCount += 1;
    if (this.writeError) throw new Error("storage unavailable");
    this.value = serialized;
  }
}

function makeTrustedServer(
  options: {
    readonly observedAt?: string;
    readonly consentState?: "granted" | "denied" | "unavailable";
    readonly consentDecidedAt?: string;
    readonly enquiryId?: unknown;
    readonly occurredAt?: string;
  } = {},
) {
  const consentProof = Object.freeze({ token: "consent-proof" });
  const enquiryProof = Object.freeze({ token: "enquiry-proof" });
  const adapter: AttributionTrustedServerAdapter = {
    issuer: "test-server",
    observedAt: () => options.observedAt ?? NOW,
    verifyConsentProof: (proof) => {
      if (proof !== consentProof) return null;
      const decidedAt =
        options.consentDecidedAt ??
        new Date(
          Date.parse(options.observedAt ?? NOW) - ATTRIBUTION_WINDOW_MS + 1,
        ).toISOString();
      return {
        issuer: "test-server",
        proofId: "proof_Ab7Kq2Mx9R4Nv8Ts",
        sessionId: "session_H4kR8mN2pV6xQ9sT",
        state: options.consentState ?? "granted",
        version: ATTRIBUTION_CONSENT_VERSION,
        purpose: ATTRIBUTION_PURPOSE,
        retentionDays: ATTRIBUTION_RETENTION_DAYS,
        decidedAt,
        validUntil: new Date(
          Date.parse(decidedAt) + ATTRIBUTION_WINDOW_MS,
        ).toISOString(),
      };
    },
    verifySuccessfulEnquiryProof: (proof, expected) => {
      if (proof !== enquiryProof) return null;
      return {
        issuer: "test-server",
        proofId: "proof_Cd9Lm4Qr7Vx2Ns8Y",
        sessionId: expected.sessionId,
        enquiryId: options.enquiryId ?? ENQUIRY_IDS.actual,
        occurredAt: options.occurredAt ?? NOW,
        dataMode: "actual",
      };
    },
    verifyPersistedConsentProof: (reference) =>
      reference.issuer === "test-server" &&
      reference.proofId === "proof_Ab7Kq2Mx9R4Nv8Ts" &&
      reference.sessionId === "session_H4kR8mN2pV6xQ9sT" &&
      reference.state === "granted" &&
      reference.version === ATTRIBUTION_CONSENT_VERSION &&
      reference.purpose === ATTRIBUTION_PURPOSE &&
      reference.retentionDays === ATTRIBUTION_RETENTION_DAYS &&
      reference.observedAt === (options.observedAt ?? NOW) &&
      Object.isFrozen(reference),
    consumeSuccessfulEnquiryProof: (() => {
      const consumed = new Set<string>();
      return (proofId: string) => {
        if (consumed.has(proofId)) return false;
        consumed.add(proofId);
        return true;
      };
    })(),
  };
  return {
    boundary: createAttributionServerTrustBoundary(adapter),
    consentProof,
    enquiryProof,
  };
}

function touch(
  overrides: Partial<AttributionTouchInput> = {},
): AttributionTouchInput {
  return {
    touchId: TOUCH_IDS.first,
    capturedAt: NOW,
    channel: "organic",
    event: "landing",
    path: "/resources/supplier-verification-guide",
    campaign: "seo-growth-system",
    cluster: "supplier-verification",
    article: "supplier-verification-guide",
    funnel: "seo-content",
    ...overrides,
  };
}

function capture(
  storage: AttributionStorage | null,
  input: Partial<Parameters<typeof captureAttributionTouch>[0]> = {},
) {
  const dataMode = input.dataMode ?? "actual";
  const now = input.now ?? NOW;
  const requestedConsent = input.consent;
  const trusted = makeTrustedServer({
    observedAt: now,
    consentState:
      dataMode === "actual"
        ? (requestedConsent?.state ?? "granted")
        : "granted",
  });
  const rest = { ...input };
  delete rest.consent;
  delete rest.trustBoundary;
  delete rest.consentProof;
  return captureAttributionTouch({
    now,
    dataMode,
    sessionId: "session_H4kR8mN2pV6xQ9sT",
    ...(dataMode === "actual"
      ? { trustBoundary: trusted.boundary, consentProof: trusted.consentProof }
      : {
          consent: requestedConsent ?? {
            state: "granted",
            version: ATTRIBUTION_CONSENT_VERSION,
            purpose: ATTRIBUTION_PURPOSE,
            retentionDays: ATTRIBUTION_RETENTION_DAYS,
          },
        }),
    storage,
    policy: POLICY,
    touch: touch(),
    ...rest,
  });
}

function joinActual(
  journey: unknown,
  options: {
    readonly enquiryId?: unknown;
    readonly occurredAt?: string;
    readonly joinedAt?: string;
    readonly observedAt?: string;
  } = {},
) {
  const joinedAt = options.joinedAt ?? NOW;
  const trusted = makeTrustedServer({
    observedAt: options.observedAt ?? joinedAt,
    enquiryId: options.enquiryId,
    occurredAt: options.occurredAt,
  });
  return joinAttributionToSuccessfulEnquiry({
    scope: "server-reporting",
    journey,
    successfulEnquiryProof: trusted.enquiryProof,
    trustBoundary: trusted.boundary,
    joinedAt,
    reportDataMode: "actual",
    policy: POLICY,
  });
}

describe("SEO attribution contract", () => {
  it("keeps first-touch and assisted-touch distinct across direct and returning visits", () => {
    const storage = new MemoryStorage();
    const first = capture(storage);
    expect(first.status).toBe("stored");
    if (first.status !== "stored") return;

    const direct = capture(storage, {
      touch: touch({
        touchId: TOUCH_IDS.direct,
        channel: "direct",
        event: "landing",
        path: "/enquiry",
        campaign: null,
        cluster: null,
        article: null,
        funnel: "enquiry",
      }),
    });
    expect(direct.status).toBe("stored");

    const assisted = capture(storage, {
      touch: touch({
        touchId: TOUCH_IDS.assisted,
        capturedAt: "2026-07-20T00:00:00.000Z",
        path: "/resources/factory-audit-guide",
        cluster: "factory-audit",
        article: "factory-audit-guide",
      }),
    });
    expect(assisted.status).toBe("skipped");
    expect(assisted.status === "skipped" && assisted.reason).toBe(
      "future-timestamp",
    );

    const returning = capture(storage, {
      now: "2026-07-18T00:00:02.000Z",
      touch: touch({
        touchId: TOUCH_IDS.assisted,
        capturedAt: "2026-07-18T00:00:01.000Z",
        path: "/resources/factory-audit-guide",
        cluster: "factory-audit",
        article: "factory-audit-guide",
      }),
    });
    expect(returning.status).toBe("stored");
    if (returning.status !== "stored") return;
    expect(returning.record.firstTouch?.article).toBe(
      "supplier-verification-guide",
    );
    expect(
      returning.record.assistedTouches.map((item) => item.article),
    ).toEqual(["factory-audit-guide"]);
    expect(returning.record.lastNonDirectPath).toBe(
      "/resources/factory-audit-guide",
    );
    expect(returning.record.touches).toHaveLength(3);
  });

  it("deduplicates a repeated touch without mutating stored state", () => {
    const storage = new MemoryStorage();
    const first = capture(storage);
    expect(first.status).toBe("stored");
    const before = storage.value;
    const duplicate = capture(storage);
    expect(duplicate).toEqual({
      status: "skipped",
      record: null,
      reason: "duplicate-touch",
    });
    expect(storage.value).toBe(before);
  });

  it("enforces the exact 90-day boundary", () => {
    const storage = new MemoryStorage();
    const boundary = new Date(
      Date.parse(NOW) - ATTRIBUTION_WINDOW_MS,
    ).toISOString();
    const expired = capture(storage, {
      touch: touch({ capturedAt: boundary }),
    });
    expect(expired).toEqual({
      status: "skipped",
      record: null,
      reason: "outside-window",
    });

    const justInside = capture(storage, {
      touch: touch({
        capturedAt: new Date(Date.parse(boundary) + 1).toISOString(),
      }),
    });
    expect(justInside.status).toBe("stored");
  });

  it("fails soft when consent or storage is unavailable", () => {
    const storage = new MemoryStorage();
    expect(
      capture(storage, {
        consent: {
          state: "denied",
          version: ATTRIBUTION_CONSENT_VERSION,
          purpose: ATTRIBUTION_PURPOSE,
          retentionDays: ATTRIBUTION_RETENTION_DAYS,
        },
      }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "consent-denied",
    });
    expect(
      capture(storage, {
        consent: {
          state: "unavailable",
          version: ATTRIBUTION_CONSENT_VERSION,
          purpose: ATTRIBUTION_PURPOSE,
          retentionDays: ATTRIBUTION_RETENTION_DAYS,
        },
      }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "consent-unavailable",
    });
    expect(capture(null, {})).toEqual({
      status: "skipped",
      record: null,
      reason: "storage-unavailable",
    });
    storage.readError = true;
    expect(capture(storage)).toEqual({
      status: "skipped",
      record: null,
      reason: "storage-unavailable",
    });
  });

  it("keeps dry_run deterministic while performing zero storage reads or writes", () => {
    const hostileStorage = new MemoryStorage();
    hostileStorage.value = "{corrupt-storage-state";
    hostileStorage.readError = true;
    hostileStorage.writeError = true;

    const withHostileStorage = capture(hostileStorage, {
      dataMode: "dry_run",
      consent: {
        state: "denied",
        version: ATTRIBUTION_CONSENT_VERSION,
        purpose: ATTRIBUTION_PURPOSE,
        retentionDays: ATTRIBUTION_RETENTION_DAYS,
      },
    });
    const withoutStorage = capture(null, {
      dataMode: "dry_run",
      consent: {
        state: "denied",
        version: ATTRIBUTION_CONSENT_VERSION,
        purpose: ATTRIBUTION_PURPOSE,
        retentionDays: ATTRIBUTION_RETENTION_DAYS,
      },
    });

    expect(withHostileStorage.status).toBe("preview");
    expect(
      withHostileStorage.status === "preview" && withHostileStorage.reason,
    ).toBe("dry-run-no-storage-io");
    expect(hostileStorage.readCount).toBe(0);
    expect(hostileStorage.writeCount).toBe(0);
    expect(hostileStorage.value).toBe("{corrupt-storage-state");
    expect(withoutStorage.status).toBe("preview");
    if (
      withHostileStorage.status !== "preview" ||
      withoutStorage.status !== "preview"
    ) {
      return;
    }
    expect(serializeAttributionJourney(withHostileStorage.record, POLICY)).toBe(
      serializeAttributionJourney(withoutStorage.record, POLICY),
    );
  });

  it("persists an anonymous session with explicit consent version, purpose, and retention metadata", () => {
    const storage = new MemoryStorage();
    const result = capture(storage);

    expect(result.status).toBe("stored");
    if (result.status !== "stored") return;
    expect(result.record.sessionId).toBe("session_H4kR8mN2pV6xQ9sT");
    expect(result.record.privacy).toEqual({
      consentState: "granted",
      consentVersion: "seo-attribution-consent-v1",
      purpose: ATTRIBUTION_PURPOSE,
      retentionDays: 90,
      consentIssuer: "test-server",
      consentProofId: "proof_Ab7Kq2Mx9R4Nv8Ts",
    });
  });

  it("rejects unknown keys and prohibited personal-data fields recursively", () => {
    const storage = new MemoryStorage();
    expect(capture(storage, { touch: { ...touch(), extra: "nope" } })).toEqual({
      status: "skipped",
      record: null,
      reason: "invalid-touch",
    });
    expect(
      capture(storage, { touch: { ...touch(), email: "person@example.com" } }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "invalid-touch",
    });
  });

  it("rejects local timestamps, unsafe paths, and unapproved values", () => {
    const storage = new MemoryStorage();
    expect(
      capture(storage, { touch: touch({ capturedAt: "2026-07-18 00:00:00" }) }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "invalid-touch",
    });
    expect(
      capture(storage, {
        touch: touch({ path: "/resources/a?email=person@example.com" }),
      }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "invalid-touch",
    });
    expect(
      capture(storage, { touch: touch({ article: "unapproved-article" }) }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "invalid-touch",
    });
  });

  it("rejects PII, private, query-like, and free-text public route segments", () => {
    const unsafePaths = [
      "/resources/person@example.com",
      "/resources/0412345678",
      "/private/customer-record",
      "/resources/supplier-verification-guide/customer-brief",
      "/resources/free-form-supplier-request",
      "/resources/supplier-verification-guide?lead=person",
    ];

    for (const path of unsafePaths) {
      expect(capture(new MemoryStorage(), { touch: touch({ path }) })).toEqual({
        status: "skipped",
        record: null,
        reason: "invalid-touch",
      });
    }
  });

  it("requires high-entropy actual IDs while retaining fixture-only legacy IDs", () => {
    for (const touchId of [
      "touch_00000001",
      "touch_supplierverification",
      "touch_0412345678",
      "touch_AliceCustomer2026",
    ]) {
      expect(
        capture(new MemoryStorage(), { touch: touch({ touchId }) }),
      ).toEqual({
        status: "skipped",
        record: null,
        reason: "invalid-touch",
      });
    }

    const fixture = capture(new MemoryStorage(), {
      dataMode: "synthetic_fixture",
      touch: touch({ touchId: "touch_00000001" }),
    });
    expect(fixture.status).toBe("stored");
  });

  it("allows future dates only for synthetic fixtures", () => {
    const storage = new MemoryStorage();
    const futureTouch = touch({ capturedAt: "2026-07-19T00:00:00.000Z" });
    expect(capture(storage, { touch: futureTouch })).toEqual({
      status: "skipped",
      record: null,
      reason: "future-timestamp",
    });
    const fixture = capture(storage, {
      dataMode: "synthetic_fixture",
      touch: futureTouch,
    });
    expect(fixture.status).toBe("stored");
  });

  it("serializes a safe browser payload with no PII or free-text fields", () => {
    const storage = new MemoryStorage();
    const result = capture(storage);
    expect(result.status).toBe("stored");
    if (result.status !== "stored") return;
    const payloads = buildSafeAttributionPayloads(result.record, POLICY);
    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toEqual({
      event: "content_touch",
      touchRole: "first_touch",
      capturedAt: NOW,
      channel: "organic",
      routeSchemaVersion: "public-route-v1",
      routeId: "article:supplier-verification-guide",
      campaign: "seo-growth-system",
      cluster: "supplier-verification",
      article: "supplier-verification-guide",
      funnel: "seo-content",
    });
    expect(payloads[0]).not.toHaveProperty("path");
    expect(JSON.stringify(payloads)).not.toMatch(
      /email|phone|company|message|product|secret/i,
    );
  });

  it("marks enquiry joins as server-reporting-only and never exposes session metadata", () => {
    const storage = new MemoryStorage();
    const captured = capture(storage);
    expect(captured.status).toBe("stored");
    if (captured.status !== "stored") return;

    const joined = joinActual(captured.record);

    expect(joined.status).toBe("joined");
    if (joined.status !== "joined") return;
    expect(joined.join.scope).toBe("server-reporting");
    expect(joined.join).not.toHaveProperty("sessionId");
    expect(joined.join).not.toHaveProperty("privacy");
  });

  it("joins only opaque successful-enquiry IDs and rejects synthetic fixtures for actual reports", () => {
    const storage = new MemoryStorage();
    const captured = capture(storage);
    expect(captured.status).toBe("stored");
    if (captured.status !== "stored") return;

    const joined = joinActual(captured.record);
    expect(joined.status).toBe("joined");
    if (joined.status === "joined") {
      expect(joined.join.enquiryId).toBe(ENQUIRY_IDS.actual);
      expect(JSON.stringify(joined.join)).not.toMatch(
        /email|phone|company|message|product/i,
      );
    }

    const fixture = joinAttributionToSuccessfulEnquiry({
      scope: "server-reporting",
      journey: {
        ...captured.record,
        dataMode: "synthetic_fixture",
        privacy: {
          ...captured.record.privacy,
          consentIssuer: null,
          consentProofId: null,
        },
      },
      successfulEnquiry: {
        enquiryId: ENQUIRY_IDS.fixture,
        occurredAt: NOW,
        dataMode: "synthetic_fixture",
      },
      joinedAt: NOW,
      reportDataMode: "actual",
      policy: POLICY,
    });
    expect(fixture).toEqual({
      status: "skipped",
      join: null,
      reason: "fixture-not-allowed-for-actual",
    });
  });

  it("rejects malformed enquiry IDs and future/expired joins", () => {
    const storage = new MemoryStorage();
    const captured = capture(storage);
    expect(captured.status).toBe("stored");
    if (captured.status !== "stored") return;

    for (const enquiryId of ["person@example.com", "enq_AliceCustomer2026"]) {
      const malformed = joinActual(captured.record, { enquiryId });
      expect(malformed.status).toBe("skipped");
      expect(malformed.status === "skipped" && malformed.reason).toBe(
        "untrusted-enquiry-proof",
      );
    }

    const future = joinActual(captured.record, {
      enquiryId: ENQUIRY_IDS.future,
      occurredAt: "2026-07-19T00:00:00.000Z",
    });
    expect(future).toEqual({
      status: "skipped",
      join: null,
      reason: "future-timestamp",
    });
  });

  it("rejects corrupt storage and does not overwrite it", () => {
    const storage = new MemoryStorage();
    storage.value = "{not-json";
    const result = capture(storage);
    expect(result).toEqual({
      status: "skipped",
      record: null,
      reason: "storage-corrupt",
    });
    expect(storage.value).toBe("{not-json");
  });

  it("deep-freezes the returned journey and rejects write failures without blocking callers", () => {
    const storage = new MemoryStorage();
    const result = capture(storage);
    expect(result.status).toBe("stored");
    if (result.status !== "stored") return;
    expect(Object.isFrozen(result.record)).toBe(true);
    expect(Object.isFrozen(result.record.touches)).toBe(true);

    storage.writeError = true;
    const failed = capture(storage, {
      now: "2026-07-18T00:01:00.000Z",
      touch: touch({
        touchId: TOUCH_IDS.writeFailure,
        capturedAt: "2026-07-18T00:00:30.000Z",
      }),
    });
    expect(failed).toEqual({
      status: "skipped",
      record: null,
      reason: "write-failed",
    });
  });

  it("round-trips through a deterministic strict serialized contract", () => {
    const storage = new MemoryStorage();
    const result = capture(storage);
    expect(result.status).toBe("stored");
    if (result.status !== "stored") return;
    const serialized = serializeAttributionJourney(result.record, POLICY);
    expect(serialized).toBe(storage.value);
    expect(parseAttributionJourney(JSON.parse(serialized), POLICY)).toEqual(
      result.record,
    );
  });

  it("parses and reserializes only a canonical, policy-bound enquiry join", () => {
    const storage = new MemoryStorage();
    const captured = capture(storage);
    expect(captured.status).toBe("stored");
    if (captured.status !== "stored") return;

    const joined = joinActual(captured.record, {
      enquiryId: ENQUIRY_IDS.roundTrip,
    });
    expect(joined.status).toBe("joined");
    if (joined.status !== "joined") return;

    const parsed = parseAttributionJoin(joined.join, POLICY);
    expect(parsed).toEqual(joined.join);
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.assistedTouches)).toBe(true);
    expect(serializeAttributionJoin(joined.join, POLICY)).toBe(
      serializeAttributionJoin(parsed, POLICY),
    );
  });

  it("rejects forged join projections, direct claims, duplicate IDs, and non-canonical order", () => {
    const storage = new MemoryStorage();
    const first = capture(storage);
    expect(first.status).toBe("stored");
    if (first.status !== "stored") return;

    const second = capture(storage, {
      now: "2026-07-18T00:00:02.000Z",
      touch: touch({
        touchId: TOUCH_IDS.joinedAssisted,
        capturedAt: "2026-07-18T00:00:01.000Z",
        path: "/resources/factory-audit-guide",
        cluster: "factory-audit",
        article: "factory-audit-guide",
      }),
    });
    expect(second.status).toBe("stored");
    if (second.status !== "stored") return;

    const joined = joinActual(second.record, {
      enquiryId: ENQUIRY_IDS.projection,
      occurredAt: "2026-07-18T00:00:02.000Z",
      joinedAt: "2026-07-18T00:00:02.000Z",
    });
    expect(joined.status).toBe("joined");
    if (joined.status !== "joined") return;

    const reordered = JSON.parse(JSON.stringify(joined.join)) as Record<
      string,
      unknown
    >;
    reordered.firstTouch = joined.join.assistedTouches[0];
    reordered.assistedTouches = [joined.join.firstTouch];
    expect(() => parseAttributionJoin(reordered, POLICY)).toThrow(
      /canonical chronological order|final non-direct touch/,
    );

    const forgedPath = JSON.parse(JSON.stringify(joined.join)) as Record<
      string,
      unknown
    >;
    forgedPath.lastNonDirectPath = "/resources/supplier-verification-guide";
    expect(() => parseAttributionJoin(forgedPath, POLICY)).toThrow(
      /final non-direct touch/,
    );

    const directClaim = JSON.parse(JSON.stringify(joined.join)) as Record<
      string,
      unknown
    >;
    directClaim.firstTouch = {
      ...((joined.join.firstTouch ?? {}) as Record<string, unknown>),
      channel: "direct",
      event: "landing",
      campaign: null,
      cluster: null,
      article: null,
      funnel: "enquiry",
      path: "/enquiry",
    };
    expect(() => parseAttributionJoin(directClaim, POLICY)).toThrow(
      /non-direct touch/,
    );

    const duplicate = JSON.parse(JSON.stringify(joined.join)) as Record<
      string,
      unknown
    >;
    duplicate.assistedTouches = [
      joined.join.firstTouch,
      joined.join.firstTouch,
    ];
    expect(() => parseAttributionJoin(duplicate, POLICY)).toThrow(
      /identifiers must be unique|canonical chronological order/,
    );
  });

  it("rejects non-JSON and cyclic values instead of emitting invalid serialized output", () => {
    expect(() => serializeDeterministically({ value: undefined })).toThrow(
      /only allows JSON values/,
    );
    expect(() => serializeDeterministically({ value: Number.NaN })).toThrow(
      /non-finite numbers/,
    );
    const sparse: unknown[] = [];
    sparse.length = 1;
    expect(() => serializeDeterministically(sparse)).toThrow(/sparse arrays/);
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => serializeDeterministically(cyclic)).toThrow(/cyclic values/);
  });

  it("fails closed before writing a journey that exceeds the storage bound", () => {
    const storage = new MemoryStorage();
    let result: ReturnType<typeof capture> = capture(storage);
    for (let index = 1; index <= 200; index += 1) {
      result = capture(storage, {
        now: new Date(Date.parse(NOW) + index * 1000).toISOString(),
        touch: touch({
          touchId: `touch_G3tW8bU5dR0vX${index.toString(36).padStart(6, "0")}`,
          capturedAt: new Date(Date.parse(NOW) + index * 1000).toISOString(),
        }),
      });
      if (result.status === "skipped" && result.reason === "storage-size") {
        break;
      }
    }
    expect(result).toEqual({
      status: "skipped",
      record: null,
      reason: "storage-size",
    });
    expect(storage.value).not.toBeNull();
    expect(
      new TextEncoder().encode(storage.value as string).byteLength,
    ).toBeLessThanOrEqual(ATTRIBUTION_MAX_STORAGE_BYTES);
  });

  it("fails closed when actual consent and enquiry success are caller-reported", () => {
    const storage = new MemoryStorage();
    const trustBoundary = createAttributionServerTrustBoundary({
      issuer: "test-server",
      observedAt: () => NOW,
      verifyConsentProof: () => null,
      verifySuccessfulEnquiryProof: () => null,
      verifyPersistedConsentProof: () => false,
      consumeSuccessfulEnquiryProof: () => false,
    });
    const callerReportedConsent = captureAttributionTouch({
      now: NOW,
      dataMode: "actual",
      sessionId: "session_H4kR8mN2pV6xQ9sT",
      consent: {
        state: "granted",
        version: ATTRIBUTION_CONSENT_VERSION,
        purpose: ATTRIBUTION_PURPOSE,
        retentionDays: ATTRIBUTION_RETENTION_DAYS,
      },
      consentProof: { state: "granted" },
      trustBoundary,
      storage,
      policy: POLICY,
      touch: touch(),
    } as never);
    expect(callerReportedConsent).toEqual({
      status: "skipped",
      record: null,
      reason: "untrusted-consent",
    });

    const captured = capture(storage);
    expect(captured.status).toBe("stored");
    if (captured.status !== "stored") return;
    const callerReportedSuccess = joinAttributionToSuccessfulEnquiry({
      scope: "server-reporting",
      journey: captured.record,
      successfulEnquiry: {
        enquiryId: ENQUIRY_IDS.actual,
        occurredAt: NOW,
        dataMode: "actual",
      },
      joinedAt: NOW,
      reportDataMode: "actual",
      policy: POLICY,
    });
    expect(callerReportedSuccess).toEqual({
      status: "skipped",
      join: null,
      reason: "untrusted-enquiry-proof",
    });
  });

  it("requires a strict 90-day expiry for direct-only journeys", () => {
    const storage = new MemoryStorage();
    const directStart = new Date(
      Date.parse(NOW) - ATTRIBUTION_WINDOW_MS,
    ).toISOString();
    const result = capture(storage, {
      now: directStart,
      touch: touch({
        touchId: TOUCH_IDS.direct,
        capturedAt: directStart,
        channel: "direct",
        path: "/enquiry",
        campaign: null,
        cluster: null,
        article: null,
        funnel: "enquiry",
      }),
    });

    expect(result.status).toBe("stored");
    if (result.status !== "stored") return;
    expect(result.record.expiresAt).toBe(NOW);

    const atBoundary = capture(storage, {
      now: NOW,
      touch: touch({
        touchId: TOUCH_IDS.roundTrip,
        capturedAt: NOW,
        channel: "direct",
        path: "/enquiry",
        campaign: null,
        cluster: null,
        article: null,
        funnel: "enquiry",
      }),
    });
    expect(atBoundary.status).toBe("stored");
    if (atBoundary.status !== "stored") return;
    expect(atBoundary.reason).toBe("expired-record-replaced");
    expect(atBoundary.record.touches).toHaveLength(1);
    expect(atBoundary.record.touches[0].touchId).toBe(TOUCH_IDS.roundTrip);
  });

  it("accepts only trusted observation time and allows callers to tighten it", () => {
    const storage = new MemoryStorage();
    const trusted = makeTrustedServer({ observedAt: NOW });
    const futureNow = new Date(Date.parse(NOW) + 1_000).toISOString();
    const rejected = captureAttributionTouch({
      now: futureNow,
      dataMode: "actual",
      sessionId: "session_H4kR8mN2pV6xQ9sT",
      consentProof: trusted.consentProof,
      trustBoundary: trusted.boundary,
      storage,
      policy: POLICY,
      touch: touch({ capturedAt: NOW }),
    });
    expect(rejected).toEqual({
      status: "skipped",
      record: null,
      reason: "untrusted-time-boundary",
    });

    const tightened = captureAttributionTouch({
      now: new Date(Date.parse(NOW) - 1_000).toISOString(),
      dataMode: "actual",
      sessionId: "session_H4kR8mN2pV6xQ9sT",
      consentProof: trusted.consentProof,
      trustBoundary: trusted.boundary,
      storage: new MemoryStorage(),
      policy: POLICY,
      touch: touch({
        capturedAt: new Date(Date.parse(NOW) - 1_000).toISOString(),
      }),
    });
    expect(tightened.status).toBe("stored");

    const captured = capture(new MemoryStorage());
    expect(captured.status).toBe("stored");
    if (captured.status !== "stored") return;
    const joinTrusted = makeTrustedServer({ observedAt: NOW });
    const joined = joinAttributionToSuccessfulEnquiry({
      scope: "server-reporting",
      journey: captured.record,
      successfulEnquiryProof: joinTrusted.enquiryProof,
      trustBoundary: joinTrusted.boundary,
      joinedAt: futureNow,
      reportDataMode: "actual",
      policy: POLICY,
    });
    expect(joined).toEqual({
      status: "skipped",
      join: null,
      reason: "untrusted-time-boundary",
    });
  });

  it("does not apply a trusted consent decision retroactively", () => {
    const consentDecidedAt = new Date(Date.parse(NOW) - 1_000).toISOString();
    const trusted = makeTrustedServer({ observedAt: NOW, consentDecidedAt });
    const beforeConsent = new Date(Date.parse(NOW) - 2_000).toISOString();

    expect(
      captureAttributionTouch({
        now: NOW,
        dataMode: "actual",
        sessionId: "session_H4kR8mN2pV6xQ9sT",
        consentProof: trusted.consentProof,
        trustBoundary: trusted.boundary,
        storage: new MemoryStorage(),
        policy: POLICY,
        touch: touch({ capturedAt: beforeConsent }),
      }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "untrusted-consent",
    });
  });

  it("does not let a caller-tightened clock resurrect expired consent", () => {
    const consentProof = Object.freeze({ token: "expired-consent" });
    const validUntil = new Date(Date.parse(NOW) - 1_000).toISOString();
    const decidedAt = new Date(
      Date.parse(validUntil) - ATTRIBUTION_WINDOW_MS,
    ).toISOString();
    const callerNow = new Date(Date.parse(NOW) - 2_000).toISOString();
    const boundary = createAttributionServerTrustBoundary({
      issuer: "test-server",
      observedAt: () => NOW,
      verifyConsentProof: (proof) =>
        proof === consentProof
          ? {
              issuer: "test-server",
              proofId: "proof_Ab7Kq2Mx9R4Nv8Ts",
              sessionId: "session_H4kR8mN2pV6xQ9sT",
              state: "granted",
              version: ATTRIBUTION_CONSENT_VERSION,
              purpose: ATTRIBUTION_PURPOSE,
              retentionDays: ATTRIBUTION_RETENTION_DAYS,
              decidedAt,
              validUntil,
            }
          : null,
      verifySuccessfulEnquiryProof: () => null,
      verifyPersistedConsentProof: () => false,
      consumeSuccessfulEnquiryProof: () => false,
    });

    expect(
      captureAttributionTouch({
        now: callerNow,
        dataMode: "actual",
        sessionId: "session_H4kR8mN2pV6xQ9sT",
        consentProof,
        trustBoundary: boundary,
        storage: new MemoryStorage(),
        policy: POLICY,
        touch: touch({ capturedAt: callerNow }),
      }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "untrusted-consent",
    });
  });

  it("does not let a caller-tightened clock reopen an expired attribution window", () => {
    const callerNow = new Date(Date.parse(NOW) - 1_000).toISOString();
    const boundaryStart = new Date(
      Date.parse(NOW) - ATTRIBUTION_WINDOW_MS,
    ).toISOString();
    const trusted = makeTrustedServer({ observedAt: NOW });

    expect(
      captureAttributionTouch({
        now: callerNow,
        dataMode: "actual",
        sessionId: "session_H4kR8mN2pV6xQ9sT",
        consentProof: trusted.consentProof,
        trustBoundary: trusted.boundary,
        storage: new MemoryStorage(),
        policy: POLICY,
        touch: touch({ capturedAt: boundaryStart }),
      }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "outside-window",
    });

    const storage = new MemoryStorage();
    const initial = capture(storage, {
      now: boundaryStart,
      touch: touch({
        touchId: TOUCH_IDS.direct,
        capturedAt: boundaryStart,
        channel: "direct",
        path: "/enquiry",
        campaign: null,
        cluster: null,
        article: null,
        funnel: "enquiry",
      }),
    });
    expect(initial.status).toBe("stored");

    const replacement = captureAttributionTouch({
      now: callerNow,
      dataMode: "actual",
      sessionId: "session_H4kR8mN2pV6xQ9sT",
      consentProof: trusted.consentProof,
      trustBoundary: trusted.boundary,
      storage,
      policy: POLICY,
      touch: touch({
        touchId: TOUCH_IDS.roundTrip,
        capturedAt: callerNow,
        channel: "direct",
        path: "/enquiry",
        campaign: null,
        cluster: null,
        article: null,
        funnel: "enquiry",
      }),
    });
    expect(replacement.status).toBe("stored");
    if (replacement.status !== "stored") return;
    expect(replacement.reason).toBe("expired-record-replaced");
    expect(replacement.record.touches).toHaveLength(1);
    expect(replacement.record.expiresAt).toBe(
      new Date(Date.parse(callerNow) + ATTRIBUTION_WINDOW_MS).toISOString(),
    );
  });

  it("rejects replayed successful-enquiry proofs and untrusted decision shapes", () => {
    const captured = capture(new MemoryStorage());
    expect(captured.status).toBe("stored");
    if (captured.status !== "stored") return;

    const trusted = makeTrustedServer();
    const first = joinAttributionToSuccessfulEnquiry({
      scope: "server-reporting",
      journey: captured.record,
      successfulEnquiryProof: trusted.enquiryProof,
      trustBoundary: trusted.boundary,
      joinedAt: NOW,
      reportDataMode: "actual",
      policy: POLICY,
    });
    expect(first.status).toBe("joined");
    const replay = joinAttributionToSuccessfulEnquiry({
      scope: "server-reporting",
      journey: captured.record,
      successfulEnquiryProof: trusted.enquiryProof,
      trustBoundary: trusted.boundary,
      joinedAt: NOW,
      reportDataMode: "actual",
      policy: POLICY,
    });
    expect(replay).toEqual({
      status: "skipped",
      join: null,
      reason: "replayed-enquiry-proof",
    });

    const unknownKeyTrust = createAttributionServerTrustBoundary({
      issuer: "test-server",
      observedAt: () => NOW,
      verifyConsentProof: () => ({
        issuer: "test-server",
        proofId: "proof_Ab7Kq2Mx9R4Nv8Ts",
        sessionId: "session_H4kR8mN2pV6xQ9sT",
        state: "granted",
        version: ATTRIBUTION_CONSENT_VERSION,
        purpose: ATTRIBUTION_PURPOSE,
        retentionDays: ATTRIBUTION_RETENTION_DAYS,
        decidedAt: NOW,
        validUntil: "2026-10-16T00:00:00.000Z",
        deviceId: "must-not-enter-analytics",
      }),
      verifySuccessfulEnquiryProof: () => null,
      verifyPersistedConsentProof: () => false,
      consumeSuccessfulEnquiryProof: () => false,
    });
    const rejected = captureAttributionTouch({
      now: NOW,
      dataMode: "actual",
      sessionId: "session_H4kR8mN2pV6xQ9sT",
      consentProof: {},
      trustBoundary: unknownKeyTrust,
      storage: new MemoryStorage(),
      policy: POLICY,
      touch: touch(),
    });
    expect(rejected).toEqual({
      status: "skipped",
      record: null,
      reason: "untrusted-consent",
    });
  });

  it("snapshots exact trusted adapters against mutation and unknown keys", () => {
    const adapter: AttributionTrustedServerAdapter = {
      issuer: "test-server",
      observedAt: () => NOW,
      verifyConsentProof: () => null,
      verifySuccessfulEnquiryProof: () => null,
      verifyPersistedConsentProof: () => false,
      consumeSuccessfulEnquiryProof: () => false,
    };
    const boundary = createAttributionServerTrustBoundary(adapter);
    (
      adapter as unknown as {
        verifyConsentProof: AttributionTrustedServerAdapter["verifyConsentProof"];
      }
    ).verifyConsentProof = () => ({
      issuer: "test-server",
      proofId: "proof_Ab7Kq2Mx9R4Nv8Ts",
      sessionId: "session_H4kR8mN2pV6xQ9sT",
      state: "granted",
      version: ATTRIBUTION_CONSENT_VERSION,
      purpose: ATTRIBUTION_PURPOSE,
      retentionDays: ATTRIBUTION_RETENTION_DAYS,
      decidedAt: new Date(Date.parse(NOW) - 1_000).toISOString(),
      validUntil: new Date(
        Date.parse(NOW) - 1_000 + ATTRIBUTION_WINDOW_MS,
      ).toISOString(),
    });

    expect(
      captureAttributionTouch({
        now: NOW,
        dataMode: "actual",
        sessionId: "session_H4kR8mN2pV6xQ9sT",
        consentProof: Object.freeze({ token: "caller" }),
        trustBoundary: boundary,
        storage: new MemoryStorage(),
        policy: POLICY,
        touch: touch(),
      }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "untrusted-consent",
    });

    expect(() =>
      createAttributionServerTrustBoundary({
        ...adapter,
        unknownVerifier: () => true,
      } as never),
    ).toThrow();
  });

  it("rejects forged persisted consent references before an actual join", () => {
    const captured = capture(new MemoryStorage());
    expect(captured.status).toBe("stored");
    if (captured.status !== "stored") return;

    const forgedJourney = JSON.parse(
      JSON.stringify(captured.record),
    ) as typeof captured.record;
    (forgedJourney.privacy as { consentProofId: string }).consentProofId =
      "proof_Zx8Vn3Qm6Rt1Lp5K";

    expect(joinActual(forgedJourney)).toEqual({
      status: "skipped",
      join: null,
      reason: "untrusted-journey-proof",
    });
  });

  it("rejects prototype-bearing proof decisions without mutating adapter values", () => {
    class ConsentDecision {
      issuer = "test-server";
      proofId = "proof_Ab7Kq2Mx9R4Nv8Ts";
      sessionId = "session_H4kR8mN2pV6xQ9sT";
      state = "granted" as const;
      version = ATTRIBUTION_CONSENT_VERSION;
      purpose = ATTRIBUTION_PURPOSE;
      retentionDays = ATTRIBUTION_RETENTION_DAYS;
      decidedAt = new Date(Date.parse(NOW) - 1_000).toISOString();
      validUntil = new Date(
        Date.parse(this.decidedAt) + ATTRIBUTION_WINDOW_MS,
      ).toISOString();
    }
    const decision = new ConsentDecision();
    const before = { ...decision };
    const boundary = createAttributionServerTrustBoundary({
      issuer: "test-server",
      observedAt: () => NOW,
      verifyConsentProof: () => decision,
      verifySuccessfulEnquiryProof: () => null,
      verifyPersistedConsentProof: () => false,
      consumeSuccessfulEnquiryProof: () => false,
    });

    expect(
      captureAttributionTouch({
        now: NOW,
        dataMode: "actual",
        sessionId: "session_H4kR8mN2pV6xQ9sT",
        consentProof: Object.freeze({ token: "opaque" }),
        trustBoundary: boundary,
        storage: new MemoryStorage(),
        policy: POLICY,
        touch: touch(),
      }),
    ).toEqual({
      status: "skipped",
      record: null,
      reason: "untrusted-consent",
    });
    expect({ ...decision }).toEqual(before);
    expect(Object.isFrozen(decision)).toBe(false);
  });
});
