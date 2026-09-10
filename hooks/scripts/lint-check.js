#!/usr/bin/env node
// PostToolUse hook: after an Edit/Write inside course-api, lint the touched
// file and surface any problems. Advisory only — never blocks the edit.

const { spawnSync } = require('child_process');
const path = require('path');

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
  if (!filePath || !filePath.endsWith('.js') || !filePath.includes('course-api')) {
    process.exit(0);
  }

  const courseApiRoot = filePath.slice(0, filePath.indexOf('course-api') + 'course-api'.length);
  const relativeFile = path.relative(courseApiRoot, filePath);

  const result = spawnSync('npx', ['eslint', relativeFile], {
    cwd: courseApiRoot,
    encoding: 'utf8',
    shell: true,
  });

  // eslint exits 0 even when it reports warnings (only errors force non-zero),
  // so check for output rather than relying on the exit code.
  if (result.stdout && result.stdout.trim()) {
    console.error(`[api-conventions] eslint found issues in ${relativeFile}:\n${result.stdout}`);
  }
  process.exit(0);
});
