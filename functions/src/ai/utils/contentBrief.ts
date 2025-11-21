import type { Brand, ContentRequest } from '../../types/firestore';
import type { ContentBrief } from '../agents/types';

export function buildContentBrief(request: ContentRequest, brand: Brand): ContentBrief {
  return {
    requestId: request.id ?? '',
    brandId: request.brandId,
    userId: request.userId,
    brandName: brand.name ?? brand.id ?? request.brandId,
    brandVoice: brand.brandVoice ?? undefined,
    platform: request.platform,
    topics: brand.industry ? [brand.industry] : undefined,
    audience: brand.description ?? undefined,
    requestedImages: request.requestedImages ?? undefined,
    requestedVideos: request.requestedVideos ?? undefined,
    requestedCopies: request.requestedCopies ?? undefined,
    additionalContext: request.brief,
  };
}
