import { clusterRegistry } from "../../../content/seo/clusters";
import { articleMigrationLedger } from "../../../content/seo/migration-ledger";
import type {
  ContentRole,
  EditorialStatus,
  FunnelStage,
  MigrationAction,
  TargetMarket,
} from "../articleSchema";
import {
  CANONICAL_CLUSTER_IDS,
  type ClusterId,
  type ClusterRegistry,
} from "../clusterSchema";
import {
  compareCodePoints,
  computeMigrationLedgerDigest,
  sortCodePoints,
  type MigrationLedger,
  type MigrationLedgerEntry,
  type MigrationLedgerReport,
  type MigrationSearchIntent,
} from "../migrationLedger";

export const GOVERNED_MIGRATION_CLUSTER_IDS = [
  "supplier-verification",
  "factory-audit",
  "quality-inspection",
  "factory-visits",
  "china-sourcing",
] as const satisfies readonly ClusterId[];

export type GovernedMigrationClusterId =
  (typeof GOVERNED_MIGRATION_CLUSTER_IDS)[number];
export type GovernedMigrationTicket = "07" | "08" | "09" | "10" | "11";

const TICKET_BY_CLUSTER: Readonly<
  Record<GovernedMigrationClusterId, GovernedMigrationTicket>
> = {
  "supplier-verification": "07",
  "factory-audit": "08",
  "quality-inspection": "09",
  "factory-visits": "10",
  "china-sourcing": "11",
};

export interface GovernedMigrationEntryContract {
  readonly contentId: string;
  readonly slug: string;
  readonly route: string;
  readonly contentRole: ContentRole;
  readonly searchIntent: MigrationSearchIntent;
  readonly funnelStage: FunnelStage;
  readonly targetMarket: TargetMarket;
  readonly requiredLinks: readonly string[];
  readonly migrationAction: MigrationAction;
}

export interface GovernedMigrationClusterContract {
  readonly ticket: GovernedMigrationTicket;
  readonly baselineCount: number;
  readonly baselineRoutes: readonly string[];
  readonly memberRoutes: readonly string[];
  readonly commercialRoot: string;
  readonly editorialPillar: string;
  readonly editorialPillarStatus: "existing-baseline" | "planned-new";
  readonly editorialPillarContentId: string | null;
  readonly integrationTicket: string | null;
  readonly entries: readonly GovernedMigrationEntryContract[];
}

/**
 * Derive the migration contract from the canonical registry and the governed
 * ledger. This is deliberately source-driven: routes, identities, roots, and
 * classification metadata are never guessed in this preview layer.
 */
export function deriveGovernedMigrationClusterContracts(
  registry: ClusterRegistry,
  ledger: MigrationLedger,
): Readonly<
  Record<GovernedMigrationClusterId, GovernedMigrationClusterContract>
> {
  const derived = {} as Record<
    GovernedMigrationClusterId,
    GovernedMigrationClusterContract
  >;

  for (const clusterId of CANONICAL_CLUSTER_IDS) {
    const registryCluster = registry.clusters.find(
      ({ id }) => id === clusterId,
    );
    const plan = ledger.clusterPlans.find(
      ({ cluster }) => cluster === clusterId,
    );
    if (!registryCluster || !plan) {
      throw new Error(`Canonical migration source is missing ${clusterId}.`);
    }
    if (registryCluster.commercialRoot !== plan.commercialRoot) {
      throw new Error(`Canonical commercial root drift for ${clusterId}.`);
    }

    const entries = ledger.entries
      .filter(({ classification }) => classification.cluster === clusterId)
      .sort((left, right) => compareCodePoints(left.route, right.route))
      .map((entry) => ({
        contentId: entry.contentId,
        slug: entry.slug,
        route: entry.route,
        contentRole: entry.classification.role,
        searchIntent: entry.classification.searchIntent,
        funnelStage: entry.classification.funnelStage,
        targetMarket: entry.classification.targetMarket,
        requiredLinks: sortCodePoints([...entry.requiredLinks]),
        migrationAction: entry.decision.action,
      }));

    derived[clusterId] = {
      ticket: TICKET_BY_CLUSTER[clusterId],
      baselineCount: plan.baselineCount,
      baselineRoutes: sortCodePoints([...plan.baselineRoutes]),
      memberRoutes: sortCodePoints([...plan.memberRoutes]),
      commercialRoot: registryCluster.commercialRoot,
      editorialPillar: plan.editorialPillar.route,
      editorialPillarStatus: plan.editorialPillar.status,
      editorialPillarContentId: plan.editorialPillar.contentId,
      integrationTicket: plan.editorialPillar.integrationTicket,
      entries,
    };
  }

  return deepFreeze(derived);
}

export const GOVERNED_MIGRATION_CLUSTER_CONTRACTS =
  deriveGovernedMigrationClusterContracts(
    clusterRegistry,
    articleMigrationLedger,
  );

export type EvidenceReadinessStatus = "gaps-visible" | "reviewed";

export interface MigrationArticleSnapshot {
  readonly contentId: string;
  readonly slug: string;
  readonly route: string;
  readonly canonicalRoute: string;
  readonly currentLinks: readonly string[];
  readonly frontmatter: {
    readonly author: string;
    readonly primaryKeyword: string;
    readonly secondaryKeywords: readonly string[];
    readonly editorialStatus: EditorialStatus;
    readonly evidenceIds: readonly string[];
    readonly firstPartyContributionId: string | null;
    readonly reviewedBy: string;
    readonly reviewedDate: string;
    readonly reviewDueDate: string;
  };
  readonly evidenceReadiness: {
    readonly status: EvidenceReadinessStatus;
    readonly methodologyRef: string | null;
    readonly claimBoundary: string | null;
  };
}

export type MigrationPreviewDiagnosticSeverity = "advisory" | "error";

export interface MigrationPreviewDiagnostic {
  readonly severity: MigrationPreviewDiagnosticSeverity;
  readonly code: string;
  readonly path: string;
  readonly route: string | null;
  readonly message: string;
}

export interface PlannedGovernedFrontmatter {
  readonly contentId: string;
  readonly cluster: GovernedMigrationClusterId;
  readonly contentRole: ContentRole;
  readonly searchIntent: MigrationSearchIntent;
  readonly funnelStage: FunnelStage;
  readonly primaryKeyword: string;
  readonly secondaryKeywords: readonly string[];
  readonly targetMarket: TargetMarket;
  readonly editorialStatus: EditorialStatus;
  readonly evidenceIds: readonly string[];
  readonly firstPartyContributionId: string | null;
  readonly commercialRoot: string;
  readonly editorialPillar: string;
  readonly requiredLinks: readonly string[];
  readonly reviewedBy: string;
  readonly reviewedDate: string;
  readonly reviewDueDate: string;
  readonly migrationAction: MigrationAction;
}

export interface ArticleMigrationPlan {
  readonly contentId: string;
  readonly slug: string;
  readonly route: string;
  readonly canonicalRoute: string;
  readonly contentRole: ContentRole;
  readonly preservedAuthor: string;
  readonly expectedLinks: readonly string[];
  readonly linksToAdd: readonly string[];
  readonly expectedFrontmatter: PlannedGovernedFrontmatter;
  readonly evidenceReadiness: MigrationArticleSnapshot["evidenceReadiness"];
}

export interface ArticleMutationCommand {
  readonly kind: "apply-governed-article-metadata";
  readonly contentId: string;
  readonly route: string;
  readonly preconditions: {
    readonly ledgerDigest: string;
    readonly expectedContentId: string;
    readonly expectedSlug: string;
    readonly expectedRoute: string;
    readonly expectedCanonicalRoute: string;
  };
  readonly mutation: {
    readonly frontmatter: PlannedGovernedFrontmatter;
    readonly ensureLinks: readonly string[];
    readonly routeChange: null;
    readonly canonicalChange: null;
  };
}

export interface MigrationPreviewScope {
  readonly bundleIds?: readonly string[] | null;
  readonly clusterIds?: readonly ClusterId[] | null;
  readonly articleCount?: number | null;
  readonly maxArticleCount?: number | null;
}

export interface MigrationPreviewGovernanceBinding {
  readonly origin: "production" | "fixture";
  readonly public: boolean;
  readonly releaseId: string;
  readonly artifactDigest: string;
  readonly rollbackArtifactDigest: string;
  readonly rollbackOwner: string;
  readonly rollbackTriggers: readonly string[];
  readonly rollbackSteps: readonly string[];
}

export interface ClusterMigrationPreviewInput {
  readonly ledger: MigrationLedger;
  readonly ledgerReport: MigrationLedgerReport;
  readonly clusterId: ClusterId;
  readonly articles: readonly MigrationArticleSnapshot[];
  readonly scope?: MigrationPreviewScope;
  readonly governanceBinding?: MigrationPreviewGovernanceBinding | null;
}

export interface ClusterMigrationPreview {
  readonly version: 1;
  readonly clusterId: ClusterId;
  readonly ticket: GovernedMigrationTicket | null;
  readonly ledgerDigest: string;
  readonly executable: boolean;
  readonly diagnostics: readonly MigrationPreviewDiagnostic[];
  readonly articlePlans: readonly ArticleMigrationPlan[];
  readonly mutationCommands: readonly ArticleMutationCommand[];
  readonly governanceBinding: MigrationPreviewGovernanceBinding | null;
}

const DESTRUCTIVE_ACTIONS = new Set<MigrationAction>([
  "merge",
  "redirect",
  "retire",
]);
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const nestedValue of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nestedValue);
  }

  return Object.freeze(value);
}

const STRICT_GOVERNED_MIGRATION_CLUSTER_IDS = [
  "quality-inspection",
  "factory-visits",
  "china-sourcing",
] as const satisfies readonly GovernedMigrationClusterId[];

function isGovernedMigrationClusterId(
  clusterId: ClusterId,
): clusterId is GovernedMigrationClusterId {
  return GOVERNED_MIGRATION_CLUSTER_IDS.some((value) => value === clusterId);
}

function isStrictGovernedMigrationClusterId(
  clusterId: GovernedMigrationClusterId,
): boolean {
  return STRICT_GOVERNED_MIGRATION_CLUSTER_IDS.some(
    (value) => value === clusterId,
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidIsoCalendarDate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
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
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

function sameStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function uniqueSorted(values: readonly string[]): string[] {
  return sortCodePoints([...new Set(values)]);
}

function diagnosticComparator(
  left: MigrationPreviewDiagnostic,
  right: MigrationPreviewDiagnostic,
): number {
  return (
    compareCodePoints(left.path, right.path) ||
    compareCodePoints(left.code, right.code) ||
    compareCodePoints(left.message, right.message) ||
    compareCodePoints(left.route ?? "", right.route ?? "")
  );
}

function addDiagnostic(
  diagnostics: MigrationPreviewDiagnostic[],
  diagnostic: MigrationPreviewDiagnostic,
): void {
  const key = `${diagnostic.severity}\u0000${diagnostic.code}\u0000${diagnostic.path}\u0000${diagnostic.route ?? ""}\u0000${diagnostic.message}`;
  const alreadyPresent = diagnostics.some(
    (candidate) =>
      `${candidate.severity}\u0000${candidate.code}\u0000${candidate.path}\u0000${candidate.route ?? ""}\u0000${candidate.message}` ===
      key,
  );
  if (!alreadyPresent) diagnostics.push(diagnostic);
}

function expectedLedgerRequiredLinks(
  entry: MigrationLedgerEntry,
  contract: GovernedMigrationClusterContract,
): string[] {
  return entry.classification.role === "pillar"
    ? [contract.commercialRoot]
    : uniqueSorted([contract.commercialRoot, contract.editorialPillar]);
}

function expectedBodyLinks(
  entry: MigrationLedgerEntry,
  memberRoutes: readonly string[],
  contract: GovernedMigrationClusterContract,
): string[] {
  return entry.classification.role === "pillar"
    ? uniqueSorted([contract.commercialRoot, ...memberRoutes])
    : uniqueSorted([contract.commercialRoot, contract.editorialPillar]);
}

function reportHasErrors(report: MigrationLedgerReport): boolean {
  return report.issues.some(({ severity }) => severity === "error");
}

function addScopeDiagnostic(
  diagnostics: MigrationPreviewDiagnostic[],
  code: string,
  path: string,
  message: string,
): void {
  addDiagnostic(diagnostics, {
    severity: "error",
    code,
    path,
    route: null,
    message,
  });
}

function validatePreviewScope(
  input: ClusterMigrationPreviewInput,
  diagnostics: MigrationPreviewDiagnostic[],
): void {
  const scope = input.scope;
  if (scope === null) {
    addScopeDiagnostic(
      diagnostics,
      "scope-invalid",
      "scope",
      "A null migration scope is unknown and cannot authorize execution.",
    );
    return;
  }
  if (!scope) return;

  const bundleIds = Array.isArray(scope.bundleIds) ? scope.bundleIds : [];
  if (new Set(bundleIds).size > 1) {
    addScopeDiagnostic(
      diagnostics,
      "scope-split-required",
      "scope.bundleIds",
      "A preview may cover only one migration bundle; split unrelated bundles before execution.",
    );
  }

  const clusterIds = Array.isArray(scope.clusterIds) ? scope.clusterIds : [];
  if (
    clusterIds.length !== 0 &&
    (clusterIds.length !== 1 || clusterIds[0] !== input.clusterId)
  ) {
    addScopeDiagnostic(
      diagnostics,
      "scope-split-required",
      "scope.clusterIds",
      "A preview may cover only the selected canonical cluster; split unrelated clusters before execution.",
    );
  }

  if (scope.articleCount === null) {
    addScopeDiagnostic(
      diagnostics,
      "scope-count-unknown",
      "scope.articleCount",
      "An explicit null article count is unknown, not zero, and cannot satisfy a migration scope contract.",
    );
  } else if (scope.articleCount !== undefined) {
    if (!Number.isInteger(scope.articleCount) || scope.articleCount < 0) {
      addScopeDiagnostic(
        diagnostics,
        "scope-count-invalid",
        "scope.articleCount",
        "Article count must be a non-negative integer or be omitted from the scope.",
      );
    } else if (scope.articleCount !== input.articles.length) {
      addScopeDiagnostic(
        diagnostics,
        "scope-count-mismatch",
        "scope.articleCount",
        "The declared article count must equal the supplied snapshot count exactly.",
      );
    }
  }

  if (scope.maxArticleCount === null) {
    addScopeDiagnostic(
      diagnostics,
      "scope-count-unknown",
      "scope.maxArticleCount",
      "An explicit null maximum is unknown and cannot be used as a safe scope limit.",
    );
  } else if (scope.maxArticleCount !== undefined) {
    if (!Number.isInteger(scope.maxArticleCount) || scope.maxArticleCount < 0) {
      addScopeDiagnostic(
        diagnostics,
        "scope-count-invalid",
        "scope.maxArticleCount",
        "Maximum article count must be a non-negative integer or be omitted from the scope.",
      );
    } else if (input.articles.length > scope.maxArticleCount) {
      addScopeDiagnostic(
        diagnostics,
        "scope-split-required",
        "scope.maxArticleCount",
        "The selected scope exceeds its maximum article count and must be split before execution.",
      );
    }
  }
}

function cloneGovernanceBinding(
  binding: MigrationPreviewGovernanceBinding | null | undefined,
): MigrationPreviewGovernanceBinding | null {
  if (
    binding === null ||
    binding === undefined ||
    typeof binding !== "object"
  ) {
    return null;
  }

  const candidate = binding as Partial<MigrationPreviewGovernanceBinding>;
  return {
    origin: candidate.origin as MigrationPreviewGovernanceBinding["origin"],
    public: candidate.public as boolean,
    releaseId: isNonEmptyString(candidate.releaseId) ? candidate.releaseId : "",
    artifactDigest: isNonEmptyString(candidate.artifactDigest)
      ? candidate.artifactDigest
      : "",
    rollbackArtifactDigest: isNonEmptyString(candidate.rollbackArtifactDigest)
      ? candidate.rollbackArtifactDigest
      : "",
    rollbackOwner: isNonEmptyString(candidate.rollbackOwner)
      ? candidate.rollbackOwner
      : "",
    rollbackTriggers: Array.isArray(candidate.rollbackTriggers)
      ? candidate.rollbackTriggers.map((value) => value as string)
      : [],
    rollbackSteps: Array.isArray(candidate.rollbackSteps)
      ? candidate.rollbackSteps.map((value) => value as string)
      : [],
  };
}

function addGovernanceBindingDiagnostics(
  input: ClusterMigrationPreviewInput,
  computedDigest: string,
  diagnostics: MigrationPreviewDiagnostic[],
): MigrationPreviewGovernanceBinding | null {
  const binding = cloneGovernanceBinding(input.governanceBinding);
  if (!binding) return null;

  if (binding.origin !== "production" && binding.origin !== "fixture") {
    addScopeDiagnostic(
      diagnostics,
      "governance-binding-invalid",
      "governanceBinding.origin",
      "Governance binding origin must be production or fixture.",
    );
  }
  if (typeof binding.public !== "boolean") {
    addScopeDiagnostic(
      diagnostics,
      "governance-binding-invalid",
      "governanceBinding.public",
      "Governance binding public state must be boolean.",
    );
  }
  if (!isNonEmptyString(binding.releaseId)) {
    addScopeDiagnostic(
      diagnostics,
      "release-binding-invalid",
      "governanceBinding.releaseId",
      "A non-empty release binding is required.",
    );
  }
  if (
    !DIGEST_PATTERN.test(binding.artifactDigest) ||
    binding.artifactDigest !== computedDigest
  ) {
    addScopeDiagnostic(
      diagnostics,
      "release-binding-digest-mismatch",
      "governanceBinding.artifactDigest",
      "The release artifact digest must be the computed canonical ledger digest.",
    );
  }
  if (
    !DIGEST_PATTERN.test(binding.rollbackArtifactDigest) ||
    binding.rollbackArtifactDigest !== computedDigest
  ) {
    addScopeDiagnostic(
      diagnostics,
      "rollback-binding-digest-mismatch",
      "governanceBinding.rollbackArtifactDigest",
      "The rollback artifact digest must match the same canonical ledger digest.",
    );
  }
  if (!isNonEmptyString(binding.rollbackOwner)) {
    addScopeDiagnostic(
      diagnostics,
      "rollback-binding-invalid",
      "governanceBinding.rollbackOwner",
      "Rollback ownership must name a responsible release owner.",
    );
  }
  if (
    binding.rollbackTriggers.length === 0 ||
    binding.rollbackTriggers.some((trigger) => !isNonEmptyString(trigger))
  ) {
    addScopeDiagnostic(
      diagnostics,
      "rollback-binding-invalid",
      "governanceBinding.rollbackTriggers",
      "Rollback triggers must contain explicit non-empty conditions.",
    );
  }
  if (
    binding.rollbackSteps.length === 0 ||
    binding.rollbackSteps.some((step) => !isNonEmptyString(step))
  ) {
    addScopeDiagnostic(
      diagnostics,
      "rollback-binding-invalid",
      "governanceBinding.rollbackSteps",
      "Rollback steps must contain explicit non-empty recovery actions.",
    );
  }
  if (binding.origin === "fixture" && binding.public) {
    addScopeDiagnostic(
      diagnostics,
      "fixture-public-forbidden",
      "governanceBinding.public",
      "Synthetic fixture evidence must never be marked public.",
    );
  }
  if (binding.origin === "fixture") {
    addScopeDiagnostic(
      diagnostics,
      "fixture-execution-forbidden",
      "governanceBinding.origin",
      "Synthetic fixture approvals may verify a contract but can never authorize execution.",
    );
  }

  return binding;
}

function sameEntryContract(
  entry: MigrationLedgerEntry,
  expected: GovernedMigrationEntryContract,
): boolean {
  return (
    entry.contentId === expected.contentId &&
    entry.slug === expected.slug &&
    entry.route === expected.route &&
    entry.classification.role === expected.contentRole &&
    entry.classification.searchIntent === expected.searchIntent &&
    entry.classification.funnelStage === expected.funnelStage &&
    entry.classification.targetMarket === expected.targetMarket &&
    sameStrings(uniqueSorted(entry.requiredLinks), expected.requiredLinks) &&
    entry.decision.action === expected.migrationAction
  );
}

function addLedgerGateDiagnostics(
  input: ClusterMigrationPreviewInput,
  computedDigest: string,
  diagnostics: MigrationPreviewDiagnostic[],
): void {
  const { ledger, ledgerReport } = input;

  if (ledgerReport.digest !== computedDigest) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-report-digest-mismatch",
      path: "ledgerReport.digest",
      route: null,
      message:
        "The supplied ledger report digest does not match the canonical ledger payload.",
    });
  }
  if (ledger.protection.expectedDigest !== computedDigest) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-protection-digest-mismatch",
      path: "ledger.protection.expectedDigest",
      route: null,
      message:
        "The ledger protection digest does not match the canonical ledger payload.",
    });
  }
  if (
    ledgerReport.locked &&
    (ledgerReport.status !== "valid" ||
      ledgerReport.digest !== computedDigest ||
      ledger.protection.expectedDigest !== computedDigest ||
      ledger.approval.approvalStatus !== "approved")
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-lock-contract-mismatch",
      path: "ledgerReport.locked",
      route: null,
      message:
        "A claimed lock is invalid unless status, approval, and both digests agree.",
    });
  }
  if (
    !ledgerReport.locked ||
    ledgerReport.status !== "valid" ||
    ledger.approval.approvalStatus !== "approved"
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-not-locked",
      path: "ledgerReport.locked",
      route: null,
      message:
        "Migration execution requires a human-approved, digest-locked ledger.",
    });
  }
  if (
    ledger.approval.approvalStatus === "approved" &&
    (!isNonEmptyString(ledger.approval.reviewer) ||
      !isNonEmptyString(ledger.approval.approvalDate) ||
      !isValidIsoCalendarDate(ledger.approval.approvalDate))
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-approval-metadata-invalid",
      path: "ledger.approval",
      route: null,
      message:
        "An approved ledger requires a named human reviewer and a valid approval date.",
    });
  }
  if (
    ledger.entries.some(
      ({ decision }) =>
        decision.reviewStatus !== "approved" ||
        !isNonEmptyString(decision.reviewer) ||
        !isNonEmptyString(decision.reviewedOn) ||
        !isValidIsoCalendarDate(decision.reviewedOn),
    )
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-entry-decisions-incomplete",
      path: "ledger.entries",
      route: null,
      message:
        "Every ledger entry decision must be human-approved with a valid review date before any cluster can execute.",
    });
  }
  if (
    ledger.cannibalisationReviews.length === 0 ||
    ledger.cannibalisationReviews.some(
      (review) =>
        review.analysisStatus !== "analysed" ||
        review.approvalStatus !== "approved" ||
        !isNonEmptyString(review.reviewer) ||
        !isNonEmptyString(review.reviewedOn) ||
        !isValidIsoCalendarDate(review.reviewedOn),
    )
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-cannibalisation-reviews-incomplete",
      path: "ledger.cannibalisationReviews",
      route: null,
      message:
        "Every cannibalisation review must be analysed and human-approved with a valid review date before execution.",
    });
  }
  if (reportHasErrors(ledgerReport)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "ledger-report-has-errors",
      path: "ledgerReport.issues",
      route: null,
      message:
        "Migration execution cannot proceed while the ledger report contains errors.",
    });
  }
}

function validateClusterLedgerContract(
  ledger: MigrationLedger,
  clusterId: GovernedMigrationClusterId,
  diagnostics: MigrationPreviewDiagnostic[],
): {
  readonly entries: readonly MigrationLedgerEntry[];
  readonly memberRoutes: readonly string[];
} {
  const contract = GOVERNED_MIGRATION_CLUSTER_CONTRACTS[clusterId];
  const plan = ledger.clusterPlans.find(({ cluster }) => cluster === clusterId);
  const entries = ledger.entries
    .filter(({ classification }) => classification.cluster === clusterId)
    .slice()
    .sort((left, right) => compareCodePoints(left.route, right.route));
  const actualRoutes = entries.map(({ route }) => route);
  const expectedByContentId = new Map(
    contract.entries.map((entry) => [entry.contentId, entry]),
  );

  for (const entry of entries) {
    const expected = expectedByContentId.get(entry.contentId);
    if (
      !expected ||
      entry.slug !== expected.slug ||
      entry.route !== expected.route
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "article-identity-mismatch",
        path: `ledger.entries.${entry.contentId}.identity`,
        route: entry.route,
        message:
          "Content ID, slug, and route must match the canonical registry-derived identity exactly.",
      });
    }
    if (
      !expected ||
      entry.classification.role !== expected.contentRole ||
      entry.classification.searchIntent !== expected.searchIntent ||
      entry.classification.funnelStage !== expected.funnelStage ||
      entry.classification.targetMarket !== expected.targetMarket ||
      entry.decision.action !== expected.migrationAction
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "cluster-entry-contract-mismatch",
        path: `ledger.entries.${entry.contentId}.classification`,
        route: entry.route,
        message:
          "Cluster identity, article role, intent, funnel, market, and action must match the frozen registry-derived entry contract.",
      });
    }

    const duplicateIdentity = entries.some(
      (candidate) =>
        candidate !== entry &&
        (candidate.contentId === entry.contentId ||
          candidate.route === entry.route ||
          candidate.slug === entry.slug),
    );
    if (duplicateIdentity) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "target-cluster-identity-duplicate",
        path: `ledger.entries.${entry.contentId}`,
        route: entry.route,
        message:
          "Content ID, slug, and route identities must be unique inside the target cluster.",
      });
    }

    const path = `ledger.entries.${entry.contentId}`;
    if (
      entry.decision.reviewStatus !== "approved" ||
      !isNonEmptyString(entry.decision.reviewer) ||
      !isNonEmptyString(entry.decision.reviewedOn) ||
      !isValidIsoCalendarDate(entry.decision.reviewedOn)
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "entry-decision-not-approved",
        path: `${path}.decision`,
        route: entry.route,
        message:
          "Every cluster entry decision requires an approved human reviewer and review date.",
      });
    }
    if (DESTRUCTIVE_ACTIONS.has(entry.decision.action)) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "destructive-action-forbidden",
        path: `${path}.decision.action`,
        route: entry.route,
        message:
          "Governed cluster previews forbid merge, redirect, and retire actions.",
      });
    }
    const expectedRequiredLinks = expectedLedgerRequiredLinks(entry, contract);
    if (!sameStrings(entry.requiredLinks, expectedRequiredLinks)) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "required-links-contract-mismatch",
        path: `${path}.requiredLinks`,
        route: entry.route,
        message:
          "Ledger requiredLinks must preserve both the commercial root and editorial-pillar contract.",
      });
    }

    const duplicateOutsideCluster = ledger.entries.some(
      (candidate) =>
        candidate.classification.cluster !== clusterId &&
        (candidate.contentId === entry.contentId ||
          candidate.route === entry.route ||
          candidate.slug === entry.slug),
    );
    if (duplicateOutsideCluster) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "cross-cluster-primary-assignment",
        path,
        route: entry.route,
        message:
          "A baseline article cannot be a primary member of more than one cluster.",
      });
    }
  }

  for (const expected of contract.entries) {
    const actual = entries.find(
      ({ contentId }) => contentId === expected.contentId,
    );
    if (!actual) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "cluster-entry-contract-mismatch",
        path: `ledger.entries.${expected.contentId}`,
        route: expected.route,
        message:
          "Every registry-derived baseline entry must remain represented in the target cluster.",
      });
    } else if (!sameEntryContract(actual, expected)) {
      // Identity, link, and destructive-action diagnostics above remain
      // independently actionable; this catches any remaining contract drift.
      if (
        actual.classification.role !== expected.contentRole ||
        actual.classification.searchIntent !== expected.searchIntent ||
        actual.classification.funnelStage !== expected.funnelStage ||
        actual.classification.targetMarket !== expected.targetMarket ||
        actual.decision.action !== expected.migrationAction
      ) {
        addDiagnostic(diagnostics, {
          severity: "error",
          code: "cluster-entry-contract-mismatch",
          path: `ledger.entries.${actual.contentId}.contract`,
          route: actual.route,
          message:
            "The target entry differs from the immutable registry-derived metadata contract.",
        });
      }
    }
  }

  if (entries.length !== contract.baselineCount) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "cluster-baseline-count-mismatch",
      path: `clusters.${clusterId}.baselineCount`,
      route: null,
      message: `Ticket ${contract.ticket} must preserve the exact frozen baseline count.`,
    });
    if (clusterId === "factory-audit") {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "factory-audit-baseline-count-mismatch",
        path: "clusters.factory-audit.baselineCount",
        route: null,
        message:
          "Factory Audit must contain exactly its single frozen baseline article.",
      });
    }
  }
  if (!sameStrings(actualRoutes, contract.baselineRoutes)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "frozen-baseline-membership-mismatch",
      path: `clusters.${clusterId}.baselineRoutes`,
      route: null,
      message: `Ticket ${contract.ticket} must preserve the exact frozen baseline route membership.`,
    });
  }

  const memberRoutes = entries
    .filter(({ classification }) => classification.role !== "pillar")
    .map(({ route }) => route);
  if (!sameStrings(memberRoutes, contract.memberRoutes)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "cluster-member-routes-mismatch",
      path: `clusters.${clusterId}.memberRoutes`,
      route: null,
      message:
        "The target cluster members must exactly match the registry-derived frozen membership.",
    });
  }

  if (!plan) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "cluster-plan-missing",
      path: `ledger.clusterPlans.${clusterId}`,
      route: null,
      message: `The ledger is missing the Ticket ${contract.ticket} cluster plan.`,
    });
  } else {
    if (plan.editorialPillar.approvalStatus !== "approved") {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "cluster-plan-not-approved",
        path: `ledger.clusterPlans.${clusterId}.editorialPillar.approvalStatus`,
        route: plan.editorialPillar.route,
        message:
          "The cluster pillar plan requires explicit human approval before execution.",
      });
    }

    const expectedPillarContentId = contract.editorialPillarContentId;
    const planContractMismatch =
      plan.commercialRoot !== contract.commercialRoot ||
      plan.editorialPillar.route !== contract.editorialPillar ||
      plan.baselineCount !== contract.baselineCount ||
      !sameStrings(plan.baselineRoutes, contract.baselineRoutes) ||
      !sameStrings(plan.memberRoutes, contract.memberRoutes);
    const existingPlanMismatch =
      contract.editorialPillarStatus === "existing-baseline" &&
      (plan.editorialPillar.status !== "existing-baseline" ||
        plan.editorialPillar.contentId !== expectedPillarContentId ||
        plan.editorialPillar.integrationTicket !== null);
    const plannedNewMismatch =
      contract.editorialPillarStatus === "planned-new" &&
      (plan.editorialPillar.status !== "planned-new" ||
        plan.editorialPillar.contentId !== null ||
        plan.editorialPillar.integrationTicket !== contract.integrationTicket ||
        plan.baselineCount !== 0 ||
        plan.baselineRoutes.length !== 0 ||
        plan.memberRoutes.length !== 0);

    if (planContractMismatch || existingPlanMismatch || plannedNewMismatch) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "cluster-plan-contract-mismatch",
        path: `ledger.clusterPlans.${clusterId}`,
        route: plan.editorialPillar.route,
        message:
          "The cluster plan does not match the frozen commercial root, pillar, count, route, membership, and integration contract.",
      });
    }

    if (contract.editorialPillarStatus === "planned-new") {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "planned-new-pillar-create-required",
        path: `ledger.clusterPlans.${clusterId}.editorialPillar`,
        route: contract.editorialPillar,
        message:
          "A planned-new pillar requires an explicit governed create action before any migration command can be emitted.",
      });
    }
  }

  const pillars = entries.filter(
    ({ classification }) => classification.role === "pillar",
  );
  if (contract.editorialPillarStatus === "existing-baseline") {
    if (
      pillars.length !== 1 ||
      pillars[0]?.route !== contract.editorialPillar
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "pillar-count-mismatch",
        path: `clusters.${clusterId}.pillar`,
        route: null,
        message:
          "The cluster must retain exactly one pillar at the frozen editorial pillar route.",
      });
    }
  } else if (pillars.length !== 0) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "pillar-count-mismatch",
      path: `clusters.${clusterId}.pillar`,
      route: null,
      message:
        "A planned-new pillar cannot be treated as an existing baseline article.",
    });
  }

  return { entries, memberRoutes };
}

function validateSnapshotReadiness(
  snapshot: MigrationArticleSnapshot,
  diagnostics: MigrationPreviewDiagnostic[],
  strictEvidence: boolean,
): void {
  const path = `articles.${snapshot.contentId}`;
  const { frontmatter, evidenceReadiness } = snapshot;

  if (strictEvidence && frontmatter.editorialStatus === "draft") {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "draft-evidence-forbidden",
      path: `${path}.frontmatter.editorialStatus`,
      route: snapshot.route,
      message:
        "Draft or fixture evidence cannot authorize a remaining-cluster migration preview.",
    });
  }

  if (
    evidenceReadiness.status !== "gaps-visible" &&
    evidenceReadiness.status !== "reviewed"
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "evidence-readiness-invalid",
      path: `${path}.evidenceReadiness.status`,
      route: snapshot.route,
      message:
        "Evidence readiness must be explicitly reviewed or gaps-visible.",
    });
  }

  if (!isNonEmptyString(frontmatter.author)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "author-missing",
      path: `${path}.frontmatter.author`,
      route: snapshot.route,
      message: "Migration requires a retained, non-empty article author.",
    });
  }
  if (!isNonEmptyString(frontmatter.primaryKeyword)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "primary-keyword-missing",
      path: `${path}.frontmatter.primaryKeyword`,
      route: snapshot.route,
      message: "Migration requires a non-empty primary keyword.",
    });
  }
  if (
    !isNonEmptyString(frontmatter.reviewedBy) ||
    !isValidIsoCalendarDate(frontmatter.reviewedDate) ||
    !isValidIsoCalendarDate(frontmatter.reviewDueDate) ||
    frontmatter.reviewDueDate < frontmatter.reviewedDate
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "article-review-contract-invalid",
      path: `${path}.frontmatter.review`,
      route: snapshot.route,
      message:
        "Reviewed by, review date, and a non-earlier review due date are required.",
    });
  }

  if (evidenceReadiness.status === "gaps-visible") {
    addDiagnostic(diagnostics, {
      severity: "advisory",
      code: "evidence-gap-visible",
      path: `${path}.evidenceReadiness.status`,
      route: snapshot.route,
      message:
        "Evidence gaps remain visible and must stay represented as draft content.",
    });
    if (frontmatter.editorialStatus !== "draft") {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "approved-status-without-reviewed-evidence",
        path: `${path}.frontmatter.editorialStatus`,
        route: snapshot.route,
        message:
          "Content with visible evidence gaps cannot claim evidence-reviewed or approved status.",
      });
    }
  }

  if (
    frontmatter.editorialStatus === "approved" &&
    (evidenceReadiness.status !== "reviewed" ||
      frontmatter.evidenceIds.length === 0)
  ) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "approved-status-without-reviewed-evidence",
      path: `${path}.frontmatter.editorialStatus`,
      route: snapshot.route,
      message:
        "Approved status requires reviewed evidence and at least one governed evidence ID.",
    });
  }

  if (!isNonEmptyString(evidenceReadiness.methodologyRef)) {
    addDiagnostic(diagnostics, {
      severity:
        strictEvidence || frontmatter.editorialStatus !== "draft"
          ? "error"
          : "advisory",
      code: "methodology-reference-missing",
      path: `${path}.evidenceReadiness.methodologyRef`,
      route: snapshot.route,
      message:
        "Methodology gaps must remain explicit until a governed reference is available.",
    });
  }
  if (!isNonEmptyString(evidenceReadiness.claimBoundary)) {
    addDiagnostic(diagnostics, {
      severity:
        strictEvidence || frontmatter.editorialStatus !== "draft"
          ? "error"
          : "advisory",
      code: "claim-boundary-missing",
      path: `${path}.evidenceReadiness.claimBoundary`,
      route: snapshot.route,
      message:
        "Claim boundaries must be documented before reviewed or approved status.",
    });
  }
}

function buildArticlePlans(
  entries: readonly MigrationLedgerEntry[],
  memberRoutes: readonly string[],
  articles: readonly MigrationArticleSnapshot[],
  clusterId: GovernedMigrationClusterId,
  diagnostics: MigrationPreviewDiagnostic[],
  strictEvidence: boolean,
): ArticleMigrationPlan[] {
  const contract = GOVERNED_MIGRATION_CLUSTER_CONTRACTS[clusterId];
  const snapshots = [...articles].sort((left, right) =>
    compareCodePoints(left.route, right.route),
  );
  const snapshotsByRoute = new Map<string, MigrationArticleSnapshot>();

  for (const snapshot of snapshots) {
    if (snapshotsByRoute.has(snapshot.route)) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "article-snapshot-duplicate",
        path: `articles.${snapshot.route}`,
        route: snapshot.route,
        message:
          "Each frozen route must have exactly one current article snapshot.",
      });
    } else {
      snapshotsByRoute.set(snapshot.route, snapshot);
    }
  }

  const expectedRoutes = new Set(contract.baselineRoutes);
  for (const route of contract.baselineRoutes) {
    if (!snapshotsByRoute.has(route)) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "article-snapshot-missing",
        path: `articles.${route}`,
        route,
        message: "The current snapshot is missing a frozen baseline article.",
      });
    }
  }
  for (const snapshot of snapshots) {
    if (!expectedRoutes.has(snapshot.route)) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "article-snapshot-unexpected",
        path: `articles.${snapshot.route}`,
        route: snapshot.route,
        message:
          "The current snapshot contains a route outside the frozen cluster baseline.",
      });
    }
  }

  const articlePlans: ArticleMigrationPlan[] = [];
  for (const entry of entries) {
    const snapshot = snapshotsByRoute.get(entry.route);
    if (!snapshot) continue;
    const path = `articles.${entry.contentId}`;

    if (
      snapshot.contentId !== entry.contentId ||
      snapshot.slug !== entry.slug ||
      snapshot.route !== entry.route
    ) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "article-identity-mismatch",
        path: `${path}.identity`,
        route: snapshot.route,
        message:
          "Content ID, slug, and route must match the locked ledger identity exactly.",
      });
    }
    if (snapshot.canonicalRoute !== entry.route) {
      addDiagnostic(diagnostics, {
        severity: "error",
        code: "canonical-route-drift",
        path: `${path}.canonicalRoute`,
        route: snapshot.route,
        message:
          "Canonical route drift is forbidden during governed cluster migration.",
      });
    }

    validateSnapshotReadiness(snapshot, diagnostics, strictEvidence);

    const links = expectedBodyLinks(entry, memberRoutes, contract);
    const currentLinks = uniqueSorted(snapshot.currentLinks);
    const expectedFrontmatter: PlannedGovernedFrontmatter = {
      contentId: entry.contentId,
      cluster: clusterId,
      contentRole: entry.classification.role,
      searchIntent: entry.classification.searchIntent,
      funnelStage: entry.classification.funnelStage,
      primaryKeyword: snapshot.frontmatter.primaryKeyword.trim(),
      secondaryKeywords: uniqueSorted(snapshot.frontmatter.secondaryKeywords),
      targetMarket: entry.classification.targetMarket,
      editorialStatus: snapshot.frontmatter.editorialStatus,
      evidenceIds: uniqueSorted(snapshot.frontmatter.evidenceIds),
      firstPartyContributionId: snapshot.frontmatter.firstPartyContributionId,
      commercialRoot: contract.commercialRoot,
      editorialPillar: contract.editorialPillar,
      requiredLinks: links,
      reviewedBy: snapshot.frontmatter.reviewedBy.trim(),
      reviewedDate: snapshot.frontmatter.reviewedDate,
      reviewDueDate: snapshot.frontmatter.reviewDueDate,
      migrationAction: entry.decision.action,
    };

    articlePlans.push({
      contentId: entry.contentId,
      slug: entry.slug,
      route: entry.route,
      canonicalRoute: snapshot.canonicalRoute,
      contentRole: entry.classification.role,
      preservedAuthor: snapshot.frontmatter.author.trim(),
      expectedLinks: links,
      linksToAdd: links.filter((link) => !currentLinks.includes(link)),
      expectedFrontmatter,
      evidenceReadiness: {
        status: snapshot.evidenceReadiness.status,
        methodologyRef: snapshot.evidenceReadiness.methodologyRef,
        claimBoundary: snapshot.evidenceReadiness.claimBoundary,
      },
    });
  }

  return articlePlans.sort((left, right) =>
    compareCodePoints(left.route, right.route),
  );
}

export function buildClusterMigrationPreview(
  input: ClusterMigrationPreviewInput,
): ClusterMigrationPreview {
  const diagnostics: MigrationPreviewDiagnostic[] = [];
  const computedDigest = computeMigrationLedgerDigest(input.ledger);
  const governanceBinding = addGovernanceBindingDiagnostics(
    input,
    computedDigest,
    diagnostics,
  );

  addLedgerGateDiagnostics(input, computedDigest, diagnostics);
  validatePreviewScope(input, diagnostics);

  if (!isGovernedMigrationClusterId(input.clusterId)) {
    addDiagnostic(diagnostics, {
      severity: "error",
      code: "unsupported-migration-cluster",
      path: "clusterId",
      route: null,
      message:
        "This preflight layer accepts only the five canonical migration clusters.",
    });
    diagnostics.sort(diagnosticComparator);
    return deepFreeze({
      version: 1,
      clusterId: input.clusterId,
      ticket: null,
      ledgerDigest: computedDigest,
      executable: false,
      diagnostics,
      articlePlans: [],
      mutationCommands: [],
      governanceBinding,
    });
  }

  const contract = GOVERNED_MIGRATION_CLUSTER_CONTRACTS[input.clusterId];
  const strictEvidence =
    isStrictGovernedMigrationClusterId(input.clusterId) ||
    governanceBinding !== null;
  if (
    isStrictGovernedMigrationClusterId(input.clusterId) &&
    governanceBinding === null
  ) {
    addScopeDiagnostic(
      diagnostics,
      "governance-binding-required",
      "governanceBinding",
      "Tickets 09–11 require an explicit production release and rollback binding before execution.",
    );
  }

  const { entries, memberRoutes } = validateClusterLedgerContract(
    input.ledger,
    input.clusterId,
    diagnostics,
  );
  const articlePlans = buildArticlePlans(
    entries,
    memberRoutes,
    input.articles,
    input.clusterId,
    diagnostics,
    strictEvidence,
  );

  diagnostics.sort(diagnosticComparator);
  const executable = !diagnostics.some(({ severity }) => severity === "error");
  const mutationCommands: ArticleMutationCommand[] = executable
    ? articlePlans.map((plan) => ({
        kind: "apply-governed-article-metadata",
        contentId: plan.contentId,
        route: plan.route,
        preconditions: {
          ledgerDigest: computedDigest,
          expectedContentId: plan.contentId,
          expectedSlug: plan.slug,
          expectedRoute: plan.route,
          expectedCanonicalRoute: plan.canonicalRoute,
        },
        mutation: {
          frontmatter: plan.expectedFrontmatter,
          ensureLinks: plan.expectedLinks,
          routeChange: null,
          canonicalChange: null,
        },
      }))
    : [];

  return deepFreeze({
    version: 1,
    clusterId: input.clusterId,
    ticket: contract.ticket,
    ledgerDigest: computedDigest,
    executable,
    diagnostics,
    articlePlans,
    mutationCommands,
    governanceBinding,
  });
}
