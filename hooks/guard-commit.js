#!/usr/bin/env node
// PreToolUse hook: block `git commit` if the API's test suite is currently red.
// A change that breaks the tests should never reach a commit, let alone a PR.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const command = payload?.tool_input?.command || '';
  if (!/\bgit\s+commit\b/.test(command)) process.exit(0);

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  // The API this plugin ships with lives at course-api/; fall back to the
  // project root itself so the hook still works once installed elsewhere.
  const apiDir = fs.existsSync(path.join(projectDir, 'course-api', 'package.json'))
    ? path.join(projectDir, 'course-api')
    : projectDir;
  if (!fs.existsSync(path.join(apiDir, 'package.json'))) process.exit(0);

  try {
    execFileSync('npm', ['test', '--silent'], { cwd: apiDir, stdio: 'pipe' });
  } catch (err) {
    process.stderr.write(
      'Blocked: `npm test` is failing in ' + apiDir + ', so this commit was not allowed.\n' +
      'Fix the failing test(s) before committing.\n\n' +
      (err.stdout ? err.stdout.toString() : '')
    );
    process.exit(2); // exit 2 blocks the tool call and shows stderr to Claude
  }
  process.exit(0);
});
