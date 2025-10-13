#!/usr/bin/env node
import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const candidateAppDirs = [
  path.join(rootDir, 'app'),
  path.join(rootDir, 'src', 'app'),
];

async function filterExistingDirs(paths) {
  const results = [];
  for (const dirPath of paths) {
    try {
      await access(dirPath);
      results.push(dirPath);
    } catch (error) {
      // ignore missing directories
    }
  }
  return results;
}

const stats = {
  scannedPages: 0,
  noopCreated: 0,
  importsAdded: 0,
};

function isRouteGroupDir(name) {
  return name.startsWith('(') && name.endsWith(')');
}

function isPageFile(name) {
  return name === 'page.ts' || name === 'page.tsx';
}

async function ensureNoopClientFile(dir) {
  const targetPath = path.join(dir, '_noop-client.tsx');
  const content = "'use client';\nexport default function Noop(){ return null; }\n";

  let exists = true;
  try {
    await access(targetPath);
  } catch (error) {
    exists = false;
  }

  if (!exists) {
    await writeFile(targetPath, content, 'utf8');
    stats.noopCreated += 1;
  } else {
    const existing = await readFile(targetPath, 'utf8');
    if (existing !== content) {
      await writeFile(targetPath, content, 'utf8');
    }
  }
}

function hasUseClientDirective(source) {
  return source.includes("'use client'") || source.includes('"use client"');
}

function hasNoopImport(source) {
  return /import\s+.+\s+from\s+['"]\.\/_noop-client['"]/.test(source);
}

async function processPage(filePath) {
  stats.scannedPages += 1;
  const source = await readFile(filePath, 'utf8');

  if (hasUseClientDirective(source) || hasNoopImport(source)) {
    return;
  }

  const dir = path.dirname(filePath);
  await ensureNoopClientFile(dir);

  const importLine = "import Noop from './_noop-client'";
  const prefix = `${importLine}\n\n`;
  const updatedSource = prefix + source;

  await writeFile(filePath, updatedSource, 'utf8');
  stats.importsAdded += 1;
}

async function traverseDirectory(dirPath, insideRouteGroup = false) {
  let entries;
  try {
    entries = await readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const nextInsideRouteGroup = insideRouteGroup || isRouteGroupDir(entry.name);
      await traverseDirectory(fullPath, nextInsideRouteGroup);
    } else if (insideRouteGroup && entry.isFile() && isPageFile(entry.name)) {
      await processPage(fullPath);
    }
  }
}

const appDirs = await filterExistingDirs(candidateAppDirs);

for (const dir of appDirs) {
  await traverseDirectory(dir);
}

if (appDirs.length === 0) {
  console.warn('No app directories found to scan.');
}

console.log(`Scanned page files: ${stats.scannedPages}`);
console.log(`Noop clients created: ${stats.noopCreated}`);
console.log(`Imports added: ${stats.importsAdded}`);
