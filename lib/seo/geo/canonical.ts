import { GeoCanonicalError } from "./types";

function codePoints(value: string): number[] {
  return Array.from(value, (character) => character.codePointAt(0) ?? 0);
}

export function compareUnicodeCodePoints(left: string, right: string): number {
  const leftPoints = codePoints(left);
  const rightPoints = codePoints(right);
  const length = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) {
      return leftPoints[index] - rightPoints[index];
    }
  }

  return leftPoints.length - rightPoints.length;
}

export function normalizeRepositoryRelativePosixPath(value: string): string {
  if (typeof value !== "string" || value.length === 0 || value.includes("\0")) {
    throw new GeoCanonicalError("GEO path must be a non-empty safe string.");
  }

  const posix = value.replace(/\\/g, "/");
  if (
    posix.startsWith("/") ||
    /^[A-Za-z]:\//.test(posix) ||
    /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(posix)
  ) {
    throw new GeoCanonicalError("GEO paths must be repository-relative.");
  }

  const normalizedSegments: string[] = [];
  for (const segment of posix.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }
    if (segment === "..") {
      throw new GeoCanonicalError("GEO paths may not traverse parent folders.");
    }
    normalizedSegments.push(segment);
  }

  if (normalizedSegments.length === 0) {
    throw new GeoCanonicalError("GEO path must identify a repository file.");
  }

  return normalizedSegments.join("/");
}

function isPathKey(key: string | undefined): boolean {
  return key === "path" || key?.endsWith("Path") === true;
}

function assertPlainObject(
  value: object,
): asserts value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new GeoCanonicalError(
      "GEO canonical values must be plain JSON data.",
    );
  }
}

function indent(level: number): string {
  return "  ".repeat(level);
}

function serializeValue(
  value: unknown,
  level: number,
  parentKey: string | undefined,
  seen: Set<object>,
): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    const lfValue = value.replace(/\r\n?/g, "\n");
    const normalized = isPathKey(parentKey)
      ? normalizeRepositoryRelativePosixPath(lfValue)
      : lfValue;
    return JSON.stringify(normalized);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new GeoCanonicalError("GEO canonical numbers must be finite.");
    }
    return JSON.stringify(value);
  }

  if (
    typeof value === "undefined" ||
    typeof value === "function" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  ) {
    throw new GeoCanonicalError("GEO canonical values must be valid JSON.");
  }

  if (seen.has(value)) {
    throw new GeoCanonicalError("GEO canonical values may not be cyclic.");
  }
  seen.add(value);

  try {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "[]";
      }
      const entries = value.map(
        (entry) =>
          `${indent(level + 1)}${serializeValue(
            entry,
            level + 1,
            undefined,
            seen,
          )}`,
      );
      return `[\n${entries.join(",\n")}\n${indent(level)}]`;
    }

    assertPlainObject(value);
    const keys = Object.keys(value).sort(compareUnicodeCodePoints);
    if (keys.length === 0) {
      return "{}";
    }
    const entries = keys.map((key) => {
      const serialized = serializeValue(value[key], level + 1, key, seen);
      return `${indent(level + 1)}${JSON.stringify(key)}: ${serialized}`;
    });
    return `{\n${entries.join(",\n")}\n${indent(level)}}`;
  } finally {
    seen.delete(value);
  }
}

export function canonicalSerialize(value: unknown): string {
  return `${serializeValue(value, 0, undefined, new Set<object>())}\n`;
}
