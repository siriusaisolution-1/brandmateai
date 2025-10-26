#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);

function run(command, extraArgs = []) {
  const result = spawnSync('pnpm', [command, ...extraArgs], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }
}

const unitArgs = args.filter(arg => arg !== '--coverage');
run('test:unit', unitArgs);

const e2eArgs = unitArgs;
run('test:e2e', e2eArgs);
