# BrandMate Specification Status

## CI Checklist

- ☐ Lint
- ☐ Typecheck
- ☐ Test (unit + e2e)
- ☐ Build

Last successful CI run: manual

| Item | Status | Notes | Reference |
| --- | --- | --- | --- |
| Toolchain readiness | ✅ | `pnpm install`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` succeed on Node 20. | `main` |
| Unit & integration coverage | ✅ | `pnpm test --coverage` enforces 80% thresholds; Vitest suite covers Firebase utils, middleware, and flow clients. | `functions/src/utils/*.test.ts`, `src/app/api/**/route.test.ts` |
| Playwright journeys | ✅ | `pnpm exec playwright test` exercises brand onboarding, AI content generation, and media upload/library review. | `e2e/flows.spec.ts` |
| Health & diagnostics | ✅ | `/health` responds with `{ ok: true }`; `/api/diag` exposes runtime env metadata. | `src/app/health/route.ts`, `src/app/api/diag/route.ts` |
| Operations playbook | ✅ | `docs/PLAYBOOK.md` documents setup, secrets, deployment, monitoring, and rollback procedures. | `docs/PLAYBOOK.md` |
