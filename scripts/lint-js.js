#!/usr/bin/env node
// PostToolUse hook bundled with the api-quality-kit plugin.
// After Claude writes or edits a JavaScript file, lint that one file with the
// ESLint that belongs to the file's own project (the nearest folder that has
// node_modules/eslint and an eslint config).
//
// Claude Code passes the tool call as JSON on stdin. Exit codes:
//   0 - nothing to do (not a JS file, no ESLint installed there) or the file is clean
//   2 - ESLint found errors; the report goes to stderr so Claude sees it and can fix them

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

const input = readInput();
const filePath = input.tool_input && input.tool_input.file_path;

// Only JavaScript files that exist, and never dependencies.
if (!filePath || path.extname(filePath) !== '.js' || !fs.existsSync(filePath)) {
  process.exit(0);
}
const absolute = path.resolve(filePath);
if (absolute.split(path.sep).includes('node_modules')) {
  process.exit(0);
}

// Walk up from the file to the nearest folder that has ESLint installed and a config.
const configNames = ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs'];
let projectDir = null;
for (let dir = path.dirname(absolute); ; dir = path.dirname(dir)) {
  const hasEslint = fs.existsSync(path.join(dir, 'node_modules', 'eslint', 'bin', 'eslint.js'));
  const hasConfig = configNames.some((name) => fs.existsSync(path.join(dir, name)));
  if (hasEslint && hasConfig) {
    projectDir = dir;
    break;
  }
  if (dir === path.dirname(dir)) break;
}
if (!projectDir) {
  process.exit(0);
}

const relative = path.relative(projectDir, absolute);
const result = spawnSync(
  process.execPath,
  [path.join(projectDir, 'node_modules', 'eslint', 'bin', 'eslint.js'), relative],
  { cwd: projectDir, encoding: 'utf8' }
);

if (result.status === 0) {
  process.exit(0);
}

console.error(`ESLint found problems in ${relative}. Fix them:\n\n${result.stdout}${result.stderr}`);
process.exit(2);
