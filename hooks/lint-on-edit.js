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

const rawFilePath = payload.tool_input && payload.tool_input.file_path;
if (!rawFilePath || !rawFilePath.endsWith('.js')) {
  process.exit(0);
}
const filePath = path.resolve(rawFilePath);

const eslintRoot = findEslintRoot(path.dirname(filePath));
if (!eslintRoot) {
  process.exit(0);
}

let eslintBin;
try {
  const pkgJsonPath = require.resolve('eslint/package.json', { paths: [eslintRoot] });
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const binRelative = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin && pkg.bin.eslint;
  if (!binRelative) throw new Error('eslint package has no bin entry');
  eslintBin = path.join(path.dirname(pkgJsonPath), binRelative);
} catch {
  process.exit(0);
}

const result = spawnSync(process.execPath, [eslintBin, filePath], {
  cwd: eslintRoot,
  encoding: 'utf8',
  shell: false,
});

if (result.status !== 0 && result.stdout) {
  console.log(
    `[code-quality] ESLint found issues in ${path.basename(filePath)}:\n${result.stdout}`
  );
}

process.exit(0);
