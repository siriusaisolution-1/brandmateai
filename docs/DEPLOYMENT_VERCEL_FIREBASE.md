# Deployment Guide – Vercel + Firebase

This document describes how to deploy BrandMate v3 for the closed beta. Follow the checklist before promoting a build to production.

## 1. Vercel (Next.js frontend)

1. **Connect the repo**
   - Create a Vercel project and import the `brandmateai` GitHub repo.
   - Choose the default Next.js preset. Build command stays `pnpm build` and the output directory remains the default `.vercel/output`.

2. **Environment variables**
   - Copy everything from `env/.example`. The most important variables:
     - `NEXT_PUBLIC_BETA_MODE` → set to `true` for closed beta to show the in-app badge and enable the feedback entry point.
     - Firebase web config (`NEXT_PUBLIC_FIREBASE_*`).
     - `NEXT_PUBLIC_ADMIN_OWNER_EMAIL` / `NEXT_PUBLIC_ADMIN_OWNER_UID` + `ADMIN_OWNER_UID` for gating the owner dashboard.
     - `NEXT_PUBLIC_SENTRY_DSN` (client) and `SENTRY_DSN` (server) if you have a Sentry project. Leave them empty for a safe no-op.
     - AI/API keys such as `NOVITA_API_KEY`, `GOOGLE_GENAI_API_KEY`, `GEMINI_MODEL_ID`, `STRIPE_*` – never commit actual values.
   - Re-run `vercel env pull` locally whenever vars change.

3. **Build & preview**
   - Vercel uses the repo’s `pnpm-lock.yaml`. Ensure `pnpm build` succeeds locally before pushing.
   - Enable automatic previews on pull requests so you can smoke-test before production promotion.

## 2. Firebase (Functions, Firestore, Storage)

1. **Prerequisites**
   - Install the Firebase CLI (`npm i -g firebase-tools`) and authenticate (`firebase login`).
   - Ensure `FIREBASE_SERVICE_ACCOUNT` or `FIREBASE_SERVICE_ACCOUNT_BASE64` is available locally for running admin utilities.

2. **Deploy steps**
   - Functions + Firestore rules:
     ```bash
     pnpm lint
     pnpm test:unit
     pnpm build
     firebase deploy --only functions,firestore:rules
     ```
   - Storage rules (if needed) can be deployed with `firebase deploy --only storage`.
   - Hosting is handled by Vercel, so no Firebase Hosting deploy is required.

3. **Key collections & checks**
   - `users`, `brands`, `contentRequests`, `outputs`, `usageSnapshots`, `betaFeedback`.
   - Use the emulator to validate new rules before deploying:
     ```bash
     pnpm vitest tests/firestore/beta-feedback.rules.test.ts
     ```
     or run the CLI helper `firebase emulators:start --only firestore` and hit the security rules manually.

## 3. Production Checklist

- ✅ `pnpm lint`
- ✅ `pnpm test:unit`
- ✅ `CI=1 pnpm build`
- ✅ `firebase deploy --only functions,firestore:rules`
- ✅ Set `NEXT_PUBLIC_BETA_MODE="true"` for the closed beta release.
- ✅ Populate Firebase + AI credentials in both Vercel and local `.env` files.
- ✅ Configure `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` if you want error reporting. Leaving them blank keeps Sentry in a safe no-op mode so the UI never breaks.
- ✅ Smoke-test `/api/health` (Vercel) and the new `/admin/beta` dashboard after deployment.

## 4. Sentry & Health Notes

- The custom Sentry wrapper fails silently when DSN is missing, so you can deploy without configuring Sentry yet.
- Once the DSN is added, both the global error boundary and the in-app feedback modal will report unexpected exceptions automatically.
- Keep the `/api/health` endpoint public so ops can verify runtime status from Vercel.

With these steps the owner can redeploy the stack at any time and keep Firebase + Vercel configurations in sync.
