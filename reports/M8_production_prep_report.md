# M8 – Production Prep & Launch Readiness – Implementation Report

## 1. Summary

- Dodate su public stranice za about/FAQ/legal da marketing sajt bude spreman za zatvorenu betu.
- Navigacija je proširena tako da posetioci lako pronađu ključne informacije o kompaniji i pravnim dokumentima.
- Napisan je osnovni M8 izveštaj koji prati vidljivost novih javnih stranica.

## 2. UI/UX & Marketing Site

- Public pages:
  - `/`: postojeća landing strana.
  - `/pricing`: postojeća pricing strana.
  - `/features`: postojeća features strana.
  - `/about`: nova priča o proizvodu i viziji.
  - `/faq`: 8 najčešćih pitanja tokom bete.
- App shell & navigation:
  - Marketing header sada uključuje About/FAQ/Legal linkove radi bolje vidljivosti.
- Empty/loading/error states:
  - N/A (nije menjano u ovom inkrementu).

## 3. Analytics

- Global analytics route:
  - Nije menjano u ovom inkrementu.
- Per-brand analytics:
  - Nije menjano u ovom inkrementu.
- Testovi:
  - Nema novih testova u ovom inkrementu.

## 4. Master AI Guardrails & Billing

- Brief validation:
  - Nije menjano u ovom inkrementu.
- Over-limit handling:
  - Nije menjano u ovom inkrementu.
- Billing page:
  - Nije menjano u ovom inkrementu.

## 5. Welcome Tour

- Nije menjano u ovom inkrementu.

## 6. Monitoring & CI

- Sentry:
  - Postojeća konfiguracija ostaje, bez dodatnih izmena.
- CI workflow:
  - Nije menjano u ovom inkrementu.

## 7. Performance & Scaling

- Firestore optimizacije:
  - Nije menjano u ovom inkrementu.
- React optimizacije:
  - Nije menjano u ovom inkrementu.
- Known limitations:
  - Analytics i guardrails nisu obuhvaćeni ovim inkrementom; potrebno u narednim iteracijama.

## 8. How to run locally (for the owner)

1. `pnpm install`
2. Kopiraj `env/.example` → `.env.local` i popuni vrednosti (Firebase + Sentry + ostalo prema `docs/ENVIRONMENT.md`).
3. `pnpm lint`
4. `pnpm test:unit`
5. `pnpm dev`
6. Otvori `http://localhost:3000` i proveri landing, pricing, features, about, FAQ i legal stranice.

## 9. Project state

- M8 status: in_progress
- `codex.currentMilestoneId`: M1 (neizmenjeno; potrebno uskladiti kada se svi zahtevi M8 ispune)
- Ako M8 NIJE u potpunosti završen:
  - Nedostaju guardrails, global/per-brand analytics, billing usage prikaz i welcome tour iz definicije zadatka.
  - Sledeći task treba da pokrije ove funkcionalnosti i testove.

## 10. Risks & next steps

- Preostali guardrails i billing logika nisu obuhvaćeni, što može uticati na troškove i UX.
- Potrebno je dodati testove i CI pokrivenost za nove funkcije kada budu implementirane.
- Preporuka za naredni korak: dovršiti analytics, guardrails, limits i welcome tour pre produkcije.
