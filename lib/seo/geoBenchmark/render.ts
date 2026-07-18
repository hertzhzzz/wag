import { compareUnicodeCodePoints } from "../geo";
import { assertTrustedGeoBenchmarkPeriodResult } from "./aggregate";
import { assertGeoBenchmarkDefinitionIntegrity } from "./contract";
import { assertGeoBenchmarkNeutralTextList } from "./policy";
import {
  GEO_BENCHMARK_METRIC_NAMES,
  type GeoBenchmarkDefinition,
  type GeoBenchmarkMetricName,
  type GeoBenchmarkPeriodResult,
} from "./types";

const METRIC_LABELS: Readonly<Record<GeoBenchmarkMetricName, string>> = {
  brandMention: "Brand mention",
  ownedCitation: "Owned citation",
  accuracy: "Accuracy",
  completeness: "Completeness",
  competitorVisibility: "Competitor visibility",
};

function bulletList(values: readonly string[]): string[] {
  return values.map((value) => `- ${value}`);
}

function formatRate(rate: number | null): string {
  return rate === null ? "Not available" : `${(rate * 100).toFixed(1)}%`;
}

export function renderGeoBenchmarkMethodology(
  definition: GeoBenchmarkDefinition,
): string {
  assertGeoBenchmarkDefinitionIntegrity(definition);
  const { identity, methodology, questionSet } = definition;
  const lines = [
    "# 50-Question GEO Benchmark Methodology",
    "",
    "> Methodology scaffold only. No production baseline is asserted until approved questions and real platform observations exist.",
    "",
    "## Identity",
    "",
    `- Benchmark ID: \`${identity.benchmarkId}\``,
    `- Benchmark version: \`${identity.benchmarkVersion}\``,
    `- Benchmark digest: \`${identity.benchmarkDigest}\``,
    `- Methodology version: \`${methodology.methodologyVersion}\``,
    `- Methodology digest: \`${methodology.methodologyDigest}\``,
    `- Scoring version: \`${methodology.scoringVersion}\``,
    `- Observation contract version: \`${methodology.observationSchemaVersion}\``,
    "",
    "## Question-set contract",
    "",
    `- Combined version: \`${questionSet.version}\``,
    `- Digest: \`${questionSet.digest}\``,
    `- Questions: ${questionSet.questionCount}`,
    ...Object.entries(questionSet.clusterCounts)
      .sort(([left], [right]) => compareUnicodeCodePoints(left, right))
      .map(([cluster, count]) => `- ${cluster}: ${count}`),
    "- Source status: draft contracts; human approvals are not implied by this scaffold.",
    "",
    "## Capture protocol",
    "",
    `- Platforms: ${methodology.platforms.join(", ")}`,
    `- Locale: \`${methodology.locale}\``,
    `- As of: \`${methodology.timing.asOf}\``,
    `- Cadence: \`${methodology.timing.cadence}\``,
    `- Timezone: \`${methodology.timing.timezone}\``,
    `- Repetitions per question and platform: ${methodology.repetitions}`,
    `- Citation capture mode: \`${methodology.citationCapture.mode}\``,
    `- Snapshot evidence required: ${methodology.citationCapture.requireSnapshotEvidence ? "yes" : "no"}`,
    `- Owned URL capture: ${methodology.citationCapture.captureOwnedUrls ? "yes" : "no"}`,
    `- Competitor URL capture: ${methodology.citationCapture.captureCompetitorUrls ? "yes" : "no"}`,
    `- Redaction policy version: \`${methodology.citationCapture.redactionPolicyVersion}\``,
    "",
    "## Separate measures",
    "",
    ...GEO_BENCHMARK_METRIC_NAMES.map(
      (metricName) => `- ${METRIC_LABELS[metricName]}`,
    ),
    "",
    "Unavailable, pending, blocked, invalid, or not-assessable values remain null and never become zero. Every calculated value must retain its raw observation and evidence lineage.",
    "",
    "## Known variability",
    "",
    ...bulletList(methodology.knownVariability),
    "",
    "## Interpretation guardrail",
    "",
    "Answer-engine outputs are noisy observations, not deterministic rankings, causal performance claims, or guaranteed future results. Month-to-month comparisons are allowed only when the complete methodology and question-set identity are compatible; incompatible changes require a new explicit version.",
    "",
  ];

  return lines.join("\n");
}

export function renderGeoBenchmarkReport(
  result: GeoBenchmarkPeriodResult,
): string {
  assertTrustedGeoBenchmarkPeriodResult(result);
  assertGeoBenchmarkDefinitionIntegrity(result.definition);
  const safeBlockers = assertGeoBenchmarkNeutralTextList(
    result.blockers,
    "Report blocker",
  );
  const reportMetrics =
    result.status === "ready" && result.baselineReady && result.publishable
      ? result.metrics
      : null;
  const metricLines = GEO_BENCHMARK_METRIC_NAMES.map((metricName) => {
    const summary = reportMetrics?.[metricName];
    const rate = summary === undefined ? null : summary.rate;
    const tally =
      summary === undefined
        ? ""
        : ` (${summary.numerator}/${summary.denominator})`;
    return `| ${METRIC_LABELS[metricName]} | ${formatRate(rate)}${tally} |`;
  });
  const blockerLines =
    safeBlockers.length === 0 ? ["- None"] : bulletList(safeBlockers);
  const lines = [
    `# GEO Benchmark Report: ${result.period.periodId}`,
    "",
    "> Answer-engine outputs are noisy observations, not deterministic rankings, causal performance claims, or guaranteed future results.",
    "",
    "## Audit state",
    "",
    `- Status: \`${result.status}\``,
    `- Data class: \`${result.dataClass}\``,
    `- Visibility: \`${result.visibility}\``,
    `- Baseline ready: ${result.baselineReady ? "yes" : "no"}`,
    `- Publishable: ${result.publishable ? "yes" : "no"}`,
    `- Benchmark ID: \`${result.definition.identity.benchmarkId}\``,
    `- Period: \`${result.period.observedFrom}\` through \`${result.period.observedThrough}\``,
    `- Expected slots: ${result.expectedSlotCount}`,
    `- Recorded slots: ${result.recordedSlotCount}`,
    `- Recorded but unresolved slots: ${result.recordedUnresolvedSlotCount}`,
    `- Missing slots: ${result.missingSlotCount}`,
    `- Pending slots: ${result.pendingSlotCount}`,
    `- Raw observation lineage records: ${result.lineage.length}`,
    "",
    "## Metrics",
    "",
    "| Measure | Result |",
    "| --- | ---: |",
    ...metricLines,
    "",
    "## Blockers",
    "",
    ...blockerLines,
    "",
    "No missing, unavailable, pending, or blocked observation is represented as a zero. Prior period evidence remains immutable and is compared rather than overwritten.",
    "",
  ];

  return lines.join("\n");
}
