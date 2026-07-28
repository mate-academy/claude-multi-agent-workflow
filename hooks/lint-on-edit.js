#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function findEslintRoot(startDir) {
  let dir = startDir;
  for (;;) {
    if (
      fs.existsSync(path.join(dir, 'eslint.config.js')) ||
      fs.existsSync(path.join(dir, '.eslintrc.json')) ||
      fs.existsSync(path.join(dir, '.eslintrc.js'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let payload;
try {
  payload = JSON.parse(readStdin());
} catch {
  process.exit(0);
}

const filePath = payload.tool_input && payload.tool_input.file_path;
if (!filePath || !filePath.endsWith('.js')) {
  process.exit(0);
}

const eslintRoot = findEslintRoot(path.dirname(filePath));
if (!eslintRoot) {
  process.exit(0);
}

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(npxCmd, ['--no-install', 'eslint', filePath], {
  cwd: eslintRoot,
  encoding: 'utf8',
});

if (result.status !== 0 && result.stdout) {
  console.log(
    `[code-quality] ESLint found issues in ${path.basename(filePath)}:\n${result.stdout}`
  );
}

process.exit(0);
