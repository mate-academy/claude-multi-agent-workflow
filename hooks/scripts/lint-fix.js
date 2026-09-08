#!/usr/bin/env node
// PostToolUse hook: after Write/Edit, auto-fix the touched file with ESLint
// if it's a JS file inside course-api. Never blocks the tool result.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

let payload;
try {
  payload = JSON.parse(readStdin() || '{}');
} catch {
  process.exit(0);
}

const filePath =
  payload?.tool_input?.file_path ||
  payload?.tool_response?.filePath ||
  '';

if (!filePath || !filePath.endsWith('.js')) {
  process.exit(0);
}

const apiRoot = path.join(__dirname, '..', '..', 'course-api');
const resolved = path.resolve(filePath);

if (!resolved.startsWith(path.resolve(apiRoot) + path.sep)) {
  process.exit(0);
}

try {
  execFileSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['eslint', '--fix', resolved],
    { cwd: apiRoot, stdio: 'inherit' }
  );
} catch {
  // Lint errors that --fix can't auto-resolve shouldn't block the hook.
}

process.exit(0);
