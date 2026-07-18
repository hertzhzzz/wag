import { createHash } from "node:crypto";

import type { Sha256Digest } from "../release/releaseContract";
import type { StrictCutoverSourceDigestInput } from "./types";

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
      throw new TypeError("Non-finite numbers are not canonical.");
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
        .map((key) => {
          if (record[key] === undefined) {
            throw new TypeError(`Undefined value at ${key} is not canonical.`);
          }
          return [key, canonicalize(record[key])];
        }),
    );
  }
  throw new TypeError(`Unsupported canonical value: ${typeof value}.`);
}

export function canonicalStrictCutoverJson(value: unknown): string {
  const serialized = JSON.stringify(canonicalize(value));
  if (serialized === undefined)
    throw new TypeError("Value is not canonical JSON.");
  return serialized;
}

export function digestStrictCutoverValue(value: unknown): Sha256Digest {
  return `sha256:${createHash("sha256")
    .update(canonicalStrictCutoverJson(value), "utf8")
    .digest("hex")}`;
}

export function digestStrictCutoverContent(content: string): Sha256Digest {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}

export function computeStrictCutoverSourceDigest(
  input: StrictCutoverSourceDigestInput,
): Sha256Digest {
  const clusterPreviewDigests = input.clusterPreviews
    .map((preview) => ({
      ticket: preview.ticket,
      clusterId: preview.clusterId,
      digest: digestStrictCutoverValue(preview),
    }))
    .sort((left, right) =>
      String(left.clusterId).localeCompare(String(right.clusterId)),
    );
  return digestStrictCutoverValue({
    ticket: "13",
    ledgerDigest: input.ledgerDigest,
    clusterPreviewDigests,
    overlaysPreviewDigest: digestStrictCutoverValue(input.overlaysPreview),
    graphDigest: input.graphDigest,
  });
}
