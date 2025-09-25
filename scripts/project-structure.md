# Project Structure – Snapshot Template

> Kako koristiti: pokreni `./bm_audit.sh > snapshot.txt`, pa u ovaj fajl nalepi relevantne delove.

## Ključni direktorijumi
- `src/app` – Next.js App Router rute (SSR/ISR)
- `src/components` – UI komponente (shadcn/ui, custom)
- `src/ai/flows` – Genkit/AI flow-ovi (⚠️ zameniti stubove pravim tokom rada)
- `functions/` – Firebase Functions (Gen 2), utility servisi
- `public/` – statička imovina
- `.github/workflows/` – CI/CD

## Važni fajlovi
- `next.config.ts` – SSR, allowed origins
- `firebase.json` – Hosting (frameworksBackend) + (opciono) emulators
- `.firebaserc` – podrazumevani GCP projekat
- `tsconfig.json` – TS postavke
- `src/components/firebase-providers.tsx` – Firebase init (Auth/Firestore) sa long-polling
- `src/instrumentation.ts` – minimal/no-op Sentry (stabilan build)

## Rute (primer)
- `(marketing)/pricing/page.tsx` – javna stranica (bez Realtime hook-ova)
- `(app)/admin/dashboard/page.tsx` – ⚠️ traži `@/ai/flows/admin-stats`
- `(app)/content/generate/blog/page.tsx` – ⚠️ traži `@/ai/flows/generate-blog-post`
- `(app)/content/generate/newsletter/page.tsx` – ⚠️ traži `@/ai/flows/generate-newsletter`, `@/ai/flows/manage-calendar`
- `(app)/content/generate/video/page.tsx` – ⚠️ koristi `@genkit-ai/react` (zameniti stubom `@/lib/genkit-react`)
- `(app)/reports/[brandId]/page.tsx` – ⚠️ traži `@/ai/flows/strategic-analysis`

## Zavisnosti (glavne)
- `next`, `react`, `react-dom`
- `firebase@^11` + `reactfire@4.2.3` (peer warning na ^9 je benign u praksi)
- `@genkit-ai/flow`, `genkit` (koristiti konzistentno)
- `@sentry/nextjs` (trenutno neutralisan u instrumentation.ts)

## TODO markeri
- [ ] Zameniti stub flow-ove pravim implementacijama
- [ ] Konsolidovati import puteve (koristiti `@/` alias svuda)
- [ ] Uvesti feature-gate za eksperimentalne stranice (vidi `scripts/bm_feature_gates.ts`)
