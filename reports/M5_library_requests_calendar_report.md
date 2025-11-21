# M5 – Library, Requests & Calendar – Implementation Report

## 1. Summary

- Implemented brand-scoped pages for the asset library, content requests list, and calendar.
- Added Firestore hooks for outputs, content requests, and calendar events using ReactFire queries.
- Updated Firestore rules and shared types to include contentRequests and outputs collections.
- Documented data access and milestone status updates.

## 2. Library – `/app/brands/{brandId}/library`

- Page file(s):
  - `src/app/(app)/brands/[brandId]/library/page.tsx`
- Data source:
  - Firestore `outputs` collection via `useBrandOutputs` hook.
- UI behavior:
  - Filter buttons for all/video/image/copy; cards for media and copy with dialog previews and clipboard support; empty state links to chat.

## 3. Requests – `/app/brands/{brandId}/requests`

- Page file(s):
  - `src/app/(app)/brands/[brandId]/requests/page.tsx`
- Data source:
  - Firestore `contentRequests` via `useBrandContentRequests`.
- Orchestrator integration:
  - “Process now” button calls callable `processContentRequest`; shows toast feedback and disables while running.
- Empty state behavior.
  - Shows guidance and link to chat when no requests exist.

## 4. Calendar – `/app/brands/{brandId}/calendar`

- Page file(s):
  - `src/app/(app)/brands/[brandId]/calendar/page.tsx`
- Data source:
  - `calendarEvents` collection filtered by brand and visible month range.
- Calendar behavior & limitations.
  - Simple month grid, read-only events list per day; no drag-and-drop or publishing actions yet.

## 5. Hooks & services

- New/updated hooks:
  - `useBrandOutputs`, `useBrandContentRequests`, `useBrandCalendarEvents`, `groupOutputsByDate` (in `src/hooks/brand-content.ts`).
- Short explanation for each.
  - Each hook wraps a Firestore query (with brand filters and optional ranges/type filters) and normalizes timestamps to Date objects.

## 6. Tests

- Test command:
  - `pnpm test:unit`
- New/updated test files:
  - `tests/hooks/brand-content.test.ts`
  - `tests/app/library-page.test.tsx`
- Coverage summary:
  - Groups outputs by date helper and verifies library page renders with mocked data.

## 7. Project state

- M5 status: done
- `codex.currentMilestoneId`: M6
- If M5 is not fully done:
  - N/A
  - Suggested follow-up tasks (e.g. linking calendar with publishing in future milestones).

## 8. Risks & next steps

- Known UX/tech limitations for Library/Requests/Calendar.
  - Calendar is read-only and depends on `calendarEvents` being populated; process trigger depends on callable being deployed.
- Recommended focus for M6 (Billing & Limits) and beyond.
  - Add scheduling/publishing workflows and tighten feedback loops between requests and generated outputs; introduce usage tracking for billing.
