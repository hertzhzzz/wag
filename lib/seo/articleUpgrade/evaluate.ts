import type { z } from "zod";

import {
  canonicalizeArticleUpgradeManifest,
  compareCodePoints,
  computeArticleUpgradeCandidateDigest,
  computeArticleUpgradeManifestDigest,
  deepClone,
  deepFreeze,
} from "./canonical";
import { ARTICLE_UPGRADE_TICKET_REGISTRY } from "./registry";
import {
  articleUpgradeEvaluationContextSchema,
  articleUpgradeManifestSchema,
} from "./schema";
import {
  ARTICLE_UPGRADE_ISSUE_CODES,
  ARTICLE_UPGRADE_SCHEMA_VERSION,
} from "./types";
import type {
  ArticleRequirementVerification,
  ArticleUpgradeApproval,
  ArticleUpgradeDataMode,
  ArticleUpgradeDisposition,
  ArticleUpgradeEvaluationContext,
  ArticleUpgradeIssue,
  ArticleUpgradeIssueCode,
  ArticleUpgradeIssueSeverity,
  ArticleUpgradeManifestInput,
  ArticleUpgradeManifestReport,
  ArticleUpgradeProvenance,
  ArticleUpgradeTicketId,
  ArticleUpgradeTicketInput,
  ArticleUpgradeTicketReport,
} from "./types";

const ISSUE_ORDER = new Map<ArticleUpgradeIssueCode, number>(
  ARTICLE_UPGRADE_ISSUE_CODES.map((code, index) => [code, index]),
);
const SLOT_BY_ID = new Map(
  ARTICLE_UPGRADE_TICKET_REGISTRY.map((slot) => [slot.ticketId, slot]),
);

function issue(
  code: ArticleUpgradeIssueCode,
  severity: ArticleUpgradeIssueSeverity,
  ticketId: ArticleUpgradeTicketId | null,
  path: string,
  message: string,
): ArticleUpgradeIssue {
  return { code, severity, ticketId, path, message };
}

function sortIssues(
  issues: readonly ArticleUpgradeIssue[],
): ArticleUpgradeIssue[] {
  return [...issues].sort((left, right) => {
    const codeOrder =
      (ISSUE_ORDER.get(left.code) ?? Number.MAX_SAFE_INTEGER) -
      (ISSUE_ORDER.get(right.code) ?? Number.MAX_SAFE_INTEGER);
    if (codeOrder !== 0) return codeOrder;
    const ticketOrder =
      Number(left.ticketId ?? 0) - Number(right.ticketId ?? 0);
    if (ticketOrder !== 0) return ticketOrder;
    const pathOrder = compareCodePoints(left.path, right.path);
    return pathOrder || compareCodePoints(left.message, right.message);
  });
}

function reasonCodes(
  issues: readonly ArticleUpgradeIssue[],
): ArticleUpgradeIssueCode[] {
  return ARTICLE_UPGRADE_ISSUE_CODES.filter((code) =>
    issues.some((item) => item.code === code),
  );
}

function zodPath(issue: z.core.$ZodIssue, prefix = "$"): string {
  return issue.path.length === 0 ? prefix : `${prefix}.${issue.path.join(".")}`;
}

function schemaCode(issue: z.core.$ZodIssue): ArticleUpgradeIssueCode {
  const path = issue.path.join(".");
  if (path.endsWith("trackingParameters")) {
    return "tracking_parameters_forbidden";
  }
  if (path.includes("observations") && path.endsWith("value")) {
    return "observation_null_semantics_invalid";
  }
  return "input_schema_invalid";
}

function invalidReport(
  issues: readonly ArticleUpgradeIssue[],
): ArticleUpgradeManifestReport {
  const sorted = sortIssues(issues);
  return deepFreeze({
    version: ARTICLE_UPGRADE_SCHEMA_VERSION,
    asOf: null,
    provenance: null,
    dataMode: null,
    manifestDigest: null,
    status: "blocked",
    schemaValid: false,
    evidenceVerified: false,
    authorizedForExecution: false,
    productionExecution: false,
    disposition: "hold",
    previewable: false,
    simulationReady: false,
    executable: false,
    complete: false,
    reasonCodes: reasonCodes(sorted),
    issues: sorted,
    tickets: [],
  });
}

function schemaFailureReport(
  errors: readonly z.core.$ZodIssue[],
  prefix = "$",
): ArticleUpgradeManifestReport {
  return invalidReport(
    errors.map((error) =>
      issue(
        schemaCode(error),
        "contract",
        null,
        zodPath(error, prefix),
        error.message,
      ),
    ),
  );
}

function jsonContractFailureReport(
  error: unknown,
): ArticleUpgradeManifestReport {
  const message =
    error instanceof Error
      ? error.message
      : "Input violates the JSON contract.";
  return invalidReport([
    issue("input_schema_invalid", "contract", null, "$", message),
  ]);
}

function isBlocking(issues: readonly ArticleUpgradeIssue[]): boolean {
  return issues.some(({ severity }) => severity !== "guard");
}

function verificationPassed(
  verification: ArticleRequirementVerification,
): boolean {
  return (
    verification.status === "passed" &&
    verification.evidenceDigest !== null &&
    verification.verifiedAt !== null &&
    verification.explanation !== null
  );
}

function approvalComplete(approval: ArticleUpgradeApproval): boolean {
  return (
    approval.status === "approved" &&
    approval.approvalId !== null &&
    approval.actorId !== null &&
    approval.approvedAt !== null &&
    approval.subjectDigest !== null
  );
}

function collectProvenances(
  value: unknown,
  path = "$",
): Array<{ path: string; provenance: ArticleUpgradeProvenance }> {
  if (value === null || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((nested, index) =>
      collectProvenances(nested, `${path}.${index}`),
    );
  }

  const output: Array<{ path: string; provenance: ArticleUpgradeProvenance }> =
    [];
  for (const [key, nested] of Object.entries(value)) {
    const nestedPath = `${path}.${key}`;
    if (
      key === "provenance" &&
      (nested === "live" || nested === "synthetic-fixture")
    ) {
      output.push({ path: nestedPath, provenance: nested });
    }
    output.push(...collectProvenances(nested, nestedPath));
  }
  return output;
}

function collectDates(
  value: unknown,
  path = "$",
): Array<{ path: string; date: string }> {
  if (value === null || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((nested, index) =>
      collectDates(nested, `${path}.${index}`),
    );
  }

  const output: Array<{ path: string; date: string }> = [];
  for (const [key, nested] of Object.entries(value)) {
    const nestedPath = `${path}.${key}`;
    if (
      typeof nested === "string" &&
      (key === "asOf" || key.endsWith("At")) &&
      /^\d{4}-\d{2}-\d{2}$/u.test(nested)
    ) {
      output.push({ path: nestedPath, date: nested });
    }
    output.push(...collectDates(nested, nestedPath));
  }
  return output;
}

function addVerificationIssue(
  issues: ArticleUpgradeIssue[],
  ticket: ArticleUpgradeTicketInput,
  key: keyof ArticleUpgradeTicketInput["requirements"],
  code: ArticleUpgradeIssueCode,
  message: string,
): void {
  if (!verificationPassed(ticket.requirements[key])) {
    issues.push(
      issue(
        code,
        "blocker",
        ticket.ticketId,
        `tickets.${ticket.ticketId}.requirements.${key}`,
        message,
      ),
    );
  }
}

function evaluateTicket(
  ticket: ArticleUpgradeTicketInput,
): ArticleUpgradeTicketReport {
  const issues: ArticleUpgradeIssue[] = [];
  const prefix = `tickets.${ticket.ticketId}`;
  const expected = SLOT_BY_ID.get(ticket.ticketId);

  if (expected && ticket.rank !== expected.rank) {
    issues.push(
      issue(
        "rank_mismatch",
        "contract",
        ticket.ticketId,
        `${prefix}.rank`,
        `Ticket ${ticket.ticketId} must map to opportunity rank ${expected.rank}.`,
      ),
    );
  }
  if (ticket.cluster === null) {
    issues.push(
      issue(
        "cluster_unassigned",
        "blocker",
        ticket.ticketId,
        `${prefix}.cluster`,
        "The canonical cluster is not assigned.",
      ),
    );
  }
  if (ticket.target === null) {
    issues.push(
      issue(
        "target_unassigned",
        "blocker",
        ticket.ticketId,
        `${prefix}.target`,
        "The ranked target article and URL are not assigned.",
      ),
    );
  }
  if (ticket.owner === null) {
    issues.push(
      issue(
        "owner_unassigned",
        "blocker",
        ticket.ticketId,
        `${prefix}.owner`,
        "A responsible owner is not assigned.",
      ),
    );
  } else if (
    (ticket.provenance === "live" && ticket.owner.kind !== "human") ||
    (ticket.provenance === "synthetic-fixture" &&
      ticket.owner.kind !== "test-fixture")
  ) {
    issues.push(
      issue(
        "provenance_mismatch",
        "contract",
        ticket.ticketId,
        `${prefix}.owner.kind`,
        "Owner kind does not match manifest provenance.",
      ),
    );
  }

  if (ticket.source.baseline === null) {
    issues.push(
      issue(
        "baseline_source_digest_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.source.baseline`,
        "A baseline source digest is required before an upgrade can be evaluated.",
      ),
    );
  }
  if (ticket.source.current === null) {
    issues.push(
      issue(
        "current_source_digest_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.source.current`,
        "A current source digest is required before approval.",
      ),
    );
  }
  if (
    ticket.source.baseline !== null &&
    ticket.source.current !== null &&
    ticket.source.baseline.digest === ticket.source.current.digest
  ) {
    issues.push(
      issue(
        "source_digest_unchanged",
        "blocker",
        ticket.ticketId,
        `${prefix}.source.current.digest`,
        "The current source is identical to the baseline; no upgrade is evidenced.",
      ),
    );
  }

  const cutover = ticket.dependencies.strictCutover;
  if (
    cutover.status !== "passed" ||
    cutover.evidenceDigest === null ||
    cutover.checkedAt === null
  ) {
    issues.push(
      issue(
        "ticket_13_strict_cutover_blocked",
        "blocker",
        ticket.ticketId,
        `${prefix}.dependencies.strictCutover`,
        "Ticket 13 strict cutover has not supplied a passed, digested attestation.",
      ),
    );
  }

  const ledger = ticket.dependencies.migrationLedger;
  if (ledger.status !== "passed" || ledger.checkedAt === null) {
    issues.push(
      issue(
        "migration_ledger_not_approved",
        "blocker",
        ticket.ticketId,
        `${prefix}.dependencies.migrationLedger.status`,
        "Ticket 06 migration-ledger approval is not passed.",
      ),
    );
  }
  if (ledger.currentDigest === null || ledger.approvedDigest === null) {
    issues.push(
      issue(
        "migration_ledger_digest_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.dependencies.migrationLedger`,
        "Both current and human-approved ledger digests are required.",
      ),
    );
  } else if (ledger.currentDigest !== ledger.approvedDigest) {
    issues.push(
      issue(
        "migration_ledger_digest_drift",
        "contract",
        ticket.ticketId,
        `${prefix}.dependencies.migrationLedger.approvedDigest`,
        "The current ledger digest differs from the approved digest.",
      ),
    );
  }

  const lock = ticket.opportunityLock;
  if (
    lock.status !== "locked" ||
    lock.opportunityId === null ||
    lock.rank === null ||
    lock.cluster === null ||
    lock.targetUrl === null ||
    lock.lockedAt === null
  ) {
    issues.push(
      issue(
        "ranked_opportunity_not_locked",
        "blocker",
        ticket.ticketId,
        `${prefix}.opportunityLock`,
        "The ranked opportunity lock must be locked and include its ID, rank, cluster, target, and lock date.",
      ),
    );
  }
  if (lock.opportunityDigest === null) {
    issues.push(
      issue(
        "ranked_opportunity_digest_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.opportunityLock.opportunityDigest`,
        "The locked opportunity digest is missing.",
      ),
    );
  }
  if (lock.briefDigest === null) {
    issues.push(
      issue(
        "ranked_brief_digest_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.opportunityLock.briefDigest`,
        "The reviewer-ready brief digest is missing.",
      ),
    );
  }
  if (lock.rankingEvidenceDigest === null) {
    issues.push(
      issue(
        "ranking_evidence_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.opportunityLock.rankingEvidenceDigest`,
        "The opportunity rank lacks a traceable evidence digest.",
      ),
    );
  }
  if (lock.rank !== null && lock.rank !== ticket.rank) {
    issues.push(
      issue(
        "ranked_opportunity_rank_drift",
        "contract",
        ticket.ticketId,
        `${prefix}.opportunityLock.rank`,
        "The locked opportunity rank differs from the ticket registry rank.",
      ),
    );
  }
  if (
    ticket.cluster !== null &&
    lock.cluster !== null &&
    ticket.cluster !== lock.cluster
  ) {
    issues.push(
      issue(
        "cluster_drift",
        "contract",
        ticket.ticketId,
        `${prefix}.opportunityLock.cluster`,
        "The locked opportunity cluster differs from the ticket cluster.",
      ),
    );
  }
  if (
    ticket.target !== null &&
    lock.targetUrl !== null &&
    ticket.target.url !== lock.targetUrl
  ) {
    issues.push(
      issue(
        "target_drift",
        "contract",
        ticket.ticketId,
        `${prefix}.opportunityLock.targetUrl`,
        "The locked opportunity target differs from the ticket target.",
      ),
    );
  }

  const evidenceGate = ticket.dependencies.evidenceGate;
  if (
    evidenceGate.status !== "passed" ||
    evidenceGate.reportDigest === null ||
    evidenceGate.checkedAt === null
  ) {
    issues.push(
      issue(
        "evidence_gate_not_passed",
        "blocker",
        ticket.ticketId,
        `${prefix}.dependencies.evidenceGate`,
        "The Evidence Gate has not passed with a current report digest.",
      ),
    );
  }
  if (evidenceGate.packageDigest === null) {
    issues.push(
      issue(
        "evidence_package_digest_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.dependencies.evidenceGate.packageDigest`,
        "The evidence package digest is missing.",
      ),
    );
  }

  addVerificationIssue(
    issues,
    ticket,
    "answerPassage",
    "answer_passage_not_verified",
    "The clear primary answer passage lacks passed verification evidence.",
  );
  if (ticket.requirements.answerPassage.passageRef === null) {
    issues.push(
      issue(
        "answer_passage_not_verified",
        "blocker",
        ticket.ticketId,
        `${prefix}.requirements.answerPassage.passageRef`,
        "The answer passage reference is missing.",
      ),
    );
  }

  const faq = ticket.requirements.faq;
  if (
    !verificationPassed(faq) ||
    faq.eligibility === "unreviewed" ||
    faq.visibleStatus === "unreviewed"
  ) {
    issues.push(
      issue(
        "faq_not_reviewed",
        "blocker",
        ticket.ticketId,
        `${prefix}.requirements.faq`,
        "Visible FAQ content and FAQ eligibility have not been reviewed.",
      ),
    );
  }
  if (
    faq.schemaPlanned &&
    (faq.eligibility !== "eligible" || faq.visibleStatus !== "visible")
  ) {
    issues.push(
      issue(
        "faq_schema_ineligible",
        "blocker",
        ticket.ticketId,
        `${prefix}.requirements.faq.schemaPlanned`,
        "FAQ schema cannot be planned without visible, eligible FAQ content.",
      ),
    );
  }

  const links = ticket.requirements.internalLinks;
  if (!verificationPassed(links) || links.graphDigest === null) {
    issues.push(
      issue(
        "internal_link_graph_not_verified",
        "blocker",
        ticket.ticketId,
        `${prefix}.requirements.internalLinks`,
        "The internal-link graph target set is not verified.",
      ),
    );
  }
  const seenLinkTargets = new Map<string, string>();
  for (const [role, route] of Object.entries(links.targets)) {
    const path = `${prefix}.requirements.internalLinks.targets.${role}`;
    if (route === null) {
      issues.push(
        issue(
          "internal_link_target_missing",
          "blocker",
          ticket.ticketId,
          path,
          `The ${role} internal-link target is missing.`,
        ),
      );
      continue;
    }

    if (ticket.target?.url === route) {
      issues.push(
        issue(
          "internal_link_self_link",
          "contract",
          ticket.ticketId,
          path,
          `The ${role} internal-link target points back to the article being upgraded.`,
        ),
      );
    }

    const firstRole = seenLinkTargets.get(route);
    if (firstRole !== undefined) {
      issues.push(
        issue(
          "internal_link_target_duplicate",
          "contract",
          ticket.ticketId,
          path,
          `The ${role} internal-link target duplicates the ${firstRole} target.`,
        ),
      );
    } else {
      seenLinkTargets.set(route, role);
    }
  }

  const expertise = ticket.requirements.expertEvidence;
  if (
    !verificationPassed(expertise) ||
    expertise.contributionId === null ||
    expertise.contributionDigest === null ||
    expertise.sourceKind === null
  ) {
    issues.push(
      issue(
        "expert_first_party_evidence_not_verified",
        "blocker",
        ticket.ticketId,
        `${prefix}.requirements.expertEvidence`,
        "Approved expert or first-party evidence is not traceably verified.",
      ),
    );
  }

  const mobile = ticket.requirements.mobileReview;
  if (
    !verificationPassed(mobile) ||
    mobile.desktopPassed !== true ||
    mobile.mobilePassed !== true
  ) {
    issues.push(
      issue(
        "mobile_review_not_passed",
        "blocker",
        ticket.ticketId,
        `${prefix}.requirements.mobileReview`,
        "Both desktop and mobile review evidence must pass.",
      ),
    );
  }

  const metadata = ticket.requirements.metadataSchema;
  if (
    !verificationPassed(metadata) ||
    metadata.metadataEligible !== true ||
    metadata.articleSchemaEligible !== true ||
    (faq.schemaPlanned && metadata.faqSchemaEligible !== true)
  ) {
    issues.push(
      issue(
        "metadata_schema_not_eligible",
        "blocker",
        ticket.ticketId,
        `${prefix}.requirements.metadataSchema`,
        "Metadata and structured-data eligibility have not passed.",
      ),
    );
  }

  const attribution = ticket.attribution;
  if (!approvalComplete(attribution.approval)) {
    issues.push(
      issue(
        "attribution_not_approved",
        "blocker",
        ticket.ticketId,
        `${prefix}.attribution.approval`,
        "Ticket 30 attribution/privacy approval is missing or incomplete.",
      ),
    );
  }
  if (attribution.contractRef === null) {
    issues.push(
      issue(
        "attribution_contract_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.attribution.contractRef`,
        "An approved attribution contract reference is required.",
      ),
    );
  }
  if (attribution.allowlistRef === null) {
    issues.push(
      issue(
        "attribution_allowlist_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.attribution.allowlistRef`,
        "An approved attribution allowlist reference is required.",
      ),
    );
  }
  if (
    ticket.cluster !== null &&
    attribution.cluster !== null &&
    ticket.cluster !== attribution.cluster
  ) {
    issues.push(
      issue(
        "cluster_drift",
        "contract",
        ticket.ticketId,
        `${prefix}.attribution.cluster`,
        "Declarative attribution cluster differs from the ticket cluster.",
      ),
    );
  }
  if (
    ticket.target !== null &&
    attribution.contentId !== null &&
    ticket.target.articleId !== attribution.contentId
  ) {
    issues.push(
      issue(
        "target_drift",
        "contract",
        ticket.ticketId,
        `${prefix}.attribution.contentId`,
        "Declarative attribution content ID differs from the target article.",
      ),
    );
  }

  const candidateDigest = computeArticleUpgradeCandidateDigest(ticket);
  const contentApproval = ticket.approvals.content;
  const releaseApproval = ticket.approvals.release;
  if (!approvalComplete(contentApproval)) {
    issues.push(
      issue(
        "content_approval_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.approvals.content`,
        "Independent content approval is missing or incomplete.",
      ),
    );
  } else if (contentApproval.subjectDigest !== candidateDigest) {
    issues.push(
      issue(
        "content_approval_digest_drift",
        "contract",
        ticket.ticketId,
        `${prefix}.approvals.content.subjectDigest`,
        "Content approval is bound to a stale candidate digest.",
      ),
    );
  }
  if (!approvalComplete(releaseApproval)) {
    issues.push(
      issue(
        "release_approval_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.approvals.release`,
        "Independent production release approval is missing or incomplete.",
      ),
    );
  } else if (releaseApproval.subjectDigest !== candidateDigest) {
    issues.push(
      issue(
        "release_approval_digest_drift",
        "contract",
        ticket.ticketId,
        `${prefix}.approvals.release.subjectDigest`,
        "Release approval is bound to a stale candidate digest.",
      ),
    );
  }
  if (
    approvalComplete(contentApproval) &&
    approvalComplete(releaseApproval) &&
    (contentApproval.approvalId === releaseApproval.approvalId ||
      contentApproval.actorId === releaseApproval.actorId ||
      releaseApproval.approvedAt! <= contentApproval.approvedAt!)
  ) {
    issues.push(
      issue(
        "approval_separation_invalid",
        "contract",
        ticket.ticketId,
        `${prefix}.approvals`,
        "Content and release approvals require distinct IDs, independent actors, and release approval after content approval.",
      ),
    );
  }

  const claimIds = new Set<string>();
  for (const claim of ticket.claims) {
    if (claimIds.has(claim.id)) {
      issues.push(
        issue(
          "claim_duplicate",
          "contract",
          ticket.ticketId,
          `${prefix}.claims.${claim.id}`,
          `Claim ID ${claim.id} is duplicated.`,
        ),
      );
    }
    claimIds.add(claim.id);
    if (claim.evidenceDigest === null) {
      issues.push(
        issue(
          claim.kind === "ranking"
            ? "unsupported_ranking_claim"
            : "unsupported_causal_claim",
          "contract",
          ticket.ticketId,
          `${prefix}.claims.${claim.id}.evidenceDigest`,
          `${claim.kind === "ranking" ? "Ranking" : "Causal"} claims require a traceable evidence digest.`,
        ),
      );
    }
  }

  const observationKeys = new Set<string>();
  for (const observation of ticket.observations) {
    if (observationKeys.has(observation.key)) {
      issues.push(
        issue(
          "observation_duplicate",
          "contract",
          ticket.ticketId,
          `${prefix}.observations.${observation.key}`,
          `Observation key ${observation.key} is duplicated.`,
        ),
      );
    }
    observationKeys.add(observation.key);
    if (
      ticket.provenance === "live" &&
      observation.status === "synthetic-fixture"
    ) {
      issues.push(
        issue(
          "provenance_mismatch",
          "contract",
          ticket.ticketId,
          `${prefix}.observations.${observation.key}.status`,
          "Synthetic observation status cannot appear in a live record.",
        ),
      );
    }
  }

  if (ticket.provenance === "live") {
    issues.push(
      issue(
        "trusted_execution_attestation_missing",
        "blocker",
        ticket.ticketId,
        `${prefix}.executionAttestation`,
        "Self-reported approvals, ledger status, and evidence require verification by a trusted external resolver before execution can be authorized.",
      ),
    );
  }

  if (ticket.provenance === "synthetic-fixture") {
    issues.push(
      issue(
        "synthetic_provenance_not_executable",
        "guard",
        ticket.ticketId,
        `${prefix}.provenance`,
        "Synthetic fixture evidence can validate logic but can never authorize live execution or completion.",
      ),
    );
  }

  const sorted = sortIssues(issues);
  const blocked = isBlocking(sorted);
  const status = blocked
    ? "blocked"
    : ticket.provenance === "synthetic-fixture"
      ? "fixture-ready"
      : "ready-for-execution";
  const disposition: ArticleUpgradeDisposition =
    ticket.source.baseline !== null &&
    ticket.source.current !== null &&
    ticket.source.baseline.digest === ticket.source.current.digest
      ? "no-op"
      : "hold";

  return deepFreeze({
    ticketId: ticket.ticketId,
    rank: ticket.rank,
    cluster: ticket.cluster,
    target: ticket.target,
    candidateDigest,
    rollbackBaselineDigest: ticket.source.baseline?.digest ?? null,
    status,
    schemaValid: true,
    evidenceVerified: false,
    authorizedForExecution: false,
    productionExecution: false,
    disposition,
    previewable: ticket.target !== null,
    simulationReady: !blocked,
    executable: false,
    complete: false,
    reasonCodes: reasonCodes(sorted),
    issues: sorted,
  });
}

function evaluateManifestIntegrity(
  manifest: ArticleUpgradeManifestInput,
  context: ArticleUpgradeEvaluationContext,
  dataMode: ArticleUpgradeDataMode,
): ArticleUpgradeIssue[] {
  const issues: ArticleUpgradeIssue[] = [];
  const provenanceMode =
    manifest.provenance === "live" ? "actual" : "synthetic_fixture";

  if (dataMode !== "dry_run" && dataMode !== provenanceMode) {
    issues.push(
      issue(
        "data_mode_mismatch",
        "contract",
        null,
        "$.provenance",
        `Data mode ${dataMode} conflicts with ${manifest.provenance} provenance, which maps to ${provenanceMode}.`,
      ),
    );
  }
  if (dataMode === "dry_run") {
    issues.push(
      issue(
        "dry_run_preview_only",
        "guard",
        null,
        "$.context.dataMode",
        "Dry-run mode is preview-only and cannot authorize production execution.",
      ),
    );
  }

  if (
    manifest.provenance === "synthetic-fixture" &&
    context.environment !== "test"
  ) {
    issues.push(
      issue(
        "fixture_requires_test_environment",
        "contract",
        null,
        "$.provenance",
        "Synthetic fixture provenance is accepted only in the test environment.",
      ),
    );
  }

  for (const item of collectProvenances(manifest)) {
    if (item.provenance !== manifest.provenance) {
      issues.push(
        issue(
          "provenance_mismatch",
          "contract",
          null,
          item.path,
          `Nested provenance ${item.provenance} differs from manifest provenance ${manifest.provenance}.`,
        ),
      );
    }
  }

  const futureDatesAllowed =
    manifest.provenance === "synthetic-fixture" &&
    context.environment === "test";
  if (!futureDatesAllowed) {
    for (const item of collectDates(manifest)) {
      if (item.date > context.today) {
        issues.push(
          issue(
            "future_date_forbidden",
            "contract",
            null,
            item.path,
            `Date ${item.date} is later than evaluation date ${context.today}.`,
          ),
        );
      }
    }
  }

  const ticketCounts = new Map<ArticleUpgradeTicketId, number>();
  for (const ticket of manifest.tickets) {
    ticketCounts.set(
      ticket.ticketId,
      (ticketCounts.get(ticket.ticketId) ?? 0) + 1,
    );
  }
  for (const slot of ARTICLE_UPGRADE_TICKET_REGISTRY) {
    const count = ticketCounts.get(slot.ticketId) ?? 0;
    if (count === 0) {
      issues.push(
        issue(
          "ticket_missing",
          "contract",
          slot.ticketId,
          "$.tickets",
          `Ticket ${slot.ticketId} / rank ${slot.rank} is missing from the manifest.`,
        ),
      );
    } else if (count > 1) {
      issues.push(
        issue(
          "ticket_duplicate",
          "contract",
          slot.ticketId,
          "$.tickets",
          `Ticket ${slot.ticketId} appears ${count} times.`,
        ),
      );
    }
  }

  const targets = new Map<string, ArticleUpgradeTicketId>();
  for (const ticket of manifest.tickets) {
    if (ticket.target === null) continue;
    for (const key of [ticket.target.articleId, ticket.target.url]) {
      const first = targets.get(key);
      if (first) {
        issues.push(
          issue(
            "target_duplicate",
            "contract",
            ticket.ticketId,
            `tickets.${ticket.ticketId}.target`,
            `Target ${key} is already assigned to Ticket ${first}.`,
          ),
        );
      } else {
        targets.set(key, ticket.ticketId);
      }
    }
  }

  return sortIssues(issues);
}

export function evaluateArticleUpgradeManifest(
  input: unknown,
  context: unknown,
): ArticleUpgradeManifestReport {
  const contextResult =
    articleUpgradeEvaluationContextSchema.safeParse(context);
  if (!contextResult.success) {
    return schemaFailureReport(contextResult.error.issues, "$.context");
  }
  const parsedContext = contextResult.data;

  let safeInput: unknown;
  try {
    safeInput = deepClone(input);
  } catch (error) {
    return jsonContractFailureReport(error);
  }

  const result = articleUpgradeManifestSchema.safeParse(safeInput);
  if (!result.success) return schemaFailureReport(result.error.issues);

  const manifest = canonicalizeArticleUpgradeManifest(
    result.data as ArticleUpgradeManifestInput,
  );
  const dataMode: ArticleUpgradeDataMode =
    parsedContext.dataMode ??
    (manifest.provenance === "live" ? "actual" : "synthetic_fixture");
  const integrityIssues = evaluateManifestIntegrity(
    manifest,
    parsedContext,
    dataMode,
  );
  const tickets = manifest.tickets.map(evaluateTicket);
  const issues = sortIssues([
    ...integrityIssues,
    ...tickets.flatMap((ticket) => ticket.issues),
  ]);
  const blocked = isBlocking(issues);
  const status = blocked
    ? "blocked"
    : manifest.provenance === "synthetic-fixture"
      ? "fixture-ready"
      : "ready-for-execution";
  const disposition: ArticleUpgradeDisposition = tickets.every(
    (ticket) => ticket.disposition === "no-op",
  )
    ? "no-op"
    : "hold";

  return deepFreeze({
    version: ARTICLE_UPGRADE_SCHEMA_VERSION,
    asOf: manifest.asOf,
    provenance: manifest.provenance,
    dataMode,
    manifestDigest: computeArticleUpgradeManifestDigest(manifest),
    status,
    schemaValid: true,
    evidenceVerified: false,
    authorizedForExecution: false,
    productionExecution: false,
    disposition,
    previewable:
      tickets.length === ARTICLE_UPGRADE_TICKET_REGISTRY.length &&
      tickets.every((ticket) => ticket.previewable),
    simulationReady: !blocked,
    executable: false,
    complete: false,
    reasonCodes: reasonCodes(issues),
    issues,
    tickets,
  });
}
