#!/usr/bin/env node
/*
 * PostToolUse hook: lint the file that Edit/Write/MultiEdit just touched.
 *
 * Fits the code-quality theme — every edit the agent makes is linted immediately,
 * so style and unused-var problems are caught in the same turn instead of at review time.
 *
 * Degrades quietly: if the file isn't JavaScript, isn't inside course-api, or the project's
 * ESLint isn't installed, the hook exits 0 and says nothing. It only speaks up on a real
 * lint failure, which it reports on stderr with exit code 2 so Claude sees it.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

const input = readInput();
const filePath =
  (input.tool_input && (input.tool_input.file_path || input.tool_input.path)) || '';

if (!filePath || !/\.(js|cjs|mjs)$/.test(filePath)) {
  process.exit(0);
}

// The plugin ships alongside the course API in this repo; lint files that live under it.
const apiRoot = path.resolve(__dirname, '..', 'course-api');
const abs = path.resolve(filePath);
if (!abs.startsWith(apiRoot + path.sep)) {
  process.exit(0);
}

const eslintBin = path.join(apiRoot, 'node_modules', '.bin', 'eslint');
if (!fs.existsSync(eslintBin)) {
  // Deps not installed — nothing we can do, don't nag.
  process.exit(0);
}

const result = spawnSync(eslintBin, [abs], {
  cwd: apiRoot,
  encoding: 'utf8',
});

if (result.status === 0) {
  process.exit(0);
}

const rel = path.relative(process.cwd(), abs);
const report = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
// exit 1 = lint findings; anything else = ESLint itself failed (bad config, crash).
const headline =
  result.status === 1 ? `ESLint found problems in ${rel}:` : `ESLint could not check ${rel}:`;
process.stderr.write(`${headline}\n${report}\n`);
process.exit(2);
