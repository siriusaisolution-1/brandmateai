import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type FirebaseAdminHarness = NonNullable<typeof globalThis.__vitestFirebaseAdmin>;
const firebaseAdminMock = globalThis.__vitestFirebaseAdmin as FirebaseAdminHarness;
const assetUrlMock = globalThis.__vitestGetAssetUrlMock as ReturnType<typeof vi.fn>;

let getAssetUrl: (assetId: string) => Promise<string>;

beforeAll(async () => {
  const actual = await vi.importActual<typeof import('./firebase')>('./firebase');
  getAssetUrl = actual.getAssetUrl;
});

const { mocks } = firebaseAdminMock;
const { get: getMock, doc: docMock, collection: collectionMock, bucket: bucketMock, file: fileMock, getSignedUrl: getSignedUrlMock } = mocks;

beforeEach(() => {
  firebaseAdminMock.reset();
  assetUrlMock.mockClear();
});

describe('getAssetUrl', () => {
  it('returns the direct URL when present', async () => {
    getMock.mockResolvedValueOnce({
      exists: true,
      data: () => ({ url: 'https://cdn.example.com/file.png' }),
    });

    const url = await getAssetUrl('asset-1');

    expect(url).toBe('https://cdn.example.com/file.png');
    expect(getSignedUrlMock).not.toHaveBeenCalled();
    expect(assetUrlMock).not.toHaveBeenCalled();
  });

  it('signs storage paths when url is missing', async () => {
    getMock.mockResolvedValueOnce({
      exists: true,
      data: () => ({ storagePath: 'media/asset.png' }),
    });
    getSignedUrlMock.mockResolvedValueOnce(['https://signed.example.com']);

    const url = await getAssetUrl('asset-2');

    expect(collectionMock).toHaveBeenCalledWith('mediaAssets');
    expect(docMock).toHaveBeenCalledWith('asset-2');
    expect(bucketMock).toHaveBeenCalled();
    expect(fileMock).toHaveBeenCalledWith('media/asset.png');
    expect(url).toBe('https://signed.example.com');
  });

  it('throws when the asset document is missing', async () => {
    getMock.mockResolvedValueOnce({ exists: false });

    await expect(getAssetUrl('missing')).rejects.toThrow('Media asset missing does not exist.');
  });
});
