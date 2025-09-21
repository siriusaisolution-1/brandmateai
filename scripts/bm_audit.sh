#!/usr/bin/env bash
# BrandMate - Project Audit
# Run: pnpm audit:local   (nakon što dodaš skriptu u package.json)
# ili: bash scripts/bm_audit.sh

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

mkdir -p "$DOCS_DIR"

echo "▶ Audit start @ $TIMESTAMP"

# 1) STRUKTURA PROJEKTA
STRUCTURE_MD="$DOCS_DIR/project-structure.md"
{
  echo "# Project Structure"
  echo ""
  echo "- Generated: $TIMESTAMP"
  echo ""
  echo "## Tree"
  echo ""
  if command -v tree >/dev/null 2>&1; then
    echo '```'
    # Izbegni node_modules i .next da ne bude ogroman izlaz
    tree -I "node_modules|.next|out|.git|.firebase" -a
    echo '```'
  else
    echo "_Napomena: 'tree' nije instaliran, koristim 'find' fallback._"
    echo '```'
    find . -path ./node_modules -prune -o -path ./.next -prune -o -path ./out -prune -o -path ./.git -prune -o -path ./.firebase -prune -o -print
    echo '```'
  fi

  echo ""
  echo "## Key Files"
  echo ""
  for f in package.json pnpm-lock.yaml tsconfig.json next.config.ts firebase.json .firebaserc tailwind.config.* postcss.config.*; do
    if [ -f "$ROOT_DIR/$f" ]; then
      echo "- \`$f\` ✅"
    else
      echo "- \`$f\` ❌ (missing)"
    fi
  done
} > "$STRUCTURE_MD"

echo "✔ Wrote $STRUCTURE_MD"

# 2) SANITY CHECK (Next/TypeScript/Tailwind/Firebase)
SANITY_MD="$DOCS_DIR/sanity-check.md"
{
  echo "# Sanity Check"
  echo ""
  echo "- Generated: $TIMESTAMP"
  echo ""

  echo "## Node & Package Managers"
  echo '```bash'
  node -v || echo "node not found"
  pnpm -v || echo "pnpm not found"
  npm -v || echo "npm not found"
  echo '```'
  echo ""

  echo "## Next.js info (ako dostupno)"
  echo '```bash'
  npx --yes next info || echo "next info failed"
  echo '```'
  echo ""

  echo "## TypeScript compile (dry run)"
  echo '```bash'
  if [ -f "$ROOT_DIR/tsconfig.json" ]; then
    npx --yes tsc -v || true
    # samo type-check bez emitovanja (ako tsconfig dopušta)
    npx --yes tsc --noEmit || echo "Type check finished with issues (see console)."
  else
    echo "tsconfig.json not found"
  fi
  echo '```'
  echo ""

  echo "## Tailwind config prisutan?"
  echo '```bash'
  ls -1 tailwind.config.* 2>/dev/null || echo "No tailwind.config.* found"
  echo '```'
  echo ""

  echo "## Firebase config fajlovi"
  echo '```bash'
  if [ -f "$ROOT_DIR/firebase.json" ]; then
    cat firebase.json
  else
    echo "firebase.json not found"
  fi
  echo '```'
  echo ""

} > "$SANITY_MD"

echo "✔ Wrote $SANITY_MD"

# 3) DEPENDENCY REPORT
DEPS_MD="$DOCS_DIR/deps-report.md"
{
  echo "# Dependencies Report"
  echo ""
  echo "- Generated: $TIMESTAMP"
  echo ""

  if [ -f "$ROOT_DIR/package.json" ]; then
    echo "## package.json (summary)"
    echo '```json'
    # lep ispis samo osnovnih delova
    node -e 'const fs=require("fs");const p=JSON.parse(fs.readFileSync("package.json","utf8"));console.log(JSON.stringify({name:p.name, version:p.version, engines:p.engines, scripts:p.scripts, deps:Object.keys(p.dependencies||{}).length, devDeps:Object.keys(p.devDependencies||{}).length}, null, 2));' || true
    echo '```'
    echo ""

    echo "## pnpm list (top level)"
    echo '```bash'
    pnpm list --depth 0 || echo "pnpm list failed"
    echo '```'
    echo ""

    echo "## Potential firebase/reactfire mismatch (heuristika)"
    echo '```text'
    node -e '
      try {
        const fs=require("fs");
        const p=JSON.parse(fs.readFileSync("package.json","utf8"));
        const fb=(p.dependencies||{}).firebase;
        const rf=(p.dependencies||{}).reactfire;
        console.log("firebase:", fb||"(none)");
        console.log("reactfire:", rf||"(none)");
        if (rf && fb) {
          // reactfire 4.x očekuje firebase ^9 (ali u praksi radi i sa 11 uz pažnju).
          console.log("Note: reactfire 4.x peer je ^9; ako build radi – OK. Ako ne – razmotri downgrade firebase na ^9.x ili upgrade reactfire (kada postane dostupno).");
        }
      } catch(e) { console.log(e.message); }
    ' || true
    echo '```'
    echo ""

  else
    echo "package.json not found"
  fi
} > "$DEPS_MD"

echo "✔ Wrote $DEPS_MD"

echo "✅ Audit finished. See docs/ :"
ls -1 "$DOCS_DIR"