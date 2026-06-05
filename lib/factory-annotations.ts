import { Redis } from "@upstash/redis"

/**
 * AI-native annotation schema.
 *
 * Each annotation is a structured "test case" — the employee specifies what the
 * scraper got vs what the 1688 page actually shows. AI reads open annotations,
 * groups by issueType/fieldName, identifies patterns, and fixes crawl scripts.
 */

export type IssueType =
  | "wrong_value"      // Scraper extracted wrong data
  | "missing_value"    // Field should have data but scraper got empty
  | "parsing_error"    // Scraper garbled the value (encoding, format)
  | "truncation_error" // Value was cut off (e.g. "为你推荐" issue)
  | "extra_data"       // Scraper included data from wrong source (cross-contamination)
  | "other"

export interface Annotation {
  id: string
  memberId: string
  slug: string
  companyName: string

  // Which field is wrong
  fieldName: string
  fieldLabel: string

  // AI-native: structured bug report
  issueType: IssueType
  expectedValue: string   // What 1688 page actually shows
  actualValue: string     // What the scraper extracted (auto-filled from DB)
  comment: string         // Optional human context

  // AI action tracking
  status: "open" | "analyzed" | "script_fixed" | "verified" | "ignored"
  aiAnalysis: string      // AI's root cause analysis
  scriptFix: string       // Description of script change made
  fixCommit: string       // Reference to the fix

  createdAt: string
  createdBy: string       // Employee email (for attribution)
}

export interface AnnotationPattern {
  issueType: IssueType
  fieldName: string
  count: number
  affectedFactories: string[]
  likelyRootCause: string
  suggestedFix: string
  priority: "high" | "medium" | "low"
}

const ANNOTATIONS_KEY = "factory:annotations"
const redisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

const memoryStore: Annotation[] = []

function genId(): string {
  return `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getRedis(): Redis | null {
  if (!redisConfigured) return null
  try {
    return Redis.fromEnv()
  } catch {
    return null
  }
}

// --- CRUD ---

export async function getAnnotations(): Promise<Annotation[]> {
  const redis = getRedis()
  if (redis) {
    try {
      const data = await redis.get<Annotation[]>(ANNOTATIONS_KEY)
      return data || []
    } catch { /* fall through */ }
  }
  return memoryStore
}

export async function addAnnotation(input: {
  memberId: string; slug: string; companyName: string
  fieldName: string; fieldLabel: string
  issueType: IssueType; expectedValue: string; actualValue: string
  comment?: string; createdBy?: string
}): Promise<Annotation> {
  const annotation: Annotation = {
    id: genId(),
    memberId: input.memberId,
    slug: input.slug,
    companyName: input.companyName,
    fieldName: input.fieldName,
    fieldLabel: input.fieldLabel,
    issueType: input.issueType,
    expectedValue: input.expectedValue,
    actualValue: input.actualValue,
    comment: input.comment || "",
    status: "open",
    aiAnalysis: "",
    scriptFix: "",
    fixCommit: "",
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy || "anonymous",
  }

  const redis = getRedis()
  if (redis) {
    try {
      const existing = (await redis.get<Annotation[]>(ANNOTATIONS_KEY)) || []
      existing.push(annotation)
      await redis.set(ANNOTATIONS_KEY, existing)
      return annotation
    } catch { /* fall through */ }
  }

  memoryStore.push(annotation)
  return annotation
}

export async function updateAnnotation(
  id: string,
  update: Partial<Pick<Annotation, "status" | "aiAnalysis" | "scriptFix" | "fixCommit">>
): Promise<Annotation | null> {
  const redis = getRedis()
  const store = redis ? ((await redis.get<Annotation[]>(ANNOTATIONS_KEY)) || []) : memoryStore

  const idx = store.findIndex((a) => a.id === id)
  if (idx === -1) return null

  Object.assign(store[idx], update)

  if (redis) {
    await redis.set(ANNOTATIONS_KEY, store)
  }

  return store[idx]
}

// --- AI Analysis ---

/**
 * Analyze open annotations and identify fix patterns.
 * AI calls this to get a prioritized list of issues to fix in the crawl scripts.
 */
export async function analyzePatterns(): Promise<AnnotationPattern[]> {
  const annotations = await getAnnotations()
  const open = annotations.filter((a) => a.status === "open")

  // Group by issueType + fieldName
  const groups = new Map<string, Annotation[]>()
  for (const ann of open) {
    const key = `${ann.issueType}:${ann.fieldName}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(ann)
  }

  const patterns: AnnotationPattern[] = []
  for (const [key, anns] of groups) {
    const [issueType, fieldName] = key.split(":") as [IssueType, string]

    patterns.push({
      issueType,
      fieldName,
      count: anns.length,
      affectedFactories: anns.map((a) => a.memberId),
      likelyRootCause: inferRootCause(issueType, fieldName, anns),
      suggestedFix: suggestFix(issueType, fieldName, anns),
      priority: anns.length >= 3 ? "high" : anns.length >= 2 ? "medium" : "low",
    })
  }

  return patterns.sort((a, b) => {
    const prio = { high: 3, medium: 2, low: 1 }
    return prio[b.priority] - prio[a.priority]
  })
}

function inferRootCause(issueType: IssueType, fieldName: string, anns: Annotation[]): string {
  switch (issueType) {
    case "truncation_error":
      return `"为你推荐" cutoff is too early or missing for field "${fieldName}". Check crawl-factory-cli.py card_text truncation logic.`
    case "missing_value":
      return `Field "${fieldName}" extraction selector may be broken or the DOM structure changed. Check the extraction logic for this field.`
    case "parsing_error":
      return `GBK/UTF-8 encoding issue or format mismatch for field "${fieldName}". Check URL encoding and text parsing.`
    case "wrong_value":
      return `Field "${fieldName}" extracted from wrong DOM element. May be capturing data from recommended factories section.`
    case "extra_data":
      return `Cross-contamination from "为你推荐" similar factories. Card text truncation not applied before extracting "${fieldName}".`
    default:
      return `Unknown root cause for "${fieldName}". Need manual investigation.`
  }
}

function suggestFix(issueType: IssueType, fieldName: string, anns: Annotation[]): string {
  const exampleIds = anns.slice(0, 3).map((a) => a.memberId).join(", ")

  switch (issueType) {
    case "truncation_error":
      return `Verify card_text truncation at "为你推荐" in crawl-factory-cli.py. Test with: python3 scripts/crawl-factory-cli.py ${anns[0].memberId}`
    case "missing_value":
      return `Inspect DOM for "${fieldName}" on factory card: browser-use --session default open "https://sale.1688.com/factory/card.html?memberId=${anns[0].memberId}". Update selector in crawl-factory-cli.py.`
    case "parsing_error":
      return `Check GBK encoding for "${fieldName}" extraction. Test with memberIds: ${exampleIds}`
    case "wrong_value":
    case "extra_data":
      return `Re-verify card_text truncation logic. Affected: ${exampleIds}`
    default:
      return `Manual investigation needed for: ${exampleIds}`
  }
}
