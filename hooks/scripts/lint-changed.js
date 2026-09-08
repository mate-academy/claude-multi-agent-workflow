#!/usr/bin/env node
// PostToolUse hook: lint the single JavaScript file Claude just wrote or edited.
//
// Reads the hook payload from stdin, finds the nearest package.json above the
// edited file, and runs that project's ESLint on that one file. Exits 2 with the
// lint output on stderr so Claude sees the problems and can fix them in the same
// turn; exits 0 and stays silent for anything it should not or cannot lint.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SKIP = 0; // nothing to say
const REPORT = 2; // feed stderr back to Claude

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function editedFile(raw) {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }
  const input = payload.tool_input || {};
  return input.file_path || input.notebook_path || null;
}

function nearestPackage(file) {
  let dir = path.dirname(path.resolve(file));
  for (;;) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function main() {
  const file = editedFile(readStdin());
  if (!file) return SKIP;
  if (!/\.(js|mjs|cjs)$/.test(file)) return SKIP;
  if (!fs.existsSync(file)) return SKIP;
  if (file.split(path.sep).includes('node_modules')) return SKIP;

  const root = nearestPackage(file);
  if (!root) return SKIP;

  // No installed ESLint means no lint step for this project — say nothing rather
  // than nagging about a missing dependency.
  const bin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'eslint.cmd' : 'eslint');
  if (!fs.existsSync(bin)) return SKIP;

  const result = spawnSync(bin, [path.resolve(file)], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (result.error) return SKIP;
  if (result.status === 0) return SKIP;

  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  process.stderr.write(
    'ESLint found problems in ' + path.relative(root, path.resolve(file)) + ':\n\n' +
      output + '\n\nFix these before moving on.\n'
  );
  return REPORT;
}

process.exit(main());
