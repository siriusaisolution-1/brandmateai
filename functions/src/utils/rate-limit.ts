import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v1/https';

import { createRateLimiter } from '../../../utils/rateLimit';

if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();

const limit = Number(process.env.FLOW_RATE_LIMIT_PER_MINUTE ?? '60');
const windowSeconds = Number(process.env.FLOW_RATE_LIMIT_WINDOW_SECONDS ?? '60');

const flowRateLimiter = createRateLimiter({
  firestore,
  FieldValue,
  namespace: 'genkit:flows',
  limit,
  windowSeconds,
});

export async function enforceFlowRateLimit(userId: string, brandId?: string | null) {
  if (!userId) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const brandSegment = typeof brandId === 'string' && brandId.trim() ? brandId : 'unassigned';
  const key = `${userId}:${brandSegment}`;
  const result = await flowRateLimiter.attempt(key);

  if (!result.ok) {
    throw new HttpsError('resource-exhausted', 'Rate limit exceeded. Please retry later.');
  }

  return result;
}
