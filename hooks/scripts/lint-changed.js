#!/usr/bin/env node
// PostToolUse hook: after Claude writes or edits a file under course-api/,
// lint just that file and surface any errors back to Claude immediately.

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0); // nothing to do without a parseable payload
  }

  const filePath = payload && payload.tool_input && payload.tool_input.file_path;
  if (!filePath || !filePath.endsWith('.js')) process.exit(0);

  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.join(__dirname, '..', '..');
  const apiRoot = path.join(pluginRoot, 'course-api');
  const resolved = path.resolve(filePath);

  if (!resolved.startsWith(path.resolve(apiRoot) + path.sep)) process.exit(0); // outside course-api/

  // Invoke eslint's JS entrypoint directly with `node` rather than the .bin shim —
  // spawning a .cmd shim without a shell fails on Windows (EINVAL).
  const eslintEntry = path.join(apiRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!fs.existsSync(eslintEntry)) process.exit(0); // not installed yet

  const result = spawnSync(process.execPath, [eslintEntry, resolved], { cwd: apiRoot, encoding: 'utf8' });

  if (result.error || result.status !== 0) {
    process.stderr.write(`eslint found issues in ${path.relative(apiRoot, resolved)}:\n${result.stdout || ''}${result.stderr || ''}${result.error || ''}`);
    process.exit(2); // surfaces stderr back to Claude as feedback
  }
  process.exit(0);
});
