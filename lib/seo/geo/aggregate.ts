import { normalizeRepositoryRelativePosixPath } from "./canonical";
import { hashBytes } from "./hash";
import {
  assertCanonicalBenchmarkQuestionSet,
  parseGeoRunRecord,
} from "./schema";
import { scoreGeoObservations } from "./scoring";
import {
  GEO_METRIC_NAMES,
  GeoConflictError,
  GeoContractError,
  GeoIntegrityError,
  type GeoAggregateResult,
  type GeoBenchmarkComparison,
  type GeoBenchmarkDelta,
  type GeoQuestionDefinition,
  type GeoRunManifest,
  type GeoRunRecord,
  type GeoScorecard,
  type GeoVersionSet,
} from "./types";

export interface AggregateGeoBenchmarkInput {
  runs: readonly GeoRunRecord[];
  snapshotContents?: Readonly<Record<string, string | Uint8Array>>;
}

const VERSION_KEYS: (keyof GeoVersionSet)[] = [
  "schemaVersion",
  "methodologyVersion",
  "benchmarkVersion",
  "questionSetVersion",
];

function versionSet(manifest: GeoRunManifest): GeoVersionSet {
  return {
    schemaVersion: manifest.schemaVersion,
    methodologyVersion: manifest.methodologyVersion,
    benchmarkVersion: manifest.benchmarkVersion,
    questionSetVersion: manifest.questionSetVersion,
  };
}

function mismatchedVersionKeys(
  left: GeoVersionSet,
  right: GeoVersionSet,
): (keyof GeoVersionSet)[] {
  return VERSION_KEYS.filter((key) => left[key] !== right[key]);
}

function normalizeSnapshotContents(
  contents: Readonly<Record<string, string | Uint8Array>>,
): Map<string, string | Uint8Array> {
  const normalized = new Map<string, string | Uint8Array>();

  for (const [path, value] of Object.entries(contents)) {
    let normalizedPath: string;
    try {
      normalizedPath = normalizeRepositoryRelativePosixPath(path);
    } catch {
      throw new GeoIntegrityError();
    }
    if (normalized.has(normalizedPath)) {
      throw new GeoIntegrityError();
    }
    normalized.set(normalizedPath, value);
  }

  return normalized;
}

function verifySnapshotIntegrity(
  records: readonly GeoRunRecord[],
  contents: Readonly<Record<string, string | Uint8Array>>,
): void {
  const normalizedContents = normalizeSnapshotContents(contents);

  for (const record of records) {
    for (const observation of record.observations) {
      if (observation.snapshot === null) {
        continue;
      }
      const content = normalizedContents.get(observation.snapshot.path);
      if (
        content === undefined ||
        hashBytes(content) !== observation.snapshot.hash
      ) {
        throw new GeoIntegrityError();
      }
    }
  }
}

function collectUniqueQuestions(
  records: readonly GeoRunRecord[],
): GeoQuestionDefinition[] {
  const questions = new Map<string, GeoQuestionDefinition>();

  for (const record of records) {
    for (const question of record.manifest.questions) {
      const existing = questions.get(question.questionId);
      if (
        existing !== undefined &&
        (existing.cluster !== question.cluster ||
          existing.prompt.version !== question.prompt.version ||
          existing.prompt.text !== question.prompt.text ||
          existing.prompt.hash !== question.prompt.hash)
      ) {
        throw new GeoContractError();
      }
      questions.set(question.questionId, question);
    }
  }

  return [...questions.values()];
}

function hasCompleteObservedSlots(record: GeoRunRecord): boolean {
  const expected =
    record.manifest.questions.length * record.manifest.expectedRepetitions;
  if (record.observations.length !== expected) {
    return false;
  }

  const slots = new Set(
    record.observations
      .filter(
        (observation) =>
          observation.status === "observed-answer" ||
          observation.status === "observed-surface-absent",
      )
      .map(
        (observation) => `${observation.questionId}:${observation.repetition}`,
      ),
  );

  for (const question of record.manifest.questions) {
    for (
      let repetition = 1;
      repetition <= record.manifest.expectedRepetitions;
      repetition += 1
    ) {
      if (!slots.has(`${question.questionId}:${repetition}`)) {
        return false;
      }
    }
  }

  return true;
}

function hasCanonicalQuestionCoverage(
  records: readonly GeoRunRecord[],
): boolean {
  try {
    assertCanonicalBenchmarkQuestionSet(collectUniqueQuestions(records));
    return true;
  } catch {
    return false;
  }
}

export function aggregateGeoBenchmark(
  input: AggregateGeoBenchmarkInput,
): GeoAggregateResult {
  const records = input.runs.map(parseGeoRunRecord);
  verifySnapshotIntegrity(records, input.snapshotContents ?? {});

  const liveRecords = records.filter(
    (record) =>
      !record.manifest.fixtureOnly &&
      record.manifest.provenance === "external-platform-observation",
  );
  const fixtureRunCount = records.length - liveRecords.length;
  const liveObservations = liveRecords.flatMap((record) => record.observations);
  const expectedObservationCount = liveRecords.reduce(
    (total, record) =>
      total +
      record.manifest.questions.length * record.manifest.expectedRepetitions,
    0,
  );
  const versions =
    liveRecords.length === 0 ? null : versionSet(liveRecords[0].manifest);

  if (liveObservations.length === 0) {
    return {
      status: "blocked_no_live_observations",
      baselineReady: false,
      metrics: null,
      versions,
      liveRunCount: liveRecords.length,
      fixtureRunCount,
      liveObservationCount: 0,
      expectedObservationCount,
    };
  }

  const incompatible = liveRecords.some(
    (record) =>
      versions !== null &&
      mismatchedVersionKeys(versions, versionSet(record.manifest)).length > 0,
  );
  if (incompatible) {
    return {
      status: "blocked_version_mismatch",
      baselineReady: false,
      metrics: null,
      versions: null,
      liveRunCount: liveRecords.length,
      fixtureRunCount,
      liveObservationCount: liveObservations.length,
      expectedObservationCount,
    };
  }

  const metrics = scoreGeoObservations(liveObservations);
  const baselineReady =
    liveRecords.every(hasCompleteObservedSlots) &&
    hasCanonicalQuestionCoverage(liveRecords) &&
    metrics.composite !== null;

  return {
    status: baselineReady ? "ready" : "partial_live_observations",
    baselineReady,
    metrics,
    versions,
    liveRunCount: liveRecords.length,
    fixtureRunCount,
    liveObservationCount: liveObservations.length,
    expectedObservationCount,
  };
}

export function appendGeoRun(
  existing: readonly GeoRunRecord[],
  incoming: GeoRunRecord,
): GeoRunRecord[] {
  const parsedExisting = existing.map(parseGeoRunRecord);
  const runIds = new Set<string>();
  for (const record of parsedExisting) {
    if (runIds.has(record.manifest.runId)) {
      throw new GeoConflictError();
    }
    runIds.add(record.manifest.runId);
  }

  const parsedIncoming = parseGeoRunRecord(incoming);
  if (runIds.has(parsedIncoming.manifest.runId)) {
    throw new GeoConflictError();
  }
  return [...parsedExisting, parsedIncoming];
}

function rateDelta(
  previous: number | null,
  current: number | null,
): number | null {
  return previous === null || current === null ? null : current - previous;
}

function scorecardDelta(
  previous: GeoScorecard,
  current: GeoScorecard,
): GeoBenchmarkDelta {
  const metricDeltas = Object.fromEntries(
    GEO_METRIC_NAMES.map((metric) => [
      metric,
      rateDelta(previous[metric].rate, current[metric].rate),
    ]),
  ) as Omit<GeoBenchmarkDelta, "composite">;

  return {
    ...metricDeltas,
    composite: rateDelta(previous.composite, current.composite),
  };
}

export function compareGeoBenchmarks(
  previous: GeoAggregateResult,
  current: GeoAggregateResult,
): GeoBenchmarkComparison {
  if (previous.versions === null || current.versions === null) {
    return {
      status: "not_comparable",
      delta: null,
      mismatchedVersions: [],
    };
  }

  const mismatchedVersions = mismatchedVersionKeys(
    previous.versions,
    current.versions,
  );
  if (mismatchedVersions.length > 0) {
    return {
      status: "version_mismatch",
      delta: null,
      mismatchedVersions,
    };
  }

  if (previous.metrics === null || current.metrics === null) {
    return {
      status: "not_comparable",
      delta: null,
      mismatchedVersions: [],
    };
  }

  return {
    status: "comparable",
    delta: scorecardDelta(previous.metrics, current.metrics),
    mismatchedVersions: [],
  };
}
