import { createHash } from "node:crypto";

import { canonicalSerialize } from "./canonical";

function digest(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function normalizeLf(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

export function hashBytes(value: string | Uint8Array): string {
  const bytes = typeof value === "string" ? Buffer.from(value, "utf8") : value;
  return digest(bytes);
}

export function hashUtf8Text(value: string): string {
  return hashBytes(Buffer.from(normalizeLf(value), "utf8"));
}

export function hashCanonical(value: unknown): string {
  return hashBytes(Buffer.from(canonicalSerialize(value), "utf8"));
}
