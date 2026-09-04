#!/usr/bin/env node
'use strict';

// PostToolUse hook: after an Edit/Write touches a .js file inside course-api,
// auto-fix what ESLint can and report anything it couldn't back to Claude.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function findProjectRoot(startFile) {
  let dir = path.dirname(path.resolve(startFile));
  while (true) {
    if (fs.existsSync(path.join(dir, 'eslint.config.js'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let input;
try {
  input = JSON.parse(readStdin() || '{}');
} catch {
  process.exit(0);
}

const filePath = input.tool_input && input.tool_input.file_path;
if (!filePath || !filePath.endsWith('.js') || !fs.existsSync(filePath)) {
  process.exit(0);
}

const root = findProjectRoot(filePath);
if (!root) process.exit(0);

// Resolve the eslint CLI entry point directly (via its package.json "bin")
// and run it with node, rather than the .bin/ shell wrapper — the wrapper
// is a .cmd file on Windows, which execFileSync can't spawn without a shell.
let eslintCli;
try {
  const pkgPath = require.resolve('eslint/package.json', { paths: [root] });
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin && pkg.bin.eslint;
  if (!bin) process.exit(0);
  eslintCli = path.join(path.dirname(pkgPath), bin);
} catch {
  process.exit(0);
}
if (!fs.existsSync(eslintCli)) process.exit(0);

const relativeFile = path.relative(root, filePath);

try {
  execFileSync(process.execPath, [eslintCli, '--fix', relativeFile], { cwd: root, stdio: 'pipe' });
  process.exit(0);
} catch (err) {
  const output = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '');
  console.error(
    `code-quality: eslint found issues in ${relativeFile} (auto-fixed what it could):\n${output}`
  );
  process.exit(2);
}
