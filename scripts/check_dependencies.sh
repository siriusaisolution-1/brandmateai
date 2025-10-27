#!/usr/bin/env bash
set -euo pipefail

if command -v pnpm >/dev/null 2>&1; then
  pnpm audit --prod --audit-level=high || true
else
  echo "pnpm is not available; skipping dependency audit" >&2
fi
