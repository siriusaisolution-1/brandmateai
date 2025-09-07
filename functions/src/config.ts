// functions/src/config.ts
import * as functions from "firebase-functions";

export const NOVITA_API_KEY =
  process.env.NOVITA_API_KEY ||
  functions.config()?.novita?.key ||
  ""; // set via: firebase functions:config:set novita.key="xxxxx"