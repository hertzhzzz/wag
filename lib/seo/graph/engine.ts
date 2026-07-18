import { CANONICAL_CLUSTER_IDS } from "../clusterSchema";
import {
  canonicalizeGraphInput,
  compareCodePoints,
  digestGraphInput,
  parseGraphInput,
} from "./canonical";
import {
  GRAPH_RELATIONSHIP_TYPES,
  type GraphDiagnostic,
  type GraphDiagnosticCategory,
  type GraphDiagnosticCode,
  type GraphInput,
  type GraphNode,
  type GraphRecommendation,
  type GraphRecommendationResult,
  type GraphRelationship,
  type GraphRelationshipType,
  type RecommendationNextStep,
} from "./types";

const supportedRelationships = new Set<string>(GRAPH_RELATIONSHIP_TYPES);
const weakAnchors = new Set([
  "here",
  "click here",
  "read more",
  "learn more",
  "more details",
]);
const funnelOrder = [
  "problem-aware",
  "solution-aware",
  "evaluation",
  "decision",
  "post-purchase",
] as const;

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value))
    return value;
  Object.freeze(value);
  for (const child of Object.values(value as Record<string, unknown>))
    deepFreeze(child);
  return value;
}

function compareText(left: string, right: string): number {
  return compareCodePoints(left, right);
}

function compareIds(left: readonly string[], right: readonly string[]): number {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const result = compareText(left[index] ?? "", right[index] ?? "");
    if (result !== 0) return result;
  }
  return 0;
}

function sortNodes(nodes: readonly GraphNode[]): GraphNode[] {
  return [...nodes].sort((left, right) => compareText(left.id, right.id));
}

function sortRelationships(
  relationships: readonly GraphRelationship[],
): GraphRelationship[] {
  return [...relationships].sort(
    (left, right) =>
      left.priority - right.priority ||
      compareText(left.sourceId, right.sourceId) ||
      compareText(left.targetId, right.targetId) ||
      compareText(left.id, right.id),
  );
}

function isValidDestination(destination: string): boolean {
  if (destination.includes("?") || destination.includes("#")) return false;
  return /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(
    destination,
  );
}

function isLive(node: GraphNode | undefined): boolean {
  return Boolean(
    node && node.status === "published" && isValidDestination(node.destination),
  );
}

function funnelIndex(node: GraphNode): number {
  return funnelOrder.indexOf(node.funnelStage);
}

function addDiagnostic(
  diagnostics: Map<string, GraphDiagnostic>,
  diagnostic: GraphDiagnostic,
): void {
  const nodeIds = [...diagnostic.nodeIds].sort(compareText);
  const relationshipIds = [...diagnostic.relationshipIds].sort(compareText);
  const key = [
    diagnostic.code,
    diagnostic.severity,
    nodeIds.join(","),
    relationshipIds.join(","),
  ].join("|");
  if (!diagnostics.has(key)) {
    diagnostics.set(key, { ...diagnostic, nodeIds, relationshipIds });
  }
}

function diagnostic(
  code: GraphDiagnosticCode,
  severity: GraphDiagnostic["severity"],
  category: GraphDiagnosticCategory,
  message: string,
  remediation: string,
  nodeIds: readonly string[] = [],
  relationshipIds: readonly string[] = [],
): GraphDiagnostic {
  return {
    code,
    severity,
    category,
    nodeIds,
    relationshipIds,
    message,
    remediation,
  };
}

function nodeMap(nodes: readonly GraphNode[]): Map<string, GraphNode> {
  return new Map(sortNodes(nodes).map((node) => [node.id, node]));
}

function uniqueRelationships(
  relationships: readonly GraphRelationship[],
  diagnostics: Map<string, GraphDiagnostic>,
): GraphRelationship[] {
  const seen = new Map<string, GraphRelationship>();
  for (const relationship of sortRelationships(relationships)) {
    const previous = seen.get(relationship.id);
    if (previous) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "duplicate-relationship",
          "hard",
          "relationship",
          `Relationship "${relationship.id}" is declared more than once.`,
          "Keep one governed relationship record with a stable identifier.",
          [relationship.sourceId, relationship.targetId],
          [relationship.id],
        ),
      );
      continue;
    }
    seen.set(relationship.id, relationship);
  }
  return [...seen.values()];
}

function relationshipCandidates(
  graph: GraphInput,
  sourceId: string,
  diagnostics: Map<string, GraphDiagnostic>,
): Array<{
  relationship: GraphRelationship;
  source: GraphNode;
  target: GraphNode;
}> {
  const nodes = nodeMap(graph.nodes);
  const relationships = uniqueRelationships(graph.relationships, diagnostics);
  const candidates: Array<{
    relationship: GraphRelationship;
    source: GraphNode;
    target: GraphNode;
  }> = [];
  const targets = new Set<string>();

  for (const relationship of relationships) {
    if (relationship.sourceId !== sourceId) continue;
    const source = nodes.get(relationship.sourceId);
    const target = nodes.get(relationship.targetId);
    if (!source || !target) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "broken-relationship",
          "hard",
          "relationship",
          `Relationship "${relationship.id}" points to a missing node.`,
          "Remove the relationship or point it at a governed graph node.",
          [relationship.sourceId, relationship.targetId],
          [relationship.id],
        ),
      );
      continue;
    }
    if (relationship.sourceId === relationship.targetId) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "self-link",
          "hard",
          "relationship",
          `Relationship "${relationship.id}" links node "${source.id}" to itself.`,
          "Remove self-links from the governed relationship set.",
          [source.id],
          [relationship.id],
        ),
      );
      continue;
    }
    if (!supportedRelationships.has(relationship.type)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "unsupported-relationship",
          "hard",
          "relationship",
          `Relationship "${relationship.id}" uses unsupported type "${relationship.type}".`,
          `Use one of: ${GRAPH_RELATIONSHIP_TYPES.join(", ")}.`,
          [source.id, target.id],
          [relationship.id],
        ),
      );
      continue;
    }
    if (!isValidDestination(target.destination)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "invalid-destination",
          "hard",
          "destination",
          `Node "${target.id}" has an invalid internal destination.`,
          "Use a lowercase POSIX internal route without query strings, fragments, or external URLs.",
          [target.id],
          [relationship.id],
        ),
      );
      continue;
    }
    if (!isLive(target)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "non-live-destination",
          "hard",
          "destination",
          `Node "${target.id}" is not published and cannot be recommended.`,
          "Publish and approve the destination before adding it to recommendations.",
          [target.id],
          [relationship.id],
        ),
      );
      continue;
    }
    if (targets.has(target.id)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "duplicate-target",
          "hard",
          "relationship",
          `Source node "${source.id}" has more than one relationship to "${target.id}".`,
          "Keep one canonical relationship and anchor per source-target pair.",
          [source.id, target.id],
          [relationship.id],
        ),
      );
      continue;
    }
    targets.add(target.id);
    candidates.push({ relationship, source, target });
  }
  return candidates;
}

function recommendationNextStep(
  relationshipType: GraphRelationshipType | "fallback-same-cluster",
  target: GraphNode,
): RecommendationNextStep {
  if (
    target.nodeType === "service" ||
    target.nodeType === "root" ||
    relationshipType === "service-next-step"
  ) {
    return "relevant-service-path";
  }
  if (relationshipType === "evidence") return "evidence-support";
  if (relationshipType === "cluster-member") return "cluster-navigation";
  return "informational-sibling";
}

function generatedAnchor(target: GraphNode): string {
  return target.title.trim();
}

function buildExplicitRecommendation(candidate: {
  relationship: GraphRelationship;
  source: GraphNode;
  target: GraphNode;
}): GraphRecommendation {
  const relationshipType = candidate.relationship.type as GraphRelationshipType;
  return {
    sourceId: candidate.source.id,
    destinationId: candidate.target.id,
    destination: candidate.target.destination,
    relationshipType,
    source: "explicit",
    reason: `Explicit ${relationshipType} relationship in the governed graph.`,
    funnelDirection: candidate.relationship.funnelDirection,
    nextStep: recommendationNextStep(relationshipType, candidate.target),
    anchor: candidate.relationship.anchor ?? generatedAnchor(candidate.target),
    priority: candidate.relationship.priority,
  };
}

function buildFallbackRecommendations(
  graph: GraphInput,
  source: GraphNode,
): GraphRecommendation[] {
  const clusters = new Map(
    graph.clusters.map((cluster) => [cluster.id, cluster]),
  );
  const cluster = source.cluster ? clusters.get(source.cluster) : undefined;
  const nodes = nodeMap(graph.nodes);
  const candidates = sortNodes(graph.nodes)
    .filter((target) => target.id !== source.id && isLive(target))
    .filter(
      (target) =>
        source.cluster !== undefined && target.cluster === source.cluster,
    )
    .map((target) => {
      const sharedTopics = source.topics.filter((topic) =>
        target.topics.includes(topic),
      ).length;
      const sameIntent =
        source.intent !== undefined && source.intent === target.intent;
      const funnelDistance = funnelIndex(target) - funnelIndex(source);
      const score =
        (target.contentRole === "pillar" ? 500 : 0) +
        (sameIntent ? 100 : 0) +
        sharedTopics * 10 +
        (funnelDistance > 0 ? 5 : 0);
      return { target, score };
    });

  if (cluster?.rootId) {
    const root = nodes.get(cluster.rootId);
    if (
      root &&
      root.id !== source.id &&
      isLive(root) &&
      root.nodeType !== "article"
    ) {
      candidates.push({ target: root, score: 450 });
    }
  }

  const seen = new Set<string>();
  return candidates
    .sort(
      (left, right) =>
        right.score - left.score ||
        compareText(left.target.id, right.target.id),
    )
    .filter(({ target }) => {
      if (seen.has(target.id)) return false;
      seen.add(target.id);
      return true;
    })
    .slice(0, 8)
    .map(({ target, score }) => ({
      sourceId: source.id,
      destinationId: target.id,
      destination: target.destination,
      relationshipType: "fallback-same-cluster",
      source: "fallback",
      reason:
        "Deterministic fallback: same canonical cluster, then pillar/intent/topic/funnel affinity.",
      funnelDirection:
        funnelIndex(target) > funnelIndex(source) ? "forward" : "lateral",
      nextStep: recommendationNextStep("fallback-same-cluster", target),
      anchor: generatedAnchor(target),
      priority: 10_000 - score,
    }));
}

function diagnosticSort(left: GraphDiagnostic, right: GraphDiagnostic): number {
  return (
    compareText(left.severity, right.severity) ||
    compareText(left.category, right.category) ||
    compareText(left.code, right.code) ||
    compareIds(left.nodeIds, right.nodeIds) ||
    compareIds(left.relationshipIds, right.relationshipIds)
  );
}

export function diagnoseGraph(raw: GraphInput): readonly GraphDiagnostic[] {
  const graph = parseGraphInput(raw);
  const diagnostics = new Map<string, GraphDiagnostic>();
  const nodes = nodeMap(graph.nodes);

  if (graph.status === "blocked_no_live_graph") {
    addDiagnostic(
      diagnostics,
      diagnostic(
        "blocked-graph",
        "advisory",
        "contract",
        "Graph is explicitly blocked because no live graph observation is available.",
        "Keep recommendations in draft mode until a governed live graph baseline exists.",
      ),
    );
  }

  const duplicateNodeIds = new Set<string>();
  for (const node of graph.nodes) {
    if (duplicateNodeIds.has(node.id)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "duplicate-node",
          "hard",
          "contract",
          `Node "${node.id}" is declared more than once.`,
          "Keep one canonical node record per stable graph ID.",
          [node.id],
        ),
      );
    }
    duplicateNodeIds.add(node.id);
    if (!isValidDestination(node.destination)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "invalid-destination",
          "hard",
          "destination",
          `Node "${node.id}" has invalid destination "${node.destination}".`,
          "Use a lowercase POSIX internal route without query strings, fragments, or external URLs.",
          [node.id],
        ),
      );
    }
  }

  const relationships = uniqueRelationships(graph.relationships, diagnostics);
  const eligibleBySource = new Map<
    string,
    Array<{ relationship: GraphRelationship; target: GraphNode }>
  >();
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  const anchors = new Map<string, string[]>();
  const targetsBySource = new Map<string, Set<string>>();

  for (const relationship of relationships) {
    const source = nodes.get(relationship.sourceId);
    const target = nodes.get(relationship.targetId);
    if (!source || !target) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "broken-relationship",
          "hard",
          "relationship",
          `Relationship "${relationship.id}" points to a missing node.`,
          "Remove the relationship or point it at a governed graph node.",
          [relationship.sourceId, relationship.targetId],
          [relationship.id],
        ),
      );
      continue;
    }
    if (relationship.sourceId === relationship.targetId) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "self-link",
          "hard",
          "relationship",
          `Relationship "${relationship.id}" links node "${source.id}" to itself.`,
          "Remove self-links from the governed relationship set.",
          [source.id],
          [relationship.id],
        ),
      );
      continue;
    }
    if (!supportedRelationships.has(relationship.type)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "unsupported-relationship",
          "hard",
          "relationship",
          `Relationship "${relationship.id}" uses unsupported type "${relationship.type}".`,
          `Use one of: ${GRAPH_RELATIONSHIP_TYPES.join(", ")}.`,
          [source.id, target.id],
          [relationship.id],
        ),
      );
      continue;
    }
    if (!isValidDestination(source.destination)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "invalid-destination",
          "hard",
          "destination",
          `Source node "${source.id}" has an invalid destination.`,
          "Fix the source route before publishing graph relationships.",
          [source.id],
          [relationship.id],
        ),
      );
      continue;
    }
    if (!isValidDestination(target.destination)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "invalid-destination",
          "hard",
          "destination",
          `Target node "${target.id}" has an invalid destination.`,
          "Fix the target route before publishing graph relationships.",
          [target.id],
          [relationship.id],
        ),
      );
      continue;
    }
    if (!isLive(source) || !isLive(target)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "non-live-destination",
          "hard",
          "destination",
          `Relationship "${relationship.id}" includes a non-live node.`,
          "Only published nodes with valid internal destinations may participate in public recommendations.",
          [source.id, target.id],
          [relationship.id],
        ),
      );
      continue;
    }

    const targets = targetsBySource.get(source.id) ?? new Set<string>();
    if (targets.has(target.id)) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "duplicate-target",
          "hard",
          "relationship",
          `Source node "${source.id}" has duplicate target "${target.id}".`,
          "Keep one canonical relationship for each source-target pair.",
          [source.id, target.id],
          [relationship.id],
        ),
      );
      continue;
    }
    targets.add(target.id);
    targetsBySource.set(source.id, targets);
    outgoing.set(source.id, (outgoing.get(source.id) ?? 0) + 1);
    incoming.set(target.id, (incoming.get(target.id) ?? 0) + 1);
    const sourceRelationships = eligibleBySource.get(source.id) ?? [];
    sourceRelationships.push({ relationship, target });
    eligibleBySource.set(source.id, sourceRelationships);

    const anchor = relationship.anchor?.trim().toLowerCase();
    if (!anchor || weakAnchors.has(anchor) || anchor.length < 3) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "weak-anchor",
          "advisory",
          "anchor",
          `Relationship "${relationship.id}" uses a weak or missing anchor.`,
          "Use a concise, destination-specific anchor that describes the next page.",
          [source.id, target.id],
          [relationship.id],
        ),
      );
    }
    if (anchor)
      anchors.set(anchor, [...(anchors.get(anchor) ?? []), relationship.id]);
  }

  for (const [anchor, relationshipIds] of anchors) {
    if (relationshipIds.length > 1) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "repeated-anchor",
          "advisory",
          "anchor",
          `Anchor "${anchor}" is repeated across ${relationshipIds.length} relationships.`,
          "Review repeated anchors and make them specific to each destination where useful.",
          [],
          relationshipIds,
        ),
      );
    }
  }

  for (const node of sortNodes(graph.nodes)) {
    if (node.nodeType !== "article" || !isLive(node)) continue;
    if (
      (incoming.get(node.id) ?? 0) === 0 &&
      (outgoing.get(node.id) ?? 0) === 0
    ) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "orphan-risk",
          "advisory",
          "orphan",
          `Article node "${node.id}" has no live graph relationships.`,
          "Add a governed relationship to a pillar, sibling, evidence page, or relevant service path.",
          [node.id],
        ),
      );
    }
  }

  const clusters = new Map(
    graph.clusters.map((cluster) => [cluster.id, cluster]),
  );
  for (const clusterId of CANONICAL_CLUSTER_IDS) {
    const cluster = clusters.get(clusterId);
    if (!cluster) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "missing-pillar",
          "hard",
          "missing-pillar",
          `Canonical cluster "${clusterId}" has no graph configuration.`,
          "Provide explicit root and pillar IDs, or keep the graph blocked pending governed configuration.",
        ),
      );
      continue;
    }
    if (!cluster.rootId) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "missing-root",
          "hard",
          "root-connectivity",
          `Cluster "${clusterId}" has no declared root.`,
          "Declare a governed cluster root before enabling graph recommendations.",
        ),
      );
    } else {
      const root = nodes.get(cluster.rootId);
      if (!root) {
        addDiagnostic(
          diagnostics,
          diagnostic(
            "missing-root",
            "hard",
            "root-connectivity",
            `Cluster "${clusterId}" root "${cluster.rootId}" is missing.`,
            "Point the cluster at an existing governed root node.",
            [cluster.rootId],
          ),
        );
      } else if (!isLive(root)) {
        addDiagnostic(
          diagnostics,
          diagnostic(
            "root-not-live",
            "hard",
            "root-connectivity",
            `Cluster "${clusterId}" root "${root.id}" is not live.`,
            "Publish and validate the root before using it as a graph destination.",
            [root.id],
          ),
        );
      } else if (
        (incoming.get(root.id) ?? 0) + (outgoing.get(root.id) ?? 0) ===
        0
      ) {
        addDiagnostic(
          diagnostics,
          diagnostic(
            "root-not-connected",
            "advisory",
            "root-connectivity",
            `Cluster "${clusterId}" root "${root.id}" has no live relationship.`,
            "Connect the root to the pillar and relevant cluster content.",
            [root.id],
          ),
        );
      }
    }
    if (!cluster.pillarId) {
      addDiagnostic(
        diagnostics,
        diagnostic(
          "missing-pillar",
          "hard",
          "missing-pillar",
          `Cluster "${clusterId}" has no declared pillar.`,
          "Declare an approved pillar ID or keep the cluster in migration-pending state.",
        ),
      );
    } else {
      const pillar = nodes.get(cluster.pillarId);
      if (!pillar) {
        addDiagnostic(
          diagnostics,
          diagnostic(
            "missing-pillar",
            "hard",
            "missing-pillar",
            `Cluster "${clusterId}" pillar "${cluster.pillarId}" is missing.`,
            "Point the cluster at an existing governed pillar node.",
            [cluster.pillarId],
          ),
        );
      } else if (!isLive(pillar) || pillar.contentRole !== "pillar") {
        addDiagnostic(
          diagnostics,
          diagnostic(
            "pillar-not-live",
            "hard",
            "missing-pillar",
            `Cluster "${clusterId}" pillar "${pillar.id}" is not a live pillar.`,
            "Use a published node explicitly marked with the pillar content role.",
            [pillar.id],
          ),
        );
      } else if (
        (incoming.get(pillar.id) ?? 0) + (outgoing.get(pillar.id) ?? 0) ===
        0
      ) {
        addDiagnostic(
          diagnostics,
          diagnostic(
            "pillar-not-connected",
            "advisory",
            "missing-pillar",
            `Cluster "${clusterId}" pillar "${pillar.id}" is not connected.`,
            "Connect cluster members to the approved pillar.",
            [pillar.id],
          ),
        );
      }
    }
  }

  const articleNodes = sortNodes(graph.nodes).filter(
    (node) => node.nodeType === "article" && isLive(node),
  );
  for (let leftIndex = 0; leftIndex < articleNodes.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < articleNodes.length;
      rightIndex += 1
    ) {
      const left = articleNodes[leftIndex];
      const right = articleNodes[rightIndex];
      if (!left.cluster || left.cluster !== right.cluster) continue;
      const sameKeyword =
        left.primaryKeyword &&
        right.primaryKeyword &&
        left.primaryKeyword.trim().toLowerCase() ===
          right.primaryKeyword.trim().toLowerCase();
      const leftTopics = new Set(left.topics);
      const overlap = right.topics.filter((topic) =>
        leftTopics.has(topic),
      ).length;
      const comparable =
        Math.min(left.topics.length, right.topics.length) > 0 &&
        overlap / Math.min(left.topics.length, right.topics.length) >= 0.75;
      if (sameKeyword || comparable) {
        addDiagnostic(
          diagnostics,
          diagnostic(
            "cannibalisation-candidate",
            "advisory",
            "cannibalisation",
            `Article nodes "${left.id}" and "${right.id}" may target overlapping search intent.`,
            "Review primary keyword, funnel role, and canonical destination before merging or differentiating content.",
            [left.id, right.id],
          ),
        );
      }
    }
  }

  return deepFreeze([...diagnostics.values()].sort(diagnosticSort));
}

export function buildGraphRecommendations(
  raw: GraphInput,
  sourceId?: string,
  limit = 8,
): GraphRecommendationResult {
  const graph = parseGraphInput(raw);
  const diagnostics = [...diagnoseGraph(graph)];
  const diagnosticMap = new Map<string, GraphDiagnostic>();
  diagnostics.forEach((item) => addDiagnostic(diagnosticMap, item));
  const source = sourceId ? nodeMap(graph.nodes).get(sourceId) : undefined;
  let recommendations: GraphRecommendation[] = [];

  if (graph.status === "ready" && source && isLive(source)) {
    const explicit = relationshipCandidates(graph, source.id, diagnosticMap);
    recommendations =
      explicit.length > 0
        ? explicit.map(buildExplicitRecommendation)
        : buildFallbackRecommendations(graph, source);
    recommendations = recommendations
      .filter(
        (recommendation, index, all) =>
          recommendation.destinationId !== recommendation.sourceId &&
          all.findIndex(
            (item) => item.destinationId === recommendation.destinationId,
          ) === index,
      )
      .sort(
        (left, right) =>
          left.priority - right.priority ||
          compareText(left.destinationId, right.destinationId),
      )
      .slice(0, Math.max(0, Math.floor(limit)));
  }

  const result: GraphRecommendationResult = {
    sourceId: sourceId ?? null,
    graphDigest: digestGraphInput(graph),
    recommendations,
    diagnostics: [...diagnosticMap.values()].sort(diagnosticSort),
  };
  return deepFreeze(result);
}

export function renderGraphDiagnostics(
  raw: readonly GraphDiagnostic[],
): string {
  const diagnostics = [...raw].sort(diagnosticSort);
  const lines = [
    "# SEO Graph diagnostics",
    "",
    "| severity | code | category | nodes | relationships | message | remediation |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const item of diagnostics) {
    lines.push(
      `| ${item.severity} | ${item.code} | ${item.category} | ${item.nodeIds.join(", ") || "-"} | ${item.relationshipIds.join(", ") || "-"} | ${item.message} | ${item.remediation} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export { canonicalizeGraphInput, digestGraphInput, parseGraphInput };
