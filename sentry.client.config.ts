import * as Sentry from "@sentry/nextjs";
import { getBrowserOptions, shouldInitialize } from "./sentry.config.shared";

// Zašto: Klijentska inicijalizacija mora pratiti javni DSN i poštovati guard.

const options = getBrowserOptions();

if (options && shouldInitialize('client')) {
  Sentry.init(options);
}
