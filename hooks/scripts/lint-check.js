#!/usr/bin/env node
// PostToolUse hook: after Edit/Write, lint the touched file if it belongs to course-api.
const { spawnSync } = require('child_process');
const path = require('path');

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw || '{}');
  } catch {
    process.exit(0);
  }

  const filePath = input?.tool_input?.file_path;
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const normalized = filePath.split(path.sep).join('/');
  const marker = 'course-api/';
  const idx = normalized.indexOf(marker);
  if (idx === -1) process.exit(0);

  const cwd = path.resolve(process.cwd(), normalized.slice(0, idx + marker.length));
  const relative = normalized.slice(idx + marker.length);

  const result = spawnSync('npx', ['eslint', relative], { cwd, shell: true, encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(`[code-quality] eslint found issues in ${relative}:\n${result.stdout || result.stderr}`);
  }
  process.exit(0);
});
