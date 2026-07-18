import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { buildSeoGovernanceArtifacts } from "./index";
import type {
  SeoBaselineIdentity,
  SeoGovernanceBuildOptions,
  SeoGovernanceBuildResult,
} from "./types";

export const FIXTURES_ROOT = path.join(__dirname, "__fixtures__");
export const PROJECT_ROOT = path.resolve(__dirname, "../../..");

export const EVIDENCE_REGISTRY_SOURCE = fs.readFileSync(
  path.join(FIXTURES_ROOT, "shared/evidence-registry.yaml"),
  "utf8",
);

export const FIXTURE_BASELINE: readonly SeoBaselineIdentity[] = [
  {
    contentId: "article.supplier-check",
    slug: "supplier-check",
    route: "/article/supplier-check",
  },
  {
    contentId: "article.supplier-pillar",
    slug: "supplier-pillar",
    route: "/article/supplier-pillar",
  },
];

export function buildFixture(
  name: string,
  overrides: Partial<SeoGovernanceBuildOptions> = {},
): SeoGovernanceBuildResult {
  return buildSeoGovernanceArtifacts({
    rootDir: path.join(FIXTURES_ROOT, name),
    evidenceRegistrySource: EVIDENCE_REGISTRY_SOURCE,
    baselineCohort: FIXTURE_BASELINE,
    mode: "compatibility",
    strictScope: "migrated",
    asOfDate: "2026-07-18",
    ...overrides,
  });
}

export function makeTemporaryProject(fixture = "passing"): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "seo-governance-"));
  fs.cpSync(path.join(FIXTURES_ROOT, fixture), root, { recursive: true });

  const registryPath = path.join(root, "content/seo/evidence/registry.yaml");
  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.writeFileSync(registryPath, EVIDENCE_REGISTRY_SOURCE, "utf8");

  return root;
}
