#!/usr/bin/env node
// PostToolUse hook: lint a course-api JS file right after it is written or edited.
//
// Reads the hook payload on stdin, and if the edited file is a .js file inside
// course-api/, runs that project's own ESLint over just that file.
//
// Exit codes:
//   0 — nothing to do, or the file is clean
//   2 — ESLint found problems; stderr goes back to Claude so it can fix them now
//
// Written in Node (not shell) so it behaves the same on Windows, macOS, and Linux.
// Invoked via ${CLAUDE_PLUGIN_ROOT} so it resolves wherever the plugin is installed.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Never let a hook crash the tool call that triggered it.
function bail() {
  process.exit(0);
}

let raw = '';
try {
  raw = fs.readFileSync(0, 'utf8');
} catch {
  bail();
}

// Strip a UTF-8 BOM before parsing. Some shells (PowerShell 5.1 piping to a native
// exe, most visibly) prepend one, and JSON.parse rejects it — which would make the
// hook silently no-op instead of linting.
const clean = raw.replace(/^﻿/, '').trim();

let payload;
try {
  payload = JSON.parse(clean || '{}');
} catch {
  bail();
}

const toolInput = payload.tool_input || {};
const filePath = toolInput.file_path || toolInput.filePath || '';
if (!filePath || !filePath.endsWith('.js')) bail();

const absolute = path.resolve(filePath);

// Locate the course-api root by walking up from the edited file, rather than assuming
// where the plugin sits relative to the project.
let apiRoot = null;
let dir = path.dirname(absolute);
while (true) {
  if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, 'eslint.config.js'))) {
    apiRoot = dir;
    break;
  }
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}
if (!apiRoot) bail();

// Call ESLint's JS entry point through the current Node binary: no shell involved, so
// paths containing spaces are safe.
const eslintEntry = path.join(apiRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!fs.existsSync(eslintEntry)) bail(); // deps not installed yet — stay quiet

const result = spawnSync(process.execPath, [eslintEntry, absolute], {
  cwd: apiRoot,
  encoding: 'utf8',
});

if (result.error || result.status === 0) bail();

const report = `${result.stdout || ''}${result.stderr || ''}`.trim();
if (!report) bail();

const relative = path.relative(apiRoot, absolute);
console.error(
  `ESLint found problems in ${relative} (the file you just changed):\n\n` +
    `${report}\n\n` +
    'Fix these before moving on — do not leave the file lint-dirty.'
);
process.exit(2);
