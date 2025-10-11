import { describe, expect, it, vi, beforeEach } from 'vitest';

const { callableSpy, httpsCallableMock } = vi.hoisted(() => {
  const spy = vi.fn(async (payload: unknown) => ({ data: { echoed: payload } }));
  const callable = vi.fn(() => spy);
  return { callableSpy: spy, httpsCallableMock: callable };
});

vi.mock('firebase/functions', () => ({
  httpsCallable: httpsCallableMock,
}));

vi.mock('../firebase', () => ({
  functions: { app: 'test' },
}));

import { callFlow } from './shared';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('callFlow', () => {
  it('wraps httpsCallable and returns the data payload', async () => {
    const input = { foo: 'bar' };
    const response = await callFlow<typeof input, { echoed: typeof input }>('demoFlow', input);

    expect(httpsCallableMock).toHaveBeenCalledWith({ app: 'test' }, 'demoFlow');
    expect(callableSpy).toHaveBeenCalledWith(input);
    expect(response).toEqual({ echoed: input });
  });
});
