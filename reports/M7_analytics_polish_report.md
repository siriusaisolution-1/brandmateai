# M7 – Analytics & Polish – Implementation Report

## 1. Summary

- Added analytics data layer with brand and global aggregation over outputs, content requests, and usage snapshots.
- Built global and per-brand analytics dashboards with loading, empty, and error handling states.
- Polished key brand pages with clearer empty states, skeletons, and status badges for requests and media assets.

## 2. Analytics

### 2.1. Data & models

- Introduced analytics snapshot types covering outputs, content requests, and usage counts.
- Implemented `fetchBrandAnalytics` and `fetchGlobalAnalytics` to aggregate Firestore collections within a selected period.

### 2.2. Global analytics UI

- Ruta: `/app/analytics`
- Opis: Prikazuje globalni overview za poslednjih 30 dana sa ukupnim metrikama i per-brand karticama kada postoji više brendova.

### 2.3. Per-brand analytics UI

- Ruta: `/app/brands/[brandId]/analytics`
- Opis: Kartice za outputs, content requests i usage; empty state vodi ka Master AI chatu ili biblioteci kada nema sadržaja.

## 3. UX Polish

- Stranice koje su polirane:
  - Media library
  - Content requests
  - Calendar placeholder
- Empty states:
  - Media library (no assets), content requests (no requests), brand analytics (no outputs)
- Loading states:
  - Skeletons for media library and requests lists; loaders for analytics fetches
- Error handling:
  - Local alerts on failed analytics/media/request fetches

## 4. Tests

- Test runner: vitest
- Komanda: `pnpm test:unit`
- Novi test fajlovi:
  - `src/lib/analytics-data.test.ts`
  - `src/components/analytics/analytics-cards.ui.test.tsx`
- Pokrivaju agregaciju Firestore metrika i rendering ključnih analytics UI elemenata.

## 5. How to verify (for the owner)

1. `pnpm dev`
2. Uloguj se kao korisnik sa jednim brandom:
   - otvori `/app/analytics` → vidi global overview.
3. Kreiraj još jedan brand:
   - otvori `/app/analytics` → vidi global + per-brand cards.
4. Otvori `/app/brands/[brandId]/analytics`:
   - proveri metrike, empty state, linkove ka chat/library.
5. Otvori library/requests/calendar:
   - proveri empty states i loading ponašanje.

## 6. Project state

- M7 status: done
- `codex.currentMilestoneId`: M7
- Ako M7 nije potpuno završen:
  - N/A

## 7. Risks & next steps

- Usage metrics rely on existing `usageSnapshots`; deeper cost metrics may require additional fields.
- Future work: richer charts, configurable periods, and calendar reactivation once flows are refactored.
