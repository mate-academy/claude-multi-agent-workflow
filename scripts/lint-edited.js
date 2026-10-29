#!/usr/bin/env node
// PostToolUse hook: after Claude writes or edits a .js file, run the project's
// own ESLint on that single file. If it reports problems, exit 2 so the lint
// output is fed back to Claude and it can fix them right away.
//
// It stays quiet (exit 0) whenever it can't lint: not a .js file, no
// eslint.config.js above the file, or ESLint not installed yet.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch {
    return process.exit(0);
  }
  if (!file || path.extname(file) !== '.js' || !fs.existsSync(file)) {
    return process.exit(0);
  }

  // Walk up from the edited file to the folder that holds the ESLint config.
  // Flat config (ESLint 9+) is preferred; legacy .eslintrc.* files are also found.
  const FLAT = ['eslint.config.js'];
  const LEGACY = ['.eslintrc.js', '.eslintrc.json'];
  const has = (d, names) => names.some((n) => fs.existsSync(path.join(d, n)));

  let dir = path.dirname(path.resolve(file));
  while (!has(dir, FLAT.concat(LEGACY))) {
    const parent = path.dirname(dir);
    if (parent === dir) return process.exit(0);
    dir = parent;
  }
  if (FLAT.concat(LEGACY).includes(path.basename(file))) return process.exit(0);

  // ESLint 9 ignores .eslintrc.* unless told to; only force legacy mode when
  // that is the only config in the folder.
  const env = has(dir, FLAT) ? process.env : { ...process.env, ESLINT_USE_FLAT_CONFIG: 'false' };

  const bin = path.join(
    dir,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'eslint.cmd' : 'eslint'
  );
  if (!fs.existsSync(bin)) return process.exit(0);

  const result = spawnSync(bin, [path.relative(dir, path.resolve(file))], {
    cwd: dir,
    env,
    encoding: 'utf8',
  });
  if (result.status === 0) return process.exit(0);

  process.stderr.write(`ESLint found problems in ${file}:\n${result.stdout || ''}${result.stderr || ''}`);
  return process.exit(2);
});
