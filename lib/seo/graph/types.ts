import { z } from "zod";

import {
  CANONICAL_CLUSTER_IDS,
  CONTENT_ROLES,
  FUNNEL_STAGES,
  contentRoleSchema,
  funnelStageSchema,
  type ClusterId,
} from "../clusterSchema";

export const GRAPH_SCHEMA_VERSION = 1 as const;
export const GRAPH_RELATIONSHIP_TYPES = [
  "supports",
  "related",
  "sibling",
  "comparison",
  "evidence",
  "service-next-step",
  "cluster-member",
] as const;
export type GraphRelationshipType = (typeof GRAPH_RELATIONSHIP_TYPES)[number];
export type GraphStatus = "ready" | "blocked_no_live_graph";
export type GraphNodeType = "article" | "service" | "root";
export type GraphNodeStatus =
  | "published"
  | "draft"
  | "blocked"
  | "redirected"
  | "invalid";
export type FunnelDirection = "forward" | "backward" | "lateral";
export type RecommendationSource = "explicit" | "fallback";
export type RecommendationNextStep =
  | "informational-sibling"
  | "relevant-service-path"
  | "evidence-support"
  | "cluster-navigation";
export type GraphDiagnosticSeverity = "hard" | "advisory";
export type GraphDiagnosticCategory =
  | "contract"
  | "relationship"
  | "destination"
  | "orphan"
  | "root-connectivity"
  | "missing-pillar"
  | "anchor"
  | "cannibalisation";

const machineId = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Expected a lowercase machine ID.");
const nonEmpty = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();
const nodeTypeSchema = z.enum(["article", "service", "root"]);
const nodeStatusSchema = z.enum([
  "published",
  "draft",
  "blocked",
  "redirected",
  "invalid",
]);
const funnelDirectionSchema = z.enum(["forward", "backward", "lateral"]);

export const graphNodeSchema = z
  .object({
    id: machineId,
    nodeType: nodeTypeSchema,
    title: nonEmpty,
    destination: nonEmpty,
    status: nodeStatusSchema,
    cluster: z.enum(CANONICAL_CLUSTER_IDS).optional(),
    contentRole: contentRoleSchema.optional(),
    funnelStage: funnelStageSchema,
    intent: optionalText,
    primaryKeyword: optionalText,
    topics: z.array(nonEmpty).max(50).default([]),
  })
  .strict();

export const graphRelationshipSchema = z
  .object({
    id: machineId,
    sourceId: machineId,
    targetId: machineId,
    type: nonEmpty,
    anchor: optionalText,
    funnelDirection: funnelDirectionSchema,
    priority: z.number().int().min(0).max(100_000),
  })
  .strict();

export const graphClusterSchema = z
  .object({
    id: z.enum(CANONICAL_CLUSTER_IDS),
    rootId: machineId.nullable(),
    pillarId: machineId.nullable(),
  })
  .strict();

export const graphInputSchema = z
  .object({
    version: z.literal(GRAPH_SCHEMA_VERSION),
    status: z.enum(["ready", "blocked_no_live_graph"]),
    clusters: z.array(graphClusterSchema).max(CANONICAL_CLUSTER_IDS.length),
    nodes: z.array(graphNodeSchema),
    relationships: z.array(graphRelationshipSchema),
  })
  .strict();

export type GraphNode = z.infer<typeof graphNodeSchema>;
export type GraphRelationship = z.infer<typeof graphRelationshipSchema>;
export type GraphCluster = z.infer<typeof graphClusterSchema>;
export type GraphInput = z.infer<typeof graphInputSchema>;

export interface GraphRecommendation {
  sourceId: string;
  destinationId: string;
  destination: string;
  relationshipType: GraphRelationshipType | "fallback-same-cluster";
  source: RecommendationSource;
  reason: string;
  funnelDirection: FunnelDirection;
  nextStep: RecommendationNextStep;
  anchor: string;
  priority: number;
}

export type GraphDiagnosticCode =
  | "duplicate-node"
  | "duplicate-relationship"
  | "self-link"
  | "broken-relationship"
  | "unsupported-relationship"
  | "invalid-destination"
  | "non-live-destination"
  | "duplicate-target"
  | "orphan-risk"
  | "missing-root"
  | "root-not-live"
  | "root-not-connected"
  | "missing-pillar"
  | "pillar-not-live"
  | "pillar-not-connected"
  | "weak-anchor"
  | "repeated-anchor"
  | "cannibalisation-candidate"
  | "blocked-graph";

export interface GraphDiagnostic {
  code: GraphDiagnosticCode;
  severity: GraphDiagnosticSeverity;
  category: GraphDiagnosticCategory;
  nodeIds: readonly string[];
  relationshipIds: readonly string[];
  message: string;
  remediation: string;
}

export interface GraphRecommendationResult {
  sourceId: string | null;
  graphDigest: string;
  recommendations: readonly GraphRecommendation[];
  diagnostics: readonly GraphDiagnostic[];
}

export class GraphContractError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid SEO graph input: ${issues.join("; ")}`);
    this.name = "GraphContractError";
    this.issues = issues;
  }
}

export type CanonicalCluster = ClusterId;
export type GraphContentRole = (typeof CONTENT_ROLES)[number];
export type GraphFunnelStage = (typeof FUNNEL_STAGES)[number];
