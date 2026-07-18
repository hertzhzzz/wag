import {
  ARTICLE_UPGRADE_ISSUE_CODES,
  ARTICLE_UPGRADE_TICKET_REGISTRY,
  canonicalJson,
  computeArticleUpgradeCandidateDigest,
  computeArticleUpgradeManifestDigest,
  createPendingArticleUpgradeManifest,
  deepClone,
  deepFreeze,
  evaluateArticleUpgradeManifest,
  renderArticleUpgradeReport,
} from ".";
import { createSyntheticArticleUpgradeManifest } from "./__fixtures__/synthetic";

const TEST_CONTEXT = Object.freeze({
  today: "2026-07-18",
  environment: "test" as const,
});

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createSelfReportedLiveManifest() {
  const manifest = clone(createSyntheticArticleUpgradeManifest());
  manifest.asOf = "2026-07-17";
  manifest.provenance = "live";

  const rewrite = (value: unknown): void => {
    if (value === null || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(rewrite);
      return;
    }
    for (const [key, nested] of Object.entries(value)) {
      if (key === "provenance") {
        (value as Record<string, unknown>)[key] = "live";
      } else if (nested === "2026-07-19") {
        (value as Record<string, unknown>)[key] = "2026-07-17";
      } else if (nested === "2026-07-20") {
        (value as Record<string, unknown>)[key] = "2026-07-18";
      } else {
        rewrite(nested);
      }
    }
  };
  rewrite(manifest);

  for (const ticket of manifest.tickets) {
    ticket.owner = { id: `human-owner-${ticket.rank}`, kind: "human" };
    for (const observation of ticket.observations) {
      observation.status = "observed";
    }
    const digest = computeArticleUpgradeCandidateDigest(ticket);
    ticket.approvals.content.subjectDigest = digest;
    ticket.approvals.release.subjectDigest = digest;
  }

  return manifest;
}

describe("article upgrade registry", () => {
  it("defines each reason code exactly once for stable sorting", () => {
    const codes = new Set(ARTICLE_UPGRADE_ISSUE_CODES);
    expect(codes.size).toBe(ARTICLE_UPGRADE_ISSUE_CODES.length);
  });

  it("covers Tickets 14-23 exactly once with stable ranks", () => {
    expect(ARTICLE_UPGRADE_TICKET_REGISTRY).toEqual(
      Array.from({ length: 10 }, (_, index) => ({
        ticketId: String(index + 14),
        rank: index + 1,
      })),
    );
    expect(Object.isFrozen(ARTICLE_UPGRADE_TICKET_REGISTRY)).toBe(true);
    expect(Object.isFrozen(ARTICLE_UPGRADE_TICKET_REGISTRY[0])).toBe(true);
  });

  it("creates a complete but fail-closed pending manifest without inventing data", () => {
    const manifest = createPendingArticleUpgradeManifest("2026-07-18");
    const report = evaluateArticleUpgradeManifest(manifest, {
      today: "2026-07-18",
      environment: "production",
    });

    expect(manifest.tickets).toHaveLength(10);
    expect(manifest.tickets.every((ticket) => ticket.target === null)).toBe(
      true,
    );
    expect(
      manifest.tickets.every(
        (ticket) =>
          ticket.source.baseline === null && ticket.source.current === null,
      ),
    ).toBe(true);
    expect(report.status).toBe("blocked");
    expect(report.schemaValid).toBe(true);
    expect(report.evidenceVerified).toBe(false);
    expect(report.authorizedForExecution).toBe(false);
    expect(report.productionExecution).toBe(false);
    expect(report.disposition).toBe("hold");
    expect(report.executable).toBe(false);
    expect(report.complete).toBe(false);
    expect(report.reasonCodes).toEqual(
      expect.arrayContaining([
        "target_unassigned",
        "ticket_13_strict_cutover_blocked",
        "migration_ledger_not_approved",
        "ranked_opportunity_not_locked",
        "evidence_gate_not_passed",
        "attribution_not_approved",
        "content_approval_missing",
        "release_approval_missing",
      ]),
    );
  });
});

describe("synthetic fixture guard", () => {
  it("can prove the logical happy path in tests without becoming executable or complete", () => {
    const input = createSyntheticArticleUpgradeManifest();
    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);

    expect(report.status).toBe("fixture-ready");
    expect(report.simulationReady).toBe(true);
    expect(report.previewable).toBe(true);
    expect(report.schemaValid).toBe(true);
    expect(report.evidenceVerified).toBe(false);
    expect(report.authorizedForExecution).toBe(false);
    expect(report.productionExecution).toBe(false);
    expect(report.disposition).toBe("hold");
    expect(report.executable).toBe(false);
    expect(report.complete).toBe(false);
    expect(report.reasonCodes).toEqual(["synthetic_provenance_not_executable"]);
    expect(report.tickets).toHaveLength(10);
    expect(
      report.tickets.every(
        (ticket) =>
          ticket.status === "fixture-ready" && ticket.executable === false,
      ),
    ).toBe(true);
  });

  it("rejects fixture provenance outside the test environment", () => {
    const report = evaluateArticleUpgradeManifest(
      createSyntheticArticleUpgradeManifest(),
      { today: "2026-07-18", environment: "production" },
    );

    expect(report.status).toBe("blocked");
    expect(report.reasonCodes).toContain("fixture_requires_test_environment");
    expect(report.executable).toBe(false);
  });

  it("allows future dates only in an explicit synthetic test fixture", () => {
    const fixture = createSyntheticArticleUpgradeManifest();
    expect(fixture.asOf).toBe("2026-07-19");
    expect(
      evaluateArticleUpgradeManifest(fixture, TEST_CONTEXT).reasonCodes,
    ).not.toContain("future_date_forbidden");

    const disguisedLive = clone(fixture);
    disguisedLive.provenance = "live";
    const report = evaluateArticleUpgradeManifest(disguisedLive, TEST_CONTEXT);
    expect(report.reasonCodes).toContain("future_date_forbidden");
    expect(report.reasonCodes).toContain("provenance_mismatch");
  });
});

describe("runtime context and trusted execution boundary", () => {
  it.each([
    [{ today: "2026-02-30", environment: "test" }, "calendar date"],
    [{ today: "2026-07-18T25:00:00Z", environment: "test" }, "RFC3339"],
    [{ today: "2026-07-18", environment: "staging" }, "environment"],
  ])("blocks an invalid runtime context: %s", (context) => {
    const report = evaluateArticleUpgradeManifest(
      createSyntheticArticleUpgradeManifest(),
      context,
    );

    expect(report.status).toBe("blocked");
    expect(report.schemaValid).toBe(false);
    expect(report.executable).toBe(false);
    expect(report.productionExecution).toBe(false);
    expect(report.reasonCodes).toContain("input_schema_invalid");
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringMatching(/^\$\.context/u),
        }),
      ]),
    );
  });

  it("accepts a valid RFC3339 runtime date and normalizes it to a calendar day", () => {
    const report = evaluateArticleUpgradeManifest(
      createSyntheticArticleUpgradeManifest(),
      {
        today: "2026-07-18T23:59:59+09:30",
        environment: "test",
      },
    );

    expect(report.status).toBe("fixture-ready");
    expect(report.schemaValid).toBe(true);
  });

  it("keeps self-reported live approvals and evidence non-executable without a trusted resolver", () => {
    const report = evaluateArticleUpgradeManifest(
      createSelfReportedLiveManifest(),
      {
        today: "2026-07-18",
        environment: "production",
        dataMode: "actual",
      },
    );

    expect(report.schemaValid).toBe(true);
    expect(report.evidenceVerified).toBe(false);
    expect(report.authorizedForExecution).toBe(false);
    expect(report.productionExecution).toBe(false);
    expect(report.executable).toBe(false);
    expect(report.status).toBe("blocked");
    expect(report.disposition).toBe("hold");
    expect(report.reasonCodes).toContain(
      "trusted_execution_attestation_missing",
    );
    expect(
      report.tickets.every(
        (ticket) =>
          ticket.schemaValid &&
          !ticket.evidenceVerified &&
          !ticket.authorizedForExecution &&
          !ticket.productionExecution &&
          !ticket.executable &&
          ticket.disposition === "hold",
      ),
    ).toBe(true);
  });

  it("maps provenance to dataMode and blocks contradictory mode declarations", () => {
    const mismatch = evaluateArticleUpgradeManifest(
      createSyntheticArticleUpgradeManifest(),
      {
        today: "2026-07-18",
        environment: "test",
        dataMode: "actual",
      },
    );
    expect(mismatch.dataMode).toBe("actual");
    expect(mismatch.status).toBe("blocked");
    expect(mismatch.reasonCodes).toContain("data_mode_mismatch");

    const dryRun = evaluateArticleUpgradeManifest(
      createSyntheticArticleUpgradeManifest(),
      {
        today: "2026-07-18",
        environment: "test",
        dataMode: "dry_run",
      },
    );
    expect(dryRun.dataMode).toBe("dry_run");
    expect(dryRun.reasonCodes).toContain("dry_run_preview_only");
    expect(dryRun.executable).toBe(false);
    expect(dryRun.productionExecution).toBe(false);
  });
});

describe("explicit fail-closed gates", () => {
  const cases = [
    [
      "Ticket 13 strict cutover",
      "ticket_13_strict_cutover_blocked",
      (
        ticket: ReturnType<
          typeof createSyntheticArticleUpgradeManifest
        >["tickets"][number],
      ) => {
        ticket.dependencies.strictCutover.status = "pending";
        ticket.dependencies.strictCutover.evidenceDigest = null;
        ticket.dependencies.strictCutover.checkedAt = null;
      },
    ],
    [
      "Ticket 06 ledger approval",
      "migration_ledger_not_approved",
      (
        ticket: ReturnType<
          typeof createSyntheticArticleUpgradeManifest
        >["tickets"][number],
      ) => {
        ticket.dependencies.migrationLedger.status = "pending";
      },
    ],
    [
      "ranked opportunity lock",
      "ranked_opportunity_not_locked",
      (
        ticket: ReturnType<
          typeof createSyntheticArticleUpgradeManifest
        >["tickets"][number],
      ) => {
        ticket.opportunityLock.status = "unlocked";
      },
    ],
    [
      "Evidence Gate",
      "evidence_gate_not_passed",
      (
        ticket: ReturnType<
          typeof createSyntheticArticleUpgradeManifest
        >["tickets"][number],
      ) => {
        ticket.dependencies.evidenceGate.status = "pending";
      },
    ],
    [
      "attribution approval",
      "attribution_not_approved",
      (
        ticket: ReturnType<
          typeof createSyntheticArticleUpgradeManifest
        >["tickets"][number],
      ) => {
        ticket.attribution.approval.status = "pending";
      },
    ],
    [
      "mobile QA",
      "mobile_review_not_passed",
      (
        ticket: ReturnType<
          typeof createSyntheticArticleUpgradeManifest
        >["tickets"][number],
      ) => {
        ticket.requirements.mobileReview.status = "pending";
      },
    ],
    [
      "content approval",
      "content_approval_missing",
      (
        ticket: ReturnType<
          typeof createSyntheticArticleUpgradeManifest
        >["tickets"][number],
      ) => {
        ticket.approvals.content.status = "pending";
      },
    ],
    [
      "release approval",
      "release_approval_missing",
      (
        ticket: ReturnType<
          typeof createSyntheticArticleUpgradeManifest
        >["tickets"][number],
      ) => {
        ticket.approvals.release.status = "pending";
      },
    ],
  ] as const;

  it.each(cases)("blocks when %s is missing", (_label, code, mutate) => {
    const input = createSyntheticArticleUpgradeManifest();
    mutate(input.tickets[0]);
    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);

    expect(report.reasonCodes).toContain(code);
    expect(report.status).toBe("blocked");
    expect(report.executable).toBe(false);
    expect(report.complete).toBe(false);
  });

  it("blocks an incomplete locked opportunity attestation", () => {
    const input = createSyntheticArticleUpgradeManifest();
    input.tickets[0].opportunityLock.opportunityId = null;
    input.tickets[0].opportunityLock.rank = null;
    input.tickets[0].opportunityLock.cluster = null;
    input.tickets[0].opportunityLock.targetUrl = null;
    input.tickets[0].opportunityLock.lockedAt = null;

    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);

    expect(report.reasonCodes).toContain("ranked_opportunity_not_locked");
    expect(report.status).toBe("blocked");
    expect(report.executable).toBe(false);
  });

  it("keeps content approval and release approval independent", () => {
    const input = createSyntheticArticleUpgradeManifest();
    input.tickets[0].approvals.release.status = "pending";
    input.tickets[0].approvals.release.approvalId = null;
    input.tickets[0].approvals.release.actorId = null;
    input.tickets[0].approvals.release.approvedAt = null;
    input.tickets[0].approvals.release.subjectDigest = null;

    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);
    const ticket = report.tickets.find(({ ticketId }) => ticketId === "14");

    expect(ticket?.reasonCodes).not.toContain("content_approval_missing");
    expect(ticket?.reasonCodes).toContain("release_approval_missing");
    expect(ticket?.executable).toBe(false);
  });
});

describe("verifiable article requirements", () => {
  const cases = [
    ["answerPassage", "answer_passage_not_verified"],
    ["faq", "faq_not_reviewed"],
    ["internalLinks", "internal_link_graph_not_verified"],
    ["expertEvidence", "expert_first_party_evidence_not_verified"],
    ["mobileReview", "mobile_review_not_passed"],
    ["metadataSchema", "metadata_schema_not_eligible"],
  ] as const;

  it.each(cases)("explains an unverified %s requirement", (key, code) => {
    const input = createSyntheticArticleUpgradeManifest();
    input.tickets[0].requirements[key].status = "pending";
    input.tickets[0].requirements[key].evidenceDigest = null;
    input.tickets[0].requirements[key].verifiedAt = null;

    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);
    const ticket = report.tickets[0];
    expect(ticket.reasonCodes).toContain(code);
    expect(ticket.issues.find((issue) => issue.code === code)?.message).toEqual(
      expect.any(String),
    );
  });
});

describe("integrity and drift protection", () => {
  it("detects all ten slots, duplicate tickets, duplicate targets, and cluster drift", () => {
    const input = createSyntheticArticleUpgradeManifest();
    input.tickets.push(clone(input.tickets[0]));
    input.tickets[1].target = clone(input.tickets[0].target);
    input.tickets[2].opportunityLock.cluster = "factory-audit";

    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);
    expect(report.reasonCodes).toEqual(
      expect.arrayContaining([
        "ticket_duplicate",
        "target_duplicate",
        "cluster_drift",
      ]),
    );
  });

  it("rejects self-links and duplicate internal-link targets", () => {
    const input = createSyntheticArticleUpgradeManifest();
    const ticket = input.tickets[0];
    const targetUrl = ticket.target!.url;
    const pillarUrl = ticket.requirements.internalLinks.targets.pillar!;

    ticket.requirements.internalLinks.targets.sibling = targetUrl;
    ticket.requirements.internalLinks.targets.service = pillarUrl;

    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);

    expect(report.reasonCodes).toEqual(
      expect.arrayContaining([
        "internal_link_self_link",
        "internal_link_target_duplicate",
      ]),
    );
  });

  it("rejects synthetic observations inside a live record", () => {
    const input = clone(createPendingArticleUpgradeManifest("2026-07-18"));
    input.tickets[0].observations[0] = {
      key: "search-position",
      status: "synthetic-fixture",
      value: 1,
      sourceDigest: `sha256:${"a".repeat(64)}`,
      observedAt: "2026-07-18",
    };

    const report = evaluateArticleUpgradeManifest(input, {
      today: "2026-07-18",
      environment: "production",
    });

    expect(report.reasonCodes).toContain("provenance_mismatch");
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "provenance_mismatch",
          path: "tickets.14.observations.search-position.status",
        }),
      ]),
    );
  });

  it("detects a missing ticket and rank drift", () => {
    const input = createSyntheticArticleUpgradeManifest();
    input.tickets = input.tickets.filter(({ ticketId }) => ticketId !== "23");
    input.tickets[0].rank = 10;

    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);
    expect(report.reasonCodes).toEqual(
      expect.arrayContaining(["ticket_missing", "rank_mismatch"]),
    );
  });

  it("detects ledger drift and stale approval digests", () => {
    const input = createSyntheticArticleUpgradeManifest();
    input.tickets[0].dependencies.migrationLedger.approvedDigest = `sha256:${"f".repeat(64)}`;
    input.tickets[1].source.current!.digest = `sha256:${"e".repeat(64)}`;

    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);
    expect(report.reasonCodes).toContain("migration_ledger_digest_drift");
    expect(report.reasonCodes).toContain("content_approval_digest_drift");
    expect(report.reasonCodes).toContain("release_approval_digest_drift");
  });

  it("rejects ranking and causal claims without evidence", () => {
    const input = createSyntheticArticleUpgradeManifest();
    input.tickets[0].claims = [
      {
        id: "ranking-without-source",
        kind: "ranking",
        statement: "This article ranks first.",
        evidenceDigest: null,
        asOf: "2026-07-19",
        provenance: "synthetic-fixture",
      },
      {
        id: "causal-without-source",
        kind: "causal",
        statement: "The upgrade caused conversion growth.",
        evidenceDigest: null,
        asOf: "2026-07-19",
        provenance: "synthetic-fixture",
      },
    ];

    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);
    expect(report.reasonCodes).toEqual(
      expect.arrayContaining([
        "unsupported_ranking_claim",
        "unsupported_causal_claim",
      ]),
    );
  });

  it("forbids real tracking parameters even when attribution metadata says approved", () => {
    const input = createSyntheticArticleUpgradeManifest() as unknown as {
      tickets: Array<{
        attribution: { trackingParameters: unknown };
      }>;
    };
    input.tickets[0].attribution.trackingParameters = {
      utm_source: "invented",
    };

    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);
    expect(report.reasonCodes).toContain("tracking_parameters_forbidden");
    expect(report.executable).toBe(false);
  });

  it("enforces null-not-zero when no observation exists", () => {
    const input = createSyntheticArticleUpgradeManifest();
    input.tickets[0].observations[0] = {
      ...input.tickets[0].observations[0],
      status: "unavailable",
      value: 0,
      sourceDigest: null,
      observedAt: null,
    };

    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);
    expect(report.reasonCodes).toContain("observation_null_semantics_invalid");
  });
});

describe("determinism and mutation isolation", () => {
  it("produces stable canonical digests and sorted reasons", () => {
    const first = createSyntheticArticleUpgradeManifest();
    const second = clone(first);
    second.tickets.reverse();

    const firstDigest = computeArticleUpgradeManifestDigest(first);
    const secondDigest = computeArticleUpgradeManifestDigest(second);
    const firstReport = evaluateArticleUpgradeManifest(first, TEST_CONTEXT);
    const secondReport = evaluateArticleUpgradeManifest(second, TEST_CONTEXT);

    expect(firstDigest).toBe(secondDigest);
    expect(firstReport.manifestDigest).toBe(secondReport.manifestDigest);
    expect(firstReport.reasonCodes).toEqual(secondReport.reasonCodes);
  });

  it("binds approvals to a canonical candidate digest", () => {
    const input = createSyntheticArticleUpgradeManifest();
    const before = computeArticleUpgradeCandidateDigest(input.tickets[0]);
    input.tickets[0].requirements.answerPassage.explanation =
      "A materially different synthetic explanation.";
    const after = computeArticleUpgradeCandidateDigest(input.tickets[0]);

    expect(before).not.toBe(after);
    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);
    expect(report.reasonCodes).toEqual(
      expect.arrayContaining([
        "content_approval_digest_drift",
        "release_approval_digest_drift",
      ]),
    );
  });

  it("deep-clones and deep-freezes evaluation output", () => {
    const input = createSyntheticArticleUpgradeManifest();
    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);
    const originalTarget = report.tickets[0].target?.url;

    input.tickets[0].target!.url = "/article/mutated-after-evaluation";

    expect(report.tickets[0].target?.url).toBe(originalTarget);
    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.tickets)).toBe(true);
    expect(Object.isFrozen(report.tickets[0])).toBe(true);
    expect(() => {
      (report.tickets[0] as { executable: boolean }).executable = true;
    }).toThrow();
  });

  it("fails closed before schema parsing when input is cyclic", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;

    const report = evaluateArticleUpgradeManifest(cyclic, TEST_CONTEXT);

    expect(report.status).toBe("blocked");
    expect(report.schemaValid).toBe(false);
    expect(report.executable).toBe(false);
    expect(report.reasonCodes).toContain("input_schema_invalid");
  });

  it("rejects cycles, sparse arrays, non-plain objects, and non-finite values in canonical helpers", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const sparse: unknown[] = [];
    sparse.length = 1;
    const invalidValues: unknown[] = [
      cyclic,
      sparse,
      new Date("2026-07-18T00:00:00.000Z"),
      { score: Number.POSITIVE_INFINITY },
    ];

    for (const invalid of invalidValues) {
      expect(() => deepClone(invalid)).toThrow();
      expect(() => deepFreeze(invalid)).toThrow();
      expect(() => canonicalJson(invalid)).toThrow();
    }
  });

  it("exposes only the canonical baseline digest as a rollback reference", () => {
    const input = createSyntheticArticleUpgradeManifest();
    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);

    expect(report.tickets[0].rollbackBaselineDigest).toBe(
      input.tickets[0].source.baseline?.digest,
    );
    expect(report.tickets[0].productionExecution).toBe(false);
    expect(report.tickets[0].disposition).not.toBe("rollback");
  });

  it("distinguishes no-op from hold and never infers rollback execution", () => {
    const input = createSyntheticArticleUpgradeManifest();
    input.tickets[0].source.current!.digest =
      input.tickets[0].source.baseline!.digest;
    const report = evaluateArticleUpgradeManifest(input, TEST_CONTEXT);

    expect(report.tickets[0].disposition).toBe("no-op");
    expect(report.tickets[0].productionExecution).toBe(false);
    expect(
      report.tickets
        .slice(1)
        .every(({ disposition }) => disposition === "hold"),
    ).toBe(true);
    expect(
      report.tickets.every(({ disposition }) => disposition !== "rollback"),
    ).toBe(true);
  });

  it("renders a deterministic preview report without URLs containing tracking parameters", () => {
    const report = evaluateArticleUpgradeManifest(
      createSyntheticArticleUpgradeManifest(),
      TEST_CONTEXT,
    );
    const markdown = renderArticleUpgradeReport(report);

    expect(markdown).toContain("Article Upgrade Evaluation");
    expect(markdown).toContain("Executable: no");
    expect(markdown).toContain("Evidence verified: no");
    expect(markdown).toContain("Authorized for execution: no");
    expect(markdown).toContain("Production execution: no");
    expect(markdown).toContain("Complete: no");
    expect(markdown).not.toMatch(/[?&]utm_/u);
    expect(markdown).not.toContain("Done");
  });
});
