import type { Sha256Digest, ReleaseWorkflow } from "../release/releaseContract";
import type { GraphInput } from "../graph/types";
import type {
  MigrationLedger,
  MigrationLedgerReport,
} from "../migrationLedger";
import type { ClusterMigrationPreview } from "../migrations/clusterMigrationPreview";
import type { ChinaSourcingOverlaysMigrationPreview } from "../migrations/overlaysMigrationPreview";
import type { SeoArtifactName } from "../generation/types";

export const STRICT_GOVERNANCE_CUTOVER_TICKET = "13" as const;
export const STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE = "2026-07-18" as const;
export const STRICT_GOVERNANCE_CUTOVER_VERSION = 1 as const;

export const STRICT_CUTOVER_MODES = ["preview", "dry-run", "actual"] as const;
export const STRICT_CUTOVER_SCAFFOLD_MODES = ["preview", "dry-run"] as const;
export type StrictCutoverScaffoldMode =
  (typeof STRICT_CUTOVER_SCAFFOLD_MODES)[number];
export type StrictCutoverMode = (typeof STRICT_CUTOVER_MODES)[number];

export const STRICT_CUTOVER_ORIGINS = [
  "production",
  "synthetic_fixture",
] as const;
export type StrictCutoverOrigin = (typeof STRICT_CUTOVER_ORIGINS)[number];

export interface StrictGovernanceGraphEnvelope {
  readonly origin: StrictCutoverOrigin;
  readonly public: boolean;
  readonly deterministic: true;
  readonly generatedAt: string;
  readonly inputDigest: string;
  readonly input: GraphInput;
}

export interface StrictGovernanceGeneratedArtifact {
  readonly name: SeoArtifactName;
  readonly content: string;
  readonly digest: Sha256Digest;
  readonly sourceDigest: Sha256Digest;
  readonly generatedAt: string;
  readonly deterministic: true;
}

export interface StrictGovernanceGraphCutoverInput {
  readonly asOf: typeof STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE;
  readonly mode: StrictCutoverMode;
  readonly origin: StrictCutoverOrigin;
  readonly public: boolean;
  readonly ledger: MigrationLedger;
  readonly ledgerReport: MigrationLedgerReport;
  readonly clusterPreviews: readonly ClusterMigrationPreview[];
  readonly overlaysPreview: ChinaSourcingOverlaysMigrationPreview;
  readonly graph: StrictGovernanceGraphEnvelope;
  readonly generatedArtifacts: readonly StrictGovernanceGeneratedArtifact[];
  readonly releaseWorkflow?: ReleaseWorkflow | null;
}

export type StrictCutoverDiagnosticSeverity = "error" | "advisory";

export interface StrictCutoverDiagnostic {
  readonly severity: StrictCutoverDiagnosticSeverity;
  readonly code: string;
  readonly path: string;
  readonly message: string;
}

export interface StrictCutoverLineage {
  readonly ticket: typeof STRICT_GOVERNANCE_CUTOVER_TICKET;
  readonly asOf: typeof STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE;
  readonly ledgerDigest: string;
  readonly ticket07To11PreviewDigests: Readonly<
    Record<"07" | "08" | "09" | "10" | "11", Sha256Digest>
  >;
  readonly overlaysPreviewDigest: Sha256Digest;
  readonly graphDigest: string;
  readonly sourceDigest: Sha256Digest;
  readonly artifactSetDigest: Sha256Digest;
  readonly cutoverDigest: Sha256Digest;
}

export interface StrictGovernanceGraphCutoverResult {
  readonly version: typeof STRICT_GOVERNANCE_CUTOVER_VERSION;
  readonly ticket: typeof STRICT_GOVERNANCE_CUTOVER_TICKET;
  readonly mode: StrictCutoverMode;
  readonly origin: StrictCutoverOrigin;
  readonly public: boolean;
  readonly asOfDate: typeof STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE;
  readonly status: "scaffold-ready" | "blocked";
  readonly strict: true;
  readonly executable: false;
  readonly diagnostics: readonly StrictCutoverDiagnostic[];
  readonly commands: readonly [];
  readonly articleCount: number;
  readonly orphanArticleCount: number;
  readonly brokenRelationshipCount: number;
  readonly pillarCount: number;
  readonly lineage: StrictCutoverLineage | null;
  readonly rollback: null;
  readonly compatibilityFallback: false;
}

export interface StrictGovernanceGraphCutoverDependency {
  readonly ticket: typeof STRICT_GOVERNANCE_CUTOVER_TICKET;
  readonly status: "scaffold-ready";
  readonly asOf: typeof STRICT_GOVERNANCE_CUTOVER_AS_OF_DATE;
  readonly mode: StrictCutoverScaffoldMode;
  readonly executable: false;
  readonly commands: readonly [];
  readonly migrationLedgerDigest: string;
  readonly ticket07To11PreviewDigests: Readonly<
    Record<"07" | "08" | "09" | "10" | "11", Sha256Digest>
  >;
  readonly ticket12OverlayDigest: Sha256Digest;
  readonly graphDigest: string;
  readonly artifactSetDigest: Sha256Digest;
  readonly cutoverDigest: Sha256Digest;
  readonly dependencyDigest: Sha256Digest;
}

export interface StrictCutoverSourceDigestInput {
  readonly ledgerDigest: string;
  readonly clusterPreviews: readonly ClusterMigrationPreview[];
  readonly overlaysPreview: ChinaSourcingOverlaysMigrationPreview;
  readonly graphDigest: string;
}
