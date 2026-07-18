import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readSync,
  realpathSync,
} from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

import {
  buildWeeklyCadenceReport,
  renderWeeklyCadenceMarkdown,
  type WeeklyCadenceInput,
} from "../../lib/seo/cadence/weeklyCadence";

export const MAX_CADENCE_INPUT_BYTES = 1_048_576;
export const DEFAULT_CADENCE_INPUT_ROOT = resolve(
  process.cwd(),
  ".scratch/seo-growth-system",
);

export type CadenceCliFormat = "json" | "markdown";

export interface SafeCadenceInputOptions {
  allowedRoot?: string;
  maxBytes?: number;
}

export interface CadenceCliArgs {
  inputPath: string;
  format: CadenceCliFormat;
}

function usageError(): Error {
  return new Error(
    "Usage: tsx scripts/seo/render-weekly-cadence.ts <input.json> [--format json|markdown]",
  );
}

function isWithinRoot(root: string, candidate: string): boolean {
  const child = relative(root, candidate);
  return (
    child === "" ||
    (child !== ".." && !child.startsWith(`..${sep}`) && !isAbsolute(child))
  );
}

function safeReadError(message: string): Error {
  return new Error(message);
}

function assertSafeRoot(root: string): string {
  if (typeof root !== "string" || root.trim() === "" || root.includes("\0")) {
    throw safeReadError("Cadence input root is not available.");
  }
  try {
    return realpathSync(resolve(root));
  } catch {
    throw safeReadError("Cadence input root is not available.");
  }
}

function resolveCandidatePath(inputPath: string, allowedRoot: string): string {
  if (
    typeof inputPath !== "string" ||
    inputPath.trim() === "" ||
    inputPath.includes("\0")
  ) {
    throw safeReadError("Cadence input could not be read safely.");
  }

  const rootRealPath = assertSafeRoot(allowedRoot);
  const candidatePath = resolve(rootRealPath, inputPath);
  if (!isWithinRoot(rootRealPath, candidatePath)) {
    throw safeReadError("Cadence input is outside the allowed root.");
  }

  const childPath = relative(rootRealPath, candidatePath);
  let currentPath = rootRealPath;
  let candidateStat;
  try {
    for (const component of childPath.split(sep).filter(Boolean)) {
      currentPath = join(currentPath, component);
      candidateStat = lstatSync(currentPath);
      if (candidateStat.isSymbolicLink()) {
        throw safeReadError("Cadence input must not traverse symbolic links.");
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Cadence input ")) {
      throw error;
    }
    throw safeReadError("Cadence input could not be read safely.");
  }

  if (!candidateStat?.isFile()) {
    throw safeReadError("Cadence input must be a regular non-symlink file.");
  }

  let candidateRealPath: string;
  try {
    candidateRealPath = realpathSync(candidatePath);
  } catch {
    throw safeReadError("Cadence input could not be read safely.");
  }
  if (!isWithinRoot(rootRealPath, candidateRealPath)) {
    throw safeReadError("Cadence input is outside the allowed root.");
  }

  return candidateRealPath;
}

function readBoundedFile(path: string, maxBytes: number): string {
  const noFollow = constants.O_NOFOLLOW ?? 0;
  let descriptor: number | undefined;
  try {
    descriptor = openSync(path, constants.O_RDONLY | noFollow);
    const initialStat = fstatSync(descriptor);
    if (!initialStat.isFile()) {
      throw safeReadError("Cadence input must be a regular non-symlink file.");
    }
    if (initialStat.size > maxBytes) {
      throw safeReadError("Cadence input exceeds the maximum allowed size.");
    }

    const chunks: Buffer[] = [];
    let total = 0;
    while (total <= maxBytes) {
      const remaining = maxBytes + 1 - total;
      const chunk = Buffer.alloc(Math.min(64 * 1024, remaining));
      const bytesRead = readSync(descriptor, chunk, 0, chunk.length, null);
      if (bytesRead === 0) break;
      total += bytesRead;
      if (total > maxBytes) {
        throw safeReadError("Cadence input exceeds the maximum allowed size.");
      }
      chunks.push(chunk.subarray(0, bytesRead));
    }
    return Buffer.concat(chunks, total).toString("utf8");
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Cadence input ")) {
      throw error;
    }
    throw safeReadError("Cadence input could not be read safely.");
  } finally {
    if (descriptor !== undefined) {
      try {
        closeSync(descriptor);
      } catch {
        // Do not expose filesystem details from cleanup failures.
      }
    }
  }
}

export function readSafeCadenceInput(
  inputPath: string,
  options: SafeCadenceInputOptions = {},
): unknown {
  const allowedRoot = options.allowedRoot ?? DEFAULT_CADENCE_INPUT_ROOT;
  const maxBytes = options.maxBytes ?? MAX_CADENCE_INPUT_BYTES;
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw safeReadError("Cadence input size policy is invalid.");
  }

  const candidatePath = resolveCandidatePath(inputPath, allowedRoot);
  const text = readBoundedFile(candidatePath, maxBytes);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw safeReadError("Cadence input must contain valid JSON.");
  }
}

export function parseCadenceCliArgs(argv: readonly string[]): CadenceCliArgs {
  const inputPath = argv[0];
  if (!inputPath || inputPath.startsWith("--")) throw usageError();

  let format: CadenceCliFormat = "markdown";
  for (let index = 1; index < argv.length; index += 1) {
    if (argv[index] !== "--format") throw usageError();
    const requested = argv[index + 1];
    if (requested !== "json" && requested !== "markdown") throw usageError();
    format = requested;
    index += 1;
  }
  return { inputPath, format };
}

export function renderCadenceCliOutput(
  argv: readonly string[],
  options: SafeCadenceInputOptions = {},
): string {
  const { inputPath, format } = parseCadenceCliArgs(argv);
  const parsed = readSafeCadenceInput(inputPath, options);
  let report;
  try {
    report = buildWeeklyCadenceReport(parsed as WeeklyCadenceInput);
  } catch {
    throw new Error("Cadence input failed contract validation.");
  }
  return format === "json"
    ? `${JSON.stringify(report, null, 2)}\n`
    : `${renderWeeklyCadenceMarkdown(report)}\n`;
}

export function runCadenceCli(
  argv: readonly string[] = process.argv.slice(2),
): void {
  process.stdout.write(renderCadenceCliOutput(argv));
}

const invokedAsScript = /(?:^|[/\\])render-weekly-cadence\.ts$/.test(
  process.argv[1] ?? "",
);

if (invokedAsScript) {
  try {
    runCadenceCli();
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : "Cadence renderer failed."}\n`,
    );
    process.exitCode = 1;
  }
}
