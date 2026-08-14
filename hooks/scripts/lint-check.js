#!/usr/bin/env node
'use strict';

// PostToolUse hook for quality-guard: after Claude edits or writes a JS file,
// run ESLint on it (using whatever eslint config lives nearest to that file,
// e.g. course-api/eslint.config.js) and hand any findings back to Claude.
//
// Non-JS files, and files where no eslint config/install can be found, are
// skipped silently rather than failing the hook.

const { execFileSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }

  const filePath = payload && payload.tool_input && payload.tool_input.file_path;
  if (!filePath || !/\.(js|jsx|ts|tsx)$/.test(filePath)) {
    process.exit(0);
  }

  try {
    execFileSync('npx', ['--no-install', 'eslint', '--no-color', filePath], {
      cwd: path.dirname(filePath),
      stdio: 'pipe',
      encoding: 'utf8',
    });
    process.exit(0);
  } catch (err) {
    // err.status undefined means npx/eslint itself couldn't run (not
    // installed here) — stay quiet rather than blocking the edit.
    if (typeof err.status !== 'number') {
      process.exit(0);
    }
    const output = (err.stdout || '') + (err.stderr || '');
    if (output.trim()) {
      // Exit code 2 on PostToolUse surfaces this output back to Claude
      // (the edit already happened; this is feedback, not a block).
      process.stderr.write('quality-guard lint check found issues:\n' + output + '\n');
      process.exit(2);
    }
    process.exit(0);
  }
});
