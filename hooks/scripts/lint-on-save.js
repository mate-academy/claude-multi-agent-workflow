#!/usr/bin/env node
const { execSync } = require('child_process');

let payload = '';
process.stdin.on('data', (chunk) => { payload += chunk; });
process.stdin.on('end', () => {
  let data;
  try { data = JSON.parse(payload || '{}'); } catch { data = {}; }

  const filePath = data.tool_input && data.tool_input.file_path;
  const marker = 'course-api';
  if (!filePath || !filePath.endsWith('.js') || !filePath.includes(marker)) {
    process.exit(0);
  }

  const apiRoot = filePath.slice(0, filePath.indexOf(marker) + marker.length);

  try {
    execSync(`npx eslint "${filePath}"`, { cwd: apiRoot, stdio: 'inherit' });
  } catch {
    // eslint exits non-zero on lint findings; surface them but never block the edit.
  }
  process.exit(0);
});
