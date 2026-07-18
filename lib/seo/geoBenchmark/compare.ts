import { compareUnicodeCodePoints, hashCanonical } from "../geo";
import { assertTrustedGeoBenchmarkPeriodResult } from "./aggregate";
import {
  assertGeoBenchmarkDefinitionIntegrity,
  deepFreezeGeoBenchmark,
} from "./contract";
import {
  GEO_BENCHMARK_METRIC_NAMES,
  type GeoBenchmarkCompatibilityMismatch,
  type GeoBenchmarkDefinition,
  type GeoBenchmarkMetricDelta,
  type GeoBenchmarkPeriodComparison,
  type GeoBenchmarkPeriodResult,
  type GeoBenchmarkTemporalStatus,
} from "./types";

function valuesDiffer(left: unknown, right: unknown): boolean {
  return hashCanonical(left) !== hashCanonical(right);
}

export function geoBenchmarkCompatibilityMismatches(
  baseline: GeoBenchmarkDefinition,
  rerun: GeoBenchmarkDefinition,
): readonly GeoBenchmarkCompatibilityMismatch[] {
  assertGeoBenchmarkDefinitionIntegrity(baseline);
  assertGeoBenchmarkDefinitionIntegrity(rerun);
  const mismatches: GeoBenchmarkCompatibilityMismatch[] = [];
  const add = (
    mismatch: GeoBenchmarkCompatibilityMismatch,
    differs: boolean,
  ): void => {
    if (differs) {
      mismatches.push(mismatch);
    }
  };

  add(
    "versionIdentity",
    valuesDiffer(
      baseline.identity.versionIdentity,
      rerun.identity.versionIdentity,
    ),
  );
  add(
    "benchmarkVersion",
    baseline.identity.benchmarkVersion !== rerun.identity.benchmarkVersion,
  );
  add(
    "benchmarkDigest",
    baseline.identity.benchmarkDigest !== rerun.identity.benchmarkDigest,
  );
  add(
    "questionSetVersion",
    baseline.questionSet.version !== rerun.questionSet.version,
  );
  add(
    "questionSetDigest",
    baseline.questionSet.digest !== rerun.questionSet.digest,
  );
  add(
    "methodologyVersion",
    baseline.methodology.methodologyVersion !==
      rerun.methodology.methodologyVersion,
  );
  add(
    "methodologyDigest",
    baseline.methodology.methodologyDigest !==
      rerun.methodology.methodologyDigest,
  );
  add(
    "observationSchemaVersion",
    baseline.methodology.observationSchemaVersion !==
      rerun.methodology.observationSchemaVersion,
  );
  add(
    "platforms",
    valuesDiffer(baseline.methodology.platforms, rerun.methodology.platforms),
  );
  add("locale", baseline.methodology.locale !== rerun.methodology.locale);
  add(
    "timing",
    valuesDiffer(baseline.methodology.timing, rerun.methodology.timing),
  );
  add(
    "repetitions",
    baseline.methodology.repetitions !== rerun.methodology.repetitions,
  );
  add(
    "scoringVersion",
    baseline.methodology.scoringVersion !== rerun.methodology.scoringVersion,
  );
  add(
    "citationCapture",
    valuesDiffer(
      baseline.methodology.citationCapture,
      rerun.methodology.citationCapture,
    ),
  );
  add(
    "knownVariability",
    valuesDiffer(
      baseline.methodology.knownVariability,
      rerun.methodology.knownVariability,
    ),
  );

  return deepFreezeGeoBenchmark(mismatches.sort(compareUnicodeCodePoints));
}

function stableDelta(
  baseline: number | null,
  rerun: number | null,
): number | null {
  if (baseline === null || rerun === null) {
    return null;
  }
  return Number((rerun - baseline).toFixed(12));
}

const RFC3339_WITH_OFFSET_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

function temporalStatus(
  baseline: GeoBenchmarkPeriodResult["period"],
  rerun: GeoBenchmarkPeriodResult["period"],
): GeoBenchmarkTemporalStatus {
  if (
    !RFC3339_WITH_OFFSET_PATTERN.test(baseline.observedFrom) ||
    !RFC3339_WITH_OFFSET_PATTERN.test(baseline.observedThrough) ||
    !RFC3339_WITH_OFFSET_PATTERN.test(rerun.observedFrom) ||
    !RFC3339_WITH_OFFSET_PATTERN.test(rerun.observedThrough)
  ) {
    return "invalid_period";
  }
  const baselineFrom = Date.parse(baseline.observedFrom);
  const baselineThrough = Date.parse(baseline.observedThrough);
  const rerunFrom = Date.parse(rerun.observedFrom);
  const rerunThrough = Date.parse(rerun.observedThrough);
  if (
    !Number.isFinite(baselineFrom) ||
    !Number.isFinite(baselineThrough) ||
    !Number.isFinite(rerunFrom) ||
    !Number.isFinite(rerunThrough) ||
    baselineFrom > baselineThrough ||
    rerunFrom > rerunThrough
  ) {
    return "invalid_period";
  }
  if (baseline.periodId === rerun.periodId) {
    return baselineFrom === rerunFrom && baselineThrough === rerunThrough
      ? "same_period"
      : "invalid_period";
  }
  if (baselineFrom >= rerunFrom) {
    return "reverse_order";
  }
  if (baselineThrough >= rerunFrom) {
    return "overlap";
  }
  if (baselineThrough >= rerunThrough) {
    return "reverse_order";
  }
  return "ordered";
}

function metricDelta(
  baseline: NonNullable<GeoBenchmarkPeriodResult["metrics"]>,
  rerun: NonNullable<GeoBenchmarkPeriodResult["metrics"]>,
): GeoBenchmarkMetricDelta {
  return deepFreezeGeoBenchmark(
    Object.fromEntries(
      GEO_BENCHMARK_METRIC_NAMES.map((metricName) => [
        metricName,
        stableDelta(baseline[metricName].rate, rerun[metricName].rate),
      ]),
    ) as Record<(typeof GEO_BENCHMARK_METRIC_NAMES)[number], number | null>,
  );
}

export function compareGeoBenchmarkPeriods(
  baseline: GeoBenchmarkPeriodResult,
  rerun: GeoBenchmarkPeriodResult,
): GeoBenchmarkPeriodComparison {
  assertTrustedGeoBenchmarkPeriodResult(baseline);
  assertTrustedGeoBenchmarkPeriodResult(rerun);
  const mismatches = geoBenchmarkCompatibilityMismatches(
    baseline.definition,
    rerun.definition,
  );
  if (mismatches.length > 0) {
    return deepFreezeGeoBenchmark({
      status: "incompatible_methodology" as const,
      temporalStatus: "not_evaluated" as const,
      baselinePeriodId: baseline.period.periodId,
      rerunPeriodId: rerun.period.periodId,
      delta: null,
      mismatches,
      requiresNewVersion: true,
    });
  }

  const periodOrdering = temporalStatus(baseline.period, rerun.period);
  const bothPeriodsReady =
    baseline.status === "ready" &&
    rerun.status === "ready" &&
    baseline.baselineReady &&
    rerun.baselineReady &&
    baseline.publishable &&
    rerun.publishable;

  if (
    !bothPeriodsReady ||
    periodOrdering !== "ordered" ||
    baseline.metrics === null ||
    rerun.metrics === null
  ) {
    return deepFreezeGeoBenchmark({
      status: "not_comparable" as const,
      temporalStatus: periodOrdering,
      baselinePeriodId: baseline.period.periodId,
      rerunPeriodId: rerun.period.periodId,
      delta: null,
      mismatches,
      requiresNewVersion: false,
    });
  }

  return deepFreezeGeoBenchmark({
    status: "comparable" as const,
    temporalStatus: periodOrdering,
    baselinePeriodId: baseline.period.periodId,
    rerunPeriodId: rerun.period.periodId,
    delta: metricDelta(baseline.metrics, rerun.metrics),
    mismatches,
    requiresNewVersion: false,
  });
}
