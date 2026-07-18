import { CANONICAL_CLUSTER_IDS, type ClusterId } from "../clusterSchema";

export const DATA_AVAILABILITY_STATUSES = Object.freeze([
  "available",
  "missing",
  "delayed",
  "partial",
  "blocked_privacy_approval",
] as const);

export const DASHBOARD_OPERATIONAL_SIGNALS = Object.freeze([
  "indexation",
  "graph",
  "evidence",
  "review",
  "validation",
] as const);

export type DataAvailabilityStatus =
  (typeof DATA_AVAILABILITY_STATUSES)[number];
export type DashboardOperationalSignal =
  (typeof DASHBOARD_OPERATIONAL_SIGNALS)[number];

export interface DashboardDateRange {
  readonly start: string;
  readonly end: string;
}

export interface SourceLineageEntry {
  readonly system: string;
  readonly dataset: string;
  readonly version: string;
  readonly asOfDate: string;
}

interface MetricInputBase {
  readonly id: string;
  readonly label: string;
  readonly status: DataAvailabilityStatus;
  readonly definition: string;
  readonly dateRange: DashboardDateRange;
  readonly comparisonPeriod: DashboardDateRange;
  readonly sourceLineage: readonly SourceLineageEntry[];
}

export interface RateMetricInput extends MetricInputBase {
  readonly numerator: number | null;
  readonly denominator: number | null;
}

export interface CountMetricInput extends MetricInputBase {
  readonly value: number | null;
}

export interface ClusterDashboardInput {
  cluster: ClusterId;
  qualifiedOrganicTouches: CountMetricInput;
  successfulEnquiryRate: RateMetricInput;
  assistedEnquiries: CountMetricInput;
}

export interface GeoClusterInput {
  cluster: ClusterId;
  brandMentionRate: RateMetricInput;
  ownedCitationRate: RateMetricInput;
  accuracyRate: RateMetricInput;
  completenessRate: RateMetricInput;
  competitorObservations: CountMetricInput;
}

export type OperationalSignalsInput = Record<
  DashboardOperationalSignal,
  RateMetricInput
>;

export interface SeoGrowthDashboardInput {
  version: 1;
  generatedAt: string;
  searchRates: RateMetricInput[];
  clusters: ClusterDashboardInput[];
  geo: GeoClusterInput[];
  operationalSignals: OperationalSignalsInput;
}

interface DashboardMetricBase {
  readonly id: string;
  readonly label: string;
  readonly status: DataAvailabilityStatus;
  readonly definition: string;
  readonly dateRange: DashboardDateRange;
  readonly comparisonPeriod: DashboardDateRange;
  readonly sourceLineage: readonly SourceLineageEntry[];
}

export interface DashboardRateMetric extends DashboardMetricBase {
  readonly numerator: number | null;
  readonly denominator: number | null;
  readonly rate: number | null;
}

export interface DashboardCountMetric extends DashboardMetricBase {
  readonly value: number | null;
}

export type DashboardMetric = DashboardRateMetric | DashboardCountMetric;

export interface ClusterDashboardRow {
  readonly cluster: ClusterId;
  readonly qualifiedOrganicTouches: DashboardCountMetric;
  readonly successfulEnquiryRate: DashboardRateMetric;
  readonly assistedEnquiries: DashboardCountMetric;
}

export interface GeoClusterRow {
  readonly cluster: ClusterId;
  readonly brandMentionRate: DashboardRateMetric;
  readonly ownedCitationRate: DashboardRateMetric;
  readonly accuracyRate: DashboardRateMetric;
  readonly completenessRate: DashboardRateMetric;
  readonly competitorObservations: DashboardCountMetric;
}

export type OperationalSignals = Readonly<
  Record<DashboardOperationalSignal, DashboardRateMetric>
>;

export interface SeoGrowthDashboard {
  readonly version: 1;
  readonly generatedAt: string;
  readonly searchRates: readonly DashboardRateMetric[];
  readonly clusters: readonly ClusterDashboardRow[];
  readonly geo: readonly GeoClusterRow[];
  readonly operationalSignals: OperationalSignals;
  readonly metricCatalog: ReadonlyMap<string, DashboardMetric>;
}

const METRIC_ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_INSTANT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const UNAVAILABLE_STATUSES = new Set<DataAvailabilityStatus>([
  "missing",
  "delayed",
  "blocked_privacy_approval",
]);

function compareCodePoints(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function assertRecord(
  value: unknown,
  field: string,
): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${field} must be an object.`);
  }
}

function assertNonEmptyString(
  value: unknown,
  field: string,
): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string.`);
  }
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  const days = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return days[month - 1] ?? 0;
}

function assertIsoDate(value: unknown, field: string): asserts value is string {
  assertNonEmptyString(value, field);
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error(`${field} must use YYYY-MM-DD.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new Error(`${field} must be a valid calendar date.`);
  }
}

function normalizeDateRange(value: unknown, field: string): DashboardDateRange {
  assertRecord(value, field);
  assertIsoDate(value.start, `${field}.start`);
  assertIsoDate(value.end, `${field}.end`);
  if (value.start > value.end) {
    throw new Error(`${field}.start must not be after ${field}.end.`);
  }

  return {
    start: value.start,
    end: value.end,
  };
}

function normalizeLineage(
  value: unknown,
  field: string,
): readonly SourceLineageEntry[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} sourceLineage must contain at least one source.`);
  }

  return value.map((entry, index) => {
    const entryField = `${field}.sourceLineage[${index}]`;
    assertRecord(entry, entryField);
    assertNonEmptyString(entry.system, `${entryField}.system`);
    assertNonEmptyString(entry.dataset, `${entryField}.dataset`);
    assertNonEmptyString(entry.version, `${entryField}.version`);
    assertIsoDate(entry.asOfDate, `${entryField}.asOfDate`);

    return {
      system: entry.system,
      dataset: entry.dataset,
      version: entry.version,
      asOfDate: entry.asOfDate,
    };
  });
}

function normalizeMetricBase(
  input: MetricInputBase,
  field: string,
): DashboardMetricBase {
  assertRecord(input, field);
  assertNonEmptyString(input.id, `${field}.id`);
  if (!METRIC_ID_PATTERN.test(input.id)) {
    throw new Error(
      `${field}.id must be a lowercase machine-readable ID using dots or hyphens.`,
    );
  }
  assertNonEmptyString(input.label, `${field}.label`);
  assertNonEmptyString(input.definition, `${field}.definition`);
  if (!DATA_AVAILABILITY_STATUSES.includes(input.status)) {
    throw new Error(`${field}.status is not a supported availability status.`);
  }

  if (input.comparisonPeriod === null || input.comparisonPeriod === undefined) {
    throw new Error(`${field}.comparisonPeriod is required.`);
  }

  return {
    id: input.id,
    label: input.label,
    status: input.status,
    definition: input.definition,
    dateRange: normalizeDateRange(input.dateRange, `${field}.dateRange`),
    comparisonPeriod: normalizeDateRange(
      input.comparisonPeriod,
      `${field}.comparisonPeriod`,
    ),
    sourceLineage: normalizeLineage(input.sourceLineage, field),
  };
}

function assertNonNegativeInteger(
  value: unknown,
  field: string,
): asserts value is number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }
}

function normalizeRateMetric(
  input: RateMetricInput,
  field: string,
): DashboardRateMetric {
  const base = normalizeMetricBase(input, field);
  const { numerator, denominator, status } = input;

  if (UNAVAILABLE_STATUSES.has(status)) {
    if (numerator !== null || denominator !== null) {
      throw new Error(
        `${field} with status ${status} must keep numerator and denominator null; unavailable data must never be substituted with zero.`,
      );
    }

    return { ...base, numerator: null, denominator: null, rate: null };
  }

  if (status === "partial" && numerator === null && denominator === null) {
    return { ...base, numerator: null, denominator: null, rate: null };
  }

  if (numerator === null || denominator === null) {
    throw new Error(
      `${field} numerator and denominator must either both be present or both be null for partial data.`,
    );
  }

  assertNonNegativeInteger(numerator, `${field}.numerator`);
  assertNonNegativeInteger(denominator, `${field}.denominator`);
  if (denominator === 0) {
    throw new Error(`${field}.denominator must be greater than zero.`);
  }
  if (numerator > denominator) {
    throw new Error(`${field}.numerator must not exceed denominator.`);
  }

  return {
    ...base,
    numerator,
    denominator,
    rate: numerator / denominator,
  };
}

function normalizeCountMetric(
  input: CountMetricInput,
  field: string,
): DashboardCountMetric {
  const base = normalizeMetricBase(input, field);
  const { status, value } = input;

  if (UNAVAILABLE_STATUSES.has(status)) {
    if (value !== null) {
      throw new Error(
        `${field} with status ${status} must keep value null; unavailable data must never be substituted with zero.`,
      );
    }
    return { ...base, value: null };
  }

  if (status === "partial" && value === null) {
    return { ...base, value: null };
  }

  if (value === null) {
    throw new Error(`${field}.value is required when status is available.`);
  }
  assertNonNegativeInteger(value, `${field}.value`);
  return { ...base, value };
}

function assertCanonicalRows<T extends { readonly cluster: ClusterId }>(
  rows: readonly T[],
  field: string,
): ReadonlyMap<ClusterId, T> {
  if (!Array.isArray(rows)) {
    throw new Error(
      `${field} must contain exactly the five canonical clusters.`,
    );
  }

  const byCluster = new Map<ClusterId, T>();
  for (const row of rows) {
    if (
      !row ||
      !CANONICAL_CLUSTER_IDS.includes(row.cluster) ||
      byCluster.has(row.cluster)
    ) {
      throw new Error(
        `${field} must contain exactly the five canonical clusters.`,
      );
    }
    byCluster.set(row.cluster, row);
  }

  if (
    rows.length !== CANONICAL_CLUSTER_IDS.length ||
    CANONICAL_CLUSTER_IDS.some((cluster) => !byCluster.has(cluster))
  ) {
    throw new Error(
      `${field} must contain exactly the five canonical clusters.`,
    );
  }

  return byCluster;
}

function assertOperationalSignals(
  value: OperationalSignalsInput,
): asserts value is OperationalSignalsInput {
  assertRecord(value, "operationalSignals");
  const actualKeys = Object.keys(value).sort(compareCodePoints);
  const expectedKeys = [...DASHBOARD_OPERATIONAL_SIGNALS].sort(
    compareCodePoints,
  );
  if (
    actualKeys.length !== expectedKeys.length ||
    actualKeys.some((key, index) => key !== expectedKeys[index])
  ) {
    throw new Error(
      `operationalSignals must contain exactly: ${DASHBOARD_OPERATIONAL_SIGNALS.join(", ")}.`,
    );
  }
}

function deepFreeze<T>(value: T): T {
  if (
    value === null ||
    (typeof value !== "object" && typeof value !== "function") ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  if (value instanceof Map) {
    for (const [key, nestedValue] of value.entries()) {
      deepFreeze(key);
      deepFreeze(nestedValue);
    }
  } else {
    for (const key of Reflect.ownKeys(value)) {
      deepFreeze((value as Record<PropertyKey, unknown>)[key]);
    }
  }

  return Object.freeze(value);
}

function addMetric(
  metrics: Map<string, DashboardMetric>,
  metric: DashboardMetric,
): void {
  if (metrics.has(metric.id)) {
    throw new Error(`Duplicate dashboard metric id: ${metric.id}.`);
  }
  metrics.set(metric.id, metric);
}

export function buildSeoGrowthDashboard(
  input: SeoGrowthDashboardInput,
): SeoGrowthDashboard {
  assertRecord(input, "dashboard");
  if (input.version !== 1) {
    throw new Error("dashboard.version must be 1.");
  }
  assertNonEmptyString(input.generatedAt, "dashboard.generatedAt");
  if (
    !ISO_INSTANT_PATTERN.test(input.generatedAt) ||
    !Number.isFinite(Date.parse(input.generatedAt))
  ) {
    throw new Error(
      "dashboard.generatedAt must be an explicit UTC ISO instant.",
    );
  }
  if (!Array.isArray(input.searchRates)) {
    throw new Error("dashboard.searchRates must be an array.");
  }

  const metricCatalog = new Map<string, DashboardMetric>();
  const searchRates = input.searchRates
    .map((metric, index) =>
      normalizeRateMetric(metric, `searchRates[${index}]`),
    )
    .sort((left, right) => compareCodePoints(left.id, right.id));
  searchRates.forEach((metric) => addMetric(metricCatalog, metric));

  const clusterInputs = assertCanonicalRows(input.clusters, "clusters");
  const clusters = CANONICAL_CLUSTER_IDS.map((cluster) => {
    const row = clusterInputs.get(cluster);
    if (!row) {
      throw new Error(
        "clusters must contain exactly the five canonical clusters.",
      );
    }

    const normalized: ClusterDashboardRow = {
      cluster,
      qualifiedOrganicTouches: normalizeCountMetric(
        row.qualifiedOrganicTouches,
        `clusters.${cluster}.qualifiedOrganicTouches`,
      ),
      successfulEnquiryRate: normalizeRateMetric(
        row.successfulEnquiryRate,
        `clusters.${cluster}.successfulEnquiryRate`,
      ),
      assistedEnquiries: normalizeCountMetric(
        row.assistedEnquiries,
        `clusters.${cluster}.assistedEnquiries`,
      ),
    };
    addMetric(metricCatalog, normalized.qualifiedOrganicTouches);
    addMetric(metricCatalog, normalized.successfulEnquiryRate);
    addMetric(metricCatalog, normalized.assistedEnquiries);
    return normalized;
  });

  const geoInputs = assertCanonicalRows(input.geo, "geo");
  const geo = CANONICAL_CLUSTER_IDS.map((cluster) => {
    const row = geoInputs.get(cluster);
    if (!row) {
      throw new Error("geo must contain exactly the five canonical clusters.");
    }

    const normalized: GeoClusterRow = {
      cluster,
      brandMentionRate: normalizeRateMetric(
        row.brandMentionRate,
        `geo.${cluster}.brandMentionRate`,
      ),
      ownedCitationRate: normalizeRateMetric(
        row.ownedCitationRate,
        `geo.${cluster}.ownedCitationRate`,
      ),
      accuracyRate: normalizeRateMetric(
        row.accuracyRate,
        `geo.${cluster}.accuracyRate`,
      ),
      completenessRate: normalizeRateMetric(
        row.completenessRate,
        `geo.${cluster}.completenessRate`,
      ),
      competitorObservations: normalizeCountMetric(
        row.competitorObservations,
        `geo.${cluster}.competitorObservations`,
      ),
    };
    addMetric(metricCatalog, normalized.brandMentionRate);
    addMetric(metricCatalog, normalized.ownedCitationRate);
    addMetric(metricCatalog, normalized.accuracyRate);
    addMetric(metricCatalog, normalized.completenessRate);
    addMetric(metricCatalog, normalized.competitorObservations);
    return normalized;
  });

  assertOperationalSignals(input.operationalSignals);
  const operationalSignals = Object.fromEntries(
    DASHBOARD_OPERATIONAL_SIGNALS.map((signal) => {
      const metric = normalizeRateMetric(
        input.operationalSignals[signal],
        `operationalSignals.${signal}`,
      );
      addMetric(metricCatalog, metric);
      return [signal, metric];
    }),
  ) as OperationalSignals;

  const sortedCatalog = new Map(
    [...metricCatalog.entries()].sort(([left], [right]) =>
      compareCodePoints(left, right),
    ),
  );

  return deepFreeze({
    version: 1,
    generatedAt: input.generatedAt,
    searchRates,
    clusters,
    geo,
    operationalSignals,
    metricCatalog: sortedCatalog,
  });
}
