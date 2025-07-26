// This file configures the Sentry edge SDK.
// It is imported in the an app's custom `_app.js`, `_error.js`, and `next.config.js` files.
// Learn more about SDK configuration on the Sentry docs:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // TODO: Add your Sentry DSN here.
  // dsn: "https://9049097fe7d42576bd7a9a7d94c160be@o4509705938534400.ingest.us.sentry.io/4509705972154368",

  // Adjust this value in production, or use tracesSampler for finer control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
