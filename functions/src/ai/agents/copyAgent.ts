import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import type { GeneratedCopyBundle, ContentBrief } from './types';

const COPY_AGENT_SYSTEM = `You are the BrandMate Copy Agent. Generate concise social-first copy bundles aligned with the provided brand brief.
Return valid JSON only.`;

export function buildCopyAgentPrompt(brief: ContentBrief): string {
  const goals = brief.goals?.join(', ') ?? 'awareness and engagement';
  const topics = brief.topics?.join(', ') ?? 'brand story';
  const platform = brief.platform ?? 'social';
  return [
    `Brand: ${brief.brandName ?? brief.brandId}`,
    `Tone: ${brief.brandVoice ?? 'friendly and confident'}`,
    `Audience: ${brief.audience ?? 'target followers'}`,
    `Platform: ${platform}`,
    `Goals: ${goals}`,
    `Topics: ${topics}`,
    `Requested copies: ${brief.requestedCopies ?? 3}`,
    brief.additionalContext ? `Additional context: ${brief.additionalContext}` : undefined,
    'Return JSON with fields scenarios (array of {title, outline}), hooks, captions, ctas.',
  ]
    .filter(Boolean)
    .join('\n');
}

function normaliseArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string') return [value];
  return [];
}

function normaliseScenarios(value: unknown): { title: string; outline?: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      title: typeof item?.title === 'string' ? item.title : undefined,
      outline: typeof item?.outline === 'string' ? item.outline : undefined,
    }))
    .filter((item): item is { title: string; outline?: string } => Boolean(item.title));
}

export async function generateCopyForContentBrief(brief: ContentBrief): Promise<GeneratedCopyBundle> {
  await ensureGoogleGenAiApiKeyReady();

  const prompt = buildCopyAgentPrompt(brief);
  const response = await ai.generate({
    system: COPY_AGENT_SYSTEM,
    prompt,
    output: { format: 'json' },
  });

  let parsed: Partial<GeneratedCopyBundle> = {};
  try {
    parsed = typeof response.text === 'string' ? (JSON.parse(response.text) as object) : {};
  } catch (error) {
    void error;
  }

  return {
    scenarios: normaliseScenarios((parsed as { scenarios?: unknown }).scenarios),
    hooks: normaliseArray((parsed as { hooks?: unknown }).hooks),
    captions: normaliseArray((parsed as { captions?: unknown }).captions),
    ctas: normaliseArray((parsed as { ctas?: unknown }).ctas),
  };
}
