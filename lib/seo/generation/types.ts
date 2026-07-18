export const SEO_GOVERNANCE_PROTOCOL_VERSION = 1 as const;
export const SEO_GENERATED_RELATIVE_DIR = "generated/seo" as const;

export const SEO_ARTIFACT_NAMES = [
  "articles.json",
  "clusters.json",
  "link-graph.json",
  "freshness.json",
] as const;

export type SeoArtifactName = (typeof SEO_ARTIFACT_NAMES)[number];
export type SeoValidationMode = "compatibility" | "strict";
export type SeoStrictScope = "migrated" | "all";
export type SeoGovernanceOperation = "check" | "write";
export type SeoReportFormat = "human" | "json";

export type SeoHardFailureCategory =
  | "artifact"
  | "duplicate-identity"
  | "evidence"
  | "graph"
  | "schema"
  | "unsafe-disclosure";

export type SeoAdvisoryCategory =
  | "compatibility"
  | "content-quality"
  | "migration";

export interface SeoGovernanceIssue<Category extends string = string> {
  category: Category;
  code: string;
  subject: string;
  message: string;
}

export interface SeoGovernanceValidation {
  status: "passed" | "failed";
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[];
  advisoryWarnings: SeoGovernanceIssue<SeoAdvisoryCategory>[];
}

export interface SeoBaselineIdentity {
  contentId: string;
  slug: string;
  route: string;
}

export interface SeoBaselineDuplicate {
  field: "identity" | "contentId" | "slug" | "route";
  value: string;
  occurrences: number;
}

export interface SeoBaselineReport {
  status: "exact" | "mismatch";
  expectedCount: number;
  actualCount: number;
  /** Backward-compatible alias for the exact expected baseline identities. */
  identities: SeoBaselineIdentity[];
  expected: SeoBaselineIdentity[];
  actual: SeoBaselineIdentity[];
  missing: SeoBaselineIdentity[];
  unexpected: SeoBaselineIdentity[];
  duplicates: SeoBaselineDuplicate[];
}

export interface SeoCompatibilityArticleReport extends SeoBaselineIdentity {
  migrated: boolean;
  mode: "governed" | "compatibility";
  missingGovernedFields: string[];
  warningCodes: string[];
}

export interface SeoCompatibilityReport {
  articleCount: number;
  governedArticleCount: number;
  compatibilityArticleCount: number;
  strictArticleCount: number;
  baseline: SeoBaselineReport;
  articles: SeoCompatibilityArticleReport[];
}

export interface SeoGovernanceBuildOptions {
  /** Required core API boundary. Only the CLI may discover a project root. */
  rootDir: string;
  blogDir?: string;
  evidenceRegistryPath?: string;
  evidenceRegistrySource?: string;
  evidenceClaimsDir?: string;
  evidenceReviewsDir?: string;
  clusterRegistryInput?: unknown;
  baselineCohort?: readonly SeoBaselineIdentity[];
  mode: SeoValidationMode;
  strictScope?: SeoStrictScope;
  asOfDate: string;
}

export interface SeoGovernanceBuildResult {
  protocolVersion: typeof SEO_GOVERNANCE_PROTOCOL_VERSION;
  mode: SeoValidationMode;
  strictScope: SeoStrictScope;
  asOfDate: string;
  artifacts: Readonly<Record<SeoArtifactName, string>>;
  compatibilityReport: SeoCompatibilityReport;
  validation: SeoGovernanceValidation;
}

export type SeoWriteFailpoint =
  | "after-stage"
  | "after-backup"
  | "after-promote";

export interface SeoGovernanceRunOptions extends SeoGovernanceBuildOptions {
  /** False/omitted is a read-only check. True requests a four-file transaction. */
  write?: boolean;
  /** Test seam for proving rollback after staged rename failures. */
  writeFailpoint?: SeoWriteFailpoint;
}

export interface SeoArtifactCheck {
  name: string;
  status: "current" | "missing" | "modified" | "unexpected" | "written";
}

export interface SeoGovernanceRunResult extends SeoGovernanceBuildResult {
  operation: SeoGovernanceOperation;
  artifactDirectory: typeof SEO_GENERATED_RELATIVE_DIR;
  artifactChecks: SeoArtifactCheck[];
}

export interface SeoGovernancePublicReport {
  protocolVersion: typeof SEO_GOVERNANCE_PROTOCOL_VERSION;
  operation: SeoGovernanceOperation;
  mode: SeoValidationMode;
  strictScope: SeoStrictScope;
  asOfDate: string;
  status: "passed" | "failed";
  artifactDirectory: typeof SEO_GENERATED_RELATIVE_DIR;
  artifactChecks: SeoArtifactCheck[];
  compatibility: SeoCompatibilityReport;
  hardFailures: SeoGovernanceIssue<SeoHardFailureCategory>[];
  advisoryWarnings: SeoGovernanceIssue<SeoAdvisoryCategory>[];
}
