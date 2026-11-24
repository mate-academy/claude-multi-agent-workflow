#!/usr/bin/env node
// PostToolUse hook: lint a JavaScript file right after Claude writes or edits it.
// Uses the ESLint installed in the file's own project, so it follows that project's
// config. Exits 2 on lint errors so Claude sees them and fixes them; exits 0 otherwise.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const JS_FILE = /\.(c|m)?jsx?$/;

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

// Walk up from the file to the nearest folder with ESLint installed.
function findProjectRoot(file) {
  let dir = path.dirname(file);
  while (true) {
    if (fs.existsSync(path.join(dir, 'node_modules', '.bin', 'eslint'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const input = readInput();
const file = input.tool_input && input.tool_input.file_path;
if (!file || !JS_FILE.test(file) || !fs.existsSync(file)) process.exit(0);

const root = findProjectRoot(path.resolve(file));
if (!root) process.exit(0); // No ESLint in this project — nothing to do.

const result = spawnSync(path.join(root, 'node_modules', '.bin', 'eslint'), [file], {
  cwd: root,
  encoding: 'utf8',
});

if (result.status === 1) {
  // Lint errors (warnings alone exit 0). Feed them back to Claude.
  process.stderr.write(`ESLint found problems in ${path.relative(root, file)}:\n${result.stdout}`);
  process.exit(2);
}
process.exit(0);
