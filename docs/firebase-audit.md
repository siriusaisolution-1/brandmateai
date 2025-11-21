# Firebase Audit – Collections & Security (M5 + M6)

Ovaj dokument opisuje Firestore kolekcije, njihove namene, očekivani shape ključnih dokumenata,
kao i sažetak security pravila i test pokrivenosti za BrandMate v3.  
M6 dodaje billing, usage i Stripe-related kolekcije i pravila.

---

## Collections overview

Primarne kolekcije:

- `users/{userId}` – korisnički profil, subscription plan, rola, BMK stanje.
- `brands/{brandId}` – brend profil i vlasništvo (`ownerId`).
- `brandMemories/{memoryId}` – proširena memorija brenda (tone, values, personas, itd.).
- `contentRequests/{requestId}` – zahtevi za generisanje sadržaja vezani za brend i korisnika.
- `outputs/{outputId}` – generisani asseti (copy/image/video) povezani sa `contentRequest` i `brand`.
- `mediaAssets/{assetId}` – uploadovani asseti mapirani na brend/korisnika.
- `calendarEvents/{eventId}` – kalendarski događaji po brendu.
- `adCampaigns/{campaignId}` – meta za kampanje i metrike.
- `scrapedCache/{cacheId}` – cache scrape-ovanog sadržaja (read-only za klijente).
- `notifications/{notificationId}` – notifikacije privatne po korisniku.

Podržavajuće kolekcije (backend-only / analitika / metering / billing):

- `aiUsage`
- `aiCalls`
- `aiUsageDaily`
- `bmkLedger`
- `usageSnapshots` *(M6)*
- `novitaTasks`
- `stripeEvents`
- `operationsAudit`
- `adSyncRequests`

---

## contentRequests collection

- **Namena:** predstavlja jedan korisnički zahtev za sadržajem (npr. “10 IG Reels + 5 copy varijanti”).
- **Korišćenje u UI:** `/brands/[brandId]/requests`.
- **Pravila:**
  - Read je dozvoljen samo vlasniku brenda i vlasniku zahteva.
  - Create dozvoljen samo autentifikovanom korisniku koji je vlasnik brenda.
  - Update/Delete dozvoljeni samo vlasniku brenda i vlasniku zahteva.
- **Napomena:** klijentske izmene su ograničene pravilima – backend može pisati preko Admin SDK.

---

## outputs collection

- **Namena:** generisani outputi koje prave agenti (CopyAgent, VisualAgent, VideoAgent).
- **Korišćenje u UI:** `/brands/[brandId]/library` (read-only prikaz).

### Shape (ključna polja)

- `brandId` (string) – owning brand id.
- `requestId` (string) – source content request id.
- `type` (`copy` | `image` | `video`).
- `platform` (string, optional) – ciljna platforma (npr. `instagram_reels`).
- `variantIndex` (number, optional) – redni broj varijante.
- `status` (`draft` | `approved` | `published` | string).
- `meta` (object, optional) – npr. `durationSec`, `width`, `height`, `styleId`.
- `storagePath` (string, optional) – putanja u Storage-u.
- `url` (string, optional) – javni URL.
- `text` (string, optional) – copy payload kad je `type=copy`.
- `createdBy` (string) – ko je inicirao stvaranje (uid ili “system”).
- `createdAt`, `updatedAt`.

### Collection layout

Top-level: `outputs/{outputId}` sa eksplicitnim `brandId` i `requestId` poljima.

### Rules

- Read allowed za vlasnika brenda: `isBrandOwner(resource.data.brandId)`.
- Write pattern je backend/service:
  - klijent nema write access,
  - backend piše kroz Admin SDK.

---

## mediaAssets collection

- **Namena:** korisnički uploadovi i asseti vezani za brend.
- **Pravila:**
  - Read dozvoljen vlasniku brenda.
  - Create/Update/Delete blokirano za klijenta (backend only).

---

## calendarEvents collection

- **Namena:** jednostavan content calendar po brendu.
- **Korišćenje u UI:** `/brands/[brandId]/calendar` (trenutno read-only month view u UI).
- **Pravila:**
  - Read/Write samo vlasnik event-a (`ownerId == request.auth.uid`).
  - Create samo ako korisnik setuje sebe kao vlasnika.

---

## Billing & Usage (M6)

Ovaj deo pokriva kolekcije i pravila vezane za pretplate, limite i metering.

### users

- **Fields (relevantni za billing):**
  - `subscriptionPlan` (string)
  - `billing.*` (Stripe customer/subscription meta)
  - `bmkBalance`, `bmkCredits` (numerička stanja kredita)
- **Namena:** čuva tier pretplate i bilans kredita. Planovi/limiti se mapiraju u kodu kroz plan registry.

### usageSnapshots

- **Shape:**
  - `userId` (string)
  - `brandId` (string)
  - `yearMonth` (string, npr. `2025-11` u UTC)
  - `videosGenerated` (number)
  - `imagesGenerated` (number)
  - `requestsProcessed` (number)
  - `updatedAt` (server timestamp)
- **Namena:** per-user + per-brand brojači koji se resetuju mesečno.  
  Koriste ih Billing UI i `processContentRequest` limit check.

### aiUsage, aiCalls, aiUsageDaily

- **Namena:** token-level metering za LLM pozive (postojeće kolekcije iz ranijih milestone-ova).  
  I dalje ih koristi `trackAiCall`.

### stripeEvents

- **Namena:** idempotency + audit za Stripe webhook evente (sprečavanje duplih obrada).

### Security rules (billing)

- `usageSnapshots`: korisnik može **samo** da čita/piše dokumente gde `userId == request.auth.uid`.
- Backend funkcije koriste Admin SDK i time zaobilaze rules kada je potrebno (npr. agregacije, backfills).

### Notes

- `yearMonth` se računa u UTC da bi se izbegle timezone nejasnoće.
- Limiti i plan definicije žive u kodu (`functions/src/billing/plans.ts`) i mirror-uju se u Next.js app za UI.
- Stripe tajne nisu hard-coded; placeholderi su u `.env.example` i u `docs/ENVIRONMENT.md`.

---

## Security rules summary

- `brands`:
  - Read/Update/Delete samo vlasnik brenda.
  - Create samo ako `ownerId == request.auth.uid`.
- `brandMemories`:
  - pristup usklađen sa parent brendom (`brandId`).
- `contentRequests`:
  - scoped na vlasnika brenda + vlasnika zahteva.
  - klijentski write je dozvoljen samo u okviru definisanih pravila.
- `outputs`:
  - read vlasnik brenda,
  - klijentski write blokiran (backend pattern).
- `calendarEvents`, `notifications`, `adCampaigns`:
  - privatno po vlasniku dokumenta (`ownerId`).
- `scrapedCache`:
  - read svi autentifikovani, write backend-only.
- `usageSnapshots` (M6):
  - read/write samo vlasnik snapshot-a (`userId == request.auth.uid`).

---

## Frontend touchpoints

- Hooks u `src/hooks/brand-content.ts` rade Firestore querije (ReactFire / React Query).
- UI rute:
  - `src/app/(app)/brands/[brandId]/library/page.tsx`
  - `src/app/(app)/brands/[brandId]/requests/page.tsx`
  - `src/app/(app)/brands/[brandId]/calendar/page.tsx`
  - Billing UI koristi `usageSnapshots` + plan mirror iz app-a.

---

## Rules test coverage

- `tests/firestore.outputs.rules.test.ts` proverava:
  - vlasnik brenda može da čita `outputs`,
  - non-owner je odbijen.
- (M6) Tests za `usageSnapshots` treba da proveravaju:
  - korisnik može da čita/piše samo svoje snapshot-e,
  - drugi korisnici su odbijeni.
- Firestore rules check skripta:
  - preskače run ako emulator host nije prisutan,
  - koristi `demo-project` za izolovane testove.
- Vitest šimovi:
  - Google GenAI importi su aliasovani na lokalni shim da testovi ne zahtevaju mrežu.