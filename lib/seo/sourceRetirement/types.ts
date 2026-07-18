import { z } from "zod";

import {
  urlDispositionPreflightReportSchema,
  type UrlDispositionPreflightReport,
} from "../urlDispositions";

export const SOURCE_RETIREMENT_SCHEMA_VERSION = 1 as const;
export const SOURCE_RETIREMENT_ARTIFACT_VERSION =
  "source-retirement-v1" as const;

export type SourceRetirementDigest = `sha256:${string}`;
export type SourceRetirementEvidenceOrigin = "production" | "fixture";
export type SourceRetirementSourceKind = "legacy" | "governed";
export type SourceRetirementArticleStatus =
  | "published"
  | "draft"
  | "blocked"
  | "redirected";
export type SourceRetirementParityStatus =
  | "equal"
  | "intentional_difference"
  | "different"
  | "unknown";

export interface SourceRetirementEvidence {
  readonly id: string;
  readonly origin: SourceRetirementEvidenceOrigin;
  readonly public: boolean;
  readonly source: string;
  readonly capturedAt: string;
  readonly digest: SourceRetirementDigest;
}

export interface SourceRetirementParity<T> {
  readonly status: SourceRetirementParityStatus;
  readonly legacy: T | null;
  readonly governed: T | null;
  readonly decisionId: string | null;
  readonly evidence: SourceRetirementEvidence | null;
}

export interface SourceRetirementArticleIdentity {
  readonly contentId: string;
  readonly slug: string;
  readonly route: string;
  readonly clusterId: string;
  readonly bundleId: string;
}

export interface SourceRetirementInventoryArticle extends SourceRetirementArticleIdentity {
  readonly sourceKind: SourceRetirementSourceKind;
  readonly sourceFamily: string;
  readonly contentDigest: SourceRetirementDigest;
  readonly identityDigest: SourceRetirementDigest;
  readonly status: SourceRetirementArticleStatus;
}

export interface SourceRetirementSourceInventory {
  readonly sourceKind: SourceRetirementSourceKind;
  readonly sourceFamily: string;
  readonly bundleId: string;
  readonly parserVersion: string;
  readonly readerVersion: string;
  readonly inventoryDigest: SourceRetirementDigest;
  readonly evidence: SourceRetirementEvidence | null;
  readonly articles: readonly SourceRetirementInventoryArticle[];
}

export interface SourceRetirementParserReadSnapshot {
  readonly parserVersion: string;
  readonly readerVersion: string;
  readonly readDigest: SourceRetirementDigest;
  readonly articleCount: number | null;
  readonly evidence: SourceRetirementEvidence | null;
}

export interface SourceRetirementParserParity {
  readonly status: SourceRetirementParityStatus;
  readonly legacy: SourceRetirementParserReadSnapshot | null;
  readonly governed: SourceRetirementParserReadSnapshot | null;
  readonly decisionId: string | null;
  readonly evidence: SourceRetirementEvidence | null;
}

export interface SourceRetirementGraphArticleParity {
  readonly articleId: string;
  readonly node: SourceRetirementParity<string>;
  readonly recommendations: SourceRetirementParity<readonly string[]>;
  readonly diagnostics: SourceRetirementParity<readonly string[]>;
}

export interface SourceRetirementGraphParity {
  readonly version: 1;
  readonly status: SourceRetirementParityStatus;
  readonly legacyDigest: SourceRetirementDigest | null;
  readonly governedDigest: SourceRetirementDigest | null;
  readonly articles: readonly SourceRetirementGraphArticleParity[];
  readonly decisionId: string | null;
  readonly evidence: SourceRetirementEvidence | null;
}

export interface SourceRetirementArticleParity {
  readonly articleId: string;
  readonly identity: SourceRetirementParity<SourceRetirementArticleIdentity>;
  readonly contentDigest: SourceRetirementParity<SourceRetirementDigest>;
  readonly route: SourceRetirementParity<string>;
  readonly canonical: SourceRetirementParity<string>;
  readonly sitemap: SourceRetirementParity<boolean>;
  readonly index: SourceRetirementParity<boolean>;
  readonly navigation: SourceRetirementParity<readonly string[]>;
  readonly recommendations: SourceRetirementParity<readonly string[]>;
  readonly diagnostics: SourceRetirementParity<readonly string[]>;
}

export interface SourceRetirementArtifact {
  readonly id: string;
  readonly version: string;
  readonly digest: SourceRetirementDigest;
}

export interface SourceRetirementScope {
  readonly sourceFamilies: readonly string[];
  readonly bundleIds: readonly string[];
  readonly articleIds: readonly string[];
}

export interface SourceRetirementMigrationLedger {
  readonly version: 1;
  readonly status: "approval-required" | "invalid" | "valid";
  readonly locked: boolean;
  readonly digest: string;
  readonly artifactDigest: SourceRetirementDigest | null;
  readonly evidence: SourceRetirementEvidence | null;
}

export interface SourceRetirementRollbackPlan {
  readonly id: string;
  readonly status: "ready" | "missing" | "unknown";
  readonly artifactDigest: SourceRetirementDigest | null;
  readonly sourceInventoryDigest: SourceRetirementDigest | null;
  readonly restoreTarget: string | null;
  readonly steps: readonly string[];
  readonly evidence: SourceRetirementEvidence | null;
}

export interface SourceRetirementApprovedDecision {
  readonly id: string;
  readonly artifactDigest: SourceRetirementDigest;
  readonly evidence: SourceRetirementEvidence | null;
  readonly rationale?: string;
}

export type SourceRetirementApprovalKind = "parity" | "content" | "production";

export interface SourceRetirementApproval {
  readonly kind: SourceRetirementApprovalKind;
  readonly actor: { readonly id: string; readonly type: "human" };
  readonly approvedAt: string;
  readonly artifactDigest: SourceRetirementDigest;
  readonly evidence: SourceRetirementEvidence | null;
}

export interface SourceRetirementInput {
  readonly version: 1;
  readonly asOf: string;
  readonly artifact: SourceRetirementArtifact;
  readonly scope: SourceRetirementScope;
  readonly legacy: SourceRetirementSourceInventory;
  readonly governed: SourceRetirementSourceInventory;
  readonly parserParity: SourceRetirementParserParity;
  readonly articles: readonly SourceRetirementArticleParity[];
  readonly graphParity: SourceRetirementGraphParity;
  readonly urlDisposition: UrlDispositionPreflightReport | null;
  readonly migrationLedger: SourceRetirementMigrationLedger | null;
  readonly rollback: SourceRetirementRollbackPlan | null;
  readonly approvedDecisions: readonly SourceRetirementApprovedDecision[];
  readonly approvals: readonly SourceRetirementApproval[];
}

export type SourceRetirementPreflightStatus =
  | "preview_ready"
  | "blocked"
  | "split_required";

export type SourceRetirementIssueCode =
  | "input_schema_invalid"
  | "dependency_missing"
  | "artifact_version_mismatch"
  | "artifact_digest_mismatch"
  | "invalid_as_of"
  | "scope_split_required"
  | "scope_inventory_mismatch"
  | "invalid_evidence"
  | "fixture_evidence_forbidden"
  | "production_evidence_future_dated"
  | "ledger_missing"
  | "ledger_not_valid"
  | "ledger_not_locked"
  | "ledger_artifact_mismatch"
  | "url_disposition_missing"
  | "url_disposition_not_ready"
  | "url_disposition_artifact_mismatch"
  | "url_disposition_execution_unsafe"
  | "rollback_missing"
  | "rollback_not_ready"
  | "rollback_artifact_mismatch"
  | "rollback_inventory_digest_mismatch"
  | "duplicate_article_identity"
  | "legacy_only_article"
  | "governed_only_article"
  | "missing_article_parity"
  | "duplicate_article_parity"
  | "article_identity_parity_unknown"
  | "article_identity_parity_mismatch"
  | "content_digest_parity_unknown"
  | "content_digest_parity_mismatch"
  | "route_parity_unknown"
  | "route_parity_mismatch"
  | "canonical_parity_unknown"
  | "canonical_parity_mismatch"
  | "sitemap_parity_unknown"
  | "sitemap_parity_mismatch"
  | "index_parity_unknown"
  | "index_parity_mismatch"
  | "navigation_parity_unknown"
  | "navigation_parity_mismatch"
  | "recommendation_parity_unknown"
  | "recommendation_parity_mismatch"
  | "diagnostics_parity_unknown"
  | "diagnostics_parity_mismatch"
  | "intentional_difference_unapproved"
  | "parser_parity_unknown"
  | "parser_parity_mismatch"
  | "graph_parity_missing"
  | "graph_parity_unknown"
  | "graph_drift"
  | "graph_node_parity_unknown"
  | "graph_node_parity_mismatch"
  | "graph_recommendation_parity_unknown"
  | "graph_recommendation_parity_mismatch"
  | "graph_diagnostics_parity_unknown"
  | "graph_diagnostics_parity_mismatch"
  | "source_inventory_digest_mismatch"
  | "approval_missing"
  | "approval_duplicate"
  | "approval_invalid"
  | "approval_not_independent"
  | "approval_artifact_mismatch"
  | "approval_time_invalid"
  | "approval_evidence_invalid"
  | "decision_missing"
  | "decision_artifact_mismatch"
  | "unsafe_execution_capability";

export type SourceRetirementPreflightIssueCode = SourceRetirementIssueCode;

export interface SourceRetirementPreflightIssue {
  readonly code: SourceRetirementIssueCode;
  readonly path: string;
  readonly message: string;
  readonly articleId: string | null;
}

export interface SourceRetirementPreflightReport {
  readonly version: 1;
  readonly asOf: string | null;
  readonly status: SourceRetirementPreflightStatus;
  readonly artifact: {
    readonly id: string | null;
    readonly version: string | null;
    readonly digest: SourceRetirementDigest | null;
  };
  readonly scope: {
    readonly sourceFamilies: readonly string[];
    readonly bundleIds: readonly string[];
    readonly articleIds: readonly string[];
    readonly splitRequired: boolean;
  };
  readonly blockers: readonly SourceRetirementPreflightIssue[];
  readonly parity: {
    readonly articlesExpected: number | null;
    readonly articlesCompared: number | null;
    readonly legacyOnly: number | null;
    readonly governedOnly: number | null;
    readonly duplicateIdentities: number | null;
    readonly unknownSlots: number | null;
    readonly intentionalDifferences: number | null;
  };
  readonly dependencies: {
    readonly urlDisposition: "ready" | "blocked" | "missing" | "mismatched";
    readonly migrationLedger:
      | "valid_locked"
      | "invalid"
      | "unlocked"
      | "missing"
      | "mismatched";
    readonly graph: "equal" | "different" | "unknown" | "missing";
    readonly rollback: "ready" | "blocked" | "missing";
  };
  readonly productionExecution: {
    readonly supported: false;
    readonly allowed: false;
    readonly reason: string;
  };
  readonly retirementExecution: {
    readonly supported: false;
    readonly allowed: false;
    readonly reason: string;
  };
  readonly reportDigest: SourceRetirementDigest;
}

const sourceRetirementDigestSchema = z
  .string()
  .regex(/^sha256:[a-f0-9]{64}$/, "Expected a lowercase sha256: digest.");
const sourceRetirementEvidenceSchema = z
  .object({
    id: z.string().min(1),
    origin: z.enum(["production", "fixture"]),
    public: z.boolean(),
    source: z.string().min(1),
    capturedAt: z.string().min(1),
    digest: sourceRetirementDigestSchema,
  })
  .strict();
const nullableSourceRetirementEvidenceSchema =
  sourceRetirementEvidenceSchema.nullable();
const sourceRetirementIdentitySchema = z
  .object({
    contentId: z.string().min(1),
    slug: z.string().min(1),
    route: z.string().min(1),
    clusterId: z.string().min(1),
    bundleId: z.string().min(1),
  })
  .strict();
const sourceRetirementParitySchema = (value: z.ZodTypeAny) =>
  z
    .object({
      status: z.enum([
        "equal",
        "intentional_difference",
        "different",
        "unknown",
      ]),
      legacy: value.nullable(),
      governed: value.nullable(),
      decisionId: z.string().min(1).nullable(),
      evidence: nullableSourceRetirementEvidenceSchema,
    })
    .strict();
const sourceRetirementInventoryArticleSchema = sourceRetirementIdentitySchema
  .extend({
    sourceKind: z.enum(["legacy", "governed"]),
    sourceFamily: z.string().min(1),
    contentDigest: sourceRetirementDigestSchema,
    identityDigest: sourceRetirementDigestSchema,
    status: z.enum(["published", "draft", "blocked", "redirected"]),
  })
  .strict();
const sourceRetirementInventorySchema = z
  .object({
    sourceKind: z.enum(["legacy", "governed"]),
    sourceFamily: z.string().min(1),
    bundleId: z.string().min(1),
    parserVersion: z.string().min(1),
    readerVersion: z.string().min(1),
    inventoryDigest: sourceRetirementDigestSchema,
    evidence: nullableSourceRetirementEvidenceSchema,
    articles: z.array(sourceRetirementInventoryArticleSchema),
  })
  .strict();
const sourceRetirementParserSnapshotSchema = z
  .object({
    parserVersion: z.string().min(1),
    readerVersion: z.string().min(1),
    readDigest: sourceRetirementDigestSchema,
    articleCount: z.number().int().nullable(),
    evidence: nullableSourceRetirementEvidenceSchema,
  })
  .strict();
const sourceRetirementArticleParitySchema = z
  .object({
    articleId: z.string().min(1),
    identity: sourceRetirementParitySchema(sourceRetirementIdentitySchema),
    contentDigest: sourceRetirementParitySchema(sourceRetirementDigestSchema),
    route: sourceRetirementParitySchema(z.string().min(1)),
    canonical: sourceRetirementParitySchema(z.string().min(1)),
    sitemap: sourceRetirementParitySchema(z.boolean()),
    index: sourceRetirementParitySchema(z.boolean()),
    navigation: sourceRetirementParitySchema(z.array(z.string().min(1))),
    recommendations: sourceRetirementParitySchema(z.array(z.string().min(1))),
    diagnostics: sourceRetirementParitySchema(z.array(z.string().min(1))),
  })
  .strict();
const sourceRetirementGraphArticleParitySchema = z
  .object({
    articleId: z.string().min(1),
    node: sourceRetirementParitySchema(z.string().min(1)),
    recommendations: sourceRetirementParitySchema(z.array(z.string().min(1))),
    diagnostics: sourceRetirementParitySchema(z.array(z.string().min(1))),
  })
  .strict();
const sourceRetirementGraphParitySchema = z
  .object({
    version: z.literal(1),
    status: z.enum(["equal", "intentional_difference", "different", "unknown"]),
    legacyDigest: sourceRetirementDigestSchema.nullable(),
    governedDigest: sourceRetirementDigestSchema.nullable(),
    articles: z.array(sourceRetirementGraphArticleParitySchema),
    decisionId: z.string().min(1).nullable(),
    evidence: nullableSourceRetirementEvidenceSchema,
  })
  .strict();
const sourceRetirementInputSchema = z
  .object({
    version: z.literal(1),
    asOf: z.string().min(1),
    artifact: z
      .object({
        id: z.string().min(1),
        version: z.string().min(1),
        digest: sourceRetirementDigestSchema,
      })
      .strict(),
    scope: z
      .object({
        sourceFamilies: z.array(z.string().min(1)),
        bundleIds: z.array(z.string().min(1)),
        articleIds: z.array(z.string().min(1)),
      })
      .strict(),
    legacy: sourceRetirementInventorySchema,
    governed: sourceRetirementInventorySchema,
    parserParity: z
      .object({
        status: z.enum([
          "equal",
          "intentional_difference",
          "different",
          "unknown",
        ]),
        legacy: sourceRetirementParserSnapshotSchema.nullable(),
        governed: sourceRetirementParserSnapshotSchema.nullable(),
        decisionId: z.string().min(1).nullable(),
        evidence: nullableSourceRetirementEvidenceSchema,
      })
      .strict(),
    articles: z.array(sourceRetirementArticleParitySchema),
    graphParity: sourceRetirementGraphParitySchema,
    urlDisposition: urlDispositionPreflightReportSchema.nullable(),
    migrationLedger: z
      .object({
        version: z.literal(1),
        status: z.enum(["approval-required", "invalid", "valid"]),
        locked: z.boolean(),
        digest: z.string().min(1),
        artifactDigest: sourceRetirementDigestSchema.nullable(),
        evidence: nullableSourceRetirementEvidenceSchema,
      })
      .strict()
      .nullable(),
    rollback: z
      .object({
        id: z.string().min(1),
        status: z.enum(["ready", "missing", "unknown"]),
        artifactDigest: sourceRetirementDigestSchema.nullable(),
        sourceInventoryDigest: sourceRetirementDigestSchema.nullable(),
        restoreTarget: z.string().min(1).nullable(),
        steps: z.array(z.string().min(1)),
        evidence: nullableSourceRetirementEvidenceSchema,
      })
      .strict()
      .nullable(),
    approvedDecisions: z.array(
      z
        .object({
          id: z.string().min(1),
          artifactDigest: sourceRetirementDigestSchema,
          evidence: nullableSourceRetirementEvidenceSchema,
          rationale: z.string().optional(),
        })
        .strict(),
    ),
    approvals: z.array(
      z
        .object({
          kind: z.enum(["parity", "content", "production"]),
          actor: z
            .object({ id: z.string().min(1), type: z.literal("human") })
            .strict(),
          approvedAt: z.string().min(1),
          artifactDigest: sourceRetirementDigestSchema,
          evidence: nullableSourceRetirementEvidenceSchema,
        })
        .strict(),
    ),
  })
  .strict();

export const sourceRetirementInputContractSchema = sourceRetirementInputSchema;

const sourceRetirementPreflightIssueSchema = z
  .object({
    code: z.string().min(1),
    path: z.string().min(1),
    message: z.string().min(1),
    articleId: z.string().min(1).nullable(),
  })
  .strict();

export const sourceRetirementPreflightReportSchema = z
  .object({
    version: z.literal(SOURCE_RETIREMENT_SCHEMA_VERSION),
    asOf: z.string().min(1).nullable(),
    status: z.enum(["preview_ready", "blocked", "split_required"]),
    artifact: z
      .object({
        id: z.string().min(1).nullable(),
        version: z.string().min(1).nullable(),
        digest: sourceRetirementDigestSchema.nullable(),
      })
      .strict(),
    scope: z
      .object({
        sourceFamilies: z.array(z.string().min(1)),
        bundleIds: z.array(z.string().min(1)),
        articleIds: z.array(z.string().min(1)),
        splitRequired: z.boolean(),
      })
      .strict(),
    blockers: z.array(sourceRetirementPreflightIssueSchema),
    parity: z
      .object({
        articlesExpected: z.number().int().nonnegative().nullable(),
        articlesCompared: z.number().int().nonnegative().nullable(),
        legacyOnly: z.number().int().nonnegative().nullable(),
        governedOnly: z.number().int().nonnegative().nullable(),
        duplicateIdentities: z.number().int().nonnegative().nullable(),
        unknownSlots: z.number().int().nonnegative().nullable(),
        intentionalDifferences: z.number().int().nonnegative().nullable(),
      })
      .strict(),
    dependencies: z
      .object({
        urlDisposition: z.enum(["ready", "blocked", "missing", "mismatched"]),
        migrationLedger: z.enum([
          "valid_locked",
          "invalid",
          "unlocked",
          "missing",
          "mismatched",
        ]),
        graph: z.enum(["equal", "different", "unknown", "missing"]),
        rollback: z.enum(["ready", "blocked", "missing"]),
      })
      .strict(),
    productionExecution: z
      .object({
        supported: z.literal(false),
        allowed: z.literal(false),
        reason: z.string().min(1),
      })
      .strict(),
    retirementExecution: z
      .object({
        supported: z.literal(false),
        allowed: z.literal(false),
        reason: z.string().min(1),
      })
      .strict(),
    reportDigest: sourceRetirementDigestSchema,
  })
  .strict();
