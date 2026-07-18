import { z } from "zod";

import { clusterIdSchema } from "../clusterSchema";
import {
  GEO_PLATFORMS,
  compareUnicodeCodePoints,
  hashBytes,
  hashCanonical,
  normalizeRepositoryRelativePosixPath,
  parseGeoRunRecord,
  scoreGeoObservations,
  type GeoObservation,
  type GeoPlatform,
  type GeoRunRecord,
} from "../geo";
import { parseQuestionSet, type QuestionSet } from "../questionSets";
import {
  GEO_BASELINE_GATE_REASONS,
  GEO_CLUSTER_BASELINE_SCHEMA_VERSION,
  GeoBaselineContractError,
  type GeoBaselineGateReason,
  type GeoBaselinePlatformReport,
  type GeoClusterBaselineInput,
  type GeoClusterBaselineReport,
} from "./types";

const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const ISO_TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;

const reviewerRoleSchema = z.enum([
  "seo-reviewer",
  "subject-matter-reviewer",
  "quality-reviewer",
]);

const digestSchema = z.string().regex(DIGEST_PATTERN);

function isValidIsoTimestamp(value: string): boolean {
  const match = ISO_TIMESTAMP_PATTERN.exec(value);
  if (match === null || !Number.isFinite(Date.parse(value))) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const timestampSchema = z.string().refine(isValidIsoTimestamp);
const repositoryPathSchema = z
  .string()
  .min(1)
  .transform((value, context) => {
    try {
      return normalizeRepositoryRelativePosixPath(value);
    } catch {
      context.addIssue({ code: "custom", message: "Invalid repository path." });
      return z.NEVER;
    }
  });

const pendingDigestApprovalSchema = z
  .object({
    status: z.literal("pending"),
    digest: digestSchema,
    approvedAt: z.null(),
    reviewerRole: z.null(),
    evidencePath: z.null(),
  })
  .strict();

const approvedDigestApprovalSchema = z
  .object({
    status: z.literal("approved"),
    digest: digestSchema,
    approvedAt: timestampSchema,
    reviewerRole: reviewerRoleSchema,
    evidencePath: repositoryPathSchema,
  })
  .strict();

const strictCutoverApprovalSchema = z.discriminatedUnion("status", [
  z
    .object({
      ticket: z.literal("13"),
      status: z.literal("pending"),
      digest: z.null(),
      approvedAt: z.null(),
      reviewerRole: z.null(),
      evidencePath: z.null(),
    })
    .strict(),
  z
    .object({
      ticket: z.literal("13"),
      status: z.literal("approved"),
      digest: digestSchema,
      approvedAt: timestampSchema,
      reviewerRole: reviewerRoleSchema,
      evidencePath: repositoryPathSchema,
    })
    .strict(),
]);

const platformApprovalSchema = z.discriminatedUnion("status", [
  z
    .object({
      platform: z.enum(GEO_PLATFORMS),
      status: z.literal("pending"),
      approvedAt: z.null(),
      reviewerRole: z.null(),
      evidencePath: z.null(),
    })
    .strict(),
  z
    .object({
      platform: z.enum(GEO_PLATFORMS),
      status: z.literal("approved"),
      approvedAt: timestampSchema,
      reviewerRole: reviewerRoleSchema,
      evidencePath: repositoryPathSchema,
    })
    .strict(),
]);

const inputEnvelopeSchema = z
  .object({
    schemaVersion: z.literal(GEO_CLUSTER_BASELINE_SCHEMA_VERSION),
    asOf: timestampSchema,
    claimMode: z.literal("observation-only"),
    cluster: clusterIdSchema,
    questionSet: z.unknown(),
    questionSetApproval: z.discriminatedUnion("status", [
      pendingDigestApprovalSchema,
      approvedDigestApprovalSchema,
    ]),
    strictCutoverApproval: strictCutoverApprovalSchema,
    platformApprovals: z
      .array(platformApprovalSchema)
      .length(GEO_PLATFORMS.length),
    runs: z.array(z.unknown()),
    snapshotContents: z.record(
      z.string(),
      z.union([z.string(), z.instanceof(Uint8Array)]),
    ),
  })
  .strict()
  .superRefine((input, context) => {
    const platforms = input.platformApprovals.map(({ platform }) => platform);
    const unique = new Set(platforms);
    if (
      unique.size !== GEO_PLATFORMS.length ||
      GEO_PLATFORMS.some((platform) => !unique.has(platform))
    ) {
      context.addIssue({
        code: "custom",
        path: ["platformApprovals"],
        message: "Platform approvals must cover each canonical platform once.",
      });
    }
  });

type DeepReadonly<T> = T extends object
  ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
  : T;

function deepFreeze<T>(value: T): DeepReadonly<T>;
function deepFreeze(value: unknown): unknown {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }
  return Object.freeze(value);
}

function parseInput(input: GeoClusterBaselineInput): {
  envelope: Omit<GeoClusterBaselineInput, "questionSet" | "runs">;
  questionSet: QuestionSet;
  runs: GeoRunRecord[];
} {
  const parsed = inputEnvelopeSchema.safeParse(input);
  if (!parsed.success) {
    throw new GeoBaselineContractError();
  }

  try {
    const questionSet = parseQuestionSet(parsed.data.questionSet);
    const runs = parsed.data.runs.map(parseGeoRunRecord);
    const runIds = new Set<string>();
    for (const run of runs) {
      if (runIds.has(run.manifest.runId)) {
        throw new GeoBaselineContractError();
      }
      runIds.add(run.manifest.runId);
    }
    return {
      envelope: {
        schemaVersion: parsed.data.schemaVersion,
        asOf: parsed.data.asOf,
        claimMode: parsed.data.claimMode,
        cluster: parsed.data.cluster,
        questionSetApproval: parsed.data.questionSetApproval,
        strictCutoverApproval: parsed.data.strictCutoverApproval,
        platformApprovals: parsed.data.platformApprovals,
        snapshotContents: parsed.data.snapshotContents,
      },
      questionSet,
      runs,
    };
  } catch (error) {
    if (error instanceof GeoBaselineContractError) {
      throw error;
    }
    throw new GeoBaselineContractError();
  }
}

export function computeGeoQuestionSetDigest(input: unknown): string {
  const questionSet = parseQuestionSet(input);
  return hashCanonical({
    version: questionSet.version,
    asOfDate: questionSet.asOfDate,
    cluster: questionSet.cluster,
    status: questionSet.status,
    questions: questionSet.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      buyerStage: question.buyerStage,
      intent: question.intent,
      targetMarket: question.targetMarket,
    })),
  });
}

function addReason(
  reasons: Set<GeoBaselineGateReason>,
  reason: GeoBaselineGateReason,
): void {
  reasons.add(reason);
}

function isFuture(value: string, asOf: string): boolean {
  return Date.parse(value) > Date.parse(asOf);
}

function verifySnapshotIntegrity(
  runs: readonly GeoRunRecord[],
  contents: Readonly<Record<string, string | Uint8Array>>,
): void {
  const normalizedContents = new Map<string, string | Uint8Array>();
  try {
    for (const [path, content] of Object.entries(contents)) {
      const normalized = normalizeRepositoryRelativePosixPath(path);
      if (normalizedContents.has(normalized)) {
        throw new GeoBaselineContractError();
      }
      normalizedContents.set(normalized, content);
    }

    for (const run of runs) {
      for (const observation of run.observations) {
        if (observation.snapshot === null) {
          continue;
        }
        const content = normalizedContents.get(observation.snapshot.path);
        if (
          content === undefined ||
          hashBytes(content) !== observation.snapshot.hash
        ) {
          throw new GeoBaselineContractError();
        }
      }
    }
  } catch (error) {
    if (error instanceof GeoBaselineContractError) {
      throw error;
    }
    throw new GeoBaselineContractError();
  }
}

function questionSetMatchesRun(
  questionSet: QuestionSet,
  run: GeoRunRecord,
): boolean {
  if (
    run.manifest.questions.length !== questionSet.questions.length ||
    run.manifest.questions.some(
      ({ cluster }) => cluster !== questionSet.cluster,
    )
  ) {
    return false;
  }
  const expected = new Map(
    questionSet.questions.map((question) => [question.id, question.prompt]),
  );
  return run.manifest.questions.every((question) => {
    const prompt = expected.get(question.questionId);
    return (
      prompt !== undefined &&
      question.prompt.text === prompt &&
      question.prompt.hash === hashBytes(prompt)
    );
  });
}

function isCompleteRun(run: GeoRunRecord): boolean {
  const expected =
    run.manifest.questions.length * run.manifest.expectedRepetitions;
  if (run.observations.length !== expected) {
    return false;
  }
  const observedSlots = new Set(
    run.observations
      .filter(
        ({ status }) =>
          status === "observed-answer" || status === "observed-surface-absent",
      )
      .map(({ questionId, repetition }) => `${questionId}:${repetition}`),
  );
  return run.manifest.questions.every((question) => {
    for (
      let repetition = 1;
      repetition <= run.manifest.expectedRepetitions;
      repetition += 1
    ) {
      if (!observedSlots.has(`${question.questionId}:${repetition}`)) {
        return false;
      }
    }
    return true;
  });
}

function platformReport(
  platform: GeoPlatform,
  approved: boolean,
  runs: readonly GeoRunRecord[],
): GeoBaselinePlatformReport {
  const platformRuns = runs.filter(
    ({ manifest }) => manifest.platform === platform,
  );
  return {
    platform,
    approved,
    liveRunCount: platformRuns.length,
    completeRunCount: platformRuns.filter(isCompleteRun).length,
    observationCount: platformRuns.reduce(
      (count, run) => count + run.observations.length,
      0,
    ),
    expectedObservationCount: platformRuns.reduce(
      (count, run) =>
        count +
        run.manifest.questions.length * run.manifest.expectedRepetitions,
      0,
    ),
  };
}

function evidencePaths(runs: readonly GeoRunRecord[]): string[] {
  const paths = new Set<string>();
  for (const run of runs) {
    paths.add(run.manifest.evidencePath);
    for (const observation of run.observations) {
      paths.add(observation.evidencePath);
      if (observation.snapshot !== null) {
        paths.add(observation.snapshot.path);
      }
      if (observation.review !== null) {
        paths.add(observation.review.evidencePath);
      }
      observation.citations.forEach(({ evidencePath }) =>
        paths.add(evidencePath),
      );
      observation.competitors.forEach(({ evidencePath }) =>
        paths.add(evidencePath),
      );
    }
  }
  return [...paths].sort(compareUnicodeCodePoints);
}

function qualityRisks(observations: readonly GeoObservation[]) {
  const unsupported = observations
    .filter(({ review }) => review?.accuracy === "fail")
    .map(({ observationId }) => observationId);
  const misleading = observations
    .filter(
      ({ citations, review }) =>
        review?.citationIntegrity === "misleading" ||
        citations.some(({ integrity }) => integrity === "misleading"),
    )
    .map(({ observationId }) => observationId);
  const unverified = observations
    .filter(({ citations }) =>
      citations.some(({ integrity }) => integrity === "unverified"),
    )
    .map(({ observationId }) => observationId);
  return {
    unsupportedAnswerObservationIds: unsupported.sort(compareUnicodeCodePoints),
    misleadingCitationObservationIds: misleading.sort(compareUnicodeCodePoints),
    unverifiedCitationObservationIds: unverified.sort(compareUnicodeCodePoints),
  };
}

export function evaluateGeoClusterBaseline(
  input: GeoClusterBaselineInput,
): GeoClusterBaselineReport {
  const { envelope, questionSet, runs } = parseInput(input);
  verifySnapshotIntegrity(runs, envelope.snapshotContents);

  const reasons = new Set<GeoBaselineGateReason>();
  const asOf = envelope.asOf;
  const questionSetDigest = computeGeoQuestionSetDigest(questionSet);
  const questionSetApproved =
    envelope.questionSetApproval.status === "approved" &&
    envelope.questionSetApproval.digest === questionSetDigest;

  if (questionSet.cluster !== envelope.cluster) {
    addReason(reasons, "question-set-cluster-mismatch");
  }
  if (envelope.questionSetApproval.status !== "approved") {
    addReason(reasons, "question-set-unapproved");
  } else if (envelope.questionSetApproval.digest !== questionSetDigest) {
    addReason(reasons, "question-set-digest-mismatch");
  }
  if (envelope.strictCutoverApproval.status !== "approved") {
    addReason(reasons, "strict-cutover-unapproved");
  }

  const approvalDates = [
    envelope.questionSetApproval.status === "approved"
      ? envelope.questionSetApproval.approvedAt
      : null,
    envelope.strictCutoverApproval.status === "approved"
      ? envelope.strictCutoverApproval.approvedAt
      : null,
    ...envelope.platformApprovals.map((approval) =>
      approval.status === "approved" ? approval.approvedAt : null,
    ),
  ].filter((value): value is string => value !== null);
  if (approvalDates.some((date) => isFuture(date, asOf))) {
    addReason(reasons, "future-approval");
  }

  const approvedPlatforms = new Set(
    envelope.platformApprovals
      .filter(({ status }) => status === "approved")
      .map(({ platform }) => platform),
  );
  if (approvedPlatforms.size === 0) {
    addReason(reasons, "no-approved-platforms");
  }

  const fixtureRuns = runs.filter(
    ({ manifest }) =>
      manifest.fixtureOnly || manifest.provenance === "synthetic-fixture",
  );
  if (fixtureRuns.length > 0) {
    addReason(reasons, "fixture-run-present");
  }
  const liveRuns = runs.filter(
    ({ manifest }) =>
      !manifest.fixtureOnly &&
      manifest.provenance === "external-platform-observation",
  );
  if (liveRuns.length === 0) {
    addReason(reasons, "no-live-observations");
  }

  if (
    liveRuns.some(({ manifest }) => !approvedPlatforms.has(manifest.platform))
  ) {
    addReason(reasons, "unapproved-platform-observation");
  }
  if (liveRuns.some((run) => !questionSetMatchesRun(questionSet, run))) {
    addReason(reasons, "question-set-drift");
  }
  const expectedQuestionSetVersion = `question-set-v${questionSet.version}`;
  if (
    liveRuns.some(
      ({ manifest }) =>
        manifest.questionSetVersion !== expectedQuestionSetVersion,
    )
  ) {
    addReason(reasons, "version-mismatch");
  }

  const observations = liveRuns.flatMap(({ observations }) => observations);
  if (observations.some(({ observedAt }) => isFuture(observedAt, asOf))) {
    addReason(reasons, "future-observation");
  }

  const platforms = GEO_PLATFORMS.map((platform) =>
    platformReport(platform, approvedPlatforms.has(platform), liveRuns),
  );
  if (
    [...approvedPlatforms].some((platform) => {
      const report = platforms.find(
        (candidate) => candidate.platform === platform,
      );
      return report === undefined || report.completeRunCount === 0;
    })
  ) {
    addReason(reasons, "incomplete-observation-slots");
  }

  const prerequisiteReasons = new Set<GeoBaselineGateReason>([
    "future-approval",
    "no-approved-platforms",
    "question-set-cluster-mismatch",
    "question-set-digest-mismatch",
    "question-set-drift",
    "question-set-unapproved",
    "strict-cutover-unapproved",
    "unapproved-platform-observation",
    "version-mismatch",
  ]);
  const executable = ![...reasons].some((reason) =>
    prerequisiteReasons.has(reason),
  );
  const complete = executable && reasons.size === 0;
  const metricsInvalidReasons = new Set<GeoBaselineGateReason>([
    "future-observation",
    "question-set-cluster-mismatch",
    "question-set-drift",
    "unapproved-platform-observation",
    "version-mismatch",
  ]);
  const metrics =
    observations.length === 0 ||
    [...reasons].some((reason) => metricsInvalidReasons.has(reason))
      ? null
      : scoreGeoObservations(observations);

  const reportWithoutDigest = {
    schemaVersion: GEO_CLUSTER_BASELINE_SCHEMA_VERSION,
    asOf,
    claimMode: "observation-only" as const,
    cluster: envelope.cluster,
    executable,
    complete,
    reasons: [...reasons].sort(
      (left, right) =>
        GEO_BASELINE_GATE_REASONS.indexOf(left) -
        GEO_BASELINE_GATE_REASONS.indexOf(right),
    ),
    questionSet: {
      version: expectedQuestionSetVersion,
      digest: questionSetDigest,
      approved: questionSetApproved,
    },
    platforms,
    runIds: liveRuns
      .map(({ manifest }) => manifest.runId)
      .sort(compareUnicodeCodePoints),
    observationCount: observations.length,
    expectedObservationCount: liveRuns.reduce(
      (count, run) =>
        count +
        run.manifest.questions.length * run.manifest.expectedRepetitions,
      0,
    ),
    metrics,
    qualityRisks: qualityRisks(observations),
    rawEvidencePaths: evidencePaths(liveRuns),
    methodologyStatement:
      "This is an observation baseline. It records answer-surface output without causal inference or optimisation-outcome claims.",
  };
  const report: GeoClusterBaselineReport = {
    ...reportWithoutDigest,
    reportDigest: hashCanonical(reportWithoutDigest),
  };
  return deepFreeze(report) as GeoClusterBaselineReport;
}
