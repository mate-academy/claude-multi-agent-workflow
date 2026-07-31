#!/usr/bin/env node
'use strict';

// PostToolUse hook: after Claude edits or writes a .js file, silently
// auto-fix it with the project's own local ESLint. Never blocks the
// tool call and never throws — a missing/misconfigured lint setup
// should be invisible here, not a hook failure.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

function findProjectRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'eslint.config.js'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const input = readStdin();
const filePath = input && input.tool_input && input.tool_input.file_path;

if (!filePath || !filePath.endsWith('.js') || !fs.existsSync(filePath)) {
  process.exit(0);
}

const projectRoot = findProjectRoot(path.dirname(filePath));
// Run the plain .js entrypoint via `node`, not the node_modules/.bin/eslint.cmd
// shim — on Windows, spawning a .cmd whose own path contains spaces mis-splits
// the command line even without a shell involved, which this repo's path does.
const eslintEntry = projectRoot ? path.join(projectRoot, 'node_modules', 'eslint', 'bin', 'eslint.js') : null;

if (!eslintEntry || !fs.existsSync(eslintEntry)) {
  process.exit(0);
}

try {
  execFileSync(process.execPath, [eslintEntry, '--fix', filePath], { cwd: projectRoot, stdio: 'pipe' });
  console.log(`code-quality: eslint --fix ran on ${path.relative(projectRoot, filePath)}`);
} catch (err) {
  const output = (err.stdout || '').toString() + (err.stderr || '').toString();
  console.log(`code-quality: eslint found issues it couldn't auto-fix in ${filePath}\n${output}`);
}

process.exit(0);
