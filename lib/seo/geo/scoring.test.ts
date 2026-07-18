import { parseGeoObservation, scoreGeoObservations } from "./index";
import {
  blockedRunFixture,
  misleadingCitationRunFixture,
  surfaceAbsentRunFixture,
  validObservedRunFixture,
} from "./fixtures";

describe("GEO independent scoring dimensions", () => {
  it("scores each dimension separately and excludes blocked, unavailable, and invalid from denominators", () => {
    const blocked = blockedRunFixture.observations[0];
    const unavailable = parseGeoObservation({
      ...blocked,
      observationId: "obs.fixture.unavailable.001",
      status: "unavailable",
      statusReason: "surface-unavailable",
    });
    const invalid = parseGeoObservation({
      ...blocked,
      observationId: "obs.fixture.invalid.001",
      status: "invalid",
      statusReason: "validation-failure",
    });

    const score = scoreGeoObservations([
      validObservedRunFixture.observations[0],
      surfaceAbsentRunFixture.observations[0],
      blocked,
      unavailable,
      invalid,
      misleadingCitationRunFixture.observations[0],
    ]);

    expect(score.mention).toMatchObject({ numerator: 2, denominator: 3 });
    expect(score.citation).toMatchObject({ numerator: 2, denominator: 3 });
    expect(score.accuracy).toMatchObject({ numerator: 2, denominator: 2 });
    expect(score.completeness).toMatchObject({
      numerator: 2,
      denominator: 2,
    });
    expect(score.citationIntegrity).toMatchObject({
      numerator: 1,
      denominator: 2,
    });
    expect(score.competitorPreference).toMatchObject({
      numerator: 1,
      denominator: 2,
    });
    expect(score.mention.statusCounts).toMatchObject({
      blocked: 1,
      unavailable: 1,
      invalid: 1,
    });
    expect(score.mention.dateRange).toEqual({
      from: "2000-01-01T00:00:00.000Z",
      to: "2000-01-03T00:00:00.000Z",
    });
    expect(
      score.mention.versionCounts.benchmark["benchmark-fixture-v1"],
    ).toEqual({ numerator: 2, denominator: 3 });
    expect(score.citation.trace).toEqual({
      denominatorObservationIds: [
        "obs.fixture.absent.001",
        "obs.fixture.misleading.001",
        "obs.fixture.valid.001",
      ],
      numeratorObservationIds: [
        "obs.fixture.misleading.001",
        "obs.fixture.valid.001",
      ],
      excludedObservationIds: [
        "obs.fixture.blocked.001",
        "obs.fixture.invalid.001",
        "obs.fixture.unavailable.001",
      ],
      runIds: [
        "run.fixture.absent.001",
        "run.fixture.misleading.001",
        "run.fixture.valid.001",
      ],
      evidencePaths: [
        "lib/seo/geo/fixtures/observations/obs.fixture.absent.001.json",
        "lib/seo/geo/fixtures/observations/obs.fixture.misleading.001.json",
        "lib/seo/geo/fixtures/observations/obs.fixture.valid.001.json",
      ],
    });
    expect(score.composite).not.toBeNull();
  });

  it("keeps composite null when any required dimension has no denominator", () => {
    const score = scoreGeoObservations([
      surfaceAbsentRunFixture.observations[0],
    ]);

    expect(score.mention).toMatchObject({ numerator: 0, denominator: 1 });
    expect(score.accuracy.rate).toBeNull();
    expect(score.completeness.rate).toBeNull();
    expect(score.citationIntegrity.rate).toBeNull();
    expect(score.competitorPreference.rate).toBeNull();
    expect(score.composite).toBeNull();
    expect(score.missingCompositeMetrics).toEqual([
      "accuracy",
      "completeness",
      "citationIntegrity",
      "competitorPreference",
    ]);
  });
});
