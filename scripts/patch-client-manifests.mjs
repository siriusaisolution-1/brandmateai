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

function normalizeImportPath(from, to) {
  const relativePath = path.relative(path.dirname(from), to);
  let normalized = relativePath.split(path.sep).join('/');
  if (!normalized.startsWith('.')) {
    normalized = `./${normalized}`;
  }
  return normalized;
}

function buildFallbackContent(pageFilePath, manifestPath) {
  const marketingPageSuffix = `${path.sep}(marketing)${path.sep}page.js`;
  if (pageFilePath.endsWith(marketingPageSuffix)) {
    const rootManifestPath = path.join(NEXT_APP_DIR, 'page_client-reference-manifest.js');
    const importPath = normalizeImportPath(manifestPath, rootManifestPath);
    return [
      `import manifest from "${importPath}";`,
      "const globalManifest = (globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {});",
      "globalManifest['/(marketing)/page'] = globalManifest['/(marketing)/page'] || manifest;",
      "export default globalManifest['/(marketing)/page'];",
      '',
    ].join('\n');
  }

  return 'export default {};\n';
}

async function ensureManifest(manifestPath, pageFilePath) {
  try {
    await access(manifestPath, constants.F_OK);
    return false;
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }
  }

  const fallbackContent = buildFallbackContent(pageFilePath, manifestPath);
  await writeFile(manifestPath, fallbackContent);
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
    const created = await ensureManifest(manifestPath, pageFile);
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
