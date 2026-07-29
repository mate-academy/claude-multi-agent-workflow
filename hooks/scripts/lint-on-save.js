#!/usr/bin/env node
// PostToolUse hook: after Claude edits or writes a .js file, lint just that
// file with the nearest ESLint config so quality feedback shows up immediately
// instead of at the next manual `npm run lint`. Always exits 0 — informational
// only, never blocks the tool call that triggered it.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  let event;
  try {
    event = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = event && event.tool_input && event.tool_input.file_path;
  if (!filePath || !filePath.endsWith('.js')) {
    process.exit(0);
  }

  let dir = path.dirname(path.resolve(filePath));
  let configDir = null;
  while (true) {
    if (
      fs.existsSync(path.join(dir, 'eslint.config.js')) ||
      fs.existsSync(path.join(dir, '.eslintrc.json'))
    ) {
      configDir = dir;
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (!configDir) {
    process.exit(0);
  }

  try {
    execFileSync('npx', ['eslint', filePath], { cwd: configDir, encoding: 'utf8' });
    console.log(`code-quality-kit: lint clean — ${filePath}`);
  } catch (err) {
    console.log(`code-quality-kit: lint issues in ${filePath}\n${err.stdout || err.message}`);
  }
  process.exit(0);
});
