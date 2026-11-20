#!/usr/bin/env node
// PostToolUse hook: syntax-check any .js/.cjs/.mjs file Claude just wrote or edited.
// Exit 0 = fine (or not a JS file). Exit 2 = syntax error; stderr is shown to Claude so it fixes it.
const { spawnSync } = require('child_process');
const fs = require('fs');

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw || '{}'); } catch { process.exit(0); }

  const file = input?.tool_input?.file_path;
  if (!file || !/\.(c|m)?js$/i.test(file) || !fs.existsSync(file)) process.exit(0);

  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status === 0) process.exit(0);

  process.stderr.write(`[quality-flow] Syntax error in ${file}:\n${result.stderr || result.stdout}`);
  process.exit(2);
});
