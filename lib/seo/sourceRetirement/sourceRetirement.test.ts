import {
  computeUrlDispositionReportDigest,
  type UrlDispositionPreflightReport,
} from "../urlDispositions";
import {
  buildSourceRetirementPreflight,
  computeSourceRetirementArtifactDigest,
  computeSourceRetirementInventoryDigest,
  computeSourceRetirementReportDigest,
  type SourceRetirementEvidence,
  type SourceRetirementInput,
  type SourceRetirementParity,
  type SourceRetirementPreflightReport,
} from "./index";

const ZERO_DIGEST = `sha256:${"0".repeat(64)}` as const;
const FIXTURE_DIGEST = `sha256:${"1".repeat(64)}` as const;
const OTHER_DIGEST = `sha256:${"2".repeat(64)}` as const;
const AS_OF = "2026-07-18";
const CAPTURED_AT = "2026-07-18T10:00:00.000Z";
const FUTURE_CAPTURED_AT = "2026-07-19T10:00:00.000Z";

function evidence(
  id: string,
  overrides: Partial<SourceRetirementEvidence> = {},
): SourceRetirementEvidence {
  return {
    id,
    origin: "fixture",
    public: false,
    source: `fixture://${id}`,
    capturedAt: CAPTURED_AT,
    digest: FIXTURE_DIGEST,
    ...overrides,
  };
}

function equalParity<T>(value: T, id: string): SourceRetirementParity<T> {
  return {
    status: "equal",
    legacy: value,
    governed: value,
    decisionId: null,
    evidence: evidence(id),
  };
}

function urlDispositionReport(
  artifactDigest: string = ZERO_DIGEST,
  status: UrlDispositionPreflightReport["status"] = "approved_for_preflight",
): UrlDispositionPreflightReport {
  const report: Omit<UrlDispositionPreflightReport, "reportDigest"> = {
    version: 1,
    asOf: "2026-07-18T04:00:00.000Z",
    status,
    artifactDigest:
      artifactDigest as UrlDispositionPreflightReport["artifactDigest"],
    scope: {
      scopeId: "fixture-scope",
      dispositionIds: [],
      sourceUrls: [],
      sourceCount: 0,
      destinationBundles: [],
    },
    blockers: [],
    dispositions: [],
    unaffectedUrls: {
      status: "satisfied",
      expected: [],
      reported: [],
      missing: [],
      unexpected: [],
      conflicts: [],
    },
    releaseGate: {
      status: "satisfied",
      releaseId: "fixture-release",
      artifactDigest:
        artifactDigest as UrlDispositionPreflightReport["artifactDigest"],
      contentApprover: "fixture-content-reviewer",
      productionApprover: "fixture-production-reviewer",
      verifiedReportDigest: null,
    },
    productionExecution: {
      supported: false,
      allowed: false,
      reason:
        "Fixture only; production execution is intentionally unsupported.",
    },
  };
  const reportDigest = computeUrlDispositionReportDigest(report);
  return {
    ...report,
    releaseGate: { ...report.releaseGate, verifiedReportDigest: reportDigest },
    reportDigest,
  };
}

function makeInput(
  overrides: Partial<SourceRetirementInput> = {},
): SourceRetirementInput {
  const articleIdentity = {
    contentId: "article.alpha",
    slug: "alpha",
    route: "/article/alpha",
    clusterId: "supplier-verification",
    bundleId: "supplier-verification",
  };
  const legacyArticle = {
    ...articleIdentity,
    sourceKind: "legacy" as const,
    sourceFamily: "legacy-cluster-yaml",
    contentDigest: FIXTURE_DIGEST,
    identityDigest: FIXTURE_DIGEST,
    status: "published" as const,
  };
  const governedArticle = {
    ...articleIdentity,
    sourceKind: "governed" as const,
    sourceFamily: "governed-registry",
    contentDigest: FIXTURE_DIGEST,
    identityDigest: FIXTURE_DIGEST,
    status: "published" as const,
  };
  const base: SourceRetirementInput = {
    version: 1,
    asOf: AS_OF,
    artifact: {
      id: "source-retirement-alpha",
      version: "source-retirement-v1",
      digest: ZERO_DIGEST,
    },
    scope: {
      sourceFamilies: ["legacy-cluster-yaml"],
      bundleIds: ["supplier-verification"],
      articleIds: ["article.alpha"],
    },
    legacy: {
      sourceKind: "legacy",
      sourceFamily: "legacy-cluster-yaml",
      bundleId: "supplier-verification",
      parserVersion: "legacy-parser-v1",
      readerVersion: "article-reader-v1",
      inventoryDigest: ZERO_DIGEST,
      evidence: evidence("legacy-inventory"),
      articles: [legacyArticle],
    },
    governed: {
      sourceKind: "governed",
      sourceFamily: "governed-registry",
      bundleId: "supplier-verification",
      parserVersion: "governed-parser-v1",
      readerVersion: "article-reader-v1",
      inventoryDigest: ZERO_DIGEST,
      evidence: evidence("governed-inventory"),
      articles: [governedArticle],
    },
    parserParity: {
      status: "equal",
      legacy: {
        parserVersion: "legacy-parser-v1",
        readerVersion: "article-reader-v1",
        readDigest: FIXTURE_DIGEST,
        articleCount: 1,
        evidence: evidence("legacy-read"),
      },
      governed: {
        parserVersion: "governed-parser-v1",
        readerVersion: "article-reader-v1",
        readDigest: FIXTURE_DIGEST,
        articleCount: 1,
        evidence: evidence("governed-read"),
      },
      decisionId: null,
      evidence: evidence("parser-parity"),
    },
    articles: [
      {
        articleId: "article.alpha",
        identity: equalParity(articleIdentity, "identity-parity"),
        contentDigest: equalParity(FIXTURE_DIGEST, "content-parity"),
        route: equalParity("/article/alpha", "route-parity"),
        canonical: equalParity("/article/alpha", "canonical-parity"),
        sitemap: equalParity(true, "sitemap-parity"),
        index: equalParity(true, "index-parity"),
        navigation: equalParity(["/article/alpha"], "navigation-parity"),
        recommendations: equalParity([], "recommendation-parity"),
        diagnostics: equalParity([], "diagnostic-parity"),
      },
    ],
    graphParity: {
      version: 1,
      status: "equal",
      legacyDigest: ZERO_DIGEST,
      governedDigest: ZERO_DIGEST,
      articles: [
        {
          articleId: "article.alpha",
          node: equalParity("article.alpha", "graph-node-parity"),
          recommendations: equalParity([], "graph-recommendation-parity"),
          diagnostics: equalParity([], "graph-diagnostic-parity"),
        },
      ],
      decisionId: null,
      evidence: evidence("graph-parity"),
    },
    urlDisposition: urlDispositionReport(),
    migrationLedger: {
      version: 1,
      status: "valid",
      locked: true,
      digest: "a".repeat(64),
      artifactDigest: ZERO_DIGEST,
      evidence: evidence("migration-ledger"),
    },
    rollback: {
      id: "restore-source-retirement-alpha",
      status: "ready",
      artifactDigest: ZERO_DIGEST,
      sourceInventoryDigest: ZERO_DIGEST,
      restoreTarget: "legacy-cluster-yaml",
      steps: ["restore the governed source snapshot"],
      evidence: evidence("rollback-plan"),
    },
    approvedDecisions: [],
    approvals: [
      {
        kind: "parity",
        actor: { id: "fixture-parity-reviewer", type: "human" },
        approvedAt: CAPTURED_AT,
        artifactDigest: ZERO_DIGEST,
        evidence: evidence("parity-approval"),
      },
      {
        kind: "content",
        actor: { id: "fixture-content-reviewer", type: "human" },
        approvedAt: CAPTURED_AT,
        artifactDigest: ZERO_DIGEST,
        evidence: evidence("content-approval"),
      },
      {
        kind: "production",
        actor: { id: "fixture-production-reviewer", type: "human" },
        approvedAt: CAPTURED_AT,
        artifactDigest: ZERO_DIGEST,
        evidence: evidence("production-approval"),
      },
    ],
  };

  const merged = {
    ...base,
    ...overrides,
    artifact: { ...base.artifact, ...overrides.artifact },
    scope: { ...base.scope, ...overrides.scope },
    legacy: { ...base.legacy, ...overrides.legacy },
    governed: { ...base.governed, ...overrides.governed },
    parserParity: { ...base.parserParity, ...overrides.parserParity },
    graphParity: { ...base.graphParity, ...overrides.graphParity },
    rollback: { ...base.rollback, ...overrides.rollback },
  } as SourceRetirementInput;
  const legacyInventoryDigest = computeSourceRetirementInventoryDigest(
    merged.legacy,
  );
  const governedInventoryDigest = computeSourceRetirementInventoryDigest(
    merged.governed,
  );
  const withInventoryDigests: SourceRetirementInput = {
    ...merged,
    legacy: { ...merged.legacy, inventoryDigest: legacyInventoryDigest },
    governed: {
      ...merged.governed,
      inventoryDigest: governedInventoryDigest,
    },
    graphParity: {
      ...merged.graphParity,
      legacyDigest: FIXTURE_DIGEST,
      governedDigest: FIXTURE_DIGEST,
    },
    urlDisposition: overrides.urlDisposition ?? urlDispositionReport(),
    rollback: {
      ...merged.rollback,
      sourceInventoryDigest: legacyInventoryDigest,
    } as SourceRetirementInput["rollback"],
  };
  const artifactDigest =
    computeSourceRetirementArtifactDigest(withInventoryDigests);

  return {
    ...withInventoryDigests,
    artifact: { ...withInventoryDigests.artifact, digest: artifactDigest },
    migrationLedger: {
      ...withInventoryDigests.migrationLedger,
      artifactDigest,
    } as SourceRetirementInput["migrationLedger"],
    rollback: {
      ...withInventoryDigests.rollback,
      artifactDigest,
    } as SourceRetirementInput["rollback"],
    approvedDecisions: withInventoryDigests.approvedDecisions.map(
      (decision) => ({ ...decision, artifactDigest }),
    ),
    approvals: withInventoryDigests.approvals.map((approval) => ({
      ...approval,
      artifactDigest,
    })),
  };
}

function codes(report: SourceRetirementPreflightReport): string[] {
  return report.blockers.map((issue) => issue.code);
}

function mutableRecordAt(
  value: unknown,
  path: readonly (string | number)[] = [],
): Record<string, unknown> {
  let current = value;
  path.forEach((segment) => {
    if (typeof segment === "number") {
      if (!Array.isArray(current)) throw new Error("Expected mutable array.");
      current = current[segment];
      return;
    }
    if (
      typeof current !== "object" ||
      current === null ||
      Array.isArray(current)
    )
      throw new Error("Expected mutable record.");
    current = (current as Record<string, unknown>)[segment];
  });
  if (typeof current !== "object" || current === null || Array.isArray(current))
    throw new Error("Expected mutable record.");
  return current as Record<string, unknown>;
}

describe("source retirement parity preflight", () => {
  it("returns a frozen preview report for a complete non-public fixture", () => {
    const input = makeInput();
    const before = JSON.stringify(input);
    const report = buildSourceRetirementPreflight(input);

    expect(report.status).toBe("preview_ready");
    expect(report.asOf).toBe(AS_OF);
    expect(report.blockers).toEqual([]);
    expect(report.parity.duplicateIdentities).toBe(0);
    expect(report.productionExecution).toEqual({
      supported: false,
      allowed: false,
      reason: expect.any(String),
    });
    expect(report.retirementExecution.allowed).toBe(false);
    expect(report.reportDigest).toMatch(/^sha256:[a-f0-9]{64}$/);
    const { reportDigest, ...reportSubject } = report;
    expect(reportDigest).toBe(
      computeSourceRetirementReportDigest(reportSubject),
    );
    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.parity)).toBe(true);
    expect(JSON.stringify(input)).toBe(before);
  });

  it("blocks the current real state when the ledger is pending/unlocked and Ticket 24 is not ready", () => {
    const input = makeInput({
      migrationLedger: {
        ...makeInput().migrationLedger,
        status: "approval-required",
        locked: false,
      } as SourceRetirementInput["migrationLedger"],
      urlDisposition: urlDispositionReport(OTHER_DIGEST, "blocked"),
    });
    const report = buildSourceRetirementPreflight(input);

    expect(report.status).toBe("blocked");
    expect(codes(report)).toEqual(
      expect.arrayContaining([
        "ledger_not_valid",
        "ledger_not_locked",
        "url_disposition_not_ready",
      ]),
    );
  });

  it("fails closed when Ticket 24 execution metadata is missing or enabled", () => {
    const input = makeInput();
    const missingExecution = buildSourceRetirementPreflight({
      ...input,
      urlDisposition: {
        ...input.urlDisposition,
        productionExecution: undefined,
      } as unknown as UrlDispositionPreflightReport,
    });
    const unsafeExecution = buildSourceRetirementPreflight({
      ...input,
      urlDisposition: {
        ...input.urlDisposition,
        productionExecution: {
          supported: true,
          allowed: true,
          reason: "test-only mutation",
        },
      } as unknown as UrlDispositionPreflightReport,
    });

    expect(codes(missingExecution)).toContain("input_schema_invalid");
    expect(codes(unsafeExecution)).toContain("input_schema_invalid");
  });

  it.each([
    [
      "root",
      (input: Record<string, unknown>) =>
        (mutableRecordAt(input).unexpected = true),
    ],
    [
      "inventory",
      (input: Record<string, unknown>) =>
        (mutableRecordAt(input, ["legacy"]).unexpected = true),
    ],
    [
      "inventory article",
      (input: Record<string, unknown>) =>
        (mutableRecordAt(input, ["legacy", "articles", 0]).unexpected = true),
    ],
    [
      "article parity",
      (input: Record<string, unknown>) =>
        (mutableRecordAt(input, ["articles", 0, "route"]).unexpected = true),
    ],
    [
      "parity evidence",
      (input: Record<string, unknown>) =>
        (mutableRecordAt(input, [
          "articles",
          0,
          "route",
          "evidence",
        ]).unexpected = true),
    ],
    [
      "approval actor",
      (input: Record<string, unknown>) =>
        (mutableRecordAt(input, ["approvals", 0, "actor"]).unexpected = true),
    ],
    [
      "approved decision",
      (input: Record<string, unknown>) => {
        input.approvedDecisions = [
          {
            id: "fixture-decision",
            artifactDigest: mutableRecordAt(input, ["artifact"]).digest,
            evidence: evidence("fixture-decision"),
            rationale: "Fixture-only intentional difference.",
            unexpected: true,
          },
        ];
      },
    ],
  ])("rejects unknown keys at the %s boundary", (_label, mutate) => {
    const input = JSON.parse(JSON.stringify(makeInput())) as Record<
      string,
      unknown
    >;
    mutate(input);

    expect(codes(buildSourceRetirementPreflight(input))).toContain(
      "input_schema_invalid",
    );
  });

  it("rejects Ticket 24 report digest tampering and legacy reports without a report digest", () => {
    const input = makeInput();
    if (!input.urlDisposition)
      throw new Error("Expected Ticket 24 report fixture.");
    const tampered = buildSourceRetirementPreflight({
      ...input,
      urlDisposition: {
        ...input.urlDisposition,
        reportDigest: OTHER_DIGEST,
      },
    });
    const { reportDigest: _reportDigest, ...legacyUrlReport } =
      input.urlDisposition;
    void _reportDigest;
    const legacy = buildSourceRetirementPreflight({
      ...input,
      urlDisposition:
        legacyUrlReport as unknown as UrlDispositionPreflightReport,
    });

    expect(codes(tampered)).toContain("url_disposition_artifact_mismatch");
    expect(codes(legacy)).toContain("input_schema_invalid");
  });

  it("binds each inventory digest independently and rollback to the legacy inventory", () => {
    const input = makeInput();
    const legacyInventoryTamper = buildSourceRetirementPreflight({
      ...input,
      legacy: { ...input.legacy, inventoryDigest: OTHER_DIGEST },
    });
    const governedInventoryTamper = buildSourceRetirementPreflight({
      ...input,
      governed: { ...input.governed, inventoryDigest: OTHER_DIGEST },
    });
    const rollbackTamper = buildSourceRetirementPreflight({
      ...input,
      rollback: {
        ...input.rollback!,
        sourceInventoryDigest: OTHER_DIGEST,
      },
    });

    expect(codes(legacyInventoryTamper)).toContain(
      "source_inventory_digest_mismatch",
    );
    expect(codes(governedInventoryTamper)).toContain(
      "source_inventory_digest_mismatch",
    );
    expect(codes(rollbackTamper)).toContain(
      "rollback_inventory_digest_mismatch",
    );
  });

  it("fails closed on parser version drift and missing parity collections", () => {
    const baseline = makeInput();
    const parserDrift = makeInput({
      parserParity: {
        ...baseline.parserParity,
        legacy: {
          ...baseline.parserParity.legacy!,
          parserVersion: "legacy-parser-v2",
        },
      },
    });
    expect(codes(buildSourceRetirementPreflight(parserDrift))).toContain(
      "parser_parity_mismatch",
    );

    const missingArticles = Object.fromEntries(
      Object.entries(
        JSON.parse(JSON.stringify(makeInput())) as Record<string, unknown>,
      ).filter(([key]) => key !== "articles"),
    );
    expect(buildSourceRetirementPreflight(missingArticles).blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "dependency_missing",
          path: "articles",
        }),
      ]),
    );

    const graphInput = JSON.parse(JSON.stringify(makeInput())) as Record<
      string,
      unknown
    >;
    const missingGraphArticles = {
      ...graphInput,
      graphParity: Object.fromEntries(
        Object.entries(
          graphInput.graphParity as Record<string, unknown>,
        ).filter(([key]) => key !== "articles"),
      ),
    };
    expect(
      buildSourceRetirementPreflight(missingGraphArticles).blockers,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "input_schema_invalid",
          path: "graphParity.articles",
        }),
      ]),
    );
  });

  it("requires Ticket 24 content and production approval independence", () => {
    const unboundUrlReport = urlDispositionReport();
    const candidate = makeInput({
      urlDisposition: {
        ...unboundUrlReport,
        releaseGate: {
          ...unboundUrlReport.releaseGate,
          productionApprover: unboundUrlReport.releaseGate.contentApprover,
        },
      },
    });
    const report = buildSourceRetirementPreflight({
      ...candidate,
      urlDisposition: {
        ...candidate.urlDisposition!,
        artifactDigest: candidate.artifact.digest,
        releaseGate: {
          ...candidate.urlDisposition!.releaseGate,
          artifactDigest: candidate.artifact.digest,
        },
      },
    });

    expect(report.blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "url_disposition_not_ready",
          path: "urlDisposition.releaseGate",
        }),
      ]),
    );
  });

  it("requires independent human approvals for the required review roles", () => {
    const input = makeInput();
    const sharedActor = input.approvals[0].actor;
    const report = buildSourceRetirementPreflight(
      makeInput({
        approvals: input.approvals.map((approval) => ({
          ...approval,
          actor: sharedActor,
        })),
      }),
    );

    expect(codes(report)).toContain("approval_not_independent");
  });

  it("fails closed for legacy-only, governed-only, duplicate, and missing parity identities", () => {
    const input = makeInput({
      legacy: {
        ...makeInput().legacy,
        articles: [
          {
            ...makeInput().legacy.articles[0],
            contentId: "article.legacy-only",
          },
          makeInput().legacy.articles[0],
          makeInput().legacy.articles[0],
        ],
      },
      governed: { ...makeInput().governed, articles: [] },
      articles: [],
    });
    const report = buildSourceRetirementPreflight(input);

    expect(codes(report)).toEqual(
      expect.arrayContaining([
        "duplicate_article_identity",
        "legacy_only_article",
        "missing_article_parity",
      ]),
    );
  });

  it("blocks unknown/null parity and unapproved intentional differences", () => {
    const input = makeInput();
    const article = input.articles[0];
    const changed: SourceRetirementInput = {
      ...input,
      articles: [
        {
          ...article,
          route: {
            ...article.route,
            status: "different",
            governed: "/article/other",
          },
          canonical: {
            ...article.canonical,
            status: "unknown",
            legacy: null,
            governed: null,
          },
          sitemap: {
            ...article.sitemap,
            status: "intentional_difference",
            governed: false,
            decisionId: null,
          },
        },
      ],
    };
    const report = buildSourceRetirementPreflight(changed);

    expect(codes(report)).toEqual(
      expect.arrayContaining([
        "route_parity_mismatch",
        "canonical_parity_unknown",
        "intentional_difference_unapproved",
      ]),
    );
  });

  it("requires graph parity, including recommendations and diagnostics", () => {
    const input = makeInput();
    const report = buildSourceRetirementPreflight({
      ...input,
      graphParity: {
        ...input.graphParity,
        status: "different",
        governedDigest: OTHER_DIGEST,
        articles: [
          {
            ...input.graphParity.articles[0],
            recommendations: {
              ...input.graphParity.articles[0].recommendations,
              status: "unknown",
              legacy: null,
              governed: null,
            },
          },
        ],
      },
    });

    expect(codes(report)).toEqual(
      expect.arrayContaining([
        "graph_drift",
        "graph_recommendation_parity_unknown",
      ]),
    );
  });

  it("rejects version/digest drift and approvals not bound to the same artifact", () => {
    const input = makeInput();
    const report = buildSourceRetirementPreflight({
      ...input,
      artifact: { ...input.artifact, version: "source-retirement-v2" },
      governed: { ...input.governed, inventoryDigest: OTHER_DIGEST },
      approvals: input.approvals.map((approval, index) =>
        index === 0 ? { ...approval, artifactDigest: OTHER_DIGEST } : approval,
      ),
    });

    expect(codes(report)).toEqual(
      expect.arrayContaining([
        "artifact_version_mismatch",
        "source_inventory_digest_mismatch",
        "approval_artifact_mismatch",
      ]),
    );
  });

  it("rejects future production evidence but permits explicitly non-public fixture evidence", () => {
    const fixtureInput = makeInput({
      legacy: {
        ...makeInput().legacy,
        evidence: evidence("future-fixture", {
          capturedAt: FUTURE_CAPTURED_AT,
        }),
      },
    });
    expect(codes(buildSourceRetirementPreflight(fixtureInput))).not.toContain(
      "production_evidence_future_dated",
    );

    const productionInput = makeInput({
      legacy: {
        ...makeInput().legacy,
        evidence: evidence("future-production", {
          origin: "production",
          public: true,
          capturedAt: FUTURE_CAPTURED_AT,
        }),
      },
    });
    expect(codes(buildSourceRetirementPreflight(productionInput))).toContain(
      "production_evidence_future_dated",
    );
  });

  it("requires a split for multiple source families or unrelated bundles", () => {
    const input = makeInput({
      scope: {
        sourceFamilies: ["legacy-cluster-yaml", "legacy-category-json"],
        bundleIds: ["supplier-verification", "factory-audit"],
        articleIds: ["article.alpha"],
      },
    });
    const report = buildSourceRetirementPreflight(input);

    expect(report.status).toBe("split_required");
    expect(codes(report)).toContain("scope_split_required");
  });

  it("produces deterministic Unicode-sorted blockers and a stable digest", () => {
    const input = makeInput();
    const first = buildSourceRetirementPreflight(input);
    const second = buildSourceRetirementPreflight(
      JSON.parse(JSON.stringify(input)),
    );

    expect(first).toEqual(second);
    expect(first.reportDigest).toBe(second.reportDigest);
    expect(first.blockers.map((issue) => issue.path)).toEqual(
      [...first.blockers.map((issue) => issue.path)].sort(),
    );
  });

  it("keeps canonical digests stable across object-key and inventory ordering", () => {
    const input = makeInput();
    const reordered = {
      ...input,
      legacy: {
        ...input.legacy,
        articles: [
          Object.fromEntries(
            Object.entries(input.legacy.articles[0]).reverse(),
          ) as SourceRetirementInput["legacy"]["articles"][number],
        ],
      },
      governed: {
        ...input.governed,
        articles: [
          Object.fromEntries(
            Object.entries(input.governed.articles[0]).reverse(),
          ) as SourceRetirementInput["governed"]["articles"][number],
        ],
      },
    };

    expect(computeSourceRetirementArtifactDigest(input)).toBe(
      computeSourceRetirementArtifactDigest(reordered),
    );
    expect(
      computeSourceRetirementArtifactDigest({
        articles: [
          { alpha: 1, beta: 2 },
          { alpha: 2, beta: 1 },
        ],
      }),
    ).toBe(
      computeSourceRetirementArtifactDigest({
        articles: [
          { beta: 1, alpha: 2 },
          { beta: 2, alpha: 1 },
        ],
      }),
    );
  });

  it("does not treat unavailable metrics as zero", () => {
    const report = buildSourceRetirementPreflight(
      makeInput({
        articles: [],
        legacy: { ...makeInput().legacy, articles: [] },
        governed: { ...makeInput().governed, articles: [] },
      }),
    );

    expect(report.parity.articlesCompared).toBe(null);
    expect(report.parity.unknownSlots).toBe(null);
  });

  it("rejects mutation-capable or implicit-runtime evidence through the static contract surface", () => {
    const report = buildSourceRetirementPreflight(makeInput());
    expect(report.productionExecution.supported).toBe(false);
    expect(report.retirementExecution.supported).toBe(false);
  });
});
