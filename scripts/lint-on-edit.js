#!/usr/bin/env node
// qa-kit PostToolUse hook: after Claude edits a .js/.cjs/.mjs file, run the
// project's own ESLint on that file. Lint errors are fed back to Claude
// (exit code 2 + stderr) so it can fix them. Anything else exits 0 silently,
// so the hook never blocks work in projects without ESLint.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const rawPath = input && input.tool_input && input.tool_input.file_path;
  if (!rawPath || !/\.(c|m)?js$/.test(rawPath)) process.exit(0);
  const filePath = path.resolve(input.cwd || process.cwd(), rawPath);
  if (!fs.existsSync(filePath)) process.exit(0);
  if (filePath.split(/[\\/]/).includes('node_modules')) process.exit(0);

  // Walk up from the file to the nearest folder that has ESLint installed.
  let dir = path.dirname(filePath);
  let eslintBin = null;
  while (true) {
    const candidate = path.join(dir, 'node_modules', 'eslint', 'bin', 'eslint.js');
    if (fs.existsSync(candidate)) {
      eslintBin = candidate;
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (!eslintBin) process.exit(0);

  const result = spawnSync(process.execPath, [eslintBin, '--no-warn-ignored', filePath], {
    cwd: dir,
    encoding: 'utf8',
  });

  if (result.status === 1) {
    process.stderr.write(
      `qa-kit lint-on-edit: ESLint found errors in ${filePath}. Fix them:\n${result.stdout}${result.stderr}`
    );
    process.exit(2);
  }
  process.exit(0);
});
