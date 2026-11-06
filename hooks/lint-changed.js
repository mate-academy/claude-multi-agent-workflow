#!/usr/bin/env node
// PostToolUse hook: after Claude edits a .js file, lint it with the project's own ESLint.
// Exits 2 with the lint output on stderr when there are errors or warnings, so Claude sees and fixes them.
// Exits 0 silently when the file isn't JavaScript, isn't in an ESLint project, or ESLint isn't installed.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch (e) {
    process.exit(0);
  }
  if (!file || !file.endsWith('.js')) process.exit(0);

  // Walk up from the edited file to the nearest folder with an ESLint config.
  let dir = path.dirname(file);
  while (!fs.existsSync(path.join(dir, 'eslint.config.js'))) {
    const parent = path.dirname(dir);
    if (parent === dir) process.exit(0);
    dir = parent;
  }

  const eslint = path.join(dir, 'node_modules', '.bin', 'eslint');
  if (!fs.existsSync(eslint)) process.exit(0);

  const result = spawnSync(eslint, ['--max-warnings', '0', file], { cwd: dir, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write('ESLint found problems in ' + file + ':\n' + result.stdout + result.stderr);
    process.exit(2);
  }
  process.exit(0);
});
