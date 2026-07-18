import { hashBytes, hashUtf8Text } from "../hash";
import { parseGeoRunRecord } from "../schema";
import {
  GEO_CLUSTERS,
  type GeoAggregateResult,
  type GeoCluster,
  type GeoObservation,
  type GeoQuestionDefinition,
  type GeoRunManifest,
  type GeoRunRecord,
} from "../types";

const VERSIONS = {
  schemaVersion: "geo-schema-fixture-v1",
  methodologyVersion: "methodology-fixture-v1",
  benchmarkVersion: "benchmark-fixture-v1",
  questionSetVersion: "question-set-fixture-v1",
} as const;

const PROMPT_VERSION = "prompt-fixture-v1";
const FIXTURE_APPROVED_AT = "2000-01-01T00:00:00.000Z";

function clusterLabel(cluster: GeoCluster): string {
  return cluster.replace(/-/g, " ");
}

function createQuestion(
  cluster: GeoCluster,
  sequence: number,
): GeoQuestionDefinition {
  const suffix = String(sequence).padStart(2, "0");
  const text = `Synthetic approved question ${suffix} for ${clusterLabel(cluster)}?`;
  return {
    questionId: `question.${cluster}.${suffix}`,
    cluster,
    prompt: {
      version: PROMPT_VERSION,
      text,
      hash: hashUtf8Text(text),
    },
    approval: {
      status: "approved",
      approvedAt: FIXTURE_APPROVED_AT,
      reviewerRole: "seo-reviewer",
      evidencePath: `lib/seo/geo/fixtures/questions/${cluster}-${suffix}.json`,
    },
  };
}

export const canonicalQuestionSetFixture: GeoQuestionDefinition[] =
  GEO_CLUSTERS.flatMap((cluster) =>
    Array.from({ length: 10 }, (_, index) =>
      createQuestion(cluster, index + 1),
    ),
  );

function question(cluster: GeoCluster): GeoQuestionDefinition {
  const match = canonicalQuestionSetFixture.find(
    (candidate) => candidate.cluster === cluster,
  );
  if (match === undefined) {
    throw new Error("Synthetic GEO fixture question is missing.");
  }
  return match;
}

function manifest(
  overrides: Partial<GeoRunManifest> &
    Pick<GeoRunManifest, "runId" | "platform">,
  selectedQuestion: GeoQuestionDefinition,
): GeoRunManifest {
  return {
    ...VERSIONS,
    fixtureOnly: true,
    provenance: "synthetic-fixture",
    locale: "en-AU",
    device: "desktop",
    auth: "not-applicable",
    accountTier: "not-applicable",
    expectedRepetitions: 1,
    questions: [selectedQuestion],
    evidencePath: `lib/seo/geo/fixtures/manifests/${overrides.runId}.json`,
    ...overrides,
  };
}

function observationBase(
  runManifest: GeoRunManifest,
  selectedQuestion: GeoQuestionDefinition,
  observationId: string,
  observedAt: string,
): Omit<
  GeoObservation,
  | "status"
  | "statusReason"
  | "surface"
  | "snapshot"
  | "brandMention"
  | "citations"
  | "competitors"
  | "review"
> {
  return {
    ...VERSIONS,
    runId: runManifest.runId,
    observationId,
    questionId: selectedQuestion.questionId,
    repetition: 1,
    cluster: selectedQuestion.cluster,
    platform: runManifest.platform,
    prompt: selectedQuestion.prompt,
    observedAt,
    locale: runManifest.locale,
    device: runManifest.device,
    auth: runManifest.auth,
    accountTier: runManifest.accountTier,
    evidencePath: `lib/seo/geo/fixtures/observations/${observationId}.json`,
  };
}

const SNAPSHOTS = {
  valid: {
    path: "lib/seo/geo/fixtures/snapshots/valid-observed.txt",
    content: "Synthetic fixture snapshot: observed answer.\n",
  },
  absent: {
    path: "lib/seo/geo/fixtures/snapshots/surface-absent.txt",
    content: "Synthetic fixture snapshot: surface absent.\n",
  },
  blocked: {
    path: "lib/seo/geo/fixtures/snapshots/blocked.txt",
    content: "Synthetic fixture snapshot: access blocked.\n",
  },
  misleading: {
    path: "lib/seo/geo/fixtures/snapshots/misleading-citation.txt",
    content: "Synthetic fixture snapshot: misleading citation.\n",
  },
  tampered: {
    path: "lib/seo/geo/fixtures/snapshots/tampered.txt",
    content: "Synthetic fixture snapshot: bytes do not match declared hash.\n",
  },
} as const;

function textSnapshot(snapshot: (typeof SNAPSHOTS)[keyof typeof SNAPSHOTS]) {
  return {
    path: snapshot.path,
    hash: hashBytes(snapshot.content),
    mimeType: "text/plain" as const,
    capture: "text" as const,
    redaction: {
      status: "not-required" as const,
      policyVersion: "redaction-fixture-v1",
    },
  };
}

function record(
  runManifest: GeoRunManifest,
  observations: GeoObservation[],
): GeoRunRecord {
  return parseGeoRunRecord({ manifest: runManifest, observations });
}

const validQuestion = question("supplier-verification");
const validManifest = manifest(
  {
    runId: "run.fixture.valid.001",
    platform: "chatgpt",
  },
  validQuestion,
);
const validObservation: GeoObservation = {
  ...observationBase(
    validManifest,
    validQuestion,
    "obs.fixture.valid.001",
    "2000-01-01T00:00:00.000Z",
  ),
  status: "observed-answer",
  statusReason: null,
  surface: {
    name: "Synthetic answer surface",
    visibility: "visible",
    ordered: true,
    model: {
      name: "Synthetic model",
      visibility: "visible",
    },
  },
  snapshot: textSnapshot(SNAPSHOTS.valid),
  brandMention: true,
  citations: [
    {
      citationId: "citation.fixture.valid.001",
      url: "https://fixture.invalid/owned-reference",
      kind: "owned",
      integrity: "supports",
      rank: 1,
      evidencePath:
        "lib/seo/geo/fixtures/evidence/citation-fixture-valid-001.json",
    },
  ],
  competitors: [
    {
      competitorId: "competitor.fixture.valid.001",
      label: "Synthetic competitor",
      mentioned: true,
      cited: false,
      preferred: false,
      rank: 2,
      evidencePath:
        "lib/seo/geo/fixtures/evidence/competitor-fixture-valid-001.json",
    },
  ],
  review: {
    rubricVersion: "rubric-fixture-v1",
    reviewedAt: "2000-01-01T00:00:00.000Z",
    reviewerRole: "quality-reviewer",
    accuracy: "pass",
    completeness: "pass",
    citationIntegrity: "pass",
    competitorPreference: "brand-preferred",
    evidencePath: "lib/seo/geo/fixtures/reviews/review-fixture-valid-001.json",
  },
};
export const validObservedRunFixture = record(validManifest, [
  validObservation,
]);

const absentQuestion = question("factory-audit");
const absentManifest = manifest(
  {
    runId: "run.fixture.absent.001",
    platform: "google-ai-overviews",
  },
  absentQuestion,
);
const absentObservation: GeoObservation = {
  ...observationBase(
    absentManifest,
    absentQuestion,
    "obs.fixture.absent.001",
    "2000-01-02T00:00:00.000Z",
  ),
  status: "observed-surface-absent",
  statusReason: null,
  surface: {
    name: null,
    visibility: "not-visible",
    ordered: false,
    model: {
      name: null,
      visibility: "not-applicable",
    },
  },
  snapshot: textSnapshot(SNAPSHOTS.absent),
  brandMention: false,
  citations: [],
  competitors: [],
  review: null,
};
export const surfaceAbsentRunFixture = record(absentManifest, [
  absentObservation,
]);

const blockedQuestion = question("quality-inspection");
const blockedManifest = manifest(
  {
    runId: "run.fixture.blocked.001",
    platform: "bing-copilot",
  },
  blockedQuestion,
);
const blockedObservation: GeoObservation = {
  ...observationBase(
    blockedManifest,
    blockedQuestion,
    "obs.fixture.blocked.001",
    "2000-01-04T00:00:00.000Z",
  ),
  status: "blocked",
  statusReason: "access-blocked",
  surface: {
    name: null,
    visibility: "not-visible",
    ordered: false,
    model: {
      name: null,
      visibility: "not-applicable",
    },
  },
  snapshot: textSnapshot(SNAPSHOTS.blocked),
  brandMention: null,
  citations: [],
  competitors: [],
  review: null,
};
export const blockedRunFixture = record(blockedManifest, [blockedObservation]);

const misleadingQuestion = question("factory-visits");
const misleadingManifest = manifest(
  {
    runId: "run.fixture.misleading.001",
    platform: "perplexity",
  },
  misleadingQuestion,
);
const misleadingObservation: GeoObservation = {
  ...observationBase(
    misleadingManifest,
    misleadingQuestion,
    "obs.fixture.misleading.001",
    "2000-01-03T00:00:00.000Z",
  ),
  status: "observed-answer",
  statusReason: null,
  surface: {
    name: "Synthetic citation surface",
    visibility: "visible",
    ordered: true,
    model: {
      name: "Synthetic model",
      visibility: "visible",
    },
  },
  snapshot: textSnapshot(SNAPSHOTS.misleading),
  brandMention: true,
  citations: [
    {
      citationId: "citation.fixture.misleading.001",
      url: "https://fixture.invalid/misleading-owned-reference",
      kind: "owned",
      integrity: "misleading",
      rank: 2,
      evidencePath:
        "lib/seo/geo/fixtures/evidence/citation-fixture-misleading-001.json",
    },
  ],
  competitors: [
    {
      competitorId: "competitor.fixture.misleading.001",
      label: "Synthetic preferred competitor",
      mentioned: true,
      cited: true,
      preferred: true,
      rank: 1,
      evidencePath:
        "lib/seo/geo/fixtures/evidence/competitor-fixture-misleading-001.json",
    },
  ],
  review: {
    rubricVersion: "rubric-fixture-v1",
    reviewedAt: "2000-01-03T00:00:00.000Z",
    reviewerRole: "quality-reviewer",
    accuracy: "pass",
    completeness: "pass",
    citationIntegrity: "misleading",
    competitorPreference: "competitor-preferred",
    evidencePath:
      "lib/seo/geo/fixtures/reviews/review-fixture-misleading-001.json",
  },
};
export const misleadingCitationRunFixture = record(misleadingManifest, [
  misleadingObservation,
]);

const emptyQuestion = question("china-sourcing");
const emptyManifest = manifest(
  {
    runId: "run.fixture.empty.001",
    platform: "chatgpt",
  },
  emptyQuestion,
);
export const emptyRunFixture = record(emptyManifest, []);

const tamperedManifest = manifest(
  {
    runId: "run.fixture.tampered.001",
    platform: "chatgpt",
  },
  validQuestion,
);
const tamperedObservation: GeoObservation = {
  ...validObservation,
  runId: tamperedManifest.runId,
  observationId: "obs.fixture.tampered.001",
  observedAt: "2000-01-05T00:00:00.000Z",
  snapshot: {
    ...textSnapshot(SNAPSHOTS.tampered),
    hash: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
  evidencePath:
    "lib/seo/geo/fixtures/observations/obs.fixture.tampered.001.json",
};
export const tamperedSnapshotRunFixture = record(tamperedManifest, [
  tamperedObservation,
]);

export const fixtureSnapshotContents: Record<string, string> =
  Object.fromEntries(
    Object.values(SNAPSHOTS).map((snapshot) => [
      snapshot.path,
      snapshot.content,
    ]),
  );

export const piiRejectedObservationFixture = {
  ...validObservation,
  observationId: "obs.fixture.pii-rejected.001",
  account: {
    email: "private-person@example.com",
  },
  cookie: "session-cookie=fixture-secret-value",
  session: {
    id: "private-session-id",
  },
  enquiry: "Private free-form customer enquiry text.",
};

const previousMismatch: GeoAggregateResult = {
  status: "blocked_no_live_observations",
  baselineReady: false,
  metrics: null,
  versions: { ...VERSIONS },
  liveRunCount: 0,
  fixtureRunCount: 1,
  liveObservationCount: 0,
  expectedObservationCount: 0,
};
const currentMismatch: GeoAggregateResult = {
  ...previousMismatch,
  versions: {
    ...VERSIONS,
    methodologyVersion: "methodology-fixture-v2",
  },
};

export const versionMismatchBenchmarkPairFixture = {
  previous: previousMismatch,
  current: currentMismatch,
};

export const goldenScoreExpectation = {
  mention: { numerator: 2, denominator: 3 },
  citation: { numerator: 2, denominator: 3 },
  accuracy: { numerator: 2, denominator: 2 },
  completeness: { numerator: 2, denominator: 2 },
  citationIntegrity: { numerator: 1, denominator: 2 },
  competitorPreference: { numerator: 1, denominator: 2 },
} as const;
