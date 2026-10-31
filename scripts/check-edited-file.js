#!/usr/bin/env node
// PostToolUse hook helper: a fast syntax check on the file Claude just edited.
// Reads the hook payload from stdin. Never runs the test suite.
// Exit 0 = fine (or nothing to check). Exit 2 = report the problem back to Claude.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    const payload = JSON.parse(input);
    file = payload.tool_input && payload.tool_input.file_path;
  } catch {
    process.exit(0); // unreadable payload: do nothing
  }
  if (!file || !fs.existsSync(file)) process.exit(0);

  const ext = path.extname(file).toLowerCase();
  let problem = null;

  if (['.js', '.cjs', '.mjs'].includes(ext)) {
    const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (r.status !== 0) problem = (r.stderr || r.stdout || 'syntax error').trim();
  } else if (ext === '.json') {
    try {
      JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      problem = e.message;
    }
  }

  if (problem) {
    console.error(`Syntax check failed for ${file}:\n${problem}`);
    process.exit(2);
  }
  process.exit(0);
});
