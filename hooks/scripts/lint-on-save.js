#!/usr/bin/env node
'use strict';

// PostToolUse hook (Edit|Write): lints whatever .js file was just touched
// with the project's own local ESLint, so quality feedback is immediate
// instead of waiting for the test-writer or a manual `npm run lint`.

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

function findProjectRoot(startDir) {
  let dir = startDir;
  while (true) {
    if (fs.existsSync(path.join(dir, 'eslint.config.js'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let payload = {};
try {
  payload = JSON.parse(readStdin() || '{}');
} catch {
  payload = {};
}

const filePath = payload?.tool_input?.file_path;
if (!filePath || !filePath.endsWith('.js') || !fs.existsSync(filePath)) {
  process.exit(0);
}

const projectRoot = findProjectRoot(path.dirname(filePath));
if (!projectRoot) {
  process.exit(0);
}

// Invoke ESLint's JS entry point through `node` rather than the
// node_modules/.bin shim — the shim is a shell script / .cmd wrapper on
// some platforms, and execFileSync can't run those without a shell.
const eslintJs = path.join(projectRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!fs.existsSync(eslintJs)) {
  process.exit(0);
}

try {
  const output = execFileSync(process.execPath, [eslintJs, filePath], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  if (output.trim()) {
    console.log(`[lint-on-save] ${filePath}\n${output}`);
  }
} catch (err) {
  if (err.stdout) console.log(`[lint-on-save] ${filePath}\n${err.stdout}`);
}

process.exit(0);
