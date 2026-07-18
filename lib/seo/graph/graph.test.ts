import {
  buildGraphRecommendations,
  canonicalizeGraphInput,
  diagnoseGraph,
  digestGraphInput,
  parseGraphInput,
  renderGraphDiagnostics,
  type GraphInput,
} from "./index";

function node(overrides: Partial<GraphInput["nodes"][number]> = {}) {
  return {
    id: "article-a",
    nodeType: "article" as const,
    title: "Supplier verification basics",
    destination: "/article/supplier-verification-basics",
    status: "published" as const,
    cluster: "supplier-verification" as const,
    contentRole: "supporting" as const,
    funnelStage: "problem-aware" as const,
    intent: "supplier-verification",
    topics: ["verification", "due diligence"],
    ...overrides,
  };
}

function input(overrides: Partial<GraphInput> = {}): GraphInput {
  return {
    version: 1,
    status: "ready",
    clusters: [
      {
        id: "supplier-verification",
        rootId: "service-supplier-verification",
        pillarId: "article-pillar",
      },
    ],
    nodes: [
      node({ id: "article-a" }),
      node({
        id: "article-pillar",
        title: "Supplier verification guide",
        destination: "/article/supplier-verification-guide",
        contentRole: "pillar",
        funnelStage: "solution-aware",
        topics: ["verification", "due diligence"],
      }),
      node({
        id: "service-supplier-verification",
        nodeType: "service",
        title: "Supplier verification service",
        destination: "/supplier-verification",
        contentRole: undefined,
        funnelStage: "decision",
        topics: ["verification"],
      }),
    ],
    relationships: [
      {
        id: "rel-a-pillar",
        sourceId: "article-a",
        targetId: "article-pillar",
        type: "supports",
        anchor: "supplier verification guide",
        funnelDirection: "forward",
        priority: 1,
      },
      {
        id: "rel-a-service",
        sourceId: "article-a",
        targetId: "service-supplier-verification",
        type: "service-next-step",
        anchor: "supplier verification service",
        funnelDirection: "forward",
        priority: 2,
      },
    ],
    ...overrides,
  };
}

describe("Ticket 27A graph engine", () => {
  it("builds explicit relationship recommendations with funnel-aware next steps", () => {
    const result = buildGraphRecommendations(input(), "article-a");

    expect(result.recommendations.map((item) => item.destinationId)).toEqual([
      "article-pillar",
      "service-supplier-verification",
    ]);
    expect(result.recommendations[0]).toMatchObject({
      relationshipType: "supports",
      funnelDirection: "forward",
      nextStep: "informational-sibling",
      anchor: "supplier verification guide",
      source: "explicit",
    });
    expect(result.recommendations[1]).toMatchObject({
      nextStep: "relevant-service-path",
    });
  });

  it("uses deterministic same-cluster fallback when explicit relationships are absent", () => {
    const result = buildGraphRecommendations(
      input({
        relationships: [],
        nodes: [
          node({ id: "article-a" }),
          node({
            id: "article-b",
            destination: "/article/supplier-verification-guide",
            title: "Supplier verification guide",
            contentRole: "pillar",
            funnelStage: "solution-aware",
            topics: ["verification", "due diligence"],
          }),
        ],
      }),
      "article-a",
    );

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0]).toMatchObject({
      destinationId: "article-b",
      relationshipType: "fallback-same-cluster",
      source: "fallback",
      nextStep: "informational-sibling",
    });
  });

  it("filters unsafe targets and records hard diagnostics instead of returning bad links", () => {
    const result = buildGraphRecommendations(
      input({
        nodes: [
          node({ id: "article-a" }),
          node({
            id: "article-pillar",
            destination: "/article/pillar",
            status: "draft",
            contentRole: "pillar",
          }),
          node({
            id: "service-supplier-verification",
            nodeType: "service",
            destination: "https://evil.example/redirect",
            contentRole: undefined,
          }),
          node({
            id: "article-invalid",
            destination: "/article/invalid?next=1",
            status: "published",
          }),
        ],
        relationships: [
          {
            id: "self",
            sourceId: "article-a",
            targetId: "article-a",
            type: "supports",
            anchor: "self",
            funnelDirection: "forward",
            priority: 1,
          },
          {
            id: "draft",
            sourceId: "article-a",
            targetId: "article-pillar",
            type: "supports",
            anchor: "draft",
            funnelDirection: "forward",
            priority: 2,
          },
          {
            id: "bad-destination",
            sourceId: "article-a",
            targetId: "service-supplier-verification",
            type: "service-next-step",
            anchor: "service",
            funnelDirection: "forward",
            priority: 3,
          },
          {
            id: "missing",
            sourceId: "article-a",
            targetId: "not-present",
            type: "related",
            anchor: "missing",
            funnelDirection: "lateral",
            priority: 4,
          },
          {
            id: "invalid-type",
            sourceId: "article-a",
            targetId: "article-invalid",
            type: "made-up",
            anchor: "invalid",
            funnelDirection: "lateral",
            priority: 5,
          },
        ],
      }),
      "article-a",
    );

    expect(result.recommendations).toEqual([]);
    expect(
      result.diagnostics
        .filter((item) => item.severity === "hard")
        .map((item) => item.code),
    ).toEqual(
      expect.arrayContaining([
        "self-link",
        "non-live-destination",
        "invalid-destination",
        "broken-relationship",
        "unsupported-relationship",
      ]),
    );
  });

  it("keeps hard violations separate from advisory graph warnings", () => {
    const diagnostics = diagnoseGraph(
      input({
        clusters: [
          {
            id: "supplier-verification",
            rootId: "missing-root",
            pillarId: null,
          },
        ],
        nodes: [
          node({ id: "article-a", primaryKeyword: "supplier verification" }),
        ],
        relationships: [],
      }),
    );

    expect(diagnostics.some((item) => item.severity === "hard")).toBe(true);
    expect(diagnostics.some((item) => item.severity === "advisory")).toBe(true);
    expect(diagnostics.map((item) => item.category)).toEqual(
      expect.arrayContaining(["root-connectivity", "missing-pillar", "orphan"]),
    );
  });

  it("reports anchor repetition, cannibalisation, and missing root/pillar connectivity", () => {
    const diagnostics = diagnoseGraph(
      input({
        clusters: [
          {
            id: "supplier-verification",
            rootId: "service-supplier-verification",
            pillarId: "article-pillar",
          },
        ],
        nodes: [
          node({ id: "article-a", primaryKeyword: "verify supplier" }),
          node({
            id: "article-b",
            destination: "/article/b",
            primaryKeyword: "verify supplier",
            topics: ["verification"],
          }),
          node({
            id: "article-pillar",
            destination: "/article/pillar",
            contentRole: "pillar",
            primaryKeyword: "supplier guide",
          }),
          node({
            id: "service-supplier-verification",
            nodeType: "service",
            destination: "/supplier-verification",
            contentRole: undefined,
          }),
        ],
        relationships: [
          {
            id: "a-b",
            sourceId: "article-a",
            targetId: "article-b",
            type: "related",
            anchor: "read more",
            funnelDirection: "lateral",
            priority: 1,
          },
          {
            id: "b-a",
            sourceId: "article-b",
            targetId: "article-a",
            type: "related",
            anchor: "read more",
            funnelDirection: "lateral",
            priority: 1,
          },
        ],
      }),
    );

    expect(diagnostics.map((item) => item.category)).toEqual(
      expect.arrayContaining(["anchor", "cannibalisation"]),
    );
  });

  it("keeps recommendations empty while the graph is explicitly blocked", () => {
    const result = buildGraphRecommendations(
      input({ status: "blocked_no_live_graph" }),
      "article-a",
    );

    expect(result.recommendations).toEqual([]);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "blocked-graph" }),
      ]),
    );
  });

  it("filters traversal destinations and diagnoses the invalid path", () => {
    const result = buildGraphRecommendations(
      input({
        nodes: [
          node({ id: "article-a" }),
          node({
            id: "article-traversal",
            destination: "/article/../admin",
          }),
        ],
        relationships: [
          {
            id: "traversal",
            sourceId: "article-a",
            targetId: "article-traversal",
            type: "related",
            anchor: "unsafe target",
            funnelDirection: "lateral",
            priority: 1,
          },
        ],
      }),
      "article-a",
    );

    expect(result.recommendations).toEqual([]);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-destination",
          nodeIds: ["article-traversal"],
        }),
      ]),
    );
  });

  it("rejects unknown contract keys instead of silently ignoring them", () => {
    const graph = { ...input(), unexpected: true };
    expect(() => parseGraphInput(graph)).toThrow(/unrecognized key/i);
  });

  it("returns a safe empty result for missing sources and empty graphs", () => {
    expect(
      buildGraphRecommendations(
        input({ nodes: [], relationships: [] }),
        "missing",
      ),
    ).toMatchObject({
      recommendations: [],
    });
    expect(
      buildGraphRecommendations(input({ nodes: [], relationships: [] })),
    ).toMatchObject({
      recommendations: [],
    });
  });

  it("produces input-order-independent canonical data and digest", () => {
    const original = input();
    const reversed: GraphInput = {
      ...original,
      nodes: [...original.nodes].reverse(),
      relationships: [...original.relationships].reverse(),
      clusters: [...original.clusters].reverse(),
    };

    expect(canonicalizeGraphInput(original)).toBe(
      canonicalizeGraphInput(reversed),
    );
    expect(digestGraphInput(original)).toBe(digestGraphInput(reversed));
  });

  it("does not mutate input and deep-freezes output", () => {
    const graph = input();
    const before = JSON.stringify(graph);
    const result = buildGraphRecommendations(graph, "article-a");

    expect(JSON.stringify(graph)).toBe(before);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.recommendations)).toBe(true);
    expect(() => {
      (result.recommendations as Array<unknown>).push({});
    }).toThrow();
  });

  it("rejects control characters and unsafe identifiers at the contract boundary", () => {
    expect(() =>
      parseGraphInput(input({ nodes: [node({ id: "bad\nnode" })] })),
    ).toThrow(/control character/i);
    expect(() =>
      parseGraphInput(
        input({ nodes: [node({ destination: "/article/a\u0000" })] }),
      ),
    ).toThrow(/control character/i);
  });

  it("renders machine-readable diagnostics as stable plain text", () => {
    const diagnostics = diagnoseGraph(input({ relationships: [] }));
    const markdown = renderGraphDiagnostics(diagnostics);

    expect(markdown).toContain("orphan-risk");
    expect(markdown).toContain("severity");
    expect(markdown).toBe(renderGraphDiagnostics([...diagnostics].reverse()));
  });
});
