#!/usr/bin/env node
// PostToolUse hook: run the nearest project's ESLint on a .js file Claude just wrote or edited.
// Lint errors are fed back to Claude (exit 2) so it can fix them; anything else exits 0 quietly.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let filePath;
  try {
    const data = JSON.parse(input);
    filePath = data.tool_input && data.tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !/\.(c|m)?js$/.test(filePath) || !fs.existsSync(filePath)) process.exit(0);

  // Walk up to the nearest folder that has ESLint installed.
  let dir = path.dirname(path.resolve(filePath));
  let eslintBin = null;
  while (true) {
    const candidate = path.join(dir, 'node_modules', 'eslint', 'bin', 'eslint.js');
    if (fs.existsSync(candidate)) { eslintBin = candidate; break; }
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
    process.stderr.write('ESLint found problems in ' + filePath + ':\n' + result.stdout);
    process.exit(2);
  }
  process.exit(0);
});
