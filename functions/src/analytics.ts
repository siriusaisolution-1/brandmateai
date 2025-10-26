import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import {
  getTraceIdFromHeader,
  instrumentCallable,
  structuredLogger,
} from './utils/observability';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

type TrackEventRequest = {
  eventName: string;
  properties?: Record<string, unknown>;
  brandId?: string;
};

const trackEventHandler = async (data: TrackEventRequest, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to track events.');
  }

  const uid = context.auth.uid;
  const { eventName, properties } = data;

  if (typeof eventName !== 'string' || eventName.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'A valid eventName string is required.');
  }

  const traceId = getTraceIdFromHeader(context.rawRequest?.headers?.['x-cloud-trace-context']);

  structuredLogger.info('Analytics event tracked', {
    traceId,
    userId: uid,
    brandId: typeof data.brandId === 'string' ? data.brandId : null,
    flow: 'analytics.trackEvent',
    latencyMs: null,
    eventName,
    properties: properties ?? {},
  });

  return { success: true };
};

export const trackEvent = instrumentCallable('analytics.trackEvent', trackEventHandler, {
  flow: 'analytics.trackEvent',
  getBrandId: (payload: TrackEventRequest) => (typeof payload.brandId === 'string' ? payload.brandId : null),
});
