import { readFileSync } from "node:fs";
import { join } from "node:path";

import { CANONICAL_CLUSTER_IDS, type ClusterId } from "../clusterSchema";
import {
  DASHBOARD_OPERATIONAL_SIGNALS,
  DATA_AVAILABILITY_STATUSES,
  buildSeoGrowthDashboard,
  type ClusterDashboardInput,
  type CountMetricInput,
  type GeoClusterInput,
  type RateMetricInput,
  type SeoGrowthDashboardInput,
} from "./dashboardContract";

const CURRENT_RANGE = { start: "2026-07-01", end: "2026-07-17" } as const;
const COMPARISON_RANGE = {
  start: "2026-06-13",
  end: "2026-06-29",
} as const;

function lineage(dataset: string) {
  return [
    {
      system: "synthetic-fixture",
      dataset,
      version: "fixture-v1",
      asOfDate: "2026-07-18",
    },
  ];
}

function rate(
  id: string,
  overrides: Partial<RateMetricInput> = {},
): RateMetricInput {
  return {
    id,
    label: id,
    status: "available",
    numerator: 4,
    denominator: 10,
    definition: `${id} definition`,
    dateRange: CURRENT_RANGE,
    comparisonPeriod: COMPARISON_RANGE,
    sourceLineage: lineage(id),
    ...overrides,
  };
}

function count(
  id: string,
  overrides: Partial<CountMetricInput> = {},
): CountMetricInput {
  return {
    id,
    label: id,
    status: "available",
    value: 4,
    definition: `${id} definition`,
    dateRange: CURRENT_RANGE,
    comparisonPeriod: COMPARISON_RANGE,
    sourceLineage: lineage(id),
    ...overrides,
  };
}

function geo(cluster: ClusterId): GeoClusterInput {
  return {
    cluster,
    brandMentionRate: rate(`${cluster}.geo.brand-mention`),
    ownedCitationRate: rate(`${cluster}.geo.owned-citation`),
    accuracyRate: rate(`${cluster}.geo.accuracy`),
    completenessRate: rate(`${cluster}.geo.completeness`),
    competitorObservations: count(`${cluster}.geo.competitor-observations`),
  };
}

function input(): SeoGrowthDashboardInput {
  return {
    version: 1,
    generatedAt: "2026-07-18T07:00:00.000Z",
    dataMode: "synthetic_fixture",
    provenance: {
      source: "dashboard-contract-test",
      capturedAt: "2026-07-18T07:00:00.000Z",
      fixtureId: "dashboard-fixture-2026-07-18",
    },
    searchRates: [
      rate("search.non-brand-ctr", { numerator: 12, denominator: 240 }),
      rate("search.top-ten-visibility", { numerator: 30, denominator: 50 }),
    ],
    clusters: CANONICAL_CLUSTER_IDS.map((cluster) => ({
      cluster,
      qualifiedOrganicTouches: count(`${cluster}.qualified-organic-touches`),
      successfulEnquiryRate: rate(`${cluster}.successful-enquiry-rate`),
      assistedEnquiries: count(`${cluster}.assisted-enquiries`),
    })),
    geo: CANONICAL_CLUSTER_IDS.map(geo),
    operationalSignals: {
      indexation: rate("operations.indexation"),
      graph: rate("operations.graph"),
      evidence: rate("operations.evidence"),
      review: rate("operations.review"),
      validation: rate("operations.validation"),
    },
  };
}

describe("SEO growth dashboard contract", () => {
  it("exports explicit availability and operational vocabularies", () => {
    expect(DATA_AVAILABILITY_STATUSES).toEqual([
      "available",
      "missing",
      "delayed",
      "partial",
      "blocked_privacy_approval",
    ]);
    expect(DASHBOARD_OPERATIONAL_SIGNALS).toEqual([
      "indexation",
      "graph",
      "evidence",
      "review",
      "validation",
    ]);
  });

  it("retains raw counts, definitions, periods, and lineage beside every rate", () => {
    const dashboard = buildSeoGrowthDashboard(input());
    const metric = dashboard.searchRates.find(
      ({ id }) => id === "search.non-brand-ctr",
    );

    expect(metric).toEqual({
      id: "search.non-brand-ctr",
      label: "search.non-brand-ctr",
      status: "available",
      numerator: 12,
      denominator: 240,
      rate: 0.05,
      registryKey: "search.rate",
      cardinality: "portfolio",
      signalType: "lagging_outcome",
      definition: "search.non-brand-ctr definition",
      dateRange: CURRENT_RANGE,
      comparisonPeriod: COMPARISON_RANGE,
      sourceLineage: lineage("search.non-brand-ctr"),
    });
    expect(dashboard.metricCatalog.get("search.non-brand-ctr")).toEqual(
      expect.objectContaining({
        definition: expect.any(String),
        sourceLineage: expect.any(Array),
        dateRange: CURRENT_RANGE,
        comparisonPeriod: COMPARISON_RANGE,
      }),
    );
  });

  it("projects qualified touches, enquiry success, and assisted enquiries by all five governed clusters", () => {
    const dashboard = buildSeoGrowthDashboard(input());

    expect(dashboard.clusters.map(({ cluster }) => cluster)).toEqual(
      CANONICAL_CLUSTER_IDS,
    );
    for (const row of dashboard.clusters) {
      expect(row.qualifiedOrganicTouches).toEqual(
        expect.objectContaining({ value: 4, status: "available" }),
      );
      expect(row.successfulEnquiryRate).toEqual(
        expect.objectContaining({
          numerator: 4,
          denominator: 10,
          rate: 0.4,
        }),
      );
      expect(row.assistedEnquiries).toEqual(
        expect.objectContaining({ value: 4, status: "available" }),
      );
    }
  });

  it("keeps GEO brand, citation, accuracy, completeness, and competitor observations separate", () => {
    const dashboard = buildSeoGrowthDashboard(input());
    const supplier = dashboard.geo[0];

    expect(supplier).toEqual(
      expect.objectContaining({
        cluster: "supplier-verification",
        brandMentionRate: expect.objectContaining({ rate: 0.4 }),
        ownedCitationRate: expect.objectContaining({ rate: 0.4 }),
        accuracyRate: expect.objectContaining({ rate: 0.4 }),
        completenessRate: expect.objectContaining({ rate: 0.4 }),
        competitorObservations: expect.objectContaining({ value: 4 }),
      }),
    );
  });

  it("keeps indexation, graph, evidence, review, and validation as distinct signals", () => {
    const dashboard = buildSeoGrowthDashboard(input());

    expect(Object.keys(dashboard.operationalSignals)).toEqual(
      DASHBOARD_OPERATIONAL_SIGNALS,
    );
    expect(dashboard.operationalSignals.indexation.id).not.toBe(
      dashboard.operationalSignals.graph.id,
    );
    expect(dashboard.operationalSignals.evidence.id).not.toBe(
      dashboard.operationalSignals.review.id,
    );
  });

  it.each(["missing", "delayed", "blocked_privacy_approval"] as const)(
    "labels %s rate data and never converts it to zero",
    (status) => {
      const fixture = input();
      (fixture.clusters as ClusterDashboardInput[])[0] = {
        ...fixture.clusters[0],
        successfulEnquiryRate: rate(
          "supplier-verification.successful-enquiry-rate",
          {
            status,
            numerator: null,
            denominator: null,
          },
        ),
      };

      const dashboard = buildSeoGrowthDashboard(fixture);
      expect(dashboard.clusters[0].successfulEnquiryRate).toEqual(
        expect.objectContaining({
          status,
          numerator: null,
          denominator: null,
          rate: null,
        }),
      );
    },
  );

  it("allows partial counts only while preserving the partial label", () => {
    const fixture = input();
    (fixture.clusters as ClusterDashboardInput[])[0] = {
      ...fixture.clusters[0],
      successfulEnquiryRate: rate(
        "supplier-verification.successful-enquiry-rate",
        {
          status: "partial",
          numerator: 2,
          denominator: 5,
        },
      ),
    };

    const metric =
      buildSeoGrowthDashboard(fixture).clusters[0].successfulEnquiryRate;
    expect(metric).toEqual(
      expect.objectContaining({ status: "partial", rate: 0.4 }),
    );
  });

  it("rejects zero substitution for blocked attribution data", () => {
    const fixture = input();
    (fixture.clusters as ClusterDashboardInput[])[0] = {
      ...fixture.clusters[0],
      qualifiedOrganicTouches: count(
        "supplier-verification.qualified-organic-touches",
        {
          status: "blocked_privacy_approval",
          value: 0,
        },
      ),
    };

    expect(() => buildSeoGrowthDashboard(fixture)).toThrow(
      /blocked_privacy_approval.*null/i,
    );
  });

  it("rejects inconsistent rates, missing comparison periods, and absent lineage", () => {
    const inconsistent = input();
    (inconsistent.searchRates as RateMetricInput[])[0] = rate(
      "search.invalid",
      {
        numerator: 11,
        denominator: 10,
      },
    );
    expect(() => buildSeoGrowthDashboard(inconsistent)).toThrow(
      /numerator.*denominator/i,
    );

    const noComparison = input();
    (noComparison.searchRates as RateMetricInput[])[0] = {
      ...rate("search.no-comparison"),
      comparisonPeriod: null,
    } as unknown as RateMetricInput;
    expect(() => buildSeoGrowthDashboard(noComparison)).toThrow(
      /comparisonPeriod/i,
    );

    const noLineage = input();
    (noLineage.searchRates as RateMetricInput[])[0] = rate(
      "search.no-lineage",
      {
        sourceLineage: [],
      },
    );
    expect(() => buildSeoGrowthDashboard(noLineage)).toThrow(/sourceLineage/i);
  });

  it("rejects missing, duplicate, or unknown governed cluster rows", () => {
    const missing = input();
    (missing.clusters as ClusterDashboardInput[]).pop();
    expect(() => buildSeoGrowthDashboard(missing)).toThrow(
      /exactly the five canonical clusters/i,
    );

    const duplicate = input();
    (duplicate.clusters as ClusterDashboardInput[])[4] = duplicate.clusters[0];
    expect(() => buildSeoGrowthDashboard(duplicate)).toThrow(
      /exactly the five canonical clusters/i,
    );

    const unknown = input();
    (unknown.geo as GeoClusterInput[])[0] = {
      ...unknown.geo[0],
      cluster: "other" as ClusterId,
    };
    expect(() => buildSeoGrowthDashboard(unknown)).toThrow(
      /exactly the five canonical clusters/i,
    );
  });

  it("is deterministic, deeply frozen, and performs no action side effects", () => {
    const first = buildSeoGrowthDashboard(input());
    const second = buildSeoGrowthDashboard(input());
    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.clusters)).toBe(true);
    expect(Object.isFrozen(first.clusters[0].successfulEnquiryRate)).toBe(true);

    const source = readFileSync(
      join(__dirname, "dashboardContract.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/process\.(env|cwd)/);
    expect(source).not.toMatch(/Date\.now|new Date\(\)/);
    expect(source).not.toMatch(
      /from ["'][^"']*(generation|publish|deploy|indexing|release)[^"']*["']/i,
    );
  });
});
