import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const runId = process.env.GITHUB_RUN_ID
  ?? process.env.GITHUB_RUN_NUMBER
  ?? process.env.CI
  ?? 'local';

const filePath = resolve('SPEC_STATUS.md');
const original = readFileSync(filePath, 'utf8');

const checks = [
  'Lint',
  'Typecheck',
  'Test (unit + e2e)',
  'Build',
];

const lines = original.split('\n');
let hasChanges = false;

const updatedLines = lines.map((line) => {
  const trimmed = line.trimStart();
  if (!trimmed.startsWith('-')) {
    return line;
  }

  for (const label of checks) {
    if (trimmed.toLowerCase().includes(label.toLowerCase())) {
      const prefixMatch = line.match(/^(\s*-\s*)(?:\[[^\]]*\]\s*)?([☐✅]\s*)?/);
      if (!prefixMatch) {
        continue;
      }
      const prefix = prefixMatch[1];
      const suffix = line.slice(prefix.length).replace(/^[\[\]xX☐✅\s-]+/, '');
      const nextLine = `${prefix}✅ ${suffix.startsWith('✅') ? suffix.slice(2).trimStart() : suffix}`.trimEnd();
      if (nextLine !== line.trimEnd()) {
        hasChanges = true;
        return `${nextLine}`;
      }
      return line;
    }
  }

  return line;
});

let updatedContent = updatedLines.join('\n');

const runLineRegex = /(Last successful CI run:\s*)(.*)/;
if (runLineRegex.test(updatedContent)) {
  updatedContent = updatedContent.replace(runLineRegex, (full, prefix, existing) => {
    const newLine = `${prefix}${runId}`;
    if (`${prefix}${existing}` !== newLine) {
      hasChanges = true;
    }
    return newLine;
  });
} else {
  updatedContent += `\nLast successful CI run: ${runId}`;
  hasChanges = true;
}

if (hasChanges) {
  writeFileSync(filePath, `${updatedContent}\n`);
  console.log(`Updated SPEC_STATUS.md for CI run ${runId}`);
} else {
  console.log('SPEC_STATUS.md already up to date.');
}
