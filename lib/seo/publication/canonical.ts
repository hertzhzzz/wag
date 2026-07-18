import { createHash } from "node:crypto";
import type { Sha256Digest } from "./contracts";

function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalize(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value))
      throw new Error("canonical data requires finite numbers");
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort(compareCodePoints)
        .map((key) => {
          if (record[key] === undefined)
            throw new Error("canonical data cannot contain undefined");
          return [key, canonicalize(record[key])];
        }),
    );
  }
  throw new Error(`canonical data cannot contain ${typeof value}`);
}

export function canonicalizePublicationEvent(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function digestPublicationEvent(value: unknown): Sha256Digest {
  return `sha256:${createHash("sha256")
    .update(canonicalizePublicationEvent(value), "utf8")
    .digest("hex")}`;
}
