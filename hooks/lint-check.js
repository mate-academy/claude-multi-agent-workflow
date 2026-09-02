#!/usr/bin/env node
// PostToolUse hook: after Claude edits a .js file under course-api/, lint just
// that file and hand any errors back so Claude can fix them immediately.
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path;
  const cwd = payload?.cwd || process.cwd();
  if (!filePath || !filePath.endsWith('.js') || filePath.includes('node_modules')) {
    process.exit(0);
  }

  const apiRoot = path.join(cwd, 'course-api');
  if (!filePath.startsWith(apiRoot)) {
    process.exit(0);
  }

  const eslintBin = path.join(apiRoot, 'node_modules', '.bin', 'eslint');
  const result = spawnSync(eslintBin, [filePath], { cwd: apiRoot, encoding: 'utf8' });

  if (result.error || result.status === 0) {
    process.exit(0);
  }

  process.stderr.write(result.stdout || result.stderr || 'eslint reported errors.');
  process.exit(2);
});
