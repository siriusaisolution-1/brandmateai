const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  sexual: [/sexual/i, /porn/i, /explicit/i],
  'self-harm': [/suicide/i, /self[- ]?harm/i],
  hate: [/hate/i, /racist/i, /bigot/i],
  violence: [/violence/i, /kill/i, /assault/i],
  profanity: [/fuck/i, /shit/i, /damn/i],
};

export function detectCategories(text: string): string[] {
  const matches = new Set<string>();
  const normalised = text.toLowerCase();

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalised)) {
        matches.add(category);
        break;
      }
    }
  }

  return Array.from(matches);
}

export function moderateText(text: string): { isSafe: boolean; categories: string[] } {
  const categories = detectCategories(text);
  return {
    isSafe: categories.length === 0,
    categories,
  };
}

export async function moderateTextFlow(text: string): Promise<{ isSafe: boolean; categories: string[] }> {
  return moderateText(text);
}

export const _test = { detectCategories, moderateText };

