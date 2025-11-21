import { describe, expect, it } from 'vitest';

import { buildFeedbackPayload } from './feedback';

describe('buildFeedbackPayload', () => {
  it('creates a payload with trimmed values and defaults', () => {
    const payload = buildFeedbackPayload({
      userId: 'user-123',
      message: '  Hello world  ',
      context: '  dashboard  ',
      brandId: ' brand-9 ',
    });

    expect(payload).toEqual({
      userId: 'user-123',
      message: 'Hello world',
      context: 'dashboard',
      brandId: 'brand-9',
      resolved: false,
    });
  });

  it('falls back to defaults when optional fields are missing', () => {
    const payload = buildFeedbackPayload({
      userId: 'user-123',
      message: 'Need help',
    });

    expect(payload.context).toBe('app-shell');
    expect(payload.brandId).toBeNull();
    expect(payload.resolved).toBe(false);
  });

  it('throws when message is empty', () => {
    expect(() =>
      buildFeedbackPayload({
        userId: 'user-123',
        message: '   ',
      })
    ).toThrow(/message is required/i);
  });
});
