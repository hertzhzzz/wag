import { createHash } from "node:crypto";

import type {
  ArticleUpgradeManifestInput,
  ArticleUpgradeTicketInput,
  Sha256Digest,
} from "./types";

export function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function describeValue(value: unknown): string {
  return Object.prototype.toString.call(value);
}

function assertDataProperty(
  object: object,
  key: string,
  path: string,
): PropertyDescriptor {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (!descriptor || !("value" in descriptor)) {
    throw new TypeError(`${path} must be a plain data property.`);
  }
  return descriptor;
}

function assertJsonContractValue(
  value: unknown,
  path: string,
  active: WeakSet<object>,
): void {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${path} must contain only finite numbers.`);
    }
    return;
  }
  if (typeof value !== "object") {
    throw new TypeError(`${path} contains unsupported ${typeof value} data.`);
  }

  if (active.has(value)) {
    throw new TypeError(`${path} contains a circular reference.`);
  }
  active.add(value);

  try {
    if (Array.isArray(value)) {
      const ownKeys = Reflect.ownKeys(value);
      if (
        ownKeys.some((key) => typeof key !== "string") ||
        ownKeys.length !== value.length + 1 ||
        !ownKeys.includes("length")
      ) {
        throw new TypeError(
          `${path} must be a dense array without custom or symbol properties.`,
        );
      }

      for (let index = 0; index < value.length; index += 1) {
        const key = String(index);
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
          throw new TypeError(`${path} must not contain sparse array slots.`);
        }
        const descriptor = assertDataProperty(value, key, `${path}[${index}]`);
        assertJsonContractValue(descriptor.value, `${path}[${index}]`, active);
      }
      return;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(
        `${path} must be a plain object, received ${describeValue(value)}.`,
      );
    }

    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== "string") {
        throw new TypeError(`${path} must not contain symbol properties.`);
      }
      const descriptor = assertDataProperty(value, key, `${path}.${key}`);
      if (!descriptor.enumerable) {
        throw new TypeError(`${path}.${key} must be enumerable.`);
      }
      assertJsonContractValue(descriptor.value, `${path}.${key}`, active);
    }
  } finally {
    active.delete(value);
  }
}

export function assertArticleUpgradeJsonContract(value: unknown): void {
  assertJsonContractValue(value, "$", new WeakSet<object>());
}

function cloneJsonContractValue(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(cloneJsonContractValue);

  const clone: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    clone[key] = cloneJsonContractValue(nested);
  }
  return clone;
}

export function deepClone<T>(value: T): T {
  assertArticleUpgradeJsonContract(value);
  return cloneJsonContractValue(value) as T;
}

function freezeJsonContractValue<T>(value: T, visited: WeakSet<object>): T {
  if (value === null || typeof value !== "object" || visited.has(value)) {
    return value;
  }
  visited.add(value);
  for (const nested of Object.values(value)) {
    freezeJsonContractValue(nested, visited);
  }
  return Object.freeze(value);
}

export function deepFreeze<T>(value: T): T {
  assertArticleUpgradeJsonContract(value);
  return freezeJsonContractValue(value, new WeakSet<object>());
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value === null || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => compareCodePoints(left, right))
      .map(([key, nested]) => [key, canonicalValue(nested)]),
  );
}

export function canonicalJson(value: unknown): string {
  assertArticleUpgradeJsonContract(value);
  const serialized = JSON.stringify(canonicalValue(value));
  if (serialized === undefined) {
    throw new TypeError("Canonical JSON input is not serializable.");
  }
  return serialized;
}

export function computeSha256Digest(value: unknown): Sha256Digest {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

export function canonicalizeArticleUpgradeTicket(
  ticket: ArticleUpgradeTicketInput,
): ArticleUpgradeTicketInput {
  const clone = deepClone(ticket);
  clone.claims.sort((left, right) => compareCodePoints(left.id, right.id));
  clone.observations.sort((left, right) =>
    compareCodePoints(left.key, right.key),
  );
  return clone;
}

export function canonicalizeArticleUpgradeManifest(
  manifest: ArticleUpgradeManifestInput,
): ArticleUpgradeManifestInput {
  const clone = deepClone(manifest);
  clone.tickets = clone.tickets
    .map(canonicalizeArticleUpgradeTicket)
    .sort(
      (left, right) =>
        left.rank - right.rank ||
        compareCodePoints(left.ticketId, right.ticketId),
    );
  return clone;
}

export function computeArticleUpgradeCandidateDigest(
  ticket: ArticleUpgradeTicketInput,
): Sha256Digest {
  const canonical = canonicalizeArticleUpgradeTicket(ticket);
  const approvalSubject = { ...canonical };
  delete (approvalSubject as Partial<ArticleUpgradeTicketInput>).approvals;
  return computeSha256Digest(approvalSubject);
}

export function computeArticleUpgradeManifestDigest(
  manifest: ArticleUpgradeManifestInput,
): Sha256Digest {
  return computeSha256Digest(canonicalizeArticleUpgradeManifest(manifest));
}
