# Billing & Stripe Integration

BrandMate uses Stripe Checkout for self-serve upgrades and webhook callbacks
to synchronize BMK credit balances. The Functions code initializes Stripe with
a pinned API version so responses remain stable across deployments.

## Required secrets

Configure the following secrets in Codex → Secrets so Cloud Functions can
communicate with Stripe:

| Key | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server-side API key used to create Checkout sessions and verify events. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the `stripeWebhook` HTTPS endpoint. |

## Callable: `createCheckoutSession`

`createCheckoutSession` validates the payload with Zod before creating a Stripe
Checkout Session. Clients must provide:

- `priceId`: Stripe Price identifier for the selected plan or credit pack.
- `successUrl` / `cancelUrl`: URLs to redirect after checkout.
- Optional `customerId` and extra string metadata.

The function enforces authentication and returns the session `id` and hosted
checkout `url`.

## Webhook: `stripeWebhook`

The webhook verifies the Stripe signature using `STRIPE_WEBHOOK_SECRET`, records
the processed event ID for idempotency, and reacts to `checkout.session.completed`
by recording the purchase metadata on the user document. Extend the switch block
to handle additional events (e.g., subscription lifecycle) as new plans launch.
