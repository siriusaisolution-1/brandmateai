// Fail CI ako nađemo dodatne pricing definicije van shared komponente.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const suspectGlobs = [
  "src/app/(marketing)/pricing",
  "src/app/(app)/pricing",
  "src/app/(app)/app/pricing",
];

const shared = "src/components/pricing/pricing-page.tsx";
const SHARED_MARK = "// SINGLE SOURCE OF TRUTH: PRICING PAGE";

let errors = [];

function scanDir(dir) {
  try {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) scanDir(p);
      else if (f.isFile() && p.endsWith(".tsx")) {
        const text = readFileSync(p, "utf8");
        if (
          p !== join(root, shared) &&
          /const\s+PLANS\s*:\s*Plan\[\]/.test(text)
        ) {
          errors.push(`Duplicate PLANS detected in: ${p}`);
        }
      }
    }
  } catch {}
}

for (const g of suspectGlobs) {
  scanDir(join(root, g));
}

// Proveri da shared fajl postoji i ima mark
try {
  const s = readFileSync(join(root, shared), "utf8");
  if (!s.includes(SHARED_MARK)) {
    errors.push(`Shared pricing file missing guard mark: ${shared}`);
  }
} catch {
  errors.push(`Shared pricing file not found: ${shared}`);
}

if (errors.length) {
  console.error("[pricing-guard] Errors:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
} else {
  console.log("[pricing-guard] OK");
}
