#!/usr/bin/env node
// PostToolUse hook: after an Edit/Write/MultiEdit touches a .js file, run that
// project's own local ESLint (if it has one) with --fix, so formatting and
// auto-fixable rule violations never survive a Claude-made edit.

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

function findEslintProject(startDir) {
  const binName = process.platform === 'win32' ? 'eslint.cmd' : 'eslint';
  let dir = startDir;
  for (;;) {
    const bin = path.join(dir, 'node_modules', '.bin', binName);
    if (fs.existsSync(bin)) return { bin, root: dir };
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
if (!filePath || !/\.(js|jsx|mjs|cjs)$/.test(filePath) || filePath.includes('node_modules')) {
  process.exit(0);
}
if (!fs.existsSync(filePath)) {
  process.exit(0);
}

const project = findEslintProject(path.dirname(filePath));
if (!project) {
  // No local ESLint near this file — nothing to run, and never install one on the fly.
  process.exit(0);
}

const result = spawnSync(path.resolve(project.bin), ['--fix', path.resolve(filePath)], {
  encoding: 'utf8',
  cwd: project.root,
  // On Windows, node_modules/.bin binaries are .cmd shims — spawning them
  // without a shell fails with EINVAL.
  shell: process.platform === 'win32',
});

// --fix already rewrote whatever it could. If errors remain, surface them to
// Claude via stderr + exit 2 so it can address what auto-fix couldn't.
if (result.status !== 0) {
  process.stderr.write(result.stdout || result.stderr || 'eslint reported errors\n');
  process.exit(2);
}

process.exit(0);
