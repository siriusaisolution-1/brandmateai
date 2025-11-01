#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

run_step() {
  local description=$1
  shift
  echo ""
  echo "==> ${description}"
  "$@"
}

run_step "Run fast quality checks" env RUN_E2E=0 pnpm run check:fast

run_step "Lint Cloud Functions" pnpm --filter functions lint
run_step "Typecheck Cloud Functions" pnpm --filter functions typecheck

if [[ "${RUN_E2E:-0}" == "1" ]]; then
  if command -v xvfb-run >/dev/null 2>&1 && [[ -z "${DISPLAY:-}" ]]; then
    run_step "Run Playwright tests" xvfb-run -a pnpm exec playwright test --reporter=line
  else
    run_step "Run Playwright tests" pnpm exec playwright test --reporter=line
  fi
fi

run_step "Build Cloud Functions" pnpm --filter functions build
