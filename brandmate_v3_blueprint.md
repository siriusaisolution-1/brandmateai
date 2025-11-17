# BrandMate v3 – Product & Architecture Blueprint

## 1. Vizija i pozicioniranje

BrandMate v3 je **AI content studio za video + vizuale + copy**, vođen **master AI agentom**, namenjen:
- solo preduzetnicima,
- malim marketing agencijama,
- kreatorima/influenserima,

koji žele da vode Instagram/TikTok (i slične kanale) **bez** zapošljavanja celog tima (copywriter, dizajner, montažer).

Glavni fokus:
- korisnik zada **brief u razgovoru sa master AI-jem**,
- sistem generiše **video, fotke i prateći copy**,
- sve je usklađeno sa **brand memorijom** (tone of voice, boje, font, ciljana publika),
- korisnik može da refinira → odobri → preuzme ili direktno objavi.

Biznis ograničenje:
- trošak media generacije (Novita + modeli) mora da stane u okvir:
  - ~3–5 videa nedeljno / 12–15 fotki nedeljno po klijentu,
  - ukupni “hard” trošak (modeli) ~6–10 USD mesečno po klijentu,
- dovoljno margine za:
  - servere / infra,
  - marketing,
  - referral programe (npr. ~30% rev share),
  - profit.

---

## 2. Ciljna grupa i use-case

Šira ciljana grupa (sa različitom komunikacijom, ali istom suštinskom potrebom):

- **Solo preduzetnici & influenseri**
  - Nemaju vreme/znanje za full marketing.
  - Žele gotove materijale “copy + vizual/video” spremne za objavu.

- **Male/medium marketing agencije**
  - Svaki account manager vodi 6–10 klijenata; uz BrandMate cilj 10–15.
  - Cilj: ušteda vremena i povećanje profitabilnosti po klijentu.

Glavni use-case:

> “Ulogujem se → ispričam master AI-ju ko sam i šta radim →  
> kažem: ‘Treba mi 10 video sadržaja za sledeće 2 nedelje za IG Reels’ →  
> dobijem predloge, korigujem, odobrim, skinem ili zakažem objavu.”

---

## 3. Sistem – high-level arhitektura

**Frontend:**
- Next.js 15 App Router (TypeScript, React 18)
- Tailwind + shadcn/ui za dizajn sistem
- React Query za data fetching / cache
- “Chat” UI sa master AI-jem kao glavni ulaz u sve funkcije

**Backend:**
- Firebase:
  - Auth (email + social logini)
  - Firestore (user, brands, campaigns, outputs, media assets, usage, billing)
  - Storage (upload brand fotografija, proizvoda itd.)
  - Functions Gen2 (AI flows + master agent orchestration + media upload service)
- Rate limiting + logging (observability)

**AI sloj:**
- Master AI: OpenAI GPT high-mini (ili ekvivalent) kao orkestrator:
  - razgovara sa korisnikom,
  - traži nedostajuće informacije,
  - generiše spec-ove za taskove,
  - delegira spec-ove specijalizovanim agentima.

- Specijalizovani agenti (takođe LLM + tools):
  - **Copy Agent** – naslovi, opisi, hook-ovi, CTA, scenariji.
  - **Visual Agent** – prompti za fotke (Novita image API), selekcija stilova.
  - **Video Agent** – prompti + parametri za video (Novita video API ili drugi style provider).
  - **Style/Memory Agent** – čita i upisuje “brand memory” (tone, boje, preferencije).
  - **Scheduler/Publishing Agent** (v3.1+) – integracija sa Instagram/TikTok API za zakazivanje.

---

## 4. Mapa aplikacije (stranice i rute)

### 4.1. Public (marketing) site

- `/` – Landing
  - Hero: šta BrandMate radi (video+vizual+copy za tvoj brand).
  - Kratak demo flow (“Brief → AI → Gotov sadržaj”).
  - CTA: “Start free trial”.

- `/pricing`
  - Paketi (Starter / Pro / Agency).
  - Šta dobijaš mesečno (otprilike broj videa/fotki, AI krediti).
  - FAQ oko korišćenja i cene.

- `/features`
  - Detaljniji opis:
    - Master AI chat,
    - Brand onboarding wizard,
    - Video & visual generation,
    - Copy companion,
    - Brand memory.

- `/about`, `/faq`, `/legal/*` (ToS, Privacy, Cookie policy)
  - Standardne informativne strane.

- `/login`, `/register`, `/reset-password`
  - Firebase-auth integracija (email + Google, eventualno još providera).
  - Redirect u `/app` nakon logina.

---

### 4.2. App shell & glavne stranice (za logovane korisnike)

Sve unutar `/app` ruta:

- `/app`
  - Redirect na:
    - `/app/onboarding` ako nema aktivnog brenda,
    - `/app/brands/{activeBrandId}/home` ako postoji.

- `/app/onboarding`
  - **Brand Quick Setup (korak 1)** – kratka verzija (opcija B):
    - osnovno: industry, website, IG/TikTok handle, tip brenda, cenovni rang, ciljna publika.
  - Nakon toga Master AI pita:
    > “Za bolje rezultate, želiš li da odgovoriš na još nekoliko pitanja sada ili kasnije?”
    - ako DA → prelaz na Extended setup (korak 2),
    - ako NE → brand se kreira, može kasnije dopuniti.

- `/app/brands`
  - Lista svih brendova korisnika.
  - Akcije: set as active, edit, delete (ako dozvoljeno).

- `/app/brands/new` (deep wizard)
  - Extended brand wizard:
    - misija, vizija, vrednosti,
    - tone of voice,
    - ciljne personae,
    - upload fontova (ili naziv),
    - korporativne boje (HEX / RGB / CMYK / Pantone),
    - upload ~10 slika (tim, prostor, proizvodi),
    - detalji o ključnim proizvodima/uslugama (naziv, opis, benefit).
  - Sve se upisuje u `brandMemory` entitet u Firestore.

- `/app/brands/{brandId}/home`
  - “Hub” za taj brand:
    - poslednje generisane kampanje,
    - brzi pregledi: “Upcoming posts”, “Last 5 assets”.

- `/app/brands/{brandId}/chat`
  - **Glavni ekran – Master AI Chat**
    - Chat UI sličan ChatGPT-u.
    - Desno sidebar: trenutno aktivni brand, ton, boje, kratki rezime.
    - User: “Kreiraj mi 10 video sadržaja za sledeće 2 nedelje za IG Reels.”
    - Master AI:
      - proverava da li ima dovoljno informacija,
      - postavlja dodatna pitanja (tema, cilj, stil, CTA, trajanje),
      - potvrđuje: “OK, kreiram X videa + Y fotki + copy. Prihvatate?”,
      - šalje taskove agentima.

- `/app/brands/{brandId}/library`
  - **Asset Library**
    - Tabovi: “Videos”, “Images”, “Copy”.
    - Filteri: kampanja, kanal, datum, status (draft/approved/published).
    - Akcije: pregled, preuzimanje, dupliranje, slanje u plan objave.

- `/app/brands/{brandId}/requests`
  - Lista svih content request-ova (taskova):
    - npr. “10 Reels za Black Friday promo”.
    - status: queued / processing / needs_revision / approved.
    - klik otvara detalje (vidi sve generisane varijante, istoriju revizija).

- `/app/brands/{brandId}/calendar` (verzija 1: samo view)
  - Kalendar objava (bez direktnog posta za v3.0).
  - Ručno ili AI predloženo planiranje dana, teme i tipa sadržaja.

- `/app/account`
  - User profil: ime, email, jezik, zona, email notifikacije.

- `/app/billing`
  - Planovi, fakture, upgrade/downgrade (Stripe).
  - Broj iskorišćenih kredita/količina videa/fotki u mesecu.

- `/app/settings/brand/{brandId}`
  - Podešavanja brenda:
    - update brand memory polja,
    - update boja, fontova, ton of voice,
    - specijalne preferencije (npr. “uvek koristi zelenu pozadinu”, “izbegavaj slike lica”).

---

## 5. Master AI + agenti – logika

### 5.1. Master AI (Orchestrator)

Zadaci:
- konverzacija sa korisnikom,
- skuplja info koje nedostaje (uvek pitamo pre odluke),
- generiše **Content Brief** objekat, npr:

    {
      "brandId": "b_123",
      "goal": "increase_sales",
      "channels": ["instagram_reels"],
      "contentTypes": ["video", "image"],
      "quantity": { "video": 4, "image": 8 },
      "style": {
        "tone": "friendly",
        "energy": "high",
        "colors": ["#00FF00"]
      },
      "constraints": {
        "maxVideoLengthSec": 10,
        "platformBudget": { "novitaVideoCredits": 40 }
      },
      "revisionPolicy": {
        "includedRevisions": 1,
        "warnOnExtra": true
      }
    }

Na osnovu tog brifa master AI:

- šalje taj brief specijalizovanim agentima:
  - **Copy Agent** → generiše scenario + tekst + CTA.
  - **Visual Agent** → generiše prompt(e) i fotke preko Novita image API.
  - **Video Agent** → generiše prompt(e) i video(-e) preko Novita video API / drugih style provider-a.
- posle generacije:
  - agregira rezultate,
  - prikazuje korisniku (previewe + info),
  - omogućava izbor + reviziju,
  - ako je uključena revizija već iskorišćena, postavlja pitanje:
    - “Da li želite još izmena? Sledeća revizija biće dodatno naplaćena.”

### 5.2. Brand Memory & Preferences

Brand memory sadrži:
- osnovne brand info,
- ton of voice, misija, vrednosti,
- ciljne persona opise,
- boje, fontove,
- preferencije (npr. “uvek koristi zelenu pozadinu”, “izbegavaj humor”, “govori u množini”),
- istorija interakcija (izvučene preferencije iz chat-a).

Svaka nova relevantna informacija iz chata (tipa: “od sada mi uvek pravi fotke na zelenoj pozadini”) se:
- parsira od strane Style/Memory agenta,
- upisuje u brand memory,
- koristi u svim budućim promptima.

---

## 6. Data model – high-level

**User**
- `id`, `email`, `name`
- `subscriptionPlan`
- `roles` (user/agency-owner/team-member)
- `onboardingComplete`

**Brand**
- `id`, `ownerId`
- `name`, `industry`, `website`, `socialHandles`
- `priceRange`, `targetAudienceSummary`
- `brandMemoryRef` (pointer na pod-dokument gde je ton, boje itd.)

**BrandMemory**
- `toneOfVoice`
- `values`, `mission`
- `colors`, `fonts`
- `personas[]`
- `preferences[]`
- `lastUpdatedBy`, `lastUpdatedAt`

**ContentRequest**
- `id`, `brandId`, `userId`
- `type`: `campaign` | `single_post`
- `goal`, `channels[]`
- `requestedOutputs`: npr. `{ "video": 4, "image": 8 }`
- `status`: `draft` / `queued` / `processing` / `needs_revision` / `approved`
- `masterBrief` (JSON dump)

**Output**
- `id`, `brandId`, `requestId`
- `type`: `video` | `image` | `copy`
- `meta`: platform, size, duration, itd.
- `storagePath` / `url` (za video/image)
- `text` (za copy)
- `status`: `draft` / `approved` / `published`
- `revisionIndex`

**MediaAsset**
- `id`, `brandId`, `type`
- `storagePath`, `url`
- `tags`, `createdAt`

**Usage/Billing**
- `aiUsage` (po brandu i korisniku)
- `novitaTasks`
- `bmkLedger` (tokeni, krediti)
- `stripeEvents`

---

## 7. Milestones (v3 putanja)

- **M1 – Foundation & Auth**
  - repo cleanup, env, Firebase init
  - osnovne auth rute & app shell

- **M2 – Brand Onboarding & Brand Memory**
  - quick setup + extended wizard
  - brand + brandMemory model + rules

- **M3 – Master AI Chat MVP**
  - chat UI za jedan brand
  - master agent koji kreira ContentRequest (još bez realne media generacije)

- **M4 – Agents & Media Generation**
  - Copy agent (scenariji + copy)
  - Visual agent (fotke)
  - Video agent integracija (Novita video styles / drugi provider)
  - povezivanje sa ContentRequest/Output modelom

- **M5 – Library, Requests & Calendar**
  - asset library
  - lista taskova/requests
  - simple content calendar view

- **M6 – Billing & Limits**
  - Stripe billing
  - usage limits, soft/hard caps po planu
  - upozorenja korisniku

- **M7 – Polish & Analytics**
  - osnovni analytics ekran
  - UX polishing, error states, prazne liste itd.
