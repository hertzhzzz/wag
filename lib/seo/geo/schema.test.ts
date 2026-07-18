import {
  GEO_CLUSTERS,
  GEO_OBSERVATION_STATUSES,
  GEO_PLATFORMS,
  GeoContractError,
  assertCanonicalBenchmarkQuestionSet,
  assertClusterQuestionSet,
  parseGeoObservation,
  parseGeoRunRecord,
} from "./index";
import {
  blockedRunFixture,
  canonicalQuestionSetFixture,
  piiRejectedObservationFixture,
  surfaceAbsentRunFixture,
  validObservedRunFixture,
} from "./fixtures";

describe("GEO shared contract schemas", () => {
  it("locks the exact platform, status, and five canonical cluster enums", () => {
    expect(GEO_PLATFORMS).toEqual([
      "chatgpt",
      "perplexity",
      "google-ai-overviews",
      "bing-copilot",
    ]);
    expect(GEO_OBSERVATION_STATUSES).toEqual([
      "observed-answer",
      "observed-surface-absent",
      "unavailable",
      "blocked",
      "invalid",
    ]);
    expect(GEO_CLUSTERS).toEqual([
      "supplier-verification",
      "factory-audit",
      "quality-inspection",
      "factory-visits",
      "china-sourcing",
    ]);
  });

  it("accepts golden observed-answer, surface-absent, and blocked records", () => {
    expect(
      parseGeoRunRecord(validObservedRunFixture).observations,
    ).toHaveLength(1);
    expect(
      parseGeoRunRecord(surfaceAbsentRunFixture).observations[0].status,
    ).toBe("observed-surface-absent");
    expect(parseGeoRunRecord(blockedRunFixture).observations[0].status).toBe(
      "blocked",
    );
  });

  it("requires observedAt as explicit input and never reads the wall clock", () => {
    const nowSpy = jest.spyOn(Date, "now").mockImplementation(() => {
      throw new Error("wall clock must not be read");
    });
    const withoutObservedAt: Partial<
      (typeof validObservedRunFixture.observations)[number]
    > = { ...validObservedRunFixture.observations[0] };
    delete withoutObservedAt.observedAt;

    expect(() => parseGeoObservation(withoutObservedAt)).toThrow(
      GeoContractError,
    );
    expect(nowSpy).not.toHaveBeenCalled();
    nowSpy.mockRestore();
  });

  it("allows rank only when the captured surface is explicitly ordered", () => {
    const observation = validObservedRunFixture.observations[0];
    const unorderedWithRank = {
      ...observation,
      surface: { ...observation.surface, ordered: false },
      citations: [{ ...observation.citations[0], rank: 1 }],
    };

    expect(() => parseGeoObservation(unorderedWithRank)).toThrow(
      GeoContractError,
    );
  });

  it("rejects prompt hash mismatches", () => {
    const observation = validObservedRunFixture.observations[0];
    const mismatched = {
      ...observation,
      prompt: {
        ...observation.prompt,
        hash: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
    };

    expect(() => parseGeoObservation(mismatched)).toThrow(GeoContractError);
  });

  it("rejects PII, account, cookie, session, and free-form enquiry fields without echoing secrets", () => {
    const secret = piiRejectedObservationFixture.cookie;

    try {
      parseGeoObservation(piiRejectedObservationFixture);
      throw new Error("expected fixture to be rejected");
    } catch (error) {
      expect(error).toBeInstanceOf(GeoContractError);
      expect((error as Error).message).not.toContain(secret);
      expect((error as Error).message).not.toContain(
        piiRejectedObservationFixture.account.email,
      );
      expect((error as Error).message).not.toContain(
        piiRejectedObservationFixture.enquiry,
      );
    }
  });

  it("rejects encoded PII or secret-bearing citation URLs without echoing them", () => {
    const observation = validObservedRunFixture.observations[0];
    const privateUrls = [
      "https://fixture.invalid/reference?email=private-person%40example.com",
      "https://fixture.invalid/reference?email=private-person%2540example.com",
      "https://fixture.invalid/reference?access_token=fixture-secret-value",
    ];

    for (const privateUrl of privateUrls) {
      const withPrivateUrl = {
        ...observation,
        citations: [{ ...observation.citations[0], url: privateUrl }],
      };

      try {
        parseGeoObservation(withPrivateUrl);
        throw new Error("expected sensitive URL to be rejected");
      } catch (error) {
        expect(error).toBeInstanceOf(GeoContractError);
        expect((error as Error).message).not.toContain(privateUrl);
        expect((error as Error).message).not.toContain(
          "private-person@example.com",
        );
        expect((error as Error).message).not.toContain("fixture-secret-value");
      }
    }
  });

  it("rejects PII embedded in repository evidence paths", () => {
    const observation = validObservedRunFixture.observations[0];
    const privatePath =
      "lib/seo/geo/evidence/private-person@example.com/observation.json";

    expect(() =>
      parseGeoObservation({ ...observation, evidencePath: privatePath }),
    ).toThrow(GeoContractError);
  });

  it("requires exactly ten approved questions per cluster and fifty overall", () => {
    expect(
      assertClusterQuestionSet(
        canonicalQuestionSetFixture.filter(
          (question) => question.cluster === "supplier-verification",
        ),
        "supplier-verification",
      ),
    ).toHaveLength(10);
    expect(
      assertCanonicalBenchmarkQuestionSet(canonicalQuestionSetFixture),
    ).toHaveLength(50);

    expect(() =>
      assertCanonicalBenchmarkQuestionSet(canonicalQuestionSetFixture.slice(1)),
    ).toThrow(GeoContractError);
  });
});
