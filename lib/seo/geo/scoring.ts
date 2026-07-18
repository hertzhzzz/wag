import { compareUnicodeCodePoints } from "./canonical";
import {
  GEO_METRIC_NAMES,
  GEO_OBSERVATION_STATUSES,
  GEO_PLATFORMS,
  type GeoMetricName,
  type GeoMetricResult,
  type GeoObservation,
  type GeoPlatform,
  type GeoPlatformCounts,
  type GeoScorecard,
  type GeoStatusCounts,
  type GeoTally,
  type GeoVersionCounts,
} from "./types";

interface MetricDecision {
  eligible: boolean;
  success: boolean;
}

type MetricEvaluator = (observation: GeoObservation) => MetricDecision;

function emptyTally(): GeoTally {
  return { numerator: 0, denominator: 0 };
}

function emptyPlatformCounts(): GeoPlatformCounts {
  return Object.fromEntries(
    GEO_PLATFORMS.map((platform) => [platform, emptyTally()]),
  ) as GeoPlatformCounts;
}

function emptyStatusCounts(): GeoStatusCounts {
  return Object.fromEntries(
    GEO_OBSERVATION_STATUSES.map((status) => [status, 0]),
  ) as GeoStatusCounts;
}

function emptyVersionCounts(): GeoVersionCounts {
  return {
    schema: {},
    methodology: {},
    benchmark: {},
    questionSet: {},
    prompt: {},
  };
}

function incrementVersion(
  counts: Record<string, GeoTally>,
  version: string,
  success: boolean,
): void {
  const tally = counts[version] ?? emptyTally();
  tally.denominator += 1;
  if (success) {
    tally.numerator += 1;
  }
  counts[version] = tally;
}

function sortedTallies(
  tallies: Record<string, GeoTally>,
): Record<string, GeoTally> {
  return Object.fromEntries(
    Object.entries(tallies).sort(([left], [right]) =>
      compareUnicodeCodePoints(left, right),
    ),
  );
}

function scoreMetric(
  observations: readonly GeoObservation[],
  evaluate: MetricEvaluator,
): GeoMetricResult {
  let numerator = 0;
  let denominator = 0;
  const eligibleDates: string[] = [];
  const denominatorObservationIds: string[] = [];
  const numeratorObservationIds: string[] = [];
  const excludedObservationIds: string[] = [];
  const runIds = new Set<string>();
  const evidencePaths = new Set<string>();
  const platformCounts = emptyPlatformCounts();
  const versionCounts = emptyVersionCounts();
  const statusCounts = emptyStatusCounts();

  for (const observation of observations) {
    statusCounts[observation.status] += 1;
    const decision = evaluate(observation);
    if (!decision.eligible) {
      excludedObservationIds.push(observation.observationId);
      continue;
    }

    denominator += 1;
    eligibleDates.push(observation.observedAt);
    denominatorObservationIds.push(observation.observationId);
    runIds.add(observation.runId);
    evidencePaths.add(observation.evidencePath);
    const platformTally = platformCounts[observation.platform];
    platformTally.denominator += 1;
    if (decision.success) {
      numerator += 1;
      numeratorObservationIds.push(observation.observationId);
      platformTally.numerator += 1;
    }

    incrementVersion(
      versionCounts.schema,
      observation.schemaVersion,
      decision.success,
    );
    incrementVersion(
      versionCounts.methodology,
      observation.methodologyVersion,
      decision.success,
    );
    incrementVersion(
      versionCounts.benchmark,
      observation.benchmarkVersion,
      decision.success,
    );
    incrementVersion(
      versionCounts.questionSet,
      observation.questionSetVersion,
      decision.success,
    );
    incrementVersion(
      versionCounts.prompt,
      observation.prompt.version,
      decision.success,
    );
  }

  const sortedDates = eligibleDates.sort((left, right) => {
    const elapsed = Date.parse(left) - Date.parse(right);
    return elapsed === 0 ? compareUnicodeCodePoints(left, right) : elapsed;
  });

  return {
    numerator,
    denominator,
    rate: denominator === 0 ? null : numerator / denominator,
    dateRange:
      sortedDates.length === 0
        ? null
        : {
            from: sortedDates[0],
            to: sortedDates[sortedDates.length - 1],
          },
    platformCounts,
    versionCounts: {
      schema: sortedTallies(versionCounts.schema),
      methodology: sortedTallies(versionCounts.methodology),
      benchmark: sortedTallies(versionCounts.benchmark),
      questionSet: sortedTallies(versionCounts.questionSet),
      prompt: sortedTallies(versionCounts.prompt),
    },
    statusCounts,
    trace: {
      denominatorObservationIds: denominatorObservationIds.sort(
        compareUnicodeCodePoints,
      ),
      numeratorObservationIds: numeratorObservationIds.sort(
        compareUnicodeCodePoints,
      ),
      excludedObservationIds: excludedObservationIds.sort(
        compareUnicodeCodePoints,
      ),
      runIds: [...runIds].sort(compareUnicodeCodePoints),
      evidencePaths: [...evidencePaths].sort(compareUnicodeCodePoints),
    },
  };
}

function isObservedSurface(observation: GeoObservation): boolean {
  return (
    observation.status === "observed-answer" ||
    observation.status === "observed-surface-absent"
  );
}

const evaluators: Record<GeoMetricName, MetricEvaluator> = {
  mention: (observation) => ({
    eligible: isObservedSurface(observation),
    success: observation.brandMention === true,
  }),
  citation: (observation) => ({
    eligible: isObservedSurface(observation),
    success: observation.citations.some(
      (citation) => citation.kind === "owned",
    ),
  }),
  accuracy: (observation) => ({
    eligible:
      observation.status === "observed-answer" &&
      observation.review?.accuracy !== "not-assessable",
    success: observation.review?.accuracy === "pass",
  }),
  completeness: (observation) => ({
    eligible:
      observation.status === "observed-answer" &&
      observation.review?.completeness !== "not-assessable",
    success: observation.review?.completeness === "pass",
  }),
  citationIntegrity: (observation) => ({
    eligible:
      observation.status === "observed-answer" &&
      observation.review?.citationIntegrity !== "not-assessable",
    success: observation.review?.citationIntegrity === "pass",
  }),
  competitorPreference: (observation) => ({
    eligible:
      observation.status === "observed-answer" &&
      observation.review?.competitorPreference !== "not-assessable",
    success:
      observation.review?.competitorPreference === "competitor-preferred",
  }),
};

export function scoreGeoObservations(
  observations: readonly GeoObservation[],
): GeoScorecard {
  const metrics = Object.fromEntries(
    GEO_METRIC_NAMES.map((metric) => [
      metric,
      scoreMetric(observations, evaluators[metric]),
    ]),
  ) as Record<GeoMetricName, GeoMetricResult>;

  const missingCompositeMetrics = GEO_METRIC_NAMES.filter(
    (metric) => metrics[metric].rate === null,
  );
  const composite =
    missingCompositeMetrics.length > 0
      ? null
      : (metrics.mention.rate! +
          metrics.citation.rate! +
          metrics.accuracy.rate! +
          metrics.completeness.rate! +
          metrics.citationIntegrity.rate! +
          (1 - metrics.competitorPreference.rate!)) /
        GEO_METRIC_NAMES.length;

  return {
    mention: metrics.mention,
    citation: metrics.citation,
    accuracy: metrics.accuracy,
    completeness: metrics.completeness,
    citationIntegrity: metrics.citationIntegrity,
    competitorPreference: metrics.competitorPreference,
    composite,
    missingCompositeMetrics,
  };
}

export function platformMetric(
  metric: GeoMetricResult,
  platform: GeoPlatform,
): GeoTally {
  return metric.platformCounts[platform];
}
