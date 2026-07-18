import {
  aggregateGeoBenchmark,
  compareUnicodeCodePoints,
  hashCanonical,
  parseGeoRunRecord,
  type GeoObservation,
  type GeoRunRecord,
} from "../geo";
import {
  assertGeoBenchmarkDefinitionIntegrity,
  createGeoBenchmarkVersionIdentity,
  deepFreezeGeoBenchmark,
} from "./contract";
import {
  GEO_BENCHMARK_METRIC_NAMES,
  GeoBenchmarkContractError,
  GeoBenchmarkFixtureIsolationError,
  GeoBenchmarkVersionDriftError,
  type GeoBenchmarkDefinition,
  type GeoBenchmarkMetricName,
  type GeoBenchmarkMetricSummaries,
  type GeoBenchmarkMetricSummary,
  type GeoBenchmarkMetricValues,
  type GeoBenchmarkObservationLineage,
  type GeoBenchmarkPeriod,
  type GeoBenchmarkPeriodResult,
  type GeoBenchmarkPeriodStatus,
  type GeoBenchmarkPublicationApprovals,
  type GeoBenchmarkRunEnvelope,
} from "./types";

const PERIOD_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{2,127}$/;
const RFC3339_WITH_OFFSET_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const AGGREGATE_INPUT_KEYS = [
  "definition",
  "period",
  "runs",
  "snapshotContents",
  "approvals",
  "evidenceBoundary",
] as const;
const PERIOD_KEYS = ["periodId", "observedFrom", "observedThrough"] as const;
const PRODUCTION_ENVELOPE_KEYS = [
  "dataClass",
  "visibility",
  "versionIdentity",
  "record",
] as const;
const FIXTURE_ENVELOPE_KEYS = [
  "dataClass",
  "visibility",
  "versionIdentity",
  "record",
] as const;
const APPROVAL_KEYS = [
  "questionSet",
  "quality",
  "retention",
  "privacy",
  "publication",
] as const;
const APPROVAL_RECORD_KEYS = [
  "status",
  "approvedAt",
  "reviewerRole",
  "evidencePath",
] as const;
const APPROVAL_REVIEWER_ROLES = new Set([
  "seo-reviewer",
  "subject-matter-reviewer",
  "quality-reviewer",
  "privacy-reviewer",
  "publication-reviewer",
]);
const EVIDENCE_PATH_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]{2,255}$/;

export type GeoBenchmarkApprovalName = keyof GeoBenchmarkPublicationApprovals;

export interface GeoBenchmarkProductionEvidenceVerifier {
  verifyRun(envelope: GeoBenchmarkRunEnvelope): boolean;
  verifyApproval(
    approvalName: GeoBenchmarkApprovalName,
    rawApproval: unknown,
    normalizedApproval: GeoBenchmarkPublicationApprovals[GeoBenchmarkApprovalName],
  ): boolean;
}

export interface GeoBenchmarkEvidenceBoundary {
  readonly mode: "production" | "synthetic-dry-run";
}

type EvidenceBoundaryState =
  | {
      mode: "production";
      verifier: GeoBenchmarkProductionEvidenceVerifier;
    }
  | {
      mode: "synthetic-dry-run";
    };

const EVIDENCE_BOUNDARY_STATES = new WeakMap<object, EvidenceBoundaryState>();
const TRUSTED_PERIOD_RESULTS = new WeakSet<object>();

export function createGeoBenchmarkProductionEvidenceBoundary(
  verifier: GeoBenchmarkProductionEvidenceVerifier,
): GeoBenchmarkEvidenceBoundary {
  if (
    verifier === null ||
    typeof verifier !== "object" ||
    typeof verifier.verifyRun !== "function" ||
    typeof verifier.verifyApproval !== "function"
  ) {
    throw new GeoBenchmarkContractError(
      "Production evidence boundary requires opaque run and approval verifiers.",
      { reason: "contract_violation" },
    );
  }
  const boundary = Object.freeze({ mode: "production" as const });
  const capturedVerifier = Object.freeze({
    verifyRun: verifier.verifyRun.bind(verifier),
    verifyApproval: verifier.verifyApproval.bind(verifier),
  });
  EVIDENCE_BOUNDARY_STATES.set(boundary, {
    mode: "production",
    verifier: capturedVerifier,
  });
  return boundary;
}

export function createGeoBenchmarkSyntheticEvidenceBoundary(): GeoBenchmarkEvidenceBoundary {
  const boundary = Object.freeze({ mode: "synthetic-dry-run" as const });
  EVIDENCE_BOUNDARY_STATES.set(boundary, { mode: "synthetic-dry-run" });
  return boundary;
}

function productionRunEvidenceAccepted(
  verifier: GeoBenchmarkProductionEvidenceVerifier,
  envelope: GeoBenchmarkRunEnvelope,
): boolean {
  try {
    return verifier.verifyRun(envelope) === true;
  } catch {
    throw new GeoBenchmarkFixtureIsolationError(
      "Production run evidence verifier failed closed.",
    );
  }
}

function productionApprovalEvidenceAccepted(
  verifier: GeoBenchmarkProductionEvidenceVerifier,
  approvalName: GeoBenchmarkApprovalName,
  rawApproval: unknown,
  normalizedApproval: GeoBenchmarkPublicationApprovals[GeoBenchmarkApprovalName],
): boolean {
  try {
    return (
      verifier.verifyApproval(approvalName, rawApproval, normalizedApproval) ===
      true
    );
  } catch {
    throw new GeoBenchmarkContractError(
      `${approvalName} approval verifier failed closed.`,
      { reason: "approval_required" },
    );
  }
}

function evidenceBoundaryState(input: unknown): EvidenceBoundaryState {
  if (
    input === null ||
    (typeof input !== "object" && typeof input !== "function")
  ) {
    throw new GeoBenchmarkContractError(
      "Aggregate input requires an opaque evidence boundary.",
      { reason: "contract_violation" },
    );
  }
  const state = EVIDENCE_BOUNDARY_STATES.get(input);
  if (state === undefined) {
    throw new GeoBenchmarkContractError(
      "Aggregate input evidence boundary is not runtime-trusted.",
      { reason: "contract_violation" },
    );
  }
  return state;
}

export function assertTrustedGeoBenchmarkPeriodResult(
  input: unknown,
): asserts input is GeoBenchmarkPeriodResult {
  if (
    input === null ||
    typeof input !== "object" ||
    !TRUSTED_PERIOD_RESULTS.has(input)
  ) {
    throw new GeoBenchmarkContractError(
      "Geo benchmark period result must come from the runtime-trusted aggregate boundary.",
      { reason: "contract_violation" },
    );
  }
}

type UnknownRecord = Record<string, unknown>;

function isRecord(input: unknown): input is UnknownRecord {
  return input !== null && typeof input === "object" && !Array.isArray(input);
}

function assertExactKeys(
  input: UnknownRecord,
  allowed: readonly string[],
  required: readonly string[],
  field: string,
): void {
  const keys = Object.keys(input);
  if (
    keys.some((key) => !allowed.includes(key)) ||
    required.some((key) => !Object.hasOwn(input, key))
  ) {
    throw new GeoBenchmarkContractError(
      `${field} must contain exactly the documented keys.`,
    );
  }
}

function timestampValue(value: string, field: string): number {
  const parsed = Date.parse(value);
  if (!RFC3339_WITH_OFFSET_PATTERN.test(value) || !Number.isFinite(parsed)) {
    throw new GeoBenchmarkContractError(
      `${field} must be an explicit RFC 3339 timestamp with an offset.`,
    );
  }
  return parsed;
}

function parsePeriod(input: unknown): GeoBenchmarkPeriod {
  if (!isRecord(input)) {
    throw new GeoBenchmarkContractError("period must be an object.");
  }
  assertExactKeys(input, PERIOD_KEYS, PERIOD_KEYS, "period");
  const { periodId, observedFrom, observedThrough } = input;
  if (
    typeof periodId !== "string" ||
    typeof observedFrom !== "string" ||
    typeof observedThrough !== "string" ||
    !PERIOD_ID_PATTERN.test(periodId)
  ) {
    throw new GeoBenchmarkContractError(
      "period must contain a valid periodId and explicit timestamps.",
    );
  }
  const from = timestampValue(observedFrom, "period.observedFrom");
  const through = timestampValue(observedThrough, "period.observedThrough");
  if (from > through) {
    throw new GeoBenchmarkContractError(
      "period.observedFrom must not be after period.observedThrough.",
      { reason: "invalid_period_order" },
    );
  }

  return deepFreezeGeoBenchmark({
    periodId,
    observedFrom,
    observedThrough,
  });
}

function nullMetricValues(): GeoBenchmarkMetricValues {
  return {
    brandMention: null,
    ownedCitation: null,
    accuracy: null,
    completeness: null,
    competitorVisibility: null,
  };
}

function reviewedValue(
  value: "pass" | "fail" | "not-assessable" | undefined,
): boolean | null {
  if (value === "pass") {
    return true;
  }
  if (value === "fail") {
    return false;
  }
  return null;
}

function metricValues(observation: GeoObservation): GeoBenchmarkMetricValues {
  if (observation.status === "observed-answer") {
    return {
      brandMention: observation.brandMention,
      ownedCitation: observation.citations.some(
        (citation) => citation.kind === "owned",
      ),
      accuracy: reviewedValue(observation.review?.accuracy),
      completeness: reviewedValue(observation.review?.completeness),
      competitorVisibility: observation.competitors.some(
        (competitor) =>
          competitor.mentioned || competitor.cited || competitor.preferred,
      ),
    };
  }

  if (observation.status === "observed-surface-absent") {
    return {
      brandMention: false,
      ownedCitation: false,
      accuracy: null,
      completeness: null,
      competitorVisibility: false,
    };
  }

  return nullMetricValues();
}

function lineageSortKey(lineage: GeoBenchmarkObservationLineage): string {
  const observation = lineage.rawObservation;
  return [
    observation.platform,
    observation.questionId,
    String(observation.repetition).padStart(3, "0"),
    observation.observationId,
  ].join(":");
}

function assertEnvelopeVersionIdentity(
  envelope: GeoBenchmarkRunEnvelope,
  definition: GeoBenchmarkDefinition,
): void {
  if (envelope.versionIdentity === undefined) {
    throw new GeoBenchmarkContractError(
      "Run envelope must carry the complete benchmark version identity.",
      { reason: "version_identity_mismatch" },
    );
  }

  try {
    const normalized = createGeoBenchmarkVersionIdentity({
      schemaVersion: envelope.versionIdentity.schemaVersion,
      benchmarkVersion: envelope.versionIdentity.benchmarkVersion,
      methodologyVersion: envelope.versionIdentity.methodologyVersion,
      questionSetVersion: envelope.versionIdentity.questionSetVersion,
      observationSchemaVersion:
        envelope.versionIdentity.observationSchemaVersion,
      scoringVersion: envelope.versionIdentity.scoringVersion,
      redactionPolicyVersion: envelope.versionIdentity.redactionPolicyVersion,
      supplied: envelope.versionIdentity,
    });
    if (
      hashCanonical(normalized) !==
      hashCanonical(definition.identity.versionIdentity)
    ) {
      throw new GeoBenchmarkContractError(
        "Run envelope version identity does not match the immutable benchmark definition.",
        { reason: "version_identity_mismatch" },
      );
    }
  } catch (error) {
    if (error instanceof GeoBenchmarkContractError) {
      throw error;
    }
    if (error instanceof GeoBenchmarkVersionDriftError) {
      throw new GeoBenchmarkContractError(error.message, {
        reason: "version_identity_mismatch",
      });
    }
    throw new GeoBenchmarkContractError(
      "Run envelope version identity is invalid.",
      { reason: "version_identity_mismatch" },
    );
  }
}

function assertEnvelopeClassification(
  envelope: GeoBenchmarkRunEnvelope,
  record: GeoRunRecord,
): void {
  if (envelope.dataClass !== "fixture" && envelope.dataClass !== "production") {
    throw new GeoBenchmarkContractError(
      "Run envelope dataClass must be fixture or production.",
    );
  }
  if (envelope.dataClass === "fixture") {
    if (
      envelope.visibility !== "non_public" ||
      !record.manifest.fixtureOnly ||
      record.manifest.provenance !== "synthetic-fixture"
    ) {
      throw new GeoBenchmarkFixtureIsolationError(
        "Synthetic runs must be explicitly classified fixture/non_public.",
      );
    }
    return;
  }

  if (
    envelope.visibility !== "internal" ||
    record.manifest.fixtureOnly ||
    record.manifest.provenance !== "external-platform-observation"
  ) {
    throw new GeoBenchmarkFixtureIsolationError(
      "Production runs must be internal, external-platform observations and may not contain fixtures.",
    );
  }
}

export function projectGeoBenchmarkRunLineage(
  envelope: GeoBenchmarkRunEnvelope,
): readonly GeoBenchmarkObservationLineage[] {
  const record = parseGeoRunRecord(envelope.record);
  assertEnvelopeClassification(envelope, record);

  const lineage = record.observations
    .map(
      (observation): GeoBenchmarkObservationLineage => ({
        dataClass: envelope.dataClass,
        visibility: envelope.visibility,
        publishable: false,
        runId: record.manifest.runId,
        manifestEvidencePath: record.manifest.evidencePath,
        rawObservation: observation,
        metricValues: metricValues(observation),
      }),
    )
    .sort((left, right) =>
      compareUnicodeCodePoints(lineageSortKey(left), lineageSortKey(right)),
    );

  return deepFreezeGeoBenchmark(lineage);
}

export function summarizeGeoBenchmarkLineage(
  lineage: readonly GeoBenchmarkObservationLineage[],
): GeoBenchmarkMetricSummaries {
  const summaries = Object.fromEntries(
    GEO_BENCHMARK_METRIC_NAMES.map((metricName) => {
      let numerator = 0;
      let denominator = 0;

      for (const item of lineage) {
        const value = item.metricValues[metricName];
        if (value === null) {
          continue;
        }
        denominator += 1;
        if (value) {
          numerator += 1;
        }
      }

      return [
        metricName,
        {
          numerator,
          denominator,
          rate: denominator === 0 ? null : numerator / denominator,
        },
      ];
    }),
  ) as Record<GeoBenchmarkMetricName, GeoBenchmarkMetricSummary>;

  return deepFreezeGeoBenchmark(summaries);
}

function expectedQuestionMap(definition: GeoBenchmarkDefinition) {
  return new Map(
    definition.questionSet.questions.map((question) => [
      question.questionId,
      question,
    ]),
  );
}

function assertRunMatchesDefinition(
  envelope: GeoBenchmarkRunEnvelope,
  record: GeoRunRecord,
  definition: GeoBenchmarkDefinition,
  period: GeoBenchmarkPeriod,
): void {
  assertEnvelopeVersionIdentity(envelope, definition);
  const manifest = record.manifest;
  const methodology = definition.methodology;
  const versionsMatch =
    manifest.schemaVersion === methodology.observationSchemaVersion &&
    manifest.methodologyVersion === methodology.methodologyVersion &&
    manifest.benchmarkVersion === definition.identity.benchmarkVersion &&
    manifest.questionSetVersion === definition.questionSet.version;
  if (!versionsMatch) {
    throw new GeoBenchmarkContractError(
      "Run versions do not match the immutable benchmark definition.",
    );
  }
  if (
    !methodology.platforms.includes(manifest.platform) ||
    manifest.locale !== methodology.locale ||
    manifest.expectedRepetitions !== methodology.repetitions
  ) {
    throw new GeoBenchmarkContractError(
      "Run platform, locale, or repetitions do not match the methodology.",
    );
  }
  if (manifest.questions.length !== definition.questionSet.questionCount) {
    throw new GeoBenchmarkContractError(
      "Each production run manifest must bind all 50 benchmark questions.",
    );
  }

  const expectedQuestions = expectedQuestionMap(definition);
  const manifestIds = new Set<string>();
  for (const question of manifest.questions) {
    const expected = expectedQuestions.get(question.questionId);
    if (
      expected === undefined ||
      manifestIds.has(question.questionId) ||
      question.cluster !== expected.cluster ||
      question.prompt.version !== definition.questionSet.promptVersion ||
      question.prompt.text !== expected.prompt ||
      question.prompt.hash !== expected.promptHash
    ) {
      throw new GeoBenchmarkContractError(
        "Run questions do not match the versioned 50-question contract.",
      );
    }
    manifestIds.add(question.questionId);
  }

  const from = timestampValue(period.observedFrom, "period.observedFrom");
  const through = timestampValue(
    period.observedThrough,
    "period.observedThrough",
  );
  for (const observation of record.observations) {
    const observedAt = timestampValue(
      observation.observedAt,
      "observation.observedAt",
    );
    if (observedAt < from || observedAt > through) {
      throw new GeoBenchmarkContractError(
        "Observation timestamp falls outside the declared benchmark period.",
      );
    }
    if (
      observation.snapshot !== null &&
      observation.snapshot.redaction.policyVersion !==
        definition.identity.versionIdentity.redactionPolicyVersion
    ) {
      throw new GeoBenchmarkContractError(
        "Observation snapshot redaction policy does not match the benchmark definition identity.",
        { reason: "version_identity_mismatch" },
      );
    }
  }
}

function expectedSlotKeys(definition: GeoBenchmarkDefinition): Set<string> {
  const slots = new Set<string>();
  for (const platform of definition.methodology.platforms) {
    for (const question of definition.questionSet.questions) {
      for (
        let repetition = 1;
        repetition <= definition.methodology.repetitions;
        repetition += 1
      ) {
        slots.add(`${platform}:${question.questionId}:${repetition}`);
      }
    }
  }
  return slots;
}

function recordedSlotKey(observation: GeoObservation): string {
  return `${observation.platform}:${observation.questionId}:${observation.repetition}`;
}

function isResolvedObservation(observation: GeoObservation): boolean {
  return (
    observation.status === "observed-answer" ||
    observation.status === "observed-surface-absent"
  );
}

export interface AggregateGeoBenchmarkPeriodInput {
  definition: GeoBenchmarkDefinition;
  period: GeoBenchmarkPeriod;
  runs: readonly GeoBenchmarkRunEnvelope[];
  snapshotContents?: Readonly<Record<string, string | Uint8Array>>;
  approvals?: GeoBenchmarkPublicationApprovals;
  evidenceBoundary: GeoBenchmarkEvidenceBoundary;
}

function pendingApproval() {
  return {
    status: "pending" as const,
    approvedAt: null,
    reviewerRole: null,
    evidencePath: null,
  };
}

function parseApprovals(input: unknown): {
  value: GeoBenchmarkPublicationApprovals;
  raw: UnknownRecord | undefined;
} {
  if (input === undefined) {
    return {
      value: deepFreezeGeoBenchmark({
        questionSet: pendingApproval(),
        quality: pendingApproval(),
        retention: pendingApproval(),
        privacy: pendingApproval(),
        publication: pendingApproval(),
      }),
      raw: undefined,
    };
  }
  if (!isRecord(input)) {
    throw new GeoBenchmarkContractError("approvals must be an object.");
  }
  assertExactKeys(input, APPROVAL_KEYS, APPROVAL_KEYS, "approvals");

  const entries = APPROVAL_KEYS.map((approvalName) => {
    const approval = input[approvalName];
    if (!isRecord(approval)) {
      throw new GeoBenchmarkContractError(
        `approvals.${approvalName} must be an object.`,
      );
    }
    assertExactKeys(
      approval,
      APPROVAL_RECORD_KEYS,
      APPROVAL_RECORD_KEYS,
      `approvals.${approvalName}`,
    );
    if (approval.status === "pending") {
      if (
        approval.approvedAt !== null ||
        approval.reviewerRole !== null ||
        approval.evidencePath !== null
      ) {
        throw new GeoBenchmarkContractError(
          `Pending ${approvalName} approval cannot carry approval evidence.`,
          { reason: "approval_required" },
        );
      }
      return [approvalName, pendingApproval()] as const;
    }
    if (
      approval.status !== "approved" ||
      typeof approval.approvedAt !== "string" ||
      typeof approval.reviewerRole !== "string" ||
      !APPROVAL_REVIEWER_ROLES.has(approval.reviewerRole) ||
      typeof approval.evidencePath !== "string" ||
      !EVIDENCE_PATH_PATTERN.test(approval.evidencePath) ||
      approval.evidencePath.includes("..")
    ) {
      throw new GeoBenchmarkContractError(
        `${approvalName} approval must contain valid human review evidence.`,
        { reason: "approval_required" },
      );
    }
    timestampValue(approval.approvedAt, `approvals.${approvalName}.approvedAt`);
    return [
      approvalName,
      {
        status: "approved" as const,
        approvedAt: approval.approvedAt,
        reviewerRole:
          approval.reviewerRole as GeoBenchmarkPublicationApprovals[typeof approvalName]["reviewerRole"],
        evidencePath: approval.evidencePath,
      },
    ] as const;
  });

  return {
    value: deepFreezeGeoBenchmark(
      Object.fromEntries(
        entries,
      ) as unknown as GeoBenchmarkPublicationApprovals,
    ),
    raw: input,
  };
}

function parseRunEnvelope(input: unknown): GeoBenchmarkRunEnvelope {
  if (!isRecord(input)) {
    throw new GeoBenchmarkContractError("runs entries must be objects.");
  }
  const allowed =
    input.dataClass === "fixture"
      ? FIXTURE_ENVELOPE_KEYS
      : PRODUCTION_ENVELOPE_KEYS;
  const required =
    input.dataClass === "fixture"
      ? ["dataClass", "visibility", "record"]
      : PRODUCTION_ENVELOPE_KEYS;
  assertExactKeys(input, allowed, required, "run envelope");
  if (
    (input.dataClass !== "production" && input.dataClass !== "fixture") ||
    !isRecord(input.record) ||
    (input.versionIdentity !== undefined && !isRecord(input.versionIdentity))
  ) {
    throw new GeoBenchmarkContractError("run envelope shape is invalid.");
  }
  return input as unknown as GeoBenchmarkRunEnvelope;
}

function parseSnapshotContents(
  input: unknown,
): Readonly<Record<string, string | Uint8Array>> | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (!isRecord(input)) {
    throw new GeoBenchmarkContractError(
      "snapshotContents must be a path-to-content object.",
    );
  }
  for (const content of Object.values(input)) {
    if (typeof content !== "string" && !(content instanceof Uint8Array)) {
      throw new GeoBenchmarkContractError(
        "snapshotContents values must be strings or Uint8Array values.",
      );
    }
  }
  return input as Readonly<Record<string, string | Uint8Array>>;
}

interface ParsedAggregateInput extends Omit<
  AggregateGeoBenchmarkPeriodInput,
  "approvals"
> {
  approvals: GeoBenchmarkPublicationApprovals;
  rawApprovals: UnknownRecord | undefined;
}

function parseAggregateInput(input: unknown): ParsedAggregateInput {
  if (!isRecord(input)) {
    throw new GeoBenchmarkContractError(
      "Aggregate GEO benchmark input must be an object.",
    );
  }
  if (!Object.hasOwn(input, "evidenceBoundary")) {
    throw new GeoBenchmarkContractError(
      "Aggregate input requires an opaque evidence boundary.",
      { reason: "contract_violation" },
    );
  }
  assertExactKeys(
    input,
    AGGREGATE_INPUT_KEYS,
    ["definition", "period", "runs", "evidenceBoundary"],
    "aggregate input",
  );
  if (!isRecord(input.definition) || !Array.isArray(input.runs)) {
    throw new GeoBenchmarkContractError(
      "Aggregate input requires a definition object and runs array.",
    );
  }

  const parsedApprovals = parseApprovals(input.approvals);
  return {
    definition: input.definition as unknown as GeoBenchmarkDefinition,
    period: parsePeriod(input.period),
    runs: input.runs.map(parseRunEnvelope),
    snapshotContents: parseSnapshotContents(input.snapshotContents),
    approvals: parsedApprovals.value,
    rawApprovals: parsedApprovals.raw,
    evidenceBoundary: input.evidenceBoundary as GeoBenchmarkEvidenceBoundary,
  };
}

export function aggregateGeoBenchmarkPeriod(
  input: unknown,
): GeoBenchmarkPeriodResult {
  const {
    definition,
    period,
    runs,
    snapshotContents,
    approvals,
    rawApprovals,
    evidenceBoundary,
  } = parseAggregateInput(input);
  const boundary = evidenceBoundaryState(evidenceBoundary);

  assertGeoBenchmarkDefinitionIntegrity(definition);
  const parsedRuns = runs.map((envelope) => {
    if (boundary.mode === "production") {
      if (envelope.dataClass !== "production") {
        throw new GeoBenchmarkFixtureIsolationError(
          "Production evidence boundary rejects synthetic or fixture runs.",
        );
      }
    } else if (envelope.dataClass !== "fixture") {
      throw new GeoBenchmarkFixtureIsolationError(
        "Synthetic dry-run boundary accepts only explicitly fixture runs.",
      );
    }

    const record = parseGeoRunRecord(envelope.record);
    assertEnvelopeClassification(envelope, record);
    assertRunMatchesDefinition(envelope, record, definition, period);
    if (
      boundary.mode === "production" &&
      !productionRunEvidenceAccepted(boundary.verifier, envelope)
    ) {
      throw new GeoBenchmarkFixtureIsolationError(
        "Production run evidence was not accepted by the opaque evidence verifier.",
      );
    }
    return { envelope, record };
  });
  const records = parsedRuns.map(({ record }) => record);
  const runIds = new Set<string>();
  for (const record of records) {
    if (runIds.has(record.manifest.runId)) {
      throw new GeoBenchmarkContractError(
        "Duplicate runId would overwrite existing benchmark evidence.",
      );
    }
    runIds.add(record.manifest.runId);
  }

  if (boundary.mode === "production" && rawApprovals !== undefined) {
    for (const approvalName of APPROVAL_KEYS) {
      const normalizedApproval = approvals[approvalName];
      if (
        normalizedApproval.status === "approved" &&
        !productionApprovalEvidenceAccepted(
          boundary.verifier,
          approvalName,
          rawApprovals[approvalName],
          normalizedApproval,
        )
      ) {
        throw new GeoBenchmarkContractError(
          `${approvalName} approval is not backed by runtime-trusted evidence.`,
          { reason: "approval_required" },
        );
      }
    }
  } else if (
    boundary.mode === "synthetic-dry-run" &&
    APPROVAL_KEYS.some(
      (approvalName) => approvals[approvalName].status === "approved",
    )
  ) {
    throw new GeoBenchmarkContractError(
      "Synthetic dry-run data cannot carry production approval evidence.",
      { reason: "approval_required" },
    );
  }

  const expectedSlots = expectedSlotKeys(definition);
  const recordedSlots = new Set<string>();
  const resolvedSlots = new Set<string>();
  for (const record of records) {
    for (const observation of record.observations) {
      const slot = recordedSlotKey(observation);
      if (!expectedSlots.has(slot) || recordedSlots.has(slot)) {
        throw new GeoBenchmarkContractError(
          "Observation slot is unexpected or duplicates prior evidence.",
        );
      }
      recordedSlots.add(slot);
      if (isResolvedObservation(observation)) {
        resolvedSlots.add(slot);
      }
    }
  }

  const shared = aggregateGeoBenchmark({
    runs: records,
    snapshotContents,
  });
  if (shared.status === "blocked_version_mismatch") {
    throw new GeoBenchmarkContractError(
      "Shared GEO aggregation rejected incompatible run versions.",
    );
  }

  const lineage = parsedRuns
    .flatMap(({ envelope, record }) =>
      projectGeoBenchmarkRunLineage({
        dataClass: envelope.dataClass,
        visibility: envelope.visibility,
        versionIdentity:
          envelope.versionIdentity ?? definition.identity.versionIdentity,
        record,
      }),
    )
    .sort((left, right) =>
      compareUnicodeCodePoints(lineageSortKey(left), lineageSortKey(right)),
    );
  const recordedObservationCount = lineage.length;
  const expectedSlotCount = expectedSlots.size;
  const recordedSlotCount = recordedSlots.size;
  const recordedUnresolvedSlotCount = recordedSlotCount - resolvedSlots.size;
  const missingSlotCount = expectedSlotCount - recordedSlotCount;
  const pendingSlotCount = expectedSlotCount - resolvedSlots.size;
  const completeResolvedCoverage =
    resolvedSlots.size === expectedSlotCount &&
    recordedSlotCount === expectedSlotCount;
  const baselineReady =
    boundary.mode === "production" &&
    shared.baselineReady &&
    completeResolvedCoverage;
  const status: GeoBenchmarkPeriodStatus = baselineReady
    ? "ready"
    : recordedObservationCount === 0
      ? "blocked_no_live_observations"
      : "partial_live_observations";
  const metrics = baselineReady ? summarizeGeoBenchmarkLineage(lineage) : null;
  const blockers: string[] = [];
  if (recordedObservationCount === 0) {
    blockers.push(
      "No live answer-engine observations are available; human approval of the question sets and real platform runs remain required.",
    );
  } else if (!completeResolvedCoverage) {
    blockers.push(
      "The period does not yet contain complete resolved coverage for every question, platform, and repetition slot.",
    );
  }
  const approvalLabels: Readonly<
    Record<keyof GeoBenchmarkPublicationApprovals, string>
  > = {
    questionSet: "Question-set",
    quality: "Quality",
    retention: "Retention",
    privacy: "Privacy",
    publication: "Publication",
  };
  const approvalsComplete =
    boundary.mode === "production" &&
    APPROVAL_KEYS.every(
      (approvalName) => approvals[approvalName].status === "approved",
    );
  for (const approvalName of APPROVAL_KEYS) {
    if (approvals[approvalName].status !== "approved") {
      blockers.push(
        `${approvalLabels[approvalName]} human approval is required before publication.`,
      );
    }
  }
  if (boundary.mode === "synthetic-dry-run") {
    blockers.push(
      "Synthetic fixture data is dry-run only and cannot establish production baseline evidence.",
    );
  }
  const publishable = baselineReady && approvalsComplete;
  const publicationLineage = lineage.map((item) => ({
    ...item,
    publishable,
  }));
  const result = deepFreezeGeoBenchmark({
    dataClass:
      boundary.mode === "production"
        ? ("production" as const)
        : ("fixture" as const),
    visibility:
      boundary.mode === "production"
        ? ("internal" as const)
        : ("non_public" as const),
    publishable,
    status,
    baselineReady,
    definition,
    period,
    metrics,
    lineage: publicationLineage,
    expectedSlotCount,
    recordedSlotCount,
    recordedUnresolvedSlotCount,
    missingSlotCount,
    pendingSlotCount,
    approvals,
    blockers,
  });
  TRUSTED_PERIOD_RESULTS.add(result);
  return result;
}
