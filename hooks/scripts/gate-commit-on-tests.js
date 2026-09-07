#!/usr/bin/env node
// PreToolUse hook: fires before any Bash tool call. If the command looks like
// a `git commit`, run course-api's test suite right then and block the
// commit (exit 2) if it fails — a deterministic, automatic gate that doesn't
// depend on remembering to run /code-quality-check by hand. Anything that
// isn't a git-commit command, and any commit attempt while tests pass, is
// let through untouched (exit 0).

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }

  const command = payload.tool_input && payload.tool_input.command;
  if (!command || !/\bgit\s+commit\b/.test(command)) {
    process.exit(0);
  }

  const cwd = process.cwd();
  // Identify course-api specifically (package.json + db/store.js), not just any
  // project with a package.json — otherwise this would run `npm test` before
  // every git commit in unrelated repos once the plugin is installed globally.
  const isCourseApiDir = (dir) =>
    fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, 'db', 'store.js'));

  let apiDir = null;
  if (isCourseApiDir(path.join(cwd, 'course-api'))) {
    apiDir = path.join(cwd, 'course-api');
  } else if (isCourseApiDir(cwd)) {
    apiDir = cwd;
  } else {
    // Not a course-api checkout — don't block a commit over a check we can't run.
    process.exit(0);
  }

  try {
    execSync('npm test', { cwd: apiDir, stdio: 'pipe' });
    process.exit(0);
  } catch (err) {
    const output = (err.stdout || '').toString() + (err.stderr || '').toString();
    console.error(
      '[code-quality] Blocking commit: `npm test` fails in course-api.\n' +
      'Fix the failing tests (the fix-and-cover subagent or /code-quality-check can help) before committing.\n\n' +
      output.slice(-2000)
    );
    process.exit(2);
  }
});