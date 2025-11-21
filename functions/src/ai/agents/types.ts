import type { ContentRequestStatus, Output } from '../../types/firestore';

export interface ContentBrief {
  requestId: string;
  brandId: string;
  userId: string;
  brandName?: string;
  brandVoice?: string;
  platform?: string;
  topics?: string[];
  goals?: string[];
  audience?: string;
  requestedImages?: number;
  requestedVideos?: number;
  requestedCopies?: number;
  additionalContext?: string;
}

export interface GeneratedCopyBundle {
  scenarios: { title: string; outline?: string }[];
  hooks: string[];
  captions: string[];
  ctas: string[];
}

export interface GeneratedImageOutput {
  prompt: string;
  styleId?: string;
  url?: string;
  storagePath?: string;
  variantIndex: number;
}

export interface GeneratedVideoOutput {
  prompt: string;
  styleId?: string;
  url?: string;
  storagePath?: string;
  durationSec?: number;
  variantIndex: number;
}

export interface GeneratedImageBundle {
  outputs: GeneratedImageOutput[];
}

export interface GeneratedVideoBundle {
  outputs: GeneratedVideoOutput[];
}

export interface ProcessContentResult {
  requestId: string;
  outputsCount: number;
  status: ContentRequestStatus;
}

export type OutputEnvelope = Pick<Output, 'type' | 'brandId' | 'requestId' | 'platform' | 'status' | 'createdBy'> &
  Partial<Pick<Output, 'meta' | 'storagePath' | 'url' | 'text' | 'variantIndex'>> & {
    variantIndex?: number;
  };

export const OUTPUT_STATUS_DEFAULT: Output['status'] = 'draft';
