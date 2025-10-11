import { callFlow } from './shared';

export type LoraTrainingType = 'style' | 'subject';

export interface TrainLoraModelRequest {
  userId: string;
  brandId: string;
  trainingType: LoraTrainingType;
  modelName: string;
  imageAssetIds: string[];
}

export interface TrainLoraModelResponse {
  taskId: string;
}

export async function trainLoraModel(
  input: TrainLoraModelRequest
): Promise<TrainLoraModelResponse> {
  return callFlow<TrainLoraModelRequest, TrainLoraModelResponse>('trainLoraModelFlow', input);
}

export interface UploadUrlRequest {
  fileExtension: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  assetId: string;
}

interface RawUploadUrlResponse {
  upload_url?: string;
  assets_id?: string;
}

export async function requestUploadUrl(
  input: UploadUrlRequest
): Promise<UploadUrlResponse> {
  const raw = await callFlow<UploadUrlRequest, RawUploadUrlResponse>('getUploadUrlFlow', input);
  return {
    uploadUrl: raw.upload_url ?? '',
    assetId: raw.assets_id ?? '',
  };
}
