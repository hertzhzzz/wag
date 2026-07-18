import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  compareUnicodeCodePoints,
  loadQuestionSetCatalog,
  parseQuestionSet,
} from "./index";

const VALID_QUESTIONS = [
  {
    id: "supplier-verification-01-registration-records",
    prompt:
      "What official records should an Australian importer check before engaging a supplier in China?",
    buyerStage: "problem-aware",
    intent: "informational",
    targetMarket: "AU",
  },
  {
    id: "supplier-verification-02-manufacturer-or-trader",
    prompt:
      "How can an Australian buyer distinguish a Chinese manufacturer from a trading company?",
    buyerStage: "solution-aware",
    intent: "risk",
    targetMarket: "AU",
  },
  {
    id: "supplier-verification-03-export-evidence",
    prompt:
      "What evidence should I request to verify that a Chinese supplier can legally export my product?",
    buyerStage: "evaluation",
    intent: "decision",
    targetMarket: "AU",
  },
  {
    id: "supplier-verification-04-service-scope",
    prompt:
      "What should be included in a paid supplier verification service for an Australian importer?",
    buyerStage: "evaluation",
    intent: "commercial",
    targetMarket: "AU",
  },
  {
    id: "supplier-verification-05-legal-identity",
    prompt:
      "How can I verify the Chinese legal name and Unified Social Credit Code on a supplier's documents?",
    buyerStage: "solution-aware",
    intent: "informational",
    targetMarket: "AU-NZ",
  },
  {
    id: "supplier-verification-06-false-documents",
    prompt:
      "What warning signs suggest that a Chinese supplier's business licence or certificates may be false?",
    buyerStage: "evaluation",
    intent: "risk",
    targetMarket: "AU-NZ",
  },
  {
    id: "supplier-verification-07-remote-or-onsite",
    prompt:
      "When is remote supplier verification enough, and when should an Australian buyer commission an on-site check?",
    buyerStage: "decision",
    intent: "decision",
    targetMarket: "AU",
  },
  {
    id: "supplier-verification-08-bank-details",
    prompt:
      "How should I verify bank account details before paying a new Chinese supplier?",
    buyerStage: "decision",
    intent: "risk",
    targetMarket: "AU-NZ",
  },
  {
    id: "supplier-verification-09-compare-services",
    prompt:
      "How should an Australian business compare supplier verification services for work in China?",
    buyerStage: "evaluation",
    intent: "commercial",
    targetMarket: "AU",
  },
  {
    id: "supplier-verification-10-stop-findings",
    prompt:
      "What supplier verification findings should stop an Australian buyer from proceeding with a purchase order?",
    buyerStage: "decision",
    intent: "decision",
    targetMarket: "AU",
  },
] as const;

describe("parseQuestionSet", () => {
  it("accepts one draft, versioned set containing exactly ten diverse buyer questions", () => {
    const result = parseQuestionSet({
      version: 1,
      asOfDate: "2026-07-18",
      cluster: "supplier-verification",
      status: "draft",
      questions: VALID_QUESTIONS,
    });

    expect(result).toMatchObject({
      version: 1,
      asOfDate: "2026-07-18",
      cluster: "supplier-verification",
      status: "draft",
    });
    expect(result.questions).toHaveLength(10);
    expect(new Set(result.questions.map(({ intent }) => intent))).toEqual(
      new Set(["informational", "commercial", "risk", "decision"]),
    );
  });
});

function createValidQuestionSet(): Record<string, unknown> {
  return {
    version: 1,
    asOfDate: "2026-07-18",
    cluster: "supplier-verification",
    status: "draft",
    questions: VALID_QUESTIONS.map((question) => ({ ...question })),
  };
}

describe("question identity and prompt safety", () => {
  it.each([
    ["non-machine ID", { id: "Supplier Verification 01" }],
    ["blank prompt", { prompt: "   " }],
    ["non-English prompt", { prompt: "如何验证中国供应商？" }],
    [
      "brand prompt",
      {
        prompt:
          "Why should I hire Winning Adventure Global for supplier verification?",
      },
    ],
    [
      "brand acronym prompt",
      { prompt: "Should WAG verify my supplier in China?" },
    ],
    [
      "recommendation inducement",
      {
        prompt:
          "Recommend a supplier verification company for an Australian importer?",
      },
    ],
    [
      "ranking claim",
      {
        prompt: "Which is the best supplier verification company in Australia?",
      },
    ],
    [
      "provider-selection inducement",
      {
        prompt:
          "Which supplier verification company should I use for a China order?",
      },
    ],
  ])("rejects a %s", (_label, replacement) => {
    const input = createValidQuestionSet();
    const questions = input.questions as Array<Record<string, unknown>>;
    questions[0] = { ...questions[0], ...replacement };

    expect(() => parseQuestionSet(input)).toThrow();
  });

  it("rejects unknown fields at both the set and question boundaries", () => {
    const topLevel = { ...createValidQuestionSet(), approved: true };
    const questionLevel = createValidQuestionSet();
    const questions = questionLevel.questions as Array<Record<string, unknown>>;
    questions[0] = { ...questions[0], approved: true };

    expect(() => parseQuestionSet(topLevel)).toThrow();
    expect(() => parseQuestionSet(questionLevel)).toThrow();
  });
});

describe("single-set governance", () => {
  it("rejects a set that does not cover informational, commercial, risk, and decision intents", () => {
    const input = createValidQuestionSet();
    const questions = input.questions as Array<Record<string, unknown>>;
    input.questions = questions.map((question) => ({
      ...question,
      intent: "informational",
    }));

    expect(() => parseQuestionSet(input)).toThrow(/intent/i);
  });

  it("rejects duplicate IDs and normalized prompts within one set", () => {
    const duplicateId = createValidQuestionSet();
    const idQuestions = duplicateId.questions as Array<Record<string, unknown>>;
    idQuestions[1] = { ...idQuestions[1], id: idQuestions[0].id };

    const duplicatePrompt = createValidQuestionSet();
    const promptQuestions = duplicatePrompt.questions as Array<
      Record<string, unknown>
    >;
    promptQuestions[1] = {
      ...promptQuestions[1],
      prompt:
        "  What   official records should an Australian importer check before engaging a supplier in China?  ".trim(),
    };

    expect(() => parseQuestionSet(duplicateId)).toThrow(/duplicate.*id/i);
    expect(() => parseQuestionSet(duplicatePrompt)).toThrow(
      /duplicate.*prompt/i,
    );
  });

  it.each([
    ["non-draft status", { status: "approved" }],
    ["wrong version", { version: 2 }],
    ["implicit date drift", { asOfDate: "2026-07-19" }],
  ])("rejects %s", (_label, replacement) => {
    expect(() =>
      parseQuestionSet({ ...createValidQuestionSet(), ...replacement }),
    ).toThrow();
  });

  it("rejects fewer or more than ten questions", () => {
    const fewer = createValidQuestionSet();
    fewer.questions = (fewer.questions as Array<Record<string, unknown>>).slice(
      0,
      9,
    );

    const more = createValidQuestionSet();
    more.questions = [
      ...(more.questions as Array<Record<string, unknown>>),
      {
        ...(more.questions as Array<Record<string, unknown>>)[0],
        id: "supplier-verification-11-extra",
        prompt:
          "What additional supplier evidence can an Australian buyer request before contracting?",
      },
    ];

    expect(() => parseQuestionSet(fewer)).toThrow();
    expect(() => parseQuestionSet(more)).toThrow();
  });
});

const EXPECTED_CLUSTER_IDS = [
  "supplier-verification",
  "factory-audit",
  "quality-inspection",
  "factory-visits",
  "china-sourcing",
] as const;

const FIXTURE_LABELS: Record<(typeof EXPECTED_CLUSTER_IDS)[number], string> = {
  "supplier-verification": "supplier verification",
  "factory-audit": "factory audit",
  "quality-inspection": "quality inspection",
  "factory-visits": "factory visit",
  "china-sourcing": "China sourcing",
};

const FIXTURE_INTENTS = [
  "informational",
  "commercial",
  "risk",
  "decision",
] as const;

const FIXTURE_BUYER_STAGES = [
  "problem-aware",
  "solution-aware",
  "evaluation",
  "decision",
] as const;

function createFixtureSet(cluster: (typeof EXPECTED_CLUSTER_IDS)[number]) {
  return {
    version: 1,
    asOfDate: "2026-07-18",
    cluster,
    status: "draft",
    questions: Array.from({ length: 10 }, (_, index) => ({
      id: `${cluster}-${String(index + 1).padStart(2, "0")}-fixture`,
      prompt: `What ${FIXTURE_LABELS[cluster]} consideration ${String(index + 1).padStart(2, "0")} should an Australian buyer review before making a sourcing decision?`,
      buyerStage: FIXTURE_BUYER_STAGES[index % FIXTURE_BUYER_STAGES.length],
      intent: FIXTURE_INTENTS[index % FIXTURE_INTENTS.length],
      targetMarket: index % 2 === 0 ? "AU" : "AU-NZ",
    })),
  };
}

function writeFixtureCatalog(
  mutate?: (
    sets: Record<
      (typeof EXPECTED_CLUSTER_IDS)[number],
      ReturnType<typeof createFixtureSet>
    >,
    directory: string,
  ) => void,
): string {
  const projectRoot = mkdtempSync(join(tmpdir(), "question-set-catalog-"));
  const directory = join(projectRoot, "content", "seo", "geo", "questions");
  mkdirSync(directory, { recursive: true });

  const sets = Object.fromEntries(
    EXPECTED_CLUSTER_IDS.map((cluster) => [cluster, createFixtureSet(cluster)]),
  ) as Record<
    (typeof EXPECTED_CLUSTER_IDS)[number],
    ReturnType<typeof createFixtureSet>
  >;

  mutate?.(sets, directory);

  for (const cluster of EXPECTED_CLUSTER_IDS) {
    writeFileSync(
      join(directory, `${cluster}.json`),
      `${JSON.stringify(sets[cluster], null, 2)}\n`,
      "utf8",
    );
  }

  return projectRoot;
}

describe("question set catalog loader", () => {
  const projectRoots: string[] = [];

  afterEach(() => {
    for (const projectRoot of projectRoots.splice(0)) {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it("loads only from an explicit project root and returns canonical cluster order with code-point-sorted questions", () => {
    const projectRoot = writeFixtureCatalog((sets) => {
      for (const set of Object.values(sets)) {
        set.questions.reverse();
      }
    });
    projectRoots.push(projectRoot);

    const result = loadQuestionSetCatalog({ projectRoot });

    expect(result.map(({ cluster }) => cluster)).toEqual(EXPECTED_CLUSTER_IDS);
    expect(result).toHaveLength(5);
    expect(result.flatMap(({ questions }) => questions)).toHaveLength(50);
    expect(result[0].questions.map(({ id }) => id)).toEqual(
      [...result[0].questions.map(({ id }) => id)].sort(
        compareUnicodeCodePoints,
      ),
    );
  });

  it("uses Unicode code points rather than locale or UTF-16 ordering", () => {
    expect(compareUnicodeCodePoints("\uE000", "\u{10000}")).toBeLessThan(0);
    expect(compareUnicodeCodePoints("same", "same")).toBe(0);
    expect(compareUnicodeCodePoints("b", "a")).toBeGreaterThan(0);
  });
});

describe("question set catalog failure paths", () => {
  const projectRoots: string[] = [];

  afterEach(() => {
    for (const projectRoot of projectRoots.splice(0)) {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  function track(projectRoot: string): string {
    projectRoots.push(projectRoot);
    return projectRoot;
  }

  it("rejects a relative root instead of falling back to the process cwd", () => {
    expect(() =>
      loadQuestionSetCatalog({ projectRoot: "relative-project-root" }),
    ).toThrow(/absolute path/i);
  });

  it("rejects missing and unexpected cluster files", () => {
    const missingRoot = track(writeFixtureCatalog());
    unlinkSync(
      join(
        missingRoot,
        "content",
        "seo",
        "geo",
        "questions",
        "factory-audit.json",
      ),
    );

    const extraRoot = track(writeFixtureCatalog());
    const extraDirectory = join(
      extraRoot,
      "content",
      "seo",
      "geo",
      "questions",
    );
    writeFileSync(
      join(extraDirectory, "unknown-cluster.json"),
      `${JSON.stringify(createFixtureSet("supplier-verification"), null, 2)}\n`,
      "utf8",
    );

    expect(() => loadQuestionSetCatalog({ projectRoot: missingRoot })).toThrow(
      /missing.*factory-audit\.json/i,
    );
    expect(() => loadQuestionSetCatalog({ projectRoot: extraRoot })).toThrow(
      /unexpected.*unknown-cluster\.json/i,
    );
  });

  it("rejects a file whose declared cluster does not match its filename", () => {
    const projectRoot = track(
      writeFixtureCatalog((sets) => {
        sets["supplier-verification"].cluster = "factory-audit";
      }),
    );

    expect(() => loadQuestionSetCatalog({ projectRoot })).toThrow(
      /supplier-verification\.json declares cluster factory-audit/i,
    );
  });

  it("rejects IDs and normalized prompts duplicated across clusters", () => {
    const duplicateIdRoot = track(
      writeFixtureCatalog((sets) => {
        sets["factory-audit"].questions[0].id =
          sets["supplier-verification"].questions[0].id;
      }),
    );
    const duplicatePromptRoot = track(
      writeFixtureCatalog((sets) => {
        sets["factory-audit"].questions[0].prompt =
          `  ${sets["supplier-verification"].questions[0].prompt.replaceAll(" ", "   ")}  `.trim();
      }),
    );

    expect(() =>
      loadQuestionSetCatalog({ projectRoot: duplicateIdRoot }),
    ).toThrow(/duplicate.*id/i);
    expect(() =>
      loadQuestionSetCatalog({ projectRoot: duplicatePromptRoot }),
    ).toThrow(/duplicate.*prompt/i);
  });
});

const EXPECTED_REAL_QUESTION_IDS = {
  "supplier-verification": [
    "supplier-verification-01-registration-records",
    "supplier-verification-02-manufacturer-or-trader",
    "supplier-verification-03-export-evidence",
    "supplier-verification-04-service-scope",
    "supplier-verification-05-legal-identity",
    "supplier-verification-06-false-documents",
    "supplier-verification-07-remote-or-onsite",
    "supplier-verification-08-bank-details",
    "supplier-verification-09-compare-services",
    "supplier-verification-10-stop-findings",
  ],
  "factory-audit": [
    "factory-audit-01-scope",
    "factory-audit-02-audit-or-verification",
    "factory-audit-03-records",
    "factory-audit-04-capacity",
    "factory-audit-05-subcontracting",
    "factory-audit-06-quality-system",
    "factory-audit-07-technical-audit",
    "factory-audit-08-report",
    "factory-audit-09-compare-services",
    "factory-audit-10-stop-findings",
  ],
  "quality-inspection": [
    "quality-inspection-01-stage",
    "quality-inspection-02-aql",
    "quality-inspection-03-report",
    "quality-inspection-04-checklist",
    "quality-inspection-05-defect-classes",
    "quality-inspection-06-during-production",
    "quality-inspection-07-failed-inspection",
    "quality-inspection-08-reinspection",
    "quality-inspection-09-compare-services",
    "quality-inspection-10-packaging-compliance",
  ],
  "factory-visits": [
    "factory-visits-01-itinerary",
    "factory-visits-02-meeting-agenda",
    "factory-visits-03-independent-support",
    "factory-visits-04-production-evidence",
    "factory-visits-05-staged-visit-risks",
    "factory-visits-06-multiple-factories",
    "factory-visits-07-confidentiality",
    "factory-visits-08-questions-to-ask",
    "factory-visits-09-compare-services",
    "factory-visits-10-post-visit-decision",
  ],
  "china-sourcing": [
    "china-sourcing-01-buying-brief",
    "china-sourcing-02-landed-cost",
    "china-sourcing-03-shortlist",
    "china-sourcing-04-direct-or-agent",
    "china-sourcing-05-moq-negotiation",
    "china-sourcing-06-payment-risk",
    "china-sourcing-07-samples-pilot",
    "china-sourcing-08-ip-confidentiality",
    "china-sourcing-09-compliance-roles",
    "china-sourcing-10-compare-services",
  ],
} as const;

describe("versioned draft question content", () => {
  it("loads five real candidate sets with exactly fifty stable question IDs", () => {
    const projectRoot = join(__dirname, "..", "..", "..");
    const result = loadQuestionSetCatalog({ projectRoot });

    expect(result.map(({ cluster }) => cluster)).toEqual(EXPECTED_CLUSTER_IDS);
    expect(
      Object.fromEntries(
        result.map((set) => [set.cluster, set.questions.map(({ id }) => id)]),
      ),
    ).toEqual(EXPECTED_REAL_QUESTION_IDS);
    expect(
      result.every(
        (set) =>
          set.version === 1 &&
          set.asOfDate === "2026-07-18" &&
          set.status === "draft" &&
          set.questions.length === 10,
      ),
    ).toBe(true);
    expect(
      new Set(result.flatMap(({ questions }) => questions.map(({ id }) => id))),
    ).toHaveProperty("size", 50);
  });
});
