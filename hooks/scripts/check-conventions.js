#!/usr/bin/env node
'use strict';

// Runs after every Edit/Write. Best-effort and non-blocking: if anything
// here is uncertain (no eslint config, unreadable input) it just exits
// quietly rather than getting in the way of the edit.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let payload;
try {
  payload = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const filePath = payload && payload.tool_input && payload.tool_input.file_path;
if (!filePath || !filePath.endsWith('.js')) {
  process.exit(0);
}

const cwd = payload.cwd || process.cwd();
const hasEslintConfig = ['eslint.config.js', '.eslintrc.json', '.eslintrc.js']
  .some((f) => fs.existsSync(path.join(cwd, f)));

if (!hasEslintConfig) {
  process.exit(0);
}

let output = '';
try {
  output = execFileSync('npx', ['eslint', '--no-color', filePath], {
    cwd,
    stdio: 'pipe',
    shell: true, // npx is a shell shim on Windows; shell:true resolves it on every platform
  }).toString();
} catch (err) {
  // eslint exits non-zero when it finds errors (as opposed to warnings);
  // either way, the output itself is what we want to surface.
  output = (err.stdout || '').toString();
}

if (output.trim()) {
  console.error(`[code-quality] eslint flagged issues in ${path.relative(cwd, filePath)}:\n${output.trim()}`);
}

process.exit(0);
