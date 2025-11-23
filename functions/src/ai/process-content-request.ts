import * as admin from 'firebase-admin';

import { getPlanForUser } from '../billing/plans';
import { getOrCreateUsageSnapshot, incrementUsage } from '../billing/usage';
import type { UserProfile } from '../types/firestore';

const firestore = admin.firestore();

export interface ContentRequestPayload {
  id: string;
  userId: string;
  brandId: string;
  requestedVideos?: number;
  requestedImages?: number;
  requestedItems?: number;
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: 'videos_limit' | 'images_limit' | 'requests_limit';
  remaining?: { videos: number; images: number; requests: number };
}

export interface ProcessContentRequestParams {
  payload: ContentRequestPayload;
  loadUser: (userId: string) => Promise<UserProfile | null>;
  runAgents: () => Promise<{ videosGenerated: number; imagesGenerated: number } | void>;
}

async function checkLimits(user: UserProfile, payload: ContentRequestPayload): Promise<LimitCheckResult> {
  const { brandId, userId } = payload;
  const usage = await getOrCreateUsageSnapshot(userId, brandId);
  const plan = getPlanForUser(user);

  const requestedVideos = payload.requestedVideos ?? 0;
  const requestedImages = payload.requestedImages ?? 0;
  const requestedRequests = payload.requestedItems ?? requestedVideos + requestedImages;

  const remaining = {
    videos: plan.limits.maxVideosPerMonth - usage.videosGenerated,
    images: plan.limits.maxImagesPerMonth - usage.imagesGenerated,
    requests: plan.limits.maxRequestsPerMonth - usage.requestsProcessed,
  };

  if (requestedVideos > remaining.videos) {
    return { allowed: false, reason: 'videos_limit', remaining };
  }
  if (requestedImages > remaining.images) {
    return { allowed: false, reason: 'images_limit', remaining };
  }
  if (requestedRequests > remaining.requests) {
    return { allowed: false, reason: 'requests_limit', remaining };
  }

  return { allowed: true, remaining };
}

export async function processContentRequest({ payload, loadUser, runAgents }: ProcessContentRequestParams): Promise<LimitCheckResult> {
  const user = await loadUser(payload.userId);
  if (!user) {
    await firestore.collection('contentRequests').doc(payload.id).set({ status: 'blocked_limit', reason: 'missing_user' }, { merge: true });
    return { allowed: false, reason: 'requests_limit' };
  }

  const limitCheck = await checkLimits(user, payload);

  if (!limitCheck.allowed) {
    await firestore
      .collection('contentRequests')
      .doc(payload.id)
      .set({ status: 'blocked_limit', limitReason: limitCheck.reason, remaining: limitCheck.remaining }, { merge: true });
    return limitCheck;
  }

  const agentResult = await runAgents();
  const videosGenerated = agentResult?.videosGenerated ?? payload.requestedVideos ?? 0;
  const imagesGenerated = agentResult?.imagesGenerated ?? payload.requestedImages ?? 0;
  const requestsProcessed = payload.requestedItems ?? videosGenerated + imagesGenerated;

  await incrementUsage({
    userId: payload.userId,
    brandId: payload.brandId,
    videosDelta: videosGenerated,
    imagesDelta: imagesGenerated,
    requestsDelta: requestsProcessed,
  });

  await firestore
    .collection('contentRequests')
    .doc(payload.id)
    .set({ status: 'completed', usageRecorded: true }, { merge: true });

  return { allowed: true, remaining: limitCheck.remaining };
}

export const _test = {
  checkLimits,
};
