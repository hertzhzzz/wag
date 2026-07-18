import { isDeepStrictEqual } from "node:util";

import matter from "gray-matter";

import { parseArticleFrontmatter } from "./articleSchema";
import {
  evaluateEvidenceStatus,
  parseEvidenceClaimManifestYaml,
  sha256Source,
  type EvidenceClaimManifest,
  type EvidenceRecord,
  type EvidenceRegistry,
  type EvidenceReviewDecision,
} from "./evidenceSchema";

export const EVIDENCE_GATE_ERROR_CODES = Object.freeze({
  EVIDENCE_UNKNOWN: "EVIDENCE_UNKNOWN",
  EVIDENCE_UNSUPPORTED: "EVIDENCE_UNSUPPORTED",
  EVIDENCE_EXPIRED: "EVIDENCE_EXPIRED",
  EVIDENCE_RESTRICTED: "EVIDENCE_RESTRICTED",
  EVIDENCE_PERMISSION_DENIED: "EVIDENCE_PERMISSION_DENIED",
  EVIDENCE_CLAIM_UNKNOWN: "EVIDENCE_CLAIM_UNKNOWN",
  EVIDENCE_CLAIM_BOUNDARY: "EVIDENCE_CLAIM_BOUNDARY",
  EVIDENCE_CLAIM_EXCERPT_MISSING: "EVIDENCE_CLAIM_EXCERPT_MISSING",
  EVIDENCE_ARTICLE_ID_MISMATCH: "EVIDENCE_ARTICLE_ID_MISMATCH",
  EVIDENCE_ARTICLE_REFERENCE_MISSING: "EVIDENCE_ARTICLE_REFERENCE_MISSING",
  EVIDENCE_METHOD_REQUIRED: "EVIDENCE_METHOD_REQUIRED",
  EVIDENCE_REVIEW_REJECTED: "EVIDENCE_REVIEW_REJECTED",
  EVIDENCE_REVIEW_CORRECTION_REQUIRED: "EVIDENCE_REVIEW_CORRECTION_REQUIRED",
  EVIDENCE_DECISION_STALE: "EVIDENCE_DECISION_STALE",
} as const);

export type EvidenceGateErrorCode =
  (typeof EVIDENCE_GATE_ERROR_CODES)[keyof typeof EVIDENCE_GATE_ERROR_CODES];
export type EvidenceGateStatus = "passed" | "failed";
type EvidenceStatus = ReturnType<typeof evaluateEvidenceStatus>;
type EvidenceAnalyticsStatus = EvidenceStatus | "unknown";
type EvidenceClaim = EvidenceClaimManifest["claims"][number];
type EvidenceClaimKind = EvidenceClaim["kind"];

export interface EvidenceGateIssue {
  code: EvidenceGateErrorCode;
  articleId: string;
  claimId?: string;
  evidenceId?: string;
  field: string;
  reason: string;
  fix: string;
}

export interface EvidenceGateEvidenceTrace {
  id: string;
  title: string;
  url: string;
  capturedDate: string;
  reviewDueDate: string;
  status: EvidenceStatus;
}

export interface EvidenceGateClaimTrace {
  id: string;
  kind: EvidenceClaimKind;
  /** Null when no public registry boundary can be safely rendered. */
  claimBoundary: string | null;
  evidence: EvidenceGateEvidenceTrace[];
}

export interface EvidenceGateAnalyticsEvidence {
  id: string;
  status: EvidenceAnalyticsStatus;
}

export interface EvidenceGateAnalytics {
  articleId: string;
  status: EvidenceGateStatus;
  decision: EvidenceReviewDecision["decision"];
  claimCount: number;
  evidenceCount: number;
  issueCount: number;
  issueCodes: EvidenceGateErrorCode[];
  evidence: EvidenceGateAnalyticsEvidence[];
}

export interface EvidenceGateReport {
  version: 1;
  articleId: string;
  asOfDate: string;
  status: EvidenceGateStatus;
  decision: EvidenceReviewDecision["decision"];
  reviewer: string;
  reviewedDate: string;
  claimCount: number;
  evidenceCount: number;
  claims: EvidenceGateClaimTrace[];
  issues: EvidenceGateIssue[];
  analytics: EvidenceGateAnalytics;
}

export interface RunEvidenceGateInput {
  articleSource: string;
  claimManifestSource: string;
  registry: EvidenceRegistry;
  claimManifest: EvidenceClaimManifest;
  reviewDecision: EvidenceReviewDecision;
  asOfDate: string;
}

interface IssueText {
  reason: string;
  fix: string;
}

const ISSUE_TEXT: Record<EvidenceGateErrorCode, IssueText> = {
  EVIDENCE_UNKNOWN: {
    reason: "A claim references an evidence ID that is not in the registry.",
    fix: "Add a reviewed registry record or remove the unresolved evidence reference.",
  },
  EVIDENCE_UNSUPPORTED: {
    reason: "Referenced evidence is marked unsupported.",
    fix: "Replace the evidence or rewrite the claim so it is supported by a reviewed source.",
  },
  EVIDENCE_EXPIRED: {
    reason: "Referenced evidence is outside its review window.",
    fix: "Recapture and review the source, then update its review due date before approval.",
  },
  EVIDENCE_RESTRICTED: {
    reason: "Referenced evidence is not safe for public trace output.",
    fix: "Use permitted public evidence or remove the evidence from the public claim.",
  },
  EVIDENCE_PERMISSION_DENIED: {
    reason: "Publication permission is restricted, unresolved, or incomplete.",
    fix: "Record complete publication permission and attribution, or replace the evidence.",
  },
  EVIDENCE_CLAIM_UNKNOWN: {
    reason: "The evidence record does not declare support for this claim ID.",
    fix: "Link the claim to evidence that explicitly lists the same claim ID.",
  },
  EVIDENCE_CLAIM_BOUNDARY: {
    reason:
      "The manifest boundary does not exactly match the registry boundary.",
    fix: "Rewrite the claim to the canonical supported boundary or update the reviewed evidence record.",
  },
  EVIDENCE_CLAIM_EXCERPT_MISSING: {
    reason:
      "The manifest excerpt is not an exact substring of the article source.",
    fix: "Copy the exact published article wording into the claim manifest and review it again.",
  },
  EVIDENCE_ARTICLE_ID_MISMATCH: {
    reason:
      "Article, claim manifest, and review decision identities do not match.",
    fix: "Use one governed article ID across the article, manifest, and review decision.",
  },
  EVIDENCE_ARTICLE_REFERENCE_MISSING: {
    reason: "A manifest evidence ID is missing from article frontmatter.",
    fix: "Add the opaque evidence ID to article frontmatter or remove it from the claim manifest.",
  },
  EVIDENCE_METHOD_REQUIRED: {
    reason: "Required first-party quantitative method metadata is incomplete.",
    fix: "Add a method summary, positive denominator, and deduplication method before approval.",
  },
  EVIDENCE_REVIEW_REJECTED: {
    reason: "The reviewer rejected this evidence decision.",
    fix: "Resolve the review findings and obtain a new approved decision.",
  },
  EVIDENCE_REVIEW_CORRECTION_REQUIRED: {
    reason: "The reviewer requested corrections.",
    fix: "Apply the requested corrections and obtain a new approved decision.",
  },
  EVIDENCE_DECISION_STALE: {
    reason:
      "The approved decision does not match the current reviewed source digest.",
    fix: "Review the current article and manifest sources and issue a new digest-bound approval.",
  },
};

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function compareOptionalText(left?: string, right?: string): number {
  return compareText(left ?? "", right ?? "");
}

function sortUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareText);
}

function sortIssues(issues: readonly EvidenceGateIssue[]): EvidenceGateIssue[] {
  const unique = new Map<string, EvidenceGateIssue>();

  for (const issue of issues) {
    const key = [
      issue.code,
      issue.articleId,
      issue.claimId ?? "",
      issue.evidenceId ?? "",
      issue.field,
      issue.reason,
      issue.fix,
    ].join("\u0000");
    unique.set(key, issue);
  }

  return [...unique.values()].sort((left, right) => {
    return (
      compareText(left.code, right.code) ||
      compareText(left.articleId, right.articleId) ||
      compareOptionalText(left.claimId, right.claimId) ||
      compareOptionalText(left.evidenceId, right.evidenceId) ||
      compareText(left.field, right.field) ||
      compareText(left.reason, right.reason) ||
      compareText(left.fix, right.fix)
    );
  });
}

function makeIssue(
  articleId: string,
  code: EvidenceGateErrorCode,
  field: string,
  references: { claimId?: string; evidenceId?: string } = {},
): EvidenceGateIssue {
  return {
    code,
    articleId,
    ...(references.claimId ? { claimId: references.claimId } : {}),
    ...(references.evidenceId ? { evidenceId: references.evidenceId } : {}),
    field,
    reason: ISSUE_TEXT[code].reason,
    fix: ISSUE_TEXT[code].fix,
  };
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const daysByMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day <= daysByMonth[month - 1];
}

function articleSlugFromPath(articlePath: string): string {
  const normalizedPath = articlePath.replace(/\\/g, "/");
  const fileName = normalizedPath.split("/").pop() ?? "";
  return fileName.endsWith(".mdx") ? fileName.slice(0, -4) : fileName;
}

function hasCompletePermission(record: EvidenceRecord): boolean {
  if (record.permission.status !== "permitted") return false;
  if (!record.permission.attributionRequired) return true;
  return (
    typeof record.permission.attribution === "string" &&
    record.permission.attribution.trim().length > 0
  );
}

function isPublicTraceable(record: EvidenceRecord): record is EvidenceRecord & {
  source: { kind: "public-url"; url: string };
} {
  return (
    record.privacy === "public" &&
    record.source.kind === "public-url" &&
    hasCompletePermission(record)
  );
}

function safeEvidenceStatus(
  record: EvidenceRecord,
  asOfDate: string,
): EvidenceStatus {
  const status = evaluateEvidenceStatus(record, asOfDate);
  if (status !== "public") return status;
  return isPublicTraceable(record) ? status : "restricted";
}

function validateEvidenceRecord(
  articleId: string,
  record: EvidenceRecord,
  status: EvidenceStatus,
): EvidenceGateIssue[] {
  const issues: EvidenceGateIssue[] = [];
  const reference = { evidenceId: record.id };

  if (status === "unsupported") {
    issues.push(
      makeIssue(
        articleId,
        EVIDENCE_GATE_ERROR_CODES.EVIDENCE_UNSUPPORTED,
        "registry.evidence.supportStatus",
        reference,
      ),
    );
  } else if (status === "expired") {
    issues.push(
      makeIssue(
        articleId,
        EVIDENCE_GATE_ERROR_CODES.EVIDENCE_EXPIRED,
        "registry.evidence.reviewDueDate",
        reference,
      ),
    );
  }

  if (record.privacy !== "public" || record.source.kind !== "public-url") {
    issues.push(
      makeIssue(
        articleId,
        EVIDENCE_GATE_ERROR_CODES.EVIDENCE_RESTRICTED,
        record.privacy !== "public"
          ? "registry.evidence.privacy"
          : "registry.evidence.source",
        reference,
      ),
    );
  }

  if (!hasCompletePermission(record)) {
    issues.push(
      makeIssue(
        articleId,
        EVIDENCE_GATE_ERROR_CODES.EVIDENCE_PERMISSION_DENIED,
        "registry.evidence.permission",
        reference,
      ),
    );
  }

  if (record.sourceType === "first-party" && record.quantitative) {
    if (
      typeof record.method?.summary !== "string" ||
      record.method.summary.trim().length === 0
    ) {
      issues.push(
        makeIssue(
          articleId,
          EVIDENCE_GATE_ERROR_CODES.EVIDENCE_METHOD_REQUIRED,
          "registry.evidence.method.summary",
          reference,
        ),
      );
    }
    if (
      !Number.isInteger(record.method?.denominator) ||
      (record.method?.denominator ?? 0) <= 0
    ) {
      issues.push(
        makeIssue(
          articleId,
          EVIDENCE_GATE_ERROR_CODES.EVIDENCE_METHOD_REQUIRED,
          "registry.evidence.method.denominator",
          reference,
        ),
      );
    }
    if (
      typeof record.method?.deduplication !== "string" ||
      record.method.deduplication.trim().length === 0
    ) {
      issues.push(
        makeIssue(
          articleId,
          EVIDENCE_GATE_ERROR_CODES.EVIDENCE_METHOD_REQUIRED,
          "registry.evidence.method.deduplication",
          reference,
        ),
      );
    }
  }

  return issues;
}

function buildClaimTrace(
  claim: EvidenceClaim,
  registryById: ReadonlyMap<string, EvidenceRecord>,
  statusById: ReadonlyMap<string, EvidenceStatus>,
  asOfDate: string,
): EvidenceGateClaimTrace {
  const evidence: EvidenceGateEvidenceTrace[] = [];
  const exactBoundaries: string[] = [];
  const canonicalBoundaries: string[] = [];

  for (const evidenceId of sortUnique(claim.evidenceIds)) {
    const record = registryById.get(evidenceId);
    if (!record || !isPublicTraceable(record)) continue;

    const declaredClaims = record.supportedClaims
      .filter((supportedClaim) => supportedClaim.id === claim.id)
      .sort((left, right) => compareText(left.boundary, right.boundary));
    if (declaredClaims.length === 0) continue;

    canonicalBoundaries.push(declaredClaims[0].boundary);
    if (
      declaredClaims.some(
        (supportedClaim) => supportedClaim.boundary === claim.boundary,
      )
    ) {
      exactBoundaries.push(claim.boundary);
    }

    if (record.source.kind === "public-url") {
      evidence.push({
        id: record.id,
        title: record.title,
        url: record.source.url,
        capturedDate: record.capturedDate,
        reviewDueDate: record.reviewDueDate,
        status:
          statusById.get(record.id) ?? safeEvidenceStatus(record, asOfDate),
      });
    }
  }

  evidence.sort((left, right) => {
    return (
      compareText(left.id, right.id) ||
      compareText(left.title, right.title) ||
      compareText(left.url, right.url)
    );
  });

  const claimBoundary =
    sortUnique(exactBoundaries)[0] ??
    sortUnique(canonicalBoundaries)[0] ??
    null;

  return {
    id: claim.id,
    kind: claim.kind,
    claimBoundary,
    evidence,
  };
}

export function runEvidenceGate(
  input: RunEvidenceGateInput,
): EvidenceGateReport {
  if (!isValidCalendarDate(input.asOfDate)) {
    throw new TypeError("asOfDate must be a valid YYYY-MM-DD calendar date.");
  }

  const claimManifest = parseEvidenceClaimManifestYaml(
    input.claimManifestSource,
  );
  const claimManifestMatchesSource = isDeepStrictEqual(
    claimManifest,
    input.claimManifest,
  );
  const articleId = claimManifest.articleId;
  const issues: EvidenceGateIssue[] = [];
  let articleEvidenceIds: ReadonlySet<string> | null = null;
  let parsedArticleId: string | null = null;

  try {
    const parsedArticle = matter(input.articleSource);
    const article = parseArticleFrontmatter(
      parsedArticle.data as Record<string, unknown>,
      articleSlugFromPath(claimManifest.articlePath),
      "strict",
    ).frontmatter;
    parsedArticleId = article.contentId;
    articleEvidenceIds = new Set(article.evidenceIds);

    if (article.contentId !== articleId) {
      issues.push(
        makeIssue(
          articleId,
          EVIDENCE_GATE_ERROR_CODES.EVIDENCE_ARTICLE_ID_MISMATCH,
          "claimManifest.articleId",
        ),
      );
    }
  } catch {
    issues.push(
      makeIssue(
        articleId,
        EVIDENCE_GATE_ERROR_CODES.EVIDENCE_ARTICLE_ID_MISMATCH,
        "article.frontmatter",
      ),
    );
  }

  if (
    input.reviewDecision.articleId !== articleId ||
    (parsedArticleId !== null &&
      input.reviewDecision.articleId !== parsedArticleId)
  ) {
    issues.push(
      makeIssue(
        articleId,
        EVIDENCE_GATE_ERROR_CODES.EVIDENCE_ARTICLE_ID_MISMATCH,
        "reviewDecision.articleId",
      ),
    );
  }

  if (input.reviewDecision.decision === "rejected") {
    issues.push(
      makeIssue(
        articleId,
        EVIDENCE_GATE_ERROR_CODES.EVIDENCE_REVIEW_REJECTED,
        "reviewDecision.decision",
      ),
    );
  } else if (input.reviewDecision.decision === "correction-requested") {
    issues.push(
      makeIssue(
        articleId,
        EVIDENCE_GATE_ERROR_CODES.EVIDENCE_REVIEW_CORRECTION_REQUIRED,
        "reviewDecision.decision",
      ),
    );
  } else {
    if (
      sha256Source(input.articleSource) !== input.reviewDecision.articleDigest
    ) {
      issues.push(
        makeIssue(
          articleId,
          EVIDENCE_GATE_ERROR_CODES.EVIDENCE_DECISION_STALE,
          "reviewDecision.articleDigest",
        ),
      );
    }
    if (
      sha256Source(input.claimManifestSource) !==
      input.reviewDecision.claimManifestDigest
    ) {
      issues.push(
        makeIssue(
          articleId,
          EVIDENCE_GATE_ERROR_CODES.EVIDENCE_DECISION_STALE,
          "reviewDecision.claimManifestDigest",
        ),
      );
    }
    if (!claimManifestMatchesSource) {
      issues.push(
        makeIssue(
          articleId,
          EVIDENCE_GATE_ERROR_CODES.EVIDENCE_DECISION_STALE,
          "claimManifest",
        ),
      );
    }
  }

  const registryById = new Map<string, EvidenceRecord>();
  for (const record of input.registry.evidence) {
    registryById.set(record.id, record);
  }

  const evidenceIds = sortUnique(
    claimManifest.claims.flatMap((claim) => claim.evidenceIds),
  );
  const statusById = new Map<string, EvidenceStatus>();
  const analyticsEvidence: EvidenceGateAnalyticsEvidence[] = [];

  for (const evidenceId of evidenceIds) {
    const record = registryById.get(evidenceId);
    if (!record) {
      analyticsEvidence.push({ id: evidenceId, status: "unknown" });
      continue;
    }

    const status = safeEvidenceStatus(record, input.asOfDate);
    statusById.set(evidenceId, status);
    analyticsEvidence.push({ id: evidenceId, status });
    issues.push(...validateEvidenceRecord(articleId, record, status));
  }

  for (const claim of claimManifest.claims) {
    if (!input.articleSource.includes(claim.excerpt)) {
      issues.push(
        makeIssue(
          articleId,
          EVIDENCE_GATE_ERROR_CODES.EVIDENCE_CLAIM_EXCERPT_MISSING,
          "claimManifest.claims.excerpt",
          { claimId: claim.id },
        ),
      );
    }

    for (const evidenceId of sortUnique(claim.evidenceIds)) {
      const references = { claimId: claim.id, evidenceId };

      if (articleEvidenceIds && !articleEvidenceIds.has(evidenceId)) {
        issues.push(
          makeIssue(
            articleId,
            EVIDENCE_GATE_ERROR_CODES.EVIDENCE_ARTICLE_REFERENCE_MISSING,
            "article.evidenceIds",
            references,
          ),
        );
      }

      const record = registryById.get(evidenceId);
      if (!record) {
        issues.push(
          makeIssue(
            articleId,
            EVIDENCE_GATE_ERROR_CODES.EVIDENCE_UNKNOWN,
            "claimManifest.claims.evidenceIds",
            references,
          ),
        );
        continue;
      }

      const declaredClaims = record.supportedClaims.filter(
        (supportedClaim) => supportedClaim.id === claim.id,
      );
      if (declaredClaims.length === 0) {
        issues.push(
          makeIssue(
            articleId,
            EVIDENCE_GATE_ERROR_CODES.EVIDENCE_CLAIM_UNKNOWN,
            "registry.evidence.supportedClaims",
            references,
          ),
        );
        continue;
      }

      if (
        !declaredClaims.some(
          (supportedClaim) => supportedClaim.boundary === claim.boundary,
        )
      ) {
        issues.push(
          makeIssue(
            articleId,
            EVIDENCE_GATE_ERROR_CODES.EVIDENCE_CLAIM_BOUNDARY,
            "claimManifest.claims.boundary",
            references,
          ),
        );
      }
    }
  }

  const claims = claimManifest.claims
    .map((claim) =>
      buildClaimTrace(claim, registryById, statusById, input.asOfDate),
    )
    .sort((left, right) => {
      return (
        compareText(left.id, right.id) ||
        compareText(left.kind, right.kind) ||
        compareOptionalText(
          left.claimBoundary ?? undefined,
          right.claimBoundary ?? undefined,
        )
      );
    });
  const sortedIssues = sortIssues(issues);
  const status: EvidenceGateStatus =
    sortedIssues.length === 0 ? "passed" : "failed";
  const issueCodes = sortUnique(
    sortedIssues.map((issue) => issue.code),
  ) as EvidenceGateErrorCode[];

  return {
    version: 1,
    articleId,
    asOfDate: input.asOfDate,
    status,
    decision: input.reviewDecision.decision,
    reviewer: input.reviewDecision.reviewer,
    reviewedDate: input.reviewDecision.reviewedDate,
    claimCount: claimManifest.claims.length,
    evidenceCount: evidenceIds.length,
    claims,
    issues: sortedIssues,
    analytics: {
      articleId,
      status,
      decision: input.reviewDecision.decision,
      claimCount: claimManifest.claims.length,
      evidenceCount: evidenceIds.length,
      issueCount: sortedIssues.length,
      issueCodes,
      evidence: analyticsEvidence,
    },
  };
}
