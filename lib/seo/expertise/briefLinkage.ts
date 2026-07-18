import { createHash } from "node:crypto";

import { z } from "zod";

import { calendarDateSchema, deepFreeze } from "./schema";
import { evaluatePublicEligibility } from "./eligibility";
import {
  approvedContributionSchema,
  interviewSessionSchema,
  type ApprovedContribution,
  type ApprovedContributionInput,
  type InterviewSession,
  type InterviewSessionInput,
} from "./schema";
import { provisionalOpportunityBriefSchema } from "../opportunity/schema";
import type { ProvisionalOpportunityBrief } from "../opportunity/types";

const TICKET28_BRIEF_LINK_VERSION = 1 as const;
const TICKET28_PROVISIONAL_STATUS = ["blocked", "needs-research"] as const;

const digestSchema = z
  .string()
  .regex(/^sha256:[0-9a-f]{64}$/, "must be a sha256:<64 lowercase hex> digest");

export const ticket28BriefLinkSchema = z
  .object({
    version: z.literal(TICKET28_BRIEF_LINK_VERSION),
    ticket: z.literal(28),
    recordClass: z.literal("synthetic"),
    provenance: z.literal("ticket28-provisional"),
    briefId: z.string().regex(/^opportunity-[a-z0-9]+(?:-[a-z0-9]+)*$/),
    briefStatus: z.enum(TICKET28_PROVISIONAL_STATUS),
    briefDigest: digestSchema,
    asOfDate: calendarDateSchema,
  })
  .strict()
  .transform((link) => deepFreeze({ ...link }));

export type Ticket28BriefLink = z.infer<typeof ticket28BriefLinkSchema>;

export const EXPERTISE_BRIEF_EVIDENCE_REASON_CODES = Object.freeze([
  "contribution-not-public-eligible",
  "ticket28-brief-digest-mismatch",
  "ticket28-brief-id-mismatch",
  "ticket28-brief-not-approved",
  "ticket28-brief-not-real",
  "ticket28-brief-not-present",
  "ticket28-brief-as-of-mismatch",
  "ticket28-linkage-missing",
] as const);

export type ExpertiseBriefEvidenceReasonCode =
  (typeof EXPERTISE_BRIEF_EVIDENCE_REASON_CODES)[number];

export interface BuildTicket28BriefLinkInput {
  readonly brief: ProvisionalOpportunityBrief;
  readonly asOfDate: string;
}

export interface ExpertiseBriefEvidenceInput {
  readonly interviewSession: InterviewSessionInput | InterviewSession;
  readonly contribution: ApprovedContributionInput | ApprovedContribution;
  readonly asOfDate: string;
  readonly ticket28: {
    readonly brief: unknown | null;
    readonly link: unknown | null;
  };
}

export interface ExpertiseBriefEvidenceDecision {
  readonly version: 1;
  readonly ticket: 29;
  readonly asOfDate: string;
  readonly contributionId: string;
  readonly ticket28BriefId: string | null;
  readonly ticket28BriefDigest: string | null;
  readonly ticket28BriefStatus: "blocked" | "needs-research" | null;
  readonly ticket28Provenance: "ticket28-provisional" | null;
  readonly publicDraftAllowed: false;
  readonly reasonCodes: readonly ExpertiseBriefEvidenceReasonCode[];
}

function assertExactInputKeys(
  value: unknown,
  expected: readonly string[],
  field: string,
): asserts value is Record<string, unknown> {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new TypeError(`${field} must be a strict plain-data object.`);
  }
  if (Reflect.ownKeys(value).some((key) => typeof key !== "string")) {
    throw new TypeError(`${field} must not contain symbol keys.`);
  }
  const actual = Object.getOwnPropertyNames(value).sort();
  const sortedExpected = [...expected].sort();
  if (
    actual.length !== sortedExpected.length ||
    actual.some((key, index) => key !== sortedExpected[index])
  ) {
    throw new TypeError(`${field} must contain exactly the fixed key set.`);
  }
  for (const key of sortedExpected) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !("value" in descriptor)) {
      throw new TypeError(`${field}.${key} must be a plain data property.`);
    }
  }
}

function assertJsonSafe(
  value: unknown,
  path: string,
  seen: WeakSet<object>,
): void {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`${path} must be finite.`);
    return;
  }
  if (typeof value !== "object")
    throw new TypeError(`${path} is not JSON-safe.`);
  if (seen.has(value)) throw new TypeError(`${path} must not contain cycles.`);
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertJsonSafe(item, `${path}[${index}]`, seen),
    );
  } else {
    for (const [key, item] of Object.entries(value)) {
      assertJsonSafe(item, `${path}.${key}`, seen);
    }
  }
  seen.delete(value);
}

function canonicalize(value: unknown): string {
  assertJsonSafe(value, "brief", new WeakSet<object>());
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }
  const entries = Object.entries(value).sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  return `{${entries
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`)
    .join(",")}}`;
}

function digestBrief(brief: ProvisionalOpportunityBrief): string {
  return `sha256:${createHash("sha256").update(canonicalize(brief)).digest("hex")}`;
}

export function buildTicket28BriefLink(
  input: BuildTicket28BriefLinkInput,
): Ticket28BriefLink {
  assertExactInputKeys(
    input,
    ["brief", "asOfDate"],
    "Ticket 28 brief linkage input",
  );
  const asOfDate = calendarDateSchema.parse(input.asOfDate);
  const brief = provisionalOpportunityBriefSchema.parse(input.brief);
  if (brief.asOfDate !== asOfDate) {
    throw new TypeError(
      "Ticket 28 brief and link must share the explicit asOfDate.",
    );
  }
  return ticket28BriefLinkSchema.parse({
    version: TICKET28_BRIEF_LINK_VERSION,
    ticket: 28,
    recordClass: "synthetic",
    provenance: "ticket28-provisional",
    briefId: brief.opportunityId,
    briefStatus: brief.status,
    briefDigest: digestBrief(brief),
    asOfDate,
  });
}

export function evaluateExpertiseBriefEvidence(
  input: ExpertiseBriefEvidenceInput,
): ExpertiseBriefEvidenceDecision {
  assertExactInputKeys(
    input,
    ["interviewSession", "contribution", "asOfDate", "ticket28"],
    "expertise brief evidence input",
  );
  assertExactInputKeys(
    input.ticket28,
    ["brief", "link"],
    "expertise brief evidence input.ticket28",
  );
  const asOfDate = calendarDateSchema.parse(input.asOfDate);
  const interviewSession = interviewSessionSchema.parse(input.interviewSession);
  const contribution = approvedContributionSchema.parse(input.contribution);
  const reasons = new Set<ExpertiseBriefEvidenceReasonCode>();
  const link =
    input.ticket28.link === null
      ? null
      : ticket28BriefLinkSchema.parse(input.ticket28.link);
  const brief =
    input.ticket28.brief === null
      ? null
      : provisionalOpportunityBriefSchema.parse(input.ticket28.brief);

  if (link === null) {
    reasons.add("ticket28-linkage-missing");
  } else if (brief === null) {
    reasons.add("ticket28-brief-not-present");
  } else {
    if (brief.opportunityId !== link.briefId) {
      reasons.add("ticket28-brief-id-mismatch");
    }
    if (brief.asOfDate !== link.asOfDate || link.asOfDate !== asOfDate) {
      reasons.add("ticket28-brief-as-of-mismatch");
    }
    if (digestBrief(brief) !== link.briefDigest) {
      reasons.add("ticket28-brief-digest-mismatch");
    }
    reasons.add("ticket28-brief-not-approved");
    reasons.add("ticket28-brief-not-real");
  }

  const eligibility = evaluatePublicEligibility({
    interviewSession,
    contribution,
    asOfDate,
  });
  if (!eligibility.publicEligible) {
    reasons.add("contribution-not-public-eligible");
  }

  return deepFreeze({
    version: 1 as const,
    ticket: 29 as const,
    asOfDate,
    contributionId: contribution.contributionId,
    ticket28BriefId: link?.briefId ?? null,
    ticket28BriefDigest: link?.briefDigest ?? null,
    ticket28BriefStatus: link?.briefStatus ?? null,
    ticket28Provenance: link?.provenance ?? null,
    publicDraftAllowed: false as const,
    reasonCodes: [...reasons].sort(),
  });
}
