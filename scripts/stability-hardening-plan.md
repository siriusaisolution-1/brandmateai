# Hardening Plan (Stabilnost, Kompatibilnost, Performanse)

## 1) Uklanjanje izvora grešaka (kompilacija i runtime)
- Dodati stub flow-ove tamo gde stranice očekuju import (admin-stats, blog, newsletter, manage-calendar, strategic-analysis).
- Zameniti sve `from '@genkit-ai/react'` sa lokalnim `@/lib/genkit-react` stubom.
- Osigurati postojanje minimalnih UI primitiva: `Textarea`, `Table`, `use-toast`, `Switch`, `Label`.
- Firestore init: `initializeFirestore(app, { experimentalAutoDetectLongPolling: true })` – već preporučeno.
- `instrumentation.ts`: ostaje no-op dok se ne potvrdi stabilnost.

## 2) Kompatibilnost paketa
- `reactfire@4.2.3` + `firebase@^11`: peer warning je poznat; ako nastanu realni problemi, preći na ručni `onAuthStateChanged` hook umesto Reactfire.
- `@genkit-ai/flow` i `genkit` – držati iste major/minor verzije (trenutno 1.16.x je OK za `genkit`, flow 0.5.x je klijent; proveriti changelog).

## 3) Performanse
- Marketing rute (pricing, landing) bez realtime hook-ova.
- Lazy-load heavy komponenti (editori, markdown render) – `dynamic(() => import('...'), { ssr: false })` kada je opravdano.
- Puppeteer/scraper-service: keš rezultata 24h (kolekcija `scrapedCache`) pre svakog poziva.

## 4) Observability
- Postepeno uključiti `@sentry/nextjs` kada prođe smoke-build, sa sample rate niskim u početku.
- Genkit OpenTelemetry – uključiti kada AI flow-ovi budu vraćeni.

## 5) Security & billing guardrails
- Credit Guard pre svih skupih AI poziva (BMK kalkulacija).
- Moderation flow za tekstualne izlaze (Content Safety).
- Cloud Monitoring alerti za scraper-service (latency, memory).

## 6) Preview kanali i QA
- Hosting: `firebase hosting:channel:deploy stage-preview` (SSR frameworksBackend).
- Playwright smoke test: /pricing render, /signup query param propagacija.
