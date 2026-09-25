#!/usr/bin/env node
// PostToolUse hook: after an Edit/Write, lint the touched file if it's JS
// inside course-api/. Never blocks the tool call — it only surfaces warnings.

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const apiRoot = findUp(path.dirname(filePath), 'package.json');
  if (!apiRoot) process.exit(0);

  const result = spawnSync('npx', ['eslint', filePath], {
    cwd: apiRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0 && (result.stdout || result.stderr)) {
    process.stderr.write('[code-quality hook] eslint findings for ' + filePath + ':\n');
    process.stderr.write(result.stdout || result.stderr);
  }

  process.exit(0);
});

function findUp(startDir, fileName) {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, fileName))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}
