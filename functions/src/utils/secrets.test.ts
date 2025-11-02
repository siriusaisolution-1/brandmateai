import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetSecretCacheForTests, getRequiredSecretValue, getSecretValue } from './secrets';

const accessSecretVersionMock = vi.fn();

vi.mock('@google-cloud/secret-manager', () => ({
  SecretManagerServiceClient: vi.fn(() => ({
    accessSecretVersion: accessSecretVersionMock,
  })),
}));

const originalEnvSnapshot = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  __resetSecretCacheForTests();
  Object.keys(process.env).forEach((key) => {
    delete process.env[key];
  });
  Object.assign(process.env, originalEnvSnapshot);
  process.env.GCLOUD_PROJECT = 'test-project';
});

afterEach(() => {
  Object.keys(process.env).forEach((key) => {
    delete process.env[key];
  });
  Object.assign(process.env, originalEnvSnapshot);
});

describe('secrets helper', () => {
  it('returns environment variable when available', async () => {
    process.env.TEST_SECRET = 'from-env';

    const value = await getSecretValue('TEST_SECRET');

    expect(value).toBe('from-env');
    expect(accessSecretVersionMock).not.toHaveBeenCalled();
  });

  it('fetches secret manager value when env var missing', async () => {
    accessSecretVersionMock.mockResolvedValueOnce([
      { payload: { data: Buffer.from('remote-secret', 'utf8') } },
    ]);

    const value = await getRequiredSecretValue('REMOTE_SECRET');

    expect(value).toBe('remote-secret');
    expect(accessSecretVersionMock).toHaveBeenCalledWith({
      name: 'projects/test-project/secrets/REMOTE_SECRET/versions/latest',
    });
  });

  it('caches secret manager responses', async () => {
    accessSecretVersionMock.mockResolvedValueOnce([
      { payload: { data: Buffer.from('cached-secret', 'utf8') } },
    ]);

    const value1 = await getSecretValue('CACHED_SECRET');
    const value2 = await getSecretValue('CACHED_SECRET');

    expect(value1).toBe('cached-secret');
    expect(value2).toBe('cached-secret');
    expect(accessSecretVersionMock).toHaveBeenCalledTimes(1);
  });

  it('returns undefined for optional secrets when not found', async () => {
    accessSecretVersionMock.mockRejectedValueOnce({ code: 5 });

    const value = await getSecretValue('MISSING_SECRET');

    expect(value).toBeUndefined();
  });

  it('throws for required secrets when not found', async () => {
    accessSecretVersionMock.mockRejectedValueOnce({ code: 5 });

    await expect(getRequiredSecretValue('MISSING_REQUIRED')).rejects.toThrow(
      'Missing required secret: MISSING_REQUIRED',
    );
  });
});

