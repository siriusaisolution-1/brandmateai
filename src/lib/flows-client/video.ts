import { callFlow } from './shared';

export interface CheckVideoStatusRequest {
  taskId: string;
}

export interface CheckVideoStatusResponse {
  status: string;
  videoUrl?: string;
}

export async function checkVideoStatus(
  input: CheckVideoStatusRequest
): Promise<CheckVideoStatusResponse> {
  return callFlow<CheckVideoStatusRequest, CheckVideoStatusResponse>(
    'checkVideoStatusFlow',
    input
  );
}
