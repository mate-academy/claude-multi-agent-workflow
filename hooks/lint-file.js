#!/usr/bin/env node
// Runs ESLint on a file just edited by Claude Code and prints any issues.
const { execFileSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const file = payload?.tool_input?.file_path;
  if (!file || !file.endsWith('.js')) process.exit(0);

  try {
    const output = execFileSync('npx', ['eslint', file], {
      cwd: path.dirname(file),
      encoding: 'utf8',
      shell: process.platform === 'win32',
    });
    if (output.trim()) console.log(output);
  } catch (err) {
    if (err.stdout) console.log(err.stdout);
  }
  process.exit(0);
});
