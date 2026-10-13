// PostToolUse hook: lint a JS file Claude just wrote or edited inside an API
// project that has ESLint installed. Exit 2 feeds the lint output back to Claude.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch {
    return;
  }
  if (!file || !file.endsWith('.js')) return;

  // Walk up to the nearest directory that has an ESLint config.
  let dir = path.dirname(path.resolve(file));
  while (!fs.existsSync(path.join(dir, 'eslint.config.js'))) {
    const parent = path.dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
  if (!fs.existsSync(path.join(dir, 'node_modules'))) return;

  const r = spawnSync('npx', ['--no-install', 'eslint', path.resolve(file)], {
    cwd: dir,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) {
    console.error('ESLint failed for ' + file + ':\n' + (r.stdout || '') + (r.stderr || ''));
    process.exit(2);
  }
});
