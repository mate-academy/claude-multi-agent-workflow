#!/usr/bin/env node
// quality-gate PostToolUse hook. After Claude edits or writes a .js/.cjs/.mjs
// file, find the nearest package that has ESLint installed and run
// `eslint --fix` on just that file. Leftover problems are sent back to Claude
// (exit 2 + stderr) so it fixes them right away. If there's no ESLint, the
// file isn't JS, or it's in node_modules, the hook does nothing.

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function findEslintRoot(startDir) {
  let dir = startDir;
  for (;;) {
    if (fs.existsSync(path.join(dir, 'node_modules', '.bin', 'eslint'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const filePath = input && input.tool_input && input.tool_input.file_path;
  if (!filePath || !/\.(c|m)?js$/.test(filePath)) process.exit(0);

  const absolute = path.resolve(input.cwd || process.cwd(), filePath);
  if (absolute.split(path.sep).includes('node_modules') || !fs.existsSync(absolute)) process.exit(0);

  const root = findEslintRoot(path.dirname(absolute));
  if (!root) process.exit(0);

  const relative = path.relative(root, absolute);
  const result = spawnSync(
    path.join(root, 'node_modules', '.bin', 'eslint'),
    ['--fix', '--no-warn-ignored', relative],
    { cwd: root, encoding: 'utf8' },
  );

  if (result.error) process.exit(0);
  if (result.status === 1) {
    process.stderr.write(
      `quality-gate: ESLint found problems in ${relative} that --fix could not resolve:\n${result.stdout}`,
    );
    process.exit(2);
  }
  // status 2 = ESLint itself failed (e.g. no config); never block the edit on that.
  process.exit(0);
});
