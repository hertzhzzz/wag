import { join } from "node:path";

import { CANONICAL_CLUSTER_IDS } from "../clusterSchema";
import {
  compareUnicodeCodePoints,
  hashBytes,
  type GeoObservation,
  type GeoQuestionDefinition,
  type GeoRunRecord,
} from "../geo";
import { loadQuestionSetCatalog, type QuestionSet } from "../questionSets";
import {
  GEO_BENCHMARK_CATALOG_ROOT,
  GEO_BENCHMARK_INPUT_MANIFEST_VERSION,
  GeoBenchmarkContractError,
  GeoBenchmarkFixtureIsolationError,
  GeoBenchmarkJsonError,
  GeoBenchmarkManifestError,
  GeoBenchmarkVersionDriftError,
  aggregateGeoBenchmarkPeriod,
  assertGeoBenchmarkDefinitionIntegrity,
  assertGeoBenchmarkVersionTransition,
  compareGeoBenchmarkPeriods,
  createGeoBenchmarkProductionEvidenceBoundary,
  createGeoBenchmarkSyntheticEvidenceBoundary,
  createGeoBenchmarkDefinition,
  createGeoBenchmarkDefinitionFromManifest,
  createGeoBenchmarkDefinitionFromManifestJson,
  createGeoBenchmarkVersionIdentity,
  deepFreezeGeoBenchmark,
  parseStrictGeoBenchmarkJson,
  projectGeoBenchmarkRunLineage,
  renderGeoBenchmarkMethodology,
  renderGeoBenchmarkReport,
  summarizeGeoBenchmarkLineage,
  validateGeoBenchmarkInputManifest,
  type GeoBenchmarkDefinition,
  type GeoBenchmarkInputManifest,
  type GeoBenchmarkMethodologyInput,
  type GeoBenchmarkPeriodResult,
  type GeoBenchmarkProductionRunEnvelope,
  type GeoBenchmarkPublicationApprovals,
  type GeoBenchmarkRunEnvelope,
} from "./index";

const PROJECT_ROOT = join(__dirname, "..", "..", "..");
const QUESTION_SETS = loadQuestionSetCatalog({ projectRoot: PROJECT_ROOT });

const BASE_METHODOLOGY: GeoBenchmarkMethodologyInput = {
  benchmarkVersion: "geo-50-v1",
  methodologyVersion: "geo-method-v1",
  questionSetVersion: "geo-questions-v1",
  observationSchemaVersion: "geo-contract-v1",
  platforms: ["perplexity", "chatgpt"],
  locale: "en-AU",
  timing: {
    asOf: "2026-07-18T00:00:00+09:30",
    cadence: "monthly",
    timezone: "Australia/Adelaide",
  },
  repetitions: 2,
  scoringVersion: "geo-score-v1",
  citationCapture: {
    mode: "manual-snapshot-review",
    captureOwnedUrls: true,
    captureCompetitorUrls: true,
    requireSnapshotEvidence: true,
    redactionPolicyVersion: "geo-redaction-v1",
  },
  knownVariability: [
    "Retrieval state and source freshness can change between captures.",
    "Answer-engine outputs can vary across sessions, models, account tiers, and surfaces.",
  ],
};

const BASE_PERIOD = {
  periodId: "2026-07-baseline",
  observedFrom: "2026-07-18T00:00:00+09:30",
  observedThrough: "2026-07-31T23:59:59+09:30",
} as const;

function cloneQuestionSets(): QuestionSet[] {
  return JSON.parse(JSON.stringify(QUESTION_SETS)) as QuestionSet[];
}

function makeDefinition(
  methodology: GeoBenchmarkMethodologyInput = BASE_METHODOLOGY,
  questionSets: readonly QuestionSet[] = QUESTION_SETS,
): GeoBenchmarkDefinition {
  return createGeoBenchmarkDefinition({ methodology, questionSets });
}

function makeFixtureEnvelope(
  definition: GeoBenchmarkDefinition,
): GeoBenchmarkRunEnvelope {
  const selectedQuestions = definition.questionSet.questions.slice(0, 4);
  const questions: GeoQuestionDefinition[] = selectedQuestions.map(
    (question, index) => ({
      questionId: question.questionId,
      cluster: question.cluster,
      prompt: {
        version: definition.questionSet.version,
        text: question.prompt,
        hash: question.promptHash,
      },
      approval: {
        status: "approved",
        approvedAt: "2026-07-18T01:00:00+09:30",
        reviewerRole: "seo-reviewer",
        evidencePath: `lib/seo/geoBenchmark/fixtures/approval-${index + 1}.json`,
      },
    }),
  );
  const manifest = {
    schemaVersion: definition.methodology.observationSchemaVersion,
    methodologyVersion: definition.methodology.methodologyVersion,
    benchmarkVersion: definition.identity.benchmarkVersion,
    questionSetVersion: definition.questionSet.version,
    runId: "run.fixture.geo-benchmark.001",
    fixtureOnly: true,
    provenance: "synthetic-fixture" as const,
    platform: "chatgpt" as const,
    locale: definition.methodology.locale,
    device: "desktop" as const,
    auth: "signed-out" as const,
    accountTier: "free" as const,
    expectedRepetitions: 1,
    questions,
    evidencePath: "lib/seo/geoBenchmark/fixtures/run.json",
  };
  const versions = {
    schemaVersion: manifest.schemaVersion,
    methodologyVersion: manifest.methodologyVersion,
    benchmarkVersion: manifest.benchmarkVersion,
    questionSetVersion: manifest.questionSetVersion,
  };
  const context = {
    ...versions,
    runId: manifest.runId,
    repetition: 1,
    platform: manifest.platform,
    locale: manifest.locale,
    device: manifest.device,
    auth: manifest.auth,
    accountTier: manifest.accountTier,
  };
  const observedAnswer: GeoObservation = {
    ...context,
    observationId: "obs.fixture.geo-benchmark.answer.001",
    questionId: questions[0].questionId,
    cluster: questions[0].cluster,
    prompt: questions[0].prompt,
    observedAt: "2026-07-18T02:00:00+09:30",
    status: "observed-answer",
    statusReason: null,
    surface: {
      name: "Fixture answer surface",
      visibility: "visible",
      ordered: true,
      model: { name: "Fixture model", visibility: "visible" },
    },
    snapshot: {
      path: "lib/seo/geoBenchmark/fixtures/answer.txt",
      hash: hashBytes("fixture answer\n"),
      mimeType: "text/plain",
      capture: "text",
      redaction: {
        status: "not-required",
        policyVersion: "geo-redaction-v1",
      },
    },
    brandMention: true,
    citations: [
      {
        citationId: "citation.fixture.owned.001",
        url: "https://fixture.invalid/owned-source",
        kind: "owned",
        integrity: "supports",
        rank: 1,
        evidencePath: "lib/seo/geoBenchmark/fixtures/citation-owned-001.json",
      },
    ],
    competitors: [
      {
        competitorId: "competitor.fixture.001",
        label: "Fixture competitor",
        mentioned: true,
        cited: false,
        preferred: false,
        rank: 2,
        evidencePath: "lib/seo/geoBenchmark/fixtures/competitor-001.json",
      },
    ],
    review: {
      rubricVersion: "geo-rubric-v1",
      reviewedAt: "2026-07-18T03:00:00+09:30",
      reviewerRole: "quality-reviewer",
      accuracy: "pass",
      completeness: "fail",
      citationIntegrity: "pass",
      competitorPreference: "brand-preferred",
      evidencePath: "lib/seo/geoBenchmark/fixtures/review-001.json",
    },
    evidencePath: "lib/seo/geoBenchmark/fixtures/observation-answer.json",
  };
  const observedAbsent: GeoObservation = {
    ...context,
    observationId: "obs.fixture.geo-benchmark.absent.001",
    questionId: questions[1].questionId,
    cluster: questions[1].cluster,
    prompt: questions[1].prompt,
    observedAt: "2026-07-18T02:05:00+09:30",
    status: "observed-surface-absent",
    statusReason: null,
    surface: {
      name: null,
      visibility: "not-visible",
      ordered: false,
      model: { name: null, visibility: "not-applicable" },
    },
    snapshot: {
      path: "lib/seo/geoBenchmark/fixtures/surface-absent.txt",
      hash: hashBytes("fixture surface absent\n"),
      mimeType: "text/plain",
      capture: "text",
      redaction: {
        status: "not-required",
        policyVersion: "geo-redaction-v1",
      },
    },
    brandMention: false,
    citations: [],
    competitors: [],
    review: null,
    evidencePath: "lib/seo/geoBenchmark/fixtures/observation-absent.json",
  };
  const blocked: GeoObservation = {
    ...context,
    observationId: "obs.fixture.geo-benchmark.blocked.001",
    questionId: questions[2].questionId,
    cluster: questions[2].cluster,
    prompt: questions[2].prompt,
    observedAt: "2026-07-18T02:10:00+09:30",
    status: "blocked",
    statusReason: "access-blocked",
    surface: {
      name: null,
      visibility: "not-visible",
      ordered: false,
      model: { name: null, visibility: "not-applicable" },
    },
    snapshot: null,
    brandMention: null,
    citations: [],
    competitors: [],
    review: null,
    evidencePath: "lib/seo/geoBenchmark/fixtures/observation-blocked.json",
  };
  const unavailable: GeoObservation = {
    ...context,
    observationId: "obs.fixture.geo-benchmark.unavailable.001",
    questionId: questions[3].questionId,
    cluster: questions[3].cluster,
    prompt: questions[3].prompt,
    observedAt: "2026-07-18T02:15:00+09:30",
    status: "unavailable",
    statusReason: "surface-unavailable",
    surface: {
      name: null,
      visibility: "not-visible",
      ordered: false,
      model: { name: null, visibility: "not-applicable" },
    },
    snapshot: null,
    brandMention: null,
    citations: [],
    competitors: [],
    review: null,
    evidencePath: "lib/seo/geoBenchmark/fixtures/observation-unavailable.json",
  };
  const record: GeoRunRecord = {
    manifest,
    observations: [blocked, unavailable, observedAbsent, observedAnswer],
  };

  return {
    dataClass: "fixture",
    visibility: "non_public",
    record,
  };
}

function captureError(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  throw new Error("Expected the action to fail closed.");
}

function makeInputManifest(): GeoBenchmarkInputManifest {
  const definition = makeDefinition();
  const snapshots = cloneQuestionSets()
    .map((questionSet) => {
      const content = `${JSON.stringify(questionSet)}\n`;
      return {
        path: `${GEO_BENCHMARK_CATALOG_ROOT}/${questionSet.cluster}.json`,
        digest: hashBytes(content),
        content,
      };
    })
    .reverse();

  return {
    manifestVersion: GEO_BENCHMARK_INPUT_MANIFEST_VERSION,
    catalogRoot: GEO_BENCHMARK_CATALOG_ROOT,
    versionIdentity: definition.identity.versionIdentity,
    methodology: {
      ...BASE_METHODOLOGY,
      versionIdentity: definition.identity.versionIdentity,
    },
    questionSets: snapshots,
  };
}

function makePartialProductionEnvelope(definition: GeoBenchmarkDefinition): {
  envelope: GeoBenchmarkProductionRunEnvelope;
  snapshotContents: Readonly<Record<string, string>>;
} {
  const fixture = makeFixtureEnvelope(definition);
  const fixtureAnswer = fixture.record.observations.find(
    ({ status }) => status === "observed-answer",
  );
  if (fixtureAnswer === undefined || fixtureAnswer.snapshot === null) {
    throw new Error("Fixture answer helper must include snapshot evidence.");
  }

  const questions: GeoQuestionDefinition[] =
    definition.questionSet.questions.map((question, index) => ({
      questionId: question.questionId,
      cluster: question.cluster,
      prompt: {
        version: definition.questionSet.promptVersion,
        text: question.prompt,
        hash: question.promptHash,
      },
      approval: {
        status: "approved",
        approvedAt: "2026-07-18T01:00:00+09:30",
        reviewerRole: "seo-reviewer",
        evidencePath: `lib/seo/geoBenchmark/approvals/production-${index + 1}.json`,
      },
    }));
  const manifest = {
    schemaVersion: definition.methodology.observationSchemaVersion,
    methodologyVersion: definition.methodology.methodologyVersion,
    benchmarkVersion: definition.identity.benchmarkVersion,
    questionSetVersion: definition.questionSet.version,
    runId: "run.production.geo-benchmark.partial.001",
    fixtureOnly: false,
    provenance: "external-platform-observation" as const,
    platform: "chatgpt" as const,
    locale: definition.methodology.locale,
    device: "desktop" as const,
    auth: "signed-out" as const,
    accountTier: "free" as const,
    expectedRepetitions: definition.methodology.repetitions,
    questions,
    evidencePath: "lib/seo/geoBenchmark/evidence/run.partial.json",
  };
  const question = questions[0];
  const partialSnapshot = {
    ...fixtureAnswer.snapshot,
    path: "lib/seo/geoBenchmark/evidence/answer.partial.txt",
  };
  const observation: GeoObservation = {
    ...fixtureAnswer,
    schemaVersion: manifest.schemaVersion,
    methodologyVersion: manifest.methodologyVersion,
    benchmarkVersion: manifest.benchmarkVersion,
    questionSetVersion: manifest.questionSetVersion,
    runId: manifest.runId,
    observationId: "obs.production.geo-benchmark.partial.001",
    questionId: question.questionId,
    cluster: question.cluster,
    prompt: question.prompt,
    observedAt: "2026-07-18T02:00:00+09:30",
    evidencePath: "lib/seo/geoBenchmark/evidence/observation.partial.json",
    snapshot: partialSnapshot,
  };

  return {
    envelope: {
      dataClass: "production",
      visibility: "internal",
      versionIdentity: definition.identity.versionIdentity,
      record: { manifest, observations: [observation] },
    },
    snapshotContents: {
      [partialSnapshot.path]: "fixture answer\n",
    },
  };
}

function makeApprovedPublicationApprovals(): GeoBenchmarkPublicationApprovals {
  const approved = (
    reviewerRole: Exclude<
      GeoBenchmarkPublicationApprovals["quality"]["reviewerRole"],
      null
    >,
    name: string,
  ) => ({
    status: "approved" as const,
    approvedAt: "2026-07-18T04:00:00+09:30",
    reviewerRole,
    evidencePath: `lib/seo/geoBenchmark/approvals/${name}.json`,
  });
  return {
    questionSet: approved("subject-matter-reviewer", "question-set"),
    quality: approved("quality-reviewer", "quality"),
    retention: approved("privacy-reviewer", "retention"),
    privacy: approved("privacy-reviewer", "privacy"),
    publication: approved("publication-reviewer", "publication"),
  };
}

function makeCompleteProductionInput(
  definition: GeoBenchmarkDefinition,
  options: {
    readonly runLabel?: string;
    readonly observedAt?: string;
    readonly answerVariant?: "baseline" | "rerun";
  } = {},
) {
  const runLabel = options.runLabel ?? "baseline";
  const observedAt = options.observedAt ?? "2026-07-18T02:00:00+09:30";
  const answerVariant = options.answerVariant ?? "baseline";
  const fixture = makeFixtureEnvelope(definition);
  const fixtureAnswer = fixture.record.observations.find(
    ({ status }) => status === "observed-answer",
  );
  if (fixtureAnswer === undefined || fixtureAnswer.snapshot === null) {
    throw new Error("Fixture answer helper must include snapshot evidence.");
  }
  const fixtureSnapshot = fixtureAnswer.snapshot;
  const questions: GeoQuestionDefinition[] =
    definition.questionSet.questions.map((question, index) => ({
      questionId: question.questionId,
      cluster: question.cluster,
      prompt: {
        version: definition.questionSet.promptVersion,
        text: question.prompt,
        hash: question.promptHash,
      },
      approval: {
        status: "approved",
        approvedAt: "2026-07-18T01:00:00+09:30",
        reviewerRole: "seo-reviewer",
        evidencePath: `lib/seo/geoBenchmark/approvals/production-${index + 1}.json`,
      },
    }));
  const snapshotContents: Record<string, string> = {};
  const runs: GeoBenchmarkProductionRunEnvelope[] =
    definition.methodology.platforms.map((platform) => {
      const runId = `run.production.geo-benchmark.complete.${runLabel}.${platform}`;
      const observations: GeoObservation[] = [];
      for (const question of questions) {
        for (
          let repetition = 1;
          repetition <= definition.methodology.repetitions;
          repetition += 1
        ) {
          const snapshotPath = `lib/seo/geoBenchmark/evidence/${runLabel}-${platform}-${question.questionId}-${repetition}.txt`;
          const evidencePath = `lib/seo/geoBenchmark/evidence/${runLabel}-${platform}-${question.questionId}-${repetition}.json`;
          const observation: GeoObservation = {
            ...fixtureAnswer,
            schemaVersion: definition.methodology.observationSchemaVersion,
            methodologyVersion: definition.methodology.methodologyVersion,
            benchmarkVersion: definition.identity.benchmarkVersion,
            questionSetVersion: definition.questionSet.version,
            runId,
            observationId: `obs.production.geo-benchmark.complete.${runLabel}.${platform}.${question.questionId}.${repetition}`,
            questionId: question.questionId,
            cluster: question.cluster,
            prompt: question.prompt,
            repetition,
            platform,
            observedAt,
            evidencePath,
            snapshot: { ...fixtureSnapshot, path: snapshotPath },
            brandMention:
              answerVariant === "baseline" ? fixtureAnswer.brandMention : false,
            citations:
              answerVariant === "baseline" ? fixtureAnswer.citations : [],
            competitors:
              answerVariant === "baseline" ? fixtureAnswer.competitors : [],
            review:
              answerVariant === "baseline"
                ? fixtureAnswer.review
                : fixtureAnswer.review === null
                  ? null
                  : {
                      ...fixtureAnswer.review,
                      accuracy: "fail" as const,
                      completeness: "pass" as const,
                      competitorPreference: "no-preference" as const,
                    },
          };
          observations.push(observation);
          snapshotContents[snapshotPath] = "fixture answer\n";
        }
      }
      return {
        dataClass: "production" as const,
        visibility: "internal" as const,
        versionIdentity: definition.identity.versionIdentity,
        record: {
          manifest: {
            schemaVersion: definition.methodology.observationSchemaVersion,
            methodologyVersion: definition.methodology.methodologyVersion,
            benchmarkVersion: definition.identity.benchmarkVersion,
            questionSetVersion: definition.questionSet.version,
            runId,
            fixtureOnly: false,
            provenance: "external-platform-observation" as const,
            platform,
            locale: definition.methodology.locale,
            device: "desktop" as const,
            auth: "signed-out" as const,
            accountTier: "free" as const,
            expectedRepetitions: definition.methodology.repetitions,
            questions,
            evidencePath: `lib/seo/geoBenchmark/evidence/${runLabel}-${platform}-complete.json`,
          },
          observations,
        },
      };
    });
  return { runs, snapshotContents };
}

function aggregateTestPeriod(input: unknown): GeoBenchmarkPeriodResult {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return aggregateGeoBenchmarkPeriod(input);
  }
  const record = input as Record<string, unknown>;
  const trustedRuns = new WeakSet<object>();
  if (Array.isArray(record.runs)) {
    for (const run of record.runs) {
      if (run !== null && typeof run === "object") {
        trustedRuns.add(run);
      }
    }
  }
  const trustedApprovals = new WeakSet<object>();
  if (
    record.approvals !== null &&
    typeof record.approvals === "object" &&
    !Array.isArray(record.approvals)
  ) {
    for (const approval of Object.values(record.approvals)) {
      if (approval !== null && typeof approval === "object") {
        trustedApprovals.add(approval);
      }
    }
  }
  // Unit-only identity boundary: it proves structural copies fail closed, but it
  // is not production provenance and must never be cited as an actual baseline.
  const evidenceBoundary = createGeoBenchmarkProductionEvidenceBoundary({
    verifyRun: (run) => trustedRuns.has(run),
    verifyApproval: (_approvalName, rawApproval) =>
      rawApproval !== null &&
      typeof rawApproval === "object" &&
      trustedApprovals.has(rawApproval),
  });
  return aggregateGeoBenchmarkPeriod({ ...record, evidenceBoundary });
}

function expectDeepFrozen(value: unknown, seen = new Set<object>()): void {
  if (value === null || typeof value !== "object" || seen.has(value)) {
    return;
  }
  seen.add(value);
  expect(Object.isFrozen(value)).toBe(true);
  Object.values(value).forEach((nested) => expectDeepFrozen(nested, seen));
}

describe("50-question GEO benchmark contract", () => {
  it("accepts exactly five canonical clusters with ten globally unique questions each", () => {
    const definition = makeDefinition();

    expect(definition.questionSet.questions).toHaveLength(50);
    expect(definition.questionSet.clusterCounts).toEqual(
      Object.fromEntries(CANONICAL_CLUSTER_IDS.map((cluster) => [cluster, 10])),
    );
    expect(
      new Set(
        definition.questionSet.questions.map(({ questionId }) => questionId),
      ).size,
    ).toBe(50);
    expect(
      new Set(
        definition.questionSet.questions.map(
          ({ normalizedPrompt }) => normalizedPrompt,
        ),
      ).size,
    ).toBe(50);
    expect(definition.questionSet.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(definition.methodology.questionSetDigest).toBe(
      definition.questionSet.digest,
    );
    expect(definition.methodology.platforms).toEqual(["chatgpt", "perplexity"]);

    const questionKeys = definition.questionSet.questions.map(
      ({ cluster, questionId }) => `${cluster}:${questionId}`,
    );
    expect(questionKeys).toEqual(
      [...questionKeys].sort(compareUnicodeCodePoints),
    );
  });

  it("rejects missing clusters, wrong distribution, duplicate IDs, and duplicate normalized prompts", () => {
    expect(() =>
      makeDefinition(BASE_METHODOLOGY, QUESTION_SETS.slice(0, 4)),
    ).toThrow(/five canonical clusters|50 questions/i);

    const duplicateId = cloneQuestionSets();
    duplicateId[1].questions[0].id = duplicateId[0].questions[0].id;
    expect(() => makeDefinition(BASE_METHODOLOGY, duplicateId)).toThrow(
      /duplicate question id/i,
    );

    const duplicatePrompt = cloneQuestionSets();
    duplicatePrompt[1].questions[0].prompt =
      duplicatePrompt[0].questions[0].prompt;
    expect(() => makeDefinition(BASE_METHODOLOGY, duplicatePrompt)).toThrow(
      /duplicate normalized question prompt/i,
    );
  });

  it("rejects question IDs that cross the canonical cluster namespace", () => {
    const crossNamespace = cloneQuestionSets();
    crossNamespace[0].questions[0].id = `${crossNamespace[1].cluster}-99`;

    expect(() => makeDefinition(BASE_METHODOLOGY, crossNamespace)).toThrow(
      /namespace|cluster/i,
    );
  });

  it("rejects causal claims in otherwise schema-valid neutral prompts", () => {
    const causalPrompt = cloneQuestionSets();
    causalPrompt[0].questions[0].prompt =
      "Which supplier practices cause the most reliable sourcing outcome?";

    expect(() => makeDefinition(BASE_METHODOLOGY, causalPrompt)).toThrow(
      /neutral|causal|claim/i,
    );
  });

  it("does not reject neutral implementation wording as a ranking claim", () => {
    const definition = makeDefinition({
      ...BASE_METHODOLOGY,
      knownVariability: [
        "Leading whitespace differences are normalized before prompt comparison.",
      ],
    });
    expect(definition.methodology.knownVariability).toEqual([
      "Leading whitespace differences are normalized before prompt comparison.",
    ]);
  });

  it("allows neutral variability wording without treating change as causal", () => {
    const definition = makeDefinition({
      ...BASE_METHODOLOGY,
      knownVariability: [
        "Observed response counts can increase or decrease between captures.",
        "Formatting may improve across sessions.",
        "A preferred output format may vary by surface.",
      ],
    });

    expect(definition.methodology.knownVariability).toEqual([
      "A preferred output format may vary by surface.",
      "Formatting may improve across sessions.",
      "Observed response counts can increase or decrease between captures.",
    ]);
  });

  it("still rejects explicit outcome and provider-preference claims", () => {
    expect(() =>
      makeDefinition({
        ...BASE_METHODOLOGY,
        knownVariability: ["This method improves citation visibility."],
      }),
    ).toThrow(/neutral|claim|causal/i);
    expect(() =>
      makeDefinition({
        ...BASE_METHODOLOGY,
        knownVariability: [
          "The answer should identify the preferred provider.",
        ],
      }),
    ).toThrow(/neutral|claim|preference/i);
  });

  it("rejects unsafe known-variability claims instead of rendering them", () => {
    expect(() =>
      makeDefinition({
        ...BASE_METHODOLOGY,
        knownVariability: [
          "Winning Adventure Global is the best sourcing partner and guarantees results.",
        ],
      }),
    ).toThrow(/neutral|claim|ranking|guarantee/i);
  });

  it("deep-freezes an isolated clone without freezing or aliasing the caller input", () => {
    const source = { nested: { values: ["before"] } };
    const frozen = deepFreezeGeoBenchmark(source);

    expect(frozen).not.toBe(source);
    expect(Object.isFrozen(source)).toBe(false);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.nested)).toBe(true);

    source.nested.values.push("after");
    expect(frozen.nested.values).toEqual(["before"]);
  });

  it("exposes stable error metadata for catalog violations", () => {
    const duplicateId = cloneQuestionSets();
    duplicateId[1].questions[0].id = duplicateId[0].questions[0].id;

    let caught: unknown;
    try {
      makeDefinition(BASE_METHODOLOGY, duplicateId);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(GeoBenchmarkContractError);
    expect(caught).toMatchObject({
      code: "GEO_BENCHMARK_CONTRACT",
      reason: "duplicate_question_id",
    });
  });

  it("derives a stable identity and refuses silent version drift", () => {
    const previous = makeDefinition();
    const changedPlatforms = makeDefinition({
      ...BASE_METHODOLOGY,
      platforms: ["chatgpt", "bing-copilot"],
    });

    expect(previous).toEqual(makeDefinition());
    expect(previous.identity.benchmarkDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(previous.identity.benchmarkId).toContain("geo-50-v1");
    expect(() =>
      assertGeoBenchmarkVersionTransition(previous, changedPlatforms),
    ).toThrow(GeoBenchmarkVersionDriftError);

    const changedScoring = makeDefinition({
      ...BASE_METHODOLOGY,
      scoringVersion: "geo-score-v2",
    });
    expect(changedScoring.identity.benchmarkDigest).not.toBe(
      previous.identity.benchmarkDigest,
    );
    expect(() =>
      assertGeoBenchmarkVersionTransition(previous, changedScoring),
    ).toThrow(GeoBenchmarkVersionDriftError);

    const versionedChange = makeDefinition({
      ...BASE_METHODOLOGY,
      benchmarkVersion: "geo-50-v2",
      methodologyVersion: "geo-method-v2",
      platforms: ["chatgpt", "bing-copilot"],
    });
    expect(() =>
      assertGeoBenchmarkVersionTransition(previous, versionedChange),
    ).not.toThrow();

    const changedQuestions = cloneQuestionSets();
    changedQuestions[0].questions[0].prompt =
      "Which official registration records can an Australian importer verify before engaging a supplier in China?";
    const silentlyChangedQuestions = makeDefinition(
      {
        ...BASE_METHODOLOGY,
        benchmarkVersion: "geo-50-v2",
      },
      changedQuestions,
    );
    expect(() =>
      assertGeoBenchmarkVersionTransition(previous, silentlyChangedQuestions),
    ).toThrow(/question-set version/i);
  });
});

describe("strict benchmark input boundaries", () => {
  it("binds flat versions to one complete identity and rejects supplied drift", () => {
    const definition = makeDefinition();
    const identity = definition.identity.versionIdentity;

    expect(definition.methodology.versionIdentity).toEqual(identity);
    expect(definition.methodology.benchmarkVersion).toBe(
      identity.benchmarkVersion,
    );
    expect(definition.methodology.methodologyVersion).toBe(
      identity.methodologyVersion,
    );
    expect(definition.methodology.questionSetVersion).toBe(
      identity.questionSetVersion,
    );
    expect(definition.methodology.observationSchemaVersion).toBe(
      identity.observationSchemaVersion,
    );
    expect(definition.methodology.scoringVersion).toBe(identity.scoringVersion);
    expect(definition.methodology.citationCapture.redactionPolicyVersion).toBe(
      identity.redactionPolicyVersion,
    );

    const error = captureError(() =>
      makeDefinition({
        ...BASE_METHODOLOGY,
        versionIdentity: {
          ...identity,
          scoringVersion: "geo-score-v2",
        },
      }),
    );
    expect(error).toBeInstanceOf(GeoBenchmarkVersionDriftError);
    expect(error).toMatchObject({
      code: "GEO_BENCHMARK_VERSION_DRIFT",
      reason: "version_identity_mismatch",
    });
  });

  it("rejects an explicit null schema version instead of silently defaulting it", () => {
    const error = captureError(() =>
      createGeoBenchmarkVersionIdentity({
        schemaVersion: null,
        benchmarkVersion: "geo-50-v1",
        methodologyVersion: "geo-method-v1",
        questionSetVersion: "geo-questions-v1",
        observationSchemaVersion: "geo-contract-v1",
        scoringVersion: "geo-score-v1",
        redactionPolicyVersion: "geo-redaction-v1",
      }),
    );
    expect(error).toBeInstanceOf(GeoBenchmarkContractError);
    expect(error).toMatchObject({
      code: "GEO_BENCHMARK_CONTRACT",
      reason: "invalid_version",
    });
  });

  it("rejects unexpected methodology fields instead of dropping them from the digest", () => {
    const error = captureError(() =>
      makeDefinition({
        ...BASE_METHODOLOGY,
        unexpectedField: "must-not-be-dropped",
      } as GeoBenchmarkMethodologyInput & { unexpectedField: string }),
    );
    expect(error).toBeInstanceOf(GeoBenchmarkContractError);
    expect(error).toMatchObject({
      code: "GEO_BENCHMARK_CONTRACT",
      reason: "contract_violation",
    });
  });

  it("rejects BOM, duplicate decoded keys, invalid JSON, and non-finite values with stable reasons", () => {
    const cases = [
      { source: '\uFEFF{"ok":true}', reason: "bom_not_allowed" },
      {
        source: '{"question":1,"\\u0071uestion":2}',
        reason: "duplicate_json_key",
      },
      { source: '{"value":NaN}', reason: "invalid_json" },
      { source: '{"value":1e999}', reason: "invalid_json_value" },
    ] as const;

    for (const testCase of cases) {
      const error = captureError(() =>
        parseStrictGeoBenchmarkJson(testCase.source),
      );
      expect(error).toBeInstanceOf(GeoBenchmarkJsonError);
      expect(error).toMatchObject({
        code: "GEO_BENCHMARK_JSON",
        reason: testCase.reason,
      });
    }
  });

  it("validates content-addressed canonical manifests and isolates caller mutation", () => {
    const source = makeInputManifest();
    const validated = validateGeoBenchmarkInputManifest(source);
    const expected = makeDefinition();

    expect(validated).not.toBe(source);
    expectDeepFrozen(validated);
    expect(validated.questionSets.map(({ path }) => path)).toEqual(
      [...validated.questionSets.map(({ path }) => path)].sort(
        compareUnicodeCodePoints,
      ),
    );
    expect(
      createGeoBenchmarkDefinitionFromManifest(makeInputManifest()),
    ).toEqual(expected);

    const sourceSnapshot = source.questionSets[0] as {
      path: string;
      digest: string;
      content: string;
    };
    const validatedContent = validated.questionSets.find(
      ({ path }) => path === sourceSnapshot.path,
    )?.content;
    sourceSnapshot.content = "{}";
    expect(
      validated.questionSets.find(({ path }) => path === sourceSnapshot.path)
        ?.content,
    ).toBe(validatedContent);
  });

  it("rejects extra manifest methodology fields before normalization", () => {
    const manifest = makeInputManifest();
    const extraRootField = {
      ...manifest,
      methodology: {
        ...manifest.methodology,
        unexpectedField: "must-not-be-ignored",
      },
    };
    const rootError = captureError(() =>
      validateGeoBenchmarkInputManifest(extraRootField),
    );
    expect(rootError).toMatchObject({
      code: "GEO_BENCHMARK_MANIFEST",
      reason: "manifest_shape_invalid",
    });

    const extraNestedField = {
      ...manifest,
      methodology: {
        ...manifest.methodology,
        timing: {
          ...manifest.methodology.timing,
          unexpectedField: "must-not-be-ignored",
        },
      },
    };
    const nestedError = captureError(() =>
      validateGeoBenchmarkInputManifest(extraNestedField),
    );
    expect(nestedError).toMatchObject({
      code: "GEO_BENCHMARK_MANIFEST",
      reason: "manifest_shape_invalid",
    });
  });

  it("fails closed on untrusted manifest roots, paths, digests, and methodology identity drift", () => {
    const manifest = makeInputManifest();
    const assertions: readonly [unknown, string][] = [
      [
        { ...manifest, catalogRoot: "content/seo/geo/other" },
        "manifest_root_mismatch",
      ],
      [
        {
          ...manifest,
          questionSets: manifest.questionSets.map((snapshot, index) =>
            index === 0
              ? { ...snapshot, path: `../${snapshot.path}` }
              : snapshot,
          ),
        },
        "manifest_path_mismatch",
      ],
      [
        {
          ...manifest,
          questionSets: manifest.questionSets.map((snapshot, index) =>
            index === 0
              ? { ...snapshot, content: `${snapshot.content} ` }
              : snapshot,
          ),
        },
        "manifest_digest_mismatch",
      ],
      [
        {
          ...manifest,
          methodology: {
            ...manifest.methodology,
            scoringVersion: "geo-score-v2",
            versionIdentity: manifest.versionIdentity,
          },
        },
        "manifest_version_mismatch",
      ],
    ];

    for (const [input, reason] of assertions) {
      const error = captureError(() =>
        validateGeoBenchmarkInputManifest(input),
      );
      expect(error).toBeInstanceOf(GeoBenchmarkManifestError);
      expect(error).toMatchObject({
        code: "GEO_BENCHMARK_MANIFEST",
        reason,
      });
    }
  });

  it("keeps strict JSON checks at both manifest and embedded snapshot boundaries", () => {
    const manifest = makeInputManifest();
    const manifestJsonError = captureError(() =>
      createGeoBenchmarkDefinitionFromManifestJson(
        `\uFEFF${JSON.stringify(manifest)}`,
      ),
    );
    expect(manifestJsonError).toMatchObject({
      code: "GEO_BENCHMARK_JSON",
      reason: "bom_not_allowed",
    });

    const first = manifest.questionSets[0];
    const duplicateContent = first.content.replace(
      /"cluster":"([^"]+)"/,
      '"cluster":"$1","\\u0063luster":"$1"',
    );
    expect(duplicateContent).not.toBe(first.content);
    const duplicateManifest = {
      ...manifest,
      questionSets: manifest.questionSets.map((snapshot, index) =>
        index === 0
          ? {
              ...snapshot,
              content: duplicateContent,
              digest: hashBytes(duplicateContent),
            }
          : snapshot,
      ),
    };
    const duplicateError = captureError(() =>
      createGeoBenchmarkDefinitionFromManifest(duplicateManifest),
    );
    expect(duplicateError).toBeInstanceOf(GeoBenchmarkJsonError);
    expect(duplicateError).toMatchObject({
      code: "GEO_BENCHMARK_JSON",
      reason: "duplicate_json_key",
    });
  });

  it("normalizes tampered definition failures to one stable integrity reason", () => {
    const definition = makeDefinition();
    const tampered = {
      ...definition,
      methodology: {
        ...definition.methodology,
        scoringVersion: "geo-score-v2",
      },
    };

    const error = captureError(() =>
      assertGeoBenchmarkDefinitionIntegrity(tampered),
    );
    expect(error).toBeInstanceOf(GeoBenchmarkContractError);
    expect(error).toMatchObject({
      code: "GEO_BENCHMARK_CONTRACT",
      reason: "definition_integrity_mismatch",
    });
  });

  it("rejects output fields and cluster counts that integrity would otherwise silently drop", () => {
    const definition = makeDefinition();
    const extraMethodologyField = {
      ...definition,
      methodology: {
        ...definition.methodology,
        unexpectedField: "must-not-be-ignored",
      },
    };
    const methodologyError = captureError(() =>
      assertGeoBenchmarkDefinitionIntegrity(extraMethodologyField),
    );
    expect(methodologyError).toMatchObject({
      code: "GEO_BENCHMARK_CONTRACT",
      reason: "definition_integrity_mismatch",
    });

    const inconsistentCounts = {
      ...definition,
      questionSet: {
        ...definition.questionSet,
        clusterCounts: {
          ...definition.questionSet.clusterCounts,
          [CANONICAL_CLUSTER_IDS[0]]: 9,
        },
      },
    };
    const countsError = captureError(() =>
      assertGeoBenchmarkDefinitionIntegrity(inconsistentCounts),
    );
    expect(countsError).toMatchObject({
      code: "GEO_BENCHMARK_CONTRACT",
      reason: "definition_integrity_mismatch",
    });
  });
});

describe("lineage, null semantics, and fixture isolation", () => {
  it("preserves raw observation lineage and keeps blocked values null instead of zero", () => {
    const definition = makeDefinition();
    const envelope = makeFixtureEnvelope(definition);
    const lineage = projectGeoBenchmarkRunLineage(envelope);
    const metrics = summarizeGeoBenchmarkLineage(lineage);
    const blocked = lineage.find(
      ({ rawObservation }) => rawObservation.status === "blocked",
    );
    const unavailable = lineage.find(
      ({ rawObservation }) => rawObservation.status === "unavailable",
    );

    expect(lineage).toHaveLength(4);
    expect(lineage[0].dataClass).toBe("fixture");
    expect(lineage[0].visibility).toBe("non_public");
    expect(lineage[0].publishable).toBe(false);
    expect(blocked?.metricValues).toEqual({
      brandMention: null,
      ownedCitation: null,
      accuracy: null,
      completeness: null,
      competitorVisibility: null,
    });
    expect(unavailable?.metricValues).toEqual({
      brandMention: null,
      ownedCitation: null,
      accuracy: null,
      completeness: null,
      competitorVisibility: null,
    });
    expect(blocked?.rawObservation.evidencePath).toContain(
      "observation-blocked.json",
    );
    expect(unavailable?.rawObservation.evidencePath).toContain(
      "observation-unavailable.json",
    );
    expect(metrics).toEqual({
      brandMention: { numerator: 1, denominator: 2, rate: 0.5 },
      ownedCitation: { numerator: 1, denominator: 2, rate: 0.5 },
      accuracy: { numerator: 1, denominator: 1, rate: 1 },
      completeness: { numerator: 0, denominator: 1, rate: 0 },
      competitorVisibility: { numerator: 1, denominator: 2, rate: 0.5 },
    });
  });

  it("rejects unknown run classifications instead of treating them as production", () => {
    const definition = makeDefinition();
    const { envelope } = makePartialProductionEnvelope(definition);
    const untrustedEnvelope = {
      ...envelope,
      dataClass: "external",
    } as unknown as GeoBenchmarkRunEnvelope;

    const error = captureError(() =>
      projectGeoBenchmarkRunLineage(untrustedEnvelope),
    );
    expect(error).toMatchObject({
      code: "GEO_BENCHMARK_CONTRACT",
      reason: "contract_violation",
    });
  });

  it("allows explicit fixture/non_public projection but rejects fixtures from production aggregation", () => {
    const definition = makeDefinition();
    const fixture = makeFixtureEnvelope(definition);

    expect(projectGeoBenchmarkRunLineage(fixture)[0]).toMatchObject({
      dataClass: "fixture",
      visibility: "non_public",
      publishable: false,
    });
    expect(() =>
      aggregateTestPeriod({
        definition,
        period: BASE_PERIOD,
        runs: [fixture],
      }),
    ).toThrow(GeoBenchmarkFixtureIsolationError);
  });

  it("returns null rates when every recorded value is unavailable or blocked", () => {
    const definition = makeDefinition();
    const fixture = makeFixtureEnvelope(definition);
    const blockedOnly = projectGeoBenchmarkRunLineage(fixture).filter(
      ({ rawObservation }) => rawObservation.status === "blocked",
    );

    expect(summarizeGeoBenchmarkLineage(blockedOnly)).toEqual({
      brandMention: { numerator: 0, denominator: 0, rate: null },
      ownedCitation: { numerator: 0, denominator: 0, rate: null },
      accuracy: { numerator: 0, denominator: 0, rate: null },
      completeness: { numerator: 0, denominator: 0, rate: null },
      competitorVisibility: { numerator: 0, denominator: 0, rate: null },
    });
  });
});

describe("blocked baseline, compatible reruns, and deterministic rendering", () => {
  it("stays blocked without live observations and emits no fabricated metrics", () => {
    const definition = makeDefinition();
    const result = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs: [],
    });

    expect(result).toMatchObject({
      dataClass: "production",
      visibility: "internal",
      status: "blocked_no_live_observations",
      baselineReady: false,
      metrics: null,
      lineage: [],
      expectedSlotCount: 200,
      recordedSlotCount: 0,
      pendingSlotCount: 200,
    });
    expect(result.blockers.join(" ")).toMatch(/no live/i);
    expect(result.blockers.join(" ")).toMatch(/human approval/i);
  });

  it("fails closed across incompatible methodology and compares compatible month-to-month metrics", () => {
    const definition = makeDefinition();
    const approvals = makeApprovedPublicationApprovals();
    const baselineInput = makeCompleteProductionInput(definition);
    const baseline = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      ...baselineInput,
      approvals,
    });
    const rerunInput = makeCompleteProductionInput(definition, {
      runLabel: "august",
      observedAt: "2026-08-18T02:00:00+09:30",
      answerVariant: "rerun",
    });
    const rerun = aggregateTestPeriod({
      definition,
      period: {
        periodId: "2026-08-rerun",
        observedFrom: "2026-08-01T00:00:00+09:30",
        observedThrough: "2026-08-31T23:59:59+09:30",
      },
      ...rerunInput,
      approvals,
    });

    expect(compareGeoBenchmarkPeriods(baseline, rerun)).toMatchObject({
      status: "comparable",
      temporalStatus: "ordered",
      requiresNewVersion: false,
      delta: {
        brandMention: -1,
        ownedCitation: -1,
        accuracy: -1,
        completeness: 1,
        competitorVisibility: -1,
      },
    });

    const blockedBaseline = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs: [],
    });
    expect(compareGeoBenchmarkPeriods(blockedBaseline, rerun)).toMatchObject({
      status: "not_comparable",
      delta: null,
      requiresNewVersion: false,
    });

    const incompatibleDefinition = makeDefinition({
      ...BASE_METHODOLOGY,
      benchmarkVersion: "geo-50-v2",
      methodologyVersion: "geo-method-v2",
      repetitions: 3,
    });
    const incompatible = aggregateTestPeriod({
      definition: incompatibleDefinition,
      period: {
        periodId: "2026-08-incompatible",
        observedFrom: "2026-08-01T00:00:00+09:30",
        observedThrough: "2026-08-31T23:59:59+09:30",
      },
      runs: [],
    });
    expect(compareGeoBenchmarkPeriods(baseline, incompatible)).toMatchObject({
      status: "incompatible_methodology",
      delta: null,
      requiresNewVersion: true,
      mismatches: expect.arrayContaining([
        "benchmarkVersion",
        "methodologyVersion",
        "repetitions",
      ]),
    });
  });

  it("rejects forged report claims at the opaque boundary and hides blocked metrics", () => {
    const definition = makeDefinition();
    const blocked = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs: [],
    });
    const unsafe = {
      ...blocked,
      blockers: ["This report proves one provider is better than the rest."],
    };

    expect(() => renderGeoBenchmarkReport(unsafe)).toThrow(
      GeoBenchmarkContractError,
    );

    const report = renderGeoBenchmarkReport(blocked);
    expect(report).toMatch(/Not available/i);
    expect(report).not.toMatch(/\b\d+(?:\.\d+)?%/);
  });

  it("keeps a real but partial production run blocked with null metrics", () => {
    const definition = makeDefinition();
    const { envelope, snapshotContents } =
      makePartialProductionEnvelope(definition);
    const result = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs: [envelope],
      snapshotContents,
    });

    expect(result).toMatchObject({
      status: "partial_live_observations",
      baselineReady: false,
      publishable: false,
      metrics: null,
      expectedSlotCount: 200,
      recordedSlotCount: 1,
      pendingSlotCount: 199,
    });
    expect(renderGeoBenchmarkReport(result)).toMatch(/Not available/i);

    const driftedEnvelope: GeoBenchmarkProductionRunEnvelope = {
      ...envelope,
      versionIdentity: {
        ...envelope.versionIdentity,
        scoringVersion: "geo-score-v2",
      },
    };
    const error = captureError(() =>
      aggregateTestPeriod({
        definition,
        period: BASE_PERIOD,
        runs: [driftedEnvelope],
        snapshotContents,
      }),
    );
    expect(error).toBeInstanceOf(GeoBenchmarkContractError);
    expect(error).toMatchObject({
      code: "GEO_BENCHMARK_CONTRACT",
      reason: "version_identity_mismatch",
    });
  });

  it("rejects malformed public aggregation inputs without native TypeErrors or key dropping", () => {
    const definition = makeDefinition();
    const { envelope } = makePartialProductionEnvelope(definition);
    const approvals = makeApprovedPublicationApprovals();
    const invalidInputs: unknown[] = [
      null,
      [],
      { definition, period: BASE_PERIOD },
      { definition, period: BASE_PERIOD, runs: null },
      {
        definition,
        period: BASE_PERIOD,
        runs: [],
        unexpected: true,
      },
      {
        definition,
        period: null,
        runs: [],
      },
      {
        definition,
        period: { ...BASE_PERIOD, unexpected: true },
        runs: [],
      },
      {
        definition,
        period: { periodId: BASE_PERIOD.periodId },
        runs: [],
      },
      {
        definition,
        period: {
          ...BASE_PERIOD,
          observedFrom: "2026-08-01T00:00:00+09:30",
          observedThrough: "2026-07-01T00:00:00+09:30",
        },
        runs: [],
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [null],
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [{ ...envelope, unexpected: true }],
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [
          {
            dataClass: "production",
            visibility: envelope.visibility,
            record: envelope.record,
          },
        ],
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [
          {
            ...envelope,
            record: null,
          },
        ],
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [],
        snapshotContents: null,
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [],
        snapshotContents: { "evidence/snapshot.json": null },
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [],
        approvals: null,
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [],
        approvals: { ...approvals, unexpected: approvals.publication },
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [],
        approvals: {
          questionSet: approvals.questionSet,
          quality: approvals.quality,
          retention: approvals.retention,
          privacy: approvals.privacy,
        },
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [],
        approvals: { ...approvals, quality: null },
      },
      {
        definition,
        period: BASE_PERIOD,
        runs: [],
        approvals: {
          ...approvals,
          quality: { ...approvals.quality, unexpected: true },
        },
      },
    ];

    for (const input of invalidInputs) {
      const error = captureError(() => aggregateTestPeriod(input));
      expect(error).toBeInstanceOf(GeoBenchmarkContractError);
      expect(error).not.toBeInstanceOf(TypeError);
    }
  });

  it("binds every observation snapshot redaction policy to the definition identity", () => {
    const definition = makeDefinition();
    const { envelope, snapshotContents } =
      makePartialProductionEnvelope(definition);
    const observation = envelope.record.observations[0];
    if (observation.snapshot === null) {
      throw new Error("Production helper must include a snapshot.");
    }
    const drifted: GeoBenchmarkProductionRunEnvelope = {
      ...envelope,
      record: {
        ...envelope.record,
        observations: [
          {
            ...observation,
            snapshot: {
              ...observation.snapshot,
              redaction: {
                ...observation.snapshot.redaction,
                policyVersion: "geo-redaction-v2",
              },
            },
          },
        ],
      },
    };

    const error = captureError(() =>
      aggregateTestPeriod({
        definition,
        period: BASE_PERIOD,
        runs: [drifted],
        snapshotContents,
      }),
    );
    expect(error).toBeInstanceOf(GeoBenchmarkContractError);
    expect(error).toMatchObject({ reason: "version_identity_mismatch" });
  });

  it("counts recorded but unresolved evidence as pending without calling it missing", () => {
    const definition = makeDefinition();
    const { envelope } = makePartialProductionEnvelope(definition);
    const observation = envelope.record.observations[0];
    const unresolved: GeoBenchmarkProductionRunEnvelope = {
      ...envelope,
      record: {
        ...envelope.record,
        observations: [
          {
            ...observation,
            status: "blocked",
            statusReason: "access-blocked",
            snapshot: null,
            brandMention: null,
            citations: [],
            competitors: [],
            review: null,
          },
        ],
      },
    };

    const result = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs: [unresolved],
    });

    expect(result).toMatchObject({
      expectedSlotCount: 200,
      recordedSlotCount: 1,
      recordedUnresolvedSlotCount: 1,
      missingSlotCount: 199,
      pendingSlotCount: 200,
    });
  });

  it("rejects rollback version lineage and reverse or overlapping period comparisons", () => {
    const v1 = makeDefinition();
    const v2 = makeDefinition({
      ...BASE_METHODOLOGY,
      benchmarkVersion: "geo-50-v2",
      methodologyVersion: "geo-method-v2",
      questionSetVersion: "geo-questions-v2",
      observationSchemaVersion: "geo-contract-v2",
      scoringVersion: "geo-score-v2",
      citationCapture: {
        ...BASE_METHODOLOGY.citationCapture,
        redactionPolicyVersion: "geo-redaction-v2",
      },
    });
    const rollbackError = captureError(() =>
      assertGeoBenchmarkVersionTransition(v2, v1),
    );
    expect(rollbackError).toBeInstanceOf(GeoBenchmarkVersionDriftError);
    expect(rollbackError).toMatchObject({ reason: "rollback_lineage" });

    const baseline = aggregateTestPeriod({
      definition: v1,
      period: BASE_PERIOD,
      runs: [],
    });
    const overlapping = aggregateTestPeriod({
      definition: v1,
      period: {
        periodId: "2026-07-overlap-synthetic",
        observedFrom: "2026-07-31T12:00:00+09:30",
        observedThrough: "2026-08-15T23:59:59+09:30",
      },
      runs: [],
    });
    expect(compareGeoBenchmarkPeriods(baseline, overlapping)).toMatchObject({
      status: "not_comparable",
      temporalStatus: "overlap",
      delta: null,
    });
    expect(compareGeoBenchmarkPeriods(overlapping, baseline)).toMatchObject({
      status: "not_comparable",
      temporalStatus: "reverse_order",
      delta: null,
    });
  });

  it("requires all five human approvals before a complete production result is publishable", () => {
    const definition = makeDefinition();
    const { runs, snapshotContents } = makeCompleteProductionInput(definition);
    const blockedPublication = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs,
      snapshotContents,
    });
    expect(blockedPublication).toMatchObject({
      status: "ready",
      baselineReady: true,
      publishable: false,
      expectedSlotCount: 200,
      recordedSlotCount: 200,
      recordedUnresolvedSlotCount: 0,
      missingSlotCount: 0,
      pendingSlotCount: 0,
    });
    expect(blockedPublication.blockers.join(" ")).toMatch(
      /question-set.*quality.*retention.*privacy.*publication/i,
    );

    const publishable = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs,
      snapshotContents,
      approvals: makeApprovedPublicationApprovals(),
    });
    expect(publishable).toMatchObject({
      status: "ready",
      baselineReady: true,
      publishable: true,
      metrics: expect.any(Object),
    });
    expect(publishable.lineage).toHaveLength(200);
    expectDeepFrozen(publishable);
  });

  it("rejects production provenance asserted only by structural self-report", () => {
    const definition = makeDefinition();
    const { runs, snapshotContents } = makeCompleteProductionInput(definition);

    expect(() =>
      aggregateGeoBenchmarkPeriod({
        definition,
        period: BASE_PERIOD,
        runs,
        snapshotContents,
      }),
    ).toThrow(/trusted.*evidence|opaque.*boundary|provenance/i);
  });

  it("rejects copied opaque capabilities and copied production evidence identities", () => {
    const definition = makeDefinition();
    const { envelope, snapshotContents } =
      makePartialProductionEnvelope(definition);
    const approvals = makeApprovedPublicationApprovals();
    const trustedRuns = new WeakSet<object>([envelope]);
    const trustedApprovals = new WeakSet<object>(Object.values(approvals));
    const verifier = {
      verifyRun: (run: GeoBenchmarkRunEnvelope) => trustedRuns.has(run),
      verifyApproval: (_approvalName: unknown, rawApproval: unknown) =>
        rawApproval !== null &&
        typeof rawApproval === "object" &&
        trustedApprovals.has(rawApproval),
    };
    const evidenceBoundary =
      createGeoBenchmarkProductionEvidenceBoundary(verifier);
    verifier.verifyRun = () => true;
    verifier.verifyApproval = () => true;

    expect(
      aggregateGeoBenchmarkPeriod({
        definition,
        period: BASE_PERIOD,
        runs: [envelope],
        snapshotContents,
        approvals,
        evidenceBoundary,
      }),
    ).toMatchObject({ status: "partial_live_observations" });

    expect(() =>
      aggregateGeoBenchmarkPeriod({
        definition,
        period: BASE_PERIOD,
        runs: [envelope],
        evidenceBoundary: { ...evidenceBoundary },
      }),
    ).toThrow(/evidence boundary.*not runtime-trusted/i);

    expect(() =>
      aggregateGeoBenchmarkPeriod({
        definition,
        period: BASE_PERIOD,
        runs: [{ ...envelope }],
        snapshotContents,
        evidenceBoundary,
      }),
    ).toThrow(/production run evidence.*opaque evidence verifier/i);

    expect(() =>
      aggregateGeoBenchmarkPeriod({
        definition,
        period: BASE_PERIOD,
        runs: [envelope],
        snapshotContents,
        approvals: {
          ...approvals,
          publication: { ...approvals.publication },
        },
        evidenceBoundary,
      }),
    ).toThrow(/publication approval.*runtime-trusted evidence/i);
  });

  it("fails closed on non-boolean or throwing evidence verifier outcomes", () => {
    const definition = makeDefinition();
    const { envelope, snapshotContents } =
      makePartialProductionEnvelope(definition);
    const approvals = makeApprovedPublicationApprovals();

    const truthyRunBoundary = createGeoBenchmarkProductionEvidenceBoundary({
      verifyRun: () => "accepted" as unknown as boolean,
      verifyApproval: () => true,
    });
    expect(() =>
      aggregateGeoBenchmarkPeriod({
        definition,
        period: BASE_PERIOD,
        runs: [envelope],
        snapshotContents,
        evidenceBoundary: truthyRunBoundary,
      }),
    ).toThrow(GeoBenchmarkFixtureIsolationError);

    const throwingRunBoundary = createGeoBenchmarkProductionEvidenceBoundary({
      verifyRun: () => {
        throw new TypeError("untrusted verifier failure");
      },
      verifyApproval: () => true,
    });
    const runError = captureError(() =>
      aggregateGeoBenchmarkPeriod({
        definition,
        period: BASE_PERIOD,
        runs: [envelope],
        snapshotContents,
        evidenceBoundary: throwingRunBoundary,
      }),
    );
    expect(runError).toBeInstanceOf(GeoBenchmarkFixtureIsolationError);
    expect(runError).not.toBeInstanceOf(TypeError);

    const truthyApprovalBoundary = createGeoBenchmarkProductionEvidenceBoundary(
      {
        verifyRun: (run) => run === envelope,
        verifyApproval: () => "accepted" as unknown as boolean,
      },
    );
    expect(() =>
      aggregateGeoBenchmarkPeriod({
        definition,
        period: BASE_PERIOD,
        runs: [envelope],
        snapshotContents,
        approvals,
        evidenceBoundary: truthyApprovalBoundary,
      }),
    ).toThrow(/approval.*runtime-trusted evidence/i);
  });

  it("keeps production-shaped synthetic evidence non-public and non-publishable", () => {
    const definition = makeDefinition();
    const complete = makeCompleteProductionInput(definition, {
      runLabel: "synthetic-dry-run",
    });
    const fixtureRuns = complete.runs.map((envelope) => ({
      ...envelope,
      dataClass: "fixture" as const,
      visibility: "non_public" as const,
      record: {
        ...envelope.record,
        manifest: {
          ...envelope.record.manifest,
          fixtureOnly: true,
          provenance: "synthetic-fixture" as const,
        },
      },
    }));

    const result = aggregateGeoBenchmarkPeriod({
      definition,
      period: BASE_PERIOD,
      runs: fixtureRuns,
      snapshotContents: complete.snapshotContents,
      evidenceBoundary: createGeoBenchmarkSyntheticEvidenceBoundary(),
    });

    expect(result).toMatchObject({
      dataClass: "fixture",
      visibility: "non_public",
      status: "partial_live_observations",
      baselineReady: false,
      publishable: false,
      metrics: null,
      recordedSlotCount: 200,
      missingSlotCount: 0,
      pendingSlotCount: 0,
    });
    expect(result.blockers.join(" ")).toMatch(/synthetic fixture.*dry-run/i);
    expect(result.blockers.join(" ")).not.toMatch(
      /does not yet contain complete resolved coverage/i,
    );
    const report = renderGeoBenchmarkReport(result);
    expect(report).toMatch(/Data class: `fixture`/i);
    expect(report).toMatch(/Visibility: `non_public`/i);
    expect(report).toMatch(/Not available/i);
    expect(() =>
      aggregateGeoBenchmarkPeriod({
        definition,
        period: BASE_PERIOD,
        runs: fixtureRuns,
        snapshotContents: complete.snapshotContents,
        approvals: makeApprovedPublicationApprovals(),
        evidenceBoundary: createGeoBenchmarkSyntheticEvidenceBoundary(),
      }),
    ).toThrow(/synthetic dry-run data cannot carry production approval/i);
  });

  it("does not classify recorded unresolved evidence as no_live_observations", () => {
    const definition = makeDefinition();
    const { envelope } = makePartialProductionEnvelope(definition);
    const observation = envelope.record.observations[0];
    const unresolved: GeoBenchmarkProductionRunEnvelope = {
      ...envelope,
      record: {
        ...envelope.record,
        observations: [
          {
            ...observation,
            status: "blocked",
            statusReason: "access-blocked",
            snapshot: null,
            brandMention: null,
            citations: [],
            competitors: [],
            review: null,
          },
        ],
      },
    };

    const result = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs: [unresolved],
    });

    expect(result.status).toBe("partial_live_observations");
    expect(result.blockers.join(" ")).not.toMatch(/no live/i);
  });

  it("does not classify same period id with different boundaries as same_period", () => {
    const definition = makeDefinition();
    const baseline = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs: [],
    });
    const shifted = aggregateTestPeriod({
      definition,
      period: {
        ...BASE_PERIOD,
        observedFrom: "2026-07-18T01:00:00+09:30",
      },
      runs: [],
    });

    expect(compareGeoBenchmarkPeriods(baseline, shifted)).toMatchObject({
      status: "not_comparable",
      temporalStatus: "invalid_period",
      delta: null,
    });
  });

  it("rejects forged structural period results at compare and render boundaries", () => {
    const definition = makeDefinition();
    const trusted = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs: [],
    });
    const forged = { ...trusted, publishable: true };

    expect(() => renderGeoBenchmarkReport(forged)).toThrow(
      /period result.*runtime-trusted|opaque/i,
    );
    expect(() => compareGeoBenchmarkPeriods(forged, trusted)).toThrow(
      /period result.*runtime-trusted|opaque/i,
    );
  });

  it("is deterministic, deeply frozen, and renders the noisy-observation caveat", () => {
    const definition = makeDefinition();
    const first = aggregateTestPeriod({
      definition,
      period: BASE_PERIOD,
      runs: [],
    });
    const second = aggregateTestPeriod({
      definition: makeDefinition(),
      period: { ...BASE_PERIOD },
      runs: [],
    });
    const methodology = renderGeoBenchmarkMethodology(definition);
    const report = renderGeoBenchmarkReport(first);

    expect(first).toEqual(second);
    expect(renderGeoBenchmarkMethodology(makeDefinition())).toBe(methodology);
    expect(renderGeoBenchmarkReport(second)).toBe(report);
    expectDeepFrozen(definition);
    expectDeepFrozen(first);
    expect(methodology).toMatch(/noisy observations/i);
    expect(methodology).toMatch(/not deterministic rankings/i);
    expect(report).toMatch(/blocked_no_live_observations/i);
    expect(report).toMatch(/Not available/i);
    expect(report).not.toMatch(/0\.0%/);
  });
});
