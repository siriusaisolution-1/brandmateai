import { describe, expect, it, beforeEach, vi } from 'vitest';

const {
  getMock,
  docMock: _docMock,
  collectionMock,
  getSignedUrlMock,
  fileMock,
  bucketMock,
  storageMock,
} = vi.hoisted(() => {
  const get = vi.fn();
  const doc = vi.fn(() => ({ get }));
  const collection = vi.fn(() => ({ doc }));
  const getSignedUrl = vi.fn();
  const file = vi.fn(() => ({ getSignedUrl }));
  const bucket = vi.fn(() => ({ file }));
  const storage = vi.fn(() => ({ bucket }));
  return {
    getMock: get,
    docMock: doc,
    collectionMock: collection,
    getSignedUrlMock: getSignedUrl,
    fileMock: file,
    bucketMock: bucket,
    storageMock: storage,
  };
});

vi.mock('firebase-admin', () => {
  const firestore = () => ({ collection: collectionMock });
  return {
    __esModule: true,
    default: {
      apps: [],
      initializeApp: vi.fn(),
      firestore,
      storage: storageMock,
    },
    apps: [],
    initializeApp: vi.fn(),
    firestore,
    storage: storageMock,
  };
});

import { getAssetUrl } from './firebase';

describe('getAssetUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the direct URL when present', async () => {
    getMock.mockResolvedValueOnce({
      exists: true,
      data: () => ({ url: 'https://cdn.example.com/file.png' }),
    });

    const url = await getAssetUrl('asset-1');

    expect(url).toBe('https://cdn.example.com/file.png');
    expect(getSignedUrlMock).not.toHaveBeenCalled();
  });

  it('signs storage paths when url is missing', async () => {
    getMock.mockResolvedValueOnce({
      exists: true,
      data: () => ({ storagePath: 'media/asset.png' }),
    });
    getSignedUrlMock.mockResolvedValueOnce(['https://signed.example.com']);

    const url = await getAssetUrl('asset-2');

    expect(bucketMock).toHaveBeenCalled();
    expect(fileMock).toHaveBeenCalledWith('media/asset.png');
    expect(url).toBe('https://signed.example.com');
  });

  it('throws when the asset document is missing', async () => {
    getMock.mockResolvedValueOnce({ exists: false });

    await expect(getAssetUrl('missing')).rejects.toThrow('Media asset missing does not exist.');
  });
});
