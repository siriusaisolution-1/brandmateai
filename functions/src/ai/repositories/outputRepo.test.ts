import { beforeEach, describe, expect, it } from 'vitest';

import { createOutput, createOutputsBatch, listOutputsForRequest, updateContentRequestStatus } from './outputRepo';

const firebaseAdminMock = globalThis.__vitestFirebaseAdmin;

if (!firebaseAdminMock) {
  throw new Error('Firebase admin mock was not initialised');
}

const { collection: collectionMock, batch: batchMock, batchSet: batchSetMock, batchCommit: batchCommitMock, doc: docMock } =
  firebaseAdminMock.mocks;

describe('outputRepo', () => {
  beforeEach(() => {
    firebaseAdminMock.reset();
  });

  it('creates a single output in the outputs collection', async () => {
    const setSpy = firebaseAdminMock.mocks.set;

    const result = await createOutput({
      brandId: 'brand1',
      requestId: 'req1',
      type: 'image',
      status: 'draft',
      createdBy: 'user1',
    });

    expect(collectionMock).toHaveBeenCalledWith('outputs');
    expect(setSpy).toHaveBeenCalledWith({
      brandId: 'brand1',
      requestId: 'req1',
      type: 'image',
      status: 'draft',
      createdBy: 'user1',
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
    });
    expect(result.id).toBeDefined();
  });

  it('creates outputs in batch', async () => {
    await createOutputsBatch([
      { brandId: 'brand1', requestId: 'req1', type: 'copy', status: 'draft', createdBy: 'user1' },
      { brandId: 'brand1', requestId: 'req1', type: 'video', status: 'draft', createdBy: 'user1' },
    ]);

    expect(batchMock).toHaveBeenCalled();
    expect(batchSetMock).toHaveBeenCalledTimes(2);
    expect(batchCommitMock).toHaveBeenCalled();
  });

  it('lists outputs for a request', async () => {
    const docs = [
      { id: 'a', data: () => ({ brandId: 'brand1', requestId: 'req1', type: 'image', status: 'draft', createdBy: 'user1' }) },
    ];
    const whereMock = firebaseAdminMock.mocks.where;
    whereMock.mockReturnValue({ where: whereMock, get: firebaseAdminMock.mocks.get.mockResolvedValue({ docs }) });

    const results = await listOutputsForRequest('brand1', 'req1');

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('a');
    expect(results[0].type).toBe('image');
  });

  it('updates content request status', async () => {
    const updateSpy = firebaseAdminMock.mocks.set;
    docMock.mockImplementation(() => ({ update: updateSpy }));

    await updateContentRequestStatus('req-123', 'done');

    expect(collectionMock).toHaveBeenCalledWith('contentRequests');
    expect(updateSpy).toHaveBeenCalledWith({ status: 'done', updatedAt: 'timestamp' });
  });
});
