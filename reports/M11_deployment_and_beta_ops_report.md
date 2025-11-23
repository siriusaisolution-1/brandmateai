# M11 – Deployment & Beta Ops Report

## 1. Summary
Completed the deployment playbook for Vercel + Firebase, added the closed-beta owner dashboard, and shipped the in-app feedback loop. Sentry now fails gracefully when DSN is missing, `/admin/beta` aggregates live data for the founder, and Firestore rules/tests cover the new `betaFeedback` surface. Project state is updated to mark M11 as done and advance toward M12 planning.

## 2. Deployment Guide
- File: `docs/DEPLOYMENT_VERCEL_FIREBASE.md`
- Covers Vercel linking, required env vars (`NEXT_PUBLIC_BETA_MODE`, Firebase config, Sentry DSN, Novita/API keys), and the Firebase CLI steps for deploying Functions + Firestore rules.

## 3. Admin Beta Dashboard
- Route: `/admin/beta` (`src/app/(app)/admin/beta/page.tsx`)
- Data: users (plan + brand count), brands, usage snapshots, and beta feedback entries (read-only).
- Guard: `isOwnerUser` helper + env vars `NEXT_PUBLIC_ADMIN_OWNER_EMAIL` / `ADMIN_OWNER_UID` combined with the existing admin claim.

## 4. Feedback Kanal
- Kolekcija: `betaFeedback`
- Ko može da piše: autentifikovani user putem modala u AppTopbar-u (`Send feedback` dugme, kontekst + opcioni Brand ID). Pisanje je create-only.
- UI: dugme se nalazi u app top-baru uz "Beta" badge; modal koristi textarea + context input.
- Owner view: tabelarni prikaz u `/admin/beta` (feedback panel sa user email-om, brendom, porukom i statusom).

## 5. Monitoring & Health
- Sentry: wrapper sada proverava DSN; bez DSN-a radi no-op i samo loguje u dev modu. Kada je DSN prisutan, greške iz globalnog UI-ja se šalju standardno.
- Health endpoint: `/api/health` ostaje neizmenjen; verifikovan nakon `pnpm build` (vidi checklist u deployment guide-u).

## 6. Tests
- Novi testovi: `src/lib/auth/owner.test.ts`, `src/lib/feedback.test.ts`, `tests/firestore/beta-feedback.rules.test.ts`, plus updated `src/lib/observability/sentry-client.test.ts`.
- Komande: `pnpm test:unit`
- Status: Pass (see final summary for command output).

## 7. Project state
- M11 status: `done`
- `codex.currentMilestoneId`: `M12`
- Otvorene stavke za sledeći milestone: referral / affiliate module, public launch polish, and expanding analytics beyond the beta snapshot.
