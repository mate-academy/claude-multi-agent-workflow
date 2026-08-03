#!/usr/bin/env node
// PostToolUse hook: after an Edit/Write on a course-api/*.js file, run eslint on it
// and surface any warnings without blocking the edit.

let data = '';
process.stdin.on('data', (chunk) => { data += chunk; });
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(data);
  } catch {
    process.exit(0);
  }

  const filePath = input.tool_input && input.tool_input.file_path;
  const marker = 'course-api';
  if (!filePath || !filePath.endsWith('.js') || !filePath.includes(marker)) {
    process.exit(0);
  }

  const apiDir = filePath.slice(0, filePath.indexOf(marker) + marker.length);

  const { execFileSync } = require('child_process');
  try {
    const out = execFileSync('npx', ['eslint', filePath], { cwd: apiDir, encoding: 'utf8' });
    if (out.trim()) {
      console.error(`[code-quality-kit] eslint warnings for ${filePath}:\n${out}`);
    }
  } catch (err) {
    if (err.stdout) {
      console.error(`[code-quality-kit] eslint findings for ${filePath}:\n${err.stdout}`);
    }
  }

  process.exit(0);
});
