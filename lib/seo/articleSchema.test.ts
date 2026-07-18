import {
  ARTICLE_GOVERNED_FIELDS,
  ArticleValidationError,
  deriveContentId,
  parseArticleFrontmatter,
} from "./articleSchema";

const VALID_DISPLAY = {
  title: "How to Check a Chinese Company on SAMR (2026)",
  description: "Check a Chinese company registration on GSXT.",
  author: "Andy Liu",
  category: "China Sourcing Strategy",
  date: "2026-07-16",
  readTime: "14 min read",
  ctaTitle: "Need the company checked before you pay?",
  ctaText: "We verify the legal entity before deposit.",
  ctaButtonText: "Request a Verification Plan",
  coverImage: "/social/blog/check-chinese-company-samr/cover.webp",
  slug: "/article/check-chinese-company-samr",
};

const VALID_GOVERNED = {
  contentId: "article.check-chinese-company-samr",
  cluster: "supplier-verification",
  contentRole: "supporting",
  searchIntent: "company-registry-check",
  funnelStage: "problem-aware",
  primaryKeyword: "check Chinese company SAMR",
  secondaryKeywords: ["GSXT company search"],
  targetMarket: "AU",
  editorialStatus: "approved",
  evidenceIds: ["ev.gsxt.overview"],
  firstPartyContributionId: null,
  commercialRoot: "/supplier-verification",
  editorialPillar: "/article/verify-chinese-supplier",
  requiredLinks: ["/supplier-verification", "/article/verify-chinese-supplier"],
  reviewedBy: "Andy Liu",
  reviewedDate: "2026-07-16",
  reviewDueDate: "2027-01-12",
  migrationAction: "keep",
};

describe("parseArticleFrontmatter", () => {
  it("derives the canonical governed-field contract from the schema", () => {
    expect(ARTICLE_GOVERNED_FIELDS).toContain("secondaryKeywords");
    expect(ARTICLE_GOVERNED_FIELDS).toContain("firstPartyContributionId");
    expect(new Set(ARTICLE_GOVERNED_FIELDS).size).toBe(
      ARTICLE_GOVERNED_FIELDS.length,
    );
  });

  it("treats nullable first-party contribution data as present in strict mode", () => {
    const result = parseArticleFrontmatter(
      { ...VALID_DISPLAY, ...VALID_GOVERNED, firstPartyContributionId: null },
      "check-chinese-company-samr",
      "strict",
    );

    expect(result.frontmatter.firstPartyContributionId).toBeNull();
    expect(result.warnings).toEqual([]);
  });

  it("requires secondary keywords and first-party contribution presence in strict mode", () => {
    const { secondaryKeywords: _secondary, ...withoutSecondary } =
      VALID_GOVERNED;
    const { firstPartyContributionId: _firstParty, ...withoutFirstParty } =
      VALID_GOVERNED;
    void _secondary;
    void _firstParty;

    expect(() =>
      parseArticleFrontmatter(
        { ...VALID_DISPLAY, ...withoutSecondary },
        "missing-secondary-keywords",
        "strict",
      ),
    ).toThrow(/secondaryKeywords/);
    expect(() =>
      parseArticleFrontmatter(
        { ...VALID_DISPLAY, ...withoutFirstParty },
        "missing-first-party-contribution",
        "strict",
      ),
    ).toThrow(/firstPartyContributionId/);
  });
  it("accepts a fully governed article without warnings", () => {
    const result = parseArticleFrontmatter(
      { ...VALID_DISPLAY, ...VALID_GOVERNED },
      "check-chinese-company-samr",
      "compatibility",
    );

    expect(result.warnings).toEqual([]);
    expect(result.frontmatter.contentId).toBe(
      "article.check-chinese-company-samr",
    );
    expect(result.frontmatter.cluster).toBe("supplier-verification");
    expect(result.frontmatter.title).toBe(VALID_DISPLAY.title);
  });

  it("accepts legacy display-only frontmatter with deterministic governed warnings", () => {
    const first = parseArticleFrontmatter(
      { ...VALID_DISPLAY },
      "check-chinese-company-samr",
      "compatibility",
    );
    const second = parseArticleFrontmatter(
      { ...VALID_DISPLAY },
      "check-chinese-company-samr",
      "compatibility",
    );

    expect(first.frontmatter.contentId).toBe(
      deriveContentId("check-chinese-company-samr"),
    );
    expect(first.warnings.length).toBeGreaterThan(0);
    expect(
      first.warnings.every((w) => w.articleId === "check-chinese-company-samr"),
    ).toBe(true);
    expect(
      first.warnings.some((w) => w.code === "missing_governed_field"),
    ).toBe(true);
    expect(first.warnings.map((w) => `${w.field}:${w.code}`)).toEqual(
      second.warnings.map((w) => `${w.field}:${w.code}`),
    );
  });

  it("uses legacy desc as description and records an alias warning", () => {
    const { description: _drop, ...withoutDescription } = VALID_DISPLAY;
    void _drop;
    const result = parseArticleFrontmatter(
      { ...withoutDescription, desc: "Legacy summary used as description." },
      "legacy-desc-article",
      "compatibility",
    );

    expect(result.frontmatter.description).toBe(
      "Legacy summary used as description.",
    );
    expect(
      result.warnings.some(
        (w) => w.code === "legacy_field_alias" && w.field === "description",
      ),
    ).toBe(true);
  });

  it("fails hard when required display fields are missing", () => {
    expect(() =>
      parseArticleFrontmatter(
        { ...VALID_DISPLAY, title: "" },
        "broken-title",
        "compatibility",
      ),
    ).toThrow(ArticleValidationError);

    try {
      parseArticleFrontmatter(
        { ...VALID_DISPLAY, title: "" },
        "broken-title",
        "compatibility",
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ArticleValidationError);
      const validationError = error as ArticleValidationError;
      expect(validationError.articleId).toBe("broken-title");
      expect(validationError.field).toBe("title");
      expect(validationError.message).toContain("broken-title");
      expect(validationError.message).toContain("title");
    }
  });

  it("fails hard when a present governed enum is invalid", () => {
    expect(() =>
      parseArticleFrontmatter(
        { ...VALID_DISPLAY, cluster: "not-a-real-cluster" },
        "bad-cluster",
        "compatibility",
      ),
    ).toThrow(ArticleValidationError);

    try {
      parseArticleFrontmatter(
        { ...VALID_DISPLAY, cluster: "not-a-real-cluster" },
        "bad-cluster",
        "compatibility",
      );
    } catch (error) {
      const validationError = error as ArticleValidationError;
      expect(validationError.articleId).toBe("bad-cluster");
      expect(validationError.field).toBe("cluster");
    }
  });

  it("requires governed fields in strict mode", () => {
    expect(() =>
      parseArticleFrontmatter({ ...VALID_DISPLAY }, "strict-missing", "strict"),
    ).toThrow(ArticleValidationError);
  });

  it("warns when frontmatter slug disagrees with the filename slug", () => {
    const result = parseArticleFrontmatter(
      { ...VALID_DISPLAY, slug: "/article/other-slug" },
      "check-chinese-company-samr",
      "compatibility",
    );

    expect(
      result.warnings.some(
        (w) => w.code === "slug_mismatch" && w.field === "slug",
      ),
    ).toBe(true);
  });
});
