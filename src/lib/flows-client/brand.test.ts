import { describe, expect, it, vi, beforeEach } from 'vitest';

const { callFlowMock } = vi.hoisted(() => ({ callFlowMock: vi.fn() }));

vi.mock('./shared', () => ({
  callFlow: callFlowMock,
}));

import { performBrandAudit, saveBrand } from './brand';

beforeEach(() => {
  vi.clearAllMocks();
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
});
