import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { SEO_BASELINE_COHORT } from "./baseline";
import {
  SEO_ARTIFACT_NAMES,
  buildSeoGovernanceArtifacts,
  compareCodePoints,
  locateSeoProjectRoot,
  runSeoGovernance,
  stableJson,
} from "./index";
import {
  EVIDENCE_REGISTRY_SOURCE,
  FIXTURE_BASELINE,
  PROJECT_ROOT,
  buildFixture,
  makeTemporaryProject,
} from "./test-helpers";
import type {
  SeoArtifactName,
  SeoGovernanceRunOptions,
  SeoWriteFailpoint,
} from "./types";

const temporaryRoots: string[] = [];

function tempProject(fixture = "passing"): string {
  const root = makeTemporaryProject(fixture);
  temporaryRoots.push(root);
  return root;
}

function fixtureOptions(
  rootDir: string,
  overrides: Partial<SeoGovernanceRunOptions> = {},
): SeoGovernanceRunOptions {
  return {
    rootDir,
    evidenceRegistrySource: EVIDENCE_REGISTRY_SOURCE,
    baselineCohort: FIXTURE_BASELINE,
    mode: "compatibility",
    strictScope: "migrated",
    asOfDate: "2026-07-18",
    ...overrides,
  };
}

function artifactHashes(artifacts: Readonly<Record<string, string>>) {
  return Object.fromEntries(
    Object.entries(artifacts).map(([name, bytes]) => [
      name,
      createHash("sha256").update(bytes, "utf8").digest("hex"),
    ]),
  );
}

function readArtifactBytes(rootDir: string): Record<SeoArtifactName, string> {
  return Object.fromEntries(
    SEO_ARTIFACT_NAMES.map((name) => [
      name,
      fs.readFileSync(path.join(rootDir, "generated/seo", name), "utf8"),
    ]),
  ) as Record<SeoArtifactName, string>;
}

function transactionResidue(rootDir: string): string[] {
  const generatedParent = path.join(rootDir, "generated");
  if (!fs.existsSync(generatedParent)) return [];
  return fs
    .readdirSync(generatedParent)
    .filter((name) => name.startsWith(".seo-governance-transaction-"))
    .sort(compareCodePoints);
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("deterministic SEO governance generation", () => {
  it("emits exactly the four governed artifacts with stable canonical bytes", () => {
    const first = buildSeoGovernanceArtifacts({
      rootDir: PROJECT_ROOT,
      mode: "compatibility",
      strictScope: "migrated",
      asOfDate: "2026-07-18",
    });
    const second = buildSeoGovernanceArtifacts({
      rootDir: PROJECT_ROOT,
      mode: "compatibility",
      strictScope: "migrated",
      asOfDate: "2026-07-18",
    });

    expect(Object.keys(first.artifacts)).toEqual(SEO_ARTIFACT_NAMES);
    expect(Object.keys(first.artifacts)).not.toContain(
      "compatibility-report.json",
    );
    expect(second.artifacts).toEqual(first.artifacts);
    expect(artifactHashes(second.artifacts)).toEqual(
      artifactHashes(first.artifacts),
    );
    expect(first.compatibilityReport.articleCount).toBe(23);
    expect(first.compatibilityReport.baseline.status).toBe("exact");
    expect(first.compatibilityReport.baseline.identities).toHaveLength(23);

    for (const bytes of Object.values(first.artifacts)) {
      expect(bytes.endsWith("\n")).toBe(true);
      expect(bytes).not.toContain("\r");
      expect(bytes).not.toMatch(/generatedAt|process\.cwd|\/Users\//u);
      expect(() => JSON.parse(bytes)).not.toThrow();
      expect(bytes.split("\n").some((line) => /^ {2}"/u.test(line))).toBe(true);
    }
  });

  it("uses a fixed Unicode code-point comparator rather than locale collation", () => {
    const values = ["ä", "z", "a", "😀", "𐀀"];

    expect([...values].sort(compareCodePoints)).toEqual([
      "a",
      "z",
      "ä",
      "𐀀",
      "😀",
    ]);
  });

  it("emits Prettier-compatible short primitive arrays without losing stable ordering", () => {
    const serialized = stableJson({
      short: ["AU", "NZ"],
      long: [
        "a-primitive-value-that-keeps-the-complete-array-over-print-width",
        "another-primitive-value",
      ],
    });

    expect(serialized).toContain('"short": ["AU", "NZ"]');
    expect(serialized).toContain('"long": [\n');
    expect(serialized.indexOf('"long"')).toBeLessThan(
      serialized.indexOf('"short"'),
    );
    expect(serialized.endsWith("\n")).toBe(true);
    expect(stableJson(JSON.parse(serialized))).toBe(serialized);
  });

  it("produces path-independent bytes and never serializes an absolute root", () => {
    const firstRoot = tempProject();
    const secondRoot = tempProject();
    const first = buildSeoGovernanceArtifacts(fixtureOptions(firstRoot));
    const second = buildSeoGovernanceArtifacts(fixtureOptions(secondRoot));

    expect(second.artifacts).toEqual(first.artifacts);
    const serialized = JSON.stringify([first, second]);
    expect(serialized).not.toContain(firstRoot);
    expect(serialized).not.toContain(secondRoot);
  });

  it("locates the repository from the module seam instead of blindly using cwd", () => {
    const originalCwd = process.cwd();
    process.chdir(os.tmpdir());
    try {
      expect(locateSeoProjectRoot()).toBe(PROJECT_ROOT);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("keeps check read-only without creating generated, temp, or repair files", () => {
    const rootDir = tempProject();
    const before = fs.readdirSync(rootDir).sort(compareCodePoints);

    const result = runSeoGovernance(fixtureOptions(rootDir));

    expect(result.operation).toBe("check");
    expect(result.artifactChecks.map((entry) => entry.status)).toEqual([
      "missing",
      "missing",
      "missing",
      "missing",
    ]);
    expect(fs.readdirSync(rootDir).sort(compareCodePoints)).toEqual(before);
    expect(fs.existsSync(path.join(rootDir, "generated"))).toBe(false);
    expect(transactionResidue(rootDir)).toEqual([]);
  });

  it("writes one four-file batch and repeated writes keep disk SHA-256 values identical", () => {
    const rootDir = tempProject();
    const options = fixtureOptions(rootDir, { write: true });

    const first = runSeoGovernance(options);
    const firstDiskHashes = artifactHashes(readArtifactBytes(rootDir));
    const second = runSeoGovernance(options);
    const secondDiskHashes = artifactHashes(readArtifactBytes(rootDir));
    const checked = runSeoGovernance({ ...options, write: false });

    expect(first.validation.hardFailures).toEqual([]);
    expect(
      first.artifactChecks.every((entry) => entry.status === "written"),
    ).toBe(true);
    expect(secondDiskHashes).toEqual(firstDiskHashes);
    expect(artifactHashes(second.artifacts)).toEqual(
      artifactHashes(first.artifacts),
    );
    expect(
      checked.artifactChecks.every((entry) => entry.status === "current"),
    ).toBe(true);
    expect(transactionResidue(rootDir)).toEqual([]);
  });

  it.each<SeoWriteFailpoint>(["after-stage", "after-backup", "after-promote"])(
    "rolls back %s failure with all four original files byte-for-byte unchanged",
    (writeFailpoint) => {
      const rootDir = tempProject();
      const options = fixtureOptions(rootDir, { write: true });
      const initial = runSeoGovernance(options);
      expect(initial.validation.status).toBe("passed");
      const before = readArtifactBytes(rootDir);

      const failed = runSeoGovernance({
        ...options,
        asOfDate: "2026-07-19",
        writeFailpoint,
      });

      expect(failed.validation.hardFailures).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: "ARTIFACT_WRITE_FAILED" }),
        ]),
      );
      expect(readArtifactBytes(rootDir)).toEqual(before);
      expect(transactionResidue(rootDir)).toEqual([]);
    },
  );

  it("refuses write when an unknown generated file exists and changes no bytes", () => {
    const rootDir = tempProject();
    const options = fixtureOptions(rootDir, { write: true });
    runSeoGovernance(options);
    const generatedDir = path.join(rootDir, "generated/seo");
    const unknownPath = path.join(generatedDir, "manual.json");
    fs.writeFileSync(unknownPath, '{"manual":true}\n', "utf8");
    const before = {
      ...readArtifactBytes(rootDir),
      "manual.json": fs.readFileSync(unknownPath, "utf8"),
    };

    const refused = runSeoGovernance({
      ...options,
      asOfDate: "2026-07-19",
    });

    expect(refused.validation.hardFailures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "ARTIFACT_UNEXPECTED" }),
      ]),
    );
    expect({
      ...readArtifactBytes(rootDir),
      "manual.json": fs.readFileSync(unknownPath, "utf8"),
    }).toEqual(before);
    expect(transactionResidue(rootDir)).toEqual([]);
  });

  it("detects missing, modified, and unexpected artifacts without repairing them", () => {
    const rootDir = tempProject();
    const generatedDir = path.join(rootDir, "generated/seo");
    const options = fixtureOptions(rootDir);
    runSeoGovernance({ ...options, write: true });

    const modifiedPath = path.join(generatedDir, "articles.json");
    const modifiedBytes = `${fs.readFileSync(modifiedPath, "utf8")}manual edit\n`;
    fs.writeFileSync(modifiedPath, modifiedBytes, "utf8");
    fs.rmSync(path.join(generatedDir, "clusters.json"));
    fs.writeFileSync(path.join(generatedDir, "manual.json"), "{}\n", "utf8");

    const checked = runSeoGovernance(options);

    expect(checked.artifactChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "articles.json", status: "modified" }),
        expect.objectContaining({ name: "clusters.json", status: "missing" }),
        expect.objectContaining({ name: "manual.json", status: "unexpected" }),
      ]),
    );
    expect(fs.readFileSync(modifiedPath, "utf8")).toBe(modifiedBytes);
    expect(fs.existsSync(path.join(generatedDir, "clusters.json"))).toBe(false);
    expect(fs.existsSync(path.join(generatedDir, "manual.json"))).toBe(true);
    expect(transactionResidue(rootDir)).toEqual([]);
  });

  it("leaves zero partial artifacts when a write request fails validation", () => {
    const rootDir = tempProject("failing/aggregate");

    const result = runSeoGovernance(
      fixtureOptions(rootDir, {
        write: true,
      }),
    );

    expect(result.validation.status).toBe("failed");
    expect(fs.existsSync(path.join(rootDir, "generated"))).toBe(false);
    expect(transactionResidue(rootDir)).toEqual([]);
  });

  it("rejects a baseline manifest with duplicate frozen identities", () => {
    const result = buildFixture("passing", {
      baselineCohort: [...FIXTURE_BASELINE, FIXTURE_BASELINE[0]],
    });

    expect(result.compatibilityReport.baseline.duplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "identity",
          value: expect.stringContaining("|"),
          occurrences: 2,
        }),
      ]),
    );
    expect(result.validation.hardFailures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "duplicate-identity",
          code: "BASELINE_IDENTITY_DUPLICATE",
        }),
      ]),
    );
  });

  it("reports a 23-for-23 baseline identity replacement as missing and unexpected", () => {
    const replacement = SEO_BASELINE_COHORT.map((identity, index) =>
      index === 0
        ? { ...identity, contentId: "article.replaced-baseline-identity" }
        : identity,
    );
    const result = buildSeoGovernanceArtifacts({
      rootDir: PROJECT_ROOT,
      baselineCohort: replacement,
      mode: "compatibility",
      strictScope: "migrated",
      asOfDate: "2026-07-18",
    });
    const baseline = result.compatibilityReport.baseline;

    expect(baseline.expectedCount).toBe(23);
    expect(baseline.actualCount).toBe(23);
    expect(baseline.status).toBe("mismatch");
    expect(baseline.missing).toHaveLength(1);
    expect(baseline.unexpected).toHaveLength(1);
    expect(baseline.missing[0].contentId).toBe(
      "article.replaced-baseline-identity",
    );
    expect(baseline.unexpected[0].contentId).toBe(
      SEO_BASELINE_COHORT[0].contentId,
    );
  });

  it("reports actual duplicate occurrences, not only a baseline count mismatch", () => {
    const result = buildFixture("failing/duplicate-identity");

    expect(result.compatibilityReport.baseline.actualCount).toBe(2);
    expect(result.compatibilityReport.baseline.duplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "contentId",
          value: "article.supplier-pillar",
          occurrences: 2,
        }),
      ]),
    );
  });
});
