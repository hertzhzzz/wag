import { clusterRegistry } from "../../../content/seo/clusters";
import { articleMigrationLedger } from "../../../content/seo/migration-ledger";
import {
  computeMigrationLedgerDigest,
  defineMigrationLedger,
  type MigrationLedger,
  type MigrationLedgerReport,
  validateMigrationLedger,
} from "../migrationLedger";
import {
  buildClusterMigrationPreview,
  type MigrationArticleSnapshot,
  type MigrationPreviewGovernanceBinding,
} from "./clusterMigrationPreview";
import {
  buildChinaSourcingOverlaysMigrationPreview,
  type ChinaSourcingOverlaysMigrationPreviewInput,
} from "./overlaysMigrationPreview";

type DeepMutable<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? DeepMutable<Item>[]
    : T extends object
      ? { -readonly [Key in keyof T]: DeepMutable<T[Key]> }
      : T;

const REVIEWER = "synthetic-ticket-12-reviewer";
const REVIEW_DATE = "2026-07-17";
const REVIEW_DUE_DATE = "2026-07-18";
const CHINA_CLUSTER = "china-sourcing" as const;
const EXPECTED_INDUSTRY_OVERLAYS = [
  "/article/construction-materials-sourcing-from-china",
  "/article/importing-electronics-from-china-to-australia",
  "/article/sourcing-mining-equipment-from-china",
] as const;

function mutableLedger(
  ledger: MigrationLedger = articleMigrationLedger,
): DeepMutable<MigrationLedger> {
  return structuredClone(ledger) as DeepMutable<MigrationLedger>;
}

function reportFor(ledger: MigrationLedger): MigrationLedgerReport {
  return validateMigrationLedger(ledger, {
    baseline: ledger.entries.map(({ contentId, slug, route }) => ({
      contentId,
      slug,
      route,
    })),
    clusterRegistry,
  });
}

function approveSyntheticLedger(): {
  readonly ledger: MigrationLedger;
  readonly report: MigrationLedgerReport;
} {
  const ledger = mutableLedger();
  ledger.approval = {
    approvalStatus: "approved",
    reviewer: REVIEWER,
    approvalDate: REVIEW_DATE,
  };
  ledger.clusterPlans = ledger.clusterPlans.map((plan) => ({
    ...plan,
    editorialPillar: {
      ...plan.editorialPillar,
      approvalStatus: "approved",
    },
  }));
  ledger.entries = ledger.entries.map((entry) => ({
    ...entry,
    decision: {
      ...entry.decision,
      reviewStatus: "approved",
      reviewer: REVIEWER,
      reviewedOn: REVIEW_DATE,
    },
  }));
  ledger.cannibalisationReviews = ledger.cannibalisationReviews.map(
    (review) => ({
      ...review,
      approvalStatus: "approved",
      reviewer: REVIEWER,
      reviewedOn: REVIEW_DATE,
    }),
  );
  ledger.protection.expectedDigest = computeMigrationLedgerDigest(ledger);

  const frozenLedger = defineMigrationLedger(ledger);
  const report = reportFor(frozenLedger);
  if (!report.locked || report.status !== "valid") {
    throw new Error(
      `Synthetic Ticket 12 ledger failed to lock: ${report.issues
        .map(({ code }) => code)
        .join(", ")}`,
    );
  }

  return { ledger: frozenLedger, report };
}

function expectedBodyLinks(ledger: MigrationLedger, route: string): string[] {
  const plan = ledger.clusterPlans.find(
    ({ cluster }) => cluster === CHINA_CLUSTER,
  );
  if (!plan) throw new Error("Missing China Sourcing plan.");

  return route === plan.editorialPillar.route
    ? [plan.commercialRoot, ...plan.memberRoutes].sort()
    : [plan.commercialRoot, plan.editorialPillar.route].sort();
}

function snapshotsFor(ledger: MigrationLedger): MigrationArticleSnapshot[] {
  return ledger.entries
    .filter(({ classification }) => classification.cluster === CHINA_CLUSTER)
    .map((entry) => ({
      contentId: entry.contentId,
      slug: entry.slug,
      route: entry.route,
      canonicalRoute: entry.route,
      currentLinks: expectedBodyLinks(ledger, entry.route),
      frontmatter: {
        author: "Synthetic Test Author",
        primaryKeyword: `synthetic ${entry.slug}`,
        secondaryKeywords: [],
        editorialStatus: "approved",
        evidenceIds: [`evidence.synthetic.${entry.slug}`],
        firstPartyContributionId: null,
        reviewedBy: REVIEWER,
        reviewedDate: REVIEW_DATE,
        reviewDueDate: REVIEW_DUE_DATE,
      },
      evidenceReadiness: {
        status: "reviewed",
        methodologyRef: `methodology.synthetic.${entry.slug}`,
        claimBoundary: "Synthetic test-only claim boundary.",
      },
    }));
}

function governanceBinding(
  digest: string,
  origin: "production" | "fixture" = "production",
): MigrationPreviewGovernanceBinding {
  return {
    origin,
    public: origin === "production",
    releaseId: `ticket-12-${origin}-release`,
    artifactDigest: digest,
    rollbackArtifactDigest: digest,
    rollbackOwner: "seo-governance-owner",
    rollbackTriggers: ["identity-drift", "evidence-regression"],
    rollbackSteps: ["stop-the-release", "restore-the-reviewed-artifact"],
  };
}

function baseInput(
  options: {
    readonly ledger?: MigrationLedger;
    readonly report?: MigrationLedgerReport;
    readonly mode?: ChinaSourcingOverlaysMigrationPreviewInput["mode"];
    readonly binding?: MigrationPreviewGovernanceBinding | null;
    readonly articles?: readonly MigrationArticleSnapshot[];
  } = {},
): ChinaSourcingOverlaysMigrationPreviewInput {
  const ledger = options.ledger ?? articleMigrationLedger;
  const report = options.report ?? reportFor(ledger);
  const articles = options.articles ?? snapshotsFor(ledger);
  const binding = options.binding === undefined ? null : options.binding;
  const ticket11Preview = buildClusterMigrationPreview({
    ledger,
    ledgerReport: report,
    clusterId: CHINA_CLUSTER,
    articles,
    governanceBinding: binding,
  });

  return {
    mode: options.mode ?? "dry-run",
    ledger,
    ledgerReport: report,
    ticket11Preview,
    articles,
    governanceBinding: binding,
  };
}

function issueCodes(
  input: ChinaSourcingOverlaysMigrationPreviewInput,
): string[] {
  return buildChinaSourcingOverlaysMigrationPreview(input).diagnostics.map(
    ({ code }) => code,
  );
}

describe("China Sourcing overlays migration preflight", () => {
  it("derives supporting and industry scopes from the registry, ledger, and Ticket 11 output without guessing identities", () => {
    const preview = buildChinaSourcingOverlaysMigrationPreview(baseInput());

    expect(preview.ticket).toBe("12");
    expect(preview.clusterId).toBe(CHINA_CLUSTER);
    expect(preview.mode).toBe("dry-run");
    expect(preview.parentJourney).toEqual({
      commercialRoot: "/services",
      editorialPillar: "/article/importing-from-china-australia-guide",
      editorialPillarContentId: "article.importing-from-china-australia-guide",
    });
    expect(preview.scopeSplit.industryOverlayRoutes).toEqual(
      EXPECTED_INDUSTRY_OVERLAYS,
    );
    expect(preview.scopeSplit.supportingRoutes).toHaveLength(9);
    expect(preview.entries).toHaveLength(12);
    expect(preview.industryOverlays).toHaveLength(3);
    expect(preview.articlePlans).toHaveLength(12);
    expect(preview.mutationCommands).toEqual([]);
    expect(preview.executable).toBe(false);
    expect(preview.status).toBe("blocked");
  });

  it("preserves exact overlay identity, classification metadata, URLs, canonicals, and dual-root links", () => {
    const preview = buildChinaSourcingOverlaysMigrationPreview(baseInput());
    const overlay = preview.industryOverlays.find(
      ({ route }) =>
        route === "/article/construction-materials-sourcing-from-china",
    );
    const plan = preview.articlePlans.find(
      ({ route }) => route === overlay?.route,
    );

    expect(overlay).toMatchObject({
      contentId: "article.construction-materials-sourcing-from-china",
      slug: "construction-materials-sourcing-from-china",
      route: "/article/construction-materials-sourcing-from-china",
      scope: "industry-overlay",
      contentRole: "supporting",
      searchIntent: "category-sourcing",
      funnelStage: "solution-aware",
      targetMarket: "AU",
      commercialRoot: "/services",
      editorialPillar: "/article/importing-from-china-australia-guide",
      migrationAction: "refresh",
    });
    expect(overlay?.requiredLinks).toEqual([
      "/article/importing-from-china-australia-guide",
      "/services",
    ]);
    expect(plan?.route).toBe(plan?.canonicalRoute);
    expect(plan?.expectedFrontmatter.contentId).toBe(overlay?.contentId);
    expect(plan?.expectedFrontmatter.searchIntent).toBe(overlay?.searchIntent);
    expect(plan?.expectedFrontmatter.funnelStage).toBe(overlay?.funnelStage);
    expect(plan?.expectedFrontmatter.targetMarket).toBe(overlay?.targetMarket);
  });

  it("keeps the current production ledger blocked and reports missing specialist bindings instead of inventing links", () => {
    const preview = buildChinaSourcingOverlaysMigrationPreview(baseInput());
    const codes = preview.diagnostics.map(({ code }) => code);

    expect(codes).toContain("ledger-not-locked");
    expect(codes).toContain("ledger-approval-required");
    expect(codes).toContain("overlay-specialist-link-missing");
    expect(preview.contractReady).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
  });

  it("fails closed on digest tampering in either the ledger report or Ticket 11 output", () => {
    const input = structuredClone(baseInput());
    (input.ledgerReport as DeepMutable<MigrationLedgerReport>).digest =
      "tampered-report-digest";
    (
      input.ticket11Preview as DeepMutable<typeof input.ticket11Preview>
    ).ledgerDigest = "tampered-ticket-11-digest";

    const codes = issueCodes(input);
    expect(codes).toContain("ledger-report-digest-mismatch");
    expect(codes).toContain("ticket11-ledger-digest-mismatch");
  });

  it("fails closed on draft, gaps-visible, or null evidence readiness without throwing", () => {
    const articles = snapshotsFor(articleMigrationLedger);
    const draft = articles.find(
      ({ route }) => route === EXPECTED_INDUSTRY_OVERLAYS[0],
    );
    if (!draft) throw new Error("Missing synthetic overlay snapshot.");
    (
      draft.frontmatter as DeepMutable<typeof draft.frontmatter>
    ).editorialStatus = "draft";
    (
      draft.evidenceReadiness as DeepMutable<typeof draft.evidenceReadiness>
    ).status = "gaps-visible";

    const gapsCodes = issueCodes(baseInput({ articles }));
    expect(gapsCodes).toContain("overlay-evidence-not-reviewed");
    expect(gapsCodes).toContain("overlay-draft-not-ready");

    const nullInput = structuredClone(baseInput());
    const nullSnapshot = nullInput.articles.find(
      ({ route }) => route === EXPECTED_INDUSTRY_OVERLAYS[1],
    );
    if (!nullSnapshot) throw new Error("Missing null-readiness snapshot.");
    (nullSnapshot as { evidenceReadiness: unknown }).evidenceReadiness = null;

    expect(() =>
      buildChinaSourcingOverlaysMigrationPreview(nullInput),
    ).not.toThrow();
    expect(issueCodes(nullInput)).toContain("overlay-readiness-invalid");
  });

  it("rejects unknown runtime fields even when a tampered ledger digest is recomputed", () => {
    const { ledger: approved } = approveSyntheticLedger();
    const ledger = mutableLedger(approved);
    (
      ledger.entries[0] as DeepMutable<MigrationLedger["entries"][number]> & {
        unreviewedField?: string;
      }
    ).unreviewedField = "must fail closed";
    ledger.protection.expectedDigest = computeMigrationLedgerDigest(ledger);
    const frozen = defineMigrationLedger(ledger as MigrationLedger);
    const report = reportFor(frozen);
    const binding = governanceBinding(report.digest);
    const input = baseInput({
      ledger: frozen,
      report,
      mode: "actual",
      binding,
    }) as ChinaSourcingOverlaysMigrationPreviewInput & {
      unexpectedTopLevel?: boolean;
    };
    input.unexpectedTopLevel = true;

    const codes = issueCodes(input);
    expect(codes).toContain("unknown-preview-field");
    expect(codes).toContain("unknown-ledger-field");
  });

  it("separates fixture bindings from public actual or dry-run inputs", () => {
    const { ledger, report } = approveSyntheticLedger();
    const binding = governanceBinding(report.digest, "fixture");
    const malformed = {
      ...binding,
      public: true,
    } satisfies MigrationPreviewGovernanceBinding;

    const codes = issueCodes(
      baseInput({ ledger, report, mode: "fixture", binding: malformed }),
    );
    expect(codes).toContain("fixture-public-forbidden");
    expect(codes).toContain("fixture-execution-forbidden");

    const dryRunCodes = issueCodes(
      baseInput({ ledger, report, mode: "dry-run", binding }),
    );
    expect(dryRunCodes).toContain("fixture-binding-mode-mismatch");
  });

  it("rejects future actual dates relative to 2026-07-18", () => {
    const articles = snapshotsFor(articleMigrationLedger);
    const snapshot = articles.find(
      ({ route }) => route === EXPECTED_INDUSTRY_OVERLAYS[0],
    );
    if (!snapshot) throw new Error("Missing future-date snapshot.");
    (
      snapshot.frontmatter as DeepMutable<typeof snapshot.frontmatter>
    ).reviewedDate = "2026-07-19";
    (
      snapshot.frontmatter as DeepMutable<typeof snapshot.frontmatter>
    ).reviewDueDate = "2026-07-20";

    expect(issueCodes(baseInput({ articles }))).toContain("future-actual-date");
  });

  it("rejects destructive overlay actions even when the digest is rebound", () => {
    const { ledger: approved } = approveSyntheticLedger();
    const ledger = mutableLedger(approved);
    const entry = ledger.entries.find(
      ({ route }) => route === EXPECTED_INDUSTRY_OVERLAYS[0],
    );
    if (!entry) throw new Error("Missing destructive-action entry.");
    entry.decision.action = "merge";
    ledger.protection.expectedDigest = computeMigrationLedgerDigest(ledger);
    const frozen = defineMigrationLedger(ledger);
    const report = reportFor(frozen);
    const binding = governanceBinding(report.digest);

    expect(
      issueCodes(
        baseInput({ ledger: frozen, report, mode: "actual", binding }),
      ),
    ).toContain("destructive-overlay-action");
  });

  it("rejects malformed rollback bindings without throwing", () => {
    const { ledger, report } = approveSyntheticLedger();
    const binding = governanceBinding(report.digest);
    const malformed = structuredClone(binding) as unknown as {
      rollbackSteps: unknown;
    };
    malformed.rollbackSteps = null;

    const input = baseInput({
      ledger,
      report,
      mode: "actual",
      binding: malformed as MigrationPreviewGovernanceBinding,
    });

    expect(() =>
      buildChinaSourcingOverlaysMigrationPreview(input),
    ).not.toThrow();
    expect(issueCodes(input)).toContain("rollback-contract-invalid");
  });

  it("requires the exact Ticket 11 release and ordered rollback binding", () => {
    const { ledger, report } = approveSyntheticLedger();
    const binding = governanceBinding(report.digest);
    const ticket11BoundInput = baseInput({
      ledger,
      report,
      mode: "actual",
      binding,
    });
    const driftedInput: ChinaSourcingOverlaysMigrationPreviewInput = {
      ...ticket11BoundInput,
      governanceBinding: {
        ...binding,
        rollbackOwner: "different-owner",
        rollbackSteps: [...binding.rollbackSteps].reverse(),
      },
    };

    expect(issueCodes(driftedInput)).toContain(
      "ticket11-governance-binding-mismatch",
    );
  });

  it("rejects destructive commands inherited from a tampered Ticket 11 preview", () => {
    const { ledger, report } = approveSyntheticLedger();
    const binding = governanceBinding(report.digest);
    const input = structuredClone(
      baseInput({ ledger, report, mode: "actual", binding }),
    );
    const command = input.ticket11Preview.mutationCommands[0];
    if (!command) throw new Error("Missing synthetic Ticket 11 command.");
    (
      command as unknown as {
        mutation: { routeChange: string | null };
      }
    ).mutation.routeChange = "/article/replacement-route";

    expect(issueCodes(input)).toContain("destructive-ticket11-mutation");
  });

  it("derives specialist routes only from governed reviews and blocks unbound links", () => {
    const preview = buildChinaSourcingOverlaysMigrationPreview(baseInput());
    const riskOverlay = preview.entries.find(
      ({ route }) => route === "/article/china-sourcing-risks",
    );

    expect(riskOverlay?.specialistLinks).toEqual([
      {
        clusterId: "supplier-verification",
        route: "/article/china-supplier-scams",
        source: "cannibalisation-review",
        reviewIds: ["china-sourcing-risks-vs-supplier-scams"],
      },
    ]);
    expect(riskOverlay?.requiredLinks).toContain(
      "/article/china-supplier-scams",
    );
    expect(
      preview.diagnostics.some(
        ({ code, route }) =>
          code === "overlay-specialist-link-not-ledger-bound" &&
          route === riskOverlay?.route,
      ),
    ).toBe(true);
  });

  it("fails closed when scope counts or cluster boundaries mix independent work", () => {
    const input: ChinaSourcingOverlaysMigrationPreviewInput = {
      ...baseInput(),
      scope: {
        bundleIds: ["ticket-12", "ticket-13"],
        clusterIds: ["china-sourcing", "factory-audit"],
        articleCount: 13,
        maxArticleCount: 5,
        supportingArticleCount: 10,
        industryOverlayCount: 2,
      },
    };

    const codes = issueCodes(input);
    expect(codes).toContain("overlay-scope-bundle-split-required");
    expect(codes).toContain("overlay-scope-cluster-split-required");
    expect(codes).toContain("overlay-scope-count-mismatch");
    expect(codes).toContain("overlay-scope-size-exceeded");
    expect(codes).toContain("overlay-scope-supporting-count-mismatch");
    expect(codes).toContain("overlay-scope-industry-count-mismatch");
  });

  it("rejects duplicate primary membership and canonical drift", () => {
    const ledger = mutableLedger();
    const duplicate = ledger.entries.find(
      ({ route }) => route === EXPECTED_INDUSTRY_OVERLAYS[0],
    );
    if (!duplicate) throw new Error("Missing duplicate membership entry.");
    ledger.entries.push(structuredClone(duplicate));
    const duplicateLedger = defineMigrationLedger(
      ledger as unknown as MigrationLedger,
    );
    const duplicateInput = baseInput({
      ledger: duplicateLedger,
      report: reportFor(duplicateLedger),
    });
    expect(issueCodes(duplicateInput)).toContain(
      "overlay-primary-membership-duplicate",
    );

    const canonicalInput = structuredClone(baseInput());
    const snapshot = canonicalInput.articles.find(
      ({ route }) => route === EXPECTED_INDUSTRY_OVERLAYS[0],
    );
    if (!snapshot) throw new Error("Missing canonical drift snapshot.");
    (snapshot as DeepMutable<MigrationArticleSnapshot>).canonicalRoute =
      "/article/replacement-route";
    expect(issueCodes(canonicalInput)).toContain("overlay-canonical-drift");
  });

  it("returns a planned blocker and no commands when the governed ledger has no industry overlay entries", () => {
    const ledger = mutableLedger();
    ledger.entries = ledger.entries.map((entry) =>
      entry.classification.cluster === CHINA_CLUSTER &&
      entry.classification.searchIntent === "category-sourcing"
        ? {
            ...entry,
            classification: {
              ...entry.classification,
              searchIntent: "bulk-procurement",
            },
          }
        : entry,
    );
    const frozen = defineMigrationLedger(ledger as MigrationLedger);
    const preview = buildChinaSourcingOverlaysMigrationPreview(
      baseInput({ ledger: frozen, report: reportFor(frozen) }),
    );

    expect(preview.industryOverlays).toEqual([]);
    expect(preview.status).toBe("planned");
    expect(preview.diagnostics.map(({ code }) => code)).toContain(
      "overlay-entries-not-recorded",
    );
    expect(preview.mutationCommands).toEqual([]);
  });

  it("never exposes production mutation commands, even with a locked synthetic ledger and production binding", () => {
    const { ledger, report } = approveSyntheticLedger();
    const binding = governanceBinding(report.digest);
    const input = baseInput({
      ledger,
      report,
      mode: "actual",
      binding,
    });
    expect(input.ticket11Preview.executable).toBe(true);

    const preview = buildChinaSourcingOverlaysMigrationPreview(input);
    expect(preview.executable).toBe(false);
    expect(preview.mutationCommands).toEqual([]);
    expect(preview.diagnostics.map(({ code }) => code)).toContain(
      "production-execution-disabled",
    );
  });

  it("does not mutate inputs and deep-freezes a deterministic preflight", () => {
    const input = baseInput();
    const before = structuredClone(input);
    const first = buildChinaSourcingOverlaysMigrationPreview(input);
    const second = buildChinaSourcingOverlaysMigrationPreview(input);

    expect(input).toEqual(before);
    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.entries)).toBe(true);
    expect(Object.isFrozen(first.industryOverlays)).toBe(true);
    expect(Object.isFrozen(first.scopeSplit)).toBe(true);
    expect(Object.isFrozen(first.articlePlans)).toBe(true);
  });
});
