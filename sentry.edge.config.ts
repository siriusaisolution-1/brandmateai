import * as Sentry from "@sentry/nextjs";
import { getEdgeOptions, shouldInitialize } from "./sentry.config.shared";

// Zašto: Sprečavamo inicijalizaciju na edge-u bez definisanog DSN-a.

const options = getEdgeOptions();

if (options && shouldInitialize('edge')) {
  Sentry.init(options);
}
