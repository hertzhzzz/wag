import path from "node:path";

import { locateSeoProjectRoot, runSeoGovernance, stableJson } from "./index";
import type {
  SeoBaselineIdentity,
  SeoGovernancePublicReport,
  SeoReportFormat,
  SeoStrictScope,
  SeoValidationMode,
} from "./types";

export const SEO_GOVERNANCE_EXIT_CODES = Object.freeze({
  PASSED: 0,
  GOVERNANCE_FAILED: 1,
  USAGE_ERROR: 2,
  INTERNAL_ERROR: 3,
} as const);

/**
 * Frozen Ticket 05 baseline contract for the package-level check/write entry
 * points. This date is an explicit repository snapshot, never a wall-clock
 * default. Direct CLI calls still require --mode and --as-of unless they opt
 * into this contract with --baseline-contract.
 */
export const SEO_GOVERNANCE_BASELINE_CONTRACT = Object.freeze({
  mode: "compatibility" as const,
  asOfDate: "2026-07-18",
});

export const SEO_GOVERNANCE_USAGE =
  "Usage: seo-governance (--mode compatibility|strict --as-of YYYY-MM-DD | --baseline-contract) [--strict-scope migrated|all] [--write] [--format human|json] [--root-dir PATH]";

export interface ParsedSeoGovernanceCliArgs {
  asOfDate: string;
  format: SeoReportFormat;
  mode: SeoValidationMode;
  rootDir?: string;
  strictScope: SeoStrictScope;
  write: boolean;
}

export interface SeoGovernanceCliDependencies {
  rootDir?: string;
  evidenceRegistrySource?: string;
  baselineCohort?: readonly SeoBaselineIdentity[];
  clusterRegistryInput?: unknown;
}

export interface SeoGovernanceCliResult {
  exitCode: (typeof SEO_GOVERNANCE_EXIT_CODES)[keyof typeof SEO_GOVERNANCE_EXIT_CODES];
  stdout: string;
  stderr: string;
}

class SeoGovernanceUsageError extends Error {}

function requireValue(
  argv: readonly string[],
  index: number,
  flag: string,
): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new SeoGovernanceUsageError(`${flag} requires a value.`);
  }
  return value;
}

function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    year >= 1 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function parseSeoGovernanceCliArgs(
  argv: readonly string[],
): ParsedSeoGovernanceCliArgs {
  let mode: SeoValidationMode | undefined;
  let asOfDate: string | undefined;
  let strictScope: SeoStrictScope = "migrated";
  let explicitScope: SeoStrictScope | undefined;
  let format: SeoReportFormat = "human";
  let rootDir: string | undefined;
  let write = false;
  let useBaselineContract = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--baseline-contract") {
      if (useBaselineContract) {
        throw new SeoGovernanceUsageError(
          "--baseline-contract may be provided only once.",
        );
      }
      useBaselineContract = true;
      continue;
    }

    if (argument === "--write") {
      write = true;
      continue;
    }

    if (argument === "--mode") {
      const value = requireValue(argv, index, argument);
      if (value !== "compatibility" && value !== "strict") {
        throw new SeoGovernanceUsageError(
          "--mode must be compatibility or strict.",
        );
      }
      if (mode !== undefined) {
        throw new SeoGovernanceUsageError("--mode may be provided only once.");
      }
      mode = value;
      index += 1;
      continue;
    }

    if (argument === "--as-of") {
      const value = requireValue(argv, index, argument);
      if (!isValidCalendarDate(value)) {
        throw new SeoGovernanceUsageError(
          "--as-of must be a valid YYYY-MM-DD calendar date.",
        );
      }
      if (asOfDate !== undefined) {
        throw new SeoGovernanceUsageError("--as-of may be provided only once.");
      }
      asOfDate = value;
      index += 1;
      continue;
    }

    if (argument === "--strict-scope" || argument === "--scope") {
      const value = requireValue(argv, index, argument);
      if (value !== "migrated" && value !== "all") {
        throw new SeoGovernanceUsageError(
          "--strict-scope must be migrated or all.",
        );
      }
      if (explicitScope !== undefined && explicitScope !== value) {
        throw new SeoGovernanceUsageError(
          "Conflicting strict scope arguments were provided.",
        );
      }
      explicitScope = value;
      strictScope = value;
      index += 1;
      continue;
    }

    if (argument === "--format") {
      const value = requireValue(argv, index, argument);
      if (value !== "human" && value !== "json") {
        throw new SeoGovernanceUsageError("--format must be human or json.");
      }
      format = value;
      index += 1;
      continue;
    }

    if (argument === "--root-dir") {
      const value = requireValue(argv, index, argument);
      rootDir = path.resolve(value);
      index += 1;
      continue;
    }

    throw new SeoGovernanceUsageError(`Unknown argument: ${argument}`);
  }

  if (useBaselineContract) {
    mode ??= SEO_GOVERNANCE_BASELINE_CONTRACT.mode;
    asOfDate ??= SEO_GOVERNANCE_BASELINE_CONTRACT.asOfDate;
  }

  if (!mode) {
    throw new SeoGovernanceUsageError("--mode is required.");
  }
  if (!asOfDate) {
    throw new SeoGovernanceUsageError("--as-of is required.");
  }

  return {
    asOfDate,
    format,
    mode,
    ...(rootDir ? { rootDir } : {}),
    strictScope,
    write,
  };
}

function publicReport(
  result: ReturnType<typeof runSeoGovernance>,
): SeoGovernancePublicReport {
  return {
    protocolVersion: result.protocolVersion,
    operation: result.operation,
    mode: result.mode,
    strictScope: result.strictScope,
    asOfDate: result.asOfDate,
    status: result.validation.status,
    artifactDirectory: result.artifactDirectory,
    artifactChecks: result.artifactChecks,
    compatibility: result.compatibilityReport,
    hardFailures: result.validation.hardFailures,
    advisoryWarnings: result.validation.advisoryWarnings,
  };
}

function humanReport(report: SeoGovernancePublicReport): string {
  const lines = [
    `SEO governance protocol v${report.protocolVersion}`,
    `Status: ${report.status}`,
    `Operation: ${report.operation}`,
    `Mode: ${report.mode}`,
    `Strict scope: ${report.strictScope}`,
    `As of: ${report.asOfDate}`,
    `Articles: ${report.compatibility.articleCount}`,
    `Compatibility: governed ${report.compatibility.governedArticleCount}, pending ${report.compatibility.compatibilityArticleCount}`,
    `Baseline: ${report.compatibility.baseline.status} (expected ${report.compatibility.baseline.expectedCount}, actual ${report.compatibility.baseline.actualCount})`,
    `Artifacts: ${report.artifactDirectory}`,
  ];

  for (const check of report.artifactChecks) {
    lines.push(`- ${check.name}: ${check.status}`);
  }

  lines.push(`Hard failures: ${report.hardFailures.length}`);
  for (const issue of report.hardFailures) {
    lines.push(`- [${issue.category}/${issue.code}] ${issue.subject}`);
  }

  lines.push(`Advisories: ${report.advisoryWarnings.length}`);
  for (const issue of report.advisoryWarnings) {
    lines.push(`- [${issue.category}/${issue.code}] ${issue.subject}`);
  }

  return `${lines.join("\n")}\n`;
}

export function executeSeoGovernanceCli(
  argv: readonly string[],
  dependencies: SeoGovernanceCliDependencies = {},
): SeoGovernanceCliResult {
  let parsed: ParsedSeoGovernanceCliArgs;
  try {
    parsed = parseSeoGovernanceCliArgs(argv);
  } catch (error) {
    const message =
      error instanceof SeoGovernanceUsageError
        ? error.message
        : "Invalid SEO governance arguments.";
    return {
      exitCode: SEO_GOVERNANCE_EXIT_CODES.USAGE_ERROR,
      stdout: "",
      stderr: `${message}\n${SEO_GOVERNANCE_USAGE}\n`,
    };
  }

  try {
    const rootDir =
      parsed.rootDir ?? dependencies.rootDir ?? locateSeoProjectRoot();
    const result = runSeoGovernance({
      rootDir,
      mode: parsed.mode,
      strictScope: parsed.strictScope,
      asOfDate: parsed.asOfDate,
      write: parsed.write,
      ...(dependencies.evidenceRegistrySource !== undefined
        ? { evidenceRegistrySource: dependencies.evidenceRegistrySource }
        : {}),
      ...(dependencies.baselineCohort !== undefined
        ? { baselineCohort: dependencies.baselineCohort }
        : {}),
      ...(dependencies.clusterRegistryInput !== undefined
        ? { clusterRegistryInput: dependencies.clusterRegistryInput }
        : {}),
    });
    const report = publicReport(result);

    return {
      exitCode:
        report.status === "passed"
          ? SEO_GOVERNANCE_EXIT_CODES.PASSED
          : SEO_GOVERNANCE_EXIT_CODES.GOVERNANCE_FAILED,
      stdout:
        parsed.format === "json" ? stableJson(report) : humanReport(report),
      stderr: "",
    };
  } catch {
    return {
      exitCode: SEO_GOVERNANCE_EXIT_CODES.INTERNAL_ERROR,
      stdout: "",
      stderr:
        "SEO governance could not complete because of an internal error.\n",
    };
  }
}

export function runSeoGovernanceCliProcess(
  argv: readonly string[] = process.argv.slice(2),
): void {
  const result = executeSeoGovernanceCli(argv);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
}
