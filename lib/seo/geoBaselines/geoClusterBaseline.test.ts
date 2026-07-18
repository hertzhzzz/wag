import { loadQuestionSetCatalog, type QuestionSet } from "../questionSets";
import {
  hashBytes,
  hashUtf8Text,
  parseGeoRunRecord,
  type GeoObservation,
  type GeoPlatform,
  type GeoQuestionDefinition,
  type GeoRunManifest,
  type GeoRunRecord,
} from "../geo";
import {
  computeGeoQuestionSetDigest,
  evaluateGeoClusterBaseline,
  GeoBaselineContractError,
  type GeoClusterBaselineInput,
} from ".";

const PROJECT_ROOT = process.cwd();
const AS_OF = "2026-07-18T13:59:59.000Z";
const APPROVED_AT = "2026-07-18T00:00:00.000Z";
const OBSERVED_AT = "2026-07-18T01:00:00.000Z";
const SNAPSHOT_CONTENT = "Synthetic test fixture answer snapshot.\n";

function supplierVerificationQuestionSet(): QuestionSet {
  const questionSet = loadQuestionSetCatalog({
    projectRoot: PROJECT_ROOT,
  }).find(({ cluster }) => cluster === "supplier-verification");
  if (questionSet === undefined) {
    throw new Error("Synthetic test fixture question set is missing.");
  }
  return structuredClone(questionSet);
}

function approvedGate(digest: string) {
  return {
    status: "approved" as const,
    digest,
    approvedAt: APPROVED_AT,
    reviewerRole: "seo-reviewer" as const,
    evidencePath: "docs/seo/approvals/synthetic-question-set.json",
  };
}

function pendingGate(digest: string) {
  return {
    status: "pending" as const,
    digest,
    approvedAt: null,
    reviewerRole: null,
    evidencePath: null,
  };
}

function platformApprovals(
  approved: readonly GeoPlatform[] = [],
): GeoClusterBaselineInput["platformApprovals"] {
  const platforms: readonly GeoPlatform[] = [
    "chatgpt",
    "perplexity",
    "google-ai-overviews",
    "bing-copilot",
  ];
  return platforms.map((platform) =>
    approved.includes(platform)
      ? {
          platform,
          status: "approved" as const,
          approvedAt: APPROVED_AT,
          reviewerRole: "seo-reviewer" as const,
          evidencePath: `docs/seo/approvals/synthetic-${platform}.json`,
        }
      : {
          platform,
          status: "pending" as const,
          approvedAt: null,
          reviewerRole: null,
          evidencePath: null,
        },
  );
}

function makeInput(
  overrides: Partial<GeoClusterBaselineInput> = {},
): GeoClusterBaselineInput {
  const questionSet = supplierVerificationQuestionSet();
  const digest = computeGeoQuestionSetDigest(questionSet);
  return {
    schemaVersion: "geo-cluster-baseline-v1",
    asOf: AS_OF,
    claimMode: "observation-only",
    cluster: "supplier-verification",
    questionSet,
    questionSetApproval: pendingGate(digest),
    strictCutoverApproval: {
      ticket: "13",
      status: "pending",
      digest: null,
      approvedAt: null,
      reviewerRole: null,
      evidencePath: null,
    },
    platformApprovals: platformApprovals(),
    runs: [],
    snapshotContents: {},
    ...overrides,
  };
}

function questionDefinitions(
  questionSet: QuestionSet,
): GeoQuestionDefinition[] {
  return questionSet.questions.map((question) => ({
    questionId: question.id,
    cluster: questionSet.cluster,
    prompt: {
      version: `question-set-v${questionSet.version}`,
      text: question.prompt,
      hash: hashUtf8Text(question.prompt),
    },
    approval: {
      status: "approved",
      approvedAt: APPROVED_AT,
      reviewerRole: "seo-reviewer",
      evidencePath: `docs/seo/approvals/synthetic-${question.id}.json`,
    },
  }));
}

function makeSyntheticLiveRun(
  questionSet: QuestionSet,
  options: {
    platform?: GeoPlatform;
    observedAt?: string;
    misleadingQuestionId?: string;
  } = {},
): { run: GeoRunRecord; snapshotContents: Record<string, string> } {
  const platform = options.platform ?? "chatgpt";
  const questions = questionDefinitions(questionSet);
  const manifest: GeoRunManifest = {
    schemaVersion: "geo-schema-v1",
    methodologyVersion: "geo-methodology-v1",
    benchmarkVersion: "geo-benchmark-v1",
    questionSetVersion: `question-set-v${questionSet.version}`,
    runId: `run.synthetic.${platform}.001`,
    fixtureOnly: false,
    provenance: "external-platform-observation",
    platform,
    locale: "en-AU",
    device: "desktop",
    auth: "not-applicable",
    accountTier: "not-applicable",
    expectedRepetitions: 1,
    questions,
    evidencePath: `docs/seo/evidence/synthetic-${platform}-manifest.json`,
  };

  const snapshotContents: Record<string, string> = {};
  const observations: GeoObservation[] = questions.map((question, index) => {
    const suffix = String(index + 1).padStart(2, "0");
    const snapshotPath = `docs/seo/evidence/synthetic-${platform}-${suffix}.txt`;
    snapshotContents[snapshotPath] = SNAPSHOT_CONTENT;
    const misleading = question.questionId === options.misleadingQuestionId;
    return {
      schemaVersion: manifest.schemaVersion,
      methodologyVersion: manifest.methodologyVersion,
      benchmarkVersion: manifest.benchmarkVersion,
      questionSetVersion: manifest.questionSetVersion,
      runId: manifest.runId,
      observationId: `obs.synthetic.${platform}.${suffix}`,
      questionId: question.questionId,
      repetition: 1,
      cluster: question.cluster,
      platform,
      prompt: question.prompt,
      observedAt: options.observedAt ?? OBSERVED_AT,
      locale: manifest.locale,
      device: manifest.device,
      auth: manifest.auth,
      accountTier: manifest.accountTier,
      status: "observed-answer",
      statusReason: null,
      surface: {
        name: "Synthetic test answer surface",
        visibility: "visible",
        ordered: false,
        model: { name: null, visibility: "not-visible" },
      },
      snapshot: {
        path: snapshotPath,
        hash: hashBytes(SNAPSHOT_CONTENT),
        mimeType: "text/plain",
        capture: "text",
        redaction: {
          status: "not-required",
          policyVersion: "synthetic-redaction-v1",
        },
      },
      brandMention: false,
      citations: misleading
        ? [
            {
              citationId: `citation.synthetic.${suffix}`,
              url: "https://example.invalid/misleading",
              kind: "third-party",
              integrity: "misleading",
              evidencePath: `docs/seo/evidence/synthetic-citation-${suffix}.json`,
            },
          ]
        : [],
      competitors: [],
      review: {
        rubricVersion: "synthetic-rubric-v1",
        reviewedAt: options.observedAt ?? OBSERVED_AT,
        reviewerRole: "quality-reviewer",
        accuracy: "pass",
        completeness: "pass",
        citationIntegrity: misleading ? "misleading" : "pass",
        competitorPreference: "no-preference",
        evidencePath: `docs/seo/evidence/synthetic-review-${suffix}.json`,
      },
      evidencePath: `docs/seo/evidence/synthetic-observation-${suffix}.json`,
    };
  });

  return {
    run: parseGeoRunRecord({ manifest, observations }),
    snapshotContents,
  };
}

function fullyApprovedInput(
  overrides: Partial<GeoClusterBaselineInput> = {},
): GeoClusterBaselineInput {
  const questionSet = supplierVerificationQuestionSet();
  const digest = computeGeoQuestionSetDigest(questionSet);
  return makeInput({
    questionSet,
    questionSetApproval: approvedGate(digest),
    strictCutoverApproval: {
      ticket: "13",
      status: "approved",
      digest:
        "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      approvedAt: APPROVED_AT,
      reviewerRole: "seo-reviewer",
      evidencePath: "docs/seo/approvals/synthetic-ticket-13.json",
    },
    platformApprovals: platformApprovals(["chatgpt"]),
    ...overrides,
  });
}

describe("evaluateGeoClusterBaseline", () => {
  it("covers every canonical cluster without treating draft questions as approved baselines", () => {
    const catalog = loadQuestionSetCatalog({ projectRoot: PROJECT_ROOT });

    expect(catalog).toHaveLength(5);
    for (const questionSet of catalog) {
      const report = evaluateGeoClusterBaseline(
        makeInput({
          cluster: questionSet.cluster,
          questionSet: structuredClone(questionSet),
          questionSetApproval: pendingGate(
            computeGeoQuestionSetDigest(questionSet),
          ),
        }),
      );

      expect(questionSet.questions).toHaveLength(10);
      expect(report.cluster).toBe(questionSet.cluster);
      expect(report.questionSet.approved).toBe(false);
      expect(report.executable).toBe(false);
      expect(report.complete).toBe(false);
      expect(report.metrics).toBeNull();
    }
  });

  it("fails closed with null metrics when approvals and live observations are absent", () => {
    const report = evaluateGeoClusterBaseline(makeInput());

    expect(report.executable).toBe(false);
    expect(report.complete).toBe(false);
    expect(report.metrics).toBeNull();
    expect(report.observationCount).toBe(0);
    expect(report.reasons).toEqual([
      "no-approved-platforms",
      "no-live-observations",
      "question-set-unapproved",
      "strict-cutover-unapproved",
    ]);
    expect(report.methodologyStatement).toContain("observation baseline");
    expect(report.methodologyStatement).not.toMatch(/caused|improved because/i);
  });

  it("accepts a complete, approved synthetic test construction without persisting a fake baseline", () => {
    const questionSet = supplierVerificationQuestionSet();
    const synthetic = makeSyntheticLiveRun(questionSet);
    const input = fullyApprovedInput({
      questionSet,
      runs: [synthetic.run],
      snapshotContents: synthetic.snapshotContents,
    });

    const first = evaluateGeoClusterBaseline(input);
    const second = evaluateGeoClusterBaseline(structuredClone(input));

    expect(first.executable).toBe(true);
    expect(first.complete).toBe(true);
    expect(first.reasons).toEqual([]);
    expect(first.observationCount).toBe(10);
    expect(first.expectedObservationCount).toBe(10);
    expect(first.metrics).not.toBeNull();
    expect(first.reportDigest).toBe(second.reportDigest);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.platforms)).toBe(true);

    input.runs[0].manifest.runId = "run.mutated.after-evaluation";
    expect(first.runIds).toEqual(["run.synthetic.chatgpt.001"]);
  });

  it("rejects malformed question sets, duplicate observations, and causal claim modes", () => {
    const malformed = makeInput();
    (malformed.questionSet as QuestionSet).questions =
      malformed.questionSet.questions.slice(0, 9) as QuestionSet["questions"];
    expect(() => evaluateGeoClusterBaseline(malformed)).toThrow(
      GeoBaselineContractError,
    );

    const questionSet = supplierVerificationQuestionSet();
    const synthetic = makeSyntheticLiveRun(questionSet);
    const duplicate = structuredClone(synthetic.run);
    duplicate.observations.push(structuredClone(duplicate.observations[0]));
    expect(() =>
      evaluateGeoClusterBaseline(
        fullyApprovedInput({
          questionSet,
          runs: [duplicate],
          snapshotContents: synthetic.snapshotContents,
        }),
      ),
    ).toThrow(GeoBaselineContractError);

    expect(() =>
      evaluateGeoClusterBaseline({
        ...makeInput(),
        claimMode: "causal" as "observation-only",
      }),
    ).toThrow(GeoBaselineContractError);
  });

  it("detects question wording drift and unapproved platform observations", () => {
    const questionSet = supplierVerificationQuestionSet();
    const synthetic = makeSyntheticLiveRun(questionSet, {
      platform: "perplexity",
    });
    const drifted = structuredClone(synthetic.run);
    const prompt = `${drifted.manifest.questions[0].prompt.text} Changed?`;
    drifted.manifest.questions[0].prompt = {
      ...drifted.manifest.questions[0].prompt,
      text: prompt,
      hash: hashUtf8Text(prompt),
    };
    drifted.observations[0].prompt = drifted.manifest.questions[0].prompt;

    const report = evaluateGeoClusterBaseline(
      fullyApprovedInput({
        questionSet,
        runs: [drifted],
        snapshotContents: synthetic.snapshotContents,
      }),
    );

    expect(report.complete).toBe(false);
    expect(report.reasons).toEqual([
      "incomplete-observation-slots",
      "question-set-drift",
      "unapproved-platform-observation",
    ]);
  });

  it("rejects invalid dates and blocks future observations relative to explicit asOf", () => {
    const invalid = makeInput({ asOf: "2026-02-30T00:00:00.000Z" });
    expect(() => evaluateGeoClusterBaseline(invalid)).toThrow(
      GeoBaselineContractError,
    );

    const questionSet = supplierVerificationQuestionSet();
    const synthetic = makeSyntheticLiveRun(questionSet, {
      observedAt: "2026-07-18T14:00:00.000Z",
    });
    const report = evaluateGeoClusterBaseline(
      fullyApprovedInput({
        questionSet,
        runs: [synthetic.run],
        snapshotContents: synthetic.snapshotContents,
      }),
    );

    expect(report.complete).toBe(false);
    expect(report.reasons).toContain("future-observation");
  });

  it("requires raw snapshot evidence and preserves missing metrics as null rather than zero", () => {
    const questionSet = supplierVerificationQuestionSet();
    const synthetic = makeSyntheticLiveRun(questionSet);
    const missingSnapshot = structuredClone(synthetic.run);
    missingSnapshot.observations[0].snapshot = null;
    expect(() =>
      evaluateGeoClusterBaseline(
        fullyApprovedInput({
          questionSet,
          runs: [missingSnapshot],
          snapshotContents: synthetic.snapshotContents,
        }),
      ),
    ).toThrow(GeoBaselineContractError);

    const empty = evaluateGeoClusterBaseline(fullyApprovedInput());
    expect(empty.metrics).toBeNull();
    expect(empty.complete).toBe(false);
    expect(empty.observationCount).toBe(0);
  });

  it("surfaces misleading citation risks separately from baseline completeness", () => {
    const questionSet = supplierVerificationQuestionSet();
    const synthetic = makeSyntheticLiveRun(questionSet, {
      misleadingQuestionId: questionSet.questions[0].id,
    });
    const report = evaluateGeoClusterBaseline(
      fullyApprovedInput({
        questionSet,
        runs: [synthetic.run],
        snapshotContents: synthetic.snapshotContents,
      }),
    );

    expect(report.complete).toBe(true);
    expect(report.qualityRisks.misleadingCitationObservationIds).toEqual([
      "obs.synthetic.chatgpt.01",
    ]);
    expect(report.metrics?.citationIntegrity.rate).toBeLessThan(1);
  });
});
