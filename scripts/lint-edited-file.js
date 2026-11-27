#!/usr/bin/env node
// PostToolUse hook for the quality-gate plugin: after Claude writes or edits a
// .js file, run the project's own ESLint with --fix on that file. Problems it
// can't fix are printed to stderr and the hook exits 2, so Claude sees them.
// Projects without ESLint installed are skipped silently.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findEslint(start) {
  let dir = path.dirname(start);
  while (true) {
    const bin = path.join(dir, 'node_modules', '.bin', 'eslint');
    if (fs.existsSync(bin)) return { bin, dir };
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !filePath.endsWith('.js') || !fs.existsSync(filePath)) process.exit(0);

  const eslint = findEslint(path.resolve(filePath));
  if (!eslint) process.exit(0);

  try {
    execFileSync(eslint.bin, ['--fix', filePath], {
      cwd: eslint.dir,
      stdio: 'pipe',
      encoding: 'utf8',
    });
  } catch (err) {
    const details = [err.stdout, err.stderr].filter(Boolean).join('\n').trim();
    process.stderr.write(`ESLint found problems in ${filePath}:\n${details || err.message}\n`);
    process.exit(2);
  }
});
