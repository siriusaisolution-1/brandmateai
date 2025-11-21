import { createOutputsBatch } from '../repositories/outputRepo';
import type { ContentBrief, GeneratedCopyBundle, GeneratedVideoBundle } from './types';
import { OUTPUT_STATUS_DEFAULT } from './types';
import { generateNovitaVideo } from '../providers/novitaVideoProvider';

const MAX_VIDEOS_PER_REQUEST = 1;

export function buildVideoPrompt(brief: ContentBrief, copyBundle: GeneratedCopyBundle): string {
  const scenario = copyBundle.scenarios[0]?.title ?? copyBundle.captions[0] ?? 'brand story';
  const tone = brief.brandVoice ?? 'energetic';
  const platform = brief.platform ?? 'social';
  return `Create a short video for ${platform} focusing on "${scenario}" with tone ${tone}.`;
}

export async function generateVideosForContentBrief(
  brief: ContentBrief,
  copyBundle: GeneratedCopyBundle
): Promise<GeneratedVideoBundle> {
  const desired = brief.requestedVideos ?? 1;
  const total = Math.max(0, Math.min(desired, MAX_VIDEOS_PER_REQUEST));
  if (total === 0) {
    return { outputs: [] };
  }

  const prompt = buildVideoPrompt(brief, copyBundle);
  const result = await generateNovitaVideo({ prompt, ratio: '9:16', durationSec: 8 });

  const outputs = await createOutputsBatch([
    {
      type: 'video',
      brandId: brief.brandId,
      requestId: brief.requestId,
      platform: brief.platform,
      status: OUTPUT_STATUS_DEFAULT,
      createdBy: brief.userId,
      variantIndex: 0,
      storagePath: result.storagePath,
      url: result.url,
      meta: { durationSec: result.durationSec, styleId: result.styleId },
    },
  ]);

  return {
    outputs: outputs.map((output) => ({
      prompt,
      styleId: output.meta?.styleId,
      storagePath: output.storagePath,
      url: output.url,
      durationSec: output.meta?.durationSec,
      variantIndex: output.variantIndex ?? 0,
    })),
  };
}

export { MAX_VIDEOS_PER_REQUEST };
