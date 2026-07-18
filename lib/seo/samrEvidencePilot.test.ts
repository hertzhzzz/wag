import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { articleRoutePath, parseArticleFrontmatter } from "./articleSchema";
import { runEvidenceGate } from "./evidenceGate";
import {
  parseEvidenceClaimManifestYaml,
  parseEvidenceRegistryYaml,
  parseEvidenceReviewDecisionYaml,
  sha256Source,
  type EvidenceRecord,
  type EvidenceRegistry,
  type EvidenceReviewDecision,
} from "./evidenceSchema";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const ARTICLE_SLUG = "check-chinese-company-samr";
const ARTICLE_ID = "article.check-chinese-company-samr";
const ARTICLE_ROUTE = "/article/check-chinese-company-samr";
const AS_OF_DATE = "2026-07-18";
const REVIEWED_DATE = "2026-07-16";
const ARTICLE_BODY_SHA256 =
  "506150258ea5568f6a53de9a2146202738f1c2543b692158bedca8dab386c977";

const PATHS = {
  article: path.join(
    PROJECT_ROOT,
    "content/blog/check-chinese-company-samr.mdx",
  ),
  registry: path.join(PROJECT_ROOT, "content/seo/evidence/registry.yaml"),
  claims: path.join(
    PROJECT_ROOT,
    "content/seo/evidence/claims/check-chinese-company-samr.yaml",
  ),
  review: path.join(
    PROJECT_ROOT,
    "content/seo/evidence/reviews/check-chinese-company-samr.yaml",
  ),
} as const;

const EXPECTED_EVIDENCE_IDS = [
  "ev.2b6f9d04",
  "ev.4c1d8b02",
  "ev.7f9c2a01",
  "ev.8e3a7c03",
] as const;

const EXPECTED_CLAIMS = {
  "claim.gsxt-record-scope-and-limits": {
    kind: "limitation",
    boundary:
      "A GSXT record may be used to compare registered entity fields, but it does not prove factory ownership, capability, trustworthiness, or payment safety.",
    evidenceIds: ["ev.7f9c2a01"],
  },
  "claim.samr-regulator-and-gsxt-portal": {
    kind: "fact",
    boundary:
      "SAMR oversees China's market-regulation and company-registration framework; GSXT is the official public enterprise information portal.",
    evidenceIds: ["ev.4c1d8b02", "ev.7f9c2a01"],
  },
  "claim.usci-format-and-standard": {
    kind: "fact",
    boundary:
      "GB 32100-2015 defines the 18-character Unified Social Credit Identifier format using digits and permitted letters; the identifier format alone does not prove entity trust.",
    evidenceIds: ["ev.8e3a7c03"],
  },
} as const;

const EXPECTED_PUBLIC_SOURCE_URLS = [
  "https://www.gsxt.gov.cn/",
  "https://www.samr.gov.cn/",
  "https://openstd.samr.gov.cn/bzgk/gb/newGbInfo?hcno=24691C25985C1073D3A7C85629378AC0",
] as const;

const SYNTHETIC_RESTRICTED_VALUES = [
  "SYNTHETIC_RESTRICTED_PERSON_000",
  "SYNTHETIC_RESTRICTED_ADDRESS_000",
  "SYNTHETIC_RESTRICTED_BANK_000",
  "ref.deadbeef",
] as const;

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function sourceSha256(source: string): string {
  return createHash("sha256").update(source, "utf8").digest("hex");
}

function loadPilot() {
  const articleSource = readUtf8(PATHS.article);
  const registrySource = readUtf8(PATHS.registry);
  const claimManifestSource = readUtf8(PATHS.claims);
  const reviewDecisionSource = readUtf8(PATHS.review);
  const articleDocument = matter(articleSource);
  const article = parseArticleFrontmatter(
    articleDocument.data,
    ARTICLE_SLUG,
    "strict",
  );
  const registry = parseEvidenceRegistryYaml(
    registrySource,
    "content/seo/evidence/registry.yaml",
  );
  const claimManifest = parseEvidenceClaimManifestYaml(
    claimManifestSource,
    "content/seo/evidence/claims/check-chinese-company-samr.yaml",
  );
  const reviewDecision = parseEvidenceReviewDecisionYaml(
    reviewDecisionSource,
    "content/seo/evidence/reviews/check-chinese-company-samr.yaml",
  );

  return {
    articleSource,
    articleDocument,
    article,
    registry,
    claimManifestSource,
    claimManifest,
    reviewDecision,
  };
}

describe("SAMR governed evidence pilot", () => {
  it("preserves the public route and article body while adding exact governed frontmatter", () => {
    const { articleDocument, article } = loadPilot();

    expect(article.warnings).toEqual([]);
    expect(articleRoutePath(ARTICLE_SLUG)).toBe(ARTICLE_ROUTE);
    expect(article.frontmatter).toMatchObject({
      slug: ARTICLE_ROUTE,
      contentId: ARTICLE_ID,
      cluster: "supplier-verification",
      contentRole: "supporting",
      searchIntent: "company-registry-check",
      funnelStage: "problem-aware",
      primaryKeyword: "check Chinese company SAMR",
      secondaryKeywords: [],
      targetMarket: "AU",
      editorialStatus: "approved",
      evidenceIds: EXPECTED_EVIDENCE_IDS,
      firstPartyContributionId: null,
      commercialRoot: "/supplier-verification",
      editorialPillar: "/article/verify-chinese-supplier",
      requiredLinks: [
        "/supplier-verification",
        "/article/verify-chinese-supplier",
      ],
      reviewedBy: "Andy Liu",
      reviewedDate: REVIEWED_DATE,
      reviewDueDate: "2027-01-12",
      migrationAction: "keep",
    });
    expect(sourceSha256(articleDocument.content)).toBe(ARTICLE_BODY_SHA256);
  });

  it("parses the frozen manifest and review decision from raw sources", () => {
    const {
      articleSource,
      articleDocument,
      registry,
      claimManifestSource,
      claimManifest,
      reviewDecision,
    } = loadPilot();

    expect(registry.evidence.map(({ id }) => id)).toEqual(
      EXPECTED_EVIDENCE_IDS,
    );
    expect(claimManifest).toMatchObject({
      version: 1,
      articleId: ARTICLE_ID,
      articlePath: "content/blog/check-chinese-company-samr.mdx",
    });
    expect(claimManifest.claims).toHaveLength(3);

    const claimsById = Object.fromEntries(
      claimManifest.claims.map((claim) => [
        claim.id,
        {
          kind: claim.kind,
          boundary: claim.boundary,
          evidenceIds: claim.evidenceIds,
        },
      ]),
    );
    expect(claimsById).toEqual(EXPECTED_CLAIMS);

    for (const claim of claimManifest.claims) {
      expect(articleDocument.content).toContain(claim.excerpt);
    }

    expect(reviewDecision).toMatchObject({
      version: 1,
      articleId: ARTICLE_ID,
      decision: "approved",
      reviewer: "Andy Liu",
      reviewedDate: REVIEWED_DATE,
    });
    expect(reviewDecision.articleDigest).toBe(sha256Source(articleSource));
    expect(reviewDecision.claimManifestDigest).toBe(
      sha256Source(claimManifestSource),
    );
  });

  it("passes the evidence gate with public claim traces and privacy-safe analytics", () => {
    const {
      articleSource,
      registry,
      claimManifestSource,
      claimManifest,
      reviewDecision,
    } = loadPilot();

    const report = runEvidenceGate({
      articleSource,
      claimManifestSource,
      registry,
      claimManifest,
      reviewDecision,
      asOfDate: AS_OF_DATE,
    });

    expect(report).toMatchObject({
      version: 1,
      articleId: ARTICLE_ID,
      asOfDate: AS_OF_DATE,
      status: "passed",
      decision: "approved",
      reviewer: "Andy Liu",
      reviewedDate: REVIEWED_DATE,
      claimCount: 3,
    });
    expect(report.issues).toEqual([]);

    const reportJson = JSON.stringify(report);
    const analyticsJson = JSON.stringify(report.analytics);

    for (const expectedClaim of Object.values(EXPECTED_CLAIMS)) {
      expect(reportJson).toContain(expectedClaim.boundary);
    }
    for (const sourceUrl of EXPECTED_PUBLIC_SOURCE_URLS) {
      expect(reportJson).toContain(sourceUrl);
      expect(analyticsJson).not.toContain(sourceUrl);
    }
    for (const claim of claimManifest.claims) {
      expect(reportJson).not.toContain(claim.excerpt);
      expect(analyticsJson).not.toContain(claim.excerpt);
      expect(analyticsJson).not.toContain(claim.boundary);
    }

    expect(analyticsJson).not.toContain("Andy Liu");
    expect(analyticsJson).not.toContain(REVIEWED_DATE);
    expect(analyticsJson).not.toContain("controlled-reference");
  });

  it("redacts synthetic restricted evidence from failed reports and analytics", () => {
    const { articleSource, registry, claimManifestSource, reviewDecision } =
      loadPilot();
    const restrictedBase = registry.evidence.find(
      ({ id }) => id === "ev.7f9c2a01",
    );

    expect(restrictedBase).toBeDefined();

    const syntheticRestrictedRecord: EvidenceRecord = {
      ...restrictedBase!,
      id: "ev.deadbeef",
      title: SYNTHETIC_RESTRICTED_VALUES[0],
      source: {
        kind: "controlled-reference",
        referenceId: SYNTHETIC_RESTRICTED_VALUES[3],
      },
      limitations: [
        SYNTHETIC_RESTRICTED_VALUES[1],
        SYNTHETIC_RESTRICTED_VALUES[2],
      ],
      permission: {
        status: "restricted",
        attributionRequired: false,
      },
      privacy: "restricted",
    };
    const restrictedRegistry: EvidenceRegistry = {
      version: 1,
      evidence: [...registry.evidence, syntheticRestrictedRecord],
    };
    const restrictedArticleSource = articleSource.replace(
      '  - "ev.7f9c2a01"',
      '  - "ev.deadbeef"',
    );
    const restrictedClaimManifestSource = claimManifestSource.replaceAll(
      "ev.7f9c2a01",
      "ev.deadbeef",
    );
    const restrictedClaimManifest = parseEvidenceClaimManifestYaml(
      restrictedClaimManifestSource,
      "synthetic-restricted-claims.yaml",
    );
    const restrictedReviewDecision: EvidenceReviewDecision = {
      ...reviewDecision,
      articleDigest: sha256Source(restrictedArticleSource),
      claimManifestDigest: sha256Source(restrictedClaimManifestSource),
    };

    expect(restrictedArticleSource).not.toBe(articleSource);
    expect(restrictedClaimManifestSource).not.toBe(claimManifestSource);

    const report = runEvidenceGate({
      articleSource: restrictedArticleSource,
      claimManifestSource: restrictedClaimManifestSource,
      registry: restrictedRegistry,
      claimManifest: restrictedClaimManifest,
      reviewDecision: restrictedReviewDecision,
      asOfDate: AS_OF_DATE,
    });

    expect(report.status).toBe("failed");
    expect(report.issues.map(({ code }) => code)).toContain(
      "EVIDENCE_RESTRICTED",
    );

    const reportJson = JSON.stringify(report);
    const analyticsJson = JSON.stringify(report.analytics);

    for (const restrictedValue of SYNTHETIC_RESTRICTED_VALUES) {
      expect(reportJson).not.toContain(restrictedValue);
      expect(analyticsJson).not.toContain(restrictedValue);
    }
  });
});
