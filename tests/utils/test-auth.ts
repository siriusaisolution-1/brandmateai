import type { Test } from 'supertest';

export const TEST_AUTH_TOKEN = 'test-token';
export const TEST_AUTH_HEADER = `Bearer ${TEST_AUTH_TOKEN}`;

export function withTestAuth<T extends Test>(request: T, token: string = TEST_AUTH_TOKEN): T {
  return request.set('Authorization', `Bearer ${token}`);
}
