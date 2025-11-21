# M2 – Brand Onboarding & Brand Memory – Report

## 1. Implemented features
- [ ] Quick Brand Setup (`/app/onboarding`)
- [ ] Extended Brand Wizard (`/app/brands/{brandId}/wizard`)
- [ ] Brand list & active brand selector (`/app/brands`)
- [ ] Brand home (`/app/brands/{brandId}/home`)
- [ ] Brand settings / memory editor (`/app/settings/brand/{brandId}`)
- [x] Brand + BrandMemory data model + services
- [x] Firestore security rules for brands & brandMemories

## 2. Data model & rules
- **Brand** documents now capture ownerId, industry, website, social handles, price range, target audience summary, status, and timestamps, and include a `brandMemoryRef` pointing to the paired BrandMemory document.
- **BrandMemory** documents store tone, mission, values, personas, visual identity, preferences, asset summary, `incomplete` flag, and timestamps, keyed by `brandId`.
- Firestore rules now restrict brand and brandMemories operations to authenticated owners (M2 baseline) and will be extended for workspace/team models later.

## 3. Tests
- `pnpm test:unit` exercises the active brand selection helper and Firestore security rules via the rules unit testing harness.
- Security rule tests verify owner-only creation for brands and owner-only access to brandMemories.
- All implemented unit tests currently pass.

## 4. Known limitations & TODO
- UI flows for onboarding, brand management pages, and extended wizard are not yet implemented in this milestone snapshot.
- Brand service functions are client-side only and still need integration hooks (React Query) and UI wiring.
- Additional emulator-based tests for brand service CRUD can be added when UI flows are connected.

## 6. Important constraints
- No AI logic or new integrations introduced.
- Existing environment/CI configuration untouched; design system unchanged.
- Minimal structural changes; comments and rule updates document the M2 baseline for future workspace extensions.
