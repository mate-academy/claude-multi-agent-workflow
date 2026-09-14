#!/usr/bin/env node
// PostToolUse hook: after Edit/Write, lint the touched file if it sits in a
// project that has ESLint configured, and surface any problems immediately.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function findProjectRoot(filePath) {
  let dir = path.dirname(path.resolve(filePath));
  while (true) {
    if (
      fs.existsSync(path.join(dir, 'eslint.config.js')) ||
      fs.existsSync(path.join(dir, '.eslintrc.json')) ||
      fs.existsSync(path.join(dir, '.eslintrc.js'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let input;
try {
  input = JSON.parse(readStdin() || '{}');
} catch {
  process.exit(0);
}

const rawFilePath = input?.tool_input?.file_path;
if (!rawFilePath || !rawFilePath.endsWith('.js')) process.exit(0);
const filePath = path.resolve(rawFilePath);

const projectRoot = findProjectRoot(filePath);
if (!projectRoot) process.exit(0);

let output = '';
try {
  output = execFileSync('npx', ['eslint', filePath], { cwd: projectRoot, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
} catch (err) {
  output = (err.stdout || '').toString();
}
output = output.trim();
if (output) console.log(`[api-conventions lint]\n${output}`);

process.exit(0);
