import type {
  BrandAuditRequest,
  BrandAuditResponse,
  SaveBrandRequest,
  SaveBrandResponse,
  UploadMediaAssetRequest,
  UploadMediaAssetResponse,
} from '@/lib/flows-client/brand';
import type {
  MasterRouterRequest,
  MasterRouterResponse,
} from '@/lib/flows-client/master-router';
import type {
  WatchtowerRequest,
  WatchtowerResponse,
} from '@/lib/flows-client/watchtowers';

export type E2EMediaAsset = {
  id: string;
  brandId: string;
  url: string;
  fileName?: string;
};

declare global {
  interface Window {
    __E2E_MOCKS__?: {
      currentUser?: { uid: string; email?: string; displayName?: string };
      performBrandAudit?: (input: BrandAuditRequest) => Promise<BrandAuditResponse>;
      saveBrand?: (input: SaveBrandRequest) => Promise<SaveBrandResponse>;
      uploadMediaAsset?: (input: UploadMediaAssetRequest) => Promise<UploadMediaAssetResponse>;
      requestMasterRouter?: (request: MasterRouterRequest) => Promise<MasterRouterResponse>;
      handleUpload?: (files: File[], context: { brandId: string }) => Promise<void>;
      getMediaAssets?: (brandId: string) => E2EMediaAsset[];
      subscribeToMediaUpdates?: (
        brandId: string,
        callback: (assets: E2EMediaAsset[]) => void,
      ) => () => void;
      features?: {
        watchtowersEnabled?: boolean;
      };
      watchtowers?: {
        runCompetitorWatchtower?: (
          input: WatchtowerRequest
        ) => Promise<WatchtowerResponse>;
        runTrendAndOpportunityRadar?: (
          input: WatchtowerRequest
        ) => Promise<WatchtowerResponse>;
        runSyncAdPerformance?: (
          input: WatchtowerRequest
        ) => Promise<WatchtowerResponse>;
      };
    };
  }
}

export {};
