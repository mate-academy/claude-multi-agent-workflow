#!/usr/bin/env node
// PostToolUse hook: after Claude writes or edits a JavaScript file, check it
// for syntax errors with `node --check`. It never changes the file.
// Claude Code passes the tool call as JSON on stdin; the path is in tool_input.file_path.
// Exit 2 shows stderr to Claude so it can fix the error. Exit 0 means all is well.

const { spawnSync } = require('child_process');
const fs = require('fs');

const JS_FILE = /\.(c|m)?js$/i;

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const input = JSON.parse(raw);
    const toolInput = (input && input.tool_input) || {};
    filePath = typeof toolInput.file_path === 'string' ? toolInput.file_path : '';
  } catch {
    process.exit(0);
  }

  if (!filePath || !JS_FILE.test(filePath) || /node_modules/.test(filePath) || !fs.existsSync(filePath)) {
    process.exit(0);
  }

  const result = spawnSync(process.execPath, ['--check', filePath], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write('Syntax check failed for ' + filePath + ':\n' + (result.stderr || '') + '\n');
    process.exit(2);
  }
  process.exit(0);
});
