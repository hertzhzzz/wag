import {
  EVIDENCE_CLAIM_KINDS,
  EVIDENCE_PERMISSION_STATUSES,
  EVIDENCE_PRIVACY_LEVELS,
  EVIDENCE_REVIEW_DECISIONS,
  EVIDENCE_SOURCE_TYPES,
  EVIDENCE_STATUSES,
  EVIDENCE_SUPPORT_STATUSES,
  evidenceClaimManifestSchema,
  evidenceRecordSchema,
  evidenceRegistrySchema,
  evidenceReviewDecisionSchema,
  evaluateEvidenceStatus,
  parseEvidenceClaimManifestYaml,
  parseEvidenceRegistryYaml,
  parseEvidenceReviewDecisionYaml,
  sha256Source,
  type EvidenceRecord,
} from "./evidenceSchema";

const REGISTRY_YAML = `
version: 1
evidence:
  - id: ev.bbbbbbbb
    title: Synthetic controlled observation
    sourceType: first-party
    source:
      kind: controlled-reference
      referenceId: ref.1234abcd
    capturedDate: "2026-07-16"
    jurisdictions: [CN, AU, CN]
    targetMarkets: [global, AU-NZ, NZ, AU, AU]
    supportStatus: supported
    supportedClaims:
      - id: claim.beta-signal
        boundary: Synthetic beta boundary.
      - id: claim.alpha-fact
        boundary: Synthetic alpha boundary.
    limitations:
      - Synthetic limitation B.
      - Synthetic limitation A.
      - Synthetic limitation B.
    reviewDueDate: "2027-01-12"
    permission:
      status: restricted
      attributionRequired: false
    privacy: internal
    quantitative: true
    method:
      summary: Synthetic counted observations only.
      denominator: 12
      deduplication: One synthetic observation per opaque test record.
  - id: ev.aaaaaaaa
    title: Synthetic public source
    sourceType: official
    source:
      kind: public-url
      url: https://example.com/public-evidence
    capturedDate: "2026-07-16"
    jurisdictions: [CN]
    targetMarkets: [AU]
    supportStatus: supported
    supportedClaims:
      - id: claim.alpha-fact
        boundary: Synthetic alpha boundary.
    limitations: [Synthetic public limitation.]
    reviewDueDate: "2027-01-12"
    permission:
      status: permitted
      attributionRequired: true
      attribution: Example public source
    privacy: public
`;

const REGISTRY_YAML_REORDERED = `
evidence:
  - privacy: public
    permission:
      attribution: Example public source
      attributionRequired: true
      status: permitted
    reviewDueDate: "2027-01-12"
    limitations:
      - Synthetic public limitation.
      - Synthetic public limitation.
    supportedClaims:
      - boundary: Synthetic alpha boundary.
        id: claim.alpha-fact
    supportStatus: supported
    targetMarkets: [AU, AU]
    jurisdictions: [CN, CN]
    capturedDate: "2026-07-16"
    source:
      url: https://example.com/public-evidence
      kind: public-url
    sourceType: official
    title: Synthetic public source
    id: ev.aaaaaaaa
  - method:
      deduplication: One synthetic observation per opaque test record.
      denominator: 12
      summary: Synthetic counted observations only.
    quantitative: true
    privacy: internal
    permission: { attributionRequired: false, status: restricted }
    reviewDueDate: "2027-01-12"
    limitations: [Synthetic limitation B., Synthetic limitation B., Synthetic limitation A.]
    supportedClaims:
      - { boundary: Synthetic alpha boundary., id: claim.alpha-fact }
      - { boundary: Synthetic beta boundary., id: claim.beta-signal }
    supportStatus: supported
    targetMarkets: [AU, global, NZ, AU-NZ]
    jurisdictions: [AU, CN]
    capturedDate: "2026-07-16"
    source: { referenceId: ref.1234abcd, kind: controlled-reference }
    sourceType: first-party
    title: Synthetic controlled observation
    id: ev.bbbbbbbb
version: 1
`;

const CLAIM_MANIFEST_YAML = `
version: 1
articleId: article.synthetic-evidence
articlePath: content/blog/synthetic-evidence.mdx
claims:
  - id: claim.beta-signal
    kind: signal
    excerpt: "Synthetic beta excerpt."
    boundary: Synthetic beta boundary.
    evidenceIds: [ev.bbbbbbbb, ev.aaaaaaaa, ev.bbbbbbbb]
  - id: claim.alpha-fact
    kind: fact
    excerpt: "  Exact synthetic article substring.  "
    boundary: Synthetic alpha boundary.
    evidenceIds: [ev.aaaaaaaa]
`;

const REVIEW_DECISION_YAML = `
version: 1
articleId: article.synthetic-evidence
decision: approved
reviewer: Synthetic Reviewer
reviewedDate: "2026-07-16"
articleDigest: sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
claimManifestDigest: sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
notes: Synthetic approval fixture.
`;

const BASE_RECORD_INPUT = {
  id: "ev.aaaaaaaa",
  title: "Synthetic public source",
  sourceType: "official",
  source: {
    kind: "public-url",
    url: "https://example.com/public-evidence",
  },
  capturedDate: "2026-07-16",
  jurisdictions: ["CN"],
  targetMarkets: ["AU"],
  supportStatus: "supported",
  supportedClaims: [
    {
      id: "claim.alpha-fact",
      boundary: "Synthetic alpha boundary.",
    },
  ],
  limitations: ["Synthetic limitation."],
  reviewDueDate: "2027-01-12",
  permission: {
    status: "permitted",
    attributionRequired: false,
  },
  privacy: "public",
};

function record(overrides: Record<string, unknown> = {}): EvidenceRecord {
  const permissionOverride = overrides.permission as
    | Record<string, unknown>
    | undefined;

  return evidenceRecordSchema.parse({
    ...BASE_RECORD_INPUT,
    ...overrides,
    permission: {
      ...BASE_RECORD_INPUT.permission,
      ...permissionOverride,
    },
  });
}

function expectDeepFrozen(value: unknown): void {
  if (value === null || typeof value !== "object") return;

  expect(Object.isFrozen(value)).toBe(true);
  for (const nested of Object.values(value)) {
    expectDeepFrozen(nested);
  }
}

describe("evidence vocabulary", () => {
  it("exports the exact frozen contract values", () => {
    expect(EVIDENCE_SOURCE_TYPES).toEqual([
      "official",
      "first-party",
      "industry-analysis",
      "interview",
      "allowlisted-other",
    ]);
    expect(EVIDENCE_PRIVACY_LEVELS).toEqual([
      "public",
      "internal",
      "restricted",
    ]);
    expect(EVIDENCE_PERMISSION_STATUSES).toEqual([
      "permitted",
      "restricted",
      "unresolved",
    ]);
    expect(EVIDENCE_SUPPORT_STATUSES).toEqual(["supported", "unsupported"]);
    expect(EVIDENCE_CLAIM_KINDS).toEqual([
      "fact",
      "signal",
      "inference",
      "limitation",
    ]);
    expect(EVIDENCE_REVIEW_DECISIONS).toEqual([
      "approved",
      "rejected",
      "correction-requested",
    ]);
    expect(EVIDENCE_STATUSES).toEqual([
      "public",
      "restricted",
      "expired",
      "unsupported",
    ]);

    for (const values of [
      EVIDENCE_SOURCE_TYPES,
      EVIDENCE_PRIVACY_LEVELS,
      EVIDENCE_PERMISSION_STATUSES,
      EVIDENCE_SUPPORT_STATUSES,
      EVIDENCE_CLAIM_KINDS,
      EVIDENCE_REVIEW_DECISIONS,
      EVIDENCE_STATUSES,
    ]) {
      expect(Object.isFrozen(values)).toBe(true);
    }
  });
});

describe("evidence schemas and YAML parsers", () => {
  it("accepts and deep-freezes an empty registry because the contract permits EvidenceRecord[]", () => {
    const parsed = parseEvidenceRegistryYaml("version: 1\nevidence: []\n");

    expect(parsed).toEqual({ version: 1, evidence: [] });
    expectDeepFrozen(parsed);
  });

  it("parses, canonicalizes, defaults, clones, and deep-freezes a registry", () => {
    const parsed = parseEvidenceRegistryYaml(
      REGISTRY_YAML,
      "content/seo/evidence/registry.yaml",
    );

    expect(parsed.version).toBe(1);
    expect(parsed.evidence.map(({ id }) => id)).toEqual([
      "ev.aaaaaaaa",
      "ev.bbbbbbbb",
    ]);
    expect(parsed.evidence[0].quantitative).toBe(false);
    expect(parsed.evidence[1].jurisdictions).toEqual(["AU", "CN"]);
    expect(parsed.evidence[1].targetMarkets).toEqual([
      "AU",
      "NZ",
      "AU-NZ",
      "global",
    ]);
    expect(parsed.evidence[1].limitations).toEqual([
      "Synthetic limitation A.",
      "Synthetic limitation B.",
    ]);
    expect(parsed.evidence[1].supportedClaims.map(({ id }) => id)).toEqual([
      "claim.alpha-fact",
      "claim.beta-signal",
    ]);
    expectDeepFrozen(parsed);
  });

  it("parses and canonicalizes a claim manifest while preserving exact excerpt text", () => {
    const parsed = parseEvidenceClaimManifestYaml(CLAIM_MANIFEST_YAML);

    expect(parsed.claims.map(({ id }) => id)).toEqual([
      "claim.alpha-fact",
      "claim.beta-signal",
    ]);
    expect(parsed.claims[0].excerpt).toBe(
      "  Exact synthetic article substring.  ",
    );
    expect(parsed.claims[1].evidenceIds).toEqual([
      "ev.aaaaaaaa",
      "ev.bbbbbbbb",
    ]);
    expectDeepFrozen(parsed);
  });

  it("parses and deep-freezes every review decision value", () => {
    for (const decision of EVIDENCE_REVIEW_DECISIONS) {
      const parsed = parseEvidenceReviewDecisionYaml(
        REVIEW_DECISION_YAML.replace(
          "decision: approved",
          `decision: ${decision}`,
        ),
      );
      expect(parsed.decision).toBe(decision);
      expectDeepFrozen(parsed);
    }
  });

  it("produces identical canonical output for semantically equivalent YAML", () => {
    expect(parseEvidenceRegistryYaml(REGISTRY_YAML_REORDERED)).toEqual(
      parseEvidenceRegistryYaml(REGISTRY_YAML),
    );
    expect(
      JSON.stringify(parseEvidenceRegistryYaml(REGISTRY_YAML_REORDERED)),
    ).toBe(JSON.stringify(parseEvidenceRegistryYaml(REGISTRY_YAML)));
  });

  it("does not freeze or retain aliases to caller-owned schema input", () => {
    const limitations = ["Synthetic limitation."];
    const supportedClaims = [
      {
        id: "claim.alpha-fact",
        boundary: "Synthetic alpha boundary.",
      },
    ];
    const input = {
      version: 1,
      evidence: [
        {
          ...BASE_RECORD_INPUT,
          limitations,
          supportedClaims,
        },
      ],
    };

    const parsed = evidenceRegistrySchema.parse(input);

    expect(Object.isFrozen(input)).toBe(false);
    expect(Object.isFrozen(input.evidence)).toBe(false);
    expect(Object.isFrozen(limitations)).toBe(false);
    expect(Object.isFrozen(supportedClaims)).toBe(false);

    limitations.push("Caller mutation after parsing.");
    supportedClaims[0].boundary = "Caller changed boundary.";
    input.evidence[0].title = "Caller changed title";

    expect(parsed.evidence[0].limitations).toEqual(["Synthetic limitation."]);
    expect(parsed.evidence[0].supportedClaims[0].boundary).toBe(
      "Synthetic alpha boundary.",
    );
    expect(parsed.evidence[0].title).toBe("Synthetic public source");
    expectDeepFrozen(parsed);
  });

  it("rejects unknown keys at root and nested object boundaries", () => {
    expect(() =>
      parseEvidenceRegistryYaml(
        REGISTRY_YAML.replace("version: 1", "version: 1\nunexpected: true"),
      ),
    ).toThrow(/unexpected|unrecognized key/i);

    expect(() =>
      parseEvidenceRegistryYaml(
        REGISTRY_YAML.replace(
          "      url: https://example.com/public-evidence",
          "      url: https://example.com/public-evidence\n      unexpected: true",
        ),
      ),
    ).toThrow(/unexpected|unrecognized key/i);

    expect(() =>
      parseEvidenceClaimManifestYaml(
        CLAIM_MANIFEST_YAML.replace(
          "articlePath: content/blog/synthetic-evidence.mdx",
          "articlePath: content/blog/synthetic-evidence.mdx\nunexpected: true",
        ),
      ),
    ).toThrow(/unexpected|unrecognized key/i);

    expect(() =>
      parseEvidenceReviewDecisionYaml(
        REVIEW_DECISION_YAML.replace(
          "notes: Synthetic approval fixture.",
          "notes: Synthetic approval fixture.\nunexpected: true",
        ),
      ),
    ).toThrow(/unexpected|unrecognized key/i);
  });

  it("rejects duplicate YAML keys before schema validation", () => {
    expect(() =>
      parseEvidenceRegistryYaml(
        REGISTRY_YAML.replace("version: 1", "version: 1\nversion: 1"),
        "duplicate-registry.yaml",
      ),
    ).toThrow(
      /duplicate-registry\.yaml.*duplicate key|duplicate key.*duplicate-registry\.yaml/i,
    );
  });

  it("rejects duplicate evidence, manifest claim, and supported-claim IDs", () => {
    expect(() =>
      parseEvidenceRegistryYaml(
        REGISTRY_YAML.replace("ev.bbbbbbbb", "ev.aaaaaaaa"),
      ),
    ).toThrow(/duplicate evidence id.*ev\.aaaaaaaa/i);

    expect(() =>
      parseEvidenceClaimManifestYaml(
        CLAIM_MANIFEST_YAML.replace("claim.beta-signal", "claim.alpha-fact"),
      ),
    ).toThrow(/duplicate claim id.*claim\.alpha-fact/i);

    const duplicatedSupportedClaim = REGISTRY_YAML.replace(
      "      - id: claim.beta-signal\n        boundary: Synthetic beta boundary.",
      "      - id: claim.alpha-fact\n        boundary: Synthetic beta boundary.",
    );
    expect(() => parseEvidenceRegistryYaml(duplicatedSupportedClaim)).toThrow(
      /duplicate supported claim id.*claim\.alpha-fact/i,
    );
  });

  it.each([
    [
      "anchor",
      REGISTRY_YAML.replace(
        "title: Synthetic public source",
        "title: &title Synthetic public source",
      ),
    ],
    [
      "alias",
      REGISTRY_YAML.replace(
        "limitations: [Synthetic public limitation.]",
        "limitations: &limits [Synthetic public limitation.]\n    method: *limits",
      ),
    ],
    [
      "merge key",
      REGISTRY_YAML.replace(
        "  - id: ev.aaaaaaaa",
        "  - <<: {}\n    id: ev.aaaaaaaa",
      ),
    ],
  ])("rejects YAML %s syntax", (_label, yaml) => {
    expect(() => parseEvidenceRegistryYaml(yaml)).toThrow(
      /anchor|alias|merge/i,
    );
  });

  it.each([
    ["capturedDate", "2026-02-30"],
    ["capturedDate", "2026-2-03"],
    ["capturedDate", "0000-01-01"],
    ["reviewDueDate", "2027-02-29"],
  ])("rejects invalid real calendar value for %s", (field, value) => {
    const invalid = REGISTRY_YAML.replace(
      `${field}: \"${field === "capturedDate" ? "2026-07-16" : "2027-01-12"}\"`,
      `${field}: \"${value}\"`,
    );
    expect(() => parseEvidenceRegistryYaml(invalid)).toThrow(
      new RegExp(`${field}.*YYYY-MM-DD|${field}.*calendar`, "i"),
    );
  });

  it("rejects invalid reviewed dates and digests", () => {
    expect(() =>
      parseEvidenceReviewDecisionYaml(
        REVIEW_DECISION_YAML.replace("2026-07-16", "2026-02-29"),
      ),
    ).toThrow(/reviewedDate.*YYYY-MM-DD|reviewedDate.*calendar/i);

    expect(() =>
      parseEvidenceReviewDecisionYaml(
        REVIEW_DECISION_YAML.replace(
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "sha256:ABC",
        ),
      ),
    ).toThrow(/articleDigest.*sha256/i);
  });

  it("returns a structured schema failure for a malformed public URL", () => {
    const result = evidenceRecordSchema.safeParse({
      ...BASE_RECORD_INPUT,
      source: { kind: "public-url", url: "not-a-url" },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(({ path }) => path.join(".") === "source.url"),
      ).toBe(true);
    }
  });

  it("enforces exact IDs, HTTPS sources, paths, and strict shapes", () => {
    expect(() =>
      evidenceRecordSchema.parse({
        ...BASE_RECORD_INPUT,
        id: "ev.AAAAAAAA",
      }),
    ).toThrow(/ev\./i);
    expect(() =>
      evidenceRecordSchema.parse({
        ...BASE_RECORD_INPUT,
        source: { kind: "public-url", url: "http://example.com/evidence" },
      }),
    ).toThrow(/https/i);
    expect(() =>
      evidenceRecordSchema.parse({
        ...BASE_RECORD_INPUT,
        source: { kind: "controlled-reference", referenceId: "ref.private" },
      }),
    ).toThrow(/ref\./i);
    expect(() =>
      evidenceClaimManifestSchema.parse({
        version: 1,
        articleId: "article.synthetic-evidence",
        articlePath: "../synthetic-evidence.mdx",
        claims: [
          {
            id: "claim.alpha-fact",
            kind: "fact",
            excerpt: "Synthetic excerpt.",
            boundary: "Synthetic boundary.",
            evidenceIds: ["ev.aaaaaaaa"],
          },
        ],
      }),
    ).toThrow(/content\/blog/i);
    expect(() =>
      evidenceReviewDecisionSchema.parse({
        version: 1,
        articleId: "article.synthetic-evidence",
        decision: "approved",
        reviewer: "Synthetic Reviewer",
        reviewedDate: "2026-07-16",
        articleDigest:
          "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        claimManifestDigest:
          "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        unexpected: true,
      }),
    ).toThrow(/unexpected|unrecognized key/i);
  });
});

describe("evaluateEvidenceStatus", () => {
  it("treats the review due date itself as valid and the next UTC calendar day as expired", () => {
    const publicRecord = record({ reviewDueDate: "2026-07-18" });

    expect(evaluateEvidenceStatus(publicRecord, "2026-07-18")).toBe("public");
    expect(evaluateEvidenceStatus(publicRecord, "2026-07-19")).toBe("expired");
  });

  it.each([
    ["internal privacy", { privacy: "internal" }],
    ["restricted privacy", { privacy: "restricted" }],
    ["restricted permission", { permission: { status: "restricted" } }],
    ["unresolved permission", { permission: { status: "unresolved" } }],
  ])("returns restricted for %s", (_label, overrides) => {
    expect(evaluateEvidenceStatus(record(overrides), "2026-07-18")).toBe(
      "restricted",
    );
  });

  it("applies unsupported > expired > restricted > public precedence", () => {
    const restrictedAndExpired = record({
      privacy: "restricted",
      permission: { status: "unresolved" },
      reviewDueDate: "2026-07-17",
    });
    expect(evaluateEvidenceStatus(restrictedAndExpired, "2026-07-18")).toBe(
      "expired",
    );

    const unsupportedExpiredRestricted = record({
      supportStatus: "unsupported",
      privacy: "restricted",
      permission: { status: "restricted" },
      reviewDueDate: "2026-07-17",
    });
    expect(
      evaluateEvidenceStatus(unsupportedExpiredRestricted, "2026-07-18"),
    ).toBe("unsupported");

    expect(evaluateEvidenceStatus(record(), "2026-07-18")).toBe("public");
  });

  it("rejects an invalid as-of calendar date", () => {
    expect(() => evaluateEvidenceStatus(record(), "2026-02-30")).toThrow(
      /asOfDate.*YYYY-MM-DD|asOfDate.*calendar/i,
    );
  });
});

describe("sha256Source", () => {
  it("hashes the exact raw UTF-8 source deterministically", () => {
    expect(sha256Source("abc")).toBe(
      "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(sha256Source("abc\n")).not.toBe(sha256Source("abc"));
  });
});
