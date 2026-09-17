#!/usr/bin/env node
'use strict';

// PostToolUse hook: after Claude edits or writes a .js file inside course-api,
// lint just that file and surface any problems. Never blocks the tool call —
// it only adds context, so it always exits 0 (a non-zero exit here would
// report the *hook* as failed, not the lint result).

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const normalized = filePath.split(path.sep).join('/');
  const marker = 'course-api/';
  const idx = normalized.indexOf(marker);
  if (idx === -1) process.exit(0);

  const courseApiDir = normalized.slice(0, idx + marker.length);
  if (!fs.existsSync(path.join(courseApiDir, 'eslint.config.js'))) process.exit(0);

  const result = spawnSync('npx', ['--no-install', 'eslint', filePath], {
    cwd: courseApiDir,
    encoding: 'utf8',
  });

  // eslint exits 0 when a file has only warnings (no errors), so check for
  // output rather than exit status — a warnings-only result would otherwise
  // be silently dropped.
  const output = (result.stdout || result.stderr || '').trim();
  if (output) {
    console.error(`[quality-guard] eslint found issues in ${filePath}:\n${output}`);
  }

  process.exit(0);
});
