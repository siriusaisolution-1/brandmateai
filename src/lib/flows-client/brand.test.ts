import { describe, expect, it, vi, beforeEach } from 'vitest';

const { callFlowMock } = vi.hoisted(() => ({ callFlowMock: vi.fn() }));

vi.mock('./shared', () => ({
  callFlow: callFlowMock,
}));

import { performBrandAudit, saveBrand, uploadMediaAsset } from './brand';

beforeEach(() => {
  vi.clearAllMocks();
  delete (globalThis as Record<string, unknown>).window;
});

describe('brand flow clients', () => {
  it('delegates to brandAuditFlow', async () => {
    callFlowMock.mockResolvedValueOnce({ report: 'ok' });

    const result = await performBrandAudit({ url: 'https://example.com', brandId: 'b1' });

    expect(callFlowMock).toHaveBeenCalledWith('brandAuditFlow', {
      url: 'https://example.com',
      brandId: 'b1',
    });
    expect(result).toEqual({ report: 'ok' });
  });

  it('delegates to manageBrandFlow for save', async () => {
    callFlowMock.mockResolvedValueOnce({ brandId: '123' });

    const result = await saveBrand({ name: 'Test' });

    expect(callFlowMock).toHaveBeenCalledWith('manageBrandFlow', { name: 'Test' });
    expect(result).toEqual({ brandId: '123' });
  });

  it('delegates to uploadMediaAssetFlow for uploads', async () => {
    callFlowMock.mockResolvedValueOnce({ assetId: 'asset-42' });

    const payload = { brandId: 'b-1', fileName: 'logo.png' };
    const result = await uploadMediaAsset(payload);

    expect(callFlowMock).toHaveBeenCalledWith('uploadMediaAssetFlow', payload);
    expect(result).toEqual({ assetId: 'asset-42' });
  });

  it('honours browser-provided mocks when available', async () => {
    const mockAudit = vi.fn().mockResolvedValue({
      report: 'mocked',
      name: 'Mock Brand',
      brandVoice: 'Friendly',
      keyInfo: 'Key info',
      suggestedColors: ['#000000'],
    });

    (globalThis as Record<string, unknown>).window = {
      __E2E_MOCKS__: { performBrandAudit: mockAudit },
    } as unknown as Window;

    const result = await performBrandAudit({ url: 'https://mocked', brandId: 'b1' });

    expect(mockAudit).toHaveBeenCalledWith({ url: 'https://mocked', brandId: 'b1' });
    expect(result).toEqual({
      report: 'mocked',
      name: 'Mock Brand',
      brandVoice: 'Friendly',
      keyInfo: 'Key info',
      suggestedColors: ['#000000'],
    });
    expect(callFlowMock).not.toHaveBeenCalled();
  });
});
