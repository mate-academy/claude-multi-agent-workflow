#!/usr/bin/env node
// PostToolUse hook: after Claude writes or edits a .js file inside
// course-api/, auto-fix it with that project's own eslint config, so
// every change this plugin's agents (or the user) make stays formatted
// consistently without anyone remembering to run lint by hand.
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    return;
  }

  const file = payload.tool_input && payload.tool_input.file_path;
  if (!file || !file.endsWith('.js')) return;

  // Only lint files inside course-api/ — that's the only JS project here.
  const marker = `${path.sep}course-api${path.sep}`;
  const idx = file.indexOf(marker);
  if (idx === -1) return;
  const courseApiRoot = file.slice(0, idx + marker.length - 1);
  if (!fs.existsSync(path.join(courseApiRoot, 'package.json'))) return;

  try {
    execFileSync('npx', ['eslint', '--fix', file], {
      stdio: 'inherit',
      cwd: courseApiRoot,
    });
  } catch {
    // eslint --fix exits non-zero when unfixable errors remain — that's
    // fine, the hook's job is only to auto-fix what it can.
  }
});
