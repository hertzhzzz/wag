import { z } from "zod";

import {
  GeoContractError,
  GEO_CLUSTERS,
  GEO_OBSERVATION_STATUSES,
  GEO_PLATFORMS,
  type GeoCluster,
  type GeoObservation,
  type GeoQuestionDefinition,
  type GeoRunManifest,
  type GeoRunRecord,
  type GeoStatusReason,
} from "./types";
import { hashUtf8Text, normalizeLf } from "./hash";
import { normalizeRepositoryRelativePosixPath } from "./canonical";

const FORBIDDEN_FIELD_KEYS = new Set([
  "account",
  "accountemail",
  "accountid",
  "address",
  "apikey",
  "authorization",
  "cookie",
  "cookies",
  "email",
  "emailaddress",
  "enquiry",
  "firstname",
  "formdata",
  "freetext",
  "fullname",
  "inquiry",
  "lastname",
  "message",
  "phone",
  "phonenumber",
  "refreshtoken",
  "session",
  "sessionid",
  "sessiontoken",
  "streetaddress",
  "token",
  "accesstoken",
  "userid",
  "username",
]);

const STATUS_REASONS: readonly GeoStatusReason[] = [
  "surface-unavailable",
  "unsupported-locale",
  "unsupported-device",
  "authentication-required",
  "access-blocked",
  "rate-limited",
  "robots-policy",
  "validation-failure",
  "snapshot-integrity-failure",
  "contract-mismatch",
] as const;

const UNAVAILABLE_REASONS = new Set<GeoStatusReason>([
  "surface-unavailable",
  "unsupported-locale",
  "unsupported-device",
]);
const BLOCKED_REASONS = new Set<GeoStatusReason>([
  "authentication-required",
  "access-blocked",
  "rate-limited",
  "robots-policy",
]);
const INVALID_REASONS = new Set<GeoStatusReason>([
  "validation-failure",
  "snapshot-integrity-failure",
  "contract-mismatch",
]);

function normalizedFieldKey(value: string): string {
  return value.replace(/[\s_-]/g, "").toLowerCase();
}

function rejectForbiddenFields(input: unknown): void {
  const seen = new WeakSet<object>();

  const visit = (value: unknown): void => {
    if (value === null || typeof value !== "object") {
      return;
    }
    if (seen.has(value)) {
      throw new GeoContractError();
    }
    seen.add(value);

    try {
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }

      for (const [key, nested] of Object.entries(value)) {
        const normalized = normalizedFieldKey(key);
        if (
          normalized !== "accounttier" &&
          FORBIDDEN_FIELD_KEYS.has(normalized)
        ) {
          throw new GeoContractError(
            "GEO contract rejected a forbidden sensitive field.",
          );
        }
        visit(nested);
      }
    } finally {
      seen.delete(value);
    }
  };

  visit(input);
}

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN = /(?:\+\d{1,3}[ .-]?)?(?:\(?\d{2,4}\)?[ .-]){2,}\d{3,4}/;
const SECRET_PATTERN =
  /\b(?:api[ _-]?key|authorization|bearer|cookie|secret|session(?:[ _-]?(?:id|token))?|access[ _-]?token|refresh[ _-]?token|token|account(?:[ _-]?(?:id|email))?|user(?:[ _-]?(?:id|name))?)\s*[:=]\s*\S+/i;
const PERCENT_ESCAPE_PATTERN = /%[0-9A-F]{2}/i;

function isSafeHumanText(value: string): boolean {
  return (
    !EMAIL_PATTERN.test(value) &&
    !PHONE_PATTERN.test(value) &&
    !SECRET_PATTERN.test(value)
  );
}

function decodeForSensitiveScan(value: string): string {
  let decoded = value.replace(/\+/g, " ");
  for (let depth = 0; depth < 8; depth += 1) {
    if (!PERCENT_ESCAPE_PATTERN.test(decoded)) {
      return decoded;
    }
    decoded = decodeURIComponent(decoded);
  }

  if (PERCENT_ESCAPE_PATTERN.test(decoded)) {
    throw new GeoContractError();
  }
  return decoded;
}

function isRepositoryPath(value: string): boolean {
  try {
    const normalized = normalizeRepositoryRelativePosixPath(value);
    return isSafeHumanText(decodeForSensitiveScan(normalized));
  } catch {
    return false;
  }
}

function isHttpsUrlWithoutCredentials(value: string): boolean {
  try {
    const parsed = new URL(value);
    const decoded = decodeForSensitiveScan(value);
    return (
      parsed.protocol === "https:" &&
      parsed.username.length === 0 &&
      parsed.password.length === 0 &&
      isSafeHumanText(decoded)
    );
  } catch {
    return false;
  }
}

const idSchema = z
  .string()
  .min(3)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const versionSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/);
const digestSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);
const timestampSchema = z
  .string()
  .datetime({ offset: true })
  .refine((value) => Number.isFinite(Date.parse(value)));
const localeSchema = z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/);
const safeHumanTextSchema = z
  .string()
  .min(1)
  .max(4_000)
  .refine(isSafeHumanText);
const repositoryPathSchema = z
  .string()
  .min(1)
  .refine(isRepositoryPath)
  .transform(normalizeRepositoryRelativePosixPath);

const versionFields = {
  schemaVersion: versionSchema,
  methodologyVersion: versionSchema,
  benchmarkVersion: versionSchema,
  questionSetVersion: versionSchema,
};

export const geoPromptSchema = z
  .object({
    version: versionSchema,
    text: safeHumanTextSchema.transform(normalizeLf),
    hash: digestSchema,
  })
  .strict()
  .superRefine((prompt, context) => {
    if (hashUtf8Text(prompt.text) !== prompt.hash) {
      context.addIssue({
        code: "custom",
        path: ["hash"],
        message: "Prompt digest does not match normalized UTF-8 text.",
      });
    }
  });

const reviewerRoleSchema = z.enum([
  "seo-reviewer",
  "subject-matter-reviewer",
  "quality-reviewer",
]);

export const geoQuestionDefinitionSchema = z
  .object({
    questionId: idSchema,
    cluster: z.enum(GEO_CLUSTERS),
    prompt: geoPromptSchema,
    approval: z
      .object({
        status: z.literal("approved"),
        approvedAt: timestampSchema,
        reviewerRole: reviewerRoleSchema,
        evidencePath: repositoryPathSchema,
      })
      .strict(),
  })
  .strict();

export const geoRunManifestSchema = z
  .object({
    ...versionFields,
    runId: idSchema,
    fixtureOnly: z.boolean(),
    provenance: z.enum(["external-platform-observation", "synthetic-fixture"]),
    platform: z.enum(GEO_PLATFORMS),
    locale: localeSchema,
    device: z.enum(["desktop", "mobile", "tablet", "unknown"]),
    auth: z.enum(["signed-out", "signed-in-test-account", "not-applicable"]),
    accountTier: z.enum([
      "free",
      "paid",
      "enterprise",
      "unknown",
      "not-applicable",
    ]),
    expectedRepetitions: z.number().int().positive().max(100),
    questions: z.array(geoQuestionDefinitionSchema).min(1).max(50),
    evidencePath: repositoryPathSchema,
  })
  .strict()
  .superRefine((manifest, context) => {
    const isFixture = manifest.provenance === "synthetic-fixture";
    if (manifest.fixtureOnly !== isFixture) {
      context.addIssue({
        code: "custom",
        path: ["fixtureOnly"],
        message: "Fixture provenance and fixtureOnly must agree.",
      });
    }

    const questionIds = new Set<string>();
    manifest.questions.forEach((question, index) => {
      if (questionIds.has(question.questionId)) {
        context.addIssue({
          code: "custom",
          path: ["questions", index, "questionId"],
          message: "Question IDs must be unique within a run.",
        });
      }
      questionIds.add(question.questionId);
    });
  });

const surfaceModelSchema = z
  .object({
    name: safeHumanTextSchema.nullable(),
    visibility: z.enum(["visible", "not-visible", "not-applicable"]),
  })
  .strict()
  .superRefine((model, context) => {
    if (model.visibility === "visible" && model.name === null) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "A visible model must have a name.",
      });
    }
  });

const surfaceSchema = z
  .object({
    name: safeHumanTextSchema.nullable(),
    visibility: z.enum(["visible", "not-visible"]),
    ordered: z.boolean(),
    model: surfaceModelSchema,
  })
  .strict()
  .superRefine((surface, context) => {
    if (surface.visibility === "visible" && surface.name === null) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "A visible surface must have a name.",
      });
    }
    if (surface.visibility === "not-visible" && surface.ordered) {
      context.addIssue({
        code: "custom",
        path: ["ordered"],
        message: "A non-visible surface cannot be ordered.",
      });
    }
  });

const snapshotSchema = z
  .object({
    path: repositoryPathSchema,
    hash: digestSchema,
    mimeType: z.enum([
      "text/plain",
      "text/html",
      "image/png",
      "image/jpeg",
      "application/pdf",
      "application/json",
    ]),
    capture: z.enum(["text", "html", "image", "pdf", "json"]),
    redaction: z
      .object({
        status: z.enum(["not-required", "applied"]),
        policyVersion: versionSchema,
      })
      .strict(),
  })
  .strict()
  .superRefine((snapshot, context) => {
    const compatible =
      (snapshot.capture === "text" && snapshot.mimeType === "text/plain") ||
      (snapshot.capture === "html" && snapshot.mimeType === "text/html") ||
      (snapshot.capture === "image" &&
        (snapshot.mimeType === "image/png" ||
          snapshot.mimeType === "image/jpeg")) ||
      (snapshot.capture === "pdf" && snapshot.mimeType === "application/pdf") ||
      (snapshot.capture === "json" && snapshot.mimeType === "application/json");
    if (!compatible) {
      context.addIssue({
        code: "custom",
        path: ["mimeType"],
        message: "Snapshot MIME type and capture method must agree.",
      });
    }
  });

const citationSchema = z
  .object({
    citationId: idSchema,
    url: z.string().url().refine(isHttpsUrlWithoutCredentials),
    kind: z.enum(["owned", "competitor", "third-party"]),
    integrity: z.enum(["supports", "partial", "misleading", "unverified"]),
    rank: z.number().int().positive().optional(),
    evidencePath: repositoryPathSchema,
  })
  .strict();

const competitorSchema = z
  .object({
    competitorId: idSchema,
    label: safeHumanTextSchema.max(200),
    mentioned: z.boolean(),
    cited: z.boolean(),
    preferred: z.boolean(),
    rank: z.number().int().positive().optional(),
    evidencePath: repositoryPathSchema,
  })
  .strict();

const reviewSchema = z
  .object({
    rubricVersion: versionSchema,
    reviewedAt: timestampSchema,
    reviewerRole: reviewerRoleSchema,
    accuracy: z.enum(["pass", "fail", "not-assessable"]),
    completeness: z.enum(["pass", "fail", "not-assessable"]),
    citationIntegrity: z.enum(["pass", "fail", "misleading", "not-assessable"]),
    competitorPreference: z.enum([
      "brand-preferred",
      "competitor-preferred",
      "no-preference",
      "not-assessable",
    ]),
    evidencePath: repositoryPathSchema,
  })
  .strict();

export const geoObservationSchema = z
  .object({
    ...versionFields,
    runId: idSchema,
    observationId: idSchema,
    questionId: idSchema,
    repetition: z.number().int().positive().max(100),
    cluster: z.enum(GEO_CLUSTERS),
    platform: z.enum(GEO_PLATFORMS),
    prompt: geoPromptSchema,
    observedAt: timestampSchema,
    locale: localeSchema,
    device: z.enum(["desktop", "mobile", "tablet", "unknown"]),
    auth: z.enum(["signed-out", "signed-in-test-account", "not-applicable"]),
    accountTier: z.enum([
      "free",
      "paid",
      "enterprise",
      "unknown",
      "not-applicable",
    ]),
    status: z.enum(GEO_OBSERVATION_STATUSES),
    statusReason: z.enum(STATUS_REASONS).nullable(),
    surface: surfaceSchema,
    snapshot: snapshotSchema.nullable(),
    brandMention: z.boolean().nullable(),
    citations: z.array(citationSchema).max(100),
    competitors: z.array(competitorSchema).max(100),
    review: reviewSchema.nullable(),
    evidencePath: repositoryPathSchema,
  })
  .strict()
  .superRefine((observation, context) => {
    const issue = (path: (string | number)[], message: string): void => {
      context.addIssue({ code: "custom", path, message });
    };

    if (
      !observation.surface.ordered &&
      observation.citations.some((citation) => citation.rank !== undefined)
    ) {
      issue(["citations"], "Ranks require an explicitly ordered surface.");
    }
    if (
      !observation.surface.ordered &&
      observation.competitors.some(
        (competitor) => competitor.rank !== undefined,
      )
    ) {
      issue(["competitors"], "Ranks require an explicitly ordered surface.");
    }

    if (observation.status === "observed-answer") {
      if (observation.statusReason !== null) {
        issue(
          ["statusReason"],
          "Observed answers may not have a status reason.",
        );
      }
      if (observation.surface.visibility !== "visible") {
        issue(
          ["surface", "visibility"],
          "Observed answers require a visible surface.",
        );
      }
      if (observation.snapshot === null) {
        issue(["snapshot"], "Observed answers require snapshot evidence.");
      }
      if (observation.brandMention === null) {
        issue(["brandMention"], "Observed answers require a mention decision.");
      }
      if (observation.review === null) {
        issue(["review"], "Observed answers require manual rubric review.");
      }
      return;
    }

    if (observation.status === "observed-surface-absent") {
      if (observation.statusReason !== null) {
        issue(
          ["statusReason"],
          "Observed absence may not have a status reason.",
        );
      }
      if (observation.surface.visibility !== "not-visible") {
        issue(
          ["surface", "visibility"],
          "Observed absence requires a non-visible surface.",
        );
      }
      if (observation.surface.ordered) {
        issue(["surface", "ordered"], "Observed absence cannot be ordered.");
      }
      if (observation.surface.model.visibility === "visible") {
        issue(
          ["surface", "model"],
          "Observed absence cannot have a visible model.",
        );
      }
      if (observation.snapshot === null) {
        issue(["snapshot"], "Observed absence requires snapshot evidence.");
      }
      if (observation.brandMention !== false) {
        issue(["brandMention"], "Observed absence records no brand mention.");
      }
      if (
        observation.citations.length > 0 ||
        observation.competitors.length > 0
      ) {
        issue(
          ["citations"],
          "Observed absence cannot include result entities.",
        );
      }
      if (observation.review !== null) {
        issue(["review"], "Observed absence has no answer to review.");
      }
      return;
    }

    const reason = observation.statusReason;
    if (reason === null) {
      issue(
        ["statusReason"],
        "Non-observed statuses require a controlled reason.",
      );
    } else if (
      (observation.status === "unavailable" &&
        !UNAVAILABLE_REASONS.has(reason)) ||
      (observation.status === "blocked" && !BLOCKED_REASONS.has(reason)) ||
      (observation.status === "invalid" && !INVALID_REASONS.has(reason))
    ) {
      issue(["statusReason"], "Status reason is incompatible with status.");
    }

    if (observation.brandMention !== null) {
      issue(["brandMention"], "Non-observed statuses cannot infer a mention.");
    }
    if (
      observation.citations.length > 0 ||
      observation.competitors.length > 0
    ) {
      issue(
        ["citations"],
        "Non-observed statuses cannot infer result entities.",
      );
    }
    if (observation.review !== null) {
      issue(["review"], "Non-observed statuses cannot be manually scored.");
    }
  });

function parseWithSchema<T>(schema: z.ZodType<T>, input: unknown): T {
  rejectForbiddenFields(input);
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new GeoContractError();
  }
  return result.data;
}

export function parseGeoRunManifest(input: unknown): GeoRunManifest {
  return parseWithSchema(geoRunManifestSchema, input) as GeoRunManifest;
}

export function parseGeoObservation(input: unknown): GeoObservation {
  return parseWithSchema(geoObservationSchema, input) as GeoObservation;
}

function assertObservationMatchesManifest(
  manifest: GeoRunManifest,
  observation: GeoObservation,
  questionById: Map<string, GeoQuestionDefinition>,
): void {
  const question = questionById.get(observation.questionId);
  const versionsMatch =
    observation.schemaVersion === manifest.schemaVersion &&
    observation.methodologyVersion === manifest.methodologyVersion &&
    observation.benchmarkVersion === manifest.benchmarkVersion &&
    observation.questionSetVersion === manifest.questionSetVersion;
  const contextMatches =
    observation.runId === manifest.runId &&
    observation.platform === manifest.platform &&
    observation.locale === manifest.locale &&
    observation.device === manifest.device &&
    observation.auth === manifest.auth &&
    observation.accountTier === manifest.accountTier;
  const questionMatches =
    question !== undefined &&
    observation.cluster === question.cluster &&
    observation.prompt.version === question.prompt.version &&
    observation.prompt.text === question.prompt.text &&
    observation.prompt.hash === question.prompt.hash;

  if (
    !versionsMatch ||
    !contextMatches ||
    !questionMatches ||
    observation.repetition > manifest.expectedRepetitions
  ) {
    throw new GeoContractError();
  }
}

export function parseGeoRunRecord(input: unknown): GeoRunRecord {
  rejectForbiddenFields(input);
  const raw = z
    .object({ manifest: z.unknown(), observations: z.array(z.unknown()) })
    .strict()
    .safeParse(input);
  if (!raw.success) {
    throw new GeoContractError();
  }

  const manifest = parseGeoRunManifest(raw.data.manifest);
  const observations = raw.data.observations.map(parseGeoObservation);
  const questionById = new Map(
    manifest.questions.map((question) => [question.questionId, question]),
  );
  const observationIds = new Set<string>();
  const observationSlots = new Set<string>();

  for (const observation of observations) {
    assertObservationMatchesManifest(manifest, observation, questionById);
    const slot = `${observation.questionId}:${observation.repetition}`;
    if (
      observationIds.has(observation.observationId) ||
      observationSlots.has(slot)
    ) {
      throw new GeoContractError();
    }
    observationIds.add(observation.observationId);
    observationSlots.add(slot);
  }

  return { manifest, observations };
}

export function assertClusterQuestionSet(
  input: readonly GeoQuestionDefinition[],
  cluster: GeoCluster,
): GeoQuestionDefinition[] {
  const questions = input.map((question) =>
    parseWithSchema(geoQuestionDefinitionSchema, question),
  ) as GeoQuestionDefinition[];
  const uniqueIds = new Set(questions.map((question) => question.questionId));

  if (
    questions.length !== 10 ||
    uniqueIds.size !== 10 ||
    questions.some((question) => question.cluster !== cluster)
  ) {
    throw new GeoContractError();
  }

  return questions;
}

export function assertCanonicalBenchmarkQuestionSet(
  input: readonly GeoQuestionDefinition[],
): GeoQuestionDefinition[] {
  if (input.length !== 50) {
    throw new GeoContractError();
  }

  const questions = input.map((question) =>
    parseWithSchema(geoQuestionDefinitionSchema, question),
  ) as GeoQuestionDefinition[];
  const uniqueIds = new Set(questions.map((question) => question.questionId));
  if (uniqueIds.size !== 50) {
    throw new GeoContractError();
  }

  for (const cluster of GEO_CLUSTERS) {
    assertClusterQuestionSet(
      questions.filter((question) => question.cluster === cluster),
      cluster,
    );
  }

  return questions;
}
