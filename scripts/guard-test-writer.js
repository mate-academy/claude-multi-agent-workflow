#!/usr/bin/env node
// PreToolUse hook: hold the test-writer subagent to its limits.
//
// - Bash: only `npm test` / `npm run test` (with optional args), `git diff`
//   and `git status`, with no pipes, redirects, chaining or substitution.
// - Write/Edit: only test files inside the project.
//
// Exit 0 → allow (or not the test-writer). Exit 2 → block; stderr tells the
// agent why and what it may do instead. Every other agent, and the main
// session, pass straight through.

const path = require('node:path');
const fs = require('node:fs');

const EDIT_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const SHELL_METACHARS = /[|;&<>`$\\\n\r]/;
const TEST_FILE = /\.(test|spec)\.[cm]?[jt]sx?$/;
const TEST_DIRS = new Set(['test', 'tests', '__tests__']);

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

function deny(reason) {
  process.stderr.write(`Blocked by code-quality plugin (test-writer limits): ${reason}\n`);
  process.exit(2);
}

function checkBash(command) {
  const cmd = (command || '').trim();
  if (SHELL_METACHARS.test(cmd)) {
    deny(
      `"${cmd}" uses shell operators (pipes, redirects, chaining, variables). ` +
        'Run `npm test` on its own and read its full output.',
    );
  }
  const [bin, sub, next, ...rest] = cmd.split(/\s+/);
  const isNpmTest = bin === 'npm' && (sub === 'test' || (sub === 'run' && next === 'test'));
  const gitArgs = [next, ...rest].filter(Boolean);
  const isReadOnlyGit =
    bin === 'git' &&
    (sub === 'diff' || sub === 'status') &&
    !gitArgs.some((a) => a.startsWith('--output') || a === '--ext-diff');
  if (!isNpmTest && !isReadOnlyGit) {
    deny(`"${cmd}" isn't allowed. The only permitted commands are \`npm test\`, \`git diff\` and \`git status\`.`);
  }
}

function checkEdit(filePath, cwd) {
  if (!filePath) deny('the edit has no file path.');
  const resolved = path.resolve(cwd, filePath);
  const relative = path.relative(cwd, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    deny(`${filePath} is outside the project. Only test files inside the project may be written.`);
  }
  const inTestDir = relative.split(path.sep).slice(0, -1).some((seg) => TEST_DIRS.has(seg));
  if (!inTestDir && !TEST_FILE.test(resolved)) {
    deny(
      `${relative} isn't a test file. test-writer only changes files under tests/ or named *.test.js; ` +
        'report suspected application bugs instead of fixing them.',
    );
  }
}

const input = readInput();
const agent = (input?.agent_type || '').split(':').pop();
if (agent !== 'test-writer') process.exit(0);

if (input.tool_name === 'Bash') checkBash(input.tool_input?.command);
else if (EDIT_TOOLS.has(input.tool_name)) checkEdit(input.tool_input?.file_path || input.tool_input?.notebook_path, input.cwd || process.cwd());

process.exit(0);
