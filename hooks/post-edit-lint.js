#!/usr/bin/env node
// PostToolUse hook: after Edit/Write touches a file under course-api/, run
// eslint on it so lint errors surface immediately instead of at review time.
const { execFileSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let event;
  try {
    event = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = event?.tool_input?.file_path;
  if (!filePath || !filePath.includes('course-api')) {
    process.exit(0);
  }

  const repoRoot = path.resolve(__dirname, '..');
  const courseApiDir = path.join(repoRoot, 'course-api');

  try {
    execFileSync('npx', ['eslint', filePath], { cwd: courseApiDir, stdio: 'pipe' });
    process.exit(0);
  } catch (err) {
    // Exit 2 surfaces stderr back to Claude as feedback, without undoing the edit.
    process.stderr.write(err.stdout?.toString() || err.message);
    process.exit(2);
  }
});
