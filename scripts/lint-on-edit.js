#!/usr/bin/env node
// PostToolUse hook: after Claude writes or edits a .js file, run the nearest
// project's ESLint on it. Lint errors go back to Claude (exit code 2) so it can
// fix them; anything else (no ESLint installed, not a .js file) is a silent no-op.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !/\.(c|m)?js$/.test(filePath) || !fs.existsSync(filePath)) process.exit(0);

  // Walk up to the closest folder that has ESLint installed.
  let dir = path.dirname(path.resolve(filePath));
  let projectDir = null;
  for (;;) {
    if (fs.existsSync(path.join(dir, 'node_modules', 'eslint', 'package.json'))) {
      projectDir = dir;
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (!projectDir) process.exit(0);

  const eslintBin = path.join(projectDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
  const result = spawnSync(process.execPath, [eslintBin, '--no-warn-ignored', path.resolve(filePath)], {
    cwd: projectDir,
    encoding: 'utf8',
  });

  if (result.status === 1) {
    process.stderr.write(`ESLint found problems in ${filePath}:\n${result.stdout}${result.stderr}`);
    process.exit(2);
  }
  process.exit(0);
});
