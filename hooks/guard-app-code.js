#!/usr/bin/env node
// api-quality-kit PreToolUse guard.
//
// Blocks Write and Edit calls whose file_path resolves inside the application
// code of course-api (routes/, db/, server.js). Everything else is allowed,
// including course-api/tests/.
//
// Scope, stated plainly: this hook inspects only the Write and Edit tools. It
// does not see shell redirects (echo > file), MultiEdit, NotebookEdit or other
// ways of writing files, so it is a guard against accidental edits, not a
// security boundary.
//
// The protected location is resolved from the session's working directory
// (input.cwd), not from the plugin install location. Accepted layouts:
//   - session cwd is the project root   -> <cwd>/course-api
//   - session cwd is course-api itself  -> <cwd>
//
// Exit codes: 2 = block (stderr is shown to Claude), 0 = allow.
// Fail-open: input that cannot be parsed is allowed, and the marker records it.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const MARKER = path.join(os.tmpdir(), 'api-quality-kit-guard.log');
const PROTECTED_DIRS = ['routes', 'db'];
const PROTECTED_FILES = ['server.js'];

function mark(line) {
  try {
    fs.appendFileSync(MARKER, `${new Date().toISOString()} ${line}\n`);
  } catch (_) {
    // The marker is diagnostic only; it must never change the decision.
  }
}

// Case-insensitive comparison on Windows, where the file system ignores case.
const norm = (p) => (process.platform === 'win32' ? p.toLowerCase() : p);

function apiRootCandidates(cwd) {
  const candidates = [path.join(cwd, 'course-api')];
  if (path.basename(cwd).toLowerCase() === 'course-api') candidates.unshift(cwd);
  return candidates;
}

function isProtected(target, apiRoot) {
  const t = norm(target);
  for (const dir of PROTECTED_DIRS) {
    if (t.startsWith(norm(path.join(apiRoot, dir)) + path.sep)) return true;
  }
  return PROTECTED_FILES.some((file) => t === norm(path.join(apiRoot, file)));
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch (_) {
    mark('allow: unreadable hook input (fail-open)');
    process.exit(0);
  }

  const tool = input.tool_name;
  const filePath = input.tool_input && input.tool_input.file_path;
  if ((tool !== 'Write' && tool !== 'Edit') || typeof filePath !== 'string' || filePath === '') {
    process.exit(0);
  }

  const cwd = typeof input.cwd === 'string' && input.cwd ? input.cwd : process.cwd();
  const target = path.resolve(cwd, filePath);
  const hit = apiRootCandidates(cwd).find((apiRoot) => isProtected(target, apiRoot));

  if (!hit) {
    mark(`allow ${tool} ${target}`);
    process.exit(0);
  }

  mark(`BLOCK ${tool} ${target}`);
  process.stderr.write(
    `api-quality-kit: blocked ${tool} to course-api application code (${path.relative(cwd, target)}). ` +
      'This workflow may change only course-api/tests/. Ask the user before editing application code.\n'
  );
  process.exit(2);
});
