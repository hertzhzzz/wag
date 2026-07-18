import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  EVIDENCE_GATE_ERROR_CODES,
  runEvidenceGate,
  type EvidenceGateReport,
} from "./evidenceGate";
import {
  sha256Source,
  type EvidenceClaimManifest,
  type EvidenceRecord,
  type EvidenceRegistry,
  type EvidenceReviewDecision,
} from "./evidenceSchema";

const ARTICLE_ID = "article.evidence-gate-test";
const ARTICLE_PATH = "content/blog/evidence-gate-test.mdx";
const CLAIM_ID = "claim.samr-regulator-and-gsxt-portal";
const EVIDENCE_ID = "ev.4c1d8b02";
const CLAIM_EXCERPT =
  "SAMR oversees the company registration framework, while GSXT is the official public portal.";
const CLAIM_BOUNDARY =
  "SAMR oversees China's market-regulation and company-registration framework; GSXT is the official public enterprise information portal.";

interface GateFixture {
  articleSource: string;
  claimManifestSource: string;
  registry: EvidenceRegistry;
  claimManifest: EvidenceClaimManifest;
  reviewDecision: EvidenceReviewDecision;
  asOfDate: string;
}

function makeArticleSource(
  options: {
    articleId?: string;
    evidenceIds?: string[];
    excerpt?: string;
  } = {},
): string {
  const articleId = options.articleId ?? ARTICLE_ID;
  const evidenceIds = options.evidenceIds ?? [EVIDENCE_ID];
  const excerpt = options.excerpt ?? CLAIM_EXCERPT;
  const evidenceLines = evidenceIds.map((id) => `  - ${id}`).join("\n");

  return `---
title: "Evidence Gate Test Article"
description: "A deterministic article fixture for evidence validation."
sourceType: "industry-analysis"
category: "China Sourcing Strategy"
author: "Andy Liu"
date: "2026-07-16"
readTime: "5 min read"
ctaTitle: "Request a verification plan"
ctaText: "Compare public records before making a supplier decision."
ctaButtonText: "Request a Plan"
contentId: ${articleId}
cluster: supplier-verification
contentRole: supporting
searchIntent: company-registry-check
funnelStage: problem-aware
primaryKeyword: check Chinese company registration
secondaryKeywords: []
targetMarket: AU
editorialStatus: approved
evidenceIds:
${evidenceLines}
firstPartyContributionId: null
commercialRoot: /supplier-verification
editorialPillar: /article/verify-chinese-supplier
requiredLinks:
  - /supplier-verification
  - /article/verify-chinese-supplier
reviewedBy: Andy Liu
reviewedDate: "2026-07-16"
reviewDueDate: "2027-01-12"
migrationAction: keep
---

${excerpt}
`;
}

function makeEvidenceRecord(): EvidenceRecord {
  return {
    id: EVIDENCE_ID,
    title: "Official market regulation source",
    sourceType: "official",
    source: {
      kind: "public-url",
      url: "https://www.samr.gov.cn/",
    },
    capturedDate: "2026-07-16",
    jurisdictions: ["CN"],
    targetMarkets: ["AU"],
    supportStatus: "supported",
    supportedClaims: [
      {
        id: CLAIM_ID,
        boundary: CLAIM_BOUNDARY,
      },
    ],
    limitations: ["The source does not validate a specific supplier."],
    reviewDueDate: "2027-01-12",
    permission: {
      status: "permitted",
      attributionRequired: true,
      attribution: "State Administration for Market Regulation",
    },
    privacy: "public",
    quantitative: false,
  };
}

function renderClaimManifestSource(
  claimManifest: EvidenceClaimManifest,
): string {
  return `${JSON.stringify(claimManifest, null, 2)}\n`;
}

function refreshReviewDigests(fixture: GateFixture): void {
  fixture.reviewDecision = {
    ...fixture.reviewDecision,
    articleDigest: sha256Source(fixture.articleSource),
    claimManifestDigest: sha256Source(fixture.claimManifestSource),
  };
}

function makeFixture(): GateFixture {
  const articleSource = makeArticleSource();
  const claimManifest: EvidenceClaimManifest = {
    version: 1,
    articleId: ARTICLE_ID,
    articlePath: ARTICLE_PATH,
    claims: [
      {
        id: CLAIM_ID,
        kind: "fact",
        excerpt: CLAIM_EXCERPT,
        boundary: CLAIM_BOUNDARY,
        evidenceIds: [EVIDENCE_ID],
      },
    ],
  };
  const claimManifestSource = renderClaimManifestSource(claimManifest);

  return {
    articleSource,
    claimManifestSource,
    registry: {
      version: 1,
      evidence: [makeEvidenceRecord()],
    },
    claimManifest,
    reviewDecision: {
      version: 1,
      articleId: ARTICLE_ID,
      decision: "approved",
      reviewer: "Andy Liu",
      reviewedDate: "2026-07-16",
      articleDigest: sha256Source(articleSource),
      claimManifestDigest: sha256Source(claimManifestSource),
    },
    asOfDate: "2026-07-18",
  };
}

function runFixture(fixture: GateFixture): EvidenceGateReport {
  return runEvidenceGate(fixture);
}

function issueCodes(report: EvidenceGateReport): string[] {
  return report.issues.map((issue) => issue.code);
}

function replaceManifestEvidence(
  fixture: GateFixture,
  evidenceId: string,
): void {
  fixture.claimManifest = {
    ...fixture.claimManifest,
    claims: fixture.claimManifest.claims.map((claim) => ({
      ...claim,
      evidenceIds: [evidenceId],
    })),
  };
  fixture.claimManifestSource = renderClaimManifestSource(
    fixture.claimManifest,
  );
  fixture.articleSource = makeArticleSource({ evidenceIds: [evidenceId] });
  refreshReviewDigests(fixture);
}

function updateEvidenceRecord(
  fixture: GateFixture,
  update: (record: EvidenceRecord) => EvidenceRecord,
): void {
  const record = fixture.registry.evidence[0];

  if (!record) {
    throw new Error("Expected the evidence fixture to contain one record.");
  }

  fixture.registry = {
    ...fixture.registry,
    evidence: [update(record)],
  };
}

describe("runEvidenceGate", () => {
  it("exports the complete immutable stable error-code contract", () => {
    expect(Object.isFrozen(EVIDENCE_GATE_ERROR_CODES)).toBe(true);
    expect(Object.values(EVIDENCE_GATE_ERROR_CODES)).toEqual([
      "EVIDENCE_UNKNOWN",
      "EVIDENCE_UNSUPPORTED",
      "EVIDENCE_EXPIRED",
      "EVIDENCE_RESTRICTED",
      "EVIDENCE_PERMISSION_DENIED",
      "EVIDENCE_CLAIM_UNKNOWN",
      "EVIDENCE_CLAIM_BOUNDARY",
      "EVIDENCE_CLAIM_EXCERPT_MISSING",
      "EVIDENCE_ARTICLE_ID_MISMATCH",
      "EVIDENCE_ARTICLE_REFERENCE_MISSING",
      "EVIDENCE_METHOD_REQUIRED",
      "EVIDENCE_REVIEW_REJECTED",
      "EVIDENCE_REVIEW_CORRECTION_REQUIRED",
      "EVIDENCE_DECISION_STALE",
    ]);
  });

  it("passes a fully reviewed public claim and returns safe trace data", () => {
    const report = runFixture(makeFixture());

    expect(report).toMatchObject({
      version: 1,
      articleId: ARTICLE_ID,
      asOfDate: "2026-07-18",
      status: "passed",
      decision: "approved",
      reviewer: "Andy Liu",
      reviewedDate: "2026-07-16",
      claimCount: 1,
      evidenceCount: 1,
      issues: [],
    });
    expect(report.claims).toEqual([
      {
        id: CLAIM_ID,
        kind: "fact",
        claimBoundary: CLAIM_BOUNDARY,
        evidence: [
          {
            id: EVIDENCE_ID,
            title: "Official market regulation source",
            url: "https://www.samr.gov.cn/",
            capturedDate: "2026-07-16",
            reviewDueDate: "2027-01-12",
            status: "public",
          },
        ],
      },
    ]);
    expect(report.analytics).toEqual({
      articleId: ARTICLE_ID,
      status: "passed",
      decision: "approved",
      claimCount: 1,
      evidenceCount: 1,
      issueCount: 0,
      issueCodes: [],
      evidence: [{ id: EVIDENCE_ID, status: "public" }],
    });
    expect(JSON.stringify(report)).not.toContain(CLAIM_EXCERPT);
  });

  it("reports unknown evidence without inventing trace details", () => {
    const fixture = makeFixture();
    replaceManifestEvidence(fixture, "ev.ffffffff");

    const report = runFixture(fixture);

    expect(issueCodes(report)).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_UNKNOWN,
    );
    expect(report.analytics.evidence).toEqual([
      { id: "ev.ffffffff", status: "unknown" },
    ]);
  });

  it("reports unsupported evidence", () => {
    const fixture = makeFixture();
    updateEvidenceRecord(fixture, (record) => ({
      ...record,
      supportStatus: "unsupported",
    }));

    expect(issueCodes(runFixture(fixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_UNSUPPORTED,
    );
  });

  it("reports evidence after its review due date as expired", () => {
    const fixture = makeFixture();
    fixture.asOfDate = "2027-01-13";

    expect(issueCodes(runFixture(fixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_EXPIRED,
    );
  });

  it("reports restricted evidence and never renders restricted values", () => {
    const fixture = makeFixture();
    const restrictedTitle =
      "Synthetic Supplier Person 123 Private Street Account 000111";
    const restrictedReference = "ref.deadbeef";
    const restrictedBoundary =
      "Synthetic licence identifier and banking value must remain private.";
    updateEvidenceRecord(fixture, (record) => ({
      ...record,
      title: restrictedTitle,
      source: {
        kind: "controlled-reference",
        referenceId: restrictedReference,
      },
      supportedClaims: [
        {
          id: CLAIM_ID,
          boundary: restrictedBoundary,
        },
      ],
      privacy: "restricted",
    }));
    fixture.claimManifest = {
      ...fixture.claimManifest,
      claims: fixture.claimManifest.claims.map((claim) => ({
        ...claim,
        excerpt: "Synthetic private excerpt 987654321",
        boundary: restrictedBoundary,
      })),
    };
    fixture.claimManifestSource = renderClaimManifestSource(
      fixture.claimManifest,
    );
    refreshReviewDigests(fixture);

    const report = runFixture(fixture);
    const serialized = JSON.stringify(report);

    expect(issueCodes(report)).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_RESTRICTED,
    );
    expect(serialized).not.toContain(restrictedTitle);
    expect(serialized).not.toContain(restrictedReference);
    expect(serialized).not.toContain(restrictedBoundary);
    expect(serialized).not.toContain("Synthetic private excerpt 987654321");
    expect(report.analytics.evidence).toEqual([
      { id: EVIDENCE_ID, status: "restricted" },
    ]);
  });

  it("reports denied, unresolved, or incomplete publication permission", () => {
    const statuses = ["restricted", "unresolved"] as const;

    for (const status of statuses) {
      const fixture = makeFixture();
      updateEvidenceRecord(fixture, (record) => ({
        ...record,
        permission: {
          status,
          attributionRequired: false,
        },
      }));

      expect(issueCodes(runFixture(fixture))).toContain(
        EVIDENCE_GATE_ERROR_CODES.EVIDENCE_PERMISSION_DENIED,
      );
    }

    const missingAttribution = makeFixture();
    updateEvidenceRecord(missingAttribution, (record) => ({
      ...record,
      permission: {
        status: "permitted",
        attributionRequired: true,
      },
    }));
    expect(issueCodes(runFixture(missingAttribution))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_PERMISSION_DENIED,
    );
  });

  it("reports an evidence record that does not support the claim id", () => {
    const fixture = makeFixture();
    updateEvidenceRecord(fixture, (record) => ({
      ...record,
      supportedClaims: [
        {
          id: "claim.different-public-claim",
          boundary: "A different bounded public claim.",
        },
      ],
    }));

    expect(issueCodes(runFixture(fixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_CLAIM_UNKNOWN,
    );
  });

  it("reports an exact claim boundary mismatch", () => {
    const fixture = makeFixture();
    updateEvidenceRecord(fixture, (record) => ({
      ...record,
      supportedClaims: [
        {
          id: CLAIM_ID,
          boundary: "A narrower canonical public boundary.",
        },
      ],
    }));

    expect(issueCodes(runFixture(fixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_CLAIM_BOUNDARY,
    );
  });

  it("reports a claim excerpt that is not an exact article substring", () => {
    const fixture = makeFixture();
    fixture.claimManifest = {
      ...fixture.claimManifest,
      claims: fixture.claimManifest.claims.map((claim) => ({
        ...claim,
        excerpt: "This exact excerpt is absent from the article.",
      })),
    };
    fixture.claimManifestSource = renderClaimManifestSource(
      fixture.claimManifest,
    );
    refreshReviewDigests(fixture);

    expect(issueCodes(runFixture(fixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_CLAIM_EXCERPT_MISSING,
    );
  });

  it("reports article and manifest identity mismatch", () => {
    const fixture = makeFixture();
    fixture.articleSource = makeArticleSource({
      articleId: "article.different-id",
    });
    refreshReviewDigests(fixture);

    expect(issueCodes(runFixture(fixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_ARTICLE_ID_MISMATCH,
    );
  });

  it("reports evidence omitted from article frontmatter", () => {
    const fixture = makeFixture();
    fixture.articleSource = makeArticleSource({
      evidenceIds: ["ev.aaaaaaaa"],
    });
    refreshReviewDigests(fixture);

    expect(issueCodes(runFixture(fixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_ARTICLE_REFERENCE_MISSING,
    );
  });

  it("requires summary, denominator, and deduplication for first-party quantitative evidence", () => {
    const fixture = makeFixture();
    updateEvidenceRecord(fixture, (record) => ({
      ...record,
      sourceType: "first-party",
      quantitative: true,
      method: undefined,
    }));

    const report = runFixture(fixture);
    const methodIssues = report.issues.filter(
      (issue) =>
        issue.code === EVIDENCE_GATE_ERROR_CODES.EVIDENCE_METHOD_REQUIRED,
    );

    expect(methodIssues.map((issue) => issue.field)).toEqual([
      "registry.evidence.method.deduplication",
      "registry.evidence.method.denominator",
      "registry.evidence.method.summary",
    ]);
  });

  it("reports rejected review decisions", () => {
    const fixture = makeFixture();
    fixture.reviewDecision = {
      ...fixture.reviewDecision,
      decision: "rejected",
    };

    expect(issueCodes(runFixture(fixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_REVIEW_REJECTED,
    );
  });

  it("reports correction-requested review decisions", () => {
    const fixture = makeFixture();
    fixture.reviewDecision = {
      ...fixture.reviewDecision,
      decision: "correction-requested",
    };

    expect(issueCodes(runFixture(fixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_REVIEW_CORRECTION_REQUIRED,
    );
  });

  it("rejects a claim manifest object that drifts from its reviewed source", () => {
    const fixture = makeFixture();
    fixture.claimManifest = {
      ...fixture.claimManifest,
      claims: [],
    };

    const report = runFixture(fixture);

    expect(report.status).toBe("failed");
    expect(issueCodes(report)).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_DECISION_STALE,
    );
    expect(report.claimCount).toBe(1);
  });

  it("reports stale approved decisions for either digest mismatch", () => {
    const articleDigestFixture = makeFixture();
    articleDigestFixture.reviewDecision = {
      ...articleDigestFixture.reviewDecision,
      articleDigest: `sha256:${"0".repeat(64)}`,
    };
    const manifestDigestFixture = makeFixture();
    manifestDigestFixture.reviewDecision = {
      ...manifestDigestFixture.reviewDecision,
      claimManifestDigest: `sha256:${"f".repeat(64)}`,
    };

    expect(issueCodes(runFixture(articleDigestFixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_DECISION_STALE,
    );
    expect(issueCodes(runFixture(manifestDigestFixture))).toContain(
      EVIDENCE_GATE_ERROR_CODES.EVIDENCE_DECISION_STALE,
    );
  });

  it("sorts issues, claims, evidence, and analytics deterministically", () => {
    const fixture = makeFixture();
    replaceManifestEvidence(fixture, "ev.ffffffff");
    fixture.reviewDecision = {
      ...fixture.reviewDecision,
      decision: "correction-requested",
    };

    const first = JSON.stringify(runFixture(fixture));
    const second = JSON.stringify(runFixture(fixture));

    expect(first).toBe(second);
  });
});

interface CliFixturePaths {
  directory: string;
  article: string;
  registry: string;
  claims: string;
  review: string;
}

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CLI_PATH = path.join(PROJECT_ROOT, "scripts/seo-evidence-check.ts");
const TSX_PATH = path.join(PROJECT_ROOT, "node_modules/.bin/tsx");
const cliDirectories: string[] = [];

function makeCliFixture(
  options: { unsupported?: boolean } = {},
): CliFixturePaths {
  const directory = mkdtempSync(path.join(os.tmpdir(), "seo-evidence-gate-"));
  cliDirectories.push(directory);
  const article = path.join(directory, "article.mdx");
  const registry = path.join(directory, "registry.yaml");
  const claims = path.join(directory, "claims.yaml");
  const review = path.join(directory, "review.yaml");
  const articleSource = makeArticleSource();
  const claimManifestSource = `version: 1
articleId: ${ARTICLE_ID}
articlePath: ${ARTICLE_PATH}
claims:
  - id: ${CLAIM_ID}
    kind: fact
    excerpt: ${JSON.stringify(CLAIM_EXCERPT)}
    boundary: ${JSON.stringify(CLAIM_BOUNDARY)}
    evidenceIds:
      - ${EVIDENCE_ID}
`;
  const registrySource = `version: 1
evidence:
  - id: ${EVIDENCE_ID}
    title: "Official market regulation source"
    sourceType: official
    source:
      kind: public-url
      url: https://www.samr.gov.cn/
    capturedDate: "2026-07-16"
    jurisdictions:
      - CN
    targetMarkets:
      - AU
    supportStatus: ${options.unsupported ? "unsupported" : "supported"}
    supportedClaims:
      - id: ${CLAIM_ID}
        boundary: ${JSON.stringify(CLAIM_BOUNDARY)}
    limitations:
      - "The source does not validate a specific supplier."
    reviewDueDate: "2027-01-12"
    permission:
      status: permitted
      attributionRequired: true
      attribution: "State Administration for Market Regulation"
    privacy: public
    quantitative: false
`;
  const reviewSource = `version: 1
articleId: ${ARTICLE_ID}
decision: approved
reviewer: "Andy Liu"
reviewedDate: "2026-07-16"
articleDigest: ${sha256Source(articleSource)}
claimManifestDigest: ${sha256Source(claimManifestSource)}
`;

  writeFileSync(article, articleSource, "utf8");
  writeFileSync(registry, registrySource, "utf8");
  writeFileSync(claims, claimManifestSource, "utf8");
  writeFileSync(review, reviewSource, "utf8");

  return { directory, article, registry, claims, review };
}

function runCli(paths: CliFixturePaths, extraArgs: string[] = []) {
  return spawnSync(
    TSX_PATH,
    [
      CLI_PATH,
      "--article",
      paths.article,
      "--registry",
      paths.registry,
      "--claims",
      paths.claims,
      "--review",
      paths.review,
      ...extraArgs,
    ],
    {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0" },
    },
  );
}

afterAll(() => {
  for (const directory of cliDirectories) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("seo-evidence-check CLI", () => {
  it("requires an injected as-of date before reading defaults", () => {
    const result = spawnSync(TSX_PATH, [CLI_PATH], {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("--as-of YYYY-MM-DD is required");
  });

  it("accepts custom read-only inputs and emits byte-stable JSON", () => {
    const paths = makeCliFixture();
    const first = runCli(paths, ["--as-of", "2026-07-18"]);
    const second = runCli(paths, ["--as-of", "2026-07-18"]);

    expect(first.status).toBe(0);
    expect(first.stderr).toBe("");
    expect(first.stdout).toBe(second.stdout);
    expect(JSON.parse(first.stdout)).toMatchObject({
      status: "passed",
      asOfDate: "2026-07-18",
    });
    expect(readFileSync(paths.article, "utf8")).toBe(makeArticleSource());
  });

  it("prints a failed report and exits 1 when the gate fails", () => {
    const paths = makeCliFixture({ unsupported: true });
    const result = runCli(paths, ["--as-of", "2026-07-18"]);

    expect(result.status).toBe(1);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toMatchObject({
      status: "failed",
      analytics: {
        issueCodes: [EVIDENCE_GATE_ERROR_CODES.EVIDENCE_UNSUPPORTED],
      },
    });
  });
});
