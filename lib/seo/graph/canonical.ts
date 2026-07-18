import { createHash } from "node:crypto";

import { graphInputSchema, GraphContractError, type GraphInput } from "./types";

export function compareCodePoints(left: string, right: string): number {
  const a = Array.from(left, (value) => value.codePointAt(0) ?? 0);
  const b = Array.from(right, (value) => value.codePointAt(0) ?? 0);
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return a.length - b.length;
}

function normalizeString(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function containsControlCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if ((codePoint >= 0 && codePoint <= 31) || codePoint === 127) return true;
  }
  return false;
}

function assertSafeStrings(
  value: unknown,
  path: string,
  issues: string[],
): void {
  if (typeof value === "string") {
    if (containsControlCharacter(value)) {
      issues.push(`${path} contains a control character`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertSafeStrings(item, `${path}[${index}]`, issues),
    );
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      assertSafeStrings(item, `${path}.${key}`, issues);
    });
  }
}

function sortObject(value: unknown): unknown {
  if (typeof value === "string") return normalizeString(value);
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => compareCodePoints(left, right))
      .map(([key, item]) => [key, sortObject(item)]),
  );
}

function sortGraphInput(input: GraphInput): GraphInput {
  return {
    ...input,
    clusters: [...input.clusters].sort((left, right) =>
      compareCodePoints(left.id, right.id),
    ),
    nodes: [...input.nodes]
      .map((node) => ({
        ...node,
        topics: [...node.topics].sort(compareCodePoints),
      }))
      .sort((left, right) => compareCodePoints(left.id, right.id)),
    relationships: [...input.relationships].sort(
      (left, right) =>
        compareCodePoints(left.id, right.id) ||
        compareCodePoints(left.sourceId, right.sourceId) ||
        compareCodePoints(left.targetId, right.targetId),
    ),
  };
}

export function parseGraphInput(raw: unknown): GraphInput {
  const rawIssues: string[] = [];
  assertSafeStrings(raw, "graph", rawIssues);
  if (rawIssues.length > 0) throw new GraphContractError(rawIssues);
  const parsed = graphInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new GraphContractError(
      parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
      ),
    );
  }
  return parsed.data;
}

export function canonicalizeGraphInput(raw: GraphInput): string {
  const input = parseGraphInput(raw);
  return JSON.stringify(sortObject(sortGraphInput(input)));
}

export function digestGraphInput(raw: GraphInput): string {
  return createHash("sha256")
    .update(canonicalizeGraphInput(raw), "utf8")
    .digest("hex");
}
