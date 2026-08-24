#!/usr/bin/env node
// PostToolUse hook for the api-quality plugin.
//
// After Claude writes or edits a JavaScript file, lint just that file with the
// project's own ESLint and feed any errors straight back, so a mistake is
// caught in the same turn it was made instead of at the next `npm run lint`.
//
// Silent and exit 0 whenever it cannot help: a non-JS file, no ESLint config
// above the file, or ESLint not installed. A quality hook that blocks unrelated
// work is worse than no hook.

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

function findUp(startDir, filename) {
  let dir = startDir;
  for (;;) {
    const candidate = path.join(dir, filename);
    if (fs.existsSync(candidate)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let payload;
try {
  payload = JSON.parse(readStdin() || '{}');
} catch {
  process.exit(0);
}

const filePath = payload?.tool_input?.file_path;
if (!filePath || !/\.(js|mjs|cjs)$/.test(filePath)) process.exit(0);
if (!fs.existsSync(filePath)) process.exit(0);

// The project ESLint governs this file, if there is one.
const projectRoot = findUp(path.dirname(path.resolve(filePath)), 'eslint.config.js');
if (!projectRoot) process.exit(0);

const eslintBin = path.join(projectRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!fs.existsSync(eslintBin)) process.exit(0);

const result = spawnSync(
  process.execPath,
  [eslintBin, '--format', 'stylish', path.resolve(filePath)],
  { cwd: projectRoot, encoding: 'utf8' }
);

// spawn failed, or ESLint itself crashed (2) — not the edit's fault.
if (result.error || result.status === null || result.status > 1) process.exit(0);
if (result.status === 0) process.exit(0);

const report = `${result.stdout || ''}${result.stderr || ''}`.trim();
const relative = path.relative(projectRoot, path.resolve(filePath)).split(path.sep).join('/');

// Exit code 2 sends stderr back to Claude as feedback on the edit it just made.
process.stderr.write(
  `[api-quality] ESLint found problems in ${relative} — fix them before moving on:\n\n${report}\n`
);
process.exit(2);
