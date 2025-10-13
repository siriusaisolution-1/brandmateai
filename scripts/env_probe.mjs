#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function runCommand(command, args = []) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    shell: false
  });

  if (result.error) {
    return { ok: false, output: result.error.message.trim() };
  }

  const output = `${result.stdout}${result.stderr}`.trim();
  return {
    ok: result.status === 0,
    output
  };
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch (error) {
    return false;
  }
}

async function resetCaches() {
  const cacheTargets = [
    '.next/cache',
    '.next/server/app',
    '.turbo',
    'node_modules/.cache'
  ];

  const results = [];

  for (const target of cacheTargets) {
    const absoluteTarget = path.join(ROOT_DIR, target);
    const existed = await pathExists(absoluteTarget);
    if (!existed) {
      results.push({ target, status: 'skipped', message: 'missing' });
      continue;
    }

    try {
      await fs.rm(absoluteTarget, { recursive: true, force: true });
      results.push({ target, status: 'removed' });
    } catch (error) {
      results.push({ target, status: 'error', message: error.message });
    }
  }

  return results;
}

function redactValue(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return '';
  }

  if (value.length <= 8) {
    return value;
  }

  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function collectFirebaseEnv() {
  const firebaseEnvKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    'FIREBASE_PROJECT_ID',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'FIREBASE_AUTH_EMULATOR_HOST',
    'FIRESTORE_EMULATOR_HOST'
  ];

  return firebaseEnvKeys.map((key) => {
    const rawValue = process.env[key];
    return {
      key,
      present: typeof rawValue === 'string' && rawValue.length > 0,
      value: redactValue(rawValue)
    };
  });
}

function collectShellEnv() {
  const keys = ['SHELL', 'TERM', 'COLORTERM', 'HOME'];

  return keys.map((key) => ({
    key,
    value: process.env[key] ?? null
  }));
}

function collectNodeEnv() {
  const keys = [
    'NODE_ENV',
    'NVM_BIN',
    'NVM_DIR',
    'NPM_CONFIG_PREFIX',
    'PATH'
  ];

  return keys.map((key) => ({
    key,
    value: process.env[key] ?? null
  }));
}

function getBranchName() {
  const { ok, output } = runCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!ok) {
    return null;
  }
  return output.trim();
}

async function getFirebaseProjectId() {
  const firebasercPath = path.join(ROOT_DIR, '.firebaserc');
  if (!(await pathExists(firebasercPath))) {
    return null;
  }

  try {
    const raw = await fs.readFile(firebasercPath, 'utf8');
    const parsed = JSON.parse(raw);
    const projectId = parsed?.projects?.default;
    return typeof projectId === 'string' ? projectId : null;
  } catch (error) {
    return null;
  }
}

function sanitizeChannelName(branchName) {
  if (!branchName) {
    return null;
  }

  return `preview-${branchName}`
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .toLowerCase();
}

function computePreviewUrl(channelName, projectId) {
  if (!channelName || !projectId) {
    return null;
  }

  return `https://${channelName}--${projectId}.web.app`;
}

function createReport({
  cacheResults,
  firebaseEnv,
  shellEnv,
  nodeEnv,
  versions,
  system,
  preview
}) {
  return {
    generatedAt: new Date().toISOString(),
    system,
    versions,
    cacheReset: cacheResults,
    firebaseEnv,
    shellEnv,
    nodeEnv,
    preview
  };
}

function formatCacheResult(entry) {
  const emoji =
    entry.status === 'removed'
      ? '✅'
      : entry.status === 'skipped'
      ? '⚠️'
      : '❌';
  const detail = entry.message ? ` (${entry.message})` : '';
  return `${emoji} ${entry.target}${detail}`;
}

function formatFirebaseEnv(entry) {
  const emoji = entry.present ? '✅' : '❌';
  const value = entry.present ? ` – ${entry.value}` : ' – missing';
  return `${emoji} ${entry.key}${value}`;
}

function formatKeyValue(entry) {
  const value = entry.value ?? '∅';
  return `- ${entry.key}: ${value}`;
}

function formatReport(report) {
  const lines = [];
  lines.push(`# Env Probe Report`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');

  lines.push('## System');
  lines.push(`- Platform: ${report.system.platform} (${report.system.release})`);
  lines.push(`- Arch: ${report.system.arch}`);
  lines.push(`- CPUs: ${report.system.cpuCount}`);
  lines.push(`- Total Memory: ${report.system.totalMem}`);
  lines.push('');

  lines.push('## Versions');
  lines.push(`- Node: ${report.versions.node}`);
  lines.push(`- pnpm: ${report.versions.pnpm}`);
  lines.push(`- npm: ${report.versions.npm}`);
  lines.push('');

  lines.push('## Cache Reset');
  for (const entry of report.cacheReset) {
    lines.push(formatCacheResult(entry));
  }
  lines.push('');

  lines.push('## Firebase Environment Variables');
  for (const entry of report.firebaseEnv) {
    lines.push(formatFirebaseEnv(entry));
  }
  lines.push('');

  lines.push('## Shell Environment');
  for (const entry of report.shellEnv) {
    lines.push(formatKeyValue(entry));
  }
  lines.push('');

  lines.push('## Node Environment');
  for (const entry of report.nodeEnv) {
    lines.push(formatKeyValue(entry));
  }
  lines.push('');

  lines.push('## Brandmate Preview');
  if (report.preview.url) {
    lines.push(`- Channel: ${report.preview.channel}`);
    lines.push(`- URL: ${report.preview.url}`);
  } else {
    lines.push('- Preview URL unavailable (missing branch or project id).');
  }

  return lines.join('\n');
}

async function main() {
  const cacheResults = await resetCaches();

  const firebaseEnv = collectFirebaseEnv();
  const shellEnv = collectShellEnv();
  const nodeEnv = collectNodeEnv();

  const versions = {
    node: process.version,
    pnpm: runCommand('pnpm', ['-v']).output || 'unknown',
    npm: runCommand('npm', ['-v']).output || 'unknown'
  };

  const system = {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpuCount: os.cpus().length,
    totalMem: `${Math.round(os.totalmem() / 1024 / 1024)} MB`
  };

  const branchName = getBranchName();
  const channel = sanitizeChannelName(branchName);
  const projectId = await getFirebaseProjectId();
  const previewUrl = computePreviewUrl(channel, projectId);

  const report = createReport({
    cacheResults,
    firebaseEnv,
    shellEnv,
    nodeEnv,
    versions,
    system,
    preview: {
      branch: branchName,
      channel,
      projectId,
      url: previewUrl
    }
  });

  const asJson = process.argv.includes('--json');

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReport(report));
  }
}

main().catch((error) => {
  console.error('Env probe failed:', error);
  process.exitCode = 1;
});
