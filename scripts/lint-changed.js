#!/usr/bin/env node
// PostToolUse hook: after Claude writes or edits a JS file inside course-api/,
// lint that file and feed any problems back to Claude (exit code 2 + stderr).
const { spawnSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch {
    return;
  }
  if (!file || !file.endsWith('.js')) return;

  const normalized = path.resolve(file).split(path.sep).join('/');
  const marker = '/course-api/';
  const idx = normalized.indexOf(marker);
  if (idx === -1) return;

  const apiDir = normalized.slice(0, idx + marker.length - 1);
  const rel = normalized.slice(idx + marker.length);
  const res = spawnSync('npx', ['eslint', rel], {
    cwd: apiDir,
    encoding: 'utf8',
    shell: true,
  });
  if (res.status !== 0 && res.status !== null) {
    process.stderr.write(`ESLint found problems in ${rel}:\n${res.stdout}${res.stderr}`);
    process.exit(2);
  }
});
