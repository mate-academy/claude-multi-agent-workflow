#!/usr/bin/env node
// PostToolUse hook: lint a JS file right after Claude edits it.
// Reads the hook payload on stdin; exits 2 with ESLint output on stderr
// when lint fails, so Claude sees the problem and can fix it.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(raw).tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!file || !file.endsWith('.js')) process.exit(0);

  // Find the nearest directory (walking up) that has an ESLint config.
  let dir = path.dirname(path.resolve(file));
  while (!fs.existsSync(path.join(dir, 'eslint.config.js'))) {
    const parent = path.dirname(dir);
    if (parent === dir) process.exit(0);
    dir = parent;
  }

  const res = spawnSync('npx', ['eslint', file], {
    cwd: dir,
    encoding: 'utf8',
    shell: true,
  });
  if (res.status !== 0) {
    process.stderr.write(`ESLint failed for ${file}:\n${res.stdout}${res.stderr}`);
    process.exit(2);
  }
});
