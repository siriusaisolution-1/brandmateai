# Firebase Audit – Collections & Security (M4)

## Collections overview

- `brands/{brandId}` – brand profile and ownership metadata.
- `contentRequests/{requestId}` – user-submitted content generation requests tied to a brand.
- `outputs/{outputId}` – generated assets (copy, image, video) linked to a `contentRequest` and `brand`.
- `mediaAssets/{assetId}` – uploaded assets mapped to a brand/user.
- Supporting collections: `users`, `notifications`, `calendarEvents`, `adCampaigns`, `scrapedCache`.

## Outputs collection

- **Shape:**
  - `brandId` (string) – owning brand id.
  - `requestId` (string) – source content request.
  - `type` (`copy` | `image` | `video`).
  - `platform` (string, optional) – target channel.
  - `variantIndex` (number, optional) – variant ordering.
  - `status` (`draft` | `approved` | `published` | string).
  - `meta` (object, optional) – duration/size/style metadata.
  - `storagePath`, `url` – asset pointers.
  - `text` – copy payload when type is `copy`.
  - `createdAt`, `updatedAt`, `createdBy`.

- **Collection layout:** top-level `outputs/{outputId}` with explicit `brandId` and `requestId` fields.

- **Rules:**
  - Read allowed for brand owners (`isBrandOwner(resource.data.brandId)`).
  - Write allowed for brand owners based on `request.resource.data.brandId` (backend/service pattern).

## Rules test coverage

- `tests/firestore.outputs.rules.test.ts` verifies:
  - owners can read their brand outputs,
  - non-owners are denied.
