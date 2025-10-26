import type { IncomingMessage, ServerResponse } from 'node:http';
import { NextRequest } from 'next/server';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteHandler = (request: NextRequest) => Promise<Response> | Response;

type HandlerMap = Partial<Record<Method, RouteHandler>>;

async function readBody(req: IncomingMessage) {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function buildHeaders(req: IncomingMessage) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else {
      headers.set(key, value);
    }
  }
  return headers;
}

export function createNextRouteHandler(map: HandlerMap) {
  return async function handler(req: IncomingMessage, res: ServerResponse) {
    const method = (req.method?.toUpperCase() as Method | undefined) ?? 'GET';
    const routeHandler = map[method];

    if (!routeHandler) {
      res.statusCode = 405;
      res.end();
      return;
    }

    const bodyBuffer = await readBody(req);
    const headers = buildHeaders(req);
    const url = new URL(req.url ?? '/', 'http://localhost');
    const request = new NextRequest(url, {
      method,
      headers,
      body: bodyBuffer.length > 0 ? bodyBuffer : undefined,
    });

    try {
      const response = await routeHandler(request);
      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const responseBody = Buffer.from(await response.arrayBuffer());
      res.end(responseBody);
    } catch (error) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unexpected error',
        })
      );
    }
  };
}
