import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { z } from 'zod';

import { requireEnv } from './config';
import { BMK_COSTS } from './utils/bmk-costs';

const STRIPE_SECRET_KEY = requireEnv('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = requireEnv('STRIPE_WEBHOOK_SECRET');

const STRIPE_API_VERSION = '2024-04-10' as const satisfies Stripe.LatestApiVersion;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: STRIPE_API_VERSION,
  appInfo: {
    name: 'BrandMate Functions',
  },
});

const checkoutRequestSchema = z.object({
  priceId: z.string().min(1),
  mode: z.enum(['payment', 'subscription']).default('subscription'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerId: z.string().min(1).optional(),
  metadata: z.record(z.string()).optional(),
});

type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

const firestore = admin.firestore();
const processedEventsCollection = firestore.collection('stripeEvents');

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in to start checkout.');
  }

  let payload: CheckoutRequest;
  try {
    payload = checkoutRequestSchema.parse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request payload';
    throw new functions.https.HttpsError('invalid-argument', message);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: payload.mode,
      customer: payload.customerId,
      line_items: [
        {
          price: payload.priceId,
          quantity: 1,
        },
      ],
      success_url: payload.successUrl,
      cancel_url: payload.cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        userId: context.auth.uid,
        ...payload.metadata,
      },
    });

    return {
      id: session.id,
      url: session.url,
    };
  } catch (error) {
    functions.logger.error('Failed to create Stripe checkout session', error);
    throw new functions.https.HttpsError('internal', 'Unable to create checkout session.');
  }
});

const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.userId;
  if (!userId) {
    functions.logger.warn('Checkout session missing user metadata', session.id);
    return;
  }

  const creditAmount = session.metadata?.creditPackage
    ? Number.parseFloat(session.metadata.creditPackage)
    : undefined;

  if (!creditAmount || Number.isNaN(creditAmount)) {
    functions.logger.info('Checkout completed without BMK credit metadata', {
      sessionId: session.id,
      userId,
    });
    return;
  }

  const userRef = firestore.collection('users').doc(userId);
  await firestore.runTransaction(async (tx) => {
    const snapshot = await tx.get(userRef);
    const currentCredits = snapshot.get('billing.credits') ?? 0;
    const totalPurchased = snapshot.get('billing.totalPurchased') ?? 0;

    tx.set(
      userRef,
      {
        billing: {
          credits: (typeof currentCredits === 'number' ? currentCredits : 0) + creditAmount,
          totalPurchased: (typeof totalPurchased === 'number' ? totalPurchased : 0) + creditAmount,
          lastPurchaseId: session.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    );
  });
};

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.set('Allow', 'POST');
    res.status(405).send('Method Not Allowed');
    return;
  }

  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    res.status(400).send('Missing Stripe signature header');
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown webhook error';
    functions.logger.error('Stripe webhook signature verification failed', message);
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  try {
    const docRef = processedEventsCollection.doc(event.id);
    const snapshot = await docRef.get();
    if (snapshot.exists) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    // Record the event ID so repeated deliveries remain idempotent.
    await docRef.create({
      type: event.type,
      created: event.created,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        functions.logger.info('Unhandled Stripe event type', event.type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown webhook processing error';
    functions.logger.error('Failed to process Stripe webhook', { eventId: event.id, message });
    res.status(500).send('Webhook handler failed');
  }
});

export { BMK_COSTS };

export async function deductBmkCredits(userId: string, amount: number) {
  try {
    const userRef = firestore.collection('users').doc(userId);
    await firestore.runTransaction(async (tx) => {
      const snapshot = await tx.get(userRef);
      const currentCredits = snapshot.get('billing.credits') ?? 0;
      if (typeof currentCredits !== 'number' || currentCredits < amount) {
        throw new Error('Insufficient BMK credits');
      }
      tx.update(userRef, {
        'billing.credits': currentCredits - amount,
        'billing.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    functions.logger.error('Failed to deduct BMK credits', { userId, amount, message });
    return false;
  }
}
