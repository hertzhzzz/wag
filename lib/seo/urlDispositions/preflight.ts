import type { ZodIssue } from "zod";

import {
  compareCodePoints,
  computeUrlDispositionArtifactDigest,
  computeUrlDispositionReportDigest,
  deepFreeze,
  sortCodePoints,
} from "./canonical";
import {
  URL_DISPOSITION_PREREQUISITE_TICKETS,
  urlDispositionPreflightInputSchema,
  type Sha256Digest,
  type TraceEvidence,
  type UrlDispositionPlanInput,
  type UrlDispositionPlanRecord,
  type UrlDispositionPreflightInput,
  type UrlDispositionReleaseContract,
  type UrlProbeEvidence,
} from "./schema";

export type UrlDispositionPreflightStatus =
  | "blocked"
  | "split_required"
  | "approved_for_preflight";

export type UrlDispositionPreflightIssueCode =
  | "input_schema_invalid"
  | "disposition_scope_empty"
  | "duplicate_disposition_id"
  | "duplicate_source_url"
  | "scope_source_limit_exceeded"
  | "scope_multiple_destination_bundles"
  | "ledger_not_valid"
  | "ledger_not_locked"
  | "prerequisite_missing"
  | "prerequisite_duplicate"
  | "prerequisite_incomplete"
  | "fixture_evidence_forbidden"
  | "rationale_missing"
  | "rollback_note_missing"
  | "rollback_conditions_missing"
  | "url_not_canonical"
  | "source_probe_mismatch"
  | "source_probe_unknown"
  | "source_not_live"
  | "source_soft_404"
  | "source_canonical_mismatch"
  | "destination_probe_mismatch"
  | "destination_probe_unknown"
  | "destination_not_live"
  | "destination_soft_404"
  | "destination_canonical_mismatch"
  | "redirect_not_permanent"
  | "redirect_not_one_hop"
  | "redirect_target_mismatch"
  | "retirement_status_invalid"
  | "canonical_target_mismatch"
  | "redirect_chain"
  | "redirect_loop"
  | "planned_destination_mismatch"
  | "equity_plan_missing"
  | "equity_unknown"
  | "equity_not_preserved"
  | "equity_destination_unjustified"
  | "approval_missing"
  | "approval_duplicate"
  | "approval_unmatched"
  | "approval_digest_mismatch"
  | "approval_time_invalid"
  | "baseline_duplicate"
  | "baseline_source_missing"
  | "baseline_destination_missing"
  | "unaffected_report_duplicate"
  | "unaffected_report_conflict"
  | "unaffected_report_incomplete"
  | "unaffected_report_unexpected"
  | "unaffected_probe_mismatch"
  | "unaffected_probe_unknown"
  | "unaffected_not_live"
  | "unaffected_soft_404"
  | "unaffected_canonical_mismatch"
  | "release_contract_missing"
  | "release_state_invalid"
  | "release_artifact_digest_mismatch"
  | "release_approval_kind_invalid"
  | "release_identity_mismatch"
  | "release_approvers_not_independent"
  | "release_approval_time_invalid"
  | "release_report_digest_mismatch"
  | "timestamp_after_as_of";

export interface UrlDispositionPreflightIssue {
  readonly code: UrlDispositionPreflightIssueCode;
  readonly path: string;
  readonly message: string;
  readonly dispositionIds: readonly string[];
}

export interface UrlDispositionSummary {
  readonly id: string;
  readonly bundleId: string;
  readonly action: UrlDispositionPlanRecord["action"];
  readonly source: string;
  readonly destination: string | null;
  readonly finalDestination: string | null;
  readonly status: "validated" | "blocked";
  readonly blockerCodes: readonly UrlDispositionPreflightIssueCode[];
}

export interface UrlDispositionPreflightReport {
  readonly version: 1;
  readonly asOf: string | null;
  readonly status: UrlDispositionPreflightStatus;
  readonly artifactDigest: Sha256Digest | null;
  readonly reportDigest: Sha256Digest;
  readonly scope: {
    readonly scopeId: string | null;
    readonly dispositionIds: readonly string[];
    readonly sourceUrls: readonly string[];
    readonly sourceCount: number;
    readonly destinationBundles: readonly string[];
  };
  readonly blockers: readonly UrlDispositionPreflightIssue[];
  readonly dispositions: readonly UrlDispositionSummary[];
  readonly unaffectedUrls: {
    readonly status: "satisfied" | "blocked";
    readonly expected: readonly string[];
    readonly reported: readonly string[];
    readonly missing: readonly string[];
    readonly unexpected: readonly string[];
    readonly conflicts: readonly string[];
  };
  readonly releaseGate: {
    readonly status: "satisfied" | "blocked";
    readonly releaseId: string | null;
    readonly artifactDigest: Sha256Digest | null;
    readonly contentApprover: string | null;
    readonly productionApprover: string | null;
    readonly verifiedReportDigest: Sha256Digest | null;
  };
  readonly productionExecution: {
    readonly supported: false;
    readonly allowed: false;
    readonly reason: string;
  };
}

type MutableIssue = {
  code: UrlDispositionPreflightIssueCode;
  path: string;
  message: string;
  dispositionIds: string[];
};

type MutableUnaffectedReport = {
  status: "satisfied" | "blocked";
  expected: string[];
  reported: string[];
  missing: string[];
  unexpected: string[];
  conflicts: string[];
};

const SURFACE_KEYS = [
  "internalLinks",
  "canonicals",
  "sitemap",
  "breadcrumbs",
  "structuredData",
] as const;

const PRODUCTION_EXECUTION = {
  supported: false,
  allowed: false,
  reason:
    "Ticket 24 validates evidence only; production URL execution is outside this contract.",
} as const;

function uniqueSorted(values: readonly string[]): string[] {
  return sortCodePoints([...new Set(values)]);
}

function addIssue(
  issues: MutableIssue[],
  code: UrlDispositionPreflightIssueCode,
  path: string,
  message: string,
  dispositionIds: readonly string[] = [],
): void {
  issues.push({
    code,
    path,
    message,
    dispositionIds: uniqueSorted(dispositionIds),
  });
}

function issuePath(issue: ZodIssue): string {
  return issue.path.length > 0 ? issue.path.join(".") : "(root)";
}

function sortIssues(issues: readonly MutableIssue[]): MutableIssue[] {
  return [...issues].sort(
    (left, right) =>
      compareCodePoints(left.code, right.code) ||
      compareCodePoints(left.path, right.path) ||
      compareCodePoints(left.message, right.message) ||
      compareCodePoints(
        left.dispositionIds.join("\u0000"),
        right.dispositionIds.join("\u0000"),
      ),
  );
}

export function isCanonicalInternalRoute(value: string): boolean {
  if (value === "/") return true;
  if (
    !value.startsWith("/") ||
    value.endsWith("/") ||
    value.includes("//") ||
    value.includes("?") ||
    value.includes("#") ||
    value !== value.toLowerCase() ||
    /\s/.test(value)
  ) {
    return false;
  }

  const segments = value.slice(1).split("/");
  return segments.every(
    (segment) =>
      segment.length > 0 &&
      segment !== "." &&
      segment !== ".." &&
      /^[a-z0-9._~-]+$/.test(segment),
  );
}

function finalDestination(record: UrlDispositionPlanRecord): string | null {
  if (record.action === "keep") return record.source;
  if (record.action === "retire") return null;
  return record.destination;
}

function validateTimestampsAtOrBeforeAsOf(
  value: unknown,
  path: string,
  asOf: string,
  issues: MutableIssue[],
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      validateTimestampsAtOrBeforeAsOf(item, `${path}.${index}`, asOf, issues),
    );
    return;
  }
  if (value === null || typeof value !== "object") return;
  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    const itemPath = `${path}.${key}`;
    if (
      (key === "preparedAt" || key === "approvedAt" || key === "capturedAt") &&
      typeof item === "string" &&
      item > asOf
    ) {
      addIssue(
        issues,
        "timestamp_after_as_of",
        itemPath,
        `Timestamp ${item} must not be later than explicit asOf ${asOf}.`,
      );
    }
    validateTimestampsAtOrBeforeAsOf(item, itemPath, asOf, issues);
  });
}

function validateEvidence(
  evidence: TraceEvidence,
  path: string,
  issues: MutableIssue[],
  dispositionIds: readonly string[] = [],
): void {
  if (evidence.origin === "fixture") {
    addIssue(
      issues,
      "fixture_evidence_forbidden",
      path,
      `Fixture evidence ${evidence.id} is non-public test material and cannot approve a production preflight.`,
      dispositionIds,
    );
  }
}

function validateCanonicalRoute(
  value: string | null,
  path: string,
  issues: MutableIssue[],
  dispositionIds: readonly string[] = [],
): void {
  if (value !== null && !isCanonicalInternalRoute(value)) {
    addIssue(
      issues,
      "url_not_canonical",
      path,
      `${value || "(empty)"} is not a canonical internal URL path.`,
      dispositionIds,
    );
  }
}

type ProbeRole = "source" | "destination" | "unaffected";

function validateLiveProbe(
  probe: UrlProbeEvidence,
  expectedUrl: string,
  role: ProbeRole,
  path: string,
  issues: MutableIssue[],
  dispositionIds: readonly string[] = [],
): void {
  validateEvidence(probe.evidence, `${path}.evidence`, issues, dispositionIds);
  validateCanonicalRoute(probe.url, `${path}.url`, issues, dispositionIds);
  validateCanonicalRoute(
    probe.redirectTarget,
    `${path}.redirectTarget`,
    issues,
    dispositionIds,
  );
  validateCanonicalRoute(
    probe.canonical,
    `${path}.canonical`,
    issues,
    dispositionIds,
  );

  if (probe.url !== expectedUrl) {
    addIssue(
      issues,
      `${role}_probe_mismatch`,
      `${path}.url`,
      `Probe URL ${probe.url} does not match expected URL ${expectedUrl}.`,
      dispositionIds,
    );
  }

  if (
    probe.status === "unknown" ||
    probe.httpStatus === null ||
    probe.soft404 === "unknown" ||
    probe.canonical === null
  ) {
    addIssue(
      issues,
      `${role}_probe_unknown`,
      path,
      `${role} probe evidence must resolve status, HTTP response, soft-404 state, and canonical.`,
      dispositionIds,
    );
  }

  if (
    probe.status !== "live" ||
    probe.httpStatus !== 200 ||
    probe.redirectTarget !== null ||
    probe.hopCount !== 0
  ) {
    addIssue(
      issues,
      `${role}_not_live`,
      path,
      `${role} must be a direct live 200 response with zero redirect hops.`,
      dispositionIds,
    );
  }

  if (probe.soft404 === "yes") {
    addIssue(
      issues,
      `${role}_soft_404`,
      `${path}.soft404`,
      `${role} probe identifies a soft-404 response.`,
      dispositionIds,
    );
  }

  if (probe.canonical !== null && probe.canonical !== expectedUrl) {
    addIssue(
      issues,
      `${role}_canonical_mismatch`,
      `${path}.canonical`,
      `${role} canonical ${probe.canonical} does not match ${expectedUrl}.`,
      dispositionIds,
    );
  }
}

function validateGovernance(
  plan: UrlDispositionPlanInput,
  issues: MutableIssue[],
): void {
  const { ledger, prerequisiteTickets } = plan.governance;
  validateEvidence(ledger.evidence, "plan.governance.ledger.evidence", issues);

  if (ledger.status !== "valid") {
    addIssue(
      issues,
      "ledger_not_valid",
      "plan.governance.ledger.status",
      `Migration ledger status is ${ledger.status}; valid is required.`,
    );
  }
  if (!ledger.locked) {
    addIssue(
      issues,
      "ledger_not_locked",
      "plan.governance.ledger.locked",
      "Migration ledger must be locked before URL disposition preflight.",
    );
  }

  const ticketsById = new Map<string, typeof prerequisiteTickets>();
  for (const [index, ticket] of prerequisiteTickets.entries()) {
    validateEvidence(
      ticket.evidence,
      `plan.governance.prerequisiteTickets.${index}.evidence`,
      issues,
    );
    const matches = ticketsById.get(ticket.ticketId) ?? [];
    matches.push(ticket);
    ticketsById.set(ticket.ticketId, matches);
  }

  for (const ticketId of URL_DISPOSITION_PREREQUISITE_TICKETS) {
    const matches = ticketsById.get(ticketId) ?? [];
    if (matches.length === 0) {
      addIssue(
        issues,
        "prerequisite_missing",
        "plan.governance.prerequisiteTickets",
        `Required prerequisite Ticket ${ticketId} is missing.`,
      );
      continue;
    }
    if (matches.length > 1) {
      addIssue(
        issues,
        "prerequisite_duplicate",
        "plan.governance.prerequisiteTickets",
        `Required prerequisite Ticket ${ticketId} appears more than once.`,
      );
    }
    for (const ticket of matches) {
      if (ticket.status !== "complete") {
        addIssue(
          issues,
          "prerequisite_incomplete",
          `plan.governance.prerequisiteTickets.${ticketId}.status`,
          `Required prerequisite Ticket ${ticketId} is ${ticket.status}.`,
        );
      }
    }
  }
}

function validateApproval(
  record: UrlDispositionPlanRecord,
  approvalsById: ReadonlyMap<string, UrlDispositionPreflightInput["approvals"]>,
  artifactDigest: Sha256Digest,
  preparedAt: string,
  issues: MutableIssue[],
): void {
  const approvals = approvalsById.get(record.id) ?? [];
  if (approvals.length === 0) {
    addIssue(
      issues,
      "approval_missing",
      `approvals.${record.id}`,
      `Disposition ${record.id} has no human approval identity, time, and artifact digest.`,
      [record.id],
    );
    return;
  }
  if (approvals.length > 1) {
    addIssue(
      issues,
      "approval_duplicate",
      `approvals.${record.id}`,
      `Disposition ${record.id} has multiple approval records.`,
      [record.id],
    );
  }

  for (const approval of approvals) {
    if (approval.artifactDigest !== artifactDigest) {
      addIssue(
        issues,
        "approval_digest_mismatch",
        `approvals.${record.id}.artifactDigest`,
        `Disposition ${record.id} approval is not bound to ${artifactDigest}.`,
        [record.id],
      );
    }
    if (approval.approvedAt <= preparedAt) {
      addIssue(
        issues,
        "approval_time_invalid",
        `approvals.${record.id}.approvedAt`,
        `Disposition ${record.id} approval must be later than plan preparation.`,
        [record.id],
      );
    }
  }
}

function validateEquityAssessment(
  record: UrlDispositionPlanRecord,
  key: "uniqueContent" | "backlinkEquity",
  expectedDestination: string | null,
  issues: MutableIssue[],
): void {
  const assessment = record.equity[key];
  const path = `plan.records.${record.id}.equity.${key}`;
  validateEvidence(assessment.evidence, `${path}.evidence`, issues, [
    record.id,
  ]);
  validateCanonicalRoute(
    assessment.preservationDestination,
    `${path}.preservationDestination`,
    issues,
    [record.id],
  );

  if (assessment.plan.length === 0) {
    addIssue(
      issues,
      "equity_plan_missing",
      `${path}.plan`,
      `${key} requires a written evidence-preservation plan.`,
      [record.id],
    );
  }
  if (assessment.state === "unknown") {
    addIssue(
      issues,
      "equity_unknown",
      `${path}.state`,
      `${key} must be explicitly assessed as present or none.`,
      [record.id],
    );
  } else if (assessment.state === "present") {
    if (
      expectedDestination === null ||
      assessment.preservationDestination !== expectedDestination
    ) {
      addIssue(
        issues,
        "equity_not_preserved",
        `${path}.preservationDestination`,
        `${key} is present but is not preserved at the planned final destination.`,
        [record.id],
      );
    }
  } else if (assessment.preservationDestination !== null) {
    addIssue(
      issues,
      "equity_destination_unjustified",
      `${path}.preservationDestination`,
      `${key} is recorded as none but still names a preservation destination.`,
      [record.id],
    );
  }
}

function validateRecord(
  record: UrlDispositionPlanRecord,
  approvalsById: ReadonlyMap<string, UrlDispositionPreflightInput["approvals"]>,
  artifactDigest: Sha256Digest,
  preparedAt: string,
  issues: MutableIssue[],
): void {
  const basePath = `plan.records.${record.id}`;
  const expectedDestination = finalDestination(record);

  validateCanonicalRoute(record.source, `${basePath}.source`, issues, [
    record.id,
  ]);
  validateCanonicalRoute(
    record.destination,
    `${basePath}.destination`,
    issues,
    [record.id],
  );
  validateLiveProbe(
    record.sourceProbe,
    record.source,
    "source",
    `${basePath}.sourceProbe`,
    issues,
    [record.id],
  );

  if (record.rationale.length === 0) {
    addIssue(
      issues,
      "rationale_missing",
      `${basePath}.rationale`,
      `Disposition ${record.id} requires an approved rationale.`,
      [record.id],
    );
  }

  if (record.rollback.note.length === 0) {
    addIssue(
      issues,
      "rollback_note_missing",
      `${basePath}.rollback.note`,
      `Disposition ${record.id} requires a rollback note.`,
      [record.id],
    );
  }
  if (
    record.rollback.conditions.length === 0 ||
    record.rollback.conditions.some((condition) => condition.length === 0)
  ) {
    addIssue(
      issues,
      "rollback_conditions_missing",
      `${basePath}.rollback.conditions`,
      `Disposition ${record.id} requires explicit rollback conditions.`,
      [record.id],
    );
  }
  validateEvidence(
    record.rollback.evidence,
    `${basePath}.rollback.evidence`,
    issues,
    [record.id],
  );

  if (record.action === "merge" || record.action === "redirect") {
    validateCanonicalRoute(
      record.transition.target,
      `${basePath}.transition.target`,
      issues,
      [record.id],
    );
    if (
      record.transition.statusCode !== 301 &&
      record.transition.statusCode !== 308
    ) {
      addIssue(
        issues,
        "redirect_not_permanent",
        `${basePath}.transition.statusCode`,
        `Disposition ${record.id} must use a permanent 301 or 308 redirect.`,
        [record.id],
      );
    }
    if (record.transition.hopCount !== 1) {
      addIssue(
        issues,
        "redirect_not_one_hop",
        `${basePath}.transition.hopCount`,
        `Disposition ${record.id} must resolve in exactly one planned hop.`,
        [record.id],
      );
    }
    if (record.transition.target !== record.destination) {
      addIssue(
        issues,
        "redirect_target_mismatch",
        `${basePath}.transition.target`,
        `Disposition ${record.id} redirect target must equal its destination.`,
        [record.id],
      );
    }
  } else if (record.action === "retire") {
    if (record.transition.statusCode !== 410) {
      addIssue(
        issues,
        "retirement_status_invalid",
        `${basePath}.transition.statusCode`,
        `Retirement ${record.id} must plan an explicit 410 response.`,
        [record.id],
      );
    }
  } else if (record.action === "canonical") {
    validateCanonicalRoute(
      record.transition.target,
      `${basePath}.transition.target`,
      issues,
      [record.id],
    );
    if (record.transition.target !== record.destination) {
      addIssue(
        issues,
        "canonical_target_mismatch",
        `${basePath}.transition.target`,
        `Canonical ${record.id} target must equal its final destination.`,
        [record.id],
      );
    }
  }

  if (record.destinationProbe !== null && record.destination !== null) {
    validateLiveProbe(
      record.destinationProbe,
      record.destination,
      "destination",
      `${basePath}.destinationProbe`,
      issues,
      [record.id],
    );
  }

  for (const surfaceKey of SURFACE_KEYS) {
    const surface = record.surfaces[surfaceKey];
    const surfacePath = `${basePath}.surfaces.${surfaceKey}`;
    validateEvidence(surface.evidence, `${surfacePath}.evidence`, issues, [
      record.id,
    ]);
    validateCanonicalRoute(
      surface.plannedFinalDestination,
      `${surfacePath}.plannedFinalDestination`,
      issues,
      [record.id],
    );
    if (surface.plannedFinalDestination !== expectedDestination) {
      addIssue(
        issues,
        "planned_destination_mismatch",
        `${surfacePath}.plannedFinalDestination`,
        `${surfaceKey} must resolve to ${expectedDestination ?? "removal"}.`,
        [record.id],
      );
    }
  }

  validateEquityAssessment(
    record,
    "uniqueContent",
    expectedDestination,
    issues,
  );
  validateEquityAssessment(
    record,
    "backlinkEquity",
    expectedDestination,
    issues,
  );
  validateApproval(record, approvalsById, artifactDigest, preparedAt, issues);
}

function validateRedirectTopology(
  records: readonly UrlDispositionPlanRecord[],
  issues: MutableIssue[],
): void {
  const recordsBySource = new Map<string, UrlDispositionPlanRecord>();
  const mappings = new Map<string, { destination: string; id: string }>();

  for (const record of records) {
    if (!recordsBySource.has(record.source)) {
      recordsBySource.set(record.source, record);
    }
    if (
      record.action === "merge" ||
      record.action === "redirect" ||
      record.action === "canonical"
    ) {
      mappings.set(record.source, {
        destination: record.destination,
        id: record.id,
      });
      if (record.source === record.destination) {
        addIssue(
          issues,
          "redirect_loop",
          `plan.records.${record.id}.destination`,
          `Disposition ${record.id} points back to its own source.`,
          [record.id],
        );
      }
    }
  }

  for (const [source, mapping] of mappings) {
    const destinationRecord = recordsBySource.get(mapping.destination);
    if (destinationRecord && destinationRecord.action !== "keep") {
      addIssue(
        issues,
        "redirect_chain",
        `plan.records.${mapping.id}.destination`,
        `${source} points to ${mapping.destination}, which is also changed by ${destinationRecord.id}.`,
        [mapping.id, destinationRecord.id],
      );
    }
  }

  const reportedCycles = new Set<string>();
  for (const start of sortCodePoints([...mappings.keys()])) {
    const path: string[] = [];
    const pathIndex = new Map<string, number>();
    let current: string | undefined = start;

    while (current && mappings.has(current)) {
      const previousIndex = pathIndex.get(current);
      if (previousIndex !== undefined) {
        const cycleNodes = path.slice(previousIndex);
        const cycleKey = uniqueSorted(cycleNodes).join("\u0000");
        if (!reportedCycles.has(cycleKey)) {
          reportedCycles.add(cycleKey);
          const ids = cycleNodes
            .map((node) => mappings.get(node)?.id)
            .filter((id): id is string => Boolean(id));
          addIssue(
            issues,
            "redirect_loop",
            "plan.records",
            `URL disposition loop detected across ${sortCodePoints(cycleNodes).join(", ")}.`,
            ids,
          );
        }
        break;
      }
      pathIndex.set(current, path.length);
      path.push(current);
      current = mappings.get(current)?.destination;
    }
  }
}

function validateUnaffectedReport(
  plan: UrlDispositionPlanInput,
  issues: MutableIssue[],
): MutableUnaffectedReport {
  const report = plan.unaffectedReport;
  const issueCountBefore = issues.length;
  validateEvidence(
    report.inventoryEvidence,
    "plan.unaffectedReport.inventoryEvidence",
    issues,
  );
  validateEvidence(
    report.reportEvidence,
    "plan.unaffectedReport.reportEvidence",
    issues,
  );

  const baselineUrls = report.baselineUrls;
  for (const [index, url] of baselineUrls.entries()) {
    validateCanonicalRoute(
      url,
      `plan.unaffectedReport.baselineUrls.${index}`,
      issues,
    );
  }
  if (new Set(baselineUrls).size !== baselineUrls.length) {
    addIssue(
      issues,
      "baseline_duplicate",
      "plan.unaffectedReport.baselineUrls",
      "Baseline URL inventory contains duplicate entries.",
    );
  }

  const baselineSet = new Set(baselineUrls);
  const affected = new Set<string>();
  for (const record of plan.records) {
    affected.add(record.source);
    if (!baselineSet.has(record.source)) {
      addIssue(
        issues,
        "baseline_source_missing",
        "plan.unaffectedReport.baselineUrls",
        `Disposition source ${record.source} is absent from the baseline inventory.`,
        [record.id],
      );
    }
    if (record.destination !== null) {
      affected.add(record.destination);
      if (!baselineSet.has(record.destination)) {
        addIssue(
          issues,
          "baseline_destination_missing",
          "plan.unaffectedReport.baselineUrls",
          `Live disposition destination ${record.destination} is absent from the baseline inventory.`,
          [record.id],
        );
      }
    }
  }

  const expected = uniqueSorted(
    baselineUrls.filter((url) => !affected.has(url)),
  );
  const reported = uniqueSorted(report.unchanged.map(({ url }) => url));
  if (reported.length !== report.unchanged.length) {
    addIssue(
      issues,
      "unaffected_report_duplicate",
      "plan.unaffectedReport.unchanged",
      "Unaffected URL report contains duplicate entries.",
    );
  }

  const expectedSet = new Set(expected);
  const reportedSet = new Set(reported);
  const conflicts = reported.filter((url) => affected.has(url));
  const missing = expected.filter((url) => !reportedSet.has(url));
  const unexpected = reported.filter((url) => !expectedSet.has(url));

  if (conflicts.length > 0) {
    addIssue(
      issues,
      "unaffected_report_conflict",
      "plan.unaffectedReport.unchanged",
      `Unaffected report conflicts with disposition sources or destinations: ${conflicts.join(", ")}.`,
    );
  }
  if (missing.length > 0) {
    addIssue(
      issues,
      "unaffected_report_incomplete",
      "plan.unaffectedReport.unchanged",
      `Unaffected report omits baseline URLs: ${missing.join(", ")}.`,
    );
  }
  if (unexpected.length > 0) {
    addIssue(
      issues,
      "unaffected_report_unexpected",
      "plan.unaffectedReport.unchanged",
      `Unaffected report includes non-unaffected URLs: ${unexpected.join(", ")}.`,
    );
  }

  for (const [index, unchanged] of report.unchanged.entries()) {
    const path = `plan.unaffectedReport.unchanged.${index}`;
    validateCanonicalRoute(unchanged.url, `${path}.url`, issues);
    validateCanonicalRoute(
      unchanged.expectedCanonical,
      `${path}.expectedCanonical`,
      issues,
    );
    if (unchanged.expectedCanonical !== unchanged.url) {
      addIssue(
        issues,
        "unaffected_canonical_mismatch",
        `${path}.expectedCanonical`,
        `Unchanged URL ${unchanged.url} must remain self-canonical.`,
      );
    }
    validateLiveProbe(
      unchanged.probe,
      unchanged.url,
      "unaffected",
      `${path}.probe`,
      issues,
    );
  }

  return {
    status: issues.length === issueCountBefore ? "satisfied" : "blocked",
    expected,
    reported,
    missing,
    unexpected,
    conflicts,
  };
}

function validateReleaseIdentity(
  approval: UrlDispositionReleaseContract["contentApproval"],
  release: UrlDispositionReleaseContract,
  expectedKind: "content" | "production",
  artifactDigest: Sha256Digest,
  preparedAt: string,
  issues: MutableIssue[],
): void {
  const path = `releaseContract.${expectedKind}Approval`;
  if (approval.kind !== expectedKind) {
    addIssue(
      issues,
      "release_approval_kind_invalid",
      `${path}.kind`,
      `${expectedKind} approval kind is ${approval.kind}.`,
    );
  }
  if (
    approval.releaseId !== release.releaseId ||
    approval.artifactDigest !== artifactDigest ||
    approval.reportDigest !== release.reportDigest
  ) {
    addIssue(
      issues,
      "release_identity_mismatch",
      path,
      `${expectedKind} approval is not bound to the release identity and artifact.`,
    );
  }
  if (approval.approvedAt <= preparedAt) {
    addIssue(
      issues,
      "release_approval_time_invalid",
      `${path}.approvedAt`,
      `${expectedKind} approval must be later than plan preparation.`,
    );
  }
}

function validateReleaseContract(
  release: UrlDispositionReleaseContract | null,
  artifactDigest: Sha256Digest,
  preparedAt: string,
  issues: MutableIssue[],
): UrlDispositionPreflightReport["releaseGate"] {
  const issueCountBefore = issues.length;
  if (release === null) {
    addIssue(
      issues,
      "release_contract_missing",
      "releaseContract",
      "A dual-approval release contract bound to this artifact is required.",
    );
    return {
      status: "blocked",
      releaseId: null,
      artifactDigest: null,
      contentApprover: null,
      productionApprover: null,
      verifiedReportDigest: null,
    };
  }

  if (release.state !== "production_approved") {
    addIssue(
      issues,
      "release_state_invalid",
      "releaseContract.state",
      `Release contract state is ${release.state}; production_approved is required before execution can be considered elsewhere.`,
    );
  }
  if (release.artifactDigest !== artifactDigest) {
    addIssue(
      issues,
      "release_artifact_digest_mismatch",
      "releaseContract.artifactDigest",
      `Release contract is not bound to URL disposition artifact ${artifactDigest}.`,
    );
  }

  validateReleaseIdentity(
    release.contentApproval,
    release,
    "content",
    artifactDigest,
    preparedAt,
    issues,
  );
  validateReleaseIdentity(
    release.productionApproval,
    release,
    "production",
    artifactDigest,
    preparedAt,
    issues,
  );

  if (
    release.contentApproval.actor.id === release.productionApproval.actor.id
  ) {
    addIssue(
      issues,
      "release_approvers_not_independent",
      "releaseContract.productionApproval.actor.id",
      "Content and production approvals must come from independent human identities.",
    );
  }
  if (
    release.productionApproval.approvedAt <= release.contentApproval.approvedAt
  ) {
    addIssue(
      issues,
      "release_approval_time_invalid",
      "releaseContract.productionApproval.approvedAt",
      "Production approval must be later than content approval.",
    );
  }

  return {
    status: issues.length === issueCountBefore ? "satisfied" : "blocked",
    releaseId: release.releaseId,
    artifactDigest: release.artifactDigest,
    contentApprover: release.contentApproval.actor.id,
    productionApprover: release.productionApproval.actor.id,
    verifiedReportDigest: null,
  };
}

function schemaFailureReport(
  schemaIssues: readonly ZodIssue[],
): UrlDispositionPreflightReport {
  const blockers = sortIssues(
    schemaIssues.map((issue) => ({
      code: "input_schema_invalid" as const,
      path: issuePath(issue),
      message: issue.message,
      dispositionIds: [],
    })),
  );

  const base: Omit<UrlDispositionPreflightReport, "reportDigest"> = {
    version: 1,
    asOf: null,
    status: "blocked",
    artifactDigest: null,
    scope: {
      scopeId: null,
      dispositionIds: [],
      sourceUrls: [],
      sourceCount: 0,
      destinationBundles: [],
    },
    blockers,
    dispositions: [],
    unaffectedUrls: {
      status: "blocked",
      expected: [],
      reported: [],
      missing: [],
      unexpected: [],
      conflicts: [],
    },
    releaseGate: {
      status: "blocked",
      releaseId: null,
      artifactDigest: null,
      contentApprover: null,
      productionApprover: null,
      verifiedReportDigest: null,
    },
    productionExecution: PRODUCTION_EXECUTION,
  };
  const reportDigest = computeUrlDispositionReportDigest(base);
  const finalBase = {
    ...base,
    releaseGate: { ...base.releaseGate, verifiedReportDigest: reportDigest },
  };
  return deepFreeze({
    ...finalBase,
    reportDigest: computeUrlDispositionReportDigest(finalBase),
  });
}

function buildUrlDispositionPreflightInternal(
  raw: unknown,
  enforceReportDigest: boolean,
): UrlDispositionPreflightReport {
  const parsed = urlDispositionPreflightInputSchema.safeParse(raw);
  if (!parsed.success) return schemaFailureReport(parsed.error.issues);

  const input = parsed.data;
  const { plan } = input;
  const artifactDigest = computeUrlDispositionArtifactDigest(plan);
  const issues: MutableIssue[] = [];

  validateTimestampsAtOrBeforeAsOf(input, "input", input.asOf, issues);
  validateGovernance(plan, issues);

  if (plan.records.length === 0) {
    addIssue(
      issues,
      "disposition_scope_empty",
      "plan.records",
      "URL disposition preflight requires at least one planned record.",
    );
  }

  const dispositionIds = sortCodePoints(plan.records.map(({ id }) => id));
  const sourceUrls = uniqueSorted(plan.records.map(({ source }) => source));
  const destinationBundles = uniqueSorted(
    plan.records
      .filter(({ destination }) => destination !== null)
      .map(({ bundleId }) => bundleId),
  );

  if (new Set(dispositionIds).size !== dispositionIds.length) {
    addIssue(
      issues,
      "duplicate_disposition_id",
      "plan.records",
      "Disposition IDs must be unique.",
      dispositionIds,
    );
  }
  if (sourceUrls.length !== plan.records.length) {
    addIssue(
      issues,
      "duplicate_source_url",
      "plan.records",
      "Each source URL may appear in only one disposition record.",
      dispositionIds,
    );
  }
  if (sourceUrls.length > 3) {
    addIssue(
      issues,
      "scope_source_limit_exceeded",
      "plan.records",
      `Scope contains ${sourceUrls.length} source URLs; split into tickets of at most three.`,
      dispositionIds,
    );
  }
  if (destinationBundles.length > 1) {
    addIssue(
      issues,
      "scope_multiple_destination_bundles",
      "plan.records",
      `Scope contains unrelated destination bundles: ${destinationBundles.join(", ")}.`,
      dispositionIds,
    );
  }

  const approvalsById = new Map<
    string,
    UrlDispositionPreflightInput["approvals"]
  >();
  const recordIds = new Set(dispositionIds);
  for (const approval of input.approvals) {
    const approvals = approvalsById.get(approval.dispositionId) ?? [];
    approvals.push(approval);
    approvalsById.set(approval.dispositionId, approvals);
    if (!recordIds.has(approval.dispositionId)) {
      addIssue(
        issues,
        "approval_unmatched",
        `approvals.${approval.dispositionId}`,
        `Approval references unknown disposition ${approval.dispositionId}.`,
      );
    }
  }

  for (const record of plan.records) {
    validateRecord(
      record,
      approvalsById,
      artifactDigest,
      plan.preparedAt,
      issues,
    );
  }
  validateRedirectTopology(plan.records, issues);
  const unaffectedUrls = validateUnaffectedReport(plan, issues);
  const releaseGate = validateReleaseContract(
    input.releaseContract,
    artifactDigest,
    plan.preparedAt,
    issues,
  );

  const provisionalBlockers = sortIssues(issues);
  const provisionalSplitRequired = provisionalBlockers.some(
    ({ code }) =>
      code === "scope_source_limit_exceeded" ||
      code === "scope_multiple_destination_bundles",
  );
  const provisionalStatus: UrlDispositionPreflightStatus =
    provisionalSplitRequired
      ? "split_required"
      : provisionalBlockers.length > 0
        ? "blocked"
        : "approved_for_preflight";
  const provisionalDispositions = [...plan.records]
    .sort(
      (left, right) =>
        compareCodePoints(left.id, right.id) ||
        compareCodePoints(left.source, right.source),
    )
    .map(
      (record): UrlDispositionSummary => ({
        id: record.id,
        bundleId: record.bundleId,
        action: record.action,
        source: record.source,
        destination: record.destination,
        finalDestination: finalDestination(record),
        status:
          provisionalStatus === "approved_for_preflight" &&
          !provisionalBlockers.some((issue) =>
            issue.dispositionIds.includes(record.id),
          )
            ? "validated"
            : "blocked",
        blockerCodes: uniqueSorted(
          provisionalBlockers
            .filter(({ dispositionIds: ids }) => ids.includes(record.id))
            .map(({ code }) => code),
        ) as UrlDispositionPreflightIssueCode[],
      }),
    );
  const provisionalBase: Omit<UrlDispositionPreflightReport, "reportDigest"> = {
    version: 1,
    asOf: input.asOf,
    status: provisionalStatus,
    artifactDigest,
    scope: {
      scopeId: plan.scopeId,
      dispositionIds,
      sourceUrls,
      sourceCount: sourceUrls.length,
      destinationBundles,
    },
    blockers: provisionalBlockers,
    dispositions: provisionalDispositions,
    unaffectedUrls,
    releaseGate,
    productionExecution: PRODUCTION_EXECUTION,
  };
  const expectedReportDigest =
    computeUrlDispositionReportDigest(provisionalBase);
  if (enforceReportDigest && input.releaseContract !== null) {
    const claims = [
      ["releaseContract.reportDigest", input.releaseContract.reportDigest],
      [
        "releaseContract.contentApproval.reportDigest",
        input.releaseContract.contentApproval.reportDigest,
      ],
      [
        "releaseContract.productionApproval.reportDigest",
        input.releaseContract.productionApproval.reportDigest,
      ],
    ] as const;
    for (const [path, claimed] of claims) {
      if (claimed !== expectedReportDigest) {
        addIssue(
          issues,
          "release_report_digest_mismatch",
          path,
          `Release report digest must equal canonical preflight report digest ${expectedReportDigest}.`,
        );
      }
    }
  }

  const blockers = sortIssues(issues);
  const splitRequired = blockers.some(
    ({ code }) =>
      code === "scope_source_limit_exceeded" ||
      code === "scope_multiple_destination_bundles",
  );
  const status: UrlDispositionPreflightStatus = splitRequired
    ? "split_required"
    : blockers.length > 0
      ? "blocked"
      : "approved_for_preflight";

  const dispositions = [...plan.records]
    .sort(
      (left, right) =>
        compareCodePoints(left.id, right.id) ||
        compareCodePoints(left.source, right.source),
    )
    .map((record): UrlDispositionSummary => {
      const blockerCodes = uniqueSorted(
        blockers
          .filter(({ dispositionIds: ids }) => ids.includes(record.id))
          .map(({ code }) => code),
      ) as UrlDispositionPreflightIssueCode[];
      return {
        id: record.id,
        bundleId: record.bundleId,
        action: record.action,
        source: record.source,
        destination: record.destination,
        finalDestination: finalDestination(record),
        status:
          status === "approved_for_preflight" && blockerCodes.length === 0
            ? "validated"
            : "blocked",
        blockerCodes,
      };
    });

  const base: Omit<UrlDispositionPreflightReport, "reportDigest"> = {
    version: 1,
    asOf: input.asOf,
    status,
    artifactDigest,
    scope: {
      scopeId: plan.scopeId,
      dispositionIds,
      sourceUrls,
      sourceCount: sourceUrls.length,
      destinationBundles,
    },
    blockers,
    dispositions,
    unaffectedUrls,
    releaseGate: {
      ...releaseGate,
      status: blockers.some(
        ({ code }) => code === "release_report_digest_mismatch",
      )
        ? "blocked"
        : releaseGate.status,
    },
    productionExecution: PRODUCTION_EXECUTION,
  };
  const reportDigest = computeUrlDispositionReportDigest(base);
  const finalBase = {
    ...base,
    releaseGate: { ...base.releaseGate, verifiedReportDigest: reportDigest },
  };
  return deepFreeze({
    ...finalBase,
    reportDigest: computeUrlDispositionReportDigest(finalBase),
  });
}

export function computeExpectedUrlDispositionPreflightReportDigest(
  raw: unknown,
): Sha256Digest {
  return buildUrlDispositionPreflightInternal(raw, false).reportDigest;
}

export function buildUrlDispositionPreflight(
  raw: unknown,
): UrlDispositionPreflightReport {
  return buildUrlDispositionPreflightInternal(raw, true);
}
