#!/usr/bin/env node
// PostToolUse hook: lint the JS file Claude just wrote or edited.
// Finds the nearest package.json with ESLint installed and runs it on that one file.
// Exit 2 sends the lint errors back to Claude so it can fix them; anything else stays silent.
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

  const filePath = input?.tool_input?.file_path;
  if (!filePath || !/\.(c|m)?js$/.test(filePath) || !fs.existsSync(filePath)) process.exit(0);

  // Walk up to the nearest project that has ESLint installed.
  let dir = path.dirname(path.resolve(filePath));
  let projectDir = null;
  while (true) {
    if (fs.existsSync(path.join(dir, 'node_modules', 'eslint', 'package.json'))) {
      projectDir = dir;
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (!projectDir) process.exit(0); // No ESLint here — nothing to do.

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
