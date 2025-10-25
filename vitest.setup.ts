import { beforeEach, vi } from "vitest";

const defaultServiceAccount = {
  project_id: "test-project",
  client_email: "test@example.com",
  private_key: "-----BEGIN PRIVATE KEY-----\nTEST_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
};

const baseEnv: Record<string, string> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:1234567890:web:abcdef123456",
  NEXT_PUBLIC_USE_LONG_POLLING: "0",
  FIREBASE_STORAGE_BUCKET: "test.appspot.com",
  FIREBASE_PROJECT_ID: "test-project",
  FIREBASE_SERVICE_ACCOUNT_BASE64: Buffer.from(
    JSON.stringify(defaultServiceAccount),
  ).toString("base64"),
  SENTRY_DSN: "https://examplePublicKey@o0.ingest.sentry.io/0",
  NEXT_PUBLIC_SENTRY_DSN: "https://examplePublicKey@o0.ingest.sentry.io/0",
  SENTRY_ENVIRONMENT: "test",
  SENTRY_TRACES_SAMPLE_RATE: "0",
  SENTRY_PROFILES_SAMPLE_RATE: "0",
};

for (const [key, value] of Object.entries(baseEnv)) {
  if (typeof process.env[key] === "undefined") {
    process.env[key] = value;
  }
}

type FirebaseAdminMock = ReturnType<typeof createFirebaseAdminMock>;

declare global {
  // eslint-disable-next-line no-var
  var __vitestFirebaseAdmin: FirebaseAdminMock | undefined;
  // eslint-disable-next-line no-var
  var __vitestGetAssetUrlMock: ReturnType<typeof vi.fn> | undefined;
}

function createFirebaseAdminMock() {
  const apps: unknown[] = [];

  const getMock = vi.fn();
  const setMock = vi.fn();
  const docMock = vi.fn();
  const collectionMock = vi.fn();
  const firestoreFn = vi.fn();
  const bucketMock = vi.fn();
  const fileMock = vi.fn();
  const getSignedUrlMock = vi.fn();
  const storageFn = vi.fn();
  const initializeApp = vi.fn(() => app);
  const certMock = vi.fn(() => ({}));
  const credential = { cert: certMock };

  const firestoreInstance = {
    collection: (...args: unknown[]) => collectionMock(...args),
  };

  const storageInstance = {
    bucket: (...args: unknown[]) => bucketMock(...args),
  };

  const app = {
    firestore: vi.fn(() => firestoreInstance),
    storage: vi.fn(() => storageInstance),
  };

  docMock.mockImplementation(() => ({ get: getMock, set: setMock }));
  collectionMock.mockImplementation(() => ({ doc: docMock }));
  bucketMock.mockImplementation(() => ({ file: fileMock }));
  fileMock.mockImplementation(() => ({ getSignedUrl: getSignedUrlMock }));

  const FieldValue = {
    increment: vi.fn((value: number) => value),
    serverTimestamp: vi.fn(() => "timestamp"),
  };

  const firestoreExport = Object.assign(firestoreFn, { FieldValue });

  firestoreFn.mockImplementation(() => firestoreInstance);
  storageFn.mockImplementation(() => storageInstance);

  const mockModule = {
    __esModule: true,
    default: {
      apps,
      initializeApp,
      firestore: firestoreExport,
      storage: storageFn,
      credential,
    },
    apps,
    initializeApp,
    firestore: firestoreExport,
    storage: storageFn,
    credential,
  };

  function reset() {
    getMock.mockReset();
    setMock.mockReset();
    docMock.mockReset();
    docMock.mockImplementation(() => ({ get: getMock, set: setMock }));
    collectionMock.mockReset();
    collectionMock.mockImplementation(() => ({ doc: docMock }));
    bucketMock.mockReset();
    bucketMock.mockImplementation(() => ({ file: fileMock }));
    fileMock.mockReset();
    fileMock.mockImplementation(() => ({ getSignedUrl: getSignedUrlMock }));
    getSignedUrlMock.mockReset();
    firestoreFn.mockReset();
    firestoreFn.mockImplementation(() => firestoreInstance);
    storageFn.mockReset();
    storageFn.mockImplementation(() => storageInstance);
    app.firestore.mockReset();
    app.firestore.mockImplementation(() => firestoreInstance);
    app.storage.mockReset();
    app.storage.mockImplementation(() => storageInstance);
    initializeApp.mockReset();
    initializeApp.mockImplementation(() => app);
    FieldValue.increment.mockReset();
    FieldValue.increment.mockImplementation((value: number) => value);
    FieldValue.serverTimestamp.mockReset();
    FieldValue.serverTimestamp.mockImplementation(() => "timestamp");
    certMock.mockReset();
    certMock.mockImplementation(() => ({}));
    apps.length = 0;
  }

  return {
    module: mockModule,
    reset,
    mocks: {
      apps,
      initializeApp,
      get: getMock,
      set: setMock,
      doc: docMock,
      collection: collectionMock,
      firestore: firestoreFn,
      FieldValue,
      bucket: bucketMock,
      file: fileMock,
      getSignedUrl: getSignedUrlMock,
      storage: storageFn,
      app,
      credential: {
        cert: certMock,
      },
    },
  };
}

const firebaseAdminMock = createFirebaseAdminMock();

globalThis.__vitestFirebaseAdmin = firebaseAdminMock;

vi.mock("firebase-admin", () => firebaseAdminMock.module);

const getAssetUrlMock = vi.fn(async (assetId: string) => `https://example.com/assets/${assetId}`);

globalThis.__vitestGetAssetUrlMock = getAssetUrlMock;

vi.mock(new URL("./functions/src/utils/firebase.ts", import.meta.url).pathname, async importOriginal => {
  const actual = await importOriginal<typeof import("./functions/src/utils/firebase")>();
  return {
    ...actual,
    getAssetUrl: getAssetUrlMock,
  };
});

beforeEach(() => {
  firebaseAdminMock.reset();
  getAssetUrlMock.mockClear();
});
