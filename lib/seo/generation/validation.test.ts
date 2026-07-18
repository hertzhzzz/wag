import fs from "node:fs";
import path from "node:path";

import {
  GOVERNED_FIELDS,
  buildSeoGovernanceArtifacts,
  runSeoGovernance,
} from "./index";
import {
  EVIDENCE_REGISTRY_SOURCE,
  FIXTURE_BASELINE,
  PROJECT_ROOT,
  buildFixture,
  makeTemporaryProject,
} from "./test-helpers";
import type { SeoBaselineIdentity } from "./types";

const temporaryRoots: string[] = [];

function tempProject(fixture = "passing"): string {
  const root = makeTemporaryProject(fixture);
  temporaryRoots.push(root);
  return root;
}

function articlePath(rootDir: string, slug: string): string {
  return path.join(rootDir, "content/blog", `${slug}.mdx`);
}

function updateArticle(
  rootDir: string,
  slug: string,
  transform: (source: string) => string,
): void {
  const filePath = articlePath(rootDir, slug);
  const before = fs.readFileSync(filePath, "utf8");
  const after = transform(before);
  if (after === before) {
    throw new Error(`Fixture mutation did not change ${slug}.mdx.`);
  }
  fs.writeFileSync(filePath, after, "utf8");
}

function replaceRequired(
  source: string,
  searchValue: string,
  replaceValue: string,
): string {
  if (!source.includes(searchValue)) {
    throw new Error(`Fixture text was not found: ${searchValue}`);
  }
  return source.replace(searchValue, replaceValue);
}

function fixtureBuild(rootDir: string) {
  return buildSeoGovernanceArtifacts({
    rootDir,
    evidenceRegistrySource: EVIDENCE_REGISTRY_SOURCE,
    baselineCohort: FIXTURE_BASELINE,
    mode: "compatibility",
    strictScope: "migrated",
    asOfDate: "2026-07-18",
  });
}

function hardFailureCodes(result: ReturnType<typeof fixtureBuild>): string[] {
  return result.validation.hardFailures.map((issue) => issue.code);
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("SEO governance validation", () => {
  it("accepts a fully governed fixture without manufacturing advisories", () => {
    const result = buildFixture("passing");

    expect(result.validation.status).toBe("passed");
    expect(result.validation.hardFailures).toEqual([]);
    expect(result.validation.advisoryWarnings).toEqual([]);
  });

  it.each([
    ["failing/schema", "schema", "ARTICLE_SCHEMA_INVALID"],
    ["failing/evidence", "evidence", "EVIDENCE_REFERENCE_MISSING"],
    ["failing/graph", "graph", "COMMERCIAL_ROOT_MISMATCH"],
    [
      "failing/duplicate-identity",
      "duplicate-identity",
      "CONTENT_ID_DUPLICATE",
    ],
    [
      "failing/unsafe-disclosure",
      "unsafe-disclosure",
      "UNSAFE_DISCLOSURE_DETECTED",
    ],
  ])("hard-fails %s as %s", (fixture, category, code) => {
    const result = buildFixture(fixture);

    expect(result.validation.status).toBe("failed");
    expect(result.validation.hardFailures).toEqual(
      expect.arrayContaining([expect.objectContaining({ category, code })]),
    );
  });

  it("aggregates independent hard failures instead of stopping at the first", () => {
    const result = buildFixture("failing/aggregate");
    const codes = hardFailureCodes(result);

    expect(codes).toEqual(
      expect.arrayContaining([
        "CONTENT_ID_DUPLICATE",
        "EVIDENCE_REFERENCE_MISSING",
        "COMMERCIAL_ROOT_MISMATCH",
      ]),
    );
    expect(result.validation.hardFailures.length).toBeGreaterThanOrEqual(3);
  });

  it("uses the canonical governed-field contract with nullable presence semantics", () => {
    expect(GOVERNED_FIELDS).toEqual(
      expect.arrayContaining(["secondaryKeywords", "firstPartyContributionId"]),
    );

    const passing = buildFixture("passing", {
      mode: "strict",
      strictScope: "migrated",
    });
    const strict = buildFixture("failing/strict-design-fields", {
      mode: "strict",
      strictScope: "migrated",
    });
    const compatibility = buildFixture("failing/strict-design-fields");

    expect(passing.validation.hardFailures).toEqual([]);
    expect(strict.validation.hardFailures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "GOVERNED_FIELD_REQUIRED",
          subject: "article.supplier-check.secondaryKeywords",
        }),
        expect.objectContaining({
          code: "GOVERNED_FIELD_REQUIRED",
          subject: "article.supplier-check.firstPartyContributionId",
        }),
      ]),
    );
    expect(compatibility.validation.hardFailures).toEqual([]);
    expect(compatibility.validation.advisoryWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "compatibility",
          code: "GOVERNED_FIELD_MISSING",
          subject: "article.supplier-check.secondaryKeywords",
        }),
        expect.objectContaining({
          category: "compatibility",
          code: "GOVERNED_FIELD_MISSING",
          subject: "article.supplier-check.firstPartyContributionId",
        }),
      ]),
    );
  });

  it("derives strict migrated membership only from the explicit migration marker", () => {
    const rootDir = tempProject();
    updateArticle(rootDir, "supplier-check", (source) =>
      replaceRequired(source, 'migrationAction: "keep"\n', ""),
    );

    const migrated = buildSeoGovernanceArtifacts({
      rootDir,
      evidenceRegistrySource: EVIDENCE_REGISTRY_SOURCE,
      baselineCohort: FIXTURE_BASELINE,
      mode: "strict",
      strictScope: "migrated",
      asOfDate: "2026-07-18",
    });
    const all = buildSeoGovernanceArtifacts({
      rootDir,
      evidenceRegistrySource: EVIDENCE_REGISTRY_SOURCE,
      baselineCohort: FIXTURE_BASELINE,
      mode: "strict",
      strictScope: "all",
      asOfDate: "2026-07-18",
    });
    const report = migrated.compatibilityReport.articles.find(
      (article) => article.contentId === "article.supplier-check",
    );

    expect(report).toEqual(
      expect.objectContaining({
        migrated: false,
        missingGovernedFields: expect.arrayContaining(["migrationAction"]),
      }),
    );
    expect(migrated.compatibilityReport.strictArticleCount).toBe(1);
    expect(migrated.validation.hardFailures).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "GOVERNED_FIELD_REQUIRED",
          subject: "article.supplier-check.migrationAction",
        }),
      ]),
    );
    expect(all.validation.hardFailures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "GOVERNED_FIELD_REQUIRED",
          subject: "article.supplier-check.migrationAction",
        }),
      ]),
    );
  });

  it("still runs claim-level evidence governance when a migrated article lacks a non-evidence field", () => {
    const rootDir = tempProject();
    const blogDir = path.join(rootDir, "content/blog");
    const evidenceDir = path.join(rootDir, "content/seo/evidence");
    fs.rmSync(blogDir, { recursive: true, force: true });
    fs.mkdirSync(blogDir, { recursive: true });
    fs.copyFileSync(
      path.join(PROJECT_ROOT, "content/blog/check-chinese-company-samr.mdx"),
      path.join(blogDir, "check-chinese-company-samr.mdx"),
    );
    fs.rmSync(evidenceDir, { recursive: true, force: true });
    fs.mkdirSync(path.join(evidenceDir, "claims"), { recursive: true });
    fs.mkdirSync(path.join(evidenceDir, "reviews"), { recursive: true });
    fs.copyFileSync(
      path.join(PROJECT_ROOT, "content/seo/evidence/registry.yaml"),
      path.join(evidenceDir, "registry.yaml"),
    );
    fs.copyFileSync(
      path.join(
        PROJECT_ROOT,
        "content/seo/evidence/claims/check-chinese-company-samr.yaml",
      ),
      path.join(evidenceDir, "claims/check-chinese-company-samr.yaml"),
    );
    fs.copyFileSync(
      path.join(
        PROJECT_ROOT,
        "content/seo/evidence/reviews/check-chinese-company-samr.yaml",
      ),
      path.join(evidenceDir, "reviews/check-chinese-company-samr.yaml"),
    );
    updateArticle(rootDir, "check-chinese-company-samr", (source) =>
      replaceRequired(source, "secondaryKeywords: []\n", ""),
    );
    const baseline: readonly SeoBaselineIdentity[] = [
      {
        contentId: "article.check-chinese-company-samr",
        slug: "check-chinese-company-samr",
        route: "/article/check-chinese-company-samr",
      },
    ];

    const result = buildSeoGovernanceArtifacts({
      rootDir,
      baselineCohort: baseline,
      mode: "strict",
      strictScope: "migrated",
      asOfDate: "2026-07-18",
    });

    expect(result.validation.hardFailures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "schema",
          code: "GOVERNED_FIELD_REQUIRED",
          subject: "article.check-chinese-company-samr.secondaryKeywords",
        }),
        expect.objectContaining({
          category: "evidence",
          code: "EVIDENCE_ARTICLE_ID_MISMATCH",
        }),
        expect.objectContaining({
          category: "evidence",
          code: "EVIDENCE_DECISION_STALE",
        }),
      ]),
    );
  });

  it.each([
    {
      name: "broken internal link",
      code: "BROKEN_INTERNAL_LINK",
      mutate(rootDir: string) {
        updateArticle(
          rootDir,
          "supplier-check",
          (source) =>
            `${source}\n[Broken governed article](/article/not-real).\n`,
        );
      },
    },
    {
      name: "orphan",
      code: "ARTICLE_ORPHANED",
      mutate(rootDir: string) {
        updateArticle(rootDir, "supplier-check", (source) => {
          const delimiter = source.indexOf("\n---\n", 4);
          if (delimiter === -1) throw new Error("Closing frontmatter missing.");
          return `${source.slice(0, delimiter + 5)}\nNo governed internal links remain.\n`;
        });
      },
    },
    {
      name: "missing commercial root",
      code: "COMMERCIAL_ROOT_MISSING",
      mutate(rootDir: string) {
        updateArticle(rootDir, "supplier-check", (source) =>
          replaceRequired(
            source,
            'commercialRoot: "/supplier-verification"\n',
            "",
          ),
        );
      },
    },
    {
      name: "duplicate content ID",
      code: "CONTENT_ID_DUPLICATE",
      mutate(rootDir: string) {
        updateArticle(rootDir, "supplier-check", (source) =>
          replaceRequired(
            source,
            'contentId: "article.supplier-check"',
            'contentId: "article.supplier-pillar"',
          ),
        );
      },
    },
    {
      name: "duplicate declared slug",
      code: "SLUG_DUPLICATE",
      mutate(rootDir: string) {
        updateArticle(rootDir, "supplier-check", (source) =>
          replaceRequired(
            source,
            'slug: "/article/supplier-check"',
            'slug: "/article/supplier-pillar"',
          ),
        );
      },
    },
    {
      name: "duplicate cluster pillar",
      code: "EDITORIAL_PILLAR_DUPLICATE",
      mutate(rootDir: string) {
        updateArticle(rootDir, "supplier-check", (source) =>
          replaceRequired(
            source,
            'contentRole: "supporting"',
            'contentRole: "pillar"',
          ),
        );
      },
    },
    {
      name: "conflicting pillar declaration",
      code: "EDITORIAL_PILLAR_CONFLICT",
      mutate(rootDir: string) {
        updateArticle(rootDir, "supplier-check", (source) =>
          replaceRequired(
            source,
            'editorialPillar: "/article/supplier-pillar"',
            'editorialPillar: "/article/supplier-check"',
          ),
        );
      },
    },
    {
      name: "missing required-link declaration",
      code: "REQUIRED_LINK_MISSING",
      mutate(rootDir: string) {
        updateArticle(rootDir, "supplier-check", (source) =>
          replaceRequired(source, '  - "/article/supplier-pillar"\n', ""),
        );
      },
    },
    {
      name: "unsupported cross-cluster link",
      code: "UNSUPPORTED_CROSS_CLUSTER_LINK",
      mutate(rootDir: string) {
        updateArticle(rootDir, "supplier-check", (source) => {
          let next = replaceRequired(
            source,
            'cluster: "supplier-verification"',
            'cluster: "factory-audit"',
          );
          next = replaceRequired(
            next,
            'commercialRoot: "/supplier-verification"',
            'commercialRoot: "/factory-audit-china"',
          );
          return replaceRequired(
            next,
            '  - "/supplier-verification"',
            '  - "/factory-audit-china"',
          );
        });
      },
    },
    {
      name: "keyword cannibalisation",
      code: "KEYWORD_CANNIBALISATION",
      mutate(rootDir: string) {
        updateArticle(rootDir, "supplier-check", (source) =>
          replaceRequired(
            source,
            'primaryKeyword: "check supplier"',
            'primaryKeyword: "supplier verification guide"',
          ),
        );
      },
    },
  ])("emits stable graph issue code for $name", ({ code, mutate }) => {
    const rootDir = tempProject();
    mutate(rootDir);

    const first = fixtureBuild(rootDir);
    const second = fixtureBuild(rootDir);

    expect(first.validation.hardFailures).toEqual(
      second.validation.hardFailures,
    );
    expect(first.validation.hardFailures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: expect.any(String), code }),
      ]),
    );
    const issue = first.validation.hardFailures.find(
      (candidate) => candidate.code === code,
    );
    expect(issue?.category).toMatch(/graph|duplicate-identity/);
  });

  it.each([
    {
      name: "password",
      value: "Internal password: supersecretvalue12345",
      secret: "supersecretvalue12345",
      kind: "secret",
    },
    {
      name: "access token",
      value: "Access token: tokenvalue123456789",
      secret: "tokenvalue123456789",
      kind: "secret",
    },
    {
      name: "API key",
      value: "API key: sk-live-1234567890",
      secret: "sk-live-1234567890",
      kind: "secret",
    },
    {
      name: "PII",
      value: "Passport number: P123456789",
      secret: "P123456789",
      kind: "pii",
    },
    {
      name: "bank and payment information",
      value: "BSB: 123-456 and account number: 12345678",
      secret: "123-456",
      kind: "payment",
    },
    {
      name: "licence credential",
      value: "License number: SA-12345678",
      secret: "SA-12345678",
      kind: "credential",
    },
    {
      name: "restricted supplier",
      value: "Restricted supplier: Supplier Alpha Confidential",
      secret: "Supplier Alpha Confidential",
      kind: "restricted-source",
    },
    {
      name: "confidential interview",
      value: "Confidential interview: Interviewee Bravo",
      secret: "Interviewee Bravo",
      kind: "restricted-source",
    },
  ])(
    "detects and redacts $name without echoing the source value",
    (fixture) => {
      const rootDir = tempProject();
      updateArticle(rootDir, "supplier-check", (source) =>
        replaceRequired(
          source,
          'description: "A deterministic governed supporting article fixture with public evidence."',
          `description: "${fixture.value}"`,
        ),
      );

      const built = fixtureBuild(rootDir);
      const run = runSeoGovernance({
        rootDir,
        evidenceRegistrySource: EVIDENCE_REGISTRY_SOURCE,
        baselineCohort: FIXTURE_BASELINE,
        mode: "compatibility",
        strictScope: "migrated",
        asOfDate: "2026-07-18",
      });
      const serialized = JSON.stringify({ built, run });
      const articleArtifact = JSON.parse(built.artifacts["articles.json"]) as {
        articles: Array<{ contentId: string; description: string }>;
      };

      expect(built.validation.hardFailures).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "unsafe-disclosure",
            code: "UNSAFE_DISCLOSURE_DETECTED",
            subject: expect.stringContaining(`#${fixture.kind}`),
          }),
        ]),
      );
      expect(serialized).not.toContain(fixture.secret);
      expect(serialized).not.toContain(fixture.value);
      expect(
        articleArtifact.articles.find(
          (article) => article.contentId === "article.supplier-check",
        )?.description,
      ).toBe("[REDACTED]");
    },
  );

  it("hard-fails evidence and article review expiry against the explicit as-of date", () => {
    const result = buildFixture("passing", { asOfDate: "2027-01-02" });

    expect(result.validation.hardFailures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "evidence",
          code: "EVIDENCE_EXPIRED",
        }),
        expect.objectContaining({
          category: "evidence",
          code: "ARTICLE_REVIEW_EXPIRED",
        }),
      ]),
    );
  });
});
