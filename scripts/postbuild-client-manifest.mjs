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
  } catch (error) {
    return false;
  }
}

async function main() {
  stats.source_exists = await fileExists(manifestSource);
  if (!stats.source_exists) {
    console.log(JSON.stringify(stats));
    return;
  }

  stats.destination_exists = await fileExists(manifestDest);
  if (stats.destination_exists) {
    console.log(JSON.stringify(stats));
    return;
  }

  await mkdir(marketingDir, { recursive: true });
  await copyFile(manifestSource, manifestDest);
  stats.patched = true;
  stats.destination_exists = true;
  console.log(JSON.stringify(stats));
}

await main();
