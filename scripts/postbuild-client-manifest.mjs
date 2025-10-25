#!/usr/bin/env node
import { access, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const buildAppDir = path.join(rootDir, '.next', 'server', 'app');
const marketingDir = path.join(buildAppDir, '(marketing)');
const manifestSource = path.join(buildAppDir, 'page_client-reference-manifest.js');
const manifestDest = path.join(marketingDir, 'page_client-reference-manifest.js');

const stats = {
  source_exists: false,
  destination_exists: false,
  patched: false,
};

async function fileExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  stats.source_exists = await fileExists(manifestSource);
  if (!stats.source_exists) {
    return;
  }

  stats.destination_exists = await fileExists(manifestDest);
  if (stats.destination_exists) {
    return;
  }

  await mkdir(marketingDir, { recursive: true });
  await copyFile(manifestSource, manifestDest);
  stats.patched = true;
  stats.destination_exists = true;
}

try {
  await main();
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
} catch (err) {
  console.error('[postbuild] non-fatal error:', err?.message || err);
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
}
