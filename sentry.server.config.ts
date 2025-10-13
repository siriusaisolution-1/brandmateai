import * as Sentry from "@sentry/nextjs";
import { getServerOptions, shouldInitialize } from "./sentry.config.shared";

// Zašto: Inicijalizacija se pokreće samo kada DSN postoji u Codex Secret-u.

const options = getServerOptions();

if (options && shouldInitialize('server')) {
  Sentry.init(options);
}
