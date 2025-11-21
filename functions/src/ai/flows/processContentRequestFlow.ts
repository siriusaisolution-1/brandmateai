import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v1/https';
import { z } from 'zod';

import { ai } from '../../genkit/ai';
import { buildContentBrief } from '../utils/contentBrief';
import { generateCopyForContentBrief } from '../agents/copyAgent';
import { generateImagesForContentBrief } from '../agents/visualAgent';
import { generateVideosForContentBrief } from '../agents/videoAgent';
import { createOutputsBatch, updateContentRequestStatus } from '../repositories/outputRepo';
import type { ContentRequest, Output } from '../../types/firestore';
import { OUTPUT_STATUS_DEFAULT, type ProcessContentResult } from '../agents/types';

const firestore = admin.firestore();

const InputSchema = z.object({
  contentRequestId: z.string(),
  userId: z.string(),
});

const OutputSchema = z.object({
  requestId: z.string(),
  outputsCount: z.number(),
  status: z.string(),
});

function assertRequestAccessible(request: ContentRequest, userId: string) {
  if (request.userId !== userId) {
    throw new HttpsError('permission-denied', 'You cannot process this content request.');
  }
  if (!['queued', 'processing'].includes(request.status)) {
    throw new HttpsError('failed-precondition', 'Content request is not queued for processing.');
  }
}

function buildCopyOutputs(
  brief: { brandId: string; requestId: string; platform?: string; userId: string },
  copyBundle: Awaited<ReturnType<typeof generateCopyForContentBrief>>
): Omit<Output, 'id'>[] {
  const outputs: Omit<Output, 'id'>[] = [];
  const base = {
    brandId: brief.brandId,
    requestId: brief.requestId,
    platform: brief.platform,
    status: OUTPUT_STATUS_DEFAULT,
    createdBy: brief.userId,
    type: 'copy' as const,
  } satisfies Omit<Output, 'id'>;

  copyBundle.captions.forEach((text, index) => outputs.push({ ...base, text, variantIndex: index }));
  copyBundle.hooks.forEach((text, index) => outputs.push({ ...base, text, variantIndex: index + copyBundle.captions.length }));
  copyBundle.ctas.forEach((text, index) => outputs.push({ ...base, text, variantIndex: index + copyBundle.captions.length + copyBundle.hooks.length }));
  copyBundle.scenarios.forEach((scenario, index) =>
    outputs.push({ ...base, text: `${scenario.title}${scenario.outline ? `: ${scenario.outline}` : ''}`, variantIndex: index })
  );

  return outputs;
}

export const processContentRequestFlow = ai.defineFlow(
  {
    name: 'processContentRequest',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
    description:
      'Process a ContentRequest by delegating to copy, visual and video agents. Limits: 1 video and up to 8 images per request.',
  },
  async (input): Promise<ProcessContentResult> => {
    const requestSnap = await firestore.collection('contentRequests').doc(input.contentRequestId).get();
    if (!requestSnap.exists) {
      throw new HttpsError('not-found', `Content request ${input.contentRequestId} not found.`);
    }

    const requestData = { ...requestSnap.data(), id: requestSnap.id } as ContentRequest;
    assertRequestAccessible(requestData, input.userId);

    const brandSnap = await firestore.collection('brands').doc(requestData.brandId).get();
    if (!brandSnap.exists) {
      throw new HttpsError('failed-precondition', `Brand ${requestData.brandId} not found.`);
    }

    await updateContentRequestStatus(requestSnap.id, 'processing');

    const brandData = { ...brandSnap.data(), id: brandSnap.id } as any;
    const brief = buildContentBrief(requestData, brandData);

    const copyBundle = await generateCopyForContentBrief(brief);

    const copyOutputs = await createOutputsBatch(buildCopyOutputs(brief, copyBundle));

    const imageBundle = await generateImagesForContentBrief(brief, copyBundle);
    const videoBundle = await generateVideosForContentBrief(brief, copyBundle);

    const outputsCount = copyOutputs.length + imageBundle.outputs.length + videoBundle.outputs.length;

    await updateContentRequestStatus(requestSnap.id, 'done');

    return { requestId: requestSnap.id, outputsCount, status: 'done' };
  }
);
