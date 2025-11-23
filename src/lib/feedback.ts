export interface FeedbackBuilderInput {
  userId: string;
  message: string;
  context?: string | null;
  brandId?: string | null;
}

export interface FeedbackPayload {
  userId: string;
  message: string;
  context: string;
  brandId: string | null;
  resolved: boolean;
}

function normalize(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function buildFeedbackPayload(input: FeedbackBuilderInput): FeedbackPayload {
  const message = normalize(input.message);
  if (!message) {
    throw new Error('Feedback message is required');
  }

  const context = normalize(input.context) ?? 'app-shell';
  const brandId = normalize(input.brandId);

  return {
    userId: input.userId,
    message,
    context,
    brandId: brandId ?? null,
    resolved: false,
  };
}
