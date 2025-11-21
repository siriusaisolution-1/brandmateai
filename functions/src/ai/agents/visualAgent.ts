import { createOutputsBatch } from '../repositories/outputRepo';
import type { ContentBrief, GeneratedCopyBundle, GeneratedImageBundle } from './types';
import { OUTPUT_STATUS_DEFAULT } from './types';
import { generateNovitaImage } from '../providers/novitaImageProvider';

const MAX_IMAGES_PER_REQUEST = 8;

export function buildImagePrompt(brief: ContentBrief, copyBundle: GeneratedCopyBundle, variantIndex: number): string {
  const scenario = copyBundle.scenarios[variantIndex]?.title ?? copyBundle.hooks[variantIndex] ?? 'brand visual';
  const tone = brief.brandVoice ?? 'modern and clean';
  const platform = brief.platform ?? 'social';
  return `Create an image for ${platform} focused on "${scenario}" with tone ${tone}.`;
}

export async function generateImagesForContentBrief(
  brief: ContentBrief,
  copyBundle: GeneratedCopyBundle
): Promise<GeneratedImageBundle> {
  const desired = brief.requestedImages ?? 4;
  const total = Math.max(1, Math.min(desired, MAX_IMAGES_PER_REQUEST));

  const prompts = Array.from({ length: total }, (_, index) => buildImagePrompt(brief, copyBundle, index));
  const results = await Promise.all(prompts.map((prompt) => generateNovitaImage({ prompt, size: 'square' })));

  const outputs = await createOutputsBatch(
    results.map((result, index) => ({
      type: 'image',
      brandId: brief.brandId,
      requestId: brief.requestId,
      platform: brief.platform,
      status: OUTPUT_STATUS_DEFAULT,
      createdBy: brief.userId,
      variantIndex: index,
      storagePath: result.storagePath,
      url: result.url,
      meta: { styleId: undefined },
    }))
  );

  return {
    outputs: outputs.map((output) => ({
      prompt: prompts[output.variantIndex ?? 0],
      styleId: output.meta?.styleId,
      storagePath: output.storagePath,
      url: output.url,
      variantIndex: output.variantIndex ?? 0,
    })),
  };
}

export { MAX_IMAGES_PER_REQUEST };
