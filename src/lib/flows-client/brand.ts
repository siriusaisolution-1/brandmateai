import { callFlow } from './shared';

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
  return callFlow<UploadMediaAssetRequest, UploadMediaAssetResponse>(
    'uploadMediaAssetFlow',
    input
  );
}
