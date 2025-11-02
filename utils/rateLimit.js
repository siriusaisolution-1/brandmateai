'use strict';

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_COLLECTION = 'rateLimitBuckets';

function normaliseLimitValue(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function createRateLimiter(options) {
  if (!options || typeof options !== 'object') {
    throw new TypeError('createRateLimiter requires an options object');
  }

  const {
    firestore,
    FieldValue,
    namespace = 'default',
    limit = 60,
    windowSeconds = DEFAULT_WINDOW_SECONDS,
    collection = DEFAULT_COLLECTION,
  } = options;

  if (!firestore || typeof firestore.collection !== 'function') {
    throw new TypeError('A Firestore instance is required');
  }
  if (!FieldValue || typeof FieldValue.increment !== 'function' || typeof FieldValue.serverTimestamp !== 'function') {
    throw new TypeError('FieldValue helpers are required');
  }

  const safeLimit = normaliseLimitValue(limit, 60);
  const safeWindowSeconds = normaliseLimitValue(windowSeconds, DEFAULT_WINDOW_SECONDS);

  function bucketId(now) {
    const windowMs = safeWindowSeconds * 1000;
    const bucket = Math.floor(now / windowMs);
    return { bucket, windowMs, bucketEndsAt: (bucket + 1) * windowMs };
  }

  async function attempt(key, weight = 1) {
    if (typeof key !== 'string' || !key.trim()) {
      throw new TypeError('A non-empty rate limit key is required');
    }
    const normalizedWeight = Number(weight) || 1;
    const now = Date.now();
    const { bucket, windowMs, bucketEndsAt } = bucketId(now);
    const docId = `${namespace}:${bucket}:${key}`;
    const docRef = firestore.collection(collection).doc(docId);

    let allowed = false;
    let remaining = 0;

    await firestore.runTransaction(async tx => {
      const snap = await tx.get(docRef);
      const currentCount = typeof snap.get === 'function' ? Number(snap.get('count')) || 0 : 0;

      if (currentCount + normalizedWeight > safeLimit) {
        remaining = Math.max(0, safeLimit - currentCount);
        return;
      }

      remaining = Math.max(0, safeLimit - (currentCount + normalizedWeight));
      allowed = true;

      if (snap.exists) {
        tx.update(docRef, {
          count: FieldValue.increment(normalizedWeight),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        tx.set(docRef, {
          count: normalizedWeight,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          windowSeconds: safeWindowSeconds,
          expiresAt: new Date(bucketEndsAt + windowMs),
        });
      }
    });

    const retryAfterSeconds = Math.max(1, Math.ceil((bucketEndsAt - now) / 1000));

    if (!allowed) {
      return {
        ok: false,
        limit: safeLimit,
        remaining,
        retryAfterSeconds,
        resetAt: new Date(bucketEndsAt),
      };
    }

    return {
      ok: true,
      limit: safeLimit,
      remaining,
      retryAfterSeconds,
      resetAt: new Date(bucketEndsAt),
    };
  }

  return { attempt };
}

module.exports = {
  createRateLimiter,
};
