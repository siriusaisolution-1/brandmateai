# BrandMate Operations Playbook

## Daily checklist
- `pnpm install --frozen-lockfile=false`
- `pnpm lint --max-warnings=0`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Deployment
1. Ensure quality gate workflow is green (lint, typecheck, tests, build).
2. Tag the release commit and push to trigger the deploy workflow.
3. Monitor Firebase console for function status and check `/health`.
4. Rollback by redeploying the previous tag if smoke checks fail.

## Incident response
- Check Cloud Logging for `billing.checkout.session.failed`, `billing.webhook.failed`, and `scraper.request.failed` entries.
- Confirm rate limiter metrics via logs (`rate-limit.blocked` events).
- Disable traffic spikes by lowering `RATE_LIMIT_CALLS_PER_MIN` or `RATE_LIMIT_SCRAPER_PER_MIN` in Codex Secrets.

## Testing
- Unit tests: `pnpm test:unit`
- E2E smoke: `pnpm test:e2e`
- Coverage report: generated in `coverage/` after `pnpm test:unit`.

## Useful URLs
- `/health` — service heartbeat endpoint
- `/dashboard` — authenticated app
- `/content/generate/video` — video studio surface
