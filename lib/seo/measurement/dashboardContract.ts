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

export const DASHBOARD_DATA_MODES = Object.freeze([
  "actual",
  "synthetic_fixture",
  "dry_run",
] as const);

export type DataAvailabilityStatus =
  (typeof DATA_AVAILABILITY_STATUSES)[number];
export type DashboardOperationalSignal =
  (typeof DASHBOARD_OPERATIONAL_SIGNALS)[number];
export type DashboardDataMode = (typeof DASHBOARD_DATA_MODES)[number];
export type MetricCardinality = "portfolio" | "per_cluster" | "per_signal";
export type MetricSignalType = "early_operational" | "lagging_outcome";

export interface DashboardProvenanceInput {
  readonly source: string;
  readonly capturedAt: string;
  readonly fixtureId: string | null;
}

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
  readonly cluster: ClusterId;
  readonly qualifiedOrganicTouches: CountMetricInput;
  readonly successfulEnquiryRate: RateMetricInput;
  readonly assistedEnquiries: CountMetricInput;
}

export interface GeoClusterInput {
  readonly cluster: ClusterId;
  readonly brandMentionRate: RateMetricInput;
  readonly ownedCitationRate: RateMetricInput;
  readonly accuracyRate: RateMetricInput;
  readonly completenessRate: RateMetricInput;
  readonly competitorObservations: CountMetricInput;
}

export type OperationalSignalsInput = Record<
  DashboardOperationalSignal,
  RateMetricInput
>;

export interface SeoGrowthDashboardInput {
  readonly version: 1;
  readonly generatedAt: string;
  readonly dataMode: DashboardDataMode;
  readonly provenance: DashboardProvenanceInput;
  readonly searchRates: readonly RateMetricInput[];
  readonly clusters: readonly ClusterDashboardInput[];
  readonly geo: readonly GeoClusterInput[];
  readonly operationalSignals: OperationalSignalsInput;
}

export interface DashboardContractOptions {
  readonly observationCutoff: string;
}

/**
 * Stable review boundary for actual observations. This is intentionally an
 * explicit, non-ambient default so validation remains deterministic and
 * callers can supply a controlled cutoff when the contract advances.
 */
export const DEFAULT_OBSERVATION_CUTOFF = "2026-07-18T23:59:59.999Z";

export interface CanonicalMetricDefinition {
  readonly registryKey: string;
  readonly cardinality: MetricCardinality;
  readonly signalType: MetricSignalType;
}

export const CANONICAL_METRIC_REGISTRY = Object.freeze({
  searchRate: Object.freeze({
    registryKey: "search.rate",
    cardinality: "portfolio",
    signalType: "lagging_outcome",
  }),
  clusterQualifiedOrganicTouches: Object.freeze({
    registryKey: "cluster.qualified-organic-touches",
    cardinality: "per_cluster",
    signalType: "lagging_outcome",
  }),
  clusterSuccessfulEnquiryRate: Object.freeze({
    registryKey: "cluster.successful-enquiry-rate",
    cardinality: "per_cluster",
    signalType: "lagging_outcome",
  }),
  clusterAssistedEnquiries: Object.freeze({
    registryKey: "cluster.assisted-enquiries",
    cardinality: "per_cluster",
    signalType: "lagging_outcome",
  }),
  geoBrandMentionRate: Object.freeze({
    registryKey: "geo.brand-mention-rate",
    cardinality: "per_cluster",
    signalType: "early_operational",
  }),
  geoOwnedCitationRate: Object.freeze({
    registryKey: "geo.owned-citation-rate",
    cardinality: "per_cluster",
    signalType: "early_operational",
  }),
  geoAccuracyRate: Object.freeze({
    registryKey: "geo.accuracy-rate",
    cardinality: "per_cluster",
    signalType: "early_operational",
  }),
  geoCompletenessRate: Object.freeze({
    registryKey: "geo.completeness-rate",
    cardinality: "per_cluster",
    signalType: "early_operational",
  }),
  geoCompetitorObservations: Object.freeze({
    registryKey: "geo.competitor-observations",
    cardinality: "per_cluster",
    signalType: "early_operational",
  }),
  operationalIndexation: Object.freeze({
    registryKey: "operational.indexation",
    cardinality: "per_signal",
    signalType: "early_operational",
  }),
  operationalGraph: Object.freeze({
    registryKey: "operational.graph",
    cardinality: "per_signal",
    signalType: "early_operational",
  }),
  operationalEvidence: Object.freeze({
    registryKey: "operational.evidence",
    cardinality: "per_signal",
    signalType: "early_operational",
  }),
  operationalReview: Object.freeze({
    registryKey: "operational.review",
    cardinality: "per_signal",
    signalType: "early_operational",
  }),
  operationalValidation: Object.freeze({
    registryKey: "operational.validation",
    cardinality: "per_signal",
    signalType: "early_operational",
  }),
} satisfies Record<string, CanonicalMetricDefinition>);

interface DashboardMetricBase extends CanonicalMetricDefinition {
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

export interface ImmutableMetricCatalog extends Iterable<
  readonly [string, DashboardMetric]
> {
  readonly size: number;
  get(id: string): DashboardMetric | undefined;
  has(id: string): boolean;
  entries(): IterableIterator<readonly [string, DashboardMetric]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<DashboardMetric>;
}

export interface SeoGrowthDashboard {
  readonly version: 1;
  readonly generatedAt: string;
  readonly dataMode: DashboardDataMode;
  readonly provenance: DashboardProvenanceInput;
  readonly searchRates: readonly DashboardRateMetric[];
  readonly clusters: readonly ClusterDashboardRow[];
  readonly geo: readonly GeoClusterRow[];
  readonly operationalSignals: OperationalSignals;
  readonly metricCatalog: ImmutableMetricCatalog;
}

const METRIC_ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const UTC_INSTANT_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?Z$/;
const FIXTURE_IDENTITY_PATTERN = /(?:synthetic|fixture|dry[-_ ]?run)/i;
const UNAVAILABLE_STATUSES = new Set<DataAvailabilityStatus>([
  "missing",
  "delayed",
  "blocked_privacy_approval",
]);

interface NormalizedObservationCutoff {
  readonly instant: string;
  readonly utcDate: string;
}

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
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error(`${field} must be a plain object.`);
  }
}

function assertExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
  field: string,
): void {
  const actual = Reflect.ownKeys(value).sort((left, right) =>
    compareCodePoints(String(left), String(right)),
  );
  const wanted = [...expected].sort(compareCodePoints);
  if (
    actual.length !== wanted.length ||
    actual.some(
      (key, index) => typeof key !== "string" || key !== wanted[index],
    )
  ) {
    throw new Error(`${field} must contain exactly: ${expected.join(", ")}.`);
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
  return (
    [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][
      month - 1
    ] ?? 0
  );
}

function assertIsoDate(value: unknown, field: string): asserts value is string {
  assertNonEmptyString(value, field);
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) throw new Error(`${field} must use YYYY-MM-DD.`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new Error(`${field} must be a valid calendar date.`);
  }
}

function assertUtcInstant(
  value: unknown,
  field: string,
): asserts value is string {
  assertNonEmptyString(value, field);
  const match = UTC_INSTANT_PATTERN.exec(value);
  if (!match) {
    throw new Error(
      `${field} must be a strict RFC3339 UTC timestamp ending in Z.`,
    );
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    throw new Error(`${field} must be a valid RFC3339 UTC timestamp.`);
  }
}

function normalizeUtcInstant(value: string): string {
  return value.endsWith("Z") && value.length === 20
    ? value.slice(0, -1) + ".000Z"
    : value;
}

function previousIsoDate(value: string): string {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) throw new Error("Observation cutoff date must use YYYY-MM-DD.");
  let year = Number(match[1]);
  let month = Number(match[2]);
  let day = Number(match[3]) - 1;
  if (day === 0) {
    month -= 1;
    if (month === 0) {
      if (year === 0) {
        throw new Error(
          "dashboard options.observationCutoff must include at least one complete UTC date.",
        );
      }
      year -= 1;
      month = 12;
    }
    day = daysInMonth(year, month);
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeObservationCutoff(
  options: DashboardContractOptions,
): NormalizedObservationCutoff {
  assertRecord(options, "dashboard options");
  assertExactKeys(options, ["observationCutoff"], "dashboard options");
  assertUtcInstant(
    options.observationCutoff,
    "dashboard options.observationCutoff",
  );
  const instant = normalizeUtcInstant(options.observationCutoff);
  if (instant > DEFAULT_OBSERVATION_CUTOFF) {
    throw new Error(
      "dashboard options.observationCutoff must not be after the default observation cutoff.",
    );
  }
  const instantDate = instant.slice(0, 10);
  const utcDate = instant.endsWith("T23:59:59.999Z")
    ? instantDate
    : previousIsoDate(instantDate);
  return { instant, utcDate };
}

function assertNotAfterObservationCutoff(
  value: string,
  field: string,
  cutoff: NormalizedObservationCutoff,
  granularity: "instant" | "date",
): void {
  const normalizedValue =
    granularity === "instant" ? normalizeUtcInstant(value) : value;
  const boundary = granularity === "instant" ? cutoff.instant : cutoff.utcDate;
  if (normalizedValue > boundary) {
    throw new Error(`${field} must not be after observation cutoff.`);
  }
}

function normalizeDateRange(value: unknown, field: string): DashboardDateRange {
  assertRecord(value, field);
  assertExactKeys(value, ["start", "end"], field);
  assertIsoDate(value.start, `${field}.start`);
  assertIsoDate(value.end, `${field}.end`);
  if (value.start > value.end) {
    throw new Error(`${field}.start must not be after ${field}.end.`);
  }
  return { start: value.start, end: value.end };
}

function normalizeLineage(
  value: unknown,
  field: string,
  dataMode: DashboardDataMode,
  observationCutoff: NormalizedObservationCutoff,
): readonly SourceLineageEntry[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} sourceLineage must contain at least one source.`);
  }
  return value.map((entry, index) => {
    const entryField = `${field}.sourceLineage[${index}]`;
    assertRecord(entry, entryField);
    assertExactKeys(
      entry,
      ["system", "dataset", "version", "asOfDate"],
      entryField,
    );
    assertNonEmptyString(entry.system, `${entryField}.system`);
    assertNonEmptyString(entry.dataset, `${entryField}.dataset`);
    assertNonEmptyString(entry.version, `${entryField}.version`);
    assertIsoDate(entry.asOfDate, `${entryField}.asOfDate`);
    const system = entry.system.trim();
    const dataset = entry.dataset.trim();
    const version = entry.version.trim();
    if (dataMode === "actual") {
      assertNotAfterObservationCutoff(
        entry.asOfDate,
        `${entryField}.asOfDate`,
        observationCutoff,
        "date",
      );
      for (const [identityField, identity] of [
        ["system", system],
        ["dataset", dataset],
        ["version", version],
      ] as const) {
        if (FIXTURE_IDENTITY_PATTERN.test(identity)) {
          throw new Error(
            `${entryField}.${identityField} cannot identify synthetic, fixture, or dry-run data in actual mode.`,
          );
        }
      }
    }
    return {
      system,
      dataset,
      version,
      asOfDate: entry.asOfDate,
    };
  });
}

function normalizeProvenance(
  value: unknown,
  dataMode: DashboardDataMode,
  observationCutoff: NormalizedObservationCutoff,
): DashboardProvenanceInput {
  assertRecord(value, "dashboard.provenance");
  assertExactKeys(
    value,
    ["source", "capturedAt", "fixtureId"],
    "dashboard.provenance",
  );
  assertNonEmptyString(value.source, "dashboard.provenance.source");
  assertUtcInstant(value.capturedAt, "dashboard.provenance.capturedAt");
  const source = value.source.trim();
  if (dataMode === "actual") {
    assertNotAfterObservationCutoff(
      value.capturedAt,
      "dashboard.provenance.capturedAt",
      observationCutoff,
      "instant",
    );
    if (FIXTURE_IDENTITY_PATTERN.test(source)) {
      throw new Error(
        "dashboard.provenance.source cannot identify synthetic, fixture, or dry-run data in actual mode.",
      );
    }
  }
  if (value.fixtureId !== null) {
    assertNonEmptyString(value.fixtureId, "dashboard.provenance.fixtureId");
  }
  if (
    (dataMode === "synthetic_fixture" || dataMode === "dry_run") &&
    value.fixtureId === null
  ) {
    throw new Error(
      `dashboard.provenance.fixtureId is required for ${dataMode} mode.`,
    );
  }
  if (dataMode === "actual" && value.fixtureId !== null) {
    throw new Error(
      "dashboard.provenance.fixtureId must be null in actual mode.",
    );
  }
  return {
    source,
    capturedAt: value.capturedAt,
    fixtureId: value.fixtureId,
  };
}

function normalizeMetricBase(
  input: unknown,
  field: string,
  expectedKeys: readonly string[],
  semantic: CanonicalMetricDefinition,
  dataMode: DashboardDataMode,
  observationCutoff: NormalizedObservationCutoff,
): DashboardMetricBase {
  assertRecord(input, field);
  assertExactKeys(input, expectedKeys, field);
  assertNonEmptyString(input.id, `${field}.id`);
  if (!METRIC_ID_PATTERN.test(input.id)) {
    throw new Error(
      `${field}.id must be a lowercase machine-readable ID using dots or hyphens.`,
    );
  }
  assertNonEmptyString(input.label, `${field}.label`);
  assertNonEmptyString(input.definition, `${field}.definition`);
  if (
    !DATA_AVAILABILITY_STATUSES.includes(input.status as DataAvailabilityStatus)
  ) {
    throw new Error(`${field}.status is not a supported availability status.`);
  }
  if (input.comparisonPeriod === null || input.comparisonPeriod === undefined) {
    throw new Error(`${field}.comparisonPeriod is required.`);
  }
  const dateRange = normalizeDateRange(input.dateRange, `${field}.dateRange`);
  const comparisonPeriod = normalizeDateRange(
    input.comparisonPeriod,
    `${field}.comparisonPeriod`,
  );
  if (dataMode === "actual") {
    assertNotAfterObservationCutoff(
      dateRange.end,
      `${field}.dateRange.end`,
      observationCutoff,
      "date",
    );
    assertNotAfterObservationCutoff(
      comparisonPeriod.end,
      `${field}.comparisonPeriod.end`,
      observationCutoff,
      "date",
    );
  }
  return {
    id: input.id,
    label: input.label.trim(),
    status: input.status as DataAvailabilityStatus,
    definition: input.definition.trim(),
    dateRange,
    comparisonPeriod,
    sourceLineage: normalizeLineage(
      input.sourceLineage,
      field,
      dataMode,
      observationCutoff,
    ),
    ...semantic,
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
  input: unknown,
  field: string,
  semantic: CanonicalMetricDefinition,
  dataMode: DashboardDataMode,
  observationCutoff: NormalizedObservationCutoff,
): DashboardRateMetric {
  const base = normalizeMetricBase(
    input,
    field,
    [
      "id",
      "label",
      "status",
      "definition",
      "dateRange",
      "comparisonPeriod",
      "sourceLineage",
      "numerator",
      "denominator",
    ],
    semantic,
    dataMode,
    observationCutoff,
  );
  const record = input as Record<string, unknown>;
  const status = record.status as DataAvailabilityStatus;
  const numerator = record.numerator;
  const denominator = record.denominator;

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
  if (denominator === 0)
    throw new Error(`${field}.denominator must be greater than zero.`);
  if (numerator > denominator)
    throw new Error(`${field}.numerator must not exceed denominator.`);
  return { ...base, numerator, denominator, rate: numerator / denominator };
}

function normalizeCountMetric(
  input: unknown,
  field: string,
  semantic: CanonicalMetricDefinition,
  dataMode: DashboardDataMode,
  observationCutoff: NormalizedObservationCutoff,
): DashboardCountMetric {
  const base = normalizeMetricBase(
    input,
    field,
    [
      "id",
      "label",
      "status",
      "definition",
      "dateRange",
      "comparisonPeriod",
      "sourceLineage",
      "value",
    ],
    semantic,
    dataMode,
    observationCutoff,
  );
  const record = input as Record<string, unknown>;
  const status = record.status as DataAvailabilityStatus;
  const value = record.value;
  if (UNAVAILABLE_STATUSES.has(status)) {
    if (value !== null) {
      throw new Error(
        `${field} with status ${status} must keep value null; unavailable data must never be substituted with zero.`,
      );
    }
    return { ...base, value: null };
  }
  if (status === "partial" && value === null) return { ...base, value: null };
  if (value === null)
    throw new Error(`${field}.value is required when status is available.`);
  assertNonNegativeInteger(value, `${field}.value`);
  return { ...base, value };
}

function canonicalRows<T extends Record<string, unknown>>(
  rows: unknown,
  field: string,
  rowKeys: readonly string[],
): ReadonlyMap<ClusterId, T> {
  if (!Array.isArray(rows)) {
    throw new Error(
      `${field} must contain exactly the five canonical clusters.`,
    );
  }
  const byCluster = new Map<ClusterId, T>();
  for (const rawRow of rows) {
    assertRecord(rawRow, `${field} row`);
    assertExactKeys(rawRow, rowKeys, `${field} row`);
    const cluster = rawRow.cluster;
    if (
      typeof cluster !== "string" ||
      !CANONICAL_CLUSTER_IDS.includes(cluster as ClusterId) ||
      byCluster.has(cluster as ClusterId)
    ) {
      throw new Error(
        `${field} must contain exactly the five canonical clusters.`,
      );
    }
    byCluster.set(cluster as ClusterId, rawRow as T);
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

function deepFreeze<T>(value: T): T {
  if (
    value === null ||
    (typeof value !== "object" && typeof value !== "function") ||
    Object.isFrozen(value)
  ) {
    return value;
  }
  for (const key of Reflect.ownKeys(value)) {
    deepFreeze((value as Record<PropertyKey, unknown>)[key]);
  }
  return Object.freeze(value);
}

class ImmutableMetricCatalogImpl implements ImmutableMetricCatalog {
  readonly size: number;
  private readonly orderedEntries: readonly (readonly [
    string,
    DashboardMetric,
  ])[];
  private readonly byId: Readonly<Record<string, DashboardMetric>>;

  constructor(metrics: readonly DashboardMetric[]) {
    const sortedEntries = metrics
      .map((metric) => Object.freeze([metric.id, metric] as const))
      .sort(([left], [right]) => compareCodePoints(left, right));
    const ids = new Set<string>();
    for (const [id] of sortedEntries) {
      if (ids.has(id)) throw new Error(`Duplicate dashboard metric id: ${id}.`);
      ids.add(id);
    }
    this.orderedEntries = Object.freeze(sortedEntries);
    const byId = Object.create(null) as Record<string, DashboardMetric>;
    for (const [id, metric] of this.orderedEntries) byId[id] = metric;
    this.byId = Object.freeze(byId);
    this.size = this.orderedEntries.length;
    Object.freeze(this);
  }

  get(id: string): DashboardMetric | undefined {
    return this.byId[id];
  }

  has(id: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.byId, id);
  }

  entries(): IterableIterator<readonly [string, DashboardMetric]> {
    return this.orderedEntries[Symbol.iterator]();
  }

  keys(): IterableIterator<string> {
    return this.orderedEntries.map(([id]) => id)[Symbol.iterator]();
  }

  values(): IterableIterator<DashboardMetric> {
    return this.orderedEntries.map(([, metric]) => metric)[Symbol.iterator]();
  }

  [Symbol.iterator](): IterableIterator<readonly [string, DashboardMetric]> {
    return this.entries();
  }
}

Object.freeze(ImmutableMetricCatalogImpl.prototype);

function createMetricCatalog(
  metrics: readonly DashboardMetric[],
): ImmutableMetricCatalog {
  return new ImmutableMetricCatalogImpl(metrics);
}

export function buildSeoGrowthDashboard(
  input: SeoGrowthDashboardInput,
  options: DashboardContractOptions = {
    observationCutoff: DEFAULT_OBSERVATION_CUTOFF,
  },
): SeoGrowthDashboard {
  const observationCutoff = normalizeObservationCutoff(options);
  assertRecord(input, "dashboard");
  assertExactKeys(
    input,
    [
      "version",
      "generatedAt",
      "dataMode",
      "provenance",
      "searchRates",
      "clusters",
      "geo",
      "operationalSignals",
    ],
    "dashboard",
  );
  if (input.version !== 1) throw new Error("dashboard.version must be 1.");
  assertUtcInstant(input.generatedAt, "dashboard.generatedAt");
  if (!DASHBOARD_DATA_MODES.includes(input.dataMode)) {
    throw new Error("dashboard.dataMode is not supported.");
  }
  if (input.dataMode === "actual") {
    assertNotAfterObservationCutoff(
      input.generatedAt,
      "dashboard.generatedAt",
      observationCutoff,
      "instant",
    );
  }
  const provenance = normalizeProvenance(
    input.provenance,
    input.dataMode,
    observationCutoff,
  );
  if (!Array.isArray(input.searchRates)) {
    throw new Error("dashboard.searchRates must be an array.");
  }

  const metrics: DashboardMetric[] = [];
  const searchRates = input.searchRates
    .map((metric, index) =>
      normalizeRateMetric(
        metric,
        `searchRates[${index}]`,
        CANONICAL_METRIC_REGISTRY.searchRate,
        input.dataMode,
        observationCutoff,
      ),
    )
    .sort((left, right) => compareCodePoints(left.id, right.id));
  metrics.push(...searchRates);

  const clusterInputs = canonicalRows<Record<string, unknown>>(
    input.clusters,
    "clusters",
    [
      "cluster",
      "qualifiedOrganicTouches",
      "successfulEnquiryRate",
      "assistedEnquiries",
    ],
  );
  const clusters = CANONICAL_CLUSTER_IDS.map((cluster): ClusterDashboardRow => {
    const row = clusterInputs.get(cluster)!;
    const normalized = {
      cluster,
      qualifiedOrganicTouches: normalizeCountMetric(
        row.qualifiedOrganicTouches,
        `clusters.${cluster}.qualifiedOrganicTouches`,
        CANONICAL_METRIC_REGISTRY.clusterQualifiedOrganicTouches,
        input.dataMode,
        observationCutoff,
      ),
      successfulEnquiryRate: normalizeRateMetric(
        row.successfulEnquiryRate,
        `clusters.${cluster}.successfulEnquiryRate`,
        CANONICAL_METRIC_REGISTRY.clusterSuccessfulEnquiryRate,
        input.dataMode,
        observationCutoff,
      ),
      assistedEnquiries: normalizeCountMetric(
        row.assistedEnquiries,
        `clusters.${cluster}.assistedEnquiries`,
        CANONICAL_METRIC_REGISTRY.clusterAssistedEnquiries,
        input.dataMode,
        observationCutoff,
      ),
    };
    metrics.push(
      normalized.qualifiedOrganicTouches,
      normalized.successfulEnquiryRate,
      normalized.assistedEnquiries,
    );
    return normalized;
  });

  const geoInputs = canonicalRows<Record<string, unknown>>(input.geo, "geo", [
    "cluster",
    "brandMentionRate",
    "ownedCitationRate",
    "accuracyRate",
    "completenessRate",
    "competitorObservations",
  ]);
  const geo = CANONICAL_CLUSTER_IDS.map((cluster): GeoClusterRow => {
    const row = geoInputs.get(cluster)!;
    const normalized = {
      cluster,
      brandMentionRate: normalizeRateMetric(
        row.brandMentionRate,
        `geo.${cluster}.brandMentionRate`,
        CANONICAL_METRIC_REGISTRY.geoBrandMentionRate,
        input.dataMode,
        observationCutoff,
      ),
      ownedCitationRate: normalizeRateMetric(
        row.ownedCitationRate,
        `geo.${cluster}.ownedCitationRate`,
        CANONICAL_METRIC_REGISTRY.geoOwnedCitationRate,
        input.dataMode,
        observationCutoff,
      ),
      accuracyRate: normalizeRateMetric(
        row.accuracyRate,
        `geo.${cluster}.accuracyRate`,
        CANONICAL_METRIC_REGISTRY.geoAccuracyRate,
        input.dataMode,
        observationCutoff,
      ),
      completenessRate: normalizeRateMetric(
        row.completenessRate,
        `geo.${cluster}.completenessRate`,
        CANONICAL_METRIC_REGISTRY.geoCompletenessRate,
        input.dataMode,
        observationCutoff,
      ),
      competitorObservations: normalizeCountMetric(
        row.competitorObservations,
        `geo.${cluster}.competitorObservations`,
        CANONICAL_METRIC_REGISTRY.geoCompetitorObservations,
        input.dataMode,
        observationCutoff,
      ),
    };
    metrics.push(
      normalized.brandMentionRate,
      normalized.ownedCitationRate,
      normalized.accuracyRate,
      normalized.completenessRate,
      normalized.competitorObservations,
    );
    return normalized;
  });

  assertRecord(input.operationalSignals, "operationalSignals");
  assertExactKeys(
    input.operationalSignals,
    DASHBOARD_OPERATIONAL_SIGNALS,
    "operationalSignals",
  );
  const semantics: Record<
    DashboardOperationalSignal,
    CanonicalMetricDefinition
  > = {
    indexation: CANONICAL_METRIC_REGISTRY.operationalIndexation,
    graph: CANONICAL_METRIC_REGISTRY.operationalGraph,
    evidence: CANONICAL_METRIC_REGISTRY.operationalEvidence,
    review: CANONICAL_METRIC_REGISTRY.operationalReview,
    validation: CANONICAL_METRIC_REGISTRY.operationalValidation,
  };
  const operationalSignals = Object.fromEntries(
    DASHBOARD_OPERATIONAL_SIGNALS.map((signal) => {
      const metric = normalizeRateMetric(
        input.operationalSignals[signal],
        `operationalSignals.${signal}`,
        semantics[signal],
        input.dataMode,
        observationCutoff,
      );
      metrics.push(metric);
      return [signal, metric];
    }),
  ) as OperationalSignals;

  return deepFreeze({
    version: 1,
    generatedAt: input.generatedAt,
    dataMode: input.dataMode,
    provenance,
    searchRates,
    clusters,
    geo,
    operationalSignals,
    metricCatalog: createMetricCatalog(metrics),
  });
}
