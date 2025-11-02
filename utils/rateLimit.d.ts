import type { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';

export interface RateLimiterOptions {
  firestore: FirebaseFirestore.Firestore;
  FieldValue: typeof AdminFieldValue;
  namespace?: string;
  limit?: number;
  windowSeconds?: number;
  collection?: string;
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: Date;
}

export interface RateLimiter {
  attempt(key: string, weight?: number): Promise<RateLimitResult>;
}

export declare function createRateLimiter(options: RateLimiterOptions): RateLimiter;
