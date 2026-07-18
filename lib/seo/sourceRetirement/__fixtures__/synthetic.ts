import {
  computeUrlDispositionReportDigest,
  type UrlDispositionPreflightReport,
} from "../../urlDispositions";
import {
  computeSourceRetirementArtifactDigest,
  computeSourceRetirementInventoryDigest,
  type SourceRetirementEvidence,
  type SourceRetirementInput,
  type SourceRetirementParity,
} from "..";

const ZERO_DIGEST = `sha256:${"0".repeat(64)}` as const;
const FIXTURE_DIGEST = `sha256:${"1".repeat(64)}` as const;
const AS_OF = "2026-07-18";
const CAPTURED_AT = "2026-07-18T10:00:00.000Z";

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

export function createSyntheticSourceRetirementInput(
  overrides: Partial<SourceRetirementInput> = {},
): SourceRetirementInput {
  return makeInput(overrides);
}
