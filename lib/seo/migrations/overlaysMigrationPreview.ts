import { clusterRegistry } from "../../../content/seo/clusters";
import {
  EDITORIAL_STATUSES,
  MIGRATION_ACTIONS,
  type ContentRole,
  type FunnelStage,
  type MigrationAction,
  type TargetMarket,
} from "../articleSchema";
import {
  CANONICAL_CLUSTER_IDS,
  CONTENT_ROLES,
  FUNNEL_STAGES,
  TARGET_MARKETS,
  type ClusterId,
} from "../clusterSchema";
import {
  LIVE_OPPORTUNITY_INPUT_IDS,
  MIGRATION_SEARCH_INTENTS,
  OPPORTUNITY_DIMENSION_IDS,
  RISK_DIMENSION_IDS,
  compareCodePoints,
  computeMigrationLedgerDigest,
  sortCodePoints,
  type MigrationLedger,
  type MigrationLedgerEntry,
  type MigrationLedgerReport,
  type MigrationSearchIntent,
} from "../migrationLedger";
import {
  MIGRATION_PREVIEW_CONTRACT_ID,
  SEO_AS_OF_BOUNDARY,
  type ArticleMigrationPlan,
  type ClusterMigrationPreview,
  type MigrationArticleSnapshot,
  type MigrationPreviewDiagnostic,
  type MigrationPreviewGovernanceBinding,
  type MigrationPreviewScope,
  type PlannedGovernedFrontmatter,
} from "./clusterMigrationPreview";

export const CHINA_SOURCING_OVERLAYS_MIGRATION_TICKET = "12" as const;
export const CHINA_SOURCING_OVERLAYS_CLUSTER_ID =
  "china-sourcing" as const satisfies ClusterId;
export const CHINA_SOURCING_OVERLAYS_PREFLIGHT_DATE = "2026-07-18" as const;

export type ChinaSourcingOverlaysPreviewMode = "fixture" | "dry-run" | "actual";
export type ChinaSourcingOverlayScope = "supporting" | "industry-overlay";
export type ChinaSourcingOverlaysPreviewStatus =
  | "planned"
  | "blocked"
  | "ready";

export interface ChinaSourcingOverlaysMigrationScope extends MigrationPreviewScope {
  readonly supportingArticleCount?: number | null;
  readonly industryOverlayCount?: number | null;
}

export interface ChinaSourcingOverlaySpecialistLink {
  readonly clusterId: Exclude<ClusterId, "china-sourcing">;
  readonly route: string;
  readonly source: "ledger-required-link" | "cannibalisation-review";
  readonly reviewIds: readonly string[];
}

export interface ChinaSourcingOverlayEntryContract {
  readonly contentId: string;
  readonly slug: string;
  readonly route: string;
  readonly scope: ChinaSourcingOverlayScope;
  readonly contentRole: ContentRole;
  readonly searchIntent: MigrationSearchIntent;
  readonly funnelStage: FunnelStage;
  readonly targetMarket: TargetMarket;
  readonly commercialRoot: string;
  readonly editorialPillar: string;
  readonly editorialPillarContentId: string;
  readonly requiredLinks: readonly string[];
  readonly specialistLinks: readonly ChinaSourcingOverlaySpecialistLink[];
  readonly cannibalisationReviewIds: readonly string[];
  readonly migrationAction: MigrationAction;
}

export interface ChinaSourcingOverlaysParentJourney {
  readonly commercialRoot: string;
  readonly editorialPillar: string;
  readonly editorialPillarContentId: string;
}

export interface ChinaSourcingOverlaysScopeSplit {
  readonly supportingRoutes: readonly string[];
  readonly industryOverlayRoutes: readonly string[];
}

export interface ChinaSourcingOverlaysMigrationPreviewInput {
  readonly mode: ChinaSourcingOverlaysPreviewMode;
  readonly ledger: MigrationLedger;
  readonly ledgerReport: MigrationLedgerReport;
  readonly ticket11Preview: ClusterMigrationPreview;
  readonly articles: readonly MigrationArticleSnapshot[];
  readonly scope?: ChinaSourcingOverlaysMigrationScope | null;
  readonly governanceBinding?: MigrationPreviewGovernanceBinding | null;
}

export interface ChinaSourcingOverlaysMigrationPreview {
  readonly version: 1;
  readonly ticket: typeof CHINA_SOURCING_OVERLAYS_MIGRATION_TICKET;
  readonly clusterId: typeof CHINA_SOURCING_OVERLAYS_CLUSTER_ID;
  readonly mode: ChinaSourcingOverlaysPreviewMode;
  readonly ledgerDigest: string;
  readonly status: ChinaSourcingOverlaysPreviewStatus;
  readonly contractReady: boolean;
  readonly executable: false;
  readonly diagnostics: readonly MigrationPreviewDiagnostic[];
  readonly parentJourney: ChinaSourcingOverlaysParentJourney | null;
  readonly scopeSplit: ChinaSourcingOverlaysScopeSplit;
  readonly entries: readonly ChinaSourcingOverlayEntryContract[];
  readonly industryOverlays: readonly ChinaSourcingOverlayEntryContract[];
  readonly articlePlans: readonly ArticleMigrationPlan[];
  readonly mutationCommands: readonly [];
  readonly governanceBinding: MigrationPreviewGovernanceBinding | null;
}

type DiagnosticList = MigrationPreviewDiagnostic[];
type UnknownRecord = Record<string, unknown>;

interface DerivedSources {
  readonly parentJourney: ChinaSourcingOverlaysParentJourney | null;
  readonly plan: MigrationLedger["clusterPlans"][number] | null;
  readonly memberEntries: readonly MigrationLedgerEntry[];
  readonly ticket11PlansByRoute: ReadonlyMap<string, ArticleMigrationPlan>;
  readonly industryRoutes: ReadonlySet<string>;
}

interface SpecialistResolution {
  readonly links: readonly ChinaSourcingOverlaySpecialistLink[];
  readonly requiredReviewRoutes: readonly string[];
  readonly reviewIds: readonly string[];
}

const INPUT_KEYS = [
  "mode",
  "ledger",
  "ledgerReport",
  "ticket11Preview",
  "articles",
  "scope",
  "governanceBinding",
] as const;
const LEDGER_KEYS = [
  "ledgerVersion",
  "baseline",
  "opportunityModel",
  "riskModel",
  "approval",
  "protection",
  "clusterPlans",
  "entries",
  "cannibalisationReviews",
  "integrationBlockers",
] as const;
const LEDGER_ENTRY_KEYS = [
  "contentId",
  "slug",
  "route",
  "classification",
  "requiredLinks",
  "decision",
  "opportunity",
  "risk",
] as const;
const SNAPSHOT_KEYS = [
  "contentId",
  "slug",
  "route",
  "canonicalRoute",
  "currentLinks",
  "frontmatter",
  "evidenceReadiness",
] as const;
const SNAPSHOT_FRONTMATTER_KEYS = [
  "author",
  "primaryKeyword",
  "secondaryKeywords",
  "editorialStatus",
  "evidenceIds",
  "firstPartyContributionId",
  "reviewedBy",
  "reviewedDate",
  "reviewDueDate",
] as const;
const PLANNED_FRONTMATTER_KEYS = [
  "contentId",
  "cluster",
  "contentRole",
  "searchIntent",
  "funnelStage",
  "primaryKeyword",
  "secondaryKeywords",
  "targetMarket",
  "editorialStatus",
  "evidenceIds",
  "firstPartyContributionId",
  "commercialRoot",
  "editorialPillar",
  "requiredLinks",
  "reviewedBy",
  "reviewedDate",
  "reviewDueDate",
  "migrationAction",
] as const;
const DESTRUCTIVE_ACTIONS = new Set<MigrationAction>([
  "merge",
  "redirect",
  "retire",
]);
const SPECIALIST_CLUSTER_IDS = CANONICAL_CLUSTER_IDS.filter(
  (clusterId): clusterId is Exclude<ClusterId, "china-sourcing"> =>
    clusterId !== CHINA_SOURCING_OVERLAYS_CLUSTER_ID,
);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isNonEmptyStringArray(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => isNonEmptyString(item))
  );
}

function isFiniteNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= 0;
}

function isValidIsoCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function uniqueSorted(values: readonly string[]): string[] {
  return sortCodePoints([...new Set(values)]);
}

function sameStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  const sortedLeft = uniqueSorted(left);
  const sortedRight = uniqueSorted(right);
  return (
    sortedLeft.length === sortedRight.length &&
    sortedLeft.every((value, index) => value === sortedRight[index])
  );
}

function sameOrderedStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as UnknownRecord)) {
      deepFreeze(nested);
    }
  }
  return value;
}

function addDiagnostic(
  diagnostics: DiagnosticList,
  diagnostic: MigrationPreviewDiagnostic,
): void {
  diagnostics.push(diagnostic);
}

function diagnosticComparator(
  left: MigrationPreviewDiagnostic,
  right: MigrationPreviewDiagnostic,
): number {
  return (
    compareCodePoints(left.path, right.path) ||
    compareCodePoints(left.code, right.code) ||
    compareCodePoints(left.route ?? "", right.route ?? "") ||
    compareCodePoints(left.message, right.message)
  );
}

function addUnknownKeysDiagnostic(
  value: unknown,
  allowedKeys: readonly string[],
  diagnostics: DiagnosticList,
  options: {
    readonly code: string;
    readonly path: string;
    readonly route?: string | null;
  },
): void {
  if (!isRecord(value)) return;
  const unknownKeys = Object.keys(value)
    .filter((key) => !allowedKeys.includes(key))
    .sort(compareCodePoints);
  if (unknownKeys.length === 0) return;

  addDiagnostic(diagnostics, {
    severity: "error",
    code: options.code,
    path: options.path,
    route: options.route ?? null,
    message: `Unknown fields are not accepted: ${unknownKeys.join(", ")}.`,
  });
}

function validateObservedDate(
  value: unknown,
  diagnostics: DiagnosticList,
  options: {
    readonly path: string;
    readonly route?: string | null;
    readonly required: boolean;
    readonly mode: ChinaSourcingOverlaysPreviewMode;
  },
): boolean {
  if (value === null || value === undefined || value === "") {
    if (options.required) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "actual-date-missing",
        path: options.path,
        route: options.route ?? null,
        message: "A governed observed date is required.",
      });
    }
    return false;
  }
  if (!isValidIsoCalendarDate(value)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "actual-date-invalid",
      path: options.path,
      route: options.route ?? null,
      message: "Observed dates must be valid ISO calendar dates.",
    });
    return false;
  }
  if (
    options.mode !== "fixture" &&
    value > CHINA_SOURCING_OVERLAYS_PREFLIGHT_DATE
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "future-actual-date",
      path: options.path,
      route: options.route ?? null,
      message: `Actual observed dates cannot be later than ${CHINA_SOURCING_OVERLAYS_PREFLIGHT_DATE}.`,
    });
    return false;
  }
  return true;
}

function validateUnknownLedgerFields(
  ledger: unknown,
  diagnostics: DiagnosticList,
): void {
  addUnknownKeysDiagnostic(ledger, LEDGER_KEYS, diagnostics, {
    code: "unknown-ledger-field",
    path: "ledger",
  });
  if (!isRecord(ledger)) return;

  addUnknownKeysDiagnostic(
    ledger.baseline,
    ["id", "asOf", "expectedCount"],
    diagnostics,
    {
      code: "unknown-ledger-field",
      path: "ledger.baseline",
    },
  );
  addUnknownKeysDiagnostic(
    ledger.opportunityModel,
    ["scoreScale", "dimensions"],
    diagnostics,
    { code: "unknown-ledger-field", path: "ledger.opportunityModel" },
  );
  if (
    isRecord(ledger.opportunityModel) &&
    Array.isArray(ledger.opportunityModel.dimensions)
  ) {
    ledger.opportunityModel.dimensions.forEach((dimension, index) =>
      addUnknownKeysDiagnostic(
        dimension,
        ["id", "weight", "description"],
        diagnostics,
        {
          code: "unknown-ledger-field",
          path: `ledger.opportunityModel.dimensions[${index}]`,
        },
      ),
    );
  }
  addUnknownKeysDiagnostic(ledger.riskModel, ["dimensions"], diagnostics, {
    code: "unknown-ledger-field",
    path: "ledger.riskModel",
  });
  if (
    isRecord(ledger.riskModel) &&
    Array.isArray(ledger.riskModel.dimensions)
  ) {
    ledger.riskModel.dimensions.forEach((dimension, index) =>
      addUnknownKeysDiagnostic(dimension, ["id", "description"], diagnostics, {
        code: "unknown-ledger-field",
        path: `ledger.riskModel.dimensions[${index}]`,
      }),
    );
  }
  addUnknownKeysDiagnostic(
    ledger.approval,
    ["approvalStatus", "reviewer", "approvalDate"],
    diagnostics,
    { code: "unknown-ledger-field", path: "ledger.approval" },
  );
  addUnknownKeysDiagnostic(
    ledger.protection,
    ["algorithm", "expectedDigest"],
    diagnostics,
    { code: "unknown-ledger-field", path: "ledger.protection" },
  );

  if (Array.isArray(ledger.clusterPlans)) {
    ledger.clusterPlans.forEach((plan, index) => {
      addUnknownKeysDiagnostic(
        plan,
        [
          "cluster",
          "commercialRoot",
          "editorialPillar",
          "baselineCount",
          "baselineRoutes",
          "memberRoutes",
        ],
        diagnostics,
        {
          code: "unknown-ledger-field",
          path: `ledger.clusterPlans[${index}]`,
        },
      );
      if (isRecord(plan)) {
        addUnknownKeysDiagnostic(
          plan.editorialPillar,
          [
            "status",
            "route",
            "contentId",
            "approvalStatus",
            "integrationTicket",
          ],
          diagnostics,
          {
            code: "unknown-ledger-field",
            path: `ledger.clusterPlans[${index}].editorialPillar`,
          },
        );
      }
    });
  }

  if (Array.isArray(ledger.entries)) {
    ledger.entries.forEach((entry, index) => {
      const route =
        isRecord(entry) && isNonEmptyString(entry.route) ? entry.route : null;
      addUnknownKeysDiagnostic(entry, LEDGER_ENTRY_KEYS, diagnostics, {
        code: "unknown-ledger-field",
        path: `ledger.entries[${index}]`,
        route,
      });
      if (!isRecord(entry)) return;
      addUnknownKeysDiagnostic(
        entry.classification,
        ["cluster", "role", "searchIntent", "funnelStage", "targetMarket"],
        diagnostics,
        {
          code: "unknown-ledger-field",
          path: `ledger.entries[${index}].classification`,
          route,
        },
      );
      addUnknownKeysDiagnostic(
        entry.decision,
        [
          "action",
          "rationale",
          "reviewStatus",
          "reviewer",
          "reviewedOn",
          "lowTrafficAloneSufficient",
        ],
        diagnostics,
        {
          code: "unknown-ledger-field",
          path: `ledger.entries[${index}].decision`,
          route,
        },
      );
      validateUnknownOpportunityFields(
        entry.opportunity,
        diagnostics,
        `ledger.entries[${index}].opportunity`,
        route,
      );
      validateUnknownRiskFields(
        entry.risk,
        diagnostics,
        `ledger.entries[${index}].risk`,
        route,
      );
    });
  }

  if (Array.isArray(ledger.cannibalisationReviews)) {
    ledger.cannibalisationReviews.forEach((review, index) =>
      addUnknownKeysDiagnostic(
        review,
        [
          "id",
          "routes",
          "overlap",
          "recommendation",
          "analysisStatus",
          "approvalStatus",
          "reviewer",
          "reviewedOn",
        ],
        diagnostics,
        {
          code: "unknown-ledger-field",
          path: `ledger.cannibalisationReviews[${index}]`,
        },
      ),
    );
  }
  if (Array.isArray(ledger.integrationBlockers)) {
    ledger.integrationBlockers.forEach((blocker, index) =>
      addUnknownKeysDiagnostic(
        blocker,
        ["id", "ticket", "status", "reason"],
        diagnostics,
        {
          code: "unknown-ledger-field",
          path: `ledger.integrationBlockers[${index}]`,
        },
      ),
    );
  }
}

function validateUnknownOpportunityFields(
  value: unknown,
  diagnostics: DiagnosticList,
  path: string,
  route: string | null,
): void {
  addUnknownKeysDiagnostic(
    value,
    ["totalScore", "dataStatus", "factors", "liveInputs"],
    diagnostics,
    { code: "unknown-ledger-field", path, route },
  );
  if (!isRecord(value)) return;
  validateTraceableMap(
    value.factors,
    OPPORTUNITY_DIMENSION_IDS,
    diagnostics,
    `${path}.factors`,
    route,
  );
  validateTraceableMap(
    value.liveInputs,
    LIVE_OPPORTUNITY_INPUT_IDS,
    diagnostics,
    `${path}.liveInputs`,
    route,
  );
}

function validateUnknownRiskFields(
  value: unknown,
  diagnostics: DiagnosticList,
  path: string,
  route: string | null,
): void {
  addUnknownKeysDiagnostic(
    value,
    ["totalScore", "dataStatus", "factors"],
    diagnostics,
    { code: "unknown-ledger-field", path, route },
  );
  if (!isRecord(value)) return;
  validateTraceableMap(
    value.factors,
    RISK_DIMENSION_IDS,
    diagnostics,
    `${path}.factors`,
    route,
  );
}

function validateTraceableMap(
  value: unknown,
  expectedKeys: readonly string[],
  diagnostics: DiagnosticList,
  path: string,
  route: string | null,
): void {
  addUnknownKeysDiagnostic(value, expectedKeys, diagnostics, {
    code: "unknown-ledger-field",
    path,
    route,
  });
  if (!isRecord(value)) return;
  for (const [key, input] of Object.entries(value)) {
    addUnknownKeysDiagnostic(
      input,
      ["value", "dataStatus", "source", "asOf"],
      diagnostics,
      {
        code: "unknown-ledger-field",
        path: `${path}.${key}`,
        route,
      },
    );
  }
}

function safeComputeLedgerDigest(
  ledger: unknown,
  diagnostics: DiagnosticList,
): string {
  if (!isRecord(ledger)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-shape-invalid",
      path: "ledger",
      route: null,
      message: "The migration ledger must be a governed object.",
    });
    return "unavailable";
  }

  try {
    return computeMigrationLedgerDigest(ledger as unknown as MigrationLedger);
  } catch {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-digest-unavailable",
      path: "ledger",
      route: null,
      message: "The migration ledger could not be deterministically digested.",
    });
    return "unavailable";
  }
}

function validateReportShape(
  report: unknown,
  diagnostics: DiagnosticList,
): report is MigrationLedgerReport {
  addUnknownKeysDiagnostic(
    report,
    ["status", "locked", "digest", "issues"],
    diagnostics,
    { code: "unknown-preview-field", path: "ledgerReport" },
  );
  if (!isRecord(report)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-report-invalid",
      path: "ledgerReport",
      route: null,
      message: "A migration ledger report is required.",
    });
    return false;
  }
  if (Array.isArray(report.issues)) {
    report.issues.forEach((issue, index) =>
      addUnknownKeysDiagnostic(
        issue,
        ["severity", "code", "path", "message"],
        diagnostics,
        {
          code: "unknown-preview-field",
          path: `ledgerReport.issues[${index}]`,
        },
      ),
    );
  }
  return true;
}

function validateLedgerGates(
  ledger: MigrationLedger,
  report: MigrationLedgerReport,
  computedDigest: string,
  mode: ChinaSourcingOverlaysPreviewMode,
  diagnostics: DiagnosticList,
): void {
  if (report.digest !== computedDigest) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-report-digest-mismatch",
      path: "ledgerReport.digest",
      route: null,
      message: "The ledger report digest does not match the current ledger.",
    });
  }
  if (ledger.protection.expectedDigest !== computedDigest) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-protection-digest-mismatch",
      path: "ledger.protection.expectedDigest",
      route: null,
      message:
        "The ledger protection digest must bind the exact reviewed ledger payload.",
    });
  }
  if (!report.locked) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-not-locked",
      path: "ledgerReport.locked",
      route: null,
      message:
        "Ticket 12 remains blocked until the production ledger is locked.",
    });
  }
  if (report.status === "approval-required") {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-approval-required",
      path: "ledgerReport.status",
      route: null,
      message: "Ticket 12 cannot advance while ledger approval is required.",
    });
  } else if (report.status !== "valid") {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-invalid",
      path: "ledgerReport.status",
      route: null,
      message: "Ticket 12 requires a valid migration ledger report.",
    });
  }
  if (report.issues.some(({ severity }) => severity === "error")) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-report-has-errors",
      path: "ledgerReport.issues",
      route: null,
      message:
        "Ledger validation errors must be resolved before overlay preflight.",
    });
  }

  validateObservedDate(ledger.baseline.asOf, diagnostics, {
    path: "ledger.baseline.asOf",
    required: true,
    mode,
  });

  if (
    ledger.approval.approvalStatus !== "approved" ||
    !isNonEmptyString(ledger.approval.reviewer)
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-global-approval-missing",
      path: "ledger.approval",
      route: null,
      message: "Global ledger approval and reviewer identity are required.",
    });
  }
  validateObservedDate(ledger.approval.approvalDate, diagnostics, {
    path: "ledger.approval.approvalDate",
    required: true,
    mode,
  });

  ledger.entries.forEach((entry, index) => {
    if (
      entry.decision.reviewStatus !== "approved" ||
      !isNonEmptyString(entry.decision.reviewer)
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "ledger-entry-approval-missing",
        path: `ledger.entries[${index}].decision`,
        route: entry.route,
        message: "Every ledger entry requires an approved reviewer decision.",
      });
    }
    validateObservedDate(entry.decision.reviewedOn, diagnostics, {
      path: `ledger.entries[${index}].decision.reviewedOn`,
      route: entry.route,
      required: true,
      mode,
    });

    for (const [groupName, record] of [
      ["opportunity", entry.opportunity],
      ["risk", entry.risk],
    ] as const) {
      const groups =
        groupName === "opportunity"
          ? [record.factors, record.liveInputs]
          : [record.factors];
      groups.forEach((group, groupIndex) => {
        Object.values(group).forEach((traceable, traceableIndex) => {
          if (traceable.asOf !== null) {
            validateObservedDate(traceable.asOf, diagnostics, {
              path: `ledger.entries[${index}].${groupName}.inputs[${groupIndex}][${traceableIndex}].asOf`,
              route: entry.route,
              required: false,
              mode,
            });
          }
        });
      });
    }
  });

  ledger.cannibalisationReviews.forEach((review, index) => {
    if (
      review.analysisStatus !== "analysed" ||
      review.approvalStatus !== "approved" ||
      !isNonEmptyString(review.reviewer)
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "cannibalisation-review-approval-missing",
        path: `ledger.cannibalisationReviews[${index}]`,
        route: null,
        message:
          "Every cannibalisation boundary must be analysed and approved before overlay migration.",
      });
    }
    validateObservedDate(review.reviewedOn, diagnostics, {
      path: `ledger.cannibalisationReviews[${index}].reviewedOn`,
      required: true,
      mode,
    });
  });
}

function validateGovernanceBinding(
  rawBinding: unknown,
  mode: ChinaSourcingOverlaysPreviewMode,
  computedDigest: string,
  ticket11Preview: ClusterMigrationPreview | null,
  diagnostics: DiagnosticList,
): MigrationPreviewGovernanceBinding | null {
  if (rawBinding === null || rawBinding === undefined) {
    if (mode === "actual" || mode === "fixture") {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "governance-binding-required",
        path: "governanceBinding",
        route: null,
        message:
          "Fixture and actual preflights require an explicit release and rollback binding.",
      });
    } else {
      addDiagnostic(diagnostics, {
        severity: "advisory",
        code: "dry-run-only",
        path: "mode",
        route: null,
        message:
          "Ticket 12 is a dry-run contract only and cannot expose mutation commands.",
      });
    }
    return null;
  }

  addUnknownKeysDiagnostic(
    rawBinding,
    [
      "origin",
      "public",
      "releaseId",
      "artifactDigest",
      "rollbackArtifactDigest",
      "rollbackOwner",
      "rollbackTriggers",
      "rollbackSteps",
    ],
    diagnostics,
    { code: "unknown-preview-field", path: "governanceBinding" },
  );
  if (!isRecord(rawBinding)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "governance-binding-invalid",
      path: "governanceBinding",
      route: null,
      message: "The governance binding must be a structured object.",
    });
    return null;
  }

  const origin = rawBinding.origin;
  const isKnownOrigin = origin === "production" || origin === "fixture";
  if (!isKnownOrigin || typeof rawBinding.public !== "boolean") {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "governance-binding-invalid",
      path: "governanceBinding.origin",
      route: null,
      message: "Governance origin and public state must be explicit.",
    });
  }

  if (origin === "fixture" && rawBinding.public === true) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "fixture-public-forbidden",
      path: "governanceBinding.public",
      route: null,
      message: "Fixture artifacts can never claim public release state.",
    });
  }
  if (mode === "fixture" && origin !== "fixture") {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "fixture-binding-mode-mismatch",
      path: "governanceBinding.origin",
      route: null,
      message: "Fixture mode requires a fixture governance binding.",
    });
  }
  if ((mode === "dry-run" || mode === "actual") && origin === "fixture") {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "fixture-binding-mode-mismatch",
      path: "governanceBinding.origin",
      route: null,
      message:
        "Actual and dry-run inputs cannot be bound to fixture artifacts.",
    });
  }
  if (mode === "actual" && rawBinding.public !== true) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "actual-public-binding-required",
      path: "governanceBinding.public",
      route: null,
      message:
        "Actual preflight requires an explicit production artifact binding, even though execution remains disabled.",
    });
  }

  if (
    !isNonEmptyString(rawBinding.releaseId) ||
    !isNonEmptyString(rawBinding.rollbackOwner)
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "release-binding-invalid",
      path: "governanceBinding.releaseId",
      route: null,
      message: "Release ID and rollback owner are required.",
    });
  }
  if (
    rawBinding.artifactDigest !== computedDigest ||
    rawBinding.rollbackArtifactDigest !== computedDigest
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "release-artifact-digest-mismatch",
      path: "governanceBinding.artifactDigest",
      route: null,
      message:
        "Release and rollback artifacts must bind the exact current ledger digest.",
    });
  }
  if (
    !isNonEmptyStringArray(rawBinding.rollbackTriggers) ||
    !isNonEmptyStringArray(rawBinding.rollbackSteps)
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "rollback-contract-invalid",
      path: "governanceBinding.rollback",
      route: null,
      message:
        "Rollback triggers and ordered rollback steps must be non-empty string arrays.",
    });
  }

  if (ticket11Preview?.governanceBinding) {
    const ticket11Binding = ticket11Preview.governanceBinding;
    if (
      ticket11Binding.origin !== origin ||
      ticket11Binding.public !== rawBinding.public ||
      ticket11Binding.releaseId !== rawBinding.releaseId ||
      ticket11Binding.artifactDigest !== rawBinding.artifactDigest ||
      ticket11Binding.rollbackArtifactDigest !==
        rawBinding.rollbackArtifactDigest ||
      ticket11Binding.rollbackOwner !== rawBinding.rollbackOwner ||
      !isStringArray(rawBinding.rollbackTriggers) ||
      !sameOrderedStrings(
        ticket11Binding.rollbackTriggers,
        rawBinding.rollbackTriggers,
      ) ||
      !isStringArray(rawBinding.rollbackSteps) ||
      !sameOrderedStrings(
        ticket11Binding.rollbackSteps,
        rawBinding.rollbackSteps,
      )
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "ticket11-governance-binding-mismatch",
        path: "ticket11Preview.governanceBinding",
        route: null,
        message:
          "Ticket 12 must retain Ticket 11's exact release and rollback binding.",
      });
    }
  }

  if (!isKnownOrigin) return null;
  return {
    origin,
    public: rawBinding.public === true,
    releaseId: isNonEmptyString(rawBinding.releaseId)
      ? rawBinding.releaseId
      : "",
    artifactDigest:
      typeof rawBinding.artifactDigest === "string"
        ? rawBinding.artifactDigest
        : "",
    rollbackArtifactDigest:
      typeof rawBinding.rollbackArtifactDigest === "string"
        ? rawBinding.rollbackArtifactDigest
        : "",
    rollbackOwner: isNonEmptyString(rawBinding.rollbackOwner)
      ? rawBinding.rollbackOwner
      : "",
    rollbackTriggers: isStringArray(rawBinding.rollbackTriggers)
      ? [...rawBinding.rollbackTriggers]
      : [],
    rollbackSteps: isStringArray(rawBinding.rollbackSteps)
      ? [...rawBinding.rollbackSteps]
      : [],
  };
}

const TICKET11_PREVIEW_KEYS = [
  "contractId",
  "version",
  "asOf",
  "dataMode",
  "clusterId",
  "ticket",
  "ledgerDigest",
  "previewReady",
  "executionAuthorization",
  "executable",
  "diagnostics",
  "articlePlans",
  "mutationCommands",
  "governanceBinding",
] as const;
const ARTICLE_PLAN_KEYS = [
  "contentId",
  "slug",
  "route",
  "canonicalRoute",
  "contentRole",
  "preservedAuthor",
  "expectedLinks",
  "linksToAdd",
  "expectedFrontmatter",
  "evidenceReadiness",
] as const;
const EVIDENCE_READINESS_KEYS = [
  "status",
  "methodologyRef",
  "claimBoundary",
] as const;
const MUTATION_COMMAND_KEYS = [
  "kind",
  "contentId",
  "route",
  "preconditions",
  "mutation",
] as const;
const MUTATION_PRECONDITION_KEYS = [
  "ledgerDigest",
  "expectedContentId",
  "expectedSlug",
  "expectedRoute",
  "expectedCanonicalRoute",
] as const;
const MUTATION_KEYS = [
  "frontmatter",
  "ensureLinks",
  "routeChange",
  "canonicalChange",
] as const;
const SCOPE_KEYS = [
  "bundleIds",
  "clusterIds",
  "articleCount",
  "maxArticleCount",
  "supportingArticleCount",
  "industryOverlayCount",
] as const;

function isKnownMode(
  value: unknown,
): value is ChinaSourcingOverlaysPreviewMode {
  return value === "fixture" || value === "dry-run" || value === "actual";
}

function isMigrationLedgerRuntime(value: unknown): value is MigrationLedger {
  return (
    isRecord(value) &&
    isRecord(value.baseline) &&
    isRecord(value.approval) &&
    isRecord(value.protection) &&
    Array.isArray(value.clusterPlans) &&
    Array.isArray(value.entries) &&
    Array.isArray(value.cannibalisationReviews) &&
    Array.isArray(value.integrationBlockers)
  );
}

function validateTicket11Preview(
  rawPreview: unknown,
  computedDigest: string,
  diagnostics: DiagnosticList,
): ClusterMigrationPreview | null {
  addUnknownKeysDiagnostic(rawPreview, TICKET11_PREVIEW_KEYS, diagnostics, {
    code: "unknown-preview-field",
    path: "ticket11Preview",
  });
  if (!isRecord(rawPreview)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ticket11-preview-invalid",
      path: "ticket11Preview",
      route: null,
      message: "Ticket 12 requires the governed Ticket 11 preview artifact.",
    });
    return null;
  }

  if (
    rawPreview.contractId !== MIGRATION_PREVIEW_CONTRACT_ID ||
    rawPreview.version !== 1 ||
    rawPreview.asOf !== SEO_AS_OF_BOUNDARY ||
    (rawPreview.dataMode !== "actual" &&
      rawPreview.dataMode !== "synthetic_fixture") ||
    rawPreview.clusterId !== CHINA_SOURCING_OVERLAYS_CLUSTER_ID ||
    rawPreview.ticket !== "11" ||
    typeof rawPreview.previewReady !== "boolean" ||
    rawPreview.executionAuthorization !== "not-authorized" ||
    rawPreview.executable !== false
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ticket11-preview-contract-mismatch",
      path: "ticket11Preview",
      route: null,
      message:
        "Ticket 12 accepts only the non-executable cluster-migration-preview.v2 China Sourcing artifact produced by Ticket 11 at the frozen SEO boundary.",
    });
  }
  if (rawPreview.ledgerDigest !== computedDigest) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ticket11-ledger-digest-mismatch",
      path: "ticket11Preview.ledgerDigest",
      route: null,
      message:
        "Ticket 11 and Ticket 12 must bind the same current migration ledger digest.",
    });
  }

  if (!Array.isArray(rawPreview.diagnostics)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ticket11-preview-invalid",
      path: "ticket11Preview.diagnostics",
      route: null,
      message: "Ticket 11 diagnostics must be present as an array.",
    });
  } else {
    rawPreview.diagnostics.forEach((diagnostic, index) =>
      addUnknownKeysDiagnostic(
        diagnostic,
        ["severity", "code", "path", "route", "message"],
        diagnostics,
        {
          code: "unknown-preview-field",
          path: `ticket11Preview.diagnostics[${index}]`,
        },
      ),
    );
  }

  if (!Array.isArray(rawPreview.articlePlans)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ticket11-preview-invalid",
      path: "ticket11Preview.articlePlans",
      route: null,
      message: "Ticket 11 article plans must be present as an array.",
    });
    return null;
  }

  const seenRoutes = new Set<string>();
  const seenContentIds = new Set<string>();
  rawPreview.articlePlans.forEach((articlePlan, index) => {
    const path = `ticket11Preview.articlePlans[${index}]`;
    const route =
      isRecord(articlePlan) && isNonEmptyString(articlePlan.route)
        ? articlePlan.route
        : null;
    addUnknownKeysDiagnostic(articlePlan, ARTICLE_PLAN_KEYS, diagnostics, {
      code: "unknown-preview-field",
      path,
      route,
    });
    if (!isRecord(articlePlan)) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "ticket11-article-plan-invalid",
        path,
        route,
        message: "Every Ticket 11 article plan must be a structured object.",
      });
      return;
    }
    addUnknownKeysDiagnostic(
      articlePlan.expectedFrontmatter,
      PLANNED_FRONTMATTER_KEYS,
      diagnostics,
      {
        code: "unknown-preview-field",
        path: `${path}.expectedFrontmatter`,
        route,
      },
    );
    addUnknownKeysDiagnostic(
      articlePlan.evidenceReadiness,
      EVIDENCE_READINESS_KEYS,
      diagnostics,
      {
        code: "unknown-preview-field",
        path: `${path}.evidenceReadiness`,
        route,
      },
    );

    if (
      !isNonEmptyString(articlePlan.contentId) ||
      !isNonEmptyString(articlePlan.slug) ||
      !isNonEmptyString(articlePlan.route) ||
      !isNonEmptyString(articlePlan.canonicalRoute)
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "ticket11-article-plan-invalid",
        path,
        route,
        message: "Ticket 11 article identity fields must be non-empty strings.",
      });
      return;
    }
    if (
      seenRoutes.has(articlePlan.route) ||
      seenContentIds.has(articlePlan.contentId)
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "ticket11-primary-membership-duplicate",
        path,
        route: articlePlan.route,
        message:
          "Ticket 11 article plans must retain one primary identity per route and content ID.",
      });
    }
    seenRoutes.add(articlePlan.route);
    seenContentIds.add(articlePlan.contentId);

    const plannedAction = isRecord(articlePlan.expectedFrontmatter)
      ? articlePlan.expectedFrontmatter.migrationAction
      : null;
    if (
      articlePlan.canonicalRoute !== articlePlan.route ||
      (typeof plannedAction === "string" &&
        DESTRUCTIVE_ACTIONS.has(plannedAction as MigrationAction))
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "destructive-ticket11-mutation",
        path,
        route: articlePlan.route,
        message:
          "Ticket 12 rejects Ticket 11 plans that change canonicals or carry destructive migration actions.",
      });
    }
  });

  if (!Array.isArray(rawPreview.mutationCommands)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ticket11-preview-invalid",
      path: "ticket11Preview.mutationCommands",
      route: null,
      message: "Ticket 11 mutation commands must be present as an array.",
    });
    return null;
  }

  if (rawPreview.mutationCommands.length > 0) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ticket11-execution-authority-invalid",
      path: "ticket11Preview.mutationCommands",
      route: null,
      message:
        "Ticket 11 is a preview-only contract and must not expose mutation commands or execution authority.",
    });
  }

  rawPreview.mutationCommands.forEach((command, index) => {
    const path = `ticket11Preview.mutationCommands[${index}]`;
    const route =
      isRecord(command) && isNonEmptyString(command.route)
        ? command.route
        : null;
    addUnknownKeysDiagnostic(command, MUTATION_COMMAND_KEYS, diagnostics, {
      code: "unknown-preview-field",
      path,
      route,
    });
    if (!isRecord(command)) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "ticket11-mutation-invalid",
        path,
        route,
        message: "Ticket 11 mutation commands must be structured objects.",
      });
      return;
    }
    addUnknownKeysDiagnostic(
      command.preconditions,
      MUTATION_PRECONDITION_KEYS,
      diagnostics,
      {
        code: "unknown-preview-field",
        path: `${path}.preconditions`,
        route,
      },
    );
    addUnknownKeysDiagnostic(command.mutation, MUTATION_KEYS, diagnostics, {
      code: "unknown-preview-field",
      path: `${path}.mutation`,
      route,
    });
    if (isRecord(command.mutation)) {
      addUnknownKeysDiagnostic(
        command.mutation.frontmatter,
        PLANNED_FRONTMATTER_KEYS,
        diagnostics,
        {
          code: "unknown-preview-field",
          path: `${path}.mutation.frontmatter`,
          route,
        },
      );
      const action = isRecord(command.mutation.frontmatter)
        ? command.mutation.frontmatter.migrationAction
        : null;
      if (
        command.mutation.routeChange !== null ||
        command.mutation.canonicalChange !== null ||
        (typeof action === "string" &&
          DESTRUCTIVE_ACTIONS.has(action as MigrationAction))
      ) {
        addDiagnostic(diagnostics, {
          severity: "error",
          code: "destructive-ticket11-mutation",
          path: `${path}.mutation`,
          route,
          message:
            "Ticket 12 rejects route changes, canonical changes, and destructive Ticket 11 mutations.",
        });
      }
    }
  });

  return rawPreview as unknown as ClusterMigrationPreview;
}

function resolveClustersForRoute(
  ledger: MigrationLedger,
  route: string,
): ClusterId[] {
  const resolved = new Set<ClusterId>();
  for (const cluster of clusterRegistry.clusters) {
    if (cluster.commercialRoot === route) resolved.add(cluster.id);
  }
  for (const plan of ledger.clusterPlans) {
    if (
      plan.commercialRoot === route ||
      plan.editorialPillar.route === route ||
      plan.baselineRoutes.includes(route) ||
      plan.memberRoutes.includes(route)
    ) {
      resolved.add(plan.cluster);
    }
  }
  for (const entry of ledger.entries) {
    if (entry.route === route) resolved.add(entry.classification.cluster);
  }
  return [...resolved].sort(compareCodePoints);
}

function validateTicket11PlanAgainstEntry(
  ticket11Plan: ArticleMigrationPlan,
  entry: MigrationLedgerEntry,
  parentJourney: ChinaSourcingOverlaysParentJourney,
  diagnostics: DiagnosticList,
): void {
  const frontmatter = ticket11Plan.expectedFrontmatter;
  const identityMatches =
    ticket11Plan.contentId === entry.contentId &&
    ticket11Plan.slug === entry.slug &&
    ticket11Plan.route === entry.route &&
    ticket11Plan.canonicalRoute === entry.route;
  const classificationMatches =
    ticket11Plan.contentRole === entry.classification.role &&
    frontmatter.contentId === entry.contentId &&
    frontmatter.cluster === CHINA_SOURCING_OVERLAYS_CLUSTER_ID &&
    frontmatter.contentRole === entry.classification.role &&
    frontmatter.searchIntent === entry.classification.searchIntent &&
    frontmatter.funnelStage === entry.classification.funnelStage &&
    frontmatter.targetMarket === entry.classification.targetMarket &&
    frontmatter.commercialRoot === parentJourney.commercialRoot &&
    frontmatter.editorialPillar === parentJourney.editorialPillar &&
    frontmatter.migrationAction === entry.decision.action &&
    sameStrings(frontmatter.requiredLinks, entry.requiredLinks);

  if (!identityMatches || !classificationMatches) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ticket11-overlay-contract-mismatch",
      path: `ticket11Preview.articlePlans.${entry.contentId}`,
      route: entry.route,
      message:
        "Ticket 11 identity, classification, roots, links, and migration action must exactly match the governed ledger.",
    });
  }
}

function deriveSources(
  ledger: MigrationLedger,
  ticket11Preview: ClusterMigrationPreview,
  diagnostics: DiagnosticList,
): DerivedSources {
  const registryCluster = clusterRegistry.clusters.find(
    ({ id }) => id === CHINA_SOURCING_OVERLAYS_CLUSTER_ID,
  );
  const plan = ledger.clusterPlans.find(
    ({ cluster }) => cluster === CHINA_SOURCING_OVERLAYS_CLUSTER_ID,
  );

  if (!registryCluster || !plan) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-source-contract-missing",
      path: "ledger.clusterPlans.china-sourcing",
      route: null,
      message:
        "The canonical registry and ledger must both define the China Sourcing journey.",
    });
    return {
      parentJourney: null,
      plan: null,
      memberEntries: [],
      ticket11PlansByRoute: new Map(),
      industryRoutes: new Set(),
    };
  }

  if (registryCluster.commercialRoot !== plan.commercialRoot) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-commercial-root-drift",
      path: "ledger.clusterPlans.china-sourcing.commercialRoot",
      route: plan.commercialRoot,
      message:
        "The overlay commercial root must exactly match the canonical registry.",
    });
  }

  const parentJourney: ChinaSourcingOverlaysParentJourney = {
    commercialRoot: plan.commercialRoot,
    editorialPillar: plan.editorialPillar.route,
    editorialPillarContentId: plan.editorialPillar.contentId ?? "",
  };
  if (
    plan.editorialPillar.status !== "existing-baseline" ||
    !isNonEmptyString(plan.editorialPillar.contentId)
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-parent-pillar-unresolved",
      path: "ledger.clusterPlans.china-sourcing.editorialPillar",
      route: plan.editorialPillar.route,
      message:
        "Ticket 12 requires the existing governed China Sourcing editorial pillar identity.",
    });
  }

  const ticket11PlansByRoute = new Map<string, ArticleMigrationPlan>();
  for (const articlePlan of ticket11Preview.articlePlans) {
    if (!ticket11PlansByRoute.has(articlePlan.route)) {
      ticket11PlansByRoute.set(articlePlan.route, articlePlan);
    }
  }
  if (!sameStrings([...ticket11PlansByRoute.keys()], plan.baselineRoutes)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ticket11-article-set-mismatch",
      path: "ticket11Preview.articlePlans",
      route: null,
      message:
        "Ticket 11 article plans must exactly cover the governed China Sourcing baseline routes.",
    });
  }

  const pillarPlan = ticket11PlansByRoute.get(plan.editorialPillar.route);
  if (
    !pillarPlan ||
    pillarPlan.contentId !== plan.editorialPillar.contentId ||
    pillarPlan.contentRole !== "pillar" ||
    pillarPlan.canonicalRoute !== plan.editorialPillar.route
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ticket11-pillar-contract-mismatch",
      path: "ticket11Preview.articlePlans.pillar",
      route: plan.editorialPillar.route,
      message:
        "Ticket 12 must inherit Ticket 11's exact China Sourcing pillar identity and canonical route.",
    });
  }

  const memberEntries: MigrationLedgerEntry[] = [];
  for (const memberRoute of plan.memberRoutes) {
    const routeEntries = ledger.entries.filter(
      ({ route }) => route === memberRoute,
    );
    const routeContentIds = new Set(
      routeEntries.map(({ contentId }) => contentId),
    );
    if (routeEntries.length !== 1 || routeContentIds.size !== 1) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-primary-membership-duplicate",
        path: "ledger.entries",
        route: memberRoute,
        message:
          "Every overlay route must have exactly one governed primary ledger identity.",
      });
    }
    const entry = routeEntries[0];
    if (!entry) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-member-entry-missing",
        path: "ledger.entries",
        route: memberRoute,
        message:
          "Every Ticket 11 China Sourcing member route requires a Ticket 12 overlay entry.",
      });
      continue;
    }
    if (entry.classification.cluster !== CHINA_SOURCING_OVERLAYS_CLUSTER_ID) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-primary-membership-mismatch",
        path: `ledger.entries.${entry.contentId}.classification.cluster`,
        route: entry.route,
        message:
          "Overlay entries must retain China Sourcing as their single primary cluster.",
      });
    }
    memberEntries.push(entry);

    const ticket11Plan = ticket11PlansByRoute.get(entry.route);
    if (!ticket11Plan) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "ticket11-overlay-plan-missing",
        path: "ticket11Preview.articlePlans",
        route: entry.route,
        message:
          "Every Ticket 12 overlay must be inherited from a Ticket 11 article plan.",
      });
    } else {
      validateTicket11PlanAgainstEntry(
        ticket11Plan,
        entry,
        parentJourney,
        diagnostics,
      );
    }
  }

  const memberRouteSet = new Set(plan.memberRoutes);
  const unexpectedEntries = ledger.entries.filter(
    ({ classification, route }) =>
      classification.cluster === CHINA_SOURCING_OVERLAYS_CLUSTER_ID &&
      route !== plan.editorialPillar.route &&
      !memberRouteSet.has(route),
  );
  if (unexpectedEntries.length > 0) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-primary-membership-mismatch",
      path: "ledger.entries",
      route: unexpectedEntries[0]?.route ?? null,
      message:
        "China Sourcing ledger entries must exactly match the governed pillar and member routes.",
    });
  }

  const identityCounts = new Map<string, number>();
  for (const entry of ledger.entries) {
    for (const identity of [
      `route:${entry.route}`,
      `contentId:${entry.contentId}`,
    ]) {
      identityCounts.set(identity, (identityCounts.get(identity) ?? 0) + 1);
    }
  }
  for (const entry of memberEntries) {
    if (
      (identityCounts.get(`route:${entry.route}`) ?? 0) !== 1 ||
      (identityCounts.get(`contentId:${entry.contentId}`) ?? 0) !== 1
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-primary-membership-duplicate",
        path: "ledger.entries",
        route: entry.route,
        message:
          "Overlay route and content identities cannot belong to multiple primary ledger entries.",
      });
    }
  }

  const industryRoutes = new Set(
    memberEntries
      .filter(
        ({ classification }) =>
          classification.searchIntent === "category-sourcing",
      )
      .map(({ route }) => route),
  );
  if (industryRoutes.size === 0) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-entries-not-recorded",
      path: "ledger.entries",
      route: null,
      message:
        "No governed China Sourcing industry overlay entries are recorded; the migration remains planned and no content is inferred.",
    });
  }

  return {
    parentJourney,
    plan,
    memberEntries: memberEntries.sort((left, right) =>
      compareCodePoints(left.route, right.route),
    ),
    ticket11PlansByRoute,
    industryRoutes,
  };
}

function deriveSpecialistResolution(
  ledger: MigrationLedger,
  entry: MigrationLedgerEntry,
  parentJourney: ChinaSourcingOverlaysParentJourney,
  isIndustryOverlay: boolean,
  diagnostics: DiagnosticList,
): SpecialistResolution {
  const reviews = ledger.cannibalisationReviews
    .filter(({ routes }) => routes.includes(entry.route))
    .sort((left, right) => compareCodePoints(left.id, right.id));
  const reviewIds = reviews.map(({ id }) => id);

  if (
    isIndustryOverlay &&
    !reviews.some(({ routes }) =>
      routes.includes(parentJourney.editorialPillar),
    )
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-cannibalisation-review-missing",
      path: "ledger.cannibalisationReviews",
      route: entry.route,
      message:
        "Every industry overlay requires a governed non-cannibalisation review with the China Sourcing pillar.",
    });
  }

  const candidateRoutes = new Map<
    string,
    {
      clusterId: Exclude<ClusterId, "china-sourcing">;
      ledgerBound: boolean;
      reviewIds: Set<string>;
    }
  >();

  const addCandidate = (
    route: string,
    sourceReviewId: string | null,
    ledgerBound: boolean,
  ): void => {
    const clusters = resolveClustersForRoute(ledger, route).filter(
      (clusterId): clusterId is Exclude<ClusterId, "china-sourcing"> =>
        clusterId !== CHINA_SOURCING_OVERLAYS_CLUSTER_ID,
    );
    if (clusters.length === 0) {
      if (sourceReviewId !== null) {
        addDiagnostic(diagnostics, {
          severity: "error",
          code: "overlay-specialist-route-unresolved",
          path: `ledger.cannibalisationReviews.${sourceReviewId}.routes`,
          route: entry.route,
          message:
            "A cross-cluster review route must resolve to an existing canonical specialist cluster.",
        });
      }
      return;
    }
    if (
      clusters.length !== 1 ||
      !SPECIALIST_CLUSTER_IDS.includes(clusters[0])
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-specialist-route-ambiguous",
        path: "ledger",
        route,
        message:
          "Specialist links must resolve to exactly one of the five canonical clusters.",
      });
      return;
    }

    const clusterId = clusters[0];
    const existing = candidateRoutes.get(route) ?? {
      clusterId,
      ledgerBound: false,
      reviewIds: new Set<string>(),
    };
    existing.ledgerBound ||= ledgerBound;
    if (sourceReviewId !== null) existing.reviewIds.add(sourceReviewId);
    candidateRoutes.set(route, existing);
  };

  for (const requiredLink of entry.requiredLinks) {
    addCandidate(requiredLink, null, true);
  }
  for (const review of reviews) {
    for (const route of review.routes) {
      if (route === entry.route) continue;
      const resolved = resolveClustersForRoute(ledger, route);
      if (
        resolved.some(
          (clusterId) => clusterId !== CHINA_SOURCING_OVERLAYS_CLUSTER_ID,
        )
      ) {
        addCandidate(route, review.id, entry.requiredLinks.includes(route));
      }
    }
  }

  const links = [...candidateRoutes.entries()]
    .map(([route, candidate]) => ({
      clusterId: candidate.clusterId,
      route,
      source: candidate.ledgerBound
        ? ("ledger-required-link" as const)
        : ("cannibalisation-review" as const),
      reviewIds: sortCodePoints([...candidate.reviewIds]),
    }))
    .sort((left, right) => compareCodePoints(left.route, right.route));

  for (const link of links) {
    if (
      link.source === "cannibalisation-review" &&
      !entry.requiredLinks.includes(link.route)
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-specialist-link-not-ledger-bound",
        path: `ledger.entries.${entry.contentId}.requiredLinks`,
        route: entry.route,
        message:
          "A cross-cluster review target must be explicitly bound in the overlay entry's required links before release.",
      });
    }
  }

  if (isIndustryOverlay && links.length === 0) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-specialist-link-missing",
      path: `ledger.entries.${entry.contentId}.requiredLinks`,
      route: entry.route,
      message:
        "No governed specialist-cluster route is recorded for this industry overlay; Ticket 12 will not invent one.",
    });
  }

  return {
    links,
    requiredReviewRoutes: links
      .filter(({ source }) => source === "cannibalisation-review")
      .map(({ route }) => route),
    reviewIds,
  };
}

function validateSnapshot(
  rawSnapshot: unknown,
  entry: MigrationLedgerEntry,
  mode: ChinaSourcingOverlaysPreviewMode,
  diagnostics: DiagnosticList,
): MigrationArticleSnapshot | null {
  const path = `articles.${entry.contentId}`;
  addUnknownKeysDiagnostic(rawSnapshot, SNAPSHOT_KEYS, diagnostics, {
    code: "unknown-preview-field",
    path,
    route: entry.route,
  });
  if (!isRecord(rawSnapshot)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-snapshot-missing",
      path,
      route: entry.route,
      message: "Every overlay requires its Ticket 11 source snapshot.",
    });
    return null;
  }

  addUnknownKeysDiagnostic(
    rawSnapshot.frontmatter,
    SNAPSHOT_FRONTMATTER_KEYS,
    diagnostics,
    {
      code: "unknown-preview-field",
      path: `${path}.frontmatter`,
      route: entry.route,
    },
  );
  addUnknownKeysDiagnostic(
    rawSnapshot.evidenceReadiness,
    EVIDENCE_READINESS_KEYS,
    diagnostics,
    {
      code: "unknown-preview-field",
      path: `${path}.evidenceReadiness`,
      route: entry.route,
    },
  );

  if (
    rawSnapshot.contentId !== entry.contentId ||
    rawSnapshot.slug !== entry.slug ||
    rawSnapshot.route !== entry.route
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-identity-drift",
      path,
      route: entry.route,
      message:
        "Snapshot content ID, slug, and route must exactly match the governed ledger identity.",
    });
  }
  if (rawSnapshot.canonicalRoute !== entry.route) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-canonical-drift",
      path: `${path}.canonicalRoute`,
      route: entry.route,
      message:
        "Overlay canonical routes are preserved exactly; replacement canonicals are forbidden.",
    });
  }
  if (!isStringArray(rawSnapshot.currentLinks)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-links-invalid",
      path: `${path}.currentLinks`,
      route: entry.route,
      message: "Current links must be provided as an explicit string array.",
    });
  }

  const frontmatter = rawSnapshot.frontmatter;
  if (!isRecord(frontmatter)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-frontmatter-invalid",
      path: `${path}.frontmatter`,
      route: entry.route,
      message: "Governed overlay frontmatter is required.",
    });
  } else {
    if (
      !isNonEmptyString(frontmatter.author) ||
      !isNonEmptyString(frontmatter.primaryKeyword) ||
      !isStringArray(frontmatter.secondaryKeywords) ||
      !isNonEmptyString(frontmatter.reviewedBy) ||
      !isNonEmptyStringArray(frontmatter.evidenceIds) ||
      !EDITORIAL_STATUSES.includes(
        frontmatter.editorialStatus as (typeof EDITORIAL_STATUSES)[number],
      ) ||
      !(
        frontmatter.firstPartyContributionId === null ||
        isNonEmptyString(frontmatter.firstPartyContributionId)
      )
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-frontmatter-invalid",
        path: `${path}.frontmatter`,
        route: entry.route,
        message:
          "Author, keywords, evidence, reviewer, and governed editorial metadata must be explicit.",
      });
    }
    if (frontmatter.editorialStatus === "draft") {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-draft-not-ready",
        path: `${path}.frontmatter.editorialStatus`,
        route: entry.route,
        message: "Draft overlay evidence cannot pass Ticket 12 preflight.",
      });
    }
    validateObservedDate(frontmatter.reviewedDate, diagnostics, {
      path: `${path}.frontmatter.reviewedDate`,
      route: entry.route,
      required: true,
      mode,
    });
    if (!isValidIsoCalendarDate(frontmatter.reviewDueDate)) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "review-due-date-invalid",
        path: `${path}.frontmatter.reviewDueDate`,
        route: entry.route,
        message: "Review due dates must be valid ISO calendar dates.",
      });
    } else if (
      isValidIsoCalendarDate(frontmatter.reviewedDate) &&
      frontmatter.reviewDueDate < frontmatter.reviewedDate
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "review-due-date-invalid",
        path: `${path}.frontmatter.reviewDueDate`,
        route: entry.route,
        message: "Review due dates cannot precede the observed review date.",
      });
    }
  }

  const readiness = rawSnapshot.evidenceReadiness;
  if (!isRecord(readiness)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-readiness-invalid",
      path: `${path}.evidenceReadiness`,
      route: entry.route,
      message: "Evidence readiness must be a governed structured object.",
    });
  } else {
    if (readiness.status !== "reviewed") {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-evidence-not-reviewed",
        path: `${path}.evidenceReadiness.status`,
        route: entry.route,
        message:
          "Overlay evidence must be reviewed; visible gaps remain a release blocker.",
      });
    }
    if (
      !isNonEmptyString(readiness.methodologyRef) ||
      !isNonEmptyString(readiness.claimBoundary)
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-readiness-invalid",
        path: `${path}.evidenceReadiness`,
        route: entry.route,
        message:
          "Reviewed overlays require a methodology reference and explicit claim boundary.",
      });
    }
  }

  return rawSnapshot as unknown as MigrationArticleSnapshot;
}

function buildOverlayContractsAndPlans(
  ledger: MigrationLedger,
  articles: readonly unknown[],
  sources: DerivedSources,
  mode: ChinaSourcingOverlaysPreviewMode,
  diagnostics: DiagnosticList,
): {
  readonly entries: ChinaSourcingOverlayEntryContract[];
  readonly articlePlans: ArticleMigrationPlan[];
} {
  if (!sources.parentJourney || !sources.plan) {
    return { entries: [], articlePlans: [] };
  }

  const snapshotsByRoute = new Map<string, unknown>();
  const snapshotRouteCounts = new Map<string, number>();
  for (const snapshot of articles) {
    const route =
      isRecord(snapshot) && isNonEmptyString(snapshot.route)
        ? snapshot.route
        : "";
    if (route) {
      snapshotRouteCounts.set(route, (snapshotRouteCounts.get(route) ?? 0) + 1);
      if (!snapshotsByRoute.has(route)) snapshotsByRoute.set(route, snapshot);
    }
  }
  for (const [route, count] of snapshotRouteCounts) {
    if (count > 1) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-snapshot-duplicate",
        path: "articles",
        route,
        message: "Article snapshots must retain one source artifact per route.",
      });
    }
  }
  if (!sameStrings([...snapshotsByRoute.keys()], sources.plan.baselineRoutes)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-snapshot-set-mismatch",
      path: "articles",
      route: null,
      message:
        "Ticket 12 snapshots must exactly match the Ticket 11 China Sourcing baseline artifact set.",
    });
  }

  const entries: ChinaSourcingOverlayEntryContract[] = [];
  const articlePlans: ArticleMigrationPlan[] = [];
  for (const entry of sources.memberEntries) {
    const isIndustryOverlay = sources.industryRoutes.has(entry.route);
    if (
      !CONTENT_ROLES.includes(entry.classification.role) ||
      !MIGRATION_SEARCH_INTENTS.includes(entry.classification.searchIntent) ||
      !FUNNEL_STAGES.includes(entry.classification.funnelStage) ||
      !TARGET_MARKETS.includes(entry.classification.targetMarket) ||
      !MIGRATION_ACTIONS.includes(entry.decision.action)
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-classification-invalid",
        path: `ledger.entries.${entry.contentId}`,
        route: entry.route,
        message:
          "Overlay role, intent, funnel, market, and migration action must use governed values.",
      });
    }
    if (DESTRUCTIVE_ACTIONS.has(entry.decision.action)) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "destructive-overlay-action",
        path: `ledger.entries.${entry.contentId}.decision.action`,
        route: entry.route,
        message:
          "Ticket 12 permits metadata and link previews only; merge, redirect, and retire actions are forbidden.",
      });
    }

    const specialist = deriveSpecialistResolution(
      ledger,
      entry,
      sources.parentJourney,
      isIndustryOverlay,
      diagnostics,
    );
    const expectedLinks = uniqueSorted([
      sources.parentJourney.commercialRoot,
      sources.parentJourney.editorialPillar,
      ...entry.requiredLinks,
      ...specialist.links.map(({ route }) => route),
    ]);
    const overlayContract: ChinaSourcingOverlayEntryContract = {
      contentId: entry.contentId,
      slug: entry.slug,
      route: entry.route,
      scope: isIndustryOverlay ? "industry-overlay" : "supporting",
      contentRole: entry.classification.role,
      searchIntent: entry.classification.searchIntent,
      funnelStage: entry.classification.funnelStage,
      targetMarket: entry.classification.targetMarket,
      commercialRoot: sources.parentJourney.commercialRoot,
      editorialPillar: sources.parentJourney.editorialPillar,
      editorialPillarContentId: sources.parentJourney.editorialPillarContentId,
      requiredLinks: expectedLinks,
      specialistLinks: [...specialist.links],
      cannibalisationReviewIds: [...specialist.reviewIds],
      migrationAction: entry.decision.action,
    };
    entries.push(overlayContract);

    const rawSnapshot = snapshotsByRoute.get(entry.route);
    const snapshot = validateSnapshot(rawSnapshot, entry, mode, diagnostics);
    const ticket11Plan = sources.ticket11PlansByRoute.get(entry.route);
    if (!snapshot || !ticket11Plan) continue;

    if (
      ticket11Plan.preservedAuthor.trim() !== snapshot.frontmatter.author.trim()
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "ticket11-overlay-contract-mismatch",
        path: `ticket11Preview.articlePlans.${entry.contentId}.preservedAuthor`,
        route: entry.route,
        message:
          "Ticket 12 must preserve Ticket 11's exact existing article author.",
      });
    }

    const currentLinks = uniqueSorted([...snapshot.currentLinks]);
    const expectedFrontmatter: PlannedGovernedFrontmatter = {
      ...ticket11Plan.expectedFrontmatter,
      requiredLinks: expectedLinks,
    };
    articlePlans.push({
      contentId: entry.contentId,
      slug: entry.slug,
      route: entry.route,
      canonicalRoute: entry.route,
      contentRole: entry.classification.role,
      preservedAuthor: ticket11Plan.preservedAuthor,
      expectedLinks,
      linksToAdd: expectedLinks.filter((link) => !currentLinks.includes(link)),
      expectedFrontmatter,
      evidenceReadiness: {
        status: snapshot.evidenceReadiness.status,
        methodologyRef: snapshot.evidenceReadiness.methodologyRef,
        claimBoundary: snapshot.evidenceReadiness.claimBoundary,
      },
    });
  }

  return {
    entries: entries.sort((left, right) =>
      compareCodePoints(left.route, right.route),
    ),
    articlePlans: articlePlans.sort((left, right) =>
      compareCodePoints(left.route, right.route),
    ),
  };
}

function validateScope(
  rawScope: unknown,
  supportingCount: number,
  industryCount: number,
  diagnostics: DiagnosticList,
): void {
  if (rawScope === null || rawScope === undefined) return;
  addUnknownKeysDiagnostic(rawScope, SCOPE_KEYS, diagnostics, {
    code: "unknown-preview-field",
    path: "scope",
  });
  if (!isRecord(rawScope)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-scope-invalid",
      path: "scope",
      route: null,
      message: "Overlay scope must be an explicit structured object.",
    });
    return;
  }

  if (
    rawScope.bundleIds !== null &&
    rawScope.bundleIds !== undefined &&
    (!isNonEmptyStringArray(rawScope.bundleIds) ||
      rawScope.bundleIds.length !== 1)
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-scope-bundle-split-required",
      path: "scope.bundleIds",
      route: null,
      message:
        "Ticket 12 preflight accepts exactly one independently reviewable bundle.",
    });
  }
  if (
    isNonEmptyStringArray(rawScope.bundleIds) &&
    rawScope.bundleIds.length === 1 &&
    rawScope.bundleIds[0] !== "ticket-12"
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-scope-bundle-mismatch",
      path: "scope.bundleIds",
      route: null,
      message: "The overlay bundle must be explicitly bound to ticket-12.",
    });
  }

  if (
    rawScope.clusterIds !== null &&
    rawScope.clusterIds !== undefined &&
    (!isStringArray(rawScope.clusterIds) ||
      !sameStrings(rawScope.clusterIds, [CHINA_SOURCING_OVERLAYS_CLUSTER_ID]))
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-scope-cluster-split-required",
      path: "scope.clusterIds",
      route: null,
      message:
        "Ticket 12 cannot mix China Sourcing overlays with another primary cluster migration.",
    });
  }

  const articleCount = supportingCount + industryCount;
  if (
    rawScope.articleCount !== null &&
    rawScope.articleCount !== undefined &&
    (!isFiniteNonNegativeInteger(rawScope.articleCount) ||
      rawScope.articleCount !== articleCount)
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-scope-count-mismatch",
      path: "scope.articleCount",
      route: null,
      message: `Overlay scope must contain exactly ${articleCount} governed member articles.`,
    });
  }
  if (
    rawScope.maxArticleCount !== null &&
    rawScope.maxArticleCount !== undefined &&
    (!isFiniteNonNegativeInteger(rawScope.maxArticleCount) ||
      rawScope.maxArticleCount < articleCount)
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-scope-size-exceeded",
      path: "scope.maxArticleCount",
      route: null,
      message:
        "The independently reviewable overlay scope exceeds its declared maximum article count.",
    });
  }
  if (
    rawScope.supportingArticleCount !== null &&
    rawScope.supportingArticleCount !== undefined &&
    (!isFiniteNonNegativeInteger(rawScope.supportingArticleCount) ||
      rawScope.supportingArticleCount !== supportingCount)
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-scope-supporting-count-mismatch",
      path: "scope.supportingArticleCount",
      route: null,
      message: `The supporting graph contains exactly ${supportingCount} governed routes.`,
    });
  }
  if (
    rawScope.industryOverlayCount !== null &&
    rawScope.industryOverlayCount !== undefined &&
    (!isFiniteNonNegativeInteger(rawScope.industryOverlayCount) ||
      rawScope.industryOverlayCount !== industryCount)
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-scope-industry-count-mismatch",
      path: "scope.industryOverlayCount",
      route: null,
      message: `The industry overlay scope contains exactly ${industryCount} governed routes.`,
    });
  }
}

export function buildChinaSourcingOverlaysMigrationPreview(
  input: ChinaSourcingOverlaysMigrationPreviewInput,
): ChinaSourcingOverlaysMigrationPreview {
  const diagnostics: DiagnosticList = [];
  const rawInput: unknown = input;
  addUnknownKeysDiagnostic(rawInput, INPUT_KEYS, diagnostics, {
    code: "unknown-preview-field",
    path: "input",
  });

  if (!isRecord(rawInput)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "preview-input-invalid",
      path: "input",
      route: null,
      message: "Ticket 12 preflight input must be a structured object.",
    });
  }

  const mode =
    isRecord(rawInput) && isKnownMode(rawInput.mode)
      ? rawInput.mode
      : "dry-run";
  if (!isRecord(rawInput) || !isKnownMode(rawInput.mode)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "preview-mode-invalid",
      path: "mode",
      route: null,
      message: "Preview mode must be fixture, dry-run, or actual.",
    });
  }

  const rawLedger = isRecord(rawInput) ? rawInput.ledger : null;
  const rawReport = isRecord(rawInput) ? rawInput.ledgerReport : null;
  const rawTicket11 = isRecord(rawInput) ? rawInput.ticket11Preview : null;
  const rawArticles = isRecord(rawInput) ? rawInput.articles : null;
  const rawScope = isRecord(rawInput) ? rawInput.scope : null;
  const rawGovernanceBinding = isRecord(rawInput)
    ? rawInput.governanceBinding
    : null;

  validateUnknownLedgerFields(rawLedger, diagnostics);
  const computedDigest = safeComputeLedgerDigest(rawLedger, diagnostics);
  const reportValid = validateReportShape(rawReport, diagnostics);
  const ticket11Preview = validateTicket11Preview(
    rawTicket11,
    computedDigest,
    diagnostics,
  );
  const governanceBinding = validateGovernanceBinding(
    rawGovernanceBinding,
    mode,
    computedDigest,
    ticket11Preview,
    diagnostics,
  );

  let parentJourney: ChinaSourcingOverlaysParentJourney | null = null;
  let entries: ChinaSourcingOverlayEntryContract[] = [];
  let articlePlans: ArticleMigrationPlan[] = [];
  let industryRoutes: string[] = [];
  let supportingRoutes: string[] = [];

  if (!Array.isArray(rawArticles)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "overlay-articles-invalid",
      path: "articles",
      route: null,
      message: "Ticket 12 requires the Ticket 11 article snapshot array.",
    });
  }

  if (isMigrationLedgerRuntime(rawLedger) && reportValid && ticket11Preview) {
    try {
      validateLedgerGates(
        rawLedger,
        rawReport,
        computedDigest,
        mode,
        diagnostics,
      );
      const sources = deriveSources(rawLedger, ticket11Preview, diagnostics);
      parentJourney = sources.parentJourney;
      const built = buildOverlayContractsAndPlans(
        rawLedger,
        Array.isArray(rawArticles) ? rawArticles : [],
        sources,
        mode,
        diagnostics,
      );
      entries = built.entries;
      articlePlans = built.articlePlans;
      industryRoutes = entries
        .filter(({ scope }) => scope === "industry-overlay")
        .map(({ route }) => route);
      supportingRoutes = entries
        .filter(({ scope }) => scope === "supporting")
        .map(({ route }) => route);
    } catch {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "overlay-contract-derivation-failed",
        path: "input",
        route: null,
        message:
          "The source artifacts could not be safely derived; Ticket 12 failed closed without commands.",
      });
      parentJourney = null;
      entries = [];
      articlePlans = [];
      industryRoutes = [];
      supportingRoutes = [];
    }
  } else if (!isMigrationLedgerRuntime(rawLedger)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-shape-invalid",
      path: "ledger",
      route: null,
      message:
        "The ledger does not expose the governed Ticket 12 source shape.",
    });
  }

  validateScope(
    rawScope,
    supportingRoutes.length,
    industryRoutes.length,
    diagnostics,
  );

  if (mode === "actual") {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "production-execution-disabled",
      path: "mode",
      route: null,
      message:
        "Ticket 12 production execution is permanently unavailable; this artifact is preflight-only.",
    });
  } else if (mode === "fixture") {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "fixture-execution-forbidden",
      path: "mode",
      route: null,
      message:
        "Fixture artifacts can validate contract failures but can never authorize public mutation.",
    });
  }

  diagnostics.sort(diagnosticComparator);
  const hasErrors = diagnostics.some(({ severity }) => severity === "error");
  const contractReady =
    industryRoutes.length > 0 &&
    parentJourney !== null &&
    entries.length === supportingRoutes.length + industryRoutes.length &&
    articlePlans.length === entries.length &&
    !hasErrors;
  const status: ChinaSourcingOverlaysPreviewStatus =
    industryRoutes.length === 0
      ? "planned"
      : contractReady
        ? "ready"
        : "blocked";
  const industryRouteSet = new Set(industryRoutes);
  const industryOverlays = entries.filter(({ route }) =>
    industryRouteSet.has(route),
  );

  return deepFreeze({
    version: 1,
    ticket: CHINA_SOURCING_OVERLAYS_MIGRATION_TICKET,
    clusterId: CHINA_SOURCING_OVERLAYS_CLUSTER_ID,
    mode,
    ledgerDigest: computedDigest,
    status,
    contractReady,
    executable: false,
    diagnostics,
    parentJourney,
    scopeSplit: {
      supportingRoutes: sortCodePoints(supportingRoutes),
      industryOverlayRoutes: sortCodePoints(industryRoutes),
    },
    entries,
    industryOverlays,
    articlePlans,
    mutationCommands: [],
    governanceBinding,
  });
}

export const buildOverlaysMigrationPreview =
  buildChinaSourcingOverlaysMigrationPreview;
