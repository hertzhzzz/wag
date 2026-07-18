import { CANONICAL_CLUSTER_IDS, type ClusterId } from "../clusterSchema";
import {
  GEO_PLATFORMS,
  compareUnicodeCodePoints,
  hashBytes,
  hashCanonical,
  hashUtf8Text,
  type GeoPlatform,
} from "../geo";
import {
  normalizeBuyerPrompt,
  parseQuestionSet,
  type QuestionSet,
} from "../questionSets";
import { parseStrictGeoBenchmarkJson } from "./json";
import {
  assertGeoBenchmarkNeutralPrompt,
  assertGeoBenchmarkNeutralTextList,
} from "./policy";
import {
  GEO_BENCHMARK_CATALOG_ROOT,
  GEO_BENCHMARK_INPUT_MANIFEST_VERSION,
  GEO_BENCHMARK_SCHEMA_VERSION,
  GeoBenchmarkContractError,
  GeoBenchmarkManifestError,
  GeoBenchmarkVersionDriftError,
  type GeoBenchmarkCatalogSnapshot,
  type GeoBenchmarkClusterCounts,
  type GeoBenchmarkDefinition,
  type GeoBenchmarkErrorReason,
  type GeoBenchmarkInputManifest,
  type GeoBenchmarkMethodology,
  type GeoBenchmarkMethodologyInput,
  type GeoBenchmarkQuestion,
  type GeoBenchmarkQuestionSetContract,
  type GeoBenchmarkVersionIdentity,
} from "./types";

const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[A-Z]{2})?$/;
const TIMEZONE_PATTERN = /^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)+$/;
const RFC3339_WITH_OFFSET_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const MACHINE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;

const VERSION_IDENTITY_KEYS = [
  "schemaVersion",
  "benchmarkVersion",
  "methodologyVersion",
  "questionSetVersion",
  "observationSchemaVersion",
  "scoringVersion",
  "redactionPolicyVersion",
] as const;

const MANIFEST_KEYS = [
  "manifestVersion",
  "catalogRoot",
  "versionIdentity",
  "methodology",
  "questionSets",
] as const;

const SNAPSHOT_KEYS = ["path", "digest", "content"] as const;

const METHODOLOGY_INPUT_KEYS = [
  "benchmarkVersion",
  "methodologyVersion",
  "questionSetVersion",
  "observationSchemaVersion",
  "platforms",
  "locale",
  "timing",
  "repetitions",
  "scoringVersion",
  "citationCapture",
  "knownVariability",
] as const;

const METHODOLOGY_INPUT_KEYS_WITH_IDENTITY = [
  ...METHODOLOGY_INPUT_KEYS,
  "versionIdentity",
] as const;

const TIMING_KEYS = ["asOf", "cadence", "timezone"] as const;

const CITATION_CAPTURE_KEYS = [
  "mode",
  "captureOwnedUrls",
  "captureCompetitorUrls",
  "requireSnapshotEvidence",
  "redactionPolicyVersion",
] as const;

const DEFINITION_KEYS = ["identity", "questionSet", "methodology"] as const;

const IDENTITY_KEYS = [
  "schemaVersion",
  "versionIdentity",
  "benchmarkVersion",
  "benchmarkContentDigest",
  "benchmarkDigest",
  "benchmarkId",
] as const;

const QUESTION_SET_KEYS = [
  "version",
  "digest",
  "sourceDigest",
  "promptVersion",
  "questionCount",
  "clusterCounts",
  "questions",
] as const;

const QUESTION_KEYS = [
  "questionId",
  "cluster",
  "prompt",
  "normalizedPrompt",
  "promptHash",
  "sourceSetVersion",
  "sourceSetAsOfDate",
  "sourceSetStatus",
] as const;

const METHODOLOGY_OUTPUT_KEYS = [
  "versionIdentity",
  "benchmarkVersion",
  "methodologyVersion",
  "questionSetVersion",
  "observationSchemaVersion",
  "platforms",
  "locale",
  "timing",
  "repetitions",
  "scoringVersion",
  "citationCapture",
  "knownVariability",
  "questionSetDigest",
  "methodologyContentDigest",
  "methodologyDigest",
] as const;

type PlainRecord = Record<string, unknown>;

type VersionIdentityInput = {
  schemaVersion?: unknown;
  benchmarkVersion: unknown;
  methodologyVersion: unknown;
  questionSetVersion: unknown;
  observationSchemaVersion: unknown;
  scoringVersion: unknown;
  redactionPolicyVersion: unknown;
  supplied?: unknown;
};

function isRecord(value: unknown): value is PlainRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function displayError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function failContract(
  message: string,
  reason: GeoBenchmarkErrorReason = "contract_violation",
): never {
  throw new GeoBenchmarkContractError(message, { reason });
}

function failIntegrity(message: string): never {
  return failContract(message, "definition_integrity_mismatch");
}

function keysExactly(
  value: PlainRecord,
  expected: readonly string[],
  context: string,
): void {
  const actual = Object.keys(value).sort(compareUnicodeCodePoints);
  const wanted = [...expected].sort(compareUnicodeCodePoints);
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    failContract(`${context} contains unexpected or missing fields.`);
  }
}

function assertManifestKeys(
  value: PlainRecord,
  expected: readonly string[],
  context: string,
): void {
  const actual = Object.keys(value).sort(compareUnicodeCodePoints);
  const wanted = [...expected].sort(compareUnicodeCodePoints);
  if (
    actual.length !== wanted.length ||
    actual.some((key, index) => key !== wanted[index])
  ) {
    throw new GeoBenchmarkManifestError(
      `${context} contains unexpected or missing fields.`,
      "manifest_shape_invalid",
    );
  }
}

function isArrayIndexKey(key: string): boolean {
  if (!/^(?:0|[1-9][0-9]*)$/.test(key)) {
    return false;
  }
  const numeric = Number(key);
  return Number.isSafeInteger(numeric) && numeric >= 0 && numeric < 4294967295;
}

function cloneAndFreeze(
  value: unknown,
  active: WeakSet<object>,
  clones: WeakMap<object, unknown>,
): unknown {
  if (value === null) {
    return null;
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      failContract(
        "GEO benchmark values must contain finite numbers.",
        "unsupported_value",
      );
    }
    return value;
  }
  if (
    typeof value === "undefined" ||
    typeof value === "function" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  ) {
    failContract(
      "GEO benchmark values must be plain JSON-compatible data.",
      "unsupported_value",
    );
  }

  const objectValue = value as object;
  if (active.has(objectValue)) {
    failContract(
      "GEO benchmark values may not contain cycles.",
      "cyclic_value",
    );
  }
  const priorClone = clones.get(objectValue);
  if (priorClone !== undefined) {
    return priorClone;
  }

  active.add(objectValue);
  try {
    if (Array.isArray(value)) {
      const descriptors = Object.getOwnPropertyDescriptors(value);
      const clone: unknown[] = [];
      clones.set(objectValue, clone);
      const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
      if (
        lengthDescriptor === undefined ||
        "get" in lengthDescriptor ||
        "set" in lengthDescriptor ||
        typeof lengthDescriptor.value !== "number" ||
        !Number.isSafeInteger(lengthDescriptor.value) ||
        lengthDescriptor.value !== value.length
      ) {
        failContract(
          "GEO benchmark arrays must use a stable data length.",
          "unsupported_value",
        );
      }

      for (const key of Reflect.ownKeys(value)) {
        if (
          typeof key !== "string" ||
          (key !== "length" && !isArrayIndexKey(key))
        ) {
          failContract(
            "GEO benchmark arrays may not contain custom or symbol properties.",
            "unsupported_value",
          );
        }
        if (key === "length") {
          continue;
        }
        const descriptor = descriptors[key];
        if (
          descriptor === undefined ||
          "get" in descriptor ||
          "set" in descriptor ||
          !descriptor.enumerable
        ) {
          failContract(
            "GEO benchmark arrays must contain enumerable data properties only.",
            "unsupported_value",
          );
        }
      }

      for (let index = 0; index < value.length; index += 1) {
        const descriptor = descriptors[String(index)];
        if (descriptor === undefined || !("value" in descriptor)) {
          failContract(
            "GEO benchmark arrays may not contain holes.",
            "unsupported_value",
          );
        }
        clone[index] = cloneAndFreeze(descriptor.value, active, clones);
      }
      return Object.freeze(clone);
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      failContract(
        "GEO benchmark values must use plain object prototypes.",
        "unsupported_value",
      );
    }

    const descriptors = Object.getOwnPropertyDescriptors(value);
    const clone = Object.create(prototype) as PlainRecord;
    clones.set(objectValue, clone);
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== "string") {
        failContract(
          "GEO benchmark objects may not contain symbol properties.",
          "unsupported_value",
        );
      }
      const descriptor = descriptors[key];
      if (
        descriptor === undefined ||
        "get" in descriptor ||
        "set" in descriptor ||
        !descriptor.enumerable ||
        !("value" in descriptor)
      ) {
        failContract(
          "GEO benchmark objects must contain enumerable data properties only.",
          "unsupported_value",
        );
      }
      Object.defineProperty(clone, key, {
        configurable: true,
        enumerable: true,
        value: cloneAndFreeze(descriptor.value, active, clones),
        writable: true,
      });
    }
    return Object.freeze(clone);
  } finally {
    active.delete(objectValue);
  }
}

/**
 * Clone and deeply freeze JSON-shaped data. The caller's object graph is never
 * frozen or retained, which prevents alias-based mutation after validation.
 */
export function deepFreezeGeoBenchmark<T>(value: T): T {
  return cloneAndFreeze(
    value,
    new WeakSet<object>(),
    new WeakMap<object, unknown>(),
  ) as T;
}

function requireVersion(value: unknown, field: string): string {
  if (typeof value !== "string" || !VERSION_PATTERN.test(value)) {
    failContract(
      `${field} must be an explicit machine-readable version.`,
      "invalid_version",
    );
  }
  return value;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    failContract(`${field} must be a string.`);
  }
  return value;
}

function requireTimestamp(value: unknown, field: string): string {
  const text = requireString(value, field);
  if (
    !RFC3339_WITH_OFFSET_PATTERN.test(text) ||
    !Number.isFinite(Date.parse(text))
  ) {
    failContract(
      `${field} must be an explicit RFC 3339 timestamp with an offset.`,
    );
  }
  return text;
}

function sortedUniqueStrings(
  values: unknown,
  field: string,
): readonly string[] {
  if (!Array.isArray(values) || values.length === 0) {
    failContract(`${field} must be a non-empty array.`);
  }

  const normalized = values.map((value, index) => {
    const text = requireString(value, `${field}[${index}]`);
    const trimmed = text.trim();
    if (trimmed.length === 0 || trimmed !== text) {
      failContract(`${field} values must be non-empty and already trimmed.`);
    }
    return trimmed;
  });
  if (new Set(normalized).size !== normalized.length) {
    failContract(`${field} values must be unique.`);
  }

  return [...normalized].sort(compareUnicodeCodePoints);
}

function parsePlatforms(values: unknown): readonly GeoPlatform[] {
  const allowed = new Set<string>(GEO_PLATFORMS);
  const sorted = sortedUniqueStrings(values, "platforms");
  if (sorted.some((platform) => !allowed.has(platform))) {
    failContract("platforms contains an unsupported GEO platform.");
  }
  return sorted as readonly GeoPlatform[];
}

function clusterCounts(): Record<ClusterId, number> {
  return Object.fromEntries(
    CANONICAL_CLUSTER_IDS.map((cluster) => [cluster, 0]),
  ) as Record<ClusterId, number>;
}

function versionIdentityValues(
  identity: GeoBenchmarkVersionIdentity,
): readonly string[] {
  return VERSION_IDENTITY_KEYS.map((key) => identity[key]);
}

function sameVersionIdentity(
  left: GeoBenchmarkVersionIdentity,
  right: GeoBenchmarkVersionIdentity,
): boolean {
  return versionIdentityValues(left).every(
    (value, index) => value === versionIdentityValues(right)[index],
  );
}

function parseSuppliedVersionIdentity(value: unknown): PlainRecord | null {
  if (value === undefined) {
    return null;
  }
  if (!isRecord(value)) {
    failContract(
      "versionIdentity must be a plain object.",
      "version_identity_mismatch",
    );
  }
  keysExactly(value, VERSION_IDENTITY_KEYS, "versionIdentity");
  return value;
}

/** Normalize all version fields through one immutable identity object. */
export function createGeoBenchmarkVersionIdentity(
  input: VersionIdentityInput,
): GeoBenchmarkVersionIdentity {
  const schemaVersion = requireVersion(
    input.schemaVersion === undefined
      ? GEO_BENCHMARK_SCHEMA_VERSION
      : input.schemaVersion,
    "versionIdentity.schemaVersion",
  );
  if (schemaVersion !== GEO_BENCHMARK_SCHEMA_VERSION) {
    throw new GeoBenchmarkVersionDriftError(
      "versionIdentity.schemaVersion does not match the GEO benchmark contract constant.",
      { reason: "version_identity_mismatch" },
    );
  }

  const identity = {
    schemaVersion: GEO_BENCHMARK_SCHEMA_VERSION,
    benchmarkVersion: requireVersion(
      input.benchmarkVersion,
      "versionIdentity.benchmarkVersion",
    ),
    methodologyVersion: requireVersion(
      input.methodologyVersion,
      "versionIdentity.methodologyVersion",
    ),
    questionSetVersion: requireVersion(
      input.questionSetVersion,
      "versionIdentity.questionSetVersion",
    ),
    observationSchemaVersion: requireVersion(
      input.observationSchemaVersion,
      "versionIdentity.observationSchemaVersion",
    ),
    scoringVersion: requireVersion(
      input.scoringVersion,
      "versionIdentity.scoringVersion",
    ),
    redactionPolicyVersion: requireVersion(
      input.redactionPolicyVersion,
      "versionIdentity.redactionPolicyVersion",
    ),
  } as const;

  const supplied = parseSuppliedVersionIdentity(input.supplied);
  if (
    supplied !== null &&
    VERSION_IDENTITY_KEYS.some((key) => supplied[key] !== identity[key])
  ) {
    throw new GeoBenchmarkVersionDriftError(
      "Flat methodology versions and versionIdentity disagree; silent version drift is not allowed.",
      { reason: "version_identity_mismatch" },
    );
  }

  return deepFreezeGeoBenchmark(identity);
}

function sortedQuestionSets(input: unknown): readonly QuestionSet[] {
  if (!Array.isArray(input)) {
    failContract("questionSets must be an array.", "invalid_question_set");
  }

  return input
    .map((questionSet, index) => {
      const safeQuestionSet = deepFreezeGeoBenchmark(questionSet);
      try {
        return parseQuestionSet(safeQuestionSet);
      } catch (error) {
        throw new GeoBenchmarkContractError(
          `Question set ${index} is invalid: ${displayError(error)}`,
          { reason: "invalid_question_set" },
        );
      }
    })
    .sort((left, right) =>
      compareUnicodeCodePoints(left.cluster, right.cluster),
    );
}

function createQuestionSetContract(
  input: unknown,
  version: string,
): GeoBenchmarkQuestionSetContract {
  const questionSets = sortedQuestionSets(input);
  if (questionSets.length !== CANONICAL_CLUSTER_IDS.length) {
    failContract(
      "The benchmark requires exactly five canonical clusters and 50 questions.",
      "catalog_cardinality_mismatch",
    );
  }

  const expectedClusters = new Set<ClusterId>(CANONICAL_CLUSTER_IDS);
  const presentClusters = new Set(questionSets.map(({ cluster }) => cluster));
  if (presentClusters.size !== questionSets.length) {
    failContract(
      "The benchmark catalog may contain each canonical cluster only once.",
      "duplicate_cluster",
    );
  }
  if (CANONICAL_CLUSTER_IDS.some((cluster) => !presentClusters.has(cluster))) {
    failContract(
      "The benchmark requires each of the five canonical clusters exactly once.",
      "missing_cluster",
    );
  }
  if ([...presentClusters].some((cluster) => !expectedClusters.has(cluster))) {
    failContract(
      "The benchmark catalog contains a non-canonical cluster.",
      "missing_cluster",
    );
  }

  const counts = clusterCounts();
  const questions: GeoBenchmarkQuestion[] = [];
  const seenIds = new Map<string, ClusterId>();
  const seenPrompts = new Map<string, ClusterId>();

  // Check global identity before namespace membership so a duplicate cannot be
  // hidden behind a secondary cluster mismatch.
  for (const questionSet of questionSets) {
    for (const question of questionSet.questions) {
      const priorIdCluster = seenIds.get(question.id);
      if (priorIdCluster !== undefined) {
        failContract(
          `Duplicate question ID ${question.id} in ${priorIdCluster} and ${questionSet.cluster}.`,
          "duplicate_question_id",
        );
      }
      seenIds.set(question.id, questionSet.cluster);
    }
  }
  seenIds.clear();

  for (const questionSet of questionSets) {
    counts[questionSet.cluster] = questionSet.questions.length;
    for (const question of questionSet.questions) {
      assertGeoBenchmarkNeutralPrompt(question.prompt);
      if (!question.id.startsWith(`${questionSet.cluster}-`)) {
        failContract(
          `Question ID ${question.id} does not belong to cluster ${questionSet.cluster}.`,
          "question_namespace_collision",
        );
      }
      if (!MACHINE_ID_PATTERN.test(question.id)) {
        failContract(
          `Question ID ${question.id} is not machine-readable.`,
          "invalid_question_set",
        );
      }

      const priorIdCluster = seenIds.get(question.id);
      if (priorIdCluster !== undefined) {
        failContract(
          `Duplicate question ID ${question.id} in ${priorIdCluster} and ${questionSet.cluster}.`,
          "duplicate_question_id",
        );
      }
      seenIds.set(question.id, questionSet.cluster);

      const normalizedPrompt = normalizeBuyerPrompt(question.prompt);
      const priorPromptCluster = seenPrompts.get(normalizedPrompt);
      if (priorPromptCluster !== undefined) {
        failContract(
          `Duplicate normalized question prompt in ${priorPromptCluster} and ${questionSet.cluster}.`,
          "duplicate_question_prompt",
        );
      }
      seenPrompts.set(normalizedPrompt, questionSet.cluster);

      questions.push({
        questionId: question.id,
        cluster: questionSet.cluster,
        prompt: question.prompt,
        normalizedPrompt,
        promptHash: hashUtf8Text(question.prompt),
        sourceSetVersion: questionSet.version,
        sourceSetAsOfDate: questionSet.asOfDate,
        sourceSetStatus: questionSet.status,
      });
    }
  }

  if (
    questions.length !== 50 ||
    CANONICAL_CLUSTER_IDS.some((cluster) => counts[cluster] !== 10)
  ) {
    failContract(
      "The benchmark requires exactly 50 questions with 10 questions per canonical cluster.",
      "catalog_cardinality_mismatch",
    );
  }

  questions.sort((left, right) =>
    compareUnicodeCodePoints(
      `${left.cluster}:${left.questionId}`,
      `${right.cluster}:${right.questionId}`,
    ),
  );

  const sourceDigest = hashCanonical(
    questionSets.map((questionSet) => ({
      ...questionSet,
      questions: [...questionSet.questions].sort((left, right) =>
        compareUnicodeCodePoints(left.id, right.id),
      ),
    })),
  );
  const digest = hashCanonical({
    version,
    sourceDigest,
    questions,
  });

  return deepFreezeGeoBenchmark({
    version,
    digest,
    sourceDigest,
    promptVersion: version,
    questionCount: 50 as const,
    clusterCounts: counts as GeoBenchmarkClusterCounts,
    questions,
  });
}

function createMethodology(
  input: GeoBenchmarkMethodologyInput,
  questionSet: GeoBenchmarkQuestionSetContract,
  expectedIdentity?: GeoBenchmarkVersionIdentity,
): GeoBenchmarkMethodology {
  const safeValue = deepFreezeGeoBenchmark(input);
  if (!isRecord(safeValue)) {
    failContract("methodology must be a plain object.");
  }
  keysExactly(
    safeValue,
    safeValue.versionIdentity === undefined
      ? METHODOLOGY_INPUT_KEYS
      : METHODOLOGY_INPUT_KEYS_WITH_IDENTITY,
    "methodology",
  );
  const citationCapture = isRecord(safeValue.citationCapture)
    ? safeValue.citationCapture
    : null;
  const timing = isRecord(safeValue.timing) ? safeValue.timing : null;
  if (citationCapture === null || timing === null) {
    failContract(
      "methodology timing and citationCapture must be plain objects.",
    );
  }
  keysExactly(timing, TIMING_KEYS, "methodology.timing");
  keysExactly(
    citationCapture,
    CITATION_CAPTURE_KEYS,
    "methodology.citationCapture",
  );
  const safeInput = safeValue as unknown as GeoBenchmarkMethodologyInput;

  const identity = createGeoBenchmarkVersionIdentity({
    schemaVersion: safeInput.versionIdentity?.schemaVersion,
    benchmarkVersion: safeInput.benchmarkVersion,
    methodologyVersion: safeInput.methodologyVersion,
    questionSetVersion: safeInput.questionSetVersion,
    observationSchemaVersion: safeInput.observationSchemaVersion,
    scoringVersion: safeInput.scoringVersion,
    redactionPolicyVersion: citationCapture.redactionPolicyVersion,
    supplied: safeInput.versionIdentity,
  });
  if (
    expectedIdentity !== undefined &&
    !sameVersionIdentity(identity, expectedIdentity)
  ) {
    throw new GeoBenchmarkVersionDriftError(
      "Manifest and methodology version identities disagree.",
      { reason: "version_identity_mismatch" },
    );
  }
  if (identity.questionSetVersion !== questionSet.version) {
    throw new GeoBenchmarkVersionDriftError(
      "Methodology questionSetVersion does not match the catalog version.",
      { reason: "version_identity_mismatch" },
    );
  }

  const platforms = parsePlatforms(safeInput.platforms);
  const knownVariabilityValues = sortedUniqueStrings(
    safeInput.knownVariability,
    "knownVariability",
  );
  const knownVariability = assertGeoBenchmarkNeutralTextList(
    knownVariabilityValues,
    "knownVariability",
  );

  const locale = requireString(safeInput.locale, "locale");
  if (!LOCALE_PATTERN.test(locale)) {
    failContract(
      "locale must use a stable language or language-region identifier.",
    );
  }
  if (timing.cadence !== "monthly") {
    failContract("timing.cadence must remain explicitly monthly.");
  }
  const normalizedTiming = {
    asOf: requireTimestamp(timing.asOf, "timing.asOf"),
    cadence: "monthly" as const,
    timezone: requireString(timing.timezone, "timing.timezone"),
  };
  if (!TIMEZONE_PATTERN.test(normalizedTiming.timezone)) {
    failContract("timing.timezone must be an explicit IANA timezone.");
  }

  if (
    !Number.isInteger(safeInput.repetitions) ||
    safeInput.repetitions < 1 ||
    safeInput.repetitions > 100
  ) {
    failContract("repetitions must be an integer between 1 and 100.");
  }
  if (
    citationCapture.mode !== "manual-snapshot-review" ||
    citationCapture.captureOwnedUrls !== true ||
    citationCapture.captureCompetitorUrls !== true ||
    citationCapture.requireSnapshotEvidence !== true
  ) {
    failContract(
      "citationCapture must require manual snapshot review plus owned and competitor URL capture.",
    );
  }
  const redactionPolicyVersion = requireVersion(
    citationCapture.redactionPolicyVersion,
    "citationCapture.redactionPolicyVersion",
  );
  if (redactionPolicyVersion !== identity.redactionPolicyVersion) {
    throw new GeoBenchmarkVersionDriftError(
      "citationCapture.redactionPolicyVersion does not match versionIdentity.",
      { reason: "version_identity_mismatch" },
    );
  }

  const normalizedCitationCapture = {
    mode: "manual-snapshot-review" as const,
    captureOwnedUrls: true as const,
    captureCompetitorUrls: true as const,
    requireSnapshotEvidence: true as const,
    redactionPolicyVersion,
  };
  const methodologyContent = {
    versionIdentity: identity,
    platforms,
    locale,
    timing: normalizedTiming,
    repetitions: safeInput.repetitions,
    scoringVersion: identity.scoringVersion,
    citationCapture: normalizedCitationCapture,
    knownVariability,
  };
  const methodologyContentDigest = hashCanonical(methodologyContent);
  const methodologyDigest = hashCanonical({
    versionIdentity: identity,
    methodologyContentDigest,
    questionSetVersion: questionSet.version,
    questionSetDigest: questionSet.digest,
  });

  return deepFreezeGeoBenchmark({
    versionIdentity: identity,
    benchmarkVersion: identity.benchmarkVersion,
    methodologyVersion: identity.methodologyVersion,
    questionSetVersion: questionSet.version,
    observationSchemaVersion: identity.observationSchemaVersion,
    platforms,
    locale,
    timing: normalizedTiming,
    repetitions: safeInput.repetitions,
    scoringVersion: identity.scoringVersion,
    citationCapture: normalizedCitationCapture,
    knownVariability,
    questionSetDigest: questionSet.digest,
    methodologyContentDigest,
    methodologyDigest,
  });
}

export interface CreateGeoBenchmarkDefinitionInput {
  methodology: GeoBenchmarkMethodologyInput;
  questionSets: readonly QuestionSet[];
}

function calculateBenchmarkDigests(
  identity: GeoBenchmarkVersionIdentity,
  questionSet: GeoBenchmarkQuestionSetContract,
  methodology: GeoBenchmarkMethodology,
): {
  benchmarkContentDigest: string;
  benchmarkDigest: string;
  benchmarkId: string;
} {
  const benchmarkContentDigest = hashCanonical({
    schemaVersion: GEO_BENCHMARK_SCHEMA_VERSION,
    versionIdentity: identity,
    questionSetVersion: questionSet.version,
    questionSetDigest: questionSet.digest,
    methodologyVersion: methodology.methodologyVersion,
    methodologyDigest: methodology.methodologyDigest,
  });
  const benchmarkDigest = hashCanonical({
    versionIdentity: identity,
    benchmarkContentDigest,
  });
  const benchmarkId = [
    "geo-benchmark",
    identity.benchmarkVersion,
    benchmarkDigest.slice("sha256:".length, "sha256:".length + 16),
  ].join(":");
  return { benchmarkContentDigest, benchmarkDigest, benchmarkId };
}

export function createGeoBenchmarkDefinition({
  methodology: methodologyInput,
  questionSets,
}: CreateGeoBenchmarkDefinitionInput): GeoBenchmarkDefinition {
  const safeMethodology = deepFreezeGeoBenchmark(
    methodologyInput,
  ) as GeoBenchmarkMethodologyInput;
  const safeQuestionSets = deepFreezeGeoBenchmark(
    questionSets,
  ) as readonly QuestionSet[];
  const questionSetVersion = requireVersion(
    safeMethodology.questionSetVersion,
    "questionSetVersion",
  );
  const questionSet = createQuestionSetContract(
    safeQuestionSets,
    questionSetVersion,
  );
  const methodology = createMethodology(safeMethodology, questionSet);
  const digests = calculateBenchmarkDigests(
    methodology.versionIdentity,
    questionSet,
    methodology,
  );

  const definition = deepFreezeGeoBenchmark({
    identity: {
      schemaVersion: GEO_BENCHMARK_SCHEMA_VERSION,
      versionIdentity: methodology.versionIdentity,
      benchmarkVersion: methodology.benchmarkVersion,
      benchmarkContentDigest: digests.benchmarkContentDigest,
      benchmarkDigest: digests.benchmarkDigest,
      benchmarkId: digests.benchmarkId,
    },
    questionSet,
    methodology,
  });
  assertGeoBenchmarkDefinitionIntegrity(definition);
  return definition;
}

function assertDigest(value: unknown, field: string): string {
  if (typeof value !== "string" || !DIGEST_PATTERN.test(value)) {
    failIntegrity(`${field} must be a sha256 digest.`);
  }
  return value;
}

function assertQuestionSetIntegrity(
  questionSet: unknown,
): asserts questionSet is GeoBenchmarkQuestionSetContract {
  if (!isRecord(questionSet) || !Array.isArray(questionSet.questions)) {
    failIntegrity("Question-set contract shape is invalid.");
  }
  keysExactly(questionSet, QUESTION_SET_KEYS, "questionSet");
  const version = requireVersion(questionSet.version, "questionSet.version");
  if (
    questionSet.promptVersion !== version ||
    questionSet.questionCount !== 50
  ) {
    failIntegrity("Question-set version or cardinality is inconsistent.");
  }
  assertDigest(questionSet.digest, "questionSet.digest");
  assertDigest(questionSet.sourceDigest, "questionSet.sourceDigest");
  const rawClusterCounts = questionSet.clusterCounts;
  if (!isRecord(rawClusterCounts)) {
    failIntegrity("Question-set cluster counts are invalid.");
  }
  keysExactly(
    rawClusterCounts,
    CANONICAL_CLUSTER_IDS,
    "questionSet.clusterCounts",
  );
  if (
    CANONICAL_CLUSTER_IDS.some((cluster) => rawClusterCounts[cluster] !== 10)
  ) {
    failIntegrity("Question-set cluster counts are inconsistent.");
  }
  if (questionSet.questions.length !== 50) {
    failIntegrity("Question-set contract must contain exactly 50 questions.");
  }

  const counts = clusterCounts();
  const ids = new Set<string>();
  const prompts = new Set<string>();
  let previousKey: string | undefined;
  for (const rawQuestion of questionSet.questions) {
    if (!isRecord(rawQuestion)) {
      failIntegrity("Question-set entries must be plain objects.");
    }
    keysExactly(rawQuestion, QUESTION_KEYS, "question-set question");
    const cluster = rawQuestion.cluster;
    if (
      typeof cluster !== "string" ||
      !CANONICAL_CLUSTER_IDS.includes(cluster as ClusterId)
    ) {
      failIntegrity("Question-set entry contains a non-canonical cluster.");
    }
    const questionId = requireString(
      rawQuestion.questionId,
      "question.questionId",
    );
    if (
      !MACHINE_ID_PATTERN.test(questionId) ||
      !questionId.startsWith(`${cluster}-`)
    ) {
      failIntegrity("Question ID violates the canonical cluster namespace.");
    }
    if (ids.has(questionId)) {
      failIntegrity("Question-set contract contains a duplicate question ID.");
    }
    ids.add(questionId);
    const prompt = assertGeoBenchmarkNeutralPrompt(rawQuestion.prompt);
    const normalizedPrompt = normalizeBuyerPrompt(prompt);
    if (rawQuestion.normalizedPrompt !== normalizedPrompt) {
      failIntegrity("Question normalized prompt is inconsistent.");
    }
    if (prompts.has(normalizedPrompt)) {
      failIntegrity("Question-set contract contains a duplicate prompt.");
    }
    prompts.add(normalizedPrompt);
    if (rawQuestion.promptHash !== hashUtf8Text(prompt)) {
      failIntegrity("Question prompt hash is inconsistent.");
    }
    if (
      !Number.isInteger(rawQuestion.sourceSetVersion) ||
      typeof rawQuestion.sourceSetAsOfDate !== "string" ||
      rawQuestion.sourceSetStatus !== "draft"
    ) {
      failIntegrity("Question source metadata is invalid.");
    }
    counts[cluster as ClusterId] += 1;
    const key = `${cluster}:${questionId}`;
    if (
      previousKey !== undefined &&
      compareUnicodeCodePoints(previousKey, key) > 0
    ) {
      failIntegrity("Question-set entries are not in stable code-point order.");
    }
    previousKey = key;
  }
  if (CANONICAL_CLUSTER_IDS.some((cluster) => counts[cluster] !== 10)) {
    failIntegrity("Question-set cluster cardinality is inconsistent.");
  }
  const expectedDigest = hashCanonical({
    version,
    sourceDigest: questionSet.sourceDigest,
    questions: questionSet.questions,
  });
  if (expectedDigest !== questionSet.digest) {
    failIntegrity("Question-set digest does not match its content.");
  }
}

function assertMethodologyIntegrity(
  methodology: unknown,
  questionSet: GeoBenchmarkQuestionSetContract,
  identity: GeoBenchmarkVersionIdentity,
): asserts methodology is GeoBenchmarkMethodology {
  if (!isRecord(methodology)) {
    failIntegrity("Methodology contract shape is invalid.");
  }
  keysExactly(methodology, METHODOLOGY_OUTPUT_KEYS, "methodology");
  const derivedIdentity = createGeoBenchmarkVersionIdentity({
    schemaVersion:
      methodology.versionIdentity && isRecord(methodology.versionIdentity)
        ? methodology.versionIdentity.schemaVersion
        : undefined,
    benchmarkVersion: methodology.benchmarkVersion,
    methodologyVersion: methodology.methodologyVersion,
    questionSetVersion: methodology.questionSetVersion,
    observationSchemaVersion: methodology.observationSchemaVersion,
    scoringVersion: methodology.scoringVersion,
    redactionPolicyVersion: isRecord(methodology.citationCapture)
      ? methodology.citationCapture.redactionPolicyVersion
      : undefined,
    supplied: methodology.versionIdentity,
  });
  if (!sameVersionIdentity(derivedIdentity, identity)) {
    failIntegrity("Methodology and benchmark version identities disagree.");
  }
  if (methodology.questionSetVersion !== questionSet.version) {
    failIntegrity("Methodology question-set version is inconsistent.");
  }

  const repetitions = methodology.repetitions;
  if (typeof repetitions !== "number") {
    failIntegrity("Methodology repetitions are invalid.");
  }
  const platforms = parsePlatforms(methodology.platforms);
  const knownVariability = assertGeoBenchmarkNeutralTextList(
    sortedUniqueStrings(methodology.knownVariability, "knownVariability"),
    "knownVariability",
  );
  const locale = requireString(methodology.locale, "methodology.locale");
  if (!LOCALE_PATTERN.test(locale)) {
    failIntegrity("Methodology locale is invalid.");
  }
  if (!isRecord(methodology.timing)) {
    failIntegrity("Methodology timing is invalid.");
  }
  keysExactly(methodology.timing, TIMING_KEYS, "methodology.timing");
  const timing = {
    asOf: requireTimestamp(methodology.timing.asOf, "methodology.timing.asOf"),
    cadence: methodology.timing.cadence,
    timezone: requireString(
      methodology.timing.timezone,
      "methodology.timing.timezone",
    ),
  };
  if (timing.cadence !== "monthly" || !TIMEZONE_PATTERN.test(timing.timezone)) {
    failIntegrity("Methodology timing is invalid.");
  }
  if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 100) {
    failIntegrity("Methodology repetitions are invalid.");
  }
  if (!isRecord(methodology.citationCapture)) {
    failIntegrity("Methodology citation capture is invalid.");
  }
  keysExactly(
    methodology.citationCapture,
    CITATION_CAPTURE_KEYS,
    "methodology.citationCapture",
  );
  if (
    methodology.citationCapture.mode !== "manual-snapshot-review" ||
    methodology.citationCapture.captureOwnedUrls !== true ||
    methodology.citationCapture.captureCompetitorUrls !== true ||
    methodology.citationCapture.requireSnapshotEvidence !== true ||
    methodology.citationCapture.redactionPolicyVersion !==
      identity.redactionPolicyVersion
  ) {
    failIntegrity("Methodology citation capture is inconsistent.");
  }

  const methodologyContent = {
    versionIdentity: identity,
    platforms,
    locale,
    timing: {
      asOf: timing.asOf,
      cadence: "monthly" as const,
      timezone: timing.timezone,
    },
    repetitions,
    scoringVersion: identity.scoringVersion,
    citationCapture: methodology.citationCapture,
    knownVariability,
  };
  const expectedContentDigest = hashCanonical(methodologyContent);
  if (methodology.methodologyContentDigest !== expectedContentDigest) {
    failIntegrity("Methodology content digest is inconsistent.");
  }
  const expectedMethodologyDigest = hashCanonical({
    versionIdentity: identity,
    methodologyContentDigest: expectedContentDigest,
    questionSetVersion: questionSet.version,
    questionSetDigest: questionSet.digest,
  });
  if (methodology.methodologyDigest !== expectedMethodologyDigest) {
    failIntegrity("Methodology digest is inconsistent.");
  }
  if (methodology.questionSetDigest !== questionSet.digest) {
    failIntegrity("Methodology question-set digest is inconsistent.");
  }
}

/** Internal integrity validator; callers receive one stable contract error at the boundary. */
function assertGeoBenchmarkDefinitionIntegrityCore(
  definition: unknown,
): asserts definition is GeoBenchmarkDefinition {
  const safeDefinition = deepFreezeGeoBenchmark(definition);
  if (!isRecord(safeDefinition)) {
    failIntegrity("Benchmark definition must be a plain object.");
  }
  keysExactly(safeDefinition, DEFINITION_KEYS, "benchmark definition");
  const identity = safeDefinition.identity;
  if (!isRecord(identity) || !isRecord(identity.versionIdentity)) {
    failIntegrity("Benchmark identity shape is invalid.");
  }
  keysExactly(identity, IDENTITY_KEYS, "identity");
  keysExactly(
    identity.versionIdentity,
    VERSION_IDENTITY_KEYS,
    "identity.versionIdentity",
  );
  const versionIdentity = createGeoBenchmarkVersionIdentity({
    schemaVersion: identity.versionIdentity.schemaVersion,
    benchmarkVersion: identity.versionIdentity.benchmarkVersion,
    methodologyVersion: identity.versionIdentity.methodologyVersion,
    questionSetVersion: identity.versionIdentity.questionSetVersion,
    observationSchemaVersion: identity.versionIdentity.observationSchemaVersion,
    scoringVersion: identity.versionIdentity.scoringVersion,
    redactionPolicyVersion: identity.versionIdentity.redactionPolicyVersion,
    supplied: identity.versionIdentity,
  });
  if (identity.schemaVersion !== GEO_BENCHMARK_SCHEMA_VERSION) {
    failIntegrity("Benchmark schema version is inconsistent.");
  }
  if (identity.benchmarkVersion !== versionIdentity.benchmarkVersion) {
    failIntegrity("Benchmark identity version is inconsistent.");
  }
  assertDigest(
    identity.benchmarkContentDigest,
    "identity.benchmarkContentDigest",
  );
  assertDigest(identity.benchmarkDigest, "identity.benchmarkDigest");
  if (typeof identity.benchmarkId !== "string") {
    failIntegrity("Benchmark ID is invalid.");
  }

  assertQuestionSetIntegrity(safeDefinition.questionSet);
  assertMethodologyIntegrity(
    safeDefinition.methodology,
    safeDefinition.questionSet,
    versionIdentity,
  );
  const digests = calculateBenchmarkDigests(
    versionIdentity,
    safeDefinition.questionSet,
    safeDefinition.methodology,
  );
  if (
    identity.benchmarkContentDigest !== digests.benchmarkContentDigest ||
    identity.benchmarkDigest !== digests.benchmarkDigest ||
    identity.benchmarkId !== digests.benchmarkId
  ) {
    failIntegrity("Benchmark identity digest or ID is inconsistent.");
  }
}

/** Validate an already-created definition before it crosses an aggregation or render boundary. */
export function assertGeoBenchmarkDefinitionIntegrity(
  definition: unknown,
): asserts definition is GeoBenchmarkDefinition {
  try {
    assertGeoBenchmarkDefinitionIntegrityCore(definition);
  } catch (error) {
    if (
      error instanceof GeoBenchmarkContractError &&
      error.reason === "definition_integrity_mismatch"
    ) {
      throw error;
    }
    throw new GeoBenchmarkContractError(
      `Benchmark definition integrity failed: ${displayError(error)}`,
      { reason: "definition_integrity_mismatch" },
    );
  }
}

function normalizeManifestPath(path: unknown, expected: string): string {
  if (typeof path !== "string") {
    throw new GeoBenchmarkManifestError(
      "Manifest snapshot path must be a string.",
      "manifest_path_mismatch",
    );
  }
  if (
    path.includes("\\") ||
    path.includes("\0") ||
    path.startsWith("/") ||
    /^[A-Za-z]:\//.test(path) ||
    /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(path) ||
    path
      .split("/")
      .some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new GeoBenchmarkManifestError(
      "Manifest snapshot paths must be canonical repository-relative POSIX paths.",
      "manifest_path_mismatch",
    );
  }
  if (path !== expected) {
    throw new GeoBenchmarkManifestError(
      `Manifest snapshot path must be ${expected}.`,
      "manifest_path_mismatch",
    );
  }
  return path;
}

function parseManifestIdentity(value: unknown): GeoBenchmarkVersionIdentity {
  if (!isRecord(value)) {
    throw new GeoBenchmarkManifestError(
      "Manifest versionIdentity must be a plain object.",
      "manifest_shape_invalid",
    );
  }
  assertManifestKeys(value, VERSION_IDENTITY_KEYS, "Manifest versionIdentity");
  try {
    return createGeoBenchmarkVersionIdentity({
      schemaVersion: value.schemaVersion,
      benchmarkVersion: value.benchmarkVersion,
      methodologyVersion: value.methodologyVersion,
      questionSetVersion: value.questionSetVersion,
      observationSchemaVersion: value.observationSchemaVersion,
      scoringVersion: value.scoringVersion,
      redactionPolicyVersion: value.redactionPolicyVersion,
      supplied: value,
    });
  } catch (error) {
    if (error instanceof GeoBenchmarkVersionDriftError) {
      throw new GeoBenchmarkManifestError(
        error.message,
        "manifest_version_mismatch",
      );
    }
    throw new GeoBenchmarkManifestError(
      `Manifest versionIdentity is invalid: ${displayError(error)}`,
      "manifest_version_mismatch",
    );
  }
}

function parseManifestSnapshot(
  value: unknown,
  expectedPath: string,
): { snapshot: GeoBenchmarkCatalogSnapshot; questionSet: QuestionSet } {
  if (!isRecord(value)) {
    throw new GeoBenchmarkManifestError(
      "Manifest question-set snapshot must be a plain object.",
      "manifest_shape_invalid",
    );
  }
  assertManifestKeys(value, SNAPSHOT_KEYS, "Manifest question-set snapshot");
  const path = normalizeManifestPath(value.path, expectedPath);
  if (typeof value.content !== "string") {
    throw new GeoBenchmarkManifestError(
      `Manifest snapshot ${path} content must be a string.`,
      "manifest_shape_invalid",
    );
  }
  if (typeof value.digest !== "string" || !DIGEST_PATTERN.test(value.digest)) {
    throw new GeoBenchmarkManifestError(
      `Manifest snapshot ${path} digest is invalid.`,
      "manifest_digest_mismatch",
    );
  }
  if (hashBytes(value.content) !== value.digest) {
    throw new GeoBenchmarkManifestError(
      `Manifest snapshot ${path} digest does not match its content.`,
      "manifest_digest_mismatch",
    );
  }

  const parsedJson = parseStrictGeoBenchmarkJson(value.content);
  let questionSet: QuestionSet;
  try {
    questionSet = parseQuestionSet(parsedJson);
  } catch (error) {
    throw new GeoBenchmarkManifestError(
      `Manifest snapshot ${path} contains an invalid question set: ${displayError(error)}`,
      "manifest_shape_invalid",
    );
  }
  const expectedCluster = expectedPath
    .slice(`${GEO_BENCHMARK_CATALOG_ROOT}/`.length)
    .replace(/\.json$/, "");
  if (questionSet.cluster !== expectedCluster) {
    throw new GeoBenchmarkManifestError(
      `Manifest snapshot ${path} cluster does not match its canonical path.`,
      "manifest_path_mismatch",
    );
  }
  return {
    snapshot: deepFreezeGeoBenchmark({
      path,
      digest: value.digest,
      content: value.content,
    }),
    questionSet,
  };
}

/** Validate and normalize a content-addressed, filesystem-independent input manifest. */
export function validateGeoBenchmarkInputManifest(
  input: unknown,
): GeoBenchmarkInputManifest {
  if (!isRecord(input)) {
    throw new GeoBenchmarkManifestError(
      "GEO benchmark input manifest must be a plain object.",
      "manifest_shape_invalid",
    );
  }
  assertManifestKeys(input, MANIFEST_KEYS, "GEO benchmark input manifest");
  if (input.manifestVersion !== GEO_BENCHMARK_INPUT_MANIFEST_VERSION) {
    throw new GeoBenchmarkManifestError(
      "Manifest version does not match the benchmark input contract.",
      "manifest_version_mismatch",
    );
  }
  if (input.catalogRoot !== GEO_BENCHMARK_CATALOG_ROOT) {
    throw new GeoBenchmarkManifestError(
      "Manifest catalogRoot does not match the canonical benchmark root.",
      "manifest_root_mismatch",
    );
  }
  const versionIdentity = parseManifestIdentity(input.versionIdentity);
  if (!isRecord(input.methodology)) {
    throw new GeoBenchmarkManifestError(
      "Manifest methodology must be a plain object.",
      "manifest_shape_invalid",
    );
  }
  assertManifestKeys(
    input.methodology,
    METHODOLOGY_INPUT_KEYS_WITH_IDENTITY,
    "Manifest methodology",
  );
  if (
    !isRecord(input.methodology.timing) ||
    !isRecord(input.methodology.citationCapture)
  ) {
    throw new GeoBenchmarkManifestError(
      "Manifest methodology timing and citationCapture must be plain objects.",
      "manifest_shape_invalid",
    );
  }
  assertManifestKeys(
    input.methodology.timing,
    TIMING_KEYS,
    "Manifest methodology timing",
  );
  assertManifestKeys(
    input.methodology.citationCapture,
    CITATION_CAPTURE_KEYS,
    "Manifest methodology citationCapture",
  );
  const methodology = deepFreezeGeoBenchmark(
    input.methodology,
  ) as unknown as GeoBenchmarkMethodologyInput;
  let methodologyIdentity: GeoBenchmarkVersionIdentity;
  try {
    methodologyIdentity = createGeoBenchmarkVersionIdentity({
      schemaVersion: methodology.versionIdentity?.schemaVersion,
      benchmarkVersion: methodology.benchmarkVersion,
      methodologyVersion: methodology.methodologyVersion,
      questionSetVersion: methodology.questionSetVersion,
      observationSchemaVersion: methodology.observationSchemaVersion,
      scoringVersion: methodology.scoringVersion,
      redactionPolicyVersion: isRecord(methodology.citationCapture)
        ? methodology.citationCapture.redactionPolicyVersion
        : undefined,
      supplied: methodology.versionIdentity,
    });
  } catch (error) {
    throw new GeoBenchmarkManifestError(
      `Manifest methodology version identity is invalid: ${displayError(error)}`,
      "manifest_version_mismatch",
    );
  }
  if (!sameVersionIdentity(versionIdentity, methodologyIdentity)) {
    throw new GeoBenchmarkManifestError(
      "Manifest versionIdentity does not match methodology versions.",
      "manifest_version_mismatch",
    );
  }
  if (!Array.isArray(input.questionSets)) {
    throw new GeoBenchmarkManifestError(
      "Manifest questionSets must be an array.",
      "manifest_shape_invalid",
    );
  }
  if (input.questionSets.length !== CANONICAL_CLUSTER_IDS.length) {
    throw new GeoBenchmarkManifestError(
      "Manifest must contain exactly five question-set snapshots.",
      "manifest_shape_invalid",
    );
  }

  const expectedPaths = CANONICAL_CLUSTER_IDS.map(
    (cluster) => `${GEO_BENCHMARK_CATALOG_ROOT}/${cluster}.json`,
  );
  const seenPaths = new Set<string>();
  const parsedSnapshots = input.questionSets.map((snapshot, index) => {
    if (!isRecord(snapshot) || typeof snapshot.path !== "string") {
      throw new GeoBenchmarkManifestError(
        `Manifest snapshot ${index} has no valid path.`,
        "manifest_shape_invalid",
      );
    }
    if (seenPaths.has(snapshot.path)) {
      throw new GeoBenchmarkManifestError(
        `Manifest contains duplicate snapshot path ${snapshot.path}.`,
        "manifest_path_collision",
      );
    }
    seenPaths.add(snapshot.path);
    const expectedPath = expectedPaths.find(
      (candidate) => candidate === snapshot.path,
    );
    if (expectedPath === undefined) {
      throw new GeoBenchmarkManifestError(
        `Manifest snapshot path ${snapshot.path} is outside the canonical catalog.`,
        "manifest_path_mismatch",
      );
    }
    return parseManifestSnapshot(snapshot, expectedPath);
  });
  if (
    seenPaths.size !== expectedPaths.length ||
    expectedPaths.some((path) => !seenPaths.has(path))
  ) {
    throw new GeoBenchmarkManifestError(
      "Manifest is missing one or more canonical question-set snapshots.",
      "manifest_path_mismatch",
    );
  }

  const snapshots = parsedSnapshots
    .sort((left, right) =>
      compareUnicodeCodePoints(left.snapshot.path, right.snapshot.path),
    )
    .map(({ snapshot }) => snapshot);

  return deepFreezeGeoBenchmark({
    manifestVersion: GEO_BENCHMARK_INPUT_MANIFEST_VERSION,
    catalogRoot: GEO_BENCHMARK_CATALOG_ROOT,
    versionIdentity,
    methodology: {
      ...methodology,
      versionIdentity,
    },
    questionSets: snapshots,
  });
}

export function createGeoBenchmarkDefinitionFromManifest(
  input: unknown,
): GeoBenchmarkDefinition {
  const manifest = validateGeoBenchmarkInputManifest(input);
  const parsedQuestionSets = manifest.questionSets.map((snapshot) =>
    parseQuestionSet(parseStrictGeoBenchmarkJson(snapshot.content)),
  );
  const definition = createGeoBenchmarkDefinition({
    methodology: manifest.methodology,
    questionSets: parsedQuestionSets,
  });
  if (
    !sameVersionIdentity(
      definition.identity.versionIdentity,
      manifest.versionIdentity,
    )
  ) {
    throw new GeoBenchmarkManifestError(
      "Definition identity does not match the input manifest identity.",
      "manifest_version_mismatch",
    );
  }
  return definition;
}

export function createGeoBenchmarkDefinitionFromManifestJson(
  source: string,
): GeoBenchmarkDefinition {
  return createGeoBenchmarkDefinitionFromManifest(
    parseStrictGeoBenchmarkJson(source),
  );
}

function versionFamilyAndOrdinal(value: string): {
  family: string;
  ordinal: number;
} | null {
  const match = /^(.*?)(?:[-_.])v(\d+)$/.exec(value);
  if (match === null) {
    return null;
  }
  return { family: match[1], ordinal: Number(match[2]) };
}

function assertNoVersionRollback(
  previous: string,
  next: string,
  label: string,
): void {
  const previousVersion = versionFamilyAndOrdinal(previous);
  const nextVersion = versionFamilyAndOrdinal(next);
  if (
    previousVersion !== null &&
    nextVersion !== null &&
    previousVersion.family === nextVersion.family &&
    nextVersion.ordinal < previousVersion.ordinal
  ) {
    throw new GeoBenchmarkVersionDriftError(
      `${label} version rollback would break benchmark lineage.`,
      { reason: "rollback_lineage" },
    );
  }
}

export function assertGeoBenchmarkVersionTransition(
  previous: GeoBenchmarkDefinition,
  next: GeoBenchmarkDefinition,
): void {
  assertGeoBenchmarkDefinitionIntegrity(previous);
  assertGeoBenchmarkDefinitionIntegrity(next);

  assertNoVersionRollback(
    previous.identity.benchmarkVersion,
    next.identity.benchmarkVersion,
    "Benchmark",
  );
  assertNoVersionRollback(
    previous.methodology.methodologyVersion,
    next.methodology.methodologyVersion,
    "Methodology",
  );
  assertNoVersionRollback(
    previous.questionSet.version,
    next.questionSet.version,
    "Question-set",
  );
  assertNoVersionRollback(
    previous.methodology.observationSchemaVersion,
    next.methodology.observationSchemaVersion,
    "Observation schema",
  );
  assertNoVersionRollback(
    previous.methodology.scoringVersion,
    next.methodology.scoringVersion,
    "Scoring",
  );
  assertNoVersionRollback(
    previous.methodology.citationCapture.redactionPolicyVersion,
    next.methodology.citationCapture.redactionPolicyVersion,
    "Redaction policy",
  );

  const questionSetChanged =
    previous.questionSet.digest !== next.questionSet.digest;
  if (
    questionSetChanged &&
    previous.questionSet.version === next.questionSet.version
  ) {
    throw new GeoBenchmarkVersionDriftError(
      "Question-set content changed without a new question-set version.",
      { reason: "version_drift" },
    );
  }

  const methodologyChanged =
    previous.methodology.methodologyContentDigest !==
    next.methodology.methodologyContentDigest;
  if (
    methodologyChanged &&
    previous.methodology.methodologyVersion ===
      next.methodology.methodologyVersion
  ) {
    throw new GeoBenchmarkVersionDriftError(
      "Methodology content changed without a new methodology version.",
      { reason: "version_drift" },
    );
  }

  const benchmarkChanged =
    previous.identity.benchmarkContentDigest !==
    next.identity.benchmarkContentDigest;
  if (
    benchmarkChanged &&
    previous.identity.benchmarkVersion === next.identity.benchmarkVersion
  ) {
    throw new GeoBenchmarkVersionDriftError(
      "Benchmark content changed without a new benchmark version.",
      { reason: "version_drift" },
    );
  }
}
