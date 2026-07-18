import { z } from "zod";

import { clusterIdSchema } from "../clusterSchema";

export const QUESTION_SET_VERSION = 1 as const;
export const QUESTION_SET_STATUS = "draft" as const;
export const QUESTION_SET_AS_OF_DATE = "2026-07-18" as const;

export const QUESTION_BUYER_STAGES = [
  "problem-aware",
  "solution-aware",
  "evaluation",
  "decision",
] as const;

export const QUESTION_INTENTS = [
  "informational",
  "commercial",
  "risk",
  "decision",
] as const;

export const QUESTION_TARGET_MARKETS = ["AU", "AU-NZ"] as const;

const machineReadableQuestionIdSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Expected a lowercase machine-readable ID using letters, numbers, and single hyphens.",
  );

const PROHIBITED_PROMPT_PATTERNS = [
  /\b(?:winning adventure global|wag|wa)\b/i,
  /\b(?:mention|cite|recommend|promote|endorse)\b/i,
  /\b(?:which|what)\b.*\b(?:company|provider|agency|services?)\b.*\b(?:should (?:i|we) (?:use|hire)|to (?:use|hire))\b/i,
  /\bwho should (?:i|we) hire\b/i,
  /\b(?:best|top(?:-ranked)?|number one|guarantee(?:d)?|rank(?:ed|ing|s)?)\b/i,
] as const;

const buyerPromptSchema = z
  .string()
  .min(1, "Question prompt must not be blank.")
  .refine(
    (prompt) => prompt === prompt.trim(),
    "Question prompt must not have leading or trailing whitespace.",
  )
  .regex(
    /^[\x20-\x7E]+$/,
    "Question prompt must use printable English ASCII characters only.",
  )
  .regex(/[A-Za-z]/, "Question prompt must contain English words.")
  .endsWith("?", "Question prompt must end with a question mark.")
  .refine(
    (prompt) =>
      PROHIBITED_PROMPT_PATTERNS.every((pattern) => !pattern.test(prompt)),
    "Question prompt must remain brand-neutral and must not induce mentions, rankings, or outcome promises.",
  );

const questionSchema = z
  .object({
    id: machineReadableQuestionIdSchema,
    prompt: buyerPromptSchema,
    buyerStage: z.enum(QUESTION_BUYER_STAGES),
    intent: z.enum(QUESTION_INTENTS),
    targetMarket: z.enum(QUESTION_TARGET_MARKETS),
  })
  .strict();

export function normalizeBuyerPrompt(prompt: string): string {
  return prompt.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

export const questionSetSchema = z
  .object({
    version: z.literal(QUESTION_SET_VERSION),
    asOfDate: z.literal(QUESTION_SET_AS_OF_DATE),
    cluster: clusterIdSchema,
    status: z.literal(QUESTION_SET_STATUS),
    questions: z.array(questionSchema).length(10),
  })
  .strict()
  .superRefine((questionSet, context) => {
    const presentIntents = new Set(
      questionSet.questions.map(({ intent }) => intent),
    );
    for (const requiredIntent of QUESTION_INTENTS) {
      if (!presentIntents.has(requiredIntent)) {
        context.addIssue({
          code: "custom",
          path: ["questions"],
          message: `Question set must include the ${requiredIntent} intent.`,
        });
      }
    }

    const seenIds = new Set<string>();
    const seenPrompts = new Set<string>();
    questionSet.questions.forEach((question, index) => {
      if (seenIds.has(question.id)) {
        context.addIssue({
          code: "custom",
          path: ["questions", index, "id"],
          message: `Duplicate question ID: ${question.id}.`,
        });
      }
      seenIds.add(question.id);

      const normalizedPrompt = normalizeBuyerPrompt(question.prompt);
      if (seenPrompts.has(normalizedPrompt)) {
        context.addIssue({
          code: "custom",
          path: ["questions", index, "prompt"],
          message: `Duplicate normalized question prompt: ${normalizedPrompt}.`,
        });
      }
      seenPrompts.add(normalizedPrompt);
    });
  });

export type QuestionSet = z.infer<typeof questionSetSchema>;
export type BuyerQuestion = QuestionSet["questions"][number];

export function parseQuestionSet(input: unknown): QuestionSet {
  return questionSetSchema.parse(input);
}
