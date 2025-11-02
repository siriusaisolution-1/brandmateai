import { readdir, access, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const NEXT_APP_DIR = path.resolve('.next/server/app');

function isPageJsFile(fileName) {
  return fileName.startsWith('page') && fileName.endsWith('.js');
}

async function collectPageFiles(dir) {
  const results = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return results;
    }
    throw error;
  }

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectPageFiles(entryPath);
      if (nested.length) {
        results.push(...nested);
      }
    } else if (entry.isFile() && isPageJsFile(entry.name)) {
      results.push(entryPath);
    }
  }

  return results;
}

function deriveManifestPath(pageFilePath) {
  const dirname = path.dirname(pageFilePath);
  const basename = path.basename(pageFilePath, '.js');
  return path.join(dirname, `${basename}_client-reference-manifest.js`);
}

async function ensureManifest(manifestPath) {
  try {
    await access(manifestPath, constants.F_OK);
    return false;
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }
  }

  await writeFile(manifestPath, 'export default {};\n');
  return true;
}

async function main() {
  const pageFiles = await collectPageFiles(NEXT_APP_DIR);
  if (pageFiles.length === 0) {
    console.log('patch-client-manifests: no page files found');
    return;
  }

  let createdCount = 0;
  for (const pageFile of pageFiles) {
    const manifestPath = deriveManifestPath(pageFile);
    const created = await ensureManifest(manifestPath);
    if (created) {
      createdCount += 1;
    }
  }

  console.log(`patch-client-manifests: created ${createdCount} files`);
}

main().catch((error) => {
  console.error('patch-client-manifests: failed', error);
  process.exitCode = 1;
});
