#!/usr/bin/env node
/**
 * Package one GEO live observation into the evidence tree.
 * Usage:
 *   node scripts/seo/package-geo-observation.mjs \
 *     --cluster factory-audit \
 *     --ticket 32 \
 *     --platform chatgpt \
 *     --run-id geo-fa-20260719-chatgpt-r1 \
 *     --question-id factory-audit-01-scope \
 *     --prompt "..." \
 *     --answer-file /tmp/answer.txt \
 *     --observed-at 2026-07-19T00:00:00.000Z \
 *     --surface chatgpt-chat-web \
 *     --auth signed-in-test-account \
 *     --account-tier free \
 *     --notes "..." \
 *     [--status observed-answer|observed-surface-absent|blocked] \
 *     [--brand yes|no|not-assessable] \
 *     [--owned yes|no|not-assessable] \
 *     [--citations '[]'] \
 *     [--competitors '[]'] \
 *     [--quality-risks '[]']
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}

function sha256Text(s) {
  return `sha256:${createHash("sha256").update(s, "utf8").digest("hex")}`;
}

const cluster = arg("cluster");
const ticket = Number(arg("ticket"));
const platform = arg("platform");
const runId = arg("run-id");
const questionId = arg("question-id");
const prompt = arg("prompt");
const answerFile = arg("answer-file");
const observedAt = arg("observed-at") || new Date().toISOString();
const surface = arg("surface") || platform;
const auth = arg("auth") || "signed-in-test-account";
const accountTier = arg("account-tier") || "free";
const notes = arg("notes") || "";
const status = arg("status") || "observed-answer";
const brandMention = arg("brand") || "no";
const ownedUrlCited = arg("owned") || "no";
const citations = JSON.parse(arg("citations", "[]"));
const competitors = JSON.parse(arg("competitors", "[]"));
const qualityRisks = JSON.parse(arg("quality-risks", "[]"));
const locale = arg("locale") || "en-AU";
const device = arg("device") || "desktop";
const digest = arg("digest");
const questionSetPath = arg(
  "question-set-path",
  `content/seo/geo/questions/${cluster}.json`,
);

if (!cluster || !ticket || !platform || !runId || !questionId || !prompt || !answerFile || !digest) {
  console.error("missing required args");
  process.exit(1);
}

const root = process.cwd();
const evidenceRoot = join(root, "content/seo/geo/evidence/live", runId);
const obsId = `${runId}__${questionId}`;
const snapRel = `content/seo/geo/evidence/live/${runId}/snapshots/${obsId}.txt`;
const obsRel = `content/seo/geo/evidence/live/${runId}/observations/${obsId}.json`;
const snapAbs = join(root, snapRel);
const obsAbs = join(root, obsRel);

mkdirSync(dirname(snapAbs), { recursive: true });
mkdirSync(dirname(obsAbs), { recursive: true });

const answerText = readFileSync(answerFile, "utf8");
const snapshotHash = sha256Text(answerText);
const promptHash = sha256Text(prompt);
writeFileSync(snapAbs, answerText);

// brand/owned heuristics if not overridden via args already set
let brand = brandMention;
let owned = ownedUrlCited;
const lower = answerText.toLowerCase();
if (arg("brand") == null) {
  brand = lower.includes("winning adventure global") ? "yes" : "no";
}
if (arg("owned") == null) {
  owned =
    lower.includes("winningadventure.com.au") ||
    lower.includes("www.winningadventure.com.au")
      ? "yes"
      : "no";
}

const observation = {
  observationId: obsId,
  platform,
  questionId,
  prompt,
  promptHash,
  observedAt,
  locale,
  device,
  auth,
  accountTier,
  status,
  statusReason: status === "observed-answer" ? null : arg("status-reason") || status,
  surface,
  brandMention: brand,
  ownedUrlCited: owned,
  accuracy: "not-assessable",
  completeness: "not-assessable",
  competitors,
  citations,
  qualityRisks,
  snapshot: {
    path: snapRel,
    hash: snapshotHash,
    mimeType: "text/plain",
    capture: "text",
  },
  provenance: "external-platform-observation",
  fixtureOnly: false,
  claimMode: "observation-only",
  operator: "codex-chrome-capture",
  notes,
};

writeFileSync(obsAbs, JSON.stringify(observation, null, 2) + "\n");

// upsert manifest questions list from question set
const qs = JSON.parse(readFileSync(join(root, questionSetPath), "utf8"));
const manifestPath = join(evidenceRoot, "manifest.json");
let manifest;
if (existsSync(manifestPath)) {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} else {
  manifest = {
    runId,
    platform,
    schemaVersion: "geo-live-capture-v1",
    methodologyVersion: "methodology-live-v1",
    benchmarkVersion: "benchmark-live-v1",
    questionSetVersion: String(qs.version),
    questionSetPath,
    questionSetDigest: digest,
    cluster,
    ticket,
    fixtureOnly: false,
    provenance: "external-platform-observation",
    locale,
    device,
    auth,
    accountTier,
    expectedRepetitions: 1,
    asOf: observedAt,
    questions: qs.questions.map((q) => ({ id: q.id, prompt: q.prompt })),
    evidencePath: `content/seo/geo/evidence/live/${runId}`,
    blocked: false,
  };
}
// keep asOf as first observation time if earlier
if (new Date(observedAt) < new Date(manifest.asOf)) {
  manifest.asOf = observedAt;
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

// append capture log
const logPath = join(evidenceRoot, "capture-log.md");
const logLine = `\n## ${questionId}\n- Status: ${status}\n- Brand: ${brand}\n- Owned URL: ${owned}\n- Snapshot: ${snapshotHash}\n- Notes: ${notes}\n- Observed at: ${observedAt}\n`;
if (!existsSync(logPath)) {
  writeFileSync(
    logPath,
    `# Capture log — ${runId}\n\n- Platform: ${platform}\n- Cluster: ${cluster}\n- Ticket: ${ticket}\n- Digest: ${digest}\n- Operator: codex-chrome-capture\n- Claim mode: observation-only\n`,
  );
}
writeFileSync(logPath, readFileSync(logPath, "utf8") + logLine);

console.log(JSON.stringify({ ok: true, observationId: obsId, brand, owned, snapshotHash }, null, 2));
