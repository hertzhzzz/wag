import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  SEO_GOVERNANCE_BASELINE_CONTRACT,
  SEO_GOVERNANCE_EXIT_CODES,
  executeSeoGovernanceCli,
  parseSeoGovernanceCliArgs,
} from "./cli";
import { compareCodePoints, SEO_ARTIFACT_NAMES } from "./index";
import {
  EVIDENCE_REGISTRY_SOURCE,
  FIXTURE_BASELINE,
  PROJECT_ROOT,
  makeTemporaryProject,
} from "./test-helpers";

const temporaryRoots: string[] = [];

function tempDirectory(prefix: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryRoots.push(root);
  return root;
}

function tempProject(): string {
  const root = makeTemporaryProject();
  temporaryRoots.push(root);
  return root;
}

function tempRealInputProject(): string {
  const rootDir = tempDirectory("seo-governance-real-input-");
  fs.cpSync(
    path.join(PROJECT_ROOT, "content/blog"),
    path.join(rootDir, "content/blog"),
    { recursive: true },
  );
  fs.cpSync(
    path.join(PROJECT_ROOT, "content/seo/evidence"),
    path.join(rootDir, "content/seo/evidence"),
    { recursive: true },
  );
  return rootDir;
}

function runPackageCli(
  script: "seo:governance:check" | "seo:governance:write",
  args: readonly string[],
  cwd: string,
): { status: number | null; stdout: string; stderr: string; error?: Error } {
  const result = spawnSync(
    "npm",
    ["--prefix", PROJECT_ROOT, "run", "--silent", script, "--", ...args],
    {
      cwd,
      encoding: "utf8",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        NO_COLOR: "1",
      },
      timeout: 60_000,
    },
  );

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    ...(result.error ? { error: result.error } : {}),
  };
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("single SEO governance CLI orchestrator", () => {
  it("requires explicit mode and as-of while defaulting to read-only check", () => {
    expect(
      parseSeoGovernanceCliArgs([
        "--mode",
        "strict",
        "--scope",
        "migrated",
        "--as-of",
        "2026-07-18",
      ]),
    ).toEqual({
      asOfDate: "2026-07-18",
      format: "human",
      mode: "strict",
      strictScope: "migrated",
      write: false,
    });

    expect(() =>
      parseSeoGovernanceCliArgs(["--mode", "compatibility"]),
    ).toThrow(/--as-of/);
    expect(() => parseSeoGovernanceCliArgs(["--as-of", "2026-07-18"])).toThrow(
      /--mode/,
    );
  });

  it("uses the frozen Ticket 05 baseline contract only when explicitly requested", () => {
    expect(SEO_GOVERNANCE_BASELINE_CONTRACT).toEqual({
      mode: "compatibility",
      asOfDate: "2026-07-18",
    });
    expect(parseSeoGovernanceCliArgs(["--baseline-contract"])).toEqual({
      asOfDate: "2026-07-18",
      format: "human",
      mode: "compatibility",
      strictScope: "migrated",
      write: false,
    });
    expect(
      parseSeoGovernanceCliArgs([
        "--baseline-contract",
        "--mode",
        "strict",
        "--strict-scope",
        "all",
        "--as-of",
        "2026-07-17",
      ]),
    ).toEqual({
      asOfDate: "2026-07-17",
      format: "human",
      mode: "strict",
      strictScope: "all",
      write: false,
    });
  });

  it("uses fixed exit codes and stable human output without writing in check mode", () => {
    const projectRoot = tempProject();
    const dependencies = {
      rootDir: projectRoot,
      evidenceRegistrySource: EVIDENCE_REGISTRY_SOURCE,
      baselineCohort: FIXTURE_BASELINE,
    };

    const first = executeSeoGovernanceCli(
      ["--mode", "compatibility", "--as-of", "2026-07-18"],
      dependencies,
    );
    const second = executeSeoGovernanceCli(
      ["--mode", "compatibility", "--as-of", "2026-07-18"],
      dependencies,
    );

    expect(first.exitCode).toBe(SEO_GOVERNANCE_EXIT_CODES.GOVERNANCE_FAILED);
    expect(first.stdout).toBe(second.stdout);
    expect(first.stderr).toBe("");
    expect(first.stdout).toContain("SEO governance protocol v1");
    expect(first.stdout).toContain("Operation: check");
    expect(fs.existsSync(path.join(projectRoot, "generated/seo"))).toBe(false);
  });

  it("writes only with --write and emits a stable machine-readable protocol", () => {
    const projectRoot = tempProject();
    const dependencies = {
      rootDir: projectRoot,
      evidenceRegistrySource: EVIDENCE_REGISTRY_SOURCE,
      baselineCohort: FIXTURE_BASELINE,
    };

    const written = executeSeoGovernanceCli(
      [
        "--mode",
        "compatibility",
        "--as-of",
        "2026-07-18",
        "--write",
        "--format",
        "json",
      ],
      dependencies,
    );
    const checked = executeSeoGovernanceCli(
      ["--mode", "compatibility", "--as-of", "2026-07-18", "--format", "json"],
      dependencies,
    );
    const repeated = executeSeoGovernanceCli(
      ["--mode", "compatibility", "--as-of", "2026-07-18", "--format", "json"],
      dependencies,
    );

    expect(written.exitCode).toBe(SEO_GOVERNANCE_EXIT_CODES.PASSED);
    expect(checked.exitCode).toBe(SEO_GOVERNANCE_EXIT_CODES.PASSED);
    expect(checked.stdout).toBe(repeated.stdout);
    const report = JSON.parse(checked.stdout);
    expect(report).toEqual(
      expect.objectContaining({
        protocolVersion: 1,
        operation: "check",
        mode: "compatibility",
        asOfDate: "2026-07-18",
        status: "passed",
      }),
    );
    expect(checked.stdout).not.toMatch(/generatedAt|\/Users\/|cwd|darwin/);
    expect(
      fs
        .readdirSync(path.join(projectRoot, "generated/seo"))
        .sort(compareCodePoints),
    ).toEqual([...SEO_ARTIFACT_NAMES].sort(compareCodePoints));
  });

  it("returns usage exit code 2 without running governance for invalid arguments", () => {
    const result = executeSeoGovernanceCli(["--mode", "compatibility"]);

    expect(result.exitCode).toBe(SEO_GOVERNANCE_EXIT_CODES.USAGE_ERROR);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("--as-of");
  });

  it("runs the package scripts as real subprocesses from an external cwd", () => {
    const rootDir = tempRealInputProject();
    const externalCwd = tempDirectory("seo-governance-external-cwd-");
    const commonArgs = ["--root-dir", rootDir, "--format", "json"] as const;

    const missing = runPackageCli(
      "seo:governance:check",
      commonArgs,
      externalCwd,
    );

    expect(missing.error).toBeUndefined();
    expect(missing.status).toBe(SEO_GOVERNANCE_EXIT_CODES.GOVERNANCE_FAILED);
    expect(missing.stderr).toBe("");
    expect(JSON.parse(missing.stdout)).toEqual(
      expect.objectContaining({
        operation: "check",
        mode: "compatibility",
        asOfDate: "2026-07-18",
        status: "failed",
        compatibility: expect.objectContaining({ articleCount: 23 }),
        artifactChecks: expect.arrayContaining([
          expect.objectContaining({ status: "missing" }),
        ]),
      }),
    );
    expect(fs.existsSync(path.join(rootDir, "generated"))).toBe(false);

    const written = runPackageCli(
      "seo:governance:write",
      commonArgs,
      externalCwd,
    );
    const checked = runPackageCli(
      "seo:governance:check",
      commonArgs,
      externalCwd,
    );
    const firstArtifactBytes = Object.fromEntries(
      SEO_ARTIFACT_NAMES.map((name) => [
        name,
        fs.readFileSync(path.join(rootDir, "generated/seo", name), "utf8"),
      ]),
    );
    const repeatedWrite = runPackageCli(
      "seo:governance:write",
      commonArgs,
      externalCwd,
    );
    const repeatedCheck = runPackageCli(
      "seo:governance:check",
      commonArgs,
      externalCwd,
    );
    const secondArtifactBytes = Object.fromEntries(
      SEO_ARTIFACT_NAMES.map((name) => [
        name,
        fs.readFileSync(path.join(rootDir, "generated/seo", name), "utf8"),
      ]),
    );

    expect(written.error).toBeUndefined();
    expect(written.status).toBe(SEO_GOVERNANCE_EXIT_CODES.PASSED);
    expect(written.stderr).toBe("");
    expect(JSON.parse(written.stdout)).toEqual(
      expect.objectContaining({ operation: "write", status: "passed" }),
    );
    expect(checked.error).toBeUndefined();
    expect(checked.status).toBe(SEO_GOVERNANCE_EXIT_CODES.PASSED);
    expect(checked.stderr).toBe("");
    expect(JSON.parse(checked.stdout)).toEqual(
      expect.objectContaining({
        operation: "check",
        mode: "compatibility",
        asOfDate: "2026-07-18",
        status: "passed",
        compatibility: expect.objectContaining({ articleCount: 23 }),
        artifactChecks: expect.arrayContaining([
          expect.objectContaining({ status: "current" }),
        ]),
      }),
    );
    expect(repeatedWrite.error).toBeUndefined();
    expect(repeatedWrite.status).toBe(SEO_GOVERNANCE_EXIT_CODES.PASSED);
    expect(repeatedWrite.stderr).toBe("");
    expect(repeatedCheck.error).toBeUndefined();
    expect(repeatedCheck.status).toBe(SEO_GOVERNANCE_EXIT_CODES.PASSED);
    expect(repeatedCheck.stderr).toBe("");
    expect(repeatedCheck.stdout).toBe(checked.stdout);
    expect(secondArtifactBytes).toEqual(firstArtifactBytes);
    expect(checked.stdout).not.toContain(rootDir);
    expect(checked.stdout).not.toContain(externalCwd);
    const serializedArtifacts = Object.values(secondArtifactBytes).join("\n");
    expect(serializedArtifacts).not.toMatch(/\/Users\/|[A-Za-z]:\\Users\\/u);
    expect(serializedArtifacts).not.toMatch(
      /"(?:generatedAt|generatedOn|runAt|timestamp|approvedBy|approvalId|approvalStatus|traffic|impressions|clicks|conversions|sessions|rank)"\s*:/u,
    );
    expect(serializedArtifacts).not.toMatch(
      /"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/u,
    );
    expect(
      fs
        .readdirSync(path.join(rootDir, "generated/seo"))
        .sort(compareCodePoints),
    ).toEqual([...SEO_ARTIFACT_NAMES].sort(compareCodePoints));
  }, 60_000);

  it("keeps subprocess usage failures on stderr with the fixed exit code", () => {
    const externalCwd = tempDirectory("seo-governance-usage-cwd-");
    const result = runPackageCli(
      "seo:governance:check",
      ["--as-of", "2026-02-30"],
      externalCwd,
    );

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(SEO_GOVERNANCE_EXIT_CODES.USAGE_ERROR);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(
      "--as-of must be a valid YYYY-MM-DD calendar date.",
    );
    expect(result.stderr).toContain("Usage: seo-governance");
  });
});
