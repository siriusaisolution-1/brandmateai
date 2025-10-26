import { callFlow } from './shared';

function getE2EMocks() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.__E2E_MOCKS__ ?? null;
}

interface RawRouterResponse {
  flow: string;
  input: unknown;
}

export interface MasterRouterRequest {
  prompt: string;
  isFirstMessage?: boolean;
}

export interface MasterRouterResponse {
  message: string;
  routedFlow: string;
  payload: unknown;
}

function buildRouterMessage(flow: string, payload: unknown): string {
  if (!flow || flow === 'error') {
    return "I'm not sure which assistant should help with that. Please try rephrasing your request.";
  }

  const payloadSummary =
    payload && typeof payload === 'object' ? JSON.stringify(payload, null, 2) : String(payload ?? '');

  return `Routing your request to ${flow}.\n${payloadSummary}`.trim();
}

export async function requestMasterRouter(
  request: MasterRouterRequest
): Promise<MasterRouterResponse> {
  const mock = getE2EMocks()?.requestMasterRouter;
  if (mock) {
    return mock(request);
  }

  if (request.isFirstMessage) {
    return {
      message: 'Hi! I am BrandMate, your marketing co-pilot. How can I help today?',
      routedFlow: 'greeting',
      payload: null,
    };
  }

  const raw = await callFlow<string, RawRouterResponse>('mainRouterFlow', request.prompt);
  return {
    message: buildRouterMessage(raw.flow, raw.input),
    routedFlow: raw.flow,
    payload: raw.input,
  };
}
