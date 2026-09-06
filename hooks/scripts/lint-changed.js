#!/usr/bin/env node
// PostToolUse hook: after Write/Edit, lint the touched file if it's part of course-api.
// Never blocks the tool result — it only surfaces lint feedback for Claude to see.

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

let input = {};
try {
  const raw = readStdin().replace(/^﻿/, '');
  input = JSON.parse(raw || '{}');
} catch {
  input = {};
}

const rawPath = input?.tool_input?.file_path || input?.tool_input?.path;
if (!rawPath || !rawPath.endsWith('.js')) {
  process.exit(0);
}

const apiRoot = path.join(__dirname, '..', '..', 'course-api');
const absFilePath = path.resolve(input?.cwd || process.cwd(), rawPath);
const relToApi = path.relative(apiRoot, absFilePath);

if (!fs.existsSync(apiRoot) || relToApi.startsWith('..') || path.isAbsolute(relToApi)) {
  // Not a file inside course-api — nothing for this hook to lint.
  process.exit(0);
}

const result = spawnSync('npx', ['eslint', '--no-color', relToApi], {
  cwd: apiRoot,
  encoding: 'utf8',
  shell: process.platform === 'win32',
});

if (result.error) {
  // eslint not installed yet (e.g. `npm install` hasn't run) — don't fail the hook for that.
  process.exit(0);
}

if (result.stdout && result.stdout.trim()) {
  console.log(`[code-quality] eslint findings for ${rawPath}:\n${result.stdout.trim()}`);
}

process.exit(0);
