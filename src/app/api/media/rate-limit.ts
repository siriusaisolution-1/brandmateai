import { FieldValue, getFirestore } from 'firebase-admin/firestore';

import { getAuth } from '@/lib/firebase-admin';
import { createRateLimiter } from '../../../../utils/rateLimit';

const limit = Number(process.env.MEDIA_API_RATE_LIMIT_PER_MINUTE ?? '60');
const windowSeconds = Number(process.env.MEDIA_API_RATE_LIMIT_WINDOW_SECONDS ?? '60');

let limiter: ReturnType<typeof createRateLimiter> | null = null;

export function getMediaRateLimiter() {
  if (!limiter) {
    // Ensure the default app is initialised before accessing Firestore.
    getAuth();
    limiter = createRateLimiter({
      firestore: getFirestore(),
      FieldValue,
      namespace: 'api:media',
      limit,
      windowSeconds,
    });
  }

  return limiter;
}
