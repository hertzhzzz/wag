import {
  GeoConflictError,
  GeoIntegrityError,
  aggregateGeoBenchmark,
  appendGeoRun,
  compareGeoBenchmarks,
} from "./index";
import {
  blockedRunFixture,
  emptyRunFixture,
  fixtureSnapshotContents,
  misleadingCitationRunFixture,
  surfaceAbsentRunFixture,
  tamperedSnapshotRunFixture,
  validObservedRunFixture,
  versionMismatchBenchmarkPairFixture,
} from "./fixtures";

describe("GEO aggregate and persistence guards", () => {
  it("returns the explicit blocker when there are no live observations", () => {
    expect(aggregateGeoBenchmark({ runs: [] })).toMatchObject({
      status: "blocked_no_live_observations",
      baselineReady: false,
      metrics: null,
      liveRunCount: 0,
      fixtureRunCount: 0,
    });
  });

  it("never promotes fixture-only observations into a formal baseline", () => {
    const result = aggregateGeoBenchmark({
      runs: [
        validObservedRunFixture,
        surfaceAbsentRunFixture,
        blockedRunFixture,
        misleadingCitationRunFixture,
        emptyRunFixture,
      ],
      snapshotContents: fixtureSnapshotContents,
    });

    expect(result).toMatchObject({
      status: "blocked_no_live_observations",
      baselineReady: false,
      metrics: null,
      liveRunCount: 0,
      fixtureRunCount: 5,
    });
  });

  it("hard-fails a snapshot hash mismatch before aggregation", () => {
    expect(() =>
      aggregateGeoBenchmark({
        runs: [tamperedSnapshotRunFixture],
        snapshotContents: fixtureSnapshotContents,
      }),
    ).toThrow(GeoIntegrityError);
  });

  it("does not calculate a delta across incompatible versions", () => {
    const comparison = compareGeoBenchmarks(
      versionMismatchBenchmarkPairFixture.previous,
      versionMismatchBenchmarkPairFixture.current,
    );

    expect(comparison.status).toBe("version_mismatch");
    expect(comparison.delta).toBeNull();
    expect(comparison.mismatchedVersions).toContain("methodologyVersion");
  });

  it("appends a new runId without overwriting prior records and rejects duplicates", () => {
    const existing = [validObservedRunFixture];
    const appended = appendGeoRun(existing, emptyRunFixture);

    expect(appended).toHaveLength(2);
    expect(appended[0]).toEqual(validObservedRunFixture);
    expect(existing).toHaveLength(1);
    expect(() => appendGeoRun(appended, validObservedRunFixture)).toThrow(
      GeoConflictError,
    );
    expect(() =>
      appendGeoRun(
        [validObservedRunFixture, validObservedRunFixture],
        emptyRunFixture,
      ),
    ).toThrow(GeoConflictError);
  });
});
