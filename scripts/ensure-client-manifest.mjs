#!/usr/bin/env node
import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const appRoot = path.join(rootDir, 'src', 'app');

const IMPORT_STATEMENT = "import './_noop-client';\n";

const stats = {
  scanned: 0,
  modified: 0,
  noop_created: 0,
  side_effect_imports_injected: 0,
};

function isRouteGroupDir(name) {
  return name.startsWith('(') && name.endsWith(')');
}

function isPageFile(name) {
  return name === 'page.ts' || name === 'page.tsx';
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureNoopClientFile(dir) {
  const targetPath = path.join(dir, '_noop-client.tsx');
  const content = "'use client';\nexport default function Noop() {\n  return null;\n}\n";

  if (!(await pathExists(targetPath))) {
    await writeFile(targetPath, content, 'utf8');
    stats.noop_created += 1;
    return;
  }

  const existing = await readFile(targetPath, 'utf8');
  if (existing !== content) {
    await writeFile(targetPath, content, 'utf8');
    stats.modified += 1;
  }
}

function hasUseClientDirective(source) {
  return /['"]use client['"]/u.test(source);
}

function hasNoopImport(source) {
  return /import\s+['"]\.\/_noop-client['"];?/um.test(source);
}

async function processPageFile(filePath) {
  stats.scanned += 1;
  const source = await readFile(filePath, 'utf8');

  if (hasUseClientDirective(source) || hasNoopImport(source)) {
    return;
  }

  const dir = path.dirname(filePath);
  await ensureNoopClientFile(dir);

  const updatedSource = `${IMPORT_STATEMENT}${source}`;
  await writeFile(filePath, updatedSource, 'utf8');
  stats.modified += 1;
  stats.side_effect_imports_injected += 1;
}

async function traverseDirectory(dirPath, insideRouteGroup = false) {
  let entries;
  try {
    entries = await readdir(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const nextInsideRouteGroup = insideRouteGroup || isRouteGroupDir(entry.name);
      await traverseDirectory(fullPath, nextInsideRouteGroup);
      continue;
    }

    if (insideRouteGroup && entry.isFile() && isPageFile(entry.name)) {
      await processPageFile(fullPath);
    }
  }
}

if (await pathExists(appRoot)) {
  await traverseDirectory(appRoot);
} else {
  console.warn('No src/app directory found.');
}

console.log(JSON.stringify(stats));
