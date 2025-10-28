// src/ai/flows/generate-image.ts
// Front-end helper that proxies the request to the backend Cloud Function.

import { callFlow } from '@/lib/flows-client/shared';

export type GenerateImageInput = {
  prompt: string;
  userId: string;
  brandId: string;
  model_name?: string;
  width?: number;
  height?: number;
};

export type GenerateImageResult = {
  taskId: string;
};

function isValidResult(value: unknown): value is GenerateImageResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'taskId' in value &&
    typeof (value as { taskId?: unknown }).taskId === 'string' &&
    (value as { taskId: string }).taskId.length > 0
  );
}

export async function generateImageFlow(
  input: GenerateImageInput
): Promise<GenerateImageResult> {
  try {
    const response = await callFlow<GenerateImageInput, GenerateImageResult>(
      'generateImageFlow',
      input
    );

    if (!isValidResult(response)) {
      throw new Error('Invalid response from generateImageFlow');
    }

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error while generating image';
    throw new Error(`Failed to start image generation: ${message}`);
  }
}