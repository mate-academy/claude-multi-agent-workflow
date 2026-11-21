#!/usr/bin/env node
// PostToolUse hook: lint a JavaScript file in course-api/ right after Claude edits it.
// Reads the hook payload from stdin. Reports only; never modifies files.
// Exit 2 with ESLint output on stderr so Claude sees the problems. Exit 0 otherwise.

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function main() {
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return 0;
  }

  const file = payload && payload.tool_input && payload.tool_input.file_path;
  if (typeof file !== 'string' || !file.endsWith('.js')) return 0;

  const parts = path.resolve(file).split(path.sep);
  const apiIndex = parts.lastIndexOf('course-api');
  if (apiIndex === -1 || parts.includes('node_modules')) return 0;

  const apiDir = parts.slice(0, apiIndex + 1).join(path.sep);
  const eslintBin = path.join(apiDir, 'node_modules', '.bin', 'eslint');
  if (!fs.existsSync(eslintBin) || !fs.existsSync(file)) return 0;

  const result = spawnSync(eslintBin, ['--max-warnings', '0', file], { cwd: apiDir, encoding: 'utf8' });
  if (result.error || result.status === null) return 0;

  if (result.status !== 0) {
    process.stderr.write(`ESLint found problems in ${file}:\n${result.stdout}${result.stderr}`);
    return 2;
  }
  return 0;
}

try {
  process.exit(main());
} catch {
  process.exit(0);
}
