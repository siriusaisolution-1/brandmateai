import * as Sentry from '@sentry/serverless';
import * as functions from 'firebase-functions';

export type StructuredLogContext = {
  traceId?: string | null;
  userId?: string | null;
  brandId?: string | null;
  flow?: string | null;
  latencyMs?: number | null;
} & Record<string, unknown>;

type CallableHandler<T = unknown, R = unknown> = (
  data: T,
  context: functions.https.CallableContext,
) => Promise<R> | R;

type RequestHandler = (req: functions.Request, res: functions.Response) => Promise<void> | void;

type BeforeSignInHandler = (
  user: functions.auth.UserRecord,
  context: functions.auth.UserRecordMetadata,
) => Promise<void> | void;

type CallableOptions<T> = {
  flow?: string;
  getBrandId?: (data: T) => string | null;
};

type RequestOptions = {
  flow?: string;
  extractIds?: (req: functions.Request) => Pick<StructuredLogContext, 'userId' | 'brandId'>;
};

type AuthOptions = {
  flow?: string;
};

const defaultLogFields = Object.freeze({
  traceId: null,
  userId: null,
  brandId: null,
  flow: null,
  latencyMs: null,
});

let sentryInitialized = false;

const parseRate = (value: string | undefined, fallback: number): number => {
  const numeric = value ? Number(value) : NaN;
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const ensureSentry = (): boolean => {
  if (sentryInitialized) {
    return true;
  }

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return false;
  }

  Sentry.GCPFunction.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.GCLOUD_PROJECT ?? process.env.NODE_ENV,
    tracesSampleRate: parseRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.05),
  });
  sentryInitialized = true;
  return true;
};

ensureSentry();

const withDefaultFields = (context: StructuredLogContext = {}): StructuredLogContext => ({
  ...defaultLogFields,
  ...context,
});

export const structuredLogger = {
  info: (message: string, context?: StructuredLogContext) =>
    functions.logger.info(message, withDefaultFields(context)),
  warn: (message: string, context?: StructuredLogContext) =>
    functions.logger.warn(message, withDefaultFields(context)),
  error: (message: string, context?: StructuredLogContext) =>
    functions.logger.error(message, withDefaultFields(context)),
  debug: (message: string, context?: StructuredLogContext) =>
    functions.logger.debug(message, withDefaultFields(context)),
};

const extractTraceId = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  const [traceId] = value.split('/');
  return traceId ?? null;
};

export const getTraceIdFromHeader = (value: unknown): string | null => extractTraceId(value);

const captureFunctionException = (
  name: string,
  error: unknown,
  context: StructuredLogContext & Record<string, unknown>,
): void => {
  if (!ensureSentry()) {
    return;
  }

  const normalizedError =
    error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));

  Sentry.captureException(normalizedError, (scope: unknown) => {
    const sentryScope = scope as Sentry.Scope;
    sentryScope.setTag('function', name);
    Object.entries(context).forEach(([key, value]) => {
      sentryScope.setExtra(key, value);
    });
    return sentryScope;
  });
};

export const createCallableHandler = <T, R>(
  name: string,
  handler: CallableHandler<T, R>,
  options: CallableOptions<T> = {},
): CallableHandler<T, R> => {
  const flow = options.flow ?? name;
  const getBrandId = options.getBrandId ?? (() => null);

  return async (data, context) => {
    const start = Date.now();
    const traceId = extractTraceId(context.rawRequest?.headers?.['x-cloud-trace-context']);
    const userId = context.auth?.uid ?? null;
    const brandId = getBrandId(data);

    try {
      const result = await handler(data, context);
      structuredLogger.info(`${name} succeeded`, {
        traceId,
        userId,
        brandId,
        flow,
        latencyMs: Date.now() - start,
      });
      return result;
    } catch (error) {
      const latencyMs = Date.now() - start;
      const extras = { traceId, userId, brandId, flow, latencyMs } satisfies StructuredLogContext;
      structuredLogger.error(`${name} failed`, extras);
      captureFunctionException(name, error, { ...extras, data });
      throw error;
    }
  };
};

export const instrumentCallable = <T, R>(
  name: string,
  handler: CallableHandler<T, R>,
  options: CallableOptions<T> = {},
) => {
  const wrapped = createCallableHandler(name, handler, options);
  ensureSentry();
  return functions.https.onCall(wrapped);
};

export const createRequestHandler = (
  name: string,
  handler: RequestHandler,
  options: RequestOptions = {},
): RequestHandler => {
  const flow = options.flow ?? name;
  const extractIds =
    options.extractIds ?? ((_req: functions.Request) => ({ userId: undefined, brandId: undefined }));

  return async (req, res) => {
    const start = Date.now();
    const traceId = extractTraceId(req.headers['x-cloud-trace-context']);
    const ids = extractIds(req);

    try {
      const result = await handler(req, res);
      structuredLogger.info(`${name} completed`, {
        traceId,
        flow,
        latencyMs: Date.now() - start,
        userId: ids.userId ?? null,
        brandId: ids.brandId ?? null,
      });
      return result;
    } catch (error) {
      const latencyMs = Date.now() - start;
      const context = {
        traceId,
        flow,
        latencyMs,
        userId: ids.userId ?? null,
        brandId: ids.brandId ?? null,
        method: req.method,
        path: req.path,
      } satisfies StructuredLogContext & Record<string, unknown>;
      structuredLogger.error(`${name} failed`, context);
      captureFunctionException(name, error, context);
      throw error;
    }
  };
};

export const instrumentRequest = (name: string, handler: RequestHandler, options: RequestOptions = {}) => {
  const wrapped = createRequestHandler(name, handler, options);
  ensureSentry();
  const sentryWrapped = Sentry.GCPFunction.wrapHttpFunction(wrapped as never, {}) as unknown as RequestHandler;
  return functions.https.onRequest(sentryWrapped);
};

export const createBeforeSignInHandler = (
  name: string,
  handler: BeforeSignInHandler,
  options: AuthOptions = {},
): BeforeSignInHandler => {
  const flow = options.flow ?? name;

  return async (user, context) => {
    const start = Date.now();
    const traceId = 'eventId' in context ? (context as { eventId?: string }).eventId ?? null : null;

    try {
      const result = await handler(user, context);
      structuredLogger.info(`${name} completed`, {
        traceId,
        userId: user.uid,
        flow,
        latencyMs: Date.now() - start,
        brandId: null,
      });
      return result;
    } catch (error) {
      const latencyMs = Date.now() - start;
      const payload = {
        traceId,
        userId: user.uid,
        flow,
        latencyMs,
        brandId: null,
      } satisfies StructuredLogContext;
      structuredLogger.error(`${name} failed`, payload);
      captureFunctionException(name, error, { ...payload, providerData: user.providerData });
      throw error;
    }
  };
};

export const instrumentBeforeSignIn = (
  name: string,
  handler: BeforeSignInHandler,
  options: AuthOptions = {},
) => {
  const wrapped = createBeforeSignInHandler(name, handler, options);
  ensureSentry();
  type BeforeSignInArg = Parameters<ReturnType<typeof functions.auth.user>['beforeSignIn']>[0];
  return functions.auth.user().beforeSignIn(wrapped as unknown as BeforeSignInArg);
};

export const recordHandledException = (
  name: string,
  error: unknown,
  message: string,
  context: StructuredLogContext & Record<string, unknown>,
): void => {
  structuredLogger.error(message, context);
  captureFunctionException(name, error, context);
};
