#!/usr/bin/env node
// PostToolUse hook: after Claude edits or writes a .js file under course-api/,
// auto-fix it with the project's ESLint config so the lint standard holds
// without anyone having to remember to run `npm run lint` by hand.
//
// Uses ESLint's Node API directly (rather than shelling out to `npx eslint`)
// so this works the same on Windows and POSIX shells without dealing with
// `.cmd` shim quirks.

const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', async () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    return;
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !filePath.endsWith('.js') || !filePath.includes('course-api')) {
    return;
  }

  const courseApiRoot = path.join(filePath.split('course-api')[0], 'course-api');

  let ESLint;
  try {
    const eslintEntry = require.resolve('eslint', { paths: [courseApiRoot] });
    ({ ESLint } = require(eslintEntry));
  } catch {
    return; // eslint isn't installed in course-api/ (e.g. before `npm install`) — nothing to do
  }

  try {
    const eslint = new ESLint({ cwd: courseApiRoot, fix: true });
    const results = await eslint.lintFiles([filePath]);
    await ESLint.outputFixes(results);

    for (const result of results) {
      for (const message of result.messages) {
        const level = message.severity === 2 ? 'error' : 'warning';
        console.log(`${filePath}:${message.line}:${message.column} ${level} ${message.message} (${message.ruleId})`);
      }
    }
  } catch (err) {
    console.error('lint-fix hook failed:', err.message);
  }
});
