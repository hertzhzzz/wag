import {
  bindTrustedReleaseWorkflow,
  createSyntheticReleaseBinding,
  isTrustedPublicationReleaseBinding,
  evaluateHighIntentPublicationEvent,
  evaluateRefreshPublicationEvent,
  type HighIntentPublicationEventInput,
  type RefreshPublicationEventInput,
} from "./index";

const DIGEST_A =
  "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
const DIGEST_B =
  "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as const;
const DIGEST_C =
  "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc" as const;
const ACTUAL_DAY = "2026-07-18T10:00:00+09:30";

function verifiedGate(reportDigest = DIGEST_B) {
  return { status: "verified" as const, reportDigest };
}

function highIntentFixture(
  overrides: Partial<HighIntentPublicationEventInput> = {},
): HighIntentPublicationEventInput {
  return {
    version: 1,
    eventType: "first_high_intent_publication",
    eventId: "event-high-intent-001",
    dataMode: "synthetic_fixture",
    occurredAt: ACTUAL_DAY,
    candidate: {
      query: "china sourcing supplier verification",
      intent: "commercial-investigation",
      cluster: "china-sourcing",
      targetUrl: "https://www.example.com/article/supplier-verification",
      canonicalUrl: "https://www.example.com/article/supplier-verification",
      pageType: "high_intent_article",
    },
    opportunity: {
      selection: "selected",
      opportunityDigest: DIGEST_A,
      briefDigest: DIGEST_B,
      approvalDigest: DIGEST_C,
    },
    evidence: {
      status: "approved",
      packageDigest: DIGEST_A,
      expertiseDigest: DIGEST_B,
    },
    quality: {
      intent: verifiedGate(),
      cluster: verifiedGate(),
      graph: verifiedGate(),
      geo: verifiedGate(),
      attribution: verifiedGate(),
      disclosure: verifiedGate(),
      mobile: verifiedGate(),
      metadata: verifiedGate(),
      schema: verifiedGate(),
      build: verifiedGate(),
    },
    artifact: { artifactDigest: DIGEST_A, reportDigest: DIGEST_B },
    releaseIdentity: {
      workflowInstanceId: "workflow-fixture-001",
      releaseId: "release-fixture-001",
      artifactDigest: DIGEST_A,
      reportDigest: DIGEST_B,
      nonce: "fixture-nonce-001",
    },
    releaseBinding: createSyntheticReleaseBinding({
      dataMode: "synthetic_fixture",
      workflowInstanceId: "workflow-fixture-001",
      releaseId: "release-fixture-001",
      artifactDigest: DIGEST_A,
      reportDigest: DIGEST_B,
      nonce: "fixture-nonce-001",
      liveVerified: false,
      rollback: { readiness: "ready", verificationRequired: true },
    }),
    failureReasons: [],
    ...overrides,
  };
}

function refreshFixture(
  overrides: Partial<RefreshPublicationEventInput> = {},
): RefreshPublicationEventInput {
  return {
    version: 1,
    eventType: "first_refresh_publication",
    eventId: "event-refresh-001",
    dataMode: "synthetic_fixture",
    occurredAt: ACTUAL_DAY,
    candidate: {
      existingUrl: "https://www.example.com/article/factory-audit",
      targetUrl: "https://www.example.com/article/factory-audit",
      canonicalUrl: "https://www.example.com/article/factory-audit",
      cluster: "factory-audit",
      intent: "commercial-investigation",
    },
    opportunity: {
      selection: "selected",
      opportunityDigest: DIGEST_A,
      briefDigest: DIGEST_B,
      approvalDigest: DIGEST_C,
    },
    articleUpgrade: {
      status: "approved",
      ticketId: "upgrade-01",
      candidateDigest: DIGEST_A,
      reportDigest: DIGEST_B,
    },
    changes: {
      kind: "evidence_upgrade",
      beforeArtifactDigest: DIGEST_C,
      afterArtifactDigest: DIGEST_A,
      changeDigest: DIGEST_B,
      urlDisposition: { kind: "preserve", approvalDigest: null },
    },
    evidence: {
      status: "approved",
      packageDigest: DIGEST_A,
      expertiseDigest: DIGEST_B,
    },
    quality: {
      evidenceAge: verifiedGate(),
      authorship: verifiedGate(),
      reviewDate: verifiedGate(),
      methodology: verifiedGate(),
      geo: verifiedGate(),
      graph: verifiedGate(),
      attribution: verifiedGate(),
      disclosure: verifiedGate(),
      mobile: verifiedGate(),
      metadata: verifiedGate(),
      schema: verifiedGate(),
      build: verifiedGate(),
    },
    artifact: { artifactDigest: DIGEST_A, reportDigest: DIGEST_B },
    releaseIdentity: {
      workflowInstanceId: "workflow-fixture-002",
      releaseId: "release-fixture-002",
      artifactDigest: DIGEST_A,
      reportDigest: DIGEST_B,
      nonce: "fixture-nonce-002",
    },
    releaseBinding: createSyntheticReleaseBinding({
      dataMode: "synthetic_fixture",
      workflowInstanceId: "workflow-fixture-002",
      releaseId: "release-fixture-002",
      artifactDigest: DIGEST_A,
      reportDigest: DIGEST_B,
      nonce: "fixture-nonce-002",
      liveVerified: false,
      rollback: { readiness: "ready", verificationRequired: true },
    }),
    failureReasons: [],
    ...overrides,
  };
}

describe("publication event contract", () => {
  it("does not accept a caller-created Ticket 38-shaped object as trusted", () => {
    expect(() =>
      bindTrustedReleaseWorkflow({
        dataMode: "actual",
        state: "live_verified",
        workflowInstanceId: "workflow-self-reported",
        releaseId: "release-self-reported",
        artifactDigest: DIGEST_A,
        reportDigest: DIGEST_B,
        approvalNonce: "caller-nonce-001",
      }),
    ).toThrow(/trusted Ticket 38 workflow/i);
  });

  it("fails closed when a caller supplies a self-reported live_verified binding", () => {
    const input = highIntentFixture({
      dataMode: "actual",
      releaseIdentity: {
        workflowInstanceId: "workflow-self-reported",
        releaseId: "release-self-reported",
        artifactDigest: DIGEST_A,
        reportDigest: DIGEST_B,
        nonce: "caller-nonce-001",
      },
      releaseBinding: {
        dataMode: "actual",
        workflowInstanceId: "workflow-self-reported",
        releaseId: "release-self-reported",
        artifactDigest: DIGEST_A,
        reportDigest: DIGEST_B,
        nonce: "caller-nonce-001",
        state: "live_verified",
        liveVerified: true,
        contentApproval: null,
        productionApproval: null,
        deployment: null,
        liveVerification: null,
        rollback: {
          readiness: "ready",
          verificationRequired: true,
          planDigest: DIGEST_C,
        },
        attestationDigest: DIGEST_C,
      } as never,
    });

    const decision = evaluateHighIntentPublicationEvent(input);

    expect(decision.state).toBe("blocked");
    expect(decision.blockers).toContain("trusted_release_binding_required");
    expect(decision.completed).toBe(false);
  });

  it("does not trust a copied publication brand from a fixture binding", () => {
    const fixture = highIntentFixture();
    const trustedFixture = fixture.releaseBinding;
    const copiedSymbol = Object.getOwnPropertySymbols(trustedFixture)[0];
    expect(copiedSymbol).toBeDefined();

    const forged = {
      ...trustedFixture,
      dataMode: "actual",
      state: "live_verified",
      liveVerified: true,
      [copiedSymbol as symbol]: true,
    };

    expect(isTrustedPublicationReleaseBinding(forged)).toBe(false);
    const decision = evaluateHighIntentPublicationEvent({
      ...fixture,
      dataMode: "actual",
      releaseBinding: forged as never,
    });
    expect(decision.blockers).toContain("trusted_release_binding_required");
  });

  it("keeps a synthetic high-intent fixture isolated from actual publication", () => {
    const decision = evaluateHighIntentPublicationEvent(highIntentFixture());

    expect(decision.state).toBe("fixture_ready");
    expect(decision.eligible).toBe(true);
    expect(decision.completed).toBe(false);
    expect(decision.report.sideEffects).toEqual([]);
    expect(decision.report.claims.indexed).toBe(false);
    expect(decision.report.claims.ranked).toBe(false);
  });

  it("rejects recommendation as the selected opportunity", () => {
    const input = highIntentFixture({
      opportunity: {
        ...highIntentFixture().opportunity,
        selection: "recommended" as never,
      },
    });

    expect(() => evaluateHighIntentPublicationEvent(input)).toThrow(
      /selection.*selected/i,
    );
  });

  it("rejects future actual timestamps but permits them in an explicit fixture", () => {
    expect(() =>
      evaluateHighIntentPublicationEvent(
        highIntentFixture({
          dataMode: "actual",
          occurredAt: "2026-07-19T00:00:00Z",
        }),
      ),
    ).toThrow(/future/i);

    const fixture = highIntentFixture({ occurredAt: "2026-07-19T00:00:00Z" });
    expect(evaluateHighIntentPublicationEvent(fixture).state).toBe(
      "fixture_ready",
    );
  });

  it("rejects unknown keys inside a release binding recursively", () => {
    const input = highIntentFixture();
    (
      input.releaseBinding.rollback as unknown as Record<string, unknown>
    ).unexpected = true;

    expect(() => evaluateHighIntentPublicationEvent(input)).toThrow(
      /unknown field/i,
    );
  });

  it("rejects recursively unknown keys", () => {
    const input = highIntentFixture();
    (input.quality.intent as unknown as Record<string, unknown>).unexpected =
      true;

    expect(() => evaluateHighIntentPublicationEvent(input)).toThrow(
      /unknown field/i,
    );
  });

  it("requires refresh evidence and preserves the existing URL by default", () => {
    const decision = evaluateRefreshPublicationEvent(refreshFixture());

    expect(decision.state).toBe("fixture_ready");
    expect(decision.record.candidate.targetUrl).toBe(
      decision.record.candidate.existingUrl,
    );
    expect(decision.record.changes.urlDisposition.kind).toBe("preserve");
  });

  it("blocks a refresh URL change without a separate approved disposition", () => {
    const input = refreshFixture({
      candidate: {
        ...refreshFixture().candidate,
        targetUrl: "https://www.example.com/article/factory-audit-v2",
        canonicalUrl: "https://www.example.com/article/factory-audit-v2",
      },
      changes: {
        ...refreshFixture().changes,
        urlDisposition: { kind: "preserve", approvalDigest: null },
      },
    });

    const decision = evaluateRefreshPublicationEvent(input);

    expect(decision.state).toBe("blocked");
    expect(decision.blockers).toContain(
      "url_change_requires_approved_disposition",
    );
  });

  it.each([
    [
      "workflowInstanceId",
      "different-workflow",
      "release_workflow_instance_mismatch",
    ],
    ["releaseId", "different-release", "release_id_mismatch"],
    ["artifactDigest", DIGEST_C, "release_identity_artifact_digest_mismatch"],
    ["reportDigest", DIGEST_C, "release_identity_report_digest_mismatch"],
    ["nonce", "different-nonce", "release_nonce_mismatch"],
  ] as const)(
    "binds release identity field %s to the trusted attestation",
    (field, value, blocker) => {
      const input = refreshFixture();
      input.releaseIdentity = {
        ...input.releaseIdentity,
        [field]: value,
      };

      const decision = evaluateRefreshPublicationEvent(input);

      expect(decision.state).toBe("blocked");
      expect(decision.blockers).toContain(blocker);
    },
  );

  it("never performs publication, deployment, search, or indexing side effects", () => {
    const decision = evaluateRefreshPublicationEvent(refreshFixture());

    expect(decision.report.sideEffects).toEqual([]);
    expect(decision.report.searchNotification).toBe("not_attempted");
    expect(decision.report.indexation).toBe("not_observed");
  });
});
