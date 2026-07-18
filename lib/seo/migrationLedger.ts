import { createHash } from "node:crypto";

import { MIGRATION_ACTIONS, type MigrationAction } from "./articleSchema";
import {
  CANONICAL_CLUSTER_IDS,
  CONTENT_ROLES,
  FUNNEL_STAGES,
  TARGET_MARKETS,
  type ClusterId,
  type ClusterRegistry,
  type TargetMarket,
} from "./clusterSchema";

export const APPROVAL_REQUIRED_CODE = "approval-required" as const;
export const MIGRATION_LEDGER_ACTIONS = MIGRATION_ACTIONS;

export const MIGRATION_SEARCH_INTENTS = [
  "bulk-procurement",
  "category-sourcing",
  "certification-verification",
  "company-registry-check",
  "factory-audit-checklist",
  "factory-tour-planning",
  "factory-visit-agent",
  "factory-visit-checklist",
  "geopolitical-supply-risk",
  "importing-to-australia",
  "market-comparison",
  "marketplace-supplier-verification",
  "quality-inspection",
  "sourcing-agent-selection",
  "sourcing-cost-compliance",
  "sourcing-model-comparison",
  "sourcing-risk-management",
  "supplier-negotiation",
  "supplier-payment",
  "supplier-scam-prevention",
  "supplier-type-comparison",
  "supplier-verification",
] as const;

export type MigrationSearchIntent = (typeof MIGRATION_SEARCH_INTENTS)[number];
export type MigrationDataStatus =
  | "available"
  | "static-snapshot"
  | "unavailable";
export type MigrationApprovalStatus = "approved" | "pending";
export type MigrationReviewStatus = "approved" | "pending";
export type MigrationLedgerStatus = "approval-required" | "invalid" | "valid";
export type MigrationLedgerIssueSeverity = "advisory" | "error";

export const OPPORTUNITY_DIMENSION_IDS = [
  "service-lead-relevance",
  "australian-action-intent",
  "evidence-readiness",
  "gsc-performance",
  "serp-gap",
  "geo-answerability",
] as const;

export type OpportunityDimensionId = (typeof OPPORTUNITY_DIMENSION_IDS)[number];

export const RISK_DIMENSION_IDS = [
  "cannibalisation-risk",
  "evidence-risk",
  "migration-effort",
] as const;

export type RiskDimensionId = (typeof RISK_DIMENSION_IDS)[number];

export const LIVE_OPPORTUNITY_INPUT_IDS = [
  "gscClicks",
  "gscImpressions",
  "gscAveragePosition",
  "ga4OrganicSessions",
  "qualifiedLeads",
  "migrationEffort",
] as const;

export type LiveOpportunityInputId =
  (typeof LIVE_OPPORTUNITY_INPUT_IDS)[number];

export interface SeoBaselineIdentity {
  readonly contentId: string;
  readonly slug: string;
  readonly route: string;
}

export interface TraceableNumericInput {
  readonly value: number | null;
  readonly dataStatus: MigrationDataStatus;
  readonly source: string | null;
  readonly asOf: string | null;
}

export interface OpportunityDimension {
  readonly id: OpportunityDimensionId;
  readonly weight: number;
  readonly description: string;
}

export interface RiskDimension {
  readonly id: RiskDimensionId;
  readonly description: string;
}

export interface MigrationOpportunityRecord {
  readonly totalScore: number | null;
  readonly dataStatus: MigrationDataStatus;
  readonly factors: Readonly<
    Record<OpportunityDimensionId, TraceableNumericInput>
  >;
  readonly liveInputs: Readonly<
    Record<LiveOpportunityInputId, TraceableNumericInput>
  >;
}

export interface MigrationRiskRecord {
  readonly totalScore: number | null;
  readonly dataStatus: MigrationDataStatus;
  readonly factors: Readonly<Record<RiskDimensionId, TraceableNumericInput>>;
}

export interface MigrationLedgerEntry {
  readonly contentId: string;
  readonly slug: string;
  readonly route: string;
  readonly classification: {
    readonly cluster: ClusterId;
    readonly role: (typeof CONTENT_ROLES)[number];
    readonly searchIntent: MigrationSearchIntent;
    readonly funnelStage: (typeof FUNNEL_STAGES)[number];
    readonly targetMarket: TargetMarket;
  };
  readonly requiredLinks: readonly string[];
  readonly decision: {
    readonly action: MigrationAction;
    readonly rationale: string;
    readonly reviewStatus: MigrationReviewStatus;
    readonly reviewer: string | null;
    readonly reviewedOn: string | null;
    readonly lowTrafficAloneSufficient: false;
  };
  readonly opportunity: MigrationOpportunityRecord;
  readonly risk: MigrationRiskRecord;
}

export interface ClusterMigrationPlan {
  readonly cluster: ClusterId;
  readonly commercialRoot: string;
  readonly editorialPillar: {
    readonly status: "existing-baseline" | "planned-new";
    readonly route: string;
    readonly contentId: string | null;
    readonly approvalStatus: MigrationApprovalStatus;
    readonly integrationTicket: string | null;
  };
  readonly baselineCount: number;
  readonly baselineRoutes: readonly string[];
  readonly memberRoutes: readonly string[];
}

export interface CannibalisationReview {
  readonly id: string;
  readonly routes: readonly string[];
  readonly overlap: string;
  readonly recommendation: string;
  readonly analysisStatus: "analysed";
  readonly approvalStatus: MigrationApprovalStatus;
  readonly reviewer: string | null;
  readonly reviewedOn: string | null;
}

export interface MigrationIntegrationBlocker {
  readonly id: string;
  readonly ticket: string;
  readonly status: "open";
  readonly reason: string;
}

export interface MigrationLedger {
  readonly ledgerVersion: 1;
  readonly baseline: {
    readonly id: string;
    readonly asOf: string;
    readonly expectedCount: 23;
  };
  readonly opportunityModel: {
    readonly scoreScale: 100;
    readonly dimensions: readonly OpportunityDimension[];
  };
  readonly riskModel: {
    readonly dimensions: readonly RiskDimension[];
  };
  readonly approval: {
    readonly approvalStatus: MigrationApprovalStatus;
    readonly reviewer: string | null;
    readonly approvalDate: string | null;
  };
  readonly protection: {
    readonly algorithm: "sha256";
    readonly expectedDigest: string | null;
  };
  readonly clusterPlans: readonly ClusterMigrationPlan[];
  readonly entries: readonly MigrationLedgerEntry[];
  readonly cannibalisationReviews: readonly CannibalisationReview[];
  readonly integrationBlockers: readonly MigrationIntegrationBlocker[];
}

export interface MigrationLedgerIssue {
  readonly severity: MigrationLedgerIssueSeverity;
  readonly code: string;
  readonly path: string;
  readonly message: string;
}

export interface MigrationLedgerReport {
  readonly status: MigrationLedgerStatus;
  readonly locked: boolean;
  readonly digest: string;
  readonly issues: readonly MigrationLedgerIssue[];
}

export interface MigrationLedgerValidationContext {
  readonly baseline: readonly SeoBaselineIdentity[];
  readonly clusterRegistry: ClusterRegistry;
}

const SEARCH_INTENTS_BY_CLUSTER: Readonly<
  Record<ClusterId, readonly MigrationSearchIntent[]>
> = {
  "supplier-verification": [
    "certification-verification",
    "company-registry-check",
    "marketplace-supplier-verification",
    "supplier-scam-prevention",
    "supplier-type-comparison",
    "supplier-verification",
  ],
  "factory-audit": ["factory-audit-checklist"],
  "quality-inspection": ["quality-inspection"],
  "factory-visits": [
    "factory-tour-planning",
    "factory-visit-agent",
    "factory-visit-checklist",
  ],
  "china-sourcing": [
    "bulk-procurement",
    "category-sourcing",
    "geopolitical-supply-risk",
    "importing-to-australia",
    "market-comparison",
    "sourcing-agent-selection",
    "sourcing-cost-compliance",
    "sourcing-model-comparison",
    "sourcing-risk-management",
    "supplier-negotiation",
    "supplier-payment",
  ],
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MACHINE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const DESTRUCTIVE_ACTIONS = new Set<MigrationAction>([
  "merge",
  "redirect",
  "retire",
]);

export function compareCodePoints(left: string, right: string): number {
  const leftPoints = Array.from(left);
  const rightPoints = Array.from(right);
  const sharedLength = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < sharedLength; index += 1) {
    const leftPoint = leftPoints[index].codePointAt(0);
    const rightPoint = rightPoints[index].codePointAt(0);

    if (leftPoint === undefined || rightPoint === undefined) {
      throw new TypeError(
        "Code-point comparison received an invalid character.",
      );
    }
    if (leftPoint < rightPoint) return -1;
    if (leftPoint > rightPoint) return 1;
  }

  if (leftPoints.length < rightPoints.length) return -1;
  if (leftPoints.length > rightPoints.length) return 1;
  return 0;
}

export function sortCodePoints<T extends string>(values: readonly T[]): T[] {
  return [...values].sort(compareCodePoints);
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}

export function defineMigrationLedger<T extends MigrationLedger>(ledger: T): T {
  return deepFreeze(ledger);
}

function stableSerialize(value: unknown): string {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(
        "Migration ledger digest rejects non-finite numbers.",
      );
    }
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = sortCodePoints(Object.keys(record));
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
      .join(",")}}`;
  }

  throw new TypeError(
    `Migration ledger digest cannot serialize ${typeof value}.`,
  );
}

export function computeMigrationLedgerDigest(ledger: MigrationLedger): string {
  const digestPayload = {
    ...ledger,
    protection: {
      ...ledger.protection,
      expectedDigest: null,
    },
  };

  return createHash("sha256")
    .update(stableSerialize(digestPayload), "utf8")
    .digest("hex");
}

function identityKey(identity: SeoBaselineIdentity): string {
  return `${identity.contentId}\u0000${identity.slug}\u0000${identity.route}`;
}

function equalStringArrays(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function exactKeySet(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  return equalStringArrays(
    sortCodePoints(Object.keys(value)),
    sortCodePoints(expectedKeys),
  );
}

function hasValue<T>(values: readonly T[], value: unknown): value is T {
  return values.includes(value as T);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidIsoCalendarDate(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const monthLengths = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
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
  return day <= monthLengths[month - 1];
}

function addIssue(
  issues: MigrationLedgerIssue[],
  severity: MigrationLedgerIssueSeverity,
  code: string,
  path: string,
  message: string,
): void {
  issues.push({ severity, code, path, message });
}

function validateTraceableInput(
  input: TraceableNumericInput,
  path: string,
  issues: MigrationLedgerIssue[],
  maximum?: number,
): void {
  if (
    input.dataStatus !== "available" &&
    input.dataStatus !== "static-snapshot" &&
    input.dataStatus !== "unavailable"
  ) {
    addIssue(
      issues,
      "error",
      "invalid-data-status",
      `${path}.dataStatus`,
      "Data status must be available, static-snapshot, or unavailable.",
    );
    return;
  }

  if (input.dataStatus === "unavailable") {
    if (input.value !== null) {
      addIssue(
        issues,
        "error",
        "unavailable-input-must-be-null",
        `${path}.value`,
        "Unavailable measurements must use a null value.",
      );
    }
    if (input.source !== null || input.asOf !== null) {
      addIssue(
        issues,
        "error",
        "unavailable-input-must-not-claim-provenance",
        path,
        "Unavailable measurements must not claim a source or as-of date.",
      );
    }
    return;
  }

  if (
    typeof input.value !== "number" ||
    !Number.isFinite(input.value) ||
    input.value < 0 ||
    (maximum !== undefined && input.value > maximum)
  ) {
    addIssue(
      issues,
      "error",
      "available-input-requires-number",
      `${path}.value`,
      maximum === undefined
        ? "Available measurements require a finite non-negative number."
        : `Available scores require a finite number from 0 to ${maximum}.`,
    );
  }
  if (!isNonEmptyString(input.source)) {
    addIssue(
      issues,
      "error",
      "available-input-requires-provenance",
      path,
      "Available or static measurements require a non-empty source.",
    );
  }
  if (!isValidIsoCalendarDate(input.asOf)) {
    addIssue(
      issues,
      "error",
      "available-input-requires-valid-date",
      `${path}.asOf`,
      "Available or static measurements require a valid YYYY-MM-DD calendar date.",
    );
  }
}

function validateReviewMetadata(
  approvalStatus: MigrationApprovalStatus,
  reviewer: string | null,
  reviewedOn: string | null,
  path: string,
  issues: MigrationLedgerIssue[],
): void {
  if (approvalStatus === "pending") {
    if (reviewer !== null || reviewedOn !== null) {
      addIssue(
        issues,
        "error",
        "pending-review-must-not-claim-reviewer",
        path,
        "Pending review must keep reviewer and review date null.",
      );
    }
    return;
  }

  if (approvalStatus !== "approved") {
    addIssue(
      issues,
      "error",
      "invalid-approval-status",
      `${path}.approvalStatus`,
      "Approval status must be pending or approved.",
    );
    return;
  }

  if (!isNonEmptyString(reviewer)) {
    addIssue(
      issues,
      "error",
      "approved-review-requires-reviewer-and-date",
      path,
      "Approved review requires a non-empty reviewer.",
    );
  }
  if (!isValidIsoCalendarDate(reviewedOn)) {
    addIssue(
      issues,
      "error",
      "approved-review-requires-valid-date",
      `${path}.reviewedOn`,
      "Approved review requires a valid YYYY-MM-DD calendar date.",
    );
  }
}

export function validateMigrationLedger(
  ledger: MigrationLedger,
  context: MigrationLedgerValidationContext,
): MigrationLedgerReport {
  const issues: MigrationLedgerIssue[] = [];
  const digest = computeMigrationLedgerDigest(ledger);
  const expectedBaseline = new Map(
    context.baseline.map((identity) => [identityKey(identity), identity]),
  );
  const actualIdentities = ledger.entries.map(({ contentId, slug, route }) => ({
    contentId,
    slug,
    route,
  }));
  const actualIdentityKeys = actualIdentities.map(identityKey);
  const actualIdentitySet = new Set(actualIdentityKeys);

  if (ledger.ledgerVersion !== 1) {
    addIssue(
      issues,
      "error",
      "unsupported-ledger-version",
      "ledgerVersion",
      "Migration ledger version must be 1.",
    );
  }
  if (
    !isNonEmptyString(ledger.baseline.id) ||
    !MACHINE_ID_PATTERN.test(ledger.baseline.id)
  ) {
    addIssue(
      issues,
      "error",
      "invalid-baseline-id",
      "baseline.id",
      "Baseline ID must be a non-empty machine-readable slug.",
    );
  }
  if (!isValidIsoCalendarDate(ledger.baseline.asOf)) {
    addIssue(
      issues,
      "error",
      "invalid-baseline-date",
      "baseline.asOf",
      "Baseline as-of must be a valid YYYY-MM-DD calendar date.",
    );
  }
  if (ledger.protection.algorithm !== "sha256") {
    addIssue(
      issues,
      "error",
      "invalid-protection-algorithm",
      "protection.algorithm",
      "Migration ledger protection algorithm must be sha256.",
    );
  }

  if (ledger.baseline.expectedCount !== 23 || ledger.entries.length !== 23) {
    addIssue(
      issues,
      "error",
      "baseline-count-mismatch",
      "entries",
      `The frozen baseline must contain exactly 23 entries; received ${ledger.entries.length}.`,
    );
  }

  for (const field of ["contentId", "slug", "route"] as const) {
    const seen = new Set<string>();
    ledger.entries.forEach((entry, index) => {
      if (seen.has(entry[field])) {
        addIssue(
          issues,
          "error",
          `duplicate-${field === "contentId" ? "content-id" : field}`,
          `entries[${index}].${field}`,
          `Duplicate ${field} "${entry[field]}" is not allowed.`,
        );
      }
      seen.add(entry[field]);
    });
  }

  for (const [key, identity] of expectedBaseline) {
    if (!actualIdentitySet.has(key)) {
      addIssue(
        issues,
        "error",
        "baseline-identity-missing",
        "entries",
        `Missing frozen identity ${identity.contentId} (${identity.route}).`,
      );
    }
  }

  for (const identity of actualIdentities) {
    if (!expectedBaseline.has(identityKey(identity))) {
      addIssue(
        issues,
        "error",
        "baseline-identity-unexpected",
        `entries.${identity.contentId}`,
        `Unexpected or changed identity ${identity.contentId} (${identity.route}).`,
      );
    }
  }

  const entrySlugs = ledger.entries.map(({ slug }) => slug);
  if (!equalStringArrays(entrySlugs, sortCodePoints(entrySlugs))) {
    addIssue(
      issues,
      "error",
      "entries-not-code-point-sorted",
      "entries",
      "Ledger entries must be sorted by slug using code-point order.",
    );
  }

  const registryById = new Map(
    context.clusterRegistry.clusters.map((cluster) => [cluster.id, cluster]),
  );
  const planByCluster = new Map(
    ledger.clusterPlans.map((plan) => [plan.cluster, plan]),
  );

  if (
    !equalStringArrays(
      ledger.clusterPlans.map(({ cluster }) => cluster),
      [...CANONICAL_CLUSTER_IDS],
    )
  ) {
    addIssue(
      issues,
      "error",
      "cluster-plans-not-canonical",
      "clusterPlans",
      "Cluster plans must appear once in canonical registry order.",
    );
  }

  ledger.entries.forEach((entry, index) => {
    const path = `entries[${index}]`;
    if (entry.contentId !== `article.${entry.slug}`) {
      addIssue(
        issues,
        "error",
        "identity-content-id-mismatch",
        `${path}.contentId`,
        "Content ID must equal article.<slug>.",
      );
    }
    if (entry.route !== `/article/${entry.slug}`) {
      addIssue(
        issues,
        "error",
        "identity-route-mismatch",
        `${path}.route`,
        "Existing article routes must remain /article/<slug>.",
      );
    }

    const cluster = registryById.get(entry.classification.cluster);
    if (!cluster) {
      addIssue(
        issues,
        "error",
        "invalid-cluster",
        `${path}.classification.cluster`,
        `Unknown cluster "${String(entry.classification.cluster)}".`,
      );
    }

    if (!hasValue(CONTENT_ROLES, entry.classification.role)) {
      addIssue(
        issues,
        "error",
        "invalid-role",
        `${path}.classification.role`,
        `Unknown content role "${String(entry.classification.role)}".`,
      );
    } else if (
      cluster &&
      !cluster.allowedRoles.includes(entry.classification.role)
    ) {
      addIssue(
        issues,
        "error",
        "role-not-allowed-for-cluster",
        `${path}.classification.role`,
        `Role ${entry.classification.role} is not allowed for ${cluster.id}.`,
      );
    }

    if (
      !hasValue(MIGRATION_SEARCH_INTENTS, entry.classification.searchIntent) ||
      !MACHINE_ID_PATTERN.test(entry.classification.searchIntent)
    ) {
      addIssue(
        issues,
        "error",
        "invalid-search-intent",
        `${path}.classification.searchIntent`,
        `Unknown migration search intent "${String(entry.classification.searchIntent)}".`,
      );
    } else if (
      cluster &&
      !SEARCH_INTENTS_BY_CLUSTER[cluster.id].includes(
        entry.classification.searchIntent,
      )
    ) {
      addIssue(
        issues,
        "error",
        "search-intent-cluster-mismatch",
        `${path}.classification.searchIntent`,
        `Search intent ${entry.classification.searchIntent} does not belong to ${cluster.id}.`,
      );
    }

    if (!hasValue(FUNNEL_STAGES, entry.classification.funnelStage)) {
      addIssue(
        issues,
        "error",
        "invalid-funnel-stage",
        `${path}.classification.funnelStage`,
        `Unknown funnel stage "${String(entry.classification.funnelStage)}".`,
      );
    }
    if (!hasValue(TARGET_MARKETS, entry.classification.targetMarket)) {
      addIssue(
        issues,
        "error",
        "invalid-target-market",
        `${path}.classification.targetMarket`,
        `Unknown target market "${String(entry.classification.targetMarket)}".`,
      );
    }
    if (!hasValue(MIGRATION_ACTIONS, entry.decision.action)) {
      addIssue(
        issues,
        "error",
        "invalid-migration-action",
        `${path}.decision.action`,
        `Unknown migration action "${String(entry.decision.action)}".`,
      );
    }
    if (
      !isNonEmptyString(entry.decision.rationale) ||
      entry.decision.rationale.length < 20
    ) {
      addIssue(
        issues,
        "error",
        "decision-rationale-required",
        `${path}.decision.rationale`,
        "Every migration decision requires an auditable rationale.",
      );
    }
    if (entry.decision.lowTrafficAloneSufficient !== false) {
      addIssue(
        issues,
        "error",
        "low-traffic-not-sufficient",
        `${path}.decision.lowTrafficAloneSufficient`,
        "Low traffic alone cannot justify merge, redirect, or retirement.",
      );
    }
    if (
      DESTRUCTIVE_ACTIONS.has(entry.decision.action) &&
      (ledger.approval.approvalStatus !== "approved" ||
        entry.decision.reviewStatus !== "approved")
    ) {
      addIssue(
        issues,
        "error",
        "destructive-action-requires-approval",
        `${path}.decision.action`,
        "Merge, redirect, and retire actions require explicit human approval.",
      );
    }
    validateReviewMetadata(
      entry.decision.reviewStatus,
      entry.decision.reviewer,
      entry.decision.reviewedOn,
      `${path}.decision`,
      issues,
    );

    if (
      !equalStringArrays(
        entry.requiredLinks,
        sortCodePoints(entry.requiredLinks),
      )
    ) {
      addIssue(
        issues,
        "error",
        "required-links-not-code-point-sorted",
        `${path}.requiredLinks`,
        "Required links must use deterministic code-point order.",
      );
    }

    const opportunityFactorKeys = OPPORTUNITY_DIMENSION_IDS;
    if (
      !exactKeySet(
        entry.opportunity.factors as Record<string, unknown>,
        opportunityFactorKeys,
      )
    ) {
      addIssue(
        issues,
        "error",
        "opportunity-factor-set-mismatch",
        `${path}.opportunity.factors`,
        "Opportunity factors must match the governed 100-point model.",
      );
    }
    for (const dimension of ledger.opportunityModel.dimensions) {
      const factor = entry.opportunity.factors[dimension.id];
      if (factor) {
        validateTraceableInput(
          factor,
          `${path}.opportunity.factors.${dimension.id}`,
          issues,
          dimension.weight,
        );
      }
    }

    if (
      !exactKeySet(
        entry.opportunity.liveInputs as Record<string, unknown>,
        LIVE_OPPORTUNITY_INPUT_IDS,
      )
    ) {
      addIssue(
        issues,
        "error",
        "live-input-set-mismatch",
        `${path}.opportunity.liveInputs`,
        "Live inputs must expose GSC, GA4, lead, and effort measurements.",
      );
    }
    for (const inputId of LIVE_OPPORTUNITY_INPUT_IDS) {
      const input = entry.opportunity.liveInputs[inputId];
      if (input) {
        validateTraceableInput(
          input,
          `${path}.opportunity.liveInputs.${inputId}`,
          issues,
        );
      }
    }

    if (
      entry.opportunity.dataStatus === "unavailable" &&
      entry.opportunity.totalScore !== null
    ) {
      addIssue(
        issues,
        "error",
        "unavailable-score-must-be-null",
        `${path}.opportunity.totalScore`,
        "Unavailable opportunity scores must remain null.",
      );
    }

    if (
      !exactKeySet(
        entry.risk.factors as Record<string, unknown>,
        RISK_DIMENSION_IDS,
      )
    ) {
      addIssue(
        issues,
        "error",
        "risk-factor-set-mismatch",
        `${path}.risk.factors`,
        "Risk factors must expose cannibalisation, evidence, and effort inputs.",
      );
    }
    for (const factorId of RISK_DIMENSION_IDS) {
      const factor = entry.risk.factors[factorId];
      if (factor) {
        validateTraceableInput(
          factor,
          `${path}.risk.factors.${factorId}`,
          issues,
        );
      }
    }
    if (
      entry.risk.dataStatus === "unavailable" &&
      entry.risk.totalScore !== null
    ) {
      addIssue(
        issues,
        "error",
        "unavailable-score-must-be-null",
        `${path}.risk.totalScore`,
        "Unavailable risk scores must remain null.",
      );
    }
  });

  const opportunityDimensionIds = ledger.opportunityModel.dimensions.map(
    ({ id }) => id,
  );
  const opportunityWeight = ledger.opportunityModel.dimensions.reduce(
    (total, { weight }) => total + weight,
    0,
  );
  if (
    !equalStringArrays(opportunityDimensionIds, [
      ...OPPORTUNITY_DIMENSION_IDS,
    ]) ||
    opportunityWeight !== 100 ||
    ledger.opportunityModel.scoreScale !== 100
  ) {
    addIssue(
      issues,
      "error",
      "opportunity-model-mismatch",
      "opportunityModel",
      "Opportunity model must preserve the approved six dimensions and 100-point scale.",
    );
  }

  if (
    !equalStringArrays(
      ledger.riskModel.dimensions.map(({ id }) => id),
      [...RISK_DIMENSION_IDS],
    )
  ) {
    addIssue(
      issues,
      "error",
      "risk-model-mismatch",
      "riskModel",
      "Risk model must expose cannibalisation, evidence, and effort dimensions.",
    );
  }

  for (const clusterId of CANONICAL_CLUSTER_IDS) {
    const plan = planByCluster.get(clusterId);
    const cluster = registryById.get(clusterId);
    if (!plan || !cluster) {
      addIssue(
        issues,
        "error",
        "cluster-plan-missing",
        "clusterPlans",
        `Missing migration plan for ${clusterId}.`,
      );
      continue;
    }

    if (plan.commercialRoot !== cluster.commercialRoot) {
      addIssue(
        issues,
        "error",
        "commercial-root-mismatch",
        `clusterPlans.${clusterId}.commercialRoot`,
        `Commercial root must match the canonical registry (${cluster.commercialRoot}).`,
      );
    }

    const clusterEntries = ledger.entries.filter(
      (entry) => entry.classification.cluster === clusterId,
    );
    const pillars = clusterEntries.filter(
      (entry) => entry.classification.role === "pillar",
    );
    const expectedBaselineRoutes = sortCodePoints(
      clusterEntries.map(({ route }) => route),
    );
    const expectedMemberRoutes = sortCodePoints(
      clusterEntries
        .filter(({ classification }) => classification.role !== "pillar")
        .map(({ route }) => route),
    );

    if (
      plan.baselineCount !== clusterEntries.length ||
      !equalStringArrays(plan.baselineRoutes, expectedBaselineRoutes)
    ) {
      addIssue(
        issues,
        "error",
        "cluster-baseline-incomplete",
        `clusterPlans.${clusterId}.baselineRoutes`,
        "Cluster baseline routes must exactly match ledger membership.",
      );
    }
    if (!equalStringArrays(plan.memberRoutes, expectedMemberRoutes)) {
      addIssue(
        issues,
        "error",
        "cluster-membership-incomplete",
        `clusterPlans.${clusterId}.memberRoutes`,
        "Cluster member routes must exactly match all non-pillar ledger entries.",
      );
    }

    if (clusterId === "quality-inspection") {
      if (
        clusterEntries.length !== 0 ||
        pillars.length !== 0 ||
        plan.editorialPillar.status !== "planned-new" ||
        plan.editorialPillar.route !==
          "/article/china-quality-inspection-guide" ||
        plan.editorialPillar.contentId !== null ||
        plan.editorialPillar.integrationTicket !== "09"
      ) {
        addIssue(
          issues,
          "error",
          "quality-pillar-planned-exception-invalid",
          `clusterPlans.${clusterId}.editorialPillar`,
          "Quality inspection must remain a zero-baseline planned Ticket 09 exception.",
        );
      }
    } else if (
      pillars.length !== 1 ||
      plan.editorialPillar.status !== "existing-baseline" ||
      plan.editorialPillar.route !== pillars[0]?.route ||
      plan.editorialPillar.contentId !== pillars[0]?.contentId ||
      plan.editorialPillar.integrationTicket !== null
    ) {
      addIssue(
        issues,
        "error",
        "cluster-pillar-count",
        `clusterPlans.${clusterId}.editorialPillar`,
        "Every populated cluster must name exactly one existing baseline pillar.",
      );
    }

    for (const entry of clusterEntries) {
      const expectedLinks =
        entry.classification.role === "pillar"
          ? [plan.commercialRoot]
          : sortCodePoints([plan.commercialRoot, plan.editorialPillar.route]);
      if (!equalStringArrays(entry.requiredLinks, expectedLinks)) {
        addIssue(
          issues,
          "error",
          "member-required-link-missing",
          `entries.${entry.contentId}.requiredLinks`,
          "Each member must link to both roots; a pillar must link to its commercial root.",
        );
      }
    }

    if (
      ledger.approval.approvalStatus === "approved" &&
      plan.editorialPillar.approvalStatus !== "approved"
    ) {
      addIssue(
        issues,
        "error",
        "approved-ledger-has-pending-pillar",
        `clusterPlans.${clusterId}.editorialPillar.approvalStatus`,
        "A locked ledger cannot retain a pending pillar decision.",
      );
    }
  }

  const cannibalisationIds = ledger.cannibalisationReviews.map(({ id }) => id);
  if (
    !equalStringArrays(cannibalisationIds, sortCodePoints(cannibalisationIds))
  ) {
    addIssue(
      issues,
      "error",
      "cannibalisation-reviews-not-code-point-sorted",
      "cannibalisationReviews",
      "Cannibalisation reviews must be sorted by ID using code-point order.",
    );
  }
  if (new Set(cannibalisationIds).size !== cannibalisationIds.length) {
    addIssue(
      issues,
      "error",
      "duplicate-cannibalisation-review",
      "cannibalisationReviews",
      "Cannibalisation review IDs must be unique.",
    );
  }

  const routeSet = new Set(ledger.entries.map(({ route }) => route));
  ledger.cannibalisationReviews.forEach((review, index) => {
    const path = `cannibalisationReviews[${index}]`;
    if (!MACHINE_ID_PATTERN.test(review.id)) {
      addIssue(
        issues,
        "error",
        "invalid-cannibalisation-review-id",
        `${path}.id`,
        "Cannibalisation review ID must be a machine-readable slug.",
      );
    }
    if (
      review.routes.length < 2 ||
      !equalStringArrays(review.routes, sortCodePoints(review.routes)) ||
      review.routes.some((route) => !routeSet.has(route))
    ) {
      addIssue(
        issues,
        "error",
        "invalid-cannibalisation-routes",
        `${path}.routes`,
        "Cannibalisation routes must be sorted and reference at least two baseline entries.",
      );
    }
    if (
      review.analysisStatus !== "analysed" ||
      !isNonEmptyString(review.overlap) ||
      !isNonEmptyString(review.recommendation)
    ) {
      addIssue(
        issues,
        "error",
        "cannibalisation-analysis-required",
        path,
        "Cannibalisation records require explicit analysis and recommendation.",
      );
    }
    validateReviewMetadata(
      review.approvalStatus,
      review.reviewer,
      review.reviewedOn,
      path,
      issues,
    );
    if (
      ledger.approval.approvalStatus === "approved" &&
      review.approvalStatus !== "approved"
    ) {
      addIssue(
        issues,
        "error",
        "approved-ledger-has-pending-cannibalisation-review",
        `${path}.approvalStatus`,
        "A locked ledger cannot retain a pending cannibalisation review.",
      );
    }
  });

  if (
    !ledger.integrationBlockers.some(
      (blocker) =>
        blocker.ticket === "09" &&
        blocker.status === "open" &&
        blocker.reason.includes("create"),
    )
  ) {
    addIssue(
      issues,
      "error",
      "ticket-09-create-blocker-missing",
      "integrationBlockers",
      "The future quality pillar create decision must remain an explicit Ticket 09 blocker.",
    );
  }

  if (ledger.approval.approvalStatus === "pending") {
    if (
      ledger.approval.reviewer !== null ||
      ledger.approval.approvalDate !== null ||
      ledger.protection.expectedDigest !== null
    ) {
      addIssue(
        issues,
        "error",
        "pending-ledger-must-not-claim-approval",
        "approval",
        "Pending ledger must keep reviewer, approval date, and expected digest null.",
      );
    }
    addIssue(
      issues,
      "advisory",
      APPROVAL_REQUIRED_CODE,
      "approval",
      "Human reviewer and approval date are required before this ledger can lock.",
    );
  } else if (ledger.approval.approvalStatus === "approved") {
    if (!isNonEmptyString(ledger.approval.reviewer)) {
      addIssue(
        issues,
        "error",
        "approved-ledger-requires-reviewer-and-date",
        "approval",
        "Approved ledger requires a non-empty reviewer.",
      );
    }
    if (!isValidIsoCalendarDate(ledger.approval.approvalDate)) {
      addIssue(
        issues,
        "error",
        "approved-ledger-requires-valid-date",
        "approval.approvalDate",
        "Approved ledger requires a valid YYYY-MM-DD calendar date.",
      );
    }
    if (
      !SHA256_PATTERN.test(ledger.protection.expectedDigest ?? "") ||
      ledger.protection.expectedDigest !== digest
    ) {
      addIssue(
        issues,
        "error",
        "ledger-digest-mismatch",
        "protection.expectedDigest",
        "Approved ledger digest does not match its canonical payload.",
      );
    }
    ledger.entries.forEach((entry, index) => {
      if (entry.decision.reviewStatus !== "approved") {
        addIssue(
          issues,
          "error",
          "approved-ledger-has-pending-entry",
          `entries[${index}].decision.reviewStatus`,
          "A locked ledger cannot retain a pending entry decision.",
        );
      }
    });
  } else {
    addIssue(
      issues,
      "error",
      "invalid-approval-status",
      "approval.approvalStatus",
      "Approval status must be pending or approved.",
    );
  }

  const hasErrors = issues.some(({ severity }) => severity === "error");
  const locked =
    !hasErrors &&
    ledger.approval.approvalStatus === "approved" &&
    ledger.protection.expectedDigest === digest;
  const status: MigrationLedgerStatus = hasErrors
    ? "invalid"
    : locked
      ? "valid"
      : "approval-required";

  return deepFreeze({ status, locked, digest, issues });
}
