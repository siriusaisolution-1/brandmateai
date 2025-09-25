# Error Buckets & Uzroci

## A) Build-time (Module not found)
- `@/ai/flows/admin-stats` – FALI → dodati stub
- `@/ai/flows/generate-blog-post` – FALI → stub
- `@/ai/flows/generate-newsletter` – FALI → stub
- `@/ai/flows/manage-calendar` – FALI → stub
- `@/ai/flows/strategic-analysis` – FALI → stub
- `@genkit-ai/react` – paket ne postoji → zameniti `@/lib/genkit-react`

## B) Runtime (dev console)
- Firestore `WebChannelConnection RPC 'Listen' ... transport errored` – često benigno u proxied okruženju; mitigacija long-polling + gasiti nepotrebne listenere na javnim stranicama.
- 404 za `vsda.js` i slične – dolazi iz Studio/VSC embed-a; nema uticaja na app.
- Quirks mode upozorenja na 404.html u Studio-u – nije deo vaše app (OK).

## C) Peer dependency warns
- `reactfire` ↔ `firebase` – ignoriši dokle god nema realnih bugova.

## D) Potencijalni future pitfalls
- Mešanje App Router SSR i `next export` (SPA) – držati se SSR (frameworksBackend).
- Feature flagging za eksperimentalne rute (Admin, Reports) – izbeći iznenadna pucanja u prod.
