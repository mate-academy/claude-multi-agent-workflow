#!/usr/bin/env node
// PostToolUse hook: lint a JS file inside course-api/ right after it is edited.
// Exit 2 with ESLint output on stderr so Claude sees the problem and fixes it.
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

  const marker = '/course-api/';
  const idx = file.indexOf(marker);
  if (idx === -1 || file.includes('/node_modules/')) process.exit(0);

  const apiDir = file.slice(0, idx + marker.length - 1);
  const result = spawnSync('npx', ['eslint', file], { cwd: apiDir, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(`ESLint failed for ${file}:\n${result.stdout}${result.stderr}`);
    process.exit(2);
  }
});
