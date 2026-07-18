import { createHash } from "node:crypto";

import {
  guidesIntegrationPreflightInputSchema,
  type GuidesIntegrationPreflightInput,
  type GuidesIntegrationTicket27BReport,
  type Sha256Digest,
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

  for (
    let index = 0;
    index < Math.min(leftPoints.length, rightPoints.length);
    index += 1
  ) {
    if (leftPoints[index] !== rightPoints[index]) {
      return leftPoints[index] - rightPoints[index];
    }
  }

  return leftPoints.length - rightPoints.length;
}

function normalizeString(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function containsControlCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if ((codePoint >= 0 && codePoint <= 31) || codePoint === 127) {
      return true;
    }
  }
  return false;
}

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertCanonicalSafe(
  value: unknown,
  path: string,
  ancestors: Set<object>,
): void {
  if (typeof value === "string") {
    if (containsControlCharacter(value)) {
      throw new Error(`${path} contains a control character.`);
    }
    return;
  }

  if (value === null || typeof value === "boolean") return;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`${path} must be a finite number.`);
    }
    return;
  }

  if (typeof value === "undefined") {
    throw new Error(`${path} must not be undefined.`);
  }

  if (typeof value !== "object") {
    throw new Error(`${path} contains an unsupported value.`);
  }

  if (ancestors.has(value)) {
    throw new Error(`${path} contains a cyclic reference.`);
  }
  if (!isPlainObject(value) && !Array.isArray(value)) {
    throw new Error(`${path} must contain only plain objects and arrays.`);
  }

  ancestors.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertCanonicalSafe(item, `${path}[${index}]`, ancestors),
    );
  } else {
    Object.entries(value).forEach(([key, item]) => {
      if (containsControlCharacter(key)) {
        throw new Error(`${path}.${key} contains a control character.`);
      }
      assertCanonicalSafe(item, `${path}.${key}`, ancestors);
    });
  }
  ancestors.delete(value);
}

function canonicalizeValue(value: unknown): unknown {
  if (typeof value === "string") return normalizeString(value);
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalizeValue);

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => compareCodePoints(left, right))
      .map(([key, item]) => [normalizeString(key), canonicalizeValue(item)]),
  );
}

export function canonicalizeGuidesIntegrationValue(value: unknown): string {
  assertCanonicalSafe(value, "value", new Set<object>());
  return JSON.stringify(canonicalizeValue(value));
}

export function canonicalizeGuidesIntegrationInput(input: unknown): string {
  const parsed = guidesIntegrationPreflightInputSchema.parse(input);
  return canonicalizeGuidesIntegrationValue(parsed);
}

export function computeGuidesIntegrationArtifactDigest(
  value: unknown,
): Sha256Digest {
  const canonical = canonicalizeGuidesIntegrationValue(value);
  return `sha256:${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
}

export function computeGuidesIntegrationTicket27BReportDigest(
  report: GuidesIntegrationTicket27BReport,
): Sha256Digest {
  const {
    reportDigest: _reportDigest,
    artifactDigest: _artifactDigest,
    lineage,
    ...rest
  } = report;
  const { artifactDigest: _lineageArtifactDigest, ...lineageSubject } = lineage;
  void _reportDigest;
  void _artifactDigest;
  void _lineageArtifactDigest;
  return computeGuidesIntegrationArtifactDigest({
    ...rest,
    lineage: lineageSubject,
  });
}

function integrationArtifactSubjectValue(
  value: unknown,
  artifactDigest: Sha256Digest | null,
  integrationReportDigest: Sha256Digest | null,
  path: readonly string[] = [],
): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      integrationArtifactSubjectValue(
        item,
        artifactDigest,
        integrationReportDigest,
        [...path, String(index)],
      ),
    );
  }
  if (value === null || typeof value !== "object") return value;

  const entries = Object.entries(value).flatMap(([key, item]) => {
    const nextPath = [...path, key];
    const rootArtifactIdentity =
      path.length === 1 && path[0] === "artifact" && key === "digest";
    const rootReportIdentity =
      path.length === 1 && path[0] === "artifact" && key === "reportDigest";
    const copiedArtifactDigest =
      key === "artifactDigest" && item === artifactDigest;
    const copiedEvidenceDigest =
      key === "digest" && path.at(-1) === "evidence" && item === artifactDigest;
    const copiedIntegrationReportDigest =
      key === "reportDigest" &&
      item === integrationReportDigest &&
      path[0] !== "ticket25" &&
      path[0] !== "ticket27BReport" &&
      path[0] !== "urlDispositionPreflight" &&
      path[0] !== "urlDisposition";

    if (
      rootArtifactIdentity ||
      rootReportIdentity ||
      copiedArtifactDigest ||
      copiedEvidenceDigest ||
      copiedIntegrationReportDigest
    ) {
      return [];
    }

    return [
      [
        key,
        integrationArtifactSubjectValue(
          item,
          artifactDigest,
          integrationReportDigest,
          nextPath,
        ),
      ],
    ];
  });

  return Object.fromEntries(entries);
}

export function computeGuidesIntegrationArtifactSubjectDigest(
  input: GuidesIntegrationPreflightInput,
): Sha256Digest {
  const parsed = guidesIntegrationPreflightInputSchema.parse(input);
  return computeGuidesIntegrationArtifactDigest(
    integrationArtifactSubjectValue(
      parsed,
      parsed.artifact?.digest ?? null,
      parsed.artifact?.reportDigest ?? null,
    ),
  );
}

export function digestGuidesIntegrationInput(input: unknown): Sha256Digest {
  return computeGuidesIntegrationArtifactDigest(
    guidesIntegrationPreflightInputSchema.parse(input),
  );
}

export function deepFreezeGuidesIntegration<T>(value: T): T {
  const seen = new WeakSet<object>();

  const freeze = (candidate: unknown): void => {
    if (!candidate || typeof candidate !== "object") return;
    const objectValue = candidate as object;
    if (seen.has(objectValue)) return;
    seen.add(objectValue);
    Reflect.ownKeys(objectValue).forEach((key) => {
      freeze((objectValue as Record<PropertyKey, unknown>)[key]);
    });
    Object.freeze(objectValue);
  };

  freeze(value);
  return value;
}
