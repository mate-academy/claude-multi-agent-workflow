#!/usr/bin/env node
// PostToolUse hook: lint the file Claude just edited with the project's own ESLint.
//
// Exit 0 → nothing to report (clean, not a JS file, or no ESLint in the project).
// Exit 2 → lint errors; stderr is fed back to Claude so it fixes them right away.
//
// Never blocks on problems with its own setup (missing ESLint, bad config, bad
// input): a quality gate that fails closed on infrastructure just gets disabled.

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const JS_EXTENSIONS = new Set(['.js', '.cjs', '.mjs', '.jsx']);

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

// Walk up from the edited file to the nearest directory with a local ESLint binary.
function findEslint(startDir) {
  const bin = process.platform === 'win32' ? 'eslint.cmd' : 'eslint';
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, 'node_modules', '.bin', bin);
    if (fs.existsSync(candidate)) return { root: dir, eslint: candidate };
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const input = readInput();
const filePath = input?.tool_input?.file_path;

if (
  !filePath ||
  !JS_EXTENSIONS.has(path.extname(filePath)) ||
  filePath.split(path.sep).includes('node_modules') ||
  !fs.existsSync(filePath)
) {
  process.exit(0);
}

const found = findEslint(path.dirname(filePath));
if (!found) process.exit(0);

// --quiet: report errors only; warnings are left for the lint-fixer agent.
const result = spawnSync(
  found.eslint,
  ['--quiet', '--no-warn-ignored', '--format', 'stylish', filePath],
  { cwd: found.root, encoding: 'utf8', shell: process.platform === 'win32' },
);

// ESLint exit codes: 0 clean, 1 lint errors, 2 config/runtime failure.
if (result.status === 1) {
  const relative = path.relative(found.root, filePath);
  process.stderr.write(
    `ESLint found errors in ${relative} after your edit. Fix them before moving on:\n` +
      result.stdout.trim() +
      '\n',
  );
  process.exit(2);
}

process.exit(0);
