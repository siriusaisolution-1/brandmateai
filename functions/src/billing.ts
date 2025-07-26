import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(functions.config().stripe.secret_key, {
    apiVersion: "2024-04-10" as any, // Quick fix for version mismatch
});

// ... (rest of the file is unchanged)
