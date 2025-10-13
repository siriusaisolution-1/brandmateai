import { describe, expect, it, vi, beforeEach } from 'vitest';

const { callFlowMock } = vi.hoisted(() => ({ callFlowMock: vi.fn() }));

vi.mock('./shared', () => ({
  callFlow: callFlowMock,
}));

import { checkVideoStatus } from './video';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('video flow clients', () => {
  it('delegates to checkVideoStatusFlow', async () => {
    callFlowMock.mockResolvedValueOnce({ status: 'done' });

    const result = await checkVideoStatus({ taskId: 'task-1' });

    expect(callFlowMock).toHaveBeenCalledWith('checkVideoStatusFlow', { taskId: 'task-1' });
    expect(result).toEqual({ status: 'done' });
  });
});
