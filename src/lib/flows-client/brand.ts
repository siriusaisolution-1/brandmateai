import { callFlow } from './shared';

function getE2EMocks() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.__E2E_MOCKS__ ?? null;
}

export interface BrandAuditRequest {
  url: string;
  brandId: string;
}

export interface BrandAuditResponse {
  report: string;
  name: string;
  brandVoice: string;
  keyInfo: string;
  suggestedColors: string[];
}

export async function performBrandAudit(
  input: BrandAuditRequest
): Promise<BrandAuditResponse> {
  const mock = getE2EMocks()?.performBrandAudit;
  if (mock) {
    return mock(input);
  }

  return callFlow<BrandAuditRequest, BrandAuditResponse>('brandAuditFlow', input);
}

export interface SaveBrandRequest {
  name: string;
  logoUrl?: string;
  colors?: string[];
  fonts?: string[];
  brandVoice?: string;
  keyInfo?: string;
  industry?: string;
  competitorWebsites?: string[];
}

export interface SaveBrandResponse {
  brandId: string;
}

export async function saveBrand(input: SaveBrandRequest): Promise<SaveBrandResponse> {
  const mock = getE2EMocks()?.saveBrand;
  if (mock) {
    return mock(input);
  }

  return callFlow<SaveBrandRequest, SaveBrandResponse>('manageBrandFlow', input);
}

export interface UploadMediaAssetRequest {
  brandId: string;
  fileName: string;
}

export interface UploadMediaAssetResponse {
  assetId: string;
}

export async function uploadMediaAsset(
  input: UploadMediaAssetRequest
): Promise<UploadMediaAssetResponse> {
  const mock = getE2EMocks()?.uploadMediaAsset;
  if (mock) {
    return mock(input);
  }

  return callFlow<UploadMediaAssetRequest, UploadMediaAssetResponse>(
    'uploadMediaAssetFlow',
    input
  );
}
