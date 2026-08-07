#!/usr/bin/env node
// PostToolUse hook: after an Edit/Write, lint course-api if the changed file lives inside it.
const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

let payload = '';
process.stdin.on('data', (chunk) => { payload += chunk; });
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const input = JSON.parse(payload || '{}');
    filePath = input.tool_input?.file_path || '';
  } catch {
    // No/invalid payload — nothing to lint against, exit quietly.
    process.exit(0);
  }

  const apiDir = path.join(__dirname, '..', '..', 'course-api');
  if (!filePath.replace(/\\/g, '/').includes('/course-api/') || !fs.existsSync(apiDir)) {
    process.exit(0);
  }

  try {
    execSync('npm run lint', { cwd: apiDir, stdio: 'inherit' });
  } catch {
    console.error('lint-changed hook: eslint reported issues in course-api (see above).');
  }
  process.exit(0);
});
