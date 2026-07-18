import { readFileSync, readdirSync } from "node:fs";
import { isAbsolute, join } from "node:path";

import { CANONICAL_CLUSTER_IDS, type ClusterId } from "../clusterSchema";
import {
  normalizeBuyerPrompt,
  parseQuestionSet,
  type QuestionSet,
} from "./schema";

export const QUESTION_SET_DIRECTORY = [
  "content",
  "seo",
  "geo",
  "questions",
] as const;

export interface LoadQuestionSetCatalogOptions {
  projectRoot: string;
}

export function compareUnicodeCodePoints(left: string, right: string): number {
  const leftPoints = Array.from(
    left,
    (character) => character.codePointAt(0) as number,
  );
  const rightPoints = Array.from(
    right,
    (character) => character.codePointAt(0) as number,
  );
  const sharedLength = Math.min(leftPoints.length, rightPoints.length);

  for (let index = 0; index < sharedLength; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) {
      return leftPoints[index] - rightPoints[index];
    }
  }

  return leftPoints.length - rightPoints.length;
}

function expectedFilename(cluster: ClusterId): string {
  return `${cluster}.json`;
}

export function validateQuestionSetCatalog(
  questionSets: ReadonlyArray<QuestionSet>,
): ReadonlyArray<QuestionSet> {
  const seenIds = new Map<string, string>();
  const seenPrompts = new Map<string, string>();

  for (const questionSet of questionSets) {
    for (const question of questionSet.questions) {
      const priorIdCluster = seenIds.get(question.id);
      if (priorIdCluster !== undefined) {
        throw new Error(
          `Duplicate question ID ${question.id} in ${priorIdCluster} and ${questionSet.cluster}.`,
        );
      }
      seenIds.set(question.id, questionSet.cluster);

      const normalizedPrompt = normalizeBuyerPrompt(question.prompt);
      const priorPromptCluster = seenPrompts.get(normalizedPrompt);
      if (priorPromptCluster !== undefined) {
        throw new Error(
          `Duplicate normalized question prompt in ${priorPromptCluster} and ${questionSet.cluster}: ${normalizedPrompt}.`,
        );
      }
      seenPrompts.set(normalizedPrompt, questionSet.cluster);
    }
  }

  return questionSets;
}

export function loadQuestionSetCatalog({
  projectRoot,
}: LoadQuestionSetCatalogOptions): ReadonlyArray<QuestionSet> {
  if (!isAbsolute(projectRoot)) {
    throw new Error("Question set projectRoot must be an absolute path.");
  }

  const directory = join(projectRoot, ...QUESTION_SET_DIRECTORY);
  const actualFiles = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map(({ name }) => name)
    .sort(compareUnicodeCodePoints);
  const expectedFiles = CANONICAL_CLUSTER_IDS.map(expectedFilename).sort(
    compareUnicodeCodePoints,
  );
  const missingFiles = expectedFiles.filter(
    (filename) => !actualFiles.includes(filename),
  );
  const extraFiles = actualFiles.filter(
    (filename) => !expectedFiles.includes(filename),
  );

  if (missingFiles.length > 0 || extraFiles.length > 0) {
    throw new Error(
      [
        missingFiles.length > 0
          ? `Missing question set files: ${missingFiles.join(", ")}.`
          : null,
        extraFiles.length > 0
          ? `Unexpected question set files: ${extraFiles.join(", ")}.`
          : null,
      ]
        .filter((message): message is string => message !== null)
        .join(" "),
    );
  }

  const questionSets = CANONICAL_CLUSTER_IDS.map((cluster) => {
    const filename = expectedFilename(cluster);
    let source: unknown;

    try {
      source = JSON.parse(readFileSync(join(directory, filename), "utf8"));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Could not parse ${filename}: ${detail}`);
    }

    const questionSet = parseQuestionSet(source);
    if (questionSet.cluster !== cluster) {
      throw new Error(
        `${filename} declares cluster ${questionSet.cluster}; expected ${cluster}.`,
      );
    }

    return {
      ...questionSet,
      questions: [...questionSet.questions].sort((left, right) =>
        compareUnicodeCodePoints(left.id, right.id),
      ),
    };
  });

  return validateQuestionSetCatalog(questionSets);
}
