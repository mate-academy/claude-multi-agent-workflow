#!/usr/bin/env node
// PostToolUse hook: auto-fix lint/formatting issues on any .js file just
// edited or written, using whatever ESLint config is closest to that file.

const { execSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const file = payload?.tool_input?.file_path;
  if (!file || !file.endsWith('.js')) {
    process.exit(0);
  }

  try {
    execSync(`npx eslint --fix "${file}"`, { stdio: 'inherit' });
  } catch {
    // eslint exits non-zero when violations remain after --fix; that's fine,
    // this hook only auto-fixes what it can and shouldn't block the edit.
  }
});
