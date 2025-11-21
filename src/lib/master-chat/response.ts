import { Timestamp } from 'firebase/firestore';
import type {
  ChatMessage,
  ChatSession,
  ContentChannel,
  ContentRequest,
} from '@/types/firestore';

export interface ParsedContentRequest {
  title: string;
  description?: string;
  goal?: ContentRequest['goal'];
  channels?: ContentChannel[];
  requestedOutputs?: ContentRequest['requestedOutputs'];
  masterBrief?: unknown;
}

export interface ParsedMasterAIResponse {
  assistantReply: string;
  contentRequest?: ParsedContentRequest;
}

export function parseMasterAIResponse(rawContent: string): ParsedMasterAIResponse {
  if (!rawContent) {
    return { assistantReply: 'Nisam sigurna kako da pomognem, možeš li ponoviti?' };
  }

  try {
    const parsed = JSON.parse(rawContent) as {
      assistant_reply?: string;
      maybe_content_request?: {
        should_create?: boolean;
        title?: string;
        description?: string;
        goal?: ContentRequest['goal'];
        channels?: ContentChannel[];
        requestedOutputs?: ContentRequest['requestedOutputs'];
        masterBrief?: unknown;
      };
    };

    const assistantReply = parsed.assistant_reply?.trim() || rawContent;
    const maybe = parsed.maybe_content_request;

    if (maybe?.should_create) {
      const { title, description, goal, channels, requestedOutputs, masterBrief } = maybe;
      if (title && channels?.length) {
        return {
          assistantReply,
          contentRequest: {
            title,
            description,
            goal,
            channels,
            requestedOutputs,
            masterBrief,
          },
        };
      }
    }

    return { assistantReply };
  } catch (error) {
    const fallback = rawContent.trim();
    return {
      assistantReply: fallback || 'Hvala na poruci! Možeš li je ponoviti?',
    };
  }
}

export interface BuildContentRequestOptions {
  parsed: ParsedContentRequest;
  brandId: string;
  userId: string;
  sessionId?: string;
}

export function buildContentRequestDocument({
  parsed,
  brandId,
  userId,
  sessionId,
}: BuildContentRequestOptions): ContentRequest {
  const now = Timestamp.now();
  return {
    id: '',
    brandId,
    userId,
    title: parsed.title,
    description: parsed.description,
    goal: parsed.goal,
    channels: parsed.channels ?? [],
    requestedOutputs: parsed.requestedOutputs ?? {},
    status: 'draft',
    masterBrief: parsed.masterBrief ?? {},
    createdFromChatId: sessionId,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildChatMessage(
  session: Pick<ChatSession, 'id' | 'brandId' | 'userId'>,
  role: ChatMessage['role'],
  content: string,
  userId?: string,
): ChatMessage {
  const now = Timestamp.now();
  return {
    id: '',
    sessionId: session.id,
    brandId: session.brandId,
    userId: userId ?? session.userId,
    role,
    content,
    createdAt: now,
  };
}
