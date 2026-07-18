#!/usr/bin/env tsx
/**
 * Read-only SAMR evidence gate CLI.
 *
 * The as-of date is always supplied by the caller so reports never depend on
 * the machine clock. Input and parse failures use generic messages to avoid
 * echoing controlled or restricted values.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runEvidenceGate } from "../lib/seo/evidenceGate";
import {
  parseEvidenceClaimManifestYaml,
  parseEvidenceRegistryYaml,
  parseEvidenceReviewDecisionYaml,
} from "../lib/seo/evidenceSchema";

interface CliOptions {
  articlePath: string;
  registryPath: string;
  claimManifestPath: string;
  reviewDecisionPath: string;
  asOfDate: string;
}

type PathOption = "--article" | "--registry" | "--claims" | "--review";
type CliOption = PathOption | "--as-of";

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const DEFAULT_PATHS: Record<PathOption, string> = {
  "--article": path.join(
    PROJECT_ROOT,
    "content/blog/check-chinese-company-samr.mdx",
  ),
  "--registry": path.join(PROJECT_ROOT, "content/seo/evidence/registry.yaml"),
  "--claims": path.join(
    PROJECT_ROOT,
    "content/seo/evidence/claims/check-chinese-company-samr.yaml",
  ),
  "--review": path.join(
    PROJECT_ROOT,
    "content/seo/evidence/reviews/check-chinese-company-samr.yaml",
  ),
};

const PATH_OPTION_KEYS: Record<
  PathOption,
  keyof Pick<
    CliOptions,
    "articlePath" | "registryPath" | "claimManifestPath" | "reviewDecisionPath"
  >
> = {
  "--article": "articlePath",
  "--registry": "registryPath",
  "--claims": "claimManifestPath",
  "--review": "reviewDecisionPath",
};

class CliUsageError extends Error {}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const daysByMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day <= daysByMonth[month - 1];
}

function isCliOption(value: string): value is CliOption {
  return (
    value === "--article" ||
    value === "--registry" ||
    value === "--claims" ||
    value === "--review" ||
    value === "--as-of"
  );
}

function resolveInputPath(value: string): string {
  return path.resolve(process.cwd(), value);
}

function splitOption(argument: string): [string, string | undefined] {
  const separatorIndex = argument.indexOf("=");
  if (separatorIndex === -1) return [argument, undefined];

  return [
    argument.slice(0, separatorIndex),
    argument.slice(separatorIndex + 1),
  ];
}

function parseCliOptions(argumentsList: readonly string[]): CliOptions {
  const options: CliOptions = {
    articlePath: DEFAULT_PATHS["--article"],
    registryPath: DEFAULT_PATHS["--registry"],
    claimManifestPath: DEFAULT_PATHS["--claims"],
    reviewDecisionPath: DEFAULT_PATHS["--review"],
    asOfDate: "",
  };
  const seen = new Set<CliOption>();

  for (let index = 0; index < argumentsList.length; index += 1) {
    const [rawOption, inlineValue] = splitOption(argumentsList[index]);
    if (!isCliOption(rawOption)) {
      throw new CliUsageError("Unsupported CLI argument.");
    }
    if (seen.has(rawOption)) {
      throw new CliUsageError(`Provide ${rawOption} only once.`);
    }
    seen.add(rawOption);

    const value = inlineValue ?? argumentsList[index + 1];
    if (
      typeof value !== "string" ||
      value.length === 0 ||
      (inlineValue === undefined && value.startsWith("--"))
    ) {
      throw new CliUsageError(`A value is required for ${rawOption}.`);
    }
    if (inlineValue === undefined) index += 1;

    if (rawOption === "--as-of") {
      options.asOfDate = value;
    } else {
      options[PATH_OPTION_KEYS[rawOption]] = resolveInputPath(value);
    }
  }

  if (!options.asOfDate) {
    throw new CliUsageError("--as-of YYYY-MM-DD is required.");
  }
  if (!isValidCalendarDate(options.asOfDate)) {
    throw new CliUsageError(
      "--as-of must be a valid YYYY-MM-DD calendar date.",
    );
  }

  return options;
}

function readUtf8(pathname: string): string {
  return readFileSync(pathname, "utf8");
}

function main(): void {
  let options: CliOptions;
  try {
    options = parseCliOptions(process.argv.slice(2));
  } catch (error) {
    const message =
      error instanceof CliUsageError
        ? error.message
        : "Evidence gate CLI arguments are invalid.";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
    return;
  }

  try {
    const articleSource = readUtf8(options.articlePath);
    const claimManifestSource = readUtf8(options.claimManifestPath);
    const registrySource = readUtf8(options.registryPath);
    const reviewDecisionSource = readUtf8(options.reviewDecisionPath);

    const registry = parseEvidenceRegistryYaml(registrySource);
    const claimManifest = parseEvidenceClaimManifestYaml(claimManifestSource);
    const reviewDecision =
      parseEvidenceReviewDecisionYaml(reviewDecisionSource);
    const report = runEvidenceGate({
      articleSource,
      claimManifestSource,
      registry,
      claimManifest,
      reviewDecision,
      asOfDate: options.asOfDate,
    });

    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exitCode = report.status === "passed" ? 0 : 1;
  } catch {
    process.stderr.write(
      "Evidence inputs could not be read or validated against the frozen schema.\n",
    );
    process.exitCode = 1;
  }
}

main();
