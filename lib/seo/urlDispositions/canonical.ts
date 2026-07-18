import { createHash } from "node:crypto";

import {
  urlDispositionPlanSchema,
  type Sha256Digest,
  type UrlDispositionPlanInput,
} from "./schema";
import type { UrlDispositionPreflightReport } from "./preflight";

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
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested);
  }

  return value;
}

function canonicalize(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/\r\n?/g, "\n");
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(
        "URL disposition canonical JSON rejects non-finite numbers.",
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
    `URL disposition canonical JSON cannot serialize ${typeof value}.`,
  );
}

function normalizedPlan(
  plan: UrlDispositionPlanInput,
): UrlDispositionPlanInput {
  return {
    ...plan,
    governance: {
      ...plan.governance,
      prerequisiteTickets: [...plan.governance.prerequisiteTickets].sort(
        (left, right) => compareCodePoints(left.ticketId, right.ticketId),
      ),
    },
    records: [...plan.records]
      .map((record) => ({
        ...record,
        rollback: {
          ...record.rollback,
          conditions: sortCodePoints(record.rollback.conditions),
        },
      }))
      .sort(
        (left, right) =>
          compareCodePoints(left.id, right.id) ||
          compareCodePoints(left.source, right.source),
      ),
    unaffectedReport: {
      ...plan.unaffectedReport,
      baselineUrls: sortCodePoints(plan.unaffectedReport.baselineUrls),
      unchanged: [...plan.unaffectedReport.unchanged].sort((left, right) =>
        compareCodePoints(left.url, right.url),
      ),
    },
  };
}

export function canonicalizeUrlDispositionPlan(
  raw: UrlDispositionPlanInput,
): string {
  const parsed = urlDispositionPlanSchema.parse(raw);
  return JSON.stringify(canonicalize(normalizedPlan(parsed)));
}

export function computeUrlDispositionArtifactDigest(
  raw: UrlDispositionPlanInput,
): Sha256Digest {
  return `sha256:${createHash("sha256")
    .update(canonicalizeUrlDispositionPlan(raw), "utf8")
    .digest("hex")}`;
}

export function canonicalizeUrlDispositionPreflightReport(
  report: Omit<UrlDispositionPreflightReport, "reportDigest">,
): string {
  const subject = { ...report, releaseGate: { ...report.releaseGate } };
  delete (subject as { reportDigest?: unknown }).reportDigest;
  delete (subject.releaseGate as { verifiedReportDigest?: unknown })
    .verifiedReportDigest;
  return JSON.stringify(canonicalize(subject));
}

export function computeUrlDispositionReportDigest(
  report: Omit<UrlDispositionPreflightReport, "reportDigest">,
): Sha256Digest {
  return `sha256:${createHash("sha256")
    .update(canonicalizeUrlDispositionPreflightReport(report), "utf8")
    .digest("hex")}`;
}
