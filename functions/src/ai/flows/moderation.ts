// functions/src/ai/flows/moderation.ts
// Lightweight, provider-free moderation.
// Pure/local rules only, to keep tests deterministic and avoid upstream SDK issues.

import { z } from "zod";

export type ModerationCategory =
  | "sexual"
  | "self-harm"
  | "violence"
  | "hate"
  | "profanity";

export const ModerationOutputSchema = z.object({
  isSafe: z.boolean(),
  categories: z.array(z.string()),
});

/**
 * Simple local regex-based category detection.
 * Keep it conservative and deterministic.
 */
const CATEGORY_PATTERNS: Record<ModerationCategory, RegExp[]> = {
  sexual: [/sexual/i, /porn/i, /explicit/i, /nsfw/i, /\bsex\b/i],
  "self-harm": [/suicide/i, /self[-\s]?harm/i, /kill myself/i],
  hate: [/hate/i, /hate crime/i, /racist/i, /bigot/i, /supremacist/i],
  violence: [
    /violence/i,
    /violent/i,
    /\bkill\b/i,
    /assault/i,
    /attack/i,
    /murder/i,
  ],
  profanity: [/\b(fuck|shit|damn|bitch)\b/i],
};

export function normaliseText(input: string): string {
  return input.normalize("NFKC").trim();
}

export function detectCategories(text: string): ModerationCategory[] {
  const normalised = normaliseText(text).toLowerCase();
  const matches = new Set<ModerationCategory>();

  for (const [category, patterns] of Object.entries(
    CATEGORY_PATTERNS,
  ) as Array<[ModerationCategory, RegExp[]]>) {
    if (patterns.some((regex) => regex.test(normalised))) {
      matches.add(category);
    }
  }

  return [...matches];
}

export function moderateText(
  text: string,
): { isSafe: boolean; categories: ModerationCategory[] } {
  const categories = detectCategories(text);
  return {
    isSafe: categories.length === 0,
    categories,
  };
}

// Keep same exported name used elsewhere, but make it local/pure.
// Signature stays async for drop-in compatibility with callers.
export async function moderateTextFlow(
  text: string,
): Promise<z.infer<typeof ModerationOutputSchema>> {
  return ModerationOutputSchema.parse(moderateText(text));
}

// Test hooks
export const _test = {
  normaliseText,
  detectCategories,
  moderateText,
  ModerationOutputSchema,
};

export default moderateTextFlow;