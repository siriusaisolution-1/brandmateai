import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('isOwnerUser', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_ADMIN_OWNER_EMAIL = 'founder@example.com';
    process.env.ADMIN_OWNER_UID = 'owner-uid-123';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ADMIN_OWNER_EMAIL;
    delete process.env.ADMIN_OWNER_UID;
    delete process.env.NEXT_PUBLIC_ADMIN_OWNER_UID;
  });

  it('matches configured email', async () => {
    const { isOwnerUser } = await import('./owner');
    expect(
      isOwnerUser({
        uid: 'random',
        email: 'Founder@example.com',
      })
    ).toBe(true);
  });

  it('matches configured uid when email differs', async () => {
    const { isOwnerUser } = await import('./owner');
    expect(
      isOwnerUser({
        uid: 'owner-uid-123',
        email: 'other@example.com',
      })
    ).toBe(true);
  });

  it('falls back to admin claim when no env match', async () => {
    const { isOwnerUser } = await import('./owner');
    expect(
      isOwnerUser({
        uid: 'another',
        email: 'nope@example.com',
        admin: true,
      })
    ).toBe(true);
  });

  it('returns false for other users', async () => {
    const { isOwnerUser } = await import('./owner');
    expect(
      isOwnerUser({
        uid: 'not-owner',
        email: 'someone@example.com',
      })
    ).toBe(false);
  });
});
