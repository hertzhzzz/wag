import { CANONICAL_CLUSTER_IDS } from "../clusterSchema";
import {
  buildSeoGrowthDashboard,
  type CountMetricInput,
  type RateMetricInput,
  type SeoGrowthDashboardInput,
} from "./dashboardContract";

const sourceLineage = [
  {
    system: "synthetic-fixture",
    dataset: "growth-dashboard",
    version: "2026-07-18",
    asOfDate: "2026-07-18",
  },
];

function rate(id: string): RateMetricInput {
  return {
    id,
    label: id,
    status: "available",
    definition: `Definition for ${id}`,
    dateRange: { start: "2026-07-01", end: "2026-07-17" },
    comparisonPeriod: { start: "2026-06-13", end: "2026-06-29" },
    sourceLineage,
    numerator: 2,
    denominator: 4,
  };
}

function count(id: string): CountMetricInput {
  return {
    id,
    label: id,
    status: "available",
    definition: `Definition for ${id}`,
    dateRange: { start: "2026-07-01", end: "2026-07-17" },
    comparisonPeriod: { start: "2026-06-13", end: "2026-06-29" },
    sourceLineage,
    value: 2,
  };
}

function validInput(): SeoGrowthDashboardInput {
  return {
    version: 1,
    generatedAt: "2026-07-18T07:00:00.000Z",
    dataMode: "synthetic_fixture",
    provenance: {
      source: "dashboard-contract-test",
      capturedAt: "2026-07-18T07:00:00.000Z",
      fixtureId: "dashboard-fixture-2026-07-18",
    },
    searchRates: [rate("search.organic")],
    clusters: CANONICAL_CLUSTER_IDS.map((cluster) => ({
      cluster,
      qualifiedOrganicTouches: count(`${cluster}.qualified-touches`),
      successfulEnquiryRate: rate(`${cluster}.enquiry-rate`),
      assistedEnquiries: count(`${cluster}.assisted-enquiries`),
    })),
    geo: CANONICAL_CLUSTER_IDS.map((cluster) => ({
      cluster,
      brandMentionRate: rate(`${cluster}.brand-mention`),
      ownedCitationRate: rate(`${cluster}.owned-citation`),
      accuracyRate: rate(`${cluster}.accuracy`),
      completenessRate: rate(`${cluster}.completeness`),
      competitorObservations: count(`${cluster}.competitor-observations`),
    })),
    operationalSignals: {
      indexation: rate("signal.indexation"),
      graph: rate("signal.graph"),
      evidence: rate("signal.evidence"),
      review: rate("signal.review"),
      validation: rate("signal.validation"),
    },
  };
}

const OBSERVATION_CUTOFF = "2026-07-18T23:59:59.999Z";

type MutableDashboardInput = Omit<
  SeoGrowthDashboardInput,
  "generatedAt" | "provenance" | "searchRates"
> & {
  generatedAt: string;
  provenance: SeoGrowthDashboardInput["provenance"];
  searchRates: RateMetricInput[];
};

function mutableInput(input: SeoGrowthDashboardInput): MutableDashboardInput {
  return input as unknown as MutableDashboardInput;
}

function mapMetricToActual<T extends RateMetricInput | CountMetricInput>(
  metric: T,
): T {
  return {
    ...metric,
    sourceLineage: metric.sourceLineage.map((entry) => ({
      ...entry,
      system: "google-search-console",
      version: "live-v1",
      asOfDate: "2026-07-17",
    })),
  } as T;
}

function actualInput(): SeoGrowthDashboardInput {
  const fixture = validInput();
  return {
    ...fixture,
    generatedAt: "2026-07-18T07:00:00.000Z",
    dataMode: "actual",
    provenance: {
      source: "google-search-console",
      capturedAt: "2026-07-18T07:00:00.000Z",
      fixtureId: null,
    },
    searchRates: fixture.searchRates.map(mapMetricToActual),
    clusters: fixture.clusters.map((row) => ({
      ...row,
      qualifiedOrganicTouches: mapMetricToActual(row.qualifiedOrganicTouches),
      successfulEnquiryRate: mapMetricToActual(row.successfulEnquiryRate),
      assistedEnquiries: mapMetricToActual(row.assistedEnquiries),
    })),
    geo: fixture.geo.map((row) => ({
      ...row,
      brandMentionRate: mapMetricToActual(row.brandMentionRate),
      ownedCitationRate: mapMetricToActual(row.ownedCitationRate),
      accuracyRate: mapMetricToActual(row.accuracyRate),
      completenessRate: mapMetricToActual(row.completenessRate),
      competitorObservations: mapMetricToActual(row.competitorObservations),
    })),
    operationalSignals: Object.fromEntries(
      Object.entries(fixture.operationalSignals).map(([signal, metric]) => [
        signal,
        mapMetricToActual(metric),
      ]),
    ) as SeoGrowthDashboardInput["operationalSignals"],
  };
}

function futureFixtureInput(
  dataMode: "synthetic_fixture" | "dry_run",
): SeoGrowthDashboardInput {
  const fixture = validInput();
  const futureDateRange = { start: "2026-07-19", end: "2026-07-19" };
  const mapFutureMetric = <T extends RateMetricInput | CountMetricInput>(
    metric: T,
  ): T =>
    ({
      ...metric,
      dateRange: futureDateRange,
      comparisonPeriod: futureDateRange,
      sourceLineage: metric.sourceLineage.map((entry) => ({
        ...entry,
        system: `${dataMode}-fixture`,
        asOfDate: "2026-07-19",
      })),
    }) as T;

  return {
    ...fixture,
    generatedAt: "2026-07-19T07:00:00.000Z",
    dataMode,
    provenance: {
      ...fixture.provenance,
      capturedAt: "2026-07-19T07:00:00.000Z",
      fixtureId: `${dataMode}-2026-07-19`,
    },
    searchRates: fixture.searchRates.map(mapFutureMetric),
    clusters: fixture.clusters.map((row) => ({
      ...row,
      qualifiedOrganicTouches: mapFutureMetric(row.qualifiedOrganicTouches),
      successfulEnquiryRate: mapFutureMetric(row.successfulEnquiryRate),
      assistedEnquiries: mapFutureMetric(row.assistedEnquiries),
    })),
    geo: fixture.geo.map((row) => ({
      ...row,
      brandMentionRate: mapFutureMetric(row.brandMentionRate),
      ownedCitationRate: mapFutureMetric(row.ownedCitationRate),
      accuracyRate: mapFutureMetric(row.accuracyRate),
      completenessRate: mapFutureMetric(row.completenessRate),
      competitorObservations: mapFutureMetric(row.competitorObservations),
    })),
    operationalSignals: Object.fromEntries(
      Object.entries(fixture.operationalSignals).map(([signal, metric]) => [
        signal,
        mapFutureMetric(metric),
      ]),
    ) as SeoGrowthDashboardInput["operationalSignals"],
  };
}

describe("measurement contract hardening", () => {
  it.each([
    [
      "generatedAt",
      (input: MutableDashboardInput) => {
        input.generatedAt = "2026-07-19T00:00:00.000Z";
      },
    ],
    [
      "provenance.capturedAt",
      (input: MutableDashboardInput) => {
        input.provenance = {
          ...input.provenance,
          capturedAt: "2026-07-19T00:00:00.000Z",
        };
      },
    ],
    [
      "metric.dateRange.end",
      (input: MutableDashboardInput) => {
        input.searchRates[0] = {
          ...input.searchRates[0],
          dateRange: { start: "2026-07-01", end: "2026-07-19" },
        };
      },
    ],
    [
      "metric.comparisonPeriod.end",
      (input: MutableDashboardInput) => {
        input.searchRates[0] = {
          ...input.searchRates[0],
          comparisonPeriod: { start: "2026-06-13", end: "2026-07-19" },
        };
      },
    ],
    [
      "sourceLineage[].asOfDate",
      (input: MutableDashboardInput) => {
        input.searchRates[0] = {
          ...input.searchRates[0],
          sourceLineage: [
            {
              ...input.searchRates[0].sourceLineage[0],
              asOfDate: "2026-07-19",
            },
          ],
        };
      },
    ],
  ])("rejects future actual %s observations", (_field, mutate) => {
    const actual = actualInput();
    mutate(mutableInput(actual));

    expect(() =>
      buildSeoGrowthDashboard(actual, {
        observationCutoff: OBSERVATION_CUTOFF,
      }),
    ).toThrow(/must not be after observation cutoff\./);
  });

  it("rejects the reviewer's 2026-07-19 actual observation and accepts the 2026-07-18 boundary", () => {
    const actual = mutableInput(actualInput());
    actual.generatedAt = "2026-07-19T00:00:00.000Z";
    expect(() =>
      buildSeoGrowthDashboard(actual, {
        observationCutoff: OBSERVATION_CUTOFF,
      }),
    ).toThrow("dashboard.generatedAt must not be after observation cutoff.");

    actual.generatedAt = OBSERVATION_CUTOFF;
    expect(
      buildSeoGrowthDashboard(actual, {
        observationCutoff: OBSERVATION_CUTOFF,
      }).generatedAt,
    ).toBe(OBSERVATION_CUTOFF);
  });

  it.each(["synthetic_fixture", "dry_run"] as const)(
    "allows future dates only for explicitly isolated %s fixtures",
    (dataMode) => {
      const dashboard = buildSeoGrowthDashboard(futureFixtureInput(dataMode), {
        observationCutoff: OBSERVATION_CUTOFF,
      });

      expect(dashboard.dataMode).toBe(dataMode);
      expect(dashboard.provenance.fixtureId).toBe(`${dataMode}-2026-07-19`);
      expect(dashboard.searchRates[0].dateRange.end).toBe("2026-07-19");
    },
  );

  it("uses the supplied cutoff rather than ambient time", () => {
    const actual = mutableInput(actualInput());
    actual.generatedAt = "2026-07-18T23:59:59.000Z";

    expect(
      buildSeoGrowthDashboard(actual, {
        observationCutoff: "2026-07-18T23:59:59.000Z",
      }).generatedAt,
    ).toBe("2026-07-18T23:59:59.000Z");
    expect(() =>
      buildSeoGrowthDashboard(actual, {
        observationCutoff: "2026-07-18T23:58:59.000Z",
      }),
    ).toThrow("dashboard.generatedAt must not be after observation cutoff.");
  });

  it("never permits a caller-supplied cutoff to move actual observations beyond the fixed review boundary", () => {
    const actual = mutableInput(actualInput());
    actual.generatedAt = "2026-07-19T00:00:00.000Z";

    expect(() =>
      buildSeoGrowthDashboard(actual, {
        observationCutoff: "2026-07-20T23:59:59.999Z",
      }),
    ).toThrow(
      "dashboard options.observationCutoff must not be after the default observation cutoff.",
    );
  });

  it("rejects fixture markers in actual provenance.source", () => {
    const actual = mutableInput(actualInput());
    actual.provenance = {
      ...actual.provenance,
      source: "synthetic-fixture",
    };

    expect(() =>
      buildSeoGrowthDashboard(actual, {
        observationCutoff: OBSERVATION_CUTOFF,
      }),
    ).toThrow(/fixture|synthetic|dry-run/i);
  });

  it.each(["system", "dataset", "version"] as const)(
    "rejects fixture markers in actual sourceLineage.%s",
    (field) => {
      const actual = mutableInput(actualInput());
      actual.searchRates[0] = {
        ...actual.searchRates[0],
        sourceLineage: [
          {
            ...actual.searchRates[0].sourceLineage[0],
            [field]: field === "version" ? "dry-run-v1" : "synthetic-fixture",
          },
        ],
      };

      expect(() =>
        buildSeoGrowthDashboard(actual, {
          observationCutoff: OBSERVATION_CUTOFF,
        }),
      ).toThrow(/fixture|synthetic|dry-run/i);
    },
  );

  it("rejects a date-only observation on a cutoff before the UTC day is complete", () => {
    const actual = mutableInput(actualInput());
    actual.generatedAt = "2026-07-17T23:59:59.999Z";
    actual.provenance = {
      ...actual.provenance,
      capturedAt: "2026-07-17T23:59:59.999Z",
    };
    actual.searchRates[0] = {
      ...actual.searchRates[0],
      dateRange: { start: "2026-07-01", end: "2026-07-18" },
      sourceLineage: [
        {
          ...actual.searchRates[0].sourceLineage[0],
          asOfDate: "2026-07-17",
        },
      ],
    };

    expect(() =>
      buildSeoGrowthDashboard(actual, {
        observationCutoff: "2026-07-18T00:00:00.000Z",
      }),
    ).toThrow(
      "searchRates[0].dateRange.end must not be after observation cutoff.",
    );
  });

  it("requires a fixture identity for dry_run data", () => {
    const dryRun = validInput();
    const input = {
      ...dryRun,
      dataMode: "dry_run" as const,
      provenance: { ...dryRun.provenance, fixtureId: null },
    };

    expect(() => buildSeoGrowthDashboard(input)).toThrow(
      "dashboard.provenance.fixtureId is required for dry_run mode.",
    );
  });

  it("rejects inherited keys from nested records", () => {
    const input = validInput() as unknown as Record<string, unknown>;
    const inheritedDateRange = Object.create({ unexpected: "must fail" }) as {
      start: string;
      end: string;
    };
    inheritedDateRange.start = "2026-07-01";
    inheritedDateRange.end = "2026-07-17";
    (input.searchRates as Array<Record<string, unknown>>)[0].dateRange =
      inheritedDateRange;

    expect(() => buildSeoGrowthDashboard(input as never)).toThrow(
      /plain object/i,
    );
  });

  it("rejects non-plain options before inherited keys can widen the policy", () => {
    const options = Object.create({ unexpected: true }) as {
      observationCutoff: string;
    };
    options.observationCutoff = OBSERVATION_CUTOFF;

    expect(() => buildSeoGrowthDashboard(validInput(), options)).toThrow(
      /dashboard options must be a plain object/i,
    );
  });

  it("copies input values before freezing the returned dashboard", () => {
    const input = validInput() as unknown as MutableDashboardInput;
    const dashboard = buildSeoGrowthDashboard(input);
    input.searchRates[0] = {
      ...input.searchRates[0],
      label: "mutated-after-build",
      dateRange: { start: "2026-07-01", end: "2026-07-19" },
    };

    expect(dashboard.searchRates[0].label).toBe("search.organic");
    expect(dashboard.searchRates[0].dateRange.end).toBe("2026-07-17");
  });

  it("rejects non-UTC or malformed observation cutoffs", () => {
    for (const observationCutoff of [
      "2026-07-18T23:59:59+00:00",
      "2026-07-18T24:00:00.000Z",
      "2026-07-18T23:59:59.99Z",
    ]) {
      expect(() =>
        buildSeoGrowthDashboard(validInput(), { observationCutoff }),
      ).toThrow(/RFC3339 UTC|valid RFC3339 UTC/);
    }
  });

  it("rejects unknown keys recursively instead of silently dropping them", () => {
    const input = validInput() as unknown as Record<string, unknown>;
    const searchRates = input.searchRates as Array<Record<string, unknown>>;
    searchRates[0].dateRange = {
      start: "2026-07-01",
      end: "2026-07-17",
      unexpected: "must fail",
    };

    expect(() => buildSeoGrowthDashboard(input as never)).toThrow(
      /dateRange.*exactly/i,
    );
  });

  it("rejects unknown top-level keys", () => {
    const input = {
      ...validInput(),
      unexpected: "must fail",
    } as unknown as SeoGrowthDashboardInput;

    expect(() => buildSeoGrowthDashboard(input)).toThrow(/dashboard.*exactly/i);
  });

  it("exposes canonical registry semantics and cardinality for every metric", () => {
    const dashboard = buildSeoGrowthDashboard(validInput());
    const metric = dashboard.searchRates[0];

    expect(metric).toEqual(
      expect.objectContaining({
        registryKey: "search.rate",
        cardinality: "portfolio",
        signalType: "lagging_outcome",
      }),
    );
    expect(dashboard.clusters[0].qualifiedOrganicTouches).toEqual(
      expect.objectContaining({
        cardinality: "per_cluster",
        signalType: "lagging_outcome",
      }),
    );
  });

  it("uses a runtime-immutable metric catalog rather than a mutable ReadonlyMap", () => {
    const dashboard = buildSeoGrowthDashboard(validInput());
    const catalog = dashboard.metricCatalog as unknown as Record<
      string,
      unknown
    >;
    const before = dashboard.metricCatalog.size;

    expect(Object.isFrozen(dashboard.metricCatalog)).toBe(true);
    expect(catalog.set).toBeUndefined();
    expect(dashboard.metricCatalog.get("search.organic")).toBeDefined();
    expect(dashboard.metricCatalog.size).toBe(before);

    const prototype = Object.getPrototypeOf(dashboard.metricCatalog) as object;
    expect(Object.isFrozen(prototype)).toBe(true);
    expect(() =>
      Object.defineProperty(prototype, "get", {
        value: () => undefined,
      }),
    ).toThrow();
  });
});
