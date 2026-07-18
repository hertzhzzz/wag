import { createHash } from "node:crypto";

import {
  SOURCE_RETIREMENT_ARTIFACT_VERSION,
  type SourceRetirementDigest,
  type SourceRetirementInput,
  type SourceRetirementPreflightReport,
} from "./types";

export function compareCodePoints(left: string, right: string): number {
  const leftPoints = Array.from(
    left,
    (character) => character.codePointAt(0) ?? 0,
  );
  const rightPoints = Array.from(
    right,
    (character) => character.codePointAt(0) ?? 0,
  );
  const length = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) {
      return leftPoints[index] - rightPoints[index];
    }
  }

  return leftPoints.length - rightPoints.length;
}

export function sortCodePoints<T extends string>(values: readonly T[]): T[] {
  return [...values].sort(compareCodePoints);
}

export function deepFreeze<T>(value: T): T {
  const seen = new WeakSet<object>();

  function freeze<TValue>(current: TValue): TValue {
    if (!current || typeof current !== "object") return current;
    const object = current as object;
    if (seen.has(object)) return current;
    seen.add(object);
    Object.freeze(object);
    for (const nested of Object.values(object as Record<string, unknown>)) {
      freeze(nested);
    }
    return current;
  }

  return freeze(value);
}

function canonicalize(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/\r\n?/g, "\n");
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(
        "Source retirement canonical JSON rejects non-finite numbers.",
      );
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => compareCodePoints(left, right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }

  throw new Error(
    `Source retirement canonical JSON cannot serialize ${typeof value}.`,
  );
}

function pathKey(path: readonly (string | number)[]): string {
  return path.map(String).join(".");
}

function isArrayIndex(value: string): boolean {
  return /^\d+$/.test(value);
}

function omitArtifactBindingDigest(
  path: readonly (string | number)[],
): boolean {
  const parts = path.map(String);
  if (parts.length === 2 && parts[0] === "artifact" && parts[1] === "digest") {
    return true;
  }
  if (
    parts.length === 2 &&
    parts[0] === "migrationLedger" &&
    parts[1] === "artifactDigest"
  ) {
    return true;
  }
  if (
    parts.length === 2 &&
    parts[0] === "rollback" &&
    parts[1] === "artifactDigest"
  ) {
    return true;
  }
  if (
    parts.length === 3 &&
    isArrayIndex(parts[1]) &&
    (parts[0] === "approvedDecisions" || parts[0] === "approvals") &&
    parts[2] === "artifactDigest"
  ) {
    return true;
  }
  return false;
}

function omitReportDigest(path: readonly (string | number)[]): boolean {
  return path.length === 1 && String(path[0]) === "reportDigest";
}

function normalizeArrays(
  value: unknown,
  path: readonly (string | number)[],
): unknown {
  if (!Array.isArray(value)) return value;

  const normalized = value.map((item, index) =>
    normalizeValue(item, [...path, index]),
  );
  const key = pathKey(path);
  const unordered =
    key === "scope.sourceFamilies" ||
    key === "scope.bundleIds" ||
    key === "scope.articleIds" ||
    key === "legacy.articles" ||
    key === "governed.articles" ||
    key === "approvedDecisions" ||
    key === "approvals" ||
    key === "articles" ||
    key === "graphParity.articles" ||
    key.endsWith(".navigation") ||
    key.endsWith(".recommendations") ||
    key.endsWith(".diagnostics");

  if (!unordered) return normalized;
  return [...normalized].sort((left, right) =>
    compareCodePoints(
      JSON.stringify(canonicalize(left)),
      JSON.stringify(canonicalize(right)),
    ),
  );
}

function normalizeValue(
  value: unknown,
  path: readonly (string | number)[],
): unknown {
  if (Array.isArray(value)) return normalizeArrays(value, path);
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const nextPath = [...path, key];
      if (omitReportDigest(nextPath) || omitArtifactBindingDigest(nextPath))
        continue;
      output[key] = normalizeValue(nested, nextPath);
    }
    return output;
  }
  return value;
}

export function canonicalizeSourceRetirementInventory(
  inventory: unknown,
): string {
  const projection = normalizeValue(inventory, []);
  if (
    projection &&
    typeof projection === "object" &&
    !Array.isArray(projection)
  ) {
    delete (projection as Record<string, unknown>).inventoryDigest;
  }
  return JSON.stringify(canonicalize(projection));
}

export function computeSourceRetirementInventoryDigest(
  inventory: unknown,
): SourceRetirementDigest {
  return `sha256:${createHash("sha256")
    .update(canonicalizeSourceRetirementInventory(inventory), "utf8")
    .digest("hex")}`;
}

export function canonicalizeSourceRetirementArtifact(input: unknown): string {
  const projection = normalizeValue(input, []);
  return JSON.stringify(canonicalize(projection));
}

export function computeSourceRetirementArtifactDigest(
  input: SourceRetirementInput | unknown,
): SourceRetirementDigest {
  return `sha256:${createHash("sha256")
    .update(canonicalizeSourceRetirementArtifact(input), "utf8")
    .digest("hex")}`;
}

export function canonicalizeSourceRetirementReport(
  report: Omit<SourceRetirementPreflightReport, "reportDigest"> | unknown,
): string {
  const projection = normalizeReportValue(report, []);
  return JSON.stringify(canonicalize(projection));
}

function normalizeReportValue(
  value: unknown,
  path: readonly (string | number)[],
): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      normalizeReportValue(item, [...path, index]),
    );
  }
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const nextPath = [...path, key];
      if (omitReportDigest(nextPath)) continue;
      output[key] = normalizeReportValue(nested, nextPath);
    }
    return output;
  }
  return value;
}

export function computeSourceRetirementReportDigest(
  report: Omit<SourceRetirementPreflightReport, "reportDigest"> | unknown,
): SourceRetirementDigest {
  return `sha256:${createHash("sha256")
    .update(canonicalizeSourceRetirementReport(report), "utf8")
    .digest("hex")}`;
}

export function isSourceRetirementArtifactVersion(value: unknown): boolean {
  return value === SOURCE_RETIREMENT_ARTIFACT_VERSION;
}

export function isSourceRetirementDigest(
  value: unknown,
): value is SourceRetirementDigest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/.test(value);
}
